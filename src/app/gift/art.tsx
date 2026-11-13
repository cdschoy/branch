/**
 * Original procedural placeholder art for the gift scenes (owner: gift). Everything is SVG drawn from
 * token colours (CSS variables only). It is a stand-in for the commissioned art of FRAMEWORK §3.7 and
 * copies nothing from the reference videos.
 */
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { mulberry32 } from '../../fx/rng';
import { FLOWER_COLORS, LEAF_COLORS, getShape } from '../../fx/shapes';
import { coverGrid, cssColor, pickFlower, sizeClass, WALL_MEAN } from '../../fx/emitters/_kit';

const v = (name: string) => `var(${name})`;
const OBJ = 'var(--t-object, var(--c-kraft-300))';
const OBJ_DARK = 'var(--t-object-stain, var(--c-kraft-500))';
const SEAL = 'var(--t-seal, var(--c-berry-600))';
const SEAL_CORE = 'var(--t-seal-core, var(--c-berry-700))';
const CARD = 'var(--c-paper-letter)';

/* ------------------------------------------------------------------ flowers */

/** One painted flower head: n soft petals around a centre, with a darker inner ring. */
export function FlowerHead({ r, petal, centre = 'var(--c-flower-sunflower-centre)', petals = 6, rot = 0, cx = 0, cy = 0 }: {
  r: number; petal: string; centre?: string; petals?: number; rot?: number; cx?: number; cy?: number;
}) {
  const ps = Array.from({ length: petals }, (_, i) => (360 / petals) * i + rot);
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {ps.map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.55} rx={r * 0.42} ry={r * 0.6} fill={petal} transform={`rotate(${a})`} opacity={0.96} />
      ))}
      {ps.map((a) => (
        <ellipse key={`h${a}`} cx={0} cy={-r * 0.5} rx={r * 0.14} ry={r * 0.36} fill="var(--c-cream-50)" opacity={0.18} transform={`rotate(${a + 8})`} />
      ))}
      <circle r={r * 0.3} fill={centre} />
      <circle r={r * 0.16} fill="var(--c-accent-gold)" opacity={0.7} />
    </g>
  );
}

function Leaf({ x, y, a, s, fill }: { x: number; y: number; a: number; s: number; fill: string }) {
  return <path d={`M0 0 C ${s * 0.4} ${-s * 0.5} ${s} ${-s * 0.4} ${s * 1.2} 0 C ${s} ${s * 0.4} ${s * 0.4} ${s * 0.5} 0 0Z`} fill={fill} transform={`translate(${x} ${y}) rotate(${a})`} />;
}

/**
 * A dense, seamless-ish tile of flower heads (the "pre-rendered wall tile" of C1). Deterministic by
 * seed so the preview and the phone match.
 */
export function FlowerTile({ seed, w = 390, h = 420, density = 1 }: { seed: number; w?: number; h?: number; density?: number }) {
  const items = useMemo(() => {
    const rng = mulberry32(seed);
    const out: { x: number; y: number; r: number; c: string; p: number; rot: number; leaf: boolean; la: number }[] = [];
    const cols = 5, rows = Math.round(6 * density);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = ((i + 0.5 + (j % 2) * 0.5) / cols) * w + (rng() - 0.5) * 30;
        const y = ((j + 0.5) / rows) * h + (rng() - 0.5) * 26;
        out.push({
          x, y, r: 34 + rng() * 22, c: FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)]!,
          p: 5 + Math.floor(rng() * 3), rot: rng() * 60, leaf: rng() > 0.35, la: rng() * 360,
        });
      }
    }
    return out;
  }, [seed, w, h, density]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width={w} height={h} fill={v('--c-flower-wall-mean')} />
      {items.map((f, i) => f.leaf ? <Leaf key={`l${i}`} x={f.x} y={f.y} a={f.la} s={f.r * 1.1} fill={v(LEAF_COLORS[i % LEAF_COLORS.length]!)} /> : null)}
      {items.map((f, i) => <FlowerHead key={i} cx={f.x} cy={f.y} r={f.r} petal={v(f.c)} petals={f.p} rot={f.rot} />)}
    </svg>
  );
}

