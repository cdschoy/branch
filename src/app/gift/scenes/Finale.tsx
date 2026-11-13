/**
 * C7 flower-flood finale + C13 end card (FRAMEWORK §4.3 C7, C13; owner: gift).
 *
 * C7 (choreography.C7): chrome unmounts in one commit, the continue object leaves, a ghost-flower
 * veil steps to .12, a hero flower is thrown on a TRUE quadratic arc from the continue object to the
 * centre while spinning, settles, an impact flash fires BELOW the flowers, rays + burst mound + flood
 * wall run on the fx canvas, and the end card (pre-mounted, invisible) swaps in under the cover at
 * C7.swap. C13 then fades the end actions in; REPLAY plays the flower wipe and swaps back to the
 * landing under the cover (resetting the machine).
 */
import { useEffect, useRef, type RefObject } from 'react';
import { choreography, director, type Run, type Spec, type StepContext, type StepControl, type TargetMap } from '../../../motion/core';
import { ease, quad } from '../../../motion/core/actions/math';
import { usePlay, useReducedMotion } from '../../../motion/react';
import { t, type Voice } from '../../../i18n';
import { Pill } from '../../../ui';
import { playSfx } from '../../../audio';
import { hrefFor, navigate } from '../../router';
import { Bouquet, HangingBunting, HeroFlower, PaintedWall } from '../art';
import { G, subSpec } from '../params';

const C7 = choreography.C7 as Spec;
const C13 = choreography.C13 as Spec;
/** C13 holds the entrance rows and the REPLAY rows in one table; each phase plays its own rows. */
export const C13entrance = subSpec(C13, 'C13entrance', ['C13.cardStill', 'C13.actionsIn'], false);
export const C13replay = subSpec(C13, 'C13replay', ['C13.replayWipe', 'C13.replaySwap', 'C13.replayLadder']);

const centreOf = (el: Element | null | undefined) => {
  const r = el?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 };
};

/** heroFlower: custom controls for the arc throw and the settle; the spin falls through to the DOM tween. */
function heroBinding(hero: RefObject<HTMLDivElement | null>, from: RefObject<Element | null>) {
  let start = { x: 0, y: 0 };
  let end = { x: 0, y: 0 };
  const place = (x: number, y: number) => { const el = hero.current; if (el) el.style.translate = `${x}px ${y}px`; };
  return {
    el: hero,
    run: (ctx: StepContext): StepControl | void => {
      const el = hero.current;
      if (!el) return;
      if (ctx.step.name === 'C7.heroThrow') {
        if (ctx.reduced) return {};
        const size = el.getBoundingClientRect().width;
        const a = centreOf(from.current);
        start = { x: a.x - size / 2, y: a.y - size / 2 };
        end = { x: innerWidth / 2 - size / 2, y: innerHeight / 2 - size / 2 };
        const lift = Math.hypot(end.x - start.x, end.y - start.y) * G.finale.arcLift;
        const ctrl = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - lift };
        const f = ease(ctx.step.ease ?? 'in');
        const apply = (ms: number) => {
          const u = f(Math.max(0, Math.min(1, ms / ctx.step.dur)));
          el.style.opacity = '1';
          place(quad(start.x, ctrl.x, end.x, u), quad(start.y, ctrl.y, end.y, u));
        };
        apply(0);
        playSfx('bloom');
        return { seek: apply, finish: () => apply(ctx.step.dur), revert: () => { el.style.opacity = '0'; } };
      }
      if (ctx.step.name === 'C7.heroSettle') {
        if (ctx.reduced) return {};
        const size = el.getBoundingClientRect().width;
        const dx = size * G.finale.settleDx, dy = size * G.finale.settleDy;
        const f = ease(ctx.step.ease ?? 'outQuad');
        const apply = (ms: number) => { const u = f(Math.max(0, Math.min(1, ms / ctx.step.dur))); place(end.x + dx * u, end.y + dy * u); };
        playSfx('coin');
        return { seek: apply, finish: () => apply(ctx.step.dur), revert: () => place(end.x, end.y) };
      }
      return undefined;
    },
  };
}

export interface FinaleTargets {
  readonly pull: RefObject<HTMLDivElement | null>;
  readonly rail: RefObject<HTMLDivElement | null>;
  readonly cta: RefObject<HTMLDivElement | null>;
  readonly endDecor: RefObject<HTMLDivElement | null>;
}

/**
 * The C7 overlay. Pre-mounted (idle, invisible, click-through) while the reader is on the letter so
 * the veil art is rendered and decoded before the tap (§4.6: no long frame inside a spectacle); plays
 * C7 once when `go` turns true. `onCleared` fires at C7.overlayUnmount (C13's t0); `onDone` when the
 * whole run (incl. the decor pendulum) has finished.
 */
