/**
 * Asset preload (G6; owner: scaffold). React-free.
 *
 * Spec assets are symbolic ids ('img:envelope.open', 'atlas:bloom', 'page:letter', 'wallTiles:c1').
 * Scenes register a resolver per prefix; `preloadAssets` decodes everything before t0. Unknown
 * prefixes resolve immediately (procedural placeholder art needs no decode).
 */
type Resolver = (name: string) => Promise<unknown> | unknown;
const resolvers = new Map<string, Resolver>();

/** e.g. registerAssetResolver('img', (name) => decodeImage(themeManifest[name])) */
export function registerAssetResolver(prefix: string, fn: Resolver): () => void {
  resolvers.set(prefix, fn);
  return () => { if (resolvers.get(prefix) === fn) resolvers.delete(prefix); };
}

export async function preloadAssets(assets: readonly string[]): Promise<void> {
  await Promise.all(assets.map(async (id) => {
    const i = id.indexOf(':');
    const fn = resolvers.get(i < 0 ? id : id.slice(0, i));
    try { await fn?.(i < 0 ? '' : id.slice(i + 1)); } catch (err) { console.warn('[preload]', id, err); }
  }));
}

/** Load + decode one image (never reveal an undecoded image, rule 8). */
export async function decodeImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  try { await img.decode(); } catch { /* broken image still resolves; caller shows fallback */ }
  return img;
}
