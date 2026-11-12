/**
 * Director → fx bridge (owner: fx). Maps canvas ActionIds to emitters; the Director seeks the returned
 * control every tick with step-local time (handles are created with autoplay: false).
 */
import type { ActionId, FxBridge, StepContext, StepControl } from '../motion/core/types';
import type { EmitterId, FxEngine } from './types';
import { getEmitter } from './registry';

const CURTAIN_MODE: Record<string, EmitterId> = { reveal: 'curtainReveal', wipe: 'curtainWipe', flood: 'flood', bloom: 'bloom' };

/** Which emitter renders this step (undefined → not a canvas step). */
export function emitterFor(action: ActionId, params: Readonly<Record<string, unknown>> = {}): EmitterId | undefined {
  switch (action) {
    case 'bloomBurst': return 'bloom';
    case 'flowerCurtain': return CURTAIN_MODE[String(params.mode ?? 'reveal')];
    case 'confettiFountain': return 'confetti';
    case 'heartBurst': return 'hearts';
    case 'petalField': return 'petals';
    case 'fxEmit': return typeof params.emitter === 'string' ? params.emitter : undefined;
    default: return undefined;
  }
}

export function createFxBridge(engine: FxEngine): FxBridge {
  return {
    handles(action: ActionId, ctx: StepContext) {
      const id = emitterFor(action, ctx.step.params);
      const def = id ? getEmitter(id) : undefined;
      return !!def && !def.stub;
    },
    run(ctx: StepContext): StepControl {
      const id = emitterFor(ctx.step.action, ctx.step.params)!;
      const h = engine.emit(id, {
        seed: ctx.seed, params: { ...ctx.step.params, ease: ctx.step.ease }, origin: ctx.el, tier: ctx.tier,
        reduced: ctx.reduced, durMs: ctx.step.dur, autoplay: false,
      });
      return {
        seek: (ms) => h.seek(ms),
        finish: () => { h.seek(h.durationMs); h.stop(); },
        revert: () => h.stop(),
        cancel: () => h.stop(),
      };
    },
  };
}
