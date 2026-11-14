/**
 * VI | EN language switch (owner: scaffold). A native radio group styled as a segmented control:
 * arrow keys move between the two options, each option is a ≥44 px target, and each is named by its
 * endonym ("Tiếng Việt", "English") with a matching `lang`. Switching re-renders text in place and
 * remembers the choice (src/app/useLocale.ts).
 */
import './LocaleToggle.css';
import { useId } from 'react';
import { LOCALES, t, type Locale, type StringKey } from '../i18n';
import { chooseLocale, useLocale } from './useLocale';

const NAME: Record<Locale, StringKey> = { vi: 'locale.vi', en: 'locale.en' };
const SHORT: Record<Locale, StringKey> = { vi: 'locale.viShort', en: 'locale.enShort' };

export function LocaleToggle({ className, floating }: { className?: string; floating?: boolean }) {
  const locale = useLocale();
  const name = useId();
  const cls = `locale-toggle${floating ? ' locale-toggle--floating' : ''}${className ? ' ' + className : ''}`;
  return (
    <div role="radiogroup" aria-label={t('locale.label')} className={cls} data-testid="locale-toggle">
      {LOCALES.map((l) => (
        <label key={l} className="locale-toggle__opt" data-on={l === locale || undefined}>
          <input type="radio" className="visually-hidden" name={name} value={l} checked={l === locale}
            onChange={() => chooseLocale(l)} aria-label={t(NAME[l])} lang={l} data-testid={`locale-${l}`} />
          <span aria-hidden="true">{t(SHORT[l])}</span>
        </label>
      ))}
    </div>
  );
}
