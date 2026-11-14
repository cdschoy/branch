/**
 * React side of the locale store (src/i18n is React-free). `useLocale()` subscribes with
 * useSyncExternalStore, so a component that calls it re-renders on every switch. App calls it once at
 * the root: every screen then re-renders its text in place (nothing remounts, so Director runs, the
 * camera stream and creator drafts survive a switch).
 */
import { useSyncExternalStore } from 'react';
import { getLocale, setLocale, subscribeLocale, type Locale } from '../i18n';

export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getLocale, getLocale);
}

/** Switch and remember the viewer's choice. */
export const chooseLocale = (l: Locale): void => setLocale(l, { persist: true });
