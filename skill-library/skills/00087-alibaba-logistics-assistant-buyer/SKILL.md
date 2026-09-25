---
name: alibaba-logistics-assistant-buyer
version: 1.4.20
description: >
  MUST read before any other Owner or tool on the same turn for current shipping,
  freight, or delivery-cost facts, even inside product/supplier search,
  comparison, inquiry, quotation, negotiation, or order planning. Covers quotes,
  routes or modes, tracking, HS/customs codes, duties, tariffs, import charges,
  landed cost, low-shipping-cost selection, and price-plus-shipping requests.
  Missing product choice, cargo details, or other prerequisites must not postpone
  this Owner to a later buyer turn; let its backend request or infer them. Also
  trigger on concrete product IDs or URLs, cargo/quantity/weight,
  origin/destination, warehouse-to-door, or sea/air requests. Do not trigger only
  for general logistics knowledge or wording that merely asks a supplier to quote
  freight later. Forward the request to the logistics backend, preserve its
  business result verbatim, and convert only its explicit interaction tail to
  native ask_user or follow UI. Every new-task input must be self-contained with
  the complete relevant trusted context from the current conversation.
---

# Alibaba.com Buyer Logistics

## Interaction Ownership

This skill is the self-contained and highest-priority authority for every
`ask_user` component and `<follow>` tag emitted by the logistics workflow. Its
explicit interaction rules take precedence over the Follow-up
Output Rules wherever they differ. On turns handled by this skill, the generic
default chip count, action selection, and other global defaults do not apply.
If any instruction conflicts, follow this skill.
This override is scoped only to the logistics workflow's interaction output.

When the output invokes or displays `ask_user`, follow the required-information
rules below and emit no `<follow>` tags. If execution resumes after the buyer
answers and later produces a final visible reply, reevaluate the latest backend
result under this skill: required information uses `ask_user`, while a completed
result may use only the backend-supplied optional actions.

## Same-Turn Routing

Read this Skill on the buyer turn that explicitly requests a logistics
deliverable, including when another Owner must run first to obtain a product,
supplier, or other prerequisite. Dependencies determine execution order only;
they never justify omitting logistics, promising to handle it later, or replacing
it with a suggestion to ask a supplier.

When an explicit logistics deliverable needs one concrete product as input and
product search returns at least one perfect result, stop the sourcing loop and
hand the first perfect result's tool-provided fields to logistics in the same
buyer turn. For this logistics handoff, this rule takes precedence over the
sourcing Owner's Post-Search Decision Protocol: do not run the Strategic Pivot,
semantic retry, or an additional supplier search merely to improve the candidate
pool. The normal sourcing protocol still applies when sourcing itself is the
remaining deliverable or when no perfect product result exists.

When another Owner or tool returns a product or supplier during the current turn,
use the selected result's trustworthy fields as current-conversation context and
then call the logistics backend in that same turn. If a required fact remains
unknown, still call the backend and let its result decide whether buyer input is
required.

If ranked product search results are available and the buyer did not choose one,
use the first exact-match result as an explicitly Agent-selected quote candidate.
Pass only fields present in the tool result, such as product ID, URL, title,
listed price, and buyer-requested quantity; never imply that the buyer selected
it. Do not infer or approximate shipment weight, package dimensions or length,
package count, cargo value or type, origin city or postal code, or destination
postal code. Keep every absent field unknown so the backend can infer it or ask
the buyer. Words such as `lightweight`, `sample`, or `telescopic` are not numeric
shipping facts and never justify guessed ranges.

After this Skill is read, keep assistant content empty between the remaining
Owner/tool calls. Render search slots, any allowed sourcing text, and the logistics
result only in the final response after every requested Owner has finished.

## Call the Backend

This Skill already defines the complete logistics protocol. Call it directly.
Never use `accio-mcp-cli keyword`, schema search, `apiName=help`, plugin or skill
listing, filesystem probes, source inspection, diary/memory lookup, or history
grep to discover, validate, or reconstruct the tool name or payload.

```bash
accio-mcp-cli call ali_logistics_util --json '{"apiName":"logistics_task_next","params":{"task_input":"<verbatim user request + known context>","lang":"zh|en"}}'
```

Use the command exactly as shown. The CLI stdout is a JSON string containing the
inner logistics response.

