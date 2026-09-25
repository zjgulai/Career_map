---
name: seo-full-audit
description: 对客户网站进行完整的 SEO 诊断，包含技术 SEO 审计和内容质量评估。每次诊断独立运行（清空历史中间产物，不携带任何前次记忆），实时显示进度并一次性产出 4 份交付物：URL 清单 Excel、技术 SEO 诊断报告 PDF、内容质量诊断报告 PDF、《SEO 全站诊断服务使用说明》PDF。当用户需要做 SEO 诊断、网站审计、SEO 检查、网站健康检查时使用此技能。
version: 1.55.0
---

# SEO 全链路诊断技能 v4.7

## 技能概述

对客户的网站做一次"全面体检"，**每次任务一次性思考、一次性执行、实时显示进度**，最终输出固定的 **4 份文件**：

1. **URL 清单（Excel）** —— 参与本次诊断的全量页面链接，逐行列出每个 URL 以及该 URL 参与的技术 SEO 诊断维度（命中 / 未命中状态），是报告中所有结论的原始事实底稿。
2. **技术 SEO 诊断报告（PDF）** —— 50 维度技术检查（链接、标签、速度、结构化数据等），按 P0 / P1 / P2 优先级排序，含案例 URL 与修复建议。
3. **内容质量诊断报告（PDF）** —— 按 7 维度逐篇打分（话题相关性、结构、数据论据、深度、GEO 适配、视觉、文案）。
4. **《SEO 全站诊断服务使用说明》（PDF）** —— 解释本次服务流程、4 份交付物的含义、报告阅读方法。每次诊断都随报告一起输出，并且**内容必须与本次实际选项保持一致**（爬虫范围、UA 选择、是否做内容评估、输出语种等）。

> **维度保持不变**：技术 SEO 仍然是原来的 50 个检测维度，内容质量仍然是原来的 7 个评分维度。本次升级只调整爬取规模、爬虫种类、输出文件清单、运行规范与多语言能力。

---

## 🛡️ 三条硬约束（必须严格遵守，违反即视为执行失败）

### 约束 1：每次诊断必须是"零记忆"的独立运行

**绝对禁止**前次诊断的任何中间产物、缓存、统计结论被本次诊断复用或混入。

- 进入 Phase 2 之前，**必须**先清空当前工作目录下的以下文件（如果存在）：
  - `crawl_result.xlsx`、`gsc_data.csv`、`sampled_pages.json`、`sampled_pages_full.json`
  - `issue_analysis.json`、`url_inventory.xlsx`
  - `tech_seo_report.pdf`、`content_report.pdf`、`seo_audit_user_guide.pdf`
  - `assets/__pycache__/`（Python 字节码缓存）
- 上下文中不得引用"上次的健康分 / 上次的问题数 / 上次的样本页"。每个数字必须来自本次刚跑出来的 `crawl_result.xlsx` 或 `sampled_pages.json`。
- 即使用户的网站和上次完全相同，也必须重新爬取、重新打分、重新生成所有 4 份文件。

参考清理代码：

```bash
WORKDIR="{工作目录}"
ASSETS_DIR="{技能 assets 目录}"
rm -f "$WORKDIR"/crawl_result.xlsx "$WORKDIR"/gsc_data.csv \
      "$WORKDIR"/sampled_pages.json "$WORKDIR"/sampled_pages_full.json \
      "$WORKDIR"/issue_analysis.json "$WORKDIR"/url_inventory.xlsx \
      "$WORKDIR"/tech_seo_report.pdf "$WORKDIR"/content_report.pdf \
      "$WORKDIR"/seo_audit_user_guide.pdf
rm -rf "$ASSETS_DIR"/__pycache__
```

### 约束 2：必须一次性思考、一次性执行、实时显示进度

- **禁止**对客户说"我先在后台跑，等会儿把报告发给你"、"稍后再发"、"我离开一下再回来"、"任务已提交"等任何把交付推到下一轮对话的措辞。
- 同一轮对话内必须按顺序完成：清理 → 爬取 → 内容评估 → 报告生成 → 文件呈现。
- 每个阶段开始时必须**实时**用一句话告诉用户当前正在做什么（例如："正在爬取第 X 页……"、"正在生成技术 SEO 报告 PDF……"）。**不要**只在最后一次性地发一段总结。
- 即便单次爬取时间较长，也必须在本轮对话内同步等待完成，再继续下一步；中途不得让用户等待跨会话。
- **不要向用户给出预估耗时**（不说"约 X 分钟"、"预计 X 分钟"）。

