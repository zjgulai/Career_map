---
name: site-builder
description: Orchestrate Accio website and app creation, redesign, extension, local preview, site publish, and Supabase-backed features. Route reference replication and Canvas design into mutually exclusive branches, then coordinate specialized skills, React/Vite implementation, runtime verification, provider safety, and user-visible delivery.
---

# Site Builder

Use this skill as the thin orchestration layer. Load the specialized skill that owns each selected branch instead of reproducing its detailed rules here.

## Global Hard Gates

- Refuse to create, redesign, extend, preview, deploy, or provide implementation guidance for pornography or sexual content, gambling or betting, or political content.
- Payment integrations are still under development. When a user asks for payments, state clearly that Stripe, Alipay, and every other payment channel are currently unsupported. Do not build carts, checkout, online payment forms, payment routes, or payment placeholders. Convert commerce requests into catalog display, inquiry, booking request, waitlist, or off-site contact experiences.
- Keep implementation and side effects in the current task. The selected visual SubAgent writes only the Google-format project-root `DESIGN.md`: canvas-designer grounds it in the private template library, while reference-site-replicator grounds it in rendered browser evidence.
- Keep frontend implementation in the current execution. Do not create, spawn, fork, resume, or delegate to another Agent or SubAgent to write React, CSS, routes, components, or configuration files. Load and follow the `code-generator` Skill directly.
- When calling a design SubAgent, provide the relevant user request, pages, routes, content, interactions, responsive priorities, type-specific requirements, constraints, and research notes directly in its task.
- Require explicit confirmation before `web_builder_publish`, production deployment, remote database mutation, or another cloud/provider mutation unless the user has already clearly authorized that exact action.

## Skill Router

Load only the resources required by the request:

| Trigger | Required owner |
| --- | --- |
| New build, redesign, reference inputs, Media Kit possibility, or Link-in-Bio possibility | `skills/site-builder/references/routing-and-intake.md` |
| Data report, Dashboard, analytics/BI, monitoring, admin panel, back office, CRUD console, or operations workspace | `skills/dashboard-admin/SKILL.md` |
| `referenceReplication=true` | `skills/reference-replication/SKILL.md` |
| Non-replication visual build or material redesign | `skills/canvas-design/SKILL.md` |
| Any React/CSS/font/asset implementation | `skills/frontend-implementation-policy/SKILL.md` |
| Base project, features, install, build, Local preview only, rendered verification, Site publish, or delivery | `skills/react-local-runtime/SKILL.md` |
| Canvas-contract implementation | `skills/code-generator/SKILL.md` |
| Media Kit router returns `route_media_kit=true` | `skills/media-kit/SKILL.md` |
| Request is classified as Link-in-Bio | `skills/link-in-bio/SKILL.md` |
| Real creator avatar or recent social content is required | `skills/social-avatar-fetch/SKILL.md` or `skills/social-latest-fetch/SKILL.md` as directed by the type skill |
| Any Supabase code, database, Auth, RLS, migration, storage, or Edge Function work | `skills/supabase-mcp-backend/SKILL.md` and `skills/safety/SKILL.md` |
| Production database or provider mutation | `skills/provider-operations/SKILL.md` and `skills/safety/SKILL.md` |
| Failed deploy or failed webhook debugging | `skills/safety/SKILL.md`, then `skills/provider-operations/SKILL.md` |
| Explicit SEO or accepted SEO follow-up | `skills/seo/SKILL.md` |
| Explicit structured data, or SEO identifies verifiable entities | `skills/schema/SKILL.md` |
| Before a useful optional final next step | `skills/follow-up/SKILL.md` |

## Canonical Workflow

