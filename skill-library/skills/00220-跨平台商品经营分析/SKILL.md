---
name: multi-platform-product-analysis
displayName: 多平台商品明细分析
description: 拉取并分析淘宝、抖店、京东、拼多多和 1688 的商品列表与商品经营数据，覆盖销量、GMV、流量转化、库存、爆款/滞销、排行、清单和明细 Excel 导出。拼多多商品数据使用 pdd_product_detail DSL 采集，独立切换概况/列表/详情周期、动态解码 spider-font，并逐个采集前 10 个商品详情；全部平台统一走 Execution。用户没有明确指定商品 ID 时使用本 Skill；已经得到明确商品 ID 且要求淘宝/天猫瓴羊人群补采时也使用本 Skill 并自动按 10 个拆批。只有明确指定 1–10 个商品 ID 的常规经营下钻才转交 multi-platform-single-product-analysis。全流程只读，不修改店铺数据。
---

# 跨平台商品经营分析

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 工具执行，脚本路径与传参路径先展开为绝对路径。

## 目的

本 Skill 将多平台商品分析请求转换为新版 Execution 批量采集请求，消费 Execution 产物，完成 request 级商品聚合、跨 request 合并、逐店规范化交付，**为每个店铺各生成一份商品问题诊断 HTML 报告**，并输出对话式执行摘要。交付时按店铺把「该店分析报告 + 该店原始数据」成对展示。它只做只读采集和分析，不修改店铺数据。

问题商品的识别结果以 HTML 报告为唯一完整载体：分层明细、商品 ID 表格与问题维度（结论 / 论点 / 修复建议）都写进对应店铺的报告；对话只给执行状态、关键结论和报告链接，不再重复输出折叠明细。

### 为什么按店铺分报告

不同店铺是彼此独立的经营主体，各自有独立的类目结构、客群、定价与流量来源。把它们的 UV、GMV、动销率求和后再诊断，得到的是一个现实中不存在的「虚拟店铺」：

- **比率型指标失真**：A 店 1 万访客 5% 转化与 B 店 100 访客 0% 转化合并后，B 店的问题被稀释到看不见。
- **结论无法落地**：运营动作是按店执行的，「全平台动销率 43%」不对应任何一个人的工作项。
- **分层阈值被污染**：累计 80% UV、店铺均值、中位数等阈值都依赖「同一批可比商品」，跨店混算会让每家店的分层都偏。

因此报告粒度固定为**一店一报告**，不做任何跨店求和或合并计算。交付清单也不设合并入口：每家店的报告与其原始数据相邻排列，业务方看完结论就能直接翻到支撑它的明细。

## 决策点

| 用户信号 | 处理方式 |
|---|---|
| 明确指定 1–10 个商品 ID，并要求这些商品的经营下钻 | 转交给 `multi-platform-single-product-analysis`；不要运行本 Skill。 |
| 已有明确商品 ID，要求为淘宝/天猫商品补采瓴羊「流量来源分人群（新版）」；数量可超过 10 | 使用 `references/supplemental-product-filter-workflow.md` 和 `build_supplemental_collection_request.py` 自动按 10 个一批生成补采请求；这是本 Skill 的显式补采场景，不转为默认全店采集。**产物仅为人群报表原始文件，不进报告**，接单前先据实说明这一边界。 |
| 未指定商品 ID 的商品 URL、标题关键词、单品表现、分析这个产品、全店商品盘点、商品清单、商品排行、商品销量/GMV/库存/转化 | 使用本 Skill 拉取商品列表。URL 或标题只用于辅助描述范围，不得从 URL 提取 ID 后改走单品 Skill。 |
| 竞品商品或竞品店铺 URL | 当用户要求竞品分析时，转交给 `ecommerce-search`（竞品能力在该 Skill，具体 intent 由其 `references/intent-routing.md` 判定）。 |
| 订单、退款、广告投产、利润、RFM、复购、大盘份额 | 视为默认商品明细链路不支持；说明缺口或转交给更具体的 Skill。 |
| 自定义周期但缺少 start/end/timezone | 回落默认近 7 天（`end` = 昨天）并由开工播报的「周期」字段提示后继续，不追问。 |
| 目标包含拼多多店铺商品数据 | 与其他平台一致走 Execution 链路，使用 `pdd_product_detail` DSL（商品概况 + 商品明细整表 + 前 10 商品数据详情弹窗）。禁止回退 `pdd_goods`——那是店铺经营报告口径，只有四个排行榜，没有逐商品明细与弹窗字段。 |

## 不可协商约束

