/**
 * CountdownStamp (FRAMEWORK §3.6, C3; owner: primitives): 72 px disc (clamp 64-96; 'lg' = 120 px over
 * the booth preview), Paytone One numeral; each digit enters with P01 stampPop; final state is the
 * booth.smile string in Mali 500. STUB renders the static disc.
 */
import './CountdownStamp.css';
export interface CountdownStampProps {
  /** A digit, 'smile' (booth.smile), or null (hidden). */
  value: number | 'smile' | null;
  size?: 'md' | 'lg';
  /** Text for the 'smile' state (pass t('booth.smile')). */
  smileText?: string;
  className?: string;
}
export function CountdownStamp({ value, size = 'md', smileText, className }: CountdownStampProps) {
  if (value === null) return null;
  return (
    <div className={`ui-stamp ui-stamp--${size}${className ? ' ' + className : ''}`} role="timer" aria-live="assertive" data-stub="CountdownStamp">
      {value === 'smile' ? <span className="ui-stamp__smile">{smileText}</span> : <span className="ui-stamp__digit">{value}</span>}
    </div>
  );
}
