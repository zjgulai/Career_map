---
name: shopify-use-shopify-cli
description: "Choose when the user needs **Shopify CLI** to run or fix something now: validate app or extension config on disk (`shopify.app.toml`, `shopify.app.<name>.toml`, `shopify.extension.toml`); run or troubleshoot Connector-managed store workflows (`shopify store execute`); reliably create or resume one Blog Article through the bundled publisher; inventory or product changes by handle, SKU, or location name; or CLI setup, command availability, upgrade issues. Emphasize **commands and operational steps**, not only authoring GraphQL. Skip for API-only understanding or codegen with no CLI execution. Examples: validate configuration before deploy; publish one confirmed Article; run an existing query via CLI; list products; missing or stale `shopify store execute` auth. In Accio Work, auth, stored-auth repair, scope ownership, and scope expansion remain with `aw-shopify-oauth`; this skill only executes in the authorized store context."
compatibility: Requires Node.js
metadata:
  author: Shopify
  version: "1.13.0"
---

# Shopify CLI execution

Use the task's managed CLI for Shopify commands. `aw-shopify-oauth` owns the connected store, scope checks, and stored-auth repair; this Skill does not acquire tokens or run its own `shopify store auth` flow. Product, Collection, and theme-file writes retain their dedicated owners.

## Runtime and command discovery

