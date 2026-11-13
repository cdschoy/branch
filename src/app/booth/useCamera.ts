/**
 * Camera lifecycle for the booth route (FRAMEWORK §5.4; owner: booth): one session at a time,
 * stop on pagehide / leaving / hidden tab (re-acquire when visible again), Wake Lock while live,
 * sleep after CAMERA_IDLE_SLEEP_MS without interaction while `idleSleep` is on.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { getTier } from '../../motion/core';
import { CAMERA_IDLE_SLEEP_MS, holdWakeLock, openCamera, type CameraSession } from '../../booth';

/** Thrown by `open()` when a newer open() or a stop()/unmount superseded it; the caller ignores it. */
export class CameraSuperseded extends Error { constructor() { super('superseded'); } }

export function useCamera(video: RefObject<HTMLVideoElement | null>, idleSleep: boolean, onSleep: () => void) {
  const [session, setSession] = useState<CameraSession | null>(null);
  const ref = useRef<CameraSession | null>(null);
  const wake = useRef<(() => void) | null>(null);
  const resumeOnVisible = useRef(false);
  /** Bumped by every open() and stop(): a getUserMedia / wake-lock promise that resolves under an older
   *  generation belongs to a session nobody wants any more and is released at once (no leaked stream). */
  const gen = useRef(0);
  const sleepCb = useRef(onSleep);
  sleepCb.current = onSleep;

  const stop = useCallback(() => {
    gen.current++;
    ref.current?.stop(); ref.current = null; setSession(null);
    wake.current?.(); wake.current = null;
  }, []);

  const open = useCallback(async () => {
    const g = ++gen.current;
    ref.current?.stop(); ref.current = null;
    const s = await openCamera({ video: video.current ?? undefined, tier: getTier() });
    if (g !== gen.current) { s.stop(); throw new CameraSuperseded(); }
    ref.current = s; setSession(s);
    void holdWakeLock().then((release) => {
      if (g !== gen.current) { release(); return; }
      wake.current?.(); wake.current = release;
    });
    return s;
  }, [video]);

  useEffect(() => {
    const onHide = () => stop();
    const onVis = () => {
      if (document.visibilityState === 'hidden') { resumeOnVisible.current = !!ref.current; stop(); }
      else if (resumeOnVisible.current) { resumeOnVisible.current = false; void open().catch(() => undefined); }
    };
    addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVis);
    return () => { removeEventListener('pagehide', onHide); document.removeEventListener('visibilitychange', onVis); stop(); };
  }, [open, stop]);

  // Idle sleep: any pointer / key activity restarts the clock.
  useEffect(() => {
    if (!idleSleep || !session) return;
    let id = setTimeout(fire, CAMERA_IDLE_SLEEP_MS);
    function fire() { stop(); sleepCb.current(); }
    const poke = () => { clearTimeout(id); id = setTimeout(fire, CAMERA_IDLE_SLEEP_MS); };
    addEventListener('pointerdown', poke); addEventListener('keydown', poke);
    return () => { clearTimeout(id); removeEventListener('pointerdown', poke); removeEventListener('keydown', poke); };
  }, [idleSleep, session, stop]);

  return { session, open, stop };
}
