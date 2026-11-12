/** Scaffold smoke (owner: scaffold): landing, lab, sample gift, booth camera, reduced motion. */
export const tests = {
  async landing(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/');
    await page.getByTestId('choose-gift').waitFor();
    t.expect(await page.getByTestId('choose-booth').isVisible(), 'booth choice visible');
    t.expect((await page.textContent('h1'))?.includes('người thương'), 'landing title from vi.json');
    await page.evaluate(() => document.fonts.ready);
    await t.shot(page, 'scaffold-landing');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    t.expect(!overflow, 'no horizontal scroll at 390 px');
  },
  async lab(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/lab');
    await page.getByTestId('lab-core.director').waitFor();
    await page.waitForFunction(() => document.querySelector('[data-testid="director-log"]')?.textContent?.includes('finished'), null, { timeout: 5000 });
    await page.getByTestId('replay-core.director').click();
    await page.waitForFunction(() => document.querySelector('[data-testid="director-log"]')?.textContent?.includes('finished'), null, { timeout: 5000 });
    await page.evaluate(() => document.fonts.ready);
    await t.shot(page, 'scaffold-lab');
  },
  async sampleGift(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/');
    await page.getByTestId('sample-gift').click();
    await page.locator('.ui-letter').waitFor();
    t.expect((await page.textContent('.ui-letter'))?.includes('Gửi Bống'), 'letter decoded from the hash');
    await t.shot(page, 'scaffold-gift');
  },
  async boothCamera(t) {
    const page = await t.newPage();
    await page.goto(t.baseURL + '#/booth');
    await page.getByRole('button').first().click();
    await page.waitForFunction(() => { const v = document.querySelector('[data-testid="booth-video"]'); return v && v.videoWidth > 0; }, null, { timeout: 8000 });
    await t.shot(page, 'scaffold-booth');
  },
  async reducedMotion(t) {
    const page = await t.newPage({ reducedMotion: 'reduce' });
    await page.goto(t.baseURL + '#/lab/core.director');
    await page.waitForFunction(() => document.querySelector('[data-testid="director-log"]')?.textContent?.includes('finished'), null, { timeout: 3000 });
    const checked = await page.getByTestId('reduced-toggle').isChecked();
    t.expect(checked, 'reduced toggle reflects the OS preference');
  },
};
