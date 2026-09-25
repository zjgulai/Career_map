---
name: multi-platform-review-reply
displayName: 多平台评价自动回复
displayDescription: 采集淘宝、天猫、抖店、京东、拼多多及1688的商品评价，默认覆盖全部评价并可按时间、回复状态和正负面筛选；汇总 Excel、输出投诉点与质量问题分析，只有未回复评价可在确认后安全提交回复。
description: 处理 PDD/拼多多、JD/京东/京麦、Taobao/淘宝/千牛、Tmall/天猫、Doudian/抖店的商品评价采集（默认全部评价，可筛选时间、商家回复状态全部/已回复/未回复、正面/负面）、分析、回复草稿和已确认回复提交，并支持1688当前账户收到的评价只读采集与分析。自动回复候选仅限未回复评价；已回复/全部采集只用于查看与分析。适用于评价管理、评价投诉点与质量问题汇总、回复建议和基于确认的回复；天猫（platformId=tmall）是独立平台并只使用 tmall DSL；1688不支持草稿或回复提交，任何平台均不得未经确认提交。
metadata:
  version: 1.0.0
  pattern: tool-wrapper + pipeline + inversion + reviewer + generator
---

# 全平台评价采集、分析与安全回复

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 工具执行，脚本路径与传参路径先展开为绝对路径。

## 目录

1. 运行护栏
2. 回复提交门禁
3. 进度清单
4. 用途
5. 决策点
6. 工作流
7. 资源
8. 输出契约
9. 关键易错点
10. 边界情况


> 路径基准：本文所有 `references/`、`scripts/` 相对路径均以本 `SKILL.md` 所在技能目录为 `skillRoot`。若资源不存在，停止并重新定位 `skillRoot`；不得回退到历史目录、插件根或猜测路径。

## 运行护栏

任何操作在创建运行目录、登录、采集、起草或回复前，必须先通过以下预检规则：

- 加载 `references/execution-guardrails.md`，并遵守固定脚本、RPA、工作簿、隐私、确认和回复身份边界。
- **主 Agent 执行**：当前主 Agent 必须在当前会话中直接执行本技能全流程。严禁调用 `functions.sessions_spawn`，不得使用 `agent`、`general`、多会话或其他子 Agent 机制来执行任一平台任务/阶段/门禁；不得以并行执行、任务拆分、浏览器操作、耗时较长或上下文隔离为理由派出子 Agent。子 Agent 不能替代本 Skill 的门禁、停止规则和本次运行目录约束；需要并行只读采集时，只能由当前主 Agent 在同一轮直接发起多个 `browser_rpa_launch` 调用实现，而非派出子 Agent。
- 解析平台、筛选、数量、时间参数或操作模式前，加载 `references/request-parsing.md`、`references/platform-adapters.json` 和 `references/platform-scope-mapping.md`。
- 当请求包含不支持的平台时：全部平台不支持则在第 1 阶段前停止；混合请求自动只处理支持平台，并在回复与最终报告中明确列出被跳过的平台，不等待用户许可。
- 不支持的筛选或参数：自动忽略并记录 `unsupported_filter` / `unsupported_parameter`（含平台与用户原文），在报告与摘要中说明后继续执行支持部分，不为此打断用户；不得映射到近似合法选项。
- 打断边界：只读采集/分析阶段允许的打断项只有**平台范围**与**店铺范围消歧**。**平台意图不明确时先追问平台**（未提任何平台且无法从店铺名 / URL 唯一推导时，必须在账号发现之前 `ask_user(mode="form")` 只问平台，选项含「全部平台」，禁止默认全平台继续），平台确定后再处理店铺。**店铺范围消歧为硬门禁，只按已登录（`enable=true`）候选判定**：某平台已登录候选店铺 `N_on≥2` 且用户本轮未唯一指定（只给平台名、未点名具体店铺、也未说"全部店铺"）时，**必须**调用 `ask_user(mode="form")` 让用户从该平台已登录候选「店铺名（脱敏账号）」中选择（含"全部店铺"选项），用户选择前不启动 RPA；**禁止**默认全跑、默认取第一个，或用普通文字/Markdown 表格/编号列表代替表单。`N_on=1` 或用户已唯一指定（含明确"全部店铺"）时不打断。`<active_store>`、历史店铺、路由注入信息一律不算用户已指定。**登录缺口不再是打断项**：目标 `enable` 混合、某平台无已登录店铺或无候选时，按与上条不支持平台相同的口径自动只处理已登录店铺，并在回复与最终报告中列出被跳过项，不等待用户许可。其余有默认值的参数（评价范围、回复状态、时间、数量、操作模式）一律取下文默认值并提示后继续。回复提交属写操作，商家确认门禁不属于可省略范围。
- 开工播报（硬规则）：目标锁定后、启动首个只读采集 RPA 之前，必须按 `../multi-platform-intention-router/references/common/kickoff-briefing-contract.md` 播报**恰好一次**并在同一轮直接继续执行；禁止用 `ask_user` 承载，其余禁令见契约 §5。字段口径：周期 = 本轮评价时间范围（未限定时写“全部评价，未限定时间”）；动作 = “进入商家后台采集商品评价” + 本轮评价范围与回复状态筛选；交付 = “评价汇总 Excel（含分析 / 回复草稿时一并列出），保存到本次会话工作目录；提交回复前仍会单独找你确认”。开工播报**不替代、也不前移到**商家确认门禁之前。
- 只使用本次运行中渲染器成功输出的 stdout JSON `output` 字段给出的 DSL 路径。

