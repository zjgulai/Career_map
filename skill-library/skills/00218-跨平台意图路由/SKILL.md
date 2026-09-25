---
name: multi-platform-intention-router
displayName: 多平台店铺数据分析
displayDescription: 根据指定的淘宝、天猫、抖店、京东、拼多多、1688 店铺与时间范围，执行店铺数据采集，生成本地 Excel，并用 AI 进行经营分析。
description: 统一路由淘宝、天猫、京东、拼多多、抖店、1688 的电商数据分析和导出请求。适用于店铺分析、订单分析、流量分析、商品分析、单品分析、客服聊天/询盘分析、自定义分析、原始 xlsx 导出。不适用于直接执行 RPA、生成下游报告、最终交付打包或非电商任务。
version: 0.1.0
---

# 跨平台意图路由

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 工具执行，脚本路径与传参路径先展开为绝对路径。

> **执行状态门禁**：`resolve_account_scope.py`、`build_plan.py`、`validate_plan.py` 以及其他决定是否进入下一关的命令，必须以 `python3 "<pluginRoot>/runtime/shell_execution.py" -- python3 "<目标脚本绝对路径>" <参数>` 执行。只有外层 envelope 同时满足 `transportStatus=ok`、`processExitCode=0`、`semanticStatus=ok` 才能继续；非零退出、超时、命令不存在，或 child exit 0 但返回非 `ok` 语义状态时立即停止。工具顶层 `isError=false`、stdout 非空或部分文件存在都不能覆盖失败。本文后续单独展示的 `python3` 命令只表示 child argv，实际执行仍必须加此前缀。

## 0. Python 运行时与依赖事实源

下游多平台 Skill 的 Python 依赖由各 Skill 的 `scripts/accio_python_env.py` 统一解析和准备。

- `openpyxl==3.1.5`、`et_xmlfile==2.0.0`、`xlrd==2.0.2` 优先复用当前环境或 AccioWork 预装环境；缺失时只从插件 `resources/python/wheelhouse/` 的固定 wheel 离线安装，不访问 PyPI 或镜像。
- Excel wheel 的安装目标由运行时动态解析为当前 Accio/Phoenix Python 的 `site-packages`。禁止硬编码 `external-tools/<version>`；Phoenix 工具包版本变化后会自动使用新版本目录。
- Accio `site-packages` 是多插件共享目录。已有 Excel 依赖版本与本插件固定版本不一致、目录与 dist-info 不完整或目标不可写时必须停止并报告原始冲突；不得静默覆盖、删除或降级其他插件的包。
- `PIL`（Pillow）/ `fontTools` 仍按 L1 当前解释器 → L2 显式指定 → L3 AccioWork 预装环境 → L4 镜像静默补装解析，但不属于 Router 默认门禁。只有选中的下游 Skill 明确依赖时，才通过 `-m PIL` / `-m fontTools` 显式请求；它们缺失或补装失败不得阻断无关 Skill。
- 时区不引入任何第三方依赖：全部脚本统一用 `datetime.timezone(timedelta(hours=8), "Asia/Shanghai")` 固定偏移（中国无夏令时），不依赖 `zoneinfo` 系统时区库与 `tzdata`。
- 自动准备是脚本内部实现细节，不是 Agent 可用动作；Agent 禁止手工拼 pip、导入隐藏 resolver 或自行改写 `sys.path`。所有安装日志写 stderr，不得污染 stdout 结构化协议。
- 所有 Skill 的 Python 脚本统一用 `python3` 直接执行。`python3` 的工作目录是当前 shell 的 cwd，因此脚本路径与所有传参路径必须先展开为绝对路径。
- 执行前或依赖异常时运行本 Skill 的诊断与自愈脚本。默认只准备 Excel 依赖；Pillow/fontTools 由选中的下游 Skill 按需显式追加。完成后重新检测：

```bash
python3 scripts/check_python_env.py --json
```

需要图片或字体能力的下游 Skill 在自己的工作流中追加模块，例如：

