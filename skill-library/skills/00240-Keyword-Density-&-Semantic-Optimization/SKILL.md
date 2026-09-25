---
name: seo-keyword-optimization
displayName: Keyword Optimization
displayDescription: Keyword density, LSI expansion, cannibalization and intent matching
version: 1.55.0
description: Keyword Optimization — On-page keyword optimization covering density calculation (1-2% target), LSI and semantic keyword expansion, keyword cannibalization detection, search-intent matching, long-tail strategy, and keyword-to-page mapping. Applies the keyword set produced by seo-keywords to concrete pages. Trigger phrases: keyword optimization, keyword density, LSI keywords, semantic optimization, keyword cannibalization, keyword intent, long tail keywords, keyword mapping, 关键词优化、关键词密度、LSI 关键词、语义优化、关键词蚕食、关键词意图、长尾关键词、关键词映射。
argument-hint: "[url|content] [--primary-keyword keyword]"
license: "MIT"
user-invocable: true
tool_triggers:
  - tool: bash
    args:
      command: /seo\s+(?:keyword[-_ ]optimization|keyword[-_ ]density|LSI[-_ ]keywords|semantic[-_ ]optimization|keyword[-_ ]cannibalization|keyword[-_ ]intent|long[-_ ]tail[-_ ]keywords|keyword[-_ ]mapping)/i
---

# Keyword Density & Semantic Optimization

Comprehensive keyword optimization covering density analysis, semantic keyword expansion, cannibalization detection, intent matching, and strategic keyword-to-page mapping.

## 1. Keyword Density Calculator

### Formula

```
Keyword Density (%) = (Number of keyword occurrences / Total word count) × 100
```

### Target Ranges

| Density Range | Status | Action |
|--------------|--------|--------|
| 0.0% - 0.5% | Too Low | Keyword is barely present; add to title, H1, first paragraph, and body |
| 0.5% - 1.0% | Acceptable | Minimum viable density; ensure key positions are covered |
| **1.0% - 2.0%** | **Optimal** | **Ideal range for most content; natural distribution** |
| 2.0% - 3.0% | High | Review for naturalness; may be over-optimized in some sections |
| Above 3.0% | Over-optimized | Keyword stuffing risk; reduce density and add semantic variations |

### Density Calculation Rules

- **Total word count** excludes HTML tags, code blocks, and navigation elements
- **Keyword occurrences** include exact matches only (not partial matches or variations)
- **Count locations separately**: title tag, H1, H2/H3, body text, image alt text, meta description, URL slug
- **Synonyms and variations** do NOT count toward primary keyword density (they are tracked separately as semantic keywords)

### Per-Section Density Analysis

For long-form content (1500+ words), calculate density per section to find clustering issues:

```
Section 1 (Intro):         2.5% ⚠️  High — reduce one mention
Section 2 (Background):    0.8% ✅  Good
Section 3 (Core Content):  1.2% ✅  Optimal
Section 4 (Details):       0.3% ⚠️  Low — add one natural mention
Section 5 (Conclusion):    1.5% ✅  Good
Overall:                   1.3% ✅  Optimal
```

### Keyword Position Priority

Not all keyword positions carry equal SEO weight:

| Position | Weight | Requirement |
|----------|--------|-------------|
| Title tag (first 3 words) | Highest | Mandatory — primary keyword near the front |
| H1 tag | Highest | Mandatory — primary keyword in the heading |
| URL slug | High | Mandatory — clean, keyword-rich slug |
| First paragraph (first 100 words) | High | Mandatory — establish topical relevance early |
| Meta description | Medium | Recommended — improves CTR, not a direct ranking factor |
| At least one H2 | Medium | Recommended — reinforce topic for subtopics |
| Body text (distributed) | Medium | Target density range naturally |
| Image alt text | Medium | At least one image with keyword in alt text |
| Last paragraph | Low-Medium | Reinforce topic before the close |
| Internal link anchor text | Medium | Use keyword variations in links to this page |

## 2. LSI (Latent Semantic Indexing) Keyword Suggestions

### LSI Keyword Categories

| Category | Description | Example (primary: "running shoes") |
|----------|-------------|-----------------------------------|
| **Synonyms** | Words with the same meaning | sneakers, trainers, athletic shoes |
| **Related terms** | Words frequently co-occurring | jogging, marathon, foot support, cushioning |
| **Variants** | Different forms of the keyword | running shoe, runners shoes, shoe for running |
| **Hypernyms** | Broader category terms | footwear, athletic gear, sports equipment |
| **Hyponyms** | More specific terms | trail running shoes, stability running shoes, carbon plate shoes |
| **Contextual** | Words in the topic's context | pronation, arch support, heel drop, midsole |

