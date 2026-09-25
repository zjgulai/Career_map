---
name: precise-image-editing
description: >-
  Use when one or more existing images are authoritative and must remain mostly
  unchanged while making controlled edits to text/brand, subject attributes,
  elements/background/composition, multi-reference transfer, output dimensions,
  or repair/refinement. A localized edit wins even when the source is a product
  or platform asset. Do not use for new creative/product presentations,
  coordinated product image sets, or method-named crop/compress/rotate/format
  delivery; clarify vague “optimize” requests that do not identify an observable
  target.
---

# Precise Image Editing

Apply closed-scope changes to authoritative existing images while preserving identity, text, layout, and all untargeted regions. Resolve every input role, import any active upstream planning decisions, load the preservation contract and matched edit scene, then use the common execution contract in this file. Loading the required references is a hard precondition, not background reading — see Reference Load Contract.

## Boundary and Handoff

Use this skill when the requested final image keeps an existing source authoritative and changes one or more controlled targets:

- exact text/number/price/translation/logo/watermark/overlay content;
- subject color, material, texture, component/structure, hair, face, pose, or clothing;
- element addition/removal, cleanup, white/transparent or scene background, position, viewpoint, crop-like composition, or localized restaging;
- output pixel dimensions or canvas aspect ratio, absorbed by cropping or extending the background while the subject stays unchanged;
- cross-image replacement/compositing, template/layout transfer, or role-labeled multi-reference synthesis;
- explicit restoration, detail repair, clarity reconstruction, material/lighting cleanup, or other observable refinement that remains preservation-first.

Route elsewhere when the dominant outcome is:

| Observable condition | Route |
|---|---|
| New named-platform/listing/store/channel asset or coordinated commercial product image set | `platform-product-visuals` |
| New single commercial product presentation with no platform/set contract | `product-marketing-visuals` |
| New general scene, person/story, logo/brand layout, concept/space, or structured-information visual | `creative-image-generation` |
| Crop, trim, compress, rotate, or format conversion named as the method, with no target size or ratio | Hand off to a native delivery tool |
| “Optimize/refine/fix” without an observable target | Inspect the source and offer a defect shortlist; ask one clarification only when nothing observable can be recovered |

Boundary examples:

- “Change `6组` to `7组` on this Alibaba main image” → this skill.
- “Replace only this product photo's background” → this skill; “create a new generic lifestyle product image” → `product-marketing-visuals`.
- “Put the product from image 2 into image 1's template” → this skill after assigning roles.
- “Design a new logo” → `creative-image-generation`; “apply this supplied logo to this product” → this skill.
- “Make it 1600×1600 and under 2 MB without changing content” → PE6 for the 1600×1600 canvas, then native delivery for the 2 MB budget.
- “Resize this to 4:3” → this skill through PE6; “crop this to 4:3” → native crop.

### Mandatory Primary-Skill Gate

Apply this table from top to bottom **before** loading any scene. The first matching row is final.

| Priority | Observable request | Required action |
|---|---|---|
| 1 | Only crop/trim/compress/rotate/convert named as the method, with no content redraw and no target pixel size or aspect ratio | Stop and hand off to a native delivery tool |
| 2 | The requested change to an existing image is its output pixel size or canvas aspect ratio, with no new presentation and no content change | Execute in this skill through PE6, subject to its capability window |
| 3 | One or more authoritative images exist and the user requests a controlled observable edit/composite while preserving untargeted content | Execute in this skill—even if the source is an Amazon/Alibaba/platform/product image |
| 4 | The request creates a new named-platform/listing/store/channel asset or coordinated commercial product image set | Stop and hand off to `platform-product-visuals` |
| 5 | The request creates a new single commercial product presentation | Stop and hand off to `product-marketing-visuals` |
| 6 | The request creates a new general/people/brand/concept/structured visual | Stop and hand off to `creative-image-generation` |
| 7 | The request says only optimize/refine/fix | If any source is readable, load PE5, inspect it, and offer an observable defect shortlist; ask one open clarification only when no source is readable or no candidate defect is observable |

An image used only as an abstract style reference for a new visual does not make the task an edit. A product reference used to create a new image set is owned by `platform-product-visuals`; a product reference used for one new marketing presentation is owned by `product-marketing-visuals` unless the requested operation is a closed edit to the source. A coordinated set means outputs that divide roles under one shared layout or platform contract, such as hero plus detail plus scene; several independent same-operation edits to one authoritative source using user-supplied values are a batch inside this skill, one output per supplied value.

## Reference Load Contract

Resolve every reference path in this file against the directory containing this `SKILL.md`, so `references/preservation-contract.md` means `<this skill directory>/references/preservation-contract.md`.

The required load set for every task is:

1. `references/preservation-contract.md` — always, with no exception;
2. every PE reference matched by the scene router below;
3. `references/planning-handoff-contract.md` whenever an upstream system workflow or host agent has produced an output-specific plan, Plan Confirmation, ImageStory row, operation spec, style-anchor set, dependency node, or other planning artifact for the current output.

Read each required file in full during the current turn before constructing any prompt. Do not work from a summary, a remembered version, or the router table's Includes/Excludes columns — those columns select a reference, they never replace it. A load from an earlier turn counts only while the same scene set still applies and that content is still in context; otherwise read the file again.

Before the first tool call, record a load ledger agent-side naming each required file and whether it was read or failed. The ledger is a working note: never render it as image text and never paste it into the prompt.

