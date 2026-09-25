---
name: shell
description: "Bash/POSIX shell rules: quote variables, set -euo pipefail, no eval, check exit codes."
---

* Shared examples and formatting reference: [references/EXAMPLE.md](references/EXAMPLE.md).
* Keep new guidance, snippets, and edits aligned with that file.

---

# Scope

Use this rule when:

* editing `.sh` or `.bash` scripts
* composing command pipelines or subshells
* handling user input, paths, or exit codes in shell

Treat arguments, paths, and external commands as structured data — not raw text interpolation.

---

# Core Rules

* **Always quote variables**: `"$var"`, never bare `$var`.
* Use `$(...)` for command substitution; never backticks.
* Prefer `[[ ]]` over `[ ]` for conditionals in Bash.
* **Never use `eval`.** Prefer arrays for argument lists.
* Check exit codes explicitly: `|| { echo "failed"; exit 1; }` or rely on `set -e`.
* Use `set -euo pipefail` at the top of non-interactive scripts.
* Use `local` for all function-scoped variables.
* Do not rely on `cd` side effects; use subshells or `pushd`/`popd` when scope matters.

---

# Function Cohesion

**Strong rule:** do not split scripts, functions, or code blocks into overly fine-grained pieces. Keep
related statements together as one cohesive chunk unless extraction has a current, concrete reason.

Extract a function only when one of the following is true:

* real duplication exists across multiple call sites
* the current block is so large that a named extraction genuinely aids comprehension
* extraction isolates a real responsibility or pipeline boundary

Otherwise, keep the logic inline. A single well-named function with many readable lines is better than many tiny helpers connected only by call chains.

---

# Portability

* Bash-specific syntax (arrays, `[[ ]]`, `$((...))`) is acceptable in `.bash` or explicitly Bash scripts.
* For POSIX portability: restrict to `[ ]`, `$(...)`, and no arrays.
* Always declare the interpreter explicitly: `#!/usr/bin/env bash` or `#!/bin/sh`.

---

# Security

* Never interpolate unsanitized user input into command strings.
* Pass arguments as array elements, not concatenated strings.
* Avoid `chmod 777`; use the minimum required permissions.

---

# Formatting

* **Never use vertical alignment.** Do not pad spaces to align variable assignments or command arguments into columns.
* **Use Stroustrup clause layout** for `else`, `elif`-equivalents in `case`, and any block-closing keyword that pairs with a continuation — keep them on their own line. Never collapse `} else {` style same-line layouts in shell where applicable.
* **Always use multi-line block form for `if`/`then`/`fi`, `for`/`do`/`done`, and `while`/`do`/`done`.** Never write single-line collapsed forms like `if ...; then cmd; fi`.
* Prefer the Early Return (guard clause) pattern: validate and return/exit at the top, keep the main logic flat at the end. See `references/EXAMPLE.md` → Early Return.
* Compact, standard style — no unnecessary whitespace padding.

---

# Validation Focus

* unquoted variable expansions
* missing exit-code checks after critical commands
* word splitting or glob expansion on untrusted input
* subshell vs. current-shell scope confusion
