---
name: "p2s-working-capital-cycle-optimizer"
title: "Skill-Working-Capital-Cycle-Optimizer — 营运资金周期优化"
description: "触发词：营运资金周期、WCC模拟、蒙特卡洛、流动资金需求、策略对比。何时不用：需要 DIO/DSO/DPO 三角诊断与多平台打款周期对比时用「供应链营运资金优化」；只做旺季备货缺口压力测试时用「营运资金压力测试」。安全边界：只做内部资金测算，不代改账期与渠道；模拟参数须与实际财务口径一致。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-014"
l3_business: "资金预测"
l3_all: "资金预测 / 经济性分析"
l1_l2_l3: "经营管理/财务与合规/资金预测"
p2s_card_id: "Skill-Working-Capital-Cycle-Optimizer"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "用模拟的方式看营运资金周期能压到多少天、要垫多少流动资金，再比较几套优化策略。"
user_try: "试试：对我的 DIO、DSO、DPO 做蒙特卡洛模拟，给出资金需求区间和几套优化策略的对比。"
whenToUse: "需要对营运资金周期做概率分布模拟并比较多种优化策略时用；做三角指标拆解与平台打款周期对比时用「供应链营运资金优化」；做旺季缺口压力测试时用「营运资金压力测试」。"
workflow: "采集 DIO/DSO/DPO 均值与波动 → 蒙特卡洛模拟周期分布 → 换算流动资金需求与成本 → 输出策略对比与推荐"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Working-Capital-Cycle-Optimizer — 营运资金周期优化

## ① 解决的问题

财务总监面临"月销500万但流动资金缺口达800万撑不住旺季"——营运资金周期建模将DIO+DSO-DPO从66天压缩至9天，释放流动资金700万元，年化资金成本节省112万元

## ② 核心算法逻辑

论文：Monte Carlo Simulation for Working Capital Optimization in ECommerce Supply Chains | 年份：2021

## ③ 业务应用场景

场景：母婴卖家月销售额 50 万元，供应商要求 30 天付款，Amazon 结算周期 21 天，库存周转天数 75 天。
当前 WCC = 75 + 21 - 30 = 66 天，意味着需要垫付约 66 天的资金（约 110 万元流动资金）。
优化方案： - 通过需求预测将 DIO 压缩至 55 天 - 谈判供应商账期延长至 60 天 - 申请 Amazon Lending 将 DSO 实际效果降至 14 天

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

50-200 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（76 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd

# 营运资金周期优化模型

def compute_wcc(dio: float, dso: float, dpo: float) -> float:
    """计算营运资金周期（天）"""
    return dio + dso - dpo


def working_capital_required(monthly_sales: float, wcc_days: float) -> float:
    """估算所需流动资金"""
    daily_sales = monthly_sales / 30
    return daily_sales * wcc_days


def monte_carlo_wcc_simulation(
    dio_mean: float, dio_std: float,
    dso_mean: float, dso_std: float,
    dpo_mean: float, dpo_std: float,
    n_simulations: int = 10000
) -> dict:
    """蒙特卡洛模拟WCC分布，评估策略风险"""
    np.random.seed(42)
    dio_samples = np.random.normal(dio_mean, dio_std, n_simulations)
    dso_samples = np.random.normal(dso_mean, dso_std, n_simulations)
    dpo_samples = np.random.normal(dpo_mean, dpo_std, n_simulations)

    wcc_samples = dio_samples + dso_samples - dpo_samples

    return {
        'wcc_mean': np.mean(wcc_samples),
        'wcc_p5': np.percentile(wcc_samples, 5),
        'wcc_p95': np.percentile(wcc_samples, 95),
        'wcc_std': np.std(wcc_samples),
    }


def compare_strategies(monthly_sales: float, annual_cost_rate: float = 0.16) -> pd.DataFrame:
    """对比不同策略的资金成本节省"""
    strategies = [
        {'name': '当前状态', 'dio': 75, 'dso': 21, 'dpo': 30},
        {'name': '优化DIO', 'dio': 55, 'dso': 21, 'dpo': 30},
        {'name': '优化DIO+DPO', 'dio': 55, 'dso': 21, 'dpo': 60},
        {'name': '全面优化', 'dio': 55, 'dso': 14, 'dpo': 60},
    ]
    results = []
    for s in strategies:
        wcc = compute_wcc(s['dio'], s['dso'], s['dpo'])
        wc = working_capital_required(monthly_sales, wcc)
        annual_cost = wc * annual_cost_rate
        results.append({
            '策略': s['name'],
            'WCC(天)': wcc,
            '所需流动资金(万元)': round(wc / 10000, 1),
            '年化资金成本(万元)': round(annual_cost / 10000, 1),
        })
    df = pd.DataFrame(results)
    base_cost = df['年化资金成本(万元)'].iloc[0]
    df['年化节省(万元)'] = base_cost - df['年化资金成本(万元)']
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.09876，但该号在 arXiv 上是《Anomaly Detection in Dynamic Graphs via Transformer》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Monte Carlo Simulation for Working Capital Optimization in ECommerce Supply Chains》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：DIO、DSO、DPO 的均值与波动（或历史分布）、月销售额与年化资金成本率；粒度：月度指标，可含多策略假设。

**输出**：营运资金周期分布（均值、P5/P95、标准差）、所需流动资金测算与各策略对比表，供财务选择优化方案。

## 执行步骤

1. 采集 DIO、DSO、DPO 的历史均值与波动
2. 蒙特卡洛模拟周期分布并取分位点
3. 按月销售额换算流动资金需求量
4. 对比不同优化策略下的周期与资金成本
5. 输出推荐策略与风险区间

## 边界与不做

- 数据不满足时不用：只有单点估计、没有波动或历史分布时，模拟退化为确定性计算，P95 结论不可用。
- 能力边界：只做模拟与策略比选，不代谈账期、不代申请融资；参数变更须财务确认。

## 技能关联

- **可组合**：Skill-Working-Capital-Cycle-Optimizer

---

> 分类：经营管理/财务与合规/资金预测　·　技术族：23-运营财务　·　源卡：`Skill-Working-Capital-Cycle-Optimizer`