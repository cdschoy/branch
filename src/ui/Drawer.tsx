/**
 * Drawer (FRAMEWORK §3.6, C5; owner: gift): NON-modal bottom sheet on mobile (detents peek 88 px /
 * half 52dvh / full 92dvh), right rail on desktop; plum radial panel, 6 px bezel, no dim; P05 motion.
 * STUB: static panel when open.
 */
import './Drawer.css';
import type { ReactNode } from 'react';

export type DrawerDetent = 'peek' | 'half' | 'full';
export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Heading (gift.more.drawerTitle). */
  title: string;
  /** Close button aria-label (a11y.closeDrawer). */
  closeLabel: string;
  detent?: DrawerDetent;
  children: ReactNode;
}
export function Drawer({ open, onOpenChange, title, closeLabel, detent = 'half', children }: DrawerProps) {
  if (!open) return null;
  return (
    <aside className={`ui-drawer ui-drawer--${detent}`} aria-label={title} data-stub="Drawer">
      <header className="ui-drawer__head">
        <h2 className="ui-drawer__title">{title}</h2>
        <button type="button" className="ui-drawer__close" aria-label={closeLabel} onClick={() => onOpenChange(false)}>×</button>
      </header>
      <div className="ui-drawer__body">{children}</div>
    </aside>
  );
}
