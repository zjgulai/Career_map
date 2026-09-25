---
name: 深度选品报告
version: "1.10.3"
description: |
  针对单一品类/产品/竞品 ASIN 做纵深选品验证，基于 Jungle Scout 市场数据与 Amazon 平台数据生成 8 维度纵深报告，附真实产品推荐与 B2B 货源溯源。
  分析基座为 11 项指标数据框架，覆盖市场机会发现、竞品分析、产品验证、广告与流量、趋势与季节性 5 类问题场景。
  关键输入：品类词（1-3 个纯产品名词，query 优先、其次取画像品类与目标市场槽位，均缺失时追问一次）；可选竞品 ASIN 与 Amazon 站点（默认 us）；多 ASIN 走同一管线，多关键词或多站点先收敛为一个目标。仅做单品类纵深验证；仅查单个数据点时直接用 Jungle Scout 工具；数据局部缺失降级交付。
enabled: true

triggers:
  - 深度选品
  - 选品报告
  - 市场验证
  - 竞品 ASIN 分析
  - 关键词反查
  - 流量关键词
  - 利润测算
  - 进入壁垒
  - 季节性判断
  - PPC 竞价
  - deep dive

examples:
  - 帮我给便携式搅拌机做一份深度选品报告
  - 瑜伽垫 $25-$35 价位段值得进入吗？
  - 分析竞品 ASIN B0XXXXXX 的流量关键词和销量走势
  - 家居厨房品类里有没有低竞争的利基机会？
  - 圣诞灯饰是季节性产品吗？广告投放成本大概多少？

excludes:
  - skill: alibaba-hot-product-insight
    when: 用户只想看多平台热销榜单、爆品 TopN 或热销归因，没有单一品类 8 维纵深验证诉求
  - skill: alibaba-blue-ocean-finder
    when: 用户要跨平台供需错配、低竞争蓝海品类挖掘或国际站发品策略，而非对已知品类/ASIN 做深度验证
  - skill: alibaba-market-analysis
    when: 用户要品类级市场全景、行业规模、买家画像、国家分布或"是否值得介入"的全局判断，而非单品类 8 维深度报告
  - skill: alibaba-1688-product-research
    when: 用户要在 1688 文搜/图搜/链搜找商品、找同款或比价；本 skill 报告内嵌的 Alibaba.com B2B 货源溯源仍归本 skill
  - skill: alibaba-competitor-analysis
    when: 用户要 Alibaba.com 竞品店铺/标杆店铺发现、对标或监控；ASIN/商品级深度选品报告归本 skill

workflow: |
  Step 1: 语言判定 + 多目标判定（多 ASIN 同管线、多关键词/站点先收敛）+ Gap 前置比对
  Step 2-3: Jungle Scout MCP 取数 → JSON/CSV 落盘 → 计算 11 项指标框架
  Step 4-5: 指标异常检测 → 生成 8 个数据前提子问题 → agent 多源交叉写结构化答案
  Step 6-7: 三层产品推荐（约 50 款）+ B2B 货源 → 一次写完整 .md 报告 → 导出 .html/.xlsx → validate-report 校验 → summary + 必给追问
---

# Product Selection Deep Research — Real Data Intelligence Pipeline

> **Path Convention**: All skill-internal paths below are relative to the skills installation directory
> declared in `<skills_library>`. The agent MUST prepend the skills base path at runtime.
> Workspace output paths are relative to the workspace root defined in `<workspace_directory>`.

---

## ★ Global Rules (权威定义，全文唯一)

