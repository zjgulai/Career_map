---
name: "git-workflow-and-versioning"
title: "Git 分支与版本"
description: "分支模型与版本策略：主干开发、分支命名、原子提交与 worktree，以及语义化版本、tag 与 changelog。触发词：Git 分支与版本、git-workflow-and-versioning、分支模型与版本策略：主干开发、分支命名、原子提交与 worktree，以及语义化版本、tag 与 changelog。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# Git 工作流与版本策略

## 概述

Git 是你的安全网。把提交当作存档点，把分支当作沙箱，把历史当作文档。当 AI agent 高速产出代码时，有纪律的版本控制正是让改动始终可管理、可评审、可回退的那套机制。

## 何时使用

始终。每一次代码改动都要流过 git。

## 核心原则

### 主干开发（推荐）

让 `main` 始终可部署。工作在短期特性分支上进行，1-3 天内合回主干。长期存在的开发分支是隐藏成本 —— 它们会不断发散、制造合并冲突、拖慢集成。DORA 的研究反复表明，主干开发与高绩效工程团队之间存在相关性。

```
main ──●──●──●──●──●──●──●──●──●──  (始终可部署)
        ╲      ╱  ╲    ╱
         ●──●─╱    ●──╱    ← 短期特性分支（1-3 天）
```

这是推荐的默认做法。采用 gitflow 或长期分支的团队可以把自己的分支模型与这些原则对接（原子提交、小改动、描述清楚的提交信息）—— 提交纪律比具体选哪种分支策略更重要。

- **开发分支是成本。** 分支每多活一天，就多累积一分合并风险。
- **发布分支是可以接受的。** 当你需要在 main 继续前进的同时稳定一次发布时。
- **特性开关 > 长分支。** 宁可把未完成的工作挂在开关后面发布，也不要让它在一个分支上躺好几周。

### 1. 尽早提交，频繁提交

每一个成功的增量都拿到属于自己的提交。不要攒着大批未提交的改动。

```
Work pattern:
  Implement slice → Test → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

提交就是存档点。如果下一个改动弄坏了东西，你可以瞬间回到最近一个已知良好的状态。

### 2. 原子提交

每个提交只做一件逻辑上的事：

```
# Good: Each commit is self-contained
git log --oneline
a1b2c3d Add task creation endpoint with validation
d4e5f6g Add task creation form component
h7i8j9k Connect form to API and add loading state
m1n2o3p Add task creation tests (unit + integration)

# Bad: Everything mixed together
git log --oneline
x1y2z3a Add task feature, fix sidebar, update deps, refactor utils
```

### 3. 描述性的提交信息

提交信息要解释*为什么*，而不只是*做了什么*：

```
# Good: Explains intent
feat: add email validation to registration endpoint

Prevents invalid email formats from reaching the database.
Uses Zod schema validation at the route handler level,
consistent with existing validation patterns in auth.ts.

# Bad: Describes what's obvious from the diff
update auth.ts
```

**格式：**
```
<type>: <short description>

<optional body explaining why, not what>
```

**类型：**
- `feat` —— 新功能
- `fix` —— Bug 修复
- `refactor` —— 既不修 bug 也不加功能的代码改动
- `test` —— 新增或更新测试
- `docs` —— 仅文档
- `chore` —— 工具链、依赖、配置

### 4. 保持关注点分离

不要把格式化改动与行为改动混在一起。不要把重构与功能混在一起。每一类改动都应当是一个独立提交 —— 理想情况下还是一个独立 PR：

```
# Good: Separate concerns
git commit -m "refactor: extract validation logic to shared utility"
git commit -m "feat: add phone number validation to registration"

# Bad: Mixed concerns
git commit -m "refactor validation and add phone number field"
```

**把重构与功能开发分开。** 重构改动与功能改动是两件不同的事 —— 分开提交。这样每一处改动都更容易评审、更容易回退，在历史里也更容易理解。小的清理（比如重命名一个变量）可以放在功能提交里，由评审人自行斟酌。

### 5. 控制改动规模

每次提交/PR 的目标是约 100 行。超过约 1000 行的改动应当拆分。拆分策略见 `code-review-and-quality`。

```
~100 lines  → Easy to review, easy to revert
~300 lines  → Acceptable for a single logical change
~1000 lines → Split into smaller changes
```

## 分支策略

### 特性分支

```
main（始终可部署）
  │
  ├── feature/task-creation    ← 一个分支一个功能
  ├── feature/user-settings    ← 并行工作
  └── fix/duplicate-tasks      ← Bug 修复
