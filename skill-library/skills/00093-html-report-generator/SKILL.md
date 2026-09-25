---
name: html-report-generator
description: |
  Config-driven HTML business report generator. Use when the buyer needs a polished HTML report,
  product comparison report, supplier verification report, product-selection analysis, market scan,
  or chart/table/card report. The agent writes a JSON report config, calls the registered
  html-report-generate CLI tool, and delivers the generated standalone HTML file.
enabled: true
---

# HTML Report Generator

Create polished standalone HTML reports from semantic JSON config. The agent writes structured report content as blocks, not raw HTML/CSS, then calls the registered `html-report-generate` CLI tool.

- `{SKILL_DIR}` = the directory where this SKILL.md resides.
- `{PROJECT_DIR}` = the user's current project root directory or the requested output directory.

## When to use

Use this skill for:

- Product comparison reports.
- Supplier verification reports.
- Product-selection analysis reports.
- Market scan or opportunity analysis reports.
- Any report that needs cards, tables, charts, risk panels, action steps, or plain text panels in HTML.

Do not use this skill for:

- Standalone profit calculators. Use `profit-calculator` instead. Reports may use read-only `profit.calculator`; product-analysis reports may use editable `table.profit_calculator`.
- Buy Now order/SKU rendering.
- Raw Markdown-only answers when no HTML artifact is requested.

## Core rule

> The agent must write **semantic JSON config**, not custom HTML. Styling, layout, sidebar table of contents, common block headers, common block descriptions, charts, and responsive behavior are handled by the renderer.
>
> **Content completeness rule**: The generated HTML must be a lossless semantic rendering of the completed report content. Do not omit, summarize, compress, reorder away, or downgrade any required section, conclusion, caveat, evidence row, table row, source note, or verified link when translating report content into blocks. If the calling skill defines a report template, the HTML must satisfy the same content and completeness requirements as that template.
>
> **Description rule**: If a reasoning or explanatory paragraph belongs to a section, table, chart, card, or any preceding content, place it in that block's common `description` field. Do NOT create `ai_insight`, `aiInference`, or standalone AI inference blocks.

## Workflow

1. **Schema prerequisite**: Before the first config Write/Edit, CLI discovery/probe/help call, or render attempt, load this skill and read [block-config.md](block-config.md) completely. The renderer CLI is already registered as `html-report-generate`; do not search for it or probe how to invoke it.
2. Decide the report type and outline sections.
3. **Config — write-only tool round**: Write the complete JSON config to `{PROJECT_DIR}/<report-name>.config.json` using one native file-write call (`Write`/`Edit`). End the tool round and await success.

   > ⚠️ **Never write the config with a shell heredoc or `echo`/`printf` redirection** (e.g. `cat > file <<EOF ... EOF`). In an unquoted heredoc the shell expands `$21`, `$40`, `$PATH`, etc. as variables, so a price like `$21.50` is silently written to disk as `.50`. The renderer then faithfully renders the corrupted `.50` and the bug looks like a rendering problem when the data was already destroyed on write. Any value containing `$`, backticks, or `${...}` — prices, currency, regex, shell-like text — MUST be written through the native file tool. If a shell heredoc is truly unavoidable, quote the delimiter (`<<'EOF'`) to disable expansion.

4. Use semantic blocks from [block-config.md](block-config.md).
5. Prefer common `header` for titles and subtitles.
6. Set `page.language` to the report language. If renderer-generated UI labels should use a different language, set `page.uiLanguage`; otherwise UI labels follow `page.language`. Supported UI languages: `en` (default), `zh-CN`, `zh-TW`, `es`, `pt`, `fr`, `de`, `ja`.
7. Put explanatory prose that belongs to a specific block in that block's `description` field; never create `ai_insight` or a separate block just for AI inference.
8. Preserve links from the Markdown/source content by using link objects such as `{ "text": "Supplier A", "url": "https://..." }`, Markdown inline links such as `[Supplier A](https://...)`, or block fields that support `url`. Link objects and Markdown inline links are supported in normal inline text positions such as table cells, lists, meta values, summaries, action steps, and descriptions.
9. **Render — renderer-only tool round**: After the config write succeeds, call only the registered CLI tool:

```bash
html-report-generate --config {PROJECT_DIR}/<report-name>.config.json --output {PROJECT_DIR}/<report-name>.html
```

When the calling skill owns a report-contracts JSON file (its own layout constraints keyed by `reportType`), append `--contracts <path-to-that-skill's-contracts.json>` so the render also validates those business constraints. Without `--contracts`, only the generic block schema is validated.

Never batch the config Write/Edit with the renderer or combine them in one shell command. Never invoke `accio-mcp-cli call html-report-generate`, `accio-mcp-cli call html_report_generate`, or enumerate MCP toolkits to find this local CLI.

10. Deliver the generated HTML file path to the buyer. Do not auto-open the browser unless explicitly asked.

## When referenced by another report skill

If another skill (for example product selection, product/supplier comparison, or supplier verification) asks for an HTML artifact, keep responsibilities separate:

