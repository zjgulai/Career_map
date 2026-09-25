---
name: multi-platform-chat-analysis
displayName: 多平台客户沟通分析
description: 分析淘宝、天猫、千牛、1688、拼多多、京东、抖店/飞鸽店铺客户聊天与历史会话记录，并生成脱敏、证据化的沟通卡点 HTML 报告。适用于聊天记录、客服会话、旺旺/千牛消息、抖店历史会话、询单转化、未成交原因、客服响应、话术复盘、订单成交证据。仅执行只读采集编排、规范化、标注、分析、验证与交付；不发送消息、优惠券，不修改退款、订单或商品。
---

# 跨平台客户沟通分析

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

## 路径基准

所有 `references/`、`assets/`、`scripts/` 相对路径均以本 `SKILL.md` 所在技能目录为基准（插件安装后路径为 `<插件根>/skills/multi-platform-chat-analysis/`），禁止拼接插件根目录。

> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 工具执行，脚本路径与传参路径先展开为绝对路径。

## 不可妥协规则

- **主 Agent 执行**：当前主 Agent 必须在当前会话中直接执行全流程。严禁调用 `functions.sessions_spawn`，不得使用 `agent`、`general`、多会话或其他子 Agent 机制来执行任一平台任务/Phase/Step；不得以并行执行、任务拆分、浏览器操作、耗时较长或上下文隔离为理由派出子 Agent。子 Agent 不能替代本 Skill 的门禁、停止规则和本次运行目录约束；需要并行只读采集时，只能由当前主 Agent 在同一轮直接发起多个 `browser_rpa_launch` 调用（经执行层）实现，而非派出子 Agent。
- **只读边界**：只允许搜索、读取、分析和生成本地产物；禁止发送消息/优惠券、修改订单/商品、退款、取消、浏览器 console/JavaScript 注入和手工浏览器点击替代 DSL。
- **执行层边界**：账号登录状态检查、浏览器 RPA、两阶段 Chat 采集和原始导出只由 `../multi-platform-rpa-execution-new/SKILL.md` 的「Chat 采集流水线」承担。本 Skill 不直接调用 `browser_rpa_launch` 或浏览器工具。
- **账号边界**：本轮已有有效的完整 `discover_store_accounts` 结果时必须复用；没有时按 `references/request-routing.md`「账号发现范围」推导范围后调用一次。账号发现必须带非空 `platformIdList` 调用一次，禁止零参数与 `[]`；抖店映射为 `dy`，淘宝与天猫严格互不归并（同时禁止中文平台名、`douyin`/`doudian` 与清单外平台）。用户平台意图不明确时必须先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再调用，禁止默认全平台继续。完整推导见 `../multi-platform-intention-router/references/common/store-scope-contract.md`「账号发现范围统一契约」；基座 `../discover-store-accounts/SKILL.md` 的零参数分支在本链路不适用。目标确定后按 `enable` 完成登录门禁：**部分目标未登录时自动跳过未登录店铺，只采集已登录店铺，不打断、不追问**；只把同一条记录的 `storeId/storeAccountId` 写入 Router/采集计划；`platformId` 由执行层在调用 `browser_rpa_launch` 前从同次发现结果恢复，并与另外两个 ID 一起放在工具顶层。
- **请求边界**：禁止手工构造 Chat 请求、手写 Router `batches`、丢失 `batchIndex`、改写任一店铺 `timeRange`、扫描执行层 `rpa/` 目录或把 outputs.json 正文放入模型上下文。
- **证据边界**：没有权威订单证据时只写“未从当前证据确认成交”，不得断言未成交；图片、语音、商品卡等不可可靠解析消息只保留类型并标记 `parsed=false`，不得猜测内容。
- **打断边界**：执行前允许的打断项只有**平台范围与店铺范围**：平台意图不明确时先追问平台，平台确定后店铺无法唯一确定时再追问店铺，两者都必须 `ask_user(mode="form")`。店铺打断条件只按**已登录**（`enable=true`）候选判定：用户指定的店铺在已登录候选中无法唯一匹配（命中多条/同店多账号）、同平台已登录候选 `N_on≥2` 且用户本轮未唯一指定（只给平台名、未点名具体店铺也未说“全部店铺”），并列出候选“店铺名（脱敏账号）”让用户选择（含「全部店铺」选项）。`N_on=1` 或用户已唯一指定（含明确“全部店铺”）时不打断；`<active_store>`、历史店铺、路由注入信息一律不算用户已指定。旧口径「平台级全选时不需确认」已废止。**登录状态不是打断项**：目标 `enable` 混合、部分平台无已登录店铺或某平台无候选时，自动跳过这些目标并在开工播报中列明后继续采集已登录店铺，禁止用 `ask_user` 或文字就登录状态索要确认。时间窗（缺省近 7 天）、采集模式/条数、客服与客户筛选等有默认值的参数一律取默认并由开工播报的对应字段告知后继续，禁止用普通文字、Markdown 表格、编号列表、「确认使用【…】」「请明确回复后我再开始」「请回复'确认 + 店铺名'」「请确认目标店铺后开始」这类句式或任何自由文本框索要确认。
- **开工播报（硬规则）**：目标锁定后、委派执行层采集之前，必须按 `../multi-platform-intention-router/references/common/kickoff-briefing-contract.md` 播报**恰好一次**并在同一轮直接继续执行；禁止用 `ask_user` 承载，其余禁令见契约 §5。字段口径：动作 = “进入商家后台下载指定日期的接待会话聊天记录” + 本轮采集模式与筛选；交付 = “逐店聊天记录 Excel + 《跨平台沟通卡点分析报告.html》，保存到本次会话工作目录”。

