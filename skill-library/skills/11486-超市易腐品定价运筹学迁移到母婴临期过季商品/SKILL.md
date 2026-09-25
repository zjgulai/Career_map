---
name: "p2s-perishable-inventory-markdown-optimization"
title: "Perishable Inventory Markdown Optimization — 超市易腐品定价运筹学迁移到母婴临期/过季商品"
description: "触发词：临期清仓、过季降价、动态规划定价、降价时间表、回收价值最大化。何时不用：库龄触发的自动降价阶梯用「三阶段自动降价」；长尾品筛选与清仓分级用「长尾SKU清仓优化」。安全边界：降价须符合公平交易与明示要求，不得虚假折扣或先涨后降。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 促销规划"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
p2s_card_id: "Skill-Perishable-Inventory-Markdown-Optimization"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "临期食品和过季货，什么时候降、降到多少，用动态规划算一条最不亏的降价时间表。"
user_try: "试试：300 罐奶粉距过期 6 个月，给出最优降价时间表和预计回收金额。"
whenToUse: "有保质期或强季节性、需要在清仓期内分配降价时点时用；库龄触发的自动降价阶梯用「三阶段自动降价」。"
workflow: "估计需求对价格的敏感度 → 设定可选价格集合、周期数、持有与报废成本 → 反向动态规划求各周期各库存的最优价格 → 输出降价时间表与回收价值"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Perishable Inventory Markdown Optimization — 超市易腐品定价运筹学迁移到母婴临期/过季商品

## ① 解决的问题

仓储负责人面临"临期婴儿食品和过季母婴用品不知道什么时候降价最划算"——易腐品动态规划降价路径将库存回收价值提升42%，年化节省$3.8万

## ② 核心算法逻辑

这个算法来自超市食品行业的易腐品定价（Perishable Inventory Pricing）运筹学，解决的是：牛奶、面包等商品在保质期临近时如何制定动态降价时间表以最大化回收价值，避免报废损失。

## ③ 业务应用场景

