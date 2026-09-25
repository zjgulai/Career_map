---
name: ecommerce-search
displayName: 电商搜品主入口
displayDescription: 电商搜品唯一公开入口，覆盖商品 URL 找同款、关键词搜品、图片找同款、详情采集和竞品调研。
description: 面向竞品调研与外部商品分析的电商公开页面采集体系（非店铺后台数据）。当用户需要对京东/淘宝/天猫/1688/拼多多/抖音的外部竞品商品进行调研、找同款、比价、详情采集、评论分析或价格监控时使用本Skill。典型触发表达包括但不限于："帮我看下这个竞品""找下同款""比一下价格""采集这个商品详情""搜一下XX关键词""用这张图找同款""看下这个商品的评价""监控这个竞品价格变化""分析这几个竞品的卖点和差异""搜前20个商品""三个平台都搜一下""多搜几页"。本Skill同时覆盖竞品店铺级监控（淘宝/天猫、1688、京东整店上新榜与销量榜跟踪），触发表达如"监控这个店铺""盯一下这个店""看下竞品店铺上新了什么""这个店的销量榜""监控京东店铺"，输入为店铺页URL（如 xxx.tmall.com/category.htm、xxx.1688.com/page/offerlist.htm、mall.jd.com/index-1000001228.html、shop.m.jd.com/shop/home?shopId=1000001228），业务实现见 store-monitor/SKILL.md。本Skill只采集公开可见的商品页面信息（标题/价格/SKU/属性/评论/图片等），不登录任何店铺后台、不读取经营数据。与multi-platform-intention-router的边界：用户分析自己店铺的经营数据（GMV/订单/流量/库存/客服聊天）走multi-platform系列Skill；用户调研外部竞品、公开商品、找同款、比价、竞品监控走本Skill。所有采集通过browser_rpa_launch执行原子DSL flow，严禁使用browser-use/WebFetch/WebSearch等非RPA工具访问页面。命中 detail.1688.com/offer/、detail.m.1688.com/page/index.html、item.jd.com、item.taobao.com、detail.tmall.com 等商品链接时，不要当作普通网页抓取。
version: 0.1.0
---

# 电商搜品主入口

