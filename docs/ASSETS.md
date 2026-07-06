# ISO — Assets manifest

Curated from the uploaded design files. Drop this `assets/` folder into the prototype repo (e.g. `src/assets/` or `public/assets/`). Only the assets actually useful for the build are included; the rest of the uploads were device-frame renders, duplicate icon variants, or lo-fi placeholders and are intentionally omitted (see "Not included" below).

## Include these

| File | What it is | Use in the prototype |
|---|---|---|
| `iso-splash.svg` | Full splash-screen design (cream→amber gradient, logo, tagline with green "real") | Reference/source for screen 01 (Splash). Reproduce in code. |
| `iso-splash-preview.png` | Rendered preview of the splash | Quick visual reference (not for shipping). |
| `iso-logomark-gold.svg` | ISO chess-piece logomark, gold | Logo on light/cream surfaces. |
| `iso-logomark-black.svg` | ISO logomark, black | Logo on light surfaces / mono contexts. |
| `iso-logomark-white.svg` | ISO logomark, white | Logo on the orange/gradient splash and dark surfaces. |
| `iso-appicon-dark.svg` | App icon — dark tile, white piece | Favicon / PWA icon / home-screen icon. |
| `iso-appicon-gold.svg` | App icon — gold tile | Alternate app icon. |
| `iso-appicon-red.svg` | App icon — dark tile, red piece | Alternate app icon. |
| `iso-brand-sheet.svg` | Full logo/brand exploration sheet (all marks + icon lockups + wordmarks) | Reference only — shows the brand mark's construction and color treatments. |
| `ISO_Wireframe_Kit_reference.html` | The 27-screen wireframe blueprint (open in a browser) | **Primary visual reference for screen layouts.** Have the agent consult it per screen. |

## Brand details these assets reveal (fold into the build)

- **Logo:** the "i" in "iSO" is a **chess-piece mark** (pawn/king silhouette). Use the provided SVGs rather than typesetting a plain "i".
- **Secondary accent — green:** the tagline highlights the word "real" in a **bright green** (~`#20C55E`). This is a second accent beyond the orange and was missing from the original token set. Add:
  `--iso-green: #20C55E;  /* positive / emphasis accent — used sparingly, e.g. "real", success, "it's a match" */`
- **Splash gradient:** vertical **cream→amber** (`#FFF3DE` top → `#F2A03D` bottom), logo centered slightly below middle, tagline beneath.
- **Taglines in use:** marketing = *"it's time for a real one-on-one"*; product = *"One conversation at a time."* Both are on-brand.

## Not included (and why)

- Empty iPhone device frames (`Frame_315901`, parts of `Frame_315903`) — the prototype renders its own CSS phone frame; raster device chrome isn't needed.
- `Rectangle_24.svg` — a plain cream rounded rectangle (a wireframe background element).
- `Frame_315905.jpg` — the lo-fi wireframe placeholder (two grey-block phones); superseded by the hi-fi splash and the wireframe kit.
- `iso-hero-marketing.png` *(kept optional in this folder)* — an angled phone "hero" render of the splash; useful for a landing page or pitch, **not** needed for the app build. Delete if you don't want it in the repo.
- Duplicate icon/wordmark variants (`Frame_315893/315895/315896/315900`) — near-duplicates of the app-icon/logomark files already included.

## Source docs (already synthesized into the PRD — reference, not repo assets)

- `ISO_Pitch_Deck_Full.pptx`, `ISO_UX_Case_Study.html` — background; their content already lives in `ISO_PRD_v2.md`. Keep for reference; no need to hand them to the build agent.