### 约束 3：输出语种 = 用户输入语种

按用户输入的语种自动决定 **4 份交付物**（包括 URL 清单 Excel 表头、两份 PDF 报告正文、《使用说明》PDF）的语种，由 Agent 在生成阶段自行翻译。判定规则：

| 用户消息语种 | 输出语种 | 备注 |
|---|---|---|
| 中文（zh） | 简体中文 | 默认 |
| 英文（en） | English | |
| 西班牙文 / 日文 / 韩文 / 德文 / 法文等 | 对应语种 | 由 Agent 翻译 |
| 多语种或不明确 | 与本轮对话主体一致 | 若仍不能判定 → 默认中文 |

**翻译要求**：
- PDF 报告中的所有用户可见文本（标题、章节名、问题名、修复建议、表头、维度名称、优先级标签等）一律翻译。
- URL 清单 Excel 的表头与"维度命中"列名一律翻译；URL 本身、状态码数字保持原样。
- 《使用说明》PDF 的所有正文、FAQ、流程步骤一律翻译，并且与本次实际选项一致（例如：本次爬虫 UA 只列出"Googlebot PC / Googlebot Mobile"两项，规模档位写 10 / 20 / 50）。
- 翻译必须自然、可读，不允许半中半英、不允许直接保留中文占位。

---

## 前置依赖

### 路径约定

本技能的资产文件位于本 SKILL.md 同级的 `assets/` 目录下。在执行命令时，请使用相对于技能目录的路径，或在运行时动态解析完整路径。

### 依赖清单

- `seo_crawler.py`（技术 SEO 爬虫，位于 `assets/seo_crawler.py`）
- Python 库：`curl_cffi`, `beautifulsoup4`, `pandas`, `openpyxl`, `reportlab`（见 `assets/requirements.txt`）
- **可选技能**：`bigquery-data-query`（GSC 数据查询，仅在用户选择 BigQuery 路径时需要）
- **内置资产**（位于 `assets/`）：
  - `generate_tech_seo_report_v2.py` — 技术 SEO 报告生成器
  - `generate_content_report_v2.py` — 内容质量报告生成器
  - `generate_user_guide_pdf.py` — 使用说明 PDF 生成器（每次重新生成，确保与本次选项一致）
  - `reporter.py` — 报告编排器（统一生成 4 份交付物）
  - `content-quality-standard/AI-Content-Quality-Standard.md` — 内容质量评估标准（v3.1）
  - `content-quality-standard/AI-Content-Quality-Case-Library.md` — 内容质量案例库

---

## Phase 1：信息收集（用 AskUserQuestion 交互）

每次诊断都重新询问（不要假设用户上次填过什么）。

### 必须收集的信息

| # | 信息 | 默认值 |
|---|------|--------|
| 1 | 网站 URL 范围 | 用户提供 |
| 2 | 爬虫类型（UA） | Google 爬虫（PC 端） |
| 3 | GSC 数据 | 否 |
| 4 | 爬取规模 | 20 页 |
| 5 | 内容评估 | 是 |

### AskUserQuestion 详细设计

**问题 1：网站 URL 范围**
```
标题: "网站地址"
问题: "请提供要诊断的网站地址，或由技能自动爬取发现"
选项:
  - "我来提供网站 URL" → 用户输入具体 URL（如 https://www.example.com）
  - "由技能自动发现（限 50 页以内）" → 技能从起始 URL 开始 BFS 爬取，自动发现站内页面，上限 50 页
```

**问题 2：爬虫类型（User-Agent）—— 仅 2 个选项**
```
标题: "爬虫类型"
问题: "请选择模拟的搜索引擎爬虫"
选项:
  - "Google 爬虫（PC 端）" → 使用 Googlebot Desktop UA（推荐）
  - "Google 爬虫（移动端）" → 使用 Googlebot Mobile UA
```

> **重要**：本版本只允许在 Googlebot PC 与 Googlebot Mobile 之间二选一。不再提供 ChatGPT / Claude / 百度 / Yahoo / 多 UA 对比 / 自动选择等选项。

**问题 3：GSC 数据连接**
```
标题: "GSC 数据"
问题: "是否连接 Google Search Console 数据？（可以让报告更详细）"
选项:
  - "有 GSC 账号，可以导出数据" → 继续问 BigQuery 还是 CSV
  - "不确定" → 解释什么是 GSC，建议用户注册
  - "没有" → 跳过 GSC 数据
```