本 Skill（含 `store-monitor`）只使用**买家账号**（`isMerchantBackendAccount == false`）。凡向用户输出“设置 - 账号管理”引导，必须先读取 `references/buyer-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。不得改用 `../discover-store-accounts/references/merchant-account-management.md`——那份教程第 2 步会让用户选“商家账号”，商家后台账号即使登录成功也不可用于本 Skill 的公开页面采集。

> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 直接执行；文档中的 `python3` 是实际执行命令，不是占位符，Agent 只展开路径和参数，不得改写为其他 Python 执行入口。
>
> `python3` 的工作目录是当前 shell 的 cwd。执行前必须从本 Skill 的 `install_path` 解析 `<skillDir>`；脚本路径和所有文件或目录参数必须先展开为绝对路径，不得依赖先 `cd` 到 Skill 目录。不得因为其他 Python 执行入口缺失而告警、搜索替代入口或提示重装插件。
>
> 少数 Windows 环境只有 `python`（无 `python3` 别名）：此时直接改用 `python` 执行同样的命令即可，其余参数与流程完全不变。这只是命令名差异，**不是**插件损坏或依赖缺失，不得据此告警、搜索替代入口或提示重装插件。
>
> Python 第三方依赖只允许由 `scripts/lib/common/python_deps.py` 按白名单静默自愈；Agent 不得手工执行 `pip install`、切换解释器或修改全局 Python 环境。自动自愈失败时，严格按对应 reference 的降级或失败规则处理。

## 跨 shell 执行（单行纯参数调用，两端统一）

每条命令都是**单行、纯参数调用**：`python3 "<脚本绝对路径>" --参数 "值"`。任务开始时从执行器元数据确认一次实际外层 Shell 并全程复用，不能根据工具名 `bash` 猜测，也不探测/安装另一套 bash。**不写运行时 `.sh` / `.ps1` 中转文件**；复杂逻辑使用仓库内固定 `.py` / `.js` / `.sh`，动态值只走 argv 或结构化输入。命令里禁止出现 shell 变量赋值、命令替换 `$()`、管道解 JSON、here-string、行尾续行；需要派生路径时读 `output_layout.py` 的 JSON stdout 自己取值，后续命令把路径字面写全；多条命令用换行分隔（不用 `&&`）；平台间并行走 `scripts/run_list_postprocess.py`。

解析类报错连续失败 2 次必须止损：回到加引号 / 换等价参数 / JSON 改单引号包裹 / 把逻辑落成脚本文件，禁止来回切 shell、封装临时脚本、手写哈希路径。参数转义细则、两类必须避开的载体（内联 `python -c` 带嵌套引号、`.ps1` 文件）与预装工具事实全文见 `references/shell-execution.md`，执行前必读。
## 高优先级执行边界

由 product-package-autofill 持久任务调用时，RPA 返回完整 outputs 后必须先执行调用方 capture.onRpaCompleted.commandArgs，再继续主 Agent 的其他动作；两阶段后处理由 wrapper 的后台 worker 托管，主 Agent 不重复运行。按返回的 nextActions[] 及时推进 category 与 sku_review。详见 [详情采集的并行交接](references/detail-extract.md)。这是确定性脚本的后台执行，不将采集或 SKU 业务判断交给其他子代理。

本 Skill 的流程处理、产物生成与交付核验由主 Agent 按本文件和对应 reference 直接完成；禁止派发 SubAgent/verification 子代理来处理流程、复查报告或二次核验产物。`finalize.js deliver` 成功并注册最终路径后，只允许再执行 `references/risk-recovery.md` 的 pending 状态检查与纯文本询问；没有 pending 风控时任务立即结束。除非用户明确要求核验，否则不要追加任何子代理校验环节。

### 风控 Profile 后置人工处理

用户在上一轮风控询问后回复「打开风控页面」「打开」「要打开」等明确肯定表达时，这是 `risk_profile_recovery` continuation，不是新的搜索/详情 intent：不得重新跑账号发现、采集、后处理或 finalize；直接读取上一轮 task-root 的 `.risk-recovery.json`，按 `references/risk-recovery.md` 打开所有 pending Profile。用户只说「继续」「看看」不算明确同意，不打开页面。整个后置过程不调用 AskUser。

## Reference 与脚本定位

`<skillDir>` 的定义：**本 SKILL.md 文件所在目录的绝对路径**，取自加载本 Skill 的工具响应中的 `install_path` 字段。正文出现 `references/xxx.md` 或 `<skillDir>/scripts/...` 时，一律按下式拼接，不做任何推断：

```text
reference：  <skillDir>/references/<名称>.md
采集脚本：   <skillDir>/scripts
交付脚本：   <skillDir>/common
交付入口：   node "<skillDir>/common/finalize.js"
```

**交付只有一个入口**：`node "<skillDir>/common/finalize.js"`，mac 与 Windows 的命令字面完全相同，所有参数、校验与安全语义都在 `finalize.js` 内。交付不需要 bash，**不得**为此安装或寻找 bash / WSL，也不得因为缺 bash 就手工 `mv`、自制移动逻辑或跳过 deliver。

`common/` 与 `scripts/` 是 `<skillDir>` 下的**平级**目录，`common/` **不在** `scripts/` 里面。拼交付入口路径时注意：

```text
错误： <skillDir>/scripts/common/finalize.js          ← No such file or directory
错误： <skillDir>/scripts/lib/common/finalize.js      ← 该目录只有 Python 公共库
正确： <skillDir>/common/finalize.js
```

两个 `common` 目录名字相同、用途完全不同，不要混用：`<skillDir>/common/` 是 Node 交付层（入口是 `finalize.js`）；`<skillDir>/scripts/lib/common/` 是 Python 采集公共库（`media_download.py` / `url_classifier.py` 等）。

禁止把下列任何一项当作 `<skillDir>`：插件安装根目录（它比 `<skillDir>` 少了 `skills/ecommerce-search/` 两级）、当前工作目录、任务输出目录、运行时环境变量根路径。最常见的错误解析与正确形态对照：

```text
错误： <pluginRoot>/references/intent-routing.md                       ← File not found
正确： <pluginRoot>/skills/ecommerce-search/references/intent-routing.md
```

若工具响应未给出 `install_path`，只允许做一次精确定位拿到本 SKILL.md 的绝对路径，再取其所在目录作为 `<skillDir>`；除此之外不得用 list/glob/grep 全局搜索 reference 或脚本位置，也不得凭猜测拼路径。交付入口 `finalize.js` 的位置由 `<skillDir>/common/` 唯一确定，**不允许**为找它而发起任何搜索。

## 外部工具边界

商品 URL 找同款、商品链接找货源、同价位同款这类请求不得当作普通网页内容获取处理：

- 不使用 `WebFetch` 抓取电商商品页来代替插件采集。
- 不使用 `WebSearch` 搜商品 ID、标题或相似款来代替平台搜索链路。
- 不把原始商品 URL 搜同款请求交给通用 Browser / General Sub-agent 接管。
- 不使用 `browser_open`、`browser_navigate`、`browser_snapshot`、`browser_click`、`browser_console`、`browser_rpa_run` 或任何 `browser_*` 原子工具打开、探测、截取或操作电商页面。本 Skill 全链路（含失败诊断、结果抽查）唯一允许的浏览器入口是 `browser_rpa_launch`。
- 不绕过 `references/intent-routing.md` 和 `references/url-intake.md` 直接调用文搜、图搜或详情 flow。

**明确放行的例外：站外趋势取证。** 选品洞察、单品深研、竞品对比三类报告的「站外趋势取证」环节，
**允许并且默认应当**使用 `web_search` / `web_fetch` 检索**行业榜单、研究报告、政策公告、消协通报**
等非商品页公开信息。上面几条禁令针对的是「用通用工具替代平台采集链路去拿商品数据」，
与趋势取证不冲突，不要因为看到禁令就跳过取证。

- 放行范围仅限市场层信息；商品价格、SKU、销量、评论等第一方字段一律必须走 RPA 采集，不得用检索替代。
- 取证纪律（证据问题上限、七项元数据、三条硬红线）见 `references/external-intelligence.md`。
- 证据包 `trend_search_suggestions` 已预置结构化证据问题（含检索式、优先信源、命中判定），逐条执行即可。
- 单条最多检索 2 次，仍无有效信源即写「未获取 + 原因」并继续下一条，不得无限重试，也不得用搜索摘要凑结论。

如果用户提供的是商品 URL，必须先保留 `original_query`，再按 `intent-routing.md` 归一化 URL 意图；URL 找同款必须从 `url-intake.md` 开始。

边界判定：对象是公开商品 URL、公开搜索结果、商品详情页、同款/竞品候选时，即使含“分析/诊断/调研/竞品”也属于本 Skill；订单、GMV、流量、广告、库存、售后、店铺后台经营数据才排除。

执行 1688/淘宝/京东采集链路时，必须使用对应 reference 中的 `scriptsDir` 路径表和命令范式；禁止通过 `list/grep` 猜脚本位置或临时拼路径。

1688 DSL 生成入口已收敛为两个 capability：`search`（文搜/图搜第一段/图搜第二段，按 `--keyword`/`--image`/`--result-url` 自动互斥分支）与 `detail`（按 `--url` 采完整详情）。旧 `text-search` / `text-list-read` / `image-search` / `image-result-search` / `detail-read` / `detail-deep-read` 入口已删除，传入会被 `gen_flow.py` 拒绝并列出可用能力。

搜索后选择详情候选只能读取候选短表 `detail_candidates.json`（各平台统一文件名）；不得为了选候选读取完整 `rows.json`，不得根据截断内容臆造 `offer_id`、`item_id` 或 `detail_url`。

## 使用边界

使用本 Skill：

- 用户提出搜品、选品、找同款、找相似、找货源、按关键词或图片搜索商品。
- 用户提供商品 URL，并要求找同款、找类似、找相似、同价位同款、全网找品、去指定平台找货源。
- 需要先判断平台、搜索方式、分页数量和排序筛选条件。
- 需要在执行搜索前完成平台前台登录态检查。
- 用户要求详情页深采、SKU、评价摘要、详情图或素材包时，本 Skill 先做意图归一化，再按 `references/login-protocol.md` 通过账号发现结果完成登录门禁，最后读取 `references/detail-extract.md`。
- 收到 `--skip-reviews-and-qa`（生成 Flow）或 `--no-reviews`（详情后处理）时，必须原样执行，不得为了“采得更全”回补评价 preview、评论、差评或“问大家”；只需要发品字段与图片的轻量详情需求本就不消费评论，也不要主动追加评论采集开关。

不要使用本 Skill：

- 用户明确要求商品发布、店铺经营分析、评论回复等非搜品任务。
- 用户直接要求执行某个已生成的 DSL flow；这类任务走 `browser-rpa-launch`。

## 平台范围

当前实验版：

- `1688`：支持文搜、图搜、商品 URL 找同款、商品详情采集；商品监控与详情采集复用首屏内嵌数据，一次获得完整 SKU 组合、图片、价格和库存，不点击规格。DSL 入口包含 `search`、`detail`、`monitor`。同时支持竞品店铺级监控（`store-monitor` capability，覆盖普通旺铺与工厂店两形态），业务实现见 `store-monitor/SKILL.md`。
- `taobao`（含天猫商品）：同样支持文搜、图搜、商品 URL 找同款、商品详情采集和商品监控。天猫不单设采集平台：采集与目录都走 taobao，报告中的平台标签由后处理按商品 host 自动区分。账号发现同时读取 `taobao/tmall`；账号选择必须逐步执行 `login-protocol.md` 的 `taobaoAvailable/tmallAvailable` 固定分支，不得凭“共享登录态”自行挑选记录。同时支持竞品店铺级监控（`store-monitor` capability），业务实现见 `store-monitor/SKILL.md`（唯一事实源）。竞店监控的淘宝/天猫下滑形态预热滚动次数可用 `--store-prewarm-rounds` 调整（默认 4，最多 15，仅影响淘宝/天猫，需采全店铺商品时才调大）。**逐 SKU 价格**：`detail` 与 `monitor` 都从首屏内嵌数据一次采全每个 SKU 的组合/图片/库存/价格，无需交互。**没有 `sku-matrix` capability**，也**没有点击补价阶段**。若出现大面积缺价，按 `references/detail-extract.md` 的「多 SKU 价格+库存矩阵」检查采集账号权益，不得用主价或相邻 SKU 补齐。
- `jd`：支持文搜、图搜、商品 URL 找同款、商品详情采集、商品监控与评价采集（默认 preview 首页，`--collect-reviews` 开启深采，见 `references/detail-extract.md` 京东节）；京东拿不到逐 SKU 价格，商品监控不支持 SKU 矩阵，看板走“SKU 类目”区块（规格维度 + 主价格走势）。竞品店铺级监控采手机版店铺页，业务实现见 `store-monitor/SKILL.md`。
- `douyin`：Android APP 手机自动化链路，完整业务实现见 `platforms/douyin/SKILL.md`。
- `pinduoduo`：Android APP 手机自动化链路，完整业务实现见 `platforms/pinduoduo/SKILL.md`。

抖音与拼多多不使用 `gen_flow.py`、`browser_rpa_launch` 或 PC 登录态检查；两平台共用一台手机时必须串行，业务实现及参数不得由主 Skill 重写。

## 移动平台前置分流

目标平台必须在读取 `references/intent-routing.md` 之前确定，移动平台不生成 PC Intent Plan：

- 抖音或拼多多真机任务必须遵循 `references/mobile-android-preflight.md`。只要任务会用到 App 能力，就必须先把 preflight 返回的 `data.setup_guide_markdown`（安卓调试教程链接 + 「有操作成本、请耐心做完」提醒）原样展示给用户一次，**不管 `ready` 是 true 还是 false**；`data.ready=false` 时再额外原样展示 `data.primary_issue.user_message_markdown` 并停止，不得省略其中的手机连接帮助链接或继续平台业务。
- 命中抖音、Douyin、抖音商城或抖音 Android APP 时，直接读取 `platforms/douyin/SKILL.md` 并完全按其流程执行。
- 命中拼多多、PDD 或拼多多 Android APP 时，直接读取 `platforms/pinduoduo/SKILL.md` 并完全按其流程执行。
- 同一请求包含两个 APP 平台时，一个平台完整完成并释放设备后再执行另一个平台，禁止并发控制同一台手机。
- 移动分流后立即结束 PC 流程：不读取 PC intent/reference，不运行 `scripts/gen_flow.py`，不调用 `browser_rpa_launch`。
- 只有 1688、淘宝/天猫、京东或平台尚不明确的请求继续进入下方 PC 分支；不得把明确的 APP 请求默认归到 1688。

## 平台差异矩阵

同一 capability 在三个平台的参数与机制不同，**跨平台复用命令前必须查本表**；各 reference 的平台节只写本平台命令，差异口径以本表为唯一事实源。

| 维度 | 1688 | taobao（含天猫） | jd |
|---|---|---|---|
| 文搜排序 | URL 参数 | flow 内 UI 点击 | flow 内 UI 点击（URL `psort` 已失效） |
| 文搜价格 | URL 参数 | flow 内点击区间 tab 填价 | URL `ev=exprice_lo-hi` + 二次导航硬刷新 |
| 翻页参数与语义 | `--page`，第 N 页各生成一次 flow 逐页后处理 | `--pages`（上限 10），单次 flow 内点击「下一页」累积多页 | `--page`，**跳到第 N 页只采该页（不累积）**；多页由调用方发多个 RPA |
| 单页容量 | 60 | 约 48 | **60**（硬上限，`--max-items` 传 >60 无效） |
| 图搜形态 | 二段式（`--result-url` 交接） | 一段式 | 一段式（**不支持** `--result-url`） |
| 图搜价格区间 | 支持（第二段 URL 参数） | **平台不支持**（图搜结果页无价格筛选入口，flow 层拒传）；仅由后处理 `list_postprocess.py --min-price/--max-price` 按展示价本地补筛，且**交付时必须告知用户「淘宝图搜不支持价格区间，只有文搜支持」**（固定措辞见 `references/image-search.md`「价格区间不支持声明」） | **支持**（结果页 UI 面板填价） |
| 图搜起始 URL | `https://www.1688.com` | `https://s.taobao.com/search?ie=utf8` | `https://www.jd.com` |
| 图片格式 | jpg/jpeg/png/bmp/webp | webp/bmp 生成期自动转 jpg | jpg/png/webp 原生直传，无需转换 |
| 列表 outputs 键 | `queryAllItems` + `items.N.full_text`（混合） | `itemsPage_1..N` | `items`（单数组）；图搜另有 `result_url` |
| detail 入口参数 | `--url` | `--url` | `--url` 或 `--offer-id`（sku 纯数字） |
| detail 图片上限 | `--max-images` 默认 20 | 不消费该参数，不要传 | `--max-images` **必须传 0**（全量） |
| detail flow 是否含 `goto` | 否（靠 launcher 导航） | 是 | 是 |
| 列表后处理脚本 | `lib/platforms/p1688/list_postprocess.py` | `lib/platforms/ptaobao/list_postprocess.py` | `lib/platforms/pjd/list_postprocess.py` |
| 详情后处理脚本 | `lib/platforms/p1688/detail_postprocess.py` | `lib/platforms/ptaobao/detail_postprocess.py` | `lib/platforms/pjd/detail_postprocess.py` |
| 详情 stdout 商品 id 键 | `offer_id` | `item_id` | `sku_id` |

