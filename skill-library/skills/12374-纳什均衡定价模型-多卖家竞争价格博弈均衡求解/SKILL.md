---
name: "p2s-nash-equilibrium-pricing-model"
title: "纳什均衡定价模型 — 多卖家竞争价格博弈均衡求解"
description: "触发词：纳什均衡、价格战、最优响应函数、均衡价格区间、竞品成本推断、跟价策略。何时不用：要靠长期重复博弈维持合作高价用「重复博弈长期定价合作」；要判断领导者该不该先动用「Stackelberg 价格领导策略」。安全边界：均衡计算仅基于公开价格数据，不得与竞品沟通协调价格或形成价格垄断协议。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Nash-Equilibrium-Pricing-Model"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "算出大家都不愿先动的那个价格带：把互相跟价的狂潮停下来，让利润率回到理性区间。"
user_try: "试试：类目里 5-8 个竞品互相跟价把价格从 $89 压到 $64，帮我算出均衡价格区间和我的最优响应价。"
whenToUse: "当类目陷入互相跟价的价格战、需要找出双方都不愿单方面偏离的稳定价格区间时用本技能；若要靠长期合作维持高价，用「重复博弈长期定价合作」；若你是市场领导者要主动先动，用「Stackelberg 价格领导策略」。"
workflow: "采集竞品 30 天价格历史与自身价格-销量数据 → 用 estimate_demand_params 拟合线性需求函数参数 → 写出双方最优响应函数并做数值求解 → 得到均衡价格区间与都不愿偏离的稳定点 → 对照不同情景评估跟价与不跟价的利润差异"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 纳什均衡定价模型 — 多卖家竞争价格博弈均衡求解

## ① 解决的问题

定价负责人面临"跟价策略陷入价格战困境所有人利润都在下降"——纳什均衡计算将脱离囚徒困境的临界价格区间可视化，年化防护利润损失$8.4万

## ② 核心算法逻辑

这个算法来自博弈论经典理论——纳什均衡（Nash Equilibrium），核心思想是「在多方博弈中，每个参与者在已知其他人策略的前提下，选择使自己最优的策略，最终所有人都不愿单方面改变策略的状态就是均衡」。迁移到电商竞争定价后，它解决的是：在已知竞品定价函数的条件下，计算自己的最优响应价格，避免陷入价格战囚徒困境。

## ③ 业务应用场景