## 目的

本 Skill 负责“生成采集请求 -> 委托执行层采集 -> 规范化 -> 模型逐条标注 -> 证据化诊断 -> HTML 报告 -> 标准交付”。它只分析本次任务 `stores` 中指定店铺的聊天记录，不要求、也不接受旺旺买家名称作为采集范围。

## 决策点

| 判断 | 规则 | 后续动作 |
|---|---|---|
| 平台 | 用户明说 `1688 / 1688 卖家` -> `1688`；明说 `拼多多 / PDD` -> `pdd`；明说 `京东 / 京麦 / JD` -> `jd`；明说 `抖店 / 飞鸽 / 抖音小店` -> `doudian`；明说 `天猫 / tmall` 或命中 `platformId=tmall` 的账号记录 -> `tmall`；其余默认或明说 `淘宝 / 千牛 / qianniu` -> `taobao` | 按 `references/platform-contract.md` 的平台差异处理；`tmall` 是独立平台，只跑 tmall 专属聊天 DSL，禁止归一为 `taobao` 或回落 taobao 模板 |
| 路由来源 | 经 Router 命中 | 直接使用 Router `plan.v3` 生成 chat-collection-request |
| 路由来源 | 直接命中本 Skill | 先按 `references/request-routing.md` 发现店铺并生成 `stores.json`，再调用 Router `build_plan.py` |
| 采集模式 | 默认、全量、全部客户、未指定客户 | 淘宝/天猫/1688/PDD 使用 `chatOptions.mode=contact-loop`，默认最近20条；京东默认最近20条并按每40条一轮有界下滑（顾客列表为纯滚动懒加载、无分页封顶），时间默认截至昨日7个自然日，也支持自定义起止日期（单次最多31个自然日、最近13个自然月）；拼多多支持自定义起止日期（只读 monthRangePicker 点选，可选窗口恒为 `[今天−30, 今天]`、共31个自然日，超范围渲染层锚定 end 裁剪；未指定=保留页面默认时间范围）；抖店使用飞鸽历史会话表格单次查询，默认当前账户、近7天、20条/页。用户说“全部/全量/所有会话”时用 `chatOptions.maxContacts=0`，语义=当前筛选时间范围内的全部会话：淘宝/天猫/1688 落地为 phase-1 实际抓到的联系人数；**京东/拼多多/抖店走「两趟发现」——先跑一趟发现真实会话总数，再按真实数精确采集（零 padding）**，实际条数写入报告；发现信号缺失时硬失败（不静默降级成采 1 条） |
| 采集模式 | 用户明确指定“采集 N 条 / 最近 N 条 / 分析 N 个客户” | `chatOptions.maxContacts=N`，按 N 精确采集（单趟），不再按 500 截断；N 超平台可运行上限时截断到上限并在报告标注（maxContactsClamped）；`maxContacts=0` 表示时间范围内全部会话（jd/pdd/doudian 走两趟发现） |
| 淘宝/天猫筛选 | 用户指定客户昵称、员工账号 | 通过 `--customer-nickname` / `--employee-account` 传入千牛聊天记录查询页；页面要求完整客户昵称配合员工账号搜索，最多查近3个月；留空=不加该筛选 |
| 京东筛选 | 用户指定客服账号、顾客ID | 通过 `--jd-service-account` / `--customer-id` 传入京东聊天记录查询页；客服账号需先把「客服范围」切到“客服账号”，顾客ID填入「顾客」框；留空=不加该筛选 |
| 抖店筛选 | 用户指定客服昵称、消费者昵称 | 通过 `--servicer-nickname` / `--consumer-nickname` 传入抖店飞鸽历史会话页；两者为 Auxo 搜索框，输入后回车选中候选；留空=不加该筛选 |
| 1688筛选 | 用户指定员工账号和/或客户账号 | 通过 `--employee-account`（下拉）/ `--customer-account`（输入框）传入1688自查工具聊天记录查询页；页面规则二者至少一个、可同时填、不能都不填，默认填员工账号（二者可并存不互斥）；只填客户账号时跳过员工下拉，同时填时两者都生效；留空=不加该筛选 |
| 采集模式 | 用户明确只关心一个客户且给出联系人名 | 淘宝/天猫/1688/PDD 可用 `direct-query`；若只抓到单对话且 `pagesRead=3`，必须改用 `contact-loop` 重采。抖店按历史会话查询结果顺序，从第1条“查看会话”开始，用“下通会话”有界读取当前页，并对每条 `.msgItemWrap` 逐气泡采集 |
| 抖店正文模式 | 飞鸽历史会话汇总表 + `chat_region_conv_NNN__bubble_MM__text/__dir` 逐气泡详情 | 汇总表既作范围元数据、又提供“用户信息”买家账号按行映射；逐气泡是消息分析权威来源。方向由气泡内 `messageIsMe` 后代决定：右侧=卖家侧（智能客服/商家配置/人工客服），左侧=买家（sender/role 取汇总表买家账号，非“本通会话明细”），居中状态=system。相对日期（昨天/今天）按请求结束日换算；商品卡、订单卡及角色不明内容保留为 `parsed=false` 上下文，不猜测 |
| 抖店旧产物兼容 | 仅有历史会话汇总表、没有 `chat_region_conv_*` | 继续输出 `partial/doudian_summary_table_only`，禁止客户原声、完整话术和确定性未成交归因 |

