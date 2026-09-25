---
name: loop-global-risks
description: Show stale LoopX runs, boundary risks, failing checks, and rollback candidates. Legacy alias for the canonical /loopx-global-* command.
argument-hint: "[optional focus]"
---

<!-- loopx-managed-slash-command:v1 command=/loop-global-risks surface=codex-skills -->

# LoopX /loop-global-risks

Treat this as the LoopX `/loop-global-risks` explicit LoopX command skill.

On native Windows, run the installed PowerShell 7 entry as `loopx` from PowerShell; from another executor use `pwsh.exe -NoLogo -NoProfile -File "$HOME/.local/bin/loopx.ps1" <arguments>`.
Visible command arguments: `$ARGUMENTS`.
Run `loopx global-risks` first and summarize structured stale runs, boundary warnings, failing checks, and whether a formally evidenced rollback candidate source is available, without mutating state.
This command is read-only unless the user explicitly asks for a state update.

Keep public/private boundaries intact and do not perform external writes unless the active LoopX state or owner explicitly authorizes them.
