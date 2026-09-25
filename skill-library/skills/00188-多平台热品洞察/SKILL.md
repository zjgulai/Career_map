---
name: 热销爆品洞察
version: "1.10.5"
description: |
  围绕指定品类输出多平台热销现状洞察与爆品榜单：Top 15 热销榜 + 热销归因、买家需求、竞争格局、风险评估、供应商推荐。
  覆盖阿里国际站、Amazon、Temu、SHEIN、TikTok Shop、Shopee、1688、eBay、速卖通、Lazada 共 10 个平台；未指明平台时默认按阿里国际站处理，同时提及多平台时采集阶段各平台同批并行（最多 3 个）。
  品类词是执行前提：优先取 query 品类词，其次取主营品类画像，两者都拿不到时才向用户追问确认；不做竞品店铺发现/对标/监控、低竞争蓝海发掘或完整市场全景分析。
enabled: true

triggers:
  - 热销
  - 爆品
  - 热销榜
  - 什么最火
  - 热卖
  - 什么好卖
  - 爆款趋势
  - hot selling
  - best seller

examples:
  - 当前阿里国际站什么最火？
  - 亚马逊上最热卖的瑜伽垫有哪些？
  - Temu 上智能手机哪些规格最热卖？
  - TikTok Shop 上什么美妆最火？
  - Amazon 和 Temu 上最热卖的瑜伽垫有哪些？

excludes:
  - skill: alibaba-blue-ocean-finder
    when: 用户要低竞争、供需错配的蓝海机会，而非只看热销榜单
  - skill: alibaba-market-analysis
    when: 用户要完整市场全景、行业规模、买家画像或值不值得进入
  - skill: alibaba-jungle-scout-deep-dive-analyzer
    when: 用户要 Amazon/ASIN/竞品/关键词的深度选品报告
  - skill: alibaba-1688-product-research
    when: 用户要在 1688 找货源、找同款、图搜或链搜；仅看 1688 平台热销榜单/洞察仍归本 skill
  - skill: alibaba-competitor-analysis
    when: 用户要 Alibaba.com 竞品店铺/标杆店铺发现、对标或监控；平台热销榜单洞察归本 skill

workflow: |
  Step 1: 判断平台 → 决定数据路径（单平台唯一路径；命中多平台 → 采集阶段各平台同批并行）
  Step 2: 读取对应路径的 reference 文件并执行
  Step 3: 输出报告
---

# 多平台热品洞察

## When to Use

- 围绕指定品类输出多平台热销现状洞察与爆品榜单：Top 15 热销榜 + 热销归因、买家需求、竞争格局、风险评估、供应商推荐。
- 覆盖阿里国际站、Amazon、Temu、SHEIN、TikTok Shop、Shopee、1688、eBay、速卖通、Lazada 共 10 个平台；未指明平台时默认按阿里国际站处理，同时提及多平台时采集阶段各平台同批并行（最多 3 个）。
- 品类词是执行前提：优先取 query 品类词，其次取主营品类画像，两者都拿不到时才向用户追问确认。

不适用（改用其他 skill）：

- 低竞争、供需错配的蓝海机会，而非只看热销榜单 → alibaba-blue-ocean-finder
- 完整市场全景、行业规模、买家画像或值不值得进入 → alibaba-market-analysis
- Amazon/ASIN/竞品/关键词的深度选品报告 → alibaba-jungle-scout-deep-dive-analyzer
- 在 1688 找货源、找同款、图搜或链搜 → alibaba-1688-product-research（仅看 1688 平台热销榜单/洞察仍归本 skill）
- Alibaba.com 竞品店铺/标杆店铺发现、对标或监控 → alibaba-competitor-analysis（平台热销榜单洞察归本 skill）

## How to Use