### LSI Discovery Methods

**Method 1: SERP Analysis**
- Analyze "People Also Ask" questions for related terms
- Review "Related Searches" at bottom of SERP
- Extract bolded terms from top 10 results' snippets
- Check Google Autocomplete suggestions

**Method 2: Competitor Content Analysis**
- Extract all nouns and noun phrases from top 5 ranking pages
- Identify terms appearing in 3+ competitor pages
- Map term frequency patterns across competitors

**Method 3: Topic Modeling**
- Use TF-IDF analysis to find terms with high relevance
- Identify co-occurring term clusters
- Extract entity relationships from knowledge graphs

### LSI Integration Strategy

```
Primary keyword: "email marketing"

LSI Keyword Map:
├── Synonyms: email campaign, email newsletter, email outreach
├── Related: open rate, click-through rate, subscriber list, segmentation
├── Variants: email-marketing, e-mail marketing, email market
├── Hypernyms: digital marketing, online marketing, direct marketing
├── Hyponyms: drip campaign, welcome series, abandoned cart email
└── Contextual: A/B testing, subject line, CTA, conversion funnel, ESP

Integration:
- Use 1-2 synonyms in H2/H3 headings
- Distribute related terms naturally throughout body
- Include 1 variant in alt text or meta description
- Reference hypernyms for topical breadth
- Use hyponyms in detailed sections
- Weave contextual terms into examples and explanations
```

### LSI Density Guidelines

- **Total semantic keyword density**: 3-5% of content (combined all LSI terms)
- **Individual LSI term**: no more than 0.5% density each
- **Distribution**: spread across different sections, not clustered
- **Naturalness**: every LSI term must read naturally in context

## 3. Keyword Position Optimization

### Position Optimization Checklist

For each page, verify keyword placement across all key positions:

```
Page: /best-running-shoes
Primary Keyword: "best running shoes"

Position Audit:
✅ Title tag: "Best Running Shoes 2026: Top 10 Picks for Every Runner" (position: 1-3)
✅ H1: "The Best Running Shoes of 2026: Tested and Reviewed" (present)
✅ URL slug: /best-running-shoes (clean, keyword-first)
✅ First paragraph: "Finding the best running shoes depends on your..." (within first 50 words)
✅ Meta description: "Discover the best running shoes for 2026..." (present)
⚠️ H2 headings: Only 1 of 6 H2s contains keyword — add to 1-2 more
✅ Body text: 1.4% density (optimal range)
✅ Image alt: "best running shoes for marathon training" (present)
⚠️ Last paragraph: Missing keyword — add natural mention
✅ Internal links: 3 links with "best running shoes" anchor text pointing to this page
```

### Common Position Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Keyword only in title, not in body | Weak topical signal | Add to first paragraph and distribute through body |
| Keyword clustered in intro only | Uneven distribution | Spread evenly across sections (1-2% per section) |
| Keyword missing from URL | Lost ranking signal | Include primary keyword in URL slug |
| Keyword in every H2 | Over-optimization risk | Use in 1-2 H2s max; use semantic keywords in others |
| No keyword in any alt text | Missed image SEO | Add keyword to at least one descriptive alt text |
| Keyword in title but not H1 | Mixed topical signals | Align title tag and H1 around same primary keyword |

## 4. Semantic Similarity Analysis

### Topic Coverage Assessment

Ensure content covers all aspects of the topic that top-ranking pages address:

```
Topic: "Email Marketing Best Practices"

Expected Subtopics (from SERP analysis):
├── ✅ Email list building strategies
├── ✅ Segmentation and personalization
├── ✅ Subject line optimization
├── ✅ Send time optimization
├── ⚠️ Email deliverability (mentioned but thin — needs expansion)
├── ❌ A/B testing methodology (missing entirely)
├── ✅ Metrics and KPIs
├── ❌ Email automation workflows (missing entirely)
└── ⚠️ GDPR/CAN-SPAM compliance (mentioned but no details)

Topic Coverage Score: 6/9 (67%) — Needs improvement
Missing: A/B testing, email automation
Thin: Deliverability, compliance
```

### Semantic Depth Indicators

