---
name: code-generator
description: |
  Direct multi-file code generation for React/Vite web projects in the current execution.
  Converts the user request, resolved implementation requirements, and Google-format DESIGN.md into a complete, compilable project with pages,
  components, routing, and styles written in dependency order.
  Enforces provided-resources-only image policy — local assets, user-provided image URLs, and existing project CDN URLs from .accio/cdn-assets.json are allowed.
---

# Code Generator (Direct Implementation)

Use this Skill to turn the user request, resolved implementation requirements, and selected visual SubAgent's Google-format `DESIGN.md` into a complete, compilable, multi-file React/Vite web project. This Skill is not a SubAgent or a delegation target. Write the frontend files directly in the current execution. Do not create, spawn, fork, resume, or delegate to another Agent or SubAgent for implementation.

Generate all source files directly: pages, components, routing, styles, and config files. Keep scaffolding, dependency installation, build, preview, deployment, and database work in the current execution.

## Implementation Inputs

Product planning happens first, then the selected Canvas or reference-replication design phase produces `DESIGN.md`. Load this Skill only after both inputs exist.

Write all source files directly from the user request, resolved implementation requirements, `DESIGN.md`, and prepared assets, then install, build, and preview in the same execution. Do not recreate or extend `DESIGN.md`. Do not use task-board APIs for file generation.

---

## Architecture Contract

### Required Inputs

Before implementation, ensure these inputs are available:

- **Product and implementation requirements**: Use the user request plus the resolved routes, page and section order, content and copy boundaries, interactions, states, responsive priorities, type-specific requirements, and integration requirements. These are the source of truth for what to build.
- **Visual design system**: Read the designer-written project-root `DESIGN.md` directly. Its YAML tokens are the source of truth for visual values; its eight standard sections explain how to apply them. This is the source of truth for how the site should look.
- **Project type**: `static`, `supabase-basic`, or `supabase-edge-functions`.
- **Target project path**: Absolute path to the scaffolded React/Vite project directory.
- **Feature list**: Which `templates/features/` have been applied (if any). Tailwind utility classes are allowed only when this list includes `tailwind`.
- **Base template**: Always `react-vite-base`.
- **Image manifests and existing CDN index**: The project-root `ASSETS.md` Image Manifest, plus `<project>/.accio/cdn-assets.json` when it exists, so previously published project images can keep their recorded CDN URLs.

### Output Contract

You produce a complete set of source files that:

1. Implement the route structure required by the user request and resolved requirements, including multiple pages only when requested.
2. Implement every requested section, interaction, and applicable state, using `DESIGN.md` for visual treatment.
3. Are **individually complete** — each file compiles with valid imports, no placeholders.
4. Follow the **canonical project structure** defined in `references/project-structure.md`.
5. Satisfy all **generation requirements** in `references/generation-requirements.md`.
6. Contain **zero violations** of the constraints in `references/generation-constraints.md`.
7. Use **only provided image resources** — local images under `public/assets/images/...`, user-provided URLs from the Image Manifest, or existing project CDN URLs recorded in `.accio/cdn-assets.json` (see `references/image-asset-handling.md`).
8. Never use Supabase browser-client `.from("<sensitive table>")` access for tables named or containing `users`, `accounts`, `admins`, `operators`, `members`, `roles`, `permissions`, `profiles`, `auth`, `scripts`, `audits`, `orders`, `payments`, `subscriptions`, `inventory`, `sessions`, `tokens`, `logs`, or `webhooks`; route these through Edge Functions/server APIs.
9. Treat any Supabase browser-client `.from("<table>")` or `/rest/v1/<table>` access as a database contract, not a frontend-only detail. If you generate direct browser table access, also generate or require matching `supabase/migrations/*.sql` that creates the table, enables RLS, and defines the required `auth.uid()` policies for direct writes or owner-scoped reads. If those policies cannot be produced, replace the direct table access with an Edge Function/server route.
10. Do not navigate to success, show saved states, or claim persistence when a Supabase insert/update/delete returns an error. Surface an error state and leave success UI for confirmed writes only.
11. For cross-user aggregate or result interfaces, never generate browser `.select('*')` or raw-row reads from tables that contain `user_id`, email, profile IDs, or other user identifiers. Generate owner-scoped raw-table reads plus an aggregate view/RPC/Edge Function/server route for global results.

