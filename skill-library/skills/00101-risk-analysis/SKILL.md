---
name: risk-analysis
description: >-
  Pre-order trade risk scan (/risk) for buyers on Alibaba.com. Use when the
  buyer asks to check, scan, or review risks of a pending or specified deal
  before placing the order (risk check, "any risks before I order", scan this
  order) — the skill auto-pulls destination country, product category, trade
  terms, logistics mode, and negotiated contract terms from the conversation
  and the referenced supplier's IM history, confirms the scan target, then
  scans three dimensions (contract terms, compliance, logistics), grades
  findings red/yellow/gray, and delivers an actionable risk report (summary +
  per-risk dual-layer notes citing Trade Dispute Resolution Rules + pre-order
  action checklist) as an HTML artifact. Also handles follow-up questions
  about this scan's findings (expand a risk item, its rule basis,
  destination-country certification/clearance/tariff details behind a
  finding). Payment risk, sanctions screening, and IP-infringement scanning
  are out of scope this phase. Pure trade-knowledge Q&A not tied to a deal
  risk scan stays with trade-knowledge; do not draft supplier messages
  (negotiation-assist), analyze quotations (quotation-analysis), quote
  freight or duty rates, or execute orders/payments/refunds. All risk and
  rule statements must be grounded in the risk knowledge base via the
  retrieval tool — never from general knowledge.
---

# Risk Analysis (/risk)

Buyer-facing pre-order risk scan: assemble the deal context from the conversation, confirm the scan target, scan **contract terms / compliance / logistics** against the risk KB, grade findings 🔴red / 🟡yellow / ⚪gray with dual-layer notes (Risk Note + non-committal Liability Note citing the Dispute Resolution Rules), and converge into one actionable report. The full report is persisted as an HTML artifact and presented as a preview card; the chat reply carries only the summary plus the report link.

