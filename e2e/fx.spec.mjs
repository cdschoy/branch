/**
 * fx e2e (owner: fx): every emitter lab draws, scrub is exact (same t → same pixels), the wrapper fires
 * onCover before onDone, Director sequences run clean, reduced motion shortens spectacles to a fade,
 * and the frame-drop circuit breaker skips a spectacle.
 */
const EMITTER_LABS = [
  'P38', 'P38.wipe', 'P38.flood', 'P39', 'fx.curtainDrop', 'P21', 'P22',
  'fx.petals', 'fx.starburst', 'fx.rays', 'fx.burstMound', 'fx.echoTrail',
];
const SHOT_AT = { P38: 0.3, 'P38.wipe': 0.35, 'P38.flood': 0.4, P39: 0.5, 'fx.curtainDrop': 0.3, P22: 0.3, P21: 0.4, 'fx.petals': 0.5, 'fx.starburst': 0.1, 'fx.rays': 0.3, 'fx.burstMound': 0.95, 'fx.echoTrail': 0.4 };

/** Paint stats of the fx canvas: painted pixel count + a cheap hash of a subsample. */
const canvasStats = (page) => page.evaluate(async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const c = document.querySelector('[data-testid="fx-canvas"]');
  // read back through a fresh CPU canvas so the app's (GPU) fx canvas is never read repeatedly
  const o = document.createElement('canvas');
  o.width = c.width; o.height = c.height;
  const g = o.getContext('2d', { willReadFrequently: true });
  g.drawImage(c, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  let painted = 0, h = 2166136261;
  for (let i = 3; i < d.length; i += 4 * 7) {
    if (d[i] > 8) painted++;
    h = Math.imul(h ^ d[i - 3] ^ (d[i - 2] << 8) ^ (d[i - 1] << 16) ^ (d[i] << 24), 16777619) >>> 0;
  }
  return { painted, hash: h, total: Math.floor(d.length / (4 * 7)) };
});

const state = async (page, id) => {
  const el = page.getByTestId(`fx-state-${id}`);
  return { t: Number(await el.getAttribute('data-t')), total: Number(await el.getAttribute('data-total')), playing: (await el.getAttribute('data-playing')) === '1', cover: await el.getAttribute('data-cover') };
};

async function scrub(page, id, ms) {
  await page.getByTestId(`scrub-${id}`).fill(String(Math.round(ms)));
}

