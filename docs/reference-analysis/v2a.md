# v2a — "Let You Break My Heart Again" lyric experience, frames 1–800 (0–26.6 s @30fps, 1012x576)

Merged from analyst segments v2-A (1-150), v2-B (145-480) and v2-C (475-800). Where a verifier gave a corrected value, it replaces the analyst's value. Verifier missed-events are included. No events were refuted. Segment overlaps (145-150 and 475-480) are de-duplicated.

## 1. Summary

This is a web-based lyric experience (screen-recorded and posted to TikTok) built on a static pastel sky with 3D objects in front of it. It has three visual chapters:

1. **Dreamy script chapter (f1-475).**
   - A loading card ("my sweetheart", watercolor bouquet, LOADING bar) dissolves into a title card: "Let You Break My Heart Again" in Inter Bold pink, with a single shimmer mask sweep.
   - Over pink and lilac clouds, large orchid script lyrics follow one another: "One Day." → "I Will" → "Stop" → "falling in love" → "With you".
   - Each word repeats the same grammar. **Enter** with blur+fade (ease-out) or a per-glyph mosaic→sharp stagger. **Hold** is never still: linear dolly +1.5–5 %/s with a roll of about ±2–2.5°/s around an off-centre pivot. **Exit** is a fly past the camera with ease-in, in a different direction each time (zoom-in, up-left, right, smear-right, whole-scene tilt-up).
   - Rose petals fall in three depth tiers on a screen-space overlay that ignores camera moves.
   - The chapter ends with a 1 s empty-sky "breath" and a hard cut on the beat.
2. **3D notepad typewriter (f474-578).**
   - A grid-paper notepad with a pink extruded binding bar cuts in already moving.
   - "SOME ♥ / DAY," is typed on it one glyph per 16th note, with instant pops and no fade.
   - The pad then pushes toward the camera (×1.64), rolls -3°→-90° (strong ease-in), swoops out of the top-left corner and fades out over its last 200 ms.
3. **Flying cards and a rising-parallax sky (f580-800).**
   - Polka-dot paper cards carry cream extruded 3D letters ("SOME ONE", "WILL LIKE", "ME"). They fly bottom→top along piecewise-linear paths that kink on the beat.
   - After that, pale extruded 3D words ("LIKE I", "LIKE", "YOU."), pink-tinted polaroids and puffy hearts rise at speeds set by their depth, while petals fall the other way.

**Style:** high-key pastel pink, lavender and cream. No drop shadows. Depth comes from blur, haze, extrusion, parallax and size. The whole composite sits under a global vertical vignette.

**Timing:** text events follow lyric timestamps that land on or within ±3 frames of the 152 BPM grid (11.84 frames per beat). Ambient layers run free.

**Recording artifacts (ignore):** stall at f56-61, duplicate frames at f64-81, f196 duplicate, judder at f426-435, playback hitches at f475-479 (0.35x) and f713-717 (0.23x), alternating 1x/2x cadence, TikTok watermark, and the host "Help" pill.

## 2. Storyboard timeline

| # | Frames | Seconds | Beat |
|---|---|---|---|
| 1 | 1-10 | 0.00-0.33 | Loading overlay (sky-blue inset card, bouquet, "my sweetheart", LOADING) dissolving. Tail only: alpha .37→0 |
| 2 | 11-81 | 0.33-2.70 | Title card over drifting lilac clouds, god rays (f12-96), petals P1/P2/S1. Shimmer sweep f19-55. Heart cursor f66 |
| 3 | 82-92 | 2.73-3.07 | Title blur+fade exit. Top cloud bank starts dissolving (f82-104) |
| 4 | 93-121 | 3.10-4.03 | Mist breath, no text. Petals S2 (lift arc), Pc (mid-air spawn), S3. Centre cloud fades in from f111 |
| 5 | 122-205 | 4.07-6.83 | "One Day." blur-in (f122-178, 1.87 s ease-out), sparkle on the "e" (f145-168), living hold (roll + dolly), fly-through zoom exit (f191-205) |
| 6 | 206-208 | 6.87-6.93 | Empty-sky gap (~100-200 ms) |
| 7 | 209-244 | 6.97-8.13 | "I Will" blur-in (f209-217). Camera truck left with parallax (f204-236). Fly-past up-left (f236-244) |
| 8 | 243-266 | 8.10-8.87 | "Stop" fade-in on beat 243, hold, fly-past right (f257-266). Big near petal f235-256 |
| 9 | 264-356 | 8.80-11.87 | "falling in love": mosaic ghost (f264-267), per-glyph sweep (f267-286), CCW roll hold, falling-girl silhouette (f273-326), slide-right + echo exit (f337-356) |
| 10 | 357-437 | 11.90-14.57 | "With you" sweep (f357-367), CW roll + dolly hold (f368-416), whole-scene tilt-up (f417-437) |
| 11 | 438-475 | 14.60-15.83 | Empty-sky breath, warm grade shift (f455-470), backdrop pre-wash (f474) |
| 12 | 476-488 | 15.87-16.27 | Hard cut on beat 476: notepad already moving; cream wash over the backdrop clears (f474-486) |
| 13 | 488-523 | 16.27-17.43 | Pad drifts. Typewriter "SOME ♥ / DAY," (f499-523). Confetti flips |
| 14 | 524-577 | 17.47-19.23 | Pad pushes in, rolls to -90°, swoops out top-left, fades out (f571-577). Sky recolour (f571-578) |
| 15 | 578-579 | 19.27-19.30 | Breath (beat 578) |
| 16 | 580-668 | 19.33-22.27 | Cards fly through: SOME ONE (f580-630), WILL LIKE (f604-654), ME (f633-668, fades out f663-668) |
| 17 | 661-671 | 22.03-22.37 | Sky cross-dissolves to lavender (300 ms linear) |
| 18 | 671-800 | 22.37-26.67 | Rising sky: "LIKE I" (f671-723), "LIKE" (f713-762), "YOU." per-letter (f762-803). Polaroids P1/P2/P3, puffy hearts, falling petals |

