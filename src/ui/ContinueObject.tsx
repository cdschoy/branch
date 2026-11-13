/**
 * ContinueObject (FRAMEWORK §3.6, G14, C7; owner: primitives). A 40 px painted, theme-specific object
 * in a 44 px hit area — wax seal (envelope), candy (box), film roll (booth) or pencil (notebook) —
 * placed bottom-right on mobile by the caller. Until `ready` (readEnough), a tap answers on the same
 * frame with P15 tapWobble + the guard tooltip (P07 tooltipRise, gift.finale.tooltip passed in as
 * `guardText`); once ready a tap calls onContinue. The hint ring follows the hint ladder.
 * All art is original and procedural (SVG in token colours).
 */
import './ContinueObject.css';
import { useRef, useState } from 'react';
import { t } from '../i18n';
import { useTapWobble } from '../motion/react/primitives/gestures';
import { TooltipRise } from '../motion/react/primitives/text';
import { HintRing } from './HintRing';

export type ContinueKind = 'seal' | 'candy' | 'film' | 'pencil';
export interface ContinueObjectProps {
  kind?: ContinueKind;
  /** readEnough gate (§5.3). */
  ready: boolean;
  onContinue: () => void;
  /** Guard tooltip text, e.g. t('gift.finale.tooltip', {}, voice). */
  guardText: string;
  /** Show the ladder hint ring (default true; removed on first touch). */
  hint?: boolean;
  className?: string;
}

export function ContinueArt({ kind }: { kind: ContinueKind }) {
  switch (kind) {
    case 'candy': return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M4 14 11 20 4 26Z M36 14 29 20 36 26Z" fill="var(--c-blush-300)" />
        <circle cx="20" cy="20" r="10" fill="var(--c-accent-rose)" />
        <path d="M13 16c4 2 10 2 14 0M13 24c4-2 10-2 14 0" stroke="var(--c-cream-50)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>);
    case 'film': return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect x="8" y="9" width="20" height="24" rx="4" fill="var(--c-ink-700)" />
        <rect x="11" y="6" width="14" height="4" rx="1.5" fill="var(--c-accent-gold)" />
        <path d="M28 14h6v14h-6" fill="var(--c-kraft-300)" />
        <circle cx="18" cy="21" r="5" fill="var(--c-cream-200)" />
        <circle cx="18" cy="21" r="1.6" fill="var(--c-ink-700)" />
      </svg>);
    case 'pencil': return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <g transform="rotate(-35 20 20)">
          <rect x="6" y="16" width="22" height="8" rx="1.5" fill="var(--c-accent-honey)" />
          <rect x="4" y="16" width="4" height="8" rx="1.5" fill="var(--c-blush-300)" />
          <path d="M28 16 35 20 28 24Z" fill="var(--c-kraft-300)" />
          <path d="M33 19 35 20 33 21Z" fill="var(--c-ink-700)" />
        </g>
      </svg>);
    default: return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 3c3 0 4 3 7 3s5 3 5 6 3 4 3 8-3 5-3 8-2 6-5 6-4 3-7 3-4-3-7-3-5-3-5-6-3-4-3-8 3-5 3-8 2-6 5-6 4-3 7-3Z" fill="var(--t-seal, var(--c-berry-600))" />
        <circle cx="20" cy="20" r="10" fill="var(--t-seal-core, var(--c-berry-700))" />
        <path d="M20 26.5 14.6 21a3.3 3.3 0 0 1 5.4-3.6 3.3 3.3 0 0 1 5.4 3.6Z" fill="var(--c-blush-200)" opacity=".85" />
      </svg>);
  }
}

export function ContinueObject({ kind = 'seal', ready, onContinue, guardText, hint = true, className }: ContinueObjectProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const wobble = useTapWobble(ref);
  const [guard, setGuard] = useState(false);
  const [touched, setTouched] = useState(false);
  const onClick = () => {
    setTouched(true);
    if (ready) { setGuard(false); onContinue(); return; }
    setGuard(true);
    void wobble();
  };
  return (
    <div className={`ui-continue${className ? ' ' + className : ''}`}>
      <button ref={ref} type="button" className="ui-continue__btn" aria-label={t('a11y.continueObject')} aria-disabled={!ready || undefined} onClick={onClick} data-ready={ready || undefined}>
        <ContinueArt kind={kind} />
        <HintRing active={hint && !touched} ladder tone="onArt" />
      </button>
      <TooltipRise show={guard && !ready} className="ui-continue__tip">{guardText}</TooltipRise>
    </div>
  );
}
