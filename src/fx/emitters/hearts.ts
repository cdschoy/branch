/**
 * Heart burst (P21): 13-15 hearts (6 low), pop outBack 100 ms, float ~70 px outQuad, fade over the last 300 ms; 1.1-1.2 s.
 * Owner: fx. TODO(fx): replace this stub with the closed-form implementation (see example.ts for the
 * pattern) and drop `stub`. Spec: FRAMEWORK §4.2 (P21; v1 #35, v4 C4); tokens: flowerCurtain / budgets in motion.ts.
 */
import { stubEmitter } from '../stub';
import { budgets } from '../../motion/core/tokens';

export const emitter = stubEmitter('hearts', (tier) => budgets.heartsPerBurst[tier], 1170);
