---
name: dtc-voc-3layer-analysis
description: >
  DTC 母婴品牌三层用户声音（VOC）交叉分析 SOP：
  Layer 1 = Amazon 评论（购买后结构化反馈）；
  Layer 2 = 社交 VOC（Reddit + X，自发讨论，更真实）；
  Layer 3 = DTC 差评（品牌官网 1-3★，痛点最集中）。
  三层交叉验证，输出统一洞察报告 + 竞品对比 + 内容弹药。
  触发场景：「用户怎么说」「痛点挖掘」「VOC 分析」「差评分析」
  「竞品对比」「内容素材」「用户洞察」「社交声音」「选品验证」。
triggers:
  - "用户怎么说"
  - "痛点挖掘"
  - "VOC 分析"
  - "差评分析"
  - "用户洞察"
  - "社交声音"
  - "竞品对比"
  - "内容素材"
  - "voc"
  - "review analysis"
version: 1.0.0
created: 2026-05-25
source_data:
  - Brand_agent/Brand_Data_Lake/ (26,850 条社交 VOC + 1,691 条 DTC 差评 + 442 条 Amazon)
  - SOCIAL_VOC_FINAL_REPORT_2026-05-17.md
  - DTC_LOWSTAR_PHASE2_REPORT_2026-05-18.md
---

# dtc-voc-3layer-analysis

DTC 母婴品牌三层 VOC 交叉分析 SOP。

## 三层结构对比

| 层次 | 数据来源 | 特点 | 偏差 |
|---|---|---|---|
| **L1 Amazon** | `SKU??_*/05_voc.csv` | 购买后，带星级，有结构 | 购买倾向者偏正面；评论被平台审核 |
| **L2 社交** | `voc/social/reddit.csv` + `voc/social/x.csv` | 自发讨论，最真实，含对比/求助/吐槽 | 可能未购买；情绪偏激烈 |
| **L3 DTC** | `voc/dtc/lowstar.csv` | 官网购买后差评，痛点集中，含品牌回复 | 选择性偏差（只有差评）；已购买用户 |

**交叉验证规则**：一个痛点在 ≥2 层出现 → 高可信度；仅在 1 层 → 需保守解读。

---

## Step 0：确定分析目标

在开始前，明确：

```
目标品牌：[单品牌 / 跨品牌对比]
分析目的：[内容创作 / 选品验证 / 竞品对比 / 产品改进机会]
优先关注：[功能痛点 / 情感痛点 / 竞品提及 / 使用场景]
```

---

## Step 1：读取数据文件

### 路径规范（Brand_agent 项目）

```bash
BASE="/Users/lute/project/Agent/Brand_agent/Brand_Data_Lake"
BRAND="Momcozy"  # 替换品牌名

# L1 Amazon（仅老 30 SKU 有）
L1="$BASE/$BRAND/SKU*/05_voc.csv"

# L2 社交 VOC（全 149 SKU 有）
L2_REDDIT="$BASE/$BRAND/*/voc/social/reddit.csv"
L2_X="$BASE/$BRAND/*/voc/social/x.csv"
L2_SUMMARY="$BASE/$BRAND/*/voc/social/summary.json"

# L3 DTC 差评（5 品牌有真实数据）
L3_LOWSTAR="$BASE/$BRAND/*/voc/dtc/lowstar.csv"
L3_SUMMARY="$BASE/$BRAND/*/voc/dtc/summary.json"

# 品牌级社交战情报告
BRAND_REPORT="$BASE/../$BRAND/_voc_social_brand_report.md"
```

### 快速数量检查

```bash
echo "=== VOC 数量检查 ==="
echo "L2 Reddit:" $(wc -l $BASE/$BRAND/*/voc/social/reddit.csv 2>/dev/null | tail -1)
echo "L2 X:" $(wc -l $BASE/$BRAND/*/voc/social/x.csv 2>/dev/null | tail -1)
echo "L3 DTC 差评:" $(wc -l $BASE/$BRAND/*/voc/dtc/lowstar.csv 2>/dev/null | tail -1)
```

---

## Step 2：高频痛点提取

### L2 社交 VOC 分析

```python
import pandas as pd, json
from pathlib import Path

# 读取品牌级 summary（最快）
summary_path = Path(f"Brand_Data_Lake/{brand}/SKU01_*/voc/social/summary.json")
with open(list(summary_path.parent.glob("*/voc/social/summary.json"))[0]) as f:
    summary = json.load(f)

# 关键字段
print("品牌总体情感分布：", summary.get("sentiment_distribution"))
print("Top 5 痛点：", summary.get("pain_points", [])[:5])
print("Top 5 赞点：", summary.get("praise_points", [])[:5])
print("竞品提及：", summary.get("competitor_comparisons", {}).keys())
```

### L3 DTC 差评分析

```python
# 读取 DTC summary
dtc_summary_files = list(Path(f"Brand_Data_Lake/{brand}").glob("*/voc/dtc/summary.json"))
for f in dtc_summary_files[:3]:  # 取前 3 个 SKU 样本
    with open(f) as fp:
        dtc = json.load(fp)
    print(f"\n=== {f.parent.parent.name} ===")
    print("平均星级：", dtc.get("avg_rating"))
    print("差评率：", dtc.get("low_star_rate_pct"), "%")
    print("Top 差评主题：", dtc.get("top_complaint_themes", [])[:3])
    print("品牌回复率：", dtc.get("brand_response_rate_pct"), "%")
```

