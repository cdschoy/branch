/**
 * P06 textBlurIn · P07 tooltipRise · P08 timedPrompt · P42 typewriter (owner: primitives).
 */
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { typewriterPlan } from '../../core/tokens';
import { ticker } from '../../core/ticker';
import { getTier } from '../../core/tier';
import { graphemes, nfc, words } from '../../../i18n';
import { useReducedMotion } from '../hooks';
import type { BaseProps, OneShotProps } from './types';
import { P, reducedPop, tw, useDoneOnce, useLatest, cx } from './_shared';

export interface TextBlurInProps extends OneShotProps { variant?: 'short' | 'dreamy'; delayMs?: number }
/**
 * P06 (the lyric "blur fade"): blur 4 → 0 + opacity 230-270 ms textIn; dreamy 10 → 0 over 1.8 s.
 * Budgets: mid tier caps text blur at 4 px, low tier uses scale .98 → 1 instead of blur.
 */
export function TextBlurIn({ variant = 'short', delayMs = 0, play = true, playKey, onDone, children, className, style }: TextBlurInProps) {
  const reduced = useReducedMotion();
  const done = useDoneOnce(onDone, play, playKey);
  const tier = getTier();
  const b = P.textBlurIn;
  const dreamy = variant === 'dreamy';
  const ms = dreamy ? b.dreamyMs : b.shortMs;
  const px = dreamy && tier === 'high' ? b.dreamyPx : b.shortPx;
  const from = reduced ? reducedPop.initial
    : tier === 'low' ? { opacity: 0, scale: b.lowScale }
    : { opacity: 0, filter: `blur(${px}px)` };
  const to = reduced ? reducedPop.animate : tier === 'low' ? { opacity: 1, scale: 1 } : { opacity: 1, filter: 'blur(0px)' };
  return (
    <motion.div
      key={`${String(playKey)}:${play ? 1 : 0}`}
      className={className}
      style={style}
      initial={from}
      animate={play ? to : from}
      transition={reduced ? tw(P.reducedMs, 'outQuad', delayMs) : tw(ms, dreamy ? 'outQuad' : 'textIn', delayMs)}
      onAnimationComplete={done}
      data-primitive="textBlurIn"
    >{children}</motion.div>
  );
}

export interface TooltipRiseProps extends BaseProps { show: boolean }
/** P07: opacity + y 1.25 px → 0, 167 ms outQuart; micro exit 100 ms `in`. */
export function TooltipRise({ show, children, className, style }: TooltipRiseProps) {
  const reduced = useReducedMotion();
  const r = P.tooltipRise;
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="tip"
          role="tooltip"
          className={className}
          style={style}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: r.yPx }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: tw(r.exitMs, 'in') }}
          transition={reduced ? tw(P.reducedMs, 'outQuad') : tw(r.ms, 'outQuart')}
          data-primitive="tooltipRise"
        >{children}</motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export interface TimedPromptProps extends BaseProps {
  /** Mount on the preceding spectacle's run.finished (never a bare timer). Removed instantly when false. */
  show: boolean;
}
/** P08: opacity 0 → .85 over 200 ms outQuad; removed instantly (no exit). */
export function TimedPrompt({ show, children, className, style }: TimedPromptProps) {
  if (!show) return null;
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: P.timedPrompt.opacity }}
      transition={tw(P.timedPrompt.ms, 'outQuad')}
      data-primitive="timedPrompt"
      aria-live="polite"
    >{children}</motion.div>
  );
}

export interface TypewriterProps extends OneShotProps {
  text: string;
  /** Override the per-unit rate (ms) / unit; default typewriterPlan(graphemeCount). */
  msPer?: number;
  unit?: 'grapheme' | 'word' | 'line';
  /** Fires 600-1000 ms after the last glyph (completion cue). */
  onCue?: () => void;
  /** Element type for the text container. */
  as?: 'p' | 'div' | 'span';
}

interface Glyph { readonly g: string; readonly unit: number }
interface Word { readonly glyphs: readonly Glyph[]; readonly space: string; readonly br: boolean }

