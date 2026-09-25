---
name: anime-game-pv
description: |
  Create a complete anime, comic, or game PV up to 15 seconds from a story idea, character art, scene or style references, titles, or audio. Delivers one coherent film; not for long MVs or live action.
trigger-words: [anime PV, game PV, comic PV, character PV, story teaser, battle teaser, gacha promo, event PV]
---

# Anime Comic / Game PV

Deliver one unified, watchable anime comic or game PV — not just analysis, storyboards, or prompts. The main agent owns material judgment, visual convergence, storyboarding, prompt compilation, the execution contract, and final acceptance; actual video generation goes through exactly one video execution batch. Create no Stage Execution Plan, and dispatch no downstream workers or downstream agent to rewrite confirmed video prompts.

## Production Model

| Entity | Definition |
| --- | --- |
| `Candidate Ref Capsule` | A candidate material contribution from media analysis; it describes possible roles only and holds no final style or execution authority. |
| `Style Source` | The original material, written direction, standalone style reference, or new agent direction the user confirms at the Style Authority Gate, deciding downstream visual production. |
| `Style Authority` | The single style authority that actually enters video prompts; its type may only be `existing_asset` or `generated_asset`. A user's written direction or the internal visual system may become the `style_source`, but on paths requiring a generated visual authority image they may not directly impersonate the final `style_authority`. |
| `Palette Authority` | The color contract entering the visual authority image and video prompts. The internal default visual path consists of black-and-white structure, one high-purity theme color, and optionally a minimal accent; other styles lock per the user's or the authoritative style source's palette without forced monochrome. |
| `Visual Artifact Type` | The actual pictorial form of a newly generated visual authority image. Concrete types apply only when `style_authority_kind=generated_asset`; direct reuse of existing material must be `not_applicable`. |
| `Render Ref Capsule` | The material contract actually entering video generation, with non-empty `roles`, positive contribution boundaries, and real paths. |
| `Panel` | A production unit for one time point or state in the semantic storyboard, used to confirm composition, action progress, and continuity. |
| `Logical Shot` | One continuous narrative span within the Master Timeline containing one or more Panels; it is a prompt chapter, not an independent video asset. |
| `Master Timeline` | The single complete generation plan containing all Logical Shots. |
| `Storyboard Preview` | An optional nine-grid derived from the current semantic storyboard. When present it aids prompts for composition, action phases, and shot hand-offs; it is neither a character/style authority nor a video reference slot. |
| `Storyboard Package` | One complete reviewable storyboard version: `storyboard_review.md`, all Panels, Logical Shots, the Master Timeline, and the Storyboard Preview when the user chose to view one. |
| `Storyboard Approval` | The user's approval receipt for the current Storyboard Package via a real confirmation card; it must bind `storyboard_revision`, plus `preview_revision` when a nine-grid exists. This approval also authorizes prompt compilation and direct generation after preflight passes. |
| `Render Contract` | The executable contract of one full generation; draft locks capabilities and the plan first, then locked locks identity, the single style and palette authority, actual reference slots, execution settings, prompt budget, and final file count. |
| `Render Attempt` | One confirmed Render Contract, one preflight-passing complete prompt, one video execution batch, and one complete candidate video. |
| `Final Video` | The Render Attempt that passes checks and is selected; it replaces earlier candidates instead of being stitched to them. |

The production topology is fixed: silent intake → production route and identity confirmation → Style Authority Gate → color direction and reference processing → visual authority decision → Render Contract draft → the necessary visual authority image and single `style_authority` → locked Render Contract → Panels → Logical Shots → Master Timeline → optional nine-grid → full Storyboard Package confirmation → `final_video_prompt` compilation and preflight → one complete Render Attempt. `production_route` records the user's choice and is never rewritten; whether a visual authority image must be generated derives independently via `requires_visual_authority_asset`. Every Render Attempt always produces one complete candidate video; multiple independent final films, durations over 15 seconds, or cross-video continuity escalate to a workflow.

## Interaction Contract

Build `intake_state` from the user's words, real attachments, and canvas assets before asking about missing decisions. Record at least `production_route / identity_source / has_valid_image_asset / style_candidates / style_source / style_authority / style_authority_kind / visual_policy / default_editorial_active / dominant_theme_color / accent_color / accent_policy / character_palette_policy / palette_authority / saturation_policy / reference_processing / requires_visual_authority_asset / visual_artifact_type / visual_authority_revision / visual_authority_status / narrative_focus / duration / aspect_ratio / audio_plan / audio_drive / storyboard_revision / preview_revision / storyboard_status / prompt_status`. Identity, specs, and audio information the user has stated or the material directly proves must be inherited, never re-asked; the style direction is a mandatory confirmation and may never be silently locked from text or attachments alone.

