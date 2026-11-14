/**
 * App shell (owner: scaffold): MotionConfig (reduced motion), the single FxCanvas layer, and the hash
 * router. Routes and the fx canvas (engine + emitters) are lazy; the recipient route's first-tap JS is
 * still over the §7.7 budget (README → Known gaps), mostly React + Motion.
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { useRoute } from './router';
import { useReducedMotion } from '../motion/react';
import { startTierProbe } from '../motion/core';
import { t } from '../i18n';
import { useLocale } from './useLocale';
import Landing from './routes/Landing';
import NotFound from './routes/NotFound';

const FxCanvas = lazy(() => import('../motion/react/FxCanvas').then((m) => ({ default: m.FxCanvas })));
const Lab = lazy(() => import('./routes/Lab'));
const CreateScreen = lazy(() => import('./gift/CreateScreen'));
const PlayerScreen = lazy(() => import('./gift/PlayerScreen'));
const BoothScreen = lazy(() => import('./booth/BoothScreen'));

function Loading() {
  return <div className="app-scene" style={{ display: 'grid', placeItems: 'center' }} aria-busy="true">{t('common.loading')}</div>;
}

export default function App() {
  const route = useRoute();
  const reduced = useReducedMotion();
  // Subscribing here re-renders the whole tree (no memo boundaries) when the language changes: text
  // updates in place, nothing remounts, so running Director runs, the camera and drafts survive.
  const locale = useLocale();
  useEffect(() => { void startTierProbe(); }, []);
  useEffect(() => { document.title = t('app.title'); }, [locale]);
  useEffect(() => { window.scrollTo(0, 0); }, [route.name]);
  // The recipient route needs no fx before its first tap (C1a's first canvas step is 870 ms after it),
  // so the fx engine + emitters load on the first pointer / key input there; elsewhere at once.
  const [fxOn, setFxOn] = useState(route.name !== 'gift');
  useEffect(() => {
    if (fxOn) return;
    if (route.name !== 'gift') { setFxOn(true); return; }
    const on = () => setFxOn(true);
    const o = { capture: true, once: true } as const;
    addEventListener('pointerdown', on, o); addEventListener('keydown', on, o);
    return () => { removeEventListener('pointerdown', on, o); removeEventListener('keydown', on, o); };
  }, [fxOn, route.name]);

  let page;
  switch (route.name) {
    case 'landing': page = <Landing />; break;
    case 'create': page = <CreateScreen />; break;
    case 'gift': page = <PlayerScreen key={route.param} param={route.param} />; break;
    case 'booth': page = <BoothScreen />; break;
    case 'lab': page = <Lab entry={route.entry} />; break;
    default: page = <NotFound />;
  }
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <Suspense fallback={<Loading />}>{page}</Suspense>
      {fxOn ? <Suspense fallback={null}><FxCanvas /></Suspense> : null}
    </MotionConfig>
  );
}
