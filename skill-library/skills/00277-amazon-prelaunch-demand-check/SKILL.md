---
name: amazon-prelaunch-demand-check
description: >-
  Validate real Amazon demand before sourcing: demand score, realistic monthly sales range, and scenario-based first-order quantity. Use for product ideas: worth doing, and how much to order first.
metadata:
  version: "1.0.0"
---

# Validate-Before-You-Source

## What this does and why

People about to source a product tend to fixate on the product and the factory quote, and skip the
one question that actually decides whether they make or lose money: **does the market buy enough of
this, and how much can a newcomer realistically expect to sell?** Getting that wrong is expensive in
one specific direction — ordering a big batch of something that barely sells. A 5,000-unit order of
a product the market moves 30/month is ~14 years of inventory tying up cash and warehouse space.

This skill answers, before any RFQ goes out:

1. **Is there real demand?** — a 0–100 demand score and a **go / caution / no-go** verdict.
2. **How much will it actually sell?** — a realistic monthly unit volume *for a new entrant* (not
   the category leader), and first-order quantity **scenarios** (conservative / base / aggressive)
   built from explicit lead-time, freight, safety-stock, MOQ, and test-period inputs — never one
   pseudo-precise number.
3. **Is the order you're considering sane?** — if a planned quantity is given, how many months of
   inventory that represents, with a stop-flag when it's wildly oversized.

It gets **all of its data from the host's Jungle Scout `js_*` MCP tools**, so it is portable: it
runs the same inside a sourcing flow as in a standalone session. There are no API keys or scripts.
The output includes a machine-readable JSON verdict block that a sourcing flow can parse to gate or
auto-size an RFQ. If those tools are not available, say so and stop — do not invent or substitute
data for a real sourcing decision.

## When to reach for it

Trigger before sourcing decisions, not after. Typical openings: "I want to sell/source/private-label
X", "about to place an order for N units", "is X a good product to launch", "how many should I order
for my first batch", "run the numbers on this before I request quotes". Run this as the validation
step that precedes building or sending an RFQ or kicking off a supplier search — pass the resulting
verdict block forward.

**Scope boundary — route, don't stretch.** This skill is for users who **already have a specific
product idea and need to judge the market**. For adjacent requests, hand off instead of forcing a
fit: the user doesn't know what to sell yet → help them narrow to one concrete product idea first,
do not validate a whole category; the user already has costs or a supplier quote and needs a profit
call → `amazon-prelaunch-margin-check`; the user already has a product, price, and launch plan →
`amazon-prelaunch-ad-budget`.

## Workflow

### 1. Gather the inputs

You need at least one of:

- **A product idea / keyword** — e.g. "collapsible silicone dog bowl". Best when the user is
  describing something they want to make.
- **A seed competitor ASIN** — e.g. "B0CP9Z56SW". Best when they're looking at a specific listing;
  derive the primary keyword from the ASIN (see step 2).

Pick up anything the user volunteered; ask only for what's missing:

