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
