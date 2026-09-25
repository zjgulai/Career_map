---
name: amazon-prelaunch-demand-mirror
description: >-
  Mirror any product onto Amazon demand signals: category size, trend, seasonality, and variant demand signals (never per-variant unit sales). Use for products not yet sold on Amazon.
metadata:
  version: "1.0.0"
---

# Demand Mirror

## The core idea

A seller without Amazon data sees demand through a keyhole: their own traffic and
sales. Amazon sees the whole room. This skill borrows Amazon's far richer demand
signal and points it at **any product the user carries or is considering** — sold
on their own site, a DTC store, another marketplace, retail, or just an idea — so
they can decide **what to stock** and **when**, without ever needing to sell on
Amazon themselves.

For any such product, it answers three questions from Amazon data:

1. **How big is demand, and which way is it moving?** (category sizing + trend)
2. **When in the year does demand peak?** (seasonality, so they stock ahead of it)
3. **Which variants, colors, and sizes show demand and supply signals?** (so they
   stock the right mix — from search demand and listing supply, not per-variant
   sales)

All Amazon data comes from the host's **Jungle Scout `js_*` MCP tools** and nothing
else. The user's product — whatever channel it comes from — is only the *input*
that tells us what to mirror.

## Prerequisites

Amazon data comes from the host's Jungle Scout `js_*` MCP tools — there are no API
keys or scripts. The tools this skill uses are `js_keywords_by_keyword`,
`js_historical_search_volume`, `js_product_database_query`, `js_share_of_voice`,
and (optionally) `js_sales_estimates`. If they're not available, say so and stop —
do not substitute another data source or fabricate numbers.

Default marketplace is `us`. Honor any marketplace the user names (supported: us,
uk, de, in, ca, fr, it, es, mx, jp).

## Workflow

### Step 1: Get the product(s) to mirror

Accept input from whichever source is present:

- **Pasted or described in chat.** A product title, type, or a product URL from
  any channel (an independent store, a DTC site, another marketplace). This always
  works and needs nothing else.