**问题 4：爬取规模 —— 仅 3 个档位**
```
标题: "分析范围"
问题: "希望分析多少页面？"
选项:
  - "10 页（快速预览）"
  - "20 页（推荐）"
  - "50 页（深度分析）"
```

> **重要**：本版本只允许 10 / 20 / 50 三个档位。不再提供 100 / 200 / 500。

**问题 5：内容评估**
```
标题: "内容评估"
问题: "是否同时评估页面内容质量？（7 维度打分 + 逐篇诊断）"
选项:
  - "是（推荐）" → 同时生成内容质量诊断报告 PDF
  - "否，只看技术 SEO" → 内容质量诊断报告 PDF 仅做空壳/跳过
```

### 信息收集完成后的确认

收集完所有信息后，向用户**简短**确认（不要给出耗时预估）：

> "即将开始诊断：
> - 网站：{URL 或 '自动发现（限 50 页）'}
> - 爬虫：{Googlebot PC 或 Googlebot Mobile}
> - GSC 数据：{有/无}
> - 分析范围：{10/20/50} 页
> - 内容评估：{是/否}
> - 输出语种：{根据用户输入语种判定}
>
> 现在开始执行，过程中会实时同步进度。"

---

## Phase 2：清理 + 运行技术 SEO 爬虫（实时进度）

### 步骤 0：执行约束 1 的清理

在跑爬虫之前**必须**先执行清理命令（见上文「约束 1」），并明确告知用户：

> "已清空上一次诊断的中间数据，本次将完全重新爬取与分析。"

### 步骤 1：UA 参数映射（只有两行）

| 用户选择 | --ua 参数值 |
|----------|------------|
| Google 爬虫（PC 端） | `googlebot` |
| Google 爬虫（移动端） | `googlebot-mobile` |

### 步骤 2：URL 和页面数

| 用户选择 | --url 和 --max-pages |
|----------|---------------------|
| 用户提供 URL | `--url {用户URL}` + `--max-pages {10/20/50}` |
| 技能自动发现 | `--url {用户域名}` + `--max-pages 50`（上限） |

### 步骤 3：构建并实时运行爬虫

```bash
python assets/seo_crawler.py \
    --url {用户提供的URL或域名} \
    --ua {googlebot 或 googlebot-mobile} \
    --max-pages {10 / 20 / 50} \
    --max-depth 3 \
    --no-robots \
    --no-verify \
    --output {工作目录}/crawl_result.xlsx
```

如果用户有 GSC 数据，追加 `--gsc-data {工作目录}/gsc_data.csv`。

### 步骤 4：实时进度反馈

- 开始时："正在爬取您的网站，目标 X 页，使用 {Googlebot PC / Googlebot Mobile}……"
- 过程中：若爬虫支持流式日志，每完成约 25% 同步一次进度；若不支持，至少在爬虫返回后立刻报告："爬取完成，共分析 X 个页面，发现 Y 条潜在问题，开始生成报告……"
- **不要**对用户说"我先后台跑，稍后再发"。

### 步骤 5：爬取失败处理

爬虫运行完成后，**必须检查** `crawl_result.xlsx` 中是否包含有效的 `All Pages` sheet 且行数 > 0。判定逻辑：

```python
import pandas as pd
xls = pd.ExcelFile('{工作目录}/crawl_result.xlsx')
sheets = xls.sheet_names
has_data = 'All Pages' in sheets and len(pd.read_excel(xls, 'All Pages')) > 0
```

- **如果 `has_data == True`**：正常继续后续流程。
- **如果 `has_data == False`**（爬取全部失败或无有效页面）：**不得**自动继续生成报告。必须用 AskUserQuestion 向用户说明情况并询问：

```
标题: "爬取失败"
问题: "网站 {URL} 爬取未能成功获取有效页面数据。可能的原因包括：网站对爬虫做了访问限制（如 Cloudflare 防护、反爬策略）、网站本身无法访问、或页面返回了错误状态码。请选择下一步操作："
选项:
  - "换一个网站 URL 重新爬取" → 回到 Phase 1 重新收集 URL
  - "仍然继续生成报告（基于已有数据）" → 继续后续流程，但报告中数据可能不完整
  - "终止本次诊断" → 停止执行，不生成报告
```

---

