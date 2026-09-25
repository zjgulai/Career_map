---
name: accio-product-supplier-sourcing
description: B2B product & supplier search with rich visual rendering
renderers:
  product_search:
    description: >-
      [CRITICAL] Mandatory workflow for Alibaba.com product & supplier search (find, search, source, listings, 找货). MUST be read before calling any search tool. Owns query optimization, intent selection, renderer registration, and output bans (no text summaries). Prevents skipped renderers. Product / supplier search results grid with images, pricing, and supplier info. Bundle auto-detects product vs supplier via rendererPayload.data shape.
    url: https://s.alicdn.com/@g/code/npm/@ali/buyer-agent-chatui-message/2.2.376/sourcing/index.html
    tool: product_supplier_search
---

# Sourcing Skill

Use this skill when the user wants to find products or suppliers on Alibaba.com and the built-in
`product_supplier_search` tool is relevant.

## Purpose

This skill has two jobs:

1. Use `product_supplier_search` correctly for product and supplier discovery.
2. Render search results with the `product_search` or `supplier_search` renderer when the tool returns `rendererPayload`.

## Tool Contract

This skill is designed for the current Phoenix tool schema only:

- Tool name: `product_supplier_search`
- Required parameters:
  - `intent_type`: `"product"` or `"supplier"`
  - `query`: string
  - `query_language`: ISO 639-1 language code of the query (e.g., `"en"`, `"zh"`, `"ja"`)
- Optional parameter:
  - `reference_image`: image URL string

Do not invent unsupported parameters such as `tasks`, `category`, sorting flags, extra platform switches, or a separate completion tool.

## When To Use

Use this skill when the user asks to:

- find products
- find suppliers, manufacturers, factories, or wholesalers
- search Alibaba.com listings by model, category, material, certification, MOQ, or price range
- source a specific product from an uploaded reference image when an actual image URL is available
- find products similar to a product in a supplied link or webpage, or suppliers offering similar products

Do not use this skill as the primary path when the user is mainly asking for:

- end-to-end product development from concept to suppliers, design to market, or supplier comparison for proposed concepts. Use `ai-product-designer` first; it owns concept creation and later supplier matching.
- quotation analysis without needing fresh search results
- inquiry generation
- negotiation scripts
- supplier due diligence on already-known companies without a new search request

## Execution Rules

### Query risk control

First classify the query without calling tools. Detection requires BOTH search intent AND concrete query/context evidence of one of these categories: pharmaceutical tablet presses/capsule machines, disposable vapes, human trafficking services, COVID-19, illicit drugs, clenbuterol, pornographic/obscene terms, medicines, illegal political content, or military/police products, including aliases in any language.

- **No category match or no search intent:** do NOT call `search_query_risk_control`; continue the normal workflow without a risk result. Never use this tool to classify a query or as a routine search prerequisite.
- **Category match with search intent:** call the tool below with the full constructed query, preserving risk-relevant meaning; never split or remove terms to evade checks. Await its result before any search, including Lens/web. A category match alone is not rejection.

For images, classify from buyer text and visible evidence; clarify unidentified targets. Repeat classification for new requests or changed queries, including retries, pivots, and fallbacks; repeat the tool call only when the trigger matches.

For the matching branch only, follow the agent's CLI JSON transport rules and replace `<query>`:

```bash
accio-mcp-cli call search_query_risk_control --json '{"fieldName_3":{"payload":{"content":"<query>"}}}'
```

When the tool is required, read only `payload.result`: `"true"`/`true` permits search; `"false"`/`false` rejects it. Never use string truthiness. On rejection, stop all searches and dependent work; show no new/cached results, cards, or follow-ups, and do not retry around the gate. Briefly explain in the buyer's language that the request failed the platform's search compliance check. Missing/unknown values or tool errors also stop search; explain that the check could not complete and suggest trying later. This conditional rule overrides search, retry, and output rules below.

### 1. Choose `intent_type` correctly

Use `intent_type: "product"` when the user wants products, listings, SKUs, models, or category matches.

Use `intent_type: "supplier"` when the user explicitly uses words like suppliers, manufacturers, factories, wholesalers, 工厂, 厂家, 批发, or asks for company-style sourcing results.

When the request is ambiguous (no clear product/supplier signal), default to `intent_type: "product"`.

### 2. Resolve product references, then search directly

If the user supplies a product link or webpage and asks for similar products or suppliers offering similar products, first process the reference as required in §4. This applies to both product and supplier search.

After processing any applicable reference, build the query and classify it per Query risk control. Search directly for non-matches; matching queries require a passing tool result first.

For clear product nouns, model names, or branded item names, prioritize
`product_supplier_search` before `web_search` or other research tools unless resolving the reference in §4 or the user explicitly asked for comparison, broader market research, or background verification.

### 3. Build the `query` conservatively

Rules for `query`:

- Preserve the user's real goal and explicit constraints.
- Keep brand names, model numbers, material names, standards, and certifications unchanged when
  already precise.
- Keep explicit filters such as MOQ, price range, supplier country, certifications, verified
  supplier, factory, manufacturer, ready to ship, and Trade Assurance.
