/** Booth route sub-views (owner: booth). Original procedural art only. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { t, type StringKey } from '../../i18n';
import { FILTERS, svgFilterData, chromeIntentUrl, type CameraErrorKind, type Platform } from '../../booth';
import { Pill } from '../../ui';

/** Curtain-booth illustration for the permission explainer (procedural SVG, theme slots only). */
export function CurtainArt() {
  return (
    <svg className="booth-art" viewBox="0 0 160 120" aria-hidden="true">
      <rect className="booth-art__body" x="20" y="8" width="120" height="108" rx="12" />
      <rect className="booth-art__window" x="34" y="22" width="92" height="66" rx="8" />
      <path className="booth-art__curtain" d="M34 22h46c-4 18-10 40-24 66H34z" />
      <path className="booth-art__curtain booth-art__curtain--b" d="M126 22H80c4 18 10 40 24 66h22z" />
      <circle className="booth-art__lens" cx="80" cy="46" r="7" />
      <rect className="booth-art__slot" x="56" y="98" width="48" height="6" rx="3" />
      <path className="booth-art__heart" d="M80 66l-6-6a3.6 3.6 0 0 1 6-4 3.6 3.6 0 0 1 6 4z" />
    </svg>
  );
}

/** SVG filters for the live preview (same curves as the CPU LUT in booth/filters.ts). */
export function LookFilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {FILTERS.map((f) => {
          const d = svgFilterData(f);
          return (
            <filter key={f.id} id={`booth-look-${f.id}`} colorInterpolationFilters="sRGB">
              <feComponentTransfer>
                <feFuncR type="table" tableValues={d.r} />
                <feFuncG type="table" tableValues={d.g} />
                <feFuncB type="table" tableValues={d.b} />
              </feComponentTransfer>
              <feColorMatrix type="saturate" values={d.saturate} />
            </filter>
          );
        })}
      </defs>
    </svg>
  );
}

export function ChipRow<T extends string | number>({ label, value, options, onChange, testId }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (v: T) => void; testId?: string;
}) {
  return (
    <div className="booth-chips" role="radiogroup" aria-label={label} data-testid={testId}>
      <span className="booth-chips__label">{label}</span>
      <div className="booth-chips__row">
        {options.map((o) => (
          <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value}
            className={`booth-chip${o.value === value ? ' is-on' : ''}`} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

/** Mounts an existing canvas element (the composed strip) without copying pixels. */
export function CanvasHost({ canvas, className, testId }: { canvas: HTMLCanvasElement | null; className?: string; testId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host || !canvas) return;
    canvas.setAttribute('data-testid', testId ?? 'booth-strip-canvas');
    host.appendChild(canvas);
    return () => { if (canvas.parentNode === host) host.removeChild(canvas); };
  }, [canvas, testId]);
  return <div ref={ref} className={className} />;
}

const ERROR_KEY: Record<CameraErrorKind, StringKey> = {
  denied: 'booth.error.denied.title', notFound: 'booth.error.notFound', inUse: 'booth.error.inUse', insecure: 'booth.error.insecure',
  overconstrained: 'booth.error.overconstrained', inApp: 'booth.error.inApp', unknown: 'booth.error.unknown',
};
export const errorKey = (k: string): StringKey => ERROR_KEY[k as CameraErrorKind] ?? 'booth.error.unknown';

/** Camera failure help: per-browser steps for 'denied', a retry and the library fallback. */
export function CameraHelp({ kind, platform, inApp, onRetry, children }: { kind: string; platform: Platform; inApp: string | null; onRetry: () => void; children: ReactNode }) {
  return (
    <section className="booth-card" role="alert" data-testid="booth-error" data-kind={kind}>
      <h2 className="booth-card__title">{t(errorKey(kind), { app: inApp ?? '' })}</h2>
      {kind === 'denied' ? (
        <ul className="booth-steps">
          {platform !== 'android' ? <li>{t('booth.error.denied.ios')}</li> : null}
          {platform !== 'ios' ? <li>{t('booth.error.denied.android')}</li> : null}
        </ul>
      ) : null}
      <div className="booth-actions">
        <Pill variant="action" onClick={onRetry}>{t('common.retry')}</Pill>
      </div>
      {children}
    </section>
  );
}

/** Open-in-browser guidance (§6.6 ladder), shown before the camera inside in-app webviews. */
export function InAppSheet({ app, platform, onContinue, children }: { app: string; platform: Platform; onContinue: () => void; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(location.href); setCopied(true); } catch { setCopied(false); }
  };
  return (
    <section className="booth-card" data-testid="booth-inapp">
      <h2 className="booth-card__title">{t('inapp.banner.title')}</h2>
      <p className="booth-card__body">{t('inapp.banner.body', { app })}</p>
      <ul className="booth-steps">
        {platform !== 'android' ? <li>{t('inapp.steps.ios')}</li> : null}
        {platform !== 'ios' ? <li>{t('inapp.steps.android')}</li> : null}
      </ul>
      <div className="booth-actions">
        {platform === 'android' ? <a className="booth-link-btn" href={chromeIntentUrl()}>{t('inapp.openChrome')}</a> : null}
        <Pill variant="action" onClick={copy}>{copied ? t('common.copied') : platform === 'ios' ? t('inapp.copyForSafari') : t('common.copyLink')}</Pill>
        <Pill variant="link" onClick={onContinue}>{t('inapp.continueHere')}</Pill>
      </div>
      {children}
    </section>
  );
}

/** Library / native-camera fallback inputs (§6.6 ladder steps 3-4). */
export function FilePickers({ onFiles, compact }: { onFiles: (files: File[]) => void; compact?: boolean }) {
  const take = (e: React.ChangeEvent<HTMLInputElement>) => { const fs = Array.from(e.target.files ?? []); e.target.value = ''; if (fs.length) onFiles(fs); };
  return (
    <div className={`booth-pickers${compact ? ' booth-pickers--compact' : ''}`}>
      {!compact ? <p className="booth-card__hint">{t('booth.fallback.or')}</p> : null}
      <label className="booth-file">
        <input type="file" accept="image/*" multiple onChange={take} data-testid="booth-file-pick" />
        <span>{t('booth.fallback.pickPhotos')}</span>
      </label>
      <label className="booth-file">
        <input type="file" accept="image/*" capture="user" onChange={take} data-testid="booth-file-camera" />
        <span>{t('booth.fallback.nativeCamera')}</span>
      </label>
    </div>
  );
}
