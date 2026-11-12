/**
 * FlowerCurtain mode "wipe": linear fall (lead ≈200 vh/s), sine sway, constant spin; 1370 ms; swap at ≥70% cover.
 * Owner: fx. TODO(fx): replace this stub with the closed-form implementation (see example.ts for the
 * pattern) and drop `stub`. Spec: FRAMEWORK §4.2 (P38 wipe; v1 #49-52); tokens: flowerCurtain / budgets in motion.ts.
 */
import { stubEmitter } from '../stub';
import { budgets, duration } from '../../motion/core/tokens';

export const emitter = stubEmitter('curtainWipe', (tier) => budgets.flowerSprites[tier], duration.flowerWipe);
