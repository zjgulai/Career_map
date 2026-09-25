---
name: geo-strategy-advisor
displayName: GEO Strategy Advisor
displayDescription: Turn analysis data into Reddit, blog, and outreach action items
version: 1.55.0
description: GEO Strategy Advisor — Synthesize GEO analysis data into actionable content intervention and GEO growth strategies. Use after domain ranking analysis to turn data into specific action items: Reddit posting priorities, website blog topics, third-party link opportunities. Companion script: scripts/strategy_generator.py. Trigger phrases: strategy recommendations, action plan, content strategy, GEO strategy, Reddit strategy, content intervention, how to improve AI visibility, 策略建议、行动计划、GEO 策略、内容干预、怎么提升曝光。
---

# Skill: GEO Strategy Advisor

Produce a 3-dimensional content strategy from GEO analysis outputs.

## Pipeline

`geo-analyzer` → `geo-domain-ranker` → **geo-strategy-advisor**

---

## ⛔ HARD RULE 1: Read data before outputting any strategy

**You must read `data/outputs/[brand]_[date]/domains/cit_subdomains.csv` first.**

- If the file exists → read it, extract the Top 20 cited domains/subreddits, then build strategy from the actual data.
- If the file does NOT exist → do NOT output generic strategy. Instead, tell the user: "I need domain ranking data first. Let me run geo-domain-ranker." Then run it, wait for output, then proceed.

**Forbidden:** Outputting subreddit names, blog topics, or outreach targets without reading `cit_subdomains.csv`. Generic templates ("post on r/entrepreneur", "write a sourcing guide") that are not derived from the actual citation data are a critical failure.

---

## ⛔ HARD RULE 2: Brand type controls strategy vocabulary

Read `brand_type` from context (set during query-builder phase). Apply the rules below without exception:

| brand_type | Allowed strategy vocabulary | Forbidden vocabulary |
|---|---|---|
| **B2C** | consumer communities (r/buyitforlife, r/deals, r/ProductReviews), product reviews, lifestyle content, comparison articles (Brand vs Brand), FAQ schema | sourcing guide, MOQ, procurement, factory experience, supplier management, how to source from China, SOURCING-GUIDE page |
| **DTC** | same as B2C + independent store communities (r/Entrepreneur, r/shopify), brand story, founder narrative | same forbidden as B2C |
| **B2B** | sourcing experience, supplier comparison, procurement guide, factory insights, r/sourcing, r/manufacturing | consumer lifestyle content, product reviews for end-users |

**If brand_type is missing from context:** ask the user before generating any strategy output.
```python
ask_user(mode="form", questions=[{
  "question": "What type of brand is this? (Needed to generate the right strategy)",
  "header": "Brand Type",
  "allowSkip": False,
  "options": [
    {"label": "B2C",  "description": "Sells to consumers (e.g. Yeti, Anker)"},
    {"label": "B2B",  "description": "Sells to businesses / procurement (e.g. factory, wholesaler)"},
    {"label": "DTC",  "description": "Own-brand direct-to-consumer via Shopify / independent store"}
  ]
}])
```

---

## Three Action Dimensions

| Dimension | Target | Action |
|---|---|---|
| **Reddit** | Subreddits from `cit_subdomains.csv` Top 20 (actual AI citation data) | Post authentic threads in the subreddits AI already uses as sources |
| **Blog** | E-E-A-T aligned topics derived from high-citation query clusters | Publish guide / comparison articles on topics AI answers with citations |
| **Outreach** | Authority domains from `cit_subdomains.csv` that AI already cites | Contact for co-authorship, brand mention, or content placement |

## Inputs Required

`data/outputs/[dir]/domains/cit_subdomains.csv` (from geo-domain-ranker) — **required, must be read before output**.
`data/outputs/[dir]/mention_stats.csv` (from geo-analyzer) — optional, for mention rate context.

## Run

```bash
python3 scripts/strategy_generator.py <report_dir> <output_path> [brand_type] [lang]
```

`brand_type` is optional (defaults to `B2C`). Accepted values: `B2B`, `B2C`, `DTC`.
This controls ALL suggestion vocabulary — B2C brands will NEVER see sourcing/procurement/MOQ advice.

`lang` is optional (defaults to `en`). Accepted values: `en`, `zh`.
Controls the language of the entire strategy report — all section titles, table headers, and suggestions.

Example:
```bash
python3 scripts/strategy_generator.py data/outputs/[brand]_[date]/domains \
  data/outputs/[brand]_[date]/strategy_[Brand].md B2C en
```

Output: a Markdown strategy report with 3 sections (Reddit / Blog / Owned Content).
All suggestions are filtered by `brand_type` — B2C/DTC brands receive consumer-oriented advice; B2B brands receive procurement-oriented advice.
Present findings as: current mention rate → gap analysis → 3 concrete actions per dimension, all derived from actual citation data.
