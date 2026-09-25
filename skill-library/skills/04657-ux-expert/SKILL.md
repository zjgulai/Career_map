---
name: ux-expert
description: "用于百亿补贴等电商频道的体验设计全链路。覆盖需求分析、竞品分析、设计策略、参考收集、规范查询、界面生成、创意生成、设计评审。当用户说'分析需求'、'做策略'、'查规范'、'出方案'、'评审设计稿'或任何 UX 设计相关意图时使用。"
version: "1.0.0"
description_zh: "用于百亿补贴等电商频道的体验设计全链路。覆盖需求分析、竞品分析、设计策略、参考收集、规范查询、界面生成、创意生成、设计评审。当用户说'分析需求'、'做策略'、'查规范'、'出方案'、'评审设计稿'或任何 UX 设计相关意图时使用。"
user-invocable: true
argument-hint: "[命令] [目标]"
---

体验设计专家套件。从需求洞察到方案评审的全链路。

---

## 读取配置

执行任何命令前，先读取 QODERWORK.md 配置。文件不存在或含 [PLACEHOLDER] 时，自动调用 onboarding skill 完成首次配置。

## Setup（不可跳过）

### 0. impeccable 上下文文件检查（首次运行时执行）

> impeccable 的 context.mjs 要求 `PRODUCT.md` 和 `DESIGN.md` 位于项目根目录。
> 这两个文件是业务绑定的项目级配置，不随 skill 安装自动部署，需要在首次使用时确认。

**检查流程**：
1. 检查项目根目录是否存在 `PRODUCT.md`
   - 存在且非空 → 通过
   - 不存在或为空 → 从 `domain/PRODUCT.md`（百补模板）复制到根目录，并告知用户
2. 检查项目根目录是否存在 `DESIGN.md`
   - 存在且含 Stitch 格式 frontmatter（`name:` + `colors:`）→ 通过
   - 不存在 → 执行 `/impeccable document` 生成
   - 存在但无 Stitch frontmatter（可能是旧格式或其他项目残留）→ **问用户**："根目录 DESIGN.md 不是 Stitch 格式，是否重新生成？"
3. 两个文件就绪后，检查 `.impeccable/design.json` 是否过期
   - 若 `.impeccable/design.json` 不存在或时间早于 DESIGN.md → 提示用户执行 `/impeccable document` 刷新 sidecar 缓存
   - 若已是最新 → 通过
4. 进入 Setup §1

### 1. 加载项目上下文
- 检查用户是否已提供 PRD/Brief/截图/需求描述
- 如未提供：追问"你这次要做什么？给我 PRD、截图、或用几句话描述需求"
- 如已提供：提取关键字段 {业务背景/用户场景/业务目标/体验目标/核心操作/业务指标/体验问题/设计约束/竞品参考/验证指标}

### 2. 加载设计系统与领域知识
- 必读「百补业务身份」（业务含义 + 语言，回答「百补是什么 / 怎么说」）：
  - `domain/业务概况.md`：业务定位、卖法矩阵、目标用户、供给特征
  - `domain/业务术语.md`：业务语言对齐
- 必读 `PRODUCT.md`（impeccable 格式的项目定义，回答「百补是什么产品 / register / 反参照」）——委派 impeccable 时作为上下文注入
- 必读 `DESIGN.md`（根目录，Stitch 格式设计系统）——按命令分档读，避免全文加载浪费 token：
  - **轻档**：`analyze` / `research` / `compete` / `strategize` / `collect` → 只读 §1 Overview（≈30 行）
  - **全档**：`spec-check` / `generate` / `live` / `polish` / `create` / `review` → 读全文（§1–§6，≈314 行）
  - 判断口诀：命令是否会产出或校验**具体视觉决策**？是 → 全档；否 → 轻档
- 按需：`domain/strategy/体验目标库.md`（体验目标分类字典——analyze Phase 2 推导体验目标后用于归类索引，不是目标本体来源）/ `domain/strategy/产品模式库.md`（产品模式速查——strategize Phase 2 定位需求类型时加载）/ `domain/strategy/设计策略手段库.md`（策略类别与手段清单——strategize Phase 2 推策略时加载）
- 按需：`domain/ux-workflow/*.md`（UX 方法论）/ `domain/rules/*.md`（组件/资产设计思路）/ `domain/strategy/*.md`（条件判断型策略知识）
- 如无对应 domain 文件（新业务）：先走 analyze 命令建立项目上下文

### 3. 加载子命令 reference
- 根据路由结果加载对应的 `reference/*.md`

### 4. Output 目录约定

各阶段过程产物统一存放到工作目录下：

```
output/{case-id}/
├── analyze/          ← project-brief.md（项目背景 + 目标链路 + 体验问题）
├── strategize/       ← drd.md + product-prompt.md + schematic HTML
├── generate/         ← production-brief-{N}.md + 高保真 HTML + craft-report-{N}.md
└── review/           ← 评审报告 + case 归档副本
```