> **R1 — 报告写文件，对话仅摘要**: The complete report MUST be written to `./<报告标题>.md` via `write_file`. Conversation only outputs summary (title + file path + key findings + follow-up prompts). 用户要求导出/反馈打不开时，直接指引查看 `./<报告标题>.md`。
>
> **R2 — Two-Phase Rhythm (禁止穿插)**: Phase 1 (data collection) — complete ALL tool calls. Phase 2 (report writing) — ONE `write_file` → Phase B-XH → Phase D → summary. 禁止边搜索边写报告。
>
> ⚠️ `write_file` 和依赖该文件的 `bash` 命令**禁止放在同一轮 tool_call**——先 write，等返回后再 bash。违反会导致 “file not found” 竞态错误。
>
> **R3 — Phase D 后绝对终止**: After Phase D completes + summary + follow-up prompts output → **ZERO tool calls**。No read_file, list, bash_command, web_search, task_update, write_file, ask_user. Nothing after summary+follow-up. 唯一豁免口：`workctl delivery verify` 命令发布后，delivery verify 计入 Phase D 收尾步骤内（占位注见 `references/output-pipeline.md` 终止序列）；终止序列内的 `present_files` 在 summary 之前执行（时序见 `references/output-pipeline.md`），不属本条违反；除此之外仍绝对终止。
>
> **R4 — Delivery Binding**: Summary + follow-up prompts = **indivisible delivery unit**。If packaged as `delivery` field, both MUST be inside — never split.
>
> **R5 — 禁止编造产品**: 严禁手工捏造产品/ASIN/URL。宁可少而真，不要多而假。`export-recommendations` 内置 ASIN 校验 + Phase D 最终拦截。
>
> **R6 — 命令纪律**: 禁止猜测命令/参数（报错时允许 `--help` 查看后重试一次）；禁止 head/cat/ls/grep/find/glob/list 探测文件；禁止 `&&` 链接 workctl；结构化参数（JSON 数组/对象）走 `@file` 或 `--json-file` 文件通道（先 write 后引用），`@file` 值用双引号包裹（PowerShell 会把行首 `@` 解释为 splatting），禁止命令行内联；禁止创建 Task；禁止读取其他 skill 文件。
>
> **R7 — JSON/编码规范**: 数值无值写 `null`，禁止 NaN/None/N/A/空串。字符串无值写 `""`。所有输出 UTF-8 无 BOM。
>
> **R8 — 禁止委派**：所有步骤必须由当前 agent 直接执行（write_file / bash / read_file）。**禁止使用 `sessions_spawn`、sub-agent 委派**——子 agent 无法访问当前会话的文件系统，委派必然失败。`skill(action=read)` 仅允许用于获取 install_path，不得用于其他用途。

> **Report File Naming**: 报告文件名 = 报告主标题 + `.md`（避免文件系统非法字符 `: / \ ? * " < > |` 及半角括号 `( )`——Markdown 链接 `](url)` 语法在 `)` 处截断，含括号的文件名会使交付链接失效；需要括注时用全角（）或短横线）。

> **交付语义标准与 Manifest 协议**: 见 `references/output-pipeline.md`。

### Bilingual Support

CJK characters (U+4E00–U+9FFF) → `zh`, otherwise → `en`. All outputs follow detected language.

### 用户呈现原则

- 以市场分析师口吻呈现；不暴露 MCP 工具名/API 参数/环境变量
- 数据来源表述为"Jungle Scout 市场数据"或"Amazon 平台数据"
- 评分公式和指标计算过程不在报告中展示
- Data Source Badges: see `references/data_source_badges.md`

---

## When to Use

| Question Type | Example (EN) | Example (ZH) |
|--------------|-------------|-------------|
| Market Opportunity | "Find blue ocean opportunities in Home & Kitchen" | "寻找家居厨房品类的蓝海机会" |
| Competitive Analysis | "Analyze competitor ASIN B0XXXXXX traffic keywords" | "分析竞品 ASIN B0XXXXXX 的流量关键词" |
| Product Validation | "Is the $25-$35 yoga mat market worth entering?" | "瑜伽垫 $25-$35 价位值得进入吗？" |
| Ad & Traffic | "What's the PPC bid for 'portable blender'?" | "便携式搅拌机的 PPC 竞价是什么？" |
| Trend & Seasonality | "Is 'christmas lights' a seasonal product?" | "圣诞灯饰是季节性产品吗？" |

### ⛔ When NOT to Use

If the question can be answered by a single API call, do NOT activate this skill.

| User Intent | Correct Tool |
|-------------|-------------|
| Keyword search volume / ASIN sales / Keyword ranking / Brand share / Product database / Search trend | 直接用 Jungle Scout 对应工具 |
| Quick product search | `workctl tool jungle-scout product-database-query` |
| General web/trend lookup | `web_search` |

