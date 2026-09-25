---
name: "p2s-traffic-source-analysis"
title: "电商流量来源全维度分析 - 设备/浏览器/来源的转化率诊断"
description: "触发词：流量来源分析、渠道质量分、桑基图、设备浏览器维度、无效渠道、转化诊断。何时不用：跨渠道预算如何重分配用多触点归因那张卡；要诊断站内流量来源质量、给每个来源打质量分时用本卡。安全边界：会话级数据须去标识化处理，遵守平台与隐私政策，不得将会话数据用于个体追踪。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 渠道经营分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Traffic-Source-Analysis"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "给每个流量来源打上质量分，一眼看出哪个渠道的钱花得值、哪些该砍。"
user_try: "试试：这是我的独立站会话数据，帮我按来源、设备、浏览器做交叉诊断，输出各渠道质量分和带质量配色的桑基图。"
whenToUse: "与「搜索位置点击弹性」相比：广告位与关键词层级走那张卡；要评价 Google、Facebook、TikTok、Direct 等来源的整体质量与漏斗表现时用本卡。"
workflow: "标准化会话级来源字段（来源、设备、浏览器） → 按来源×设备×浏览器×漏斗做四维交叉分析 → 计算含 CVR、跳出率、停留时长的流量质量综合分 → 用 Z 分数标记异常来源并输出桑基图 JSON"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 电商流量来源全维度分析 - 设备/浏览器/来源的转化率诊断

## ① 解决的问题

投放经理面临流量来源说不清——流量分析将无效渠道占比从30%降到12%，年化省20万元

## ② 核心算法逻辑

论文对电商平台进行全维度交叉分析，系统回答一个核心问题：同样的流量，为何不同渠道/设备/浏览器的转化率差异如此悬殊？

## ③ 业务应用场景

业务问题：母婴独立站每天有来自 Google Ads / Facebook / TikTok / Direct / Referral 的流量。桑基图展示各来源→落地页→结账的流量流转，但每个来源分支只有流量数，没有质量分。需要为每个来源节点标注"流量质量综合分"，让运营一眼看出哪个渠道的钱花得值。
| 字段 | 类型 | 示例 | |------|------|------| | `session_id` | string | `"sess_20260101_u001"` | | `traffic_source` | string | `"google_cpc"/"facebook_paid"/"tiktok_paid"/"direct"/"referral"/"email"/"organic"` | | `device_type` | string | `"mobile"/"desktop"/"tablet"` | | `browser` | string | `"chrome"/"s
预期产出：流量来源质量分层表 + 桑基图 JSON 增强版

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（541 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/user_analytics/traffic_source_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Traffic-Source-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Traffic Source Analysis — 电商流量来源全维度转化诊断
arXiv:2403.16115 "From Clicks to Conversions"

功能：
  1. 数据清洗与来源标准化
  2. 设备/浏览器/来源/漏斗四维交叉分析
  3. 流量质量综合评分（CVR + ExitRate + AvgDuration）
  4. 异常来源检测（Z-score）
  5. 移动端 vs 桌面端对比诊断
  6. 输出桑基图 JSON（含质量分着色）

依赖: pip install pandas numpy scipy
"""

import json
import warnings
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from scipy import stats

warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────
# 1. 流量来源标准分类
# ─────────────────────────────────────────────

SOURCE_CATEGORIES = {
    # Paid
    "google_cpc": "paid_search",
    "google_shopping": "paid_search",
    "bing_cpc": "paid_search",
    "facebook_paid": "paid_social",
    "instagram_paid": "paid_social",
    "tiktok_paid": "paid_social",
    "pinterest_paid": "paid_social",
    # Organic
    "google_organic": "organic_search",
    "bing_organic": "organic_search",
    # Social Organic
    "facebook_organic": "organic_social",
    "instagram_organic": "organic_social",
    "tiktok_organic": "organic_social",
    "pinterest_organic": "organic_social",
    # Direct
    "direct": "direct",
    # Email
    "email": "email",
    "klaviyo": "email",
    # Referral / Affiliate
    "referral": "referral",
    "affiliate": "affiliate",
    "blog_referral": "referral",
}

DEVICE_CATEGORIES = {"mobile", "tablet", "desktop"}
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2403.16115。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：会话级埋点数据：session_id、traffic_source（google_cpc、facebook_paid、tiktok_paid、direct、referral、email、organic 等）、device_type、browser 与漏斗步骤事件。

**输出**：流量来源质量分层表、渠道质量综合分与异常来源清单，以及带质量分着色的桑基图 JSON（各来源→落地页→结账流转），供投放经理与运营看板使用。

## 执行步骤

1. 清洗会话数据并把来源归入标准分类。
2. 交叉分析来源、设备、浏览器与漏斗步骤。
3. 用 CVR、跳出率、平均停留时长计算流量质量综合分。
4. 用 Z 分数检测异常来源并复核埋点质量问题。
5. 输出质量分层表与桑基图 JSON，给出加投或砍量建议。

## 边界与不做

- 何时不用：埋点缺失导致来源字段大面积为空、或会话无法关联漏斗步骤时不要用；只看单渠道内部效率不必做全维度交叉。
- 能力边界：产出诊断与看板数据，不自动改预算；无效渠道占比 30%→12%、年化省 20 万元为卡页案例值。
- 安全边界：会话数据须去标识化，不得用于个体追踪或对外共享。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-NonItem-Page-Path-Modeling.html、Skill-NonItem-Page-Path-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-STAMImputer-SpatioTemporal.html、Skill-STAMImputer-SpatioTemporal、Skill-Sparse-Matrix-Completion.html、Skill-Sparse-Matrix-Completion、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-NonItem-Page-Path-Modeling.html、Skill-NonItem-Page-Path-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-STAMImputer-SpatioTemporal.html、Skill-STAMImputer-SpatioTemporal、Skill-Sparse-Matrix-Completion.html、Skill-Sparse-Matrix-Completion
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-STAMImputer-SpatioTemporal.html、Skill-STAMImputer-SpatioTemporal、Skill-Sparse-Matrix-Completion.html、Skill-Sparse-Matrix-Completion、Skill-Traffic-Source-Analysis

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：14-用户分析　·　源卡：`Skill-Traffic-Source-Analysis`