```bash
python3 scripts/check_python_env.py --json -m openpyxl -m xlrd -m PIL -m fontTools
```

退出码含义：

- `0`：依赖可用（包含自动准备后可用），继续流程，不向用户暴露环境细节。
- `1`：自动准备后仍有依赖不可用；报告 `modules`、`offlinePythonDeps.targetDir`、`sitePackages`、`baseDirs` 和 `autoInstall.error`，不同版本冲突必须保留原文。
- `2`：插件安装不完整或诊断脚本自身不可用；停止流程并报告缺失文件。

## 必须遵守的规则

1. 当用户请求涉及淘宝、天猫、京东、拼多多、抖店、1688 的电商平台数据分析或导出时，必须将本 skill 作为唯一入口。
2. 不要打开、抓取、解析店铺/类目/多商品 URL，也不要从这些 URL 中推断信息。移除这些 URL，仅根据非 URL 文本和已保存店铺账号进行路由。唯一例外：路由到 `multi-platform-custom-analysis` 后，该 Skill 允许把用户提供的自家店铺/商品 URL 仅用于定位平台、店铺或商品，仍不得抓取或解析页面内容。
3. 不要直接调用任何 RPA 执行层 skill（`multi-platform-rpa-execution-new`）；只有下游分析 skill 可以调用它们。
4. 写入 `stores[].platform` 时只能使用内部键：`taobao`、`tmall`（沟通分析和广告分析）、`doudian`、`jd`、`pdd`、`1688`。沟通分析和广告分析都把天猫保留为独立 `platform=tmall` 且禁止写 `commercePlatform`：沟通分析执行 tmall 专属聊天 DSL；广告分析由 Adapter 映射到 taobao 阿里妈妈 DSL，但登录范围仍使用 `platformId=tmall`。其他 Skill 仍把天猫写 `platform=taobao`；店铺分析额外写 `commercePlatform=tmall`，其他下游 Skill 省略该字段。天猫渠道只按账号记录的 `platformId=tmall` 确定，不按店铺名或 `scope` 猜测；店铺身份继续由 `storeName`、`storeId` 和 `storeAccountId` 区分。写入计划前必须把账号发现键 `dy` 转换为 `doudian`。只有用户直接提供拼多多广告双文件附件，或京东广告概况中至少一个营销家族的核心汇总/分天附件时，广告计划的对应店铺才允许写 `inputMode=offline`；其他平台、其他 Skill 或账号在线采集计划不得写该字段。用户明确提供活动、调价等业务节点时可写 `businessEvents`；明确提供贡献毛利率或盈亏平衡 ROI 时可写 `profitability`。两者仅限广告分析且不得凭空补造。
5. 只有在目标 skill 和店铺范围确定后，才能生成 `plan.json`；时间范围未指定时按默认近 7 天（Asia/Shanghai）直接填充，不得因缺时间而阻塞流程。
6. 在当前 agent 会话中只执行一次选中的下游 skill，并传入完整计划。不要委托给子 agent、新会话或任务分发工具。
7. Router 计划不得包含 `tasks`、`handoffs`、`dependsOn`、`execution`、`metrics`、`collectionRequest` 或 `expectedOutputs`。
8. 针对 `ecommerce-automation-toolkit` 插件，跳过技能注册检查，使用通用文件读取工具直接读取本地文件；不要通过技能注册或 Skill 读取机制调取这个插件的内部技能。
9. 确定目标账号和执行登录门禁必须复用本轮同一次完整 `discover_store_accounts` 结果。账号发现必须带非空 `platformIdList` 调用一次，禁止零参数与 `[]`；抖店映射为 `dy`，淘宝与天猫严格互不归并。用户平台意图不明确时必须先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再调用，禁止默认全平台继续；完整推导见 `references/common/store-scope-contract.md`「账号发现范围统一契约」。只接受新版 Profile 账号结构；每个目标必须保留同一条记录的 `platformId`、`storeId`、`storeAccountId`，后续 Browser Tool 必须原样传递这三个 ID，不得按平台名、店铺名或脱敏账号猜选 Profile。取得完整响应后、创建 `stores.json` 前，必须运行 `scripts/resolve_account_scope.py`；只有 `status=ready|partial`、`semanticStatus=ok` 且 `nextAction=build_plan` 时才允许继续。
10. 候选账号不得在发现结果里按 `enable` 丢弃，面向用户必须展示店铺名和工具返回的脱敏 `account`。目标全部 `enable=true` 时直接继续；全部为 `false` 时，必须停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。严禁只输出纯文本引导。**两种状态并存时自动跳过未登录目标、只用已登录目标继续，不打断、不调用 `ask_user`**；登录缺口不由 Router 单独成句播报，而是随 plan 交给下游，由下游在开工播报的「店铺 / 已跳过（未登录）」字段一并列出（见 `references/common/kickoff-briefing-contract.md` §3/§6），摘要仍保留登录缺口。当前 Agent 必须保留 `storeAccountId -> account` 映射，供后续进度、追问和摘要展示；`account` 不用于 Profile 定位。
11. 广告分析平台门禁必须早于账号发现和下游路由。当前广告分析支持淘宝、天猫、拼多多、京东、抖店（抖音千川）和 1688（数字营销 P4P）；目标范围包含上述六个平台之外的任何平台时，立即结束并回复“当前广告分析仅支持淘宝、天猫、拼多多、京东、抖店和 1688，暂不支持该平台的广告分析。”不得降级为 `multi-platform-custom-analysis`、店铺分析或仅处理其中受支持的平台。1688 走 B2B 线索指标族（线索量 / 线索成本 CPL）而非成交额与 ROI，路由时按普通广告分析请求处理即可，口径差异由下游 Skill 承担。
12. 广告写操作门禁与平台门禁同属最前置检查。只要请求包含新建、删除、启停或修改广告计划/关键词/创意/预算/出价/人群，立即整体结束并回复“广告操作功能暂不支持，当前仅支持只读分析”；不得先发现账号、先生成巡检报告或把写操作交给 Execution。
13. 广告分析当前不支持关键词级分析、实时竞价诊断、自动调 ROI 或用户未提供明细时的计划级优化。命中这些能力缺口时必须在账号发现前说明不支持，不得用渠道汇总伪装成关键词或计划明细。
14. 执行前允许的打断项只有**平台范围与店铺范围**：平台意图不明确时先追问平台，平台确定后店铺无法唯一确定时再追问店铺，两者都必须 `ask_user(mode="form")`。店铺打断条件只按**已登录**候选判定：用户指定的店铺在已登录候选中无法唯一匹配（命中多条/同店多账号）、同平台已登录候选 `N_on≥2` 且用户本轮未唯一指定（只给平台名、未点名具体店铺也未说“全部”）。**登录状态不再是打断项**：部分目标未登录、部分平台无已登录店铺时自动跳过并继续（详见 `references/common/store-scope-contract.md` §5/§7）。其余有默认值的参数（时间窗、采集范围等）一律取默认并由下游开工播报的对应字段告知后继续，禁止用普通文字、Markdown 表格、「确认使用【…】」「请明确回复后我再开始」「请回复'确认 + 店铺名'」「请确认目标店铺后开始」这类句式索要时间/平台/范围/店铺确认。
15. **开工播报的责任方不是 Router**：Router 不播执行摘要（平台 / 店铺 / 周期 / 动作 / 交付），只做路由说明与必要的平台 / 店铺追问，把已锁定目标、登录缺口和周期随 plan 交给下游，由下游 Skill 在首个采集调用前播报唯一一次；完整契约见 [`references/common/kickoff-briefing-contract.md`](references/common/kickoff-briefing-contract.md)。禁止 Router 与下游各播一次造成重复。

