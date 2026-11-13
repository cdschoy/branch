/**
 * MusicDock (FRAMEWORK §3.6, G16; owner: gift): mixtape list inside the plum panel; indicators follow
 * the TRUE player state (P20 activeSwap hard-cut colours, P29 reels bound to 'playing'). Track row
 * 44 px; forest play button. The starter has no embedded player: a track with a link opens it in a new
 * tab (the YouTube / Spotify embed is the §7 seam), so `state` stays truthful ('idle').
 */
import './MusicDock.css';
import { Cassette } from '../motion/react';

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
export function MusicDock({ title, tracks, current, state, onSelect, onToggle, labels, voiceNote }: MusicDockProps) {
  const playing = state === 'playing';
  return (
    <section className="ui-dock" data-state={state} data-testid="music-dock">
      <div className="ui-dock__head">
        <Cassette playing={playing} width={88} />
        <h3 className="ui-dock__title">{title}</h3>
      </div>
      <ol className="ui-dock__list">
        {tracks.map((tr, i) => (
          <li key={i}>
            <button type="button" className={`ui-dock__track${i === current ? ' is-current' : ''}`} aria-current={i === current || undefined} onClick={() => onSelect(i)}>
              <span className="ui-dock__num">{labels.track(i + 1)}</span>
              <span className="ui-dock__name">{tr.title}</span>
            </button>
          </li>
        ))}
      </ol>
      {voiceNote ? (
        <button type="button" className="ui-dock__track" onClick={voiceNote.onPlay}>
          <span className="ui-dock__num">{voiceNote.label}</span><span className="ui-dock__name">{voiceNote.durationLabel}</span>
        </button>
      ) : null}
      {tracks.length ? (
        <button type="button" className="ui-dock__toggle" aria-label={labels.toggle} aria-pressed={playing} onClick={onToggle}>
          {/* status text is a state label: hard cut (G5) */}
          <span key={playing ? 'p' : 's'}>{playing ? labels.playing : labels.paused}</span>
        </button>
      ) : null}
    </section>
  );
}
