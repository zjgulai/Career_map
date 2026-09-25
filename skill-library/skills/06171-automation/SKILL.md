---
name: automation
description: Use when creating, reading, updating, deleting, running, cancelling, scheduling, condition-triggering, or inspecting Daimon Blueprint Automations and their run records.
---

# Automation

Automation owns executable work: trigger, input contract, execution, result contract, files, delivery, runs, assets, and workspace.

References, read by need: `references/execution-agent.md` (background and local_conversation agent modes), `references/trigger-condition.md` (condition trigger), `references/delivery-notification.md` (notification delivery), `references/files.md` (file input and output).

## Commercial Limits

- Only enabled regular Automations count. Cron jobs and widget tasks use separate limits.
- Disabled tasks are kept and use no slot. Disable one before enabling another when a limit is full.
- On downgrade, the newest tasks by `createdAt` stay enabled. Older tasks are disabled, not deleted.
- A running task finishes after downgrade; disabling blocks future automatic runs.
- If a quota reminder says not to retry, report the limit and ask the user which task to disable.

## Create Contract

`Automation.create` requires sibling top-level fields:

- `title`
- `description`: a concise, non-empty statement of purpose
- `trigger`
- `input`
- `execution`
- `result`

`delivery` is optional. Use it only for local notification delivery; omit it or pass `[]` when no notification is needed.

`input` is only the input contract:

- `{ kind: "none" }` — forbids `defaultInput`/`schema`
- `{ kind: "text", defaultInput? }` — `defaultInput` must be a string
- `{ kind: "json", schema, defaultInput? }` — `defaultInput` must be a JSON object

The schema enforces these per-kind types before the call runs; mismatches return `invalid_argument` with `error.path: "input.defaultInput"`.

Use `result.kind: "artifact"` for structured output and Widget delivery. The artifact must be a JSON object that matches `result.schema`.

Minimum Python artifact Automation:

```json
{
  "action": "create",
  "title": "Daily metric producer",
  "description": "Produces a daily metric artifact for downstream display.",
  "trigger": { "kind": "manual" },
  "input": {
    "kind": "json",
    "schema": { "type": "object", "properties": {}, "additionalProperties": false },
    "defaultInput": {}
  },
  "execution": {
    "kind": "code",
    "runtime": "python",
    "entryRef": { "kind": "path", "base": "automation", "path": "automation.py" }
  },
  "result": {
    "kind": "artifact",
    "schema": {
      "type": "object",
      "properties": { "summary": { "type": "string" } },
      "required": ["summary"],
      "additionalProperties": true
    }
  },
  "delivery": []
}
```

After create, write the Python program to the returned `codeEntry` path (present for code execution with a path `entryRef`). The returned `note` records the directory convention: `assets` and `workspace` are same-named subdirectories under the Automation root, and run output belongs to the sibling `workspace/`.

## Update Contract

Every `Automation.update` call must include a top-level, non-empty `description`. Rewrite it to
accurately describe the resulting Automation after the requested changes; never leave stale
purpose or behavior in the description. `description` is a sibling of `trigger`, `input`,
`execution`, `result`, and `delivery`, not a nested field.

## Choose A Trigger

> **Confirm High-Frequency Cron Schedules**
>
> When user requests for a high-frequency schedule, such as every 1 hour:
>
> 1. DO NOT directly create the automation.
> 2. Tell the user the estimated runs per day,
> 3. Warn the user about the potential costs.
> 4. Ask the user to explicitly confirm that frequency. If the user confirms, proceed with the automation creation.

- On demand: `{ "kind": "manual" }`
- Calendar schedule: `{ "kind": "schedule", "cron": "0 7 * * *", "timezone": "Asia/Shanghai" }`
- Fixed interval: `{ "kind": "interval", "every": "15m" }`
- One shot: `{ "kind": "once", "at": "2026-07-15T09:00:00+08:00" }`
- Poll a Python condition: use `kind: "condition"` with `every` and a Python condition entry. The condition is a predicate, not the business execution; the full contract lives in `references/trigger-condition.md`.

Author automatic Python Automations in this order:

1. Create disabled with a manual trigger when possible.
2. Write and verify the Python execution entry.
3. For a condition trigger, write the Python condition entry under `assetsRoot`.
4. Update the trigger to once, schedule, interval, or condition.
5. Read the Automation and confirm the stored trigger.
6. Enable it.

## Choose The Result Path

| Goal | Execution | Result | Contract |
|---|---|---|---|
| Deterministic transform or file-producing work | `code` (Python, below) | `artifact` | this file and `references/files.md` |
| Open-ended model work producing structured data | `agent` `background` | `artifact` | `references/execution-agent.md` |
| Open-ended work leaving a durable conversation | `agent` `local_conversation` | `conversation` | `references/execution-agent.md` |

Widget delivery belongs to the Binding, not `delivery`: create compatible `Widget.slots.main`, then connect it with `Binding.create`. Notification is an independent optional side effect. Use `delivery: [{ "kind": "notification", ... }]` only when a completion push is needed; the full contract lives in `references/delivery-notification.md`.

## Python Runtime

