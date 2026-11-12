/**
 * '#/create' creator (FRAMEWORK §5.2; owner: gift). STUB — replace with the creator flow
 * (machines/creator.ts). Must end by navigating to `#/g/<await encodeGift(draft)>` (preview / share).
 */
import { t } from '../../i18n';
import { encodeGift, sampleGift } from '../../gift-schema';
import { navigate, hrefFor } from '../router';
import { Pill } from '../../ui';

export default function CreateScreen() {
  return (
    <main className="app-scene" data-theme="garden-envelope" style={{ padding: 16, display: 'grid', gap: 16, alignContent: 'start', justifyItems: 'center' }} data-stub="CreateScreen">
      <h1 style={{ fontFamily: 'var(--font-ui-sans)', fontWeight: 600, fontSize: 24, lineHeight: 1.5, margin: 0 }}>{t('create.title')}</h1>
      <p style={{ fontFamily: 'var(--font-hand-body)', margin: 0 }}>{t('create.mechanic.prompt')}</p>
      <Pill variant="action" onClick={async () => navigate({ name: 'gift', param: await encodeGift(sampleGift) })}>{t('create.preview.cta')}</Pill>
      <a href={hrefFor({ name: 'landing' })} style={{ color: 'var(--t-accent)' }}>{t('common.back')}</a>
    </main>
  );
}
