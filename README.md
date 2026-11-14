# Quà tặng — starter kit

A runnable starter for two Vietnamese products, built on one motion system:

- **A. Digital gift card** ("gửi người thương"): a sender builds a gift in the creator. The recipient
  opens a link and plays through a reveal: envelope or sweet box, letter with typewriter, polaroids,
  lightbox, extras drawer, finale and end card.
- **B. Self-photobooth**: camera, 3-2-1 countdown, 4 captures, review and retake, print and toss,
  then a 600×1800 PNG strip saved on the device. Photos never leave the phone.

The spec is **[`docs/FRAMEWORK.md`](docs/FRAMEWORK.md)**. The per-video evidence it cites is in
[`docs/reference-analysis/`](docs/reference-analysis/). The reference videos are a *style* reference
only: all art here is original, procedural placeholder art (SVG, CSS and Canvas) in the token palette.
There are no third-party brands or characters.

## Quick start

```bash
npm ci                 # Node ≥ 22.12
npm run dev            # http://localhost:5173
```

| Route | What |
|---|---|
| `#/` | Landing: make a gift, open the photobooth, or try the sample gift |
| `#/create` | Creator: mechanic, theme, people/pronouns, photos, letter, song, preview, link |
| `#/g/<encoded>` | Recipient player. The gift is inside the hash, so no server is needed |
| `#/booth` | Self-photobooth (use HTTPS or localhost for camera access) |
| `#/lab`, `#/lab/<id>` | Gallery of every primitive, fx emitter, choreography and UI part, with Replay, ×3 speed and a reduced-motion toggle |

## Checks

```bash
npm run typecheck      # tsc --noEmit (strict, noUncheckedIndexedAccess)
npm run build          # vite build → dist/
npm test               # vitest unit tests (src/**/*.test.ts)
npm run lint           # module boundaries (§7.2): token JSON only via tokens.ts, React-free layers, no network in booth
npm run e2e            # Playwright (preinstalled) against vite preview; all e2e/*.spec.mjs
npm run e2e -- gift    # only specs whose file name contains "gift"
E2E_BUILD=1 npm run e2e  # rebuild first (otherwise an existing dist/ is reused)
```

`e2e/run.mjs` is a zero-dependency runner over the preinstalled `playwright` package. Each run uses
Chromium with a fake camera at 390×844, on a free port. It exits non-zero if any of these happens:

- a test fails or times out;
- a page logs a console error, a console warning or an uncaught exception;
- a same-origin request fails;
- a spec does not import;
- no spec matches the filter.

Screenshots go to `test-results/e2e/`, or to the folder in `E2E_SHOTS`.

| Spec | Covers |
|---|---|
| `smoke` | landing, lab, sample gift, booth camera, reduced-motion toggle |
| `primitives` | lab coverage, typewriter timing, reels stop when paused, surfaces, reduced variants, all Director actions |
| `fx` | every emitter paints and is seek-exact, bloom coverage, `onCover` ≥ 70 %, reduced spectacles, circuit breaker |
| `booth` | full capture (real tempo), quick pace + reduced motion, in-app browser fallback; strip is exactly 600×1800 with no uploads |
| `gift` | creator → link → envelope (C1) and box (C2) to finale and end card; reduced motion |
| `lab` | every `#/lab` entry replayed in the gallery, isolated and under reduced motion; no console errors and no horizontal scroll |
| `locale` | VI ⇄ EN switch on every route: no Vietnamese UI left in English, switch mid-spectacle, camera stream and creator draft survive, choice persists across reload |
| `hardening` | deflate-bomb / over-limit / malformed gift links end on `gift-error`; no camera stream survives leaving mid-request; recipient-route JS ceiling |

## Structure

