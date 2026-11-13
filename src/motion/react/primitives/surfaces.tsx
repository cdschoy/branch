/**
 * P05 drawerSlide · P32 pageCrossfade · P33 paperDipCrossfade · P34 lidFlip3D · P36 sharedLightbox ·
 * P45 contentSwapInShell (owner: primitives). Zero overshoot on all of these (G1) except the lightbox
 * photo itself (tier 3).
 */
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { springT, duration, scrim as scrimTokens } from '../../core/tokens';
import { useReducedMotion } from '../hooks';
import type { BaseProps, OneShotProps } from './types';
import { P, tw, useDoneOnce, useLatest, cx } from './_shared';

const LAYER = { gridArea: '1 / 1' } as const;

export interface DrawerSlideProps extends BaseProps {
  open: boolean;
  /** 'sheet' (mobile bottom sheet, y), 'rail' (desktop right rail, x), 'dock' (booth dock, 610 ms dock ease). */
  variant: 'sheet' | 'rail' | 'dock';
  onClosed?: () => void;
  onOpened?: () => void;
}
/** P05: ONE tween, 560 ms drawer ease (dock 610 ms), opacity 360 ms; close 240 ms `in`. No scrim. Reduced: opacity 200 ms + 16 px. */
export function DrawerSlide({ open, variant, onOpened, onClosed, children, className, style }: DrawerSlideProps) {
  const reduced = useReducedMotion();
  const d = P.drawerSlide;
  const axis = variant === 'sheet' ? 'y' : 'x';
  const off = reduced ? d.reducedPx : axis === 'y' ? d.offY : d.offX;
  const ms = variant === 'dock' ? duration.dock : duration.drawer;
  const opened = useLatest(onOpened);
  const pose = (opacity: number, v: number | string) => (axis === 'y' ? { opacity, y: v } : { opacity, x: v });
  return (
    <AnimatePresence onExitComplete={onClosed}>
      {open ? (
        <motion.div
          key="drawer"
          className={className}
          style={style}
          data-primitive="drawerSlide"
          data-variant={variant}
          initial={pose(0, off)}
          animate={pose(1, 0)}
          exit={{ ...pose(0, off), transition: reduced ? tw(d.reducedMs, 'outQuad') : tw(d.closeMs, 'in') }}
          transition={reduced ? tw(d.reducedMs, 'outQuad') : {
            [axis]: tw(ms, variant === 'dock' ? 'dock' : 'drawer'),
            opacity: tw(d.opacityMs, 'outQuad'),
          }}
          onAnimationComplete={(def) => { if (def && typeof def === 'object' && 'opacity' in def && (def as { opacity: number }).opacity === 1) opened.current?.(); }}
        >{children}</motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export interface PageCrossfadeProps extends BaseProps {
  /** Changing the key crossfades old → new (opacity only, 240 ms outCubic, no dip). */
  pageKey: string;
}
/** P32: both pages stacked in one grid cell; old fades out at 0, new fades in from +20 ms; shared chrome stays outside. */
export function PageCrossfade({ pageKey, children, className, style }: PageCrossfadeProps) {
  const { outStep, inStep } = P.pageCrossfade;
  return (
    <div className={className} style={{ display: 'grid', ...style }} data-primitive="pageCrossfade">
      <AnimatePresence initial={false}>
        <motion.div
          key={pageKey}
          style={LAYER}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: tw(inStep.dur, 'outCubic', inStep.at) }}
          exit={{ opacity: 0, transition: tw(outStep.dur, 'outCubic', outStep.at) }}
        >{children}</motion.div>
      </AnimatePresence>
    </div>
  );
}

export interface PaperDipCrossfadeProps<S extends string = string> extends BaseProps {
  /** Current art state; on change both layers run 333 ms (out outQuad, in paperIn). */
  state: S;
  render: (state: S) => ReactNode;
  onDone?: () => void;
}
/** P33: for ONE artwork changing state. The two opacities sum to ~56 % mid-way so the paper shows through. */
export function PaperDipCrossfade<S extends string>({ state, render, onDone, className, style }: PaperDipCrossfadeProps<S>) {
  const reduced = useReducedMotion();
  const ms = reduced ? P.reducedMs : P.paperDip.ms;
  const first = useRef(true);
  useEffect(() => { first.current = false; }, []);
  return (
    <div className={className} style={{ display: 'grid', ...style }} data-primitive="paperDipCrossfade" data-state={state}>
      <AnimatePresence initial={false}>
        <motion.div
          key={state}
          style={LAYER}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: tw(ms, reduced ? 'outQuad' : 'paperIn') }}
          exit={{ opacity: 0, transition: tw(ms, 'outQuad') }}
          onAnimationComplete={() => { if (!first.current) onDone?.(); }}
        >{render(state)}</motion.div>
      </AnimatePresence>
    </div>
  );
}