## 工作流

全流程分 4 个阶段、11 个连续步骤。先加载 `references/workflow-gates.md`，再按当前阶段加载对应契约；采集完成后的离线链路优先使用 `references/offline-pipeline-playbook.md` 与 `scripts/orchestrator.py --help`，不要预读不相关的大型脚本源码。

| 阶段 | 步骤 | 粒度 | 核心产物 | 必读资源 |
|---|---:|---|---|---|
| 输入与请求 | 1-2 | 全局一次 | `chat-collection-request.json` | `request-routing.md`, `platform-contract.md` |
| 委托采集 | 3-4 | 全局一次，执行层负责 RPA | `raw_data/`, `chat_collect_result.json` | `platform-contract.md`, 执行层 Chat 采集流水线 |
| 逐店分析 | 5-8 | 每店循环一轮 | `canonical-chat.json`, `annotation-payload.json`, `chat-annotations.json`, `analysis-summary.json` | `analysis-taxonomy.md`, `annotation-contract.md`, schema assets |
| 聚合与交付 | 9-11 | 全部店铺完成后一次 | `跨平台沟通卡点分析报告.html`, 标准交付目录, `present_files.json` | `report-contract.md`, `delivery-contract.md` |

面向用户的回复统一展示“店铺名（工具返回的脱敏账号）”，不要暴露脚本名、内部路径、完整账号、客户名称、订单号、原始聊天或商家页面正文。

## 资源

### 参考资料

