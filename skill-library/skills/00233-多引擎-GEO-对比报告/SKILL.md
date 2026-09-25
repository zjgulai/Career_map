---
name: geo-multi-engine-comparison
version: 1.55.0
description: 基于同一批 prompts 的多引擎（ChatGPT / Perplexity / Gemini）GEO 采集结果，生成三引擎对比 HTML 仪表盘（提及率矩阵、引用结构、Top10 信源、UGC 对比、生态洞察、分引擎策略）。当用户提到「三引擎对比」「多引擎对比」「engine comparison」「comparison dashboard」「对比报告」，或已有多个引擎的输出目录想横向比较 AI 搜索可见度时，务必使用本技能——即使用户没有明确说"对比报告"，只要涉及 ChatGPT/Gemini/Perplexity 三个引擎的并排分析就应触发。
---

# 多引擎 GEO 对比报告

把「同一批 prompts 分别在 ChatGPT / Perplexity / Gemini 采集」的三份结果，汇总成一份自包含的对比 HTML 仪表盘。

## 前置依赖

- 各引擎的输出目录已存在：`data/outputs/<brand>_<date>[_<engine>]/`，每份含 `mention_stats.csv`、`summary.csv`、`citation_domains.csv`（由 `geo-agent` 插件的 `run_pipeline.py` 产出）。
- 若某引擎目录缺失：先完成该引擎采集与 `run_pipeline.py`，注意**引擎是第 7 个位置参数**（`... <brand_type> <engine>`），漏传会默认标成 chatgpt。

## 工作流

1. **确认输入**：品牌名 / 域名 / 竞对（`Name:domain` 对）/ 品牌类型 / 语言，以及三个引擎目录路径。
   - 默认目录约定：`<outputs>/<brand>_<date>` 是最后一个引擎（通常是 Gemini），其余引擎在 `<brand>_<date>_<engine>`。
2. **补充官方子品牌域名**：用 `web_search` 查品牌官方站，找出 `aboutamazon.com` 这类**不含品牌主域名后缀**的官方子品牌站，加入 `--extra-owned`（避免被误标为第三方）。
3. **跑脚本生成骨架**：
   ```bash
   python3 scripts/build_comparison.py \
     --brand Amazon --domain amazon.com --date 20260821 \
     --outputs data/outputs \
     --competitors "Walmart:walmart.com,Target:target.com,eBay:ebay.com,Temu:temu.com" \
     --category "B2C 电商平台" --lang zh --prompts 30 \
     --engines "chatgpt:amazon_20260821_chatgpt,perplexity:amazon_20260821_perplexity,gemini:amazon_20260821" \
     --extra-owned "aboutamazon.com" \
     --output data/outputs/amazon_20260821_comparison/dashboard_Amazon_3Engine_20260821.html
   ```
4. **补「生态洞察」和「分引擎策略」**：脚本在这两处留了 `<!-- INSIGHTS_PLACEHOLDER -->` 和 `<!-- STRATEGIES_PLACEHOLDER -->` 占位符。基于数据（用 `read` 看三份 `mention_stats.csv` / `summary.csv` / `citation_domains.csv`，或跑 `scripts/extract_engine_data.py` 拿汇总 JSON）写内容，然后 `edit` 替换占位符。
5. **执行 6 项核验清单**（见下）。
6. **交付**：`open` HTML 文件 + 给出路径 + 3-5 条关键发现摘要。

## 生态洞察写法（5 条，每条必须引用本次数据）

洞察不是复述表格，而是**从数据里读出结论**。参考套路：

- 提及率：主品牌三引擎是否无短板 / 谁垫底。
- 引用率：三引擎对官方站的信任度差距（如「24.2% vs 3.5% vs 1.3%，差 18 倍」）。
- 引用总量 vs 唯一域名数：总量高 ≠ 信源集中（如 ChatGPT 512 次集中官方站 vs Perplexity 303 次却 229 域名分散）。
- Top 信源性质：Gemini 最大信源可能是 google.com 自己（Google 生态关联）。
- 竞对语境：某个竞对在某引擎被引特别高（对比类 prompt 的弱点）。

每条用 `<div class="insight"><div class="n">N</div><p><b>标题</b>：结论 + 数据。</p></div>` 结构。

## 分引擎策略写法（每条带成本标签 + 具体数据 + 目标）

每条用 `<div class="rec" style="border-color:引擎色"><span class="cost">🟢/🟡/🔴</span><p><b>标题</b>：...</p></div>` 结构。要求：

- **成本标签**：🟢 1 人日 / 🟡 1 周 / 🔴 1+ 月。
- **引擎针对性**：ChatGPT 认官方站 → 官网结构化加固；Gemini 认 Google 生态 → 可被 Google 收录的内容；Perplexity 认第三方博客 → 行业博客对比文。
- **引用具体数据点 + 目标**：如「sellercentral.amazon.com 已被引 34 次 → 在该页补 FAQ Schema」「walmart.com 在 ChatGPT 被引 50 次 → 在 aboutamazon.com 发官方对比页争夺语境」。
- 符合品牌类型（B2B 不给消费类内容，B2C 不给采购类建议）。

## 强制核验清单（每版必做，缺一不可）

1. **引擎标注**：HTML 三处引擎名正确（ChatGPT / Perplexity / Gemini），无错误残留（误标 chatgpt）。
2. **数字对账**：提及率、引用率与 `mention_stats.csv` / `summary.csv` 一致；Top10 域名表与 `citation_domains.csv` 逐行一致。引用率 = 自家域名引用数 ÷ 总引用数。
3. **「合计」正确**：引用总量 = `citation_domains.csv` 的 `Citation_Count` 列实际和（脚本直接计算，但仍要抽查一次，不能是各品牌官网引用之和）。
4. **域名标注**：品牌自有域名必须标「自家」——含 `aboutamazon.com` 这类官方子品牌站，以及 `sellercentral/business/pay` 等子域；竞对域名标「竞对」。
5. **语言一致**：整份报告语言与用户一致，不混用。
6. **无占位符残留**：除策略区的文章标题模板外，无 `{{}}`、`TODO`、未替换的 `PLACEHOLDER` 注释。

## 设计约定

- **自包含 HTML**：内联 CSS，无 CDN，可离线打开。
- **图表**：CSS 条形图即可，不引入 JS 图表库。
- **引擎配色**：ChatGPT `#10a37f` / Perplexity `#20808d` / Gemini `#1a73e8`（脚本已内置）。
- **输出路径**：`data/outputs/<brand>_<date>_comparison/dashboard_<Brand>_3Engine_<date>.html`。
- 语言与用户一致（zh / en）。

## 脚本参考

| 脚本 | 用途 |
|---|---|
| `scripts/build_comparison.py` | 生成对比报告 HTML 骨架（确定性章节 + 洞察/策略占位符） |
| `scripts/extract_engine_data.py` | 三引擎 CSV 汇总 → JSON（供洞察/策略写作时快速查数据） |
