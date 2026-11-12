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
  it('rejects bad input', async () => {
    expect(validateGift({ mechanic: 'x' }).ok).toBe(false);
    expect((await decodeGift('qqq')).ok).toBe(false);
  });
});
