/**
 * App shell (owner: scaffold): MotionConfig (reduced motion), the single FxCanvas layer, and the hash
 * router. Heavy routes are lazy so the recipient route stays inside its JS budget (§7.7).
 */
import { lazy, Suspense, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { useRoute } from './router';
import { FxCanvas, useReducedMotion } from '../motion/react';
import { startTierProbe } from '../motion/core';
import { t } from '../i18n';
import Landing from './routes/Landing';
import NotFound from './routes/NotFound';

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
  useEffect(() => { document.title = t('app.title'); void startTierProbe(); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [route.name]);

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
      <FxCanvas />
    </MotionConfig>
  );
}
