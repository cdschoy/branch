/** motion/react public API (owner: scaffold for hooks/FxCanvas; primitives for primitives/*). */
export * from './hooks';
// FxCanvas / useFx live in './FxCanvas' and are imported from there (lazily by the app shell) so the
// fx engine and its emitters stay out of every route's first-tap bundle (§7.7).
export { PRIMITIVES, type PrimitiveInfo, type PrimitiveStatus } from './catalog';
export * from './primitives/types';
export * from './primitives/pops';
export * from './primitives/surfaces';
export * from './primitives/text';
export * from './primitives/gestures';
export * from './primitives/ambient';
export * from './primitives/physical';
export * from './primitives/flowers';
