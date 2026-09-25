---
name: react-local-runtime
description: Create, extend, build, run, and inspect local React/Vite projects using scripts/site.js without MCP. Local preview is Vite-only; api/ route verification happens in the target backend/runtime environment after site publish or provider deployment.
---

# React Local Runtime

Use this skill to create the base template, add local features, install dependencies, run builds, and start/stop local previews.

Local preview is **Vite-only**. For projects with `api/` routes, build locally to catch syntax/bundler errors and verify the API surface against the target backend/runtime environment after site publish or provider deployment.

This plugin does not support online payment, cart, checkout, or payment placeholder flows. Commerce-shaped sites should use catalog display, inquiry forms, booking requests, or off-site contact links.

## Command Prefix

Prefer the registered CLI alias `accio-site` when available. If it is not available, run `node scripts/site.js` from the plugin root or use the absolute path to `scripts/site.js`.

## Commands

From the plugin root, pass a durable first-level workspace target such as `<workspace>/<siteDir>`. Older documentation may call this shape `<workspace>/<siteId>`, but the directory name is only the display/project location and can differ from the manifest `siteId`. The PC workbench discovers generated sites at `<workspace>/<siteDir>/.accio-site.json`; do not add an intermediate `project/` folder and do not create projects under `plugins/installed`.

For every new project, first call the builtin tool `web_builder_reserve_site_id` and pass its result unchanged: use the returned ID as `--site-id` and its returned status as `--site-id-sync-status` (`synced` or `unsynced`). If the builtin tool is unavailable, do not invent or pass `--site-id`; let the CLI generate a local fallback ID automatically.

```bash
node scripts/site.js create --target <workspace>/<siteDir> --site-id <server-id> --site-id-sync-status <synced|unsynced> --template react-vite-base
# Tool unavailable fallback:
node scripts/site.js create --target <workspace>/<siteDir> --template react-vite-base
node scripts/site.js add --cwd <project> --feature tailwind
node scripts/site.js add --cwd <project> --features supabase-basic
node scripts/site.js add --cwd <project> --feature supabase-edge-functions
node scripts/site.js doctor --cwd <project>
node scripts/site.js install --cwd <project>
node scripts/site.js build --cwd <project>
node scripts/site.js preview:start --cwd <project> --mode vite
node scripts/site.js preview:logs --cwd <project>
node scripts/site.js preview:stop --cwd <project>
node scripts/site.js preview:status --cwd <project>
node scripts/site.js preview:status --all
node scripts/site.js preview:restart --cwd <project> --mode vite
```

## Mode And Feature Selection

- Use `create --template react-vite-base` for every new React/Vite project.
- Use `add --feature tailwind` before code generation when the user request or resolved implementation requirements call for Tailwind CSS. This is the only supported way to add `tailwindcss`, `postcss`, and `autoprefixer`.
- Use `add --feature supabase-basic` only after the Supabase skill has planned Supabase client/database work and classified it as `public_read` or simple `owner_scoped_private` direct client + RLS. This is the only supported way to add `@supabase/supabase-js`.
- Use `add --feature supabase-edge-functions` for `sensitive_workflow`, `admin_or_cross_user`, or `third_party_or_secret` Supabase writes that need server-side validation, ownership checks, service-role access, or third-party API calls; it also applies `supabase-basic`.

## Local Preview Is Vite-Only

The only supported local preview mode is `vite`. The flow for projects with `api/` routes is:

1. Implement the React frontend, run Vite preview to verify UI.
2. Run `node scripts/site.js build --cwd <project>` to confirm the production bundle compiles.
3. Publish via either equivalent Site Publish path: the user clicks the product UI publish button, or — when host builtin `web_builder_publish` is visible/available — ask for consent and call it.
4. Verify `api/*` against the public runtime URL with `curl`, e.g. `curl https://<public-runtime-url>/api/health`.

## Rules