- Use the managed CLI in Accio Work; do not fall back to npx, pnpx, or a global install when the command is unavailable. Report an unsupported command or request plugin reload/repair.
- Use `shopify commands` or `shopify help [command]` only when the documented invocation is insufficient. Do not rediscover bundled script internals during a store task.
- Installation/upgrade guidance applies only to an explicitly requested standalone environment outside Accio Work; consult the [Shopify CLI documentation](https://shopify.dev/docs/api/shopify-cli).

## App configuration validation

For `shopify.app.toml` or extension TOML, run `shopify app config validate --json` from the app root, or pass `--path`. Use `--config <name>` for a named app configuration; validate only the requested configs. Interpret the command's result instead of substituting GraphQL validation or documentation-only field checks. Do not pre-run `shopify auth login`; follow the CLI's own app-auth flow if required.

## Connected store operations

1. Use the full, verified `<store>.myshopify.com` domain supplied by `aw-shopify-oauth`. Always pass `--store`; do not execute a placeholder, custom storefront domain, or guessed store.
2. Admin operations in this plugin target `2026-07`. For dynamic GraphQL, search and validate with `shopify-admin` using `--version 2026-07`, then pass the same flag to `shopify store execute`. Another explicitly requested API version is unsupported; do not silently substitute `2026-07`. Bundled scripts apply this pin and own their embedded prevalidated operations and verification; invoke their documented interface without reconstructing it.
3. Execute dynamic operations with `shopify store execute`. Include `--allow-mutations` only for an explicitly confirmed write; omit it for reads. Do not synthesize execute-time `--scopes` or use direct token/REST/cURL paths to bypass the Connector.
4. A short query may use `--query`; use `--query-file` for long documents. Structured variables use `--variable-file <absolute-path>` containing UTF-8 JSON without a BOM, written by a structured file-write tool. Never expand that file into `--variables` or embed merchant JSON/HTML in shell text. Bundled scripts manage their own variable files; do not wrap them in another transport layer.
5. Resolve required IDs through the same authorized CLI flow, inspect GraphQL errors and mutation `userErrors`, and apply the owner's read-back/render verification before claiming success. A CLI exit alone does not prove the requested store outcome.

For a request to act, report the observed result rather than requiring a command-only answer. Show commands/code when they help the user or were requested. A request only to explain an operation does not authorize execution. On failure, preserve partial or unknown outcomes; never blindly replay a write or switch to another transport.

## Reliable Blog Article execution

For creation, immediate publication, scheduling, or recovery of one confirmed Shopify
Blog Article, use the bundled `scripts/publish_article.mjs` instead of dynamically
assembling `articleCreate`, PowerShell, query files, or variable files. Resolve the script
relative to this `SKILL.md` and invoke it with the host's available JavaScript runner; do
not hard-code a runner or assume installation preserved executable file mode.

The script accepts `--store <store>.myshopify.com` plus `--input <article.json>` (or
`--input -` when the caller can supply stdin without shell interpolation). Inline `--json`
is intentionally rejected. Create the UTF-8 JSON artifact with a structured file-write
capability; never assemble merchant HTML with shell quoting, command substitution, `echo`,
or an ad-hoc PowerShell/Python one-liner. It is dry-run by default. Because the chosen
publication outcome is part of this input, first require the user to choose exactly one:

- `draft`: save the Article without making it public;
- `published`: publish it immediately for shoppers;
- `scheduled`: publish it at an exact future ISO 8601 time with an explicit timezone.

Never infer `published` from a request to write, create, or prepare a Blog. If the request
does not already make the outcome unambiguous, ask before constructing the input. Then run
the dry-run, which reads the target Blog and any Article at the proposed handle and returns
the exact content, current-state action, shopper-visible publication effect, and a
confirmation token. The result's `confirmation.exactPreview` is the canonical user preview:
show its target Blog, full `bodyHtml`, full `summaryHtml`, title, handle, author, tags, image,
publication effect, and preview hash verbatim, or save that exact payload as a directly
inspectable artifact and link it. Never replace the body/summary with an outline, topic list,
synopsis, or excerpt. Wait for explicit confirmation only after the user can inspect the
complete payload, then pass its token to the same exact input:

```text
publish_article.mjs --store <store>.myshopify.com --input <article.json>
publish_article.mjs --store <store>.myshopify.com --input <article.json> --apply --confirmation-token <token-from-latest-dry-run>
```

```json
{
  "blogId": "gid://shopify/Blog/123",
  "title": "How to Choose a Rugged Phone",
  "handle": "how-to-choose-a-rugged-phone",
  "bodyHtml": "<p>...</p>",
  "summaryHtml": "<p>...</p>",
  "author": { "name": "Store team" },
  "tags": ["Buying guide"],
  "image": {
    "url": "https://cdn.example.com/article.jpg",
    "altText": "Rugged phone in field use"
  },
  "publication": { "status": "draft" }
}
```

`blogId` is optional only for target discovery. When it is absent and the store has one
Blog, the dry-run selects that sole Blog and exposes the choice in the exact preview. When
several Blogs exist, it returns `blog_selection_required` plus `availableBlogs` without an
Article mutation; ask the user to select one, write that exact GID into the input file, and
rerun dry-run. Do not invoke the Article publisher once with an incomplete payload merely
to discover this requirement, and do not hand-author a separate Blog-list GraphQL query.

`publication.status` must be exactly `draft`, `published`, or `scheduled`. Scheduled
publication also requires a future ISO 8601 `publishDate` containing `Z` or a numeric
timezone offset. The script uses prevalidated
Admin GraphQL `2026-07`, so do not run a new schema search for its embedded operations
during a store task. Verify the Connector-managed store has an applicable content read
and write scope before `--apply`.

Execution invariants:

- Run one Article per invocation. Never batch multiple `articleCreate` fields into one
  operation.
- The outer publisher accepts Article content only through `--input`; `--json` returns
  `unsafe_inline_json_disabled`. The static Shopify CLI `--json` response-format flag used
  internally is unrelated and remains safe.
- `--apply` requires the SHA-256 confirmation token returned by the latest matching
  store-aware dry-run. The token binds the store, full Article input, target Blog,
  publication choice, matched Article identity, and observed current state.
- A missing token returns `confirmation_required`. A changed input, target, remote state,
  or publication choice returns `confirmation_mismatch` without mutation. Rerun dry-run,
  show the changed preview, and obtain a new confirmation; a draft-to-published transition
  is always such a new write decision.
- The script first creates a minimal unpublished identity, then applies content, optional
  image, and publication as separately recoverable phases.
- Variables are written by Node as UTF-8 without a BOM. Do not insert a PowerShell
  `Set-Content` step around the script.
- Each CLI mutation has a bounded timeout. On timeout or unusable CLI output, the script
  performs read-only handle reconciliation and never automatically repeats the mutation.
- Re-running the same confirmed input is idempotent: an exact Article returns
  `already_satisfied`; a matching partial draft resumes; conflicting existing content
  returns `article_conflict` without overwriting it.
- `encoding_corruption` is terminal for the current payload. Correct the confirmed copy
  before trying again; do not publish known mojibake.
- `shopify_mutation_outcome_unknown` means the script could not prove the remote result.
  Report it as indeterminate. A later explicit resume may use the same input because its
  preflight prevents duplicate creation, but the current run must not switch to browser UI
  or issue a blind retry.
- Success requires the script's final Article read-back. For `published`, the script then
  performs a credential-free HTTPS storefront request, follows only safe public redirects,
  rejects password/404 pages, and requires the Article title to render. Only an
  `ok: true`, `anonymouslyReachable: true` storefront receipt authorizes a shopper-visible
  success claim.
- `storefront_verification_failed` is a partial outcome: Shopify Admin publication may
  already be successful, but public visibility is unverified. Report the Admin state and
  storefront failure separately, do not claim the page is public, and do not replay the
  publication mutation. A later retry uses the idempotent object preflight and performs the
  read-only storefront verification again.

This bundled publisher owns only new-Article creation and recovery of its own matching
partial draft. Editing a different existing Article, changing its handle, or moving it to
another Blog remains a newly confirmed dynamic Admin operation. Blog container creation or
updates and Page writes also remain outside this script.

## Store connectivity failures

Apply this only when execution fails before a GraphQL response. `Loading stored store auth ...` is informational, not an auth error.

- `ETIMEDOUT`, `ECONNRESET`, `ENOTFOUND`, TLS/DNS failures, or `Unknown error connecting to your store ... The user aborted a request` can indicate a network problem. Do not immediately trigger OAuth repair.
- Use at most one small read-only diagnostic query, then one bounded HTTPS reachability probe to the same store (for example `curl -I --connect-timeout 5 --max-time 12 https://<store-domain>/`). This is not permission to retry a failed mutation. Add DNS evidence only when useful.
- Connection/DNS/TLS failure → report `SHOPIFY_STORE_DOMAIN_UNREACHABLE` with the CLI/probe evidence and stop. Any received HTTP status establishes transport reachability, not successful auth or API access.
- Reachable network plus missing/stale stored-auth evidence → return `stored_auth_repair_required` through `aw-shopify-oauth`. Scope denial also returns to that owner; schema/user errors stay with the operation owner. Do not inspect token files or invent an alternate auth path.

Usage telemetry is disabled. Do not run activation logging or supply user prompts/session attribution. Documentation search and remote validation send only the query/code needed for the operation.
