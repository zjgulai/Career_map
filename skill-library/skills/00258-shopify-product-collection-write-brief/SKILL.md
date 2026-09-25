---
name: shopify-product-collection-write-brief
description: Canonical producer/consumer contract for every Product or Collection write delegated to shopify-product-editor. The Main Agent MUST load this Skill completely before preparing the first merchant-facing Product/Collection write preview, requesting confirmation, or spawning the editor. Defines the nested brief shape, homogeneous operation grouping, verbatim confirmation evidence, immediate ACTIVE plus Publication previews, and dependency-aware cross-domain sequencing.
---

# Shopify Product/Collection Write Brief

This Skill is the single producer/consumer contract for every new `shopify-product-editor` spawn. Its envelope contains confirmed business intent; it is not a Shopify API payload and does not represent Shopify's distinct `Catalog`, `PriceList`, `MarketCatalog`, or `CompanyLocationCatalog` resources.

## Who loads this Skill

- The **Main Agent MUST load this Skill completely before it prepares the first merchant-facing Product/Collection write preview or asks for confirmation**. It uses this contract to present the preview, capture valid confirmation evidence, and construct the canonical nested brief before the first spawn.
- `shopify-product-editor` loads this Skill completely before preflight and rejects a producer brief that violates it.
- `shopify-product-management` and `shopify-collection-management` load this Skill before their domain-specific write contracts.
- A purely read-only Product or Collection request that will not lead to a write does not need this Skill.

Do not wait for a rejected sub-agent call to discover missing confirmation evidence. The Main Agent owns producing a valid first brief; the editor owns consuming and validating it.

## Execution owner and handoff

Every Product or Collection write, including a single-item change, executes through `shopify-product-editor`; the Main Agent has no inline write fallback. Read-only discovery may run with the owning domain Skill loaded and does not require confirmation between reads. Before live store access, load [`shopify-execution`](../shopify-execution/SKILL.md) for the connection, managed execution, and privacy contract.

The Main Agent owns the preview, merchant choices, confirmation, and resource-specific delete-backup handoff. A delegation brief contains verified `store_handle`, confirmed outcomes and affected entities, merchant data/assets, constraints, confirmation evidence, and observable success criteria. It never prescribes GraphQL fields, mutations, commands, or payload placement; the editor selects these under the domain Skill.

When the editor returns partial or failed work, keep completed work and existing evidence. Relay only the unfinished business outcome to the same editor or report `PARTIAL`; the Main Agent must not take over the write or replay successful steps. A new or changed business outcome, affected entity, or exact approved payload requires a refreshed preview and confirmation before additional writes.

## Canonical shape

```json
{
  "store_handle": "<store>.myshopify.com",
  "resource_scope": "product | collection | product-and-collection",
  "language": "<optional report language>",
  "product": {
    "operation": "create | update | delete | publish-toggle",
    "user_confirmed_at": "<ISO8601>",
    "user_confirmation_summary": "<exact user utterance>",
    "content_language": { "source": "<conditionally required merchant-facing language name>" },
    "items": [{
      "intent_id": "product-1",
      "title": "T-shirt",
      "status": "DRAFT"
    }],
    "business_targets": {
      "inventory_location": { "name": "<exact merchant-facing name>" },
      "publications": [{ "name": "<exact sales-channel name>" }]
    }
  },
  "collection": {
    "operation": "create | update | delete | publish-toggle | add-products | remove-products",
    "user_confirmed_at": "<ISO8601>",
    "user_confirmation_summary": "<exact user utterance>",
    "content_language": { "source": "<conditionally required merchant-facing language name>" },
    "items": []
  },
  "dependencies": [
    {
      "upstream": { "domain": "product", "intent_ids": ["product-1"] },
      "downstream": { "domain": "collection", "intent_id": "collection-1" },
      "requires": "verified_successful_product_gids"
    }
  ],
  "verify": { "optional_additional_checks": [] }
}
```

`store_handle` and `resource_scope` are always required. Include exactly the domain envelopes selected by `resource_scope` and omit the others. `language` and `verify` are optional shared metadata. Product `business_targets` and each domain's `content_language` are conditional, not common mandatory fields.

