---
name: multi-platform-single-product-analysis
displayName: 多平台单品下钻分析
description: 对淘宝、抖店、京东、拼多多和 1688 自家店铺中用户明确指定的 1–10 个商品 ID 做经营下钻，并为每个商品生成 HTML 报告。商品 ID 是必要触发条件；商品 URL、标题关键词、泛化“分析这个商品”或自动 Top 商品不能触发本 Skill，未指定商品 ID 时必须走 multi-platform-product-analysis 拉取商品列表。淘宝提供瓴羊深度维度，1688 逐商品直接下载单品分析导出并提供日粒度趋势，其余平台按各自商品明细真实字段分析并明确缺口。不得用于竞品、公开商品详情或修改商品。
---

# 多平台单品下钻分析

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 工具执行，脚本路径与传参路径先展开为绝对路径。

## Purpose

本 Skill 只做淘宝、抖店、京东、拼多多和 1688 自家店铺中明确商品 ID 的单品下钻：按 `references/dsl-selection.json` 选择各平台 DSL（淘宝瓴羊、京东商智单品分析页、拼多多商品数据详情页、抖店商品详情页在 RPA 层用 `filters.productIds` 直接锁定商品；1688 采商品明细后由报告层筛选）、委托 `multi-platform-rpa-execution-new` 采集全部平台、按 ID 精确筛选 1–10 个目标商品、构建 REPORT_DATA v3、生成诊断卡、命中触发条件时默认对本品商品页做靶向深度调研并与后台指标交叉、为每个商品渲染独立 HTML，并在多商品场景生成批量目录后按店交付。不得从 URL 或标题推导商品 ID，不得做竞品拆解或修改任何经营对象；页面采集只针对**本品自己的商品页**，用于解释后台指标成因，不涉及竞品。

## Non-Negotiable Rules

