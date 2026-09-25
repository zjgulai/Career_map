---
name: shopify-theme-craft
displayName: Shopify Theme Craft
description: |
  Theme decoration craft — banner / hero / announcement bar conventions,
  category-to-style strategy, style-pack section recipes, external theme-source
  intake, template/demo sanitization, Horizon-theme Liquid section patterns,
  targeted theme-file discovery/upsert workflow, local theme-dev visual iteration,
  full-tree exceptions and dev-preview validation hooks, plus a
  non-theme-surface image-aspect picker.
  Main Agent loads this Skill before preparing a theme-change preview or
  delegating a theme-file write; it owns the business handoff and image decisions.
  The `shopify-theme-decorator` sub-agent consumes the same handoff contract and
  owns implementation. Main Agent manages the bounded local preview process,
  uses the aspect picker and reviews decorator reports.
triggers: []
---

# Theme craft routing

The `shopify-theme-decorator` owns implementation on unpublished themes. Main Agent reads [theme-handoff.md](references/theme-handoff.md) before the first merchant-facing theme-change preview or delegation; the decorator reads the same contract before preflight. It defines confirmed business intent, language and image boundaries, and each role's completion responsibilities. For local preview, Main owns the managed process and synchronizes only the decorator's authorized directory under [dev-preview-craft.md §4](references/dev-preview-craft.md#4-local-development-preview-and-full-tree-workflows); file authoring and final remote read-back remain with the decorator.

Before an official Shopify helper or CLI call, load `shopify-execution` for the Accio execution contract. A delegated executor inherits the prepared connection and returns auth failures to Main Agent; loading an execution Skill does not authorize another connection or scope probe. Load only implementation references needed by the current surfaces:

| Task | Reference |
|---|---|
| Theme-file discovery, planned writes, checksum/render checks, local `theme dev` preview, or a justified full-tree workflow | [dev-preview-craft.md](references/dev-preview-craft.md) |
| Banner, hero, image-with-text, slideshow, or theme-image aspect evidence | [banner-playbook.md](references/banner-playbook.md) |
| Category/style choice or storefront redesign | [theme-style-catalog.md](references/theme-style-catalog.md) |
| Stage 3 / whole-store implementation recipes | [section-recipes.md](references/section-recipes.md) |
| GitHub/third-party theme source, before clone/install/adaptation | [theme-source-intake.md](references/theme-source-intake.md) |
| Fresh theme base, external source, or major template changes | [template-sanitizer.md](references/template-sanitizer.md) |
| Announcement bar placement | [announcement-bar.md](references/announcement-bar.md) |
| Picker/locked-file rejection, template wiring/cache, layout or image-ratio failures | [theme-write-pitfalls.md](references/theme-write-pitfalls.md) |
| Horizon collection-card media normalization | [liquid-section-conventions.md](references/liquid-section-conventions.md) |

The decorator chooses the implementation from confirmed business intent and actual theme files. External inspiration is not installation authorization. Main Agent reviews the handoff and coordinates any missing assets or fixes. `shopify-store-auditor` performs the scoped render/visual audit under `shopify-storefront-validate`; Main Agent reviews its evidence and owns publication approval and the final completion decision.

## Non-theme-surface aspect picker (main Agent)

> For **theme surfaces** (hero / image-banner / image-with-text / announcement /
> slideshow / mobile slot) the procedure is `references/banner-playbook.md` §2 —
> use that, not the table here. The table here covers product / collection /
> social / email images the main Agent generates directly without going through
> the theme-decorator sub-agent.

Before each `image_generate` call:

1. Identify the surface the image will sit on (product page main slot, collection card, IG square post, IG story, X card, email hero, etc.).
2. Pick `aspect_ratio` from the table (matches `image_generate`'s enum):

   | Surface | aspect_ratio | Evidence to state |
   |---|---|---|
   | Shopify product page main image (Dawn / Horizon default) | `1:1` | "product page main slot defaults to 1:1 square" |
   | Product gallery secondary slot | `1:1` or `4:5` | match the cover; do not mix |
   | Collection card thumbnail | `1:1` | "collection card thumbnail renders square" |
   | Lifestyle / scene shot for product gallery | `4:5` or `3:4` | "vertical lifestyle frame for mobile-first gallery" |
   | Social — IG feed post | `1:1` or `4:5` | platform default |
   | Social — IG story / Reels cover | `9:16` | platform default |
   | Social — X post image | `16:9` | platform default |
   | Email hero | `2:1` is unsupported by enum → use `16:9` and crop in email | platform default |
   | Anything not above | STOP — `ask_user` for the target surface, then map to the table. Do NOT default-guess. |

3. State the evidence in chat before the `image_generate` call, e.g. `surface: product page main slot → aspect_ratio = 1:1`. No evidence line → no `image_generate` call.

### When a `pending_image_generation` arrives from `shopify-theme-decorator`

Do NOT apply the table above — that sub-agent's `pending_image_generation`
payload tells you exactly what to do:

1. Read `surface_files_for_aspect_inference` and `grep` each file for `aspect-ratio:` / `min-height:` / `object-fit:` / explicit width×height.
2. Cross-check against `suggested_aspect_ratio` (the sub-agent's own inference).
3. If they agree, proceed; quote the file + matching CSS line as the evidence.
4. If they disagree, trust your re-derivation but log the disagreement in chat.
5. If `suggested_aspect_ratio` is `null`, the sub-agent saw no signals — `ask_user`.

Full signal→ratio table, slideshow handling, mobile slot pairing live in
`references/banner-playbook.md` §2.

Theme image approval, source and fidelity follow [theme-handoff.md](references/theme-handoff.md#theme-images); aspect evidence follows this Skill and the banner playbook. Product/social images retain their own domain approval and fidelity contracts; the shared product image procedure is `dtc-builder/references/image-discipline.md`. The aspect picker alone grants no image-generation or store-write permission.