- **执行主体**：全流程由当前主 Agent 在当前会话中直接执行；“委托 `multi-platform-rpa-execution-new`”表示读取并执行该 Skill 流程，不是派发平台 lane。所有平台（含拼多多）共用同一条 Execution lane，不存在浏览器子会话例外。
- **禁止把 lane 映射成执行代理**：除上述拼多多 DOM 子会话这一唯一例外外，严禁调用 `functions.sessions_spawn`，不得使用 `agent`、`general`、多会话或其他子 Agent 机制来执行某个平台 lane。不得以并行执行、任务拆分、浏览器操作、耗时较长或上下文隔离为理由派出子 Agent。子 Agent 不能替代本 Skill 的事件契约、停止规则和本次运行目录约束；需要提速时只能增加当前主 Agent 对 `functions.browser_rpa_run` 的同批工具调用数。
- **Python 执行**：依赖来源路径、Python 执行口径、执行前自检与报错处置的唯一事实源是 `../multi-platform-intention-router/SKILL.md` §0。xlsx 依赖（`openpyxl` / `xlrd`）优先复用 AccioWork 环境，缺失时由 `scripts/accio_python_env.py` 从插件 wheelhouse 离线安装到动态 Accio `site-packages`；时区统一用 `datetime` 内置固定 +08:00 偏移，无第三方依赖；业务执行统一使用 `python3`。
- **路径基准**：本文所有 `references/` 和 `scripts/` 路径均以本 `SKILL.md` 所在目录为基准。
- **命令行参数一律绝对路径**：`python3` 以**当前 shell 的 cwd**为工作目录，不保证是本 Skill 目录或本次运行目录。把相对路径（如 `data/product-analysis-.../logs/x.json`）传给 `--run-dir` / `--out` / 位置参数，会被拼到错误的基准目录并报 `run_dir 不存在` 或 `No such file or directory`；用 `../../../` 回退同样错误。脚本自身路径和所有传入脚本的路径都必须先展开为绝对路径。
- **1688 sidecar 必须显式指定 page-id**：调用 `../multi-platform-rpa-execution-new/scripts/postprocess_runtime/platform/1688/parse_1688_sycm_xls.py` 时必须传 `--page-id`，且取值与 `references/dsl-selection.json` 的 DSL ID 一致（商品明细页 → `item_shop_detail`，商品概况核心指标 → `flow_structure`）。缺省时该脚本一律输出 `core_statistics.json`，`aggregate_product_data.py` 按 `item_shop_detail` 找不到单品数据，会**静默**产出 `product_count=0` 且 `status=success`，极易被误判为“店铺无商品”。
- **报告边界**：本 Skill **按店铺出报告**——每个店铺一份商品问题诊断 HTML，**不生成店铺目录页，也不产出任何跨店合并的报告或 Excel**。禁止把多个平台或多个店铺的商品合并进同一份报告。店铺报告必须经 `scripts/report/render_report.py` 由 `assets/report-template.html` 渲染；禁止手写 HTML、禁止手工编辑渲染产物；校验未通过不得交付。文件交付以 `logs/present_files.json` 为准，其顺序为「店A 报告 → 店A 原始数据 → 店B 报告 → 店B 原始数据 → …」。
- **店铺隔离边界**：店铺隔离键是 Execution 的 `requestId`（一个 request 恰好对应一个 `platformId + storeId + storeAccountId` Profile）。**同平台同店名的不同账号必须各自成报告**，不得因店名相同而合并。任何指标都不得跨店求和：报告内的分母、中位数与累计 80% UV 阈值一律只用本店商品计算。
- **分析口径边界**：已下架 / 停售商品在数据入口处直接剔除，不进入任何分析；报告中的商品数、动销率、访客、退款率等指标一律为在线商品口径。平台不提供状态字段时不得臆断下架。详见 `references/report-pipeline.md`。
- **报告事实边界**：报告中的每个数字都必须来自**该店自己的** `fact-pack-<storeSlug>.json`，每条结论都必须挂在真实 `candidateId` 与真实商品 ID 上。平台缺失字段的章节按 `references/report-pipeline.md` 显式降级为缺口说明，禁止用 `0`、占位值、其他平台字段或历史周期数据填补。
- **结论实质性边界**：结论/论点/修复建议必须是**只对该商品成立**的具体判断。「重点关注」「指标存在优化空间」「优化主图及详情」「转化正常」这类对任何商品都成立的套话不构成诊断，`build_agent_insight.py` 会直接判定失败。`evidence` 必须引用 fact-pack 中的真实数值（UV/GMV/转化率/退款率等，至少含一个数字），`conclusion` 要说明**偏离了什么基准**，`fix` 要给出**可执行且可验收的动作**。填不出具体结论时，说明该维度证据不足，而不是用套话占位。
- **拼多多数据载体**：拼多多商品数据页没有导出按钮，其商品明细唯一载体是 `pdd_structured.json`（DSL 读页面文本 + 后处理解码 spider-font）。事实层按 `STRUCTURED_SOURCE_NAMES` 识别该文件，与 Excel 同等对待。若只按 `.xlsx/.xls` 后缀筛选数据源，拼多多店铺会**整店静默缺席**报告且不进 `skippedStores`。弹窗步骤失败导致 UV/GMV 为空时，如实按数据缺口降级，禁止用 `0` 冒充真实经营数据。
- **事实边界**：所有结论必须来自本次采集且具有当前任务下载血缘的聚合 JSON 或原始 Excel；缺失字段不补值、不估算、不跨平台替代。
- **淘宝库存能力边界**：淘宝/天猫默认 `products`（生意参谋商品排行）采集路径不提供库存字段，因此默认链路不得输出库存积压结论。用户明确询问库存时，将其标为“本次未采集”，并建议补充商品管理后台库存导出；不得把缺失值写成 `0`。
- **账号统一链路**：一轮业务只通过 `../discover-store-accounts/SKILL.md` 发现一次账号。账号发现必须带非空 `platformIdList` 调用一次，禁止零参数与 `[]`；抖店映射为 `dy`，淘宝与天猫严格互不归并。用户平台意图不明确时必须先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再调用，禁止默认全平台继续。完整推导见 `../multi-platform-intention-router/references/common/store-scope-contract.md`「账号发现范围统一契约」；基座的零参数分支在本链路不适用。先使用返回的 `accounts[]` 逐平台完成**店铺范围消歧**（只按 `enable=true` 候选数 `N_on` 判定）：`N_on=0`（无候选或候选全部未登录）时自动跳过该平台；`N_on=1` 或用户已唯一指定（店铺名精确命中一条，或明确说“全部店铺”）时展示后直接继续；`N_on≥2` 且用户未唯一指定（只给平台名）时**必须** `ask_user(mode="form")` 让用户从**已登录**候选“店铺名（脱敏账号）”中选择（含「全部店铺」选项，未登录项不作为选项）。旧口径「平台级全选时不需确认」已废止。消歧锁定后对选定集合执行 `enable` 门禁：全部 `true` 直接继续；**部分为 `false` 时自动跳过未登录目标、只跑已登录目标，不打断、不追问**（本次执行项与已跳过项在开工播报中列明）；全部 `false` 时停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失），严禁只输出纯文本引导。不得输入账号密码、执行登录 DSL、使用当前浏览器登录态兜底，或先过滤 `enable=false`。
- **打断边界**：执行前允许的打断项只有**平台范围与店铺范围**：平台意图不明确时先追问平台，平台确定后店铺无法唯一确定（在已登录候选中无法唯一匹配、同平台已登录候选 `N_on≥2` 且用户本轮未唯一指定）时再追问店铺，两者都必须调用 `ask_user(mode="form")`；`<active_store>`、历史店铺、路由注入信息一律不算用户已指定。**登录状态不是打断项**：目标 `enable` 混合、某平台无已登录店铺或无候选时自动跳过并在开工播报中列明后继续。其余有默认值的参数（时间窗、采集范围）一律取默认并由开工播报告知后继续，禁止用普通文字、Markdown 表格、编号列表、「确认使用【…】」「请回复'确认 + 店铺名'」「请确认目标店铺后开始」句式或任何自由文本框索要确认。
- **开工播报**：目标锁定后、首个 Execution 采集请求之前，必须按 `../multi-platform-intention-router/references/common/kickoff-briefing-contract.md` 播报**恰好一次**并在同一轮直接继续执行；禁止用 `ask_user` 承载，其余禁令见契约 §5。字段口径：动作 = “进入商家后台采集商品列表与经营明细”；交付 = “每店一份商品问题诊断 HTML 报告 + 明细 Excel，保存到本次会话工作目录”。
- **Profile 唯一选择器**：Router plan 和 Execution batch request 只保留成对的 `storeId + storeAccountId`；Execution 在调用 Browser RPA 前，必须按 `storeAccountId` 从本轮同一次账号发现结果恢复唯一记录并核对 `storeId + platformId`，再把完整三维 Profile ID 与展示元数据放到 Tool 顶层。一次 Browser RPA 调用只对应一个 `storeAccountId`。
- **账号归属边界**：计划中的 `storeName` 和脱敏 `account` 只是展示标签，不是数据归属或 Profile 定位证据。Execution 必须使用三维 Profile ID。下载型任务以 Browser RPA 返回的 `outputsPath` 为证据入口，按 assembled plan 的 `expectedDownloadKeys` 读取 `outputs[<downloadKey>].path`；`downloadedFiles` 可以为空并由 Execution 后处理从该路径回填。找不到有效路径时该 request 只能进入缺口，禁止扫描下载目录、聚合或交付。


## 边界

本 Skill 可以：

