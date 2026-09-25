---
name: seo-content-writer
displayName: SEO Content Writer
displayDescription: Generate SEO content — outlines, meta tags, and structured data (JSON-LD)
version: 1.55.0
description: SEO Content Writer — Generate keyword-targeted SEO content in three forms: (1) article outline + full draft with H1/H2/H3 keyword layout; (2) Meta title & description optimized to Google display limits (title ≤60 chars, description ≤155 chars); (3) structured data JSON-LD (FAQPage / Product / Article / BreadcrumbList). Companion scripts: scripts/meta_generator.py, scripts/schema_generator.py. Trigger phrases: write SEO article, SEO content, article outline, meta title, meta description, structured data, schema markup, JSON-LD, FAQ schema, 写SEO文章、SEO内容、文章大纲、标题描述、元描述、结构化数据、Schema、生成标题。
---

# Skill: SEO Content Writer

Generate keyword-targeted content for **traditional SEO ranking** (not AI-search citation). Complements `seo-keywords` (research) and `seo-keyword-optimization` (on-page check) to close the loop: **research → generate → optimize**.

---

## Three Content Types

### 1. Meta Title & Description

Generate title (≤60 chars) and description (≤155 chars) for a target keyword.

**Workflow:**
1. Get the target keyword + brand + unique selling point from the user.
2. Generate candidates with `meta_generator.py gen` (or write them directly).
3. Verify length with `meta_generator.py check`.

```bash
python3 scripts/meta_generator.py gen --keyword "b2b sourcing platform" --brand "Alibaba" --lang zh --value "一站式"
python3 scripts/meta_generator.py check --title "..." --description "..."
```

**Rules:**
- Title: keyword near the front, brand at the end, ≤60 chars, one clear value promise.
- Description: expand the value promise into a call to action, ≤155 chars, no keyword stuffing.

### 2. Article Outline + Draft

Generate a full article targeted at one primary keyword.

**Workflow:**
1. Confirm: primary keyword, secondary keywords (from `seo-keywords` output), content type (blog / landing page / product page), target word count.
2. Generate the outline first — H1/H2/H3 with keyword placement, show it to the user for a quick confirm.
3. After confirm, generate the full draft.

**Outline rules:**
- H1 = primary keyword (exact or near-exact match).
- H2 = secondary keywords / search-intent subtopics.
- H3 = long-tail supporting points.
- Distribute keyword once each; never stuff.

**Draft rules:**
- Answer the search intent in the first 100 words (funnel-style: direct answer → detail → evidence).
- Natural LSI usage, internal-link anchors to related pages, one primary CTA.
- Output language matches the user's language.

### 3. Structured Data (JSON-LD Schema)

Generate ready-to-paste JSON-LD for FAQ / Product / Article / Breadcrumb.

```bash
# FAQ
python3 scripts/schema_generator.py --type faq \
  --questions "什么是X|...;X如何运作|..." --output faq.jsonld

# Product
python3 scripts/schema_generator.py --type product \
  --name "产品名" --image "https://..." --price 99 --currency USD \
  --brand "品牌" --rating 4.8 --reviews 120 --output product.jsonld

# Article
python3 scripts/schema_generator.py --type article \
  --headline "标题" --author "作者" --date 2026-08-21 --output article.jsonld

# Breadcrumb
python3 scripts/schema_generator.py --type breadcrumb \
  --items "Home|https://a.com/;Category|https://a.com/cat/;Page|https://a.com/cat/p" \
  --output breadcrumb.jsonld
```

**Rules:**
- Validate with Google Rich Results Test before publishing (agent should verify the JSON is well-formed).
- Only mark up content that is actually visible on the page (no fabricated FAQs).

---

## Usage Context

- Triggered after `seo-keywords` delivers a keyword-to-page mapping, or when the user directly asks to write/optimize SEO content.
- Does **not** trigger AI search collection — this is a pure content-generation skill.
- Output language always matches the user's language.

---

## Script Reference

| Purpose | Script |
|---|---|
| Meta title/description gen + check | `scripts/meta_generator.py` |
| JSON-LD Schema gen | `scripts/schema_generator.py` |