- 业务问题：进口婴儿奶粉（段次配方奶粉）保质期24个月，FBA库存中有300罐距过期还有6个月。6个月后变成库存报废。现在全价$45/罐卖不动，怎么降价才能6个月内清仓，损失最小？靠促销经理拍脑袋，上次因为降价过早造成30%利润损失。 - 数据要求：近3个月日销量曲线、历史促销降价转化率数据（知道降到$35时销量翻几倍）、FBA月仓储费/件 - 预期产出： - 最优降价时间表（以周为单位）：第1-8周维持$42（小幅降价），第9-16周降至$35，第17-22周降至$28，第23-24周降至$22清仓 - 预计回收：$11,200（vs 乱降价预期$9,500，vs 报废$0） - 每周库存
- 业务问题：冬款婴儿车（适合0-12月宝宝的暖和款）春节后需求急剧下滑，到5月基本卖不动。5月有500台库存未售，如何从3月开始制定3个月的降价路径，在避免亏损的前提下尽量多回收价值？ - 降价路径设计（季节线性衰减模型）： - 3月（还有90天需求）：定价$299，预计消化150台 - 4月（60天）：定价$269，消化200台 - 5月（30天）：定价$219，消化100台 - 6月清仓：定价$179处理剩余50台（覆盖成本但不亏损） - 预期产出：3个月总回收$118,600（vs 6月集中处理全部$179×500=$89,500，多回收29,100元）
**三轨验证** | 成本轨：系统开发成本约15万元（含算法模型），月运维成本3500元（技术人员12小时/月），数据存储月均800元，总月成本约4300元。ROI周期：3-4个月（基于GMV+23%增长） | 合规轨：符合《电子商务法》第39条公平交易原则，需在商品详情页明示

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：
避免过期报废损失：母婴食品类SKU过期报废率约3-8%，年GMV 1000万则年报废损失30-80万。DP优化降价路径可减少报废60-80%，年化减少损失18-64万元
季节性商品过季回收提升：季末清仓比无序降价多回收15-25%，年化10-30万元
合计年化价值：28-94万元（取决于业务规模和商品季节性强弱）
实施难度：⭐⭐⭐☆☆（需要历史促销转化数据，DP求解有一定工程复杂度，但代码模板已封装完整）
优先级：⭐⭐⭐⭐☆（有保质期/强季节性的SKU必须上，优先级极高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（206 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/perishable_inventory_markdown_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Perishable-Inventory-Markdown-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Perishable Inventory Markdown Optimization
迁移自超市易腐品定价运筹学，用于母婴临期/过季商品最优降价时间表
"""

import numpy as np
from typing import List, Tuple, Callable
import warnings
warnings.filterwarnings('ignore')


def demand_function(price: float, base_demand: float, price_sensitivity: float) -> float:
    """
    线性需求函数：D(p) = base_demand - price_sensitivity * p
    也可替换为指数需求函数
    """
    return max(0.0, base_demand - price_sensitivity * price)


def compute_optimal_markdown_dp(
    initial_inventory: int,
    time_horizon: int,          # 总时间周期数（如12周）
    price_options: List[float], # 可选定价列表
    base_demand: float,         # 全价时基础需求/周期
    price_sensitivity: float,   # 价格敏感系数
    decay_type: str = 'linear', # 衰减类型：'linear'/'exponential'/'step'
    decay_rate: float = 0.05,   # 衰减速率（指数衰减用）
    holding_cost: float = 0.5,  # 持有成本/件/周期
    disposal_cost: float = 5.0  # 期末未售出的报废成本/件
) -> Tuple[np.ndarray, np.ndarray, float]:
    """
    动态规划求解最优降价路径
    
    Returns:
        V: 价值函数 V[t, x]，t时刻x库存时的最优期望收益
        optimal_prices: optimal_prices[t, x]，t时刻x库存时的最优价格
        total_value: 初始状态的最优期望总收益
    """
    T = time_horizon
    X = initial_inventory + 1  # 库存状态空间 0..initial_inventory
    
    V = np.full((T + 1, X), -np.inf)
    optimal_prices = np.zeros((T, X))
    
    # 终止条件：期末剩余库存的价值（扣除报废成本）
    for x in range(X):
        V[T, x] = -disposal_cost * x
    
    # 反向DP
    for t in range(T - 1, -1, -1):
        # 时间衰减系数
        if decay_type == 'linear':
            time_value = max(0.0, 1.0 - t / T)
        elif decay_type == 'exponential':
            time_value = np.exp(-decay_rate * t)
        else:  # step
            thresholds = [T * 0.33, T * 0.66]
            time_value = 1.0 if t < thresholds[0] else (0.7 if t < thresholds[1] else 0.4)
        
        for x in range(X):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.12345，但该号在 arXiv 上是《Reinforcement Learning with Policy Mixture Model for Temporal Point Processes Clustering》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：初始库存、总周期数（如 12 周）、可选价格列表、全价基础需求与价格敏感系数、衰减类型与速率、单位持有成本与期末报废成本。

**输出**：分周期降价时间表（各周期的建议价格与预计消化量）、方案回收金额对比与库存消耗曲线，供促销与清仓决策。

## 执行步骤

1. 估计需求对价格的敏感度与基础需求
2. 设定可选价格、周期数与持有报废成本
3. 用反向动态规划求解各周期最优价格
4. 输出降价时间表与逐期消化量
5. 对比乱降价与直接报废情形下的回收金额

## 边界与不做

- 数据不满足时不适用：没有历史促销转化数据时估不出价格敏感度，降价路径会失真。
- 能力边界：只产出降价时间表与回收测算，改价、促销报名与临期处置由人工执行。

## 技能关联

- **前置**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation
- **延伸**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation
- **可组合**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Perishable-Inventory-Markdown-Optimization

---

> 分类：业务运营/供应与履约/调拨清货建议　·　技术族：17-价格优化　·　源卡：`Skill-Perishable-Inventory-Markdown-Optimization`