**Fail closed:** if a required reference cannot be read, stop before the tool call and report the missing file. Never substitute remembered rules, never proceed on the common contract alone, and never silently downgrade the task to an unguided edit.

## Scene Router and Required References

Match every applicable scene, then load its reference under the contract above.

| Scene | Load | Includes | Excludes |
|---|---|---|---|
| PE1 — Text, language, and brand marks | `references/edit-text-brand.md` | local text/number/price change/removal, full-image translation, supplied logo application, authorized watermark/overlay removal | new logo/poster, native format conversion |
| PE2 — Subject attributes and structure | `references/edit-subject-attributes.md` | controlled color/material/texture/component/structure or person hair/face/pose/clothing change | new product concept, new SKU set generation |
| PE3 — Elements, background, and composition | `references/edit-elements-background.md` | add/remove/clean element, white/transparent/scene background, local position/viewpoint/composition adjustment | new scene without an authoritative final image, multi-reference role transfer |
| PE4 — Multi-reference transfer | `references/edit-multi-reference-transfer.md` | two or more role-related sources, cross-image replacement/composite, template/layout transfer | style-only reference for new generation |
| PE5 — Refine and repair | `references/edit-refine-repair.md` | explicit restoration, artifact/detail repair, clarity reconstruction, material/lighting cleanup, broad but observable refinement | vague optimize, target size/ratio change, pure compress/format |
| PE6 — Output dimensions and canvas ratio | `references/edit-resize-canvas.md` | target pixel size, aspect-ratio change, single-side scale, square output, absorbed by background crop or extension | method-named crop/compress/rotate/format conversion, platform set final delivery, any content change |

Load every matched PE scene for a combined output. Prefer one call when a single closed allow list can express compatible changes. Use sequential calls only for a real dependency, tool limitation, or separate requested intermediates; preserve the current result between stages. PE6 never merges into a content-changing call; when both apply, run PE6 first and the content edit second.

## Domain Workflow

1. Confirm the authoritative source(s), observable change, output count, and whether the request is one output, several independent edits, or a dependency chain.
2. Apply the mandatory gate; clarify a vague target before loading an edit scene.
3. Load `preservation-contract.md`, every matched PE reference, and `planning-handoff-contract.md` when an active plan exists; then confirm the load ledger is complete. A required reference that cannot be read stops the task.
4. Import the latest applicable plan per output. Compile every executable KEEP/CHANGE/REMOVE/ADD/SET/PROHIBIT decision into the planning ledger; require full prompt coverage for model-visible decisions and explicit tool/orchestration binding for execution-only decisions. Do not treat a confirmed plan as optional conversation context or silently re-plan it.
5. Assign every input a role and declare the source of truth for identity, text, layout, style, background, replacement subject, or inserted element. For multiple inputs, place the authoritative final canvas first and label it `BASE`.
6. Build the mandatory canvas ledger for the authoritative base, including source dimensions, locked delivery dimensions, ratio handling, and forbidden canvas changes. Bind its technical values to tool parameters and delivery validation. Give the image model only the concise semantic canvas rule defined below; this applies even when the user did not request a resize and does not by itself load PE6.
7. Build a closed allow list of changed properties/regions and a preservation list for everything else. For multiple inputs, also build a property-level authority matrix and a critical-content survival manifest. When inserting/replacing a referenced subject, additionally build the Reference-Subject Fidelity Contract's visible donor identity inventory and integration envelope. Never infer exact copy, hidden detail, new structure, brand assets, target colors/materials, or reference roles.
8. Resolve the **Template Type Contract**, then choose the **Single-Region Fast Path**, **Plan-Aware Minimal**, or the matching general tier. Eligible local edits use their reference's fixed block fragments verbatim; the selected renderer owns labels and order. Never nest a complete prompt template inside a prompt block.
9. Apply the common execution contract, compare the result to the active plan and every authoritative input, and make at most one targeted correction for the first observed failure.

## Template Type Contract

Every reference template must declare exactly one of these types:

1. **Block fragments** — label-free content for named prompt blocks such as `Primary request`, `Target boundary`, `Typography`, `Preservation invariants`, `Allowed changes`, or `Avoid`. Only the renderer in this file adds the top-level label and determines order.
2. **Complete prompt template** — a fully labeled prompt reserved for one explicitly named path, such as PE4 Reference Subject Insertion. Use it only as the complete prompt for that path, with only the insertion points the reference explicitly permits.

Never place a complete prompt template inside `Primary request:` or another block. Never copy top-level labels from a complete template into a general renderer. Never free-write a replacement for a required block fragment: resolve its placeholders and retain its wording verbatim.

For local PE1/PE2/PE3/PE5 operations, the matched reference owns the fixed block fragments. The Fast Path and Plan-Aware Minimal render the same fragments differently; this is the only permitted reuse across those paths.

## Single-Region Fast Path

Use this path when all conditions are true:

- exactly one authoritative source image and one final output;
- exactly one observable target region or target property and one edit operation;
- no active upstream planning artifact, donor/reference image, authority conflict, canvas size/ratio change, scene restaging, camera/composition change, added information layout, or several independent edit regions;
- the matched reference provides the required fixed local-edit block fragments for the operation.

Eligible operations and required reference block fragments:

| Operation | Reference | Tier and mode |
|---|---|---|
| One local text replacement/removal or one authorized overlay removal | PE1 | fast-path `minimal`; `auto_generation` when supported, otherwise `simple_generation` |
| One product-part/body recolor | PE2 | fast-path `minimal`; `auto_generation` when supported, otherwise `simple_generation` |
| Pure white-background replacement | PE3 | fast-path `minimal`; `auto_generation` when supported, otherwise `simple_generation` |
| One local element removal/cleanup | PE3 | fast-path `minimal`; `auto_generation` when supported, otherwise `simple_generation` |
| One bounded repair/refinement | PE5 | fast-path `minimal`; `auto_generation` when supported, otherwise `simple_generation` |

Logo application requires a supplied logo reference, so it uses PE1's fixed logo template through the general **Transfer** contract; it is standard product-fidelity work, never dense merely because the craft integration is detailed.

Assemble a fast-path prompt from the matched reference's block fragments in this exact order and use no other labels:

```text
Primary request: <fixed Primary request fragment, placeholders resolved verbatim>
Target boundary: <fixed Target boundary fragment, placeholders resolved verbatim>
Canvas lock: Keep the original canvas, crop, framing, subject scale, and subject/layout positions unchanged.
Preservation invariants: <fixed Preservation invariants fragment, including the applicable outside-target pixel rule>
Allowed changes: <fixed Allowed changes fragment ending in only>
Avoid: <fixed Avoid fragment, no new art direction>
```

Fast-path rules:

1. Put the edit action first. Do not prepend `Asset type:`, `Input images:`, source summaries, dimensions, task type, mapped ratio, delivery handling, planning notes, or acceptance checks.
2. Keep the technical canvas ledger agent-side and bind it to the tool call. The model-facing `Canvas lock:` is the single semantic sentence above unless the reference supplies a stricter sentence.
3. Use every matched block fragment verbatim. Resolve placeholders; do not paraphrase, summarize, reorder, enrich, or copy the fragment's reference heading into the prompt.
4. Do not add camera, scene, lighting, material/style, typography-design, graphics, or marketing direction. Existing target typography matching belongs inside PE1's fixed edit template and is not new design direction.
5. Include this exact sentence for a bounded target: `Do not modify any pixels outside the explicitly targeted region.` For a property edit such as recolor, follow it with the reference's precise target-surface boundary.
6. If the only failed eligibility condition is an active compatible plan, use Plan-Aware Minimal. Otherwise use the matching general tier. Do not partially combine the Fast Path with plan or general-contract blocks.

## Plan-Aware Minimal

Use this path only when a local operation would satisfy every Single-Region Fast Path condition except that an active upstream plan exists. The compiled plan must preserve or constrain the same one target operation; if it adds another edit region, donor, canvas change, scene/camera/composition change, information layout, or other model-visible change, route to Text-Dense Preservation, Standard, Dense, or Transfer instead.

Assemble the prompt from the matched reference's same fixed block fragments in this exact order:

```text
Asset type: Preservation-first single-region edit on an authoritative source image.
Canvas lock: Keep the original canvas, crop, framing, subject scale, and subject/layout positions unchanged.
Planning decisions: <every model-visible output-scoped plan decision, with decision ID, action, target, authority, and exact value when applicable>
Primary request: <fixed Primary request fragment> <append the fixed Target boundary fragment as the final sentence in this same block>
Critical content: <every exact plan-derived KEEP item whose loss would fail the output; omit only when none exists>
Preservation invariants: <fixed Preservation invariants fragment, followed only by additional plan-derived preservation obligations required by the ledger>
Allowed changes: <fixed Allowed changes fragment ending in only, followed only by compatible plan-derived restrictions required by the ledger>
Avoid: <fixed Avoid fragment, followed only by plan-derived PROHIBIT obligations required by the ledger>
```

Plan-Aware Minimal rules:

1. `Planning decisions:` is mandatory and must cover every model-visible ledger row for this output. Execution-only rows remain agent-side with explicit bindings.
2. `Critical content:` is mandatory for exact protected copy, logos, labels, numbers, counts, structural details, or any other critical `KEEP`; otherwise omit the block without leaving an empty label.
3. Keep the target boundary inside `Primary request:` as shown: append `Target boundary: <fixed fragment>` immediately after the fixed request fragment as the final sentence of the same block. Do not create a separate top-level block.
4. Use the same hard-bound edit mode as the corresponding Fast Path operation: `auto_generation` when supported, otherwise `simple_generation`; never `complex_generation`.
5. Do not insert camera, scene, lighting, material/style, typography-design, graphics, marketing, dimensions, task type, mapped ratio, delivery handling, or acceptance checks. If an explicit plan decision changes one of those model-visible properties, exit this tier and use the matching broader tier.
6. Before the call, require one-to-one coverage from every plan ledger row to its prompt/tool destination and acceptance check. An uncovered or `UNRESOLVED` row blocks execution.
7. Preserve every fixed fragment verbatim as the non-compressible base of its block. Append content only when the planning handoff map requires another operational destination for a compatible ledger row; append the exact plan obligation, do not paraphrase the fixed fragment, and do not add unplanned art direction.

<!-- COMMON-CONTRACT:START -->
Scope: this block covers both generation and edit execution. When the host skill's boundary gate assigns an operation differently from this block, the gate decision wins.

## Core Rules

