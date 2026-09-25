---
name: multi-platform-store-analysis
displayName: 多平台电商店铺分析
description: 分析淘宝、天猫、抖店、京东、拼多多、1688 店铺的整体经营状况，采集经营数据后生成数据视图 Excel 与证据化的经营分析 HTML 报告。适用于店铺经营分析、经营周报/月报/日报、GMV 与成交额分析、流量与转化分析、推广投放与 ROI 复盘、退款与售后分析、评价与体验分查看、多平台多店铺经营对比、导出经营数据等请求。仅执行只读采集编排、计算、分析与交付；不修改店铺设置，不发布商品，不发送消息，不回复评价。
---

# 跨平台店铺经营分析

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 执行；文档中出现的 `<python>` 占位符一律展开为 `python3`，脚本路径与传参路径先展开为绝对路径；不再改写为 `phoenix-plugin-python-run`。

## 不可妥协规则

- **路径基准**：所有 `references/`、`assets/`、`scripts/` 路径均以本 `SKILL.md` 所在目录为基准；插件安装后为 `<插件根>/skills/multi-platform-store-analysis/`。
- **主 Agent 执行**：当前主 Agent 必须在当前会话中直接执行全流程。严禁调用 `functions.sessions_spawn`，不得使用 `agent`、`general`、多会话或其他子 Agent 机制执行任一阶段；不得以并行执行、任务拆分、浏览器操作、耗时较长、上下文隔离或**交付核对/结果验证**为理由派出子 Agent（`verification` 子代理同样禁止：其运行时读取受限，无法核对本 Skill 产物）。交付核对在主会话内用 `bash` 完成：逐条 `os.path.exists` 校验 `logs/present_files.json` 清单与文件大小，再比对 `analysis.json` 引用数字与 `data_view/view-data.json` 的 `evidenceIndex`。
- **只读边界**：只允许搜索、读取、分析和生成本地产物；禁止修改价格/库存/标题/主图/详情页/SKU/运费模板/店铺设置，禁止发布商品、发送消息、回复评价、设置自动任务，禁止浏览器 console/JavaScript 注入和手工点击替代 DSL。
- **URL 完全无效**：用户 Query 中的店铺相关 URL 直接整段移除，不打开、不解析、不用于推断平台或店铺；平台与店铺只取 URL 之外的文本。
- **执行层边界**：账号登录状态检查、浏览器 RPA、采集与原始导出只由 `../multi-platform-rpa-execution-new/SKILL.md` 承担。本 Skill 不直接调用 `browser_rpa_launch` 或任何浏览器工具，不生成或修改 DSL，不扫描浏览器下载目录，不重采。
- **账号边界**：本轮已有有效的完整 `discover_store_accounts` 结果时必须复用；没有时按 `references/collection-planning.md`「账号发现范围」四步推导后调用一次。必须带非空 `platformIdList`，禁止零参数与 `[]`；抖店映射为 `dy`，淘宝与天猫严格互不归并（同时禁止中文平台名、`douyin`/`doudian` 与清单外平台）。返回记录出现 `platformId` 越界时整个响应作废并停止。
- **打断边界**：执行前允许的打断项只有**平台范围与店铺范围**，两者都必须 `ask_user(mode="form")`，且平台追问必须在账号发现**之前**完成。店铺打断只按**已登录**（`enable=true`）候选判定：用户指定店铺在已登录候选中无法唯一匹配、或同平台已登录候选 `N_on≥2` 且用户未唯一指定时，列出候选「店铺名（脱敏账号）」让用户选择（含「全部店铺」）。`N_on=1` 或用户已唯一指定时不打断；`<active_store>`、历史店铺、路由注入信息一律不算用户已指定。旧口径「平台级全选时不需确认」已废止。**登录状态不是打断项**：目标 `enable` 混合时自动跳过未登录店铺并一句话说明后继续，禁止用 `ask_user` 或文字就登录状态索要确认。时间窗（缺省近 7 天）等有默认值的参数一律取默认并一句话提示后继续，禁止用普通文字、Markdown 表格、编号列表、「确认使用【…】」「请明确回复后我再开始」这类句式或任何自由文本框索要确认。
- **主脊唯一**：任何阶段获取上游产物，只允许读 `run.json` 的 `stages.<阶段>.outputs.*`（经 `scripts/run_context.py`）。禁止 `find`/`ls`/路径拼接/目录扫描定位上游产物。合法例外只有两处：S3a 绑定与 S6 交付对账枚举请求级 `raw_data/`（执行层 `deliveryFiles` 是增量差分，重跑会缩水）。
- **计算下沉**：所有数值计算只在 S3 数据视图层发生。S4/S5/S6 **永不再打开 raw_data**，不重新解析原始 Excel、不二次计算数值。报告卡片、趋势图与 Agent 证据必须同源。
- **上下文预算**：S5 只读 `analysis/brief/*.json`（单店 ≤16KB）与 `query_evidence.py` 的定向切片（单次 ≤3KB、每店 ≤8 次）。严禁直接读 `view-data.json`、原始 Excel 或遍历 `evidenceIndex`。
- **S5 商品写法**：商家可见字段提到商品时写 `商品名称(ID: 数字)`。**`(ID: 数字)` 是唯一定位依据，名称直接抄 brief 的截断名即可**，不要求逐字全称，无需为取名额外调脚本。硬性拦截只有两条：**裸 ID**（只写数字不带名称）与**有名无 ID**。指代词（「该款/该商品/该单品/本款/这款/此款/该品」）是**软约束不拦截**：写作时尽量少用指代词、优先直接写 `商品名称(ID: 数字)`，但为可读性偶尔使用不算违规，也不必为此把同一句话机械重复商品全称。另：`drilldowns` 上限是**全店合计 ≤3 条**（三个分节相加），不是每节 3 条。
- **S5 全称按需可选**：只有在确需完整商品名时才跑 `python3 scripts/brief/resolve_product_names.py --run <run.json> --store-key <k> --product-ids <id1,id2,...>`（`--product-ids` 必传，多店同一轮并行）。该脚本**不占** `query_evidence.py` 的每店 8 次额度，结果落盘 `stores/<storeKey>/analysis/evidence/product-names.json`，`resolved` 内逐字复制 `write` 字段；`unnamable` 内的商品禁止点名。**禁止**为取商品名调用 `query_evidence.py --query product-detail`（仅用于取指标明细，且计入额度）。动笔完成后先 `merge_analysis.py --dry-run` 纯校验，通过再正式合并。
- **S5 机械问题由脚本修正**：`merge_analysis.py` 校验项 10 报出裸 ID / 缺 ID 标记时，跑 `python3 scripts/analysis/normalize_product_mentions.py --run <run.json> [--store-key <k>] [--dry-run]` 机械补全，**禁止逐条手工 edit**。该脚本复用同一套匹配器，只改 12 个商家可见字段（跳过 `question` 与 `whyChain`），幂等、不产生 `(ID: (ID: ...))` 嵌套，且**已带 `(ID: 数字)` 的提及一律原样保留**（不会把截断名重写成全称）。脚本恒返回 0；输出里的 `unresolved` 只是指代词提示（字段内无法唯一确定商品），**不是阻断项，不需要人工回改**。
- **S5 人工修复一文件一次写**：确有需要人工回改时（裸 ID / 缺 ID 等脚本未覆盖的情形），按「全店并行 dry-run 收集 → 汇总待办 → 每文件一次整文件 `write` 覆盖 → 全部写完再重跑」执行。**同一个 `parts/*.json` 一轮修复内只允许一次写操作**；禁止对同一文件连续多次 `edit`（N 处报错发 N 次 edit，token 随报错条数线性放大）、禁止改一条跑一次校验、禁止逐店串行「校验→改→校验」。人工修复上限 2 轮，第 2 轮仍不过即停并如实报告剩余项。
- **缺数不推论**：空报表 ≠ 零效果。`missing_*`/`empty` 指标进入数据缺口，禁止补 0、估算或解读为「投放效率低」。
- **失败不盲重试**：同一阶段同一失败原因最多重试 1 次且必须先改变条件；连续 2 次相同失败即停止该路径，如实报告失败阶段、已尝试动作、原始错误、未完成范围与替代方案。权限类失败永不重试。

