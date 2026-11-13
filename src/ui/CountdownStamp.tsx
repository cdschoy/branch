/**
 * CountdownStamp (FRAMEWORK §3.6, C3; owner: primitives): 72 px disc (clamp 64-96; 'lg' = 120 px over
 * the booth preview), Paytone One numeral, inner dashed ring, no rotation. Each value enters with
 * P01 stampPop (mounts at 1.12 on spring.stamp, dips ~2.6 %, settles) and leaves opacity-only in
 * 70 ms; the final state is the booth.smile string in Mali 500. Reduced: opacity-only 100 ms.
 */
import './CountdownStamp.css';
import { AnimatePresence } from 'motion/react';
import { StampPop } from '../motion/react/primitives/pops';

export interface CountdownStampProps {
  /** A digit, 'smile' (booth.smile), or null (hidden). */
  value: number | 'smile' | null;
  size?: 'md' | 'lg';
  /** Text for the 'smile' state (pass t('booth.smile')). */
  smileText?: string;
  className?: string;
}

export function CountdownStamp({ value, size = 'md', smileText, className }: CountdownStampProps) {
  return (
    <div className={`ui-stamp-slot ui-stamp-slot--${size}${className ? ' ' + className : ''}`} role="timer" aria-live="assertive" aria-atomic="true">
      <AnimatePresence initial={true}>
        {value === null ? null : (
          <StampPop key={String(value)} className={`ui-stamp ui-stamp--${size}`}>
            {value === 'smile' ? <span className="ui-stamp__smile">{smileText}</span> : <span className="ui-stamp__digit">{value}</span>}
          </StampPop>
        )}
      </AnimatePresence>
    </div>
  );
}