1. **No hallucination:** Trace every fact, claim, number, label, material, certification, brand asset, and product feature to the user, visible evidence, or a loaded rule. Outside the Single-Region Fast Path, safe composition, lighting, camera, whitespace, and style decisions may be inferred only when they are inside the closed allow list and do not change meaning.
2. **Honor the active plan:** Treat the latest applicable planning artifact that has passed the host workflow's confirmation requirement as an execution input. Compile every model-visible output decision into the final prompt, bind execution-only decisions to tool/orchestration parameters, and validate both; never drop a planned preservation item during prompt compression.
3. **Clarify factual ambiguity:** Ask when the outcome or any product fact is genuinely ambiguous. After the outcome and facts are confirmed, infer safe visual execution choices instead of repeatedly asking for art direction.
4. **Preserve first:** For editing, define a closed allow list and protect every unspecified region. Never infer hidden or occluded product detail.
5. **Be specific:** Express only the properties applicable to the resolved prompt path. For Standard/Dense work, make authorized subject, environment, composition, camera, lighting, material response, text, and graphics concrete. For the Single-Region Fast Path, do not describe or redesign protected properties.
6. **Refine incrementally:** Apply follow-up changes to the current result and preserve what already works. Do not regenerate unrelated regions.
7. **Protect brands:** Use only user-authorized brand assets. Never imitate or introduce unrelated trademarks.

## Image Intake and Edit Source Preflight

Inspect every supplied image before routing. Record the main subject, preserved regions, visible text/logos/labels, likely edit region, quality risks, and whether the asset is a product photo, poster, logo, model photo, document, or scene.

Immediately before every `image_edit` call:

1. Read and decode every source. Capture exact pixel width × height, format/MIME, file size when available, and a visible-content summary. Exact pixels, not visual orientation, govern parameters.
2. Verify the reference role of every input: product source of truth, model source, style reference, template/layout reference, background, or replacement element. The authoritative final-canvas image is `BASE` and must be the first image passed to the edit tool; never leave multi-image roles or input order implicit.
3. For a local filesystem source, validate it, resolve metadata handling, upload it through the configured asset host, and pass the returned HTTPS URL. Always strip GPS. Strip remaining EXIF unless the user asks to retain it or the delivery target needs ICC/orientation data; add metadata to the protected inventory only in that case. **Do not pass a raw local path**, `file://` URL, private path, or unverified signed URL to a remote image tool.
4. For HTTP(S), verify that the URL resolves to a readable image before use.
5. **Fail closed:** If any required source cannot be read, decoded, measured, assigned a role, or converted to an accepted reference input, stop before the tool call and report the blocker.
6. Preserve source proportions unless overridden by this priority: explicit user size/ratio → platform hard requirement → explicit resolution-changing task → source-following.
7. Do not reconstruct a cropped, blocked, or hidden product region. Request a clearer reference when the desired output depends on it.

## Mandatory Canvas Lock for Editing

Every `image_edit` call with an authoritative source must have an agent-side canvas ledger and a model-facing semantic canvas lock, even when the user requests only a local content edit. Implicit source-following canvas preservation is part of the preservation contract; it does not load PE6 unless the user explicitly requests a new size, side length, or ratio.

1. Select the `BASE` image whose canvas, crop, layout, and untargeted regions govern the final output.
2. If the user supplies a target size or ratio, use that explicit target under PE6. Otherwise derive a source-following locked delivery size from the `BASE` dimensions.
3. For source-following, consider the floor and ceiling multiple-of-16 values for each source edge, with a minimum edge of 16. Choose the width/height pair that first minimizes aspect-ratio error, then total edge deviation. Keep each edge within 16 px of the source; a tie favors the smaller total area change.
4. Record agent-side the source size, locked delivery size, source and target ratios, and the rule `no crop, outpaint, stretch, reframe, zoom, rotation, or subject/layout repositioning` unless one of those properties is explicitly targeted.
5. Treat the locked size as the canonical planning and delivery target, then adapt its parameter shape to the final resolved `task_type`: pass concrete `size` in a size-capable mode; after a downgrade to a ratio-only mode, omit `size` and map the locked width/height to the closest supported `aspect_ratio` under the downgrade contract below.
6. Record agent-side any mapped working ratio, its deviation from the locked ratio, and the final delivery handling. Prefer native final resize to the locked delivery size; when unavailable, a ratio-only tool output may be delivered only as an explicitly disclosed downgrade under the acceptance rules below.

Do not send source dimensions, locked dimensions, task type, mapped ratio, or final delivery handling to the image model. Bind them to tool arguments, orchestration, and result validation. The model-facing prompt uses only:

```text
Canvas lock: Keep the original canvas, crop, framing, subject scale, and subject/layout positions unchanged.
```

When PE6 explicitly changes the canvas, replace that sentence with a concise semantic instruction naming only the authorized crop/extension behavior; keep exact pixels and parameter adaptation outside the prompt. Direct-size or native-final output must equal the agent-side locked delivery size; a disclosed ratio-only fallback must match its mapped ratio and report actual pixels. Every path fails on unrequested crop, extension, reframing, or normalized layout shift.

## Native vs AI Interception

Choose by what must change:

| Requested change | Execution |
|---|---|
| File weight, format, rotation, lossless crop/trim, or exact delivery resize without content redraw | Native resize/crop/compress/convert/transform tool; do not call an image model |
| Background removal or alpha matting without content redraw | Native matting tool; if unavailable, report the unsupported delivery step |
| Pixel dimensions/aspect require generative extension or content-aware recomposition | `image_edit`, only when the user accepts content generation |
| Existing image content must change | `image_edit` |
| No source image and new visual content is requested | `image_generate` |