## 目的

本 skill 将用户的电商分析/导出请求转换为一个经过验证的下游执行计划。它会为每个计划选择且只选择一个下游 skill，从账号管理中已保存的商家后台账号确定店铺范围，完成新版 Profile 登录门禁，解析或默认填充采集时间范围，构建批处理版 `plan.v3`，创建可见进度任务，然后把完整计划交给下游 skill。

本 skill 不采集数据、不编写采集请求、不聚合指标、不分析结果，也不创建最终交付目录。这些动作均属于选中的下游 skill。

## 决策点

在加载详细契约前，先选择下游 skill：

| 用户请求 | `skill` | `analysisType` | 下一步读取 |
|---|---|---|---|
| 店铺经营、日报/周报/月报、GMV | `multi-platform-store-analysis-new` | `店铺分析` | `../multi-platform-store-analysis-new/SKILL.md` |
| 订单、交易、退款、履约 | `multi-platform-store-analysis-new` | `订单分析` | `../multi-platform-store-analysis-new/SKILL.md` |
| 流量、访客、曝光、转化、来源、关键词 | `multi-platform-store-analysis-new` | `流量分析` | `../multi-platform-store-analysis-new/SKILL.md` |
| 淘宝/天猫/拼多多/京东/抖店/1688 广告分析、推广效果、推广 ROI、线索成本/获客成本、付费推广、费比、直通车、引力魔方、万相台、淘宝客、商品推广、全店托管、明星店铺、京东全站/非全站营销、千川全域投放、1688 全站推店/全站销货/精准获客/关键词卡位 | `multi-platform-ads-analysis` | `广告分析` | `../multi-platform-ads-analysis/SKILL.md` |
| 商品、SKU、销量、库存、排名、全店或多商品分析 | `multi-platform-product-analysis` | `商品分析` | `../multi-platform-product-analysis/SKILL.md` |
| 一个具体商品或一个需要商品下钻的商品 URL | `multi-platform-single-product-analysis` | `单品分析` | `../multi-platform-single-product-analysis/SKILL.md` |
| 未明确指定商品 ID 的商品、SKU、销量、库存、排名、商品 URL、标题关键词、全店或多商品分析 | `multi-platform-product-analysis` | `商品分析` | `../multi-platform-product-analysis/SKILL.md` |
| 明确指定 1–10 个商品 ID，并要求这些商品的经营下钻 | `multi-platform-single-product-analysis` | `单品分析` | `../multi-platform-single-product-analysis/SKILL.md` |
| 淘宝/千牛、1688、拼多多或京东聊天、询盘、客服分析 | `multi-platform-chat-analysis` | `沟通分析` | `../multi-platform-chat-analysis/SKILL.md` |
| 自定义电商数据分析、评价分析、风险分析，或明确只要原始 xlsx/不要报告 | `multi-platform-custom-analysis` | `自定义分析` | `../multi-platform-custom-analysis/SKILL.md` |