/** A small tied bouquet (the C1 "bouquet seed"). */
export function Bouquet({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <path d="M48 70 60 116 72 70Z" fill="var(--c-accent-sage)" />
      <path d="M52 92h16l-2 6H54Z" fill="var(--c-blush-400)" />
      <Leaf x={40} y={64} a={200} s={20} fill="var(--c-accent-forest-soft)" />
      <Leaf x={80} y={62} a={-20} s={20} fill="var(--c-accent-sage)" />
      <FlowerHead cx={44} cy={50} r={20} petal="var(--c-flower-peony-coral)" />
      <FlowerHead cx={76} cy={48} r={19} petal="var(--c-flower-peach)" petals={7} />
      <FlowerHead cx={60} cy={30} r={22} petal="var(--c-flower-peony-hot)" rot={20} />
      <FlowerHead cx={60} cy={60} r={15} petal="var(--c-flower-daisy)" petals={8} />
    </svg>
  );
}

/** The C7 hero flower (~20 vw). */
export function HeroFlower({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="-60 -60 120 120" style={style} aria-hidden="true">
      <FlowerHead r={44} petal="var(--c-flower-rose-red)" petals={7} />
      <FlowerHead r={28} petal="var(--c-flower-peony-hot)" petals={6} rot={25} />
      <circle r={9} fill="var(--c-flower-crimson)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ envelope */

export function EnvelopeClosed() {
  return (
    <svg viewBox="0 0 240 170" width="100%" height="100%" aria-hidden="true">
      <rect x="4" y="10" width="232" height="156" rx="10" fill={OBJ} />
      <path d="M4 20 120 104 236 20" fill="none" stroke={OBJ_DARK} strokeWidth="3" strokeLinejoin="round" opacity=".55" />
      <path d="M4 160 96 92M236 160 144 92" stroke={OBJ_DARK} strokeWidth="2" opacity=".35" />
      <path d="M14 18h212" stroke="var(--c-cream-50)" strokeWidth="2" opacity=".35" />
      <g transform="translate(120 100)">
        <path d="M0-24c5 0 7 5 12 5s8 5 8 10 5 7 5 13-5 8-5 13-3 9-8 9-7 5-12 5-7-5-12-5-8-4-8-9-5-7-5-13 5-8 5-13 3-10 8-10 7-5 12-5Z" fill={SEAL} />
        <circle r="13" fill={SEAL_CORE} />
        <path d="M0 8-7 1a4.2 4.2 0 0 1 7-4.6A4.2 4.2 0 0 1 7 1Z" fill="var(--c-blush-200)" opacity=".85" />
      </g>
    </svg>
  );
}

export function EnvelopeOpen() {
  return (
    <svg viewBox="0 0 240 170" width="100%" height="100%" aria-hidden="true">
      <path d="M4 60 120 -30 236 60Z" fill={OBJ_DARK} opacity=".9" />
      <rect x="26" y="0" width="188" height="120" rx="6" fill={CARD} />
      <path d="M44 28h120M44 46h150M44 64h90" stroke="var(--c-blush-300)" strokeWidth="4" strokeLinecap="round" />
      <path d="M4 60 120 130 236 60V160a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6Z" fill={OBJ} />
      <path d="M4 160 104 100M236 160 136 100" stroke={OBJ_DARK} strokeWidth="2" opacity=".35" />
    </svg>
  );
}

/* ------------------------------------------------------------------ gift box (C2) */

/** Box body: gingham-ish weave in the theme object colours, the vertical ribbon band painted on. */
export function BoxBody() {
  return (
    <svg viewBox="0 0 220 150" width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="gift-gingham" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="var(--t-object, var(--c-blush-200))" />
          <rect width="10" height="20" fill="var(--t-object-inner, var(--c-blush-100))" opacity=".7" />
          <rect width="20" height="10" fill="var(--t-pattern-crossing, var(--c-blush-300))" opacity=".45" />
        </pattern>
      </defs>
      <rect x="6" y="4" width="208" height="142" rx="10" fill="url(#gift-gingham)" />
      <rect x="6" y="4" width="208" height="14" fill="var(--t-shadow-mauve, var(--c-ink-400))" opacity=".25" />
      <path d="M12 140h196" stroke="var(--c-cream-50)" strokeWidth="3" opacity=".4" strokeLinecap="round" />
    </svg>
  );
}

/** Inside of the open box (seen once the lid has flipped). */
export function BoxInside() {
  return (
    <svg viewBox="0 0 220 40" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="none">
      <path d="M6 40 22 4h176l16 36Z" fill="var(--t-shadow-mauve, var(--c-ink-400))" opacity=".55" />
      <path d="M22 4h176" stroke="var(--c-cream-50)" strokeWidth="2" opacity=".5" />
    </svg>
  );
}

export function BoxLid() {
  return (
    <svg viewBox="0 0 236 46" width="100%" height="100%" aria-hidden="true">
      <rect x="2" y="2" width="232" height="42" rx="9" fill="var(--t-object, var(--c-blush-200))" />
      <rect x="2" y="30" width="232" height="14" rx="6" fill="var(--t-shadow-mauve, var(--c-ink-400))" opacity=".3" />
      <path d="M14 10h208" stroke="var(--c-cream-50)" strokeWidth="3" opacity=".45" strokeLinecap="round" />
    </svg>
  );
}

/** The ribbon cross that whips off (vertical band over the lid + box, horizontal band on the lid). */
export function RibbonBands() {
  const fill = 'var(--t-accent, var(--c-accent-rose))';
  return (
    <svg viewBox="0 0 236 200" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <rect x="104" y="0" width="28" height="200" fill={fill} />
      <rect x="104" y="0" width="7" height="200" fill="var(--c-cream-50)" opacity=".25" />
      <rect x="0" y="14" width="236" height="20" fill={fill} />
      <rect x="0" y="14" width="236" height="5" fill="var(--c-cream-50)" opacity=".22" />
    </svg>
  );
}

/**
 * The 12-frame "painted" bow + tail sequence (C2.bowTug). Frame k of 0..11: the loops shrink 1 → .8,
 * the tail stretches to the right and its wave tightens. Each frame is a separate <g> (an atlas of
 * frames, scrubbed by drag progress); paint texture = offset highlight + shadow strokes, seeded.
 */
export function RibbonFrames({ frame, frames = 12 }: { frame: number; frames?: number }) {
  const all = useMemo(() => Array.from({ length: frames }, (_, k) => {
    const p = k / (frames - 1);
    const s = 1 - 0.2 * p;
    const tail = 40 + 120 * p;
    const wave = 10 * (1 - p) + 3;
    const rng = mulberry32(31 + k);
    const j = () => (rng() - 0.5) * 2.2;
    const loopL = `M0 0 C ${-30 * s} ${-26 * s + j()} ${-58 * s} ${-8 * s} ${-44 * s} ${12 * s + j()} C ${-32 * s} ${24 * s} ${-12 * s} ${10 * s} 0 0Z`;
    const loopR = `M0 0 C ${30 * s} ${-26 * s + j()} ${58 * s} ${-8 * s} ${44 * s} ${12 * s + j()} C ${32 * s} ${24 * s} ${12 * s} ${10 * s} 0 0Z`;
    const tailD = `M4 6 C ${tail * 0.3} ${6 + wave} ${tail * 0.6} ${6 - wave} ${tail} ${10 + j()} L ${tail - 4} ${22 + j()} C ${tail * 0.6} ${18 - wave} ${tail * 0.3} ${18 + wave} 2 12Z`;
    const tailL = `M-4 6 C -18 18 -26 30 ${-30 - 6 * p} ${44 - 4 * p} L ${-18 - 6 * p} ${46 - 4 * p} C -16 32 -10 20 -2 10Z`;
    return { loopL, loopR, tailD, tailL };
  }), [frames]);
  const fill = 'var(--t-accent, var(--c-accent-rose))';
  return (
    <svg viewBox="-80 -50 260 110" width="100%" height="100%" aria-hidden="true" data-frame={frame}>
      {all.map((f, k) => (
        <g key={k} style={{ display: k === frame ? undefined : 'none' }}>
          <path d={f.tailL} fill={fill} />
          <path d={f.tailD} fill={fill} />
          <path d={f.tailD} fill="none" stroke="var(--c-ink-700)" strokeOpacity=".18" strokeWidth="1.5" />
          <path d={f.loopL} fill={fill} />
          <path d={f.loopR} fill={fill} />
          <path d={f.loopL} fill="none" stroke="var(--c-cream-50)" strokeOpacity=".35" strokeWidth="2.5" transform="translate(2 -2) scale(.86)" />
          <path d={f.loopR} fill="none" stroke="var(--c-cream-50)" strokeOpacity=".35" strokeWidth="2.5" transform="translate(-2 -2) scale(.86)" />
        </g>
      ))}
    </svg>
  );
}

/** The bow knot (collapses .8 → 0 on release, C2.knotCollapse). */
export function BowKnot() {
  return (
    <svg viewBox="-12 -12 24 24" width="100%" height="100%" aria-hidden="true">
      <circle r="10" fill="var(--t-accent, var(--c-accent-rose))" />
      <circle r="10" fill="none" stroke="var(--c-ink-700)" strokeOpacity=".2" strokeWidth="2" />
      <path d="M-5 -3c3-2 7-2 10 0" stroke="var(--c-cream-50)" strokeOpacity=".5" strokeWidth="2" fill="none" />
    </svg>
  );
}

/** The crumpled ribbon pile beside the open box (C2.pileIn). */
export function RibbonPile() {
  const fill = 'var(--t-accent, var(--c-accent-rose))';
  return (
    <svg viewBox="0 0 90 40" width="100%" height="100%" aria-hidden="true">
      <path d="M4 34c10-14 22 6 30-8s20 10 28-4 18 6 24 2l-2 10H6Z" fill={fill} />
      <path d="M14 30c6-6 12 2 18-4M44 28c6-6 12 2 18-4" stroke="var(--c-cream-50)" strokeOpacity=".35" strokeWidth="2" fill="none" />
    </svg>
  );
}

/** Inner sticker revealed when the lid flips: a scalloped heart badge. */
export function HeartSticker() {
  return (
    <svg viewBox="0 0 60 56" width="100%" height="100%" aria-hidden="true">
      <path d="M30 54 4 28A15 15 0 0 1 30 10a15 15 0 0 1 26 18Z" fill="var(--c-cream-50)" />
      <path d="M30 48 9 27a11 11 0 0 1 21-12 11 11 0 0 1 21 12Z" fill="var(--t-accent, var(--c-accent-rose))" />
      <path d="M17 22a6 6 0 0 1 7-5" stroke="var(--c-cream-50)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".7" />
    </svg>
  );
}

/** One bunting pennant. */
export function Pennant({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 30 40" width="100%" height="100%" aria-hidden="true">
      <path d="M0 0h30L15 40Z" fill={fill} />
      <path d="M4 4h22" stroke="var(--c-cream-50)" strokeOpacity=".4" strokeWidth="2" />
    </svg>
  );
}

/**
 * Three original treats, each with three bite states (0, 1, 2 bites): a macaron, a cup of chè, a
 * slice of flan. Bites are scalloped cut-outs drawn in the background colour.
 */
export function Treat({ kind, bites }: { kind: 0 | 1 | 2; bites: number }) {
  const bite = (cx: number, cy: number) => (
    <g fill="var(--t-bg, var(--c-cream-100))">
      <circle cx={cx} cy={cy} r="9" /><circle cx={cx - 9} cy={cy + 6} r="7" /><circle cx={cx + 7} cy={cy + 9} r="7" />
    </g>
  );
  const gone = bites >= 2;
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" data-bites={bites}>
      <ellipse cx="32" cy="58" rx="22" ry="4" fill="var(--c-ink-700)" opacity=".12" />
      {gone ? (
        <g opacity=".85">
          <circle cx="24" cy="52" r="2" fill="var(--c-kraft-300)" /><circle cx="34" cy="54" r="1.6" fill="var(--c-kraft-300)" /><circle cx="40" cy="51" r="2.2" fill="var(--c-kraft-300)" />
        </g>
      ) : kind === 0 ? (
        <g>
          <ellipse cx="32" cy="42" rx="22" ry="10" fill="var(--c-blush-400)" />
          <rect x="11" y="31" width="42" height="7" rx="3.5" fill="var(--c-cream-50)" />
          <ellipse cx="32" cy="28" rx="22" ry="10" fill="var(--c-blush-400)" />
          <ellipse cx="26" cy="24" rx="7" ry="2.5" fill="var(--c-cream-50)" opacity=".45" />
          {bites >= 1 ? bite(52, 26) : null}
        </g>
      ) : kind === 1 ? (
        <g>
          <path d="M12 26h40l-5 28H17Z" fill="var(--c-cream-50)" opacity=".9" />
          <path d="M14 34h36l-3 19H17Z" fill="var(--c-accent-sage)" />
          <path d="M13 28h38l-1 6H14Z" fill="var(--c-butter-200)" />
          <circle cx="24" cy="22" r="5" fill="var(--c-flower-rose-red)" /><circle cx="36" cy="20" r="4" fill="var(--c-accent-honey)" />
          {bites >= 1 ? bite(46, 22) : null}
        </g>
      ) : (
        <g>
          <path d="M14 50 20 26h24l6 24Z" fill="var(--c-accent-honey)" />
          <path d="M20 26h24l1.5 6h-27Z" fill="var(--c-flower-sunflower-centre)" />
          <path d="M18 38h28" stroke="var(--c-cream-50)" strokeOpacity=".35" strokeWidth="2" />
          {bites >= 1 ? bite(46, 30) : null}
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ decor */

/** A string of hanging pennants (the C1/C7 "hanging decor" for the pendulum impulse). */
export function HangingBunting({ width = 300 }: { width?: number }) {
  const colors = ['--c-blush-400', '--c-accent-gold', '--c-accent-sage', '--c-flower-peony-coral', '--c-lilac-400', '--c-accent-honey'];
  const n = 7;
  return (
    <svg viewBox={`0 0 ${width} 60`} width="100%" height="100%" aria-hidden="true">
      <path d={`M0 6 Q ${width / 2} 26 ${width} 6`} stroke="var(--c-ink-600)" strokeWidth="1.5" fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const x = ((i + 0.5) / n) * width;
        const t = (i + 0.5) / n;
        const y = 6 + 40 * t * (1 - t);
        return <path key={i} d={`M${x - 13} ${y} h26 l-13 26Z`} fill={v(colors[i % colors.length]!)} />;
      })}
    </svg>
  );
}

/** Washi tape strip (heart burst origin on the letter, C2.tapeHearts). */
export function Washi({ style }: { style?: CSSProperties }) {
  return <span className="gift-washi" style={style} aria-hidden="true" />;
}

/**
 * The C1 "pre-rendered wall tile": painted once into a canvas with the SAME procedural flower shapes
 * and palette the fx emitters use (fx/shapes + the curtain cover grid), so the hand-over from the
 * bloom emitter to the drifting DOM wall does not change the look. Deterministic by seed; the tile
 * wraps vertically (flowers crossing the bottom edge are repeated at the top) for a seamless drift.
 */
export function PaintedWall({ seed, count = 46 }: { seed: number; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const g = c.getContext('2d');
    if (!g) return;
    g.scale(dpr, dpr);
    g.fillStyle = cssColor(WALL_MEAN);
    g.fillRect(0, 0, w, h);
    const rng = mulberry32(seed ^ 0x3a11);
    const { cells, pitch } = coverGrid(count, 0, 0, w, h, rng);
    const heads = cells.map((cell) => {
      const f = pickFlower(rng(), rng());
      const sz = sizeClass(pitch, rng());
      return { ...cell, ...f, r: (sz.size * sz.scale) / 2, rot: rng() * Math.PI * 2 };
    });
    // leaves first, then heads; each drawn at y and y ± h so the strip tiles vertically
    const pass = (leaf: boolean) => heads.forEach((f) => {
      if ((f.shape === 'leaf') !== leaf) return;
      for (const dy of [-h, 0, h]) {
        if (f.y + dy + f.r < 0 || f.y + dy - f.r > h) continue;
        g.save(); g.translate(f.x, f.y + dy); g.rotate(f.rot); g.scale(f.r, f.r);
        getShape(f.shape)(g, cssColor(f.color));
        g.restore();
      }
    });
    pass(true); pass(false);
  }, [seed, count]);
  return <canvas ref={ref} className="gift-paintedwall" aria-hidden="true" />;
}