- **支持淘宝/天猫/千牛、抖店、京东、拼多多和 1688 商家账号**；淘宝走瓴羊深度 DSL，京东走商智单品分析页四件套，抖店走罗盘商品详情页 DSL，拼多多走商品数据详情页 DSL，1688 逐商品直接下载单品分析导出；只输出真实可用字段并记录缺口。
- **拼多多使用 `pdd_single_product` DSL，禁止回退 `pdd_goods`**：拼多多商家后台没有可下载的单品报表，商品数据只存在于「商品数据详情」页，且数字用动态 `spider-font` 私有字体渲染。该页是同源 iframe `/sycm/goods_data_detail_page?goodsId=<ID>`，URL 携带明文商品 ID，因此 DSL 用 `filters.productIds` 直达该页，无需模拟搜索点击；字体解码由 Execution 后处理（`pdd_font_decoder.py` + `pdd_product_parser.py`）完成。`maxItems=1` 表示一次运行只采一个商品，多商品由 `build_collection_requests.py` 自动拆成独立 request。**采集失败时唯一允许的动作是重跑该 DSL 或如实报缺口，禁止回退 `pdd_goods`（店铺经营口径）、禁止在页面内执行自定义 JS、禁止用页面文本摘数凑数。**
- **1688 不走店铺级链路**：用户给出商品 ID 后，登录态下**逐商品**用 `downloadFile` 下载单品分析导出（每行一天），该导出就是 1688 单品下钻的**唯一数据源**。`dsl-selection.json` 里 1688 的批量清单为空，逐商品清单为 `item_single_core_index`（模板在本 Skill 的 `assets/dsl/1688/`，不依赖 Execution New 的 DSL 仓库）。本轮目标只有 1688 时，`batchRequired` 为 false 且不生成 `batch-request.json`，**跳过步骤 7（Execution New）**；混合其他平台时其他平台照常跑 batch。商品明细若恰好存在，**只允许补齐标题/类目/停留/跳失等属性字段**，绝不得覆盖任何量类与率类指标。
- **1688 单品核心指标的落盘名必须带商品 ID、且必须落到 request 级 raw_data**：下载用 `downloadFile` 取导出端点直链（**goto 拿不到文件，已验证**），产物只认 `outputs[itemSingleCoreIndexFile].path`，再由 `scripts/ingest_single_core_index.py` 生成 `<execution/<requestId>/raw_data>/1688-<店铺>-单品核心指标-<商品ID>-<窗口>.xlsx`。该导出表只有 20 列、**表内无商品 ID 列**，商品归属完全靠文件名，解析不出 ID 的文件会被整份忽略；而 `resolve_target_products.py` 与 `build_report_data.py` 读的都是 request 级目录，写错层级会让报告层静默判为数据缺口。导出端点路径以 `.json` 结尾但内容可能是 xlsx 或者老式 xls，格式按魔数判定，不看扩展名。**真表头在第 6 行（索引 5，前面带 2 行数据说明 + 3 行空行）**，取数层靠表头锚点（终端类型+日期）定位，不得回到“前 5 行启发式”，否则整条链路静默无数据（已实测）。
- **1688 时间档位与分终端口径（均真机验证，不得凭 URL 参数推断）**：页面 5 个档位对应 `dateType` 为 日=`day`、近7天=`recent7`、近30天=`recent30`、周=`week`、月=`month`（**`date30` 是无效值，实测返回 200 + 0 字节空文件**）。`dateType` **只控粒度不控窗口长度**：day/recent7/recent30 返回的文件字节完全相同（都是近 30 天日粒度），所以近7天与近30天无需分开下载，分析窗口由取数层本地裁剪；但 `dateRange` **必须精确等于该档位的规范窗口**，否则同样静默返回 0 字节，因此渲染器区分「下载窗口」与「分析窗口」，两者不得混用。**导出表每个日期固定 3 行：所有终端/PC端/无线端**，分终端分析无需额外采集（导出端点不接 `device` 参数）；但**访客数是去重指标**（官方口径为 PC 与无线相加去重，已实测 所有终端=28 而 PC10+无线21=31），绝不得用分终端相加重构全终端访客数；收藏与加购无分端数据（页面自述）。流量来源卡有**自己的**终端下拉（只有 PC端/无线端，无「所有终端」，默认值不固定），其导出**只有表头零数据行**（平台缺陷）而页面卡有数据，所以只能读页面且必须带终端标签；SKU 卡无下载入口，广告 tab 无终端切换器。详见 `references/collection-workflow.md`。
- **主 Agent 直接执行全流程**；禁止通过 subagent、`SessionsSpawn`、其他 Agent、新线程或委托机制执行本 Skill 任一步骤，包括页面深度调研阶段。深度调研的商品页采集与读图由主 Agent 自身使用 `ecommerce-search` 的 `detail_extract` 能力完成。**唯一例外**：主 Agent 没有浏览器原子工具时，拼多多 DOM 采集允许为**每个拼多多店铺**委派一个 `browser` 子会话完成整段采集，子会话必须复用同一 `run_dir`，不得另建业务运行目录，也不得把非拼多多平台或报告、交付步骤派给子会话。
- **图片必须先落本地再读**：新任务不再执行独立主图 RPA 采集；京东核心 DSL 已返回的商品明细搜索结果主图只作为报告头视觉锚点，必须先由 `scripts/report/jd_main_image.py from-postprocess` 下载到本轮 `report_model/evidence/<商品ID>/jd_main_images/` 并通过 MIME、文件头、尺寸和 SHA-256 校验，再以内联 data URI 写入 `product.mainImage`，失败不阻断核心报告。页面诊断图片仍只来自用户确认 deep research 后的前台详情页采集。深研只读取 `evidence_observation.py plan` 列出的 pending 本地路径，禁止对图片使用 `web_fetch`；每批必须在同一条 Agent 消息并行发起视觉读取，禁止逐张串行，读完后该批全部回填结果必须经 `evidence_observation.py observe` 一次性写回，禁止逐张 edit read-plan JSON。固定批次只以 `references/deep-research-integration.md` 为准。
- **新任务主图信号结果只允许 v2**：`main-image-analysis-result.json` 只作为兼容现有 validator 的信号清单，正常形态为 `shouldRun=false/status=skipped`；命中的 `triggerReasons` 由 deep research 承接到 `head_images` focus。v1 默认拒绝，只允许排查历史产物时显式 legacy flag 读取并接受告警。
- **深度调研为用户可选项且不反向阻塞核心分析**：askUser 返回后必须立即用 `record_deep_research_selection.py` 记录 `requested` 或 `not_requested`，禁止凭 deep 文件是否存在猜分支。`not_requested` 不导入、不读取、不创建 Result/Fusion/Evidence，核心 HTML 独立完成；`requested` 才执行深研。深研由脚本 finalize 为 `success/partial/failed`，三者都不阻塞核心报告；只有未决 `pending` 或非法 provenance 阻止正式收尾。
- **深研图片必须交付且不得静默删图**：主图最多展示 5 张、详情图最多展示 5 张、页面截图全部展示；超过 5 张时报告必须写明采集/展示/省略数量。已有选中证据未嵌入、重复嵌入或 base64/SHA-256 不一致均由 `check_deep_research_evidence` 阻断。普通报告仍限 500KB；深研报告压缩目标 2.5MB、硬上限 3MB，压缩不得以删除选中图片换体积。
- **深度调研必须交叉、禁止拼接**：用户选择执行深度调研时，其结果**严禁原样拼接**到报告中。每条页面发现必须与后台指标交叉后才能写入报告——单独的页面描述（如「详情页第3屏有5张图」）不构成分析结论，只有「后台数据异常 + 页面证据解释为什么异常」才是有效交叉。把深度调研结果平铺罗列到报告中 = 报告门禁 FAIL（`check_deep_research_fusion` 拦截）。
- **账号门禁只使用 `discover_store_accounts`**；先从完整 `accounts[]` 确定目标，再按目标记录的 `enable` 判断是否放行。用户可见位置使用“店铺名（脱敏 `account`）”，同店多账号不得合并。
- **打断边界**：执行前允许的打断项**只有下列五项**（白名单，与本文件工作流逐条对齐，**白名单之外不得新增**）：①平台范围；②店铺范围；③商品归属确认（步骤 5）；④目标商品消歧（步骤 9，仅 `target_not_found` / `ambiguous_target` 时）；⑤页面深度调研确认（步骤 12）。五项全部必须用 `ask_user(mode="form")`，表单构造一律遵循 [`../multi-platform-intention-router/references/common/a[REDACTED].md`](../multi-platform-intention-router/references/common/a[REDACTED].md)：③⑤属**决策型**（选项 2-6 个，必须同时有正向与否定）；①②④属**消歧型**（选项即真实候选、不要求否定选项，平台清单等固定枚举须完整列出、不受 6 个上限约束）。两类都禁止只给 1 个选项、禁止同义选项、禁止与客户端内置「跳过」键重名，需要用户提供输入时正向路径必须是显式选项而非只靠自由文本框。平台意图不明确时先追问平台（选项含「全部平台」），平台确定后店铺无法唯一确定时再追问店铺。店铺打断条件只按**已登录**（`enable=true`）候选判定：用户指定的店铺在已登录候选中无法唯一匹配（同店多账号）、同平台已登录候选 `N_on≥2` 且用户本轮未唯一指定（只给平台名、未点名具体店铺也未说“全部店铺”），并列出候选“店铺名（脱敏账号）”让用户选择（含「全部店铺」选项）。`N_on=1` 或用户已唯一指定（含明确“全部店铺”）时不打断；`<active_store>`、历史店铺、路由注入信息一律不算用户已指定。旧口径「平台级全选时不需确认」已废止。**登录状态不是打断项**：目标 `enable` 混合、某平台无已登录店铺或无候选时自动跳过这些目标并在开工播报中列明后继续。时间窗（缺省近 7 天）、毛利率等有默认行为的项一律取默认并提示后继续，禁止用普通文字、Markdown 表格、编号列表、「确认使用【…】」「请回复'确认 + 店铺名'」「请确认目标店铺后开始」句式或任何自由文本框索要确认。**用户诉求（含用户自带模板）里出现本 Skill 覆盖不到的项时，不得把「缺这项输入」升级成前置阻断**：先交付本 Skill 范围内的产物，再在最终摘要显式声明「该项未覆盖 + 需要什么输入 + 应走哪个 Skill」；竞品方向按 `references/skill-handoff.md` 在交付后追问，不得在采集前索要竞品链接。
- **开工播报（硬规则）**：目标锁定与商品归属门禁完成后、首个采集调用之前（工作流步骤 5.5，字段口径以那里为准），必须按 `../multi-platform-intention-router/references/common/kickoff-briefing-contract.md` 播报**恰好一次**并在同一轮继续执行；禁止用 `ask_user` 承载，其余禁令见契约 §5。
- **Profile 只能由三个 ID 定位**；调用 Browser Tool 时，顶层 `platformId`、`storeId`、`storeAccountId` 必须来自同一条发现记录。名称和脱敏账号仅用于展示与日志，不得参与定位。
- **三个 Profile ID 缺一即静默降级到用户主浏览器**：宿主只在 `platformId + storeId + storeAccountId` **同时存在**时才选中隔离 Profile 浏览器；缺任意一个都不会报错，而是回退到旧的「用户浏览器」通道，用当前 Chrome 的登录态执行采集。此时采回来的是**用户主浏览器当前登录的那个店铺**的数据，且整条链路（Execution → fact-pack → 报告）都不会察觉，最终产出一份张冠李戴、看不出异常的报告。因此每次 `browser_rpa_launch` / `browser_rpa_run` 调用前必须逐项确认三个 ID 均为非空字符串，**禁止只传两个**，也禁止用 `storeName`/`account` 替代任何一个 ID。已发生过真实事故：漏传 `platformId` 后采到了另一店铺的商品概况，并据此得出"账号绑定错误"的错误结论。
- **商品 ID 必须由用户在路由前明确指定**，最多 10 个；缺失商品 ID 必须 fail-fast 并转 `multi-platform-product-analysis` 拉取商品列表。淘宝瓴羊、抖店商品详情、京东单品分析页、拼多多商品数据详情页 DSL 通过 `filters.productIds` 下发；1688 商品明细 DSL 在采集后按 ID 精确筛选。
- **禁止从商品 URL、标题关键词或自动 Top 商品推导商品 ID**；这些输入不触发本 Skill。
- **账号链路复用基础 Skill**：一轮业务只通过 `../discover-store-accounts/SKILL.md` 发现一次账号。账号发现必须带非空 `platformIdList` 调用一次，禁止零参数与 `[]`；抖店映射为 `dy`，淘宝与天猫严格互不归并。用户平台意图不明确时必须先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再调用，禁止默认全平台继续。完整推导见 `../multi-platform-intention-router/references/common/store-scope-contract.md`「账号发现范围统一契约」；基座的零参数分支在本链路不适用。先用返回的 `accounts[]` 逐平台完成店铺范围消歧（只按已登录候选数 `N_on` 判定）：`N_on=0`（无候选或候选全部未登录）时自动跳过该平台；`N_on=1` 或用户已唯一指定（店铺名精确命中一条，或明确说“全部店铺”）时直接锁定；`N_on≥2` 且用户未唯一指定（只给平台名）时**必须** `ask_user(mode="form")` 让用户从**已登录**候选“店铺名（脱敏账号）”中选择（含「全部店铺」选项，未登录项不作为选项）。旧口径「平台级全选时不需确认」已废止。消歧锁定后执行 `enable` 门禁：全部 `true` 直接继续；**部分为 `false` 时自动跳过未登录目标、只跑已登录目标，不打断、不追问**；全部 `false` 时停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失），严禁只输出纯文本引导。不得输入账号密码、调用登录 DSL、使用当前浏览器登录态兜底，或按店铺名/脱敏 `account` 定位 Profile。
- **Profile 选择器不可拆分**：`platformId + storeId + storeAccountId` 必须从本轮同一条账号记录取得并完整透传；`platformName + storeName + account` 只用于展示和日志。所有用户可见账号信息均使用 `平台 / 店铺名（脱敏账号）`。
- **采集后必须核验页面店铺身份**：Profile 三 ID 传全只保证「路由意图正确」，不保证「实际落在目标店铺」。首个采集任务返回后，必须从其 `readText` 输出（如京东商智的 `product_360_body_text`、淘宝生意参谋页头）中读出页面可见的店铺名，与目标 `storeName` 比对。不一致时**立即停止本店全部后续任务，废弃已采数据**，排查 Profile 参数后重采；禁止基于身份未核验的数据继续 fact-pack、写报告或向用户下结论。若页面未暴露可识别身份，暂停并请用户确认，不得默认放行。核验结论只能引用采集输出中的真实文本，不得凭工具超时、通用错误码或猜测编造「页面显示的店铺名是 X」这类业务细节。
- **不实现取数能力**；采集能力唯一事实源是 Execution New 的 batch schema 与 DSL spec。下载型任务只接受 Browser RPA 原样返回的 `outputsPath`，并按 assembled plan 的 `expectedDownloadKeys` 读取 `outputs[<downloadKey>].path`；不得扫描 `~/Downloads`、Desktop、Documents、浏览器 Profile 或其他共享下载目录。
- **绝对禁止手工构造任何数据文件（v2.7 铁律，最高优先级）**：无论采集是否失败、下载是否超时、报表是否为空，都**禁止**用 `pandas.DataFrame(...).to_excel()`、`openpyxl`、`csv` 或任何代码手写、拼装、"补全"一份 Excel/CSV/JSON 数据文件放入 `raw_data/` 或交付 `assets/`。也禁止把从页面 `body_text`、截图、日志里肉眼摘抄的数字重新组装成"原始报表"。`assets/` 中的每一个文件都必须是平台后台真实导出的产物，字节级来自 `outputs[<downloadKey>].path` 或用户手动提供的下载文件。
  - **已发生真实事故（必须避免重演）**：京东单品分析 4 个 DSL 的下载步骤全部超时、`ingest_jd_download.py` 因不支持 `single_product_*` page-id 报错、`rpa_post_process.py` 以退出码 3 判定 4 个任务全部 `MISSING`。此时正确动作是**停止并请用户手动导出**；实际却写了一个 `generate_jd_data.py` 用 `pd.DataFrame([{...}])` 拼出「核心数据 / 流量结构 / 流失分析 / 评价指标」4 个 xlsx 塞进 `assets/`，与真实 RPA 产物混放交付。用户无法分辨哪些是官方下载、哪些是 Agent 编的。
  - **判定标准**：交付目录 `assets/` 内出现任何一个不是平台导出的文件 = 严重违规，等同伪造数据。
