---
name: "p2s-constrained-multi-objective-ad-delivery"
title: "Constrained Multi-Objective Ad Delivery — 约束多目标广告投放同时满足 ROAS + 品牌 + 预算硬约束"
description: "触发词：多目标出价、Lagrangian乘子、ROAS硬约束、CPM上限、预算清仓。何时不用：只有单一目标（纯转化或纯点击）时不必上乘子法；没有实时出价接口与CVR预估基础时不适用。安全边界：出价乘子须设上下限，避免触发平台异常检测，上线前须确认平台允许自动化出价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Constrained-Multi-Objective-Ad-Delivery"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "让 ROAS、品牌曝光、预算与清仓多个硬约束同时被满足，用对偶乘子动态调节各渠道出价倍数。"
user_try: "试试：Amazon DSP 要 ROAS≥3.5x、Meta 要 CPM≤12 美元，月预算3万美元，帮我算出两边同时满足的出价倍数。"
whenToUse: "当同一账户内多个目标互相竞争、且存在明确硬约束（ROAS 下限、CPM 上限、预算上限）时用本卡；单目标最优分配用多平台预算分配器；只做日内时段节奏用预算节奏控制器。"
workflow: "定义各约束的类型、目标值与学习率 → 每次展示按基础出价乘各乘子乘积出价 → 按日结算违反量并梯度更新各乘子 → 核对约束满足情况与转化量变化 → 输出出价倍数与约束达标报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Constrained Multi-Objective Ad Delivery — 约束多目标广告投放同时满足 ROAS + 品牌 + 预算硬约束

## ① 解决的问题

广告负责人面临"ROAS/品牌曝光/预算/库存清仓四个约束无法同时满足"——Lagrangian对偶乘子动态出价将整体ROAS从2.8x提升至3.4x，年化增收约21.6万美元

## ② 核心算法逻辑

传统广告出价优化只有一个目标：最大化转化（CVR 出价）或最大化点击（CPC 出价）。但真实业务有多个相互竞争的目标 + 多个硬约束：

## ③ 业务应用场景

业务问题：母婴品牌同时在 Amazon DSP（主攻转化）和 Meta（主攻品牌）投放，月预算 $30,000。 - Amazon DSP 团队只看 ROAS（目标 ≥ 3.5x），容易忽略品牌曝光 - Meta 团队只看 CPM（目标 ≤ $12），不关注 ROAS - 两个团队独立优化，经常出现：Amazon 超预算但品牌曝光不足；Meta 省预算但 ROAS 低于整体目标
预期产出：乘子法自动调节各渠道出价倍数，使所有约束同时满足，预期在同等预算下转化量提升 18-25%
业务价值：每月 $30,000 预算，约束优化后 ROAS 从 2.8x 整体提升至 3.4x，年化增收约 $21.6万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：$3 万/月广告预算，约束优化后整体 ROAS 从 2.8x → 3.4x，每月多收 $18,000，年化增收 $21.6万；实施成本约 5 万元（工程接入 + 预估模型），第 3 个月回收成本
实施难度：⭐⭐⭐☆☆（需要接入平台 API 实时出价，有 CVR 预估模型基础，约 4-6 周工程实现）
优先级：⭐⭐⭐⭐⭐（每个广告主都面临多约束问题，这是从"单目标优化"到"全约束优化"的关键升级，直接影响广告 P&L）
评估依据：MCMF 在阿里 RTB 生产系统部署后，在相同预算下转化量提升 +12.3%，预算执行率从 85% → 97%；KDD 2022 Alibaba 统一框架在 8 个业务场景均显著优于独立优化 baseline

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（250 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Constrained Multi-Objective Ad Delivery
约束多目标广告投放——对偶乘子法动态调节出价

依赖：numpy, pandas
核心：Lagrangian 乘子法在线梯度更新
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 约束定义
# ─────────────────────────────────────────────