`visual_authority_status` allows only `not_applicable | pending | approved`; `storyboard_status` and `prompt_status` allow only `empty | pending | approved`. A newly generated visual authority image or Storyboard Package is `pending` on first creation or content change. After compiling the prompt from the approved Storyboard Package set `prompt_status=pending`; after preflight passes set it to `approved` and dispatch directly. Later artifacts can never retroactively substitute an earlier state's approval.

Execution order is fixed: silent intake → with material, complete media analysis and candidate Ref Capsules → Style Authority Gate confirms `style_source` → resolve the color contract → the internal default visual path confirms theme color, optional accent, and applicable reference processing in order → derive `style_authority_kind / requires_visual_authority_asset / visual_artifact_type` from the visual decision matrix → confirm remaining specs → generate and confirm the necessary visual authority image per path → lock the single `style_authority` and Render Contract → complete and confirm the Storyboard Package → compile and preflight the prompt → generate directly. No stage may promote a candidate source to final style authority early, nor skip a prior artifact's approval.

Downstream invalidation is fixed:

1. A change in `style_source` or `visual_policy`: invalidates palette, reference processing, visual authority, Render Contract, and Storyboard Approval, and sets `prompt_status=pending`.
2. A change in palette, accent duty, or `reference_processing`: with a generated authority image, invalidates the current `visual_authority_revision`; regardless of authority type, invalidates Render Contract and Storyboard Approval, and sets `prompt_status=pending`.
3. A change in the visual authority asset, type, or actual binding: invalidates Render Contract and Storyboard Approval, and sets `prompt_status=pending`.
4. A change in Panels, Logical Shots, or the Master Timeline: forms a new `storyboard_revision`; a nine-grid change forms a new `preview_revision`. Either invalidates Storyboard Approval and sets `prompt_status=pending`.
5. Changes only to models, legal parameters, reference slots, or prompt wording that leave storyboard semantics intact: update only the Render Contract or set `prompt_status=pending`, without rolling back visuals or storyboard.

Every step needing user selection, confirmation, or generation approval must use a real confirmation card. Plain text may only explain conclusions, describe impact, or request uploads of chosen material; never list numbered options in ordinary replies, never substitute "reply 1/2/3" or "I'll continue unless you object" for a Question Window, and never continue generating without the corresponding confirmation. Question titles, options, notes, and recommendation phrasing all follow the runtime-injected `working_language`; mark a recommendation only with a clear basis, in that language's natural phrasing. `default_editorial_active`, Editorial, internal visual system names, internal paths, Skill names, and hand-off processes must never be shown to users. Storyboard confirmation is the final confirmation gate before execution; after the user confirms it, compile the prompt, complete preflight, and dispatch directly. Later changes to storyboard, style, or reference processing return to the matching existing confirmation; other explicit changes are updated and execution continues. When a required confirmation card is cancelled, errors, or has no valid result, stop at the current gate.

### Silent intake

Before the first question, automatically judge: delivery intent; character/scene/style/layout/action or reference videos; audio; fixed IP and named characters; duration; aspect ratio; platform; visual directions in the user's words; and conflicts among similar references. Only truly existing, readable, task-relevant image attachments or canvas image assets may set `has_valid_image_asset=true`; text descriptions, videos, audio, failed placeholders, or planned but ungenerated images never substitute. Analysis results only form `subject | scene | style | layout | action | audio` candidate contributions: character images, standing art, and turnarounds default to `subject` candidates, standalone style images to `style` candidates, and other material per observable content; no material becomes the final `style_authority` before user confirmation.

A fixed IP directly affects identity judgment only, never automatically the final style:

1. With a fixed IP but no named character, ask only via a single-choice confirmation card allowing free input which character, or whether to make an ensemble piece.
2. With named characters, an ensemble, or original characters, lock `identity_source` first, but still confirm through the Style Authority Gate below whether to inherit the original work's, the attachments', or another visual direction.
3. When the user explicitly allows heavy redesign of the character, record a `reinterpret` candidate; the actual visual source is still confirmed at the Style Authority Gate.

### Production route and style-source decisions

When the production method is unclear, ask "How would you like to start this time?":

| Single-choice option | User-facing note | Internal path |
| --- | --- | --- |
| Produce from existing material | Make the PV directly from existing characters and references | `direct_pv` |
| Establish the key visual first | Finish character and visual design, confirm it, then make the PV | `visual_first` |
| Recreate a reference video | Upload a reference video and recreate its shots, action, and rhythm | stop this Skill, hand over to `video-deconstruct` |