## 回复提交门禁

任何回复提交前：

- 必须通过 `ask_user(mode="form")` 取得商家对“具体平台 / 订单 / 评价 -> 具体回复文本”的明确确认，或取得在已确认范围内使用 Agent 草稿的明确授权；禁止用普通文字、Markdown 表格或「请回复确认」句式代替表单。
- 只能通过 `scripts/prepare-confirmed-replies.py --scope-json` 生成 `confirmed-replies.json`。
- 只能基于有效确认凭证提交；不得编辑、翻译、缩短或重新生成已确认的回复文本。

## 进度清单

每次运行都使用此运行清单；详细动作和通过条件见 `references/workflow-gates.md`。

- [ ] 请求解析门禁
- [ ] 运行工作区门禁
- [ ] 适配器计划门禁
- [ ] 账号登录门禁
- [ ] 只读采集门禁
- [ ] 提取与工作簿门禁
- [ ] 回复草稿门禁（如需起草）
- [ ] 评价分析门禁（如需分析报告）
- [ ] 商家确认门禁（如需提交回复）
- [ ] 回复提交门禁（如需提交回复）
- [ ] 标准交付门禁
- [ ] 最终报告门禁

长时间运行时，在 `review_reply_runs/<run_id>/logs/progress.md` 中镜像当前分支，并在每个门禁通过后更新。

## 用途

本技能是 PDD、京东/京麦、淘宝/千牛、天猫、抖店商品评价采集、评价内容分析和评价回复的唯一入口，也负责1688当前账户「收到的评价」只读采集与分析。前五个平台可生成回复草稿，并且只在商家明确确认后提交；1688只允许 `collect_only` 和 `collect_and_analyze`，不生成或提交回复。

天猫是独立平台（账号管理 `platform=platformId=tmall`）：目标为天猫记录时只使用 `references/rpa-dsl/tmall/` 的 tmall DSL（情感分类筛选 + 搜索），页面结构不符时报 `ui_obstructed` 并停止本平台，禁止降级到 taobao 适配器；`platformId=taobao` 的记录仍走 taobao 适配器（强制使用原淘宝流程，已移除天猫兼容）。

不要用本技能处理清单外平台、平台导出/下载、平台 AI 回复、历史单平台评价技能，或任何未经确认的自动回复。1688页面没有评价时间筛选，任何自定义时间请求都必须作为不支持参数处理。

## 决策点

