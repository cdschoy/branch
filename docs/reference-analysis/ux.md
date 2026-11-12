# Experience Architecture: gift card (A) and self-photobooth (B)

This file is the UX layer that sits between the evidence and the build. It covers:

- **Section 1:** the interaction grammar extracted from the five verified reports.
- **Section 2:** how the 16:9 references adapt to portrait phones (390×844 and 360×780).
- **Sections 3–4:** the gift card. Section 3 is the sender's creator flow. Section 4 is the recipient's reveal as a scene graph plus XState machines.
- **Section 5:** the self-photobooth, also with XState machines.
- **Section 6:** sound and haptics.
- **Section 7:** privacy, accessibility and edge cases.
- **Section 8:** an anti-pattern register.

Sibling files: `motion.md` (primitive IDs P01–P43, choreographies C1–C8, global rules G1–G16, device tiers) and `visual.md` (themes, fonts, colours). Motion names used here (`tapWobble`, `curtainDrop` …) are the primitive names from `motion.md §2`. Evidence uses the form `vN fA–B` (video N, frames A to B at 30 fps).

**IP rule.** Reproduce the motion feel and the interaction logic only. All envelopes, boxes, booths, flowers, treats and characters are **original illustration**. Do not reuse the reference art, the reference names ("Emma & Liam", "Noah", "Alex/Sam"), the platform names on screen, or the licensed mascot from v3 (v3 placement is a layout lesson only). All Vietnamese copy here is our own.

**Fonts:** only faces with **verified full 74/74 Vietnamese coverage** (`metrics/fonts_vietnamese.txt`) are used:

- UI: Be Vietnam Pro
- handwriting: Mali, Patrick Hand, Itim, Pangolin
- script: Dancing Script, Charm, Great Vibes
- signature: Playwrite VN
- serif: Playfair Display
- display: Paytone One, Dela Gothic One, Anton, Grandstander

Never use Caveat, Sacramento, Parisienne, Fredoka, Bebas Neue, Lilita One, Gochi Hand or Special Elite.

---

## 1. Interaction grammar (extracted)

### 1.1 The grammar in one sentence

> **Show one living object. Make it the only thing that moves. Answer the touch on the same frame. Hold for a beat. Play one spectacle. Hand the reader a still page they control. Keep the extras in a non-modal drawer. Gate the ending.**

### 1.2 Tap affordances (the "tap me" vocabulary)

| Affordance | What it looks like | When used | Evidence | Primitive |
|---|---|---|---|---|
| **Idle float** | translateY ±2.5 px, 3 s sine. The envelope is the only moving element | Hero object waiting for its first tap | v5 f1–31 (A-m01) | P25 `idleFloat` |
| **Idle wobble** (irregular) | x ±4% of width, y +6%, rotate −1.5°…+10°, 3.8 s irregular loop, origin 50% 90% | Calm "storybook" theme. Everything else is static, which is *why* it reads as tappable | v3 f272–384 | P15 variant `idleWobble` |
| **Trapezoid sway** | rotate 0↔2.7°, 800 ms, origin bottom | 1–2 hero props. Signals "alive", not "tap" | v4 A6 f97→204 | P26 |
| **Hint ring** | 30 px white ring at 55% opacity, scale 1→1.95 linear 800 ms. A faster 300 ms second pulse follows. Repeats with a 0.5–1 s cadence | Exact hotspot (ribbon knot, coin) | v4 A7–A8b f68–117; v1 #3 f14–23 | P28 |
| **Satin glint chase** | +4% brightness glints hop along the drag path ~65 ms apart, with a sparkle at the knot | **Draggable** objects. The path *shows the direction* of the gesture | v4 A12 f104–113 | P24 |
| **Coin shimmer** | +2–4 luma rim pulses at irregular 0.3–1.5 s intervals | Re-invites after a reset loop | v1 #55 f517–616 | P24 |
| **Typed diegetic instruction** | One short line naming the object ("chạm vào chiếc bánh để mở quà") | Every gate | v3 f271–359; v4 B9 f143–146 | P42 |
| **Timed prompt** | Script line fades in over 200 ms ease-out to .85 opacity at a fixed **+4.0 s** after the triggering tap. Removed instantly on the next tap | After a spectacle that would otherwise leave the user unsure whether to wait | v5 A-e10 f152–158, A-e11 f189 | P08 |
| **Hover grow** | scale 1.04–1.06, 130–200 ms | Pointer devices only. **Never** the only affordance on touch | v5 B-02, B-M2 | P17 |
| **Cursor change** | arrow → pointer on hotspots | Desktop only. v5 forgot it on the full-screen wall | v5 f17; v5 §7 rec. | — |

**Escalation ladder (our rule; it builds on these observations).** A waiting hotspot escalates on timers measured from when it became interactive:

| t | Cue |
|---|---|
| 0 s | ambient only (float / sway) |
| +1.2 s | hint ring starts (v4 ring #1 at f68 ≈ 1.1 s after the curtain clears) |
| +4.0 s | timed prompt (v5) |
| +8 s | glint chase or ring at double cadence |
| +15 s | the typed instruction re-types once, plus one `navigator.vibrate(10)` (Android) |

Never escalate past this. The first touch anywhere cancels the whole ladder (rule G3: "hint rings stop at the first interaction").

### 1.3 Feedback on touch (same frame, then a beat)

| Pattern | Spec | Evidence |
|---|---|---|
| Same-frame acknowledgement | The tap changes something within ≤1 frame: wobble starts, token drops, sprite swaps, status pill swaps | v5 f32 (wobble 1 f after tap); v1 f24 (token + pill same frame); v4 B13 (bite on pointerdown) |
| Keeps a "handled" pose | After `tapWobble` the envelope rests at −1° instead of 0 | v5 A-e03 |
| Micro-hold | 67–233 ms of nothing between stages, so each stage reads as a step | v5 f40–43, f55–57; v4 f128–129, f134–135, f571–574; v1 f24→30 (200 ms), f82→90 (233+200) |
| Press squash | Container scale(1.01, .995) while the finger is down, released in ≤2 frames, no bounce | v4 B16 |
| No press state (anti-pattern) | v3 buttons give no feedback at all. **We add** `pressSquash` or scale .97 for 60–80 ms and fire on pointerup | v3 §4 item 8 |

### 1.4 Gating and progress

| Gate type | Mechanic | Progress copy (VN, ours) | Evidence |
|---|---|---|---|
| **Single object tap** | Tap the envelope or the cake | "Chạm để mở" → (after spectacle) "Chạm để tiếp tục" | v5 f1–189; v3 f271–384 |
| **Gesture with threshold** | Drag the ribbon ~50 px, with a tap fallback | "Kéo dải ruy băng nhé" | v4 B1–B6, §7 |
| **Cumulative taps** | 3 items × 2 bites = 6 taps. The first bite of each item pops a caret note carrying the count | "Tìm thấy trong bánh donut · còn 2 món nữa" → "còn 1 món nữa" → auto-advance | v4 B13–B18, f167–203 |
| **Binary choice** | "Có!!" / "Để sau" | "Anh/Em có một bất ngờ… muốn xem không?" | v3 f135–267 (the "no" branch was never captured) |
| **Ritual trigger** | Coin drop starts a non-interruptible sequence | "thả xu ✦" → "cười lên!" → "đang in…" → "chạm vào dải ảnh ✦" | v1 #5, #21, #34 |
| **Finale gate** | Corner CTA plus tooltip, mounted late | "Chỉ chạm khi đã đọc xong để tiếp tục" | v1 #2; v4 A10–A11, D11 |

**Auto-advance rule.** When the gate's goal is reached, advance automatically 1 frame later (v4 f203 → f204: 6th bite → props fade). Do not ask for one more "next" tap. After a *reading* surface, never auto-advance (v1 letter open ~5.6 s, user-closed; v3 every page user-paced).

**Debounce rule (G15).** From the trigger tap until the next prompt mounts, ignore taps on the stage. Queue at most one tap so a double-tap does not skip the spectacle. A tap on the **stage** during a spectacle may *fast-forward* it (time-scale ×3 to its end state). It must never skip it. This is our addition for impatient re-openers; v5 is non-interruptible for 4.0 s.

### 1.5 Status copy as a state label

The status pill is a **state label, not a message**:

- the text swaps with 0 ms and the width snaps (G5)
- states: "thả xu ✦" → "cười lên!" → "đang in…" → "chạm vào dải ảnh ✦" (v1 f24, f84, f203)
- media states: selected (instant) → "Đang mở: …" → "Đang phát: …" on the real `playing` event (v5 B-03, B-05: 1.73 s from click to playing)

We also mirror each label to an `aria-live="polite"` region.

### 1.6 Non-modal drawers, scrims and modals

| Surface | Modality | Scrim | Spec | Evidence |
|---|---|---|---|---|
| **Extras drawer** ("Còn nữa nè" → voice note, bouquet, songs, map) | **Non-modal**. The page stays live and the music continues | **none** (no backdrop dim) | slide 500–570 ms, no overshoot, heavy warm shadow | v4 C9 f310–325; v5 B-08 f405–422 |
| **Media dock** | non-modal | none | slide 610 ms, overdamped | v1 #37 f209–228 |
| **Letter modal** | modal (light) | plum rgba(70,25,55,.5), no blur, 300 ms `ease` | card y+12→0, scale .965→1, mirrored close | v1 #39–46 f244–252, f422–431 |
| **Lightbox** | modal | plum 67%, linear 267 ms | shared-element spring, controls fade in after the FLIP | v4 D5–D7 f522–541 |

Rules:

1. Drawers never dim.
2. Modals dim with **plum, never black**, and never blur.
3. The media rail may stay live above the *letter* scrim (v1 does this on purpose, so the music stays usable).
4. **Nothing sits above the lightbox scrim** except its own controls. v4 left the drawer and rose CTA above it (a probable z-bug, see §8).

### 1.7 Floating chrome and z-order

Layers, bottom → top, merged from v1 §6 "Z-order", v4 §6 and v5 A-e15:

| z | Layer | Contents | Pointer events |
|---|---|---|---|
| 0 | `world` | painted background (wall, gingham, cream) | none |
| 10 | `stage` | hero object, props, booth group, strips, letter page | yes |
| 20 | `stage-fx` | confetti, hearts, starburst (**not clipped** to cells, v1 #25) | none |
| 30 | `flash` | camera flash / impact flash | none |
| 40 | `hud` | status pill, typed instruction, chips ("thư", "chụp lại") | yes |
| 50 | `scrim` | letter scrim | yes (tap = close) |
| 60 | `modal` | letter card | yes |
| 70 | `chrome` | heart FAB + "Còn nữa nè" pill, rose CTA + tooltip, sound toggle, drawer, media dock | yes |
| 80 | `lightbox` | lightbox scrim + photo + controls. **`chrome` is hidden or set inert while open** | yes |
| 90 | `cover` | flower curtain, bloom, curtain drop, finale flood | yes during cover (debounce) |
| 100 | `system` | toast, permission sheets, "Mở bằng trình duyệt" banner | yes |

Chrome sits above covers *except* during the cover itself. v5 keeps chrome above the flower overlay (A-e15). v4 tears chrome down before the finale (D8, D11). We **hide chrome for the duration of a cover** and re-mount it hard-cut afterwards (v4 A9).

**Chrome mount timing:**

- secondary chrome (pill + FAB) hard-cuts in at **+3.0 s** after the scene is interactive (v4 A9 f91)
- the primary CTA follows **+200 ms** later with `chromeNudge` and a 167 ms tooltip rise (v4 A10–A11 f97–103)
- v5 mounts on first pointer move (f17). Phones have no hover, so **use the timer**

### 1.8 Completion cues

| Moment | Cue | Evidence |
|---|---|---|
| Item landed | caption fade 230 ms at +33 ms, confetti fountain 800 ms | v1 #24–25 |
| Next step unlocked | heart burst on the target (1.1 s) **and** the state label swap | v1 #34–35 f203–238 |
| Reveal opened | sticker `outBack` +4%, caption, heart confetti, staggered pennants | v4 B8–B11 f143–154 |
| Letter arrived | letter pop 1.2% overshoot, heart burst on the washi tape | v4 C3–C4 f205–246 |
| Section complete | "xem lại" pill fades in ~1.5 s after the advance | v4 C7 f250–256 |
| **Letter fully typed** (missing in v3) | after 600–1000 ms: a small heart pop at the signature, and the finale CTA tooltip becomes active | v3 f605–669 static, no end control (anti-pattern) |

### 1.9 Pacing template (per act)

Each act follows the same template:

1. Instant feedback (0–33 ms).
2. Micro-hold (67–233 ms).
3. **One** spectacle (1.4–3.3 s).
4. A still reading surface (user-paced).
5. Late chrome (+3 s).
6. Gated exit.

Evidence for the template:

- v5: wobble → bloom 3.3 s → prompt → curtain 1.53 s → page
- v4: curtain 2.2 s → pull → lid 280 ms → treats → spread → finale
- v1: coin → 2.9 s capture → print 3.5 s → letter → wipe 1.4 s
- v3: ~4–5 s per page = crossfade + typing + hold

---

## 2. Mobile-first portrait adaptation

All references are 16:9 desktop captures (1016–1024 px wide, probably ~1920 CSS px; v4 note ×1.875). Our build is designed at **390×844** (iPhone 13–15 class), with a **360×780** floor for low-end Android (Android Go, Zalo in-app webview).

### 2.1 Global layout rules

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Size every full-screen scene with **`100dvh`** (fallback `100svh`) and **never `100vh`**. The Zalo, Messenger and Facebook webviews add a top bar and change height on scroll.
- Pad chrome with `env(safe-area-inset-*)` plus 16 px.
- **Stage box:** each scene is authored in a 390×844 coordinate space and scaled with `min(100vw/390, 100dvh/844)`. Letterbox colour = the theme's `world` colour (never black). On 360×780 the scale is 0.923. Painted backgrounds bleed full-bleed outside the stage box, and only the stage content scales.
- **Thumb zone:** primary interaction sits in the lower 60% of the screen. Chrome sits bottom-left (FAB + pill) and bottom-right (sound/menu). The rose/finale CTA moves from **top-right** (v1, v4) to **bottom-right, above the sound toggle**. The tooltip sits above it.
- **Tap targets:** at least 44×44 CSS px, including hotspots on painted objects (invisible hit areas extend 12 px past the art).
- **Text floor:** at 360 px wide, body is at least 15 px and captions at least 13 px. Vietnamese stacked marks (Ễ, Ặ, Ỗ) need `line-height ≥ 1.35` for hand fonts and 1.3 for caps (visual.md §3.4).
- **Landscape:** support rotation by re-flowing to the desktop composition when `aspect-ratio > 1.2`. Never show "please rotate".

### 2.2 Scene-by-scene adaptation

| Scene (reference) | Desktop composition (ref) | 390×844 | 360×780 (low tier) |
|---|---|---|---|
| **Envelope landing** (v5 f1–31) | envelope 13.6% vw, centred, prompt 180 px below | envelope **58% vw (226 px)** at y 44%; prompt "Chạm để mở" (Dancing Script 28 px) 32 px below; FAB bottom-left | envelope 60% vw; same, prompt 26 px |
| **Bloom burst → wall** (v5 f58–188) | radial emitter to full-bleed 16:9 | the emitter centre stays on the envelope; sprites sized 30–45% vw, so fewer sprites cover a narrow screen (**36** on mid) | **24 sprites** at 35–50% vw, or a pre-rendered alpha video 540×1170 |
| **Curtain drop** (v5 f189–235) | wall falls ~572 px (99% vh) | falls `105dvh` = 886 px over 1.4 s, which is *faster* in px/s. Keep the duration and keep the ease-in | same; skip the contrast wash (opacity only) |
| **Booth room** (v1) | booth 27% width, centred; 3 strips fanned in a row | booth **72% vw** at the top half (y 8–52%), coin plate at the right of the booth window; status pill top-centre under the safe area | booth 70% vw; curtain sway stays; starburst size ×0.8 |
| **Strip gallery** (v1 f101–203) | three 119×381 strips fanned −3.6°/+1.3°/+4° side by side | **fan of 3 overlapped** at strip width 30% vw, fanned −6°/0°/+6°, lower half (y 52–92%); tap fans them out to a horizontal **snap carousel** (one strip 62% vw) | the carousel only (no fan); captions under the active strip |
| **Wrapped box flat-lay** (v4 f71–136) | box centred at 41% width; props left column + right | box **78% vw** centred at y 42%; props reduced to 2 above and 2 below (they crop off the edges on purpose, as a flat-lay); instruction under the box | props: 2 only; milkshake sway is the only ambient loop |
| **Treats** (v4 f143–203) | 3 treats in the box, notes caret-anchored under each | treats keep in-box positions (box is 78% vw, so each treat target is ≥ 64 px); note bubble caret-anchored, clamped to 16 px gutters | same |
| **Letter spread** (v4 f204–256) | two columns: box left, letter + polaroid row right | **one column**: the box `layoutMove`s to a 72 px badge top-left (not off-screen); letter card full-width minus 32 px, scrolls in the page; polaroid row becomes a horizontal snap row under the letter; "xem lại" pill at the end | same; the polaroid row shows 1.4 cards so the overflow is visible |
| **Letter modal** (v1 f244–431) | 240×313 card, −1.5°, centred | **bottom sheet-like card** 92% vw, max-height 78dvh, inner scroll; −1° tilt; close × 44 px; swipe down closes | tilt 0°; no washi shadow |
| **Songs page** (v5 f236→) | paper column 45% vw, cassette hero, 2-column row (tracks / liner note) | full-width paper with 16 px margin; cassette 80% vw; track list below; liner note collapses into an expandable sticky ("Lời nhắn kèm theo"); CTA at the end | the cassette is a static illustration with two CSS-rotated reels (no canvas) |
| **Extras drawer** (v4 C9, v5 B-08) | 282×393 side popover (v5) / 22% right drawer (v4) | **non-modal bottom sheet** with detents: peek 88 px (shows the voice-note pill) / half 52dvh / full 92dvh; drag handle; the page above stays live and scrollable at peek/half; no dim | detents peek/full only |
| **Media dock** (v1) | right rail x785–1008 | **mini player bar** docked above the FAB row (56 px): title + play + progress; tap expands into the drawer | same |
| **Lightbox** (v4 D5–D7) | centred polaroid, prev/next, "4 / 6" | full-screen; swipe left/right; **drag down to dismiss** (FLIP back to the thumb); counter top-centre; close top-right | crossfade instead of the spring FLIP when the probe says low |
| **Memory map** (v1, v4 cards) | small map card in the rail | full-sheet map inside the drawer at full detent; pins open a polaroid card | static map image with pins (no tile engine) |
| **Lyric chapter** (v2a/v2b) | 16:9 script lyrics, camera tour | lyrics centred in the top 60%; script 44–56 px; the world-camera tour crops to portrait (the world canvas is authored 1170×2532) | no blur; one petal tier; camera tour becomes crossfades |
| **Finale flood** (v4 f570–610) | rose thrown from the top-right, wall rises | the rose is thrown from the bottom-right CTA position upward on an arc to the centre; the wall rises from the bottom | wall = one painted image layer rising + 30 sprites |
| **Booth camera (B)** | n/a | live preview 4:3 or 3:4 in the upper 64%; shutter 76 px bottom-centre; frame picker as a horizontal chip row | preview 640×480, CSS-scaled |

---

## 3. Product A: sender creator flow

### 3.1 Principles

1. **Draft-first.** Every field autosaves: an IndexedDB draft immediately, a server draft debounced 1.5 s, both wrapped in try/catch. The sender can leave and return from the same device. "Bản nháp đã lưu" shows as a 0 ms status label.
2. **The preview is the product.** A mini live preview (phone frame, 40% scale) stays pinned at the top on step pages, and plays the *real* recipient machine with fast-forward.
3. **Everything except a name and a letter is optional.** Minimum viable gift = theme + recipient name + letter. Each optional step has "Bỏ qua".
4. **Ten steps, three groups**, shown as a 3-dot progress (Chuẩn bị · Nội dung · Gửi). Never a 10-step bar.

### 3.2 Steps

| # | Group | Step (VN title) | Contents | Validation / guards | Notes |
|---|---|---|---|---|---|
| 1 | Chuẩn bị | **Chọn kiểu mở quà** | Mechanic: *Phong thư* (envelope → bloom → curtain, v5) · *Hộp quà* (ribbon → lid → treats, v4) · *Photobooth* (coin → countdown → strips, v1) · *Sổ tay* (storybook typewriter, v3 grammar). Each card loops a 3 s silent preview | one required | default *Phong thư* |
| 2 | Chuẩn bị | **Chọn chủ đề** | Themes from visual.md: `garden-envelope`, `sweet-gingham`, `booth-stripes`, `cloud-lyric`, `starry-notebook`; occasion tag (sinh nhật, kỷ niệm, 14/2, 8/3, 20/10, xin lỗi, chỉ vì thương) only changes default copy | one required | the mechanic × theme matrix follows visual.md "Theme pairing" |
| 3 | Chuẩn bị | **Gửi cho ai** | recipient display name (≤24 graphemes), sender name, pronoun pair (anh/em, em/anh, tớ/cậu, custom), optional opening question ("Muốn xem bất ngờ không?") | names required | the pronoun pair drives all auto-copy ("Gửi em", "thương anh") |
| 4 | Nội dung | **Ảnh kỷ niệm** | upload 1–12 photos; crop to 1:1 (polaroid) or 3:4; caption ≤40 graphemes; drag to reorder; choose the **cover photo** (used in the strips or the lid sticker) | ≥1 if the mechanic is *Photobooth* (needs 3–4, see below) | client-side resize, EXIF strip (§7) |
| 5 | Nội dung | **Viết thư** | greeting, body (≤1,200 graphemes), signature (Playwrite VN preview); font choice from 3 verified hands; "Xem thử gõ chữ" plays the typewriter | body ≥ 1 grapheme | counts with `Intl.Segmenter('vi')`; never intercept `keydown` (Telex/VNI IME composition, see §7.4) |
| 6 | Nội dung | **Lời nhắn thoại** | record ≤60 s, live waveform, play back, re-record, trim start/end | optional | MediaRecorder: `audio/webm;codecs=opus` (Android), `audio/mp4` (iOS); normalise to −16 LUFS server-side |
| 7 | Nội dung | **Bài hát** | paste up to 5 links: YouTube, Spotify, Zing MP3; set the **main song** (plays after opening) and a YouTube start time (e.g. the chorus; v4 D3 starts at 1:00); per-song liner note ≤140 graphemes | optional; link must parse | see §3.4 |
| 8 | Nội dung | **Bản đồ kỷ niệm** | pins: search a place or drop a pin; date; photo from step 4 or new; note ≤80 graphemes; order = story order | optional; ≤20 pins | privacy notice (§7.2) |
| 9 | Gửi | **Hẹn ngày mở** | "Mở ngay" or a date + time in **Asia/Ho_Chi_Minh** (shown as "giờ Việt Nam"); optional passcode (4–8 chars, with a hint, e.g. "ngày mình quen nhau, ddmm") | date in the future | server-enforced (§3.5) |
| 10 | Gửi | **Xem trước & gửi** | full-screen preview (§3.6), then share (§3.7) | all required fields | publishing freezes a version; edits after sharing create v2 and keep the same link (until opened, see §3.7) |

**Mechanic-specific content needs:**

| Mechanic | Photos | Uses |
|---|---|---|
| Phong thư | 0–12 | polaroid deal after the letter; lightbox |
| Hộp quà | 0–12; 3 "treats" need 3 short notes (≤60 graphemes each, auto-suggested) | notes in caret bubbles ("tìm thấy trong bánh donut") |
| Photobooth | **4 required** (a 1×4 strip) + optional 8 more for strips 2–3 | the recipient's coin drop "prints" the sender's photos into strips |
| Sổ tay | 0–6 | pages with typed headline, yes/no gate, gift photo, letter collage |

### 3.3 Upload UX

- Use `<input type="file" accept="image/*" multiple>`. iOS converts HEIC to JPEG for this input. Keep a `heic2any` lazy fallback for desktop drag-drop of `.heic`.
- **Decode → resize → strip, on device, in a worker:**
  - `createImageBitmap(file, {imageOrientation:'from-image'})`
  - draw to an OffscreenCanvas at long edge 2048 px (thumb 480)
  - encode WebP q .86 (JPEG q .88 fallback)
  - this drops EXIF, including GPS, by construction
- Upload with a per-photo progress ring on the thumbnail. A failed upload shows a 0 ms "Thử lại" chip on that thumbnail and does not block the flow.
- Ask "Chọn ảnh bìa" once two or more photos exist. The default is the first.

### 3.4 Songs: link parsing and playback contract

| Service | Accepted links | Parse → embed | Recipient playback | Truthful state source (G16) |
|---|---|---|---|---|
| **YouTube** | `youtube.com/watch?v=`, `youtu.be/`, `music.youtube.com/watch?v=`, `/shorts/` | video ID → **IFrame Player API** (`youtube-nocookie.com`), `playsinline=1`, `start=` | autoplay only after the recipient's opening tap (gesture) | `onStateChange`: PLAYING / PAUSED / BUFFERING / ENDED |
| **Spotify** | `open.spotify.com/track|album|playlist/…`, `spotify:` URIs | oEmbed for title/art → **Embed iframe** (the iFrame API `EmbedController` where available) | logged-out users get previews in many regions; label "Nghe đầy đủ trên Spotify" | `playback_update` events (EmbedController); otherwise treat as unknown and **do not animate reels** |
| **Zing MP3** | `zingmp3.vn/bai-hat/…`, `zingmp3.vn/album/…` | no reliable public embed API: store the URL plus sender-entered title/artist; fetch OG metadata server-side for art if available | **link-out card** ("Mở trong Zing MP3") that opens the app/web in a new tab | no in-page state, so no reel animation; show a static cassette |

- Parse on paste, then show the song card with art and title within 600 ms (or a skeleton). An unknown host gets an inline error: "Link này chưa hỗ trợ, thử YouTube, Spotify hoặc Zing MP3 nhé."
- One "main song" may be marked "phát sau khi mở quà". Only YouTube and Spotify can be main. A Zing main falls back to the card plus "Chạm để nghe".
- The cassette reels and the "Đang phát" status are bound to the real state source. If there is none, they stay still (v5 C-e15 anti-pattern).

### 3.5 Scheduled unlock (security matters)

- Content for a locked gift is **not served** before `unlockAt`. The API returns only the theme, the recipient name, `unlockAt` and the OG card. Never hide it in client JS.
- The recipient sees a **locked scene**: the closed hero object with a slow float, and "Còn 2 ngày 4 giờ nữa" counting down. The countdown flips to the opening scene by itself at T−0 (server time offset computed on load).
- Optional passcode: compare server-side with rate limiting (5 tries / 10 min). Show the hint under the field. The wrong-code feedback is a `tapWobble` on the field (233 ms) plus `vibrate([40,30,40])`.

### 3.6 Preview

- Plays the exact recipient machine with `context.preview = true`:
  - a "Bản xem trước" ribbon at the top
  - a ⏩ fast-forward chip (time-scale ×3)
  - "Đi đến: Mở quà · Thư · Ảnh · Nhạc · Kết" jump chips
- Includes the low-tier toggle "Xem như máy yếu" and a 360×780 frame toggle, so senders can see what most recipients see.

### 3.7 Share

- **Publish** creates a 22-character URL-safe random slug (≥128 bits). The link looks like `qua.example/t/Xk3…` (domain TBD).
- Share sheet order on mobile:
  1. **Web Share API** (`navigator.share({title, text, url})`), which covers Zalo and Messenger when installed
  2. "Gửi qua Zalo" (Zalo share button SDK / deep link)
  3. "Gửi qua Messenger" (`fb-messenger://share?link=` on mobile; the Send dialog on desktop)
  4. "Sao chép link"
  5. "Mã QR" (shows a QR on a printable themed card; "Lưu ảnh QR" PNG 1080×1350 for printing into a real card)
- **OG preview:** `og:image` is a **closed** hero (sealed envelope / wrapped box / booth with "thả xu ✦"). It never shows photos or the letter. The title is "{Sender} gửi {Recipient} một món quà 💌" and the description is "Chạm để mở". Locked gifts add "Mở vào 20/10".
- **After share:** the dashboard shows the state chips *Đã gửi* → *Đã mở* (opt-in read receipt, §7.2) and *Đã trả lời*. Edits are allowed until the first open. After that, a new version needs "Gửi bản cập nhật", which shows the recipient an "Có cập nhật mới" pill.
- Revoke: "Thu hồi link" makes the link return a soft "Món quà này đã được thu hồi" page.

### 3.8 Creator machine (XState v5 style)

```ts
import { setup, assign, fromPromise } from "xstate";

type Mechanic = "envelope" | "box" | "booth" | "notebook";
interface Draft {
  mechanic?: Mechanic; theme?: string; occasion?: string;
  to?: string; from?: string; pronouns?: [string, string]; question?: string;
  photos: { id: string; status: "local" | "uploading" | "done" | "error"; caption?: string }[];
  coverId?: string;
  letter: { greeting: string; body: string; signature: string; font: "Mali" | "Patrick Hand" | "Itim" };
  voice?: { id: string; durationMs: number };
  songs: { url: string; service: "youtube" | "spotify" | "zing"; main?: boolean; startSec?: number; note?: string }[];
  pins: { lat: number; lng: number; date?: string; photoId?: string; note?: string }[];
  unlockAt?: string /* ISO, Asia/Ho_Chi_Minh */; passcode?: { hash: string; hint: string };
}

export const creatorMachine = setup({
  types: {
    context: {} as { draft: Draft; giftId?: string; slug?: string; dirty: boolean; error?: string },
    events: {} as
      | { type: "PICK_MECHANIC"; mechanic: Mechanic } | { type: "PICK_THEME"; theme: string }
      | { type: "EDIT"; patch: Partial<Draft> } | { type: "ADD_PHOTOS"; files: File[] }
      | { type: "PHOTO_UPLOADED"; id: string } | { type: "PHOTO_FAILED"; id: string }
      | { type: "REC_START" } | { type: "REC_STOP" } | { type: "REC_DISCARD" }
      | { type: "PASTE_SONG"; url: string } | { type: "ADD_PIN"; pin: Draft["pins"][number] }
      | { type: "NEXT" } | { type: "BACK" } | { type: "SKIP" } | { type: "GOTO"; step: string }
      | { type: "PREVIEW" } | { type: "CLOSE_PREVIEW" } | { type: "PUBLISH" }
      | { type: "SHARE"; channel: "native" | "zalo" | "messenger" | "copy" | "qr" },
  },
  guards: {
    hasMechanic: ({ context }) => !!context.draft.mechanic,
    hasTheme: ({ context }) => !!context.draft.theme,
    hasNames: ({ context }) => !!context.draft.to?.trim() && !!context.draft.from?.trim(),
    photosOk: ({ context }) =>
      context.draft.mechanic !== "booth" || context.draft.photos.filter(p => p.status === "done").length >= 4,
    noUploadsPending: ({ context }) => !context.draft.photos.some(p => p.status === "uploading"),
    hasLetter: ({ context }) => context.draft.letter.body.trim().length > 0,
    unlockValid: ({ context }) => !context.draft.unlockAt || Date.parse(context.draft.unlockAt) > Date.now(),
    readyToPublish: ({ context }) => /* all of the above */ true,
  },
  actors: {
    saveDraft: fromPromise(async ({ input }: { input: Draft }) => { /* IndexedDB now + PUT /drafts debounced */ }),
    publish: fromPromise(async ({ input }: { input: Draft }) => ({ giftId: "…", slug: "…" })),
  },
  actions: {
    patch: assign({ draft: ({ context, event }) => ({ ...context.draft, ...(event as any).patch }), dirty: true }),
    statusLabel: (_, p: { text: string }) => { /* 0 ms label swap + aria-live (G5) */ },
  },
}).createMachine({
  id: "creator",
  context: { draft: { photos: [], letter: { greeting: "", body: "", signature: "", font: "Mali" }, songs: [], pins: [] }, dirty: false },
  type: "parallel",
  states: {
    autosave: {                                   // runs beside the wizard
      initial: "clean",
      states: {
        clean: { on: { EDIT: "dirty", ADD_PHOTOS: "dirty", ADD_PIN: "dirty", PASTE_SONG: "dirty" } },
        dirty: { after: { 1500: "saving" }, on: { EDIT: { target: "dirty", reenter: true } } },
        saving: {
          invoke: { src: "saveDraft", input: ({ context }) => context.draft,
            onDone: { target: "clean", actions: { type: "statusLabel", params: { text: "Bản nháp đã lưu" } } },
            onError: { target: "dirty", actions: { type: "statusLabel", params: { text: "Chưa lưu được, đang thử lại…" } } } },
        },
      },
    },
    wizard: {
      initial: "mechanic",
      states: {
        mechanic: { on: { PICK_MECHANIC: { actions: "patch" }, NEXT: { guard: "hasMechanic", target: "theme" } } },
        theme:    { on: { PICK_THEME: { actions: "patch" }, NEXT: { guard: "hasTheme", target: "people" }, BACK: "mechanic" } },
        people:   { on: { EDIT: { actions: "patch" }, NEXT: { guard: "hasNames", target: "photos" }, BACK: "theme" } },
        photos:   { on: { ADD_PHOTOS: {/* spawn upload actors */}, NEXT: { guard: "photosOk", target: "letter" },
                          SKIP: { guard: "photosOk", target: "letter" }, BACK: "people" } },
        letter:   { on: { EDIT: { actions: "patch" }, NEXT: { guard: "hasLetter", target: "voice" }, BACK: "photos" } },
        voice: {
          initial: "idle",
          states: {
            idle: { on: { REC_START: "recording" } },
            recording: { after: { 60000: "review" }, on: { REC_STOP: "review" } },   // hard cap 60 s
            review: { on: { REC_DISCARD: "idle", REC_START: "recording" } },
          },
          on: { NEXT: "songs", SKIP: "songs", BACK: "letter" },
        },
        songs:    { on: { PASTE_SONG: {/* parse → patch or inline error */}, NEXT: "map", SKIP: "map", BACK: "voice" } },
        map:      { on: { ADD_PIN: { actions: "patch" }, NEXT: "schedule", SKIP: "schedule", BACK: "songs" } },
        schedule: { on: { EDIT: { actions: "patch" }, NEXT: { guard: "unlockValid", target: "review" }, BACK: "map" } },
        review: {
          initial: "summary",
          states: {
            summary: { on: { PREVIEW: "previewing",
                             PUBLISH: { guard: "noUploadsPending", target: "publishing" } } },
            previewing: { /* mounts recipientMachine with context.preview = true */ on: { CLOSE_PREVIEW: "summary" } },
            publishing: { invoke: { src: "publish", input: ({ context }) => context.draft,
                            onDone: { target: "shared", actions: assign({ giftId: ({ event }) => event.output.giftId, slug: ({ event }) => event.output.slug }) },
                            onError: "summary" } },
            shared: { on: { SHARE: {/* channel handlers; native share first */} } },
          },
          on: { BACK: "#creator.wizard.schedule", GOTO: {/* jump to any earlier step */} },
        },
      },
    },
  },
});
```

---

## 4. Product A: recipient reveal flow

### 4.1 Scene graph

Nodes are scenes; an arrow label is `event [guard] / motion primitive`. Every mechanic converges on the same **reading spine** (letter → memories → extras → finale → end).

```mermaid
flowchart TD
  L[boot: loading card<br/>"Đang gói quà…"] -->|ASSETS_READY| G{gate}
  G -->|locked| K[locked: closed hero + countdown]
  K -->|UNLOCK_TIME / hardCut| G
  G -->|passcode required| P[passcode]
  P -->|PASS_OK / paperDipCrossfade| O
  G -->|open| O[landing: hero idle<br/>idleFloat / trapezoidSway + hintRing]
  O -->|mechanic=envelope| E1[envelope: tap → bloom]
  O -->|mechanic=box| B1[box: pull ribbon → lid → treats]
  O -->|mechanic=booth| H1[booth: coin → countdown → print]
  O -->|mechanic=notebook| N1[notebook: typed pages, yes/no, tap the object]
  E1 -->|TAP 2 / curtainDrop| R[letter page]
  B1 -->|ALL_BITES / layoutMove + letterPop| R
  H1 -->|TAP_STRIP / letter modal| R
  N1 -->|TAP_GIFT / contentSwapInShell| R
  R -->|typed + dwell| M[memories: polaroidDeal → lightbox]
  R -. FAB .-> X[extras drawer: voice, songs, map — non-modal]
  M -. FAB .-> X
  M -->|FINALE [readEnough] / flowerFlood| F[finale]
  F -->|cover ≥70% / hardCut| Z[end card: xem lại · trả lời · chụp photobooth]
  Z -->|REPLAY / flowerWipe| O
```

**Dead-end prevention:**

- Every scene has a forward path and a `BACK` (browser back → `popstate` → `BACK`).
- Browser back never replays a spectacle. Going back from `letter` lands on the *opened* hero state.
- Re-opening the link after completion lands on the end card, with "Xem lại từ đầu" (progress kept in localStorage, try/catch).

### 4.2 Mechanic sub-graphs (with timings from motion.md C1–C3)

**Envelope (v5).**

- `idle` (float + ring after 1.2 s) → **TAP** → `opening`:
  - `tapWobble` at 0
  - prompt fade at +33 ms
  - `paperDipCrossfade` at +400 ms
  - seed at +870 ms
  - `bloomBurst` +870 → +3,270 ms
- `bloomHold`: wall drift; `timedPrompt` "Chạm để tiếp tục" at +4,000 ms after tap 1.
- **TAP** → `curtainDrop` 1,530 ms. The letter page is **pre-mounted** underneath (v5 f236) → `letter`.

**Box (v4).**

- `wrapped` (sway, hint ring on the knot, glint chase along the tail).
- **DRAG** (ribbon follows, bow scale 1→.8, labels fade at progress .7). There is also a **tap fallback**: a tap plays the same gesture scripted over 367 ms.
- **RELEASE [dist ≥ 50 px]** → `untie`:
  - knot collapse 67 ms
  - hold 100 ms
  - `whipOff` 133 ms
  - pile 67 ms
- `lidFlip3D` 280 ms (+733 ms), then `stinger`: sticker / caption / hearts / pennants.
- `treats`: each **BITE** swaps the sprite, flashes a heart charm, shows crumbs and squashes the box. The first bite per treat pops a note ("…· còn N món nữa").
- **[bites = 6]** → 1 frame → `spread`:
  - props fade 100 ms
  - box `layoutMove` 280 ms
  - `letterPop` at +67 ms
  - washi hearts
  - `polaroidDeal` 150 ms stagger
  - "xem lại" pill at +1,567 ms
- **RELEASE [dist < 50 px]** → spring back to the bound (the bow relaxes 200 ms `outQuad`), and the glint chase replays once.

**Booth (v1, gift version).** The **sender's** photos print; no camera is used here.

- `idle` (curtain pendulum, coin ping, "thả xu ✦").
- **TAP_COIN**:
  - token drops into the slot and the label becomes "cười lên!" at 0
  - `stampPop` 3-2-1 at **280 ms/digit** (reference speed is fine because no real person is posing)
  - 4 × `cameraFlash` 240 ms apart, which **reveal** the sender's 4 photos behind the booth window one per flash
- "đang in…" → `slotPrint` + `toss` × up to 3 strips (strips 2–3 only if the sender added 8 or 12 photos) → land reward.
- "chạm vào dải ảnh ✦" plus a heart burst on the middle strip → **TAP_STRIP** → letter modal (scrim 300 ms).
- The chips "thư" (reopen) and "chụp lại" (re-run the ritual) persist. "chụp lại" is renamed **"in lại"** in the gift version.

**Notebook (v3 grammar, original art).**

- `p1` typed headline ("Chúc mừng sinh nhật {to}!"), CTA "tiếp nào" visible from load.
- **NEXT** → `pageCrossfade` 240 ms → `p2` question "Có một bất ngờ… muốn xem không?" with [Có!!] [Để sau].
- **YES** → `p3`: the typed instruction "chạm vào {object} để mở quà" and the object's `idleWobble` (the only motion on screen).
- **TAP** → `contentSwapInShell` → `p4` gift photo (decoded first; deliberate `stickerPop` at +260 ms) plus caption typing, CTA "lời chúc".
- **NEXT** → `p5` letter collage. Photos are preloaded and decoded **before** the crossfade (fixes v3 f514–522).
- **NO** ("Để sau") → a gentle hold page: "Không sao, khi nào sẵn sàng thì chạm vào đây nhé" plus the same CTA. No dodging buttons and no guilt copy.

### 4.3 Recipient machine (XState v5 style)

```ts
import { setup, assign, fromPromise, sendTo, raise } from "xstate";

type Mech = "envelope" | "box" | "booth" | "notebook";
interface RCtx {
  gift: GiftPayload | null; mechanic: Mech; preview: boolean;
  tier: "high" | "mid" | "low"; reduced: boolean; sfx: boolean;
  bites: number; ribbonDx: number; letterTyped: boolean; letterShownAt?: number;
  lightboxIndex?: number; fastForward: boolean; queuedTap: boolean;
}
type REv =
  | { type: "ASSETS_READY" } | { type: "ASSETS_FAILED" } | { type: "UNLOCK_TIME" }
  | { type: "PASSCODE"; code: string } | { type: "PASS_OK" } | { type: "PASS_BAD" }
  | { type: "TAP_HERO" } | { type: "TAP_STAGE" } | { type: "DRAG"; dx: number } | { type: "RELEASE" }
  | { type: "BITE"; item: 0 | 1 | 2 } | { type: "TAP_COIN" } | { type: "TAP_STRIP"; i: number }
  | { type: "YES" } | { type: "NO" } | { type: "NEXT" }
  | { type: "CHOREO_DONE" } | { type: "TYPE_DONE" } | { type: "SKIP_TYPING" }
  | { type: "OPEN_PHOTO"; i: number } | { type: "SWIPE"; dir: 1 | -1 } | { type: "CLOSE" }
  | { type: "FINALE" } | { type: "COVER_70" } | { type: "COVER_DONE" } | { type: "REPLAY" } | { type: "BACK" }
  | { type: "TOGGLE_DRAWER" } | { type: "DRAWER_DETENT"; d: "peek" | "half" | "full" }
  | { type: "MEDIA"; state: "loading" | "playing" | "paused" | "buffering" | "ended" | "error"; id: string }
  | { type: "PLAY"; id: string } | { type: "PAUSE" } | { type: "VISIBILITY"; hidden: boolean };

export const recipientMachine = setup({
  types: { context: {} as RCtx, events: {} as REv },
  guards: {
    isLocked:      ({ context }) => !!context.gift?.unlockAt && Date.parse(context.gift.unlockAt) > serverNow(),
    needsPasscode: ({ context }) => !!context.gift?.hasPasscode,
    isMech:        ({ context }, p: { m: Mech }) => context.mechanic === p.m,
    pulledEnough:  ({ context }) => context.ribbonDx >= 50,          // v4 §7 ~50 px threshold
    lastBite:      ({ context }) => context.bites + 1 >= 6,           // v4 B13: 3 treats × 2 bites
    firstBiteOf:   (_, p: { item: number }) => true,                  // computed from a per-item counter
    readEnough:    ({ context }) => context.letterTyped &&
                     Date.now() - (context.letterShownAt ?? 0) >= minDwellMs(context.gift!.letter),
    hasPhotos:     ({ context }) => (context.gift?.photos.length ?? 0) > 0,
    canQueue:      ({ context }) => !context.queuedTap,
  },
  actions: {
    label:      (_, p: { text: string }) => {/* status pill: 0 ms swap + aria-live (G5) */},
    sfx:        ({ context }, p: { id: SfxId }) => context.sfx && playSfx(p.id),
    haptic:     (_, p: { pattern: number | number[] }) => hapt(p.pattern),
    motion:     ({ context }, p: { name: string; opts?: object }) =>
                  run(p.name, { ...p.opts, tier: context.tier, reduced: context.reduced, timeScale: context.fastForward ? 3 : 1 }),
    unlockAudio: () => {/* resume AudioContext + prime the YT player inside this gesture */},
    hideChrome:  () => {/* chrome layer inert + opacity 0 (hard cut) */},
    mountChrome: () => {/* pill + FAB hard-cut at +3.0 s; rose CTA +3.2 s with chromeNudge + tooltipRise (v4 A9–A11) */},
    persistProgress: (_, p: { at: string }) => { try { localStorage.setItem("gift:" + slug, p.at); } catch {} },
    pushHistory: (_, p: { scene: string }) => history.pushState({ scene: p.scene }, ""),
    pauseAmbient: () => {/* stop canvas rAF + CSS ambient loops; resume on visible */},
  },
  actors: {
    loadGift: fromPromise(async () => {/* GET /g/:slug → payload; prefetch the mechanic atlas; decode */}),
    checkCode: fromPromise(async ({ input }: { input: string }) => {/* POST, rate-limited */}),
    preloadNext: fromPromise(async ({ input }: { input: string[] }) => {/* img.decode()/createImageBitmap (G6) */}),
  },
  delays: {
    ringDelay: 1200, promptDelay: 4000, chromeDelay: 3000,
    escalate1: 8000, escalate2: 15000,
  },
}).createMachine({
  id: "recipient",
  type: "parallel",
  context: ({ input }: any) => ({ gift: null, mechanic: "envelope", preview: !!input?.preview, tier: detectTier(),
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, sfx: true, bites: 0, ribbonDx: 0,
    letterTyped: false, fastForward: false, queuedTap: false }),
  states: {

    /* ───────────── REGION 1: scene (the story) ───────────── */
    scene: {
      initial: "boot",
      states: {
        boot: {
          entry: { type: "motion", params: { name: "loadingCard" } },          // v2a loading card → dissolve
          invoke: { src: "loadGift",
            onDone: { target: "gate", actions: assign({ gift: ({ event }) => event.output, mechanic: ({ event }) => event.output.mechanic }) },
            onError: "failed" },
        },
        failed: { /* "Không tải được quà. Thử lại" button → re-enter boot */ on: { NEXT: "boot" } },

        gate: {
          always: [
            { guard: "isLocked", target: "locked" },
            { guard: "needsPasscode", target: "passcode" },
            { target: "landing" },
          ],
        },
        locked: {
          entry: { type: "motion", params: { name: "idleFloat" } },
          on: { UNLOCK_TIME: { target: "boot" } },                              // refetch: content is server-gated
        },
        passcode: {
          initial: "entry",
          states: {
            entry: { on: { PASSCODE: "checking" } },
            checking: { invoke: { src: "checkCode", input: ({ event }: any) => event.code,
              onDone: "#recipient.scene.landing",
              onError: { target: "entry", actions: [{ type: "motion", params: { name: "tapWobble", opts: { target: "field" } } },
                                                    { type: "haptic", params: { pattern: [40, 30, 40] } }] } } },
          },
        },

        landing: {
          // the hero alone is alive; everything else is still (G3; v3 lesson)
          entry: [{ type: "motion", params: { name: "heroIdle" } }, { type: "pushHistory", params: { scene: "landing" } }],
          initial: "waiting",
          states: {
            waiting: {
              after: {
                ringDelay: { actions: { type: "motion", params: { name: "hintRing" } } },
                promptDelay: { actions: { type: "motion", params: { name: "timedPrompt", opts: { text: "Chạm để mở" } } } },
                escalate1: { actions: { type: "motion", params: { name: "sparkleGlint" } } },
                escalate2: { actions: [{ type: "motion", params: { name: "typewriter", opts: { retype: true } } },
                                       { type: "haptic", params: { pattern: 10 } }] },
              },
            },
          },
          on: {
            TAP_HERO: [
              { guard: { type: "isMech", params: { m: "envelope" } }, target: "envelope", actions: "unlockAudio" },
              { guard: { type: "isMech", params: { m: "booth" } },    target: "booth",    actions: "unlockAudio" },
              { guard: { type: "isMech", params: { m: "notebook" } }, target: "notebook", actions: "unlockAudio" },
            ],
            DRAG: { guard: { type: "isMech", params: { m: "box" } }, target: "box.pulling", actions: "unlockAudio" },
            TAP_COIN: { guard: { type: "isMech", params: { m: "booth" } }, target: "booth", actions: "unlockAudio" },
          },
        },

        /* ── Mechanic: envelope (motion.md C1; v5 f32–235) ── */
        envelope: {
          initial: "opening",
          states: {
            opening: {
              entry: [{ type: "motion", params: { name: "C1.open" } },          // tapWobble → paperDip → bloomBurst
                      { type: "sfx", params: { id: "paper.unfold" } }, { type: "haptic", params: { pattern: 12 } }],
              on: { TAP_STAGE: { guard: "canQueue", actions: assign({ fastForward: true }) },  // fast-forward, never skip
                    CHOREO_DONE: "bloomHold" },
            },
            bloomHold: {
              entry: { type: "motion", params: { name: "wallDrift" } },
              after: { promptDelay: { actions: { type: "motion", params: { name: "timedPrompt", opts: { text: "Chạm để tiếp tục" } } } } },
              // promptDelay is measured from tap 1 in v5 (+4.0 s); implement as max(0, 4000 − elapsedSinceTap)
              on: { TAP_STAGE: "dropping" },
            },
            dropping: {
              entry: [{ type: "motion", params: { name: "curtainDrop" } }, { type: "sfx", params: { id: "petals.whoosh" } }],
              on: { CHOREO_DONE: "#recipient.scene.letter" },                    // destination is pre-mounted
            },
          },
        },

        /* ── Mechanic: box (motion.md C2; v4 f114–256) ── */
        box: {
          initial: "wrapped",
          states: {
            wrapped: { on: { DRAG: "pulling", TAP_HERO: { target: "untie", actions: assign({ ribbonDx: 50 }) } } }, // tap fallback
            pulling: {
              on: {
                DRAG: { actions: [assign({ ribbonDx: ({ event }) => (event as any).dx }), { type: "motion", params: { name: "ribbonFollow" } }] },
                RELEASE: [
                  { guard: "pulledEnough", target: "untie" },
                  { target: "wrapped", actions: { type: "motion", params: { name: "ribbonRelax" } } },
                ],
              },
            },
            untie: {
              entry: [{ type: "motion", params: { name: "C2.untieAndFlip" } },   // collapse → hold → whipOff → pile → lidFlip3D → stinger
                      { type: "sfx", params: { id: "ribbon.swish" } }, { type: "haptic", params: { pattern: [8, 60, 20] } }],
              on: { CHOREO_DONE: "treats", TAP_STAGE: { actions: assign({ fastForward: true }) } },
            },
            treats: {
              entry: { type: "label", params: { text: "chạm vào một món để cắn thử" } },
              on: {
                BITE: [
                  { guard: "lastBite", target: "advancing",
                    actions: [assign({ bites: ({ context }) => context.bites + 1 }), { type: "motion", params: { name: "biteTap" } },
                              { type: "sfx", params: { id: "bite.crunch" } }, { type: "haptic", params: { pattern: 15 } }] },
                  { actions: [assign({ bites: ({ context }) => context.bites + 1 }), { type: "motion", params: { name: "biteTap" } },
                              { type: "motion", params: { name: "noteBubble" } /* first bite per item: "· còn N món nữa" */ },
                              { type: "sfx", params: { id: "bite.crunch" } }, { type: "haptic", params: { pattern: 15 } }] },
                ],
              },
            },
            advancing: {
              after: { 33: { target: "#recipient.scene.letter" } },              // v4 f203 → f204: one frame later
            },
          },
        },

        /* ── Mechanic: booth, gift version (motion.md C3 at reference speed; v1 f24–242) ── */
        booth: {
          initial: "ritual",
          states: {
            ritual: {
              entry: [{ type: "label", params: { text: "cười lên!" } }, { type: "sfx", params: { id: "coin.drop" } },
                      { type: "haptic", params: { pattern: 20 } }, { type: "motion", params: { name: "C3.gift" } }],
              // C3.gift: stampPop ×3 (280 ms) → cameraFlash ×4 (240 ms) revealing sender photos → "đang in…" → slotPrint/toss ×N
              on: { CHOREO_DONE: "gallery" },                                    // taps ignored (G15); stage tap = fast-forward
            },
            gallery: {
              entry: [{ type: "label", params: { text: "chạm vào dải ảnh ✦" } }, { type: "motion", params: { name: "heartBurst", opts: { on: "strip:1" } } }],
              on: { TAP_STRIP: { target: "#recipient.scene.letter", actions: assign({ /* remember strip */ }) } },
            },
          },
        },

        /* ── Mechanic: notebook (v3 grammar; original art) ── */
        notebook: {
          initial: "p1",
          states: {
            p1: { entry: { type: "motion", params: { name: "typewriter" } }, on: { NEXT: "p2" } },          // CTA live from load (v3)
            p2: { entry: { type: "motion", params: { name: "pageCrossfade" } }, on: { YES: "p3", NO: "later" } },
            later: { on: { YES: "p3" } },                                                                   // gentle, no trickery
            p3: { entry: [{ type: "motion", params: { name: "pageCrossfade" } }, { type: "motion", params: { name: "idleWobble" } }],
                  on: { TAP_HERO: "p4" } },
            p4: { entry: { type: "motion", params: { name: "contentSwapInShell" } },
                  invoke: { src: "preloadNext", input: ({ context }) => context.gift!.photos.map(p => p.src) }, // decode before p5 (G6)
                  on: { NEXT: "#recipient.scene.letter" } },
          },
        },

        /* ── Reading spine ── */
        letter: {
          entry: [{ type: "pushHistory", params: { scene: "letter" } }, { type: "persistProgress", params: { at: "letter" } },
                  assign({ letterShownAt: () => Date.now(), fastForward: false }),
                  { type: "motion", params: { name: "letterPop" } }, { type: "sfx", params: { id: "paper.rustle" } }],
          initial: "typing",
          states: {
            typing: {
              entry: { type: "motion", params: { name: "typewriter", opts: { msPerChar: "min(127, 3220/n)" } } }, // v3 rule
              on: { SKIP_TYPING: { target: "read", actions: { type: "motion", params: { name: "typewriterComplete" } } },
                    TYPE_DONE: "read" },
            },
            read: {
              entry: [assign({ letterTyped: true })],
              after: { 800: { actions: [{ type: "motion", params: { name: "heartPop", opts: { at: "signature" } } },
                                        { type: "sfx", params: { id: "chime.soft" } }] } },  // completion cue v3 lacked
              on: { NEXT: { guard: "hasPhotos", target: "#recipient.scene.memories" } },
            },
          },
          on: {
            FINALE: [
              { guard: "readEnough", target: "finale" },
              { actions: [{ type: "motion", params: { name: "tooltipShake" } }, { type: "label", params: { text: "Đọc hết thư đã nhé 💌" } }] },
            ],
          },
        },

        memories: {
          entry: [{ type: "motion", params: { name: "polaroidDeal" } }, { type: "pushHistory", params: { scene: "memories" } }],
          initial: "grid",
          states: {
            grid: { on: { OPEN_PHOTO: { target: "lightbox", actions: assign({ lightboxIndex: ({ event }) => (event as any).i }) } } },
            lightbox: {
              entry: [{ type: "motion", params: { name: "sharedLightbox" } }, "hideChrome"],   // nothing above the scrim (fix v4 z-bug)
              exit: "mountChrome",
              on: { SWIPE: { actions: assign({ lightboxIndex: ({ context, event }) => wrap(context.lightboxIndex! + (event as any).dir) }) },
                    CLOSE: "grid", BACK: "grid" },
            },
          },
          on: { FINALE: { guard: "readEnough", target: "finale" } },
        },

        finale: {
          entry: ["hideChrome", { type: "motion", params: { name: "C7.flowerFlood" } },          // throw → impact → burst → wall
                  { type: "sfx", params: { id: "bloom.whoosh" } }, { type: "haptic", params: { pattern: [0, 330, 40] } }],
          on: { COVER_70: { actions: { type: "motion", params: { name: "swapUnderCover", opts: { to: "endCard" } } } },  // G11
                COVER_DONE: "end" },
        },
        end: {
          entry: [{ type: "persistProgress", params: { at: "end" } }, "mountChrome"],
          // End card: "Xem lại" · "Trả lời {from}" (text ≤200 or voice ≤30 s) · "Chụp photobooth gửi lại" (→ product B)
          on: { REPLAY: { target: "landing", actions: { type: "motion", params: { name: "flowerWipe" } } } },
        },
      },
      on: {
        BACK: {/* popstate: letter → landing(opened pose), memories → letter; never replays spectacles */},
      },
    },

    /* ───────────── REGION 2: chrome (non-modal extras) ───────────── */
    chrome: {
      initial: "hidden",
      states: {
        hidden: { on: { CHOREO_DONE: "arming" } },
        arming: { after: { chromeDelay: { target: "visible", actions: "mountChrome" } } },
        visible: {
          initial: "hint",
          states: {
            hint:   { on: { TOGGLE_DRAWER: "drawer" } },              // "Còn nữa nè" pill + FAB
            drawer: {                                                // bottom sheet, no scrim, page stays live
              entry: { type: "motion", params: { name: "drawerSlide" } },
              initial: "peek",
              states: { peek: {}, half: {}, full: {} },
              on: { DRAWER_DETENT: {/* go to detent */}, TOGGLE_DRAWER: "closed" },
            },
            closed: { on: { TOGGLE_DRAWER: "drawer" } },             // the pill never returns once dismissed (v4 C8, v5 B-07)
          },
        },
      },
    },

    /* ───────────── REGION 3: audio (truthful media state, G16) ───────────── */
    audio: {
      initial: "silent",
      states: {
        silent:    { on: { PLAY: "loading" } },
        loading:   { entry: { type: "label", params: { text: "Đang mở…" } },
                     on: { MEDIA: [{ guard: ({ event }) => event.state === "playing", target: "playing" },
                                   { guard: ({ event }) => event.state === "error", target: "error" }] } },
        playing:   { entry: [{ type: "label", params: { text: "Đang phát" } }, { type: "motion", params: { name: "reelSpin" } }],
                     exit: { type: "motion", params: { name: "reelStop" } },          // reels stop on ANY exit (v5 C-e15 fix)
                     on: { MEDIA: [{ guard: ({ event }) => event.state === "paused", target: "paused" },
                                   { guard: ({ event }) => event.state === "buffering", target: "buffering" },
                                   { guard: ({ event }) => event.state === "ended", target: "paused" }],
                           VISIBILITY: { guard: ({ event }) => event.hidden, actions: "pauseAmbient" } } },
        buffering: { entry: { type: "label", params: { text: "Đang tải…" } },
                     on: { MEDIA: [{ guard: ({ event }) => event.state === "playing", target: "playing" },
                                   { guard: ({ event }) => event.state === "paused", target: "paused" }] } },
        paused:    { on: { PLAY: "loading", MEDIA: { guard: ({ event }) => event.state === "playing", target: "playing" } } },
        error:     { entry: { type: "label", params: { text: "Không phát được, mở trong ứng dụng?" } }, on: { PLAY: "loading" } },
      },
    },
  },
});

// minDwellMs: reading time ≈ 14 graphemes/s for Vietnamese handwriting fonts, clamped to [4 s, 25 s],
// measured from the end of typing, PLUS the typing itself. Tapping early never blocks forever:
// the 2nd early tap within 3 s is honoured (users who re-read the letter elsewhere are not trapped).
```

### 4.4 Event wiring notes

| Event | Source | Note |
|---|---|---|
| `TAP_HERO` / `TAP_STAGE` | `pointerup` on the hit area / the full stage | Also `Enter` / `Space` on the focused hero (role="button") |
| `DRAG` / `RELEASE` | Pointer Events with `setPointerCapture`, `touch-action: none` on the ribbon only | Horizontal-right drag. Vertical scroll is never hijacked outside the ribbon |
| `CHOREO_DONE` | the motion runner's timeline `onComplete` | One per choreography; also fired by reduced-motion crossfades |
| `TYPE_DONE` | typewriter last-span `animationend` | `SKIP_TYPING` = a tap on the letter during typing |
| `COVER_70` | the canvas coverage estimate (sprite area / viewport) or a fixed timestamp (+600 ms for `flowerWipe`, v1 f487–490) | Swap scene under cover |
| `MEDIA` | YT `onStateChange` / Spotify `playback_update` / `<audio>` events | Never fake it from clicks |
| `VISIBILITY` | `visibilitychange` | Pause ambient loops and canvas rAF when hidden. Music pause follows the player's own behaviour |
| `BACK` | `popstate` | Map to a scene and do not replay |

---

## 5. Product B: self-photobooth

### 5.1 Flow overview

```mermaid
flowchart LR
  A[landing booth<br/>"Vào chụp nào ✦"] --> B{camera support?}
  B -->|in-app webview / no getUserMedia| W[Mở bằng trình duyệt<br/>or Chọn ảnh từ thư viện]
  B -->|ok| C[pre-permission explainer]
  C -->|Cho phép| D[browser prompt]
  D -->|granted| S[setup: layout · frame · timer · flash]
  D -->|denied| X[denied help per browser + upload fallback]
  S --> R[ready: live preview]
  R -->|SHUTTER / thả xu| K[countdown 3-2-1]
  K --> F[flash + capture i]
  F -->|i<n| K2[re-countdown 2-1] --> F
  F -->|i=n| V[review 4 shots: retake any]
  V --> P[printing: compose strip]
  P --> E[edit: stickers · text · date · filter]
  E --> O[export: PNG · GIF · MP4 boomerang]
  O --> SH[save / share]
  SH -->|Chụp tiếp| R
  SH -->|Gửi vào thiệp| GA[product A draft with this strip]
```

### 5.2 Camera permission UX

1. **Capability check before asking:**
   - `navigator.mediaDevices?.getUserMedia` exists, and the context is a secure context
   - **in-app browser detection** by UA: `Zalo`, `FBAN|FBAV|FB_IAB` (Facebook/Messenger), `Instagram`, `musical_ly|TikTok`, `Line`
   - In-app webviews often block or break camera access and file downloads. Show the banner: "Để dùng máy ảnh, hãy mở bằng Chrome/Safari", with [Sao chép link] and [Mở bằng trình duyệt] (Android `intent://` to Chrome; iOS: instructions "Chạm ··· → Mở bằng trình duyệt"). Always also offer **"Chọn ảnh từ thư viện"** (`<input type="file" accept="image/*" capture="user" multiple>`), which still builds a strip from 4 picked photos.
2. **Pre-permission explainer** (our own sheet, before the browser prompt):
   - illustration of the booth curtain opening
   - title "Cho phép dùng máy ảnh"
   - body: "Ảnh được xử lý ngay trên máy của bạn, không tải lên đâu cả."
   - [Cho phép] and a small [Dùng ảnh có sẵn]
   - Only [Cho phép] calls `getUserMedia`, inside the gesture.
3. **Constraints:** `{ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 }, frameRate: { ideal: 30, max: 30 } }, audio: false }`. On the low tier: `640×480` preview (motion.md §5.2). Use the highest-quality frame grab available at capture time (`ImageCapture.takePhoto()` where supported, Chrome Android; otherwise `drawImage(video)`).
4. **Denied:** detect `NotAllowedError` and show browser-specific steps:
   - Chrome Android: "Chạm biểu tượng ổ khoá ⓘ → Quyền → Máy ảnh → Cho phép, rồi tải lại"
   - iOS Safari: "Chạm aA → Cài đặt trang web → Camera → Cho phép"
   - plus [Thử lại] and the upload fallback
   - `NotReadableError`: "Máy ảnh đang được ứng dụng khác dùng"
   - `OverconstrainedError`: retry with `{ video: true }`
5. **Lifecycle:**
   - stop all tracks on `pagehide`, when leaving the booth, and **after 60 s idle in setup/edit** (show "Máy ảnh đã tắt để tiết kiệm pin · Bật lại")
   - re-acquire on `visibilitychange` visible if the state is `ready`
   - the browser's camera indicator must turn off when we are not capturing (privacy trust)
6. **Camera switch:** if `enumerateDevices` shows more than one video input, show a ⟲ button for front/back. Back camera = no mirror and real flash off. `torch` is not reliable on the web, so the screen flash is front-only.

### 5.3 Setup choices (one screen, all defaulted)

| Control | Options (default first) | Notes |
|---|---|---|
| Layout | **1×4 dải** · 2×2 lưới · Polaroid (1 ảnh) · Story 9:16 (4 ảnh) | Shot count = 4 / 4 / 1 (+"chụp 4 chọn 1") / 4 |
| Frame / theme | booth-stripes (wood + folk tulips, original) · sweet-gingham · garden-envelope (kraft) · cloud-lyric (pink duotone) · starry-notebook | Chip row with live preview |
| Hẹn giờ | **3 s** · 5 s · 10 s | First shot. Between shots it is always a 2-1 re-countdown (800 ms/digit) |
| Flash màn hình | **Bật** · Tắt | A functional fill light for the front camera; see §5.5 |
| Chế độ | **Ảnh** · Boomerang | Boomerang records 1.0 s bursts per shot (§5.7) |
| Lật ảnh | **Như gương** (saved as seen) · Như người khác thấy | Preview is always mirrored for the front camera. Stickers/text are composited after the flip, so they are never mirrored |

### 5.4 Capture timing (real camera)

The reference cadence (280 ms digits, 240 ms flash spacing, v1 f30–77) is too fast for real posing. The ratios are kept and the scale is set for humans (motion.md C3 product column):

| t (ms) | Event | Motion / sound / haptic |
|---|---|---|
| 0 | SHUTTER (or "thả xu" coin tap in the booth skin) | coin → token drop, label "cười lên!", `coin.drop` + `vibrate(20)` |
| 200 | "3" | `stampPop`, `tick` + `vibrate(10)` |
| 1,200 | "2" | `stampPop`, `tick` + `vibrate(10)` |
| 2,200 | "1" | `stampPop`, `tick.high` + `vibrate(10)` |
| 3,100 | **flash 1 + capture** | `cameraFlash` (screen flash), `shutter` + `vibrate(30)`; shake the *booth frame chrome*, never the video |
| +600 | shot 1 thumbnail drops into the side tray | 200 ms `outQuad` |
| +800 → +2,400 | "2" "1" re-countdown, label "Tạo dáng tiếp nào!" | `stampPop` 800 ms/digit |
| 5,500 / 7,900 / 10,300 | flashes 2–4 | same |
| F4 + 233 | label "đang in…" | 0 ms swap |
| F4 + 233 | **compose in worker** (anticipation beat, v1 §5) | `print.whirr` loop starts |
| F4 + 433 → | `slotPrint` linear feed, then `toss` into view | `print.whirr` stops on the toss; `paper.pop` on landing + confetti |

- A tap during the countdown means **"Tạm dừng"**. The countdown freezes, the label becomes "tạm dừng · chạm để tiếp", and it resumes from the current digit.
- During capture of the last shot, taps are ignored.

### 5.5 Flash (functional and decorative)

- **Front camera screen flash ("Flash màn hình"):** at capture, raise a `#FFF6EE` (warm white) full-screen layer to opacity **1.0** over ≤1 frame. Hold **≥ 120 ms** (most webcams expose with a 2–3 frame lag), **grab the frame at +100 ms**, then decay linearly over 150 ms (v1 #13–16 envelope, extended). The preview video sits under the flash layer, so the user's face is lit by the screen.
- **Flash off:** the decorative flash v1-style (peak .85, ≤40 ms rise, 130 ms linear decay) plus the booth-centred glow, starburst and twinkles. Capture happens at the flash *start*.
- **Photosensitivity:** 4 flashes spaced ≥2.4 s apart are well under WCAG 2.3.1's 3-per-second limit. With reduced motion: no shake or starburst, and the decorative flash is capped at .4 opacity. The functional screen flash stays at 1.0 only if the user keeps "Flash màn hình" on (the setting is shown with a ☀ icon).

### 5.6 Review, retake and composition

- **Review grid:** 4 thumbnails in the chosen layout. Tap one → it enlarges (FLIP) with [Chụp lại ảnh này] and [Giữ].
  - "Chụp lại ảnh này" → back to `ready` with a **single** 3-2-1 → flash → replaces slot i → back to review.
  - [Chụp lại tất cả] restarts.
  - [In ảnh ✦] continues.
- **Composition (worker):** the OffscreenCanvas draws frame background → photos (cover-fit, centre-weighted; face-centre optional via `FaceDetector` where available) → frame overlay PNG → caption/date. Export presets:

| Layout | Canvas px | Photo slots | Print equivalent |
|---|---|---|---|
| 1×4 dải | 600×1800 (2×6 in at 300 dpi) | 4 × 520×390 (4:3), 24 px gutters, 200 px footer for text/date | classic booth strip |
| 2×2 lưới | 1200×1800 (4×6 in) | 4 × 560×560 with a 240 px header | postcard |
| Polaroid | 1080×1312 (88:107 ratio) | 1 × 960×960 (frame 60 px sides/top, 292 px bottom) | instant print |
| Story 9:16 | 1080×1920 | 4 stacked 3:4 with a tilted collage option | Zalo / Messenger / IG stories |

### 5.7 Edit: stickers, text, date stamp, filters

| Tool | Interaction | Details |
|---|---|---|
| **Sticker** | bottom sheet of original stickers (per theme: tulips, hearts, ribbons, stars, treats, "thương ghê", "mãi bên nhau"); tap to add at the centre; **one finger drag, two finger pinch-scale + rotate**; tap selects (dashed bounding box + corner ×); drag onto a 🗑 zone at the bottom to delete | Pointer Events, 2-pointer gesture; `stickerPop` on add (scale 0→1.04→1, 167 ms); snapping to 0°/±15° within 4°; max 20 stickers |
| **Text** | "Aa" → inline editor; font chips limited to verified fonts (Pangolin, Mali, Dancing Script, Paytone One, Playwrite VN); colour chips from the theme palette; outline toggle | Measure text with the same font loaded via `document.fonts.load()` before drawing to canvas; Vietnamese stacked marks need 1.35 line height |
| **Date stamp** | toggle "Ngày chụp" → formats `12.11.2026` · `12 THG 11 2026` · `’26 11 12` (film-camera orange LED style, digits only) | Orange #F4A624-ish with a soft glow, bottom-right of the last photo or the footer |
| **Filter** | horizontal chips with live preview on the strip: **Tự nhiên** · Hồng phấn (pink duotone, cloud-lyric) · Kem sữa (warm lift) · Phim cũ (grain + fade) · Đen trắng | Implement as **WebGL LUT shaders** (consistent on iOS, where Canvas2D `ctx.filter` support is not reliable), applied per photo slot *before* the frame overlay; preview at 1/2 resolution |
| **Undo / redo** | ↶ ↷ in the top bar; a 30-step stack of edit ops | — |

### 5.8 Export

| Format | Spec | Encoder | Fallback |
|---|---|---|---|
| **PNG** | layout canvas at full size (sRGB) | `canvas.convertToBlob({type:"image/png"})` (OffscreenCanvas) | JPEG q .92 if the PNG is >8 MB |
| **GIF** | 4 frames × 500 ms (+ the composite frame for 1,200 ms), loop; 480 px wide; 128-colour palette; ≤3 MB | `gifenc` in a worker | — |
| **MP4 boomerang** | per shot record a **1.0 s burst at 15 fps** (15 frames) at the capture moment (no screen flash in Boomerang mode; the countdown is the same); ping-pong each burst (forward + reverse = 2 s); play the 4 slots in sequence inside the frame, looped ×2 → **~8 s, 720×1280 (Story) or 600×1800 strip scaled to 720 wide**, 30 fps, H.264 | **WebCodecs `VideoEncoder` + mp4-muxer** in a worker (Chrome Android, Safari 16.4+) | `MediaRecorder(canvas.captureStream(30))`: `video/mp4` on Safari; on Chrome this gives **WebM**, so label it "Video (WebM)". If neither works, offer the GIF only |

- During export the label reads "đang làm video… 63%". The progress is a hand-drawn bar (v2a loading bar). The page stays interactive and the user can back out.

### 5.9 Save and share

1. **`navigator.canShare({ files: [file] })` → `navigator.share({ files, title: "Ảnh photobooth" })`.** This is the best path on Android and iOS: it saves to Photos or sends directly to Zalo/Messenger.
2. **Download:** `<a download="photobooth-2026-11-12.png">` (desktop, Android Chrome). On iOS without share files: open the image in an overlay with "Nhấn giữ ảnh → Lưu vào Ảnh".
3. In-app webviews: downloads often fail. Prefer share; else show the long-press instruction plus "Mở bằng trình duyệt".
4. **Gửi vào thiệp** (cross-product): this is the only path that uploads. An explicit confirmation explains that the strip will be uploaded into a new gift draft (mechanic *Photobooth*, theme pre-matched).

### 5.10 Photobooth machine (XState v5 style)

```ts
import { setup, assign, fromPromise, fromCallback } from "xstate";

type Layout = "strip4" | "grid4" | "polaroid" | "story4";
interface BCtx {
  stream?: MediaStream; facing: "user" | "environment"; mirrorSave: boolean;
  layout: Layout; frame: string; timerSec: 3 | 5 | 10; screenFlash: boolean; mode: "photo" | "boomerang";
  shots: (ImageBitmap | null)[]; bursts: (ImageBitmap[] | null)[]; i: number; retakeIndex?: number;
  composite?: Blob; edits: EditOp[]; undo: EditOp[]; exportFmt?: "png" | "gif" | "mp4"; progress: number;
  reduced: boolean; tier: "high" | "mid" | "low"; error?: string;
}
type BEv =
  | { type: "ENTER" } | { type: "ALLOW" } | { type: "USE_LIBRARY"; files: File[] }
  | { type: "GRANTED"; stream: MediaStream } | { type: "DENIED"; name: string }
  | { type: "SET"; patch: Partial<BCtx> } | { type: "FLIP_CAMERA" }
  | { type: "SHUTTER" } | { type: "TAP_STAGE" } | { type: "TICK" } | { type: "CAPTURED"; bmp: ImageBitmap; burst?: ImageBitmap[] }
  | { type: "RETAKE"; i: number } | { type: "RETAKE_ALL" } | { type: "KEEP" } | { type: "PRINT" }
  | { type: "COMPOSED"; blob: Blob } | { type: "EDIT"; op: EditOp } | { type: "UNDO" } | { type: "REDO" }
  | { type: "EXPORT"; fmt: "png" | "gif" | "mp4" } | { type: "PROGRESS"; p: number } | { type: "EXPORTED"; file: File }
  | { type: "SHARE" } | { type: "SAVE" } | { type: "TO_GIFT" } | { type: "AGAIN" } | { type: "IDLE_TIMEOUT" }
  | { type: "VISIBILITY"; hidden: boolean } | { type: "BACK" };

const shotCount = (l: Layout) => (l === "polaroid" ? 1 : 4);

export const boothMachine = setup({
  types: { context: {} as BCtx, events: {} as BEv },
  guards: {
    cameraSupported: () => !!navigator.mediaDevices?.getUserMedia && isSecureContext && !isInAppBrowser(),
    moreShots:  ({ context }) => context.retakeIndex === undefined && context.i + 1 < shotCount(context.layout),
    isRetake:   ({ context }) => context.retakeIndex !== undefined,
    canShareFiles: ({ event }: any) => !!navigator.canShare?.({ files: [event.file] }),
  },
  actors: {
    getCamera: fromPromise(async ({ input }: { input: { facing: string; tier: string } }) =>
      navigator.mediaDevices.getUserMedia({ audio: false, video: {
        facingMode: input.facing, frameRate: { ideal: 30, max: 30 },
        width: { ideal: input.tier === "low" ? 640 : 1280 }, height: { ideal: input.tier === "low" ? 480 : 960 } } })),
    countdown: fromCallback(({ sendBack, input }: { sendBack: any; input: { digits: number[]; ms: number; lead: number } }) => {
      /* stampPop each digit; tick sfx + vibrate(10); then sendBack({type:"TICK"}) at the flash time */
      const timers: number[] = []; /* … */ return () => timers.forEach(clearTimeout);
    }),
    capture: fromPromise(async ({ input }: { input: BCtx }) => {/* flash layer → wait 100 ms → grab (ImageCapture | drawImage) → bitmap; boomerang: 15 frames @15 fps */}),
    compose: fromPromise(async ({ input }: { input: BCtx }) => {/* OffscreenCanvas worker: frame + photos + LUT + overlay */}),
    encode:  fromCallback(({ sendBack, input }: any) => {/* PNG | gifenc | WebCodecs+mp4-muxer; posts PROGRESS */}),
  },
  actions: {
    stopCamera: ({ context }) => context.stream?.getTracks().forEach(t => t.stop()),
    label: (_, p: { text: string }) => {/* status pill 0 ms + aria-live */},
    sfx:   (_, p: { id: SfxId }) => playSfx(p.id),
    haptic:(_, p: { pattern: number | number[] }) => hapt(p.pattern),
    motion:({ context }, p: { name: string; opts?: object }) => run(p.name, { ...p.opts, reduced: context.reduced, tier: context.tier }),
  },
}).createMachine({
  id: "booth",
  initial: "landing",
  context: { facing: "user", mirrorSave: true, layout: "strip4", frame: "booth-stripes", timerSec: 3, screenFlash: true,
             mode: "photo", shots: [], bursts: [], i: 0, edits: [], undo: [], progress: 0, reduced: false, tier: "mid" },
  on: { VISIBILITY: { guard: ({ event }) => event.hidden, actions: "stopCamera" /* re-acquired by states that need it */ } },
  states: {
    landing: {
      entry: [{ type: "label", params: { text: "Vào chụp nào ✦" } }, { type: "motion", params: { name: "pendulum" } },
              { type: "motion", params: { name: "hintRing", opts: { on: "curtain" } } }],
      on: { ENTER: [{ guard: "cameraSupported", target: "permission" }, { target: "noCamera" }] },
    },
    noCamera: {   // in-app webview or unsupported
      on: { USE_LIBRARY: { target: "review", actions: assign({ shots: ({ event }) => [/* decoded files → bitmaps */] }) } },
    },
    permission: {
      initial: "explain",
      states: {
        explain: { on: { ALLOW: "requesting", USE_LIBRARY: "#booth.noCamera" } },
        requesting: {
          invoke: { src: "getCamera", input: ({ context }) => ({ facing: context.facing, tier: context.tier }),
            onDone: { target: "#booth.setup", actions: assign({ stream: ({ event }) => event.output }) },
            onError: { target: "denied", actions: assign({ error: ({ event }) => (event.error as DOMException).name }) } },
        },
        denied: { /* per-browser steps; NotReadableError / OverconstrainedError copy */ on: { ALLOW: "requesting", USE_LIBRARY: "#booth.noCamera" } },
      },
    },
    setup: {
      after: { 60000: { actions: "stopCamera" /* + "Máy ảnh đã tắt…" */ } },
      on: { SET: { actions: assign(({ event }) => (event as any).patch) }, FLIP_CAMERA: {/* re-invoke getCamera */},
            SHUTTER: "session" },                        // setup and ready share the live preview; SHUTTER starts directly
    },
    session: {
      initial: "countdown",
      entry: assign({ i: 0, shots: [], bursts: [] }),
      states: {
        countdown: {
          entry: { type: "label", params: { text: "cười lên!" } },
          invoke: { src: "countdown",
            input: ({ context }) => context.i === 0 && context.retakeIndex === undefined
              ? { digits: range(context.timerSec), ms: 1000, lead: 200 }      // 3-2-1 at 1 s
              : { digits: [2, 1], ms: 800, lead: 0 } },                        // re-countdown between shots
          on: { TICK: "flash", TAP_STAGE: "paused" },
        },
        paused: { entry: { type: "label", params: { text: "tạm dừng · chạm để tiếp" } }, on: { TAP_STAGE: "countdown" } },
        flash: {
          entry: [{ type: "motion", params: { name: "cameraFlash" } }, { type: "sfx", params: { id: "shutter" } },
                  { type: "haptic", params: { pattern: 30 } }],
          invoke: { src: "capture", input: ({ context }) => context,
            onDone: [
              { guard: "isRetake", target: "#booth.review",
                actions: assign({ shots: ({ context, event }) => replaceAt(context.shots, context.retakeIndex!, event.output.bmp), retakeIndex: undefined }) },
              { guard: "moreShots", target: "between",
                actions: assign({ shots: ({ context, event }) => [...context.shots, event.output.bmp], i: ({ context }) => context.i + 1 }) },
              { target: "#booth.review", actions: assign({ shots: ({ context, event }) => [...context.shots, event.output.bmp] }) },
            ],
            onError: { target: "countdown", actions: { type: "label", params: { text: "Chụp lỗi, thử lại nhé" } } } },
        },
        between: {
          entry: [{ type: "motion", params: { name: "thumbDrop" } }, { type: "label", params: { text: "Tạo dáng tiếp nào!" } }],
          after: { 800: "countdown" },
        },
      },
      on: { BACK: { target: "setup" } },
    },
    review: {
      entry: { type: "label", params: { text: "Xem lại ảnh" } },
      on: {
        RETAKE: { target: "session.countdown", actions: assign({ retakeIndex: ({ event }) => event.i }) },
        RETAKE_ALL: "session",
        PRINT: "printing",
      },
    },
    printing: {
      entry: [{ type: "label", params: { text: "đang in…" } }, { type: "sfx", params: { id: "print.whirr" } }, "stopCamera"],
      invoke: { src: "compose", input: ({ context }) => context,
        onDone: { target: "printed", actions: assign({ composite: ({ event }) => event.output }) } },
    },
    printed: {
      entry: [{ type: "motion", params: { name: "slotPrint+toss" } }, { type: "sfx", params: { id: "paper.pop" } },
              { type: "motion", params: { name: "confettiFountain" } }, { type: "haptic", params: { pattern: [20, 60, 40] } }],
      after: { 900: "edit" },                          // land reward, then hand over the tools
    },
    edit: {
      on: {
        EDIT: { actions: assign({ edits: ({ context, event }) => [...context.edits, event.op], undo: [] }) },
        UNDO: { actions: assign(({ context }) => ({ edits: context.edits.slice(0, -1), undo: [...context.undo, context.edits.at(-1)!] })) },
        REDO: { actions: assign(({ context }) => ({ edits: [...context.edits, context.undo.at(-1)!], undo: context.undo.slice(0, -1) })) },
        EXPORT: { target: "exporting", actions: assign({ exportFmt: ({ event }) => event.fmt, progress: 0 }) },
        BACK: "review",
      },
    },
    exporting: {
      invoke: { src: "encode", input: ({ context }) => context },
      on: { PROGRESS: { actions: assign({ progress: ({ event }) => event.p }) },
            EXPORTED: { target: "done", actions: assign({ /* file */ }) },
            BACK: "edit" },
    },
    done: {
      entry: [{ type: "sfx", params: { id: "chime.success" } }, { type: "label", params: { text: "Xong rồi ✦" } }],
      on: { SHARE: {/* navigator.share({files}) or fallback */}, SAVE: {/* download / long-press overlay */},
            TO_GIFT: {/* confirm upload → creator draft */},
            EXPORT: { target: "exporting", actions: assign({ exportFmt: ({ event }) => event.fmt }) },
            AGAIN: "setup" },
    },
  },
});
```

### 5.11 Booth layouts at 390×844 and 360×780

| State | 390×844 | 360×780 |
|---|---|---|
| landing | painted booth 72% vw, curtain pendulum, "Vào chụp nào ✦" 24 px, CTA 56 px tall at the bottom | booth 70% vw; CTA 52 px |
| setup / ready | preview 3:4 at 100% width minus 16 px (358×477), radius 20, painted frame skin around it; chips row (layout, frame) below; shutter 76 px circle bottom-centre; timer / flash / flip toggles 44 px either side | preview 328×437; chips scroll horizontally; the shutter sits 16 px above the safe area |
| countdown | digit bubble 120 px centred **over the preview** (bubble fill `#FDF3F5`, numeral Paytone One 72 px) | 104 px bubble |
| capture | screen flash covers the full viewport (z flash); captured thumbs drop into a 4-slot vertical tray along the right edge of the preview (48×64 each) | tray 40×53 |
| review | the 4 shots laid out as the chosen layout at ~70% height; [Chụp lại ảnh này] appears on the tapped shot; [In ảnh ✦] primary at the bottom | same |
| printing / printed | the booth slot at the top; the strip feeds downward then tosses to the centre (`toss` arc from the slot to y 50%) | toss without rotation overshoot |
| edit | strip fit to the upper 70%; tool bar 64 px (Sticker · Chữ · Ngày · Màu · ↶ ↷); tool sheets as non-modal bottom sheets at 40dvh | sheets at 45dvh; sticker grid 4 columns |
| done | composite preview, primary [Chia sẻ], secondary [Lưu về máy], tertiary [Gửi vào thiệp] · [Chụp tiếp] | same |

---

## 6. Sound design and haptics

### 6.1 Audio rules

- One `AudioContext`, created and `resume()`d inside the **first user gesture** ("Chạm để mở", "Vào chụp nào"). That same gesture primes the YouTube player (mobile autoplay policy).
- SFX are a single **audio sprite** (Opus in WebM + AAC in M4A fallback, ≤180 KB total) decoded once with `decodeAudioData`.
- All SFX are **original**: recorded foley or CC0-licensed and re-processed. Nothing is lifted from the reference videos, whose soundtracks are TikTok overlays (v1 §8, v3 §8, v5 §8).
- Levels: SFX peak −12 dBFS to −18 dBFS, below the music. When our own `<audio>` music plays, duck it −6 dB for 300 ms around loud cues (shutter, whoosh). YouTube music is ducked through `player.setVolume()`. Spotify embeds cannot be ducked, so play SFX at −20 dBFS while Spotify is `playing`.
- A sound toggle 🔊/🔇 sits in the chrome (44 px). The state persists in localStorage (try/catch). The default is **on** for the gift card (a music-driven experience) and **on** in the booth (shutter feedback).
- **Reduced motion does not mute sound**. A separate "Âm thanh hiệu ứng" toggle exists. Ambient loops (print whirr) stop when the tab is hidden.

### 6.2 Cue table

| ID | Cue | Trigger (state / event) | Offset | Dur | Character | Level | Haptic (Android `navigator.vibrate`) | Evidence for timing |
|---|---|---|---|---|---|---|---|---|
| `coin.drop` | **coin** clink + slide into slot | booth `TAP_COIN` / B `SHUTTER` in booth skin | 0 ms (same frame as token drop) | 350 ms | bright metallic tick + short slide | −14 | `20` | v1 #4 f24–26 |
| `coin.ping` | soft sparkle | hotspot ring (only the first 2 pings) | ring start | 250 ms | glassy, very quiet | −24 | — | v1 #3 f14–23 |
| `tick` / `tick.high` | countdown digit | each `stampPop` | digit mount | 60 ms | wooden tick; "1" is a semitone higher | −16 | `10` | v1 #7–11 |
| `shutter` | **shutter** | `cameraFlash` / capture | flash peak (0 ms) | 180 ms | mechanical two-blade click + tiny wind | −12 | `30` | v1 #13–16 |
| `flash.charge` (optional) | flash recharge whine | after each shot when another follows | +200 ms | 500 ms | rising, very soft | −26 | — | — |
| `print.whirr` | **print whirr** loop | "đang in…" until the toss | F4 + 233 ms | loop (400–700 ms per strip) | small thermal printer motor | −20 | `[8,40,8,40,8,40]` during the feed | v1 #21–22 f84–101 |
| `paper.pop` | paper flick | strip/polaroid lands | land frame | 120 ms | crisp card on table | −16 | `15` | v1 #23 f112 |
| `paper.rustle` | **paper** rustle | letter modal open / close; letter page arrival | +67 ms (scrim start) | 300 ms | soft sheet slide | −18 | `8` | v1 #39–46 |
| `paper.unfold` | envelope flap open | envelope `paperDipCrossfade` | +400 ms | 333 ms | paper creak + flap | −16 | `12` | v5 A-e05 f44–54 |
| `ribbon.swish` | satin swish | box whip-off | +533 ms from release | 150 ms | fabric whoosh | −16 | `[8,60,20]` | v4 B5 f130–133 |
| `box.thup` | lid thump | lid lands | +1,013 ms (end of `lidFlip3D`) | 120 ms | cardboard thud, low | −14 | `25` | v4 B7 f142–143 |
| `bite.crunch` | crunch | each `BITE` | 0 ms | 120 ms | 3 variants, round-robin | −16 | `15` | v4 B13 |
| `chime.note` | **chime** (small) | caret note pops, first bite per item | 0 ms | 300 ms | single bell, pitch rises per item (C, E, G) | −18 | — | v4 B18 |
| `chime.soft` | completion chime | letter fully typed (+800 ms) | +800 ms | 600 ms | soft two-note | −20 | `[10,80,10]` | v3 gap (no completion cue) |
| `chime.success` | export done | booth `done` | 0 ms | 700 ms | three-note sparkle | −16 | `[20,60,40]` | — |
| `pop.sticker` | bubble pop | `stickerPop` (reveal stinger, sticker add) | 0 ms | 90 ms | soft mouth pop | −18 | `10` | v4 B8 |
| `hearts.flutter` | tiny flutter | `heartBurst` | 0 ms | 500 ms | wing flutters | −22 | — | v1 #35 |
| `petals.whoosh` | curtain drop / flower wipe | `curtainDrop`, `flowerWipe` | +60 ms; peak at full cover (+600 ms) | 1.4 s | airy whoosh with petal rustle | −16 | — | v1 §8 rec.; v5 A-e12 |
| `bloom.whoosh` | finale | `C7.flowerFlood` | impact at +330 ms (land on a downbeat if music plays) | 1.6 s | throw swish → soft boom → bloom shimmer | −14 | `[0,330,40]` (fires at impact) | v4 D12–D20 |
| `tap.soft` | generic UI tap | pill/chip/button pointerup | 0 ms | 40 ms | felt tap | −24 | `8` (only primary buttons) | — |
| `error.soft` | wrong passcode / failed action | `PASS_BAD`, capture error | 0 ms | 200 ms | low double bloop | −18 | `[40,30,40]` | — |
| `type.tick` | typewriter tick | per glyph **only when ≥80 ms/char**; otherwise none | per span | 20 ms | very soft key | −30 | — | v3 §8 ("ticks would be noise at 27 ms/char") |

### 6.3 Haptics policy

```ts
const canVibrate = typeof navigator.vibrate === "function";              // Android Chrome/Firefox; not iOS Safari
let hapticsOn = true; try { hapticsOn = localStorage.getItem("haptics") !== "off"; } catch {}
export function hapt(p: number | number[]) {
  if (!canVibrate || !hapticsOn || document.hidden) return;
  try { navigator.vibrate(p); } catch {}                                  // some webviews throw or ignore
}
```

- Only after a user activation: browsers ignore `vibrate` before sticky activation.
- The patterns are **short**: ≤40 ms pulses, never more than 3 pulses, never continuous. Continuous loops are allowed only during the print feed (≤700 ms).
- Respect a "Rung" toggle in settings. Reduced motion does not disable haptics, but it halves the print-feed pattern.
- iOS: there is no Vibration API. Do **not** ship the hidden `<input type="checkbox" switch>` trick (fragile and undocumented). iOS users get sound plus visual feedback only.

---

## 7. Privacy, accessibility, robustness

### 7.1 Self-photobooth privacy (on-device by default)

- All capture, composition, filters, GIF/MP4 encoding and stickers run **on the device** (workers + OffscreenCanvas + WebCodecs). **No network request carries image data** unless the user picks "Gửi vào thiệp", which needs explicit confirmation.
- Say so on screen once, in the permission explainer, and in a footer line on `done`: "Ảnh chỉ nằm trên máy bạn."
- Stop camera tracks whenever not in `setup`/`session` (§5.2). Never record audio. Never call `getUserMedia` before the explainer tap.
- Drafts (unsaved shots) live in memory only. Optional "Giữ ảnh tạm" stores them in IndexedDB with a visible [Xoá ảnh trên máy] button. Everything auto-purges after 24 h.
- Analytics: event names only (`booth_shutter`, `export_gif`). Never thumbnails, face data or EXIF. The optional `FaceDetector` crop hint stays on-device and is never persisted.

### 7.2 Gift card privacy

- Unguessable slugs (≥128-bit), `noindex` and `X-Robots-Tag: noindex`, no listing pages. The OG card never shows private content (§3.7).
- EXIF/GPS is removed on device before upload (§3.3).
- **Memory map** is opt-in. Pins are placed deliberately by the sender, and the step warns: "Người có link sẽ thấy các địa điểm này". Offer "Làm mờ vị trí" (round pins to ~1 km).
- **Read receipt** is opt-in by the sender. The recipient sees a small line on the landing ("{from} sẽ biết khi bạn mở quà"). Only a timestamp is recorded.
- Voice notes and replies are stored with the gift and deleted with it ("Xoá món quà" deletes everything within 24 h, CDN purge included).

### 7.3 Accessibility

- Hero objects are `role="button"` with `aria-label` ("Mở phong thư"), focusable, and respond to Enter/Space. Drag gates (ribbon) **always** have a tap fallback (§4.2) and a visible "Mở" button for switch users after 8 s.
- **Typewriter:** spans are `aria-hidden`. The full text sits in a visually-hidden element that is announced once. Tap-to-complete is always available. Reduced motion shows all text at once (motion.md §5.1).
- **Focus:** the lightbox and the letter modal trap focus and close with Esc. The non-modal drawer **does not** trap focus. It is reachable by Tab and closes with Esc. Focus returns to the FAB.
- **Contrast:** status pills and prompts meet 4.5:1 over their local background. The timed prompt at .85 opacity over the flower wall gets a soft text-shadow (v5 A-e10) **plus** a 30% cream pill behind it on low-contrast walls.
- **Reduced motion:** use motion.md §5.1 equivalents everywhere. Every spectacle becomes a 300 ms crossfade, and every gate still works.

### 7.4 Vietnamese text input

- Use `<textarea>`/`contenteditable` with **no** keydown filtering. Telex/VNI composition (e.g. "aa" → "â", "s" → acute) happens through IME composition events on mobile keyboards (Gboard, Laban Key) and desktop (Unikey). Validate on `input`/`compositionend` only.
- Normalise to **NFC** before saving (macOS and some keyboards produce NFD combining marks). Count and limit by **graphemes** (`Intl.Segmenter('vi', {granularity: 'grapheme'})`). The typewriter splits by grapheme too (motion.md P42).
- Names are shown as typed. Never title-case them automatically.

### 7.5 Network and device robustness

- **Loading card** ("Đang gói quà…" with a hand-drawn progress bar, after v2a's loading card): wait for the critical set before landing:
  - the mechanic atlas (≤600 KB on low tier)
  - fonts via `document.fonts.load()`
  - the first 3 photos decoded
- Everything else streams during reading holds (G6).
- **Timeouts:**
  - if the atlas has not arrived after 8 s on 3G, switch to the **lite mechanic** (static illustration + `paperDipCrossfade` + 300 ms crossfade)
  - show "Mạng hơi chậm, đang dùng bản nhẹ" as a 0 ms label
- **Tier probe:** motion.md §5.2. If p90 frame time > 20 ms during the landing idle, drop one tier *before* the first spectacle.
- **Orientation / resize:** recompute the stage scale on `resize` (debounced 100 ms). Never re-run a choreography on resize. Snap it to its end state.
- **Fullscreen media:** **never** use native element fullscreen for embeds (v5 f650–710 reflow bug). Use an in-app **theater overlay** (FLIP 450 ms `cubic-bezier(.2,.8,.2,1)`, backdrop rgba(10,6,8,.92)). If native fullscreen is used anyway, save `scrollY` and the drawer scroll on `fullscreenchange` and restore them on exit.

---

## 8. Anti-pattern register (observed → fix)

| # | Anti-pattern (observed) | Evidence | Fix in our build |
|---|---|---|---|
| AP1 | **Reels keep spinning after the video is paused**: the media indicator desyncs from real state | v5 C-e13/C-e15 f741–817 | `audio` region: `reelSpin` only inside `playing`; `exit` stops reels (§4.3). No real state source (Zing link-out) means no reels (§3.4) |
| AP2 | **~200 ms decode freeze, then late photo "pops"** with variable 100–533 ms delays | v3 f514–519 stall, f520–522 pops, §10 | Decode with `img.decode()`/`createImageBitmap` before the transition (G6); a deliberate `stickerPop` at a fixed delay with an 80–120 ms stagger; placeholder discs only if decode misses its deadline |
| AP3 | **Native fullscreen exit reflow**: page scroll 100→41, the card's inner scroll resets to 0, the FAB is missing for 1 frame | v5 C-e12/m02 f709–710 | In-app theater overlay; save and restore scroll; avoid fixed-height inner-scroll media cards (§7.5) |
| AP4 | **Chrome above the lightbox scrim** (drawer + rose CTA float over the modal) | v4 D5 note, §10 | z-order table §1.7: `chrome` is set inert and hidden while `lightbox` is open |
| AP5 | **End-state snap under a scrim**: the box/tray reflows to its final pose in 1 frame when the finale starts | v4 D9 f570 | Animate with `layoutMove` (280 ms) before the cover, or perform the change *under* the cover after ≥70% coverage (G11) |
| AP6 | **No press states** on any button; taps never acknowledged | v3 §1, §4 item 8 | `pressSquash` / scale .97 for 60–80 ms; fire on pointerup; `-webkit-tap-highlight-color: transparent` |
| AP7 | **No completion cue or end control**: the letter rests static for 2+ s with nowhere to go | v3 f605–669 | Heart pop + `chime.soft` 800 ms after typing; mount the finale CTA; end card with replay/reply |
| AP8 | **Full-screen tap target with an arrow cursor** (the wall is tappable but gives no pointer cue); CTA has no hover state | v5 §7 rec., C-e09 | `cursor:pointer` on every hit area incl. the wall; on touch, the timed prompt + hint ring do the job |
| AP9 | **Instant scroll jumps** inside the drawer (+337 px snap; rail 50→385 px) that disorient | v4 D2 f403; v1 #43 f304 | CSS `scroll-snap-type: y proximity` with `scroll-behavior: smooth`; section tabs inside the drawer scroll with `inOutQuad` 400 ms |
| AP10 | **1-frame ghost of the tooltip** on teardown | v1 #47 f471–472 | Tear down chrome in one commit (single state flag) before starting the cover |
| AP11 | **Media latency without feedback**: 1.73 s from click to `playing` with only text changing | v5 B-03/B-05 f312→364 | `buffering` state with a small spinner on the track button; label "Đang tải…" |
| AP12 | **Interaction depends on hover** (chrome appears on first pointer move) | v5 A-e01 f17 | Timer-based chrome mount (+3.0 s / +3.2 s) on touch devices |
| AP13 | **Unconfirmed "no thanks" branch**: a binary gate with an unknown or punishing outcome | v3 f230–267, §10 | "Để sau" leads to a kind hold page that keeps the way forward; no dodging buttons |
| AP14 | **Choreography speed tuned for TikTok, not real use**: 280 ms digits, 240 ms flash spacing | v1 §10 ("may need ×1.5–3.5") | The real camera booth uses 1,000 ms digits and 2.4 s between shots (§5.4); the gift-card booth keeps the reference speed because no one is posing |
| AP15 | **Recording/encoder artefacts mistaken for design** (blur on the curtain, sharpening, watermark hops, duplicate frames) | v4 A-E5/A-M2 (dropped); v2a artefacts; v1/v4 25→30 fps duplicates | Not reproduced. Timings carry ±33 ms; treat ratios as reliable |
| AP16 | **Fixed-height inner-scroll cards for media** with hard stops | v5 §7 rec., B-11 | Bottom-sheet detents; content flows in the sheet's single scroll container |

---

## 9. Build checklist (UX acceptance)

- [ ] Every waiting screen has exactly one living hero plus the escalation ladder (§1.2), cancelled on first touch.
- [ ] Every tap gives same-frame feedback; every stage is separated by a 67–233 ms micro-hold.
- [ ] Taps during choreography are queued or fast-forward the spectacle; they never skip it or double-fire.
- [ ] Status labels swap in 0 ms and are mirrored to `aria-live`.
- [ ] Drawers are non-modal with no scrim; modals use plum scrims; nothing sits above the lightbox.
- [ ] Chrome mounts by timer on touch (+3.0 s / +3.2 s); the finale is gated by `readEnough`, with a gentle nudge on early taps.
- [ ] The media indicators follow real player events; a source without state never animates reels.
- [ ] All images for the next scene are decoded before its transition starts.
- [ ] Each scene is verified at 390×844 and 360×780 (low tier) in Chrome Android, iOS Safari, and the Zalo and Messenger in-app browsers.
- [ ] Booth: explainer → permission → denied help → upload fallback; camera stops when idle; no image bytes leave the device unless "Gửi vào thiệp" is confirmed.
- [ ] Exports: PNG always; GIF ≤3 MB; MP4 via WebCodecs with a WebM/GIF fallback; Web Share with files first.
- [ ] Only fonts from the verified 74/74 list; NFC + grapheme counting; no keydown filtering.
- [ ] Reduced motion: every spectacle becomes a 300 ms crossfade; every gate still works.
