---
name: write-compare-report
description: |
  Unified compare skill for product comparisons, supplier comparisons, and inquiry/auto-chat seller-response comparisons.
  Trigger when the buyer wants to compare, rank, choose, or decide between products, suppliers, quotes, seller replies, or inquiry options in any language.
  Also trigger on **selection intent that never says "compare"**, whenever two or more candidates already exist in context (search results, cards, a shortlist, seller replies):
  filtering or shortlisting the set ("show me the ones I can buy", "which of these are worth it", 只看能买的 / 帮我挑几个);
  asking for a direct verdict plus reasons ("tell me directly whether it's worth considering, and give me 3 key reasons", 值不值得考虑 / 该选哪个);
  eliminating, ranking, or asking which is best / cheapest / fastest among them.
  Judge the underlying intent rather than keywords: any turn whose answer requires picking or ordering among multiple candidates is a comparison.
  Not for a viability or worth-buying verdict on one specific product (product-analysis-report), deciding what category or product to sell with no candidates yet (product-selection), or finding new listings (product search).
  This file owns the whole comparison flow (Part 1 – Part 6); the only conditional branch out of it is the profit-comparison reference.
enabled: true
---

# Write Compare Report

This skill writes comparison reports for products, suppliers, or inquiry / auto-chat seller replies through one unified flow. **The flow (Part 1 – Part 6) and the artifact paths are fully here; the HTML block schema is not — it stays owned by [`html-report-generator`](../html-report-generator/SKILL.md). The only conditional branch out of this file is the profit-comparison reference, and only when its gate is met.**

The flow has four stages, all defined below:

1. **Part 1 — Branch decision**: decide the primary compare object before calling MCPs.
2. **Part 2 — Data collection**: call the primary MCP, then optional MCPs only when their trigger conditions are met.
3. **Part 3 or Part 4 — Write the report**: Part 3 if inquiry context exists; Part 4 (§4a product or §4b supplier) if not. All branches use flexible formats — shape follows buyer priorities, not a fixed template.
4. **Part 5 — Artifact persist**: **WRITE → GENERATE → PRESENT**, always, regardless of whether SuperSourcing is active.

Path conventions are inlined in Part 5, so `sourcing-artifact-writer` never has to be opened for the slug. For the block schema you need exactly **one file, requested by name**: `html-report-generator`'s `block-config.md`. Never open that skill's `SKILL.md` first — it only tells you to open `block-config.md`, so the hop costs a whole turn and buys nothing. Alongside it, [`references/compare.skeleton.json`](references/compare.skeleton.json) is the config spine you fill in at Part 5 step 1 — read both in the §2.3 round-1 bundle. Two further files sit beside this one, and neither is read by default:

- [`references/profit-comparison.md`](references/profit-comparison.md) — the **conditional profit-comparison branch**, owning that flow end to end. Open it **only** when the §1.3 gate is met; otherwise this file is all you need.
- `references/report-contracts.json` — layout contracts. Never read it; pass it to `html-report-generate --contracts` in Part 5 step 2.

Active SuperSourcing comparison node: the caller loads its centralized comparison Adapter first, then executes the branch of this file selected there.

> ⚠️ **Hard gate — HTML artifact persist before buyer reply**: every comparison ends with the HTML artifact required by its active flow, generated through `html-report-generator` BEFORE the buyer-visible reply (standalone: `compare.html` per Part 5; active plan: the registry artifact selected by the caller). No generated HTML on disk means the flow has not finished.

## Non-negotiables

An index, not the rules themselves — every line names the section that owns it. Where a line here and a Part disagree, the Part wins. **One carve-out: the safety rule below is stated in full here *and again* in Part 3, §4a, §4b, and §2.6. That repetition is load-bearing — a cross-reference does not reach the model while it is writing inside a branch section, so never fold these restatements away as duplication.**

- **One standalone comparison needs no task plan** — these Parts *are* the plan (Part 1).
- **Pick exactly one primary compare object before any MCP call** (Part 1).
- **Only the primary branch MCP is mandatory**; optional MCPs need explicit user intent, never just IDs sitting in context (§2.1, §2.2).
- **Never ask the buyer anything before comparing.** No `ask_user`, no dimension / MOQ / customization card, no "which of these did you mean" round — in any branch. Derive the strategy from the conversation, assume what is missing, disclose the assumption, and let follow-ups collect corrections (Part 4 → *Decide the comparison strategy from the conversation*; §1.2 for the inquiry branch).
- **Never verify your own output with a sub-agent** (§2.4).
- **Fire independent calls together** — the first tool round after reading this file is a fixed parallel bundle (§2.3).
- **Read `block-config.md` and `compare.skeleton.json` directly before the first config write** (§2.3, Part 5 step 1). Never read `html-report-generator/SKILL.md` on the way there.
- **Fill the skeleton; never draft the config twice** — no prose rehearsal of blocks, rows, or the buyer reply before the `write` call (Part 5 step 1).
- **Profit is opt-in, gated, and owned elsewhere** (§1.3 → [`references/profit-comparison.md`](references/profit-comparison.md)). Outside the gate: no selling-price search, no prefill, no `profit.calculator`, no profit action.
- **Fixed report skeleton**: `hero` first, `card.ranking` second, the main `table.comparison` — with its product-main-image row — next, `list.action` penultimate, `text.source` last, and nothing after it (Part 5 step 1; §4a *Visual rules*).
- **`text.source` carries an `Assumptions` entry** whenever this round assumed any comparison input (Part 4).
- **Everything between the fixed blocks is flexible** — shape follows the buyer's stated priorities, not a template (§4a / §4b).
- **Never put a raw ID in buyer-facing output** — `productId`, `supplierId`, `sellerId`, `taskId`, `detailId` are internal-only, for tool calls. Name every product by its title and every company by its name. The sole exception is **inside a URL value** (§4a product-URL pattern, Part 3 chat-link pattern): an ID may sit in the link target, never in visible anchor text, a table cell, a `hero.meta` value, a `card.ranking` summary, or a `text.source` line (§2.6, Part 3, §4a, §4b).
- **Other universal output rules are stated once, in §2.6** — currency, missing data, URL fabrication, supplier-safe tone, working language. Branch sections add only their own extras.
- **Persist is exactly three steps — WRITE → GENERATE → PRESENT** (Part 5). One config write per round, `html-report-generate` is the only verification, never re-read what you just wrote, never touch an earlier round's files.

The buyer-visible reply is the concise handoff defined in Part 5 step 3 plus the report link — never a clarification round first, and never a second full copy of the report in Markdown.

---

## Part 1 — Branch Decision (always run first)

Decide the primary compare object **before** data collection. Do not use stale IDs elsewhere in the conversation to expand scope. The current user request and the immediately relevant SuperSourcing stage intent are the source of truth.

**No task plan for a standalone comparison.** When the current request is one comparison, execute this file's Parts directly — do not create a plan or task breakdown first, because these Parts *are* the plan. Stage tasks belong only to flows that explicitly require them (e.g. SuperSourcing).

### 1.1 Choose one primary branch

| User intent / context | Primary branch | Required MCP |
|---|---|---|
| The user explicitly asks about inquiry, quote, seller replies, auto-chat / 代聊, inquiry task comparison, or a specific in-scope task's seller responses | **Branch A — inquiry compare** → Part 3 | `get_task_progress_summary` |
| The user asks to compare products, items, SKUs, productIds, specs, price, MOQ, material, features, or SuperSourcing passes product candidates | **Branch B / §4a — product compare** | `fetch_product_info` |
| The user asks to compare suppliers, factories, companies, merchants, storefronts, supplierIds, capability, certification, factory scale, service, or SuperSourcing passes supplier-only candidates | **Branch B / §4b — supplier compare** | `fetch_supplier_info` |

**Selection intent is a comparison request.** A turn that never says "compare" still belongs here when answering it requires picking, filtering, shortlisting, eliminating, or ranking among 2+ candidates already in context — e.g. "show me the ones I can buy", "which of these are worth it", "tell me directly whether it's worth considering, and give me 3 key reasons", 帮我挑几个 / 只看能买的 / 该选哪个. Pick the branch from the candidate type above, and treat the buyer's implied criterion (buyable, worth it, budget, speed) as the leading comparison dimension per §4a / §4b "Read buyer priorities first" — do not ask for dimensions that the request already implies. A worth-buying verdict on a **single** product is not this skill's job.

If the user says only "compare these", "which is better", "哪个好", or similar:

- Use the latest active entity type in the current turn / immediate SuperSourcing stage.
- If product and supplier identifiers are both present, route to the object the user explicitly named last.
- If still unclear, decide it yourself from the conversation — take the entity type the buyer engaged with most recently, and when that is still tied, the type that covers more of the candidates in context. Do not ask.

### 1.2 Inquiry branch trigger guard

A `taskId` in broader conversation context is not enough to hijack a product / supplier comparison. Route to inquiry compare only when the current request explicitly targets inquiry / quote / seller-response comparison, or when the comparison request is ambiguous and the active in-scope task is clearly the latest compare target.

When inquiry compare is selected:

- Call `get_task_progress_summary` for each confirmed `taskId`.
- If scope is unclear (one task vs same-category set of tasks), resolve it from the conversation — the task the current request refers to, else the most recently discussed in-scope task — and name that task in the report so the buyer can redirect you next turn. Do not ask first.
- Use `list_inquiry_tasks` only to resolve which task the conversation is pointing at, never to hand the buyer a menu of choices.
- For multi-task scope, call all confirmed `get_task_progress_summary` requests in parallel and merge results with clear task labels.

