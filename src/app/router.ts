/**
 * Tiny hash router (owner: scaffold). Hash routes so the static build works anywhere and the gift
 * payload never reaches a server log (the hash is not sent with requests).
 *
 *   #/            landing        #/create       creator
 *   #/g/<param>   recipient      #/booth        photobooth
 *   #/lab         lab gallery    #/lab/<id>     one lab entry (e.g. #/lab/P01)
 *
 * SEAM: production uses path routes (/g/:slug, /create/:draftId, /preview/:token) served by Vercel;
 * swap parseRoute's input from location.hash to location.pathname then.
 */
import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'landing' }
  | { name: 'create' }
  | { name: 'gift'; param: string }
  | { name: 'booth' }
  | { name: 'lab'; entry?: string }
  | { name: 'notFound'; path: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'landing' };
  const [head, rest] = [parts[0], parts.slice(1).join('/')];
  switch (head) {
    case 'create': return { name: 'create' };
    case 'booth': return { name: 'booth' };
    case 'g': return rest ? { name: 'gift', param: rest } : { name: 'notFound', path };
    case 'lab': return rest ? { name: 'lab', entry: decodeURIComponent(rest) } : { name: 'lab' };
    default: return { name: 'notFound', path };
  }
}

export function hrefFor(r: Route): string {
  switch (r.name) {
    case 'landing': return '#/';
    case 'create': return '#/create';
    case 'booth': return '#/booth';
    case 'gift': return `#/g/${r.param}`;
    case 'lab': return r.entry ? `#/lab/${encodeURIComponent(r.entry)}` : '#/lab';
    case 'notFound': return `#${r.path}`;
  }
}

export function navigate(to: Route | string, opts: { replace?: boolean } = {}): void {
  const href = typeof to === 'string' ? to : hrefFor(to);
  if (opts.replace) history.replaceState(null, '', href); else history.pushState(null, '', href);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

const subscribe = (cb: () => void) => { window.addEventListener('hashchange', cb); return () => window.removeEventListener('hashchange', cb); };
const getHash = () => location.hash;

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  return parseRoute(hash);
}