| Depth Level | Description | Example |
|-------------|-------------|---------|
| Surface | Topic mentioned but not explained | "Email segmentation is important" |
| Moderate | Topic explained with some detail | "Email segmentation means dividing your list by demographics, behavior, or preferences" |
| Deep | Topic explained with examples, data, and actionable advice | "Segmenting by purchase history increases revenue per email by 73% (Mailchimp, 2025). Here's how to set up behavioral segments..." |

### Semantic Gap Analysis

Compare your content's semantic coverage against top 5 competitors:

1. Extract all entities and topics from competitor content
2. Map which entities/topics appear in 3+ competitors
3. Check your content for each entity/topic
4. Identify gaps (missing) and thin spots (mentioned but shallow)
5. Prioritize gaps by: frequency in competitors × relevance to search intent

## 5. Keyword Cannibalization Detection

### What Is Cannibalization?

Keyword cannibalization occurs when multiple pages on the same site target the same keyword, causing them to compete against each other in search results. This dilutes ranking signals and confuses search engines about which page to rank.

### Detection Method

**Step 1: Identify potential cannibalization**
- Search Google: `site:yourdomain.com "keyword"` — multiple results suggest cannibalization
- Check Google Search Console: look for queries driving traffic to multiple URLs
- Review your content plan: multiple pages targeting the same primary keyword

**Step 2: Analyze severity**

| Signal | Severity | Description |
|--------|----------|-------------|
| 2 pages ranking for same keyword | Low | May be acceptable if targeting different intents |
| 3+ pages competing for same keyword | Medium | Clear cannibalization, needs resolution |
| Pages alternating in SERP positions | High | Google can't decide which to rank |
| Both pages have similar content depth | High | Duplicate topical coverage |
| Traffic split across multiple URLs | High | Diluted ranking signals |

**Step 3: Resolution strategies**

| Strategy | When to Use | Action |
|----------|-------------|--------|
| **Merge** | Pages cover same topic at similar depth | Combine into one comprehensive page, 301 redirect others |
| **Differentiate** | Pages target different intents or angles | Retarget each page with distinct primary keywords |
| **Canonicalize** | One page is clearly primary, others are variants | Set canonical tag pointing to primary page |
| **Deindex** | Low-value duplicate pages | Add noindex to secondary pages |
| **Restructure** | Several thin pages split one topic | Consolidate into one in-depth page and repoint internal links to it |

### Cannibalization Audit Template

```
Cannibalization Audit: yourdomain.com
═══════════════════════════════════════

Keyword: "email marketing tips"
├── /blog/email-marketing-tips (Position: 12, Traffic: 340/mo)
├── /blog/best-email-marketing-tips-2026 (Position: 18, Traffic: 120/mo)
├── /resources/email-tips-guide (Position: 25, Traffic: 50/mo)
│
├── Severity: HIGH (3 pages, Google alternating rankings)
├── Recommendation: MERGE into /blog/email-marketing-tips
│   ├── Redirect /blog/best-email-marketing-tips-2026 → /blog/email-marketing-tips
│   ├── Redirect /resources/email-tips-guide → /blog/email-marketing-tips
│   └── Update all internal links to point to merged URL
└── Expected outcome: Consolidated signals → single stronger page
```

## 6. Keyword Intent Matching

### Intent Types and Content Mapping

| Intent Type | Search Signals | Content Format | Page Type |
|-------------|---------------|----------------|-----------|
| **Informational** | how, what, why, guide, tutorial, definition | Blog post, guide, tutorial, FAQ | Blog, knowledge base |
| **Commercial Investigation** | best, top, review, vs, comparison, alternative | Comparison page, listicle, review | Blog, category |
| **Transactional** | buy, price, deal, discount, order, free trial | Product page, landing page | E-commerce, landing |
| **Navigational** | brand name, login, specific page name | Homepage, brand page, login page | Core pages |

### Intent Detection Heuristics

```
Keyword: "best CRM software"
├── Contains "best" → Commercial Investigation
├── SERP shows listicles and reviews → Confirmed: Commercial
├── Recommended format: Comparison listicle or review page
└── Mismatch risk: Writing a how-to guide for a commercial keyword

Keyword: "how to set up CRM"
├── Contains "how to" → Informational
├── SERP shows tutorials and guides → Confirmed: Informational
├── Recommended format: Step-by-step how-to guide
└── Mismatch risk: Creating a product page for an informational keyword
```

### Intent-Content Mismatch Audit

Check each page for intent alignment:

```
Page: /blog/crm-software-pricing
Primary keyword: "CRM software pricing"
Detected intent: Transactional (pricing = ready to buy)
Current content type: Informational blog post
Status: ⚠️ MISMATCH — Transactional keyword served by informational content
Fix: Convert to comparison/landing page with pricing tables and CTAs

Page: /products/email-tool
Primary keyword: "what is email marketing"
Detected intent: Informational (definition query)
Current content type: Transactional product page
Status: ⚠️ MISMATCH — Informational keyword served by transactional content
Fix: Create a separate blog post; product page should target transactional keywords
```

## 7. Long-Tail Keyword Strategy

### Why Long-Tail Keywords?

| Metric | Head Keywords | Long-Tail Keywords |
|--------|--------------|-------------------|
| Search volume | High (10K+) | Low (10-1000) |
| Competition | Very high | Low to moderate |
| Conversion rate | Low (1-2%) | High (5-15%) |
| Intent clarity | Vague | Specific |
| Content difficulty | Hard to rank | Easier to rank |
| Aggregate traffic | From few keywords | From many keywords |

### Long-Tail Discovery Methods

**Method 1: Question Keywords**
- "How to..." / "What is..." / "Why does..." / "When should..."
- Source: People Also Ask, AnswerThePublic, AlsoAsked.com
- Content format: FAQ pages, how-to guides, blog posts

**Method 2: Modifier Keywords**
- Add qualifiers: "for small business", "in 2026", "free", "best", "near me"
- Source: Google Autocomplete, Semrush Keyword Magic Tool
- Content format: Specialized pages, filtered category pages

**Method 3: Problem-Specific Keywords**
- "why is my [thing] not working" / "[thing] error fix" / "troubleshoot [issue]"
- Source: Support tickets, Reddit, Quora, community forums
- Content format: Troubleshooting guides, FAQ pages

**Method 4: Comparison Long-Tails**
- "[product A] vs [product B] for [use case]" / "best [product] for [specific need]"
- Source: Review sites, comparison searches
- Content format: Comparison pages, detailed reviews

### Long-Tail Content Strategy

```
Head keyword: "CRM software" (49,500/mo, Difficulty: 82)
│
├── Long-tail group: Use Case
│   ├── "CRM software for real estate agents" (720/mo, Difficulty: 28)
│   ├── "CRM software for freelancers" (590/mo, Difficulty: 22)
│   └── "CRM software for nonprofit organizations" (320/mo, Difficulty: 18)
│
├── Long-tail group: Feature-Specific
│   ├── "CRM with email automation" (1,300/mo, Difficulty: 35)
│   ├── "CRM with project management" (880/mo, Difficulty: 31)
│   └── "CRM with social media integration" (480/mo, Difficulty: 24)
│
└── Long-tail group: Comparison
    ├── "HubSpot CRM vs Salesforce for small business" (1,900/mo, Difficulty: 38)
    ├── "best free CRM software 2026" (2,400/mo, Difficulty: 42)
    └── "CRM software pricing comparison" (720/mo, Difficulty: 29)

Strategy:
- Create one page per long-tail keyword (or merge closely related variants)
- Each page targets the specific long-tail as primary keyword
- All long-tail pages link back to the main "CRM software" page
- Aggregate traffic from 20+ long-tail pages can exceed head keyword traffic
```

## 8. Keyword Grouping and Page Mapping

### Grouping Principles

Every keyword should map to exactly one page. No keyword should be the primary target of multiple pages.

```
Keyword Group: "Email Marketing"
├── Primary: "email marketing" → /services/email-marketing (Service page)
├── Secondary: "email marketing services" → /services/email-marketing (same page)
├── Informational: "how to start email marketing" → /blog/how-to-start-email-marketing
├── Comparison: "best email marketing tools" → /blog/best-email-marketing-tools
├── Review: "Mailchimp review 2026" → /blog/mailchimp-review
├── FAQ: "email marketing FAQ" → /resources/email-marketing-faq
└── Transactional: "email marketing pricing" → /pricing/email-marketing

Each keyword → one unique page. No cannibalization.
```

### Page Mapping Template

```
Keyword-to-Page Map: yourdomain.com
═══════════════════════════════════════════════════════════════

| Primary Keyword        | Volume | Difficulty | Intent       | Target Page                        | Status    |
|------------------------|--------|------------|--------------|------------------------------------|-----------|
| email marketing        | 33,100 | 72         | Commercial   | /services/email-marketing          | ✅ Mapped  |
| email marketing tips   | 8,100  | 45         | Informational| /blog/email-marketing-tips         | ✅ Mapped  |
| best email tools       | 5,400  | 38         | Commercial   | /blog/best-email-marketing-tools   | ✅ Mapped  |
| email open rates       | 3,600  | 28         | Informational| /blog/email-open-rate-benchmarks   | ✅ Mapped  |
| email marketing pricing| 2,900  | 35         | Transactional| /pricing/email-marketing           | ✅ Mapped  |
| email segmentation     | 1,900  | 22         | Informational| ⚠️ No page — create /blog/email-segmentation-guide |
```

