---
name: ad-spend-planner
description: >-
  Size a pre-launch Amazon ad test budget: keyword CPC, budget scenarios, expected vs breakeven vs target ACoS. 用于已有产品和售价，问广告要烧多少钱、目标 ACoS 怎么定。
---

# Ad Spend Planner

## Reader-facing language

Follow the conversation language defined in `AGENTS.md` for prose, table headings,
chart titles/axes/legends, confidence labels and explanatory budget labels. English
examples are not fixed output text: in Chinese, render planning labels such as
`live spend` / `reserve` as “计划花费” / “预留”, and `Medium` as “中”. Preserve
required JSON/CSV contract fields and enums, source/brand names, actual keywords
and standard abbreviations such as CPC and ACoS. This changes presentation only,
not calculations or whether spending is planned versus actually observed.

Estimate a starter Amazon Sponsored Products budget for a product's main
keywords, before any spend happens. The point is to stop people from launching
blind: given an ASIN or a few seed keywords, return a defensible
daily/monthly/launch budget and a per-keyword table of CPCs, conversion rates,
and market-expected ACoS. When a price and profit inputs are available, also
return the product's breakeven ACoS and a suggested target ACoS below it, so a
human or an automated ad tool can judge not just what the ads cost, but
whether the product can afford them.

This skill sizes **advertising test budgets and keyword customer-acquisition
budget scenarios**. It does not compute a "cost to rank": the available data
shows search volume, CPC, competition, and conversion signals, but cannot
prove that a given amount of ad spend lifts organic rank. Any ranking goal in
the output is labeled an experimental hypothesis paired with to-be-verified
metrics, never a promised outcome.

All data comes from the host's **Jungle Scout `js_*` MCP tools** — you call the
tools directly and do the budget math yourself. There are no API keys to manage
and no scripts to run. The tools this skill uses are `js_keywords_by_asin`,
`js_keywords_by_keyword`, `js_share_of_voice`, and `js_sales_estimates`. If
those tools aren't available, say so and stop — do not substitute another data
source or fabricate numbers.

## When to use

Use this for any "what will it cost to advertise?" question about an
Amazon product or keyword set: launch planning, PPC budget sizing, ad test
budget scenarios, target-ACoS selection against a breakeven ceiling, or
generating campaign-seed parameters for a downstream tool to place. If the
user only wants raw keyword stats (volume, CPC) with no budgeting, the keyword
tools alone are enough — but the moment money, budgets, ACoS, bids, or "how
much" enters the question, this skill is the right tool.

Scope boundary: this skill assumes the user **already has a product, a price
(or a plan to set one), and a launch plan**. If the user is still deciding
whether the product is worth doing at all, route them first: demand and market
validation is `validate-before-you-source`'s job, and landed-cost / fee /
margin math is `margin-reality-check`'s job. This skill consumes the outputs
of that earlier work — most importantly the per-unit pre-ad profit, which
drives the breakeven ACoS below.

## Workflow

### Step 1 — Gather the inputs

You need at minimum an **ASIN** or one or more **seed keywords**. Everything
else has a sensible default. Confirm or collect:

- **ASIN and/or keywords.** An ASIN drives a reverse-ASIN lookup
  (`js_keywords_by_asin`) to discover the product's real ranking keywords; seed
  keywords drive expansion (`js_keywords_by_keyword`). You can use both — merge
  and de-duplicate by keyword name.
- **Marketplace** (default `us`; supports us, uk, de, in, ca, fr, it, es, mx,
  jp).
- **Price** — needed for any ACoS. If an ASIN is given, fetch the latest price
  from `js_sales_estimates` so you usually don't need to ask. For a
  keyword-only run, ask for the planned price (ACoS is meaningless without
  it). Ask in chat — if the host provides an interactive question tool such as
  `ask_user` you may use it, but treat it as optional, never required. If no
  price is available at all, continue in budget-only mode (see Step 3) — never
  substitute an arbitrary placeholder price for a real one.
- **Pre-ad profit per unit** (optional; needed for breakeven and target ACoS) —
  price minus landed cost minus Amazon fees per unit, or equivalently a pre-ad
  margin %. If the user has a `margin-reality-check` result, reuse its
  per-unit profit. Without this input you still output budgets and
  market-expected ACoS, but breakeven and suggested target ACoS are reported
  as "not computable — profit inputs missing" rather than guessed.
- **Aggressiveness** (optional). The **capture rate** is the share of each
  keyword's daily searches you aim to win as ad clicks during the launch push
  (default 0.03 — roughly sponsored-ad CTR × impression share; 0.05–0.10 is
  aggressive). Higher = more aggressive launch = bigger budget. Mention this
  lever if the user wants a more/less aggressive plan.

Don't over-interview. If the user gives you an ASIN, run immediately with
defaults and then offer to tune capture rate, conversion rate, price, profit
inputs, or launch window.

