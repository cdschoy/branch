# Evidence audit: six verified reports (v1, v2a, v2b, v3, v4, v5)

Auditor's scope: cross-check the six merged reports against each other and against `metrics/summary.json`, `metrics/palettes.json` and `metrics/fonts_vietnamese.txt`; resolve contradictions into adoptable framework values; list the 20 signature details that must survive, and the 10 reference bugs to avoid.

Evidence notation: `v4 f136-143` = video 4, frames 136-143 at 30 fps; IDs (`v4 B7`, `v1 #23`) point to rows in that report's motion table. "Auditor-derived" marks a conclusion that is mine (computed from the reports' numbers) rather than stated by an analyst.

---

## 0. Source-quality ledger (read this before trusting any number)

| Video | Capture | Temporal precision | What it means for the framework |
|---|---|---|---|
| v1 | 25 fps upsampled to 30 (every 6th frame duplicated: 3, 9, 15 ... ) | ±40 ms; durations quantised to 40 ms | 167/200/240 ms values are really 160/200/240 on a 40 ms grid. Treat any v1 duration as ±1 source frame. Possible TikTok speed-up of the capture sequence (v1 §10). |
| v2 (v2a/v2b) | Screen recording with irregular pacing: stall f56-61, dup f64-81, hitches f475-479 (0.35x) and f713-717 (0.23x), half-steps 816-1030 | Single-frame velocities unreliable; plateau speeds reliable | Use plateau speeds and cumulative-position fits only. Notepad entry easing (v2a C-02) is hitch-distorted. |
| v3 | Phone filming an iPad, 30 fps, auto white balance, rolling shutter, exposure blending | Opacity curves blurred by ~1 frame of exposure; colours shifted | All v3 colours in `palettes.json` are camera-shifted greys (e.g. `#d5d5cb` for paper). Use only v3's white-balance-corrected "True" column, and only as hue hints. v3 "partial" glyph frames are exposure blends, not fades (v3 M03). |
| v4 | 25 fps upsampled to 30 (dups 9, 15, 21 ... ) | ±33-40 ms | Lid flip measured on ~4 unique frames (v4 B7) - easing family is reliable, exact curve is not. |
| v5 | Variable pacing, ±50% per-frame velocity jitter | Fits on cumulative positions only | Bloom-burst spring fit is "poor" (v5 A-e08); use the bezier coverage fit. |

Frame-to-time convention differs: v1/v3 use t = (f-1)/30, v2b uses t = f/30. That is a 33 ms offset; irrelevant for durations, matters only if someone re-derives absolute beat alignment. **Adopt: durations only; never port absolute timestamps.**

None of the soundtracks except v2 belong to the site: v1 86.1, v3 92.3, v4 76.0, v5 161.5 BPM are TikTok overlays (`summary.json`; each report §8). Only v2 (152 BPM) is genuinely beat-locked. **Adopt: user-paced timers by default; beat quantisation only in a lyric/"song" mode where the app owns the track and knows its BPM.**

---

## 1. Contradictions and inconsistencies, with the adopted value

### 1.1 Overshoot is reported in two different units (biggest source of confusion)

- v1 #23 says "overshoot 8% (peak 1.056)", #27 "6% ... 1.057", #31 "7.9% ... peak 1.056". The peak scale of 1.056 is 5.6% of the final size, but 7.9% of the *travel* (0.29 → 1, travel 0.71). Both numbers are right; they use different denominators.
- v4 D6 lightbox: 5.35% scale overshoot from 0.166 = 6.4% of travel; the report also says "~9% travel" for translation and gives spring k≈490, c≈33. Auditor-derived: ζ = 33/(2√490) = 0.745, which only overshoots about 3% of travel, so **that spring does not reproduce the measured peak**. The cubic-bezier(.34,1.56,.64,1) given beside it overshoots about 10%. The three descriptors disagree.
- v4 B8 sticker: spring 3466/90 (ζ 0.76, about 2.4% travel overshoot) vs measured peak 1.04 from 0 (4% travel). Mild mismatch.
- v1 #7 stamp: k3000/c45-50 (ζ≈0.43-0.46) predicts about 20% overshoot of a 1.12→1 travel = 2.4% dip. Measured dip 2.3-2.8%. **Consistent.**

**Adopt:** define every overshoot token as *peak value in final-size units* (what the eye sees) and derive the spring from it. Overshoot budget, from all five videos:

| Tier | Peak | Use | Evidence |
|---|---|---|---|
| 0 | 0% | fades, drawers, scrims, crossfades, camera moves, lid flip | v2b "nothing overshoots"; v3 all M-rows 0%; v4 B7 landing spring refuted; v1 #37, v4 C9, v5 B-08 all 0% |
| 1 | ≤1.5% | paper/letter landing | v4 C3 1.012 (f209-210); v4 C5 ≤2% |
| 2 | 3-4% | sticker, badge, countdown stamp dip | v4 B8 1.04 (f146); v1 #7-11 dips 2.3-2.8% |
| 3 | 5-6% | hero toss, shared-element photo open | v1 #23/#27/#31 1.056 (f148, f191); v4 D6 1.0535 (f528-529) |
| ceiling | 6% | nothing in any reference exceeds it | v1 §1 "Nothing bounces more than about 6%" |

