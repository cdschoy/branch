/** Shared prop shapes for primitives (owner: primitives; signatures frozen by scaffold). */
import type { CSSProperties, ReactNode } from 'react';

export interface BaseProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
/** One-shot primitives play when `play` becomes true (default: on mount). Changing `playKey` replays. */
export interface OneShotProps extends BaseProps {
  play?: boolean;
  playKey?: string | number;
  /** Called once when the primitive settles (reduced variants call it too). */
  onDone?: () => void;
}
/** Loops run while `active` (default true) and stop on the first interaction (caller sets active=false). */
export interface LoopProps extends BaseProps {
  active?: boolean;
}