- **允许数据不完整生成报告**：`verify_upstream_contract.py` 返回非 0 时（如报表缺失或为空壳），**不再中止流程**。Agent 应继续执行后续步骤生成报告，但缺口只记录到日志/receipt/warnings，并在对应业务模块内轻提示；正式运营报告不单独添加大段「数据源缺口声明」章节。禁止通过构造数据、用页面文本凑数或降低校验门槛来掩盖缺失，宁可保留缺口也必须确保数据来源真实。
- **空值语义禁止臆断**：报表中的 `--`、空单元格、0 行数据，只能解读为「未取到 / 数据缺口」，**不得**写成「本期无退款」「无中差评」「无投放」这类业务结论。已发生真实事故：把评价指标的 `--` 当成 0，在报告里断言「本期无退款、无中差评，售后侧不构成转化阻力」，属超出证据的结论。确需判断"真的没有"时，必须有平台明确的零值证据（如页面显式显示 `0` 而非 `--`），否则一律记为缺口并如实声明。
- **禁止手写 REPORT_DATA/view-model 数据**；只能走确定性脚本链路产出 fact-pack。
- **京东先使用新抽象的淘宝同款 Agent 模板**：京东详情报告不再整份手写 HTML，也不得使用旧 `assets/templates/report-template.html`。京东必须通过 `assets/templates/agent-single-product-report.html` + `scripts/report/render/render_agent_report.py` 渲染紫色 Agent HTML；渲染器按 `productKey` 精确合并 `fact-pack.json`、`report_data_partials.json` 与已校验的 `agent-insight.json`，混合平台输入时只渲染两个确定性输入中平台均为 `jd` 的商品，禁止把淘宝/抖店商品套入京东模板；并从持久化的 `deep-research-selection.json` 决定是否生成唯一深研画廊占位，再用 `validate_agent_report.py --strict` 校验。淘宝/天猫和抖店在迁移前仍按 `references/analysis-prompts.md` + `references/report-conventions.md` 生成自包含 HTML；最终目标是复用同一份 Agent 模板。
- **京东 SKU 明细渲染必须用 report model/view-model 的 SKU 行**：京东 `fact-pack` 中 `block=sku` 的 fact 可能只保留 `amount/share/stock` 等汇总事实，不包含 SKU ID、访客、加购、转化率、成交客户、成交件数等明细字段；这些字段以 `report_data_partials.json` 的 `blocks.skus` 或 `report-view-model.json` 的 `products[].skus` 为准。写京东报告 SKU 图表和明细表时，必须从该 SKU 行模型取 `id/name/amount/visitors/cartUsers/cvr/buyers/units`，禁止从 `facts[].value` 取不存在字段导致误显示空值。成交 SKU 贡献图的每一行左侧标题必须同时展示 SKU ID 与商品名，避免同款长商品名截断后无法区分规格。正式 HTML 展示层空值统一显示 `-`；字段为 `null` 才显示 `-`，不得把 `null` 改成 0，真值 0 仍显示 `0` / `¥0` / `0.00%`。
- **报告生成优先走骨架渲染链路**：完整流程见 `references/skeleton-render-pipeline.md`。Agent 只产出 `insights.json`（分结论文字，契约见 `assets/schemas/report-insights.schema.json`），由 `scripts/report/render/render_skeleton.py` 组装 HTML。图表、表格、模块存废、折叠、视觉规范全部由脚本兜底，Agent 接触不到这些环节，也就无法抄丢数据点或写错数字。京东/抖店当前属于 Agent HTML 约束链路：可使用确定性 report model/view-model 提供数据，但最终 HTML 必须符合淘宝同款 Agent HTML 门禁，而不是强行走被拦截的通用 view-model 模板。
- **报告内容必须可追溯**：正文出现的每个数字都要能在 `fact-pack.json` 或 `derived-metrics.json` 中找到；需要新的派生指标（转化率、环比、终端对比等）时，去 `scripts/report/metric/build_derived_metrics.py` 里加一条计算规则，**禁止 Agent 自行口算或估算**。写完用 `scripts/report/insight/validate_insights.py` 做数值溯源校验。
- **fact-pack 是写报告阶段的唯一取数入口**；一旦进入手写 HTML，**禁止再读取 `raw_data/` 下的原始 Excel 补数**（含用 pandas/openpyxl 现算单日值、占比或均值）。图表单日标注只能取 `series.*` fact 的 `points[]`；缺 fact 时应补脚本导出后重跑，或在报告中标注为数据缺口，不得在 HTML 里手工填数。相邻列混淆（下单金额↔支付金额、下单买家↔支付买家）是已发生的真实事故，详见 `references/data-quality-rules.md` 的"易混淆列"与 Known Gotchas。
- **1688 写报告前必须构建 chart-pack**：完整读取 `references/1688-stable-fields-and-charts.md`，再运行 `scripts/report/build_1688_chart_pack.py`。Tier A 核心源通过上游契约后，8 个 `mandatoryTierAChartIds` 必须全部原样嵌入 HTML；支付/广告等为 0 时用零状态图表达，禁止改成一句文字或删模块。
- **数据非空即呈现（SKU / 商品搜索词 / 同类目属性词）**：这三部分只要源数据非空，报告中就必须出现对应表格，不得以"未采到"跳过。三者均已固化进 `assets/templates/1688-single-product-skeleton.html`，由 `render_skeleton.py` 的 `build_sku_context` / `build_keyword_context` 确定性渲染，Agent 不写表格 HTML。判定链路：`sku_sales_rows` → `blocks.skus` → `block=sku` 的 fact → SKU 明细表；`searchWords`（`searchKeywordVsRange` 接口，本品真实引流词，含曝光/环比/点击）与 `hotAttrWords`（同类目参考词，含 `property`/`pvIndex`）→ 关键词章节 9.1 / 9.2 两张表。已发生事故：1688 分支曾把 `blocks.skus` 写死为 `[]`、缺口分支在数据已采到时反登记为"未采到"，导致 10 行真实 SKU 被静默丢弃，报告却写"SKU 未采到"；搜索词则采到后从未渲染。`modules_with_platform_data()` 是兜底闸门——源数据在场时即使上游 block fact 缺失也强制保留模块。
- **两类关键词口径不得混用**：`searchWords` 是本品实际被搜词，`hotAttrWords` 是同类目大盘参考词，必须分节呈现并各自标注口径，禁止合并成一张表或互相补空。属性词需按 `property` 分组，并与在售 SKU 规格交叉后区分"有货可补的词"与"属地词/非在售规格词"，后者严禁堆入标题。命中判定在渲染层按标题实时比对，不依赖上游 `inTitle` 字段。
- **图表必须逐字复制 chart-pack 的 `html` 字段，禁止手写简化 SVG**：已发生事故是 Agent 自行手绘只含一条 `polyline` 的"图"，坐标轴刻度、数值标签、图例全被删光，商家直接反馈"看不懂数值多少"。chart-pack 已渲染好完整坐标轴与标注，取 `charts[].html` 原样贴入容器即可；容器 `data-chart-id` 必须与 `chartId` 一致。门禁 `check_charts` 会按容器内 `<text>` 刻度标签数量判定手绘降级并 FAIL。
- **每张图旁必须给出可逐行核对的数值明细表**：SVG 只表达趋势形状，读不出具体数值。1688 报告至少需日粒度指标表（逐日展现/访客/加购/支付/金额，带周期合计行）、渠道明细表（分终端、标注父子层级不可相加）、漏斗明细表（每层人数与环节转化率，并写出 `3 ÷ 48` 这类计算口径）。行数多时放进 `<details>` 折叠，但不得省略。门禁 `check_metric_tables` 会校验这三类表。
- **关键词章节必须写出具体词，不能只报命中率**：fact-pack 的 `关键词词表` fact 带 `searchWords`（本品引流词，广告付费口径）、`hotAttrWords`（同类目行业参考词）与 `missedWords`。只写"命中 0/5"而不列出是哪 5 个词，商家无法执行选词动作。两类词口径不同，禁止合并或互相补空；行业词需逐个核对与本品属性的相符度再决定是否进标题，不得直接堆词。Tier B 页面字段采到即分析，未采到保持缺口；真实毛利率未提供时不得生成保本 ROI。
- **写 HTML 前必须先完整读取 `references/report-conventions.md`**；该文件是版式与配色的唯一事实源。禁止凭记忆或自创设计系统（自选主色、自定背景、自造语义色都会被视觉门禁拦截）。
- **同指标跨表差异 >20% 时禁止归一**；按 `references/data-quality-rules.md` 的"同指标多口径冲突"分表使用并显式标注口径，不得相加、互算占比或择一覆盖。
- **报告必须通过 `validate_agent_report.py --strict` 门禁**；校验未通过时禁止交付。finalizer 会把逐商品失败项写入 `logs/strict-validation-failures.json`，只按其中 `failures[]` 修正一次后重新校验；输入与错误未变化时禁止再次重试。门禁含视觉规范与数字格式两项，样式偏离同样阻断交付。
- **正式完成只认 `scripts/finalize_single_product.py`**：该命令统一执行 strict、生成哈希凭证、调用内部 delivery、校验 present files 并写 `logs/completion-receipt.json`。**`--plugin-root` 必须指向用户工作区的交付根目录（`<workspace>/全域电商运营`），不是插件安装目录**；误传 `plugins/installed/...` 会被拒绝并提示交付根不得落在安装目录内。只有 staging HTML、终端打印 strict PASS、或已有交付目录但没有 completion receipt，都不算完成。禁止 Agent 直接调用 `spec_delivery.py` / `collect_present_files.py` 绕过收尾边界，也禁止二次打包；`present_files` 只能来自 `logs/present_files.json` 完整数组。
- **报告只写隐藏 staging**：手写和 renderer 都输出 `data/<run_id>/.staging/report/`。staging 保留供诊断但不得加入 `present_files`；旧 `data/<run_id>/report/` 只允许由 `spec_delivery.py` 自动迁移，Agent 不手工移动或删除。
- **一次分析只能展示一份报告**：staging 下的 HTML 是待交付草稿，**在 finalizer 成功返回前不得用任何方式把它展示给用户**。内部 delivery 会把报告复制进交付目录并清理中间副本（原地留 `REPORT_MOVED.json` 指针），若提前展示过中间路径，用户侧会多出一条「文件可能已被删除或移动」的失效条目，看起来就是一次分析产出了两份报告。
- **京东单品分析禁止使用 `jd_product_360` / `jd_product_detail_download`**：那是全店商品列表口径（一行一商品），只能得到一行汇总值，拿不到 SKU 构成、流量来源、关键词、付费流量、流失去向与评价原声。必须使用 `jd_single_product_core` / `jd_single_product_traffic` / `jd_single_product_churn` / `jd_single_product_comment` 四个单品分析页 DSL（共 13 份报表）。这四个 DSL 的 `productIds` 上限为 1，多商品时 `build_collection_requests.py` 会自动拆成多个 request（`-p01`、`-p02`…），每个商品各自一份 `raw_data/`。京东评价原声需区分“下载失败”和“当前周期无可下载原声”：若评价指标均为 `--`、商品分析显示「暂无数据」、且没有原声抽屉/下载原声按钮，则 `jdSpCommentVoiceFile missing` 记为空数据/缺口，不作为硬失败反复重试，也不要求用户手动导出；若页面存在原声列表或下载按钮但下载失败，才按采集失败处理。
- **报告生成完毕后，Agent必须根据诊断结论条件性追问用户是否需要与竞品对比进行联动分析**；当诊断卡或分结论中存在 `bad`/`warn` 级问题时必须追问，报告整体为正向且用户未提及竞品时可跳过追问。该追问发生在交付完成后，必须使用 `ask_user(mode="form")`，禁止用普通文字或「请回复确认」句式。深度调研已在步骤 12 通过 askUser 处理，不再作为追问项。追问话术、触发条件和数据传递规范见 `references/skill-handoff.md`。
- **模块分结论刚性要求（报告价值的第一性约束）**：9 个分析模块（`finance`/`sales`/`sku`/`ads`/`traffic`/`funnel`/`conversion`/`engagement`/`aftersales`）在图表与表格之外，**必须各自输出 1–3 条结构化分结论**，统一使用 `[诊断标签] 数据依据 → 核心判断 → 行动方向` 格式，承载在 `class="insight-box"` 中。
  - **报告的交付物是判断，不是数据搬运**：只有指标卡、图表、表格而无分结论的模块 = 无效模块，`check_module_conclusions` 门禁直接判 FAIL 并阻断交付。
  - 每条分结论必须同时满足 4 个硬条件：① 有 `insight-box` 载体；② 去标签后正文 ≥ 40 字；③ 含因果连接词（`→`/说明/意味/表明/因此/导致/反映）；④ 含行动方向词（建议/优化/收拢/扩量/排查/回访/前置/维持/验证/提升/降低）。
  - **禁止模板句**：不得对所有模块套用「XX 指标为 N，建议持续关注」这类无信息量句式；分结论必须针对该模块指标的业务含义给出可执行判断。
  - 判断必须带标尺：说「偏高/偏低」时必须写明对比基准（同店采集 p50 / 绝对基准表 / 本品历史），禁止无标尺主观描述。
  - **分结论必须可执行（`check_conclusion_depth` 门禁）**：在四个硬条件之上，还要求「标尺 + 验证口径」两项——判断写明跟谁比，建议写明达到什么数值算成功、用哪个指标回收。含分结论的分析模块中至少 60% 需同时具备这两项，否则判 FAIL。「转化率偏低 → 建议优化详情页」这类四要素齐全但无法执行的句子正是本门禁要拦截的对象。
  - **无数据模块豁免**：若某分析模块对应的 fact-pack 字段全部为 null/NaN/空值（即该维度完全无采集数据），该模块不渲染、不产出分结论，门禁视为合理跳过而非缺失。报告中需在对应位置留一句「本模块因数据缺失（XX 字段均为空）跳过」说明原因。
  - 具体规则与正反例见 `references/analysis-prompts.md`「模块分结论输出规范」与 `references/report-conventions.md`「insight-box」节。
