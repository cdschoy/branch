/** Lab: Pill, HintRing, CountdownStamp, ContinueObject, DrawerPull (owner: primitives). */
import { useEffect, useState } from 'react';
import type { LabEntry } from '../app/lab/registry';
import { t } from '../i18n';
import { booth } from '../motion/core/tokens';
import { Pill } from './Pill';
import { HintRing } from './HintRing';
import { CountdownStamp } from './CountdownStamp';
import { ContinueObject, type ContinueKind } from './ContinueObject';
import { DrawerPull } from './DrawerPull';
import { DrawerSlide } from '../motion/react/primitives/surfaces';
import { FlowerArt, LabBtn, Readout, Stage } from '../motion/react/primitives/_lab';

function PillDemo() {
  const states = ['booth.pill.coin', 'booth.pill.smile', 'booth.pill.printing'] as const;
  const [i, setI] = useState(0);
  return (
    <Stage>
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        <Pill variant="status">{t(states[i % states.length] ?? states[0])}</Pill>
        <Pill variant="hint" sparkle>{t('gift.more.pill')}</Pill>
        <Pill variant="action" onClick={() => setI((x) => x + 1)}>{t('lab.prim.next')}</Pill>
        <Pill variant="link" onClick={() => setI(0)}>{t('lab.replay')}</Pill>
      </div>
    </Stage>
  );
}

function HintRingDemo() {
  const [active, setActive] = useState(true);
  return (
    <Stage controls={<LabBtn onClick={() => setActive((a) => !a)} pressed={active}>{t('lab.prim.toggle')}</LabBtn>}>
      <div className="plab-row" style={{ gap: 48 }}>
        <span style={{ position: 'relative', display: 'inline-grid' }}><FlowerArt size={40} /><HintRing active={active} tone="onCream" /></span>
        <span style={{ position: 'relative', display: 'inline-grid', padding: 8, borderRadius: 12, background: 'var(--c-accent-forest)' }}>
          <FlowerArt size={40} petal="var(--c-cream-50)" /><HintRing active={active} tone="onArt" />
        </span>
      </div>
    </Stage>
  );
}

/** 3 · 2 · 1 · smile on a 1 s beat (the booth timer runs the same under reduced motion). */
function CountdownDemo() {
  const seq: (number | 'smile' | null)[] = [3, 2, 1, 'smile', null];
  const [k, setK] = useState(0);
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const id = setInterval(() => setI((x) => (x < seq.length - 1 ? x + 1 : x)), booth.product.digitMs);
    return () => clearInterval(id);
  }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Stage controls={<LabBtn onClick={() => setK((x) => x + 1)}>{t('lab.replay')}</LabBtn>}>
      <Readout testId="value-ui.CountdownStamp">{String(seq[i])}</Readout>
      <CountdownStamp value={seq[i] ?? null} smileText={t('booth.smile')} />
    </Stage>
  );
}

function ContinueDemo() {
  const [ready, setReady] = useState(false);
  const [kind, setKind] = useState<ContinueKind>('seal');
  const [went, setWent] = useState(0);
  const kinds: ContinueKind[] = ['seal', 'candy', 'film', 'pencil'];
  return (
    <Stage controls={<>
      <LabBtn testId="ui.ContinueObject-ready" onClick={() => setReady((r) => !r)} pressed={ready}>{t('lab.prim.ready')}</LabBtn>
      <LabBtn onClick={() => setKind((k) => kinds[(kinds.indexOf(k) + 1) % kinds.length] ?? 'seal')}>{kind}</LabBtn>
    </>}>
      <Readout testId="went-ui.ContinueObject">{`continue ×${went}`}</Readout>
      <ContinueObject kind={kind} ready={ready} onContinue={() => setWent((w) => w + 1)} guardText={t('gift.finale.tooltip', {}, { you: 'em', self: 'anh' })} />
    </Stage>
  );
}

function PullDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Stage>
      <div style={{ position: 'absolute', right: 16, bottom: 16 }}>
        <DrawerPull onOpen={() => setOpen((o) => !o)} unseen={!open} expanded={open} />
      </div>
      <DrawerSlide open={open} variant="sheet" className="plab-sheet" style={{ height: '48%' }}>
        <button type="button" className="plab-btn" onClick={() => setOpen(false)}>{t('a11y.closeDrawer')}</button>
      </DrawerSlide>
    </Stage>
  );
}

export default [
  { id: 'ui.Pill', title: 'Pill', group: 'ui', owner: 'primitives', height: 260, notes: 'Status text hard-cuts (P14); button pills squash .97 for 70 ms on pointerup (P16).', render: () => <PillDemo /> },
  { id: 'ui.HintRing', title: 'HintRing', group: 'ui', owner: 'primitives', notes: '30 px rings 1 → 1.8, onCream blush / onArt white. Reduced: static 2 px outline.', render: () => <HintRingDemo /> },
  { id: 'ui.CountdownStamp', title: 'CountdownStamp', group: 'ui', owner: 'primitives', notes: 'Each digit: P01 stampPop from 1.12 on spring.stamp, exit opacity 70 ms; ends on booth.smile.', render: () => <CountdownDemo /> },
  { id: 'ui.ContinueObject', title: 'ContinueObject', group: 'ui', owner: 'primitives', notes: 'Not ready: tap wobble + guard tooltip on the same frame. Ready: continues. Ladder hint ring.', render: () => <ContinueDemo /> },
  { id: 'ui.DrawerPull', title: 'DrawerPull + drawer', group: 'ui', owner: 'primitives', height: 280, notes: 'Hint pill hard-cuts away on the first tap; the sheet rides P05 (560 ms drawer ease).', render: () => <PullDemo /> },
] satisfies LabEntry[];
