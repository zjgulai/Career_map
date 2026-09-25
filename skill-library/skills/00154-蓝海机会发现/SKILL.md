---
name: 蓝海机会发掘
version: "1.7.6"
description: |
  分析供需错配、发现高潜力低竞争品类，给出差异化路径和国际站发品策略。
  支持两种模式：跨平台对比（国际站供给 vs Amazon/Temu/SHEIN/TikTok Shop/Shopee/1688/eBay/AliExpress/Lazada 外部需求）和国际站原生蓝海。
  品类词是执行前提：优先取 query 品类词，其次取主营品类画像，两者都拿不到时才向用户追问确认；不处理纯热销榜、市场全景或 1688 找同款，也不做单品 8 维深度验证。
enabled: true

triggers:
  - 蓝海
  - 供需错配
  - 低竞争
  - 差异化机会
  - 细分机会
  - 国际站供给不足
  - 高潜力低竞争
  - 发品策略
  - blue ocean
  - low competition

examples:
  - 查找在亚马逊热卖但在阿里国际站供给不足的产品
  - Temu 上什么品类在国际站还是蓝海？
  - 户外照明领域有哪些低竞争、高利润的细分赛道？
  - 国际站上做 LED 灯带有什么蓝海细分市场？
  - 我的工厂拥有 FDA 认证，应关注哪些高增长类目？

excludes:
  - skill: alibaba-hot-product-insight
    when: 用户只想看热销、爆品、TopN 或某平台卖什么火，没有低竞争/供需错配诉求
  - skill: alibaba-market-analysis
    when: 用户要完整市场全景、行业规模、竞争格局、买家画像、进入策略或值不值得做
  - skill: alibaba-jungle-scout-deep-dive-analyzer
    when: 用户要 Amazon/Jungle Scout/ASIN/竞品/关键词/PPC 的深度选品报告
  - skill: alibaba-1688-product-research
    when: 用户要在 1688 找商品、找同款、图搜或链搜
  - skill: alibaba-competitor-analysis
    when: 用户要标杆同行/竞品店铺发现、竞品对标或定时监控竞店，而非找蓝海、低竞争或供需错配类目
workflow: |
  Step 1: 判断数据路径（跨平台对比 or 国际站原生蓝海；命中多目标 → 逐目标串行）
  Step 2: 读取对应 reference 文件，执行数据获取
  Step 3: 蓝海机会识别 + 评分 → 5 个蓝海机会 → 输出报告（含发品策略）
---

# 蓝海机会发现

## When to Use

- 用户要低竞争、供需错配的蓝海品类机会与发品策略：跨平台对比（国际站供给 vs Amazon/Temu/SHEIN/TikTok Shop/Shopee/1688/eBay/AliExpress/Lazada 外部需求）或国际站原生蓝海两种模式。
- 品类词是执行前提：优先取 query 品类词，其次取主营品类画像，两者都拿不到时才向用户追问确认。

不适用（改用其他 skill）：

- 只想看热销、爆品、TopN 或某平台卖什么火，没有低竞争/供需错配诉求 → alibaba-hot-product-insight
- 完整市场全景、行业规模、竞争格局、买家画像、进入策略或值不值得做 → alibaba-market-analysis
- Amazon/Jungle Scout/ASIN/竞品/关键词/PPC 的深度选品报告 → alibaba-jungle-scout-deep-dive-analyzer
- 在 1688 找商品、找同款、图搜或链搜 → alibaba-1688-product-research
- 标杆同行/竞品店铺发现、竞品对标或定时监控竞店，而非找蓝海、低竞争或供需错配类目 → alibaba-competitor-analysis

## How to Use

- 流程主线：Step 1 判断数据路径（跨平台对比或国际站原生蓝海；命中多目标 → 逐目标串行）→ Step 2 读取对应 reference 文件执行数据获取（国际站蓝海路径按「批 1 采集、批 2 导出」两批矩阵执行，详见 `references/step2-opportunity.md`）→ Step 3 蓝海机会识别 + 评分 → 5 个蓝海机会 → 输出报告（含发品策略）+ XLSX/HTML 导出。
- 典型调用形态："找亚马逊热销但国际站供给少的蓝海品 — 便携搅拌机"（跨平台对比路径） / "LED灯带在国际站有什么蓝海细分市场？"（国际站蓝海路径）——完整执行序列见文末 Examples。

