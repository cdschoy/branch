#!/usr/bin/env python3
"""Validate motion-tokens.json + design-tokens.json and generate tokens.css + motion.ts into <repo>/design-tokens/.

Usage:
  python3 -I design-tokens/build.py      validate, then regenerate tokens.css + motion.ts (exit 1 on any violation)

The v1.1.0 (audit) and v1.2.0 (critic round 2) amendments are already applied to the JSON; see meta.amendments.
Validation rules (FRAMEWORK §3-§4, §7.8):
  - photo strip parts sum to the export height
  - spring peaks re-simulated (springs.py) and within their overshoot tier (checked on peakFinal, never % of travel)
  - choreography specs are typed: known actions only, a spring step lasts spring.settleMs, no inline colours
  - theme colours: no pure #FFFFFF, no neutral greys or near-black (chroma < 4%)
  - type styles meet the Vietnamese line-height minimums and the 15/13 px size floors
  - each font scene plan has <= 3 critical faces and <= 6 faces in total
"""
import importlib.util, json, re, sys, pathlib

out = pathlib.Path(__file__).resolve().parent
mt = json.load(open(out / "motion-tokens.json"))
dt = json.load(open(out / "design-tokens.json"))
_spec = importlib.util.spec_from_file_location("springs", out / "springs.py")
springs = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(springs)
booth = mt["choreography"]["booth"]; tw = mt["stagger"]["typewriter"]
ERR = []
def err(msg): ERR.append(msg)

# ---------------------------------------------------------------- validation: proportions
ps = dt["proportion"]["photoStrip"]
total = ps["insetTopPx"] + ps["frames"] * ps["framePx"][1] + (ps["frames"] - 1) * ps["gapPx"] + ps["footerPx"]
if total != ps["exportPx"][1]:
    err(f"photoStrip: parts sum to {total}px, canvas is {ps['exportPx'][1]}px")
if 2 * ps["insetSidePx"] + ps["framePx"][0] != ps["exportPx"][0]:
    err("photoStrip: side insets + frame width != canvas width")
fw, fh = ps["framePx"]
if ps.get("frameAspect") == "4:3" and abs(fw / fh - 4 / 3) > 0.01:
    err(f"photoStrip: frame {fw}x{fh} is not 4:3")

# ---------------------------------------------------------------- validation: springs and tiers
TIER_CAP = {"t0": mt["overshootTiers"]["t0"].get("tolerancePct", 0), "t1": 1.5, "t2": 4, "t3": 6}
for name, sp in mt["spring"].items():
    a = springs.analyse(sp["stiffness"], sp["damping"], sp["mass"], sp["fromValue"])
    peak = a["dipFinal"] if sp["fromValue"] > 1 else a["peakFinal"]
    if abs(peak - sp["peakFinal"]) > 0.002:
        err(f"spring.{name}: peakFinal {sp['peakFinal']} but simulation gives {peak}")
    vis = springs.visible_overshoot_pct(a, sp["fromValue"])
    tier = sp["tier"]
    if tier == "ambient":
        sp["overshootAllowed"] = True
        continue
    sp["overshootAllowed"] = tier != "t0"
    if vis > TIER_CAP[tier] + 1e-9:
        err(f"spring.{name}: visible overshoot {vis}% exceeds tier {tier} ({TIER_CAP[tier]}%)")
    if vis > mt["overshootTiers"]["ceilingPct"]:
        err(f"spring.{name}: visible overshoot {vis}% exceeds the ceiling")
    if mt["overshootTiers"]["springTier"].get(name) != tier:
        err(f"spring.{name}: tier {tier} disagrees with overshootTiers.springTier")

