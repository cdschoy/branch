/**
 * '#/g/<param>' recipient route (FRAMEWORK §5.3; owner: gift). Loads the gift with loadGift(param)
 * (today: decode the URL-hash payload; later: /api/gift/[slug]/open, see api/README.md), gates on the
 * critical fonts (§3.4 rule 8), then hands it to the GiftPlayer.
 */
import { Component, useEffect, useState, type ReactNode } from 'react';
import { t } from '../../i18n';
import { loadGift, type GiftContentV1 } from '../../gift-schema';
import { fontsReady } from '../fonts';
import { hrefFor } from '../router';
import { GiftPlayer } from './GiftPlayer';
import { LocaleToggle } from '../LocaleToggle';
import './player.css';

const CRITICAL_FACES = ['400 18px Mali', '700 40px "Dancing Script"', '400 28px "Playwrite VN"', '500 16px "Be Vietnam Pro"'];

function GiftError() {
  return (
    <main className="app-scene gift-player gift-player--msg" data-theme="garden-envelope" data-testid="gift-error">
      <p role="alert" className="gift-msg">{t('gift.error.notFound')}</p>
      <a className="gift-msg__link" href={hrefFor({ name: 'landing' })}>{t('app.home')}</a>
    </main>
  );
}

/** Last line of defence: anything the validator missed ends on the friendly error screen, never a white page. */
class GiftBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  override render() { return this.state.failed ? <GiftError /> : this.props.children; }
}

export default function PlayerScreen({ param }: { param: string }) {
  const [state, setState] = useState<{ gift?: GiftContentV1; error?: string }>({});
  useEffect(() => {
    let live = true;
    void Promise.all([loadGift(param), fontsReady(CRITICAL_FACES)]).then(([r]) => {
      if (live) setState(r.ok ? { gift: r.value } : { error: r.error });
    });
    return () => { live = false; };
  }, [param]);

  // The app chrome follows the viewer's language; the sender's own words (letter, captions, names) never change.
  let body: ReactNode;
  if (state.error) body = <GiftError />;
  else if (!state.gift) {
    body = (
      <main className="app-scene gift-player gift-player--msg" data-theme="garden-envelope" aria-busy="true">
        <p className="gift-loading">{t('gift.loading')}</p>
      </main>
    );
  } else body = <GiftBoundary><GiftPlayer gift={state.gift} /></GiftBoundary>;
  return <>{body}<LocaleToggle floating /></>;
}