The managed runner imports your module and calls `run(ctx)`; top-level script code is not the entrypoint. Define `run` with `ctx` as the only required parameter and return JSON-serializable data:

```py
def run(ctx):
    return {"artifact": {"summary": "ready"}}
```

`ctx` carries `taskId`/`runId`/`taskDir`/`runDir`, `scheduledAt`/`triggeredAt`, the run `input`, `resources.contextFile` and materialized `resources.files`, plus `locale`, `timezone`, `runtimeRoot`, and `allowedRoots`.

Runtime environment variables:

- `DAIMON_BLUEPRINT_AUTOMATION_ID`
- `DAIMON_BLUEPRINT_AUTOMATION_RUN_ID`
- `DAIMON_BLUEPRINT_AUTOMATION_RUN_DIRECTORY`
- `DAIMON_BLUEPRINT_AUTOMATION_WORKSPACE_PATH`
- `DAIMON_BLUEPRINT_AUTOMATION_OUTPUT_FILE`
- `DAIMON_BLUEPRINT_AUTOMATION_RESOURCES_CONTEXT_FILE`

The return value must emit one wrapper JSON object: `{"artifact": ...}` with optional `"files"`. The object inside `artifact` must match `result.schema`. Do not return raw artifact fields as the wrapper.

For large or file-backed output, write the same wrapper JSON to `DAIMON_BLUEPRINT_AUTOMATION_OUTPUT_FILE`; when present it takes precedence over the return value. Generated-file descriptors and input `FileResourceRef` handling live in `references/files.md`.

## Run And Verify

Run with stored default input:

```json
{ "action": "run", "automationId": "automation_generated" }
```

Run with one-off input:

```json
{
  "action": "run",
  "automationId": "automation_generated",
  "runInput": { "topic": "AI infrastructure", "limit": 5 }
}
```

Verification:

- A run succeeds only when `Automation.run` or `Automation.readRun` reaches terminal `status: "succeeded"`.
- `failed`, `timeout`, `cancelled`, and `skipped` are terminal non-success states.
- A run that finishes with `status: "failed"` is still a completed call: `Automation.run` returns `ok: true` with `status: "failed"`, `exit`, and an `error.message` pointing at `readRunLogs` evidence.
- Check `deliveryResults` separately; execution can succeed while delivery fails.
- For artifacts, use the current succeeded artifact run from `Automation.listRuns`; `Automation.read` reports `latestRunStatus` for a quick health check.
- Use `readRunArtifact` to inspect the complete artifact and `readRunLogs` for failure evidence.
- For files, confirm expected `run.files` entries.
- For Widget delivery, require a succeeded delivery row and verify `Widget.latestData.main`, status, and `lastRun`.
- For local conversations, require `resultKind: "conversation"` and a real `conversationKey`.
- For notifications, require a `deliveryResults` row with `kind: "notification"` and `status: "succeeded"`.
- For an explicit cancellation, require terminal `status: "cancelled"`; no notification delivery row is expected.
- For schedule, interval, or condition triggers, confirm a real triggered run before reporting the automatic path as working.

If a run is still `running`, poll `readRun`; do not start another run. If `Automation.run` returns `ok: false` with `error.code: "already_running"`, `error.details` carries only `activeRunId` and `skippedRunId` (`retryable: false`); inspect the active run with `readRun` before retrying.

If an argument error returns `invalid_argument`, repair the field named by `error.path`. If domain validation returns `validation_failed`, repair the reported owning contract; do not retry unchanged input.

## Read Run Content

`Automation.list` and `Automation.listRuns` return paged results: `page` carries only `total` and `nextOffset`. Use `limit`, `offset`, and continue with the returned `page.nextOffset` until it disappears.

`Automation.readRun` returns the trimmed run: `availableContent` lists which of `input`/`artifact`/`transcript`/`logs` exist, and non-success terminal runs (`failed`, `timeout`, `cancelled`, `skipped`) carry `failure.message` with the last recorded log line. Read full content with `readRunInput`, `readRunLogs`, `readRunArtifact`, or `readRunTranscript`; each returns `content` with optional `content` text, `totalBytes`, and `nextByteOffset`. Use `byteOffset` and `maxBytes` for chunked reads and continue with `nextByteOffset`.

## Update, Disable, Cancel, And Delete

- Prefer disabling an enabled automatic Automation before changing its trigger, execution entry, input contract, or result schema. The tool enforces this only while a run is active; disabling first prevents scheduler races during multi-step edits.
- After `Automation.update`, inspect `revalidatedBindings`; repair invalid bindings before enabling or running.
- A running Automation does not re-enter. A concurrent trigger is skipped or returns `already_running`.
- Running update/delete returns `run_in_progress`. Cancel the active run and wait for a terminal state first.
- Cancellation does not deliver artifacts, Widget data, external results, or notifications, and does not overwrite the last successful Widget data.
- Before delete, decide whether bound Widgets should remain. `cascadeWidgetIds` deletes only explicitly selected eligible Widgets and their placements; otherwise Automation.delete removes the Automation and its Binding edges.
- Inspect the delete result's `deleted` counts for removed bindings, Widgets, and placements.
