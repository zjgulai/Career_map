---
name: geo-analyzer
displayName: Mention Rate Analyzer
displayDescription: Compute brand mention and citation rates from AI answers
version: 1.55.0
description: GEO Data Analyzer — Multi-dimensional statistical analysis of raw GEO JSON data. Supports two modes: (1) Batch Prompt Analysis — compare brand mention/citation rates across many queries; (2) Single Prompt Deep Analysis — analyze one query repeated N times to study answer probability distribution. Companion scripts: scripts/analyzer.py, scripts/single_query_analyzer.py. Trigger phrases: analyze data, mention rate, citation rate, brand visibility analysis, single prompt analysis, deep analysis, GEO analyzer, 分析数据、提及率、引用率、品牌曝光分析、单 Prompt 分析。
---

# Skill: GEO Data Analyzer

## Critical: Three Metrics — Never Conflate

| Metric | Source field | Definition |
|---|---|---|
| **Mention Rate** | `answer_text` | Brand name appears in AI answer text |
| **Citation Rate** | `citations[].url` domain | Brand's own domain cited as a source |
| ~~Link Rate~~ | ~~`links_attached`~~ | **Deprecated — do not use** |

**Always ask the user for brand name + official domain(s)** before running.
Pass brands as a dict with `"BrandName": r"pattern"` for mention and `"BrandName_domain": r"domain\.pattern"` for citation.
Use sub-string regex e.g. `brand\.com` (not anchored) to also catch subdomains like `sub.brand.com`.

## Mode 1 — Batch Prompt Analysis

```bash
python3 scripts/analyzer.py <raw_json> <output_dir> '<brands_json>'
```

Example:
```bash
python3 scripts/analyzer.py data/raw/raw_[Brand]_GEO_[date].json data/outputs/[brand]_[date] \
  '{"BrandName": "brand\\s*name", "BrandName_domain": "brand\\.com"}'
```

Outputs to `data/outputs/[dir]/`:
- `mention_stats.csv` — mention rate per brand
- `summary.csv` — citation URL count per brand
- `citation_domains.csv` — all citation domain ranking

## Mode 2 — Single Prompt Deep Analysis

```bash
python3 scripts/single_query_analyzer.py <raw_json> <output_dir> [brand1,brand2,...]
```

Example:
```bash
python3 scripts/single_query_analyzer.py data/raw/single_xxx.json data/outputs/single_analysis \
  "Brand1,Brand2,Brand3,Brand4"
```

Outputs:
- `mention_rate.csv` — per-brand mention rate over N runs
- `domain_dist.csv` — citation domain distribution
- `answer_consistency.csv` — brand combination frequency
- `summary.txt` — human-readable summary with bar charts
