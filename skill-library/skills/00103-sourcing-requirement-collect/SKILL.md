---
name: sourcing-requirement-collect
description: >
  Unified requirement collection skill for Accio Alibaba.com B2B buyers.
  Two context modes: (1) SS context — entered via supersourcing SKILL.md dispatch (status=collecting) or Direct Entry handoff,
  collects core fields + expanded attributes, writes to SUPERSOURCING_STATE.json, then returns.
  (2) Standalone context — independent requirement collection + enriched search flow,
  uses its own REQUIREMENT_COLLECT_STATE.json, shows results with followup chips.
  Trigger when buyer intent is to clarify, refine, add details to, or define sourcing requirements or product specifications,
  including any semantically equivalent follow-up chip regardless of wording; or when status is rc-collecting / rc-searched,
  or SuperSourcing status is collecting. Exclude explicit full-auto or auto-run sourcing intent; SuperSourcing owns it.
---

# Sourcing Requirement Collect — Dual-context requirement collection

> **Key constraints**
>
> 1. **No plan / task creation in standalone mode.** This skill does NOT create plan folders, `task_create`, `task_update`, or `progress.md`; SuperSourcing owns them in SS mode.
> 2. **Context-specific state file.** SS mode writes to `SUPERSOURCING_STATE.json`. Standalone mode writes only to `REQUIREMENT_COLLECT_STATE.json`.
> 3. **Sequential `ask_user`.** Never send two `ask_user` calls in one turn.
> 4. **No budget collection.** Budget is not in the schema.
> 5. **Match buyer language.** Default English when unclear.
> 6. **Visible output.** All user-facing messages (requirement forms, search results, summary) must be rendered as visible replies, not in thinking/CoT.
> 7. **No supersourcing sub-file reads.** Standalone mode never reads SuperSourcing files. In SS mode, persist collection and return to the calling Adapter.
> 8. **Trusted state plumbing only.** Use `supersourcing-state read/path/write` and `sourcing-requirement-lookup`; never native Write/Edit/patch state files. SS writes follow the SuperSourcing State write rule. Before either transport, compact JSON and encode raw ASCII apostrophes as `\u0027`. Windows PowerShell always uses the file channel below for RC; macOS/Linux may use compact inline JSON. A successful state command needs no read-back. Do not call `bash`, `sh`, `python3`, heredocs, `cat`, or `accio-mcp-cli` directly.

Windows PowerShell RC write:
```powershell
$payload = '<complete compact RC JSON object>'
Set-Content -Path "$env:TEMP\requirement_collect_state.json" -Value $payload -Encoding UTF8
supersourcing-state write --kind rc --json-file "$env:TEMP\requirement_collect_state.json"
```

macOS/Linux RC write:
```text
supersourcing-state write --kind rc --json '<complete compact RC JSON object>'
```

---

## Dispatch — Dual-context detection

When this skill is loaded, determine the operating context with:

```text
supersourcing-state read --kind both
```

**Branch logic (evaluate in order):**

| # | Condition | Context | Action |
|---|-----------|---------|--------|
| 1 | SS state exists AND `status == "collecting"` | **SS Context** | Follow §SS Context Mode below |
| 2 | RC state exists AND `status == "rc-collecting"` or `"rc-searched"` | **Standalone Context** (re-entry) | Resume at the appropriate standalone step |
| 3 | Neither condition met | **Standalone Context** (fresh entry) | Initialize → Step 1 |

---

## SS Context Mode (collect-only)

Entered when `SUPERSOURCING_STATE.json` exists with `status: "collecting"`. Called by supersourcing SKILL.md dispatch table (collecting status) or by its Direct Entry handoff (`start` returned `next: collect`).

Read `requirements` from `SUPERSOURCING_STATE.json`. If all 4 core fields are non-null AND `collectionStep == "complete"`, do not ask or write again; return to the calling Adapter.

Otherwise, follow **§Shared: Collection procedure** below. When automatic continuation is explicit, all core fields are known, and refinement is not requested, reuse evidence-backed upstream choices and leave optional attributes unset instead of asking. Deduplicate identical lookup or web-evidence requests and parallelize only distinct inputs.