### Mapping Audit

After mapping, verify:
- [ ] Every primary keyword maps to exactly one page
- [ ] No two pages share the same primary keyword
- [ ] Secondary keywords support their primary page (not competing pages)
- [ ] Every high-volume keyword has a dedicated page (or is planned)
- [ ] Page types match keyword intent
- [ ] Internal linking connects related keyword groups

## Output Format


### Default Output Selection
- If user specifies format -> use user's format
- If user does not specify format:
  - Content analysis (E-E-A-T, quality scoring) -> **Markdown** (structured with tables and sections)
  - Content brief generation -> **Markdown** (outline format with headings, keyword targets)
  - Content writing output -> **Markdown** (ready-to-publish format with proper heading hierarchy)


```
## Keyword Optimization Report: [Page URL]

### Primary Keyword: [keyword]
- Density: X.X% (Status: ✅ Optimal / ⚠️ Needs adjustment)
- Position audit: [X/10 positions covered]
- Section distribution: [balanced / clustered in intro / sparse]

### Semantic Keywords (LSI)
| LSI Term | Category | Current Count | Recommended | Status |
|----------|----------|---------------|-------------|--------|
| [term]   | Synonym  | X             | Y           | ✅/⚠️  |

### Topic Coverage: X%
- Covered: [list]
- Thin: [list with expansion recommendations]
- Missing: [list with content suggestions]

### Cannibalization Check
- Status: ✅ No cannibalization / ⚠️ Cannibalization detected
- Details: [affected URLs and resolution plan]

### Intent Match
- Keyword intent: [Informational/Commercial/Transactional/Navigational]
- Content type: [current type]
- Match status: ✅ Aligned / ⚠️ Mismatch detected

### Long-Tail Opportunities
| Long-Tail Keyword | Volume | Difficulty | Recommended Page |
|-------------------|--------|------------|-----------------|
| [keyword]         | X      | Y          | [page]          |

### Priority Actions
1. [Action with expected impact]
2. [Action with expected impact]
3. [Action with expected impact]
```

## Integration with Other Skills

本插件内可直接衔接的技能（均已随包提供）：

| Skill | Integration |
|-------|-------------|
| `seo-keywords` | Upstream: feeds keyword research data (volume / difficulty / intent / QDF) into this analysis |
| `seo-full-audit` | Downstream: validates the optimized pages in the full-site technical + content audit; its content-quality scoring includes keyword placement as one dimension |
| `geo-content-writer` | Apply the density and LSI targets while drafting or rewriting the page |
| `geo-site-auditor` | Verify the optimized page's on-page signals after publishing |

## DataForSEO Integration (Optional)

If DataForSEO MCP tools are available, use `kw_data_google_ads_search_volume` for real volume data, `dataforseo_labs_bulk_keyword_difficulty` for difficulty scores, `dataforseo_labs_search_intent` for intent classification, and `content_analysis_summary` for content-level keyword analysis.

Run a pre-flight cost check before each batch:

```bash
python3 python/dataforseo_costs.py check dataforseo_labs_bulk_keyword_difficulty --count 50
```

If `"status": "needs_approval"`, show the cost estimate and ask the user. If `"status": "blocked"`, skip the API and use heuristic scoring with a lowered confidence annotation.

## Examples

> 本技能为分析型技能（无专属脚本）：先用 CLI 取回页面内容，再按上文的密度 / LSI / 蚕食 / 意图规则进行分析。

### Example 1: Single page density analysis
```bash
# 1) Fetch the page (SSRF-safe)
python3 python/fetch_page.py https://example.com/blog/post

# 2) Analyze density / positions / LSI against the primary keyword "email marketing"
#    following §1 Keyword Density Calculator and §2 LSI expansion in this skill.
```

### Example 2: SPA / JS-rendered page
```bash
python3 python/render_page.py https://example.com/blog/post --mode auto
```

### Example 3: Cannibalization check across pages
```bash
# Pull the actual queries and landing pages from Search Console,
# then apply §Cannibalization Detection rules to find pages competing for one query.
python3 python/gsc_query.py --property https://example.com --days 90 --json
```
