import { describe, expect, it } from 'vitest';
import { reduceSpec, choreography, hashSeed } from './index';
import { mulberry32, rand01 } from '../../fx/rng';
import { transition, initialSnapshot, recipientMachine } from '../../machines';

describe('motion core', () => {
  it('reduces crossfade300 into 300 ms without canvas steps', () => {
    const r = reduceSpec(choreography.C1a);
    expect(Math.max(...r.steps.map((s) => s.at + s.dur))).toBeLessThanOrEqual(300);
    expect(r.steps.some((s) => s.action === 'bloomBurst')).toBe(false);
  });
  it('seeds are deterministic', () => {
    expect(hashSeed('gift-1')).toBe(hashSeed('gift-1'));
    const a = mulberry32(7), b = mulberry32(7);
    expect([a(), a()]).toEqual([b(), b()]);
    expect(rand01(1, 2, 3)).toBe(rand01(1, 2, 3));
  });
  it('machine transitions with guards', () => {
    let s = initialSnapshot(recipientMachine);
    s = transition(recipientMachine, s, { type: 'TAP' });
    expect(s.value).toBe('loading');
  });
});
