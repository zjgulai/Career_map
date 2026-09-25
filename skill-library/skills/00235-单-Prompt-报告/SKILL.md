---
name: geo-report-builder
displayName: Single Prompt Report Builder
displayDescription: Generate HTML report for one prompt analyzed in depth
version: 1.55.0
description: GEO Report Builder — Render single-prompt deep analysis CSV data into a structured 8-section HTML report. Pipeline skill：consumes the output directory of geo-analyzer's single_query_analyzer.py and produces a self-contained HTML deliverable (inline CSS, no CDN, works offline). Companion script: scripts/single_query_report.py. Trigger phrases: generate report, analysis report, HTML report, single prompt report, deep analysis report, 生成报告、HTML 报告、单 Prompt 报告、精细化报告。
---

# Skill: GEO Report Builder（单 Prompt 报告）

把「同一条 Prompt 重复采集 N 次」的深度分析结果，渲染成一份自包含的 8 段 HTML 报告。

## ⚠️ 职责边界（不要走错技能）

| 场景 | 用哪个技能 | 脚本 |
|---|---|---|
| **单条 Prompt** 重复采集 N 次的深度分析 | **本技能** | `scripts/single_query_report.py` |
| **多条 Prompt**（默认 30 条）的批量监测报告 | `geo-dashboard-builder` | `run_pipeline.py` / `dashboard_builder.py` |
| 多引擎（ChatGPT/Gemini/Perplexity）横向对比 | `geo-multi-engine-comparison` | `build_comparison.py` |

> 本技能**不含**批量报告能力。批量链路统一走 `geo-dashboard-builder`，不要在本目录寻找 `dashboard_builder.py` 或 `run_pipeline.py`。

## Pipeline

`geo-query-builder (single_query_runner)` → `geo-analyzer (single_query_analyzer)` → **geo-report-builder**

## When to Use

对同一条 Prompt 重复采集 N 次（默认 10 次）并跑完 `single_query_analyzer.py` 之后，用本技能把 CSV 渲染成可交付的 HTML 报告。

## Inputs Required

来自 `single_query_analyzer.py` 的输出目录：

| 文件 | 字段 | 用途 |
|---|---|---|
| `mention_rate.csv` | Brand, Mentioned_Count, Total, Mention_Rate | ② 提及率 / ⑦ 竞对对比 |
| `domain_dist.csv` | Domain, Count, Sample_URLs | ③ 引用率 / ④ 引用域名 |
| `answer_consistency.csv` | Brand_Combo, Count, Pct | ⑥ 答案一致性 |
| `summary.txt` | 生成时间 / 原始文件 / 有效回答数 | ① 配置摘要 |
| 原始采集 JSON（可选） | answerText / answer_text | ⑤ 回答长度统计 |

> 未传 `--raw` 时，⑤ 回答长度段会显示「未提供原始数据」占位说明，其余 7 段正常输出。

## Run

```bash
python3 scripts/single_query_report.py <analysis_dir> <output_html> \
  --query "<被分析的 Prompt 原文>" \
  --brand <主品牌> \
  --brand-domain <主品牌官网域名> \
  --lang zh \
  --raw <原始采集 JSON 路径>
```

实例：

```bash
python3 scripts/single_query_report.py \
  data/outputs/single_tripo_prototyping_20260824 \
  data/outputs/single_tripo_prototyping_20260824/report_Tripo_20260824.html \
  --query "产品设计师做快速原型，有哪些好用的 AI 3D 生成工具？" \
  --brand Tripo --brand-domain tripo3d.ai --lang zh \
  --raw data/raw/single_custom_query_20260824_sd_xxx.json
```

参数说明：

| 参数 | 必填 | 说明 |
|---|---|---|
| `analysis_dir` | ✅ | `single_query_analyzer.py` 的输出目录 |
| `output_html` | ✅ | 输出 HTML 路径（父目录自动创建） |
| `--query` | 推荐 | Prompt 原文，显示在报告头部 |
| `--brand` | 推荐 | 主品牌名；缺省取 `mention_rate.csv` 第一行 |
| `--brand-domain` | 推荐 | 主品牌官网域名；**不传则引用率无法计算**，③ 段显示提示 |
| `--lang` | 否 | `zh`（默认）/ `en`，全报告语言一致 |
| `--raw` | 否 | 原始采集 JSON，仅用于 ⑤ 回答长度统计 |

## Report Sections（8 段）

1. **Prompt 配置** —— Prompt 原文、主品牌、有效回答数、采集时间
2. **品牌提及率** —— 各品牌提及次数 + 占比表 + 条形图（自家/竞对标签）
3. **引用率概览** —— 官网域名被引次数 ÷ 有效回答数
4. **高频引用域名** —— Top 20 域名 + 引用次数 + 示例 URL（自家域名标注）
5. **回答长度分布** —— 最短 / 最长 / 平均 / 中位数字符数
6. **答案一致性** —— 品牌组合频率表 + 条形图
7. **竞对提及对比** —— 主品牌 vs 竞对的领先/落后判定
8. **行动建议** —— 依据本次提及率、引用率、组合集中度自动生成，带 🟢🟡🔴 成本标签

## 交付前核验（必做）

1. **数字对账**：报告中的提及率、引用次数、组合占比与 3 个 CSV 完全一致。
2. **域名标注**：主品牌官网（含子域）标「自家」，竞对标「竞对」。
3. **语言一致**：`--lang` 指定的语言贯穿全文，无中英混排。
4. **无占位符残留**：无 `[Brand]`、`{{}}`、`TODO`。
5. **自包含**：内联 CSS、无 CDN 依赖，断网可正常打开。

## Output

约定路径：`data/outputs/single_<topic>_<date>/report_<Brand>_<date>.html`

自包含单文件 HTML，可直接 `open` 或转发。