`dependencies` is conditionally required only when a downstream Collection item consumes Product results produced by the same brief. In that case, give every referenced item a unique stable `intent_id` and declare the exact Product-to-Collection edge shown above. The only supported dependency meaning is `verified_successful_product_gids`: only named Product items that finish successfully contribute upstream GIDs. The same Collection item may also include independent, confirmed existing products in `desired.products: [{ "id": "gid://shopify/Product/456" }]`; the checkpoint merges these with the successful upstream GIDs after every named upstream item terminates. Keep one item for the Collection outcome, including mixed existing and upstream products. Omit `dependencies` for independent Product and Collection outcomes; co-presence in one brief never creates an implicit ordering edge.

## Homogeneous operation groups

Each selected Product or Collection envelope represents exactly one primary lifecycle `operation`. Every item in that envelope must satisfy the requirements of that one operation. Do not add item-level `operation` fields or place heterogeneous primary operations in one envelope.

When one confirmed request contains different primary operations in the same domain, the Main Agent partitions it into homogeneous operation groups and invokes the same `shopify-product-editor` once per group, sequentially. Each invocation is a complete canonical brief with only that group's items. One affirmative reply may be reused across those briefs only when the immediately preceding preview explicitly enumerated every operation group, affected entity, and group count; each brief carries the same verbatim reply and recorded confirmation time. Do not ask for another confirmation between groups unless the business outcome, affected entities, or blast radius changed.

Secondary capabilities do not create another primary-operation group. For example, Product create plus inventory, `ACTIVE` status, media, and Publication outcomes remains one Product `create` envelope; a Collection update with a genuine field/rule change that also changes confirmed publication or manual membership remains one Collection `update` envelope. A dependent Product-create plus Collection-membership workflow remains one `product-and-collection` brief and declares its dependency so verified successful Product GIDs can flow into the Collection item.

A Collection `update` item must declare its proposed field/rule change in `desired`; existing `kind`, `products`, and `publication` alone do not supply that primary intent. The first local checkpoint rejects such an item as `missing_primary_change` before store access. The domain still validates the proposed values and verified diff, including uncovered fields that require its Admin route; this structural check does not turn arbitrary metadata into a valid field change.

For a membership-only replacement, such as removing 3 archived Products and adding 2 active Products to one manual Collection, the Main Agent previews those two exact sets and counts, then sends a `remove-products` brief followed by an `add-products` brief to the same editor. Each brief has one Collection item with the same confirmed target and its own `desired.products` set. Preserve the first group's result and expected membership transition when checking the second group's baseline. Reuse the same affirmative reply only under the unchanged preview scope above. A membership request in just one direction needs only that existing operation; independent existing targets and declared Product-result dependencies keep their existing membership rules. Do not disguise membership-only work as `update`, add an unchanged field merely to obtain a primary receipt, or fabricate `update_collection` / `admin_collection` success after membership has already written.

Destructive deletes are never grouped with another primary operation and still require one item-specific confirmation per deleted entity. The editor rejects a heterogeneous envelope as `mixed_primary_operations` before store access; it does not repartition an invalid producer brief itself.

## Main-Agent preview and first-spawn preflight

Before asking for confirmation or making the first spawn:

1. Require a verified full `*.myshopify.com` `store_handle` and one allowed `resource_scope`.
2. Build the merchant-facing preview from verified current values, exact proposed outcomes, affected entities, and blast radius. For Publication outcomes, load the shared [Publication contract](../shopify-product-management/references/publication.md) and follow its producer resolution steps: show the store-returned channel name, use the existing no-apply setter when the resource is known, or its resource-free `resolve_publication.mjs` for creation. If the target has not been selected yet, first read the actual choices. Resolve missing or ambiguous choices before confirmation; never guess an English `Online Store` name. A verified exact name or an already known GID remains valid, with no new mandatory GID field. Every item and business target later placed in the brief must match this immediately preceding preview.
3. For every selected envelope, require one supported `operation`, a non-empty `items[]`, and operation-homogeneous items with that operation's primary intent. A Collection `update` requires a proposed field/rule change in `desired`; partition membership-only removal/addition into separate sequential briefs before the first spawn.
4. Wait for an explicit affirmative reply to that preview. Set `user_confirmed_at` from that message's actual timestamp; when the host does not expose it, call its current-time tool immediately after the reply and before the first spawn, and retain that tool result as the observed recording time. Use the actual ISO8601 timezone: UTC uses `Z`; Beijing local time uses `+08:00`. Never compose a plausible time from the plan, session start, previous reply, or the model's estimate. Reuse the original timestamp and evidence on an unchanged-scope relay instead of replacing them with the current time. Copy the reply verbatim into `user_confirmation_summary`, for example `上架吧`. Never replace it with Agent-authored prose or add it only after a rejected spawn.
5. One reply may populate both envelopes only when the immediately preceding preview explicitly covered both Product and Collection outcomes. Product consent never implies Collection consent.
6. For combined work, declare a dependency only when a Collection outcome consumes Product results produced by this brief. Require stable referenced `intent_id` values for that edge. Do not invent a dependency or fixed cross-domain order for independent outcomes.
7. Apply each selected domain Skill's operation-specific requirements. A Product delete backup never satisfies a Collection delete backup.
8. Require `content_language.source` only when shopper-visible text would otherwise have ambiguous source-language intent. Conversation/report language is never evidence of storefront language.

For an immediate Product launch or any request whose stated outcome is shopper-visible storefront availability, normalize the preview before confirmation into two separately displayed Product outcomes:

- Product `status: ACTIVE`;
- publication to every exact merchant-facing Publication target.

Carry both confirmed values in the Product envelope. A single affirmative reply may authorize both because the preview enumerated both; the executor must still route status and Publication membership separately. If the merchant explicitly requests `DRAFT`, preserve it and state that Publication membership alone does not make the Product shopper-visible.

Missing shared preflight data aborts the whole brief before store access. Missing or stale domain-item data aborts only the affected item as its domain contract specifies.

### Confirmation scope

Silence, an unrelated reply, a bare emoji, `whatever`, `你决定`, a generic plan approval, or an earlier unrelated confirmation is not write consent. A recommendation, Connector connection, schedule, or authorization to prepare a draft does not authorize publication or another later external write. Apply the actual affirmative reply only to the immediately preceding preview's unchanged scope.

Compare the recorded time with the available message or current-time tool evidence. A known mismatch is `confirmation_time_mismatch`: correct it from the original evidence before dispatch, or return the mismatch without writing when the editor receives it. Do not ask for renewed consent solely to correct a transcription error in otherwise valid evidence. Timestamp syntax alone cannot prove when the user confirmed; if no observed time is available, report that missing evidence instead of inventing it. A historical brief is not invalid merely because the current clock is later.

For non-destructive batches, require an explicit batch request and reconfirm the exact affected count in the preview. Destructive writes remain one entity per confirmation, after its owning domain's backup gate. Do not apply delete-only requirements to Product archival. Initial confirmation covers the unchanged previewed outcome; do not ask again between already-confirmed steps or independent read-only stages.

### Language and business context

Reply/report language and extra verification criteria are optional brief metadata. Keep conversation language, source storefront content language, and requested target languages/markets independent: conversation language controls interaction and reporting only. Never infer source or target storefront language from the user's conversation language.

Before a shopper-visible text change, use confirmed content intent and verified current store locale/market facts when available. Include an unresolved source-language choice and any requested translation language, market, and publish outcome in the same normal write preview. Do not add a language question to SKU, price, inventory, status, publication, media-only, deletion, or other non-text changes. Merchant-facing language and market names are business intent; locale IDs, API fields, and payload placement remain executor-owned.

Keep `user_confirmation_summary` verbatim in the user's original language; translate only surrounding explanation, never the stored confirmation evidence. Keep JSON keys, GIDs, SKUs, URLs, paths, and Shopify error text unchanged.

## Execution and compatibility

