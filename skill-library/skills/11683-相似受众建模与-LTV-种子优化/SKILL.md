---
name: "p2s-facebook-audience-lookalike-scaling"
title: "Facebook Audience Lookalike Scaling — Meta 相似受众建模与 LTV 种子优化"
description: "触发词：相似受众、种子优化、LTV 分层、高分位种子、受众扩展、投放对照。何时不用：没有预测 LTV 的能力时先用双塔或 LTV 预测技能；只判断扩展比例风险时用置信度校准。安全边界：客户数据上传平台需符合平台数据条款与隐私法规，种子筛选不得使用敏感个人信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 分群"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Facebook-Audience-Lookalike-Scaling"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "用高 LTV 客户替换全量客户做种子，让相似受众投放从源头更精准。"
user_try: "试试：我用全量客户做种子 ROAS 只有 2.1x，帮我按预测 LTV 筛高价值种子再建相似受众。"
whenToUse: "相似受众扩展效果不理想、怀疑种子池质量时用本技能；候选种子池太小无法分层时先扩种子；评估扩量比例的收益与风险时用置信度校准。"
workflow: "用 LTV 模型计算历史客户的预测 LTV → 按分位阈值筛选高价值种子 → 创建高精度相似受众并保留全量种子作对照 → 对比两组的 ROAS 与 GMV 表现 → 输出种子优化结论与放量建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Facebook Audience Lookalike Scaling — Meta 相似受众建模与 LTV 种子优化

## ① 解决的问题

用全量客户做 Lookalike 种子导致 ROAS 只有 2.1x——MetaHeac 高 LTV 种子优化将种子筛选至 P80 分位，ROAS 从 2.1x 提升到 3.8x，同等预算带来 81% 更多 GMV

## ② 核心算法逻辑

Facebook Lookalike Audience（相似受众）是 Meta 广告最强大的功能之一：给定一批"种子用户"（比如过去 30 天购买过的客户），Meta 在 20 亿用户中找到与之最相似的人群。但大多数广告主不知道：种子质量决定了扩展效果的上限，而种子质量的最大变量是 LTV——用高 LTV 用户做种子 vs 全量客户做种子，广告 ROAS 可以差 40%+。

## ③ 业务应用场景

业务问题：广告团队用"全量过去 30 天购买者"（3000 人）做 Lookalike，ROAS 只有 2.1x。竞品声称 ROAS 可以到 4x，想知道差距在哪里。
种子优化方案： 1. 用 Skill-LTV-Prediction-ZILN 计算每个历史客户的预测 LTV 2. 筛选 LTV > P80 的 600 人作为高价值种子 3. 创建 1% Lookalike（精准受众）用于测试 4. 保留原来的 3000 人全量作为对照
实验结果：高 LTV 种子 ROAS = 3.8x；全量种子 ROAS = 2.1x → +81% 提升

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
高 LTV 种子 vs 全量种子：ROAS 从 2.1x → 3.8x（+81%），同等预算带来 81% 更多 GMV
月 Facebook 预算 $5,000：优化后额外 GMV ¥20-40 万/年
生命周期分层 Lookalike：避免将"孕期广告"推给"宝宝已12个月+"的用户
年化综合 ROI：¥50-150 万
实施难度：⭐⭐☆☆☆（LTV 计算 + CSV 上传种子，2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（202 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/facebook_audience_lookalike_scaling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Facebook-Audience-Lookalike-Scaling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Facebook Audience Lookalike Scaling — LTV 种子优化与受众扩展
基于 MetaHeac (arXiv: 2105.14688) + 密度估计 (arXiv: 2311.05853)

依赖: numpy, statistics, dataclasses (标准库)
"""

from dataclasses import dataclass, field
import numpy as np
from statistics import mean, quantiles


@dataclass
class Customer:
    """客户数据"""
    customer_id: str
    total_spend: float          # 历史总消费
    purchase_count: int         # 购买次数
    days_since_first_purchase: int
    product_categories: list    # 购买品类
    ltv_predicted: float = 0.0  # 预测 LTV（由 Skill-LTV-Prediction 输入）
    lifecycle_stage: str = ""   # pregnant / newborn / 0-6m / 6-12m / 12m+


@dataclass
class LookalikeAudience:
    """相似受众配置"""
    seed_type: str              # high_ltv / full_customer / visitor
    seed_size: int
    audience_size_pct: float    # 1% / 2% / 5% / 10%
    estimated_roas: float
    estimated_reach: int        # 预估受众规模
    seed_ltv_p75: float         # 种子 LTV P75


class SeedOptimizer:
    """
    Lookalike 种子优化器

    核心方法：
    1. LTV 分位数筛选（高价值种子）
    2. 生命周期阶段分层
    3. 饱和度预测
    """

    # ROAS 倍数（基于行业数据 + MetaHeac 论文）
    ROAS_MULTIPLIERS = {
        "high_ltv_1pct":   1.40,
        "high_ltv_2pct":   1.25,
        "full_customer_1pct": 1.00,
        "full_customer_5pct": 0.85,
        "visitor_1pct":    0.60,
    }

    BASELINE_ROAS = 2.1  # 全量客户 1% 基准 ROAS

    def compute_ltv(self, customer: Customer) -> float:
        """简化 LTV 计算（生产环境使用 Skill-LTV-Prediction-ZILN 输出）"""
        arpu = customer.total_spend / max(customer.purchase_count, 1)
        tenure_months = customer.days_since_first_purchase / 30
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2105.14688 — Learning to Expand Audience via Meta Hybrid Experts and Critics for Recommendation and Advertising
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.286／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：历史客户数据（总消费、购买次数、购买品类、预测 LTV）、不同扩展比例的受众配置，以及可用的预算与对照投放设计。

**输出**：高价值种子名单与分位阈值、相似受众配置（含预估触达与种子 LTV 分位）、种子优化前后的 ROAS 与 GMV 对比；供广告团队决定放量规模。

## 执行步骤

1. 用 LTV 模型计算历史客户的预测 LTV
2. 按分位阈值筛选高价值种子
3. 创建高精度相似受众并保留全量种子作对照
4. 对比两组的 ROAS 与 GMV 表现
5. 输出种子优化结论与放量建议

## 边界与不做

- 何时不用：没有可用的 LTV 预测能力时先补双塔或 LTV 预测技能，再谈种子优化。
- 能力边界：本技能产出种子名单与受众配置，不负责平台投放执行与预算分配。
- 合规边界：客户数据上传需符合平台数据条款与隐私法规，种子筛选不得使用敏感个人信息。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Churn-Revenue-Impact.html、Skill-Churn-Revenue-Impact、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Churn-Revenue-Impact.html、Skill-Churn-Revenue-Impact、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Facebook-Audience-Lookalike-Scaling

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Facebook-Audience-Lookalike-Scaling`