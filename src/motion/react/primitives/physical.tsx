/**
 * P10 whipOff · P12 curtainDrop (DOM layer) · P23 cameraFlash · P37 slotPrint + toss · P47 tokenDrop ·
 * P14 hardCut (owner: primitives). Physical things move linearly (G8).
 * TODO(primitives): implement; Toss uses a true quadratic Bézier evaluated on the shared ticker.
 */
import type { ReactNode } from 'react';
import type { BaseProps, OneShotProps } from './types';
import { StubBox, useStubDone } from './_stub';

/** P10: labels fade 120 ms, knot collapses 67 ms `in`, ribbon x ≈ +43 vw, rotate 11 → 33° over 133 ms inQuad. */
export function WhipOff(p: OneShotProps) { useStubDone(p.onDone, p.play, p.playKey); return <StubBox name="WhipOff" {...p} />; }
/** P12: y → 105 vh over 1400 ms curtainFall + wash + fade + mask; unmount at +1530. */
export function CurtainDrop(p: OneShotProps) { useStubDone(p.onDone, p.play, p.playKey); return <StubBox name="CurtainDrop" {...p} />; }

export interface CameraFlashProps extends BaseProps {
  /** Increment to fire one flash. */
  fire: number;
  kind?: 'camera' | 'impact';
  /** 'fullScreen' sits below the HUD; 'element' covers the parent (gift booth window). */
  scope?: 'fullScreen' | 'element';
  /** Called at the flash peak (grab the frame here). */
  onPeak?: () => void;
  onDone?: () => void;
}
/** P23: ≤1-frame rise to .85, linear decay 130-167 ms; reduced: peak .4, 200 ms, no shake/starburst. */
export function CameraFlash(p: CameraFlashProps) { useStubDone(p.onPeak, p.fire > 0, p.fire); return null; }

export interface SlotPrintProps extends OneShotProps {
  /** ms for the feed; default from booth.product.printStripHeightsPerS. */
  durationMs?: number;
}
/** P37a: linear feed inside an overflow:hidden slot (clip padding 0.25em). */
export function SlotPrint(p: SlotPrintProps) { useStubDone(p.onDone, p.play, p.playKey); return <StubBox name="SlotPrint" {...p} />; }

export interface TossProps extends OneShotProps {
  /** Start rect (the print slot) in viewport px; the element's own layout box is the target. */
  from: { x: number; y: number; scale: number };
  arcMs?: number;
  /** Rest tilt: −3.6° / +1.3° / +4°. */
  restDeg: number;
}
/** P37b: arc 367/600 ms, scale on spring.toss → 1.054 → 1, tilt ±16°·sign(dx) at ~60% unwinding to rest. */
export function Toss(p: TossProps) {
  useStubDone(p.onDone, p.play, p.playKey);
  return <StubBox name="Toss" className={p.className} style={{ ...p.style, rotate: `${p.restDeg}deg` }}>{p.children}</StubBox>;
}

/** P47: coin hard-cuts to a heart token that drops ≈ −4 vh with `in` over 70-100 ms and fades into the slot. */
export function TokenDrop(p: OneShotProps) { useStubDone(p.onDone, p.play, p.playKey); return <StubBox name="TokenDrop" {...p} />; }

/** P14: 0 ms swap. Renders `children` keyed by `value` so React swaps on the same frame (never tween a label). */
export function HardCut({ value, children }: { value: string | number; children: ReactNode }) {
  return <span key={value} data-cut={value}>{children}</span>;
}
