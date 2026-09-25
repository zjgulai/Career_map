---
name: "p2s-drl-inventory-optimization"
title: "DRL Inventory Optimization — 深度强化学习库存优化：端到端自适应补货决策"
description: "触发词：深度强化学习、多SKU补货、联合补货、配套缺货、库存成本优化。何时不用：只有单 SKU 或历史数据不足以训练时用「安全库存与补货策略」这类解析公式技能；要处理多仓调拨而非同仓多 SKU 时走「调拨清货建议」。安全边界：策略上线须对高风险补货动作保留人工审核，不得绕过平台的库存与定价规则。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-DRL-Inventory-Optimization"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让补货学会多个配套 SKU 之间的联动，减少爆款缺配件、配件堆在仓里的尴尬。"
user_try: "试试：吸奶器、储奶袋、消毒器三个配套 SKU，帮我训一版联合补货策略并与现有规则比成本。"
whenToUse: "多 SKU 存在配套购买关联、且各 SKU 独立补货已造成配套缺货或积压时用；单个 SKU 的补货点能用解析公式直接算出时，不必上强化学习。"
workflow: "定义多 SKU 环境的状态、动作档位与成本奖励 → 配置持货成本率、缺货惩罚与订货成本 → 训练并迭代策略（简化版用 Q 表，生产版用 stable-baselines3） → 对比启发式规则给出费用节省百分比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DRL Inventory Optimization — 深度强化学习库存优化：端到端自适应补货决策

## ① 解决的问题

吸奶器储奶袋消毒器三个SKU各自独立启发式补货，结果吸奶器爆款时储奶袋配套缺货消毒器积压——深度强化学习端到端学习多SKU协同补货策略，总库存成本降低10-20%配套缺货率降低40-60%年化15-45万元

## ② 核心算法逻辑

启发式规则 vs DRL 补货：

## ③ 业务应用场景

业务问题：吸奶器、储奶袋、消毒器三个 SKU 有强关联（配套购买），但现在各自独立补货。结果：吸奶器爆款时储奶袋经常跟着缺货（因为没有考虑关联需求），而消毒器则可能长期积压（过度安全库存）。
数据要求： - 多 SKU 历史销量（含关联购买记录） - 成本参数（持货成本率/缺货惩罚/订货成本） - 供应商 Lead Time 分布
预期产出： - DRL 补货策略：每个 SKU 的最优补货量（动态响应） - 多 SKU 协同效益：减少配套缺货场景 - 对比启发式规则：费用节省百分比

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
总库存成本降低 10-20%（持货+缺货综合优化）：年化节省 ¥10-30 万
配套缺货率降低（多SKU协同）：GMV 保护 ¥5-15 万/年
启发式规则替代（减少人工调参）：运营效率提升
年化综合 ROI：¥15-45 万
实施难度：⭐⭐⭐⭐☆（需要自定义 Gym 环境 + stable-baselines3 训练；历史数据充分才能训练；约 6-8 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（177 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/drl_inventory_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-DRL-Inventory-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DRL Inventory Optimization
深度强化学习多SKU补货优化（简化PPO近似）
"""
import numpy as np
from dataclasses import dataclass


@dataclass
class SKUConfig:
    """SKU 配置"""
    sku_id: str
    holding_cost_rate: float  # 每件每天持货成本
    stockout_penalty: float   # 每件缺货惩罚
    order_cost: float         # 每次订货固定成本
    lead_time: int            # 交货期（天）
    unit_price: float


class SimpleDRLInventoryAgent:
    """
    简化版 DRL 库存 Agent（Q-learning 近似）
    生产环境: pip install stable-baselines3 + 自定义 Gym 环境
    """

    def __init__(self, n_skus: int, max_stock: int = 500):
        self.n_skus = n_skus
        self.max_stock = max_stock
        # 简化Q表：以库存分位数为状态
        self.q_table = np.zeros((5, 5, n_skus, 4))  # 5级×5级库存 × SKU × 4档补货
        self.epsilon = 0.3
        self.alpha = 0.1
        self.gamma = 0.9
        self.order_levels = [0, 50, 100, 200]  # 补货档位

    def _state_to_idx(self, inventory: np.ndarray, max_stock: int = 500) -> tuple:
        """将连续库存映射到离散状态"""
        idxs = [min(4, int(inv / max_stock * 5)) for inv in inventory[:2]]
        return tuple(idxs)

    def select_orders(self, inventory: np.ndarray) -> np.ndarray:
        """选择各SKU补货量"""
        s = self._state_to_idx(inventory)
        orders = np.zeros(self.n_skus, dtype=int)
        for k in range(self.n_skus):
            if np.random.random() < self.epsilon:
                level = np.random.randint(4)
            else:
                level = np.argmax(self.q_table[s[0], s[1], k])
            orders[k] = self.order_levels[level]
        return orders

    def update(self, inventory: np.ndarray, orders: np.ndarray,
               reward: float, next_inventory: np.ndarray):
        """Q值更新"""
        s = self._state_to_idx(inventory)
        s_next = self._state_to_idx(next_inventory)
        for k in range(self.n_skus):
            level = self.order_levels.index(orders[k]) if orders[k] in self.order_levels else 0
            q_old = self.q_table[s[0], s[1], k, level]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.14523，但该号在 arXiv 上是《Optical and Raman selection rules for odd-parity clean superconductors》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：多 SKU 历史销量（含关联购买记录）、每 SKU 的持货成本率、缺货惩罚、订货成本、单位价格与前置期，以及库存状态的可离散化范围，按 SKU 与按天组织。

**输出**：每个 SKU 的动态补货量建议、多 SKU 协同后的配套缺货改善情况，以及相对启发式规则的费用节省百分比，供补货策略调参与人工复核。

## 执行步骤

1. 整理多 SKU 销量与关联购买记录
2. 配置成本参数并搭建补货环境
3. 训练策略使总库存成本与配套缺货同时下降
4. 与现有启发式规则对比费用差异
5. 输出补货建议并标注相对规则的收益

## 边界与不做

- 数据不满足时不适用：缺少多 SKU 历史销量与关联购买记录时训练不出协同效应；单 SKU 场景无需本技能。
- 能力边界：只产出补货档位建议与规则对比，不直接下单，也不保证达到卡页给出的成本降幅。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-MAS-Resource-Scheduling.html、Skill-MAS-Resource-Scheduling、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-VMI-DRL-Inventory-Routing.html、Skill-VMI-DRL-Inventory-Routing
- **延伸**：Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-MAS-Resource-Scheduling.html、Skill-MAS-Resource-Scheduling、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-VMI-DRL-Inventory-Routing.html、Skill-VMI-DRL-Inventory-Routing
- **可组合**：Skill-MAS-Resource-Scheduling.html、Skill-MAS-Resource-Scheduling、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-VMI-DRL-Inventory-Routing.html、Skill-VMI-DRL-Inventory-Routing、Skill-DRL-Inventory-Optimization

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-DRL-Inventory-Optimization`