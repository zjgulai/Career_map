---
name: "p2s-multi-channel-inventory-sync"
title: "Multi-Channel Inventory Sync — 多渠道库存协同：Amazon+独立站+TikTok联动库存管理"
description: "触发词：多渠道库存、库存池、渠道配额、超卖风险、大促分货。何时不用：需要事件驱动实时同步与下单即扣减时用全渠道库存实时同步；需要按优先级分配有限供给时用供需缺口分析与优先级分配。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 调拨清货建议"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-Multi-Channel-Inventory-Sync"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把三个渠道的备货合成一个共享池，算出各渠道该分多少货，减少总备货量和超卖。"
user_try: "试试：黑五三个渠道都要备货，总库存只能给 450 件，帮我算出各渠道最优分配和动态重分配条件。"
whenToUse: "需要为多渠道做统一库存池的初始分配与动态重分配、评估超卖风险时用本技能；需要事件驱动实时同步与下单即扣减用全渠道库存实时同步。"
workflow: "汇总各渠道日销量、利润贡献率与大促销量系数 → 在总库存约束下运行分配优化 → 输出各渠道初始配额与动态重分配触发条件 → 评估各渠道超卖概率并给出安全库存下限"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Channel Inventory Sync — 多渠道库存协同：Amazon+独立站+TikTok联动库存管理

## ① 解决的问题

Amazon独立站TikTok三渠道各自独立备货导致总备货650件但最优只需450件且大促时超卖风险高——统一库存池+蒙特卡洛优化动态分配，总备货量减少20%大促缺货率降低年化节省15-40万元

## ② 核心算法逻辑

独立库存 vs 协同库存：

## ③ 业务应用场景

业务问题：黑五期间 Amazon/独立站/TikTok Shop 三个渠道同时大促，都预期销量大增。如果各渠道独立备货，总备货量 = 300+200+150=650件，但实际最优只需 450 件（有一定共享）。如何在总库存 450 件的约束下，让三个渠道都不超卖且总利润最大？
数据要求： - 各渠道过去 30 天日销量历史 - 各渠道利润贡献率（Amazon 25%、独立站 35%、TikTok 20%） - 大促预期销量系数（各渠道的预测倍增）
预期产出： - 最优初始库存分配（各渠道各多少） - 动态重分配策略（哪个条件触发重分配） - 超卖风险评估（各渠道的超卖概率）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
总备货量减少 10-20%（共享池效应）：减少资金占用 ¥5-15 万
高利润渠道（独立站）缺货率降低：GMV 保护 ¥5-15 万
大促超卖风险降低：避免因超卖导致的差评和账号风险
年化综合 ROI：¥15-40 万
实施难度：⭐⭐⭐☆☆（需要多渠道 API 集成；蒙特卡洛优化约 2 周；实时重分配需要自动化系统约 4-6 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（167 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/multi_channel_inventory_sync` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Multi-Channel-Inventory-Sync.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Multi-Channel Inventory Sync
多渠道库存协同：统一库存池 + 动态分配
"""
import numpy as np
from dataclasses import dataclass
from typing import Optional


@dataclass
class SalesChannel:
    """销售渠道"""
    channel_id: str
    name: str
    daily_demand_mean: float
    daily_demand_std: float
    profit_margin: float      # 单位利润
    lead_time_days: int       # 补货到渠道的时间（FBA转移需要1-2天）
    current_inventory: float
    min_safety_days: float = 3.0  # 最低安全库存天数


def allocate_inventory_optimal(channels: list[SalesChannel],
                                total_pool: float,
                                horizon_days: int = 7,
                                n_scenarios: int = 1000,
                                seed: int = 42) -> dict:
    """
    蒙特卡洛仿真优化库存分配
    在 n 个随机需求场景下找到期望利润最大的分配
    """
    np.random.seed(seed)
    n = len(channels)

    # 蒙特卡洛需求模拟
    demand_scenarios = np.array([
        [max(0, np.random.normal(c.daily_demand_mean, c.daily_demand_std) * horizon_days)
         for c in channels]
        for _ in range(n_scenarios)
    ])  # shape: (n_scenarios, n_channels)

    # 候选分配方案（格网搜索简化版）
    best_allocation = None
    best_expected_profit = -np.inf

    margins = np.array([c.profit_margin for c in channels])

    # 按利润率比例分配（基础方案）
    margin_weights = margins / margins.sum()
    base_alloc = total_pool * margin_weights

    # 优化：调整比例
    for delta in np.linspace(-0.2, 0.2, 11):
        trial_weights = margin_weights.copy()
        trial_weights[0] = max(0.1, margin_weights[0] + delta)
        trial_weights = trial_weights / trial_weights.sum()
        trial_alloc = total_pool * trial_weights

        # 期望利润计算（蒙特卡洛）
        actual_sales = np.minimum(demand_scenarios, trial_alloc)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.08734，但该号在 arXiv 上是《Link between cascade transitions and correlated Chern insulators in magic-angle twisted bilayer graphene》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道过去 30 天日销量历史、利润贡献率、大促预期销量系数、补货到渠道的提前期，以及总库存或预算约束。

**输出**：各渠道最优初始库存分配、动态重分配触发条件、超卖风险评估，供多渠道运营与仓配团队执行。

## 执行步骤

1. 汇总各渠道销量、利润与大促系数数据
2. 在总库存约束下运行分配优化
3. 输出各渠道配额与重分配触发条件
4. 评估超卖概率并给出安全水位

## 边界与不做

- 何时不用：需要下单后秒级同步所有渠道库存数字时用全渠道库存实时同步；需要按 SKU 优先级分配短缺供给时用供需缺口分析与优先级分配。
- 能力边界：输出分配与重分配策略，不负责接入渠道 API 与执行库存写回。
- 数据边界：渠道 API 未打通或销量历史不足时，只能给出静态分配建议，无法支撑实时重分配。

## 技能关联

- **前置**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-DRL-Inventory-Optimization.html、Skill-DRL-Inventory-Optimization、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Omnichannel-Inventory-Sync.html、Skill-Omnichannel-Inventory-Sync、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-DRL-Inventory-Optimization.html、Skill-DRL-Inventory-Optimization、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-Omnichannel-Inventory-Sync.html、Skill-Omnichannel-Inventory-Sync
- **可组合**：Skill-DRL-Inventory-Optimization.html、Skill-DRL-Inventory-Optimization、Skill-Omnichannel-Inventory-Sync.html、Skill-Omnichannel-Inventory-Sync、Skill-Multi-Channel-Inventory-Sync

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：04-供应链　·　源卡：`Skill-Multi-Channel-Inventory-Sync`