## 目的

本 Skill 负责「意图与采集计划 -> 委托执行层采集 -> 数据视图计算 -> 分析简报降维 -> 证据化洞察 -> HTML 报告与 Excel 交付」。它是独立入口，用户经营分析诉求直接命中，不依赖上游 Router。交付物为一份经营分析报告 HTML、一份全店合并的数据视图 Excel，以及各店请求级原始 Excel。

## 决策点

| 判断 | 规则 | 后续动作 |
|---|---|---|
| 平台 | 明说 `淘宝/千牛` -> `taobao`；`天猫/Tmall` -> `tmall`；`抖店/抖音小店/罗盘` -> `doudian`；`京东/京麦/JD` -> `jd`；`拼多多/PDD` -> `pdd`；`1688/阿里巴巴` -> `1688` | 天猫是独立平台，只跑 tmall 专属 DSL，禁止归一为 taobao 或回落 taobao 模板 |
| 平台不明确 | 未提任何平台且无法从店铺名唯一推导 | 先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，可多选），拿到答复后再做账号发现 |
| 店铺范围 | 同平台已登录候选 `N_on≥2` 且用户未唯一指定 | `ask_user(mode="form")` 列已登录候选，含「全部店铺」；未登录项不作为选项 |
| 时间窗 | 用户未指定 | 默认近 7 天（`end`=昨日），一句话告知后直接继续；同时推算等长上周期供环比 |
| 时间窗 | 用户指定 | 解析为 Asia/Shanghai 绝对起止后按天数套 `day/week/month/custom`；绝对起止日必须原样进入 batch-request |
| 断点续跑 | 采集已完成但 S3+ 失败 | 从 S3 续跑，不重采（执行层产物完好） |
| 平台不在六平台内 | 如 alibaba.com / AliExpress | 说明不属于本 Skill 支持范围，不得当作 1688 处理 |

