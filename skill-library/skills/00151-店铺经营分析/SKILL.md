---
name: 国际站店铺经营分析
version: "1.3.0"
description: |
  分析 Alibaba.com 自有店铺的流量、商品、转化、交易、服务、员工与 CGS 星等级数据，生成日报、周报、月报、定向诊断、单指标回答或全量明细文件。
  适用于店铺经营分析、经营简报、经营波动、订单/商品表现、访客与员工数据、当前或历史 CGS 星等级；不用于商品写操作、外部市场选品、竞品、RFQ、税务或 IM 询盘导出。
  本 Skill 必须由当前 Agent 直接执行，禁止转发子代理。
enabled: true
triggers:
  - 店铺经营分析
  - 经营简报
  - 经营周报
  - 店铺诊断
  - 流量分析
  - 转化率分析
  - 订单分析
  - 商品表现
  - 访客数据
  - 经营数据
  - 星等级
  - 星级诊断
  - 定时经营报告
examples:
  - 帮我分析一下近 7 天店铺经营情况
  - 生成一份国际站经营周报
  - 最近流量下降是什么原因？
  - 我的当前评定星级和预测星级是多少？
  - 导出指定日期内所有成交商品明细
  - 帮我输出每日经营日报，每天早上 9 点发给我
excludes:
  - skill: alibaba-ads-marketing-analysis
    when: 用户只要普通广告账户/计划诊断、广告写操作、加品删品、暂停恢复或改预算
  - skill: alibaba-icbu-brand-data-report
    when: 用户只要品牌广告数据、同行对比、关键词效果、达标率或履约 CPC
  - skill: alibaba-market-analysis
    when: 用户要外部行业/市场全景、市场规模、竞争格局或进入策略
  - skill: alibaba-logistics-assistant
    when: 用户要查运费、物流轨迹、发货、HS 编码或关税
  - skill: alibaba-product-publish
    when: 用户要发品、发布商品、上架新品、URL 发品或草稿品发布
  - skill: alibaba-product-optimization
    when: 用户要修改商品标题、卖点、详情、价格或优化 listing
  - skill: alibaba-image-generation
    when: 用户要生图、改图、换主图、白底图、场景图或 AI 作图
  - skill: alibaba-product-video-generation
    when: 用户要做商品视频、生成视频或短视频创作
workflow: |
  1. 从原始 Query 一次性冻结 route、日期、内容范围和交付格式，并冻结 schedule_requested。
  2. 从本次实际加载的 SKILL.md 绝对路径取得 skill_root，从任务运行上下文取得 workspace_root；禁止搜索插件副本或猜测路径。
  3. `default_report` 只运行 skill_root 下固定的 run_default_report_workflow.py prepare|finalize；其他数据路由先校验 workctl >= 0.1.46。
  4. 严格执行本文件对应 route 的唯一数据动作，不跨 route 回退；Agent 只读取允许的小上下文或小回执。
  5. 先交付本轮结果，再按 schedule_requested 创建平台定时任务；没有真实任务回执不得声明创建成功。
---

# Alibaba.com 店铺经营分析

## 冻结运行根目录

- 将本次实际加载的 `SKILL.md` 所在目录记为 `<skill_root>`，直接使用加载结果提供的绝对路径；不得用 `find/list/ls/rg/grep` 搜索其他插件副本。
- 将平台提供的当前任务工作目录绝对路径记为 `<workspace_root>`；不得用 `$PWD`、命令替换或自行猜测。
- 根据当前平台选择可执行 Python，将其原样记为 `<python_executable>`。Windows 可为 `python.exe` 或 `py.exe`，macOS/Linux 可为对应 Python 3 可执行文件；禁止固定写死某一可执行名。
- `<skill_root>`、`<workspace_root>` 或 `<python_executable>` 任一不可确定时，报告环境错误并结束，不得切换插件副本或数据链。

## 冻结七路由

在任何业务调用前，根据用户原始 Query 冻结一个 route。报告、Excel、HTML 只改变交付格式，不能扩大分析范围。

