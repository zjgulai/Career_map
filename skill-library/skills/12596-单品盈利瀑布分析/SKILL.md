---
name: "p2s-profitability-waterfall-by-asin"
title: "Skill-Profitability-Waterfall-By-ASIN — 单品盈利瀑布分析"
description: "触发词：单品盈利瀑布、ASIN 盈亏、广告占比预警、净利率排名、预算再分配。何时不用：要按四层口径做 SKU 损益归因用「SKU 级损益归因」；要提前预警 FBA 费用率与长库龄用「FBA 费用结构分析」。安全边界：结论用于内部投放与定价调整，不对外披露单品成本结构；阈值参数须按品类校准后使用。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 差异追踪"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Profitability-Waterfall-By-ASIN"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "逐层扣掉退款、佣金、配送、仓储、成本和广告，算出每个 ASIN 的真实净利率，找出亏损品和现金牛。"
user_try: "试试：对 15 个在售 ASIN 做盈利瀑布，排出净利率榜并标出广告占比和净利率超警戒线的 SKU。"
whenToUse: "需要按 ASIN 逐层看利润被哪一层扣掉并排出盈亏榜时用本技能；按四层口径归因用「SKU 级损益归因」；FBA 费用率与库龄预警用「FBA 费用结构分析」。"
workflow: "按 ASIN 汇总 GMV、退款、佣金、配送费、仓储费、COGS、广告费与运费 → 逐层扣减得到净收入、各层后利润与净利润 → 对照佣金、配送、仓储、广告与净利率警戒线生成预警 → 排出净利率榜并给出停止扩张或重新议价的行动建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Profitability-Waterfall-By-ASIN — 单品盈利瀑布分析

## ① 解决的问题

运营团队面临"月销最高的SKU以为最赚钱结果发现亏损而小SKU才是现金牛"——ASIN级盈利瀑布自动识别亏损品和现金牛，止损+聚焦后月净利润从1.2万升至4.8万，年化增利43万元

## ② 核心算法逻辑

论文：Waterfall: A Scalable Framework for Profit Attribution in ECommerce | 年份：2021

## ③ 业务应用场景

场景：母婴品牌有 15 个在售 ASIN，运营团队主观认为主力 SKU（月销最高）即为最赚钱 SKU。
通过单品盈利瀑布分析发现： - ASIN-001（月 GMV 8 万元）：净利率仅 3%，因广告花费占 22% 且仓储费超期 - ASIN-007（月 GMV 3 万元）：净利率 28%，广告极低，自然排名稳定 - ASIN-003（月 GMV 5 万元）：亏损 SKU，COGS 过高（工厂报价未更新）
决策：停止对 ASIN-001 的广告扩张，将预算集中到 ASIN-007 和新品；对 ASIN-003 重新议价或停售。月净利润从 1.2 万元提升至 4.8 万元，年化增量利润 43 万元。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30-100 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（99 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd

# 单品盈利瀑布分析

THRESHOLDS = {
    'referral_pct': 0.15,    # 佣金警戒线 15%
    'fulfillment_pct': 0.12, # 配送费警戒线 12%
    'storage_pct': 0.05,     # 仓储费警戒线 5%
    'ad_pct': 0.20,          # 广告警戒线 20%
    'min_net_margin': 0.05,  # 最低净利润率 5%
}


def compute_asin_waterfall(asin_data: pd.DataFrame) -> pd.DataFrame:
    """
    计算每个ASIN的盈利瀑布

    asin_data列: asin, gmv, returns, referral_fee, fulfillment_fee,
                 storage_fee, cogs, ad_spend, freight
    """
    df = asin_data.copy()

    df['net_revenue'] = df['gmv'] - df['returns']
    df['after_referral'] = df['net_revenue'] - df['referral_fee']
    df['after_fulfillment'] = df['after_referral'] - df['fulfillment_fee']
    df['after_storage'] = df['after_fulfillment'] - df['storage_fee']
    df['after_cogs'] = df['after_storage'] - df['cogs']
    df['after_ads'] = df['after_cogs'] - df['ad_spend']
    df['net_profit'] = df['after_ads'] - df['freight']
    df['net_margin'] = df['net_profit'] / df['gmv']

    # 各层占GMV比例
    for col in ['referral_fee', 'fulfillment_fee', 'storage_fee', 'cogs', 'ad_spend', 'freight']:
        df[f'{col}_pct'] = df[col] / df['gmv']

    return df


def generate_alerts(waterfall_df: pd.DataFrame) -> pd.DataFrame:
    """生成超阈值预警"""
    alerts = []
    for _, row in waterfall_df.iterrows():
        row_alerts = []
        if row.get('referral_fee_pct', 0) > THRESHOLDS['referral_pct']:
            row_alerts.append(f"⚠️ 佣金率 {row['referral_fee_pct']:.1%} > {THRESHOLDS['referral_pct']:.0%}")
        if row.get('fulfillment_fee_pct', 0) > THRESHOLDS['fulfillment_pct']:
            row_alerts.append(f"⚠️ 配送费率 {row['fulfillment_fee_pct']:.1%} > 12%")
        if row.get('storage_fee_pct', 0) > THRESHOLDS['storage_pct']:
            row_alerts.append(f"🔴 仓储费率 {row['storage_fee_pct']:.1%} > 5%（积压！）")
        if row.get('ad_spend_pct', 0) > THRESHOLDS['ad_pct']:
            row_alerts.append(f"⚠️ 广告占比 {row['ad_spend_pct']:.1%} > 20%")
        if row.get('net_margin', 0) < THRESHOLDS['min_net_margin']:
            row_alerts.append(f"🔴 净利率 {row['net_margin']:.1%} < 5%（危险！）")

        alerts.append({'asin': row['asin'], '预警': ' | '.join(row_alerts) if row_alerts else '✅ 正常'})

    return pd.DataFrame(alerts)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.07715，但该号在 arXiv 上是《How to Test the Randomness from the Wireless Channel for Security?》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Waterfall: A Scalable Framework for Profit Attribution in ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：ASIN 级数据列：asin、gmv、returns、referral_fee、fulfillment_fee、storage_fee、cogs、ad_spend 与 freight，粒度到 ASIN 与统计周期。

**输出**：每个 ASIN 的盈利瀑布明细、各层占 GMV 比例、净利率排名与预警清单（佣金、配送、仓储、广告、净利率五类警戒线）。

## 执行步骤

1. 按 ASIN 汇总 GMV 与各项费用
2. 逐层扣减算出各层占比与净利润率
3. 对照五项警戒线生成预警清单
4. 排出净利率榜并给出预算再分配建议

## 边界与不做

- 缺少 ASIN 级广告费或运费明细时不适用，瀑布会在广告或运费层断裂
- 只做盈利分析与预警，不自动停售、改价或调整广告
- 警戒线阈值须按品类校准，单品成本结构不对外披露

## 技能关联

- **可组合**：Skill-Profitability-Waterfall-By-ASIN

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-Profitability-Waterfall-By-ASIN`