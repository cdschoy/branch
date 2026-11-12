/**
 * Ambient loops (G3: ≤1 hint loop on the target + ≤1 slow prop): P25 idleFloat · P26 trapezoidSway ·
 * P27 pendulum · P28 hintRing · P29 reelSpin · P44 idleWobble (owner: primitives).
 * All are OFF under reduced motion (static pose; hint ring → static 2 px outline; reels half speed).
 * TODO(primitives): implement from tokens.ambient / tokens.primitive.idleWobble.
 */
import type { LoopProps } from './types';
import { StubBox } from './_stub';

/** P25: y 0 ↔ −2.5 px, 3 s inOutSine; cancelled on tap. */
export function IdleFloat(p: LoopProps) { return <StubBox name="IdleFloat" {...p} />; }
/** P26: origin 50% 100%; 0° 0-17%, 2.7° 50-67%, 0° 100%; 800 ms linear. 1-2 props only. */
export function TrapezoidSway(p: LoopProps) { return <StubBox name="TrapezoidSway" {...p} />; }

export interface PendulumProps extends LoopProps {
  /** Increment to give an impulse (spring.pendulum), then a ±0.4° breeze at 4.8 s. */
  impulse?: number;
}
/** P27: ±1° about the top, legs 0.9 s / 1.47 s. */
export function Pendulum(p: PendulumProps) { return <StubBox name="Pendulum" {...p} />; }

export interface HintPulseProps extends LoopProps { tone?: 'onArt' | 'onCream'; size?: number }
/** P28: scale 1 → 1.8 linear 800 ms, opacity in 100 / hold / out 300; repeats every 1.2-1.6 s. (ui/HintRing renders it.) */
export function HintPulse(p: HintPulseProps) { return <StubBox name="HintPulse" className={p.className} style={p.style}>{p.children}</StubBox>; }

export interface ReelSpinProps extends LoopProps {
  /** Bound to the real media state: spins only while 'playing'. */
  playing: boolean;
  reverse?: boolean;
}
/** P29: 360° per 1.1 s linear; right reel reversed. */
export function ReelSpin(p: ReelSpinProps) { return <StubBox name="ReelSpin" className={p.className} style={p.style}>{p.children}</StubBox>; }

/** P44: the tap target's irregular hint loop (may exceed ±3°, G3 exemption); cancelled on first touch. */
export function IdleWobble(p: LoopProps) { return <StubBox name="IdleWobble" {...p} />; }
