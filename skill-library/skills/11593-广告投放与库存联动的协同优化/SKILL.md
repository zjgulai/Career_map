---
name: "p2s-ad-spend-inventory-sync"
title: "Ad Spend Inventory Sync — 广告投放与库存联动的协同优化"
description: "触发词：广告库存联动、预算分配、缺货风险、可发货量约束、大促调控。何时不用：补多少货的采购决策归供应链补货技能；本技能只在广告预算如何在 SKU 间分配上作答。安全边界：库存数据延迟过久可能导致超卖，须设置数据新鲜度门槛；不得操纵出价频率或违反平台广告政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 供需协调"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Ad-Spend-Inventory-Sync"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "广告预算跟着库存走，缺货的 SKU 不再烧钱，库存充足的 SKU 多拿预算。"
user_try: "试试：用这 10 个 SKU 的库存、到货 ETA 和广告数据，给出黑五大促 10 万预算的最优分配方案。"
whenToUse: "广告预算要在多 SKU 间分配且库存受限时用本技能；补多少货的采购决策归供应链补货技能。"
workflow: "接入各 SKU 广告表现、FBA 库存与到货 ETA、毛利率 → 按预算弹性反算各 SKU 预估需求 → 以可发货库存为上限约束预算分配 → 输出分配方案并按周滚动优化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Ad Spend Inventory Sync — 广告投放与库存联动的协同优化

## ① 解决的问题

母婴品牌大促前加大广告投放却因库存不足导致缺货差评——广告-库存联动优化将广告预算分配与 FBA 可发货量硬绑定，将缺货率从 12% 降至 4%，年化减少缺货损失 20-60 万元

## ② 核心算法逻辑

核心思想：广告出价→需求预测→库存补货三角联动，用库存可发货量作为广告预算分配的硬约束，防止"广告打爆但缺货"的致命失误。

## ③ 业务应用场景

场景A：黑五大促广告预算实时调控 - 业务问题：大促期间 10 个 SKU 竞争 10 万广告预算，吸奶器库存告急（仅剩 500 件），但尿布裤库存充足（5000 件），继续均摊预算会导致吸奶器缺货差评 - 数据要求：各 SKU 历史广告出价→订单量数据（30天）、当前 FBA 库存量、到货 ETA、商品毛利率 - 预期产出：最优预算分配方案（如：尿布裤追加 2 万，吸奶器削减至库存能支撑的上限） - 业务价值：避免吸奶器 500 件缺货造成约 8 万元损失（500件 × 160元利润），同时尿布裤增量订单带来 +15 万销售额，ROI 净增益约 23 万/次大促
三轨验证： - 成本：需对接 FBA 库存 API（月费约 500-2000 元）、计算资源（单次优化 < 1 元云成本）、人力（数据分析师 2 天/次大促） - 合规：不违反 Amazon 广告政策（仅调整预算分配，不操纵出价频率）；不涉及 GDPR 个人数据；广告法合规（无虚假宣传） - 风险：若库存数据延迟（> 2 小时），可能导致超卖；竞品可能趁机抢占削减预算的 SKU 广告位；过度依赖模型可能忽略突发补货到货
场景B：日常多 SKU 周度预算滚动优化 - 业务问题：品类经理每周一手动分配广告预算，凭经验决策，库存与广告脱节 - 数据要求：周度销售数据、补货在途数量、各 SKU ACOS 历史数据 - 预期产出：自动化周度预算建议报表，标注库存受限 SKU 和安全可追投 SKU - 业务价值：运营人力节省 30%，预算浪费（打超发缺货的广告）减少 20-40%，年化节省 20-60 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

