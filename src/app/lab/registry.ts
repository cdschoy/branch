/**
 * Lab registry (owner: scaffold). Builders add entries by creating `*.lab.tsx` files ANYWHERE under
 * src/ (in their own folders) with a default export of one LabEntry or an array — never by editing a
 * shared file. Shown at #/lab; #/lab/<id> isolates one entry (used by e2e scrub tests).
 *
 *   // src/motion/react/primitives/pops.lab.tsx
 *   export default [{ id: 'P01', title: 'stampPop', group: 'primitive', owner: 'primitives',
 *                     render: ({ replay }) => <StampPop playKey={replay}>3</StampPop> }] satisfies LabEntry[];
 */
import type { ReactNode } from 'react';

export type Owner = 'scaffold' | 'primitives' | 'fx' | 'booth' | 'gift';
export type LabGroup = 'core' | 'primitive' | 'choreography' | 'fx' | 'ui' | 'booth' | 'gift';

export interface LabContext {
  /** Increments on each Replay click; also used as a React key so the stage remounts. */
  readonly replay: number;
  readonly reduced: boolean;
  /** 1 or 3 (preview ×3). Pass to director.play({ timeScale }). */
  readonly timeScale: number;
}

export interface LabEntry {
  /** Stable id: 'P01' … 'P48' for primitives, 'C1a' … for choreographies, free-form otherwise. */
  readonly id: string;
  readonly title: string;
  readonly group: LabGroup;
  readonly owner: Owner;
  /** One line: what to look for (evidence / token). */
  readonly notes?: string;
  /** Stage height in px (default 220). */
  readonly height?: number;
  /** data-theme for the stage (default 'garden-envelope'). */
  readonly theme?: string;
  readonly render: (ctx: LabContext) => ReactNode;
}

type Mod = { default?: LabEntry | readonly LabEntry[] };
const mods = import.meta.glob<Mod>('/src/**/*.lab.tsx', { eager: true });

export const labEntries: readonly LabEntry[] = Object.keys(mods).sort().flatMap((k) => {
  const d = mods[k]?.default;
  return d ? (Array.isArray(d) ? d : [d as LabEntry]) : [];
}).sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
