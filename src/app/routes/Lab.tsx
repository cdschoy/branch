/**
 * '#/lab' primitives gallery (owner: scaffold). Entries come from `*.lab.tsx` files (lab/registry.ts);
 * each card has a Replay button that remounts its stage. '#/lab/<id>' shows one entry alone.
 */
import './Lab.css';
import { useState } from 'react';
import { t } from '../../i18n';
import { labEntries, type LabEntry, type LabGroup } from '../lab/registry';
import { PRIMITIVES, useReducedMotion } from '../../motion/react';
import { hrefFor } from '../router';
import { ReducedMotionToggle } from '../ReducedMotionToggle';

function LabCard({ entry, timeScale }: { entry: LabEntry; timeScale: number }) {
  const [replay, setReplay] = useState(0);
  const reduced = useReducedMotion();
  return (
    <section className="lab-card" data-testid={`lab-${entry.id}`} aria-labelledby={`lab-h-${entry.id}`}>
      <header className="lab-card-head">
        <div>
          <h2 id={`lab-h-${entry.id}`} className="lab-card-title"><a href={hrefFor({ name: 'lab', entry: entry.id })}>{entry.id}</a> · {entry.title}</h2>
          {entry.notes ? <p className="lab-card-notes">{entry.notes}</p> : null}
        </div>
        <button type="button" className="lab-replay" onClick={() => setReplay((n) => n + 1)} data-testid={`replay-${entry.id}`}>{t('lab.replay')}</button>
      </header>
      <div className="lab-stage app-scene" data-theme={entry.theme ?? 'garden-envelope'} style={{ height: entry.height ?? 220, minHeight: 0 }} key={replay}>
        {entry.render({ replay, reduced, timeScale })}
      </div>
      <p className="lab-card-owner">{entry.owner} · {entry.group}</p>
    </section>
  );
}

const GROUPS: readonly LabGroup[] = ['core', 'primitive', 'choreography', 'fx', 'ui', 'gift', 'booth'];

export default function Lab({ entry }: { entry?: string }) {
  const [group, setGroup] = useState<LabGroup | 'all'>('all');
  const [timeScale, setTimeScale] = useState(1);
  const list = entry ? labEntries.filter((e) => e.id === entry) : labEntries.filter((e) => group === 'all' || e.group === group);
  const built = new Set(labEntries.map((e) => e.id));
  const missing = PRIMITIVES.filter((p) => !built.has(p.id));
  return (
    <main className="app-scene lab" data-theme="garden-envelope">
      <header className="lab-head">
        <h1 className="lab-title"><a href={hrefFor({ name: 'landing' })} aria-label={t('app.home')}>←</a> {t('lab.title')}</h1>
        <p className="lab-intro">{t('lab.intro')}</p>
        <div className="lab-controls">
          <button type="button" className="lab-chip" aria-pressed={timeScale === 3} onClick={() => setTimeScale((s) => (s === 1 ? 3 : 1))}>{t('lab.speed', { speed: timeScale })}</button>
          <ReducedMotionToggle />
        </div>
        {!entry ? (
          <div className="lab-filters" role="group">
            {(['all', ...GROUPS] as const).map((g) => (
              <button key={g} type="button" className="lab-chip" aria-pressed={group === g} onClick={() => setGroup(g)}>{g === 'all' ? t('lab.all') : g}</button>
            ))}
          </div>
        ) : null}
      </header>
      {list.length ? <div className="lab-grid">{list.map((e) => <LabCard key={e.id} entry={e} timeScale={timeScale} />)}</div> : <p className="lab-empty">{t('lab.empty')}</p>}
      {!entry && missing.length ? (
        <section className="lab-missing" aria-label={t('lab.stub')}>
          <h2 className="lab-card-title">{t('lab.stub')} ({missing.length})</h2>
          <ul>{missing.map((p) => <li key={p.id}><code>{p.id}</code> {p.name} <small>({p.owner})</small></li>)}</ul>
        </section>
      ) : null}
    </main>
  );
}
