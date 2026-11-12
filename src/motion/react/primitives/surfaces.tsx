/**
 * P05 drawerSlide · P32 pageCrossfade · P33 paperDipCrossfade · P34 lidFlip3D · P36 sharedLightbox ·
 * P45 contentSwapInShell (owner: primitives). TODO(primitives): implement; zero overshoot on all of these.
 */
import type { ReactNode } from 'react';
import type { BaseProps, OneShotProps } from './types';
import { StubBox, useStubDone } from './_stub';

export interface DrawerSlideProps extends BaseProps {
  open: boolean;
  /** 'sheet' (mobile bottom sheet, y), 'rail' (desktop right rail, x), 'dock' (booth dock, 610 ms dock ease). */
  variant: 'sheet' | 'rail' | 'dock';
  onClosed?: () => void;
  onOpened?: () => void;
}
/** P05: ONE tween, 560 ms drawer ease (dock 610 ms), opacity 360 ms; close 240 ms `in`. No scrim. */
export function DrawerSlide(p: DrawerSlideProps) {
  return p.open ? <StubBox name="DrawerSlide" className={p.className} style={p.style}>{p.children}</StubBox> : null;
}

export interface PageCrossfadeProps extends BaseProps {
  /** Changing the key crossfades old → new (opacity only, 240 ms outCubic, no dip). */
  pageKey: string;
}
export function PageCrossfade(p: PageCrossfadeProps) { return <StubBox name="PageCrossfade" key={p.pageKey} {...p} />; }

export interface PaperDipCrossfadeProps<S extends string = string> extends BaseProps {
  /** Current art state; on change both layers run 333 ms (out outQuad, in paperIn). */
  state: S;
  render: (state: S) => ReactNode;
  onDone?: () => void;
}
export function PaperDipCrossfade<S extends string>(p: PaperDipCrossfadeProps<S>) {
  useStubDone(p.onDone, true, p.state);
  return <StubBox name="PaperDipCrossfade" className={p.className} style={p.style}>{p.render(p.state)}</StubBox>;
}

export interface LidFlip3DProps extends BaseProps {
  open: boolean;
  lid: ReactNode;
  box: ReactNode;
  onDone?: () => void;
}
/** P34: lid rotateX 0 → 180° (perspective 700 px, bottom hinge) + box y +18 vh on ONE inOutCubic 280 ms. */
export function LidFlip3D(p: LidFlip3DProps) {
  useStubDone(p.onDone, p.open);
  return <StubBox name="LidFlip3D" className={p.className} style={p.style}>{p.open ? null : p.lid}{p.box}</StubBox>;
}

export interface SharedLightboxProps extends BaseProps {
  open: boolean;
  /** Shared-element id linking the thumb and the hero (motion layoutId). */
  layoutId: string;
  onClose: () => void;
}
/** P36: thumb → hero on spring.lightbox; rotate snaps −4 → −1°; scrim linear 267 ms; close on spring.modal. */
export function SharedLightbox(p: SharedLightboxProps) {
  return p.open ? <StubBox name="SharedLightbox" className={p.className} style={p.style}>{p.children}</StubBox> : null;
}

export interface ContentSwapInShellProps extends OneShotProps {
  /** Changing the key swaps the inner content (out 200 ms standard; new object at +267 ms). */
  contentKey: string;
}
export function ContentSwapInShell(p: ContentSwapInShellProps) {
  useStubDone(p.onDone, true, p.contentKey);
  return <StubBox name="ContentSwapInShell" key={p.contentKey} className={p.className} style={p.style}>{p.children}</StubBox>;
}
