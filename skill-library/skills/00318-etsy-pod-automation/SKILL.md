---
name: etsy-pod-automation
description: >-
  Automates operating a Print-on-Demand dropshipping store on Etsy via Printify.
  Covers the full lifecycle: trend research, AI design generation, product creation
  via Printify API, SEO-optimized listing with 13 tags, publishing to Etsy,
  social media promotion (Twitter/Instagram/Pinterest), performance monitoring,
  and continuous optimization. Use this skill whenever the user mentions Etsy store
  operations, POD products, Printify, creating Etsy listings, Etsy SEO, Etsy tags,
  product design for mugs/posters/stickers, Etsy search visibility, Etsy store
  analytics, or any e-commerce dropshipping workflow on Etsy. Also use when the user
  asks to create products, check store performance, run trend scans, post to social
  media for their Etsy shop, fix SEO issues, or automate any part of their POD business.
region_scope: INTL
---

# Etsy POD Store Automation Skill

This skill provides a complete operational playbook for running a profitable Print-on-Demand store on Etsy using Printify as the fulfillment provider. It distills hard-won lessons from real store operations into repeatable, automated workflows.

## Quick Reference

| Resource | Path |
|---|---|
| Product Creation API Guide | `references/printify-api.md` |
| SEO & Tag Generation | `references/seo-tags.md` |
| Social Media Playbook | `references/social-media.md` |
| Performance & Optimization | `references/performance.md` |

Read the relevant reference file before executing that workflow. Each contains step-by-step API calls, code templates, and critical rules.

---

## Core Principles

1. **Tags are everything.** Etsy's search algorithm matches buyer queries to listing tags. A listing with 0 tags gets 0 search traffic — no exceptions. Every product must launch with 13 carefully chosen tags.

2. **Photos drive conversion.** Some product types (e.g. posters) get many auto-mockups from Printify, but others (e.g. mugs) may get only 1. Listings with fewer than 2 photos are penalized by Etsy's search visibility algorithm. Target 5+ photos for best results.

3. **Margins before volume.** Start with the highest-margin, lowest-return-risk products. A single return can wipe out profit from 3-5 sales. Avoid sizing-dependent products (apparel) until you have a revenue buffer.

4. **Think timing, not just product.** Create seasonal products 4-6 weeks before peak buying windows. Father's Day products in May, not June.

5. **Self-improving loop.** Every week: retire the bottom 20% of listings, create more variations of the top 20%, and update tags/titles based on actual search data.

---

## Store Setup & Configuration

Before using this skill, ensure:

- [ ] Etsy seller account is active
- [ ] Printify account is connected to the Etsy shop
- [ ] Printify API token is stored in `project/.env` as `PRINTIFY_API_TOKEN`
- [ ] Printify Shop ID is known (find via `GET https://api.printify.com/v1/shops.json`)

### First-Time Setup

On first use, the agent should:

1. **Discover the shop** — call `GET /v1/shops.json` to find the Shop ID
2. **Browse the Printify catalog** — call `GET /v1/catalog/blueprints.json` to see all available product types
3. **Choose product types** — for each chosen blueprint, call `GET /v1/catalog/blueprints/{id}/print_providers.json` to find providers, then `GET /v1/catalog/blueprints/{id}/print_providers/{pid}/variants.json` to get variant IDs and base costs
4. **Set pricing** — calculate retail prices using the pricing formula below
5. **Save configuration** — persist Shop ID, chosen blueprints, variant IDs, and pricing to the agent's MEMORY.md

### Pricing Formula

Use this formula to set profitable prices:

```
Retail Price = (Production Cost + Shipping Cost) / (1 - Target Margin - Etsy Fee Rate)

Where:
  Production Cost = Printify base cost for the variant
  Shipping Cost   = Printify shipping cost (or $0 if offering free shipping built into price)
  Target Margin   = Your desired net profit margin (recommended: 40-60%)
  Etsy Fee Rate   = ~0.12 (listing fee + 6.5% transaction + 3% + $0.25 payment processing ≈ 10-12%)
```

**Example:** A mug costs $5.95 to produce. With 50% target margin:
`$5.95 / (1 - 0.50 - 0.12) = $5.95 / 0.38 ≈ $15.66` → round to $15.99 or $16.99

