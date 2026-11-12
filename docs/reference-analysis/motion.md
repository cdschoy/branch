# Motion System: digital gift card + self-photobooth

This document turns the five verified frame-level reports into one motion language for both products:

- **(A) the gift card.** The partner opens a link and gets the envelope, box or booth reveal, then the letter, photos, songs and memories.
- **(B) the self-photobooth.** Camera, countdown, flash, strips, frames and stickers, download and share.

Every token and primitive cites its evidence as `vN fA-B`: video N, frames A to B at 30 fps. 1 frame is 33.3 ms. v1 and v4 were captured at 25 fps and upsampled, so their timings are ±1 frame (about 40 ms).

The machine-readable twin of this file is `motion-tokens.json` in the same folder. `springs.json` holds the simulated spring curves.

**IP rule.** The doc reproduces *motion feel*: curves, durations, choreography and density. It never copies the reference art, names or brands, or the licensed mascot from v3. All flowers, envelopes, boxes, booths, treats and characters must be **original illustration**. Brand and person names that appear in the reports ("Emma & Liam", "Noah", the third-party media players) are not used here. The UI copy below is our own Vietnamese.

---

## 0. How to read and use this doc

- Implementation targets **Motion for React** (`motion/react`; `framer-motion` has the same API). CSS fallbacks use only `transform`, `opacity`, `clip-path` and `filter` (filter is only on the high tier).
- All tokens live in one module and are imported everywhere. Never write a raw cubic-bezier in a component.

```ts
// src/motion/tokens.ts  (generated from motion-tokens.json)
import tokens from "./motion-tokens.json";
export const D = tokens.duration;          // ms
export const E = tokens.easing;            // [x1,y1,x2,y2] arrays (Motion accepts these)
export const S = tokens.spring;            // {stiffness,damping,mass}
export const s = (ms: number) => ms / 1000; // Motion wants seconds
export const sp = (name: keyof typeof S) => ({ type: "spring" as const, ...S[name] });
```

```css
/* src/motion/tokens.css (generated) */
:root{
  --d-instant:0ms; --d-frame:33ms; --d-micro:70ms; --d-xfast:100ms; --d-fast:133ms;
  --d-quick:167ms; --d-base:200ms; --d-crossfade:240ms; --d-move:280ms; --d-modal:300ms;
  --d-dip:333ms; --d-flip:430ms; --d-drawer:500ms; --d-drawer-long:570ms; --d-dock:610ms;
  --e-standard:cubic-bezier(.25,.1,.25,1);      --e-out-quad:cubic-bezier(.25,.46,.45,.94);
  --e-out-cubic:cubic-bezier(.33,1,.68,1);      --e-out-quart:cubic-bezier(.25,1,.5,1);
  --e-drawer:cubic-bezier(.18,1,.49,.98);       --e-dock:cubic-bezier(.27,.85,.27,.98);
  --e-in-out-cubic:cubic-bezier(.67,-.03,.37,1);--e-in-out-sine:cubic-bezier(.37,0,.63,1);
  --e-in-out-quad:cubic-bezier(.45,0,.55,1);    --e-out-back:cubic-bezier(.22,.94,.32,1.15);
  --e-in:cubic-bezier(.42,0,1,1);               --e-in-quad:cubic-bezier(.55,.085,.68,.53);
  --e-in-cubic:cubic-bezier(.55,.055,.675,.19); --e-fly-out:cubic-bezier(.55,0,1,.45);
  --e-curtain-fall:cubic-bezier(.545,.136,.895,.882); --e-hero-cut-in:cubic-bezier(.2,.6,.35,1);
  --e-paper-in:cubic-bezier(.66,.215,1,1.146);
}
```

---

## 1. Tokens

### 1.1 Duration tokens

The ladder is quantised to 30 fps frames because that is what the evidence resolves.

