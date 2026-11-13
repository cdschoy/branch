/**
 * Capture choreographies for the self-booth (C3product / C3gift, FRAMEWORK §4 C3; owner: booth).
 * React-free. Derives runnable Director specs from the token choreographies:
 *
 *  - 'product' (default): C3product, the real-camera tempo (digits 1000 ms, 2-1 re-countdown,
 *    full-screen flashes ≥ 2400 ms apart). Timers 5 / 10 s prepend plain digits per booth.product.timers.
 *  - 'quick': the gift-booth cadence (C3gift: digits 700 ms, flashes 600 ms apart). Its flashes are
 *    scoped to the booth window (WCAG 2.3.1: never > 3 full-screen flashes per second); the
 *    boothWindow photo swaps become camera grabs; the print/toss tail is dropped (C12print follows).
 *
 * Target names used by the specs: pill, token, labels, digit, flash, camera, machine.
 */
import { booth, choreography, type Spec, type Step } from '../motion/core/tokens';

export type Cadence = 'product' | 'quick';
export type TimerSeconds = 3 | 5 | 10;

const shift = (s: Step, by: number): Step => (s.at === 0 || by === 0 ? s : { ...s, at: s.at + by });

/** Prepend plain hard-cut digits (5 s / 10 s timers) and shift every later step. */
function withTimer(steps: readonly Step[], timer: TimerSeconds, digitMs: number, firstDigitAt: number): Step[] {
  const plain = booth.product.timers[String(timer) as '3' | '5' | '10'].plain as readonly number[];
  const by = digitMs * plain.length;
  const pre: Step[] = plain.map((digit, j) => ({
    name: `C3.timer.plain${digit}`, at: firstDigitAt + j * digitMs, dur: 0, target: 'digit', action: 'hardCut', params: { digit, plain: true },
  }));
  return [...steps.filter((s) => s.at === 0), ...pre, ...steps.filter((s) => s.at !== 0).map((s) => shift(s, by))];
}

/** The 4-shot capture run. */
export function captureSpec(cadence: Cadence = 'product', timer: TimerSeconds = 3): Spec {
  if (cadence === 'product') {
    const src = choreography.C3product;
    return { ...src, id: `C3product.t${timer}`, steps: withTimer(src.steps as readonly Step[], timer, booth.product.digitMs, booth.product.digitsMs[0]) };
  }
  const src = choreography.C3gift;
  const steps: Step[] = [];
  let lastFlash = 0;
  for (const s of src.steps as readonly Step[]) {
    if (s.target === 'boothWindow') {
      const n = (s.params as { photo?: number } | undefined)?.photo ?? 1;
      steps.push({ ...s, name: `C3.quick.capture${n}`, target: 'camera', params: { shot: n } });
      continue;
    }
    if (s.target === 'flash') { lastFlash = s.at; steps.push({ ...s, params: { ...s.params, scope: 'boothWindow' } }); continue; }
    if (['pill', 'token', 'labels', 'digit'].includes(s.target) && (s.at === 0 || s.at < lastFlash || lastFlash === 0)) steps.push(s);
  }
  steps.push({ name: 'C3.quick.done', at: lastFlash + booth.product.printAfterLastFlashMs, dur: 0, target: 'machine', action: 'hardCut', params: { event: 'SESSION_DONE' } });
  return { ...src, id: `C3quick.t${timer}`, title: 'Quick booth capture (gift-booth cadence)', steps: withTimer(steps, timer, booth.giftBooth.digitMs, booth.product.digitsMs[0]) };
}

/** Re-shoot one photo (review → booth.retakeOne): the 3-2-1 + flash + grab of shot 1, retargeted. */
export function retakeSpec(shot: number, cadence: Cadence = 'product'): Spec {
  const full = captureSpec(cadence, 3);
  const firstCapture = full.steps.find((s) => s.target === 'camera');
  const firstFlash = full.steps.find((s) => s.target === 'flash');
  const end = firstCapture?.at ?? 0;
  const steps: Step[] = full.steps
    .filter((s) => s.at <= end && s.target !== 'machine')
    .map((s) => (s.target === 'camera' ? { ...s, params: { ...s.params, shot } } : s));
  steps.push({ name: 'C3.retake.done', at: (firstFlash?.at ?? end) + booth.product.printAfterLastFlashMs, dur: 0, target: 'machine', action: 'hardCut', params: { event: 'RETAKE_DONE' } });
  return { ...full, id: `${full.id}.retake${shot}`, steps };
}

/** Run time (ms) of the last capture step: taps after it are ignored (§5.4). */
export const lastCaptureAt = (spec: Spec): number => Math.max(0, ...spec.steps.filter((s) => s.target === 'camera').map((s) => s.at));
