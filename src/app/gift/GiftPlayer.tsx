/**
 * The recipient player for one decoded gift (FRAMEWORK §5.3; owner: gift). Used by '#/g/<param>'
 * (PlayerScreen) and by the creator's ×3 preview.
 *
 * Scene graph: the reading scene (letter + memories + extras) is pre-mounted from the start (G6);
 * the opener (C1 envelope / C2 box) sits above it; CONTINUE mounts the C7 finale overlay over a
 * pre-mounted, invisible end card (C13). Every mechanic converges on the same reading spine.
 * Chrome: secondary (drawer pull + pill) hard-cuts in 700 ms after the spectacle settles, the
 * continue object follows +200 ms (G17); both are hidden + inert under the lightbox (C6, G10).
 */
import './player.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { choreography, hashSeed, spring, type Spec, type TargetMap } from '../../motion/core';
import { usePlay, SharedLightbox, LightboxThumb } from '../../motion/react';
import { t, formatIsoDate, graphemeCount, pronounSetOf, type Voice } from '../../i18n';
import { resolveMedia, safeHttpUrl, type DaysPage, type GiftContentV1, type LetterPage, type MemoriesPage, type SongsPage } from '../../gift-schema';
import { recipientMachine, useMachine } from '../../machines';
import { ContinueObject, DrawerPull, Drawer, LetterCard, MusicDock, Pill, Polaroid, polaroidTilt } from '../../ui';
import { HangingBunting } from './art';
import { G, subSpec } from './params';
import { EnvelopeOpener } from './scenes/EnvelopeOpener';
import { BoxOpener, BoxBadge } from './scenes/BoxOpener';
import { EndCard, FinaleOverlay } from './scenes/Finale';
import type { ReadingRefs, SceneProps } from './scenes/shared';
import { daysTogether, serviceOf } from './util';

/** The memories deal for the envelope path: C2c's deal rows, re-based (spec as data). */
const DEALS = subSpec(choreography.C2c as Spec, 'C2cDeals', ['C2.deal1', 'C2.deal2', 'C2.deal3', 'C2.stack4', 'C2.stack5', 'C2.stack6', 'C2.replayPill']);
const OPENER_STATES = new Set(['landing', 'opening', 'prompt', 'revealing', 'treats', 'spreading']);

/** G17 / P19: the continue object arrives with a nudge (x −9 px, scale 1.06 → 0 / 1 on spring.chromeNudge). */
const CTA_NUDGE: Spec = {
  id: 'G17nudge', title: 'continue object nudge', t0: 'chrome 2 (secondary chrome + 200 ms)', assets: [], reduced: 'opacity200',
  steps: [{ name: 'G17.chromeNudge', at: 0, dur: spring.chromeNudge.settleMs, target: 'cta', action: 'chromeNudge' }],
};

export interface GiftPlayerProps {
  gift: GiftContentV1;
  /** ×3 in the creator preview. */
  timeScale?: number;
  /** Creator preview: no "make your own" links, no done-flag persistence. */
  preview?: boolean;
}

const doneKey = (seed: number) => `gift:done:${seed}`;
const readDone = (seed: number) => { try { return localStorage.getItem(doneKey(seed)) === '1'; } catch { return false; } };
const writeDone = (seed: number) => { try { localStorage.setItem(doneKey(seed), '1'); } catch { /* private mode */ } };

