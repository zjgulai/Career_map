---
name: content-to-skill
description: Converts arbitrary source material into an executable structured Codex skill package. Use when the user provides text, notes, documents, PDFs, transcripts, videos, courses, articles, repositories, workflows, chat logs, or rough ideas and asks to turn them into a Skill, SKILL.md, skill scaffold, reusable agent workflow, operational prompt, or structured capability. Also use for 把内容变成skill, 文档转skill, 视频转skill, 课程转skill, 工作流沉淀成skill, or 从资料生成可执行Skill.
---

# Content To Skill

Content To Skill turns messy source material into a runnable skill package. It extracts repeatable mechanisms from content, rejects unsupported claims, and produces a `SKILL.md` plus any references, examples, scripts, and validation prompts needed for another agent to execute the method later.

Default to Chinese unless the user asks for another language. Prefer creating or patching files when a writable target path is available.

## Resource Guide

- Read `references/source-intake.md` before processing documents, transcripts, videos, multiple files, or unclear source boundaries.
- Read `references/skill-construction-protocol.md` before writing a `SKILL.md`, scaffold, references, examples, or validation plan.
- Read `references/evaluation-rubric.md` when reviewing a generated skill, deciding whether it is publishable, or repairing a weak conversion.
- Run `scripts/check_skill_package.py /path/to/generated-skill` after creating or materially editing a local skill package.
- Read `examples/retest-prompts.md` when you need realistic forward tests for a newly generated skill.

## First Principle

A source is not the skill. A skill is the compressed control system that lets a future agent repeat the useful behavior without rereading the whole source.

Every conversion must preserve this chain:

```txt
source evidence -> reusable mechanism -> executable workflow -> output contract -> validation signal
```

## Core Workflow

### 1. Route The Request

模式选择: choose the smallest mode that preserves the source evidence and produces an executable artifact.

Choose the smallest mode that fits:

| Trigger | Mode | Required action |
|---|---|---|
| User pastes short text or a clear method | QUICK_CONVERT | Extract mechanisms and produce a first-pass `SKILL.md` or patch. |
| User provides documents, folders, transcripts, video, or many sources | SOURCE_AUDIT | Build a source inventory, evidence boundary, mechanism cards, then generate. |
| User asks for files, scaffold, installable skill, or gives a path | PACKAGE_BUILD | Create files first, then validate. |
| User provides an existing generated skill and says it failed | REPAIR_FROM_FEEDBACK | Compare source intent, generated behavior, and failure signal before patching. |
| Source cannot be accessed | BLOCKED_SOURCE | Ask for the missing file, transcript, text, or accessible path; do not invent source content. |

If multiple modes match, prefer the one with stronger evidence requirements: REPAIR_FROM_FEEDBACK, PACKAGE_BUILD, SOURCE_AUDIT, QUICK_CONVERT.

### 1.5. CHECKPOINT / STOP Gates

Emit `CHECKPOINT / STOP` and wait before:

- overwriting an existing skill folder with unrelated local edits
- publishing or pushing a generated skill to a public repository
- processing private, paid, sensitive, or inaccessible source material
- expanding one source into a router, skill family, or SkillBank
- claiming `full_test` quality without actually running an independent or fresh-context test

The checkpoint must name the target path or repository, files affected, validation command, rollback point, and exact approval needed.

### 2. Establish Evidence Boundary

Identify what was actually read and what remains unavailable.

Capture:

- source type: text, document, PDF, spreadsheet, slide deck, audio, video, repository, web page, notes, or mixed
- accessible artifacts: pasted text, local paths, transcripts, extracted text, screenshots, metadata, or summaries
- unavailable artifacts: video without transcript, unreadable binary files, private links, missing attachments, or unsupported formats
- user goal: new skill, skill family, prompt workflow, repair, or evaluation
- target runtime: Codex skill folder, single `SKILL.md`, repository scaffold, or patch plan

For video or audio, first obtain a transcript, chapter notes, subtitles, or user-provided summary using available tools. If none is available, ask for the transcript or permission to extract it. Never infer detailed methods from a title alone.

### 3. Extract Mechanism Cards

Do not summarize the source paragraph by paragraph. Extract portable controls:

```md
## Mechanism Card
Name:
Source evidence:
Trigger:
User job:
Decision rule:
Procedure:
Output:
Quality signal:
Failure mode:
Skill location:
Keep / merge / discard:
```

Keep only mechanisms that change future agent behavior. Discard anecdotes, slogans, duplicate examples, and unsupported claims unless they become examples, boundaries, or tests.

### 4. Choose Skill Shape

Select one production shape before writing files:

- Single procedural skill: one bounded repeated task.
- Engineering workflow pack: coding, debugging, architecture, tests, issues, or PR workflows.
- Methodology toolbox: router plus focused diagnostic skills.
- Cognitive distillation skill: a person, worldview, creator, company, or field turned into a perspective lens.
- Skill family or SkillBank: many independent skills with routing, acquisition, versioning, or state.