- Keep full category phrases intact on the first search, such as `mobile phone accessories` or
  `kitchen appliances`.
- Do not add marketing filler such as `wholesale`, `trending`, `popular`, `fashion`,
  `hot-selling`, `bulk`, or other unstated adjectives.
- Ignore user sorting requests when constructing the query. Search for the right candidates first,
  then sort or compare in your answer if needed.
- Do not infer missing specs. Use the user's explicit attributes; for link-based similarity requests, also use product information supported by the webpage content or readable URL text, such as the product name, category, model, and identifying attributes. Preserve the user's constraints without treating unrelated page details as requirements. Build a descriptive query rather than using the webpage URL as the query.

### 4. Resolve product links and reference images

For a query that includes a product link or webpage and expresses an intent to find similar products or suppliers offering similar products, **attempt to extract the referenced product's main image URL before calling `product_supplier_search`**:

1. Read the supplied product page with `web_fetch` or an available page-reading tool; if the webpage content is already provided, inspect that content. Extract the main image of the referenced product, not a site logo, banner, or another product's image.
2. Resolve any relative image URL against the product page URL and use the resulting usable image URL as `reference_image` for the search. A product detail page URL is not an image URL. Never invent an image URL.
3. If the product main image URL cannot be obtained, extract product information from the available webpage content or the link's readable path/query text. Combine that information with the user's stated requirements to build the search `query`, omit `reference_image`, and continue with `product_supplier_search`. Do not pause solely because the main image is unavailable, and do not invent product details from opaque IDs or tracking parameters.

A link without a product-similarity intent does not by itself trigger this reference-processing workflow.

Include `reference_image` only when the conversation actually contains a usable image URL from:

- a user-uploaded image
- the referenced product's main image extracted from the supplied link or webpage
- a previous tool result that returned an image URL
- other concrete image context already present in the session

Do not set `reference_image` just because the user mentioned “image” or “picture” in text.

### 5. Process multi-demand queries as a single call

Do not split a user's multi-attribute request into separate subset queries. Example: "red dress, long sleeve, v-neck" must be one query, not three (one per attribute). Pass the full requirement set in a single call.

### 6. Stop refining once results are sufficient

Do not keep tweaking the query to chase marginally more results when the current results already satisfy the core product category and key requirements. Sufficiency thresholds are defined in the Post-Search Decision Protocol below.

## Post-Search Decision Protocol

After every search call, evaluate result quality and follow the matching protocol. References to "call X" mean calling `product_supplier_search` with the specified `intent_type`. Classify each new query before deciding whether risk detection is required.

### Post-Product Search (`intent_type: "product"`)

#### A. Sufficient match — stop (≥ 10 perfect results)

The current product availability satisfies the user's requirements. Stop searching; the renderer presents results to the user. Append the follow-up.

#### B. Strategic Pivot — product → supplier (< 10 perfect results, OR any required attribute matches < 25%)

The market lacks ready-made stock for the user's spec; pivot to manufacturers with the matching customization capability.

Reasoning steps:
1. **Identify bottlenecks.** Pinpoint the specific attributes causing the low match rate (e.g., a rare material, unique color, complex pattern).
2. **Translate to capabilities.** Infer the supplier customization capability that fulfils each bottleneck. Examples: "black and white gradient" → `color customization` or `digital printing`; uncommon composition → `material customization`; non-standard size → `size customization`. If no specific customization tag fits the bottleneck (e.g., rare certifications, special packaging, short lead time), skip translation and go straight to OEM generalization in Post-Supplier B.
3. **Reformulate the query.** Two actions, **both mandatory**:
   - **Remove** every bottleneck keyword from the query (the original material/color/size/pattern words that caused the low match rate).
   - **Append** the corresponding customization capability tag(s).

   Keep the product noun/category and all non-bottleneck constraints (MOQ, price range, country, certifications) intact.

   This step **overrides** the conservative/verbatim rule in §3 for **both** actions — both stripping the bottleneck keywords and adding the customization tag are required. Retaining the original bottleneck keywords alongside the customization tag is **incorrect**: searching `mushroom leather wallet, material customization` defeats the pivot, because suppliers indexed under the rare material are exactly the ones the product search already failed to find.
4. **Re-call** `product_supplier_search` with `intent_type: "supplier"` and the reformulated query.
5. **Explain the pivot to the user** per the "Pivot transparency" rule in Output Rules — one short sentence stating the bottleneck and why suppliers are now being shown instead of products.

Examples:

Rich-constraint query (multiple non-bottleneck filters remain):
- Failed product query: `women dress, size range XS–XL, MOQ ≤300 pcs, 100% cotton, black and white gradient`
- Bottlenecks: `100% cotton`, `black and white gradient` (both < 25% match)
- Pivot call: `intent_type: "supplier"`, query `women dress, size range XS–XL, MOQ ≤300 pcs, material customization, color customization`

Sparse-constraint query (only the product noun remains after stripping — this is expected, do not pad):
- Failed product query: `mushroom leather bifold wallet`
- Bottleneck: `mushroom leather` (rare material)
- ✅ Correct pivot: `intent_type: "supplier"`, query `bifold wallet, material customization`
- ❌ Wrong pivot: `intent_type: "supplier"`, query `mushroom leather bifold wallet, material customization` (bottleneck keywords were not stripped)