> ⚠️ **Hard gate — HTML artifact before buyer reply**: after the report is composed, generate `sourcing-plans/<slug>/risk-analysis-<descriptor>.html` through `html-report-generator` and pass only that HTML to `present_files` before the buyer-visible response. One scan, one report file pair. Procedure: [Artifact persist](#artifact-persist).

## Hard Gates

1. Read this file, `references/scan-rules.md`, and `references/report-template.md` completely before scanning; read `../im-conversation-reader/SKILL.md` before reading IM history.
2. **Confirm the scan target before scanning — always.** Single candidate deal: a yes/no confirmation naming it (supplier + product + one-line terms). Multiple active deals/orders: list them and let the buyer pick. Never scan an unconfirmed target (the PRD explicitly requires confirmation even for a single candidate — this intentionally differs from quotation-analysis).
3. Parse supplier context only from the current request's `@[label](mention:aiMode:supplier/<id>?...)` references (`imConversationId`, `sellerAliId`, `supplierName`), using only parameters actually present. Every turn needs its own supplier reference — never reuse one from an earlier turn, including turns triggered by a clicked follow-up chip. IM history is read only with a current-turn supplier reference; without one, scan from conversation-stated facts only, and when IM facts are required invite the buyer to `@` the intended supplier — never ask for an internal ID. `imConversationId` and `sellerAliId` never appear in buyer-visible output.
4. **Retrieval first**: every risk item, rule statement, penalty, or coverage claim traces to a `trade_kb_get` result from the risk KB (tool below). No grounding → no claim. Deal facts trace to the conversation/IM/tool output; terms never discussed are marked `not agreed`, missing fields `to be confirmed` (Chinese reports: 未见约定 / 待确认) — never inferred.
5. **MVP dimension whitelist**: scan output covers contract terms / compliance / logistics only. Payment, sanctions, and IP items never enter the report this phase, even when the KB recalls them.
6. **Dual-layer wording**: each risk item = Risk Note (objective, second person, with a countermeasure) + Liability Note in non-committal wording ("may / could / the platform has the right to, at its discretion" — per `scan-rules.md` §4). Day counts and figures stay verbatim from the rule text.
7. **Rule references stay internal — any non-URL source attribution is forbidden in buyer-visible output**: no corpus document names, article numbers, clause titles, KB names, `citation` / `citationEn` strings, or slice ids in the report or chat reply (the corpus ships citation strings in Chinese/English only; echoing them breaks other buyer languages). Use the retrieved `规则依据` field and `citation` strings internally to verify which article grounds a finding — never renumber from memory. Refer to the basis generically in the report language ("Alibaba.com's official platform rules"); a `Source:` line is allowed only for a publicly accessible URL. The `无规则依据的口径` row has no matching article — pass it on as practical advice only, never phrased as a platform rule.
8. **Fuzzy dispute positioning**: NR dispute percentages, ranks, and sample sizes are internal only; buyer-visible output uses qualitative positioning ("relatively frequent / prominent") — `scan-rules.md` §5. Tariff-regime facts (e.g. "5% duty + 15% VAT") may be quoted as-is.
9. Grading is evidence-based (`scan-rules.md` §3): red = blocker (prohibited goods / platform non-acceptance / mandatory certification explicitly unavailable), yellow = concrete pre-order action required, gray = routine advisory. When unsure, grade down. Routine industry terms are never inflated into risks.
10. Money is written as ISO code + amount (`USD 49/unit`), never a bare `$`. Match the buyer's query language (the plugin's definition — the buyer's latest message; an explicit language request overrides; default English); after the confirmation `ask_user`, the AskUser-locked language governs subsequent replies and the artifact. One language throughout.
11. No cost/freight/duty estimation in the risk report — qualitative impact only ("USD 49/unit is not your landed cost"); numeric landed-cost modeling belongs to other skills.
12. Keep internal ids, slice ids, tool names, and raw fields out of buyer-visible output. No `widget` output — this skill has no widget authorization. Disclaimers are fixed: light one-liner in the chat reply and inside the report's risk section, full disclaimer as the report's closing block.
13. **Follow-up chips via the Follow-up Output Rules.** Pick exactly 3 candidate actions from the scenario table in `references/report-template.md` §4 and emit them as the reply's closing contiguous `<follow>...</follow>` chip block per the Follow-up Output Rules. Never render the same choices again in the reply body — no "Suggested next steps" heading, no bulleted/numbered next-step list, no prose restatement of the chips. Never paste the full report into chat.

## Workflow

### 1. Assemble context

Extract per `references/scan-rules.md` §1: destination country, product/category, trade term, logistics mode, payment structure, negotiated terms, unit price × quantity. Sources: current conversation; the referenced supplier's IM history via `im-conversation-reader` (respect the reader's limits — default `50` per page, at most `200` valid messages / `4` pages — and its safe failure outcomes). No usable supplier reference and no deal context in conversation → ask the buyer to `@` the supplier or describe the deal. Missing destination country or product → one clarification (merge into the confirmation card when possible).

### 2. Confirm the scan target

`ask_user` per the plugin's rules: sequential cards only (never two in one turn), `header` at most 12 characters, every option with a non-empty `description`, no `Other` option, and the AskUser language lock from the plugin prompt (the locked language then governs subsequent replies and the artifact):

- One candidate: yes/no card naming it — e.g. "Supplier A · Android phones ×500 · FOB Shenzhen → US" with options [Yes, check this deal] / [Not now].
- Multiple candidates: form listing each as `[supplier · product · one-line terms]`.
- Proceed only after explicit confirmation; buyer declines → stop gracefully.

### 3. Scan three dimensions

Run the checklists in `references/scan-rules.md` §2 top-down. Retrieval per recipe (`references/corpus-guide.md` §3), typical sequence:

1. `trade_kb_search` with `dimensions: [country=<destination>, src=countries]` and no `queryText` — the country card (certs, clearance requirements, labels, tariff level, country risk rows); destination outside TOP14 → `trade_kb_get ["country:other"]`, universal risks only, and say the KB lacks country-specific data.
2. `trade_kb_search` with `dimensions: [src=universal, stage=<stage>, type=<category>]` — the universal items relevant to this deal (dest-port fee, damage, delay, loss, fake tracking), then `trade_kb_get` the chosen ones.
3. `trade_kb_search` with `queryText` from the clause text + `dimensions: [src=clause]` for missing/unbalanced contract terms; compare agreed deadlines against platform defaults in `dispute`.
4. `trade_kb_get ["dispute:<N>"]` (article-level) for each liability note actually cited — locate the article via `trade_kb_toc` when the number is not already known.

Respect the progressive-disclosure budget: ≤5 `trade_kb_get` slices per scan beyond the country card, prefer article-level ids; stop at the first layer that answers.

### 4. Grade and compose

