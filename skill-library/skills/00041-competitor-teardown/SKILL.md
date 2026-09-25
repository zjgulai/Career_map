---
name: competitor-teardown
description: >-
  Tear down a competing Amazon ASIN or brand: revenue, price history, keyword footprint, share of voice, and where it is weak. 用于给出竞品 ASIN/品牌，问能不能打、怎么差异化。
---

# Competitor Teardown

For a narrowly scoped request (for example, sales estimates and keywords only), run the relevant sections and tools below; do not require a full positioning brief, share-of-voice analysis or default annual history unless needed for the requested conclusion. Preserve any user-specified period and output format.

Turn one named competitor — an ASIN or a brand — into a positioning brief. You
pull their public-market signals from the host's **Jungle Scout `js_*` MCP
tools** and convert them into a clear answer to one question: **where are they
weak, and how do we attack it?**

All quantitative data comes from the host's Jungle Scout `js_*` MCP tools — you
call them through the host and do the analysis yourself. No API keys are managed
by this skill; respect host/provider concurrency limits. Do **not** substitute any other
connector or data source for the `js_*` numbers, even if one is available. One
narrow exception: if the environment provides a **web search** capability, you
may use it to add *qualitative* weakness evidence from public product pages and
reviews (see Step 4b) — it supplements the teardown, it never replaces `js_*`
data. If the `js_*` tools are not present, say so and stop rather than
substituting another source.

## What the data can and cannot give you

The teardown is built from four of the `js_*` tools:

- **`js_product_database_query`** → the competitor's latest snapshot: price,
  star rating, review count, ~30-day revenue and units, Listing Quality Score
  (LQS), seller count, Buy Box owner, fees, first-available date, category.
  (For a brand target, this also finds their hero products by revenue.)
- **`js_sales_estimates`** → daily units and last-known price over your window
  (default 1 year) → revenue trend, price posture, and discount cadence.
- **`js_keywords_by_asin`** → the reverse-ASIN keyword footprint: every term
  they index for, with search volume, PPC bids, difficulty, relevancy, and
  rank.
- **`js_share_of_voice`** → for their most important keywords, which brands own
  the search results and how thin the competitor is.

**Honest limitation — review themes.** The tools expose review *count* and
*star rating*, but **not** review text or sentiment themes. Rating and review
volume can only prove that a problem *may exist* — a 4.0 rating across 8,000
reviews means there are real, unresolved complaints to position against, but it
says nothing about *which* feature, material, or quality dimension is failing.
Therefore any weakness claim that names a specific functional, material, or
quality defect is a **hypothesis to verify**, never a finding: label it as such,
cite the metric signal that raised it, and attach a verification path (Step 4b).
**Never invent review themes, complaint topics, or consumer quotes** — if you
did not read it on a real product page or review, it does not go in the report.

## Step 1 — Pin down the target

You need three things; infer sensible defaults rather than interrogating the
user:

- **Target** — the ASIN (10 chars, usually `B0…`) or brand name. If the user
  named one, use it.
- **Marketplace** — default `us` unless they say otherwise.
- **History window** — default 365 days (end yesterday, start 365 days back),
  which fits within the 366-day single-call limit of `js_sales_estimates`.

Only ask a clarifying question if the target itself is ambiguous (e.g. a brand
that clearly sells in several marketplaces, or a name that could be a brand or
a product line). Ask in the chat conversation; if the host provides an
interactive question tool such as `ask_user`, you may use it — treat it as
optional, never required.

## Step 2 — Gather the data

Use [bounded parallel collection](../new-product-approval-orchestrator/references/bounded_parallel.md).
For a known ASIN, snapshot, sales history and reverse-ASIN keyword calls do not
depend on each other: collect the requested ones in a bounded wave, preserving
each result separately. SOV must wait for the returned keyword selection. For a
brand, resolve and verify the ASIN first; do not invent ASINs to start parallel
calls. If one branch fails, keep the others and mark only its dependent metrics
unverified. Parse successful local results once rather than repeatedly reading
large raw files into the model context.

**If the target is an ASIN:**

1. `js_product_database_query` with `include_keywords: [ASIN]` → the snapshot
   row (price, rating, reviews, LQS, sellers, buy box, fees, dates, category,
   30-day units & revenue).
