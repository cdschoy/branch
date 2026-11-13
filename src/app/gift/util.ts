/** Small React-free helpers for the gift scenes and creator (owner: gift). */
import type { DaysPage } from '../../gift-schema';

const DAY_MS = 86_400_000;

/** Whole days since `startDate` (YYYY-MM-DD, local), +1 when the first day counts as day 1. */
export function daysTogether(p: DaysPage, now = new Date()): number {
  const [y, m, d] = p.startDate.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const start = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((today - start) / DAY_MS) + (p.countFirstDay ? 1 : 0));
}

export type SongService = 'YouTube' | 'Spotify';
/** Which service a song link points at (§5.2 step 7: YouTube or Spotify for the main song). */
export function serviceOf(url: string): SongService | '' {
  try {
    const h = new URL(url).hostname.replace(/^www\.|^m\.|^music\./, '');
    if (h === 'youtube.com' || h === 'youtu.be') return 'YouTube';
    if (h === 'open.spotify.com' || h === 'spotify.com' || h === 'spotify.link') return 'Spotify';
  } catch { /* not a URL */ }
  return '';
}

/** A short random id for seeding fx (hashSeed(gift.id)); ≥64 bits. */
export function newGiftId(): string {
  const b = new Uint8Array(9);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}
