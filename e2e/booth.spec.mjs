/**
 * Booth e2e (owner: booth): fake camera → 4 captures (C3product) → review → print/toss → 600×1800 PNG;
 * quick cadence under reduced motion; in-app browser guidance + file-upload fallback.
 * Run: npm run e2e -- booth   (E2E_SHOTS=<dir> for screenshots)
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = process.env.E2E_SHOTS ?? 'test-results/e2e';

async function stripChecks(t, page, tag) {
  const img = page.getByTestId('booth-strip-img');
  await img.waitFor({ timeout: 15000 });
  await page.waitForFunction(() => { const i = document.querySelector('[data-testid="booth-strip-img"]'); return i && i.complete && i.naturalWidth > 0; });
  const dims = await page.evaluate(async () => {
    const i = document.querySelector('[data-testid="booth-strip-img"]');
    const c = document.querySelector('canvas[data-testid="booth-strip-canvas"]');
    const blob = await (await fetch(i.src)).blob();
    const bmp = await createImageBitmap(blob);
    const head = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
    return { img: [i.naturalWidth, i.naturalHeight], canvas: c ? [c.width, c.height] : null, png: [bmp.width, bmp.height], type: blob.type, sig: Array.from(head), src: i.src.slice(0, 5) };
  });
  t.log(tag, JSON.stringify(dims));
  t.expect(dims.img[0] === 600 && dims.img[1] === 1800, `strip <img> is 600×1800 (got ${dims.img})`);
  t.expect(dims.png[0] === 600 && dims.png[1] === 1800, `decoded PNG is 600×1800 (got ${dims.png})`);
  t.expect(dims.canvas && dims.canvas[0] === 600 && dims.canvas[1] === 1800, `strip canvas is 600×1800 (got ${dims.canvas})`);
  t.expect(dims.type === 'image/png' && dims.sig[0] === 0x89 && dims.sig[1] === 0x50, 'blob is a PNG');
  t.expect(dims.src === 'blob:', 'strip is a local blob: URL (no upload)');
}

async function savePng(page, name) {
  const b64 = await page.evaluate(async () => {
    const i = document.querySelector('[data-testid="booth-strip-img"]');
    const buf = new Uint8Array(await (await fetch(i.src)).arrayBuffer());
    let s = ''; for (let k = 0; k < buf.length; k++) s += String.fromCharCode(buf[k]);
    return btoa(s);
  });
  const p = join(SHOTS, `${name}.png`);
  writeFileSync(p, Buffer.from(b64, 'base64'));
  return p;
}

function trackRequests(page) {
  const urls = [];
  // static same-origin GETs (lazy fonts / chunks) are fine; anything else could carry a photo
  page.on('request', (r) => {
    const u = r.url();
    if (u.startsWith('blob:') || u.startsWith('data:')) return;
    if (r.method() !== 'GET' || !u.startsWith(new URL(page.url()).origin)) urls.push(`${r.method()} ${u}`);
  });
  return urls;
}

export const tests = {
  async boothFullCapture(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/booth');
    await page.getByTestId('booth-explainer').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await t.shot(page, 'booth-1-explainer');
    t.expect(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'no horizontal scroll (explainer)');

    const afterStart = trackRequests(page);
    await page.getByRole('button').first().click();
    await page.waitForFunction(() => { const v = document.querySelector('[data-testid="booth-video"]'); return v && v.videoWidth > 0; }, null, { timeout: 8000 });
    await page.getByTestId('booth-frames').getByRole('radio').nth(1).click(); // garden frame
    await page.getByTestId('booth-filters').getByRole('radio').nth(1).click(); // milk look
    await page.waitForTimeout(300);
    await t.shot(page, 'booth-2-ready');
    t.expect(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'no horizontal scroll (ready)');

    const t0 = Date.now();
    await page.getByTestId('booth-shutter').click();
    await page.locator('.ui-stamp__digit').first().waitFor({ timeout: 3000 });
    await t.shot(page, 'booth-3-countdown');
    // first flash at 3400 ms (C3product) → shot 1 lands in the tray
    await page.waitForFunction(() => document.querySelectorAll('.booth-tray img').length >= 1, null, { timeout: 6000 });
    const firstShotMs = Date.now() - t0;
    t.log('first shot after', firstShotMs, 'ms');
    t.expect(firstShotMs >= 3300, `first capture follows the 3-2-1 (C3product firstFlashMs 3400; got ${firstShotMs})`);
    await page.getByTestId('booth-review').waitFor({ timeout: 15000 });
    const total = Date.now() - t0;
    t.log('session done after', total, 'ms');
    t.expect(total >= 10500, `4 shots at the product tempo (~10.8 s; got ${total})`);
    t.expect(await page.locator('[data-testid^="booth-shot-"] img').count() === 4, '4 shots in review');
    await page.waitForTimeout(400);
    await t.shot(page, 'booth-4-review');

    // review: open one shot, keep it
    await page.getByTestId('booth-shot-1').click();
    await page.locator('.booth-lightbox').waitFor();
    await page.getByRole('button', { name: 'Giữ' }).click();
    await page.locator('.booth-lightbox').waitFor({ state: 'detached' });

    await page.getByTestId('booth-print').click();
    await page.waitForTimeout(450);
    await t.shot(page, 'booth-5-printing');
    await stripChecks(t, page, 'product');
    await page.waitForTimeout(500);
    await t.shot(page, 'booth-6-strip');
    t.log('strip png', await savePng(page, 'booth-strip-product'));

    // edit caption → recompose, then save (download)
    await page.getByTestId('booth-caption-input').fill('Đà Lạt mộng mơ');
    await page.waitForFunction(() => { const i = document.querySelector('[data-testid="booth-strip-img"]'); return i && i.complete; });
    await page.waitForTimeout(300);
    const [download] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.getByTestId('booth-save').click()]);
    t.expect(download.suggestedFilename().endsWith('.png'), 'download is a .png');
    await page.waitForFunction(() => document.querySelector('[data-testid="booth-save"]')?.textContent?.includes('Đã lưu'), null, { timeout: 3000 });
    await t.shot(page, 'booth-7-saved');
    t.log('strip png (caption)', await savePng(page, 'booth-strip-caption'));
    t.expect(afterStart.length === 0, `no uploads / cross-origin requests after the camera opened (got ${afterStart.join(', ')})`);
  },

  async boothQuickReduced(t) {
    const page = await t.newPage({ reducedMotion: 'reduce' });
    await page.goto(t.baseURL + '#/booth');
    await page.getByRole('button').first().click();
    await page.waitForFunction(() => { const v = document.querySelector('[data-testid="booth-video"]'); return v && v.videoWidth > 0; }, null, { timeout: 8000 });
    await page.getByTestId('booth-cadence').getByRole('radio').nth(1).click(); // quick (gift-booth cadence)
    const t0 = Date.now();
    await page.getByTestId('booth-shutter').click();
    await page.getByTestId('booth-review').waitFor({ timeout: 10000 });
    const ms = Date.now() - t0;
    t.log('quick session', ms, 'ms');
    t.expect(ms < 7000, `quick cadence finishes in ~4.3 s (got ${ms})`);
    await page.getByTestId('booth-print').click();
    await stripChecks(t, page, 'quick-reduced');
    await t.shot(page, 'booth-8-reduced-strip');
  },

  async boothInAppFallback(t) {
    const page = await t.newPage({ userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 Zalo android/12100' });
    await page.goto(t.baseURL + '#/booth');
    await page.getByTestId('booth-inapp').waitFor();
    t.expect((await page.getByTestId('booth-inapp').textContent()).includes('Zalo'), 'in-app sheet names Zalo');
    await page.evaluate(() => document.fonts.ready);
    await t.shot(page, 'booth-9-inapp');
    // generate 4 original placeholder photos in the page
    const files = await page.evaluate(async () => {
      const out = [];
      for (let i = 0; i < 4; i++) {
        const c = document.createElement('canvas'); c.width = 800; c.height = 600;
        const g = c.getContext('2d');
        g.fillStyle = `hsl(${i * 80 + 10} 60% 70%)`; g.fillRect(0, 0, 800, 600);
        g.fillStyle = `hsl(${i * 80 + 200} 50% 40%)`; g.beginPath(); g.arc(400, 330, 160, 0, Math.PI * 2); g.fill();
        out.push(c.toDataURL('image/png').split(',')[1]);
      }
      return out;
    });
    await page.getByTestId('booth-file-pick').setInputFiles(files.map((b, i) => ({ name: `p${i}.png`, mimeType: 'image/png', buffer: Buffer.from(b, 'base64') })));
    await page.getByTestId('booth-review').waitFor({ timeout: 8000 });
    await page.getByTestId('booth-print').click();
    await stripChecks(t, page, 'fallback');
    await page.waitForTimeout(500);
    await t.shot(page, 'booth-10-fallback-strip');
  },
};
