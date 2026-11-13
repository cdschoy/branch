/**
 * P15 tapWobble · P16 pressSquash · P17 hoverGrow · P18 biteTap (owner: primitives).
 * Hooks return handlers to spread on the tap target so the answer lands on the same frame (rule 2).
 * Reduced motion keeps every same-frame swap and drops the transforms.
 */
import { animate } from 'motion';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useRef, useState, type PointerEvent, type PointerEventHandler, type RefObject } from 'react';
import { isReducedMotion } from '../../core/reduced';
import { ticker } from '../../core/ticker';
import { t } from '../../../i18n';
import type { BaseProps } from './types';
import { P, tw, cx } from './_shared';

/** P15: rotate [0, −2, 1.9, −1]° at [0, .33, .62, 1] over 233 ms inOutSine; keeps −1°. Returns a trigger. */
export function useTapWobble(ref: RefObject<Element | null>): () => Promise<void> {
  return useCallback(async () => {
    const el = ref.current;
    if (!el || isReducedMotion()) return;
    const w = P.tapWobble;
    await animate(el, { rotate: [...w.rotate] }, { ...tw(w.ms, 'inOutSine'), times: [...w.times] });
  }, [ref]);
}

type Squash = { onPointerDown?: PointerEventHandler; onPointerUp?: PointerEventHandler; onPointerCancel?: PointerEventHandler };
/** P16: containers scale (1.01, .995) on pointerdown, release in ~50 ms with no bounce; UI pills scale .97 for 70 ms on pointerup. */
export function usePressSquash(kind: 'container' | 'pill'): Squash {
  return useMemo<Squash>(() => {
    const s = P.pressSquash;
    const el = (e: PointerEvent) => e.currentTarget as HTMLElement;
    if (kind === 'pill') {
      return {
        onPointerUp: (e) => { if (!isReducedMotion()) void animate(el(e), { scale: [1, s.pill, 1] }, tw(s.pillMs, 'outQuad')); },
      };
    }
    const release = (e: PointerEvent) => { if (!isReducedMotion()) void animate(el(e), { scaleX: 1, scaleY: 1 }, tw(s.releaseMs, 'outQuad')); };
    return {
      onPointerDown: (e) => { if (!isReducedMotion()) void animate(el(e), { scaleX: s.container[0], scaleY: s.container[1] }, tw(s.pressMs, 'outQuad')); },
      onPointerUp: release,
      onPointerCancel: release,
    };
  }, [kind]);
}

export interface HoverGrowProps extends BaseProps {
  /** 1.06 for small round buttons, 1.04 for the drawer pull; @media (hover:hover) only. */
  amount?: 'button' | 'pull';
}
/** P17: CSS-only (primitives.css) so it never fires on touch; never the only affordance. */
export function HoverGrow({ amount = 'button', children, className, style }: HoverGrowProps) {
  return <span className={cx('prim-hovergrow', `prim-hovergrow--${amount}`, className)} style={style} data-primitive="hoverGrow">{children}</span>;
}

export interface BiteTapProps extends BaseProps {
  /** Bites taken so far for this item; the sprite swaps on the same frame. */
  bites: number;
  /** Treats remaining (drives gift.treats.left on the first bite). */
  remaining: number;
  onBite: () => void;
  ariaLabel: string;
}
const CRUMBS = [[-1, -0.6], [0.8, -0.9], [0.2, -1.2]] as const;
/**
 * P18: same-frame sprite swap (the caller re-renders children from `bites`), a 2-frame heart charm,
 * crumb sparkles over 70-170 ms, container squash; the first bite pops a caret note (scale .86 → 1)
 * with gift.treats.left. Taps inside the 200 ms debounce are ignored.
 */
export function BiteTap({ bites, remaining, onBite, ariaLabel, children, className, style }: BiteTapProps) {
  const last = useRef(-Infinity);
  const [burst, setBurst] = useState(0);
  const [charm, setCharm] = useState(false);
  const squash = usePressSquash('container');
  const b = P.biteTap;
  const reduced = isReducedMotion();
  const onClick = () => {
    const now = ticker.now();
    if (now - last.current < b.debounceMs) return;
    last.current = now;
    onBite();
    setBurst((n) => n + 1);
    if (!reduced) { setCharm(true); setTimeout(() => setCharm(false), b.charmMs); }
  };
  return (
    <button type="button" className={cx('prim-bite', className)} style={style} aria-label={ariaLabel} onClick={onClick} {...squash} data-primitive="biteTap" data-bites={bites}>
      {children}
      {charm ? <svg className="prim-bite__charm" viewBox="0 0 20 18" aria-hidden="true"><path d="M10 17 1.8 9A4.6 4.6 0 0 1 10 3a4.6 4.6 0 0 1 8.2 6Z" /></svg> : null}
      {!reduced && burst ? (
        <span key={burst} className="prim-bite__crumbs" aria-hidden="true">
          {CRUMBS.map(([x, y], i) => (
            <motion.i key={i} className="prim-bite__crumb"
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: `${x * 100}%`, y: `${y * 100}%`, scale: 0.6 }}
              transition={tw(b.crumbMs[0] + ((b.crumbMs[1] - b.crumbMs[0]) * i) / (CRUMBS.length - 1), 'outQuad')} />
          ))}
        </span>
      ) : null}
      <AnimatePresence>
        {bites === 1 ? (
          <motion.span key="note" className="prim-bite__note" role="status"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: b.noteFromScale }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: tw(b.noteMs, 'in') }}
            transition={reduced ? tw(P.reducedMs, 'outQuad') : tw(b.noteMs, 'outQuad')}
          >{t('gift.treats.left', { count: remaining })}</motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}
