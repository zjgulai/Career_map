---
name: "p2s-advertising-tacos-pnl-integration"
title: "Skill-Advertising-TACOS-PnL-Integration — 广告TACoS与P&L集成"
description: "触发词：TACoS 分析、广告归因、SKU 净利率、新品广告摊销、预算削减评估。何时不用：要算促销增量与供应侧成本用「促销供应侧 ROI」；要评估推荐位带来的增量 GMV 用「推荐系统财务归因」。安全边界：投放受平台政策约束，不得据本卡结论自动调价或无限加预算；削减预算前须保留人工审核。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 投放诊断"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Advertising-TACOS-PnL-Integration"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把广告费按 SKU 归因重建净利率，把新品的开品投入按月摊销，回答削广告费到底会不会伤到净利。"
user_try: "试试：按品牌词、泛词、竞品词分别算 TACoS，重建 SKU 净利率，评估砍掉 30% 广告预算的影响。"
whenToUse: "需要判断广告预算该不该削、广告费如何按 SKU 归因并摊销新品投入时用本技能；算促销增量与供应侧成本用「促销供应侧 ROI」；评估推荐位增量用「推荐系统财务归因」。"
workflow: "按品牌词、泛词、竞品词分别计算 TACoS → 重建含广告归因的 SKU 级 P&L 并算出净利率 → 对新品初期高 TACoS 按月摊销处理 → 输出各词类投放建议与预算调整影响测算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Advertising-TACOS-PnL-Integration — 广告TACoS与P&L集成

## ① 解决的问题

卖家面临"广告TACoS 13%财务要求砍预算但不清楚削减是否会伤净利"——广告P&L集成将广告费按SKU归因重建净利率，把新品高TACoS摊销处理，正确决策年化保护利润29万元

## ② 核心算法逻辑

论文：TACoSAttributed P&L: A Hierarchical Framework for Advertising Profitability in ECommerce | 年份：2021

## ③ 业务应用场景

场景：母婴品牌月广告花费 8 万元，总销售额 60 万元，TACoS = 13.3%。财务认为广告费用过高，计划削减 30%。
通过 TACoS × P&L 集成分析： - 品牌词 TACoS 仅 3%（高效，维持） - 泛词 TACoS 22%（新品开品投入，应摊销处理） - 竞品词 TACoS 8%（合理，保持）
重建 SKU 级 P&L 后发现： - 主力 SKU（月销 200 单）广告归因净利率 18%，远高于平均 - 新品 SKU 广告投入摊销后，第 6 个月才进入盈利期

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

15-60 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（89 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd

# 广告TACoS与P&L集成模型

def compute_tacos(ad_spend: float, total_sales: float) -> float:
    """计算TACoS"""
    if total_sales == 0:
        return float('inf')
    return ad_spend / total_sales


def rebuild_sku_pnl_with_ads(sku_data: pd.DataFrame) -> pd.DataFrame:
    """
    重建含广告归因的SKU级P&L

    sku_data列: sku, gmv, cogs, fba_fee, referral_rate,
                ad_spend_direct, ad_spend_brand, ad_sales_direct,
                natural_sales, total_sales
    """
    df = sku_data.copy()
    df['referral_fee'] = df['gmv'] * df['referral_rate']
    df['total_ad_spend'] = df['ad_spend_direct'] + df['ad_spend_brand']
    df['tacos'] = df['total_ad_spend'] / df['total_sales']
    df['acos'] = df['ad_spend_direct'] / df['ad_sales_direct'].clip(lower=0.01)

    df['gross_profit'] = (
        df['gmv'] - df['cogs'] - df['fba_fee'] - df['referral_fee']
    )
    df['gross_margin'] = df['gross_profit'] / df['gmv']

    df['net_profit_with_ads'] = df['gross_profit'] - df['total_ad_spend']
    df['net_margin_with_ads'] = df['net_profit_with_ads'] / df['gmv']

    return df[['sku', 'gmv', 'gross_margin', 'tacos', 'acos',
               'net_profit_with_ads', 'net_margin_with_ads']]


def ad_amortization_model(
    new_product_ad_spend_monthly: float,
    amortization_months: int = 12,
    n_months: int = 18
) -> pd.DataFrame:
    """新品广告摊销模型：将初期高TACoS按月摊销"""
    rows = []
    for m in range(1, n_months + 1):
        # 前期高投入，后期降低
        if m <= 6:
            spend = new_product_ad_spend_monthly * 1.5
        else:
            spend = new_product_ad_spend_monthly * 0.7

        # 摊销额：前12个月平均摊销
        amortized = new_product_ad_spend_monthly * 6 / amortization_months

        rows.append({
            '月份': m,
            '实际广告花费': round(spend, 0),
            'P&L摊销计提': round(amortized, 0),
            '现金差异': round(spend - amortized, 0),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.12345，但该号在 arXiv 上是《On a new statistical technique for the real-time recognition of ultra-low multiplicity astrophysical neutrino burst》，与本卡主题无关。
⚠️ 该号被 16 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《TACoSAttributed P&L: A Hierarchical Framework for Advertising Profitability in ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 级数据列需含 gmv、cogs、fba_fee、referral_rate、ad_spend_direct、ad_spend_brand、ad_sales_direct、natural_sales 与 total_sales。

**输出**：含广告归因的 SKU 级 P&L（毛利率、TACoS、ACOS、净利率），以及新品广告摊销表与各词类投放建议。

## 执行步骤

1. 按品牌词、泛词与竞品词拆分广告花费与销售
2. 重建含广告归因的 SKU 级 P&L
3. 对新品初期高投入按月摊销后重算净利率
4. 输出词类投放建议与预算调整影响评估

## 边界与不做

- 广告花费无法按词类或 SKU 拆分、或缺少自然单与广告单口径时不适用
- 只做财务归因与建议，不自动调预算或出价，预算调整需人工审核
- 投放动作受平台政策约束，摊销口径属管理会计处理，不可直接用于对外报表

## 技能关联

- **可组合**：Skill-Advertising-TACOS-PnL-Integration

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-Advertising-TACOS-PnL-Integration`