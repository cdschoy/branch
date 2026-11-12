/**
 * MusicDock (FRAMEWORK §3.6, G16; owner: gift): mixtape list inside the plum panel; indicators follow
 * the TRUE player state (P20 activeSwap, P29 reels bound to 'playing'). Track row 44 px; forest play
 * button. STUB: static list.
 */
import './MusicDock.css';
export type PlayerState = 'idle' | 'starting' | 'playing' | 'paused' | 'waiting' | 'ended' | 'error';
export interface Track { title: string; url?: string; startAt?: number }

export interface MusicDockProps {
  /** Heading (gift.songs.title resolved with the gift voice). */
  title: string;
  tracks: readonly Track[];
  current: number | null;
  state: PlayerState;
  onSelect: (index: number) => void;
  onToggle: () => void;
  /** Labels: gift.songs.trackLabel / gift.songs.playing / gift.songs.paused, resolved by the caller. */
  labels: { track: (n: number) => string; playing: string; paused: string; toggle: string };
  voiceNote?: { durationLabel: string; label: string; onPlay: () => void };
}
export function MusicDock({ title, tracks, current, state, onSelect, onToggle, labels }: MusicDockProps) {
  return (
    <section className="ui-dock" data-stub="MusicDock">
      <h3 className="ui-dock__title">{title}</h3>
      <ol className="ui-dock__list">
        {tracks.map((tr, i) => (
          <li key={i}><button type="button" className={`ui-dock__track${i === current ? ' is-current' : ''}`} onClick={() => onSelect(i)}>
            <span>{labels.track(i + 1)}</span> <span>{tr.title}</span>
          </button></li>
        ))}
      </ol>
      <button type="button" className="ui-dock__toggle" aria-label={labels.toggle} onClick={onToggle}>{state === 'playing' ? labels.playing : labels.paused}</button>
    </section>
  );
}