- Always run build before publish handoff or final handoff.
- For new projects, create from the bundled base template before editing; do not run external scaffolders.
- Features only merge local files, package dependencies, and `.env.example` names; they do not mutate providers or write secrets.
- Add feature-owned dependencies through `add --feature ...`, then install through `install --cwd <project>`.
- After project creation and any already-required dependency-changing features, run `node scripts/site.js install --cwd <project>` before code generation continues. Run install again later only when dependencies changed or the earlier install did not succeed.
- If preview fails, inspect logs with `preview:logs`, fix code, and retry.
- Pass the User-Visible Delivery Gate below before final handoff.
- Pass the Rendered Preview Verification Gate below after `preview:start`.
- Do not run `preview:stop` as routine cleanup before final handoff.
- Never leave unrelated user processes running. Only stop processes recorded under `.accio/site-builder/processes.json`.
- `preview:start` writes the active local preview URL for the host product to plugin-root `.accio/site-builder/active-preview.txt`. That txt file must contain only the URL.

## Rendered Preview Verification Gate

After `preview:start` returns a URL:

Run the fixed Baseline Browser Pass below. Do not replace it with an open-ended browser assignment.

1. Open the exact returned URL once at a representative desktop viewport.
2. Read `references/rendered-preview-probe.js` and execute it as one `browser_act` evaluation. The probe scrolls through the document in one browser operation to trigger lazy loading, waits for image settlement, distinguishes confirmed `brokenImages` from incomplete `pendingImages`, returns `#root` status and horizontal overflow, then restores the page to the top.
3. Capture one desktop screenshot after the probe restores the page position.
4. Resize the same browser session to a representative mobile viewport without reloading, execute the same probe once, and capture one mobile screenshot.
5. Read the browser console once after both viewport checks. Classify messages by their meaning rather than the console transport channel: text that clearly identifies itself as a warning remains a warning even when the browser reports it through an error channel. Runtime errors are blocking. Warnings are recorded and never trigger a code change, rebuild, re-verification, or Deep Verification.
6. When the project declares additional routes, cold-navigate directly to one non-entry route and confirm it is visibly nonblank. Do not add a screenshot unless this route exposes a concrete failure.
7. Return one compact result containing the desktop and mobile probe results, console errors, console warnings, checked route and `pass` or `fail`. Record `pendingImages` as a warning; pending status alone is not a confirmed failure and does not trigger Deep Verification. Include both screenshot paths and one clear sentence stating whether each screenshot is visibly usable.

When Browser returns that complete result, accept its visual conclusion and do not read, open, or inspect either screenshot file again. If the result is incomplete or ambiguous, request one focused Browser follow-up instead of independently reopening the screenshots.

The Baseline Browser Pass succeeds when `#root` is visibly nonblank, no blocking runtime error prevents React from mounting, there are no confirmed broken images, the page has no unintended horizontal overflow, and both screenshots show usable desktop and mobile layouts. An image is confirmed broken only when loading emitted an error or it completed with zero natural width. Incomplete images remain pending; upgrade a pending image to a failure only when a screenshot shows a visible defect, a browser request reports failure, or a required interaction exposes the defect. Build success, HTTP 200, Vite readiness or `curl` output alone is insufficient.

Do not perform section-by-section scrolling, repeated refreshes, repeated console reads, extra desktop or mobile screenshots, exhaustive interaction traversal or speculative debugging during a passing Baseline Browser Pass. The probe already performs the lazy-load scroll internally.

Enter Deep Verification only when the Baseline Browser Pass returns a concrete failure, either screenshot shows a clear visual defect, or the user explicitly requests detailed visual QA. Inspect only the failing signal or affected element. After a fix, rerun the failed viewport or route first; repeat the full baseline only when the change could affect both viewports. Do not fix or re-verify a warning.

If browser tools are unavailable, record `renderedPreview=not-verified` and do not claim visual completion. If the baseline is broken, inspect `preview:logs`, the relevant console error and the React entrypoint, fix the issue, and follow the targeted rerun rule above.

Record the checked route with either `Rendered preview: browser verified nonblank at <url>` or the exact blocker.

## Site Publish And Domains

Frontend publish is a host/product capability, not a `site.js` command. Do not invent Vercel, Netlify, or other external deployment commands.

Use either equivalent path:

1. The user clicks the product UI publish button. Keep the local preview running and report Site publish as `waiting-user` until a public URL exists.
2. When host builtin `web_builder_publish` is visible, ask for explicit consent and call it only after consent.

