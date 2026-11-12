/**
 * Director contracts (FRAMEWORK §7.3; owner: scaffold). React-free. These types are the stable API
 * between the Director, the action implementations (primitives builder), the fx bridge (fx builder)
 * and the scenes (gift / booth builders). Change them only through the lead.
 */
import type { AnimationPlaybackControls, DOMKeyframesDefinition, AnimationOptions } from 'motion';
import type { Spec, Step, Tier, ActionId } from './tokens';

export type { Spec, Step, Tier, ActionId };

/** Imperative handle for one running step. Every member is optional; the Director drives time. */
export interface StepControl {
  /** Jump to `localMs` (ms since the step's `at`, may exceed `dur`). Called on scrub, skip and drift. */
  seek?(localMs: number): void;
  pause?(): void;
  resume?(): void;
  setSpeed?(timeScale: number): void;
  /** Apply the end state now (skip / run end). */
  finish?(): void;
  /** Undo the step (backward scrub past `at`). */
  revert?(): void;
  /** Stop and release resources (run cancelled / replaced). */
  cancel?(): void;
  /** If true the Director leaves it running after the run finishes (e.g. wall drift, ambient). */
  readonly persistent?: boolean;
}

/** What a step implementation knows. */
export interface StepContext {
  readonly step: Step;
  readonly spec: Spec;
  /** Resolved target element (null for pure state/canvas steps). */
  readonly el: Element | null;
  readonly targetName: string;
  readonly reduced: boolean;
  readonly tier: Tier;
  readonly timeScale: number;
  /** Deterministic seed for this run (fx sprites are f(index, t, seed)). */
  readonly seed: number;
  /** Run-level data from PlayOptions.data (photo count, strings, gift id …). */
  readonly data: Readonly<Record<string, unknown>>;
}

/** A step callback, used for state steps (setState at the offset) and for custom renderers. */
export type StepFn = (ctx: StepContext) => StepControl | void;

/**
 * One target. Either an element, a React ref object, a step callback, or a binding with both.
 * With a binding, `run` is called first (as an observer, e.g. to swap a label); if it returns a
 * StepControl that becomes the step, otherwise the DOM action implementation runs on `el`.
 */
export interface TargetBinding { readonly el?: Element | null | { readonly current: Element | null }; readonly run?: StepFn }
export type TargetRef = Element | { readonly current: Element | null } | StepFn | TargetBinding | null | undefined;
/** Step `target` names → refs. A compound target "scrim+letter" resolves each part. */
export type TargetMap = Readonly<Record<string, TargetRef>>;

/** A plan the Director turns into Motion `animate(el, keyframes, transition)` (WAAPI where possible). */
export interface DomAnimationPlan {
  /** Defaults to ctx.el. Use to animate a child (e.g. the two layers of a paper dip). */
  readonly el?: Element;
  readonly keyframes: DOMKeyframesDefinition;
  readonly transition: AnimationOptions;
}

/**
 * Implementation of an ActionId for DOM targets (primitives builder: src/motion/core/actions/*.ts).
 * Return a plan (or several), a custom StepControl, or nothing for an instant change.
 * Must honour `ctx.reduced` (§4.5) and read every number from tokens.
 */
export type DomActionImpl = (el: HTMLElement | SVGElement, ctx: StepContext) => DomAnimationPlan | readonly DomAnimationPlan[] | StepControl | void;
export type ActionImplMap = Partial<Record<ActionId, DomActionImpl>>;

/** Canvas steps go through this bridge (implemented in src/fx/bridge.ts). */
export interface FxBridge {
  /** Asked for every step before the DOM registry: does the fx canvas render this action? (bloomBurst, flowerCurtain, confettiFountain, heartBurst, petalField, fxEmit …) */
  handles(action: ActionId, ctx: StepContext): boolean;
  /** Start the effect; the Director seeks it every tick with the step-local time. */
  run(ctx: StepContext): StepControl;
}

export interface PlayOptions {
  /** ×3 for the creator preview, a stage tap fast-forwards (G15). Default 1. */
  readonly timeScale?: number;
  /** Default: isReducedMotion(). */
  readonly reduced?: boolean;
  /** Default: getTier(). */
  readonly tier?: Tier;
  /** Default: hash of spec.id. Use hashSeed(giftId) so preview, phone and OG match. */
  readonly seed?: number;
  readonly data?: Readonly<Record<string, unknown>>;
  /** Hand-written reduced variant; otherwise reduceSpec(spec). */
  readonly reducedSpec?: Spec;
  /** Asset preload before t0 (G6). Default: the director's loader (see setAssetLoader). */
  readonly preload?: (assets: readonly string[]) => Promise<void>;
  /** Max wait for preload before starting anyway. Default 1500 ms. */
  readonly preloadTimeoutMs?: number;
  /** Start paused (gesture clocks always start paused at 0). */
  readonly paused?: boolean;
  /** G18 frame-drop breaker; default true for spectacles (specs with a canvas step or ≥1400 ms). */
  readonly circuitBreaker?: boolean;
  /** Step lifecycle events (QA labels, analytics). */
  readonly onStep?: (step: Step, phase: 'start' | 'end') => void;
}

export interface Run {
  /** Resolves when every step has ended (or after skip()). Drives prompts and CHOREO_DONE. Never rejects. */
  readonly finished: Promise<void>;
  /** Resolves at t0 (after preload). */
  readonly started: Promise<void>;
  /** Jump to the end state. */
  skip(): void;
  pause(): void;
  resume(): void;
  /** Seek to run time `ms` (forward starts pending steps; backward reverts later steps). */
  seek(ms: number): void;
  /** Seek to a step by name, e.g. 'C2.lidFlip3D' (jump to label). */
  seekTo(stepName: string): void;
  setTimeScale(x: number): void;
  /** Stop without applying end states (scene torn down). `finished` still resolves. */
  cancel(): void;
  readonly time: number;
  readonly duration: number;
  readonly spec: Spec;
  readonly state: 'preloading' | 'running' | 'paused' | 'finished' | 'cancelled';
}

export interface Director {
  play(spec: Spec, refs: TargetMap, opts?: PlayOptions): Run;
  /** Global time scale multiplier (preview ×3). */
  timeScale: number;
  /** Set when the breaker tripped: the next spectacle runs as a 300 ms crossfade. */
  degradeNext: boolean;
  setFx(fx: FxBridge | null): void;
  setAssetLoader(fn: (assets: readonly string[]) => Promise<void>): void;
  /** Register DOM action implementations (also auto-collected from src/motion/core/actions/*.ts). */
  registerActions(map: ActionImplMap): void;
}