---

## How to Use

> ⚠️ **Round Directory**: All paths use `round-{N}`. Do NOT hardcode `round-1`.

### Overview

1. **Step 1** — Detect language (`zh`/`en`) → multi-target determination → Gap pre-check
2. **Step 2** — Collect Jungle Scout API data → CSVs
3. **Step 3** — Compute Indicator Data Framework → JSON
4. **Step 4** — Detect anomalies → Generate 8 sub-questions
5. **Step 5** — Agent analyzes 8 dimensions → structured answers + ranked recommendations
6. **Step 6** — 3-tier product recommendations → `recommendations.csv`
7. **Step 7** — B2B supply → Phase A reads → Phase B assemble+write → Phase B-XH → Phase D validate → manifest → direct_answer → present_files → summary + follow-up

> **命令全参承接**：本章各命令内联只给核心入参，完整参数（默认值/输入通道/Step↔命令索引）见 `references/workflow-commands.md`，可直接照抄。

> **FAILURE RECOVERY**: If any step (2–6) errors, continue and still output report in Step 7. 详细降级路径见 references/error-handling.md。
> **TURN BUDGET**: ~30 turns needed. Past turn 35 without starting Step 7 → skip to Step 7 immediately. **No matter what, MUST output report before stopping.** 预算不足时 manifest 降级序列见 `references/output-pipeline.md`。

---

## Step 1: Detect Language + Target Determination

先 `write_file` 将用户原文写入 `round-{N}/data/_query.txt`（回执后），再执行 `workctl workflow jungle-scout detect-language --file <该文件>`（**采集并行**：与 Step 2 的 `ensure-dirs` 无依赖，可同一轮 tool_call 批量发出） — CJK → `zh`, else → `en`（原文常含引号/中文/`$`，走文件通道避免命令行引用问题）。

> ⚠️ **排他选择**：多目标判定结果决定后续执行路径——单目标走本文件单轮管线；多目标按 `references/multi-target.md` 逐目标独立 `round-{N}` 执行，不允许混合执行（目标/品类/市场由 Step 1 确定后，后续步骤不得中途更换）。
> ⚠️ **多目标判定**：query 含多 ASIN / 多关键词 / 多站点时，读取 `references/multi-target.md` 并按其规则执行；单目标不读。
> ⚠️ **槽位取值**（market/category）：query 品类词/市场优先；未指明时取画像注入的槽位值（merchant_profile，见 slot-schema.json），两者都拿不到才追问一次，禁止自行假设。
> ⚠️ **Gap 前置比对**：Step 2 前按 `references/error-handling.md` 降级铁律 #8 执行维度能力比对与 Gap 表登记（正常路径也执行，不只降级时），不可得项在 summary 明说。

---

## Step 2: Collect Jungle Scout Data (OneShot)

> **Optional**: `workctl workflow jungle-scout ensure-dirs --base-dir round-{N} --format json`（可与 Step 1 的 `detect-language` 同一轮 tool_call 批量发出——采集并行，见 Step 1）

> **关键词质量（减法优先）**：`--keyword` 只接受**品类词**（1-3 个纯产品名词）。
> 1. 提取品类词（"便携式搅拌机"→ `portable blender`）
> 2. 剥离约束条件（功能/价格/品牌不进 keyword，在 Step 6 Tier 2 或 Section 5 使用）
> 3. 品类词搜不到时才扩词（同义词/下位词/英文变体）
> 4. 品类词太泛时才 `ask_user` 追问一次

> ⚠️ 先读 `references/mcp-tools.md` 了解返回结构。⛔ 禁止直接调用 workctl 工具，必须通过 fetch-data（唯一例外：多 ASIN 补充采集，见 `references/multi-target.md`）。⛔ 禁止搜索命令。

```bash
workctl workflow jungle-scout fetch-data --keyword "<user_keyword>" --marketplace us --output-dir round-{N}/data --format json
```

> 可选参数（如 `--asin`）见 `references/workflow-commands.md`；marketplace 清单见 `references/api_reference.md`。

### 2b. Convert JSON → CSV

