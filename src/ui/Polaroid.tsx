/**
 * Polaroid (FRAMEWORK §3.6, P04, C6; owner: gift): aspect .835, square window, borders 5/5/5/21%,
 * seeded tilt from proportion.polaroid.tiltDeg (never 0° outside the lightbox), caption in ink 700.
 */
import './Polaroid.css';
import tokens from '@tokens/design-tokens.json';
import { rand01, pick } from '../fx/rng';

export const POLAROID_TILTS: readonly number[] = tokens.proportion.polaroid.tiltDeg;
/** Deterministic tilt for photo `index` of a gift seeded by `seed`. */
export const polaroidTilt = (seed: number, index: number): number => pick(rand01(seed, index, 7), POLAROID_TILTS);

export interface PolaroidProps {
  src: string;
  caption?: string;
  /** Degrees; default: polaroidTilt(seed, index). */
  tiltDeg?: number;
  seed?: number;
  index?: number;
  /** Width in px (default 140). */
  width?: number;
  /** Shared-element id for C6 (motion layoutId). */
  layoutId?: string;
  onOpen?: () => void;
  alt?: string;
  className?: string;
}
export function Polaroid({ src, caption, tiltDeg, seed = 0, index = 0, width = 140, onOpen, alt = '', className }: PolaroidProps) {
  const tilt = tiltDeg ?? polaroidTilt(seed, index);
  const Tag = onOpen ? 'button' : 'figure';
  return (
    <Tag className={`ui-polaroid${className ? ' ' + className : ''}`} style={{ width, rotate: `${tilt}deg` }} onClick={onOpen} type={onOpen ? 'button' : undefined}>
      <span className="ui-polaroid__window"><img src={src} alt={alt} draggable={false} /></span>
      {caption ? <span className="ui-polaroid__caption">{caption}</span> : null}
    </Tag>
  );
}
