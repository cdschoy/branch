/**
 * HintRing (P28 visual; FRAMEWORK §3.6; owner: primitives): two 30 px rings, 1.5 px, pointer-events
 * none, removed on first interaction. Reduced motion: a static 2 px outline. STUB renders static rings.
 */
import './HintRing.css';
export interface HintRingProps {
  active: boolean;
  /** 'onArt' = white .6 over painted art; 'onCream' = blush ring .8 over cream. */
  tone?: 'onArt' | 'onCream';
  /** Ring diameter in px (default 30). */
  size?: number;
  className?: string;
}
export function HintRing({ active, tone = 'onCream', size = 30, className }: HintRingProps) {
  if (!active) return null;
  return <span className={`ui-hintring ui-hintring--${tone}${className ? ' ' + className : ''}`} style={{ width: size, height: size }} aria-hidden="true" data-stub="HintRing" />;
}
