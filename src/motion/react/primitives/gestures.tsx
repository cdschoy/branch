/**
 * P15 tapWobble · P16 pressSquash · P17 hoverGrow · P18 biteTap (owner: primitives).
 * Hooks return handlers to spread on the tap target so the answer lands on the same frame (rule 2).
 * TODO(primitives): implement with motion/react `useAnimate`; reduced keeps the same-frame swap.
 */
import { useCallback, type PointerEventHandler, type RefObject } from 'react';
import type { BaseProps } from './types';
import { StubBox } from './_stub';

/** P15: rotate [0, −2, 1.9, −1]° at [0, .33, .62, 1] over 233 ms inOutSine; keeps −1°. Returns a trigger. */
export function useTapWobble(_ref: RefObject<Element | null>): () => Promise<void> {
  return useCallback(() => Promise.resolve(), []);
}

/** P16: containers scale (1.01, .995) on pointerdown; UI pills scale .97 for 60-80 ms on pointerup. */
export function usePressSquash(_kind: 'container' | 'pill'): { onPointerDown?: PointerEventHandler; onPointerUp?: PointerEventHandler; onPointerCancel?: PointerEventHandler } {
  return {};
}

export interface HoverGrowProps extends BaseProps {
  /** 1.06 for small round buttons, 1.04 for the drawer pull; @media (hover:hover) only. */
  amount?: 'button' | 'pull';
}
export function HoverGrow(p: HoverGrowProps) { return <StubBox name="HoverGrow" {...p} />; }

export interface BiteTapProps extends BaseProps {
  /** Bites taken so far for this item; the sprite swaps on the same frame. */
  bites: number;
  /** Treats remaining (drives gift.treats.left on the first bite). */
  remaining: number;
  onBite: () => void;
  ariaLabel: string;
}
/** P18: same-frame sprite swap, heart charm, crumb sparkles 70-170 ms, container squash; debounce 200 ms. */
export function BiteTap(p: BiteTapProps) {
  return <button type="button" className={p.className} style={p.style} aria-label={p.ariaLabel} onClick={p.onBite} data-stub="BiteTap">{p.children}</button>;
}
