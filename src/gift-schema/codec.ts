/**
 * Local gift transport (owner: scaffold). No backend: a gift travels in the URL hash as `#/g/<encoded>`.
 *
 *   encoded = 'z' + base64url(deflate-raw(JSON))   (CompressionStream available — every modern browser)
 *           | 'j' + base64url(JSON)                (sync fallback)
 *
 * SEAM: in production `#/g/<slug>` holds an opaque ≥128-bit slug instead, and the player calls
 * POST /api/gift/[slug]/open (api/README.md). Keep the player on `loadGift(param)` so only this file
 * changes.
 */
import type { GiftContentV1 } from './types';
import { validateGift, migrate, type Result } from './validate';

const te = new TextEncoder();
const td = new TextDecoder();

export function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const res = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

const canCompress = () => typeof CompressionStream === 'function';

/** Sync, uncompressed ('j' prefix). */
export function encodeGiftSync(gift: GiftContentV1): string {
  return 'j' + toBase64Url(te.encode(JSON.stringify(gift)));
}

/** Compressed when possible ('z' prefix), else the sync form. */
export async function encodeGift(gift: GiftContentV1): Promise<string> {
  if (!canCompress()) return encodeGiftSync(gift);
  return 'z' + toBase64Url(await pipe(te.encode(JSON.stringify(gift)), new CompressionStream('deflate-raw')));
}

export async function decodeGift(encoded: string): Promise<Result<GiftContentV1>> {
  try {
    const kind = encoded[0];
    const body = fromBase64Url(encoded.slice(1));
    let json: string;
    if (kind === 'j') json = td.decode(body);
    else if (kind === 'z') json = td.decode(await pipe(body, new DecompressionStream('deflate-raw')));
    else return { ok: false, error: 'unknown encoding' };
    return validateGift(migrate(JSON.parse(json)));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'decode failed' };
  }
}

/** The one call the player makes. Today: decode the hash payload. Later: fetch /api/gift/[slug]/open. */
export function loadGift(param: string): Promise<Result<GiftContentV1>> { return decodeGift(param); }

/** Build the shareable URL for a gift (current origin + path, hash route). */
export async function giftUrl(gift: GiftContentV1, base = `${location.origin}${location.pathname}`): Promise<string> {
  return `${base}#/g/${await encodeGift(gift)}`;
}