| 资源 | 加载时机 |
|---|---|
| `references/workflow-gates.md` | 执行任一实际分析任务前，作为 11 步骤 控制器 |
| `references/offline-pipeline-playbook.md` | **离线阶段入口与路由**：采集完成后先读它，优先使用 `scripts/orchestrator.py` 收敛 normalize/prepare/analyze/delivery 命令；本文只维护入口、阶段顺序、关键陷阱、Exit code 与升级阅读路径 |
| `references/request-routing.md` | 解析输入、直接命中、默认时间窗、Router plan 和采集请求生成时 |
| `references/platform-contract.md` | 处理平台差异、执行层产物、完成/失败状态和原始消息格式时 |
| `references/analysis-taxonomy.md` | 解释卡点分类、证据等级、置信度和建议约束时 |
| `references/annotation-contract.md` | 生成 `chat-annotations.json` 前；必须同时读取 `references/schema-index.md` 与 `assets/schemas/chat-annotations.schema.json` |
| `references/report-contract.md` | 生成或校验 HTML 报告前 |
| `references/delivery-contract.md` | 执行 步骤 11 标准交付和 `present_files` 展示前 |
| `references/script-inventory.md` | 调用脚本前，先看接口、输入输出、副作用和 dry-run 例外 |
| `references/schema-index.md` | 判断 schema 用途、关键字段、最小 JSON 形态时；完整结构再读 `assets/schemas/*.schema.json` |

### 资产

| 资产 | 用途 |
|---|---|
| `assets/report-template.html` | 6 章无侧栏自包含 HTML 模板；由 `scripts/render_report.py` 填充渲染 |
| `assets/schemas/*.schema.json` | canonical、annotation（每条必填质量类型、问题主体、置信度、判定理由与买家指出的问题部位，并含商机/流失/工单/原声墙扩展字段）、analysis summary（含 `chatMetrics` / `retentionPlans` / `sectionConclusions`）的结构契约；先读 `references/schema-index.md` 定位用途，再按需读取完整 schema |
| `assets/examples/淘宝-沟通采集-50条-2026-07-20.xlsx` | 沟通采集 Excel 示例资产，仅用于本地理解/回归参考，不作为生产输入默认读取 |

### 脚本

离线阶段优先运行 `python3 scripts/orchestrator.py --help` 查看单店/多店编排入口；只有需要单步调试时才运行 `python3 scripts/<name>.py --help`。除调试、修复或确认契约外，不要把大型脚本源码读入上下文。脚本清单见 `references/script-inventory.md`。

## 输出契约

- 成功时至少产出一份 `跨平台沟通卡点分析报告.html`（固定 6 章：有效响应 / 及时响应 / 业务员接待 / 产品线质量 / 客户挽留与回复话术 / 客户原声墙），并按店铺交付采集 Excel/JSON 副本到标准运行目录。报告结构与规范以 `references/report-contract.md` 为准。
- 多平台或多店时最终 HTML 为唯一聚合报告；同一份聚合报告按店复制入每个交付目录。
- `storeKey` 常态沿用 `<platform>-<storeName>`；同一次请求出现同平台、同店名但不同 Profile 账号时，必须使用 `storeAccountId` 隔离工作目录与归集结果，禁止相互覆盖。
- 多店报告中，任何具体店铺位置都不得只显示平台名：一般位置显示完整 `平台·店铺名`，第 4 章质量分型矩阵列头与问题部位表店铺列显示纯店铺名；内部聚合仍用完整店铺身份。同平台多店的 Tab id 必须唯一，禁止使用平台名作为店铺聚合键。
- 质量标注必须先识别“问题主体 + 是否已发生”，再判断置信度与类型。只有机器/明确部件的 high/medium 证据进入质量主表；否定、假设咨询、包装破损、存放物损坏和主体不清均不得强判。结构/尺寸卡合问题使用规格或结构适配类型，不得仅凭“框/坏/破”等单字关键词定类。
- 第 4 章问题部位取买家原话中可单独指认的部位/部件/组件（不要求可拆卸，含“冰柜盖”这类整机名+部位复合词），整机名单独出现不算；报告按部位 × 问题类型交叉的涉及会话数统计，不按重复消息次数放大，未过质量门禁的提及只作审计。完整口径以 `references/annotation-contract.md` 为准。
- 每店采集 JSON/XLSX 文件名必须包含该店 `storeName`；不得手工复用上一店的输出文件名。执行层会在记录和归集时校验店铺名与跨店重复路径。
- 标准交付由 `scripts/spec_delivery.py` 逐店落盘；最终展示文件必须来自 `logs/present_files.json` 的完整数组，禁止 Agent 手工挑选文件。
- 报告只能展示固定范围标签（如“当前登录千牛账号”“当前登录天猫千牛账号”“当前登录1688卖家账号”“当前登录拼多多商家账号”“当前登录抖店商家账号”），不得展示账号名、客户名、完整手机号、详细地址、凭证或 12 位以上连续订单数字。
- `partial/empty/ambiguous/blocked/failed` 必须在首屏说明；这些状态下仍交付的 Excel/JSON 只能称为原始采集产物，不等同于完整诊断成功。
- **采集成功必产报告（强制）**：任一店铺采集为 `done/rpa_partial`（含 RPA `pass_with_ignored`）时，必须走完报告生成与标准交付，产出 HTML 并以 `present_files` 收口；采集成功却未调用报告生成命令、或已生成 HTML 却后续流程中断无最终回复，均属流程未完成，须显式报错（`failed/report_generation_missing`），禁止静默结束或只回复采集产物路径。完成门禁 G1/G2/G3 见 `references/workflow-gates.md`「阶段 4 完成门禁」。
- 话术建议必须标注“人工审核草稿，未发送”；安全说明必须明确未执行任何生产写操作。
- 第5章中，优先回访工单为0时不展示该小节；只要识别到退款/退货/取消/投诉等流失风险买家，就必须按去重买家一一生成 `retentionPlans` 重点挽回卡片，包含买家、流失原因和开口话术，AI可优化但不得遗漏。每个流失风险买家还必须生成 `sessionReplays` 会话还原；报告默认折叠，并支持点击或键盘展开/收起。

