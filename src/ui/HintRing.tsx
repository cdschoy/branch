/**
 * HintRing (P28 visual; FRAMEWORK §3.6; owner: primitives): two 30 px rings, 1.5 px, pointer-events
 * none, centred on the positioned parent, removed on first interaction (caller sets active=false, or
 * pass `ladder` to follow the hint ladder: ring from +1.2 s, double cadence from +8 s, cancelled by
 * the first touch anywhere). Reduced motion: a static 2 px outline.
 */
import './HintRing.css';
import { HintPulse, useHintLadder } from '../motion/react/primitives/ambient';

export interface HintRingProps {
  active: boolean;
  /** 'onArt' = white .6 over painted art; 'onCream' = blush ring .8 over cream. */
  tone?: 'onArt' | 'onCream';
  /** Ring diameter in px (default 30). */
  size?: number;
  className?: string;
  /** Follow tokens.hintLadder from the moment `active` turns true (default false: show at once). */
  ladder?: boolean;
}

export function HintRing({ active, tone = 'onCream', size = 30, className, ladder = false }: HintRingProps) {
  const stage = useHintLadder(active && ladder);
  if (!active) return null;
  if (ladder && (stage === 'ambient' || stage === 'cancelled')) return null;
  const double = ladder && (stage === 'double' || stage === 'retype');
  return (
    <span className={`ui-hintring${className ? ' ' + className : ''}`} aria-hidden="true" data-stage={ladder ? stage : 'ring'}>
      <HintPulse tone={tone} size={size} double={double || !ladder} />
    </span>
  );
}