The lightbox spring should be k≈490, c≈29 (ζ≈0.66) to hit the measured 6% of travel; the peer token file `design/motion-tokens.json` already uses 490/29. Keep it.

### 1.2 Flower curtain: four different mechanics for "flowers fill/clear the screen"

| Instance | Direction | Motion law | Rotation | Opacity | Duration | Evidence |
|---|---|---|---|---|---|---|
| v1 wipe (cover and pass) | falls through | **linear** y, leading edge 1150-1200 px/s, trailing 880 px/s, plus sine sway 35-50 px | **constant spin 150-300°/s** | none | 1.37 s | v1 #49-51, f473-513 |
| v4 intro (reveal) | falls away | **ballistic**, g≈240 px/s², random v0 | **tilt only**, ±6-20° by quadrant, no spin | **linear fade 1→0** | 2.23 s | v4 A1-A3, f4-71 |
| v4 finale (cover) | rises | near-**linear** ~1400 px/s after 1 frame of ramp | burst sprites churn | — | ~0.4 s wall, 1.2 s from tap | v4 D20-D21, f594-610 |
| v5 bloom + drop (cover then reveal) | radial out, then falls | coverage easeOut (bloom); **ease-in** fall, never decelerates | — | contrast wash + ease-in fade + top-down mask | 3.3 s bloom, 1.53 s drop | v5 A-e08, A-e12-14, f58-235 |