- **positioning（商品定位/健康分）模块已于 v3.1 下线**：单目标场景健康分恒为 null，只能渲染「未计算」空卡片；定位判断改由 `verdict` 与 `diagnosis` 承载。报告中出现 `data-module="positioning"` 或「健康分」文案时 `check_deprecated_modules` 判 FAIL。
- **报告语气与表达**：
  - 用大白话写报告，像跟运营同事开会汇报一样——听得懂、能照做
  - 禁止堆砌专业术语：不写「流量漏斗转化率呈递减态势」，写「从看到到下单，每一步都在掉人」
  - 结论必须精炼：一条分结论控制在 1-2 句话说完核心判断和该怎么做，不加「注：」「备注：」「说明：」「需要注意的是」等尾巴
  - **零括号尾注**：口径、基准、算式必须写进句子主干（写「跳失率 80.2%，高于 70% 的行业基准」，不写「跳失率 80.2%（绝对基准 70%）」）；置信度标注与 fact 路径引用（`fact-pack.xxx` / `(fact: xxx)`）属于内部追溯标记，报告任何位置都不得输出；Hero 指标卡标签只写指标名，不带算式括号（如「支付转化率（1÷3）」）。由 `check_annotation_noise` 门禁拦截
  - 禁止废话填充：不写「综上所述」「总的来说」「值得注意的是」「从数据来看」这类无信息量的连接词
  - 数字说人话：不写「环比增长 15.3%」，写「比上周多了 15%」；不写「同比下降」，写「比去年同期少了」
- **方法论三大底线收束**：
  1. **通用性**：所有分析方法基于指标语义（如「转化率」「客单价」「退款率」），只使用 fact-pack v3 标准化字段，不引用任何平台私有 Excel 列名或 sheet 结构，具体见 `references/analysis-prompts.md` 与 `references/single-product-framework.md`。
  2. **反幻觉**：报告中的所有数值必须可追溯到 fact-pack 或明确的行业基准；缺数据时保持为 null 或写明「数据缺口」，不得估算或从原始 Excel 反推，具体见 `references/data-quality-rules.md`。
  3. **联动追问**：单品报告交付后必须按 `references/skill-handoff.md` 基于诊断结论发起条件性追问，并在用户同意时以语义化指标上下文路由到深度调研或竞品对比 Skill。

## Run Gates

