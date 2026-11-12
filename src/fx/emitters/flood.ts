/**
 * FlowerCurtain mode "flood" (C7 finale): near-linear rise ≈240-260 vh/s, full cover at +1200 ms; params.phase "clear" for the field clear.
 * Owner: fx. TODO(fx): replace this stub with the closed-form implementation (see example.ts for the
 * pattern) and drop `stub`. Spec: FRAMEWORK §4.2 (P38 flood; v4 D20-D21); tokens: flowerCurtain / budgets in motion.ts.
 */
import { stubEmitter } from '../stub';
import { budgets, duration } from '../../motion/core/tokens';

export const emitter = stubEmitter('flood', (tier) => budgets.finaleSprites[tier], duration.finaleCover);