### File Generation Order

Write files directly in dependency order:

1. **Config and base files**: `styles.css`, any new config files
2. **Leaf components**: Small, self-contained components with no internal project dependencies
3. **Section components**: Components that compose leaf components
4. **Pages**: Page components that orchestrate section components
5. **Root**: `App.tsx` with routing configuration, `main.jsx` entry point if changes are needed

### Technology Stack

- **Core**: Vite 5 + React 18
- **Language**: JSX (`.jsx` files) or TypeScript (`.tsx` files) — match the base template
- **Styling**: Translate the normative YAML tokens in `DESIGN.md` once into runtime CSS custom properties or the enabled Tailwind theme, then use them consistently. Runtime CSS is implementation output; do not create a second design document or a standalone designer-owned `tokens.css`. Tailwind CSS v3 utilities are allowed only when the `tailwind` feature has already been applied and included in the Feature list.
- **Tailwind contract**: When `tailwind` is applied, keep `src/styles.css` starting with `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;`. Semantic utilities such as `bg-background`, `text-foreground`, `border-border`, `bg-card`, and `text-muted-foreground` are valid because `tailwind.config.js` maps those tokens. Do not use semantic utilities that are not present in the config unless you also add the matching CSS variable and config entry.
- **Icons**: `lucide-react` (available in base template)
- **Routing**: `BrowserRouter` (clean `/path` URLs) or `HashRouter` (`#/path`) — both supported; see `references/project-structure.md`
- **Animation**: Framer Motion (`framer-motion`) when added as a dependency
- **State**: React `useState`/`useContext` for local state; Zustand only when it has been added to the project

---

## Image Asset Handling (CRITICAL)

### Provided-Resources-Only Image Policy (Coding Phase)

During code generation, **image references must come exclusively from provided image resources**: local images saved under `<project>/public/assets/images/`, user-provided image URLs explicitly listed in the Image Manifest, or existing project CDN URLs recorded in `<project>/.accio/cdn-assets.json`. Arbitrary external URLs not part of those sources are strictly forbidden in generated source code.

**Canonical path rule (HARD RULE):** new local files live under `public/assets/images/`; code references them as `/assets/images/...` — leading slash, no `public/` prefix, never a relative path. Files under `cdn-assets/images/` are user-visible archives, not runtime assets; reuse their recorded CDN URL instead of referencing the archive path.

```jsx
// ✅ CORRECT — root-absolute path backed by public/assets/images/ (generated or supplied for the project)
<img src="/assets/images/primary-visual.jpg" alt="Primary visual" />

// ✅ CORRECT — user-provided external URL (listed in Image Manifest)
<img src="https://cdn.example.com/user-supplied-image.jpg" alt="User image" />

// ❌ FORBIDDEN — arbitrary external URLs NOT from provided resources
<img src="https://images.unsplash.com/photo-1441986300917?w=800" alt="..." />
<img src="https://placehold.co/800x600" alt="..." />
```

See `references/image-asset-handling.md` for the full image workflow contract.

### Asset Usage Contract (HARD RULE)

- **All rendered references must resolve**: Reference supplied images or intentional local placeholders. Report unused assets without adding content merely to use them.
- **Reuse is allowed**: An image may be referenced from as many files, components, pages, or metadata tags as the design calls for. Multiple references to the same resource are not a violation.
- Before returning the summary, cross-check `public/assets/images/` contents against generated image references. Flag unused local assets as warnings; do not warn merely because a resource is referenced more than once.

### Pre-Generation Image Validation

Before generating any file that contains an `<img>` tag:

