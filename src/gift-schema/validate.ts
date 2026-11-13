/** Runtime validation for GiftContentV1 (owner: scaffold). Hand-written, zod-free; NFC-normalises text.
 *  Every field the player renders is type-checked and every size limit is enforced here, so a malformed
 *  or hostile link ends on the friendly `gift-error` screen instead of a crash or a frozen tab. */
import type { GiftContentV1, GiftPage, LetterFont, Mechanic } from './types';

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const MECHANICS: readonly Mechanic[] = ['envelope', 'box', 'booth', 'notebook'];
const FONTS: readonly LetterFont[] = ['handBody', 'scriptSignature', 'scriptDisplay', 'handMarker', 'displayExtruded'];
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x: unknown): x is string => typeof x === 'string';
const optStr = (x: unknown): boolean => x === undefined || str(x);
const num = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const nfcDeep = <T>(x: T): T => {
  if (typeof x === 'string') return x.normalize('NFC') as T;
  if (Array.isArray(x)) return x.map(nfcDeep) as T;
  if (isObj(x)) return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, nfcDeep(v)])) as T;
  return x;
};

let seg: Intl.Segmenter | null = null;
/** Grapheme count (Intl.Segmenter; code points as a fallback, which after NFC is exact for Vietnamese). */
export function graphemeLength(s: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    seg ??= new Intl.Segmenter('vi', { granularity: 'grapheme' });
    let n = 0;
    for (const _ of seg.segment(s)) n++;
    return n;
  }
  return Array.from(s).length;
}
const fits = (s: unknown, max: number): boolean => str(s) && s.length <= max * 4 && graphemeLength(s) <= max;
const optFits = (s: unknown, max: number): boolean => s === undefined || fits(s, max);

/**
 * The single source of gift limits (FRAMEWORK §5.2; the creator imports these). Text limits are in
 * graphemes. `payloadBytes` caps the decoded JSON: the local starter carries photos inline as data
 * URLs (≤ MEDIA.maxChars in the creator), so the cap is that budget plus room for the text.
 */
export const LIMITS = {
  nameGraphemes: 24,
  pronounGraphemes: 24,
  bodyGraphemes: 1200,
  lineGraphemes: 120,
  captionGraphemes: 40,
  photos: 6,
  tracks: 5,
  pins: 12,
  notes: 12,
  notebookPages: 12,
  pages: 16,
  mediaRefs: 16,
  strips: 4,
  /** One inline data-URL photo (long edge 640, q .72 — far below this). */
  refChars: 600_000,
  payloadBytes: 1_600_000,
} as const;