export function FinaleOverlay({ go, seed, timeScale, targets, onSwap, onCleared, onDone }: {
  go: boolean; seed: number; timeScale: number; targets: FinaleTargets; onSwap: () => void; onCleared: () => void; onDone: () => void;
}) {
  const play = usePlay();
  const root = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const centre = useRef<HTMLDivElement>(null);
  const run = useRef<Run | null>(null);
  const cbs = useRef({ onSwap, onCleared, onDone });
  cbs.current = { onSwap, onCleared, onDone };

  useEffect(() => {
    if (!go || run.current) return;
    let cleared = false;
    const clear = () => { if (!cleared) { cleared = true; cbs.current.onCleared(); } };
    const refs: TargetMap = {
      drawer: targets.pull, rail: targets.rail, tooltips: () => undefined,
      cta: targets.cta, veil,
      heroFlower: heroBinding(hero, targets.cta),
      impactFlash: flash,
      // 'rays+ring': the rays emitter draws the shockwave ring too, so the ring part is a no-op.
      rays: centre, ring: () => undefined, burst: centre, wall: centre, field: centre,
      scene: () => { cbs.current.onSwap(); },
      overlay: { el: root, run: () => { clear(); return undefined; } },
      hangingDecor: targets.endDecor,
    };
    const r = play(C7, refs, { seed, timeScale, slot: 'finale' });
    run.current = r;
    void r.finished.then(() => { if (r.state !== 'cancelled') { cbs.current.onSwap(); clear(); cbs.current.onDone(); } });
  }, [go]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => run.current?.cancel(), []);

  return (
    <div ref={root} className="gift-finale" data-testid="gift-finale" data-idle={go ? undefined : ''} aria-hidden={go ? undefined : true}
      onPointerDown={() => run.current?.setTimeScale(timeScale * G.fastForward)}>
      <div ref={veil} className="gift-finale__veil" style={{ opacity: 0 }} aria-hidden="true"><PaintedWall seed={seed + 1} /></div>
      <div ref={flash} className="gift-finale__flash" style={{ opacity: 0 }} aria-hidden="true" />
      <div ref={centre} className="gift-finale__centre" aria-hidden="true" />
      <div ref={hero} className="gift-finale__hero" style={{ opacity: 0 }} aria-hidden="true"><HeroFlower /></div>
    </div>
  );
}

/** C13 end card: pre-mounted under the C7 cover (`ready` false = invisible + inert). */
export function EndCard({ ready, entrance, voice, senderName, seed, timeScale, preview, decorRef, onReplaySwap }: {
  /** C7.swap reached: visible and interactive. */
  ready: boolean;
  /** C7.overlayUnmount reached (C13's t0): play the actions entrance and take focus. */
  entrance: boolean;
  voice: Voice; senderName: string; seed: number; timeScale: number; preview: boolean;
  decorRef: RefObject<HTMLDivElement | null>; onReplaySwap: () => void;
}) {
  const play = usePlay();
  const reduced = useReducedMotion();
  const actions = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const replaying = useRef(false);

  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!ready || !entrance) return;
    title.current?.focus({ preventScroll: true });
    const r = play(C13entrance, { endCard: card, endActions: actions }, { seed, timeScale, slot: 'c13' });
    void r.finished.then(() => { if (actions.current) actions.current.style.opacity = '1'; });
  }, [ready, entrance]); // eslint-disable-line react-hooks/exhaustive-deps

  const replay = () => {
    if (replaying.current) return;
    replaying.current = true;
    // director.play, not usePlay: the run must outlive this card, which unmounts at C13.replaySwap
    const r = director.play(C13replay, {
      flowers: card,
      scene: () => { onReplaySwap(); },
      hero: () => undefined,
    }, { seed, timeScale });
    void r.finished.then(() => { replaying.current = false; });
  };

  return (
    <section ref={card} className="gift-end" data-testid="gift-end" data-ready={ready || undefined} data-reduced={reduced || undefined}
      aria-hidden={!ready || undefined} inert={!ready || undefined}>
      <div ref={decorRef} className="gift-decor gift-decor--end" aria-hidden="true"><HangingBunting /></div>
      <div className="gift-end__art" aria-hidden="true"><Bouquet size={150} /></div>
      <h1 ref={title} tabIndex={-1} className="gift-end__title">{t('gift.finale.thanks', {}, voice)}</h1>
      <p className="gift-end__from">{t('gift.end.from', { senderName })}</p>
      <div ref={actions} className="gift-end__actions" style={{ opacity: 0 }}>
        <Pill variant="action" onClick={replay}>{t('gift.end.replay')}</Pill>
        {preview ? null : (
          <>
            <p className="gift-end__reply">{t('gift.reply.title')}</p>
            <Pill variant="link" onClick={() => navigate(hrefFor({ name: 'create' }))}>{t('gift.reply.makeYourOwn')}</Pill>
            <Pill variant="link" onClick={() => navigate(hrefFor({ name: 'booth' }))}>{t('gift.reply.strip')}</Pill>
          </>
        )}
      </div>
    </section>
  );
}
