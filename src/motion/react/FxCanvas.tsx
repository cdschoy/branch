/**
 * Full-viewport, DPR-aware fx canvas layer (owner: scaffold). Mount ONCE in the app shell; it attaches
 * the shared fx engine and wires it into the Director. Sits at z-index var(--z-stage-fx), no pointer
 * events. Scenes emit through `director.play` (canvas steps) or `useFx()`.
 */
import { useEffect, useRef } from 'react';
import { director } from '../core';
import { fx, createFxBridge, type FxEngine } from '../../fx';

export function FxCanvas({ engine = fx }: { engine?: FxEngine }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const detach = engine.attach(ref.current);
    director.setFx(createFxBridge(engine));
    return () => { detach(); director.setFx(null); };
  }, [engine]);
  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" data-testid="fx-canvas" />;
}

/** The shared fx engine for direct emits: `useFx().emit('hearts', { origin: el })`. */
export const useFx = (): FxEngine => fx;