## 边界场景

| 场景 | 必需行为 |
|---|---|
| 目标 `enable` 混合（例：用户要 6 个平台、只登录了 1 个店铺） | 自动跳过未登录店铺与无已登录候选的平台，只采集已登录店铺；在开工播报的「店铺 / 已跳过（未登录）」字段分别列出“店铺名（脱敏账号）”后直接继续，并在最终摘要保留这些登录缺口；禁止为登录状态调用 `ask_user`、禁止因此停止本次任务，也禁止静默把用户点名的未登录店铺换成同平台其它店铺 |
| 目标全部 `enable=false` 或全部平台无候选 | 停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。不再询问是否继续 |
| `waiting_for_user` | 仅限执行层因商家身份无法确认而暂停时使用；登录状态不得产生该状态，未登录店铺一律按上条自动跳过 |
| `login_failed` / `rpa_failed` | 停止该店分析，其他店可继续；摘要中记录缺口 |
| `rpa_partial` | 不重试 RPA；由 步骤 5 规范化判断是否可继续 |
| 有 `outputsPath` 但缺 `jsonOut/xlsxOut` | 报告 `failed/artifact_export_failed`，不能包装为成功 |
| 网页端只返回“请在客户端查看原始聊天记录” | 输出 `partial/browser_history_content_unavailable`，不得虚构消息或卡点 |
| 1688 本店作为买家的询盘会话 | 规范化阶段整段剔除，不计入卡点分析；过滤数量在首屏说明，全部会话均为买家方向时输出 `empty/no_seller_direction_sessions` |
| 抖店正文已采集 | 逐气泡输出（`__bubble_MM__text/__dir`）作为消息权威来源，按方向确定 role/sender；买家账号取汇总表“用户信息”列。允许进入逐句标注，但 `parsed=false` 或 `role=unknown` 内容不得做确定性角色/情绪/未成交归因 |
| 抖店旧产物只读到汇总表 | 输出 `partial/doudian_summary_table_only`，`messages` 为空；首屏注明“仅采集飞鸽历史会话汇总表，未采集逐句聊天正文”；禁止客户原声、逐句话术建议与“确定未成交原因” |
| 同平台多店聚合 | `merge-inputs.json` 每项必须携带 `shopName`，否则 fail-fast |
| 验证失败 | 不交付成功结论；先修复可修复问题并重跑相关校验 |

## 交付前自检

交付前高频门禁：采集成功必须产出 HTML；最终展示必须来自 `logs/present_files.json`；每店采集 JSON/XLSX 文件名必须含店铺名；失败不得包装为成功；报告和回复必须遵守脱敏边界。

校验命令与通过条件见 `references/workflow-gates.md` 步骤 10–11。