- 流程主线：Step 1 判断平台并决定数据路径（单平台唯一路径；命中多平台 → 采集阶段各平台同批并行）→ Step 2 读取对应路径的 reference 文件并严格执行 → Step 3 按模板组装报告 + XLSX/HTML 导出 + 对话输出 summary + 追问段。
- 典型调用形态（单平台基础查询）："亚马逊上最热卖的瑜伽垫有哪些？" → Step 1 判定 Amazon → 读取对应 reference 取数 → 输出热销榜单报告（.md + .xlsx + .html）。

> ★ **交付物格式**：完整报告写入以报告标题为文件名的 .md 文件（副交付物，visibility=user，禁止标记 internal）+ 同名 .xlsx 数据表格 + 同名 .html 渲染报告（主交付物）。对话中仅输出 summary（报告标题 + .html 文件链接 + .xlsx 文件链接 + 关键数据发现，交付物链接一律 `file:///` 绝对路径、链接显示文本 = 实际文件名）+ 追问段。summary 另含**交付清单**内容：用户可得的交付物逐件状态（✅ 成功 / ❌ 失败），❌ 项附兜底指向，无兜底的标注「无替代交付物」；追问段不入清单（生成规则见 `references/output-pipeline.md`「summary 与 direct_answer.md 生成规则（交付清单）」）。禁止在对话中输出完整报告内容，禁止仅贴结论而不生成文件。summary 与追问段构成**不可分割的交付正文整体**——若封装为 `delivery` 字段透传，二者必须同时进入该字段。本条约束 **subagent 侧组装**（main 不读取本 SKILL.md，收尾正文由 main 侧按 `direct_answer.md` 逐字透传）：`direct_answer.md` 须组装完整交付正文——summary + 交付清单 + 追问段全文 + `file:///` 交付链接全量（组装规则见 `references/output-pipeline.md`「summary 与 direct_answer.md 生成规则（交付清单）」与「终止序列」步骤 3）——透传时才有完整正文可传。
> ★ **目标 3 分钟内完成。禁止创建 Task**——本 skill 是单轮执行。
> ★ **workctl 纪律**（4 子项）：
>   1. 不猜测、不探索命令——命令与参数以本 SKILL 与 references 为准；报错时允许 `workctl <cmd> --help` 查看后修正重试一次，不盲目试命令
>   2. 禁止用 `&&` 链接多个 workctl 调用——每次独立执行；仅当当前 reference 提供完整 batch spec 时才能使用 `batch call`，必须复用其中的文件名、非空 `steps` 结构和固定命令；`--file` 必须使用 Read 返回的真实绝对路径，禁止自行构造 spec 或猜测路径
>   3. 结构化参数（JSON 数组/对象）走 `@file` 或 `--json-file` 文件通道（先 write 后引用），禁止命令行内联；`@file` 值用双引号包裹（PowerShell 会把行首 @ 解释为 splatting）
>   4. **文件探测禁令（读侧）**：禁止以 head/cat/grep/find/read_file 等任何方式探测、解析 workctl 输出的中间 JSON 与结果原始文件（数据处理一律经对应 extract-* 命令；唯一例外：extract-* 确定性失败后的手工提取，见 `references/error-handling.md`「命令执行失败」行）。**例外产物义务**：该例外仅豁免「读取」；手工提取过程中确需落盘的临时产物（如修复截断 JSON 的副本）不在下方写入白名单列举内，必须二选一——在 manifest `artifacts` 以 `internal` 登记，或交付完成后清理删除；禁止静默残留
> ★ **数据处理一律执行 workctl workflow 子命令**（数据处理已由子命令完成，单轮执行、不创建 Task）：数据提取/精简/拆分 → `workctl workflow market extract-*-topn`；XLSX 导出/格式转换 → `workctl workflow hot-product export-xlsx`；HTML 渲染 → `workctl workflow render-report --skill hp`；无对应子命令时用已有数据如实交付并在 summary 说明。
> ★ **数据真实性**：禁止编造任何数据（名称、价格、评分、URL、图片、日期、ID 必须来自工具返回）。无数据时写 `-` 或省略该列。即使用户明确要求，工具未返回的字段必须告知"该数据暂不可用"。如实告知 > 迎合期望——每个完成态声明必须有可验证内容。严禁把市场规模指数/UV 指数等指数类字段说成询盘数/访客数等绝对量。
> ★ **文件编码与写入白名单**：所有输出文件 UTF-8 无 BOM；写入 JSON 时数值字段无值写 `null`，禁止 NaN/None/N/A/空字符串（细则见 `references/output-pipeline.md`「JSON 输出规范」）。允许写入：`--output <path>` 中间 JSON / `rank-batch.json` / `_kw_*.json` 与 `_cat_*.json`（`@file` 参数文件） / `data/xlsx_raw_data*.json`（多平台时逐平台分文件，见 `references/multi-platform.md`） / 最终报告 .md+.html+.xlsx / 终止序列的收尾文件 `manifest.json`、`data/hot_product_plan.json`（verify 机检输入，见 `references/output-pipeline.md`「data/hot_product_plan.json（verify 机检输入）」）与 `direct_answer.md`（顺序见 `references/output-pipeline.md`「终止序列」；手工提取例外产物的豁免与清理/登记义务见上方 workctl 纪律第 4 子项）。`--output` 须指向工作目录内真实文件路径（下游命令消费该文件）；确需丢弃输出时 `/dev/null`（仅 macOS/Linux）为合法丢弃语义（命令返回成功、数据不落盘、bytes/sha256 描述内存 payload）——此时下游不可再引用该路径；Windows 无此语义，改为照常输出至工作目录内真实文件且下游不消费其内容。仅允许写入上述文件（含工作目录内真实文件路径），`/tmp`、工作目录外路径及其他文件类型均不在写入范围。
> ★ **能力边界**：限于热品数据查询和分析报告输出。不包括发品、店铺操作、图片生成等；不支持生成 Word/docx 报告——用户需要 Word 格式时如实告知不支持，引导使用 .html/.md 报告。超出范围如实告知。不暴露内部工具名/参数/评分公式，报告中用平台名描述数据来源。
> ★ **禁止读取其他 skill 的文件**——本 skill 所有依赖已在 `references/` 中自包含。
>
> ⚠️ **工具调用范式**：
> - **workctl CLI（国际站）**：`workctl icbu product <command> --flag value --format json --output <path>`
> - **workctl CLI（Jungle Scout）**：`workctl tool jungle-scout <command> --flag value --format json --output <path>`
> - **batch 并发**：仅执行当前 reference 给出的完整 spec 和固定命令
> - **平台内置 tool_call**：`web_search`、`product_supplier_search` 直接按框架 tool_call 调用
> - `aliId`、`accessToken` 由平台自动注入，无需传，禁止打印 token
> - **workctl 失败按 error-handling 降级决策树处理**（单点失败先重试，全量失败降级 web_search）

