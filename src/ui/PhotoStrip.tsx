/**
 * PhotoStrip (FRAMEWORK §3.6, C3/C12; owner: booth): on-screen strip uses the export 1:3 ratio
 * (proportion.photoStrip: 4 frames 4:3, insets 36/57, gaps 18, footer 254 of 600×1800); fanned
 * −3.6° / +1.3° / +4°; date in Be Vietnam Pro 600 tabular, caption in Mali. STUB renders the layout.
 */
import './PhotoStrip.css';
import { proportion } from '../motion/core/tokens';

export const STRIP_FAN: readonly number[] = proportion.photoStrip.fanDeg;

export interface PhotoStripProps {
  /** Up to 4 image URLs (empty cells render the paper colour). */
  photos: readonly string[];
  date?: string;
  caption?: string;
  /** Index into STRIP_FAN for the resting tilt; undefined = 0°. */
  fan?: 0 | 1 | 2;
  /** Rendered width in px (height = 3×). Default 120. */
  width?: number;
  onOpen?: () => void;
  className?: string;
}
export function PhotoStrip({ photos, date, caption, fan, width = 120, onOpen, className }: PhotoStripProps) {
  const s = proportion.photoStrip;
  const k = width / s.exportPx[0]!;
  const Tag = onOpen ? 'button' : 'div';
  return (
    <Tag className={`ui-strip${className ? ' ' + className : ''}`} onClick={onOpen} type={onOpen ? 'button' : undefined}
      style={{ width, height: width * 3, rotate: fan === undefined ? undefined : `${STRIP_FAN[fan]}deg`, paddingTop: s.insetTopPx * k, paddingInline: s.insetSidePx * k, gap: s.gapPx * k }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="ui-strip__cell" style={{ height: s.framePx[1]! * k }}>{photos[i] ? <img src={photos[i]} alt="" /> : null}</span>
      ))}
      <span className="ui-strip__footer" style={{ height: s.footerPx * k }}>
        {caption ? <span className="ui-strip__caption">{caption}</span> : null}
        {date ? <span className="ui-strip__date">{date}</span> : null}
      </span>
    </Tag>
  );
}
