---
name: product-analysis-report
description: |
  Use for a comprehensive analysis, viability assessment, buying evaluation, or decision report for one specific product identified by a card, Alibaba.com URL, product ID, or clear conversation context.
  Not for unknown-product selection, multi-product comparison, profit-only requests, or supplier due diligence.
  This workflow owns its embedded profit analysis, HTML rendering, and follow-up output; do not co-load profit-calculator, html-report-generator, or follow-up.
---

# Product Analysis Report

Produce one evidence-based HTML report for one specific Alibaba.com product. Cover product details, commercial opportunities, supplier profile, product/supplier reviews, and lower-priced similar products. Calculate profit only when explicitly requested by the buyer.

Execution boundary:
- Always read `product-analysis-report/references/report-template.json`.
- For explicitly requested profit analysis, also read `product-analysis-report/references/profit-analysis.md` in the same initial parallel round as the template and collector. Otherwise leave it unloaded.
- Read reference paths as files, never as skill IDs.
- Do not load another skill body.
- Do not create tasks, subagents, reviewers, or post-render inspections.
- Put exactly one CLI command in each Bash call. Submit independent Bash calls in the same parallel round; never join them with `&&`, `;`, or pipes.
- Write the config alone, then render in the next tool round. For this report, successful rendering leaves only HTML presentation and the final brief.

## Route and inputs

- Resolve exactly one Alibaba.com product from the latest user message or immediate context.
- If no product is identifiable, ask for a product card or URL. If several products are in scope, ask the buyer to select one.
- Follow the latest user-message language throughout the report.
- This is ordinary supplier profiling, not verification.
- Do not call verification tools or make verified/legal-risk claims.
- Route explicit due-diligence requests to `supplier-verification-report` after presenting this report.
- Never call `sku_selector`; this is a read-only analysis flow.
- Do not send inquiries, contact suppliers, place orders, or expose buyer names, avatars, order IDs, or other personal data.
- Accept destination, postal code, sales channel, quantity, deadline, SKU, unit cost, selling price, freight/package facts, tariff, and fee rates from buyer input or the active task.
- Treat explicit values from the original request, `ask_user` response, or later buyer message as confirmed. The latest correction wins; retain it for the current report and later revisions without reconfirming or replacing it with collected evidence.
- Default missing destination to US, channel to Amazon, and quantity to the product MOQ resolved by the collector. Label defaults as analysis assumptions, not buyer confirmations; do not ask for these inputs by default.
- If MOQ is unavailable, retain listed prices and units without batch figures or savings. Ask for quantity only when explicitly requested profit analysis needs it.
- Enable profit analysis for an explicit request to calculate profit, margin, ROI, or break-even, including a later follow-up. A general or complete product-analysis request alone does not enable it.
- When clarification is necessary, use one `ask_user` form with a question per missing value, concrete single-select options, and the platform's free-text affordance.
- Never ask only for a postal code.
- In the next parallel round, read the required references and run the core collector.
- Freeze product ID, destination, channel, quantity, and buyer-confirmed commercial inputs once known; only a later explicit buyer correction may replace them.
- Use USD for report comparisons; preserve original currencies and never combine unconverted amounts.
- Use the frozen basis for price, freight, tariff, comparables, profit, and report.

## Workflow

### Execution order

- After core collection, run supplier profile, customs search, similar-product search, and any requested profit enrichment in parallel.
- Fetch only needed similar-product details and calculate requested profit as soon as each has its own inputs; do not serialize independent branches.
- Search only unresolved evidence. A WebSearch result closes its purpose even when empty; never reformulate or repeat it.
- Use result snippets only; never launch a browser operator, `WebFetch`, curl, or download/parse retail pages.
- Never add recap rounds, reread externalized results, or prefetch a fallback.
- Omit Bash `workdir`; the runtime uses the current workspace. Use the session date, not `get_time`, for source notes.

### 1. Collect core evidence

Call the registered collector once after the product is identified:

```bash
product-analysis-evidence collect --product-url "<full Alibaba.com URL>" --language <buyer language code>
```