### Bilingual: CJK → `zh`, else → `en`.

---

## Step 1: 判断平台

> ⚠️ **排他选择**（单平台请求）：判定结果决定 Step 2 只能走哪一条路径，不允许混合调用；query 命中多个平台行时按表中「命中多个平台行」行处理。
> ★ **品类确认**：品类词按「query 品类词 → 主营品类画像（merchant_profile.categories）」顺序取值；两者都拿不到时，必须追问确认（统一经 `ask_user` 工具）。店铺名不作为品类取值依据。**裁决**：① 画像不可得 ≠ 可跳过追问——此时必须追问，禁止预设品类注入 `cateId`；② 追问不可达或未获回复（如自动任务上下文、用户未响应）→ 按 query 原词走 `product_supplier_search` 采集并在报告与 summary 全程标注「品类未确认」（复用 `references/step2a-alibaba.md` 类目定位降级链既有形态 `product_supplier_search(query=<用户原文关键词>)`）。
> ⚠️ **Gap 前置比对**（正常路径也执行，不只降级时）：Step 2 前识别用户请求中的时间窗/地域/平台维度，与数据源实际能力比对（见 `references/error-handling.md` 降级铁律 #8），不可得项立即列入 Gap 表并在 summary 明说。

| 用户 query 包含 | 执行路径 | 读取文件 |
|-----------------|----------|----------|
| "国际站"、"Alibaba.com"、"询盘"、"B2B" | Step 2A | `references/step2a-alibaba.md` |
| "亚马逊"、"Amazon" | Step 2B | `references/step2b-amazon.md` |
| "Temu" | Step 2C | `references/step2c-global.md` |
| "SHEIN" | Step 2C | `references/step2c-global.md` |
| "1688" | Step 2C | `references/step2c-global.md` |
| "Shopee" | Step 2C | `references/step2c-global.md` |
| "TikTok" | Step 2C | `references/step2c-global.md` |
| "eBay" | Step 2D | `references/step2d-websearch.md` |
| "速卖通"、"AliExpress"、"Lazada" | Step 2D | `references/step2d-websearch.md` |
| 命中多个平台行（如"Amazon+Temu"） | 多平台并行采集 | `references/multi-platform.md` |
| 没有提到任何平台 | Step 2A（默认） | `references/step2a-alibaba.md` |