```bash
workctl workflow jungle-scout convert-data --data-dir round-{N}/data --format json
```

---

## Step 3: Compute Indicator Data Framework

```bash
workctl workflow jungle-scout analyze-indicators --keyword "<keyword>" --input-dir round-{N}/data --format json
```

Computes 11 indicators. See `references/indicator_definitions.md` for formulas/thresholds, `references/analysis_criteria.md` for qualitative standards.

**Output**: `round-{N}/data/indicator_framework.json`

---

## Step 4: Sub-Question Generation (8 Dimensions)

**No script** — agent generates directly. Generate exactly **8 sub-questions**:

> 📖 **Step 4 生成子问题前先读** `references/subquestion_templates.md`——8 维维度总表（8 个 target_dimension key 与固定顺序，唯一出处）+ 完整模板库/异常检测规则/示例。

**Quality**: Every sub-question MUST be: Data-Premised (specific number), Cross-Referential (≥2 CSVs), Decision-Oriented, Calculable, Non-Obvious.

**Process**: Read indicators → detect anomalies → detect question type → generate 8 questions (≥3 anomaly-triggered) → save:

```bash
workctl workflow jungle-scout save-subquestions --base-dir round-{N} --file round-{N}/reports/subquestions.json --format json
```

> Prerequisite: `write_file` prepare `subquestions.json`（structure: `{question_type, user_query, language, questions: [{question_id, question_text, target_dimension, ...}]}`）。
> ★ questions[] 每项必填 `question_id` / `question_text` / `target_dimension`（值取维度总表的 target_dimension key，见 `references/subquestion_templates.md`）——缺任一字段 CLI 直接返回 exit 30（不发上游请求）。

**Output**: `round-{N}/reports/subquestions.json`

> ⚠️ After saving, `read_file` verify all 8 questions contain specific numbers. Regenerate if any is just a dimension name rephrased.

---

## Step 5: Real Data Answers

> ★ **Agent IS the analyst.** No external LLM calls. Reads data → reasons → produces structured answers.
> ★ This step produces `subquestion_answers.json` — the analytical backbone of Section 3.
> ⚠️ 数据复用优先：使用已有 CSV + indicator_framework.json。补充数据保存不同文件名，不覆盖原始文件。所有补充采集必须在 Step 7 Phase B 前完成。

### 5a. Extract data

```bash
workctl workflow jungle-scout extract-data --base-dir round-{N} --data-dir round-{N}/data --format markdown
```

### 5b. Agent writes 8 answers

> ★ See `references/js_data_answer_prompt.md` for JSON schema, quality rules, depth requirements.

**Key rules**: Every `answer_text` ≥3 specific numbers. Every `analysis_reasoning` shows calculations. Include `recommended_asins` when analysis identifies products.

```bash
workctl workflow jungle-scout save-subquestion-answers --base-dir round-{N} --file round-{N}/reports/subquestion_answers.json --format json
```

> Prerequisite: `write_file` prepare JSON——answers JSON 外层为 `{answers:[…]}`，SubQuestionAnswer 字段 schema 见 `references/js_data_answer_prompt.md`。

> ★ CSV→JSON 数据处理（本步与 6b）直接在推理中完成，不写中间脚本：数据量小（competitors.csv ~<40 行，已进上下文），直接推理处理即可，产物用 `write_file` 写入 `round-{N}/`；数值解析要点见 `references/sdk_pitfalls.md` §5。

**Output**: `round-{N}/reports/subquestion_answers.json`

> ⚠️ After saving, verify: 8 answers, each ≥3 numbers + ≥1 calculation. Rewrite failures before Step 6.

### 5c. Aggregate ranked recommendations

```bash
workctl workflow jungle-scout rank-recommendations --base-dir round-{N} --format json
```

**Output**: `round-{N}/reports/product_recommendations_ranked.json` (Tier-1 source, highest weight)

---

## Step 6: Product Recommendations — 3-Tier Strategy

> ⚠️ 数据复用优先：使用已有 CSV/JSON。补充数据保存不同文件名。

### 6a. Tier 1 — Analysis-Driven (from Step 5c)