| 用户信号 | 操作或停止类型 | 工作流分支 |
|---|---|---|
| “看下未回复评价”, “导出评价”, “只采集” | `collect_only` | 解析 -> 工作区 -> 适配器计划 -> 账号登录门禁 -> 采集 -> 工作簿 -> 交付 -> 最终报告 |
| “汇总高频投诉点”, “总结质量问题”, “分析差评原因” | `collect_and_analyze` | `collect_only` 分支 -> 评价分析 -> 交付 -> 最终报告 |
| “帮我回复评价”, “差评处理”, “生成回复建议” | `collect_and_draft` | `collect_only` 分支 -> 草稿 -> 交付 -> 停止等待确认 |
| “确认提交这些回复”, “按表中确认内容发布” | `reply_confirmed` | 确认 -> 串行提交 -> 交付 -> 最终报告 |
| “重试失败的回复”, “恢复上次失败” | `recovery` | 恢复 -> 串行提交 -> 交付 -> 最终报告 |
| 包含不支持的平台 | 预检停止或自动跳过 | 全部不支持时报告不支持平台和支持列表并停止，不得创建运行目录；混合请求自动只处理支持平台并列出被跳过平台 |
| 包含不支持的筛选/参数 | 记录并跳过后继续 | 记录具体不支持项，在报告与摘要中说明，不询问用户 |

默认值：未指定平台属于平台意图不明确，必须先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），用户选「全部平台」后才处理六个受支持平台（以账号管理中实际存在的店铺为限），禁止未追问就默认全平台；未指定评价范围表示 `all`（全部评价）；未指定回复状态表示 `replyStatus=全部`（淘宝/天猫/JD/PDD/抖店三选，1688 仅 `全部`）；未指定时间表示全部时间。**除 1688 外所有平台都支持任意自定义起止日期区间**：淘宝/天猫可选 `7/30` 天预设**或任意自定义起止日期**，抖店可选 `7/14/30` 天（近7天/近14天/近1个月）**或任意自定义起止日期**，PDD 可选 `30/90/180` 天**或任意自定义起止日期**，JD 支持**任意自定义起止时间**（JD-Design RangePicker：渲染器拆派生 token 填面板 4 输入框→点面板底部『确定』→断言回显）或平台默认范围，1688 页面无任何时间筛选控件、不支持任何时间筛选。`negative`（负面）= 中性+负面（天猫 `中性评价+负面评价`，淘宝/JD/抖店 `中评+差评`，PDD `不满意` 单聚合，1688 四至一星）；`bad` 保留单纯差评语义以兼容。只有 `replyStatus=未回复` 的采集结果可进入草稿/确认/提交候选；`已回复`/`全部` 采集可分析但不可进入自动回复候选。未指定操作时默认 `collect_only`；用户明确要求内容分析时为 `collect_and_analyze`，明确要求生成回复建议时才进入 `collect_and_draft`。除非同时存在当前工作簿和明确商家确认，否则不得推断为 `reply_confirmed`；1688永远不得进入回复确认或提交。

只有用户对评价内容提出归纳诉求（投诉点、原因、质量问题、占比、趋势）时才进 `collect_and_analyze`；只要数据或只问数量属于 `collect_only`，要求回复则属于 `collect_and_draft`。

## 工作流

