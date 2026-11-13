import { describe, expect, it } from 'vitest';
import { initialSnapshot, transition, recipientMachine, creatorMachine, type RecipientEvent, type CreatorEvent, type CreatorState, type CreatorContext, type Snapshot } from './index';
import { sampleGift, type GiftContentV1 } from '../gift-schema';

const run = (evs: RecipientEvent[], gift: GiftContentV1 = sampleGift) =>
  evs.reduce((s, e) => transition(recipientMachine, s, e), transition(recipientMachine, initialSnapshot(recipientMachine), { type: 'LOADED', gift }));

describe('recipient machine (§5.3)', () => {
  it('envelope: two taps, then reading; finale gated on readEnough', () => {
    let s = run([{ type: 'TAP' }, { type: 'TAP' }]);
    expect(s.value).toBe('opening'); // tap during the spectacle is ignored (G15)
    s = run([{ type: 'TAP' }, { type: 'CHOREO_DONE' }, { type: 'TAP' }, { type: 'CHOREO_DONE' }]);
    expect(s.value).toBe('reading');
    expect(transition(recipientMachine, s, { type: 'CONTINUE' }).value).toBe('reading');
    expect(transition(recipientMachine, s, { type: 'READ_ENOUGH' }).context.readEnough).toBe(false); // needs TYPED first
    s = transition(recipientMachine, s, { type: 'TYPED' });
    s = transition(recipientMachine, s, { type: 'READ_ENOUGH' });
    s = transition(recipientMachine, s, { type: 'CONTINUE' });
    expect(s.value).toBe('finale');
    s = transition(recipientMachine, s, { type: 'SWAP' });
    expect(s.value).toBe('end');
    s = transition(recipientMachine, s, { type: 'REPLAY' });
    expect(s.value).toBe('landing');
    expect(s.context.plays).toBe(1);
  });
  it('a forced continue (second early tap) is honoured', () => {
    const s = run([{ type: 'TAP' }, { type: 'CHOREO_DONE' }, { type: 'TAP' }, { type: 'CHOREO_DONE' }, { type: 'CONTINUE', force: true }]);
    expect(s.value).toBe('finale');
  });
  it('box: 3 treats × 2 bites, the 6th bite starts the spread', () => {
    const box = { ...sampleGift, mechanic: 'box' as const };
    let s = run([{ type: 'TAP' }, { type: 'CHOREO_DONE' }], box);
    expect(s.value).toBe('treats');
    for (const t of [0, 0, 0, 1, 1, 2]) s = transition(recipientMachine, s, { type: 'BITE', treat: t });
    expect(s.value).toBe('treats'); // the third bite on treat 0 was ignored
    s = transition(recipientMachine, s, { type: 'BITE', treat: 2 });
    expect(s.value).toBe('spreading');
    expect(s.context.bites).toEqual([2, 2, 2]);
  });
  it('re-opening a finished gift lands on the end card', () => {
    const s = transition(recipientMachine, initialSnapshot(recipientMachine), { type: 'LOADED', gift: sampleGift, done: true });
    expect(s.value).toBe('end');
  });
});

describe('creator machine (§5.2)', () => {
  it('guards people and letter; publishes from review', () => {
    const blank: GiftContentV1 = { ...sampleGift, names: { ...sampleGift.names, to: '', from: '' }, pages: [{ kind: 'letter', greeting: '', body: '', signature: '' }] };
    const go = (s: Snapshot<CreatorState, CreatorContext>, e: CreatorEvent) => transition(creatorMachine, s, e);
    let s = initialSnapshot(creatorMachine, { draft: blank });
    s = go(go(s, { type: 'NEXT' }), { type: 'NEXT' });
    expect(s.value).toBe('people');
    expect(go(s, { type: 'NEXT' }).value).toBe('people');
    s = go(s, { type: 'EDIT', patch: { names: { ...blank.names, to: 'Bống', from: 'Minh' } } });
    s = go(s, { type: 'NEXT' });
    expect(s.value).toBe('photos');
    s = go(s, { type: 'SKIP' });
    expect(go(s, { type: 'NEXT' }).value).toBe('letter');
    s = go(s, { type: 'EDIT', patch: { pages: [{ kind: 'letter', greeting: '', body: 'Thương em', signature: '' }] } });
    s = go(go(go(s, { type: 'NEXT' }), { type: 'SKIP' }), { type: 'PUBLISH', param: 'jabc' });
    expect(s.value).toBe('published');
    expect(s.context.param).toBe('jabc');
  });
});
