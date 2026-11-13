/**
 * Primitive geometry and the few FRAMEWORK §4.2 timings that have no named token yet
 * (owner: primitives). React-free; shared by the Director actions in this folder and the React
 * primitives in src/motion/react/primitives. Every number cites its §4.2 row. Durations that have a
 * token reference it, and choreography offsets are read from the generated specs, so nothing here
 * restates a token value.
 *
 * TODO(lead): these rows could move into motion-tokens.json → primitive (P01-P43) so build.py
 * checks them. Until then this file is their single home, and no component holds a literal.
 */
import { choreography, duration, flash, primitive, spring, stagger, ambient, hintLadder, prompt, booth, type Step } from '../tokens';

/** One 30 fps evidence frame (33 ms) and multiples of it (67 ms = 2 frames, 133 ms = 4 frames…). */
export const frames = (n: number): number => Math.round(n * (1000 / 30));

/** Find a step of a generated choreography by name (warns and falls back if the spec changed). */
export function stepOf(specId: keyof typeof choreography, name: string): Step {
  const s = (choreography[specId]?.steps as readonly Step[] | undefined)?.find((x) => x.name === name);
  if (s) return s;
  console.warn(`[params] ${String(specId)} has no step ${name}`);
  return { name, at: 0, dur: duration.crossfade, target: '', action: 'fade' };
}

