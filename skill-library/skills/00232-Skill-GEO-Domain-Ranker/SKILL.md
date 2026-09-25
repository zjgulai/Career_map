---
name: geo-domain-ranker
displayName: Citation Domain Ranker
displayDescription: Rank citation source domains and find content opportunities
version: 1.55.0
description: GEO Domain Ranker — Deep domain analysis of AI citation sources. Supports subdomain breakdown, root domain aggregation, and URL sample extraction. Use after geo-analyzer to understand which domains AI relies on as sources, to inform content placement and outreach strategy. Companion script: scripts/domain_analyzer.py. Trigger phrases: domain ranking, citation sources, which websites are cited, source analysis, domain ranker, 域名排行、信源分析、citation 域名、哪些网站被引用。
---

# Skill: GEO Domain Ranker

Aggregates citation and link URLs from raw GEO data into ranked domain reports with URL samples.

## Interaction Flow

1. Confirm which `data/raw/*.json` file to analyze, and the brand's own domain (for aggregation).
2. Run the script.
3. Interpret top domains: which are high-authority? Which cite competitors but not user's brand?
4. Flag top non-owned domains as outreach or content placement opportunities.

## Run

```bash
python3 scripts/domain_analyzer.py <raw_json> <output_dir> [brand_domain]
```

Example:
```bash
python3 scripts/domain_analyzer.py data/raw/raw_[Brand]_GEO_[date].json \
  data/outputs/[brand]_[date]/domains [brand_domain]
```

## Output

`data/outputs/[dir]/domains/`

| File | Content |
|---|---|
| `cit_domains_aggregated.csv` | Citation domains aggregated to root (e.g. all *.brand.com → brand.com) |
| `cit_subdomains.csv` | Fine-grained citation subdomains with URL samples |
| `link_domains_aggregated.csv` | `links_attached` domains aggregated |
| `link_subdomains.csv` | Fine-grained link subdomains with URL samples |
