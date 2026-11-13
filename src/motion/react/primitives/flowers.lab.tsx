/**
 * fx lab entries (owner: fx): one per emitter, each with Play/Pause, Replay (the card's button) and a
 * scrub slider that SEEKS the closed-form emitter (exact frame for any t), plus Director-driven
 * sequences (bloom → edge settle → curtain drop; the C7 finale stingers + flood) and the FlowerCurtain
 * wrapper with its ≥70% onCover callback.
 *
 * The fx canvas is full-viewport, so in the gallery (#/lab) nothing autoplays until Replay is pressed;
 * an isolated entry (#/lab/<id>) plays on mount. e2e reads `data-*` on `fx-state-<id>`.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { LabEntry } from '../../../app/lab/registry';
import { t } from '../../../i18n';
import { fx, type EmitterId, type FxHandle } from '../../../fx';
import { probeEmitter, rectOf } from '../../../fx/bridge';
import { getTier } from '../../core/tier';
import type { Run, Spec } from '../../core';
import { usePlay, useTicker } from '../hooks';
import { FlowerCurtain, type CurtainMode } from './flowers';

const isolated = (id: string) => typeof location !== 'undefined' && decodeURIComponent(location.hash) === `#/lab/${id}`;

const bar: CSSProperties = {
  position: 'absolute', left: 8, right: 8, bottom: 6, zIndex: 2, display: 'flex', gap: 8, alignItems: 'center',
  fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--t-ink, var(--c-ink-900))',
  background: 'color-mix(in srgb, var(--c-cream-50) 82%, transparent)', borderRadius: 999, padding: '4px 10px',
};
const btn: CSSProperties = {
  font: 'inherit', border: 0, borderRadius: 999, padding: '4px 10px', minHeight: 28,
  background: 'var(--c-blush-400)', color: 'var(--c-cream-50)', cursor: 'pointer',
};

function Controls(p: { id: string; playing: boolean; time: number; total: number; onToggle(): void; onScrub(ms: number): void; cover?: number; covered?: boolean; count?: number; reduced: boolean }) {
  const total = Math.max(1, Math.round(p.total));
  const ms = Math.round(Math.min(p.time, total));
  return (
    <div style={bar}>
      <button type="button" style={btn} onClick={p.onToggle} data-testid={`play-${p.id}`}>{p.playing ? t('fx.lab.pause') : t('fx.lab.play')}</button>
      <input
        type="range" min={0} max={total} step={1} value={ms} style={{ flex: 1, minWidth: 0 }}
        aria-label={t('fx.lab.scrub')} data-testid={`scrub-${p.id}`}
        onChange={(e) => p.onScrub(Number(e.currentTarget.value))}
      />
      <span
        data-testid={`fx-state-${p.id}`} data-t={ms} data-total={total} data-playing={p.playing ? '1' : '0'}
        data-cover={p.cover === undefined ? '' : p.cover.toFixed(3)} data-count={p.count ?? ''} data-covered={p.covered ? '1' : '0'}
        style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
      >
        {t('fx.lab.time', { ms, total })}
        {p.cover !== undefined ? ` · ${t('fx.lab.cover', { pct: Math.round(p.cover * 100) })}` : ''}
      </span>
    </div>
  );
}

function Info({ lines }: { lines: string[] }) {
  return (
    <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 2, fontFamily: 'var(--font-ui)', fontSize: 11, lineHeight: 1.4, color: 'var(--c-ink-700, var(--c-ink-900))' }}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
}

interface FxLabProps {
  id: string;
  emitter: EmitterId;
  params?: Record<string, unknown>;
  durMs?: number;
  /** Emit from the stage's centre dot (particles) or the viewport (curtains). */
  fromStage?: boolean;
  seed?: string;
  replay: number;
  reduced: boolean;
  timeScale: number;
}

