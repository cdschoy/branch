/**
 * Ambient loops (G3: ≤1 hint loop on the target + ≤1 slow prop): P25 idleFloat · P26 trapezoidSway ·
 * P27 pendulum · P28 hintRing · P29 reelSpin · P44 idleWobble (owner: primitives).
 * All are OFF under reduced motion (static pose; hint ring → static 2 px outline) except the reels,
 * which still run while playing, at half speed.
 */
import { animate, type AnimationPlaybackControls } from 'motion';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { duration, spring } from '../../core/tokens';
import { ticker } from '../../core/ticker';
import { springValue, wobbleSegments } from '../../core/actions/math';
import { useReducedMotion, useTicker } from '../hooks';
import type { LoopProps } from './types';
import { P, tw, cx } from './_shared';

/** P25: y 0 ↔ −2.5 px, 3 s inOutSine; cancelled (y → 0 in 100 ms) when active turns false. */
export function IdleFloat({ active = true, children, className, style }: LoopProps) {
  const reduced = useReducedMotion();
  const on = active && !reduced;
  const f = P.idleFloat;
  return (
    <motion.div className={className} style={style} data-primitive="idleFloat"
      animate={on ? { y: [...f.translateYpx] } : { y: 0 }}
      transition={on ? { ...tw(f.periodMs, 'inOutSine'), repeat: Infinity } : tw(duration.xfast, 'outQuad')}
    >{children}</motion.div>
  );
}

/** P26: origin 50% 100%; 0° 0-17%, 2.7° 50-67%, 0° 100%; 800 ms linear. 1-2 props only. */
export function TrapezoidSway({ active = true, children, className, style }: LoopProps) {
  const reduced = useReducedMotion();
  const on = active && !reduced;
  const s = P.trapezoidSway;
  return (
    <motion.div className={className} style={{ transformOrigin: s.origin, ...style }} data-primitive="trapezoidSway"
      animate={on ? { rotate: [...s.values] } : { rotate: 0 }}
      transition={on ? { ...tw(s.periodMs, 'linear'), times: [...s.keyTimes], repeat: Infinity } : tw(duration.xfast, 'outQuad')}
    >{children}</motion.div>
  );
}

export interface PendulumProps extends LoopProps {
  /** Increment to give an impulse (spring.pendulum), then a ±0.4° breeze at 4.8 s. */
  impulse?: number;
}
/** P27: ±1° about the top, legs 0.9 s / 1.47 s. An impulse rides spring.pendulum (period .93 s) on the ticker, then the breeze. */
export function Pendulum({ active = true, impulse = 0, children, className, style }: PendulumProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const p = P.pendulum;
  const [mode, setMode] = useState<'idle' | 'impulse' | 'breeze'>('idle');
  const t0 = useRef(0);
  const first = useRef(impulse);
  useEffect(() => { if (impulse !== first.current) { t0.current = ticker.now(); setMode('impulse'); } }, [impulse]);
  const on = active && !reduced;
  useTicker((now) => {
    const el = ref.current;
    if (!el) return;
    const ms = now - t0.current;
    el.style.rotate = `${springValue('pendulum', p.impulseDeg, 0, ms)}deg`;
    if (ms >= spring.pendulum.settleMs) setMode('breeze');
  }, on && mode === 'impulse');
  useEffect(() => {
    const el = ref.current;
    if (!el || !on || mode === 'impulse') { if (el && !on) el.style.rotate = ''; return; }
    el.style.rotate = '';
    const [a, b] = p.rotateDeg;
    const anim: AnimationPlaybackControls = mode === 'idle'
      ? animate(el, { rotate: [a, b, a] }, { ...tw(p.periodMs, 'inOutSine'), times: [...p.legTimes], repeat: Infinity })
      : animate(el, { rotate: [0, p.breeze.rotateDeg, 0, -p.breeze.rotateDeg, 0] }, { ...tw(p.breeze.periodMs, 'inOutSine'), repeat: Infinity });
    return () => anim.stop();
  }, [on, mode, p]);
  return <div ref={ref} className={className} style={{ transformOrigin: p.origin, ...style }} data-primitive="pendulum" data-mode={mode}>{children}</div>;
}

