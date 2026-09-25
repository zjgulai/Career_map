---
name: profit-calculator
description: |
  Profit calculator skill for cross-border trade buyers. Generates an interactive,
  config-driven HTML calculator with fields pre-filled from context, so the buyer
  immediately sees an estimated profit and can adjust any number.
  Trigger whenever the buyer shows an **intent to calculate profit** — e.g. wanting to
  know whether a deal is profitable, cost vs. profit, margin, whether a selling price is
  worthwhile, break-even price, landed cost, or ROI. Judge from the buyer's underlying
  intent by understanding the meaning of the message.
  Trigger early — as soon as such intent is recognized, start the flow
  without waiting for all parameters.
enabled: true
---

# Profit Calculator

A config-driven interactive profit calculator for cross-border trade. The agent gathers
what it can from context, writes pre-filled values into a separate prefill JSON file (unfilled costs default to 0 there), calls the
registered `profit-calculator-generate` CLI tool to generate a standalone HTML, calls
`profit-calculator-run` to compute the pre-filled results, and delivers both the HTML and a
user-visible summary conclusion to the buyer. The buyer sees an estimated result on open and can tune any input.

- `{SKILL_DIR}` = the directory where this SKILL.md resides.
- `{PROJECT_DIR}` = the user's current project root directory.

## Architecture (V2)

Execution flow:
1. Write `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json` with the pre-filled values and a task-specific calculator title.
2. Call `profit-calculator-generate` with the prefill file path, the prepared skill config path,
   and the default language inferred from the user's latest message to generate HTML.
3. Call `profit-calculator-run` with the same prefill file path and config path to compute and read results.
4. In the user-visible final response, provide the HTML file and a concise summary conclusion based on the computed results.

```
profit-calculator-generate --config {SKILL_DIR}/examples/profit_standard.json --prefill {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json --default-language {DEFAULT_LANG} --output {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.html
```

- **Standard calculator config**: use the prepared calculator config at
  `{SKILL_DIR}/examples/profit_standard.json`. Keep the standard cost fields; costs the
  buyer chooses not to include are pre-filled with `0` in the prefill file, not in config.
- **Calculator config and prefill are separate**: the calculator structure config is already
  prepared in the skill at `{SKILL_DIR}/examples/profit_standard.json`; the agent only writes
  pre-filled values to `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json`. The generator can run
  with config only, or with `--prefill` when estimated values are available.
- **Pre-fill via `products` only**: `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json` must use
  exactly one prefill shape: a top-level `"products"` array. Even for a single product,
  write one product object. Put all pre-filled fields, including costs set to `0`, into that
  product's `values`.
- **Purchase price: three mutually exclusive modes** — pre-fill **exactly one** of them per product:
  1. `priceLadder` (a tiered price table; see the next bullet) — use this whenever the product has one.
  2. `values.unit_cost` (purchase unit price).
  3. `values.purchase_total` (purchase total for the batch).
  `unit_cost` and `purchase_total` are conflicting inputs — never fill both, and never fill either
  alongside `priceLadder` (a manually filled price overrides the ladder formula, which would silently
  ignore the tiers). Any violation makes `profit-calculator-generate` / `profit-calculator-run` abort
  with an error. Given `quantity`, filling `unit_cost` shows the derived `purchase_total`
  (= unit_cost × quantity), and filling `purchase_total` shows the derived `unit_cost`
  (= purchase_total ÷ quantity). In the HTML, editing one clears the other so it re-derives (edit unit
  price → total updates; edit total → unit price updates). Downstream cost/profit always uses
  `purchase_total`.
- **Tiered price (`priceLadder`)**: the tier table comes from the `ladderPrice` field of the product
  data returned by MCP `fetch_product_info` — see Step 1 for the call — not from a search result's
  display price. **`ladderPrice` present means the product has a tiered price, so always pre-fill it as
  `priceLadder`; `ladderPrice` absent means the product has no tiered price (its listing carries a range
  price only), so pre-fill the plain price as `unit_cost` as before.** `priceLadder` sits on the product
  item next to `values` (a sibling of `fieldCurrencies`
  and `links`), and the engine derives the purchase unit price from the tier matching `values.quantity`,
  so changing the quantity in the HTML re-prices the whole calculation automatically.
  ```json
  {
    "name": "Option A",
    "values": { "quantity": 25, "selling_price": 600, "freight_total": 0, "tariff_rate": 0, "platform_commission_rate": 0, "other_fee_total": 0 },
    "priceLadder": {
      "currency": "USD",
      "unit": "pieces",
      "tiers": [
        { "minQty": 10, "maxQty": 19, "unitPrice": 350 },
        { "minQty": 20, "maxQty": 39, "unitPrice": 340 },
        { "minQty": 40, "unitPrice": 335 }
      ]
    }
  }
  ```
  Hard requirements — the generator/runner rejects the prefill otherwise:
  - **Structured `tiers` only.** Convert the source's Markdown/text ladder table into this array
    yourself; passing the raw string (e.g. `"| 10-19 pieces | USD 350 |..."`) is an error.
  - Every tier needs a positive numeric `minQty` and `unitPrice`. Only the **highest** tier may omit
    `maxQty` (meaning "and up"); all others must have `maxQty >= minQty`. Tiers must not overlap or
    repeat a `minQty` (the engine sorts them by `minQty` for you).
  - `values.quantity` is **required and must be > 0**, because the tier is resolved from it.
  - `priceLadder.currency` must equal the calculator's base currency (`USD` in the standard config) —
    convert the tier prices yourself first. Do not put a conflicting `fieldCurrencies.unit_cost` /
    `fieldCurrencies.purchase_total` next to a ladder.
  - Record the ladder's provenance under the top-level `source.priceLadder` (instead of
    `source.unit_cost`), and put the product-detail URL in `products[].links.product_name`.
  Behavior the buyer sees, which you can state in the summary:
  - **Below the lowest tier**: the lowest tier's price is applied, and both the calculator and the
    Compare report mark the quantity as below the minimum tier. Above a closed highest tier behaves
    symmetrically. Prefer a `quantity` that actually satisfies the ladder's minimum when the buyer has
    not fixed one.
  - **Manual edits switch the ladder off**: if the buyer types a purchase unit price or total, that
    manual number wins — unit price and total keep deriving from each other through `quantity`, but the
    tier formula no longer applies (the calculator marks it). Clearing the manually entered value
    restores the tiered price automatically.
