---
name: "p2s-cost-plus-dynamic-tariff-pricing"
title: "成本加成+关税动态定价 — 关税波动下的自动调价模型"
description: "触发词：关税调价、成本加成定价、成本传导、税率跳升、毛利率保护、最低售价测算。何时不用：只想判断该不该降价冲量时用「需求价格弹性估算」；成本增量来自汇率而非关税时用「汇率联动动态定价」。安全边界：调价建议须经人工确认后才可执行，且建议价不得突破竞品容忍溢价上限，避免份额被反噬。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 经济性分析"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Cost-Plus-Dynamic-Tariff-Pricing"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "关税一跳成本就穿到价格上：算出该传导多少涨幅、涨价后毛利率还剩几成，并给出不丢竞争力的建议价。"
user_try: "试试：婴儿睡袋关税从 7.5% 升到 25%，帮我算一版调价建议，并核一下涨价后毛利率能不能保住 33%。"
whenToUse: "当成本端（关税或采购价）发生跳变、要在 24 小时内给出传导幅度与最低可售价时用本技能；若波动来自汇率而非关税，用「汇率联动动态定价」；若只是想知道降价能带来多少销量，用「需求价格弹性估算」。"
workflow: "汇总产品成本、头程运费、关税、FBA、广告费等完整成本结构 → 用新旧成本结构分别计算总成本与最低可售价（受目标毛利率与佣金率约束） → 用 tariff_change_impact 计算成本增量与建议传导比例 → 按竞品价格溢价上限裁剪建议价并回算调价后毛利率 → 上线后监控 BSR 变化，5 天内无显著下滑则确认调价"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 成本加成+关税动态定价 — 关税波动下的自动调价模型

## ① 解决的问题

财务团队面临"关税波动后未及时调价导致季度毛利率大幅下滑"——成本加成动态定价在关税变化24小时内触发调价建议，年化保护毛利率2-5pp约15-30万元

## ② 核心算法逻辑

跨境电商成本结构包含：产品成本、头程运费、关税、FBA 仓储费、平台佣金、广告费。当关税税率变化时（如从 7.5% 跳升至 25%），如何将成本增量合理传导至售价而不损失竞争力，是兼顾成本回收与弹性约束的优化问题。

## ③ 业务应用场景

场景：婴儿睡袋关税从 7.5% → 25% 的调价决策
- 业务问题：美国对华加征关税，婴儿睡袋税率从 7.5% 升至 25%，产品采购价 $8，此前售价 $29.99，毛利率 35%，新关税后成本上涨 $1.4/件，不调价则毛利率降至 30% - 数据要求：完整成本结构（产品+运费+关税+FBA+广告），竞品当前价格，历史价格弹性系数 - 预期产出：系统推荐涨价 $1.80（$29.99→$31.79），将成本涨幅 $1.40 的 70% 传导给消费者，保持毛利率 33%，同时维持竞争力 - 业务价值：相比完全吸收成本（不调价），年化保护毛利约 8 万元（销量 5 万件/年）
三轨验证： - 成本：模型开发成本极低，关键是打通成本数据采集链路 - 合规：调价操作完全合规，Amazon TOS 允许自主定价 - 风险：若竞品不跟涨，调价可能导致份额损失；建议监控 BSR 变化，5 天内无显著下滑则确认调价

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：关税波动期合理传导 70% 成本增量，年化保护毛利 5-15 万元（取决于产品规模）
实施难度：⭐⭐⭐☆☆（成本数据采集是难点，定价逻辑不复杂）
优先级：⭐⭐⭐⭐⭐（贸易摩擦背景下，跨境卖家必备生存技能）
评估依据：不主动调价的卖家在关税波动期毛利率每年平均下降 3-8%，积累损失巨大

## ⑦ 代码节选

> **本节是源站卡页的代码预览节选，不是完整实现。**
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余代码源站未发布。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
成本加成+关税动态定价模型
输入：成本结构 + 关税税率变化 + 竞品价格 + 弹性系数
输出：最优调价建议 + 决策说明
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class CostStructure:
    product_cost: float
    tariff_rate: float
    freight_cost: float
    fba_cost: float
    ads_cost_per_unit: float
    other_cost: float
    platform_commission: float
    target_gross_margin: float


def compute_total_cost(cs: CostStructure) -> float:
    return (
        cs.product_cost * (1 + cs.tariff_rate)
        + cs.freight_cost + cs.fba_cost
        + cs.ads_cost_per_unit + cs.other_cost
    )


def compute_minimum_price(cs: CostStructure) -> float:
    total_cost = compute_total_cost(cs)
    denom = 1 - cs.target_gross_margin - cs.platform_commission
    if denom <= 0:
        raise ValueError("目标毛利率+佣金率之和必须 < 1")
    return total_cost / denom


def tariff_change_impact(
    cs_old: CostStructure,
    cs_new: CostStructure,
    current_price: float,
    elasticity: float,
    competitor_price: Optional[float] = None,
    min_pass_through: float = 0.5,
    max_price_premium_vs_competitor: float = 0.05,
) -> dict:
    old_cost = compute_total_cost(cs_old)
    new_cost = compute_total_cost(cs_new)
    cost_delta = new_cost - old_cost

    p_min_new = compute_minimum_price(cs_new)
    old_margin = (current_price * (1 - cs_old.platform_commission) - old_cost) / current_price

    abs_ela = abs(elasticity)
    pass_through = max(min_pass_through, 1 - (abs_ela - 1) * 0.2)
    pass_through = min(pass_through, 1.0)

    suggested = current_price + cost_delta * pass_through
    suggested = max(suggested, p_min_new)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：单 SKU 的完整成本结构（产品成本、关税税率、头程运费、FBA 费、单件广告费、其他成本、平台佣金、目标毛利率）、新旧关税两套参数、当前售价、历史价格弹性系数与可选的竞品当前价格；粒度为单个 SKU 的一次调价决策。

**输出**：一份调价建议：总成本、最低可售价、建议涨幅与传导比例、调价后毛利率，以及相对竞品的溢价校验；供财务与定价负责人确认后执行。

## 执行步骤

1. 汇总产品成本、头程运费、关税、FBA 与广告费等完整成本项
2. 用新旧两套成本结构分别算出总成本与最低可售价
3. 用 tariff_change_impact 计算成本增量与建议传导比例
4. 按竞品溢价上限约束裁剪建议价，并回算调价后毛利率
5. 监控 BSR 变化，5 天内无显著下滑即确认调价

## 边界与不做

- 数据不满足：成本结构缺项（关税、佣金口径不全）时最低可售价算不准，先补数据再决策。
- 何时不用：汇率波动导致的毛利下滑用「汇率联动动态定价」；清库存降价排期用「折扣清仓定价优化」。
- 能力边界：只输出调价建议与传导比例，不改价、不代办平台改价审核与 Listing 同步。
- 安全边界：建议价须人工确认；若竞品不跟涨导致份额流失，本技能不承担份额兜底。

## 技能关联

- **可组合**：Skill-Cost-Plus-Dynamic-Tariff-Pricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Cost-Plus-Dynamic-Tariff-Pricing`