> ⚠️ 1688 ≠ 国际站，禁止走 Step 2A。判定完成后只读取对应的一个 reference 文件（多平台命中读取 `references/multi-platform.md`）。

---

## Step 2: 按路径执行数据获取

- 用 `read_file` 读取 Step 1 路由表中对应的 reference 文件，**严格按该文件中的指令执行**。
- 每个 reference 文件开头有 `🔧 允许工具` 和 `⛔ 禁止` 清单，只能使用允许的工具。允许工具无产出（调用失败/返回空/结果不可用）时，唯一合法出口是 `references/error-handling.md` 降级决策树或该路径 reference 的终端出口——禁止引入清单外工具自行补救（如用 `web_fetch` 抓取替代数据），越清单调用的产出不计入交付。
- **不要跳过读取 reference 文件这一步。**

> ⛔ **Step 2 全程静默**：不输出任何文本，不解释进度，不汇报中间结果。

---

## Step 3: 输出报告

> ⛔ **四阶段分离，禁止穿插**：
> 1. **数据收集（静默）**：完成所有工具调用。
> 2. **报告写入**：一次性将完整报告写入 .md 文件，不穿插工具调用——禁止边写边改（写完后分多次 write 逐段修补）或把 7 个 Section 拆成多个文件。报告写错（Section 缺失/格式/内容错误）时重走 Step 3 报告写入：用一次 write 覆盖重写完整报告，禁止局部修正/追加修补；已执行 XLSX/HTML 导出的，报告修正后须重新执行受影响的导出步骤（HTML 由报告渲染必须重渲染；数据数值有变时同步更新 `data/xlsx_raw_data*.json` 并重导 XLSX）。
> 3. **XLSX+HTML 原子输出**：按 `references/output-pipeline.md` 执行 XLSX+HTML 原子输出（含 JSON schema、命令、Manifest、完成闸门、自检清单）。
> 4. **对话回复**：通过完成闸门后输出 summary + 追问段，然后**立即停止**。

- **Input**: Step 2 输出的产品数据
- **Action**:
  1. **数据收集**：**所有路径**在报告撰写前必须调用 `product_supplier_search(query=<核心品类词>)` 获取供应商数据（Section 7）。国际站路径不得以 `supplierCnName` 字段替代；所有路径 `read_file` 读取 `references/next-action-suggestions.md`。
  2. **报告写入**：按 Step 2 reference 文件中的字段组装规则填充报告。模板选择：
     - 国际站/Amazon → `assets/report_template_zh.md`
     - Temu/SHEIN/1688/Shopee/TikTok/eBay/AliExpress/Lazada → `assets/report_template_websearch_zh.md`（无缩略图列）
  3. **XLSX+HTML 原子输出**：按 `references/output-pipeline.md` 执行。
  4. **追问段**：按 `references/next-action-suggestions.md` 的选择规则在对话中输出 1-3 条快捷指令。