1. **请求解析门禁**: 加载 `request-parsing.md`、`platform-adapters.json` 和 `platform-scope-mapping.md`；解析平台范围、评价范围、筛选、数量、时间参数和操作。
2. **运行工作区门禁**: 仅在不支持的平台/参数检查通过后，创建 `review_reply_runs/<run_id>/`。
3. **适配器计划门禁**: 展开每个平台/筛选的适配器运行，并验证每个适配器文档、manifest 和 DSL 文件存在。
4. **账号登录门禁**: 加载 `references/account/account-integration.md`；按解析出的 `platforms` 映射出的非空 `platformIdList`（`doudian → dy`）调用一次 `discover_store_accounts` 并复用完整 `accounts[]` 结果，禁止零参数与空数组；用户平台意图不明确时必须先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再发起账号发现，禁止默认全平台继续；**再做店铺范围消歧**——某平台**已登录**候选店铺 `N_on≥2` 且用户未唯一指定时必须 `ask_user(mode="form")` 选择目标店铺（含"全部店铺"选项）；未登录目标与无已登录候选的平台自动跳过并列明（不追问、不停止），只对已登录目标放行，并在后续 Browser Tool 顶层传入同条记录的三个 Profile ID；本步完成后、进入第 5 步前先按本文「开工播报」硬规则播报一次。
5. **只读采集门禁**: 加载平台适配器文档和 manifest，仅通过固定脚本渲染 DSL，启动只读 RPA，并保留准确的 `outputsPath`。
6. **提取与工作簿门禁**: 仅用 `scripts/extract-rpa-reviews.py` 读取 RPA 输出；通过固定脚本构建并验证工作簿。
7. **回复草稿门禁**: 对于 `collect_and_draft`，生成安全回复策略和草稿，针对平台回复规则运行一次有界的 `起草 -> 审阅 -> 修复 -> 复审` 循环，将草稿写入工作簿，交付一次后停止等待确认。
8. **评价分析门禁**: 对于 `collect_and_analyze`（或用户额外要求分析），加载 `references/analysis-report-contract.md` 和完整 `assets/schemas/review-analysis-report.schema.json`；标准字段使用 `qualityFindings[].body`、`recommendations[].reason`、`recommendations[].expected`。写出 `analysis-report.json` 后先运行 `--validate-only`，通过后才正式渲染；样本不足时必须声明不构成「高频」。差评少不得不分析：中差评 ≤2 条时 `operation` 仍为 `collect_and_analyze`，维度饼基于全部有文字评价（含好评）必填，投诉点/质量/建议三段可留空由渲染器走小样本空态。
9. **商家确认门禁**: 用 `scripts/prepare-confirmed-replies.py --scope-json` 将明确确认转换为 `confirmed-replies.json`；不得编辑已确认回复文本。
10. **回复提交门禁**: 基于确认凭证渲染批量回复 DSL，并按 `pdd -> jd -> taobao -> tmall -> doudian` 平台顺序串行提交。
11. **标准交付门禁**: 用 `scripts/render-review-analysis-report.py` 整轮只渲染一份聚合报告 `评价分析报告.html`（非分析模式下分析四段为空占位，禁止按平台/按店拆成多份），逐店调用 `spec_delivery.py` 复用同一份报告，聚合 `present_files`（报告去重后只展示一份），并且只展示 `logs/present_files.json` 中的文件。
12. **最终报告门禁**: 报告标准运行目录、平台数量、草稿/确认数量、提交状态汇总和跳过的平台；绝不暴露隐私标识。

## 资源

始终加载：

| 资源 | 加载时机 |
|---|---|
| `references/execution-guardrails.md` | 任何业务执行前加载；用于硬性安全边界和禁止动作。 |
| `references/request-parsing.md` | 解析用户请求或判断不支持的平台/筛选/参数行为前加载。 |
| `references/platform-adapters.json` | 展开适配器、验证筛选、选择脚本路径或检查无数据策略前加载。 |
| `references/platform-scope-mapping.md` | 映射平台别名、历史单平台名称、评价范围和时间参数时加载。 |
| `references/workflow-gates.md` | 每次运行期间加载；它是门禁流水线和通过条件来源。 |

按操作加载：

| 资源 | 加载时机 |
|---|---|
| `references/script-usage.md` | 调用任何打包 Python 脚本或解释其 stdout 契约前加载。 |
| `references/analysis-report-contract.md` | 写 `analysis-report.json`、渲染分析报告 HTML 或判定空分析降级行为前加载。 |
| `assets/report-template.html` | 渲染分析报告时作为模板（样式基线与 chat-analysis 同源，禁止单侧手改）。 |
| `references/review-reply-contract.md` | 写入 `workbook-plan.json`、确认回复、恢复或交付输出前加载。 |
| `references/account/account-integration.md` | 账号发现、登录状态检查、Profile 选择或账号计划状态处理前加载。 |

按平台加载：

| 资源 | 加载时机 |
|---|---|
| `references/pdd.md` | PDD 采集或 PDD 回复提交前加载。 |
| `references/jd.md` | 京东/京麦采集或回复提交前加载。 |
| `references/taobao.md` | 淘宝/千牛（`platformId=taobao`）采集或回复提交前加载。 |
| `references/tmall.md` | 天猫（`platformId=tmall`）采集或回复提交前加载；只用 tmall DSL，禁止降级。 |
| `references/doudian.md` | 抖店采集或回复提交前加载。 |
| `references/1688.md` | 1688只读评价采集或分析前加载；禁止进入草稿/确认/提交。 |
| `references/rpa-dsl/<platform>/manifest.json` | 渲染该平台的采集、分页或回复 DSL 前加载。 |

