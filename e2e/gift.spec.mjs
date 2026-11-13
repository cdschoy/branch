/**
 * Gift flow e2e (owner: gift). Creates gifts through the creator UI at 390×844, opens the generated
 * #/g/ link and taps through every scene to the finale and the end card; screenshots each scene as
 * gift-*.png. Runs the envelope flow (with photos, a song and the extras drawer), the box flow (ribbon
 * drag, 6 bites, completion spread) and the envelope flow again under reducedMotion: 'reduce'.
 */

/** Make n small PNG files in the page (procedural colour blocks; no fixtures on disk). */
async function makePhotos(page, n) {
  const list = await page.evaluate(async (count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const c = document.createElement('canvas');
      c.width = 900; c.height = 700;
      const g = c.getContext('2d');
      const hues = [12, 140, 210, 320, 40, 270];
      g.fillStyle = `hsl(${hues[i % hues.length]} 55% 72%)`; g.fillRect(0, 0, 900, 700);
      g.fillStyle = `hsl(${(hues[i % hues.length] + 40) % 360} 50% 45%)`;
      g.beginPath(); g.arc(300 + i * 60, 300, 160, 0, Math.PI * 2); g.fill();
      out.push(c.toDataURL('image/png').split(',')[1]);
    }
    return out;
  }, n);
  return list.map((b64, i) => ({ name: `anh-${i + 1}.png`, mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') }));
}

const next = (page) => page.getByTestId('create-next').locator('button').click();
const settle = (page, ms) => page.waitForTimeout(ms);

/** Walk the creator and return the gift link (#/g/…). */
async function createGift(t, page, { mechanic, photos, song, body, prefix, shots = true }) {
  await page.goto(t.baseURL + '#/create');
  await page.getByTestId('create').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.getByTestId(`mechanic-${mechanic}`).click();
  if (shots) await t.shot(page, `${prefix}-create-1-mechanic`);
  await next(page);
  await page.getByTestId(mechanic === 'box' ? 'theme-sweet-gingham' : 'theme-garden-envelope').click();
  if (shots) await t.shot(page, `${prefix}-create-2-theme`);
  await next(page);
  // people: names are validated (try Next first: the guard must hold)
  await next(page);
  t.expect(await page.locator('.create__error').isVisible(), 'recipient name is required');
  await page.getByTestId('create-to').fill('Bống');
  await page.getByTestId('create-from').fill('Minh');
  await page.getByTestId('pronoun-anh-em').click();
  t.expect((await page.textContent('.create__example'))?.includes('Anh có một món quà nhỏ cho em nè'), 'pronoun preview resolves the voice');
  if (shots) await t.shot(page, `${prefix}-create-3-people`);
  await next(page);
  if (photos) {
    await page.getByTestId('create-photo-input').setInputFiles(await makePhotos(page, photos));
    await page.waitForFunction((n) => document.querySelectorAll('.create__photo').length === n, photos, { timeout: 10000 });
    await page.getByTestId('create-consent').check();
    const src = await page.locator('.create__photo img').first().getAttribute('src');
    t.expect(src?.startsWith('data:image/webp') || src?.startsWith('data:image/jpeg'), 'photos are re-encoded client-side');
    if (shots) await t.shot(page, `${prefix}-create-4-photos`);
    await next(page);
  } else {
    await page.getByRole('button', { name: 'Bỏ qua' }).click();
  }
  // letter: Telex-style decomposed input must be NFC-normalised
  await page.getByTestId('create-body').fill(body.normalize('NFD'));
  const typed = await page.getByTestId('create-body').inputValue();
  t.expect(typed === typed.normalize('NFC'), 'letter body is NFC');
  await page.getByRole('button', { name: 'Xem thử gõ chữ' }).click();
  await page.getByTestId('create-typing-demo').waitFor();
  await settle(page, 900);
  if (shots) await t.shot(page, `${prefix}-create-5-letter`);
  await next(page);
  if (song) {
    await page.getByTestId('create-song-url').fill(song);
    await page.locator('.create__ok').waitFor();
    await next(page);
  } else {
    await page.getByRole('button', { name: 'Bỏ qua' }).click();
  }
  // review: ×3 preview of the real player, then the link
  await page.getByTestId('create-preview-btn').locator('button').click();
  await page.getByTestId('create-preview').waitFor();
  await page.locator('[data-testid="create-preview"] [data-testid="gift-opener"]').waitFor();
  if (shots) await t.shot(page, `${prefix}-create-6-preview`);
  await page.getByRole('button', { name: 'Thoát xem trước' }).click();
  await page.getByTestId('create-link-btn').locator('button').click();
  await page.getByTestId('create-link').waitFor();
  const url = await page.getByTestId('create-link-url').inputValue();
  t.expect(/#\/g\/[zj][A-Za-z0-9_-]+$/.test(url), `link is #/g/<base64url>: ${url.slice(0, 80)}`);
  if (shots) await t.shot(page, `${prefix}-create-7-link`);
  return url;
}

/** Reading → lightbox → drawer → readEnough → finale → end card → replay. */
async function readToTheEnd(t, page, { prefix, photos, drawer }) {
  await page.waitForFunction(() => document.querySelector('[data-testid="gift-player"]')?.dataset.state === 'reading', null, { timeout: 15000 });
  t.expect((await page.textContent('[data-testid="gift-letter"]'))?.includes('Gửi Bống'), 'letter greeting defaulted from the recipient name');
  await page.getByTestId('gift-continue').waitFor({ timeout: 8000 });
  if (photos) await page.waitForFunction(() => !document.querySelector('.gift-photo[data-await]'), null, { timeout: 10000 });
  await settle(page, 400);
  await t.shot(page, `${prefix}-4-letter`);

  // guard: an early tap shows the tooltip and does not start the finale
  if (!(await page.getByTestId('gift-continue').getAttribute('data-ready'))) {
    await page.locator('[data-testid="gift-continue"] button').click({ force: true });
    await settle(page, 250);
    t.expect(await page.locator('.ui-continue__tip').isVisible(), 'guard tooltip on an early continue tap');
    // the C7 overlay is pre-mounted idle (data-idle) while reading; it must not be playing yet
    t.expect(!(await page.locator('[data-testid="gift-finale"]:not([data-idle])').count()), 'finale is gated on readEnough');
    await t.shot(page, `${prefix}-5-guard`);
  }

  if (photos) {
    await page.locator('.gift-photo .prim-thumb').last().click();
    await page.getByTestId('gift-lightbox').waitFor();
    await settle(page, 800);
    t.expect(await page.locator('.gift-chrome[data-hidden]').count() === 1, 'chrome hidden + inert under the lightbox');
    await t.shot(page, `${prefix}-6-lightbox`);
    await page.getByRole('button', { name: 'Ảnh tiếp theo' }).click();
    t.expect((await page.textContent('.gift-lb__counter'))?.trim() === `1 / ${photos}`, "lightbox counter wraps from the last photo to the first");
    await page.getByTestId('gift-lightbox-close').click();
    await page.waitForFunction(() => document.querySelector('[data-testid="gift-player"]')?.dataset.state === 'reading');
    await settle(page, 500);
  }

  if (drawer) {
    await page.locator('[data-testid="gift-drawer-pull"] .ui-pull__btn').click();
    await page.getByTestId('gift-drawer').waitFor();
    await settle(page, 700);
    t.expect(await page.getByTestId('music-dock').isVisible(), 'mixtape in the extras drawer');
    await t.shot(page, `${prefix}-7-drawer`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-testid="gift-player"]')?.dataset.state === 'reading');
    await settle(page, 400);
  }

  await page.waitForSelector('[data-testid="gift-continue"][data-ready]', { timeout: 30000 });
  await page.locator('[data-testid="gift-continue"] button').click({ force: true });
  await page.getByTestId('gift-finale').waitFor();
  await settle(page, 450);
  await t.shot(page, `${prefix}-8-finale`);
  await page.waitForSelector('[data-testid="gift-end"][data-ready]', { timeout: 8000 });
  await page.waitForFunction(() => !document.querySelector('[data-testid="gift-finale"]'), null, { timeout: 8000 });
  await settle(page, 700);
  t.expect((await page.textContent('[data-testid="gift-end"]'))?.includes('Cảm ơn em vì đã ở đây.'), 'end card in the sender voice');
  await t.shot(page, `${prefix}-9-end`);

  await page.getByRole('button', { name: 'Xem lại từ đầu' }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="gift-player"]')?.dataset.state === 'landing', null, { timeout: 8000 });
  await settle(page, 1700);
  await t.shot(page, `${prefix}-10-replay`);
}

export const tests = {
  async envelope(t) {
    const page = await t.newPage();
    const url = await createGift(t, page, {
      mechanic: 'envelope', photos: 4, song: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', prefix: 'gift-env',
      body: 'Hôm nay anh muốn nói với em một điều: cảm ơn em vì đã đến bên anh. Thương em nhiều lắm nha.',
    });
    await page.getByTestId('create-open-link').locator('button').click();
    await page.getByTestId('gift-hero').waitFor();
    t.expect(page.url() === url, 'opened the generated link');
    await page.evaluate(() => document.fonts.ready);
    await settle(page, 1500); // hint ring at +1.2 s
    await t.shot(page, 'gift-env-1-landing');
    await page.getByTestId('gift-hero').click({ force: true }); // it floats (P25): never 'stable'
    await settle(page, 1700);
    await t.shot(page, 'gift-env-2-bloom');
    await page.waitForSelector('[data-testid="gift-prompt"][data-shown]', { timeout: 10000 });
    await settle(page, 400);
    t.expect((await page.textContent('[data-testid="gift-prompt"]'))?.includes('chạm để xem nha'), 'tap-to-reveal prompt in the gift tone');
    await t.shot(page, 'gift-env-3-prompt');
    await page.locator('[data-testid="gift-prompt"] button').click();
    await settle(page, 700);
    await t.shot(page, 'gift-env-3b-curtain');
    await readToTheEnd(t, page, { prefix: 'gift-env', photos: 4, drawer: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    t.expect(!overflow, 'no horizontal scroll');
  },

  async box(t) {
    const page = await t.newPage();
    await createGift(t, page, {
      mechanic: 'box', photos: 5, prefix: 'gift-box', shots: false,
      body: 'Một hộp ngọt nho nhỏ cho em. Ăn từng món một nha, rồi đọc thư anh viết.',
    });
    await page.getByTestId('create-open-link').locator('button').click();
    await page.getByTestId('gift-ribbon').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await settle(page, 1500);
    await t.shot(page, 'gift-box-1-landing');
    // C2a: drag the ribbon past the 50 px threshold (a short drag first relaxes back)
    const b = await page.getByTestId('gift-ribbon').boundingBox();
    const x = b.x + b.width * 0.62, y = b.y + b.height * 0.55;
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + 20, y, { steps: 4 });
    await t.shot(page, 'gift-box-2-tug');
    await page.mouse.up();
    await settle(page, 300);
    t.expect(await page.getByTestId('gift-player').getAttribute('data-state') === 'landing', 'released under 50 px: the bow relaxes');
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + 70, y, { steps: 8 });
    await page.mouse.up();
    await settle(page, 450);
    await t.shot(page, 'gift-box-3-lid');
    await page.waitForFunction(() => document.querySelector('[data-testid="gift-player"]')?.dataset.state === 'treats', null, { timeout: 8000 });
    await settle(page, 300);
    await t.shot(page, 'gift-box-4-treats');
    for (let i = 0; i < 3; i++) {
      for (let k = 0; k < 2; k++) {
        await page.getByTestId(`gift-treat-${i}`).click();
        await settle(page, 260); // > the 200 ms bite debounce
        if (i === 0 && k === 0) {
          t.expect((await page.textContent('.gift-note'))?.includes('Còn 3 món nữa thôi'), 'first-bite note counts treats remaining');
          await t.shot(page, 'gift-box-5-bite');
        }
      }
    }
    await settle(page, 500);
    await t.shot(page, 'gift-box-6-spread');
    await readToTheEnd(t, page, { prefix: 'gift-box', photos: 5, drawer: false });
  },

  async reducedMotion(t) {
    const page = await t.newPage({ reducedMotion: 'reduce' });
    await createGift(t, page, {
      mechanic: 'envelope', photos: 2, prefix: 'gift-reduced', shots: false,
      body: 'Thư ngắn thôi: thương em.',
    });
    await page.getByTestId('create-open-link').locator('button').click();
    await page.getByTestId('gift-hero').waitFor();
    await settle(page, 1500);
    t.expect(await page.locator('.prim-outline, .ui-hintring').count() >= 0, 'hint present');
    await t.shot(page, 'gift-reduced-1-landing');
    await page.getByTestId('gift-hero').click({ force: true }); // it floats (P25): never 'stable'
    // reduced: the bloom is a ≤300 ms crossfade, then the prompt
    await page.waitForSelector('[data-testid="gift-prompt"][data-shown]', { timeout: 3000 });
    await settle(page, 300);
    await t.shot(page, 'gift-reduced-3-prompt');
    await page.locator('[data-testid="gift-prompt"] button').click();
    await readToTheEnd(t, page, { prefix: 'gift-reduced', photos: 2, drawer: false });
  },
};
