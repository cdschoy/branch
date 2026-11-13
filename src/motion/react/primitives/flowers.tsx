/**
 * React wrappers over the fx canvas (owner: fx): P38 FlowerCurtain (modes) · P21 HeartBurst ·
 * P22 ConfettiFountain. They call the shared fx engine; inside a choreography use the Director's
 * canvas steps instead (same emitters).
 *
 * Reduced motion (§4.5): the emitters themselves swap in their reduced variants — curtains become a
 * 300 ms crossfade on a static flower frame (onCover still fires, at ≥70% cover), hearts become one
 * static heart fading in/out, confetti is off (onDone on the next frame).
 */
import { useEffect, useRef, type RefObject } from 'react';
import { fx, type EmitterId } from '../../../fx';
import { probeEmitter, rectOf } from '../../../fx/bridge';
import { useReducedMotion } from '../hooks';

export type CurtainMode = 'reveal' | 'wipe' | 'bloom' | 'flood';
const MODE: Record<CurtainMode, EmitterId> = { reveal: 'curtainReveal', wipe: 'curtainWipe', bloom: 'bloom', flood: 'flood' };

interface EmitHookOpts {
  origin?: RefObject<Element | null>;
  seed?: string | number;
  params?: Record<string, unknown>;
  count?: number;
  onCover?: () => void;
}

function useEmit(id: EmitterId, go: boolean, key: unknown, opts: EmitHookOpts, onDone?: () => void) {
  const reduced = useReducedMotion();
  const cbs = useRef({ onDone, onCover: opts.onCover });
  cbs.current = { onDone, onCover: opts.onCover };
  useEffect(() => {
    if (!go) return;
    const el = opts.origin?.current ?? null;
    const rect = rectOf(el);
    const emitOpts = {
      origin: el, seed: opts.seed, count: opts.count, reduced,
      params: { ...(rect ? { rect } : {}), ...opts.params },
    };
    let alive = true;
    // swap point from the emitter's own coverage curve (closed form, same seed → same timing)
    let coverAt: number | undefined;
    if (cbs.current.onCover) {
      const probe = probeEmitter(fx, id, emitOpts);
      coverAt = probe?.coverAtMs ?? 0;
    }
    const h = fx.emit(id, emitOpts);
    let covered = false;
    const fireCover = () => { if (!covered && alive) { covered = true; cbs.current.onCover?.(); } };
    let raf = 0;
    if (coverAt !== undefined) {
      if (coverAt <= 0) fireCover();
      else {
        const poll = () => { if (!alive) return; if (h.time >= coverAt!) fireCover(); else raf = requestAnimationFrame(poll); };
        raf = requestAnimationFrame(poll);
      }
    }
    void h.finished.then(() => { if (!alive) return; fireCover(); cbs.current.onDone?.(); });
    return () => { alive = false; cancelAnimationFrame(raf); h.stop(); };
  }, [go, key, reduced]); // eslint-disable-line react-hooks/exhaustive-deps
}

export interface FlowerCurtainProps {
  mode: CurtainMode;
  go: boolean;
  playKey?: string | number;
  /** Seed with the gift id so preview, phone and OG match. */
  seed?: string | number;
  /** Bloom origin (default: viewport centre). */
  origin?: RefObject<Element | null>;
  /** Called once the curtain hides ≥70% of the viewport, so the caller swaps the scene under the cover. */
  onCover?: () => void;
  onDone?: () => void;
}
export function FlowerCurtain(p: FlowerCurtainProps) {
  useEmit(MODE[p.mode], p.go, `${p.mode}:${p.playKey ?? ''}`, { seed: p.seed, origin: p.origin, onCover: p.onCover }, p.onDone);
  return null;
}

export interface BurstProps { go: boolean; playKey?: string | number; origin?: RefObject<Element | null>; count?: number; seed?: string | number; onDone?: () => void }
/** P21: 13-15 hearts (6 low tier). */
export function HeartBurst(p: BurstProps) { useEmit('hearts', p.go, p.playKey, p, p.onDone); return null; }
/** P22: 11-15 flakes (8 low), stage canvas, starts +33 ms after landing. */
export function ConfettiFountain(p: BurstProps) { useEmit('confetti', p.go, p.playKey, p, p.onDone); return null; }
