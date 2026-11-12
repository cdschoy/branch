/** Runtime validation for GiftContentV1 (owner: scaffold). Hand-written, zod-free; NFC-normalises text. */
import type { GiftContentV1, GiftPage, Mechanic } from './types';

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const MECHANICS: readonly Mechanic[] = ['envelope', 'box', 'booth', 'notebook'];
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x: unknown): x is string => typeof x === 'string';
const nfcDeep = <T>(x: T): T => {
  if (typeof x === 'string') return x.normalize('NFC') as T;
  if (Array.isArray(x)) return x.map(nfcDeep) as T;
  if (isObj(x)) return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, nfcDeep(v)])) as T;
  return x;
};

/** Limits (FRAMEWORK §7.5 / vietnam.md): names ≤24 graphemes, letter ≤2000 chars, gift JSON ≤8 KB. */
export const LIMITS = { nameGraphemes: 24, letterChars: 2000, jsonBytes: 8 * 1024, photos: 12 } as const;

function checkPage(p: unknown, i: number): string | null {
  if (!isObj(p) || !str(p.kind)) return `pages[${i}]: missing kind`;
  switch (p.kind) {
    case 'letter': return str(p.greeting) && str(p.body) && str(p.signature) ? null : `pages[${i}]: letter needs greeting, body, signature`;
    case 'memories': return Array.isArray(p.photos) && p.photos.every((x) => isObj(x) && str(x.ref)) ? null : `pages[${i}]: memories.photos[].ref`;
    case 'songs': return Array.isArray(p.tracks) ? null : `pages[${i}]: songs.tracks`;
    case 'voice': return str(p.ref) ? null : `pages[${i}]: voice.ref`;
    case 'map': return Array.isArray(p.pins) ? null : `pages[${i}]: map.pins`;
    case 'treats': return Array.isArray(p.notes) ? null : `pages[${i}]: treats.notes`;
    case 'notebook': return Array.isArray(p.pages) ? null : `pages[${i}]: notebook.pages`;
    case 'days': return str(p.startDate) ? null : `pages[${i}]: days.startDate`;
    default: return `pages[${i}]: unknown kind ${String(p.kind)}`;
  }
}

export function validateGift(input: unknown): Result<GiftContentV1> {
  if (!isObj(input)) return { ok: false, error: 'not an object' };
  const x = nfcDeep(input);
  if (x.v !== undefined && x.v !== 1) return { ok: false, error: `unsupported version ${String(x.v)}` };
  if (!MECHANICS.includes(x.mechanic as Mechanic)) return { ok: false, error: 'mechanic' };
  if (!str(x.theme)) return { ok: false, error: 'theme' };
  if (x.locale !== 'vi' && x.locale !== 'en') return { ok: false, error: 'locale' };
  const n = x.names;
  if (!isObj(n) || !str(n.from) || !str(n.to) || !str(n.self) || !str(n.you) || (n.tone !== 'nhe' && n.tone !== 'nha')) return { ok: false, error: 'names' };
  if (!Array.isArray(x.pages)) return { ok: false, error: 'pages' };
  for (let i = 0; i < x.pages.length; i++) { const e = checkPage(x.pages[i], i); if (e) return { ok: false, error: e }; }
  if (!Array.isArray(x.mediaRefs) || !x.mediaRefs.every(str)) return { ok: false, error: 'mediaRefs' };
  if (!isObj(x.finale) || typeof x.finale.enabled !== 'boolean') return { ok: false, error: 'finale' };
  const { $comment: _c, ...rest } = x as Record<string, unknown>;
  return { ok: true, value: { ...(rest as unknown as GiftContentV1), pages: x.pages as GiftPage[] } };
}

/** Migrate N−1 → N. V1 is the first version; future versions add cases here. */
export function migrate(input: unknown): unknown { return input; }
