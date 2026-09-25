---
name: "p2s-dara-agentic-mmm"
title: "DARA Agentic MMM — LLM Agent 驱动的营销组合建模：双阶段自动调参与智能归因"
description: "触发词：营销组合建模、MMM自动调参、adstock衰减、渠道饱和、智能归因。何时不用：时序不足26周或渠道超过8个未分组时不适用；只想在一期预算内出多档方案时用贝叶斯MMM情景技能。安全边界：仅消费周级渠道聚合数据，不处理用户级信息，参数与归因结论须经数据科学团队复核后才可用于预算调整。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 渠道经营分析"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-DARA-Agentic-MMM"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "自动搜索各渠道的 adstock 衰减与饱和参数，把营销组合建模从数周压缩到数小时并给出渠道归因。"
user_try: "试试：我们有52周 Amazon、Meta、TikTok 的周级消耗和销售额，帮我自动调 adstock 与饱和参数并给出渠道预算重配建议。"
whenToUse: "当需要从零估计各渠道 adstock 与饱和参数、做渠道贡献归因时用本卡；只要宏观预算比例分配、不做参数估计时用营销组合建模基线；已有后验样本只想出多档方案时用贝叶斯 MMM 情景技能。"
workflow: "汇总不少于 26 周的周级渠道消耗与销售额 → 对每渠道做 adstock 与 Hill 饱和变换 → 双阶段自动搜索 decay、alpha、K 与渠道系数 → 输出最优参数组合与拟合评估 → 给出渠道贡献归因与预算重配建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DARA Agentic MMM — LLM Agent 驱动的营销组合建模：双阶段自动调参与智能归因

## ① 解决的问题

某母婴辅食品牌在美国市场同时投放 Amazon Ads、Meta（FB+IG）、TikTok，月均广告预算 $15 万美元，但各渠道的 adstock 效应差异显著（TikTok 内容影响力可持续 2-4 周，Amazon 关键词效果衰减快）

## ② 核心算法逻辑

传统 Marketing Mix Modeling（MMM）存在根本性瓶颈：大量人工调参。数据科学家需要手动尝试 adstock（广告滞留）半衰期、saturation（饱和度）参数、季节性先验，一轮完整建模周期通常需要 28 周。

## ③ 业务应用场景

业务背景：某母婴辅食品牌在美国市场同时投放 Amazon Ads、Meta（FB+IG）、TikTok，月均广告预算 $15 万美元，但各渠道的 adstock 效应差异显著（TikTok 内容影响力可持续 2-4 周，Amazon 关键词效果衰减快）。传统 MMM 用统一的 $\lambda=0.5$ 导致 TikTok 效果被严重低估。
数据要求： - 周级渠道消耗数据：`{week, channel, spend, impressions}` - 对应期间销售额/转化量：`{week, revenue, units_sold}` - 外部控制变量：`{week, seasonality_index, competitor_spend_estimate}`
量化 ROI： - 参数优化准确率提升 22-31%（vs 人工调参基线） - TikTok 预算重配后整体 ROAS 提升 +0.4x（$2.1 → $2.5 per dollar） - 建模周期从 6 周压缩至 4 小时

## ④ 输入数据要求

时序长度：≥ 26 周（半年）；推荐 52+ 周以覆盖年度季节性
渠道数：2-8 个（超过 8 个建议分组）
数据粒度：周级；日级数据需先聚合
外部变量（可选）：节假日指标、竞争对手促销标记

## ⑤ 输出结果

时序长度：≥ 26 周（半年）；推荐 52+ 周以覆盖年度季节性
渠道数：2-8 个（超过 8 个建议分组）
数据粒度：周级；日级数据需先聚合
外部变量（可选）：节假日指标、竞争对手促销标记

## ⑥ 业务价值 / ROI