Persist all collected fields with one `supersourcing-state patch --kind ss`: update `requirements`, `categoryCache`, `productFamily`, `collectionStep: "complete"`, and `lastUpdated` together; keep `status: "collecting"`. A successful patch needs no read-back. Return to the calling Adapter, which owns artifact commit and continuation.

---

## Standalone Context Mode

### Step 1 — Initialize state

Extract sourcing fields from the **entire conversation history** — every buyer message plus any requirement elements the buyer already confirmed in earlier turns (not just the message that triggered the gate chip). When the same field is stated multiple times, the latest statement wins:

- `productName`: product noun/category
- `destinationCountry`: ISO-3166 alpha-2
- `quantity`: number
- `tradablePreference`: `"yes"` | `"no"` | `null`
- `productAttributes`: specs the buyer explicitly stated or confirmed (e.g. color, material, size, capacity), stored as `{attrName, attrValue}` — these count as known and must not be asked again

**Procurement preference guard:** keep `tradablePreference` only when the conversation has an explicit path signal:
- Keep `"yes"` only for: `ready to ship`, `RTS`, `tradable`, `buy directly`, `direct order`, `place order now`, `no communication needed`, or equivalent in any language (e.g. in-stock, buy directly).
- Keep `"no"` for ANY expressed inquiry willingness, explicit or implicit, in any language — e.g. `RFQ`, `inquiry`, `send inquiry`, `ask quotes`, `ask/compare prices`, `contact suppliers`, `talk/communicate/negotiate with suppliers`, `find suppliers`, `request samples`, `custom/OEM/ODM`. Once inquiry willingness appears anywhere in the conversation, `tradablePreference` is settled as `"no"` and the procurement-method question MUST NOT be asked.
- Generic purchase wording (`purchase`, `buy`, `source`, `fully automated purchase`) → reset to `null`.

**Supplier-intent forces `tradablePreference = "no"`.** If user message indicates supplier search (find suppliers / recommend suppliers / supplier search / compare suppliers, or equivalent in any language), always set `tradablePreference = "no"`.

Initialize `REQUIREMENT_COLLECT_STATE.json` with one complete `supersourcing-state write --kind rc`:

```json
{
  "status": "rc-collecting",
  "requirements": {
    "productName": "<extracted or null>",
    "destinationCountry": "<extracted or null>",
    "quantity": "<extracted or null>",
    "tradablePreference": "<extracted or null>",
    "productAttributes": "<extracted [{attrName, attrValue}] list, or []>"
  },
  "pendingAttrBatchIndex": 0,
  "productFamily": null,
  "categoryCache": {
    "cateId": null,
    "cateName": null
  },
  "handoff": null,
  "lastUpdated": "<ISO timestamp>"
}
```

Then immediately proceed to Step 2 in the same turn.

---

### Step 2 — Collect missing fields

Follow **§Shared: Collection procedure** below. Persist all results with one complete `supersourcing-state write --kind rc`.

- If all 4 core fields are already non-null at entry: the shared procedure skips core field collection, goes directly to attribute collection.
- After all fields collected, derive `productFamily` from `productName` (coarse category). Write to state. Proceed to Step 3.

---

### Step 3 — Enriched search

Build the search query from collected requirements:

1. Start with `productName` as base query.
2. Append each `productAttributes[].attrValue` (space-separated, dedup against productName).
3. If `tradablePreference == "yes"`, append `ready to ship`.

Example: productName=`stainless steel coffee mug 350ml`, attributes=[{attrName: "Color", attrValue: "black"}], tradablePreference=yes → query = `stainless steel coffee mug 350ml black ready to ship`

Call `accio-product-supplier-sourcing` with the enriched query. Set `isTradable: "Y"` when `tradablePreference == "yes"`, `"unknown"` otherwise.

**Post-search coarse-rank**: after search results render, read `skills/coarse-rank/SKILL.md` and run its standalone-context ranking procedure on the search results. Coarse-rank outputs a visible ranked shortlist table. Do not emit coarse-rank's own standalone follow-up chips — RC Step 4 owns the chip area.

