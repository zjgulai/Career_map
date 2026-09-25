---
name: "spec-driven-development"
title: "规格驱动开发"
description: "在写代码前把需求固化成六个核心领域齐备的规格，经四阶段门禁逐段评审后才进入实现。触发词：规格驱动开发、spec-driven-development、在写代码前把需求固化成六个核心领域齐备的规格，经四阶段门禁逐段评审后才进入实现。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 规格驱动开发

## 概述

在写任何代码之前先写一份结构化规格。规格是你与人类工程师之间的共享事实源——它定义我们在建什么、为什么建，以及我们如何知道已经做完。没有规格的代码就是猜。

## 何时使用

- 启动一个新项目或新功能
- 需求模糊或不完整
- 改动会触及多个文件或模块
- 你即将做一个架构决策
- 这项任务实现起来要超过 30 分钟

**何时不用：** 单行修复、拼写纠正，或需求明确且自包含的改动。

## 带门禁的工作流

规格驱动开发有四个阶段，前面还有一个范围检查（阶段 0），只在一个请求捆绑了多个可独立验证的能力时才启用。当前阶段未经验证，不要进入下一阶段。

```
SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
   │          │        │          │
   ▼          ▼        ▼          ▼
 Human      Human    Human      Human
 reviews    reviews  reviews    reviews
```

### 阶段 0：范围检查

大多数请求只描述一个能力。如果这个请求也是，就跳过本阶段，直接进入 Specify——阶段 0 是为例外而存在的，不是常规，它也不会给单能力功能强加任何层级。

**识别。** 当一个需求捆绑了多个可独立验证的能力时，先分解再写规格：

- 该需求点名了各自拥有消费者或数据的多个不同能力（例如身份、计费、通知、报表）
- 验收标准聚成若干组，可以分别交付并分别验证
- 砍掉或替换其中一个能力，不必重写其它能力的需求

**在写任何规格之前，先提出一张能力地图。** 要小、可评审——一张模块表加一个构建顺序，不是项目计划：

```markdown
# Capability Map: [Initiative Name]

| Module id | Responsibility | Depends on |
|---|---|---|
| identity | Accounts, sessions, SSO | — |
| billing | Plans, invoices, payments | identity |
| notifications | Email and webhook fan-out | identity |
| reporting | Usage dashboards | billing, notifications |

Build order: identity → billing, notifications → reporting
```

- **稳定的模块 id。** 用 kebab-case，一次选定，整个计划期内不再改名。规格、计划与下游命令都按这些 id 选取工作，而不是靠猜哪份规格是当前生效的。
- **依赖方向，无环。** 箭头只朝一个方向。如果两个模块彼此需要，它们就是一个模块。
- **接口放在边界上。** 地图只记录 `billing` 依赖 `identity`；两者之间的契约属于提供方模块的规格（设计它见 `api-and-interface-design`）。

**这张地图和其它阶段一样有门禁。** 人类在写任何模块规格之前评审模块边界、依赖方向与构建顺序。地图搞错的代价很高；评审十行字的代价不高。

**然后按模块递归。** 按依赖顺序，对每个模块跑一遍 Specify → Plan → Tasks → Implement。每个模块有自己的规格，范围限定在该模块的目标、边界与成功标准之内。把已批准的地图保存在项目根目录，每个模块的规格与它放在一起，按模块 id 命名（`SPEC-identity.md`、`SPEC-billing.md`）——有什么东西存在，以地图为索引，不靠猜文件名。

### 阶段 1：Specify

从一个高层愿景开始。向人类提澄清问题，直到需求变得具体。

**立刻暴露假设。** 在写任何规格内容之前，列出你在假设什么：

```
ASSUMPTIONS I'M MAKING:
1. This is a web application (not native mobile)
2. Authentication uses session-based cookies (not JWT)
3. The database is PostgreSQL (based on existing Prisma schema)
4. We're targeting modern browsers only (no IE11)
→ Correct me now or I'll proceed with these.
```

不要默默填补模糊的需求。规格的全部意义就在于在代码写出来*之前*暴露误解——假设是最危险的一类误解。

**写一份覆盖以下六个核心领域的规格文档：**

1. **目标** —— 我们在建什么、为什么建？用户是谁？成功是什么样子？

2. **命令** —— 带参数的完整可执行命令，不只是工具名。
   ```
   Build: npm run build
   Test: npm test -- --coverage
   Lint: npm run lint --fix
   Dev: npm run dev
   ```

3. **项目结构** —— 源码放在哪、测试放在哪、文档归哪。
   ```
   src/           → Application source code
   src/components → React components
   src/lib        → Shared utilities
   tests/         → Unit and integration tests
   e2e/           → End-to-end tests
   docs/          → Documentation
   ```

4. **代码风格** —— 一段真实的代码片段胜过三段描述风格的文字。要包含命名约定、格式规则和合格产出的示例。

5. **测试策略** —— 用什么框架、测试放在哪、覆盖率期望、哪类关注点用哪一层测试。

6. **边界** —— 三层体系：
   - **始终做：** 提交前跑测试、遵守命名约定、校验输入
   - **先问：** 改数据库 schema、加依赖、改 CI 配置
   - **绝不做：** 提交密钥、编辑 vendor 目录、未经批准删除失败中的测试

**规格模板：**

```markdown
# Spec: [Project/Feature Name]

## Objective
[What we're building and why. User stories or acceptance criteria.]

## Tech Stack
[Framework, language, key dependencies with versions]

## Commands
[Build, test, lint, dev — full commands]

## Project Structure
[Directory layout with descriptions]

## Code Style
[Example snippet + key conventions]

## Testing Strategy
[Framework, test locations, coverage requirements, test levels]

## Boundaries
- Always: [...]
- Ask first: [...]
- Never: [...]

## Success Criteria
[How we'll know this is done — specific, testable conditions]

## Open Questions
[Anything unresolved that needs human input]
```