Run content-changing AI operations first and native delivery operations last. Never redraw a product merely to satisfy compression, format, or file-size requirements. If the runtime lacks a required native tool, report the unsupported delivery step instead of silently substituting generation.

## Multi-Intent and Batch Planning

1. Identify every intent and expected output count.
2. Separate native delivery operations for the final stage.
3. Group compatible AI changes by final output image; prefer one AI call per requested output.
4. Use sequential calls only when one output is required as the next input, when the tool cannot merge the operations safely, or when the user requests intermediates.
5. For a batch, list/identify all inputs, confirm the common operation and output count, and preserve each asset independently. Never guess-edit a folder.
6. For a multi-image set, keep shared identity/style wording verbatim while giving each output one distinct message.

## Tool and Execution Mode Resolution

Inspect the actual tool schema before choosing `task_type`.

- Use `image_generate` for text-to-image and `image_edit` whenever a source image is authoritative.
- If generation supports `auto`, prefer `auto`; otherwise use `simple` for standard scenes and `complex` only for dense layouts.
- If editing supports `auto_generation`, prefer `auto_generation`; otherwise use `simple_generation` for standard or product-fidelity work and `complex_generation` only for dense multi-region layouts.
- A visually rich scene is still standard. Text-only preservation across several existing regions uses Text-Dense Preservation; Dense means independent typography-plus-graphics regions, comparison grids, callouts, diagrams, or full poster/infographic composition.
- Do not choose `complex_generation` merely because the request sounds complex. Product-fidelity and localized edits default to standard.

### Hard Binding for Preservation-First Edits

| Edit class | Prompt path | Resolved mode |
|---|---|---|
| Fast-path or plan-aware local text/overlay removal, recolor, white background, one-element cleanup, one bounded repair | Single-Region Fast Path or Plan-Aware Minimal | `auto_generation` when supported; otherwise `simple_generation`; never `complex_generation` |
| Supplied-logo application or another product-fidelity transfer | Transfer | `auto_generation` when supported; otherwise `simple_generation`; use dense only when several independent typography/graphics regions are also requested |
| Reference-subject insertion/replacement with explicit donor authority | Transfer + Reference-Subject Fidelity Contract | `auto_generation` when supported; otherwise `simple_generation`; never dense unless independent information-layout regions are also requested |
| Scene/background restaging or requested composition change | Standard | `auto_generation` when supported; otherwise `simple_generation` |
| Full-image translation or another text-only preservation edit across several independent existing text regions | Text-Dense Preservation | `auto_generation` when supported; otherwise `complex_generation` |
| Several independent typography-plus-graphics regions, callouts, grids, or information layout | Dense | `auto_generation` when supported; otherwise `complex_generation` |
| Multi-reference authority transfer without dense layout | Transfer | `auto_generation` when supported; otherwise `simple_generation` |

This table outranks descriptive words such as “complex,” “professional,” or “detailed.” A one-region edit cannot be promoted to Dense because the source image or target surface is visually complicated.

| Capability | Standard scene | Dense scene |
|---|---|---|
| `image_generate` supports auto | `auto` | `auto` |
| `image_edit` supports auto | `auto_generation` | `auto_generation` |
| Generation auto unavailable | `simple` | `complex` |
| Editing auto unavailable | `simple_generation` | `complex_generation` |

### Parameter Shape

Use exactly the parameter family accepted by the resolved mode:

| Resolved mode | Pass | Do not pass |
|---|---|---|
| `auto` / `auto_generation` | concrete `size: "<W>x<H>"`; both edges are multiples of 16; for editing, use the locked size when it is inside the capability window, otherwise the declared working size, and omit optional `aspect_ratio` | `resolution` + ratio as a substitute for concrete size; an `aspect_ratio` that conflicts with `size` |
| `simple` / `simple_generation` | map the locked size to the closest supported `aspect_ratio`; add `resolution: "1K"` or `"2K"` only when requested/supported; record fallback delivery handling | raw pixel `size`; an aspect ratio chosen without the deterministic mapping below |
| `complex` / `complex_generation` | map the locked size to the closest supported `aspect_ratio`; add supported resolution when requested; record fallback delivery handling | raw pixel `size`; use for product fidelity only when dense layout requires it; an unmapped ratio guess |

Whenever concrete `size` is passed, enforce total area **655360–8294400 px²**. If outside the range, scale both edges proportionally toward the nearest bound, round both to multiples of 16, and recheck the area. Do not crop, stretch, or change ratio during this clamp.

For an implicit source-following canvas lock, a per-edge change of at most 16 px is the intended compatibility adjustment: report the source and locked dimensions in the delivery summary, but do not treat it as a preservation failure. Any larger implicit lock change or ratio drift caused by conflicting simultaneously-passed parameters fails validation. A ratio-only downgraded result is valid only through the declared fallback contract above; if the user requires exact source pixels, native final resize is mandatory.

Supported ratios:

`1:1 | 2:3 | 3:2 | 3:4 | 4:3 | 4:5 | 5:4 | 9:16 | 16:9 | 21:9`

### Task-Type Downgrade: Size-to-Ratio Adaptation

Concrete `size` is the canonical canvas target, not a parameter that may be passed to every mode. When a planned `auto_generation` edit resolves or downgrades to `simple_generation` or `complex_generation`:

1. Let `r = locked_width ÷ locked_height`.
2. Convert every supported `p:q` to `s = p ÷ q` and choose the ratio minimizing `abs(log(r ÷ s))`; this treats portrait and landscape deviations symmetrically. A tie chooses the smaller `abs(r - s)`, then the ratio with the same orientation as the lock.
3. Pass the selected `aspect_ratio` and omit raw `size`. Keep existing resolution selection rules; do not invent `1K` or `2K` when the schema or request does not support it.
4. Record agent-side in the canvas ledger: canonical locked size and ratio, resolved task type, mapped working aspect ratio, ratio deviation, and whether native final resize will restore the locked delivery size. Do not place these technical values in the model-facing `Canvas lock:` block.
5. If native final resize is available, the actual final output must equal the locked size. If it is unavailable, verify the model output against the mapped ratio and report its actual pixels as a disclosed fallback delivery; do not claim that it equals the locked canvas.
6. A mapped-ratio deviation of more than 10% requires user-visible disclosure before execution. Never silently replace an explicit user ratio with a different supported ratio.

Ratio priority is explicit user ratio → platform hard requirement → source-following → `1:1` for generation without a source. For an unsupported requested ratio, disclose the constraint and ask for a supported ratio; do not silently substitute. In source-following fallback modes, choose the closest supported ratio and warn when deviation exceeds 10%.

For an explicit 1K/2K target, preserve the governing ratio and compute the other edge from it. Round concrete auto-mode edges to multiples of 16. For an exact final pixel size that the AI schema cannot accept, use a compliant AI canvas only with user-visible handling, then apply a native final delivery operation when that operation preserves content.

## Identity Match Contract

When a source product or subject must remain the same, protect intrinsic identity:

- Keep geometry, silhouette, structural parts/proportions, color, material/finish, texture, pattern/graphics, logo, and on-product/package text unchanged unless specifically targeted.
- Camera angle, distance, crop, subject position, and physically plausible pose may change only when the requested outcome allows recomposition.
- Background, lighting, shadow, and reflection may change only within the closed allow list.

Use a concise edit clause:

```text
Keep the product identity unchanged — preserve geometry, proportions, color, material, texture, prints, logo, and on-product text.
Allowed changes: [closed allow list] only.
Do not redraw, simplify, recolor, or invent any untargeted product detail.
```

### Reference-Subject Fidelity Contract

Apply this contract whenever a new person, product, animal, or object from a reference image is inserted into or replaces content in `BASE`:

1. Label the authoritative subject source `SUBJECT_DONOR` (`SUBJECT_DONOR_1`, etc. for several subjects). It is the sole authority for the transferred subject; `BASE` remains the sole authority for the final canvas and every untargeted base region.
2. Build a visible donor identity inventory before prompting. For products/objects, record count, silhouette, geometry, proportions, parts, color, material, finish, texture, pattern, logo, visible text, labels, and accessories. For people/animals, record count, facial/identity features, skin/fur tone, hair/fur, body proportions, pose, expression, clothing or markings, and accessories.
3. Preserve the donor subject's visible pose, expression/state, viewpoint, orientation to camera, structure, and intrinsic appearance by default. Do not reinterpret, beautify, redesign, average, or regenerate it from a category description.
4. Unless explicitly targeted, allow only translation, uniform scaling, depth placement, source-background edge removal, base-supported occlusion, and physically necessary contact shadow/reflection/color-temperature blending inside the declared integration envelope. Rotation, perspective change, new pose, new expression, relighting, recoloring, clothing/material change, or reconstruction of hidden surfaces is forbidden by default.
5. Define the **integration envelope** as the final subject silhouette plus only immediately adjacent pixels required for edge antialiasing, contact/occlusion seams, contact shadow, or reflection. Protect every `BASE` pixel outside that envelope.
6. If the requested placement requires a new viewpoint, pose, expression, or hidden surface not supported by `SUBJECT_DONOR`, request a compatible reference or obtain explicit acceptance of lower fidelity before execution. Never silently fabricate it.

Use PE4's complete **Reference Subject Insertion** prompt template verbatim. A generic Transfer prompt without the donor identity inventory, default presentation lock, integration envelope, and exact complete template is invalid.

## Prompt Construction and Validation

Load the domain reference first. It owns operation wording, fixed constraints, and scene-specific acceptance criteria. This section owns final prompt structure.

Build prompts in concise English while retaining user-provided proper nouns and exact copy. Separate facts from inferred visual decisions. A prompt must stand alone and must not rely on unstated conversation context.

For any bounded edit region, including a bounded region inside a Transfer or planned full-contract edit, include `Do not modify any pixels outside the explicitly targeted region.` in `Preservation invariants:`. When several explicit regions are intentionally edited, define their closed union and protect every pixel outside that union. Do not use this sentence for scene restaging or PE6 canvas changes where the authorized target is not a bounded local region; use the scene/canvas-specific preservation rule instead.

First resolve the **Single-Region Fast Path**, then **Plan-Aware Minimal**. Their schemas are final and do not use the list below. For every other prompt, use these labels in order and omit conditional blocks. `Input images:` is required only for two or more inputs. `Canvas lock:` is required for every `image_edit` prompt but carries semantic preservation behavior only; technical canvas values remain agent-side and in tool parameters.

