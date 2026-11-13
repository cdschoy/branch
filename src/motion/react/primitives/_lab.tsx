/**
 * Lab-only helpers for the primitive *.lab.tsx entries (owner: primitives). Not collected by the lab
 * registry (no `.lab.tsx` suffix). All art is original, procedural SVG/CSS in token colours.
 */
import './_lab.css';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from './_shared';

/** A small painted flower sticker (five petals + centre). */
export function FlowerArt({ size = 44, petal = 'var(--c-flower-peony-coral)', centre = 'var(--c-flower-sunflower-centre)' }: { size?: number; petal?: string; centre?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="20" cy="10.5" rx="6.5" ry="9" fill={petal} transform={`rotate(${a} 20 20)`} />)}
      <circle cx="20" cy="20" r="5.5" fill={centre} />
    </svg>
  );
}

/** A heart sticker (used for pops / wobble targets). */
export function HeartArt({ size = 44, fill = 'var(--c-accent-rose)' }: { size?: number; fill?: string }) {
  return (
    <svg viewBox="0 0 20 18" width={size} height={(size * 18) / 20} aria-hidden="true">
      <path d="M10 17 1.8 9A4.6 4.6 0 0 1 10 3a4.6 4.6 0 0 1 8.2 6Z" fill={fill} />
    </svg>
  );
}

/** A placeholder "photo": a soft painted landscape (sky, hills, sun) from token colours, seeded by n. */
export function PhotoArt({ n = 0, w = 120, h = 90 }: { n?: number; w?: number; h?: number }) {
  const skies = ['var(--c-blush-100)', 'var(--c-cream-200)', 'var(--c-lilac-400)', 'var(--c-butter-200)'];
  const hills = ['var(--c-accent-sage)', 'var(--c-accent-forest-soft)', 'var(--c-blush-400)', 'var(--c-accent-teal)'];
  const sky = skies[n % skies.length] ?? skies[0];
  const hill = hills[(n + 1) % hills.length] ?? hills[0];
  return (
    <svg viewBox="0 0 120 90" width={w} height={h} aria-hidden="true" style={{ display: 'block' }}>
      <rect width="120" height="90" fill={sky} />
      <circle cx={30 + (n * 23) % 60} cy="28" r="10" fill="var(--c-accent-honey)" />
      <path d={`M0 70 Q30 ${48 + (n % 3) * 6} 60 66 T120 60 V90 H0Z`} fill={hill} />
      <path d="M0 80 Q40 68 80 78 T120 76 V90 H0Z" fill="var(--c-accent-forest)" opacity=".55" />
    </svg>
  );
}

/** A polaroid frame around PhotoArt. */
export function PolaroidArt({ n = 0, width = 96, caption }: { n?: number; width?: number; caption?: string }) {
  return (
    <div className="plab-polaroid" style={{ width }}>
      <PhotoArt n={n} w={width - 12} h={((width - 12) * 3) / 4} />
      {caption ? <span className="plab-polaroid__cap">{caption}</span> : <span className="plab-polaroid__cap" aria-hidden="true">&nbsp;</span>}
    </div>
  );
}

/** A cream card (letter / page placeholder). */
export function CardArt({ children, className, style }: { children?: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={cx('plab-card', className)} style={style}>{children}</div>;
}

/** Small lab control button (≥44 px hit area). */
export function LabBtn({ onClick, children, testId, pressed }: { onClick: () => void; children: ReactNode; testId?: string; pressed?: boolean }) {
  return <button type="button" className="plab-btn" onClick={onClick} data-testid={testId} aria-pressed={pressed}>{children}</button>;
}

/** A column stage with controls at the bottom. */
export function Stage({ children, controls, className }: { children: ReactNode; controls?: ReactNode; className?: string }) {
  return (
    <div className={cx('plab-stage', className)}>
      <div className="plab-stage__art">{children}</div>
      {controls ? <div className="plab-stage__controls">{controls}</div> : null}
    </div>
  );
}

/** A status readout for e2e (data-testid) and humans. */
export function Readout({ testId, children }: { testId: string; children: ReactNode }) {
  return <output className="plab-readout" data-testid={testId}>{children}</output>;
}