- **Traceable field sources**: put numeric source/explanation into one top-level `"source"` object
  next to `"products"`. `source` is a dict: key = filled field id, value = a string or a structured
  object with `summary`, optional `detail`, optional `links`, and optional `evidence`. Write every
  source text in the same language as `{DEFAULT_LANG}` (the user's latest message language), matching
  the generated UI language. For every value based on a reference page, marketplace listing, search
  result, product page, conversation, fee page, or tool result with a URL, include that URL in
  `source[field_id].links` and put the best direct field URL in `products[].links[field_id]` so the
  corresponding table input shows a small link icon on the right side of the input box. If a value is
  estimated by the agent without an external reference, say so explicitly in `source[field_id].summary`/`detail`.
- **Multi-product pre-fill**: add one item per product in `products`. Each product item is
  `{ "name": "...", "image": "https://...", "values": { <var_id>: <value>, ... }, "fieldCurrencies": {...}, "links": {...} }`.
  Also copy the same main image URL into `values.product_image` when available. The top-level `source` object is shared for the calculator and is not nested under products.
  Only this `products` + top-level `source` shape is valid for prefill. Example:
  ```json
  {
    "title": "Sunglasses Profit Calculator",
    "products": [
      {
        "name": "Option A",
        "image": "https://cbu01.alicdn.com/img/ibank/example-a.jpg",
        "values": {
          "product_image": "https://cbu01.alicdn.com/img/ibank/example-a.jpg",
          "quantity": 500,
          "unit_cost": 3.5,
          "selling_price": 12,
          "freight_total": 0,
          "tariff_rate": 0,
          "platform_commission_rate": 0,
          "other_fee_total": 0
        },
        "links": {
          "product_name": "https://detail.1688.com/...",
          "unit_cost": "https://detail.1688.com/...",
          "selling_price": "https://www.amazon.com/...",
          "freight_total": "https://www.alibaba.com/logistics/...",
          "platform_commission_rate": "https://sell.amazon.com/pricing"
        }
      },
      {
        "name": "Option B",
        "image": "https://cbu01.alicdn.com/img/ibank/example-b.jpg",
        "values": {
          "product_image": "https://cbu01.alicdn.com/img/ibank/example-b.jpg",
          "quantity": 500,
          "unit_cost": 5,
          "selling_price": 18,
          "freight_total": 0,
          "tariff_rate": 0,
          "platform_commission_rate": 0,
          "other_fee_total": 0
        },
        "links": {
          "product_name": "https://detail.1688.com/...",
          "unit_cost": "https://detail.1688.com/...",
          "selling_price": "https://www.amazon.com/...",
          "freight_total": "https://www.alibaba.com/logistics/...",
          "platform_commission_rate": "https://sell.amazon.com/pricing"
        }
      }
    ],
    "source": {
      "quantity": {
        "summary": "Buyer selected 500 units in clarification.",
        "detail": "Use this quantity for batch-level revenue, freight, and profit formulas."
      },
      "unit_cost": {
        "summary": "Seller quote / product listing price used as purchase unit price.",
        "links": [
          { "label": "Product page", "url": "https://detail.1688.com/..." },
          { "label": "Conversation quote", "url": "https://www.accio.com/chat?activeIcbuAliId=..." }
        ]
      },
      "selling_price": {
        "summary": "Estimated from comparable retail products on the target channel/market.",
        "detail": "Explain the exact evaluation method, such as same/similar product, pack size adjustment, and median or conservative price selection.",
        "evidence": [
          { "summary": "Amazon comparable listing used for price benchmark.", "links": [{ "label": "Amazon comparable", "url": "https://www.amazon.com/..." }] }
        ]
      },
      "platform_commission_rate": {
        "summary": "Official platform fee page found by web search.",
        "links": [{ "label": "Official fee page", "url": "https://..." }]
      },
      "freight_total": {
        "summary": "Freight estimate from logistics quote/search result when available; otherwise agent estimate by route and mode.",
        "links": [{ "label": "Logistics quote", "url": "https://www.alibaba.com/logistics/..." }]
      },
      "tariff_rate": "If tariff included → rate from the ali_logistics_util logistics backend by market/product; else 0.",
      "other_fee_total": "If other costs are included → estimate/ask; else 0."
    },
    "costStrategies": [
      {
        "icon": "⚓",
        "name": "Freight optimization",
        "tag": "AI-selected option",
        "selectedPlan": "Use consolidated sea freight for this calculation.",
        "alternatives": ["Air freight: faster but higher cost", "Standard sea freight: slower but improves margin"],
        "description": "Explain why the selected freight option is optimal for the current quantity/timeline and how alternatives affect profit."
      },
      {
        "icon": "🧾",
        "name": "Tariff lever",
        "selectedPlan": "Use China → target-market tariff returned by the logistics backend.",
        "alternatives": ["Different destination market", "Different supplier origin or category classification when valid"],
        "description": "Explain how target market, category classification, or supplier shipment location affects tariff and profit."
      },
      {
        "icon": "🏬",
        "name": "Platform commission lever",
        "selectedPlan": "Use the selected sales channel's official commission rate.",
        "alternatives": ["TikTok Shop lower commission when applicable", "Shopify self-hosted checkout fee when applicable"],
        "description": "Compare the selected channel rate with alternatives and explain the profit impact."
      },
      {
        "icon": "📦",
        "name": "Quantity discount lever",
        "selectedPlan": "Use the buyer-selected quantity for this calculation.",
        "alternatives": ["Increase quantity to supplier discount tier", "Keep smaller test batch to reduce inventory risk"],
        "description": "Explain whether a larger quantity may unlock supplier discount or amortize batch-level costs."
      }
    ]
  }
  ```
- **Task-specific title**: every generated calculator should have a title that reflects the current task or product set. Put it in the prefill as top-level `title` (or `calculatorTitle` / `taskTitle`). If omitted, the generator derives a title from product names, such as `Sunglasses Profit Calculator` or `Option A 等3个商品利润计算器`.
- **Field currency (quote currency)**: fill the quote/price currency into `fieldCurrencies`
  based on the conversation context. Key = a currency field id (e.g. `unit_cost`,
  `purchase_total`, `selling_price`, `freight_total`), value = an ISO currency code (e.g. `"USD"`,
  `"CNY"`, `"EUR"`). Use whatever currency the seller quoted or the buyer used in the chat, and the
  number in `values` must be the amount in that field's currency. If the chat gives no currency,
  omit `fieldCurrencies` and the calculator falls back to the config base currency (USD).
- **Cost strategy section**: optionally add top-level `"costStrategies"` (array or dict). The HTML
  displays it after the table and before sources. Use it to explain profit levers from the selected
  parameters: freight, tariff, platform commission, quantity/MOQ discount, other fees, and any
  practical alternative that may improve margin. Each strategy should clearly state:
  - `selectedPlan`: the plan used in this calculation.
  - `alternatives`: other feasible plans/options and their trade-offs.
  - `description`: why the selected plan was used and how alternatives affect profit.
  If the user gives no specific preference, pre-fill the calculation with the option that appears
  best for profit/risk/timeline based on available context, and mark it as the selected plan.
- **Product main image**: when a product/listing image is available, **must** pre-fill the product's main image URL.
  Fill both `products[].image` and `products[].values.product_image` with the same URL. The calculator
  displays the image next to that product's title in the table header. If multiple image URLs are present, use
  the first main/listing image URL.
- **Product title and field hyperlinks**: a product item may carry an optional `links` object.
  Use `links.product_name` for the product title/header. For referenced price/cost fields, also put the
  best direct URL in `links.<field_id>` (for example `links.unit_cost`, `links.selling_price`,
  `links.freight_total`, or `links.platform_commission_rate`); the HTML
  shows a small link icon to the right of the input box while keeping the input width aligned with other inputs.
- The calculator config is maintained by the skill. During normal execution, the agent only
  writes prefill values; it does not edit `variables[]` or `formulas[]`.
- **Input formula fields & conflicts (config-level)**: a `variables[]` item may carry an optional
  `"formula"` referencing other field ids (it stays an editable input, but when left blank
  and every formula dependency has a user-entered value the calculator displays the derived value;
  a manually entered value always takes precedence). `"formula"` may also be an **ordered array of
  candidate expressions** — the first candidate whose dependencies all have values wins, which is how
  the tiered-price expression coexists with the plain unit ↔ total derivation. A variable may also
  carry an optional `"conflict"` string naming a mutually exclusive field id; if a prefill fills both
  a field and its `conflict` target, generate/run aborts with an error. Together these power the
  unit-price ↔ total-price behavior above.
- **Tiered-price hooks (config-level)**: when a product carries a `priceLadder`, the engine resolves
  the tier for the driving quantity and exposes it to formulas as the read-only variable
  `ladder_unit_price`; with no ladder it is simply absent, so the candidate list falls through to the
  ordinary formula and behavior is unchanged. Two declarative flags wire this up in the standard
  config: `"ladderDriver": true` on the quantity input marks the field whose value selects the tier,
  and `"breaksLadder": true` on `unit_cost` / `purchase_total` marks the fields whose **manually
  entered** value switches the tiered formula off. "Switched off" is derived state, not stored state —
  clearing those manual values restores the tiered price on the next recalculation.
- **Table layout**: the calculator renders as a table (rows = items, columns = products)
  for easy multi-product comparison. Editable input cells are shown as input boxes by
  default; editing recomputes the relevant product column.
- **Sectioned baseline**: the standard config uses three sections — Profit / Cost / Income.
  `sections[].items` controls the exact display order; the profit section appears first so the
  buyer sees expected profit, profit per unit, margin, and break-even price before input details.
- **Language switch**: the generated HTML includes a language selector for English, 中文,
  繁體中文, Español, Português, Français, Deutsch, and 日本語. Put display names in
  `nameI18n` / `titleI18n` / option `labelI18n` (and section `nameI18n`) so the user can
  switch languages without regenerating the calculator. Formula ids/expressions stay
  language-neutral.
- **Default language**: set `{DEFAULT_LANG}` from the user's latest message language, not from
  older conversation turns. Use `zh` for Simplified Chinese, `zh-TW` for Traditional Chinese,
  `en`, `es`, `pt`, `fr`, `de`, or `ja` for the supported languages; fallback to `en` if
  uncertain. Pass it to generation via `--default-language {DEFAULT_LANG}`. Also write the
  prefill `source` value texts in this same language.

## Triggers

Trigger whenever the buyer shows an intent to calculate profit, judged from the meaning of
their message. Start the flow on any of these:

- **a. Context product + profit intent** — a product/supplier is already selected in
  context and the user expresses profit intent ("帮我算这个品的利润" / "is this profitable").
- **b. Direct profit intent** — the message itself asks for profit/cost/margin
  ("帮我算一下利润" / "calculate the margin").
- **c. Follow-up chip** — triggered from a compare report ("粗略估计利润 / Rough profit
  estimate") or from progress sync when a seller quote exists ("根据报价算利润 / Estimate
  profit from this quote"). Fires after the user clicks/affirms the chip.

## Step 1: Resolve the target product and its purchase price

- **Context has a specific product** → use it directly (name, product ID, image).
- **No product** → clarify what to calculate first, then run a product search via the
  **[accio-product-supplier-sourcing](../accio-product-supplier-sourcing/SKILL.md)** skill
  (its mandatory sourcing workflow owns query optimization, `intent_type` selection, and
  result rendering — follow it instead of calling `product_supplier_search` directly), then take
  the chosen result's product ID into the next bullet.
- **The purchase price comes from `fetch_product_info`, not from the search result.** As soon as a
  product ID is known, call MCP `fetch_product_info` for that product and read the tiered price
  (`ladderPrice`) from the response:
  ```bash
  accio-mcp-cli call fetch_product_info --json '{"fieldName_3":{"payload":{"product_list":[{"productId":"1600626403511","dataSource":"Alibaba.com"}]}}}'
  ```
  Products MUST sit inside the nested `fieldName_3.payload.product_list` envelope, each item an object
  with `productId` and `dataSource` (`"Alibaba.com"` for Alibaba products) — a flat top-level
  `productIds` array makes the backend fail. One call covers every product of the task, so batch them
  instead of calling once per product. The response is `[{type:"text", text:"<JSON string>"}]`: parse the
  inner JSON and read `payload.*`. **`ladderPrice` present = the product has a tiered price → pre-fill
  `priceLadder`; `ladderPrice` absent = the product has no tiered price, only a range price → pre-fill a
  flat `unit_cost`.** A search result or product card carries a single display price with no quantity
  relationship, so it is never an acceptable substitute for the tier table.
- **Purchase-price fallbacks, only after `fetch_product_info` was actually called and returned no
  `ladderPrice` for the product**: a seller quote in the conversation → the product's own listing /
  range price → the **average price of the top 10 search results** as the `unit_cost` last resort. Name
  the fallback used in `source.unit_cost`.

## Step 2: Clarify (ask_user)

Send `ask_user` cards **sequentially** (never two in one turn), and always use **mode=form** for every clarification card. Skip any question already
answered by context.

**Round 1 (mode=form, ≤5 questions):**
1. Purchase quantity — offer options predicted from the product category.
2. Which costs to include (mode=form, multiSelect): offer these as **separate options**. Do not merge any two items into one option. If the buyer does not select Platform commission, pre-fill `platform_commission_rate` as `0` and explain that platform commission is not included in this calculation:
   - Freight
   - Import tariff
   - Platform commission
   - Other fees (其他杂费)
3. Sales channel: offer channels as **separate options**. Do not merge any two channels into one option:
   - Amazon
   - TikTok Shop
   - Shopify
   - Other

**Round 2 (conditional):** If Round 1 selected **tariff or freight** AND context has no
destination market → ask the target market. If the user does not answer, set tariff to `0`.

## Step 3: Selling-price search

The benchmark is a comparable retail listing on the platform selected in Step 2 (Amazon unless the
buyer named another channel). **Run the image pass first and fall back to the text pass only when it
yields no priced comparable.** `accio_web_image_search` accepts an image URL and nothing else — it has
no text or query field, so image and text cannot be combined in one call; the text pass is a separate
`web_search`.

1. **Image pass — whenever a public product image URL exists.** Pass the product's main image URL to
   `accio_web_image_search` once:
   ```bash
   accio-mcp-cli call accio_web_image_search --json '{"fieldName_3": {"payload": {"image_url": "https://cdn.example.com/product.jpg"}}}'
   ```
   The only service input is the public image URL nested under `fieldName_3.payload.image_url`. When the
   caller (for example the `image-analysis` skill) already ran this call for the same image, reuse that
   result instead of calling again.
2. **Pick the benchmark from `lens_result`.** Each item carries `prod_title` / `title` and `link`, and
   usually `price`. Keep only items that show a price, point at a real product page on the target
   platform's retail domain, and are not Alibaba/wholesale hosts — those are supply-side prices, not
   retail benchmarks. Use the closest comparable listing's price as `selling_price`.
3. **Text pass — fallback.** Run `web_search` for the retail price using the product name plus
   distinguishing specs plus the platform and market when there is no usable image URL, the MCP call
   fails, `lens_result` is empty, or no remaining item carries a price. When the image pass identified
   the product but returned no price, build the query from the converged Lens titles instead of the raw
   supplier title — that is how image evidence feeds the text pass.
4. **Record the benchmark, not the pass.** Put the chosen listing URL into
   `products[].links.selling_price`, and the price plus the same URL into `source.selling_price`. Only
   cite a price whose listing link you kept. Which pass produced it is an internal detail — never write
   "image search" / "text search" into the source note; the buyer only needs the comparable listing and
   its price.

A benchmark may be a similar or comparable retail product rather than the identical item. Concluding
that no retail price is available without having run both passes is a violation.

## Step 4: Field pre-fill rules (write into `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json`)

Use exactly this prefill shape. For a single product, still write one item in `products`:

```json
{
  "products": [
    {
      "name": "Product 1",
      "values": {
        "quantity": 0,
        "product_image": "https://cbu01.alicdn.com/img/ibank/example.jpg",
        "unit_cost": 0,
        "freight_total": 0,
        "tariff_rate": 0,
        "platform_commission_rate": 0,
        "other_fee_total": 0,
        "selling_price": 0
      }
    }
  ],
  "source": {
    "quantity": "Clarification result + context.",
    "unit_cost": "Seller quote → product listing price → Alibaba top-10 average.",
    "freight_total": "If freight included → estimate by target market; else 0.",
    "tariff_rate": "If tariff included → rate from the ali_logistics_util logistics backend by market/product; else 0.",
    "platform_commission_rate": "If commission included → official platform fee page from web search; if not selected → 0 because platform commission is not included in this calculation.",
    "other_fee_total": "If other costs are included → estimate/ask; else 0.",
    "selling_price": "Comparable retail listing price on the selected platform."
  }
}
```

| Field | Pre-fill source |
|-------|-----------------|
| `product_image` (商品主图) | Product/listing main image URL; display above the product title in the table header |
| `unit_cost` (采购单价) | **Only when `fetch_product_info` returned no `ladderPrice` for the product (no tiered price, range price only).** Seller quote → product listing / range price → Alibaba top-10 average; include product page link and conversation quote link when available |
| `priceLadder` (阶梯价) | Whenever `fetch_product_info` returns `ladderPrice` for the product (see Step 1): convert it into structured `tiers` on the product item and leave `unit_cost` / `purchase_total` empty; record its provenance in `source.priceLadder`. Never take the purchase price straight from a search result instead |
| `freight_total` (运费) | If freight included → estimate by target market and explain transport mode/route; else `0` |
| `platform_commission_rate` (平台佣金率) | If Platform commission is selected → use web search to find the official fee/commission page for the selected platform/channel and include that official link in `source.platform_commission_rate`; if not selected → pre-fill `0` and state platform commission is not included |
| `quantity` (采购数量) | Clarification result + context; mention MOQ or discount tier if relevant. With a `priceLadder` it must be a positive number, since it selects the applied tier — prefer a quantity that reaches the ladder's lowest tier |
| `tariff_rate` (进口关税率) | If tariff included → call `ali_logistics_util` (`logistics_task_next`) with a `task_input` carrying destination/origin country and the Alibaba.com product ID or URL; else `0` |
| `other_fee_total` (其他杂费（总）) | If other costs are included → estimate/ask and explain assumptions; else `0` |
| `selling_price` (单件售价) | Explain how the price was assessed and include evaluation links, such as Amazon / marketplace comparable listings |

- **Write complete field sources and links**: for every pre-filled number in `products[].values`, write a
  matching top-level `source` entry that makes the value traceable. Prefer structured source objects
  with `summary`, `detail`, `links`, and `evidence` when links or multiple evidence items exist. The
  HTML displays this source block after the cost strategy section. Whenever a field uses any reference
  with a URL, put that URL in `source[field_id].links` and put the best direct field URL in
  `products[].links[field_id]` for the product column. A referenced value without a link is incomplete.
  If the value is self-estimated, explicitly label it as an agent estimate and explain the assumption
  instead of implying it has an external source.
- **Source requirements for key fields**:
  - `product_image`: use the product/listing main image URL when available; if multiple image URLs are present, use the first main/listing image URL.
  - `unit_cost` / `purchase_total`: include product page link and conversation quote link when available; put the direct product/quote URL into `products[].links.unit_cost` or `products[].links.purchase_total`.
  - `priceLadder`: describe where the tier table came from (product detail page / quote) in `source.priceLadder`, include that URL in `source.priceLadder.links`, and put the product-detail URL into `products[].links.product_name`. Note the applied tier is derived from `quantity`, so no separate `unit_cost` source is needed.
  - `selling_price`: name the comparable retail listing the price came from (platform plus what makes it comparable) and include its link; put the best comparable listing/search URL into `products[].links.selling_price`. Do not mention how the listing was found — the buyer does not need to know whether the image pass or the text pass produced it. If the price is self-estimated, state the estimate logic clearly.
  - `freight_total`: when freight is included and a logistics quote, logistics search result, or carrier/rate page URL is available, include it in `source.freight_total.links` and put the best direct URL into `products[].links.freight_total`; if freight is agent-estimated with no URL, state the route/mode assumption clearly.
  - `platform_commission_rate`: when selected, use web search to cite the official fee/commission page for the selected channel; include that URL in `source.platform_commission_rate.links` and put the official fee page URL into `products[].links.platform_commission_rate`. When not selected, set it to `0` and explain that platform commission is not included in this calculation.
  - `tariff_rate`: include the request assumptions sent to the logistics backend (destination country, origin country, product ID or URL, plus quantity / declared value when used) and the returned tariff explanation when available.
  - Fields set to `0`: state the buyer skipped it, the cost is not applicable, or the assumption used.

- **Tariff backend call**: when tariff is included, get the rate from the buyer logistics backend.
  Tariff was merged into that single relay, so the standalone customs tariff tool no longer exists —
  never call `icbu_logistics_customs_calculate_tariff_tool`. Do not read or hand off to
  [`alibaba-logistics-assistant-buyer`](../alibaba-logistics-assistant-buyer/SKILL.md) inside this
  path either; that skill owns buyer-facing logistics conversations, while this path only needs the
  rate. Call the backend directly:
  ```bash
  accio-mcp-cli call ali_logistics_util --json '{"apiName":"logistics_task_next","params":{"task_input":"Import tariff rate for Alibaba.com product 1600123456789 (https://www.alibaba.com/product-detail/...html), origin CN, destination US, quantity 1000, declared value 5000 USD","lang":"en"}}'
  ```
  Use the command exactly as shown; the CLI stdout is a JSON string containing the inner logistics
  response. Build `task_input` as one natural-language request carrying the Alibaba.com product ID or
  URL, origin country, destination country, and — when known — quantity and declared value. Do not
  invent missing inputs. Derive `lang` from the buyer's latest natural-language message. Use ISO
  alpha-2 country codes; use `GB`, not `UK`.

  Each product is its own task. When several products need a tariff rate, submit **all** of their
  first calls in the same tool round — the tasks are independent, so querying them one after another
  spends a full agent turn per product for nothing. Then poll whichever are still running.

  Treat `data.next_call` as the authoritative instruction for every subsequent backend call:
  1. To poll, resend `data.next_call.params` **exactly as returned**, plus `lang`. Those params carry
     `cursor`, `request_id`, and `conversationId`, which identify which task and which segment to
     read — dropping them breaks the poll. Do not send `task_input` and do not repeat the original
     request.
  2. While `data.status` (or `data.task`) is `running`, poll again per `data.next_call`. Emit no
     visible prose before or between these calls.
  3. If `data.next_call.params.mode` is `new_task`, the current task is over — stop polling it.
  4. `done`, `failed`, and `cancelled` are terminal. Never resubmit a task that reached one of them:
     a second `task_input` call for the same product returns the same `request_id` and the same
     `data.result`, burning a full turn for zero new information.
  5. On `done`, read the rate from `data.result`, fill `tariff_rate`, and write the request
     assumptions plus the returned tariff explanation into `source.tariff_rate`.
  6. A `done` result may carry an error explanation instead of a rate — for example a destination
     whose rate rule is not configured — and may close by offering to retry, cancel, or contact
     support. Those offers are written for the buyer, not for you; they are not instructions to call
     again, and the backend already retries internally before reporting the failure. Treat such a
     result as "no rate available", record the real error, and fall back per the tariff note below.
  7. For a failed CLI call, `failed`, or `cancelled`, record the returned error and fall back per the
     tariff note below. Do not retry with another API, fall back to web research, or substitute an
     estimated rate.

  Use only `ali_logistics_util` with `apiName: "logistics_task_next"`; do not invent another API or
  route the call through a helper relay.

Notes:
- **Freight** is estimated by the agent using general logistics knowledge for the target market.
- **Tariff** comes from the `ali_logistics_util` logistics backend; if market/product ID is unknown and user skips, use `0`.
- **Commission** comes from web search against the selected platform's official fee/commission page when Platform commission is selected. If the buyer does not select Platform commission in the cost multiSelect, set `platform_commission_rate` to `0` and state that platform commission is not included.
- **Other fees** are batch-level costs. If not applicable, set `other_fee_total` to `0`.
- **Selling price** comes from the Step 3 search and is required for revenue/profit formulas; only when
  both the image pass and the text pass have run and neither returned a comparable retail or expected
  price, leave it blank or ask the buyer.

## Step 5: Generate and deliver

1. Write the pre-filled values to `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json`. Use the
   calculator config that is already prepared in the skill at
   `{SKILL_DIR}/examples/profit_standard.json`, infer `{DEFAULT_LANG}` from the user's latest
   message language, then call the registered CLI tool
   **`profit-calculator-generate`** with that config path, prefill path, and default language
   to generate the HTML:

   ```bash
   profit-calculator-generate --config {SKILL_DIR}/examples/profit_standard.json --prefill {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json --default-language {DEFAULT_LANG} --output {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.html
   ```

   - Choose a short `{TASK_SLUG}` from the current product/task (for example `sunglasses` or `camping-lamp`). Generate one task-specific calculator file per profit task; within the same task, compare multiple products as columns in that calculator.
   - Put a task-specific calculator title into the prefill (`title`, `calculatorTitle`, or `taskTitle`). Each profit task should generate its own calculator file/title that reflects the current product or product set instead of using a generic calculator title.
   - Infer `{DEFAULT_LANG}` from the user's latest message language and pass it with
     `--default-language`; do not rely on the standard config's default language.
   - Do **not** write a calculator config file into the project directory for the standard
     flow; use `{SKILL_DIR}/examples/profit_standard.json` as the config input.
   - Put estimated field values into each product's `values` in
     `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json`; costs not included → `0`.
   - Put the source/explanation for each pre-filled field into one top-level `source` dict in
     `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json`; `source` is next to `products`, not inside
     each product item.
   - Use the prepared standard config. Do **not** add or edit `variables[]` / `formulas[]`
     during normal execution; only write values into the prefill file.
   - **Comparing several products at once** → add several items to prefill `products`.
     Every product item must carry its own complete `values`; do not rely on shared fallback values.
   - Write the prefill file before running the generator tool. If there are no pre-filled
     values, omit `--prefill` and generate from the skill config only.

2. Deliver with `present_files` **and** include the path as a clickable link in your reply.
   Do **NOT** auto-open the browser.

   ```json
   {
     "files": [
       { "path": "{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.html", "label": "Profit Calculator" }
     ]
   }
   ```

   Also send the path in your reply:
   ```
   {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.html
   ```
   Set the `label` in the user's conversation language (e.g. `"利润计算器"`).

3. Compute with `profit-calculator-run` (Step 7) before the final reply, then summarize the key
   results in the user's language. Showing or linking the HTML alone is not enough. The final reply must
   include both:
   - **Overall profit summary**: expected profit (`total_profit`), profit per unit (`profit_per_unit`),
     net margin (`margin`), break-even price (`break_even_price`), and whether the overall result looks
     profitable/risky based on the computed numbers.
   - **Profit space summary**: summarize the selected cost/leverage choices from `costStrategies`
     (for example freight, tariff, platform commission, quantity, purchase price, selling price), the
     most important lever/sensitivity, and the practical alternative options if provided.

4. Tell the user the numbers are **estimates** and they can adjust any field in the calculator.

5. End with follow-up chips (see the Follow-up Output Rules), following its formatting protocol exactly.

## Step 6: Read results

> For **pre-filled / programmatic** results, prefer the one-command script path in **Step 7**
> (no browser needed — it computes, saves, and returns the numbers). Use `evaluate_script`
> below only to read what the **user** changed inside the already-open calculator.

```js
// evaluate_script
JSON.stringify(window.__CALC_RESULT__)
```

`window.__CALC_RESULT__` returns the active product, display/base currency, top-level `source`,
and per-product `values` + `results` (see formula ids in the config). Returns `null` if no
valid data yet.

> ⚠️ NEVER read, open, or inspect the HTML source file to get results or language — always
> use `evaluate_script`, or ask the user.

## Step 7 (recommended when pre-filled): Compute + save + read in one command

When you pre-filled products in `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json`, you do **not**
need the browser to compute or read results — the registered `profit-calculator-run` tool does all three in a single
call: it computes every pre-filled product, saves them as a record, and prints the full result
JSON to stdout.

```bash
profit-calculator-run --html {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.html --config {SKILL_DIR}/examples/profit_standard.json --prefill {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json --default-language {DEFAULT_LANG} --save --save-title "Batch A"
```

- Pass the same `{DEFAULT_LANG}` used for generation so the saved record's config language stays
  consistent with the generated HTML.
- **No `--products`/`--inputs` needed** — the products in the prefill file are computed & saved.
- **Saved**: the record (all products + config + results) is written to `records.json` next to
  the HTML, so it shows up in the calculator's Records panel and can be merged later.
- **Read and summarize**: stdout is `{ success, result, savedRecord }`. `result.source` carries the
  top-level source explanations, and `result.products[]` carries each product's `values` + `results`
  (keyed by formula id). Parse it directly and use the parsed numbers for the final buyer-facing
  summary, e.g.:

  ```bash
  profit-calculator-run --html {PROJECT_DIR}/profit-calculator.html --config {SKILL_DIR}/examples/profit_standard.json --prefill {PROJECT_DIR}/profit-calculator.prefill.json --default-language {DEFAULT_LANG} --save \
    | python3 -c "import sys,json; d=json.load(sys.stdin); [print(p['name'], p['results']) for p in d['result']['products']]"
  ```

- **Note**: at least one product must produce a non-null result, otherwise nothing is saved.

Use this path whenever you pre-fill through the prefill file and want the numbers programmatically; reserve
the browser `evaluate_script` (Step 6) for reading values **after the user edits** in the page.

- **Final buyer-facing summary**: after generating the HTML and computing results, the visible reply to
  the user must include a concise conclusion summary in addition to the HTML. Include at least:
  - Overall profit summary: total profit, profit per unit, margin, and the best/worst product when comparing products.
  - Profit-space summary: the main levers that can improve profit, such as selling price, unit cost, freight, platform commission, tariff, quantity, or other fees.
  Mention that pre-filled values are estimates and can be adjusted in the HTML calculator.

## Fallback

If `evaluate_script` is unavailable or errors, ask the user for the key numbers:

> "Could you tell me the key numbers from the calculator — selling price, unit cost, profit
> per unit, and margin?"

Accept natural-language or pasted numbers and proceed.

## Rules

1. **Write prefill first** — write estimated values into
   `{PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json` using exactly one shape: top-level
   `products[]`. Even for a single product, write one product object and put every pre-filled
   field in that product's `values`; costs the buyer chooses not to include are set to `0`
   inside `values`. Only this `products` shape is valid for prefill.
2. **Use the prepared calculator config** — normal execution uses
   `{SKILL_DIR}/examples/profit_standard.json`; do not write a calculator config file into
   `{PROJECT_DIR}` and do not modify `variables[]` / `formulas[]` during the flow.
3. **Generate through the registered tool** — call
   `profit-calculator-generate --config {SKILL_DIR}/examples/profit_standard.json --prefill {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json --default-language {DEFAULT_LANG} --output {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.html`.
4. **Compute and summarize through the registered tool** — call
   `profit-calculator-run --html {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.html --config {SKILL_DIR}/examples/profit_standard.json --prefill {PROJECT_DIR}/{TASK_SLUG}.profit-calculator.prefill.json --default-language {DEFAULT_LANG} --save` to compute, save, read JSON results, and summarize the final result. The final user-visible reply must include both the generated HTML and a concise conclusion summary. The summary must include both an overall profit summary and a profit-space summary; never only provide the HTML link.
5. **Estimates disclaimer** — pre-filled values are estimates; prompt the user to adjust.
6. **NEVER read/open/inspect the HTML source** to extract results — use `evaluate_script`, `profit-calculator-run`, or ask the user.
7. **Deliver into the project directory** — generate to `{PROJECT_DIR}`, never open from skill assets directly.
8. **Form-mode clarification** — every `ask_user` clarification card uses `mode=form`; the cost item question is a multiSelect form, and an unselected Platform commission means `platform_commission_rate = 0`.
9. **Product main image** — when a product/listing image is available, fill both `products[].image` and `products[].values.product_image`; the table header shows the image next to the product title.
10. **Source and table links are mandatory for referenced values** — if `unit_cost`, `purchase_total`, `selling_price`, platform commission, freight, tariff, or any other pre-filled field is based on a product page, conversation, comparable listing, search result, official fee page, or tool result that has a URL, include the URL in the relevant `source[field_id].links` and the best direct field URL in `products[].links[field_id]` where applicable. The calculator displays those field URLs as small icons to the right of aligned input boxes. Self-estimated values must be explicitly described as estimates.
11. **One calculator per task** — generate a task-specific calculator for the current profit task. When comparing several products within the same task, keep them as columns in that task's calculator rather than creating separate files for each product.
12. **ALWAYS get the purchase price from MCP `fetch_product_info`, never from a search result and never from `sku_selector`.** Whenever a product ID is available, call `fetch_product_info` and read its `ladderPrice`:
    ```bash
    accio-mcp-cli call fetch_product_info --json '{"fieldName_3":{"payload":{"product_list":[{"productId":"1600626403511","dataSource":"Alibaba.com"}]}}}'
    ```
    Products MUST be nested inside `fieldName_3.payload.product_list`, each item carrying `productId` and `dataSource` — a flat top-level `productIds` array makes the backend fail. `ladderPrice` present means the product has a tiered price and MUST be pre-filled as `priceLadder`; `ladderPrice` absent means the product has no tiered price, only a range price, so a flat `unit_cost` applies. Pre-filling the price shown on a search result / product card skips the tier table and is a violation. `sku_selector` renders an order-confirmation UI (with a "Confirm Order" button) reserved for the Buy Now order flow, so it is forbidden here — profit calculation is a read-only scenario. Only after `fetch_product_info` has actually run and returned no usable price may you fall back per Step 1 or ask the user; the calculator's Unit Cost field is user-fillable and does NOT require SKU selection first.
13. **NEVER pre-fill a flat unit price when the product data returned a tiered price.** If `fetch_product_info` (or any quote) gives a quantity-dependent price such as `ladderPrice`, convert it into the structured `priceLadder.tiers` array on the product item and leave `unit_cost` / `purchase_total` empty, so the purchase price tracks the buyer's quantity. Never paste the raw Markdown/text ladder table as the field value, and never pick one tier's price by hand as `unit_cost` — both discard the quantity relationship the buyer is trying to evaluate.
14. **NEVER reach for `web_search` as the first selling-price attempt when a public product image URL exists.** Run the Step 3 image pass through `accio_web_image_search` first, and use `web_search` only after that pass returns no priced retail comparable. Never claim a retail price is unavailable without having run both passes.