### 1.3 Profit comparison is an opt-in extra

Profit comparison is **not** part of the default comparison flow. [`profit-comparison.md`](references/profit-comparison.md) owns the whole thing — trigger gate, purchase-price source, selling-price benchmark, prefill, report block, and skip rules. This file states no profit rules of its own.

- **Triggered** when the current request raises profit or price economics (profit / margin / ROI / landed cost / 利润 / 毛利 / 回本 / 成本核算, or any price / cost / value-for-money ask **including a plain "which is cheapest" / "哪个便宜" / "哪个划算"**), when the buyer opts in through the profit follow-up chip, or when the active plan stage requires it → open [`profit-comparison.md`](references/profit-comparison.md) and follow it end to end.
- **Not triggered** by a price-free request ("compare these", "which is better", "哪个好"), a spec / capability comparison, a supplier comparison, or price fields merely existing in the data → do not open that reference at all: no selling-price searches, no prefill, no `profit.calculator` block, and no profit action in the closing `list.action`. Ordinary price / MOQ rows in the specification matrix are unaffected.

---

## Part 2 — Data Collection

Call the required MCP for the selected primary branch. Then apply the optional MCP trigger matrix. **Do not call a non-primary MCP just because its IDs exist in context.**

### 2.0 Forbidden tools in this skill

`sku_selector` / `SkuSelector` and `product_supplier_search` are strictly forbidden in this skill. Product and supplier comparison is a read-only scenario — `sku_selector` renders an order-confirmation UI (owned by `buyer-trade-intent`), and `product_supplier_search` registers search-result cards that do not belong in a comparison.

- Compare entities come ONLY from context (prior search results, inquiry tasks, SuperSourcing state, buyer-provided IDs). Ambiguous → resolve per Part 1 from the conversation, never by asking; genuinely no candidates anywhere in context → say so in one line and stop, and never search to "find" them.
- Never call `sku_selector` to fetch product metadata, SKU attributes, tiered prices, MOQ, tradability, supplier info, or comparison inputs.
- Never ask the buyer for `country` or `currency` just to prepare a `sku_selector` call during comparison.
- For product comparison, use `fetch_product_info` as the mandatory product-data source. If a field is unavailable there and no optional trigger allows another read-only MCP, render it as missing (`—`) instead of invoking the SKU selector.

### 2.1 Required MCPs by primary branch

#### Product compare → `fetch_product_info`

Required when the selected branch is §4a and `productId` values are available. It retrieves official product data plus the brief supplier / review context merged per product. In product compare, this embedded supplier context is the default supplier signal.

In a profit-triggered round (§1.3) its `ladderPrice` field is also the only purchase-price source for the profit block; see [`profit-comparison.md`](references/profit-comparison.md) §2. Never call a separate product-detail MCP to obtain tiered prices.

**Tool contract (strict):**

- MUST pass products inside `fieldName_3.payload.product_list`.
- Each product item MUST be an object with `productId` and `dataSource`.
- `dataSource` defaults to `"Alibaba.com"` when the product clearly originated from Alibaba.
- MUST NOT use a top-level `productIds` array. That shorthand is not valid for this skill, even if it looks natural from the tool name.
- If `fetch_product_info` returns an error like `request is null` or `RLabRequest.getReqId()`, first retry with the exact `fieldName_3.payload.product_list` envelope below. Do not assume the failure was caused by too many product IDs or split into smaller batches before fixing the envelope.

Valid input shape:

```bash
accio-mcp-cli call fetch_product_info --json '{
  "fieldName_3": {"payload": {"product_list": [
    {"productId": "1601669202595", "dataSource": "Alibaba.com"},
    {"productId": "10000018434053", "dataSource": "Alibaba.com"}
  ]}}
}'
```

Invalid input shape for this skill:

```json
{"productIds": ["1601669202595", "10000018434053"]}
```

#### Supplier compare → `fetch_supplier_info`

Required when the selected branch is §4b and `supplierId` values are available. Call with the supplier list inside `fieldName_3.payload.supplier_list`:

```bash
accio-mcp-cli call fetch_supplier_info --json '{
  "fieldName_3": {"payload": {"supplier_list": [
    {
      "supplierId": "200689113",
      "dataSource": "Alibaba.com",
      "productIds": ["1601592964230"]
    },
    {
      "supplierId": "274363396",
      "dataSource": "Alibaba.com"
    }
  ]}}
}'
```

Each supplier item: `supplierId` (required), `dataSource` (required, defaults to `Alibaba.com`), `productIds` (optional).

**Supplier identity contract:** `seller_ali_id`, `sellerAliId`, and `sellerId` are Alibaba account / IM-routing IDs and MUST NOT be copied into `supplier_list[].supplierId`. Here `supplierId` means the supplier company ID (`companyId`; returned by recall as `company_id`).

When `companyId` is absent but the supplier's full official name or storefront URL is available, call `supplier_verification_recall` once per supplier with the exact payload in §2.4 Step A. Run recalls for multiple suppliers in parallel, accept only a candidate unambiguously bound to the same supplier, and read `payload.candidates[].company_id`. After all resolvable IDs return, call `fetch_supplier_info` with those company IDs; never guess or fall back to a seller account ID. Recall used only for this ID resolution does not trigger `supplier_verification_detail`.

#### Inquiry compare → `get_task_progress_summary`

Required when the selected branch is Part 3 and task scope is confirmed. MCP envelope for this branch uses `arguments.request`; omit `buyerId`. See §3.9 for parameters.

### 2.2 Optional MCP trigger matrix

| MCP / service | Optional trigger | Do not call when |
|---|---|---|
| `fetch_product_info` in supplier compare | The user asks to compare supplier products / SKUs / specs / prices / MOQ, or only `productId` is available and supplierId must be resolved. | The supplier comparison is about company capability, reliability, certification, service, or general supplier choice with supplierIds already available. |
| `fetch_supplier_info` in product compare | The user explicitly asks for supplier depth: supplier capability, certifications, factory scale, review / reputation, fulfillment, lead-time reliability, compliance, risk, or similar. Also call it if product data lacks supplier fields required by the user's stated report goal. | The user only asks to compare products / SKUs / specs / price / MOQ. Use `fetch_product_info`'s embedded supplier summary instead. |
| `list_inquiry_tasks` | Inquiry compare is selected but task scope is unclear. | A concrete taskId is already confirmed, or the user is asking product / supplier compare. |
| `supplier_verification_recall` + `supplier_verification_detail` | The user explicitly asks for verification, vetting, due diligence, compliance, risk, certificate validity, company stability, registry / legal checks, 验真, 背调, 资质, 风控, or the recommendation explicitly needs risk confirmation before order / RFQ. | SupplierIds merely exist, or the report only needs ordinary product / supplier comparison. |
| `alibaba-logistics-assistant-buyer` | The user asks about tariff, duty, import tax, customs, landed cost, destination cost, or the report goal explicitly requires landed-cost comparison. | A destination country / address is present but the user did not ask for tariff / landed-cost analysis. |

### 2.3 Dependency and parallelism rules

Parallelism is the default. When two or more required / triggered calls already have all inputs and no dependency on each other, fire them in the same tool round.

**Round-1 parallel bundle (mandatory).** The first tool round after reading this file fires all of the following **together**. None of them depends on another, so serializing any of them burns a whole turn for nothing:

1. The **primary branch MCP** for the chosen branch (`fetch_product_info` / `fetch_supplier_info` / `get_task_progress_summary`), plus any optional MCP already triggered whose inputs are ready.
2. **`block-config.md` from `html-report-generator`**, requested as a named file — `skill` with `skill_id: html-report-generator`, `file: block-config.md`. Do **not** read that skill's `SKILL.md` on the way; it carries no schema.
3. **[`references/compare.skeleton.json`](references/compare.skeleton.json)** from this skill, also as a named file. It is the config spine you fill in at Part 5 step 1 — having it in hand is what lets you write the config directly instead of drafting one in your head first.
4. The **round listing** and the **slug timestamp** per Part 5 *Preparation* — both are cheap, both are needed at write time, and neither depends on the returned data.

After that single round everything needed to write the config is in hand: data, schema, path, round number.

Run serially only for real dependencies:

- `fetch_product_info` must run before `fetch_supplier_info` when product data is needed to resolve supplierId.
- `supplier_verification_detail` must run after `supplier_verification_recall` returns candidate IDs.
- `alibaba-logistics-assistant-buyer` must wait if origin country, category, or HS hint depends on product / supplier MCP output.
- `list_inquiry_tasks` must run before `get_task_progress_summary` only when task scope is unknown.

Common execution shapes:

- Product compare only: call `fetch_product_info` only.
- Product compare + explicit supplier-depth request, supplierIds known: call `fetch_product_info` and `fetch_supplier_info` in parallel.
- Product compare + explicit supplier-depth request, supplierIds unknown: call `fetch_product_info` first, then `fetch_supplier_info`.
- Supplier compare only: call `fetch_supplier_info` only.
- Supplier compare + explicit product-spec request, productIds known: call `fetch_supplier_info` and `fetch_product_info` in parallel.
- Inquiry compare with multiple confirmed tasks: call all `get_task_progress_summary` requests in parallel.
- Verification requested for multiple suppliers: run all `supplier_verification_recall` calls in parallel; after successful recalls, run all `supplier_verification_detail` calls in parallel.
- Tariff requested with complete origin / destination / category: run tariff lookup in parallel with the primary MCP.

