/**
 * Frame grab + strip compositing (FRAMEWORK §3.6, §5.4, §7.4; owner: booth). React-free, no network.
 *
 * Geometry comes from design-tokens proportion.photoStrip: 600×1800, 4 cells 486×364 (4:3) at
 * x = insetSide 57, y = insetTop 36 + i·(364 + gap 18), footer 254 px at the bottom.
 * Compose order (§5.4): frame → photos (cover-fit) → CPU LUT → frame overlay → text.
 * Starter: runs on the main thread (seam: move composeStripCanvas into an OffscreenCanvas worker;
 * text must still be rasterised on the main thread after document.fonts.load()).
 */
import { proportion } from '../motion/core/tokens';
import { graphemes, nfc } from '../i18n';
import { applyLut, bake, filterById, type FilterId } from './filters';
import type { Motif, Palette } from './frames';

export const STRIP = proportion.photoStrip;
/** Longest side of a stored shot (§6.6 "shots downscaled to ≤1080 px"). */
export const SHOT_MAX_PX = 1080;

export interface Shot { readonly bitmap: ImageBitmap | HTMLCanvasElement; readonly at: number; readonly mirrored: boolean }

/** Wait for the next presented video frame (rVFC), or a short timeout where unsupported. */
export function nextVideoFrame(video: HTMLVideoElement, timeoutMs = 50): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    const v = video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
    if (typeof v.requestVideoFrameCallback === 'function') v.requestVideoFrameCallback(finish);
    setTimeout(finish, timeoutMs);
  });
}

function canvasOf(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return [c, c.getContext('2d', { willReadFrequently: true })!];
}

/** Grab the current video frame (4:3 centre crop, ≤1080 px), mirrored like the selfie preview if asked. */
export async function grabFrame(video: HTMLVideoElement, mirrored = true): Promise<Shot> {
  await nextVideoFrame(video);
  const vw = video.videoWidth || 640, vh = video.videoHeight || 480;
  const [sx, sy, sw, sh] = coverRect(vw, vh, 4, 3);
  const k = Math.min(1, SHOT_MAX_PX / sw);
  const [c, g] = canvasOf(sw * k, sh * k);
  if (mirrored) { g.translate(c.width, 0); g.scale(-1, 1); }
  g.drawImage(video, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return { bitmap: c, at: performance.now(), mirrored };
}

/** A shot from a picked / natively captured file (fallback ladder step 3-4). Never mirrored. */
export async function shotFromFile(file: Blob): Promise<Shot> {
  let src: ImageBitmap | HTMLImageElement;
  try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch {
    const url = URL.createObjectURL(file);
    try { const img = new Image(); img.src = url; await img.decode(); src = img; } finally { setTimeout(() => URL.revokeObjectURL(url), 0); }
  }
  const w = 'naturalWidth' in src ? src.naturalWidth : src.width, h = 'naturalHeight' in src ? src.naturalHeight : src.height;
  const [sx, sy, sw, sh] = coverRect(w, h, 4, 3);
  const k = Math.min(1, SHOT_MAX_PX / sw);
  const [c, g] = canvasOf(sw * k, sh * k);
  g.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
  if ('close' in src) src.close();
  return { bitmap: c, at: performance.now(), mirrored: false };
}

/** Release a shot's pixels (§6.6 ".close() every bitmap"). */
export function releaseShot(s: Shot): void {
  if ('close' in s.bitmap) s.bitmap.close();
  else { s.bitmap.width = 0; s.bitmap.height = 0; }
}

/** Source rect that cover-fits a (aw:ah) box inside a w×h image. */
export function coverRect(w: number, h: number, aw: number, ah: number): [number, number, number, number] {
  const target = aw / ah;
  if (w / h > target) { const sw = h * target; return [(w - sw) / 2, 0, sw, h]; }
  const sh = w / target; return [0, (h - sh) / 2, w, sh];
}

/** A small preview data URL of a shot (review grid / tray). */
export function shotPreviewUrl(s: Shot, width = 320): string {
  const src = s.bitmap;
  const [c, g] = canvasOf(width, (width * src.height) / src.width);
  g.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85);
}