## 并发编排

`browser_rpa_launch` 调用的分组与并发策略以本节为唯一事实源，各 reference 只指向本节、不重复规则。总原则：**平台间并行，平台内串行**。

每个平台组的所有 launch 必须复用登录前置阶段选中的同一条账号记录的三个 ID。跨平台并行时不得复制另一个平台组的账号记录或三个 ID。

平台间并行：每个平台的采集管线是一个独立逻辑队列。多个平台的 launch 调用必须在**同一条消息内一次性发出**才会真正并发；分多条消息逐个发会退化为串行。平台内部按该平台 reference 的段数顺序执行（如 1688 图搜二段式的两次 launch 必须先后）。

搜索阶段：N 个平台就同时发出 N 个 launch 调用，每个调用的 `items[]` 里**只放本平台自己的那一段**，返回后各自跑本平台的列表后处理；禁止逐平台串行等待。**列表后处理同样平台间并行**：不要逐平台各发一次调用，也不要用 shell 的 `&`/`wait` 或 `&&`/分号串行（图片内嵌 Excel 是 I/O 密集操作，串行会让总耗时变成三者之和）。用 `run_list_postprocess.py` 一次提交全部平台，它在内部并行起子进程并等待全部完成：

```
python3 "<skillDir>/scripts/run_list_postprocess.py" --skill-dir "<skillDir>" --platform taobao --outputs "<淘宝outputsPath>" --out-dir "<淘宝搜索目录>" --title "淘宝文搜 <keyword>" --rpa-report "<淘宝reportPath>" --platform 1688 --outputs "<1688outputsPath>" --out-dir "<1688搜索目录>" --title "1688 文搜 <keyword>" --platform jd --outputs "<京东outputsPath>" --out-dir "<京东搜索目录>" --title "京东文搜 <keyword>"
```