### 2.4 Supplier verification (lightweight, optional)

Verification enrichment is an independent data source. Run `supplier_verification_detail` and consume verification fields only when the optional trigger in §2.2 is met. A `supplier_verification_recall` call used only to resolve a missing `companyId` for `fetch_supplier_info` is identity resolution, not verification, and MUST NOT trigger `supplier_verification_detail`. If supplierId must be resolved through `fetch_product_info` first, run verification after that resolution.

This is the **lightweight** variant: **only `supplier_verification_recall` + `supplier_verification_detail`**. Do NOT run external corroboration (web search, customs lookup, digital footprint, etc.) — that scope belongs to the standalone `supplier-verification-report` skill, not here.

**Never dispatch a verification / validation sub-agent from this skill** — not for supplier vetting, and not to review this skill's own output. This file's own checks plus `html-report-generate`'s render validation are the flow's only verification steps.

#### Step A — Recall for every supplier in scope

For each supplier in the triggered verification scope, pick the strongest identifier in this order:

1. The supplier's **full official name** (`companyName` from `fetch_supplier_info`, `fetch_product_info`, or the user-provided name).
2. The **storefront URL** (`storefrontUrl` from MCP output) when only a partial or ambiguous name is available.

Fire one recall per supplier in parallel with each other. When recall supplies missing company IDs for `fetch_supplier_info`, wait for all resolvable recall results before calling `fetch_supplier_info`. When company IDs are already known and verification is independently triggered, recall can run in parallel with `fetch_supplier_info`. If recall needs the supplier name / URL from `fetch_supplier_info`, wait for that output.

```bash
accio-mcp-cli call supplier_verification_recall \
  --json '{"supplier_name":"<full supplier name or storefront URL>","candidates_only":true}'
```

If `payload.candidates` is empty for a given supplier:

- Retry once with the alternate identifier (name → URL, or URL → name).
- If still empty, **silently skip** verification enrichment for that supplier. Do not surface "no verification data" to the buyer; the rest of the comparison continues normally.

#### Step B — Detail for matched candidates

Collect `company_id` from each item in each successful recall's `payload.candidates`. Batch IDs by supplier and call:

```bash
accio-mcp-cli call supplier_verification_detail \
  --json '{"comp_id_list":["<id_1>","<id_2>"]}'
```

Join detail results back to the supplier by name. Detail calls for different suppliers can run in parallel.

#### Fields to extract (lightweight subset)

Keep this scope narrow — only fields that materially help comparison:

- **Business registry**: legal representative, registered capital, establishment date, enterprise type, business scope, registered address, USCC.
- **Risk records**: legal disputes, administrative penalties, abnormal-operation flags. Treat absence as "no risks found", not as positive certification.
- **Certifications with validity**: certificate name, expiry date, and `company_certification_url` when present.

Do NOT pull customs data, digital-footprint URLs, or anything that requires the verification skill's external search step.

#### Confidentiality and tone

- Translate raw fields into buyer-friendly natural language. Never expose internal supplier-verification IDs (`comp_id`, tool endpoint names) in the final report.
- Risk records, when present, follow the supplier-safe tone (§2.6 shared rules + §4b tone) — state facts without pairing a named supplier with a negative verdict.
- Treat `company_certification_url` like any other URL: cite only when relevant; in §4b it goes only into its allowed certification slot.

### 2.5 Tariff lookup (optional)

Only when the optional trigger in §2.2 is met, invoke the `alibaba-logistics-assistant-buyer` skill with:

- **Origin country**: from supplier location data.
- **Destination country**: from the buyer's stated delivery address.
- **Product category / HS code hint**: from product titles / category data.

If the skill returns no relevant tariff data, **gracefully skip**. Never fabricate tariff information.

### 2.6 Universal output rules (single source of truth)

These hold for every branch and every rendered block, and they are stated **here only** — §4a and §4b list nothing but their own branch extras:

- **No raw IDs in buyer output**: `taskId`, `sellerId`, `supplierId`, `productId`, `detailId` are internal-only. Buyer-facing copy uses names and decision-relevant facts.
- **Working language**: one language per report, matching the user's **latest** message; never code-switch inside a paragraph. Translate row labels, section headings, tier labels, badges, category / service labels, certification descriptions, and analytical prose. Left in source form: product titles, supplier names, certification codes (`FDA`, `ISO 9001`, `GOTS`, `BSCI`), numeric values, currency, and universal symbols (`—`, 🏅🥈🥉, ✅). When the language is genuinely unclear, resolve it with §4a *Language detection priority*.
- **URL fabrication ban**: cite only URLs that appear in tool outputs. Never guess.
- **Supplier-safe tone**: the same sentence must never pair a named supplier with a negative verdict — avoid "not recommended", "poor", "inferior to", "significantly weaker than", "lags behind". Use neutral framings instead: "main business focuses on…", "if the buyer prioritizes X, the Alternative better matches that need."
- **One link = one specific supplier** in prose. Multi-supplier anchor text ("their", "these", "他们") gets no link.
- **Missing data**: replace with `—` (em-dash). Never `N/A`, `null`, `none`, blank, or "data not found".
- **Price always carries the currency**: render every price (unit price, sample price, quote) exactly as the tool returns it, **keeping the currency symbol the interface already supplies** (typically `$`-prefixed) — whether a single value (`$6.50`) or a SKU/range price (`$2.77–4.33`). Never strip the symbol off a range and leave bare digits like `2.77-4.33`; keep currency consistent across the whole price row. Only fall back to `—` when no price is returned.

### 2.7 Cross-context data merge

Branch choice picks the **format** and the **mandatory MCP**. It does not forbid using optional data that was intentionally fetched under §2.2.

- Branch A reports may surface product specs from `fetch_product_info` or supplier reputation from `fetch_supplier_info` only when those optional calls were explicitly triggered or already available from the immediate task context.
- Branch B reports may note inquiry-history hints only when inquiry comparison was explicitly in scope or the user asked to connect the comparison back to an active inquiry.
- Never backfill a report with stale tool outputs just because they are present elsewhere in the conversation.

---

## Part 3 — Branch A: With Inquiry Context (flexible format)

**Announce on start**: "I'm comparing seller responses for your inquiry."

Buyer-facing persona and wording rules come from [accio-inquiry/SKILL.md](../accio-inquiry/SKILL.md) (*Voice and persona*; *User-facing wording*). Follow them for all buyer-visible output produced by this comparison.

### 3.1 MCP envelope reminder

For `get_task_progress_summary` and `list_inquiry_tasks` in this branch: MCP `tools/call`; use **`arguments.request`**. Omit **`buyerId`**.

### 3.2 Core Principles

