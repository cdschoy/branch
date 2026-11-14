import { afterEach, describe, expect, it } from 'vitest';
import { t, tIn, getLocale, setLocale, subscribeLocale, detectLocale, formatDate, formatIsoDate, formatLunar, upperVi } from './index';
import strings from '@strings/vi.json';

afterEach(() => setLocale('vi'));

describe('locale store', () => {
  it('switches tables and notifies subscribers once per change', () => {
    let n = 0;
    const off = subscribeLocale(() => { n++; });
    setLocale('en');
    setLocale('en');
    expect(getLocale()).toBe('en');
    expect(n).toBe(1);
    expect(t('common.replay')).toBe('Replay from the start');
    setLocale('vi');
    expect(n).toBe(2);
    off();
    setLocale('en');
    expect(n).toBe(2);
  });
  it('defaults to Vietnamese without storage or a Vietnamese browser (node)', () => {
    expect(detectLocale()).toBe('vi');
  });
  it('tIn reads an explicit table regardless of the active locale', () => {
    setLocale('en');
    expect(tIn('vi', 'gift.landing.from', {}, { pronouns: 'em-anh' })).toBe('Em có một món quà nhỏ cho anh nè');
    expect(t('gift.landing.from', {}, { pronouns: 'em-anh' })).toBe('I have a little gift for you');
  });
});

describe('locale-aware formats', () => {
  it('dates: dd/mm/yyyy in vi, "13 Nov 2026" in en', () => {
    expect(formatDate(3, 2, 2024)).toBe('03/02/2024');
    expect(formatIsoDate('2024-02-14')).toBe('14/02/2024');
    setLocale('en');
    expect(formatDate(13, 11, 2026)).toBe('13 Nov 2026');
    expect(formatIsoDate('2024-02-14')).toBe('14 Feb 2024');
    expect(formatIsoDate('not a date')).toBe('not a date');
  });
  it('lunar footer', () => {
    expect(formatLunar({ day: 5, month: 10 })).toBe('5/10 âm lịch');
    setLocale('en');
    expect(formatLunar({ day: 5, month: 10 })).toBe('Lunar day 5, month 10');
    expect(formatLunar({ day: 5, month: 4, leap: true })).toBe('Lunar day 5, leap month 4');
  });
  it('caps follow the locale', () => {
    expect(upperVi('thư gửi em')).toBe('THƯ GỬI EM');
    setLocale('en');
    expect(upperVi('a letter for you')).toBe('A LETTER FOR YOU');
  });
});

describe('English table', () => {
  it('has every key, and only intentional copies of the Vietnamese', () => {
    const vi = strings.vi as Record<string, string>, en = strings.en as Record<string, string>;
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
    const same = Object.keys(vi).filter((k) => vi[k] === en[k] && /[a-zà-ỹ]/i.test(vi[k]!.replace(/\{\w+\}/g, '')));
    // brand / product names and endonyms are the same in both languages
    expect(same.sort()).toEqual(['booth.layout.story', 'booth.mode.boomerang', 'create.mechanic.booth', 'landing.booth', 'locale.en',
      'locale.enShort', 'locale.vi', 'locale.viShort', 'pay.method.zalopay', 'fx.lab.time'].sort());
  });
});

describe('index.html first paint', () => {
  it('the inline pre-bundle script and static title match the string table', async () => {
    const { readFileSync } = await import('node:fs');
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    expect(html).toContain(`<title>${strings.vi['app.title']}</title>`);
    expect(html).toContain(`document.title = '${strings.en['app.title']}'`);
    expect(html).toContain("localStorage.getItem('app:locale:v1')");
  });
});
