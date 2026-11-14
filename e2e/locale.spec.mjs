/**
 * Language switch e2e (owner: scaffold). VI | EN toggle on every route: switch on the landing, walk
 * create → sample gift → booth → lab in English checking that no Vietnamese UI copy is left (user content
 * and proper nouns allowed), switch back to Vietnamese in the middle of the gift's opening spectacle
 * without breaking it, keep the camera stream and the creator draft across a switch, then reload and
 * check the choice persisted. Screenshots: locale-<screen>-<vi|en>.png (E2E_SHOTS picks the folder).
 */

/** Vietnamese-only letters (tone marks and ă â đ ê ô ơ ư). */
const VI_CHARS = /[ăâđêôơưĂÂĐÊÔƠƯàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵÀÁẢÃẠẰẮẲẴẶẦẤẨẪẬÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴ]/;
/** Allowed Vietnamese in English mode: names / places (proper nouns, user content) and the creator's
 *  Vietnamese-only pronoun concept (the chips and the "In Vietnamese: …" example). */
const ALLOWED = [
  /Bống/g, /Đà Lạt/g, /Nguyễn Thị Ánh Dương/g,
  /In Vietnamese: “[^”]*”/g, /\b(anh|em|tớ|cậu|mình|bạn) – (anh|em|tớ|cậu|mình|bạn)\b/g, /… nhé|… nha/g, /Bézier/g,
];

async function visibleText(page) {
  return page.evaluate(() => {
    // innerText skips display:none / visibility:hidden; also drop inert / aria-hidden subtrees and the
    // subtrees explicitly marked lang="vi" (Vietnamese on purpose, e.g. the lab's grapheme demo).
    const root = document.body.cloneNode(true);
    const live = document.body.querySelectorAll('*');
    const clones = root.querySelectorAll('*');
    live.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const hidden = cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0 || el.closest('[inert],[aria-hidden="true"],[hidden],[lang="vi"]');
      if (hidden) clones[i].setAttribute('data-strip', '');
    });
    root.querySelectorAll('[data-strip]').forEach((el) => el.remove());
    const parts = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) parts.push(w.currentNode.nodeValue);
    return parts.join(' ');
  });
}

async function noVietnameseUi(t, page, where) {
  let text = (await visibleText(page)).normalize('NFC');
  for (const re of ALLOWED) text = text.replace(re, '');
  const hit = text.split(/\s+/).filter((w) => VI_CHARS.test(w));
  t.expect(hit.length === 0, `${where}: Vietnamese UI text in English mode: ${[...new Set(hit)].slice(0, 40).join(' ')}`);
}

const lang = (page) => page.evaluate(() => document.documentElement.lang);
const state = (page) => page.getByTestId('gift-player').getAttribute('data-state');
/** Tap the visible VI / EN segment (the radio itself is visually hidden inside its label). */
const pick = async (page, l) => { await page.getByTestId(`locale-${l}`).locator('xpath=..').click(); };

async function checkToggle(t, page, where) {
  const g = page.getByRole('radiogroup', { name: /Ngôn ngữ|Language/ });
  t.expect(await g.count() === 1, `${where}: one language switch`);
  for (const l of ['vi', 'en']) {
    const box = await page.getByTestId(`locale-${l}`).locator('xpath=..').boundingBox();
    t.expect(box && box.width >= 44 && box.height >= 44, `${where}: ${l} option is a ≥44 px target (${box?.width}×${box?.height})`);
  }
}

export const timeout = 180000;

