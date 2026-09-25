---
name: sourcing-artifact-writer
description: >
  Canonical path, ownership, content, and write rules for sourcing artifacts in
  SuperSourcing and standalone flows.
enabled: true
---

# Sourcing Artifact Writer

## Path Strategy

All artifacts live under the current Accio Work workspace:

```text
sourcing-plans/<english-product-noun>-<YYYYMMDD-HHMMSS>/
```

Translate the product noun to lowercase ASCII kebab-case; do not transliterate or append action words. Use one local timestamp at first creation and reuse the exact slug for the procurement. Never list/glob folders to rediscover it.

- SuperSourcing uses exact `state.planDir`.
- Standalone skills reuse the path already visible in context; only the first writer mints it.
- Inquiry state/config/output paths reuse the same slug.

## Inventory And Ownership

| File | Owner | Update mode |
|---|---|---|
| `report.html` | `product-selection` | Generated once from internal `report.config.json` via `html-report-generate` when `selection` is planned. |
| `market-research.md` | `cross-border-market-research` | One complete market-level report when `market_research` is planned. |
| `selfuse-procurement-report.html` | `product-selection` | Generated once from its internal config when `procurement_plan` is planned. |
| `<slug>-product-analysis.html` | `product-analysis-report` | Generated once from its internal config when `product_analysis` is planned. |
| `requirements.md` | `render-supersourcing-artifact` | Full write at initialization; an upstream-unlocked Requirements node refreshes and commits it atomically. |
| `sourcing.md` | Search commit renderer | Full write; re-search archives the prior version. |
| `sourcing-v<N>.md` | Search commit renderer | Immutable archived search round. |
| `compare.html` | `write-compare-report` | Generated from `compare.config.json`; comparison round 1, immutable once written. |
| `compare.round-<N>.html` | `write-compare-report` | Generated from `compare.round-<N>.config.json`; one immutable file per later comparison round. |
| `inquiry-compare.html` | `write-compare-report` | Generated from `inquiry-compare.config.json` for a planned seller-response comparison. |
| `supplier-verification.html` | `supplier-verification-report` | Generated HTML artifact for the first batch; later batches preserve history in the generated artifact. |
| `quotation-analysis-<descriptor>.html` | `quotation-analysis` | Generated from the same-basename `.config.json`; one self-contained report file pair per analyzed quotation — each new quotation gets its own new file pair, re-analysis of the same quotation rewrites its own pair in full, and reports of other quotations are never modified. |
| `review.md` | SuperSourcing terminal stage | One complete dynamic write. |
| `progress.md` | SuperSourcing renderer | Initialized once; updated once per stage commit/archive. |
| `ARCHIVED.txt` | SuperSourcing archive renderer | Full overwrite. |
| `inquiry-progress.config.json` | `accio-inquiry` | Internal state + render input (state in `blocks[0].state`). |
| `inquiry-progress.html` | `html-report-generator` | Buyer-facing Inquiry Progress artifact. |

SuperSourcing always owns requirements, progress, and the terminal review. Each completed `plan.nodes[]` item links only the artifact declared by its Owner contract; inquiry artifacts exist only when an inquiry capability runs.

## Universal I/O Constraints

1. Finish mandatory writes before claiming completion. Artifact failure blocks the stage transition.
2. Compose a complete owner artifact before file I/O. First SuperSourcing rounds use one write and no pre-read.
3. Read once only when preserving an existing later round/batch; perform one combined update.
4. Match the buyer's language in headings and prose. Preserve returned names, codes, prices, and URLs exactly.
5. Do not expose internal IDs. A seller ID may appear only inside the canonical IM URL: `https://www.accio.com/chat?activeIcbuAliId=<sellerId>`.
6. Product and supplier links are not interchangeable. Never fabricate or repurpose URLs.
7. Image cells use one literal returned HTTP(S) URL or `—`. Forbid shell substitutions, heredoc fragments, multiline URLs, and shell expansion of literal currency values.
8. Outside SuperSourcing, show a localized link to the artifact just written. Inquiry links to `inquiry-progress.html`, never its data JSON. The link may ONLY be emitted after the write succeeded in THIS turn (confirmed by the write tool result or a read-back); a path link without the file on disk is a hallucinated deliverable — a hard flow failure.
9. SuperSourcing never hand-writes `requirements.md`, `sourcing.md`, `progress.md`, or `ARCHIVED.txt`.

## Single-Call SuperSourcing Commands

### Initialize

```text
render-supersourcing-artifact init --task-ids-json '{"<nodeId>":"<taskId>"}'
```

One call binds every visible node, writes `requirements.md`, initializes dynamic `progress.md`, and starts the ready Requirements node or every ready `auto + read` node. Requirements completes only when collection was already persisted. A valid RC handoff may also write `sourcing.md` and start Compare.

