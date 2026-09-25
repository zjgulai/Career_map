---
name: "p2s-trajectory-pattern-mining"
title: "用户行为轨迹模式挖掘与预测 - 变阶马尔可夫模型"
description: "触发词：用户轨迹挖掘、页面路径桑基图、页面转移概率、下一步页面预测、典型轨迹聚类、频繁子序列。何时不用：只想知道漏斗各步转化率与流失人数用「User-Funnel-Analysis」；只在搜索链路上拆归因用「Search-Funnel-Attribution」；本技能只做路径聚类、频繁子轨迹与变阶马尔可夫预测。安全边界：会话与用户标识须脱敏后再建模，输出仅用于站点体验诊断，不得用于识别或画像具体个人。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-Trajectory-Pattern-Mining"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把用户会话还原成页面路径，聚类出典型轨迹、挖出高频路径并预测下一步页面，直接渲染成桑基图看流量宽度。"
user_try: "试试：这是我们母婴站的会话点击流（session_id、user_id、page_type、page_name、停留秒数、事件时间），帮我聚类典型路径、挖高频子轨迹，并输出可渲染的桑基图数据和下一步页面预测。"
whenToUse: "有会话级点击流明细、要还原页面路径并生成桑基图或预测下一步页面时用本技能；只要各步转化率与流失数用「User-Funnel-Analysis」，要恢复观测稀疏的页面转移矩阵用「Sparse-Matrix-Completion」。"
workflow: "清洗会话：过滤停留时间异常与超长 session，合并重复子序列 → 把 page_name 映射为标准页面类型（HOME/SEARCH/CAT/PDP/CART/ORDER/PAY 等） → 用 LCS 相似度做改进 DBSCAN 聚类，识别典型轨迹模式 → 按支持度阈值挖频繁子轨迹，构建变阶马尔可夫转移概率矩阵 → 输出带停留时间权重的下一步页面预测与 Plotly/ECharts 桑基图 JSON"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 用户行为轨迹模式挖掘与预测 - 变阶马尔可夫模型

## ① 解决的问题

母婴电商需要桑基图展示用户从首页→搜索→PDP→加购→支付的流量宽度

## ② 核心算法逻辑

三步法闭环：① 改进 DBSCAN 密度聚类识别典型轨迹模式（用 LCS 相似度替代欧氏距离）；② 频繁子轨迹挖掘（FPTree 变体，支持度阈值筛选高频页面序列）；③ 变阶马尔可夫模型（VariableOrder Markov, VOM）预测下一步页面。

## ③ 业务应用场景

业务问题：母婴电商需要桑基图展示用户从首页→搜索→PDP→加购→支付的流量宽度。当前只知道每页 PV，不知道页面间的转移概率，无法渲染 Sankey。
| 字段 | 类型 | 示例 | |------|------|------| | `session_id` | string | `"sess_20250101_u001"` | | `user_id` | string | `"u001"` | | `page_type` | string | `"HOME"/"SEARCH"/"CAT"/"PDP"/"CART"/"ORDER"/"PAY"` | | `page_name` | string | `"/product/12345"` | | `dwell_time_sec` | int | `45`（秒） | | `event_time`
| 缩写 | 页面类型 | 说明 | |------|---------|------| | `HOME` | 首页 | 品牌官网/平台首页 | | `SEARCH` | 搜索结果页 | 关键词搜索 | | `CAT` | 品类页 | 奶粉/纸尿裤等类目 | | `PDP` | 商品详情页 | Product Detail Page | | `CART` | 购物车 | | | `ORDER` | 订单确认页 | | | `PAY` | 支付页 | | | `REVIEW` | 评论页 | | | `PROMOTION` | 促销活动页 | |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5000 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（784 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：8」并记录位置 `paper2skills-code/user_analytics/trajectory_pattern_mining` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Trajectory-Pattern-Mining.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Trajectory Pattern Mining & Variable-Order Markov Prediction
轨迹模式挖掘与变阶马尔可夫预测