> 🔧 **允许工具：** `read_file`（读取 reference/模板）、`write_file`（写中间 JSON / 报告 / 收尾文件）、`product_supplier_search`（内置 tool_call）、`web_search`（内置 tool_call）、`present_files`（终止序列交付）、`ask_user`（品类/市场槽位缺失时追问）、workctl CLI（白名单见 `references/platform-config.md`）
>
> ★ 报告写入文件后，按 Step 3 终止流程完成导出与收尾文件，再在对话中输出 summary（含追问段），然后**立即终止**——summary 之后禁止任何工具调用。保持调用收敛（最少必要调用），不为覆盖面追加调用。
> ★ **禁止猜测/探索**——所有 workctl 命令和参数已在 references/ 列出，直接复制执行，数据处理均通过 workctl 命令完成；禁止 head/cat/ls/grep/find/glob/list 探测；禁止 `&&` 链接多个 workctl。报错时允许 `workctl <cmd> --help` 修正后重试一次；重试判据与降级见 `references/error-handling.md` 铁律 #9/#10。
> ★ **文件写入白名单**（除此以外一律禁止）：`--output <path>` 写中间 JSON；最终报告 `.md` + `.html`；XLSX `.xlsx`；终止序列的收尾文件 `manifest.json` 与 `direct_answer.md`（顺序见 `references/output-pipeline.md`「终止序列」）。**禁止在 /tmp 或工作目录外创建文件。**
> ★ **禁止创建 Task / 读取其他 skill 文件 / 编造数据**——单轮执行；依赖已在 references/ 自包含；数据必须来自工具返回，无数据写 `-`。严禁把市场规模指数/供需比/GMV 指数等相对值字段说成询盘数/访客数等绝对量。
> ★ **输出规范**——JSON 数值无值写 `null`（禁止 NaN/None/N/A），字符串无值写 `""`；所有文件 UTF-8 无 BOM。
> ★ **报告格式强制**——写报告前必须先 `read` 对应 `assets/report_template_*.md`，严格按模板输出。
>
> ### Bilingual: CJK → `zh`, else → `en`.

---

## Step 1: 判断数据路径

> ⚠️ **槽位取值**（品类/市场）：query 品类词/市场优先；未指明时取画像注入的槽位值（merchant_profile，见 slot-schema.json），两者都拿不到才追问，禁止自行假设。
> ⚠️ **防御兜底**：query 无品类方向且画像也无注入槽位值时，不执行数据采集，直接输出品类确认问句并终止（零工具调用）。

| 用户 query 包含 | 数据路径 | 读取文件 |
|-----------------|---------|----------|
| "亚马逊"、"Amazon"、"站外热销" | Amazon | `references/step2-amazon.md` |
| "Temu" / "SHEIN" / "1688" / "Shopee" / "TikTok" | Global | `references/step2-global.md` |
| "eBay" / "速卖通" / "AliExpress" / "Lazada" / "趋势" / "Google Trends" | web_search | `references/step2-websearch.md` |
| "国际站蓝海" / "细分市场" / "场景机会" / "供需缺口" / 未提任何外部平台 | 国际站蓝海 | `references/step2-opportunity.md` |
| 命中多平台 / 多品类 / 多站点（如"Amazon 和 Temu"、"LED灯带与户外灯具"、"美国站和日本站"） | 逐目标串行 | `references/multi-target.md` |

> ⚠️ **路由优先级**：外部平台 + "蓝海"（如"亚马逊蓝海"）→ 走外部平台路径。只有未提任何外部平台时才走国际站蓝海。
> ⚠️ 1688 ≠ 国际站。1688 走 `references/step2-global.md`（需求侧），供给侧仍用国际站数据。
> ⚠️ **排他选择**：判定结果决定唯一路径，不允许混合调用。**Gap Step 1 前置**：进入 Step 2 前将用户请求维度（时间窗/地域/排序/粒度）与数据源能力比对，不可得项立即列入 Gap 表并在 summary 明说（能力清单与声明规则见 `references/error-handling.md` 降级铁律 #8）。

