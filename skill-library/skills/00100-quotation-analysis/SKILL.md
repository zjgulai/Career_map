---
id: quotation-analysis
name: quotation-analysis
description: >-
  Analyze one seller quotation from the referenced supplier's IM conversation
  against the buyer's own inquiry: how well the quote covers the buyer's
  requirements, what the trade term means for landed cost and responsibility,
  and the quote's completeness, reasonableness, strengths, and risks. Use when
  the current request references a supplier via @ mention and the buyer asks
  to analyze, review, interpret, or sanity-check that supplier's quote,
  quotation, proforma invoice, or price message — including whether its quoted
  price is fair, reasonable, or within budget; whether the quote is complete
  or worth accepting; what that quote really costs all-in (landed cost with
  freight, duty, and tax); whether it matches the inquiry; and what is missing
  or risky in it. Handles one quotation per run; multiple quotation versions
  from the same supplier require the buyer to select one or explicitly request
  a two-version comparison. Do not compare quotations across different
  suppliers (write-compare-report), verify suppliers
  (supplier-verification-report), draft negotiation messages
  (negotiation-assist), create orders, or send anything; general trade-term or
  freight/HS-code/tariff questions not tied to that specific quotation stay
  with trade-knowledge and the logistics skill, and profit or margin modeling
  stays with profit-calculator.
---

# Quotation Analysis

Help the buyer understand one seller quotation: what it covers against the buyer's own inquiry, what the trade term means for landed cost and transaction responsibility, whether the price and terms look reasonable, and what strengths and risks the quote carries. The full report is persisted as an HTML artifact and presented to the buyer as a preview card; the chat reply carries only a concise summary plus the report link — never the full report body.

> ⚠️ **Hard gate — HTML artifact before buyer reply**: after the report content is fully composed, generate this quotation's own report file `sourcing-plans/<slug>/quotation-analysis-<descriptor>.html` through `html-report-generator` and pass only that HTML file to `present_files` before the buyer-visible response. One quotation, one report file pair. Full procedure: [Artifact persist](#artifact-persist).

## Hard Gates

