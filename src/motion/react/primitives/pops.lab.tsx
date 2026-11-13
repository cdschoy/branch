/** Lab: P01-P04 pops (owner: primitives). Replay remounts; the reduced toggle switches to §4.5 variants. */
import { useState } from 'react';
import type { LabEntry } from '../../../app/lab/registry';
import { t } from '../../../i18n';
import { POLAROID_TILTS } from '../../../ui/Polaroid';
import { LetterPop, PolaroidDeal, StampPop, StickerPop } from './pops';
import { PageCrossfade } from './surfaces';
import { P } from './_shared';
import { CardArt, FlowerArt, HeartArt, LabBtn, PolaroidArt, Readout, Stage } from './_lab';

function Done({ id, done }: { id: string; done: number }) {
  return <Readout testId={`done-${id}`}>{done ? `done ×${done}` : '…'}</Readout>;
}

function StampDemo() {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(0);
  return (
    <Stage controls={<LabBtn onClick={() => setN((x) => x + 1)}>{t('lab.replay')}</LabBtn>}>
      <Done id="P01" done={done} />
      <StampPop playKey={n} onDone={() => setDone((d) => d + 1)} className="ui-stamp" style={{ width: 72, height: 72 }}>
        <span className="ui-stamp__digit">{3 - (n % 3)}</span>
      </StampPop>
    </Stage>
  );
}

/** Stickers mount after a page change: first at C9.stickerMount (+140 ms), then an 80-120 ms stagger (A3). */
function StickerDemo() {
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(0);
  const s = P.stickerPop;
  const arts = [<FlowerArt key="a" />, <HeartArt key="b" />, <FlowerArt key="c" petal="var(--c-flower-iris)" />];
  return (
    <Stage controls={<LabBtn onClick={() => setPage((p) => p + 1)}>{t('lab.prim.next')}</LabBtn>}>
      <Done id="P02" done={done} />
      <PageCrossfade pageKey={String(page)}>
        <CardArt style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <span>{t(page % 2 ? 'lab.prim.pageTwo' : 'lab.prim.pageOne')}</span>
          <div className="plab-row">
            {arts.map((a, i) => (
              <StickerPop key={i} playKey={page} delayMs={s.afterPageMs + i * s.staggerMs} curve={i === 1 ? 'outBack' : 'spring'}
                onDone={i === arts.length - 1 ? () => setDone((d) => d + 1) : undefined}>{a}</StickerPop>
            ))}
          </div>
        </CardArt>
      </PageCrossfade>
    </Stage>
  );
}

function LetterDemo() {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(0);
  return (
    <Stage controls={<LabBtn onClick={() => setN((x) => x + 1)}>{t('lab.replay')}</LabBtn>}>
      <Done id="P03" done={done} />
      <LetterPop playKey={n} delayMs={P.letterPop.afterLayoutMs} onDone={() => setDone((d) => d + 1)}>
        <CardArt><span style={{ fontFamily: 'var(--font-script-signature)', fontSize: 22 }}>{t('lab.prim.stateB')}</span><br />{t('lab.prim.lyric')}</CardArt>
      </LetterPop>
    </Stage>
  );
}

function DealDemo() {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(0);
  const photos = 5;
  const tilts = POLAROID_TILTS.length ? POLAROID_TILTS : [0];
  return (
    <Stage controls={<LabBtn onClick={() => setN((x) => x + 1)}>{t('lab.replay')}</LabBtn>}>
      <Done id="P04" done={done} />
      <div className="plab-deal">
        {Array.from({ length: photos }, (_, i) => (
          <PolaroidDeal key={i} index={i} playKey={n} tiltDeg={tilts[i % tilts.length] ?? 0}
            stack={photos > P.polaroidDeal.stackOnlyIfPhotosGt && i >= 3}
            onDone={i === photos - 1 ? () => setDone((d) => d + 1) : undefined}>
            <PolaroidArt n={i} width={84} />
          </PolaroidDeal>
        ))}
      </div>
    </Stage>
  );
}

export default [
  { id: 'P01', title: 'stampPop', group: 'primitive', owner: 'primitives', notes: 'Mounts at opacity 1, scale 1.12 → 1 on spring.stamp; reduced: opacity 100 ms.', render: () => <StampDemo /> },
  { id: 'P02', title: 'stickerPop', group: 'primitive', owner: 'primitives', notes: 'spring.sticker (middle: outBack 167 ms); first at +140 ms after the page change, then 100 ms stagger.', height: 260, render: () => <StickerDemo /> },
  { id: 'P03', title: 'letterPop', group: 'primitive', owner: 'primitives', notes: 'Opacity .18 → 1 in 67 ms; scale .93 → ~1.01 → 1 on spring.letterPop (tier 1).', render: () => <LetterDemo /> },
  { id: 'P04', title: 'polaroidDeal', group: 'primitive', owner: 'primitives', notes: '150 ms stagger; tilt − 5° → tilt; scale .90 → 1.02 → 1; >3 photos stack 8 px lower.', height: 300, render: () => <DealDemo /> },
] satisfies LabEntry[];
