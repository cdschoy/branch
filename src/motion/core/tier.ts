/**
 * Device tier (FRAMEWORK §4.6; owner: scaffold). React-free.
 *
 * `getTier()` starts from `initialTier()` (motion.ts) or the persisted probe result. `startTierProbe()`
 * samples ticker deltas during the landing idle and applies `probeTier()` (p90 > 20 ms over 30 frames
 * drops one tier; p90 < 12 ms over 60 frames promotes mid → high). Query `?tier=low|mid|high` forces a
 * tier for QA ("Xem như máy yếu" preview).
 */
import { initialTier, probeTier, type Tier } from './tokens';
import { ticker } from './ticker';

const KEY = 'qt.tier';
const isTier = (v: unknown): v is Tier => v === 'low' || v === 'mid' || v === 'high';

let forced: Tier | null = null;
try {
  const q = new URLSearchParams(location.search).get('tier');
  if (isTier(q)) forced = q;
} catch { /* no location (tests) */ }

let tier: Tier = forced ?? (() => {
  try { const v = localStorage.getItem(KEY); if (isTier(v)) return v; } catch { /* ignore */ }
  return initialTier();
})();

export const getTier = (): Tier => tier;
export function setTier(t: Tier, persist = false): void {
  tier = t;
  if (persist) { try { localStorage.setItem(KEY, t); } catch { /* ignore */ } }
}

/** Sample `frames` deltas (default 60) on the shared ticker, then update + persist the tier. */
export function startTierProbe(frames = 60): Promise<Tier> {
  if (forced) return Promise.resolve(forced);
  return new Promise((resolve) => {
    const deltas: number[] = [];
    let skip = 3; // ignore the wake-up frames
    const off = ticker.add((_now, dt) => {
      if (skip-- > 0) return;
      deltas.push(dt);
      if (deltas.length === 30 || deltas.length >= frames) {
        const next = probeTier(tier, deltas);
        if (next !== tier || deltas.length >= frames) {
          off();
          setTier(next, true);
          resolve(next);
        }
      }
    });
  });
}
