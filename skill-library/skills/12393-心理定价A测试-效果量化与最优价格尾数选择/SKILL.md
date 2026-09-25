---
name: "p2s-psychological-pricing-ab-test"
title: "心理定价A/B测试 — $9.99 vs $10 效果量化与最优价格尾数选择"
description: "触发词：心理定价、魅力定价、价格尾数、定价 A/B 实验、样本量测算、收益中性。何时不用：要按用户响应异质性做定向投放用「个性化促销定向」；要估弹性大小用「需求价格弹性估算」。安全边界：实验须使用平台官方工具（如 Amazon Manage Your Experiments），价格标注真实，不得虚构原价或做误导性促销。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 实验设计"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Psychological-Pricing-AB-Test"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "19.99 还是 20 到底哪个转化高：用一次规范实验把价格尾数的效果量出来，而不是靠开会争论。"
user_try: "试试：新品定价在 $18.99、$19.99、$20 三个选项上吵不出结果，帮我算每组样本量并设计一版尾数 A/B 实验。"
whenToUse: "当价格形式（整数或尾数）需要实验验证、且能拿到足够曝光做多组对照时用本技能；若要按用户异质性做定向促销，用「个性化促销定向」；要估弹性大小，用「需求价格弹性估算」。"
workflow: "按基线转化率与最小可检测效应计算每组样本量 → 设计多组价格实验并保证每组日均 PDU 不低于 500 → 跑满实验期后用双比例 Z 检验判定显著性 → 用收益中性检验核对价格与转化率的净收入 → 等新品稳定 30 天后再启动，降低 BSR 波动风险"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 心理定价A/B测试 — $9.99 vs $10 效果量化与最优价格尾数选择

## ① 解决的问题

运营面临"不知道整数vs尾数定价对目标用户哪个CVR更高"——心理定价A/B量化验证使最优定价形式CVR提升3-8%，年化增收10-25万元

## ② 核心算法逻辑

心理定价（Psychological Pricing）利用消费者对价格的认知偏差而非理性计算来影响购买决策。最典型的是魅力定价（Charm Pricing）：$9.99 感知上显著低于 $10，因为消费者从左到右读取数字，第一位数字（9 vs 10）锚定感知价格区间。但这一效应并非普遍成立，高端母婴品牌使用 $99.99 反而可能损害品牌调性（显得廉价）。

## ③ 业务应用场景

场景：婴儿安抚奶嘴新品定价 $19.99 vs $20 vs $18.99 三组测试
- 业务问题：新品上线，定价团队对 $18.99、$19.99、$20.00 三个价格存在分歧，需数据驱动决策而非经验判断 - 数据要求：Amazon Manage Your Experiments 或优惠券模拟，需 PDU（Product Detail Page Views）≥ 500/天/组 - 预期产出：在 14 天实验后以 95% 置信度确定最优价格尾数；预期 $19.99 vs $20 的 CVR 差异约 0.8-1.5% - 业务价值：若 $19.99 CVR 提升 1%，年销量 3 万件，年化增收约 1.5 万美元
三轨验证： - 成本：A/B 测试本身无直接成本，实验期（14 天）的价格次优损失可控（<5000 元） - 合规：Amazon Manage Your Experiments 是官方工具，完全合规 - 风险：实验期间 BSR 可能因流量分割而下滑，建议新品稳定后（>30天）再做实验

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：CVR 提升 0.5-1.5% 对年销 3 万件产品年化增收 1-5 万美元，实验成本极低
实施难度：⭐⭐⭐☆☆（数据分析为主，Amazon 提供官方实验工具）
优先级：⭐⭐⭐⭐☆（低成本高回报，几乎所有品类新品定价阶段都值得做）
评估依据：心理定价效应在低价位（<$50）母婴产品上更显著，高端品类需反向验证整数价格效果

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（103 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
心理定价 A/B 测试分析框架
支持双比例 Z 检验、样本量计算、收益中性检验
"""
import numpy as np
from scipy import stats
from typing import List
import pandas as pd


def sample_size_calculator(
    baseline_cvr: float,
    mde: float,
    alpha: float = 0.05,
    power: float = 0.80,
) -> int:
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    p = baseline_cvr
    n = 2 * (z_alpha + z_beta) ** 2 * p * (1 - p) / (mde ** 2)
    return int(np.ceil(n))


def two_proportion_z_test(
    conv_a: int, visitors_a: int,
    conv_b: int, visitors_b: int,
    alpha: float = 0.05
) -> dict:
    p_a = conv_a / visitors_a
    p_b = conv_b / visitors_b
    p_pool = (conv_a + conv_b) / (visitors_a + visitors_b)
    se = np.sqrt(p_pool * (1 - p_pool) * (1 / visitors_a + 1 / visitors_b))
    z_stat = (p_b - p_a) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
    return {
        "cvr_control": round(p_a * 100, 3),
        "cvr_treatment": round(p_b * 100, 3),
        "absolute_lift": round((p_b - p_a) * 100, 3),
        "p_value": round(p_value, 4),
        "significant": p_value < alpha,
    }


def revenue_neutrality_check(
    price_ctrl: float, cvr_ctrl: float,
    price_treat: float, cvr_treat: float,
    daily_visitors: int
) -> dict:
    rev_ctrl = price_ctrl * cvr_ctrl * daily_visitors
    rev_treat = price_treat * cvr_treat * daily_visitors
    return {
        "daily_rev_control": round(rev_ctrl, 2),
        "daily_rev_treatment": round(rev_treat, 2),
        "daily_rev_delta": round(rev_treat - rev_ctrl, 2),
        "revenue_positive": rev_treat > rev_ctrl,
    }


def analyze_multi_variant_test(variants: List[dict]) -> pd.DataFrame:
    control = variants[0]
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：各价格组的曝光量与转化数、基线转化率与希望检测的最小效应；实验需保证每组日均 PDU 不低于 500、为期约 14 天；粒度为价格变体 × 日。

**输出**：各组转化率对比、绝对提升、p 值与显著性判定，以及价格与转化率的收益中性结论；供定价团队以 95% 置信度选定最优价格尾数。

## 执行步骤

1. 按基线转化率与最小可检测效应计算样本量
2. 设置多组价格变体并保证每组曝光达标
3. 跑满实验期后用双比例 Z 检验判定显著性
4. 做收益中性检验核对净收入变化
5. 输出最优价格尾数结论与置信度

## 边界与不做

- 数据不满足：单组日均 PDU 达不到 500 时样本量不足，结论不可信。
- 何时不用：用户异质性定向用「个性化促销定向」；弹性大小估计用「需求价格弹性估算」。
- 能力边界：只做实验设计与统计分析，不含实验平台配置与价格修改执行。
- 安全边界：须使用平台官方实验工具，价格标注真实，不得虚构原价或误导性促销。

## 技能关联

- **可组合**：Skill-Psychological-Pricing-AB-Test

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Psychological-Pricing-AB-Test`