/**
 * LetterCard (FRAMEWORK §3.6, C4; owner: gift): min(88vw, 360px), aspect .77, paper + grain, −1.5°
 * tilt, washi tape; eyebrow gift.letter.eyebrow in caps via upperVi(); body Mali 18/30 on ruled lines,
 * typed with P42 (Typewriter: Intl.Segmenter graphemes, NFC) when `typing`; Playwrite VN signature.
 * `pending` lays the body out invisibly (the letter is pre-mounted under the opener, G6) so the card
 * never reflows when typing starts.
 */
import './LetterCard.css';
import type { CSSProperties, Ref } from 'react';
import { upperVi, nfc } from '../i18n';
import type { LetterFont } from '../gift-schema';
import { Typewriter } from '../motion/react';

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
  /** Body laid out but hidden until `typing` turns true (pre-mounted letter). */
  pending?: boolean;
  /** Completion cue (P42 onCue, 600-1000 ms after the last glyph): heart pop at the signature. */
  onTypingCue?: () => void;
  /** Element for the washi tape (heart burst origin, C2.tapeHearts). */
  tapeRef?: Ref<HTMLSpanElement>;
  className?: string;
  style?: CSSProperties;
}

const FONT_VAR: Record<LetterFont, string> = {
  handBody: 'var(--font-hand-body)',
  scriptSignature: 'var(--font-script-signature)',
  scriptDisplay: 'var(--font-script-display)',
  handMarker: 'var(--font-hand-marker)',
  displayExtruded: 'var(--font-display-extruded)',
};

export function LetterCard({ eyebrow, greeting, body, signature, font = 'handBody', typing, onTypingDone, pending, onTypingCue, tapeRef, className, style }: LetterCardProps) {
  const bodyStyle = { '--letter-font': FONT_VAR[font] } as CSSProperties;
  const animated = typing || pending;
  return (
    <article className={`ui-letter${className ? ' ' + className : ''}`} style={{ ...bodyStyle, ...style }} data-font={font} data-typing={typing ? '' : undefined}>
      <span className="ui-letter__tape" aria-hidden="true" ref={tapeRef} />
      <p className="ui-letter__eyebrow">{upperVi(eyebrow)}</p>
      <p className="ui-letter__greeting">{nfc(greeting)}</p>
      {animated
        ? <Typewriter className="ui-letter__body" text={body} play={!!typing} onDone={onTypingDone} onCue={onTypingCue} />
        : <p className="ui-letter__body">{nfc(body)}</p>}
      <p className="ui-letter__signature">{nfc(signature)}</p>
    </article>
  );
}