With the same complete RC state write that marks `status: "rc-searched"`, preserve the coarse-rank output as `handoff.topCandidates` and `handoff.coarseRank` using the SS-context shapes defined in `coarse-rank`; keep every existing RC field and update `lastUpdated`. This snapshot is only for an immediate auto-run handoff and must not trigger another search or ranking pass. If no usable candidate was selected, set `handoff: null`.

Proceed to Step 4 in the same turn.

---

### Step 4 — Post-search: show results + followup chips

> ⚠️ **VISIBLE OUTPUT.** Search cards from `accio-product-supplier-sourcing` MUST remain visible. Do not hide them in thinking/CoT. Render summary and intro templates VERBATIM — only fill `<placeholder>` values; do not rephrase.

**Verbatim — no preamble.** After the search results, output the following summary EXACTLY starting from the `##` heading (only fill `<placeholder>` values; in buyer's language):

```text
## 🔍 Requirement Collection Complete · Search Results

> 🎯 **Sourcing need**: <productName> · Ship to <destinationCountry> · Quantity <quantity> · Method <Buy directly / Inquire first>
> 📋 **Product attributes**: <comma-separated "attrName: attrValue" or "None">

👉 Choose any of the options below to proceed; or send your own modified request if you have more specific requirements.
```

Then generate 2–5 localized follow-up chips as contiguous `<follow>...</follow>` tags from the collected requirements and actual search results, with no whitespace between tags. Follow the Follow-up Output Rules. Select 2–5 useful actions that the available skills can execute. The model chooses the actions and order; the example is not a fixed menu.

English example only — adapt to the results and buyer's language; do not copy verbatim:

```
<follow>Compare the top 3 suppliers: identify the best fit and provide recommendations</follow><follow>Send inquiries to the top 3 suppliers: enable AI auto-chat to follow up on price, MOQ, and lead time</follow><follow>Verify supplier #1: review credentials, fulfillment capability, and potential risks</follow><follow>Auto-run sourcing: clarify requirements, research, search, compare, and verify suppliers to find the best match</follow>
```

**Re-entry handling:** when `status == "rc-searched"` and the buyer sends a new message:

| Buyer reply | Action |
|---|---|
| "Auto-run sourcing" / explicit full-auto intent | Fall through to `supersourcing`; preserve the completed RC `handoff` and do not collect, search, or rank again |
| "Compare" / compare intent | Fall through to normal skill routing (write-compare-report handles) |
| "Send inquiries" / inquiry intent | Fall through to normal skill routing (accio-inquiry handles) |
| "Verify supplier" / verification intent | Fall through to normal skill routing (supplier-verification-report handles) |
| "Place an order" / order intent | Fall through to normal skill routing (buyer-trade-intent handles) |
| "Adjust" / "Re-search" / concrete changes | Apply adjustments to `requirements`, clear `handoff`, set `status: "rc-collecting"`, re-run from Step 2 (or Step 3 if only attributes changed) |
| Off-topic / unrelated | Fall through to normal skill routing |

---

## Shared: Collection procedure

Used by BOTH SS context mode and standalone context mode. Caller specifies which state file to write.

1. Check which of the 4 core fields are still `null` (`productName`, `destinationCountry`, `quantity`, `tradablePreference`).
   - **Known-field guard:** before building any card, re-scan the entire conversation history. Any core field or attribute the buyer already stated or confirmed anywhere in the conversation counts as known — fill it into state and never ask it again. Only ask fields that remain truly unknown.
   - All 4 non-null → skip to step 4 (attribute collection).
   - Any missing → step 2.
2. **Category prediction** (as soon as `productName` is known): translate `productName` to English product noun, then call the managed lookup:

   ```text
   sourcing-requirement-lookup --mode category-predict --query "<english_product_name>"
   ```

   Cache the returned `cate_list`. This result is used in step 3 (category refinement) and step 4 (attribute retrieval). If prediction fails or returns empty, continue without a category question and fall back to product-name attribute lookup in step 4.

3. **Core field collection (with optional category refinement)**:
   - Output the core field form intro (§Shared: ask_user rules → Core field form).
   - Build `ask_user` card with questions for missing core fields.
   - **Category refinement guard — append a category question when ALL three conditions are met:**
     - ① The number of missing core fields (questions already in the card) is **< 4**
     - ② `productName` is a broad first-level category or industry term (e.g. "dress", "electronics", "furniture") rather than a specific product (e.g. "stainless steel vacuum insulated water bottle 500ml")
     - ③ `query_cate_prediction` returned **≥ 2** leaf categories in `cate_list` that are relevant to the query
   - If all three conditions met: append a category refinement question at the **end** of the card. Options = the top 1-3 relevant `cate_name` values from `cate_list`, translated to the buyer's language (do NOT expose `cate_id`, do NOT show original English alongside translation) + "Skip" as last option. See §Core field form for template.
   - If conditions not met: skip the category question; AI selects the single most relevant leaf category from `cate_list` and caches it directly.
   - Send ONE `ask_user`. Wait for reply. Parse core fields and category selection. Write to state.
   - **Category result caching:**
     - User selected a `cate_name` → cache corresponding `cateId` + `cateName` to `categoryCache`.
     - User selected "Skip" → AI picks the leaf category most relevant to the user's original query, cache its `cateId` + `cateName`.
     - User provided free-text input → AI picks the leaf category most relevant to the user's input, cache its `cateId` + `cateName`.
   - **Do NOT combine core fields with attribute questions in the same card — they are always separate `ask_user` calls.**
4. **Attribute collection** (separate `ask_user` from step 3): use cached `categoryCache.cateId` with `sourcing-requirement-lookup --mode category-attrs`; if no usable category is cached, use the legacy `sourcing-requirement-lookup --query` fallback. Follow §Shared: Attribute collection rules. Send attribute `ask_user` cards. Wait for reply. Merge selected values into known `requirements.productAttributes` by semantic attribute name.
5. Derive `productFamily` from `productName` (coarse category). Write all collected state changes once in the active context. **Collection complete.**

---

## Shared: Attribute collection rules

These rules apply to BOTH SS context mode and standalone context mode.

### Call `cate_attribute_retrieval` (using cached cateId from §Shared: Collection procedure step 3)

```text
sourcing-requirement-lookup --mode category-attrs --cate-id "<categoryCache.cateId>"
```

Rules:
- `cate_id` comes from `categoryCache.cateId` populated during core field collection (§Shared: Collection procedure step 3).
- Do NOT pass product name as query — this API is category-based, not keyword-based.
- If `categoryCache.cateId` is missing or the lookup fails/returns empty, fall back to:

  ```text
  sourcing-requirement-lookup --query "<english_product_name>"
  ```

Cache the result (`attr_values` + `blockers`). If the call fails or returns empty, keep known `productAttributes` (or `[]` when none exist) and skip attribute collection.

### Web research for attribute context (MANDATORY — after cate_attribute_retrieval returns)

Run the two English searches in one parallel batch, then fetch both first non-ad results in one parallel batch when available. Cache insights internally. Skip a fetch only when its search has 0 results; if one fetch fails, continue with the other.

Queries:
- `Q1 = "<english_product_name> buying guide <attr keys>"`
- `Q2 = "how to choose <english_product_noun> specifications"`

Extract only three internal signals for later rendering: important attributes, recommended option values, and short industry explanations. If both searches/fetches fail, use `cate_attribute_retrieval` / fallback lookup order + general product knowledge.

### Attribute selection + batching rules

1. **Unified list:** merge `attr_values` and `blockers` into one flat list (no distinction between the two).
2. **Pre-filter and classify:** drop known attributes (including specs the buyer already stated or confirmed anywhere in the conversation history), customization-related (`Custom`/`OEM`/`ODM`), and core-field overlaps (e.g. "Quantity/MOQ" when quantity is filled, "Delivery Address/Destination" when `destinationCountry` is filled). Treat a question as **universal** when its answer records a buyer fact or procurement constraint instead of optimizing a product parameter; this includes destination, quantity/MOQ, procurement method, category confirmation, and supplier target. Drop repeated universal questions from the attribute card; if a universal question is still required elsewhere, render it neutrally under rule 6.
3. **Dedup by meaning** — remove semantically duplicated attributes.
4. **Show at most 4 remaining attributes**, prioritized by buyer sourcing relevance and informed by web research insights. First extract only an explicit usage scene from the full conversation (industry/use case, equipment or process, operating environment, or performance target; latest statement wins). With an explicit scene, prioritize product parameters whose best value changes for that scene. Without one, show only mainstream, broadly applicable product parameters and never invent a scene. When web research is unavailable, fall back to lookup return order and general product knowledge. Drop the rest.
5. **Batch size: max 4 attributes per `ask_user` card** (tool limit). With a cap of 4, this is always 1 batch.
6. **Recommendation is product-parameter-only.** A product-parameter question may include `"recommended": <zero-based option index>` pointing to an existing non-Skip option. Choose it from the explicit usage scene plus web research; without a scene, choose only a defensible mainstream value from category data, web research, and general product knowledge. A universal question MUST omit the `recommended` field entirely — never emit `null`, `0`, or another placeholder — and its labels/descriptions must remain neutral without recommendation wording or markers.
7. **Recommendation reason in the option description.** For the recommended product-parameter option, use one concise, buyer-friendly sentence explaining why that value fits the explicit scene; without a scene, explain its mainstream applicability, compatibility, or supply availability. Use web research insights when available and general product knowledge as fallback. Keep all non-recommended option descriptions neutral and focused on meaning or trade-offs.
8. **Each attribute question MUST have 2-4 options total.** Because "Skip" consumes one option slot, when adding "Skip", use at most 3 concrete values.
9. For attrs with returned values (`attr_values`): keep the top 1-3 values by buyer relevance, translate them to the buyer's language, then append "Skip" as the last option. If `attr_values` returns more than 3 values, drop the rest. The label MUST contain ONLY the translated text in the buyer's language — no parenthetical original, no slash-separated bilingual, no annotation. Prohibited label examples: "Cotton (cotton)", "cotton (Cotton)". Correct label: the translated value alone.
10. For blocker-only attrs: generate 1-3 common values from the blocker name and product context + "Skip".
11. **Header ≤12 chars**, format: `<attr_name>`. Attr name in buyer's language (e.g. "Color", "Size", "Material").
12. Do NOT add `Other` / `Manual input` as an explicit option.

### Attribute `ask_user` structure (render in buyer's language)

```json
{
  "mode": "form",
  "questions": [
    {
      "question": "<localized: what this attribute controls + why it matters for this product sourcing>?",
      "header": "<short attr name>",
      "options": [
        { "label": "<value in buyer's language ONLY, e.g. Cotton>", "description": "<neutral industry meaning or trade-off of this value>" },
        { "label": "<value in buyer's language ONLY, e.g. Polyester>", "description": "<neutral industry meaning or trade-off of this value>" },
        { "label": "<value in buyer's language ONLY, e.g. Spandex>", "description": "<neutral industry meaning or trade-off of this value>" },
        { "label": "Skip", "description": "<localized: no specific requirement for this attribute>" }
      ],
      "multiSelect": false
    }
  ]
}
```

---

## Shared: ask_user rules + parsing rules

### `ask_user` rules

- **Sequential `ask_user` only.** Never send two `ask_user` calls in the same turn.
- **Core fields and attributes are separate cards.** Never mix core-field questions (Dest/Qty/Buy) and attribute questions in the same `ask_user` card. Core fields go in one card (step 2), attributes go in a separate card (step 3). Even if only 1 core field is missing, it gets its own card — the attribute card always has the full 4-slot budget.
- **Every question must have 2-4 options total; never emit 5 options.** For dynamic questions that include "Skip", use 1-3 non-skip options.
- **Every `ask_user` option MUST include a non-empty `description`.** Do not use `""`, omit the field, or rely on label-only options.
- **Keep `ask_user.header` ≤12 characters**: format is `<short_name>`. Short name in buyer's language (e.g. "Dest", "Qty", "Buy", "Color", "Size", "Material").
- **Localize** all visible text to the buyer's language. Default English when unclear.
- **Strict single-language rule.** Every user-visible field (`question`, `header`, `label`, `description`) MUST be in one language only — the buyer's language. Prohibited patterns: mixing languages in a single field (e.g. "Cotton（cotton）" or "cotton (Cotton)"). When APIs return English values (e.g. `cate_name`, `attr_values`), translate them to the buyer's language — never show the original English alongside or in parentheses.
- **No `Other` / `Manual input` option** — the platform provides its own free-text affordance.
- **Recommend product parameters only.** A product-parameter attribute question may include `"recommended": <zero-based option index>` only when the choice is supported by the buyer's explicit usage scene or a defensible mainstream value from category data, web research, or general product knowledge. The index must point to an existing non-Skip option. Universal buyer-fact or procurement-constraint questions — including core fields, category confirmation, and supplier target — MUST omit `recommended` entirely; never emit `null`, `0`, or another placeholder.
- **No label-embedded recommendation markers.** Do not prepend `(Recommended)` or any marker text to option labels.

### Core field form

**Verbatim — no preamble.** Output the following intro EXACTLY before the `ask_user`, starting from the `##` heading (only fill placeholders; translate all fixed text to the buyer's language — structure and order stay unchanged):

```text
## 🔍 Requirement Collection · Supplement Sourcing Info

<If productName known>Product confirmed: `{productName}`, a few key details needed:</If>
<If productName missing>Please provide the following sourcing information:</If>
```

Only include questions for fields that are still `null`. If category refinement conditions are met (§Shared: Collection procedure step 3), append the category question at the end. Structure (render in buyer's language):

```json
{
  "mode": "form",
  "questions": [
    {
      "question": "Destination country/region?",
      "header": "Dest",
      "options": [
        { "label": "United States", "description": "Products will be shipped to the United States" },
        { "label": "United Kingdom", "description": "Products will be shipped to the United Kingdom" },
        { "label": "Germany", "description": "Products will be shipped to Germany" },
        { "label": "Japan", "description": "Products will be shipped to Japan" }
      ],
      "multiSelect": false
    },
    {
      "question": "Approximately how many units?",
      "header": "Qty",
      "options": [
        { "label": "100 pcs", "description": "Set the purchase quantity to 100 units" },
        { "label": "500 pcs", "description": "Set the purchase quantity to 500 units" },
        { "label": "1000 pcs", "description": "Set the purchase quantity to 1000 units" }
      ],
      "multiSelect": false
    },
    {
      "question": "Preferred procurement method?",
      "header": "Buy",
      "options": [
        { "label": "Buy directly", "description": "Auto-match in-stock products and order directly, no communication needed" },
        { "label": "Inquire first", "description": "Auto-send inquiries to multiple suppliers for comparison, then decide" }
      ],
      "multiSelect": false
    },
    {
      "question": "Which specific category best fits your needs?",
      "header": "Category",
      "options": [
        { "label": "<cate_name translated to buyer's language>", "description": "Sub-category" },
        { "label": "<cate_name translated to buyer's language>", "description": "Sub-category" },
        { "label": "Skip", "description": "Not sure, let the system auto-match the best category" }
      ],
      "multiSelect": false
    }
  ]
}
```

> **Note:** The category question is conditional — only appended when category refinement conditions are met (§Shared: Collection procedure step 3).

### Parsing rules

| Field | Parsing |
|---|---|
| productName | Free text as entered |
| destinationCountry | Map buyer's language input to ISO-3166 alpha-2 (e.g. "United States"→`US`, "United Kingdom"→`GB`, "Germany"→`DE`, "Japan"→`JP`; already-alpha-2 → pass through) |
| quantity | Parse to integer: "100 pcs"→`100`; "500"→`500`; free-text number → extract integer |
| tradablePreference | "Buy directly"/"Buy now"→`"yes"`; "Inquire first"/"Send inquiry"→`"no"` |
| Attribute concrete value | Store `{attrName: "<English>", attrValue: "<value>"}` |
| Attribute "Skip" (or its translation in the buyer's language) | Omit from productAttributes |
| Category — user selected cate_name | Cache corresponding `cateId` + `cateName` to `categoryCache` |
| Category — "Skip" (or its translation) | AI picks the most query-relevant leaf category from `cate_list`, cache `cateId` + `cateName` |
| Category — free-text input | AI picks the leaf category most relevant to user input, cache `cateId` + `cateName` |
