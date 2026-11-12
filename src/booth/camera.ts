/**
 * Camera access (FRAMEWORK §5.4, §6.6; owner: booth). React-free; may not import network code.
 * STUB with the final signatures. TODO(booth): constraints per tier (budgets.cameraPreview), error
 * mapping to booth.error.* keys, in-app browser ladder (inapp.*), sleep after idle.
 */
import type { Tier } from '../motion/core/tokens';

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

export interface OpenCameraOptions { facing?: 'user' | 'environment'; tier?: Tier; video?: HTMLVideoElement }

/** Open the camera into a (muted, playsinline) video element. Throws CameraError. */
export async function openCamera(opts: OpenCameraOptions = {}): Promise<CameraSession> {
  if (!window.isSecureContext) throw new CameraError('insecure');
  if (!navigator.mediaDevices?.getUserMedia) throw new CameraError('notFound');
  const facing = opts.facing ?? 'user';
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, aspectRatio: 4 / 3 }, audio: false });
  } catch (err) {
    const name = (err as DOMException)?.name;
    throw new CameraError(name === 'NotAllowedError' ? 'denied' : name === 'NotFoundError' ? 'notFound' : name === 'NotReadableError' ? 'inUse' : name === 'OverconstrainedError' ? 'overconstrained' : 'unknown');
  }
  const video = opts.video ?? document.createElement('video');
  video.muted = true; video.playsInline = true; video.srcObject = stream;
  await video.play().catch(() => undefined);
  const s = stream.getVideoTracks()[0]?.getSettings() ?? {};
  return { stream, video, facing, width: s.width ?? video.videoWidth, height: s.height ?? video.videoHeight, stop: () => stream.getTracks().forEach((t) => t.stop()) };
}
