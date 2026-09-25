---
name: loop-global-summary
description: Read the compact global LoopX progress digest. Legacy alias for the canonical /loopx-global-* command.
argument-hint: "[optional focus]"
---

<!-- loopx-managed-slash-command:v1 command=/loop-global-summary surface=claude-skills -->

# LoopX /loop-global-summary

Treat this as the LoopX `/loop-global-summary` slash command.

Visible command arguments: `$ARGUMENTS`.
Run `loopx global-summary` first and summarize visible projects, gates, monitor status, and next safe actions.
This command is read-only unless the user explicitly asks for a state update.

Keep public/private boundaries intact and do not perform external writes unless the active LoopX state or owner explicitly authorizes them.
