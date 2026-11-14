# Starter-kit contracts

The scaffold froze these interfaces so four builders can work in parallel. Spec: `docs/FRAMEWORK.md`
(§3 visual, §4 motion, §5 experience, §6 Vietnamese, §7 architecture).

## Ownership rule

**Each builder edits only files it owns.** It may also add:

- new files inside its own folders;
- new `*.lab.tsx` files anywhere in its own folders (they are collected automatically);
- its own e2e specs, named `e2e/<owner>*.spec.mjs` (for example `e2e/booth-capture.spec.mjs`);
- strings in **its own section** of `i18n/tools/build_vi.py`. Each owner has a marked section `# ---------- starter kit: <owner> builder adds keys here`. After editing, run `npm run strings`. Never hand-edit `i18n/vi.json`.

Do not change a signature listed here. If a contract must change, ask the lead. Never hand-edit
`design-tokens/motion.ts`, `tokens.css` or `vi.json`: they are generated. To change a token, edit the
JSON source and run `npm run tokens`. To change a string, edit `build_vi.py` and run `npm run strings`.

The owners are `scaffold` (frozen, lead only), `primitives`, `fx`, `booth` and `gift`.

## Hard rules (all owners)

- **IP.** The reference videos are a style reference only. All art is original and procedural (SVG, CSS or Canvas) in the token palette. Never use reference names, brands or characters.
- **No raw values in components.** No ms, bezier or hex literals. Read motion values from `src/motion/core/tokens.ts`: `duration`, `easing`, `spring`, `stagger`, `bez()`, `sec()`, `springT()`, `cssVar`. Read colours as CSS variables (`var(--t-*)` theme slots, `var(--c-*)` core colours).
- **Copy.** Every UI string comes from `t(key, vars?, voice?)` (`src/i18n`). Text is NFC. Split text into graphemes with `graphemes()`.
- **Fonts.** Use only the faces loaded in `src/app/fonts.ts`: Be Vietnam Pro 400/500/600, Mali 400/500, Dancing Script 700, Paytone One 400 and Playwrite VN 400. Reference them through `--font-*` / `--type-*` variables. To add a face, it must be on the §3.4 verified list; ask the lead.
- **Reduced motion.** Honour `ctx.reduced` / `useReducedMotion()` with the §4.5 variants. Every gate must still work.
- **Motion imports.** Import `animate` from `'motion'` only inside `src/motion/**` and `src/fx/**`. Elsewhere, use `motion/react` components and hooks.
- **React-free folders.** `src/motion/core`, `src/fx`, `src/booth`, `src/gift-schema` and `src/i18n` must not import React. React code under `src/motion/` lives only in `src/motion/react/`.
- **Network.** `src/booth/**` makes no network calls.
- **Layout.** Mobile-first at 390×844. Desktop must still work. No horizontal scroll.

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` / `npm run preview` | Production build, then preview on port 4173 |
| `npm run typecheck` | `tsc --noEmit` (TypeScript 7, strict + `noUncheckedIndexedAccess`) |
| `npm test` | Vitest unit tests (`src/**/*.test.ts(x)`, node environment) |
| `npm run e2e [-- filter…]` | `node e2e/run.mjs`: builds if `dist/` is missing (`E2E_BUILD=1` forces it), starts preview on a free port and runs `e2e/*.spec.mjs` in Chromium (fake camera, 390×844). Exits non-zero on any failure, console error/warning, uncaught exception or failed same-origin request; `t.allowConsole(re)` allows an expected message |
| `npm run tokens` / `npm run strings` | Regenerate the tokens / `vi.json` |

Path aliases (tsconfig + vite): `@/…` → `src/`, `@tokens/…` → `design-tokens/`, `@strings/…` → `i18n/`.

---

## scaffold (frozen)

### `src/motion/core` (React-free)

- **`tokens.ts`.** `export * from '@tokens/motion'` (`duration`, `easing`, `spring`, `stagger`, `ambient`, `primitive`, `flowerCurtain`, `flash`, `booth`, `budgets`, `reducedMotion`, `choreography`, `Spec`, `Step`, `ActionId`, `Tier`, `s`, `sp`, `tw`, `typewriterPlan`, `initialTier`, `probeTier`, …). It adds these helpers:
  - `bez(name): [n, n, n, n]`
  - `sec(DurationName | ms): number`
  - `springT(name): { type: 'spring', stiffness, damping, mass }`
  - `cssVar.{d, e, spring, springDur, c}`
- **`ticker.ts`.** `ticker: Ticker` is the only rAF clock.
  - `add(fn: (now, dt) => void, priority = 0): () => void`
  - `now(): number`
  - `deltas: readonly number[]`
  - The ticker sleeps when nothing is subscribed. Priorities: Director 0, fx draw 100.
- **`types.ts`.** The Director contracts:
  ```ts
  interface StepControl { seek?(localMs); pause?(); resume?(); setSpeed?(x); finish?(); revert?(); cancel?(); readonly persistent?: boolean }
  interface StepContext { step; spec; el: Element | null; targetName; reduced; tier; timeScale; seed; data }
  type StepFn = (ctx: StepContext) => StepControl | void
  type TargetRef = Element | { current: Element | null } | StepFn | { el?, run?: StepFn } | null | undefined
  type TargetMap = Record<string, TargetRef>          // "scrim+letter" resolves both names
  interface DomAnimationPlan { el?: Element; keyframes: DOMKeyframesDefinition; transition: AnimationOptions }
  type DomActionImpl = (el, ctx) => DomAnimationPlan | DomAnimationPlan[] | StepControl | void
  type ActionImplMap = Partial<Record<ActionId, DomActionImpl>>
  interface FxBridge { handles(action, ctx): boolean; run(ctx): StepControl }
  interface PlayOptions { timeScale?; reduced?; tier?; seed?; data?; reducedSpec?; preload?; preloadTimeoutMs?; paused?; circuitBreaker?; onStep? }
  interface Run { finished: Promise<void>; started; skip(); pause(); resume(); seek(ms); seekTo(stepName); setTimeScale(x); cancel(); time; duration; spec; state }
  interface Director { play(spec, refs, opts?): Run; timeScale; degradeNext; setFx(b); setAssetLoader(fn); registerActions(map) }
  ```
- **`director.ts`.** `createDirector({ ticker?, fx? })` creates a Director. `director` is the app-wide instance; `FxCanvas` wires fx into it.
  - **Step routing.** For each target part, in order:
    1. A `StepFn` / binding `run`. If it returns a control, that control is the step.
    2. `fx.handles(action)`. If true, the step runs on the canvas, and the Director calls `seek(local)` every tick.
    3. The DOM action registry. The step runs through `animate()` and is re-seeked only on drift greater than 1 frame.
    4. If none of these applies, nothing runs (dev warning).
  - **Reduced motion.** Reduced runs use `opts.reducedSpec ?? reduceSpec(spec)`.
  - **Circuit breaker.** Three or more dropped frames within 50 ms during a spectacle calls `skip()` and sets `degradeNext`.
  - **Gesture clocks.** A `clock: 'gesture'` spec does not advance on the ticker; drive it with `run.seek()`.
- **`reduced.ts`.**
  - `isReducedMotion()`: the OS preference OR the in-app toggle.
  - `prefersReducedMotion()`, `getReducedOverride()`, `setReducedOverride(v | null)`, `subscribeReducedMotion(fn)`.
  - `reduceSpec(spec, forceMs?)`, `reducedVariant(spec)`.
  - `CANVAS_ACTIONS`, `AMBIENT_ACTIONS` and `STATE_ACTIONS` sets. Under reduced motion, canvas and ambient actions are dropped unless the step sets `params.keepReduced`.
- **`tier.ts`.** `getTier()`, `setTier(t, persist?)` and `startTierProbe(frames = 60)`. Query `?tier=low|mid|high` forces a tier.
- **`preload.ts`.** `registerAssetResolver(prefix, (name) => Promise)`, `preloadAssets(ids)` and `decodeImage(src)`. The Director preloads `spec.assets` before t0, with a timeout.
- **`hash.ts`.** `hashSeed(string | number): number` (FNV-1a).
- **`actions/index.ts`.** Collects `export const actions: ActionImplMap` from every `src/motion/core/actions/*.ts`. `base.ts` (scaffold) provides `fade`, `tween`, `hardCut`, `remove`, `mount` and `unmount`, plus the helpers `stepTransition(ctx)`, `paramsToKeyframes(params, reduced)`, `CUT_EVENT` and `fallbackAction`.
  - Zero-ms state actions dispatch `director:cut` (`CutEventDetail { name, action, params }`) on the element.
  - `hardCut` applies `params.text`, `params.inert` and `params.opacity`.

### `src/motion/react` (hooks.ts, FxCanvas.tsx and index.ts are owned by scaffold)

- `useReducedMotion(): boolean`
- `useReducedMotionToggle(): [boolean | null, set]`
- `useTicker(fn, active = true, priority = 0)`
- `usePlay(): (spec, refs, opts & { slot? }) => Run`. Runs are cancelled on unmount, and a new run with the same slot replaces the old one.
- `useDirectorCut(ref, (detail) => void)`
- `<FxCanvas engine? />`. Mounted once in `App`. `useFx(): FxEngine`.

### `src/fx` (engine core is owned by scaffold; emitters, shapes and bridge are owned by fx)

- **`types.ts`:**
  ```ts
  interface Sprite { x; y; rot; scale; alpha; size; shape: ShapeId; color: string /* '--c-…' var or colour */ }
  interface EmitterInit<P> { seed; rng: Rng; params: P; view: { w, h, dpr }; origin: { x, y }; tier; reduced; count; durMs? }
  interface EmitterInstance { count; durationMs; sprite(i, t, out: Sprite): boolean; before?(g, t, view); after?(g, t, view) }
  interface EmitterDef<P> { id: EmitterId; stub?: boolean; count(tier, params): number; create(init): EmitterInstance }
  interface EmitOptions { seed?; params?; origin?: { x, y } | DOMRect | Element | null; count?; tier?; reduced?; durMs?; autoplay? = true; speed? }
  interface FxHandle { id; durationMs; time; finished; seek(ms); pause(); resume(); setSpeed(x); stop() }
  interface FxEngine { attach(canvas): () => void; emit(id, opts?): FxHandle; clear(); setThemeElement(el); view; activeCount }
  ```
- **`engine.ts`.** `createFxEngine({ ticker? })` creates an engine; `fx` is the app-wide one. The engine draws on ticker priority 100 at DPR `budgets.canvasDpr[tier]` and caches procedural bitmaps per shape × colour × size.
- **`rng.ts`.** `mulberry32(seed): Rng`, `rand01(seed, i, salt)`, `range`, `pick`, `hashSeed`.
- **`registry.ts`.** `getEmitter(id)`, `registerEmitter(def)` and `listEmitters()`. It collects `export const emitter` / `emitters` from every `src/fx/emitters/*.ts`.

### `src/i18n` (React-free)

- `t(key: StringKey, vars?: Record<string, string | number>, voice?: Voice): string`
- `Voice` is `{ pronouns?: PronounSetId; self?; you?; we?; tone?: 'north' | 'south' | 'nhe' | 'nha'; recipientName? }`. It resolves `{self}`, `{Self}`, `{you}`, `{You}`, `{we}`, `{We}` and `{nha}`. For a gift, build it from `gift.names`: `{ self, you, tone, recipientName: to }`.
- Locale store: `getLocale()`, `setLocale('vi' | 'en', { persist? })` (sets `<html lang>`, notifies), `subscribeLocale(fn): () => void`, `detectLocale()` (saved choice in localStorage `app:locale:v1` → browser language `vi*` → `'vi'`), `initLocale()` (called once in `main.tsx`), `LOCALES`, `localeTag()`. React components read it with `useLocale()` (`src/app/useLocale.ts`, useSyncExternalStore); `App` subscribes once so the whole tree re-renders text in place on a switch. The VI | EN switch is `src/app/LocaleToggle.tsx` (in each screen's header; `floating` in full-bleed scenes such as the gift player).
- `tIn(locale, key, vars?, voice?)`: t() in an explicit locale. `hasKey(k)`, `voiceWords(voice)`
- Locale-aware formats: `formatDate(d, m, y)` (vi `13/11/2026`, en `13 Nov 2026`), `formatIsoDate('YYYY-MM-DD')`, `formatLunar(lunar)` (vi `5/10 âm lịch`, en `Lunar day 5, month 10`). Never format visible dates by hand.
- `nfc(s)`, `graphemes(s): string[]` (`Intl.Segmenter('vi')`), `graphemeCount(s)`, `words(s): { text, space }[]`, `upperVi(s)` (caps in the active locale)
- `normaliseAnswer(s)`, `stripDiacritics(s)`, `answerMatches(input, expected)`

### `src/gift-schema` (React-free)

- **Types:** `GiftContentV1 { v?, id?, mechanic, theme, locale, names: { from, to, self, you, tone: 'nhe' | 'nha' }, pages: GiftPage[], mediaRefs, strips?, finale: { enabled }, unlockAt?, secret? }`.
- **Page kinds:** `letter`, `memories`, `songs`, `voice`, `map`, `treats`, `notebook`, `days`. See `types.ts`.
- **Validation:** `validateGift(x): Result<GiftContentV1>` NFC-normalises its input. Also `migrate(x)` and `LIMITS`.
- **Codec:**
  - `encodeGift(g): Promise<string>` returns `'z' + base64url(deflate-raw)`.
  - `encodeGiftSync(g)` returns `'j' + base64url(json)`.
  - `decodeGift(s)` and `loadGift(param)` return `Promise<Result<GiftContentV1>>`.
  - `giftUrl(g)`
- **Media:** `resolveMedia(ref)` handles `'ph:<n>'` (procedural placeholder photo) and `data:` URLs. Also `placeholderPhoto(n, w?, h?)`.
- **Fixtures:** `fixtureEnvelopeMin` (from `docs/fixtures`) and `sampleGift` (the fixture plus 3 placeholder photos and a `days` page); their English twins `fixtureEnvelopeMinEn` / `sampleGiftEn`; `sampleGiftFor(locale)` picks one for the landing link. Sender-written content is never translated at runtime.
- **Backend seam:** see `api/README.md`. Only `codec.ts` changes when the backend arrives.

### `src/machines`

- **`core.ts`.** A typed reducer machine shaped like XState: `defineMachine({ id, initial, context, states: { s: { on: { EV: { target?, guard?, assign? } | [...] }, entry?, final?, tags? } }, on? })`, plus `initialSnapshot(m, ctx?)`, `transition(m, snap, ev)` and `hasTag(m, state, tag)`.
- **`useMachine.ts`.** `useMachine(m, ctx?) → [snapshot, send]`.
- **Stub machines.** Their state and event unions are starting points that the owner may extend:
  - `recipient.ts` (owner gift)
  - `creator.ts` (owner gift)
  - `booth.ts` (owner booth)

### `src/app`

- **`router.ts`.** `Route` is one of `landing`, `create`, `gift { param }`, `booth`, `lab { entry? }` or `notFound`. Exports `parseRoute(hash)`, `hrefFor(route)`, `navigate(route | href, { replace? })` and `useRoute()`.
- **`lab/registry.ts`.** `LabEntry { id, title, group: 'core' | 'primitive' | 'choreography' | 'fx' | 'ui' | 'gift' | 'booth', owner, notes?, height?, theme?, render(ctx: { replay, reduced, timeScale }) }`. To add entries, export them as the default of any `src/**/*.lab.tsx`. The stage remounts on Replay. `#/lab/<id>` shows one entry alone; e2e should use `data-testid="lab-<id>"` and `replay-<id>`.
- **`fonts.ts`.** `registerFonts()` and `fontsReady(faces?, timeoutMs?)` (gate a reveal on the scene's critical faces).
- `App.tsx`, `routes/Landing.tsx`, `routes/Lab.tsx`, `routes/NotFound.tsx`, `ReducedMotionToggle.tsx`, `global.css`, `main.tsx`.

---

## primitives

**Files:**
- `src/motion/react/primitives/{pops,surfaces,text,gestures,ambient,physical}.tsx`, `types.ts` and `_stub.tsx` (delete stub usages as you go)
- `src/motion/react/catalog.ts`
- new `src/motion/core/actions/<name>.ts` (Director DOM actions)
- `src/ui/{Pill,HintRing,CountdownStamp}.{tsx,css}`

**Deliverables.** Implement each MVP primitive twice:

1. **As a React component or hook** with the signatures already exported. Shared props:
   - `OneShotProps { play?, playKey?, onDone? }`
   - `LoopProps { active? }`
   - `BaseProps { children?, className?, style? }`

   The primitives:

   | Group | Exports |
   |---|---|
   | Pops | `StampPop`, `StickerPop`, `LetterPop`, `PolaroidDeal { index, tiltDeg, stack? }` |
   | Surfaces | `DrawerSlide { open, variant: 'sheet' \| 'rail' \| 'dock', onOpened?, onClosed? }`, `PageCrossfade { pageKey }`, `PaperDipCrossfade { state, render, onDone? }`, `LidFlip3D { open, lid, box, onDone? }`, `SharedLightbox { open, layoutId, onClose }`, `ContentSwapInShell { contentKey }` |
   | Text | `TextBlurIn { variant? }`, `TooltipRise { show }`, `TimedPrompt { show }`, `Typewriter { text, msPer?, unit?, onCue?, as? }` |
   | Gestures | `useTapWobble(ref) → () => Promise<void>`, `usePressSquash(kind) → pointer handlers`, `HoverGrow { amount? }`, `BiteTap { bites, remaining, onBite, ariaLabel, note? }` |
   | Ambient | `IdleFloat`, `TrapezoidSway`, `Pendulum { impulse? }`, `HintPulse { tone?, size? }`, `ReelSpin { playing, reverse? }`, `IdleWobble` |
   | Physical | `WhipOff`, `CurtainDrop`, `CameraFlash { fire, kind?, scope?, onPeak?, onDone? }`, `SlotPrint { durationMs? }`, `Toss { from, arcMs?, restDeg }`, `TokenDrop`, `HardCut { value }` (done) |

2. **As a Director action** `actions: ActionImplMap` for the matching `ActionId` (`stampPop`, `stickerPop`, `letterPop`, `polaroidDeal`, `drawerSlide`, `textBlurIn`, `tooltipRise`, `timedPrompt`, `whipOff`, `curtainDrop`, `tapWobble`, `pressSquash`, `chromeNudge`, `activeSwap`, `cameraFlash`, `idleFloat`, `trapezoidSway`, `pendulum`, `hintRing`, `reelSpin`, `pageCrossfade`, `paperDipCrossfade`, `lidFlip3D`, `layoutMove`, `sharedLightbox`, `slotPrint`, `toss`, `typewriter`, `idleWobble`, `contentSwapInShell`, `tokenDrop`), so `director.play(choreography.Cx, refs)` works.

Add one `*.lab.tsx` entry per primitive, with id `P01` … `P47`.

**UI:**
- `Pill { variant: 'status' | 'hint' | 'link' | 'action', children, onClick?, sparkle?, ariaLabel?, className?, disabled? }`
- `HintRing { active, tone?: 'onArt' | 'onCream', size?, className? }`
- `CountdownStamp { value: number | 'smile' | null, size?: 'md' | 'lg', smileText?, className? }`

## fx

**Files:**
- `src/fx/emitters/*.ts`. These are stubs flagged `stub: true` until implemented; the bridge declines stubs. Follow `example.ts` (owned by scaffold) for the pattern.
- `src/fx/shapes.ts` and `src/fx/bridge.ts`
- `src/motion/react/primitives/flowers.tsx`
- the P21, P22, P38 and P39 rows of `catalog.ts`. Tell primitives the status, or leave it to the lead.

The engine internals in `engine.ts` may be tuned as long as the `FxEngine` signature holds.

**Emitter ids:** `curtainReveal`, `curtainWipe`, `curtainDrop`, `bloom`, `flood`, `confetti`, `hearts`, `petals`. Add `echoTrail`, `rays` and `burstMound` for C7 `fxEmit`.

**Bridge mapping (`emitterFor`):**

| Action | Emitter |
|---|---|
| `bloomBurst` | `bloom` |
| `flowerCurtain` (`params.mode`) | `reveal` → `curtainReveal`, `wipe` → `curtainWipe`, `flood` → `flood`, `bloom` → `bloom` |
| `confettiFountain` | `confetti` |
| `heartBurst` | `hearts` |
| `petalField` | `petals` |
| `fxEmit` | `params.emitter` |

**Rules.** Sprites are pure functions `f(i, t, seed)`. Counts come from `budgets.*[tier]`. Colours are `FLOWER_COLORS`, `HEART_COLORS` and `CONFETTI_COLORS` (CSS variable names). Particles are off under reduced motion.

**React wrappers:**
- `FlowerCurtain { mode, go, playKey?, seed?, onCover?, onDone? }`. `onCover` must fire at ≥70% cover.
- `HeartBurst` / `ConfettiFountain { go, playKey?, origin?: RefObject<Element>, count?, seed?, onDone? }`

## booth

**Files:**
- `src/booth/**` (React-free, no network): `camera.ts` (`openCamera(opts) → CameraSession`, `CameraError.kind`), `capture.ts` (`grabFrame(video, mirrored?) → Shot`, `composeStrip(shots, opts) → Blob`, `STRIP`)
- `src/app/booth/**`: `BoothScreen.tsx` is the `#/booth` route's default export.
- `src/machines/booth.ts`
- `src/ui/PhotoStrip.{tsx,css}`: `PhotoStrip { photos, date?, caption?, fan?: 0 | 1 | 2, width?, onOpen?, className? }`, `STRIP_FAN`
- e2e `e2e/booth*.spec.mjs`

**Choreographies:** `choreography.C3product` (capture), `C12review`, `C12print` and `C12export`. Use `flashReduced` under reduced motion (the timer stays functional).

## gift

**Files:**
- `src/app/gift/**`: `CreateScreen.tsx` (`#/create`) and `PlayerScreen.tsx` (`#/g/<param>`, props `{ param }`; load with `loadGift(param)`)
- `src/machines/{recipient,creator}.ts`
- `src/audio/**`
- `src/ui/{LetterCard,Polaroid,Drawer,MusicDock}.{tsx,css}`
- e2e `e2e/gift*.spec.mjs`

**UI signatures:**
- `LetterCard { eyebrow, greeting, body, signature, font?, typing?, onTypingDone?, className? }`
- `Polaroid { src, caption?, tiltDeg?, seed?, index?, width?, layoutId?, onOpen?, alt?, className? }`, plus `polaroidTilt(seed, i)` and `POLAROID_TILTS`
- `Drawer { open, onOpenChange, title, closeLabel, detent?: 'peek' | 'half' | 'full', children }`
- `MusicDock { title, tracks, current, state: PlayerState, onSelect, onToggle, labels, voiceNote? }`

**Choreographies:** `C1a`/`C1b` (envelope), `C4open`/`C4close`, `C5open`/`C5close`, `C6*`, `C7` and `C13`. Seed fx with `hashSeed(gift.id ?? JSON)`. Mount prompts on `run.finished` (P08). The creator ends by navigating to `#/g/<await encodeGift(draft)>`.
