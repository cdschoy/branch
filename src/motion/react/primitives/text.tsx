/**
 * P06 textBlurIn · P07 tooltipRise · P08 timedPrompt · P42 typewriter (owner: primitives).
 * TODO(primitives): Typewriter must NFC + split with graphemes() from src/i18n, pre-lay-out spans
 * (nowrap per word), flip an `.on` class from ONE ticker callback with n = floor((now − t0)/ms), rate
 * from typewriterPlan(), tap completes, reduced = full text at once. The stub renders the full text.
 */
import type { BaseProps, OneShotProps } from './types';
import { StubBox, useStubDone } from './_stub';
import { nfc } from '../../../i18n';

export interface TextBlurInProps extends OneShotProps { variant?: 'short' | 'dreamy' }
/** P06: blur 4 → 0 + opacity 230-270 ms textIn (dreamy: 10 → 0 over 1.8 s); low tier: scale .98 → 1. */
export function TextBlurIn(p: TextBlurInProps) { useStubDone(p.onDone, p.play, p.playKey); return <StubBox name="TextBlurIn" {...p} />; }

export interface TooltipRiseProps extends BaseProps { show: boolean }
/** P07: opacity + y 1.25 px → 0, 167 ms outQuart. */
export function TooltipRise(p: TooltipRiseProps) { return p.show ? <StubBox name="TooltipRise" {...p} /> : null; }

export interface TimedPromptProps extends BaseProps {
  /** Mount on the preceding spectacle's run.finished (never a bare timer). Removed instantly when false. */
  show: boolean;
}
/** P08: opacity 0 → .85 over 200 ms outQuad. */
export function TimedPrompt(p: TimedPromptProps) { return p.show ? <StubBox name="TimedPrompt" {...p} /> : null; }

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
export function Typewriter(p: TypewriterProps) {
  useStubDone(p.onDone, p.play, p.playKey);
  const Tag = p.as ?? 'p';
  return <Tag className={p.className} style={p.style} data-stub="Typewriter">{nfc(p.text)}</Tag>;
}