export const P = {
  /** P01 stampPop: mount at opacity 1, scale spring.stamp.fromValue → 1; exit opacity-only 60-70 ms linear. */
  stampPop: { fromScale: spring.stamp.fromValue, exitMs: duration.micro, reducedMs: duration.xfast },
  /** P02 stickerPop: scale 0 → 1 on spring.sticker (or outBack 167 ms), opacity over the first 67 ms. */
  stickerPop: {
    opacityMs: frames(2), tweenMs: duration.quick,
    /** After a page change the first sticker mounts with C9.stickerMount (+140 ms); A3 fix: 80-120 ms stagger. */
    afterPageMs: stepOf('C9page', 'C9.stickerMount').at, staggerMs: frames(3),
  },
  /** P03 letterPop: opacity .18 → 1 in 67 ms; scale .93 (spring.letterPop.fromValue) → ~1.01 → 1. */
  letterPop: { fromOpacity: 0.18, opacityMs: frames(2), fromScale: spring.letterPop.fromValue, afterLayoutMs: frames(1) },
  /** P04 polaroidDeal: opacity 280 standard; y +5…+12 → 0; scale .90 → 1.02 → 1 over 120-160 ms; rotate tilt − 5° → tilt. */
  polaroidDeal: {
    opacityMs: duration.move, yFromPx: [5, 12] as const, scale: [0.9, 1.02, 1] as const, scaleTimes: [0, 0.6, 1] as const,
    scaleMs: frames(4.2), tiltFromDeg: -5, staggerMs: stagger.polaroidDeal, stackPx: 8, stackOnlyIfPhotosGt: 3,
  },
  /** P05 drawerSlide: one 560 ms drawer tween; opacity 360 ms outQuad; dock 610 ms; close 240 ms `in`; gap 19 px. */
  drawerSlide: {
    offX: 'calc(100% + 19px)', offY: '100%', opacityMs: frames(10.8), closeMs: duration.crossfade,
    reducedPx: 16, reducedMs: duration.base, sheetMaxWidthPx: 719,
  },
  /** P06 textBlurIn: short blur 4 → 0, 230-270 ms textIn; dreamy blur 10 → 0 over 1.8 s; low tier scale .98 → 1. */
  textBlurIn: { shortPx: 4, shortMs: frames(7.5), dreamyPx: 10, dreamyMs: frames(54), lowScale: 0.98 },
  /** P07 tooltipRise: opacity + y 1.25 px → 0, 167 ms outQuart. Exit is a micro exit (G4). */
  tooltipRise: { yPx: 1.25, ms: duration.quick, exitMs: duration.xfast },
  /** P08 timedPrompt: opacity 0 → .85 over 200 ms outQuad (prompt token). */
  timedPrompt: { opacity: prompt.opacity, ms: prompt.fadeMs, minAfterTapMs: prompt.minAfterTapMs },
  /** P10 whipOff: labels 120 ms; knot 67 ms `in`; hold 67-167; ribbon x +43 vw, rotate 11 → 33° over 133 ms inQuad. */
  whipOff: { labelsMs: frames(3.6), knotMs: frames(2), holdMs: frames(2), xVw: 43, rotateDeg: [11, 33] as const, ms: duration.fast },
  /** P12 curtainDrop (DOM): read from choreography C1b (y 0 → 105 vh, wash, fade, mask, unmount at 1530). */
  curtainDrop: stepOf('C1b', 'C1.curtainDrop').params as {
    readonly yVh: readonly [number, number]; readonly washFromMs: number; readonly washMs: number;
    readonly fadeFromMs: number; readonly fadeMs: number; readonly maskFromMs: number; readonly maskMs: number;
  },
  curtainFallMs: frames(42),
  /** P15 tapWobble: rotate [0, −2, 1.9, −1]° at [0, .33, .62, 1], 233 ms inOutSine; keeps −1°. */
  tapWobble: { rotate: [0, -2, 1.9, -1] as const, times: [0, 0.33, 0.62, 1] as const, ms: frames(7), floatResetMs: duration.xfast },
  /** P16 pressSquash: container (1.01, .995) on pointerdown, release 33-67 ms; pill .97 for 60-80 ms on pointerup. */
  pressSquash: { container: [1.01, 0.995] as const, pressMs: duration.frame, releaseMs: frames(1.5), pill: 0.97, pillMs: duration.micro },
  /** P17 hoverGrow: 1.06 small round buttons, 1.04 drawer pull. */
  hoverGrow: { button: 1.06, pull: 1.04 },
  /** P18 biteTap: heart charm 1-2 frames; crumbs 70-170 ms; caret note scale .86 → 1 over 70-100 ms; debounce 200. */
  biteTap: { charmMs: frames(2), crumbMs: [duration.micro, duration.quick] as const, noteFromScale: 0.86, noteMs: duration.xfast, debounceMs: stagger.debounce },
  /** P19 chromeNudge: x −9 px + scale 1.06 → 0 / 1 on spring.chromeNudge. */
  chromeNudge: { xPx: -9, fromScale: 1.06 },
  /** P20 activeSwap: colours swap over 150 ms outQuad. */
  activeSwap: { ms: frames(4.5) },
  /** P23 cameraFlash: from the flash tokens; the reduced envelope from flash.reduced. */
  cameraFlash: { camera: flash.camera, impact: flash.impact, reduced: flash.reduced, minIntervalMs: flash.minIntervalFullScreenMs, impactSteps: [0.6, 0.3, 0.07, 0] as const },
  /** P25 idleFloat. */
  idleFloat: ambient.float,
  /** P26 trapezoidSway. */
  trapezoidSway: ambient.swayTrapezoid,
  /** P27 pendulum: ±1° legs 0.9 / 1.47 s; impulse on spring.pendulum (P .93 s), then ±0.4° breeze at 4.8 s. */
  pendulum: { ...ambient.pendulum, impulseDeg: 3, breeze: ambient.breeze },
  /** P28 hintRing: scale 1 → 1.8 linear 800 ms; repeat every 1.2-1.6 s; ladder from tokens. */
  hintRing: { ...ambient.hintRing, repeatEveryMs: frames(42), ladder: hintLadder, diameterPx: 30 },
  /** P29 reelSpin: 360° per 1.1 s linear; reduced = half speed while playing. */
  reelSpin: { periodMs: ambient.reel.periodMs, reducedFactor: 0.5 },
  /** P32 pageCrossfade: read from C9page (out at 0, in at +20, 240 ms outCubic). */
  pageCrossfade: { outStep: stepOf('C9page', 'C9.pageOut'), inStep: stepOf('C9page', 'C9.pageIn') },
  /** P33 paperDipCrossfade: both layers 333 ms; out outQuad, in paperIn. */
  paperDip: { ms: duration.dip },
  /** P34 lidFlip3D: read from C2b (rotateX 0 → 180, box +18 vh, one inOutCubic 280 ms); perspective 700 px. */
  lidFlip: { step: stepOf('C2b', 'C2.lidFlip3D'), perspectivePx: 700 },
  /** P35 layoutMove: FLIP 280 ms inOutCubic. */
  layoutMove: { ms: duration.move },
  /** P36 sharedLightbox: C6open / C6close. Controls fade 200 ms from 430 ms; rotate −4 → −1°. */
  lightbox: {
    open: stepOf('C6open', 'C6.photoFlip'), close: stepOf('C6close', 'C6.photoFlipBack'),
    rotateDeg: [-4, -1] as const, controlsAtMs: duration.flip, controlsMs: duration.base,
  },
  /** P37 slotPrint + toss: print from C12print, toss arcs 367 / 600 ms, arc 26-51 px, tilt ±16° at ~60%. */
  slotPrint: { ms: stepOf('C12print', 'C12.print').dur, stripHeightsPerS: booth.product.printStripHeightsPerS },
  toss: { arcMs: [frames(11), duration.toss] as const, arcPx: [26, 51] as const, tiltDeg: 16, tiltAt: 0.6, fromScale: [spring.toss.fromValue, 0.36] as const, restDeg: [-3.6, 1.3, 4] as const },
  /** P42 typewriter: per-glyph fade ≤ 20 ms (half a frame); completion cue 600-1000 ms; per line 150 ms. */
  typewriter: { glyphFadeMs: frames(0.5), cueMs: frames(24), lineMs: frames(4.5) },
  /** P44 idleWobble. */
  idleWobble: primitive.idleWobble,
  /** P45 contentSwapInShell. */
  contentSwap: primitive.contentSwapInShell,
  /** P47 tokenDrop. */
  tokenDrop: primitive.tokenDrop,
  /** Every reduced pop / spring: opacity 200 ms outQuad (§4.5). */
  reducedMs: duration.base,
} as const;