功能：
  1. 数据预处理（session 清洗、页面类型映射）
  2. LCS-based 轨迹相似度计算
  3. 改进 DBSCAN 聚类（r-neighborhood）
  4. 频繁子轨迹挖掘
  5. 变阶马尔可夫转移概率矩阵构建
  6. 下一步页面预测（带停留时间权重）
  7. 输出 Plotly/ECharts 桑基图 JSON

依赖: pip install numpy pandas scikit-learn
"""

import json
import math
from collections import defaultdict, Counter
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


# ─────────────────────────────────────────────
# 1. 数据结构定义
# ─────────────────────────────────────────────

# 母婴电商页面类型标准映射
PAGE_TYPE_MAP = {
    "/": "HOME",
    "/index": "HOME",
    "/search": "SEARCH",
    "/category": "CAT",
    "/product": "PDP",
    "/cart": "CART",
    "/checkout": "ORDER",
    "/payment": "PAY",
    "/review": "REVIEW",
    "/promotion": "PROMO",
}

# Sankey 展示用的页面顺序（漏斗层级）
FUNNEL_ORDER = ["HOME", "SEARCH", "CAT", "PDP", "REVIEW", "CART", "ORDER", "PAY", "PROMO"]


# ─────────────────────────────────────────────
# 2. 数据预处理
# ─────────────────────────────────────────────

class TrajectoryPreprocessor:
    """
    用户轨迹序列预处理器
    - 过滤停留时间异常（< min_dwell 或 > max_dwell）
    - 过滤超长 session（> max_pages）
    - 合并超节点（重复子序列压缩）
    """

    def __init__(
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：会话级点击流明细，字段至少含 session_id、user_id、page_type（HOME/SEARCH/CAT/PDP/CART/ORDER/PAY 等）、page_name、dwell_time_sec（整数秒）、event_time；一条记录是一次页面浏览，粒度到「会话 × 页面 × 事件时间」。需先完成页面类型映射并剔除停留时间异常值；样本量须足以在支持度阈值下筛出频繁序列，样本过少时挖不出稳定模式。

**输出**：典型轨迹模式聚类结果、高频子轨迹列表、变阶马尔可夫页面转移概率矩阵、带停留时间权重的下一步页面预测，以及可直接渲染的 Plotly/ECharts 桑基图 JSON；供站点运营与体验分析定位页面间流量走向。

## 执行步骤

1. 清洗会话数据，剔除停留时间异常与超长 session
2. 把 page_name 映射为标准页面类型并固定漏斗顺序
3. 用 LCS 相似度与改进 DBSCAN 聚类典型轨迹模式
4. 按支持度阈值挖掘频繁子轨迹
5. 构建变阶马尔可夫转移概率矩阵并预测下一步页面
6. 输出桑基图 JSON 供可视化渲染

## 边界与不做

- 数据不满足时不用：缺 session_id 或 event_time 无法还原路径顺序；页面命名混乱且未建 page_type 映射字典时，聚类与转移概率都没有意义，先补映射再建模。
- 何时不用：只要各步转化率与流失人数用「User-Funnel-Analysis」；要以非商品页的导航贡献为对象用「NonItem-Page-Path-Modeling」；转移矩阵观测极稀疏时先走「Sparse-Matrix-Completion」。
- 能力边界：只做路径聚类、频繁子轨迹挖掘与下一步页面预测，不做因果归因，也不替代埋点采集本身。
- 安全边界：session_id、user_id 等标识须脱敏后建模，输出不得用于识别或画像具体个人。

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-TRACE-Clickstream-Embedding.html、Skill-TRACE-Clickstream-Embedding、Skill-Traffic-Source-Analysis.html、Skill-Traffic-Source-Analysis、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis、Skill-Utimac-Uncertainty-Completion.html、Skill-Utimac-Uncertainty-Completion
- **延伸**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-Traffic-Source-Analysis.html、Skill-Traffic-Source-Analysis、Skill-Utimac-Uncertainty-Completion.html、Skill-Utimac-Uncertainty-Completion
- **可组合**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-Traffic-Source-Analysis.html、Skill-Traffic-Source-Analysis、Skill-Utimac-Uncertainty-Completion.html、Skill-Utimac-Uncertainty-Completion、Skill-Trajectory-Pattern-Mining

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：14-用户分析　·　源卡：`Skill-Trajectory-Pattern-Mining`