#!/usr/bin/env python3
"""Vietnamese glyph-coverage gate for self-hosted font files (FRAMEWORK §3.4, rule 10).

Checks the cmap of each WOFF2/WOFF/TTF/OTF for the 74 Vietnamese letters used by
docs/reference-analysis/metrics/fonts_vietnamese.txt: every lowercase vowel a ă â e ê i o ô ơ u ư y
with all five tone marks (60), the 7 base letters ă â đ ê ô ơ ư, and their capitals Ă Â Đ Ê Ô Ơ Ư.
--full also requires every capital tone-marked vowel (134 letters), which user names in caps need.

Run it on the files you actually ship (the Fontsource WOFF2s), never on Google's CSS: Google serves
Playwrite VN unsplit (no /* vietnamese */ subset, flag 0) although its coverage is full, so a
subset-flag check would wrongly reject it.

Usage: python3 -I i18n/tools/font_glyph_check.py [--full] font.woff2 [more files...]   (exit 1 on any miss)
Needs: pip install fonttools brotli
"""
import sys, unicodedata

VOWELS = "aăâeêioôơuưy"
TONES = ["̀", "́", "̃", "̉", "̣"]  # huyền, sắc, ngã, hỏi, nặng
BASE = "ăâđêôơư"


def letters(full=False):
    out = [unicodedata.normalize("NFC", v + t) for v in VOWELS for t in TONES]
    out += list(BASE) + [c.upper() for c in BASE]
    if full:
        out += [unicodedata.normalize("NFC", v.upper() + t) for v in VOWELS for t in TONES]
    return out


def check(path, full=False):
    from fontTools.ttLib import TTFont
    cmap = TTFont(path, lazy=True).getBestCmap() or {}
    need = letters(full)
    missing = [c for c in need if ord(c) not in cmap]
    return len(need) - len(missing), len(need), missing


if __name__ == "__main__":
    args = sys.argv[1:]
    full = "--full" in args
    files = [a for a in args if a != "--full"]
    if not files:
        print(__doc__); sys.exit(2)
    assert len(letters()) == 74, len(letters())
    bad = 0
    for f in files:
        ok, n, miss = check(f, full)
        status = "FULL" if not miss else "FAIL"
        print(f"{status} {ok}/{n} {f}" + (f"  missing: {''.join(miss)}" if miss else ""))
        bad += bool(miss)
    sys.exit(1 if bad else 0)
