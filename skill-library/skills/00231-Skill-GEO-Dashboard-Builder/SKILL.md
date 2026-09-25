---
name: geo-dashboard-builder
displayName: Dashboard Builder
displayDescription: Generate one-page HTML dashboard with mention/citation insights
version: 1.55.0
description: GEO Dashboard Builder — Consolidate global monitoring analysis results into a single-page HTML dashboard. Pipeline skill: chains geo-analyzer, geo-domain-ranker, and geo-strategy-advisor outputs into a visual report with sidebar navigation, suitable for periodic monitoring reports. Companion script: scripts/dashboard_builder.py. Trigger phrases: generate dashboard, build dashboard, global report, HTML report, visualize, summary report, one-click report, 一键报告, 生成 dashboard、生成仪表盘、全局报告、汇总报告。
---

# Skill: GEO Dashboard Builder

Generate an interactive HTML dashboard (Tailwind CSS + Inter font) from GEO analysis CSVs.

---

## ⚡ One-Click Report (Recommended)

Once collection is complete, **run `run_pipeline.py` directly** to automatically link all 4 steps (Analyzer → Domain Ranker → Strategy → Dashboard), exporting the HTML report with a single command:

```bash
python3 scripts/run_pipeline.py <raw_json> <brand_name> <brand_domain> [lang=zh] [competitors] [brand_type]
```

**Example:**
```bash
python3 scripts/run_pipeline.py \
  data/raw/raw_YourBrand_GEO_YYYYMMDD.json \
  YourBrand yourbrand.com zh \
  "Alibaba:alibaba.com,AliExpress:aliexpress.com,Global Sources:globalsources.com" \
  B2C
```

Required parameters:

| Parameter | Required | Description | Example |
|---|---|---|---|
| `raw_json` | ✅ | Path to raw collection JSON | `data/raw/raw_YourBrand_GEO_YYYYMMDD.json` |
| `brand_name` | ✅ | Brand display name | `YourBrand` |
| `brand_domain` | ✅ | Official website root domain | `yourbrand.com` |
| `lang` | | Report language, default is en (full English report). Set to zh for full Chinese | `en` / `zh` |
| `competitors` | **Highly Recommended** | Competitor list, in `BrandName:domain` format, separated by commas. Missing list means no horizontal comparison in report | `"Alibaba:alibaba.com,AliExpress:aliexpress.com"` |
| `brand_type` | **Required** | Brand type, controls the direction of strategic recommendations. B2C brands are forbidden from receiving B2B advice such as sourcing/procurement | `B2B` / `B2C` / `DTC` |

The script automatically: calculates total prompts, builds regular expressions for your brand + competitors, creates output directories, sequentially calls the 4 scripts, and outputs the HTML path.

> **Agent Conduct Rules (smooth UX)**: After collection completes, if brand / domain / competitors / brand_type / lang are already known from earlier confirmation steps, **run this command immediately** — do not ask the user to type "yes". If any required param is missing, use `ask_user(mode="form")` with clickable options only, then execute.

---

## Step-by-Step Run (Advanced)

If you need to debug a single step separately, refer to the following commands:

```bash
# Step 1: Analyzer
python3 ../geo-analyzer/scripts/analyzer.py <raw_json> <output_dir> '<brands_json>'

# Step 2: Domain Ranker
python3 ../geo-domain-ranker/scripts/domain_analyzer.py <raw_json> <output_dir>/domains <brand_domain>

# Step 3: Strategy Advisor (brand_type controls B2B/B2C/DTC vocabulary, lang controls report language)
python3 ../geo-strategy-advisor/scripts/strategy_generator.py <output_dir>/domains <output_dir>/strategy_Brand.md [brand_type] [lang]

# Step 4: Dashboard Builder (brand_type controls action plan suggestions)
python3 scripts/dashboard_builder.py <out.html> <report_dir> [domain_dir] [strategy.md] [brand] [lang] [total_queries] [brand_domain] [brand_type]
```

---

## Modules Included in the Dashboard

1. **Brand Mention Rate** — Comparison bar chart of Mention Rate for each brand
2. **Top 20 Cited Domains** — Citation domain ranking, including platform classification and difficulty labels
3. **Linked Domains** — Distribution of domains in `links_attached`
4. **Actionable Channels** — Optimization suggestions for channels like Reddit / YouTube / Medium / Quora (differentiated by brand type B2B/B2C/DTC)

---

## Output

`data/outputs/[brand_slug]_[date]/dashboard_[Brand]_[date].html`
