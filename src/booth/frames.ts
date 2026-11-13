/**
 * Original strip frame themes (owner: booth). React-free. Colours are CSS custom-property NAMES,
 * resolved at compose time with resolvePalette() so the canvas uses the same tokens as the DOM.
 * Motifs are drawn procedurally by the compositor (no bitmaps, no reference art).
 */
import type { StringKey } from '../i18n';

export type FrameId = 'stripes' | 'garden' | 'gingham';
export type Motif = 'stripes' | 'flowers' | 'gingham';

export interface FrameTheme {
  readonly id: FrameId;
  readonly labelKey: StringKey;
  readonly motif: Motif;
  /** CSS variable names. */
  readonly vars: {
    readonly frame: string; readonly frameShadow: string; readonly motif: string; readonly motifAlt: string;
    readonly paper: string; readonly ink: string; readonly accent: string;
  };
}

export const FRAMES: readonly FrameTheme[] = [
  {
    id: 'stripes', labelKey: 'booth.frame.stripes', motif: 'stripes',
    vars: { frame: '--c-berry-600', frameShadow: '--c-berry-800', motif: '--c-blush-300', motifAlt: '--c-cream-50', paper: '--c-cream-50', ink: '--c-cream-50', accent: '--c-blush-200' },
  },
  {
    id: 'garden', labelKey: 'booth.frame.garden', motif: 'flowers',
    vars: { frame: '--c-accent-forest', frameShadow: '--c-ink-green', motif: '--c-flower-peach', motifAlt: '--c-flower-daisy', paper: '--c-cream-100', ink: '--c-cream-50', accent: '--c-flower-sunflower' },
  },
  {
    id: 'gingham', labelKey: 'booth.frame.gingham', motif: 'gingham',
    vars: { frame: '--c-blush-100', frameShadow: '--c-blush-400', motif: '--c-blush-400', motifAlt: '--c-cream-50', paper: '--c-cream-50', ink: '--c-berry-700', accent: '--c-berry-500' },
  },
];

export const frameById = (id: FrameId): FrameTheme => FRAMES.find((f) => f.id === id) ?? FRAMES[0]!;

export type Palette = { readonly [K in keyof FrameTheme['vars']]: string };

/** Resolve a theme's variables to concrete colours (computed on `el`, default the root). */
export function resolvePalette(theme: FrameTheme, el: Element = document.documentElement): Palette {
  const cs = getComputedStyle(el);
  const out = {} as Record<keyof FrameTheme['vars'], string>;
  for (const k of Object.keys(theme.vars) as (keyof FrameTheme['vars'])[]) out[k] = cs.getPropertyValue(theme.vars[k]).trim() || 'currentColor';
  return out;
}

/** `var(--x)` strings for DOM styling. */
export function paletteVars(theme: FrameTheme): Palette {
  const out = {} as Record<keyof FrameTheme['vars'], string>;
  for (const k of Object.keys(theme.vars) as (keyof FrameTheme['vars'])[]) out[k] = `var(${theme.vars[k]})`;
  return out;
}
