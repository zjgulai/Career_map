---
name: margin-reality-check
description: >-
  Check whether a product's economics work: supplier quote/landed cost plus live Amazon prices and fees, with fee scenarios and GO/CAUTION/NO-GO. 用于已有成本或供应商报价，问利润够不够。
---

# Margin Reality Check

## Reader-facing language

Follow the conversation language defined in `AGENTS.md` for prose, table headings,
chart titles/axes/legends, confidence labels and explanations. English examples
are not fixed output text: in Chinese, `Medium` becomes “中”; explain a verdict
in Chinese and optionally retain its code, e.g. “可行（GO）”. Preserve required
JSON/CSV contract fields and enums, source/brand names, actual keywords and
standard abbreviations. Localize the display layer, not verdict thresholds,
calculations or machine-readable values.

## What this is for

Sourcing a product that "looks cheap" is not the same as a product that makes
money. By the time Amazon's FBA fee, referral fee, and the going market price are
accounted for, a unit that lands at $4 can be a great buy or a dead end — and the
difference decides how (and whether) to negotiate. This skill answers, before any
PO is placed: **at the price the market will actually pay, what is the margin per
unit, and is there a viable price range at all?**

It uses one primary data source — the host's **Jungle Scout `js_*` MCP tools**,
specifically the **`js_product_database_query`** tool — which returns, for up to
100 competing listings in one call, each product's `price` and a `fee_breakdown`
(`fba_fee`, `referral_fee`, `variable_closing_fee`, `total_fees`). From that
single call you derive the average selling price, a fee model, and the competitor
price band, then layer the user's landed cost on top to project margin. There are
no API keys or scripts here; if the `js_product_database_query` tool is not
available, say so and stop — do not substitute another data source or fabricate
numbers.

## Inputs to gather

You need two things; everything else has a sensible default.

1. **Landed cost per unit (required).** The all-in cost to get one unit into an
   Amazon fulfillment center: supplier/FOB price + freight + duty + prep. In a
   sourcing chat this is usually already known from the supplier quote — use it
   directly. If only a unit/FOB price is known, say so in the output, since
   freight and duty materially change the answer.
2. **Product identity (one of):** a **keyword** describing the product, a competitor
   **ASIN**, or a **category**. Keyword is the most common; an ASIN is best when
   there is a clear "this exact product" reference; category narrows a broad keyword.

Optional: **marketplace** (default `us`), an **expected price** (defaults to the
competitor median), the verdict thresholds (**green** default 25%, **yellow**
default 15%), and — most valuable for fee accuracy — the target product's
**known FBA fee or size/weight tier** (e.g. from Amazon's FBA calculator, a
seller account, or a similar product the user already sells). Any user-provided
fee input takes priority over the competitor-derived proxy described below.

If the user has not given a landed cost, ask for it — it is the one number the skill
cannot infer. If they have not described the product clearly enough to search, ask
for a keyword or an example ASIN. Also ask whether they know the target unit's
FBA fee or packaged size/weight — it turns a provisional, proxy-based verdict
into a firm one. Ask in the conversation; if the host provides an interactive
question tool such as `ask_user`, you may use it — treat it as optional, never
required.

## Workflow

1. **Confirm the landed cost and what's in it** (FOB only, or freight + duty too),
   and the product to search for. A quick restatement avoids a confident-but-wrong
   answer built on a partial cost.

2. **Pull the competitor set with `js_product_database_query`.** Build the call to
   return true substitutes:
   - `include_keywords: [keyword]` (or `[ASIN]`, or the keyword plus `categories`).
   - Add filters to focus the set: `min_reviews` to drop noise listings,
     `min_price`/`max_price` to keep comps near the intended price point,
     `categories` to narrow a broad keyword.
   - Sort `-revenue` and take up to ~100 rows.
   Each row gives `price` and `fee_breakdown`. Keep only rows that have both.

3. **Resolve the FBA fee basis before computing anything**, in priority order:
   - **User-provided (preferred):** a known exact FBA fee, or the target unit's
     packaged size/weight. If the user gives size/weight and the host provides
     web search, look up the current FBA fee schedule and derive the fee from it;
     if no search capability exists, use the fee the user states, or fall through
     to the proxy. Mark this basis as `user-provided` and run a single fee
     scenario.
   - **Proxy from competitors (fallback):** when no user fee data exists, build
     **low / mid / high** fee scenarios from the competitor set (formulas below)
     and mark the basis as `proxy — competitor fee distribution`. State plainly
     that this is only a proxy: FBA fees are driven by the target unit's own
     size, weight, and packaging, which may differ from the comps.

