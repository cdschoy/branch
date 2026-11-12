/** gift-schema public API (owner: scaffold). React-free, Supabase-free. */
export * from './types';
export { validateGift, migrate, LIMITS, type Result } from './validate';
export { encodeGift, encodeGiftSync, decodeGift, loadGift, giftUrl, toBase64Url, fromBase64Url } from './codec';
export { resolveMedia, placeholderPhoto } from './media';
import fixtureJson from './fixtures/envelope-min.json';
import { validateGift } from './validate';
import type { GiftContentV1 } from './types';

/** docs/fixtures/gift-envelope-min.json, validated. */
export const fixtureEnvelopeMin: GiftContentV1 = (() => {
  const r = validateGift(fixtureJson);
  if (!r.ok) throw new Error(`fixture invalid: ${r.error}`);
  return r.value;
})();

/** A richer local sample (fixture + placeholder photos + days page) for the landing "sample gift" link. */
export const sampleGift: GiftContentV1 = {
  ...fixtureEnvelopeMin,
  id: 'sample-1',
  pages: [
    ...fixtureEnvelopeMin.pages,
    { kind: 'memories', photos: [{ ref: 'ph:1', caption: 'Đà Lạt, tháng Mười' }, { ref: 'ph:2', caption: 'Phố cổ' }, { ref: 'ph:3' }] },
    { kind: 'days', startDate: '2024-02-14' },
  ],
  mediaRefs: [],
};
