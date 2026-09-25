---
name: shopify-execution
description: Accio Work execution adapter for bundled Shopify platform Skills. Load before using official Shopify documentation, schema, Liquid or Functions helpers, or executing Shopify store operations. Defines host compatibility, validated execution, and the Main Agent Route C write contract. Product/Collection and theme authoring retain their dedicated owners; Main manages Theme Craft's bounded preview synchronization. Connection and auth repair remain with aw-shopify-oauth.
---

# Shopify execution in Accio Work

This Skill owns the product-specific execution contract around the bundled official Skills. It contains no CLI runtime or credentials. Use the existing `aw-shopify-oauth` and `shopify-use-shopify-cli` implementations.

## Execution context

- Before using an official Skill's helpers, read [official-compatibility.md](references/official-compatibility.md). It owns the host runner, API-version and privacy adaptations; the official Skill still owns its API knowledge and validation workflow.
- For live store work, the Main Agent obtains the exact connected store and required scopes through `aw-shopify-oauth`. Reuse still-applicable verified context; loading this Skill is not a new auth probe. A selected domain's stronger connection gate still applies. Pure advice, local validation, and documentation work do not require store authentication.
- Sub-agents use the verified store in their brief. They never discover another store, request tokens, expand scopes, or repair authentication. Return the original auth failure to the Main Agent, which follows `aw-shopify-oauth`.
- Keep long-lived Shopify credentials in the managed Connector. Do not request or persist raw access tokens, or substitute a global CLI/direct-token route for the existing managed execution contract.

## Choose the existing execution owner

| Work | Contract and owner |
|---|---|
| Product or Collection writes | Main Agent prepares the `shopify-product-collection-write-brief`; `shopify-product-editor` executes under the selected domain Skill |
| Theme-file writes | `shopify-theme-craft` handoff to `shopify-theme-decorator` |
| Managed local theme preview and synchronization | Main Agent follows `shopify-theme-craft/references/dev-preview-craft.md` §4 in its own session; only the decorator-prepared directory and confirmed unpublished theme. The decorator owns all file edits and final read-back. |
| Theme publication | Main Agent follows the `shopify-storefront-validate` preview, approval and production-verification contract; publication only |
| Create, publish, schedule or resume one new Blog Article | Main Agent Route C loads `shopify-use-shopify-cli` and uses its bundled `scripts/publish_article.mjs` contract |
| Page/Blog-container content or existing Article edits outside that publisher | Main Agent Route C, using `shopify-admin` and `shopify-use-shopify-cli` |
| Metafields or metaobjects | `shopify-custom-data` first, then Main Agent Route C; outside the Product/Collection writer |
| Other supported Admin resources without a dedicated owner | Main Agent Route C under the relevant official domain Skill |

For a dedicated owner's result, read its structured status, termination reason, delivery, evidence and outstanding errors. If a tool header says `completed` but the structured result says `partial`/timeout or the answer reports a negative check, retain that unfinished outcome. A verified store write with an unfinished checkpoint or verification remains a partial handoff: preserve completed changes and relay only the remaining work to that owner. Do not take over or repeat its write. Independent Page/Article SEO settings remain merchant-manual; theme defects go to the decorator. Store payment, shipping, tax, checkout, market and domain setup follow `dtc-builder`'s advisory boundary.

## Validate and execute

For each new or changed dynamically authored Admin GraphQL document, including reads and verification queries, use `shopify-admin` to discover and validate it before the first store call. Reuse an unchanged document validated for the same API version. Execute through `shopify-use-shopify-cli` in the verified store context; that Skill owns managed CLI resolution, variable files and failure transport. Use the [store command input examples](references/official-compatibility.md#store-command-inputs) for the existing file-based invocation on Windows and POSIX.

Bundled executors own their embedded prevalidated GraphQL and declared verification reads. Invoke their documented interfaces without rediscovering or rewriting their internals. Do not add a second transport layer around them. A failed write does not authorize switching transport or replaying an unknown outcome.

## Main Agent Route C writes

Before preparing a Route C store write, read [route-c.md](references/route-c.md) for preview, language, authorization and completion requirements. Then apply the selected domain or bundled publisher's more specific contract. Theme preview synchronization uses the narrowly scoped Theme Craft procedure above, not Route C or a general Main-Agent theme-write fallback. Product/Collection briefs, theme handoffs, backups and social payloads remain owned by their respective Skills.
