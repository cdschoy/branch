#!/usr/bin/env node
/**
 * E2E runner (owner: scaffold). Zero-dependency harness over the preinstalled `playwright` package.
 *
 *   npm run e2e                       build (if dist/ is missing) + preview + every e2e/*.spec.mjs
 *   npm run e2e -- smoke booth        only specs whose file name contains "smoke" or "booth"
 *   E2E_BUILD=1 npm run e2e           force a rebuild first
 *   E2E_SHOTS=/some/dir npm run e2e   screenshot directory (default test-results/e2e)
 *   E2E_BASE_URL=http://…             test an already-running server (skips build/preview)
 *
 * A spec is `export default async function (t) {}` or `export const tests = { name: async (t) => {} }`.
 * `t` = { browser, baseURL, newPage(opts), shot(page, name), expect(cond, msg), log }. newPage() gives a
 * 390×844 mobile page (Chromium, fake camera) that records console errors; the runner fails the test
 * if any were logged.
 */
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const filters = process.argv.slice(2);
const shotsDir = resolve(process.env.E2E_SHOTS ?? join(root, 'test-results/e2e'));
const PORT = Number(process.env.E2E_PORT ?? 4173);
mkdirSync(shotsDir, { recursive: true });

async function waitFor(url, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { const r = await fetch(url); if (r.ok) return; } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`server did not start: ${url}`);
}

let server = null;
let baseURL = process.env.E2E_BASE_URL;
if (!baseURL) {
  if (process.env.E2E_BUILD || !existsSync(join(root, 'dist/index.html'))) execSync('npm run build', { cwd: root, stdio: 'inherit' });
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' });
  baseURL = `http://localhost:${PORT}/`;
  await waitFor(baseURL);
}

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const specs = readdirSync(__dirnameE2E()).filter((f) => f.endsWith('.spec.mjs') && (!filters.length || filters.some((x) => f.includes(x)))).sort();
function __dirnameE2E() { return join(root, 'e2e'); }

let failed = 0, passed = 0;
for (const file of specs) {
  const mod = await import(pathToFileURL(join(root, 'e2e', file)).href);
  const tests = mod.tests ?? { [file.replace('.spec.mjs', '')]: mod.default };
  for (const [name, fn] of Object.entries(tests)) {
    const pages = [];
    const errors = [];
    const t = {
      browser, baseURL, log: (...a) => console.log('   ', ...a),
      async newPage(opts = {}) {
        const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: 'vi-VN', permissions: ['camera'], ...opts });
        const page = await ctx.newPage();
        page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
        page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
        pages.push(ctx);
        return page;
      },
      async shot(page, shotName) { const p = join(shotsDir, `${shotName}.png`); await page.screenshot({ path: p, fullPage: false }); t.log('shot', p); return p; },
      expect(cond, msg) { if (!cond) throw new Error(`expect failed: ${msg}`); },
    };
    const t0 = Date.now();
    try {
      await fn(t);
      if (errors.length) throw new Error(`console errors:\n  ${errors.join('\n  ')}`);
      passed++; console.log(`ok   ${file} › ${name} (${Date.now() - t0} ms)`);
    } catch (err) {
      failed++; console.log(`FAIL ${file} › ${name}\n     ${err?.stack ?? err}`);
    } finally {
      for (const c of pages) await c.close().catch(() => {});
    }
  }
}
await browser.close();
server?.kill();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