---

## Step 3：三层交叉验证矩阵

输出格式：

```markdown
## [品牌名] VOC 三层交叉洞察

### 高置信痛点（≥2 层确认）

| 痛点 | L1 Amazon | L2 社交 | L3 DTC | 置信度 | 内容机会 |
|---|---|---|---|---|---|
| [痛点1] | ✅/❌ | ✅/❌ | ✅/❌ | 高/中 | [简述] |

### 单层信号（需谨慎）

| 痛点 | 来源层 | 频率 | 是否值得跟进 |
|---|---|---|---|

### 品牌护城河（≥2 层确认的赞点）

| 赞点 | L1 | L2 | L3 | 可转化为文案 |
|---|---|---|---|---|
```

---

## Step 4：竞品对比分析（可选）

```python
# 从 summary.json 提取竞品提及
for brand in ["Momcozy", "Elvie", "Spectra", "Medela"]:
    summary_files = list(Path(f"Brand_Data_Lake/{brand}").glob("*/voc/social/summary.json"))
    if summary_files:
        with open(summary_files[0]) as f:
            data = json.load(f)
        competitors = data.get("competitor_comparisons", {})
        print(f"\n{brand} 提及竞品：", list(competitors.keys())[:5])
```

### 跨品牌痛点热图

| 痛点 | Momcozy | Elvie | Spectra | Medela | Haakaa |
|---|---|---|---|---|---|
| 漏奶/密封问题 | | | | | |
| 噪音 | | | | | |
| 续航/充电 | | | | | |
| 清洁难度 | | | | | |
| APP 连接问题 | | | | | |

（根据各品牌 VOC 数据填写频次：🔴高频 / 🟡中频 / ⚪低频 / — 无数据）

---

## Step 5：内容弹药生成

基于三层 VOC 结果，输出可直接用于内容创作的素材：

```markdown
## 内容弹药库

### 痛点共鸣 Hook（社交帖子开头用）
基于 L2 社交真实吐槽，改写为品牌语调：
- "[高频痛点描述的共鸣句子]"

### 竞品对比话题（不攻击，引导比较）
- 基于 L2 竞品提及，用问题式引导：
  "You've been asking us how [Brand X] compares to [Brand Y]..."

### 差评转化素材（L3 差评 → 功能说明）
- 将 Top 差评主题转化为「我们听到了」类内容
- 格式："We heard you: [痛点]. That's why [产品特性]."

### 赞点放大（L1+L2+L3 共同赞点）
- 用真实用语引用（注意不能假冒用户，要加 "Our community says"）
```

---

## Step 6：交叉分析报告输出

```markdown
# [品牌名] VOC 三层交叉分析报告
**分析日期**：[YYYY-MM-DD]
**数据时效**：L1 Amazon [日期] | L2 社交 [日期] | L3 DTC [日期]

## 执行摘要
[3-5 句核心洞察]

## 三层数据概览
| 层次 | 数据量 | 情感分布 | 主要来源 |
|---|---|---|---|
| L1 Amazon | XX 条 | 正/负/中 | Amazon |
| L2 社交 | XX 条 | 正/负/中 | Reddit/X |
| L3 DTC | XX 条 | 差评为主 | 官网 |

## 高置信痛点（TOP 5）
[三层交叉矩阵]

## 竞品声音分析
[竞品提及汇总]

## 内容机会
[可操作的内容素材和角度]

## 选品/产品建议
[基于 VOC 的产品改进方向]
```

---

## 快速查询速查表

| 用户问题 | 应读文件 | 关键字段 |
|---|---|---|
| "用户对 Z 怎么说" | `Z/voc/social/summary.json` | `sentiment_distribution`, `pain_points` |
| "Z 的真实差评" | `Z/voc/dtc/lowstar.csv` + `Z/voc/dtc/summary.json` | `top_complaint_themes` |
| "Z 在社交媒体的声音" | `Z/voc/social/reddit.csv` + `Z/voc/social/x.csv` | 全量 |
| "Z vs 竞品" | `Z/voc/social/summary.json` | `competitor_comparisons` |
| "Z 的月度声量趋势" | `Z/voc/social/summary.json` | `timeline_monthly` |
| "品牌回复差评吗" | `Z/voc/dtc/summary.json` | `brand_response_rate_pct` |
| "[品牌]全品牌社交战情" | `[Brand]/_voc_social_brand_report.md` | 全文 |

---

## 注意事项

1. **Amazon L1 仅老 30 SKU 有数据**（Spectra/Baby_Brezza/Lansinoh/Haakaa/Momcozy 部分 SKU）
2. **DTC L3 仅 5 品牌有真实数据**（Haakaa 21条 / Momcozy 101条 / Tommee_Tippee 960条 / Elvie 590条 / Mommed 19条）
3. **Medela/Frida/Baby_Brezza 没有 DTC 差评数据**（无 review widget 可抓）
4. 数据时效：社交 VOC 2026-05-17，DTC 差评 2026-05-18
5. 引用 VOC 时不得暴露用户 email/order_id（已脱敏）