Collector rules:
- Pass `--destination`, `--quantity`, and `--channel` when provided; otherwise omit them and use the returned `basis` defaults.
- Add `--profit` only for explicitly requested profit analysis and follow `references/profit-analysis.md`. Otherwise skip retail-price, freight, tariff, FX, and fee lookups; still complete supplier profiling, reviews, and lower-priced similar products.
- Add `--product-id` only when no usable Alibaba.com URL exists.
- Add `--origin`, `--postal-code`, or `--sku-id` only when buyer-confirmed.
- Add USD-normalized `--unit-cost`, `--freight-total`, `--tariff-rate`, or `--selling-price` only when buyer-confirmed; the collector retains them and skips the corresponding freight or tariff lookup.
- The collector resolves product details, MOQ, quantity/SKU unit cost, and `packageLogistics`. With `--profit`, it also collects retail image evidence; unresolved freight/duty share one bounded task through the `alibaba-logistics-assistant-buyer` backend (`ali_logistics_util`).
- It handles Windows JSON files and retries transient localized-detail failures up to three total attempts.
- Do not call, discover, refetch, extract, save, or poll an underlying source.
- Stop when `product` fails.

Use `product`, `product.attributes`, and `localizedDetail` for product terms, specifications, SKU attributes, MOQ, inventory summary, and tradability. Preserve `packageLogistics` packaging and quoted quantity/route scope; never present a different-quantity quote as the batch freight. In the next parallel enrichment batch, fetch the supplier profile once when `product.supplierId` is present:

```bash
product-analysis-evidence supplier-profile --supplier-id <supplierId> --product-id <productId>
```

Use the result for operating profile, category fit, scale, customization/QC, markets, transactions, fulfillment, certifications, and supplier reviews.
- Keep product standards and certifications in Product Details, not supplier credentials.
- Product specifications and credentials: preserve each returned status exactly.
- For conflicting or ambiguous status, write `status unconfirmed`.
- Never combine states, call an application a certification, or infer medical grade, efficacy, quality rank, or brand equivalence.
- If supplier data is unavailable, use embedded supplier context and omit unsupported fields.

Customs search:
- Run one targeted `WebSearch` in the parallel enrichment batch.
- Search ImportYeti, Panjiva, 52wmb.com, and customs.info with `product.supplierName`.
- Wait for the supplier profile only when the supplier name is absent.
- Accept only an exact identity match.
- Preserve the direct URL and returned shipment, product-description, party, and date scope.
- Do not infer OEM relationships, quality, compliance, capability, volume, or this SKU's history.
- If no exact match exists, omit customs from the report.

### 2. Analyze reviews

Review rules:
- Use only this product's or supplier's returned review evidence.
- Keep product score, count, themes, and feedback separate from supplier service and fulfillment signals.
- Do not use social media, forums, third-party reputation, similar-product reviews, specifications, or certifications as review evidence.
- Do not infer return rates or health efficacy.
- Show at most six representative reviews.
- Preserve rating, market, date, and verified-purchase labels only when returned.
- For 1-2 reviews, describe them individually without trends.
- For 3-9, summarize repeated themes without extrapolation.
- For 10+, report supported frequencies without inventing percentages.
- Quote only returned text. Add source metadata and a faithful localized translation when needed.
- Omit unsupported metrics, quotes, and rows.

### 3. Lower-priced similar products

Use the buyer-confirmed price for the matching SKU and quantity, otherwise `basis.unitCost`, as the comparison basis. Preserve returned price tiers and MOQ boundaries; do not replace them with a headline minimum.

1. Fingerprint category, use, material, dimensions, structure, core functions, and pack size; category, use, core structure, and buyer-required attributes are hard constraints.
2. Call `product_supplier_search` with `intent_type: "product"`, a concise query, buyer-language code, and `mainImageUrl` as `reference_image`.
   - Use text-only search only when no image URL exists.
   - Do not load its skill body or pivot to suppliers.
   - Select up to ten plausible candidates from the search evidence.
   - If search exposes fewer than five plausible IDs, retry once using broader non-core attributes before fetching details.
   - Do not emit intermediate renderer or follow-up text.
