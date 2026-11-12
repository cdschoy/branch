/**
 * Fonts (FRAMEWORK §3.4; owner: scaffold). Self-hosted via Fontsource (VN + Latin subsets with
 * unicode-range; font-display: swap). Only verified 74/74 families are loaded.
 *
 * Playwrite VN: Fontsource ships it as one "latin" file whose unicode-range EXCLUDES Vietnamese,
 * although the file itself is 74/74 (checked with i18n/tools/font_glyph_check.py). We register that
 * file ourselves with no unicode-range so Vietnamese signatures render in it.
 */
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/mali/400.css';
import '@fontsource/mali/500.css';
import '@fontsource/dancing-script/700.css';
import '@fontsource/paytone-one/400.css';
import playwriteVn from '@fontsource/playwrite-vn/files/playwrite-vn-latin-400-normal.woff2?url';

export function registerFonts(): void {
  try {
    const face = new FontFace('Playwrite VN', `url(${playwriteVn}) format('woff2')`, { weight: '400', style: 'normal', display: 'swap' });
    document.fonts.add(face);
  } catch { /* FontFace unsupported: falls back per --font-script-signature */ }
}

/** Gate a reveal on the scene's critical faces (§3.4 rule 8: the sample must contain Vietnamese letters). */
export function fontsReady(faces: readonly string[] = ['500 16px "Be Vietnam Pro"', '400 18px Mali', '700 40px "Dancing Script"'], timeoutMs = 1500): Promise<void> {
  const sample = 'ắệữĐơ';
  const load = Promise.all(faces.map((f) => document.fonts.load(f, sample).catch(() => []))).then(() => undefined);
  return Promise.race([load, new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}
