/**
 * C2: sweet box (FRAMEWORK §4.3 C2; owner: gift).
 *  - C2a (clock: 'gesture'): the ribbon tug is scrubbed by drag progress p = dragPx / 50; the bow is a
 *    12-frame painted sequence (art.tsx RibbonFrames) chosen by the C2.bowTug step's seek. A tap on the
 *    bow plays the same tug scripted over 367 ms. Released under 50 px, the bow relaxes 200 ms outQuad
 *    and the glint chase replays once.
 *  - C2b: knot collapse → whip-off → pile → lid flip (rotateX 0 → 180, box +18 vh) → sticker →
 *    caption → hearts → pennants → treat twinkles.
 *  - Treats: 3 × 2 bites (P18 BiteTap); the caret note counts treats remaining.
 *  - C2c: props out, box → 72 px badge (layoutMove), letterPop, washi hearts, polaroid deals, replay pill.
 * Idle: one trapezoid-sway prop (the box) + the hint ring / glint on the ribbon tail (G3).
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { choreography, getTier, ticker, type Run, type Spec, type TargetMap } from '../../../motion/core';
import { ease } from '../../../motion/core/actions/math';
import { snapshotLayout } from '../../../motion/core/actions/primitives';
import { usePlay, useReducedMotion, TrapezoidSway, BiteTap, useHintLadder } from '../../../motion/react';
import { t } from '../../../i18n';
import { HintRing, Pill } from '../../../ui';
import { unlockAudio, playSfx } from '../../../audio';
import { recipientTreatsLeft, BITES_PER_TREAT } from '../../../machines';
import { BoxBody, BoxInside, BoxLid, BowKnot, HeartSticker, Pennant, RibbonBands, RibbonFrames, RibbonPile, Treat } from '../art';
import { G } from '../params';
import { fastForward, type SceneProps } from './shared';
import { SkipEffects } from './SkipEffects';

const C2a = choreography.C2a as Spec;
const C2b = choreography.C2b as Spec;
const C2c = choreography.C2c as Spec;
const PENNANTS = ['var(--c-blush-400)', 'var(--c-accent-gold)', 'var(--c-accent-sage)'];

export function BoxOpener({ gift, voice, seed, state, ctx, send, reading, timeScale, photoCount, onTypingStart, onDealt }: SceneProps) {
  const play = usePlay();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const lid = useRef<HTMLDivElement>(null);
  const ribbon = useRef<HTMLDivElement>(null);
  const knot = useRef<HTMLDivElement>(null);
  const loopHeart = useRef<HTMLSpanElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const pile = useRef<HTMLDivElement>(null);
  const sticker = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const heartsOrigin = useRef<HTMLDivElement>(null);
  const pennants = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const props = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLDivElement>(null);
  const run = useRef<Run | null>(null);
  const gesture = useRef<Run | null>(null);
  const drag = useRef<{ x0: number; id: number; moved: boolean } | null>(null);
  const progress = useRef(0);
  const released = useRef(false);
  const [frame, setFrame] = useState(0);
  const [glintKey, setGlintKey] = useState(0);
  const [treatsOn, setTreatsOn] = useState(false);
  const [twinkle, setTwinkle] = useState(false);
  const [badge, setBadge] = useState(false);
  const landing = state === 'landing';
  const ladder = useHintLadder(landing);
  const data = { photoCount, giftId: gift.id ?? '' };

  /* ---------------- C2a: gesture clock ---------------- */
  const gestureRun = useCallback((): Run => {
    if (gesture.current && gesture.current.state !== 'cancelled' && gesture.current.state !== 'finished') return gesture.current;
    const refs: TargetMap = {
      bow: () => ({
        seek: (ms: number) => setFrame(Math.max(0, Math.min(G.ribbon.frames - 1, Math.floor((ms / G.ribbon.tugMs) * G.ribbon.frames)))),
        revert: () => setFrame(0),
        finish: () => setFrame(G.ribbon.frames - 1),
      }),
      loopHeart,
      labels,
    };
    gesture.current = play(C2a, refs, { seed, timeScale, data, slot: 'gesture' });
    return gesture.current;
  }, [play, seed, timeScale]); // eslint-disable-line react-hooks/exhaustive-deps

  const setP = useCallback((p: number) => {
    progress.current = Math.max(0, Math.min(1, p));
    gestureRun().seek(progress.current * G.ribbon.tugMs);
  }, [gestureRun]);

  /** Tween p with the shared ticker (gesture clocks are driven by the caller). */
  const tweenP = useCallback((to: number, ms: number, easeName: 'linear' | 'outQuad', done?: () => void) => {
    const from = progress.current;
    const f = ease(easeName);
    const t0 = ticker.now();
    const total = ms / Math.max(0.1, timeScale);
    const stop = ticker.add((now) => {
      const u = Math.min(1, (now - t0) / total);
      setP(from + (to - from) * f(u));
      if (u >= 1) { stop(); done?.(); }
    });
  }, [setP, timeScale]);

  /* ---------------- C2b: release timeline ---------------- */
  const release = useCallback(() => {
    if (released.current) return;
    released.current = true;
    gesture.current?.skip();
    playSfx('paper.pop');
    send({ type: 'TAP' });
    const refs: TargetMap = {
      bowKnot: knot, ribbon, lid, box, sticker,
      // the whipped ribbon becomes the crumpled pile (C2.pileIn crossfade)
      pile: { el: pile, run: () => { if (ribbon.current) ribbon.current.style.visibility = 'hidden'; } },
      caption: { el: caption, run: () => { setTreatsOn(true); } },
      hearts: heartsOrigin,
      pennant1: pennants[0], pennant2: pennants[1], pennant3: pennants[2],
      treats: () => { setTwinkle(true); return { persistent: true }; },
    };
    const r = play(C2b, refs, { seed, timeScale, data, slot: 'opener' });
    run.current = r;
    void r.finished.then(() => { if (r.state !== 'cancelled') { setTreatsOn(true); send({ type: 'CHOREO_DONE' }); } });
  }, [play, seed, timeScale, send]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!landing || released.current) return;
    unlockAudio();
    drag.current = { x0: e.clientX, id: e.pointerId, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 4) d.moved = true;
    if (d.moved) setP(Math.max(0, dx) / G.ribbon.thresholdPx);
  };
  const onUp = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || released.current) return;
    if (!d.moved) {
      // single-tap fallback: the same tug scripted over C2.bowTug's 367 ms, then release
      playSfx('tap');
      tweenP(1, G.ribbon.tugMs, 'linear', release);
      return;
    }
    if (progress.current >= 1) release();
    else tweenP(0, G.ribbon.relaxMs, 'outQuad', () => setGlintKey((k) => k + 1));
  };
  /** Keyboard / switch users: Enter or Space on the ribbon is the tap fallback. */
  const onKey = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && landing && !released.current) { e.preventDefault(); tweenP(1, G.ribbon.tugMs, 'linear', release); }
  };

  /* ---------------- treats → C2c ---------------- */
  const spread = useCallback(() => {
    const refs: TargetMap = {
      props, pile, note,
      box: {
        el: box,
        run: () => {
          const el = box.current;
          if (!el) return;
          snapshotLayout(el);
          el.style.transform = 'none';
          setBadge(true);
          el.classList.add('is-badge');
          if (lid.current) lid.current.style.opacity = '0';
        },
      },
      letter: reading.letter,
      washi: reading.tape,
      polaroid1: { el: { current: reading.photos.current?.[0] ?? null } },
      polaroid2: { el: { current: reading.photos.current?.[1] ?? null } },
      polaroid3: { el: { current: reading.photos.current?.[2] ?? null } },
      polaroid4: { el: { current: reading.photos.current?.[3] ?? null } },
      polaroid5: { el: { current: reading.photos.current?.[4] ?? null } },
      polaroid6: { el: { current: reading.photos.current?.[5] ?? null } },
      replayPill: reading.replayPill,
    };
    const r = play(C2c, refs, { seed, timeScale, data, slot: 'opener' });
    run.current = r;
    void r.finished.then(() => {
      if (r.state === 'cancelled') return;
      onDealt();
      onTypingStart();
      send({ type: 'CHOREO_DONE' });
    });
  }, [play, seed, timeScale, reading, send, onDealt, onTypingStart]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state !== 'spreading') return;
    const id = setTimeout(spread, G.treats.advanceMs);
    return () => clearTimeout(id);
  }, [state, spread]);

  useEffect(() => () => { run.current?.cancel(); gesture.current?.cancel(); }, []);

  const onStage = () => {
    if (state === 'opening' || state === 'spreading') fastForward(run.current, timeScale, G.fastForward);
  };

  const left = recipientTreatsLeft(ctx.bites);
  const bitesLeft = ctx.bites.reduce((n, b) => n + (BITES_PER_TREAT - b), 0);
  const taken = ctx.bites.reduce((n, b) => n + b, 0);
  const noteText = taken === 0 ? null
    : bitesLeft === 0 ? t('gift.treats.done', {}, voice)
      : bitesLeft === 1 ? t('gift.treats.lastBite', {}, voice)
        : taken === 1 ? t('gift.treats.firstBite', { count: left }, voice)
          : t('gift.treats.left', { count: left }, voice);
  const showFallback = landing && (ladder === 'double' || ladder === 'retype');
  const treatsLive = state === 'treats';
  const treatsRef = useRef<HTMLDivElement>(null);
  // When the lid opens, hand focus to the first treat (keyboard users land on what they can act on).
  useEffect(() => {
    if (!treatsLive) return;
    const first = treatsRef.current?.querySelector<HTMLButtonElement>('button');
    if (first && (document.activeElement === document.body || !root.current?.contains(document.activeElement) || document.activeElement === root.current)) first.focus({ preventScroll: true });
  }, [treatsLive]);

  return (
    <div ref={root} className="gift-opener gift-opener--box" data-testid="gift-opener" onPointerDown={onStage} data-badge={badge || undefined} data-spread={state === 'spreading' || undefined}>
      <div className="gift-opener__bg" aria-hidden="true" />
      <p className="gift-opener__from">{t('gift.landing.from', {}, voice)}</p>

      <div className="gift-boxstage">
        <div ref={props} className="gift-boxprops">
          <div className="gift-pennants" aria-hidden="true">
            {pennants.map((r, i) => <div key={i} ref={r} className="gift-pennant" style={{ opacity: 0 }}><Pennant fill={PENNANTS[i]!} /></div>)}
          </div>
          <p ref={caption} className="gift-caption" style={{ opacity: 0 }} aria-hidden={!treatsLive || undefined}>{t('gift.treats.prompt', {}, voice)}</p>
          {/* Hidden under the lid until the box opens: not focusable, not announced (inert + aria-hidden). */}
          <div ref={treatsRef} className="gift-treats" data-on={treatsOn || undefined} inert={!treatsLive} aria-hidden={!treatsLive || undefined}
            data-twinkle={twinkle && !reduced && getTier() !== 'low' ? '' : undefined}
            style={{ '--twinkle-ms': `${G.treats.twinkleMs[0]}ms`, '--twinkle-ms-2': `${G.treats.twinkleMs[1]}ms` } as CSSProperties}>
            {[0, 1, 2].map((i) => {
              const b = ctx.bites[i] ?? 0;
              return (
                <BiteTap key={i} className="gift-treat" bites={b} remaining={left} note={false} ariaLabel={t('gift.treats.aria', { index: i + 1 })}
                  onBite={() => { if (state === 'treats' && b < BITES_PER_TREAT) { playSfx('tap'); send({ type: 'BITE', treat: i }); } }}>
                  <span data-testid={`gift-treat-${i}`} className="gift-treat__art"><Treat kind={i as 0 | 1 | 2} bites={b} /></span>
                </BiteTap>
              );
            })}
          </div>
        </div>
        {noteText ? (
          <div ref={note} className="gift-note" role="status"><span key={noteText}>{noteText}</span></div>
        ) : <div ref={note} className="gift-note gift-note--empty" />}

        <div ref={box} className="gift-box">
          <TrapezoidSway active={landing} className="gift-box__sway">
            <div className="gift-box__inside" aria-hidden="true"><BoxInside /></div>
            <div className="gift-box__body"><BoxBody /></div>
            <div ref={lid} className="gift-box__lid"><BoxLid /></div>
            <div ref={sticker} className="gift-sticker" style={{ opacity: 0 }} aria-hidden="true"><HeartSticker /></div>
            <div ref={heartsOrigin} className="gift-box__hearts" aria-hidden="true" />
            <div ref={ribbon} className="gift-ribbon">
              <div className="gift-ribbon__bands" aria-hidden="true"><RibbonBands /></div>
              <button
                type="button" className="gift-ribbon__bow" aria-label={t('a11y.ribbon')} data-testid="gift-ribbon"
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { drag.current = null; tweenP(0, G.ribbon.relaxMs, 'outQuad'); }}
                onKeyDown={onKey} disabled={!landing}
              >
                <RibbonFrames frame={frame} frames={G.ribbon.frames} />
                <span ref={loopHeart} className="gift-ribbon__heart" aria-hidden="true" />
                <span key={glintKey} className="gift-ribbon__glint" aria-hidden="true" data-on={landing && !reduced ? '' : undefined} />
                <span className="gift-ribbon__ring"><HintRing active={landing} ladder tone="onArt" /></span>
              </button>
              <div ref={knot} className="gift-ribbon__knot" aria-hidden="true"><BowKnot /></div>
            </div>
          </TrapezoidSway>
        </div>
        <div ref={pile} className="gift-pile" style={{ opacity: 0 }} aria-hidden="true"><RibbonPile /></div>

        <div ref={labels} className="gift-labels">
          <p className="gift-label">{t('gift.label.pullRibbon')}</p>
          <p className="gift-sublabel">{t('gift.box.tapFallback')}</p>
        </div>
        {showFallback ? (
          <div className="gift-fallback" onPointerDown={(e) => e.stopPropagation()}>
            <Pill variant="action" onClick={() => tweenP(1, G.ribbon.tugMs, 'linear', release)}>{t('a11y.openFallback')}</Pill>
          </div>
        ) : null}
      </div>

      <SkipEffects active={state === 'opening' || state === 'spreading'} onSkip={() => run.current?.skip()} />
    </div>
  );
}

/** The 72 px box badge left in the reading scene after C2c (same spot as the opener's badge). */
export function BoxBadge() {
  return <div className="gift-box is-badge gift-box--static" aria-hidden="true"><div className="gift-box__body"><BoxBody /></div></div>;
}

