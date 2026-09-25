---
name: coarse-rank
description: >
  Ranks up to 30 search-result candidates into a high-fit shortlist of up to
  10 using surface data only. Supports silent SuperSourcing and visible
  standalone ranking.
enabled: true
---

# Coarse Rank

Rank recalled candidates inline. Do not spawn a subagent, call detail/verification/web tools, or load `write-compare-report`.

## Mode

- **SuperSourcing:** the caller already supplies `status=executing`, `currentStage=sourcing`, requirements, and search results. Do not read or write state. Return the full shortlist and recalled count to `execute-plan.md`; emit no visible text or follow-ups.
- **Standalone:** derive requirements from conversation, rank the latest search results, show the shortlist, and use normal follow-up actions. When called by `sourcing-requirement-collect`, also return the full SuperSourcing result shape for its handoff and let that caller own follow-ups. Do not write state.
- Only when context is unavailable, use one `supersourcing-state read --kind ss` to determine mode.

## Allowed Evidence

Use only fields visible in search results:

- title/category and natural rank;
- price and MOQ snippets;
- supplier name/ID, rating, response, delivery, transaction, reorder, years, and certification signals;
- product/company/image URLs;
- buyer requirements.

Do not call product/supplier detail, verification, WebSearch, tariff, or inquiry tools.

Copy every product/company ID literally from search results; omit an unavailable ID; never invent one. Preserve the corresponding name and URL so downstream stages can use identity fallback.

## Scoring

Score each candidate out of 100:

| Dimension | Points |
|---|---:|
| Product/category relevance | 25 |
| Buyer requirement fit | 20 |
| MOQ and quantity fit | 15 |
| Price availability | 10 |
| Supplier surface signals | 10 |
| Ready-to-Ship fit | 10 |
| Data completeness | 5 |
| Diversity/duplicate control | 5 |

Unknown evidence receives partial credit, never full credit. A name or query match is discovery evidence, not proof of dropshipping, customization, patents, certifications, destination shipping, or another commercial capability; mark unsupported requirements for confirmation. Drop any clear conflict with product family, required specification/material/size, quantity/MOQ, destination constraint, or procurement preference.

Select up to 10 genuine matches; do not fill a quota. If fewer than three are viable, retain them and state the shortfall. Each selected candidate needs one concise buyer-facing `recommendationReason` tied to the actual requirements, not scoring jargon.
Write every `recommendationReason` in the buyer's language.

## SuperSourcing Result

Return once to the caller:

```json
{
  "totalCount": 30,
  "topCandidates": [
    {
      "productId":"...",
      "companyId":"...",
      "title":"...",
      "companyName":"...",
      "isTradable":"Y | unknown",
      "unitPrice":"literal returned value or null",
      "moq":"literal returned value or null",
      "imageUrl":"...",
      "productUrl":"...",
      "companyUrl":"...",
      "location":"...",
      "estYear":"...",
      "reorderRate":"...",
      "transactions":"...",
      "certifications":[],
      "score":92,
      "recommendationReason":"..."
    }
  ]
}
```

Keep every available field needed by `sourcing.md`. The Stage 1 commit writes the full artifact and compacts state; this skill never issues a separate patch.

## Standalone Output

Render one localized table with:

- total recalled and selected counts;
- product/supplier name;
- recommendation reason;
- price and MOQ, using `—` when unavailable;
- a short note that ranking uses search-result surface data and detailed comparison needs additional data.

Then offer 2-5 relevant actions under the Follow-up Output Rules: compare, inquiry, supplier verification, direct order when applicable, or adjust requirements. Do not emit these actions when another workflow owns the chip area.
