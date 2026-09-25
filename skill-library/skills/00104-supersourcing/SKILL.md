---
name: supersourcing
description: >
  Use before Owner Skills when the buyer delegates full-auto procurement or two or more
  connected procurement capabilities in one objective, selects auto-run after search,
  or resumes an active SuperSourcing plan.
enabled: true
---

# SuperSourcing

Compile a delegated sourcing objective into the smallest valid capability DAG, execute each node through its owning Skill, and finish with `review.md`. A generic full-auto request remains Requirements → Search → Compare → Verification.

## Entry Gate

Enter only when one condition holds:

1. The buyer explicitly requests full-auto sourcing/procurement.
2. The buyer delegates two or more connected procurement capabilities in one objective, sequenced or together; preserve each named downstream action as a distinct capability.
3. The buyer selects auto-run after ordinary search results.
4. A SuperSourcing state is active.

Single-capability requests stay with their Owner Skill. Message length and constraint count are not triggers. Product selection alone stays with `product-selection`; include `selection` only when the buyer also delegates post-choice work.
Apply this gate before any Owner Skill. A qualifying chain starts with SuperSourcing; never execute its first capability standalone.

## Dispatch

At the start of every qualifying or resumed SuperSourcing turn, read state once before routing:

```text
supersourcing-state read --kind ss
```

| Status | Action |
|---|---|
| absent / `uninitiated` | Apply the Entry Gate. |
| `selecting` | Resume the Selection Node. |
| `collecting` | `Skill action=read skill_id=supersourcing file=adapters/requirements.md` |
| `executing` | `Skill action=read skill_id=supersourcing file=execute-plan.md` |
| `waiting_user` | Validate the persisted checkpoint response, then resume through `Skill action=read skill_id=supersourcing file=execute-plan.md`. |
| `awaiting_review` | Finalize a missing Review first; otherwise continue through `Skill action=read skill_id=supersourcing file=execute-plan.md`. |
| `failed` | On an explicit retry or corrected input, run `render-supersourcing-artifact retry-node --node <failed-node-id>`, present the returned `planOverview` and `progress`, then follow its `nextAction`; protected writes require fresh confirmation. Otherwise report the failure without Owner work. |
| `complete` | Start only for a new qualifying objective; otherwise route the new action to its Owner Skill using completed artifacts as context. |
| `archived` / `declined` | Start only for a new qualifying objective. |

For a different product family, apply [new-intent-detection.md](new-intent-detection.md) before changing active state. Never list state directories or read state immediately after a successful CLI call.

## Credit Preflight

Before `supersourcing-state start`, call `accio-mcp-cli call queryAggregatedEntitlements` once for a qualifying new plan with `{"params":{"language":"<buyer language code>"}}` through the global CLI JSON transport without `--raw`. Read only the response's primary numeric `creditRemaining` (`data.creditRemaining` when the CLI retains its response envelope) and ignore every nested quota field:

- `<= 0`: show a localized insufficient-credit warning and stop before plan creation.
- `0 < creditRemaining < 22`: show one localized warning with the current balance and `21.16` recent average, then continue without waiting.
- `>= 22`: continue silently.
- Missing, invalid, or failed lookup: continue silently; never retry, infer another balance field, or persist credit data in state or artifacts.

Run this preflight only at Direct Entry, never on resume, extension, or individual nodes.

## Plan Compilation

At Direct Entry, run `supersourcing-state catalog` only when a named capability has no mapped ID below. Never read the full registry or add optional follow-on work.