3. Reuse returned IDs, titles, URLs, images, prices, MOQ, units, and matching attributes.
   - Before any detail call, exclude missing IDs, the analyzed product, duplicates, hard-constraint mismatches, MOQ above the requested quantity, and higher prices on a comparable unit basis. Matching tags never override contradictory product facts.
   - If search evidence supports eligibility and presentation, skip detail fetching. Missing quantity-tier quotes alone do not justify refetching; retain listed ranges without exact savings.
   - Only when missing or conflicting facts could change a remaining candidate's eligibility, fetch those IDs once in one batch after search:
   ```bash
   product-analysis-evidence similar-products --product-id <id_1> --product-id <id_2> --product-id <id_3>
   ```
   Read compact rows through `fields` and merge with existing evidence. Never prefetch, refetch, call per candidate, or call `fetch_product_info` directly. If a hard constraint remains unresolved, exclude the candidate.
4. Normalize quantity tier, selling unit, pack size, currency, and trade term.
   - Treat a price as applying to its returned selling unit.
   - MOQ is an eligibility threshold, not pack count. Never divide by MOQ.
   - Divide only when evidence gives a bundle total and count.
   - Never compare a headline floor price with a quantity-tier price.
   - Keep a lower-priced candidate only when its normalized price at the requested quantity is below the analyzed product's unit cost; an unresolved or overlapping range does not qualify.
   - Prefer the analyzed product's selling unit.
   - Retain otherwise comparable candidates with unresolved unit/tier pricing only as unranked references, labeling the listed range, units, and pack basis.
   - Claim savings only when explicit pack evidence permits normalization.
5. Classify candidates as `highly similar`, `partial substitute`, or `not comparable`; exclude the last group and any unusable or likely infringing listing.
6. Rank 3-10 same-unit candidates by comparable unit price ascending.
   - Place unit/tier references afterward without low-price ranking or savings claims.
   - Show savings only for normalized same-unit prices.
   - Always show MOQ, unit, pack basis, matched attributes, image, and source URL.
   - If fewer than three qualify after evidence evaluation, show all valid candidates; do not fetch details merely to fill the table.

Before writing report config, classify the search evidence and any needed detail results into qualified lower-priced products, labeled pricing references, or exclusions. A detail call is not a completion requirement; a renderer card alone is not evidence.

Section output:
- Title it **Lower-priced Similar Products** or **低价同款** in Chinese.
- Summarize current unit price, lowest same-unit price, unit difference, batch savings, and scope.
- Never present a partial substitute as an exact match or product-line strategy.
- With no qualified lower-priced match, state this once and show only eligible pricing references with their comparison limits.
- With no match at all, show only the current product price and comparison scope.

## Report Contract

Write the report after the requested evidence and any requested calculation resolve:
1. Skip intermediate recaps and checklists.
2. Set `page.title` and hero `title` to `product.productName` verbatim.
3. Do not translate, rewrite, shorten, or decorate the product name.
4. Preserve template block and column shapes. Without profit analysis, omit `table.profit_calculator`, title Section 2 `Commercial Opportunities` (`2. 商业机会分析` in Chinese), and use its existing summary/evidence blocks for sourced product, purchase, and supply findings; omit profit KPIs and retail-price requirements.
5. Replace every placeholder with a sourced fact or adopted commercial assumption.
6. Omit unsupported optional rows.
7. For requested profit, apply the calculation and report requirements in `references/profit-analysis.md`.
8. Produce valid JSON and write it once to `<workspace>/<slug>-product-analysis.config.json`; escape ASCII quotes in strings or use typographic quotes.

For an existing report, reuse prior facts. If the complete config exists, read it once and overwrite it once. Do not use partial reads, Grep, or Edit.

After `Write` succeeds, run:

```bash
html-report-generate --config <absolute-config-path> --output <absolute-html-path>
```

Present the HTML as the only artifact. Do not create raw-data, calculator, record, dependency, verification, or browser artifacts.

