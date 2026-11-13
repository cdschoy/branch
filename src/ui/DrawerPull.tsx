/**
 * DrawerPull (FRAMEWORK §3.6, C5; owner: primitives): a 48 px plum button holding an original painted
 * ribbon-tied drawer pull (never a heart), paired with the hint pill gift.more.pill. The pill
 * hard-cuts away on the first tap and never returns (C5); an unseen-items dot marks new content.
 * P17 hoverGrow 1.04 on hover-capable pointers; P16 press squash.
 */
import './DrawerPull.css';
import { useState } from 'react';
import { t } from '../i18n';
import { HoverGrow, usePressSquash } from '../motion/react/primitives/gestures';
import { Pill } from './Pill';

export interface DrawerPullProps {
  onOpen: () => void;
  /** Unseen items dot. */
  unseen?: boolean;
  /** Show the gift.more.pill hint until the first tap (default true). */
  hint?: boolean;
  expanded?: boolean;
  className?: string;
}

export function DrawerPullArt() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="6" y="11" width="20" height="9" rx="4.5" fill="var(--c-plum-fab-glyph)" />
      <rect x="9" y="13.5" width="14" height="4" rx="2" fill="var(--c-plum-fab)" opacity=".35" />
      <path d="M16 20c-3 2-5 5-6 8M16 20c3 2 5 5 6 8" stroke="var(--c-cream-50)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M16 20c-2.5-1.5-5-1.8-6.5-.6 1 1.6 4 1.9 6.5.6Zm0 0c2.5-1.5 5-1.8 6.5-.6-1 1.6-4 1.9-6.5.6Z" fill="var(--c-cream-50)" />
      <circle cx="16" cy="20" r="1.6" fill="var(--c-accent-gold)" />
    </svg>
  );
}

export function DrawerPull({ onOpen, unseen, hint = true, expanded, className }: DrawerPullProps) {
  const [tapped, setTapped] = useState(false);
  const squash = usePressSquash('container');
  return (
    <div className={`ui-pull${className ? ' ' + className : ''}`}>
      {hint && !tapped ? <Pill variant="hint" className="ui-pull__pill">{t('gift.more.pill')}</Pill> : null}
      <HoverGrow amount="pull">
        <button type="button" className="ui-pull__btn" aria-label={t('a11y.moreDrawer')} aria-expanded={expanded} {...squash}
          onClick={() => { setTapped(true); onOpen(); }}>
          <DrawerPullArt />
          {unseen ? <span className="ui-pull__dot" aria-hidden="true" /> : null}
        </button>
      </HoverGrow>
    </div>
  );
}