The question window shows only the options and user-facing notes — never internal paths, Skill names, or hand-off processes. When the user already explicitly wants shot-by-shot recreation, hand over directly without showing this question; when the reference video is only for rhythm, camera, transitions, or medium, stay in this Skill. When the chosen path lacks necessary material, state what is needed and wait for uploads; analyze automatically on arrival without re-asking the method. `production_route` never changes once confirmed; even when a visual authority image must be generated first, describe it only as necessary preparation of the current route, never rewriting the user's choice.

After material analysis, every task must run exactly one single-choice Style Authority Gate. Even when the user has described a style, present that description as a recommended candidate for confirmation; never skip because of a fixed IP, character image, complete illustration, style image, or explicit style words. Questions and options are generated dynamically from actual material:

| Availability condition | Example single-choice option | Internal result |
| --- | --- | --- |
| Character material exists | Reference both the character and the original style | The chosen material becomes the `style_source`, `visual_policy=faithful`. |
| Character material exists | Keep only the character identity and rebuild the visual expression | The user's later direction or the internal system becomes the `style_source`; the original material locks identity only, `visual_policy=identity_locked_restyle`, generating and confirming the key visual first. |
| The user described a visual direction | Continue with the current visual direction | The user's description becomes the confirmed `style_source`; character material, if any, locks identity only. |
| Standalone style material exists | Let the style reference control the visuals | The chosen standalone material becomes the `style_source`. |
| No usable style source | Have the agent propose a new visual direction | The internal visual system becomes the `style_source`; identity material, if any, keeps the character identity. |
| Any situation | Use or add another style reference | Wait for the user to specify or upload material; do not continue before confirmation. |
| Any situation | Redesign from the existing setting | Shown only when the user explicitly allows changing the character design, `visual_policy=reinterpret`. |

Show only the 2–4 genuinely executable options each time; never pad with paths lacking material support. With multiple candidate styles, options must state concrete sources or allow free input; keep only `style_candidates` before confirmation, and the answer establishes exactly one `style_source`. Only when the user picks the agent's new direction, or picks rebuilding the visual expression without giving another textual/pictorial style source, set `default_editorial_active=true` internally; that internal name and fixed grammar are never externalized as "the only built-in style". Faithful original style, user written directions, and standalone style references all set it false.

The gate's answer decides the path: original-work or original-material visuals give `faithful`; a written direction, standalone style material, or the agent's new direction with existing identity material gives `identity_locked_restyle`; without identity material, `original_direction`; permission to change the design gives `reinterpret`. Then read the single visual decision matrix in `references/visual-inputs.md` to derive `style_authority_kind / requires_visual_authority_asset / visual_artifact_type`. Direct reuse of existing production-ready material uses `style_authority_kind=existing_asset / requires_visual_authority_asset=false / visual_artifact_type=not_applicable`; carrier cleanup, style conversion, identity fusion, character redesign, or absence of a directly usable image uses `generated_asset / true / the matching concrete type`.

Character reveal, awakening, battle, worldview, or gacha goals are inferred from the user's words first; only when the promotional focus is genuinely unclear ask via single-choice confirmation card among "character charm and emotion / skills, action, and battle / story, relationships, and worldview". One call contains at most three mutually independent unresolved questions, each single-choice with `multiple: true` forbidden; the internal default path's theme color, accent, and reference processing depend on the confirmed style and must be asked sequentially after the Style Authority Gate returns.

### Color direction, reference processing, and video specs

After the Style Authority Gate returns, first determine whether the internal default visual path is active. The following questions show only actual colors and processing results — never Editorial or any internal style name:

- **Theme color question.** Confirm `dominant_theme_color` alone first, offering 3 high-purity, high-saturation theme directions with clearly different narrative moods, allowing free input. The theme color governs environment fields, MG graphics, core props/motifs, text/UI emphasis, and transition carriers; the character's original image colors never decide this answer automatically.
- **Accent color question.** After the theme color, ask `accent_color` separately; it must include a "no accent" option plus 2–3 candidates each carrying a single semantic duty, e.g. danger, supernatural fracture, target lock, identity difference, or impact sparks. Choosing an accent also locks the single `accent_role`; free input is allowed, and when the user gives a color without a duty, follow up on the duty.
- **Internal color budget.** Build `palette_authority={ black, white, optional_neutral_gray, dominant_theme_color, accent_color|null }`. The theme color stays within one hue family, varying lightness without drifting to adjacent rainbow hues; the accent stays under 5% per frame and 3% averaged over the film, may not become a background, a full outfit, a large prop, a city lighting system, or a persistent rim light, and should vanish for long stretches before reappearing at its single semantic node.
- **Other style paths.** Faithful, user written directions, or standalone style references build `palette_authority` from the confirmed source's palette; ask further only on source conflicts, user-requested recolors, or an indeterminable palette — never impose the black-white single-theme budget.