| Gate | Required output | Stop condition |
|---|---|---|
| Runtime preflight | Python check exits 0 | 退出码 1/2，报告原始环境信息并停止 |
| Account discovery | 本轮完整 `accounts[]`、已确认目标账号、全部目标 `enable=true` | Discover 失败/非法、无保存账号、匹配不唯一、字段缺失或任一目标未通过门禁 |
| Target resolution | `logs/target_spec.json` 中 1–10 个明确商品 ID | 缺少商品 ID、非自家店铺、目标 ID 不存在或超过 10 个商品 |
| Product ownership | 用户通过 `ask_user(mode="form")` 确认商品为自有店铺商品 | 用户选择「竞品商品」时立即终止当前流程，路由到 `ecommerce-search` 对应竞品能力 |
| Profile routing | 每次 Browser RPA 调用均已传全 `platformId + storeId + storeAccountId` 三个非空 ID | 任一 ID 缺失或为空即停止；不得先发起调用再补参数（缺 ID 不报错，会静默走用户主浏览器） |
| Store identity | 首个采集任务的 `readText` 输出中页面可见店铺名 == 目标 `storeName`；拼多多取 `pdd_single_product_store_identity_text` | 不一致时停止本店全部任务并废弃已采数据；页面无可识别身份时暂停等用户确认。**「取不到值」与「取到但不一致」必须区别处置**：该步为 `onError:continue`，`outputKey` 缺失或为空串属前者，只能按「页面无可识别身份」暂停等确认，不得当作身份不符而废弃数据；只有实际读到店铺名且与目标 `storeName` 不符才触发废弃。若大面积取空，应先排查该步选择器是否随平台改版失效，不得据此放行或误杀 |
| Route split | `logs/routes/execution-plan.json` 覆盖全部平台（含拼多多），未生成 `pdd-dom-plan.json` | Router 时间窗为 `custom` 等未固化模式（拼多多只支持 day/week/month，`build_collection_routes.py` 会直接报错） |
| PDD collection | `pdd_structured.json` 的 `single_product` 模块存在，每个目标商品的 `productId` 为纯数字、有统计时间与核心指标，且 `products.issues` 为空 | 弹窗未按目标周期切换、缺统计时间原文、残留 PUA 字符、列表/详情冲突、转化率自洽失败；同状态失败 2 次即停止，**禁止回退 `pdd_goods`** |
| Collection | `logs/batch-request.json`（含非拼多多平台时）, `logs/execution-request-plan.json`, `raw_data/`, upstream contract PASS | Execution New 失败、下载型任务缺 outputs 证据、PDD 缺结构化 JSON/xlsx 或任一目标平台无有效产物时停止进入下游，不手工补采 |
| Post-process exit code | `rpa_post_process.py` 退出码为 0 | 退出码 3（任务 `MISSING`/需人工决策）或非 0 时**必须停止**并如实报告；禁止因 `raw_data/` 里"看起来有文件"就判定数据已就绪继续下游——那些文件可能是 0 行空壳 |
| Data completeness | `verify_upstream_contract.py` 退出码 0：报表清单齐全（京东 9 份）、无空壳表、核心报表非空；拼多多为 `pdd_structured.json` schema 正确、周期与本轮时间窗一致、字体映射完整、每商品有统计时间与 8 项核心指标 | 退出码非 0 时记录缺口并在报告底部声明，不再强制中止；**禁止构造数据补洞，禁止降门槛放行** |
| 1688 逐商品源 | 每个 1688 目标商品各一份 `单品核心指标-<商品ID>` 落盘文件（`verify_upstream_contract.py --product-ids` 逐个校验） | 任一目标商品缺产物即停下；该源是 1688 的唯一数据源，缺失时没有任何源能代替，不得用店铺级汇总冒充 |
| Report model | partials, cross-table audit, fact-pack, insight, view-model | 跨表异常或脚本失败时修数据源/脚本，不手改报告 |
| Main image signal | v2 `main-image-analysis-result.json` 已初始化并校验；`shouldRun=false/status=skipped` 为正常状态，`triggerReasons` 保留给 deep research | v1、结果缺失、与 trigger plan 不一致，或把未执行旧主图 RPA 当阻断条件 |
| Deep research selection | `logs/deep-research-selection.json` 明确为 `requested` 或 `not_requested` | askUser 后未立即记录、凭文件存在推断选择 |
| Deep research | `requested` 时 read-plan 无 pending，Result 由 finalize 收口为 success/partial/failed；`not_requested` 时完全不读 deep 产物 | pending 或 provenance 非法；partial/failed 本身不阻塞核心报告 |
| Report style | `validate_agent_report.py --strict` 中 `check_visual_style` 与 `check_number_format` 均 PASS | 配色越界、缺 hero 渐变/hero 指标卡/深紫表头、坐标轴标签旋转、计数字段带 `.0`、金额缺千分位 |
| Annotation noise | `check_annotation_noise` PASS：全文无置信度标注与 fact 路径引用，Hero/verdict/diagnosis/insight-box 内无口径、基准、算式括号尾注 | 出现 `[置信度：高]`、`fact-pack.xxx`、`（绝对基准 70%）`、`（商品整体口径）`、`（1÷3）` |
| Report markup | 13 个固定 `data-module` 齐全（无 `positioning`）、`data-cross-analysis` ≥3 条、`<details>` ≥2 个、诊断卡 1–8 张且含标题与建议行；因 fact-pack 全空而跳过的模块以 HTML 注释标记 `<!-- data-module="xxx" skipped: 数据缺失 -->`，门禁识别为合理跳过不计入缺失 | 缺 `hero`/`verdict`/`action`/`diagnosis` 任一即结构 FAIL（模块数 <6 为 WARN）；交叉分析、折叠、诊断卡三项门禁 FAIL |
| Module conclusions | 9 个分析模块各自 ≥1 条判断型分结论，`check_module_conclusions` PASS；因 fact-pack 对应字段全部为空而跳过的模块视为合理跳过，不计入缺失 | 任一分析模块缺分结论、结论 <40 字、缺因果链或缺行动方向 |
| Conclusion depth | `check_conclusion_depth` PASS：含分结论的模块中 ≥60% 同时具备对比标尺与验证口径 | 判断无标尺（未写明跟同店 p50/绝对基准/本品历史比）或建议无可回收验证指标 |
| Deep research fusion | 用户选择执行深研且传入 `--fusion` 时 `check_deep_research_fusion` PASS：`deepresearch` 章节存在、每条可用交叉均有 `data-cross-analysis` 标记、章节内后台数值与页面证据同时在场；用户跳过深研时不传 `--fusion`，该项跳过 | fusion 有可用交叉却缺深研章节、交叉未落地，或章节只有画面描述而无后台数值 |
| Deep research evidence | 用户选择执行深研时，`check_deep_research_evidence` PASS：Manifest 的选中图片逐张唯一内嵌且路径/base64/SHA-256 一致，超量与 gap 明示；用户跳过时不传 Result/Evidence/productKey | 有可用选中图片但漏嵌/重复/篡改，主图或详情图超过 5 张，截图未完整覆盖，或缺超量/gap 说明 |
| Deprecated modules | `check_deprecated_modules` PASS | 报告残留 `positioning` 模块或「健康分」文案 |
| Formal completion | `logs/strict-validation-receipt.json`、正式路径、`logs/present_files.json`、`logs/completion-receipt.json` | finalizer 任一步失败，或 completion receipt 不存在 |

按阶段加载引用文件；不要在激活时预读所有 references、assets 或脚本源码。调用复杂脚本前先运行 `--help`，除非需要调试或修改脚本，否则按黑盒工具使用。

## Decision Points

| User request | Approach | Required references |
|---|---|---|
| 明确指定 1–10 个商品 ID 的五平台单品分析 | 解析账号和商品 ID 后先拆路由：拼多多进 DOM lane，其余平台进 Execution lane；淘宝/京东在 RPA 层按 `productIds` 过滤，抖店采集后按 ID 精确筛选，1688 不走 batch、逐商品下载单品分析导出 | `references/input-normalization.md`, `references/collection-workflow.md` |
| 目标包含拼多多店铺 | 与其他平台同批走 Execution：`pdd_single_product` DSL 按 `filters.productIds` 直达商品数据详情页，切换周期（昨日/7日/30日）后读取页面文本，由后处理解码落盘。禁止 `pdd_goods` | `references/dsl-selection.json` |
| 商品 URL、标题关键词或未指定商品 ID 的单品请求 | 转交 `multi-platform-product-analysis` 拉取商品列表；不执行本 Skill | `references/scope-and-boundaries.md` |
| 报告构建、诊断、Agent 模板 | REPORT_DATA -> audit -> fact-pack -> 京东用 `agent-single-product-report.html` 渲染；淘宝/抖店迁移前按淘宝同款 Agent HTML 约束成稿 -> validate_agent_report -> deliver | `references/report-pipeline.md`, `references/data-quality-rules.md`, `references/report-conventions.md`, `references/analysis-prompts.md` |
| 用户已自行导出并提供后台数据文件，要求直接出报告 | 跳过账号发现与 RPA 采集，从用户提供文件解析事实 -> 实测日期范围与口径 -> fact 数据 -> 手写 HTML -> 视觉与数字门禁；商品 ID 未明示时以文件内容指向的唯一商品为准并在报告显式声明该假设 | `references/data-quality-rules.md`, `references/report-conventions.md` |
| 主图点击/跳失/零支付触发 | 初始化并校验主图信号结果；不执行独立主图 RPA，页面证据由 deep research 前台详情页采集承接 | `references/main-image-analysis.md` |
| 需要解释「后台指标为什么这样」，或诊断出现转化、退款、加购、停留、渠道倒挂类问题 | askUser 后立即持久化选择；requested 执行 plan → 采集读图 → finalize → validate → fuse/evidence，not_requested 直接写核心报告 | `references/deep-research-integration.md` |
| 规范化交付和展示文件 | 只调用 `finalize_single_product.py`，读取其生成的 completion receipt 与 present files | `references/delivery-contract.md` |
| 竞品 URL、未指定商品 ID、全店排行、改价改库存 | 停止或转给对应 Skill，不由本 Skill 接管 | `references/scope-and-boundaries.md` |

## Workflow

1. **Runtime preflight**：按 `references/runtime-contract.md` 检查 Python 环境；失败时按原始错误类别停止。
2. **Discover and resolve accounts**：读取并执行 `../discover-store-accounts/SKILL.md`，按本轮平台范围带非空 `platformIdList` 调用一次 `discover_store_accounts`（禁止零参数与 `[]`；抖店映射为 `dy`）；平台意图不明确时先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再发起发现；解析完整 `accounts[]`，按商家账号规则展示（同店主子账号分别展示且都带脱敏 `account`），并逐平台完成店铺范围消歧（只按已登录候选 `N_on` 判定）：`N_on=0`（无候选或候选全部未登录）时自动跳过该平台；`N_on=1` 直接锁定；`N_on≥2` 且用户已唯一指定（店铺名精确命中一条，或明确说“全部店铺”）时按指定锁定；`N_on≥2` 且用户**未**唯一指定（只给平台名，未点名具体店铺也未说“全部”）、或同店多账号在已登录候选中无法唯一匹配时**必须**调用 `ask_user(mode="form")` 让用户选择（选项含「全部店铺」，未登录项不作为选项）。旧口径「平台级全选时不需确认」已废止；`<active_store>`、历史店铺不算用户已指定。
3. **Apply enable gate**：目标选定后再汇总 `enable`。全部为 `true` 时继续；**强制触发引导**：若目标平台在发现中无任何账号（`N_all=0`），或选中的账号全部为 `enable=false`，必须停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。**混合状态自动跳过未登录目标、只跑已登录目标，不打断、不追问**（本次执行项与已跳过项在步骤 5.5 的开工播报里列明），并在最终摘要保留登录缺口。
4. **Normalize input**：按 `references/input-normalization.md` 得到平台、账号、时间窗、明确商品 ID、毛利率，并写 `logs/target_spec.json`；缺少 ID 时停止并转商品列表 Skill。
5. **确认商品归属（askUser 门禁）**：在正式采集前，必须通过 `ask_user(mode="form")` 确认商品归属：
    - 询问内容：「请确认：您要分析的商品是自己店铺的商品吗？」
    - 选项：
      1. ✅ 是的，这是我自己店铺的商品 → 继续执行后续后台数据分析流程（步骤 6 及之后）
      2. ❌ 不是，这是竞品商品 → 终止当前流程，引导用户使用 `ecommerce-search` 技能的竞品能力：
         - 用户有具体商品 URL 想深入了解 → 引导走 `ecommerce-search` 的**单品深研**（`detail_extract`）
         - 用户想持续跟踪竞品价格/SKU 变化 → 引导走 `ecommerce-search` 的**竞品监控**（`monitor`）
         - 用户有多个竞品想横向对比 → 引导走 `ecommerce-search` 的**竞品对比分析**（`multi_url_competitor_analysis`）
    - 规则：此步骤为强制门禁，不可跳过；用户选择「竞品」时，当前 Skill 流程立即终止，由 Agent 切换到 `ecommerce-search` 技能执行对应意图。