参数按 `--platform` 分组重复，每组必填 `--outputs` / `--out-dir` / `--title`，可选 `--min-price` / `--max-price`；`--rpa-report` **只有淘宝**支持（承接 `price_ui_filter` 判定），传给其他平台会直接报错。平台脚本路径由 `--skill-dir` 推导，不要自己拼。**全程没有嵌套引号**——每个值都是普通带引号字符串，中文与特殊字符逐字进子进程 argv，不经 shell 解析。stdout 返回 `results[]`，每项含该平台独立的 `ok` / `returncode` / `stdout` / `stderr`——按各平台后处理脚本自己的 stdout 键契约从对应项的 `stdout` 里取值。任一平台失败时脚本退出码为 1，但其余平台结果仍完整返回，据此逐平台判读、不要因一个平台失败就重跑全部。

详情阶段：**每个平台只发一次 launch**，把该平台的候选商品按候选顺序全部放进同一个 `items[]`（队内串行）；平台之间并行。不要一个商品发一次 launch。

同平台的多个**独立任务**（如多 URL 商品监控——产物必须逐商品隔离，不能合并 `items[]`）不适用队内串行，改为**跨消息串行**：前一个 launch 返回后再发下一个。同平台的多个商品页共享该平台登录态与风控计数，并发访问会显著提高触发验证的概率。

浏览器生命周期必须在生成 Flow 前随登录模式一起确定，且只能照 `references/login-protocol.md` 的完整模板执行：

- `PROFILE_MODE`：三个 Profile ID 全部来自同一记录；每个 `items[].closeOnFinish=true` 关闭任务页面，顶层 `closeBrowserOnFinish=true` 关闭隔离 Profile Browser。
- 任务 reference 只提供 `launchItem`，不得复制附近示例后自行重建顶层 payload。业务 Skill 不打开或保留人工登录页面，不使用 `pkill/killall/taskkill/Stop-Process` 等进程级命令。
- 遇到执行期登录失效时按登录协议停止受影响平台并引导用户处理；遇到 DSL 校验失败、标签页上限或其他前置失败时先定位根因，禁止重复 launch 堆积页面。
- `closeBrowserOnFinish` 只能收口本次 launch 创建的隔离 Browser；如果账号发现阶段本身已有残留，属于 `discover_store_accounts` 或底层 runtime 的独立生命周期问题，不能宣称由本字段修复。

- 容量：`items[]` 上限 5 条（协议限制；超限时整个调用被拒、一条也不执行）。`detail_count > 5` 时按候选顺序拆成多个分段，**分段之间顺序调用、不得并发**。
- 产物读取：按 `items[i].outputsPath` 逐项取，`i` 与输入顺序一一对应，`items[i]` 对应 `product_(i+1)`。**禁止只读 `items[0]`**，否则其余商品已采到的产物会被静默丢弃。
- `outputsPath` 只能照抄返回体里的原值。返回体过长被截断、某几项的 `outputsPath` 不在可见区间时，改用两种取法之一：读工具结果落盘文件里的完整 JSON，或 `list` 运行根目录 `rpa-runs/CID-.../` 后按目录清单与执行顺序反查。**禁止按已见 run 目录的命名规律推断路径**——run 目录名含随机串，推断出的路径必然 `FileNotFoundError`（已实测 3 次），而 RPA 本身已成功、产物一直在磁盘上，属纯浪费。
- 后处理：详情后处理脚本的 `--out-dir` 是单值，一次调用只处理一个商品；N 个商品就写 N 条命令，收进**同一次**工具调用并**用换行分隔**（不要用 `&&`——PowerShell 5.1 不支持它作语句分隔符，见 `references/shell-execution.md`）。

单项失败与队列超时是两种待遇，直接决定要不要补跑：

