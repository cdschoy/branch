/** Primitives e2e (owner: primitives): lab coverage, typewriter timing, reels stop on pause, reduced motion, Director actions. */
const PRIMS = ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P10', 'P12', 'P14', 'P15', 'P16', 'P17', 'P18', 'P23', 'P25', 'P26', 'P27', 'P28', 'P29', 'P32', 'P33', 'P34', 'P36', 'P37', 'P42', 'P44', 'P45', 'P47'];
const UI = ['ui.Pill', 'ui.HintRing', 'ui.CountdownStamp', 'ui.ContinueObject', 'ui.DrawerPull'];

const text = (page, id) => page.getByTestId(id).textContent();
const waitText = (page, id, sub, timeout = 4000) =>
  page.waitForFunction(([i, s]) => document.querySelector(`[data-testid="${i}"]`)?.textContent?.includes(s), [id, sub], { timeout });

export const tests = {
  async labCoverage(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/lab');
    for (const id of [...PRIMS, ...UI, 'P.actions']) await page.getByTestId(`lab-${id}`).waitFor({ timeout: 5000 });
    const stubText = (await page.locator('.lab-missing').count()) ? await page.locator('.lab-missing').textContent() : '';
    for (const id of PRIMS) t.expect(!stubText?.includes(id + ' '), `${id} not listed as missing`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    t.expect(!overflow, 'no horizontal scroll at 390 px');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1600);
    await t.shot(page, 'primitives-lab');
  },

  async typewriterTiming(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/lab/P42');
    const t0 = Date.now();
    await waitText(page, 'state-P42', 'done', 8000);
    const ms = Date.now() - t0;
    const st = await text(page, 'state-P42');
    const [, n, unit, per] = st.match(/(\d+) g · (\w+) · (\d+) ms/) ?? [];
    t.expect(unit === 'grapheme', `short text reveals per grapheme (${st})`);
    const expected = Number(n) * Number(per);
    t.expect(ms > expected * 0.7 && ms < expected + 1500, `time-anchored duration ≈ n·ms (${ms} vs ${expected})`);
    const label = await page.locator('[data-primitive="typewriter"] .prim-sr').textContent();
    t.expect(label === label?.normalize('NFC') && label.length > 10, 'screen readers get the full NFC text');
    await waitText(page, 'state-P42', 'cue', 3000);
    // Long text: word mode; tap completes.
    await page.goto(t.baseURL + '#/lab/P42b');
    const st2 = await text(page, 'state-P42-long');
    t.expect(st2.includes('word'), `>130 graphemes uses word mode (${st2})`);
    await page.waitForTimeout(400);
    await page.locator('[data-primitive="typewriter"]').dispatchEvent('pointerup');
    await waitText(page, 'state-P42-long', 'done', 1000);
    await t.shot(page, 'primitives-typewriter');
  },

  async reelsStopWhenPaused(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/lab/P29');
    const angle = () => page.evaluate(() => document.querySelector('.prim-cassette__reel--l')?.style.rotate ?? '');
    await page.getByTestId('P29-play').click();
    await page.waitForTimeout(300);
    const a1 = await angle();
    await page.waitForTimeout(300);
    const a2 = await angle();
    t.expect(a1 !== a2 && a2 !== '', `reels spin while playing (${a1} → ${a2})`);
    const right = await page.evaluate(() => parseFloat(document.querySelector('.prim-cassette__reel--r')?.style.rotate ?? '0'));
    t.expect(right < 0, 'right reel counter-rotates');
    await page.getByTestId('P29-pause').click();
    await page.waitForTimeout(100);
    const p1 = await angle();
    await page.waitForTimeout(500);
    const p2 = await angle();
    t.expect(p1 === p2, `reels frozen when paused (${p1} = ${p2})`);
  },

  async surfaces(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/lab/P05');
    await page.getByTestId('P05-toggle').click();
    await waitText(page, 'state-P05', 'opened', 2000);
    await page.getByTestId('P05-toggle').click();
    await waitText(page, 'state-P05', 'closed', 2000);

    await page.goto(t.baseURL + '#/lab/P36');
    await page.locator('.prim-thumb').first().click();
    await page.getByRole('dialog').waitFor();
    await page.waitForTimeout(700);
    await t.shot(page, 'primitives-lightbox');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 2000 });

    await page.goto(t.baseURL + '#/lab/P23');
    await page.getByTestId('P23-fire').click();
    await waitText(page, 'peaks-P23', '×1', 1000);

    await page.goto(t.baseURL + '#/lab/P37');
    await page.getByTestId('P37-print').click();
    await waitText(page, 'done-P37', '×1', 4000);
    await page.getByTestId('P37-print').click();
    await waitText(page, 'done-P37', '×2', 4000);
    await t.shot(page, 'primitives-toss');

    await page.goto(t.baseURL + '#/lab/ui.ContinueObject');
    // aria-disabled until readEnough, but the tap still answers (wobble + guard tooltip).
    await page.locator('.ui-continue__btn').click({ force: true });
    await page.getByRole('tooltip').waitFor({ timeout: 1000 });
    await page.getByTestId('ui.ContinueObject-ready').click();
    await page.locator('.ui-continue__btn').click();
    await waitText(page, 'went-ui.ContinueObject', '×1', 1000);
  },

  async reducedMotion(t) {
    const page = await t.newPage({ reducedMotion: 'reduce' });
    await page.goto(t.baseURL + '#/lab/P01');
    await waitText(page, 'done-P01', 'done', 2000);
    await page.goto(t.baseURL + '#/lab/P42');
    await waitText(page, 'state-P42', 'done', 500);
    await page.goto(t.baseURL + '#/lab/P44');
    const outlined = await page.locator('[data-primitive="idleWobble"].prim-outline').count();
    t.expect(outlined === 1, 'idle wobble → static outline under reduced motion');
    await page.goto(t.baseURL + '#/lab/ui.HintRing');
    t.expect(await page.locator('.prim-ring--static').count() >= 1, 'hint ring → static outline');
    await page.goto(t.baseURL + '#/lab/P04');
    await waitText(page, 'done-P04', 'done', 2500);
  },

  async directorActions(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/lab/P.actions');
    await page.getByTestId('actions-select').waitFor();
    const ids = await page.locator('[data-testid="actions-select"] option').evaluateAll((os) => os.map((o) => o.value));
    t.expect(ids.length >= 30, `≥30 primitive actions registered (${ids.length})`);
    for (const id of ids) {
      await page.getByTestId('actions-select').selectOption(id);
      await page.getByTestId('actions-play').click();
      await waitText(page, 'actions-log', `${id}: finished`, 4000);
    }
    t.log(`director actions ok: ${ids.length}`);
  },
};
