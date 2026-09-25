---
name: provider-operations
description: Plan, execute, verify, and recover cloud provider mutations through Supabase MCP using a stable operation contract.
---

# Provider Operations

Use this skill before any remote Supabase operation that can create, update, delete, expose, or reconfigure cloud resources. Supabase operations are MCP-first through the product-connected Supabase MCP server. Frontend publishing is handled by the company's one-click publishing platform. The user clicking the product UI publish button and the agent calling host builtin `web_builder_publish` after consent (when visible/available) are equivalent publish paths.

This plugin does not support online payment, cart, checkout, or payment placeholder flows. Convert commerce-shaped requests into product/service display, inquiry, booking, or off-site contact experiences.

## Reference Map

| Reference | When to load |
| --- | --- |
| `references/operation-contract.md` | Before any remote mutation. Owns the 9-phase lifecycle, operation record template, confirmation policy, and safety invariants. |
| `references/capability-matrix.md` | When mapping a Supabase action to product-connected MCP tools and confirmation gates. |
| `references/beginner-auth-guide.md` | Before asking a novice for Supabase connection, project context, env values, dashboard URLs, or secret-entry steps. |
| `references/provider-flow-playbook.md` | For multi-surface work combining local app, site publish, Supabase schema/RLS/Auth/Edge Functions, and final handoff states. |
| `resources/workflows/golden-site-builder-workflows.md` | For scenario-level recipes. |

Also load `supabase-mcp-backend` when Supabase-specific planning or tool usage is needed.

## Must Internalize

1. `scripts/site.js` has no provider wrappers. For Supabase, first run `accio-mcp-cli server supabase`; if missing, stop and ask the user to connect Supabase in the Accio Site Builder plugin. If connected, run `accio-mcp-cli search supabase`, then use Supabase MCP tools.
2. Never paste provider tokens through agent commands. No access tokens, DB URLs, DB passwords, service-role keys, or secret values in chat.
3. Never claim deployment, database, or provider completion when only one surface is done. Report local app, site publish, Supabase, and production-readiness separately.
4. Binding a user's own domain (CNAME/DNS) is not supported yet; company-domain subdomains from site publish are supported. Do not guide own-domain DNS setup; say own-domain binding is in development and coming later.
