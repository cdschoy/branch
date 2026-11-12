/** fx public API (owner: scaffold). React-free. */
export * from './types';
export { createFxEngine, fx } from './engine';
export { createFxBridge, emitterFor } from './bridge';
export { getEmitter, registerEmitter, listEmitters } from './registry';
export { registerShape, getShape, FLOWER_COLORS, HEART_COLORS, CONFETTI_COLORS } from './shapes';
export { mulberry32, rand01, range, pick, hashSeed, type Rng } from './rng';
export { stubEmitter } from './stub';
