---
name: "p2s-trace-delayed-cvr"
title: "轨迹条件延迟转化建模 - 不等归因窗口即可实时更新CVR"
description: "触发词：延迟转化、实时 CVR、行为轨迹、归因窗口、回收率、渠道价值。何时不用：要扣除退款算净转化用级联净转化那张卡；本卡只解决点击到购买的单段延迟、需在窗口未满时实时更新 CVR 的问题。安全边界：点击后行为轨迹属用户行为数据，须最小化采集并遵守平台与隐私政策，不得输出个体画像。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-TRACE-Delayed-CVR"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "不用等 14 天归因窗口，靠点击后的行为轨迹就能实时估计转化，避免误砍还有后劲的渠道。"
user_try: "试试：这是 Google Ads 今天的点击和点击后行为轨迹，帮我实时估计转化概率，不要等 14 天窗口结束。"
whenToUse: "与「级联延迟净转化」相比：需要扣除退款、做两段级联去偏时用那张卡；只处理点击到购买的单段延迟、要提前判断渠道价值时用本卡。"
workflow: "接入点击事件与点击后行为轨迹（浏览、加购、收藏、复搜） → 用轨迹条件模型估计当前转化概率而非已确认转化数 → 按时间点对比传统口径与实时估计的 CVR → 基于实时估计提前调整渠道预算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 轨迹条件延迟转化建模 - 不等归因窗口即可实时更新CVR

## ① 解决的问题

投放分析师面临延迟转化漏记——TRACE将回收率62%提到91%，年化增26万元

## ② 核心算法逻辑

传统延迟反馈方法面临"准确性 vs 新鲜度"两难：

## ③ 业务应用场景

业务问题：今天 Google Ads 带来了 5000 次点击，但用户可能 14 天后才下单。现在的桑基图显示"今天 0 转化"——严重低估了 Google Ads 的价值，导致预算削减决策失误。
TRACE 的解法：不等 14 天，利用点击后的行为轨迹（浏览时长、加购、收藏、搜索同类商品、查看发货政策）实时更新转化概率，给出"当前估计转化数"而非"已确认转化数"。
| 时间点 | 传统方法 | TRACE | |--------|----------|-------| | 点击后 10分钟 | CVR = 0（未转化） | CVR = 3.2%（有加购行为） | | 点击后 2小时 | CVR = 0（未转化） | CVR = 8.7%（加购+收藏+再次浏览） | | 第14天 | CVR = 6.5%（确认） | CVR = 6.8%（已接近真实） |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

当前痛点：Google Ads CVR 被低估约 40%（14 天窗口内仅确认 30% 的最终转化）
TRACE 改善：CVR 估计误差从 40% 降至 ~5%（基于 Criteo/Taobao 实验推断）
预算决策改善：提前 10-13 天识别高效渠道，减少无效投放约 15-20%
年化节省/增益：假设 Google Ads 月均消耗 50 万，改善 15% = 约 90 万/年

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（697 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/advertising/trace_delayed_cvr` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-TRACE-Delayed-CVR.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TRACE 延迟 CVR 预测 — 完整 Python 实现
论文：arXiv:2604.23197 (SIGIR 2026)

场景：母婴出海 Google Ads 点击后行为轨迹 → 实时 CVR 估计
"""

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import pandas as pd


# ============================================================
# 0. 数据结构定义
# ============================================================

@dataclass
class ClickEvent:
    """点击事件"""
    impression_id: str
    click_time: datetime
    user_id: str
    ad_id: str
    static_features: np.ndarray  # 用户特征、广告特征等


@dataclass
class PostClickBehavior:
    """点击后行为事件"""
    impression_id: str
    event_type: str  # 'cart', 'favorite', 'view', 'search', 'purchase'
    event_time: datetime


# ============================================================
# 1. 反馈轨迹构建
# ============================================================

class FeedbackTrajectoryBuilder:
    """
    将点击后行为事件流转化为 TRACE 的反馈轨迹 ξ
    
    核心参数：
    - H: 时间窗口数量（Taobao=5, Criteo=6）
    - K: 行为类型数量（加购/收藏/购买 K=3，纯购买 K=1）
    - d_max: 最大归因窗口（天）
    """
    
    # 母婴出海场景：5 个时间窗口，匹配 Taobao 设置
    WINDOW_BOUNDARIES_HOURS = [
        (0, 0.033),   # 0-2min
        (0.033, 0.167),  # 2-10min
        (0.167, 2.0),    # 10min-2h
        (2.0, 24.0),     # 2h-1d
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.23197 — Follow the TRACE: Exploiting Post-Click Trajectories for Online Delayed Conversion Rate Prediction

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：点击事件（时间、渠道、广告 ID）与点击后行为轨迹（浏览时长、加购、收藏、同类搜索、查看发货政策等），以及最终转化标签供训练与校准。

**输出**：点击级的实时 CVR 估计与置信度、渠道价值的提前判断（卡页可提前 10–13 天）与预算调整建议，供投放分析师使用。

## 执行步骤

1. 采集点击事件与点击后行为轨迹，定义轨迹特征。
2. 训练轨迹条件模型，用已确认转化做标签校准。
3. 输出窗口未满点击的实时转化概率估计。
4. 对比传统口径，量化被低估幅度并修正渠道排名。
5. 输出渠道预算调整建议并设定回看校准频率。

## 边界与不做

- 何时不用：没有点击后行为事件、只有最终转化标签时不要用；单纯等待归因窗口即可满足的评估不必上模型。
- 能力边界：产出实时估计与建议，不自动调预算；卡页误差 40%→5%、年化增益约 90 万为特定消耗规模下的测算。
- 安全边界：行为轨迹采集须最小化并合规，不得输出个体级画像。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TESLA-NetCVR-Cascade.html、Skill-TESLA-NetCVR-Cascade
- **延伸**：Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TESLA-NetCVR-Cascade.html、Skill-TESLA-NetCVR-Cascade
- **可组合**：Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TRACE-Delayed-CVR

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-TRACE-Delayed-CVR`