/**
 * LetterCard (FRAMEWORK §3.6, C4; owner: gift): min(88vw, 360px), aspect .77, paper + grain, −1.5°
 * tilt, washi tape; eyebrow gift.letter.eyebrow in caps via upperVi(); body Mali 18/30 on ruled lines
 * (typed with P42 when `typing`); Playwrite VN signature. STUB renders static text.
 */
import './LetterCard.css';
import { upperVi, nfc } from '../i18n';
import type { LetterFont } from '../gift-schema';

export interface LetterCardProps {
  /** Already-resolved eyebrow text (t('gift.letter.eyebrow', {}, voice)). Rendered with upperVi. */
  eyebrow: string;
  greeting: string;
  body: string;
  signature: string;
  font?: LetterFont;
  /** Type the body with the typewriter (first open only). */
  typing?: boolean;
  onTypingDone?: () => void;
  className?: string;
}
export function LetterCard({ eyebrow, greeting, body, signature, className }: LetterCardProps) {
  return (
    <article className={`ui-letter${className ? ' ' + className : ''}`} data-stub="LetterCard">
      <span className="ui-letter__tape" aria-hidden="true" />
      <p className="ui-letter__eyebrow">{upperVi(eyebrow)}</p>
      <p className="ui-letter__greeting">{nfc(greeting)}</p>
      <p className="ui-letter__body">{nfc(body)}</p>
      <p className="ui-letter__signature">{nfc(signature)}</p>
    </article>
  );
}
