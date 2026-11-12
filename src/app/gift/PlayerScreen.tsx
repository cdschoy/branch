/**
 * '#/g/<param>' recipient player (FRAMEWORK §5.3; owner: gift). STUB — loads the gift via
 * loadGift(param) and shows the letter statically. Replace with machines/recipient.ts + C1/C4/C5/C6/C7.
 */
import { useEffect, useState } from 'react';
import { t, type Voice } from '../../i18n';
import { loadGift, type GiftContentV1, type LetterPage } from '../../gift-schema';
import { LetterCard } from '../../ui';

export default function PlayerScreen({ param }: { param: string }) {
  const [state, setState] = useState<{ gift?: GiftContentV1; error?: string }>({});
  useEffect(() => {
    let live = true;
    void loadGift(param).then((r) => { if (live) setState(r.ok ? { gift: r.value } : { error: r.error }); });
    return () => { live = false; };
  }, [param]);

  if (state.error) return <main className="app-scene" data-theme="garden-envelope" style={{ padding: 16 }}><p role="alert">{t('gift.error.notFound')}</p></main>;
  if (!state.gift) return <main className="app-scene" data-theme="garden-envelope" style={{ display: 'grid', placeItems: 'center' }}><p>{t('gift.loading')}</p></main>;

  const g = state.gift;
  const voice: Voice = { self: g.names.self, you: g.names.you, tone: g.names.tone, recipientName: g.names.to };
  const letter = g.pages.find((p): p is LetterPage => p.kind === 'letter');
  return (
    <main className="app-scene" data-theme={g.theme} style={{ display: 'grid', placeItems: 'center', padding: 16, gap: 16 }} data-stub="PlayerScreen">
      <p style={{ fontFamily: 'var(--font-script-display)', fontWeight: 700, fontSize: 28, lineHeight: 1.7, margin: 0, color: 'var(--t-display)' }}>
        {t('gift.landing.from', {}, voice)}
      </p>
      {letter ? <LetterCard eyebrow={t('gift.letter.eyebrow', {}, voice)} greeting={letter.greeting} body={letter.body} signature={letter.signature} font={letter.font} /> : null}
    </main>
  );
}