1. `Asset type:`
2. `Input images:` — required for two or more inputs; list `BASE` first, then every donor/reference in exact tool-input order. Omit for a plain single-source edit.
3. `Canvas lock:` — required for editing; concise semantic canvas/crop/framing/position preservation only. Never include source pixels, locked pixels, task type, mapped ratio, or delivery handling.
4. `Authority matrix:` — required for two or more inputs; assign every overlapping property to one source
5. `Planning decisions:` — required when an active upstream plan exists; restate every model-visible, output-scoped KEEP/CHANGE/REMOVE/ADD/SET/PROHIBIT obligation with a visible target or source anchor
6. `Primary request:`
7. `Canvas and composition:`
8. `Camera:`
9. `Scene/backdrop:`
10. `Lighting and grounding:`
11. `Materials, color and style:`
12. `Typography:` — exact confirmed copy, hierarchy, placement, and `no other text`
13. `Graphics and callouts:` — exact counts, positions, anchors, and crossing rules
14. `Transfer manifest:` — required for multi-reference transfer; name what moves from which source to which final region
15. `Critical content:` — exact non-compressible survival list for protected text, logos, elements, counts, and donor details; include every plan-derived KEEP item whose loss would fail the output
16. `Preservation invariants:` — no more than three lines
17. `Allowed changes:` — closed list ending with `only`
18. `Avoid:` — no more than eight non-duplicative items

Assembly tiers:

- **Fast-path Minimal:** eligible single-source, single-region operations use the dedicated six-block fast-path schema above; do not use the general Minimal schema.
- **Plan-Aware Minimal:** an otherwise fast-path-eligible single-region operation blocked only by an active compatible plan; use its dedicated plan-aware schema and the same reference block fragments.
- **General Minimal:** an exact single operation that is not fast-path eligible; use 1, 3, 6, and 16–18, plus 2 for multiple inputs and 15 when exact protected content is at risk.
- **Standard:** photographic scene/product work; use 1–3, 6–11, and 16–18, plus 12/15 when applicable.
- **Text-Dense Preservation:** several independent existing text regions change while the source layout and every non-text property remain authoritative; use 1, 3, 6, 12, and 15–18, plus 2 for multiple inputs and 5 whenever an active plan exists. For PE1 full-image translation, fill blocks 6, 12, and 15–18 from PE1's fixed block fragments verbatim after resolving the exact map; the renderer alone adds labels. Do not add camera, scene, lighting, materials/style, composition, or graphics blocks unless those properties are explicitly authorized to change; if they are, route to Dense or the matching broader tier.
- **Dense:** multi-region information design; use 1–3, 6–13, and 15–18, plus conditional 4/14 for multiple inputs.
- **Transfer:** preservation-first multi-reference work; use 1–4, 6, and 14–18. Add 7–13 only for properties explicitly allowed to change; do not redescribe protected scene, lighting, material, typography, or layout merely for completeness.

Hard tier assignments:

- PE1 one-region text replacement/removal or authorized overlay removal → Fast-path Minimal without an active plan; Plan-Aware Minimal with an active compatible plan.
- PE2 one-region/body recolor → Fast-path Minimal without an active plan; Plan-Aware Minimal with an active compatible plan.
- PE3 pure white background or one-element removal/cleanup → Fast-path Minimal without an active plan; Plan-Aware Minimal with an active compatible plan.
- PE5 one bounded repair → Fast-path Minimal without an active plan; Plan-Aware Minimal with an active compatible plan.
- PE1 full-image translation or another text-only preservation edit across two or more independent existing text regions → Text-Dense Preservation; include the exact approved source-to-target map in `Typography:`.
- PE1 supplied-logo application and PE4 multi-reference transfer → Transfer, standard mode unless independently dense.
- PE4 reference-subject insertion/replacement → Transfer + Reference-Subject Fidelity Contract; PE4's complete prompt template is mandatory.
- PE3 scene restaging/composition change → Standard.
- Several independent text-only replacement/removal/translation regions on a protected existing layout → Text-Dense Preservation; several graphic/callout/layout edit regions or information-design regions → Dense.

Every non-fast-path tier must include block 5 when an active plan exists. Plan-Aware Minimal already contains it by definition. Tier compression may shorten wording but may not remove a planning decision, and any plan-derived critical KEEP item forces block 15 even in Minimal, Standard, or Text-Dense Preservation prompts.

Keep a concise set of observable acceptance checks agent-side; group compatible checks, but cover every planning-ledger row. Never render them as image text. Before every call, verify:

1. every executable active-plan decision is represented in the planning ledger, mapped to its required prompt/tool/orchestration destination, and covered by an observable acceptance check; every model-visible decision appears in the prompt;
2. the prompt performs the requested operation on the correct target;
3. no prompt instruction contradicts the user, the active plan, or an untouched region;
4. every fact/copy/number has authority and no hidden detail is fabricated;
5. the agent-side concrete edit size or deterministically mapped fallback ratio plus delivery handling is bound to tool/orchestration validation; the model prompt contains only the semantic `Canvas lock:`; input order, language, count, platform, and preservation constraints are correct;
6. for multiple inputs, the authority matrix, transfer manifest, and critical-content survival list are complete; a reference-subject insertion additionally uses PE4's complete prompt template verbatim with `SUBJECT_DONOR`, a resolved visible identity inventory, default presentation lock, and concrete integration envelope;
7. labels, order, tier blocks, parameter family, template type, and loaded reference rules are satisfied; no complete prompt template is nested inside a prompt block, and every renderer-owned label appears exactly once.

