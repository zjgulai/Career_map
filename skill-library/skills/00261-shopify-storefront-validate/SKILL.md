---
name: shopify-storefront-validate
description: >-
  Shopify storefront/theme validation protocol. Use when an assistant or auditor
  must inspect a running local theme-dev preview, verify a dev-theme admin preview
  (`?preview_theme_id=`), post-publish storefront, or pre-launch store readiness:
  theme structure, Theme Check,
  admin-preview rendering, homepage/PDP/collection/cart checks, desktop/mobile
  screenshots, password-page blockers, responsive layout, and evidence-based
  blocking/warning/info reports. Final draft verification uses the remote
  `?preview_theme_id=` URL. This skill is read-only by default; it does not author
  Liquid, upload products, authenticate Shopify, push theme files, or publish themes.
---

# Shopify Storefront Validate

## Core Rule

Validate with observable evidence before advancing a Shopify storefront/theme change. Record what was checked, what passed, what failed, and what remains unknown. This skill is read-only by default: do not push theme files, publish themes, create products, upload media, change inventory, or alter store settings.

For required official Shopify helpers or CLI reads, load `shopify-execution` before the first call. Main Agent verifies the current connection and canonical store through `aw-shopify-oauth`; a delegated auditor uses that prepared binding and returns auth errors rather than repairing or probing authorization. A public-URL-only diagnostic uses browser tools directly without OAuth, Admin calls or a permanent `*.myshopify.com` domain. Exact draft/live theme acceptance still requires the verified store/theme binding and observed target identity; a public-page inspection alone does not establish deployment or publication.

This is a Skill, not a spawnable agent ID. `shopify-store-auditor` executes
store/theme audits: scoped reads, browser operations, screenshot inspection and
evidence reports. It uses the available browser and image-inspection tools
directly; it does not spawn a browser agent or another sub-agent. Main Agent
loads this protocol to dispatch the audit, review coverage and evidence,
coordinate fixes with the owning executor, and decide the final task state.
Main Agent does not repeat the auditor's browser pass or delegate acceptance
back to the theme writer. Executors retain their implementation self-checks;
ordinary discovery and successful script-owned verification do not acquire an
extra audit solely because this Skill was loaded.

Report in the user's conversation language. Keep that separate from the approved storefront copy language and requested markets: verify the agreed content, never translate it or change market scope to match report language. Preserve IDs, URLs, code, error text and measured values.

## Audit scope follows the task

Main Agent passes the original requested outcome, exact resources, expected
values, affected surfaces and delivery state in the auditor's existing brief /
`context`, together with current executor receipts. When the original task
includes theme-file or content changes, include the frozen business brief and
current outcome/read-back paths; inherit their
`delivery_scope` and `visual_required`. These are internal task evidence, not a
new merchant form. The auditor returns the scope it actually checked and flags
missing required coverage for Main to resolve.

When the original task only requests publication of an existing draft without
file/content changes, pass that request, the verified canonical store and exact
theme, its preview, required checks and available receipts directly to the
auditor. No decorator brief, content outcome or outcome hash is required for
this branch. Keep the original functional/visual requirements. A later request
to publish an unfinished decoration does not turn that same task into pure
publication: its original outcome/checkpoint gate and remaining work persist.

- Use the page/check lists below as candidates selected by the task, not a
  mandatory full-store sweep. Check a homepage hero on the homepage; check its
  changed CTA destination without adding unrelated PDP visual requirements.
  Global layout, CSS, navigation or shared components require representative
  coverage of every affected page type. Include cart when buying-flow surfaces
  are affected. Record why each sampled page covers the requested change.
- A nonvisual change still needs its functional/render evidence, but no
  screenshot requirement. Never downgrade a visual request after inspection
  fails, or treat nonvisual as permission to skip the requested behavior check.
- Preserve intended DRAFT/unpublished/private states. Public visibility or
  publication is required only when it is part of the requested outcome.
- Run `pre_launch` or `full_audit` only for a requested readiness/full-store
  audit. Missing scope does not default to either. Resolve it from the original
  task or return the missing scope to Main; do not ask the merchant to choose
  internal mode names.
