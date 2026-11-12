/**
 * A tiny typed state machine (owner: scaffold). XState 5 is the production choice (§5.5); this is a
 * drop-in-shaped stand-in for the starter so machines stay explicit, guarded and testable without the
 * dependency. React-free; `useMachine` (useMachine.ts) binds it to React.
 *
 *   const m = defineMachine<State, Event, Ctx>({ id, initial, context, states: { idle: { on: { GO: { target: 'busy' } } } } });
 *   let snap = initialSnapshot(m); snap = transition(m, snap, { type: 'GO' });
 */
export interface EventObject { readonly type: string }

export interface TransitionDef<S extends string, E extends EventObject, C> {
  readonly target?: S;
  readonly guard?: (ctx: C, ev: E) => boolean;
  readonly assign?: (ctx: C, ev: E) => C;
}
type On<S extends string, E extends EventObject, C> = {
  readonly [T in E['type']]?: TransitionDef<S, Extract<E, { type: T }>, C> | readonly TransitionDef<S, Extract<E, { type: T }>, C>[];
};
export interface StateDef<S extends string, E extends EventObject, C> {
  readonly on?: On<S, E, C>;
  /** Runs on entry; may return a context update. Side effects belong in the React layer. */
  readonly entry?: (ctx: C) => C | void;
  readonly final?: boolean;
  /** Free-form tags (e.g. 'interactive' — input allowed; G15). */
  readonly tags?: readonly string[];
}
export interface MachineDef<S extends string, E extends EventObject, C> {
  readonly id: string;
  readonly initial: S;
  readonly context: C;
  readonly states: { readonly [K in S]: StateDef<S, E, C> };
  /** Handled in every state unless the state handles the event itself. */
  readonly on?: On<S, E, C>;
}
export interface Snapshot<S extends string, C> { readonly value: S; readonly context: C; readonly changed: boolean }

export const defineMachine = <S extends string, E extends EventObject, C>(m: MachineDef<S, E, C>) => m;

export function initialSnapshot<S extends string, E extends EventObject, C>(m: MachineDef<S, E, C>, context?: Partial<C>): Snapshot<S, C> {
  const ctx = { ...m.context, ...context } as C;
  return { value: m.initial, context: m.states[m.initial].entry?.(ctx) ?? ctx, changed: true };
}

export function transition<S extends string, E extends EventObject, C>(m: MachineDef<S, E, C>, snap: Snapshot<S, C>, ev: E): Snapshot<S, C> {
  const st = m.states[snap.value];
  const type = ev.type as E['type'];
  const raw = (st.on?.[type] ?? m.on?.[type]) as TransitionDef<S, E, C> | readonly TransitionDef<S, E, C>[] | undefined;
  if (!raw || st.final) return { ...snap, changed: false };
  const list = (Array.isArray(raw) ? raw : [raw]) as readonly TransitionDef<S, E, C>[];
  const t = list.find((x) => !x.guard || x.guard(snap.context, ev));
  if (!t) return { ...snap, changed: false };
  let ctx = t.assign ? t.assign(snap.context, ev) : snap.context;
  const value = t.target ?? snap.value;
  if (t.target && t.target !== snap.value) ctx = m.states[value].entry?.(ctx) ?? ctx;
  return { value, context: ctx, changed: true };
}

export const hasTag = <S extends string, E extends EventObject, C>(m: MachineDef<S, E, C>, s: S, tag: string) => !!m.states[s].tags?.includes(tag);
