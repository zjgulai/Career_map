---
name: market-insight-product-selection
description: >-
  Evidence-led product opportunity assessment for choosing a category or niche, comparing candidate products, or validating whether a specific product is worth entering. Use when the user needs a ranked product-selection decision based on demand, momentum, competition, margin feasibility, repeat-purchase potential, differentiation, and operating risk. Do not use for a generic industry summary with no selection decision, supplier procurement, or inquiry execution.
workflow: |
  Adapt the depth to the decision:
    1. Define the market, customer, time horizon, and decision.
    2. Collect proportionate evidence using capabilities that are actually available.
    3. Separate observed metrics, calculations, proxies, and unknowns; compare candidates consistently.
    4. Recommend the best-supported options with confidence, risks, and the next validation step.
enabled: true
---

# Product Opportunity Selection

Turn fragmented market signals into a decision-ready shortlist. The skill supplies a decision framework, not a fixed tool workflow or presentation format.

## Choose the analysis mode

- **Category or niche selection**: discover and compare a focused set of opportunities in the user's market.
- **Candidate comparison**: rank categories or products already supplied by the user.
- **Specific product validation**: test one product or listing against close alternatives, customer evidence, economics, and execution risks.

Do not force every request through a full pipeline. A narrow question should receive a narrow answer.

## Operating boundaries

- Preserve the user's platform, geography, customer, timeframe, constraints, and desired format. Infer missing details only when the assumption is low-risk, and state material assumptions.
- Use only research, marketplace, connected-data, or analysis capabilities that are actually available in the current Agent. Never assume a named tool or Plugin exists, and never call a missing capability by name.
- If an unavailable capability blocks a decision-critical fact, label the evidence gap and explain the smallest next step needed to obtain it. Do not fabricate listings, suppliers, metrics, or tool results.
- Supplier discovery, procurement, and inquiry execution are separate follow-up tasks. They are not required to complete product opportunity analysis.
- **Direct-answer boundary (HARD RULE):** An ordinary request to analyze, identify, compare, or recommend is a chat answer, not authorization to create an artifact. Answer in the current chat using prose, Markdown tables, and normal source links. Do not call file-writing, editing, or presentation tools; create or present a report; or start a research/verifier Agent. Only do so when the user explicitly requests a downloadable file or report, exhaustive/deep research, or independent verification.
- This skill never requires product cards, special renderer payloads, generated images, charts, files, or source code. Use one only when the user explicitly requests that format and the current Agent can produce it reliably.

## Evidence model

For rankings or claims about margin, reviews, repurchase, or scoring, read [references/evidence-and-scoring.md](references/evidence-and-scoring.md).

Every decision-critical metric must be treated as one of:

- **Observed**: the source directly reports the metric for the relevant market and period.
- **Calculated**: derived from disclosed inputs with reproducible arithmetic.
- **Proxy**: indirect evidence that supports a directional inference but not the exact metric.
- **Unknown**: evidence is unavailable, stale, incompatible, or too weak.

Never present a proxy as an observed fact. In particular:

- Selling price or a generic markup does not establish margin.
- Average rating does not establish positive-review rate unless the rating distribution and threshold are available.
- Consumable characteristics, subscriptions, or repeat-purchase language can indicate repeat potential, but do not establish an actual repurchase rate.

## Workflow

### 1. Frame the decision

Identify the choice the user needs to make and the smallest candidate set that can answer it. Capture the relevant market, channel, customer, horizon, price position, and business constraints when available.

For broad discovery, form a focused candidate set rather than an arbitrary long list. For a specific-product request, analyze that product and only the closest decision-relevant alternatives.

For an open-ended discovery request, do not block on missing market, channel, or budget. State a provisional scope, provide a useful preliminary recommendation, and list the detail that would most improve it. Ask first only when the missing choice would materially reverse the answer and no useful provisional answer is possible.

### 2. Select decision criteria

Choose only the dimensions that can change the decision:

- demand strength;
- momentum and durability;
- competitive intensity;
- margin feasibility;
- repeat-purchase potential;
- differentiation opportunity;
- operational, regulatory, or channel risk.

Keep **market attractiveness** separate from **fit for this user**. A growing category can still be a poor entry choice if economics, capabilities, or risks do not fit.

### 3. Collect proportionate evidence

Prioritize sources aligned with the requested marketplace, geography, and timeframe. Combine direct marketplace or market evidence with independent demand signals and voice-of-customer evidence when each is relevant. For a normal answer, target three to five decision-relevant sources rather than broad coverage.

For an ordinary question, begin with a few strong sources and keep the default investigation to at most eight external research tool calls total, counting each search and fetch operation separately even when issued in a batch. Expand only when the user requests exhaustive research or a decision-critical contradiction remains unresolved; explain why more collection is needed.

Do not continue researching merely because new entities appear. Stop when additional evidence is unlikely to change the ranking, confidence, or next action.

### 4. Normalize before comparing

- Compare the same market, period, product level, and metric definition where possible.
- Separate category evidence from SKU evidence; representative products may illustrate a category without proving category-wide performance.
- Record which claims are observed, calculated, proxy-based, or unknown.
- Treat recurring review themes as stronger than isolated anecdotes, and note sampling or platform bias.
- Resolve material source conflicts when practical; otherwise show the conflict and lower confidence.

### 5. Make the decision

Prefer `High / Medium / Low / Unknown` assessments unless comparable data supports a reproducible numerical score. Avoid decimal rankings and arbitrary weights. If the user supplies priorities, use them explicitly.

For each recommended candidate, provide:

- why it ranks where it does;
- the strongest supporting evidence;
- the main risk or counter-signal;
- which important claims rely on proxies;
- confidence in the recommendation;
- what evidence would change the decision.

Do not convert “popular” directly into “good niche.” Popularity must be considered alongside competition, economics, differentiation, and execution risk.

## Default output

Lead with the decision, then give the minimum evidence needed to audit it.

| Candidate | Demand / momentum | Competition | Margin feasibility | Repeat potential | Main risk | Confidence |
|---|---|---|---|---|---|---|
| Candidate A | High — observed evidence | Medium | Proxy | Unknown | Key risk | Medium |

After the comparison table, include:

1. **Recommendation**: the best-supported option and who it fits.
2. **Evidence notes**: direct sources, calculations, and material proxies.
3. **Unknowns and counter-signals**: facts that could reverse the choice.
4. **Next validation**: the lowest-cost action most likely to change the decision.

If evidence cannot support a useful ranking, say so directly and return a validation plan instead of manufacturing a winner.

## Final check

Before answering:

- The conclusion answers the user's actual selection decision.
- No unavailable tool, Plugin, product-card schema, or renderer capability is assumed.
- No raw tool payload, internal identifier, malformed URL, or local path appears.
- No file or separate Agent was created unless the user explicitly authorized it.
- Exact-looking margin, positive-review, repurchase, sales, or growth claims are backed by matching observed or calculated evidence.
- Proxies, estimates, assumptions, and unknowns are visibly labeled.
- The response remains useful without an optional artifact or visualization.