export interface HintPulseProps extends LoopProps {
  tone?: 'onArt' | 'onCream';
  size?: number;
  /** Double cadence (hint ladder +8 s): the optional faster second pulse joins. */
  double?: boolean;
}
/** P28: scale 1 → 1.8 linear 800 ms, opacity in / hold / out; repeats every ~1.4 s. Reduced: static 2 px outline. */
export function HintPulse({ active = true, tone = 'onCream', size = P.hintRing.diameterPx, double, children, className, style }: HintPulseProps) {
  const reduced = useReducedMotion();
  const h = P.hintRing;
  const ring = (delayMs: number, k: number) => (
    <motion.span
      key={k}
      className={cx('prim-ring', `prim-ring--${tone}`)}
      style={{ width: size, height: size }}
      initial={{ scale: h.scale[0], opacity: 0 }}
      animate={{ scale: [...h.scale], opacity: [...h.opacity] }}
      transition={{
        scale: { ...tw(h.periodMs, 'linear', delayMs), repeat: Infinity, repeatDelay: (h.repeatEveryMs - h.periodMs) / 1000 },
        opacity: { ...tw(h.periodMs, 'linear', delayMs), times: [...h.opacityTimes], repeat: Infinity, repeatDelay: (h.repeatEveryMs - h.periodMs) / 1000 },
      }}
    />
  );
  return (
    <span className={cx('prim-hint', className)} style={style} data-primitive="hintRing">
      {children}
      {active ? (reduced
        ? <span className={cx('prim-ring', 'prim-ring--static', `prim-ring--${tone}`)} style={{ width: size, height: size }} />
        : <>{ring(0, 0)}{double ? ring(h.fastPulseMs, 1) : null}</>) : null}
    </span>
  );
}

export type HintStage = 'ambient' | 'ring' | 'prompt' | 'double' | 'retype' | 'cancelled';
/**
 * The hint ladder (FRAMEWORK §5.1, tokens.hintLadder): ambient at 0, ring at +1.2 s, prompt at +4 s,
 * double cadence at +8 s, retype + vibrate at +15 s; the first touch anywhere cancels it.
 */
export function useHintLadder(armed: boolean, restartKey?: unknown): HintStage {
  const [stage, setStage] = useState<HintStage>('ambient');
  useEffect(() => {
    setStage('ambient');
    if (!armed) return;
    const l = P.hintRing.ladder;
    const steps: [number, HintStage][] = [[l.hintRingMs, 'ring'], [l.promptMs, 'prompt'], [l.doubleCadenceMs, 'double'], [l.retypeAndVibrateMs, 'retype']];
    const timers = steps.map(([ms, s]) => setTimeout(() => setStage((cur) => (cur === 'cancelled' ? cur : s)), ms));
    const cancel = () => setStage('cancelled');
    addEventListener('pointerdown', cancel, { once: true, capture: true });
    return () => { timers.forEach(clearTimeout); removeEventListener('pointerdown', cancel, { capture: true }); };
  }, [armed, restartKey]);
  return stage;
}

export interface ReelSpinProps extends LoopProps {
  /** Bound to the real media state: spins only while 'playing'. */
  playing: boolean;
  reverse?: boolean;
}
/**
 * P29: 360° per 1.1 s linear; right reel reversed. Driven by the shared ticker and FROZEN at its
 * current angle when `playing` is false (fixes the v5 C-e15 anti-pattern of reels spinning while
 * paused). Reduced: half speed while playing.
 */