1. Apply the Global Hard Gates before research, design, or edits.
2. For new builds and material redesigns, load `skills/site-builder/references/routing-and-intake.md`. Run its Media Kit router, Link-in-Bio classification, input sufficiency, reference/asset intake, reference-replication routing, and post-collection clarification in that order. Do not duplicate those rules here.
3. Load and complete any selected type-specific skill. Include its intake, real-data, content-integrity, layout, and completion outputs directly in the selected design SubAgent's task and retain them for implementation.
4. Choose exactly one visual prerequisite:
   - When `referenceReplication=true`, load `skills/reference-replication/SKILL.md`. It prepares the target project and delegates the final Google-format `DESIGN.md` after browser inspection.
   - Otherwise, for a new or materially changed visual system, load `skills/canvas-design/SKILL.md`. It prepares the target project and delegates the final Google-format `DESIGN.md` before React UI implementation.
   - Copy-only edits, bug fixes, provider/API wiring, env/config changes, and small component changes may reuse an existing valid `DESIGN.md` without a new visual prerequisite.
5. For either visual branch, perform project setup inside the selected design skill before delegating the `DESIGN.md` write. Load `skills/react-local-runtime/SKILL.md` and create from `react-vite-base` only if the target project has not already been prepared. For a new project, first call the builtin tool `web_builder_reserve_site_id` and pass its result unchanged: use the returned ID as `--site-id` and its returned status as `--site-id-sync-status` (`synced` or `unsynced`); if the tool is unavailable, omit `--site-id` so the CLI creates a local fallback ID. Create under a direct first-level subdirectory such as `<workspace>/<siteDir>` and outside `plugins/installed`. The compatibility placeholder `<workspace>/<siteId>` denotes the same first-level target shape only; the actual directory name does not have to equal the manifest `siteId`. After setup and any already-required dependency-changing features, run `site.js install` when needed before invoking the selected design SubAgent.
6. Load and follow `skills/frontend-implementation-policy/SKILL.md` and `skills/code-generator/SKILL.md` directly, and consume the selected designer's `DESIGN.md` without rewriting it. Follow `skills/code-generator/references/image-asset-handling.md`, record the Image Manifest in `ASSETS.md`, apply required bundled features, and directly write the frontend from the user request, resolved implementation requirements, `DESIGN.md`, `ASSETS.md`, and existing CDN index. Do not return or delegate implementation to either design SubAgent or any newly created Agent.
7. When backend or provider work is requested, load the owners in the Skill Router before writing provider-dependent code or mutating remote state. Keep local implementation, Site publish, Supabase configuration, provider mutation, verification, and production readiness as separate statuses.
8. Use the dependency-install result from project setup. Run `site.js install` again only when the earlier install failed or dependencies changed afterwards, then run a production build. For any Supabase code, also run `site.js doctor` and satisfy the Supabase skill's migration, RLS, server-boundary, exposure-audit, and manifest gates.
9. Start the Vite preview and run the runtime skill's fixed Baseline Browser Pass against the returned URL. For an ordinary visual build in either branch, do not augment the browser assignment with section-by-section scrolling, repeated console checks, exhaustive interaction traversal, refreshes or additional screenshots. The required evidence is one desktop screenshot, one mobile screenshot and the structured result from `react-local-runtime/references/rendered-preview-probe.js`. A warning never triggers a code change, rebuild, re-verification, or Deep Verification. When Browser returns complete probe results, console classification, screenshot paths, and a clear visual conclusion, accept that result and do not read, open, or inspect the screenshot files again. Enter Deep Verification only from the runtime skill's explicit failure triggers. Do not infer visual success from build output or HTTP status alone.
10. Pass the runtime skill's User-Visible Delivery Gate. Provide a verified public URL, keep a verified local preview running, or state a precise blocker. Before the final response, load `skills/follow-up/SKILL.md` when a useful optional next step exists; do not start optional work before the user accepts it.

## Visual Branch Invariants

