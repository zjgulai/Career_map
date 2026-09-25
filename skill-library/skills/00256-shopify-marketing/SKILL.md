---
name: shopify-marketing
description: |
  Unified Shopify marketing router for SEO, explicit pSEO, explicit GEO / AI-search
  visibility, and confirmed social-media drafts/posts. Use when the user asks for
  Shopify marketing, Google/organic SEO, explicit pSEO / programmatic SEO, explicit
  GEO / AI Overviews / ChatGPT / Perplexity citation visibility, or IG/X social
  promotion for a Shopify product, or a user starts/customizes a recommended Campaign
  draft. This skill routes to exactly one reference file
  for the requested track; it must not run a broad "full marketing" bundle.
---

# Shopify Marketing Router

This skill is a **router with safety gates**, not a combined execution playbook. Load exactly one track reference for the user's current intent, unless the user explicitly asks for a sequenced multi-track plan.

For live Shopify data access, the Main Agent completes `aw-shopify-oauth` first. A delegated auditor reuses its verified brief context and returns auth failures to the Main Agent; loading this Skill does not require another connection probe. Before using any bundled Admin, custom-data, or CLI Skill, load [`shopify-execution`](../shopify-execution/SKILL.md) for the Accio execution contract, including documentation and validation helpers. Pure marketing advice or public-page research does not require a store connection. The selected track owns its business preview and outcome checks; `shopify-execution` owns the Main Agent Route C write gate.

## Hard Routing Rules

1. **Classic SEO intent** → read only [`references/seo.md`](references/seo.md).
   - Triggers: SEO audit, Google ranking, organic search, keyword research, competitor SEO, metadata/alt optimization, canonical, robots, sitemap, structured data, rich results, indexing. Writing merchant-supplied Product fields, including SEO values, stays with the Product owner and does not trigger SEO research or lifecycle work.
   - For explicit Product copy generation or optimization—Product Title, SEO title, meta description, handle, rich description, Product media alt, or keyword-to-page assignment—also read the advisory [`references/product-content.md`](references/product-content.md).
   - For an explicitly requested SEO-prepared Product launch, post-publication SEO check, Blog/Article SEO lifecycle, or lifecycle-status/resume request, also read [`references/seo-lifecycle.md`](references/seo-lifecycle.md). Ordinary Product creation or publication does not trigger this reference.
   - Do not load pSEO, GEO, or social-media references for ordinary SEO.

2. **Explicit pSEO intent** → read only [`references/pseo.md`](references/pseo.md).
   - Triggers only when the user explicitly says pSEO, programmatic SEO, programmatic pages, bulk SEO landing pages, or generating many SEO pages at scale.
   - If the user asks for a single long-tail page, size guide, comparison page, city page, or ordinary keyword work, use classic SEO instead.

3. **Explicit GEO / AI-search intent** → read only [`references/geo.md`](references/geo.md).
   - Triggers only when the user explicitly says GEO, generative engine optimization, AEO, answer-engine optimization, AI search visibility, AI Overviews, LLM citation, ChatGPT / Perplexity / Claude / Gemini citation, or similar.
   - Do not infer GEO from generic SEO, "make content better", "add FAQ", "add schema", "allow AI bots", or "use AI".

4. **Social post / IG / X intent or materialized Campaign draft** → read only [`references/social-media.md`](references/social-media.md).
   - Triggers: promote this Shopify product, post to Instagram, post to X/Twitter, make an IG caption/tweet, or a `campaign-recommendation` whose user choice is `start_draft`/`customize` has been materialized into content slots by `shopify-social-campaign`.
   - A raw `campaign_recommendation.matched == true` stays with `shopify-social-campaign`; it is a recommendation, not permission to generate or publish social content.
   - Starting a Campaign creates drafts only. Every external post needs exact-content confirmation after final content exists.

5. **Ambiguous marketing intent** → ask one clarifying question or offer the four tracks as choices. Do not choose pSEO, GEO, or social publishing by implication.

## Cross-Track Safety

- Default to one track per run. A multi-track plan must be staged, for example: classic SEO baseline → explicit GEO audit → explicit social post.
- pSEO and GEO are explicit-only. Never run them because the user said "SEO", "marketing", or "visibility".
- Ordinary Product writes, including supplied SEO values, do not require an `SEOBrief`, lifecycle record, or SEO audit. Explicit SEO-prepared launches and post-publication SEO checks follow `references/seo-lifecycle.md`; newly proposed remediation needs its own confirmed scope.
- Keep conversation language, source storefront content language, and requested target languages/markets separate. Before drafting shopper-visible copy or social text, establish the intended content language from the merchant's request and verified content context; never infer it from conversation language alone. Preview requested language, market, and publish scope with the content. Non-text changes do not need a language question.
- Shopify-native SEO capabilities are verify-first. Canonical URLs, sitemap, default robots rules, SSL, Markets hreflang, and theme-provided metadata/Product structured data are not mutation targets unless rendered evidence proves a defect. A missing Admin mutation is not permission to hardcode a merchant setting in the theme.
- GEO changes are additive and must not overwrite classic SEO titles, meta descriptions, canonical rules, standard robots rules, Product/Breadcrumb/Organization JSON-LD, or theme performance work.
- Social publishing must never be bundled into SEO/GEO/pSEO execution. It requires connected platform authorization, policy preflight, final content review, and an exact-payload confirmation. A remote permalink is best-effort and is not part of the P0 success contract.
- Product/Collection writes use `shopify-product-collection-write-brief` and `shopify-product-editor`; theme-file writes use `shopify-theme-decorator`. Load `shopify-execution` for Main Agent Route C writes. Social publication follows the exact-payload gate in `references/social-media.md`. A research plan, recommendation, schedule, Connector grant, or prior draft approval does not authorize a later write.
- If a reference file links to supporting files, resolve them relative to this skill directory.

## Reference Map

| Track | File | Supporting files |
|---|---|---|
| Classic SEO | `references/seo.md` | `references/product-content.md` for explicit Product copy work; `references/shopify-native-seo-capabilities.md` for audit/execution capability decisions; `references/seo-lifecycle.md` only for explicit SEO launch work, Blog/Article, post-publication, or resume flows |
| pSEO | `references/pseo.md` | none |
| GEO / AI-search visibility | `references/geo.md` | `references/geo/*`, `scripts/geo/*` |
| Social media marketing | `references/social-media.md` | `references/social-media/*`, `templates/social-media/*` |

## Completion Contract

End with the track actually used, what was read, what changed or was only drafted, and the verification evidence. If you skipped a track because it was not explicitly requested, say that briefly.