```

- 从 `main`（或团队约定的默认分支）切出
- 保持分支短期存活（1-3 天内合回）—— 长期分支是隐藏成本
- 合并之后删除分支
- 未完成的功能优先用特性开关，而不是长期分支

### 分支命名

```
feature/<short-description>   → feature/task-creation
fix/<short-description>       → fix/duplicate-tasks
chore/<short-description>     → chore/update-deps
refactor/<short-description>  → refactor/auth-module
```

## 使用 Worktree

并行跑多个 AI agent 时，用 git worktree 让多条分支同时进行：

```bash
# Create a worktree for a feature branch
git worktree add ../project-feature-a feature/task-creation
git worktree add ../project-feature-b feature/user-settings

# Each worktree is a separate directory with its own branch
# Agents can work in parallel without interfering
ls ../
  project/              ← main branch
  project-feature-a/    ← task-creation branch
  project-feature-b/    ← user-settings branch

# When done, merge and clean up
git worktree remove ../project-feature-a
```

好处：
- 多个 agent 可以同时处理不同功能
- 不需要切换分支（每个目录有自己的分支）
- 某个实验失败了，删掉 worktree 就行 —— 什么都不会丢
- 在显式合并之前，改动始终是隔离的

## 存档点模式

```
Agent 开始工作
    │
    ├── 做一次改动
    │   ├── 测试通过？ → 提交 → 继续
    │   └── 测试失败？ → 回到上一次提交 → 排查
    │
    ├── 再做一次改动
    │   ├── 测试通过？ → 提交 → 继续
    │   └── 测试失败？ → 回到上一次提交 → 排查
    │
    └── 功能完成 → 所有提交串成一段干净的历史
```

这个模式意味着你损失的工作永远不会超过一个增量。如果某个 agent 跑偏了，`git reset --hard HEAD` 就能把你带回最近一次成功状态。

## 变更摘要

任何修改之后，都给出一份结构化摘要。它让评审更省力、把范围纪律落在纸面上，也能暴露出计划外的改动：

```
CHANGES MADE:
- src/routes/tasks.ts: Added validation middleware to POST endpoint
- src/lib/validation.ts: Added TaskCreateSchema using Zod

THINGS I DIDN'T TOUCH (intentionally):
- src/routes/auth.ts: Has similar validation gap but out of scope
- src/middleware/error.ts: Error format could be improved (separate task)

POTENTIAL CONCERNS:
- The Zod schema is strict — rejects extra fields. Confirm this is desired.
- Added zod as a dependency (72KB gzipped) — already in package.json
```

这个模式能尽早抓住错误假设，也让评审人对改动有一张清晰的地图。「没有动的东西」那一节尤其重要 —— 它表明你守住了范围纪律，没有自作主张搞大翻新。

## 提交前卫生

每次提交之前：

```bash
# 1. Check what you're about to commit
git diff --staged

# 2. Ensure no secrets
git diff --staged | grep -i "password\|secret\|api_key\|token"

# 3. Run tests
npm test

# 4. Run linting
npm run lint

# 5. Run type checking
npx tsc --noEmit
```

用 git hook 把它自动化：

```json
// package.json (using lint-staged + husky)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 处理生成的文件

- **提交生成文件**只在项目确实需要时才做（例如 `package-lock.json`、Prisma migrations）
- **不要提交**构建产物（`dist/`、`.next/`）、环境文件（`.env`）或 IDE 配置（`.vscode/settings.json`，共享的除外）
- **准备好 `.gitignore`**，至少覆盖：`node_modules/`、`dist/`、`.env`、`.env.local`、`*.pem`

## 用 Git 做调试

```bash
# Find which commit introduced a bug
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# Git checkouts midpoints; run your test at each to narrow down

# View what changed recently
git log --oneline -20
git diff HEAD~5..HEAD -- src/

# Find who last changed a specific line
git blame src/services/task.ts

# Search commit messages for a keyword
git log --grep="validation" --oneline
```

## 发布与版本管理

提交是你*自己*追踪改动的方式；而**版本号**是你的*消费方*追踪改动的方式。一旦有任何别的东西依赖你的代码 —— 另一个团队、一个已发布的包、一个已部署的客户端 —— 「main 上是最新的」就不再足以回答「我跑的是什么，升级安全吗？」。版本号加 changelog 就是回答这个问题的契约。