- 单项 `RPA_RUN_FAILED` 或 `RPA_RUN_PARTIAL`：**不中断队列**，后续商品继续执行，无需补跑（best-effort 步骤已标 optional，偶发 partial 多为单品级异常，无需补跑）。
- `QUEUE_TIMED_OUT`：该队列已终止，其中 `RPA_LAUNCH_NOT_STARTED` 的商品未执行；只用**一次新的 launch 调用**（新逻辑队列）补跑这些 `NOT_STARTED` 商品。已成功的项不重跑；超时那一项（`RPA_LAUNCH_ITEM_TIMED_OUT`）属状态待确认，也不自动重跑，在交付里单独说明。平台之间是独立逻辑队列，A 平台超时不影响 B、C 平台。

命令生成禁令：批量生成多个 flow 或多条后处理命令时，**禁止使用 shell 循环与数组/间接变量展开**（`${!var}`、数组下标等）；必须逐条显式写出完整命令；同样禁止手写固定数量（如 `for i in 1 2 3`、`range(3)`、`[:3]`），条数一律由 `detail_count` 决定。已多次实测到变量展开为空导致 `--url` 丢失、生成期报错。

### ⚠️ 跨平台隔离禁令

多平台搜索时，必须严格遵守以下隔离原则：

1. **禁止跨平台复制**：绝对禁止使用 `cp`、`cat >>`、符号链接等方式将一个平台的报告/数据复制给另一个平台
2. **一平台一分析**：每个平台的报告必须基于该平台独立采集的 RPA 数据和后处理结果生成，不得引用其他平台的证据包
3. **宁缺毋滥**：如果某个平台采集失败或数据不足，只交付成功平台的报告——做法是**不声明失败平台的任何产物**（`finalize.js deliver` 没有 `--skip-platform` 参数，传了会直接报「未知参数」并整次失败），失败原因写进最终回复，绝不复制其他平台内容充数
4. **工具链校验**：`finalize.js` 会对所有交付物进行内容哈希比对，检测到两个平台报告内容相同时将直接报错拦截交付

## 意图归一化

读取 `references/intent-routing.md`，把原始用户请求归一化为 Intent Plan。不得直接把原始 query 当作搜索关键词，不得凭词面自行推断 intent。

各 intent 该读哪些 reference、读 reference 与登录前置的先后、产出哪些报告，一律按该文件「输出后续路由」执行（`store_monitor` 与 `monitor` 在登录前置**之前**先读各自 reference 完成前置确认）。

## 登录前置

执行任何采集前确认目标平台登录态：平台判断与登录态检查完成前，不生成 DSL、不调用 `browser_rpa_launch`、不执行后处理。读取 `references/login-protocol.md` 并按其规则执行。