- Before `start`, cover every buyer-requested business action and deliverable from the current objective: map each to one or more capabilities, or classify it only as a requirement on a mapped capability. `targetCapabilities` is the union of those mappings. Do not start with an unmapped outcome, collapse a later action into Search/Compare, or defer scope already present at entry to `extend`.
- Scope lock: put exactly the buyer-named business capabilities in `objectiveSpec.targetCapabilities`; the compiler adds prerequisites, so never add adjacent or default stages. The furthest named action is the upper bound; full-auto controls continuation, not scope. Review and pause are presentation boundaries, not capabilities.
- `objectiveSpec` contains `targetCapabilities`, `explicitCapabilities`, and `dependencyEdges`, plus `minimumResults` only for explicit counts. `requirements` accepts `productName`, `destinationCountry`, `quantity`, `packSize`, `tradablePreference`, `supplierTarget`, and `productAttributes`; encode every other buyer constraint as a `productAttributes` entry.
- Only a generic full-auto request that names no business capability uses the default `compare,verify`; a named workflow includes `verify` only when requested. Quantity and buying language are requirements, not order actions. Inquiry-first or quote-comparison preference sets `tradablePreference=no`; it does not request an inquiry draft or send. Add `inquiry_draft` only when the buyer asks to prepare one.
- `objectiveSpec.explicitCapabilities` contains only directly requested protected IDs: `inquiry_draft`, `inquiry_send`, `inquiry_extend`, `inquiry_requirement_update`, `negotiation_instruction`, `auto_chat_control`, `trade_precheck`, `order_preview`, `order_create`, `refund_submit`, or `payment_handoff`. Every listed ID must also be in `targetCapabilities`; send `[]` for all other targets and never copy the target list. Missing authorization fails plan creation.
- Built-in prerequisites already order `selection → requirements → search → compare → verify`; send `objectiveSpec.dependencyEdges: []` for that chain. Encode only an extra buyer-imposed dependency as `"<dependent>=<prerequisite>"`; target order alone creates no dependency.
- Known exact entities/artifacts: map each fulfilled prerequisite to recoverable references in top-level `satisfiedEvidence`, alongside `objectiveSpec`. A known product may use `"requirements":[]`; every other satisfied capability needs at least one `<kind>:<id>` reference. Never skip discovery based on inference.
- Undecided resale product plus post-choice work: include `selection`.
- When market research and product selection are requested as separate steps, include both `market_research,selection`; `selection` alone owns only its combined selection report.
- A self-use store, facility, production, or operational purchase plan: include `procurement_plan`; add later capabilities only when explicitly delegated.
- Comprehensive analysis of one identified Alibaba.com product: include `product_analysis`. When it follows product selection, use `selection,search,product_analysis`; omit Search only when the exact Alibaba.com product is already identified. Do not add separate logistics, profit, or verification nodes unless explicitly delegated.
- Route inquiry work by deliverable: draft content uses `inquiry_draft`, contact uses `inquiry_send`, negotiation uses `negotiation_instruction`, reply status uses `inquiry_progress`, and ranking two or more returned quotes uses `inquiry_compare`. Use `inquiry_extend` only to add suppliers to an existing inquiry. `compare` ranks pre-contact candidates; freight, duties, DDP, and landed cost use `logistics`.
- Preserve explicit result counts in `objectiveSpec.minimumResults`: discovery maps to `search`, pre-contact ranking to `compare`, supplier checks to `verify`, inquiry targets to `inquiry_send`, seller replies to `inquiry_progress`, and quote ranking to `inquiry_compare`. Registry dependencies propagate counts to prerequisite rosters. Carry a count forward only when the buyer says each/all; keep distinct counts separate. Omit the field when no minimum is explicit.
- Existing same-objective plan extension: pass only the complete expanded `objectiveSpec` and optional `satisfiedEvidence` to `supersourcing-state extend`; patch new requirements separately before extension. Existing targets and authorizations cannot be removed. It rejects replacing planned nodes with satisfied evidence or adding unmet dependencies to started nodes; never retry that rejection or restart completed nodes. After creating returned tasks, bind them once with `supersourcing-state bind-tasks --json '{"<nodeId>":"<taskId>"}'`.
- The plan returned by `start` is authoritative. Create and bind its `taskPlan`; never retry a rejected ObjectiveSpec unchanged.

Start once with a lower-case ASCII slug matching `[a-z0-9]+(?:[-_][a-z0-9]+)*`; spaces are invalid:

```text
supersourcing-state start --task "dress" --json-file - <<'SUPERSOURCING_JSON'
{"buyerLanguage":"zh","objectiveSpec":{"targetCapabilities":["compare","verify","inquiry_draft"],"explicitCapabilities":["inquiry_draft"],"dependencyEdges":[]},"requirements":{"productName":"dress","destinationCountry":"US","quantity":100,"productAttributes":[]},"productFamily":"apparel"}
SUPERSOURCING_JSON
```

Preserve explicit destination, purchase quantity, fulfillment constraints, and procurement preference in `requirements`. A count attached to a pack, set, bundle, or case is `packSize`, not purchase `quantity`; omit either value unless the buyer states it. Store an explicit supplier count only as `supplierTarget` (maximum 10), never as `quantity`. Set `tradablePreference` only for an explicit direct-order (`yes`) or inquiry/custom-contact (`no`) choice.

An immediately preceding matching `rc-searched` result may add `--from-rc` to the same `start` command. Send only `buyerLanguage` and `objectiveSpec`; do not resend its requirements or candidates.

Start before creating tasks or running an Owner Skill. Emit `planOverview` once, create `taskPlan` tasks, and initialize immediately with the exact node/task mapping. Follow the returned node through Selection Node or `execute-plan.md`; unfinished Requirements are already `in_progress` and retain the task mapping across buyer turns. Never derive nodes, reread state to rediscover them, or substitute a standalone Owner workflow.
If `catalog` or `start` fails, stop and report that failure; never emulate the plan, tasks, or Owner chain manually.

## Native Tasks

Treat `start.taskPlan` as immutable: call native `task_create` once per entry using its `taskCreate` object unchanged, in one parallel batch. Create no extra, omitted, split, or combined task; Requirements and Review are not tasks. Initialize once with the complete returned node/task mapping:

```text
render-supersourcing-artifact init --task-ids-json '{"search-1":"<taskId>","compare-1":"<taskId>"}'
```

For every `next` value, call `init` immediately after task creation. It binds tasks, writes `requirements.md` and `progress.md`, starts unfinished Requirements without completing them, and automatically starts ready `auto + read` nodes. Use `supersourcing-state bind-tasks` only for nodes added later by `extend`. If Bootstrap fails, repair only Bootstrap before Owner work.

Native status is `pending` → `in_progress` → `completed`. Keep a retryable failed node's task `in_progress` and downstream tasks `pending`; archive only work the buyer abandons, skips, or supersedes. Update a task immediately before and after its node. Task tools are native tools, never shell commands or parts of CLI chains.

## Selection Node

When `next=select`:

1. Initialize with the node/task mapping if `progress.md` is absent. Mark the Selection task `in_progress`, then transition the Selection node to `in_progress`.
2. Use `Skill action=read skill_id=supersourcing file=adapters/selection.md`, then execute its `product-selection` Owner route until completion or a choice checkpoint.
3. At a choice checkpoint, keep Selection uncommitted: transition it to `waiting_user` with a `choice` checkpoint bound to the `report.html` preview, then ask once using the returned directions.
4. After the buyer chooses, resume the same node and finish the Owner's selected-direction analysis using retained evidence. If the buyer delegated the choice, the Owner completes this automatically. Patch the resulting chosen product and commit the complete report with `render-supersourcing-artifact commit-node --node <selection-node-id> --artifact report.html --summary "<concise result>"`; then complete its task.
5. Transition the returned Requirements node to `in_progress`, read `Skill action=read skill_id=supersourcing file=adapters/requirements.md`, collect and patch once, then run `render-supersourcing-artifact requirements`. This commits Requirements and returns any auto-started Search node; do not start Search before the choice.

## Interaction Boundaries

The registry policy is binding:

| Policy | Rule |
|---|---|
| `auto` | Execute when dependencies are complete. |
| `ask_if_missing` | Ask only for a blocking input or business choice. |
| `confirm_after_preview` | Persist a versioned checkpoint, then show the current named objects and preview and wait. |
| `explicit_current_turn` | Execute only when the current user message explicitly requests the write/control action. |
| `user_action` | Provide the trusted action entry; the buyer performs the final action. |

Plan-level “full auto” never authorizes inquiry sending, order creation, refund submission, or payment. A changed preview invalidates prior confirmation. `supersourcing-state transition` mechanically enforces preview confirmation for `confirm_after_preview` nodes.

## JSON Transport

Use inline JSON only for short fixed payloads on macOS/Linux, encoding apostrophes as `\u0027`. For model-generated SuperSourcing state or stage payloads on macOS/Linux, pass one literal quoted heredoc to `supersourcing-state ... --json-file -` or `render-supersourcing-artifact ... --result-json-file -`; only these two CLIs accept stdin. Never place that JSON in a shell quote, variable, `printf`, or `echo`. External tools that require variable JSON use one system-temp UTF-8 file created and consumed in the same shell call; never remove it after the CLI consumes it. Never create parameter files with `Write` or inside the workspace. Windows PowerShell always uses a system-temp UTF-8 file and the matching file argument; PowerShell syntax is invalid on macOS/Linux. Visible text and artifacts use decoded characters.

## Contracts

- State is orchestration memory: ObjectiveSpec, compact requirements, nodes, task IDs, checkpoint, compact entity references, artifact references, and short result summaries only.
- Owner Skills retain business logic, tool parameters, validation, retries, and domain artifacts. All orchestration adapters live under `skills/supersourcing/adapters/`; Owner Skills do not maintain SuperSourcing-specific adapter files.
- SuperSourcing owns `requirements.md`, `progress.md`, and terminal `review.md`.
- Existing core artifacts remain `report.html`, `sourcing.md`, `compare.html`, and `supplier-verification.html`; other filenames come from Owner contracts.
- Produce every Owner artifact once. Do not store report bodies, raw responses, full cards, or duplicated tables in state.
- Load only the active node's Adapter and necessary Owner Skill. Only independent `read` + `auto` nodes may run in parallel; writes, interactions, task updates, and dependent nodes remain ordered.
- Non-terminal nodes stay silent except at user checkpoints and do not emit follow-up chips. The final visible response follows [review-schema.md](review-schema.md).
- Run registered CLI commands directly. Never search for them as MCP tools, wrap them in `accio-mcp-cli`, edit hidden state natively, or use ad-hoc scripts.
- Run `render-supersourcing-artifact <subcommand>` exactly as documented; it resolves the active state and accepts no `--plan-dir`, while session/agent overrides are never needed in normal execution.
