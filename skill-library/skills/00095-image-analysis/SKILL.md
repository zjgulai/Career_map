---
name: image-analysis
description: Use when a buyer provides an image or public image URL and wants to identify, understand, find, source, or search for the pictured product; use Google Lens before Alibaba.com search, with risk detection only for matching restricted categories.
---

# Image Analysis for Sourcing

Convert image evidence into a conservative image understanding and compact sourcing summary for the caller. This skill owns image interpretation and Google Lens evidence only; it does not execute downstream product or supplier search.

## Core Workflow

1. Read the buyer's purpose and identify the target in the original image.
2. Classify the image using the table below and describe only visible evidence.
3. For search intent, classify per [Query risk control](../accio-product-supplier-sourcing/SKILL.md#query-risk-control): non-matches skip detection; matches require a passing result. Then resolve the public image URL and call `accio_web_image_search` exactly once, using its Markdown and `lens_result` for identification only.
4. For a physical product and sourcing purpose, compress the understanding into a sourcing summary.
5. Return the image understanding and sourcing summary to the caller; stop without invoking downstream search.

## Image Types and Attention Dimensions

| Image type | Analyze |
|---|---|
| Single or dominant product | Specific product category, material, color, style, structure, visible function, size cues, brand/logo, and distinguishing characteristics |
| Multiple units of one product type | One unified product description plus meaningful shared traits and visible variants |
| Multiple distinct products | One sentence per product; preserve product boundaries and follow the multi-product rules below |
| Text-heavy image | OCR short text directly; summarize long text while preserving useful tables, lists, product names, and explicit requirements |
| General image | Overall scene, key objects, readable text, logos, graphics, color palette, composition, style, and purpose-relevant aesthetics |

For product sourcing, focus on commercial physical products. Ignore background props, decoration, and incidental scene objects. If the buyer names a target, analyze only that target. If no target is stated and one product clearly dominates, use the dominant product. Treat a closely related set as one commercial product when it is normally sold together.

## Visible-Evidence Boundary

- Describe only what is visible in the original image.
- Do not invent dimensions, materials, functions, capacities, models, brands, certifications, performance claims, or OCR text.
- Use a visible logo or label when readable; otherwise do not guess the brand.
- Keep uncertain identification broad and explicit instead of forcing a precise category.
- Search results may confirm the basic product name/category only. Do not copy unseen specifications or features from search-result titles or pages into the image understanding or sourcing summary.

## Google Lens for Every Image

Subject to step 3, pass every usable public image URL to `accio_web_image_search` exactly once, regardless of identification confidence or image quality. Use this request shape with no other fields:

```bash
accio-mcp-cli call accio_web_image_search --json '{"fieldName_3": {"payload": {"image_url": "https://cdn.example.com/product.jpg"}}}'
```

Read the returned Markdown and JSON-list `lens_result`. Each Lens result contains `title` and `link`. Compare the titles for a consistent category signal. If they converge, use that signal to name the product, then rebuild all attributes from the original image. Preserve relevant source links when explaining an identification that depended on Lens.

If Lens results are empty, conflicting, or the MCP call fails, continue with the original image and do not fabricate certainty. Do not repeat the Lens call automatically. If no concrete public HTTP/HTTPS URL exists, do not invent one; continue with the available image understanding.

## Sourcing Summary

Create a sourcing summary only when the image contains an actual physical product and the buyer wants product or supplier search. Format it as:

```text
<pure product noun>, <1-3 globally salient visible attributes>
```

Use a pure product noun without articles such as `a`, `an`, or `the`. Prefer clear structural or functional traits, then material, shape, color, or style. Ignore tiny logos, small local patterns, decorative micro-details, and marketing adjectives.

| Visible evidence | Sourcing summary |
|---|---|
| Matte black steel bottle with screw cap | `stainless steel water bottle, matte black, screw cap` |
| Yellow canvas tote | `tote bag, canvas, yellow` |
| Several same-style shirts in different colors | `long-sleeve shirt, assorted colors` |

Keep the summary grounded in the image. The caller may combine it with explicit buyer constraints; do not invent missing specifications.

## Multiple Products

- Multiple units of the same product type: merge them into one sourcing summary.
- Multiple distinct products with a buyer-named target: search only the target.
- Multiple distinct products when the buyer explicitly wants all: keep each descriptor separate with semicolons in one consolidated sourcing summary.
- Ambiguous multi-product scope: prefer the visually dominant commercial product. Do not pretend that unavailable crop or separation steps occurred.

## Text-Heavy and General Images

For a text-heavy image such as a document, table, manual, catalog, specification sheet, or shopping list:

- Transcribe short text and preserve useful structure.
- Summarize long text around the buyer's purpose.
- Do not create a visual sourcing summary merely because the text mentions products.
- If the buyer explicitly requests sourcing, return written product names and requirements as text-derived summary content, not as claimed visual attributes.

For a general image used for style, design inspiration, aesthetics, or trend discussion, provide Markdown or natural language understanding of the scene, palette, composition, objects, graphics, and readable text. Do not force a product search or create a sourcing summary unless the buyer actually asks to source a physical product.

## Understanding Output

Return compact Markdown or natural language with this boundary:

```markdown
Image understanding: black stainless-steel bottle with cylindrical body, matte finish, and screw cap.

Sourcing summary: stainless steel water bottle, matte black, screw cap

Identification source: <Lens links only when they materially resolved the product identity>
```

Omit the identification-source line when the image was already clear or Lens did not materially resolve identity. Match the buyer's language. End after returning this understanding; downstream orchestration belongs to the caller.

## MCP Reference

Call `accio_web_image_search` directly. The only service input is the public image URL nested under `fieldName_3.payload.image_url`.

| MCP result | Handling |
|---|---|
| Markdown plus non-empty `lens_result` | Use `title` and `link` only to resolve uncertain product identity |
| Empty `lens_result` | Keep identification broad; do not invent products |
| MCP error | Continue with the original image, report the failure when useful, and do not fabricate matches or automatically repeat the call |