1. Read this file and `../im-conversation-reader/SKILL.md` completely before calling any tools.
2. Parse supplier context only from the current request's `@[label](mention:aiMode:supplier/<id>?...)` references (`imConversationId`, `sellerAliId`, `supplierName`). Every turn needs its own supplier reference — do not reuse a supplier from an earlier turn, including turns triggered by a clicked follow-up chip. When the current request has no usable supplier reference, respond naturally in the buyer's language and invite the buyer to `@` the intended supplier; never ask for an internal ID.
3. Analyze exactly one quotation per run. When multiple quotation candidates from the current supplier are detected — revision versions of the same quotation or parallel offers — confirm the analysis target before any analysis; never pick one silently. Label them correctly: revisions are versions of one quotation (the two-version comparison is offered), parallel offers are distinct alternatives (no cross-offer version comparison).
4. A single detected candidate needs no confirmation card: name it (date + source) at the top of the reply and proceed directly — never present one candidate as a multi-candidate choice. Multiple candidates get an enumerable choice, and analysis starts only after the buyer confirms.
5. Base every factual claim on IM messages, attachment content actually read in the current run, or tool output. Never invent prices, terms, freight, duties, certifications, or lead times. Every uncertain or missing value is marked `to be confirmed` (rendered in the report language; in Chinese reports use the PRD wording `待核实`) — never conclude around missing information (no cheaper-all-in verdict while freight, duty, or certification is still unconfirmed).
6. No definitive conclusions. Never assert "this quote is acceptable", "cheapest option", "definitely compliant", or similar; every judgment is conditional and cites its evidence ("if the FCC claim holds, then…").
7. The analysis serves the buyer. Never excuse or downplay a seller-favoring term, and never nudge the buyer toward accepting a disadvantageous quote; state every unfavorable term plainly with its impact on the buyer. The counterweight also holds: routine industry-standard terms are noted as such (🟢 or under reasonableness), not inflated into risks.
8. Platform price positioning is not wired up. Do not fabricate it or claim comparison against platform transactions. Judge price reasonableness only from internal signals: arithmetic consistency, deviation from the buyer's stated budget, and freight-to-value sanity, and state plainly that platform positioning is unavailable. If such a capability lands later, cite it only as a relative position (high / medium / low) with a disclaimer — never concrete figures, ranges, sample sizes, or data sources.
9. Every freight, duty, or landed-cost figure is a rough estimate and must say it does not constitute an exact quote. Duties default to `to be confirmed`.
10. Keep internal IDs, raw field names, tool names, endpoint names, request parameters, and pagination details out of buyer-visible output.
11. Match the language of the buyer's latest message; keep the report in one language.
12. Persist the report per [Artifact persist](#artifact-persist) before the buyer-visible reply. One quotation, one report file pair: the only files this Skill writes are this run's `sourcing-plans/<slug>/quotation-analysis-<descriptor>.config.json` and its generated `.html`; report files of other quotations are never read, modified, or deleted, and the config JSON is internal-use-only and never surfaced to the buyer. Never paste the full report into the chat reply.
13. **End the buyer-visible reply with exactly 3 follow-up chips** emitted as one contiguous `<follow>...</follow>` block under the Follow-up Output Rules (this Skill specifies the count; the applicability exceptions, format, and placement in those rules still apply). Select the 3 from this skill's candidate pool, adapted to the buyer's language and this run's findings: draft a negotiation message to this supplier, ask the supplier to confirm the report's `to be confirmed` items, compare quotations across suppliers, or verify this supplier. Never render the same choices as a prose or numbered list in the reply body.

## Supplier Context and IM History

- Resolve and read the conversation through `im-conversation-reader`: use the mention's `imConversationId` when present, otherwise let the reader resolve it from `sellerAliId`. Respect the reader's limits (default `50` per page; at most `200` valid messages / `4` pages).
- Read backward far enough to cover the buyer's inquiry and every quotation version from this supplier.
- One supplier per run. If the request references several suppliers for quotation analysis, handle only a clearly chosen one and explain that cross-supplier comparison belongs to the compare report.

## Attachments

Quotations often arrive as attachments (PDF and similar). Attachment reading is not a guaranteed capability — when the runtime surfaces the document's content, use it directly; never assume it, depend on it, describe any parsing mechanism, or claim to have read a document whose content is not actually in front of you. If the content cannot be read or the document is not a quotation, mark it as "attachment content not included" (in the buyer's language), ask the buyer to paste the quotation text, and continue only with what is actually readable. Never guess attachment content.

## Clarification

Use `ask_user` following the plugin's rules: sequential cards only (never two in one turn), `header` at most 12 characters, every option with a non-empty `description`, no `Other` option, and the AskUser language lock from the plugin prompt.

- Single candidate: no clarification card — proceed directly and open the report by naming the analyzed quotation (date + first line or attachment name) so the buyer can redirect if it is the wrong one.
- Multiple candidates: `mode: "form"` listing each candidate as `[date · source label]`; when the candidates are versions of the same quotation, add one final option to compare the two latest versions (do not offer it across parallel offers).

## Workflow

### 1. Read history and detect quotation candidates

Read the IM history backward. Identify every seller message that constitutes a quotation:

- Text quotations: messages containing a price plus at least one commercial term (unit price, total, MOQ, lead time, payment, incoterm).
- Attachment quotations: messages carrying a quotation document; read each per the attachment rule above.
- Revisions: a later seller message that restates the price or key terms of the **same item and configuration** is a new **version** of the same quotation — list each version as its own selectable candidate, labeled as initial/revised, and offer the two-version comparison.
- Parallel offers: alternatives quoted alongside each other (different models, configurations, quantity tiers as separate offers, or shipping options in the same round) are distinct candidates labeled as alternatives — never offer a version comparison across different offers, and never label a revision as a parallel offer or vice versa.