2. `js_sales_estimates` with that ASIN over the window → the daily units/price
   series.
3. `js_keywords_by_asin` with `asins: [ASIN]`, sorted
   `-monthly_search_volume_exact` → the keyword footprint.
4. `js_share_of_voice` on the competitor's top ~5–8 keywords (by exact volume)
   → who owns those terms and the peer price band.

**If the target is a brand:** first call `js_product_database_query` with
`include_keywords: [brand]`, `sort: -revenue`, and filter rows to those whose
`brand` matches. That gives the brand's hero products by revenue. Deep-dive the
top one as an ASIN (steps 1–4 above), and keep the brand's product list for
portfolio context. Demo data is never appropriate — if you can't reach the
tools, stop and say so.

## Step 3 — Compute the derived metrics

Do this from the raw tool responses so your report rests on exact numbers.
Define them explicitly:

- **Price stats** (from `js_sales_estimates.data[].last_known_price`): min,
  max, mean, median; `price_cv_pct` = stddev ÷ mean × 100 (volatility);
  `discount_days` = count of days priced ≤ 95% of the median;
  `discount_day_pct` = discount_days ÷ total days × 100;
  `deepest_discount_pct` = (median − min) ÷ median × 100.
- **Momentum** (from `js_sales_estimates` `estimated_units_sold`): compare the
  mean of the most recent ~90 days to the prior ~90 days. `momentum_label` =
  growing (≥ +10%), flat (between), or declining (≤ −10%); report the % change.
  Note any visible seasonality in the daily series.
- **Coverage-gap keywords** (from `js_keywords_by_asin`): high-volume, relevant
  terms (top quartile by `monthly_search_volume_exact`, decent
  `relevancy_score`) where the competitor's `organic_rank` is blank or weak
  (say > 30). These are the whitespace targets.
- **Branded-volume share** = sum of exact volume on keywords whose `name`
  contains the brand ÷ total exact volume across their footprint, × 100. High =
  traffic depends on people already searching their name (fragile).
- **SOV position** (from `js_share_of_voice`): the competitor's
  `combined_weighted_sov` on their own top terms vs. the leading brand's; note
  where a *different* brand owns the term.

## Step 4 — Read the data through four weakness lenses

This is the analytical core. Each lens is *evidence plus judgment*, not a rigid
rule — weigh the signals, and when they're thin, say so.

**1. Feature & quality gaps.** A star rating below ~4.3 — especially across a
large review count — means there are persistent complaints the competitor
hasn't fixed; that's the most durable weakness you can find. A low LQS signals
a beatable listing (weak images, copy, A+ content) you can simply out-execute.
Compare their rating to peers in the `js_share_of_voice` data. Because there's
no review text, every specific feature/material/quality weakness this lens
suggests is a **hypothesis to verify** — carry it into Step 4b, where it is
either confirmed with web-sourced evidence or reported with its verification
path.

**2. Price & value gaps.** Compare their price to peer average prices
(`js_share_of_voice` returns `combined_average_price` per brand). Priced well
above peers *without* a rating edge = vulnerable on value. Then look at the
price series: a high `price_cv_pct` and many `discount_days` mean they lean on
promotions — a sign of soft demand, margin pressure, or a price war you may not
want to join. Heavy fees relative to price (`fee_breakdown` vs `price`) mean
thin margins and little room to cut. Translate this into "attack on value" or
"hold price and differentiate."

**3. Keyword-coverage gaps.** This is where whitespace lives. The coverage-gap
keywords are high-volume, relevant terms where the competitor ranks poorly or
not at all — prime targets to rank and bid on. Cross-check `js_share_of_voice`:
where a *different* brand owns most of the SOV and the competitor is thin or
absent, that term is contested but winnable. A high branded-volume share means
their traffic depends on their own name — fragile, because you can capture the
generic category terms they under-cover.

**4. Momentum & distribution gaps.** A `momentum_label` of "declining" is a
competitor losing altitude — time your move. Many sellers on the listing
(`number_of_sellers`) or a Buy Box not held by the brand itself signals
distribution leakage and price instability you can exploit. An old
`date_first_available` with flat or falling sales suggests a stale product ripe
for a fresher alternative.