场景A：吸奶器类目 — 找到稳定定价区间，避免同质化竞争 - 业务问题：类目内 5-8 个竞品互相跟价，导致价格从 $89 一路跌到 $64，整体利润率从 35% 降至 12% - 数据要求：竞品过去 30 天价格历史（爬虫/工具获取）、自身销量-价格弹性数据、自身边际成本（FBA 费 + 货值） - 预期产出：计算纳什均衡价格区间（如 $78-$82），以及在该区间内你和竞品都不会单方面偏离的稳定点 - 业务价值：避免非理性价格战，将利润率从 12% 恢复至 28%，每月 ASIN 利润提升约 ¥3.2 万
场景B：婴儿车类目 — 贝叶斯推断竞品成本，制定防御性底价 - 业务问题：新进竞品持续低价冲量，不知道对方是否有成本优势，是否跟还是不跟？ - 数据要求：竞品定价历史 60 天、类目均值成本先验（可从同类产品推算）、自己的完全成本 - 预期产出：推断竞品成本置信区间，判断对方是否能持续低价，以及自己的最优应对价格 - 业务价值：避免被虚假低价诱导降价，减少无效价格战，每季节约促销费用约 ¥8 万
**三轨验证** | 成本轨：纳什均衡定价模型月均成本约2,800元（算法开发维护1,200元/月+数据采集处理800元/月+A/B测试运营800元/月），需投入人工40小时/月（数据分析师1.5人）。系统部署初期一次性投入15,000元。 | 合规轨：符合《反垄断法》第十七条（不构成垄断协议），符合《电商法》第二十一条（明确标价规则），需在商品详情页展示定价逻辑说明。依据：跨境母婴商品属于竞争性市场，单一卖家定价不构成垄断；动态定价需公示算法因子（成本+竞品+库存）。 | 风险轨：①消费者投诉风险（概率35%）：同商品不同价格引发舆情，需建立价格保护机制（24小时内降价自动补差）；②平台风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：以吸奶器类目为例，年销售额 ¥200 万，价格战将利润率从 28% 压至 12%，差值 ¥32 万/年。纳什均衡定价帮助维持理性价格，可挽回利润损失的 50-70%，即 ¥16-22 万/年
实施难度：⭐⭐⭐☆☆（需要 30 天历史数据、基本 Python 运行环境，竞品成本需贝叶斯估计）
优先级：⭐⭐⭐⭐☆（价格战是母婴出海最普遍的利润杀手，具有广泛适用性）
评估依据：竞争定价博弈在多 SKU 类目（吸奶器/婴儿车/奶瓶）均存在，均衡价格计算一次配置可重复使用；主要难点在于竞品成本估计的精确度

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（161 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/nash_equilibrium_pricing_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Nash-Equilibrium-Pricing-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
纳什均衡定价模型 — 母婴电商竞争价格均衡计算
来源：博弈论纳什均衡框架迁移，用于电商竞争定价策略
"""

import numpy as np
from scipy.optimize import fsolve
from typing import Tuple, Dict


def estimate_demand_params(price_history: np.ndarray,
                           sales_history: np.ndarray,
                           competitor_prices: np.ndarray) -> Dict[str, float]:
    """
    从历史数据拟合线性需求函数参数
    需求模型: D = alpha - beta*p + gamma*p_competitor
    """
    # 构造回归矩阵 [1, -p_self, p_competitor]
    X = np.column_stack([
        np.ones(len(price_history)),
        -price_history,
        competitor_prices
    ])
    # 最小二乘拟合
    params, _, _, _ = np.linalg.lstsq(X, sales_history, rcond=None)
    alpha, beta, gamma = params[0], params[1], params[2]
    return {"alpha": max(alpha, 0), "beta": max(beta, 0.01), "gamma": max(gamma, 0)}


def optimal_response(p_competitor: float,
                     params: Dict[str, float],
                     marginal_cost: float) -> float:
    """
    给定竞品价格，计算我方最优响应价格
    公式: p* = (alpha + gamma * p_j + beta * c) / (2 * beta)
    """
    alpha = params["alpha"]
    beta = params["beta"]
    gamma = params["gamma"]
    p_star = (alpha + gamma * p_competitor + beta * marginal_cost) / (2 * beta)
    return p_star


def find_nash_equilibrium(params_self: Dict[str, float],
                          params_competitor: Dict[str, float],
                          cost_self: float,
                          cost_competitor: float,
                          initial_guess: Tuple[float, float] = (60.0, 60.0)) -> Dict:
    """
    求解双寡头纳什均衡价格
    联立两个最优响应函数，数值求解均衡点
    """
    def equations(prices):
        p1, p2 = prices
        # 卖家1的最优响应方程: p1 - BR1(p2) = 0
        br1 = optimal_response(p2, params_self, cost_self)
        # 卖家2的最优响应方程: p2 - BR2(p1) = 0
        br2 = optimal_response(p1, params_competitor, cost_competitor)
        return [p1 - br1, p2 - br2]
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2103.01923。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：竞品过去 30-60 天的价格历史、自身价格与销量历史（用于拟合需求函数）、自身边际成本（FBA 费与货值），以及竞品成本先验；粒度为类目 × 单品的价格-销量面板。

**输出**：纳什均衡价格区间、最优响应价格与脱离价格战的临界点，以及竞品成本置信区间（贝叶斯场景）；供定价负责人制定防御性底价与跟价决策。

## 执行步骤

1. 采集竞品价格历史与自身价格-销量数据
2. 拟合线性需求函数参数并检验稳健性
3. 写出最优响应函数并数值求解均衡点
4. 输出均衡价格区间与稳定价格点
5. 对照情景清单评估跟价与不跟价的利润差异

## 边界与不做

- 数据不满足：缺 30 天竞品价格历史或自身销量-价格序列时无法拟合需求函数。
- 何时不用：长期合作高价用「重复博弈长期定价合作」；先动优势决策用「Stackelberg 价格领导策略」。
- 能力边界：只做均衡求解与响应建议，竞品成本为估计值，结论精度受其影响。
- 安全边界：不得与竞品交换信息或达成价格垄断协议，均衡结论仅作内部定价参考。

## 技能关联

- **前置**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-Stackelberg-Equilibrium-Competitive-Pricing.html、Skill-Stackelberg-Equilibrium-Competitive-Pricing、Skill-Stackelberg-Price-Leadership-Strategy.html、Skill-Stackelberg-Price-Leadership-Strategy
- **延伸**：Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-Stackelberg-Equilibrium-Competitive-Pricing.html、Skill-Stackelberg-Equilibrium-Competitive-Pricing、Skill-Stackelberg-Price-Leadership-Strategy.html、Skill-Stackelberg-Price-Leadership-Strategy
- **可组合**：Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-Stackelberg-Equilibrium-Competitive-Pricing.html、Skill-Stackelberg-Equilibrium-Competitive-Pricing、Skill-Nash-Equilibrium-Pricing-Model

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Nash-Equilibrium-Pricing-Model`