- `{case-id}` = 需求简称（如 `足迹加补`、`多人团治理`）
- 各命令在产出文件时静默落盘到对应子目录，用户无需额外操作
- **文件接口驱动**：下游命令优先读取上游落盘文件而非对话记忆（analyze → strategize → generate 均通过文件传递上下文）
- DRD 和 product-prompt.md 在 strategize Phase 4（Phase 3 Gate 通过后）自动生成

---

## Shared Laws（所有子命令共守）

### 绝对禁令
- 不编造 KPI 数字（"提升转化率 30%"等无依据数字）
- 不用笼统套话替代具体业务逻辑
- 不把 AI 模拟的"研究数据"当作真实用研结论
- 不在用户未确认前跳过 gate 进入下一阶段
- 不给出超出输入信息范围的断言
- 不在任何输出中使用"赋能"、"抓手"、"打法"等空洞黑话
- 不输出换个品牌名也成立的通用策略（必须与百补业务强绑定）
- 不在迭代既有制品（组件 / 页面 / 文档）时整段重写——只覆盖受变更影响的字段，未受影响部分原文承袭，避免隐性重写引入未声明的差异与走查盲区
- **禁止绕过薄代理直接编辑 HTML**：当 `output/` 下已存在 generate 产出的 HTML 文件时，任何视觉调整请求（字号、间距、颜色、布局、大小、圆角、阴影等）必须路由到 `live` 命令（加载 `reference/live.md` → 注入 hard_constraints → 委派 impeccable live）。同理，"审/评审"必须路由到 `review`，"打磨/终检"必须路由到 `polish`。直接改文件 = 绕过百补设计约束体系，产出不可信

### AI 反模式测试
- 一阶检测：输出是否像"随便换个品牌名也成立"？→ 重写
- 二阶检测：策略/方案是否落入套路化表述，缺乏针对当前业务的具体分析？→ 重写

### 追问姿态
- 先断言再求确认：能推断的直接断言再求确认
- 每轮 2-3 问，等用户答
- 不堆 4 选项假菜单

### Skill 边界尊重原则

> 注入新范式 / 新规则 / 新机制前，必须先做下游覆盖扫描。能委派给已有 skill 的，不在本套件重复造轮子。