**Pricing tips:**
- Use .99 endings (psychological pricing)
- Check competitor pricing on Etsy for similar products before setting yours
- Consider offering free shipping (Etsy algorithm rewards this) — build shipping cost into the price
- Start competitive (lower margin) to build initial reviews, then raise prices

---

## Workflows

### 1. Product Creation (read `references/printify-api.md`)

The end-to-end flow for creating a new product:

```
Trend/Idea → AI Design → Upload to Printify → Create Product (with 13 tags!) → Publish to Etsy
```

**Critical rules:**
- **Always include 13 SEO tags** when creating products (read `references/seo-tags.md` for the tag generation algorithm)
- Use the structured title format: `Product Name: Key Descriptors, Use Case, Style`
- Front-load the most important keyword in the first 40 characters (mobile truncation)
- Set prices using the pricing formula above — look up production costs via Printify API
- Consider offering free shipping (built into price) — Etsy algorithm rewards this

### 2. SEO & Tag Optimization (read `references/seo-tags.md`)

Tags are the #1 factor for Etsy search visibility. The skill includes a complete tag generation algorithm that creates 13 context-aware tags per product using the "3-8 split" strategy:
- 3-4 broad tags (high volume)
- 8-9 long-tail tags (high conversion, lower competition)

Tags should cover: product type, style/aesthetic, occasion/gift, room/placement, season, and trending terms.

### 3. Photo Management

**Check auto-mockup counts per product type.** Some Printify products generate many mockup photos (e.g. posters ~20), while others generate very few (e.g. mugs ~1). For products with fewer than 2 auto-mockups:

- Generate lifestyle photos via `image_generate`
- Upload them directly to Etsy via the listing editor using the JavaScript injection technique (the Printify `images` field only accepts auto-generated mockup references, not custom uploads)

Read `references/printify-api.md` for the exact JS code and browser workflow.

### 4. Social Media Promotion (read `references/social-media.md`)

Every product post MUST include:
- An actual product mockup image (not generic/stock photos)
- A direct link to the specific Etsy listing
- Only promote products confirmed in real inventory

Supported platforms:
- **Twitter/X:** via `post_tweet` MCP tool with `media_urls` parameter
- **Instagram:** via Composio two-step API (create container → publish)
- **Pinterest:** via browser automation "Save from URL" approach

### 5. Performance Monitoring (read `references/performance.md`)

Daily check of:
- Etsy stats page (visits, views, orders, revenue, traffic sources)
- Etsy search visibility page (recommendations, warnings)
- Printify orders API (fulfillment status)

Weekly review:
- Retire bottom 20% listings (0 views after 14 days)
- Scale top 20% (create variations, new product types)
- Update tags/titles based on search data

### 6. Trend Research

Use a combination of:
- **Google Trends** (via Apify scraper or web search) — weekly deep dive
- **Etsy trending searches** (via `sovereigntaylor/etsy-scraper` Apify actor) — daily
- **Instagram/TikTok** (via Apify scrapers) — daily for visual trends
- **Pinterest** — weekly for home decor trends

Score each trend using the 5-factor framework:
| Factor | Weight |
|---|---|
| Search volume / engagement | 25% |
| Growth velocity | 25% |
| Etsy competition level | 20% |
| Printify feasibility | 15% |
| Longevity estimate | 15% |

Action thresholds: ≥4.0 → create immediately, 3.0-3.9 → queue, <3.0 → monitor only.

---

## Product Risk Tiers

| Tier | Products | Why |
|---|---|---|
| **LAUNCH** (start here) | Posters, mugs, stickers | No sizing risk, high margin, standard fulfillment |
| **MONITOR** (add after 20+ sales) | Tote bags, phone cases, keychains | Good margin but lower demand or device-fit risk |
| **AVOID** (until profitable) | T-shirts, hoodies, blankets | Sizing returns will kill margins; high COGS per return |

---

## Seasonal Calendar

Plan product creation 4-6 weeks ahead of these dates:

| Date | Event | Products to Create |
|---|---|---|
| Feb 14 | Valentine's Day | Love/heart/couple themed |
| Mar 17 | St. Patrick's Day | Irish/green/clover |
| Apr (varies) | Easter | Bunny/egg/spring pastels |
| May (2nd Sun) | Mother's Day | Mom/floral/family |
| May (varies) | Nurses/Teachers Week | Appreciation humor |
| Jun (3rd Sun) | Father's Day | Dad/masculine/humor |
| Jul 4 | Independence Day | Patriotic/americana |
| Oct 31 | Halloween | Spooky/gothic/harvest |
| Nov (4th Thu) | Thanksgiving | Gratitude/autumn |
| Dec 25 | Christmas | Holiday/winter/gifts |
| Year-round | Birthdays | Birth flowers (12 months) |
| Year-round | Graduation | Class of [Year] |

---

## Automation Schedule (Cron Jobs)

The recommended daily/weekly schedule (adjust times to your timezone):

| Time | Task | What It Does |
|---|---|---|
| Daily morning | Trend Scan | Instagram, TikTok, Etsy trending search |
| Daily mid-morning | Product Creation | Generate designs, create via API, publish |
| Daily noon | Social Media | Twitter + Instagram + Pinterest posts |
| Daily afternoon | Search Visibility | Check Etsy tips, fix titles/photos/tags |
| Daily evening | Performance Monitor | Views, favorites, orders, returns |
| Weekly (Mon) | Competitor Analysis | Scrape top sellers, compare pricing |
| Weekly (Wed) | Google Trends | Rising queries, breakout trends |
| Weekly (Fri) | Weekly Review | Retire bottom 20%, scale top 20% |

---

## Financial Framework

### Cost Structure Per Sale
| Component | How to Calculate |
|---|---|
| Printify production | Look up via `GET /v1/catalog/blueprints/{id}/print_providers/{pid}/variants.json` |
| Printify shipping | Look up via print provider shipping info |
| Etsy listing fee | $0.20 per listing (renewed every 4 months or on sale) |
| Etsy transaction fee | 6.5% of item price + shipping |
| Etsy payment processing | 3% + $0.25 per transaction |
| **Total Etsy overhead** | **~10-12% of price** |

### Key Metrics Targets
| Metric | Target |
|---|---|
| Conversion rate | 2-3% (new shops may see 1-2%) |
| Return rate | <2% (action trigger: pause category at >3%) |
| Etsy search traffic % | 40-60% of total (may be 0% for first 1-3 weeks) |

### Profit Calculation

```
Net Profit = Retail Price - Production Cost - Shipping Cost - Etsy Fees
Etsy Fees  = $0.20 + (6.5% × Price) + (3% × Price) + $0.25
           ≈ $0.45 + 9.5% × Price
```

Use the Printify API to look up exact production costs per variant before setting prices.

---

## Common Pitfalls (Learned the Hard Way)

1. **Forgetting tags entirely** — Mass product creation scripts often omit tags. Always verify every product has 13 tags before considering it "done." This single mistake caused 0% search traffic on a 110-listing store.

2. **Etsy's AI title recommendations are often wrong** — It may suggest renaming posters as "mugs" or vice versa. Review recommendations carefully; don't blindly accept.

3. **Browser upload limitations** — Cannot upload files directly to Etsy via browser automation (sandbox restriction). Must use JS `fetch()` + `DataTransfer` + `FileList` injection.

4. **Printify `images` field** — Only accepts auto-generated mockup references, not custom uploaded images. Custom photos must go through Etsy's listing editor directly.

5. **Rate limits everywhere** — Printify API ~100 req/min on catalog endpoints. Twitter ~3 tweets per burst. Instagram two-step process. Pinterest SPA causes browser loops — use "Save from URL" approach.

6. **New shop indexing delay** — Etsy search traffic may be 0% for the first 1-3 weeks. This is normal. Don't panic — focus on social media traffic to signal quality.

7. **Etsy Ads waiting period** — New shops must wait ~15 days before Etsy Ads are available. Plan accordingly.

8. **Not checking production costs** — Printify costs vary significantly by print provider and variant. Always look up actual costs via the API before setting prices, rather than assuming fixed amounts.