For each candidate record: timestamp, source (text / attachment name), and a short label. If none is found, say no quotation was detected and stop; do not analyze the buyer's inquiry alone.

### 2. Confirm the analysis target

- One candidate: proceed directly; open the report by naming it (date + source).
- Multiple candidates: run the clarification form and proceed only after the buyer confirms. For the comparison option, analyze the latest version and add a short `Version changes` section listing what changed between the two, ending with one line on whether the revision trend favors the buyer.

### 3. Extract the buyer's inquiry requirements

From buyer messages, extract: product/model, specifications (physical vs advertised), quantity, customization (logo, packaging, firmware), destination market, required certifications, network/band requirements, target price or budget, preferred incoterm, sample intent. Keep only what the buyer actually stated; mark nothing as required that the buyer never raised.

### 4. Extract the quotation content

From the confirmed quotation (text and/or attachment), extract: model and configuration (note physical vs virtual/expanded specs explicitly), unit price and currency, quantity basis, incoterm, payment terms, sample policy, lead time, warranty, MOQ and customization conditions, certifications claimed. Preserve exact figures and wording for the report, keeping every figure's currency and unit basis (per unit / per shipment / per order). Derive the extended order total when both unit price and quantity are quoted, or the effective unit price when only a total is quoted; label these values "derived" and cross-check them against any seller-quoted total, flagging mismatches.

### 5. Run the three analyses

Read `references/match-patterns.md` and `references/cost-estimation.md` completely before this step.