| Token | ms | Frames | Use | Evidence |
|---|---|---|---|---|
| `instant` | 0 | 0 | Status text, hint pill removal, glyph swaps, sprite swaps, chrome mount and unmount | v1 f24, f84, f203 (status pill step); v4 f91 (pill + FAB hard cut), f308; v5 f266/312/364 (status line), f405 |
| `frame` | 33 | 1 | Single-frame charms, rays, shockwave ring, typewriter glyph step | v4 f167+ (heart charm 1–2 f), f580 (ring); v3 M03 (glyph ≤17–33 ms) |
| `micro` | 70 | 2 | Stamp exit, press squash release, note bubble pop | v1 f36–37 (digit exit 50–70); v4 B16 (squash ~70), B18 (note 70–100) |
| `xfast` | 100 | 3 | Prop clear, stamp settle, UI out before a finale, caption fade, envelope fade-out | v4 f204–206 (props 100), f570–572 (CTA out 100), B9 (caption 100); v1 f30–32 (stamp settle 100); v5 f65–67 |
| `fast` | 133 | 4 | Prompt fade-out, ease-in whip-off, micro-holds between stages | v5 f33–36 (prompt 133 linear); v4 f130–133 (ribbon whip 133), f571–574 (hold 133) |
| `quick` | 167 | 5 | Tooltip rise, sticker pop, pill fade-in, flash decay, letter transform | v4 A11 (167), B8 (167); v3 M17 (167); v1 f70–74 (flash 167), f244–248 (letter transform 170) |
| `base` | 200 | 6 | Flash tick envelope, starburst life, controls fade-in, timed-prompt fade-in, hover grow | v1 f54–60 (flash 200), f55–82 (starburst 200); v4 D7 (200); v5 f152–158 (200), B-M2 (200) |
| `crossfade` | 240 | 7 | Page crossfade, caption fade, flash cadence | v3 M05/M06/M21/M22 (140–270, token 240); v1 f112–119 (caption 230), flash peaks f55/62/70/77 (240 apart) |
| `move` | 280 | 8 | Lid flip, hero layout move, polaroid deal | v4 f136–143 (lid 280), f204–211 (box move 280), C5 (~280) |
| `modal` | 300 | 9 | Scrim and letter opacity (open and close) | v1 f244–252 (300), f422–431 (300) |
| `dip` | 333 | 10 | Artwork state crossfade with paper dip, hint ring (fast) | v5 f44–54 (333); v1 f14–23 (ping 330); v4 f97–106 (ring #2 300) |
| `toss` | 600 | 18 | Strip toss (367 on the first strip) | v1 f137–155, f180–198 (600); f101–112 (367) |
| `flip` | 430 | 13 | Shared-element lightbox FLIP | v4 f522–534 (433) |
| `drawer` | 500 | 15 | Side drawer slide (spring equivalent) | v4 f310–325 (500) |
| `drawerLong` | 570 | 17 | Off-canvas popover drawer | v5 f405–422 (570) |
| `dock` | 610 | 18 | Media dock slide-in | v1 f209–228 (610 x, 430 α) |
| `curtainDrop` | 1530 | 46 | Flower wall falls away to reveal the page | v5 f189–235 (1533) |
| `flowerWipe` | 1370 | 41 | Falling-flower cover wipe (scene change) | v1 f473–513 (1367) |
| `gravityCurtain` | 2230 | 67 | Intro flower curtain dissolve | v4 f4–71 (2233) |
| `bloomBurst` | 3270 | 98 | Radial bloom to full-bleed | v5 f58–156 (3267) |
| `finaleCover` | 1200 | 36 | Tap to full flower cover in the finale | v4 f570–606 (≈1200) |

**Ambient periods** (loops that never stop while idle):

| Token | ms | Evidence |
|---|---|---|
| `swayTrapezoid` | 800 | v4 A6 milkshake sway, f97→ (24 f period) |
| `hintRing` | 800 | v4 A7, f68–91 |
| `reelRev` | 1100 | v5 B-06, f364→ (10.9–11.0°/f) |
| `pendulum` | 2350 | v1 #1, curtain, f1–644 (asymmetric legs: 0.9 s and 1.47 s) |
| `float` | 3000 | v5 A-m01, envelope, f1–31 |
| `breeze` | 4800 | v1 #54, f542–644 (4.4–5.2 s) |
| `handheld` | 6990 / 2730 / 9000 | v2b F01, three incommensurate sines, f1261–1676 |

### 1.2 Easing tokens (cubic-bezier)

Measured fits were normalised to the nearest well-behaved curve. The raw fit is kept where it carries the feel.

| Token | cubic-bezier | Character | Evidence (raw fit) |
|---|---|---|---|
| `linear` | (0,0,1,1) | Physical constant speed: print feed, flash decay, flower fall, reels, petals, scrim of the lightbox | v1 f90–101 (print linear), f54–82 (flash), f473–513 (flowers); v4 D5 (scrim linear); v5 B-06 |
| `standard` | (.25,.1,.25,1) | CSS `ease`: reading-UI opacity (scrim, captions, chips) | v1 f244–252 (fit .386,.526,.224,.934), f112–119; v3 M21 (.246,.297,.485,1.088) |
| `outQuad` | (.25,.46,.45,.94) | Soft opacity in | v5 B-09 drawer fade; v4 D7 controls; v3 M10 |
| `outCubic` | (.33,1,.68,1) | Page crossfade, pill in, hand-in slide | v3 M05 (.150,.187,0,.814), M06, M22; v2b E15 (.309,.902,.510,.998) |
| `outQuart` | (.25,1,.5,1) | Tooltip, drawer x (tween form) | v4 A11 (rmse .053), C9 (rmse .015) |
| `drawer` | (.18,1,.49,.98) | Long glide that is solid early | v5 B-08 f405–422 |
| `dock` | (.27,.85,.27,.98) | Media dock slide | v1 #37 f209–228 |
| `inOutCubic` | (.67,-.03,.37,1) | One-curve hero moves: lid flip and re-centre, layout moves | v4 B7 (.681,-.046,.394,1.017), C2 (.670,-.013,.343,.983) |
| `inOutSine` | (.37,0,.63,1) | Ambient sway, idle wobble legs, breathing zoom | v1 #1 (.37,.02,.59,1.04); v3 M14; v2b E20 (.413,.027,.616,.950) |
| `inOutQuad` | (.45,0,.55,1) | Programmatic scroll, whip-pan | v4 D1 (rmse .025); v2b E09 (.534,.121,.458,1.009) |
| `outBack` | (.22,.94,.32,1.15) | Small rewards only: sticker, badge, note | v4 B8 (.219,.942,.321,1.148) |
| `letterPop` | (.43,.91,.19,1.33) | Letter card arrival (1.2% overshoot from .93) | v4 C3 (.425,.913,.193,1.327) |
| `overshootFlip` | (.34,1.56,.64,1) | Lightbox shared element (tween form of `spring.lightbox`) | v4 D6 (rmse .04) |
| `in` | (.42,0,1,1) | CSS `ease-in`: thrown hero, exits | v4 D12 (rmse .012) |
| `inQuad` | (.55,.085,.68,.53) | Whip-off exit, scene tilt-up | v4 B5 (rmse .019); v2a B-20 (.492,.003,1,.926), B-11 |
| `inCubic` | (.55,.055,.675,.19) | Fly-through exit, push-in | v2a B-03 (.807,.08,.313,-.058), B-07; v2b E21 (.576,-.03,1,.885) |
| `flyOut` | (.55,0,1,.45) | Lyric exits past the camera | v2a primitive `flyThroughExit` |
| `curtainFall` | (.545,.136,.895,.882) | Wall drop that never decelerates | v5 A-e12 f189–235 |
| `paperIn` | (.66,.215,1,1.146) | Incoming layer of a paper-dip crossfade | v5 A-e05 |
| `bloomCoverage` | (.164,.529,.662,.97) | Overall bloom coverage over time | v5 A-e08 |
| `bloomSprite` | (.17,.06,.19,.6) | Per-sprite radial push | v5 A-e08 |
| `heroCutIn` | (.2,.6,.35,1) | Element that arrives already moving, then decelerates into drift | v2a C-02 |
| `swoop` | (.79,.03,.5,.84) | Long ease-in roll and push-away | v2a C-06 |
| `cameraTilt` | (.65,0,.48,.88) | World-camera phrase move | v2b E01 |
| `cameraSwing` | (.33,0,.41,1) | World-camera swing-back | v2b E12 |
| `focusPush` | (.46,0,.62,.99) | Push into a memory (match-cut) | v2b T01 |
| `textIn` | (0,.08,.43,1.11) | Short blur-in of a lyric word | v2a B-05, B-09 |
| `steps1` | `steps(1)` | Shake jitter, sprite frames | v1 #18 f54–79 |

### 1.3 Spring presets

Each preset was simulated (`springs.py`, from rest to 1, settle at 0.1%), so the overshoot and settle values are computed rather than guessed. Every preset has a `linear()` CSS twin in `motion-tokens.json` under `spring.*.cssLinear`.

| Name | stiffness | damping | mass | ζ | Overshoot (of travel) | Settle | Use | Evidence |
|---|---|---|---|---|---|---|---|---|
| `stamp` | 3000 | 48 | 1 | .44 | 21% (from 1.12 that gives the measured 2.5–3% dip) | ~100 ms visible, 356 ms to 0.1% | Countdown digits, beat badges. Mount at scale 1.12 | v1 f30–32, f38–41, f47–49 (k3000 c45–50) |
| `sticker` | 3500 | 85 | 1 | .72 | 3.6% | 205 ms | Sticker, badge and reward pops (from 0) | v4 B8 f143–148 (peak 1.04, fit 3466/90) |
| `toss` | 180 | 17 | 1 | .63 | 7.6% (.29→1 peaks at 1.054) | 830 ms | Strip and polaroid toss scale | v1 #23 (370/24), #27 (168/17), #31 (143/15) |
| `letterPop` | 812 | 32 | 1 | .56 | 11.7% (.93→1 peaks at 1.008–1.012) | 490 ms | Letter card arrival | v4 C3 f205–212 |
| `lightbox` | 490 | 29 | 1 | .66 | 6.5% (.17→1 peaks at about 1.055) | 520 ms | Shared-element thumb → hero | v4 D6 f522–534 (fit 490/33; damping 29 reproduces the measured 5.35% scale peak) |
| `modal` | 600 | 40 | 1 | .82 | 1.1% | 390 ms | Letter card y/scale (optional instead of the tween) | v1 #40, #45 (~600–900/40) |
| `chromeNudge` | 500 | 36 | 1 | .80 | 1.3% | 425 ms | Corner chrome settle, CTA bump | v1 #2 f4–8 (500/36) |
| `drawer` | 400 | 45 | 1 | 1.12 | 0 | 620 ms | Side drawer x | v4 C9 (386–441 / 44–55) |
| `dock` | 935 | 118 | 1 | 1.93 | 0 | 820 ms | Media dock x (overdamped) | v1 #37 |
| `handPresent` | 127 | 31 | 1 | 1.38 | 0 | 1470 ms | Hand slides a photo in | v2b E15 f1005–1040 |
| `settle` | 207 | 28 | 1 | .97 | 0 | 620 ms | Post-dissolve settle | v2b T05 f1250–1261 |
| `pendulum` | 46 | 3.8 | 1 | .28 | impulse swing | 3.5 s | Curtain or hanging prop after a disturbance | v1 #53 f503–545 (P .93 s, τ .53 s) |

**Rule:** only `stamp`, `sticker`, `toss`, `letterPop` and `lightbox` overshoot. Everything that moves a large surface (drawer, dock, modal, page, lid) is critically damped or overdamped.

### 1.4 Stagger and rhythm tokens

| Token | Value | Evidence |
|---|---|---|
| `stagger.polaroidDeal` | 150 ms | v4 C5 f216/217/221 |
| `stagger.pennants` | 67 ms | v4 B11 f146/148/149 |
| `stagger.glyphSweep` | 38–42 ms (line capped at 650 ms) | v2a B-13 (42), B-18 (38) |
| `stagger.glyphScene` | 50 ms | v2b D13, E02–E05 |
| `stagger.glyphPhoto` | 67–100 ms, 67 ms linear fade each | v2b F05–F07 |
| `stagger.typewriter` | `min(127, 3220 / n)` ms per grapheme | v3 M02/M08/M13/M19/M24 |
| `stagger.typewriterStart` | `clamp(1.6 × ms, 60, 200)` ms | v3 §3 |
| `stagger.flashTick` | 240 ms reference; product uses a 1.2–2.5 s re-countdown | v1 f55/62/70/77 |
| `stagger.digit` | 280 ms reference; product uses 800–1000 ms | v1 f30/38/47 |
| `hold.micro` | 67–133 ms between stages | v4 f127–129, f134–135, f571–574; v5 f40–43, f55–57 |
| `beat` | `60000 / BPM` ms; sixteenth = beat/4 | v2a C-04 (glyph per 16th at 152 BPM) |

---

## 2. Primitive catalog (43 primitives in 7 families: enter, exit, emphasis/feedback, ambient, transition, camera, text)

Format: **params**, **evidence**, then a **Motion** snippet and a **CSS** snippet. Snippets assume the `D/E/S/s/sp` helpers from §0.

### ENTER

#### P01 `stampPop`: countdown digit or beat badge
- **Params:** mounts at full opacity. Scale 1.12 → 1 with `spring.stamp` (frame 1 ≈1.05, a 2.5–3% dip, visually settled in 100 ms). Exit is opacity only, 60–70 ms linear, with no scale.
- **Evidence:** v1 f30–37 ("3"), f38–46 ("2"), f47–54 ("1").
```tsx
<AnimatePresence mode="popLayout">
  <motion.div key={n} initial={{ scale: 1.12, opacity: 1 }} animate={{ scale: 1 }}
    exit={{ opacity: 0, transition: { duration: s(D.micro), ease: "linear" } }}
    transition={sp("stamp")} />
</AnimatePresence>
```
```css
.stamp{animation:stamp 356ms var(--spring-stamp) both}
@keyframes stamp{from{transform:scale(1.12)}to{transform:scale(1)}}
/* --spring-stamp = linear(...) from tokens.spring.stamp.cssLinear (scale range 1.12→1) */
```

#### P02 `stickerPop`: small reward (sticker, badge, unlocked note)
- **Params:** scale 0 → 1 with `spring.sticker` (peak 1.036), or the tween `outBack` over 167 ms. Opacity 0 → 1 over the first 67 ms. **Only for objects under about 15% of the viewport.**
- **Evidence:** v4 B8 f143–148 (0 → .80 → 1.02 → 1.04 → 1.00).
```tsx
<motion.img initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
  transition={{ scale: sp("sticker"), opacity: { duration: 0.067 } }} />
```
```css
.sticker{animation:pop var(--d-quick) var(--e-out-back) both}
@keyframes pop{from{transform:scale(0);opacity:0}30%{opacity:1}to{transform:scale(1)}}
```

#### P03 `letterPop`: the letter card arrives
- **Params:** opacity .18 → 1 over 67 ms. Scale .93 → 1.012 → 1 with `spring.letterPop` (230 ms visible). Optional 1–2° rotate settle. Starts about 30 ms after the hero begins its layout move.
- **Evidence:** v4 C3 f205–212.
```tsx
<motion.article initial={{ opacity: 0.18, scale: 0.93, rotate: -2 }}
  animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
  transition={{ opacity: { duration: 0.067 }, default: sp("letterPop") }} />
```
```css
.letter-in{animation:letter 230ms cubic-bezier(.43,.91,.19,1.33) both}
@keyframes letter{from{opacity:.18;transform:scale(.93) rotate(-2deg)}to{opacity:1;transform:scale(1) rotate(-1.5deg)}}
```

#### P04 `polaroidDeal`: memories fan in
- **Params:** each card: opacity 0 → 1 over 280 ms `standard`, y +5…+12 px → 0 and scale .90 → 1.02 → 1 over 120–160 ms `outQuad` (≤2% overshoot), rotate from (target − 5°) to the target. Stagger 150 ms. A second deal stacks on top of the first, about 8 px lower with a new tilt, staggered 100–170 ms.
- **Evidence:** v4 C5 f212–228, C6 f226–237.
```tsx
const deal = { hidden: { opacity: 0, y: 10, scale: 0.9 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.15, opacity: { duration: s(D.move), ease: E.standard },
                  default: { duration: 0.16, ease: E.outBack } } }) };
{photos.map((p, i) => <motion.img key={p.id} custom={i} variants={deal}
   initial="hidden" animate="show" style={{ rotate: p.tilt }} />)}
```
```css
.deal{animation:deal 280ms var(--e-out-quad) both;animation-delay:calc(var(--i)*150ms)}
@keyframes deal{from{opacity:0;transform:translateY(10px) scale(.9) rotate(calc(var(--tilt) - 5deg))}
 60%{transform:translateY(0) scale(1.02) rotate(var(--tilt))}to{opacity:1;transform:scale(1) rotate(var(--tilt))}}
```

#### P05 `drawerSlide`: extras drawer and media dock (non-modal)
- **Params:**
  - **Variant A (side drawer):** x +175 px (or `calc(100% + 19px)`) → 0 with `spring.drawer` (≈ `outQuart` 500 ms). Opacity 0 → 1 over 350 ms `standard`.
  - **Variant B (popover):** x `calc(-100% - 19px)` → 0 over 570 ms `drawer`. Opacity 320–370 ms `outQuad`, so the drawer is solid well before the glide ends.
  - **Dock:** +228 px → 0 over 610 ms `dock`, opacity 430 ms.
  - All variants: **no scrim**, the page stays live, heavy shadow `0 16px 44px rgba(20,8,12,.6)`, zero overshoot.
- **Evidence:** v4 C9 f310–325; v5 B-08/B-09 f405–422; v1 #37 f209–228.
```tsx
<motion.aside initial={{ x: "calc(100% + 19px)", opacity: 0 }} animate={{ x: 0, opacity: 1 }}
  exit={{ x: "calc(100% + 19px)", opacity: 0, transition: { duration: 0.24, ease: E.in } }}
  transition={{ x: sp("drawer"), opacity: { duration: 0.35, ease: E.standard } }} />
```
```css
.drawer{transform:translateX(calc(100% + 19px));opacity:0;
 transition:transform var(--d-drawer-long) var(--e-drawer),opacity 350ms var(--e-out-quad)}
.drawer[data-open]{transform:none;opacity:1}
```

#### P06 `textBlurIn`: a lyric or line enters
- **Params:**
  - **Short:** opacity 0 → 1 and blur 4 → 0 px over 230–270 ms `textIn`.
  - **Dreamy:** blur 10 → 0 px over 1.8 s `outCubic`, with the backdrop cloud fading in about 370 ms earlier.
  - **Low tier:** replace the blur with scale .98 → 1 (see §5).
- **Evidence:** v2a B-05 f209–217, B-09 f243–247 (short); A-E15 f122–178 and A-E14 (dreamy).
```tsx
<motion.h2 initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }}
  transition={{ duration: 0.25, ease: E.textIn }} />
```
```css
.blur-in{animation:blurIn 250ms var(--e-out-cubic) both}
@keyframes blurIn{from{opacity:0;filter:blur(4px)}to{opacity:1;filter:none}}
```

#### P07 `tooltipRise`: hint or tooltip next to chrome
- **Params:** opacity 0 → 1 and y +1.25 px → 0 over 167 ms `outQuart`, mounted with or right after its anchor.
- **Evidence:** v4 A11 f97–101.
```tsx
<motion.div initial={{ opacity: 0, y: 1.25 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: s(D.quick), ease: E.outQuart }} />
```
```css
.tip{animation:tip var(--d-quick) var(--e-out-quart) both}
@keyframes tip{from{opacity:0;transform:translateY(1.25px)}}
```

#### P08 `timedPrompt`: the "Chạm để mở / Chạm để tiếp tục" prompt
- **Params:** opacity 0 → .85 over 200 ms `outQuad`, at a fixed offset after the triggering spectacle. The reference uses +4.0 s after the tap, before the burst fully settles. Soft text-shadow. **Removed instantly** on the next tap.
- **Evidence:** v5 A-e10 f152–158, A-e11 f189.
```tsx
<motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.85 }}
  transition={{ delay: 4.0, duration: s(D.base), ease: E.outQuad }}
  exit={{ opacity: 0, transition: { duration: 0 } }}>Chạm để tiếp tục</motion.p>
```
```css
.prompt{opacity:0;animation:fadeTo85 200ms var(--e-out-quad) 4s forwards}
@keyframes fadeTo85{to{opacity:.85}}
```

#### P09 `heroCutIn`: arrives already moving
- **Params:** mounts at its first frame with a velocity of about 390 px/s, decelerates over 300 ms with `heroCutIn` into a perpetual linear drift of about 140 px/s or about 0.4 vw/s. Used for cards that enter on a beat cut.
- **Evidence:** v2a C-02/C-03 f476–498.
```tsx
const [scope, animate] = useAnimate();
useEffect(() => { (async () => {
  await animate(scope.current, { x: [-60, 0] }, { duration: 0.3, ease: E.heroCutIn });
  animate(scope.current, { x: [0, -600] }, { duration: 4.3, ease: "linear" });
})(); }, []);
```
```css
.cut-in{animation:cutIn 300ms var(--e-hero-cut-in) both,drift 4.3s linear 300ms infinite alternate}
```

### EXIT

#### P10 `whipOff`: an object is discarded after a gesture
- **Params:** labels fade over 120 ms (front-loaded, `outQuad`). The object collapses over 67 ms `in` (sprite swap allowed). Hold 67 ms. The discarded part translates +400–460 px over 133 ms `inQuad` with rotate 11° → 33°, fading over the last 2 frames. A "spent" sprite (crumpled pile) crossfades in over 67 ms linear. All exits use **ease-in**.
- **Evidence:** v4 B3–B6 f122–134.
```tsx
await animate(".tags", { opacity: 0 }, { duration: 0.12, ease: E.outQuad });
await animate(".bow", { scale: 0.8, opacity: 0 }, { duration: 0.067, ease: E.in });
await animate(".ribbon", { x: 440, rotate: 33, opacity: [1, 1, 0] },
  { duration: s(D.fast), ease: E.inQuad, delay: 0.067 });
animate(".pile", { opacity: 1 }, { duration: 0.067, ease: "linear" });
```
```css
.ribbon.off{transition:transform 133ms var(--e-in-quad),opacity 66ms linear 67ms;
 transform:translateX(440px) rotate(33deg);opacity:0}
```

#### P11 `flyThroughExit`: a line leaves past the camera
- **Params:** scale 1 → 2.5–4 and blur → 8–10 px over 270–470 ms `flyOut`. Opacity keyframes [1, 1, .15, 0] at [0, .5, .85, 1]. Change the direction for each line: zoom-in, then up-left, then right. A smear variant uses x +80 px with ease-in to constant speed over 630 ms plus 2–3 echo copies.
- **Evidence:** v2a B-03/B-04 f191–206, B-07 f236–244, B-11 f257–266, B-17/B-M2 f337–356.
```tsx
exit={{ scale: 3.5, filter: "blur(10px)", opacity: [1, 1, 0.15, 0],
  transition: { duration: 0.4, ease: E.flyOut, opacity: { times: [0, .5, .85, 1], duration: 0.4 } } }}
```
```css
.fly-out{animation:flyOut 400ms var(--e-fly-out) forwards}
@keyframes flyOut{50%{opacity:1}85%{opacity:.15}to{transform:scale(3.5);filter:blur(10px);opacity:0}}
```

#### P12 `curtainDrop`: an overlay drops away to reveal a pre-mounted page
- **Params:** three overlapping properties on one timeline.
  - y 0 → 105 vh over 1.4 s `curtainFall`. It never decelerates.
  - A contrast wash starts at +33 ms: crossfade to a flat mean-colour copy over 700 ms linear.
  - Opacity 1 → 0 with `inQuad` from +900 to +1530 ms, plus a top-to-bottom mask sweep from +1100 ms over 430 ms.
  - Unmount at +1530 ms.
- **Evidence:** v5 A-e12/A-e13/A-e14/A-m03 f189–235.
```tsx
await Promise.all([
  animate(wall, { y: "105vh" }, { duration: 1.4, ease: E.curtainFall }),
  animate(wash, { opacity: 1 }, { duration: 0.7, delay: 0.033, ease: "linear" }),
  animate(wall, { opacity: 0 }, { duration: 0.63, delay: 0.9, ease: E.inQuad }),
  animate(wall, { "--mask": "100%" }, { duration: 0.43, delay: 1.1, ease: E.inQuad }),
]); setMounted(false);
```
```css
.wall{mask-image:linear-gradient(to bottom,transparent var(--mask,0%),#000 calc(var(--mask,0%) + 18%))}
```

#### P13 `blurOut`: text leaves in place
- **Params:** opacity 1 → 0 over 370 ms `outQuad`, with blur rising 0 → 8 px linearly across the whole exit and no translate. A subtitle fades faster (about 230 ms).
- **Evidence:** v2a A-E03 f82–92.
```tsx
exit={{ opacity: 0, filter: "blur(8px)", transition: { opacity: { duration: .37, ease: E.outQuad }, filter: { duration: .37, ease: "linear" } } }}
```
```css
.blur-out{transition:opacity 370ms var(--e-out-quad),filter 370ms linear;opacity:0;filter:blur(8px)}
```

#### P14 `hardCut`: instant state change
- **Params:** 0 ms. Used for status labels (the width also snaps to the content), hint pills, glyph and icon swaps, chrome teardown before a transition, and a headline cut on a beat. Never tween status text.
- **Evidence:** v1 #5/#21/#34 (pill), #47 f471 (teardown); v2b D01b f807→808; v4 A9 f91, C8 f308; v5 B-03/B-05/B-07.
```tsx
<motion.span key={label} initial={false}>{label}</motion.span>  {/* no transition */}
```
```css
.status{transition:none}
```

### EMPHASIS and FEEDBACK

#### P15 `tapWobble`: a diegetic object acknowledges a tap
- **Params:** rotate [0, −2, 1.9, −1]° at times [0, .33, .62, 1] over 233 ms `inOutSine`. **The object keeps the −1° tilt** (a "handled" feel). The idle float is cancelled and y returns to 0 over 100 ms `outQuad`. No scale.
- **Evidence:** v5 A-e03 f32–39.
```tsx
animate(env, { rotate: [0, -2, 1.9, -1] }, { duration: 0.233, times: [0, .33, .62, 1], ease: E.inOutSine });
animate(env, { y: 0 }, { duration: s(D.xfast), ease: E.outQuad });
```
```css
@keyframes wobble{0%{rotate:0deg}33%{rotate:-2deg}62%{rotate:1.9deg}100%{rotate:-1deg}}
.env.tapped{animation:wobble 233ms var(--e-in-out-sine) forwards}
```

#### P16 `pressSquash`: tactile press on a container
- **Params:** on pointerdown, scaleX 1.01 and scaleY .995 with a step in, held while pressed. Release in 33–67 ms with no bounce. For buttons the product adds `whileTap` scale .97 for 60–80 ms (the v3 reference had none; recommended there).
- **Evidence:** v4 B16 f167–204; v3 §4.8.
```tsx
<motion.div whileTap={{ scaleX: 1.01, scaleY: 0.995, transition: { duration: 0 } }}
  transition={{ duration: 0.05 }} />
```
```css
.box:active{transform:scale(1.01,.995);transition:none}
.box{transition:transform 50ms linear}
```

#### P17 `hoverGrow`: pointer devices only
- **Params:** scale 1.06 on small round buttons and 1.04 on the FAB, 130–200 ms `outQuad`, with no tint. Gate it behind `@media (hover:hover)`.
- **Evidence:** v5 B-02 f258–263, B-M1, B-M2 f371–377.
```tsx
<motion.button whileHover={{ scale: 1.06 }} transition={{ duration: 0.17, ease: E.outQuad }} />
```
```css
@media (hover:hover){.round-btn{transition:transform 170ms var(--e-out-quad)}.round-btn:hover{transform:scale(1.06)}}
```

#### P18 `biteTap` / `spriteSwapReward`: a cumulative tap
- **Params:** all on the same frame as pointerdown:
  - the sprite swaps to the next state (no tween)
  - a heart charm flashes for 1–2 frames
  - crumb dots and 4-point sparkles pop and vanish over 70–170 ms `outQuad`
  - the container squashes (P16)

  The first tap on each item pops a caret-anchored note (scale .86 → 1, opacity .45 → 1 over 70–100 ms `outQuad`) and removes the previous note instantly. The note copy carries progress ("còn 2 món nữa"). Debounce taps at about 200 ms (the observed taps were 233 ms apart).
- **Evidence:** v4 B13–B18 f167–203.
```tsx
onPointerDown={() => { setStage(s => s + 1); burst("crumbs", 6); flashCharm(33); }}
<motion.div key={noteId} initial={{ opacity: .45, scale: .86 }} animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.085, ease: E.outQuad }} />
```
```css
.note{animation:note 85ms var(--e-out-quad) both}@keyframes note{from{opacity:.45;transform:scale(.86)}}
```

#### P19 `chromeNudge`: corner chrome draws the eye on mount
- **Params:** x −9 px with scale 1.06, returning to 0 / 1 over 200 ms `outQuad` (or `spring.chromeNudge`), with no rotation. It mounts 200 ms after the secondary chrome, which hard-cuts in.
- **Evidence:** v4 A9–A10 f91–103; v1 #2 f4–8.
```tsx
<motion.button initial={{ x: -9, scale: 1.06 }} animate={{ x: 0, scale: 1 }} transition={sp("chromeNudge")} />
```
```css
.cta-in{animation:nudge 200ms var(--e-out-quad) both}@keyframes nudge{from{transform:translateX(-9px) scale(1.06)}}
```

#### P20 `activeSwap`: selected-state crossfade on a pair of controls
- **Params:** background, icon colour and border swap on both buttons at once over 150 ms `outQuad`. The pressed ring is applied instantly on the click frame. Media state has three tiers: selected (instant), then "Đang mở…", then "Đang phát" on the real `playing` event.
- **Evidence:** v5 B-04 f312–316, B-05 f364.
```css
.track{transition:background-color 150ms var(--e-out-quad),color 150ms var(--e-out-quad),border-color 150ms var(--e-out-quad)}
```
```tsx
<motion.button animate={{ backgroundColor: active ? "#234a30" : "#fdf7e5" }} transition={{ duration: .15, ease: E.outQuad }} />
```

#### P21 `heartBurst`: attention cue or celebration
- **Params:** 13–15 hearts, 4–7 px at 1024 px width (about 0.5% of viewport width). They pop with `outBack` over 100 ms, float up about 70 px with `outQuad`, and fade over the last 300 ms, for 1.1–1.2 s in total. The washi-tape variant bursts to 6–8 hearts, then falls at 120 px/s linear.
- **Evidence:** v1 #35 f203–238; v4 C4 f211–246, B10 f144–155 (6–10 hearts, 350 ms rise).
```tsx
{hearts.map((h, i) => <motion.i key={i} initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
  animate={{ scale: [0, 1.1, 1], x: h.dx, y: -70 - h.dy, opacity: [1, 1, 0] }}
  transition={{ duration: 1.15, ease: E.outQuad, opacity: { times: [0, .74, 1] }, scale: { duration: .1 } }} />)}
```
```css
.heart{animation:heart 1150ms var(--e-out-quad) forwards}
@keyframes heart{0%{transform:scale(0)}9%{transform:scale(1.1)}74%{opacity:1}100%{transform:translate(var(--dx),-70px);opacity:0}}
```

#### P22 `confettiFountain`: reward on landing
- **Params:** 11–15 flakes, 3–5 px. They rise about 30 px, spread ±40 px and fall about 100 px with gravity over 800 ms. Rendered in a **stage overlay**, not clipped to the photo. Starts 33 ms after the landing.
- **Evidence:** v1 #25/#29/#33 f113–136, f155–180, f199–223.
```ts
// canvas or a DOM pool: y(t) = vy0*t + 0.5*g*t^2 with vy0 = -150 px/s and g = 700 px/s^2; x(t) = vx*t with vx in ±50 px/s
```
```css
.flake{animation:fx 800ms linear forwards}@keyframes fx{to{transform:translate(var(--vx),100px) rotate(var(--r))}}
```

#### P23 `cameraFlash`: one capture tick (booth core)
- **Params:**
  - A full-screen white layer **below the HUD**: opacity rises in ≤1 frame to .85 (product cap .9), then decays linearly over 130–167 ms.
  - A second radial glow centred on the subject on the same envelope, so the combined value reaches about .95 at the subject.
  - The subject group jitters ≤2.5 px in 2–3 random steps over 80–120 ms (`steps(1)`). The wall and floor stay still.
  - A painted starburst above the flash: scale .7 → 1 in ≤40 ms, hold 80 ms while growing 5% with a +12° spin, fade 80 ms (200 ms of life).
  - 2–3 twinkles with a random 0–60 ms delay.
  - **Grab the camera frame at the flash peak.**
- **Evidence:** v1 #13–#19b f54–82.
```tsx
async function flashTick() {
  capture();                                    // getImageData / takePhoto at the peak
  animate(flash, { opacity: [0.85, 0] }, { duration: 0.15, ease: "linear" });
  animate(glow,  { opacity: [0.6, 0] },  { duration: 0.16, ease: "linear" });
  animate(subject, { x: [2.5, 1.1, -0.7, 0], y: [-0.5, 1.4, 0.4, 0] }, { duration: 0.1, ease: () => 1 /* steps */ });
  animate(star, { scale: [0.7, 1, 1.05], rotate: [0, 12], opacity: [0.35, 1, 1, 0] },
    { duration: 0.2, times: [0, .2, .6, 1] });
}
```
```css
.flash{background:#fff;opacity:0}
.flash.tick{animation:flash 150ms linear}@keyframes flash{0%{opacity:.85}100%{opacity:0}}
.subject.shake{animation:shake 100ms steps(1)}
@keyframes shake{0%{translate:2.5px -.5px}33%{translate:1.1px 1.4px}66%{translate:-.7px .4px}100%{translate:0 0}}
```

#### P24 `sparkleGlint`: a point of light on a word or object
- **Params:** a 4-point white star grows from a dot to 10 px in 200 ms `outQuad`, holds about 300 ms, then fades over 270 ms. Use 1–2 per line or reward. A "glint chase" variant hops 2–3-frame +4% brightness glints along a path about 65 ms apart, as a drag affordance.
- **Evidence:** v2a A-E17 f145–168; v4 A12 f104–113.
```css
.glint{animation:glint 770ms var(--e-out-quad) both}
@keyframes glint{0%{transform:scale(0)}26%{transform:scale(1)}65%{opacity:1}100%{opacity:0}}
```
```tsx
<motion.svg animate={{ scale: [0, 1, 1, 1], opacity: [1, 1, 1, 0] }} transition={{ duration: .77, times: [0, .26, .65, 1] }} />
```

### AMBIENT (always on while idle; see rule G3)

#### P25 `idleFloat`
- **Params:** y −2.5 ↔ 0 px over 3 s `inOutSine`, infinite. Cancelled on tap.
- **Evidence:** v5 A-m01 f1–31.
```tsx
<motion.div animate={{ y: [0, -2.5, 0] }} transition={{ duration: 3, ease: E.inOutSine, repeat: Infinity }} />
```
```css
.float{animation:float 3s var(--e-in-out-sine) infinite}@keyframes float{50%{transform:translateY(-2.5px)}}
```

#### P26 `trapezoidSway`: 1–2 hero props only
- **Params:** origin `50% 100%`. Keyframes 0% and 17% at 0°, 50% and 67% at 2.7°, 100% at 0°, over 800 ms infinite (one beat at 75 BPM).
- **Evidence:** v4 A6 f97–204.
```css
.sway{transform-origin:50% 100%;animation:sway 800ms linear infinite}
@keyframes sway{0%,17%{rotate:0deg}50%,67%{rotate:2.7deg}100%{rotate:0deg}}
```
```tsx
<motion.img style={{ originX: .5, originY: 1 }} animate={{ rotate: [0, 0, 2.7, 2.7, 0] }}
  transition={{ duration: .8, times: [0, .17, .5, .67, 1], repeat: Infinity, ease: "linear" }} />
```

#### P27 `pendulum`: curtain or hanging decoration
- **Params:** idle: rotate −1° ↔ +1° about the top-centre origin, with asymmetric legs of 0.9 s and 1.47 s (`inOutSine`). After an impulse such as a transition, run `spring.pendulum` from ±1° (decaying over about 1.4 s), then settle into a ±0.4° breeze on a 4.8 s cycle.
- **Evidence:** v1 #1 f1–644, #53 f503–545, #54 f542–644.
```tsx
<motion.div style={{ originY: 0 }} animate={{ rotate: [-1, 1, -1] }}
  transition={{ duration: 2.37, times: [0, .38, 1], ease: E.inOutSine, repeat: Infinity }} />
```
```css
.curtain{transform-origin:50% 0;animation:pend 2.37s var(--e-in-out-sine) infinite}
@keyframes pend{0%,100%{rotate:-1deg}38%{rotate:1deg}}
```

#### P28 `hintRing`: hotspot ping
- **Params:** a 30 px ring, 1.5 px white at 55–60% opacity. Scale 1 → 1.8–1.95 linear over 800 ms. Opacity fades in over 100 ms, holds, then fades out over about 300 ms. Alternate with a faster 300 ms pulse. Repeat until the first interaction, then stop.
- **Evidence:** v1 #3 f14–23; v4 A7 f68–91, A8 f97–106.
```css
.ring{animation:ring 800ms linear infinite}
@keyframes ring{0%{transform:scale(1);opacity:0}12%{opacity:.55}62%{opacity:.55}100%{transform:scale(1.9);opacity:0}}
```
```tsx
<motion.span animate={{ scale: [1, 1.9], opacity: [0, .55, .55, 0] }}
  transition={{ duration: .8, repeat: Infinity, ease: "linear", opacity: { times: [0, .12, .62, 1] } }} />
```

#### P29 `reelSpin`: tied to a real media state
- **Params:** rotate 360° per 1.1 s linear. The right reel runs in reverse. An optional 2 px off-centre origin gives a toy wobble. It **must** start and stop on the player's `playing`, `pause` and `waiting` events. v5 left the reels spinning after pause, which is an anti-pattern.
- **Evidence:** v5 B-06/C-e05 f364–817, §7.
```tsx
<motion.g animate={playing ? { rotate: 360 } : { rotate: 0 }}
  transition={playing ? { duration: 1.1, ease: "linear", repeat: Infinity } : { duration: .3 }} />
```
```css
.reel{animation:spin 1.1s linear infinite;animation-play-state:var(--play,paused)}
.reel.r{animation-direction:reverse}@keyframes spin{to{rotate:360deg}}
```

#### P30 `livingHold` / `handheldSway`: never let a hero card freeze
- **Params:**
  - **livingHold** (lyric or letter hold): scale +1.5–5%/s linear and roll ±2–2.5°/s around an off-centre origin (about 70% 40%). Reset for each card.
  - **handheldSway** (POV or photo hold): translate only. x = 0.9%·sin(2πt/6.99 s) + 0.45%·sin(2πt/2.73 s) of the width, and y = 0.5%·sin(2πt/9.0 s). The background moves about 2× in phase.
- **Evidence:** v2a A-E16 f128–190, B-14 f288–336, B-19 f368–416; v2b F01/F02 f1261–1676.
```tsx
const t = useTime();
const x = useTransform(t, v => 9.25 * Math.sin(v / 6990 * 2 * Math.PI) + 4.66 * Math.sin(v / 2730 * 2 * Math.PI));
const y = useTransform(t, v => 5.13 * Math.sin(v / 9000 * 2 * Math.PI));
<motion.div style={{ x, y }} />
```
```css
.hold{transform-origin:70% 40%;animation:hold 4s linear forwards}@keyframes hold{to{transform:scale(1.08) rotate(3.7deg)}}
```

#### P31 `petalField`: screen-space particles above content
- **Params:**
  - **3 depth tiers:** far 1–2% of viewport width at 10–20 px/f; mid 4–5% at 3–5 px/f with ±47 px sway (2 s period); near 6–12%, blurred, at 12–26 px/f.
  - **Motion:** mean wind (−8, +4) px/f, a 3D tumble of 135–270°/s, sine sway with an amplitude of 20–47 px and a period of 1.2–2 s.
  - **Spawning:** at the edges and mid-air, with opacity 0 → 1 over 100–130 ms.
  - **Density:** **1–3 on screen.** The field ignores camera moves and sits above text.
- **Evidence:** v2a A-E04…A-M3, B-21/C-10; v2b F10–F14.
- **Implementation:** a canvas layer (see §5). For a DOM fallback with 3 nodes or fewer:
```css
.petal{position:fixed;animation:fall 3s linear forwards,sway 2s var(--e-in-out-sine) infinite alternate}
@keyframes fall{to{transform:translate(-25vw,110vh) rotate3d(1,.4,.2,540deg)}}
```

### TRANSITION

#### P32 `pageCrossfade` / `contentSwapInShell`
- **Params:** opacity only, 240 ms `outCubic`, with pages stacked absolutely. The outgoing page may lead by 1 frame. **Shared chrome stays outside the fading layers** (background, card shell, ornaments), so it never dips; alternatively use the View Transitions `plus-lighter` dissolve. Inside a persistent shell, only the content crossfades: about 200 ms `standard`, with the next CTA at 167 ms `outCubic`. Push a history entry for each step on the same tick. **Preload and `decode()` the next step's images before the swap.**
- **Evidence:** v3 M05/M06 f129–137, M10/M11 f267–276, M16/M17 f384–389, M21/M22 f506–513, M25 (200 ms jank from an un-decoded image).
```tsx
<AnimatePresence mode="sync" initial={false}>
  <motion.section key={step} style={{ position: "absolute", inset: 0 }}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: s(D.crossfade), ease: E.outCubic }} />
</AnimatePresence>
```
```css
::view-transition-old(root),::view-transition-new(root){animation-duration:240ms;animation-timing-function:var(--e-out-cubic)}
```

#### P33 `paperDipCrossfade`: an artwork state change (closed → open)
- **Params:** both layers start together and run for 333 ms. The outgoing layer uses `outQuad`; the incoming layer uses `paperIn` (ease-in). The sum dips to about 56% mid-way, so the paper background shows through like a page turn of light.
- **Evidence:** v5 A-e05 f44–54.
```tsx
animate(closed, { opacity: 0 }, { duration: s(D.dip), ease: E.outQuad });
animate(open,   { opacity: 1 }, { duration: s(D.dip), ease: E.paperIn });
```
```css
.closed{transition:opacity 333ms var(--e-out-quad)}.open{transition:opacity 333ms cubic-bezier(.66,.215,1,1.146)}
```

#### P34 `lidFlip3D`: a single-curve 3D open
- **Params:** the lid rotates 0 → 180° on X (`perspective: 700px`, hinge at the lid's bottom edge) **and** the container moves y +105 px (re-centre) on **one** `inOutCubic` curve over 280 ms. No landing spring and no rebound (the separate landing spring in the source analysis was refuted).
- **Evidence:** v4 B7 f136–143.
```tsx
const t = { duration: s(D.move), ease: E.inOutCubic };
animate(lid, { rotateX: 180 }, t); animate(box, { y: 105 }, t);
<div style={{ perspective: 700 }}><motion.div style={{ originY: 1, transformStyle: "preserve-3d" }} ref={lid} /></div>
```
```css
.stage{perspective:700px}.lid{transform-origin:50% 100%;transition:transform 280ms var(--e-in-out-cubic);backface-visibility:hidden}
.open .lid{transform:rotateX(180deg)}.open .box{transform:translateY(105px);transition:transform 280ms var(--e-in-out-cubic)}
```

#### P35 `layoutMove`: the hero relocates when the scene changes
- **Params:** FLIP with Motion `layout`, 280 ms `inOutCubic`. Props clear first (100 ms opacity), and the next element (the letter) starts 30 ms into the move.
- **Evidence:** v4 C1–C2 f204–211.
```tsx
<motion.div layout transition={{ layout: { duration: s(D.move), ease: E.inOutCubic } }} />
```
```css
/* CSS: FLIP via the Web Animations API, or View Transitions with view-transition-name:hero */
```

#### P36 `sharedLightbox`
- **Params:**
  - The thumbnail morphs to the hero with `spring.lightbox` (≈ `overshootFlip` over 430 ms). Scale peaks at about 5% and travel overshoot at about 9%.
  - Rotation snaps to a fixed display tilt (−4° → −1°); it does not start from the thumbnail's tilt.
  - The scrim is **linear** over 267 ms to rgba(47,15,41,.67), with no blur.
  - Controls fade in over 200 ms `outQuad` **after** the FLIP (delay about 430 ms).
- **Evidence:** v4 D5–D7 f522–541.
```tsx
<LayoutGroup>
  <motion.img layoutId={`photo-${id}`} onClick={() => setOpen(id)} />
  <AnimatePresence>{open && <>
    <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: .267, ease: "linear" }} />
    <motion.img layoutId={`photo-${open}`} initial={{ rotate: -4 }} animate={{ rotate: -1 }} transition={sp("lightbox")} />
    <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: .43, duration: .2, ease: E.outQuad } }}
      exit={{ opacity: 0, transition: { duration: .1 } }} />
  </>}</AnimatePresence>
</LayoutGroup>
```
```css
::view-transition-group(photo){animation-duration:430ms;animation-timing-function:cubic-bezier(.34,1.56,.64,1)}
```

#### P37 `slotPrint` + `toss`: a strip leaves the booth and lands in the gallery
- **Params:**
  - **Print:** a mini strip (scale .29) translates linearly inside an `overflow:hidden` slot at 95–160 px/s (400–700 ms).
  - **Toss:**
    - Keyframes over 370–600 ms. Scale .29 → 1.056 → 1 (`spring.toss`).
    - Arc: y rises 26–51 px above the target with `outQuad` (about 55% of the time), then drops with ease-in to a **hard stop**. x uses `outQuad`.
    - Tilt reaches ±16°·sign(dx) at about 60% of the time, then unwinds to the rest tilt (−3.6° / +1.3° / +4°). The newest strip is on top.
- **Evidence:** v1 #22/#23 f90–112, #26/#27 f116–155, #30/#31 f160–198.
```tsx
await animate(mini, { y: [0, 65] }, { duration: 0.4, ease: "linear" });
animate(strip, { x: [0, dx], y: [0, apexDy, dy], rotate: [0, 16 * Math.sign(dx), restTilt], scale: [.29, 1] }, {
  duration: 0.6,
  x: { ease: E.outQuad }, y: { times: [0, .55, 1], ease: [E.outQuad, E.inQuad] },
  rotate: { times: [0, .6, 1], ease: [E.outQuad, E.inOutSine] }, scale: sp("toss") });
```
```css
.slot{overflow:hidden}.mini{animation:feed 400ms linear forwards}@keyframes feed{to{transform:translateY(65px)}}
```

#### P38 `flowerWipe` (falling cover) / `gravityCurtain` (intro dissolve)
- **Params:**
  - **flowerWipe:** about 70 sprites at 8–20% of viewport width, with three nested transforms:
    - linear y fall from above the viewport to below it, with the leading edge at about 2 viewport heights per second (1150–1200 px/s at 576 px tall) and the trailing edge at about 880 px/s
    - sine x sway, 35–50 px with a 280–400 ms period
    - a constant spin of 150–300°/s with a random sign
    - no scale, opacity, shadow or blur

    Spawns spread over 630 ms. Peak cover is about 80%; swap the scene underneath at ≥70% cover with a 100–133 ms crossfade.
  - **gravityCurtain:** every sprite starts at t=0 and falls ballistically: y = v0·t + ½gt² with g ≈ 42 vh/s² and v0 between −2.5 and +11 vh/s. Sprites drift 0–6 vw outward and tilt ±6–20° by quadrant (clockwise for the top-left and bottom-right quadrants). Opacity falls 1 → 0 linearly over 2.0 s. A second rank seeded at −10 to −60 vh keeps the top covered, so the reveal reads top-down. The content is mounted underneath.
- **Evidence:** v1 #48–#52 f471–513; v4 A1–A4 f4–71.
- **Implementation:** canvas (§5). The per-sprite maths is shared by both:
```ts
// per sprite, each rAF frame (t in s)
y = y0 + v0*t + 0.5*g*t*t;  x = x0 + drift*t + A*Math.sin(2*Math.PI*t/P + phase);  rot = r0 + w*t;  alpha = gravity ? 1 - t/2.0 : 1;
```

#### P39 `bloomBurst`: radial emitter to full-bleed
- **Params:** a radial emitter at the hero centre. Each sprite fades in over 150 ms translucent (newest on top), scales .35 → 1 and pushes radially with `bloomSprite` over 0.9–1.4 s. Overall coverage follows `bloomCoverage` over about 2.4 s to full-bleed. The edges settle at staggered times (top, then right, then left), ending with an edge-biased wave over the last 330 ms. During the hold, the wall layers drift down at 1.3–3 px/f (about 72 px/s, linear) with slight lateral parallax.
- **Evidence:** v5 A-e06/A-e08/A-m02 f57–156, A-e09 f157–188.
```ts
// spawn schedule: n(t) = N * bezier(bloomCoverage)(t / 2.4)  →  emit the sprites still due this frame
```

#### P40 `diagonalWipe`: hard 45° line
- **Params:** clip line x − y = c, with c going from W to −H over 205 ms linear and a hard edge. The incoming scene starts washed (brightness 1.05, saturate .88) and settles over 270 ms `inOutSine`. Run it in the swipe direction.
- **Evidence:** v2b D11/D12 f871–882.
```css
@property --c{syntax:'<percentage>';inherits:false;initial-value:100%}
.incoming{clip-path:polygon(var(--c) 0,100% 0,100% 100%,calc(var(--c) - 100%) 100%);animation:wipe 205ms linear forwards}
@keyframes wipe{from{--c:200%}to{--c:0%}}
```
```tsx
animate(el, { clipPath: ["polygon(200% 0,100% 0,100% 100%,100% 100%)", "polygon(0% 0,100% 0,100% 100%,-100% 100%)"] }, { duration: .205, ease: "linear" });
```

### CAMERA

#### P41 `worldCamera`: tour a flat-lay world
- **Params:** one world container is animated through x, y, scale and rotate, with one eased move per phrase:
  - **tilt:** 2.6 s `cameraTilt`
  - **whip:** 1.27 s `inOutQuad` at about 1.4 screen-widths/s peak, with no blur
  - **swing-back:** 2.3 s `cameraSwing`, combined with −8.6% scale and −6.3° roll (`inOutSine` / `inOutQuad`)
  - **breathing zoom:** −10% over 3.2 s `inOutSine`, then +13% over 1.6 s `inCubic`
  - **focus push** (match-cut into a memory): ×1.56 and +15° straighten over 867 ms `focusPush`, background blur to 12 px with ease-in, cross-dissolve over 270–330 ms `outQuad`, then settle with `spring.settle`

  Props in the world can counter-rotate at ±30°/s and ease to a stop together with `outQuad` over about 1.6 s.
- **Evidence:** v2b E01 f877–956, E09 f956–994, E12–E14 f995–1064, E20–E21 f1090–1235, T01–T05 f1235–1261, E06/E07.
```tsx
await animate(world, { y: -285 }, { duration: 2.6, ease: E.cameraTilt });
await animate(world, { x: -918 }, { duration: 1.27, ease: E.inOutQuad });
await animate(world, { x: -451, scale: .915, rotate: -6.3 }, { duration: 2.3, ease: E.cameraSwing });
```

### TEXT

#### P42 `typewriter`: letter body (the default for both products)
- **Params:**
  - Pre-lay-out the text. Split it into graphemes with `Intl.Segmenter('vi', {granularity:'grapheme'})` (NFC), so that ệ, ữ, ở and ặ stay attached to their base letter.
  - Each span steps from opacity 0 to 1 with a 0–20 ms linear fade, scheduled linearly from t0 (not chained timers, so jank catches up).
  - Rate: `ms = min(127, 3220 / n)`. Start delay: `clamp(1.6·ms, 60, 200)`.
  - Spaces and line wraps take one slot each. No caret, no translate.
  - Tap completes the text. Add a completion cue 600–1000 ms after the last glyph.
- **Evidence:** v3 M02/M03 f11–91, M08 f135–229, M13, M19, M24 f508–604.
- **Fonts:** use the 74/74-verified Vietnamese faces only: Mali, Itim, Patrick Hand, Pangolin, Playpen Sans, Shantell Sans, Grandstander (hand); Dancing Script, Charm, Great Vibes, Pacifico (script); Be Vietnam Pro (UI); Playfair Display (serif).
```tsx
const g = [...new Intl.Segmenter("vi", { granularity: "grapheme" }).segment(text.normalize("NFC"))].map(x => x.segment);
const ms = Math.min(127, 3220 / g.length), start = Math.min(200, Math.max(60, 1.6 * ms));
<motion.p initial="h" animate="v" variants={{ v: { transition: { delayChildren: start / 1000, staggerChildren: ms / 1000 } } }}
  style={{ whiteSpace: "pre-wrap" }}>
  {g.map((c, i) => <motion.span key={i} variants={{ h: { opacity: 0 }, v: { opacity: 1, transition: { duration: .016, ease: "linear" } } }}>{c}</motion.span>)}
</motion.p>
```
```css
.tw span{opacity:0;animation:glyph 16ms linear forwards;animation-delay:calc(var(--start) + var(--i) * var(--ms))}
@keyframes glyph{to{opacity:1}}
```

#### P43 `beatType`: lyric variants (beat-locked)
- **Params:**
  - **typewriterPop:** each grapheme's visibility steps every sixteenth note (beat/4: 99 ms at 152 BPM, 197 ms at 76 BPM). Emoji pop the same way. The climax variant uses about 155 ms.
  - **glyphMosaicSweep:** the whole line first appears as a 30% pixelated ghost for 100 ms. Then each grapheme goes from opacity .3 to 1 with blur 5 → 0 over about 90 ms `outQuad`, staggered 38–42 ms with the line capped at 650 ms, and a white glint rides the front.
  - **wordByWord:** whole words pop one per beat.
  - **softPhotoType:** each glyph fades over 67 ms linear with a 67–100 ms stagger. Line sizes 1 : 1.3 : 1.8, clipped to the photo window.
  - **shimmerMask:** a single transparent band about 100 px wide travels at about 470 px/s linear, once, about 0.6 s after the reveal.
  - **writeOn:** SVG `stroke-dashoffset` at constant speed (400 ms for a short word), then an optional pink strike over 233 ms.
- **Evidence:** v2a C-04 f499–523, C-18 f762–803, B-12/B-13 f264–286, A-E02 f19–55; v2b E17 f1017–1133, F03–F07 f1265–1387.
```tsx
const beat = 60000 / bpm;
{g.map((c, i) => <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
  transition={{ delay: (t0 + i * beat / 4) / 1000, duration: 0 }}>{c}</motion.span>)}
```
```css
.write path{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:draw 400ms linear forwards}@keyframes draw{to{stroke-dashoffset:0}}
```

Core set for an MVP (about 30): P01–P08, P10, P12, P14–P18, P21–P23, P25–P29, P32–P34, P36–P38, P42. The rest are lyric-mode and camera variants.

---

## 3. Signature choreographies (ms offsets from t0)

Every table lists: offset, duration, element, action, token, evidence. "Preload" rows are mandatory.

### C1. Envelope open + bloom burst + curtain drop (gift card opener)

**Before t0:** the letter page is **pre-mounted** under the overlay. Flower sprites are decoded into an atlas. The envelope floats (P25) and a hint ring pulses on the seal (P28). The prompt "Chạm để mở" sits about 180 px below the envelope.

t0 = tap 1 (v5 f32). This tap also unlocks audio.

| ms | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|
| 0 | 233 | Envelope | `tapWobble` [0, −2, 1.9, −1]°, keeps −1° | inOutSine | v5 f32–39 |
| 0 | 100 | Envelope | float cancelled, y → 0 | outQuad | v5 A-e03 |
| 0 | — | Hint ring | stops (hard) | instant | rule G3 |
| 33 | 133 | "Chạm để mở" | opacity → 0 | linear | v5 f33–36 |
| 233–400 | — | — | micro-hold | hold.micro | v5 f40–43 |
| 400 | 333 | Envelope art | closed → open `paperDipCrossfade` | outQuad / paperIn | v5 f44–54 |
| 733–870 | — | — | hold on the open envelope | — | v5 f55–57 |
| 870 | 133 | Bouquet seed | fade in + scale (+15%/frame) at the envelope centre | outQuart | v5 f57–64 |
| 870 | 2400 | Bloom | `bloomBurst` emitter begins; coverage `bloomCoverage` | bloomSprite | v5 f58–133 |
| 1100 | 100 | Envelope | opacity → 0 behind the flowers | linear | v5 f65–67 |
| ≈3400 | — | Bloom | full-bleed | — | v5 f133 |
| 3270–4130 | ~860 | Bloom edges | asynchronous settle (top, right, left wave) | outQuad decay | v5 f134–156 |
| 4000 | 200 | "Chạm để tiếp tục" | `timedPrompt` → .85 | outQuad | v5 f152–158 |
| 4130 → | ∞ | Wall | ambient drift, 72 px/s down, per-layer parallax | linear | v5 f157–188 |

t1 = tap 2 (v5 f189). The tap is accepted only after +4000. Debounce.

| ms | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|
| 0 | 0 | Prompt | removed | instant | v5 f189 |
| 0 | 1400 | Wall | y 0 → 105 vh | curtainFall | v5 f189–227 |
| 33 | 700 | Wall wash | crossfade to the mean-colour copy | linear | v5 f190–222 |
| 900 | 630 | Wall | opacity → 0 | inQuad | v5 f216–235 |
| 1100 | 430 | Wall mask | top → bottom sweep | inQuad | v5 f222–234 |
| 1530 | 0 | Overlay | unmount | instant | v5 f235 |
| 1530 + | — | Letter page | already static underneath. The letter typewriter (P42) starts at +1530 + 120 | — | v5 f236; v3 M24 |
| (impulse) | 1400 | Hanging decorations on the page | `pendulum` spring | pendulum | v1 #53 |

Total: about 5.6 s from the first tap to the letter, with two taps. Chrome (FAB + pill, help) stays **above** the overlay the whole time (v5 A-e15).

### C2. Ribbon pull + lid flip + reveal stinger (gift box)

**Before t0:** the box sits centred at about 39% height. The trapezoid sway runs on 1–2 props, the hint ring and the glint chase run on the ribbon tail, and the label reads "kéo dải ruy băng". Drag threshold: 50 px; tap fallback: a tap plays the same tug at 367 ms.

t0 = drag start (v4 f114).

| ms | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|
| 0 | 367 | Bow + tail | follows the drag; bow scale 1 → .8, tail stretches | gesture / linear | v4 B1 f114–125 |
| 0 | 70 | Heart particle at the loop | pop, +8 px, fade | outQuad | v4 B2 |
| 267 | 120 | Labels ("kéo dải ruy băng", name card) | opacity → 0, front-loaded | outQuad | v4 B3 f122–125 |
| 367 (release) | 67 | Bow knot | collapse, scale .8 → 0 | in | v4 B4 f125–127 |
| 433–533 | — | — | hold on the bare ribbon cross | hold.micro | v4 f128–129 |
| 533 | 133 | Ribbon bands | `whipOff` x +440, rotate 11 → 33° | inQuad | v4 B5 f130–133 |
| 633 | 67 | Crumpled pile | crossfade in | linear | v4 B6 |
| 700–733 | — | — | hold | — | v4 f134–135 |
| 733 | 280 | Lid + box | `lidFlip3D` rotateX 0 → 180 **and** box y +105 on one curve | inOutCubic | v4 B7 f136–143 |
| 967 | 167 | Inner sticker | `stickerPop` → 1.04 → 1 | sticker spring | v4 B8 f143–148 |
| 967 | 100 | Caption "chạm vào một món để cắn thử" | opacity in | outQuad | v4 B9 |
| 1000 | 350 | Heart confetti | 6–10 hearts rise about 50 px | outQuad | v4 B10 f144–155 |
| 1067 / 1133 / 1167 | 150 each | Pennants | fade in, 67 ms stagger | standard | v4 B11 f146–154 |
| 1233 → | ∞ | Treats | twinkles every 330–500 ms (3–5 f life) | inOutSine | v4 B12 |

Then the bite taps (P18) and, on the last bite +33 ms, the **completion spread**:

| ms (from last bite) | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|
| 33 | 100 | Props, pile, note | opacity → 0 | outQuad / linear | v4 C1 f204–206 |
| 33 | 280 | Box | `layoutMove` to the left column | inOutCubic | v4 C2 f204–211 |
| 67 | 230 | Letter | `letterPop` | letterPop spring | v4 C3 f205–212 |
| 300 | 1170 | Washi tape | heart burst | outBack / outQuad | v4 C4 f211–246 |
| 300 / 450 / 600 | 280 | Polaroids, deal 1 | `polaroidDeal` | 150 ms stagger | v4 C5 f212–228 |
| 767 / 867 / 1033 | 240–320 | Polaroids, deal 2 | stacked on top | outQuad | v4 C6 f226–237 |
| 1567 | 240 | "xem lại" pill | fade in | outQuad | v4 C7 f250–256 |

### C3. Booth: coin → countdown → 4 flashes → print → toss → land reward

Two tempos are given. **Reference** is the measured tempo (v1, possibly sped up for TikTok). **Product** is for a real self-photobooth, where people need time to pose. It keeps the ratios and the rule that each flash tick is 240 ms long.

**Before t0:**
- Camera stream running and warmed up (≥500 ms of frames).
- Strip compositor worker ready.
- The coin pings (P28).
- Curtain pendulum on (P27).
- Pill reads "thả xu ✦".

t0 = coin tap (v1 f24).

| Reference ms | Product ms | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | Status pill | "cười lên!" (width snaps) | instant | v1 #5 f24 |
| 0 | 0 | 100 | Coin → heart token | coin opacity step; token y −23 px into the slot, motion blur on frame 1 | in | v1 #4 f24–26 |
| 0 | 0 | 110 | Name tags / frame labels | opacity → 0 | outQuad | v1 #6 |
| 200 | 400 | 100 | Digit "3" | `stampPop` | stamp | v1 #7 f30–32 |
| 400 | 1250 | 60 | "3" exit | opacity | linear | v1 #8 |
| 467 | 1300 | 100 | "2" | `stampPop` | stamp | v1 #9 f38 |
| 767 | 2200 | 100 | "1" | `stampPop` | stamp | v1 #11 f47 |
| 1000 | 3100 | 150 | **Flash 1** | `cameraFlash` + **capture** + shake + starburst | linear / steps1 | v1 #13–19 f54–60 |
| 1233 | 3100 + 1×2400 | 150 | Flash 2 | same; product runs a mini "2-1" re-countdown (stamp, 800 ms per digit) before each shot | — | v1 #14 f62 |
| 1500 | 3100 + 2×2400 | 150 | Flash 3 | same | — | v1 #15 f70 |
| 1733 | 3100 + 3×2400 | 150 | Flash 4 | same | — | v1 #16 f77 |
| 2000 | F4 + 233 | 0 | Pill | "đang in..." | instant | v1 #21 f84 |
| 2000 | F4 + 233 | — | Worker | **composite the strip now** (anticipation beat) | — | v1 §5 |
| 2200 | F4 + 433 | 400–700 | Strip 1 mini | `slotPrint` linear at 95–160 px/s | linear | v1 #22 f90–101 |
| 2567 | +367 | 370 (product 600) | Strip 1 | `toss` arc to its gallery slot | toss spring | v1 #23 f101–112 |
| 2933 | land | 230 | Caption 1 | fade in at +33 ms | standard | v1 #24 |
| 2933 | land | 800 | Confetti 1 | fountain, stage overlay | gravity | v1 #25 |
| 3067 | land + 133 | 700 | Strip 2 | print (behind the landed strip) | linear | v1 #26 f116–137 |
| 3767 | | 600 | Strip 2 | toss to the centre | toss spring | v1 #27 f137–155 |
| 4367 | | 230 / 800 | Caption 2 / confetti 2 | — | — | v1 #28–29 |
| 4533 → 5200 | | 700 / 600 | Strip 3 | print, then toss right | — | v1 #30–31 |
| 5800 | | 230 / 800 | Caption 3 / confetti 3 | — | — | v1 #32–33 |
| 5967 | last land + 167 | 0 | Pill | "chạm vào dải ảnh ✦" | instant | v1 #34 f203 |
| 5967 | same | 1170 | Centre strip | `heartBurst` (unlock cue) | outQuad | v1 #35 |
| 6167 | +233 | 610 | Share / download dock | `drawerSlide` (dock variant); the "Còn nữa nè" pill is removed in the same frame | dock | v1 #36–37 f209–228 |

**Self-photobooth (B) mapping:**
- One flash per photo slot (4).
- One strip per frame design, or a single strip for a single layout. The product prints one strip and tosses it, then offers "chụp lại" (retake).
- "Tải về" (download) and "Chia sẻ" (share) live in the dock.
- If the device can't keep up, skip the print feed and toss directly from the booth slot (still 600 ms).

### C4. Letter modal open and close

t0 = tap on a strip or polaroid ("lá thư").

| ms | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|
| 0 | 0 | Hint pill | text cleared | instant | v1 #38 f242 |
| 0 | 100 | Hint chip | fade with the scrim | standard | v1 #38 |
| 67 | 300 | Scrim rgba(70,25,55,.5), no blur | opacity 0 → 1 | standard | v1 #39 f244–252 |
| 67 | 300 | Letter | opacity 0 → 1 (shares the scrim curve) | standard | v1 #40 |
| 67 | 170 | Letter | y +12 → 0, scale .965 → 1, static −1.5° tilt | outQuad (or `spring.modal`) | v1 #40 f244–248 |
| 100 | 300 | Side chips ("lá thư" / "chụp lại") | opacity in, 1 frame behind | standard | v1 #41 |
| 367 | — | Letter body | typewriter (P42) starts if it is the first open | — | v3 M24 |

Persistent media rail and rose CTA stay **above** the scrim (v1 §5).

**Close** (× / Esc / scrim tap), an exact mirror (v1 f422–431):

| ms | dur | Element | Action | Token |
|---|---|---|---|---|
| 0 | 300 | Scrim + letter | opacity 1 → 0 | standard |
| 0 | 130 | Letter | y 0 → +12, scale 1 → .965 | outQuad |
| 300 | 0 | Modal | unmount; return focus to the trigger | instant |

Accessibility: trap focus, Esc closes, `aria-modal`. The "lá thư" chip reopens the letter without re-typing.

### C5. Drawer ("Còn nữa nè" → extras: voice note, bouquet, song, memory map)

t0 = FAB tap.

| ms | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|
| 0 | 0 | "Còn nữa nè" pill | unmount; FAB stays | instant | v4 C8 f308; v5 B-07 f405 |
| 0 | 500 (A) / 570 (B) | Drawer | x off-canvas → 0 | spring.drawer / drawer | v4 C9 f310–325; v5 B-08 |
| 0 | 350 | Drawer | opacity 0 → 1 | outQuad | v5 B-09 f405–415 |
| 0 | 170 | Drawer shadow | darkens what is beneath (FAB ×0.82) | follows | v5 B-M3 |
| 600 | — | Drawer cards | static. Programmatic scroll uses 667 ms `inOutQuad`; user scroll is native with a hard stop (no bounce) | inOutQuad | v4 D1; v5 B-11 |
| close | 240 | Drawer | x → off-canvas, opacity → 0 | in | rule G4 (close not observed) |

No scrim, page stays live, music continues. Any media embed must update the reels and status (P29) from real player events.

### C6. Lightbox (shared element)

t0 = polaroid tap.

| ms | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|
| 0 | 267 | Scrim rgba(47,15,41,.67) | opacity 0 → 1 | linear | v4 D5 f522–529 |
| 0 | 430 | Photo | `sharedLightbox` FLIP; scale .17 → 1.055 peak (about +200 ms) → 1; rotate −4 → −1° | spring.lightbox | v4 D6 f522–534 |
| 430 | 200 | Controls (‹ › × "4 / 6") | opacity 0 → 1 | outQuad | v4 D7 f535–541 |
| swipe | 280 | Next photo | x ±100% crossfade (opacity 0 → 1), no overshoot | outCubic | rule G1 |
| close 0 | 100 | Controls | opacity → 0 | in | rule G4 |
| close 0 | 360 | Photo | FLIP back to the thumbnail, critically damped (`spring.modal`) | modal | rule G1 (close not observed) |
| close 0 | 200 | Scrim | opacity → 0 | linear | v4 D5 mirrored |

Unlike the reference (v4 open question), the drawer and CTA are hidden while the lightbox is open.

### C7. Flower-flood finale (rose CTA, "chỉ chạm khi đã đọc xong")

**Before t0:** the next scene (end card or replay booth) is pre-mounted invisible. The finale atlas is decoded.

t0 = CTA tap (v4 f570). The end uses v1's wipe exit (v1 f473–545), because v4's capture ends mid-wipe.

| ms | dur | Element | Action | Token | Evidence |
|---|---|---|---|---|---|
| 0 | 0 | Drawer, rail, tooltips | unmount | instant | v4 D8 f570; v1 #47 f471 |
| 0 | 100 | CTA icon + hint | fade, icon +8, −12 px | outQuad | v4 D11 |
| 0 | static | Ghost-flower veil | opacity step to .12 | instant | v4 D10; v1 #48 (~.2) |
| 0–133 | — | — | anticipation hold | hold.micro | v4 f571–574 |
| 167 | 100–130 | Hero flower (about 20% of viewport width) | thrown on an arc from the top right to the lower left | in | v4 D12 f575–578 |
| 167 | 167 | Hero flower | spin −120° → 0 → +10°, about 1250°/s | linear | v4 D13 |
| 200 | 130 | Echo trail | 2–3 ghost copies by velocity; gone on impact | — | v4 D14 |
| 300 | 133 | Hero flower | landing settle (+44, +12 px, +10°) | outQuad | v4 D15 |
| 333 | 100 | Impact flash #f6f0e8 | opacity .6 → .3 → .07 → 0, **below** the flowers | outQuad | v4 D16 f580–583 |
| 333 | 33–66 | Rays (10–14) + shockwave ring | 1–2 frame pop | frame | v4 D17–D18 |
| 367 | 450 | Burst mound | emitter; each sprite pops over 2–3 frames | outBack | v4 D19 f581–594 |
| 800 | 400 | Flower wall | rises from below at about 2.5 vh/s (1400 px/s), near-linear | linear | v4 D20 f594–606 |
| 1200 | — | Cover | **full cover**; swap scenes underneath (100–133 ms crossfade) | linear | v4 f606; v1 #52 |
| 1200 | 630 | Flower field | streams upward and clears the top | linear | v4 D21; v1 #49 trailing edge |
| 1830 | 0 | Overlay | unmount; the new scene needs no entrance | instant | v1 §5 rule 10 |
| 1830 | 1400 | Hanging decorations | `pendulum` impulse | pendulum | v1 #53 |

Sound: whoosh at 167, impact on a downbeat at 333 (shift t0 by up to one beat if music is playing), bloom whoosh from 800.

### C8. Lyric / typewriter page synced to BPM

Clock: `audio.currentTime`. Never use setTimeout for beat-locked events (v2a §8).

```
beat = 60000 / BPM          sixteenth = beat / 4
enter(line k)   = beatGrid(k.start)          // on the beat, or +1 frame
hold(line k)    = quantise(k.len, [2, 4, 8] beats)
exit(line k)    = enter(k+1) - 1 beat        // the exit starts about one beat before the next entrance
gap             = 0–200 ms of empty sky between exit end and the next enter
```

Worked example at **76 BPM** (beat 789 ms, the v4 tempo; sixteenth 197 ms) for a 4-line letter page:

| Beat | ms | Element | Action | Token / primitive | Evidence |
|---|---|---|---|---|---|
| −1 | −789 | Sky plate B | `skyCrossfade` 300 ms linear (the backdrop leads the text) | linear | v2a A-E14 (11 f ahead), C-15 |
| 0 | 0 | Line 1 "Gửi em," | `textBlurIn` short (250 ms) | textIn | v2a B-09 (on beat 243) |
| 0 → 4 | 0–3156 | Line 1 | `livingHold` (+3%/s scale, ±2°/s roll) | linear | v2a A-E16 |
| 0.5 | 400 | "e" of "em" | `sparkleGlint` | outQuad | v2a A-E17 |
| 3 | 2367 | Line 1 | `flyThroughExit` (zoom-in direction), 400 ms | flyOut | v2a B-03 |
| 4 | 3156 | Line 2 (16 graphemes) | `glyphMosaicSweep`: ghost 100 ms, then a 40 ms stagger (640 ms) | outQuad | v2a B-12/B-13 |
| 4 → 12 | | Line 2 | hold 8 beats | — | v2a B-14 |
| 11 | 8679 | Line 2 | smear-right exit 630 ms + echo | in | v2a B-17 |
| 12 | 9468 | Line 3 "anh thương em" | `typewriterPop` one grapheme per sixteenth (197 ms) | step | v2a C-04 |
| 16 | 12624 | Line 4 (the name) | `wordByWord`, one word per beat, letter by letter for the climax (155 ms) | step | v2b E17; v2a C-18 |
| 20 | 15780 | Chapter end | `sceneTilt` (y → −80 vh, 670 ms `inQuad`, hard stop), then 1 beat of empty sky (**preload the next chapter here**), then a hard cut on the next downbeat | inQuad / instant | v2a B-20, B-23 |

Non-music letter pages (or reduced audio) use the v3 rate rule instead: `ms = min(127, 3220/n)`.

Ambient layers (petals, clouds, sway) are **never** beat-locked (v2a §8, v4 §8).

---

## 4. Global rules (observed)

| # | Rule | Evidence |
|---|---|---|
| G1 | **No overshoot on calm or large moves.** Drawers, docks, modals, pages, lids, layout moves, camera moves and scrims are critically damped or plain eased. | v4 B7 (refuted landing spring), C2, C9; v1 #37 (ζ 1.9), #39; v5 B-08 ("0 overshoot"); v2b "nothing overshoots" |
| G2 | **Overshoot only on small rewards and arrivals**, capped at about 6% (scale): stamps 2.5–3% dip, sticker 4%, strip toss 5.6%, lightbox 5.35%, letter 1.2%. | v1 #7, #23–31; v4 B8, C3, D6 |
| G3 | **Ambient life is always on while waiting**, and only on the 1–3 things that matter: float, sway, pendulum, hint rings, glints, reels, drift. Hint rings stop at the first interaction. A screen that waits on the user is never fully still. Exception: the calm storybook (v3), where a single wobble on the tap target is the only motion, *because* everything else is still. | v1 #1, #3, #54–55; v4 A6–A8, A12; v5 A-m01, A-e09; v3 M14, M04 |
| G4 | **Exits are ease-in and faster than entrances** (67–133 ms exits; 100–280 ms entrances, eased out, back or spring). Exits accelerate *away* and never decelerate (curtain, whip, fly-through, thrown hero). | v4 §8 rhythm, B4–B5, D12; v5 A-e12; v2a B-03/B-07/B-11 |
| G5 | **Hard cuts for status and state text.** Pill labels, status lines, glyph swaps and hint removal take 0 ms, and the width snaps. Never tween a label. | v1 #5/#21/#34/#36; v4 A9/C8; v5 B-03/B-05/B-07 |
| G6 | **Preload and decode before every transition**, and pre-mount the destination under the cover. Never reveal an un-decoded image: v3 shows a 200 ms freeze plus late photo pops. | v3 M25–M26; v5 A-e12 (pre-mounted page); v2a artifacts; v1 #52 (swap under cover) |
| G7 | **Instant feedback, then a beat of anticipation.** The tap responds on the same frame (token drop, wobble, sprite swap, pill swap), then 67–233 ms micro-holds separate stages, so sequences read as discrete steps. | v1 f24–30 (200 ms), f82–90 (233 + 200); v4 f127–135; v5 f40–43, f55–57 |
| G8 | **Physical things move linearly** (printer feed, flower falls, reels, petals, flash decay); **UI moves eased.** | v1 #22, #49; v5 B-06; v2a petals; v1 #13–16 |
| G9 | **One spectacle per act**, 1.4–3.3 s long, bracketed by fast micro-motion (100–370 ms). Flowers bookend the experience: the intro curtain and the finale flood use the same sprite family. | v4 A1, D20; v5 A-e08; v1 #49 |
| G10 | **Chrome lives above overlays.** The FAB, help and CTA stay on top of transitions, but are hidden under a lightbox (fixing a reference z-bug). | v5 A-e15; v1 z-order; v4 open question |
| G11 | **Scene changes hide behind a cover.** Tear down the old UI in ≤1 frame, start the cover, swap at ≥70% cover, and the new scene needs no entrance. | v1 #47–52; v4 D8–D20 |
| G12 | **Durations are timer-driven, not beat-driven, except lyric pages.** Beat-sync only text in the lyric mode. | v1 §8; v4 §8; v5 §8; v2a §8 |
| G13 | **Diegetic affordances over buttons.** Tap the object itself (envelope, ribbon, coin, treat, strip), with a ring or glint, plus one short typed instruction. | v3 §7; v4 §7; v1 §7 |
| G14 | **Gate the ending.** "Chỉ chạm khi đã đọc xong để tiếp tục": the finale CTA has a gating tooltip and is mounted late, 200 ms after the secondary chrome. | v1 #2; v4 A10–A11 |
| G15 | **Debounce during choreography.** Sequences are non-interruptible until their prompt appears; taps are queued or ignored. | v5 §7; v4 B13 (233 ms taps) |
| G16 | **Media state is truthful.** Animated media indicators follow real `playing`, `pause` and `waiting` events. | v5 B-05, C-e15 (anti-pattern) |

---

## 5. Reduced motion and low-end Android budgets

### 5.1 `prefers-reduced-motion: reduce` (plus an in-app "Giảm chuyển động" toggle)

| Primitive | Reduced behaviour |
|---|---|
| Ambient loops (P25–P31) | **off**: static poses. Hint ring becomes a static 2 px outline. Reels still run while playing, at half speed. |
| `cameraFlash` | Opacity capped at .4, decay 200 ms; **no shake**, no starburst; capture is unchanged. |
| `stampPop` | Opacity-only 100 ms. |
| `toss`, `polaroidDeal`, `letterPop`, `stickerPop`, `sharedLightbox` | Opacity 200 ms `outQuad` in place (lightbox: crossfade plus scrim). |
| `drawerSlide` | Opacity 200 ms plus x 16 px. |
| `lidFlip3D`, `whipOff` | Opacity crossfade 200 ms between states. |
| `flowerWipe`, `gravityCurtain`, `bloomBurst`, `curtainDrop`, finale | **300 ms crossfade** to the destination (a static flower frame may hold for 600 ms). |
| `worldCamera`, `flyThroughExit`, `livingHold`, `sceneTilt` | Crossfade 300 ms; no scale or roll. |
| Typewriter | Full text at once (or by line at 150 ms per line); tap-to-complete is always available. |
| Confetti, hearts, petals, droplets | Off (one static heart icon may fade in). |
| Hard cuts | Unchanged. |

```tsx
import { MotionConfig, useReducedMotion } from "motion/react";
<MotionConfig reducedMotion="user">{app}</MotionConfig>   // disables transform/layout animations; keep opacity
const reduce = useReducedMotion(); const fx = reduce ? REDUCED : FULL; // choreography switch
```
```css
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-iteration-count:1!important;scroll-behavior:auto!important}
 .ambient{animation:none!important}}
```

### 5.2 Device tiers

**Tier detection** runs once on load, then adapts at run time:

```ts
const low = (navigator.hardwareConcurrency ?? 4) <= 4 || ((navigator as any).deviceMemory ?? 4) <= 3;
// runtime probe: measure 30 rAF frames during the first ambient loop; p90 > 20 ms → drop one tier, persist in localStorage (try/catch)
```

| Budget | High | Mid | **Low (Android Go, ≤3 GB, 4 cores)** |
|---|---|---|---|
| Flower curtain / wipe sprites | 80 | 48 | **24** (larger sprites at 15–25% of viewport width keep the cover) |
| Bloom burst sprites | 80 | 48 | **24**, or a pre-rendered video (WebM VP9 alpha + HEVC alpha for iOS) |
| Finale burst + wall | 90 | 50 | **30** + a solid painted wall image rising (1 DOM layer) |
| Petals on screen | 3 (+1 near blurred) | 3 | **2**, no blur |
| Confetti per landing | 15 | 12 | **8** |
| Hearts per burst | 15 | 10 | **6** |
| Glyph spans animated at once | unlimited | 200 | **120** (longer text animates by word, then by line) |
| Blur filters | yes | text only, ≤4 px | **none**: blur-in becomes opacity + scale .98 → 1 |
| Shadows on moving layers | box-shadow | pre-baked shadow PNG | **pre-baked or none** |
| Canvas DPR | min(dpr, 2) | 1.5 | **1** (sprites are soft watercolour, so 1× is invisible) |
| Camera preview (booth) | 1280×720 | 960×540 | **640×480 preview**, full-res `takePhoto()` / ImageCapture at capture |
| Concurrent ambient loops | ≤5 | ≤3 | **≤2**, paused when off-screen (IntersectionObserver) or the tab is hidden |

### 5.3 Canvas vs DOM

| Use **DOM + Motion** (≤12 animated nodes) | Use **one Canvas2D layer** (or PixiJS when high tier and >60 sprites) |
|---|---|
| UI: pills, drawer, modal, letter, lightbox, polaroid deal, stamp, sticker, toss (3 strips), typewriter spans, hint rings, float, sway, pendulum, reels | Flower curtain, wipe, bloom and finale (24–90 sprites), petal field, confetti, heart bursts above 6, droplets |
| Animate only `transform` and `opacity`. Set `will-change: transform` only during the animation, and remove it after `onAnimationComplete`. | One atlas (WebP, ≤2048², 15–20 flower species at 2 sizes), pre-decoded with `createImageBitmap`, drawn with `drawImage` + `setTransform`, no per-frame allocation, rAF clock shared with the audio clock. Pause the loop when idle. |
| Never animate `width`, `height`, `top`, `box-shadow`, `backdrop-filter` or `filter: blur` on low tier. | Flash and impact flash are a DOM `div` (a single opacity layer is cheaper than canvas fill). |

### 5.4 Frame budget per choreography (low tier target: 60 fps with no frame over 33 ms; fall back to a crossfade if the probe fails)

| Choreography | Peak simultaneous work | Low-tier plan |
|---|---|---|
| C1 envelope | 24 sprites + 1 DOM wobble | Canvas; skip the contrast wash (opacity only) |
| C2 box | 3D lid (1 layer) + up to 10 hearts | DOM; `backface-visibility:hidden`; confetti 6 |
| C3 booth | Camera video + flash div + shake + 1 strip toss + 8 flakes | Shake on the booth group only; composite the strip in an OffscreenCanvas worker during "đang in..." |
| C4 / C5 / C6 | ≤4 DOM layers | Unchanged |
| C7 finale | 30 sprites + flash + wall image | Wall as one image layer rising; burst via canvas |
| C8 lyric | ≤40 glyph spans + 2 petals | No blur; mosaic ghost becomes opacity .3 |

**Asset preloading (G6):** fetch the next act's atlas during the current act's reading hold, then `await img.decode()` / `createImageBitmap`. Never start a cover transition before the destination's images are decoded.

---

## 6. Evidence index (quick lookup)

- **v1 booth:** stamp f30–54 · flash f54–82 · print f90–101 · toss f101–198 · confetti f113–223 · heart burst f203–238 · dock f209–228 · modal f244–252 / f422–431 · flower wipe f471–513 · pendulum f503–545
- **v2a lyric:** shimmer f19–55 · blur-in f122–178, f209–247 · living hold f128–190 · fly-through f191–266 · mosaic sweep f264–286, f357–367 · tilt f417–437 · notepad typewriter f499–523 · swoop f524–577 · polyline cards f580–668 · rising parallax f671–800
- **v2b lyric:** hard cut f807→808 · diagonal wipe f871–877 · world camera f877–1064 · lazy-susan f898–1087 · hand present f1005–1040 · word-by-word f1017–1133 · breathing zoom f1090–1235 · focus push f1235–1261 · handheld sway f1261–1676 · write-on f1265–1291 · droplets f1401–1610
- **v3 storybook:** typewriter f11–91, f135–229, f508–604 · crossfade f129–137, f267–276, f506–513 · idle wobble f272–384 · decode jank f514–522
- **v4 box:** gravity curtain f4–71 · sway f97+ · hint rings f68–117 · glints f104–113 · ribbon f114–134 · lid f136–143 · sticker f143–148 · bites f167–203 · spread f204–256 · drawer f310–325 · lightbox f522–541 · finale f570–610
- **v5 envelope:** float f1–31 · wobble f32–39 · paper dip f44–54 · bloom f58–156 · prompt f152–158 · curtain drop f189–235 · hover f258–263 · active swap f312–316 · reels f364+ · drawer f405–422