On the internal default path with character images present, after palette confirmation ask the reference processing via a single-choice confirmation card:

- **Keep the character's original palette**: identity and original colors stay stable, the theme color governs only environment and MG; when needed, generate a carrier-cleaned anime-screenshot reference without passing the original background, layout, or composition to video.
- **Desaturated flat-color retention**: keep the character's color logic but lower saturation and flatten to solid blocks, then generate an anime-screenshot reference.
- **Full black-white-theme conversion**: move the character into black, white, optional neutral gray, and the confirmed theme color; keep only user-specified local colors confined to the specified areas.

Record `reference_processing=preserve_original_palette | flattened_palette | strict_single_hue` and the matching `character_palette_policy`. When the user already specified the processing, inherit it; never recolor silently. After palette and processing, ask only the still-unclear video specs:

- **Duration**: `15 s (recommended) / 10 s / 6 s / other`. Inherit a given duration; default to recommending 15 seconds.
- **Aspect ratio**: infer from the platform or the user's words; when uninferable ask `9:16 vertical / 16:9 horizontal / 1:1 square`, ordering the recommendation by publishing scenario.
- **Sound**: with uploaded audio of unstated purpose, ask "How should this audio participate?", offering `reference for music rhythm / reference for lines or vocals / analyze rhythm and mood only / do not use this audio`. The first two pass real audio to the selected video model; the third uses analysis only with model-native sound; the fourth returns to the no-user-audio path; explicit beat-sync, lip-sync, or mood purposes are inherited. Without audio and without user preference, ask `model-native sound (recommended) / silent video / reserve space for post BGM`; reserving space means no BGM is generated while ambience and action sounds keep the rhythm.

The theme color, accent, and reference-processing questions must be called in dependency order, never merged with each other or with video specs; skip the processing question without character images. One spec confirmation card still holds at most three independent questions; lock palette and processing before asking duration, aspect ratio, and sound — never fuse these decisions into combo options.

Durations over 15 seconds use a dedicated conditional window offering only "compress to within 15 seconds" and "switch to the long-video / full storyboard flow". Never split into multiple videos to stitch inside this Skill. When the user wants on-screen text without exact wording, request the exact text separately — never re-ask an already-clear "need text?".

### Visual confirmation and generation authorization

1. With `style_authority_kind=generated_asset`, after the visual authority image is generated and checked set `visual_authority_status=pending` and offer via real confirmation card: continue with the current visual reference, adjust the style expression, adjust the palette, adjust the reference processing, adjust character consistency. On confirmation record `visual_authority_revision` and set approved; the existing_asset path sets `visual_authority_status=not_applicable / visual_authority_revision=not_applicable`.
2. After completing all Panels, Logical Shots, the Master Timeline, and `storyboard_review.md`, set `storyboard_status=pending` and show the storyboard confirmation card: confirm the storyboard and generate; view the nine-grid preview; adjust narrative and rhythm; adjust characters and action; adjust visuals and sound. On "view preview", derive the nine-grid from the current semantic storyboard and return to the same gate; the final confirmation binds the semantic storyboard, the current locked Render Contract, and `preview_revision` when present.
3. When `storyboard_status=approved` and its receipt binds the current Storyboard Package and Render Contract, compile the full Markdown prompt. Compilation translates confirmed content into an executable prompt without adding creative decisions. After the prompt and Render Contract pass preflight, set `prompt_status=approved` and dispatch directly.

Modify only the user's chosen scope each time, re-presenting affected content per the unified invalidation rules. Choosing style, color, or reference-binding adjustments returns to the matching decision stage, regenerating the visual authority image as needed, then updating the Render Contract and Storyboard Package. A change to Panels, Logical Shots, the Master Timeline, storyboard text, or a generated nine-grid forms a new Storyboard Package revision and shows the storyboard confirmation card again; other execution-information changes follow the user's new request and continue dispatch after a fresh preflight.

## 1. Determine routing and delivery scope

"Manhwa PV, comic PV, anime story PV, character/ensemble PV" are clear positive signals for this Skill. Never override a 2D comic/anime subject into the film-title Skill just because the user also says "cinematic PV, teaser, trailer".