/** Pre-layout: NFC → words (nowrap spans) → graphemes, each tagged with the reveal unit it belongs to. */
function layout(text: string, unit: 'grapheme' | 'word' | 'line'): { words: Word[]; units: number } {
  const out: Word[] = [];
  let u = 0;
  const lines = nfc(text).split('\n');
  lines.forEach((line, li) => {
    const ws: { text: string; space: string }[] = [];
    for (const seg of words(line)) {
      const last = ws[ws.length - 1];
      if (seg.space) { if (last) last.space += seg.text; else ws.push({ text: '', space: seg.text }); }
      else ws.push({ text: seg.text, space: '' });
    }
    ws.forEach((w, wi) => {
      const gs = graphemes(w.text).map((g) => {
        const glyph = { g, unit: u };
        if (unit === 'grapheme') u++;
        return glyph;
      });
      if (unit === 'word' && gs.length) u++;
      out.push({ glyphs: gs, space: w.space, br: li < lines.length - 1 && wi === ws.length - 1 });
    });
    if (!ws.length && li < lines.length - 1) out.push({ glyphs: [], space: '', br: true });
    if (unit === 'line') u++;
  });
  return { words: out, units: u };
}

/**
 * P42: time-anchored typewriter. n = floor((now − t0 − startDelay) / ms) from ONE ticker callback;
 * glyph spans are pre-laid-out (nowrap per word) and flip an `.on` class (≤20 ms fade), so wrapping
 * never reflows. Rate min(127, 3220/n) ms, floor 25 ms; > 130 graphemes reveal per word. No caret.
 * Tap completes. Reduced motion: the full text at once (tap/cue gates unchanged). The full text is
 * the accessible name; the spans are aria-hidden.
 */
export function Typewriter({ text, msPer, unit, onCue, as = 'p', play = true, playKey, onDone, className, style }: TypewriterProps) {
  const reduced = useReducedMotion();
  const clean = useMemo(() => nfc(text), [text]);
  const plan = useMemo(() => typewriterPlan(graphemes(clean).length), [clean]);
  const u = unit ?? plan.unit;
  const rate = msPer ?? (u === 'line' ? P.typewriter.lineMs : plan.msPer);
  const lay = useMemo(() => layout(clean, u), [clean, u]);
  const root = useRef<HTMLElement>(null);
  const [complete, setComplete] = useState(false);
  const done = useDoneOnce(onDone, play, `${String(playKey)}|${clean}`);
  const cue = useLatest(onCue);

  useEffect(() => {
    setComplete(false);
    const el = root.current;
    if (!el || !play) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>('[data-u]'));
    let shown = 0;
    let cueTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      spans.forEach((s) => s.classList.add('on'));
      setComplete(true);
      done();
      cueTimer = setTimeout(() => cue.current?.(), P.typewriter.cueMs);
    };
    if (reduced || !lay.units) { finish(); return () => clearTimeout(cueTimer); }
    const t0 = ticker.now() + plan.startDelayMs;
    let stop: (() => void) | null = null;
    const tick = (now: number) => {
      const n = Math.min(lay.units, Math.floor((now - t0) / rate) + 1);
      if (n <= shown) return;
      for (const s of spans) { const k = Number(s.dataset.u); if (k >= shown && k < n) s.classList.add('on'); }
      shown = n;
      if (n >= lay.units) { stop?.(); stop = null; finish(); }
    };
    stop = ticker.add(tick);
    const skip = () => { if (stop) { stop(); stop = null; finish(); } };
    el.addEventListener('pointerup', skip);
    return () => { stop?.(); el.removeEventListener('pointerup', skip); clearTimeout(cueTimer); };
  }, [play, playKey, lay, rate, reduced, plan.startDelayMs, done, cue]);

  const Tag = as;
  const fade = { '--tw-fade': `${P.typewriter.glyphFadeMs}ms` } as CSSProperties;
  return (
    <Tag
      ref={root as never}
      className={cx('prim-tw', complete && 'is-done', className)}
      style={{ ...fade, ...style }}
      aria-label={clean}
      data-primitive="typewriter"
      data-units={lay.units}
    >
      {lay.words.map((w, wi) => (
        <span key={wi}>
          <span className="prim-tw__word" aria-hidden="true">
            {w.glyphs.map((g, gi) => <span key={gi} className="prim-tw__g" data-u={g.unit}>{g.g}</span>)}
          </span>
          {w.space ? <span aria-hidden="true">{w.space}</span> : null}
          {w.br ? <br /> : null}
        </span>
      ))}
    </Tag>
  );
}