| route | 识别方式 | 唯一数据动作 |
|---|---|---|
| `default_report` | 日报、周报、月报、经营简报、完整复盘 | 固定 Python 报告流水线 |
| `targeted_data` | 指定维度诊断、下降原因、定向分析 | `fetch-all-data` 后执行 `prepare-context --profile targeted_data` |
| `quick_answer` | 单指标或少量聚合值 | `fetch-all-data` 后执行 `prepare-context --profile quick_answer` |
| `detail_export` | 要求所有/全部/全量商品、订单、访客、员工清单或表格 | 绝对日期直接执行一次 `export-detail`；相对日期先执行一次 `get-date`，再执行一次 `export-detail` |
| `followup` | “为什么”“展开第二项”“导出刚才结果”等依赖当前会话的短追问 | 只复用当前会话 receipt/artifact；缺证据先澄清 |
| `star_rating` | 当前/预测星等级、升星缺口、双赛道、星级门槛或降星风险 | 直接调用 CGS 星等级动态命令并执行统一标准化脚本 |
| `out_of_scope` | 商品写操作、市场选品、竞品、RFQ、税务等 | 停止本 Skill 取数并给出正确路由 |

同时检测 `每天/每日/每周/每月/定时/自动/定期/每早/每晚/daily/weekly/monthly`，命中时冻结 `schedule_requested=true`、频率、时刻和时区。定时意图不改变 route，也不得延迟本轮即时交付。

`targeted_data|quick_answer` 把冻结计划写入 workspace 内的 JSON 后校验：

```text
<python_executable> "<skill_root>/scripts/validate_analysis_plan.py" --input "<plan.json>"
```

计划至少包含 `route`、`requires_full_fetch`、`agent_reads_brief_result` 和 `prepare_context=true`。`default_report` 与 `detail_export` 使用各自固定入口，不再写计划文件或调用校验脚本。

## 单 Skill、版本与上下文边界

- 一轮只能读取一个经营分析 Skill。普通自店经营分析只使用本 Skill。
- 禁止 `sessions_spawn`、`skill-executor` 或其他子代理转发。
- `default_report` 由固定包装器校验 workctl；`targeted_data|quick_answer|detail_export|star_rating` 在业务调用前恰好运行一次 `workctl --version`，解析到的语义版本必须不低于 `0.1.46`。版本缺失、格式不可识别或低于最低版本时，报告 `workctl_version_unsupported` 并结束。相对日期的 `detail_export` 在版本校验后还必须按下方契约执行恰好一次 `get-date`；这不是第二次版本检查。
- Agent 可见业务 JSON 不得超过 24576 bytes。禁止读取 `brief_result.json`、`.workctl_tmp/full_results.json`、Tier-2、完整分页文件、星等级原始响应或导出 JSON/XLSX；`star_rating` 只读取统一标准化脚本的输出。
- 完整结果只以小回执存在于会话：`status/output_path/row_count/pages_fetched/sha256`。
- `followup|out_of_scope` 不为满足流程而执行版本或日期命令。

## 日期真实性

- 数据参谋日期以 `workctl workflow analysis-brief get-date --format json` 的 `data_advisory_date` 为唯一最新分区；不得用系统 `today/yesterday` 替代。
- “昨天/最近一天/最新数据”映射到 `data_advisory_date`；最近 7 天、最近 30 天等窗口也以该日期为闭区间终点。
- `targeted_data|quick_answer` 中用户给出绝对日期时，数据参谋查询结束日不得超过 `data_advisory_date`；超过时说明并按可用截止日处理，不得声称分析了尚未落分区的日期。绝对日期的 `detail_export` 使用用户给出的具体范围直接导出，不执行 `get-date`、不改变范围，也不得把该范围描述为“最新分区”。
- 示例：若 `today=2026-07-06`、`yesterday=2026-07-05`、`data_advisory_date=2026-07-04`，用户问“分析昨天的数据”，数据参谋只能分析并声明更新至 `2026-07-04`，禁止写 `2026-07-05`。