## 工作流

阶段门禁：进入阶段 N 前 `stages.<N-1>.status ∈ {complete, partial}`；为 `failed` 时停止并如实报告。

| 阶段 | 入口 | 命令 | 产物 |
|---|---|---|---|
| S0 运行初始化 | 用户 Query | `python3 ../multi-platform-intention-router/scripts/check_python_env.py --json`（退出码 0 继续 / 1 报告 sitePackages+baseDirs 并提示更新客户端 / 2 报告插件安装不完整并停止）<br>`python3 scripts/init_run.py --workspace <abs>` | `run.json`、`logs/run_context.env` |
| S1 意图与采集计划 | 用户 Query + `run.json` | 按 `references/collection-planning.md` 完成平台识别、账号发现、店铺消歧、登录门禁、时间解析，写 `resolved-stores.json`，再<br>`python3 scripts/plan/build_plan.py --run <run.json> --stores <abs> --period <mode> [--start --end]` | `logs/collection-plan.json`、`logs/batch-request.json` |
| S2 采集执行 | `stages.plan.outputs.batchRequest` | 把完整 `batch-request.json` **一次性**交给 `../multi-platform-rpa-execution-new/SKILL.md`（launch 响应落盘与 `build_run_results.py` 汇总口径由执行层规定，本 Skill 不另起路径约定）；读回结果后回写主脊 | `execution/<requestId>/raw_data/`、`stages.collect` |
| S3 数据视图 | `run.json` + `rpa-post-process-result.json` | `python3 scripts/view/bind_raw_data.py --run <run.json>`<br>`python3 scripts/view/build_view.py --run <run.json>`<br>`python3 scripts/render/build_workbook.py --run <run.json>` | `stores/<storeKey>/data_view/view-data.json`、`deliverables/店铺经营数据视图.xlsx` |
| S4 分析简报 | `stages.dataView.outputs` | `python3 scripts/brief/build_brief.py --run <run.json>` | `stores/<storeKey>/analysis/brief/*.json` |
| S5 洞察分析 | `analysis/brief/overview.json` | 动笔前按店取全称：`python3 scripts/brief/resolve_product_names.py --run <run.json> --store-key <k> --product-ids <ids>`（多店同轮并行）<br>按 `references/analysis-authoring.md` 写 `analysis/parts/*.json`；需要指标明细时 `python3 scripts/brief/query_evidence.py --run <run.json> --store-key <k> --query <type>`<br>商品写法报错时 `python3 scripts/analysis/normalize_product_mentions.py --run <run.json>`<br>逐店 `python3 scripts/analysis/merge_analysis.py --run <run.json> --store-key <k>` | `stores/<storeKey>/analysis/evidence/product-names.json`、`stores/<storeKey>/analysis/analysis.json` |
| S6 渲染与交付 | 全店 view-data + analysis | `python3 scripts/render/render_report.py --run <run.json>`<br>`python3 scripts/deliver/collect_delivery.py --run <run.json>` | `deliverables/<报告名>.html`、`logs/present_files.json` |

脚本一律先跑 `--help` 作为黑盒调用；除调试、修复或确认契约外不读脚本源码。所有脚本支持 `--dry-run`。

## 资源