- 解析平台、店铺名、时间范围和 Router 批次。
- 对 Profile 目标保留成对的 `storeId/storeAccountId`，使同平台同店名的不同账号保持独立 request。
- 用 `scripts/build_collection_routes.py` 把拼多多 DOM lane 与其他平台 Execution lane 分开。
- 对非拼多多平台读取 `references/dsl-selection.json` 并生成 `multi-platform-rpa-execution-new.batch-request.v1`。
- 对拼多多使用 `pdd_product_detail` DSL，由 Execution 后处理完成动态字体解码与商品行/弹窗解析，产出与其他平台一致的 request 级结构化 JSON / CSV / XLSX。
- 消费 `multi-platform-rpa-execution-new` 的非拼多多 request 产物，以及拼多多 DOM request 的 `raw_data/` 数据文件。
- 产出**每店一份商品问题诊断 HTML 报告**、按店配对的交付清单（报告 + 该店原始数据）、逐店标准交付目录和对话式执行摘要。

本 Skill 不得：

- 保存或修改 RPA DSL、账号凭据或登录状态；拼多多 DOM 固定 URL 与固定探测脚本只维护在本 Skill 内，不从用户输入生成选择器或脚本。
- 对拼多多回退 `pdd_goods` DSL、在页面里执行自定义 JS，或扫描下载目录取数；拼多多商品数据页没有原生导出，只能由 `pdd_product_detail` DSL 读页面文本后在后处理解码。
- 除“主 Agent 无浏览器原子工具时，每个拼多多店铺一个 `browser` 子会话”的唯一例外外，调用 `functions.sessions_spawn` 执行平台 lane、聚合、报告或交付。
- 生成逐店 Execution `request.json` 或 `execution-request-plan.json`。
- 向 Execution batch request 传递 `requestId`、`requestPath`、request 级 `runDir/rawDataDir`、DSL 文件路径、京东时间变体、报告指标、`platformId/platformName/account/enable`；请求只保留 `storeName/platform/storeId/storeAccountId/timeRange`。
- 根据 `references/metric-selection.json` 扩张采集范围。

采集契约来源：

- `../multi-platform-rpa-execution-new/references/contract/batch-request.schema.json`
- `../multi-platform-rpa-execution-new/references/dsl/<platform>/*.dsl-spec.json`

## 输入规范化

| 输入 | 规则 |
|---|---|
| 未指定平台 | 平台意图不明确：必须先 `ask_user(mode="form")` 只问平台（选项为 `taobao,tmall,doudian,jd,pdd,1688` 对应的平台名并附「全部平台」，允许多选），拿到答复后再发起账号发现；禁止未追问就默认全平台。 |
| 平台别名 | 淘宝/天猫/千牛、抖店/抖音/罗盘、京东/京麦、拼多多/PDD、1688/阿里巴巴。 |
| 天猫店铺 | Router 归一为 `platform=taobao + commercePlatform=tmall`：天猫与淘宝共用生意参谋采集通道，但**商业身份必须还原**。事实层按 `commercePlatform` 解析展示平台，报告标签显示「天猫」、文件名用 `天猫-<店铺>`、商品链接用 `detail.tmall.com`。不得因采集通道相同就把天猫店标成淘宝店。 |
| 未指定时间范围 | 默认使用最近 7 天，告知用户后继续。 |
| `day/week/month` | 视为相对时间意图；适配器只保留 `mode + timezone`，由 Execution 组装器解析日期。 |
| `custom` | 必须有合法的 `start/end/timezone`；缺失时回落默认近 7 天并提示，不追问。 |

## 工作流

遵循 `references/workflow-gates.md` 中的详细关卡，不得跳过。

0. 执行前运行 `python3 <skill_dir>/../multi-platform-intention-router/scripts/check_python_env.py --json` 自动准备 Excel 依赖；`<skill_dir>` 必须替换为本 Skill 目录绝对路径。退出码 `0` 继续，`1/2` 按 Router §0 停止并报告安装目标、版本冲突或环境诊断。
1. 读取并执行 `../discover-store-accounts/SKILL.md`，按本轮平台范围带非空 `platformIdList` 调用一次 `discover_store_accounts`（禁止零参数与 `[]`；抖店映射为 `dy`）；平台意图不明确时先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再发起发现；校验完整 `accounts[]`，按业务平台和商家账号类型展示（均带脱敏 `account`），并逐平台执行店铺范围消歧（只按已登录候选 `N_on` 判定）：`N_on=0`（无候选或候选全部未登录）时自动跳过该平台；`N_on=1` 直接锁定；`N_on≥2` 且用户已唯一指定（店铺名精确命中一条，或明确说“全部店铺”）时按指定锁定；`N_on≥2` 且用户**未**唯一指定（只给平台名，未点名具体店铺也未说“全部”）时**必须**调用 `ask_user(mode="form")` 让用户从该平台已登录候选中选择（选项含「全部店铺」，未登录项不作为选项），用户选择前不启动 RPA。
2. 对选定的目标集合执行 `enable`门禁。全部为 `true` 直接继续；**强制触发引导**：若目标平台在发现中无任何账号（`N_all=0`），或选中的账号全部为 `enable=false`，必须停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。**混合状态自动跳过未登录目标、只跑已登录目标，不打断、不追问**，“本次执行”与“已跳过（未登录）”的“平台 / 店铺名（脱敏账号）”随开工播报一并输出，并在最终摘要保留登录缺口。用户完成登录并明确继续时可重新 Discover 一次刷新。若最终“本次执行”集合包含拼多多，则在首个 Execution 请求前额外运行 `python3 <skill_dir>/../multi-platform-intention-router/scripts/check_python_env.py --json -m openpyxl -m xlrd -m PIL -m fontTools`；任一模块准备失败都按 Router §0 停止，不得先采集再把 spider-font 数值降级成缺口。目标锁定后按关卡 0 的开工播报要求播报一次再继续。
3. 创建一个运行根目录，保存本轮账号快照并写入 `logs/run_context.env`。
4. 使用已有 Router 计划；若直接激活，则用 Router 的确定性脚本生成计划。每项只保留同一账号记录的 `storeId + storeAccountId`，同店不同账号不得合并；完整 Profile/展示字段留在本轮账号快照中。
5. 运行 `scripts/build_collection_routes.py` 归一路由：全部平台（含拼多多）写入 `logs/routes/execution-plan.json`。
6. 对 `execution-plan.json` 读取 `references/dsl-selection.json`，并用 `scripts/build_collection_requests.py` 生成 `logs/batch-request.json`。非拼多多固定采集矩阵为：淘宝/天猫 `products`；抖店商品卡列表 + 商品列表；京东 `jd_product_360` + `jd_product_detail_download`；1688 `item_overview` + `item_shop_detail`。不得删除京东商品概况后只保留明细页。
   若用户明确要求淘宝/天猫商品人群补采，则改走 `references/supplemental-product-filter-workflow.md`：把明确商品 ID 写成 JSON 字符串数组，使用 `build_supplemental_collection_request.py` 生成独立的 `supplemental/<scenario>/logs/batch-request.supplemental.json`，由脚本按 DSL 上限拆批并隔离 `run_dir`。不要把 `lingyang_flow_crowd_new` 加进默认全店 DSL 矩阵。**该补采只产出人群报表原始文件，不进入 fact-pack、诊断报告与默认交付清单**；向用户交代结果时必须如实说明，不得暗示报告里会多出人群章节。
