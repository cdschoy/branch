/**
 * Hardening (owner: scaffold): hostile / malformed gift links end on the friendly error screen (never a
 * white page or a frozen tab), the booth never leaks a camera stream, and the recipient route's
 * first-tap JS stays under its regression ceiling (§7.7; the 120 KB target is a known gap, README).
 */
import { readFileSync } from 'node:fs';
import { gzipSync, deflateRawSync } from 'node:zlib';
const fixture = JSON.parse(readFileSync(new URL('../src/gift-schema/fixtures/envelope-min.json', import.meta.url), 'utf8'));

const j = (gift) => 'j' + Buffer.from(JSON.stringify(gift)).toString('base64url');
const z = (gift) => 'z' + deflateRawSync(Buffer.from(JSON.stringify(gift))).toString('base64url');
const withPages = (pages) => ({ ...fixture, pages: [...fixture.pages, ...pages] });

/** Regression ceiling for the recipient route (KB gz of JS fetched before the first tap). */
const ROUTE_JS_CEILING_KB = 210;
const ROUTE_JS_TARGET_KB = 120;

async function expectError(t, param, label) {
  const page = await t.newPage();
  // React reports the error the boundary caught; that log is the expected outcome here.
  t.allowConsole(/Cannot read properties|Minified React error|Objects are not valid as a React child|The above error occurred/);
  await page.goto(t.baseURL + '#/g/' + param);
  await page.getByTestId('gift-error').waitFor({ timeout: 8000 });
  t.expect(await page.getByRole('alert').isVisible(), `${label}: friendly error shown`);
  await page.close();
}

export const timeout = 90000;
export const tests = {
  async deflateBomb(t) {
    const bomb = { ...fixture, pages: [{ ...fixture.pages[0], body: 'em '.repeat(3_000_000) }] };
    const param = z(bomb);
    t.expect(param.length < 40000, `bomb link is short (${param.length} chars)`);
    const t0 = Date.now();
    await expectError(t, param, 'deflate bomb');
    t.expect(Date.now() - t0 < 8000, 'bomb refused quickly');
  },
  async overLimits(t) {
    await expectError(t, j({ ...fixture, pages: [{ ...fixture.pages[0], body: 'em '.repeat(600) }] }), 'letter over 1200 graphemes');
    await expectError(t, j({ ...fixture, names: { ...fixture.names, to: 'B'.repeat(40) } }), 'name over 24 graphemes');
  },
  async malformedFields(t) {
    await expectError(t, j(withPages([{ kind: 'memories', photos: [{ ref: 'ph:1', caption: { a: 1 } }] }])), 'caption object');
    await expectError(t, j(withPages([{ kind: 'songs', tracks: [null] }])), 'null track');
    await expectError(t, j(withPages([{ kind: 'songs', tracks: [{ title: 'x', url: 'javascript:alert(1)' }] }])), 'javascript: song url');
    await expectError(t, j(withPages([{ kind: 'days', startDate: 'mai' }])), 'bad date');
  },
  async cameraLeak(t) {
    const page = await t.newPage();
    // Delay getUserMedia so the user leaves while it is still pending.
    await page.addInitScript(() => {
      const md = navigator.mediaDevices;
      const real = md.getUserMedia.bind(md);
      window.__streams = [];
      md.getUserMedia = (c) => new Promise((r) => setTimeout(r, 800)).then(() => real(c)).then((s) => { window.__streams.push(s); return s; });
    });
    await page.goto(t.baseURL + '#/booth');
    await page.getByTestId('booth-explainer').waitFor();
    await page.locator('[data-testid=booth-explainer] button').first().click();
    await page.waitForTimeout(200);
    await page.evaluate(() => { location.hash = '#/'; });
    await page.getByTestId('choose-gift').waitFor();
    await page.waitForTimeout(2000);
    const live = await page.evaluate(() => window.__streams.flatMap((s) => s.getTracks()).filter((tr) => tr.readyState !== 'ended').length);
    const made = await page.evaluate(() => window.__streams.length);
    t.log('streams', made, 'live tracks', live);
    t.expect(made >= 1 && live === 0, `no live camera track after leaving mid-request (made ${made}, live ${live})`);
  },
  async routeBudget(t) {
    const page = await t.newPage();
    const urls = new Set();
    page.on('request', (r) => { const u = new URL(r.url()); if (u.pathname.endsWith('.js')) urls.add(r.url()); });
    await page.goto(t.baseURL + '#/g/' + j(fixture));
    await page.getByTestId('gift-hero').waitFor();
    await page.waitForTimeout(1000);
    let total = 0;
    for (const u of urls) total += gzipSync(Buffer.from(await (await fetch(u)).arrayBuffer()), { level: 9 }).length;
    const kb = total / 1024;
    t.log(`recipient route JS before first tap: ${kb.toFixed(1)} KB gz in ${urls.size} files (target ${ROUTE_JS_TARGET_KB}, ceiling ${ROUTE_JS_CEILING_KB})`);
    t.expect(kb <= ROUTE_JS_CEILING_KB, `route JS ${kb.toFixed(1)} KB gz ≤ ceiling ${ROUTE_JS_CEILING_KB}`);
  },
};
