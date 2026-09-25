---
name: amazon-prelaunch-trend-scout
description: >-
  Discover fast-rising Amazon niches and breakout brands; year-over-year analysis separates real breakouts from seasonal spikes. Use for product or niche ideas, trends, or real-vs-seasonal checks.
metadata:
  version: "1.0.0"
---

# Trend & Breakout Scout

Find fast-rising Amazon niches and breakout brands, separate genuine breakouts from
seasonal spikes, and turn each opportunity into an actionable sourcing brief — so
"what should I sell next?" becomes a shortlist the user can actually act on.

All data comes from the host's **Jungle Scout `js_*` MCP tools** — you call the tools
and do the classification yourself. The tools this skill uses are
`js_keywords_by_keyword`, `js_historical_search_volume`, `js_product_database_query`,
and `js_share_of_voice` (`js_sales_estimates` is available for a single ASIN's daily
trajectory but isn't needed by default). If those tools aren't available, say so and
stop — do not substitute another data source or fabricate numbers.

## When to use
Trigger this for forward-looking discovery: "what should I sell next," "find breakout
products/brands," "what's trending in <category>," "give me product ideas," "is this
niche real or seasonal." Boundaries:
- The user already has a specific product idea and asks "is it worth doing" →
  `amazon-prelaunch-demand-check`, not this skill.
- The user already has costs or a supplier quote → `amazon-prelaunch-margin-check`.
- The user wants a snapshot of one *known* brand → a brand benchmark, not this skill.

## Workflow

### 1. Frame the scope (brief, one pass)
Pull these from the user's request; ask only if genuinely missing:
- **Seed keyword(s)** — the area to explore. Translate the user's interest into 1–3
  concrete seeds. "Pet stuff" → `dog, cat, pet`; "kitchen gadgets" →
  `kitchen gadget, kitchen tool`. Seeds drive everything; pick good ones.
- **Category** (optional) — a top-level Amazon category to constrain results. Must be
  valid for the marketplace; see `references/marketplace_categories.json`.
- **Marketplace** — default `us`; also uk, de, in, ca, fr, it, es, mx, jp.

If the area of interest is too vague to choose seeds, ask one clarifying question in
chat (or use an interactive question tool such as `ask_user` when the host provides
one — treat it as optional, never required). Otherwise proceed — the output itself is
the best thing to react to.

### 2. Run the pipeline against the MCP tools
Do this in order; the math and thresholds are in `references/methodology.md` — read
it before classifying.

1. **Expand seeds.** `js_keywords_by_keyword` on each seed (optionally with
   `categories`) → the candidate keyword universe with volume and 30/90-day trend.
   Cap the candidate set to a reasonable number (e.g. top ~20–30 by volume) to stay
   economical.
2. **Pull ≥15 months of weekly history per candidate.** `js_historical_search_volume`
   accepts **at most 366 days per call** — never request a longer range in one call.
   For ~16 months of history, issue **two** calls, e.g. window A = today−486 days →
   today−366 days, window B = today−366 days → today, then merge the two series,
   dedupe by `estimate_start_date`, and sort ascending before classifying. If either
   window fails or comes back empty, mark the keyword's YoY result as low-confidence
   and do not classify it on incomplete data as if it were a full year-over-year
   series.
3. **Classify each candidate** as BREAKOUT / EMERGING / MATURE_GROWING / SEASONAL /
   DECLINING / STABLE using the year-over-year logic in `methodology.md`. This is the
   core step: YoY (recent 13 weeks vs. the same weeks last year), not raw sequential
   growth, is what separates a real breakout from a seasonal wave.
4. **Enrich the genuine opportunities** (the keep set, default BREAKOUT + EMERGING +
   MATURE_GROWING): `js_product_database_query` (`include_keywords: [term]`,
   `sort: -revenue`) for category revenue, price band, review depth, and seller
   counts; `js_share_of_voice` for brand concentration and breakout brands. Compute
   the opportunity score (0.6 × demand + 0.4 × competition).
5. **Build a sourcing brief** per opportunity (a paste-ready `brief_text` and a
   pre-filled `accio_url`).

Always produce two things: a ranked **markdown shortlist** in chat (breakouts first;
seasonal items shown as explicitly screened-out, with the YoY reason) and a **JSON
blob** carrying every opportunity's metrics + `confidence` (with the reason when
`low`, per `methodology.md` §Scoring) + `brief_text` + `accio_url`. A
multi-sheet **Excel workbook** is a nice-to-have: build one only when a spreadsheet
capability (e.g. an `xlsx` skill) and a writable workspace are both available;
otherwise put the same tables in the chat/markdown output. Never let the absence of
spreadsheet tooling block the shortlist itself.