7. 拼多多与其他平台同批执行，无独立 lane；`pdd_product_detail` 会自动分别切换概况区与商品明细区的时间档，并逐个打开前 10 个商品的详情弹窗滚动到底。严禁回退 `pdd_goods`。
8. 全部批量请求交给 `multi-platform-rpa-execution-new`，所有 request 落在同一根 `run_dir`。
9. 分类结果后，对每个可用的 `requests[].workDir` 运行一次 `scripts/run_pipeline.py`。
10. 在根目录运行一次 `scripts/merge_cross_request_report.py`，生成 `combined_*.json`。这些合并 JSON 只作为第 12 步交叉校验的对照链路，**不是交付物**；顺带产出的 `aggregated_product_metrics_all.xlsx` 同样不进交付清单（它每平台只取 1 张 sheet，多店同平台时只保留首店数据，易被误读为全量）。
11. 对每个可交付 request 运行一次 `scripts/spec_delivery.py`，并使用该 request 自己的 `workDir/raw_data`。
12. 读取 `references/report-pipeline.md` 与 `references/analysis-dimensions.md`，按其步骤生成**按店铺的商品问题诊断报告**：`build_report_facts.py --out-dir/--store-index` → `cross_check_facts.py` → `insight_parts.py scaffold`（按店+章节生成片段）→ Agent **为每个店铺逐片段**填写业务结论 → `insight_parts.py merge`（合成并复验 `agent-insight-<slug>.json`）→ `compile_report_view_model.py --store-index` → `render_report.py --store-index` → `validate_report_pipeline.py --store-index`。校验未通过必须修复后重渲染，不得交付。

    **洞察层产出方式（强制）**：**不要 write/edit 最终文件 `agent-insight-<slug>.json`**——它是脚本合成的派生产物。Agent 只写 `<run_dir>/report/agent-insight-parts/<slug>/` 下的小片段（`executive.json`、`sections/sec-*.json`、`footer.json`），再由 `insight_parts.py merge` 一次性合成并立即复验。这样最终文件永远合法，杜绝长 JSON 被整份重写截断成半成品。全流程禁止 read/write/edit `agent-insight-<slug>.json`；改诊断只改对应片段后重跑 merge。

    **除 `cross_check_facts.py` 外的每条命令都只跑一次**：各层都以 `store-index.json` 驱动全部店铺，命令数不随店铺数增长。不要为每家店手工重复调用单店参数。

    **数据保真三道闸（不得跳过、不得忽略其输出）**：

    - **未映射表头告警**：`build_report_facts.py` 会把「原始表里有数值、但没被任何规范字段吃掉」的列打印到 stderr。看到 `↑ 其中 N 列存在非零数据` 时，必须逐列判断该口径是否为本次分析所需；若是，先在 `product_report_fields.py` 的 `FIELD_ALIASES` 补别名再重跑，**不得直接把它当作「平台未提供」写进报告**。平台导出表头常有后缀变体（如 `退款金额(支付时间)`），别名表精确匹配，漏一个变体就会让整个章节静默降级。
    - **商品数守恒断言**：同上脚本会打印 `商品数守恒: 输入唯一ID N → 在线商品 M`。多份导出表（如「商品列表」与「商品卡列表」）描述的是同一批商品的不同渠道口径，必须按商品 ID 合并且**只补空不相加**。退出码 `3` = 守恒失败（输出商品数超过输入唯一 ID 数），说明去重失效，商品总数与动销率已失真，必须修复而非重跑。
    - **跨链路交叉校验**：`cross_check_facts.py --store-index` 会汇总全部按店 fact-pack，再与 `combined_unified_products.json` 比对两条独立链路的商品集合、商品数与 GMV。退出码 `1` = 不一致，**报告不得交付**。两条链路读同一批原始数据却得出不同结果，必然有一条是错的。

    七条报告命令及其必填参数只在 [`references/report-pipeline.md`](references/report-pipeline.md)「执行步骤」维护。执行时逐条使用其中的 `<skill_dir>` / `<run_dir>` 绝对路径形式，不要从其他文档复制历史命令。

    `storeSlug` 由事实层按 `平台-店铺名` 生成并写进 `store-index.json`，**不要自己拼**：重名店铺会被自动加数字后缀，手拼会对不上文件。

13. 运行 `scripts/collect_deliverables.py --run-dir <run_dir> --report-manifest <run_dir>/logs/report-manifest.json --json` 生成交付清单：按店铺输出「该店报告 → 该店原始数据」配对，店铺之间按平台顺序排列。原始数据由脚本按 `storeSlug` 前缀自动匹配 `raw_data/`，无需手工指定。**传 manifest 而不是单个 HTML 路径**——按店链路有多份报告，`--report` 只能带出一份，会导致其余店铺静默缺席。该命令把清单打到 **stdout**，必须由调用方重定向落盘到 `<run_dir>/logs/present_files.json` 再读取；只运行不重定向会导致读到上一阶段的旧清单（表现为报告缺席）。
    **不要调用 `scripts/collect_present_files.py`**：它是 chat / review 链路的内部脚本，必需 `--delivery-log`（JSONL）与 `--out`，不接受 `--run-dir`，在本 Skill 直接调用必然报参数缺失。
14. 读取 `references/output-contract.md`，再组织最终对话回复；对话只给执行状态、关键结论和报告链接，商品分层明细以报告为准。进度与最终结果中的账号始终带脱敏 `account`。

## 术语

| 术语 | 含义 |
|---|---|
| `run root` | 单次用户请求对应的顶层 `data/product-analysis-<timestamp>/` 目录。 |
| `request workDir` | 来自 `rpa-post-process-result.json.requests[].workDir` 的单个店铺 request 目录；非拼多多由 Execution 创建，拼多多由 DOM 落盘器创建；同名 Profile 账号按 `storeAccountId` 隔离。 |
| `combined JSON` | 根目录下的跨 request 文件 `combined_aggregated_product_metrics.json` 和 `combined_unified_products.json`。 |
| `store-index` | `<run_dir>/report/store-index.json`，事实层产出的店铺清单，驱动 insight / view-model / render / validate 各层按店处理，是报告链的店铺事实源。 |
| `storeSlug` | 店铺的文件名安全标识（`平台-店铺名`，重名自动加后缀），由事实层生成，决定 fact-pack、insight、view-model 与报告 HTML 的文件名。 |
| `交付配对` | `logs/present_files.json` 的排列方式：每家店的报告紧跟自己的原始数据 Excel，店铺之间按平台顺序排列，无跨店合并入口。 |
| `present_files` | 从 `logs/present_files.json` 原样加载的最终展示文件数组。 |

## 资源

