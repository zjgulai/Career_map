---
name: "writing-plans"
title: "实施计划撰写"
description: "把已批准的规格拆成假设执行者零上下文的实施计划：逐个任务写明文件、接口、测试代码与提交步骤。触发词：实施计划撰写、writing-plans、把已批准的规格拆成假设执行者零上下文的实施计划：逐个任务写明文件、接口、测试代码与提交步骤。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 撰写实施计划

## 概述

撰写详尽的实施计划，假设执行工程师对我们的代码库毫无上下文、品味也成问题。把他们需要知道的一切都写下来：每个任务要碰哪些文件、代码、测试、可能需要查的文档、怎么测。把整份计划拆成一口一个的小任务交给他们。DRY。YAGNI。TDD。频繁提交。

假设他们是熟练的开发，但对我们的工具链和问题域几乎一无所知。假设他们不太懂什么是好的测试设计。

**开场时声明：** 「我正在使用 writing-plans 技能来创建实施计划。」

**上下文：** 如果在隔离的 worktree 中工作，该 worktree 应当是在执行时通过 `superpowers:using-git-worktrees` 技能创建的。

**计划保存到：** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`
- （用户对计划位置的偏好覆盖此默认值）

## 范围检查

如果规格覆盖多个相互独立的子系统，它本该在头脑风暴阶段就被拆成子项目规格。如果没有拆，建议把它拆成多份计划——每个子系统一份。每份计划本身都应当产出可运行、可测试的软件。

## 文件结构

在定义任务之前，先画出哪些文件会被创建或修改、每个文件负责什么。分解决策就是在这里被锁定的。

- 设计边界清晰、接口明确的单元。每个文件应当只有一个明确的职责。
- 你对自己能一次装进上下文里的代码推理得最好，文件聚焦时你的改动也更可靠。优先选择小而聚焦的文件，而不是什么都做的大文件。
- 一起变化的文件应当放在一起。按职责切分，不按技术分层切分。
- 在既有代码库里，遵循既有模式。如果代码库用的是大文件，不要单方面重构——但如果你正在修改的文件已经膨胀到难以驾驭，把一次拆分写进计划里是合理的。

这个结构决定了任务分解。每个任务都应当产出独立成立的自包含改动。

## 任务的合适粒度

任务是最小的单元：它自带测试循环，也值得让一位新的评审人把关。划分任务边界时：把环境搭建、配置、脚手架与文档步骤并入需要它们的那个交付物所属的任务；只在评审人有可能合理地拒绝其中一个任务、同时批准相邻任务的地方才切分。每个任务都以一个可独立验证的交付物收尾。

## 一口一个的任务粒度

**每一步是一个动作（2–5 分钟）：**
- 「写失败的测试」 - 一步
- 「运行它，确认它失败」 - 一步
- 「写最小实现让测试通过」 - 一步
- 「运行测试，确认它们通过」 - 一步
- 「提交」 - 一步

## 计划文档抬头

**每份计划都必须以这个抬头开始：**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Spec:** [path to the spec/design doc this plan implements — the plan
argues from the spec, so the spec travels with it; executors read both]

## Global Constraints

[The spec's project-wide requirements — version floors, dependency limits,
naming and copy rules, platform requirements — one line each, with exact
values copied verbatim from the spec. Every task's requirements implicitly
include this section.]

---
```

## 任务结构

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Interfaces:**
- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter
  and return types. A task's implementer sees only their own task; this
  block is how they learn the names and types neighboring tasks use.]

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## 不留占位符

每一步都必须包含工程师所需的真实内容。以下都是**计划缺陷**——永远不要写：

- 「TBD」、「TODO」、「稍后实现」、「补充细节」
- 「加上恰当的错误处理」/「加上校验」/「处理边界情况」
- 「为上述内容写测试」（却没有真实的测试代码）
- 「与任务 N 类似」（把代码重复一遍——工程师可能不按顺序阅读任务）
- 只说要做什么却不展示怎么做的步骤（代码步骤必须有代码块）
- 引用任何任务中都没有定义的类型、函数或方法

## 自查

写完整份计划后，用新鲜的眼光看规格，把计划与规格对照检查。这是你自己跑的清单——不是派给 subagent 做。

**1. 规格覆盖：** 浏览规格里的每一节/每一条需求。你能指出某个实现了它的任务吗？列出所有缺口。

**2. 占位符扫描：** 在你的计划里搜危险信号——上面「不留占位符」一节的任何模式。修掉它们。

**3. 类型一致性：** 你在后面的任务里用到的类型、方法签名与属性名，和你在前面任务里定义的一致吗？在任务 3 里叫 `clearLayers()`、在任务 7 里叫 `clearFullLayers()`，这就是一个 bug。

如果发现问题，就地修掉。不必重新自查一遍——修完继续即可。如果你发现某条规格需求没有任务，把任务补上。

## 执行交接

保存计划后，提供执行方式的选择：

**「计划已完成并保存到 `docs/superpowers/plans/<filename>.md`。两种执行方式：**

**1. Subagent 驱动（推荐）** - 我每个任务派一个全新的 subagent，任务之间做评审，迭代快

**2. 会话内执行** - 在本会话中用 executing-plans 执行任务，分批执行并设检查点

**选哪种？」**

**如果选了 Subagent 驱动：**
- **必需子技能：** 使用 superpowers:subagent-driven-development
- 每个任务一个全新 subagent + 两阶段评审

**如果选了会话内执行：**
- **必需子技能：** 使用 superpowers:executing-plans
- 分批执行并设检查点以供评审