export interface StripOptions {
  /** Frame fill (resolved colour). Kept for the frozen contract; `palette.frame` wins when given. */
  readonly frameColor: string;
  /** Caption line (NFC, ≤ 40 graphemes). */
  readonly footerText?: string;
  /** Date line, e.g. "13/11/2026 · 5/10 âm lịch". */
  readonly date?: string;
  readonly palette?: Palette;
  readonly motif?: Motif;
  readonly filter?: FilterId;
  /** Deterministic motif placement. */
  readonly seed?: number;
}

export interface Rect { readonly x: number; readonly y: number; readonly w: number; readonly h: number }
/** The 4 photo cells and the footer, in export px. */
export function stripLayout(): { cells: Rect[]; footer: Rect; size: [number, number] } {
  const [W, H] = STRIP.exportPx as [number, number];
  const [fw, fh] = STRIP.framePx as [number, number];
  const cells = Array.from({ length: STRIP.frames }, (_, i) => ({ x: STRIP.insetSidePx, y: STRIP.insetTopPx + i * (fh + STRIP.gapPx), w: fw, h: fh }));
  return { cells, footer: { x: 0, y: H - STRIP.footerPx, w: W, h: STRIP.footerPx }, size: [W, H] };
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function drawFlower(g: CanvasRenderingContext2D, x: number, y: number, r: number, petal: string, centre: string, rot: number) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = petal;
  for (let i = 0; i < 5; i++) { g.rotate((Math.PI * 2) / 5); g.beginPath(); g.ellipse(0, -r * 0.62, r * 0.42, r * 0.62, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = centre; g.beginPath(); g.arc(0, 0, r * 0.34, 0, Math.PI * 2); g.fill(); g.restore();
}

function drawHeart(g: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string) {
  g.save(); g.translate(x, y); g.scale(s / 20, s / 20); g.fillStyle = fill;
  g.beginPath(); g.moveTo(10, 18); g.bezierCurveTo(-4, 9, 2, -2, 10, 4.5); g.bezierCurveTo(18, -2, 24, 9, 10, 18); g.closePath(); g.fill(); g.restore();
}

function drawMotif(g: CanvasRenderingContext2D, motif: Motif, p: Palette, W: number, H: number, cells: readonly Rect[], seed: number) {
  g.save();
  if (motif === 'stripes') {
    g.globalAlpha = 0.28; g.fillStyle = p.motif;
    const band = 28;
    g.beginPath();
    for (let x = -H; x < W + H; x += band * 2) { g.moveTo(x, 0); g.lineTo(x + band, 0); g.lineTo(x + band + H, H); g.lineTo(x + H, H); g.closePath(); }
    g.fill();
  } else if (motif === 'gingham') {
    const sq = 30;
    g.fillStyle = p.motif;
    g.globalAlpha = 0.22;
    for (let x = 0; x < W; x += sq * 2) g.fillRect(x, 0, sq, H);
    for (let y = 0; y < H; y += sq * 2) g.fillRect(0, y, W, sq);
  } else {
    const r = rng(seed);
    for (let i = 0; i < 70; i++) {
      const x = r() * W, y = r() * H;
      // flowers live in the margins / gaps / footer, never on a photo
      if (cells.some((c) => x > c.x - 10 && x < c.x + c.w + 10 && y > c.y - 10 && y < c.y + c.h + 10)) continue;
      if (y > H - STRIP.footerPx && x > STRIP.insetSidePx && x < W - STRIP.insetSidePx) continue; // keep the caption / date legible
      drawFlower(g, x, y, 9 + r() * 12, i % 3 === 0 ? p.motifAlt : p.motif, p.accent, r() * Math.PI);
    }
  }
  g.restore();
}

/** Fit `text` into maxW by shrinking the font, then by trimming graphemes. */
function fitText(g: CanvasRenderingContext2D, text: string, font: (px: number) => string, px: number, minPx: number, maxW: number): [string, number] {
  let size = px;
  g.font = font(size);
  while (g.measureText(text).width > maxW && size > minPx) { size -= 2; g.font = font(size); }
  let out = text;
  const gs = graphemes(text);
  while (g.measureText(out).width > maxW && gs.length > 1) { gs.pop(); out = gs.join('') + '…'; }
  return [out, size];
}

export const STRIP_FONTS = { caption: (px: number) => `500 ${px}px Mali, "Be Vietnam Pro", sans-serif`, date: (px: number) => `600 ${px}px "Be Vietnam Pro", sans-serif` };

/** Load the strip faces with Vietnamese sample text before rasterising (§3.4 rule 8). */
export async function loadStripFonts(timeoutMs = 1500): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const sample = 'ắệữĐơ 0123456789';
  const load = Promise.all([document.fonts.load(STRIP_FONTS.caption(56), sample), document.fonts.load(STRIP_FONTS.date(30), sample)]).catch(() => undefined);
  await Promise.race([load, new Promise((r) => setTimeout(r, timeoutMs))]);
}

/** Composite up to 4 shots into the 600×1800 strip canvas. */
export function composeStripCanvas(shots: readonly Shot[], opts: StripOptions): HTMLCanvasElement {
  const { cells, footer, size: [W, H] } = stripLayout();
  const p: Palette = opts.palette ?? { frame: opts.frameColor, frameShadow: opts.frameColor, motif: opts.frameColor, motifAlt: opts.frameColor, paper: opts.frameColor, ink: 'currentColor', accent: opts.frameColor };
  const [c, g] = canvasOf(W, H);
  // 1. frame
  g.fillStyle = p.frame; g.fillRect(0, 0, W, H);
  drawMotif(g, opts.motif ?? 'stripes', p, W, H, cells, opts.seed ?? 1);
  // 2-3. photos (cover-fit) + CPU LUT
  const lut = bake(filterById(opts.filter ?? 'natural'));
  cells.forEach((cell, i) => {
    g.fillStyle = p.paper;
    g.fillRect(cell.x - 6, cell.y - 6, cell.w + 12, cell.h + 12);
    const shot = shots[i];
    if (!shot) return;
    const src = shot.bitmap;
    const [sx, sy, sw, sh] = coverRect(src.width, src.height, cell.w, cell.h);
    g.drawImage(src, sx, sy, sw, sh, cell.x, cell.y, cell.w, cell.h);
    const img = g.getImageData(cell.x, cell.y, cell.w, cell.h);
    applyLut(img.data, lut);
    g.putImageData(img, cell.x, cell.y);
  });
  // 4. frame overlay: footer band + hearts
  g.save();
  g.fillStyle = p.frameShadow; g.globalAlpha = 0.35; g.fillRect(0, footer.y + 18, W, 3); g.restore();
  drawHeart(g, W / 2 - 10, footer.y + 34, 20, p.accent);
  // 5. text (never mirrored: drawn after the photos are flipped)
  g.fillStyle = p.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  const maxW = W - STRIP.insetSidePx * 2;
  if (opts.footerText) {
    const [txt, px] = fitText(g, nfc(opts.footerText), STRIP_FONTS.caption, 56, 32, maxW);
    g.font = STRIP_FONTS.caption(px);
    g.fillText(txt, W / 2, footer.y + footer.h * 0.47);
  }
  if (opts.date) {
    const [txt, px] = fitText(g, nfc(opts.date), STRIP_FONTS.date, 28, 18, maxW);
    g.font = STRIP_FONTS.date(px);
    g.globalAlpha = 0.9;
    g.fillText(txt, W / 2, footer.y + footer.h * 0.76);
    g.globalAlpha = 1;
  }
  return c;
}

export function canvasToBlob(c: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type, quality));
}

/** Composite 4 shots into the 600×1800 export strip PNG. */
export async function composeStrip(shots: readonly Shot[], opts: StripOptions): Promise<Blob> {
  await loadStripFonts();
  return canvasToBlob(composeStripCanvas(shots, opts));
}