- On the first call for each buyer message, put the buyer's latest request and
  the complete relevant trusted current-conversation context in `task_input`.
  Build it with the mandatory Context Ledger below; never send only a terse
  paraphrase or the latest answer when earlier relevant facts are available.
- Derive `lang` from the buyer's latest natural-language message.
- Treat `data.next_call` as the authoritative instruction for every subsequent
  backend call in the current conversation:
  - For `{"mode":"pull","task_input_required":false}`, call the same API again
    with `params` containing only `lang`. Do not send `task_input`, even as an
    empty string, and do not repeat the original request.
  - For `{"mode":"new_task","task_input_required":true}`, stop calling for the
    current task. Only a later buyer message or `ask_user` answer starts a new
    call with that latest input and already-known context in `task_input`.
- While `data.status` (or `data.task`) is `running`, follow `data.next_call` and
  Pull again. Invoke the next call immediately unless `data.next_call` explicitly
  supplies a delay. Never add shell `sleep`, manual polling backoff, or a
  self-selected delay; backend continuation controls readiness. Emit no visible
  prose before or between these calls.
- Stop at `done`, `failed`, or `cancelled`. For `done`, read `data.result`; the
  backend manages conversation continuity through the implicit conversation.
- For a failed CLI call, `failed`, or `cancelled`, relay only the returned error
  in the buyer's language.

### Mandatory Context Ledger for `task_input`

Every call that includes `task_input` must be self-contained. Re-scan the active
current conversation and encode all logistics-relevant trusted context under
these labels, in this order:

```text
Latest buyer request (verbatim):
<exact latest buyer message>

Complete logistics objective:
<what the buyer wants the logistics workflow to deliver now>

Buyer-confirmed facts:
- Product and supplier: <IDs, URLs, titles, selected option, supplier, listed price/MOQ>
- Cargo and packages: <quantity/unit, weight, dimensions, package count, cargo value/type>
- Route and addresses: <origin/destination country, city, postal code, address>
- Delivery and trade preferences: <mode, service scope, incoterm, tax/duty preference, deadline, budget>
- Qualifications and prior answers: <business identity, EORI or other backend-requested answers>

Current-turn tool facts:
<selected relevant product/supplier fields and their tool provenance>

Conversation continuity:
<prior logistics questions, the buyer's answers, corrections, choices, and still-open requests>

Unknown or conflicting fields:
<explicitly list required or useful facts that remain unknown, plus unresolved conflicts>
```

Apply these rules while building the ledger:

- Copy the latest buyer message verbatim before any summary. Preserve exact IDs,
  URLs, names, addresses, numbers, units, currencies, modes, dates, incoterms, and
  tax or service preferences from the entire active conversation.
- Treat current-request structured context, facts directly supplied by the buyer
  earlier in this conversation, and relevant fields returned by current-turn
  business tools as trusted. Record the source of tool-derived or Agent-selected
  candidate facts; never present them as buyer-confirmed.
- Include every answer to a prior logistics question and every buyer correction.
  The newest explicit buyer correction replaces the older value; note the
  replacement when it matters. Preserve unresolved conflicts instead of choosing
  a value silently.
- On a new task after `ask_user`, send the full ledger again with the new answer
  merged into context. Do not reduce `task_input` to only the answer.
- Do not assume the backend remembers facts merely because they were sent in an
  earlier task. Each new-task call is independently understandable. Pull calls
  remain the exception and contain only `lang` as required by `next_call`.
- Context completeness is semantic, not a transcript dump. Do not paste whole
  renderer payloads, full search-result pools, raw tool output, diaries, memory,
  logs, source code, or unrelated conversation. Include the selected candidate
  and every fact that can affect logistics decisions; omit unrelated alternatives.
- Never infer a missing fact or hide it by omission. Put it under `Unknown or
  conflicting fields` so the backend can infer it explicitly or ask the buyer.

Before sending, verify that the ledger contains the verbatim latest request, all
known product/cargo/route/delivery facts, current-tool provenance, prior buyer
answers and corrections, and explicit unknowns. If any category is absent because
it is unknown, say `unknown`; do not delete the category.

## Preserve the Result