场景标签（叠加在平台之上，影响报告侧重点）：跨平台供需错配 / 国际站蓝海 / 区域潜力 / 工厂能力匹配 / 黑马新品。

---

## Step 2: 执行数据获取

### Query 构造规则

> ★ **核心品类词优先，约束后置。** 提取核心品类词（1–3 词）作搜索关键词，修饰词/约束不进 query。

| 层级 | 处理 |
|------|------|
| 核心品类词（如"LED灯带"） | 进 `--categoryDesc` / `--query` / `--keyword`，英文最多 3 词 |
| 修饰词（认证/材质/规格） | **不进 query**，保留在报告分析中 |
| 场景标签 | 仅用于 Step 1 路由 |

- **Action**: 用 `read_file` 读取 Step 1 路由表中对应的 reference 文件，**严格按该文件中的指令执行**。
- **时序总则：采集阶段并行、导出/收尾阶段串行（固定文件名覆写约束）。**
- 跨平台路径：供给侧和需求侧应尽量并发执行。
- 国际站蓝海路径（两批矩阵，详见 `references/step2-opportunity.md`）：
  - **批 1（采集）**：category-infer 得到 cateId 后，opportunity-discovery + product-selection × 2 + product_supplier_search 同批发出——全部只消费该 cateId（产品补充禁止重调 category-infer）；
  - **批 2（导出）**：批 1 全部落盘回执后，extract-blue-ocean-opportunity + extract-supply 同批发出——各消费不同文件，互不依赖；
  - **兜底分支保持串行**（依赖批 2 extract-blue-ocean-opportunity 输出）：product-selection exit 70 用 `cateLv2Id` 重试；product-selection 双失败用 `top3HotKw` 走 `product_supplier_search` 兜底。

---

## Step 3: 蓝海机会识别 + 输出报告

> ⛔ **九步终止**：① 写报告 → ② 生成追问段 → ③ 追问段写入报告末尾 → ④ XLSX + HTML 导出 → ⑤ 自检验收 → ⑥ 收尾文件：`manifest.json` → `direct_answer.md` → ⑦ 一次 `present_files` 交付 → ⑧ 输出 summary（含追问段） → ⑨ **立即终止**。
> 各步的字段规范、闸门与降级标注以 `references/output-pipeline.md` 为准（本行只列时序，不重定义）。

### 3.0 读取报告模板（必做）

| 需求侧路径 | 必须 read 的模板 |
|-----------|-----------------|
| Amazon | `assets/report_template_amazon_zh.md` |
| Temu/SHEIN/1688/Shopee/TikTok/eBay/AliExpress/Lazada | `assets/report_template_websearch_zh.md` |
| 国际站蓝海 | `assets/report_template_opportunity_zh.md` |

### 3.0.1 XLSX + HTML 导出（报告 .md 写入后执行）

按 `references/output-pipeline.md` 执行 XLSX + HTML 原子输出（含 JSON schema、命令、Manifest、完成闸门）：
1. 将报告表格数据写入 `<工作目录>/data/xlsx_raw_data.json`（固定文件名；write 自动创建父目录，无需 mkdir；schema 见 output-pipeline.md）；多目标时逐目标“写入 → 导出”串行执行（同一固定文件按目标顺序覆写，见 `references/multi-target.md`）
2. `workctl workflow jungle-scout export-all --base-dir <工作目录> --input "./<报告标题>.md" --skill bo`（一次调用同时完成 XLSX + HTML；降级与禁令见 `references/output-pipeline.md`「XLSX + HTML 导出」）

### 3.1 蓝海机会识别

