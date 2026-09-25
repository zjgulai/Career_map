---
name: link-in-bio
description: Build personalized link-in-bio / link aggregation pages (Linktree-style) for creators and personal brands from a real avatar, a handful of links, and the creator's own visual identity. Use when the site-builder classifier sets site type to `link-in-bio`, or when the user asks for a link aggregation page / personal links page / Linktree / Beacons / bio link / "put all my links on one page" / "link in bio". Owns intake, avatar fetch, link modeling, the social-link display rule, and personalized style cues. Do NOT use for data-rich Media Kit / sponsorship page / rate card requests — route those to `media-kit`.
---

# Link in Bio

Load this skill when `skills/site-builder/SKILL.md` classifies the request as site type `link-in-bio`, or when the user asks for a Linktree-style link aggregation page whose value is **one tap-friendly page that points to all my links**, not audience-data pitching.

Also load:

- `skills/social-avatar-fetch/SKILL.md` — **mandatory** whenever a real creator avatar/profile image is needed. A link-in-bio page must ship a real avatar, never a silhouette placeholder.
- `skills/canvas-design/SKILL.md` — for the Canvas design handoff after this skill completes.

After this skill completes intake, avatar collection, link modeling, and style inference, load `skills/canvas-design/SKILL.md`; after its contract passes, continue through `react-local-runtime`, implementation, preview, and handoff.

## When this skill applies vs. Media Kit / portfolio

| Signal | Route |
| --- | --- |
| Linktree / Beacons / bio link / link aggregation page / personal links page, short list of links, no metrics | **link-in-bio** |
| Creator wants brand sponsorships using audience data, rate card, follower counts, brand-collab proof | `media-kit` (run the Media Kit Router first) |
| Showcase work samples / case studies / a project gallery | `personal portfolio` |
| Sell one product / course with a conversion CTA | `landing page` |

If the request mixes signals, such as a link page that also shows follower stats, rate card, or sponsorship packages, prefer `media-kit`. Link-in-bio stays intentionally simple: avatar + name + one-line bio + a stack of link buttons + a social icon row.

## Link-in-Bio Special Flow

Run this flow before generic design planning whenever site type is `link-in-bio`.

### 1. Link-in-Bio Intake Gate

A link-in-bio page needs three things before build: **who** (identity + avatar source), **what links** (the list to aggregate), and **the vibe** (personal style cues). The best input is a creator-owned social account for the real avatar and style cues plus the list of links to display.

Accept any of:

- a creator-owned social account link or handle (Instagram / TikTok / YouTube / X / Facebook) — used to fetch the real avatar and infer visual style;
- an existing Linktree / Beacons / bio-link page to mirror;
- a plain list of links with labels, for example `Our drinks -> https://...` or `My shop -> https://...`;
- an uploaded avatar image and/or background image.