```
src/
  app/            routes (router.ts), Landing, Lab, fonts.ts, global.css
    gift/         CreateScreen, PlayerScreen, GiftPlayer, scenes/ (Envelope, Box, Finale), procedural art
    booth/        BoothScreen, camera hook, parts
  motion/core/    React-free: tokens re-export, ticker (one rAF clock), Director, reduced variants,
                  tier probe, preload, DOM actions (actions/*.ts)
  motion/react/   primitives P01–P48 as components, hooks (usePlay, useReducedMotion…), FxCanvas, catalog
  fx/             Canvas2D engine + closed-form seeded emitters (curtains, bloom, flood, confetti, hearts,
                  petals, starburst, finale extras), Director bridge
  booth/          React-free and network-free: camera, capture, strip compositor, looks, frames, lunar date
  machines/       typed reducer state machines (creator, recipient, booth), XState-shaped
  gift-schema/    GiftContentV1 types, validation (NFC), codec (hash encoding), media refs, fixtures
  i18n/           t(), pronoun/tone voice, graphemes (Intl.Segmenter), NFC, answer matching
  ui/             Pill, HintRing, CountdownStamp, ContinueObject, DrawerPull, Drawer, LetterCard,
                  Polaroid, PhotoStrip, MusicDock
  audio/          unlock-on-gesture + tiny synthesized SFX
  CONTRACTS.md    module contracts and ownership
design-tokens/    motion-tokens.json + design-tokens.json → build.py → tokens.css, motion.ts
i18n/             vi.json (generated) + tools/build_vi.py, amlich.py, font_glyph_check.py
api/README.md     backend seam (Vercel Functions + Supabase), not used by the starter
e2e/              run.mjs + *.spec.mjs
docs/             FRAMEWORK.md, reference-analysis/, fixtures/
```

## Rules the code follows

- **No raw motion or colour values in components.** Durations, easings and springs come from
  `src/motion/core/tokens.ts`, which re-exports the generated `design-tokens/motion.ts` (and the
  `proportion` / `themes` slices of `design-tokens.json`; `npm run lint` fails on any other JSON import). Colours come
  from the CSS variables in `tokens.css` (`--c-*` core colours, `--t-*` theme slots). Values that have
  no named token yet are collected in `src/motion/core/actions/params.ts` and `src/app/gift/params.ts`,
  each citing its FRAMEWORK row. They are TODO candidates for `motion-tokens.json`.
- **All copy goes through `t()`** from `i18n/vi.json` (a `vi` and an `en` table). The VI | EN switch is on every route; the choice is saved in localStorage and sets `<html lang>`. Dates go through `formatDate` / `formatLunar`. Text is NFC-normalised, and the typewriter splits
  by grapheme with `Intl.Segmenter`.
- **Fonts** come from the §3.4 verified list and load via `@fontsource` with the Vietnamese subset:
  Be Vietnam Pro, Mali, Dancing Script, Paytone One, Pangolin (hand.marker) and Playwrite VN.
- **Reduced motion**: the OS preference or the in-app toggle switches every spectacle to its §4.5
  variant. Gates still work.
- **Mobile-first** at 390×844, and it also works at desktop width.

## Regenerating tokens and copy

Never hand-edit `design-tokens/tokens.css`, `design-tokens/motion.ts` or `i18n/vi.json`.

```bash
# tokens: edit design-tokens/motion-tokens.json or design-tokens.json, then
npm run tokens         # = python3 -I design-tokens/build.py   (validates, then writes tokens.css + motion.ts)

# strings: add keys in i18n/tools/build_vi.py (each owner has a marked section), then
npm run strings        # = python3 -I i18n/tools/build_vi.py   (writes i18n/vi.json)
```

## How this maps to FRAMEWORK.md

