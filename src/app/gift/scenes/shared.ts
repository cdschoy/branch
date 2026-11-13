/** Shared types for the gift scenes (owner: gift). */
import type { RefObject } from 'react';
import type { GiftContentV1 } from '../../../gift-schema';
import type { Voice } from '../../../i18n';
import type { RecipientEvent, RecipientState, RecipientContext } from '../../../machines';
import type { Run } from '../../../motion/core';

/** Elements of the pre-mounted reading scene that opener choreographies target (G6). */
export interface ReadingRefs {
  /** Letter wrapper (C2.letterPop target). */
  readonly letter: RefObject<HTMLDivElement | null>;
  /** Washi tape on the letter (C2.tapeHearts origin). */
  readonly tape: RefObject<HTMLSpanElement | null>;
  /** Hanging bunting (C1.decorPendulum / C7.decorPendulum). */
  readonly decor: RefObject<HTMLDivElement | null>;
  /** Polaroid deal wrappers, index 0..5 (C2.deal1 … C2.stack6). */
  readonly photos: RefObject<(HTMLDivElement | null)[]>;
  /** "xem lại" pill (C2.replayPill). */
  readonly replayPill: RefObject<HTMLDivElement | null>;
}

export interface SceneProps {
  readonly gift: GiftContentV1;
  readonly voice: Voice;
  readonly seed: number;
  readonly state: RecipientState;
  readonly ctx: RecipientContext;
  readonly send: (e: RecipientEvent) => void;
  readonly reading: ReadingRefs;
  /** Creator preview runs every choreography ×3. */
  readonly timeScale: number;
  readonly photoCount: number;
  /** The letter starts typing (C1.letterType / end of C2c). */
  readonly onTypingStart: () => void;
  /** Polaroids have been dealt (C2c) — clears their pre-deal hidden state. */
  readonly onDealt: () => void;
}

/** G15: a stage tap fast-forwards the running spectacle ×3 (never skips it). */
export function fastForward(run: Run | null, timeScale: number, factor: number): void {
  if (run && (run.state === 'running' || run.state === 'preloading')) run.setTimeScale(timeScale * factor);
}