Grade each finding 🔴/🟡/⚪ per `scan-rules.md` §3, converge to 3-7 items (all red/yellow kept, gray trimmed), deduplicate across dimensions, then compose the full report exactly per `references/report-template.md` §2 (summary counts must equal actual items; must-do actions map 1:1 to 🔴/🟡 items).

### 5. Persist the artifact, then reply

Persist per [Artifact persist](#artifact-persist). Only after `present_files` receives the generated HTML does the buyer-visible reply go out, per `report-template.md` §4: scan target named, 2-4 sentence summary (counts + one-line verdict + yellow items), light disclaimer line, report link. Never the full report body.

## Retrieval Tool

All KB access goes through the **`trade-kb-mcp`** MCP server (`kbCode: "risk"`), which serves the risk corpus from a managed vector store. The corpus itself is not shipped with this skill — there are no local data files to read; every knowledge access goes through these tools.

| Tool | Purpose |
|---|---|
| `trade_kb_search` | Locate slices. `queryText` for semantic recall, `dimensions` for metadata filtering, or both. Returns **titles + ids only** by default — pick ids, then `get`. |
| `trade_kb_get` | Fetch slice text verbatim for chosen `sid`s, plus a ready-made `citation` string. |
| `trade_kb_toc` | Browse structure: no `path` → source list; `path: "<source>"` → slices; `path: "<sid>"` → item titles. |
| Built-in `web_search` | Peer recall channel alongside the KB tools — live Alibaba.com international-site pages via the platform's built-in web search. Use when the KB returns nothing on-topic or the question calls for live platform data the KB may not cover (e.g., recent policy updates, product-specific pages). Run `web_search` with the buyer's question as keywords; cite the returned page title and URL. |

**Dimensions** (`{name, values[], source, confidence}`; values accept Chinese / English / ISO codes / aliases — the server normalizes them and reports anything it discarded in `droppedDimensions`):

| Dimension | Values | Filtering strength |
|---|---|---|
| `type` | `logistics` `customs` `compliance` `fee` `clause` `ip` `force_majeure` `penalty` `assurance` `dispute` `method` | **Strongest — narrows 75 slices to ~6-10. Pass it whenever the risk category is known.** |
| `src` | `countries` `universal` `clause` `framework` `dispute` `penalty` `assurance` | Strong — use to pin one corpus |
| `kind` | `card` `clause` `method` | Separates curated cards from verbatim rule text |
| `stage` | `pre_order` `pre_shipment` `in_transit` `post_delivery` | Weak (39% of slices are stage-agnostic) |
| `country` | `EU` (all 27 member states resolve here; UK separate) `US` `UK` `MX` `CA` `TR` `AU` `BR` `IN` `SA` `IL` `KR` `JP` `AE` `OTHER` | Weak on its own — 80% of slices are country-agnostic, so it returns ~61 slices. Pairs well with `type` |
| `role` | `buyer` `seller` | Weak |
| `seller_region` | `mainland` (**default**) `taiwan` `hongkong` | Trade Assurance Parts B/C are Traditional Chinese and crowd out Part A; only override for an explicit TW/HK seller question |

Slices that do not carry a dimension are tagged with a reserved value (`UNIVERSAL` for `country`, `ALL` for the rest) and survive any filter on it — universal risks always stack onto a country card automatically.

**Retrieval recipes** (details: `references/corpus-guide.md` §3):

1. **Deal risk scan** — `trade_kb_search` with `country` + `type` + `stage` and no `queryText` (pure filter, deterministic and ordered), then `trade_kb_get` the country card plus the relevant universal items.
2. **Contract clause review** — `trade_kb_search` with `queryText` = 2-3 nouns from the clause text and `src: ["clause"]`.
3. **Ruling basis** — verbatim rule text recalls poorly by semantics (it is legal prose, not buyer language). Prefer `trade_kb_toc` with `path: "dispute"` to locate the chapter, then `trade_kb_get` at article level (`dispute:34`) rather than a whole chapter.
4. **Penalty / TA coverage** — `trade_kb_search` with `src: ["penalty"]` or `["assurance"]`.

`retrievalStatus` is `ok` / `empty` — it reports whether rows came back, **not whether they are relevant**. `score` is cosine similarity, useful only for ordering within one call: measured, out-of-corpus questions score up to 0.775 while correct hits go as low as 0.551, so the ranges overlap and no threshold separates them. Decide relevance by reading the retrieved title and text. Nothing on-topic → fall back to `trade_kb_toc` browsing — never pad with general knowledge, and never cite a high-scoring slice that does not fit the question.

Respect the progressive-disclosure budget: ≤5 `trade_kb_get` slices per scan beyond the country card, prefer article-level ids; stop at the first layer that answers. Measured slice sizes and the escalation ladder: `references/corpus-guide.md` §5.

For follow-up questions about this scan's findings (expand a risk item, its rule basis, country requirements behind a finding): retrieve, answer grounded in the fetched slice text (the `citation` field stays internal for verification), numbers verbatim, recall-or-empty — never fabricate country rules or rates; the same sourcing rules apply (no non-URL attribution — refer to the basis generically in the buyer's language); liability/tax/compliance answers carry "subject to official platform rules". Pure trade-knowledge Q&A not tied to a scan stays with `trade-knowledge`.