These are not contradictions in data; they are four authored variants. The consistent law underneath: **sprites that are leaving accelerate (gravity / ease-in: v4 A1, v5 A-e12); sprites that sweep across as a wipe move at constant speed (v1 #49, v4 D20). No flower ever decelerates into an exit.**

**Adopt one `FlowerCurtain` primitive with modes:**
- `reveal` (default for opening a gift): v4 physics (gravity ≈42 CSS-vh/s², v0 −2.5…+11 vh/s, quadrant tilt ±6-20°, linear fade over ~2 s). Calm, no spin.
- `wipe` (scene change, hides a swap): v1 physics (linear fall ≈2 viewport-heights/s, sine sway, spin 150-300°/s), swap content under ≥70% cover (v1 #52, f487-490).
- `bloom` (envelope/box opening spectacle): v5 radial emitter, then hand over to `reveal`-style drop with ease-in.
- `flood` (finale): v4 rising wall, constant ~2.4 viewport-heights/s.

**Unit inconsistency to fix in code:** v4 writes g as "≈42 vh/s²" (CSS vh = 1% of height: 240 px/s² ÷ 5.76 = 41.7) but writes the finale as "≈2.6 vh/s" (viewport heights: 1500 ÷ 576 = 2.6). v1 "1.0-2.5 vh/s" and v2a "YOU 0.78 vh/s" also mean viewport-heights/s. **Adopt: tokens in CSS `vh` (percent) only; convert: 1 viewport-height/s = 100 vh/s.** So: v4 finale = 240-260 vh/s, v1 wipe = 200 vh/s, v2a rising words = 20-78 vh/s.

### 1.3 Ring "ping" hint period: 330 ms (v1) vs 800 ms (v4)

- v1 #3: d 33→59 px (×1.8), 330 ms, one occurrence, conf 0.6, "could be a press ripple".
- v4 A7: r16→29.4 (×1.84), radius linear 0.62 px/frame, 800 ms, conf 0.65; v4 A8 second ring 300 ms.
Both scale ≈1.8×. **Adopt: scale 1→1.8, 800 ms linear growth, opacity in 100 ms / hold / out 300 ms, repeat every 1.2-1.6 s until first interaction.** Reason: v4's is measured as a hint loop across three rings (f68-117); v1's single 330 ms ring matches v4's faster "second pulse", so use 300 ms only as an optional double-pulse.

### 1.4 Side drawer: three measurements, one behaviour

| Ref | Travel | Slide | Opacity | Overshoot | Dim |
|---|---|---|---|---|---|
| v1 #37 f209-228 | +228 px | 610 ms cubic-bezier(.27,.85,.27,.98) | 431 ms `ease` | 0 (k935/c118, ζ 1.93) | none |
| v4 C9 f310-325 | +175 px | 500 ms easeOutQuart (k386/c44, ζ 1.12) | ~350 ms ease | 0 | none |
| v5 B-08/09 f405-422 | −100% − 19 px | 570 ms cubic-bezier(.18,1,.49,.98) | 320-370 ms easeOutQuad | 0 | none |

The springs disagree numerically (ζ 1.93 vs 1.12) but both are non-oscillating, so they look the same. **Adopt: 560 ms, cubic-bezier(.18,1,.49,.98) (v5, the cleanest fit, sits between v1 and v4); opacity 360 ms easeOutQuad (opacity finishes at ~65% of the slide in all three); no scrim; enter from the edge nearest its trigger (v1/v4 right edge, v5 anchored to the FAB).** Use a tween, not a spring.

### 1.5 Modal scrim: 50% `ease` (v1) vs 67-69% `linear` (v4)

- v1 #39/#46: plum rgba(66-74,21-31,50-59,.50-.53), 300 ms `ease`, letter on top. v1 §10 recommends rgba(70,25,55,.5).
- v4 D5: rgba(47,15,41,.67-.69), 267 ms linear, photo lightbox on top.
At 270-300 ms the curve difference is barely visible. The opacity difference is real and tracks content: reading a letter (paper scene still felt behind) vs viewing one photo. **Adopt two tokens: `scrimLetter` rgba(70,25,55,.50) and `scrimPhoto` rgba(47,15,41,.68); both 280 ms, `ease`; never blur (neither reference blurs); never black.**

### 1.6 Card/letter entrance: three behaviours

- v1 #40: opacity 300 ms + y +12→0 + scale .965→1 in 170 ms, no overshoot, static −1.5° tilt (f244-252). Close is the exact mirror (#45, f422-430).
- v4 C3: scale .93→1.012→1, ~230 ms, overshoot 1.2%, on an automatic celebration (f205-212).
- v3 M11/M22: opacity only, 233-267 ms, fixed geometry (f268-275, f507-513).
**Adopt:** `letterOpen` = v1 (reading context, user-tapped, must be calm and mirror on close); `letterReveal` = v4 (auto-reveal after a completed ritual, tier-1 overshoot); `pageCard` = v3 (inside a page crossfade). Not interchangeable: the overshoot version is a reward, the calm version is for re-opening.

### 1.7 Crossfade: plus-lighter (no dip) vs deliberate paper dip

- v3 M05/M06/M21/M22: 140-270 ms per side, easeOutCubic-family, shared pixels never dip (linear plus-lighter); token 240 ms.
- v5 A-e05 f44-54: closed→open envelope art 333 ms, outgoing easeOutQuad + incoming ease-in, sum dips to ~56% so the cream paper shows through.
- v2 skyCrossfade 230-330 ms linear (v2a C-15, C-M1).
**Adopt both, by purpose:** `pageCrossfade` 240 ms easeOutCubic, no dip (navigation; shared chrome outside the fading layers); `artSwapDip` 333 ms with the v5 split curves (a single illustration changes state: envelope closed→open, box wrapped→open). The dip is what makes a state swap feel like a magic change instead of a page change.

### 1.8 Flash: white .77-.85 linear (v1) vs warm cream .60 ease-out (v4)

- v1 #13-17: white, peaks .77/.79/.85/.85 (true peak may be .9-1.0 between samples, v1 §10), ≤40 ms rise, ~130-167 ms linear decay; plus booth-centred glow to .93-.96.
- v4 D16: #f6f0e8 at .60 → .3 → .07 → 0 over 100 ms, ease-out, below the sprites (f580-583).
Different semantics (camera vs impact). **Adopt `cameraFlash` white peak .85, 160 ms linear decay, subject glow; `impactFlash` #f6f0e8 at .60, 100 ms ease-out. Both sit below the hero/celebration sprites and below chrome (v1 z-order item 7 vs starburst 6 above; v4 D16 "below the rose/flowers").** See anti-pattern A1 for cadence.

### 1.9 Countdown and capture cadence are TikTok-fast

v1 digits are 280 ms apart (f30, f38, f47) and flashes 240 ms apart (f55, 62, 70, 77). v1 §8/§10 itself warns the capture may be sped up ×1.5-3.5 and recommends ~1 s per digit. **Adopt for the real photobooth: 1000 ms per digit (stamp-pop each), first shot ~200 ms after "1" exits (v1 f53→f54 overlap), ≥2.0-2.5 s between shots (camera needs time; also photosensitivity, A1). Keep the v1 ratios inside each tick: flash 160 ms, shake ≤2.5 px in 2-3 steps over ~100 ms, starburst 200 ms.** For the gift-card "booth" (no real camera), 700-800 ms per digit and 600 ms between shots keeps the reference's snap while staying readable.

### 1.10 Strip print and toss: strip 1 differs from strips 2-3

- Print speed: strip 1 ~162 px/s (#22), strips 2-3 ~95-97 px/s (#26, #30).
- Toss: strip 1 367 ms (#23), strips 2-3 600 ms (#27, #31). v1 §10: "config difference or capture lag".
**Adopt the 2-of-3 majority: print ~100 px/s (≈700 ms per strip), toss 600 ms, peak scale 1.056, tilt peak ±16° at ~60% of the toss, rest tilts −3.6° / +1.3° / +4°.**

### 1.11 Typewriter: five measured regimes - are they one rule?

| Source | Rate | Unit | Reveal | Evidence |
|---|---|---|---|---|
| v3 user-paced pages | 127 / 80.4 / 88.9 / 127 / 27.3 ms | grapheme incl. spaces | step | v3 M02, M08, M13, M19, M24 |
| v2a notepad | ~99 ms (16th note at 152 BPM) | glyph | step | v2a C-04 f499-523 |
| v2b scene lyrics | 33-55 ms | glyph | step | v2b D13, E02-E05, E11 |
| v2b photo lyrics | 67-100 ms stagger, 67 ms fade | glyph | short linear fade | v2b F05-F07 f1269-1387 |
| v2b caption | one word per beat (~395 ms) | word | step | v2b E17 f1017-1133 |

They are not in conflict: v3 is the only **user-paced** regime and its rule msPerChar = min(127, 3220/n) fits 4 of 5 blocks (conf 0.65; the prompt block is 6% off). The v2 regimes are **music-locked**. **Adopt: default = v3 rule with grapheme segmentation (`Intl.Segmenter('vi', {granularity:'grapheme'})` on NFC text, essential for ệ/ữ/ặ); music mode = beat subdivision (beat/4 per glyph, or one word per beat for personal captions).**

Auditor amendment for real love letters: the 3.22 s cap gives 27 ms/char at 118 chars (v3 M24) but would be ~8 ms/char for a 400-character Vietnamese letter, which reads as a flicker, not typing. **Adopt a floor of 25 ms/grapheme; above ~130 graphemes switch to per-word (or per-line, 150 ms) reveal, and always offer tap-to-complete.** Glyph reveal stays a step (≤20 ms); the v2b 67 ms fade is reserved for text drawn inside a photo.

### 1.12 Idle motion: "only the tap target moves" vs "ambient life everywhere"

- v3 M04/M14: everything static except the cake wobble (f272-384); v3 §1 calls it "the only affordance".
- v5 A-m01: only the envelope floats (2.5 px, ~3 s, conf 0.5) on a flat cream page (f1-31).
- v4: milkshake 800 ms trapezoid sway + rings + glints (A6, A7, A12) - "use on only 1-2 hero props".
- v1: curtain pendulum ±1° always (#1, #54) + coin ping + shimmer (#3, #55).
- v2: never still: living hold, petals, clouds (v2a A-E16, B-21).
**Adopt by mode:** in gift/booth interaction screens, at most one hint loop on the tap target plus at most one slow ambient prop (≤±1-3°, period ≥0.8 s); everything else static. Lyric/"song" chapters (passive, music-locked) may use the v2 always-moving `livingHold` and petal field. Mixing the two (ambient everywhere on an interactive screen) dilutes the "tap me" signal, which is v3's core finding.

### 1.13 Press feedback: none (v3, v5) vs squash (v4)

v3 shows no press/hover state on any button (f110-131, f240-268, f495-506); v5 shows hover scale 1.04-1.06 but no press scale (B-02, B-M2); v4 squashes the box scale(1.01, 0.995) per bite (B16) and v5 wobbles the envelope on tap (A-e03). **Adopt: UI pills get `scale .97` for 60-80 ms on press (v3's own recommendation) - touch devices have no hover; diegetic objects get their own physical response (wobble 233 ms that ends tilted −1°, or squash).** The reference "no press state" is a gap, not a style.

### 1.14 Chrome above the scrim: feature (v1) or bug (v4)?

v1 keeps the media rail and rose above the scrim on purpose (f253-421; music keeps playing while reading). v4 has the drawer and rose CTA above the lightbox scrim and flags it "may be a z-index bug" (v4 §10, D5). v5 keeps all floating chrome above every overlay (A-e15). **Adopt: audio/music controls may sit above a reading scrim; the "continue to next chapter" CTA must be hidden or disabled while any modal or lightbox is open** (prevents skipping mid-letter, A5).

### 1.15 Chrome mount timing

v4 mounts the pill + FAB on a timer at 3.0 s and the rose CTA at 3.2 s (A9-A11, f91-97); v5 on the first pointer move (A-e01 f17); v1 has them from frame 1. **Adopt: mount secondary chrome after the intro spectacle ends (+~0.7 s, as v4 f71→f91), hard-cut in (no tween), primary CTA +200 ms with the v4 x-nudge.** Pointer-move triggering (v5) does not exist on touch.

### 1.16 Same platform family in v1, v4 and v5 (IP note)

v1, v4 and v5 share chrome: a "There's more here" pill + heart FAB, a gated rose CTA with an "Only tap when you've finished reading" tooltip, a plum music drawer with voice note, "Your bouquet", YouTube song and "Memory map" (v1 §6, v4 §6, v5 §6). These are one vendor's template strings. **Adopt the patterns (discovery FAB, gated continue, extras drawer); write original Vietnamese copy and original art. Do not reuse the English strings, card titles or layout one-to-one.** v3's licensed mascot: replace entirely (v3 header).

### 1.17 Colour conflicts

- Falling-girl silhouette: v2a #D678C6 at 25-30% opacity (B-16) vs v2b #e491e8 "true colour" (flat). Same element, different measurement basis (composited vs unmixed). **Adopt v2b #e491e8 at 25-30% opacity.**
- Gingham pink: v2b #d989b1-#ef99c6, v4 #f5b8b3/#f3b2af. Different scenes. **Adopt v4 values for the gift table (soft), v2b only for a saturated "picnic" theme.**
- Scrim plums: see 1.5. Deep plums across refs: #4A1F3B (v1), #2F0F29 (v4), #4f1b2b FAB (v5), #7f436b deepest shadow (v2b grading rule). All warm plum/wine; **no reference uses neutral black for UI darks except v3's ink (#1C1817, which v3 itself says to warm to #2B1F1F).** Adopt a plum ramp; text ink a warm cocoa (#3B272C / #4A3439 from v1, #524145 from v4).
- v3 palette: use only the corrected "True" column; `palettes.json` v3 entries are unusable for hex values.

### 1.18 Fonts: report recommendations vs the verified coverage file

`fonts_vietnamese.txt` has two tiers: **74/74 glyph-verified** (Playwrite VN, Dancing Script, Pacifico, Itim, Patrick Hand, Be Vietnam Pro, Playfair Display, Great Vibes, Charm, Mali, Pangolin, Anton, Paytone One, Dela Gothic One, Cherry Bomb One, Grandstander, Borel, Shantell Sans, Sedgwick Ave, Coiny) and **subset-flag only** (Lora, Montserrat, Nunito, Playpen Sans, Sriracha, Cormorant Garamond, EB Garamond, Allura, Italianno, Pinyon Script, Lexend, Quicksand, Fraunces, ...).

Errors found in the reports:

| Report | Claim | File says | Action |
|---|---|---|---|
| v2a §6 | Archivo Black "(vi)" for flat typed lyric and 3D letters | `Archivo Black: vietnamese_subset=0` | **Wrong. Do not use.** Use Dela Gothic One / Paytone One / Anton (verified). |
| v2b §6 | Archivo Black "(check Vietnamese coverage)" | subset=0 | Do not use. |
| v2a §6 | Fredoka as "YOU." puffy alternative | FAIL 19/74 | Do not use. Cherry Bomb One or Coiny (verified, rounded/puffy). |
| v2a §6 | "Pinyon Script lacks full vi: verify" | subset=1 (not glyph-checked) | Contradiction resolved toward "probably OK", but tier 2. Prefer Great Vibes (verified) for copperplate. |
| v2a §6 | Parisienne as fallback | FAIL 26/74 | Remove. |
| v2a/v2b | Rubik Black, Plus Jakarta Sans, Cinzel, Tangerine, Inter, Homemade Apple | not in file / Inter subset only | Unverified; not for Vietnamese display text. |
| v1 §6 | Caveat/Caveat Brush lack VN | Caveat FAIL 32/74 | Confirmed. |
| v4 §6 | Kalam, Caveat, Gochi Hand lack VN; suggests Sriracha first | Kalam 0, Gochi FAIL; Sriracha subset-only | Confirmed fails; demote Sriracha below Itim/Pangolin/Mali (verified). |
| v4 §6, design-tokens.json `serifLetter` | Noto Serif, Gelasio | not in file | Unverified fallback; Playfair Display is the only verified serif. Lora/EB Garamond/Cormorant are tier 2. |
| v5 §6 | Newsreader, Source Serif 4, Source Sans 3 "(all have Vietnamese)" | not in file | Unverified. Use Playfair Display (verified) or Lora (tier 2). |
| v3 §6.2 | Gaegu, Short Stack, Delius, Kalam, Caveat, Gochi Hand not Vietnamese-safe | Short Stack 0, Delius 0, Kalam 0, Caveat/Gochi FAIL | Confirmed. |
| v1 §6 | Patrick Hand "(has VN)" | 74/74 | Confirmed. |

Notable verified option no report suggested: **Playwrite VN** (74/74 even though its CSS subset flag is 0, because it is served unsplit) - a Vietnamese school-hand cursive, ideal for the letter signature. **Adopt only 74/74 fonts for any text the sender types** (names, letters, captions); tier-2 fonts only for fixed UI strings you can visually test.

### 1.19 Raw cubic-bezier fits that must not be shipped literally

Several free fits on 4-8 samples are overfit and contradict their own label: v1 #15 cubic-bezier(1,1.067,.755,.891) labelled "linear"; v1 #46 (0,−.653,.161,1.063) labelled `ease`; v2a A-E15 (0.696,0.803,0.138,0.710) labelled ease-out; v2a B-03 (0.807,0.080,0.313,−0.058) labelled easeInCubic-like; v2a B-09 (0.410,1.177,0.448,0.927) labelled easeOutCubic; v4 A4 (0.615,−0.052,0.544,0.352) for a perceived reveal; v5 C-e06 (0.837,0.567,0.984,1.091) is a user's trackpad. **Adopt the named family each analyst chose (linear / ease / easeOutCubic / easeInCubic ...), never the raw numbers, except where the fit is clean and multi-sample: v1 #37 dock, v5 B-08 drawer, v4 B7/C2 easeInOutCubic, v2b E01/E09/E12 camera moves.**

### 1.20 Low-confidence items a framework should not depend on

| Item | Conf | Ref | Treatment |
|---|---|---|---|
| Coin ping repeat period | 0.6, one sample | v1 #3 | Use v4 ring (1.3) |
| Coin shimmer | 0.45 | v1 #55 | Optional decoration |
| Starburst size / twinkle counts | 0.5-0.6 | v1 #19/#19b | Art-direct |
| Envelope idle float 2.5 px / 3 s | 0.5 | v5 A-m01 | Fine as a default; tune by eye |
| Cake wobble keyframes | 0.75, likely a GIF | v3 M14 | Use as shape; period free (3.8 s) |
| God rays, cloud drift | 0.5 | v2a A-E11/E12 | Art-direct |
| Falling silhouette | 0.55 | v2a B-16 | Optional |
| Letter 1-2° rotate settle | low | v4 C3 | Omit |
| Polaroid second deal: design or load swap? | 0.7 | v4 C6 | Build as intentional "stack" only if there are >3 photos |
| Bow 104-113 glints vs pull | 0.6 | v4 A12/B1 | Glints as hint, pull from first drag |
| "Tap to reveal" timer (4.0 s) vs coverage trigger | — | v5 A-e10 | Trigger on animation end, not a timer (A8) |
| Drawer start offset / 0.985 scale | extrapolated | v5 B-08 | Omit scale |
| Finale: live particles vs pre-rendered video | — | v4 §10, v5 §10 | Either; budget for mobile (pre-rendered alpha video is cheaper) |
| Haze snaps f711/f769 | 0.55-0.7 | v2a C-M4, C-20 | Renderer artifact; do not reproduce |

---

## 2. Top 20 signature details (an implementation must not lose these)

Ranked by how much each carries the feel. Each is backed by at least one measured row.

1. **Painted cut-out world, flat crisp UI on top.** Gouache/watercolour illustration with no CSS shadows on the art, under small flat pills, cards and FABs with soft warm shadows. Evidence: v1 §6 (wall, booth; UI shadow ~0 2px 6px rgba(80,40,50,.2)); v4 §6 (watercolour sweets, gingham tiles ~45.5 px with wobbly edges); v5 §6 (watercolour envelope, painted flower sprites, flat paper UI).
2. **Flowers as the curtain at both ends of the experience.** The gift opens with flowers clearing and ends with flowers flooding, so the experience is bookended. Evidence: v4 f4-71 (intro fall) and f594-610 (finale wall); v1 f473-513 (wipe between chapters); v5 f58-156 (bloom) and f189-235 (drop).
3. **A physical ritual gates every reveal.** The recipient performs an object action, never presses a generic "Next". Evidence: coin drop v1 f24-29; ribbon pull v4 f114-133; six bites v4 f167-203; envelope tap v5 f32; tap the cake v3 f384.
4. **Only the thing to tap is alive.** One hint loop on the target while the rest holds still. Evidence: v3 M14 cake wobble f272-384 with M04 everything else static; v5 envelope float f1-31; v4 rings and glints on the ribbon f68-117; v1 coin ping f14-23.
5. **Chrome changes instantly; content changes softly.** Status text, hint pills, glyph and sprite swaps are 0 ms; cards, letters and photos ease. Evidence: v1 pill swaps f24, f84, f203 (#5, #21, #34); v4 chrome hard-cut f91, pill unmount f308; v5 status line f266/f312/f364, pill removal f405.
6. **Anticipation micro-holds of 67-230 ms between stages.** They make the sequence read as deliberate steps. Evidence: v1 233 ms + 200 ms between last flash and strip feed (f82-90); v4 holds f127-129, f134-135, and 133 ms before the rose throw (f571-574); v5 5-frame pause before the envelope opens (f40-43).
7. **Ease-in exits, ease-out/spring entrances.** Things leave by accelerating away and arrive by settling. Evidence: v4 B5 ribbon whip easeInQuad f130-133 vs B8 sticker easeOutBack f143-148; v2a B-03 fly-through exit easeIn f191-205 vs A-E15 blur-in ease-out f122-178; v5 A-e12 wall fall ease-in f189-227.
8. **The overshoot budget is small and tiered (0 / 1% / 4% / 6%).** Nothing over 6%; the calm comes from restraint. Evidence: v1 strip peak 1.056 (f148, f191); v4 lightbox 1.0535 (f528-529); v4 sticker 1.04 (f146); v4 letter 1.012 (f209-210); v4 B7 lid flip with its landing spring refuted.
9. **Stamp-pop countdown.** Digit mounts at full opacity at scale 1.12, dips 2.3-2.8%, settles in 100 ms, exits with opacity only over 50-70 ms. Evidence: v1 #7-12 f30-54.
10. **Layered flash tick.** White flash (≤40 ms rise, linear decay) + subject-centred glow + shake of the subject group only (≤2.5 px, stepped) + painted starburst above the flash. Evidence: v1 #13-19 f54-82.
11. **Print from the slot, then toss to a fanned rest.** Linear feed inside an `overflow:hidden` slot, then a toss with scale .29→1.056→1, an arc, and ±16° tilt that unwinds to a resting −3.6° / +1.3° / +4° fan. Evidence: v1 #22-31 f90-198.
12. **Land reward that escapes the card.** Caption fades +33 ms after landing; confetti or hearts burst and are not clipped to the photo. Evidence: v1 #24-25 f112-136 ("not clipped to the cell"); v4 B10 heart confetti f144-155; v4 C4 heart burst on the washi tape f211-246.
13. **Polaroids/strips as the memory carrier, tilted ±2-6° and dealt at ~150 ms stagger.** Evidence: v4 C5 f212-228 (rise +5-12 px, scale ~.9→1.02→1); v2a C-19 rising polaroids f679-800; v2b D04 polaroids with slow rotation f795-877; v2b polaroid proportions (§6: bottom border ≈21% of height).
14. **The letter: paper card, washi tape, plum scrim, static tilt.** Opens over 300 ms with y 12→0 and scale .965→1, a −1.5° tilt, and closes as an exact mirror. Evidence: v1 #39-46 f244-252 and f422-431; v4 C3 "Dear ..." card with washi tape f205-212.
15. **Deep colours are plum/wine, never black; base is cream + blush.** Evidence: v1 scrim rgba(70,25,55,.5) and wall #F9F8E8/#F2C6C5; v4 drawer #49223d→#120415, gingham #f5b8b3/#fcecdd; v5 FAB #4f1b2b, paper #f0e7d6; v2b grading rule "darkest ≥ #7f436b".
16. **Discovery FAB + extras drawer (music, voice note, bouquet, map), non-modal.** Slides in ~0.5-0.6 s with easeOutQuart-class, no dim, while the gift stays live. Evidence: v1 #36-37 f209-228; v4 C8-C9 f308-325; v5 B-07-B-09 f405-422.
17. **Gated "continue" CTA.** A corner icon with a "tap only when you've finished reading" guard; tapping triggers the big transition. Evidence: v1 rose + tooltip, teardown f471-472 then wipe; v4 rose CTA mount f97-103 and finale f570.
18. **Time-anchored grapheme typewriter with no caret and no fade.** Glyphs are pre-laid-out and snap on; the schedule is computed from t0 so jank catches up. Evidence: v3 M02/M08/M13/M19/M24 (127/80/89/127/27 ms; "Happy B" stall then flush f514-522); v2b E02-E05 f900-953.
19. **Lowercase hand-lettered microcopy with emoticons and the ✦ sparkle.** Evidence: v1 pills "drop a coin ✦", "smile!", "printing...", "tap a strip ✦" (f1, f24, f84, f203); v3 "next :3", "yes!!", "no thanks." (f110-268). Vietnamese equivalents need verified hand fonts (1.18).
20. **Media state is honest and tiered.** Selected (instant) → "Starting…" → "Playing…" only on the real `playing` event, with a diegetic indicator (cassette reels 1.1 s/rev, mirrored). Evidence: v5 B-03-B-06 f266, f312, f364 (reels start the same frame as `playing`, +1.73 s after the click). (v5 then breaks it: see A2.)

Runner-up details worth keeping if budget allows: v4 shared-element lightbox (D6 f522-534); v4 throw → impact → bloom → flood finale (f570-610); v2a living hold + fly-through exits for a lyric chapter (A-E16, B-03, B-14, B-19); v1 curtain damped pendulum after the wipe (#53 f503-545); v5 paper-dip art swap (A-e05 f44-54).

---

## 3. Top 10 anti-patterns and bugs seen in the references

| # | Anti-pattern | Evidence | Do instead |
|---|---|---|---|
| A1 | **Flash cadence over 3 per second** (auditor-derived). Four full-screen flashes peak 240 ms apart (4 in ~0.73 s) at .77-.85 white plus a .93-.96 glow. That exceeds the WCAG 2.3.1 three-flashes-per-second guideline for large-area flashes. | v1 #13-17 f54-82 | ≥1 s between flashes (≥2 s in the real booth), and peak ≤.85 over the full screen. Reduced-motion: cap at .4, no shake (v1 §8). |
| A2 | **Media UI desync.** The cassette reels keep spinning after the video is paused, and the "playing" state is not bound to real player state. | v5 C-e13 f741-768, C-e15 f773-817 | Drive every playing indicator from player events (`playing` / `pause` / `waiting` / `ended`), one audio owner at a time. |
| A3 | **Image decode jank and pop-in.** The page freezes for 200 ms on "Happy B" while photos decode, then the photos pop with a 33 ms load-order stagger. Placeholder discs show first. Stickers pop 100-270 ms late at random. | v3 M25-M26 f514-522; M12, M18, M23 (f272, f392, f509) | Preload and `await img.decode()` for the next step before navigating; then pop on purpose (fixed delay, 80-120 ms stagger). |
| A4 | **Native fullscreen breaks the page.** On exit the scroll jumps 100→41, a fixed card's inner scroll resets, and the FAB disappears for a frame. | v5 C-e12/m02 f709-710 | In-app "theater" overlay (FLIP + dark backdrop), or save/restore scroll on `fullscreenchange`. Avoid fixed-height inner-scroll cards for media. |
| A5 | **Navigation chrome stays live above modal scrims.** The rose "continue" CTA and the drawer sit above the lightbox scrim (still tappable), and tapping the rose under the scrim snaps the page to its end state. | v4 D5 f522-529 (z-order), D8-D9 f570; v4 §10 | Hide or disable "continue" while any modal is open; animate or skip end-state reflows; only audio controls may stay above a reading scrim. |
| A6 | **Instant teardown glitches.** A 1-frame tooltip ghost on teardown; a ~1-frame FAB blink; content hard-cut while still partly on screen. | v1 #47 f471-472; v5 f709; v2b D01b "YOU." removed at f808 with 37 px still visible | Unmount under cover (behind the wipe) or with a ≥100 ms fade. Hard-cuts are only for chrome. |
| A7 | **Jump scrolls inside drawers.** The inner rail jumps 50→~385 px in one frame (v1), or snaps 337 px (v4); the user loses their place. | v1 #43 f304; v4 D2 f403 | Smooth `scrollIntoView` (easeInOutQuad ~600 ms, as the v4 D1 scroll f373-392) or tabs/sections instead of one long rail. |
| A8 | **Prompt timers ignore animation state and taps aren't guarded.** "Tap to reveal" appears on a fixed +4.0 s timer before the burst has settled (f152 vs last edge at f156); nothing debounces taps during choreography. | v5 A-e10 f152-158 vs A-m02 f147-156; v5 §7 build notes | Show the prompt on the spectacle's `finished` promise; ignore input until a sequence reaches its next interactive state. |
| A9 | **Dead ends and silent affordances.** No press state on any button; no completion cue, replay or close at the end of the letter; the final CTA shows an arrow cursor and no hover; the subtitle is very low contrast. | v3 §1 and f110-131 / f240-268 / f495-506; v3 M27 f605-669; v5 C-e09 f592-649; v2a #E8D8DD subtitle on cream (§6) | Soft press (scale .97, 60-80 ms), a completion cue 600-1000 ms after the last glyph, a replay/next action at the end, `cursor:pointer`, WCAG AA contrast for any text the reader must read. |
| A10 | **TikTok-speed timing and renderer artifacts mistaken for design.** The 280 ms countdown and 240 ms shot cadence (possibly sped up); the 1-frame "brighten" lead frame at page changes; haze depth-sort snaps; a crossfade that moves a sticker 39-40 px via two ghost copies. | v1 §10; v3 M15/M20 f384, f506 ("not a press flash"); v2a C-M4/C-20 f711, f769; v3 f132 ghosting | Use the real-world cadence (1.9); keep shared elements pixel-stable across pages (outside the fading layers) or move them with FLIP; never reproduce capture artifacts (stalls, hitches, watermarks, duplicated frames). |

Also seen, lower priority: v4's milkshake loop runs at a fixed 800 ms that drifts against the 76 BPM track (A6; harmless, but don't claim beat sync); v1/v4/v5 decorative wipes have no reduced-motion path in the references (all three reports recommend a 300 ms crossfade).

---

## 4. Adopted canonical values (one-line summary for the token file)

| Token | Value | From |
|---|---|---|
| Time grid | durations ±40 ms; ms = frames × 33.3 | 1.0 |
| Overshoot tiers (peak, final-size units) | 0 / ≤1.5% / 3-4% / 5-6%, ceiling 6% | 1.1 |
| Lightbox spring | k 490, c 29 (ζ 0.66) | 1.1 |
| Flower curtain | modes reveal (gravity 42 vh/s², linear fade 2 s), wipe (200 vh/s linear + spin), bloom (v5), flood (240-260 vh/s) | 1.2 |
| Hint ring | ×1.8, 800 ms linear, repeat 1.2-1.6 s | 1.3 |
| Drawer | 560 ms cubic-bezier(.18,1,.49,.98), opacity 360 ms easeOutQuad, no dim | 1.4 |
| Scrim | letter rgba(70,25,55,.50), photo rgba(47,15,41,.68), 280 ms ease, no blur | 1.5 |
| Letter open / reveal / page card | v1 calm mirror / v4 1.2% pop / v3 opacity | 1.6 |
| Crossfade | page 240 ms easeOutCubic no dip; art swap 333 ms with dip | 1.7 |
| Flash | camera white .85, 160 ms linear; impact #f6f0e8 .60, 100 ms ease-out | 1.8 |
| Booth cadence | 1000 ms/digit, ≥2.0-2.5 s between shots (gift booth: 700-800 / 600 ms) | 1.9, A1 |
| Strip | print ~100 px/s, toss 600 ms, peak 1.056, ±16° tilt, rests −3.6/+1.3/+4° | 1.10 |
| Typewriter | min(127, 3220/n) ms/grapheme, floor 25 ms, >130 graphemes per word/line, tap-to-complete | 1.11 |
| Idle | ≤1 hint loop + ≤1 slow prop on interactive screens | 1.12 |
| Press | pills scale .97, 60-80 ms; objects wobble/squash | 1.13 |
| Fonts | user-entered text in 74/74-verified fonts only (Playwrite VN, Dancing Script, Great Vibes, Charm, Pacifico, Mali, Itim, Pangolin, Patrick Hand, Shantell Sans, Grandstander, Be Vietnam Pro, Playfair Display, Paytone One, Dela Gothic One, Anton, Cherry Bomb One, Coiny, Borel, Sedgwick Ave) | 1.18 |