- **Planned order quantity** (optional but high-value) — if they mention a number ("I was going to
  order 5,000"), use it; this turns on the over-order check, which is the whole point.
- **Marketplace** (default `us`) and an optional **category** to narrow the competitor set.
- **Posture** — `balanced` (default), `conservative`, or `aggressive` — where the go/no-go
  thresholds land.
- **First-order inputs** (optional) — production lead time, freight/transit time, safety stock,
  supplier MOQ, and how long they want to test sell-through before reordering. Whatever they don't
  give, fill from the defaults in "First-order scenarios" below and **state every default you used**
  in the output.

Ask in conversation only if the idea/ASIN is genuinely missing; if the host provides an interactive
question tool such as `ask_user`, you may use it — treat it as optional, never required. Otherwise
just run.

### 2. Gather the evidence from the MCP tools

1. **Resolve the primary keyword.** If given an idea, use it. If given an ASIN, call
   `js_keywords_by_asin` with `asins: [ASIN]`, sorted `-monthly_search_volume_exact`, and take the
   top relevant term (and/or read the ASIN's title/category from `js_product_database_query`).
2. **Find the competitor set.** `js_product_database_query` with `include_keywords: [primary
   keyword]` (plus `categories` if given), `sort: -revenue`, top ~15–25. Read each comp's
   `approximate_30_day_units_sold`, `price`, `reviews`, `rating`, `listing_quality_score`,
   `date_first_available`.
3. **Search demand.** `js_keywords_by_keyword` on the primary keyword →
   `monthly_search_volume_exact`.
4. **Momentum (real time series only).** `js_sales_estimates` on the top ~3 competitor ASINs (units
   series: last 30 days vs. the prior 30) and `js_historical_search_volume` on the primary keyword.
   A single call to either tool covers **at most 366 days** — never request a longer range in one
   call.

### 3. Compute the score and the volumes

Apply the model exactly as specified in the two methodology sections below — these are deterministic
rules, not vibes:

1. **Score** — normalize each of the four signals to 0–100 per "How the demand score is built",
   blend with the stated weights, apply the missing-data and small-sample rules, map to the verdict
   band for the chosen posture.
2. **Realistic monthly volume** — p10 / p25 / median of the comparable set's monthly units, with the
   survivorship-bias caveat stated (see "Realistic volume and first-order scenarios").
3. **First-order scenarios** — conservative / base / aggressive quantity ranges from the explicit
   inputs (production lead time, freight transit, safety stock, MOQ, test period), listing every
   default assumption you used.
4. **Confidence** — per the confidence and forced-downgrade rules, and — if a planned quantity was
   given — the inventory-cover / over-order check.

### 4. Interpret and present

Relay the result in your own words, leading with the verdict and the numbers that matter: realistic
monthly volume (as a p10–median range) and the first-order scenarios. Then:

- If a **planned order check** came back `caution` or `danger`, surface it prominently — this is the
  costliest mistake the skill exists to prevent. Frame it constructively: the product may be fine,
  the *quantity* is the problem; recommend the base-scenario first order and reordering on
  sell-through.
- Explain the score using the four signals (below) rather than treating it as a black box — show
  each signal's raw inputs and its normalized 0–100 value, so the result is reproducible.
- **Label every inferred conclusion with its evidence, assumptions, and confidence.** The demand
  score, volume percentiles, and first-order scenarios are model outputs: state the data they came
  from (which tool, how many comparables), the assumptions used (especially every defaulted
  first-order input), and the confidence level. Direct tool readings (e.g. a keyword's search
  volume) are labeled as estimates from Jungle Scout, not actuals.
- Present the first order as **scenario ranges, never a single number**, and always pair them with
  the survivorship-bias caveat: the comparable set is the distribution of *currently observable,
  active* sellers — failed launches are absent — so p25 is not a floor a new product is guaranteed
  to reach.
- Respect the **confidence** level. On low confidence (few competitors, no trend data), say so and
  recommend the conservative scenario or more research rather than a hard verdict.
- Honor the **data caveats** — don't claim a measured "BSR trend" or "review-velocity time series";
  the data gives snapshots, and you derive momentum honestly (see Methodology).

End with the **JSON verdict block** (a fenced `json` block; if a writable workspace exists, also
save it as a `.json` file and link it — otherwise keep everything inline, and do not reference a
specific client or a fixed workspace name).

### 5. Feed the sourcing flow (optional enhancement, never a blocker)

The `json` verdict block is the contract for downstream automation:

- Treat `verdict: "no_go"` or a `planned_order_check.flag: "danger"` as a gate — don't proceed to
  RFQ or supplier search without the user explicitly overriding.
- On a `go` / `caution` verdict, use the supplier sourcing tool `product_supplier_search` —
  the plugin declares it in `plugin.json` (`requiredBuiltinTools`), so on AccioWork it should
  be available whenever this plugin is active. Call it with the product keyword in the user's
  original wording to surface real suppliers, then size the first PO from
  `suggested_initial_order_units.base`. If the tool is nevertheless unavailable (declaration
  not in effect, environment error), degrade gracefully: output a paste-ready sourcing brief
  (product keyword, target specs, first-order scenario range) that the user can copy into any
  sourcing assistant, and never block the deliverable on the tool.
- Use `suggested_initial_order_units.base` (with the conservative/aggressive bounds shown) to
  pre-fill the RFQ/order quantity instead of an arbitrary number, and `realistic_monthly_units` to
  set reorder expectations.
- If a writable workspace exists, persist the block there so the sourcing record carries the demand
  rationale; otherwise keep it inline.

Suggested shape:

```json
{
  "verdict": "go | caution | no_go",
  "demand_score": 0,
  "confidence": "low | medium | high",
  "realistic_monthly_units": {"low": 0, "central": 0, "high": 0},
  "suggested_initial_order_units": {"conservative": 0, "base": 0, "aggressive": 0},
  "first_order_assumptions": {
    "production_lead_time_days": 30,
    "freight_transit_days": 45,
    "safety_stock_months": 0.5,
    "test_period_days": 60,
    "moq_units": null,
    "defaulted": ["production_lead_time_days", "freight_transit_days", "safety_stock_months", "test_period_days"]
  },
  "planned_order_check": {"planned": 0, "months_of_cover": 0, "flag": "ok | caution | danger"},
  "signals": {"demand_depth": 0, "search_demand": 0, "momentum": 0, "winnability": 0},
  "data_caveats": ["..."]
}
```

## MCP errors and empty results

- An empty `data[]` is a successful call with no records (**observed empty**) — it is not proof of
  zero demand. Cross-check the keyword, marketplace, and filters before concluding anything, and say
  "no records returned," not "no demand."
- Tool errors (permission, throttle, invalid ASIN, invalid date range, unsupported marketplace):
  report the gap, skip the affected step, and lower confidence on any conclusion that depended on
  it. Never fabricate missing numbers.
- If a momentum series (competitor units or keyword history) is missing, drop the momentum signal's
  weight honestly and mark the result low-confidence — do not present a score computed on partial
  data as if it were complete.

## How the demand score is built (reproducible rules)

The 0–100 score is a weighted blend of four signals, each normalized to 0–100 by the fixed formulas
below. Apply them exactly as written so another run on the same data reproduces the same score.
`clamp(x)` means pin to [0, 100]; `ln` is natural log; percentiles use linear interpolation between
closest ranks (the spreadsheet/numpy default).

**Preprocessing (applies to all signals).** The comparable set is the competitor list from step 2.
Call its size `n`. Before any statistic: drop comps missing `approximate_30_day_units_sold`; keep
comps with units ≤ 0 in `n` but exclude them from unit percentiles; winsorize units and reviews by
capping values above the set's own p95 at p95 (one viral outlier must not dominate the medians).

**Signal 1 — Demand depth (weight 35%).** Is there real, monetizable volume? Input: median monthly
units `M` of the comparable set (winsorized).

`score = clamp(round(100 · ln(1 + M) / ln(1 + 2000)))`

Anchor: a market whose median seller moves 2,000 units/month saturates at 100 (M=10 → ~32,
M=100 → ~61, M=1000 → ~91). Report total set units as context, but the score uses the median only.

**Signal 2 — Search demand (weight 20%).** Is anyone looking? Input: the primary keyword's exact
monthly search volume `S`.

`score = clamp(round(100 · ln(1 + S) / ln(1 + 50000)))`

Anchor: 50,000 exact searches/month saturates (S=500 → ~57, S=5,000 → ~79, S=20,000 → ~92).

**Signal 3 — Momentum (weight 20%).** Growing or dying? Two components; the signal is the mean of
whichever are available:

- *Competitor units momentum* — for each sampled ASIN (top ~3), `r = mean daily units over the last
  30 days ÷ mean daily units over the prior 30 days`; take the median `r` across ASINs and map
  `component = clamp(round(50 + 100 · (r − 1)))` (flat = 50, +50% = 100, −50% = 0).
- *Keyword momentum* — same mapping on `r = mean weekly exact volume over the last 4 full weeks ÷
  mean over the prior 4 weeks`.

If a prior-period mean is 0, set that component to 50 and note "no baseline". If **both** components
are unavailable, drop the whole signal (see missing-data rules).

**Signal 4 — Winnability (weight 25%).** Can a newcomer break in? Three sub-scores:

- *Review moat (60% of signal)* — median comp reviews `R` (winsorized):
  `clamp(round(100 · (1 − ln(1 + R) / ln(1 + 5000))))` (R=10 → ~72, R=100 → ~46, R=1,000 → ~19).
- *Review velocity (20%)* — median over comps of `reviews ÷ max(1, months since
  date_first_available)` = `V` (an explicit proxy, not a measured rate):
  `clamp(round(100 · (1 − ln(1 + V) / ln(1 + 50))))`.
- *Listing gap (20%)* — mean comp `listing_quality_score` normalized to 0–100 (if observed values
  are ≤ 10, scale ×10 first) = `L`: `clamp(round(100 − L))`. If the field is absent, reweight to
  75% moat / 25% velocity.

`winnability = round(0.6 · moat + 0.2 · velocity + 0.2 · listing_gap)`

**Missing data.** If a signal's inputs are unavailable (tool error, empty result, absent field),
drop that signal and renormalize the remaining weights proportionally (`w' = w ÷ Σ remaining`), and
record the drop in `data_caveats`. If **2 or more of the 4 signals** are dropped, force confidence
to `low` and cap the verdict at CAUTION — never present a partial-data score as complete.

**Small samples.** `n ≥ 10`: full strength. `5 ≤ n < 10`: compute normally, confidence capped at
`medium`. `3 ≤ n < 5`: compute but label "thin comparable set", force confidence `low`, verdict
capped at CAUTION. `n < 3`: **do not compute a score at all** — report the raw figures, mark the
result "insufficient comparables", and recommend broadening the keyword or supplying a category.

**Verdict bands (balanced posture): GO ≥ 65, CAUTION 45–64, NO-GO < 45.** Conservative posture
shifts thresholds up 10 (GO ≥ 75, CAUTION 55–74); aggressive shifts down 10 (GO ≥ 55,
CAUTION 35–54). **Force-cap:** if median units < 30/month *and* exact search volume < 300/month, the
verdict is NO-GO regardless of the blended score.

**Confidence and forced downgrades.** Start from: `high` if n ≥ 10, both momentum components are
available, and no signal was dropped; `medium` if n ≥ 5 with at most one gap; `low` if n < 5, both
momentum components are missing, or ≥ 2 signals were dropped. Then apply forced downgrades, one
level each: any tool error on a step that feeds a used signal; any signal renormalized due to
missing data. Confidence can never rise through a downgrade. On low confidence, recommend the
conservative first-order scenario or more research — not a hard verdict.

## Realistic volume and first-order scenarios

**Realistic monthly volume** is deliberately *not* the category average. A competent new entrant
lands in the lower-middle of the existing pack for the first several months, so report a range:
`low = p10`, `central = p25`, `high = median` of the comparable set's monthly units (winsorized,
linear-interpolation percentiles).

**Survivorship bias — always state this with the numbers.** The comparable set is the distribution
of *currently observable, active* listings; products that launched and died are absent from it. So
p25 describes the lower-middle of **surviving** sellers — it is **not** a floor a new product is
guaranteed to reach, and a real launch can land below p10. This caveat belongs in both the prose
output and `data_caveats`.

**First-order scenarios.** The first order is a function of explicit inputs — never one
pseudo-precise number. Inputs, with defaults used when the user doesn't supply them (state every
default you used, in prose and in `first_order_assumptions`):