## Step 4b — Verify or label the feature/quality hypotheses

Every specific feature, material, or quality weakness from lens 1 must go
through this step before it reaches the report. Handle each one in exactly one
of two ways, depending on what the environment offers:

- **If the environment provides a web search capability:** search the
  competitor's public product pages and review sections (e.g. `"<brand>
  <product>" Amazon reviews`, the ASIN's customer-reviews page, major retailer
  listings). Extract complaint themes only from pages you actually retrieved,
  cite the source URL next to each theme, and tag the bullet `Web-confirmed —
  source: <URL>`. This upgrades the item from hypothesis to *evidenced*
  weakness. If the search turns up nothing relevant, the item stays a
  hypothesis — say the search found no corroboration.
- **If no web search capability is available:** keep the item tagged
  `Hypothesis to verify` and give a concrete verification path: which listing's
  review pages to open, which star bands to filter (recent 1–3★ reviews), and
  what recurring failure mode to look for.

Either way, every feature/quality weakness bullet in the report must show four
things: the `js_*` metric signal that raised it, its evidence status
(`Hypothesis to verify` or `Web-confirmed`), the source (metric only, or metric
+ cited URL), and a confidence level (low/medium/high). Never present a
metric-only signal as a confirmed defect, and never write a complaint theme or
consumer quote you did not actually read.

## Step 5 — Write the teardown report

Follow `references/report_template.md`. The deliverable is a Markdown report
the user can keep and share. If the environment provides a writable workspace,
save it there (e.g. `competitor_teardown_<target>.md`) and present a clickable
file link; otherwise output the full report inline in chat. Either way, give a
short chat summary (3–5 sentences: who they are, their single biggest weakness,
and the top one or two positioning moves). Do not bind the output to a specific
client or a fixed workspace name.

Keep the report grounded: cite the actual numbers, lead with the **Where
they're weak** and **How to position around them** sections (that's what the
user came for), and end with a short data-and-confidence note covering the
window, the estimate caveat, and the review-theme limitation. Every
*inferential* conclusion (weakness reads, positioning moves) must carry its
evidence, its assumption, and a confidence level; feature/material/quality
weaknesses additionally follow the Step 4b labeling (`Hypothesis to verify`
with a verification path, or `Web-confirmed` with a cited source).

## MCP errors and empty results
- An empty `data[]` is a successful call with no records (**observed empty**) —
  it is not proof of zero demand or a dead competitor. Cross-check the ASIN,
  brand spelling, marketplace, and filters before concluding anything, and say
  "no records returned," not "no sales."
- Tool errors (invalid ASIN, permission, throttle, invalid date range,
  unsupported marketplace): report the gap, skip the affected step, and lower
  confidence on any conclusion that depended on it. Never fabricate missing
  numbers.
- If one tool's data is missing (e.g. no rank data yet for a keyword), run the
  remaining lenses on what you have and mark the affected lens as a data gap in
  the report.

## Guardrails

- The host's Jungle Scout `js_*` MCP tools are the only quantitative data
  source. No scraping, no other connectors, no REST calls. Web search, if the
  environment provides it, is allowed only as supplementary qualitative
  evidence for weakness hypotheses (Step 4b) and must be attributed to its
  source.
- Never fabricate figures, review themes, complaint topics, or consumer quotes.
  Missing data is a finding — report it.
- One competitor per teardown; for several, run it once each.

## Evidence and limits (state these to the user when relevant)
- Units sold, revenue, and search volume are Jungle Scout modeled estimates,
  not actuals — treat them as directional.
- Distinguish clearly in the report between direct tool data (price, rating,
  rank), web-sourced qualitative evidence (cited URLs, if web search was
  available), and your own inference (weakness reads, positioning moves).
- Review signals are metric-based only; no review text is available from the
  `js_*` tools, so weakness claims about specific features, materials, or
  quality are **hypotheses to verify** unless confirmed via web search with a
  cited source (Step 4b).

## References

- `references/jungle_scout_mcp.md` — the `js_*` MCP tools, parameters, and
  response fields this skill reads.
- `references/report_template.md` — the report structure to fill in.