仅审计时加载：

| 资源 | 加载时机 |
|---|---|
| `references/legacy-skill-integration.md` | 仅在迁移审计或历史行为对比时加载。 |

## 输出契约

最终面向用户的输出只能包含：

- 每个店铺的标准交付 `runDir` 绝对路径。
- 各平台筛选条件和采集数量。
- 分析报告是否包含投诉点汇总与质量结论（`collect_and_analyze` 必报）。
- 草稿数量和确认数量。
- 成功、失败、不确定、人工处理和未尝试数量。
- 跳过的平台及准确原因。

不得包含完整订单号、买家昵称、电话号码、地址、凭证、验证码、原始页面文本或手工选择的文件列表。

> 弹窗防御（离线烘焙、固化产物）：进入页 goto 的弹窗关闭 after 已固化在 `references/rpa-dsl/<平台>/*.dsl.json` 的 goto 内（翻页类 `*-next-page.dsl.json` 无 goto，本就无需）；`render-rpa-dsl.py` 运行时零依赖，渲染只做 token 替换。**新增/升级弹窗规则时，用外部 `rpa-dsl-hook-converter` skill 重新烘焙这些 DSL**；本仓库不内置 convert_hooks/hooks.json。

## 关键易错点

| 风险 | 可观察故障 | 安全替代方案 | 停止条件 |
|---|---|---|---|
| 店铺范围未消歧就执行 | 某平台有多个已登录店铺、用户只给平台名，却默认全跑/取第一个，或用普通文字/Markdown 表格让用户回复选择 | 账号登录门禁先判定已登录候选店铺数 `N_on`；`N_on≥2` 且用户未唯一指定时用 `ask_user(mode="form")` 选择（含"全部店铺"选项） | 未消歧前停止；不启动 RPA |
| 把登录缺口当成打断项 | 用户要多个平台、只登录了一个店铺时弹表单或直接停止，任务中途中断 | 自动跳过未登录目标与无已登录候选的平台，只处理已登录店铺，并在回复与报告列明被跳过项 | 仅当全部目标未登录时引导登录并停止 |
| 错误的 `skillRoot` | 必需的引用、脚本或 DSL 路径不存在 | 重新定位此 `SKILL.md` 并基于它重建路径 | 停止；不得使用插件根目录、旧技能文件夹或猜测路径 |
| 过期渲染 DSL | 渲染器失败，但旧运行中存在同名 DSL | 仅在 `status=ok` 后使用当前渲染器 stdout JSON 的 `output` | 达到文档化重试上限后停止该平台 |
| 确认不明确 | 批准缺少准确范围或回复文本 | 构建确认范围 JSON，并让 `prepare-confirmed-replies.py` 验证 | 在回复提交前停止 |
| 直接读取原始 RPA 输出的诱惑 | 缺失的工作簿字段看似可从 `outputs.json` 恢复 | 只使用打包提取器，必要时将缺失字段标记为人工处理 | 停止；永远不得直接读取原始输出 |
| 把已回复/全部采集当回复候选 | 对已回复或含待识别行的评价生成草稿并提交 | 只有 `replyStatus=未回复` 且无待识别的行才进入草稿/确认/提交 | 停止并转人工处理 |
| 把部分完成包装成完成 | 含待识别行（`markers=pending`/`completeness=partial`）却报告“采集完成” | 摘要如实展示 `pendingCount`、`emptyTextCount`、完整性；报告按 partial 呈现 | 禁止宣称 complete；按部分完成交付 |
| 报告 model 字段凭记忆生成 | 使用 `detail/basis/benefit` 导致正式渲染才失败 | 生成前读取完整 Schema；使用 `body/reason/expected`；先跑 `--validate-only` | 预检未通过不得正式渲染或交付 |
| 差评少就不分析 | 报告四章全是空占位，连维度饼与数量骨架都看不到 | 保持 `operation=collect_and_analyze`；`dimensionPie` 按全部有文字评价（含好评）必填；三段留空走小样本空态 | 不得为绕校验把 `operation` 降为 `collect_only` |
| 淘宝/天猫分页选择器写错 | 用 `.next`/文本兜底翻页，取不到后续页或在末页死点超时 | 用真实按钮类 `.next-pagination-item.next-next:not([disabled])`，末页按钮带 `disabled` 自动停止 | 禁止文本兜底翻页；分页内嵌于首屏采集 DSL |
| 天猫采集缺控件水合等待 | 全部时间路径（无日期档）下「打开情感分类下拉」点击 15s 超时、后续步骤被跳过；带日期档时因日期步骤提供缓冲而"偶然通过"，掩盖缺陷 | 采集与回复模板在「打开情感分类下拉」前均须含 `等待情感分类控件水合`(waitFor **仅** `input[role='combobox']` 可见，不含 span 兜底，确保真正等到 combobox 水合)+`等待筛选控件水合`(waitTimeout 1500ms)，与 manifest `positioningRules.filter` 一致；打开下拉步骤 `input` 优先、`span` 兜底；两步不属日期/回复剥离前缀，all/预设/自定义档均保留 | 缺水合步骤时禁止直接点下拉；改版再引入类似控件先补水合等待再点击 |
| 淘宝筛选区按钮文案随平台改版失效 | 原淘宝评价页重置按钮文案已由「重置」改为「清除条件」，旧 `重置` 定位器 `LOCATOR_NOT_FOUND`，整轮 RPA `partial`、阻断 HTML 生成 | `重置原淘宝评价筛选` 已优先命中 `清除条件`（`(//button[.//*[normalize-space(.)='清除条件'] or normalize-space(.)='清除条件'])[1]`）并保留 `重置` 兜底、`onError:continue` | 该步已容错不阻断；平台再改版时先用只读探测核对真实文案再更新定位器 |
| 商品链接/主图门控过粗致误报 partial | 只按「评价行存在」门控媒体读取，纯追评行/无链接行虽有 `onError:continue` 仍以 `LOCATOR_NOT_FOUND` 收尾，把整轮拉成 `partial` 阻断 HTML | `render-rpa-dsl.py` 已把每个媒体读取嵌套门控在「该媒体元素自身存在」上，无元素的行整体跳过、不产生 issue | 商品链接/主图为尽力而为字段，缺失属正常，不得因此判失败 |

