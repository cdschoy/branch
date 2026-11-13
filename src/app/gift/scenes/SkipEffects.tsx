/** G15: `common.skipEffects` appears 1 s into a spectacle; it skips to the end state (owner: gift). */
import { useEffect, useState } from 'react';
import { t } from '../../../i18n';
import { Pill } from '../../../ui';
import { G } from '../params';

export function SkipEffects({ active, onSkip }: { active: boolean; onSkip: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(false);
    if (!active) return;
    const id = setTimeout(() => setShown(true), G.skipAfterMs);
    return () => clearTimeout(id);
  }, [active]);
  if (!active || !shown) return null;
  return (
    <div className="gift-skip" onPointerDown={(e) => e.stopPropagation()}>
      <Pill variant="link" onClick={onSkip}>{t('common.skipEffects')}</Pill>
    </div>
  );
}
