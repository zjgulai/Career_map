---
name: "p2s-promo-roi-attribution-supply-side"
title: "促销活动供应侧ROI归因 — 备货成本+促销库存持有成本+尾货损失的全成本核算"
description: "触发词：促销真实 ROI、备货持有成本、尾货折价、退货增量、供应侧成本。何时不用：要剥离自然增长评估促销净增量用「促销 ROI 前后对比」；要算广告费对利润的归因用「广告 TACoS 与 P&L 集成」。安全边界：真实 ROI 结论建议仅内部使用，公开披露可能被竞品反推成本结构；清仓折扣不得违反平台最低广告价格政策。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 促销规划"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Promo-ROI-Attribution-Supply-Side"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把大促备货的资金占用、尾货折价和退货增量一起算进去，给出比广告口径更真实的促销 ROI。"
user_try: "试试：算清黑五吸奶器大促的供应侧成本与真实 ROI，并给出下次大促的备货量建议。"
whenToUse: "需要把备货、尾货与退货等供应侧成本纳入促销 ROI 时用本技能；剥离自然增长看净增量用「促销 ROI 前后对比」；广告费归因用「广告 TACoS 与 P&L 集成」。"
workflow: "汇总大促前备货量与入仓时间、大促后剩余库存与清仓价、退货增量 → 计算备货持有成本、尾货折价损失与退货增量成本 → 汇总供应侧总成本并算出真实 ROI → 对比广告口径 ROI 并给出备货量与提前期优化建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 促销活动供应侧ROI归因 — 备货成本+促销库存持有成本+尾货损失的全成本核算

## ① 解决的问题

运营团队面临"大促ROI虚高忽视供应链成本"——备货持有成本+尾货折价+退货增量三段核算，真实ROI比广告ROI低30-50pp，指导更理性备货决策

## ② 核心算法逻辑

现有促销Skill（InPromo/PostPromo/PrePromo）都聚焦需求侧（流量/销量/售罄率），但供应侧成本通常被忽视。陈凤霞书中专门强调：促销的真实ROI必须包含供应链成本。

## ③ 业务应用场景