20-40 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（219 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/ad_spend_inventory_sync` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Ad-Spend-Inventory-Sync.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
广告投放-库存联动协同优化
场景：5 个母婴 SKU，总预算 10 万，输出满足库存约束的最优广告预算分配
依赖：numpy, scipy（标准库）
"""

import numpy as np
from scipy.optimize import linprog

# ============================================================
# 数据准备：5 个母婴 SKU
# ============================================================
np.random.seed(42)

SKU_NAMES = ["吸奶器Pro", "尿布裤XL", "婴儿奶粉A2", "防水隔尿垫", "婴儿湿巾"]
N_SKU = len(SKU_NAMES)

# 基准出价 (元/点击)、基准日销量 (件/天)
BASE_BID = np.array([3.5, 1.2, 4.0, 0.8, 0.5])
BASE_DEMAND = np.array([80, 300, 50, 200, 500])

# 广告需求弹性系数 α（出价翻倍，需求增长 α×ln2 倍）
ELASTICITY = np.array([0.35, 0.20, 0.40, 0.15, 0.10])

# 当前 FBA 可发货库存（件）- 吸奶器库存告急
INVENTORY = np.array([400, 2000, 300, 1500, 4000])

# 各 SKU 单件利润（元）
PROFIT_PER_UNIT = np.array([160, 25, 80, 15, 8])

# 广告点击成本（元/件转化，CPC/CVR 综合）
COST_PER_CONVERSION = np.array([28, 6, 35, 4, 2])

TOTAL_BUDGET = 100000  # 总广告预算 10 万元
CAMPAIGN_DAYS = 7  # 规划周期（7天）
N_LEVELS = 20  # 预算离散化档位数


# ============================================================
# Step 1：广告需求弹性模型
# ============================================================

def estimate_demand(budget_per_sku: np.ndarray) -> np.ndarray:
    """
    基于广告预算估算各 SKU 需求量（整个规划周期）
    公式：d_i = base_d_i * days * (1 + alpha_i * ln(bid_i / base_bid_i))
    其中 bid_i = budget_i / (base_demand_i * days * cost_per_conv_i) 的近似反算
    """
    # 将预算转化为等效出价倍率
    base_spend = BASE_DEMAND * CAMPAIGN_DAYS * COST_PER_CONVERSION
    bid_ratio = np.where(base_spend > 0, budget_per_sku / base_spend, 1.0)
    bid_ratio = np.maximum(bid_ratio, 0.01)  # 防止 log(0)

    demand_multiplier = 1 + ELASTICITY * np.log(bid_ratio)
    demand_multiplier = np.maximum(demand_multiplier, 0.1)  # 不低于基准 10%

    estimated_demand = BASE_DEMAND * CAMPAIGN_DAYS * demand_multiplier
    return estimated_demand
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2003.01452，但该号在 arXiv 上是《Online Joint Bid/Daily Budget Optimization of Internet Advertising Campaigns》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 级数据：历史广告出价与订单量（约 30 天）、当前 FBA 库存量、到货 ETA、商品毛利率、活动周期与总预算。

**输出**：各 SKU 的最优广告预算分配方案（含库存受限 SKU 的削减上限与可追投 SKU 清单）与缺货风险提示；供投放与品类运营执行。

## 执行步骤

1. 接入 SKU 广告表现、库存与到货数据
2. 按预算弹性反算各 SKU 预估需求
3. 以可发货库存为上限约束分配
4. 输出预算方案并标注库存受限 SKU
5. 按周滚动更新分配建议

## 边界与不做

- 库存数据不可用、或延迟过大存在超卖风险时不用本技能。
- 本技能产出预算分配规则与建议，不代替广告平台改预算，也不执行补货采购。
- 安全边界：不得操纵出价频率或违反平台广告政策；库存数据须校验新鲜度以防超卖。

## 技能关联

- **前置**：Skill-Ad-Spend-Time-Series-Attribution.html、Skill-Ad-Spend-Time-Series-Attribution、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-RTB-Realtime-Bidding-Optimization.html、Skill-RTB-Realtime-Bidding-Optimization、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Ad-Spend-Time-Series-Attribution.html、Skill-Ad-Spend-Time-Series-Attribution、Skill-RTB-Realtime-Bidding-Optimization.html、Skill-RTB-Realtime-Bidding-Optimization、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Ad-Spend-Time-Series-Attribution.html、Skill-Ad-Spend-Time-Series-Attribution、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Ad-Spend-Inventory-Sync

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-Ad-Spend-Inventory-Sync`