Product-only, Collection-only, and combined producers all emit the canonical nested shape. Validate every declared dependency before store access. Product-first is mandatory only for a Collection item that consumes Product results from the same brief: wait for its named upstream Product items to reach terminal status, then use the checkpoint's merged eligible membership targets. Failed upstream items never contribute an ID, even when that ID also appears in the Collection's explicit products. Product and Collection items without such an edge have no global cross-domain order; the editor may schedule ready work in any deterministic safe order while preserving per-item evidence. A downstream failure is `partial`, never rolls back an upstream success, and never causes a successful independent item to be replayed.

The executor may accept the historical flat Product-only brief as an input compatibility adapter. It normalizes that shape to `resource_scope: product` before validation. No prompt, orchestrator, Skill, eval, or new caller may emit the historical flat form.

## Local execution checkpoint

The shared editor MUST run `scripts/catalog_request.mjs` before store access and after recording each terminal item, before starting dependent membership, and before returning its final report. Resolve the entrypoint relative to this Skill's exact installed directory and use the host's JavaScript runner, as with domain scripts:

```text
<runner> <BRIEF_SKILL_DIR>/scripts/catalog_request.mjs --input <brief.json>
<runner> <BRIEF_SKILL_DIR>/scripts/catalog_request.mjs --input <brief.json> --results <results.json>
```

The first command returns `normalized_brief` with stable report IDs plus `ready_items`. Keep that normalized brief unchanged for this execution. The second reads the same brief and a task-local JSON evidence array. Both commands are strictly local: no Shopify call, OAuth, GraphQL, subprocess, mutation, or automatic retry. The Main Agent may also use the first command after the user's reply to catch structural omissions before spawning; an earlier business preview does not need a fake confirmed brief.

Code validates shape, operation groups, explicit references, result store and known target IDs, supported capability names, and declared route completion. **It cannot verify the truth of natural-language authorization, preview coverage, source-language intent, target-name resolution, or the completeness of an Agent's business-to-capability mapping.** Main Agent and editor still compare those facts with the actual conversation and loaded domain contracts. This is a task-local evidence reducer, not a durable exactly-once service or a store lock.

Before the first capability of an item, record its `required_capabilities` from the complete domain route manifest and run the checkpoint with that record and an empty `capabilities` array. The checkpoint rejects a manifest missing the primary operation as `missing_primary_capability` before any capability runs; do not wait until `complete: true`. This remains a string array: include one occurrence for each planned distinct-target operation, repeating the script name for multiple Publication targets, inventory-item/location pairs, or image sources. A dry-run and its matching apply share one occurrence; an already-satisfied target also fills only one occurrence. Do not deduplicate the array or reduce its planned counts after a partial execution. These are executor-owned records, not new caller fields or CLI parameters. Keep one result record per item and append original script JSON plus actual exit codes in call order:

```json
[
  {
    "domain": "product",
    "intent_id": "product-1",
    "required_capabilities": ["create_product", "set_product_publication", "set_product_publication"],
    "complete": false,
    "capabilities": [
      {
        "capability": "create_product",
        "exit_code": 0,
        "result": "<replace with the complete original JSON object from the script>"
      }
    ]
  }
]
```

The example reserves two independently confirmed Publication targets. Use the script's filename without `.mjs` as `capability`. Product/Collection mutation entrypoints add `store` and `capabilityReceipt` to their existing JSON. The runtime captures `capabilityReceipt.operation_target` from existing inputs where supported, including on failure; no new CLI argument is needed. Existing arguments and result fields are unchanged. Never overwrite those fields or invent a different operation identity to make evidence pass. Keep failed JSON from stderr and the original exit code. Keep a read-only probe or discovery result in report evidence, not in the mutation capability array. A Product create/update result requires its owning `verification.passed`; secondary publication or upload success alone never completes creation. For bulk status, attach the unchanged bulk JSON to each affected Product's record; each brief item must carry its confirmed GID, and the reducer selects exactly its row.