Treat `data.result` as immutable business output. Preserve its language, order,
headings, labels, paragraphs, table columns, every table row, provider names,
prices, transit times, modes, import-charge fields, buyer-provided information,
AI-assumed information, route or quote recommendation text, and disclaimer.
Explicit user-interaction text defined below is not part of the immutable body.

Do not summarize, paraphrase, translate, regroup, re-table, merge options, remove
fields, or add an introduction, conclusion, recommendation, assumption, or fact.
In particular, do not replace the backend table with a smaller table.

When combining this result with another Owner's output, place `data.result`
immediately after that output without a transition, label, or logistics-specific
introduction.

A terminal `done` result that reports no available quote, route, or price is a
complete logistics business result, not permission to improvise a fallback.
Never append inferred carrier availability, likely price ranges, destination
characterizations, supplier practices, or other general shipping advice. Never
replace a missing backend quote with search, web research, model knowledge, or a
suggestion to ask the supplier unless that exact fallback appears in
`data.result`.

Treat an explicitly headed `Next step`, `Next steps`, `Next actions`, `下一步`,
`下一步建议`, or `下一步操作` section and its action list as interaction text even
when a disclaimer or other non-action content follows it. Also recognize final
user-directed question, invitation, or action lines. If the boundary is unclear,
output the entire `data.result` unchanged. Remove a line only after that exact
interaction has been successfully represented by `ask_user` or `<follow>`; every
unconverted line stays verbatim in its original position.

## Required Information: `ask_user`

Use `ask_user` only when the backend explicitly says the logistics task cannot
continue, quote, or complete until the buyer provides, confirms, or selects
information. A completed quote followed by optional actions is not blocking.

- Use one `mode: "form"` call for 1–4 closed-choice questions. Each question has
  a standalone buyer-language `question`, a non-empty `header` of at most 12
  characters, and 2–4 options with non-empty `label` and `description`.
- Use one `mode: "fields"` call for 2–10 independent open-text inputs. Give every
  field a stable `id`, a concise buyer-language `label`, and a `placeholder` that
  starts with that exact label followed by ` — ` and an example or expected
  value. For example: `{"id":"ready_date","label":"Ready Date","placeholder":"Ready Date — e.g. 2026-08-20"}`.
- Use one `mode: "chat"` call for a single open input, mixed open/closed input, or
  any required-input set that cannot be mapped reliably to `form` or `fields`.
- Preserve every backend question and stated choice. Add no default,
  recommendation, eligibility claim, or extra option.
- Keep the immutable business context, remove only the question lines represented
  in the component, and invoke the component instead of printing its JSON.
- Emit no `<follow>` tags in the output that invokes or displays `ask_user`. After
  the buyer answers and execution resumes, reevaluate the later backend result;
  a completed result uses the optional-action rules below even within the same
  runtime turn.

## Optional Actions: `<follow>`

For a completed result, use the backend's explicit interaction text as the only
source of optional actions and convert the actions in their original order.

Each chip uses the exact lowercase syntax `<follow>buyer-voice action</follow>`.
Its payload is plain text only: no attributes, nested tags, `<`, `>`, `&`, Markdown
links, or placeholders. Emit the tag block only after all backend calls and
business content are complete; never emit it in interim output.

- Emit one final contiguous block containing 2–5 tags with no whitespace between
  tags.
- When an explicitly headed next-step section exists, it is authoritative: derive
  chips only from its actions. Do not derive additional chips from a later
  invitation or from the surrounding business result.
- Map each source action to exactly one chip. Do not split one action into multiple
  chips, merge distinct actions, or substitute a more specific or generic action.
- Keep each tag in the buyer's language and at most 20 words. Shorten only as
  needed for the tag limit; preserve the original action's meaning.
- Generate no action that is absent from the backend result.
- After every action in an authoritative next-step section is converted, remove
  that section's heading and converted lines from prose. Remove a later invitation
  only when it merely repeats those actions. Preserve disclaimers and every new or
  unconverted line verbatim in its original position.
- If more than five actions are present, keep every unconverted action line
  verbatim before the tag block.
- If fewer than two actions are present, keep them verbatim and emit no tag block.
- If the backend already supplies one valid 2–5-tag block, keep it once.

This logistics workflow owns its interaction output. Do not append generic actions
or emit both `ask_user` and `<follow>` in the same turn.
