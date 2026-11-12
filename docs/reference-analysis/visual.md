# Visual Design System — Vietnamese gift card (A) and self-photobooth (B)

Companion file: `design-tokens.json` (same folder). Every value here is in that file under the same name.

Sources: verified reports v1, v2a, v2b, v3, v4, v5, plus `metrics/palettes.json` and `metrics/fonts_vietnamese.txt`. Evidence is cited as `vN fA-B` (frames at 30fps) or `vN §section`. v3 colours are filmed off an iPad, so only its white-balance-corrected "true" values are used (v3 §6.1).

**IP rule.** We take the *visual language* only: painterly cut-outs over flat UI, cream and blush neutrals, plum night panels, gingham, stripes and stars. We never trace reference art, and we use no brand names ("Emma & Liam booth", "sweet box for Noah", "Songs for you", Canva, YouTube or Spotify chrome) and no licensed mascot (v3). All illustration is commissioned new (§6).

---

## 0. Five rules the references agree on

1. **Two registers.** Painted, textured illustration (gouache or watercolour cut-outs with no outline and no CSS shadow on the art), with crisp, flat, warm UI chrome floating over it (v1 §6 "Illustration", v4 §6, v5 §6: "Backgrounds and UI are flat; texture lives only in the illustrations").
2. **Never pure black, never pure white for large areas.** The darkest values are warm cocoa or plum (#3B272C, #3A2A2E, #172211), and v2b grades its blacks to at least #7F436B. Paper is always tinted cream (#FDF8F4, #FEF9F5, #FEF7E5).
3. **A night panel for media.** Every reference with music puts it on a deep plum radial panel: v1 #3B1932→#130214, v4 #49223D→#31132B→#120415, v5 #3F1D35→#110012. This is the one dark surface in the system.
4. **Forest green is the single "action" accent inside the media panel.** Play buttons use #275330 (v1, v4) or #234A30 (v5). It is the complement of the blush field, so it is used sparingly.
5. **Depth comes from z-stacking, overlap, tilt and soft warm shadows.** There is no hard black shadow and no glassmorphism blur (v1 scrim "no blur", v2a "no drop shadows", v3 "depth = overlap and z-order only").

---

## 1. Colour tokens (core)

### 1.1 Neutrals: cream, paper, kraft
| Token | Hex | Use | Evidence |
|---|---|---|---|
| `cream.50` | #FFFDF8 | highest highlight, sticker paper | v4 sticker #FEF8F7, polaroid #FEFDF9 |
| `paper.letter` | #FDF8F4 | letter paper, modal cards | v1 letter paper #FDF8F4; v4 #FEF9F5 |
| `paper.page` | #FEF7E5 | warm page column, Songs-style paper | v5 #FEF7E5 / #FDF4E5 |
| `cream.100` | #FBF6F3 | pills, status chips | v1 status pill #FBF6F3 |
| `cream.200` | #F9F8E8 | wall stripe cream, booth plaque | v1 #F9F8E8; palettes v1 "booth idle" #F8F8EB 32% |
| `cream.300` | #FCECDD | gingham cream tile | v4 #FCECDD / #FAE7D9 |
| `cream.400` | #F0E7D6 | landing ground (envelope) | v5 #F0E7D6, palettes v5 envelope #EFE7D6 96.3% |
| `kraft.300` | #DAC6AA | envelope kraft, bouquet wrap | v5 #DAC6AA; v4 kraft #C5A485 |
| `kraft.500` | #BCA486 | kraft edge stain | v5 |
| `butter.200` | #F8EBC1 | sticky note | v5 #F8EBC1 |

### 1.2 Ink (warm darks)
| Token | Hex | Contrast on paper.letter | Use | Evidence |
|---|---|---|---|---|
| `ink.900` | #3B272C | 13.2:1 | headings, letter greeting | v1 letter heading #3B272C; pill text #3D272A |
| `ink.800` | #4A3439 | 10.8:1 | body text | v1 body #4A3439; v4 cocoa #524145 |
| `ink.700` | #6F5F61 | 5.8:1 | captions, secondary | v1 caption text #6F5F61 |
| `ink.600` | #7C5A63 | 5.7:1 | eyebrows / meta (accessible) | derived. The reference meta #A98A93 is only 2.95:1, so darken it |
| `ink.400` | #A98A93 | 2.95:1 | **decorative only** (dividers, ✦ glyph) | v1 eyebrow #A98A93; v4 #B3969D |
| `ink.green` | #172211 | — | green-black title ink (garden theme) | v5 #172211 |
| `ink.night` | #1C1817 | 10.8:1 on #F9BCB6 | ink on pink cards (starry theme) | v3 true #1C1817 |

### 1.3 Blush pinks (the field colour)
| Token | Hex | Use | Evidence |
|---|---|---|---|
| `blush.50` | #FDF3F5 | bubble fill, countdown stamp fill | v1 countdown fill #FDF3F5 |
| `blush.100` | #F8DBE3 | sheer curtain, haze | v1 curtain #F8DBE3 / #FAE0E6; v2a blush haze #F6E6ED |
| `blush.200` | #F6C5CC | panels, wrap pink | v1 door #F6C5CC; v4 wrap #FACDD5 |
| `blush.300` | #F2C6C5 | stripe pink (dominant) | v1 #F2C6C5; palettes v1 #EEC7C7 35.2% (largest cluster) |
| `blush.400` | #F5B8B3 | gingham pink tile, card fill | v4 #F5B8B3; v3 card #F9BCB6 |
| `blush.500` | #EBB1B7 | cornice, pressed states | v1 #EBB1B7 |
| `blush.600` | #D996A0 | booth body, saturated blush | v1 booth #D996A0; palettes v1 #D8ABB3 / #C48A97 |
| `blush.700` | #D9A1B8 | washi pink | v4 washi #D9A1B8; v1 washi #C07D98–#E895B9 @73% |
| `blush.hint` | #F6CBDC | "there's more" hint pill | v1 #EDC5D7–#F5D8E7, v4 #FAD3E2, v5 #F6CBDC (three refs) |
| `blush.ring` | #DDB7C3 | countdown ring, focus ring | v1 #DDB7C3 |

### 1.4 Berry / plum (text accents and the night panel)
| Token | Hex | Use | Evidence |
|---|---|---|---|
| `berry.500` | #9B4B68 | stamp numerals, links | v1 countdown numeral #9B4B68 (5.4:1 on blush.50) |
| `berry.600` | #8A3D63 | signature | v1 signature #8A3D63; v4 #9B3A5A |
| `berry.700` | #843E55 | sign script, display handwriting | v1 sign #843E55 (7.0:1 on cream.200) |
| `berry.800` | #6E2340 | name handwriting (true) | v4 true ≈#6E2340 |
| `plum.hintText` | #5B3B4A | hint-pill label | v4 #5B3B4A (7.1:1 on #FAD3E2); v1 #6B4054; v5 #593040 |
| `plum.fab` | #6F2748 | heart FAB disc | v1 #6F2748; v4 #6F2F44; v5 wine #4F1B2B |
| `plum.fabGlyph` | #F59AC7 | heart glyph (5.0:1 on fab) | v1 #F59AC7; v4 #F49EC5; v5 #F487BA |
| `plum.panelTop` | #49223D | night panel glow | v4 |
| `plum.panelMid` | #31132B | night panel | v4; v1 #3B1932 |
| `plum.panelBottom` | #120415 | night panel floor | v4 #120415; v1 #130214; v5 #110012 |
| `plum.bezel` | #3D303A | dock bezel / frame | v4 #3D303A; v1 #3E3338; v5 #322123 |
| `plum.panelTitle` | #FFE8F8 | titles on night panel (13.2:1) | v1 "Your bouquet" #FFE8F8 |
| `lilac.400` | #C293BD | lilac floor, clouds | v1 floor #C293BD; v2a cloud #C6ACC7 |
| `lilac.700` | #763C71 | deep plum-violet | v1 #763C71 |

### 1.5 Scrims and overlays
| Token | Value | Use | Evidence |
|---|---|---|---|
| `scrim.modal` | rgba(70,25,55,.50) | letter modal, no blur | v1 f244-252, resolved solve rgba(66–74,21–31,50–59,.50–.53) |
| `scrim.lightbox` | rgba(47,15,41,.67) | photo lightbox | v4 f522-529, 66–69% |
| `scrim.theater` | rgba(10,6,8,.92) | in-app video theatre | v5 §5 recommendation |
| `flash.camera` | #FFFFFF @ .85 peak | shutter flash | v1 f54-82, peaks .77–.85 |
| `flash.impact` | #F6F0E8 @ .60 | finale impact | v4 f580-583 |
| `tooltip.bg` | rgba(52,36,30,.42) | guard tooltip | v4 rgba(52,36,30,.38–.45); v1 #9E7F7A translucent |
| `vignette.sky` | linear-gradient(to bottom, rgba(150,110,150,.25) 0%, transparent 28%, transparent 70%, rgba(150,140,140,.18) 100%) | cloud theme | v2a §6 |

### 1.6 Accents
| Token | Hex | Use | Evidence |
|---|---|---|---|
| `accent.forest` | #275330 | play, primary CTA in media panel, active track | v1 #275330, v4 #275330, v5 #234A30 |
| `accent.forestSoft` | #D6E6D4 | label on forest | v5 #D6E6D4 |
| `accent.cream.onForest` | #F3EFE0 | player pill | v1 #F3EFE0; v4 #F4EDDC (14.5:1 on plum) |
| `accent.rose` | #C47864 | "continue" rose CTA (icon only, 3.2:1, so never text) | v1 #C97D6B, v4 #C47864 |
| `accent.gold` | #D9B472 | coin, gold details | v1 coin #D9B472; v4 sunflower #E8BB5E |
| `accent.honey` | #F4A624 | sparse warm pop | v4 #F4A624 |
| `accent.teal` | #A8CDC8 | single cool accent (bag, sky) | v1 #A8CDC8; v2a sky #CEDEE6 |
| `accent.sage` | #BDB999 | cassette body | v5 #BDB999 |
| `accent.twinkle` | #FEE4D7 | 4-point twinkles | v1 f59-82 |

### 1.7 Flower sprite palette (shared by every flower curtain)
The curtains in v1, v4 and v5 all use the same family: coral peony #DD9E92, salmon dahlia #D07E6C, brick rose #B95848, red rose #C4514C, peach #EDCFB4, daisy #F8F1E4, lavender hydrangea #9783AB / #A7A7BF, sunflower #E8BB5E with centre #8B3D17, iris accent #5B3475, hot peony #C96D87, crimson #801F25. Evidence: v1 §6 flower sprites, v4 §6 flowers, v5 peony palette, palettes v1 "flower burst" (#BF6A5A, #9991AA, #EABF57) and v4 "flower burst" (#C47D6F, #B55347, #E8C069). Painters should hit these averages. The wall mean is #DEA8A4 (v5).

### 1.8 Contrast rules
- Body and letter text uses `ink.800` or darker (≥10:1). Captions use `ink.700` (5.8:1).
- Pastel display script (orchid #EBA7E6 is 1.8:1 on cream; v2a) is **decorative display only**. Use it at 48px or more, with the `glow.script` halo, and with an `aria-label` or a visually-hidden text copy. For the readable lyric line use `cloud.lyric` #9D4091 (5.6:1).
- Light text over a flower wall (v5 "Tap to reveal" #FDF4E5 at .85) always needs `textShadow.overArt`: 0 1px 2px rgba(60,20,30,.55), 0 0 12px rgba(60,20,30,.35).
- The rose CTA and FAB are icon-only. Give them a 44×44 hit area and an `aria-label` in Vietnamese ("Tiếp tục", "Còn nữa nè").

---

## 2. Themes (skins)

Every theme sets the same semantic slots: `bg`, `bgAlt`, `surface`, `surfaceInk`, `ink`, `inkMuted`, `display`, `accent`, `accentInk`, `hint`, `hintInk`, `panel*`, `scrim`, `pattern`, `sticker`. Components only read slots, so you change skins by swapping `data-theme`. In the tables below, ✓ means the theme is recommended for that product.

### Theme 1 — `booth-stripes` · "Sọc Hồng" (painted photo-booth room) · A ✓ B ✓ (default for B)
Derived from v1 (f1-644). A painted wall of cream and dusty-pink vertical stripes in uneven widths (48–80 px at 1024w), a lilac watercolour checker floor, a pink booth and plum-berry script.
| Slot | Hex | Evidence |
|---|---|---|
| bg (stripe A) | #F9F8E8 | v1 wall cream |
| bgAlt (stripe B) | #F2C6C5 | v1 wall pink; palettes v1 #EEC7C7 35% |
| floor | #C293BD / #D79BBD | v1 floor lilac / orchid |
| surface (booth) | #D996A0 | v1 booth body |
| surfaceSoft | #F6C5CC | door panel |
| curtain | #F8DBE3 | sheer curtain |
| interior | #39282B | booth interior shadow |
| display (sign script) | #843E55 | v1 sign |
| ink | #3D272A | v1 pill text |
| inkMuted | #6F5F61 | caption |
| accent (coin) | #D9B472 on plate #F4E1B5 | v1 coin |
| accentCool | #A8CDC8 | v1 handbag |
| stamp fill / ring / numeral | #FDF3F5 / #DDB7C3 / #9B4B68 | v1 countdown f30-53 |
| stripFrame (wood) | #5A3532, shadow #3E2726, motif #F3C5C5 | v1 strip frame |
| hint / hintInk | #EDC5D7 / #6B4054 | v1 |
| panel | #3B1932 → #130214 | v1 music card |
| scrim | rgba(70,25,55,.5) | v1 |
| pattern | `stripes-uneven` + `checker-floor` | §4.3 |

### Theme 2 — `sweet-gingham` · "Hộp Ngọt" (picnic tablecloth flat-lay) · A ✓ B ✓
Derived from v4 (f90-520) and v2b picnic (f877-1235). A painted pink and cream gingham with wobbly edges, a gift box, berry handwriting and a mulberry FAB.
| Slot | Hex | Evidence |
|---|---|---|
| bg (cream tile) | #FCECDD | v4 gingham cream; palettes v4 #FAF2E7 27.7% |
| bgAlt (pink tile) | #F5B8B3 | v4 pink tile; palettes v4 #EEC0BC |
| single stripe / crossing | #F7C9C0 / #F6BDB7 | derived from the pattern math below (pink #F5B8B3 at α .68 over cream); the single-stripe tone matches v4 grout/bleed #F4C9BE, and the crossing matches the v4 pink tile |
| highlight tile | #FDF6E7 | v4 |
| surface (box wrap) | #FACDD5 | v4 wrap |
| surfaceInner | #FAD8DA | inner lid |
| shadowMauve | #C19A9A | box shadow |
| display (name hand) | #6E2340 | v4 true berry plum |
| ink | #3A2A2E | v4 cocoa |
| inkMuted | #7C5A63 | derived from meta #9B8086 (darkened to AA) |
| signature | #9B3A5A | v4 |
| washi | #D9A1B8 | v4 |
| accent (strawberry red) | #CA5E60 | v4 strawberry print |
| accentWarm | #E4AD67 / #F4A624 | crepe gold / honey |
| hint / hintInk | #FAD3E2 / #5B3B4A | v4 pill |
| fab / glyph | #6F2F44 / #F49EC5 | v4 FAB |
| rose CTA | #C47864 | v4 |
| panel | #49223D → #31132B → #120415, bezel #3D303A | v4 drawer |
| lightbox scrim | rgba(47,15,41,.67) | v4 f522 |
| alt gingham (v2b, saturated "picnic" variant) | cream #F8EAE9, stripe #E191B8, crossing #C7609A, plum text #9D4091 | v2b §6 |
| pattern | `gingham` (period 8.9% of width; v4 tile 45.5 px at 1024w) | v4 §6 |

### Theme 3 — `garden-envelope` · "Phong Thư Vườn" (kraft envelope, peonies, mixtape) · A ✓ (default for A)
Derived from v5 (f1-817). A flat warm cream ground, a watercolour kraft envelope with a lilac wax seal, a peony burst, a cream paper column, a sage cassette and forest-green actions.
| Slot | Hex | Evidence |
|---|---|---|
| bg | #F0E7D6 | v5 landing (96.3% of the frame) |
| bgAlt (room blush) | #EAD2BC | v5 watercolour room |
| surface (page) | #FEF7E5 | v5 Songs card |
| envelope / stain | #DAC6AA / #BCA486 | v5 |
| seal | #AB8D9C (core #9C7E92) | v5 |
| display ink (script prompt) | #8F6266 (4.2:1, so use only for large script, 24px or more) | v5 "Tap to open" |
| title ink | #172211 | v5 H1 |
| body ink (italic serif) | #484625 | v5 letter body |
| inkMuted | #626952 (eyebrow) | v5 |
| accent | #234A30 | v5 active track / CTA |
| accentSoft | #D6E6D4 | v5 |
| sage (cassette) | #BDB999 | v5 |
| sticky | #F8EBC1 | v5 |
| ringArc | #C5B09E | v5 decorative arcs |
| peony hot / mid / crimson | #C96D87 / #D18289 / #801F25 | v5 flower palette |
| hint / hintInk | #F6CBDC / #593040 | v5 |
| fab / glyph | #4F1B2B / #F487BA | v5 |
| panel | #3F1D35 → #110012, frame #322123 | v5 drawer |
| pattern | `paper-laid` (faint laid lines) | v5 §6 "very faint laid-line texture" |

### Theme 4 — `cloud-lyric` · "Mây Lời Ca" (pastel sky, script lyrics, petals) · A ✓ (music / lyric chapter) · B: frame skin only
Derived from v2a (f1-800) and v2b (f795-870). A high-key cream sky with lilac top bands, orchid satin script, rose petals and a global vignette. Depth comes from blur and haze, with no drop shadows.
| Slot | Hex | Evidence |
|---|---|---|
| bg (sky centre) | #FDFAF3 | v2a main cream sky; palettes v2 "cloud script" #FAF7F1 33% |
| bgAlt (blush haze) | #F6E6ED | v2a |
| skyTop (lilac band) | #C6ACC7 | v2a top cloud band |
| cloud | #E6C8E2 / #D1BACD | v2a |
| horizon | #E4E2DD / #D0CFC9 | v2a lower fog |
| loadingSky | #CEDEE6 | v2a loading panel |
| display script (decorative) | #EBA7E6 core, gloss #F6D9EF, halo #FED8EF | v2a "One Day." |
| display condensed | #CF6CC3 | v2a "falling in love" |
| lyric (readable) | #9D4091 | v2b lyric plum (5.6:1) |
| ink | #4A3439 | shared core |
| deepest | #7F436B | v2b grading floor |
| petal mid / highlight / edge | #E082A8 / #F2A1C1 / #C86189 | v2b |
| 3D letter face / side | #FDF8F0 / #E8B8D9 | v2a cream extrusion, "LIKE" side |
| marshmallow face / side | #F5E3ED / #ECC5DD | v2a "YOU." |
| neon doodle / spark | #E37EB5 / #FFB5CC | v2b f1261-1676 |
| polka card | #E48DB9, dots #EBBBC9, border #FDF8F0 | v2a SOME ONE card |
| notepad | paper #F8F0EE, grid #E8DBDC, binding #F6BFED / #D974CE | v2a f474-578 |
| photo grade | duotone #966A87 → #E0B3C9 | v2a / v2b photo tones |
| pattern | `polka`, `grid-paper`, vignette overlay | §4.3 |

### Theme 5 — `starry-notebook` · "Sổ Tay Sao" (cream paper, crayon stars, kid-print hand) · A ✓ (birthday / cute) · B ✓ (stickers)
> **Superseded by FRAMEWORK.md v1.1 §3.3:** this composition is too close to v3 (and its near-black ink, white pills and grey outlines break the plum/cream rule). The shipped theme is the original `oli-notebook` (vở ô li) in `design-tokens.json`.

Derived from v3, using **white-balance-corrected values only** (v3 §6.1), combined with v2a's grid notepad. A flat cream page with about 17 hand-painted 5-point stars in 5 pastels, blush cards with a hairline cocoa outline, near-black ink and circle photo rings. The licensed mascot is replaced by an original character (§6).
| Slot | Hex | Evidence |
|---|---|---|
| bg | #FBF9F1 | v3 true paper |
| grid (optional notebook) | #E8DBDC lines on #F8F0EE | v2a notepad |
| star coral / blue / lime / apricot / aqua | #FB7478 / #88ABC6 / #DAE789 / #EAB571 / #ACF0F2 | v3 true stars |
| surface (card) | #F9BCB6 | v3 card fill |
| outline (1.5 px) | #5A3536 | v3 hairline |
| photoRing / rim / placeholder | #E3B3B8 / #B88E92 / #E8ACAB | v3 |
| ink | #1C1817 (warm alt #2B1F1F on pink) | v3 resolved ink |
| pillOutline / label | #4A4A4A | v3 (8.4:1) |
| pillFill | #FFFFFF | v3 |
| accent (butter) | #FDE194 | v3 cake |
| flame | #F0A060 | v3 |
| stickerLine / keyline | #1F1B1A / #FFFFFF | v3 |
| pattern | `starfield` (≈17 stars per screen, ≈5% vw, ±20°) | v3 §6.3 |

Note: this theme deliberately has **no** plum night panel (v3 has no media dock). Components that need `panel*` fall back to Theme 1's panel tokens.

### Theme pairing table
| Theme | Gift card (A) opener | Photobooth (B) role |
|---|---|---|
| booth-stripes | booth reveal | **default booth room**; wood strip frame |
| sweet-gingham | sweet box / ribbon pull | picnic frame, gingham strip border |
| garden-envelope | **default envelope**, songs page | floral frame, kraft strip |
| cloud-lyric | lyric / song chapter | dreamy pink-duotone filter + petal overlay |
| starry-notebook | birthday | sticker sheet, star-confetti frame |

---

## 3. Typography

### 3.1 Font eligibility rule
Only fonts with **FULL 74/74** Vietnamese glyph coverage in `fonts_vietnamese.txt` are approved: Playwrite VN, Dancing Script, Pacifico, Itim, Patrick Hand, Be Vietnam Pro, Playfair Display, Great Vibes, Charm, Mali, Pangolin, Anton, Paytone One, Dela Gothic One, Cherry Bomb One, Grandstander, Borel, Shantell Sans, Sedgwick Ave, Coiny.

**Banned** (they fail the glyph check, and diacritics fall back to another font): Caveat, Caveat Brush, Sacramento, Parisienne, Fredoka, Bebas Neue, Lilita One, Gochi Hand, Special Elite, Kalam, Archivo Black, Courier Prime, Bodoni Moda, DM Serif Display, Young Serif.

**Corrections to the per-video reports.** v2a recommends Archivo Black and Rubik. Archivo Black shows `vietnamese_subset=0`, and Rubik was not tested, so neither is approved. Montserrat, Lora, EB Garamond, Cormorant Garamond, Nunito, Quicksand, Lexend and Allura have the subset flag (=1) but were **not** glyph-checked. They are "candidates only": they may be used after a local `fontTools` 74-glyph check, and none of them is in the approved stack below.

### 3.2 Role → font
| Role | Primary | Alternate | Observed in reference | Weights |
|---|---|---|---|---|
| `script.display`: prompts, hero names, "Chạm để mở" | **Dancing Script** | Charm (more Vietnamese-calligraphic) | v5 "Tap to open" Dancing Script (identified) | 500, 700 |
| `script.formal`: copperplate lyric, title words | **Great Vibes** | Charm | v2a "One Day." pointed-pen script (Pinyon-like) | 400 |
| `script.signature`: letter sign-off, "thương anh/em" | **Playwrite VN** (served unsplit, so preload 1 weight only) | Dancing Script 700 | v1 signature, v4 raspberry signature, v2b "love u" write-on | 300–400 |
| `hand.marker`: sign, status pill, sticker labels | **Pangolin** | Itim (Sriracha has only the subset flag, so it is a candidate, not approved) | v1 sign/pill marker, v4 sticker "a sweet box…" | 400 |
| `hand.body`: letter body, captions, notes | **Mali** | Patrick Hand (upright), Itim | v3 body hand (Mali = best match), v1 captions (Patrick Hand) | Mali 400/500, Patrick Hand 400 |
| `hand.playful`: kid-print headline (starry theme) | **Mali 600–700** | Grandstander 600, Shantell Sans 600 | v3 headline | 600, 700 |
| `ui.sans`: buttons, labels, eyebrows, timers | **Be Vietnam Pro** | — | v1, v4 and v5 UI sans (Inter / DM Sans / Source Sans class) | 400, 500, 600, 700 |
| `ui.rounded`: pill numerals, counters, FAB badges, booth HUD | **Grandstander** | Coiny (chunky single weight) | v1 rounded caption feel, v4 counter "4 / 6" | 500, 700 |
| `display.extruded`: 3D words, countdown numerals, strip headers | **Paytone One** (rounded, "marshmallow") | Dela Gothic One (sharp extrusion), Cherry Bomb One (puffy), Be Vietnam Pro 900 | v2a "YOU." puffy / "LIKE" sharp / card 3D caps | 400 (single) |
| `display.condensed`: big date or stamp text | **Anton** | — | (stamp and poster use) | 400 |
| `serif.letter`: media titles, letter headings, liner notes, tooltip italic | **Playfair Display** (and its italic) | — (Lora / EB Garamond only after a glyph check) | v1 media titles serif, v4 "Your bouquet", v5 "Songs for you" transitional serif, v4 tooltip italic serif | 400, 500 italic, 700 |
| `marker.graffiti` (B sticker text, optional) | Sedgwick Ave | Borel (looped hand) | — | 400 |

Fallback stacks (always end in a system font with Vietnamese support):
```css
--font-script: "Dancing Script", "Charm", "Be Vietnam Pro", system-ui, sans-serif;
--font-hand: "Mali", "Patrick Hand", "Itim", "Be Vietnam Pro", system-ui, sans-serif;
--font-ui: "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-serif: "Playfair Display", "Noto Serif", Georgia, serif;
--font-extruded: "Paytone One", "Be Vietnam Pro", system-ui, sans-serif;
```
Load with `&subset=vietnamese` (the Google CSS2 `unicode-range` split is fine) and `font-display: swap`. Preload only `ui.sans 500`, `hand.body 400` and the theme's script face. Gate the first reveal on `document.fonts.load()` so the typewriter never reflows (v3 typewriter: pre-laid-out glyphs).

### 3.3 Type scale (mobile-first, 375 px design width; clamp to desktop)
The references were measured at 1024 px wide. v4 notes a ×1.875 factor to CSS px, so reference sizes are mapped to vw and then clamped.
| Token | Font | Size (mobile → desktop) | Line-height | Tracking | Notes |
|---|---|---|---|---|---|
| `display.hero` | script.display 700 | clamp(40px, 11vw, 72px) | **1.7** | 0 | names, "Gửi em" |
| `display.lyric` | script.formal | clamp(44px, 13vw, 96px) | **1.75** | 0 | v2a lyric units fill 20–72% width |
| `display.3d` | display.extruded | clamp(36px, 10vw, 88px) | 1.3 | 0.02em | caps allowed |
| `stamp.numeral` | display.extruded | 40px inside a 72px stamp | 1 (use a flex-centred box) | 0 | v1 70px bubble |
| `h1` | serif.letter 500 | clamp(28px, 7vw, 44px) | 1.35 | −0.005em | page titles |
| `h2` | serif.letter 500 | 22–28px | 1.4 | 0 | card titles ("Bó hoa của em") |
| `letter.greeting` | hand.body 500 / script | 24–28px | 1.55 | 0 | "Em yêu," |
| `letter.body` | hand.body 400 | 18px (min 17) | **1.65** | 0.01em | snap to the ruled-line pitch (§5.1) |
| `hand.label` | hand.marker | 16–18px | 1.5 | 0.01em | status pill, sticker |
| `caption` | hand.body 400 / Patrick Hand | 15px | 1.5 | 0.02em | strip / polaroid caption |
| `ui.body` | ui.sans 400 | 15–16px | 1.55 | 0 | |
| `ui.label` | ui.sans 600 | 14px | 1.4 | 0.01em | buttons, pills |
| `ui.eyebrow` | ui.sans 600 UPPERCASE | 11–12px | **1.5** | **0.12em** (max 0.15em) | v1 +0.12em, v4 0.15em, v5 ≤0.2em; Vietnamese caps clamp at 0.15 |
| `ui.micro` | ui.sans 500 | 12px | 1.45 | 0.02em | timers, counters |
| `tooltip` | serif.letter italic | 14px | 1.5 | 0 | v1 / v4 italic serif tooltip |

### 3.4 Vietnamese diacritic rules (mandatory)
Vietnamese stacks up to two marks above the base letter (ẩ ẫ ậ ắ ằ ẳ ẵ ặ ế ề ể ễ ệ ố ồ ổ ỗ ộ ớ ờ ở ỡ ợ ứ ừ ử ữ ự) and one below (dot below: ạ ặ ậ ẹ ệ ị ọ ộ ợ ụ ự ỵ). Capitals carry the marks above the cap height (Ễ Ặ Ỗ Ờ).

1. **Line-height minimums.** Sans and serif text 1.5 or more. Handwriting body 1.6–1.65. Script fonts 1.7 or more (1.75 for Great Vibes, which has tall ascender loops). All caps 1.3 or more (v5 §6, v2b §6). Line-heights below these values make the stacked marks collide with the line above.
2. **Top padding for script and display.** Add `padding-top: 0.25em` (script) or `0.18em` (caps / extruded) on any element with `overflow:hidden`, `background-clip:text`, a clip-path, or a mask. Typewriter clips (v2b photo lyrics are clipped to the photo window), shimmer masks (v2a), polaroid windows and pill labels all clip. Without the padding, the tone marks on ầ and Ễ are cut off.
3. **Extruded or 3D text.** The layered `text-shadow` extrusion also extrudes the diacritics. Keep the extrusion at 0.06em or less and test "ĐỢI ANH NHÉ", where the horn and hook marks must not merge with the extrusion of the line above.
4. **Tracking.** Uppercase tracking stays at 0.15em or less (beyond that, marks detach visually from their letters). Never letter-space script fonts. Spacing breaks their joins and floats the marks.
5. **Never fake uppercase on script fonts.** Use sentence case.
6. **Grapheme-safe animation.** Split text with `new Intl.Segmenter('vi', {granularity:'grapheme'})` on NFC-normalised strings. Never split by code unit, or a tone mark will animate separately from its vowel (v3 §4 typewriter).
7. **Optical vertical centring.** In pills, stamps and buttons with mixed-case Vietnamese, centre on the x-height box plus 0.04em lower offset (`padding-block: .42em .38em`), because marks above make text look low-heavy. Test with "Ừ", "ộ" and "g" together.
8. **QA strings** (put them in Storybook): "Gửi người thương nhất — Chúc mừng sinh nhật!", "ĐỢI ANH NHÉ · Ễ Ặ Ỗ Ờ Ự", "Thương em nhiều lắm, đừng quên nụ cười này nhé.", "chạm vào dải ảnh ✦", "đang in…", "cười lên!".

---

## 4. Texture and material system

### 4.1 Material layers (bottom → top)
1. **Painted ground** (raster WebP): gingham, stripe wall, room or cloud plate. It carries real brush texture.
2. **Paper grain overlay** (procedural, 3–5% opacity) on flat CSS grounds only. Never put it on top of the painted art.
3. **Cut-out illustration** (WebP alpha). No outline, no CSS shadow; shading is painted in (v1 §6).
4. **UI chrome**: flat fills, soft warm shadows, 1–1.5 px hairlines.
5. **Overlays**: scrim, flash, particles, curtain.

### 4.2 Procedural textures (CSS / SVG)
**Paper grain.** Use an inline SVG data URI and keep it under 1 KB.
```html
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
  <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/>
  <feColorMatrix values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .2  0 0 0 .55 0"/></filter>
  <rect width="100%" height="100%" filter="url(#g)"/></svg>
```
`.paper { background: var(--paper) url(grain.svg); background-blend-mode: multiply; }` with the overlay at `opacity:.04`.

**Watercolour edge on CSS shapes** (for example, a painted pill under a title). Use `filter: url(#wc)`, where `#wc` = `feTurbulence baseFrequency .02 numOctaves 3` → `feDisplacementMap scale 6`. Apply it to static decoration only; it is too costly to animate.

**Laid paper** (garden theme): `repeating-linear-gradient(0deg, transparent 0 5px, rgba(120,100,70,.035) 5px 6px)`.

**Grid paper** (notebook): `background: linear-gradient(#E8DBDC 1px, transparent 1px) 0 0/16px 16px, linear-gradient(90deg, #E8DBDC 1px, transparent 1px) 0 0/16px 16px, #F8F0EE;`

**Polka** (lyric card, v2a): `radial-gradient(circle at 25% 25%, #EBBBC9 0 18%, transparent 19%) 0 0/22px 22px, #E48DB9`.

### 4.3 Pattern generation
**Gingham** (v4: period ≈ 8.9% of width, tile 45.5 px at 1024w; v2b: checks ≈75 px). Build it from two translucent stripe sets so the crossings darken naturally:
```css
.gingham {
  --g: clamp(28px, 8.9vw, 56px);           /* one tile; period = 2 × tile */
  --c: 245 184 179;                         /* #F5B8B3 */
  background-color: #FCECDD;
  background-image:
    repeating-linear-gradient(0deg,  rgb(var(--c) / .68) 0 var(--g), transparent var(--g) calc(var(--g)*2)),
    repeating-linear-gradient(90deg, rgb(var(--c) / .68) 0 var(--g), transparent var(--g) calc(var(--g)*2));
}
```
This gives three tones: cream #FCECDD, single stripe #F7C9C0 (v4 grout/bleed #F4C9BE) and crossing #F6BDB7 (v4 pink tile #F5B8B3). For the saturated v2b picnic variant use `--c: 225 145 184` (#E191B8) over #F8EAE9 at α .7; the crossing is then ≈#E59BBF, so paint or overlay the magenta #C7609A crossing explicitly with a third `multiply` layer at .35. To get the hand-painted wobble, wrap the pattern in an SVG with `feTurbulence baseFrequency .008` → `feDisplacementMap scale 4`, rendered once to a canvas and cached as a bitmap. Shipping the painted 1024 px seamless tile (§6 asset G1) is better still.

**Uneven stripe wall** (v1: widths 48–80 px at 1024w, brushy edges). Generate it once as SVG with seeded random widths. Do not use a CSS repeat, because uniform stripes look mechanical.
```js
// seed → widths in [0.047, 0.078] × viewportWidth, alternating #F9F8E8 / #F2C6C5
let x = 0, i = 0; const rects = [];
while (x < W) { const w = W * (0.047 + rand() * 0.031); rects.push(`<rect x="${x}" width="${w+1}" height="100%" fill="${i++%2?'#F2C6C5':'#F9F8E8'}"/>`); x += w; }
// then pass through the #wc displacement filter (scale 3) for brushy edges
```

**Starfield** (v3: ≈17 stars per screen, ≈5% vw, ±20°, 5 hues, even density, some cropped). Use Poisson-disk sampling with a minimum distance of 0.18 × the shorter viewport side. Pick from 4 painted star SVG/WebP shapes × 5 hues. The field is static, with **no twinkle** (v3 §4 "static-hold"), and persists across pages.

**Checker floor** (v1 lilac floor): a 2-tone checker #C293BD / #D79BBD in perspective (`transform: perspective(600px) rotateX(55deg)`) or a painted plate.

### 4.4 Object proportions
| Object | Proportion spec | Evidence |
|---|---|---|
| **Polaroid** | Outer aspect 0.83–0.84 (w:h), square window. Side and top border 5% of width, bottom border 21% of height. Corner radius 2 px or less. Rest tilt ±2–6°. Frame #FEFDF9. | v2b §6 UI components; v4 tilt ±2–6°, frame #FEFDF9 |
| Polaroid (lightbox / large) | Border 15 px sides and top, 45 px bottom (1 : 3) | v4 lightbox |
| **Photo strip** (booth output) | Ratio ≈ 1 : 3.2 on screen (v1 119×381). Export as 2×6 in at 300 dpi = **600×1800 px** (1:3) with 4 frames (v1 has 4 flash ticks). Frame inset 6% of width; gap between photos 3%; footer 14% of height for date, caption and logo. Fan tilts −3.6° / +1.3° / +4°. | v1 f101-198 layout |
| **Strip frame materials** | Painted wood (#5A3532) with an original folk motif, gingham border, kraft, or star-confetti (one per theme) | v1 strip frame |
| **Letter card** | Aspect 0.77 (v1 240×313), −1.5° tilt, padding 8% of width, ruled lines at body line-height. Alt landscape 5:3 (v3 letter card). | v1 f244-252; v3 §6.4 |
| **Washi tape** | Width 22–30% of the card width, height 14–18 px (mobile), rotation ±4–8°, colour #D9A1B8 or #C07D98–#E895B9 at 73% opacity with `mix-blend-mode: multiply`. Torn ends via a zig-zag `clip-path` (6 teeth per end, depth 2 px). Optional pattern overlay (dots or stripe) at 25%. | v1 washi ≈73% α; v4 #D9A1B8 |
| **Sticker (die-cut)** | White keyline ≈6% of the sticker width (`#FFFFFF`), soft shadow `0 2px 4px rgba(31,27,26,.22)` | v3 §6.3 |
| **Circle photo** | Ring 4 px #E3B3B8 + 1 px rim #B88E92; placeholder disc #E8ACAB; ∅ 44–56% of the host card height, straddling the card edge | v3 letter collage |
| **Cassette** | Body ratio 1.574 : 1 (the real compact cassette, 100.4×63.8 mm). Window 56% w × 30% h, centred at 42% height. Reels ∅ 18% w, centres at ±19% w, separate layers rotating 1.1 s/rev (mirror) | v5 f364-817 reel 1.09–1.10 s/rev |
| **Gift box** | Lid hinge on the bottom edge, perspective ~700 px | v4 f136-143 |
| **Countdown stamp** | Circle ∅ 72 px (≈6.8% vw at 1024; clamp 64–96 px), fill #FDF3F5, ring 2.5 px #DDB7C3, numeral #9B4B68 | v1 f30-53 |
| **Hint ring** | 30 px ring, 1.5 px white at 55–60%, scales to ×1.95 | v4 A7/A8; v1 coin ping 33→59 px |

### 4.5 Radii
| Token | Value | Use | Evidence |
|---|---|---|---|
| `radius.photo` | 2px | polaroid, strip photo | v2b ≤2 px |
| `radius.xs` | 6px | tooltip, chips | v4 tooltip 5–8 |
| `radius.sm` | 10px | note bubble, inner dock cards | v4 bubble ~10, v5 inner 10–12 |
| `radius.md` | 14px | dock / drawer, media rail | v1 rail ~14, v5 drawer 14, v4 12 |
| `radius.lg` | 20px | blush cards (starry) | v3 16–22 |
| `radius.pill` | 9999px | pills, FAB | v3, v5 |
| `radius.page` | 0 0 28px 0 | paper column (one rounded corner) | v5 page column "rounded bottom-right corner" |

### 4.6 Borders and strokes
| Token | Value | Evidence |
|---|---|---|
| `border.hairline` | 1px solid rgba(59,39,44,.12) | track rows (v5 #E9DFC8 / #C5C1B5) |
| `border.card` | 1.5px solid #5A3536 | v3 card hairline |
| `border.pill` | 1.5px solid #4A4A4A (starry) / none (others) | v3 PillLink |
| `border.ring` | 2.5px solid #DDB7C3 | v1 stamp ring |
| `border.bezel` | 6px solid #3D303A | v4 drawer bezel, v5 6 px frame #322123 |
| `border.idleBtn` | 1.5px solid #E2D6BD on #FDF7E5 | v5 idle round button |
| `border.ruled` | `repeating-linear-gradient(transparent 0 calc(var(--lh) - 1px), rgba(200,150,165,.35) calc(var(--lh) - 1px) var(--lh))` | v1 lined letter |

### 4.7 Shadow tokens (all warm-tinted; never neutral black)
| Token | Value | Use | Evidence |
|---|---|---|---|
| `shadow.xs` | 0 1px 3px rgba(120,70,80,.20) | tags, chips | v4 tags |
| `shadow.sm` | 0 2px 6px rgba(80,40,50,.20) | pills, UI cards | v1 UI 0 2px 6px rgba(80,40,50,.15–.25) |
| `shadow.photo` | 0 2px 6px rgba(80,40,40,.25) | polaroid, strip | v4 polaroids |
| `shadow.letter` | 0 3px 10px rgba(120,60,70,.18) | letter card | v4 letter |
| `shadow.object` | drop-shadow(0 8px 12px rgba(150,80,90,.35)) | hero objects (box, envelope when lifted) | v4 box |
| `shadow.lift` | 0 8px 24px rgba(30,0,20,.35) | lightbox photo, dragged strip | v4 lightbox |
| `shadow.dock` | −6px 0 20px rgba(60,20,40,.25) | side dock | v4 drawer |
| `shadow.popover` | 0 16px 44px rgba(20,8,12,.55) | anchored drawer, player card | v5 0 16px 44px rgba(20,8,12,.6); player 0 10px 36px rgba(40,18,22,.35) |
| `shadow.pillEdge` | 0 2px 0 #E8B9C6, 0 3px 8px rgba(120,60,80,.15) | candy pill under-edge | v4 pills |
| `shadow.sticker` | 0 2px 4px rgba(31,27,26,.22) | die-cut sticker | v3 |
| `glow.script` | 0 0 10px rgba(254,216,239,.9), 0 0 2px rgba(246,217,239,.8) | orchid script halo | v2a halo 8–12 px, ~15% |
| `glow.flashBooth` | radial-gradient(circle at subject, rgba(255,255,255,.95), rgba(255,255,255,.8) 60%) | flash glow | v1 #17 |
| `extrude.marshmallow` | text-shadow 0 1px 0 #ECC5DD, 0 2px 0 #ECC5DD, 0 3px 0 #E8B8D9, 0 4px 6px rgba(160,90,140,.25) | 3D words | v2a "YOU." |

---

## 5. Component visual specs

All sizes are CSS px at the 375 px mobile width unless marked. Themes recolour components through slots. Motion values are summarised here; the motion spec owns the details.

### 5.1 Letter card (`LetterCard`)
- **Size.** min(88vw, 360px) wide, aspect 0.77 (v1 240×313). Use the landscape 5:3 variant at 768 px and up (v3).
- **Surface.** `paper.letter` #FDF8F4 + grain overlay at 4%. `radius.xs` (6px; the references show near-square paper). `shadow.letter`. Static rotate −1.5° (v1 #40).
- **Washi tape** at the top centre, 26% of the width, rotated −5°, `blush.700` at 73%, multiply blend.
- **Content.**
  - × close button, 32 px circle with a 44 px hit area, `ink.700` glyph.
  - Eyebrow: `ui.eyebrow`, `ink.600` (for example "THƯ GỬI EM").
  - Greeting: `letter.greeting`, `berry.700` or the theme display colour.
  - Body: `letter.body`, `ink.800`, with ruled lines (`border.ruled`) whose pitch equals the body line-height (18 × 1.65 = 29.7 px, so round the line-height to 30px and align the background offset to the first baseline).
  - Signature: `script.signature` 28px, `berry.600`, right-aligned.
  - Optional voice-note pill.
- **Padding.** 8% of width on the sides, 12% at the top (so the tape and eyebrow clear), 10% at the bottom.
- **Scroll.** Long letters scroll inside the card with a 24 px fade mask at the bottom. Add `padding-top: .25em` to the first line because the mask clips (§3.4 rule 2).
- **Open.** It sits on `scrim.modal`, and the media dock stays above the scrim (v1 z-order).

### 5.2 Polaroid (`Polaroid`)
- **Proportions.** Aspect 0.835, square window, borders 5% / 5% / 5% / 21% (v2b). Frame #FEFDF9 + 3% grain. `radius.photo`. `shadow.photo`.
- **Caption.** Inside the bottom border: `caption` (Mali / Patrick Hand 15px), `ink.700` (v2b caption ink #8A7A84 is too light, so it is darkened). Centred, one line, ellipsis.
- **Tilt.** From a seeded set of {−6, −3.5, −1.5, 2, 4, 6}°. Never 0° unless it is in the lightbox (where it snaps −4° → −1°, v4 D5).
- **Photo treatment** per theme. `cloud-lyric` uses a pink duotone: `filter: sepia(.25) saturate(.85) hue-rotate(-18deg) brightness(1.04)` plus a soft-light `#E0B3C9` layer, with blacks lifted to no darker than #7F436B (v2b grading rule). The other themes use no filter.
- **Optional washi** on one corner at 45°, 34% of the width.
- **Stack.** Deals offset 8 px lower with a new tilt, and the older card edges stay visible (v4 C6).

### 5.3 Photo strip (`PhotoStrip`), product B output and gift-card memory
- **Export.** 600×1800 px (2×6 in at 300 dpi), PNG/JPEG q92, sRGB. Also a 1080×1920 "story" variant that centres the strip on the theme pattern.
- **Layout.**
  - > **Superseded by FRAMEWORK.md v1.1 §3.6** (the original numbers summed to 1926 px on an 1800 px canvas): top inset 36 px, side insets 57 px, 4 photos at 486×364 px (4:3), 18 px gaps, footer 254 px (36 + 4·364 + 3·18 + 254 = 1800).
  - Footer: date in Be Vietnam Pro 600 tabular 28px, caption in `hand.body` 32px, and a small mark.
- **Frame skins.**
  - booth-stripes: painted wood #5A3532 with an original motif (§6 F-assets).
  - sweet-gingham: gingham border with a cream inset.
  - garden-envelope: kraft #DAC6AA with pressed-flower corners.
  - oli-notebook (replaces starry-notebook, FRAMEWORK v1.1): cream ô li ruling with painted doodles.
  - cloud-lyric: blush gradient #F6E6ED → #FDFAF3 with petals.
- **On screen.** Aspect 1 : 3 (the export ratio; v1's 1 : 3.2 is the reference observation only, FRAMEWORK v1.1), `radius.photo`, `shadow.photo`. Fanned three-across at −3.6° / +1.3° / +4° (v1 f112-198). The caption bar below is a separate element (#FFF9F4 fill, `ink.700` text, v1 #24).
- **Print slot.** The booth slot is an `overflow:hidden` mask; the strip feeds through it at scale .29 (v1 #22).

### 5.4 Music dock (`MusicDock`), the night panel
- **Placement.** Mobile: a bottom sheet, 100vw × up to 72vh, radius 14px on the top corners. Desktop (≥ 900 px): a right rail 22% of the width (v1 x785–1008 ≈ 22%, v4 ~22%) or an anchored popover 282×393 above the FAB (v5).
- **Surface.** `radial-gradient(120% 80% at 50% 0%, #49223D 0%, #31132B 45%, #120415 100%)`, 6 px bezel #3D303A, `radius.md`, `shadow.dock` (rail) or `shadow.popover` (popover). There is **no** backdrop dim (v4 C9, v5).
- **Inner cards.** 10–12 px radius, 8 px gaps (v5). Titles in `serif.letter` 18px #FFE8F8, eyebrows in `ui.eyebrow` rgba(255,232,248,.6).
- **Voice-note pill.** Height 52px, fill #F3EFE0, 40 px play button `accent.forest` #275330 with a cream glyph. Waveform bars 2px wide with a 2px gap; played bars `accent.forest`, unplayed rgba(39,83,48,.25) (v5 "played bars green"). Duration in `ui.micro` `ink.700`.
- **Track row.** 44 px, hairline divider. Idle round button 25–32 px #FDF7E5 with a #E2D6BD ring; active button solid #234A30 (v5). Hover scale 1.06.
- **Cassette hero** (garden theme): `accent.sage` body, reels bound to the real `playing`/`pause` events (v5 anti-pattern fix).
- **Embeds** go inside a themed 6 px bezel #6C5E5E (v5). Prefer an in-app theatre overlay at `scrim.theater` over native fullscreen.

### 5.5 Drawer (`Drawer`), generic side sheet
- Same surface as the dock for media. For non-media content (memories, map), use a paper variant: `paper.page`, 6 px bezel #E6D7C2, `shadow.dock`.
- Width: mobile 100vw (bottom sheet with a 36×4 px grab handle, rgba(255,255,255,.35) on plum or `ink.400` on paper); desktop 320–360px.
- Scroll uses `scroll-snap-type: y proximity` on cards (v4 snap jump f403).
- Close button: 36 px circle, rgba(255,255,255,.12) fill on plum.

### 5.6 Pill (`Pill`), four variants
| Variant | Fill | Text | Border / shadow | Height | Evidence |
|---|---|---|---|---|---|
| `status` (booth HUD: "thả xu ✦", "cười lên!", "đang in…") | #FBF6F3 | `hand.marker` 16px #3D272A | `shadow.sm` | 34px, padding 0 14px, width snaps to content (no tween) | v1 #5, #21, #34 |
| `hint` ("Còn nữa nè") | `blush.hint` #F6CBDC | `ui.label` 13px #5B3B4A | `shadow.pillEdge` | 32px | v1 / v4 / v5 hint pills |
| `link` (starry theme) | #FFFFFF | Be Vietnam Pro 15px #4A4A4A, underlined | 1.5px #4A4A4A | 40px | v3 PillLink |
| `action` ("xem lại", "chụp tiếp") | `accent.forest` #275330 | `ui.label` #F3EFE0 | `shadow.sm` | 44px | v5 CTA green |

All pills: `radius.pill`, label padding `.42em .9em .38em` (diacritic optical centring, §3.4 rule 7), and a ✦ glyph inline in `ink.400`.

### 5.7 FAB (`HeartFab`)
- 48 px circle on mobile (the references use 28–36 px on desktop, v4 / v5; scaled up for touch), fill `plum.fab` #6F2748, heart glyph 22 px #F59AC7, `shadow.sm` + 0 0 0 3px rgba(255,255,255,.6) halo ring.
- Paired with the `hint` pill to its left, 8 px gap, 16 px from the viewport edges (v5 16 px inset).
- Hover / press: scale 1.04 (v5).
- Badge for unseen items: 10 px dot, `accent.honey`.

### 5.8 Hint ring (`HintRing`)
- Two concentric rings at 30 px, 1.5 px stroke, rgba(255,255,255,.6) on art. On cream grounds use `blush.ring` #DDB7C3 at .8.
- One ring scales ×1.95 over 800 ms linear; the second is faster (300 ms) (v4 A7–A8). The v1 coin ping is the same idea (33→59 px).
- Optional `accent.twinkle` 4-point sparkle at 2 o'clock, 8 px.
- `pointer-events:none`, centred on the hotspot. Remove it on the first interaction.

### 5.9 Tooltip (`GuardTooltip`)
- Fill `tooltip.bg` rgba(52,36,30,.42) + `backdrop-filter: none`, text #FFF9F4 `tooltip` (Playfair italic 14px), `radius.xs`, padding 8px 12px, max-width 220px. Caret 6 px.
- Placement: under the rose CTA at the top right (v1, v4). Copy example: "Chỉ chạm khi đã đọc xong để tiếp tục".
- Because the fill is translucent, contrast varies with what is behind it. Over pale grounds, raise the alpha to .62 or more. Enforce 4.5:1 against the worst-case background sampled under it.

### 5.10 Countdown stamp (`CountdownStamp`), product B and the booth reveal
- **Shape.** 72 px circle (clamp 64–96), fill `blush.50` #FDF3F5, 2.5 px `blush.ring` #DDB7C3 ring, plus an inner dashed ring at 6 px inset (1px, 3/3 dash, rgba(155,75,104,.35)) for a "rubber stamp" feel. Light paper grain at 6%. Rotate −4° per digit, alternating ±.
- **Numeral.** `display.extruded` (Paytone One) 40px, `berry.500` #9B4B68, with a 1-step extrusion `0 2px 0 #DDB7C3`.
- **Final "Cười!" / "Smile" state.** Swap to `hand.marker` 20px inside the same disc.
- **Position.** Product B: over the camera preview at the centre, behind a 15% blush vignette. Gift A: centred on the booth window (v1 (511,275)).
- **Flash layer** below the HUD: white .85 peak + `glow.flashBooth`. Reduced motion caps the flash at .4 (v1 §8).

### 5.11 Other recurring chrome
- **Rose CTA** ("continue to next chapter"): a 40 px painted rose icon (`accent.rose`), top right, 16 px inset, with a 44 px hit area and the tooltip (§5.9).
- **Caption bar** (under a strip): #FFF9F4, `caption` `ink.700`, radius 4, width = strip width + 12%.
- **Note bubble** (v4 bite notes): #FFF0F2 on a mini gingham at 30%, `radius.sm`, 8 px caret, `hand.body` 15px, meta line `ui.micro` `ink.600`.
- **Scrim**: `scrim.modal`, no blur (v1).

---

## 6. Illustration brief (for commissioning ORIGINAL art)

### 6.1 Style
- **Medium.** Digital gouache and watercolour (Procreate or Rebelle). Visible granulation, soft blooms, dry-brush edges, light paper grain. The look is "painted cut-out": every object is an isolated shape with **no outline** and painted shading, ready for transparent export (v1, v4, v5).
- **Optional thin ink.** A warm-brown or rose ink line (#8E4F77 / #5A3532) only on small props (v4 "occasional thin warm-brown or rose ink lines").
- **Palette.** Paint within the theme hexes in §2. Darkest values should be warm cocoa or plum, never black. Apply a slightly warmer, saturated version for finale flowers (v4: the finale flowers are more saturated than the intro flowers).
- **Light.** Soft top-left light, low contrast, high-key pastel. Shadows are painted mauve (#C19A9A family), not grey.
- **People.** Faceless and cropped: knees-down legs, hands holding photos, silhouettes. This keeps the gift universal and lets the user's real photos carry the faces (v1 knees-down booth; v2b hands-holding-polaroid). Include diverse skin tones: 6 tones painted warm.
- **Cultural layer (original, Vietnamese-flavoured).** Áo dài-hem silhouettes, nón lá, hoa sen / hoa mai / hoa đào / hoa sữa / lan sprigs, bánh / chè / trà sữa treats for the sweet box, cassette or vinyl in retro Sài Gòn colours, phong bì đỏ (red envelope) as a Tết skin. Do not imitate any reference art; reproduce only the *kind* of object.
- **Mascot.** Commission **one original mascot** (suggestion: a round cream-and-blush mèo or a small chubby bird) with 3 expressions and a peek pose that fits the v3 "peeks over the card edge" slot. It must not resemble any licensed character (v3 note). **Superseded by FRAMEWORK.md v1.1 §3.7:** no top-edge peek (it is the licensed character's signature placement); the mascot sits on the letter's washi tape, and no dogs, beagles or black-outline line art.

### 6.2 Deliverable formats
- Masters: layered PSD/Procreate at 2× the largest use size, 300 dpi for print-bound strip frames.
- Web: **WebP with alpha, q80–85**, with AVIF as an optional `<picture>` source. Long edge at 2× CSS (for example, a 180 CSS px envelope ships at 360 px and 540 px). Keep each sprite at 120 KB or less and each scene plate at 350 KB or less.
- Sprite atlases: TexturePacker JSON-hash + WebP pages at 2048×2048 max, 2 px extrude, for the canvas / PixiJS flower and petal systems.
- Vectors: SVG for stars, hearts, sparkles and UI icons (stroke 1.75 px, rounded caps).
- Motion: **Lottie** (dotLottie, ≤60 KB each) for small looping or one-shot vector effects. **Rive** (state machines) for interactive objects whose state follows the user.

### 6.3 Asset list
| ID | Asset | Layers / states | Size (export, long edge) | Format | Engine |
|---|---|---|---|---|---|
| **F1** | Flower sprite set: 15 species (peony, garden rose, red rose, dahlia, daisy, hydrangea, lily, sunflower, cosmos, pansy, iris, anemone, plus original VN: sen, mai, đào), 3 variants each, 2 angles | 90 sprites | 256 / 512 px | WebP atlas | PixiJS / canvas curtain, burst and flood (v1 f473-513, v4 f4-71 and f594-610, v5 f58-156) |
| F2 | Ghost-flower veil plate | 1 | 1600 px | WebP | DOM |
| F3 | Petal set (3 depth tiers: far 1–2%, mid 4–5%, near 6–12% of width), 6 petals × 3 colours, plus 4 pre-blurred near petals | 22 | 128–256 px | WebP atlas | canvas (v2a petalField) |
| **B1** | Photo booth (original design, Vietnamese retro-kiosk feel): body, sign plaque (blank, name set in type), coin plate, coin, slot, slot mask, sheer curtain (separate, pivot at the rod), interior | 9 layers | 1400 px tall | layered WebP + JSON anchor map | DOM / Rive (curtain sway, damped swing) |
| B2 | Knees-down legs: 6 pose pairs × 2 outfits, a small dog and a handbag, 4–6 frames per burst | sprite sheets | 512 px frames | WebP sheet | DOM steps() (v1 #20) |
| B3 | Starburst glint 3 variants, twinkle 2 variants | 5 | 128 px | SVG / Lottie | Lottie |
| **S1** | Gift box: base, lid (separate, hinge marked), inner tray, ribbon (bow, tails, cross), crumpled ribbon pile, tag | 7 | 1200 px | layered WebP | **Rive** state machine: wrapped → tugged → untied → open (v4 f114-143) |
| S2 | Treats ×6 (bánh bông lan, chè, bánh flan, trà sữa, donut, bánh crepe), 3 bite states each | 18 | 384 px | WebP sheet | DOM sprite swap (v4 bite tap) |
| S3 | Props: milkshake / trà sữa cup, honey jar, topping bowls ×6, sauce bottles ×2 | 10 | 384 px | WebP | DOM (one prop gets the trapezoid sway) |
| S4 | Pennant flags ×3, mini sticker | 4 | 256 px | WebP / SVG | DOM |
| **E1** | Envelope: closed, open (flap up), inner letter edge, wax seal (separate), sprig | 5 | 720 px | layered WebP | DOM crossfade with paper dip (v5 f44-54) or Rive |
| E2 | Red-envelope (lì xì) skin of E1 | 5 | 720 px | layered WebP | Tết theme |
| **C1** | Cassette: body, window, left reel, right reel (centred pivot), label area (blank, title set live), stickers ×4 | 8 | 1000 px | layered WebP | DOM; reels rotate in CSS bound to audio |
| C2 | Bouquet in kraft cone (3 variants) for the dock card | 3 | 600 px | WebP | DOM |
| **G1** | Seamless painted grounds: gingham (pink and cream, plus a magenta picnic variant), uneven stripe wall, lilac checker floor, watercolour room, cream paper with laid lines | 6 | 1024 px tile, seamless | WebP | CSS background |
| G2 | Cloud plates: top lilac band, side banks, centre puff, horizon fog (separate for parallax) | 4 | 2048 px | WebP | DOM parallax (v2a / v2b) |
| G3 | Painted stars: 4 shapes × 5 hues | 20 | 96 px | WebP or SVG with a texture mask | DOM starfield (v3) |
| **P1** | Strip frame skins ×5 (wood + original motif, gingham, kraft-floral, star-confetti, cloud-petal) | 5 | 600×1800 px print + 2× screen | PNG (print) + WebP | canvas compositor (B) |
| P2 | Polaroid frame texture (cream with grain), 2 aged variants | 3 | 800 px | WebP | DOM / canvas |
| P3 | Sticker sheet for B: 40 die-cut stickers (hearts, bows, Vietnamese words "thương", "mãi bên nhau", "cười lên", food, flowers, mascot) with a 6% white keyline baked in | 40 | 512 px | WebP | canvas / DOM drag |
| P4 | Washi tapes: 6 patterns (solid pink, dot, stripe, gingham, floral, star), torn ends | 6 | 600×80 px | WebP | DOM |
| **M1** | Original mascot: idle, peek-over-edge, happy, wave, 3 expressions | 7 | 512 px | **Rive** (idle wobble, tap reaction) | Rive |
| M2 | Hands holding a photo (POV, 3 skin tones) | 3 | 1600 px | WebP layered (thumbs as a separate top layer so they overlap the photo) | DOM (v2b close-up) |
| **L1** | Lottie effects: heart burst (13–15 hearts), confetti fountain (15 flakes), hint ring, sparkle glint, shutter starburst, impact rays + shockwave ring, heart charm | 7 | vector | dotLottie | Lottie |
| L2 | Neon doodle pen strokes (coil, heart, underline), write-on paths | 3 | SVG paths | SVG + stroke-dash | DOM (v2b) |
| UI1 | Icon set: heart FAB, rose CTA (painted, 2 sizes), play, pause, close, camera switch, shutter, timer, download, share, gallery, retake | 14 | 24 / 48 px | SVG (rose painted in WebP) | DOM |

### 6.4 Lottie vs Rive vs code
- **Rive** for stateful objects tied to user input: ribbon pull (drag distance drives the tug, with a threshold), lid flip, envelope open, mascot reactions, booth curtain sway and impulse, and cassette reels (bool `playing`).
- **Lottie** for fire-and-forget particles and stingers (L1), where designers will keep iterating on the art.
- **Code** (CSS / WAAPI / PixiJS) for everything that must be timed to the measured frames or seeded per gift: flower curtains, petals, gingham, starfield, countdown, flash, typewriter, strip toss.

---

## 7. Theming implementation

```css
:root, [data-theme="booth-stripes"] { --bg:#F9F8E8; --bg-alt:#F2C6C5; --surface:#FDF8F4; --ink:#3D272A; --ink-muted:#6F5F61;
  --display:#843E55; --accent:#275330; --hint:#EDC5D7; --hint-ink:#6B4054; --fab:#6F2748; --fab-glyph:#F59AC7;
  --panel-top:#3B1932; --panel-bottom:#130214; --scrim:rgba(70,25,55,.5); }
[data-theme="sweet-gingham"]   { --bg:#FCECDD; --bg-alt:#F5B8B3; --display:#6E2340; --ink:#3A2A2E; --hint:#FAD3E2; --hint-ink:#5B3B4A; --fab:#6F2F44; --fab-glyph:#F49EC5; --panel-top:#49223D; --panel-bottom:#120415; }
[data-theme="garden-envelope"] { --bg:#F0E7D6; --bg-alt:#EAD2BC; --surface:#FEF7E5; --display:#8F6266; --ink:#172211; --accent:#234A30; --hint:#F6CBDC; --hint-ink:#593040; --fab:#4F1B2B; --fab-glyph:#F487BA; --panel-top:#3F1D35; --panel-bottom:#110012; }
[data-theme="cloud-lyric"]     { --bg:#FDFAF3; --bg-alt:#F6E6ED; --display:#CF6CC3; --ink:#4A3439; --lyric:#9D4091; }
[data-theme="starry-notebook"] { --bg:#FBF9F1; --surface:#F9BCB6; --ink:#1C1817; --outline:#5A3536; --display:#1C1817; }
```
The full slot list is in `design-tokens.json → themes`.

**Dark mode.** The products are paper objects, so there is no global dark mode. The plum night panel *is* the dark surface. If the OS is in dark mode, keep the themes and only darken page chrome outside the gift (the share and edit screens) using `plum.panelMid` with cream text.

---

## 8. Open items
- Exact reference fonts are visual matches only. The roles above are original substitutions chosen for Vietnamese coverage.
- v3 colours are WB-corrected estimates (gain ≈1.10–1.18), so treat the starry theme hexes as a starting point and tune them on device.
- Candidate fonts (Montserrat, Lora, EB Garamond, Cormorant, Nunito, Quicksand, Lexend) need a local 74-glyph check before they are added.
- The gingham single-stripe and crossing tones (#F7C9C0 / #F6BDB7) are derived from the pattern math, not sampled. Confirm them against the commissioned G1 tile.
