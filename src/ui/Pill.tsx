/**
 * Pill (FRAMEWORK §3.6; owner: primitives). Status pills hard-cut their text (width snaps, no tween).
 * Status / hint pills take lowercase booth.pill.* / gift.pill.* strings verbatim — never CSS-transform.
 */
import './Pill.css';
import type { ReactNode } from 'react';

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

export function Pill({ variant, children, onClick, sparkle, ariaLabel, className, disabled }: PillProps) {
  const cls = `ui-pill ui-pill--${variant}${className ? ' ' + className : ''}`;
  const body = <>{children}{sparkle ? <span aria-hidden="true"> ✦</span> : null}</>;
  return onClick
    ? <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel} disabled={disabled}>{body}</button>
    : <span className={cls} aria-label={ariaLabel} role={variant === 'status' ? 'status' : undefined}>{body}</span>;
}
