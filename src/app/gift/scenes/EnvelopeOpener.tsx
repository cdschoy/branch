/**
 * C1: envelope → tap wobble → paper dip → bloom burst → "chạm để xem" prompt → curtain drop → letter
 * (FRAMEWORK §4.3 C1; owner: gift). Both taps run generated specs (choreography.C1a / C1b) through
 * the Director; this component only supplies targets. Step names are the C-table rows.
 *
 * Wall: the bloom emitter covers the stage; under it a DOM wall of pre-rendered flower tiles fades in
 * at C1.edgeSettle, so when the emitter stops the wall is already there and drifts as a CSS translateY
 * (C1.wallDrift, 12.5 vh/s). Tap 2 drops it with the curtainDrop action (y → 105 vh, wash, fade, mask).
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { choreography, type Run, type Spec, type TargetMap } from '../../../motion/core';
import { usePlay, useReducedMotion, IdleFloat, TimedPrompt, Typewriter, useHintLadder } from '../../../motion/react';
import { t } from '../../../i18n';
import { HintRing, Pill } from '../../../ui';
import { unlockAudio, playSfx } from '../../../audio';
import { Bouquet, EnvelopeClosed, EnvelopeOpen, PaintedWall } from '../art';
import { G } from '../params';
import { fastForward, type SceneProps } from './shared';
import { SkipEffects } from './SkipEffects';

const C1a = choreography.C1a as Spec;
const C1b = choreography.C1b as Spec;

export function EnvelopeOpener({ gift, voice, seed, state, send, reading, timeScale, photoCount, onTypingStart }: SceneProps) {
  const play = usePlay();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const seedEl = useRef<HTMLDivElement>(null);
  const bloomOrigin = useRef<HTMLDivElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const run = useRef<Run | null>(null);
  /** One tap per gate even if pointerdown and click both arrive (G15: at most one queued). */
  const taken = useRef({ t1: false, t2: false });
  const [wallOn, setWallOn] = useState(false);
  const [drift, setDrift] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const landing = state === 'landing';
  const ladder = useHintLadder(landing);

  const data = { photoCount, giftId: gift.id ?? '' };

  const tap1 = useCallback(() => {
    if (state !== 'landing' || taken.current.t1) return;
    taken.current.t1 = true;
    unlockAudio();
    playSfx('tap');
    send({ type: 'TAP' });
    const refs: TargetMap = {
      envelope, hintRing: ring, prompt: label, envelopeArt: art, bouquetSeed: seedEl,
      bloom: { el: bloomOrigin, run: () => { playSfx('bloom'); } },
      bloomEdges: { el: bloomOrigin, run: () => { setWallOn(true); } },
      // C1.promptContinue mounts on run.finished (P08), never on its offset
      promptContinue: () => undefined,
      wall: () => { setWallOn(true); setDrift(true); },
    };
    const r = play(C1a, refs, { seed, timeScale, data, slot: 'opener' });
    run.current = r;
    void r.finished.then(() => {
      if (r.state === 'cancelled') return;
      setWallOn(true); setDrift(true); setPrompt(true);
      send({ type: 'CHOREO_DONE' });
    });
  }, [state, send, play, seed, timeScale]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap2 = useCallback(() => {
    if (state !== 'prompt' || !prompt || taken.current.t2) return;
    taken.current.t2 = true;
    playSfx('paper.pop');
    send({ type: 'TAP' });
    const refs: TargetMap = {
      promptContinue: () => { setPrompt(false); },
      wall,
      overlay: root,
      letter: () => { onTypingStart(); },
      hangingDecor: reading.decor,
    };
    const r = play(C1b, refs, { seed, timeScale, data, slot: 'opener' });
    run.current = r;
    void r.finished.then(() => { if (r.state !== 'cancelled') send({ type: 'CHOREO_DONE' }); });
  }, [state, prompt, send, play, seed, timeScale, reading.decor, onTypingStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // G15: during a spectacle a stage tap fast-forwards; while the prompt shows, a tap is tap 2.
  const onStage = () => {
    if (state === 'opening' || state === 'revealing') fastForward(run.current, timeScale, G.fastForward);
    else if (state === 'prompt') tap2();
  };

  useEffect(() => () => run.current?.cancel(), []);

  const wallStyle = { '--wall-drift-s': `${(G.wall.tileVh / G.wall.vhPerSec)}s` } as CSSProperties;
  const showFallback = landing && (ladder === 'double' || ladder === 'retype');

  return (
    <div ref={root} className="gift-opener gift-opener--envelope" data-testid="gift-opener" data-wall={wallOn || undefined} onPointerDown={onStage}>
      <div className="gift-opener__bg" aria-hidden="true" />
      <p className="gift-opener__from">{t('gift.landing.from', {}, voice)}</p>

      <div className="gift-hero">
        <IdleFloat active={landing}>
          <div ref={envelope} className="gift-envelope">
            <button
              type="button" className="gift-envelope__btn" aria-label={t('a11y.envelope')} data-testid="gift-hero"
              onClick={tap1} disabled={!landing}
            >
              <div ref={art} className="gift-envelope__art">
                <div data-layer="out" className="gift-layer"><EnvelopeClosed /></div>
                <div data-layer="in" className="gift-layer" style={{ opacity: 0 }}><EnvelopeOpen /></div>
              </div>
              <span ref={ring} className="gift-envelope__ring"><HintRing active={landing} ladder tone="onArt" /></span>
            </button>
          </div>
        </IdleFloat>
        <div ref={seedEl} className="gift-bouquet" style={{ opacity: 0 }} aria-hidden="true"><Bouquet size={132} /></div>
        <div ref={bloomOrigin} className="gift-bloom-origin" aria-hidden="true" />
        <p ref={label} className="gift-label">
          {ladder === 'retype' ? <Typewriter as="span" text={t('gift.label.tapToOpen')} playKey="retype" /> : t('gift.label.tapToOpen')}
        </p>
        {showFallback ? (
          <div className="gift-fallback" onPointerDown={(e) => e.stopPropagation()}>
            <Pill variant="action" onClick={tap1}>{t('a11y.openFallback')}</Pill>
          </div>
        ) : null}
      </div>

      <div ref={wall} className="gift-wall" style={wallStyle} aria-hidden="true" data-drift={drift && !reduced ? '' : undefined}>
        <div className="gift-wall__strip">
          <div className="gift-wall__tile"><PaintedWall seed={seed} /></div>
          <div className="gift-wall__tile"><PaintedWall seed={seed} /></div>
        </div>
        <div className="gift-wall__wash" data-wash="" />
      </div>

      <div className="gift-prompt" data-testid="gift-prompt" data-shown={prompt || undefined}>
        <TimedPrompt show={prompt}>
          <button type="button" className="gift-prompt__btn" onClick={tap2}>{t('gift.label.tapToReveal', {}, voice)}</button>
        </TimedPrompt>
      </div>

      <SkipEffects active={state === 'opening' || state === 'revealing'} onSkip={() => run.current?.skip()} />
    </div>
  );
}
