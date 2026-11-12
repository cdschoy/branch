/**
 * FlowerCurtain mode "reveal": ballistic fall, g ≈ 42 vh/s², tilt by quadrant, linear fade over 2.0 s, 2230 ms.
 * Owner: fx. TODO(fx): replace this stub with the closed-form implementation (see example.ts for the
 * pattern) and drop `stub`. Spec: FRAMEWORK §4.2 (P38 reveal; v4 A1-A4); tokens: flowerCurtain / budgets in motion.ts.
 */
import { stubEmitter } from '../stub';
import { budgets, duration } from '../../motion/core/tokens';

export const emitter = stubEmitter('curtainReveal', (tier) => budgets.flowerSprites[tier], duration.gravityCurtain);
