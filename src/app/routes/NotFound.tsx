import { t } from '../../i18n';
import { hrefFor } from '../router';
import { LocaleToggle } from '../LocaleToggle';

export default function NotFound() {
  return (
    <main className="app-scene" data-theme="garden-envelope" style={{ display: 'grid', placeItems: 'center', padding: 16, textAlign: 'center' }}>
      <div>
        <p style={{ fontFamily: 'var(--font-hand-body)', fontSize: 18, lineHeight: 1.65 }}>{t('app.notFound')}</p>
        <a href={hrefFor({ name: 'landing' })} style={{ color: 'var(--t-accent)' }}>{t('app.home')}</a>
      </div>
      <LocaleToggle floating />
    </main>
  );
}