| Input | Default if not given |
|---|---|
| Production lead time | 30 days |
| Freight / transit time | 45 days (ocean, port-to-door) |
| Safety stock | 0.5 month of scenario demand |
| Test period before reordering | 60 days |
| Supplier MOQ | none (used only if the user provides one) |

Compute pipeline months `P = (lead time + transit) ÷ 30` and test months `T = test period ÷ 30`,
then three scenarios, each `ceil(scenario units × cover + safety stock)`, rounded to presentable
numbers (nearest 10 or 50), and reported as a **range**, not a point:

- **Conservative** — p10 demand, cover = `P` months only: enough to survive until the first reorder
  can arrive; the reorder decision waits for sell-through proof. Lowest cash at risk, highest
  stockout risk.
- **Base** — p25 demand, cover = `T + P` months: observe the full test window, then reorder without
  a gap. The default recommendation.
- **Aggressive** — median demand, cover = `T + P + 1` months: for strong-score markets where a
  stockout costs ranking. Highest overstock risk.

If a supplier MOQ is given and a scenario falls below it, report the MOQ as the effective floor for
that scenario and show the months of cover the MOQ implies at that scenario's demand — an MOQ that
forces a year of inventory is a finding, not a footnote. If the user's cash plan can't cover the
base scenario, say so explicitly and scale toward conservative, naming the stockout risk accepted.

