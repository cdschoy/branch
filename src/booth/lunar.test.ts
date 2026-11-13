/** Lunar port vs i18n/tools/amlich.py (fixtures generated with lunar2solar). */
import { describe, expect, it } from 'vitest';
import { solarToLunar } from './lunar';

const CASES: [[number, number, number], [number, number, number, boolean]][] = [
  [[17, 2, 2026], [1, 1, 2026, false]], [[19, 8, 2026], [7, 7, 2026, false]], [[25, 9, 2026], [15, 8, 2026, false]],
  [[25, 7, 2025], [1, 6, 2025, true]], [[25, 6, 2025], [1, 6, 2025, false]], [[6, 2, 2027], [1, 1, 2027, false]],
  [[13, 11, 2026], [5, 10, 2026, false]], [[12, 6, 2028], [20, 5, 2028, false]], [[10, 2, 2024], [1, 1, 2024, false]],
];

describe('solarToLunar', () => {
  for (const [[d, m, y], [ld, lm, ly, leap]] of CASES) {
    it(`${d}/${m}/${y} → ${ld}/${lm}/${ly}${leap ? ' (nhuận)' : ''}`, () => {
      expect(solarToLunar(d, m, y)).toEqual({ day: ld, month: lm, year: ly, leap });
    });
  }
});