Build the brief: whether the goal is character/ensemble story reveal, awakening, battle teaser, worldview showcase, or gacha/event promotion; record duration, aspect ratio, exact title text, supporting assets, and `production_route / identity_source / has_valid_image_asset / style_candidates / style_source / style_authority / style_authority_kind / visual_policy / default_editorial_active / dominant_theme_color / accent_color / accent_policy / character_palette_policy / palette_authority / saturation_policy / reference_processing / requires_visual_authority_asset / visual_artifact_type / visual_authority_revision / visual_authority_status / narrative_focus / audio_plan / audio_drive`. All fields are inferred or confirmed per the Interaction Contract — never reassembled into one combined multi-choice form.

These intents leave this Skill:

| User intent | Destination |
| --- | --- |
| Title, cast, Opening Title, Opening Credits, or title effects as the subject | `cinematic-title-sequence` |
| Still-image MADs, lyric text, or kinetic type as the subject | `h3-visual-design` or the matching Skill |
| Music, rap, fashion performance, or MV as the main narrative | `cool-music-video` |
| Generic motion-design MG | `h3-visual-design` or the matching Skill |
| Brand tech montage or system visuals as the subject | `brand-ad` |
| Shot-by-shot deconstruction and recreation of a reference video | `video-deconstruct` |
| Live-action ads, 3D anime, long narratives, multiple independent films, or cross-video continuity | the matching workflow |

A reference video used only for rhythm, camera, transitions, or medium in an original anime PV stays in this Skill, inheriting none of its characters, world, brand, or text.

## 2. Establish material, identity, style source, and color strategy

1. Analyze relevant images, videos, and audio with media analysis, first building a candidate Ref Capsule per item: `{ id, candidate_roles, contributes, take }`. `candidate_roles` is a set from `subject | scene | style | layout | action | audio`; analysis results never substitute for the Style Authority Gate.
2. Standing art, character images, and turnarounds default to high-weight identity references only: locking face, hair, build, wardrobe, accessories, weapons, marks, headcount, and relationships; the final video need not show all views, and their own linework, coloring, or composition grants no automatic `style` authority.
3. Scene candidates lock space and world only; style candidates contribute medium, material, color, and motion language only; layout candidates contribute hierarchy, grids, occlusion, slicing, and lock-up logic only; action candidates contribute action-camera relationships only. Only after explicit selection at the Style Authority Gate does material convert from candidate contribution to a final `style` role.
4. The Style Authority Gate establishes only `style_source`, `visual_policy`, and `default_editorial_active`, never final material roles or the key-visual form in advance. After palette and processing, derive `style_authority_kind / requires_visual_authority_asset / visual_artifact_type` uniformly via the decision matrix in `references/visual-inputs.md`; when a visual authority image must be generated, unconverted character material and the new artifact may not jointly act as multiple video style authorities.

After `style_source` is confirmed, build the color authority per path:

1. With `default_editorial_active=true`, complete the gates strictly as `dominant_theme_color → accent_color|null → accent_policy → palette_authority`. The accent is not a second primary; default to recommending no accent, enabling one only when the narrative needs a single semantic differential. The UI shows only actual color directions and duties — never internal system names.
2. `faithful`, user written directions, or standalone style references lock the palette per the confirmed source; override only on the user's explicit recolor request — never force black-white single-theme.
3. Character original colors and the film's editorial palette are managed separately. `character_palette_policy` follows the processing answer; extra character colors stay confined to identity areas, never spreading into backgrounds, MG, UI, or transitions.

The internal default path's concrete visual grammar, color budget, character-palette handling, and artifact acceptance take `references/visual-inputs.md` as the sole source of truth; this file only decides when to enter that path and which confirmations must complete, without duplicating visual details.

## 3. Lock the Render Contract and visual references

Check the current capability summary first, preferring the available default video path. After the model route is selected, record a human-readable Render Contract draft covering approval state, identity and style authority, palette, reference roles, duration, aspect ratio, audio, prompt budget, and final file count. Do not copy private implementation fields into the document.