## Phase 3：内容质量评估（如用户选了"是"）

### 页面采样

```python
sampled = df[df['word_count'] > 300].sort_values('word_count', ascending=False)
sampled = sampled.groupby('page_type').head(5).drop_duplicates('url').head(15)
```

### 7 维度评分（保持不变）

- D1: 话题相关性 (15%)
- D2: 结构清晰度 (15%)
- D3: 数据与论据 (15%)
- D4: 内容深度 (15%)
- D5: GEO 适配 (10%)
- D6: 视觉丰富度 (15%)
- D7: 文案质量 (15%)

将采样数据保存为 `sampled_pages.json`。

---

## Phase 4：一次性生成 4 份交付物

使用 `assets/reporter.py` 统一编排：

```bash
python assets/reporter.py {工作目录} --lang {zh|en|...}
```

reporter.py 会**严格输出且只输出** 4 份文件：

| # | 文件 | 内容 |
|---|------|------|
| 1 | `url_inventory.xlsx` | 全量参诊 URL + 每个 URL 命中的诊断维度（命中=1 / 未命中=0），表头按输出语种翻译 |
| 2 | `tech_seo_report.pdf` | 50 维度技术 SEO 报告，按 P0/P1/P2 排序，含案例 URL 与修复建议 |
| 3 | `content_report.pdf` | 7 维度内容质量报告，逐篇评分 + 改进建议（若用户跳过内容评估，则此文件可不生成或生成空壳） |
| 4 | `seo_audit_user_guide.pdf` | 《SEO 全站诊断服务使用说明》。**每次都重新生成**，内容必须反映本次实际选项（爬虫=2 选 1、规模=10/20/50、4 份交付物清单），并按输出语种翻译 |

> **关键**：本版本**不再**输出 DOCX、不再输出额外的报告副本。如果遇到 `*.docx` 残留，必须删除。

### URL 清单 Excel 的列规范

至少包含以下列（实际命名按输出语种翻译）：

- 必填基础列：URL、最终 URL、状态码、页面类型、标题、标题长度、Meta Description、字数、H1 数量、内部链接数、外部链接数、图片总数、缺失 Alt 图片数、Canonical、Canonical 自指、Robots Meta、JSON-LD 数、响应耗时(s)、页面大小(KB)、html lang、viewport
- **维度命中列（新）**：把技术 SEO 50 维度逐一作为列（命名采用维度英文短名以保持稳定，可在表头加一行翻译标签），值为 1 / 0，代表该 URL 是否命中该维度的问题
- 衍生列：issue_count（本页命中维度数）、main_issues（前 3 个最严重问题）

---

## Phase 5：交付（同一轮对话内完成）

1. 用 `present_files` **一次性**呈现 4 份文件：
   - `url_inventory.xlsx`
   - `tech_seo_report.pdf`
   - `content_report.pdf`
   - `seo_audit_user_guide.pdf`

2. 用输出语种给一段简洁总结（示例为中文，其它语种翻译）：

   > "诊断完成！本次共爬取 X 个页面，发现 Y 项技术问题（🔴P0 N 项 / 🟡P1 M 项 / 🟢P2 K 项），内容质量平均分 W/100。
   > 已交付 4 份文件：
   > 1. URL 清单（Excel）—— 全部 X 个页面 × 50 个诊断维度的命中表
   > 2. 技术 SEO 诊断报告（PDF）
   > 3. 内容质量诊断报告（PDF）
   > 4. 《SEO 全站诊断服务使用说明》（PDF）"

3. **禁止**说"如有需要我再补充"、"我之后再生成"这类话。本轮交付已完整。

---

## 关键注意事项

- **零记忆诊断**：每次执行必须重新清理、重新爬取、重新评估、重新生成；不得复用上次的任何中间产物或结论。
- **不预估耗时**：不要给用户"约 X 分钟"这种估计语。
- **实时进度**：每个阶段都要同步当前正在做什么。
- **一次性思考一次性执行**：禁止把任务推到下一轮对话。
- **输出语种 = 用户输入语种**：4 份交付物全部翻译，使用说明 PDF 的选项描述必须匹配本次实际选项。
- **HTML 转义**：reportlab Paragraph 中所有用户文本必须用 `html.escape()` 转义。
- **GSC 数据隔离**：alibaba.com 的 GSC 数据绝不能出现在客户报告中；所有面向客户的文档必须引导客户连接自己的 GSC 账户。
