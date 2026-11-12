/** Creator machine (FRAMEWORK §5.2; owner: gift). STUB — steps per create.step.* keys. */
import { defineMachine } from './core';
import type { GiftContentV1 } from '../gift-schema';

export type CreatorState = 'mechanic' | 'theme' | 'people' | 'photos' | 'letter' | 'review' | 'published';
export type CreatorEvent = { type: 'NEXT' } | { type: 'BACK' } | { type: 'EDIT'; patch: Partial<GiftContentV1> } | { type: 'PUBLISH' } | { type: 'GOTO'; step: CreatorState };
export interface CreatorContext { draft: GiftContentV1 | null }

const ORDER: CreatorState[] = ['mechanic', 'theme', 'people', 'photos', 'letter', 'review'];
const step = (d: 1 | -1) => (s: CreatorState): CreatorState => ORDER[Math.max(0, Math.min(ORDER.length - 1, ORDER.indexOf(s) + d))] ?? s;
export const creatorOrder = ORDER;
export const nextStep = step(1);
export const prevStep = step(-1);

export const creatorMachine = defineMachine<CreatorState, CreatorEvent, CreatorContext>({
  id: 'creator',
  initial: 'mechanic',
  context: { draft: null },
  on: { EDIT: { assign: (c, e) => ({ ...c, draft: c.draft ? { ...c.draft, ...e.patch } : null }) } },
  states: {
    mechanic: { on: { NEXT: { target: 'theme' } } },
    theme: { on: { NEXT: { target: 'people' }, BACK: { target: 'mechanic' } } },
    people: { on: { NEXT: { target: 'photos' }, BACK: { target: 'theme' } } },
    photos: { on: { NEXT: { target: 'letter' }, BACK: { target: 'people' } } },
    letter: { on: { NEXT: { target: 'review' }, BACK: { target: 'photos' } } },
    review: { on: { PUBLISH: { target: 'published' }, BACK: { target: 'letter' } } },
    published: { final: true },
  },
});