#### C. Semantic retry — one attempt only

If the result looks weak because of phrasing rather than hard attribute constraints, retry **once** with synonyms or rephrased wording while strictly preserving the original meaning. Do not split the requirement across calls. If the second attempt still yields weak results, immediately apply the Strategic Pivot (B). Never retry more than once.

### Post-Supplier Search (`intent_type: "supplier"`)

**Hard rule (within the current sourcing loop only):** once you pivot into `intent_type: "supplier"` for a given user request, do NOT switch back to `intent_type: "product"` in the same loop — finalize using supplier-side logic only. The rule resets on a new user turn: if the user explicitly asks for products in a follow-up message, treat it as a fresh sourcing task and re-evaluate from §1.

#### A. Strong supplier match — stop (≥ 5 suppliers matching category, MOQ, and required capabilities)

The sourcing task is fulfilled. Stop searching.

#### B. OEM generalization (< 5 suppliers, OR any specific capability tag matches < 16%)

The requirements are too specific for standard customization tags; only broad-spectrum OEM providers can fulfill them.

Reasoning steps:
1. **Evaluate attributes.** Identify which specific customization tags are underperforming (< 16% match) — `material customization`, `color customization`, etc.
2. **Generalize to OEM.** Replace the underperforming specific tags with the universal term `OEM`. Keep category, MOQ, and price.
3. **Re-call** `product_supplier_search` with `intent_type: "supplier"` and the OEM query.
4. **Explain the generalization to the user** per the "Pivot transparency" rule in Output Rules — one short sentence noting that specific-capability suppliers were scarce, so broader OEM manufacturers are shown.

Example:
- Initial supplier query: `women dress, price range 10–20$, material customization, color customization` — both customization tags match at 12% (< 16%)
- Revised call: `intent_type: "supplier"`, query `women dress, price range 10–20$, OEM`

#### C. Last-resort category fallback (OEM still < 5 results)

If the OEM-generalized search still yields fewer than 5 suppliers, drop the OEM tag and all remaining filters, then re-call with the bare product category / product noun only. This is the broadest possible search and serves as the final attempt before reporting back.

Example:
- OEM query failed: `women dress, moq < 10, OEM` → still < 5 suppliers
- Final fallback: `intent_type: "supplier"`, query `women dress`

After this fallback, **explain to the user** per the "Pivot transparency" rule in Output Rules — one short sentence noting that the full spec matched too few suppliers, so the broader category supplier pool is shown for them to narrow down via inquiry.

If even the category-only search returns nothing useful, stop and report directly per the Output Rules — do not retry further.

## Output Rules

- When `product_supplier_search` returns results, the renderer displays them to the buyer. Do NOT output any product or supplier recommendation text, highlights, descriptions, or summaries. Your follow-up text is limited to two pieces, **in this order**:
  1. **Pivot transparency** (conditional) — see rule below.
  2. Follow-up suggestions as contiguous `<follow>...</follow>` chips with no whitespace between tags (governed by the Follow-up Output Rules). Note: `<follow>` is the **required** chip tag and is unrelated to the `:::slot[...]` result-card directive — never suppress the chips.
- **Pivot transparency.** Whenever the result type or scope shown to the user differs from what they explicitly asked for — i.e., any pivot/generalization/fallback path was taken in this turn (Post-Product B product→supplier pivot, Post-Supplier B OEM generalization, or Post-Supplier C category-only fallback) — prepend **one short sentence** in the user's conversation language explaining (a) why the original search did not yield enough matches and (b) what is being shown instead. Stay generic: state the bottleneck attribute and the rationale; do NOT name or describe specific items from the result set. Skip this sentence when no pivot occurred (direct sufficient-match case).
  - Example after Post-Product B (EN): "I didn't find enough ready-made listings matching your [bottleneck attribute], so I'm showing manufacturers that can customize this to your spec."
  - Example after Post-Supplier B (ZH): "符合 [属性] 的现成供应商较少，已切换为可按需定制的 OEM 工厂。"
  - Example after Post-Supplier C (EN): "Very few suppliers matched your full spec, so I'm showing the broader [category] supplier pool — you can narrow down via inquiry."
- Do not introduce, describe, or name specific products or suppliers from the search results in your text response.
- Use structured comparison tables only when the user explicitly asks to compare options. Do not default to a table just because search results contain multiple items.
- When presenting product or supplier candidates in a Markdown table, prefer showing each item's name (product title or supplier name) as a clickable link to its detail/company page whenever the link is available.
- If nothing useful is found, say so directly and suggest the smallest useful refinement to the query.

## Renderer Notes

A single renderer bundle is registered under both `product_search` and `supplier_search` keys at the same URL. The bundle auto-routes by `rendererPayload.data` shape:

- Product results render via the `product_search` renderer key.
- Supplier results render via the `supplier_search` renderer key.

You don't pick the renderer manually — the tool sets the correct key based on `intent_type`.