- **A CSV product export.** Read it and use the title, product type, and any option
  columns (in Shopify exports, Option1/Option2 values are usually color and size;
  other channels' exports vary — read what is there).

If the user gives a product they do not yet sell ("should I add ..."), treat it
exactly the same. "Plans to sell" and "already sells" use the identical flow.

### Step 2: Pick the mode by how many products you were given

- **One product** (or the user clearly wants a deep look at one): run a
  **deep-dive**. Full signal: sizing, trend, seasonality curve, variant signals,
  and competitive context.
- **Many products** (a catalog, a CSV, a long list): run **triage**. A lighter
  per-product scan that ranks products by Amazon demand and momentum so the user
  knows which few deserve a deep-dive. Keep triage to ~2 tool calls per product.

You do not have to ask which mode; choose from the input size and say which you
chose. Offer the other mode as a follow-up ("want the full deep-dive on the top
one?").

### Step 3: Translate the product into mirror inputs

This is the one judgment step that benefits from your reasoning, so do it before
calling any tool. For each product, derive:

- **A clean seed keyword**: the term an Amazon shopper would actually type. Strip
  brand names, marketing adjectives, and packaging fluff. Keep the generic product
  noun plus its most defining modifier.
  - "Luna & Sol Hand-Poured Soy Candle, Lavender Fields, 8oz" → `soy candle`
  - "TrailGrip Pro Merino Wool Hiking Socks (3-Pack)" → `merino wool hiking socks`
  - "The Original Bamboo Cutting Board XL" → `bamboo cutting board`
- **An optional category** to constrain the search, from the marketplace's valid
  category names (see `references/jungle_scout_mcp.md` for the US list). Use it
  when the seed is ambiguous across categories.
- **The variant axes the user offers**, if known (colors: sage, blush, charcoal;
  sizes: S/M/L or 8oz/12oz). These let the report compare the user's planned mix
  against the variant demand signals and supply distribution Amazon shows.

When unsure between two seed phrasings, prefer the shorter, higher-volume head term;
the related-keyword pull surfaces the long tail anyway.

### Step 4: Gather the signals from the MCP tools

**Deep-dive (one product)** — roughly 4–8 tool calls:

1. `js_keywords_by_keyword` on the seed → the seed's exact/broad volume, 30-day and
   90-day trend, and the related-keyword set (used for the demand-side variant
   signal).
2. `js_historical_search_volume` on the seed over ~12 months → the weekly series
   for the seasonality curve. A single call covers at most 366 days, so a ~12-month
   window fits in one call; never request a longer range in one call.
3. `js_product_database_query` with `include_keywords: [seed]` (plus `categories`
   if chosen), sort `-revenue`, top ~15 → the best sellers' 30-day units and
   revenue, prices, and titles (count color/size tokens across titles for the
   supply-side variant signal — token frequency among top listings, never a
   per-variant share of units).
4. `js_share_of_voice` on the seed → brand concentration and the winning price
   band.
5. *(Optional)* `js_sales_estimates` on the top 1–3 sellers → daily units to
   corroborate the search-based seasonality with purchase seasonality. Skip to
   save calls.

**Triage (many products)** — per product, call `js_keywords_by_keyword` on the
seed (volume + trend) and `js_product_database_query` (top-seller revenue). Rank
by a demand score and momentum; do not pull history or SOV for every product.

### Step 5: Compute and present inline with charts

The user wants the answer **inline in chat with charts**, not a file. Do the
seasonality math and variant signal ranking yourself (see "How to read the three
signals"), render the seasonality curve as a chart from the monthly series when
the environment can render charts, and present it inline. If no charting
capability is available, fall back to the markdown table of monthly shares — the
table carries the same numbers, and the answer must never depend on charting
tooling. Always include the markdown tables too — they carry the exact figures.

Structure a deep-dive answer like this:

1. **Headline**: one or two sentences — the category's monthly demand, its trend,
   and the single most useful takeaway ("Demand is large and growing; peak is
   October to December; charcoal and sage are the colors shoppers search for
   most.").
2. **Demand size and trend**: monthly search volume of the seed, monthly and
   quarterly trend, and the combined revenue/units of the top sellers. A short
   table of the top related terms by search volume.
3. **Seasonality** (the "when"): the monthly demand curve chart (or
   monthly-shares table), the peak month and quarter, the seasonality
   classification, and a plain recommendation on when to build inventory (lead
   time means stocking *before* the peak).
4. **Variant demand signals and supply distribution** (the "what"): a ranked
   color/size table with one row per variant token, combining its keyword search
   demand with how often it appears in best-selling listing titles. **Every row
   and every variant conclusion must be tagged `[direct]` or `[inferred]`** (see
   "Direct vs inferred" below). Never show unit sales or revenue for a single
   color or size — the tools only return parent-ASIN totals. Then call out
   (tagged `[inferred]`, with evidence, assumption, and confidence) which of the
   user's planned variants are well-aligned and which popular variant they are
   missing.
5. **Competitive context**: from share of voice, whether the category is
   dominated by a few brands or wide open, and the typical winning price band.
6. **So what**: 2 to 4 crisp, stock-and-timing recommendations for the user's
   channel. Be concrete ("Carry sage, blush, and charcoal in 8oz; add the 12oz in
   September ahead of the Q4 peak; expect a winning price around $24 to $32.").
   Recommendations are inferred — they must trace back to the tagged signals
   above, not to per-variant sales numbers.

For triage, lead with a ranked table, then name the top one or two and offer
to deep-dive them. The triage table is a **hard contract** — every row MUST
carry all of these columns, in this order: product, monthly search volume,
trend (30-day), top-seller revenue, demand score, one-word call (dig-in /
maybe / skip). No column may be dropped or left blank; mark any unverifiable
cell `[inferred]` or `n/a — not verified` instead of omitting it. **Never
deep-dive more than the top 1–2 products in a triage pass**, and never
deep-dive all candidates — the point of triage is to avoid exactly that.

Keep the prose tight. The user wants decisions, not a data dump.

## How to read the three signals

### Demand size and trend
`monthly_search_volume_exact` on the seed term is the cleanest single demand
number. `monthly_trend` (30-day) and `quarterly_trend` (90-day) are percentage
changes; positive means growing. The top sellers' combined
`approximate_30_day_units_sold` and `approximate_30_day_revenue` confirm that
searches turn into purchases. Big searches with thin revenue can mean a
browsing, low-conversion category; small searches with high revenue can mean a
high-ticket niche.

### Seasonality (the framework to apply)
Aggregate the weekly `js_historical_search_volume` into calendar months and
compute each month's share of the annual total. Jungle Scout's standard reading:

- Peak month under 10% of annual volume: **low** seasonality (stock steadily).
- Peak month 10% to 15%: **moderate** seasonality.
- Peak month above 15%: **high** seasonality (time inventory carefully).

The actionable point is timing: a seller with supplier lead time should build
inventory in the weeks *before* the peak, not during it. Report the peak month
and the ramp month so you can state this plainly. When you pulled
`js_sales_estimates`, aggregate the top sellers' daily units to months too;
where it corroborates the search seasonality, trust that story most.

### Variant demand signals and supply distribution (colors and sizes)

Two independent signals, reconciled — plus one whole-family corroboration:

- **Demand side (direct data)**: among related keywords
  (`js_keywords_by_keyword`), the ones containing a color or size token, ranked
  by exact search volume. This is what shoppers ask for, in their own words.
- **Supply side (direct data)**: among the best-selling products
  (`js_product_database_query`), how many top-listing titles contain each color
  or size token — a plain frequency count. This is the supply distribution: what
  the current winners choose to offer and advertise in their titles.
- **Whole-family corroboration (direct data)**: the parent ASIN's overall
  30-day units and revenue. Use it to confirm the variant family as a whole
  converts searches into purchases. It says nothing about any single color or
  size — never divide it across variants.

**Direct vs inferred — tag every variant line.** The three bullets above are
direct tool data and may be reported as-is. Everything reconciled from them is
inference: the combined variant ranking, "high search + low supply" opportunity
gaps, "missing variant" calls, and how well the user's planned mix aligns.
Tag each inferred line `[inferred]` with its evidence (which direct signals),
assumption (e.g. "title mentions proxy for what is stocked"), and confidence
(high / medium / low, lowered when a signal is thin or one side is missing).

Reading the two sides together: where search demand and title supply agree,
that variant is a safe stock (inferred). High search volume with little title
supply is an opportunity gap worth flagging (inferred). A token that saturates
top-listing titles while its keyword search demand is weak is a crowded variant
to approach carefully (inferred).

## Amazon data ≠ Google/SEO data

The keyword volumes and trends from `js_keywords_by_keyword` and
`js_historical_search_volume` are **Amazon marketplace data**. Apply this rule
whenever the conversation touches the user's own store or site:

- Amazon keyword data supports **Amazon demand conclusions only** — demand size,
  trend, seasonality, and variant demand signals on Amazon.
- For the user's own-channel copy (their site, DTC store, or elsewhere), you may
  **borrow the consumer language** (the words and variant modifiers shoppers
  actually type) as wording inspiration.
- You must **never** present Amazon keyword metrics as Google search volume,
  Google search intent, SEO keyword difficulty, or evidence that any page can
  rank on Google. If a draft conclusion would say "this keyword has X monthly
  searches" about Google, rewrite it as "shoppers on Amazon search for this
  phrasing."
- If the user needs real Google SEO conclusions (search volume, competition,
  ranking opportunity), say so plainly: that requires a dedicated Google/SEO
  data source (e.g., Google Keyword Planner). Give **no** Google/SEO conclusion
  at all without one — not even qualitative directional judgments ("cork is the
  bigger term", "low-competition entry point") — and do not use general web
  search as a substitute source. State the boundary and point to the proper
  channel. Exception: when the user explicitly specifies a logic or assumption
  to run with ("just assume cork is bigger and write it that way"), follow the
  user's instruction, label that logic as a user-specified premise, and never
  present it as a data-backed conclusion.

## MCP errors and empty results
- An empty `data[]` is a successful call with no records (**observed empty**) —
  it is not proof of zero demand. Cross-check the seed, marketplace, and filters
  before concluding anything, and say "no records returned," not "no demand." A
  brand-new niche with no historical search volume is exactly this case: report
  what you do have and note the gap.
- Tool errors (permission, throttle, invalid date range, unsupported
  marketplace): report the gap, skip the affected step, and lower confidence on
  any conclusion that depended on it. Never fabricate missing numbers.
- If the history pull fails or comes back short of the requested window, say so
  and mark the seasonality reading low-confidence — do not present partial data
  as a full-year curve.

## Evidence and limits (state these to the user when relevant)

Direct tool data in this skill (reportable as-is, noting it is modeled):

- Keyword search volumes and trends (`js_keywords_by_keyword`,
  `js_historical_search_volume`), including color/size-keyword demand.
- Color/size token frequency in best-selling listing titles
  (`js_product_database_query`).
- Parent-ASIN overall 30-day units/revenue (`js_product_database_query`,
  `js_sales_estimates`) and brand share-of-voice / price bands
  (`js_share_of_voice`).

Inferred (must be tagged `[inferred]` with evidence, assumption, confidence):

- The reconciled variant ranking and any opportunity-gap / missing-variant /
  mix-alignment conclusion.
- The demand score used in triage ranking.
- Stock-and-timing recommendations in "So what."

Other limits:

- Search volume is a demand proxy; the top sellers' units and revenue from
  `js_product_database_query` are the corroboration that searches turn into
  purchases.
- Units sold and revenue are Jungle Scout modeled estimates, not actuals —
  excellent for comparison and trend, not exact accounting. Say so when a
  number is load-bearing.
- Amazon keyword data never becomes Google search volume or SEO evidence — see
  "Amazon data ≠ Google/SEO data."

## Guardrails and honesty

- **Be economical with tool calls.** Deep-dive is ~4 to 8 calls; triage ~2 per
  product. For large catalogs, triage first, then deep-dive only the winners.
- **Variant sales roll up to the parent.** `js_sales_estimates` and the 30-day
  units in `js_product_database_query` represent the whole variant family
  (parent ASIN), not a single color or size. So variant conclusions are demand
  signals and supply distribution: search demand for color/size keywords, and
  token frequency among top-listing titles. **Never output unit sales or
  revenue for a single color or size**, and never distribute parent-ASIN totals
  across variants — the data cannot give that. Concrete violation pattern to
  avoid: writing "the 8oz version sells ~X units/month" from a parent-ASIN or
  title-spec figure — that number belongs to the whole variant family; present
  it as such or mark the split `[inferred]` with the explicit assumption.
- **Amazon data stays Amazon data.** Do not cite Amazon keyword metrics as
  Google search volume or SEO competition, and do not promise page rankings
  from them; follow the boundary rules in "Amazon data ≠ Google/SEO data."
- **Stay on the host's Jungle Scout `js_*` MCP tools.** If the user pushes for
  data the tools do not provide (per-variant sales, Google SEO metrics), say
  what the tools can and cannot do rather than reaching for another source.

## Reference

`references/jungle_scout_mcp.md` documents every Jungle Scout `js_*` MCP tool
this skill uses: each tool's parameters, the response fields, the valid US
category list, the variant data boundary, and the seasonality thresholds. Read
it when you need to interpret a field or constrain a search.