For a fast-path prompt, additionally verify that every fixed block fragment is verbatim, the six labels are in the required order, the applicable outside-target pixel protection is present (the generic sentence or PE3's subject-silhouette specialization for white background), and no orchestration metadata or art-direction block leaked into the prompt. For Plan-Aware Minimal, additionally verify the fixed fragments are verbatim, `Planning decisions:` has complete ledger coverage, the target boundary is inside `Primary request:`, and `Critical content:` contains every critical `KEEP`.

For Text-Dense Preservation, additionally verify that every declared source text region has exactly one authoritative target string in `Typography:`, every protected term remains exact, `Critical content:` covers all target and protected copy, and no camera/scene/lighting/material/composition/graphics block leaked into the prompt.

Fix schema-only defects silently and revalidate. For a genuine intent/fact conflict, stop and ask one focused clarification before calling the tool.

## Result Check

Evaluate every result against the agent-side acceptance checks and loaded reference criteria:

1. **Canvas lock:** in direct-size or native-final delivery, actual output width and height equal the locked dimensions and implicit source-following differs by no more than 16 px per source edge. In a disclosed ratio-only fallback without native final resize, actual output ratio matches the deterministically mapped working ratio and its real pixels are reported. Neither path may introduce an unrequested crop, extension, reframing, or normalized layout shift.
2. **Plan adherence:** compare the result to every output-scoped planning decision; every KEEP survives, every CHANGE/REMOVE/ADD/SET is realized, and every PROHIBIT is absent.
3. **Preservation:** compare protected identity, text, labels, count, geometry, material, and untargeted regions with the source.
4. **Intent completeness:** confirm every requested change and expected output is present.
5. **Multi-reference survival:** confirm every critical base element and donor detail survives once, comes from the assigned authority, and is neither averaged, duplicated, omitted, nor leaked.
6. **Reference-subject fidelity:** compare every inserted/replacement subject directly with its `SUBJECT_DONOR`. Verify the visible identity inventory, count, silhouette, geometry/body proportions, parts/facial features, color/skin/fur tone, material/texture or hair/fur, pattern/markings, logo/text, clothing, accessories, pose, expression/state, and viewpoint. Only explicitly authorized placement and integration properties may differ.
7. **Factual/OCR check:** read back exact text, numbers, prices, units, and language; compare them with the authoritative input.
8. **Composition/physics:** check grounding, contact shadow, scale, perspective, lighting direction, anatomy, and non-overlap where applicable.
9. **Delivery:** read and decode every produced output the same way as a source, then verify dimensions against the locked delivery size, plus ratio, transparency, format, file count, and naming rather than trusting request parameters.

For reference-subject insertion, any subject redrawing, identity averaging, changed face/product structure, changed intrinsic color/material/markings/text, duplicated/missing subject, or unrequested pose/viewpoint change is a hard failure. The one permitted correction must prefix the donor invariants with `CRITICAL: Copy the complete visible subject from SUBJECT_DONOR exactly; do not regenerate or reinterpret it`, name the observed drift only, and keep the same closed integration envelope.

On the first failure, make one targeted correction based on the observed difference; do not repeat the same prompt unchanged. After two failed attempts at the same output, stop, report the limitation and the observed drift, and offer a narrower/native alternative. Never present a failed preservation or factual check as successful.

## Multilingual Handling

Detect the user's language, preserve original key terms, build tool prompts in English with exact source-language anchors, and respond in the user's language. Never translate in-image copy unless requested. When a target language conflicts with visible source text, resolve keep-versus-translate before generation.
<!-- COMMON-CONTRACT:END -->

## Quick Reference

| Request | Primary scene |
|---|---|
| Any active system/host design plan | Matching PE scene + preservation contract + planning handoff contract |
| Exact text/number/price, image translation, logo application, watermark/overlay | PE1 + preservation contract |
| Color/material/texture/structure or person attribute | PE2 + preservation contract |
| Element cleanup/addition, background, white/transparent, position/viewpoint | PE3 + preservation contract |
| Cross-image replacement/composite or template transfer | PE4 + preservation contract |
| Explicit restoration, repair, clarity, or observable broad refinement | PE5 + preservation contract |
| Target pixel size, aspect-ratio change, single-side scale, square output | PE6 + preservation contract |

## Common Mistakes

- Letting product/platform context override a localized edit to an authoritative source.
- Passing a raw local path, skipping exact-pixel measurement, or leaving multi-image roles implicit.
- Omitting the canvas lock for a local edit; passing both concrete `size` and a conflicting `aspect_ratio`; or downgrading to a ratio-only mode without deterministic size-to-ratio mapping and disclosed delivery handling.
- Passing a donor/reference before the authoritative `BASE`, or describing roles without a property-level authority matrix and critical-content survival list.
- Treating a confirmed system/host planning result as disposable context instead of compiling every decision into `Planning decisions:`, operational blocks, and result checks.
- Nesting a complete prompt template inside `Primary request:`, copying renderer-owned labels from a reference, or omitting the exact approved translation map from `Typography:`.
- Constructing a prompt from the router table or from remembered reference rules instead of reading the required reference files in the current turn.
- Writing a broad “make it better” prompt instead of a closed allow list and protected-region contract.
- Inferring replacement copy, translation language, target color/material, hidden product structure, or which reference owns identity/layout.
- Using `complex_generation` for a localized edit merely because the request sounds difficult.
- Checking only the edited region and missing drift in other text, logo, geometry, color, layout, or dimensions.
- Sending a method-named crop, compression, rotation, or format request into PE6, or sending a target size/ratio request to a native tool.