## 3. Motion table (verified/merged)

Conf = confidence. Method: RC = region_curve, TR = track.py / segmentation, ECC = affine registration, FC = frame-count zoom, VE = visual estimate.

### Chapter 1: title and script lyrics

| ID | Frames | ms | Element | Properties | From → To | Easing / spring | Conf | Method |
|---|---|---|---|---|---|---|---|---|
| A-E01 | 1-10 | 333 (tail); full fade est. ~600 | Loading overlay | opacity only (no scale, verified) | α .37→0 | Tail fit cubic-bezier(0.622,0.669,0.297,0.859), nearest ease-out. Build: 600 ms ease-in-out | .7 | RC |
| A-E02 | 19-55 | 1200 | Title shimmer | mask band position | Band, FWHM ≈100 px, glyphs fall to 0-3 % ink | **linear**, 15.5 px/f (466 px/s), ~33 ms/char, per-glyph dip ~370 ms. Subtitle untouched; blur ≤1 px | .85 | TR |
| A-E18 | 66 | 0 | Cursor | cursor image | Arrow → heart outline (13x12, #86736F) | step | .9 | FC |
| A-E03 | 82-92 | 370 | Title + subtitle exit | opacity, blur | 1 → 0; blur 0 → 8 px | Opacity easeOutQuad, cubic-bezier(0.182,0.734,0.858,0.999). Blur ramps **linearly** over the whole exit (no snap). Subtitle fades faster (gone by f89). No translate | .85 | RC + blur fit |
| A-E11 | 12-82 | 2333 | Top lilac cloud bank | translateX | Left part -3.7 px/f, right part -1.9 px/f (parallax) | linear | .5 | TR |
| A-E12 | 12-96 | ~2800 | God rays (static overlay, 15-25°) | opacity | In over f12-36, out with E13 by f96 | ease-in-out (VE) | .5 | high-pass VE |
| A-E13 | 82-104 | 730 | Top cloud dissolve | opacity | Saturated lilac → #D3C5CB wash | easeInOutCubic | .8 | RC |
| A-E14 | 111-135 | 800 | Centre pink cloud (backdrop) | opacity | Mist → #F5E9EC, starts 11 f before lyric | linear | .7 | RC (text-free patch) |
| A-M2 | 113-150+ | 1250-1700 | Side and top sky layers | opacity | Pale mist → richer lilac | Side banks ease-out; top band near-linear | .65 | RC |
| A-E15 | 122-178 | 1870 | "One Day." reveal | opacity, blur | α 0→1; blur 10→0 px | **ease-out** on both (cubic-bezier(0.696,0.803,0.138,0.710)); whole word, no stagger | .8 | joint scale/σ/α fit |
| A-E16 / B-02 | 128-190 | 2070 | "One Day." hold | rotate, scale | Starts tilted ~-5-6°. CW roll ~2-2.5°/s; scale +3 %/s around a fixed centre (~535,250) | linear | .6 | TR / ECC |
| A-E17 | 145-168 | 200 pop, 300 hold, 270 fade | Sparkle glint on "e" | opacity, scale | Dot → 10 px 4-point star → fade. A second glint on "Day" from ~f171 | ease-out pop | .65 | FC + RC |
| B-03 | 191-205 | 467 | "One Day." fly-through exit | scale, translate, blur, slight rotateY | Scale 1→~4.06 around (640,250); blur →10 px | easeInCubic-like, cubic-bezier(0.807,0.080,0.313,-0.058) | .8 | ECC + mask extent |
| B-04 | 200-206 | 200 | "One Day." opacity | opacity | 1 → 0 | ease-in; keyframes [1,1,.15,0] at [0,.5,.85,1] | .6 | saturation p99 |
| B-05 | 209-217 | 267 | "I Will" enter | opacity, blur 4→0, x | Upper-left, -12° baseline | cubic-bezier(0,0.083,0.429,1.114) ≈ easeOutCubic; spring ~850/84 | .75 | FC + saturation |
| B-M1 / B-06 | 204-236 | 1067 | Camera truck: clouds -2.2 px/f; "I Will" -5.5 px/f (scale 1→1.2, slight yaw) | translateX per layer | Text-to-cloud speed ratio ~2.4 | linear | .75 | TR |
| B-07 | 236-244 | 267 | "I Will" exit | scale →3.5, x/y up-left, blur | — | cubic-bezier(0.401,0.060,0.644,0.154) ≈ easeInCubic | .6 | VE edges |
| B-08 | 235-256 | 700 | Near petal (62-77 px, blurred) | translate (-9,+20)/f, tumble | 3-frame fade-in | ~linear | .7 | TR |
| B-09 | 243-247 | 233 | "Stop" enter (beat 243) | opacity, blur | — | easeOutCubic (cubic-bezier(0.410,1.177,0.448,0.927)) | .75 | saturation |
| B-10 | 247-256 | 300 | "Stop" hold | scale 1→1.1, +1 px/f | — | linear | .65 | TR |
| B-11 | 257-266 | 300 | "Stop" exit right | scale →2.5, x, blur | — | cubic-bezier(0.510,0.162,1.000,0.889) ≈ ease-in / easeInQuad | .6 | VE edges |
| B-12 | 264-267 | 100 | "falling in love" ghost | opacity, pixelate (10-14 px blocks), blur | 0 → ~0.3 | fast ease-out | .7 | FC |
| B-13 | 267-286 | 633 | "falling in love" per-glyph sweep | per glyph: opacity, blur, pixelate | Ghost → crisp #cf6cc3 | **stagger 42 ms**, ~70-100 ms per glyph, front ~33 px/f; white glints at the front | .85 | TR front |
| B-16 | 273-326 | 1800 | Falling-girl silhouette (25-30 % opacity, behind text) | y, rotate, scale, opacity | Top centre → horizon, then fades | cubic-bezier(0.608,0.350,0.608,0.870) ≈ easeInOutSine | .55 | VE bbox |
| B-15 | 286-306 | 667 | Mid petal | (-14,+22)/f, tumble | — | linear | .7 | TR |
| B-14 | 288-336 | 1600 | "falling in love" hold | rotate -4° around (460,375) | No scale change | linear, -2.5°/s | .8 | ECC |
| B-17 | 337-356 | 633 | "falling in love" exit (beat 337) | x +80 px, opacity | — | Position: ease-in to constant ~6.5 px/f (cubic-bezier(0.449,0.073,0.474,0.601)). Crisp layer fades with ease-in (0.760,-0.027,0.603,0.895) over f336-347 | .8 | TR + saturation |
| B-M2 | 348-356 | 300 | Echo trail | 2-3 offset copies fading | — | linear | .6 | FC |
| B-18 | 357-367 | 333 | "With you" per-glyph sweep | same as B-13 | — | **stagger 38 ms**, ~60 px/f | .8 | TR front |
| B-19 | 368-416 | 1600 | "With you" hold | scale 1→1.08, rotate +3.7° around (740,197) | — | linear | .85 | ECC |
| B-20 | 417-437 | 667 | Whole-scene tilt-up (text + clouds, not petals) | translateY up to -31 px/f, slight zoom | — | easeInQuad (cubic-bezier(0.492,0.003,1.000,0.926)); **abrupt stop**, no settle | .8 | TR |
| B-22 | 455-470 | 500 | Empty-sky grade | colour temperature | Lavender → warm cream, luma +5 | easeInOutSine / linear | .65 | RC |

### Ambient layers (whole range)

| ID | Frames | ms | Element | Properties | Speed / behaviour | Easing | Conf | Method |
|---|---|---|---|---|---|---|---|---|
| A-E04 | 11-39 | 967 | P1 petal (small, mid depth) | fade-in f11-13, translate, tumble | 19.7 px/f, heading flattens 45°→20° | linear | .8 | TR |
| A-E05 | 34-82 | 1600 | P2 hero near petal (~90 px) | translate, tumble, DOF blur | **24.9 px/f** (747 px/s), then sinks off the bottom edge ~10 px/f | linear | .75 | TR |
| A-E06 | 63-81 | 600 | S1 far petal | translate | ~9 px/f; passes **over** title text | linear | .65 | TR |
| A-E07 | 82-116 | 1130 | S2 lift arc + left-side petals | translate | S2 falls (-5.6,+4.1)/f, then rises (-6,-1.8)/f | linear + sway | .6 | TR |
| A-M1 | 87-99 | 400 | Pc mid-air spawn | opacity 0→1 over 130 ms, drift (-11,+3.5)/f | — | linear | .75 | TR |
| A-M3 | 63-107 | 1470 | S3 hovering at the edge | ±10 px wander | Eddy / low-wind pocket | noise | .6 | TR |
| A-E08 | 116-158 | 1400 | P4 falling-leaf petal | y 3 px/f, x sway ±45 px, ~1.6 s period, tumble | — | sine | .7 | TR |
| A-E09 | 145-158 | 430 | P5 | drifts right/down 4.4 px/f | — | linear | .6 | TR |
| A-E10 | 146-159 | 430 | P6 near-camera mid-air spawn | fade-in f146-149, ~20→12 px/f, grows 20→60 px | — | linear fade | .65 | TR |
| B-21 / C-10 | 145-800 | — | Petal system | 1-3 on screen. Far 10-20 px; mid 34-50 px at 3-5 px/f with ±47 px sway (~2 s period); near 60-125 px, blurred, 12-26 px/f | Screen-space; ignores camera; always falls | linear + sine | .75 | TR |

### Chapter 2: notepad typewriter

| ID | Frames | ms | Element | Properties | From → To | Easing | Conf | Method |
|---|---|---|---|---|---|---|---|---|
| C-01 | 474-486 | 433 observed (~320 intended) | Cream wash over backdrop | opacity | Luma 249 → 238.8; starts 2 f **before** the cut | linear (slowed by playback hitch) | .85 | RC |
| C-02 | 476-486 | ~330 | Notepad cut-in | translate, roll -2°→-3.4° | Arrives at ~13 px/f, then decelerates into drift | Build: cubic-bezier(0.2,0.6,0.35,1). Raw ease-in-out shape is a hitch artifact | .65 | TR |
| C-03 | 488-498 | 367 | Pad idle drift | translate | (-3.9,-2.7) px/f | linear | .8 | TR |
| C-04 | 499-523 | 800 | Typewriter "SOME ♥ / DAY," | visibility per glyph | S499 O501 M504 E508 ♥510 D514 A518 Y521 ,523 | step; ~100 ms stagger (16th notes) | .95 | FC |
| C-05 | 510 | 0 | Glossy 3D heart glyph (#e278be) | visibility | — | step | .9 | FC |
| C-06 | 488-568 | 2667 | Pad roll | rotateZ -3.2°→-90° | Peak 3.2°/f at f537-545 | cubic-bezier(0.792,0.030,0.503,0.837) (strong ease-in, soft out) | .85 | Hough edge |
| C-07 | 476-533 | 1900 | Pad push-in | scale ×1.64 + translate up-left | — | cubic-bezier(0.691,0.087,0.758,0.632) ≈ easeInQuad, no settle | .8 | bar length |
| C-08 | 534-577 | 1433 | Pad swoop exit | translate to top-left, roll | — | Continues C-06/07 | .8 | segmentation |
| C-M2 | 571-577 | 200 | Pad fade-out | opacity 1→0 | — | linear / ease-in | .85 | max saturation |
| C-M1 | 571-578 | 233 | Sky recolour (left pink glow) | cross-fade | #f8eaec → #f6dceb | linear | .7 | RC |
| C-09 | 480-529 | ~1500 | Confetti scraps (3-4 short-lived; #efa6e2 and #c262bd) | drift 4-8 px/f up / up-right; 3D flip (full flip ≈20 f) | Appear and vanish by turning edge-on | linear | .65 | FC + TR |

### Chapter 3: cards and rising sky

| ID | Frames | ms | Element | Properties | Path / speed | Easing | Conf | Method |
|---|---|---|---|---|---|---|---|---|
| C-11 / C-M5 | 580-630 | 1667 | SOME ONE card | translate polyline; rotate CW 0.6-0.8°/f | Headings 143.5° (28.6 px/f) → 119.7° (24.2) → 138.8° (21.3). Kinks 1-3 f after beats | linear per segment, step heading change | .8 | TR |
| C-12 / C-M5 | 604-654 | 1667 | WILL LIKE card (0.7x size, far) | polyline, ~no rotation | 76° (16.5) → 144° (19.7) → 114° (14.8) | linear segments | .8 | TR |
| C-13 | 633-668 | 1167 | ME card | rise up-right; rotate CCW 1.7°/f | Stagger 29 f after WILL LIKE | linear | .85 | segmentation |
| C-14 | 663-668 | 170-200 | ME fade-out | opacity .98→0 | Card keeps moving while fading | ease-out / easeInOutQuad | .85 | saturation |
| C-15 | 661-670 | 300 | Sky cross-dissolve to lavender | opacity | — | linear | .85 | RC |
| C-16 | 671-723 | 1733 | "LIKE I" | fade-in 3 f; rise 10→7 px/f, +2-4 px/f x | — | linear | .75 | TR |
| C-17 | 713-762 | 1667 | "LIKE" (big) | fade-in f713-715; rise from f718 at ~10 px/f | — | linear, no ease-in | .75 | TR |
| C-19 | 679-800 | 4000+ | Polaroids P1 (679), P2 (704), P3 (753) | rise 3.6-3.9 px/f; P1 tilt sway -6°→-14°→-2° | Half-period ~1.7 s | linear + sine | .8 | TR |
| C-M4 | 711 | 33 | Haze snaps over P2 | depth sort | — | step (artifact-like) | .7 | RC |
| C-18 | 762-803 | 1367 | "YOU." | per letter: Y762 O767 U771 .776 (~155 ms stagger, instant pops); rise 11-15 px/f; occludes photos | — | step + linear | .85 | FC + TR |
| C-20 | 769 | 33 | Haze snaps off P2/P3/YO | depth sort | — | step (artifact-like) | .55 | RC |
| C-21 | 770-800 | — | Puffy hearts (#e3c8dc) | rise 4.5 px/f, +0.7 px/f x | — | linear | .6 | TR |
| C-22 | 671-800 | — | Parallax system | Static sky. Speeds in vh/s: YOU 0.78, LIKE 0.52, LIKE I 0.36-0.52, hearts 0.23, photos 0.19-0.20; petals −0.65 (falling) | — | linear | .85 | TR + phase correlation |

### Scene changes and recording artifacts

| ID | Frames | Event | Notes |
|---|---|---|---|
| B-23 | 476 | Hard cut to the 3D chapter on the beat | ms 0; conf .9 |
| — | 56-61, 64-81, 196, 426-435, 475-479, 713-717 | Recording artifacts | C-23, C-M3. Do not reproduce. Preload and pre-warm heavy assets |

## 4. Reusable motion primitives

| Token | Spec | Source |
|---|---|---|
| `textEnterBlur` (short) | opacity 0→1, blur 4→0 px, 230-270 ms, cubic-bezier(0,0.08,0.43,1.11) / easeOutCubic | B-05, B-09 |
| `textEnterBlur` (dreamy) | opacity + blur 10→0 px, 1.8 s, cubic-bezier(0.70,0.80,0.14,0.71). Backdrop cloud fades in ~370 ms earlier | A-E15, A-E14 |
| `glyphMosaicSweep` | Whole line shown as a 30 % pixelated/blurred ghost; then per grapheme: opacity .3→1, blur 5→0, ~90 ms ease-out, stagger 38-42 ms (cap the line at ~0.65 s), white glint riding the front | B-12/13/18 |
| `typewriterPop` | Per grapheme `visibility` step every 60000/BPM/4 ms (~99 ms at 152 BPM), no caret, emoji pop the same way | C-04, C-18 (155 ms variant) |
| `livingHold` | Linear scale +1.5-5 %/s, roll ±2-2.5°/s, transform-origin off-centre (e.g. 70 % 40 %). Reset per card | A-E16, B-02/14/19 |
| `flyThroughExit` | Scale →2.5-4, blur →8-10 px, 270-470 ms ease-in (cubic-bezier(0.55,0,1,0.45)). Opacity holds, then falls over the last ~30 %. Rotate the direction between cards (in / up-left / right) | B-03/04/07/11 |
| `smearExit` | x +80 px, ease-in to constant speed, ~630 ms; crisp layer fades with ease-in in ~370 ms; 2-3 echo copies trail | B-17, B-M2 |
| `textExitBlur` | opacity easeOutQuad 370 ms + blur linear 0→8 px, no move | A-E03 |
| `shimmerMask` | Transparent mask band ~100 px wide, linear ~470 px/s, plays once ~0.6 s after reveal | A-E02 |
| `sparkleGlint` | 4-point white star, dot → 10 px in 200 ms ease-out, hold ~300 ms, fade ~270 ms; 1-2 per lyric | A-E17 |
| `sceneTilt` | Wrap text and clouds; y → -80 vh, easeInQuad ~670 ms, hard stop. Petals stay outside the wrapper | B-20 |
| `cameraTruck` | Parallax translateX: clouds 66 px/s, text 165 px/s, linear | B-M1 |
| `skyCrossfade` | Two stacked sky plates, opacity linear 230-330 ms, on every section change, synced with the outgoing hero's fade | C-01, C-15, C-M1, A-E13 (800 ms eased variant) |
| `heroCutIn` | Card appears already moving at ~390 px/s and decelerates over ~300 ms (cubic-bezier(0.2,0.6,0.35,1)) into a perpetual linear drift of ~140 px/s | C-02/03 |
| `swoopExit` | rotateZ → -90° with cubic-bezier(0.79,0.03,0.50,0.84) over ~2.7 s, starting with typing; scale ×1.64 easeInQuad; finish with opacity 1→0 over 200 ms | C-06/07/08/M2 |
| `beatPolylineFlight` | Card path = 3-4 linear segments, one per beat, heading changes 20-70° at each waypoint, speed −10 % per segment, linear rotate 0.7-1.7°/f. Stagger cards ~2-2.5 beats | C-11/12/13/M5 |
| `risingParallax` | Static sky; layers rise linearly at speeds set by depth (0.2-0.8 vh/s); petals fall at −0.65 vh/s; words fade in over 100 ms already moving | C-16..22 |
| `petalField` | 3 tiers (far 1-2 %, mid 4-5 %, near 6-12 % of viewport width). Mean wind (-8,+4) px/f plus curl noise, sine sway A 20-47 px with T 1.2-2 s, 3D tumble ~135-270°/s. Spawn at edges **and** mid-air with opacity 0→1 over 100-130 ms. Screen-space, rendered above text | A-E04..M3, B-21, C-10 |
| `cloudFadeIn` | Backdrop cloud mass 800 ms linear; side banks 1.2 s ease-out; top band 1.6 s linear | A-E14, A-M2 |
| `ghostSilhouette` | 25-30 % opacity shape falling behind the text, ~1.3-1.8 s easeInOutSine, fades out at the horizon | B-16 |

## 5. Transitions

1. **Loading → title** (f1-10): opacity dissolve only. Build at ~600 ms ease-in-out.
2. **Title → mist → lyric** (f82-135): text blur-out (370 ms) runs with the top cloud dissolve (easeInOutCubic, 730 ms). Then ~1 s of mist. Then the new backdrop cloud fades in (800 ms linear), and the lyric starts 11 frames later.
3. **Word → word** (f191-266): the exit flies past the camera with ease-in, followed by a 0-200 ms empty gap, then the next word blurs in with ease-out. Exits and entrances overlap by up to 2 frames.
4. **Phrase → phrase** (f337-357): smear-right exit, then immediately the mosaic ghost of the next phrase.
5. **Chapter end** (f417-476): whole-scene tilt-up with a hard stop, ~1.3 s of empty sky with a warm grade shift, a pre-wash at f474, then a **hard cut on the beat**.
6. **Notepad → cards** (f571-580): hero fades out (200 ms) during its swoop, the sky recolours (233 ms linear), 2-frame breath, and the next card enters on beat +2 frames.
7. **Cards → rising sky** (f661-671): last card fades out (170 ms) while moving and the sky cross-dissolves (300 ms linear). Next word fades in about 1 frame after the dissolve.

## 6. Style guide

### Palette (verified values)

| Hex | Role |
|---|---|
| #CEDEE6 | Loading panel sky blue |
| #F2E5DD / #F5E8E0 | Cream-peach page margin (feathered) |
| #FDFAF3 / #FDF9F1 | Main cream sky |
| #F6E6ED | Blush haze |
| #C6ACC7 / #C599C4 | Top lilac cloud band |
| #D1BACD | Light lilac cloud |
| #E6C8E2 | Pink cloud puff behind text |
| #F4E6ED / #F6E6EE | Lavender-pink sky centre (chapter 3) |
| #E4E2DD / #DBD3D2 | Lower fog / horizon band |
| #D0CFC9 | Bottom sage-grey fog |
| #DEAECC (core) / #E3B0D0 | Title sans pink |
| #E8D8DD | Subtitle (muted mauve, low contrast) |
| #EBA7E6 / #EAA7E4 | "One Day." script core (orchid) |
| #F6D9EF | Script inner gloss |
| #E18BD7 | "I Will" |
| #EAA7DF | "Stop" |
| #CF6CC3 / #D06BC4 | Condensed script ("falling in love", "With you") |
| #FED8EF | Text glow halo |
| #FFFFFF | Sparkle glints |
| #ECA1C0 / #F3C9D5 | Near petal centre / translucent rim |
| #D376AC / #C2689D | Mid petal / petal shadow side |
| #E5A9C5 | Near petals (chapter 3) |
| #D678C6 | Falling-girl silhouette (~25-30 % opacity) |
| #86736F | Heart cursor stroke |
| #F8F0EE / #E8DBDC | Notepad paper / grid lines |
| #F6BFED / #D974CE / #D0A8C8 | Binding bar top / front / pad thickness |
| #C16DDD | Typed lyric violet |
| #E278BE | Glossy 3D heart emoji |
| #E48DB9 (dots #EBBBC9) | SOME ONE card |
| #BA84B3 (lighter dots) | WILL LIKE card |
| #DC98D1 | ME card |
| #FDF8F0 | Card border / cream 3D letter face |
| #EFA6E2 / #C262BD | Confetti tones |
| #F6E7EF face / #E8B8D9 side | "LIKE" ghost emboss (face ≈ sky colour) |
| #F5E3ED / #ECC5DD | "YOU." marshmallow extrusion |
| #B87C9A (#9F6A8B shadows, #E0B3C9 highlights) | Pink-tinted photo tones |
| #E3C8DC | Puffy heart |

Global vignette: a multiply gradient over **all** content, about `linear-gradient(to bottom, rgba(150,110,150,.25) 0%, transparent 28%, transparent 70%, rgba(150,140,140,.18) 100%)`. Add 1-2 % noise to gradients to avoid banding.

### Typography

Vietnamese-capable alternatives are given for every face. Many script fonts lack the stacked diacritics Vietnamese needs (ắ, ỗ, ự), so test them.

| Role | Observed | Likely font | Vietnamese-safe alternative |
|---|---|---|---|
| Title | Bold neo-grotesque, cap 24 px, ~3.3vw | Inter Bold | Inter, Be Vietnam Pro Bold, Plus Jakarta Sans (vi) |
| Subtitle / caption | Medium sans, ~12-14 px, low contrast | Inter Medium | Be Vietnam Pro Medium |
| Loading heading | Light italic high-contrast serif, lowercase | Playfair Display Italic / Cormorant Garamond Italic | Playfair Display (has vi), Cormorant Garamond (vi), Lora Italic |
| LOADING label | Tiny serif caps, ~0.3em tracking | Cormorant / Cinzel | Cormorant Garamond caps (Cinzel lacks vi) |
| Copperplate lyric ("One Day.", "I Will", "Stop") | Hairline-contrast pointed-pen script, looped capitals, inner gradient | Pinyon Script (best match) / Great Vibes | Great Vibes (vi subset), Dancing Script (vi, simpler), Charm (vi). Pinyon Script lacks full vi: verify |
| Condensed tall-ascender lyric ("falling in love", "With you") | Tiny x-height, ~30° slant, heavy contrast | Tangerine Bold / Italianno (Parisienne as fallback) | Italianno (vi), Allura (vi), Alex Brush (vi), Imperial Script (vi) |
| Flat typed lyric | Wide heavy grotesque, large comma | Arial Black / Archivo Black | Archivo Black (vi), Be Vietnam Pro Black, Montserrat Black (vi) |
| Card 3D letters | Heavy caps, softened corners, bevel | Rubik Black / Archivo Black | Rubik Black (vi), Montserrat Black |
| "LIKE" 3D | Sharp extruded caps | Montserrat Black | Montserrat Black (vi) |
| "YOU." puffy 3D | Rounded "marshmallow" bevel | Nunito Black / Fredoka | Nunito Black (vi), Baloo 2 ExtraBold (vi) |

### Illustration and texture

- Airbrushed photographic/CG cloud plates without grain, layered 2.5D.
- A watercolour bouquet on the loading card.
- Photoreal satin rose petals: vein gradient, translucent rim, DOF blur on near petals.
- Glossy satin script text with a soft lavender halo (8-12 px, ~15 %).
- Mosaic ghost glyphs (10-14 px blocks).
- Simple 3D props: a box notepad with a graph-paper texture, polka-dot paper cards with white borders and slight curl, extruded and puffy text meshes, polaroid planes, matte puffy hearts, a glossy heart emoji.
- A depth-sorted white haze plane.
- **No drop shadows.** Depth comes from blur, haze, extrusion, parallax and size.

### Layout

- Full-bleed 16:9.
- One lyric unit at a time, 20-72 % of frame width, placed in a zig-zag (upper-left, right third, diagonal, right-centre, bottom-left).
- Baselines tilted -13° to +12°.
- Petals in screen space, z-ordered above text.
- Sky in three horizontal bands: lilac top, cream centre, grey-beige horizon.

### UI components

Loading card (inset ~9 px panel with feathered edge, heading, illustration, LOADING label, 32x2 bar); title card (song + artist); lyric layer; heart cursor (desktop); notepad message card; lyric sticker card (border, dots, 3D letters, icon accent); polaroid tile with pink tint; floating 3D word and heart layers.

## 7. Interaction flow (source + mapping to the app)

The source is passive: no clicks are visible, and the only interactive signal is the state-driven heart cursor at f66. Recommended mapping:

1. **Tap to open** (needed for audio autoplay on mobile).
2. **Loading card** ("gửi em / my sweetheart" + illustration) dissolves into the title card: song and sender.
3. **Love letter:** lines use `glyphMosaicSweep` or `textEnterBlur`, then `livingHold`, then `flyThroughExit`, alternating direction. Allow an optional tap-to-advance with turnaround under 0.7 s.
4. **Chapter breath:** `sceneTilt`, an empty sky, and a "Chạm để tiếp tục" prompt. Use this time to preload the next assets.
5. **Notepad note:** `typewriterPop` at 16th notes, then `swoopExit`.
6. **Memory cards:** `beatPolylineFlight`.
7. **Photo memories / photobooth strip:** `risingParallax` with polaroids and the partner's name revealed letter by letter (the "YOU." climax).

For the photobooth: countdown digits can use `typewriterPop` on beats, the flash can use a `skyCrossfade`-style 230 ms white wash, and printed strips can rise using the `risingParallax` polaroid spec.

Respect prefers-reduced-motion: static holds, petals off.

## 8. Pacing and audio sync

- Tempo 152 BPM, one beat = 11.84 frames (395 ms). Text follows lyric timestamps (LRC-style) quantised near the grid.
- **Exact beat hits:** "Stop" enter (243), first crisp glyph of "falling in love" (267), its exit (337), the cut (476), pad settle (488), typed S/♥/Y (499/510/521), swoop start (533), ME fade and sky dissolve (663 onset).
- **±1-3 frames:** "One Day." start (122 vs beat 124), shimmer (19-55 ≈ beats 18-53), "I Will" (209), "With you" (357 vs 361), tilt (417), card entries (+2 frames after beats 578/602), YOU letters.
- **Holds:** One Day ≈ 6.5 beats, I Will ≈ 3, Stop ≈ 2, falling in love ≈ 8, With you ≈ 7, breath ≈ 3. Card stagger ≈ 2-2.5 beats.
- Ambient layers (petals, clouds, drift) are not beat-locked.
- **Rule:** drive everything from `audio.currentTime`. Entrances on the beat (or +1 frame), exits about one beat before the next entrance, holds quantised to 2/4/8 beats.

## 9. Coverage check (metrics v2.csv, frames 1-800, mad>0.8 or flow_mean>0.4)

There are 626 burst frames, grouped as 2-10, 15, 19-27, 30-50, 53-55, 62-67, 74-89, 93, 122, 135, 141, 145-254, 257-319, 331, 337-409, 412-438, 464, 474-670 and 673-800. All of them map to merged events:

| Frames | Explained by |
|---|---|
| 2-10 | E01 |
| 15-55 | P1, P2, shimmer, cloud drift |
| 62-67, 74-89 | P2/S1 catch-up after the stall, duplicate frames, title exit, S2, Pc |
| 93 | S1/S2 plus cloud dissolve |
| 122-150 | Lyric onset, P4, P5, P6 |
| 145-254 | One Day hold/exit, I Will, truck, near petal, Stop |
| 257-319 | Stop exit, sweep, girl, petal |
| 337-409 | Smear exit, With you, hold petals |
| 412-438 | Tilt |
| 474-670 | Pre-wash, cut, pad, cards, fades |
| 673-800 | Rising layers, plus the 1x/2x cadence |

Frames 94-121 contain no bursts, which matches the mist breath.

**Residual, not design events:**
- f331: isolated blip (mad .80, flow .22), likely compression.
- f464: luma-only change inside the B-22 grade shift (flow < 0.03).
- f695: compression refresh, zero net change.
- f106: TikTok watermark relocation (below threshold anyway).
- f711 and f769: haze snaps, logged as events with artifact suspicion.

## 10. Open questions and low-confidence items

- The loading fade's start and full duration are unknown (only the tail was recorded). It is also unknown whether a tap-to-open preceded it.
- It is unknown whether the shimmer loops; only one pass was seen.
- Cloud drift tracking is weak (conf .5), and the god rays are a visual estimate (.5).
- True 3D (WebGL) vs 2D layers: anisotropic scaling, the depth-sorted haze and extrusion suggest a 3D engine, with petals on a separate 2D overlay.
- Exact fonts are unconfirmed. The best guesses are Pinyon Script and a Tangerine/Italianno-class condensed script, with Archivo/Rubik/Montserrat/Nunito Black for the 3D chapter.
- Fly-through scale above ~2.6 is ±10 %. The I Will and Stop exit scales are visual estimates (.6).
- The falling-girl silhouette's entry and source are uncertain (.55).
- The haze snaps at 711 and 769 are probably renderer depth-sort artifacts (.55-.7).
- The notepad entry easing is distorted by the f475-479 hitch. The intended curve is inferred (.65).
- The heart cursor may be state-driven or hover-driven (probably state-driven).
- Card rotateX/rotateY wobble could not be measured beyond in-plane angle.
- The first frames of the second puffy heart (~796) were not measured.
