# Reference analysis

These are the source documents behind [`../FRAMEWORK.md`](../FRAMEWORK.md). Five reference videos were analysed frame by frame at 30 fps by analysts and adversarial verifiers, then cross-checked by an auditor. Evidence is cited as `vN fA-B` (video N, frames A to B at 30 fps).

| File | Contents |
|---|---|
| `v1.md` | Photo-booth gift: coin, stamp countdown, flash ticks, strip print + toss, letter modal, flower wipe |
| `v2a.md`, `v2b.md` | Lyric video (152 BPM): script lyrics, fly-through exits, notepad typewriter, rising parallax; picnic world camera, POV polaroid close-up |
| `v3.md` | Storybook birthday gift filmed on an iPad: time-anchored typewriter, crossfades, idle wobble. It contains a **licensed mascot: never reuse it** |
| `v4.md` | Sweet box: gravity flower curtain, ribbon pull, lid flip, bite taps, letter spread, drawer, lightbox, flower-flood finale |
| `v5.md` | Envelope: wobble, paper-dip swap, bloom burst, curtain drop, cassette songs page, popover drawer |
| `audit.md` | Source-quality ledger, contradictions resolved into adopted values, top-20 signature details, top-10 reference bugs |
| `motion.md` | Motion system: tokens, primitives P01-P43 with Motion + CSS snippets, choreographies C1-C8, global rules |
| `visual.md` | Colour, themes, typography, textures, component specs, illustration brief |
| `ux.md` | Interaction grammar, mobile adaptation, creator / recipient / booth flows (XState code), sound + haptics, privacy |
| `vietnam.md` | Occasions, motifs, microcopy register, Vietnamese typography, in-app browsers, payments, PDP law, hosting |
| `arch-web-react-motion.md` | Winning architecture proposal (24.5 vs 19 vs 14.5 in the judge review) |

**Precedence.** Where these documents disagree with `FRAMEWORK.md`, the framework wins. The overrides are listed in FRAMEWORK §10.2 ("Errata"). The main ones:
- Playpen Sans is not glyph-verified.
- Prompts mount on `run.finished`, not on a timer.
- Ambient motion is by mode.
- The gift-booth flash cadence is slower than the reference.
- No Rive or Lottie in v1.
- The app is a Vite SPA, not Next.js.

**IP rule.** These files describe reference products only to extract motion feel and visual language. Do not copy their art, names, strings or layouts, and never add reference frames to this repository.
