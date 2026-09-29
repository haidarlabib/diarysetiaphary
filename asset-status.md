# Priority 1 asset lifecycle status

Coordinate convention: `[x, y, width, height]` in native source pixels.  
Source truth: `# PRD — diarysetiaphary.prd` plus the inspected native-pixel panel map.

## Summary

- `READY`: 12 opaque crops
- `BLOCKED`: 24 reference-only, transparency-dependent, or role-unseparable candidates
- `MISSING`: 2 (`CPA-05`, `CPA-06`)
- Application code changed: no
- Redraw/regeneration/recolor: no
- Whole boards exported: no
- Transparent Tania production PNGs created: none; CPA-01/02/03 remain safely blocked

## Direct source inspection

Both inspected boards are `1536×1024`, `RGB`, with alpha absent. Their panel backgrounds are textured and non-uniform at crop edges; no safe alpha boundary was available.

## READY outputs

| ID | Source | Native crop | Output | Validation |
|---|---|---:|---|---|
| ENV-01 | `assets/ENVIRONMENT MASTER.png` / Bedroom | `[20,111,574,305]` | `public/assets/environments/bedroom/bedroom_master.png` | RGB, 574×305, pixel-exact |
| ENV-02 | `assets/ENVIRONMENT MASTER.png` / Garden | `[16,440,580,309]` | `public/assets/environments/garden/garden_master.png` | RGB, 580×309, pixel-exact |
| ENV-03 | `assets/ENVIRONMENT MASTER.png` / Cafe | `[16,770,580,235]` | `public/assets/environments/cafe/cafe_master.png` | RGB, 580×235, pixel-exact |
| DIA-01 | `assets/ChatGPT Image Sep 29, 2026, 01_23_04 PM.png` / Cover | `[18,95,617,244]` | `public/assets/diary/cover/diary_cover_default.png` | RGB, 617×244, pixel-exact |
| DIA-03 | same / Open diary | `[891,90,419,255]` | `public/assets/diary/book/diary_book_frame.png` | RGB, 419×255, pixel-exact |
| DIA-04 | same / Page variations | `[23,348,932,178]` | `public/assets/diary/pages/diary_page_variations_reference.png` | RGB, 932×178, pixel-exact |
| DIA-05 | same / Paper texture | `[335,533,260,222]` | `public/assets/diary/textures/diary_texture_lined.png` | RGB, 260×222, pixel-exact |
| UI-01 | `assets/UI SYSTEM.png` / Dialogue box | `[20,134,345,534]` | `public/assets/ui/dialogue/dialogue_box_frame.png` | RGB, 345×534, pixel-exact |
| UI-03 | same / Choice buttons | `[370,130,230,540]` | `public/assets/ui/choices/choice_button.png` | RGB, 230×540, pixel-exact |
| UI-04 | same / Navigation | `[605,139,195,529]` | `public/assets/ui/navigation/navigation_panel.png` | RGB, 195×529, pixel-exact |
| UI-05 | same / Day/time | `[802,130,238,288]` | `public/assets/ui/hud/day_time_frame.png` | RGB, 238×288, pixel-exact |
| CG-01 | `assets/STORY CG  or SPECIAL ILLUSTRATION.png` / first daily-life artwork | `[19,130,251,181]` | `public/assets/cg/story/cg_daily_life_01.png` | RGB, 251×181, pixel-exact; INTEGRATED in garden story |

## INTEGRATED runtime assets

- `ENV-01`, `ENV-02`, `ENV-03`: master background planes in `src/renderer/threeWorld.ts`.
- `DIA-03`: diary frame CSS custom property in `src/ui/views.ts`.
- `DIA-04`: editable diary surface reference background in `src/ui/styles.css`.
- `DIA-05`: diary page texture in `src/ui/styles.css`.
- `CG-01`: garden `See this moment` choice invokes `showCg:cg_daily_life_01`, then continues to the shared node.

## BLOCKED after extraction

| ID | Native crop / reason |
|---|---|
| CPA-01 | `[298,112,730,396]` → `public/assets/characters/tania/fullbody/tania_standing_reference.png`; RGB 730×396, alpha absent. Textured/non-uniform background makes standing hair, clothing, and pose edges unsafe to isolate. |
| CPA-02 | `[1034,112,470,396]` → `public/assets/characters/tania/sitting/tania_sitting_reference.png`; RGB 470×396, alpha absent. Sitting contours and garment edges are unsafe to isolate; no missing pose was invented. |
| CPA-03 | `[775,515,473,316]` → `public/assets/characters/tania/portrait/tania_portrait_reference.png`; RGB 473×316, alpha absent. Portrait hair and facial silhouette edges are unsafe to isolate. |
| LYR-01 | `[17,108,1269,301]` → `bedroom_layers_reference.png`; exact RGB reference crop only, labels and multiple role examples remain. |
| LYR-02 | `[17,424,1269,293]` → `garden_layers_reference.png`; exact RGB reference crop only, labels and multiple role examples remain. |
| LYR-03 | `[17,739,1271,266]` → `cafe_layers_reference.png`; exact RGB reference crop only, labels and multiple role examples remain. |
| LYR-01-BACKGROUND / FAR / MID / MAIN / FOREGROUND | `[17,108,1269,301]` each; no label-free, role-only, pixel-exact source rectangle is proven. No standalone files created. |
| LYR-02-BACKGROUND / FAR / MID / MAIN / FOREGROUND | `[17,424,1269,293]` each; no label-free, role-only, pixel-exact source rectangle is proven. No standalone files created. |
| LYR-03-BACKGROUND / FAR / MID / MAIN / FOREGROUND | `[17,739,1271,266]` each; no label-free, role-only, pixel-exact source rectangle is proven. No standalone files created. |
| DIA-06 | `[618,533,375,223]` → `diary_decorations_reference.png`; individual alpha isolation is unsafe. |
| UI-02 | Badge crop coordinates were referenced as inspector output but not supplied here; old incorrect crop was removed. |
| FX-08 | `[880,867,404,122]` → `particle_elements_reference.png`; transparent isolation remains unsafe. |

