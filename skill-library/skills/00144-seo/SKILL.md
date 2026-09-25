---
name: seo
description: Audit, implement, and verify SEO for public websites. Use when the user asks for SEO, search visibility, metadata, indexing, crawlability, sitemaps, robots rules, canonical URLs, or accepts an SEO follow-up. Use schema separately when structured data is needed.
---

# SEO

Improve public pages intended for search discovery. Keep private tools, authenticated dashboards, sensitive workflows, and local-only prototypes out of scope unless the user asks for an audit.

## Workflow

1. Inspect the project, its public routes, and any available deployed or preview URL before proposing changes.
2. Determine intent: report findings for an audit request; modify the project for an optimization or fix request.
3. Prioritize issues that block crawling, indexing, correct search presentation, or access to meaningful page content.
4. Implement fixes in source files using the existing stack. Load `skills/code-generator/SKILL.md` for code changes and `skills/schema/SKILL.md` only when structured data is appropriate.
5. Build the project, inspect generated output, and verify the rendered pages through the normal `site-builder` and `react-local-runtime` gates.

## Required Checks

- **Discoverability:** public routes are reachable, internally linked, and not unintentionally blocked by robots or noindex rules; add a correct sitemap when a production origin is known.
- **Metadata:** each important public route has an accurate, distinct title and description; add canonical and social-sharing metadata when their absolute URLs are known.
- **Content structure:** use one clear page purpose, semantic HTML, logical headings, descriptive links, useful image alt text, and content visible without interaction.
- **Technical delivery:** check broken links, missing routes, mobile rendering, performance problems visible from available evidence, and whether important content is present in crawlable HTML.
- **Structured data:** load `schema` when the page has verifiable entities that benefit from machine-readable markup.

## Guardrails

- Do not invent keywords, business claims, authors, dates, URLs, or search-performance results.
- Do not keyword-stuff, create doorway pages, or generate thin duplicate pages.
- Do not claim rankings, traffic gains, indexation, rich results, or Core Web Vitals that were not measured.
- Do not invent a production domain. Record domain-dependent canonical, sitemap, and validation work as pending when no public origin exists.
- Prefer crawlable static or pre-rendered HTML for public SEO pages. If the current client-rendered stack cannot provide it, state that limitation rather than claiming the site is fully optimized.

## Completion

Report what changed, what was verified, and any remaining deployment-, domain-, or measurement-dependent work. Do not describe an audit-only result as an implemented fix.
