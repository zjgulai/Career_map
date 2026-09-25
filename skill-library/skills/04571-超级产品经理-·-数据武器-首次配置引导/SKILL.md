---
name: onboarding
version: 1.0.0
description: First-run interview that learns how the team actually works and writes the plugin's QODERWORK.md. Use on first install, when QODERWORK.md is missing or contains [PLACEHOLDER] markers, or when the user says "set up", "configure", "onboard me".
description_zh: 首次使用时的引导问答。学习团队的实际做法，把答案写到 QODERWORK.md。当用户说"配置"、"初始化"、"第一次用"时触发。
user-invocable: true
argument-hint: "[--quick 2分钟极简版] [--full 完整版] [--redo <段名> 重做某段] [--check-integrations 只重测连接]"
---

# 超级产品经理 · 数据武器 —— 首次配置引导

## 触发与状态判断

执行前先读 `~/.qoderwork/plugins/config/pm-data-toolkit/QODERWORK.md`：

- **不存在** → 进入完整 onboarding。
- **顶部含 `<!-- SETUP PAUSED AT: {section} -->`** → 打招呼："欢迎回来，上次停在 {section}，要继续还是从头开始？"
- **含 `[PLACEHOLDER]` 但无 pause 注释** → 模板没填完，问用户从空白处继续还是重头来。
- **完全填好** → 默认不再 onboarding。除非传 `--redo`、`--check-integrations`，否则告知用户已配置好。

## 三档模式

### `--quick` —— 2 分钟极简

只问 3 个核心问题，其它字段写 `[DEFAULT]` 默认值：

1. **你负责什么产品线？** → 填入"团队/公司"段
2. **常用的 ODPS 表有哪些？** → 填入"常用表映射"段
3. **给老板汇报数据时你偏好什么风格？** → 填入"输出风格"段

最后告诉用户：
> "默认配置已生效，可以直接开始用。当某个 skill 输出感觉不对，就是默认值需要调——它会告诉你调哪一项。
>  随时可以 `/pm-data-toolkit:onboarding --full` 跑完整版，或 `--redo <段名>` 重做某段。"

### `--full` —— 完整版（默认）

按下面的「访谈剧本」走完所有段。10-15 分钟。

### `--redo <段名>`

只重做指定段（例：`--redo 业务规则`）。其它段不动。

### `--check-integrations`

只重测 `## 已连接的工具` 段。逐个调一次 MCP 工具，调通才标 ✓。

## 访谈剧本

### 0. 开场

> "我会做你的数据分析助手。在干活之前，我想了解你团队**实际**怎么做事——用什么表、看什么指标、怎么给老板汇报。
>  大概十分钟。问几个问题，然后让你确认几份模板。"

按需补充三档说明，让用户挑：
> "**两分钟**版只问产品线 + 常用表 + 汇报风格，其它用默认值。
>  **十五分钟**版问完整流程、口径定义、红线、汇报风格。
>  随时升级。"

### 1. 共享 profile 检查

读 `~/.qoderwork/plugins/config/team-profile.md`：
- **存在** → 一句话确认："你是 [name]，[公司]，[行业]。对吗？"
- **不存在** → "先存一份共享 profile，下次别的插件就不用再问了。" 问公司基础信息，写入。

### 2. 团队 & 工具（Part 0）

快速确认：
- **产品线/业务场景**：负责什么产品？覆盖哪些场景？
- **工具检测**：尝试调用 ODPS MCP。调通标 ✓，没接标 ✗ 并说明 fallback。

### 3. 常用表 & 指标口径（Part 1）

> "你最常用的 ODPS 表是哪几张？给我表名、项目名、分区列就行。每张表用来看什么？"

记录后追问：
> "这些表上你最关注哪些指标？比如渗透率怎么算、转化率口径是什么？每个给一句话计算方式。"

### 4. 业务规则 & 红线（Part 2）

> "数据分析时有什么红线？比如不准裸查生产表、不准不标口径就发数据？"

追问：
> "如果只准说一件最在乎的，是什么？"（一票否决项）

### 5. 输出风格（Part 3）

> "给老板汇报数据时，你偏好什么风格？比如：精炼一句话、带图表的HTML、详细PPT？"

追问：
> "汇报时有没有固定的叙事结构？比如先看大盘再看细节、先结论后数据？"

### 访谈节奏

- **2-3 个/轮**：每轮最多 2-3 个可独立回答的问题
- **能复用就复用**：先问"有没有现成的口径文档/表清单"
- **断点保存**：用户说 "pause/暂停" → 立刻把已填部分写进 QODERWORK.md，顶部加 `<!-- SETUP PAUSED AT: {section} -->`

### 写完之后

1. **展示摘要**："这是我听到的，看看哪里搞错了。"
2. **告诉路径**："配置在 `~/.qoderwork/plugins/config/pm-data-toolkit/QODERWORK.md`，纯文本，随时手动改。"
3. **演示一次**：根据用户说的痛点，挑一个最相关的 skill 当场跑一次。
4. **结尾说明可演进**：
   > "配置不是一次性的。用着觉得不对就回来调；某个口径你反复改，下次我会问要不要写进配置。"

## 失败模式（不要犯）

- **不要写 YAML/schema**。QODERWORK.md 是散文 + 表格。
- **不要写空泛的回答**。"按标准口径"不算答案，追问具体计算方式。
- **不要在每次会话都跑 onboarding**。先读 QODERWORK.md，已填完就直接干活。