## detail_export：低自由度执行契约

### 日期分支

先根据用户原始 Query 冻结日期类型，禁止在执行中切换分支：

- **绝对日期**：用户明确给出具体日期或起止日期。版本校验成功后不执行 `get-date`，直接执行一次 `export-detail`。保持用户给出的范围不变；只有 `trade` 为满足排他结束日契约，将用户给出的闭区间结束日转换为次日。最终只报告 CLI 回执，不把绝对范围描述为“最新数据”或“最新分区”。
- **相对日期**：用户使用“昨天/最近一天/最新数据/近 7 天/最近 30 天/近 N 天”等表达。版本校验成功后先执行恰好一次 `get-date`，成功解析可信日期后再执行一次 `export-detail`；禁止用系统 `today/yesterday`、任务当前日期或自行猜测值替代日期回执。

相对日期只允许按下列映射生成具体参数：

| 用户日期表达 | `get-date` 调用 | 闭区间起点 | 闭区间终点 |
|---|---|---|---|
| 昨天 / 最近一天 / 最新数据 | `workctl workflow analysis-brief get-date --format json` | `data_advisory_date` | `data_advisory_date` |
| 最近 7 天 | `workctl workflow analysis-brief get-date --format json` | `data_advisory_seven_days_ago` | `data_advisory_date` |
| 最近 30 天 | `workctl workflow analysis-brief get-date --format json` | `data_advisory_thirty_days_ago` | `data_advisory_date` |
| 最近 N 天（N≠1,7,30） | `workctl workflow analysis-brief get-date --days <N+1> --format json` | `n_days_ago["<N+1>"]` | `data_advisory_date` |

路由示例：

- 用户说“导出近 7 天全部成交商品”，若唯一 `get-date` 回执为 `data_advisory_seven_days_ago=2026-08-04`、`data_advisory_date=2026-08-10`，则执行一次 `export-detail --type trade --start-date 2026-08-04 --end-date 2026-08-11`。
- 用户说“导出 2026-08-01 至 2026-08-03 全部成交订单”，不执行 `get-date`，直接执行一次 `export-detail --type trade --start-date 2026-08-01 --end-date 2026-08-04`。

`get-date` 必须返回成功回执，且所需字段必须存在并符合 `YYYY-MM-DD`。回执失败、字段缺失或日期格式非法时立即结束：不得创建输出文件、不得调用 `export-detail`、不得改用系统日期或第二条数据链。对 `trade`，把上表闭区间终点的次日传给排他的 `--end-date`；其他类型直接传闭区间终点。两个日期分支都只允许调用一次 `export-detail`。

### 类型映射：按交付粒度选择

先判断用户希望结果中的每一行代表什么，再结合字段判断数据类型；字段名本身不作为唯一依据。

| 结果行代表 | 识别依据 | 数据类型 |
|---|---|---|
| 产品 | 主要列包含产品 ID、产品名称、商品负责人、商品效果指标；用户要产品参谋、商品效果或产品列表 | `product` |
| 全部订单 | 用户要全部/所有订单、订单号或订单号清单；每笔订单一行 | `trade --trade-status all` |
| 成交订单或订单商品 | 用户明确要成交、已支付或成交商品明细 | `trade` |
| 访客 | 每行代表一个访客或访客访问明细 | `visitor` |
| 员工/子账号 | 每行代表一个员工或子账号 | `account` |

`提交订单数`、`RTS 线上买家数`、`RTS 线上实收 GMV` 同时也是产品参谋的产品效果指标。当这些指标和产品 ID、产品名称一起出现，且用户要的是每个产品一行的结果时，选择 `product`。

泛指“订单”“订单号”或“订单号清单”时，选择 `trade --trade-status all`；只有用户明确要求成交、已支付或成交商品时才使用默认的 `trade` 成交口径。

当用户要求“未发货”或“待卖家发货”订单时，选择 `trade` 并在唯一一次 `export-detail` 调用中增加 `--trade-status undeliver`；CLI 会完成全量分页后按订单状态筛选，缺失字段仍保留列和空值。