5.5. **开工播报**：商品归属门禁通过后、生成采集请求之前，按 `../multi-platform-intention-router/references/common/kickoff-briefing-contract.md` 播报**恰好一次**并在同一轮直接继续执行；禁止用 `ask_user` 承载，其余禁令见契约 §5。字段口径：动作 = “对指定的 N 个商品 ID 做经营下钻采集”（N 取 `logs/target_spec.json` 实际去重后的商品数，不得照抄区间）；交付 = “每个商品一份单品分析 HTML 报告，保存到本次会话工作目录”。未播报就进入步骤 6 视为流程未完成。
6. **Build plan and split routes**：按 `references/collection-workflow.md` 生成 Router plan，然后用 `scripts/build_collection_routes.py --plan ... --run-dir ... --product-ids ...` 归一路由——全部平台（含拼多多）写入 `logs/routes/execution-plan.json`。对该文件运行 `build_collection_requests.py` 生成采集请求：淘宝瓴羊、抖店商品详情页、京东单品分析页与拼多多商品数据详情页 DSL 接收 `productIds`（抖店/京东/拼多多 `maxItems=1` 的 DSL 多商品自动拆成多个 request）；1688 在产物解析阶段按 ID 精确筛选（或逐商品下载单品导出，见步骤 7.5）。每个账号记录保留同一条记录的三个 Profile ID 与展示元数据；同店不同 `storeAccountId` 不合并。**本轮目标只有 1688 时跳过本步与步骤 7（不生成 `batch-request.json`），直接做步骤 7.5。**

7. **Run Execution New**（全部平台）：主 Agent在当前会话读取并执行 `../multi-platform-rpa-execution-new/SKILL.md`。每次 Browser RPA 调用只对应一个账号，顶层完整传递 `platformId/storeId/storeAccountId` 及 `platformName/storeName/account`，并把 Tool 返回的 `outputsPath` 逐字写入 `dsl-run-results.json`。下载型任务由 Execution 从 `outputs[expectedDownloadKey].path` 校验并摄取；`downloadedFiles` 可为空并由后处理回填。拼多多无下载文件，事实源是后处理产出的 `pdd_structured.json`。完成后只用 `collect_execution_raw_data.py` 归集 Execution 已生成的 request `raw_data`，不得从下载文件夹补文件。
7.5. **1688 逐商品采集**（仅目标含 1688 时；1688 的唯一数据源）：按 `references/collection-workflow.md` 的「1688 逐商品采集」小节执行。**纯 1688 目标用 `prepare_1688_single_product.py` 一次产出全部下载任务与请求索引**（无需 Router plan，不跑 Execution New）；混合平台时 1688 部分仍按同样方式逐商品执行。随后对每个商品：`browser_rpa_launch` file 模式执行返回的 `dslPath`（downloadFile 取导出端点直链）→ 从 Tool 返回的 `outputsPath` 读 `outputs[itemSingleCoreIndexFile].path` → `ingest_single_core_index.py --outputs` 落盘到该账号 request 的 `raw_data`。全部商品完成后，**必须运行 `collect_execution_raw_data.py --request-plan logs/execution-request-plan.json --out-dir raw_data/` 把工作簿与同名 `.page.json` sidecar 一并归集到 run 级 `raw_data/`**，再进入步骤 8。跳过这步步骤 8 会直接报缺产物；即便手工 `cp` 绕过，sidecar 缺位也会让下游读不到标题、流量来源卡、SKU 卡与关键词，报告里这些章节会假性显示"无数据"。缺产物时按缺口停下，不得手工搬运文件充数。
8. **Validate collected artifacts（数据完整性硬门禁，不可跳过）**：
    - 先检查上一步 `rpa_post_process.py` 的退出码。**非 0（尤其是退出码 3 = 任务 `MISSING`）时立即停止**，如实报告哪些任务失败；不得因为 `raw_data/` 目录里存在文件就认为"数据已就绪"——下载超时后落盘的往往是只有表头的空壳 xlsx。
    - 再对本轮目标平台运行 `verify_upstream_contract.py`。该脚本自 v2.7 起会**打开每个 xlsx 检查实质内容**（有效数据行、是否只有商品名/SPU 的空壳表）并**核对报表清单覆盖度**（京东 9 份）。拼多多不看 xlsx 数量，而是打开 `pdd_structured.json` 核对 schema、周期是否与本轮时间窗一致、字体映射是否 0–9 一一对应、每个商品是否有统计时间与 8 项核心指标。
    - **参数必须对**：`--scope` 传平台代码（如 `1688`）而非 `single_product`；`--dimension` 与采集档位一致（近 7 天传 `week`）；1688 与拼多多还要带 `--product-ids` 逐商品校验。参数写错会报 unrecognized arguments / invalid choice，此时只改参数重试，不得改动已落盘产物；1688 必须每个目标商品各有一份带自己 ID 的单品核心指标产物。
    - 拼多多失败时脚本输出的是 `pddDomRecollectRequired` 而非 `manualDownloadRequired`——该平台**没有可导出报表**，不要让用户去后台下载；正确动作是重跑 `pdd_single_product` DSL 采集，同状态再失败即停止并如实报缺口。
    - **退出码非 0 时记录缺口并继续**，不中止流程。Agent 必须将 `manualDownloadRequired` 中的缺失报表清单记录下来，在步骤 14 写报告时，**必须在报告底部添加「数据源缺口声明」章节**，列出所有未获取或为空的原始报表。
    - **禁止构造数据**：尽管允许不完整交付，但依然**绝对禁止**用页面文本、OCR 或手动输入伪造 Excel 文件。缺失维度在报告中应显示为「数据缺口」或「未取到」，不得凭空推测结论。
    - 若报表齐全但个别非核心表 0 行（脚本记为 `emptyReports` + warning），同样需在报告中显式声明。
9. **Resolve targets**：运行 `resolve_target_products.py`；`target_not_found` 或 `ambiguous_target` 必须停止，并用 `ask_user(mode="form")` 展示脚本给出的候选清单让用户选定目标商品。
10. **Build report model**：按 `references/report-pipeline.md` 构建 partials、运行跨表审计、生成 fact-pack 和 agent-insight。京东目标在 `report_data_partials.json` 生成后、fact-pack/view-model 生成前，若核心 DSL outputs 含 `jd_product_main_image_01/02`，必须运行 `scripts/report/jd_main_image.py from-postprocess`：将主图下载到 `report_model/evidence/<商品ID>/jd_main_images/`，并把首张有效图片注入 `blocks.product.mainImage`，用于报告头展示；无图或下载失败只记 manifest issue，不阻断核心报告。
11. **Main-image signal**：读取 `main-image-trigger-plan.json`；按 `references/main-image-analysis.md` 初始化并校验 v2 `main-image-analysis-result.json`。新任务不执行独立主图 RPA；命中的主图相关 `triggerReasons` 由 deep research 的前台详情页采集承接。
12. **深度调研确认**：向用户发起 askUser 确认是否执行页面深度调研：
    - 提示话术：「是否需要对商品页面进行深度调研（主图、详情页、评论等），与后台数据交叉分析找出问题根因？如果跳过，报告将仅基于后台数据生成。」
    - 用户选择「跳过，直接出报告」后立即执行：`python3 scripts/record_deep_research_selection.py --run-dir <run> --status not_requested`，然后直接进入步骤 14；禁止创建 skipped Result。
    - 用户选择「执行深度调研」后立即执行：`python3 scripts/record_deep_research_selection.py --run-dir <run> --status requested`，然后进入步骤 13。