- The draft locks `style_source`, `visual_policy`, `default_editorial_active`, `reference_processing`, `style_authority_kind`, `requires_visual_authority_asset`, `visual_artifact_type`, and model capabilities. The `generated_asset` path must mark `style_authority=pending / visual_authority_status=pending`, writing the actual asset and setting approved only after the user confirms the revision; the `existing_asset` path writes the confirmed material directly with `visual_authority_status=not_applicable / visual_artifact_type=not_applicable`. A locked Render Contract allows no pending fields.
- The internal default path must lock `dominant_theme_color`, nullable `accent_color`, `accent_policy`, `character_palette_policy`, `palette_authority`, and `saturation_policy`; choosing no accent uses explicit `accent_color=none / accent_policy=none`, not pending. Other styles mark inapplicable fields `not_applicable` and lock their source palettes. All applicable fields stay unchanged through the visual authority image and the final prompt, but internal field names never enter user-visible questions, summaries, or prompt headings.
- Model settings must stay within the ranges advertised by the current capability summary; common delivery constraints remain separate from model-specific settings.
- The draft's `reference_slots` record only planned material types, order, counts, duration limits, existing identity asset paths, and pending anchors; final `roles` and actual paths enter the Render Ref Capsules after the key visual/anchors are confirmed. Before prompt compilation all slots must be fully locked; candidate roles, unconfirmed styles, and materials without legal slots may not masquerade as participants.
- `prompt_budget` resolves by the unified priority: current capability summary → the model guidance in `references/prompt-rules.md` → the conservative fallback stated there. When neither source exposes a prompt limit, stop before compilation and request capability evidence; never guess a budget or trim only after a failed generation.
- `final_output_count` is fixed at `1` in this Skill; internal Panels and Logical Shots never increase the file count.
- The Render Contract locks execution conditions only, never substituting for Storyboard Approval. Even when locked, `final_video_prompt` may not be compiled while the current Storyboard Package is unlanded or unapproved.

Read `references/visual-inputs.md` and, per the single decision matrix, decide between reusing an existing authority asset and generating a visual authority image of some type, then choose actual video references within the draft's permitted modes and slots; never silently drop material to force a mode. The `generated_asset` path must complete visual authority confirmation before filling the single `style_authority`, Render Ref Capsules, actual paths, and reference slots; the `existing_asset` path may not fake a generative `visual_artifact_type`. Only a locked Render Contract may enter prompt compilation; changing style source, visual form, palette, processing, model, mode, sound, bindings, or parameters returns to the matching stage per the unified invalidation rules.

Without a valid image asset that can directly enter video references, a visual authority image consistent with the current style path must be generated — no imageless direct generation. With `requires_visual_authority_asset=false`, reuse only confirmed production-ready material and keep the single `style_authority`.
- Only when the user's words explicitly demand a precise opening, precise ending, or a specified-time frame, passively validate and use the model's supported time-anchoring modes; never proactively introduce, recommend, or ask about first-frame, last-frame, first-and-last, or keyframe locking, and never steer users to crop Panels from the preview as video references.

When a visual authority image is needed, query image capabilities first, then compile the image prompt per the shared Visual Authority Contract in `references/visual-inputs.md` and the current `visual_artifact_type`, using image generation to realize the authoritative identity contribution, `style_source`, applicable palette fields, `reference_processing`, and pictorial form. The image prompt must separate identity that must hold, expression that may adapt, and carrier information forbidden to inherit; never use "optimize the original", "keep the original composition", or path-agnostic "generate a promo poster/KV" phrasing. Generating or overwriting the asset creates a new `visual_authority_revision` and sets `visual_authority_status=pending`.

After generation, check with media analysis against the current `visual_artifact_type`. All paths must hold identity boundaries and strip non-inheritable carrier pollution; directed and fused-style paths must hit the chosen style; redesigns must stay within the allowed variation; the internal default path must pass the single-theme budget, accent budget, pure-white/near-white skin, hard black shadows, flat color blocks, low-information background, and anime-screenshot-feel checks, while being neither a mere recolor of the original nor a polished promo poster, turnaround, or final storyboard. Failures never get promoted to `style_authority`; fix the matching contract within the same visual stage and regenerate.

After passing, land it on the canvas and offer via confirmation card: "continue with the current visual reference / adjust the style expression / adjust the palette / adjust the reference processing / adjust character consistency". On confirmation of the current revision set `visual_authority_status=approved`; adjustment choices return to the matching production layer, never collapsing every issue into a poster redo. Never generate separate visual references per Logical Shot.

After the key visual and anchors are confirmed, normalize all material actually entering video generation into Render Ref Capsules: `{ id, roles, contributes, take }`. `roles` is a non-empty subset of `subject | scene | style | layout | action | audio`. Under `faithful` without a new key visual, the confirmed original character material may take `[subject, style]`; with a new key visual, original character material keeps `[subject]` only and the confirmed key visual takes `[style]`; a standalone style image already absorbed by the key visual is not passed again as a second style authority. Other materials carry their confirmed scene, layout, action, or audio roles, keeping exactly one `style_authority`. Only after these conversions and actual paths are complete may the Render Contract become locked.

## 4. Produce Panels, Logical Shots, and the Master Timeline

