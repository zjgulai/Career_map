---
name: supplier-verification-report
version: 0.7.6
description: >
  Single-supplier due diligence report for Accio Alibaba.com B2B buyers.
  IMPORTANT: When this skill is triggered, READ THIS FILE FIRST to get exact tool names and parameter formats before making any CLI calls.
  Tool names: supplier_verification_recall (params: supplier_name, candidates_only), supplier_verification_detail (param: comp_id_list; accepts exact company_id/comp_id), fetch_product_info (param envelope: fieldName_3.payload.product_list; use only to resolve productId/prod_id to company ID), verify_urls (param: urls).
  Plugin CLI: supplier-verification-report-draft.
  Trigger when user asks to verify/vet one supplier (verify / vet / background-check / due diligence).
  Not for multi-supplier comparison — use write-compare-report instead.
---

# Alibaba.com Supplier Verification Report

> **Hard gate — HTML artifact before buyer reply**: After composing the verification report, generate `sourcing-plans/<slug>/supplier-verification.html` through `html-report-generator` and pass only the HTML file to `present_files` before the buyer-visible response. Full procedure: [Artifact persist](#artifact-persist).

> **Key constraints**
>
> 1. **Read first, call second.** Read this SKILL file completely before making any tool calls. Use the EXACT tool names and parameter names shown below — do not guess or use camelCase variants.
> 2. **Exact tool signatures:**
>    - `supplier_verification_recall` — params: `supplier_name` (string), `candidates_only` (boolean; use `true` for this skill)
>    - `supplier_verification_detail` — param: `comp_id_list` (list of strings; use directly when the input is an exact `company_id` / `comp_id`)
>    - `fetch_product_info` — param envelope: `fieldName_3.payload.product_list[]`, each item with `productId` and `dataSource`; use only when the input is an exact `productId` / `prod_id` or Alibaba product URL and supplier company ID must be resolved first
> 3. **MCP tool invocation format**: `accio-mcp-cli call <tool_name> --json '{...}'`
> 4. **Plugin CLI invocation format**: macOS/Linux may use `supplier-verification-report-draft --json '{...}'`; Windows PowerShell MUST write the unchanged JSON object to a UTF-8 temporary file and use `supplier-verification-report-draft --json-file <path>`. This is a plugin CLI command, not an MCP tool. Do not call it with `accio-mcp-cli call`, and do not convert it to snake_case such as `supplier_verification_report_draft`.
> 5. **Data confidentiality**: Internal IDs, raw field names, and tool endpoint names must NOT appear in the final report. Translate raw data into buyer-friendly natural language.
> 6. **Output format**: This skill ALWAYS produces a complete supplier-verification HTML report artifact through `html-report-generator` (using the HTML config content template in Step 8). Inside active SuperSourcing (`status == "executing"`), persist the HTML artifact and return control without buyer-visible output; the orchestrator owns stage rendering. Otherwise the final user-facing response contains a concise verification summary plus the generated HTML report link; the HTML itself contains the full report content — complete structure, evidence, tables, links, source labels, and recommended actions.
> 7. **Single-language output**: The entire report must use ONE language only, matching `requested_report_language` unless the user explicitly asks for a different final report language. Before writing, decide the report language once and use it for every heading, table label, paragraph, inference, and recommendation. Translate or paraphrase source-language content into the report language; do not copy registry snippets, business scopes, addresses, risk descriptions, or platform text in a different language. For English reports, Chinese characters are not allowed except inside verified source URLs. For Chinese reports, English prose/sentences are not allowed; URLs, certificate codes, model numbers, brand names, and official legal names may remain unchanged when translation would change the identifier.
> 8. **Standalone chat closing**: After the summary and report link, apply the Follow-up Output Rules. Buyer next-step choices must be literal contiguous `<follow>...</follow>` tags, never a Markdown list or `:::` block. Keep the HTML report's Recommended Actions as report content; chips belong only to the chat reply. SuperSourcing and `ask_user` turns retain their no-chips rules.

---

## Step 0 — Capture buyer context from conversation

Before starting, extract from the user's query and conversation history:
- **What product** the buyer intends to purchase (product name, link, category).
- **Any specific requirements** (certifications needed, target market, MOQ, etc.).

This context is used throughout the report for personalized analysis.

---

## Step 1 — Resolve supplier identifier from user input

The user may provide a supplier name, a storefront URL, an exact supplier
`company_id` / `comp_id`, an exact Alibaba `productId` / `prod_id`, an Alibaba
product URL, or select a supplier/product card.

Extract the supplier identifier, then proceed to Step 2.

Resolution rules:
- Alibaba product URL -> extract the product ID from the URL, then use the
  product-ID route in Step 2. Do not pass product URLs to
  `supplier_verification_recall`.
- Storefront URL -> pass directly to `supplier_verification_recall`; the tool
  auto-extracts the supplier token.
- Supplier card -> read the **full official supplier name** from card metadata.
- Product card -> read `productId` / `prod_id` from card metadata, then use the
  product-ID route in Step 2.
- Exact company ID input -> if the user explicitly labels the value as
  `company_id`, `companyId`, `comp_id`, or `compId`, or if the selected supplier
  card metadata provides a supplier/company ID, treat it as an internal exact
  company ID and skip recall.
- Exact product ID input -> if the user explicitly labels the value as
  `productId`, `product_id`, `prod_id`, or `prodId`, treat it as an internal
  product ID and resolve the supplier company ID through `fetch_product_info`
  before verification. Do not pass product IDs directly to
  `supplier_verification_detail`.
- Free-text input -> use the fullest name possible to maximize recall accuracy.
- Ambiguous numeric-only input -> do not assume it is a company ID. Ask for
  clarification or use nearby context only when it clearly identifies the value
  as a supplier/company ID or product ID. Do not treat `productId` / `prod_id`
  as a company ID.

---

## Step 2 — Resolve company ID, recall candidates, or resolve product ID

If Step 1 resolved an exact `company_id` / `comp_id`, **skip
`supplier_verification_recall`** and carry the ID directly to Step 3:

```bash
accio-mcp-cli call supplier_verification_detail \
  --json '{"comp_id_list":["<company_id>"]}'
```

Use this direct-detail route only for explicit supplier/company IDs. Keep the ID
internal and do not expose it in the buyer-facing report.

If Step 1 resolved an exact Alibaba `productId` / `prod_id` or product URL,
first call `fetch_product_info` to resolve the supplier company ID:

```bash
accio-mcp-cli call fetch_product_info --json '{
  "fieldName_3": {"payload": {"product_list": [
    {"productId": "<product_id>", "dataSource": "Alibaba.com"}
  ]}}
}' --raw
```

Extract the supplier company ID from the product result (`companyId`,
`company_id`, `comp_id`, or the equivalent company/supplier identifier present
in the tool output), then call detail with that ID:

```bash
accio-mcp-cli call supplier_verification_detail \
  --json '{"comp_id_list":["<company_id_from_product>"]}'
```

Use `fetch_product_info` only as a transient ID resolver in this skill. The
current tool contract for this skill has no documented field-projection
parameter, so do not add unofficial args such as `fields`, `only`, `select`, or
`return_fields`. Even if product, SKU, price, or review fields are returned,
discard them unless a small piece of product context is needed for buyer
relevance; do not copy raw product fields into the verification report.

If Step 1 resolved a supplier name or storefront URL, call
`supplier_verification_recall`:

```bash
accio-mcp-cli call supplier_verification_recall \
  --json '{"supplier_name":"<supplier name or storefront URL>","candidates_only":true}'
```

### Handling empty recall

If `payload.candidates` is empty:
1. Retry with the **full official supplier name** from card metadata.
2. If a storefront URL is available, pass it instead.
3. If still empty, inform the user that no matching record was found.

### Response data

Use `payload.candidates[].company_id` to identify the supplier IDs for Step 3.
This skill uses `candidates_only:true` to avoid loading verbose recall context
into the agent; `supplier_verification_detail` is the primary structured MCP
data source for the report. Do not expose `company_id` in the final buyer-facing
report.

---

## Step 3 — Call `supplier_verification_detail`

If Step 2 already called `supplier_verification_detail` through the direct exact
ID route or product-ID resolver route, reuse that detail result and continue to
Step 4.

Otherwise, from recall, extract `company_id` from each item in
`payload.candidates`, then:

```bash
accio-mcp-cli call supplier_verification_detail \
  --json '{"comp_id_list":["<id_1>","<id_2>"]}'
```

Join detail results with the candidate identity fields from recall to build the
full supplier profile.

---

## SuperSourcing Batch Mode

When invoked by an active SuperSourcing `verify` node, verify the supplied ordered recommendation set as one batch:

- Deduplicate by `companyId`, then normalized official company name. Reuse known company IDs and call detail directly; recall only suppliers that lack an ID.
- Batch supported detail calls, preserve successful rows, and retry only failures allowed by this Skill. Read each externalized detail result once and reuse it.
- Apply the external-research budget to the whole batch. Run independent identity resolution and corroboration in parallel when their inputs are known.
- Compose all supplier sections before file I/O. Write the first complete `supplier-verification.config.json` once and render one `supplier-verification.html`; parallel work never writes the shared artifact.
- Return one `verificationResults` row per recommendation with `companyId`, `companyName`, and `verified|partial|failed`. Persist the artifact without presenting files, follow-up chips, or standalone closing text.

Standalone verification keeps the per-supplier flow below unchanged.

---

## Step 4 — External corroboration

Run external checks to supplement MCP data with registry info, customs records, and digital footprint evidence.

**Batch budget in SuperSourcing; per-supplier budget otherwise**: `WebSearch` <= 3 rounds, `WebFetch` <= 5 URLs
**Tools**: external checks use `WebSearch` and `WebFetch` only — never launch a browser-automation/browser-use tool; if a page cannot be read through `WebFetch`, treat that evidence as unavailable instead of escalating.
**Efficiency**: Combine searches where possible (e.g., one search for "company name + aiqicha" covers registry). Avoid redundant searches for data already obtained from MCP tools in Steps 2-3.

### Alibaba in-site fetch priority

When `company_minisite_url` is available from recall candidates or detail data:
1. WebFetch `company_minisite_url` first.
2. Also try the Alibaba company profile URL:
   `<company_minisite_url>/company_profile.html`
3. If the site exposes a different actual profile link, use that checked profile
   link instead of guessing additional URLs.
4. Use whichever checked Alibaba URL actually supports each badge, certificate,
   company profile, platform, or productivity claim.
5. If both the storefront page and profile page support different claims, cite
   both in the relevant section.
6. If the profile URL fails or does not support the claim, fall back to the
   storefront URL when it supports the claim.

**Recommended domains** (not exhaustive — use judgment for other credible sources):
- Trade platforms: `*.alibaba.com`, `*.made-in-china.com`, `*.globalsources.com`
- Customs: `importyeti.com`, `panjiva.com`
- Business registry: `aiqicha.baidu.com`, `qcc.com`, `www.gsxt.gov.cn`, `opencorporates.com`
- Certifications: `www.iafcertsearch.org`
- Digital footprint: Company official websites, `linkedin.com`, `youtube.com`, exhibition platforms, industry directories

**Key search objectives**:
1. **Registry & risk**: Business registration, administrative penalties, abnormal operations.
2. **Customs**: Import/export records (recent buyers, shipment volume, trade activity).
3. **Digital footprint**: Official website, cooperation cases, exhibition records, industry awards, social media.

### Link quality gate

Only include a link in the report when you can confirm:
1. The URL returns a valid page (not 404 or redirect to unrelated content).
2. The page content directly supports the specific claim being made.
3. The data shown is consistent with what you report in other sections.

When a link fails any check, describe the finding in plain text and apply the fallback rules in Section A of Output Quality Rules.

If budget exhausted, mark the module as "data pending".

---

## Step 5 — Call `supplier-verification-report-draft`

**Hard gate**: After detail and external corroboration, and before writing the
final report, call the installed plugin CLI command directly to build a compact
writing plan for high-risk sections.

Correct macOS/Linux command form:

```bash
supplier-verification-report-draft --json '{"user_query":"<original user request>","requested_report_language":"<requested_report_language>","report_language":"<report_language>","business_registry_data":{"rows":[{"item":"<verified registry field>","content":"<specific verified content>","analysis_hint":"<meaningful risk/comparison analysis>"}]},"certifications":{"source":{"type":"<source type>","storefront_url":"<checked storefront URL>","profile_url":"<Alibaba company profile URL>","external_source_name":"<source name>","external_url":"<checked external source URL>"},"rows":[{"name":"<certificate name>","validity":"<validity or expiry>","significance_hint":"<buyer-relevant significance>"}]}}}'
```

Correct Windows PowerShell command form:

```powershell
$payload = @'
{"user_query":"<original user request>","requested_report_language":"<requested_report_language>","report_language":"<report_language>","business_registry_data":{"rows":[{"item":"<verified registry field>","content":"<specific verified content>","analysis_hint":"<meaningful risk/comparison analysis>"}]},"certifications":{"source":{"type":"<source type>","storefront_url":"<checked storefront URL>","profile_url":"<Alibaba company profile URL>","external_source_name":"<source name>","external_url":"<checked external source URL>"},"rows":[{"name":"<certificate name>","validity":"<validity or expiry>","significance_hint":"<buyer-relevant significance>"}]}}}
'@
$payloadPath = Join-Path $env:TEMP 'supplier_verification_draft.json'
Set-Content -LiteralPath $payloadPath -Value $payload -Encoding UTF8
supplier-verification-report-draft --json-file $payloadPath
```

Never pass inline JSON to this command from Windows PowerShell. The CLI accepts
PowerShell's UTF-8 BOM and removes the temporary payload file after parsing it.

Wrong command forms:
- `accio-mcp-cli call supplier_verification_report_draft --json '{...}'`
- `accio-mcp-cli call supplier-verification-report-draft --json '{...}'`
- `supplier_verification_report_draft --json '{...}'`
- Windows PowerShell: `supplier-verification-report-draft --json '{...}'`

Required behavior:
1. Do not pass the complete report content to this tool. Pass only compact
   structured facts for language, Business Registry Data, and Certifications.
2. Use the returned `report_language` as internal state only; do not print a
   visible language declaration in the report.
3. In Business Registry Data, write only rows returned in
   `business_registry_data.rows`; never write `omitted_fields`.
4. In Certifications, write only rows returned in `certifications.rows`. Use the
   returned source rule to form the certificate lead-in; if rows is empty, state
   briefly that no usable certificate records were found and do not invent names.
5. Apply `format_rules.banned_phrases` and `format_rules.omit_rule` while writing
   the final report. Never output placeholders such as "Verified via Platform",
   "Verified via Alibaba", "Not public verified", "Projected", or "Redacted".
6. This draft JSON is internal only. Do not include it in the buyer-visible
   report.

---

## Step 6 — Route information to correct sections

Before writing the report, classify ALL findings from Steps 2, 3, 4, and 5 into the correct section using this routing table:

| Information type | Belongs in | NOT in |
| :--- | :--- | :--- |
| Legal disputes, lawsuits, administrative penalties, blacklists | Section 1 → Risk Records | Digital Footprint |
| Business registration, USCC, capital, scope, address | Section 1 → Business Registry | Digital Footprint |
| Certificates (ISO, IATF, etc.) | Section 1 → Certifications | Digital Footprint |
| Company website, social media, exhibitions, YouTube, awards | Section 2 → Digital Footprint | — |
| Alibaba seller score, response time, platform years, categories | Section 3 → Platform Profile | Digital Footprint |
| Customs shipments, bills of lading, buyer names, trade volume | Section 4 → Customs Records | Digital Footprint |

If a finding was discovered during web search but belongs to another section per this table, place it there — not in Digital Footprint.

## Step 7 — Cross-analysis

Use all available supplier data from recall, detail, external corroboration, compact draft, and Step 6 routing. Focus on whichever dimensions have the strongest signal:

1. **Entity Type Determination** — Factory | Trading Company | Manufacturer & Trader | etc.
2. **Product / Category Consistency** — platform claims vs. registry scope vs. customs descriptions.
3. **Operational Health** — longevity, platform score, registry status, risk signals.
4. **Certification Relevance** — held certifications vs. buyer's procurement needs.
5. **Trade Activity** — customs patterns, buyer diversity, consistency with platform claims.

---

## Step 8 — Output report

**Language**: Choose `requested_report_language` from the user's query/conversation: this is the language the user requested or implicitly expects for the report. Set `report_language` to the same language unless the user explicitly asks for a different final report language. The report must be in ONE language only — no mixing. Keep both language values as internal state only; do not print a visible language declaration in the report.

Before final output:
1. Translate or paraphrase all MCP, registry, webpage, and customs source text into `report_language`.
2. Keep only language-neutral identifiers unchanged: URLs, certificate codes, model numbers, brand names, and official legal names where exact identity matters.
3. Do not paste Chinese business scopes, addresses, registry descriptions, risk records, or platform snippets into an English report. Translate them.
4. Do not paste English prose/webpage snippets into a Chinese report. Translate them.

**Tone**: Neutral, evidence-based. **Strictly No Emojis** — Final report must not contain any emojis.

### HTML config content template

Compose the full report directly as semantic HTML JSON config. The content below is the report blueprint in HTML config form: keep the same sections, order, evidence rules, tables, analytical summaries, source attribution, and final reminder. Use `description` for the analytical paragraph that belongs to the relevant section/table/block, and prefix that text with `**AI Inference:**` when the source template calls for AI Inference.

```json
{
  "version": "1.0",
  "reportType": "supplier_verification",
  "page": {
    "title": "{Verification Report}: {Company Name}",
    "language": "{report_language}"
  },
  "blocks": [
    {
      "type": "hero",
      "kicker": "{Verification Report}",
      "title": "{Verification Report}: {Company Name}",
      "subtitle": "Neutral, evidence-based supplier verification report.",
      "tags": [
        "{Entity type: Factory | Trading Company | Manufacturer & Trader | ...}",
        "{Main product/category}",
        "{Report date}"
      ]
    },
    {
      "type": "section",
      "level": 2,
      "title": "{Overall Assessment}",
      "meta": [
        { "label": "Entity Type", "value": "{Factory | Trading Company | Manufacturer & Trader | ...}" },
        { "label": "Alibaba Verified Badge", "value": "{Only state Verified Manufacturer / Brand Holder / Multispecialty Supplier / Service Provider when that badge is visibly shown on the checked Alibaba storefront/profile page; otherwise omit this meta item. Prefer company_minisite_url from recall/detail. category_verified alone is not an Alibaba Verified badge.}" }
      ]
    },
    {
      "type": "list.insight",
      "header": { "title": "{Core Findings}" },
      "items": [
        { "label": "Finding 1", "content": "{Point 1: Key finding about the entity. **Bold only decisive conclusions selectively**.}", "tone": "neutral" },
        { "label": "Finding 2", "content": "{Point 2: Business registration status and risk assessment.}", "tone": "neutral" },
        { "label": "Finding 3", "content": "{Point 3: Main product consistency with buyer's needs and trade activity.}", "tone": "neutral" },
        { "label": "Finding 4", "content": "{Optional: Distinctive characteristics or trade logistics patterns.}", "tone": "neutral" }
      ]
    },
    {
      "type": "text.panel",
      "variant": "emphasized",
      "header": { "title": "{AI Portrait}" },
      "content": "**{One-sentence description of the supplier's business essence and core competency.}**"
    },
    {
      "type": "section",
      "level": 2,
      "title": "1. {Registry & Productivity Verification}",
      "description": "Registry, risk, certification, and productivity evidence for this supplier. Data sources are shown on the specific blocks that use them."
    },
    {
      "type": "table.key_value",
      "header": {
        "title": "{Business Registry Data}",
        "description": "Only include rows that have specific, verified content and meaningful comparison/risk analysis. If a field was not found, could not be verified, or would only produce generic wording, omit the entire row. Keep cells informative; low-information placeholders such as Verified via Platform, Not publicly verified, N/A, Unknown, Not found, or unsupported suffixes such as Projected, Estimated, Redacted, or Undisclosed are not useful evidence.",
        "meta": [
          { "label": "Data Sources", "value": "[Alibaba]({checked_alibaba_profile_or_storefront_url}) / [{Registry source name}]({checked_source_url})" }
        ]
      },
      "columns": ["Verification Item", "Content", "Risk/Comparison Analysis"],
      "rows": [
        ["Legal Representative", "{Name}", "{Association assessment}"],
        ["Registered Capital", "{Amount}", "{Risk/Scale analysis}"],
        ["Establishment Date", "{Date}", "{Stability analysis}"],
        ["Enterprise Type", "{Type}", "{Entity nature}"],
        ["Business Scope", "{Scope}", "{Consistency with platform and buyer needs}"],
        ["Registered Address", "{Address}", "{Industrial belt analysis}"],
        ["Factory Area/Site Scale", "{Area}", "{Production capability assessment}"],
        ["USCC", "{Code}", "{Verification status}"],
        ["{Meaningful additional item such as parent company, branch office, or import/export license}", "{Verified content}", "{Risk/comparison analysis}"]
      ]
    },
    {
      "type": "text.panel",
      "variant": "neutral",
      "header": {
        "title": "{Risk Records}",
        "meta": [
          { "label": "Data Source", "value": { "text": "{Registry/court/penalty source name}", "url": "{checked_risk_source_url}" } }
        ]
      },
      "content": "{If no risks: one concise paragraph stating clean record. If risks exist: describe or table them with impact assessment. Include checked source links in this block's meta, content, or an adjacent table row.}"
    },
    {
      "type": "table.data",
      "header": {
        "title": "{Certifications}",
        "description": "If no certificates exist, state briefly in this block's description and leave rows empty or omit this block. If certificates exist, use the lead-in wording in this description and show a 3-column table. supplier_verification_detail may provide certificate data through certifications and certification_names, but it does not provide a dedicated certificate source URL.",
        "meta": [
          { "label": "Data Source", "value": { "text": "{Alibaba company profile / storefront / external certification source}", "url": "{checked_certificate_or_profile_source_url}" } }
        ]
      },
      "columns": [
        { "key": "certificate", "label": "Certificate Name", "type": "link" },
        { "key": "validity", "label": "Validity", "type": "text" },
        { "key": "significance", "label": "Significance to Your Sourcing", "type": "text" }
      ],
      "rows": [
        {
          "certificate": { "text": "{Cert Name}", "url": "{checked_certificate_or_profile_source_url}" },
          "validity": "{Expiry Date}",
          "significance": "{Value tied to buyer's needs}"
        }
      ],
      "description": "Certification source rules: if supplier_verification_detail returns non-empty certificate data, include the supplier's Alibaba company profile URL in the certificate lead-in. Use the actual profile link if discovered from the fetched site; otherwise derive it from company_minisite_url as <company_minisite_url>/company_profile.html. Still WebFetch/check Alibaba in-site pages per Step 4. If certificate/profile evidence is visible on the storefront homepage, include the storefront URL too; if evidence is visible on both storefront and profile pages, cite both URLs. If WebFetch/checking of Alibaba in-site pages fails or returns no usable certificate/profile evidence, but supplier_verification_detail has non-empty certificate data, use the Alibaba company profile URL plus Alibaba structured supplier verification data as the fallback source. If certificates are confirmed from a certification database, registry page, or other external page, include that actual checked source URL as an additional source. Use a concrete linked source rather than unlinked generic phrases. Lead-in templates: Detail data + Alibaba profile fallback: According to this supplier's [Alibaba company profile]({alibaba_company_profile_url}) and Alibaba structured supplier verification data, the following certificates are listed. Detail data + Alibaba storefront and profile pages: According to this supplier's [Alibaba storefront]({checked_alibaba_storefront_url}), [Alibaba company profile]({alibaba_company_profile_url}), and Alibaba structured supplier verification data, the following certificates are listed. Detail data + Alibaba profile + external certification or registry source: According to this supplier's [Alibaba company profile]({alibaba_company_profile_url}), Alibaba structured supplier verification data, and [{source_name}]({checked_source_url}), the following certificates are listed. Detail data + Alibaba storefront + Alibaba profile + external certification or registry source: According to this supplier's [Alibaba storefront]({checked_alibaba_storefront_url}), [Alibaba company profile]({alibaba_company_profile_url}), Alibaba structured supplier verification data, and [{source_name}]({checked_source_url}), the following certificates are listed. External certification or registry source: According to [{source_name}]({checked_source_url}), the following certificates are listed.\n\n**AI Inference:** {Inference combining business health, certificate relevance, and productivity.}"
    },
    {
      "type": "section",
      "level": 2,
      "title": "2. {Digital Footprint}",
      "description": "Non-Alibaba evidence proving the supplier exists and is active outside the Alibaba ecosystem. Alibaba URLs belong in Section 3, ImportYeti/customs URLs belong in Section 4, and legal disputes belong in Section 1 Risk Records."
    },
    {
      "type": "table.data",
      "header": { "title": "{Digital Footprint}" },
      "columns": [
        { "key": "dimension", "label": "Dimension", "type": "text" },
        { "key": "finding", "label": "Finding", "type": "text" },
        { "key": "details", "label": "Link/Details", "type": "link" }
      ],
      "rows": [
        { "dimension": "Official Website", "finding": "{Activity analysis based on the page}", "details": { "text": "{domain}", "url": "{url}" } },
        { "dimension": "International Fairs", "finding": "{Specific exhibition names + years}", "details": { "text": "{Fair1 Year}", "url": "{url1}" } },
        { "dimension": "Industry Recognition/Awards", "finding": "{Specific award or ranking}", "details": { "text": "{Details}", "url": "{url}" } },
        { "dimension": "Cooperation Cases/Reviews", "finding": "{Specific partners or reviews}", "details": { "text": "{Source1}", "url": "{url1}" } },
        { "dimension": "Social Media/Video", "finding": "{All platforms found and what each page shows}", "details": { "text": "{Platform1}", "url": "{url1}" } }
      ],
      "description": "Build this table by inventorying verified links first. Before writing any row, list all URLs actually obtained and verified during Step 4. Determine each URL type from its domain: company's own domain = Official Website; social media domains such as LinkedIn, Facebook, Instagram, TikTok, X/Twitter, Pinterest = Social Media; YouTube/Vimeo = Social Media/Video; exhibition official sites or trade show directories = International Fairs; industry directories, news sites, patent databases, and government tech listings = Industry Recognition. Generate rows only from verified URLs, with Finding describing what was found on that page and Link display text matching the platform name. Discard anything without a matching verified URL.\n\n**AI Inference:** {Summary of digital footprint activity and what it signals about market position.}"
    },
    {
      "type": "section",
      "level": 2,
      "title": "3. {Platform Business Profile}",
      "description": "Start this section with one visible source lead-in when platform profile data exists, then write the profile findings. Data sources are shown on the Platform Profile Findings block."
    },
    {
      "type": "list.insight",
      "header": {
        "title": "{Platform Profile Findings}",
        "meta": [
          { "label": "Data Source", "value": { "text": "{Alibaba storefront/profile or structured supplier verification data}", "url": "{checked_or_derived_alibaba_url}" } }
        ]
      },
      "items": [
        { "label": "Identity & Scale", "content": "Platform name, location, years on platform, headcount, factory area.", "tone": "neutral" },
        { "label": "Business Scope", "content": "Main product categories.", "tone": "neutral" },
        { "label": "Trust Signals", "content": "Category verification, seller score, years active.", "tone": "neutral" },
        { "label": "Markets & Customers", "content": "Top markets with percentage shares, customer types, export volume.", "tone": "neutral" }
      ],
      "description": "Platform profile source rules: Alibaba storefront means the checked company_minisite_url page, usually the supplier homepage. Alibaba company profile means the actual profile link discovered from the fetched site, or <company_minisite_url>/company_profile.html when no actual profile link is discovered. Use checked URLs or URLs explicitly derived from company_minisite_url for Alibaba profile fallback. If storefront and company profile pages support different profile claims, cite both URLs in the lead-in; if only one checked Alibaba page is available, cite only that page. If profile facts come from supplier_verification_detail and Alibaba in-site WebFetch fails, cite the Alibaba company profile URL plus Alibaba structured supplier verification data as the fallback source. If no checked or derivable Alibaba URL is available, use Alibaba structured supplier verification data as the source. If no platform profile facts are available, omit this section's findings rather than writing a generic source sentence. Lead-in templates: Storefront only: According to this supplier's [Alibaba storefront]({checked_alibaba_storefront_url}), the platform profile shows. Company profile only: According to this supplier's [Alibaba company profile]({alibaba_company_profile_url}), the platform profile shows. Storefront + company profile: According to this supplier's [Alibaba storefront]({checked_alibaba_storefront_url}) and [Alibaba company profile]({alibaba_company_profile_url}), the platform profile shows. Detail data + company profile fallback: According to this supplier's [Alibaba company profile]({alibaba_company_profile_url}) and Alibaba structured supplier verification data, the platform profile shows. Detail data + storefront + company profile: According to this supplier's [Alibaba storefront]({checked_alibaba_storefront_url}), [Alibaba company profile]({alibaba_company_profile_url}), and Alibaba structured supplier verification data, the platform profile shows. Detail data only, no usable URL: According to Alibaba structured supplier verification data, the platform profile shows.\n\n**AI Inference:** {Summary of platform data alignment with actual business profile.}"
    },
    {
      "type": "section",
      "level": 2,
      "title": "4. {Customs Records}",
      "description": "Priority: always try ImportYeti first. If ImportYeti returns no results or 404 for this supplier, fall back to other customs data sources in this order: Panjiva, 52wmb.com, customs.info. Use whichever source returns valid data and show the Data Source on the first customs-data block that uses it. If none return data, write Data Source: public customs databases (no sea freight records found for this supplier) without a hyperlink in the Trade Activity block."
    },
    {
      "type": "table.key_value",
      "header": {
        "title": "{Trade Activity}",
        "meta": [
          { "label": "Data Source", "value": { "text": "{ImportYeti / Panjiva / 52wmb.com / customs.info / public customs databases}", "url": "{verified_customs_url}" } }
        ]
      },
      "columns": ["Metric", "Finding", "Assessment"],
      "rows": [
        ["Shipments (Last 12 Months)", "{N} batches", "{shipping method and routes}"],
        ["Trend", "{Stable | Increasing | Decreasing}", "{Trend assessment}"],
        ["Total Shipment Records", "{N} Bills of Lading", "{Coverage/limitations}"],
        ["No shipment records", "{Use only when no records exist}", "Clearly state this fact and explain why, such as product characteristics favoring air freight. Active trade claims must match the data shown here."]
      ]
    },
    {
      "type": "table.data",
      "header": {
        "title": "{Major Buyers}",
        "description": "Show up to 5 most recent buyers. Only include if data actually exists. Use the same customs source as the Trade Activity block unless this table uses a different checked source; if it uses a different checked source, add one Data Source meta item here."
      },
      "columns": [
        { "key": "buyer", "label": "Buyer Name", "type": "text" },
        { "key": "original_description", "label": "Original Product Description", "type": "text" },
        { "key": "translated_description", "label": "Buyer-Language Translation", "type": "text" },
        { "key": "recent_shipment", "label": "Recent Shipment", "type": "text" }
      ],
      "rows": [
        {
          "buyer": "{Buyer 1}",
          "original_description": "{Original description}",
          "translated_description": "{Translated description}",
          "recent_shipment": "{Date}"
        }
      ],
      "description": "**AI Inference:** {Analysis: Does customs data match platform claims? Explain data absence if applicable. This analysis must be consistent with the Trade Activity section above.}"
    },
    {
      "type": "list.action",
      "header": { "title": "{Recommended Actions}" },
      "items": [
        { "title": "{Action 1}", "description": "{Specific to buyer's product}", "priority": "high" },
        { "title": "{Action 2}", "description": "{Verification or capacity confirmation}", "priority": "medium" },
        { "title": "{Action 3}", "description": "{Contract/payment protection}", "priority": "medium" }
      ]
    },
    {
      "type": "text.source",
      "header": { "title": "{Gentle Reminder}" },
      "content": "{Data in this report is from 3rd-party public channels and official platform disclosures for decision-making assistance. Market risks exist; cooperate with caution.}"
    }
  ]
}
```

## Step 8.5 — HTML report artifact

For the saved HTML artifact, reference `html-report-generator` and follow that skill's own instructions for config shape, block selection, and rendering. This skill defines the supplier-verification content, evidence routing, and quality rules. Compose the complete report directly as semantic HTML JSON config. The HTML must satisfy all Step 8 content-template requirements and Output Quality Rules; it must not be a summary, reduced version, draft-derived version, or selectively shortened rendering.

HTML-specific constraints for this report:
- The HTML content must fully implement the Step 8 content template and preserve all required sections, section ordering, analytical summaries, evidence rows, tables, source attributions, and verified links.
- **Data source links are mandatory in HTML**: every URL used as evidence (registry detail pages, certification URLs, digital footprint pages, ImportYeti / customs pages, exhibition pages, official website, social media, Alibaba storefront/profile) must be retained in the HTML block that uses that evidence. Use one small visible `Data Source` / `Data Sources` meta line on the specific source-bearing data block, with multiple sources combined in that single value as markdown links separated by `/`. Row-level links can still be used for evidence cells that correspond to specific rows. The Certifications block must expose checked Alibaba profile/storefront or checked certificate source links through this same visible single-line `header.meta` source style, plus row-level source links when certificate rows are shown. When adjacent blocks use the same checked source, show the source on the first block that uses it and add another source meta only if a later block uses a different source.
- **Source attribution placement**: section blocks are structural separators. Put Data Source metadata on the concrete table, list, or text block that contains the sourced data; use section `meta` only when the section itself is the only block carrying that sourced content. Keep source attribution as one compact small-text line rather than separate source rows, repeated adjacent meta, a table, or a trailing sources appendix.
- In the HTML `hero`, put the supplier/entity type (Factory / Trading Company / Manufacturer & Trader / etc.) as the first `tags` item, together with other large tags such as report date and main category, so it is visually prominent rather than buried as a small table row or only in prose.
- Use tables, text blocks, and section blocks for the verification content.

---

## Output Quality Rules

### A. Link Quality (highest priority)

Every link in the report must pass a 3-point check before inclusion:
1. URL is accessible (200 response).
2. Page content directly supports the claim made.
3. Data on the page is consistent with other sections of the report.

**Fallback when a link fails the check:**
- Certificates → table has no link column; link goes in the note paragraph below the table.
- Digital footprint → remove the entire row.
- Data sources (e.g., ImportYeti) → omit the hyperlink, state findings in plain text.
- Registry source → if no valid detail/search-result URL is available, omit the registry hyperlink and keep source as plain text (e.g., "Registry source: Aiqicha/QCC, no link available").

Run a final link sweep before outputting the report.

### B. Content Integrity

- Base all claims on platform official data, fetched page content, or registry evidence.
- Keep all sections internally consistent — cross-check before finalizing (e.g., if customs shows no recent shipments, the AI Inference must reflect the same).
- When data is unavailable, state it honestly (e.g., "No shipping records found") and provide analytical reasoning (e.g., product characteristics favoring air freight).
- Always complete the report with available data; an empty module should not block the rest.
- Do not use generic placeholder claims to fill tables. If a row lacks concrete evidence, remove the row instead of writing vague content such as "Verified via Platform", "Verified via Alibaba", "Not publicly verified", "Not public verified", "Projected", "Estimated", "Redacted", or "Undisclosed".

### C. Formatting & Tone

- **Language**: Strictly single-language. The report language must match the user's query language, including languages other than English or Chinese. English reports must contain no Chinese characters except inside verified source URLs. Chinese reports must contain no English prose/sentences. For any other report language, translate or paraphrase source text into that same language; only URLs, certificate codes, model numbers, brand names, official legal names, and an original customs product description paired with its buyer-language translation may remain unchanged when needed for exact evidence.
- **Language self-check**: Before final output, scan the complete report config. All report content must match `report_language`. If any source-language text remains in the wrong language, translate it. If it cannot be translated safely, omit that sentence or row instead of mixing languages.
- **Tone**: Neutral, evidence-based, professional. No emojis.
- **Bolding**: Use sparingly — only for key conclusions or risk signals. In registry tables, bold the "Verification Item" column.
- **Dynamic display**: Only show rows/sections that have real data behind them. For tables, every displayed row must have concrete content in the content/finding cell and a specific analysis in the analysis cell; otherwise remove that row.
- **Entity type**: Always specify as the first `hero.tags` item and in the Overall Assessment section metadata; keep the decision-level entity assessment in Core Findings.
- **Analytical summaries**: Each section (1-4) ends with an analytical summary; in HTML, map this prose to the related block's `description` rather than an AI-specific field.
- **Buyer context**: Tie analysis back to the buyer's specific product and requirements (from Step 0).

### D. Information Boundaries

- Present all data in buyer-friendly natural language (no raw field names, tool names, or internal IDs).
- Describe the supplier's credibility through entity type + core findings (not through numeric scores or "High/Medium/Low" labels).
- End the report at “Recommended Actions” + “Gentle Reminder”. Keep source attribution on the specific data-bearing blocks described in Step 8.5; the report does not need a standalone source appendix at the very end.

---

## Artifact persist

> **SuperSourcing Batch mode:** compose once, write the first complete config once, and render once; skip standalone Steps 2-4. Steps 1 and 5-8 apply to both modes.

After the report content is fully composed (Step 8 + Output Quality Rules applied), **before** the buyer-visible response:

1. Resolve slug per [`sourcing-artifact-writer`](../sourcing-artifact-writer/SKILL.md) Path Strategy.
2. **Read `sourcing-plans/<slug>/supplier-verification.config.json` first.** The config is the editable source for `supplier-verification.html`; read it before changing it so existing supplier report blocks can be preserved. Treat file-not-found as the first-write signal.
3. **Update the config**:
   - **Config not found (first supplier)**: write a complete semantic HTML JSON config containing the full supplier verification report.
   - **Config already exists (subsequent standalone supplier)**: keep the existing config content intact and append the new supplier report to the existing `blocks` array. Add a visible separator block before the new report, for example a `section` block titled `Verification: <companyName> — <ISO timestamp>`, then append the complete new report blocks. Previous supplier report blocks remain above the separator.
4. **Verify after config update**: re-read `supplier-verification.config.json` and confirm it still contains all prior supplier report blocks plus the new supplier report blocks. If prior content is missing, reconstruct the config from context and rewrite it with all reports intact.
5. **Generate the HTML artifact from the config**: run `html-report-generate --config sourcing-plans/<slug>/supplier-verification.config.json --output sourcing-plans/<slug>/supplier-verification.html`.
6. **Render validation is the generation gate**: `html-report-generate` performs strict schema/render validation. Fix any `Render failed:` issue in the JSON config and rerun.
7. **Present the verification HTML artifact**: after render succeeds, pass only `sourcing-plans/<slug>/supplier-verification.html` to `present_files`. Config JSON, raw data/state JSON, folders, and intermediate files are internal-use-only.
8. **Buyer-visible response**:
   - **Inside active SuperSourcing (`status == "executing"`)**: return control after persisting the complete HTML artifact; the orchestrator owns the buyer-visible stage rendering.
   - **Standalone verification**: provide a concise verification handoff in the buyer's language with four visible parts: supplier name, one-sentence overall conclusion, a short summary explaining the key evidence and decision rationale, and the generated HTML report link. The summary should mention the main evidence coverage checked (registry/platform/digital footprint/customs as applicable) and the most important risk or confidence signal, without replacing the report. Append the file path tip per [`sourcing-artifact-writer`](../sourcing-artifact-writer/SKILL.md) Universal I/O Constraint #8. The HTML artifact contains the complete supplier verification report.

   - **Standalone next-step menu**: after all business content, start one contiguous `<follow>...</follow>` block on a new line, using the Follow-up Output Rules for count, language, and syntax. Choose actions from the actual findings, such as drafting certification/production questions, verifying an alternative supplier, or estimating trial-order landed cost. Do not repeat them as bullet points, put tags inside a code fence, append `:::`, or insert chips into the saved report. Skip this block on `ask_user` turns.

> Full spec for path conventions: see [`sourcing-artifact-writer`](../sourcing-artifact-writer/SKILL.md). HTML config/rendering details live in [`html-report-generator`](../html-report-generator/SKILL.md).
