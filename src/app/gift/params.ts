/**
 * Gift-scene numbers that have no named token yet (owner: gift). Same pattern as
 * src/motion/core/actions/params.ts: every value cites its FRAMEWORK row, durations reference a token,
 * and choreography offsets are read from the generated specs, so scene components hold no literal.
 *
 * TODO(lead): move these rows into motion-tokens.json (a `gift` block) so build.py checks them.
 */
import { choreography, duration, ambient, hintLadder, stagger, type Spec, type Step } from '../../motion/core';

/** Find a step of a generated spec by name. */
export function stepOf(spec: Spec, name: string): Step | undefined {
  return spec.steps.find((s) => s.name === name);
}

/** A new spec from a subset of another spec's steps, re-based so the first kept step is at `at0`. */
export function subSpec(spec: Spec, id: string, names: readonly string[], rebase = true): Spec {
  const steps = spec.steps.filter((s) => names.includes(s.name));
  const t0 = rebase ? Math.min(...steps.map((s) => s.at)) : 0;
  return { ...spec, id, steps: steps.map((s) => ({ ...s, at: s.at - t0 })) };
}

const C2a = choreography.C2a as Spec;
const C2tug = stepOf(C2a, 'C2.bowTug');

export const G = {
  /** §5.3 readEnough: typed AND dwell ≥ clamp(graphemes / 14 per s, 4 s, 25 s); a second early tap within 3 s is honoured. */
  readEnough: { graphemesPerSec: 14, minMs: 4000, maxMs: 25000, secondTapWindowMs: 3000 },
  /** C2 gesture: threshold 50 px; the scripted tap tug lasts the C2.bowTug step (367 ms); release under threshold relaxes 200 ms outQuad. */
  ribbon: {
    thresholdPx: 50,
    tugMs: C2tug?.dur ?? duration.toss,
    frames: 12,
    relaxMs: duration.base,
    /** Labels fade once progress passes .73 (C2.labelsOut params.atProgress). */
    labelsAtProgress: Number((stepOf(C2a, 'C2.labelsOut')?.params as { atProgress?: number } | undefined)?.atProgress ?? 0.73),
  },
  /** C2 treats: 3 treats × 2 bites (P18); the completion spread starts 1 frame after the goal (§5.1 advance rule). */
  treats: { count: 3, bitesEach: 2, advanceMs: duration.frame, twinkleMs: [330, 500] as const },
  /** C1 wall drift (ambient.wallDrift) on pre-rendered tiles; the tile strip is 2 stage heights tall. */
  wall: { vhPerSec: ambient.wallDrift.vhPerSec, tileVh: 100 },
  /** §5.1 hint ladder (re-exported for scenes). */
  ladder: hintLadder,
  /** G15: `common.skipEffects` appears 1 s into a spectacle; a stage tap fast-forwards ×3. */
  skipAfterMs: 1000,
  fastForward: 3,
  /** G17: secondary chrome hard-cuts in 700 ms after the spectacle settles; the CTA follows +200 ms. */
  chrome: { secondaryMs: 700, primaryMs: 200 },
  /** C7 hero throw: control point of the quadratic arc lifts 30% of the travel; settle moves 21% / 6% of the flower. */
  finale: { arcLift: 0.3, settleDx: 0.21, settleDy: 0.06 },
  /** Creator: preview runs ×3 (§5.2 create.preview.fastForward). */
  previewTimeScale: 3,
  /** Polaroid deal stagger (P04) for the envelope path's memories section. */
  dealStaggerMs: stagger.polaroidDeal,
} as const;

/** Creator media budget (§5.2 uploads, trimmed for the local URL-hash starter). */
export const MEDIA = {
  maxPhotos: 6,
  longEdgePx: 640,
  /** WebP q.72, JPEG fallback (EXIF dropped by construction: the canvas re-encode). */
  quality: 0.72,
  /** Total data-URL characters of all photos: warn above, refuse new photos above max. */
  warnChars: 300_000,
  maxChars: 1_400_000,
  captionGraphemes: 40,
  nameGraphemes: 24,
  bodyGraphemes: 1200,
} as const;