If the user has **not** supplied enough to build (no avatar source and no link list), stop and call `ask_user` **once** (**fields mode + attachment slot**) so the user can fill each social handle in its own labeled input, paste the link list in a dedicated field, and upload an avatar/background in one card. `mode: "fields"` renders several labeled, icon-prefixed inputs in ONE card (still a single `ask_user` call). Each `icon` is free-form — pass the platform name; the PC client renders the brand glyph or a generic fallback (never blank). Use these arguments (translate `question` / `label` / `placeholder` / `hint` to the user's chat language):

```json
{
  "mode": "fields",
  "question": "To build the link-in-bio page, please provide at least one social account for the real avatar and style cues, and paste the list of links you want to aggregate. Empty fields will be ignored. You can upload an avatar or background image below.",
  "fields": [
    { "id": "instagram", "label": "Instagram", "placeholder": "@username or profile URL", "icon": "instagram" },
    { "id": "tiktok", "label": "TikTok", "placeholder": "@username or profile URL", "icon": "tiktok" },
    { "id": "youtube", "label": "YouTube", "placeholder": "@channel or channel URL", "icon": "youtube" },
    { "id": "linktree", "label": "Linktree / Website", "placeholder": "Existing bio link or personal website", "icon": "link" },
    { "id": "links", "label": "Link list", "placeholder": "One per line, format \"Title -> URL\", for example My shop -> https://...", "icon": "list" }
  ],
  "attachmentSlot": {
    "accept": [".png", ".jpg", ".jpeg", ".webp"],
    "maxFiles": 5,
    "maxFileSizeMB": 20,
    "required": false,
    "hint": "Upload an avatar image, background image, or screenshot of an existing links page"
  },
  "allowSkip": false
}
```

Rules for this single call:

- Always use `mode: "fields"` (one labeled input per social platform + a dedicated `links` field). PC's `mode: "form"` is multi-choice and `mode: "chat"` is a single box; only `fields` separates handles from the link list cleanly. One call renders all inputs together.
- `allowSkip: false` — without an avatar source or a link list the page cannot be built.
- Keep the `attachmentSlot`; it is how the user uploads a custom avatar or background.
- **One call only.** `fields` already shows every platform plus the link list in ONE card; do not split into per-platform asks.
- The answer comes back keyed by field `id` (`instagram`, `tiktok`, `links`, ...); empty fields are reported as `[empty]`. Parse tolerantly: extract handles from `@xxx` / full URLs; parse the `links` field row by row as `Label -> URL`, `Label → URL`, `Label: URL`, `Label - URL`, or bare URLs; derive a label from the domain/path only when none is given.

#### Intake — timeout / no reply (hard stop)

If the `ask_user` result is a timeout, empty reply, skip attempt, or any payload containing `[TIMEOUT]` / `User did not reply within 300s` / `Proceed with reasonable defaults`:

1. **Stop the link-in-bio flow.** Do not run browser research, avatar fetch, design planning, `site.js create`, file edits, or preview.
2. **Do not call `ask_user` again** for this missing input in the same run. One ask only.
3. **Do not invent** handles, link targets, avatar URLs, or placeholder content to continue.
4. End with a plain-language blocker, for example: "I cannot start the links page yet because I do not have your avatar source (social account/avatar image) and the link list to display. Please restart with at least one social account or existing Linktree link, plus the links you want to include."
5. Mark delivery as **blocked** with the exact next user action. Wait for a new user message before restarting.

If the user provided enough (at least one avatar source or a link list, and ideally both), do not nag for more — proceed with what they gave.

### 2. Link-in-Bio Avatar Gate (real avatar required)

A link-in-bio page **must** display a real avatar. Placeholder silhouettes, initials-only circles, and generic stock faces are not acceptable as the final avatar.

1. If the user uploaded an avatar image, use it. Save it into the project under `public/avatar.<ext>` and reference it locally.
2. Otherwise load `skills/social-avatar-fetch/SKILL.md` and fetch the real avatar from the supplied social account. Follow that skill's curl-first / browser-fallback platform rules and resolution-upgrade guidance.
3. For Instagram/TikTok signed CDN URLs that are CORS-bound or time-limited, download the image while the URL is usable and self-host under `public/` rather than hotlinking. Prefer a stable platform such as YouTube or X/Twitter if the Instagram/TikTok avatar cannot be self-hosted.
4. For Instagram specifically, any avatar/background/hero/content image visible in the final UI must be a local `public/` asset. Never render raw `cdninstagram.com`, `fbcdn.net`, `scontent-*`, `thumbnail_src`, `display_url`, or `thumbnail_resources[].src` URLs in final markup/CSS; if download and verification fail, fall back to another verified local/remote-stable creator image or a non-image treatment.
5. If no avatar can be obtained from any source, do not fabricate one. Ask the user once for an avatar upload, or — only with the user's agreement — generate a brand mark / monogram logo to use in the avatar slot. This is a logo, clearly not a fake photo of a person.

Record in internal notes: avatar source, method, whether it was self-hosted, and final local/remote URL. For Instagram images, also record the source URL, local path, HTTP status/file size, and verification result.

### 3. Link-in-Bio Link Modeling Gate

Classify every link the user gave into two buckets. This classification drives the **Social Link Display Rule** below.

- **Content/primary links** (non-social): the destinations the page exists to promote — shop, menu, booking, latest podcast/episode, course, portfolio, blog post, newsletter, "find us", affiliate links, "book me", "contact", etc. These are the stacked **link buttons**.
- **Social links**: profiles on Instagram, TikTok, YouTube, X/Twitter, Facebook, Threads, LinkedIn, Twitch, Pinterest, etc. — links whose destination is the creator's own social profile page.

Rules:

- A platform link is social only when it points to the creator's **profile/home** on that platform. A link to a specific shop, video purchase page, course, or external store hosted on a platform still counts as a **content link** if its purpose is a destination, not "follow me here".
- Each link must have a clear short label and a unique URL. Derive a label from the domain/path only when the user gave none.
- Order content links by the user's stated priority; if unstated, keep the user's input order.
- Deduplicate: the same URL must not appear in both buckets.

### 4. Social Link Display Rule (CORE REQUIREMENT — non-negotiable)

Decide how social links render based on whether the page has any non-social content links:

- **Case A — there are content/primary links** (one or more non-social links): render social links **only as a compact icon row** (small platform glyphs, no labels), typically under the link-button stack. Do **not** also render social links as full-width buttons.
- **Case B — there are no content/primary links** (the only links supplied are social profiles): render the social links **expanded as full-width labeled buttons** in the main stack, for example "YouTube Channel", "TikTok", "Instagram". In this case you may omit a separate icon row, or keep a minimal icon row of the same platforms — but the primary presentation is the labeled button stack.

Implementation guidance:

- Compute `hasContentLinks = content_links.length > 0` at build time and branch the template on it. Do not hardcode one mode.
- In Case A, the icon row reflects exactly the social platforms the user provided. Do not pad with platforms they did not give.
- In Case B, each social button uses a human label and links to the profile URL; keep the platform icon inside the button for recognition.
- If the user supplied both content links and social links, that is Case A — icon row only for socials.

Include the resolved case (`A` icon-row-only / `B` expanded-buttons) directly in the `canvas-designer` task and retain it for implementation. The designer expresses only the resulting visual treatment in the standard `Components` section.

### 5. Link-in-Bio Personalized Style Gate

The page must feel like **this** creator, not a default template. Personalization covers **color palette, fonts, and background image**. Infer them from the creator's real material; never default to a generic purple gradient.

- **Background image / treatment**: every example uses a full-bleed, edge-to-edge mobile-card background that expresses the creator. Source it in this priority:
  1. user-uploaded background image;
  2. the creator's own social imagery — their cover/hero photo or a representative public post / reel / video thumbnail. Download and self-host under `public/`;
  3. a brand-relevant generated image with the user's approval through the site-builder image flow;
  4. a solid brand color or subtle gradient derived from the palette when no suitable image exists.

  **Background-vs-foreground readability is mandatory** whenever the background is a photo:
  - Always place a readability layer between the background photo and foreground: a scrim and/or top-to-bottom gradient that darkens or lightens behind the text/CTA zone.
  - Tune overlay direction and opacity from the photo's luminance and aim for WCAG AA contrast.
  - Keep avatar, name, bio, buttons, and icon row on z-index layers above the scrim.
  - If a creator photo still cannot be made readable, fall back in order: crop/reposition to a calmer region, add a solid/translucent panel behind the text block, then drop to the brand-color/gradient background. Never ship a background photo that makes the name, bio, or button labels hard to read.
- **Color palette**: derive 3-5 colors from the avatar, background, and content visual tone. Use one accent for buttons, one for text, with sufficient contrast.
- **Fonts**: pick a personality-appropriate pairing: one display/heading face plus one readable body face. Avoid system-default-only styling when a stronger local/system pairing can convey the creator's vibe. Do not use external font CDNs; follow the site-builder asset/font policy.
- **Button shape as personality**: choose a button shape that matches the creator's vibe (rounded pills, rounded cards with shadow, wavy/scalloped edges, torn-paper edges, etc.) and keep it consistent.

Produce compact internal **Link-in-Bio Style Notes**: palette (hex), font pairing, background source + treatment, button shape, and the one-line tone of the bio copy. Pass these into `skills/canvas-design/SKILL.md`.

### 6. Layout & Component Model

A link-in-bio page is a single, mobile-first, vertically centered card. Top to bottom:

```text
Link-in-Bio (single centered card, full-bleed background)

├── Background layer: background image or brand gradient + readability scrim
├── Avatar: circular real photo or brand mark, centered near top
├── Identity:
│   ├── Display name (+ optional verified badge)
│   └── One-line bio / tagline
├── Primary link stack (Case A): content link button x N
│       (Case B: this stack is the expanded social buttons instead)
├── Social icon row: social links as small glyphs (Case A)
│       (Case B: omit or keep minimal; socials already shown as buttons)
└── Optional tiny footer / attribution
```

Module rules:

| Module | Rule |
| --- | --- |
| Background | Full-bleed within the card; image self-hosted; always a scrim behind text/avatar for legibility. |
| Avatar | Circular, real image, on its own z-layer above the background; never covered by name/buttons on narrow screens. |
| Identity | Name + one short bio line only. The bio sentence lives here once — do not echo it elsewhere. |
| Link buttons | Full-width, equal height, consistent shape, accent color, readable label; whole button is the `<a>`. Render 0-N items. |
| Social row | Icon-only glyphs in a single centered row (Case A). Reflects exactly the platforms provided. |

### 7. Content Integrity Rules

1. **Real destinations only.** Every button and icon must link to a real URL the user supplied or that was verified on the creator's public page. Do not invent links, shops, or profiles to fill the stack. Render 0-N buttons — an empty or single-button page is valid.
2. **No fabricated identity.** Display name, handle, and bio come from the user or verified public profile. If the bio is unknown, use the user's words or a short neutral line; do not invent positioning, stats, or claims.
3. **Real avatar, self-hosted.** See the Avatar Gate. No silhouettes; no hotlinking signed CDN URLs in the final build.
4. **One home per fact.** The bio/tagline appears once. Do not repeat the same phrase across avatar caption, name area, and footer.
5. **Derive labels honestly.** When auto-labeling a bare URL, use the brand/site name or page purpose — not a marketing claim.

### 8. Responsive & Collision Guard

Mobile-first; the page is primarily viewed at phone widths. Design the CSS to remain safe at `360`, `390`, `768`, and `1440` px, but do not turn these implementation breakpoints into four mandatory browser passes. Runtime verification uses the fixed desktop/mobile Baseline Browser Pass; inspect another width only when that baseline exposes a concrete responsive defect. Across the supported range:

1. No horizontal body overflow; the card stays within the viewport with safe side padding.
2. Avatar, name, bio, buttons, and social icon row never overlap. The avatar stays above the background on its own z-index.
3. Button labels never clip: use `min-width: 0`, `overflow-wrap: anywhere` for long labels/URLs, and a `min-height` so buttons keep stable size.
4. Use `clamp()` for the name/display text; do not size fonts with `vw` alone.
5. The background scrim must keep text/avatar readable over busy images at every width.
6. Center the card with `max-width` so it reads well on wide screens too.

## Design And Build Rules

After intake, avatar collection, link modeling, the social-display decision, and style inference, load `skills/canvas-design/SKILL.md` to prepare the project and generate the final `DESIGN.md` before any `src/` UI edits.

Include these product decisions directly in the `canvas-designer` task and retain them for implementation. The designer expresses the visual parts in the applicable standard `DESIGN.md` sections:

- the resolved **Social Link Display case** (`A` icon-row-only or `B` expanded-buttons) and why;
- **Style Notes**: palette (hex), font pairing, background source + treatment, button shape;
- the avatar source and that it is self-hosted/real;
- the ordered content link list and social link list.

Create the project from `templates/react-vite-base`. Branch the link-button section on `hasContentLinks` so Case A and Case B both render correctly from data.

## Completion Gates

Before claiming completion, pass the site-builder **User-Visible Delivery Gate** and **Rendered Preview Verification Gate**:

- Provide a still-running local preview URL formatted according to `skills/react-local-runtime/SKILL.md`, or a blocker + exact next user action.
- Browser-verify the preview is visibly nonblank, React mounted into `#root`, the **real avatar renders** (not a broken image), all link buttons are clickable, and — per the resolved case — socials appear as an icon row (Case A) or as expanded buttons (Case B).
- Confirm mobile fit with no overlap or overflow in the runtime skill's single baseline mobile viewport; use a second narrow width only when the baseline exposes a concrete defect.

Report completion in plain language, for example: "The link-in-bio page is ready: it uses your real avatar, turns your links into buttons, and places social accounts in the bottom icon row. The preview address is below." Keep crawling/extraction details out of the user-facing message unless asked.