| 资源 | 读取时机 | 用途 |
|---|---|---|
| `../discover-store-accounts/SKILL.md` | 本轮首次解析账号时 | 新版账号字段、展示格式、目标确认和 `enable` 三态门禁的唯一契约。 |
| `references/workflow-gates.md` | 执行工作流前 | 关卡命令、通过条件和快速失败规则。 |
| `references/data-source-mapping.md` | 需要确认平台产物口径时 | 各平台采集产物、字段映射与消费口径（含拼多多商品页的 DSL 采集与字体解码说明）。 |
| `references/dsl-selection.json` | 生成非拼多多 `batch-request.json` 前 | 非拼多多平台稳定原子 DSL 白名单；拼多多不从此文件选择 RPA。 |
| `references/supplemental-product-filter-workflow.md` | 已有明确商品 ID，用户要求淘宝/天猫瓴羊人群补采时 | 显式补采入口、10 个一批的拆分契约、dry-run 和失败边界。 |
| `references/supplemental-dsl-scenarios.json` | 生成补采请求时由脚本读取 | 补采场景到 DSL、平台身份和 filter 上限的机器可读映射。 |
| `references/metric-selection.json` | 解释分析指标和缺口时 | 报告/诊断指标列表；绝不传给 Execution。 |
| `references/data-source-mapping.md` | 检查产物、page ID、sidecar 和聚合输入时 | 五平台商品数据来源映射；含 1688 `--page-id` 与 sidecar 目录名对照。 |
| `references/analysis-dimensions.md` | 生成诊断和建议前 | 已覆盖维度、指标公式、平台缺口和方法论边界。 |
| `references/report-pipeline.md` | 生成 HTML 报告前 | 报告五层管道、按店分组契约、章节字段依赖、自适应降级、诊断撰写规则与模板契约。 |
| `assets/report-columns.json` | 编译报告视图模型时 | 各章节展示列配置；由 `compile_report_view_model.py` 直接消费。 |
| `assets/report-template.html` | 渲染店铺报告时 | 纯占位符店铺报告模板；只能由 `render_report.py` 消费，不得手工编辑产物。 |
| `assets/catalog-template.html` | 已废弃（目录页下架） | 仅保留供历史 run_dir 排障对照；正式链路不消费，传 `--catalog-template` 会被忽略。 |
| `references/output-contract.md` | 最终文件交付和对话回复前 | 事实源、present_files 规则、多平台问题商品分层和最终输出形态。 |
| `references/script-inventory.md` | 调用或调试脚本前 | 主链路/内部/历史脚本角色、副作用和 dry-run 指引。 |

## 输出契约

- 最终展示文件必须来自 `<run_dir>/logs/present_files.json`，不得手工编辑。
- 交付清单固定为按店配对：「店A 报告 HTML → 店A 原始 Excel → 店B 报告 HTML → 店B 原始 Excel → …」，店铺之间按平台顺序。不得包含店铺目录页、`aggregated_product_metrics_all.xlsx`、per-request 中间 JSON、`store-index.json`、`fact-pack-*.json`、`agent-insight-*.json` 或 `report-view-model-*.json`。
- 清单首位是第一家店的报告；单店场景即该店报告 + 其原始 Excel 两项。
- 每个店铺的报告只能包含本店商品；报告内任何指标、分层阈值与分母都只用本店数据计算，不得跨店求和或借值。
- 报告与对话结论必须使用合并 JSON 事实源、request 级聚合 JSON 或原始 Excel；数据缺失必须按缺口说明。
- 各平台问题商品必须先按下方规则分类，分类结果写入报告章节；只有报告与对话明确给出商品 ID 后，后续请求才满足 `multi-platform-single-product-analysis` 的触发前提。不得把全部零销量商品统一列为下钻对象。
- 非淘宝平台按其真实字段输出客观统计；字段不足时说明缺口，不得伪造淘宝专属指标。存在可靠商品 ID 时，可以给出跨平台单品下钻指令。

完整输出契约见 `references/output-contract.md`。最终回复前按该契约复核一次，修复违规项后再交付；无法解决时报告例外。

## 问题商品分类与单品下钻决策

对五平台具备可靠商品 ID 与相应证据字段的商品执行本节；平台字段不足时进入“数据不足”，不得跨平台补值。使用 `combined_aggregated_product_metrics.json`、`combined_unified_products.json` 或对应 request 聚合 JSON 中本次采集的可靠字段；每个商品只进入一个主分类，可附带次级信号。分类时先排数据缺口，再按以下优先级判断：

| 优先级 | 主分类 | 判定条件 | 是否调用商品明细 Skill | 用户动作 |
|---|---|---|---|---|
| 1 | 数据不足 | 分类所需字段缺失、不可读或来源不可靠 | 不调用 | 明确缺失字段并建议补采，禁止把占位 `0` 当成真实价格、库存或流量 |
| 2 | 非在线商品 | 商品状态明确为已下架、删除、停售等非在线状态 | 不调用 | 从当前经营诊断中剔除；如计划重新上架，先检查商品状态与基础信息 |
| 3 | 库存积压待诊断 | 库存字段可靠，且 `stock / sales_count > 3`；销量为 0 时单独说明分母不可计算，仅记录高库存零销量信号 | 推荐，优先选择库存规模或访客更高的商品 | 深挖流量、转化、投产、退款和承接问题，再决定清仓或降补货 |
| 4 | 核心流量零成交 | 在线商品 `sales_count = 0`、支付/GMV 为 0、`uv > 0`，且属于覆盖在线零成交商品累计 80% UV 的最小商品集合 | **强烈推荐** | 直接调用 `multi-platform-single-product-analysis`，排查主图、价格、详情、评价、流量来源和转化链路 |
| 5 | 长尾低流量零成交 | 在线商品 `sales_count = 0`、支付/GMV 为 0、`uv > 0`，但未进入累计 80% UV 集合 | 暂不优先 | 先优化曝光、标题、关键词和流量获取；下一周期 UV 上升后仍零成交，再下钻 |
| 6 | 无访问零成交 | 在线商品 `sales_count = 0`、支付/GMV 为 0、`uv = 0` | 不建议立即调用 | 先检查类目、搜索收录、标题主图和基础流量分配 |
| 7 | 正常动销 | 在线商品 `sales_count > 0` 或支付/GMV > 0，且无其他已覆盖异常信号 | 默认不调用 | 保留观察；只有用户要求或出现转化、库存等组合信号时再下钻 |

分类和呈现规则：

