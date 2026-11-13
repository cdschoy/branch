/**
 * Pill (FRAMEWORK §3.6; owner: primitives). Status pills hard-cut their text (P14: keyed swap, width
 * snaps, no tween). Status / hint pills take lowercase booth.pill.* / gift.pill.* strings verbatim —
 * never CSS-transform. Button pills get P16 pressSquash (.97 for 70 ms on pointerup).
 */
import './Pill.css';
import type { ReactNode } from 'react';
import { usePressSquash } from '../motion/react/primitives/gestures';

export type PillVariant = 'status' | 'hint' | 'link' | 'action';
export interface PillProps {
  variant: PillVariant;
  children: ReactNode;
  /** Renders a <button> when given, else a <span>. P16 pressSquash (.97 on pointerup) applies to buttons. */
  onClick?: () => void;
  /** Inline ✦ glyph after the text. */
  sparkle?: boolean;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

const textKey = (c: ReactNode): string => (typeof c === 'string' || typeof c === 'number' ? String(c) : '');

export function Pill({ variant, children, onClick, sparkle, ariaLabel, className, disabled }: PillProps) {
  const squash = usePressSquash('pill');
  const cls = `ui-pill ui-pill--${variant}${className ? ' ' + className : ''}`;
  // Keyed by the text so a status change is a same-frame swap (hard cut), never a tween.
  const body = <span key={textKey(children)} className="ui-pill__text">{children}{sparkle ? <span aria-hidden="true" className="ui-pill__sparkle">✦</span> : null}</span>;
  return onClick
    ? <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel} disabled={disabled} {...(disabled ? {} : squash)}>{body}</button>
    : <span className={cls} aria-label={ariaLabel} role={variant === 'status' ? 'status' : undefined}>{body}</span>;
}