export const tests = {
  async emitterLabs(t) {
    const page = await t.newPage();
    for (const id of EMITTER_LABS) {
      await page.goto(t.baseURL + `#/lab/${id}`);
      await page.reload();
      await page.getByTestId(`fx-state-${id}`).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const { total } = await state(page, id);
      t.expect(total > 0, `${id}: has a duration`);
      // autoplays when isolated
      await page.waitForFunction((i) => document.querySelector(`[data-testid="fx-state-${i}"]`)?.getAttribute('data-playing') === '1' || Number(document.querySelector(`[data-testid="fx-state-${i}"]`)?.getAttribute('data-t')) > 0, id, { timeout: 3000 });
      const at = total * (SHOT_AT[id] ?? 0.5);
      await scrub(page, id, at);
      const a = await canvasStats(page);
      t.expect(a.painted > 0, `${id}: canvas painted at ${Math.round(at)} ms`);
      await t.shot(page, `fx-${id}`);
      // exact seek: jump away and back → identical pixels
      await scrub(page, id, total * 0.05);
      await canvasStats(page);
      await scrub(page, id, at);
      const b = await canvasStats(page);
      t.expect(a.hash === b.hash, `${id}: scrub is exact (${a.hash} vs ${b.hash})`);
      t.log(id, `painted ${a.painted}/${a.total} @${Math.round(at)}ms of ${Math.round(total)}`);
    }
    // a full cover really covers: bloom at its end, wipe at the swap time
    await page.goto(t.baseURL + '#/lab/P39'); await page.reload();
    const bl = await state(page, 'P39');
    await scrub(page, 'P39', bl.total - 1);
    const full = await canvasStats(page);
    t.expect(full.painted / full.total > 0.95, `bloom end covers the viewport (${(full.painted / full.total).toFixed(3)})`);
    t.expect(Number((await state(page, 'P39')).cover) > 0.95, 'bloom coverage readout ≥95%');
  },

  async playToEnd(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/lab/P21');
    await page.getByTestId('fx-state-P21').waitFor();
    await page.waitForFunction(() => { const e = document.querySelector('[data-testid="fx-state-P21"]'); return e && e.getAttribute('data-playing') === '0' && Number(e.getAttribute('data-t')) >= Number(e.getAttribute('data-total')); }, null, { timeout: 4000 });
    const s = await canvasStats(page);
    t.expect(s.painted === 0, 'canvas is clear once an emission ends');
    await page.getByTestId('play-P21').click();
    await page.waitForFunction(() => document.querySelector('[data-testid="fx-state-P21"]')?.getAttribute('data-playing') === '1', null, { timeout: 2000 });
  },

  async wrapperCover(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/lab/P38.wipe.wrapper');
    const w = page.getByTestId('wrapper-wipe');
    await w.waitFor();
    await page.waitForFunction(() => document.querySelector('[data-testid="wrapper-wipe"]')?.getAttribute('data-covered') === '1', null, { timeout: 3000 });
    const doneAtCover = await w.getAttribute('data-done');
    t.expect(doneAtCover === '0', 'onCover fires before onDone (swap under the cover)');
    const s = await canvasStats(page);
    t.expect(s.painted / s.total > 0.7, `≥70% painted when onCover fires (${(s.painted / s.total).toFixed(2)})`);
    await page.waitForFunction(() => document.querySelector('[data-testid="wrapper-wipe"]')?.getAttribute('data-done') === '1', null, { timeout: 4000 });
  },

  async directorSequences(t) {
    const page = await t.newPage();
    for (const id of ['fx.seq.bloomDrop', 'fx.seq.finale']) {
      await page.goto(t.baseURL + `#/lab/${id}`); await page.reload();
      await page.getByTestId(`fx-state-${id}`).waitFor();
      const { total } = await state(page, id);
      await scrub(page, id, total * 0.55);
      const a = await canvasStats(page);
      t.expect(a.painted > 0, `${id}: Director-seeked canvas painted`);
      await t.shot(page, `fx-${id}`);
      await scrub(page, id, total * 0.2);
      await canvasStats(page);
      await scrub(page, id, total * 0.55);
      const b = await canvasStats(page);
      t.expect(a.hash === b.hash, `${id}: run.seek is exact`);
      await page.getByTestId(`play-${id}`).click();
      await page.waitForFunction((i) => document.querySelector(`[data-testid="fx-state-${i}"]`)?.getAttribute('data-playing') === '0', id, { timeout: 8000 });
    }
    // after the finale the held burst mound is gone
    const s = await canvasStats(page);
    t.expect(s.painted === 0, 'finale leaves a clean canvas (held burst released by the clear phase)');
  },

  async reducedMotion(t) {
    const page = await t.newPage({ reducedMotion: 'reduce' });
    for (const id of ['P38', 'P39', 'P38.wipe']) {
      await page.goto(t.baseURL + `#/lab/${id}`); await page.reload();
      await page.getByTestId(`fx-state-${id}`).waitFor();
      const { total } = await state(page, id);
      t.expect(total <= 400, `${id}: reduced spectacle is a short fade (${total} ms)`);
    }
    await page.goto(t.baseURL + '#/lab/P22'); await page.reload();
    await page.getByTestId('fx-state-P22').waitFor();
    t.expect((await page.getByTestId('fx-state-P22').getAttribute('data-count')) === '0', 'confetti off under reduced motion');
    await page.goto(t.baseURL + '#/lab/P38.wipe.wrapper'); await page.reload();
    await page.waitForFunction(() => document.querySelector('[data-testid="wrapper-wipe"]')?.getAttribute('data-done') === '1', null, { timeout: 2000 });
    t.expect((await page.getByTestId('wrapper-wipe').getAttribute('data-covered')) === '1', 'reduced wrapper still fires onCover');
  },

  async circuitBreaker(t) {
    t.allowConsole(/breaker tripped/); // the warning is the behaviour under test
    const page = await t.newPage();
    const warns = [];
    page.on('console', (m) => { if (m.type() === 'warning' && m.text().includes('breaker tripped')) warns.push(m.text()); });
    await page.goto(t.baseURL + '#/lab');
    await page.getByTestId('lab-P38.wipe.wrapper').waitFor();
    const t0 = await page.evaluate(() => performance.now());
    await page.getByTestId('replay-P38.wipe.wrapper').click();
    // jank the main thread for ~150 ms during the spectacle (≈8 dropped frames)
    await page.evaluate(() => new Promise((r) => setTimeout(() => { const e = performance.now() + 150; while (performance.now() < e) { /* busy */ } r(); }, 120)));
    await page.waitForFunction(() => document.querySelector('[data-testid="wrapper-wipe"]')?.getAttribute('data-done') === '1', null, { timeout: 3000 });
    const t1 = await page.evaluate(() => performance.now());
    t.expect(warns.length > 0, 'breaker tripped on dropped frames');
    t.log(`wipe skipped after ${Math.round(t1 - t0)} ms`);
  },
};