如果用户同时要求“按产品汇总”和“每笔订单明细”，把它们识别为两个不同交付目标；无法确认主要交付粒度时，先询问用户希望“每个产品一行”还是“每笔订单一行”。

判断示例：

- “导出 7 月 14 日所有产品参谋数据，包含产品 ID、订单数和 RTS GMV” → 每行是产品，选择 `product`。
- “给我最近 1 个月的订单号” → 每笔订单一行，选择 `trade --trade-status all`。
- “导出最近 1 个月成交订单” → 使用成交口径，选择 `trade`。
- “导出 7 月 14 日全部成交订单，包含订单号、买家、产品 ID 和支付金额” → 每行是订单，选择 `trade`。
- “按产品汇总 7 月 14 日的提交订单数和 RTS GMV” → 每行是产品，选择 `product`。
- “导出近 7 天全部成交商品” → 沿用上方既有示例的订单商品口径，选择 `trade`；用户明确要求产品参谋、商品效果或按产品汇总时再按产品粒度判断。
- “导出成交商品以及每笔订单明细” → 同时存在产品汇总和订单明细两种粒度，拆分或追问，不根据“商品”或“成交”单个词判断。

只有 `trade` 的 `--end-date` 是按 `America/Los_Angeles` 业务日解释的排他结束日。用户说“2025-09-01 至 2026-08-09”时冻结为 `[2025-09-01, 2026-08-10)`；其他类型使用闭区间。

产品、订单、访客和员工明细统一执行一次 `export-detail`，输出路径使用 `<workspace_root>` 内不存在的新 `.xlsx` 文件，并显式传入同一根目录：

```text
workctl workflow analysis-brief export-detail --type <product|trade|visitor|account> --start-date <YYYY-MM-DD> --end-date <YYYY-MM-DD> --output-file "<workspace_root>/<明细名称>.xlsx" --workspace-root "<workspace_root>" --format json
```

表格型明细固定输出 XLSX。CLI 在一次调用内部完成对应类型的分页、完整性校验和原子落盘；`trade --trade-status all` 输出日期范围内的全部订单且每笔订单一行，默认 `trade` 保持成交过滤和商品补充。

`detail_export` 只执行上述一次 `export-detail` 并使用其回执。CLI 返回 `success` 时只展示 `output_path`，不打开工作簿自行去重或在聊天中列出全部订单号；`partial_success` 同时披露 `enrichment_status/warnings/missing_field_counts`；失败或 `source_complete=false` 时如实说明本次未生成可交付文件。

## default_report：固定 Python 流水线

日报、周报、月报只执行本次加载的 `<skill_root>` 内固定包装器。命令保持参数数组语义；下列展示为单行，路径均须加引号：

```text
<python_executable> "<skill_root>/scripts/run_default_report_workflow.py" prepare --workspace-root "<workspace_root>" --report-period <daily|weekly|monthly> --formats <markdown,html,xlsx> --output-dir "<workspace_root>/report_output"
```

包装器内部读取 `get-date` 的权威 T-2，并始终向 `collect-default-report-data` 传入冻结后的显式闭区间：默认日报为 `[T-2,T-2]`，默认周报为截至 T-2 的连续 7 天，默认月报为北京时间本月 1 日至 T-2。用户说“昨日”但未给绝对日期时，交付并称为“最新完整数据日 T-2”；月初 T-2 尚未进入本月时直接失败，不回退上月。用户显式区间的结束日晚于 T-2 时也直接失败，不缩短范围。

包装器同时完成运行时校验、完整数据落盘、AI 小上下文生成以及 manifest 密封；`collect-default-report-data` 直接复用原有 `fetch-all-data` MCP 采集器，Agent 按包装器返回的 `ai_content_context`、`ai_content_output` 与 `finalize_argv` 完成本轮报告。