- Findings unrelated to the requested result remain separate recommendations;
  they do not block a narrow delivery unless evidence shows they prevent its
  actual success. Required checks that fail or cannot run remain incomplete.

## Validation Modes

Choose the final validation mode before checking. Optional local preflight
below does not replace that mode's acceptance evidence:

| mode | Use when | Base URL |
|---|---|---|
| `admin_preview` | Final validation of a dev/unpublished theme, including preview-only delivery | `https://<store>?preview_theme_id=<dev_theme_id>` |
| `post_publish_live` | After `themePublish`, verify the live storefront now shows the intended theme/content | live primary domain |
| `pre_launch` | Whole-store launch readiness: products, policies, navigation, password page, payment/shipping/tax signals, buying path | live primary domain or password-bypassed storefront |
| `full_audit` | Explicitly requested deep read-only store audit | live primary domain plus Admin reads |

A scoped read-only review with no delivery phase needs no lifecycle label,
write/outcome receipt or build checkpoint. For a public-page diagnostic, open
the URL supplied in the original task/context directly; record the requested
and observed final URLs. Do not discover a canonical domain, connect OAuth or
query Admin solely to identify the page. Omit unknown store/theme identities
instead of guessing them. Apply only the requested checks and return a coverage
statement; do not select `full_audit` to fill a missing mode. This exception does
not waive identity binding for Admin operations or exact draft/live acceptance.

For `admin_preview`, never verify against the public `*.myshopify.com` root. Password-page HTML can return HTTP 200 and produce false confidence.

## Inputs To Record

- Target URL from the original task/context for a public-page diagnostic. It is sufficient without `store_domain` or `theme_id`; record observed redirects without treating them as proof of a specific theme.
- `store_domain`: verified canonical `*.myshopify.com` for required Admin checks and local or exact draft/live theme validation; omit when unknown for a public-page diagnostic.
- `mode`: one of the modes above when the task has that delivery phase; omit for local preflight or a scoped read-only diagnostic without a matching phase.
- `theme_id`: verified dev theme for `admin_preview`, verified live theme for `post_publish_live`, or Main's verified target for local preflight. Omit unknown IDs in a public-page diagnostic; never infer them from a custom domain.
- `local_theme_path` when static checks are required.
- `preview_base_url` for `admin_preview`: `https://<store>?preview_theme_id=<dev_theme_id>`.
- `changed_surfaces`: homepage, PDP handle, collection handle, cart, navigation, password page, etc.
- `expected_section_counts` when known, especially for banner/hero work, e.g. `{ "homepage_hero_banner": 1 }`.
- `storefront_password`: only when the storefront is password protected and a live-domain check must bypass `/password`.
- Original publication request and existing authorization/preview evidence for pure publication; the frozen decorator brief and current outcome/read-back are required only when the original task includes file/content changes. Do not invent new content targets to fill those artifacts.

## Lightweight Published-Product Reachability

When Product publication verification needs only proof that the public PDP URL resolves, keep this smoke test narrower than theme/content validation:

1. Run it only after the owning Product publication read reports the confirmed Publication state. Do not pre-probe an expected DRAFT/unpublished 404 unless the merchant explicitly asked for a before/after comparison.
2. Start from one confirmed `*.myshopify.com/products/<handle>` URL and follow redirects. Do not fetch both that alias and the resulting primary-domain URL separately; the final URL is redirect evidence.
3. Prefer one `HEAD` request with an eight-second per-attempt timeout. If the origin rejects or blocks `HEAD`, make one bounded `GET` with the same timeout, stop after response headers, and cancel the response body rather than downloading the full page.
4. Record the method, original URL, final URL, redirect flag, HTTP status, and whether the response body was inspected. A final 2xx/3xx status proves reachability only. It does not prove the page is not a password page, contains the expected product, or renders correctly.
5. Use `shopify-product-management/scripts/probe_product_storefront.mjs` for this Product-specific smoke test. Continue with the normal render/browser workflow below when content or visual correctness is part of the success criteria.

