/**
 * Media resolution (owner: scaffold). Local starter refs:
 *   'ph:<n>'  → an ORIGINAL procedural placeholder "photo" (SVG data URL in palette colours)
 *   'data:…'  → used as-is (keep small: the whole gift must fit in the URL)
 * SEAM: server uuids resolve to signed URLs returned by /api/gift/[slug]/open.
 */
import type { MediaRef } from './types';

/** Placeholder palettes, as CSS variable names resolved at call time (no hex in components). */
const PAIRS: [string, string, string][] = [
  ['--c-blush-200', '--c-flower-peony-coral', '--c-cream-50'],
  ['--c-cream-300', '--c-flower-hydrangea', '--c-flower-daisy'],
  ['--c-accent-forest-soft', '--c-flower-sunflower', '--c-cream-50'],
  ['--c-blush-100', '--c-berry-500', '--c-flower-peach'],
  ['--c-butter-200', '--c-flower-dahlia-salmon', '--c-cream-100'],
  ['--c-blush-300', '--c-lilac-400', '--c-cream-50'],
];

const cssColor = (name: string): string => {
  try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'gray'; } catch { return 'gray'; }
};

/** An abstract painted "photo": sky band, sun, two hills. Deterministic by n. */
export function placeholderPhoto(n: number, w = 400, h = 300): string {
  const [bgV, aV, cV] = PAIRS[((n % PAIRS.length) + PAIRS.length) % PAIRS.length]!;
  const bg = cssColor(bgV), a = cssColor(aV), c = cssColor(cV);
  const sx = 60 + ((n * 97) % (w - 120));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>` +
    `<circle cx="${sx}" cy="${h * 0.32}" r="${h * 0.12}" fill="${c}"/>` +
    `<path d="M0 ${h * 0.72} Q ${w * 0.3} ${h * 0.5} ${w * 0.6} ${h * 0.7} T ${w} ${h * 0.66} V ${h} H0Z" fill="${a}" opacity=".75"/>` +
    `<path d="M0 ${h * 0.85} Q ${w * 0.45} ${h * 0.7} ${w} ${h * 0.86} V ${h} H0Z" fill="${a}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function resolveMedia(ref: MediaRef): string {
  if (ref.startsWith('ph:')) return placeholderPhoto(Number(ref.slice(3)) || 0);
  return ref;
}