### Step 2 — Pull the keyword set from the MCP tools

- **If you have an ASIN:** call `js_keywords_by_asin` with `asins: [ASIN]`,
  sorted by `-monthly_search_volume_exact`. This returns the terms the product
  actually ranks for — proven demand.
- **If you have seed keywords:** call `js_keywords_by_keyword` once per seed
  (or pass combined `search_terms`), sorted by `-monthly_search_volume_exact`.
- **Merge and de-duplicate** by `name`. Drop keywords below the volume floor
  (default `monthly_search_volume_exact` ≥ 50). Keep the top ~15 by exact
  volume as the planned set (raise/lower on request).

For each kept keyword you need: `monthly_search_volume_exact` (fall back to
`monthly_search_volume_broad`), `ppc_bid_exact` (fall back to `ppc_bid_broad`),
and the competition context (`sponsored_product_count`,
`organic_product_count`, `ease_of_ranking_score`) for the table.

### Step 3 — Enrich with conversion rate and price

- **Conversion rate (CVR):** for the planned keywords (cap at ~10 to stay
  light), call `js_share_of_voice` and average the `conversion_rate` of its
  `top_asins`. Use that per-keyword CVR where available; otherwise fall back to
  a stated default (0.10). `js_share_of_voice` also returns
  `exact_suggested_bid_median` — keep it as a market cross-check against
  `ppc_bid_exact`, but let the per-keyword CPC drive the math.
- **Price:** if you have an ASIN and no user price, call `js_sales_estimates`
  for the ASIN over the last ~30 days and use the most recent
  `last_known_price`. For a keyword-only run with no price, do **not** invent a
  placeholder price. Finish the budget math (clicks, spend, and budgets need no
  price) and render ACoS only as **price scenarios**: 2–4 labeled price points
  spanning the niche's plausible range — anchor them on competitor prices if
  you pulled any (e.g. `js_sales_estimates` on top ASINs from Share of Voice),
  otherwise use clearly labeled illustrative values — or ask the user to
  supply the price and re-run. Every scenario must state that its price is an
  assumption, and the brief must say plainly: "ad budget: computable;
  profitability: not yet judgeable without a real price."

### Step 4 — Compute the plan

Apply the model below per keyword, then total it. (Full rationale and the
choice of each lever live in `references/methodology.md` — read it if the user
questions a number or wants to change the methodology.)

Per keyword *k*, with capture rate `c`, conversion rate `cvr`, price `P`
(or each price scenario `P`):

```
daily_searches          = monthly_search_volume_exact / 30.4
target_clicks/d         = daily_searches × c
daily_spend             = target_clicks/d × ppc_bid_exact
daily_orders            = target_clicks/d × cvr
market_expected_ACoS(k) = ppc_bid_exact / (P × cvr)
```

Plan totals:

```
starter_daily_budget   = Σ daily_spend (over the planned keywords)
starter_monthly_budget = starter_daily_budget × 30.4
launch_budget          = starter_daily_budget × launch_days (default 30)
expected_ACoS          = Σ daily_spend / Σ (daily_orders × P)
```

`expected_ACoS` is the order-weighted blend of per-keyword market-expected
ACoS, so high-volume keywords influence it more — which matches how a real
campaign's blended ACoS behaves. Note that ACoS is independent of capture
rate: doubling capture rate doubles the budget but leaves ACoS unchanged.

Then compute the **three ACoS numbers, kept strictly separate**:

1. **Market-expected ACoS** — the blend above: what the market's current CPCs
   and estimated CVRs imply at price `P`. Pure market signal; it says nothing
   about whether the product can afford it.
2. **Breakeven ACoS** — `pre_ad_profit_per_unit / P`. This is the product's
   affordable ceiling: at this ACoS advertising exactly consumes the pre-ad
   contribution profit, and above it every ad order loses money. It requires
   the profit input; without it, report "not computable" instead of
   estimating one.
3. **Suggested target ACoS** — strictly below breakeven; default `0.7 ×
   breakeven_ACoS` for steady state (leaves ~30% of contribution profit after
   ads). A launch push may deliberately run at or above breakeven as a
   **time-boxed test** with its own capped budget, labeled as such.

**Affordability verdict:** compare market-expected ACoS against the breakeven
ACoS for each price scenario. `expected < breakeven` → ads can plausibly run
profitably at current market costs (state the margin left). `expected ≥
breakeven` → at current CPC/CVR every ad order loses money; the plan is only
justifiable as a time-boxed test, and the brief must say so. Without a real
price and the profit input, skip the verdict and state that profitability is
not yet judgeable.

### Step 5 — Present the result