### 语义化版本

只要存在消费方，就用 `MAJOR.MINOR.PATCH`，并让每个数字承载含义：

```
  MAJOR  breaking change — consumers must change their code to upgrade
  MINOR  new functionality, backward-compatible — safe to upgrade
  PATCH  bug fix, backward-compatible — safe to upgrade
```

版本号是一句承诺，所以让代码对得起它。一个改掉了消费方所依赖行为的「patch」，其实是披着伪装的 major 变更（Hyrum 定律 —— 见 `api-and-interface-design` 技能）。拿不准某次改动是否破坏兼容时，就假定它是；一次意料之外的 major 远比一个被弄坏的消费方便宜。

### 给发布打 tag，并让 tag 成为事实源

一次发布是历史中不可变的一个点，不是一条在动的分支。给它打 tag，让它永远可以被复现：

```bash
git tag -a v1.4.0 -m "Release 1.4.0"
git push origin v1.4.0
```

版本号从 tag 推导出来，而不是散落在各处文件里手工编辑，这样产物、tag 与 changelog 永远不会互相矛盾。

### 维护一份为人写的 changelog

changelog 不是 `git log`。它是经过整理、面向消费方的回答：「什么变了，我在意吗？」—— 按 `Added / Changed / Fixed / Deprecated / Removed / Security` 分组，最新的在最上面，每一条都围绕用户影响来措辞，而不是内部机制。

```markdown
## [1.4.0] - 2025-06-12
### Added
- Bulk task import via CSV
### Fixed
- Timezone drift in recurring task due dates
### Deprecated
- `GET /v1/tasks/all` — use the paginated `GET /v1/tasks` (removal in 2.0)
```

在做出改动的那次改动里就把条目写好，趁影响还新鲜 —— 而不是发布时再从提交考古里复原。破坏性变更要有迁移说明与弃用窗口（遵循 `deprecation-and-migration` 技能）；真正把发布推出去是 `shipping-and-launch` 技能的活 —— 本节讲的是喂给它的那份版本契约。

## 常见的自我合理化

| 自我合理化 | 事实 |
|---|---|
| "I'll commit when the feature is done" | One giant commit is impossible to review, debug, or revert. Commit each slice. |
| "The message doesn't matter" | Messages are documentation. Future you (and future agents) will need to understand what changed and why. |
| "I'll squash it all later" | Squashing destroys the development narrative. Prefer clean incremental commits from the start. |
| "Branches add overhead" | Short-lived branches are free and prevent conflicting work from colliding. Long-lived branches are the problem — merge within 1-3 days. |
| "I'll split this change later" | Large changes are harder to review, riskier to deploy, and harder to revert. Split before submitting, not after. |
| "I don't need a .gitignore" | Until `.env` with production secrets gets committed. Set it up immediately. |
| "It's just a small fix, bump the patch" | Check what consumers can observe. A behavior change they relied on is a major, whatever the diff size. |
| "The changelog is just the commit log" | Commits are for you; the changelog is for consumers, curated by impact. Generating one from raw commits buries what matters. |
| "We'll write the changelog at release time" | By then the impact is reconstructed from memory and half of it is missing. Write the entry with the change. |

## 危险信号

- 未提交的大批改动在不断堆积
- 提交信息写成 "fix"、"update"、"misc" 这种
- 格式化改动与行为改动混在一起
- 项目里没有 `.gitignore`
- 提交 `node_modules/`、`.env` 或构建产物
- 长期分支与 main 严重发散
- 向共享分支强推
- 破坏性变更却只用 minor 或 patch 版本号发出去
- 一次发布没有 tag，或者版本号被手工编辑得与 tag 不一致
- 面向用户的发布没有 changelog 条目，或者 changelog 只是把提交信息倒出来

## 验证

对每次提交：

- [ ] 提交只做一件逻辑上的事
- [ ] 信息解释了为什么，并遵循类型约定
- [ ] 提交前测试已通过
- [ ] diff 里没有机密信息
- [ ] 没有把纯格式化改动与行为改动混在一起
- [ ] `.gitignore` 覆盖了标准排除项

对每次发布（任何有消费方的东西）：

- [ ] 版本号涨幅与改动匹配：破坏性 → major，新增 → minor，修复 → patch
- [ ] 这次发布有 tag，且版本号是从 tag 推导的，没有手工编辑到不一致
- [ ] changelog 有经过整理的、按影响分组的人读条目