export const tests = {
  async switchAndWalk(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/');
    await page.getByTestId('choose-gift').waitFor();
    await page.evaluate(() => document.fonts.ready);
    t.expect(await lang(page) === 'vi', 'Vietnamese is the default (vi-VN browser, nothing saved)');
    await checkToggle(t, page, 'landing');
    await t.shot(page, 'locale-landing-vi');

    // ---- landing → EN
    await pick(page, 'en');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    t.expect((await page.textContent('h1'))?.includes('A little gift for someone you love'), 'landing title in English');
    t.expect((await page.getByTestId('sample-gift').textContent())?.includes('Open a sample gift'), 'sample link in English');
    t.expect(await page.title() === 'Gifts', 'document title follows the locale');
    t.expect(await page.getByTestId('locale-en').isChecked(), 'EN option checked');
    await noVietnameseUi(t, page, 'landing');
    t.expect(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'no horizontal scroll (landing)');
    await t.shot(page, 'locale-landing-en');

    // ---- creator in English; the draft survives a switch
    await page.getByTestId('choose-gift').click();
    await page.getByTestId('create').waitFor();
    await checkToggle(t, page, 'create');
    t.expect((await page.textContent('.create__title'))?.includes('Create a gift'), 'creator title in English');
    await noVietnameseUi(t, page, 'create · mechanic');
    await t.shot(page, 'locale-create-en');
    await page.getByTestId('mechanic-envelope').click();
    await page.getByTestId('create-next').locator('button').click();
    await page.getByTestId('create-next').locator('button').click();
    await page.getByTestId('create-to').fill('Bống');
    await page.getByTestId('create-from').fill('Minh');
    t.expect((await page.textContent('.create__example'))?.includes('In Vietnamese: “Anh có một món quà nhỏ cho em nè”'), 'pronoun example stays Vietnamese, labelled in English');
    t.expect((await page.getByTestId('pronoun-anh-em').textContent())?.includes('older'), 'pronoun chip explained in English');
    await noVietnameseUi(t, page, 'create · people');
    await t.shot(page, 'locale-create-people-en');
    await pick(page, 'vi');
    await page.waitForFunction(() => document.documentElement.lang === 'vi');
    t.expect(await page.getByTestId('create-to').inputValue() === 'Bống', 'draft name survives the switch');
    t.expect(await page.getByTestId('create').getAttribute('data-step') === 'people', 'creator step survives the switch');
    t.expect((await page.textContent('.create__title'))?.includes('Tạo món quà'), 'creator title back in Vietnamese');
    await t.shot(page, 'locale-create-people-vi');
    await pick(page, 'en');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    // walk on to "Preview & send": the English copy must keep the 16 px gutters (no nowrap pill overflow)
    await page.getByTestId('create-next').locator('button').click();
    await page.getByRole('button', { name: 'Skip', exact: true }).click();
    await page.getByTestId('create-body').fill('Happy birthday, Bống!');
    await page.getByTestId('create-next').locator('button').click();
    await page.getByRole('button', { name: 'Skip', exact: true }).click();
    await page.getByTestId('create-preview-btn').waitFor();
    const gutter = async (where) => {
      for (const l of ['en', 'vi']) {
        await pick(page, l);
        await page.waitForFunction((x) => document.documentElement.lang === x, l);
        const r = await page.evaluate(() => {
          const step = document.querySelector('.create__step')?.getBoundingClientRect();
          return { right: step?.right ?? 0, max: innerWidth - 16, scroll: document.documentElement.scrollWidth > innerWidth };
        });
        t.expect(r.right <= r.max + 0.5 && !r.scroll, `${where} (${l}): column keeps its 16 px gutter (right ${r.right} ≤ ${r.max})`);
      }
      await pick(page, 'en');
      await page.waitForFunction(() => document.documentElement.lang === 'en');
    };
    await gutter('create · review');
    await noVietnameseUi(t, page, 'create · review');
    await t.shot(page, 'locale-create-review-en');
    await page.getByTestId('create-link-btn').locator('button').click();
    await page.getByTestId('create-link').waitFor();
    await gutter('create · link');
    await noVietnameseUi(t, page, 'create · link');
    await t.shot(page, 'locale-create-link-en');

    // ---- sample gift in English, then Vietnamese mid-spectacle
    await page.goto(t.baseURL + '#/');
    await page.getByTestId('sample-gift').click();
    await page.getByTestId('gift-hero').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await checkToggle(t, page, 'gift');
    t.expect((await page.textContent('.gift-opener__from'))?.includes('I have a little gift for you'), 'gift chrome in English');
    t.expect((await page.textContent('[data-testid="gift-letter"]'))?.includes('Dear Bống'), 'English sample content');
    await page.waitForTimeout(1300);
    await noVietnameseUi(t, page, 'gift · landing');
    await t.shot(page, 'locale-gift-landing-en');
    await page.getByTestId('gift-hero').click({ force: true });
    await page.waitForTimeout(900); // bloom spectacle running
    t.expect(await state(page) === 'opening', 'spectacle running when switching');
    await pick(page, 'vi');
    await page.waitForFunction(() => document.documentElement.lang === 'vi');
    t.expect(await state(page) === 'opening', 'the switch does not restart or end the spectacle');
    await t.shot(page, 'locale-gift-bloom-vi');
    await page.waitForSelector('[data-testid="gift-prompt"][data-shown]', { timeout: 10000 });
    t.expect((await page.textContent('[data-testid="gift-prompt"]'))?.includes('chạm để xem nha'), 'prompt in Vietnamese after the switch');
    await page.locator('[data-testid="gift-prompt"] button').click();
    await page.waitForFunction(() => document.querySelector('[data-testid="gift-player"]')?.dataset.state === 'reading', null, { timeout: 15000 });
    t.expect((await page.textContent('.ui-letter__eyebrow'))?.includes('THƯ GỬI EM'), 'letter chrome in Vietnamese');
    t.expect((await page.textContent('[data-testid="gift-letter"]'))?.includes('Dear Bống'), 'the sender’s words are never translated');
    // switch back to English while the letter types
    await pick(page, 'en');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    await page.waitForSelector('[data-testid="gift-player"][data-typed]', { timeout: 15000 });
    t.expect((await page.textContent('.ui-letter__eyebrow'))?.includes('A LETTER FOR YOU'), 'eyebrow in English, upper-cased for the locale');
    await page.getByTestId('gift-continue').waitFor({ timeout: 8000 });
    await page.waitForFunction(() => !document.querySelector('.gift-photo[data-await]'), null, { timeout: 10000 });
    await page.waitForTimeout(500);
    await noVietnameseUi(t, page, 'gift · reading');
    await t.shot(page, 'locale-gift-reading-en');
    // the floating switch is gift chrome too: hidden and unreachable under the photo lightbox (C6, G10)
    const tbox = await page.getByTestId('locale-toggle').boundingBox();
    await page.locator('.gift-photo .prim-thumb').first().click();
    await page.getByTestId('gift-lightbox').waitFor();
    await page.waitForTimeout(400);
    const onTop = await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('[data-testid="locale-toggle"]'), [tbox.x + tbox.width / 2, tbox.y + tbox.height / 2]);
    t.expect(!onTop, 'language switch is not hit-testable under the lightbox');
    t.expect(await page.getByTestId('locale-toggle').evaluate((el) => getComputedStyle(el).visibility) === 'hidden', 'language switch hidden under the lightbox');
    await page.getByTestId('gift-lightbox-close').click();
    await page.waitForFunction(() => document.querySelector('[data-testid="gift-player"]')?.dataset.state === 'reading');
    t.expect(await page.getByTestId('locale-toggle').evaluate((el) => getComputedStyle(el).visibility) === 'visible', 'language switch back after the lightbox closes');
    await page.locator('[data-testid="gift-drawer-pull"] .ui-pull__btn').click();
    await page.getByTestId('gift-drawer').waitFor();
    await page.waitForTimeout(700);
    t.expect(/Since \d{1,2} Feb 2024/.test(await page.textContent('[data-testid="gift-days"]') ?? ''), 'days page date in the English format');
    await noVietnameseUi(t, page, 'gift · drawer');
    await t.shot(page, 'locale-gift-drawer-en');
    await pick(page, 'vi');
    await page.waitForFunction(() => document.documentElement.lang === 'vi');
    t.expect((await page.textContent('[data-testid="gift-days"]'))?.includes('Kể từ 14/02/2024'), 'days page date in dd/mm/yyyy');
    await t.shot(page, 'locale-gift-drawer-vi');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-testid="gift-player"]')?.dataset.state === 'reading');
    await page.waitForSelector('[data-testid="gift-continue"][data-ready]', { timeout: 30000 });
    await page.locator('[data-testid="gift-continue"] button').click({ force: true });
    await page.waitForSelector('[data-testid="gift-end"][data-ready]', { timeout: 10000 });
    await page.waitForFunction(() => !document.querySelector('[data-testid="gift-finale"]'), null, { timeout: 8000 });
    await page.waitForTimeout(700);
    t.expect((await page.textContent('[data-testid="gift-end"]'))?.includes('Cảm ơn em vì đã ở đây.'), 'end card in Vietnamese');
    await t.shot(page, 'locale-gift-end-vi');
    await pick(page, 'en');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    t.expect((await page.textContent('[data-testid="gift-end"]'))?.includes('Thank you for being here.'), 'end card in English');
    await noVietnameseUi(t, page, 'gift · end');
    await t.shot(page, 'locale-gift-end-en');

    // ---- booth: the camera stream survives a switch
    await page.goto(t.baseURL + '#/booth');
    await page.getByTestId('booth-explainer').waitFor();
    await checkToggle(t, page, 'booth');
    await noVietnameseUi(t, page, 'booth · explainer');
    await t.shot(page, 'locale-booth-en');
    await page.locator('[data-testid=booth-explainer] button').first().click();
    await page.waitForFunction(() => { const v = document.querySelector('[data-testid="booth-video"]'); return v && v.videoWidth > 0; }, null, { timeout: 8000 });
    const streamId = () => page.evaluate(() => document.querySelector('[data-testid="booth-video"]')?.srcObject?.id ?? null);
    const before = await streamId();
    await page.waitForTimeout(300);
    await noVietnameseUi(t, page, 'booth · ready');
    await t.shot(page, 'locale-booth-ready-en');
    await pick(page, 'vi');
    await page.waitForFunction(() => document.documentElement.lang === 'vi');
    t.expect(before && (await streamId()) === before, 'same camera stream after the switch');
    t.expect(await page.evaluate(() => document.querySelector('[data-testid="booth-video"]')?.srcObject?.active === true), 'stream still live');
    t.expect((await page.textContent('.booth-title'))?.includes('Photobooth tự chụp'), 'booth title in Vietnamese');
    await t.shot(page, 'locale-booth-ready-vi');
    await pick(page, 'en');
    await page.waitForFunction(() => document.documentElement.lang === 'en');

    // ---- lab
    await page.goto(t.baseURL + '#/lab');
    await page.getByTestId('lab-core.director').waitFor();
    await checkToggle(t, page, 'lab');
    await page.waitForTimeout(1200);
    t.expect((await page.textContent('.lab-title'))?.includes('Motion lab'), 'lab title in English');
    await noVietnameseUi(t, page, 'lab');
    await t.shot(page, 'locale-lab-en');

    // ---- reload: the choice persisted
    await page.reload();
    await page.getByTestId('lab-core.director').waitFor();
    t.expect(await lang(page) === 'en', 'English persisted across a reload');
    t.expect(await page.getByTestId('locale-en').isChecked(), 'EN still checked after reload');
    await pick(page, 'vi');
    await page.waitForFunction(() => document.documentElement.lang === 'vi');
    await page.waitForTimeout(800);
    await t.shot(page, 'locale-lab-vi');
    await page.goto(t.baseURL + '#/booth');
    await page.getByTestId('booth-explainer').waitFor();
    await t.shot(page, 'locale-booth-vi');
    await page.goto(t.baseURL + '#/');
    await page.getByTestId('sample-gift').click();
    await page.getByTestId('gift-hero').waitFor();
    t.expect((await page.textContent('[data-testid="gift-letter"]'))?.includes('Gửi Bống'), 'Vietnamese sample when the locale is Vietnamese');
    await page.waitForTimeout(1300);
    await t.shot(page, 'locale-gift-landing-vi');
  },

  async browserLanguage(t) {
    // No saved choice: a Vietnamese browser and any other browser both start in Vietnamese (product default).
    for (const locale of ['en-US', 'vi-VN']) {
      const page = await t.newPage({ locale });
      await page.goto(t.baseURL + '#/');
      await page.getByTestId('choose-gift').waitFor();
      t.expect(await lang(page) === 'vi', `${locale}: starts in Vietnamese`);
    }
    // A saved choice wins, and blocked storage does not break the app.
    const page = await t.newPage();
    await page.addInitScript(() => { try { localStorage.setItem('app:locale:v1', 'en'); } catch { /* ignore */ } });
    await page.goto(t.baseURL + '#/booth');
    await page.getByTestId('booth-explainer').waitFor();
    t.expect(await lang(page) === 'en', 'saved English choice is used');
    const blocked = await t.newPage();
    await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
    await blocked.goto(t.baseURL + '#/');
    await blocked.getByTestId('choose-gift').waitFor();
    await pick(blocked, 'en');
    await blocked.waitForFunction(() => document.documentElement.lang === 'en');
    t.expect((await blocked.textContent('h1'))?.includes('A little gift'), 'switch works without storage');
  },
};
