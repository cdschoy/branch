/** Scaffold lab entries: proves the Director (DOM + state + canvas steps), the fx bridge and i18n. */
import { useEffect, useRef, useState } from 'react';
import type { LabEntry } from './registry';
import { choreography, type Spec } from '../../motion/core';
import { usePlay } from '../../motion/react';
import { getLocale, graphemes, t } from '../../i18n';
import { LetterCard } from '../../ui';
import { fixtureEnvelopeMin, fixtureEnvelopeMinEn, type LetterPage } from '../../gift-schema';

function DirectorDemo({ timeScale }: { timeScale: number }) {
  const play = usePlay();
  const scrim = useRef<HTMLDivElement>(null);
  const letter = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  // sample sender content in the browsing language (like the landing sample gift)
  const page = (getLocale() === 'en' ? fixtureEnvelopeMinEn : fixtureEnvelopeMin).pages[0] as LetterPage;
  useEffect(() => {
    const run = play(choreography.C4open, {
      scrim, letter, chips: null, hintPill: () => undefined,
      letterBody: () => { setLog((l) => [...l, 'typewriter@367']); },
    }, { timeScale, onStep: (s, ph) => ph === 'start' && setLog((l) => [...l, s.name]) });
    void run.finished.then(() => setLog((l) => [...l, 'finished']));
  }, [play, timeScale]);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
      <div ref={scrim} style={{ position: 'absolute', inset: 0, background: 'var(--scrim-letter)', opacity: 0 }} />
      <div style={{ scale: '.55' }}>
        <div ref={letter} style={{ opacity: 0 }}>
          <LetterCard eyebrow={t('gift.letter.eyebrow', {}, { you: 'em' })} greeting={page.greeting} body={page.body} signature={page.signature} />
        </div>
      </div>
      <ol data-testid="director-log" style={{ position: 'absolute', left: 8, bottom: 4, zIndex: 1, margin: 0, padding: '2px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--c-overlay-scrim-modal)', listStyle: 'none', fontSize: 11, lineHeight: 1.4, color: 'var(--c-cream-50)' }}>
        {log.slice(-4).map((x, i) => <li key={i}>{x}</li>)}
      </ol>
    </div>
  );
}

const FX_SPEC: Spec = {
  id: 'lab.fx', title: 'fxEmit through the Director', t0: 'mount', assets: [], reduced: 'opacity200',
  steps: [{ name: 'lab.hearts', at: 0, dur: 1200, target: 'origin', action: 'fxEmit', params: { emitter: 'example' } }],
};

function FxDemo({ timeScale }: { timeScale: number }) {
  const play = usePlay();
  const origin = useRef<HTMLDivElement>(null);
  useEffect(() => { play(FX_SPEC, { origin }, { timeScale, seed: 42 }); }, [play, timeScale]);
  return <div ref={origin} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--t-hint, var(--c-blush-hint))' }} />;
}

function GraphemeDemo() {
  const name = 'Nguyễn Thị Ánh Dương';
  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'center', padding: 8 }}>
      <div lang="vi" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px 10px', fontFamily: 'var(--font-hand-body)', fontSize: 20, lineHeight: 1.6 }}>
        {name.normalize('NFD').split(' ').map((word, w) => (
          <span key={w} style={{ display: 'inline-flex', gap: 2, whiteSpace: 'nowrap' }}>
            {graphemes(word).map((g, i) => <span key={i} style={{ outline: '1px dashed var(--c-blush-ring)', padding: '0 2px' }}>{g}</span>)}
          </span>
        ))}
      </div>
      <p style={{ margin: 0, fontFamily: 'var(--font-hand-body)', lineHeight: 1.6 }}>{t('gift.landing.from', {}, { pronouns: 'anh-em', tone: 'north' })}</p>
      <p style={{ margin: 0, fontFamily: 'var(--font-script-signature)', fontSize: 22, lineHeight: 1.8 }}>{t('lab.core.signature')}</p>
    </div>
  );
}

export default [
  { id: 'core.director', title: 'Director · C4open', group: 'core', owner: 'scaffold', height: 300, notes: 'DOM steps via animate(), state steps via StepFn; reduced → opacity200.', render: ({ timeScale }) => <DirectorDemo timeScale={timeScale} /> },
  { id: 'core.fx', title: 'fx bridge · example emitter', group: 'core', owner: 'scaffold', notes: 'Canvas step seeked by the Director every tick (off under reduced motion).', render: ({ timeScale }) => <FxDemo timeScale={timeScale} /> },
  { id: 'core.i18n', title: 'graphemes · voice', group: 'core', owner: 'scaffold', notes: 'NFD input → NFC graphemes; pronoun voice; Playwrite VN signature.', render: () => <GraphemeDemo /> },
] satisfies LabEntry[];
