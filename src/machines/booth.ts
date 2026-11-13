/**
 * Product B booth machine (FRAMEWORK §5.4, C3product, C12; owner: booth).
 *
 *   idle (explainer + setup) ─START→ permission ─GRANTED→ ready ─SHUTTER→ countdown ─SESSION_DONE→ review
 *        │                          └─DENIED→ denied (help + pick photos)          ↑ PAUSE/RESUME
 *        └─PICK→ fallback (file input, one shot at a time) ─FILES_DONE→ review
 *   review ─RETAKE{index}→ retake ─RETAKE_DONE→ review;  review ─RETAKE→ ready (all)
 *   review ─PRINT→ printing ─CHOREO_DONE→ decorate ─EXPORT→ export ─CHOREO_DONE→ decorate
 *   any ─RESET→ idle.  Side effects (camera, Director runs) live in BoothScreen.
 */
import { defineMachine } from './core';

export type BoothState = 'idle' | 'permission' | 'denied' | 'fallback' | 'ready' | 'countdown' | 'review' | 'retake' | 'printing' | 'decorate' | 'export' | 'done';
export type BoothEvent =
  | { type: 'START' } | { type: 'GRANTED' } | { type: 'DENIED'; reason: string } | { type: 'PICK' }
  | { type: 'SHUTTER' } | { type: 'PAUSE' } | { type: 'RESUME' }
  | { type: 'SHOT'; index: number } | { type: 'SESSION_DONE' } | { type: 'FILES_DONE' }
  | { type: 'PRINT' } | { type: 'CHOREO_DONE' } | { type: 'EXPORT' }
  | { type: 'RETAKE'; index?: number } | { type: 'RETAKE_DONE' } | { type: 'SLEEP' } | { type: 'RESET' };
export interface BoothContext { shots: number; total: number; error: string | null; paused: boolean; retakeIndex: number | null; asleep: boolean }

export const boothMachine = defineMachine<BoothState, BoothEvent, BoothContext>({
  id: 'booth',
  initial: 'idle',
  context: { shots: 0, total: 4, error: null, paused: false, retakeIndex: null, asleep: false },
  on: { RESET: { target: 'idle', assign: (c) => ({ ...c, shots: 0, error: null, paused: false, retakeIndex: null }) } },
  states: {
    idle: { tags: ['interactive'], on: { START: { target: 'permission' }, PICK: { target: 'fallback' } } },
    permission: {
      on: {
        GRANTED: { target: 'ready', assign: (c) => ({ ...c, error: null, asleep: false }) },
        DENIED: { target: 'denied', assign: (c, e) => ({ ...c, error: e.reason }) },
      },
    },
    denied: { tags: ['interactive'], on: { START: { target: 'permission' }, PICK: { target: 'fallback' } } },
    fallback: {
      tags: ['interactive'],
      on: { SHOT: { assign: (c, e) => ({ ...c, shots: e.index }) }, FILES_DONE: { target: 'review' }, START: { target: 'permission' } },
    },
    ready: {
      tags: ['interactive'],
      on: {
        SHUTTER: { target: 'countdown', assign: (c) => ({ ...c, shots: 0, paused: false }) },
        SLEEP: { assign: (c) => ({ ...c, asleep: true }) },
        START: { target: 'permission' },
        DENIED: { target: 'denied', assign: (c, e) => ({ ...c, error: e.reason }) },
      },
    },
    countdown: {
      on: {
        SHOT: { assign: (c, e) => ({ ...c, shots: e.index }) },
        PAUSE: { assign: (c) => ({ ...c, paused: true }) },
        RESUME: { assign: (c) => ({ ...c, paused: false }) },
        SESSION_DONE: { target: 'review', assign: (c) => ({ ...c, paused: false }) },
      },
    },
    review: {
      tags: ['interactive'],
      on: {
        PRINT: { target: 'printing' },
        RETAKE: [
          { guard: (_c, e) => e.index !== undefined, target: 'retake', assign: (c, e) => ({ ...c, retakeIndex: e.index ?? null }) },
          { target: 'ready', assign: (c) => ({ ...c, shots: 0 }) },
        ],
      },
    },
    retake: { on: { SHOT: {}, RETAKE_DONE: { target: 'review', assign: (c) => ({ ...c, retakeIndex: null }) } } },
    printing: { on: { CHOREO_DONE: { target: 'decorate' } } },
    decorate: { tags: ['interactive'], on: { EXPORT: { target: 'export' }, RETAKE: { target: 'ready', assign: (c) => ({ ...c, shots: 0 }) }, START: { target: 'permission' } } },
    export: { on: { CHOREO_DONE: { target: 'decorate' } } },
    done: { tags: ['interactive'], on: { START: { target: 'ready' } } },
  },
});
