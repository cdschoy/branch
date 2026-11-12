/**
 * Frame grab + strip compositing (FRAMEWORK §5.4, §7.4; owner: booth). React-free.
 * STUB with final signatures. TODO(booth): rVFC grab at the flash peak (+ calibrated latency),
 * OffscreenCanvas worker compositor, LUT filters (booth.filter.*), GIF/MP4 later.
 */
import tokens from '@tokens/design-tokens.json';

export const STRIP = tokens.proportion.photoStrip;

export interface Shot { readonly bitmap: ImageBitmap | HTMLCanvasElement; readonly at: number; readonly mirrored: boolean }

/** Grab the current video frame (4:3), mirrored for the selfie preview if asked. */
export async function grabFrame(video: HTMLVideoElement, mirrored = true): Promise<Shot> {
  const c = document.createElement('canvas');
  c.width = video.videoWidth || 640; c.height = video.videoHeight || 480;
  const g = c.getContext('2d')!;
  if (mirrored) { g.translate(c.width, 0); g.scale(-1, 1); }
  g.drawImage(video, 0, 0, c.width, c.height);
  return { bitmap: c, at: performance.now(), mirrored };
}

export interface StripOptions { readonly frameColor: string; readonly footerText?: string; readonly date?: string }

/** Composite 4 shots into the 600×1800 export strip. TODO(booth): real layout, fonts, frame art. */
export async function composeStrip(_shots: readonly Shot[], _opts: StripOptions): Promise<Blob> {
  throw new Error('TODO(booth): composeStrip');
}
