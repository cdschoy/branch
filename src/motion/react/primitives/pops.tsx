/**
 * P01 stampPop · P02 stickerPop · P03 letterPop · P04 polaroidDeal (owner: primitives).
 * TODO(primitives): implement on motion/react with spring.stamp / spring.sticker / spring.letterPop /
 * easing.standard + stagger.polaroidDeal from tokens; reduced = opacity 200 ms outQuad (stamp: 100 ms).
 */
import type { OneShotProps } from './types';
import { StubBox, useStubDone } from './_stub';

/** P01: mount at opacity 1, scale 1.12 → 1 on spring.stamp; exit opacity-only 60-70 ms linear. */
export function StampPop(p: OneShotProps) { useStubDone(p.onDone, p.play, p.playKey); return <StubBox name="StampPop" {...p} />; }
/** P02: scale 0 → 1 on spring.sticker, opacity over the first 67 ms. Objects < ~15% of the viewport. */
export function StickerPop(p: OneShotProps) { useStubDone(p.onDone, p.play, p.playKey); return <StubBox name="StickerPop" {...p} />; }
/** P03: opacity .18 → 1 in 67 ms, scale .93 → 1.012 → 1 on spring.letterPop. */
export function LetterPop(p: OneShotProps) { useStubDone(p.onDone, p.play, p.playKey); return <StubBox name="LetterPop" {...p} />; }

export interface PolaroidDealProps extends OneShotProps {
  /** Deal order (delay = index × stagger.polaroidDeal). */
  index: number;
  /** Rest tilt in degrees (seeded from proportion.polaroid.tiltDeg). Arrives from tilt − 5°. */
  tiltDeg: number;
  /** Second deal: stacks 8 px lower (only when > 3 photos). */
  stack?: boolean;
}
/** P04: opacity 280 ms standard; y +5…+12 → 0; scale .90 → 1.02 → 1 over 120-160 ms; stagger 150 ms. */
export function PolaroidDeal(p: PolaroidDealProps) {
  useStubDone(p.onDone, p.play, p.playKey);
  return <StubBox name="PolaroidDeal" className={p.className} style={{ ...p.style, rotate: `${p.tiltDeg}deg` }}>{p.children}</StubBox>;
}