Default to a single procedural skill unless the source clearly requires routing, shared state, multiple domains, or independent subskills.

### 5. Generate The Skill Package

When a writable path is available and the user asks to create or convert, create files before the final answer.

Minimum package:

```txt
skill-name/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── examples/
    └── retest-prompts.md
```

Add `references/` when the source has detailed protocols, rubrics, evidence notes, examples, or domain facts that should not bloat `SKILL.md`.

Add `scripts/` only when repeated mechanical checks, extraction, conversion, or validation should be deterministic.

For public GitHub repositories, add only the human-facing files needed for reuse:

```txt
README.md
LICENSE
.gitignore
test-prompts.json
```

Keep the skill package itself portable: `SKILL.md`, `agents/`, `references/`, `examples/`, and `scripts/` must still work if copied into any skills-compatible runtime.

Generated `SKILL.md` must include:

- frontmatter with only `name` and `description`
- overview and first principle
- resource guide with direct links to references and scripts
- routing or operating modes
- stable workflow that produces decisions or artifacts
- output protocols
- boundaries and anti-patterns
- quality standard and validation loop

### 6. Validate

For local packages:

1. Run the repository or generated package validator when available.
2. Run `scripts/check_skill_package.py /path/to/generated-skill`.
3. Read validator failures, patch once, and rerun.
4. If validation still fails, report the failing command, likely cause, and rollback point.

For non-local outputs, use the checklist in `references/evaluation-rubric.md` and label the result as dry-run.

### 6.5. Failure Branches

| Trigger | Required action | Do not do |
|---|---|---|
| Source cannot be read | Ask for accessible source, transcript, or a local path | Do not invent source mechanisms |
| Target folder already exists | Inspect files and patch only intended paths | Do not overwrite unrelated files |
| Existing skill fails validation | Patch one minimal structural issue and rerun | Do not add broad new sections to chase score |
| Public repo requested | Validate locally, create README/LICENSE, then ask or use explicit approval before publishing | Do not push unvalidated files |
| User asks for a skill family | Create a mechanism map and stop at CHECKPOINT / STOP | Do not explode one source into many skills by default |
| Test tooling is unavailable | Mark result `dry-run` and provide retest prompts | Do not call it `full_test` |

### 7. Report

Final reports should include:

```md
## Skill Created
Source boundary:
Generated path:
Skill shape:
Files changed:
Validation:
Rollback point:
Next retest:
```

Keep design explanation short unless the user explicitly asks for the full extraction notes.

## Output Protocols

### Source-To-Skill Brief

```md
## Source-To-Skill Brief
Source boundary:
Root job:
Target user:
Mechanisms kept:
Mechanisms discarded:
Skill shape:
Package plan:
Validation plan:
Open uncertainty:
```

### Mechanism Extraction Report

```md
## Mechanism Extraction
Evidence read:
High-signal mechanisms:
Conflicts or weak evidence:
Candidate skill modules:
Discarded material:
Recommended package:
```

### Generated Package Report

```md
## Skill Created
Path:
Name:
Description trigger:
Source boundary:
Files created or changed:
Validation commands:
Validation result:
Retest prompt:
Rollback point:
```

## Boundaries

- Do not claim to have read inaccessible documents, videos, private links, or repositories.
- Do not turn every idea in the source into a rule. Prefer fewer mechanisms that can be executed.
- Do not copy large passages from source material into the skill. Extract controls, examples, and evidence notes.
- Do not create a skill family when one procedural skill will work.
- Do not create scripts for tasks that are better handled by clear instructions.
- Do not add README, install guides, or public docs unless the user asks for a public repository.
- Do not overwrite user files outside the target skill folder without explicit approval.
- Do not claim benchmark quality without validation or forward tests.

## Anti-Patterns

- Summary-as-skill: the output explains the source but cannot guide future behavior.
- Template flood: the skill has many sections but no decision rules.
- Evidence laundering: weak or unavailable source material becomes confident instruction.
- Skill bloat: every chapter becomes a subskill.
- Tool fantasy: the skill assumes unavailable transcription, parsing, browser, or API tools.
- No retest: the conversion is never checked against a realistic future request.

## Quality Standard

A successful conversion:

- names the source boundary honestly
- extracts mechanisms, not just themes
- has a clear trigger description
- can run without the original source in context
- has stable workflow steps and output contracts
- stores detailed evidence in references, not the main prompt
- names failure branches and stop conditions
- includes retest prompts or fixtures
- passes structural validation when files exist locally
- stops at CHECKPOINT / STOP before public publishing, broad generation, or sensitive source processing

Default score:

```md
Root job clarity: 0-20
Mechanism extraction: 0-20
Executable workflow: 0-20
Output usability: 0-15
Evidence honesty: 0-10
Validation loop: 0-10
Concise expression: 0-5
Total: 100
```

Below 70: do not publish. 70-84: usable MVP. 85-94: publishable. 95+: benchmark-quality after independent or forward-test evidence.
