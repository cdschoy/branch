/** Lab: P06 blur fade, P07 tooltip, P08 timed prompt, P42 typewriter (owner: primitives). */
import { useState } from 'react';
import type { LabEntry } from '../../../app/lab/registry';
import { graphemeCount, t } from '../../../i18n';
import { typewriterPlan } from '../../core/tokens';
import { StickerPop } from './pops';
import { TextBlurIn, TimedPrompt, TooltipRise, Typewriter } from './text';
import { FlowerArt, LabBtn, Readout, Stage } from './_lab';

function BlurDemo({ variant }: { variant: 'short' | 'dreamy' }) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(0);
  return (
    <Stage controls={<LabBtn onClick={() => setN((x) => x + 1)}>{t('lab.replay')}</LabBtn>}>
      <Readout testId={`done-P06-${variant}`}>{done ? `done ×${done}` : '…'}</Readout>
      <TextBlurIn playKey={n} variant={variant} onDone={() => setDone((d) => d + 1)} className="plab-lyric">
        {t(variant === 'dreamy' ? 'lab.prim.lyricDreamy' : 'lab.prim.lyric')}
      </TextBlurIn>
    </Stage>
  );
}

function TooltipDemo() {
  const [show, setShow] = useState(false);
  return (
    <Stage controls={<LabBtn onClick={() => setShow((s) => !s)} pressed={show}>{t('lab.prim.toggle')}</LabBtn>}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
        <FlowerArt />
        <div style={{ minHeight: 40 }}>
          <TooltipRise show={show} className="ui-continue__tip" style={{ position: 'static' }}>{t('lab.prim.tooltip')}</TooltipRise>
        </div>
      </div>
    </Stage>
  );
}

/** P08: the prompt mounts on the spectacle's completion (here the sticker's onDone), never on a bare timer. */
function PromptDemo() {
  const [n, setN] = useState(0);
  const [show, setShow] = useState(false);
  return (
    <Stage controls={<LabBtn onClick={() => { setShow(false); setN((x) => x + 1); }}>{t('lab.replay')}</LabBtn>}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
        <StickerPop playKey={n} onDone={() => setShow(true)}><FlowerArt size={64} /></StickerPop>
        <div style={{ minHeight: 32 }}>
          <TimedPrompt show={show} className="ui-pill ui-pill--hint">{t('lab.prim.tooltip')}</TimedPrompt>
        </div>
      </div>
    </Stage>
  );
}

function TypeDemo({ long }: { long?: boolean }) {
  const text = t(long ? 'lab.prim.typeLong' : 'lab.prim.typeShort');
  const [n, setN] = useState(0);
  const [state, setState] = useState('typing');
  const plan = typewriterPlan(graphemeCount(text));
  return (
    <Stage controls={<LabBtn onClick={() => { setState('typing'); setN((x) => x + 1); }}>{t('lab.replay')}</LabBtn>}>
      <Readout testId={`state-P42${long ? '-long' : ''}`}>{`${graphemeCount(text)} g · ${plan.unit} · ${Math.round(plan.msPer)} ms · ${state}`}</Readout>
      <div style={{ padding: '22px 16px 0', alignSelf: 'start', width: '100%' }}>
        <Typewriter key={n} playKey={n} text={text} className="plab-type"
          onDone={() => setState('done')} onCue={() => setState('cue')} />
      </div>
    </Stage>
  );
}

export default [
  { id: 'P06', title: 'textBlurIn · short', group: 'primitive', owner: 'primitives', notes: 'Lyric blur fade: blur 4 → 0 + opacity, 250 ms textIn. Low tier: scale .98 → 1.', render: () => <BlurDemo variant="short" /> },
  { id: 'P06b', title: 'textBlurIn · dreamy', group: 'primitive', owner: 'primitives', notes: 'Blur 10 → 0 over 1.8 s (high tier; mid caps at 4 px).', render: () => <BlurDemo variant="dreamy" /> },
  { id: 'P07', title: 'tooltipRise', group: 'primitive', owner: 'primitives', notes: 'Opacity + y 1.25 px → 0, 167 ms outQuart; micro exit 100 ms.', render: () => <TooltipDemo /> },
  { id: 'P08', title: 'timedPrompt', group: 'primitive', owner: 'primitives', notes: 'Mounts on the spectacle finishing (onDone), opacity 0 → .85 over 200 ms outQuad.', render: () => <PromptDemo /> },
  { id: 'P42', title: 'typewriter · short', group: 'primitive', owner: 'primitives', height: 200, notes: 'Time-anchored; ms = clamp(3220/n, 25, 127); graphemes via Intl.Segmenter; tap completes.', render: () => <TypeDemo /> },
  { id: 'P42b', title: 'typewriter · long (word mode)', group: 'primitive', owner: 'primitives', height: 260, notes: '> 130 graphemes: reveals per word (≈5·ms, ≥120 ms). Cue 800 ms after the last glyph.', render: () => <TypeDemo long /> },
] satisfies LabEntry[];