4. **Compute the margin model** (formulas below) from the competitor set + the
   landed cost: the referral *rate*, the FBA fee scenario(s) and closing fee, the
   price band, break-even, the viable price range, and the verdict at the
   expected price. Under a proxy basis, compute the verdict at each of the three
   fee scenarios, not just the median.

5. **Lead with the verdict, then the economics.** See the output contract below.
   Under a proxy fee basis the verdict is always labeled "Provisional" — never a
   bare GO / NO-GO off a competitor fee median alone.

6. **Deliver the scenario table.** Build a table with a row per candidate sell
   price (e.g. the band from min to p90 in steps) showing price, fees, net
   profit/unit, and net margin %, plus the headline result. Under a proxy fee
   basis, show all three fee scenarios (low / mid / high) so the margin
   sensitivity to the fee assumption is visible. Present the table inline as
   markdown; if a writable workspace exists, also save it as a CSV file and
   link it.

## The margin model (why it is built this way)

Getting the verdict right hinges on treating the two big Amazon fees differently,
because they behave differently as price changes:

- **Referral fee scales with price** (it is a category percentage of the sale
  price). So derive a **referral RATE** = median(`referral_fee` / `price`) across the
  competitor set, rather than copying one listing's dollar fee.
- **FBA fee is essentially fixed per unit** but is driven by the unit's own
  size, weight, and packaging — not by price. A user-provided fee (or one
  derived from the user's size/weight) always wins. When only the competitor
  set is available, the comp `fba_fee` distribution is a **proxy** for the
  target product's fee, and a single median hides real spread — so build three
  fee scenarios:
  - `fba_low` = p25 of comp `fba_fee`
  - `fba_mid` = median of comp `fba_fee`
  - `fba_high` = p75 of comp `fba_fee`
  (Fewer than ~8 usable comps: fall back to min / median / max.) Label these as
  competitor-derived proxies in the output, never as the target product's actual
  fee.
- **Variable closing fee** is a small fixed fee (mostly media categories; usually
  $0); handle it the same fixed way (median `variable_closing_fee`).

With `landed` = landed cost, `fba` = fixed FBA fee, `closing` = fixed closing fee,
`r` = referral rate, and optional `b` = PPC/returns buffer fraction (0 by default).
Under a proxy fee basis, `fba` takes each scenario value in turn
(`fba_low` / `fba_mid` / `fba_high`) and every derived figure below is computed
per scenario:

```
fees(P)        = fba + closing + (r + b) * P
net_profit(P)  = P - landed - fees(P)
net_margin(P)  = net_profit(P) / P
break_even     = (landed + fba + closing) / (1 - r - b)
price_for(m)   = (landed + fba + closing) / (1 - r - b - m)      # m = target margin fraction
```

`price_for(m)` is infeasible (no solution) when `1 - r - b - m <= 0` — i.e. the
referral rate plus your target margin exceed 100%, which itself is a finding.

**Verdict** is the tier of `net_margin` at the expected sell price (the competitor
median unless overridden): NO-GO below yellow, CAUTION between yellow and green, GO
at or above green. Defaults: yellow 15%, green 25%.

**Verdict strength depends on the fee basis.**

- **User-provided fee:** report a single firm verdict at the stated fee.
- **Proxy fee (competitor-derived):** compute the verdict at all three fee
  scenarios (`fba_low` / `fba_mid` / `fba_high`) and downgrade the wording —
  never issue a bare GO or NO-GO off a competitor fee median alone:
  - All three scenarios land in the same tier → report **"Provisional GO"** /
    **"Provisional CAUTION"** / **"Provisional NO-GO"**, and state the one input
    that would firm it up (the target unit's packaged size/weight or actual FBA
    fee).
  - The scenarios straddle tiers (e.g. GO at `fba_low` but CAUTION at
    `fba_high`) → report the range explicitly ("GO at low fees, CAUTION at high
    fees"), mark confidence as low, and treat the fee spread itself as the
    finding: the verdict cannot be settled until the real fee is known.

**Viable price range** is the band where you both clear the minimum bar (margin ≥
yellow) and stay competitive (≤ the p90 of competitor prices). When the price
required to clear the bar sits **above** the competitive ceiling, there is no viable
range — this is the "looks cheap to source, no money to be made" case, and you must
say so explicitly. That sentence is often the most valuable output.

By default the model stops at hard Amazon fees (the user's chosen basis). If a
realistic check is wanted, reserve a buffer (e.g. `b = 0.15`) for PPC + returns; the
output then states the basis so the number is never mistaken for a pure-fee margin.

## Choosing the competitor set

The quality of the verdict depends on comparing against true substitutes:

- Prefer a **specific keyword** ("collapsible silicone food container") over a broad
  one ("kitchen"). Broad keywords inflate the price band with unrelated items.
- Use an **ASIN** when the user points at a specific competitor; include it in the
  set and let its category anchor the comparison.
- Add `min_reviews` to focus on established listings, and a price band (with the
  expected price) to keep comps near the intended point.
- Sanity-check the competitor count and band. A handful of comps or a band spanning
  10× usually means the search was too broad or too narrow — refine the keyword and
  rerun. It is cheap.

## Output contract

Keep it decision-first and tight (this runs in chat, including sourcing flows).
Include, in this order:

1. **The verdict** — GO / CAUTION / NO-GO, prefixed **"Provisional"** whenever the
   fee basis is a competitor proxy (with the scenario range if the tiers
   straddle) — plus the expected sell price, the net margin % at that price, the
   fee basis (user-provided vs. competitor proxy), and the cost basis (hard fees,
   or with a stated buffer).
2. **The market band** — competitor count, and min / median / p90 (or max) price.
3. **Break-even and the viable price range** (or the explicit "no viable range"
   statement).
4. **The one-line takeaway for negotiation** — e.g. how far the supplier price would
   need to drop to reach a GO, or how much pricing headroom exists.
5. **The scenario table** — presented as a file (or its path / inline); under a
   proxy fee basis it must include the low / mid / high fee scenarios.

Do not bury the verdict under the methodology. Report the numbers you computed
cleanly; show the fee model (referral rate, FBA fee scenario(s), closing) so it's
auditable. Every inferred figure — the referral rate, the fee scenario(s),
break-even, the viable range, the verdict — must carry its **evidence** (which
tool data it came from), its **assumptions** (e.g. "FBA fee is a proxy for the
target unit's actual size/weight"), and a **confidence** label (high when the fee
is user-provided; medium when a proxy agrees across scenarios; low when the
scenarios straddle tiers).

## MCP errors and empty results

- An empty `data[]` from `js_product_database_query` is a successful call with no
  records (**observed empty**) — it is not proof of zero demand. Cross-check the
  keyword, marketplace, and filters before concluding anything, and say "no records
  returned," not "no demand." Usually it means the search was too narrow — broaden
  the keyword or drop filters and rerun.
- **Dirty recall is not a usable comp set.** If the returned rows are visibly
  off-target (wrong category, wrong product type, or sizes/materials that cannot
  be substitutes — e.g. searching a lunch box and getting water bottles), do NOT
  compute a price band from them. Refine the query once (tighter keyword,
  `categories`, price filters) and rerun. If the recall is still dirty, say so
  plainly, mark the price-band dimension unverified, and give only what does not
  depend on comps (fee-scenario framework, break-even formula with the user's
  cost). Never silently use a dirty recall.
- Tool errors (permission, throttle, unsupported marketplace): report the gap,
  skip the affected step, and lower confidence on any conclusion that depended on
  it. Never fabricate missing prices or fees.
- If some rows lack `price` or `fee_breakdown`, drop those rows and say how many
  were dropped; do not estimate the missing fees yourself.

## Evidence and limits (state these to the user when relevant)

- Prices and fees are Jungle Scout modeled estimates per listing, not actuals;
  the fee model derived from them is an estimate too.
- `approximate_30_day_units_sold` / `approximate_30_day_revenue` are estimates,
  useful as context but not inputs to the margin math.
- The competitor-derived FBA fee is a **proxy, not the target product's fee**:
  FBA fees depend on the unit's own size, weight, and packaging, so a comp
  median can be materially wrong for a differently-sized product. That is why
  proxy-based verdicts are downgraded to "Provisional" and reported across
  low / mid / high fee scenarios.
- The margin projection is only as good as the landed cost and the competitor
  set — distinguish clearly in the output between direct tool data (competitor
  prices, fee breakdowns) and your own inference (the referral rate, the fee
  scenarios, the verdict).

## Running in a chat-only environment

This skill depends only on the host's Jungle Scout `js_*` MCP tools, so it is
portable. In a sourcing chat the landed cost is typically already in hand from
the supplier conversation — use it directly. If a writable workspace exists, save
the scenario table (workbook or CSV) there and link it; if not, present the table
inline as markdown. Do not reference a specific client or a fixed workspace name.

## Reference and troubleshooting

- `references/jungle_scout_mcp.md` — the `js_product_database_query` tool, its
  filters, and the exact response fields used (`price`, `fee_breakdown`). Read it
  when adjusting the search or interpreting a field.
- **No priced comps returned:** the keyword/category was too narrow or filtered too
  hard. Broaden it or drop `min_reviews` / the price band.
- **Margin looks implausible:** check the fee model — if FBA or the referral rate
  looks off for the category, override with the user's known exact FBA fee or
  referral rate (e.g. from a quote).
- **`forbidden_marketplace`:** the API key behind the tools does not cover that
  marketplace; pick one it does, or tell the user.
