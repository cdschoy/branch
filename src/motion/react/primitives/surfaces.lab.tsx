/** Lab: P05 drawer, P32 page crossfade, P33 paper dip, P34 lid flip, P36 lightbox, P45 content swap (owner: primitives). */
import { LayoutGroup } from 'motion/react';
import { useState } from 'react';
import type { LabEntry } from '../../../app/lab/registry';
import { t } from '../../../i18n';
import { ContentSwapInShell, DrawerSlide, LidFlip3D, LightboxThumb, PageCrossfade, PaperDipCrossfade, SharedLightbox } from './surfaces';
import { StickerPop } from './pops';
import { P } from './_shared';
import { CardArt, FlowerArt, HeartArt, LabBtn, PhotoArt, PolaroidArt, Readout, Stage } from './_lab';

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<'sheet' | 'rail'>('sheet');
  const [state, setState] = useState('closed');
  return (
    <Stage controls={<>
      <LabBtn testId="P05-toggle" onClick={() => setOpen((o) => !o)} pressed={open}>{t('lab.prim.toggle')}</LabBtn>
      <LabBtn onClick={() => setVariant((v) => (v === 'sheet' ? 'rail' : 'sheet'))}>{variant}</LabBtn>
    </>}>
      <Readout testId="state-P05">{state}</Readout>
      <CardArt>{t('lab.prim.pageOne')}</CardArt>
      <DrawerSlide open={open} variant={variant} className={variant === 'rail' ? 'plab-sheet plab-rail' : 'plab-sheet'}
        onOpened={() => setState('opened')} onClosed={() => setState('closed')}>
        {t('gift.more.pill')}
      </DrawerSlide>
    </Stage>
  );
}

function PageDemo() {
  const [page, setPage] = useState(0);
  return (
    <Stage controls={<LabBtn testId="P32-next" onClick={() => setPage((p) => p + 1)}>{t('lab.prim.next')}</LabBtn>}>
      <PageCrossfade pageKey={String(page)}>
        <CardArt style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <PhotoArt n={page} w={150} h={100} />
          <span>{t(page % 2 ? 'lab.prim.pageTwo' : 'lab.prim.pageOne')}</span>
        </CardArt>
      </PageCrossfade>
    </Stage>
  );
}

function EnvelopeArt({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 160 110" width={160} height={110} aria-hidden="true">
      <rect x="4" y="20" width="152" height="86" rx="6" fill="var(--c-kraft-300)" />
      {open
        ? <path d="M4 22 80 -10 156 22Z" fill="var(--c-kraft-500)" />
        : <path d="M4 22 80 72 156 22Z" fill="var(--c-kraft-500)" />}
      {open ? <rect x="22" y="6" width="116" height="60" rx="4" fill="var(--c-paper-letter)" /> : <circle cx="80" cy="70" r="11" fill="var(--c-berry-600)" />}
    </svg>
  );
}

function DipDemo() {
  const [s, setS] = useState<'closed' | 'open'>('closed');
  return (
    <Stage controls={<LabBtn onClick={() => setS((x) => (x === 'closed' ? 'open' : 'closed'))}>{t(s === 'closed' ? 'lab.prim.stateB' : 'lab.prim.stateA')}</LabBtn>}>
      <PaperDipCrossfade state={s} render={(st) => <EnvelopeArt open={st === 'open'} />} />
    </Stage>
  );
}

function LidDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Stage controls={<LabBtn onClick={() => setOpen((o) => !o)} pressed={open}>{t('lab.prim.toggle')}</LabBtn>}>
      <LidFlip3D open={open} lid={<div className="plab-lid" />} box={<div className="plab-box"><FlowerArt size={40} /></div>} />
    </Stage>
  );
}

function LightboxDemo() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Stage>
      <LayoutGroup>
        <div className="plab-row">
          {[0, 1, 2].map((i) => (
            open === i ? <div key={i} style={{ width: 84, height: 92 }} /> : (
              <LightboxThumb key={i} layoutId={`plab-photo-${i}`} tiltDeg={P.toss.restDeg[i]} onOpen={() => setOpen(i)} ariaLabel={t('lab.prim.pageOne')}>
                <PolaroidArt n={i} width={84} />
              </LightboxThumb>
            )
          ))}
        </div>
        <SharedLightbox open={open !== null} layoutId={`plab-photo-${open ?? 0}`} onClose={() => setOpen(null)} ariaLabel={t('lab.prim.pageOne')}
          controls={<LabBtn testId="P36-close" onClick={() => setOpen(null)}>×</LabBtn>}>
          <div className="plab-lightbox-photo"><PhotoArt n={open ?? 0} /></div>
        </SharedLightbox>
      </LayoutGroup>
    </Stage>
  );
}

function SwapDemo() {
  const [k, setK] = useState(0);
  const [done, setDone] = useState(0);
  return (
    <Stage controls={<LabBtn onClick={() => setK((x) => x + 1)}>{t('lab.prim.next')}</LabBtn>}>
      <Readout testId="done-P45">{done ? `done ×${done}` : '…'}</Readout>
      <CardArt style={{ minWidth: 200, minHeight: 110, display: 'grid', placeItems: 'center' }}>
        <ContentSwapInShell contentKey={String(k)} onDone={() => setDone((d) => d + 1)}>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
            <StickerPop playKey={k}>{k % 2 ? <HeartArt /> : <FlowerArt />}</StickerPop>
            <span>{t(k % 2 ? 'lab.prim.pageTwo' : 'lab.prim.pageOne')}</span>
          </div>
        </ContentSwapInShell>
      </CardArt>
    </Stage>
  );
}

export default [
  { id: 'P05', title: 'drawerSlide', group: 'primitive', owner: 'primitives', height: 300, notes: 'One tween: 560 ms drawer ease (opacity 360 ms); close 240 ms in; no scrim. Reduced: opacity + 16 px.', render: () => <DrawerDemo /> },
  { id: 'P32', title: 'pageCrossfade', group: 'primitive', owner: 'primitives', height: 260, notes: 'Opacity only, 240 ms outCubic (C9: out at 0, in at +20); no dip.', render: () => <PageDemo /> },
  { id: 'P33', title: 'paperDipCrossfade', group: 'primitive', owner: 'primitives', notes: 'Both layers 333 ms (out outQuad, in paperIn): the sum dips to ~56 %.', render: () => <DipDemo /> },
  { id: 'P34', title: 'lidFlip3D', group: 'primitive', owner: 'primitives', height: 260, notes: 'Lid rotateX 0 → 180° (perspective 700) + box +18 vh on one inOutCubic 280 ms.', render: () => <LidDemo /> },
  { id: 'P36', title: 'sharedLightbox', group: 'primitive', owner: 'primitives', notes: 'layoutId FLIP on spring.lightbox, rotate −4 → −1°, scrim linear 267 ms; close on spring.modal. Esc closes.', render: () => <LightboxDemo /> },
  { id: 'P45', title: 'contentSwapInShell', group: 'primitive', owner: 'primitives', notes: 'Shell persists; content out 200 ms standard; the new object mounts at +267 ms with a stickerPop.', render: () => <SwapDemo /> },
] satisfies LabEntry[];