| FRAMEWORK | Here |
|---|---|
| §3 visual system, §3.4 fonts | `design-tokens/`, `src/app/global.css`, `src/app/fonts.ts`, `src/ui/*` |
| §4.1 tokens | `design-tokens/motion-tokens.json` → `motion.ts` |
| §4.2 primitives P01–P48 | `src/motion/react/primitives/*` + Director actions `src/motion/core/actions/primitives.ts`; status in `src/motion/react/catalog.ts` (unbuilt ones are listed at the bottom of `#/lab`) |
| §4.3 choreographies C1–C13 | `choreography.*` specs (generated) played by the Director: C1/C2/C7/C13 in `src/app/gift/scenes`, C3/C12 in `src/app/booth` |
| §4.5 reduced motion | `src/motion/core/reduced.ts`, `useReducedMotion()` |
| §4.6 budgets, tiers | `src/motion/core/tier.ts`, `src/fx/engine.ts` (sprite caps, circuit breaker) |
| §5.2 creator, §5.3 recipient, §5.4 booth | `src/app/gift/CreateScreen.tsx`, `GiftPlayer.tsx`, `src/app/booth/BoothScreen.tsx` |
| §5.5 state machines | `src/machines/*`: a small typed reducer instead of XState 5 (same shape, easy to port) |
| §6 Vietnamese | `src/i18n`, `i18n/tools/*`, lunar date in `src/booth/lunar.ts` |
| §7.2 repo structure, §7.3 Director | this tree; `src/motion/core/director.ts` |
| §7.5 data model | `src/gift-schema/types.ts` (`GiftContentV1`); the server side is in `api/README.md` |

## What is stubbed or not built

- **Backend**: none. `encodeGift()` puts a deflated, base64url `GiftContentV1` in the URL hash
  (`#/g/z…`). Photos are downscaled to 640 px and capped at 6 to keep links short. The seam is
  `src/gift-schema/codec.ts` plus `api/README.md`: Supabase schema with RLS, Vercel Functions for open,
  publish and media, and head injection for OG previews.
- **Payments** (VietQR / MoMo / ZaloPay / VNPay): not built.
- **Video and GIF export** (boomerang, Ken Burns, WebCodecs MP4): not built. The booth exports a PNG strip only.
- **Not built in the gift player**: voice note, map, schedule, secret question, locked scene,
  notebook/lì xì mechanics, embedded music players. Song links open in a new tab, so the dock state
  stays truthful.
- **Not built in the booth**: other layouts, stickers, worker compositor, 3D LUTs (per-channel curves
  are used instead), flash-latency calibration.
- **Gift links are untrusted input**: `validateGift` type-checks every rendered field and enforces
  `LIMITS` (names ≤24 graphemes, letter ≤1200, ≤6 photos, http(s) song links only; the creator uses
  the same constants), the decoder stops inflating past `LIMITS.payloadBytes` (deflate-bomb guard), and
  an error boundary around the player falls back to the `gift-error` screen.
- **Not built as primitives**: P09, P11, P13, P19, P20 as components (their Director actions exist; P19 runs on the continue object),
  P24, P30, P31, P35, P40, P41, P43, P46 and P48.
- **Art**: all placeholder, procedural. Commission real art per §3.7.
- **Not set up**: Storybook, ESLint (the boundary rules run as `npm run lint`, a zero-dependency script), CI.

## Known gaps

- **Recipient JS budget (§7.7: ≤120 KB gz before the first tap) is not met.** Measured on `#/g/<fixture>`
  in the production build: **202 KB gz** (React + react-dom ≈ 54 KB, Motion's `motion/react` + `motion-dom`
  ≈ 100 KB across the shell and the Director chunk, the generated `motion.ts` with every choreography
  ≈ 15 KB, app ≈ 25 KB). The fx engine and emitters already load only on the first input. `e2e/hardening`
  guards a 210 KB ceiling so it cannot grow. Plan: `LazyMotion` + `m.*` with `domAnimation`, `animate`
  from `motion/mini` in the Director where WAAPI suffices, and splitting booth-only choreographies (C3/C12)
  out of `motion.ts` in `build.py`.
- Production builds ship **no source maps** (`SOURCEMAP=1 npm run build` to get them).
- The C12 strip feed runs the token step length (700 ms) for one full mini-strip height, ≈1.4 strip
  heights/s; the token also says 0.9 heights/s, which would need 1.1 s. FRAMEWORK's measured range
  (95-162 px/s, 400-700 ms) covers the current value; the two token numbers should be reconciled.

## Roadmap

See **FRAMEWORK §8** (M0 spikes → M1 motion kit → M2 photobooth → M3 reveal player → M4 creator +
backend → M5 sharing, exports and payments → M6 beta). This kit covers the grey-box parts of M1 to M3
and the client side of M4.