1. 先从原始 Excel 或可靠事实源读取商品状态；非在线商品不得进入流量、转化或动销问题分类。
2. “累计 80% UV”只使用本次店铺的在线、零成交且 `uv > 0` 商品计算：按 UV 降序累加，取累计占比首次达到或超过 80% 时的最小商品集合；边界 UV 并列商品一起纳入。
3. 若所有有访问零成交商品 UV 总和为 0，跳过核心流量/长尾分类；若 UV 字段整体缺失，则统一进入“数据不足”。
4. **分层明细一律写进 HTML 报告，不在对话中展开。** 报告的「零成交商品」章节用问题维度给出各层数量、动作与商品 ID；对应表格列出完整商品 ID、标题、状态、UV、销量、GMV 等证据值。对话中不得再使用 `<details><summary>` 折叠明细复述同一批内容。
5. 上表第 1—7 类是**底层判定逻辑**，映射到报告章节：非在线商品在事实入口剔除并只记录数量；核心流量零成交、长尾低流量零成交、无访问零成交进入「零成交商品」章节的分层判定与问题维度；库存积压待诊断在库存字段可用时进入该章节；数据不足在对应章节内就地标注为降级说明；正常动销进入「Top 商品成交结构」。
6. “长尾低流量零成交”和“无访问零成交”必须在报告中写明为什么暂不建议下钻，避免用户把诊断资源花在尚未获得有效访问的商品上；非在线商品只在报告口径说明中交代剔除数量。
7. 商品标题可以缩写，但商品 ID、商品状态、UV、销量、GMV 等证据值必须保留；缺失值显示 `-`，不得显示为 0。
8. 当存在推荐下钻商品时，在对话中给出一条包含平台与明确商品 ID 的可执行指令：`帮我深度分析京东单品，商品 ID：<ID1>,<ID2>...`。没有可靠商品 ID 时不得引导单品 Skill。不要为每个商品重复同一模板。
9. 对话回复固定为：执行状态与账号（脱敏）→ 3—5 项关键数据 → 最高优先级结论 1—3 条 → 各分类数量一览 → 报告链接 → 单品下钻指令（如适用）。完整明细以报告为准。

## 易错点

| 风险 | 可观察症状 | 安全替代方案 | 停止条件 |
|---|---|---|---|
| 文档与脚本契约漂移 | 预期的 `combined_*.json` 缺失，导致交叉校验无法进行 | 停止并报告契约漂移；不要猜测替代文件 | 必须由用户批准维护模式修复。 |
| 逐店交付原始数据来源错误 | 交付内容包含其他店铺文件或空资产 | 只使用后处理结果中的 `requests[].workDir/raw_data`，并核对对应任务的身份与下载血缘 | raw data 目录缺失、没有 Excel、商家身份未确认，或下载任务的 `outputsPath → outputs[expectedDownloadKey].path` 无有效文件。 |
| 旧下载被贴上目标店铺名 | RPA 下载失败，但后处理仍从共享目录生成 Excel；文件时间早于本轮任务 | 停止该 request；只接受 Tool 原样返回的 `outputsPath` 中对应 download key 的 path，不得扫描共享下载目录或复用旧 page dir | 任一下载型 PASS 缺少有效 `outputs[expectedDownloadKey].path`，或源文件早于 `RUN_START_ISO - 2 分钟`。 |
| 单品请求误路由 | 用户提供商品 URL、标题关键词或要求分析一个商品，但没有明确商品 ID | 继续使用本 Skill 拉取商品列表 | 不得从 URL 猜测/提取 ID 后转单品 Skill。 |
| 明确商品 ID 未转交 | 用户明确指定 1–10 个商品 ID 并要求经营下钻 | 转交 `multi-platform-single-product-analysis` | 不要生成商品列表批量请求。 |
| 原始 Excel 被重复计入事实层 | 报告中每个商品出现两遍，副本无平台标签且标题不可点击；`productCount`、UV、GMV、退款金额恰好翻倍 | run root 的 `raw_data/` 是指向 `<workDir>/raw_data/` 的符号链接，两者是同一份文件；事实层按 `Path.resolve()` 真实路径去重，详见 `references/report-pipeline.md` §数据源去重 | `fact-pack.meta.sources` 长度不等于本次实际店铺数时，停止交付并排查去重逻辑。 |
| 1688 sidecar 缺 `--page-id` 导致静默零商品 | `aggregate_product_data.py` 返回 `status=success` 但 `total_product_count=0`、`platforms=[]`，全程无报错；`1688_excel/` 下只有 `core_statistics.json` | 按 `dsl-selection.json` 的 DSL ID 重新解析：商品明细页传 `--page-id item_shop_detail`，概况核心指标传 `--page-id flow_structure`，再重跑聚合 | 重新指定 page-id 后 `product_count` 仍为 0，才可判定为真实无商品数据。 |
| 脚本路径按相对路径传入 | `run_dir 不存在: <非本次运行目录>/data/...`、`JSON file not found`、`FileNotFoundError`，且报错路径前缀不是本次运行目录 | `python3` 的工作目录是当前 shell 的 cwd，不保证是本 Skill 目录或本次运行目录；所有路径先展开为绝对路径再传参，不要用 `../` 回退 | 同一命令因路径问题连续失败 2 次时停止改路径写法，改为核对脚本 `--help` 的参数契约。 |
| 把多店合并成一份报告 | 报告标题出现多个店铺名拼接，或 `overview.productCount` 等于全部店铺商品之和 | 事实层必须用 `--out-dir` 按店产出；用了 `--out` 兼容模式就会退回合并口径。检查 `store-index.json` 的 `storeCount` 是否等于本轮实际店铺数 | `fact-pack.meta.stores` 长度大于 1 时，停止交付并改用按店模式重跑。 |
| 同店多账号被并成一家 | 店铺数少于本轮 Discover 确认的账号数；某店商品数异常偏大 | 店铺隔离键是 `requestId` 而非店铺名。确认 `rpa-post-process-result.json` 里每个账号是独立 request，且 `requestId` 未缺失 | `store-index.storeCount` 小于本轮 request 数时排查隔离键。 |
| 报告与原始数据配错店 | 交付清单里某店报告后面跟的是别家店的 Excel；或 stderr 出现「未找到对应的原始数据 Excel」 | 配对键是 `storeSlug` 前缀（`<平台>-<店铺>-`），由事实层统一分配。手工改名 raw_data 文件或报告文件会打断匹配 | 出现「未匹配到任何店铺报告」告警时，停止交付并核对文件命名。 |
| 交付清单只有一份报告 | `present_files.json` 里只有某一家店 | `collect_deliverables.py` 必须传 `--report-manifest`；传 `--report <单个HTML>` 只会带出一份 | 清单中报告数不等于 `manifest.reports` 长度时，停止交付。 |
| 绕过管道手写报告 HTML | 交付物是自己拼的 HTML，未经 `render_report.py`；`validate_report_pipeline.py` 从未运行或无 manifest | 报告链任一步失败时排查该步的参数与前置产物，不得改用手写 HTML 顶替；手写产物必须删除后重渲染 | 只要 `validate_report_pipeline.py` 未通过，报告一律不得进入 `present_files`。 |
| 合成 `agent-insight-<slug>.json` 时校验循环失败 | `insight_parts.py merge` 反复报「章节 None 在 fact-pack 中不可用」+「缺少可用章节的结论：xxx」，改写结论内容后错误原样复现 | 这是 **key 名写错**（片段里 `section` 被写成 `sectionId` 等），不是内容问题。用 `insight_parts.py scaffold` 重生成片段并逐键 diff，只替换片段里 `TODO` 的值；完整字段契约见 `references/report-pipeline.md` §agent-insight.json 字段契约 | 同一条校验错误连续出现 2 次时，立即停止改写内容，转为比对片段或直读 `build_agent_insight.py` 的 `validate()`。**全程只改片段，不得 write/edit `agent-insight-<slug>.json`。** |
| 报告失败后降级为只交付 Excel | 最终回复里没有 HTML 报告，只有原始 xlsx，且把这种结果描述为正常完成 | 报告是本 Skill 主交付物。修复校验错误后重跑报告链；确实无法生成时，必须向用户明示失败阶段、原始报错与卡点 | 不得以「跳过报告」作为兜底结束流程。 |
| 交付清单读到旧内容 | `collect_deliverables.py` stdout 已含报告，但 `logs/present_files.json` 里仍只有 xlsx | 该脚本只打 stdout，不自动落盘；必须显式重定向到 `<run_dir>/logs/present_files.json` 后再读取 | 落盘后清单首位不是报告 HTML 时，停止交付并排查 `--report` 是否传了绝对路径。 |
| 单个 DSL 缺中文展示名卡死整批组装 | `assemble_dsl_run.py` 退出码 `2`，报 `DSL <平台>/<id> has no Chinese user-facing display name`，**全部**平台的采集都无法开始 | 这是 execution Skill 的 `DSL_DISPLAY_NAME_OVERRIDES` 漏配，不是业务数据问题；补上该 DSL 的中文名即可。**不要**为绕过它而删减 `dsl-selection.json` 的采集范围——那会静默缩小采集口径 | 补齐展示名后仍报同一错误，才排查 DSL spec 的 `template.name`。 |
| 淘宝 GMV/访客在合并链路归零 | `fact-pack` 与原始 Excel 一致，但 `combined_unified_products.json` 的淘宝 `total_gmv` 接近 0；`cross_check_facts.py` 报 GMV 相差两个数量级 | `build_unified_products.py` 的淘宝分支曾按旧「千牛在售商品」截面口径无条件丢弃 `gmv/uv/cart_count`；生意参谋商品排行（DSL `products`）是有这些字段的，必须透传 | 交叉校验 GMV 不一致时，先用原始 Excel 求和作第三方基准判定哪条链路错，不要默认事实层有问题。 |
| 同平台多店统计被覆盖 | 某平台商品数或 GMV 只剩最后一家店的量级，明显小于原始表求和 | `merge_cross_request_report.py` 按平台写 `combined_unified_stats[platform]`，同平台第二个 request 会覆盖第一个；计数与金额型字段必须累加 | 某平台有 N 家店但 `real_product_count` 约等于单店量级时，停止交付并排查合并逻辑。 |
| 交叉校验口径未对齐导致误报 | `cross_check_facts.py` 报「聚合链路多出 N 个商品ID」或「商品数不一致」，但逐条核对后这些商品要么已下架、要么无任何经营指标 | 事实层按在线口径剔除下架商品，也不收录只有名称/ID 的无指标行（如京东明细下载失败时只读到「商品名称+SPU」）；比对前必须扣除这两类，且先剔除占位行再计算扣减量 | 扣除后两侧商品数仍不等，才是真正的链路不一致。 |
| 把合并 Excel 当交付物 | 有人要求把 `aggregated_product_metrics_all.xlsx` 加回 `present_files` | 该文件每平台只取 1 张 sheet（日志会打印 `平台 'X' 匹配 N 份候选…只取第 1 份`），多店同平台时只含首店数据，交付会被误读为全量；跨店对比请用各店原始 Excel | 它只作为 `cross_check_facts.py` 的对照产物，任何情况下都不进交付清单。 |
| 把平台 lane 派给子 Agent 提速 | 出现 `sessions_spawn` | 全部平台仍由主 Agent 在当前会话执行 | 出现跨 run_dir 或拼多多回退 `pdd_goods` 时停止，该路径产物不得进入聚合。 |
| 部分店铺采集失败导致合并整体退出 | `merge_cross_request_report.py` 因个别 request 缺 `aggregated_product_metrics.json` 而报错退出，已成功的店铺也无法交付 | 默认直接忽略缺口继续交付已成功的店铺，不向用户追问：把无产物的 request 从 `rpa-post-process-result.json` 中剔除，另存为 `logs/rpa-post-process-result.deliverable.json` 再传给合并脚本，并在报告 `footerNote` 与对话摘要中显式列出缺席店铺与原因 | 不得静默丢弃失败店铺，也不得因个别失败放弃全部交付。 |
| 天猫店被标成淘宝店 | 报告标题、`storeSlug`、`store-index.platformLabel` 显示「淘宝」，商品链接指向 `item.taobao.com`，但该店实为天猫 | 天猫在 Router 侧归一为 `platform=taobao + commercePlatform=tmall`。三处必须全部透传：`build_plan.py` 的 `COMMERCE_PLATFORM_SKILLS` 白名单、`build_collection_requests.py` 的字段透传、`build_report_facts.py` 的 `display_platform()`。缺任一环，天猫身份都会在该环丢失 | `store-index` 中天猫店的 `platformLabel` 不是「天猫」时，回查上述三处哪一环没有透传。 |
| 拼多多店铺整店缺席报告 | `store-index.storeCount` 少于实际店铺数，拼多多既不在 `stores` 也不在 `skippedStores`，全程无报错 | 拼多多产物是 `pdd_structured.json` 而非 Excel。确认 `STRUCTURED_SOURCE_NAMES` 已包含该文件名，且 `extract_products()` 会按 `.json` 后缀分流到 `extract_products_from_structured()` | 拼多多 request 有 `raw_data/pdd_structured.json` 但 `store-index` 中无该店时，检查事实层的数据源后缀过滤。 |
| 报告结论全是套话 | 每个商品的结论都是「重点关注 / 指标存在优化空间 / 优化主图及详情」，换个商品也完全成立 | 这是**填写者**的问题，不是脚本的问题：`_check_substance()` 会拦截整段套话与无数值 evidence。收到该报错时补齐真实指标值与具体动作，不要改写成另一句套话绕过 | 校验器连续两次报同一条套话错误时，回读该商品在 fact-pack 中的实际指标再写结论。 |