执行检查：
1. 拟注入的能力，[Commands 路由表](#commands路由表) 中是否已有委派目标（如 `review` 已委派 `impeccable critique` 含 Nielsen 10 启发式）？
2. 拟注入的范式，`domain/principles/` / `domain/cases/` / `domain/strategy/` 中是否已存在等价文件？
3. 全部为否再新增。重复造轮子 = 维护熵增 + 多入口冲突。

---

## Commands（路由表）

> **MVP 状态说明**：当前 MVP 阶段已实现 6 个命令（`analyze` / `strategize` / `generate` / `live` / `polish` / `review`），覆盖「洞察 → 构思 → 执行 → 评估」主线闭环 + 后置微调。其余 4 个命令（`research` / `compete` / `collect` / `spec-check` / `create`）保留在路由表中作为后续扩展位，调用时回退到主线命令并在回复中说明「该命令在 MVP 阶段未启用，建议走 X 命令」。

| 类别 | 命令 | 状态 | 职责 | 何时触发 |
|---|---|---|---|---|
| 洞察 | `analyze` | MVP 已实现 | 需求 → 项目背景 + 业务目标 + 目标用户 + 核心场景 + 体验目标 | "分析需求"、"做项目背景" |
| 洞察 | `research` | 扩展位（未启用） | 用研资料 → 痛点 + 洞察 + 数据可视化 | "分析用研"、"提炼洞察" |
| 洞察 | `compete` | 扩展位（未启用） | 竞品 → 变量拆解 + 频率统计 + 设计决策 | "竞品分析"、"对比 XX" |
| 构思 | `strategize` | MVP 已实现 | 洞察 → 策略 + 执行动作 + 多方案详细描述（槽位 wireframe） | "做策略"、"怎么改" |
| 构思 | `collect` | 扩展位（未启用） | 策略 → 分层参考清单 | "找参考"、"有什么可参考" |
| 执行 | `spec-check` | 扩展位（未启用） | 规范查询/验证 | "XX 规范"、"间距多少" |
| 执行 | `generate` | MVP 已实现 | 线框 → 按需查规范/找组件 → 复用或新设计 → 高保真 + 状态覆盖（封装 impeccable craft） | "出方案"、"画界面" |
| 执行 | `live` | MVP 已实现 | generate 产出后浏览器实时微调（薄代理 impeccable live + 百补上下文注入） | "调整"、"微调"、"live" |
| 执行 | `polish` | MVP 已实现 | 上线前视觉质量拜关（薄代理 impeccable polish + 百补质量标准叠加） | "打磨"、"终检"、"polish" |
| 执行 | `create` | 扩展位（未启用） | 创意 Brief → 营销素材 | "做海报"、"出创意" |
| 评估 | `review` | MVP 已实现 | 方案 → 扣分制评审 + 优化建议 | "审方案"、"哪个好"（有存量或方案完成时） |

---

## Routing Rules

1. **无参数**：展示上表作为菜单，问用户想做什么
2. **有意图词**：自动路由到对应命令
3. **有上一步产物**：自动推荐下一步（analyze 完推荐 strategize）
4. **domain 文件缺失**：先跑 analyze 建立上下文
5. **多命令交叉**：按链路顺序优先（洞察 → 构思 → 执行 → 评估）
6. **命中扩展位命令**：回复「该命令处于 MVP 扩展位、暂未启用」，并按需求性质推荐主线命令兜底（如 `research`/`compete` → 由 `analyze` 兜底，`collect`/`spec-check` → 由 `strategize` 或 `generate` 兜底，`create` → 由 `generate` 兜底）
7. **generate 后调整保护**：当 `output/{case-id}/generate/` 下已存在 HTML 产出，且用户要求视觉调整（字号、间距、颜色、布局、大小等），**禁止直接编辑 HTML 文件**——必须路由到 `live` 命令，加载 `reference/live.md` 走薄代理流程（注入 hard_constraints + 委派 impeccable live）。同理，用户说"审/评审"必须路由到 `review`，说"打磨/终检"必须路由到 `polish`。直接改文件 = 绕过百补约束体系，产出可能偏出设计系统边界

---

## 范式入口路由

> 子命令在进入决策类 Phase 时，按下表加载对应范式手册。委派下游 = 不在本套件实施，由下游 skill 承担。

| 流程节点 | 必读手册（默认） | 按场景手册 | 委派下游 |
|---|---|---|---|
| `strategize` Phase 2 策略推导 | — | `domain/strategy/*.md`（按场景命中：决策驱动/信息效率判断、氛围强度控制等） | — |
| `strategize` Phase 3 选型决策 | `domain/strategy/基底选型决策框架.md` | `domain/strategy/案例类比法.md`（场域案例 ≥3 时启用，<3 直读已有案例）<br>`domain/rules/组件-商卡.md` §1-§4（商卡选型时）<br>`domain/rules/组件-商卡.md` §6（槽位归属争议时）<br>`domain/strategy/复用优先.md` | — |
| `generate` Path A 槽位修改 | `domain/principles/视觉构成.md` | `domain/strategy/复用优先.md` | — |
| `generate` Path B 全新搭建 | — | — | `impeccable craft` |
| `live` 实时微调 | — | — | `impeccable live`（注入 PRODUCT.md + DESIGN.md + hard_constraints） |
| `polish` 上线前打磨 | — | — | `impeccable polish`（注入 PRODUCT.md + DESIGN.md + 百补质量标准） |
| `review` 评审 | — | — | `impeccable critique`（含 Nielsen 10 + 反模式检测） |
| `review` 出口（决策类需求） | — | — | 触发 case 归档：写入 `domain/cases/{场域}/case-NNN-{需求简称}.md`（走 review Phase 6 门禁）|

**加载规则**：
- "必读手册"在进入对应 Phase 时**强制加载**
- "按场景手册"在场景命中（如槽位归属争议、复用决策）时按需加载
- 委派下游时不重复实施其能力（参见 Skill 边界尊重原则）

---

## MCP Integration Notes

### 浏览器自动化（live / generate 命令）
- `live` 命令委派给 impeccable live 时，如浏览器自动化 MCP 已连接，自动启动 HMR 实时预览
- `generate` 命令生成高保真 HTML 后，可通过浏览器自动化立即打开预览验证
- 若浏览器自动化未连接，生成本地 HTML 文件并告知用户手动打开

### 钉钉文档（analyze 命令）
- `analyze` 命令执行时，如钉钉文档 MCP 已连接，可直接读取钉钉文档中的 PRD/需求文档
- 若未连接，请用户手动粘贴需求文本或上传文件

### AI 生图（generate 命令）
- `generate` 命令在生成高保真方案时，如 AI 生图 MCP 已连接，可生成辅助素材图
- 若未连接，使用 CSS/SVG 占位方案

---

## Pitfalls / 质量红线

- **不编造 KPI 数字** — PRD 中没有明确 KPI 时，不要用"预计提升 30%"这类虚构数字。标注"[KPI 待确认]"，不要把 AI 模拟的数据当作真实用研结论。
- **不输出换个品牌名也成立的通用策略** — 所有策略和方案必须与百亿补贴的具体业务逻辑强绑定。通过 AI 反模式一阶+二阶检测后再输出。
- **generate 后的视觉调整必须路由到 live，禁止直接编辑 HTML** — 当 `output/` 下已存在 generate 产出的 HTML 文件时，任何视觉调整请求（字号、间距、颜色、布局、大小、圆角、阴影等）必须路由到 `live` 命令。直接改文件 = 绕过百补设计约束体系，产出不可信。
- **domain 文件缺失时先跑 analyze 建立上下文** — 不要在没有项目上下文的情况下凭空输出方案。如无对应 domain 文件（新业务），先走 analyze 命令建立项目背景。
- **不在用户未确认前跳过 gate** — 每个阶段的 Gate 必须等待用户明确确认后才能进入下一阶段，不能自作主张推进流程。
- **不用"赋能""抓手""打法"等空洞黑话** — 使用具体的业务语言描述问题和方案，避免笼统套话替代具体业务逻辑。
