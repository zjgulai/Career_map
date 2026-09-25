---
name: "p2s-tariff-impact-margin-stress-test"
title: "Skill-Tariff-Impact-Margin-Stress-Test — 关税冲击利润压力测试"
description: "触发词：关税冲击、利润压力测试、盈亏临界税率、毛利率逐级影响、价格转嫁模拟。何时不用：关税、汇率、FBA费率要三因子联动测算时用「关税-汇率-FBA费率三联动成本动态测算」；只算订单级贡献毛利时用「单位经济拆解」。安全边界：只做内部毛利推演，不代申报关税；税率取值以官方公告与 HTS 归类结果为准，价格转嫁比例需业务确认。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 情景模拟"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Tariff-Impact-Margin-Stress-Test"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "关税从 25% 涨到 54% 时，先算清每件少赚多少、涨多少价还卖得动，再决定提价还是换供应商。"
user_try: "试试：按 CIF 成本和现价跑一遍关税情景压力测试，告诉我盈亏临界税率和涨价后的销量影响。"
whenToUse: "已知可能的关税上调幅度、要评估单个 SKU 毛利率逐级变化与提价取舍时用；要联动汇率与 FBA 费率时用「关税-汇率-FBA费率三联动成本动态测算」；只算每单贡献毛利时用「单位经济拆解」。"
workflow: "取售价、CIF 成本与当前费率算出毛利基线 → 按场景清单逐档施加关税与价格转嫁 → 叠加价格弹性推演销量与月利润 → 定位盈亏临界税率 → 形成提价与换供应商的决策建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Tariff-Impact-Margin-Stress-Test — 关税冲击利润压力测试

## ① 解决的问题

供应链负责人面临"对等关税从25%升至54%不知道SKU是否还有毛利"——情景压力测试找到盈亏临界关税率，提前6个月决策供应商转移，年化关税节省20-100万元

## ② 核心算法逻辑

关税压力测试是一种情景分析框架，量化不同关税税率变化对 SKU 毛利率的逐级影响，帮助卖家提前制定对冲策略。

## ③ 业务应用场景

场景：母婴品牌从中国进口婴儿监视器，CIF 成本 35 美元/件，售价 89.99 美元，当前关税 25%。2025 年"对等关税"提案将税率提升至 54%。
压力测试结果： - 当前毛利率：(89.99 - 35×1.25 - 12.5) / 89.99 = 28.3% - 54% 税率下：额外关税成本 35×0.29 = 10.15 美元/件 - 若不提价：毛利率降至 16.8%，已低于 Amazon 费用覆盖线 - 若涨价 $10：转化率预计下降 15%，月销量从 2,000 降至 1,700 件
决策结论：启动越南替代供应商（税率 10%），目标 6 个月完成切换，年化关税节省 43 万元。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

20-100 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（108 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd

# 关税冲击利润压力测试

def compute_margin(
    selling_price: float,
    cif_cost: float,
    tariff_rate: float,
    fba_fee: float,
    referral_rate: float = 0.15,
    other_opex: float = 0.0
) -> float:
    """计算单品毛利率"""
    landed_cost = cif_cost * (1 + tariff_rate)
    referral_fee = selling_price * referral_rate
    profit = selling_price - landed_cost - fba_fee - referral_fee - other_opex
    return profit / selling_price


def stress_test_tariff(
    sku_name: str,
    selling_price: float,
    cif_cost: float,
    base_tariff: float,
    fba_fee: float,
    tariff_scenarios: list,
    price_elasticity: float = -1.5,
    base_monthly_units: int = 1000,
    referral_rate: float = 0.15,
) -> pd.DataFrame:
    """
    压力测试：不同关税情景下的利润影响

    tariff_scenarios: [(场景名, 税率, 价格转嫁比例), ...]
    """
    results = []
    base_margin = compute_margin(selling_price, cif_cost, base_tariff, fba_fee, referral_rate)

    for name, tariff, pass_through in tariff_scenarios:
        extra_cost = cif_cost * (tariff - base_tariff)
        price_increase = extra_cost * pass_through
        new_price = selling_price + price_increase
        new_margin = compute_margin(new_price, cif_cost, tariff, fba_fee, referral_rate)

        pct_price_change = price_increase / selling_price
        volume_change = 1 + (price_elasticity * pct_price_change)
        new_units = max(0, base_monthly_units * volume_change)

        monthly_profit_change = (
            new_units * new_price * new_margin -
            base_monthly_units * selling_price * base_margin
        )

        results.append({
            '情景': name,
            '关税率': f'{tariff:.0%}',
            '新售价': round(new_price, 2),
            '新毛利率': f'{new_margin:.1%}',
            '月销量变化': f'{new_units:.0f}件',
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：SKU 售价、CIF 成本、当前关税率、FBA 费用、平台佣金率与其他运营成本，以及关税情景清单（场景名、税率、价格转嫁比例）、价格弹性与基准月销量；粒度：SKU 级。

**输出**：各关税情景下的新售价、毛利率、月销量与月利润变化对比表，以及盈亏临界关税率与提价或换货源建议，供采购与定价决策使用。

## 执行步骤

1. 录入售价、CIF 成本、当前关税与平台费率并算出基准毛利率
2. 定义关税情景清单并设定价格转嫁比例
3. 逐情景重算毛利，并按价格弹性推演销量变化
4. 找出毛利率跌破费用覆盖线的临界税率
5. 输出提价幅度与供应商转移的决策建议

## 边界与不做

- 数据不满足时不用：没有可靠的 CIF 成本、适用税率或价格弹性时，销量与毛利的推演会双向失真。
- 能力边界：不预测税率是否真的落地，也不做 HTS 归类与关税申报；结论是情景推演而非政策判断。

## 技能关联

- **可组合**：Skill-Tariff-Impact-Margin-Stress-Test

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-Tariff-Impact-Margin-Stress-Test`