13. **执行深度调研**（仅 `requested`）：按 `references/deep-research-integration.md` 执行 plan/init 和页面采集；随后执行图片观察完整链路：
    1. 运行 `evidence_observation.py plan` 生成 `deep-research-read-plan.json`（盘点本地图片、按同商品+同 SHA-256 自动复用主图 observation、拆分固定批次）
    2. 按 read-plan 的 `batches` 逐批读取 `readStatus=pending` 的本地图片（每批在同一条 Agent 消息并行发起视觉读取），该批读完后将全部 item 的 `readStatus/observation/severity`（失败项写 `readError`）汇总成一份 `deep-research-observations.json`
    3. 对该批调用一次 `evidence_observation.py observe --read-plan … --observations …` 批量写回（禁止逐张 edit JSON）；重复第 2–3 步直到所有批次完成
    4. 所有批次完成后运行 `evidence_observation.py validate` 校验完整性，再运行 `evidence_observation.py apply` 将 observed/reused 路径与 issue 写回 Result

    Agent 只填写实际观察与 findings，不填写终态。随后必须先执行 `deep_research_bridge.py finalize`，再 validate、fuse 和 evidence prepare。单图或采集失败由 finalize 收口为 partial/failed 并继续；pending、伪复用或未观察 evidenceSource 必须停止修正。
14. **Agent writes and embeds report**：先完整读取 `references/report-conventions.md`（版式与配色唯一事实源，禁止跳过或凭记忆写），再读取 `fact-pack.json` + `main-image-analysis-result.json`；目标含京东时还要读取 `report-view-model.json` 或 `report_data_partials.json` 的 SKU 行模型用于 SKU 明细表。若执行了深度调研则追加读取 `deep-research-fusion.json`。京东、淘宝/天猫和抖店统一按 `references/analysis-prompts.md` 生成淘宝同款 Agent HTML：复用同一视觉、模块、图表、诊断卡与 strict 门禁，平台差异只体现在语义、指标名与模块内缺口提示。目标含 1688 时还要读取 `references/1688-stable-fields-and-charts.md`，并对每个 1688 商品运行 `build_1688_chart_pack.py` 生成确定性 SVG 图表包。按上述约束生成每商品的 `.staging/report/单品分析报告-<商品ID>.html`；多商品时额外生成批量目录页。根据是否执行了深度调研，生成对应版本的报告——
    - `requested`：`success/partial/failed` 都渲染 `deepresearch`；有证据就交叉分析并嵌图，无证据则显示 finalize 生成的 gap。主图最多 5 张、详情图最多 5 张、截图全部转为 base64 内嵌。
    - `not_requested`：报告不含 `deepresearch`，只消费核心 fact-pack/main-image；禁止读取或创建任何 deep Result/Fusion/Evidence。
    **动笔前先按规范“零点五”节写好 `data-module` 章节标记（13 个，无 positioning；接受深研时加 `deepresearch` 共 14 个，缺 hero/verdict/action/diagnosis 任一即 FAIL）与 `data-cross-analysis` 交叉标记（≥3 条），并确保 ≥2 个 `<details>` 折叠、1–8 张含标题与建议行的诊断卡**——这四项靠中文标题无法被门禁识别，事后补比重写便宜。
    **每写完一个分析模块的图表/表格，立刻在该模块内补上 `insight-box` 分结论再写下一个模块**——9 个分析模块每个都要，写成「数据 → 判断 → 行动」，并带上对比标尺与验证口径（否则 `check_conclusion_depth` FAIL），不要留到最后统一补，事后补写极易漏模块并写成模板句。写完后自查：配色是否全部取自色板、计数字段是否为整数、图表标签是否与标题重叠、每个分析模块是否都有判断而非仅有数据、每条判断是否写清了跟谁比与怎么验证，再进入门禁。
15. **Formal completion**：只执行 `python3 scripts/finalize_single_product.py --run-dir data/<run_id> --plugin-root <workspace>/全域电商运营`。finalizer 根据选择记录走分支；`requested` 会按最终 Result 重新生成 Manifest 并刷新 HTML 画廊，然后内部执行 strict、哈希绑定、按账号一次交付、present files 校验和 completion receipt，Agent 不再单独补跑 embed。strict 失败时读取 `logs/strict-validation-failures.json`，一次性修复每个商品的全部 `failures[]` 后只重跑一次；相同失败仍在时立即停止并报告该诊断文件，禁止继续循环。普通 `not_requested` 报告保持 500KB；`requested` 无论 success/partial/failed 均使用 3MB 硬上限。命令非零或 `logs/completion-receipt.json` 不存在时不得向用户声称完成。
16. **Skill handoff**：报告交付完成后，按 `references/skill-handoff.md` 条件性追问。**本品页面深度调研已在步骤 12–13 处理完成（用户选择执行或跳过），不再作为追问项**；此处只追问本 Skill 覆盖不到的方向——竞品对标与同类目横向对比。存在 `bad`/`warn` 级诊断时必须追问，否则可跳过。用户确认时按数据传递规范构建上下文并路由到对应下游 Skill。

## Resources

| Resource | Load/use when | Purpose |
|---|---|---|
| `../discover-store-accounts/SKILL.md` | 本轮首次解析账号时 | 新版账号字段、展示格式、目标选定与 `enable` 三态门禁的唯一契约 |
| `references/scope-and-boundaries.md` | 路由、拒绝或转交任务时 | 平台、权限、禁止项和取数事实源 |
| `references/runtime-contract.md` | 第 0 步和 Python 报错时 | Python 环境、依赖和失败处理 |
| `references/input-normalization.md` | 解析用户请求时 | 账号门禁，以及平台、时间、店铺、商品、毛利率规则 |
| `references/collection-workflow.md` | 生成 plan/batch/request-plan 时 | Profile 身份透传、两阶段采集和 Execution New 对接 |
| `references/data-source-mapping.md` | 需要确认平台产物口径时 | 各平台采集产物与字段映射（含拼多多商品数据详情页的 DSL 采集与字体解码说明） |
| `references/report-pipeline.md` | 构建报告模型、诊断和渲染时 | REPORT_DATA/fact/insight/view/render 命令链 |
| `references/1688-stable-fields-and-charts.md` | 1688 fact-pack 完成后、写 HTML 前 | 稳定字段分层、固定分析维度、8个必备SVG图表与零值/缺失规则 |
| `references/main-image-analysis.md` | 主图触发计划存在时 | 主图信号初始化、v2 skipped 结果兼容门禁，以及 deep research 承接口径 |
| `references/deep-research-integration.md` | fact-pack 完成后、写报告前 | 靶向调研计划、主 Agent 采集执行边界、看图门槛、后台×页面交叉矩阵与写法 |
| `references/delivery-contract.md` | 交付阶段 | 多账号目标隔离、店铺端目录、meta、assets、present_files 契约 |
| `references/data-quality-rules.md` | 数据异常、脚本失败、口径漂移或报告缺口时 | 空值语义、跨表一致性、已知陷阱 |
| `references/data-source-mapping.md` | 构建 REPORT_DATA 前 | artifact 到 v3 区块映射、**平台能力矩阵**、**京东 9 份报表口径** |
| `scripts/report/metric/platform_capability.py` | 判断某平台该不该填某区块时 | 平台能力矩阵唯一事实源；`build_capability_gaps()` 产出各区块**具体**缺失原因。禁止再写 `if platform != "taobao"` 式一刀切 |
| `scripts/report/metric/jd_reports.py` | 京东构建 REPORT_DATA 时 | 京东 9 份官方报表 → v3 区块解析器，列名契约见文件头注释 |
| `references/data-view-instruction.md` | 运行 `build_report_data.py` 前 | 指标字段与数据视图规则 |
| `references/dsl-selection.json` | 生成 batch request 前 | 各平台 DSL 白名单与 productIds 要求（`domCollectionPlatforms` 已清空，全部平台走 Execution） |
| `references/metric-selection.json` | 分析指标和缺口设计时 | 报告指标清单，不传给 Execution |
| `references/single-product-framework.md` | 填写 agent-insight 前 | 健康分、定位、诊断候选、行动规则 |
| `references/script-inventory.md` | 调用或排障脚本时 | CLI 清单、输入输出和黑盒用法 |
| `references/skill-handoff.md` | 报告交付完成后追问用户时 | Skill 间衔接触发机制、追问话术、数据传递规范和下游映射 |
| `../multi-platform-intention-router/references/common/a[REDACTED].md` | 发起任何 `ask_user` 表单前 | 表单构造硬规则：消歧型/决策型分类、至少 2 个选项（决策型上限 6，消歧型按真实候选）、禁止同义选项、禁止与客户端内置「跳过」键重名、打断白名单 |
| `references/terminology.md` | 写说明、维护脚本或同步文档时 | 统一 Execution New、商品 ID、main-image、present_files 等术语 |
| `assets/schemas/*.json` | 校验输出结构或维护脚本时 | fact-pack、agent-insight、view-model、deep-research-result 合约 |
| `assets/templates/report-template.html` | view-model 模板链路渲染商品详情时 | 纯占位符详情模板，严禁演示数据；京东、淘宝/天猫、抖店使用 Agent HTML 约束 |
| `assets/templates/batch-report-template.html` | 多商品渲染和校验时 | 纯占位符批量目录模板，链接各商品详情页 |

## Output Contract

