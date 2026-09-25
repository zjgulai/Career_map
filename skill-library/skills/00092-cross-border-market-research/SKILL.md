---
name: cross-border-market-research
description: >
  [Market-level research] Use when the user wants a MARKET-LEVEL view of a cross-border track —
  market size, demand trend / seasonality, competitive landscape, and profit — rather than a list of specific products to buy.
  Method: match the track direction to the Amazon category tree → build the core keyword library via
  `scripts/build_keywords.py` (sibling / child category words + `js_keywords_by_keyword` expansion,
  ranked by recent Amazon search volume from `js_historical_search_volume`) → `core_keywords.json` as the
  "market-size representative keyword group".
  ✅ TRIGGER on market-research intent: market analysis / market research / market size / track (niche) analysis /
  demand analysis / market trend / trend analysis / seasonality / competition level / keyword-pool sizing /
  keyword generation — in any buyer language.
  (market research / market analysis / market size / demand trend / seasonality / competitive landscape / keyword landscape).
  ❌ DO NOT trigger for: product-level selection ("recommend N products / best sellers / pick products /
  find winning items") — that routes to
  `product-selection`. This skill stays at the **market layer** and does NOT output a
  Top-N product-selection list.
  ❌ DO NOT trigger for broad-category multi-opportunity discovery (a broad category with no
  chosen direction, "what niches/opportunities in X") — that routes to `product-selection`
  (its built-in direction-convergence phase); this skill analyzes ONE already-chosen track.
---

# Cross-border Market Research

> ⚠️ **STATUS**: Full flow is implemented — see the Full flow table and Step sections below. Trend analysis
> (Step 3) runs `scripts/scoring.py` (bundled in this skill) on this skill's own `core_keywords.json`; no
> external skill is needed.

## What this skill does

Produce a **market-level** research view for a cross-border track. The first and foundational step is to
build the **market-size representative keyword group** (`core_keywords.json`) — the query plus its
sibling / child category words and `js_keywords_by_keyword` expansion, ranked by recent Amazon
search volume. Everything downstream (market size, trend, competition, profit) is computed on top of this
keyword group, so getting it right is the prerequisite.

- **Amazon category tree** = where the track sits. Its **child / sibling** categories feed keyword sources;
  the **parent** category is context only (too broad — NOT collected into `core_keywords.json`). Siblings are
  kept as **alternative tracks** to suggest when the query's own sub-niche shows no opportunity.
- **`js_keywords_by_keyword`** = expand the query into related keywords.
- **`js_historical_search_volume`** = attach each keyword's recent Amazon search volume (the ranking signal).

## Full flow

| Step | What | Status |
|---|---|---|
| **Step 1** | Determine keywords via `build_keywords.py` → `core_keywords.json` (market-size representative keyword group) | ✅ implemented (below) |
| Step 2 | **Market size analysis** | ✅ `market_size.json`（context + gate, not scored）|
| Step 3 | **Market trend analysis** | ✅ `scoring.py` 5-tier verdict (qualitative) |
| Step 4 | **Market competition analysis** | ✅ `competition.json`; low / medium / high (qualitative) |
| Step 5 | **Profit analysis** | ✅ rough margin health (qualitative) |
| Step 6 | **Report deliverable** | ✅ structure defined (below) |

> **No numeric score**: each dimension yields a QUALITATIVE tier only (trend favorable/neutral/**declining**,
> competition low/medium/**high**, profit healthy/acceptable/**thin**); **market size is NOT tiered** — it only
> shows real data (30-day search volume / units sold / revenue) plus a **"market too small — caution"** flag when the
> pool is tiny. Step 6 decides with a **binary** call — **NO-GO / GO** (no WAIT) — based on **how the negative tiers
> stack up + whether ANY investable angle survives**, never a weighted total.

---

## Step 1: Determine keywords (build the core keyword library)

Goal: from the track direction, assemble the **core keyword library** (`core_keywords.json`) that represents
the market's demand pool. **Fully script-driven — run `scripts/build_keywords.py <case_dir>`.** The LLM's only
job is Step 1a (match the query to a category level and persist `category_tree.json`); the script makes ALL
Jungle Scout calls (`js_keywords_by_keyword`, `js_historical_search_volume`) itself via `accio-mcp-cli`.

### Step 1a — Category tree matching → `category_tree.json`

> ✅ The full Amazon category tree is **already fetched** and bundled at `references/amazon_category_tree.json`
> — **do NOT `web_fetch` it live**. It is a nested tree: `categories[]` → each node has `name` / `level`
> (integer) / `parent` / `path` / `children[]`; it carries `marketplace` + `fetched_at` at the top. Treat it
> as a **stable bundled resource — no expiry**.

1. **Match query**: semantically compare the query with category names and full paths, considering
   synonyms and translations. **Exact**: semantically equivalent to a category; use that node and
   its level. **Fuzzy**: clearly belongs under a category but is not equivalent; attach it as a
   virtual child with `query_level = parent.level + 1`. **Unmatched**: keep it standalone with no
   parent, siblings, or children and `query_level = null`.
2. **Locate the node's neighbors**: from the matched node read its **parent** (one level up), **siblings** (the
   parent's other children) and **children** (one level down). These feed the four keyword sources in Step 1b.

🌐 **Determine the marketplace here** (needed for `config.json`): if the query names a site/country
(e.g. UK → `uk`, Germany → `de`, Japan → `jp`), use it; if not specified, default to `us`.

🔴 **Persist the located subtree to `category_tree.json`** in `<case_dir>` (mirror the reference schema:
`level` integer, `path` full breadcrumb, `parent`; **no node ID**). Capture the query node plus its
**parent / siblings / children**. Shape:

```json
{
  "marketplace": "us",
  "query": {"name": "Feeding & Watering", "level": 3, "parent": "Cats", "path": "Pet Supplies > Cats > Feeding & Watering"},
  "parent": {"name": "Cats", "level": 2, "path": "Pet Supplies > Cats"},
  "siblings": [
    {"name": "Beds & Furniture", "level": 3, "path": "Pet Supplies > Cats > Beds & Furniture"},
    {"name": "Litter & Housebreaking", "level": 3, "path": "Pet Supplies > Cats > Litter & Housebreaking"}
  ],
  "children": [
    {"name": "Automatic Feeders", "level": 4, "path": "Pet Supplies > Cats > Feeding & Watering > Automatic Feeders"},
    {"name": "Fountains", "level": 4, "path": "Pet Supplies > Cats > Feeding & Watering > Fountains"}
  ]
}
```

If the matched node has no parent (it is L1) or no children (it is a leaf), leave that field empty and note it.

### Step 1b — Run `build_keywords.py` → `core_keywords.json`

```bash
market-research-keywords <case_dir>   # reads config.json + category_tree.json
```

⚡ **Fire the query's sourcing-price call in the same turn** — Step 5 needs a `product_supplier_search`
unit-price range **per probed keyword**, and the **query's** call only needs the raw `query` string (no script
artifact), so issue it **in the same parallel batch as this script** instead of waiting. The child /
opportunity keywords are only known once the script ranks them, so fire those as a second parallel batch right
after it prints the `sourcing keywords (...)` line. Keep every result in context; **never call the same keyword
twice**.

**Input contract** — `config.json` in `<case_dir>` (copy `scripts/config.example.json`):

| Field | Required | Default | Meaning |
|-------|----------|---------|---------|
| `query` | yes | — | The track / keyword to analyze (drives Step 1a match + source 4 expansion). |
| `marketplace` | no | `us` | Amazon marketplace `us/uk/de/in/ca/fr/it/es/mx/jp`; resolve from the query, default `us`. |
| `keyword_expand_count` | no | `3` | How many `js_keywords_by_keyword` expansion words to keep — only rows with `supply_demand_ratio` > 1 (demand outruns supply) qualify, then top-N by `monthly_search_volume_exact` desc (may be fewer than N when fewer rows qualify). |

The **recent 12-month window** is always derived from today (yesterday − 365d → yesterday) and is **not
configurable**; it is written into `core_keywords.json` → `recent_window` and reused by Step 3.

The script gathers candidates from **three sources** (plus the query itself, always kept), ranking/filtering
each open-ended source by the **recent-30-day search volume** (the **sum of the last 4 weeks** of that keyword's
recent-12-month window):

1. **Sibling category words** — the parent's other `children`. **Keep top 3** by recent-30-day volume. Siblings
   are kept as **alternative tracks** (suggested when the query's own sub-niche shows no opportunity).
2. **Child category words** — the query node's own `children`. **Keep top 3** by recent-30-day volume.
3. **Keyword expansion** — `js_keywords_by_keyword` on the query (`page_size=50`), the **SAME basis as
   `opportunity_keywords`**: keep only rows whose `supply_demand_ratio` > 1 (demand outruns supply),
   then rank by `monthly_search_volume_exact` desc and keep top `keyword_expand_count`.

If the query has no siblings or children, leave the corresponding category source empty; never invent or replace it.

> The **parent category is NOT collected** (too broad).

⚡ The script calls `js_historical_search_volume` for every candidate **concurrently**, pulls the recent
12-month window once per keyword and **saves each raw return as `hsv_<slug>_p2.json`** (so the recent window is
never pulled twice downstream). `recent_30d_volume` (sum of the last 4 weeks) is the per-keyword ranking signal.

🔁 **Query no-data safety net (web_search fallback)**: if the query has **no HSV across its full recent 1-year
window** (empty in every month — `build_keywords.py` prints a `[warn]`), fall back to a `web_search`-based
**qualitative** read for the query, label it as web research (NOT Amazon search volume), and leave the query's
quantitative cells `N/A`. (A `recent_30d_volume` of 0 in the last 4 weeks with earlier data still in the window
is NOT "no data" — it is scored normally. `--add-synonym "<word>"` stays an optional way to keep a quantitative read.)

### Output

`core_keywords.json` in `<case_dir>` — the market-size representative keyword group consumed by the downstream
Steps 2–5. It records `query` / `query_level` / `matched_category` / `marketplace` / `recent_window`, and per
keyword its `source` (`query` / `sibling_category` / `child_category` / `keyword_expansion`
/ `query_synonym`), tree `level` (category words only) and `recent_30d_volume`. Shape:

```json
{
  "query": "cat water fountain",
  "query_level": 3,
  "matched_category": "cat water fountain",
  "marketplace": "us",
  "recent_window": {"start_date": "2025-05-01", "end_date": "2026-04-30"},
  "core_keywords": [
    {"keyword": "cat water fountain", "source": "query", "level": 3, "recent_30d_volume": 43500},
    {"keyword": "cat feeder", "source": "sibling_category", "level": 3, "recent_30d_volume": 34000},
    {"keyword": "cat fountain filter", "source": "child_category", "level": 4, "recent_30d_volume": 16000},
    {"keyword": "automatic cat water fountain", "source": "keyword_expansion", "level": null, "recent_30d_volume": 12500}
  ]
}
```

### Notes / pitfalls

1. ⚠️ Keep each keyword a **single phrase** (`"cat water fountain"`), never split into loose tokens.
2. Sources 1–3 come from the pre-fetched category tree; if an edge is missing (no parent / no children), that
   source is simply empty (never invented).
3. `core_keywords.json` is the single hand-off artifact for Steps 2–5 (market size / trend / competition /
   profit) — get it right first.
4. The run also writes **`keyword_opportunities.json`** — the 50 expansion keywords with the metrics each
   (`monthly_search_volume_broad` / `monthly_search_volume_exact` (selection basis) / `organic_product_count` /
   `ease_of_ranking_score` / `ppc_bid_exact`),
   their `supply_demand_ratio`, the `top20_volume_sum` vs `query_volume` comparison (`longtail_play`), and the
   top-3 `opportunity_keywords` (by exact volume). Consumed by §6 (niche opportunities) and Step 2 (long-tail read).
   **Same single API call** as the expansion — no extra cost.
5. Those top-3 `opportunity_keywords` live **ONLY in `keyword_opportunities.json`** — they are NOT copied
   into `core_keywords.json` as opportunity rows (they may still overlap keyword_expansion words, which use
   the same basis), carry NO HSV, are never trend-scored by scoring.py, and are NOT probed with
   `js_product_database_query`.

---

## Step 2: Market Size Analysis

**Data source**: `market_size.json`, produced by `build_keywords.py` (Step 1). Its **market-size probe** calls
`js_product_database_query` (`page_size=100`) for the **query word + the filtered top-3 child categories**,
saves each raw return as `db_<slug>.json`, and sums each keyword's **last-30-day**
`approximate_30_day_units_sold` and `approximate_30_day_revenue` over the returned Top-100 products.

`market_size.json` shape:

```json
{
  "query": "cat water fountain",
  "marketplace": "us",
  "keywords": [
    {
      "keyword": "cat water fountain",
      "product_count": 100,
      "monthly_units_sold": 82000,
      "monthly_revenue": 2460000.0,
      "avg_price": 30.0,
      "avg_weight_lbs": 0.84,
      "fba_fee_est": 3.42
    },
    {
      "keyword": "cat fountain filter",
      "product_count": 100,
      "monthly_units_sold": 31000,
      "monthly_revenue": 620000.0,
      "avg_price": 20.0,
      "avg_weight_lbs": 0.36,
      "fba_fee_est": 3.18
    }
  ]
}
```

- **Per-keyword monthly size** = `monthly_units_sold` (units/mo) and `monthly_revenue` (USD/mo) — the
  last-30-day sum across that keyword's Top-100 products (a proxy for the sub-track's monthly demand & GMV).
- **Report the query row as the headline** market size; use the child rows to show how demand splits across
  sub-categories. ⚠️ **Do NOT sum all rows** into one total — the keywords' Top-100 product sets can overlap,
  so adding them double-counts; present per-keyword and note the overlap.
- Every figure traces to a real `js_product_database_query` return (`db_<slug>.json`); never fabricate.

Additional fields used by the profit analysis:

- `avg_price` — implied average selling price across the sampled products, calculated as total
  `monthly_revenue / monthly_units_sold`. This is equivalent to a units-sold-weighted average price;
  `null` when no unit sales are available.
- `avg_weight_lbs` — average product weight normalized to pounds and weighted by units sold when
  available; falls back to the average of usable product weights, or `null` when no weight data exists.
- `fba_fee_est` — rough FBA fulfillment-fee estimate derived from `avg_weight_lbs`:
  `USD 3.0 + weight × 1.0` for weights ≥ 1 lb, or `USD 3.0 + weight × 0.5` below 1 lb;
  defaults to `USD 5.0` when weight data is unavailable. This is not a complete logistics-cost estimate.

### Market Size — context & small-only gate (not scored, not tiered)

Market size is **not a scored dimension** and is **NOT tiered large / medium / small**. Just **show the real
numbers** and apply a **single “too small” gate**:

- **Show the real data** (per keyword: query + children, from `market_size.json` / `core_keywords.json`):
  **30-day search volume** (`recent_30d_volume`), **30-day units sold** (`monthly_units_sold`),
  **30-day revenue** (`monthly_revenue`).
  ⚠️ do NOT sum overlapping rows. Also note query vs its children (broad head term vs sub-niche).
- **Gate (small only)**: if the query's `recent_30d_volume` **< 1,000/mo**, the market is too small — add a
  **"market too small — caution" flag** and lean the final verdict cautious — an otherwise-favorable read
  on a tiny market does NOT make it worth doing. Otherwise **no size label** — the real numbers speak for
  themselves. This is a qualitative caveat, **not a numeric score**.
- **Long-tail vs head-term read** (from `keyword_opportunities.json`, no extra API call): when
  `longtail_play` is `true` — i.e. the **top-20 expansion keywords' summed `monthly_search_volume_broad`
  exceeds the query's own broad volume** — demand sits in the long tail, so the head term alone **understates** the
  real market. Say so and recommend a **long-tail keyword matrix** play instead of betting on the head term.
  When `longtail_play` is `false` the head term carries the demand; when it is `null` (the endpoint returned no
  volume for the query) state that this comparison is unavailable — never guess.

### Keyword opportunity metrics — `keyword_opportunities.json`

The same single `js_keywords_by_keyword` pull (page_size 50) also records, **per expansion keyword**:
`monthly_search_volume_broad` (long-tail read only — `top20_volume_sum` / `query_volume`),
`monthly_search_volume_exact` (selection basis + ratio numerator + §6 display), `organic_product_count`
(supply), `ease_of_ranking_score` (1-10,
higher = easier), `ppc_bid_exact` (USD ad cost), plus
**`supply_demand_ratio` = monthly_search_volume_exact ÷ organic_product_count**. A ratio **> 1** means demand
outruns supply = an opportunity (`null` when supply is unknown — never treat that as an opportunity).

`opportunity_keywords` = the **top 3** rows with `supply_demand_ratio` > 1 (demand outruns supply), ranked
by exact volume desc (may be fewer than 3, even empty, when fewer rows qualify). 🔴 They are a
**keyword-level signal only** — they are **NEVER** fed to `js_product_database_query`. The product probe covers
**the query + its child categories ONLY**; a leaf category or a long-tail query therefore probes the query alone
(one row in §2 / §4 / §5), which is correct — do not invent extra tracks.

Report it as **§6 Niche Opportunities**: an opportunity read first, then the table with
**supply-demand ratio** AND **ranking-ease score** — the latter must be explained as *how hard it is to climb
onto page 1 / the top organic positions* (higher = easier for a new listing to win an organic slot), because a
high ratio with a hard-to-rank keyword still means ads are required.

✅ **One selection basis, two artifacts — keyword_expansion and opportunity_keywords share it**:
gated to `supply_demand_ratio` > 1 first (`monthly_search_volume_exact` ÷ `organic_product_count` —
demand outruns supply), then ranked by `monthly_search_volume_exact` desc (demand-first); rows without a
ratio never qualify. The split is about **where they go**, not how they are picked:

| Artifact | Goes to | What it drives |
|---|---|---|
| `keyword_expansion` (core_keywords.json) | the Step-1 keyword group (recent-30-day volume signal) | no report section directly — expansion words are neither probed nor trend-scored (trend scope = query + children only) |
| `opportunity_keywords` (keyword_opportunities.json ONLY) | §6 niche-opportunity table | top-demand read (+ ratio / ranking-ease as reference) — NEVER probed or trend-scored |

The two tables may therefore list the **same keywords** — that is fine; they are two views of one selection.

---

## Step 3: Market Trend Analysis

Uses the bundled **`scripts/scoring.py`** (YoY 18 + QoQ 12 = 30-pt trend score +
seasonality + a 5-tier growth-stage verdict), run on the **query + child-category keywords from Step 1** — whose
recent-12-month HSV is already saved as `hsv_<slug>_p2.json`.

> 🔭 **Trend scope = query + child categories ONLY**: sibling / expansion / synonym rows stay in
> `core_keywords.json` (they feed market size / §6), but they are NEVER prior-window-pulled or
> trend-scored. The §3 trend table therefore lists exactly the query + its child categories.

### 3a — Collect the prior-12-month window (concurrent)

Step 1 already saved each core keyword's **recent** window (`hsv_<slug>_p2.json`). Now pull the **prior 12
months** for the trend-scoped keywords in `core_keywords.json` (**query + child categories only** — sibling /
expansion / synonym rows are skipped) — **run it concurrently via the script** (do NOT issue serial
per-keyword calls):

```bash
market-research-keywords <case_dir> --prior
```

This reads `core_keywords.json` (marketplace + recent-window start), derives the prior window as the 12 months
ending the day before the recent window starts, and **concurrently** (thread pool) calls
`js_historical_search_volume` for every query / child-category keyword, saving each as `hsv_<slug>_p1.json`
(recent window is NOT re-pulled). `scoring.py` then concatenates the two same-keyword windows by date into one
24-month series (a true YoY needs 24 months; a single call caps at 366 days).

### 3b — Score the trend

```bash
market-research-scoring <case_dir>
```

`scoring.py` scores **only** the query + child-category keywords of `core_keywords.json` (the trend scope). Outputs into `<case_dir>`:
- `scores.json` — per-keyword `yoy_growth` / `qoq_growth` / `trend_score` (/30) / `seasonality` / `verdict`
  (**EXPLOSIVE / STRONG_GROWTH / STABLE_GROWTH / MATURE / DECLINING**) + `qoq_pullback`.
- `scores_summary.md` — the per-keyword summary table.
- `monthly_series.json` — prior-12m + recent-12m monthly arrays per keyword (for charts / audit).

> If a keyword (typically the query) has
> **no HSV across its full recent 1-year window**, fall back to a `web_search` **qualitative** trend read for it
> (mark quantitative cells `N/A`, label the source as web research — NOT Amazon HSV).

### Market Trend verdict (qualitative)

Use the query keyword's **5-tier `verdict`** from `scores.json` as the trend read (**no points**):
- **Favorable**: EXPLOSIVE / STRONG_GROWTH / STABLE_GROWTH — demand rising.
- **Neutral / caution**: MATURE — growth flattening.
- **🔴 Negative flag**: DECLINING — demand falling.
- **UNKNOWN** (no HSV → web_search fallback): insufficient data — low-confidence caution, do NOT count as favorable.

Report `yoy_growth` / `qoq_growth` + the verdict; note `qoq_pullback` (YoY↑ but QoQ↓) as a seasonal-pullback
vs fading-momentum caveat.

---

## Step 4: Market Competition Analysis

**Data source**: `competition.json` (produced by `build_keywords.py`, Step 1) + the raw `db_<slug>.json`.
Per keyword (query + the filtered top-3 children), from its Top-100 products:

- **Concentration** — two signals; **lower = more fragmented = easier to enter**:
  - **Product concentration** = `top3_products_revenue_share` / `top3_products_units_share` (Top-3 products' share of Top-100).
  - **Brand concentration** = `top3_brands_revenue_share` / `top3_brands_units_share` (Top-3 brands' share).
- **New-entrant vitality** = `new_product_count` — # of Top-100 products listed within ~6 months.
- **Seller mix** = `seller_type_counts` in `competition.json` — Top-100 counts by `seller_type`
  (e.g. FBA / FBM / AMZ). A high **AMZ (Amazon-direct)** share ⇒ Amazon itself competes here = higher barrier.

> Use the **revenue-based** shares as the primary concentration read; units-based as a cross-check.

### Competition level (qualitative)

| Tier | Concentration (product / brand) | New-entrant vitality | Read |
|------|--------------------------|-----------|------|
| **Low (fragmented, favorable)** | both < 30% | > 10 new products in the Top 100 | highly fragmented, new-entrant friendly |
| **Medium (moderate, neutral)** | both < 40% | 5–15 | moderate competition, enterable with differentiation |
| **High (intense / oligopoly, negative flag)** | either > 50% (or both > 60%) | < 5 | intense to oligopolistic / category locked up |

- **Read the query row as the headline**; child rows show how competition varies across sub-tracks.
- If the concentration signal and the new-entrant signal **disagree**, take the **more conservative (worse)**
  level and state the divergence (e.g. fragmented shares but very few new entrants ⇒ still cautious).
- A high **AMZ** share in `seller_type_counts` pushes toward **High** (Amazon competes directly).
- Every figure traces to `competition.json` / `db_<slug>.json`; never fabricate.

---

## Step 5: Profit Analysis

**Rough net-margin estimate** (mark everything **"rough est."**). Inputs:

- **Amazon selling price** = `avg_price` per keyword from `market_size.json` (sales-weighted ASP = revenue / units).
- **Sourcing cost** = `product_supplier_search` → the supplier **unit-price range** (Alibaba). Run **one call per
  probed keyword** — the script prints the exact list as
  `sourcing keywords (run product_supplier_search per keyword, ONE parallel batch): kw | kw | …`
  (= the query + the **top-3 child categories by 30-day search volume**; a leaf category or long-tail query
  yields just the query — the same list as `market_size.json` → `keywords[].keyword`). Issue them as **ONE
  parallel batch**, never sequentially. Each range is a **margin input for that keyword's row, NOT a supplier
  deliverable**.

  ⚡ **Timing**: the **query's** call has no dependency on any artifact — fire it back in Step 1b, in the same
  parallel batch as `market-research-keywords`. The **child categories are only known after the script ranks
  them**, so fire those as one parallel batch the moment the script prints the sourcing-keywords line. Never
  call the same keyword twice.

  🔴 **No product cards**: product cards render ONLY when a `:::slot[id]` marker appears in the message —
  the final message emits **NO `:::slot[...]` marker**, so no card is shown. Do not hand-author or copy any
  `:::slot[...]` directive, and do not build a supplier table out of the probe results; only the unit-price
  range feeds the profit widget's margin (`--sourcing-json`).
- **FBA fee estimate** = `fba_fee_est` per keyword from `market_size.json` — weight-tiered formula on the
  sales-weighted avg weight (unit-normalized to lbs): **≥ 1 lb → `USD 3.0 + weight × 1.0`; < 1 lb →
  `USD 3.0 + weight × 0.5`**; **USD 5.0 flat fallback** when no weight data.

Formula (FBA deduction on top of the real sourcing cost):

```
net margin ≈ (avg_price − sourcing_cost − fba_fee_est) / avg_price
```

- Weight is returned by the product database, so **FBA IS estimated** (per above) and deducted alongside the real
  sourcing cost — state the margin as **"rough est."**.
- Report a **range** (supplier price low–high vs `avg_price`), not a false-precise single number.
- Every figure traces to `market_size.json` + the `product_supplier_search` return; never fabricate.

> Boundary: this is a **market-level margin sanity-check**, not product-level sourcing. For a real Top-N product
> list + full supplier tables, route to `product-selection`.

### Margin health (qualitative)

Read the estimated **net margin** (rough est.; use the low–mid of the range):
- **Healthy (favorable)**: ≥ 50%
- **Acceptable (neutral)**: 25% – 50%
- **Thin (negative flag)**: < 25%

---

## Step 6: Report Deliverable

Assemble Steps 1–5 into one structured Markdown report and **save it with `write`** (a completed turn with no
`write` call = failure).

> 🔴 **Follow the report template exactly** — [`references/report-template.en.md`](references/report-template.en.md)
> is the **structure source of truth for ALL buyer languages** (there is NO separate Chinese template).
>
> Fill every `{placeholder}` with real data from the Step 1–5 artifacts.

**Rules**
1. **Language**: write the **entire report in the buyer's query language** — translate ALL section headings,
   table headers, fixed labels, and prose into that language; keep structure, section order, icons, links, and
   data values unchanged. **Never mix languages** in one report; the only exceptions are keyword strings and
   `USD` amounts. **Enum values from the data artifacts** (trend verdict / competition level / margin health /
   GO-NO-GO / seasonality) must be rendered via the **fixed token→label mapping table in the template's header
   comment** (trend labels also live in scoring.py `_VERDICT_LABELS`) — never invent your own translation, and
   never print the raw English enum in a non-English report. Switching language MUST NOT reduce completeness —
   never drop a section or column.
2. **Data integrity**: every number traces to a Step 1–5 artifact (`core_keywords.json` / `market_size.json` /
   `competition.json` / trend `scores.json` / the `product_supplier_search` return); never fabricate. Mark all
   profit / estimate figures **"rough est."**.
3. **Money format**: write `USD 20`, ranges `USD 20–30` (en-dash) — never `$20-$30`.

**Verdict logic (for the Executive Summary)** — a **holistic entry verdict (not a score)**; **two outcomes only
(no WAIT)**:
- **GO (recommended to enter)** — **the default whenever ANY viable / investable angle survives**: the query, a child, **or a
  differentiation / long-tail angle** (an unmet need / quality gap / underserved sub-segment). A stacked set of
  negatives on the **mainstream** does **NOT** force NO-GO if a differentiation angle exists — conclude
  **GO (via differentiation)** and name the angle, e.g. “the mainstream is a red ocean, but the X differentiation angle is enterable”.
- **NO-GO (not recommended)** — **only** when the negatives stack up (small market + declining trend + oligopoly /
  high Amazon-retail share / low new-entrant vitality + margin too thin) **AND there is genuinely no angle left —
  not even a differentiation / long-tail opening.**

⚠️ **Do not over-fire NO-GO**: **having a differentiation opportunity = a viable angle = GO** (the mainstream may
still be flagged 🔴 red — GO does not mean the mainstream is easy). Only call NO-GO when **even differentiation has no
opening**. A **leaf node with no children** removes the *drill-down* path but does **NOT** by itself remove the
*differentiation* path — you MUST judge the differentiation angle explicitly before ever concluding NO-GO.

> **Structure & layout follow the template** ([`references/report-template.en.md`](references/report-template.en.md)):
> Executive Summary + Market Size / Trend / Competition / Profit / Next Steps / Data Sources. Fill each from its
> named artifact (`market_size.json` / `scores.json` / `competition.json` / the `product_supplier_search` return).

### Final chat (after the report is saved)

🔴 First render the four dimension cards deterministically — never hand-author widget HTML:

```bash
market-research-widgets <case_dir> --lang <zh|en> \
  --sourcing-json '{"<keyword>":{"low":1.2,"high":2.5}, ...}' > <case_dir>/widgets.txt
```

It reads `market_size.json` / `scores.json` / `competition.json` and prints **four ```widget blocks**
(market size / trend / competition / profit) in that order. `--lang` follows the buyer's language (`zh` for
Chinese buyers, `en` otherwise). `--sourcing-json` carries the per-keyword unit-price ranges from the Step-5
`product_supplier_search` batch — a keyword with no price renders its sourcing / margin cells as `—`.

🔴 **Redirect stdout into a file (`widgets.txt`) and NEVER let the widget markup flow into a tool-step's
output** — if the client also renders tool-execution output, the same four cards would appear twice. The
widget blocks are embedded **exactly once**, in the final chat message (read them back from the file).

🔴 Then compose the message by reading and following the chat template **exactly** —
[`references/chat-template.en.md`](references/chat-template.en.md) is the structure source of truth for **ALL**
buyer languages (no separate Chinese template): write the entire message in the buyer's query language, one
language per message, never mix.
🔴 The final message opens with the verdict paragraph's first word — ZERO sentences before it: never confirm
what was just done, never announce what will be output next, never describe following a template; drop any
such execution-state sentence instead of sending it.
It is a fixed executive summary of the saved report — verdict-first paragraph, then **four dimension sections**
(market size / trend / competition / profit), each = one read sentence + the matching ```widget card pasted
verbatim, then exactly four `<follow>` chips (the chips are the ONLY next-step vehicle —
no "Next Step" section or prose next-step list). NO Full-Research-Report section and NO report-link line —
the platform auto-renders a document card for the report file saved this turn (the single entry point); an
extra inline link makes it appear twice. The chat verdict and all numbers MUST match the saved report, and the message emits NO `:::slot[...]`
marker (so no product card is shown).

### Self-Check (before output)
- [ ] Report saved via `write`, in the user's language?
- [ ] All 6 sections present; every number traces to a real artifact (no fabrication)?
- [ ] Estimates marked "rough est."; money as `USD x`; the `source=query` keyword bolded?
- [ ] Final chat follows `chat-template.en.md`: correct table branch (children vs no children), verdict identical to the report, four follow-up chips?