场景A：Black Friday吸奶器大促完整ROI核算 - 业务问题：大促GMV 300万，毛利率35%，广告花费30万，但不知道供应侧成本多少，也不知道真实ROI - 数据要求： - 大促前备货量 + 实际入仓时间（vs 正常入仓时间） - 大促后剩余库存量 + 实际清仓价格 - 大促期间退货数量 vs 平时退货率 - 预期产出： - 备货持有成本：8万（备货额400万 × 0.5% × 4周） - 尾货折价损失：12万（剩余80万库存 × 15%折扣） - 大促退货增量成本：3万 - 供应侧总成本：23万 - 真实ROI = (300万×35% - 23万 - 30万) / 53万 = 
三轨验证： - 成本：需从ERP/仓储系统提取备货时间戳、库存周转记录、退货处理工单，数据清洗约需2人天；计算资源可忽略。 - 合规：不涉及用户隐私或广告法；需确保清仓折扣不违反Amazon MAP（最低广告价格）政策，避免因大幅折价触发平台价格垄断审查。 - 风险：若公开披露“真实ROI”数据，可能被竞品反向推算成本结构；建议仅内部使用，不对外发布。
场景B：全年大促ROI纵向对比（黑五 vs 618 vs 日常） - 业务问题：黑五GMV是平时5倍，但供应侧成本也高5倍，真实利润贡献如何？ - 数据要求：黑五/618/日常三个时期的供应侧成本数据 - 预期产出：黑五供应侧ROI 90% vs 618供应侧ROI 120% vs 日常 150% → 618性价比最高

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：识别供应侧成本后，下次大促减少30%备货（精确控制尾货） + 提前期缩短7天 → 年化节省约15-20万元；让管理层看到"真实ROI"（比广告ROI低30-50pp），有助于更理性的大促决策
实施难度：⭐⭐⭐☆☆（需要整合多个数据源：备货账单+销售数据+退货数据）
优先级评分：⭐⭐⭐⭐☆（陈凤霞："90%的品牌只看广告ROI，忽视供应侧成本，这是战略盲区"）
评估依据：大促供应侧成本通常占总促销成本的30-50%，但几乎从不被单独核算，是利润最容易被低估的地方

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（187 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/promo_roi_attribution_supply_side` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Promo-ROI-Attribution-Supply-Side.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
促销活动供应侧 ROI 归因模型
功能：备货成本 / 持有成本 / 尾货损失 / 退货增量成本 / 真实促销ROI计算
输入：大促备货数据 + 销售结果 + 退货数据
输出：供应侧成本拆解 + 真实ROI + 改善建议
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def compute_promo_supply_cost(
    backup_gmv_value: float,          # 备货货值（元）
    backup_lead_days: int,            # 提前备货天数（vs正常）
    capital_rate: float = 0.06,       # 年资金成本
    remaining_inventory_pct: float = 0.25,  # 大促后剩余库存比例
    clearance_discount: float = 0.30, # 清仓折扣率（30%=七折）
    promo_return_rate: float = 0.06,  # 大促期间退货率（高于平时）
    normal_return_rate: float = 0.03, # 正常退货率
    promo_gmv: float = 3_000_000,     # 大促GMV
    handling_cost_per_return: float = 80,  # 每次退货处理成本
):
    """计算促销供应侧全成本"""
    
    # 1. 备货持有成本（提前备货的资金占用）
    holding_cost = backup_gmv_value * capital_rate * backup_lead_days / 365
    
    # 2. 尾货折价损失
    remaining_value = backup_gmv_value * remaining_inventory_pct
    clearance_loss = remaining_value * clearance_discount  # 按折扣计算损失
    
    # 3. 大促退货增量成本
    promo_orders = promo_gmv / 150  # 假设均单价150
    incremental_returns = promo_orders * (promo_return_rate - normal_return_rate)
    return_cost = incremental_returns * handling_cost_per_return
    
    # 4. 汇总
    total_supply_cost = holding_cost + clearance_loss + return_cost
    
    return {
        'holding_cost': round(holding_cost),
        'clearance_loss': round(clearance_loss),
        'return_cost': round(return_cost),
        'total_supply_cost': round(total_supply_cost),
        'supply_cost_rate': round(total_supply_cost / promo_gmv * 100, 2),
    }


def compute_true_promo_roi(
    promo_gmv: float,
    gross_margin_rate: float,
    ad_spend: float,
    supply_cost: float,
    baseline_gmv_daily: float,
    promo_days: int = 5,
):
    """计算促销真实ROI（含供应侧成本）"""
    # 增量GMV（大促GMV - 正常同期GMV）
    normal_period_gmv = baseline_gmv_daily * promo_days
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2307.14923，但该号在 arXiv 上是《Simulated Analogues I: apparent and physical evolution of young binary protostellar systems》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：大促前备货量与实际入仓时间（对比正常入仓时间）、大促后剩余库存量与清仓价格、大促期间退货数量与平时退货率，以及资金成本率等参数。

**输出**：备货持有成本、尾货折价损失、退货增量成本构成的供应侧成本拆解与真实促销 ROI，以及备货量与提前期的改善建议。

## 执行步骤

1. 汇总备货量、入仓时间、剩余库存与清仓价
2. 计算备货持有成本与尾货折价损失
3. 计算大促退货相对平时的增量成本
4. 汇总供应侧总成本并算出真实 ROI
5. 对比广告口径 ROI 给出备货优化建议

## 边界与不做

- 没有备货时间戳与退货分档数据时不适用，供应侧成本只能靠估算
- 只做成本核算与 ROI 修正，不代替备货、定价与清仓决策
- 真实 ROI 数据建议仅内部使用；清仓折扣须遵守平台最低广告价格等政策

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Aging-Cost-Management.html、Skill-Inventory-Aging-Cost-Management、Skill-PostPromo-Retrospective-KPI.html、Skill-PostPromo-Retrospective-KPI、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Sell-Through-Rate-Promo-Inventory.html、Skill-Sell-Through-Rate-Promo-Inventory、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Aging-Cost-Management.html、Skill-Inventory-Aging-Cost-Management、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Promo-ROI-Attribution-Supply-Side

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：04-供应链　·　源卡：`Skill-Promo-ROI-Attribution-Supply-Side`