### 3. Hand off to sourcing (optional enhancement, never a blocker)
Each opportunity carries a paste-ready `brief_text` and an `accio_url`.
1. **Supplier search (declared by the plugin)** — the plugin declares
   `product_supplier_search` in `plugin.json` (`requiredBuiltinTools`), so on AccioWork
   the tool should be available whenever this plugin is active. Call it for the top
   opportunities, passing the opportunity keyword as the query in the user's original
   wording. If the tool is nevertheless unavailable (declaration not in effect,
   environment error), degrade gracefully: never block the deliverable on it.
2. **Deep links** — surface the `accio_url`s so the user can open a pre-filled Accio
   search in one click.
3. **Briefs** — always show or attach the natural-language briefs; they work anywhere,
   including pasted into any sourcing assistant's chat.
The briefs + deep links are the portable path that needs no extra tool — they are the
default, not the fallback of last resort.

### 4. Present results
- Lead with the ranked **shortlist** in chat (breakouts first; seasonal spikes shown
  as explicitly screened-out, with the year-over-year reason).
- If a writable workspace exists, save the workbook/tables there and link them; if
  not, keep everything inline. Do not reference a specific client or a fixed
  workspace name.
- Keep the chat summary tight; the detail lives in the JSON/tables. Offer one obvious
  next step (e.g., "want me to dig into one niche's brands, or validate one of these
  as a product idea?").

## MCP errors and empty results
- An empty `data[]` is a successful call with no records (**observed empty**) — it is
  not proof of zero demand. Cross-check the seed, marketplace, and filters before
  concluding anything, and say "no records returned," not "no demand."
- Tool errors (permission, throttle, invalid date range, unsupported marketplace):
  report the gap, skip the affected step, and lower confidence on any conclusion that
  depended on it. Never fabricate missing numbers.
- If one of the two history windows is missing, classify with reduced history and
  mark the result low-confidence — do not present partial data as a full YoY series.

## Interpreting and tuning
- **Breakout vs. seasonal** is decided by year-over-year search volume (recent 13
  weeks vs. the same 13 weeks last year), not by raw recent growth. A thing can be up
  25% this quarter and still flat YoY — that's seasonal, and it's filtered out. Full
  logic and all thresholds: `references/methodology.md`.
- **Opportunity score** = 0.6 × demand + 0.4 × competition; competition rewards open
  niches (beatable incumbents, few reviews, no SOV monopoly). The exact,
  reproducible formulas — momentum/volume normalization and clamping, the
  competition sub-score blend, missing-value fallbacks, and the forced
  low-confidence rules — are defined in `references/methodology.md` §Scoring;
  follow them instead of improvising your own scaling.
- To re-tune, change the thresholds from `methodology.md` (e.g. a +25% breakout bar
  for slow categories, or keep only BREAKOUT + EMERGING to drop steady growers) and
  re-run.

## Evidence and limits (state these to the user when relevant)
- Search volume is a demand proxy. Corroborate with `js_product_database_query`
  revenue; for a single ASIN's daily trajectory you can also pull
  `js_sales_estimates` (not done by default to save calls).
- Units sold and revenue are Jungle Scout modeled estimates, not actuals.
- EMERGING niches have thin history — call them bets, not certainties.
- Be economical with tool calls: keep the candidate set and the keep set reasonable.
- Distinguish clearly in the output between direct tool data and your own inference.

## Files
- `references/methodology.md` — the breakout/seasonal classification logic, every
  threshold, and the scoring. Read before classifying.
- `references/jungle_scout_mcp.md` — the `js_*` MCP tools, parameters, return fields,
  limits, and error handling used by this skill.
- `references/marketplace_categories.json` — valid category names per marketplace.
