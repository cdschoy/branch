#!/usr/bin/env python3
"""CI gate: every UI string FRAMEWORK.md quotes must come from i18n/vi.json.

Rules (FRAMEWORK §6.3):
  1. `some.key` ("text")  -> the key must exist and "text" must equal its vi value exactly.
  2. `some.key`           -> any backticked i18n-looking key must exist (wildcards like `create.*` are skipped).
  3. "text" / “text” containing Vietnamese letters, not preceded by a key -> must equal some vi value,
     or be listed in ALLOW below (QA torture strings, glossary words, rendered examples).

Usage: python3 -I i18n/tools/check_framework_strings.py [docs/FRAMEWORK.md]   (exit 1 on any miss)
"""
import json, pathlib, re, sys, unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[2]
DOC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "docs" / "FRAMEWORK.md"
VI = json.load(open(ROOT / "i18n" / "vi.json", encoding="utf-8"))["vi"]
QA = json.load(open(ROOT / "design-tokens" / "design-tokens.json", encoding="utf-8"))["font"]["vietnameseRules"]["qaStrings"]

ALLOW = set(QA) | {
    # glossary / terms discussed, not UI copy
    "quý khách", "tên gọi / biệt danh", "di ảnh", "An", "Thương", "Phúc", "nhé", "nha", "Tôi đồng ý…",
    "thương", "mãi bên nhau", "cười lên", "xinh xỉu",
    "ĐỢI ANH NHÉ", "tròn N ngày", "chụp photobooth", "bạn", "Biển Đông", "tháng cô hồn", "Lưu qua link tạm",
    "Hà Nội", "TP.HCM", "Đà Lạt", "Huế", "Đà Nẵng", "Hội An", "vở ô li",
    # rendered examples of keys (pronoun set anh-em, tone nam)
    "Anh có một món quà nhỏ cho em nè",
    # Product B date stamp sample and an example lunar countdown rendering
    "12.11.2026",
}
PREFIX = ("gift.", "create.", "booth.", "common.", "a11y.", "og.", "theme.", "occasion.", "privacy.", "pay.", "inapp.", "format.")
VN = re.compile(r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", re.I)
KEYQ = re.compile(r"`([a-zA-Z]+(?:\.[A-Za-z0-9]+)+)`\s*\((?:\"([^\"]*)\"|“([^”]*)”)\)")
KEY = re.compile(r"`([a-z]+(?:\.[A-Za-z0-9*]+)+)`")
QUOTE = re.compile(r"\"([^\"\n]{1,160})\"|“([^”\n]{1,160})”")

text = unicodedata.normalize("NFC", DOC.read_text(encoding="utf-8"))
values = set(VI.values())
errs = []
covered = []
for ln, line in enumerate(text.splitlines(), 1):
    for m in KEYQ.finditer(line):
        k, q = m.group(1), m.group(2) if m.group(2) is not None else m.group(3)
        covered.append((m.start(), m.end()))
        if k not in VI: errs.append(f"{ln}: `{k}` is not in vi.json")
        elif VI[k] != q: errs.append(f"{ln}: `{k}` quoted as \"{q}\" but vi.json says \"{VI[k]}\"")
    for m in KEY.finditer(line):
        k = m.group(1)
        if "*" in k or not k.startswith(PREFIX) or k.endswith((".md", ".json", ".py", ".ts", ".css")): continue
        if k not in VI and not any(v.startswith(k + ".") for v in VI):
            errs.append(f"{ln}: `{k}` is not in vi.json")
    spans = [(s, e) for s, e in ((m.start(), m.end()) for m in KEYQ.finditer(line))]
    for m in QUOTE.finditer(line):
        if any(s <= m.start() < e for s, e in spans): continue
        q = m.group(1) if m.group(1) is not None else m.group(2)
        if not VN.search(q): continue
        if q in values or q in ALLOW: continue
        errs.append(f"{ln}: quoted Vietnamese \"{q}\" has no vi.json key (write `key` (\"value\"))")
if errs:
    print(f"check_framework_strings: {len(errs)} problem(s) in {DOC.name}")
    print("\n".join("  " + e for e in errs)); sys.exit(1)
print(f"ok: every quoted UI string in {DOC.name} traces to i18n/vi.json")