export function ReelSpin({ playing, reverse, active = true, children, className, style }: ReelSpinProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const degPerMs = (360 / P.reelSpin.periodMs) * (reduced ? P.reelSpin.reducedFactor : 1) * (reverse ? -1 : 1);
  useTicker((_now, dt) => {
    angle.current = (angle.current + degPerMs * Math.min(dt, 50)) % 360;
    if (ref.current) ref.current.style.rotate = `${angle.current}deg`;
  }, playing && active);
  return <div ref={ref} className={className} style={style} data-primitive="reelSpin" data-playing={playing || undefined}>{children}</div>;
}

/**
 * P44: the tap target's irregular hint loop: x ±4 % of width, y 0…+7 % of height, rotate −1.5…+10°,
 * inOutSine legs of 400-633 ms, small (≤3°) for the first ~1.5 s (G3 exemption). Cancelled (back to
 * rest in 100 ms) when `active` turns false. Reduced: static 2 px outline.
 */
export function IdleWobble({ active = true, seed = 1, children, className, style }: LoopProps & { seed?: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const segs = useMemo(() => wobbleSegments(seed, 16, P.idleWobble), [seed]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active || reduced) { const a = animate(el, { x: 0, y: 0, rotate: 0 }, tw(duration.xfast, 'outQuad')); return () => a.stop(); }
    const total = segs.reduce((n, s) => n + s.ms, 0);
    const kf = { x: ['0%', ...segs.map((s) => `${s.x}%`), '0%'], y: ['0%', ...segs.map((s) => `${s.y}%`), '0%'], rotate: [0, ...segs.map((s) => s.r), 0] };
    const last = segs[segs.length - 1];
    const end = total + (last ? last.ms : 0);
    const times = [0, ...segs.map((s) => (s.t0 + s.ms) / end), 1];
    const a = animate(el, kf, { ...tw(end, 'inOutSine'), times, repeat: Infinity });
    return () => a.stop();
  }, [active, reduced, segs]);
  return (
    <div ref={ref} className={cx(className, reduced && active && 'prim-outline')} style={style} data-primitive="idleWobble">{children}</div>
  );
}

export interface CassetteProps extends LoopProps {
  /** TRUE media state: pass `state === 'playing'` from the player's playing/pause/waiting events. */
  playing: boolean;
  /** Width in px (default 132). */
  width?: number;
}
/**
 * The songs-page cassette (FRAMEWORK §2 v5 #6, P29): an original sage tape with two separate reels
 * that counter-rotate at 1.1 s/rev ONLY while `playing`. On pause / waiting the reels freeze at their
 * current angle (no anti-pattern spin, no snap back). Procedural SVG in token colours.
 */
export function Cassette({ playing, active = true, width = 132, className, style }: CassetteProps) {
  const reel = (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
      <circle cx="12" cy="12" r="11" fill="var(--c-cream-50)" />
      <circle cx="12" cy="12" r="4" fill="var(--c-ink-700)" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x="11" y="2.6" width="2" height="4.2" rx="1" fill="var(--c-ink-700)" transform={`rotate(${a} 12 12)`} />
      ))}
    </svg>
  );
  return (
    <div className={cx('prim-cassette', className)} style={{ width, ...style }} data-primitive="cassette" data-playing={playing || undefined}>
      <svg viewBox="0 0 132 84" aria-hidden="true" className="prim-cassette__body">
        <rect x="2" y="2" width="128" height="80" rx="10" fill="var(--c-accent-sage)" />
        <rect x="12" y="10" width="108" height="20" rx="4" fill="var(--c-cream-100)" />
        <path d="M20 20h60" stroke="var(--c-blush-400)" strokeWidth="2" strokeLinecap="round" />
        <rect x="26" y="36" width="80" height="30" rx="15" fill="var(--c-ink-700)" opacity=".85" />
        <path d="M34 82 42 70h48l8 12" fill="var(--c-accent-forest-soft)" />
      </svg>
      <ReelSpin playing={playing} active={active} className="prim-cassette__reel prim-cassette__reel--l">{reel}</ReelSpin>
      <ReelSpin playing={playing} active={active} reverse className="prim-cassette__reel prim-cassette__reel--r">{reel}</ReelSpin>
    </div>
  );
}