1. **Inquiry-led focus, other data as auxiliary**: when inquiry context is present, the **seller-reply / quote content from `get_task_progress_summary`** is the **primary basis** for the comparison — its dimensions, commitments, and open questions drive what the report leads with, what it tables, and what it recommends. Product data (`fetch_product_info`) and supplier data (`fetch_supplier_info`) are **supporting / cross-reference** material only when Part 2 intentionally retrieved them or the immediate inquiry context already contains them: use them to enrich, verify, or contextualize the inquiry comparison (e.g. cross-check a quoted MOQ against the product's listed MOQ, add supplier reputation to a recommendation that's already grounded in the seller's quote), **not** as the headline. Do not let a generic product/supplier comparison crowd out what each seller actually said in this inquiry.
2. **Read what the buyer cares about most from context**: before writing, infer the buyer's priorities from this conversation — explicit asks ("compare on lead-time", "I only care about price"), the original requirement text, recent objections, blockers raised, or repeated themes. Let those priorities decide which inquiry dimensions go to the top of the report, which differences to highlight, and which trade-offs to anchor the recommendation on. Do **not** default to a fixed dimension order when the buyer has clearly weighted some dimensions over others.
3. **Compare everything, not just price**: extract and compare across all available dimensions — unit price, MOQ, lead-time, certifications, product features, service terms, payment terms, etc. — but order and emphasis follow Principles 1 and 2.
4. **Surface differences clearly**: highlight where sellers differ significantly. Don't bury differences in uniform rows.
5. **Objective recommendations**: always state trade-offs. No single "winner" without acknowledging alternatives.
6. **Follow file URLs**: when seller summaries or conversation data include file links (spec sheets, test reports, certificates), retrieve and extract relevant facts (test results, cert scope, compliance details).
7. **Summary-first conversation policy**: for comparison, use summary-level seller data by default. Read detailed conversation history only when the buyer explicitly asks for it, or when summary fields are insufficient to make a reliable comparison on the buyer's asked dimension.
8. **`blocks` / Needs your input — chat link required**: for every supplier-specific **`blocks`** item you surface, **must** include `seller name [chat detail](https://www.accio.com/chat?activeIcbuAliId=<sellerId>)` on the same line when **`sellerId`** is known — **only** this URL pattern. Do **not** fabricate URLs or use other URL schemes. If **`sellerId`** is missing, plain seller name only. **Major progress** callouts: same URL pattern **optional** when helpful; not required on every supplier line.
9. **URLs in tables**: when supplier-comparison tables are rendered and **`sellerId`** is known, render supplier headers as `Supplier name [chat detail](https://www.accio.com/chat?activeIcbuAliId=<sellerId>)` (**only** this pattern). Plain-text headers are acceptable. Table body and prose do **not** need a link on every supplier mention. Global rule: [SKILL.md](../accio-inquiry/SKILL.md) → *Seller chat links (progress sync + comparison)*.
10. **No raw IDs in buyer output**: `taskId`, `sellerId`, `detailId`, and similar identifiers are internal-only fields for tool calls. Buyer-facing output names tasks and sellers and states decision-relevant facts; an ID may appear only inside a chat-link URL (items 8–9), never as visible text or a table cell.
11. **Scope-confirmed comparison (single task or same-category task set)**: by default, comparison targets **one concrete inquiry task** and outputs that task's seller comparison. If the buyer explicitly asks to compare a **same-category set of tasks** (for example, multiple "red dress" inquiries), support cross-task comparison across that selected set. If scope is unclear, resolve it from the conversation per §1.2 — **never ask first** — and name the chosen task by **task name** (with requirement / topic cues, never a raw `taskId`) so the buyer can redirect you next turn.

### 3.3 Trigger gating

This comparison activates only when **either** of:

| Trigger | Condition |
|---------|-----------|
| **Buyer explicitly requests comparison** | "compare all sellers", "which is best?", "how do they stack up?", "compare quotes", or similar. |
| **Most sellers have provided comparable info** | At least 2 sellers have responded with enough structured data (price, MOQ, lead-time, etc.) to form a meaningful comparison. The agent may proactively suggest comparison at this point. |

**Do NOT activate** when:

- Only 1 seller has quoted (inform the buyer and suggest waiting).
- Sellers have only acknowledged receipt without providing concrete info.
- The buyer is just asking about status or progress (→ route to [progress.md](../accio-inquiry/progress.md)).

If fewer than 2 sellers have quoted, inform the user:

```
Only 1 seller has quoted so far (Foshan Drinkware). A meaningful comparison
requires at least 2 quotes. Would you like to review this single quote,
or wait for more sellers to respond?
```

**Note:** ALL `autoFollow=0` sellers must be re-summarized locally — the cloud `agentSummary` freezes when AI-chat is turned off and may be stale. If any seller's returned summary is non-null, treat that seller as "replied" for gating purposes. See [§3.4 — When autoFollow=0](#34-load-seller-data) for the mandatory SubAgent flow.

### 3.4 Load seller data

From `get_task_progress_summary`, read **`detailInfoList`**, parse each row's **`agentSummary`** JSON string, and use **`summary`** (and when relevant **`blocks`**) for a condensed view of that seller's thread — use that for comparison fields, not full transcripts.

For message-level seller chat details, route to [negotiation.md](../accio-inquiry/negotiation.md). **`agentSummary = null` is not a trigger** for escalation by itself — treat it as "inquiry sent but seller has not replied yet"; keep that row as "awaiting reply", do **not** query conversation details only for that reason.

#### When autoFollow=0 — Local conversation summary via SubAgent **(mandatory)**

When loading seller data for comparison:

1. **Collect** all seller rows in `detailInfoList` where `autoFollow = 0` — regardless of whether `agentSummary` is null, because the cloud `agentSummary` freezes when AI-chat is turned off and may be stale even when non-null.
2. If any qualifying sellers exist, **spawn ONE** `alibaba-icbu-inquiry-history-summary-sub-agent` via `sessions_spawn` with input: `{ taskId, sellers: [{ sellerId: <each qualifying seller's sellerId> }], domain: "icbu", language: <working_language> }`.
3. **Await result** (timeout 120s). The SubAgent queries conversation messages for all sellers in a single execution and returns `{ summaries: [{ sellerId, summary, statue, blocks[] }] }`.
4. **Match results** — for each returned summary, find the corresponding seller row by `sellerId` and treat the `{ summary, statue, blocks[] }` identically to a cloud-generated `agentSummary`; for these sellers the SubAgent summary **replaces** any stale cloud `agentSummary`. Include these sellers in the comparison with their conversation-derived data.
5. **Build comparison columns from the summaries** — extract concrete dimension values from each summary (use the `keypoints` array from `inquiry-progress.config.json`'s `blocks[0].state` as dimension names when the config exists; otherwise derive dimensions from the buyer's requirement), only use values the summary attributes to the **seller** (skip buyer-side targets/requests), and use these seller values to populate the comparison table columns. Do **not** write to `blocks[0].state` in the compare flow — that state and its HTML are owned by the progress flow (updating state without re-rendering would leave `inquiry-progress.html` stale).
6. **Fallback** — for any seller whose SubAgent `summary` is null or whose entry is missing from the result, treat as `agentSummary = null` ("awaiting seller reply") — same as the cloud null rule above. Non-blocking.

### 3.5 Output — flexible structure

**No rigid template.** Structure the report to best serve the buyer's decision — seller-comparison tables, narrative analysis, or hybrid, whatever fits the data. The mandatory behaviors are:

- **Cover meaningful differences** across all comparable dimensions: pricing (unit price, volume discounts, tiers, tooling), MOQ (order + sample), lead-time (production, sample, shipping), certifications, product features (materials, dimensions, colors, customization), service (sample/return/warranty), payment (T/T, L/C, deposit), shipping (FOB/EXW/CIF, packaging). Mark missing data as `—`.
- **Comparable basis**: sellers may quote on different bases. Before ranking or naming "what to push on," align scope — what each side has committed to vs what is still conditional, bundled, or unclear. Do **not** recommend a move that re-litigates a term the data already shows as offered or settled for that seller; steer follow-on toward dimensions that remain **open** or **apples-to-apples** clarification where bases differ.
- **Trade-off-based recommendations** — never a single one-sided winner. Present options for different buyer priorities (best price, fastest delivery, lowest MOQ, premium quality, best payment terms, etc.). Always state the trade-off.
- **Merge in product + supplier context** only when Part 2 intentionally retrieved that optional data or the immediate inquiry context already contains it. Examples: cite supplier reputation (`reviewScore`, `deliveryRate`, `replyAvgTime`, `supplierTags`) when relevant to a recommendation; cite product spec details from `fetch_product_info` when they help judge value. Inquiry-context comparison is the **synthesis layer**, not just a re-render of seller chat summaries.
- **Apply all Part 2 shared rules** (no raw IDs, language consistency, chat-link URL pattern for `blocks` lines, supplier-safe tone, missing data as `—`).

### 3.6 Add suppliers on the same task

Triggered when, after the comparison, the buyer **names** which new suppliers join the **current** task — a named roster, not vague agreement. Without a named roster, propose a top-5 shortlist from the current sourcing context and confirm that roster first. Buyer copy is names-first, IDs never. Execution has a single source of truth: [initiation.md — Extend existing task](../accio-inquiry/initiation.md#extend-existing-task), which carries the named-roster gate — do not duplicate that runbook here. Progress-side sibling entry: [progress.md](../accio-inquiry/progress.md) → *Add suppliers on the same task*.

### 3.7 Conversation details handoff

This branch stays comparison-first. If detailed seller message threads are needed, route to [negotiation.md](../accio-inquiry/negotiation.md) and follow that document for conversation-detail MCP calls.

### 3.8 Next actions

| User decision | Action |
|---------------|--------|
| "Reply to / negotiate with [seller]" | Route to [negotiation.md](../accio-inquiry/negotiation.md) |
| "Push for a lower price with [seller]" | Route to [negotiation.md](../accio-inquiry/negotiation.md) |
| "Update my requirements" | Route to [requirements.md](../accio-inquiry/requirements.md) |
| "Check progress / status" | Route to [progress.md](../accio-inquiry/progress.md) |
| "Add more suppliers / widen sourcing on this task" (after **named-roster** confirm per initiation) | §3.6 above → [initiation.md#extend-existing-task](../accio-inquiry/initiation.md#extend-roster-confirm) |
| "I'll wait for more quotes" | Acknowledge, suggest checking back later |

### 3.9 Tool parameters

#### `get_task_progress_summary`

Returns **`success`** and **`detailInfoList`**; each row has **`agentSummary`** (stringified JSON) with **`summary`**, **`statue`**, **`blocks`**. Compare on parsed **`summary`** (and dispute/blocker context from **`blocks`** when it affects terms). When scope spans multiple tasks, you may call `get_task_progress_summary` in parallel (one MCP call per `taskId`) and then merge by task label. Outer wrapper: **`arguments.request`**.

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `taskId` | String | Yes | Inquiry task ID |

#### `list_inquiry_tasks`

Lists tasks with **`taskId`**, **`taskName`**, **`requirementsContent`**, **`attachmentLists`**. Use it to work out which task the conversation points at when scope is unclear — match `taskName` / `requirementsContent` against what the buyer has been discussing, then proceed without asking. Whenever the report names the task it compared, use **`taskName`** with requirement/topic cues, never a raw `taskId`. Pass only `source: "accio"` in `arguments.request`. Outer wrapper: **`arguments.request`**.

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `source` | String | Yes | Use `"accio"` |

### 3.10 Error handling

| Error | Action |
|-------|--------|
| No sellers responded yet | Inform user, suggest checking back later. |
| Partial data (some fields missing) | Show available data, mark missing as `—`. |
| Task not found | Guide user to `list_inquiry_tasks`. |
| Fewer than 2 quotes | Inform user; recommend waiting or reviewing available quote. |

### 3.11 Artifact persist (mandatory)

After composing the Part 3 report and **before** the buyer-visible response:
1. Resolve the slug per Part 5 *Preparation*.
2. Generate this round's comparison HTML through the Part 5 procedure — its step 1 names the file for round 1 vs later rounds.

> Part 5 is the complete procedure; nothing outside this file needs to be opened for it.

---

## Part 4 — Branch B: No Inquiry Context (flexible format)

Pick the sub-branch by user keyword (see Part 1):

- §4a → product compare (user named products / SKUs).
- §4b → supplier compare (user named suppliers / factories / companies).

Both sub-branches drive content from buyer priorities — no fixed section template. **Baseline content density runs higher than Part 3**: with no inquiry-side seller data to anchor the call, give the buyer broader catalog coverage and more cross-cutting context to converge. The "narrow when priority is sharp" lever in *Read buyer priorities first* still applies — but the floor is higher here. See each sub-branch's own "Read buyer priorities first" + "Hard rules" + dimension catalog.

### Decide the comparison strategy from the conversation

Branch B has no inquiry context to inherit comparison dimensions from — that is **not** a reason to ask the buyer. **Never call `ask_user` here**: no dimension card, no MOQ card, no customization card. Read the strategy out of what the conversation already holds, in this order:

1. **The current request** — both explicit dimensions ("compare on price and MOQ") and implied ones: "show me the ones I can buy" → tradability, MOQ, shipping readiness; "which is cheapest" → price economics; "worth considering" → value for money plus risk.
2. **Earlier turns and `<user_preference>`** — quantities or budget the buyer already named, destination / target market, OEM or customization intent, certifications, timeline, and especially prior rejections ("too expensive", "MOQ too high", "need it in 3 weeks"). A rejection is a stated priority.
3. **The search or sourcing context that produced these candidates** — the query behind the shortlist, category labels, supplier `mainCategory` / `productKeywords`, recurring spec themes. These say which dimensions actually differentiate this category.
4. **The Part 2 data itself** — lead with dimensions where the candidates genuinely differ; dimensions where they are identical are filler, whatever the category norm says.

When a needed input is genuinely absent anywhere above — exact order quantity, destination country, customization depth, sales platform — **assume a reasonable value** from the category and from the candidates' own MOQ / price range, then **disclose it in the report's `Assumptions` entry** (see below). Let the closing `list.action` plus the Part 6 follow-up chips invite the buyer to correct it: a correction next turn costs the buyer far less than a question that blocks this turn.

**Mandatory `Assumptions` disclosure.** Whenever this round assumed any comparison input, the closing `text.source` block must carry a localized `Assumptions` entry — one line per assumed value, each naming **the value and what it was inferred from**, e.g. `Assumptions: order quantity 500 pcs (from the category's typical MOQ tier in this candidate set); destination US (from the buyer's target market mentioned earlier) — tell me the real figures and I'll recompute.` Assumed nothing → omit the entry entirely. Never bury an assumed number in a table cell without this disclosure, and never present an assumption as returned data.

Feed the resulting priority signal into §4a / §4b's *Read buyer priorities first*.

---

## §4a — Product Comparison Format

**No fixed template.** Structure the product comparison report to serve the buyer's decision — table-heavy, narrative-heavy, or hybrid is all fine. The shape follows the buyer's stated priorities, not a checklist.

### Read buyer priorities first

Before drafting, scan the buyer's current query, `<user_preference>`, and recent conversation for explicit and implicit priorities — budget, certifications, MOQ, lead time, material, use case, target market. Let those priorities decide:

- Which dimension leads the report
- Whether the report is mostly tables, mostly prose, or a mix
- Which dimensions to include at all — a price-focused buyer rarely needs market-trend analysis; a brand-building buyer cares about supplier reputation more than unit cost
- How long / how broad the report is — narrow when the priority is sharp ("which is cheapest" → one paragraph with price + trade-off + one supporting fact); broader (cover more catalog dimensions) when needs are unclear: only one or two requirements stated anywhere in the conversation, or the request is broad ("compare these")

If the conversation yields no priority at all (Part 4 → *Decide the comparison strategy from the conversation*), fall back to common B2B dimensions: cost, quality / compliance, delivery / capacity, supplier strength.

### ⚠️ Hard rules — product-branch extras

§2.6 already binds currency, missing-data `—`, URL fabrication, supplier-safe tone, and working language; Part 5 step 1 bans shell artifacts in config values. These are the additions for product comparisons, plus the one safety rule that is deliberately restated here:

| Rule | Where it applies |
|---|---|
| **No raw IDs in buyer output** | `productId`, `supplierId`, `sellerId`, `taskId`, `detailId` are internal-only. Refer to every product by its actual title and every company by its name. An ID may appear **only inside a URL value** (next row) — never as visible text, a table cell, a `hero.meta` value, a `card.ranking` summary, or a `text.source` line. |
| **Product URLs may be constructed** | The single allowed exception to §2.6's fabrication ban: a product URL may be built from `productId` as `https://www.alibaba.com/product-detail/_<productId>.html`. Nothing else may be constructed, and the `productId` stays **inside** the URL — the visible link text is always the product title. |
| **Product and supplier links stay separate** | Product / title links use `productUrl` only; supplier / company links use `companyUrl` only. Missing `companyUrl` → plain text, never the product URL as a stand-in. |
| **Titles verbatim, never counted** | Refer to products by their actual title from the data source — never "Product A", "Product 1", or any generic placeholder. Use the title **exactly as returned**: do not truncate, abbreviate, or count characters. The renderer owns overflow, so length is never your problem. |
| **Delete all-`—` rows** | A row whose every cell is `—` is removed, not rendered. |

#### Language detection priority

1. Explicit task-level directive in the current turn ("请用中文", "answer in Spanish") — always wins.
2. The language of the buyer's most recent message.
3. The dominant language across earlier buyer messages.
4. Fall back to English only when nothing resolves.

### Recommendation principle

Lead with the recommendation when the data supports one. Be decisive: name the top pick and the primary reason in the first lines, then back it up with concrete evidence — specs, certifications, price, supplier credibility, and buyer-feedback signals from `product_reviews`, `reviewScore`, `deliveryRate`, `replyAvgTime`, `supplierTags`.

A typical pattern uses three medal picks (🏅 / 🥈 / 🥉) — the first gets a structured deep-dive with 2-4 bulleted evidence points, the second and third get one sentence each on their unique strength. This is **one** shape; if the comparison set is two products, or the buyer asked for a different framing, adapt freely.

### Dimensions you might compare (catalog, not mandatory)

When the buyer's priority is sharp, pick the subset that matters and skip dimensions that don't move the decision. **When needs are unclear, default to including rather than excluding** — pull from the catalog liberally and let the buyer narrow next turn. Group into tables, prose, or hybrid as fits.

- **Product overview snapshot**: image, supplier, price, MOQ — works well as a quick-glance table even when the rest is narrative.
- **User requirement match**: one row per explicit / implicit requirement, ✅ for full match, brief inline reason. Use the user's original wording (translated) as the row label — "CE Certification", not generic "Certifications".
- **Financial & logistics**: price, MOQ, delivery time, sample price, payment terms, sample / production lead time, export mode, nearest port. Tariff highlights only when §2.5 returned data.
- **Supplier capability**: in product compare, use supplier certifications and rating signals already returned by `fetch_product_info` as the default cross-context anchor. Only add deeper supplier fields from `fetch_supplier_info` when §2.2 explicitly triggered that optional MCP. Other fields — years in business, business type, reorder rate, main markets, customization (OEM/ODM), production capacity, factory size — stay optional, included when the buyer's priority touches them and data exists.
- **Core specs** (when products differ physically): material, capacity, weight, dimensions, color options.
- **Functional features** (when products serve different use cases or markets): insulation, use scenario, target market, product-level certifications.
- **Market trend / opportunity / profit potential**: only when the buyer explicitly asked AND `search` returned concrete signals.
- **Closing synthesis**: cross-cutting trade-offs, data gaps, caveats, next steps. Avoid duplicating tables.

### Visual rules (when you render a product comparison table in HTML config)

- **Block choice**: use `type: "table.comparison"` for the main product comparison matrix. Use products as entities/columns and decision dimensions as rows.
- **Column headers**: each product entity uses the original product title verbatim in `name`; include `url: productUrl` when available.
- **Recommended product**: the recommended product entity may carry `badge: "Recommended"`; do not add more than one recommendation badge in the same comparison table.
- **Row winner**: put `status: "best"` on the best value object for that row — **at most one per row**. A genuine tie, or no clear winner, means no status marker anywhere in that row; never split `best` across two cells to avoid choosing. Use best markers only for strengths, never negative status markers on partner/supplier-facing content.
- **Inline reason in cells**: keep value text short; add concise reason text only when the value is not self-explanatory.
- **Data cells**: plain values or link objects only. Product/title links live in entity headers; do not link every cell.
- **Comparison-table column cap**: at most 5 product columns. When comparing more, keep the three medal picks plus the two next-best-fit products; an overview snapshot table can still show all.
- **Ranking completeness**: when using `card.ranking` for product recommendations, include every product that remains in the main comparison set, in the same decision order. For a three-product comparison, render rank 1, rank 2, and rank 3 rather than only "Top pick" + "Alternative". If more than 5 products are compared, rank the same 5 products kept by the comparison-table column cap.
- **Body text**: refer to products by title as the grammatical subject (`Stainless Steel Vacuum Insulated Water Bottle stands out at $0.05/unit.`), never by pronoun or "this product". Prose may shorten a long title to its distinctive head words for readability; config fields never do.
- **Title card is mandatory**: `blocks[0]` is always a `hero` block carrying the localized report title and a `subtitle` naming the compared product scope. It is the report's only top-level heading — never skip it, and never add another H1 inside block content.
- **Recommendation card comes second**: `blocks[1]` is the `card.ranking` recommendation, immediately after the title card and before the specification comparison. The report leads with the decision, then shows the evidence.
- **Product images are mandatory**: the main product `table.comparison` starts with a product-main-image row. Every entity uses its returned image URL as `{"image": "<literal http(s) URL>", "alt": "<product title>"}`. Resolve images from `fetch_product_info` first and backfill from upstream search context when needed; do not omit the row or leave an empty image cell.

### Failure handling

- **`fetch_product_info` fails for a subset**: proceed with successful products after backfilling missing title, image, and price from upstream search context. A product without a verified main-image URL cannot enter the main specification matrix; ask the buyer to retry or re-select that product instead of emitting an image-less column.
- **`search` returns nothing relevant**: skip supplemental commentary rather than inventing third-party references.
- **All `fetch_product_info` calls fail**: do NOT produce a report — tell the buyer the fetch failed and ask to retry or re-select products.

### Example HTML config blocks (skeleton only — not a template)

> Buyer said "I need food-grade stainless steel, at least 500ml". Only the three fixed-position opening / matrix blocks are shown. The closing `list.action` + `text.source` pair is specified in Part 5 step 1, the conditional `profit.calculator` in [`profit-comparison.md`](references/profit-comparison.md) §5–§6, and field-level schema for every block in `block-config.md`. A buyer asking "which has the shortest lead time" would get a far shorter config — the shape follows the question.

```json
[
  {
    "type": "hero",
    "title": "Insulated bottle comparison",
    "subtitle": "3 food-grade stainless steel options · 500ml+"
  },
  {
    "type": "card.ranking",
    "header": { "title": "Product recommendation" },
    "items": [
      {
        "rank": 1,
        "badge": "Top pick",
        "title": "Stainless Steel Vacuum Insulated...",
        "url": "https://example.com/p1",
        "summary": "Matches the 500ml food-grade requirement with the strongest supplier credentials of the set.",
        "pros": ["304 food-grade stainless steel, 500ml capacity", "12 years, 4.8/5.0 score, FDA + LFGB + CE"]
      },
      {
        "rank": 2,
        "badge": "Budget pick",
        "title": "Portable Travel Mug...",
        "url": "https://example.com/p2",
        "summary": "Best unit cost at $2.10; strongest fit if budget outweighs premium insulation."
      }
    ]
  },
  {
    "type": "table.comparison",
    "header": { "title": "Requirement and specification comparison" },
    "primaryColumn": "User Requirement",
    "entities": [
      { "name": "Stainless Steel Vacuum...", "url": "https://example.com/p1", "badge": "Recommended" },
      { "name": "Portable Travel Mug...", "url": "https://example.com/p2" }
    ],
    "rows": [
      { "metric": "Product image", "values": [{ "image": "https://example.com/p1.jpg", "alt": "Stainless Steel Vacuum" }, { "image": "https://example.com/p2.jpg", "alt": "Portable Travel Mug" }] },
      { "metric": "Food-grade material", "values": [{ "text": "304 stainless", "status": "best" }, { "text": "201 commercial-grade" }] },
      { "metric": "≥500ml capacity", "values": [{ "text": "500ml exact", "status": "best" }, { "text": "350ml" }] }
    ]
  }
]
```

## §4b — Supplier Comparison Format

**No fixed template.** Structure the supplier comparison report to serve the buyer's decision — pick which dimensions to surface, what's a table vs prose, and how much to write, all driven by what the buyer prioritized. The shape follows the question.

### Read buyer priorities first

Combine signals from `## Compare — User history`, `<user_preference>`, `## Buyer Profile Reference` (when present), and the buyer's current query. Let those priorities decide:

- Whether to lead with reputation, conversion, certification, MOQ fit, scale, or compliance.
- Which dimensions become explicit table rows vs. supporting prose vs. omitted.
- Whether the report needs detailed buyer-review excerpts (compliance / quality concerns) or just an aggregate score (price-shopping buyer).
- How long / how broad the report is — tight on the named axis when the priority is sharp ("I only care about compliance"); broader (cover more catalog dimensions) when needs are unclear: only one or two requirements stated anywhere in the conversation, or the request is broad ("compare these suppliers")

If the conversation yields no priority at all (Part 4 → *Decide the comparison strategy from the conversation*), fall back to common B2B dimensions: cost, quality / compliance, delivery / capacity, company strength, service / communication. Don't invent fake requirements to fill slots.

### ⚠️ Hard rules — supplier-branch extras

§2.6 already binds currency, missing-data `—`, URL fabrication, supplier-safe tone, and working language; §2.1 binds the `fetch_supplier_info` envelope; Part 5 step 3 binds where the visible report goes. These are the additions for supplier comparisons, plus the one safety rule that is deliberately restated here:

| # | Rule |
|---|---|
| 1 | **URL slots must not mix.** `company_profile_url` → recommendation lines and comparison-table column headers only; `company_verified_report_link` → only the Verified Pro / Gold sentence and the Verified / tier table cell; `product_list_url` → catalog / SKU-rich prose only; `company_feedback_url` → review jump tags only. Absent field → plain text. |
| 2 | **One link = one specific supplier.** A sentence subject or anchor covering several suppliers ("their", "these suppliers", "他们") drops the link or splits into per-supplier links. Column headers may each carry one supplier link. |
| 3 | **Non-recommended suppliers get no prose link.** Exception: comparison-table entity headers and review jump tags. |
| 4 | **Supplier names are bolded in prose.** `**Acme Co., Ltd.**` alone for plain mentions; `**[Acme Co., Ltd.](company_profile_url)**` on the recommendation line and column headers. Closing synthesis / caveats: bold only, no link. |
| 5 | **Conversion = qualitative tiers only.** NEVER surface raw `effective_inquiry_ratio`, `pay_ratio`, or any internal ratio. Use `Excellent / Good / Average`, translated. Raw percentages may inform reasoning but never appear. |
| 6 | **No raw IDs in buyer output.** `supplierId`, `sellerId`, `taskId`, `detailId` are internal-only. Name every company; an ID may appear only inside a URL value (row 1 slots), never as visible text, a table cell, or a `text.source` line. |
| 7 | **Delete all-`—` rows.** A row whose every cell is `—` is removed, not rendered. |

### Recommendation logic

Apply weights in this order. **Buyer intent overrides generic platform signals when they conflict.**

1. **Buyer's own words** — `## Compare — User history`, `<user_preference>`, recent conversation. Drives MOQ, region, certification, budget, use case, timeline.
2. **Verified / trust signals** — `## Verified Supplier Info`, supplier document, badges. Prefer Verified Pro / Gold when reliability or compliance matters.
3. **Review quality** — `## Supplier review Info (Overall + Detailed)`: score, count, tags, delivery rate, reply time, category-relevant comments.
4. **Category conversion performance** — `## Supplier Conversion Reference`. Match the buyer's query to relevant categories first (Top 10 rows that semantically match); aggregate only the matched categories — don't dilute with unrelated ones. Translate internal ratios to qualitative tiers.
5. **Supplier document facts** — price, MOQ, certifications, capacity, years, factory scale, trade regions as tie-breakers and evidence.

#### Primary vs Alternative

- **Primary** — single best overall match after applying the weighting logic above.
- **Alternative** — exactly one other worthwhile supplier from a different positive angle, not a "loser". Skip when data isn't enough for a confident second pick.
- Use concrete angle titles like "Low-MOQ pick", "Certification-led pick", "Comprehensive recommendation". Avoid vague labels like "Another dimension recommendation".
- Back both picks with concrete facts (prices, MOQ, ratings, years, certifications). Don't pad with generic praise. If a source is missing, skip it instead.
- When you give the recommendation a heading, the Primary heading should include 🥇.
- If both picks are Verified Pro / Gold, each gets its own premium facts and one certification link.

### Data Sources Overview

Scan the primary `fetch_supplier_info` output and any Part 2 optional outputs that were intentionally triggered before writing. Incorporate those sources when they exist; ignore stale context that was not selected by the current branch / trigger rules.

| Data Type | Where to Find | Purpose |
|---|---|---|
| **Compare — User history** | `## Compare — User history` at the top of `fetch_supplier_info` in Compare flow | Highest-priority buyer intent |
| **Supplier Document** | Main markdown after `## Compare — User history` and before `## Supplier Conversion Reference` | Core supplier details |
| **Verified Supplier Info** | `## Verified Supplier Info` | Trust signals and `company_verified_report_link` |
| **Supplier Conversion Reference** | `## Supplier Conversion Reference` | Category conversion (qualitative tiers only in output) |
| **Supplier review Info (Overall)** | `## Supplier review Info (Overall)` | Aggregate review signals |
| **Supplier review Info (Detailed)** | `## Supplier review Info (Detailed)` | Standout review comments |
| **Supplier minisite navigation** | `## Supplier minisite navigation` | `product_list_url` for catalog prose, `company_feedback_url` for review jump tags |
| **Buyer Profile Reference** | `## Buyer Profile Reference` (if present) | Category-specific evaluation dimensions |
| **User Preferences** | `<user_preference>` and conversation history | Additional weighting for recommendations |
| **Lightweight verification** | §2.4 — `supplier_verification_recall` + `supplier_verification_detail` results | Registry (USCC, legal rep, capital, scope, address), risk records, certifications with validity. Silent skip when recall is empty. |

#### Verification enrichment (when §2.4 returned data)

The verification fields are an **independent data source**, not a fixed section. Decide where to surface them by reading the buyer's stated priorities — query text, `## Compare — User history`, conversation context — and only weave in what helps that buyer's decision.

Guidance, not a template:

- **Compliance / risk focus** → surface risk records as a neutral row in a strength comparison or as a closing caveat. Pair with supplier-safe tone — never co-locate a named supplier with a negative verdict.
- **Company stability / scale focus** → enrich strength rows with registry data (establishment date, registered capital, legal representative, USCC) and cite the same facts in recommendation rationale bullets.
- **Certification focus** → extend the certification row with validity / expiry; `company_certification_url` follows the URL slot rules (certification slot only, used at most once per supplier).
- **No clear focus from the buyer** → keep verification data on standby; add at most one or two rows that materially differentiate the suppliers. Don't pad with verification facts that don't move the decision.

Silent skip when a supplier's recall returned no candidates — never write "verification unavailable" in the buyer-facing report. Never expose internal verification IDs or tool names.

#### User Preferences & Buyer Profile Analysis

Preference signals may appear in `<user_preference>`, conversation history, `## Buyer Profile Reference`.

- If preference info is absent, empty, or irrelevant, skip silently.
- When both Buyer Profile Reference and User Preferences exist, use Buyer Profile Reference as the main dimension structure and User Preferences as additional weighting.
- Directly relevant preferences become evaluation criteria. Loosely relevant ones are mentioned only when supported by data. Not relevant — ignored.
- Loosely relevant preferences must not outweigh strong contradictory evidence from supplier documents, conversion, or reviews.

### Link discipline

Use HTML config link objects wherever the renderer supports structured links. Slot assignment is Hard Rule #1 above; on top of it:

- Avoid duplicate adjacent links to the same page, and don't repeat the storefront link in every rationale bullet -- once on the recommendation line is enough.
- Data cells stay plain text apart from the Verified / tier cell allowed by Hard Rule #1.
- Review jump tag format: `...fast packaging, stable quality ([review](company_feedback_url))`. Omit the tag when the URL is absent -- never fabricate.

### Dimensions you might cover (catalog, not mandatory)

When the buyer's priority is sharp, pick the subset that matters and skip dimensions that don't help the decision. **When needs are unclear, default to including rather than excluding** — pull from the catalog liberally and let the buyer narrow next turn. Group into tables, prose, or hybrid as fits the buyer's priorities. Don't dump the raw supplier document into a megatable — synthesize.

- **Buyer requirement match**: MOQ vs need, region / market, customization, budget, certification scope, product fit, sustainability. One row per explicit user requirement using the user's own wording (translated). For implicit / supplementary requirements, fall back to common B2B dimensions.
- **Supplier strength**: Verified tier, key certifications, years in business, factory scale / staff, main markets; registry data (establishment date, registered capital, USCC) when §2.4 returned it.
- **Conversion performance**: query-relevant inquiry traction, payment conversion, product depth in the matched category — qualitative tiers only.
- **Buyer reviews**: aggregate score / review count, delivery rate, reply signal as short signals; standout 1-3 detailed comments per supplier in prose with `[review](company_feedback_url)` jump tags. Skip offensive, abusive, or extreme comments.
- **Risk records (when §2.4 returned them)**: legal disputes, administrative penalties, abnormal-operation flags — neutral phrasing per the supplier-safe tone rule.
- **Closing synthesis**: where Primary wins vs Alternative, data gaps, neutral caveats. Keep links aligned with the URL slot rules; avoid CTAs.

### Visual rules (when you render a supplier comparison table in HTML config)

- **Block choice**: use `type: "table.comparison"` for the main supplier comparison matrix. Use supplier entities as columns and dimensions as rows.
- **Entities**: each supplier entity uses `name` and, when allowed by URL slot rules, `url: company_profile_url`. The single Primary supplier may carry `badge: "Recommended"`.
- **Rows**: keep one level of rows — no `↳` sub-rows. Each row is one decision dimension.
- **Primary / row winners**: put `status: "best"` on the best value object for that row — **at most one per row**. Ties or no clear winner stay as plain value objects, with no marker anywhere in that row.
- **Missing data**: use `—` per hard rule.
- **Verified / tier link**: only the Verified / tier value may carry `company_verified_report_link`; other data cells stay plain text.
- **Title card then recommendation**: `blocks[0]` is the `hero` title card (localized title plus a `subtitle` naming the supplier scope) and `blocks[1]` is the `card.ranking` recommendation. The comparison matrix and any evidence blocks follow that pair.
- **No visual noise**: no `🌟`, carousel markers, reference-ID columns, or raw IDs.

### Example HTML config blocks (one possible shape — not a template)

> Buyer said "I need a low-MOQ EU-shipping supplier for cotton apparel". This is one way the HTML config could be structured when MOQ and region drive the recommendation. A buyer asking "compare these three on certifications only" would get a much shorter config — a single `table.comparison` or a compact `card.ranking` block listing each supplier's cert scope and expiry / coverage gaps. The shape follows the question.

```json
[
  {
    "type": "hero",
    "title": "Cotton apparel supplier comparison",
    "subtitle": "2 shortlisted suppliers · low MOQ · EU shipping"
  },
  {
    "type": "card.ranking",
    "header": { "title": "Supplier recommendation" },
    "items": [
      {
        "rank": 1,
        "badge": "Low-MOQ pick",
        "title": "Acme Co., Ltd.",
        "url": "company_profile_url_A",
        "summary": "100 pcs MOQ matches the low-MOQ ask, ships EU directly, and has strong review and verification signals.",
        "pros": ["100 pcs MOQ vs. 500 pcs alternative", "EU direct shipping", "4.8 / 1.2k reviews, 98% delivery rate", "Verified Pro with ISO9001; 12 years in business"]
      },
      {
        "rank": 2,
        "badge": "Scale pick",
        "title": "Beta Co., Ltd.",
        "url": "company_profile_url_B",
        "summary": "Higher MOQ but stronger factory scale and tenure; main fit if the buyer raises volume later."
      }
    ]
  },
  {
    "type": "table.comparison",
    "header": { "title": "Supplier comparison by buyer priority" },
    "primaryColumn": "Dimension",
    "entities": [
      { "name": "Acme Co., Ltd.", "url": "company_profile_url_A", "badge": "Recommended" },
      { "name": "Beta Co., Ltd.", "url": "company_profile_url_B" }
    ],
    "rows": [
      { "metric": "MOQ vs need", "values": [{ "text": "100 pcs", "status": "best" }, { "text": "500 pcs" }] },
      { "metric": "Region / market", "values": [{ "text": "ships EU", "status": "best" }, { "text": "US-focused" }] },
      { "metric": "Verified tier", "values": [{ "text": "Verified Pro", "url": "company_verified_report_link_A", "status": "best" }, { "text": "Verified", "url": "company_verified_report_link_B" }] },
      { "metric": "Reviews", "values": [{ "text": "4.8 / 1.2k", "status": "best" }, { "text": "4.5 / 800" }] }
    ],
    "description": "Acme Co., Ltd. buyers praised quick reply and consistent quality ([review](company_feedback_url_A)). Caveat: Acme Co., Ltd.'s main market is EU/UK — confirm US capability before scaling there."
  }
]
```

### Failure handling

- `fetch_supplier_info` partial failure → proceed with available suppliers; note the gap once in closing.
- `## Supplier Conversion Reference` empty for a supplier → continue with other dimensions; don’t call attention to the absence.
- `## Supplier review Info` missing → skip review content; don’t fabricate scores.
- Verification (§2.4) recall empty for a supplier → silent skip per §2.4 confidentiality rule.

---

## Part 5 — Artifact persist (mandatory, all branches)

This step applies to **all** branches (Part 3 and Part 4) after the report content is composed.

**The persist flow is exactly three ordered steps: WRITE → GENERATE → PRESENT.** Execute them in that order, add no steps of your own, and **never re-read a file you just wrote** — the GENERATE step's render validation is this flow's only verification. Reading back the config you just wrote is forbidden, and so is pre-reading an earlier round's config (one narrow exception below).

**Preparation (before step 1 — not a persist step):**

- **Resolve the slug** — every artifact lives at `sourcing-plans/<english-product-noun>-<YYYYMMDD-HHMMSS>/`. The product noun is lowercase ASCII kebab-case, never transliterated and never carrying an action word. Inside SuperSourcing use `state.planDir` verbatim. Standalone, reuse the slug already visible in this conversation; mint a new one only when no plan folder exists yet, reusing one timestamp for the whole procurement — take it from the working directory's own name, which already encodes `YYYY-MM-DD-HH-MM-SS`, and fall back to `get_time` only when that yields nothing. Never glob the workspace to rediscover a slug — listing an **already-known** slug folder for the round number below is a different thing and is allowed.
- **Determine this round's number `<N>` from one directory listing**: list **`sourcing-plans/`** — the parent, never `sourcing-plans/<slug>/`. On a first comparison the slug folder does not exist yet, so listing it returns a `Directory not found` error rather than an empty result, and that wasted call also tends to freeze a half-chosen slug. Read the round off the parent listing: no `<slug>/` child, or no `sourcing-plans/` at all → **round 1**, no second call. `<slug>/` exists → list it once: no compare config → round 1; `compare.config.json` but no `compare.round-*.config.json` → round 2; otherwise the highest existing `compare.round-<N>` plus one. A listing is enough — never open a config to count rounds.
- **Do not read the previous round's config or HTML.** Each round is a standalone file (see step 1), so there is nothing to preserve or merge. The **only** exception: the buyer explicitly carries earlier-round entities into this comparison ("also include the one from last time", "把上次那个也加上") and those products / suppliers are not recoverable from the current context — then read that one earlier config once to recover the entity list, and still write a new file below.
- **Profit prefill — only in a profit-triggered round (§1.3)**: open [`profit-comparison.md`](references/profit-comparison.md) and follow it end to end (selling-price benchmark → prefill → block wiring). It owns every profit rule, including the ladder source, evidence gate, and the single allowed skip. Write `sourcing-plans/<slug>/profit-calculator.round-<N>.prefill.json` **before** step 1. Not profit-triggered → skip this entirely: no searches, no prefill, no profit block.

### Step 1 — WRITE this round's config

**Fill the skeleton — do not compose a config from scratch.** [`references/compare.skeleton.json`](references/compare.skeleton.json), already in hand from the §2.3 bundle, is the spine: copy it, replace every `«FILL: …»` token, delete every underscore-prefixed key, and write that. Its `_decided` section settles the questions that otherwise get re-derived every round — entity titles, row winners, entity badge, empty rows, missing values, language, ranking completeness — so treat those as answered and do not re-reason them.

**Write it once, in the `write` call.** Do not draft the config, the table rows, or the buyer reply in prose before writing — composing the report twice is the single largest cost in this flow. Decide the content, then emit it straight into the tool arguments.

**Schema prerequisite:** field-level schema for each block type comes from `html-report-generator`'s `block-config.md`, read completely — requested **by file name** in the §2.3 round-1 bundle, never by opening [`html-report-generator/SKILL.md`](../html-report-generator/SKILL.md) first. The skeleton fixes the report's *shape*; `block-config.md` defines each *field*; the rules below are this skill's **layout requirements on top of** both.

**One round = one new pair of files. Never edit, append to, or overwrite an earlier round's config or HTML.**

| Round | Config to write | HTML to generate |
|---|---|---|
| 1 | `sourcing-plans/<slug>/compare.config.json` | `sourcing-plans/<slug>/compare.html` |
| ≥ 2 | `sourcing-plans/<slug>/compare.round-<N>.config.json` | `sourcing-plans/<slug>/compare.round-<N>.html` |

Round 1 keeps the canonical filenames because plan flows and the SuperSourcing compare commit resolve `compare.html`. Under an active plan that uses the inquiry-comparison names, apply the same rule to `inquiry-compare.config.json` / `inquiry-compare.round-<N>.config.json`.

One write, containing the complete config for **this round only** — a self-contained report a buyer can read on its own, with no `Compare Round <N>` separator block and no carried-over history. Earlier rounds stay readable at their own paths.

- **Opening blocks**: every comparison HTML config starts with a `hero` title card as `blocks[0]` — localized report title plus a `subtitle` naming the compared scope. For product and supplier comparisons, `blocks[1]` is the `card.ranking` recommendation, so the report leads with the decision before any comparison matrix. Never omit the title card and never move the recommendation below the specification or profit blocks.
- **Profit block (conditional)**: only a profit-triggered round with a prefill carries `profit.calculator`, placed immediately after that round's main specification comparison block per [`profit-comparison.md`](references/profit-comparison.md) §5, which owns its position, `prefillPath`, and `description` rules. When the round has no prefill — including every round that was not profit-triggered — the config carries no `profit.calculator` block at all, and the specification block is followed directly by the narrative / risk / decision blocks.
- **Closing blocks**: every comparison HTML config ends with two fixed blocks. The penultimate block is `list.action` titled as localized follow-up / recommended next steps, carrying 1–4 report-specific next steps; whether the profit-refinement action belongs there is decided by [`profit-comparison.md`](references/profit-comparison.md) §6. The final block is `text.source` for report-level data sources, coverage, boundaries, and disclaimers, including the mandatory `Assumptions` entry when this round assumed any comparison input (Part 4 → *Decide the comparison strategy from the conversation*). Do not place any block after `text.source`.
- **Literal strings only**: never write shell artifacts (`$(`, `$ (`, `cat <<`, `EOF_IMG`, `EOF`, `![]($...)`) into config values, and keep currency literals intact (`$4.92`, never `.92`). Get this right at write time — there is no post-write scan to catch it.

Then go straight to step 2.

### Step 2 — GENERATE the HTML

Run it directly — `html-report-generate` is already registered, so never probe for it or search for how to invoke it:

```bash
html-report-generate --config <this round's config from step 1> --output <this round's HTML from step 1> --contracts <this skill's references/report-contracts.json>
```

The contracts file carries this skill's layout constraints (title card + recommendation opening, main-image row, profit block position, closing blocks) for render-time validation. **This command is the verification gate**: it performs strict schema/render validation, so no separate verify step exists. On `Render failed:`, fix the JSON config and rerun — fixing and rerunning stays inside step 2, and nothing reaches the buyer until it succeeds.

**Inquiry sync (same step, conditional)**: if `sourcing-plans/<slug>/inquiry-progress.config.json` exists with `blocks[0].state` — i.e. this comparison ran while an inquiry is in progress for the same slug — also refresh its **Recommendation** section so it reflects this compare result (recommended supplier + recommendation points). Per [`accio-inquiry/references/inquiry-progress-spec.md`](../accio-inquiry/references/inquiry-progress-spec.md): read that config's `blocks[0].state`, add `recommendation[]` from this compare, carry everything else over verbatim, keep `buyerUpdate: false` (compare sync must never create or mutate buyer requirements), then run `html-report-generate --config sourcing-plans/<slug>/inquiry-progress.config.json --output sourcing-plans/<slug>/inquiry-progress.html`. If that config does not exist (standalone compare, no active inquiry), skip.

### Step 3 — PRESENT

Pass only generated HTML to `present_files`: **this round's** HTML from step 1, plus `sourcing-plans/<slug>/inquiry-progress.html` when step 2 regenerated it. Never re-present an earlier round's HTML. Config JSON, profit prefill JSON, folders, and intermediate files are internal-use-only working files and are never presented.

`present_files` is the **last tool call of the whole flow**: emit the buyer-visible reply in the same turn whenever the runtime allows it, and never spend an extra turn re-checking anything afterwards. Outside active SuperSourcing the visible report lives in that reply, not in CoT / thinking; inside active SuperSourcing (`status == "executing"`) skip the reply entirely and return control once the artifact is persisted. Otherwise write a concise comparison handoff followed by the generated HTML report link. For product comparisons with viable ranked candidates, use this summary shape:

```markdown
**Conclusion:** {one-sentence decision: name the best overall option and the buyer priority it satisfies most strongly, such as budget, certification, material fit, MOQ, delivery, or supplier credibility}.

🏅 **Gold — {Product title / linked product title}**: {best overall fit and primary reason}. Evidence: {2-4 concise facts such as material/spec match, certification, price, MOQ, supplier credibility, review score, delivery signal}.

🥈 **Silver — {Product title / linked product title}**: {strongest unique advantage, the scenario where it may beat Gold, and one concrete supporting fact}.

🥉 **Bronze — {Product title / linked product title}**: {strongest unique advantage, tradeoff-aware fit, and one concrete supporting fact}.

**Why this order:** {1-2 sentences explaining the decisive tradeoff across the top options, using the buyer's stated priority first and platform/commercial signals second}.

Full comparison: {generated HTML report link}
```

Match the returned summary medal order to the generated report's recommendation order. When only two products are comparable, use 🏅 and 🥈 only and keep the conclusion / tradeoff lines. When more than five products are compared, summarize the three medal picks and keep the two next-best-fit products in the generated report per the column cap. Keep the response content decision-useful rather than replacing it with only a bare link. End with a localized link to the artifact just written — outside SuperSourcing only, and only after this turn's write actually succeeded (the write tool result is the proof). A path link without the file on disk is a hallucinated deliverable and a hard flow failure.

> Path conventions are inlined above, so [`sourcing-artifact-writer`](../sourcing-artifact-writer/SKILL.md) is only needed for a broader plan-folder question. Config shape and block schema stay owned by `html-report-generator` — the one direct read of its `block-config.md` in the §2.3 bundle covers it.

---

## Part 6 — Post-comparison follow-up chips (mandatory, standalone only)

After the comparison report is presented to the buyer (Part 5 step 3), generate localized follow-up chips as contiguous `<follow>...</follow>` tags — **the Follow-up Output Rules provide the default count; this section never sets a count** from the actual recommendations, unresolved risks, and commercial gaps, with no whitespace between tags. Follow the Follow-up Output Rules. For every product comparison, one chip covers profit in the variant defined by [`profit-comparison.md`](references/profit-comparison.md) §6 — a refinement ask in a profit-triggered round, an opt-in offer otherwise. Select the remaining useful actions from skills that can execute them.

**Scope guard:** this section does NOT apply when inside SuperSourcing execution flow (`SUPERSOURCING_STATE.json` exists with `status == "executing"`). In that case, the SuperSourcing Stage Review card owns the chip area — do not emit these chips.

English example only — adapt to the report and buyer's language; do not copy verbatim. The first chip below is the opt-in variant used when the profit module was out of scope; a profit-triggered round asks for the platform and destination country to refine the existing estimate instead:

```
<follow>Estimate profit for the recommended product: provide the sales platform and destination country</follow><follow>Start inquiries with recommended suppliers using AI auto-chat for price, MOQ, samples, and lead time</follow><follow>Order recommended product directly: prepare checkout and verify product, quantity, and shipping details</follow><follow>Verify recommended supplier: check credentials, fulfillment capability, and risk points</follow><follow>Clarify requirements: professional questions to help define your sourcing needs quickly</follow>
```