After either path yields a public URL, verify routing works for the project's chosen router. For BrowserRouter projects, cold-navigate directly to one declared extensionless route, then request randomized missing paths under `/assets/`, `/fonts/`, and `/api/`, plus one missing path with a file extension, and confirm none returns the SPA HTML before reporting Site publish as `done`. For HashRouter projects, cold-navigate directly to one declared `#/path` route and confirm it renders nonblank.

### First publish: the user chooses the subdomain

Before calling `web_builder_publish`, check whether the site has been published before (the site manifest records a subdomain after a successful publish; when the `subdomain` param is omitted the tool reuses it).

- **Previously published** → omit `subdomain` so the existing domain stays stable. Never pass a different subdomain unless the user explicitly asks to change the domain.
- **First publish** → the subdomain is the user's asset; NEVER invent or pick one on the user's behalf. Ask the user to choose: suggest 2-3 candidates derived from the site/brand name (lowercase alphanumeric and hyphens, 1-63 chars, no leading/trailing hyphen), let the user pick or type their own, and only then call `web_builder_publish` with the confirmed subdomain.
- If the tool returns "subdomain is required" / "never been published", that means this is a first publish — go back and ask the user; do not retry with a self-invented slug.

Conflict handling after the user chose a subdomain: publish errors carry a server-provided explanation with the consequence and the recommended action — follow that message instead of guessing. In general: if the name is taken by another user it cannot be forced, relay this to the user and ask for a different one (you may suggest close variants); if it conflicts with another of the user's own sites, the message explains that re-binding permanently breaks the old site's domain — get the user's explicit confirmation before any `forceUpdate` retry, and offer choosing a different subdomain as the alternative.

Company-domain subdomains created by site publish are supported. Binding a customer-owned domain through DNS, CNAME, or A records is not supported yet; state that it is in development and offer the company subdomain or local preview instead. Do not guide an unsupported DNS workaround.

If publish is blocked by a file-count or size limit, prefer excluding build/cache output or consolidating duplicates. Obtain explicit consent before deleting project files or assets.

## User-Visible Delivery Gate

Finish with an access surface the user can open:

- a reachable, smoke-checked public URL; or
- a browser-verified, nonblank, still-running local preview URL; or
- a blocker with the exact user action needed.

### Clickable Local Preview URL Output Contract

When reporting a local preview URL in a user-facing response:

- Render it as an explicit Markdown link and use only the exact URL returned by the preview operation as the link destination.
- Match the user's current conversation language and tone for the link text. Never hardcode English wording into a non-English response.
- In Chinese, use `[打开预览](<exact returned preview URL>)`. In English, use `[Open preview](<exact returned preview URL>)`. For every other language, use an idiomatic equivalent in that language.
- Output the link without a preceding label such as `预览：`, `Preview:`, or `Access:`.
- Keep the raw URL out of the visible link text because the audience may be non-technical.
- Never wrap the local preview URL in backticks, inline code, or a code block.
- Never invent, infer, normalize, or copy an example host or port. If no verified preview URL was returned, report a blocker instead of emitting a link.

The angle-bracketed URL descriptions above are placeholders for this instruction only; replace them with the exact returned preview URL and never output the placeholders literally to the user.

Do not stop the only preview unless the user requests cleanup, a public URL is verified, or the stopped preview is explicitly reported unavailable with restart guidance. Lead the handoff with access, visible result, verification status, and remaining user action in plain language; omit internal commands and file details unless requested or required by a blocker.

## Cross-Session Preview Hygiene

`preview:start` writes `.accio/site-builder/processes.json` per `--cwd` and also registers the preview in a global registry at `~/.accio/site-builder/global-previews.json` (falling back to `/tmp/accio-site-builder/global-previews.json` when the home path is not writable). This makes multi-session/multi-`cwd` workflows safe to inspect.

- Before starting a new preview, run `preview:status --all` to see active previews across every `cwd`.
- Always trust the URL returned by `preview:start`. Do not assume the default port.
- After fixing a bug, source-file edits propagate via HMR; restart only when configuration files, dependencies, or the preview process itself are affected.
- `preview:stop` and `preview:restart` only act on previews that this plugin started.

## Host Process Safety

The plugin can run inside a host environment that owns specific local ports and processes. Always use `preview:stop` rather than port-based process killing so host-process guards apply.