Already generated. Ranked by `dimension_count`, marked `recommendation_source: "analysis-driven"`. Typical: 5–15 products.

### 6b. Tier 2 — Data-Filtered (from `competitors.csv`)

If Tier 1 < ~20 products, supplement via data-driven filtering: read competitors.csv data (already in context from Step 5), compute relative thresholds (e.g., reviews < median, price < 75th percentile), select qualifying products. Mark `recommendation_source: "data-filtered"`. Write results directly to `{base_dir}/reports/_tier2_products.json` via write_file。数据量小（~<40 行），直接在推理中处理，不写中间脚本；数值字段无值写 `null`，禁止 NaN（见 R7）。

### 6c. Tier 3 — Search Supplement

Fill toward ~50 total via **real searches only**（多关键词**两批矩阵**——采集并行，两批拆分即 R2 write→bash 时序要求）:
1. 从 Step 5 结论提炼 4-6 个补充关键词，每个分配独立 `<slug>` 与独立输出文件
2. **批 1**：N 个关键词文件的 `write_file` **同一轮 tool_call 批量发出**——每个关键词写入 `round-{N}/data/_tier3_kw_<slug>.json`（内容为 JSON 数组：`["<query>"]`），各文件独立 slug、互不覆盖
3. **批 2（等批 1 全部 write 回执后）**：N 条 `product-database-query` **同一轮 tool_call 批量发出**，每条: `workctl tool jungle-scout product-database-query --include_keywords "@round-{N}/data/_tier3_kw_<slug>.json" --page_size 50 --format json --output round-{N}/data/tier3_<slug>.json`（同批各命令的 `@` 读文件与 `--output` 写文件一一对应、互不共享——无读写竞态；单条失败/0 结果仅该 slug 跳过（无对应 tier3 文件），不阻塞同批其他关键词；`@` 文件入参，引号规则见 R6，禁止命令行内联 JSON 数组）
   > 旁注（`--output` 语义，仅限 `--output`，不含 `--output-dir`/`--output-file`）：`--output` 须指向工作目录内真实文件路径（下游消费该文件）；确需丢弃输出时 `/dev/null`（仅 macOS/Linux）为合法丢弃语义（命令返回成功、数据不落盘）——此时下游不可再引用该路径；Windows 无此语义，改为照常输出至工作目录内真实文件且下游不消费其内容。
   > 落盘形态（写死，勿自行解析验证）：`--output` 写入 **workctl success envelope**（顶层 `success`/`data`/`meta`），`data.result` 是 JSON 字符串，其内容才是 `references/api_reference.md` 描述的裸 envelope（`data[i].attributes` 下记录产品）——双层嵌套结构。agent 无需读取/解析，仅供 `merge-tiers` 内部消费。
4. 产品由 merge-tiers 内置合并（去重与 `recommendation_source: "search"` 标记均为 CLI 内置；按 `tier3_*.json` glob 消费，与文件数量/落盘顺序无关），本步只保证搜索结果已落盘 `tier3_*.json`——**merge-tiers（6d）必须等批 2 全部回执（所有 `tier3_*.json` 落盘）后才可执行（真依赖，不可提前）**

> ⛔ 仅限真实搜索来源的产品进 CSV（ASIN 真实性见 R5）。
> ⛔ 禁止 `read_file`/解析 `tier3_*.json`（含 `python3 -c` 等脚本解析）——该文件是上述双层嵌套形态，按 api_reference 裸 envelope 路径解析必然 KeyError；产品合并/去重/标记全部由 `merge-tiers` 内置完成，本步无需任何手工处理（与 5b/6b 直接推理同理：此处干脆不处理）。

### 6d. Merge + Export CSV

```bash
workctl workflow jungle-scout merge-tiers --base-dir round-{N} --format json
```

> 三层合并由 merge-tiers 内置完成——直接执行上方命令即可，无需任何手写合并处理。

```bash
workctl workflow jungle-scout export-recommendations --base-dir round-{N} --file round-{N}/reports/_merged_products.json --output-file round-{N}/reports/recommendations.csv --format json
```

### ★ Step 6 Completion Checkpoint

