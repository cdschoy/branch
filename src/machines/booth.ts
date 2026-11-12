/** Product B booth machine (FRAMEWORK §5.4, C3product, C12; owner: booth). STUB states and events. */
import { defineMachine } from './core';

export type BoothState = 'idle' | 'permission' | 'denied' | 'ready' | 'countdown' | 'review' | 'printing' | 'decorate' | 'export' | 'done';
export type BoothEvent =
  | { type: 'START' } | { type: 'GRANTED' } | { type: 'DENIED'; reason: string } | { type: 'SHUTTER' }
  | { type: 'SHOT'; index: number } | { type: 'SESSION_DONE' } | { type: 'PRINT' } | { type: 'CHOREO_DONE' }
  | { type: 'EXPORT' } | { type: 'RETAKE'; index?: number } | { type: 'RESET' };
export interface BoothContext { shots: number; total: number; error: string | null }

export const boothMachine = defineMachine<BoothState, BoothEvent, BoothContext>({
  id: 'booth',
  initial: 'idle',
  context: { shots: 0, total: 4, error: null },
  on: { RESET: { target: 'idle' } },
  states: {
    idle: { tags: ['interactive'], on: { START: { target: 'permission' } } },
    permission: { on: { GRANTED: { target: 'ready' }, DENIED: { target: 'denied', assign: (c, e) => ({ ...c, error: e.reason }) } } },
    denied: { tags: ['interactive'], on: { START: { target: 'permission' } } },
    ready: { tags: ['interactive'], on: { SHUTTER: { target: 'countdown', assign: (c) => ({ ...c, shots: 0 }) } } },
    countdown: { on: { SHOT: { assign: (c, e) => ({ ...c, shots: e.index }) }, SESSION_DONE: { target: 'review' } } },
    review: { tags: ['interactive'], on: { PRINT: { target: 'printing' }, RETAKE: { target: 'countdown' } } },
    printing: { on: { CHOREO_DONE: { target: 'decorate' } } },
    decorate: { tags: ['interactive'], on: { EXPORT: { target: 'export' } } },
    export: { on: { CHOREO_DONE: { target: 'done' } } },
    done: { tags: ['interactive'], on: { START: { target: 'ready' } } },
  },
});