1. Verify the reference resolves to a file in `<project>/public/assets/images/`, a user-provided URL in the Image Manifest, or a CDN URL recorded in `<project>/.accio/cdn-assets.json`.
2. If the image is missing, report it in the generation summary as a warning.
3. Never fall back to arbitrary external URLs — use `public/assets/images/placeholder.svg` (a simple SVG placeholder) if the image was not downloaded and no user-provided URL is available.

---

## Operating Model

- Read-only access to plugin resources (`templates/`, `references/`).
- Write access to the **target project directory** only.
- No access to provider CLIs, deployment tools, databases, or secrets.
- Do not execute `scripts/site.js` during code generation; continue with install/build/preview after the frontend files are complete.
- No execution of `supabase` CLI commands.

## Hard Boundaries

Do not run:

- write/edit commands outside the target project directory
- package manager commands (`npm install`, `pnpm add`, etc.)
- `scripts/site.js` commands
- `supabase` CLI commands
- any production/deployment/database operation

Do not write secrets. Do not ask for tokens. Do not make cloud changes.

Do not modify the base template files in `templates/react-vite-base/`. Only write to the target project directory.

---

## Reference Loading

Before generating any files, load these references in order:

1. **`references/project-structure.md`** — canonical file tree, responsibility contract, and dependency order.
2. **`references/generation-requirements.md`** — code quality rules, content requirements, responsive design, animation rules.
3. **`references/generation-constraints.md`** — hard prohibitions and anti-patterns.
4. **`references/image-asset-handling.md`** — provided-resources-only image policy and placeholder handling.
5. **Implementation inputs** — the user request, resolved implementation requirements, project-root `DESIGN.md`, `ASSETS.md`, and the existing CDN index when present. Do not rewrite `DESIGN.md` or `ASSETS.md` as part of React code generation.

Stop loading once you have enough context to generate all files. Do not bulk-load unrelated resources.

---

## Quality Checklist

Before moving to build and preview, verify:

- [ ] Every required source file has been generated
- [ ] All files are complete — no `// TODO`, no placeholder comments, no incomplete functions
- [ ] All imports reference valid, existing modules within the project or declared dependencies
- [ ] All JSX tags are properly closed
- [ ] Tailwind utility classes appear only when `tailwind` is in the applied Feature list; otherwise all classes are backed by `src/styles.css`
- [ ] All image references use **only provided image resources** — local images under `public/assets/images/...`, user-provided URLs from the Image Manifest, or project CDN URLs from `.accio/cdn-assets.json`; zero arbitrary external URLs and zero runtime references to `cdn-assets/images/...`
- [ ] Every rendered image reference resolves; intentional placeholders are recorded in ASSETS.md, and unused local assets are reported
- [ ] No fabricated contact details (phone, email, physical addresses)
- [ ] No lorem ipsum or generic placeholder text
- [ ] No direct Supabase browser-client access to sensitive tables such as `users`, `scripts`, `audits`, `orders`, `payments`, `roles`, or `permissions`; those workflows call an Edge Function/server route instead
- [ ] Every direct browser Supabase table access has matching local migration SQL with `create table`, `enable row level security`, and required `auth.uid()` policy coverage, or it has been moved behind an Edge Function/server route
- [ ] Supabase write flows show success only after the database operation succeeds and show an actionable error state when it fails
- [ ] Cross-user result UIs use aggregate/whitelisted result data only; they do not browser-read raw rows containing user identifiers
- [ ] YAML design tokens from `DESIGN.md` are translated once and applied consistently (colors, typography, spacing, rounded shapes, and component styles)
- [ ] Routing follows `references/project-structure.md`: BrowserRouter projects share one `index.html` and include a designed `*` NotFound route; HashRouter projects resolve routes client-side
- [ ] Components are separated by responsibility and dependency boundaries
- [ ] `data-component` attributes are present on major sections
- [ ] Mobile-first responsive design is implemented

After writing the files, summarize their paths and purpose, then continue the same execution through install, build, and preview.
