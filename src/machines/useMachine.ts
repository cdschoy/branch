/** React binding for machines/core (owner: scaffold). */
import { useCallback, useReducer, useRef } from 'react';
import { initialSnapshot, transition, type EventObject, type MachineDef, type Snapshot } from './core';

export function useMachine<S extends string, E extends EventObject, C>(m: MachineDef<S, E, C>, context?: Partial<C>) {
  const ref = useRef(m);
  const [snap, dispatch] = useReducer(
    (s: Snapshot<S, C>, e: E) => { const n = transition(ref.current, s, e); return n.changed ? n : s; },
    undefined, () => initialSnapshot(m, context),
  );
  const send = useCallback((e: E) => dispatch(e), []);
  return [snap, send] as const;
}