## Methodology honesty: what the data does and doesn't give

The Jungle Scout data returns **current** BSR and **current** review counts (snapshots), not time
series for either. So do not fabricate a "BSR trend" or a "review-velocity chart." Instead:

- **Momentum / trend** comes from the units-sold daily series (`js_sales_estimates`) and the keyword
  search-volume history (`js_historical_search_volume`) — both of which *are* real time series.
- **Review velocity** is approximated as `reviews ÷ months-since-launch` (using each competitor's
  `date_first_available`) — a defensible proxy for how fast a listing accrues social proof; label it
  as a proxy in the output.

State these caveats when presenting results so no one over-reads the numbers.

## Evidence and limits (state these to the user when relevant)

- Units sold, revenue, and search volume are Jungle Scout modeled estimates, not actuals — good for
  comparison and trend, not exact accounting.
- Distinguish clearly in the output between direct tool data and your own inference: the demand
  score, realistic volume, and first-order scenarios are model outputs built on those estimates; the
  review-velocity figure is an explicit proxy, not a measured rate.
- The volume percentiles carry **survivorship bias**: they describe currently active sellers only.
  Never present p25 as a guaranteed floor for a new launch.
- Thin evidence (few competitors, no trend series) means low confidence — recommend the conservative
  first-order scenario or more research rather than a hard verdict.
- Be economical with tool calls: keep the competitor set and the momentum ASINs to a reasonable
  number.

## Troubleshooting

- **`forbidden_marketplace`** — the account behind the tools isn't authorized for that marketplace;
  pick one it covers.
- **`invalid_asin` on a seed ASIN** — invalid/unsupported ASIN or insufficient rank data; use the
  idea/keyword instead.
- **No competitors found** — the keyword is too narrow or misspelled; broaden it or supply a
  category.
- **Tools not available** — the host's Jungle Scout `js_*` MCP tools aren't connected; ask the user
  to connect them. Do not work around it by fetching the data another way.

## Reference

`references/jungle_scout_mcp.md` documents the exact `js_*` MCP tools, parameters, response fields,
and the snapshot-vs-time-series gotchas used here — read it to extend the skill or interpret a
field.