Visible-language rules:
- Localize labels and section titles to the buyer's language.
- Preserve proper nouns and source text when translation would alter evidence.
- Write as a professional e-commerce market analyst.
- Lead with market facts, landed-cost economics, supplier evidence, and customer signals.
- State dates, assumptions, scope, and commercial implications directly.
- Translate source data into fluent business prose.
- Remove self-referential disclaimers, internal status commentary, vague caveats, and unsupported advice.
- Do not say evidence is insufficient, unavailable, missing, pending, unverified, or not obtained.
- Do not expose raw fields, `snake_case`, `key=value`, tool names, rendering steps, fallback mechanics, or internal workflow.
- Do not narrate execution with `tool`, `API`, `command`, `call`, `returned by`, `benchmark returned`, `model output`, `fallback`, `retry`, `parser`, `renderer`, or localized equivalents.
- Use neutral evidence language. Avoid hype, superlatives, exclamation marks, first-person ownership, and directive recommendations.
- Avoid unsupported phrases such as `industry-leading`, `same factory`, `only viable`, `price war`, or `huge loss`.
- Never use disclaimers such as “this report only uses platform data,” “not responsible for external data,” or “for reference only.”

For Chinese, use these exact titles:
1. `1. 商品信息总结`
2. `2. 利润 / 机会点分析` when profit is requested; otherwise `2. 商业机会分析`
3. `3. 商家画像`
4. `4. 商品商家评价`
5. `5. 低价同款`

Overall Assessment is unnumbered. Keep the core sections in this order:

- **Overall Assessment** - cover product, market, supply, and reviews; include profit only when calculated. Use observed facts, explicit assumptions, and commercial implications. Do not use directive labels such as `Proceed`, `Trial order`, `Hold`, or `Avoid`.
1. **Product Information Summary** - one five-row snapshot: product/use, specifications/material, purchase terms, delivery/shipping, and returned compliance facts.
2. **Profit / Opportunity Analysis** (profit requested; otherwise use the Commercial Opportunities contract above)
3. **Supplier Profile**
   - Show one factual summary and a 6-10 row evidence/source/impact table.
   - Cover entity, platform verification and limits, category fit, scale, customization/QC, markets, fulfillment, credentials, and evidenced material risks.
   - Add customs/export only for an exact match. Otherwise omit it and all no-result commentary.
4. **Product & Supplier Review Analysis**
   - Show the conclusion, evidence metrics, optional returned buyer voices, and evidence-linked checks.
   - Keep product experience separate from supplier service.
   - Never use external or similar-product reviews or create a separate quote card.
5. **Lower-priced Similar Products**
   - Use the validated candidates, ranking, and section output from Workflow step 3; omit count commentary when fewer than three qualify.
- End Section 5 with one **Sources and Methodology** block: direct source links, retrieval date, estimate methods, and data-as-of scope.
- Never expose internal tool, command, API, or wrapper names there.

Presentation rules:
- Copy each product's returned image and page URLs unchanged; never reconstruct or mix URLs across candidates.
- Link product images to returned product pages in a new tab with `rel="noopener noreferrer"`.
- Keep each fact in one primary block. Do not repeat decisions, KPIs, supplier metrics, or caveats.
- `Verified Supplier` is not due diligence.
- Never claim the report or supplier was verified, validated, audited, independently reviewed, or passed verification.
- Do not expose internal IDs, raw fields, tools, commands, or slot markers.

After the HTML, write a compact factual brief in the buyer's language. Do not return a risk-only summary or duplicate the report. Keep the linked title and brief within eight non-empty lines, excluding follow-up tags:

- **Overall Assessment** — summarize the strongest commercial facts and adopted assumptions without a directive recommendation.
- **Analysis Completed** — state only the completed scope: product and purchase terms, supplier/review evidence, lower-priced similar products, and profit when calculated.
- **Key Findings** — give three sourced bullets covering the completed analysis; include commercially relevant numbers and label estimates.
- **Commercial Scope** — state the market, channel, quantity basis, date, and calculation scope when applicable.

Append 2-5 buyer-language follow-ups as one contiguous `<follow>...</follow>` block after the brief.

Start with the linked report title. Keep caveats beside the affected finding, then append the follow-up tags. Never emit a `:::slot[...]` marker.

Render rules:
- Call `html-report-generate` directly without discovery or `--help`.
- On strict-validation failure, use the error once to replace the complete config and render once more.
- Never use incremental edit loops or a third render attempt.