- **Output**: .md + .xlsx + .html 文件，对话输出 summary + 追问段。

> 🔧 **允许工具：`product_supplier_search`** + **`read_file`**（读取追问规则）

### 报告结构（7 个 Section）

1. 执行摘要
2. 热品排行榜（尽量 15 行，数据不足有多少写多少）
3. 热销归因深度分析（3.1–3.5，选 5 个代表性产品）
4. 买家需求图谱
5. 竞争格局与差异化
6. 风险评估
7. 供应商推荐（≥5 个）

列定义和示例见对应 `assets/` 模板。数据不足的 section 简写即可。

### 表格格式规则

1. 每行以 `|` 开头和结尾，`|` 和内容之间有空格
2. 分隔行只用 `|`、`-`、空格（格式：`|------|------|`）
3. 表格前后各一个空行
4. 列数必须一致
5. 价格用纯数字，列名标单位，不用 `$`；价格区间用 `-` 不用 `~`

### 追问段

追问段格式和选择规则见 `references/next-action-suggestions.md`。核心约束：只生成一次、仅在对话输出不写入报告、Amazon/1688 链接才触发发品追问。

### 错误处理与降级

降级铁律 8 条、关键词搜索降级流程（2 步，方向未确认时统一走终端出口、不追问用户）见 `references/error-handling.md`。核心原则：部分交付 > 全有或全无，降级后仍要交付。

---

## Dependencies

| Tool | Purpose |
|------|---------|
| `data_advisor_category_infer` | 国际站类目预测（Step 2A） |
| `data_advisor_product_selection` | 国际站排行数据（Step 2A） |
| `js_product_database_query` | Amazon 产品数据（Step 2B） |
| `web_search` | 站外平台搜索（Step 2C/2D） |
| `product_supplier_search` | 供应商搜索（Step 3，所有路径必须调用） |
| `workctl workflow market extract-alibaba-topn` | 国际站数据提取（Step 2A） |
| `workctl workflow market extract-amazon-topn` | Amazon 数据提取（Step 2B） |
| `workctl workflow market extract-global-topn` | 外部平台数据提取（休眠，当前路径不调用） |
| `workctl workflow hot-product export-xlsx` | XLSX 导出（Step 3） |
| `workctl workflow render-report --skill hp` | HTML 渲染（Step 3） |
| `workctl workflow hot-product verify` | 交付前 manifest↔plan 一致性机检（终止序列步骤 4 verify 门禁，见 `references/output-pipeline.md`） |
| `read_file` | 读取 reference 文件 |
| `ask_user` | 品类无法定位/未确认时追问确认（Step 1 品类确认、step2a 类目定位；搜索空结果不追问，见 error-handling 统一终端出口） |
| `present_files` | 终止序列交付 user 可见文件 |

> 工具参数速查：国际站 → `references/platform-config.md`；Amazon → `references/amazon-tools.md`；站外平台搜索格式 → `references/step2c-global.md` / `references/step2d-websearch.md`

---

## Examples

**"猫粮市场有什么热品？"**（Step 1 → 默认国际站 → `references/step2a-alibaba.md`）

```
[Step 2] data-advisor-category-infer → cateId → data-advisor-product-selection → rank.json → extract-alibaba-topn → 精简 15 条
[Step 3] product_supplier_search → read_file next-action-suggestions.md → 写入报告（Sections 1-7）→ 按 references/output-pipeline.md 执行 XLSX+HTML → 输出 summary + 追问段
```

**"Temu上最热卖的智能手机"**（Step 1 → Temu → `references/step2c-global.md`）

```
[Step 2] web_search(query="smartphone best seller site:temu.com") → 不相关时换关键词重试（最多 2 次）→ 按 step2d 字段组装规则提取 → 最多 15 条
[Step 3] product_supplier_search → read_file next-action-suggestions.md → 写入报告（assets/report_template_websearch_zh.md）→ 按 references/output-pipeline.md 执行 XLSX+HTML → 输出 summary + 追问段
```