/** One emitter, driven by the lab's own clock (autoplay: false) so Play, Pause and Scrub all seek. */
function FxLab(p: FxLabProps) {
  const dot = useRef<HTMLDivElement>(null);
  const handle = useRef<FxHandle | null>(null);
  const probe = useRef<ReturnType<typeof probeEmitter>>(undefined);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(1);
  const tRef = useRef(0);

  const opts = useCallback(() => {
    const el = p.fromStage ? dot.current : null;
    const rect = rectOf(el);
    return {
      seed: p.seed ?? `lab:${p.id}`, origin: el, reduced: p.reduced, durMs: p.durMs, autoplay: false,
      params: { ...(rect ? { rect: { ...rect, h: rect.h * 6, w: rect.w * 3 } } : {}), ...p.params },
    } as const;
  }, [p.fromStage, p.seed, p.id, p.reduced, p.durMs, p.params]);

  const ensure = useCallback((): FxHandle => {
    if (!handle.current) {
      const o = opts();
      probe.current = probeEmitter(fx, p.emitter, o);
      handle.current = fx.emit(p.emitter, o);
      setTotal(Number.isFinite(handle.current.durationMs) ? handle.current.durationMs : 4000);
    }
    return handle.current;
  }, [opts, p.emitter]);

  const drop = () => { handle.current?.stop(); handle.current = null; };

  useEffect(() => {
    // learn the duration without drawing, then autoplay when isolated or after a Replay
    const pr = probeEmitter(fx, p.emitter, opts());
    setTotal(pr && Number.isFinite(pr.durationMs) ? pr.durationMs : 4000);
    if (p.replay > 0 || isolated(p.id)) { tRef.current = 0; ensure().seek(0); setPlaying(true); }
    return drop;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useTicker((_now, dt) => {
    const h = ensure();
    const next = Math.min(h.durationMs, tRef.current + dt * p.timeScale);
    tRef.current = next; h.seek(next); setTime(next);
    if (next >= h.durationMs) {
      setPlaying(false);
      // leave the stage readable: a finished cover clears itself once play ends
      drop();
    }
  }, playing);

  const toggle = () => {
    if (playing) { setPlaying(false); return; }
    if (tRef.current >= total) tRef.current = 0;
    ensure().seek(tRef.current);
    setPlaying(true);
  };
  const scrub = (ms: number) => { setPlaying(false); tRef.current = ms; setTime(ms); ensure().seek(ms); };

  const pr = probe.current;
  const cover = pr?.coverage ? pr.coverage(time) : undefined;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Info lines={[
        `${p.emitter} · ${t('fx.lab.sprites', { n: pr?.count ?? '…' })} · ${t('fx.lab.tier', { tier: getTier() })}`,
        ...(p.reduced ? [t('fx.lab.reducedNote')] : []),
      ]} />
      {p.fromStage ? (
        <div ref={dot} style={{ position: 'absolute', left: '50%', top: '45%', width: 44, height: 44, translate: '-50% -50%', borderRadius: '50%', background: 'var(--t-hint, var(--c-blush-hint))' }} />
      ) : null}
      <Controls id={p.id} playing={playing} time={time} total={total} onToggle={toggle} onScrub={scrub} cover={cover} count={pr?.count} reduced={p.reduced} />
    </div>
  );
}

/** A Director sequence of canvas steps; Play/Pause and the scrub drive the Run (run.seek is exact). */
function DirectorLab({ id, spec, replay, reduced, timeScale }: { id: string; spec: Spec; replay: number; reduced: boolean; timeScale: number }) {
  const play = usePlay();
  const origin = useRef<HTMLDivElement>(null);
  const run = useRef<Run | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const total = Math.max(...spec.steps.map((s) => s.at + s.dur));
  const start = useCallback((paused: boolean) => {
    run.current = play(spec, { origin, wall: origin, field: origin, burst: origin, 'rays+ring': origin }, { timeScale, seed: 7, paused, slot: id });
    void run.current.finished.then(() => setPlaying(false));
    setPlaying(!paused);
    return run.current;
  }, [play, spec, timeScale, id]);
  useEffect(() => { if (replay > 0 || isolated(id)) start(false); return () => run.current?.cancel(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useTicker(() => { if (run.current) setTime(run.current.time); }, playing);
  const toggle = () => {
    const r = run.current;
    if (!r || r.state === 'finished' || r.state === 'cancelled') { start(false); return; }
    if (playing) { r.pause(); setPlaying(false); } else { r.resume(); setPlaying(true); }
  };
  const scrub = (ms: number) => {
    let r = run.current;
    if (!r || r.state === 'finished' || r.state === 'cancelled') r = start(true);
    r.pause(); r.seek(ms); setPlaying(false); setTime(ms);
  };
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Info lines={[spec.title, ...(reduced ? [t('fx.lab.reducedNote')] : [])]} />
      <div ref={origin} style={{ position: 'absolute', left: '50%', top: '45%', width: 44, height: 44, translate: '-50% -50%', borderRadius: '50%', background: 'var(--t-hint, var(--c-blush-hint))' }} />
      <Controls id={id} playing={playing} time={time} total={total} onToggle={toggle} onScrub={scrub} reduced={reduced} />
    </div>
  );
}

/** The React wrapper: shows when onCover fires (≥70% cover) relative to the emitter's clock. */
function WrapperLab({ id, mode, replay }: { id: string; mode: CurtainMode; replay: number }) {
  const [go, setGo] = useState(false);
  const [covered, setCovered] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (replay > 0 || isolated(id)) setGo(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-ui)' }}>
      <FlowerCurtain mode={mode} go={go} playKey={replay} seed={`lab:wrapper:${mode}`} onCover={() => setCovered(true)} onDone={() => setDone(true)} />
      <p data-testid={`wrapper-${mode}`} data-covered={covered ? '1' : '0'} data-done={done ? '1' : '0'} style={{ margin: 0, fontSize: 14, color: 'var(--c-ink-900)' }}>
        {covered ? t('fx.lab.covered') : '…'}
      </p>
    </div>
  );
}

const SEQ_BLOOM: Spec = {
  id: 'lab.fx.bloomDrop', title: 'bloom → edgeSettle → curtainDrop', t0: 'mount', assets: [], reduced: 'crossfade300',
  steps: [
    { name: 'lab.bloom', at: 0, dur: 2500, target: 'origin', action: 'bloomBurst' },
    { name: 'lab.edgeSettle', at: 2500, dur: 760, target: 'origin', action: 'bloomBurst', params: { phase: 'edgeSettle' } },
    { name: 'lab.drop', at: 3260, dur: 1530, target: 'wall', action: 'fxEmit', params: { emitter: 'curtainDrop' } },
  ],
};
const SEQ_FINALE: Spec = {
  id: 'lab.fx.finale', title: 'C7 stingers: rays → burstMound → flood wall → clear', t0: 'mount', assets: [], reduced: 'crossfade300',
  steps: [
    { name: 'lab.rays', at: 0, dur: 66, target: 'rays+ring', action: 'fxEmit', params: { emitter: 'rays', count: [10, 14] } },
    { name: 'lab.burst', at: 34, dur: 450, target: 'burst', action: 'fxEmit', params: { emitter: 'burstMound' }, ease: 'outBack' },
    { name: 'lab.wall', at: 467, dur: 400, target: 'wall', action: 'flowerCurtain', params: { mode: 'flood', vhPerS: 250 }, ease: 'linear' },
    { name: 'lab.clear', at: 867, dur: 630, target: 'field', action: 'flowerCurtain', params: { mode: 'flood', phase: 'clear' }, ease: 'linear' },
  ],
};

type Def = Omit<FxLabProps, 'replay' | 'reduced' | 'timeScale' | 'id'> & { id: string; title: string; notes: string };
const EMITTERS: Def[] = [
  { id: 'P38', title: 'flowerCurtain · reveal', emitter: 'curtainReveal', notes: 'Starts covered; ballistic fall g = 42 vh/s², fade over the last 2.0 s of 2230 ms.' },
  { id: 'P38.wipe', title: 'flowerCurtain · wipe', emitter: 'curtainWipe', notes: 'Linear falling band, lead 200 vh/s, trail 153 vh/s; swap under cover at 530 ms.' },
  { id: 'P38.flood', title: 'flowerCurtain · flood', emitter: 'flood', notes: 'Wall rises at 250 vh/s: full cover at 400 ms, clears by 1030 ms.' },
  { id: 'P39', title: 'bloomBurst', emitter: 'bloom', notes: '~80 heads (high) arrive on the bloomCoverage curve over 2500 ms; edges settle top → right → left.' },
  { id: 'fx.curtainDrop', title: 'curtainDrop (canvas)', emitter: 'curtainDrop', notes: 'Hand-over from the bloom end layout: fall to 105 vh, wash, fade, mask; gone at 1530 ms.' },
  { id: 'P21', title: 'heartBurst', emitter: 'hearts', fromStage: true, notes: '13-15 hearts (6 low), outBack pop 100 ms, rise on outQuad, fade last 300 ms.' },
  { id: 'P22', title: 'confettiFountain', emitter: 'confetti', fromStage: true, notes: 'Strip-relative ballistics: vy0 = −0.60 H/s, g = 2.36 H/s², ±34% W spread over 800 ms.' },
  { id: 'fx.petals', title: 'petalField', emitter: 'petals', durMs: 6000, notes: '1-3 petals, 3 depths, wind (−24, +12) vw/s; pure in t (pass re-seeding).' },
  { id: 'fx.starburst', title: 'capture starburst + glow', emitter: 'starburst', fromStage: true, notes: 'Glow rise 33 ms → decay 160 ms; burst .7 → 1, hold 80 ms, +12° spin. Reduced: glow only.' },
  { id: 'fx.rays', title: 'rays + ring', emitter: 'rays', fromStage: true, durMs: 400, notes: '10-14 rays and a shockwave (stretched to 400 ms here so it can be seen).' },
  { id: 'fx.burstMound', title: 'burstMound', emitter: 'burstMound', fromStage: true, notes: 'Heads pop on outBack, staggered over 450 ms (held under the flood in C7).' },
  { id: 'fx.echoTrail', title: 'echoTrail', emitter: 'echoTrail', fromStage: true, durMs: 600, notes: '2-3 ghost copies of the thrown flower (stretched to 600 ms here).' },
];

export default [
  ...EMITTERS.map(({ id, title, notes, ...d }): LabEntry => ({
    id, title, notes, group: 'fx', owner: 'fx', height: 240,
    render: ({ replay, reduced, timeScale }) => <FxLab id={id} replay={replay} reduced={reduced} timeScale={timeScale} {...d} />,
  })),
  { id: 'fx.seq.bloomDrop', title: 'Director · bloom → drop', group: 'fx', owner: 'fx', height: 240, notes: 'Three canvas steps, same seed: the drop continues from the bloom end layout (no pop). Scrub = run.seek.', render: ({ replay, reduced, timeScale }) => <DirectorLab id="fx.seq.bloomDrop" spec={SEQ_BLOOM} replay={replay} reduced={reduced} timeScale={timeScale} /> },
  { id: 'fx.seq.finale', title: 'Director · C7 finale fx', group: 'fx', owner: 'fx', height: 240, notes: 'burstMound is held (persistent) until the flood clear phase starts under full cover.', render: ({ replay, reduced, timeScale }) => <DirectorLab id="fx.seq.finale" spec={SEQ_FINALE} replay={replay} reduced={reduced} timeScale={timeScale} /> },
  { id: 'P38.wipe.wrapper', title: '<FlowerCurtain mode="wipe" />', group: 'fx', owner: 'fx', notes: 'onCover fires from the emitter coverage curve (≥70%), then onDone.', render: ({ replay }) => <WrapperLab id="P38.wipe.wrapper" mode="wipe" replay={replay} /> },
] satisfies LabEntry[];