核心要点：
- 按 Intent Plan 的目标平台集合调用一次 `discover_store_accounts`；平台范围只能用 `platformIdList` 表达（没有 `platform` 单值参数），涉及淘宝或天猫时固定传 `platformIdList=["taobao","tmall"]`。参数、过滤、列表构建和 AskUser 分支必须逐步执行 `login-protocol.md`，不得自行简化。
- `PROFILE_MODE`：已选中一条 `enable=true` 的前台账号记录，`browser_rpa_launch` 必须传同一条记录的 `platformId/storeId/storeAccountId` 三个 ID。
- `browser_rpa_launch` 只有一种合法调用形态：传入选中账号记录的三个 ID（`PROFILE_MODE`）。没有可用前台账号时不发起任何采集调用。
- 可用前台账号为零时进入“无可用账号处理”（见 `references/login-protocol.md`）：单平台任务直接停止；多平台任务先 AskUser（跳过缺账号平台 / 用户登录后重查一次），不得静默跳过询问。各分叉的固定话术、图文教程槽位和展示次数一律以该节为准。
- 任何登录引导话术（含无可用账号的全部分叉与执行期登录失效）**必须同时附上登录帮助文档链接**，不得只给“设置 - 账号管理”（[点击前往账号管理](accio://settings/account-management)）路径；URL 以 `references/login-protocol.md`「登录帮助链接」节为唯一事实源，本文不重写 URL。附链接不等于打开登录页，仍不得自行导航或等待轮询。
- 淘宝/天猫先检查淘宝可用前台账号，淘宝为零才检查天猫；只在最终选中的单一平台内部存在多个可用前台账号时 AskUser。两端都为零才进入“无可用账号处理”。
- 三个 ID 必须全部传入且来自同一条记录；不得选择 `enable=false` 或后台账号，不得让用户在淘宝和天猫之间选择，不得把两个平台分别采集一次。

注意：monitor 链路同样需要登录前置，按 `login-protocol.md` 规则执行。

## 搜索后详情分支

Intent Plan 满足 `need_detail=false` 且 `need_competitor_analysis=false` 时，只执行 `text-search.md` 或 `image-search.md`，交付搜索目录下的 `rows.json`、`detail_candidates.json`、`products.xlsx/csv`、`selection-insight.html`（文搜/图搜/找同款）。淘宝/1688/京东不再产出 `product-wall.html`；抖音仍保留商品墙产物。

选品报告交付后 Agent 必须停止执行并在回复末尾提供下一步引导（见 text-search.md / image-search.md 的「选品报告交付后交互」章节）。Agent 禁止因报告内“行动清单”模块的建议内容而自动发起后续采集或分析。

只有 Intent Plan 满足 `need_detail=true` 或 `need_competitor_analysis=true` 时，才在搜索结果后继续读取 `references/detail-extract.md` 的“搜索后批量详情采集”规则。

详情后处理识别到尺码表时，按 [detail.json 字段说明](references/detail-json-fields.md) 的 `size_chart`
页面事实结构输出；不得只输出 OCR 文本或图片路径，也不得把人体尺寸与商品尺寸互相代填。

URL 找同款只交付搜索结果；URL 竞品调研会在找候选后继续采候选详情并做分析。URL 找同款的价格策略优先级见 `references/intent-routing.md`「价格规则」。源 URL 商品产物放在对应平台目录下的 `seed_product_n`，同款搜索结果放在 `search_n_<timestamp>`，二者不要混用。

## 分页与数量约定

- 用户未明确要求多页时，只执行第 1 页。
- 用户明确要求多页或超过单页容量时，按 `references/intent-routing.md`「多页表达映射」执行。

## 依赖预检

任何采集或后处理脚本执行前，必须先运行：

```bash
python3 "<skillDir>/scripts/check_python_env.py" --json
```

`openpyxl` 缺失时由统一 helper 从插件 wheelhouse 离线安装 `openpyxl==3.1.5`、`et_xmlfile==2.0.0`、`xlrd==2.0.2` 到动态解析的 Accio/Phoenix Python `site-packages`；Pillow 保留原预装注入与镜像补装。禁止硬编码 `external-tools/<version>`、手工 pip 或覆盖共享目录中的不同版本。

**判定依据是 JSON 里的 `preflight.can_continue_with_degradation`，不是退出码。** 退出码只表达“是否全绿”（`0` 全绿 / `1` 有缺失），而两个依赖都自带完整降级路径（openpyxl → CSV，Pillow → 不压缩/不缩图）。把 `1` 一律当硬停，会把一次本可正常交付的任务变成零数据交付。

处置规则：

- `can_continue_with_degradation=true`（含全绿）：继续执行后续流程。若 `preflight.missing` 非空，必须在交付时向用户说明 `preflight.impacts` 里的影响面，以及 `preflight.blocked_capabilities` 里不可用的能力。
- `can_continue_with_degradation=false`：`preflight.blocking` 里的依赖无降级路径，此时才停止后续脚本执行，并向用户报告 `preflight.failure_reasons` 与 `preflight.hints`（脚本已按失败归因给出可执行建议，如换 `ECOMMERCE_DEP_TARGET_DIR` 落点、检查网络、更新 Accio 客户端或插件；共享目标版本冲突时保留原文并联系支持）。

该预检是强制入口门禁，不可跳过；但“不可跳过”指的是必须跑并读结论，不等于遇缺失就停。排障时把 JSON 的 `diagnostics` 一并附给用户，其中 `dep_targets` 列出了各候选安装目录的可写性（权限类失败看这里）。

## 执行顺序

```text
原始用户请求
→ ecommerce-search
→ 依赖预检（python3 "<skillDir>/scripts/check_python_env.py" --json，读 preflight 分级结论）
→ 读取 references/intent-routing.md
→ 生成 Intent Plan（含 task_label）
→ 若 intent=store_monitor（店铺级监控）：先读取 store-monitor/SKILL.md 完成「采集口径前置确认」，再做登录前置，然后按该文件其余流程执行，不进入下方商品级链路
→ 若 report_mode=only（只补报告）：不做登录前置、不搜索、不采集，直接读 references/deep-research-report.md「只补报告」节，对已有 productDir 执行 prepare → seal → finalize
→ 规划输出目录 task_label_timestamp/platform/search_n_timestamp/product_n
→ 判断平台（1688 / taobao / jd，天猫按 taobao）
→ 仅当本轮涉及京东时：task_dir 创建后执行 risk_recovery.py begin（只需 --task-root），记下 stdout 返回的 queryId 供后续子命令使用；纯淘宝/天猫/1688 的轮次跳过本步，全程不产生 .risk-recovery.json
→ 登录前置（账号发现 → 构建可用前台账号列表 → 选定账号记录进入 `PROFILE_MODE`）
→ 按 Intent Plan 读取 text/image/detail/url/competitor reference 的对应平台节
→ 若为 URL 找同款：url-intake 先生成 seed_product_n/detail.json 与 search_seed.json
→ 多平台时各平台搜索 launch 在同一条消息内同时发出（见「并发编排」）
→ 执行搜索 reference 并读取 search_n 候选短表 detail_candidates.json
→ 若 need_detail=false 且 need_competitor_analysis=false：停止在搜索结果交付
→ 若需要详情：从候选短表选择候选 Top N
→ 每个平台一个 browser_rpa_launch 并发详情采集（队内串行，见「并发编排」）
→ 每个 product_n 执行 detail_postprocess 并输出 detail.json / screenshots / head_images / detail_images / reviews
→ 京东链路返回结构化风控时，按 references/risk-recovery.md 用本轮账号记录执行 record；淘宝/天猫/1688 命中风控时仍按原规则立即停止该平台（不点验证、不刷新、不重试、不切账号），但**不写恢复记录**，只在交付摘要如实说明该平台缺失原因
→ 报告矩阵要求单品报告且 report_mode≠none 时读取 references/deep-research-report.md：prepare 生成 research_evidence.json 后，主 Agent 实际读两张截屏、主图、详情图与评论原文，再基于 bounded writer context + skeleton 一次性填完 v2 content 并 seal；完整 evidence 只供 seal/审计；失败时仅修 failed_sections（merge-section 已含校验）；遗留自由证据章节形态保留兼容
→ 若 report_mode=none（只要采集物料）：跳过上一步，直接交付 detail.json 与图片/评论目录，交付走「纯物料交付（report_mode=none）」的 --mode 采集 --materials-only 通道（禁止造占位 HTML 凑 main_html），并在交付说明告知证据可随时补出报告、在最终 answer 末尾追问是否需要深度调研
→ deep_research_report.py seal 一发完成渲染、图片内嵌、点击预览与门禁，通过后才可 finalizer 交付
→ 仅当本轮 begin 过（即涉及京东）时：成功部分 finalize 完成后执行 risk_recovery.py status --task-root <taskDir> --query-id <begin 返回的 queryId>（除 begin 外，status/record/mark-opened/dismiss 都必须带 --query-id）；无可交付产物时在全部平台终态后直接 status；pending>0 才在最终 response 末尾纯文本询问是否打开风控 Profile。未 begin 的轮次**不得执行 status**（状态文件不存在会报错），交付完即结束
```

## 输出目录约定

所有搜索、详情、竞品任务都必须先规划用户工作区内的绝对输出目录。主任务目录由 `scripts/output_layout.py` 原子创建为 `<语意名>_<YYYYMMDDHHmmssSSS>_<4位随机>`；不得使用相对 `reports`、插件目录或按 mtime 猜“最近目录”。同一会话后续步骤只复用上一步 stdout 明确返回的 `task_dir`。

统一层级：

```text
<用户工作区>/<语意名>_<YYYYMMDDHHmmssSSS>_<4位随机>/<platform>/search_<n>_<timestamp>/
```

搜索产物直接放在 `search_n` 目录下；详情产物放在所属搜索目录的 `product_n` 下：

```text
search_1_<timestamp>/
├── rows.json
├── detail_candidates.json
├── products.xlsx
├── rpa/
└── product_1/
    ├── detail.json
    ├── head_images/
    └── detail_images/
```

同一任务内多平台共用一个**显式传递**的 `task_dir`，平台目录分别为 `1688/`、`jd/`、`taobao/`；未传 `--task-dir` 时始终创建新的任务目录，禁止按相同 label 或最近修改时间猜测并复用历史目录。`search_n`、`seed_product_n`、`product_n` 均通过原子 mkdir 抢占，空目录也不得复用。URL 找同款的源商品详情放在平台目录下的 `seed_product_n/`，例如 `1688/seed_product_1/`。APP 平台沿用各自 SKILL 返回的 session/taskDir，主 Skill 不改写其内部目录。

`output_layout.py` 四种 kind 的主目录键名不同；取键前以对应 reference 的命令范式为准，不要臆造键名。

目录规划优先使用结构化入口：先按 `output_layout.py --print-contract` 返回的当前 Parser 契约生成一个 JSON object（字段如 `kind/platform/runDir/taskLabel`），再调用 `output_layout.py --params-file <json>`；脚本会从同一个 Parser 确定性构造 argv。直接 flag 调用仅作兼容，模式值必须写成 `--kind search`，不得把 `search` 写成裸位置参数；`--params-file` 不得与普通 flags 混用。

| kind | 必填 | 目录入口参数 | 主目录返回键 |
|---|---|---|---|
| `search` | `--platform` | `--task-dir` 或 `--run-dir + --task-label` | `search_dir` |
| `seed-product` | `--platform` | `--task-dir` 或 `--run-dir + --task-label` | `seed_product_dir` |
| `product` | `--search-dir` | 由 `--search-dir` 决定，不传 `--run-dir` / `--task-label` | `product_dir` |
| `competitor-report` | `--task-dir` | 由 `--task-dir` 决定 | `competitor_report_dir` |

注意：任务语义名在 `output_layout.py` 阶段叫 `--task-label`（用于中间任务目录前缀），在 `finalize.js deliver` 阶段叫 `--subject`（用于最终中文交付文件名），两者不可互换。`output_layout.py` 没有 `--subject` 参数，`finalize.js deliver` 没有 `--task-label` 参数。

## 报告路由与输出

主 Skill 只负责选择流程；字段协议、命令和失败修复以对应 reference 为唯一事实源，避免在激活时重复加载整套报告 schema。

| 报告 | 主流程 | 失败修复 | 唯一流程文档 |
|---|---|---|---|
| 选品洞察 | `prepare → 读取 writer_pack 一次写八模块 → seal-v2` | 按失败模块 `module-context → merge-module → seal-v2` | `references/selection-insight.md` |
| 单品深研 | `prepare → 基于 writer context 一次性写 v2 → seal` | 按失败 section `section-context → merge-section → seal` | `references/deep-research-report.md` |
| 横向竞品 | 每批最多 4 个并行取 context → 批量写 patch → 顺序 merge → seal | 按 `failures` 只重写失败商品 | `references/competitor-workflows.md`「竞品报告」 |

`merge-module`、`merge-section`、`merge-product` 都会在合并后运行对应真实校验并返回完成状态；正常流程不要再调用同名 `validate-*`。`validate-content` / `validate-module` / `validate-section` / `validate-product` 仅用于断点恢复、独立诊断或复验已有文件。

- 列表搜索交付 `products.xlsx/csv`；`rows.json`、`detail_candidates.json` 归档。淘宝/1688/京东不再生成 `product-wall.html`。
- 详情提取产出 `detail.json`、图片目录与评论物料；截图失败不阻断结构化字段，但必须声明证据缺口。
- 选品、深研和竞品的 evidence、skeleton/draft、context/patch 与 content JSON 都是过程产物，按 reference 声明为 `--archive` 或 `--transient`。
- `monitor` 作为独立 intent，按 `references/monitor.md` 执行。
- `monitor` 与 `store_monitor` 的**监控频率**（是否询问、四个选项、选了周期性之后怎么办、没有调度能力时怎么如实降级）以 `references/monitor-cadence.md` 为唯一事实源，两条链路都引用它，本文与两份流程文档都不重写话术。频率只能在**交付成功之后**处理，本轮采集失败或作废时不创建任何调度。
- 单品深研 content 为 `deep-research-content.v2`，横向竞品为 `competitor-content.v2`；两者固定骨架都含营销策略章节（渲染固定排在动态证据章节之前），正式报告禁止手写整页 HTML。

若 `browser_rpa_launch` 因个别读取步骤定位失败而标记失败，但队列响应中的单项结果仍包含 `items[0].outputsPath`，仍应按 reference 继续后处理；实际条数以最终 JSON 文件为准。

## 语义命名与统一收尾

中间固定名只供脚本互操作，正式交付必须调用未改动的 APP/PC 共用交付实现 `node "<skillDir>/common/finalize.js" deliver`，由它一次性完成角色预检、语义化移动、防覆盖、运行时清理与最终路径输出。禁止手工 `mv` 后再补清理。

### ⚠️ 禁止提前展示中间产物

在调用 `finalize.js deliver` **之前**，严禁通过 presentFile 或任何方式向用户展示中间产物文件路径。原因：
- 中间路径不是交付契约：正式产物的语义化路径要等 deliver 之后才存在，提前展示的卡片指向的不是用户最终要拿的文件
- deliver 返回的 `present_files` 是唯一权威清单；绕开它展示会让用户同时看到过程数据与正式产物两套路径
- 所有文件展示必须且只能由 deliver 返回的 `present_files` 字段驱动
- 正确做法：先完成 deliver，再根据其返回的 `present_files` 向用户展示最终交付物

最终目录统一为：

```text
<工作区>/全域电商运营/消费端/<主体>/<平台>-<主体>-<指标>-<周期>/
```

最终文件统一为 `<主体>_<平台>_<方式>[_<内容类型>].<扩展名>`：平台取 `淘宝/京东/1688/抖音/拼多多/多平台`，方式取 `文搜/图搜/找同款/深研/评价/竞对/价格监控/采集`。例如 `裙子_1688_文搜.html`、`裙子_1688_文搜_明细.xlsx`、`耳机_多平台_竞对.html`、`耳机_1688_采集_原始数据.json`。禁止直接交付 `report.html`、`dashboard.html` 等固定中间名。

### deliver 参数契约（默认结构化参数文件）

`deliver` 默认且唯一推荐入口是 `node "<skillDir>/common/finalize.js" deliver --params-file "<JSON绝对路径>"`；`--params-file` 与普通 flags 严格互斥。JSON 根必须是 object，且只允许字段 `workspace/taskRoot/scopeRoot?/subject/platform/metric/period/mode/materialsOnly?/files/dirs/archives/transients`；`files`、`dirs` 的元素为且仅为 `{role,src}`，其余三个清单为字符串数组。普通 flags 仅为兼容旧调用。

可选 `scopeRoot` 必须是真实目录、位于 `taskRoot` 内且不等于 `taskRoot`。传入后，本轮所有 `files/dirs/archives/transients` 都必须位于该目录；未声明业务文件扫描也只从该目录开始，因此同一 taskRoot 下其他 seed/search 的文件不会阻断本轮；台账仍以 taskRoot 记录相对路径。不传则保持原 taskRoot 全量作用域。

调用前先按本表把七个值全部定好，**不要边试边补**——每个缺失或非法值都会让整次 deliver 直接失败：

| 参数 | 必填 | 取值约束 | 示例 |
|---|---|---|---|
| `--workspace` | 是 | 用户工作区绝对路径，须为 `--task-root` 的祖先 | `/Users/x/Desktop/rpa` |
| `--task-root` | 是 | 本次任务主目录绝对路径（`output_layout.py` 返回的 `task_dir`） | `<workspace>/耳机_20260731121508582_4a3b` |
| `--subject` | 是 | 中文主体词，短品类名，不含路径分隔符 | `耳机` |
| `--platform` | 是 | **枚举六选一**：`淘宝` `京东` `1688` `抖音` `拼多多` `多平台` | `多平台` |
| `--metric` | 是 | 中文指标词，自由文本 | `同款` `竞对` `价格` |
| `--period` | 是 | **只接受四种格式**，细则见 `references/finalize-delivery.md` | `20260731` |
| `--mode` | 是 | **枚举八选一**：`文搜` `图搜` `找同款` `深研` `评价` `竞对` `价格监控` `采集` | `图搜` |

结构化 JSON 示例（按本轮实际产物填写数组，可按需要加入 `scopeRoot`）：

```json
{"workspace":"<workspace>","taskRoot":"<taskDir>","scopeRoot":"<本轮 search/seed/product 目录>","subject":"<中文主体>","platform":"1688","metric":"同款","period":"20260731","mode":"文搜","files":[{"role":"main_html","src":"<报告.html>"},{"role":"detail_table","src":"<明细.xlsx>"}],"dirs":[],"archives":["<rows.json>"],"transients":["<中间目录>"]}
```

执行命令：`node "<skillDir>/common/finalize.js" deliver --params-file "<上述JSON绝对路径>"`。

### 纯物料交付（report_mode=none）

`report_mode=none` 的任务本轮不产出任何报告 HTML，`main_html` 门禁不适用，必须显式传 `--materials-only` 走纯物料通道，`--mode` 固定 `采集`：

```
node "<skillDir>/common/finalize.js" deliver --params-file "<materials-only JSON绝对路径>"
```

其中 JSON 使用 `"mode":"采集"`、`"materialsOnly":true`，并在 `dirs` 中写 `[{"role":"preserve","src":"<productDir 或 seed_productDir>"}]`；`transients` 只作不交付声明，cp-mode 下不会物理删除源路径。

三条约束：

1. **`--materials-only` 与 `main_html` 互斥**：本轮真有报告就别传这个标志，传了又声明 `main_html` 会被直接拒绝。它不是绕过报告门禁的后门——报告生成失败时应当去修报告，不得改用本通道降级交付。
2. **不得为凑门禁造占位页**：禁止临时生成 `summary.html`、`index.html`、简版报告顶替 `main_html`（同 `references/finalize-delivery.md` 的既有约束）。
3. **交付后必须追问**：按 `references/competitor-workflows.md`「纯采集后深度调研文本提示」在最终 answer 末尾纯文本询问是否需要深度调研，并说明证据已落盘、补报告走 `report_mode=only` 无需重采。

模板本身就是单行完整命令，照抄即可；参数多时可在 PowerShell 下先拼参数数组再一次传入，但不得加行尾续行 `\`（见本文件「跨 shell 执行」与 `references/shell-execution.md`）。

`--period` 四种合法格式、多平台一次 deliver、三种 shell 展开、产物三去向（--file/--archive/--transient）、
--file 四固定角色与 named: 对称命名、--dir preserve 与 `::` 分层、常见拒绝原因，全文见
`references/finalize-delivery.md`，首次调用 deliver 前必读。

收尾必须满足：

- `--task-root` 下除 `temp/rpa/claim` 外的每个业务文件都通过 `--file`、`--dir preserve`、`--archive` 或 `--transient` 显式声明；单平台任务缺少本次非空 `main_html` 时拒绝交付，多平台任务已声明 ≥2 份非空 named HTML 时允许没有 `main_html`。
- 交付目录首层只放用户要看的正式产物；过程数据（`rows.json`、`detail_candidates.json`）走 `--archive` 收进 `过程数据/` 子目录，被删除或归档的文件都不出现在 `final_artifacts`／`present_files` 里。
- finalizer 原子创建最终目录，重名升 `_vN`，不覆盖旧结果；相对引用的 `head_images/detail_images/screenshots/reviews/products` 等目录保持原名整体移动——**仅当本次任务确实产出了这些目录时才声明**，纯列表搜索任务没有这些目录，详见 `references/finalize-delivery.md`。
- deliver 是**复制交付**：源 `--task-root` 连同 `temp/rpa/claim`、原始截图与 `--transient` 目标一并保留，`cleanup.task_root_removed` 恒为 `false`，**不得**把它当成功条件或据此重试；下游轮次因此可继续复用 `detail.json`、`detail_candidates.json` 等证据。本 Skill 不主动删除任务根；同一 task-root 的第二轮交付只声明本轮新增产物（台账口径见 `references/finalize-delivery.md`）。
- APP 任务仍调用各自 SKILL 已有的业务命令生成产物，主 Skill 只统一路由与最终语义契约，不修改 APP 实现。
- 只向用户注册 finalizer stdout 的 `present_files` 实际路径；移动完成后不得继续改名，失败平台不得拿旧目录或其他平台产物替代。