Lead with the numbers people came for: **starter budget** (daily and
monthly), **launch budget**, and the **ACoS block** — market-expected ACoS,
breakeven ACoS (or "not computable — profit inputs missing"), and suggested
target ACoS — plus the one-line affordability verdict. Then show the
per-keyword table so the recommendation is auditable (keyword · exact volume ·
CPC · CVR · market-expected ACoS · daily spend · competition), and state the
key assumptions (capture rate, conversion-rate source, launch window, price
source, profit input) plainly — a budget whose basis is hidden is not
trustworthy. Every inferred figure (budget totals, all ACoS values, the
verdict) carries its evidence (which tool field or input fed it), its
assumptions, and a confidence label (high / medium / low) in the brief.

If the user asked about ranking: present organic-rank movement only as an
**experimental hypothesis** — e.g. "if this budget sustains N orders/day on
keyword k through the test window, watch weekly organic rank on k as the
to-be-verified metric." Never promise a rank outcome or quote a "cost to
rank".

Deliverables:

- A short **markdown brief** (the human read) — always shown in chat; if the
  environment has a writable workspace, also save it there and link the file.
- The **per-keyword table** for the user to sort and tweak. Put the table in the
  chat/markdown output; if a writable workspace exists, also save it as a CSV
  file and present the file link.
- A **campaign-seed JSON handoff** — inputs, assumptions, plan totals, the
  three ACoS figures, any price scenarios, the affordability verdict, and the
  per-keyword rows — that an automated ad tool can ingest. Emit it as a fenced
  `json` block, and/or as a saved `.json` file when a writable workspace
  exists. Do not reference a specific client or a fixed workspace name.

After presenting, offer to re-run with a different capture rate, conversion
rate, price, profit input, launch window, or keyword set so the user can
compare aggressive vs. conservative.

If the run was keyword-only and no price was supplied, present the ACoS block
as the labeled price scenarios and state: "ad budget: computable;
profitability: not yet judgeable." Getting a real price (and the pre-ad profit
per unit) is the single biggest accuracy win — offer to re-run the moment the
user has them.

## MCP errors and empty results

- An empty `data[]` is a successful call with no records (**observed empty**) —
  it is not proof of zero demand. Cross-check the ASIN, seed, marketplace, and
  filters before concluding anything, and say "no records returned," not "no
  demand."
- Tool errors (permission, throttle, invalid ASIN, unsupported marketplace):
  report the gap, skip the affected step, and lower confidence on any
  conclusion that depended on it. Never fabricate missing numbers — a keyword
  with no returned CPC or volume is dropped and reported, not guessed.
- If the response lacks the expected `data[]` array, treat it as schema drift:
  stop, report the drift, do not guess field names. See
  `references/jungle_scout_mcp.md`.

## Notes and failure modes

- **Sparse keywords:** keywords with no search volume or no CPC can't be
  budgeted — drop them and report how many you actually used.
- **Head terms look expensive:** for very high-volume head terms, even a 0.03
  capture rate implies a large absolute click count and budget. That is real
  signal that the head term is expensive; the per-keyword table lets the user
  trim it.
- **No price for a keyword-only run:** still output CPCs, budgets, and the
  per-keyword economics that don't need price; output ACoS only as labeled
  price scenarios. The brief must separate "ad budget: computable" from
  "profitability: not yet judgeable" — never emit a single ACoS built on an
  invented price.
- **"Cost to rank" questions:** the tools have no causal model linking ad
  clicks/orders to organic rank. Answer with budget scenarios plus a
  hypothesis and to-be-verified metrics, not a dollar cost of ranking.

## Evidence and limits (state these to the user when relevant)

- Search volume, CPC bids, conversion rates, and price are Jungle Scout modeled
  estimates, not actuals — good for planning and comparison, not exact
  accounting.
- Distinguish clearly in the output between direct tool data (volume, CPC, CVR
  per keyword) and your own inference (the budget totals and ACoS figures
  derived from the capture-rate and other assumptions).
- The three ACoS numbers answer different questions: market-expected (what the
  market implies), breakeven (what the product can afford), suggested target
  (what to set). Never collapse them into one "target ACoS".
- The capture rate and any fallback CVR are planning assumptions — label them
  as such next to the numbers they influence.
- Nothing in this data proves that ad spend causes organic rank gains; any
  ranking goal is an experimental hypothesis with to-be-verified metrics.
- Without a real price, ACoS conclusions are scenario illustrations; without a
  pre-ad profit input there is no breakeven or target ACoS — say so rather
  than filling the gap.
- Be economical with tool calls: cap the keyword set for CVR enrichment.

## References

- `references/methodology.md` — the full derivation, the three-ACoS model
  (market-expected / breakeven / suggested target), the price-scenario rule,
  and guidance on choosing the capture rate. Read it if the user questions the
  numbers or wants to change the methodology.
- `references/jungle_scout_mcp.md` — the Jungle Scout `js_*` MCP tools this
  skill calls, their parameters, and the exact fields consumed (CPC, search
  volume, competition counts, suggested bids, conversion rates, price).
