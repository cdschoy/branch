import { describe, expect, it } from 'vitest';
import { t, graphemes, nfc, words, answerMatches, voiceWords } from './index';

describe('i18n', () => {
  it('reads vi.json and interpolates', () => {
    expect(t('common.replay')).toBe('Xem lại từ đầu');
    expect(t('lab.speed', { speed: 3 })).toBe('Tốc độ ×3');
  });
  it('resolves sender voice', () => {
    expect(t('gift.landing.from', {}, { pronouns: 'anh-em' })).toBe('Anh có một món quà nhỏ cho em nè');
    expect(t('gift.treats.done', {}, { tone: 'north' })).toBe('Hết sạch rồi! Mở thư nhé');
    expect(voiceWords({ self: 'tớ', you: 'cậu', tone: 'nha' }).Self).toBe('Tớ');
  });
  it('picks {we} from the pronoun set even with explicit words', () => {
    expect(voiceWords({ self: 'tớ', you: 'cậu', tone: 'nhe' }).We).toBe('Bọn mình');
    expect(voiceWords({ self: 'tớ', you: 'cậu', tone: 'nha' }).We).toBe('Tụi mình');
    expect(voiceWords({ pronouns: 'to-cau', self: 'tớ', you: 'cậu', tone: 'nhe' }).we).toBe('bọn mình');
    expect(voiceWords({ self: 'mình', you: 'bạn', tone: 'nha' }).we).toBe('chúng mình');
    expect(voiceWords({ self: 'mình', you: 'Bống', recipientName: 'Bống' }).we).toBe('chúng mình');
    expect(voiceWords({ self: 'anh', you: 'em' }).we).toBe('mình');
    expect(t('gift.photos.title', {}, { self: 'tớ', you: 'cậu', tone: 'nhe' })).toContain('bọn mình');
  });
  it('splits NFD input into NFC graphemes', () => {
    const nfd = 'Nguyễn'.normalize('NFD');
    expect(graphemes(nfd)).toEqual(['N', 'g', 'u', 'y', 'ễ', 'n']);
    expect(nfc(nfd)).toBe('Nguyễn');
  });
  it('keeps punctuation with words', () => {
    expect(words('nha.').map((w) => w.text)).toEqual(['nha.']);
  });
  it('matches secret answers', () => {
    expect(answerMatches('  ĐÀ LẠT ', 'Đà Lạt')).toBe(true);
    expect(answerMatches('da lat', 'Đà Lạt')).toBe(true);
    expect(answerMatches('dà lat', 'Đà Lạt')).toBe(false);
  });
});
