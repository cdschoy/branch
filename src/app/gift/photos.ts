/**
 * Client-side photo pipeline for the local starter (FRAMEWORK §5.2 uploads, trimmed; owner: gift).
 * createImageBitmap with EXIF orientation → canvas at a 640 px long edge → WebP (JPEG fallback). The
 * re-encode drops EXIF / GPS by construction. Output is a data: URL stored inside the gift link.
 * SEAM: production uploads the 2048 px WebP resumably and stores a media uuid instead (api/README.md).
 */
import { MEDIA } from './params';

export async function downscalePhoto(file: Blob, longEdge: number = MEDIA.longEdgePx, quality: number = MEDIA.quality): Promise<string> {
  let bmp: ImageBitmap | HTMLImageElement;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      bmp = img;
    } finally { URL.revokeObjectURL(url); }
  }
  const w0 = bmp.width, h0 = bmp.height;
  if (!w0 || !h0) throw new Error('empty image');
  const k = Math.min(1, longEdge / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('no 2d context');
  g.drawImage(bmp, 0, 0, w, h);
  if ('close' in bmp) bmp.close();
  let out = canvas.toDataURL('image/webp', quality);
  if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', quality);
  return out;
}

/** Characters the photos add to the link (data URLs are base64; the deflate pass barely shrinks them). */
export const photoChars = (refs: readonly string[]): number => refs.reduce((n, r) => n + (r.startsWith('data:') ? r.length : 0), 0);
