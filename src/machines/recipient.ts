/**
 * Recipient player machine (FRAMEWORK §5.3, §5.5; owner: gift). STUB states and events — the gift
 * builder fills transitions/guards (unlock, secret, readEnough, debounce G15).
 */
import { defineMachine } from './core';
import type { GiftContentV1 } from '../gift-schema';

export type RecipientState = 'loading' | 'error' | 'locked' | 'secret' | 'landing' | 'opening' | 'reading' | 'lightbox' | 'drawer' | 'finale' | 'end';
export type RecipientEvent =
  | { type: 'LOADED'; gift: GiftContentV1 } | { type: 'FAILED'; error: string }
  | { type: 'UNLOCKED' } | { type: 'SECRET_OK' } | { type: 'TAP' } | { type: 'CHOREO_DONE' }
  | { type: 'OPEN_PHOTO'; index: number } | { type: 'CLOSE' } | { type: 'OPEN_DRAWER' } | { type: 'CONTINUE' } | { type: 'REPLAY' };
export interface RecipientContext { gift: GiftContentV1 | null; error: string | null; photo: number; readEnough: boolean }

export const recipientMachine = defineMachine<RecipientState, RecipientEvent, RecipientContext>({
  id: 'recipient',
  initial: 'loading',
  context: { gift: null, error: null, photo: 0, readEnough: false },
  states: {
    loading: { on: { LOADED: { target: 'landing', assign: (c, e) => ({ ...c, gift: e.gift }) }, FAILED: { target: 'error', assign: (c, e) => ({ ...c, error: e.error }) } } },
    error: {},
    locked: { on: { UNLOCKED: { target: 'landing' } } },
    secret: { on: { SECRET_OK: { target: 'landing' } } },
    landing: { tags: ['interactive'], on: { TAP: { target: 'opening' } } },
    opening: { on: { CHOREO_DONE: { target: 'reading' } } },
    reading: { tags: ['interactive'], on: { OPEN_PHOTO: { target: 'lightbox', assign: (c, e) => ({ ...c, photo: e.index }) }, OPEN_DRAWER: { target: 'drawer' }, CONTINUE: { target: 'finale' } } },
    lightbox: { tags: ['interactive'], on: { CLOSE: { target: 'reading' } } },
    drawer: { tags: ['interactive'], on: { CLOSE: { target: 'reading' } } },
    finale: { on: { CHOREO_DONE: { target: 'end' } } },
    end: { tags: ['interactive'], on: { REPLAY: { target: 'landing' } } },
  },
});