export function GiftPlayer({ gift, timeScale = 1, preview = false }: GiftPlayerProps) {
  const [snap, send] = useMachine(recipientMachine);
  const state = snap.value;
  const ctx = snap.context;
  const seed = useMemo(() => hashSeed(gift.id ?? JSON.stringify(gift)), [gift]);
  const voice: Voice = useMemo(() => ({ pronouns: pronounSetOf(gift.names.pronouns), self: gift.names.self, you: gift.names.you, tone: gift.names.tone, recipientName: gift.names.to }), [gift]);
  const letter = gift.pages.find((p): p is LetterPage => p.kind === 'letter');
  const photos = gift.pages.find((p): p is MemoriesPage => p.kind === 'memories')?.photos.slice(0, 6) ?? [];
  const songs = gift.pages.find((p): p is SongsPage => p.kind === 'songs')?.tracks ?? [];
  const days = gift.pages.find((p): p is DaysPage => p.kind === 'days');
  const hasExtras = songs.length > 0 || !!days;
  const mechanic = gift.mechanic === 'box' ? 'box' : 'envelope';

  useEffect(() => {
    send({ type: 'LOADED', gift, done: !preview && readDone(seed) });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- reading-scene refs (targets for the opener choreographies) ---------------- */
  const reading: ReadingRefs = {
    letter: useRef<HTMLDivElement>(null),
    tape: useRef<HTMLSpanElement>(null),
    decor: useRef<HTMLDivElement>(null),
    photos: useRef<(HTMLDivElement | null)[]>([]),
    replayPill: useRef<HTMLDivElement>(null),
  };
  const pullRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const endDecor = useRef<HTMLDivElement>(null);
  const play = usePlay();

  const [typing, setTyping] = useState(false);
  const [dealt, setDealt] = useState(false);
  const [chrome, setChrome] = useState<0 | 1 | 2>(0);
  const [finale, setFinale] = useState(false);
  /** C7.overlayUnmount reached: C13's t0 (the end actions fade in only now). */
  const [cleared, setCleared] = useState(false);
  const [track, setTrack] = useState<number | null>(null);
  const earlyTap = useRef(-Infinity);
  const openedPhoto = useRef(0);

  const reachedReading = state === 'reading' || state === 'drawer' || state === 'lightbox';

  // G17: secondary chrome +700 ms after the spectacle settles, the CTA +200 ms after that
  useEffect(() => {
    if (!reachedReading || chrome === 2) return;
    const a = setTimeout(() => setChrome(1), G.chrome.secondaryMs / timeScale);
    const b = setTimeout(() => setChrome(2), (G.chrome.secondaryMs + G.chrome.primaryMs) / timeScale);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [reachedReading]); // eslint-disable-line react-hooks/exhaustive-deps

  // P19: nudge the continue object in as it mounts
  useEffect(() => {
    if (chrome !== 2 || !ctaRef.current) return;
    const r = play(CTA_NUDGE, { cta: ctaRef }, { timeScale, slot: 'nudge' });
    return () => r.cancel();
  }, [chrome]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus follows the scene (keyboard / screen-reader users): the letter when reading starts.
  const letterRegion = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state !== 'reading' || !letterRegion.current) return;
    const a = document.activeElement;
    if (!a || a === document.body || !a.isConnected || (a as HTMLElement).closest?.('[inert]')) letterRegion.current.focus({ preventScroll: true });
  }, [state]);

  // Envelope: memories deal in once the letter is typed (R → M in the §5.3 graph)
  const dealMemories = useCallback(() => {
    if (dealt) return;
    const refs: TargetMap = Object.fromEntries([
      ...[0, 1, 2].map((i) => [`polaroid${i + 1}`, { el: { current: reading.photos.current?.[i] ?? null } }]),
      ...[3, 4, 5].map((i) => [`polaroid${i + 1}`, { el: { current: reading.photos.current?.[i] ?? null } }]),
      ['replayPill', reading.replayPill],
    ]);
    const r = play(DEALS, refs, { seed, timeScale, data: { photoCount: photos.length }, slot: 'deal' });
    void r.finished.then(() => setDealt(true));
  }, [dealt, play, seed, timeScale, photos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mechanic === 'envelope' && reachedReading && ctx.typed && !dealt) dealMemories();
  }, [mechanic, reachedReading, ctx.typed, dealt, dealMemories]);

  // readEnough (§5.3): typed AND dwell ≥ clamp(graphemes / 14 per s, 4 s, 25 s)
  useEffect(() => {
    if (!ctx.typed || ctx.readEnough) return;
    const n = graphemeCount(letter?.body ?? '');
    const r = G.readEnough;
    const ms = Math.min(r.maxMs, Math.max(r.minMs, (n / r.graphemesPerSec) * 1000));
    const id = setTimeout(() => send({ type: 'READ_ENOUGH' }), ms / timeScale);
    return () => clearTimeout(id);
  }, [ctx.typed, ctx.readEnough]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTypingStart = useCallback(() => { if (!ctx.typed) setTyping(true); else setTyping(false); }, [ctx.typed]);
  const onTyped = useCallback(() => { setTyping(false); send({ type: 'TYPED' }); }, [send]);

  const startFinale = useCallback((force = false) => {
    if (finale) return;
    send({ type: 'CONTINUE', force });
    setFinale(true);
  }, [finale, send]);

  /** "A second early tap within 3 s is honoured, so no one is trapped" (§5.3). */
  const onContinueCapture = () => {
    if (ctx.readEnough) return;
    const now = performance.now();
    if (now - earlyTap.current <= G.readEnough.secondTapWindowMs) startFinale(true);
    earlyTap.current = now;
  };

  const onSwap = useCallback(() => { send({ type: 'SWAP' }); if (!preview) writeDone(seed); }, [send, preview, seed]);
  const onReplaySwap = useCallback(() => {
    setFinale(false); setCleared(false); setChrome(0); setDealt(false); setTyping(false);
    send({ type: 'REPLAY' });
  }, [send]);

  /* ---------------- render ---------------- */
  const sceneProps: SceneProps = {
    gift, voice, seed, state, ctx, send, reading, timeScale, photoCount: photos.length,
    onTypingStart, onDealt: () => setDealt(true),
  };
  const lightboxOpen = state === 'lightbox';
  const chromeHidden = lightboxOpen || state === 'finale' || state === 'end';
  const inOpener = OPENER_STATES.has(state);
  // box: the letter waits for C2.letterPop; polaroids always wait for their deal
  const awaitPop = mechanic === 'box' && inOpener;
  const armFinale = reachedReading && chrome >= 2;
  const songTitle = t('gift.songs.title', {}, voice);

  if (state === 'loading') return <main className="app-scene gift-player" data-theme={gift.theme}><p className="gift-loading">{t('gift.loading')}</p></main>;

  return (
    <main className="app-scene gift-player" data-theme={gift.theme} data-state={state} data-mechanic={mechanic} data-typed={ctx.typed || undefined} data-read-enough={ctx.readEnough || undefined} data-testid="gift-player">
      {/* ---------- reading scene (pre-mounted) ---------- */}
      <section className="gift-reading" aria-hidden={inOpener || state === 'end' || undefined} inert={inOpener || state === 'end' || undefined}>
        <div ref={reading.decor} className="gift-decor" aria-hidden="true"><HangingBunting /></div>
        {mechanic === 'box' && !inOpener ? <BoxBadge /> : null}
        <div ref={(el) => { reading.letter.current = el; letterRegion.current = el; }} className="gift-letter" data-await={awaitPop ? 'pop' : undefined} data-testid="gift-letter"
          tabIndex={-1} role="region" aria-label={t('gift.letter.eyebrow', {}, voice)}>
          {letter ? (
            <LetterCard
              eyebrow={t('gift.letter.eyebrow', {}, voice)} greeting={letter.greeting} body={letter.body} signature={letter.signature}
              font={letter.font} typing={typing} pending={!ctx.typed && !typing} onTypingDone={onTyped} tapeRef={reading.tape}
            />
          ) : null}
        </div>

        {photos.length ? (
          <div className="gift-photos" aria-label={t('gift.photos.title', {}, voice)} role="group">
            {photos.map((ph, i) => {
              const tilt = polaroidTilt(seed, i);
              return (
                <div key={i} ref={(el) => { reading.photos.current[i] = el; }} className="gift-photo" data-tilt={tilt}
                  data-await={dealt ? undefined : 'deal'} data-stack={i >= 3 || undefined} style={{ gridColumn: (i % 3) + 1, transform: `rotate(${tilt}deg)` }}>
                  <LightboxThumb layoutId={`gift-photo-${i}`} onOpen={() => { openedPhoto.current = i; send({ type: 'OPEN_PHOTO', index: i }); }}
                    ariaLabel={t('gift.photos.open', { index: i + 1 })}>
                    <Polaroid src={resolveMedia(ph.ref)} caption={ph.caption} tiltDeg={0} width={104} />
                  </LightboxThumb>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* ---------- chrome (G17, hidden + inert under the lightbox and covers). Position: fixed; it sits here in
            the DOM so the tab order is letter → photos → drawer pull → continue → replay. ---------- */}
        {reachedReading || state === 'finale' ? (
          <div className="gift-chrome" data-hidden={chromeHidden || undefined} inert={chromeHidden || undefined}>
            {hasExtras && chrome >= 1 ? (
              <div ref={pullRef} className="gift-chrome__pull" data-testid="gift-drawer-pull">
                <DrawerPull onOpen={() => send({ type: 'OPEN_DRAWER' })} expanded={state === 'drawer'} />
              </div>
            ) : null}
            {chrome >= 2 ? (
              <div ref={ctaRef} className="gift-chrome__cta" data-testid="gift-continue" data-ready={ctx.readEnough || undefined} onClickCapture={onContinueCapture}>
                <ContinueObject kind={mechanic === 'box' ? 'candy' : 'seal'} ready={ctx.readEnough} onContinue={() => startFinale()} guardText={t('gift.finale.tooltip', {}, voice)} />
              </div>
            ) : null}
          </div>
        ) : null}
        <div ref={reading.replayPill} className="gift-replaypill" data-await={dealt ? undefined : 'deal'}>
          <Pill variant="hint" ariaLabel={t('common.replay')} onClick={() => { if (reachedReading) { setChrome(0); setDealt(false); send({ type: 'REPLAY' }); } }}>{t('gift.pill.replay')}</Pill>
        </div>
      </section>

      {hasExtras ? (
        <Drawer open={state === 'drawer'} onOpenChange={(o) => { if (!o) send({ type: 'CLOSE' }); }} title={t('gift.more.drawerTitle', {}, voice)} closeLabel={t('a11y.closeDrawer')}>
          {songs.length ? (
            <MusicDock
              title={songTitle} tracks={songs} current={track} state="idle"
              onSelect={(i) => { setTrack(i); const u = songs[i]?.url; if (safeHttpUrl(u)) window.open(u, '_blank', 'noopener'); }}
              onToggle={() => { const i = track ?? 0; setTrack(i); const u = songs[i]?.url; if (safeHttpUrl(u)) window.open(u, '_blank', 'noopener'); }}
              labels={{
                track: (n) => t('gift.songs.trackLabel', { number: n }, voice),
                playing: t('gift.songs.playing', {}, voice),
                paused: t('gift.songs.openIn', { service: serviceOf(songs[track ?? 0]?.url ?? '') }, voice),
                toggle: t('a11y.toggleMusic'),
              }}
            />
          ) : null}
          {days ? (
            <section className="gift-days" data-testid="gift-days">
              <h3 className="gift-days__title">{t('gift.more.days', {}, voice)}</h3>
              <p className="gift-days__count">{t('gift.days.together', { days: daysTogether(days) }, voice)}</p>
              <p className="gift-days__since">{t('gift.days.since', { date: formatIsoDate(days.startDate) }, voice)}</p>
            </section>
          ) : null}
        </Drawer>
      ) : null}

      {/* ---------- C6 lightbox ---------- */}
      <SharedLightbox
        open={lightboxOpen} layoutId={`gift-photo-${openedPhoto.current}`} onClose={() => send({ type: 'CLOSE' })} ariaLabel={t('gift.photos.title', {}, voice)}
        controls={photos.length ? (
          <div className="gift-lb__controls" data-testid="gift-lightbox">
            <button type="button" className="gift-lb__btn" aria-label={t('gift.photos.prev')} onClick={() => send({ type: 'PHOTO_TO', index: (ctx.photo + photos.length - 1) % photos.length })}>‹</button>
            <span className="gift-lb__counter" aria-live="polite">{t('gift.photos.counter', { index: ctx.photo + 1, total: photos.length })}</span>
            <button type="button" className="gift-lb__btn" aria-label={t('gift.photos.next')} onClick={() => send({ type: 'PHOTO_TO', index: (ctx.photo + 1) % photos.length })}>›</button>
            <button type="button" className="gift-lb__btn gift-lb__close" aria-label={t('common.close')} data-testid="gift-lightbox-close" onClick={() => send({ type: 'CLOSE' })}>×</button>
          </div>
        ) : null}
      >
        {photos[ctx.photo] ? (
          <div className="gift-lb__frame">
            <Polaroid key={ctx.photo} src={resolveMedia(photos[ctx.photo]!.ref)} caption={photos[ctx.photo]!.caption} tiltDeg={0} width={300} />
          </div>
        ) : null}
      </SharedLightbox>

      {/* ---------- opener ---------- */}
      {inOpener ? (
        mechanic === 'box' ? <BoxOpener key={ctx.plays} {...sceneProps} /> : <EnvelopeOpener key={ctx.plays} {...sceneProps} />
      ) : null}

      {/* ---------- C7 + C13 ---------- */}
      {armFinale || finale || state === 'end' ? (
        <EndCard ready={state === 'end'} entrance={state === 'end' && (cleared || !finale)} voice={voice} senderName={gift.names.from} seed={seed} timeScale={timeScale} preview={preview}
          decorRef={endDecor} onReplaySwap={onReplaySwap} />
      ) : null}
      {/* pre-mounted (idle) while the reader is on the letter, so the tap frame does no mount work */}
      {armFinale || finale ? (
        <FinaleOverlay go={finale} seed={seed} timeScale={timeScale} targets={{ pull: pullRef, rail: railRef, cta: ctaRef, endDecor }}
          onSwap={onSwap} onCleared={() => setCleared(true)} onDone={() => setFinale(false)} />
      ) : null}
    </main>
  );
}
