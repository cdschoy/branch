/** Stub helpers (owner: scaffold). Delete usages as primitives get implemented. */
import { useEffect } from 'react';
import type { BaseProps } from './types';

/** Calls onDone once per (play, playKey) so flows built on stubs never hang. */
export function useStubDone(onDone: (() => void) | undefined, play = true, playKey?: unknown): void {
  useEffect(() => { if (play) onDone?.(); }, [play, playKey]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Static wrapper: renders children with no motion. `data-stub` lets the lab flag unbuilt primitives. */
export function StubBox({ children, className, style, name }: BaseProps & { name: string }) {
  return <div className={className} style={style} data-stub={name}>{children}</div>;
}