## Artifact persist

After the report content is fully composed, **before** the buyer-visible response:

1. Resolve slug per [`sourcing-artifact-writer`](../sourcing-artifact-writer/SKILL.md) Path Strategy: reuse the slug visible in context; only mint from the product noun when none exists.
2. **Mint this scan's report basename** `risk-analysis-<descriptor>`, `<descriptor>` = supplier short name + scan date (e.g. `ri[REDACTED]`); ASCII lowercase/digits/hyphens only, both files in `sourcing-plans/<slug>/`.
3. **Collision check by filename only**: list `sourcing-plans/<slug>/risk-analysis-*.html`. Same deal re-scanned → reuse the basename (fresh complete write replaces config + HTML); different deal holding the name → append `-2`, `-3`. Never open or merge an existing config.
4. **Write the config** with a native file-write tool only (never shell heredoc/echo — `$` values get corrupted): one complete semantic-block JSON per `references/report-template.md` §3.
5. **Generate**: `html-report-generate --config sourcing-plans/<slug>/<basename>.config.json --output sourcing-plans/<slug>/<basename>.html`.
6. **Render validation is the gate**: fix any `Render failed:` and rerun; never reply before success, never fall back to pasting the report into chat.
7. **Present**: pass only this run's generated HTML to `present_files`; configs and other runs' reports are never surfaced, modified, or deleted.
8. Reply per Workflow step 5, appending the file path tip per `sourcing-artifact-writer` Universal I/O Constraint #8.

## Failure Handling

- IM read failure → return the reader's safe failure outcome; scan only with what the conversation itself provides, stating the gap.
- No deal context found → ask the buyer to `@` the supplier or describe the deal (destination, product, terms); do not scan thin air.
- Buyer declines confirmation → stop; offer to scan when they are ready.
- Destination outside TOP14 → universal risks only + explicit coverage note (never fabricate country specifics).
- Retrieval empty for a checklist item → skip that item silently (never pad); if the whole scan yields nothing beyond routine advisories, say so honestly (an all-gray report is valid).
- Render failure → fix config and rerun; a turn without the generated HTML on disk is an unfinished flow.

## Final Check

Run `references/report-template.md` §6 checklist before responding. Additionally confirm: the scan target was explicitly confirmed; only the three MVP dimensions appear; every liability note is non-committal and its ruling logic was verified against a rule-map-corrected clause (internally — no clause numbers or document names in the output); no non-URL source attribution anywhere; no dispute percentages/ranks/sample sizes; no bare `$`; `present_files` received exactly this run's HTML; the reply closes with exactly 3 `<follow>` chips selected per `report-template.md` §4 — no "Suggested next steps" heading, no bulleted/numbered next-step list, no prose restatement of the chips in the reply body.

## Resources

- `references/scan-rules.md` — context fields, per-dimension checklists, red/yellow/gray criteria, dual-layer wording, data-fuzzing rules
- `references/report-template.md` — report content contract, HTML block mapping, chat reply template, follow-up chip scenarios, pre-output checklist
- `references/corpus-guide.md` — corpus map, dimension filters, recall recipes, country aliases, disclosure budgets, buyer-visible sourcing, maintenance
- The corpus, the vector index, and the `trade-kb-mcp` backend (`kbCode: "risk"`) are maintained outside this plugin (dev-side KB archive + indexing pipeline); this skill ships no corpus files and never reads them at runtime