Do not turn a successful status line followed by a cancelled or timed-out body transfer into a claim that the full page downloaded cleanly. Report the narrower evidence actually obtained.

## Local Visual Preflight

For substantial decoration, Main Agent dispatches `shopify-store-auditor` with
`scope: "local-preview"` only after Main confirms that the managed `theme dev`
watcher in its own session is alive and synchronization has completed. Pass
Main's actual process/session ID, store/theme identity, shared complete-tree
path, observed URL and current sync evidence, with the same approved surfaces;
omit the remote-only `render_mode`. The auditor executes the inspection directly.
Main owns watcher startup, monitoring and stop; the decorator prepares and edits
the shared complete tree, then performs final remote read-back after Main stops
the watcher. The sole process protocol is
[`dev-preview-craft.md §4`](../shopify-theme-craft/references/dev-preview-craft.md#4-local-development-preview-and-full-tree-workflows).
This read-only Skill does not start or control a command that uploads theme files.

- Use Main's actual local URL and current process/store/theme/path/sync evidence.
  A decorator readiness report alone does not establish that Main's watcher is
  alive or has synchronized the current changes. Missing or failed readiness
  returns to Main for process recovery before local inspection.
  The browser must reach the same host's listener; a remote browser's localhost
  may be another machine. Failed access is not a storefront defect and does not
  authorize a public tunnel, new credentials, or a static-page substitute.
- Inspect the changed surfaces at desktop `1920x1080` and mobile `390x844`, using
  the same screenshot-inspection, content, image, layout and overflow standards
  as the admin preview below. Keep observed URLs, screenshots, viewport sizes,
  findings and the session/sync evidence with the task. Mere server readiness
  or HTML output cannot count as successful visual inspection.
- The auditor returns observed defects to Main, which coordinates the
  decorator's edits in the shared tree, confirms watcher health and fresh sync,
  and sends the result back for reinspection. Main
  tracks one shared budget of at most two automatic visual-fix iterations across
  local and remote checks; switching URLs does not reset it. Browser/tool failure
  leaves checks unverified and returns to Main for recovery or the available
  remote path instead of triggering speculative CSS edits.
- Label these observations as local preflight. After edits are frozen, Main
  settles sync, stops its watcher and confirms exit under the process protocol;
  the decorator then verifies the exact remote draft. Run the admin
  preview gate below against that final outcome. Local screenshots cannot be
  relabelled as `admin_preview` or `post_publish_live` evidence. If remote access
  is blocked, preserve local successes and report remote acceptance incomplete.

Local preview helps iteration but does not establish product publication,
checkout behavior, business claims, or the final remote theme's appearance.

## Admin Preview Contract

`shopify-store-auditor` checks the exact dev theme through the admin
`?preview_theme_id=` URL with `scope: "admin-preview"`. Main Agent owns the
acceptance decision from that report; the decorator cannot accept its own work.

For a task that includes file/content changes, Main obtains this scoped audit
after the decorator returns final remote read-back/outcome, before declaring a
draft complete or advancing to publication. This also applies after local
visual preflight. For pure publication, Main supplies the existing draft and
original request directly for the applicable admin-preview checks; do not wait
for a decorator run or require a content outcome that this task did not create.

1. Build the preview URL (no server needed):

```
https://<store-domain>?preview_theme_id=<dev_theme_id>
```

Rules:

- This URL renders the dev theme server-side via Shopify — fetch it directly to verify.
- Auth and authorization are defined in `skills/aw-shopify-oauth/SKILL.md`; do not duplicate or improvise OAuth/scope handling here.
- Open the exact `?preview_theme_id=` URL and inspect the final URL and rendered page for a storefront password challenge. A `/password` redirect or password form is evidence of a gate; HTTP 200 alone is not. Do not add an Admin password-status query as a prerequisite: the bundled Admin schema does not expose that field on `Shop`. A login error, expired preview, or network failure is not proof of storefront password protection. The runner may request the storefront password **only when an observed password challenge is execution-blocking**:
  - **Main Agent**: proactively `ask_user` for the storefront password as the FIRST action — do not silently skip verification or jump to "blocked". Concrete prompt: *"Your store is still password-protected, so I can't open the preview to check it visually. Please share the storefront password (Shopify admin → Online Store → Preferences → **Store access** → Password — the page at `https://admin.shopify.com/store/<your-store>/online_store/preferences`), or temporarily turn off password protection, and I'll verify the banner/decoration for you."* Then provide it through the auditor's supported private execution context so the auditor can load and inspect the gated preview; do not include it in evidence files or repeat the browser pass.
  - **Sub-agent** (`shopify-theme-decorator` / `shopify-store-auditor`): it MAY `ask_user` for this execution-blocking password directly. If it asks, it MUST include a `user_interactions` entry in the final report with the exact question and a redacted outcome (`provided_and_used` / `declined` / similar), so the Main Agent knows the password was requested and whether it was provided. Do NOT print the raw password in the report. If it chooses not to ask, set `storefront_password_needed: true` and return to the Main Agent.
  - Only if the user declines or cannot provide it: record `verified_rendering: pass=false, reason="password_page_returned"`, tell the user visual verification is blocked until the password is shared or protection is lifted, and do NOT claim the decoration is verified.
- Never fall back to grepping the public storefront root to fake a pass.

If navigation redirects or shows old content, retain the requested and observed
URLs and the actual theme identity when available. A removed query parameter,
an Admin login, or a theme-list entry alone does not establish which theme
rendered or why the preview failed. For file/content changes, reconcile the
exact dev theme's content against the approved brief through the decorator's
existing read-back path. For pure publication, use scoped read-only evidence to
reconcile the requested existing theme and preview without creating a write
brief or editing it. Report confirmed mismatches and unresolved preview access
separately. Do not recommend publication as a way to diagnose missing changes.

2. Validate pages through the preview URL (append the path, keep `?preview_theme_id=`):
   - `/`
   - `/products/<changed-or-sampled-handle>`
   - `/collections/<changed-or-sampled-handle>` or `/collections/all`
   - `/cart` when buying-flow surfaces changed

   Select only the pages required by the task and its actual impact. Each
   selected content page must return HTTP 200, must not be a password page, and
   must contain the expected content/behavior. Pure publication checks the
   intended existing draft within the original scope, not invented content
   changes. The auditor reports failures to Main;
   Main coordinates a narrow fix for an observed implementation defect or an
   access/tool recovery for an inspection failure.

2.5. **For banner / hero / template work, verify section instances, not only files.**
   - Read or use the provided local copy of the owning template JSON (`templates/index.json` for homepage hero unless another template owns the surface).
   - Record the template `sections` keys, each relevant section `type`, and the `order` array.
   - Confirm the intended section instance exists and any replaced/default hero instance was removed from `order`.
   - Count rendered hero/banner candidates in the preview DOM and compare to `expected_section_counts` or the brief. Use specific selectors first (custom class / section id), then broader selectors only with manual inspection:

```js
[
  ...document.querySelectorAll('.brand-hero, .pawlick-hero, [data-section-type="hero"], .hero, .image-banner')
].length
```

   - Also count H1s when the hero owns the only homepage H1. More than one visible first-screen hero/H1 is a warning or blocker depending on intent.
   - Evidence must include: `template`, `order`, `expected_count`, `actual_dom_count`, selector used, and screenshot path when available.
   - Do not accept `document.body.innerText.includes('Liquid error') === false` as a banner pass. It only proves one error string is absent.

3. **The auditor opens the rendered preview in an actual browser and inspects it for the visual scope.** Banner, hero and visual decoration require desktop `1920x1080` and mobile `390x844` screenshots and successful inspection on the affected pages. Nonvisual tasks retain their functional/render checks without this screenshot gate. Use browser and image-inspection tools directly, without spawning another agent; Main Agent does not perform a duplicate screenshot pass. Capture screenshot paths and mobile `document.documentElement.scrollWidth` vs `window.innerWidth`. Assess the applicable items below with actual observations; identify inapplicable items instead of inventing image or layout requirements:
   - **Image resolution / sharpness**: is the banner/hero image crisp, or visibly blurry / pixelated / upscaled-looking / low-DPI on the rendered page?
   - **Banner occlusion / overlap**: is any part of the banner image covered or obscured by overlapping text, buttons, badges, or another section? Is the key subject hidden behind an overlay or gradient?
   - **Button & CTA text alignment**: is button label text centered within the button (not off-center, clipped, wrapping awkwardly, or overflowing the button edge)? Are CTAs aligned as intended?
   - **Text legibility & contrast**: is heading/subheading/CTA text readable against the banner (not washed out, not colliding with a busy part of the image)?
   - **Content-edge alignment / flush-edge check**: does the hero/banner text block have a real horizontal inset from the viewport edge? It should visually align with the normal page content / product grid edge, not sit flush against the browser edge. Desktop text/content left offset should be clearly >0 (typically ≥32px unless the theme intentionally uses a full-bleed art direction); mobile should retain reasonable padding (typically ≥16px). A section that is flush-left but not overflowing still fails. Capture DOM evidence when possible: `document.querySelector('<hero content selector>').getBoundingClientRect().left` on desktop + mobile, plus screenshot paths.
   - **Empty-band**: is there visible whitespace where an image should fill its container?
   - **Subject-clipped**: is a product, face, heading, CTA, or price cropped or pushed off-frame?
   - **Mobile-overflow**: is there real horizontal scroll or visibly cut-off content?
   - **Mobile reflow**: on the `390x844` shot, does the banner still look intentional (text not overlapping the image subject, button still centered, image not stretched)?

   Do NOT claim the decoration "looks good" / "renders correctly" without successfully inspecting these screenshots. Saving, uploading, or returning a screenshot URL proves capture only. An unavailable or failed image-analysis/viewing tool leaves visual checks `not_checked`; DOM/ARIA snapshots, computed CSS, image dimensions and HTTP success cannot replace observations of sharpness, clipping, overlap or legibility. Preserve successful HTML/DOM checks in `verified_rendering`, explicitly scoped to those checks; they are not a visual pass. Follow the evidence handoff below when inspection cannot be completed.

4. If a visual check fails, the auditor returns its findings to Main. Main
   coordinates at most two fix iterations across local and remote checks:
   - Wrong image aspect: hand the image requirement to Main Agent under `shopify-theme-craft`'s image contract; have the decorator apply the approved replacement, then re-run validation.
   - Blurry / low-resolution image: return the observed problem for an approved higher-resolution replacement under the same image contract, then re-run. This read-only Skill does not generate or upload media.
   - For overlap, clipped subjects, off-center labels, inconsistent content edges or mobile overflow, Main passes the auditor's observed defect, affected surface/viewport, screenshot and intended visible result to `shopify-theme-decorator`. Include measured offsets or overflow where available; the decorator selects the implementation.
   - The auditor rechecks affected observations after the fix and retains valid evidence for unchanged checks. Main reviews coverage instead of repeating browser operations. Neither role changes approved copy/assets or narrows the scope to hide a defect.

5. The auditor returns evidence; Main records acceptance using the final-report procedure below. Preview-only work
   ends with the verified draft; follow the publication handoff only when that
   outcome was requested. A successful preview is not publication consent.

## Publication handoff and completion layers

Main Agent owns publication decisions and final task state for standalone,
builder and monitoring workflows. The decorator owns theme implementation and
self-checks; Main's optional local watcher follows Theme Craft's process protocol.
The auditor owns independent concrete checks and evidence. This
validation Skill remains read-only.

| Layer | Evidence and owner |
|---|---|
| Files deployed | For requested file changes, decorator returns changed files with remote content/checksums and validation results. Pure publication has no new file-deployment claim. |
| Theme wired | For requested implementation changes, decorator verifies template instance/type/order and actual asset bindings, not just file existence. |
| Preview rendered | Auditor verifies the exact dev-theme preview contains the requested content/behavior and section instances within scope; password HTML is not a pass. |
| Visual result verified | Auditor successfully inspects required desktop/mobile screenshots of affected surfaces and records observations. Main reviews the returned evidence and scope coverage. Screenshot capture alone is insufficient. |
| Publication authorized | Main Agent shows the exact theme, verified `?preview_theme_id=` URL and effect of replacing the live theme, then obtains an explicit publish decision. |
| Production verified | After the publication-only action, Main dispatches the auditor with `scope: "post-stage-3"` to verify the live theme ID and requested live outcome under `post_publish_live`. Auditor records identity, functional/render and required visual evidence separately; Main uses that report for the completion decision. |

“Looks good” authorizes publishing only when it answers a preview explicitly
asking to publish that exact theme. Silence, emoji, unrelated replies, “you
decide” or “随便” do not authorize it. Reuse an existing explicit approval for
the unchanged publication action; do not ask twice. A different theme, changed
content or expanded scope needs a fresh preview and approval.

After approval, Main Agent loads `shopify-execution`, selects and validates only
the publication operation through `shopify-admin`, and executes it through the
existing `shopify-use-shopify-cli`. It never edits theme files or takes over the
decorator's failed implementation. Following a timeout or indeterminate result,
reconcile the live theme ID before attempting publication again.

Report the actual completion layer. File success alone cannot be reported as a
rendered or visually verified change; a verified dev preview cannot be reported
as live. A blocked/failed required check stays `PARTIAL` with evidence and
remaining work. Return unfinished theme changes to the decorator as business
outcomes plus current evidence. Reuse valid receipts for unchanged checks; do
not repeat a successful write to obtain evidence. Publication approval and
production success are separate facts.

### Visual evidence handoff and final report

The auditor reuses the existing findings (`area`, `finding`, `evidence`,
`recommended_fix`, `owner`) and handoff fields, saving its actual checks as
task-local JSON. Main Agent reviews the original task against the reported
coverage, identities, failures and limitations. For original tasks containing
file/content changes, it also reviews the outcome hash and records the theme
stage through the existing build checkpoint, including for a standalone draft.
An absent/incomplete required auditor report stays partial; Main coordinates the
missing check instead of inventing observations or accepting the writer's
self-report as independent acceptance. Standalone
read-only audits need no build checkpoint. This needs no merchant input.
The serialization is described in
[`build-checkpoint.md`](../dtc-builder/references/build-checkpoint.md#theme-acceptance-receipts).
Keep preview and live receipts separate, and preserve failures instead of
writing only a successful summary.
For file/content-change checkpoint acceptance, bind the receipt to the outcome report used in this actual validation with
`theme_outcome_sha256`; a previous check of the same theme ID does not validate
newly changed content. Keep native partial/blocking fields when serializing
the findings, rather than replacing them with a passing subset.

For a task whose original scope includes file/content changes, before a final
completion claim or task-board update Main runs checkpoint `record`
with the current outcome and applicable remote validation receipts, then
`snapshot`. Read `data.checkpoint.stages.theme.status`, its `remaining`, and
`data.receipt_problems`; an exit code of zero or top-level `status: ok` only means
the snapshot command ran. Claim completion only when the theme stage is
`completed`, has no remaining work and has no receipt-integrity problems for
that stage. A failed record, missing receipt, timeout, or required check not
performed stays `partial`;
preserve the successful draft and explain the remaining acceptance step. A
verified preview awaiting requested publication approval is
`awaiting_confirmation`, not a completed publication. Follow
[`build-checkpoint.md`](../dtc-builder/references/build-checkpoint.md) for the
commands; do not invent another completion script.

For an original pure-publication task, Main completes the task and task-board
entry from the still-applicable explicit authorization, verified canonical
store/exact theme, passed applicable `admin_preview` and `post_publish_live`
audits, and the original successful `themePublish` response with `userErrors: []`
and that theme's `id` / `role: MAIN`. If the write response was lost or timed out,
retain the unknown result and use read-only reconciliation containing
`shop.myshopifyDomain` and the exact `theme.id` / `role: MAIN`; it proves current
publication state, not the mutation's timing or consent. Save these original
responses and audit receipts in the task workspace. Reuse existing authorization
for the unchanged action and do not repeat publication to obtain a receipt.
This branch requires no decorator brief, `theme-outcome.json`,
`theme_outcome_sha256`, or theme checkpoint `record`/`snapshot`; do not add a
checkpoint schema, stage or CLI for it. Any missing required identity, render or
visual evidence keeps acceptance partial. A successful publication may be
reported separately, but it never clears outstanding acceptance of an original
decoration task or changes that task's checkpoint to completed.

- For a visual check, record the page/theme, viewport, screenshot path or URL,
  and the observation made after successful inspection. A desktop check does
  not establish mobile coverage, and preview evidence does not establish the
  live page's appearance.
- If screenshot inspection fails or is unavailable, preserve the error and
  mark the affected checks `not_checked` in the finding. A successful alternate
  image-viewing method may complete those checks; otherwise retain the gap.
  Do not run theme/CSS fix iterations for an inspection-tool failure without an
  observed storefront defect.
- Main Agent reads the returned evidence and limitations, including any
  `Error/Blocker` section, before summarizing a browser/auditor delivery.
  `Status: Success`, saved screenshots and successful DOM/CSS assertions never
  override an explicit visual-inspection failure. Carry unresolved checks into
  the existing `pending_main_agent_action` or `next_steps_for_main_agent`.
- An incomplete required visual check keeps the visual acceptance gate
  incomplete; retain the existing publication-approval requirements. If the
  merchant explicitly accepts the disclosed visual gap and authorizes publishing
  the exact theme, retain that decision with the unresolved finding and use the
  existing publication-only handoff. This does not make the visual check pass.
  If the authorized theme publication has already succeeded, preserve that
  business result and report the missing visual evidence separately. Do not
  mark the publication failed, repeat it, or claim full visual success to hide
  the gap.

When publication and live-theme identity have their own successful evidence,
for example: “The theme is published and the live theme ID is confirmed. DOM
checks found the expected heading and footer colour. Visual review is still
incomplete because screenshot inspection failed; the saved screenshot is
available for review.” Claim sharpness, readability, intentional layout or
complete desktop/mobile verification only when those observations were made.

## Static Theme Checks

Run applicable checks for affected files and their dependencies. Reuse valid
executor receipts for unchanged static checks; a local path does not trigger an
unrelated full-tree audit. Run a full Theme Check only when required by scope
and a usable complete tree is available:

1. Confirm expected files exist: `templates/*.json`, `sections/*.liquid`, `snippets/*`, `assets/*`, and relevant `config/*`.
2. Strip Shopify auto-generated JSON comment headers before parsing templates.
3. Confirm every template section `type` resolves to a real `sections/<type>.liquid` file.
4. Confirm Liquid asset references such as `{{ 'hero.png' | asset_url }}` resolve under `assets/`.
5. For banner/hero changes, confirm the owning template `order` contains exactly the intended banner/hero section IDs. If the intended result is one hero and `order` still contains both a native `hero`/`image-banner` instance and a custom hero instance, mark blocking.
6. Run Theme Check:

```bash
shopify theme check --path <local-theme-dir> --fail-level error --output json --no-color
```

Errors introduced by the change or preventing its requested result are blocking.
Keep unrelated pre-existing errors and unavailable checks explicit under the
original scope; a full-tree count alone must not widen a narrow task's gate.

## Render Checks

Select real pages from the task's affected surfaces; this is not an all-pages checklist:

- Homepage: `/`
- PDP: `/products/<changed-or-sampled-handle>`
- Collection: `/collections/<changed-or-sampled-handle>` or `/collections/all`
- Cart: `/cart` when navigation, cart, product form, or buying path changed

For each page, record:

- HTTP status.
- Whether the response is a password page, 404, empty shell, or real storefront page.
- Expected content: section text, hero headline, product title, price, image URL/alt, Add to cart, navigation links.
- Expected vs actual hero/banner count when the page includes banner/hero changes.
- Evidence: short HTML excerpt, page metadata, CLI output line, or screenshot path.

## Visual Checks

When visual inspection is required, capture affected pages at:

- Desktop: `1920x1080`
- Mobile: `390x844`

Save each inspection's report and local screenshots at distinct immutable task
paths. Reinspection uses new files; do not overwrite earlier captures referenced
by checkpoint receipts. Retain the tool-returned URL when a local file is not
available.

Inspect for:

- blank pages or empty bands where images should fill containers
- duplicate/default banner or hero sections that should have been removed
- clipped hero/product subject, CTA, heading, price, or Add to cart
- text overlap or button occlusion
- missing images
- password page instead of storefront
- unwanted horizontal scroll

For mobile overflow, record:

```js
document.documentElement.scrollWidth
window.innerWidth
```

If `scrollWidth > innerWidth`, identify the widest overflowing element unless it is an intentional off-canvas drawer or skip link.

## Store Readiness Checks

Use only for requested `pre_launch` and `full_audit` scopes. Preserve the user's
intended private/draft state and report unavailable configuration evidence:

- Products: ACTIVE products are published to Online Store and have media, price, variants, and inventory policy. Supplier/source metadata is optional supplemental context for every product and is never verified or treated as a readiness condition.
- Navigation: header/footer links resolve and expose the buying path.
- Policies: Privacy, Refund, Terms, Shipping, and any jurisdiction-required pages are present and not placeholders.
- Payment/shipping/tax: verify configured signals where available; report unknowns as not checked, not as pass.
- Password page: if still enabled before launch, mark as blocking unless the user explicitly intends to stay private.
- Markets/currency/locale: consistent with advertised regions.
- SEO/schema smoke: title/meta/schema exist on sampled pages; deeper SEO belongs to `shopify-page-auditor`.

## Result Format

Return findings as evidence-based records:

- `BLOCKING`: prevents the original requested outcome or leaves a required check incomplete.
- `WARN`: should fix soon, but not necessarily launch-blocking.
- `INFO`: useful observation or explicit not-checked item.

Each finding must include:

- `area`
- `finding`
- `evidence`
- `recommended_fix`
- `owner`: `main-agent`, `shopify-theme-decorator`, `shopify-product-editor`, `shopify-admin`, or `merchant`

Include the original task, exact checked resources/surfaces and required checks
in the report so Main can assess coverage. Separate unrelated recommendations
from acceptance blockers. Do not claim a check passed without evidence.
For a public-page diagnostic, identify the requested and observed URLs; omit
unknown canonical store/theme IDs. Missing internal identities are not findings
when the requested page checks do not need them. Access or inspection failures
remain explicit unchecked work, not a reason to add OAuth/Admin requirements.

## Forbidden

- Do not push theme files, run `themeFilesUpsert`, or publish a theme.
- Do not edit live theme files.
- Do not use public storefront root as proof for an unpublished/dev theme.
- Do not treat `/password` HTML as a successful storefront render.
- Do not create products, upload media, change inventory, or alter policies.
- Do not ask the user for raw Admin API tokens.
- Release task-owned browser/Playwright sessions after validation. During local
  preflight Main keeps its managed watcher available and owns process recovery
  and cleanup under Theme Craft's process protocol. The auditor never starts,
  restarts or stops it. Main confirms watcher exit before the decorator's final
  remote read-back and the auditor's remote acceptance.
  Do not stop unrelated browser or development sessions.

## Weak Model Guardrails

- Establish the actual targets needed for the requested checks from current
  evidence; refresh missing or stale state rather than trusting memory.
- Record the observed URL and any verified target ID required by the selected scope.
  A public-page diagnostic may omit unknown IDs and needs no canonical domain.
  Local preflight and narrow read-only reviews do not require discovering both
  live and dev themes or unrelated Admin configuration.
- Keep `admin_preview` and `post_publish_live` separate.
- Verify requested functional/render behavior and required visual evidence;
  nonvisual work does not acquire a screenshot gate.
- Use targeted evidence. A generic "looks good" is not a validation result.
