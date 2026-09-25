---
name: loop-global-todos
description: List runnable, blocked, deferred-ready, and review LoopX todos across visible projects. Legacy alias for the canonical /loopx-global-* command.
argument-hint: "[optional focus]"
---

<!-- loopx-managed-slash-command:v1 command=/loop-global-todos surface=codex-skills -->

# LoopX /loop-global-todos

Treat this as the LoopX `/loop-global-todos` explicit LoopX command skill.

On native Windows, run the installed PowerShell 7 entry as `loopx` from PowerShell; from another executor use `pwsh.exe -NoLogo -NoProfile -File "$HOME/.local/bin/loopx.ps1" <arguments>`.
Visible command arguments: `$ARGUMENTS`.
Run `loopx global-todos` first and summarize prioritized ownership and structured readiness across visible projects without mutating state.
This command is read-only unless the user explicitly asks for a state update.

Keep public/private boundaries intact and do not perform external writes unless the active LoopX state or owner explicitly authorizes them.
