---
name: geo-site-auditor
displayName: Site Auditor
displayDescription: Audit any website for GEO optimization opportunities and generate ready-to-publish content
version: 1.55.0
description: GEO Site Auditor — Crawl a website and analyze its content structure for GEO (Generative Engine Optimization) opportunities. Identifies missing FAQ schema, weak E-E-A-T signals, content gaps vs AI citation patterns, and produces specific optimization recommendations. Can also generate ready-to-publish articles targeting AI citation. Use when the user wants to optimize their website for AI search visibility, needs a GEO content audit, or wants AI-optimized articles. Trigger phrases: audit my site, GEO audit, website optimization, optimize for ChatGPT, AI search optimization, content audit, GEO content, 网站审计, GEO优化, 内容审计.
---

# Skill: GEO Site Auditor

Lightweight website audit + content generation for GEO optimization. No heavy scripts — uses `web_fetch` + LLM analysis.

---

## When to Use

- User provides a URL and wants GEO optimization suggestions
- User wants to understand why their site isn't being cited by AI
- User wants AI-optimized articles targeting specific queries
- User wants to improve their E-E-A-T signals for AI citation

---

## Audit Workflow (3 Steps)

### Step 1: Crawl Key Pages

Use `web_fetch` to crawl up to 5 key pages from the user's site. Priority order:
1. Homepage (always)
2. Main product/service page
3. Blog/help center index
4. About page
5. One deep content page (blog post, guide, or FAQ)

**For each page, extract:**
- H1/H2/H3 heading structure
- FAQ sections (if any)
- Schema markup presence (JSON-LD)
- Word count estimate
- Internal linking density
- Author/byline presence (E-E-A-T signal)
- Comparison/versus content
- User review/testimonial presence

```
web_fetch("https://example.com")
```

### Step 2: Score & Diagnose

Score each page across 6 GEO dimensions (0-3 scale):

| Dimension | What to check | Score criteria |
|---|---|---|
| **FAQ Structure** | Are there Q&A sections? Schema markup? | 0=no FAQ, 1=FAQ but no schema, 2=FAQ with schema, 3=comprehensive FAQ with JSON-LD |
| **E-E-A-T Signals** | Author bios, credentials, citations, about page | 0=anonymous, 1=author name only, 2=author + credentials, 3=full E-E-A-T |
| **Comparison Content** | Brand vs competitor pages | 0=none, 1=mentions competitors, 2=comparison pages exist, 3=dedicated vs pages |
| **Structured Data** | JSON-LD, schema.org types | 0=none, 1=basic schema, 2=FAQ/HowTo schema, 3=rich structured data |
| **Content Depth** | Word count, topic coverage | 0=thin (<300 words), 1=moderate, 2=deep (>1000 words), 3=comprehensive guides |
| **Citation Readiness** | Would AI cite this page? Clear claims, data, sources | 0=no clear claims, 1=opinions only, 2=data-backed claims, 3=authoritative source |

**Output format:**
```
## GEO Audit: [domain]

### Page Scores

| Page | FAQ | E-E-A-T | Compare | Schema | Depth | Cite-Ready | Total |
|---|---|---|---|---|---|---|---|
| Homepage | 0 | 1 | 0 | 1 | 2 | 1 | 5/18 |
| /product-x | 0 | 0 | 0 | 0 | 2 | 0 | 2/18 |
| /blog/guide | 2 | 2 | 1 | 1 | 3 | 2 | 11/18 |

### Critical Gaps (fix first)
1. No FAQ Schema on any page — add JSON-LD FAQ to top 3 pages
2. Zero comparison content — create "[Brand] vs [Competitor]" pages
3. Missing author credentials — add author bios with expertise signals

### Quick Wins (high impact, low effort)
1. Add FAQ section to [page] targeting these queries: ...
2. Add JSON-LD schema to existing content — no copy changes needed
3. Add "last updated" dates and author bylines to all blog posts

### Strategic Recommendations
1. Build a /guides/ hub with 5-10 comprehensive articles targeting high-citation queries
2. Create dedicated comparison pages for each major competitor
3. Add structured data (FAQ + HowTo schema) to top 10 pages by traffic
```

### Step 3: Content Generation (Optional)

If the user wants articles, generate them based on the audit findings:

**Article types to offer:**
1. **Comparison article** — "[Brand] vs [Competitor]: Which is Better for [Use Case] in 2026?"
2. **FAQ article** — "Everything You Need to Know About [Topic] (2026 Guide)"
3. **How-to guide** — "How to [Solve Problem] with [Brand]: Step-by-Step"
4. **Data-backed analysis** — "[Industry] Trends 2026: [N] Statistics You Should Know"

**Article generation rules:**
- Must include FAQ section at the bottom (for schema markup opportunity)
- Must include specific data points, statistics, or concrete examples
- Must have clear H2/H3 heading structure for AI parsing
- Author bio section with credentials (E-E-A-T)
- Internal links to 2-3 other pages on the site
- Word count: 1200-2000 words (sweet spot for AI citation)
- Tone: authoritative but accessible, not promotional

**After generating, suggest:**
- Where to publish (blog, Medium, LinkedIn, etc.)
- What schema markup to add (provide JSON-LD snippet)
- Internal linking strategy

---

## Integration with Other Skills

- **After geo-dashboard-builder:** If the user has run a full GEO analysis, use the citation data to prioritize which pages to audit. Focus on pages that AI already cites (strengthen them) or pages that should be cited but aren't.
- **After geo-strategy-advisor:** Use the strategy report's Reddit/Blog/Outreach dimensions to generate targeted content for each channel.
- **Before geo-content-writer:** Site audit findings inform what content the brand is missing — feed into content-writer's topic selection.

---

## Interaction Flow

1. Ask for the website URL
2. Ask brand_type (B2B/B2C/DTC) if not already known
3. Crawl up to 5 pages using web_fetch
4. Present the score table + critical gaps + quick wins
5. Ask: "Want me to generate articles targeting any of these gaps?"
6. If yes, ask which article type and target topic, then generate

---

## Output

- Audit summary in chat (score table + recommendations)
- Optional: Markdown article file saved to `data/outputs/[brand]_[date]/content_drafts/`
