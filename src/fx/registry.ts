/**
 * Emitter registry (owner: scaffold; entries owned by fx). Every `src/fx/emitters/*.ts` that exports
 * `emitter: EmitterDef` (or `emitters: EmitterDef[]`) is collected automatically — add an emitter by
 * creating a file, not by editing this one.
 */
import type { EmitterDef, EmitterId } from './types';

type Mod = { emitter?: EmitterDef<any>; emitters?: readonly EmitterDef<any>[] };
const mods = import.meta.glob<Mod>('./emitters/*.ts', { eager: true });
const table = new Map<string, EmitterDef<any>>();
for (const k of Object.keys(mods).sort()) {
  const m = mods[k];
  for (const e of [...(m?.emitter ? [m.emitter] : []), ...(m?.emitters ?? [])]) table.set(e.id, e);
}

export function getEmitter(id: EmitterId): EmitterDef<any> | undefined { return table.get(id); }
export function registerEmitter(def: EmitterDef<any>): void { table.set(def.id, def); }
export function listEmitters(): EmitterDef<any>[] { return [...table.values()]; }
