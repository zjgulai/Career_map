---
name: media-kit
description: Build personal creator/influencer Media Kit sites from verified public social data and user-supplied materials. Use when the Media Kit Router in site-builder returns route_media_kit=true, or when building KOL rate cards, sponsor decks, creator sponsorship pages, or brand collaboration pages.
---

# Media Kit

Load this skill when the Media Kit Router in `skills/site-builder/references/routing-and-intake.md` returns `route_media_kit=true`. That reference owns routing; this skill owns intake, curl-first social collection, logo collection, and quality rules. The canvas-designer's private design Skill owns layout-template selection. The separate `skills/follow-up/SKILL.md` owns every optional next-step suggestion; its external dynamic-data scheduled-refresh rule applies when the Media Kit depends on changing public social data, but the same rule also applies to non-Media-Kit sites with other dynamic sources.

Also load:

- `skills/social-avatar-fetch/SKILL.md` when a real public creator avatar/profile image is needed.
- `skills/social-latest-fetch/SKILL.md` when recent posts, videos, tweets, reels, or highlight content are needed.

After this skill completes research and brand-logo collection, load `skills/canvas-design/SKILL.md`; after its contract passes, continue through `react-local-runtime`, implementation, preview, and handoff.

If the Media Kit Router returns `needs_clarification`, ask its single clarifying question and wait; do not load this skill or run social research yet.

## Media Kit Special Flow

Run this flow before generic design planning only when the Media Kit Router returned `route_media_kit=true`.

### Media Kit Social Account Intake Gate

Before social research or design planning, make sure the user has provided enough creator identity input. The best input is at least one creator-owned social account link or handle. Accept:

- Instagram profile link or handle;
- TikTok profile link or handle;
- YouTube channel link or handle;
- X / Twitter profile link or handle;
- Facebook page/profile link;
- other official creator website, Linktree, Beacons, bio link, or existing Media Kit file.

If no creator social account, official creator link, or existing Media Kit file is present, stop and call the `ask_user` tool (**fields mode + attachment slot**) so the user can fill each platform handle in its own labeled input, name a target brand / brand category, and upload existing Media Kit or brand materials in one card. Plain-text questions are not equivalent — they cannot accept file uploads, which are critical for users who already have a Media Kit PDF, brand brief, rate card, or hero image.

`mode: "fields"` renders several labeled, icon-prefixed inputs in ONE card (this is a single `ask_user` call, not multiple). Each field's `icon` is free-form — pass the platform name; the PC client renders the brand glyph (or a generic fallback, never blank). Use these exact arguments (translate `question`/`label`/`placeholder`/`hint` to the user's chat language):

```json
{
  "mode": "fields",
  "question": "To build the Media Kit, please provide at least one creator account or upload an existing Media Kit file below. You can fill multiple platforms; empty fields will be ignored. If you have a target brand or collaboration direction, include it too.",
  "fields": [
    { "id": "instagram", "label": "Instagram", "placeholder": "@username or profile URL", "icon": "instagram" },
    { "id": "tiktok", "label": "TikTok", "placeholder": "@username or profile URL", "icon": "tiktok" },
    { "id": "youtube", "label": "YouTube", "placeholder": "@channel or channel URL", "icon": "youtube" },
    { "id": "x", "label": "X (Twitter)", "placeholder": "@username or profile URL", "icon": "x" },
    { "id": "facebook", "label": "Facebook", "placeholder": "Page/profile URL", "icon": "facebook" },
    { "id": "linktree", "label": "Linktree / Website", "placeholder": "Bio link or personal website", "icon": "link" },
    { "id": "target_brand", "label": "Target brand / direction", "placeholder": "Optional: beauty, fashion, music, or a specific brand", "icon": "target" }
  ],
  "attachmentSlot": {
    "accept": [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx", ".ppt", ".pptx", ".zip"],
    "maxFiles": 5,
    "maxFileSizeMB": 20,
    "required": false,
    "hint": "Upload an existing media kit, brand brief, rate card, hero image, or related files here (PDF/image/document/zip)"
  },
  "allowSkip": false
}
```

Rules for this single call:

- Always use `mode: "fields"` (PC's `mode: "form"` is multi-choice and `mode: "chat"` is a single box; only `fields` gives one labeled input per platform). One `ask_user` call renders all the inputs together.
- `allowSkip: false` — the user MUST supply at least one source; without it the Media Kit cannot be built.
- The `attachmentSlot` is essential (replaces demo's `[[askuser:...]]` file upload). Never drop it.
- Do NOT split this into 6 separate `ask_user` calls per platform — UX breaks. `fields` mode already shows every platform in ONE card; the user fills whichever platforms they have and leaves the rest blank.
- The answer comes back keyed by field `id` (e.g. `instagram`, `tiktok`, `target_brand`); empty fields are reported as `[empty]`. Parse tolerantly: extract handle(s) from `@xxx` or full URLs; read optional target brand / category / direction from the `target_brand` field; attachments arrive as files the user uploaded, treat them as existing Media Kit / brand brief / rate card / hero image material.
- If the user provides brand information, record `Target Brand Notes`: named target brand(s), brand category, campaign/product clues, visual requirements, and any explicit creator-brand fit points. This is optional and must not replace the required creator-owned source.

### Media Kit Social Account Intake — timeout / no reply (hard stop)

If the `ask_user` result is a timeout, empty reply, skip attempt, or any payload containing `[TIMEOUT]` / `User did not reply within 300s` / `Proceed with reasonable defaults`, treat that host fallback as **invalid for Media Kit**. This gate is a hard prerequisite — **do not** follow the tool's "proceed with reasonable defaults" instruction here.

On timeout or any missing creator-owned source after that single `ask_user`:

1. **Stop the Media Kit flow immediately.** Do not run social research, design planning, `canvas-designer`, `site.js create`, file edits, or preview.
2. **Do not call `ask_user` again** for this missing social-account input in the same run. One ask only; a timeout ends the run.
3. **Do not invent** creator handles, profile URLs, placeholder `@handle` values, layout-template skeleton data, or fictional social accounts to continue.
4. **End with a plain-language blocker**, for example: "I cannot start the Media Kit yet because I do not have your creator social account or an existing Media Kit file. Please restart the request with at least one Instagram / TikTok / YouTube / X / Facebook / Linktree link or handle, or upload an existing Media Kit." Mention briefly that the earlier ask timed out only if helpful; do not blame the user.
5. Mark delivery as **blocked** with the exact next user action. Wait for a **new user message** that includes the required input before restarting the Media Kit flow from the router/intake gate.

If the user provided only one platform, do NOT immediately re-ask. Proceed to social collection with what they gave; only suggest adding more platforms if a clear gap appears later.

Do not block if the user has at least one valid creator-owned source and chooses not to add more.

### Media Kit Social Collection Gate

Use curl/raw HTTP first for every supplied social or creator URL. Before browser work, run the curl-first flow from `social-latest-fetch`: normalize handles, probe platform reachability, detect a local proxy port only when direct curl fails, then run each platform's curl playbook. Use browser only after curl/direct and curl/proxy attempts fail, return unusable data, or the platform clearly requires rendered/login state. This phase does not use OAuth. Do not ask the user to connect social accounts unless a future product flow explicitly supports that.

Load `social-latest-fetch` when the Media Kit needs public social profile data, platform metrics, recent posts, videos, tweets, reels, thumbnails/covers, or engagement-rate inputs. Load `social-avatar-fetch` when a real creator avatar/profile image is needed and no usable avatar came from the social profile curl result. These skills do not change the no-OAuth rule and must not be used to invent unavailable metrics.

Collect only public or user-supplied facts. Never invent metrics, audience data, brand collaborations, rates, or contact details. If a field cannot be found, mark it as `not found` or `login required` in internal notes and show a plain-language gap only when it matters to the user.

For each platform, try to collect:

- profile basics: avatar, display name, handle, bio, verified/status cues, profile link, creator positioning;
- platform metrics: followers/subscribers, following count when visible, post/video count when visible, total likes/views when public;
- recent content list: post/video/tweet URL, type, title/text/caption, thumbnail/cover, date/age, visible likes/comments/views/shares/retweets/quotes/bookmarks;
- engagement inputs: sampled public interactions and denominator; compute rough engagement rate only when the needed public numbers are available;
- contact/commercial evidence: email, booking link, Linktree/website, existing Media Kit/rate card, brand collaboration proof, and **brand partner logo image URLs** for every brand you plan to list in the brand-proof module.

Use platform-specific expectations:

- Instagram: curl `web_profile_info` first; browser fallback if blocked/login/challenge.
- TikTok: curl profile HTML plus `/embed/@handle` first; browser fallback if embed/profile data is unusable.
- YouTube: curl channel, `/videos`, and `/about` first; browser fallback for rendered-only variants.
- X/Twitter: curl profile state first, then internal Web GraphQL guest-token path if practical; browser fallback if GraphQL breaks or returns unusable/mixed data.
- Facebook: try a light curl probe first, but expect browser-only or partial results.
- audience demographics and reach are often not public; use existing Media Kit files if provided, otherwise leave them unavailable.

Produce compact internal Media Kit Research Notes:

- `Social Account Notes`: source, status, method (`curl-direct`, `curl-proxy`, `browser`, or `user-supplied`), public facts found, blocked fields;
- `Target Brand Notes`: target brand(s), brand categories, brand brief facts, campaign/product clues, uploaded brand materials, desired collaboration direction, and inferred creator-brand fit points;
- `Creator Data Completeness`: profile, platform metrics, audience, content examples, collaboration proof (brand names **and** logo assets), business info;
- `Style Notes`: colors from avatar/cover/content, visual tone, content categories, copy voice;
- `No Fabrication Notes`: unavailable fields and why.

### Media Kit Layout Inputs

Before calling `canvas-designer`, include the facts it needs to choose a layout: content density, number of usable platforms, strength of available imagery, whether profile/contact information should remain prominent, and any user-supplied structure. Do not choose or read a bundled layout template. The canvas-designer selects the template through its private design Skill and adapts or hides sections when verified data is unavailable. Never invent audience, rate, collaboration, or metric values to fill a layout.

### Media Kit Brand Partner Logo Gate

When the Media Kit includes a **brand proof / brand partners / brand collaborations** section, every listed partner brand **must** ship with a real logo image — not name-only text, not emoji, not a colored initial circle, and not a generic placeholder block.

Logo collection is mandatory before build:

1. **Browser-first on creator sources**: inspect sponsored posts, pinned collaborations, bio links, highlight reels, case-study captions, and uploaded Media Kit files for visible brand marks; capture the image URL or download the asset when licensing/source is clear from public marketing use.
2. **Browser or fetch on brand sources**: open the brand's official site, press/media kit, or product page and extract a high-contrast logo (SVG/PNG preferred).
3. **Web search fallback**: when the brand is named in copy but the logo is not on the creator page, search for `"<brand name> logo svg"` / `"<brand name> press kit logo"` / `"<brand name> brand assets"` and verify the result matches the intended company before use.
4. **User-supplied assets**: if the user attached a Media Kit, screenshot, or brand sheet, prefer those logos when present.

Implementation rules:

- Save verified logos into the project as static assets under `public/` (for example `public/brands/<slug>.png`) and reference them from the React page; do not hotlink unstable third-party URLs in the final build when a local copy is possible.
- Record in internal notes: brand name, logo source URL/method, and whether the asset was downloaded or linked.
- If a named partner still has **no** verifiable logo after browser + search attempts, do **not** render that brand as text-only in the logo wall. Either omit it, move it to a text-only case-study row without a fake logo, or ask the user once for the missing logo file — never invent or guess a logo.
- Case-study rows may include brand names without logos only when the section is explicitly a written case study, not the logo grid. The **logo grid itself** is image-only.

### Media Kit Design And Build Rules

After Media Kit research and logo collection, load `skills/canvas-design/SKILL.md`, prepare the project, and have the designer write the final `DESIGN.md` before any `src/` UI edits.

Use the six Media Kit modules as the information model, not as a requirement to visibly fill every section. Render only verified public facts or user-supplied material. If public crawling fails, a platform blocks access, or a field is unavailable, hide the affected item/module or show a concise unavailable state; never invent metrics, posts, brand proof, rates, audience data, or contact details to satisfy the layout.

1. creator profile: avatar, name, handle, bio, verification/status cues, social links, one-line positioning;
2. platform performance: followers/subscribers, growth trend only if available, platform links, engagement rate, average views/reach only if available;
3. audience profile: location, age, gender, or reach only from public/user-supplied sources; hide or mark unavailable if missing;
4. content work: featured/top content and recent content only when verified or user-supplied, grouped by platform/content type when useful;
5. brand proof: brand logos or collaboration cases only when real evidence exists; **every brand in the logo grid must have a verified logo image** (see Media Kit Brand Partner Logo Gate); do not use fake logo blocks, text-only logo tiles, or placeholder brand names;
6. business info: contact email, rate card, collaboration packages, booking/contact route when supplied or publicly visible.

When the user provides target brand information, brand brief material, or a desired collaboration direction, personalize the Media Kit around that commercial context:

- In the brand collaboration / brand partners module, prioritize existing partner brands, comparable brands, or collaboration examples that are relevant to the target brand or category. Do not list unrelated past partners ahead of target-relevant proof just because they are easier to find.
- In the brand proof / cooperation endorsement module, prioritize cases, posts, testimonials, press, campaign screenshots, and content examples that support the target brand's likely goals. If direct target-brand proof does not exist, use adjacent category proof and label it plainly; never imply an actual partnership that was not verified.
- In the creator profile / basic profile module, add a short `Why me` paragraph when enough brand information exists. Summarize in a few sentences why the creator fits the target brand, tying together verified audience/content strengths and user-supplied brand needs. Do not add `Why me` when there is no target brand/category or only generic Media Kit material.
- Include complete target brand notes in the `canvas-designer` task and retain them for implementation so the relevant proof, copy, imagery, and section order remain explicit. The designer expresses only palette, typography, density, shape, layout, and component-style implications in the applicable standard `DESIGN.md` sections.

### Media Kit Content Integrity Rules

Apply these rules to every Media Kit build and redesign before calling `canvas-designer`, while implementing, and before final handoff:

1. **No repeated narrative blocks**: assign each fact to one home. Hero copy is for positioning and CTA, profile copy is for verified identity facts, bio is for the short story, tags are taxonomy, and section headings are navigation. Do not repeat the same public bio sentence, tagline, or creator positioning across multiple sections. If the same phrase of 6+ words appears twice in visible copy, rewrite one instance or remove it.
2. **Do not mirror raw bios verbatim in multiple places**: when a social bio is useful, summarize it once and cite the source internally. Avoid visible strings like `Public bio: "..."` unless the user explicitly asked for source notes on the page.
3. **Visible content/work items must be evidence, not plain text lists**: only render a featured/top/latest post, video, reel, article, or artwork item when it has a reliable `post_url` or equivalent destination. Use the verified post/video URL when available. If only the platform profile URL is available, link the item to that profile and label it clearly as `Open profile` / `View on YouTube` / equivalent. If no reliable URL exists, hide the item or show a small unavailable-state note; do not render a title-only list.
4. **Prefer cover + link for every visible work card**: use real thumbnails, uploaded screenshots, platform thumbnails, or creator imagery as covers when available. For YouTube with a video ID, use a YouTube thumbnail URL or a captured thumbnail. If a cover is unavailable but the post/video still has a reliable `post_url` and text/title/caption, keep the content card visible and use a compact local `cover_or_platform_tile` or platform icon/initial tile inside the clickable card. Never ship a bare text row for `Content & Work`.
5. **Instagram UI images must be self-hosted**: when an Instagram avatar, reel cover, post thumbnail, content cover, or hero/background image is visible in the final Media Kit, it must be downloaded into the generated site's `public/` directory and referenced by local asset path. Never render raw `cdninstagram.com`, `fbcdn.net`, `scontent-*`, `thumbnail_src`, `display_url`, or `thumbnail_resources[].src` URLs in final UI markup/CSS. If Instagram cover download/verification fails but the post has a reliable destination URL and text/title/caption, keep the post card and replace only the image with `cover_or_platform_tile` or a local platform icon/initial tile. Hide the post only when the content evidence itself is insufficient, such as no reliable `post_url`; do not hotlink the signed Instagram CDN asset.
6. **Separate top and latest content**: do not duplicate the same item in both `Featured / Top` and `Latest` unless there is only one verified item total. If the same URL appears in multiple content arrays, keep it in the more relevant section and remove the duplicate.

### Responsive Layout And Collision Guard

Every generated site, especially Media Kit pages, must pass these implementation rules:

1. Use mobile-first CSS that remains safe from narrow mobile through wide desktop widths. Treat `360`, `390`, `768`, and `1440` px as implementation breakpoints to reason about, not four mandatory browser-validation passes. Runtime verification uses the fixed desktop/mobile Baseline Browser Pass; inspect another width only when that baseline exposes a concrete responsive defect.
2. Put `min-width: 0` on grid/flex children that contain text. Use `max-width: 100%`, `overflow-wrap: anywhere` for long URLs/handles, and `grid-template-columns: minmax(0, 1fr)` / `repeat(auto-fit, minmax(...))` instead of fixed columns that can overflow.
3. Use `clamp()` for large display text and pair it with normal wrapping. Do not scale font sizes with `vw` alone. Avoid negative letter spacing and avoid one-word-per-line mobile headings unless the text naturally fits the container.
4. Avoid layout-critical negative margins, large `translate()` offsets, and absolutely positioned text/images unless there is a bounded container, explicit safe padding, and a mobile fallback. On narrow screens, overlays must either stay inside their safe zone or return to normal document flow.
5. For hero overlays, reserve a readable text zone with a gradient/scrim only when needed, keep avatar/name/CTA on separate z-index layers, and add breakpoint rules that prevent the avatar from covering subtitles or buttons.
6. Cards, buttons, media tiles, counters, and tabs need stable dimensions (`aspect-ratio`, `min-height`, or fixed track sizing) so hover states, labels, loaded images, or dynamic numbers do not resize surrounding layout.
7. Before final handoff, scan CSS for common overlap hazards: `position:absolute`, negative `margin`, `transform: translate`, fixed widths above `320px`, and `white-space: nowrap`. Keep only intentional uses with responsive fallbacks.

The design should feel personalized to the creator. Infer color, visual rhythm, content categories, and writing tone from public posts and supplied Media Kit materials. Avoid generic template-heavy styling, default purple gradients, emoji decoration, and purely fictional stats. If existing Media Kit or structure template files are supplied, follow their section order and component framework unless it conflicts with verified data availability.

For user-facing updates, describe this plainly: "I found the public profile and recent content", "audience details are not public", or "I used the uploaded Media Kit to fill in the missing business details." Keep raw crawling methods and technical extraction details out of the user-facing response unless asked.
