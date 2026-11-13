/**
 * Looks (FRAMEWORK §5.4 "CPU LUT filter"; owner: booth). React-free.
 *
 * Each look is a per-channel tone curve (piecewise-linear table, the same semantics as SVG
 * feComponentTransfer type="table") followed by a saturation matrix (feColorMatrix type="saturate").
 * The compositor bakes the curve into a 256-entry LUT per channel and applies it on the CPU, so the
 * exported PNG is bit-identical everywhere. The live preview uses the SAME numbers as an SVG filter
 * (color-interpolation-filters sRGB), so preview and export match closely.
 * Starter simplification: 1D curves + saturation instead of the 17³ 3D LUT (seam: replace bake()).
 */
import type { StringKey } from '../i18n';

export type FilterId = 'natural' | 'milk' | 'peach' | 'film' | 'bw';

export interface FilterDef {
  readonly id: FilterId;
  readonly labelKey: StringKey;
  /** Output values at evenly spaced inputs 0…1, per channel. */
  readonly r: readonly number[];
  readonly g: readonly number[];
  readonly b: readonly number[];
  /** feColorMatrix saturate value (1 = unchanged, 0 = greyscale). */
  readonly saturate: number;
}

const ID = [0, 0.25, 0.5, 0.75, 1] as const;

export const FILTERS: readonly FilterDef[] = [
  { id: 'natural', labelKey: 'booth.filter.natural', r: ID, g: ID, b: ID, saturate: 1 },
  { id: 'milk', labelKey: 'booth.filter.milk', r: [0.1, 0.33, 0.58, 0.81, 0.98], g: [0.09, 0.31, 0.56, 0.79, 0.96], b: [0.08, 0.28, 0.52, 0.75, 0.92], saturate: 0.82 },
  { id: 'peach', labelKey: 'booth.filter.peach', r: [0.05, 0.31, 0.57, 0.8, 1], g: [0.02, 0.25, 0.5, 0.74, 0.96], b: [0.04, 0.23, 0.46, 0.7, 0.92], saturate: 1.06 },
  { id: 'film', labelKey: 'booth.filter.film', r: [0.08, 0.27, 0.53, 0.78, 0.94], g: [0.1, 0.29, 0.53, 0.76, 0.92], b: [0.12, 0.28, 0.48, 0.7, 0.86], saturate: 0.78 },
  { id: 'bw', labelKey: 'booth.filter.bw', r: [0.03, 0.2, 0.5, 0.8, 0.98], g: [0.03, 0.2, 0.5, 0.8, 0.98], b: [0.03, 0.2, 0.5, 0.8, 0.98], saturate: 0 },
];

export const filterById = (id: FilterId): FilterDef => FILTERS.find((f) => f.id === id) ?? FILTERS[0]!;

function table(values: readonly number[], c: number): number {
  const n = values.length - 1;
  const k = Math.min(n - 1, Math.floor(c * n));
  const v0 = values[k]!, v1 = values[k + 1]!;
  return v0 + (c * n - k) * (v1 - v0);
}

export interface BakedLut { readonly r: Uint8ClampedArray; readonly g: Uint8ClampedArray; readonly b: Uint8ClampedArray; readonly m: Float32Array; readonly identity: boolean }

/** Bake a look into 3×256 curve LUTs + the 3×3 saturate matrix. */
export function bake(f: FilterDef): BakedLut {
  const mk = (vals: readonly number[]) => { const a = new Uint8ClampedArray(256); for (let i = 0; i < 256; i++) a[i] = Math.round(table(vals, i / 255) * 255); return a; };
  const s = f.saturate;
  const m = new Float32Array([
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ]);
  return { r: mk(f.r), g: mk(f.g), b: mk(f.b), m, identity: f.id === 'natural' };
}

/** Apply in place to RGBA pixels. */
export function applyLut(px: Uint8ClampedArray, lut: BakedLut): void {
  if (lut.identity) return;
  const { r: R, g: G, b: B, m } = lut;
  for (let i = 0; i < px.length; i += 4) {
    const r = R[px[i]!]!, g = G[px[i + 1]!]!, b = B[px[i + 2]!]!;
    px[i] = m[0]! * r + m[1]! * g + m[2]! * b;
    px[i + 1] = m[3]! * r + m[4]! * g + m[5]! * b;
    px[i + 2] = m[6]! * r + m[7]! * g + m[8]! * b;
  }
}

/** Data for the preview's SVG <filter> (same numbers as the CPU path). */
export function svgFilterData(f: FilterDef): { r: string; g: string; b: string; saturate: string } {
  const j = (a: readonly number[]) => a.join(' ');
  return { r: j(f.r), g: j(f.g), b: j(f.b), saturate: String(f.saturate) };
}
