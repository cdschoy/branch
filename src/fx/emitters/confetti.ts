/**
 * Confetti fountain (P22): vy0 ≈ −0.60 strip-heights/s, g ≈ 2.36 strip-heights/s², ±34% spread, 800 ms, stage canvas (not clipped).
 * Owner: fx. TODO(fx): replace this stub with the closed-form implementation (see example.ts for the
 * pattern) and drop `stub`. Spec: FRAMEWORK §4.2 (P22; v1 #25/#29/#33); tokens: flowerCurtain / budgets in motion.ts.
 */
import { stubEmitter } from '../stub';
import { budgets } from '../../motion/core/tokens';

export const emitter = stubEmitter('confetti', (tier) => budgets.confettiPerLanding[tier], 800);
