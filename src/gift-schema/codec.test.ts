import { describe, expect, it } from 'vitest';
import { encodeGift, encodeGiftSync, decodeGift, fixtureEnvelopeMin, sampleGift, validateGift } from './index';

describe('gift-schema', () => {
  it('fixture validates', () => { expect(fixtureEnvelopeMin.names.to).toBe('Bống'); });
  it('round-trips sync and compressed', async () => {
    for (const enc of [encodeGiftSync(sampleGift), await encodeGift(sampleGift)]) {
      const r = await decodeGift(enc);
      expect(r.ok && r.value).toEqual(sampleGift);
      expect(enc).toMatch(/^[jz][A-Za-z0-9_-]+$/);
    }
  });
  it('refuses a deflate bomb and oversized payloads', async () => {
    const huge = { ...sampleGift, pages: [{ kind: 'letter', greeting: 'a', signature: 'b', body: 'em '.repeat(3_000_000) }] } as unknown as typeof sampleGift;
    const z = await encodeGift(huge);
    expect(z.length).toBeLessThan(100_000);
    const r = await decodeGift(z);
    expect(r.ok).toBe(false);
    expect(r.ok ? '' : r.error).toBe('too large');
    const long = { ...sampleGift, pages: [{ kind: 'letter', greeting: 'a', signature: 'b', body: 'em '.repeat(1000) }] } as unknown as typeof sampleGift;
    expect((await decodeGift(encodeGiftSync(long))).ok).toBe(false);
  });
  it('rejects fields the player would crash on', () => {
    const page = (p: unknown) => validateGift({ ...sampleGift, pages: [p] }).ok;
    expect(page({ kind: 'memories', photos: [{ ref: 'ph:1', caption: { a: 1 } }] })).toBe(false);
    expect(page({ kind: 'songs', tracks: [null] })).toBe(false);
    expect(page({ kind: 'songs', tracks: [{ title: 'x', url: 'javascript:alert(1)' }] })).toBe(false);
    expect(page({ kind: 'songs', tracks: [{ title: 'x', url: 'https://youtu.be/abc' }] })).toBe(true);
    expect(page({ kind: 'days', startDate: 'soon' })).toBe(false);
    expect(page({ kind: 'letter', greeting: 'a', body: 'b', signature: 'c', font: 'comic' })).toBe(false);
    expect(page({ kind: 'notebook', pages: [{ text: 1 }] })).toBe(false);
    expect(page({ kind: 'map', plate: 'p', pins: [{ x: '1', y: 2, place: 'Huế' }] })).toBe(false);
    expect(validateGift({ ...sampleGift, names: { ...sampleGift.names, to: 'B'.repeat(25) } }).ok).toBe(false);
  });
  it('rejects bad input', async () => {
    expect(validateGift({ mechanic: 'x' }).ok).toBe(false);
    expect((await decodeGift('qqq')).ok).toBe(false);
  });
});