Before Step 7, verify ALL exist:
1. `round-{N}/reports/recommendations.csv` — ≥5 rows (header + ≥4 真实产品)
2. `round-{N}/reports/product_recommendations_ranked.json`
3. `round-{N}/data/tier3_*.json` — ≥1 file (证明执行了真实搜索；以 `product-database-query` 命令返回 success 为准，禁止探测/读取文件核对——见 6c ⛔)

⛔ recommendations.csv 因 no_data（exit 30）未生成时，按 error-handling.md「数据为空（非故障）」行降级：该维度按暂无数据如实交付，coverage 标 records=0，禁止手工提取凑数。

**If missing → go back and execute corresponding sub-step.**

---

## Step 7: B2B Supply + Write Report + Output Summary

### 7a. B2B Supply Search

Search suppliers **per direction** (Top 1–3 from Step 5 analysis)——**采集并行**：Top 1–3 方向的 `product_supplier_search` **同一轮 tool_call 批量发出**（各方向查询独立、无相互依赖；单方向失败/0 条仅该方向按 `references/error-handling.md` 降级，不阻塞同批其他方向）:

```
product_supplier_search(intent_type="product", tasks=[{"query": "<方向1 query>"}])
product_supplier_search(intent_type="product", tasks=[{"query": "<方向2 query>"}])   // 同批：每方向一次独立调用
```

各方向结果统一汇入 `xlsx_raw_data.json` 的 `"b2b_supply"` 字段（合并顺序与发出顺序无关）。

**★ xlsx_raw_data.json（5 字段：indicator_framework / analysis_summary / decision_comparison / b2b_supply / csv_paths）**，内容一律取自管线真实数据（indicator_framework.json / Section 3 / Section 5 / 7a 搜索结果），不得手写摘要指标。

> 📖 结构与字段示例见 `references/csv_schema.md`「xlsx_raw_data.json 5 字段结构」——write_file 前先读该节。

> **写入方式**: 用 `write_file` 工具一次写入 `round-{N}/data/xlsx_raw_data.json`（自动创建父目录，无需 mkdir；⛔ 禁止用 echo/cat 重定向写文件——Windows PowerShell 重定向默认 UTF-16LE 编码，CLI 将无法解析）。

> ⏰ b2b_supply 必须在 7a 准备完毕（write_file 报告之前），Phase B 后不得修改。

### 7b. Phase A: Read ALL inputs (4 mandatory read_file)

4 个 `read_file` 相互独立——**同一轮 tool_call 批量发出**（采集并行），全部回执后才进入 Phase B：

| # | `read_file` target | What you get |
|---|-------------------|--------------|
| 1 | `assets/report_template_zh.md` (zh) or `assets/report_template.md` (en) | Section structure + 字段映射 + 格式规则 |
| 2 | `round-{N}/reports/subquestion_answers.json` | 8 SubQuestionAnswer objects |
| 3 | `round-{N}/reports/recommendations.csv` | ALL product recommendations |
| 4 | `references/output-pipeline.md` | XLSX 导出 + HTML 渲染命令与处理 + Manifest 协议 |

> ⚠️ If `recommendations.csv` missing or < 5 rows → STOP, go back to Step 6.

### 7c. Phase B: Assemble + Write + Export + Render

> ★ 执行顺序（严格，不可跳步）：
> 1. 数据收集完毕（所有搜索/读取/B2B 完成）
> 2. `write_file` → 一次写入完整 `./<报告标题>.md`（见 R2）
> 3. Phase B-XH: XLSX + HTML 导出（命令见 output-pipeline.md）
> 4. Phase D: `workctl workflow jungle-scout validate-report ./<报告标题>.md`
> 5. FAIL → 先按 7d「报告形态判定」分流：定制形态/数据不足等确定性失败 → 直接转降级交付（第 6 步，status=partial）；常规 FAIL → 修复 → 回到 4（最多 3 次）
> 6. PASS（或 FAIL 3 次用尽、或 7d 报告形态判定豁免——后两者均 = 降级交付、`status`=partial，定义见 output-pipeline.md status 行）→ 用 write_file 依次生成 `manifest.json` → `direct_answer.md`（时序不可调换；字段与填写规则见 output-pipeline.md「Manifest v1 交付真值协议」）→ **一次** `present_files` 交付全部 user 可见文件（`.md`/`.html`/`.xlsx`/`recommendations.csv`，降级含可用文件，internal 不入列）→ summary（含 XLSX + HTML 路径）→ follow-up prompts → STOP（见 R3）

