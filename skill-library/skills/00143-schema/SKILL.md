---
name: schema
description: Add, repair, or validate Schema.org structured data in JSON-LD. Use for schema markup, structured data, rich-result eligibility, JSON-LD, or when the SEO skill identifies verifiable entities that should be described to search engines.
---

# Schema

Add the smallest accurate set of structured data that describes content already present on the page.

## Workflow

1. Inspect the rendered page and its source data before choosing a type.
2. Select only types supported by the page, commonly `Organization`, `WebSite`, `BreadcrumbList`, `Article`, `Product`, `LocalBusiness`, or `Event`.
3. Implement Schema.org data as valid JSON-LD. Use one `@graph` when several related entities belong together.
4. Keep site-wide entities global and page-specific entities on their matching routes. Avoid duplicate or conflicting markup.
5. Parse the JSON, inspect the rendered DOM, and use an official validator when available. If external validation is unavailable, report it as pending.

## Accuracy Rules

- Every meaningful value must come from visible page content, verified project data, or user-provided facts.
- Never fabricate ratings, reviews, prices, availability, dates, authors, addresses, identifiers, or social profiles.
- Do not add a type merely because it could produce a richer search appearance.
- Use absolute URLs only when the production origin is known. Never invent a domain.
- Keep dynamic markup synchronized with the visible data source.
- Ensure JSON-LD serialization cannot break the surrounding script element.
- When eligibility for a specific search feature matters, verify the current official search-engine requirements rather than relying on memory.

## Completion

State which entities were added, where their values came from, how the rendered markup was checked, and whether external rich-result validation remains pending. Never promise that valid markup will produce a rich result.
