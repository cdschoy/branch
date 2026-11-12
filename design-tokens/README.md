# Design tokens

| File | Role |
|---|---|
| `motion-tokens.json` | Source of truth for motion (v1.2.0): durations, ambient loops, easings, springs (with CSS `linear()` twins, `fromValue`, `peakFinal`, `tier`), staggers, overshoot tiers, flower-curtain modes, flash, scrims, prompt and chrome timing, primitives P44-P48, **typed choreographies** `C1a` … `C13` (`Spec {id, t0, assets, reduced, steps}` with `Step {name, at, dur, target, action, params, ease or spring, tierMin}`), booth timers, tier budgets, reduced motion |
| `design-tokens.json` | Source of truth for visuals (v1.2.0): colours, five themes, verified Vietnamese fonts, per-scene font plans, type styles, Vietnamese diacritic rules, radii, borders, shadows, proportions (photo-strip geometry) |
| `tokens.css` | **Generated.** CSS custom properties: `--c-*` colours, `--t-*` theme slots (`data-theme`), `--font-*` and `--type-*`, `--strip-*`, `--radius-*`, `--border-*`, `--shadow-*`, `--d-*` durations, `--e-*` easings, `--spring-*` with `--spring-*-dur` (bezier fallbacks where `linear()` is unsupported), `--amb-*`, `--z-*` |
| `motion.ts` | **Generated.** Typed exports: `duration`, `easing` (cubic-bezier arrays), `cssEasing()`, `spring`, `stagger`, `overshootTiers`, `primitive`, `flowerCurtain`, `flash`, `scrim`, `booth`, `budgets`, `reducedMotion`, `choreography` (`Spec` / `Step` / `ActionId`), plus helpers `s()`, `sp()`, `tw()`, `typewriterPlan()`, `beatMs()`, `initialTier()`, `probeTier()` |
| `build.py` | Validates both JSON files, then regenerates both outputs: `python3 -I design-tokens/build.py` (exit 1 on any violation). Edit the JSON, never the generated files |
| `springs.py` | Spring simulator used by `build.py`; run it alone for a table of peaks, travel %, settle times, or `springs.py K C [M] [FROM]` for one spring and its `linear()` samples |

`build.py` fails when:
- the photo-strip parts do not sum to the 600×1800 canvas, or the frames are not 4:3;
- a spring's `peakFinal` drifts from the simulation, or its visible overshoot exceeds its tier (checked on `peakFinal`, never on `overshootPctOfTravel`);
- a choreography step uses an unknown action, ease or spring, carries an inline colour, names an i18n key missing from `i18n/vi.json`, or runs a spring for a `dur` other than that spring's `settleMs`;
- a theme colour is pure `#FFFFFF`, near-black or a neutral grey (chroma under 4%);
- a type style is under the Vietnamese line-height minimum for its family class or under the 13 px floor;
- a font scene plan has more than 3 critical faces or more than 6 in total.

Rules (docs/FRAMEWORK.md §3-§4):
- Components never contain raw hex values, beziers or millisecond literals.
- Overshoot is measured as the peak in final-size units: tiers 0 / 1.5 / 4 / 6%, with a 6% ceiling.
- A step on `spring.X` lasts `spring.X.settleMs`; the CSS twin is `--spring-x` over `--spring-x-dur`.
- Distances are relative (vw, vh, % of the object). Values tagged `@1024 capture` are raw reference pixels.
- Only the 20 fonts in `font.approvedVietnamese74of74` may render user-entered text.
