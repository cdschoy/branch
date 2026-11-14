/** gift-schema public API (owner: scaffold). React-free, Supabase-free. */
export * from './types';
export { validateGift, migrate, LIMITS, safeHttpUrl, graphemeLength, type Result } from './validate';
export { encodeGift, encodeGiftSync, decodeGift, loadGift, giftUrl, toBase64Url, fromBase64Url } from './codec';
export { resolveMedia, placeholderPhoto } from './media';
import fixtureJson from './fixtures/envelope-min.json';
import fixtureJsonEn from './fixtures/envelope-min.en.json';
import { validateGift } from './validate';
import type { GiftContentV1 } from './types';

const validFixture = (x: unknown): GiftContentV1 => {
  const r = validateGift(x);
  if (!r.ok) throw new Error(`fixture invalid: ${r.error}`);
  return r.value;
};

/** docs/fixtures/gift-envelope-min.json, validated. */
export const fixtureEnvelopeMin: GiftContentV1 = validFixture(fixtureJson);
/** The same minimum gift written in English (locale 'en'; same names and pronouns). */
export const fixtureEnvelopeMinEn: GiftContentV1 = validFixture(fixtureJsonEn);

/** A richer local sample (fixture + placeholder photos + days page) for the landing "sample gift" link. */
export const sampleGift: GiftContentV1 = {
  ...fixtureEnvelopeMin,
  id: 'sample-1',
  pages: [
    ...fixtureEnvelopeMin.pages,
    { kind: 'memories', photos: [{ ref: 'ph:1', caption: 'Đà Lạt, th. 10' }, { ref: 'ph:2', caption: 'Phố cổ' }, { ref: 'ph:3' }] },
    { kind: 'days', startDate: '2024-02-14' },
  ],
  mediaRefs: [],
};

/** The English sample: English letter and captions; names (proper nouns) and the days page unchanged. */
export const sampleGiftEn: GiftContentV1 = {
  ...fixtureEnvelopeMinEn,
  id: 'sample-1-en',
  pages: [
    ...fixtureEnvelopeMinEn.pages,
    { kind: 'memories', photos: [{ ref: 'ph:1', caption: 'Đà Lạt, Oct' }, { ref: 'ph:2', caption: 'Old Quarter' }, { ref: 'ph:3' }] },
    { kind: 'days', startDate: '2024-02-14' },
  ],
  mediaRefs: [],
};

/** The landing sample gift for the visitor's language. Sender-written content is never machine-translated. */
export const sampleGiftFor = (locale: 'vi' | 'en'): GiftContentV1 => (locale === 'en' ? sampleGiftEn : sampleGift);