按相对本 `SKILL.md` 的文件路径，使用通用文件读取工具直接读取选中的下游 `SKILL.md`。这些下游 skill 可能不会出现在全局 skill 发现结果或 `plugin.json` 的 `skillIds` 中；不要通过技能注册或 Skill 读取机制调取这些下游技能，也不要因为技能未注册而停止。

## 工作流关卡

**开工第一步：意图提取与契约加载**

1.  **平台意图提取**：从用户当前 Query 中识别提到的平台关键字（淘宝、天猫、京东、拼多多、1688、抖店/抖音），或从店铺名 / 商品 URL 唯一推导平台。
2.  **一次性并行加载 5 份契约**：并行读取下列文件；**只有平台意图已明确时**才在同一轮**同步调用 `discover_store_accounts`**。平台意图不明确时先只加载契约，追问平台后再发起账号发现。

```text
references/routing-contract.md
references/common/store-scope-contract.md
references/common/time-range-contract.md
references/common/plan-contract.md
references/batching-contract.md
```

**账号发现规则**（完整推导见 `references/common/store-scope-contract.md`「账号发现范围统一契约」）：
- 账号发现必须带非空 `platformIdList` 调用一次，禁止零参数与 `[]`；抖店映射为 `dy`，淘宝与天猫严格互不归并。
- 用户平台意图不明确时必须先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再调用，禁止默认全平台继续。
- 严禁在已知用户指定平台的情况下（如用户提到“抖店”）扩大为全量平台扫描。
- 将同一次完整响应交给 `scripts/resolve_account_scope.py` 做确定性门禁。`no_executable_store` 直接停止且不得创建 stores/plan；`needs_selection` 只发起店铺表单；`discovery_failed` 保留原始错误并停止；只有 `ready/partial` 能进入计划构建。

