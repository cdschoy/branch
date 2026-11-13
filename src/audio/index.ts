/**
 * Audio (FRAMEWORK §5.6; owner: gift). One AudioContext unlocked on the first gesture (tap 1 of C1
 * also unlocks audio). The starter has no SFX sprite file yet, so each SfxId is a tiny ORIGINAL
 * synthesized cue (oscillator + envelope); swap `playSfx` to decode the commissioned sprite later.
 * Reduced motion does NOT mute sound. Sound is opt-out via setSfxEnabled(false) (common.sfx).
 */
import { duration } from '../motion/core/tokens';

let ctx: AudioContext | null = null;
let enabled = true;

/** Call inside the first user gesture handler. Safe to call repeatedly. */
export function unlockAudio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch { ctx = null; }
  return ctx;
}

export function setSfxEnabled(v: boolean): void { enabled = v; }

export type SfxId = 'tap' | 'paper.pop' | 'shutter' | 'print' | 'bloom' | 'coin';

/** Pitch (Hz), end pitch, length (a duration token), wave, peak gain. */
const CUES: Record<SfxId, readonly [number, number, number, OscillatorType, number]> = {
  tap: [740, 620, duration.micro, 'sine', 0.06],
  'paper.pop': [420, 260, duration.xfast, 'triangle', 0.07],
  shutter: [1800, 900, duration.frame, 'square', 0.03],
  print: [220, 200, duration.dip, 'sawtooth', 0.02],
  bloom: [520, 880, duration.modal, 'sine', 0.05],
  coin: [988, 1318, duration.fast, 'triangle', 0.05],
};

export function playSfx(id: SfxId, opts: { volume?: number } = {}): void {
  if (!enabled || !ctx || ctx.state !== 'running') return;
  try {
    const [f0, f1, ms, type, peak] = CUES[id];
    const t0 = ctx.currentTime;
    const len = ms / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f1, t0 + len);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak * (opts.volume ?? 1), t0 + Math.min(0.01, len / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + len + 0.02);
  } catch { /* audio is optional */ }
}
