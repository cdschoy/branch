import type { EmitterDef, EmitterId } from './types';
import type { Tier } from '../motion/core/tokens';

/** Placeholder emitter: draws nothing, flagged `stub` so the bridge declines it. Replace per file. */
export function stubEmitter(id: EmitterId, count: (tier: Tier) => number, durationMs: number): EmitterDef {
  return { id, stub: true, count, create: (init) => ({ count: 0, durationMs: init.durMs ?? durationMs, sprite: () => false }) };
}