# ---------------------------------------------------------------- validation: choreography
PRIMITIVES = ["stampPop", "stickerPop", "letterPop", "polaroidDeal", "drawerSlide", "textBlurIn", "tooltipRise", "timedPrompt",
              "heroCutIn", "whipOff", "flyThroughExit", "curtainDrop", "blurOut", "hardCut", "tapWobble", "pressSquash", "hoverGrow",
              "biteTap", "chromeNudge", "activeSwap", "heartBurst", "confettiFountain", "cameraFlash", "sparkleGlint", "idleFloat",
              "trapezoidSway", "pendulum", "hintRing", "reelSpin", "livingHold", "handheldSway", "petalField", "pageCrossfade",
              "paperDipCrossfade", "lidFlip3D", "layoutMove", "sharedLightbox", "slotPrint", "toss", "flowerCurtain", "bloomBurst",
              "diagonalWipe", "worldCamera", "typewriter", "beatType", "idleWobble", "contentSwapInShell", "risingParallax",
              "tokenDrop", "rainLens"]
GENERIC = ["fade", "tween", "remove", "mount", "unmount", "fxEmit"]
ACTIONS = PRIMITIVES + GENERIC
COLOUR = re.compile(r"#[0-9A-Fa-f]{3,8}\b|rgba?\(|hsla?\(")
def strings(o):
    if isinstance(o, str): yield o
    elif isinstance(o, dict):
        for v in o.values(): yield from strings(v)
    elif isinstance(o, list):
        for v in o: yield from strings(v)
SPECS = {k: v for k, v in mt["choreography"].items() if not k.startswith("$") and k != "booth"}
for sid, spec in SPECS.items():
    for f in ("id", "title", "t0", "assets", "reduced", "steps"):
        if f not in spec: err(f"choreography.{sid}: missing {f}")
    if spec.get("id") != sid: err(f"choreography.{sid}: id mismatch")
    chap = re.match(r"C\d+", sid).group(0)
    seen = set()
    for st in spec.get("steps", []):
        n = st.get("name", "?")
        for f in ("name", "at", "dur", "target", "action"):
            if f not in st: err(f"{sid}.{n}: missing {f}")
        if not n.startswith(chap + "."): err(f"{sid}.{n}: step names must start with '{chap}.'")
        if n in seen: err(f"{sid}.{n}: duplicate step name")
        seen.add(n)
        if st.get("action") not in ACTIONS: err(f"{sid}.{n}: unknown action {st.get('action')!r}")
        if not (isinstance(st.get("at"), (int, float)) and isinstance(st.get("dur"), (int, float)) and st["at"] >= 0 and st["dur"] >= 0):
            err(f"{sid}.{n}: at/dur must be non-negative numbers")
        if "spring" in st:
            spn = st["spring"]
            if spn not in mt["spring"]: err(f"{sid}.{n}: unknown spring {spn}")
            elif st["dur"] != mt["spring"][spn]["settleMs"]:
                err(f"{sid}.{n}: dur {st['dur']} != spring.{spn}.settleMs {mt['spring'][spn]['settleMs']} (a spring step lasts its settle time)")
            if "ease" in st: err(f"{sid}.{n}: a step takes ease OR spring, not both")
        if "ease" in st and st["ease"] not in mt["easing"]: err(f"{sid}.{n}: unknown ease {st['ease']}")
        if "tierMin" in st and st["tierMin"] not in ("low", "mid", "high"): err(f"{sid}.{n}: bad tierMin")
        for sv in strings({k: v for k, v in st.items() if k != "evidence"}):
            if COLOUR.search(sv): err(f"{sid}.{n}: inline colour {sv!r}; reference a token (e.g. scrim.photo)")

# ---------------------------------------------------------------- validation: i18n keys named by choreography params
VI = json.load(open(out.parent / "i18n" / "vi.json", encoding="utf-8"))["vi"]
for sid, spec in SPECS.items():
    for st in spec.get("steps", []):
        p = st.get("params", {})
        for k in [p.get("key")] + list(p.get("keys", [])):
            if k and k not in VI: err(f"{sid}.{st['name']}: i18n key {k} is not in i18n/vi.json")