### Commit Unlocked Requirements

```text
render-supersourcing-artifact requirements
```

When an upstream node unlocks Requirements, one call writes `requirements.md`, updates `progress.md`, and commits the active Requirements node. Bootstrap Requirements remain part of `init`.

### Commit A Stage

```text
render-supersourcing-artifact commit-stage --stage <sourcing|compare|verify> ...
```

One call validates the stage artifact, updates `progress.md`, compacts state, and starts every newly ready `auto + read` node. Each changed file uses atomic replacement.

### Commit Another Capability

```text
render-supersourcing-artifact commit-node --node <node-id> --artifact <plan-relative-file> --entity-ref <kind:id> --result-json-file - --summary "<concise result>"
```

Pass only fields required by the active capability contract. Repeat `--artifact` for multiple buyer-facing artifacts and `--entity-ref <kind>:<id>` for compact recovery references; omit optional arguments when unused. One call validates the handoff, completes the node, updates `progress.md`, and starts every newly ready `auto + read` node.

### Failure Recovery

Use `render-supersourcing-artifact fail-node --node <node-id> --summary "<reason>"` after recovery for an executing Owner node is exhausted. It marks the node and `progress.md` failed together. On an explicit retry or corrected input, use `render-supersourcing-artifact retry-node --node <node-id>`; it restores ordinary nodes for execution, returns protected writes to confirmation, and refreshes the plan view. Never perform Owner work while state remains `failed`.

### Archive

```text
render-supersourcing-artifact archive --action "<buyer action>"
```

One call records the buyer action, completes detailed links in `progress.md`, writes `ARCHIVED.txt`, and sets archived state.

## Artifact Content Contracts

### `report.html`

When selection is planned, contains the market evidence and 3-5 product directions produced before the buyer chooses one, rendered by `html-report-generate` from the internal-use-only `report.config.json`. Later stages do not rewrite or regenerate it.

### `requirements.md`

Contains creation time, product, quantity, destination, procurement method, product family, and every selected product attribute. It is the canonical human-readable requirement record; `progress.md` keeps only a one-line requirement summary.

### `sourcing.md`

Contains the complete Search shortlist, normally up to 10:

- completion time, enriched query, entity/intent type, Ready-to-Ship preference;
- recalled and selected counts;
- every selected product/supplier with returned image, product link, supplier link, literal price, MOQ, location, score, and specific recommendation reason.

Do not include rejected candidates or truncate to Compare recommendations. Re-search writes the previous complete file to `sourcing-v<N>.md` before replacing it.

### Phase: Compare Report (`compare.html`)

Owned by `write-compare-report`. `compare.config.json` is the source and `compare.html` is the generated buyer-facing artifact for round 1; each later round writes its own `compare.round-<N>.config.json` / `compare.round-<N>.html` instead of modifying an earlier round. It retains requirement fit, comparable commercial facts, quantity estimate, delivery/destination feasibility, supplier capability/certifications, risks, unresolved fields, and the canonical recommendation table. The report, not state, owns full recommendation reasoning.

### `supplier-verification.html`

Owned by `supplier-verification-report`. It retains complete evidence sections for every recommended supplier in recommendation order, including partial-failure status. Parallel workers never generate this shared artifact.

### `review.md`

Contains requirements and decisive evidence from every completed planned node. Its sections and links follow `plan.nodes` and `artifactRefs`; it never claims an unplanned capability completed. A complete Search, Compare, and Verification run preserves options, search, comparison, verification, risk, unresolved checks, and procurement advice.

### `progress.md`

Contains:

- one-line requirements summary;
- planned-stage status table;
- recalled, shortlisted, compared, recommended, and verified counts;
- current recommendation summary;
- one concise summary per completed stage;
- buyer action history;
- final links to `requirements.md` and every planned owner artifact.

Stage summaries never duplicate full tables or report prose. The renderer updates the active row, funnel, summary, and next-stage row in one atomic write.

### `ARCHIVED.txt`

Contains archive timestamp and confirms that the plan folder is preserved.

## Owner-Specific Persistence

- **Comparison:** every comparison round writes its own config once without pre-read, then generates the matching HTML — round 1 as `compare.config.json` / `compare.html`, later rounds as `compare.round-<N>.config.json` / `compare.round-<N>.html` (round number from a directory listing). Earlier rounds are never read back, merged into, or overwritten; the sole reason to open an earlier config is to recover entities the buyer explicitly carried forward.
- **Verification:** first SuperSourcing recommendation batch generates `supplier-verification.html` once without pre-read. Later/re-entry batches read once and preserve all prior supplier sections in one update.
- **Review:** always one full terminal write after in-memory validation; never write, read back, then repair.
- **Inquiry:** state content is owned by `accio-inquiry`; `sourcing-artifact-writer` defines shared path and ownership conventions.