**外部规格工具：** 本工作流与格式无关。如果项目已经在用 OpenSpec 或其它规格系统，沿用那套系统的产物格式与存放约定，不要再建一份重复的 `SPEC.md`。本技能负责澄清、内容与批准门禁；外部工具负责已批准规格如何被表示。

**把指令重述为成功标准。** 收到模糊需求时，把它们翻译成具体条件：

```
REQUIREMENT: "Make the dashboard faster"

REFRAMED SUCCESS CRITERIA:
- Dashboard LCP < 2.5s on 4G connection
- Initial data load completes in < 500ms
- No layout shift during load (CLS < 0.1)
→ Are these the right targets?
```

这样你就能朝一个清晰的目标循环、重试、解决问题，而不是去猜「更快」是什么意思。

### 阶段 2：Plan

拿着已通过验证的规格，生成一份技术实现计划：

1. 识别主要组件及其依赖
2. 确定实现顺序（什么必须先建）
3. 记录风险与缓解策略
4. 识别哪些可以并行、哪些必须串行
5. 定义阶段之间的验证检查点

> 这些步骤背后的依赖图映射与纵向切片机制，遵循 `planning-and-task-breakdown`，它是正典来源。以上要点只是轻量摘要；若两者出现分歧，以 `planning-and-task-breakdown` 为准。
>
> **产出约定：** 把计划保存到 `tasks/plan.md`，并把任务清单记到 `planning-and-task-breakdown` 定义的任务清单落点（默认 `tasks/todo.md`；项目也可以指定外部跟踪器）。`tasks/` 不存在就创建。下游命令（`/build` 等）按这些默认值来。

计划应当可评审：人类读完应当能说「对，这就是正确的做法」或「不对，改 X」。

### 阶段 3：Tasks

把计划拆成离散、可实施的任务：

- 每个任务应当能在一次专注的会话里完成
- 每个任务有明确的验收标准
- 每个任务包含一个验证步骤（测试、构建、人工检查）
- 任务按依赖排序，而不是按看起来的重要性排序
- 任何任务都不应需要改动超过约 5 个文件

> 完整的任务粒度与依赖排序机制遵循 `planning-and-task-breakdown`，它是正典来源。下面的模板只是轻量内联形式；若两者出现分歧，以 `planning-and-task-breakdown` 为准。

**任务模板：**
```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test command, build, manual check]
  - Files: [Which files will be touched]
```

### 阶段 4：Implement

按照 `skills/incremental-implementation/SKILL.md`（`incremental-implementation`）与 `skills/test-driven-development/SKILL.md`（`test-driven-development`）逐个执行任务。用 `skills/context-engineering/SKILL.md`（`context-engineering`）在每一步加载对应的规格章节与源文件，而不是把整份规格灌给 agent。

## 让规格活着

规格是活的文档，不是一次性产物：

- **决策变了就更新** —— 如果你发现数据模型需要改，先更新规格，再实现。
- **范围变了就更新** —— 增加或砍掉的功能都应当反映到规格里。
- **提交规格** —— 规格属于版本控制，与代码放在一起。
- **在 PR 里引用规格** —— 链接回该 PR 所实现的那一节规格。

## 常见自我辩解

| 自我辩解 | 现实 |
|---|---|
| 「这很简单，我不需要规格」 | 简单任务不需要*长*规格，但仍然需要验收标准。两行规格就够了。 |
| 「我写完代码再补规格」 | 那是文档，不是规格。规格的价值就在于逼你在写代码*之前*想清楚。 |
| 「规格会拖慢我们」 | 15 分钟的规格能省下几小时返工。15 分钟走一遍瀑布胜过 15 小时调 bug。 |
| 「需求反正会变」 | 所以规格才是活的文档。过期的规格仍然好过没有规格。 |
| 「用户知道他要什么」 | 再清晰的请求也有隐含假设。规格把这些假设摆到台面上。 |
| 「这是一个大功能，拆它是额外开销」 | 如果验收标准聚成了若干可独立验证的组，单体规格会逼每一个下游任务在整份契约上做推理。十行能力地图是那个便宜的替代方案。 |
| 「我在计划阶段再分解」 | 计划是在一份规格*之内*切任务。到那时过大的产物已经存在了——模块边界与依赖方向必须在规格写出来之前定，而不是之后。 |

## 危险信号

- 在没有任何书面需求的情况下开始写代码
- 在澄清「完成」意味着什么之前就问「我是不是该直接开建？」
- 实现任何规格或任务清单里都没提到的功能
- 做了架构决策却不把它写下来
- 因为「要建什么很明显」而跳过规格
- 一份规格的需求横跨多个可独立验证的能力
- 模块边界或构建顺序是在实现过程中隐式定下的，因为事前没有批准过能力地图

## 验证

在进入实现之前，确认：

- [ ] 规格覆盖全部六个核心领域
- [ ] 人类已评审并批准该规格
- [ ] 成功标准具体且可验证
- [ ] 边界（Always/Ask First/Never）已定义
- [ ] 规格已保存为仓库中的一个文件
- [ ] 如果请求捆绑了多个可独立验证的能力，则在写任何模块规格之前已批准一份能力地图（模块 id、依赖方向、构建顺序）
- [ ] 每个模块规格都能追溯到已批准地图中的某个模块 id
