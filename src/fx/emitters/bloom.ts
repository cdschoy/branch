/**
 * Bloom burst (P39): radial emitter at the hero centre, bloomSprite push, bloomCoverage over ~2.5 s, edge settle top → right → left (params.phase "edgeSettle").
 * Owner: fx. TODO(fx): replace this stub with the closed-form implementation (see example.ts for the
 * pattern) and drop `stub`. Spec: FRAMEWORK §4.2 (P39; v5 A-e08); tokens: flowerCurtain / budgets in motion.ts.
 */
import { stubEmitter } from '../stub';
import { budgets, duration } from '../../motion/core/tokens';

export const emitter = stubEmitter('bloom', (tier) => budgets.bloomSprites[tier], duration.bloomBurst);
