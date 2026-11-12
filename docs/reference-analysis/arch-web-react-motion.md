# Architecture proposal: web-first PWA (React + Motion, Canvas2D, Supabase + Vercel)

Status: proposal, 2026-11-12. Angle: **the recipient opens a link and nothing gets installed.** Product A (gift card) and product B (self-photobooth) ship as one web app.

Inputs: `motion.md` / `motion-tokens.json` (choreographies C1–C8, tiers, budgets), `visual.md` (themes, asset list), `ux.md` (state machines, booth flow, export specs), `vietnam.md` (in-app browsers, PDP law, payments, fonts), `audit.md` (adopted canonical values, anti-patterns A1–A10). Frame evidence is cited as `vN fA-B`, as in those files.

IP rule, restated for engineering: the code reproduces **timing, curves, density and choreography**. Every bitmap in the repo is original commissioned art. No reference frames, brand names or the v3 licensed mascot go into the asset pipeline, test fixtures or OG images. CI fails if `assets/` contains a file without a provenance entry (see §5.4).

---

## 0. Summary of decisions

| Concern | Decision | Why (and what it costs) |
|---|---|---|
| App framework | **Next.js 16.x (App Router) on Vercel**, React 19.3, TypeScript. Vite 8.3 + a small Vercel Function stays a valid fallback (§1.2) | Per-slug server HTML for OG crawlers (Zalo/Messenger don't run JS), route handlers for the unlock gate, `next/font` self-hosting of the Vietnamese subsets, one deployable. Cost: the RSC/runtime overhead is wasted on a mostly client-side experience, and there is framework churn |
| UI motion | **Motion for React 14.x** (`motion/react`, with `LazyMotion` + `m`) plus imperative `animate()` sequences | WAAPI acceleration for transform/opacity, so springs keep running when the main thread is busy (springs become CSS `linear()`, and `motion-tokens.json` already carries the `cssLinear` strings). Layout/shared-element (`layout`, `layoutId`) covers C2 and C6 |
| Timelines | **GSAP 3.15: optional, lazy, in one place only** (C8 lyric pages, which are seeked by the audio clock). Not on the critical path | Motion sequences with `at:` offsets cover C1–C7. GSAP adds ~25 KB gz and a second mental model, and its free licence has a no-competing-with-Webflow clause that legal should read (§13) |
| Particles | **Custom Canvas2D engine (~5 KB)** for bloom, curtain, finale, confetti, hearts and petals. **PixiJS 8 only behind a flag on the high tier** if more than 60 sprites are ever needed | At the measured low-tier counts (24–30 sprites, motion.md §5.2), Canvas2D `drawImage` takes <2 ms per frame. Pixi is ~100 KB gz plus WebGL context risk inside webviews, for no visible gain at these counts |
| Stateful illustrated objects | **Layered WebP + Motion**, not Rive, for v1. Rive/Lottie are re-evaluated after launch | `visual.md` §6.4 proposes Rive for the ribbon/lid/envelope. The Rive WASM runtime (a few hundred KB) blows the 300 KB first-load budget (`vietnam.md` §5.2), and every Rive file is a second asset pipeline. The ribbon and lid are 7 layers on one curve (v4 f114-143), which DOM can do |
| State | **XState 5** machines from `ux.md` §3.8 / §4.3 / §5.10 | The flows are explicit graphs with guards (unlock, passcode, readEnough, debounce G15). Machines make preview mode (`context.preview`, ×3 time-scale) and browser-back handling testable |
| Booth pipeline | getUserMedia → `requestVideoFrameCallback` frame grab → worker compositor (OffscreenCanvas) → PNG / GIF (`gifenc`) / MP4 (WebCodecs + **Mediabunny**, the successor to `mp4-muxer`) → Web Share / long-press save | Fully on-device (privacy promise in `ux.md` §7.1). The fallback ladder for Zalo/Messenger is file-input capture (§4.7) |
| Backend | **Supabase** (Postgres + RLS, Storage, Auth, pg_cron) in `ap-southeast-1`. **Server logic lives in Next route handlers on Vercel `sin1` (Node runtime)**. Supabase Edge Functions are used only for DB-side jobs | One server language and runtime, and `sharp` is available for server-side re-encoding and EXIF stripping. Fewer moving parts than splitting logic across Deno and Node |
| Hosting region | Vercel `sin1` + Supabase Singapore. Media cached at the CDN | ~30–60 ms RTT from HN/HCMC (an estimate in `vietnam.md` §5.6; measure with RUM). Data localisation (Decree 53) is an open legal question (§10.5) |

---

## 1. Stack and versions

### 1.1 Pinned set (verify each at install and pin exact versions in `package.json`; no `^` on animation or media libs)

| Layer | Package | Version line | Notes |
|---|---|---|---|
| Runtime | Node | 22 LTS (or 24 LTS if Vercel defaults to it) | Vercel Functions, Node runtime |
| Framework | `next` | 16.x stable | App Router, Turbopack builds, `next/font/google` with `subsets: ['vietnamese']` |
| UI | `react`, `react-dom` | 19.3 | Use React Compiler only after the motion components pass perf tests (it changes memoisation around refs) |
| Motion | `motion` | 14.x | Import from `motion/react`. Use `LazyMotion features={domAnimation}` on the recipient route; load `domMax` (layout, drag) only in scenes that use them |
| Timelines | `gsap` | 3.15 | Dynamic `import()` in the lyric chapter only |
| Particles | in-house `@app/fx` | — | Canvas2D, a single rAF |
| High-tier sprites (optional) | `pixi.js` | 8.x | Behind `fx.renderer = 'pixi'`; never on the low tier |
| State | `xstate`, `@xstate/react` | 5.x / matching major | Inspector in dev |
| Validation | `zod` | 4.x | Gift content schema, shared by client and server |
| Supabase | `@supabase/supabase-js`, `@supabase/ssr` | 2.x / latest | `ssr` for cookie sessions in route handlers |
| Uploads | `tus-js-client` | 4.x | Resumable uploads to Supabase Storage (voice notes, flaky 4G) |
| Images (server) | `sharp` | latest | Re-encode and EXIF strip in `/api/media/finalize` |
| GIF | `gifenc` | 1.x | Worker; 128-colour palette |
| MP4 | `mediabunny` | latest | Mux over WebCodecs. `mp4-muxer` and `webm-muxer` are in maintenance in favour of it |
| PWA | `@serwist/next` | latest | Service worker; precaches the shell and atlases |
| Fonts | `next/font/google` | — | Be Vietnam Pro, Mali, Dancing Script, Playfair Display, Paytone One, Playwrite VN (**only fonts that pass the 74/74 glyph check**, `vietnam.md` §4.1) |
| OG | `next/og` (`ImageResponse`, Satori) | bundled | Satori needs **TTF/OTF/WOFF, not WOFF2**, so ship a TTF Vietnamese subset of Be Vietnam Pro for the OG renderer |
| QR | `qrcode` | 1.x | Share card, VietQR payments |
| Analytics | `@vercel/speed-insights`, `web-vitals` 5.x | — | Plus a custom `spectacle_frame_p90` metric (§7.5) |
| Testing | Vitest 4.x, Playwright 1.x | — | Playwright on real Android over ADB/BrowserStack (§7.6) |

### 1.2 Next.js vs Vite, honestly

| | Next.js 16 | Vite 8.3 SPA + Vercel Functions |
|---|---|---|
| OG per slug for crawlers | `generateMetadata` in the page; nothing extra | Needs a function or middleware that rewrites `/g/:slug` HTML with meta tags (about one day of work) |
| First-load JS for the recipient | ~+30–45 KB gz framework runtime over Vite | Smallest |
| Fonts | `next/font` self-hosts the VN subsets automatically | Fontsource packages, same result with more manual work |
| Exit animations on route change | `AnimatePresence` across App Router navigations is awkward | Easy with a client router |
| Server code | Route handlers sit next to the pages | `/api/*` functions, same platform |

The exit-animation problem does not bite here. **Each experience is one route whose scenes are machine states, not routes** (`/g/[slug]`, `/booth`, `/create/[id]`), so no spectacle ever crosses a navigation. Choose Next for the single deployable. All motion, fx and booth code lives in framework-agnostic packages (§2), so moving to Vite later costs about a week.

---

## 2. Repository and module structure

A pnpm workspace with Turborepo. A solo developer can collapse `packages/*` into `apps/web/src/*` with the same boundaries; keep the **import rules** either way.

```
repo/
├─ apps/web/                         Next.js app (the only deployable)
│  ├─ app/
│  │  ├─ (site)/page.tsx             landing: "Tạo thiệp" / "Vào photobooth"
│  │  ├─ booth/page.tsx              product B (client-only, dynamic import, no SSR)
│  │  ├─ create/[draftId]/page.tsx   creator wizard (ux.md §3.2 steps 1–10)
│  │  ├─ g/[slug]/page.tsx           recipient: server component → gate state + meta → <GiftPlayer/>
│  │  ├─ g/[slug]/not-found.tsx      revoked/expired soft page
│  │  ├─ api/gift/[slug]/open/route.ts     unlock + passcode gate → content + signed media URLs
│  │  ├─ api/gift/[slug]/event/route.ts    opt-in "đã mở" receipt, replies
│  │  ├─ api/media/sign-upload/route.ts    upload tokens scoped to draft
│  │  ├─ api/media/finalize/route.ts       sharp re-encode, EXIF strip, sizes, hash
│  │  ├─ api/publish/[draftId]/route.ts    freeze version, mint slug, render OG, render gift strips
│  │  ├─ api/pay/{create,ipn-momo,ipn-zalopay,ipn-vnpay,bank-webhook}/route.ts
│  │  └─ manifest.ts, sw.ts (serwist)
│  ├─ middleware.ts                  in-app UA tagging (header only, never blocks bots), security headers
│  └─ public/assets/…                hashed atlases/plates from the asset build (immutable cache)
├─ packages/
│  ├─ motion/        tokens.ts + tokens.css (generated from motion-tokens.json), primitives P01–P43,
│  │                 choreographies C1–C8 as data + Director, reduced-motion variants, tier
│  ├─ fx/            Canvas2D engine: atlas loader, emitters (bloom, wall, flood, confetti, hearts, petals),
│  │                 tier budgets, frame probe; optional pixi adapter
│  ├─ booth/         camera.ts, capture.ts, compositor.worker.ts, lut.ts, gif.worker.ts, mp4.worker.ts,
│  │                 layouts.ts (ux.md §5.6 table), stickers model, inapp.ts (detection + ladder)
│  ├─ machines/      creator.machine.ts, recipient.machine.ts, booth.machine.ts (ux.md §3.8/§4.3/§5.10)
│  ├─ gift-schema/   zod schemas for gift content v1, migrations between content versions, fixtures
│  ├─ i18n/          vi.json / en.json (346 keys, vietnam.md §3), t(), pronoun/tone interpolation,
│  │                 grapheme utils (Intl.Segmenter + regex fallback), NFC normalise, secret-answer match
│  ├─ ui/            Pill, HeartFab, Drawer, LetterCard, Polaroid, PhotoStrip, MusicDock, HintRing,
│  │                 CountdownStamp, GuardTooltip (visual.md §5), theme CSS variables
│  ├─ media/         YouTube IFrame / Spotify embed adapters exposing one truthful PlayerState (G16)
│  └─ audio/         SFX sprite on Web Audio, unlock-on-gesture, ducking under embeds
├─ assets-src/       pointers to art masters (not the PSDs) + provenance.yaml
├─ tools/            build-assets.ts (sharp + atlas packer), font-glyph-check.py (fontTools, 74 glyphs),
│                    tokens-gen.ts, og-fonts subset script
├─ supabase/         migrations/*.sql, policies, seed.sql, functions/purge-expired/ (Deno)
└─ e2e/              Playwright specs, device matrix, perf traces
```

**Import rules** (enforced by an ESLint boundaries rule): `motion` and `fx` know nothing about Supabase or React Server Components. `booth` never imports network code, so the "no image leaves the device" promise is checked by lint: `booth/**` cannot import `@supabase/*` or call `fetch` (only `create/` may upload a strip, after explicit consent). Route handlers are the only code that holds the service-role key.

---

## 3. Choreography implementation (product A)

### 3.1 The Director: one clock, three renderers

Every choreography in `motion-tokens.json → choreography` already has the shape `[offsetMs, durMs, element, action]`. The code keeps that shape. A choreography is **data**, and `Director.play(spec, refs)` schedules it:

```ts
type Step = { at: number; dur: number; target: string; action: ActionId; token?: string; tierMin?: Tier };
interface Director {
  play(spec: Step[], refs: TargetMap, opts: { timeScale?: number; reduced?: boolean; tier: Tier }): Run; // Run = { finished: Promise<void>, skip(): void, pause(), resume() }
}
```

- **DOM targets** go to Motion `animate()` sequences (`[[el, keyframes, { at, duration, ease }], …]`). Easings come from `E` and springs from `sp(name)`; there are no raw beziers in components (motion.md §0). Opacity and transform run as WAAPI on the compositor.
- **Canvas targets** (`bloom`, `wall`, `flood`, `confetti`) go to `fx.emit(kind, params)` on the shared rAF.
- **State/text targets** (pill labels, prompt removal) are 0 ms hard cuts (G5): a `setState` at the offset, with no tween.
- One `performance.now()` clock is used. For C8 it is replaced by the audio clock.
- **`finished` drives prompts**, not fixed timers (fixes anti-pattern A8, v5 f152 vs f156). Input is ignored until the run reaches its next interactive state (G15).
- **`skip()`** jumps every target to its end state. It is used by the "Bỏ qua hiệu ứng" control, by resize mid-sequence (`ux.md` §7.5), and by browser back.
- **Preview mode** (`ux.md` §3.6) sets `timeScale: 3` on Motion animations (`speed`) and on the fx clock.
- **Reduced motion** swaps the spec for `reducedMotion[spec]` from the tokens (every spectacle becomes a 300 ms crossfade; motion.md §5.1).

Rule G6 (pre-decode, pre-mount) is code, not convention. `Director.play` awaits `preload(spec.assets)`, which calls `img.decode()` / `createImageBitmap`. A cover transition cannot start until the destination is decoded, which fixes the v3 freeze (A3, v3 M25-M26).

### 3.2 C1 envelope + bloom burst + curtain drop (v5 f32-235)

| Part | Implementation |
|---|---|
| Envelope idle float + hint ring | CSS keyframes (`.ambient`, compositor-only). Stopped by class removal on tap (G3, hard stop) |
| `tapWobble` [0,−2,1.9,−1]° 233 ms | Motion keyframes `rotate: [0,-2,1.9,-1]`, `ease: E.inOutSine` |
| Closed → open `paperDipCrossfade` 333 ms | Two stacked `<img>` layers (both decoded), cross-opacity with the dip curve (audit 1.7: art swap with dip, page crossfade without) |
| Bloom burst 870 → ~3400 ms | `fx.emit('bloom', { origin: envelopeCentre, count: tier.bloomSprites, coverage: bloomCoverage })`. Each sprite has a precomputed spawn time, radial vector, a 2–3 frame outBack pop and a slight spin. All sprites come from one atlas; **no allocation per frame** |
| Edge settle + wall drift (72 px/s) | At settle, the emitter stops simulating. The canvas is kept as a static bitmap, and the drift is a CSS `translateY` on a 2-layer parallax of **pre-rendered wall tiles**. After ~3.4 s, the cost is a compositor transform, not 24–80 draws per frame |
| Curtain drop 1400 ms `curtainFall` | Motion `animate(canvasEl, { y: '105vh' }, { ease: E.curtainFall })` plus opacity at +900 ms. The mask sweep (+1100 ms, `inQuad`) uses `mask-image` on high/mid only; the low tier gets opacity only (motion.md §5.4) |
| Letter page | **Pre-mounted** under the overlay from t0 (v5 A-e12). The typewriter starts at +1530 + 120 ms |
| Tap 2 accepted only after +4000 | The machine guard `bloomFinished`; the "Chạm để tiếp tục" prompt mounts on `run.finished` |
| Low-tier alternative | A pre-rendered bloom video (VP9-alpha WebM + HEVC-alpha MOV) was considered. It is **rejected for v1**: inline alpha video in Zalo/FB webviews is a playback lottery, it costs 1–2 MB, and 24 canvas sprites hit the frame budget anyway. Keep it as a remote-config escape hatch |

### 3.3 C2 ribbon pull + lid flip + completion spread (v4 f114-246)

| Part | Implementation |
|---|---|
| Ribbon drag (50 px threshold) | Pointer Events on the ribbon tail hit area (≥48 px). Motion `useMotionValue` drives the bow scale (1 → .8) and the tail stretch via `useTransform` (no React re-render per move). Release beyond the threshold commits; below it, a spring back. **Tap fallback** plays the same tug in 367 ms. After 8 s, a visible "Mở" button appears for switch and keyboard users (`ux.md` §7.3) |
| Knot collapse, `whipOff` (x +440, rotate 11→33°, inQuad 133 ms) | Motion sequence, ease-in exits (G4) |
| `lidFlip3D` 280 ms rotateX 0→180 **and** box y +105 on one `inOutCubic` curve | One sequence step that animates the lid (`rotateX`, `transformPerspective: 900`, `backface-visibility: hidden`) and the box (`y`) with the same timing. The landing spring was refuted (v4 B7 f136-143; audit §2 item 8), so no spring here |
| Sticker pop, hearts (6–10), pennants | `stickerPop` uses `sp('sticker')`. The low tier caps hearts at 6 (DOM; under 12 nodes it is cheaper than waking the canvas) |
| Bite taps | Sprite swap (3 bite states per treat, `visual.md` S2) with a 0 ms swap plus `pressSquash` |
| Completion spread (layout move left, `letterPop`, polaroid deals with 150 ms stagger) | The box uses Motion `layout` inside a `LayoutGroup` (critically damped, G1). The letter uses `sp('letterPop')`. Polaroids use `animate(els, …, { delay: stagger(0.15) })` |

### 3.4 C3 booth gift mechanic (v1 f24-228)

On the recipient side, the "photobooth" gift plays the **sender's pre-uploaded photos**, so no camera is involved. The strips are composited **at publish time** on the server (sharp, from the same layout definitions as product B) and stored as images. The recipient's low-end phone only animates them; it never composites.

| Part | Implementation |
|---|---|
| Coin → token drop, pill swap | 0 ms pill swap (G5). Token `y: -23` with `ease: E.in`, 100 ms |
| Countdown stamps | `CountdownStamp`: mounts at scale 1.12 at full opacity, `sp('stamp')` dips 2.3–2.8% and settles in 100 ms (audit §2 item 9). The exit is opacity only (60 ms) |
| Flashes | A DOM `div` with opacity keyframes (≤40 ms rise, linear decay, peak ≤.85). The shake is a `steps()` transform on the booth group only. **Cadence follows the product column (≥1 s between flashes), not v1's 240 ms** (WCAG 2.3.1, audit A1) |
| `slotPrint` | The strip moves with a linear `translateY` inside an `overflow: hidden` slot at ~100 px/s (G8). The slot has ≥0.15em top padding for Vietnamese stacked marks |
| `toss` arc | Separate transitions per property: `x` on `outCubic`, `y` on a 2-keyframe arc, `scale: [.29, 1.056, 1]` and `rotate` ±16° unwinding to the −3.6° / +1.3° / +4° fan via `sp('toss')` (v1 #23-31 f101-198; overshoot is held to ≤6% per audit 1.1) |
| Land reward | Caption at +33 ms. Confetti through `fx.emit('confetti', { count: tier.confetti })` on a **stage-level canvas**, so it is not clipped to the strip (v1 #25) |
| Dock | `drawerSlide` dock variant, `sp('dock')`, ζ 1.93 (v1 #37) |

### 3.5 C4–C6 reading UI

- **C4 letter modal:** a native `<dialog>` with `showModal()` gives the focus trap, Esc and `inert` background for free. Motion animates `opacity` and `y: 12→0, scale: .965→1` with the −1.5° static tilt. Close is the exact mirror, and focus returns to the trigger. The scrim is `rgba(70,25,55,.5)` with no blur (`backdrop-filter` is banned on the low tier).
- **C5 drawer:** non-modal `<aside>`, `x` with `sp('drawer')` (ζ 1.12, no overshoot) and opacity at 350 ms. There is no focus trap. Programmatic scroll uses `scrollIntoView` plus a 667 ms custom tween, never a jump (fixes A7).
- **C6 lightbox:** Motion `layoutId` shared element from the polaroid to the full view, with `sp('lightbox')`. Known pitfalls and their fixes:
  - **Aspect distortion:** `layoutId` scales the box, so the image must keep its aspect ratio. Wrap the image in a fixed-aspect container and animate the container.
  - **Rotation:** animate `rotate` explicitly (−4 → −1°) instead of letting projection infer it.
  - **Blurry upscale:** the 1080 px source is decoded *before* the FLIP starts (G6); the 480 px thumbnail is never scaled up.
  - The drawer and the finale CTA are hidden while the lightbox is open (fixes A5).

### 3.6 C7 flower-flood finale (v4 f570-610, v1 f473-545)

- Teardown of chrome takes 0 ms. The ghost veil steps to .12.
- **Hero flower throw:** one DOM `img` with Motion keyframes on `x`/`y` (arc) and `rotate` (−120 → +10°). The echo trail is 2–3 clones with lagged opacity, which are skipped on the low tier.
- **Impact flash** (#f6f0e8, .6 → 0, 100 ms) is a DOM layer **below** the flowers. Rays and the shockwave are a 2-frame SVG.
- **Burst mound:** `fx.emit('flood', { count: tier.finaleSprites })` (30 on the low tier).
- **Wall rise:** on the low tier, a single pre-painted wall image animates `translateY` (one compositor layer) instead of 50–90 sprites.
- **Scene swap at full cover (+1200 ms):** the end card is pre-mounted invisible. It is revealed with a 100–133 ms crossfade under the cover (G11), the overlay unmounts at +1830, and the hanging decorations get a `pendulum` impulse (`sp('pendulum')`, v1 #53).
- **Audio:** the impact lands on the nearest downbeat if one of our own library tracks is playing (t0 is shifted by up to one beat). With a third-party embed it is free-running, because we cannot read the beat.

### 3.7 C8 lyric/typewriter pages, and the one place GSAP earns its keep

- **Typewriter (P42), the default for every letter:** grapheme spans are pre-laid-out (`vietnam.md` §4.3) after `document.fonts.load('400 20px Mali', 'ắệữ')`. One rAF computes `n = floor((now - t0) / msPer)` and flips the `.on` class on spans up to `n`. Because the schedule is **time-anchored**, jank catches up rather than drifting (v3 "Happy B" stall then flush, f514-522). `msPer = min(127, 3220/n)` with a 25 ms floor (audit 1.11). Spans are `aria-hidden`; the full text sits in a visually-hidden node. Above 120 spans on the low tier, it animates by word.
- **Beat-locked lyric chapter:** a GSAP timeline built from the beat grid, kept **paused** and seeked every frame with `tl.time(audioClock())`. That is GSAP's real advantage: deterministic seeking, labels, and reverse for "xem lại". Motion can do this too (its `time` property is settable), so the week-1 spike decides. If Motion is fine, GSAP is dropped entirely.
- **The audio clock is only honest with our own tracks.**
  - With our own licensed tracks (`HTMLAudioElement` / Web Audio), the clock is `audio.currentTime` and the bpm is known.
  - YouTube IFrame `getCurrentTime()` is coarse and arrives over `postMessage`. Interpolate with `performance.now()` between polls (250 ms) and resync on `onStateChange`. Expect ±50–100 ms, which is good enough for line entrances but not for per-grapheme beat typing.
  - Spotify embed `playback_update` is too sparse. **Lyric mode is not offered with Spotify songs.**

### 3.8 Ambient and media truth

- Ambient loops (float, sway, hint ring, glint, reels) are CSS animations on compositor-only properties, at most 2 at once on the low tier. They pause via `IntersectionObserver` and `visibilitychange`.
- **Reels and "Đang phát" bind to `packages/media` PlayerState** (`playing | paused | buffering | ended | unknown`). With `unknown` (Zing link-out, Spotify without events), the reels stay still (G16, fixes A2).
- There is no native element fullscreen for embeds. A theatre overlay replaces it (A4, v5 f709-710).

---

## 4. Photobooth pipeline (product B)

### 4.1 Capability gate and in-app detection (before any prompt)

```ts
const inApp = /Zalo|FBAN|FBAV|FB_IAB|Messenger|Instagram|musical_ly|BytedanceWebview|TikTok|Line\//i.test(navigator.userAgent);
const canCam = !!navigator.mediaDevices?.getUserMedia && window.isSecureContext;
```

- **UA detection is a hint only.** It decides which banner to show *first*. The truth is the result of `getUserMedia` inside the user gesture.
- In an in-app browser, the "Mở bằng trình duyệt" sheet comes before the camera (mandatory for B, `vietnam.md` §5.1).
- `getUserMedia` is called only from the pre-permission explainer's [Cho phép] tap (`ux.md` §5.2).

### 4.2 Stream

- **Constraints:** `{ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 }, frameRate: { ideal: 30, max: 30 } }, audio: false }`. The low tier asks for 640×480. On `OverconstrainedError`, retry with `{ video: true }`.
- The preview is a `<video playsinline muted autoplay>` mirrored with CSS `scaleX(-1)` for the front camera. The setup screen's live filter preview uses a **CSS `filter` on the video element** (GPU, reliable on iOS). Only `ctx.filter` is unreliable on iOS, and export does not use it.
- **Warm-up:** the stream must run ≥500 ms (auto-exposure settles) before the coin/shutter is enabled.
- **Screen Wake Lock** (`navigator.wakeLock.request('screen')`) during the session.
- **Lifecycle** (`ux.md` §5.2): stop all tracks on `pagehide`, on leaving the booth, and after 60 s idle. Re-acquire on `visibilitychange`.

### 4.3 Countdown, flash, capture

- The schedule is `ux.md` §5.4 (the product column of motion.md C3): 3-2-1 at 1000 ms per digit, flashes at 3.1 s / 5.5 s / 7.9 s / 10.3 s, with a 2-1 re-countdown at 800 ms per digit between shots. That is ≥2.4 s between flashes, well under the 3-per-second limit (A1).
- **Screen flash** ("Flash màn hình", front camera): a `#FFF6EE` layer to opacity 1.0 in ≤1 frame, held ≥120 ms. Then **grab the first video frame presented at or after +100 ms**:

```ts
async function grabLitFrame(video: HTMLVideoElement, notBefore: number): Promise<ImageBitmap> {
  return new Promise(res => {
    const tick = (now: number) =>
      now >= notBefore ? createImageBitmap(video).then(res) : video.requestVideoFrameCallback(tick);
    video.requestVideoFrameCallback(tick);     // fallback where rVFC is missing: setTimeout + createImageBitmap
  });
}
```

- **Why not `ImageCapture.takePhoto()`** by default (despite `ux.md` §5.2): on many low-end Android cameras, `takePhoto` reconfigures the sensor. The preview stalls for 300–1000 ms, sometimes at a different field of view and with the screen flash already gone. That breaks the flash and the pose. Use it only on the high tier behind a feature test, and benchmark it in week 1.
- **Honest limitation:** the web cannot raise screen brightness. A screen flash at the user's brightness is a weak fill light compared with native booth apps.
- **Decorative flash** (Flash off): peak .85, ≤40 ms rise, 130 ms linear decay, plus a glow and starburst. Capture happens at flash start. With reduced motion, the decorative flash is capped at .4 with no shake.
- Each shot is an `ImageBitmap`, transferred (zero-copy) to the compositor worker immediately. The main thread holds only a 240 px thumbnail for the review tray.

### 4.4 Compositing at print resolution (worker)

`compositor.worker.ts` owns an `OffscreenCanvas` per layout (`ux.md` §5.6):

| Layout | Canvas | Decoded memory |
|---|---|---|
| 1×4 dải (2×6 in @300 dpi) | 600×1800 | 4.3 MB |
| 2×2 lưới / 4×6 postcard | 1200×1800 | 8.6 MB |
| Polaroid | 1080×1312 | 5.7 MB |
| Story 9:16 | 1080×1920 | 8.3 MB |
| "In 4×6" sheet (two 1×4 strips side by side, the format print kiosks and labs actually take) | 1200×1800 | 8.6 MB |

All of these are far under the iOS 16.7 MP canvas cap.

**Draw order:**
1. Frame background.
2. Photos, cover-fit and centre-weighted, mirrored or not per the "Lật ảnh" setting.
3. **Filter via a CPU 3D LUT** (17³, trilinear) applied per slot. A 520×390 slot is 203k px, which takes ~5–15 ms on a Snapdragon 4xx class device in a worker.
   - This replaces the WebGL LUT proposed in `ux.md` §5.7 for export.
   - WebGL in OffscreenCanvas is not universal across Safari versions and webviews, and a CPU LUT gives bit-identical output everywhere.
   - Live preview stays CSS `filter`, an approximation that is labelled as a preview.
4. Frame overlay PNG (print skin, P1).
5. Stickers, using the same 2D affine matrices as the DOM editor, scaled by `printW / screenW`. The 512 px sticker sources are enough at print size.
6. Text and date stamp.

**Text in a worker is the trap.** `FontFace` in workers (`self.fonts`) is not reliable across Safari and webviews. Text is therefore rasterised **on the main thread**: `document.fonts.load()` with a Vietnamese sample, then `fillText` on a small canvas at print scale, then `transferToImageBitmap`. The bitmap goes to the worker. Line height is ≥1.35–1.6 depending on the face (`vietnam.md` §4.4).

**Timing in the C3 anticipation beat ("đang in…", F4 + 233 ms):** the worker composites, then immediately posts back an `ImageBitmap` (`transferToImageBitmap`, no encode) for the print/toss animation. **PNG encoding is deferred** until after the toss (`convertToBlob` on a 1–2 MP canvas can take 100–300 ms on the low tier and would stutter the toss). If the worker is not done by F4 + 433 ms, `slotPrint` waits on the promise; it never animates a placeholder (G6).

**Fallback:** where `OffscreenCanvas` 2D is missing (old WebViews), the same code runs on the main thread inside the "đang in…" beat, and the mini print feed is skipped (toss directly, as motion.md C3 allows).

### 4.5 GIF and MP4 export

| Format | Pipeline | Memory and time on the low tier |
|---|---|---|
| PNG | `convertToBlob({ type: 'image/png' })`; JPEG q .92 if >8 MB | ~1–3 MB file |
| GIF | 4 frames × 500 ms + composite 1200 ms, 480 px wide, `gifenc` quantise (global 128-colour palette from the composite) in `gif.worker.ts` | <1 s, ≤3 MB |
| MP4 boomerang | Per shot, a **1.0 s burst at 15 fps** is grabbed with rVFC **downscaled at grab time** to 540 px wide (`createImageBitmap(video, { resizeWidth: 540 })`). Frames are ping-ponged and rendered into the layout canvas at 720×1280, then fed to `VideoEncoder({ codec: 'avc1.42E01F', width: 720, height: 1280, bitrate: 2.5e6, framerate: 30 })` and muxed by Mediabunny in `mp4.worker.ts` | **Memory is the constraint.** 60 frames at full 1280×960 would be ~295 MB, which kills a tab on a 3 GB phone. At 540×405 it is ~52 MB, with each bitmap `.close()`d after encode. Encode runs ~1–3× realtime with hardware H.264 |

- **Feature tests first.** Check `VideoEncoder.isConfigSupported` with dimensions that are multiples of 16. Low-end MediaTek/Qualcomm hardware encoders reject odd sizes. Try `prefer-hardware`, then `no-preference`.
- **Fallback 1:** `MediaRecorder(canvas.captureStream(30))`. It runs in real time (8 s of video takes 8 s). It gives MP4 on Safari and **WebM on Chrome**, labelled "Video (WebM)".
- **Fallback 2:** GIF only.
- Progress shows as "đang làm video… 63%" and the user can cancel.
- Boomerang mode skips the screen flash (`ux.md` §5.8), which also sidesteps the brightness problem.

### 4.6 Save and share

1. `navigator.canShare({ files: [file] })` → `navigator.share({ files })`. This is the best path in Chrome Android and iOS Safari 15+. It is **unavailable in most webviews**.
2. `<a download>` with a blob URL works on desktop and Chrome Android.
3. Long-press save: render the result as a real `<img>` plus "Nhấn giữ ảnh để lưu vào máy".
   - Some Android webviews refuse to save `blob:` images, so use a `data:` URL for files ≤2 MB (the PNG strip usually qualifies).
   - Video cannot be long-pressed. In webviews, the MP4 path must say "mở bằng trình duyệt để lưu video".
4. **Opt-in "Lưu qua link tạm" (deliberately not built for v1):** upload the export to a private bucket for a 24 h signed download URL that opens in the system browser. It breaks the "never leaves the device" promise, so it would need explicit consent copy. Decide after measuring how often webview saves fail.
5. "Gửi vào thiệp" is the only upload path, after an explicit confirmation (`ux.md` §5.9).

### 4.7 In-app browser fallback ladder (Zalo, Messenger, IG, TikTok)

| Step | Android | iOS |
|---|---|---|
| 1. Try `getUserMedia` in the gesture | Works only if the host app implements `onPermissionRequest`; varies by app version | WKWebView works only if the host opted in |
| 2. Escape to the real browser | `intent://{host}{path}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url={encoded};end`. **Zalo and FB may swallow intents.** Always pair it with "Sao chép link" | No programmatic escape: show "⋯ → Mở bằng trình duyệt" with a screenshot, plus copy link |
| 3. Native camera via `<input type="file" accept="image/*" capture="user">` | Works in nearly every webview | Works |
| | Collect 4 shots one at a time; replay the countdown and flash as a post-capture "develop" moment | same |
| 4. Gallery picker | `multiple` | same |

Product A in webviews needs no camera, so **most of A runs inside Zalo/Messenger unchanged**. The only A features at risk there are audio autoplay and file download, both covered by the gesture-unlock and long-press patterns.

---

## 5. Asset pipeline

### 5.1 Source → build

```
assets-src/<theme>/<asset-id>/*.png (2× masters exported by the illustrator, alpha)  + provenance.yaml
   │  tools/build-assets.ts  (sharp)
   ├─ plates & objects  → WebP q80–85 (+AVIF for plates ≥200 KB), 1× and 2× CSS size, ≤120 KB/sprite, ≤350 KB/plate
   ├─ flower/petal sets → atlas pages 2048² max (low tier: 1024² page with 15–25%-viewport sprites), 2 px extrude, JSON-hash
   ├─ print skins (P1)   → PNG at exact print px (600×1800 etc.) + WebP screen copy
   ├─ wall tiles         → pre-composited flower walls for the drift/rise phases (C1 drift, C7 low-tier wall)
   ├─ SFX                → one audio sprite: Opus/WebM + AAC/M4A, JSON offsets
   └─ manifest.<hash>.json  { theme, mechanic, acts: { critical: [...], act2: [...], ... }, bytes, tierVariants }
→ public/assets/<hash>/...   Cache-Control: public, max-age=31536000, immutable
```

### 5.2 Loading strategy per gift

- **Critical set before landing** (`ux.md` §7.5): the mechanic's act-1 atlas (≤600 KB on the low tier), fonts (`next/font` preloads the VN subset for the theme's 2–3 faces), and the first 3 photo thumbnails decoded.
- The next act's assets are fetched during the current act's reading hold, then decoded with `createImageBitmap`. The `fx` loader keeps **at most 2 atlases decoded** and calls `.close()` on the rest.
- After 8 s with the atlas missing, the gift switches to the **lite mechanic** (static plate + paper dip + 300 ms crossfade), labelled "Mạng hơi chậm, đang dùng bản nhẹ".

### 5.3 Fonts

- `next/font/google` with `subsets: ['vietnamese', 'latin']`, `display: 'swap'`, `adjustFontFallback`. It self-hosts at build time, which removes the Google origin.
- `tools/font-glyph-check.py` (fontTools, the same 74-glyph set as `metrics/fonts_vietnamese.txt`) runs in CI against the **built** WOFF2 files. A font that fails cannot be added to the theme registry. Caveat, Sacramento, Parisienne, Fredoka, Bebas Neue, Lilita One, Gochi Hand and Special Elite are hard-blocked.
- The creator's font picker offers only Mali, Playwrite VN, Dancing Script, Pangolin and Paytone One for user text (per `ux.md` §5.7 / §3.2).

### 5.4 Provenance and IP

`provenance.yaml` per asset records the illustrator, the contract ID, the date and "original: yes". CI fails on a missing entry. Reference frames and stills from the five videos live only in the analysis scratchpad and are **never copied into the repo**, including as test fixtures. Snapshot tests use our own art.

---

## 6. Data model (Supabase Postgres)

### 6.1 Tables

```sql
-- enums
create type mechanic as enum ('envelope','box','booth','notebook');
create type gift_status as enum ('draft','published','revoked','expired');
create type media_kind as enum ('photo','voice','strip','cover');
create type page_kind as enum ('letter','memories','songs','voice','map','treat_notes','notebook_page','end');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text, locale text default 'vi', age_confirmed_16 boolean not null default false,
  created_at timestamptz default now()
);

create table gifts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  status gift_status not null default 'draft',
  mechanic mechanic not null default 'envelope',
  theme text not null default 'garden-envelope',
  occasion text,                                   -- sinh-nhat, ky-niem, 14-2, 8-3, 20-10, ...
  locale text not null default 'vi',
  sender_name text, recipient_name text,           -- NFC-normalised, ≤24 graphemes (checked in app + zod)
  pronoun_self text, pronoun_you text, tone text,  -- 'anh'/'em', 'nhe'|'nha'
  og_show_names boolean not null default true,     -- privacy: "Ai đó gửi bạn một món quà"
  unlock_at timestamptz,                           -- null = open now; stored UTC, entered in Asia/Ho_Chi_Minh
  passcode_hash text, passcode_hint text,          -- scrypt; hint is public
  read_receipt boolean not null default false,
  current_version int,                             -- published version served to recipients
  expires_at timestamptz not null default now() + interval '90 days',
  premium_sku text, paid_order_id uuid,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table gift_versions (                       -- frozen at publish; recipients read only these
  gift_id uuid references gifts on delete cascade,
  version int not null,
  content jsonb not null,                          -- zod GiftContentV1 (validated server-side on publish)
  content_schema int not null default 1,
  published_at timestamptz default now(),
  primary key (gift_id, version)
);

create table gift_pages (                          -- draft editing granularity; flattened into content at publish
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts on delete cascade,
  ord int not null, kind page_kind not null,
  payload jsonb not null,                          -- e.g. letter {greeting, body, signature, font}, songs [{service,id,startSec,note}]
  updated_at timestamptz default now()
);

create table media (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts on delete cascade,
  owner_id uuid not null references auth.users on delete cascade,
  kind media_kind not null,
  status text not null default 'uploading',        -- uploading | ready | rejected
  bucket text not null default 'gift-media',
  path_base text not null,                         -- {gift_id}/{media_id}/ ; sizes: t480.webp, m1080.webp, l1600.webp
  width int, height int, bytes int, mime text, sha256 text,
  thumbhash text,                                  -- tiny placeholder shown while decoding
  duration_ms int,                                 -- voice
  caption text, ord int,
  consent_people_agreed boolean not null default false,  -- create.photos.consent (vietnam.md §5.5)
  created_at timestamptz default now()
);

create table share_links (                         -- slug lives here so links can be revoked and reissued
  slug text primary key,                           -- 22 chars base64url from 16+ random bytes (≥128 bit)
  gift_id uuid not null references gifts on delete cascade,
  og_version int not null default 1,               -- bump → ?v= busts Zalo's preview cache
  og_image_path text,
  created_at timestamptz default now(), revoked_at timestamptz
);

create table gift_events (                         -- only if gifts.read_receipt; no IP, no UA string stored
  id bigserial primary key, gift_id uuid references gifts on delete cascade,
  kind text not null,                              -- opened | finished | replied
  at timestamptz default now()
);

create table replies (gift_id uuid references gifts on delete cascade, id uuid primary key default gen_random_uuid(),
  body text check (char_length(body) <= 2000), created_at timestamptz default now());

create table passcode_attempts (slug text, ip_hash text, at timestamptz default now());   -- rate limit 5 / 10 min

create table consents (id bigserial primary key, user_id uuid, gift_id uuid, purpose text,   -- photos | voice | marketing
  policy_version text not null, granted boolean not null, at timestamptz default now());

create table orders (id uuid primary key default gen_random_uuid(), user_id uuid, gift_id uuid, sku text,
  amount_vnd int not null, method text, status text default 'pending', provider_ref text unique,
  ipn_payload jsonb, created_at timestamptz default now(), paid_at timestamptz, expires_at timestamptz);
```

Product B has **no tables**. Booth analytics are event names only (`booth_shutter`, `export_gif`), sent to Vercel Analytics custom events with no payload.

### 6.2 `GiftContentV1` (zod, shared)

```ts
const GiftContentV1 = z.object({
  mechanic: z.enum(['envelope','box','booth','notebook']), theme: z.string(), locale: z.enum(['vi','en']),
  names: z.object({ from: z.string(), to: z.string(), self: z.string(), you: z.string(), tone: z.enum(['nhe','nha']) }),
  pages: z.array(z.discriminatedUnion('kind', [ LetterPage, MemoriesPage, SongsPage, VoicePage, MapPage, TreatNotesPage, NotebookPage ])),
  mediaRefs: z.array(z.string().uuid()),            // resolved to signed URLs by /open
  strips: z.array(z.string().uuid()).optional(),    // booth mechanic: server-composited at publish
  finale: z.object({ enabled: z.boolean() }),
});
```

Content is versioned (`content_schema`). The player supports N and N−1, with a migration function in `gift-schema`.

### 6.3 Access control

- RLS is on for every table.
  - Owners get CRUD on their own `gifts`, `gift_pages`, `media` and `share_links`, and only while `status = 'draft'` for content (published versions are immutable).
  - **Anon gets nothing.**
- **Recipients never query Supabase directly.** Everything goes through `POST /api/gift/[slug]/open` (service role, server only):
  1. Resolve the slug. Revoked or expired → 410 soft page.
  2. **Unlock gate:** if `now() < unlock_at`, return `{ locked: true, unlockAt, theme, mechanic, names? }` and **no content, no media URLs** (`ux.md` §3.5). The client countdown uses a server-time offset. At T−0 it calls `/open` again; it never unlocks itself.
  3. **Passcode gate:** compare scrypt(NFC → lowercase vi → trim). The loose diacritic-free match is accepted only when the input had no diacritics (`vietnam.md` §4.2). Rate limit: 5 tries per 10 min per slug + IP hash, and 50 per day per slug. On success, set an httpOnly signed cookie `gp_<slug>` (7 days).
  4. Return `gift_versions.content` plus **signed URLs** for the needed media sizes from the private bucket. TTL 6 h; re-requested on resume.
- **Storage:** bucket `gift-media` is **private**, with `allowed_mime_types` (image/webp, image/jpeg, audio/webm, audio/mp4) and `file_size_limit` 8 MB. Owner insert policy on the `{gift_id}/` prefix only for drafts they own. Bucket `og` is public (closed-hero images only, never content). Static art comes from Vercel, not Storage.
- **Finalize:** after the client uploads, `/api/media/finalize` (Node, sharp):
  - re-decodes, verifies magic bytes, **strips EXIF/GPS again** (the client strip is not trusted), and writes the 3 sizes plus the thumbhash
  - rejects files over limits
  - voice is loudness-normalised (ffmpeg is not available on Vercel, so loudness normalisation is client-side with Web Audio before upload; accept that it's approximate)

### 6.4 Jobs

- `pg_cron` runs nightly and marks gifts past `expires_at` as `expired`.
- The Edge Function `purge-expired` deletes their storage objects (Storage API) and rows within 24 h. User-requested deletion uses the same function immediately, meeting the 72 h requirement in `vietnam.md` §5.5. Signed URLs expire on their own, and Vercel's cache never holds private media.

---

## 7. Performance budgets (low tier: Snapdragon 4xx class, 3 GB RAM, Chrome/WebView 90+)

### 7.1 Network and bytes (first open over 4G, ~1.5–5 Mbps effective)

| Item | Budget |
|---|---|
| Recipient route JS (gz) | **≤170 KB** initial (React+Next runtime ~85, Motion `LazyMotion`+`domAnimation` ~18, XState ~14, fx ~5, UI+machine+i18n ~40). `domMax` (layout/drag) ≤+15 KB is lazy per scene. GSAP is lazy and lyric-only |
| CSS | ≤25 KB gz |
| Fonts | ≤3 faces × the VN + Latin subset WOFF2 (~25–45 KB each) |
| Act-1 critical images | ≤600 KB (low tier), ≤1.5 MB before the first interaction overall (`vietnam.md` §5.2) |
| Gift JSON | ≤8 KB |
| LCP (loading card "Đang gói quà…") | ≤2.5 s p75; the card is pure CSS/SVG, so it paints before any image |
| INP | ≤200 ms p75; taps respond in the same frame (G7) via CSS `:active` + an immediate class swap |

### 7.2 Frame budget

- Target **60 fps with no frame over 33 ms** during spectacles (motion.md §5.4). Main-thread script ≤8 ms per frame during a spectacle. No long task (>50 ms) while a choreography runs, which Long Animation Frames entries confirm in CI traces.
- **Run nothing heavy during a spectacle.** Decodes, fetches of the next act, JSON parsing and IndexedDB writes are scheduled into reading holds via `scheduler.postTask({ priority: 'background' })` with a `requestIdleCallback` fallback.

### 7.3 Sprite and layer counts (adopted from `motion-tokens.json → budgets`, low / mid / high)

| Effect | Low | Mid | High | Renderer |
|---|---|---|---|---|
| Bloom burst / flower curtain | 24 | 48 | 80 | Canvas2D at DPR 1 / 1.5 / 2 |
| Finale burst + wall | 30 + 1 wall image | 50 | 90 | Canvas + 1 DOM layer |
| Confetti per landing | 8 | 12 | 15 | Stage canvas |
| Hearts per burst | 6 | 10 | 15 | DOM ≤6, canvas above |
| Petals on screen | 2 (no blur) | 3 | 3 + 1 blurred | Canvas |
| Glyph spans animating | 120 | 200 | ∞ | DOM classes |
| Concurrent ambient loops | 2 | 3 | 5 | CSS |
| Animated DOM nodes at once | ≤12 | ≤12 | ≤20 | Motion/WAAPI |
| Blur / backdrop-filter | none | text ≤4 px | yes | — |

**Why these counts fit:**
- At DPR 1, a 360×780 CSS-px canvas is 281k px.
- 24 sprites at 15–25% of viewport width overdraw about 3–5×, which is 1–1.4 Mpx of fill per frame. Adreno 3xx/5xx-class GPUs fill that in well under 8 ms.
- `drawImage` + `setTransform` × 24 costs <1 ms of script.
- The risk is not draw cost but **GPU memory and decode**: a 2048² atlas is 16 MB decoded, so the cap is 2 atlases.

### 7.4 Memory (tab-kill threshold on 3 GB Android is roughly 300–450 MB for the renderer)

| Budget | Value |
|---|---|
| Decoded images resident | ≤150 MB (thumbnails at 480 in grids; 1080 only for the open lightbox ±1 neighbour) |
| Atlases | ≤2 × 16 MB |
| Booth session | 4 shots × 4.9 MB + compositor canvases ≤10 MB + boomerang frames ≤55 MB → **≤90 MB peak**, every `ImageBitmap.close()`d |
| Camera preview | 640×480 on low tier |

### 7.5 Tiering and runtime probe

- Initial tier: `hardwareConcurrency <= 4 || deviceMemory <= 3` → low. iOS reports neither, so it starts at mid and relies on the probe.
- **Probe:** sample 30 rAF deltas during the landing idle. If p90 > 20 ms, drop one tier **before** the first spectacle. The result is persisted in `localStorage` (try/catch).
- Each spectacle reports `spectacle_frame_p90` and `dropped_frames` to analytics (numbers only). After launch, the tier thresholds are tuned from that data rather than guessed.
- A remote kill-switch (Vercel Edge Config) can force `lite` per mechanic if a device class regresses.

### 7.6 Test matrix (bought, not emulated)

- Two 3 GB Android phones: one Snapdragon 4xx-class and one MediaTek Helio-class, the most common budget SoC family in VN.
- One iPhone of SE 2nd-gen class.
- Each tested in Chrome, Zalo in-app, Messenger in-app and Samsung Internet.
- Playwright + `adb` remote debugging records traces for C1, C2, C3 and C7 on every release candidate. Chrome DevTools 6× CPU throttling is only a smoke test; it does not model GPU or memory limits.

---

## 8. Sharing and OG previews

- The `/g/[slug]` server component returns `generateMetadata`:
  - `og:title` "{from} gửi {to} một món quà 💌", or "Ai đó gửi bạn một món quà" when `og_show_names = false`
  - `og:description` "Chạm để mở", with "Mở vào 20/10" appended for locked gifts
  - `og:image` (1200×630 JPEG ≤300 KB) with width/height, `twitter:card=summary_large_image`, `robots: noindex, nofollow`, plus an `X-Robots-Tag` header
- **OG images are rendered once at publish**, not on each crawl. `ImageResponse` composites the closed hero (sealed envelope / wrapped box / booth) on the theme ground with names in the Be Vietnam Pro TTF subset. The result is stored in the public `og` bucket at `og/<slug>/<og_version>.jpg`.
  - Crawlers have short timeouts.
  - A pre-rendered file removes the cold start.
  - Zalo caches aggressively, so any edit bumps `og_version`, and the share URL carries `?v=<og_version>`.
- **Bots must never hit the in-app banner, the passcode wall or a redirect.** The middleware only tags in-app UAs with a header. The page HTML always contains the meta tags, whatever the gate state. Test with Facebook's Sharing Debugger and a real Zalo chat before launch.
- **Share sheet** (`ux.md` §3.7):
  1. `navigator.share({ title, text, url })`
  2. Zalo share plugin / deep link (verify the current Zalo developer docs; the plugin needs an app ID)
  3. `fb-messenger://share?link=` on mobile
  4. Copy link
  5. QR code (`qrcode`, rendered into a printable themed PNG 1080×1350)
- **Read receipt** (opt-in): `/api/gift/[slug]/event` with `opened` and `finished`, timestamp only.
- **Edits after first open** create a new version plus an "Có cập nhật mới" pill. Revoking sets `share_links.revoked_at`.

---

## 9. Accessibility and reduced motion

- **`<MotionConfig reducedMotion={pref}>`** at the root, where `pref` is `'user'`, or `'always'` when the in-app "Giảm chuyển động" toggle is on (persisted in localStorage). The Director separately swaps every choreography for its `reducedMotion` variant: spectacles become a 300 ms crossfade, ambient loops are off, the typewriter shows the full text, and confetti, petals and shake are off (motion.md §5.1). Hard cuts are unchanged.
- **Hero objects** are `<button>` elements with Vietnamese `aria-label`s ("Mở phong thư"), respond to Enter/Space, and have a ≥48 px hit area. The drag gate (ribbon) has a tap fallback, and a visible "Mở" button after 8 s.
- **"Bỏ qua hiệu ứng"** (skip): a small text button visible after 1 s of any spectacle. It calls `run.skip()`.
- **Status pills** use a `role="status"` live region (polite), debounced so a burst of hard-cut labels doesn't spam screen readers.
- **Typewriter:** spans are `aria-hidden`; the visually-hidden full text is announced once; tap-to-complete is always available.
- **`<dialog>`** handles the letter and lightbox (trap, Esc, return focus). The drawer is non-modal, reachable by Tab, and closes with Esc.
- **Photosensitivity:** booth flashes are ≥2.4 s apart, and decorative flashes peak ≤.85. A "Flash màn hình" toggle with a ☀ icon and a warning string is shown before the first session (`booth.flashWarning`).
- **Contrast:** pills and prompts ≥4.5:1 over their local background, with the 30% cream backing pill on flower walls (`ux.md` §7.3). Minimum text size 14 px (body) / 12 px (captions), because dot-below marks merge at 11 px on low-DPI screens.
- **Haptics:** `navigator.vibrate` is used where it exists (Android). **It is a no-op on iOS Safari**, so no feedback may depend on it.
- **Audits:** automated axe in Playwright, plus a manual TalkBack pass on the low-end Android and a VoiceOver pass on iPhone each release.

---

## 10. i18n, security and privacy

### 10.1 i18n

- Two locales, `vi` (default) and `en`, from the existing `vi.json` (346 keys × 2). A typed ~1 KB `t()` with ICU-lite placeholders is enough; a full i18n framework adds weight without benefit, since Vietnamese has no plural forms.
- **Gift copy speaks in the sender's voice** through `{self} {you} {we} {nha}`, interpolated from `gifts.pronoun_*` and `tone`. App chrome always uses "bạn".
- **The recipient sees the gift's locale**, not their browser's.
- **Dates:** `Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })`. `unlock_at` is entered as "giờ Việt Nam" and stored in UTC.
- **Text handling:**
  - Every input is NFC-normalised client-side and again server-side (zod `.transform`).
  - Grapheme-counted limits use `Intl.Segmenter('vi')`, with the regex fallback.
  - No `keydown` filtering (Telex/VNI IME), and validation runs only on `input`/`compositionend`.
  - Mojibake (TCVN3/VNI) is detected and warned about, never converted silently (`vietnam.md` §4.2).
- **Typography is locale-safe by construction.** `font-synthesis: none` is set on script/display faces, line-height comes from tokens, and stacked-mark padding is applied in `ui` primitives.

### 10.2 Security

- **Slugs:** `crypto.getRandomValues(new Uint8Array(16))` → base64url (22 chars). They are not enumerable, and there are no listing endpoints.
- **Passcodes** are low-entropy (4–8 chars), so **rate limiting is the real defence, not the hash**. That is why the per-slug daily cap exists. Hints are public by design.
- **Locked content is withheld on the server.** It is never sent encrypted-but-present in JS.
- **CSP:**
  - `default-src 'self'`
  - `img-src` self + the Supabase storage host + `data:`/`blob:`
  - `media-src` the same plus `blob:`
  - `frame-src` youtube-nocookie.com and open.spotify.com
  - `connect-src` self + Supabase
  - `script-src` self + nonce (Next's built-in nonce support)
  - YouTube's IFrame API script also needs `https://www.youtube.com` in `script-src`
- **Other headers:** `Permissions-Policy: camera=(self), microphone=(self)`. Booth and creator routes get `Cross-Origin-Opener-Policy: same-origin`; COEP is not needed, since nothing uses SharedArrayBuffer.
- **Payments:** IPN handlers verify the provider signature, are idempotent on `provider_ref`, never trust `returnUrl`, and expire orders after 15 min (`vietnam.md` §5.3).
- **Abuse:** gifts can host arbitrary photos and text behind an unguessable link.
  - A "Báo cáo" link on every gift leads to a moderation queue.
  - Reported gifts can be disabled.
  - **Automated CSAM hash matching is not available out of the box** on Supabase or Vercel. Evaluate Cloudflare's CSAM Scanning Tool (requires serving media through Cloudflare) or a vendor before public launch. This is a real gap, not a footnote.

### 10.3 Privacy (product B)

- All capture, compositing and encoding run on the device. Lint enforces it (§2), and a Playwright test asserts that **zero network requests carry image bytes** during a full booth session.
- Camera tracks stop when not needed, and no audio is captured.
- Drafts stay in memory. The optional "Giữ ảnh tạm" stores them in IndexedDB with a 24 h purge.

### 10.4 Privacy (product A)

- EXIF is stripped twice (client and server).
- Separate unticked consent boxes for photos, voice and marketing, logged in `consents` with the policy version.
- 16+ age gate at account creation.
- 90-day default expiry.
- The recipient's "Gỡ ảnh của tôi" request goes to the owner and the moderation queue.
- No face recognition or voice prints. The optional `FaceDetector` crop hint runs on the device and is never persisted.

### 10.5 Legal items needing counsel

- The PDP Law 91/2025/QH15 obligations (impact-assessment and cross-border dossiers, since data sits in Singapore).
- Whether Decree 53 data localisation applies to the operating entity. If it does, the architecture changes: DB and Storage move to a VN cloud and Supabase becomes self-hosted or is replaced, which is a large change.
- E-invoicing for premium themes.
- Gateway onboarding needs a business licence. Payments therefore launch with VietQR first (`vietnam.md` §5.3).

### 10.6 Auth

- **Senders:** Supabase **anonymous sign-in** creates a draft with zero friction. They upgrade to Google or email OTP when publishing (the anon user is linked, so drafts are kept).
- **Zalo login** is the most-requested local option but is **not a built-in Supabase provider**. It needs a custom OAuth exchange in a route handler and account linking. Post-launch.
- **SMS OTP is skipped:** VN SMS needs a registered brandname and is expensive.
- **Recipients never authenticate.**

---

## 11. Cost (monthly, USD, list prices as understood in late 2026; verify on the pricing pages)

| Scale | Vercel | Supabase | Other | Total |
|---|---|---|---|---|
| Build/beta (<1k gifts/mo) | Hobby is non-commercial, so **Pro $20/seat** | Free tier (pauses after inactivity, so Pro $25 at launch) | Domain (.vn ~$25–40/yr) | **~$45** |
| 10k gifts/mo, ~3 opens each | Pro $20: functions are light; static assets ~1.5 MB × 30k opens ≈ 45 GB, within the included transfer | Pro $25 (8 GB DB, 100 GB storage). Storage ≈ 10k × ~3.5 MB × 3 months retained ≈ 105 GB (≈ +$1). Media egress ≈ 30k × ~3 MB ≈ 90 GB, near the included quota | Sentry free/dev | **~$50–70** |
| 100k gifts/mo | Pro + transfer overage (~450 GB static: watch regional pricing for `sin1`) ≈ $20–80 | Pro + ~1 TB storage (~$20) + ~900 GB egress (cached egress is billed below uncached: put media behind the Smart CDN) ≈ $60–120 | Possibly a VN CDN for media | **~$150–300** |

**Not in the table, and larger than all of the above:**
- **Original illustration.** Five themes × the `visual.md` §6.3 asset list (~300 painted items), plus a mascot and 5 print skins. Rough range $4k–15k depending on the illustrator; get quotes.
- Payment gateway fees (~1–3%; confirm per provider).
- Legal review for the PDP dossiers.
- Two to three test phones (~$300).

Bandwidth is the main variable cost. Client-side resizing keeps media small (1080 px WebP ≈ 150–250 KB), so it stays cheap. If uploads are not capped, cost and abuse both grow, which is why there is a hard cap of 12 photos and 60 s of voice.

---

## 12. Delivery plan

Product B ships first. It has no backend, validates the motion system, fx and the in-app browser ladder on real devices, and creates the "Gửi vào thiệp" bridge into A.

| Week (solo) | Small team (2 eng + 1 designer + illustrator) | Deliverable |
|---|---|---|
| 1 | 1 | **Spikes on real devices:** Canvas bloom with 24 sprites at DPR 1; Motion vs GSAP seeked timeline; `getUserMedia` inside Zalo/Messenger on Android and iOS; rVFC frame grab vs `takePhoto`; WebCodecs H.264 at 720×1280 on the low tier; OG preview in a Zalo chat. Kill-or-keep decision on each |
| 2–4 | 2–3 | **Booth MVP (B):** permission UX, countdown, flash, capture, review/retake, 1×4 + Polaroid layouts, 2 frame skins, PNG export, share/save, in-app ladder, reduced motion. Tokens and `fx` package, tier probe |
| 5–6 | 4 | **Gift backbone:** Supabase schema + RLS, anon auth, creator steps 1–5 + 9–10, uploads with finalize, publish, slug, `/open` gate, OG at publish |
| 7–9 | 5–6 | **Envelope mechanic (C1)** + reading spine: letter modal (C4), polaroids + lightbox (C6), drawer with songs/voice (C5), finale (C7), end card; locked scene + passcode; preview mode |
| 10–11 | 7 | Box mechanic (C2), booth gift mechanic (C3) with server-composited strips |
| 12–13 | 8 | GIF + MP4 boomerang, stickers/text/date/filters in B; "Gửi vào thiệp" |
| 14–15 | 9 | VietQR payments (+ one wallet if a business licence exists), consent + deletion flows, a11y audit, perf pass on the device matrix, Sentry |
| 16 | 10 | Closed beta through Zalo groups. RUM-driven tier tuning |
| Later | — | Lyric chapter (C8), notebook mechanic, Rive objects, Zalo login, seasonal theme drops (Tết, 20/10) |

The honest critical path is **art, not code**. The envelope theme's flowers, envelope and wall tiles must arrive by solo week 6. Commission in week 1 and build with grey-box placeholders until then. A solo developer should budget ~16 weeks plus 25% slack.

---

## 13. Risks and weaknesses (ranked)

| # | Risk | Likelihood / impact | Mitigation |
|---|---|---|---|
| 1 | **Camera is unavailable in the webviews where most links are opened** (Zalo, Messenger). Product B's best experience requires leaving the app, and many users won't | High / high for B | File-capture fallback with a post-capture "develop" animation; open-in-browser sheet; measure the funnel. A native wrapper (Capacitor) for B is a possible phase-2 hedge |
| 2 | **Low-end performance of the spectacles (bloom, finale)** on real 3 GB phones, especially inside webviews (often older Chromium) | Medium / high | Measured budgets, runtime probe, pre-rendered wall tiles, lite mechanic, remote kill-switch, a week-1 spike on hardware |
| 3 | **Audio:** autoplay is blocked; **YouTube on iOS often refuses programmatic `playVideo()` with sound** unless the user taps inside the iframe; webviews pause media on background; some VN label MVs disable embedding (errors 101/150) | High / medium | The main song card is the tap target on iOS; embed check at creation; our own royalty-free loop as the default bed; reels bound to real state |
| 4 | **Art dependency and IP drift**: the feel depends on painted assets the team does not have yet. Under time pressure there's a temptation to trace references | High / high | Commission week 1; provenance CI gate; grey-box first |
| 5 | **Save/share from webviews** (blob download fails, video can't be long-pressed) | High / medium | data: URL images, explicit "mở bằng trình duyệt" for video, optional temporary link (consented) |
| 6 | **Legal: data localisation / PDP dossiers** may force VN hosting, which invalidates Supabase/Vercel for storage | Low–medium / very high | Get counsel before launch; keep the data layer behind `packages/gift-schema` + route handlers so it can be swapped |
| 7 | **Abuse and CSAM** on unguessable private links; no built-in scanning | Medium / very high | Reporting + takedown from day 1; a scanning vendor before public launch; upload caps |
| 8 | **Zalo/Messenger OG quirks** (caching, crawler timeouts, no preview) | Medium / medium | Pre-rendered OG, `?v=` versioning, real-chat tests |
| 9 | **iOS Safari gaps:** OffscreenCanvas/WebCodecs behaviour by version, memory kills on large canvases, PWA camera re-prompts in standalone mode | Medium / medium | Main-thread fallbacks, small canvases, feature tests; don't push "install" on iOS |
| 10 | **Two animation libraries** (Motion + optional GSAP), and the **GSAP licence** (free, but its terms restrict use in tools that compete with Webflow; a gift-page builder is probably fine, but read it) | Low / medium | GSAP stays optional and isolated in one chapter; drop it if the spike shows Motion seeking is enough |
| 11 | **Next.js churn and overhead** for a client-heavy app | Medium / low | Framework-agnostic packages; the Vite fallback is ~1 week |
| 12 | **Singapore latency during submarine cable faults** | Medium / medium | Immutable CDN assets, the first act playable from cache, the lite mechanic after 8 s |
| 13 | **Supabase + Vercel lock-in and pricing changes** | Low / medium | Standard Postgres + S3-compatible storage; no Supabase-only features in the critical path except RLS and Auth |
| 14 | **Web vs native ceiling:** no brightness control for the flash, no iOS haptics, no push for "your gift was opened" without an installed PWA, lower camera quality than native booth apps | Certain / medium | Accept for v1. The no-install recipient experience is the point; reconsider native for B only |

**Where this proposal disagrees with the specialist docs, and why:**
- **Rive** (`visual.md` §6.4): deferred because of the bundle budget.
- **WebGL LUT for export** (`ux.md` §5.7): replaced with a CPU LUT for consistency.
- **`ImageCapture.takePhoto()` as the default grab** (`ux.md` §5.2): replaced with a rVFC frame grab because of preview stalls.
- **The pre-rendered alpha-video bloom for the low tier** (motion.md §5.2): rejected for webview reliability.
- **Boomerang frames** (`ux.md` §5.8): captured downscaled to avoid the ~295 MB memory blow-up.

Each of these is a reversible engineering call that the week-1 spike should confirm on hardware.
