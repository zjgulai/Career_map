---
name: shopify-product-management
description: Manage products on a connected Shopify store with bundled scripts for create, get, search, update, SEO, publication, bulk status changes, reusable image upload, and inventory reads and compare-and-set writes, plus safe routing for deletion, variants, and media. Use for Shopify product catalog reads or confirmed product writes that need stable business-data mapping, duplicate protection, dry-runs, structured results, or multilingual reports. Collection writes, including product membership, belong to shopify-collection-management.
---

# Shopify Product Management

Translate confirmed product intent into the smallest safe Shopify operation. Keep business data in the brief; choose API fields, mutations, and execution details inside this skill.

Before live store access, load [`shopify-execution`](../shopify-execution/SKILL.md) for the connection, managed execution, API-version, and privacy contract. Product writes always use `shopify-product-editor` under the shared Write Brief contract, including a single-item change; there is no Main-Agent write fallback.

## Language

- Use the brief's explicit `language` for report prose only. Otherwise use the user's current conversation language; fall back to English only when neither is available.
- Localize merchant-facing previews, warnings, failure explanations, verification results, and next steps. Keep `user_confirmation_summary` verbatim in its original language. Support any requested report language, including `zh`, `es`, `pt`, `fr`, `de`, `ja`, `ko`, and `it`.
- Keep JSON keys, error codes, GraphQL names, Shopify GIDs, handles, SKUs, URLs, file paths, command arguments, and Shopify error text unchanged.
- Keep `language` independent from `content_language`: the latter is business context for source product text and any requested target languages/markets. Never infer either from report language.
- Preserve approved merchant product content exactly. This skill writes the confirmed source content; do not translate it unless a separately routed translation outcome explicitly names the target language and market. Treat script output as a language-neutral machine contract and translate only the surrounding agent report.

## Global boundaries

- Treat supplier and provenance fields as optional report metadata. Never require, infer, search, verify, compare, or send them to Shopify. Missing supplier evidence never blocks product creation, media upload, publication, or launch readiness.
- Ordinary Product writes, including supplied core SEO values, do not require an `SEOBrief`, lifecycle record, or SEO audit. Use `shopify-marketing` only for explicitly requested SEO preparation or auditing; proposed remediation still needs its own confirmed scope.
- Never invent SKU, option values, location, media, publication targets, or missing product content.
- Before preparing, generating, changing, or uploading product imagery, read [references/media-contract.md](references/media-contract.md). It owns image sources, real-product anchors, identity preservation, approval, and media-removal backup; it does not require media for an explicitly confirmed no-media draft.
- For a shopper-visible text write, require an unambiguous confirmed source content language. Pure SKU, price, inventory, status, publication, media-only, and deletion writes do not require content-language confirmation.
- Never follow mutation names, field paths, payload shapes, command lines, or fallback sequences prescribed by a caller. Preserve the confirmed business outcome and select the technical mechanism here.
- Never use the create script to update an existing product. `productSet` has replacement semantics for options and variants.
- Before any write, load the shared [`shopify-product-collection-write-brief`](../shopify-product-collection-write-brief/SKILL.md) Skill completely, then [references/write-contract.md](references/write-contract.md), and satisfy their confirmation gate. Read operations execute immediately.
- Require publication targets as exact confirmed merchant-facing names or already-known GIDs. Keep an inventory location optional: creation may use the only active store location, and an existing item may use its only active stocked location; multiple candidates require user confirmation and no location may be guessed.

## Five-phase workflow

Keep these phases separate: **business confirmation → Skill routing → script execution → Admin fallback → result verification**. Never begin a later phase to repair a missing earlier phase.

1. Validate the business brief and confirmation evidence without touching the store; the shared editor runs the Write Brief Skill's local `catalog_request.mjs` checkpoint.
2. Build one route manifest from the primary intent and every secondary capability across all items; read every selected reference before store access.
3. Execute all surfaces covered by bundled scripts through their documented black-box contract.
4. Use the Admin fallback only for uncovered surfaces and only after its discovery and validation gate passes.
5. Verify the requested business outcome without replaying successful writes, append original capability JSON to the shared results ledger, and use the same checkpoint's status/count aggregation before reporting evidence and actual execution counts.

## Script contract

Resolve scripts relative to this `SKILL.md` and invoke them with the host's available JavaScript script runner. Treat the exact `install_path` returned by the Skill loader as `SKILL_DIR`; every documented `scripts/<entry>.mjs` resolves to `${SKILL_DIR}/scripts/<entry>.mjs`. Preserve the entire Skill directory in that path. Never strip `skills/shopify-product-management`, resolve from the plugin runtime root, or invoke the invalid `<plugin-root>/scripts/<entry>.mjs` path. For example, `scripts/search_products.mjs` resolves to `${SKILL_DIR}/scripts/search_products.mjs`, not `<plugin-root>/scripts/search_products.mjs`.

