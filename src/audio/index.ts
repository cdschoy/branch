/**
 * Audio (FRAMEWORK §5.6; owner: gift). Optional in the starter. STUB with final signatures:
 * one AudioContext unlocked on the first gesture (tap 1 of C1 also unlocks audio), SFX sprite,
 * ducking under voice notes. Reduced motion does NOT mute sound.
 */
let ctx: AudioContext | null = null;

/** Call inside the first user gesture handler. Safe to call repeatedly. */
export function unlockAudio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch { ctx = null; }
  return ctx;
}

export type SfxId = 'tap' | 'paper.pop' | 'shutter' | 'print' | 'bloom' | 'coin';
/** TODO(gift): decode an original SFX sprite and play the named slice. */
export function playSfx(_id: SfxId, _opts: { volume?: number } = {}): void { /* stub */ }