## 边界情况与快速失败

- Discover `accounts=[]` 或目标全部 `enable=false`：停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。严禁只输出纯文本引导。
- Discover 调用失败、`data` 解析失败、账号字段非法、任一 Profile ID 缺失或目标匹配不唯一：报告“账号登录状态检查失败”并停止；不静默丢弃记录、不猜测、不回退共享浏览器。
- 全部目标 `enable=false`：列出全部 `平台 / 店铺名（脱敏账号）` 并停止；本商品分析 Skill 不使用无 ID relay 执行。
- 目标状态混合：自动跳过未登录目标、只执行 `enable=true` 的账号，不启动未登录项的 Browser RPA也不因此暂停；在开工播报中列出本次执行项与已跳过（未登录）项的“平台 / 店铺名（脱敏账号）”，并在最终摘要保留登录缺口。
- Router 计划 schema 不匹配：停止并报告计划路径/schema；不要手工编辑 plan。
- DSL 白名单或 DSL 规格缺失：停止并报告缺失的平台/DSL；不要替换或扩张 DSL。
- Execution `status=partial`：仅保留身份已确认且下载血缘完整的 request；其余 request 作为缺口报告。
- 任一 request 的业务页商家身份未确认、下载型任务缺少 Tool 原样返回的 `outputsPath`、`outputs[expectedDownloadKey].path` 不存在/不是文件、源文件早于 `RUN_START_ISO - 2 分钟`，或仅靠预存 page dir 判 `PASS`：停止该 request 的聚合与交付，并报告账号/数据归属未验证。`downloadedFiles=[]` 本身不是失败，Execution 应先从 outputsPath 回填。
- Request 级聚合失败：停止该 request 的下游处理，保留原始错误，并在安全时继续其他可用 request。
- 合并 JSON 缺失：交叉校验无法进行，报告不得交付；这是校验前置依赖缺失，不是交付物缺失。
- 某店铺无可分析在线商品：该店进入 `store-index.skippedStores`，由 `collect_deliverables.py` 打 warning 并在对话中说明，不生成空报告，也不因此中止其他店铺。
- `build_report_facts.py` 退出码 `2`（没有任何可解析商品行）：先区分“真的没有数据”和“源发现失败”，不得直接按无数据结案。该脚本只遍历 `raw_data` 的**一层**，且优先从 `--post-process-result` 的 `requests[].workDir/raw_data` 建立平台归属。若 Excel 实际位于 `raw_data/<平台>_<店铺>/` 子目录，或未提供 `rpa-post-process-result.json`，会以相同的退出码 `2` 报“没有可用的原始商品数据文件”。确认 `--post-process-result` 存在且其 `workDir/raw_data` 能直接列出 `.xls/.xlsx` 后仍为 `2`，才按缺口说明；任何情况下都不得用空模板或占位数据顶替。
- `build_report_facts.py` 缺少 `rpa-post-process-result.json`：该文件是本 Skill 报告链的前置依赖，用于提供 `platform` / `storeName` 归属与下载血缘。仅靠 `--raw-data-dir` 补位会让商品行丢失平台标签与详情页链接。文件缺失时停止报告生成并报告血缘缺口，不得伪造下载血缘。
- `build_report_facts.py` 退出码 `3`（商品数守恒断言失败）：输出商品数超过输入的唯一商品 ID 数，或输出中存在重复商品 ID。这是去重逻辑失效的确定信号，商品总数、动销率、GMV 占比全部已失真。必须修复合并逻辑，**不得重跑或降级处理**——重跑只会得到同样错误的结果。
- `build_report_facts.py` 打印大量「未映射」告警：逐列判断该口径是否为分析所需。含非零数据的列尤其可疑，历史上就发生过因 `退款金额(支付时间)` 未映射，导致整个退款章节被误报为「平台未提供」、而实际全店退款率为 100% 的严重误判。补 `FIELD_ALIASES` 后重跑，不得把漏映射当成平台缺口。
- `cross_check_facts.py` 退出码 `1`（跨链路不一致）：`fact-pack` 与 `combined_unified_products.json` 对同一批原始数据得出了不同的商品集合 / 商品数 / GMV，必有一条链路出错。定位并修复后重跑，**报告不得交付**。退出码 `2` 表示输入缺失、未能校验，需补齐输入而非跳过。
- `build_agent_insight.py` 校验失败：修正结论中的引用或补齐未填写字段后重试；不得跳过校验直接编译 view-model。
- `validate_report_pipeline.py` 失败：报告不得进入 `present_files`。结构漂移说明产物被手工编辑，必须重新渲染而不是手改 HTML。
- 报告出现成片缺失占位符：**第一反应必须是核对原始表头，而不是当作平台数据缺口向用户汇报**。先看 `build_report_facts.py` 的未映射告警与 fact-pack 的 `meta.coverage`，确认是别名漏配还是平台确实没有该口径。整列无值的列会被 `compile_report_view_model.py` 自动隐藏，因此若仍能看到成片占位符，几乎必然是数据侧问题。
- 输入未变但重复失败：不要重试；报告阶段、命令、原始错误和下一步。

