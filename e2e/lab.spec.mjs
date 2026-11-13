/**
 * Lab e2e (owner: lead/integrator). Opens #/lab, collects every entry from the registry, then replays
 * every entry three ways and fails on any console error/warning (the runner records them):
 *   gallery   — the full #/lab grid at 390 px: every card renders, Replay works, no horizontal scroll;
 *   isolated  — #/lab/<id> for each entry (fx entries autoplay only here), Replay, settle;
 *   reduced   — the same with prefers-reduced-motion: reduce (the §4.5 variants).
 * Screenshots: lab-gallery.png, lab-<id>.png (isolated) and lab-reduced-<id>.png.
 */
export const timeout = 600000;

async function entryIds(page, t) {
  await page.goto(t.baseURL + '#/lab');
  await page.locator('.lab-grid').waitFor();
  const ids = await page.$$eval('[data-testid^="lab-"].lab-card', (els) => els.map((e) => e.getAttribute('data-testid').slice(4)));
  t.expect(ids.length > 40, `lab lists every entry (got ${ids.length})`);
  return ids;
}

async function cardOk(page, t, id) {
  const card = page.getByTestId(`lab-${id}`);
  await card.waitFor();
  const box = await card.locator('.lab-stage').boundingBox();
  t.expect(box && box.width > 200 && box.height > 40, `${id}: stage has a size`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  t.expect(overflow <= 0, `${id}: no horizontal scroll at 390 px (overflow ${overflow}px)`);
  // the stage must show something: an element, svg or canvas with a size
  const painted = await card.locator('.lab-stage').evaluate((st) => [...st.querySelectorAll('*')].some((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none';
  }));
  t.expect(painted, `${id}: stage renders visible content`);
}

async function replayEach(t, { reduced }) {
  const page = await t.newPage(reduced ? { reducedMotion: 'reduce' } : {});
  const ids = await entryIds(page, t);
  for (const id of ids) {
    await page.goto(t.baseURL + `#/lab/${encodeURIComponent(id)}`);
    await page.evaluate(() => document.fonts.ready);
    await cardOk(page, t, id);
    await page.waitForTimeout(reduced ? 300 : 900);
    await page.getByTestId(`replay-${id}`).click();
    await page.waitForTimeout(reduced ? 400 : 1400);
    await cardOk(page, t, id);
    await t.shot(page, `lab-${reduced ? 'reduced-' : ''}${id.replace(/[^\w.-]/g, '_')}`);
  }
  t.log(`${ids.length} entries replayed${reduced ? ' (reduced)' : ''}`);
}

export const tests = {
  async gallery(t) {
    const page = await t.newPage();
    const ids = await entryIds(page, t);
    await page.evaluate(() => document.fonts.ready);
    for (const id of ids) {
      const btn = page.getByTestId(`replay-${id}`);
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.waitForTimeout(120);
      await cardOk(page, t, id);
    }
    await page.waitForTimeout(1500);
    await page.evaluate(() => scrollTo(0, 0));
    await t.shot(page, 'lab-gallery');
    // desktop width too
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    t.expect(overflow <= 0, `desktop: no horizontal scroll (${overflow}px)`);
    await t.shot(page, 'lab-gallery-desktop');
  },
  async isolated(t) { await replayEach(t, { reduced: false }); },
  async reduced(t) { await replayEach(t, { reduced: true }); },
};
