---
name: "p2s-lead-time-demand-integration-model"
title: "Lead Time Demand Integration Model — 前置期×需求联合分布建模缺货概率量化"
description: "触发词：前置期需求联合建模、蒙特卡洛缺货概率、安全库存覆盖天数、前置期波动、分位数再订货点。何时不用：前置期稳定、只按固定交期算安全库存时用「安全库存与补货策略」；要单独拟合前置期分布做延误预警时走「提前期分布建模」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Lead-Time-Demand-Integration-Model"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把前置期和需求的波动放在一起模拟，看清缺货概率到底多大、安全库存该覆盖多少天。"
user_try: "试试：前置期 38±7 天、日销 80±25 件，按 95% 服务水平算安全库存与缺货概率。"
whenToUse: "前置期波动大（跨境海运、清关不稳定）、固定前置期假设已导致缺货超标时用；前置期稳定、只缺需求分布时用「安全库存与补货策略」即可。"
workflow: "采集日需求与前置期的均值方差 → 选择蒙特卡洛（对数正态前置期）或解析正态公式 → 计算前置期内总需求的分位数 → 换算安全库存与再订货点 → 按旺季前置期方差复核并动态上调"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Lead Time Demand Integration Model — 前置期×需求联合分布建模缺货概率量化

## ① 解决的问题

跨境备货运营面临"前置期28-55天波动大用固定45天安全库存缺货率高达8%"——联合分布蒙特卡洛建模将缺货率从8%降至2.5%，年化减少缺货损失30万元

## ② 核心算法逻辑

核心问题：补货决策必须同时面对两个不确定性——前置期（Lead Time）有多长？这段时间内需求有多大？两者相互独立但效果叠加：前置期拉长的同时需求暴涨，缺货概率不是简单相加而是「联合暴涨」。

## ③ 业务应用场景

场景：某母婴卖家从广州工厂发货至 FBA，前置期历史在 28-55 天（均值 38 天，标准差 7 天）；日销量均值 80 件，标准差 25 件。过去采用固定 45 天安全库存，实际缺货率 8%（目标 3%）。
联合建模应用：识别出前置期方差大（CV=18%）是主要风险源，安全库存需提升至 52 天等效覆盖量，而非单纯加 7 天缓冲。
量化产出：缺货率从 8% 降至 2.5%（达标），同时发现旺季前置期标准差翻倍（14 天），旺季安全库存动态调高 40%，年化缺货损失减少 30 万元。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（70 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy import stats

def lead_time_demand_model(
    mu_d: float, sigma_d: float,
    mu_L: float, sigma_L: float,
    service_level: float = 0.95,
    n_simulations: int = 10000,
    use_simulation: bool = True
) -> dict:
    """
    前置期×需求联合分布建模
    mu_d, sigma_d: 日需求均值和标准差
    mu_L, sigma_L: 前置期（天）均值和标准差
    service_level: 目标服务水平
    """
    if use_simulation:
        # 蒙特卡洛模拟（非正态鲁棒）
        np.random.seed(42)
        # 前置期服从对数正态（跨境物流常见）
        ln_mu = np.log(mu_L ** 2 / np.sqrt(mu_L ** 2 + sigma_L ** 2))
        ln_sigma = np.sqrt(np.log(1 + (sigma_L / mu_L) ** 2))
        lead_times = np.random.lognormal(ln_mu, ln_sigma, n_simulations)
        lead_times = np.maximum(1, lead_times).astype(int)

        # 每次模拟前置期内的总需求
        total_demands = []
        for L in lead_times:
            daily = np.maximum(0, np.random.normal(mu_d, sigma_d, L))
            total_demands.append(daily.sum())
        total_demands = np.array(total_demands)

    else:
        # 解析公式（正态假设）
        mean_DL = mu_d * mu_L
        var_DL = sigma_d ** 2 * mu_L + mu_d ** 2 * sigma_L ** 2
        total_demands = np.random.normal(mean_DL, np.sqrt(var_DL), n_simulations)

    mean_DL = np.mean(total_demands)
    z_alpha = stats.norm.ppf(service_level)
    safety_stock = np.quantile(total_demands, service_level) - mean_DL
    reorder_point = np.quantile(total_demands, service_level)

    return {
        'mean_lead_time_demand': mean_DL,
        'safety_stock': safety_stock,
        'reorder_point': reorder_point,
        'service_level_achieved': service_level,
        'demand_distribution': {
            'p50': np.quantile(total_demands, 0.5),
            'p90': np.quantile(total_demands, 0.9),
            'p95': np.quantile(total_demands, 0.95),
            'p99': np.quantile(total_demands, 0.99)
        }
    }

# 测试
result = lead_time_demand_model(
    mu_d=80, sigma_d=25,
    mu_L=38, sigma_L=7,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：日需求均值与标准差、前置期天数均值与标准差、目标服务水平与模拟次数；前置期按对数正态处理，单 SKU 粒度。

**输出**：前置期内需求均值、安全库存、再订货点与达成服务水平，以及总需求 P50/P90/P95/P99 分位数，供安全库存与补货参数设置。

## 执行步骤

1. 收集日需求与前置期的均值、标准差
2. 按前置期分布抽样模拟前置期内总需求
3. 从分位数反推安全库存与再订货点
4. 对比固定前置期做法的缺货率差异
5. 输出分位数覆盖量与建议参数

## 边界与不做

- 数据不满足时不适用：没有前置期历史分布只有承诺天数、或日销量只有月度汇总时，联合分布建模失真。
- 能力边界：只算安全库存与缺货概率，不决定下单批次，也不处理多 SKU 预算切分。

## 技能关联

- **可组合**：Skill-Lead-Time-Demand-Integration-Model

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：03-时间序列　·　源卡：`Skill-Lead-Time-Demand-Integration-Model`