Produce the semantic storyboard first by default — no nine-grid. Each Panel records in `storyboard_review.md` its time point or span, framing, subject and action state, fore/mid/background, camera state, text/graphic events, transition basis, sound cues, and continuity inherited from the previous Panel. Panels are intermediate production units, never independent video assets, and never enter video references directly.

Aggregate completed Panels into Logical Shots. Each records: time range, narrative duty, contained Panels, start state, main action, end state, camera axis, light, environment, transition interface, text state, and sound span. Adjacent Panels may jointly describe one Logical Shot's continuous development.

Arrange all Logical Shots into one Master Timeline. The narrative may use a "hook → subject/space establishment → action or emotional development → climax → stable lock-up" arc without preset genre templates; structure must come from the user's goals and material.

Complete the Storyboard Package in this fixed order:

1. Create or overwrite the single `storyboard_review.md` with writing to canvas, writing the full brief, material contributions, `style_source → style_authority`, `visual_artifact_type`, palette authority, saturation policy, reference processing, sound plan, all Panels, Logical Shot groupings, and a gapless Master Timeline.
2. Verify the complete `storyboard_review.md` is visible on the canvas; never let `final_video_prompt.md` stand in as the storyboard document.
3. Form a new `storyboard_revision` from the current storyboard text node and its semantics, set `storyboard_status=pending`. Before any nine-grid exists record `preview_revision=none`.
4. Call the storyboard confirmation card offering "confirm the storyboard and generate / view the nine-grid preview / adjust narrative and rhythm / adjust characters and action / adjust visuals and sound". Storyboard Approval binds the current `storyboard_revision`, locked Render Contract, and `preview_revision` when present; on adjustment requests, overwrite the artifacts, form a new revision, and wait again.

Only when the user picks "view the nine-grid preview" derive one nine-grid from the current semantic storyboard, naming the node `《project name》nine-grid storyboard preview`, and state plainly: "The nine-grid confirms shot order, action beats, and compositional direction; after confirmation its executable composition and action information is translated into the video prompt, but the nine-grid image itself will not serve as a video reference. Characters and style stay consistent via the confirmed visual authority, and motion and shot transitions follow the master timeline." After the preview lands, record a new `preview_revision`, keep `storyboard_status=pending`, and immediately return the same storyboard-confirmation confirmation card. When the user wants preview changes, first modify the matching Panels, Logical Shots, or Master Timeline, form a new `storyboard_revision`, then re-derive the preview from the new semantics; never edit only the preview image. Regenerating the nine-grid yields a new `preview_revision`, invalidating old Storyboard Approval and setting `prompt_status=pending`.

The storyboard confirmation card ends this stage. Without a valid confirmation bound to the current revision, never enter prompt compilation, never create or overwrite `final_video_prompt.md`, and never treat replies like "storyboard done" or "compiling the prompt next" as implicit approval.

## 5. Compile and preflight from the approved Storyboard Package

Before entering, verify: `storyboard_status=approved`; the approval's `storyboard_revision` matches the canvas semantics; with a nine-grid, its bound `preview_revision` matches the canvas preview; the Render Contract is locked. Any failure returns to stage 4 without creating a prompt. Then read `references/prompt-rules.md` and `references/audio-direction.md`, compiling the single `final_video_prompt` from the approved Storyboard Package, obeying the Render Contract's `prompt_budget` from the start — never write an unbounded version first and compress after failures. The prompt contains in order:

1. Duration, aspect ratio, mode, and the single final-video goal;
2. Material references and each Ref Capsule's positive contribution boundaries;
3. Characters, scenes, the single style authority, visual artifact form, palette authority, saturation policy, reference processing, and text continuity locks;
4. With a nine-grid, its composition, action phases, framing, and shot hand-offs — consistent with the semantic storyboard — translated into "storyboard sequence constraints"; no image reference paths, no image slots;
5. Every Logical Shot's start state, action, end state, and hand-off to the next within the Master Timeline;
6. Real reference relations for the user's words, graphic treatment, native sound, or confirmed audio;
7. Final lock-up and stable hold.

Panels never map one-to-one to prompt chapters nor get copied grid-by-grid; Logical Shots are the prompt's time chapters. The nine-grid only supplements composition and action phases consistent with the approved semantics — never adding, removing, or rewriting shot duties; on conflict, stop compiling and return to the storyboard stage to reconcile. Motion must be written as observable camera paths, subject actions, layer changes, physical transitions, and sound events — never "cinematic, stunning, smooth" in place of change over time.

The `final_video_prompt`'s document title, section headings, Logical Shot narrative names, and body all use the runtime-injected `working_language`; model IDs, mode names, material tags, file paths, and the user's exact text stay verbatim. The prompt must keep the semantic chapter order and Logical Shot sectioning defined by `references/prompt-rules.md`, never flattened into one paragraph or a chat summary.

