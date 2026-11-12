/**
 * React wrappers over the fx canvas (owner: fx): P38 FlowerCurtain (modes) · P21 HeartBurst ·
 * P22 ConfettiFountain. They call the shared fx engine; inside a choreography use the Director's
 * canvas steps instead (same emitters). Off under reduced motion (§4.5): onDone fires immediately.
 */
import { useEffect, useRef, type RefObject } from 'react';
import { fx, type EmitterId } from '../../../fx';
import { useReducedMotion } from '../hooks';

export type CurtainMode = 'reveal' | 'wipe' | 'bloom' | 'flood';
const MODE: Record<CurtainMode, EmitterId> = { reveal: 'curtainReveal', wipe: 'curtainWipe', bloom: 'bloom', flood: 'flood' };

function useEmit(id: EmitterId, go: boolean, key: unknown, opts: { origin?: RefObject<Element | null>; seed?: string | number; params?: Record<string, unknown>; count?: number }, onDone?: () => void) {
  const reduced = useReducedMotion();
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (!go) return;
    if (reduced) { done.current?.(); return; }
    const h = fx.emit(id, { origin: opts.origin?.current ?? null, seed: opts.seed, params: opts.params, count: opts.count });
    void h.finished.then(() => done.current?.());
    return () => h.stop();
  }, [go, key, reduced]); // eslint-disable-line react-hooks/exhaustive-deps
}

export interface FlowerCurtainProps {
  mode: CurtainMode;
  go: boolean;
  playKey?: string | number;
  /** Seed with the gift id so preview, phone and OG match. */
  seed?: string | number;
  /** wipe: called at ≥70% cover so the caller swaps the scene under the cover. */
  onCover?: () => void;
  onDone?: () => void;
}
export function FlowerCurtain(p: FlowerCurtainProps) {
  useEmit(MODE[p.mode], p.go, p.playKey, { seed: p.seed }, p.onDone);
  // TODO(fx): fire onCover from the wipe emitter's coverage curve (≥70%); the stub fires it with onDone.
  useEffect(() => { if (p.go) p.onCover?.(); }, [p.go, p.playKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export interface BurstProps { go: boolean; playKey?: string | number; origin?: RefObject<Element | null>; count?: number; seed?: string | number; onDone?: () => void }
/** P21: 13-15 hearts (6 low tier). */
export function HeartBurst(p: BurstProps) { useEmit('hearts', p.go, p.playKey, p, p.onDone); return null; }
/** P22: 11-15 flakes (8 low), stage canvas, starts +33 ms after landing. */
export function ConfettiFountain(p: BurstProps) { useEmit('confetti', p.go, p.playKey, p, p.onDone); return null; }
