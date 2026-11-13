/**
 * Recipient player machine (FRAMEWORK §5.3, §5.5; owner: gift). Pure and React-free: timers,
 * choreographies and the readEnough clock live in the React layer, which reports back with events.
 *
 *   loading → landing ──TAP──▶ opening ─CHOREO_DONE─┬─ envelope ▶ prompt ──TAP──▶ revealing ─CHOREO_DONE─┐
 *                                                   └─ box      ▶ treats ─(6 bites)─▶ spreading ─DONE───┤
 *                                                                                                       ▼
 *   end ◀─SWAP── finale ◀─CONTINUE (readEnough)── reading ⇄ lightbox / drawer
 *    └──REPLAY──▶ landing (hint ladder restarts)
 *
 * G15: taps during a choreography are not events here (the stage fast-forwards instead), so a state
 * without a TAP transition simply ignores them.
 */
import { defineMachine } from './core';
import type { GiftContentV1, Mechanic } from '../gift-schema';

export type RecipientState =
  | 'loading' | 'error' | 'locked' | 'secret'
  | 'landing' | 'opening' | 'prompt' | 'revealing' | 'treats' | 'spreading'
  | 'reading' | 'lightbox' | 'drawer' | 'finale' | 'end';

export type RecipientEvent =
  | { type: 'LOADED'; gift: GiftContentV1; done?: boolean } | { type: 'FAILED'; error: string }
  | { type: 'UNLOCKED' } | { type: 'SECRET_OK' }
  | { type: 'TAP' } | { type: 'CHOREO_DONE' }
  | { type: 'BITE'; treat: number }
  | { type: 'TYPED' } | { type: 'READ_ENOUGH' }
  | { type: 'OPEN_PHOTO'; index: number } | { type: 'PHOTO_TO'; index: number } | { type: 'CLOSE' }
  | { type: 'OPEN_DRAWER' } | { type: 'CONTINUE'; force?: boolean } | { type: 'SWAP' } | { type: 'REPLAY' };

export interface RecipientContext {
  gift: GiftContentV1 | null;
  error: string | null;
  photo: number;
  /** Letter fully typed (first open only types; later visits show it at once). */
  typed: boolean;
  readEnough: boolean;
  /** Bites taken per treat (C2: 3 treats × 2 bites). */
  bites: readonly number[];
  /** How many times the opener has been played (REPLAY increments; used as a remount key). */
  plays: number;
}

export const TREATS = 3;
export const BITES_PER_TREAT = 2;

const mechanicOf = (c: RecipientContext): Mechanic => c.gift?.mechanic ?? 'envelope';
const treatsLeft = (bites: readonly number[]) => bites.filter((b) => b < BITES_PER_TREAT).length;
export const recipientTreatsLeft = treatsLeft;
const freshBites = (): number[] => Array.from({ length: TREATS }, () => 0);

const toReading = { target: 'reading' as const };

export const recipientMachine = defineMachine<RecipientState, RecipientEvent, RecipientContext>({
  id: 'recipient',
  initial: 'loading',
  context: { gift: null, error: null, photo: 0, typed: false, readEnough: false, bites: freshBites(), plays: 0 },
  on: {
    TYPED: { assign: (c) => ({ ...c, typed: true }) },
    READ_ENOUGH: { guard: (c) => c.typed, assign: (c) => ({ ...c, readEnough: true }) },
  },
  states: {
    loading: {
      on: {
        LOADED: [
          // re-opening a finished gift lands on the end card (§5.3)
          { guard: (_c, e) => !!e.done, target: 'end', assign: (c, e) => ({ ...c, gift: e.gift }) },
          { target: 'landing', assign: (c, e) => ({ ...c, gift: e.gift }) },
        ],
        FAILED: { target: 'error', assign: (c, e) => ({ ...c, error: e.error }) },
      },
    },
    error: { final: true },
    // Local starter: the server enforces these gates in production (§5.3); the UI exists for the seam.
    locked: { on: { UNLOCKED: { target: 'landing' } } },
    secret: { on: { SECRET_OK: { target: 'landing' } } },
    landing: { tags: ['interactive'], on: { TAP: { target: 'opening' } } },
    opening: {
      on: {
        CHOREO_DONE: [
          { guard: (c) => mechanicOf(c) === 'box', target: 'treats' },
          { target: 'prompt' },
        ],
      },
    },
    /** Envelope: the bloom wall drifts; tap 2 is accepted only once the prompt has mounted. */
    prompt: { tags: ['interactive'], on: { TAP: { target: 'revealing' } } },
    revealing: { on: { CHOREO_DONE: toReading } },
    treats: {
      tags: ['interactive'],
      on: {
        BITE: [
          {
            // the 6th bite: a ritual auto-advances 1 frame after its goal (§5.1)
            guard: (c, e) => treatsLeft(c.bites.map((b, i) => (i === e.treat ? b + 1 : b))) === 0,
            target: 'spreading',
            assign: (c, e) => ({ ...c, bites: c.bites.map((b, i) => (i === e.treat ? Math.min(BITES_PER_TREAT, b + 1) : b)) }),
          },
          {
            guard: (c, e) => (c.bites[e.treat] ?? BITES_PER_TREAT) < BITES_PER_TREAT,
            assign: (c, e) => ({ ...c, bites: c.bites.map((b, i) => (i === e.treat ? b + 1 : b)) }),
          },
        ],
      },
    },
    spreading: { on: { CHOREO_DONE: toReading } },
    reading: {
      tags: ['interactive'],
      on: {
        OPEN_PHOTO: { target: 'lightbox', assign: (c, e) => ({ ...c, photo: e.index }) },
        OPEN_DRAWER: { target: 'drawer' },
        CONTINUE: { guard: (c, e) => c.readEnough || !!e.force, target: 'finale' },
        REPLAY: { target: 'landing', assign: (c) => ({ ...c, bites: freshBites(), plays: c.plays + 1 }) },
      },
    },
    lightbox: {
      tags: ['interactive'],
      on: {
        PHOTO_TO: { assign: (c, e) => ({ ...c, photo: e.index }) },
        CLOSE: toReading,
      },
    },
    drawer: {
      tags: ['interactive'],
      on: {
        CLOSE: toReading,
        OPEN_PHOTO: { target: 'lightbox', assign: (c, e) => ({ ...c, photo: e.index }) },
        CONTINUE: { guard: (c, e) => c.readEnough || !!e.force, target: 'finale' },
      },
    },
    /** C7: the end card swaps in under the cover (C7.swap). */
    finale: { on: { SWAP: { target: 'end' } } },
    end: {
      tags: ['interactive'],
      on: { REPLAY: { target: 'landing', assign: (c) => ({ ...c, bites: freshBites(), plays: c.plays + 1 }) } },
    },
  },
});
