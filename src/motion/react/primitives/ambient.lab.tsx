/** Lab: P25 float, P26 sway, P27 pendulum, P28 hint ring + ladder, P29 reels, P44 idle wobble (owner: primitives). */
import { useState, type ReactNode } from 'react';
import type { LabEntry } from '../../../app/lab/registry';
import { t } from '../../../i18n';
import { Cassette, HintPulse, IdleFloat, IdleWobble, Pendulum, TrapezoidSway, useHintLadder } from './ambient';
import { FlowerArt, HeartArt, LabBtn, Readout, Stage } from './_lab';

/** Loops stop on the first interaction: tapping the stage toggles `active`. */
function LoopDemo({ id, render }: { id: string; render: (active: boolean) => ReactNode }) {
  const [active, setActive] = useState(true);
  return (
    <Stage controls={<LabBtn testId={`${id}-toggle`} onClick={() => setActive((a) => !a)} pressed={active}>{active ? t('lab.prim.pause') : t('lab.prim.play')}</LabBtn>}>
      {render(active)}
    </Stage>
  );
}

function PendulumDemo() {
  const [impulse, setImpulse] = useState(0);
  return (
    <Stage controls={<LabBtn onClick={() => setImpulse((x) => x + 1)}>{t('lab.prim.impulse')}</LabBtn>}>
      <div style={{ alignSelf: 'start', display: 'grid', justifyItems: 'center' }}>
        <Pendulum impulse={impulse} style={{ display: 'grid', justifyItems: 'center' }}>
          <span style={{ width: 2, height: 70, background: 'var(--c-kraft-500)' }} />
          <HeartArt size={46} />
        </Pendulum>
      </div>
    </Stage>
  );
}

function LadderDemo() {
  const [k, setK] = useState(0);
  const stage = useHintLadder(true, k);
  const show = stage !== 'ambient' && stage !== 'cancelled';
  return (
    <Stage controls={<LabBtn onClick={() => setK((x) => x + 1)}>{t('lab.replay')}</LabBtn>}>
      <Readout testId="stage-P28">{stage}</Readout>
      <HintPulse active={show} double={stage === 'double' || stage === 'retype'} tone="onCream">
        <FlowerArt size={40} />
      </HintPulse>
    </Stage>
  );
}

type Media = 'paused' | 'playing' | 'waiting';
function ReelDemo() {
  const [state, setState] = useState<Media>('paused');
  return (
    <Stage controls={<>
      <LabBtn testId="P29-play" onClick={() => setState('playing')} pressed={state === 'playing'}>{t('lab.prim.play')}</LabBtn>
      <LabBtn testId="P29-pause" onClick={() => setState('paused')} pressed={state === 'paused'}>{t('lab.prim.pause')}</LabBtn>
      <LabBtn onClick={() => setState('waiting')} pressed={state === 'waiting'}>{t('lab.prim.buffer')}</LabBtn>
    </>}>
      <Readout testId="state-P29">{state}</Readout>
      <Cassette playing={state === 'playing'} width={150} />
    </Stage>
  );
}

export default [
  { id: 'P25', title: 'idleFloat', group: 'primitive', owner: 'primitives', notes: 'y 0 ↔ −2.5 px, 3 s inOutSine; cancel → y 0 in 100 ms. Reduced: static.', render: () => <LoopDemo id="P25" render={(a) => <IdleFloat active={a}><FlowerArt size={64} /></IdleFloat>} /> },
  { id: 'P26', title: 'trapezoidSway', group: 'primitive', owner: 'primitives', notes: 'Origin 50% 100%; 0° 0-17 %, 2.7° 50-67 %, 0° 100 %; 800 ms linear.', render: () => <LoopDemo id="P26" render={(a) => <TrapezoidSway active={a}><FlowerArt size={64} petal="var(--c-flower-daisy)" /></TrapezoidSway>} /> },
  { id: 'P27', title: 'pendulum', group: 'primitive', owner: 'primitives', notes: '±1° legs 0.9 / 1.47 s; Nudge: spring.pendulum impulse, then the ±0.4° 4.8 s breeze.', render: () => <PendulumDemo /> },
  { id: 'P28', title: 'hintRing + ladder', group: 'primitive', owner: 'primitives', notes: 'Scale 1 → 1.8 linear 800 ms, every 1.4 s. Ladder: ring +1.2 s, double +8 s, retype +15 s; first touch cancels. Reduced: static outline.', render: () => <LadderDemo /> },
  { id: 'P29', title: 'reelSpin (cassette)', group: 'primitive', owner: 'primitives', notes: '360° / 1.1 s linear, right reel reversed, ONLY while playing; pause / waiting freeze the reels (v5 C-e15 fix).', render: () => <ReelDemo /> },
  { id: 'P44', title: 'idleWobble', group: 'primitive', owner: 'primitives', notes: 'Irregular inOutSine legs 400-633 ms: x ±4 %, y 0…+7 %, rotate −1.5…+10°, ≤3° for the first 1.5 s. Reduced: 2 px outline.', render: () => <LoopDemo id="P44" render={(a) => <IdleWobble active={a} seed={7}><HeartArt size={64} /></IdleWobble>} /> },
] satisfies LabEntry[];
