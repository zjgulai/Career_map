---
name: loopx-pr-review
description: Run the LoopX PR-review packet first, then review selected PR groups with evidence.
argument-hint: "[--repo owner/repo] [--state open|merged|all] [--since ISO]"
---

<!-- loopx-managed-slash-command:v1 command=/loopx-pr-review surface=claude-skills -->

# LoopX /loopx-pr-review

Treat this as the LoopX `/loopx-pr-review` slash command.

Visible command arguments: `$ARGUMENTS`.
Use the installed `loopx-pr-review` skill when available.
Run `loopx --format json pr-review $ARGUMENTS` first and keep the full packet visible. Only non-null action rows carry review plans, templates, and evidence commands; null actions are readback-only. A fresh audit requires `--fresh-audit-exact-head NUMBER@HEAD_OID`.
Do not reconstruct the PR queue manually from ad hoc GitHub calls before reading the LoopX packet.
This command is read-only; do not comment, approve, merge, rerun CI, or spend quota unless separately authorized.

Keep public/private boundaries intact and do not perform external writes unless the active LoopX state or owner explicitly authorizes them.
