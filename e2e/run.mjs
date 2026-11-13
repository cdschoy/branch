#!/usr/bin/env node
/**
 * E2E runner (owner: scaffold). Zero-dependency harness over the preinstalled `playwright` package.
 *
 *   npm run e2e                       build (if dist/ is missing) + preview + every e2e/*.spec.mjs
 *   npm run e2e -- smoke booth        only specs whose file name contains "smoke" or "booth"
 *   E2E_BUILD=1 npm run e2e           force a rebuild first
 *   E2E_SHOTS=/some/dir npm run e2e   screenshot directory (default test-results/e2e)
 *   E2E_BASE_URL=http://…             test an already-running server (skips build/preview)
 *   E2E_PORT=4292                     preview port (default: a free port is picked)
 *   E2E_TIMEOUT=120000                per-test timeout in ms (a spec may export `timeout` to raise it)
 *
 * A spec is `export default async function (t) {}` or `export const tests = { name: async (t) => {} }`.
 * `t` = { browser, baseURL, newPage(opts), shot(page, name), expect(cond, msg), log, allowConsole(re) }.
 * newPage() gives a 390×844 mobile page (Chromium, fake camera) that records console output.
 *
 * Exit code is non-zero when: any test throws or times out; any page logs a console error, an
 * uncaught exception, a console warning (unless allowed with t.allowConsole), or a same-origin request
 * fails / answers ≥ 400; a spec file fails to import; no spec matched the filters; or the preview
 * server fails to start.
 */
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const filters = process.argv.slice(2);
const shotsDir = resolve(process.env.E2E_SHOTS ?? join(root, 'test-results/e2e'));
const TEST_TIMEOUT = Number(process.env.E2E_TIMEOUT ?? 120000);
mkdirSync(shotsDir, { recursive: true });

/** Known-benign console noise from Chromium itself (not from the app). */
const BENIGN = [
  /GPU stall due to ReadPixels/i,
  /Automatic fallback to software WebGL/i,
];

function freePort() {
  return new Promise((res, rej) => {
    const s = createServer();
    s.unref();
    s.on('error', rej);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)); });
  });
}

let server = null;
let serverExited = null;
function stopServer() {
  if (!server || server.exitCode !== null) return;
  try { process.kill(-server.pid, 'SIGTERM'); } catch { try { server.kill('SIGTERM'); } catch { /* gone */ } }
}
process.on('exit', stopServer);
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { stopServer(); process.exit(130); });

async function waitFor(url, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (serverExited !== null) throw new Error(`preview server exited early (code ${serverExited})`);
    try { const r = await fetch(url); if (r.ok) return; } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`server did not start: ${url}`);
}

function withTimeout(p, ms, label) {
  let timer;
  return Promise.race([
    p.finally(() => clearTimeout(timer)),
    new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`timeout after ${ms} ms: ${label}`)), ms); }),
  ]);
}

let failed = 0, passed = 0;
let browser = null;
try {
  let baseURL = process.env.E2E_BASE_URL;
  if (!baseURL) {
    if (process.env.E2E_BUILD || !existsSync(join(root, 'dist/index.html'))) execSync('npm run build', { cwd: root, stdio: 'inherit' });
    const port = Number(process.env.E2E_PORT ?? (await freePort()));
    const vite = join(root, 'node_modules/vite/bin/vite.js');
    server = spawn(process.execPath, [vite, 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: 'ignore', detached: true });
    server.on('exit', (code) => { serverExited = code ?? -1; });
    baseURL = `http://127.0.0.1:${port}/`;
    await waitFor(baseURL);
  }
  const origin = new URL(baseURL).origin;

  browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const specs = readdirSync(join(root, 'e2e'))
    .filter((f) => f.endsWith('.spec.mjs') && (!filters.length || filters.some((x) => f.includes(x))))
    .sort();
  if (!specs.length) { failed++; console.log(`FAIL no spec matched filters: ${filters.join(' ')}`); }

  for (const file of specs) {
    let mod;
    try { mod = await import(pathToFileURL(join(root, 'e2e', file)).href); }
    catch (err) { failed++; console.log(`FAIL ${file} › import\n     ${err?.stack ?? err}`); continue; }
    const tests = mod.tests ?? (mod.default ? { [file.replace('.spec.mjs', '')]: mod.default } : {});
    if (!Object.keys(tests).length) { failed++; console.log(`FAIL ${file} › exports no tests`); continue; }
    for (const [name, fn] of Object.entries(tests)) {
      const contexts = [];
      const errors = [];
      const allowed = [...BENIGN];
      const t = {
        browser, baseURL, log: (...a) => console.log('   ', ...a),
        /** Allow a console warning/error matching `re` for this test only (use sparingly, with a reason). */
        allowConsole(re) { allowed.push(re); },
        async newPage(opts = {}) {
          const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: 'vi-VN', permissions: ['camera'], ...opts });
          const page = await ctx.newPage();
          page.on('console', (m) => {
            const type = m.type();
            if (type !== 'error' && type !== 'warning') return;
            const loc = m.location();
            errors.push({ text: `${name}: console.${type}: ${m.text()}${loc?.url ? ` (${loc.url}:${loc.lineNumber})` : ''}`, raw: m.text() });
          });
          page.on('pageerror', (e) => errors.push({ text: `${name}: uncaught: ${e.message}`, raw: e.message }));
          page.on('requestfailed', (r) => {
            if (!r.url().startsWith(origin)) return;
            const why = r.failure()?.errorText ?? '';
            if (/ERR_ABORTED/.test(why)) return; // navigation / media cancels
            errors.push({ text: `${name}: request failed: ${r.url()} ${why}`, raw: r.url() });
          });
          page.on('response', (r) => {
            if (r.url().startsWith(origin) && r.status() >= 400) errors.push({ text: `${name}: HTTP ${r.status()} ${r.url()}`, raw: r.url() });
          });
          contexts.push(ctx);
          return page;
        },
        async shot(page, shotName) { const p = join(shotsDir, `${shotName}.png`); await page.screenshot({ path: p, fullPage: false }); t.log('shot', p); return p; },
        expect(cond, msg) { if (!cond) throw new Error(`expect failed: ${msg}`); },
      };
      const t0 = Date.now();
      try {
        await withTimeout(Promise.resolve().then(() => fn(t)), Number(mod.timeout ?? TEST_TIMEOUT), `${file} › ${name}`);
        const bad = errors.filter((e) => !allowed.some((re) => re.test(e.raw)));
        if (bad.length) throw new Error(`console errors/warnings:\n  ${bad.map((e) => e.text).join('\n  ')}`);
        passed++; console.log(`ok   ${file} › ${name} (${Date.now() - t0} ms)`);
      } catch (err) {
        failed++; console.log(`FAIL ${file} › ${name}\n     ${err?.stack ?? err}`);
      } finally {
        for (const c of contexts) await c.close().catch(() => {});
      }
    }
  }
} catch (err) {
  failed++;
  console.log(`FAIL runner\n     ${err?.stack ?? err}`);
} finally {
  await browser?.close().catch(() => {});
  stopServer();
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
