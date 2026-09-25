---
name: loop-global-gates
description: List open LoopX user/controller gates and what each blocks. Legacy alias for the canonical /loopx-global-* command.
argument-hint: "[optional focus]"
---

<!-- loopx-managed-slash-command:v1 command=/loop-global-gates surface=codex-skills -->

# LoopX /loop-global-gates

Treat this as the LoopX `/loop-global-gates` explicit LoopX command skill.

On native Windows, run the installed PowerShell 7 entry as `loopx` from PowerShell; from another executor use `pwsh.exe -NoLogo -NoProfile -File "$HOME/.local/bin/loopx.ps1" <arguments>`.
Visible command arguments: `$ARGUMENTS`.
Run `loopx global-gates` first and summarize formal open gates, blocked todo or goal scope, owner routing, and exact next questions.
This command is read-only unless the user explicitly asks for a state update.

Keep public/private boundaries intact and do not perform external writes unless the active LoopX state or owner explicitly authorizes them.
