/**
 * '#/booth' self-photobooth (FRAMEWORK §5.4, C3product / C3gift cadence, C12; owner: booth).
 *
 *   explainer (+ in-app sheet) → permission → setup + live preview (frame · look · timer · pace ·
 *   mirror · screen flash) → coin → C3 countdown, 4 × flash + grab (+ booth shake) → review
 *   (retake one / all) → C12print: slot feed → toss → caption + confetti → edit sheet (caption,
 *   date) → save PNG / share / again.  Fallbacks: denied / no camera / in-app → help + file pickers.
 *
 * Photos never leave the device: src/booth makes no network calls and this screen only creates
 * blob: URLs for the strip. Timing comes from the token choreographies via the Director.
 */
import './BoothScreen.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { t, hasKey, type StringKey } from '../../i18n';
import {
  CameraError, canvasToBlob, captureSpec, composeStripCanvas, detectInApp, detectPlatform, FILTERS, FRAMES, frameById,
  grabFrame, lastCaptureAt, loadStripFonts, paletteVars, releaseShot, resolvePalette, retakeSpec, shotFromFile, shotPreviewUrl,
  vnDateParts, type Cadence, type FilterId, type FrameId, type Shot, type TimerSeconds,
} from '../../booth';
import { boothMachine } from '../../machines/booth';
import { useMachine } from '../../machines/useMachine';
import { bez, choreography, duration, flash, hashSeed, sec, sp, type DurationName, type EasingName, type Run, type Spec, type StepContext, type TargetMap } from '../../motion/core';
import { CameraFlash, DrawerSlide, SlotPrint, Toss, TokenDrop, usePlay, useReducedMotion } from '../../motion/react';
import { CountdownStamp, PhotoStrip, Pill, STRIP_FAN } from '../../ui';
import { hrefFor } from '../router';
import { CameraHelp, CanvasHost, ChipRow, CurtainArt, FilePickers, InAppSheet, LookFilterDefs } from './parts';
import { CameraSuperseded, useCamera } from './useCamera';

const TOTAL = 4;
/** C12.toss starts from the mini strip the slot fed out (P37: scale .36); the feed renders at the same scale. */
const C12_TOSS = choreography.C12print.steps.find((x) => x.action === 'toss');
const FROM_SCALE = Number(C12_TOSS?.params?.fromScale ?? 1);
const TOSS_ARC_MS = Number(C12_TOSS?.params?.arcMs ?? 600);
/** Tween transition from tokens (ms or a duration name + an easing name). */
const tw = (ms: number | DurationName, e: EasingName = 'outQuad', delayMs = 0) => ({ duration: sec(ms), ease: bez(e), delay: sec(delayMs) });
const pad2 = (n: number) => String(n).padStart(2, '0');

function stripDate(): string {
  const { d, m, y, lunar } = vnDateParts();
  return t('booth.footer.date', { solar: t('format.date', { d: pad2(d), m: pad2(m), y }), lunar: t(lunar.leap ? 'format.lunarDateLeap' : 'format.lunarDate', { d: lunar.day, m: lunar.month }) });
}

/** Diegetic pills that carry the decorative ✦ (rendered aria-hidden by Pill, never inside the copy). */
const SPARKLE_PILLS: ReadonlySet<StringKey> = new Set<StringKey>(['booth.pill.coin', 'booth.pill.tapStrip']);

type PrintPhase = 'none' | 'feed' | 'toss';

