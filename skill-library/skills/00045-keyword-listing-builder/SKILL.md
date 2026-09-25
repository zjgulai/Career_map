---
name: keyword-listing-builder
description: Build keyword-optimized Amazon listings (title, bullets, backend search terms) from search-volume data; Shopify copy reuses buyer language only. 用于写/优化 Listing、问该埋哪些关键词。
---

# Keyword & Listing Builder

Turn real Amazon search demand into a finished, keyword-optimized listing. This
skill pulls search volume + relevancy from the host's **Jungle Scout `js_*` MCP
tools**, builds a ranked keyword bank from seed terms and competitor ASINs, and
writes the title, bullets, and backend terms for Amazon — and the equivalent
SEO fields for Shopify/Google.

The payoff is copy that's *traceable to data*: every keyword choice maps to a
real search-volume and relevancy number, and nothing relevant gets wasted. Lean
on the MCP tools for all demand data and your own judgment for the copy.

All data comes from the host's Jungle Scout `js_*` MCP tools — you call the
tools and read JSON yourself. The tools this skill uses are
`js_keywords_by_keyword`, `js_keywords_by_asin`, and (optionally)
`js_share_of_voice` and `js_historical_search_volume`. If those tools aren't
available, say so and stop — do not substitute another data source or fabricate
search volumes.

## Language: separate buyer copy from user explanation

- Use the user's explicit requested language for the listing/SEO copy, including
  a draft in a different language from the marketplace. Only when no copy
  language is specified, use the target audience's language as a reasonable
  default. A US marketplace must not override a request for a Chinese draft.
- Keep the surrounding response and the explanatory sections of the same file
  in the user's established conversation language: keyword rationale, evidence
  table labels, source notes, risks, assumptions and next steps. A request for
  German copy in a Chinese conversation means German copy with Chinese
  explanation, not an entirely German response or document. An explicit request
  for the entire document in a language overrides this default separation.
- Preserve actual search keywords, brands, ASINs, URLs and machine-facing field
  keys verbatim. Optional translations must be separate glosses, not substitute
  keywords assigned the original term's search volume. Language-specific copy
  examples are patterns to adapt, not instructions to switch languages.
- For revision of an existing listing, preserve its original copy language
  unless the user requests translation; explain the changes in the user's
  conversation language.

## Step 1 — Gather inputs (ask only for what's missing)

You need enough to seed good keyword research. Infer what you can from the
request; ask concisely for the rest in one batch rather than interrogating.
Ask in plain conversation — or use an interactive question tool such as
`ask_user` when the host provides one, treating it as optional, never required.

- **What the product is** — a short description (you'll derive seed terms from
  it).
- **Seed keywords** — 1–5 phrases a shopper would search. Derive these from
  the product description if the user didn't give them.
- **Competitor ASINs** — 0–10. These are the single best input:
  `js_keywords_by_asin` returns the keywords competitors *actually rank for*,
  i.e. demand that's already proven. Encourage the user to provide a few if
  they can.
- **Channel** — Amazon listing, Shopify/Google SEO, or both. Default to Amazon
  if unsure, and offer the Shopify version.
- **Brand name** — for the title / SEO title.
- **Marketplace** — default `us`; one of us, uk, de, in, ca, fr, it, es, mx,
  jp.

## Step 2 — Pull and rank the keyword bank

Build one deduped, ranked table from the MCP tools:

1. **Competitor ASINs → `js_keywords_by_asin`.** Call it with up to 10 `asins`,
   sorted `-monthly_search_volume_exact`. Tag every keyword it returns with
   `from_competitor_asin = Y` — these are validated, proven demand.
2. **Seeds → `js_keywords_by_keyword`.** Call it for each seed (or combined
   `search_terms`), sorted `-monthly_search_volume_exact`.
3. **Merge and de-duplicate** by keyword `name`. Keep, per keyword: exact +
   broad monthly volume, `relevancy_score`, `ease_of_ranking_score` (higher =
   easier), `organic_product_count`, `sponsored_product_count`,
   `ppc_bid_exact`, `monthly_trend`/`quarterly_trend`, the
   `from_competitor_asin` flag, and a
   `priority_score = monthly_search_volume_exact × relevancy_score` for a
   first-pass sort.
4. **Filter noise:** drop keywords below a sensible volume floor (e.g. exact
   volume < 50).

Optional deepening: for a contested primary keyword, call `js_share_of_voice`
to see how crowded it is and the winning price band; call
`js_historical_search_volume` to check seasonality before committing the
listing to a seasonal term. Raise `max_results` and add more seeds for broad
products rather than relying on one.

## Step 3 — Tier the keywords, then write the copy

Read `references/listing_rules.md` and follow it. In short: sort the bank into
primary / secondary / long-tail / backend-only tiers (treating
`from_competitor_asin = Y` as validated demand and applying judgment over raw
`priority_score`), then build the requested fields:

Before writing, confirm which rules apply: the limits in
`references/listing_rules.md` are **default safe ranges** (Amazon US, general
categories; standard Shopify/Google practice — last verified 2026-08, and
platform rules change). If the environment provides web search, verify the
current official policy for the target channel first and prefer it over the
defaults; if the user named a category, that category's published style/limits
override the defaults too. If neither check is possible, apply the defaults
and say so in the output.

- **Amazon:** title (within the verified/default character limit, primary
  keyword front-loaded), five benefit-led bullets weaving in secondary +
  long-tail keywords, and backend search terms (within the verified/default
  byte limit, only keywords *not* already used elsewhere, spaces not commas).
- **Shopify/Google:** SEO page title, meta description, URL handle, H1, body
  copy, image alt text, and tags — moving the "backend" synonyms into
  body/alt/tags since there's no hidden field. Borrow the *language* of the
  Amazon keyword bank, but never present Amazon volumes, relevancy, or
  competition scores as Google search volume, search intent, competition, or
  ranking opportunity — the bank supports Amazon-side demand conclusions only.
  If the user asks for Google SEO conclusions (e.g. "will this page rank on
  Google?"), state that a dedicated Search/SEO data source is required for
  that, and use one when the environment provides it; otherwise deliver the
  copy as language-informed and flag the missing Google data.

Write for a human first; keywords should disappear into natural sentences.
Respect and report every character/byte limit actually applied, and whether it
was verified against current policy or applied as a default.

## Step 4 — Deliver

Produce a single Markdown document. If the environment has a writable
workspace, save it there and present a clickable file link; otherwise deliver
it inline in the chat. Do not assume a specific client or a fixed workspace
name. The document contains:

1. **The listing copy** — each requested field, clearly labeled, with its
   character or byte count noted (e.g. "Title — 187/200 chars").
2. **Keyword evidence table** — the keywords you used, with exact monthly
   search volume, relevancy, competitor-validated flag, and where each one was
   placed (title / bullet n / backend / body / alt / tag). This is what makes
   the listing defensible: the user can see the demand behind every choice.
3. **Leftover opportunities** — a short note on strong keywords you couldn't
   fit, so the user can use them in ads or future variants.
4. **Data boundaries & confidence** — a short block stating: which field
   limits were verified against current official policy and which were applied
   as defaults (with the 2026-08 verification date); that Amazon keyword
   metrics describe Amazon demand only; and every inferred conclusion (tiering
   choices, winnability reads, any Shopify/Google expectation) with its
   evidence, assumptions, and a confidence level.

Then briefly offer obvious next steps (e.g. a Shopify version if you only did
Amazon, an A/B title variant, or a deeper pull with more competitor ASINs).

## MCP errors and empty results

- An empty `data[]` is a successful call with no records (**observed empty**) —
  it is not proof of zero demand. If a tool returns nothing for a seed, say "no
  records returned," cross-check the seed, marketplace, and filters, and try
  other seeds — never conclude "no demand" from an empty result.
- Tool errors (invalid ASIN, forbidden marketplace, throttle, invalid date
  range): report the gap, skip the affected step, and lower confidence on any
  conclusion that depended on it. Never fabricate missing numbers.
- If the response lacks the expected `data[]` array, treat it as schema drift:
  stop and report it rather than guessing field names.

## Principles

- **Jungle Scout `js_*` MCP tools only.** All demand data comes from the MCP
  tools. Do not invent search volumes or pull from other sources — fabricated
  numbers defeat the purpose.
- **Don't waste a relevant keyword.** Anything relevant that doesn't fit
  visible copy goes to backend (Amazon) or tags/alt text (Shopify).
- **Volume × relevancy × winnability.** The best targets pair real demand with
  relevancy and beatable competition (low `organic_product_count`, high
  `ease_of_ranking_score`) — not just the biggest number.

## Evidence and limits (state these to the user when relevant)

- Search volumes and relevancy scores are Jungle Scout modeled estimates, not
  actuals — treat them as demand signals, not measurements.
- Amazon keyword metrics (volume, relevancy, ease of ranking, product counts,
  PPC bids) are Amazon-marketplace signals. They justify Amazon listing
  decisions only. Shopify/Google copy may reuse the buyer *language*, but any
  Google search-volume, competition, or ranking claim requires a separate
  Search/SEO data source — never cite Amazon metrics as Google data.
- `js_share_of_voice` crowding and price-band reads are directional; use them
  to sanity-check a primary keyword, not as precise forecasts.
- Distinguish clearly in the output between direct tool data (volumes, scores)
  and your own inference (tiering choices, copy decisions).
- Be economical with tool calls: pull competitor ASINs first, then expand only
  the seeds that add coverage.

## References

- `references/listing_rules.md` — how to tier the bank and the exact rules and
  limits for each listing/SEO field. Read it before writing copy.
- `references/jungle_scout_mcp.md` — the `js_*` MCP tools this skill calls,
  their parameters, return fields, limits, and error handling.