## MISSING

- `CPA-05`: Ainat — no extractable asset found after board inspection. Do not substitute.
- `CPA-06`: Player — no extractable asset found after board inspection. Do not substitute.

All exact rectangles, lifecycle arrays, output paths, modes, and dimensions are also recorded in `asset-status.json`.

## Final runtime integration audit

`READY` means extracted and validated. It does not mean the browser uses the file. Runtime evidence distinguishes `INTEGRATED` from registration-only assets.

| ID | Runtime file | Referenced by | Browser surface | Status |
|---|---|---|---|---|
| ENV-01 | `public/assets/environments/bedroom/bedroom_master.png` | `src/renderer/threeWorld.ts` | Bedroom background plane | INTEGRATED |
| ENV-02 | `public/assets/environments/garden/garden_master.png` | `src/renderer/threeWorld.ts` | Garden background plane | INTEGRATED |
| ENV-03 | `public/assets/environments/cafe/cafe_master.png` | `src/renderer/threeWorld.ts` | Cafe background plane | INTEGRATED |
| DIA-03 | `public/assets/diary/book/diary_book_frame.png` | `src/ui/views.ts` | Interactive diary shell | INTEGRATED |
| DIA-04 | `public/assets/diary/pages/diary_page_variations_reference.png` | `src/ui/styles.css` | Editable diary writing surface | INTEGRATED |
| DIA-05 | `public/assets/diary/textures/diary_texture_lined.png` | `src/ui/styles.css` | Interactive diary pages | INTEGRATED |

The following READY crops exist but are not runtime-referenced and are therefore not falsely marked integrated: `DIA-01`, `UI-01`, `UI-03`, `UI-04`, `UI-05`, and `CG-01`. Their visual treatments are currently represented by HTML/CSS or the existing story surface; the files remain available for future safe integration.

## Environment role audit

The renderer creates the required role architecture, but blocked layer artwork is not silently treated as production art.

| World | Background | Far | Mid | Main | Character | Foreground | FX |
|---|---|---|---|---|---|---|---|
| Bedroom | REAL_PRODUCTION_ASSET ENV-01, then procedural fallback during load | PROCEDURAL `paintWorld().far` | PROCEDURAL `paintWorld().mid` | PROCEDURAL `paintWorld().main` | EMPTY | PROCEDURAL `paintWorld().foreground` | EMPTY |
| Garden | REAL_PRODUCTION_ASSET ENV-02, then procedural fallback during load | PROCEDURAL `paintWorld().far` | PROCEDURAL `paintWorld().mid` | PROCEDURAL `paintWorld().main` | PROCEDURAL placeholder figure | PROCEDURAL `paintWorld().foreground` | EMPTY |
| Cafe | REAL_PRODUCTION_ASSET ENV-03, then procedural fallback during load | PROCEDURAL `paintWorld().far` | PROCEDURAL `paintWorld().mid` | PROCEDURAL `paintWorld().main` | PROCEDURAL placeholder figure | PROCEDURAL `paintWorld().foreground` | EMPTY |

`LYR-01`, `LYR-02`, and `LYR-03` remain blocked and their labeled crops are not loaded by the renderer. All 15 requested world-role candidates are explicitly represented in `asset-status.json` as blocked; no layer PNG was manufactured from a composite board.

## Layer extraction decision

Native source boards: `assets/ENVIRONMENT LAYERS.png` and `assets/ENVIRONMENT MASTER.png`, both inspected as RGB source material. The only exact layer-board rectangles available are the three composite strips listed above. They contain labels and/or artwork belonging to more than one requested role, and the supplied pixels do not provide alpha-separated role assets. Therefore no background, far, mid, main, or foreground standalone file is safe to create for bedroom, garden, or cafe without label removal, repainting, generative fill, recolor, or other non-extraction editing.

Recommended runtime behavior: keep the existing real master crop as each world's `background`; keep `far`, `mid`, `main`, and `foreground` on the existing procedural fallback path. Do not load the labeled reference strips in the browser. If future source delivery includes separate transparent role files, add them under `public/assets/environments/<world>/layers/` and update the 15 records with native coordinates, dimensions, hashes, and browser evidence.

## Final visual audit conclusion

The browser result is partially asset-driven, not a completed asset-faithful production build. The three master environment crops and diary frame/texture/reference are genuinely integrated. The five-layer architecture exists, but only the background role has real production artwork; far/mid/main/foreground remain procedural. Character, FX, UI crop, diary cover, and CG files that are not runtime-referenced remain registration-only or blocked. This is documented intentionally rather than hidden behind a false completion claim.