- **跨平台路径**：需求强 + 供给弱 → 蓝海。4D 评分（DCGF）详见 `references/scoring_model.md`。
- **国际站蓝海路径**：`workctl workflow market extract-blue-ocean-opportunity` 已完成过滤排序，Top 5 即为蓝海机会；4D 评分（SVGF）由 `workctl workflow market score-blue-ocean` 执行，报告直接消费回执评分（调用方式与降级见 `references/step2-opportunity.md`）。

报告结构（6 个 Section）以 Step 3.0 强制读取的模板为准。

### 3.2 统一追问段

> 追问段规则（SSOT 原则 + URL 发品白名单 + 触发判定 + 模板优先级 + 禁止项 + 输出格式）见 `references/followup-rules.md`

### 自检

> 输出前按 `references/self-check.md` 逐项验收（BO 特有项）。

---

## Dependencies

| Tool | Purpose |
|------|---------|
| `workctl icbu product data-advisor-category-infer` | 国际站类目预测 |
| `workctl icbu product data-advisor-product-selection` | 国际站排行数据 |
| `workctl icbu product data-advisor-opportunity-discovery` | 国际站细分市场机会发现 |
| `workctl workflow jungle-scout fetch-data` | Amazon 需求侧数据采集 |
| `web_search` | 外部平台需求侧（Temu/SHEIN/1688/Shopee/TikTok/eBay/AliExpress/Lazada）/ fallback |
| `product_supplier_search` | 国际站供应商搜索（供给侧） |
| `workctl workflow market extract-supply` | 供给侧数据合并提取 |
| `workctl workflow market extract-blue-ocean-opportunity` | 国际站蓝海场景过滤排序 |
| `workctl workflow market score-blue-ocean` | 蓝海评分（SVGF） |
| `workctl workflow market extract-amazon-topn` | Amazon 需求侧数据提取 |
| `workctl workflow market extract-global-topn` | 外部平台数据提取（休眠，当前路径不调用） |
| `workctl workflow jungle-scout export-all --skill bo` | XLSX + HTML 一次导出（Step 3） |
| `read_file` | 读取报告模板 / reference 文件 |
| `write_file` | 写中间 JSON / 报告 .md / 收尾文件 |
| `ask_user` | 品类/市场槽位缺失时追问用户 |
| `present_files` | 终止序列交付 user 可见文件 |

> 工具参数速查：国际站 → `references/platform-config.md`；Amazon → `references/amazon-tools.md`；Global/web_search → `references/step2-websearch.md`；蓝海 → `references/opportunity-discovery.md`；评分 → `references/scoring_model.md`

---

## 错误处理与降级交付

> ★ **部分交付 > 全有或全无**——某 Section 数据缺失时其余正常输出；降级后仍要交付，禁止以“正在处理”结束。
> ★ **工具报错是降级信号，不是 bug**——不调试、不排查，直接走 fallback。
>
> 📖 完整降级决策树 + 铁律 + BO 特有场景见 `references/error-handling.md`

---

## Examples

**"找亚马逊热销但国际站供给少的蓝海品 — 便携搅拌机"**
→ Step 1: Amazon → 读取 `references/step2-amazon.md`
→ Step 2: 供给侧（category-infer → 批 1：product-selection × 2 + product_supplier_search 同批发出 → 批 2：extract-supply）+ 需求侧（jungle-scout fetch-data → extract-amazon-topn）
→ Step 3: 供需对比 → 5 个蓝海机会 → 报告（`assets/report_template_amazon_zh.md`）+ XLSX + HTML

**"LED灯带在国际站有什么蓝海细分市场？"**
→ Step 1: 国际站蓝海 → 读取 `references/step2-opportunity.md`
→ Step 2: category-infer → 批 1 同批发出（opportunity-discovery + product-selection × 2 + product_supplier_search）→ 批 2 同批发出（extract-blue-ocean-opportunity + extract-supply）→ 扩展兜底（二次 opportunity-discovery）批 2 后串行 → score-blue-ocean（批 2 落盘回执后串行，以最终一次 bo_oppo_extract.json 为准）
→ Step 3: Top 5 蓝海场景 → 报告（`assets/report_template_opportunity_zh.md`）+ XLSX + HTML