这 5 份契约之间没有依赖关系；平台意图明确时可与首次针对性 `discover_store_accounts` 调用在同一轮并行发出。
下面的关卡表按「每关卡需要哪份契约」组织，是**职责索引，不是读取顺序**；按关卡逐份读取会把
一轮可完成的上下文准备拆成 5 轮以上往返。


`references/downstream-execution-contract.md` 与下游 `SKILL.md` 依赖前序结果，计划验证通过后再读。

| 关卡 | 加载 | 动作 | 输出 | 停止条件 |
|---|---|---|---|---|
| 路由意图 | [`references/routing-contract.md`](references/routing-contract.md) | 选择一个下游 skill 和一个 `analysisType` | `{skill, analysisType}` | 如果不存在受支持的路由，用 `ask_user(mode="form")` 问一个澄清问题 |
| 解析店铺 | [`references/common/store-scope-contract.md`](references/common/store-scope-contract.md)、`../discover-store-accounts/SKILL.md` 和 `scripts/resolve_account_scope.py` | 调用一次账号发现并运行确定性状态门禁 | `ready/partial` 的可执行账号与登录缺口，或明确终态 | `no_executable_store` / `discovery_failed` 停止；`needs_selection` 完成表单前停止 |
| 解析时间 | [`references/common/time-range-contract.md`](references/common/time-range-contract.md) | 解析显式时间，缺省时直接填默认近 7 天 | 店铺级 `timeRange` 值 | 无（不得因缺时间而停止或追问） |
| 开工播报归属 | [`references/common/kickoff-briefing-contract.md`](references/common/kickoff-briefing-contract.md) | Router 不播执行摘要，把目标、登录缺口与周期随 plan 交下游 | 下游可直接填模板的字段 | 无（禁止 Router 自行播报或索要确认）|
| 构建计划 | [`references/common/plan-contract.md`](references/common/plan-contract.md)、[`references/batching-contract.md`](references/batching-contract.md) | 使用店铺级时间范围生成单 skill `plan.v3` | `plan.json` | 如果 schema 字段未知或缺少必要数据，则停止 |
| 验证计划 | `scripts/validate_plan.py` | 通过 `runtime/shell_execution.py` 运行 `python3 scripts/validate_plan.py <plan.json>` | 三层状态均成功的验证器 JSON | 如果任一状态失败，停止并修复计划 |
| 创建可见任务 | [`references/downstream-execution-contract.md`](references/downstream-execution-contract.md) | 在当前环境中创建或更新五个阶段任务 | 可见任务/进度状态 | 如果没有进度机制，在长时间运行任务前停止 |
| 执行下游 | 选中的下游 `SKILL.md` | 完整读取下游说明并传入完整计划一次 | 下游工作流执行 | 如果下游 `SKILL.md` 路径缺失或不可读，则停止；不要使用全局发现或猜测 |

通过条件：下游 skill 收到一个经过验证的完整计划，并且在当前会话中只执行一次。

## 资源