| 资源 | 加载时机 | 用途 |
|---|---|---|
| `references/workflow-gates.md` | S0–S2 | 阶段关卡、通过条件、失败处置 |
| `references/collection-planning.md` | S1 | 账号发现四步推导、店铺消歧、登录门禁、时间窗、分批规则 |
| `references/data-view-spec.md` | S3 | 计算管线、reducer 语义、缺失状态、扩展方式 |
| `references/platform-caliber.md` | S3/S5 | 六平台口径差异与踩坑（好评率、曝光量、退款占比等） |
| `references/analysis-brief-contract.md` | S4/S5 | 简报结构、上下文预算、按需取证协议 |
| `references/analysis-authoring.md` | S5 | 三段式、证据契约、质量红线、自检清单 |
| `references/report-structure.md` | S6 | 章节结构、组件、文件名、禁止项 |
| `references/delivery-contract.md` | S6 | 交付集合、文件系统对账、空表处理 |
| `references/validation-and-retry.md` | 任意阶段失败 | 校验门禁、失败分类、重试上限 |
| `references/collection-extension.md` | 新增采集数据 | 四层扩展、声明式接入步骤 |
| `assets/dsl-selection.json` | S1（脚本读） | 各平台采集 DSL 白名单 |
| `assets/metric-spec.json` | S3（脚本读） | 平台×指标×源表×字段×reducer 口径表 |
| `assets/entity-spec.json` | S3（脚本读） | 商品级实体聚合口径 |
| `assets/report-template.html` | S6（脚本读） | HTML 报告模板样式 |

同组资源一次性并行读取，不逐份串行：S0–S2 读前两份；S3 读 `data-view-spec.md` + `platform-caliber.md`；S4/S5 读 `analysis-brief-contract.md` + `analysis-authoring.md` + `assets/schemas/analysis-model.schema.json`；S6 读 `report-structure.md` + `delivery-contract.md`。

## 输出契约

- **交付集合**：`deliverables/` 全部文件（1 份报告 HTML + 1 份数据视图 Excel）+ 各店请求级原始 Excel。`present_files` **只调用一次**，含完整数组，不手工挑文件、不分步展示。
- **报告文件名**：单平台单店 `<平台名>店铺经营分析报告.html`；多店（含同平台多店）`多店铺经营分析报告.html`；多平台未形成多店 `多平台店铺经营分析报告.html`。
- **状态语义**：`complete`=全部店铺全部 DSL 成功；`partial`=部分店铺跳过或部分 DSL 空表，交付可用产物并明确列出缺口；`waiting_for_user`=执行层需用户在 retry/upload/ignore 中选择；`failed`=无法产出有效报告，不交付并报告原因。`partial` 必须在首屏说明，禁止把部分或缺失数据描述为完整成功。
- **进度播报**：格式为「阶段名 + 店铺名（脱敏账号）」，如 `阶段 3 数据视图：抖店-投影专卖店（tou***）视图构建完成`。不暴露脚本名、内部路径、完整账号、原始表内容、DSL 或 selector。
- **推荐深入分析**：仅当诊断仍有需额外采数的维度时，在最终回复结尾给出最多 3 项，必须与报告诊断卡一致，用商家语言，不暴露 skill id。

## 边界场景

| 场景 | 必需行为 |
|---|---|
| 全部目标未登录或 `accounts=[]` | 停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。不再询问是否继续 |
| 部分目标未登录 | 自动跳过并一句话分别列出「本次执行 / 已跳过（未登录）」，继续采集已登录店铺；最终摘要保留登录缺口 |
| 用户点名店铺未登录 | 只跳过该店并注明，禁止静默换成同平台其它店铺 |
| `accounts=[]` 或匹配为空 | 引导新增/登录账号并停止，不得改用非 Profile 会话 |
| `lyone_not_enabled` | 原文转达通知；核心日报无数据行，重试无法自愈，核心指标整体为 0 只能作数据缺口，**禁止当作真实经营结果** |
| 执行层 `userDecision.required` | 完整展示 `blockingFailedTasks` 的中文平台/DSL 名与影响，让用户在 retry/upload/ignore 中做**一次**选择 |
| 权限类失败 | 原文转达页面提示，只提供 upload/ignore，说明重试无法解决与授权路径 |
| 空工作簿 | 从交付清单剔除、文件保留原处，在报告与小结中列为该 DSL 的数据缺口，措辞「该报表本周期无数据」，不写「采集失败」 |
| 某店 S3 失败 | 该店记缺口并跳过，其余店铺继续；店铺维度隔离使单店重跑不影响他店 |
| 全店四节均无异常 | 在 `meta.json` 写 `noCaseReason` 说明原因，不得为通过校验编造诊断卡 |