For an uncovered Admin outcome, the editor still owns the existing Admin validation and verification gate. After it finishes, adapt its actual evidence into a result with the same store, `ok`, `dryRun: false`, target Product/Collection GID, `verification.passed`, and `capabilityReceipt.capability` of `admin_product`, `admin_collection`, `delete_product`, or `delete_collection`. Preserve mutation failures and completed steps. This adapter is evidence formatting only and never authorizes or executes GraphQL. A delete result uses the verified deleted target GID and the owned non-resolution evidence. Never fabricate `ok: true` from a mutation response when its required verification failed.

Set `complete: true` only when the entire predeclared item route and business verification checklist have finished. Every occurrence in `required_capabilities` needs a distinct successful or already-satisfied operation; one successful target cannot cover two planned targets. A missing business requirement uses `abort_reason` with no fabricated capability result. A failure or unknown mutation result stops that item regardless of `complete`; `mutation_status: unknown` requires reconciliation outside this run and remains blocked. `mutation_status: not_attempted` means this request did not issue a write, including a CLI that never started or a failed read; preserve any `prior_writes_confirmed` from earlier steps, and keep the same stop-on-failure rule for this item. Completed writes and unknown later writes can coexist: retain `prior_writes_confirmed` and `completed_steps`. A no-change receipt is `already_satisfied` and must not be followed by `--apply` for that target.

The reducer returns one `capabilities` entry per operation, with `operation_key` and an `operation_target` when available. Obey both replay lists: `do_not_repeat_operations: [{ capability, operation_key, target }]` blocks that target only, while `do_not_repeat` retains the whole-capability block for singleton or unidentified evidence. A completed target does not block another planned distinct target; changing an action, quantity, filename, or attempt identifier does not authorize replay of the same target. An unknown result without target identity conservatively blocks every later operation of that capability for this item.

For manual Collection membership, keep one Collection item for the confirmed Collection outcome and partition its Product targets into disjoint batches of at most 250 per script invocation. Each planned batch contributes one `add_to_collection` or `remove_from_collection` occurrence to `required_capabilities`. A batch's dry-run and matching apply must retain the same Product set; order and duplicate IDs do not create a new identity. Its runtime target is `{ collection_id, product_ids }`, with sorted unique Product IDs including already-satisfied members. A terminal batch locks each Collection/Product pair for that capability: another disjoint batch may continue, but repeating a subset or mixing completed/unknown members into a new batch is rejected. A wholly already-satisfied batch ends at dry-run; failure or unknown mutation still stops the affected item under the normal result contract. Membership failure output without captured input keeps the conservative whole-capability lock.

Use only `dependencies[].product_gids` for the declared dependent membership after `ready: true`. This is the deduplicated union of verified successful upstream GIDs and the Collection item's independent explicit existing Product GIDs. Pending upstream work keeps the whole dependent item waiting, including its independent targets. Partial, failed, or aborted upstream Products never supply an ID: the reducer excludes their known brief target IDs and any IDs returned by their receipts, including partially created Products, even if repeated in `desired.products`. Do not relabel an affected upstream Product as independent to bypass that gate.

The Collection domain must still verify every explicit Product GID's existence in the same store, confirmation coverage, and final membership. The reducer only merges structurally valid GIDs; it cannot resolve handles or names, prove independence, or establish authorization. Resolve independent existing targets during producer discovery and include their exact confirmed GIDs in `desired.products` for this mixed flow. Also resolve any existing upstream Product named by a handle or title into the existing `target.id` field before freezing the executable brief, so its identity remains known even if its write fails before returning a GID. New Product creation has no pre-existing GID; keep its named dependency and use the actual receipt identity when available. If an explicit target's independence from an unresolved upstream cannot be established, stop that Collection item as missing domain-item data. An unresolved target must be resolved before producing the executable brief or reported as missing domain-item data; never omit it from the business checklist or invent its GID.

If every upstream item fails but independent existing targets remain, execute only those eligible targets under the same Collection item and report the combined result as `partial`, retaining `excluded_product_intent_ids` and the upstream failures. If no eligible target survives, the reducer aborts the dependent item without a Collection call. It preserves successful independent items and never replays them. `ready_items` contains remaining work only; obey both replay lists before continuing. The final report keeps existing per-domain fields and evidence, using the reducer's item status and counts; do not call a run complete while `complete: false`.
