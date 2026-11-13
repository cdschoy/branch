/**
 * DOM action registry (owner: scaffold; entries owned by primitives).
 *
 * Every `*.ts` file in this folder (except index.ts) that exports `actions: ActionImplMap` is
 * collected automatically — add a primitive by creating `src/motion/core/actions/<name>.ts`, never
 * by editing this file. Later files override earlier ones alphabetically, and base.ts holds the
 * generic fallbacks (fade, tween, hardCut, remove, mount, unmount).
 */
import type { ActionImplMap } from '../types';

const mods = import.meta.glob<{ actions?: ActionImplMap }>(['./*.ts', '!./index.ts', '!./*.test.ts'], { eager: true });

export const builtinActions: ActionImplMap = Object.keys(mods)
  .sort((a, b) => (a.endsWith('/base.ts') ? -1 : b.endsWith('/base.ts') ? 1 : a.localeCompare(b)))
  .reduce<ActionImplMap>((acc, k) => Object.assign(acc, mods[k]?.actions ?? {}), {});
