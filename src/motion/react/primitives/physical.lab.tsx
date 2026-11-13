/** Lab: P10 whip-off, P12 curtain drop, P14 hard cut, P23 flash, P37 print + toss, P47 token drop (owner: primitives). */
import { useRef, useState, type ReactNode } from 'react';
import type { LabEntry } from '../../../app/lab/registry';
import { t } from '../../../i18n';
import { CameraFlash, CurtainDrop, HardCut, SlotPrint, Toss, TokenDrop, WhipOff } from './physical';
import { P } from './_shared';
import { CardArt, LabBtn, PhotoArt, Readout, Stage } from './_lab';

function Replayable({ id, render }: { id: string; render: (k: number, onDone: () => void) => ReactNode }) {
  const [k, setK] = useState(0);
  const [done, setDone] = useState(0);
  return (
    <Stage controls={<LabBtn testId={`${id}-play`} onClick={() => setK((x) => x + 1)}>{t('lab.prim.play')}</LabBtn>}>
      <Readout testId={`done-${id}`}>{done ? `done ×${done}` : '…'}</Readout>
      {render(k, () => setDone((d) => d + 1))}
    </Stage>
  );
}

function CutDemo() {
  const labels = ['booth.pill.coin', 'booth.pill.smile', 'booth.pill.printing', 'booth.pill.tapStrip'] as const;
  const [i, setI] = useState(0);
  const key = labels[i % labels.length] ?? labels[0];
  return (
    <Stage controls={<LabBtn onClick={() => setI((x) => x + 1)}>{t('lab.prim.next')}</LabBtn>}>
      <span className="ui-pill ui-pill--status"><HardCut value={key}>{t(key)}</HardCut></span>
    </Stage>
  );
}

function FlashDemo() {
  const [fire, setFire] = useState(0);
  const [peaks, setPeaks] = useState(0);
  const [scope, setScope] = useState<'element' | 'fullScreen'>('element');
  return (
    <Stage controls={<>
      <LabBtn testId="P23-fire" onClick={() => setFire((f) => f + 1)}>{t('lab.prim.fire')}</LabBtn>
      <LabBtn onClick={() => setScope((s) => (s === 'element' ? 'fullScreen' : 'element'))}>{scope}</LabBtn>
    </>}>
      <Readout testId="peaks-P23">{`peak ×${peaks}`}</Readout>
      <div className="plab-window">
        <PhotoArt n={2} w={142} h={102} />
        <CameraFlash fire={fire} scope={scope} onPeak={() => setPeaks((p) => p + 1)} />
      </div>
    </Stage>
  );
}

interface Tossed { id: number; from: { x: number; y: number; scale: number }; arcMs: number; restDeg: number }
/** DOM print + toss: the strip feeds linearly out of the slot, then arcs onto the table on a quadratic Bézier. */
function PrintTossDemo() {
  const slot = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState<number | null>(null);
  const [table, setTable] = useState<Tossed[]>([]);
  const [landed, setLanded] = useState(0);
  const n = table.length;
  const strip = (k: number) => (
    <div className="plab-strip">{[0, 1, 2].map((j) => <PhotoArt key={j} n={k + j} w={48} h={36} />)}</div>
  );
  const onPrinted = () => {
    const r = slot.current?.getBoundingClientRect();
    const idx = n % P.toss.restDeg.length;
    const first = n === 0;
    const from = { x: r ? r.left + r.width / 2 : 0, y: r ? r.top + r.height / 2 : 0, scale: first ? P.toss.fromScale[0] : P.toss.fromScale[1] };
    setTable((tb) => [...tb.slice(-2), { id: Date.now(), from, arcMs: first ? P.toss.arcMs[0] : P.toss.arcMs[1], restDeg: P.toss.restDeg[idx] ?? 0 }]);
    setPrinting(null);
  };
  return (
    <Stage controls={<LabBtn testId="P37-print" onClick={() => setPrinting((p) => (p === null ? Date.now() : p))}>{t('lab.prim.fire')}</LabBtn>}>
      <Readout testId="done-P37">{`landed ×${landed}`}</Readout>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: 28, alignItems: 'start' }}>
        <div style={{ position: 'relative', width: 96, height: 150 }}>
          <div className="plab-slot" />
          <div ref={slot} style={{ position: 'absolute', left: 20, top: 15, width: 56 }}>
            {printing !== null ? <SlotPrint playKey={printing} onDone={onPrinted}>{strip(n)}</SlotPrint> : null}
          </div>
        </div>
        <div style={{ position: 'relative', width: 70, height: 150 }}>
          {table.map((s, i) => (
            <div key={s.id} style={{ position: 'absolute', left: 0, top: 0, zIndex: i }}>
              <Toss playKey={s.id} from={s.from} arcMs={s.arcMs} restDeg={s.restDeg} onDone={() => setLanded((l) => l + 1)}>{strip(i)}</Toss>
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

export default [
  { id: 'P10', title: 'whipOff', group: 'primitive', owner: 'primitives', notes: 'After the 67 ms knot + hold: ribbon x +43 vw, rotate 11 → 33° over 133 ms inQuad.', render: () => (
    <Replayable id="P10" render={(k, d) => <WhipOff play={k > 0} playKey={k} onDone={d}><div className="plab-ribbon">{t('lab.prim.tooltip')}</div></WhipOff>} />) },
  { id: 'P12', title: 'curtainDrop (DOM layer)', group: 'primitive', owner: 'primitives', height: 260, notes: 'y → 105 vh over 1400 ms curtainFall; mean-colour wash; fade from +900; mask from +1100; done at +1530.', render: () => (
    <Replayable id="P12" render={(k, d) => <div style={{ position: 'absolute', inset: 0 }}><CardArt style={{ position: 'absolute', inset: '30% 15%' }}>{t('lab.prim.stateB')}</CardArt><CurtainDrop key={k} play={k > 0} playKey={k} onDone={d} className="plab-wall" style={{ position: 'absolute', inset: 0 }} /></div>} />) },
  { id: 'P14', title: 'hardCut', group: 'primitive', owner: 'primitives', notes: '0 ms: the status pill text swaps on the same frame and the width snaps (never tweened).', render: () => <CutDemo /> },
  { id: 'P23', title: 'cameraFlash', group: 'primitive', owner: 'primitives', notes: 'Booth window only (scope element): ≤1-frame rise to .85, linear decay 160 ms; onPeak grabs. Reduced: .4 over 200 ms.', render: () => <FlashDemo /> },
  { id: 'P37', title: 'slotPrint + toss', group: 'primitive', owner: 'primitives', height: 280, notes: 'Linear feed out of an overflow:hidden slot, then a quadratic-Bézier toss on spring.toss to rest −3.6° / +1.3° / +4°.', render: () => <PrintTossDemo /> },
  { id: 'P47', title: 'tokenDrop', group: 'primitive', owner: 'primitives', notes: 'The coin hard-cuts to a heart token that rises −4 vh with `in` over 100 ms into the slot.', render: () => (
    <Replayable id="P47" render={(k, d) => <TokenDrop play={k > 0} playKey={k} onDone={d}><span className="plab-coin" /></TokenDrop>} />) },
] satisfies LabEntry[];
