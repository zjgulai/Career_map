---
name: loopx
description: Inspect LoopX state, or start concrete project work when arguments are provided.
argument-hint: "[--fine-grained] [--capability-route issue-fix] [task text]"
---

<!-- loopx-managed-slash-command:v1 command=/loopx surface=claude-skills -->

# LoopX /loopx

Treat this as the LoopX `/loopx` slash command.

Visible command arguments: `$ARGUMENTS`.
Identify the exact current host surface (codex-app, codex-app-ssh, codex-ide-plugin, codex-cli-tui, opencode, opencode2, traex-cli, pi, gemini-cli, cursor-agent, zcode, agy, kiro-cli, deepseek-harness, or ark-managed-agent).
If arguments are present and the current host already has a verified active LoopX Goal/Agent binding, preserve that exact identity when the request continues, corrects, or refines the registered objective. Do not call `start-goal` for an ordinary phase, issue, PR, or Todo inside that Goal; follow its exact current `interaction_contract` or quota command first, then record the request through the typed Todo/writeback path for the bound agent. Start another Goal only for a materially different objective or an explicit new-Goal request. Otherwise pass the complete visible command arguments unchanged as one value to `loopx start-goal --guided --project . --slash-command-arguments="<complete visible $ARGUMENTS>" --host-surface <exact-current-host>`. The CLI, not the model, owns parsing supported leading switches and preserving the remaining goal text. Never split or recompose the arguments, and never infer a route from issue/PR wording or URLs. If the host is unclear, omit the host flag once and follow the returned host-surface selection gate.
Treat the returned `ordered_steps` and `goal_start_contract` as authoritative. Follow their identity, capability-route, Todo, writeback, host-loop, quota, and stop/gate rules before substantive work; do not reconstruct those rules from skill memory.
If the packet exposes a goal-selection gate, rerun one exact choice before any mutation.
When authoring task Todos, treat `--action-kind` as the documented extensible public-safe [REDACTED] a short task-relevant value such as `implement`, `test`, or `review`; do not search the LoopX source for an allowlist.
Consume the turn-start quota JSON packet exactly once: read the complete output directly or save it and query it with `jq`; never pipe it through `head` or `tail`, and never rerun the turn-start call to recover hidden fields. A host whose runtime mints Turn identity uses `--begin-turn`; every other host passes its own `--turn-instance-id`. When selection is required, choose the Todo and use `interaction_contract.cli_channel.selection_command` with the returned Turn identity before mutation.
If arguments are empty and the host already identifies an active LoopX goal, follow its exact CLI `interaction_contract` or quota command first; otherwise inspect `loopx status` and `loopx bootstrap-command-pack --project .` before changing files.
If this session cannot mutate the host loop surface, surface the exact pasteable gate instead of claiming autonomous setup.

Keep public/private boundaries intact and do not perform external writes unless the active LoopX state or owner explicitly authorizes them.