30-60 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（641 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/marketing/dara_agentic_mmm` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-DARA-Agentic-MMM.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DARA Agentic MMM
整合 DARA 双阶段架构 + Agentic Bayesian 参数优化 + 自动洞察生成
论文：DARA (arXiv:2601.14711) + MMM 4.0 (Applied Marketing Analytics 2025)
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from scipy.optimize import minimize
from scipy.stats import norm


# ── 1. MMM 核心变换 ──────────────────────────────────────────────────────────

def geometric_adstock(spend: np.ndarray, decay: float, max_lag: int = 8) -> np.ndarray:
    """
    Geometric Adstock 变换：x_t_star = x_t + λ * x_{t-1}_star
    decay: 衰减系数 λ ∈ [0, 1]
    """
    result = np.zeros_like(spend, dtype=float)
    for t in range(len(spend)):
        result[t] = spend[t]
        for lag in range(1, min(t + 1, max_lag + 1)):
            result[t] += (decay ** lag) * spend[t - lag]
    return result


def hill_saturation(x: np.ndarray, alpha: float, K: float) -> np.ndarray:
    """
    Hill 函数饱和变换：f(x) = x^alpha / (x^alpha + K^alpha)
    alpha: 曲线斜率（越大S形越明显）
    K: 半饱和点（达到最大效果50%时的投入量）
    """
    x_safe = np.maximum(x, 1e-10)
    return (x_safe ** alpha) / (x_safe ** alpha + K ** alpha)


@dataclass
class ChannelParams:
    """单渠道 MMM 参数"""
    name: str
    decay: float = 0.5      # adstock 衰减系数
    alpha: float = 2.0      # Hill 饱和斜率
    K: float = 5000.0       # 半饱和点（预算单位）
    coef: float = 1.0       # 渠道系数（待估计）


class MMMModel:
    """
    核心 MMM 模型
    Sales = baseline + Σ channel_coef * saturation(adstock(spend)) + ε
    """

    def __init__(self, channel_params: List[ChannelParams]):
        self.channel_params = {p.name: p for p in channel_params}

    def transform_channel(self, spend: np.ndarray, params: ChannelParams) -> np.ndarray:
        """adstock → saturation 双重变换"""
        adstocked = geometric_adstock(spend, params.decay)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2601.14711 — DARA: Few-shot Budget Allocation in Online Advertising via In-Context Decision Making with RL-Finetuned LLMs
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：周级渠道消耗数据（{周, 渠道, 消耗, 曝光}）、对应期间的销售额或转化量（{周, 收入, 销量}）与可选外部控制变量（{周, 季节性指数, 竞品投放估计}）；时序需 ≥26 周（推荐 52 周以上）、渠道 2-8 个、周级粒度，日级数据需先聚合。

**输出**：各渠道最优 adstock 衰减系数、Hill 饱和斜率与半饱和点、渠道系数等参数组合，以及渠道贡献归因、预算重配建议与自动洞察，交数据科学与投放团队评审。

## 执行步骤

1. 汇总不少于 26 周的周级渠道消耗与销售额数据
2. 对每个渠道做几何 adstock 变换并设定最大滞后期
3. 对变换后的序列做 Hill 饱和变换
4. 用双阶段流程自动搜索各渠道 decay、alpha、K 与渠道系数
5. 评估拟合效果并输出最优参数组合
6. 基于参数给出渠道贡献归因与预算重配建议

## 边界与不做

- 何时不用：时序短于 26 周、渠道超过 8 个未分组、或只有未聚合的日级数据时不适用。
- 能力边界：不替代平台侧预算执行，只产出参数与建议；外部控制变量缺失会削弱因果归因的可信度。
- 数据边界：需要渠道级聚合的消耗与对应期销售数据，缺少对应期销售数据时无法估计渠道系数。

## 技能关联

- **前置**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **延伸**：Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Identity-Fragmentation-Debiasing.html、Skill-Identity-Fragmentation-Debiasing
- **可组合**：Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-DARA-Agentic-MMM

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：15-营销投放分析　·　源卡：`Skill-DARA-Agentic-MMM`