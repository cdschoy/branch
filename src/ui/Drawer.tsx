/**
 * Drawer (FRAMEWORK §3.6, C5; owner: gift): NON-modal bottom sheet on mobile (detents peek 88 px /
 * half 52dvh / full 92dvh), right rail on desktop; plum radial panel, 6 px bezel, no dim; P05 motion
 * (one 560 ms drawer tween + 360 ms opacity in, 240 ms `in` out) via DrawerSlide. No focus trap; Esc
 * closes; focus returns to whatever opened it (the drawer pull).
 */
import './Drawer.css';
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { DrawerSlide } from '../motion/react';

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

const RAIL_QUERY = '(min-width: 720px)';
const subscribe = (cb: () => void) => {
  if (typeof matchMedia !== 'function') return () => {};
  const m = matchMedia(RAIL_QUERY);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
const isRail = () => typeof matchMedia === 'function' && matchMedia(RAIL_QUERY).matches;

export function Drawer({ open, onOpenChange, title, closeLabel, detent = 'half', children }: DrawerProps) {
  const rail = useSyncExternalStore(subscribe, isRail, () => false);
  const panel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const change = useRef(onOpenChange);
  change.current = onOpenChange;
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') change.current(false); };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); opener.current?.focus?.({ preventScroll: true }); };
  }, [open]);
  return (
    <DrawerSlide open={open} variant={rail ? 'rail' : 'sheet'} className={`ui-drawer ui-drawer--${detent}`}>
      <aside ref={panel} className="ui-drawer__panel" aria-label={title} data-testid="gift-drawer">
        <header className="ui-drawer__head">
          <h2 className="ui-drawer__title">{title}</h2>
          <button type="button" className="ui-drawer__close" aria-label={closeLabel} onClick={() => onOpenChange(false)}>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 4 16 16M16 4 4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>
        <div className="ui-drawer__body">{children}</div>
      </aside>
    </DrawerSlide>
  );
}
