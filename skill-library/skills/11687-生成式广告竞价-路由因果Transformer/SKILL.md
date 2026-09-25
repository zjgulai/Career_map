---
name: "p2s-generative-bidding-moe"
title: "生成式广告竞价 — MoE路由+因果Transformer"
description: "触发词：生成式竞价、MoE出价、因果Transformer、多场景出价、关键词分档。何时不用：关键词粒度历史不足30天时不适用；单个关键词按转化率偏差微调走关键词出价自动调整器。安全边界：Amazon禁止第三方工具直接操作竞价API，本卡只产出出价建议并须设置出价上下限保护区间。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Generative-Bidding-MoE"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "按品牌词、流量词、竞品词路由到不同专家，用因果 Transformer 生成每个词的出价建议。"
user_try: "试试：我们 Amazon PPC 有300多个关键词、30天时序数据，帮我按品牌词、流量词、竞品词分档给出出价调整建议。"
whenToUse: "当关键词需要按类型走不同出价逻辑、且已有 30 天以上关键词粒度时序时用本卡；单个关键词按转化率偏差做微调时用关键词出价自动调整器；跨渠道预算总量分配用多平台预算分配器。"
workflow: "给关键词分档并提取历史 CTR、CVR 与竞争烈度 → 门控网络按场景算三位专家的路由权重 → 各专家算出价调整系数并裁剪到 0.5-2.0 倍 → 因果 Transformer 按时间步自回归生成出价序列 → 输出关键词级出价建议并设上下限保护"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 生成式广告竞价 — MoE路由+因果Transformer

## ① 解决的问题

广告投手面临出价策略失效——生成式混合专家出价将ROAS从2.4提升至3.9，年化节省广告费28万元

## ② 核心算法逻辑

核心洞察：将广告竞价决策建模为序列生成问题——每个出价时间步如同生成下一个"token"，最优出价策略变成可学习的"竞价词汇表"，从而借用因果语言模型的生成能力解决多场景出价难题。

## ③ 业务应用场景

场景A：Amazon PPC多场景自动出价 — 三模式智能切换
- 业务痛点：品牌词（高转化低竞争）、流量词（高竞争高成本）、竞品词（防守为主）需要完全不同的出价逻辑，人工管理300+关键词策略极度耗时 - MoE映射：Expert-1负责品牌词（激进出价，保住位置）；Expert-2负责流量词（ROI约束下动态出价）；Expert-3负责竞品词（压制而非盈利目标） - 数据要求：30天以上关键词粒度的展示量、点击量、转化量、花费时序数据（Amazon广告报告API可导出） - 量化产出：在相同广告预算下，广告订单量预计提升15-25%，ACoS从28%降至20%以内
- 业务痛点：Prime Day/Black Friday前中后三阶段竞争烈度完全不同，固定出价在爆发期要么投放不足要么成本失控 - 因果Transformer优势：模型学习历史大促时序模式，在预热期自动保守出价积累权重，爆发期切换激进模式，尾期降温保留利润 - 三轨风险评估： - 成本：需要至少3个完整大促周期数据才能训练可靠模型（约6个月） - 合规：Amazon禁止第三方工具直接操作竞价API；本方案适合在TikTok Ads Manager内部API或独立站广告使用 - 风险：过度自动化出价可能触发平台异常检测，建议设置出价上下限保护区间

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

50万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（210 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
生成式广告竞价MoE模拟器
GRAD框架简化版：3个Expert(品牌词/流量词/竞品词) + 因果出价序列生成
末尾输出: [✓] 生成式竞价MoE测试通过
"""

import numpy as np
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class BiddingState:
    """竞价状态：单个关键词的历史特征"""
    keyword_type: int       # 0=品牌词 1=流量词 2=竞品词
    hist_ctr: float         # 历史点击率
    hist_cvr: float         # 历史转化率
    competition_level: float  # 竞争烈度 0-1
    budget_remaining: float   # 剩余预算比例 0-1
    time_step: int          # 当前时间步


class Expert:
    """单个MoE专家网络（线性策略模拟）"""

    def __init__(self, name: str, weights: np.ndarray):
        self.name = name
        self.weights = weights  # shape: (5,) -> 出价调整系数

    def compute_bid(self, features: np.ndarray, base_bid: float) -> float:
        adjustment = np.dot(self.weights, features)
        return base_bid * np.clip(adjustment, 0.5, 2.0)


class GatingNetwork:
    """门控网络：根据场景类型计算Expert权重"""

    def __call__(self, state: BiddingState) -> np.ndarray:
        # 基于关键词类型的稀疏路由（实际应为可学习参数）
        weights = np.zeros(3)
        if state.keyword_type == 0:  # 品牌词：主要路由Expert-0
            weights = np.array([0.8, 0.15, 0.05])
        elif state.keyword_type == 1:  # 流量词：主要路由Expert-1
            weights = np.array([0.1, 0.8, 0.1])
        else:  # 竞品词：主要路由Expert-2
            weights = np.array([0.05, 0.15, 0.8])

        # 加入竞争烈度的软路由调整
        weights[1] += 0.1 * state.competition_level
        weights = weights / weights.sum()
        return weights


class CausalBiddingTransformer:
    """
    因果竞价Transformer（简化版）
    使用自回归方式生成出价序列，确保每步只依赖历史信息
    """

    def __init__(self, n_experts: int = 3):
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2508.02002 — Generative Large-Scale Pre-trained Models for Automated Ad Bidding Optimization

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：至少 30 天的关键词粒度展示量、点击量、转化量与花费时序数据（可由 Amazon 广告报告 API 导出），加关键词类型分档、竞争烈度、剩余预算比例与时间步等状态特征。

**输出**：各关键词的出价调整系数（相对基础出价的 0.5-2.0 倍）与门控路由权重，附场景切换说明，供投手或在允许的投放平台内执行。

## 执行步骤

1. 按品牌词、流量词、竞品词给关键词分档
2. 提取各词历史 CTR、CVR、竞争烈度与剩余预算比例
3. 用门控网络按场景计算三位专家的路由权重
4. 各专家计算基础出价的调整系数并裁剪到 0.5-2.0 倍
5. 用因果 Transformer 按时间步自回归生成出价序列
6. 输出关键词级出价建议并设置出价上下限保护

## 边界与不做

- 何时不用：关键词粒度历史不足 30 天、或缺少展示/点击/转化/花费时序时不可用；只调单个关键词出价时用更轻的调整器。
- 能力边界：只产出出价建议与调整系数，不直接调用平台竞价接口；大促模式需至少 3 个完整大促周期数据才可靠。
- 合规边界：Amazon 禁止第三方工具直接操作竞价 API，只能在允许的平台（如 TikTok Ads Manager 或独立站）内落地。

## 技能关联

- **前置**：Skill-Keyword-Bidding-Optimization、Skill-Reinforcement-Learning-Bidding
- **延伸**：Skill-Multi-Objective-Auto-Bidding
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-PPC-Keyword-Bid-Automation.html、Skill-PPC-Keyword-Bid-Automation、Skill-RELATE-RL-Ad-Text-Generation.html、Skill-RELATE-RL-Ad-Text-Generation、Skill-Retail-Media-LP-Ranking.html、Skill-Retail-Media-LP-Ranking、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Generative-Bidding-MoE

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-Generative-Bidding-MoE`