# ---------------------------------------------------------------- validation: theme colours
def hex_ok(name, slot, val):
    m = re.fullmatch(r"#([0-9A-Fa-f]{6})", val)
    if not m: return
    r, g, b = (int(m.group(1)[i:i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b)
    chroma, light = mx - mn, (mx + mn) / 2
    if val.upper() == "#FFFFFF": err(f"theme {name}.{slot}: pure #FFFFFF (cream, never white)")
    elif chroma < 0.04 and light < 0.15: err(f"theme {name}.{slot}: {val} is near-black (plum, never black)")
    elif chroma < 0.04 and light < 0.85: err(f"theme {name}.{slot}: {val} is a neutral grey (warm-tint it)")
for name, t in dt["themes"].items():
    for slot, v in t.items():
        if isinstance(v, str): hex_ok(name, slot, v)
        elif isinstance(v, list):
            for i, c in enumerate(v): hex_ok(name, f"{slot}[{i}]", c)
        elif isinstance(v, dict):
            for kk, c in v.items(): hex_ok(name, f"{slot}.{kk}", c)

# ---------------------------------------------------------------- validation: Vietnamese type rules
vr = dt["font"]["vietnameseRules"]
def px(v):
    m = re.match(r"clamp\(\s*([\d.]+)px", str(v)) or re.match(r"([\d.]+)px", str(v))
    return float(m.group(1)) if m else None
for sname, st in dt["font"]["style"].items():
    lines = st.get("lines", "multi")
    size = px(st["size"])
    lh = st["lineHeight"]
    lhn = (px(lh) / size) if isinstance(lh, str) and size else float(lh)
    cls = vr["familyClass"][st["family"]]
    if st.get("textTransform") == "uppercase": cls = "allCaps"
    need = vr["minLineHeight"][cls]
    if lines == "single" and cls not in ("allCaps",): need = min(need, vr["minLineHeight"]["singleLine"])
    if lines != "glyph" and lhn + 1e-9 < need:
        err(f"font.style.{sname}: line-height {round(lhn, 3)} < {need} ({cls}{', single line' if lines == 'single' else ''})")
    if lines != "glyph" and size is not None and size < vr["minSizePx"]["caption"]:
        err(f"font.style.{sname}: {size}px is under the {vr['minSizePx']['caption']}px caption floor")

# ---------------------------------------------------------------- validation: font budget
fam = dt["font"]["family"]
for scene, plan in dt["font"]["scenePlan"].items():
    if not isinstance(plan, dict): continue
    faces = plan["critical"] + plan["deferred"]
    if len(plan["critical"]) > 3: err(f"font.scenePlan.{scene}: {len(plan['critical'])} critical faces (max 3)")
    if len(set(faces)) > 6: err(f"font.scenePlan.{scene}: {len(set(faces))} faces (max 6)")
    for face in faces:
        if face.split()[0] not in fam: err(f"font.scenePlan.{scene}: unknown family role {face}")

if ERR:
    print("build.py: %d violation(s)" % len(ERR)); print("\n".join("  - " + e for e in ERR)); sys.exit(1)


# ---------------------------------------------------------------- helpers
def kebab(s): return re.sub(r"(?<=[a-z0-9])([A-Z])", r"-\1", str(s)).replace("_", "-").lower()
def num(x): return ("%g" % x)
def bez(a): return "cubic-bezier(%s)" % ",".join(num(v) for v in a)

css = []
w = css.append
w("/* GENERATED by design-tokens/build.py from design-tokens.json + motion-tokens.json. Do not edit by hand. */")
w("/* Evidence for every value lives in the JSON files; see docs/FRAMEWORK.md §3-§4. */\n")
w(":root {")
w("  /* ---- colour: core ---- */")
for group, vals in dt["color"].items():
    for k, v in vals.items():
        val = v["value"] if isinstance(v, dict) else v
        w(f"  --c-{kebab(group)}-{kebab(k)}: {val};")
w("\n  /* ---- radius / border / shadow ---- */")
for k, v in dt["radius"].items(): w(f"  --radius-{kebab(k)}: {v['value']};")
for k, v in dt["border"].items(): w(f"  --border-{kebab(k)}: {v};")
for k, v in dt["shadow"].items(): w(f"  --shadow-{kebab(k)}: {v['value']};")
w("\n  /* ---- type: families (74/74-verified Vietnamese faces only) ---- */")
for k, v in dt["font"]["family"].items(): w(f"  --font-{kebab(k)}: {v};")
w("  /* ---- type: styles ---- */")
for k, st in dt["font"]["style"].items():
    base = f"--type-{kebab(k)}"
    w(f"  {base}-family: var(--font-{kebab(st['family'])});")
    w(f"  {base}-weight: {st['weight']};")
    w(f"  {base}-size: {st['size']};")
    w(f"  {base}-line-height: {st['lineHeight']};")
    w(f"  {base}-tracking: {st['tracking']};")
    if "paddingTop" in st: w(f"  {base}-padding-top: {st['paddingTop']};")
    if "style" in st: w(f"  {base}-style: {st['style']};")
    if "numeric" in st: w(f"  {base}-numeric: {st['numeric']};")
vr = dt["font"]["vietnameseRules"]
w("  /* ---- Vietnamese diacritic safety (visual.md §3.4) ---- */")
for k, v in vr["minLineHeight"].items(): w(f"  --vi-min-lh-{kebab(k)}: {v};")
for k, v in vr["clipPaddingTop"].items(): w(f"  --vi-clip-pad-{kebab(k)}: {v};")
w(f"  --vi-max-caps-tracking: {vr['maxCapsTracking']};")
w(f"  --vi-pill-padding-block: {vr['pillPaddingBlock']};")
w(f"  --vi-max-extrusion: {vr['maxExtrusion']};")
w("  /* ---- photo strip export geometry (600x1800; parts sum checked by build.py) ---- */")
w(f"  --strip-frame-w: {ps['framePx'][0]}px;\n  --strip-frame-h: {ps['framePx'][1]}px;\n  --strip-inset-top: {ps['insetTopPx']}px;")
w(f"  --strip-inset-side: {ps['insetSidePx']}px;\n  --strip-gap: {ps['gapPx']}px;\n  --strip-footer: {ps['footerPx']}px;\n  --strip-aspect: 1 / 3;")

w("\n  /* ---- motion: durations (ms, 30 fps grid) ---- */")
for k, v in mt["duration"].items(): w(f"  --d-{kebab(k)}: {v['ms']}ms;")
w("  /* ---- motion: ambient periods ---- */")
for k, v in mt["ambient"].items():
    if "periodMs" in v: w(f"  --amb-{kebab(k)}: {v['periodMs']}ms;")
w(f"  --amb-wall-drift-vh-per-s: {mt['ambient']['wallDrift']['vhPerSec']};")
w("  /* ---- motion: easings ---- */")
for k, v in mt["easing"].items(): w(f"  --e-{kebab(k)}: {bez(v)};")
w("  --e-steps1: steps(1);")
w("  /* ---- motion: springs as CSS linear() (Chromium 113+, Safari 17.2+, Firefox 112+) ---- */")
for k, v in mt["spring"].items():
    w(f"  --spring-{kebab(k)}: {v['cssLinear']};")
    w(f"  --spring-{kebab(k)}-dur: {v['settleMs']}ms;")
w("  /* ---- motion: staggers ---- */")
sg = mt["stagger"]
w(f"  --stagger-polaroid-deal: {sg['polaroidDealMs']}ms;")
w(f"  --stagger-pennants: {sg['pennantsMs']}ms;")
w(f"  --stagger-glyph-sweep: {sg['glyphSweepMs'][1]}ms;")
w(f"  --stagger-glyph-scene: {sg['glyphSceneMs']}ms;")
w(f"  --stagger-glyph-photo: {sg['glyphPhotoMs'][0]}ms;")
w(f"  --hold-micro-min: {sg['microHoldMs'][0]}ms;")
w(f"  --hold-micro-max: {sg['microHoldMs'][1]}ms;")
w(f"  --debounce: {sg['debounceMs']}ms;")
w("  /* ---- overlays (audit 1.5 / 1.8) ---- */")
w(f"  --scrim-letter: {mt['scrim']['letter']['color']};")
w(f"  --scrim-photo: {mt['scrim']['photo']['color']};")
w(f"  --scrim-theater: {mt['scrim']['theater']['color']};")
w(f"  --flash-camera-peak: {mt['flash']['camera']['peak']};")
w(f"  --flash-impact-color: {mt['flash']['impact']['color']};")
w(f"  --flash-impact-peak: {mt['flash']['impact']['peak']};")
w(f"  --flash-fill-color: {mt['flash']['screenFill']['color']};")
w("  /* ---- z layers (ux.md §1.7) ---- */")
for name, z in [("world", 0), ("stage", 10), ("stage-fx", 20), ("flash", 30), ("hud", 40), ("scrim", 50), ("modal", 60),
                ("chrome", 70), ("lightbox", 80), ("cover", 90), ("system", 100)]:
    w(f"  --z-{name}: {z};")
w("}\n")

# fallbacks when linear() is unsupported (old Android WebView < Chromium 113)
fallback = {"stamp": "out-back", "sticker": "out-back", "toss": "out-back", "letterPop": "letter-pop",
            "lightbox": "overshoot-flip", "modal": "out-cubic", "chromeNudge": "out-cubic", "drawer": "drawer",
            "dock": "dock", "handPresent": "out-cubic", "settle": "out-cubic", "pendulum": "in-out-sine"}
w("/* Old WebViews without linear(): springs fall back to the nearest bezier (no CSS spring on the main thread). */")
w("@supports not (transition-timing-function: linear(0, 1)) {\n  :root {")
for k in mt["spring"]:
    w(f"    --spring-{kebab(k)}: var(--e-{fallback[k]});")
w("  }\n}\n")

# themes
w("/* ---- themes: components read only these slots; swap skins with data-theme ---- */")
themes = dt["themes"]
for i, (name, t) in enumerate(themes.items()):
    sel = f":root, [data-theme=\"{name}\"]" if name == "booth-stripes" else f"[data-theme=\"{name}\"]"
    w(sel + " {")
    for k, v in t.items():
        if k in ("label", "labelKey", "source", "products", "pattern", "panelFallback"): continue
        if isinstance(v, str): w(f"  --t-{kebab(k)}: {v};")
        elif isinstance(v, list):
            for j, c in enumerate(v): w(f"  --t-{kebab(k)}-{j+1}: {c};")
        elif isinstance(v, dict):
            for kk, c in v.items(): w(f"  --t-{kebab(k)}-{kebab(kk)}: {c};")
    w("}")
w("")
w("/* ---- reduced motion: ambient off; spectacles are swapped to 300 ms crossfades by the Director ---- */")
w("@media (prefers-reduced-motion: reduce) {\n  :root:not([data-motion=\"full\"]) .ambient { animation: none !important; }\n}")
w("[data-motion=\"reduced\"] .ambient { animation: none !important; }")
w("\n/* ---- Vietnamese text defaults ---- */")
w(".vi-script, .vi-display { font-synthesis: none; letter-spacing: 0; }")
w(".vi-clip { padding-top: var(--vi-clip-pad-script); }")
(out / "tokens.css").write_text("\n".join(css) + "\n")

# ---------------------------------------------------------------- motion.ts
ts = []
t = ts.append
t("// GENERATED by design-tokens/build.py from motion-tokens.json. Do not edit by hand.")
t("// Durations are in ms; Motion for React takes seconds, so use s(). Easings are cubic-bezier [x1, y1, x2, y2].")
t("// Evidence for each value: motion-tokens.json and docs/FRAMEWORK.md §4.\n")
t("export type Bezier = readonly [number, number, number, number];")
t("export type Tier = 'low' | 'mid' | 'high';\n")
t("export const duration = {")
for k, v in mt["duration"].items(): t(f"  {k}: {v['ms']},")
t("} as const;")
t("export type DurationName = keyof typeof duration;\n")
t("export const ambient = " + json.dumps(mt["ambient"], ensure_ascii=False, indent=2) + " as const;\n")
t("export const easing = {")
for k, v in mt["easing"].items():
    key = k if re.match(r"^[A-Za-z_]\w*$", k) and k != "in" else json.dumps(k)
    t(f"  {key}: [{', '.join(num(x) for x in v)}] as Bezier,")
t("} as const;")
t("export type EasingName = keyof typeof easing;")
t("/** CSS string form, e.g. cssEasing('outQuad') -> 'cubic-bezier(.25,.46,.45,.94)'. */")
t("export const cssEasing = (name: EasingName): string => `cubic-bezier(${easing[name].join(',')})`;\n")
t("/** overshootPctOfTravel is % of a normalised 0->1 travel. The tier metric is peakFinal / visibleOvershootPct (final-size units). */")
t("export type OvershootTier = 't0' | 't1' | 't2' | 't3' | 'ambient';")
t("export interface SpringPreset { stiffness: number; damping: number; mass: number; zeta: number; overshootPctOfTravel: number; fromValue: number; peakFinal: number; visibleOvershootPct: number; tier: OvershootTier; settleMs: number; cssLinear: string; overshootAllowed: boolean; mountAboveFinal?: boolean }")
t("export const spring = {")
for k, v in mt["spring"].items():
    extra = ", mountAboveFinal: true" if v.get("mountAboveFinal") else ""
    t(f"  {k}: {{ stiffness: {num(v['stiffness'])}, damping: {num(v['damping'])}, mass: {num(v['mass'])}, zeta: {num(v['zeta'])}, overshootPctOfTravel: {num(v['overshootPctOfTravel'])}, fromValue: {num(v['fromValue'])}, peakFinal: {num(v['peakFinal'])}, visibleOvershootPct: {num(v['visibleOvershootPct'])}, tier: '{v['tier']}', settleMs: {v['settleMs']}, overshootAllowed: {str(v['overshootAllowed']).lower()}{extra},")
    t(f"    cssLinear: {json.dumps(v['cssLinear'])} }},")
t("} as const satisfies Record<string, SpringPreset>;")
t("export type SpringName = keyof typeof spring;\n")
t("export const stagger = {")
t(f"  polaroidDeal: {sg['polaroidDealMs']},")
t(f"  pennants: {sg['pennantsMs']},")
t(f"  glyphSweep: [{sg['glyphSweepMs'][0]}, {sg['glyphSweepMs'][1]}] as const,")
t(f"  glyphSweepLineCap: {sg['glyphSweepLineCapMs']},")
t(f"  glyphScene: {sg['glyphSceneMs']},")
t(f"  glyphPhoto: [{sg['glyphPhotoMs'][0]}, {sg['glyphPhotoMs'][1]}] as const,")
t(f"  microHold: [{sg['microHoldMs'][0]}, {sg['microHoldMs'][1]}] as const,")
t(f"  debounce: {sg['debounceMs']},")
t("} as const;\n")
t("export const overshootTiers = " + json.dumps({k: v for k, v in mt["overshootTiers"].items() if k not in ("unit",)}, ensure_ascii=False, indent=2) + " as const;")
t(f"export const OVERSHOOT_CEILING_PCT = {mt['overshootTiers']['ceilingPct']};\n")
t("/** P44-P48 parameters (idleWobble, contentSwapInShell, risingParallax, tokenDrop, rainLens). */")
t("export const primitive = " + json.dumps(mt["primitive"], ensure_ascii=False, indent=2) + " as const;\n")
t("export const flowerCurtain = " + json.dumps(mt["flowerCurtain"], ensure_ascii=False, indent=2) + " as const;\n")
t("export const flash = " + json.dumps(mt["flash"], ensure_ascii=False, indent=2) + " as const;\n")
t("export const scrim = " + json.dumps(mt["scrim"], ensure_ascii=False, indent=2) + " as const;\n")
t("export const prompt = " + json.dumps(mt["prompt"], ensure_ascii=False, indent=2) + " as const;")
t("export const chromeMount = " + json.dumps(mt["chromeMount"], ensure_ascii=False, indent=2) + " as const;")
t("export const hintLadder = " + json.dumps(mt["hintLadder"], ensure_ascii=False, indent=2) + " as const;")
t("export const booth = " + json.dumps(booth, ensure_ascii=False, indent=2) + " as const;\n")
t("export const budgets = " + json.dumps(mt["budgets"], ensure_ascii=False, indent=2) + " as const;\n")
t("export const reducedMotion = " + json.dumps(mt["reducedMotion"], ensure_ascii=False, indent=2) + " as const;\n")
t("/** Choreographies as typed data (FRAMEWORK §4.3, §7.3). A step on spring X lasts spring[X].settleMs. */")
t("export type ActionId = " + " | ".join(f"'{x}'" for x in ACTIONS) + ";")
t("export interface Step { readonly name: string; readonly at: number; readonly dur: number; readonly target: string; readonly action: ActionId; readonly params?: Readonly<Record<string, unknown>>; readonly ease?: EasingName; readonly spring?: SpringName; readonly tierMin?: Tier; readonly evidence?: string }")
t("export interface Spec { readonly id: string; readonly title: string; readonly t0: string; readonly assets: readonly string[]; readonly reduced: string; readonly steps: readonly Step[]; readonly evidence?: string; readonly clock?: 'ticker' | 'gesture' | 'audio'; readonly [extra: string]: unknown }")
t("export const choreography = " + json.dumps(SPECS, ensure_ascii=False, indent=2) + " as const satisfies Record<string, Spec>;")
t("export type ChoreographyId = keyof typeof choreography;\n")
t("// ---------------------------------------------------------------- helpers")
t("/** ms -> seconds for Motion for React. */")
t("export const s = (ms: number): number => ms / 1000;")
t("/** Motion transition for a named spring preset. */")
t("export const sp = (name: SpringName) => ({ type: 'spring' as const, stiffness: spring[name].stiffness, damping: spring[name].damping, mass: spring[name].mass });")
t("/** Motion transition for a named tween. */")
t("export const tw = (ms: number | DurationName, ease: EasingName = 'outQuad') => ({ duration: s(typeof ms === 'number' ? ms : duration[ms]), ease: easing[ease] as unknown as number[] });\n")
t("/** v3 typewriter rate rule with the audit floor: min(127, 3220/n) ms per grapheme, >= 25 ms; above 130 graphemes reveal per word. */")
t("export function typewriterPlan(graphemeCount: number): { unit: 'grapheme' | 'word'; msPer: number; startDelayMs: number } {")
t(f"  const ms = Math.max({tw['floorMs']}, Math.min(127, 3220 / Math.max(1, graphemeCount)));")
t(f"  const unit = graphemeCount > {tw['perWordAboveGraphemes']} ? 'word' : 'grapheme';")
t("  return { unit, msPer: unit === 'word' ? Math.max(ms * 5, 120) : ms, startDelayMs: Math.min(200, Math.max(60, 1.6 * ms)) };")
t("}\n")
t("/** Beat grid helpers for lyric mode (C8). Only for tracks whose BPM the app owns. */")
t("export const beatMs = (bpm: number): number => 60000 / bpm;")
t("export const sixteenthMs = (bpm: number): number => 60000 / bpm / 4;\n")
t("/** Initial device tier (FRAMEWORK §4.6). No deviceMemory (Safari/iOS, Firefox) starts at mid explicitly; verify iOS hardwareConcurrency in M0. */")
t("export function initialTier(nav: { hardwareConcurrency?: number; deviceMemory?: number } = globalThis.navigator as never): Tier {")
t("  const cores = nav?.hardwareConcurrency, mem = nav?.deviceMemory;")
t("  if (mem === undefined) return 'mid';")
t("  if ((cores ?? 4) <= 4 || mem <= 3) return 'low';")
t("  if ((cores ?? 0) >= 8 && mem >= 6) return 'high';")
t("  return 'mid';")
t("}")
t("/** Runtime probe: p90 > 20 ms over 30 frames drops one tier; p90 < 12 ms over 60 frames promotes mid -> high. */")
t("export function probeTier(tier: Tier, frameDeltasMs: readonly number[]): Tier {")
t("  const sorted = [...frameDeltasMs].sort((a, b) => a - b); const p90 = sorted[Math.floor(sorted.length * 0.9)] ?? 16.7;")
t("  if (p90 > 20) return tier === 'high' ? 'mid' : 'low';")
t("  if (sorted.length >= 60 && p90 < 12 && tier === 'mid') return 'high';")
t("  return tier;")
t("}")
t("export const budget = <K extends keyof typeof budgets>(key: K, tier: Tier) => (budgets[key] as Record<string, unknown>)[tier];")
(out / "motion.ts").write_text("\n".join(ts) + "\n")
print("ok", len(css), "css lines,", len(ts), "ts lines")
