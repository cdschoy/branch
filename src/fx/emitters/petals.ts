/**
 * Petal field (P31): 3 depth tiers, wind drift, tumble, sway; lyric chapters only.
 * Owner: fx. TODO(fx): replace this stub with the closed-form implementation (see example.ts for the
 * pattern) and drop `stub`. Spec: FRAMEWORK §4.2 (P31; v2a A-E04); tokens: flowerCurtain / budgets in motion.ts.
 */
import { stubEmitter } from '../stub';
import { budgets } from '../../motion/core/tokens';

export const emitter = stubEmitter('petals', (tier) => budgets.petalsOnScreen[tier], 4800);
