/**
 * Camera access (FRAMEWORK §5.4, §6.6; owner: booth). React-free; no network.
 *
 * - Capability check first (secure context, getUserMedia, in-app UA hint). UA detection is only a
 *   hint: the truth is the getUserMedia result inside the user gesture.
 * - Constraints: facingMode 'user', 4:3 on every tier (budgets.cameraPreview), ≤30 fps, no audio.
 *   OverconstrainedError retries once with { video: true }.
 * - Errors map to CameraError.kind → booth.error.* keys.
 */
import { budgets, type Tier } from '../motion/core/tokens';

export type CameraErrorKind = 'denied' | 'notFound' | 'inUse' | 'insecure' | 'overconstrained' | 'inApp' | 'unknown';
export class CameraError extends Error {
  constructor(readonly kind: CameraErrorKind, message?: string) { super(message ?? kind); }
}

export interface CameraSession {
  readonly stream: MediaStream;
  readonly video: HTMLVideoElement;
  readonly facing: 'user' | 'environment';
  readonly width: number;
  readonly height: number;
  stop(): void;
}

/** Stop the camera after this long without interaction in the ready state (FRAMEWORK §5.4 lifecycle). */
export const CAMERA_IDLE_SLEEP_MS = 60_000;

export interface OpenCameraOptions { facing?: 'user' | 'environment'; tier?: Tier; video?: HTMLVideoElement }

/** In-app browsers (§5.4 list). Returns the display name used in inapp.banner.body / booth.error.inApp. */
export function detectInApp(ua: string = typeof navigator === 'undefined' ? '' : navigator.userAgent): string | null {
  if (/Zalo/i.test(ua)) return 'Zalo';
  if (/Messenger|FB_IAB\/MESSENGER/i.test(ua)) return 'Messenger';
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return 'TikTok';
  if (/\bLine\//i.test(ua)) return 'LINE';
  return null;
}

export type Platform = 'ios' | 'android' | 'other';
export function detectPlatform(ua: string = typeof navigator === 'undefined' ? '' : navigator.userAgent): Platform {
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

/** Android escape hatch to Chrome (§6.6 ladder step 2). */
export function chromeIntentUrl(href: string = location.href): string {
  const u = new URL(href);
  return `intent://${u.host}${u.pathname}${u.search}${u.hash}#Intent;scheme=${u.protocol.replace(':', '')};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(href)};end`;
}

export interface CameraSupport { readonly ok: boolean; readonly reason: CameraErrorKind | null; readonly inApp: string | null }
/** Pre-flight (no prompt). `ok` can still turn into an error when getUserMedia runs. */
export function cameraSupport(): CameraSupport {
  const inApp = detectInApp();
  if (typeof window === 'undefined' || !window.isSecureContext) return { ok: false, reason: 'insecure', inApp };
  if (!navigator.mediaDevices?.getUserMedia) return { ok: false, reason: inApp ? 'inApp' : 'notFound', inApp };
  return { ok: true, reason: null, inApp };
}

function sizeFor(tier: Tier): [number, number] {
  const [w, h] = budgets.cameraPreview[tier].split('x').map(Number);
  return [w ?? 640, h ?? 480];
}

function mapError(err: unknown): CameraError {
  const name = (err as DOMException | undefined)?.name ?? '';
  switch (name) {
    case 'NotAllowedError': case 'PermissionDeniedError': case 'SecurityError': return new CameraError('denied');
    case 'NotFoundError': case 'DevicesNotFoundError': return new CameraError('notFound');
    case 'NotReadableError': case 'TrackStartError': case 'AbortError': return new CameraError('inUse');
    case 'OverconstrainedError': case 'ConstraintNotSatisfiedError': return new CameraError('overconstrained');
    default: return new CameraError('unknown', String(err));
  }
}

/** Open the camera into a (muted, playsinline) video element. Throws CameraError. */
export async function openCamera(opts: OpenCameraOptions = {}): Promise<CameraSession> {
  const sup = cameraSupport();
  if (!sup.ok) throw new CameraError(sup.reason ?? 'unknown');
  const facing = opts.facing ?? 'user';
  const [w, h] = sizeFor(opts.tier ?? 'mid');
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: w }, height: { ideal: h }, aspectRatio: { ideal: 4 / 3 }, frameRate: { max: 30 } },
      audio: false,
    });
  } catch (err) {
    const e = mapError(err);
    if (e.kind !== 'overconstrained') throw e;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
    catch (err2) { throw mapError(err2); }
  }
  const video = opts.video ?? document.createElement('video');
  video.muted = true; video.playsInline = true; video.setAttribute('playsinline', ''); video.srcObject = stream;
  await video.play().catch(() => undefined);
  if (!video.videoWidth) {
    await new Promise<void>((r) => { const done = () => r(); video.addEventListener('loadedmetadata', done, { once: true }); setTimeout(done, 1500); });
  }
  const s = stream.getVideoTracks()[0]?.getSettings() ?? {};
  return {
    stream, video, facing,
    width: video.videoWidth || s.width || w,
    height: video.videoHeight || s.height || h,
    stop: () => { stream.getTracks().forEach((t) => t.stop()); if (video.srcObject === stream) video.srcObject = null; },
  };
}

/** Screen Wake Lock during a session (best effort). Returns a release function. */
export async function holdWakeLock(): Promise<() => void> {
  try {
    const wl = (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } }).wakeLock;
    if (!wl) return () => undefined;
    const sentinel = await wl.request('screen');
    return () => { void sentinel.release().catch(() => undefined); };
  } catch { return () => undefined; }
}