**Section assembly**: 严格按 template 结构。Section 3 每维度 7 字段（映射见 template 注释）。Section 4 产品来自 `recommendations.csv`，按战略主题分组，格式/ASIN 规则见 template 注释。表格空行规则见 template 末尾注释。

### 7d. Phase D: Validate & Fix (MANDATORY)

```bash
workctl workflow jungle-scout validate-report ./<报告标题>.md
```

- **Exit 0 (PASS)** → 按 7c 第 6 步交付序列执行（manifest.json → direct_answer.md → present_files → summary → follow-up → STOP）
- **exit 30 (FAIL，reason=report_validation_failed)** → **先做报告形态判定**（锚点 = 任务要求 vs 模板结构对照，不以 FAIL 次数为判据）：FAIL 明细源于报告有意采用非标准模板结构（任务本身为定制形态，如单点确认/专项流量核对；重写为标准模板与用户任务要求冲突，或管线数据不足以填充标准 Section）→ 属确定性失败，按铁律 #6 直接转降级交付、免除 3 次修复重验（数据为空/维度无数据场景仍按 error-handling.md L13/L19 保留结构并标"暂无数据"，不适用本豁免）——报告与已生成导出物照常交付，仍按 7c 第 6 步生成 `manifest.json` → `direct_answer.md`（status 推导 partial），summary 与交付清单逐项标注未通过校验项；否（常规 FAIL）→ 按下表修复 → 重新验证（最多 3 次）。FAIL 明细来自 envelope `error.details.missing`（对象数组），按下表查 `category` 字段：

| FAIL 类别 | 含义 | 修复动作 |
|----------|------|---------|
| `[STRUCTURE]` | .md 结构缺失 | `write_file` 重写完整报告 |
| `[MISSING_HTML]` | .html 缺失/空 | 重跑 `workctl workflow jungle-scout export-all --base-dir round-{N} --input "../<报告标题>.md" --skill dd`（`--input` 相对 `--base-dir` 解析，见 output-pipeline.md） |
| `[MISSING_XLSX]` | .xlsx 缺失/空 | 重跑 `workctl workflow jungle-scout export-all --base-dir round-{N} --input "../<报告标题>.md" --skill dd`（同上） |

- 多类别同时出现 → 按类别依次修复。[MISSING_HTML/XLSX] 不需重写 .md。
- 3 次用尽 → 输出 as-is：报告与已生成导出物照常交付，仍按 7c 第 6 步生成 `manifest.json` → `direct_answer.md`（status 推导与平台契约见 output-pipeline.md），summary 标注不可用项。

> ⛔ Phase D 仅允许 bash_command（validate/render/export）+ write_file（仅 STRUCTURE 类修复与 PASS 后、报告形态判定豁免后或 3 次用尽后的 `manifest.json`、`direct_answer.md`）。禁止任何其他工具。

### 7e. Follow-up Prompts ( mandatory)

Summary 后**必须**追加 1-3 条后续行动建议——格式固定为：💡 **后续行动建议** 标题 + "您可以直接说：" 引导语 + 编号 1-3 条快捷指令（可引用报告中具体商品/ASIN/数据），与 summary 构成不可分割交付单元（R4）。

**Selection rules**:
1. **发品优先**: Report 含 **Amazon** 或 **1688** 链接时，"帮我把第 X 个商品发到国际站"必须为第一条。其他平台（国际站/Temu/SHEIN/Shopee/TikTok/eBay/AliExpress）**不支持**发品。
2. **无链接时**: 基于报告数据的探索建议（深入分析/蓝海/趋势/货源）
3. 数据驱动（引用具体 ASIN/品类/数据点）、口语化、不重复维度、不硬凑（2-3 条）

