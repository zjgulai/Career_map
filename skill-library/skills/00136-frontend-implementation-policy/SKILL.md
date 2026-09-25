---
name: frontend-implementation-policy
description: Apply shared React/Vite implementation rules for every site-builder branch before editing UI, CSS, fonts, or project assets. Use for Canvas implementations, reference-site replications, redesigns, and visual edits so font loading, assets, Tailwind, dependencies, and scaffold boundaries remain consistent.
---

# Frontend Implementation Policy

Load this Skill before editing project UI files under `src/`, runtime CSS, fonts, or public assets, and perform those edits directly. Do not create or delegate to an implementation SubAgent. Both visual branches produce `DESIGN.md` through their designer file contract; this policy checks the resulting implementation rather than revalidating the design artifact. It applies equally to Canvas and reference-replication implementations.

## Scaffold And Dependency Boundaries

- Use `templates/react-vite-base` through `skills/react-local-runtime/SKILL.md` for new projects.
- Do not start a project with external scaffolders such as `npm create vite`, `pnpm create vite`, `yarn create vite`, `bun create vite`, `create-next-app`, `degit`, or `git clone`.
- Apply bundled dependencies with `node scripts/site.js add --cwd <project> --feature <feature>`, then `node scripts/site.js install --cwd <project>`.
- Do not install feature-owned dependencies directly with npm, pnpm, yarn, or bun.
- Add the `tailwind` feature before generating Tailwind utilities, `@tailwind`, or `@apply`.
- Add `supabase-basic` or `supabase-edge-functions` only after `skills/supabase-mcp-backend/SKILL.md` chooses the data-access path.

## Font Policy

Never use CSS `@import` for an external font or stylesheet. Never reference `fonts.googleapis.com`, `fonts.gstatic.com`, or another external font CDN from project HTML or CSS.

Choose the stack from the user's language without asking a font-only clarification:

- Chinese projects: `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', system-ui, -apple-system, sans-serif`.
- Chinese serif/display text: `'Source Han Serif SC', 'Noto Serif SC', 'Songti SC', serif`.
- English or multilingual projects: `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`.

When a requested brand font is essential, self-host `.woff2` files under `public/fonts/` and use `@font-face` with `font-display: swap`. Explain the bundle-weight tradeoff before downloading a font. Do not use a CDN as a shortcut.

## Image And Asset Policy

- Store generated, downloaded, or uploaded local images under `<project>/public/assets/images/`.
- Use only local assets, exact user-provided external URLs, and existing project CDN URLs recorded in `<project>/.accio/cdn-assets.json`. Files under `<project>/cdn-assets/images/` are archives and must not be referenced at runtime. Do not introduce arbitrary hotlinked images during coding.
- Follow the project-root `ASSETS.md` Image Manifest. Sourcing in either visual branch follows `skills/code-generator/references/image-asset-handling.md`; do not pass this policy to either designer.
- Verify every rendered local asset exists and is non-empty. Explicitly account for unused generated assets without expanding the page merely to use them.
- Use local placeholders for unavailable imagery or declined generation beyond the approved allocation; never present them as final branded artwork.
- Do not reuse third-party reference-site assets unless the user owns them or reuse is otherwise permitted; preserve the intended visual role with original or neutral substitutes.

## Routing Policy

React/Vite sites can use `BrowserRouter` (clean `/path` URLs) or `HashRouter` (`#/path`); both are supported. Follow the routing contract in `skills/code-generator/references/project-structure.md`.

## Implementation Checks

Before build or preview handoff:

1. Search project HTML/CSS for `googleapis`, `gstatic`, and external CSS `@import`; fix every match.
2. Confirm Tailwind syntax is absent unless the Tailwind feature is installed.
3. Confirm bundled feature dependencies came from feature manifests rather than ad hoc installs.
4. Confirm image paths resolve and no required visual slot is empty.
5. Hand runtime verification to `skills/react-local-runtime/SKILL.md`.
