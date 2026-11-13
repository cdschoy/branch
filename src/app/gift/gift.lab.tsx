/** Gift lab entries (owner: gift): the C2 12-frame ribbon atlas and the C1 painted wall tile. */
import { useState } from 'react';
import type { LabEntry } from '../lab/registry';
import { PaintedWall, RibbonFrames, Treat } from './art';
import { G } from './params';

function RibbonScrub() {
  const [f, setF] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'center', padding: 12 }}>
      <div style={{ width: 240, height: 100 }}><RibbonFrames frame={f} frames={G.ribbon.frames} /></div>
      <input type="range" min={0} max={G.ribbon.frames - 1} value={f} onChange={(e) => setF(Number(e.target.value))} aria-label="frame" data-testid="ribbon-frame" />
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ width: 56, height: 56 }}><Treat kind={k as 0 | 1 | 2} bites={f % 3} /></div>)}
      </div>
    </div>
  );
}

export default [
  {
    id: 'gift.ribbon12', title: 'C2 ribbon: 12-frame painted sequence', group: 'gift', owner: 'gift', height: 240, theme: 'sweet-gingham',
    notes: 'Scrub = drag progress p = dragPx / 50 (C2.bowTug); bow 1 → .8, tail stretches. Treats show 0/1/2 bites.',
    render: () => <RibbonScrub />,
  },
  {
    id: 'gift.wall', title: 'C1 wall tile (fx shapes, seeded)', group: 'gift', owner: 'gift', height: 260,
    notes: 'The DOM wall under the bloom: same shapes + palette as the emitter so the hand-over does not pop.',
    render: ({ replay }) => <div style={{ height: 260 }}><PaintedWall seed={replay + 1} /></div>,
  },
] satisfies readonly LabEntry[];
