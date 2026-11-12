/**
 * Canvas2D fx engine (FRAMEWORK §4.6, §7.3; owner: scaffold, internals may be tuned by fx). React-free.
 *
 * One full-viewport canvas (DPR from budgets.canvasDpr[tier]); sprites are drawn with `drawImage` +
 * `setTransform` from cached procedural bitmaps; no per-frame allocation. Draws on the shared ticker at
 * priority 100 (after the Director at 0) and sleeps when nothing is active.
 */
import { ticker as sharedTicker, type Ticker } from '../motion/core/ticker';
import { budgets, type Tier } from '../motion/core/tokens';
import { getTier } from '../motion/core/tier';
import { isReducedMotion } from '../motion/core/reduced';
import { hashSeed, mulberry32 } from './rng';
import { getEmitter } from './registry';
import { getShape } from './shapes';
import type { EmitOptions, EmitterId, EmitterInstance, FxEngine, FxHandle, Sprite, Viewport } from './types';

interface Active {
  id: EmitterId; inst: EmitterInstance; time: number; speed: number; paused: boolean; autoplay: boolean;
  done: () => void; stopped: boolean;
}

const BUCKET = 8; // px size buckets for the bitmap cache

export function createFxEngine(deps: { ticker?: Ticker } = {}): FxEngine {
  const tk = deps.ticker ?? sharedTicker;
  let canvas: HTMLCanvasElement | null = null;
  let g: CanvasRenderingContext2D | null = null;
  let themeEl: Element | null = null;
  let view: Viewport = { w: 0, h: 0, dpr: 1 };
  const active = new Set<Active>();
  const colorCache = new Map<string, string>();
  const bitmapCache = new Map<string, HTMLCanvasElement>();
  const scratch: Sprite = { x: 0, y: 0, rot: 0, scale: 1, alpha: 1, size: 16, shape: 'dot', color: '--c-blush-400' };
  let unsub: (() => void) | null = null;

  const resolveColor = (c: string): string => {
    if (!c.startsWith('--')) return c;
    let v = colorCache.get(c);
    if (v === undefined) {
      v = getComputedStyle(themeEl ?? document.documentElement).getPropertyValue(c).trim() || 'transparent';
      colorCache.set(c, v);
    }
    return v;
  };

  const bitmap = (shape: string, color: string, size: number): HTMLCanvasElement => {
    const px = Math.max(BUCKET, Math.ceil((size * view.dpr) / BUCKET) * BUCKET);
    const key = `${shape}|${color}|${px}`;
    let bm = bitmapCache.get(key);
    if (!bm) {
      bm = document.createElement('canvas');
      bm.width = bm.height = px + 2;
      const b = bm.getContext('2d')!;
      b.translate(bm.width / 2, bm.height / 2);
      b.scale(px / 2, px / 2);
      getShape(shape)(b, resolveColor(color));
      bitmapCache.set(key, bm);
    }
    return bm;
  };

  const resize = () => {
    if (!canvas) return;
    const tier: Tier = getTier();
    const dpr = Math.min(window.devicePixelRatio || 1, budgets.canvasDpr[tier]);
    const w = window.innerWidth, h = window.innerHeight;
    view = { w, h, dpr };
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    bitmapCache.clear();
  };

  const draw = (_now: number, dt: number) => {
    if (!g || !canvas) {
      // no canvas attached: still advance autoplay handles so their promises resolve
      for (const a of active) { if (a.autoplay && !a.paused) { a.time += dt * a.speed; if (a.time >= a.inst.durationMs) finish(a); } }
      if (!active.size) { unsub?.(); unsub = null; }
      return;
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    for (const a of active) {
      if (a.autoplay && !a.paused) a.time += dt * a.speed;
      const { inst } = a;
      const t = a.time;
      g.save();
      g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      inst.before?.(g, t, view);
      for (let i = 0; i < inst.count; i++) {
        if (!inst.sprite(i, t, scratch) || scratch.alpha <= 0) continue;
        const bm = bitmap(scratch.shape, scratch.color, scratch.size);
        const s = (scratch.size * scratch.scale) / (bm.width / view.dpr);
        const cos = Math.cos(scratch.rot) * s * view.dpr, sin = Math.sin(scratch.rot) * s * view.dpr;
        g.globalAlpha = Math.min(1, scratch.alpha);
        g.setTransform(cos, sin, -sin, cos, scratch.x * view.dpr, scratch.y * view.dpr);
        g.drawImage(bm, -bm.width / 2, -bm.height / 2);
      }
      g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      g.globalAlpha = 1;
      inst.after?.(g, t, view);
      g.restore();
      if (a.autoplay && t >= inst.durationMs) finish(a);
    }
    if (!active.size) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, canvas.width, canvas.height);
      unsub?.(); unsub = null;
    }
  };

  const wake = () => { if (!unsub) unsub = tk.add(draw, 100); };
  const finish = (a: Active) => { if (a.stopped) return; a.stopped = true; active.delete(a); a.done(); wake(); };

  const originOf = (o: EmitOptions['origin']): { x: number; y: number } => {
    if (!o) return { x: view.w / 2, y: view.h / 2 };
    const p = typeof Element !== 'undefined' && o instanceof Element ? o.getBoundingClientRect() : (o as DOMRect | { x: number; y: number });
    if ('width' in p && 'height' in p) { const r = p as DOMRect; return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
    return { x: p.x, y: p.y };
  };

  const engine: FxEngine = {
    attach(c) {
      canvas = c; g = c.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      return () => { window.removeEventListener('resize', resize); if (canvas === c) { canvas = null; g = null; } };
    },
    emit(id, opts = {}) {
      const def = getEmitter(id);
      const tier = opts.tier ?? getTier();
      const reduced = opts.reduced ?? isReducedMotion();
      const seed = typeof opts.seed === 'number' ? opts.seed >>> 0 : hashSeed(opts.seed ?? id);
      const params = opts.params ?? {};
      let done!: () => void;
      const finished = new Promise<void>((r) => { done = r; });
      if (!def) {
        console.warn(`[fx] unknown emitter "${id}"`);
        done();
        return { id, durationMs: 0, time: 0, finished, seek() {}, pause() {}, resume() {}, setSpeed() {}, stop() {} };
      }
      if (!view.w) { view = { w: window.innerWidth, h: window.innerHeight, dpr: 1 }; }
      const inst = def.create({
        seed, rng: mulberry32(seed), params, view, origin: originOf(opts.origin), tier, reduced,
        count: opts.count ?? def.count(tier, params), durMs: opts.durMs,
      });
      const a: Active = { id, inst, time: 0, speed: opts.speed ?? 1, paused: false, autoplay: opts.autoplay ?? true, done, stopped: false };
      active.add(a); wake();
      return {
        id, durationMs: inst.durationMs, finished,
        get time() { return a.time; },
        seek(ms) { a.time = Math.max(0, ms); wake(); },
        pause() { a.paused = true; },
        resume() { a.paused = false; wake(); },
        setSpeed(x) { a.speed = x; },
        stop() { finish(a); },
      };
    },
    clear() { for (const a of [...active]) finish(a); },
    setThemeElement(el) { themeEl = el; colorCache.clear(); bitmapCache.clear(); },
    get view() { return view; },
    get activeCount() { return active.size; },
  };
  return engine;
}

/** The app-wide fx engine; <FxCanvas /> attaches the canvas. */
export const fx: FxEngine = createFxEngine();
