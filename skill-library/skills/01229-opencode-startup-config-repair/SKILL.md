---
name: opencode-startup-config-repair
description: Repair local opencode startup failures that look like 乱码, JSONC parse errors, or bad provider/model config. Use when opencode fails before the TUI and the likely source is ~/.config/opencode/opencode.json or its sync plugin.
argument-hint: "[symptom or command output]"
disable-model-invocation: true
user-invocable: false
allowed-tools:
  - Read
  - Grep
  - Bash
---

# opencode startup config repair

## When to use

- Use when the user reports `opencode` startup gibberish/乱码, `4 of 5 requests failed`, or JSONC parse errors such as `InvalidSymbol at line 1, column 1`.
- Use when `opencode --help` or `--version` works but the actual TUI still fails.
- Do not use for remote API outages or model-rate-limit failures unless the local config path is also implicated.

## Inputs / context to gather

1. Record the current binary path and version with `type opencode` and `opencode --version`.
2. Run `opencode debug paths` to confirm the real config/data/cache/state locations.
3. Run `opencode debug config --pure --print-logs --log-level DEBUG` to capture the deterministic parse error if present.
4. Inspect `~/.config/opencode/opencode.json` and `~/.config/opencode/plugins/opencode-lute.js` if the debug command points there.

## Procedure

1. Confirm the actual failing file.
   - Prefer `opencode debug config --pure --print-logs --log-level DEBUG`.
   - If the output includes `Config file at /Users/lute/.config/opencode/opencode.json is not valid JSON(C)`, treat `~/.config/opencode/opencode.json` as the source of truth.
2. Separate install problems from user-config corruption.
   - If needed, test with a clean XDG environment to see whether `opencode` starts there.
   - If clean-XDG works, focus on the current-user config and plugin write path.
3. Back up before edits.
   - Copy `~/.config/opencode/opencode.json` to a timestamped backup or quarantine name.
   - If changing the plugin, back up `~/.config/opencode/plugins/opencode-lute.js` too.
4. Repair the config file.
   - Rewrite `~/.config/opencode/opencode.json` as fresh UTF-8 JSON instead of patching suspicious bytes in place.
   - Revalidate with `opencode debug config --pure`.
5. Normalize provider/model values if needed.
   - In this environment, prefer `cliproxy/claude-opus-4.7` over stale `anthropic/...` prefixes.
6. Harden the sync path if the plugin writes the same file.
   - Update `syncLuteConfig`-style logic to parse existing/incoming JSON explicitly.
   - Normalize stale provider/model prefixes before writing.
   - Replace direct overwrite with temp-file plus atomic rename.
7. Verify the real startup path.
   - Check `zsh -ic 'type -a opencode'`.
   - Launch a short TTY session of `opencode` and confirm it reaches the main UI/status bar.
   - Clean up test processes afterward.

## Efficiency plan

- Start with `opencode debug config --pure --print-logs --log-level DEBUG`; it is the fastest route to the real failure.
- Avoid spending time on ANSI/TUI rendering theory until config corruption is ruled out.
- Reuse one backup/quarantine set per run instead of making many near-duplicate copies.
- Stop once `opencode debug config --pure` is clean and a short TTY launch shows the main UI with the expected provider/model.

## Pitfalls and fixes

- Symptom: `~/.opencode` or `config.json` looks suspicious.
  - Likely cause: wrong path.
  - Fix: trust `opencode debug paths`; inspect `~/.config/opencode/opencode.json`.
- Symptom: `node` or `file` says the JSON is valid but opencode still fails.
  - Likely cause: the app-specific parse path or stale rewrite path is still bad.
  - Fix: validate with `opencode debug config --pure` and repair the sync plugin too.
- Symptom: `opencode --version` works but the user still cannot use the app.
  - Likely cause: only the interactive startup path is broken.
  - Fix: run a real short TTY launch before declaring success.

## Verification checklist

- `opencode debug config --pure --print-logs --log-level DEBUG` no longer shows JSONC parse errors.
- `zsh -ic 'type -a opencode'` resolves to the expected wrapper path first.
- A short TTY launch reaches the main UI.
- The visible provider/model pair is correct for the environment, typically `claude-opus-4.7 / cliproxy`.
- No stray `opencode` test processes remain after cleanup.
