/**
 * '#/booth' self-photobooth (FRAMEWORK §5.4; owner: booth). STUB — permission CTA → live preview.
 * Replace with machines/booth.ts + C3product / C12.
 */
import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';
import { openCamera, CameraError, type CameraSession } from '../../booth';
import { Pill, CountdownStamp } from '../../ui';
import { hrefFor } from '../router';

export default function BoothScreen() {
  const video = useRef<HTMLVideoElement>(null);
  const [session, setSession] = useState<CameraSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => session?.stop(), [session]);
  const start = async () => {
    try { setSession(await openCamera({ video: video.current ?? undefined })); setError(null); }
    catch (e) { setError(e instanceof CameraError ? e.kind : 'unknown'); }
  };
  return (
    <main className="app-scene" data-theme="booth-stripes" style={{ padding: 16, display: 'grid', gap: 16, justifyItems: 'center', alignContent: 'start' }} data-stub="BoothScreen">
      <h1 style={{ fontFamily: 'var(--font-ui-sans)', fontWeight: 600, fontSize: 24, lineHeight: 1.5, margin: 0 }}>{t('booth.title')}</h1>
      <div style={{ width: 'min(100%, 420px)', aspectRatio: '3 / 4', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--t-interior)', display: 'grid', placeItems: 'center', position: 'relative' }}>
        <video ref={video} muted playsInline data-testid="booth-video" style={{ width: '100%', height: '100%', objectFit: 'cover', scale: '-1 1', display: session ? 'block' : 'none' }} />
        {!session ? <CountdownStamp value={3} /> : null}
      </div>
      {!session ? <Pill variant="action" onClick={start}>{t('booth.permission.cta')}</Pill> : <Pill variant="status">{t('booth.pill.coin')}</Pill>}
      {error ? <p role="alert">{error === 'denied' ? t('booth.error.denied.title') : t('booth.error.notFound')}</p> : null}
      <a href={hrefFor({ name: 'landing' })} style={{ color: 'var(--t-accent)' }}>{t('common.back')}</a>
    </main>
  );
}
