---
name: dashboard-admin
description: Design and build data reports, dashboards, admin panels, back-office tools, CRUD consoles, and hybrid operations workspaces. Use when the interface centers on metrics, charts, tables, filters, records, workflows, approvals, or role-scoped operations; do not use for ordinary marketing sites that only contain a small statistics section.
---

# Dashboard And Admin

This skill owns product classification, data truth, information design, operational interaction, and acceptance criteria for Dashboard/Admin work. It does not replace Canvas design, React/Vite implementation, Supabase, provider operations, safety, preview, or publish owners.

## Classification

Produce this internal routing result before visual design or code:

```json
{
  "product_mode": "report | dashboard | admin | hybrid",
  "primary_task": "read | monitor | diagnose | compare | operate",
  "data_mode": "static | mock | live_read | crud | unspecified",
  "access_class": "public_read | owner_scoped_private | cross_user_aggregate | admin_or_cross_user | unspecified | not_applicable",
  "integration_status": "not_applicable | unverified | available",
  "needs_charts": true,
  "required_references": []
}
```

- `report`: one-time reporting or retrospective analysis.
- `dashboard`: recurring reading, monitoring, diagnosis, or comparison with few write actions.
- `admin`: record and workflow operations dominate.
- `hybrid`: analysis and operations are both first-class.
- `live_read` describes user intent, not proven connectivity. Keep `integration_status=unverified` until the required source and authorized connector/API are actually available.
- Use `unspecified` rather than guessing when the request does not establish a data source or access boundary.

## Reference Router

Read only the references selected by the classification:

- Always read [references/data-modeling.md](references/data-modeling.md).
- For `report`, `dashboard`, or `hybrid`, read [references/data-viz.md](references/data-viz.md).
- When `needs_charts=true`, read [references/charts.md](references/charts.md).
- For `admin` or `hybrid`, read [references/admin-interaction.md](references/admin-interaction.md).

## Workflow

1. Define the primary user, the decision or operation they must complete, and the smallest useful scope. Ask only for missing choices that change the data or security path.
2. Classify the request, then complete the Dashboard/Admin Data Contract from `data-modeling.md` before UI design or coding.
3. For uploaded CSV/Excel/JSON, inspect the actual fields, types, time range, duplicate keys, missing values, and supported calculations. Preserve the supplied source as the fact boundary; do not enrich it from the network unless the user asks.
4. For `data_mode=mock`, make the Demo/sample status visible in the product. Mock data must be internally coherent and must not imply a connected provider.
5. For `data_mode=live_read`, verify the source, connector/API, authorization, and safe server boundary first. If any is absent, state the gap and offer an explicit static-file or Demo fallback; never fabricate a live endpoint or claim automatic refresh.
6. For `data_mode=crud`, classify local versus remote persistence. Load `skills/supabase-mcp-backend/SKILL.md` and `skills/safety/SKILL.md` for Supabase/Auth/RLS/migration work. Load `skills/provider-operations/SKILL.md` before remote mutation.
7. Produce a compact Dashboard/Admin Contract containing the classification, user task, Data Contract summary, required states, interaction inventory, and responsive priorities. Include it directly in the task sent to `canvas-designer` or `reference-site-replicator`; the visual branch may refine presentation but must not change data meaning or permissions.
8. Retain the Dashboard/Admin Contract for implementation. Load and follow `skills/code-generator/SKILL.md` directly with that contract, the user request, resolved implementation requirements, and the separate Google-format `DESIGN.md`, then implement through the existing React/Vite and runtime workflows. Do not create or delegate to an implementation SubAgent.
9. Verify data fidelity, interactions, responsive behavior, security boundaries, production build, and rendered output before claiming completion.

## Hard Constraints

- Every visible KPI, chart, filter, table column, form field, and action must map to the Data Contract.
- Do not invent period comparisons, targets, forecasts, causes, or aggregate results that the source cannot support.
- A control that looks interactive must change data/view state or be clearly disabled with an explanation.
- Do not treat hiding a button as authorization. Cross-user or sensitive access follows the existing Supabase/Safety server-boundary rules.
- Keep static, mock, configured, mutated, verified, and production-ready statuses separate.
- Do not introduce WorkBuddy Page/Database APIs, Doubao JSPages, single-file HTML constraints, or platform-specific runtimes.

## Completion Evidence

Report the selected product/data/access modes, the data source actually used, unsupported metrics omitted, implemented interactions and states, provider status, build result, rendered desktop/mobile verification, and any remaining user-owned action.
