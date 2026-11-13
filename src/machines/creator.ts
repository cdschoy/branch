/**
 * Creator machine (FRAMEWORK §5.2; owner: gift). Steps follow the create.step.* keys, trimmed for the
 * starter: mechanic · theme · people (prepare) → photos · letter · songs (content) → review (send).
 * The minimum gift is theme + recipient name + letter; every other content step can be skipped.
 * Guards read the pure validators below so the UI and the machine agree.
 */
import { defineMachine } from './core';
import type { GiftContentV1, LetterPage, MemoriesPage } from '../gift-schema';
import { graphemeCount, nfc } from '../i18n';

export type CreatorState = 'mechanic' | 'theme' | 'people' | 'photos' | 'letter' | 'songs' | 'review' | 'published';
export type CreatorEvent =
  | { type: 'NEXT' } | { type: 'BACK' } | { type: 'SKIP' }
  | { type: 'EDIT'; patch: Partial<GiftContentV1> }
  | { type: 'CONSENT'; value: boolean }
  | { type: 'PUBLISH'; param: string } | { type: 'UNPUBLISH' };
export interface CreatorContext { draft: GiftContentV1 | null; consent: boolean; param: string | null }

const ORDER: CreatorState[] = ['mechanic', 'theme', 'people', 'photos', 'letter', 'songs', 'review'];
const step = (d: 1 | -1) => (s: CreatorState): CreatorState => ORDER[Math.max(0, Math.min(ORDER.length - 1, ORDER.indexOf(s) + d))] ?? s;
export const creatorOrder = ORDER;
export const nextStep = step(1);
export const prevStep = step(-1);
/** The three groups shown as dots (never a step counter, §5.2). */
export const creatorGroup = (s: CreatorState): 0 | 1 | 2 => (['mechanic', 'theme', 'people'].includes(s) ? 0 : s === 'review' || s === 'published' ? 2 : 1);

export const NAME_MAX = 24;
export const BODY_MAX = 1200;

export const letterOf = (d: GiftContentV1 | null): LetterPage | undefined => d?.pages.find((p): p is LetterPage => p.kind === 'letter');
export const photosOf = (d: GiftContentV1 | null): MemoriesPage['photos'] => d?.pages.find((p): p is MemoriesPage => p.kind === 'memories')?.photos ?? [];

/** Validation per step (null = ok, else an i18n key). */
export function peopleError(d: GiftContentV1 | null): 'create.names.recipientRequired' | 'create.names.senderRequired' | 'create.names.tooLong' | null {
  if (!d) return 'create.names.recipientRequired';
  const to = nfc(d.names.to).trim(), from = nfc(d.names.from).trim();
  if (!to) return 'create.names.recipientRequired';
  if (!from) return 'create.names.senderRequired';
  if (graphemeCount(to) > NAME_MAX || graphemeCount(from) > NAME_MAX) return 'create.names.tooLong';
  return null;
}
export function letterError(d: GiftContentV1 | null): 'create.letter.bodyRequired' | 'create.message.tooLong' | null {
  const l = letterOf(d);
  if (!l || !nfc(l.body).trim()) return 'create.letter.bodyRequired';
  if (graphemeCount(l.body) > BODY_MAX) return 'create.message.tooLong';
  return null;
}
export const photosError = (d: GiftContentV1 | null, consent: boolean): 'create.photos.consentNeeded' | null =>
  photosOf(d).length > 0 && !consent ? 'create.photos.consentNeeded' : null;

export const creatorMachine = defineMachine<CreatorState, CreatorEvent, CreatorContext>({
  id: 'creator',
  initial: 'mechanic',
  context: { draft: null, consent: false, param: null },
  on: {
    EDIT: { assign: (c, e) => ({ ...c, param: null, draft: c.draft ? { ...c.draft, ...e.patch } : null }) },
    CONSENT: { assign: (c, e) => ({ ...c, consent: e.value }) },
  },
  states: {
    mechanic: { on: { NEXT: { target: 'theme' } } },
    theme: { on: { NEXT: { target: 'people' }, BACK: { target: 'mechanic' } } },
    people: { on: { NEXT: { target: 'photos', guard: (c) => !peopleError(c.draft) }, BACK: { target: 'theme' } } },
    photos: { on: { NEXT: { target: 'letter', guard: (c) => !photosError(c.draft, c.consent) }, SKIP: { target: 'letter' }, BACK: { target: 'people' } } },
    letter: { on: { NEXT: { target: 'songs', guard: (c) => !letterError(c.draft) }, BACK: { target: 'photos' } } },
    songs: { on: { NEXT: { target: 'review' }, SKIP: { target: 'review' }, BACK: { target: 'letter' } } },
    review: {
      on: {
        PUBLISH: { target: 'published', guard: (c) => !peopleError(c.draft) && !letterError(c.draft), assign: (c, e) => ({ ...c, param: e.param }) },
        BACK: { target: 'songs' },
      },
    },
    published: { on: { UNPUBLISH: { target: 'review' } } },
  },
});

