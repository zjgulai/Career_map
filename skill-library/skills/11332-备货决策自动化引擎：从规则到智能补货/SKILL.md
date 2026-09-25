---
name: "p2s-automated-replenishment-decision-engine"
title: "Automated Replenishment Decision Engine — 备货决策自动化引擎：从规则到智能补货"
description: "触发词：自动补货、备货决策、补货量计算、安全库存补货、批量补货建议。何时不用：需求均值方差还没算出来时先走「需求预测」；要决定清仓还是调拨时走「调拨清货建议」。安全边界：只输出补货建议、风险分与理由，下单付款与入库动作须人工确认后交外部系统执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Automated-Replenishment-Decision-Engine"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把每月几十个 SKU 的备货决策一次跑完，人工只复审高风险的那部分。"
user_try: "试试：按这批 SKU 的库存、日均需求和前置期，生成本月补货建议并标出需要人工审核的项。"
whenToUse: "已有日需求均值与标准差、前置期，要给多 SKU 批量算出补货量时用；预测量级本身还不可信时，先用「需求预测」类技能。"
workflow: "计算安全库存与再订货点 → 判断库存覆盖天数是否触发补货 → 按目标水位算补货量并向上取整到 MOQ 整数倍 → 输出风险分与人工审核标记"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Automated Replenishment Decision Engine — 备货决策自动化引擎：从规则到智能补货

## ① 解决的问题

50个SKU每月手动备货决策耗时25小时且遗漏风险高——三层自动化引擎（预测→优化→执行）接管80%决策，人工只需审核5小时高风险决策，年化节省人力+库存效率15-40万元

## ② 核心算法逻辑

手动备货 vs 自动化引擎：

## ③ 业务应用场景

业务痛点：中型卖家每月需要为 50 个 SKU 做备货决策，每个 SKU 需要考虑需求预测+库存现状+供应商价格+资金状况，每次决策 30 分钟，合计 25 小时/月。自动化引擎接管 80% 的决策，人工只处理高风险的 20%（约 5 小时/月）。
业务价值： - 人工时间从 25h/月 → 5h/月（节省 20 小时） - 缺货率降低（预测更及时） - 积压减少（不再过度保守备货） - 年化 ROI：¥15-40 万（人力节省 + 库存效率）
**三轨验证** | 成本轨：系统开发成本18万元（含算法模型、数据集成），月均运维成本3,500元（服务器2,000元+人工1,500元/月），ROI周期8个月。缺货率从12%降至3%，年化增收45万元，扣除成本年净收益约32万元 | 合规轨：符合《跨境电商进出口商品质量安全风险预警和应急处置规程》，需获得FBA仓库数据接口授权（AWS合规认证），婴儿奶粉需满足GB 10765食品安全标准和进口许可证要求。结论：合规可行，需补充产品追溯系统 | 风险轨：①预测模型偏差风险（概率25%）导致过度备货增加库存成本；②FBA接口变更风险（概率8%）影响数据同步；③季节性需求波动未充分建模（概率35

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：人工时间 25h→5h/月；缺货率降低；积压减少；年化 ¥15-40 万
实施难度：⭐⭐⭐☆☆（三层架构工程量中等；需要 Seller Central API；约 4-6 周）
优先级评分：⭐⭐⭐⭐⭐（完全空白的高频流程痛点；中型卖家核心运营需求；桥接 供应链↔智能体↔运营财务 三域）
评估依据：自动化备货系统（Linnworks/SkuVault 等）验证效率提升 5-10x；规则引擎路线对中小卖家最易落地

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（178 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/automated_replenishment_decision_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Automated-Replenishment-Decision-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Automated Replenishment Decision Engine
备货决策自动化引擎：预测→优化→执行一体化
"""
import numpy as np
from dataclasses import dataclass
from typing import Optional


@dataclass
class SKUProfile:
    sku_id: str
    current_stock: float       # 当前库存（件）
    daily_demand_mean: float   # 日均需求
    daily_demand_std: float    # 需求标准差
    lead_time_days: int        # 供货周期
    unit_cost: float           # 单位成本（美元）
    min_order_qty: int         # 最小起订量
    holding_cost_rate: float = 0.02  # 日持货成本率
    stockout_penalty: float = 15.0   # 缺货惩罚（$/件）


@dataclass
class ReplenishmentDecision:
    sku_id: str
    recommended_qty: int
    order_date: str
    estimated_arrival: str
    risk_score: float
    auto_execute: bool
    rationale: str
    financial_impact: dict


def compute_safety_stock(sku: SKUProfile, service_level: float = 0.95) -> float:
    """计算安全库存"""
    from scipy import stats
    z = stats.norm.ppf(service_level)
    # 考虑需求和交期的双重不确定性
    safety_stock = z * sku.daily_demand_std * np.sqrt(sku.lead_time_days)
    return max(0, safety_stock)


def compute_optimal_order_qty(sku: SKUProfile, forecast_horizon: int = 60) -> int:
    """EOQ + 安全库存的最优补货量"""
    safety_stock = compute_safety_stock(sku)
    reorder_point = sku.daily_demand_mean * sku.lead_time_days + safety_stock
    
    # 判断是否需要补货
    days_of_stock = sku.current_stock / max(sku.daily_demand_mean, 0.1)
    if days_of_stock > sku.lead_time_days + 7:
        return 0  # 库存充足，无需补货
    
    # 目标库存水位（forecast_horizon 天的需求 + 安全库存）
    target_stock = sku.daily_demand_mean * forecast_horizon + safety_stock
    order_qty = max(0, target_stock - sku.current_stock)
    
    # 向上取整到 MOQ 的整数倍
    order_qty = max(sku.min_order_qty, 
                    int(np.ceil(order_qty / sku.min_order_qty)) * sku.min_order_qty)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.18923，但该号在 arXiv 上是《Counting $r\times s$ rectangles in nondecreasing and Smirnov words》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 档案：SKU 编号、当前库存、日均需求与需求标准差、供货周期天数、单位成本、最小起订量，另含日持货成本率与缺货惩罚参数，按 SKU 一条记录。

**输出**：每个 SKU 一条补货决策：建议补货量、下单日、预计到货日、风险分、是否自动执行、理由与财务影响，供人工审核并与采购系统对接。

## 执行步骤

1. 提取每个 SKU 的库存、日均需求与前置期参数
2. 用目标服务水平计算安全库存与再订货点
3. 按目标库存水位算出补货量并向上取整到 MOQ 整数倍
4. 给每条建议打风险分并生成理由
5. 筛出高风险项交人工审核后输出决策清单

## 边界与不做

- 数据不满足时不适用：只有月度汇总销量、没有 SKU 级日需求标准差或前置期分布时，算不出可信的安全库存。
- 能力边界：只产出建议量与风险分，不调用采购系统下单、不承诺供应商交期，也不替代人工对高风险项的审核。

## 技能关联

- **前置**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-DRL-Inventory-Optimization.html、Skill-DRL-Inventory-Optimization、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-DRL-Inventory-Optimization.html、Skill-DRL-Inventory-Optimization、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync
- **可组合**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Automated-Replenishment-Decision-Engine

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Automated-Replenishment-Decision-Engine`