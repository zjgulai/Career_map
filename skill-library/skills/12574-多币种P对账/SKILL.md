---
name: "p2s-multi-currency-pnl-reconciliation"
title: "Skill-Multi-Currency-PnL-Reconciliation — 多币种P&L对账"
description: "触发词：多币种对账、汇兑损益、功能货币折算、汇率敞口、经营利润区分。何时不用：要审跨境采购合同条款风险时用「LLM 合同合规审查」，要核多市场合规要求时用「多市场合规矩阵本体」。安全边界：对账结果仅供内部经营判断，银行流水与账户明细须按财务权限访问。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-126"
l3_business: "实体口径核对"
l3_all: "实体口径核对 / 收入与费用核对"
l1_l2_l3: "独立控制/财务与合规/实体口径核对"
p2s_card_id: "Skill-Multi-Currency-PnL-Reconciliation"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "利润掉了 2 万，到底是本币贬值还是生意变差，把汇兑损益剥出来看，别急着砍广告预算。"
user_try: "试试：把我美国、英国、日本三地的收支按功能货币折算，剥离汇兑损益，告诉我真实经营利润和汇率敞口。"
whenToUse: "多币种报表出现利润波动、需要区分汇率影响与经营变化时用；要审采购合同条款风险时用「LLM 合同合规审查」；要核多市场合规要求时用「多市场合规矩阵本体」。"
workflow: "汇总各币种交易流水并标注日期、币种、金额与科目 → 按月度汇率把各币种折算为功能货币 → 单列汇兑损益并剥离其影响 → 重算经营性利润并做同比对比 → 量化汇率敞口并给出对冲建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Multi-Currency-PnL-Reconciliation — 多币种P&L对账

## ① 解决的问题

跨境卖家面临"欧元贬值5%导致报表利润下降2万元但不确定是汇率还是经营问题"——多币种P&L对账剥离汇兑损益，正确区分经营利润与汇率波动，年化避免错误决策损失10-50万元

## ② 核心算法逻辑

论文：MultiCurrency Financial Statement Translation with FX Exposure Decomposition | 年份：2021

## ③ 业务应用场景

场景：母婴品牌在美国（月收入 USD 30,000）、英国（GBP 8,000）、日本（JPY 500,000）同时运营。2024 年 Q3 欧元对人民币贬值 5%，导致财务报告显示"月利润下降 2 万元"，但实际经营并无恶化。
通过多币种 P&L 对账： - 剥离汇兑损益：英镑贬值导致汇兑损失 1.8 万元 - 经营性利润实际同比增长 3% - 识别出每月约 1.2 万元的汇率敞口需要对冲
决策支撑：财务总监借此正确区分"汇率问题"和"经营问题"，避免错误削减广告预算。年化避免错误决策损失约 20 万元。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10-50 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（84 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd

# 多币种P&L对账模型

FUNCTIONAL_CURRENCY = 'CNY'

def apply_fx_rates(transactions: pd.DataFrame, fx_rates: dict) -> pd.DataFrame:
    """
    将多币种交易折算为功能货币

    transactions列: date, currency, amount, category
    fx_rates: {'USD': {'2024-01': 7.1, ...}, 'GBP': {...}, ...}
    """
    df = transactions.copy()
    df['ym'] = pd.to_datetime(df['date']).dt.to_period('M').astype(str)

    def get_rate(row):
        if row['currency'] == FUNCTIONAL_CURRENCY:
            return 1.0
        rates = fx_rates.get(row['currency'], {})
        return rates.get(row['ym'], rates.get('default', 1.0))

    df['fx_rate'] = df.apply(get_rate, axis=1)
    df['amount_cny'] = df['amount'] * df['fx_rate']
    return df


def compute_monthly_pnl(transactions_cny: pd.DataFrame) -> pd.DataFrame:
    """按月汇总功能货币P&L"""
    df = transactions_cny.copy()
    df['ym'] = pd.to_datetime(df['date']).dt.to_period('M').astype(str)

    pivot = df.groupby(['ym', 'category'])['amount_cny'].sum().unstack(fill_value=0)
    if 'revenue' in pivot.columns and 'cogs' in pivot.columns:
        pivot['gross_profit'] = pivot.get('revenue', 0) - pivot.get('cogs', 0)
    if 'fx_gain_loss' in pivot.columns:
        pivot['operating_profit'] = pivot.get('gross_profit', 0) - pivot.get('opex', 0)
        pivot['net_profit'] = pivot['operating_profit'] + pivot['fx_gain_loss']
    return pivot


def compute_fx_exposure(open_positions: pd.DataFrame, rate_change_pct: float = 0.05) -> pd.DataFrame:
    """计算未对冲汇率敞口的潜在损益"""
    df = open_positions.copy()
    df['potential_fx_impact'] = df['amount_foreign'] * df['current_rate'] * rate_change_pct
    return df[['currency', 'amount_foreign', 'current_rate', 'potential_fx_impact']]


# ── 测试 ──
if __name__ == '__main__':
    fx_rates = {
        'USD': {'2024-07': 7.15, '2024-08': 7.18, 'default': 7.10},
        'GBP': {'2024-07': 9.05, '2024-08': 8.98, 'default': 9.00},
        'JPY': {'2024-07': 0.047, '2024-08': 0.046, 'default': 0.047},
    }

    np.random.seed(42)
    dates = pd.date_range('2024-07-01', periods=60).tolist()
    currencies = np.random.choice(['USD', 'GBP', 'JPY', 'CNY'], 60)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.09876，但该号在 arXiv 上是《Anomaly Detection in Dynamic Graphs via Transformer》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《MultiCurrency Financial Statement Translation with FX Exposure Decomposition》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：多币种交易流水（列：date、currency、amount、category）与各币种月度汇率表；功能货币口径默认 CNY；粒度：单笔交易 × 月度汇率。

**输出**：折算后的多币种 P&L：汇兑损益单列（如英镑贬值导致汇兑损失 1.8 万元）、经营性利润同比（如实际增长 3%）与每月汇率敞口测算（如约 1.2 万元需对冲）；供财务总监与业务负责人区分汇率问题与经营问题。

## 执行步骤

1. 汇总多币种交易流水与汇率表
2. 按月度汇率折算为功能货币
3. 单列汇兑损益并剥离影响
4. 重算经营性利润并做同比对比
5. 量化汇率敞口并给出对冲建议

## 边界与不做

- 数据不满足时不用：缺月度汇率表、或交易流水的币种与日期字段不全时，折算与损益剥离都不成立。
- 能力边界：只做口径折算、损益剥离与敞口测算，不执行结汇或对冲交易，也不替代审计意见。
- 合规边界：银行流水与账户明细属敏感财务数据，须按财务权限与最小可见范围使用。

## 技能关联

- **可组合**：Skill-Multi-Currency-PnL-Reconciliation

---

> 分类：独立控制/财务与合规/实体口径核对　·　技术族：23-运营财务　·　源卡：`Skill-Multi-Currency-PnL-Reconciliation`