## 边界情况

- **未指定平台**: 平台意图不明确，必须在账号发现之前用 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选）；用户选「全部平台」后才处理六个受支持平台，1688分支只读。禁止未追问就默认全平台。
- **同平台多店铺且用户未指定店铺**: 某平台在账号管理中有 `N_on≥2` 个**已登录**候选店铺、而用户只给出平台名（如"看下抖店评价"）未点名具体店铺、也未说"全部店铺"时，属于店铺范围歧义，**必须**在账号登录门禁用 `ask_user(mode="form")` 让用户选择目标店铺（单选/多选，含"全部店铺"选项）；不得默认全跑或默认取第一个，不得用普通文字或 Markdown 表格代替表单。`N_on=1` 或用户已唯一指定（含明确"全部店铺"）时不打断。
- **天猫与淘宝身份**: 平台键只能等于目标账号记录的 `platformId`。`tmall` 记录只跑 tmall DSL、不降级；用户说“天猫”但账号管理中只有 `taobao` 记录时，先说明该店当前绑定为淘宝账号，用户确认后才按 taobao 适配器继续。
- **未指定评价范围**: 默认使用 `all`（全部评价）；天猫 `all` 展开为情感分类 `全部` 单次运行，视图内「情感识别中」行保留为 `待识别`；`negative`（负面）展开为 `中性评价 + 负面评价`；`bad`（单纯差评）展开为 `负面评价`；1688 `all` 为 `全部`，`negative`/`bad` 展开为四星、三星、二星、一星四个串行筛选。
- **时间参数默认全部时间**: 除 1688 外所有平台均支持任意自定义起止日期区间。淘宝/天猫支持 `all`（默认）/`7`/`30` 预设**及任意自定义起止日期**（`--taobao-date-start/--taobao-date-end`，淘宝须追加搜索提交，与预设档互斥），抖店支持 `all`（默认）/`7`/`14`/`30`（近7天/近14天/近1个月）**及任意自定义起止日期**（`--doudian-date-start/--doudian-date-end`，与预设档互斥），PDD 支持 `all`（默认，不再默认近30天）/`30`/`90`/`180` **及任意自定义起止日期**（`prepare-pdd-collection.py --date-start/--date-end`，自愈式翻月，与预设档互斥），JD 支持**任意自定义起止时间**（`--set __START_DATETIME__/__END_DATETIME__`，JD-Design RangePicker：渲染器拆派生 token 填面板 4 输入框→点面板底部『确定』→断言回显）或平台默认范围（`--use-platform-default-date`），1688 页面无任何时间筛选控件、仅 `all`（`7`/`30` 天及任何自定义时间明确不支持）；1688 的任何时间请求记为 `unsupported_parameter`。
- **未指定操作**: 所有平台默认 `collect_only`；明确要求分析时为 `collect_and_analyze`，明确要求回复建议时才为 `collect_and_draft`（1688不支持草稿）。
- **回复状态与回复候选**: 默认 `replyStatus=全部`；淘宝/天猫通过 `render-rpa-dsl.py --qianniu-reply-status` 支持 `全部/已回复/未回复`，JD/PDD/抖店同样支持 `全部/已回复/未回复` 三选（默认 `全部`），1688 回复状态仅 `全部`（`已回复`/`未回复` 明确不支持）。`已回复`/`全部` 采集结果可分析但不可进入自动回复候选；只有未回复记录可草稿/确认/提交。回复执行（提交 DSL）时固定未回复筛选。
- **部分完成不可包装为完成**: 提取摘要 `markers=pending`（含天猫待识别行）或 `completeness=partial` 时，该平台运行按部分完成记录并在报告如实展示，不得包装为 `complete`；待识别行转人工处理，不进入自动回复候选。
- **分页口径**: 千牛分页文案 `X/Y`（如 `1/1`）的 X 是当前页码、Y 是总页数，不是总条数；总条数以 `*_review_total` 为准。
- **中差评极少或为 0**: 中差评总数 ≤2 条时仍按 `collect_and_analyze` 完成分析：`conclusions` 显式说明属个案、不构成「高频」，`dimensionPie` 按全部有文字评价（含好评）给出，投诉点/质量/建议三段可留空，由渲染器输出小样本结构化空态（章节导语 + 真实数量卡 + 个案处理指引）；禁止为绕校验把 `operation` 降为 `collect_only`，也禁止编造投诉点。
- **分析无有效样本**: `collect_and_analyze` 下采集为 0 或全部评价无文字内容时（完全无有效样本），model 的 `operation` 降为 `collect_only`，在 `conclusions` 与 `platforms[].note` 里写明无法归因；顶层 `scope` 已下线，不得写入，其余分析段置空走降级占位；不得编造投诉点，并在最终汇报中说明未能完成分析的原因。
- **不支持的平台**: 在创建运行目录前停止，除非用户确认仅继续处理支持的平台。
- **无数据**: 记录 `status=collected`、`collectedCount=0`、`completeness=complete` 和 `type=no_data`；不要当作失败。
- **渲染失败**: 不要启动；修正参数并最多重试一次，然后将该平台标记为失败。
- **天猫页面结构不符**: 无『情感分类』下拉或无『搜索』按钮时，记录 `ui_obstructed` 并停止该平台，禁止改用 taobao 模板或临时改写定位器。
- **登录未通过**: 目标账号 `enable=false` 时自动跳过该店铺（记为登录缺口并在回复/报告列明），继续处理其余已登录店铺，不追问也不中断；全部目标未登录或 `accounts=[]` 时，停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。无法确认登录状态（发现失败/字段不合法）时停止整个运行。
- **缺少身份字段**: 将该行标记为人工处理；缺少完整订单号、内容锚点和商品锚点时永不自动回复。
- **提交不确定**: 停止自动重试，并在任何恢复前要求人工验证。
- **交付失败**: 报告 `spec_delivery.py` 错误，不得手工构建最终目录或展示列表。
- **达到反馈循环上限**: 只有检查通过才收尾；否则报告未解决规则、原始问题和下一步。
