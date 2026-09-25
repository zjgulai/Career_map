---
name: "p2s-fba-fee-waterfall-attribution"
title: "Skill-FBA-Fee-Waterfall-Attribution — FBA费用瀑布归因"
description: "触发词：FBA 费用瀑布、费用归因、帕累托分析、掉利润定位、配送费超标。何时不用：只要 ASIN 级费用率与库龄预警用「FBA 费用结构分析」；要把头程与退货一并摊到每单利润用「物流成本 P&L 归因」。安全边界：结论只作内部成本优化，不对外披露成本结构，避免被竞品反推。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-120"
l3_business: "收入与费用核对"
l3_all: "收入与费用核对 / 差异追踪"
l1_l2_l3: "业务运营/财务与合规/收入与费用核对"
p2s_card_id: "Skill-FBA-Fee-Waterfall-Attribution"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把配送费、仓储费、长库龄费等逐层扣减，找出吃掉利润的那一层，并锁定贡献八成费用的少数 SKU。"
user_try: "试试：把这个月的 FBA 账单做瀑布归因，指出费用超标的是哪一层，并列出贡献 80% 费用的 SKU 清单。"
whenToUse: "要按费用层级看利润被哪一层吃掉、并用帕累托锁定高费用集群时用本技能；只要 ASIN 级费用率与库龄预警用「FBA 费用结构分析」；要把头程与退货一并拆到每单利润用「物流成本 P&L 归因」。"
workflow: "按 SKU 汇总 GMV 与配送费、仓储费、长库龄费、移仓费、退货费 → 逐层扣减算出各层占 GMV 比例与净利润 → 用帕累托分析锁定贡献 80% 费用的 SKU 集群 → 对超标层级给出改包装、清仓或减少备货的优化行动"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-FBA-Fee-Waterfall-Attribution — FBA费用瀑布归因

## ① 解决的问题

运营面临"FBA月账单20万元但不知道哪类费用在吃利润"——逐层瀑布归因将仓储/配送/LTSF/移仓费分解到SKU粒度，锁定高费用集群，年化节省FBA费用15-30万元

## ② 核心算法逻辑

论文：Waterfall Attribution Model for Ecommerce Logistics Cost Decomposition | 年份：2021

## ③ 业务应用场景

场景：某母婴品牌销售婴儿推车（Oversize），月销 500 单，GMV 15 万美元。卖家认为净利率约 15%，但实际账单显示亏损。
通过 FBA 费用瀑布归因发现： - 配送费因尺寸超标（Oversize Tier 2）达到 GMV 的 18%（行业均值 9%） - 仓储费因积压 120 天库存，月均支出 2,400 美元 - LTSF 触发：3 批次共 80 件超过 181 天，罚款 1,600 美元/月
优化行动： - 重新包装缩小至 Large Standard，配送费率降至 12% - 设置 90 天库存预警线，提前促销清仓 - 结果：净利率从 -3% 修复至 +11%，年化节省 14 万美元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10-30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（77 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd

# FBA费用瀑布归因模型

def compute_fba_waterfall(orders_df: pd.DataFrame) -> pd.DataFrame:
    """
    计算每个SKU的FBA费用瀑布归因

    输入列: sku, gmv, fulfillment_fee, storage_fee, ltsf_fee,
            placement_fee, return_fee, referral_rate, cogs, ad_spend
    输出: 含各层费用占比和净利润的瀑布DataFrame
    """
    df = orders_df.copy()

    df['referral_fee'] = df['gmv'] * df['referral_rate']
    df['total_fba_fee'] = (
        df['fulfillment_fee'] +
        df['storage_fee'] +
        df['ltsf_fee'] +
        df['placement_fee'] +
        df['return_fee']
    )
    df['net_profit'] = (
        df['gmv']
        - df['referral_fee']
        - df['total_fba_fee']
        - df['ad_spend']
        - df['cogs']
    )
    df['net_margin'] = df['net_profit'] / df['gmv']

    # 各层占GMV比例
    for col in ['referral_fee', 'fulfillment_fee', 'storage_fee',
                'ltsf_fee', 'placement_fee', 'return_fee', 'ad_spend', 'cogs']:
        df[f'{col}_pct'] = df[col] / df['gmv']

    return df


def pareto_fee_analysis(waterfall_df: pd.DataFrame, fee_col: str = 'total_fba_fee'):
    """帕累托分析：找出贡献80%费用的SKU集群"""
    df = waterfall_df.sort_values(fee_col, ascending=False).copy()
    df['cumulative_fee'] = df[fee_col].cumsum()
    df['cumulative_pct'] = df['cumulative_fee'] / df[fee_col].sum()
    top80 = df[df['cumulative_pct'] <= 0.8]
    return top80[['sku', fee_col, 'cumulative_pct', 'net_margin']]


# ── 测试 ──
if __name__ == '__main__':
    np.random.seed(42)
    n = 20
    skus = [f'SKU-{i:03d}' for i in range(n)]

    data = pd.DataFrame({
        'sku': skus,
        'gmv': np.random.uniform(3000, 15000, n),
        'fulfillment_fee': np.random.uniform(300, 2000, n),
        'storage_fee': np.random.uniform(50, 500, n),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.12345，但该号在 arXiv 上是《On a new statistical technique for the real-time recognition of ultra-low multiplicity astrophysical neutrino burst》，与本卡主题无关。
⚠️ 该号被 16 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Waterfall Attribution Model for Ecommerce Logistics Cost Decomposition》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：订单或账单明细，列需包含 sku、gmv、fulfillment_fee、storage_fee、ltsf_fee、placement_fee、return_fee、referral_rate、cogs、ad_spend，粒度到 SKU。

**输出**：含各层费用占比、净利润率与帕累托高费用集群的瀑布结果，供运营定位超标层级并排定改包装、清仓或减少备货的优化动作。

## 执行步骤

1. 按 SKU 汇总 GMV 与各层 FBA 费用
2. 逐层扣减计算各层占 GMV 比例与净利润率
3. 用帕累托分析锁定贡献 80% 费用的 SKU 集群
4. 对超标层级输出改包装、清仓或减少备货的优化动作

## 边界与不做

- 只有总额账单、拿不到逐层费用明细时不适用，瀑布无法拆到层级
- 只做费用归因与优化建议，不自动改价、改包装或下架 SKU
- 成本结构属敏感经营信息，结论只作内部优化，不对外披露

## 技能关联

- **可组合**：Skill-FBA-Fee-Waterfall-Attribution

---

> 分类：业务运营/财务与合规/收入与费用核对　·　技术族：23-运营财务　·　源卡：`Skill-FBA-Fee-Waterfall-Attribution`