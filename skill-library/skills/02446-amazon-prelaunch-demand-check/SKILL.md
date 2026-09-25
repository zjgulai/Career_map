---
name: amazon-prelaunch-demand-check
title: "amazon-prelaunch-demand-check"
description: "- Validate real Amazon demand before sourcing: demand score, realistic monthly sales range, and scenario-based first-order quantity. Use for product ideas: worth doing, and how much to order first. 【需Jungle Scout MCP】 触发词：上市前需求验证、首单备货量测算、需求评分、选品验证、首单数量建议。"
metadata: 
  version: "1.0.0"
disable-model-invocation: true
enabled: "true"
user-invocable: true
workflow: "收集产品想法或竞品ASIN与订单输入；计算需求评分并给出 go/caution/no-go 判定；测算新卖家月度销量与首单备货情景；校验下单数量是否超量"
input_contract: 产品想法或竞品ASIN（可选：计划下单量、目标市场、风险偏好）
output_contract: 需求评分与做/观望/不做判定、真实月销区间、首单备货情景区间，附依据与置信度
example: 说「这个折叠狗碗值得做吗」→ 得到需求评分、做/不做判定与首单备货区间。

---


# Validate-Before-You-Source


> ⚠️ **环境说明（DSH）**：本机未接入 Jungle Scout MCP（js_*）工具。请基于用户提供的数据或公开检索完成分析，明确标注估算项；勿调用不存在的 js_* 工具。

## What this does and why

See references/overview.md

## When to reach for it

See references/when-to-use.md

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

See references/sourcing-flow.md

## MCP errors and empty results

See references/troubleshooting.md

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

See references/scoring-edge-rules.md

**Verdict bands (balanced posture): GO ≥ 65, CAUTION 45–64, NO-GO < 45.** Conservative posture
shifts thresholds up 10 (GO ≥ 75, CAUTION 55–74); aggressive shifts down 10 (GO ≥ 55,
CAUTION 35–54). **Force-cap:** if median units < 30/month *and* exact search volume < 300/month, the
verdict is NO-GO regardless of the blended score.


## Realistic volume and first-order scenarios

See references/first-order-scenarios.md

## Methodology honesty: what the data does and doesn't give

See references/data-honesty.md

## Evidence and limits (state these to the user when relevant)

See references/troubleshooting.md

## Troubleshooting

See references/troubleshooting.md

## Reference

`references/jungle_scout_mcp.md` documents the exact `js_*` MCP tools, parameters, response fields,
and the snapshot-vs-time-series gotchas used here — read it to extend the skill or interpret a
field.

<!-- 81-style-unified:refined -->
## 中文触发词与安全边界

See references/zh-meta.md

> 2026-09-07 SkillOpt b5 rollout：3 任务均分 87，轻量修复
