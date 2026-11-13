/**
 * P01 stampPop · P02 stickerPop · P03 letterPop · P04 polaroidDeal (owner: primitives).
 * Springs come from tokens (spring.stamp / sticker / letterPop); reduced = opacity 200 ms outQuad
 * (stamp: 100 ms). Changing `playKey` remounts and replays; `play={false}` holds the start pose.
 */
import { motion } from 'motion/react';
import { springT } from '../../core/tokens';
import { noise } from '../../core/actions/math';
import { useReducedMotion } from '../hooks';
import type { OneShotProps } from './types';
import { P, reducedPop, tw, useDoneOnce } from './_shared';

/** Pose held while `play` is false. */
const HIDDEN = { opacity: 0 } as const;

export interface PopProps extends OneShotProps {
  /** Start after this many ms (e.g. a sticker after a page change, a letter ~30 ms after a layout move). */
  delayMs?: number;
}

/** P01: mount at opacity 1, scale 1.12 → 1 on spring.stamp; exit opacity-only 70 ms linear (inside AnimatePresence). */
export function StampPop({ play = true, playKey, onDone, delayMs = 0, children, className, style }: PopProps) {
  const reduced = useReducedMotion();
  const done = useDoneOnce(onDone, play, playKey);
  const s = P.stampPop;
  const initial = reduced ? { opacity: 0 } : { opacity: 1, scale: s.fromScale };
  return (
    <motion.div
      key={`${String(playKey)}:${play ? 1 : 0}`}
      className={className}
      style={style}
      initial={play ? initial : HIDDEN}
      animate={play ? (reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }) : HIDDEN}
      exit={{ opacity: 0, transition: tw(s.exitMs, 'linear') }}
      transition={reduced ? tw(s.reducedMs, 'outQuad', delayMs) : { ...springT('stamp'), delay: delayMs / 1000 }}
      onAnimationComplete={done}
      data-primitive="stampPop"
    >{children}</motion.div>
  );
}

export interface StickerPopProps extends PopProps {
  /** 'spring' (spring.sticker, default) or the 167 ms outBack tween. */
  curve?: 'spring' | 'outBack';
}
/** P02: scale 0 → 1 on spring.sticker, opacity over the first 67 ms. Objects < ~15% of the viewport. */
export function StickerPop({ play = true, playKey, onDone, delayMs = 0, curve = 'spring', children, className, style }: StickerPopProps) {
  const reduced = useReducedMotion();
  const done = useDoneOnce(onDone, play, playKey);
  const d = delayMs / 1000;
  const initial = reduced ? reducedPop.initial : { opacity: 0, scale: 0 };
  return (
    <motion.div
      key={`${String(playKey)}:${play ? 1 : 0}`}
      className={className}
      style={style}
      initial={play ? initial : HIDDEN}
      animate={play ? (reduced ? reducedPop.animate : { opacity: 1, scale: 1 }) : HIDDEN}
      transition={reduced ? tw(P.reducedMs, 'outQuad', delayMs) : {
        scale: curve === 'spring' ? { ...springT('sticker'), delay: d } : tw(P.stickerPop.tweenMs, 'outBack', delayMs),
        opacity: tw(P.stickerPop.opacityMs, 'linear', delayMs),
      }}
      onAnimationComplete={done}
      data-primitive="stickerPop"
    >{children}</motion.div>
  );
}

/** P03: opacity .18 → 1 in 67 ms, scale .93 → 1.008 → 1 on spring.letterPop (tier 1). Automatic arrivals only (audit 1.6). */
export function LetterPop({ play = true, playKey, onDone, delayMs = 0, children, className, style }: PopProps) {
  const reduced = useReducedMotion();
  const done = useDoneOnce(onDone, play, playKey);
  const l = P.letterPop;
  const initial = reduced ? reducedPop.initial : { opacity: l.fromOpacity, scale: l.fromScale };
  return (
    <motion.div
      key={`${String(playKey)}:${play ? 1 : 0}`}
      className={className}
      style={style}
      initial={play ? initial : HIDDEN}
      animate={play ? (reduced ? reducedPop.animate : { opacity: 1, scale: 1 }) : HIDDEN}
      transition={reduced ? tw(P.reducedMs, 'outQuad', delayMs) : {
        scale: { ...springT('letterPop'), delay: delayMs / 1000 },
        opacity: tw(l.opacityMs, 'linear', delayMs),
      }}
      onAnimationComplete={done}
      data-primitive="letterPop"
    >{children}</motion.div>
  );
}

export interface PolaroidDealProps extends OneShotProps {
  /** Deal order (delay = index × stagger.polaroidDeal). */
  index: number;
  /** Rest tilt in degrees (seeded from proportion.polaroid.tiltDeg). Arrives from tilt − 5°. */
  tiltDeg: number;
  /** Second deal: stacks 8 px lower (only when > 3 photos). */
  stack?: boolean;
}
/** P04: opacity 280 ms standard; y +5…+12 → 0; scale .90 → 1.02 → 1 over ~140 ms; rotate tilt − 5° → tilt; stagger 150 ms. */
export function PolaroidDeal({ index, tiltDeg, stack, play = true, playKey, onDone, children, className, style }: PolaroidDealProps) {
  const reduced = useReducedMotion();
  const done = useDoneOnce(onDone, play, playKey);
  const d = P.polaroidDeal;
  const delay = index * d.staggerMs;
  const rest = stack ? d.stackPx : 0;
  const [y0, y1] = d.yFromPx;
  const yFrom = rest + y0 + (y1 - y0) * noise(7, index);
  const initial = reduced ? { opacity: 0, rotate: tiltDeg, y: rest } : { opacity: 0, y: yFrom, scale: d.scale[0], rotate: tiltDeg + d.tiltFromDeg };
  return (
    <motion.div
      key={`${String(playKey)}:${play ? 1 : 0}`}
      className={className}
      style={style}
      initial={play ? initial : HIDDEN}
      animate={play ? (reduced ? { opacity: 1, rotate: tiltDeg, y: rest } : { opacity: 1, y: rest, scale: [...d.scale], rotate: tiltDeg }) : HIDDEN}
      transition={reduced ? tw(P.reducedMs, 'outQuad', delay) : {
        opacity: tw(d.opacityMs, 'standard', delay),
        y: tw(d.scaleMs, 'outQuad', delay),
        scale: { ...tw(d.scaleMs, 'outQuad', delay), times: [...d.scaleTimes] },
        rotate: tw(d.opacityMs, 'standard', delay),
      }}
      onAnimationComplete={done}
      data-primitive="polaroidDeal"
      data-tilt={tiltDeg}
    >{children}</motion.div>
  );
}