Agent 读取 prepare 回执中的 `ai_content_context`，按约束写入 `ai_content_output`，并原样执行 `finalize_argv`；该数组完整承载本轮路径、日期和格式，是权威跨平台执行入口。

AI 内容只包含 `module_insights`、`visitor_actions`、`product_actions`。九个固定经营模块提供 `short_comment` 与 `long_comments`；星等级可用且已开启时，prepare 额外提供 `star` 模块，未开启或取数失败时不得生成 `star`。`star.long_comments` 固定四条，依次为评定/预测与生效赛道总结、准入门槛结论、降星风险判断、基于最大缺口或相对落后的建议动作。`short_comment` 为 2–6 个可见字符的标签式短评。finalize 第一次调用就执行宽松清洗并直接渲染：自动清洗格式和条数、替换无事实支持的数字、忽略未知 ID，并在 AI 文件缺失或无效时使用规则解读。

HTML、Markdown、XLSX 独立渲染；单个格式失败时保留其他成功产物并返回 `delivered_partial`，全部失败时返回可重试错误。`runtime_version_mismatch` 时重新 prepare。finalize 成功后使用本轮日期字段、AI 上下文和已校验附件完成用户请求。

## star_rating：CGS 星等级独立查询

该 route 只使用已经注册的动态命令，不执行 `get-date`、`fetch-all-data`、CRM 诊断或 default report 流水线。当前星等级查询不传任何业务参数：

```text
workctl icbu advisor icbu-starrating-cgs-pc-page-data-open --output "<workspace_root>/star_rating_raw.json" --format json
<python_executable> "<skill_root>/scripts/star_rating_contract.py" --input "<workspace_root>/star_rating_raw.json" --output "<workspace_root>/star_rating_context.json"
```

只有用户明确给出 `YYYY-MM-DD` 并要求历史星级时，第一条命令增加 `--statDate <YYYY-MM-DD>`。用户只说“上月”“之前”但没有唯一日期时先询问具体日期，不自行选择月初、月末或经营报告 T-2。

Agent 禁止读取 `star_rating_raw.json`，只读取 `star_rating_context.json`，并按 `references/domain-store-supply.md` 回答用户指定问题。当前正式评定星级、自然外显星级、当前预测星级和双赛道各自使用标准化模型中的独立字段；接口失败、星级未开启、单赛道缺失或字段为 `null` 时如实说明，不用样例值或其他店铺数据补齐。

## targeted_data 与 quick_answer

先执行一次 `get-date`，再将 `data_advisory_date` 原样传给取数命令；所有路径绑定在 `<workspace_root>/analysis_brief_output`：

```text
workctl workflow analysis-brief get-date --format json
workctl workflow analysis-brief fetch-all-data --data-advisory-date <data_advisory_date> --brief --output "<workspace_root>/analysis_brief_output/brief_result.json" --format json
workctl workflow analysis-brief prepare-context --profile <targeted_data|quick_answer> --max-bytes 24576 --input "<workspace_root>/analysis_brief_output/brief_result.json" --output "<workspace_root>/analysis_brief_output/agent_context.json" --format json
```

Agent 只读取 `agent_context.json`，禁止读取 brief、Tier-1、Tier-2 或 full results。`quick_answer` 只返回指标、日期口径和必要解释；`targeted_data` 只分析用户指定维度，不补齐完整经营报告。

仅当 `targeted_data` 明确要求文件时按需读取一个对应的本 Skill 独占 reference：

- HTML：`references/targeted-html-output.md`
- Excel：`references/targeted-excel-output.md`
- 聊天/Markdown：`references/targeted-response-template.md`

`quick_answer` 默认不读取报告 reference；只有用户明确要求文件时才按交付格式读取一个对应的 `targeted-*` 文件。`default_report` 不读取上述文件，也不读取兼容共享 reference。

## followup

只使用当前会话已有的小回执或已交付产物。缺少可复用证据时询问“你指的是哪一份结果/哪一项”。禁止为了补上下文重新执行 `fetch-all-data`、读取历史大文件或重跑明细导出。

## out_of_scope 与混合请求

