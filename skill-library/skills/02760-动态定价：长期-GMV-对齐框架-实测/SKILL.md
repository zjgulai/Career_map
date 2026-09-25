---
name: "p2s-aigp-llm-dynamic-pricing"
title: "AIGP — LLM 动态定价：长期 GMV 对齐框架（+13% GMV A/B实测）"
description: "触发词：动态定价、长期价值、旺季定价、竞品跟价、折扣锚点。何时不用：只看单次竞品调价跟不跟用「竞品价格监测」；本技能优化的是跨周期的 GMV 与品牌溢价。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 经营预测"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-AIGP-LLM-Dynamic-Pricing"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "不只算今天卖多少，而是算这次调价对三个月后生意的长期影响再定价。"
user_try: "试试：旺季到了竞品降价 20%，按长期 GMV 最优给出我们该不该跟、跟多少。"
whenToUse: "当季节性价格决策、竞品大促前降价需要权衡长期价值与短期单量时用；单点跟价与实时监测用「竞品价格监测」。"
workflow: "汇总价格销量历史与竞品价、季节、库存上下文 → 按季节与需求弹性划分定价情景 → 用价值估计模型评估各价格的长期 GMV 期望 → 输出可解释定价建议与价格区间"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AIGP — LLM 动态定价：长期 GMV 对齐框架（+13% GMV A/B实测）

## ① 解决的问题

业务痛点：吸奶器年度销量呈强季节性（Q3-Q4 旺季 GMV 占全年 65%），且 Momcozy 经常在大促前一周大幅降价抢占位次

## ② 核心算法逻辑

传统 RL 定价只优化短期收益（当日 GMV / 点击转化），忽视了跨周期的用户粘性损耗：盲目降价快速促单，但破坏品牌溢价 → 用户形成"等降价"心理锚点 → 长期 LTV 下降。AIGP 的核心创新是将 LLM 可解释决策与离线 RL 长期价值估计解耦组合，做到"今天的定价对三个月后的 GMV 负责"。

## ③ 业务应用场景

业务痛点：吸奶器年度销量呈强季节性（Q3-Q4 旺季 GMV 占全年 65%），且 Momcozy 经常在大促前一周大幅降价抢占位次。传统做法是手动跟价，但往往降太多伤利润或降太少丢份额。
AIGP 如何做长期 GMV 最优而非单日最优：
| 情景 | 短期 RL 的错误行为 | AIGP 的长期最优策略 | |------|-----------------|--------------------| | 旺季（10-11 月） | 看到流量高涨，降价冲 BSR 排名 | LTVE 识别旺季需求非弹性（$|\epsilon| \approx 0.7$），维持高价最大化利润；优先保障品牌溢价形成 Q1 复购基础 | | 淡季（2-4 月） | 需求低迷，大幅降价清库存 | LTVE 评估降价带来的"廉价锚点"会压制旺季复购，建议 -5% 微调 + 赠品套装组合，维护品牌调性 | | 竞品降价（Momcozy -20%） | 立即

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

需要 LLM API 接入（生产环境建议 70B+ 模型或专属微调）
LTVE 训练需至少 6 个月高质量历史价格-销量配对数据
DPO 偏好数据标注需业务团队配合（正负样本定义）
生产蒸馏部署需 MLOps 基础设施

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（368 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/aigp_llm_dynamic_pricing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-AIGP-LLM-Dynamic-Pricing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AIGP Dynamic Pricing — LLM + LTVE + DPO 长期 GMV 对齐框架
论文: AIGP: An LLM-Based Framework for Long-Term Value Alignment in E-Commerce Pricing
ICLR 2026 Workshop | 真实电商平台 A/B 实测 GMV +13.21%
"""

from dataclasses import dataclass, field
from typing import List, Optional, Tuple
import numpy as np
import random


@dataclass
class PricingContext:
    """定价上下文数据类"""
    sku_id: str
    current_price: float
    cost: float
    competitor_prices: List[float]          # 竞品价格列表
    demand_history: List[float]             # 历史日销量（最近 30 天）
    season: str                              # "peak" | "off" | "normal"
    days_since_launch: int = 0              # 新品冷启天数，0 = 成熟品
    review_count: int = 0                   # 评论数量
    inventory_days: float = 60.0            # 库存可销天数


@dataclass
class PricingDecision:
    """定价决策输出"""
    sku_id: str
    recommended_price: float
    ltve_score: float                        # 长期价值评分 (0-1)
    reasoning: str                           # LLM 推理链
    confidence: float                        # 决策置信度
    price_range: Tuple[float, float] = (0, 0)


class LTVEEstimator:
    """
    Long-Term Value Estimator — 离线 RL 价值估计（简化版）
    用历史销售数据拟合 Q 函数，估算定价决策的长期 GMV 期望
    """
    
    def __init__(self, gamma: float = 0.95, horizon: int = 90):
        self.gamma = gamma           # 折扣因子
        self.horizon = horizon       # 价值估算周期（天）
        self.q_table = {}            # 简化版 Q-table: (price_bucket, season) -> value
        self.fitted = False
    
    def _price_bucket(self, price: float, base_price: float) -> str:
        """将价格归入相对于基准价的桶"""
        ratio = price / base_price
        if ratio < 0.85:
            return "deep_discount"
        elif ratio < 0.95:
            return "discount"
        elif ratio < 1.05:
            return "normal"
        elif ratio < 1.15:
            return "premium"
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：6 个月以上高质量价格与销量配对数据、竞品价格序列，以及季节、库存天数、评论数、上新天数等上下文；输出含推荐价格区间。

**输出**：推荐价格、长期价值评分、LLM 推理链与决策置信度、价格浮动区间，供定价团队执行与复盘。

## 执行步骤

1. 准备 6 个月以上价格销量配对与竞品价格序列
2. 按季节与需求弹性划分定价情景
3. 用价值估计模型评估各价格的长期 GMV 期望
4. 生成可解释定价建议与价格区间
5. 执行后记录实际结果用于模型迭代

## 边界与不做

- 何时不用：历史价格销量数据不足 6 个月时，长期价值估计不可靠
- 能力边界：只输出定价建议与推理，不直接改价，也不得突破品牌价格政策与平台规则

## 技能关联

- **前置**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL
- **延伸**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring
- **可组合**：Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-AIGP-LLM-Dynamic-Pricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-AIGP-LLM-Dynamic-Pricing`