- **Requirement match (C3)**: compare each buyer requirement against quotation content; classify every row ✅ matched / 🟡 partially matched / 🔴 unconfirmed or mismatched; give a one-clause reason per row. Apply the P1–P7 attention patterns from `references/match-patterns.md` and surface any that hit.
- **Trade term and landed cost (C4)**: state the quoted incoterm and the buyer's preferred term, explain the responsibility gap in buyer terms, then estimate landed cost per `references/cost-estimation.md`: product price + estimated freight + duty (`to be confirmed` by default) = estimated landed range; when a category-typical duty-rate range is available, also give a duty-inclusive landed range with its duty portion still marked `to be confirmed`. Always carry the rough-estimate disclaimer and, when the buyer prefers another term, add a negotiation suggestion to request it. Use only these estimation rules; do not call any freight or tariff tool.
- **Professional evaluation (C6)**: evaluate completeness (covered vs missing, and why each missing item matters), reasonableness (price from internal signals — arithmetic consistency, deviation from the buyer's budget, freight-to-value sanity; payment terms fairness; sample terms vs industry practice), strengths, and risks (🔴/🟡/🟢, each tied to quotation evidence), following `references/report-template.md` section ④. Do not claim any platform price positioning.

### 6. Persist the artifact, then reply

Compose the full report exactly per `references/report-template.md` and persist it per [Artifact persist](#artifact-persist). Only after `present_files` receives the generated HTML does the buyer-visible reply go out, containing: the analyzed quotation named at the top (date + source), the top-level summary (3-5 sentences: what the quote is, the conditional overall read, what to do first), the requirement match level plus the single most important risk signal, the disclaimer, and the generated HTML report link — never the full report body. After the business content is complete, close the reply with the 3-chip `<follow>` block per Hard Gate 13.

## Artifact persist

After the report content is fully composed (workflow steps 1-5 plus `references/report-template.md` rules applied), **before** the buyer-visible response:

1. Resolve slug per [`sourcing-artifact-writer`](../sourcing-artifact-writer/SKILL.md) Path Strategy: reuse the slug already visible in context; only when none exists, mint one from the quoted product noun.
2. **Mint this quotation's report basename** — one quotation, one report file pair. Name it `quotation-analysis-<descriptor>` where `<descriptor>` is a short readable label for the analyzed quotation, normally the supplier short name plus the quotation date (e.g. `quotation-analysis-global-lighting-20260830`); add a short source or version marker (`-revised`, `-pdf`) when that supplier quoted more than once that day. Descriptor wording is flexible; the hard rules are the `quotation-analysis-` prefix, ASCII lowercase letters/digits/hyphens only, and both files living in `sourcing-plans/<slug>/`. A two-version comparison is one report keyed to the latest analyzed version.
3. **Collision check by filename only**: list `sourcing-plans/<slug>/quotation-analysis-*.html`. If the basename is already taken by a *different* quotation, append a numeric suffix (`-2`, `-3`). If this same quotation already has a report (re-analysis), reuse its basename — the new run replaces that quotation's config and HTML with one complete fresh write. Never open, merge, or edit any existing config: every run writes a complete self-contained config covering exactly this quotation.
4. **Write the config** with a native file-write tool only — never a shell heredoc or `echo`/`printf` redirection (see `html-report-generator` for why `$` values get corrupted): one complete semantic HTML JSON config containing the full report, mapped per `references/report-template.md` section "HTML block mapping".
5. **Generate the HTML artifact**: run `html-report-generate --config sourcing-plans/<slug>/<basename>.config.json --output sourcing-plans/<slug>/<basename>.html`.
6. **Render validation is the generation gate**: fix any `Render failed:` issue in the JSON config and rerun. Never reply before the render succeeds, and never fall back to pasting the full report into chat.
7. **Present the HTML artifact**: after render succeeds, pass only this run's generated `sourcing-plans/<slug>/<basename>.html` to `present_files`. Reports of other quotations are never re-presented, modified, or deleted; the config JSON, folders, and intermediate files are internal-use-only.
8. Send the buyer-visible reply per workflow step 6, appending the file path tip per [`sourcing-artifact-writer`](../sourcing-artifact-writer/SKILL.md) Universal I/O Constraint #8.

> Full spec for path conventions: see [`sourcing-artifact-writer`](../sourcing-artifact-writer/SKILL.md). HTML config/rendering details live in [`html-report-generator`](../html-report-generator/SKILL.md).

## Failure Handling

- IM read failure: return the reader's safe failure outcome; do not fabricate a quotation.
- Attachment unreadable: mark it as not included; ask the buyer to paste the quotation text; continue only with what is actually available.
- No quotation detected: say so and stop.
- Partial requirement extraction: run the comparison on supported requirements only and state which requirements could not be confirmed.
- Missing supplier reference: invite the buyer to `@` the intended supplier and stop.
- Render failure: fix the config per the `Render failed:` message and rerun `html-report-generate`; the reply waits for a successful render — a turn without the generated HTML on disk is an unfinished flow, not a reason to inline the report.

## Final Check

Before responding, confirm that:

1. Exactly one quotation was analyzed — the single detected candidate named at the top of the reply, or the buyer-confirmed choice among multiple candidates (or an explicit two-version comparison).
2. Every factual claim traces to IM text, attachment content, or tool output; every estimate carries the rough-estimate disclaimer; every figure carries its currency and unit basis (per unit vs per shipment made explicit), and derived totals or unit prices are labeled and reconciled against quoted figures.
3. No fabricated platform price positioning; price reasonableness rests on internal signals only; no concrete platform numbers, sample sizes, or sources appear.
4. Every uncertain freight, duty, certification, or other value is marked `to be confirmed`, not concluded around, and no definitive conclusion is asserted anywhere.
5. Money is written as an ISO currency code plus the amount (`USD 45/pc`), with no bare `$` anywhere — paired `$` signs break the renderer by triggering math mode.
6. Internal IDs, tool names, and raw fields are absent from buyer-visible output.
7. The HTML artifact contains the complete report per `references/report-template.md`, uses one language, and ends at the closing `text.source` disclaimer block; the chat reply is the concise summary plus the report link, never the full report body.
8. This run's config is a complete self-contained report for exactly this quotation, the render succeeded, `present_files` received only this run's generated HTML path, no report file of another quotation was read or modified, no other file was written, and the reply ends with exactly one contiguous 3-chip `<follow>` block with no prose or numbered duplication of the chips.