export interface LidFlip3DProps extends BaseProps {
  open: boolean;
  lid: ReactNode;
  box: ReactNode;
  onDone?: () => void;
}
/** P34: lid rotateX 0 → 180° (perspective 700 px, bottom hinge) + box y +18 vh on ONE inOutCubic 280 ms. No landing spring. */
export function LidFlip3D({ open, lid, box, onDone, className, style }: LidFlip3DProps) {
  const reduced = useReducedMotion();
  const { step, perspectivePx } = P.lidFlip;
  const p = step.params as { rotateX: [number, number]; boxYVh: [number, number] };
  const t = reduced ? tw(P.reducedMs, 'outQuad') : tw(step.dur, 'inOutCubic');
  const done = useDoneOnce(onDone, open, open);
  return (
    <div className={cx('prim-lid', className)} style={{ position: 'relative', perspective: perspectivePx, ...style }} data-primitive="lidFlip3D" data-open={open || undefined}>
      <motion.div
        style={{ position: 'relative', zIndex: 0 }}
        initial={false}
        animate={{ y: open && !reduced ? `${p.boxYVh[1]}vh` : `${p.boxYVh[0]}vh` }}
        transition={t}
      >{box}</motion.div>
      <motion.div
        style={{ position: 'absolute', inset: 0, bottom: 'auto', zIndex: 1, transformOrigin: '50% 100%', backfaceVisibility: 'hidden' }}
        initial={false}
        animate={reduced ? { opacity: open ? 0 : 1 } : { rotateX: open ? p.rotateX[1] : p.rotateX[0], opacity: 1 }}
        transition={t}
        onAnimationComplete={() => { if (open) done(); }}
      >{lid}</motion.div>
    </div>
  );
}

export interface SharedLightboxProps extends BaseProps {
  open: boolean;
  /** Shared-element id linking the thumb and the hero (motion layoutId). */
  layoutId: string;
  onClose: () => void;
  /** Controls (‹ › × counter): fade in 200 ms from 430 ms (C6). */
  controls?: ReactNode;
  /** Accessible name for the dialog. */
  ariaLabel?: string;
}
/**
 * P36: thumb → hero on spring.lightbox; rotate snaps −4 → −1°; scrim (scrim.photo) linear 267 ms;
 * close FLIPs back on spring.modal (the thumb's transition, see LightboxThumb). Escape / scrim tap close.
 * Reduced: crossfade + scrim, no FLIP. Callers hide + inert the drawer and continue object (C6).
 */
export function SharedLightbox({ open, layoutId, onClose, controls, ariaLabel, children, className, style }: SharedLightboxProps) {
  const reduced = useReducedMotion();
  const l = P.lightbox;
  const close = useLatest(onClose);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialog.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close.current(); };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); prev?.focus?.({ preventScroll: true }); };
  }, [open, close]);
  return (
    <AnimatePresence>
      {open ? (
        <div key="lb" className="prim-lightbox" role="dialog" aria-modal="true" aria-label={ariaLabel} ref={dialog} tabIndex={-1} data-primitive="sharedLightbox">
          <motion.div
            className="prim-lightbox__scrim"
            onClick={() => close.current()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: tw(scrimTokens.photo.ms, 'linear') }}
            exit={{ opacity: 0, transition: tw(duration.base, 'linear') }}
          />
          <motion.div
            className={cx('prim-lightbox__hero', className)}
            style={style}
            layoutId={reduced ? undefined : layoutId}
            initial={reduced ? { opacity: 0 } : { rotate: l.rotateDeg[0] }}
            animate={reduced ? { opacity: 1 } : { rotate: l.rotateDeg[1] }}
            exit={reduced ? { opacity: 0 } : undefined}
            transition={reduced ? tw(P.reducedMs, 'outQuad') : { layout: springT('lightbox'), rotate: springT('lightbox') }}
          >{children}</motion.div>
          {controls ? (
            <motion.div
              className="prim-lightbox__controls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: tw(l.controlsMs, 'outQuad', reduced ? 0 : l.controlsAtMs) }}
              exit={{ opacity: 0, transition: tw(duration.xfast, 'in') }}
            >{controls}</motion.div>
          ) : null}
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export interface LightboxThumbProps extends BaseProps {
  layoutId: string;
  /** Rest tilt of the thumb (a Polaroid's seeded tilt). */
  tiltDeg?: number;
  onOpen?: () => void;
  ariaLabel?: string;
}
/** The thumb end of P36: its layout transition is spring.modal, so the close FLIP lands on it without overshoot. */
export function LightboxThumb({ layoutId, tiltDeg = 0, onOpen, ariaLabel, children, className, style }: LightboxThumbProps) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      className={cx('prim-thumb', className)}
      style={{ ...style, rotate: tiltDeg }}
      layoutId={reduced ? undefined : layoutId}
      transition={{ layout: springT('modal') }}
      onClick={onOpen}
      aria-label={ariaLabel}
    >{children}</motion.button>
  );
}

export interface ContentSwapInShellProps extends OneShotProps {
  /** Changing the key swaps the inner content (out 200 ms standard; new object at +267 ms). */
  contentKey: string;
}
/** P45: the shell persists; inner content fades out 200 ms standard, the new object hard-cuts in at +267 ms. Unchanged under reduced. */
export function ContentSwapInShell({ contentKey, onDone, children, className, style }: ContentSwapInShellProps) {
  const c = P.contentSwap;
  const first = useRef(true);
  useEffect(() => { first.current = false; }, []);
  return (
    <div className={className} style={{ display: 'grid', ...style }} data-primitive="contentSwapInShell">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={contentKey}
          style={LAYER}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0, delay: (c.newObjectMountAtMs - c.outMs) / 1000 } }}
          exit={{ opacity: 0, transition: tw(c.outMs, 'standard') }}
          onAnimationComplete={() => { if (!first.current) onDone?.(); }}
        >{children}</motion.div>
      </AnimatePresence>
    </div>
  );
}
