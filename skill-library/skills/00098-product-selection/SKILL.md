---
name: product-selection
description: >
  Product selection and procurement planning for buyers who need to decide what category, product, style, SKU mix, equipment, or solution route to procure. Use for resale-profit questions such as what to sell, best sellers, winning products, trends, blue-ocean opportunities, market analysis, and margin analysis, and for business or operational self-use questions such as what to buy for a store, factory, or process improvement. For resale intent at ANY scope — a BROAD category (with or without explicit opportunity wording: find opportunities / discover niches / "don't know which direction yet") OR a concrete product type/niche ("recommend 10 yoga mats", "can I sell squishy games") — this skill first converges the scope into a Top-3 evidence-backed track recommendation via its built-in opportunity-discovery engine, then picks concrete products inside the leading track, in one merged report; only ASIN/link-level single-product validation runs the classic selection flow directly. Do not use when the exact product is already decided and the buyer only wants listings or suppliers; a bare product name or product phrase with no selling/deciding wording (e.g. "running shoes") is a product search, not this skill. Do not use when the buyer has already locked ONE niche and wants a market-level view (size, trend, competition) — that routes to cross-border-market-research.
---

# Product Selection

Choose exactly one internal path from the buyer's purpose. Do not expose internal path names.

## Dependent tool-call barrier

When a later CLI consumes a file created or changed in this workflow, use a strict serial boundary:

1. The Write/Edit message contains one tool call only.
2. After that call, wait for its successful result before any further tool call.
3. Invoke the consumer CLI alone in a later message.

This boundary restricts tool calls, not text — a short buyer-visible status line in those messages is fine. Never batch a config Write/Edit with its consumer CLI. Never combine them in one shell command. This barrier applies to both selection Pipeline configs and HTML report configs, including recovery after an error.

Before any HTML config Write/Edit, CLI discovery/probe/help call, or render attempt, load `html-report-generator` and read its `block-config.md` completely. The registered renderer command is already known; do not search for it.

## Deliverable discipline

⛔ The ONLY report artifact in every path is the final rendered HTML. Never author a Markdown report, analysis draft, interim summary, supplier-result file, or notes `.md` file at any point mid-flow — compose report content directly in the HTML JSON config. The only model-written files are the pipeline/engine config and contract files and the HTML JSON config itself. Script-generated `.md` outputs (e.g. `product_table.md`, `feature_viz.md`) are pipeline artifacts, not model-authored reports, and stay internal.

## Route by purpose

1. **Resale**: The buyer will resell the products and cares about demand, competition, opportunity, or profit. Read and follow [`references/resale-selection.md`](references/resale-selection.md). Unless the buyer supplies a specific ASIN or product link for single-product validation, first run the direction-convergence phase per [`references/direction-convergence.md`](references/direction-convergence.md) — it converges the buyer's scope (broad category OR concrete product type/niche) into Top-3 tracks and automatically deep-dives the leader through the resale flow into one merged report, structured by seller mode: dropship resale → [`references/track-report-template.en.md`](references/track-report-template.en.md), private-label boutique → [`references/boutique-track-report-template.en.md`](references/boutique-track-report-template.en.md). When that flow requires direction narrowing without any Amazon category, use [`references/convergence.md`](references/convergence.md); the ASIN/link-validation direct entry uses [`references/resale-report-template.en.md`](references/resale-report-template.en.md).
2. **Self-use**: The buyer will use the products, equipment, or solution in their own store, facility, or operation. Skip Amazon analysis. Read and follow [`references/selfuse-selection.md`](references/selfuse-selection.md) and [`references/selfuse-report-template.en.md`](references/selfuse-report-template.en.md).

If the purpose is unclear or genuinely mixed, call `ask_user` once with one decision question: whether the primary goal is resale profit or use in the buyer's own operation. Continue immediately after the answer. Do not ask this question when the buyer's message already makes the purpose clear.

Plain sourcing for an already-decided product is not a third path in this skill; the global router owns that case.

## AskUser rendering contract

Every `ask_user` in this skill must render localized option cards, not placeholder-only free-text fields. Invoke the tool with `mode: "form"` and a `questions` array. Each question must ask one decision dimension and contain:

- a standalone, non-empty `question` that states exactly what the buyer is deciding;
- a non-empty `header` of at most 12 characters;
- **Language (HARD RULE)**: `question`, `header`, and every option `label`/`description` are rendered in the buyer's locked query language (per the global AskUser language lock). Concept names and wording-trigger terms quoted in this skill's reference docs are internal terminology — express their meaning in the locked language; never copy doc-language wording verbatim into a card for a buyer of another language;
- two to four mutually exclusive `options`, each with a non-empty `label` and `description`;
- `multiSelect: false`, unless a referenced flow explicitly requires multi-select;
- `recommended` only when context supports a real recommendation; its zero-based index must point to an existing option.

Use this structure:

```json
{
  "mode": "form",
  "questions": [
    {
      "question": "<one complete buyer-language question>",
      "header": "<short buyer-language label>",
      "options": [
        { "label": "<likely answer>", "description": "<decision-relevant explanation>" },
        { "label": "<likely answer>", "description": "<decision-relevant explanation>" }
      ],
      "multiSelect": false
    }
  ]
}
```

Never put the meaning of a question only in surrounding prose or an input `placeholder`. Never emit an `ask_user` question without `options`. Do not add an `Other` or manual-input option; the platform supplies the free-text affordance. Do not output the JSON as chat text—invoke `ask_user` as a tool call.

## Path isolation

- Keep the resale path behavior unchanged. Do not apply self-use questions, cost rules, or report sections to it.
- Never run `amazon-selection-pipeline`, Amazon/Jungle Scout research, or resale convergence for the self-use path.
- Match the buyer's language in questions, reports, summaries, and follow-up chips.
