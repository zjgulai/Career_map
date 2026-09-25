---
name: safety
description: Safety gates for local preview, Supabase MCP use, site publish, database migrations, provider mutations, and secret handling.
---

# Safety Gates

These rules apply to all site-builder workflows.

Online payment, cart, checkout, and payment placeholder flows are unsupported. Convert commerce requests into display, inquiry, booking, or off-site contact experiences.

Company-domain subdomains from site publish are supported. Binding a user's own domain (CNAME/DNS) is unsupported for now. If the user asks to bind their own domain, do not guide that setup; tell them the feature is in development and coming later, and keep using the published company-domain subdomain.

## Always Confirm First

Require explicit user confirmation before:

- Pulling provider secrets into a file that would overwrite an existing env file.
- Supabase MCP `apply_migration`.
- Supabase write SQL through MCP `execute_sql`, project/branch creation or deletion, function deploy/delete, storage config mutation, or secrets mutation.
- Production deployment or publish action (`web_builder_publish` or equivalent) when not already explicitly requested or consented.
- Writing or overwriting `.env.local` with secrets.
- Deleting website files (source code, assets, media, or other project files) or stopping processes not created by this plugin.
- Deleting any site files to satisfy a publish-time maximum file-count (or similar size/count) limit — even unused or generated artifacts. Explain which files would be removed and why, then wait for explicit user consent before deleting.

## Allowed Without Extra Confirmation

- Dependency installation in the target workspace.
- Local build.
- Local preview start/stop for plugin-managed processes.
- Supabase MCP connection check with `accio-mcp-cli server supabase`.
- Supabase tool-usage lookup with `accio-mcp-cli search supabase` after connection is confirmed.
- Supabase read-only MCP inspect/docs/log/advisor calls.
- Site publish readiness checks that do not mutate provider resources.

## Provider Tool Rules

- Supabase provider work must use the product-connected Supabase MCP server. Run `accio-mcp-cli server supabase` first; if it is not connected, stop and ask the user to connect/authorize Supabase in the Accio Site Builder plugin. If connected, run `accio-mcp-cli search supabase` to query tool usage before MCP calls.
- Frontend publish has two equivalent paths: the user clicks the product UI publish button, or the agent calls host builtin `web_builder_publish` after explicit consent when that tool is visible/available. If the tool is missing, use the UI publish-button path and keep local preview running. Do not invent `site.js` publish commands or external deploy CLIs.
- Treat website file deletion as high-risk. Prefer compressing, consolidating, or excluding build/cache outputs over deleting user-visible code or assets. If publish fails or is blocked because the platform enforces a maximum file count, do not unilaterally delete project files to get under the limit — propose a deletion plan and obtain explicit user consent first.
- Do not call missing provider wrappers such as `node scripts/site.js supabase:*`.
- When Supabase tool behavior is uncertain, use MCP `search_docs` and read-only inspection first.
- For every remote mutation, follow `skills/provider-operations/references/operation-contract.md`: classify, preflight, plan, dry-run/inspect, confirm when required, execute, verify, recover, and record.
- If account/team/project/ref/domain context cannot be proven, stop before mutation.
- For Supabase, enforce the Supabase Data Access Gate: direct browser-client access is limited to `public_read` and simple `owner_scoped_private` data with RLS allow/deny checks. `sensitive_workflow`, `admin_or_cross_user`, and `third_party_or_secret` operations must use Edge Functions or another server route.
- Treat polls, surveys, submissions, ratings, result charts, leaderboards, and cross-user statistics as `cross_user_aggregate`: browser code may read aggregate/whitelisted result fields, but must not read raw rows with `user_id`, email, profile IDs, or other user identifiers. Keep raw-table SELECT owner-scoped or move result reads behind a view/RPC/Edge Function/server route.
- Treat Supabase tables named or containing `users`, `accounts`, `admins`, `operators`, `members`, `roles`, `permissions`, `profiles`, `auth`, `scripts`, `audits`, `orders`, `payments`, `subscriptions`, `inventory`, `sessions`, `tokens`, `logs`, or `webhooks` as sensitive by default. Do not allow direct browser-client `.from("<sensitive table>")` access unless an owner-scoped exception and negative RLS smoke test are recorded.
- Run `node scripts/site.js doctor --cwd <project>` after Supabase code or provider changes. A failed `supabaseExposureHygiene` check is a blocker, including browser `.from("<table>")` access without local migration SQL that creates the table, enables RLS, and records the required auth.uid()-scoped policy or Edge Function/server-route boundary.
- Before calling Supabase work `verified` or `production-ready`, perform or record a REST exposure audit with the anon/publishable key and `?select=*&limit=0`. A sensitive table returning `200` or `206` is a blocker.

## Secret Handling

- For novice provider setup, load `skills/provider-operations/references/beginner-auth-guide.md` and give dashboard links plus safe-to-share versus secret distinctions before requesting values.
- For provider flows, follow `skills/provider-operations/references/provider-flow-playbook.md`: use the Authorization Ladder, avoid L4 high-risk admin secrets in chat, and keep a Provider Status board for multi-surface work.
- For provider/database/deploy summaries, use the Completion Contract layers `scaffolded`, `built`, `configured`, `mutated`, `verified`, and `production-ready`; do not claim a layer is done without evidence.
- Never print full tokens, API keys, connection strings, cookies, or webhook secrets.
- Redact prefixes and values including `sbp_`, `sb_secret_`, JWT-like tokens, `postgres://` values, and env keys containing `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE`, or `SERVICE_ROLE`.
- Never pass local-agent provider token flags or secrets: Supabase access tokens, DB URLs, DB passwords, or service-role keys.
- Prefer `.env.example` for variable names and ask the user to set real values locally or in provider/runtime UI.
- Never expose Supabase service role keys in public client bundles.
- If the user pastes a high-risk secret in chat, stop provider mutation, do not repeat the value, tell the user to rotate/revoke/reset it, and delete local secret-bearing temporary files instead of moving them to `.trash`.