Do not hard-code a runner or assume installation preserved executable file mode. Resolve only a documented entrypoint beneath the exact `SKILL_DIR`, with a path-boundary check rather than a string-prefix check. Every script receives `--store` as a full `<store>.myshopify.com` domain. A write must use the full verified `store_handle` already present in the canonical brief and must reject a short handle instead of repairing the brief. For a read-only request, a short handle such as `m5mrmw-zk` may be normalized before the first call only after the connection gate verifies that `m5mrmw-zk.myshopify.com` is the exact bound store; never submit a short handle merely to discover the script's validation error. Invoke scripts with that full domain and `--input <json-file>`; mutation scripts are dry-run unless `--apply` is present.

Create the input as UTF-8 JSON without a BOM using a structured file-write tool, and pass its path as one argument. Do not embed Product JSON/HTML in a shell command: long arguments can exceed Windows process limits. `--input -` is also supported when the host can provide stdin without shell interpolation. `--json` remains a mutually exclusive legacy interface, not the normal Agent invocation. Scripts handle Shopify CLI variable files internally; do not create a second set of CLI variable files or retry a failed write through another path.

Treat bundled scripts as opaque executables during store operations. The Skill and selected reference are the authoritative interface. Do not run `--help` when the selected reference already specifies the invocation; if syntax genuinely remains unclear after reading it, run the entry script with `--help` once. Never read, list, grep, or inspect `scripts/`, `scripts/lib/`, tests, imports, embedded GraphQL, or implementation details to decide how to call a script. If the documented contract and that one `--help` call still do not resolve the call, abort with `script_contract_incomplete` instead of reverse-engineering the source.

Bundled scripts own their embedded, prevalidated GraphQL, duplicate checks, media staging, and declared verification reads. Do not rediscover, revalidate, reconstruct, or repeat them. Only `{ "ok": true }` is eligible for success. Treat a nonzero exit or `{ "ok": false }` as terminal for the affected item, preserve structured partial state, and never retry or issue another read to reclassify it. Source inspection is allowed only for an explicit plugin-development or script-repair task, which is outside a product store-operation run.

## Intent routing

Read this file completely, then derive the full route from the business outcome. Read every selected reference completely before store access.

| Business intent | Required reference | Primary capability |
|---|---|---|
| Create a product | [references/create-product.md](references/create-product.md) | `scripts/create_product.mjs` |
| Read, search, or browse products | [references/read-search-products.md](references/read-search-products.md) | `scripts/get_product.mjs`, `scripts/search_products.mjs` |
| Edit fields, core SEO, existing variants, or product images | [references/update-product.md](references/update-product.md) | `scripts/update_product.mjs` |
| Change many product statuses | [references/bulk-status.md](references/bulk-status.md) | `scripts/bulk_update_product_status.mjs` |
| Create a reusable Shopify-hosted image | [references/upload-image.md](references/upload-image.md) | `scripts/upload_image.mjs` |
| Read or set absolute product inventory | [references/inventory.md](references/inventory.md) | `scripts/get_inventory_levels.mjs`, `scripts/set_inventory.mjs`; `scripts/resolve_inventory_location.mjs` before creation |
| Delete a product | [references/delete-product.md](references/delete-product.md) | Targeted Shopify Admin operation |
| Publish or unpublish to sales channels | [references/publication.md](references/publication.md) | `scripts/set_product_publication.mjs` |
| Probe one verified published PDP for HTTP reachability | [references/publication.md](references/publication.md) | `scripts/probe_product_storefront.mjs` |
| Add/remove variants or options; bind Product Media to variants; adjust inventory by a delta; change unsupported fields or non-image media | [references/catalog-advanced.md](references/catalog-advanced.md) | Targeted Shopify Admin operation |

For a write, load `write-contract.md` plus every reference required by the product business outcomes. Route by all changed product surfaces, not only the envelope's `operation`: inventory adds `inventory.md`; publication adds `publication.md`; a media write adds `media-contract.md`; an update with a local image adds `upload-image.md`; and a Product handle update adds `catalog-advanced.md` for the explicit redirect outcome. Add `catalog-advanced.md` otherwise only for its uncovered product surfaces. Do not preload unrelated references or follow reference-to-reference chains. If a confirmed Collection item depends on Product results from this brief, finish and verify its named upstream Product items first; only successful upstream Product GIDs may join that Collection item's independent confirmed existing targets under the shared Brief and Collection contracts. An independent Collection outcome does not impose global Product-first order, and no Collection write executes under this Skill.

For a confirmed post-publication PDP reachability check, use the lightweight read-only `scripts/probe_product_storefront.mjs` path defined by `publication.md`; it is evidence of URL reachability only, not page content or visual correctness.