- The calling skill defines **what the report must contain**: evidence rules, business logic, required sections, language, tone, and persistence path.
- This skill defines **how to turn that content into HTML**: semantic JSON config, block choice, rendering command, and validation.
- Do not fork this skill's block schema or rendering workflow into a calling skill as a competing spec. A calling skill that always writes the same fixed, small block set may pin that subset's field contract inline for self-containment, provided it stays a faithful copy of this reference and defers here for any block outside that subset; this file remains the source of truth, and schema changes here must be propagated to those pinned subsets.
- Preserve the calling skill's original content rules. Only translate its completed report content into suitable semantic blocks. The HTML config must be built from the completed full report content, not from a short summary, outline, chat highlight, or reduced subset.
- The HTML artifact must fully satisfy the calling skill's report requirements: same required sections, same structure depth, same conclusions, same caveats, same evidence/table rows, same source notes, and same verified links. Block choice may adapt to HTML semantics, but content completeness may not be reduced.

## Minimal config

```json
{
  "version": "1.0",
  "reportType": "product_comparison",
  "page": {
    "title": "Product Comparison Report",
    "language": "en"
  },
  "blocks": [
    {
      "type": "hero",
      "kicker": "Product Comparison",
      "title": "Product Comparison Report",
      "subtitle": "Top supplier options",
      "tags": ["Comparison", "Suppliers"]
    },
    {
      "type": "card.summary",
      "variant": "decision",
      "header": {
        "title": "Recommendation"
      },
      "headline": "Choose Supplier A for the best balance of MOQ, price, and compliance.",
      "content": "Supplier A is the strongest option because it combines low MOQ with verified production capability.",
      "highlights": ["MOQ matches requirement", "Verified supplier", "Clear export experience"]
    }
  ]
}
```

## Common fields

Most content blocks support these common fields:

- `header`: object with `title`, `subtitle`, `description`, `eyebrow`, `tags`, `meta`, `level`.
- `description`: plain string for block-level explanatory text. This replaces the old `ai_insight` concept.

Use `header` for block titles and short subtitles. Use top-level `description` for the block's single explanatory prose field. Do not create `ai_insight`, `aiInference`, or standalone AI inference blocks; strict validation rejects them.

## Block selection guide

Use the supported block types below. The renderer only accepts these schema names.

### Structural

- `hero`: report title area, normally once at the top.
- `section`: H2/H3/H4-like separators for report structure.

### Card

- `card.summary`: executive conclusion, recommendation, supplier/product profile, or highlighted warning. Use `variant` such as `decision`, `summary`, `profile`, `insight`, or `warning` to choose the visual emphasis.
- `card.ranking`: ranked product or supplier recommendations.
- `card.quote`: standalone note, tip, warning, or source callout. Do not use it for AI reasoning that belongs to another block.
- `card.opportunity`: opportunity, risk/opinion, or strategy direction cards.

### Table

- `table.data`: generic tables and image-capable product rows.
- `table.key_value`: evidence tables such as registration, certification, or verification facts.
- `table.comparison`: multi-option comparison. For product/supplier compare, only the single most recommended entity should carry a recommendation `badge`; other headers should not carry recommendation tags.
- `table.product_source`: product-selection/source-option cards for Alibaba products. Put the tool-returned main image URL in `items[].image` and the product detail page in `items[].url`; ordinary comparison or supplier verification reports should prefer `table.comparison`, `table.data`, or `table.key_value`.
- `table.profit_calculator`: editable single-product profit table for product-analysis reports only.

### List

- `list.insight`: structured findings, trends, or evidence bullets.
- `list.risk`: risks with mitigations.
- `list.action`: recommended next steps or buyer actions.

### Text

- `text.panel`: plain paragraphs, narrative explanation, or fallback content.
- `text.source`: source, boundary, or disclaimer notes.

### Calculator

- `profit.calculator`: read-only profit comparison generated from a profit-calculator prefill file.

### Chart

- `chart.metric_distribution`: percentage bars and feature distribution.
- `chart.standard`: bar, line, pie, or donut charts.

For complete field definitions and examples, read [block-config.md](block-config.md).

## Rendering behavior

The renderer automatically provides:

- Mac-like white/light-green visual style.
- Sticky sidebar table of contents generated from block titles.
- Responsive layout; the sidebar hides on narrow screens.
- Common block header and description rendering.
- HTML escaping for text, links, and images.
- Chart.js rendering via CDN for chart blocks.

## Validation

The renderer is strict. If the config contains unexpected fields, unsupported block types, invalid nested fields, table/chart shape errors, or any block render exception, `html-report-generate` fails with a non-zero exit code and prints `Render failed: ...` with the exact config path when possible.

After generation:

1. Check the CLI output for success.
2. If rendering fails, read the `Render failed:` message.
3. Fix the named config path or block in a new write-only tool round and await success.
4. Rerun the CLI alone in a later renderer-only tool round. Do not rerun the unchanged command.
5. Do not deliver a partially rendered HTML file after a failed render.

Common causes:

- Missing required `type`.
- Typo in block type or field name.
- Unexpected fields not defined by [block-config.md](block-config.md), including old `ai_insight` / `aiInference` fields.
- Standalone AI inference blocks; move the text into the related block's `description`.
- Table row keys not matching `columns[].key`.
- Chart data missing numeric `value` fields.
