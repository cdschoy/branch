/**
 * Curtain drop (P12) on canvas: y → 105 vh on curtainFall, mean-colour wash, fade, top→bottom mask (before()/after() layer passes).
 * Owner: fx. TODO(fx): replace this stub with the closed-form implementation (see example.ts for the
 * pattern) and drop `stub`. Spec: FRAMEWORK §4.2 (P12; v5 A-e12-14); tokens: flowerCurtain / budgets in motion.ts.
 */
import { stubEmitter } from '../stub';
import { budgets, duration } from '../../motion/core/tokens';

export const emitter = stubEmitter('curtainDrop', (tier) => budgets.flowerSprites[tier], duration.curtainDrop);
