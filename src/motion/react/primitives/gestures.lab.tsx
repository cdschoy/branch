/** Lab: P15 tap wobble, P16 press squash, P17 hover grow, P18 bite tap (owner: primitives). */
import { useRef, useState } from 'react';
import type { LabEntry } from '../../../app/lab/registry';
import { t } from '../../../i18n';
import { BiteTap, HoverGrow, usePressSquash, useTapWobble } from './gestures';
import { CardArt, FlowerArt, HeartArt, Readout, Stage } from './_lab';

function WobbleDemo() {
  const ref = useRef<HTMLButtonElement>(null);
  const wobble = useTapWobble(ref);
  const [n, setN] = useState(0);
  return (
    <Stage>
      <Readout testId="taps-P15">{`×${n}`}</Readout>
      <button ref={ref} type="button" className="plab-btn" style={{ background: 'none', boxShadow: 'none' }} aria-label={t('lab.prim.impulse')}
        onClick={() => { setN((x) => x + 1); void wobble(); }}>
        <FlowerArt size={72} />
      </button>
    </Stage>
  );
}

function SquashDemo() {
  const card = usePressSquash('container');
  const pill = usePressSquash('pill');
  return (
    <Stage>
      <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
        <CardArt><div {...card} style={{ touchAction: 'manipulation', cursor: 'pointer' }}>{t('lab.prim.pageOne')}</div></CardArt>
        <button type="button" className="ui-pill ui-pill--action" {...pill}>{t('lab.prim.next')}</button>
      </div>
    </Stage>
  );
}

function HoverDemo() {
  return (
    <Stage>
      <div className="plab-row">
        <HoverGrow><button type="button" className="ui-pull__btn" aria-label={t('lab.prim.impulse')}><HeartArt size={26} fill="var(--c-cream-50)" /></button></HoverGrow>
        <HoverGrow amount="pull"><button type="button" className="ui-pull__btn" aria-label={t('a11y.moreDrawer')}><FlowerArt size={30} /></button></HoverGrow>
      </div>
    </Stage>
  );
}

const TOTAL = 3;
function CakeArt({ bites }: { bites: number }) {
  // Same-frame sprite swap: the cake loses a wedge per bite (procedural; original art).
  const left = Math.max(0, TOTAL - bites);
  return (
    <svg viewBox="0 0 60 44" width={84} height={62} aria-hidden="true">
      <ellipse cx="30" cy="38" rx="26" ry="5" fill="var(--c-cream-300)" />
      {Array.from({ length: left }, (_, i) => (
        <path key={i} d={`M${8 + i * 15} 36 V16 Q${15 + i * 15} 8 ${22 + i * 15} 16 V36Z`} fill="var(--c-accent-honey)" stroke="var(--c-kraft-500)" strokeWidth="1" />
      ))}
    </svg>
  );
}

function BiteDemo() {
  const [bites, setBites] = useState(0);
  return (
    <Stage>
      <Readout testId="bites-P18">{`${bites}/${TOTAL}`}</Readout>
      <BiteTap bites={bites} remaining={Math.max(0, TOTAL - bites)} onBite={() => setBites((b) => Math.min(TOTAL, b + 1))} ariaLabel={t('lab.prim.bite')}>
        <CakeArt bites={bites} />
      </BiteTap>
    </Stage>
  );
}

export default [
  { id: 'P15', title: 'tapWobble', group: 'primitive', owner: 'primitives', notes: 'Tap: rotate [0, −2, 1.9, −1]° at [0, .33, .62, 1] over 233 ms inOutSine; keeps −1°. Reduced: none.', render: () => <WobbleDemo /> },
  { id: 'P16', title: 'pressSquash', group: 'primitive', owner: 'primitives', notes: 'Card: (1.01, .995) on pointerdown, release with no bounce. Pill: .97 for 70 ms on pointerup.', render: () => <SquashDemo /> },
  { id: 'P17', title: 'hoverGrow', group: 'primitive', owner: 'primitives', notes: '1.06 round button / 1.04 drawer pull; @media (hover:hover) only (CSS).', render: () => <HoverDemo /> },
  { id: 'P18', title: 'biteTap', group: 'primitive', owner: 'primitives', notes: 'Same-frame sprite swap, heart charm, crumbs 70-170 ms, caret note on the first bite; 200 ms debounce.', render: () => <BiteDemo /> },
] satisfies LabEntry[];
