/**
 * Motion tokens (owner: scaffold). Re-exports the GENERATED design-tokens/motion.ts — never edit that
 * file by hand; edit design-tokens/motion-tokens.json and run `npm run tokens`.
 *
 * Components and primitives read every duration, easing and spring from here. A raw ms, bezier or hex
 * literal in a component is a lint failure (FRAMEWORK §3.1, §7.2).
 */
export * from '@tokens/motion';
/** Design-token slices (design-tokens.json, generated). Read them from here, never import the JSON directly. */
export { proportion, themes } from '@tokens/design-tokens.json';
import { duration, easing, spring, type DurationName, type EasingName, type SpringName } from '@tokens/motion';

/** Mutable cubic-bezier array for Motion (`ease: bez('outQuad')`). */
export const bez = (name: EasingName): [number, number, number, number] => {
  const [a, b, c, d] = easing[name];
  return [a, b, c, d];
};

/** Duration token or ms → seconds (Motion takes seconds). */
export const sec = (d: DurationName | number): number => (typeof d === 'number' ? d : duration[d]) / 1000;

/** Motion spring transition for a preset; `settleMs` is what the Director uses as the step length. */
export const springT = (name: SpringName) => ({
  type: 'spring' as const,
  stiffness: spring[name].stiffness,
  damping: spring[name].damping,
  mass: spring[name].mass,
});

/** CSS variable names emitted by tokens.css, for inline styles: `style={{ transitionDuration: cssVar.d('fast') }}`. */
const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
export const cssVar = {
  d: (name: DurationName) => `var(--d-${kebab(name)})`,
  e: (name: EasingName) => `var(--e-${kebab(name)})`,
  spring: (name: SpringName) => `var(--spring-${kebab(name)})`,
  springDur: (name: SpringName) => `var(--spring-${kebab(name)}-dur)`,
  /** Core colour or theme slot, e.g. cssVar.c('t-accent') → var(--t-accent). */
  c: (name: string) => `var(--${name})`,
};