**发品平台白名单**: Amazon (amazon.com/*) ✅ | 1688 (detail.1688.com/*) ✅ | 其他所有平台 ❌

> ⚠️ Follow-up 必须与报告 Section 5 建议一致，不得矛盾。

**Output**: summary (title + key findings + file path + 📊 XLSX + 🌐 HTML + **交付清单**) + follow-up prompts → STOP (R3). 链接规范见 `references/output-pipeline.md`。

> **交付清单**（summary 的结构要素）：用户可得交付物逐件 ✅/❌ + ❌ 项兜底指向——定义与登记基准见 `references/output-pipeline.md`「direct_answer.md 生成 / delivery 规则」；清单内容在 summary 与 direct_answer.md 两处同源、逐字一致的义务不变。

> **Optional**: `workctl workflow jungle-scout save-report --base-dir round-{N} --file ./<报告标题>.md --text "<summary>" --format json`（`--text` 内容保持单行、避免引号/特殊字符）

---

## CSV Requirements

See `references/csv_schema.md`:
- `recommendations.csv` — 13 columns (including `reference_id`)
- `b2b_supply` — 8 fields（内嵌 xlsx_raw_data.json，不独立生成 CSV）

---

## Dependencies

> workctl 命令 ↔ Step 完整索引见 `references/workflow-commands.md` 顶部命令索引表。

| Tool | Purpose | Step |
|------|---------|------|
| `read_file` | Phase A reads (4×) | 7 |
| `write_file` | 写入数据/报告/query 文件 | 1/4/5/7 |
| `present_files` | 终止序列交付 user 可见文件 | 7 |
| `bash_command` | 执行 workctl 命令 | 全程 |
| `ask_user` | 品类词/多目标收敛追问 | 1/2 |
| `product_supplier_search` | B2B supply search | 7a |
| `web_search` | 降级兜底 | 降级 |

### workctl 命令

> workctl 命令详见 `references/workflow-commands.md`（完整参数与输出形态）；下表为命令清单速查。

| 命令 | 用途 | Step |
|------|------|------|
| `workctl workflow jungle-scout detect-language` | 用户语言判定（zh/en） | 1 |
| `workctl workflow jungle-scout ensure-dirs` | 创建 round 目录结构（可选） | 2 |
| `workctl workflow jungle-scout fetch-data` | Jungle Scout MCP 并发取数 + raw JSON 落盘 | 2 |
| `workctl workflow jungle-scout convert-data` | raw JSON 转换为 CSV 数据集 | 2b |
| `workctl workflow jungle-scout analyze-indicators` | 计算 11 项指标框架 | 3 |
| `workctl workflow jungle-scout save-subquestions` | 写入 8 个数据前提子问题 | 4 |
| `workctl workflow jungle-scout extract-data` | 按子问题提取 CSV 数据（markdown 语境） | 5a |
| `workctl workflow jungle-scout save-subquestion-answers` | 保存子问题结构化答案 | 5b |
| `workctl workflow jungle-scout rank-recommendations` | 答案排序产出 Tier-1 产品推荐 | 5c |
| `workctl workflow jungle-scout merge-tiers` | 三层产品推荐合并去重 | 6d |
| `workctl workflow jungle-scout export-recommendations` | 导出推荐产品 CSV（内置 ASIN 校验） | 6d |
| `workctl tool jungle-scout product-database-query` | Tier-3 产品池批量查询 | 6c |
| `workctl workflow jungle-scout export-all` | XLSX + HTML 一次导出 | 7 |
| `workctl workflow jungle-scout save-report` | summary 保存（可选） | 7 |
| `workctl workflow jungle-scout validate-report` | Phase D 报告结构校验 | 7d |
| `workctl tool jungle-scout keywords-by-asin` | 多 ASIN 关键词反查补充采集 | 2 |
| `workctl tool jungle-scout sales-estimates` | 多 ASIN 销量估算补充采集 | 2 |

---

## 错误处理与降级交付

⛔ 禁止只说"无法完成"——**部分交付 > 全有或全无**，任何情况必须输出报告文件（铁律 #1/#2）；**Turn budget 超限** → 立即跳 Step 7（见 How to Use）。

📖 完整降级决策树、8 条铁律与关键词降级流程见 `references/error-handling.md`——任一失败场景先读该文件。
