/** In-app "Giảm chuyển động" toggle (§4.5; owner: scaffold). Persisted; ORed with the OS preference. */
import { t } from '../i18n';
import { useReducedMotion, useReducedMotionToggle } from '../motion/react';
import { prefersReducedMotion } from '../motion/core';

export function ReducedMotionToggle() {
  const reduced = useReducedMotion();
  const [, set] = useReducedMotionToggle();
  const os = prefersReducedMotion();
  return (
    <label className="rm-toggle" title={os ? t('a11y.reducedMotion') : undefined}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontFamily: 'var(--font-ui-sans)', fontSize: 14, lineHeight: 1.5 }}>
      <input type="checkbox" checked={reduced} disabled={os} onChange={(e) => set(e.target.checked ? true : null)} data-testid="reduced-toggle" />
      {t('a11y.reducedMotionToggle')}
    </label>
  );
}