## 完成标准

- 本轮只 Discover 一次（用户登录后明确继续的刷新除外），完整账号已确认并通过 `enable` 门禁。
- 非拼多多平台未出现任何 `sessions_spawn`；拼多多只有主 Agent 缺浏览器原子工具时才允许每店一个 `browser` 子会话，全部平台产物落在同一个 run_dir。
- 路由归一正确：`execution-plan.json` 覆盖全部平台（含拼多多），未生成 `pdd-dom-plan.json`；拼多多执行记录的 `collectionMethod=rpa_dsl`。
- 非拼多多 `logs/batch-request.json` 通过新版 Execution 契约；拼多多 DOM 流程已核验 storeId/storeAccountId 对应账号，并在页面确认店铺身份。
- 非拼多多 Execution 后处理结果与拼多多 DOM request 记录均可读，complete/partial 状态已如实报告。
- 每个可用 `requests[].workDir` 均已聚合，或已有明确缺口记录。
- 最终回复前，`<run_dir>/combined_aggregated_product_metrics.json` 与 `<run_dir>/combined_unified_products.json` 已存在（供交叉校验对照，不进交付清单）。
- 逐店交付使用每个 request 自己的 `requests[].workDir/raw_data`，且在有数据时包含原始 Excel 和 `meta.json`。
- 每个可交付店铺都已生成独立报告，且 `validate_report_pipeline.py` 通过；`logs/present_files.json` 中每家店的报告与其原始数据相邻成对，不含目录页与任何跨店合并 Excel。
- 各店报告之间无商品串号：校验层已按店比对商品 ID 归属；每份报告都能匹配到对应的原始数据，无孤儿文件告警。
- 报告中每条结论都引用真实 `candidateId` 与真实商品 ID；不可用章节已显式降级为缺口说明，未携带任何结论。
- 每个问题都写成「结论 / 论点 / 修复建议」三段；漏斗对每个**口径可比**的阶段有独立分析。
- 口径不可比的漏斗阶段（如淘宝只有加购件数、无加购人数时的前两段）不产出分析、不展示，漏斗图本身仍完整展示节点与比值。
- 单品问题按 `references/report-pipeline.md` 的组合信号表定位「用户在哪步被劝退」，论点至少引用 2 个信号；UV 过小的商品定性为曝光不足，不解读转化类指标。
- 需要本 Skill 之外证据时，已按固定路由骨架「对商品进行XX分析，商品ID为：XXXX，重点分析：……」引导下游分析，未给出猜测性归因。`followups.analysis` 白名单**只有四项**：`广告分析`、`投放分析`、`单品分析`、`评论分析`，与 `scripts/report/build_agent_insight.py` 的 `FOLLOWUP_ANALYSES` 严格一致。注意两点：沟通分析按会话维度组织、无法用商品 ID 调用，不得写入 `followups`（确需查客服会话时写进维度的 `fix` 作为人工动作）；`multi-platform-store-analysis-new` 使用的「单品下钻分析」「评价分析」是**另一套命名**，在本 Skill 中分别对应 `单品分析` 与 `评论分析`，直接套用会被校验拦截。
- `logs/present_files.json` 是最终展示文件的唯一事实源。
- 最终对话回复给出执行状态、关键数据、最高优先级结论、分类数量一览和报告链接，未重复展开分层明细；仅在平台存在可靠商品 ID 与可用问题商品数据时输出单品下钻建议。