@dataclass
class AdConstraint:
    """广告投放约束定义"""
    name: str
    constraint_type: str       # 'min' 或 'max'（≥ 还是 ≤）
    target_value: float        # 目标值（如 ROAS ≥ 3.0 则填 3.0）
    current_value: float = 0.0 # 当前实际值
    multiplier: float = 1.0    # 对偶乘子（lambda）
    learning_rate: float = 0.01
    
    def violation(self) -> float:
        """计算约束违反量（正数=违反，负数=满足）"""
        if self.constraint_type == 'min':
            return self.target_value - self.current_value  # 实际 < 目标 → 违反
        else:  # 'max'
            return self.current_value - self.target_value  # 实际 > 目标 → 违反
    
    def update_multiplier(self) -> None:
        """梯度更新乘子"""
        grad = self.violation()
        self.multiplier = max(0.0, self.multiplier + self.learning_rate * grad)


# ─────────────────────────────────────────────
# 2. 约束多目标出价优化器
# ─────────────────────────────────────────────

class ConstrainedAdBidder:
    """
    约束多目标广告出价优化器
    
    原理：Lagrangian 对偶乘子法
    - 每次展示机会：基础出价 × 乘子乘积 = 实际出价
    - 每日结束：根据约束满足情况更新各乘子
    """
    
    def __init__(self, base_bid: float, constraints: List[AdConstraint]):
        self.base_bid = base_bid
        self.constraints = {c.name: c for c in constraints}
        self.bid_history: List[float] = []
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2206.12147，但该号在 arXiv 上是《MCMF: Multi-Constraints With Merging Features Bid Optimization in Online Display Advertising》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：基础出价、约束定义列表（名称、min/max 方向、目标值、当前值、对偶乘子与学习率），以及每日展示机会与转化回传数据；需要平台侧实时出价接口与 CVR 预估基础。

**输出**：各约束的对偶乘子与由此得到的出价倍数、约束达标情况与转化量变化，供投放工程接入出价链路。

## 执行步骤

1. 定义每条约束的名称、方向、目标值与学习率
2. 按当前值计算每条约束的违反量
3. 每次展示机会用基础出价乘各乘子乘积得到实际出价
4. 每日按违反量对各乘子做非负梯度更新
5. 核对多个约束是否同时满足并观察转化量
6. 输出出价倍数与约束达标报告供工程接入

## 边界与不做

- 何时不用：只有单一优化目标、或缺少实时出价接口与 CVR 预估模型时不适用；约束目标值未与业务确认前不应上线。
- 能力边界：只产出乘子与出价倍数规则，实际竞价由平台侧竞价系统执行，不负责创意、库存与预算审批。
- 风险边界：过度自动化出价可能触发平台异常检测，需设置出价上下限并遵守平台自动化出价条款。

## 技能关联

- **前置**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Cross-Channel-Budget-Pacing-Controller.html、Skill-Cross-Channel-Budget-Pacing-Controller、Skill-MTL-Multi-Objective-Ad-Optimization.html、Skill-MTL-Multi-Objective-Ad-Optimization、Skill-Privacy-Preserving-Ad-Measurement.html、Skill-Privacy-Preserving-Ad-Measurement、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding
- **延伸**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Cross-Channel-Budget-Pacing-Controller.html、Skill-Cross-Channel-Budget-Pacing-Controller、Skill-MTL-Multi-Objective-Ad-Optimization.html、Skill-MTL-Multi-Objective-Ad-Optimization、Skill-Privacy-Preserving-Ad-Measurement.html、Skill-Privacy-Preserving-Ad-Measurement、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation
- **可组合**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-MTL-Multi-Objective-Ad-Optimization.html、Skill-MTL-Multi-Objective-Ad-Optimization、Skill-Privacy-Preserving-Ad-Measurement.html、Skill-Privacy-Preserving-Ad-Measurement、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation、Skill-Constrained-Multi-Objective-Ad-Delivery

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-Constrained-Multi-Objective-Ad-Delivery`