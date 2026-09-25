---
name: "loopx"
description: "Use the authoritative LoopX CLI for the current DSH task or continuation."
argument-hint: "[task text]"
---

<!-- loopx-managed-slash-command:v1 command=loopx surface=dsh-skills -->

# LoopX CLI Workflow

Treat this as the LoopX `loopx` DSH workflow skill.

This entry skill is installed for the exact current host `deepseek-harness-native`; do not infer or substitute another host surface.
Treat the complete original visible user task as `goalText`. It is the task wording, not a command token, routing envelope, or confirmation field. DSH does not substitute a `$ARGUMENTS` placeholder.
Use DSH's shell tool to invoke the authoritative LoopX CLI. Never call plugin-provided LoopX model tools and never edit a LoopX registry directly.
Require the exact non-empty `$DSH_SESSION_ID` supplied by DSH. Never synthesize, normalize, or reuse a Session id from prose.
For a concrete task, preserve the complete task wording as one argv value. Encode it as one POSIX single-quoted shell word, replacing each embedded single quote with the exact sequence `'"'"'`, so no task text becomes shell syntax. Then run `python3 /Users/lute/.agents/runtime/dsh-loopx-plugin/loopx_cli.py start-goal --guided --project . --goal-text='<shell-escaped complete original visible user task>' --host-surface deepseek-harness-native --thread-id "$DSH_SESSION_ID"`. Do not summarize, classify, or rewrite the task before this call.
For a status/continuation request with no new task, first run `python3 /Users/lute/.agents/runtime/dsh-loopx-plugin/loopx_cli.py --registry .loopx/registry.json --format json resolve-agent-thread --host-surface deepseek-harness-native --thread-id "$DSH_SESSION_ID"`; do not create a new Goal from an empty or inspection-only request.
Treat returned `ordered_steps`, `goal_start_contract`, selection gates, identity commands, Todo commands, quota decisions, and writeback commands as authoritative. Execute only exact typed CLI commands, including the returned thread-binding step, and never guess or fuzzy-match a Goal or Agent id.
Use the installed `loopx-project` Skill for advanced LoopX lifecycle operations. If no safe typed operation follows from the CLI packet, ask the user before mutating authority.

Keep public/private boundaries intact and do not perform external writes unless the active LoopX state or owner explicitly authorizes them.