| 资源 | 加载/使用时机 | 目的 |
|---|---|---|
| [`references/routing-contract.md`](references/routing-contract.md) | 最终确定下游 skill 前 | 详细路由、URL、导出与多意图规则 |
| [`references/common/store-scope-contract.md`](references/common/store-scope-contract.md) | 选择店铺前 | 账号发现、平台键映射与新版 Profile 登录门禁 |
| [`references/common/a[REDACTED].md`](references/common/a[REDACTED].md) | 发起任何 `ask_user` 表单前 | 表单构造硬规则：消歧型/决策型分类、至少 2 个选项（决策型上限 6，消歧型按真实候选）、禁止同义选项、禁止与客户端内置「跳过」键重名、打断白名单 |
| [`references/common/time-range-contract.md`](references/common/time-range-contract.md) | 生成计划前 | Asia/Shanghai 时间解析与缺省默认行为 |
| [`references/common/kickoff-briefing-contract.md`](references/common/kickoff-briefing-contract.md) | 交接下游前 | 开工播报的时机、责任方、固定模板与硬禁令（Router 不播）|
| [`references/common/plan-contract.md`](references/common/plan-contract.md) | 写入 `plan.json` 前 | 严格的 `plan.v3` schema、枚举与示例 |
| [`references/batching-contract.md`](references/batching-contract.md) | 店铺分组前 | 账号/平台冲突规则与脚本权威性 |
| [`references/downstream-execution-contract.md`](references/downstream-execution-contract.md) | 计划验证后 | 进度任务要求与下游交接模板 |
| [`references/script-usage.md`](references/script-usage.md) | 使用任何脚本或解释脚本边界前 | 核心脚本与兼容脚本清单、黑盒使用规则 |
| `scripts/resolve_account_scope.py` | 账号发现后、创建任何 stores/plan 前 | 严格校验完整发现响应并输出账号范围状态；只允许 `ready/partial` 继续 |
| `scripts/validate_plan.py` | 写入计划后始终使用 | 标准计划验证 |
| `scripts/build_plan.py` | 需要把扁平店铺列表确定性分批时 | 根据店铺构建自验证计划 |
| 其他脚本 | 仅在读取 [`references/script-usage.md`](references/script-usage.md) 后使用 | 兼容辅助工具；不是 Router 的常规执行路径 |

## 输出契约

有效的 Router 计划是一个匹配 [`references/common/plan-contract.md`](references/common/plan-contract.md) 的 JSON 对象。最小结构：

```json
{"schemaVersion":"multi-platform-intention-router.plan.v3","skill":"multi-platform-store-analysis-new","analysisType":"订单分析","batches":[{"stores":[{"platform":"jd","storeName":"京东店","storeId":"store-jd-uuid","storeAccountId":"store-account-jd-uuid","timeRange":{"mode":"week","start":"2026-07-27","end":"2026-08-02","timezone":"Asia/Shanghai"}}]}]}
```

失败时，停止并报告失败阶段、原始错误和下一步动作。不要对未变化的失败操作进行重试。

## 边界情况

- 如果 `resolve_account_scope.py` 返回 `discovery_failed`，在生成计划前停止并报告其结构化原始错误，禁止改写为空账号。
- 如果状态为 `no_executable_store`，必须停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。严禁只输出纯文本引导。
- 目标账号部分未通过登录检查时，自动跳过未登录账号、只用已登录账号继续，不追问也不停止；不得隐藏未登录账号，但也不由 Router 单独成句播报——把“店铺名（脱敏账号）”级别的本次执行项与已跳过（未登录）项随 plan 交给下游，由下游在开工播报里列出并提示可到“设置 - 账号管理”（[点击前往账号管理](accio://settings/account-management)｜[账号登录使用教程](https://acciowork.yuque.com/rfmg8t/ieb85b/achx4dk5s999qoa4#WGzMZ)）登录后重跑。全部未登录时停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`** 执行图文引导。不要重复调用账号发现做逐店检查。
- 如果缺少时间范围，按近 7 天默认填充并继续生成计划；不询问、不展示时间选项，也不由 Router 单独成句提示（由下游开工播报的「周期」字段承载）。
- 单品路由只看是否明确指定商品 ID，不按平台判断：淘宝、抖店、京东、拼多多和 1688 均可进入单品 Skill。商品 URL、标题关键词、“分析这个商品”或自动 Top 商品不能代替明确商品 ID；未指定商品 ID 时路由到 `multi-platform-product-analysis` 拉取商品列表。
- 如果选中的下游 `SKILL.md` 路径缺失或不可读，停止并报告准确路径。不要使用全局 skill 发现，也不要编造下游工作流。
- 如果 `validate_plan.py` 失败，修复计划，不要绕过验证器。