Complete executable compilation in this order:

1. Compile the candidate prompt and create or overwrite the single `final_video_prompt.md` document node via writing to canvas; the body must be character-identical to the prompt to be dispatched.
2. Count the final prompt characters and compare them exactly with the Render Contract's `prompt_budget`.
3. When over budget, apply the deterministic convergence order in `references/prompt-rules.md` — removing duplicate identity, duplicate style, duplicate negatives, and information-free shot phrasing — overwrite the same document and recount the final prompt; never sacrifice timeline coverage, action causality, material bindings, or sound events.
4. Run the unified preflight on this same prompt and Render Contract: Style Authority Gate, single style and palette authority, prompt length, model parameter whitelist, model and mode, final material roles, slots/counts/durations, real paths, audio plan, duration, aspect ratio, resolution, final file count, and unresolved placeholders.
5. Any failure returns to the matching contract, storyboard, or compilation stage without creating a Render Attempt. After a full pass, set `prompt_status=approved` and dispatch directly.

After prompt compilation and before dispatch, if the user actively requests a change, first judge whether the approved storyboard semantics change: changes to shots, time ranges, narrative duties, actions, transitions, composition, sound events, or the ending state return to stage 4, form a new `storyboard_revision`, and re-pass the storyboard gate; semantics-preserving wording compression, legal parameter, model, or reference-slot fixes update the Render Contract or the same `final_video_prompt.md`, then re-preflight and continue dispatch.

## 6. Create, check, and repair Render Attempts

Only when `storyboard_status=approved`, `prompt_status=approved`, and Storyboard Approval still binds the current artifacts, hand the confirmed Render Contract and `final_video_prompt.md` as an immutable execution brief to one video generation. The execution layer verifies the brief, then submits the character-identical prompt with the confirmed material order and settings. It may not summarize, translate, rewrite, compress, add settings, switch models, change bindings, flatten Markdown structure, or split Logical Shots into separate video tasks.

Failures flow back by production stage:

1. Pre-submit discovery of illegal parameters, length, mode, material, or paths: return to Render Contract / prompt compilation; create no Render Attempt and start no generation.
2. Fixes requiring changes to style authority, artifact form, palette, processing, or saturation: return to the matching Style Authority Gate, palette, or processing confirmation, regenerate the visual authority image as needed, then update the Master Timeline, Render Contract, prompt, preflight, and affected gates.
3. Fixes changing shots, timeline, action, transitions, composition, sound events, or the ending: return to the Storyboard Package, form a new revision, re-pass the storyboard gate, then recompile; semantics-preserving wording, parameter, model, or slot fixes let the main agent update the contract and the same prompt document, re-preflight, and continue execution.
4. Generation succeeded but character, style, action, rhythm, sound, or transition quality fails without changing confirmed authorities: enter the full-regeneration flow below.

No failure may be handled by silently dropping parameters, ad-hoc prompt compression, material substitution, or model switching; and never auto-retry around re-confirmation.

After generation, check with media analysis: character identity, silhouettes, consistency with the confirmed `style_authority`, `palette_authority` and `saturation_policy`, the internal path's theme/accent budgets and character palette policy, action readability, text, shot hand-offs, transitions, rhythm, sound relations, the final hold, and artifacts.

The default repair strategy is whole-piece regeneration:

1. Locate the failure within the Master Timeline.
2. Modify the matching Panels, Logical Shots, continuity locks, or timeline instructions, overwriting the Storyboard Package.
3. Form a new `storyboard_revision` and re-pass the storyboard gate.
4. Recompile the full `final_video_prompt` from the approved storyboard; update the Render Contract when execution conditions changed.
5. Re-run the unified preflight and dispatch directly after it passes.
6. Create a new complete Render Attempt, recheck the full video, and replace the old candidate with the passing one.

Never generate partial video patches, never stitch repaired shots into old video, never resubmit failed calls verbatim, and never silently switch models or drop reference material.

## 7. Finalize and deliver

Verify duration, aspect ratio, final file count, character continuity, the single style authority, artifact form, palette authority and saturation policy, the internal path's color budget, text accuracy, action completeness, Logical Shot hand-offs, sound sources, and the final hold. Produce no subtitles unless explicitly requested.

Export exactly one final video. The nine-grid preview, visual authority image, title cards, or final prompt are delivered as auxiliary assets only on request. The final reply provides the film path or canvas artifact, duration/aspect ratio, a reference-contribution summary, the sound source, and one actionable next-round improvement suggestion.