/** A song link the player may open: http(s) only. */
export function safeHttpUrl(u: unknown): u is string {
  if (!str(u) || u.length > 2048) return false;
  try { const p = new URL(u).protocol; return p === 'https:' || p === 'http:'; } catch { return false; }
}
const isRef = (x: unknown): x is string => str(x) && x.length <= LIMITS.refChars && (/^ph:\d{1,4}$/.test(x) || /^data:image\/(png|jpeg|webp|gif|svg\+xml)[;,]/.test(x) || /^data:audio\//.test(x));
const arr = (x: unknown, max: number): x is unknown[] => Array.isArray(x) && x.length <= max;

function checkPage(p: unknown, i: number): string | null {
  const bad = (what: string) => `pages[${i}]: ${what}`;
  if (!isObj(p) || !str(p.kind)) return bad('missing kind');
  switch (p.kind) {
    case 'letter':
      if (!fits(p.greeting, LIMITS.lineGraphemes) || !fits(p.body, LIMITS.bodyGraphemes) || !fits(p.signature, LIMITS.lineGraphemes)) return bad('letter needs greeting, body, signature within limits');
      return p.font === undefined || FONTS.includes(p.font as LetterFont) ? null : bad('letter.font');
    case 'memories':
      if (!optFits(p.title, LIMITS.lineGraphemes)) return bad('memories.title');
      return arr(p.photos, LIMITS.photos) && p.photos.every((x) => isObj(x) && isRef(x.ref) && optFits(x.caption, LIMITS.captionGraphemes)) ? null : bad('memories.photos');
    case 'songs':
      return arr(p.tracks, LIMITS.tracks) && p.tracks.every((x) => isObj(x) && fits(x.title, LIMITS.lineGraphemes) && safeHttpUrl(x.url) && (x.startAt === undefined || (num(x.startAt) && x.startAt >= 0))) ? null : bad('songs.tracks');
    case 'voice':
      return isRef(p.ref) && num(p.durationSec) && p.durationSec >= 0 ? null : bad('voice');
    case 'map':
      if (!str(p.plate) || p.plate.length > 64) return bad('map.plate');
      return arr(p.pins, LIMITS.pins) && p.pins.every((x) => isObj(x) && num(x.x) && num(x.y) && fits(x.place, LIMITS.lineGraphemes) && optFits(x.date, 32)) ? null : bad('map.pins');
    case 'treats':
      return arr(p.notes, LIMITS.notes) && p.notes.every((x) => fits(x, LIMITS.lineGraphemes)) ? null : bad('treats.notes');
    case 'notebook':
      return arr(p.pages, LIMITS.notebookPages) && p.pages.every((x) => isObj(x) && fits(x.text, LIMITS.bodyGraphemes) && (x.object === undefined || isRef(x.object))) ? null : bad('notebook.pages');
    case 'days':
      if (!str(p.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(p.startDate) || Number.isNaN(Date.parse(p.startDate))) return bad('days.startDate');
      return p.countFirstDay === undefined || typeof p.countFirstDay === 'boolean' ? null : bad('days.countFirstDay');
    default: return bad(`unknown kind ${String(p.kind).slice(0, 32)}`);
  }
}

export function validateGift(input: unknown): Result<GiftContentV1> {
  if (!isObj(input)) return { ok: false, error: 'not an object' };
  const x = nfcDeep(input);
  if (x.v !== undefined && x.v !== 1) return { ok: false, error: `unsupported version ${String(x.v).slice(0, 16)}` };
  if (x.id !== undefined && !(str(x.id) && x.id.length <= 64)) return { ok: false, error: 'id' };
  if (!MECHANICS.includes(x.mechanic as Mechanic)) return { ok: false, error: 'mechanic' };
  if (!str(x.theme) || x.theme.length > 40) return { ok: false, error: 'theme' };
  if (x.locale !== 'vi' && x.locale !== 'en') return { ok: false, error: 'locale' };
  const n = x.names;
  if (!isObj(n) || !fits(n.from, LIMITS.nameGraphemes) || !fits(n.to, LIMITS.nameGraphemes) || !fits(n.self, LIMITS.pronounGraphemes)
    || !fits(n.you, LIMITS.nameGraphemes) || (n.tone !== 'nhe' && n.tone !== 'nha') || !optFits(n.pronouns, 16)) return { ok: false, error: 'names' };
  if (!arr(x.pages, LIMITS.pages)) return { ok: false, error: 'pages' };
  for (let i = 0; i < x.pages.length; i++) { const e = checkPage(x.pages[i], i); if (e) return { ok: false, error: e }; }
  if (!arr(x.mediaRefs, LIMITS.mediaRefs) || !x.mediaRefs.every(isRef)) return { ok: false, error: 'mediaRefs' };
  if (x.strips !== undefined && !(arr(x.strips, LIMITS.strips) && x.strips.every(isRef))) return { ok: false, error: 'strips' };
  if (!isObj(x.finale) || typeof x.finale.enabled !== 'boolean') return { ok: false, error: 'finale' };
  if (x.unlockAt !== undefined && !(str(x.unlockAt) && x.unlockAt.length <= 40 && !Number.isNaN(Date.parse(x.unlockAt)))) return { ok: false, error: 'unlockAt' };
  if (x.secret !== undefined && !(isObj(x.secret) && fits(x.secret.question, LIMITS.lineGraphemes) && optFits(x.secret.hint, LIMITS.lineGraphemes) && optFits(x.secret.answer, LIMITS.lineGraphemes))) return { ok: false, error: 'secret' };
  const { $comment: _c, ...rest } = x as Record<string, unknown>;
  return { ok: true, value: { ...(rest as unknown as GiftContentV1), pages: x.pages as GiftPage[] } };
}

/** Migrate N−1 → N. V1 is the first version; future versions add cases here. */
export function migrate(input: unknown): unknown { return input; }