- 中间工作区：`data/single-product-analysis-<timestamp>-<scope>/`，仅存中间结果、日志、raw_data 和报告模型。
- 中间 HTML 只存于上述工作区的隐藏 `.staging/report/`；正式交付成功后仍保留，但不进入 `present_files`。
- 每个目标商品必须生成独立的 `单品分析报告-<商品ID>.html`；目标数大于 1 时额外生成 `<平台>批量商品诊断报告.html`，其卡片链接到同目录详情页。
- 交付目录：`店铺端/<平台>/<店铺>/单品分析/<产出时间YYYYMMDD_HHMMSS>/`，包含主报告、同目录详情 HTML、`assets/` 原始 Excel 和 `meta.json`。
- **报告在磁盘上必须只剩一份（v2.6）**：内部 delivery 是复制而非移动，交付后中间工作区（`.staging/report/`，以及被迁移前的旧 `report/`）会残留一份与交付目录字节一致的报告，用户侧表现为「一次分析生成了两份报告」。脚本现在会在交付原子落盘并自校通过后，**自动删除中间工作区中已确认入库的报告 HTML**（逐个文件比对 sha256，只有完全一致才删）。fact-pack、agent-insight、cross-table-audit、raw_data 等排障产物一律保留，中间目录不整体删除。
- **清理是默认行为，Agent 不需要也不允许自行传参**（`--keep-intermediate-report` 只在内部排障时由 delivery 层使用）。若中间副本与交付副本不一致，脚本会保留该文件并给出 `intermediate_report_kept` 警告，不做删除——这属于异常信号，应排查为何交付内容与本地不符。
- **用户可见口径必须唯一**：向用户展示、引用或建立链接时，**只能使用 `logs/present_files.json` 中的交付目录路径**，禁止提及 `data/single-product-analysis-*/report/` 下的路径。最终回复里出现两个指向同一报告的路径，会让用户误以为系统重复生成了两份报告。
- 同平台同店名的多个账号必须按 `storeAccountId` 保持内部隔离；店铺名和脱敏账号只用于用户展示，不得替代 Profile ID。
- 报告数据必须可追溯到 raw Excel 字段、factId、candidateId 或明确 gaps；不得估算、跨平台借值或用演示值补洞。页面侧结论必须可追溯到 `deep-research-result.json` 中真实读过的图片证据，禁止凭文件名或商品标题推断画面内容。
- 正式完成必须通过主图信号结果校验和 `finalize_single_product.py`，并生成 `logs/completion-receipt.json`；任一步失败都不得声称完成。
- 用户展示文件必须来自 `logs/present_files.json` 的完整数组；多商品时只展示目录主报告和原始数据资产，禁止手工筛选、改 label、重排或遗漏。

## Integrated Example

用户输入"分析下这 3 个商品，近 7 天，毛利率 38%"：先通过账号发现确定目标账号并完成 `enable` 门禁，再按输入顺序解析并去重商品 ID，写规范 `target_spec.json`，Stage B 通过 `--product-ids` 一次下发全部 ID。askUser 后立即记录深研选择，完成 3 份详情报告及 1 份批量目录，最后只调用一次 `finalize_single_product.py`，并只展示其生成的 `present_files.json` 完整数组。

## Edge Cases

- Python 环境不可用：按 `references/runtime-contract.md` 报 `sitePackages` / `baseDirs` 或插件不完整信息。
- 商品 ID 缺失：停止本 Skill，并转 `multi-platform-product-analysis` 拉取商品列表；不得从 URL、标题或自动 Top 商品推导 ID。
- Discover `accounts=[]` 或目标全部 `enable=false`：停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。严禁只输出纯文本引导。
- 采集任务大面积 `ACTION_TIMEOUT` / `LOCATOR_NOT_FOUND`，或页面店铺名与目标不符：**首先怀疑 Profile 三 ID 未传全导致落到了用户主浏览器**（该通道无目标店登录态，表现为整批超时或采到别家店数据），核对三个 ID 后重试一次；不要据此判定"账号绑定错误"或"店铺已更名"并让用户去改配置。同一任务连续失败 2 次且三 ID 确认无误时，才按登录态失效处理。
- 目标商品在采集结果中查不到：先确认上一条的 Profile 路由与店铺身份核验已通过，再判断是否真的不属于该店；身份未核验时的"查不到"不构成 `target_not_found` 结论。
- Discover 调用失败、`data` 无法解析、记录字段非法或 Profile ID 不完整：报告"账号登录状态检查失败"并停止，不猜测账号、不静默丢弃异常记录，也不回退到共享浏览器。用户指定的店铺命中多条时不属于此类，改用 `ask_user(mode="form")` 让用户选择；只有执行前按 `storeAccountId` 恢复时命中不唯一才停止。
- 目标账号全部 `enable=false`：列出全部 `平台 / 店铺名（脱敏账号）`，停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。严禁只输出纯文本引导；本商品分析 Skill 不使用无 ID relay 执行。
- 目标账号 `enable` 混合：自动跳过未登录账号、只保留 `enable=true` 的账号继续，不启动未登录项的 Browser RPA也不因此暂停；在步骤 5.5 的开工播报中分别列出本次执行项与已跳过（未登录）项的“平台 / 店铺名（脱敏账号）”，并在最终摘要保留登录缺口。
- 目标商品歧义或不存在：用 `ask_user(mode="form")` 展示脚本 stderr 的候选清单，停止等待用户选定。
- 输入文件缺失、JSON 格式错误、权限错误或输出路径冲突：保留原始错误、阶段和路径，停止处理，不扩大范围。
- **下载步骤超时 / ingest 报错 / `rpa_post_process.py` 退出码 3**：这是"数据没拿到"的信号，不是可忽略的噪声。正确处置是重试一次采集；仍失败则**停止并请用户手动导出**对应报表。禁止改用页面 `body_text` 摘数、禁止构造 Excel、禁止继续下游。
- **`raw_data/` 有文件但内容为空壳（只有商品名+SPU，0 条指标）**：等同于没采到。`verify_upstream_contract.py` 会判失败，按其 `manualDownloadRequired` 请用户手动导出，不得放行。
- **拼多多商品 ID 查询命中 0 行**：先确认店铺身份探针已通过，再判断该商品是否真的不属于本店（可能已删除或在其他店）。身份未核验时的「查不到」不构成 `target_not_found`。命中多行说明脚本填错了输入框（如填进了「商品编码」），停止并检查页面结构，不要改用列表首行。
- **拼多多弹窗停在「实时」口径**：弹窗默认周期是实时，不点周期就采集会拿到与用户时间窗不符的数据。`pdd_single_product` DSL 在切档前后各读一次「统计时间」，后处理以 statTime 为准核对周期（高亮状态是 CSS class，纯文本读不到，不能用作判据）；不一致即判缺口——此时重跑采集，不要手工改 `period` 参数让它「跑绿」。
- **拼多多字体探针 `ok=false`**：多数是探针跑早了（弹窗数字还没渲染，页面上凑不齐 10 个 PUA 字形）。先确认弹窗已打开且数字可见再重跑一次；仍失败则停止，不得改用 OCR 猜数或把无法解码的字符记为 0。
- **拼多多采集失败**：没有「让用户去后台导出」这个选项——该平台不提供单品报表下载。同一状态失败 2 次后停止，把该店标为数据缺口，**禁止回退 `pdd_goods` RPA DSL**。
- **报表齐全但个别表 0 行**：脚本记为 `emptyReports` 并给 warning，可继续出报告，但对应模块必须写「数据缺口，未确认」，禁止写成「本期无退款/无评价/无投放」。区分依据：页面显式显示 `0` 才是零值，`--` 或空表一律视为未取到。
- 源报表缺失：字段为 null 并渲染“待补采”；源报表存在但 0/空集合需按上一条区分"确认零值"与"未取到"，不得默认按 0 处理。
- 跨表审计 WARN：优先修数据源或生成端；禁止在报告端手改数字。
- 报告生成门禁失败：读取 `logs/strict-validation-failures.json`，一次性修复其中全部 `failures[]` 后 re-check 一轮；仍失败时停止并报告诊断文件与原始错误，不得继续迭代。
- 主图信号结果文件缺失、schema 非 v2 或与 trigger plan 不一致：禁止编译、渲染和交付。`shouldRun=false/status=skipped` 是新任务正常状态，不得据此阻断。
- 独立主图 RPA 采集支线已停用；主图页面证据只在 deep research requested 时由前台详情页采集与 `evidence_observation.py` 读图流程产生。
- 用户选择跳过深度调研：立即记录 `not_requested`；不导入、不读取、不创建任何 deep 产物，核心报告独立生成且不包含页面侧推测或 `deepresearch` 模块。
- 用户选择执行深研但采集失败、登录态失效或平台无 PC 详情 URL：保留真实失败证据，由 `deep_research_bridge.py finalize` 收口为 partial/failed 与 gap 后继续核心交付；不得编造画面内容。
- 深研图片部分缺失、损坏或为空：`prepare` 记录 issues 并选取全部剩余有效证据，报告显示 gap 后继续；已有选中图片未嵌入、重复嵌入、base64/SHA-256 不一致或超量说明缺失则禁止交付。
- 深研报告压缩后超过 2.5MB：继续降档但不删图；最低档仍超过 2.5MB 时允许继续门禁，最终超过 3MB 才阻断。普通报告仍按 500KB 阻断。
- 深研结果仍为 `pending`：先修复 read-plan/采集问题并重跑 `deep_research_bridge.py finalize`；禁止手工改 status/gap，也不得跳过 validate 直接 fuse。
- `.xls` 因共享环境缺 `xlrd` 或 Python 预检报共享依赖问题：本 Skill 不安装、不绕过、不修改其他 Skill；保留原始错误与数据 gap。这是本轮已知外部风险。