停止本 Skill 对越界部分取数并给出正确路由：

- IM 询盘导出：`alibaba-chat-and-analysis`
- 商品发布：`alibaba-product-publish`
- 商品修改：`alibaba-product-optimization`
- 外部市场：`alibaba-market-analysis`
- 竞品：`alibaba-competitor-analysis`
- RFQ：`alibaba-rfq-discovery`
- 物流操作：`alibaba-logistics-assistant`

混合请求只完成可做的自店经营分析部分，不把越界数据混入报告。

## 定时任务

- `schedule_requested=false` 时不主动创建，也不在首次报告后追加定时引导。
- `schedule_requested=true` 时先完成本轮即时取数和交付，再使用当前平台提供的定时任务能力创建任务；禁止用系统 shell cron。
- 任务内容保存用户原始经营分析意图、冻结 route、相对周期和交付格式，不固化本轮绝对日期；每次执行时重新取得 `data_advisory_date`。
- 使用用户明确时区；用户未提供时使用当前会话/平台时区。频率或时刻无法唯一确定时先澄清，不猜测。
- 只有真实回执包含任务 ID 和调度信息时才说明创建成功；创建失败时如实说明，已经交付的即时报告仍保持成功。

## 领域下钻 references

`detail_export` 继续使用固定包装器。`targeted_data` 涉及交易接口参数、订单状态或交易字段时读取 `domain-trade-logistics.md`；其他场景在小上下文不足以解释口径时读取一个最相关文件：流量 `domain-flow.md`、商品 `domain-product-effect.md`、转化 `domain-conversion.md`、访客 `domain-traffic-buyers.md`、员工 `domain-account.md`、广告 `domain-ads.md`、服务 `domain-service.md`。每次选择一个最相关的领域 reference，并沿用冻结计划中的命令。

## 文件交付唯一契约

- `default_report` 的 finalize 成功回执以 `delivery` 为附件交付依据；`delivery.tool=present_files` 且 `delivery.arguments.files` 非空时，将整个 `delivery.arguments` 原样传给 `present_files`，路径和 label 均沿用该对象。
- `targeted_data|quick_answer` 使用本轮成功渲染回执中的绝对产物路径，`detail_export` 使用成功回执中的 `output_path`；多个文件统一组成一次 `{"files":[{"path":"<absolute_output_path>","label":"<用户可见文件名>"}]}` 调用。
- `default_report` 在 finalize 成功后按原始 Query 组织回复，并明确报告区间 `start_date` 至 `end_date`、平台最新完整数据日 `data_advisory_date`（T-2）：
  - 普通报告：给出日期口径、核心结论和附件。
  - 附带问题：基于本轮 `ai_content_context` 逐项回答，再交付附件。
  - 聊天全文：从 `delivery.arguments.files` 中的 Markdown 路径按每段不超过 8 KiB 读取至 EOF，依次合并成一份正文，再交付附件。
- 日报、周报、月报涉及今日、昨日或尚未落入完整分区的日期时，向用户说明数据参谋当前只完成至 `data_advisory_date`（T-2）的数据分区，T-1 与 T 日数据仍在更新，因此本次采用 `start_date` 至 `end_date`；周报和月报的结束日同样以该最新完整数据日为准。
- finalize 没有合法附件回执时，最终回复说明该回执返回的实际失败状态或缺失格式。
- `present_files` 失败时，最终回复使用本次工具错误说明结果；后续用户重试从新的成功回执继续。

## 数据真实性与交付

- 工具无数据时写“暂无数据”，不得补造数值、链接、主图、型号、行业基准或原因。
- 区分事实、推断与建议；相对评价不得推算行业绝对值。
- 使用 B2B 术语（询盘、RFQ、信保订单、交期、起订量），避免购物车、加购、好评率等 B2C 词汇。
- 只有命令成功、文件存在且回执哈希有效才展示文件。
- 上游失败时报告真实的小错误；禁止交付残缺文件、把部分结果说成完整结果或进行开放式修复探索。
