---
name: new-product-approval-orchestrator
description: >-
  Use for small Amazon/Jungle Scout keyword and metric lookups, including two keywords with five related terms and search volumes each, even when no approval or report is requested. Use this private quick-lookup lane instead of alibaba-amazon-market-intel. Also choose the smallest workflow for constrained screening, deep Amazon approval, sourcing, buyer prospects, deliverable revision or a specific product/SKU discrepancy. Preserve platform and constraints, load only the chosen workflow, and stop when the requested deliverable is met. Use on new goals or corrections; an approval memo is only one route, not the default output.
---
# Product task entry and orchestration

Identify the current question before collecting evidence. This is the single entry for task selection and execution depth; do not load a second routing skill or run the full approval workflow by default.

## 1. Carry the current task contract

Read the visible conversation and keep internally: goal, platform/country, exact product/ASIN/SKU or keywords, requested metric/period, mandatory criteria, exclusions, count, output format and allowed action. Do not create a separate document or task list merely to record these fields. A correction supersedes conflicting choices; compatible earlier constraints remain. “Continue” inherits the last confirmed goal, not the first task in the conversation.

Clarify only a missing fact that materially changes the route or answer, using one focused question. For JS/Amazon research, use an explicitly requested market, an unambiguous marketplace-specific Amazon URL or the established task market; otherwise default to Amazon US without asking a station-selection question. State the queried market and disclose the US default in the response, then briefly offer the other supported markets listed in AGENTS.md. Do not replace an explicitly non-Amazon platform with Amazon. Genuine conflicting market instructions may be clarified; an omitted station is not a blocker. Do not require cost, MOQ or ASIN for a trend lookup or catalog-based prospect list. Once a deep approval task is selected, its other missing-input rules apply.

## 2. Select the smallest sufficient route

Apply the specific current deliverable before generic “research” or “report” wording. A compound request is not automatically an approval task.

| Current deliverable | Route and completion condition |
|---|---|
| Definition, translation or calculation from already supplied values | Answer directly; label assumptions; no data collection or extra skill needed. |
| One or several explicit metrics/keyword lookups, with no screening or investment judgment | Read [quick lookup](references/quick-lookup.md) only. Fetch the necessary evidence and answer; independent lookups use its bounded helper. Two keywords alone are still a light task. |
| Edit/export/repair an existing report, table or image | `deliverable-revision`; preserve unchanged content and verify the requested artifact. No fresh research unless needed for a requested factual update. |
| Explain a discrepancy in an existing product, SKU, price or metric | Follow [object discrepancy checks](references/object-discrepancy.md); compare the exact objects and evidence rather than rerunning product discovery. |
| Named buyers/brands/importers with individual development angles | `buyer-prospect-shortlist`; named evidence-backed prospects, not a generic strategy memo. |
| Concrete products/suppliers with counts, links, specifications or no-repeat requirements | `constraint-led-sourcing`; preserve hard conditions and separate verified candidates from gaps. |
| Non-Amazon or multi-platform research, shop/category rankings, broader market exploration | `target-market-research`; keep evidence scoped to the requested market. A narrow supported lookup above does not need this extra workflow. |
| Amazon investment judgment or explicitly requested combined approval memo | Read [deep approval workflow](references/deep-approval-workflow.md) only now; use its domain dispatch and conditional verdict. |
| A single Amazon business deliverable beyond a direct lookup | Choose the matching domain skill below; do not load the deep approval workflow. |

Amazon single-domain dispatch: directions/trends → `trend-breakout-scout`; validate demand/first order → `validate-before-you-source`; evaluate Amazon demand for a product currently sold elsewhere → `demand-mirror`; margin/cost scenarios → `margin-reality-check`; competitor teardown → `competitor-teardown`; keyword bank plus Listing copy → `keyword-listing-builder`; ad test budget → `ad-spend-planner`. A keyword-volume question without Listing copy stays on the quick route.

Load only the selected private skill with the native skill tool, before account-global substitutes or delegation. If it cannot be loaded, report the loading issue; do not claim its procedure ran. Supporting research is added only for missing inputs to the chosen deliverable. For example, 1688 suppliers for an Amazon idea remains a sourcing task, with Amazon evidence separately labelled.

For a brand/model metric question without an ASIN, use the quick lane's long/short product-identification mode rather than stopping after one empty full-name search. Prefer long-query matches, then inspect short-query candidates; verify brand, complete model, specifications and parent/child identity before the requested metric call. An already known ASIN goes directly to its metric. Do not reinterpret related-product records or trailing-30-day snapshots as the requested SKU's calendar-month sales.

## 3. Bound execution and close the task

- **Light tasks**: no default task creation, separate report generation, subagent review or independent verification delegation. Finish after the requested facts and their source/period/limitations are available and usefully presented. Fast means fewer unnecessary execution rounds, not the shortest possible response. Present an already returned time series as an inline trend chart in the same answer when useful, without another retrieval or research phase; include detail as needed. Do not turn two successful keyword lookups into a competitor study.
- **Screening**: stop at the requested qualified count or the bounded collection limit; report the verified count and unmet constraints instead of filling with unverified items or searching indefinitely.
- **Deep tasks**: state a supported interim finding when available, what remains unverified, and why further collection matters. Tool progress alone is not a business result. At the collection budget boundary, deliver verified partial findings and next actions.
- **Tool problems are not a new route**: apply the shared [execution boundaries](../../references/execution-boundaries.md) to the current goal. Do not load a recovery skill, restart the task or explore access repeatedly. A timeout is not proof of missing entitlement; an empty result is not zero demand.
- **Missing data does not change markets**: name the unavailable platform/period/metric and deliver supported parts. Offer multiple feasible next choices, with Agent-led same-platform work before optional independent market comparison and user-supplied inputs last. Do not start a changed-market analysis without the user's direction, or invent access to fill the options. Never substitute Amazon evidence for WB, 1688, TikTok or B2B facts.
- **External actions remain read-only**: do not purchase, pay, list products, send inquiries or launch ads. Explain the boundary; a local draft is not external execution. Finding a matching workflow does not grant a tool, connector or write permission.

User-facing output follows the conversation language defined in AGENTS.md. If a deep task genuinely needs task tracking, the user-visible values of `task_create` fields (`subject`, `description`, `activeForm`) and subsequent progress updates use that same language, not a fixed English template. Keep JSON keys, required machine enums, tool identifiers and exact product/keyword strings unchanged. Internal dispatch must carry the conversation language so delegated user-visible task text also follows it. This does not require task tracking for light requests.

Source notes must be visible beside the response's data and key findings, even when a report file also contains them. Apply [response evidence and next choices](../../references/response-evidence-and-next-steps.md) without adding another Skill or verification phase. Clearly separate actual Jungle Scout values, other consulted research, user inputs, calculations and assumptions.
