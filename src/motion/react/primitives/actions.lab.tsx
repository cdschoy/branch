/**
 * Lab: every primitive as a Director DOM action (owner: primitives). Picks an ActionId, plays a
 * one-step spec on a target through `usePlay()` (so reduced motion, ×3 preview and the DOM action
 * registry are exercised exactly as in a choreography).
 */
import { useEffect, useRef, useState } from 'react';
import type { LabEntry } from '../../../app/lab/registry';
import { t } from '../../../i18n';
import { actions } from '../../core/actions/primitives';
import type { ActionId, Spec } from '../../core/tokens';
import { duration, spring } from '../../core/tokens';
import { usePlay } from '../hooks';
import { FlowerArt, LabBtn, Readout, Stage } from './_lab';

const IDS = Object.keys(actions).sort() as ActionId[];
/** Step durations for the one-step spec (the action's own token; persistent loops get a short window). */
const DUR: Partial<Record<ActionId, number>> = {
  stampPop: spring.stamp.settleMs, stickerPop: spring.sticker.settleMs, letterPop: spring.letterPop.settleMs,
  polaroidDeal: duration.move, drawerSlide: duration.drawer, curtainDrop: duration.curtainDrop, toss: spring.toss.settleMs,
  sharedLightbox: spring.lightbox.settleMs, pendulum: spring.pendulum.settleMs,
};

function ActionsDemo({ timeScale }: { timeScale: number }) {
  const play = usePlay();
  const box = useRef<HTMLDivElement>(null);
  const [id, setId] = useState<ActionId>('stickerPop');
  const [k, setK] = useState(0);
  const [log, setLog] = useState('');
  useEffect(() => {
    if (!k) return;
    const el = box.current;
    if (el) { el.removeAttribute('style'); }
    const spec: Spec = {
      id: `lab.${id}`, title: id, t0: 'tap', assets: [], reduced: 'opacity200',
      steps: [{ name: `lab.${id}`, at: 0, dur: DUR[id] ?? duration.modal, target: 'box', action: id, params: {} }],
    };
    setLog(`${id}: playing`);
    const run = play(spec, { box }, { timeScale, slot: 'lab-actions', seed: 7 });
    void run.finished.then(() => setLog(`${id}: finished`));
  }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Stage controls={<>
      <select aria-label="ActionId" className="plab-btn" value={id} onChange={(e) => setId(e.target.value as ActionId)} data-testid="actions-select">
        {IDS.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <LabBtn testId="actions-play" onClick={() => setK((x) => x + 1)}>{t('lab.prim.play')}</LabBtn>
    </>}>
      <Readout testId="actions-log">{log || '…'}</Readout>
      <div ref={box} style={{ display: 'grid', placeItems: 'center', width: 84, height: 84, borderRadius: 16, background: 'var(--c-blush-100)' }}>
        <FlowerArt size={56} />
      </div>
    </Stage>
  );
}

export default {
  id: 'P.actions', title: 'Director actions (all primitives)', group: 'primitive', owner: 'primitives', height: 260,
  notes: 'Each ActionId as a one-step spec through director.play(); honours reduced motion and ×3.',
  render: ({ timeScale }) => <ActionsDemo timeScale={timeScale} />,
} satisfies LabEntry;
