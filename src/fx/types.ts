/**
 * fx engine contracts (owner: scaffold; emitters owned by fx). React-free.
 *
 * An emitter is CLOSED-FORM: `create()` precomputes per-sprite constants from the seed; `sprite(i, t, out)`
 * writes sprite i's state at local time t (ms) into a reused object, with no allocation and no per-frame
 * state, so the Director can scrub it and ×3 preview is exact (FRAMEWORK §4.2, §7.3).
 */
import type { Tier } from '../motion/core/tokens';
import type { Rng } from './rng';

export type EmitterId =
  | 'curtainReveal' | 'curtainWipe' | 'curtainDrop' | 'bloom' | 'flood'
  | 'confetti' | 'hearts' | 'petals' | 'echoTrail' | 'rays' | 'burstMound' | 'example'
  | (string & {});

/** Built-in procedural shapes (src/fx/shapes.ts). Emitters may register more with registerShape(). */
export type ShapeId = 'dot' | 'heart' | 'petal' | 'flower' | 'confetti' | 'star4' | 'leaf' | (string & {});

/** One sprite's state at time t. CSS px in viewport space; rot in radians. */
export interface Sprite {
  x: number; y: number; rot: number; scale: number; alpha: number;
  /** Base size in CSS px (the bitmap is cached per shape × colour × size bucket). */
  size: number;
  shape: ShapeId;
  /** A CSS custom property name from tokens.css ('--c-flower-peony-coral', '--t-accent') or a resolved colour. */
  color: string;
}

export interface Viewport { readonly w: number; readonly h: number; readonly dpr: number }

export interface EmitterInit<P = Record<string, unknown>> {
  readonly seed: number;
  /** mulberry32(seed), fresh for this emission. */
  readonly rng: Rng;
  readonly params: P;
  readonly view: Viewport;
  /** Emission origin in CSS px (target element centre, or viewport centre). */
  readonly origin: { readonly x: number; readonly y: number };
  readonly tier: Tier;
  readonly reduced: boolean;
  /** Sprite count after the tier budget (budgets.* in motion.ts). */
  readonly count: number;
  /** Requested duration (the step's dur) if any. */
  readonly durMs?: number;
}

export interface EmitterInstance {
  readonly count: number;
  readonly durationMs: number;
  /** Write sprite i at local time t into `out`; return false when it is not visible. Pure. */
  sprite(i: number, t: number, out: Sprite): boolean;
  /** Optional whole-layer pass before sprites (clip rect for a mask sweep, wash fill). */
  before?(g: CanvasRenderingContext2D, t: number, view: Viewport): void;
  /** Optional whole-layer pass after sprites (globalAlpha fade, mean-colour wash). */
  after?(g: CanvasRenderingContext2D, t: number, view: Viewport): void;
}

export interface EmitterDef<P = Record<string, unknown>> {
  readonly id: EmitterId;
  /** true while the emitter is a placeholder; the bridge then declines its actions. */
  readonly stub?: boolean;
  /** Sprite count for a tier (read budgets from motion.ts, e.g. budgets.bloomSprites[tier]). */
  count(tier: Tier, params: P): number;
  create(init: EmitterInit<P>): EmitterInstance;
}

export interface EmitOptions {
  readonly seed?: number | string;
  readonly params?: Readonly<Record<string, unknown>>;
  /** CSS px point, a DOMRect or an element (its centre). Default: viewport centre. */
  readonly origin?: { x: number; y: number } | DOMRect | Element | null;
  readonly count?: number;
  readonly tier?: Tier;
  readonly reduced?: boolean;
  readonly durMs?: number;
  /** true (default): the engine advances time on the ticker. false: the caller seeks (Director bridge). */
  readonly autoplay?: boolean;
  readonly speed?: number;
}

export interface FxHandle {
  readonly id: EmitterId;
  readonly durationMs: number;
  readonly time: number;
  readonly finished: Promise<void>;
  seek(ms: number): void;
  pause(): void;
  resume(): void;
  setSpeed(x: number): void;
  /** Remove from the canvas now. */
  stop(): void;
}

export interface FxEngine {
  /** Attach the full-viewport canvas (FxCanvas does this); returns detach. */
  attach(canvas: HTMLCanvasElement): () => void;
  emit(id: EmitterId, opts?: EmitOptions): FxHandle;
  /** Stop every emission. */
  clear(): void;
  /** Element whose computed style resolves colour variables (a scene root with data-theme). */
  setThemeElement(el: Element | null): void;
  readonly view: Viewport;
  readonly activeCount: number;
}