- Normalize and deduplicate reference website URLs in the routing reference. Exactly one normalized reference website URL is replication even without an explicit replication verb; explicit replication intent across one or more URLs is also replication. Multiple URLs without explicit replication intent remain Canvas inspiration inputs.
- Reference replication and Canvas design are mutually exclusive. Never call `reference-site-replicator` and `canvas-designer` / `canvas-design` for the same request.
- If the replicator is unavailable or lacks sufficient rendered evidence, follow `reference-replication` failure handling; do not substitute Canvas.
- In both visual branches, scaffolding may happen before design so the selected designer can write `DESIGN.md`; do not implement React UI until that file passes the Google-format contract.
- Both branches produce one project-root `DESIGN.md` before implementation. Retain the user request and resolved implementation requirements, and create the project-root `ASSETS.md` artifact during asset preparation.

## Supabase And Provider Routing

Any generated or edited code containing `supabase.from(`, `/rest/v1/`, Supabase Auth, `VITE_SUPABASE_`, or Supabase Edge Function calls is Supabase work. Load `supabase-mcp-backend` and `safety` before writing it.

For Supabase work:

1. Run `accio-mcp-cli server supabase` before asking setup questions or performing provider work.
2. If disconnected, stop the provider flow and ask the user to connect Supabase in the Accio Site Builder plugin. Do not fall back to raw provider CLIs, tokens, passwords, or connection strings.
3. If connected, run `accio-mcp-cli search supabase` and follow the Supabase skill's project discovery, data-access classification, Auth preflight, migration, manifest, and verification rules.
4. Trigger Auth preflight from the requested authentication capability—login/sign-in, registration/sign-up, OAuth, magic link, password recovery, email confirmation, or a user account system—not from an incidental keyword mention.

Use `provider-operations` for any remote mutation or multi-surface workflow. Never collapse `scaffolded`, `built`, `configured`, `mutated`, `verified`, and `production-ready` into a single done claim.

## Completion Contract

Before claiming completion:

- Confirm the production build passed.
- Confirm the rendered preview is browser-verified nonblank, or state that visual verification was unavailable.
- Keep the only local preview running unless the runtime skill permits stopping it.
- Report access first: public URL, local preview URL, or blocker.
- Format every local preview URL as an explicit Markdown link with non-technical link text matching the user's current conversation language. For example, use `[打开预览](<exact returned preview URL>)` in Chinese and `[Open preview](<exact returned preview URL>)` in English, without a preceding label such as `预览：`, `Preview:`, or `Access:`. Use only the exact verified URL returned by the preview operation as the link destination; never output the placeholder literally, display or wrap the raw URL in backticks, or invent or copy an example host or port.
- If the user requests website source code or compiled build artifacts, package the requested content as a verified ZIP and deliver the ZIP itself as a clickable file link. Exclude dependencies, caches, Git metadata, and secrets from source packages; build successfully before packaging compiled output; deliver separate ZIPs when both are requested.
- Report visible result, enabled capabilities, provider status, verification, remaining user action, and material risks in plain language suitable for non-technical users.
- Keep commands, file paths, SQL, package names, routing/architecture internals (router type, fallback mechanics), and low-level recovery detail out of the user-facing handoff unless requested or required for a blocker or safety confirmation. State routing as a plain benefit the user gets (shared links and page refreshes work), not the mechanism.

## Cross-Branch Prohibitions

- Do not skip the selected visual prerequisite or replace it with browser research alone.
- Only the selected visual SubAgent may write the project-root `DESIGN.md` during its delegated design phase: canvas-designer for Canvas, or reference-site-replicator for replication. Do not let either edit React source or mutate providers or deployments.
- Do not use external scaffolders or direct-install bundled feature dependencies; follow `frontend-implementation-policy` and `react-local-runtime`.
- Do not assume Supabase is connected or store provider secrets in the plugin/project manifest.
- Do not mutate cloud resources without the confirmation and verification required by `provider-operations` and `safety`.
- Do not invent `site.js` publish or `site.js supabase:*` commands.
- Do not stop the only preview and then claim the site is accessible.