export default function BoothScreen() {
  const reduced = useReducedMotion();
  const play = usePlay();
  const [snap, send] = useMachine(boothMachine);
  const state = snap.value;

  // ---- setup (all defaulted, §5.4 table) ----
  const [frameId, setFrameId] = useState<FrameId>('stripes');
  const [filterId, setFilterId] = useState<FilterId>('natural');
  const [timer, setTimer] = useState<TimerSeconds>(3);
  const [cadence, setCadence] = useState<Cadence>('product');
  const [mirror, setMirror] = useState<'mirror' | 'true'>('mirror');
  const [screenFlash, setScreenFlash] = useState(true);
  const frame = frameById(frameId);
  const pv = paletteVars(frame);

  // ---- platform ----
  const inApp = useMemo(() => detectInApp(), []);
  const platform = useMemo(() => detectPlatform(), []);
  const [inAppDismissed, setInAppDismissed] = useState(false);

  // ---- camera ----
  const videoRef = useRef<HTMLVideoElement>(null);
  const { session, open } = useCamera(videoRef, state === 'ready', () => send({ type: 'SLEEP' }));

  // ---- shots ----
  const shots = useRef<(Shot | null)[]>(Array(TOTAL).fill(null));
  const [previews, setPreviews] = useState<(string | null)[]>(Array(TOTAL).fill(null));
  const pending = useRef<Promise<void>[]>([]);
  const putShot = useCallback((i: number, s: Shot) => {
    const old = shots.current[i];
    if (old) releaseShot(old);
    shots.current[i] = s;
    const url = shotPreviewUrl(s);
    setPreviews((p) => p.map((x, j) => (j === i ? url : x)));
  }, []);
  const clearShots = useCallback(() => {
    shots.current.forEach((s) => s && releaseShot(s));
    shots.current = Array(TOTAL).fill(null);
    setPreviews(Array(TOTAL).fill(null));
  }, []);
  useEffect(() => () => shots.current.forEach((s) => s && releaseShot(s)), []);

  // ---- HUD driven by the Director ----
  const [pillKey, setPillKey] = useState<StringKey>('booth.pill.coin');
  const [digit, setDigit] = useState<number | null>(null);
  const [plainDigit, setPlainDigit] = useState<number | null>(null);
  const [fullFire, setFullFire] = useState(0);
  const [elFire, setElFire] = useState(0);
  const [tokenKey, setTokenKey] = useState(0);
  const [setupKey, setSetupKey] = useState(0);
  const controlsRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<Run | null>(null);
  const specRef = useRef<Spec | null>(null);
  const stageScope = useRef<HTMLDivElement>(null);

  const shake = useCallback(() => {
    if (reduced || !stageScope.current) return;
    // P23: ≤2.5 px in 2-3 discrete steps(1) jumps (held, not slid) over shakeMs.
    const px = flash.camera.shakePx, n = flash.camera.shakeSteps;
    const xs = [0, ...Array.from({ length: n }, (_, i) => (i % 2 ? -px : px) * (1 - i / n)), 0];
    stageScope.current.animate(xs.map((x) => ({ translate: `${x}px 0`, easing: 'steps(1, end)' })), { duration: flash.camera.shakeMs });
  }, [reduced]);

  const captureRefs = useCallback((): TargetMap => ({
    pill: (ctx: StepContext) => { const k = ctx.step.params?.key; if (typeof k === 'string' && hasKey(k)) setPillKey(k); },
    token: () => { setTokenKey((k) => k + 1); },
    labels: { el: controlsRef },
    digit: (ctx: StepContext) => {
      const d = ctx.step.params?.digit;
      if (ctx.step.action === 'stampPop' && typeof d === 'number') { setPlainDigit(null); setDigit(d); }
      else if (ctx.step.action === 'hardCut' && typeof d === 'number') setPlainDigit(d);
      else setDigit(null);
    },
    flash: (ctx: StepContext) => {
      const full = screenFlash && ctx.step.params?.scope === 'fullScreen';
      if (full) setFullFire((n) => n + 1); else setElFire((n) => n + 1);
      shake();
    },
    camera: (ctx: StepContext) => {
      const n = Number(ctx.step.params?.shot ?? 1);
      const video = videoRef.current;
      if (!video) return;
      pending.current.push(grabFrame(video, mirror === 'mirror').then((s) => { putShot(n - 1, s); send({ type: 'SHOT', index: n }); }));
    },
    machine: (ctx: StepContext) => {
      const ev = String(ctx.step.params?.event ?? '').split(/\s/)[0];
      const all = pending.current; pending.current = [];
      void Promise.all(all).then(() => {
        setDigit(null); setPlainDigit(null); setPillKey('booth.pill.coin');
        if (ev === 'RETAKE_DONE') send({ type: 'RETAKE_DONE' }); else send({ type: 'SESSION_DONE' });
      });
    },
  }), [screenFlash, shake, mirror, putShot, send]);

  // ---- actions ----
  const [errorKind, setErrorKind] = useState<string | null>(null);
  const startCamera = useCallback(async () => {
    send({ type: 'START' });
    try { await open(); setErrorKind(null); send({ type: 'GRANTED' }); }
    catch (e) { if (e instanceof CameraSuperseded) return; const k = e instanceof CameraError ? e.kind : 'unknown'; setErrorKind(k); send({ type: 'DENIED', reason: k }); }
  }, [open, send]);

  const runCapture = useCallback((spec: Spec) => {
    specRef.current = spec;
    pending.current = [];
    runRef.current = play(spec, captureRefs(), { slot: 'capture', preload: async () => undefined });
  }, [play, captureRefs]);

  const shutter = useCallback(() => {
    if (state !== 'ready' || !session) return;
    clearShots();
    send({ type: 'SHUTTER' });
    runCapture(captureSpec(cadence, timer));
  }, [state, session, clearShots, send, runCapture, cadence, timer]);

  const stageTap = useCallback(() => {
    const run = runRef.current, spec = specRef.current;
    if (state !== 'countdown' || !run || !spec) return;
    if (run.time >= lastCaptureAt(spec)) return; // taps during the last capture are ignored
    if (run.state === 'paused') { run.resume(); send({ type: 'RESUME' }); }
    else { run.pause(); send({ type: 'PAUSE' }); }
  }, [state, send]);

  // ---- fallback: picked / natively captured files ----
  const [fileTarget, setFileTarget] = useState<number | null>(null);
  const onFiles = useCallback(async (files: File[]) => {
    if (state !== 'fallback' && state !== 'review') send({ type: 'PICK' });
    let target = fileTarget;
    for (const f of files) {
      const i = target ?? shots.current.findIndex((s) => !s);
      if (i < 0) break;
      try { putShot(i, await shotFromFile(f)); setElFire((n) => n + 1); } catch { /* unreadable file: skip */ }
      if (target !== null) { target = null; setFileTarget(null); }
    }
    const filled = shots.current.filter(Boolean).length;
    send({ type: 'SHOT', index: filled });
    if (filled >= TOTAL) send({ type: 'FILES_DONE' });
  }, [state, fileTarget, putShot, send]);

  // ---- review ----
  const [selected, setSelected] = useState<number | null>(null);
  const retakeOne = useCallback((i: number) => {
    setSelected(null);
    if (!session) { setFileTarget(i); return; }
    send({ type: 'RETAKE', index: i });
    runCapture(retakeSpec(i + 1, cadence));
  }, [session, send, runCapture, cadence]);

  // ---- print (C12print) → decorate ----
  const [caption, setCaption] = useState(() => t('booth.caption.default'));
  const [showDate, setShowDate] = useState(true);
  const [stripCanvas, setStripCanvas] = useState<HTMLCanvasElement | null>(null);
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const stripBlob = useRef<Blob | null>(null);
  const stripUrlRef = useRef<string | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const [printPhase, setPrintPhase] = useState<PrintPhase>('none');
  const [feedMs, setFeedMs] = useState<number | undefined>(undefined);
  const [tossFrom, setTossFrom] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: FROM_SCALE });
  const [captionShown, setCaptionShown] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const seed = useMemo(() => hashSeed(`${frameId}:${Date.now()}`), [frameId]);

  const compose = useCallback(() => composeStripCanvas(shots.current.filter((s): s is Shot => !!s), {
    frameColor: resolvePalette(frame).frame, palette: resolvePalette(frame), motif: frame.motif, filter: filterId,
    footerText: caption, date: showDate ? stripDate() : undefined, seed,
  }), [frame, filterId, caption, showDate, seed]);

  /** One live blob: URL at a time, created and revoked outside any state updater (StrictMode-safe). */
  const setStripBlobUrl = useCallback((blob: Blob | null) => {
    if (stripUrlRef.current) URL.revokeObjectURL(stripUrlRef.current);
    stripUrlRef.current = blob && alive.current ? URL.createObjectURL(blob) : null;
    setStripUrl(stripUrlRef.current);
  }, []);
  const encode = useCallback(async (c: HTMLCanvasElement) => {
    const blob = await canvasToBlob(c);
    if (!alive.current) return;
    stripBlob.current = blob;
    setStripBlobUrl(blob);
  }, [setStripBlobUrl]);
  useEffect(() => () => { if (stripUrlRef.current) URL.revokeObjectURL(stripUrlRef.current); stripUrlRef.current = null; }, []);

  const retakeAll = useCallback(() => {
    setSelected(null); setPrintPhase('none'); setSheetOpen(false); setCaptionShown(false); setStripBlobUrl(null); setStripCanvas(null);
    clearShots(); setSetupKey((k) => k + 1);
    if (session) send({ type: 'RETAKE' });
    else { send({ type: 'RESET' }); send({ type: 'PICK' }); }
  }, [session, send, clearShots, setStripBlobUrl]);

  const print = useCallback(async () => {
    send({ type: 'PRINT' });
    await loadStripFonts();
    const c = compose();
    setStripCanvas(c); setStripBlobUrl(null); setCaptionShown(false); setSheetOpen(false); setPrintPhase('none');
    const spec = choreography.C12print;
    const run = play(spec, {
      pill: (ctx: StepContext) => { const k = ctx.step.params?.key; if (typeof k === 'string' && hasKey(k)) setPillKey(k); },
      strip: (ctx: StepContext) => {
        if (ctx.step.action === 'slotPrint') { setFeedMs(ctx.step.dur); setPrintPhase('feed'); }
        else if (ctx.step.action === 'toss') {
          // Start the arc exactly where the fed mini strip is on screen, at its scale (no size jump).
          const fromScale = Number(ctx.step.params?.fromScale ?? FROM_SCALE);
          const r = feedRef.current?.getBoundingClientRect() ?? slotRef.current?.getBoundingClientRect();
          if (r) setTossFrom({ x: r.left + r.width / 2, y: r.top + r.height / 2, scale: fromScale });
          setPrintPhase('toss');
        }
      },
      caption: () => { setCaptionShown(true); },
      stageFx: () => undefined, // confettiFountain → fx canvas (bridge)
      editSheet: () => { setSheetOpen(true); },
    }, { slot: 'print', preload: async () => undefined });
    await run.finished;
    if (run.state === 'cancelled' || !alive.current) return;
    setPrintPhase('toss'); setCaptionShown(true); setSheetOpen(true);
    setPillKey('booth.pill.tapStrip');
    await encode(c); // PNG encoding deferred until after the toss (§5.4)
    send({ type: 'CHOREO_DONE' });
  }, [send, compose, play, encode, setStripBlobUrl]);

  // Re-compose when the caption / date changes in the edit sheet.
  useEffect(() => {
    if (state !== 'decorate') return;
    const c = compose();
    setStripCanvas(c);
    void encode(c);
  }, [caption, showDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- export (C12export) / share ----
  const [saveKey, setSaveKey] = useState<StringKey>('booth.save.cta');
  const [shareMsg, setShareMsg] = useState<StringKey | null>(null);
  const fileName = useMemo(() => { const { d, m, y } = vnDateParts(); return `photobooth-${y}${pad2(m)}${pad2(d)}.png`; }, []);
  const save = useCallback(async () => {
    if (!stripUrl) return;
    send({ type: 'EXPORT' });
    const run = play(choreography.C12export, { exportRing: () => { setSaveKey('booth.save.saving'); } }, { slot: 'export', preload: async () => undefined });
    await run.finished;
    if (run.state === 'cancelled' || !alive.current) return;
    try {
      const a = document.createElement('a');
      a.href = stripUrl; a.download = fileName; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setSaveKey('booth.save.saved');
    } catch { setSaveKey('booth.error.saveFailed'); }
    send({ type: 'CHOREO_DONE' });
  }, [stripUrl, send, play, fileName]);
  const canShareFiles = useMemo(() => {
    try { return typeof navigator.share === 'function' && !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] }); } catch { return false; }
  }, []);
  const share = useCallback(async () => {
    const blob = stripBlob.current;
    if (!blob) return;
    const file = new File([blob], fileName, { type: 'image/png' });
    if (!navigator.canShare?.({ files: [file] })) { setShareMsg('booth.share.unsupported'); return; }
    try { await navigator.share({ files: [file], title: t('booth.title') }); } catch { /* cancelled */ }
  }, [fileName]);

  // ---- reset HUD when (re)entering ready ----
  useEffect(() => {
    if (state === 'ready') { setTokenKey(0); setPillKey('booth.pill.coin'); setDigit(null); setPlainDigit(null); setSetupKey((k) => k + 1); }
  }, [state]);

  const live = state === 'ready' || state === 'countdown' || state === 'retake';
  const filled = previews.filter(Boolean).length;
  const showInApp = !!inApp && !inAppDismissed && (state === 'idle');
  const stripStyle = { '--booth-from-scale': String(tossFrom.scale || FROM_SCALE) } as React.CSSProperties;

  return (
    <main className="app-scene booth" data-theme="booth-stripes" data-state={state} data-testid="booth">
      <LookFilterDefs />
      <header className="booth-head">
        <a className="booth-back" href={hrefFor({ name: 'landing' })}>{t('common.back')}</a>
        <h1 className="booth-title">{t('booth.title')}</h1>
        <span className="booth-privacy">{t('booth.privacy')}</span>
      </header>

      {state === 'idle' && !showInApp ? (
        <section className="booth-card" data-testid="booth-explainer">
          <CurtainArt />
          <h2 className="booth-card__title">{t('booth.permission.title')}</h2>
          <p className="booth-card__body">{t('booth.permission.body')}</p>
          <div className="booth-actions">
            <Pill variant="action" onClick={() => void startCamera()} sparkle>{t('booth.permission.cta')}</Pill>
          </div>
          <FilePickers onFiles={(f) => void onFiles(f)} />
        </section>
      ) : null}

      {showInApp ? (
        <InAppSheet app={inApp} platform={platform} onContinue={() => setInAppDismissed(true)}>
          <p className="booth-card__hint">{t('inapp.cameraFallback')}</p>
          <FilePickers onFiles={(f) => void onFiles(f)} compact />
        </InAppSheet>
      ) : null}

      {state === 'permission' ? <p className="booth-wait" aria-busy="true">{t('common.loading')}</p> : null}

      {state === 'denied' ? (
        <CameraHelp kind={errorKind ?? snap.context.error ?? 'unknown'} platform={platform} inApp={inApp} onRetry={() => void startCamera()}>
          <FilePickers onFiles={(f) => void onFiles(f)} />
        </CameraHelp>
      ) : null}

      {state === 'fallback' ? (
        <section className="booth-card" data-testid="booth-fallback">
          <h2 className="booth-card__title">{t('booth.fallback.progress', { count: filled, total: TOTAL })}</h2>
          <div className="booth-grid booth-grid--small">
            {previews.map((p, i) => (
              <div key={i} className="booth-cell" style={{ background: pv.paper }}>
                {p ? <img src={p} alt={t('booth.a11y.shot', { index: i + 1 })} /> : null}
              </div>
            ))}
          </div>
          <p className="booth-card__hint">{t('booth.fallback.needMore', { count: TOTAL - filled })}</p>
          <FilePickers onFiles={(f) => void onFiles(f)} compact />
          <CameraFlash fire={elFire} scope="element" />
        </section>
      ) : null}

      {/* Live stage: always mounted so the <video> keeps its stream; hidden outside capture states. */}
      <section className="booth-live" hidden={!live} aria-hidden={!live}>
        <div className="booth-stage-row">
          <div ref={stageScope} className="booth-stage" style={{ background: pv.frame, borderColor: pv.frame }} data-testid="booth-stage"
            onClick={stageTap} aria-label={t('booth.a11y.preview')} role="group">
            <div className="booth-window" style={{ background: 'var(--t-interior)' }}>
              <video ref={videoRef} muted playsInline autoPlay data-testid="booth-video"
                className={`booth-video${mirror === 'mirror' ? ' is-mirrored' : ''}`}
                style={{ filter: filterId === 'natural' ? undefined : `url(#booth-look-${filterId})` }} />
              <div className="booth-hud">
                <Pill variant="status" sparkle={!snap.context.paused && SPARKLE_PILLS.has(pillKey)}>{snap.context.paused ? t('booth.pill.paused') : t(pillKey)}</Pill>
                {state === 'countdown' ? <span className="booth-counter">{t('booth.shotCounter', { index: Math.min(TOTAL, snap.context.shots + 1), total: TOTAL })}</span> : null}
              </div>
              <div className="booth-stamp">
                {plainDigit !== null && digit === null ? <span className="booth-plain-digit" data-testid="booth-plain-digit">{plainDigit}</span> : null}
                <CountdownStamp value={digit} size="lg" />
              </div>
              <CameraFlash fire={elFire} scope="element" />
              {snap.context.asleep && !session && state === 'ready' ? (
                <div className="booth-sleep">
                  <p>{t('booth.cameraSleep')}</p>
                  <Pill variant="action" onClick={() => void startCamera()}>{t('booth.cameraWake')}</Pill>
                </div>
              ) : null}
            </div>
          </div>
          <PhotoStrip className="booth-tray" photos={previews.map((p) => p ?? '')} width={64} />
        </div>

        <div key={setupKey} ref={controlsRef} className="booth-controls" inert={state !== 'ready'}>
          <ChipRow testId="booth-frames" label={t('booth.frame.prompt')} value={frameId} onChange={setFrameId}
            options={FRAMES.map((f) => ({ value: f.id, label: t(f.labelKey) }))} />
          <ChipRow testId="booth-filters" label={t('booth.filter.prompt')} value={filterId} onChange={setFilterId}
            options={FILTERS.map((f) => ({ value: f.id, label: t(f.labelKey) }))} />
          <ChipRow label={t('booth.timer.label', { seconds: timer })} value={timer} onChange={setTimer}
            options={([3, 5, 10] as const).map((s) => ({ value: s, label: t('booth.timer.option', { seconds: s }) }))} />
          <ChipRow testId="booth-cadence" label={t('booth.cadence.label')} value={cadence} onChange={setCadence}
            options={[{ value: 'product', label: t('booth.cadence.product') }, { value: 'quick', label: t('booth.cadence.quick') }]} />
          <ChipRow label={t('booth.mirror.label')} value={mirror} onChange={setMirror}
            options={[{ value: 'mirror', label: t('booth.mirror.mirror') }, { value: 'true', label: t('booth.mirror.true') }]} />
          <ChipRow label={t('booth.screenFlash')} value={screenFlash ? 'on' : 'off'} onChange={(v) => setScreenFlash(v === 'on')}
            options={[{ value: 'on', label: t('booth.option.on') }, { value: 'off', label: t('booth.option.off') }]} />
          {screenFlash ? <p className="booth-note">{t('booth.flashWarning')}</p> : null}
        </div>

        <div className="booth-shutter-row">
          <button type="button" className="booth-coin" data-testid="booth-shutter" onClick={shutter}
            disabled={state !== 'ready' || !session} aria-label={t('booth.a11y.shutter')}>
            <TokenDrop play={tokenKey > 0} playKey={tokenKey}><span className="booth-coin__disc" aria-hidden="true">✦</span></TokenDrop>
            <span className="booth-coin__label">{t('booth.landing.coin')} <span aria-hidden="true">✦</span></span>
          </button>
        </div>
      </section>

      {state === 'review' ? (
        <section className="booth-card booth-review" data-testid="booth-review">
          <h2 className="booth-card__title">{t('booth.tapAStrip')} <span aria-hidden="true">✦</span></h2>
          <div className="booth-grid">
            {previews.map((p, i) => (
              <motion.button key={i} type="button" className="booth-cell" layoutId={`shot-${i}`} data-testid={`booth-shot-${i}`}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...tw('move', 'inOutCubic', i * duration.micro), layout: sp('modal') }}
                onClick={() => setSelected(i)} aria-label={t('booth.a11y.shot', { index: i + 1 })}>
                {p ? <img src={p} alt="" className={filterId === 'natural' ? undefined : 'booth-look'} style={{ filter: filterId === 'natural' ? undefined : `url(#booth-look-${filterId})` }} /> : null}
              </motion.button>
            ))}
          </div>
          {fileTarget !== null ? <FilePickers onFiles={(f) => void onFiles(f)} compact /> : null}
          <div className="booth-actions">
            <Pill variant="link" onClick={retakeAll}>{t('booth.retakeAll')}</Pill>
            <button type="button" className="booth-primary" data-testid="booth-print" onClick={() => void print()} disabled={filled < TOTAL}>{t('booth.print')} <span aria-hidden="true">✦</span></button>
          </div>
          {/* Only the scrim fades out; the shared card unmounts at once so the grid cell FLIPs back on
              spring.modal immediately (C12 review), not after an exit fade. */}
          <AnimatePresence>
            {selected !== null ? (
              <motion.div key="scrim" className="booth-lightbox__scrim" aria-hidden="true"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={tw('modal', 'standard')} />
            ) : null}
          </AnimatePresence>
          {selected !== null ? (
            <div className="booth-lightbox" role="dialog" aria-modal="true" aria-label={t('booth.a11y.shot', { index: selected + 1 })}>
              <motion.div className="booth-lightbox__card" layoutId={`shot-${selected}`} transition={sp('modal')}>
                {previews[selected] ? <img src={previews[selected]!} alt={t('booth.a11y.shot', { index: selected + 1 })} /> : null}
              </motion.div>
              <motion.div className="booth-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tw('modal', 'standard')}>
                <Pill variant="action" onClick={() => retakeOne(selected)}>{t('booth.retakeOne')}</Pill>
                <Pill variant="link" onClick={() => setSelected(null)}>{t('booth.keep')}</Pill>
              </motion.div>
            </div>
          ) : null}
        </section>
      ) : null}

      {state === 'printing' || state === 'decorate' || state === 'export' ? (
        <section className="booth-print" data-testid="booth-print-stage" style={stripStyle}>
          <Pill variant="status" sparkle={SPARKLE_PILLS.has(pillKey)}>{t(pillKey)}</Pill>
          <div className="booth-printer" aria-hidden="true" style={{ background: pv.frame }}>
            <div ref={slotRef} className="booth-printer__slot" />
            {printPhase === 'feed' ? (
              <SlotPrint durationMs={feedMs} className="booth-printer__feed">
                <div ref={feedRef}><CanvasHost canvas={stripCanvas} className="booth-strip booth-strip--mini" /></div>
              </SlotPrint>
            ) : null}
          </div>
          <div className="booth-landing">
            {printPhase === 'toss' ? (
              <Toss from={tossFrom} restDeg={STRIP_FAN[0] ?? 0} arcMs={TOSS_ARC_MS}>
                {stripUrl
                  ? <img className="booth-strip" src={stripUrl} alt={t('booth.a11y.strip')} data-testid="booth-strip-img" />
                  : <CanvasHost canvas={stripCanvas} className="booth-strip" />}
              </Toss>
            ) : null}
            {captionShown ? (
              <motion.p className="booth-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tw('crossfade', 'standard')}>{caption}</motion.p>
            ) : null}
          </div>
          {/* hidden full-size canvas for tests / export parity */}
          {stripCanvas && printPhase === 'toss' && stripUrl ? <CanvasHost canvas={stripCanvas} className="booth-offscreen" /> : null}
          <DrawerSlide open={sheetOpen} variant="sheet" className="booth-sheet">
            <h2 className="booth-sheet__title">{t('booth.decorate.title')}</h2>
            <label className="booth-field">
              <span>{t('booth.decorate.text')}</span>
              <input type="text" value={caption} maxLength={60} placeholder={t('booth.decorate.textPlaceholder')} data-testid="booth-caption-input"
                onChange={(e) => setCaption(e.target.value.normalize('NFC'))} disabled={state !== 'decorate'} />
            </label>
            <label className="booth-toggle">
              <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} disabled={state !== 'decorate'} />
              <span>{t('booth.decorate.date')}</span>
            </label>
            <div className="booth-actions">
              <button type="button" className="booth-primary" data-testid="booth-save" onClick={() => void save()} disabled={!stripUrl || state !== 'decorate'}>{t(saveKey)}</button>
              {canShareFiles ? <Pill variant="action" onClick={() => void share()}>{t('booth.share.cta')}</Pill> : null}
              <Pill variant="link" onClick={retakeAll}>{t('booth.again')}</Pill>
            </div>
            {inApp ? <p className="booth-note">{t('booth.save.longPress')}</p> : null}
            {shareMsg ? <p className="booth-note" role="status">{t(shareMsg)}</p> : null}
          </DrawerSlide>
        </section>
      ) : null}

      <CameraFlash fire={fullFire} scope="fullScreen" />
    </main>
  );
}
