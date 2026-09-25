---
name: "p2s-dynamic-abc-stratification-adaptive-policy"
title: "动态ABC分层与策略自适应 — 帕累托分类自动更新与差异化库存策略绑定"
description: "触发词：ABC分层、动态分类、漂移检测、策略绑定、库存瘦身。何时不用：需要做多SKU尾部风险组合优化时用CVaR库存风险组合；需要做库龄分段与清仓优先级时用库龄分段管理与资金成本化。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-Dynamic-ABC-Stratification-Adaptive-Policy"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让 ABC 分类自动跟着销量漂移更新，并直接绑定安全库存与补货频率，别让新爆款还按 C 类备货。"
user_try: "试试：用我这 80 个 SKU 的月度销售数据重跑动态 ABC，把升级的 SKU 标出来并给出对应补货策略。"
whenToUse: "需要定期重建 ABC 与 XYZ 分类并把分类结果自动绑定差异化库存策略时用本技能；多 SKU 尾部风险优化用CVaR库存风险组合。"
workflow: "汇总 SKU 级月度销售、毛利与增长数据 → 计算多维评分并重建 ABC 与 XYZ 分类 → 用漂移检测识别升级与降级 SKU → 按新分类绑定安全库存与补货策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 动态ABC分层与策略自适应 — 帕累托分类自动更新与差异化库存策略绑定

## ① 解决的问题

新升级爆款仍按C类备货导致旺季缺货——CUSUM漂移检测自动升降级并绑定差异化策略，年化防损$10-15万，C类库存瘦身释放资金$10-20万

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中专节阐述ABC分类在电商供应链中的核心地位：A类商品（20%SKU贡献80%营收）需要高精度预测、充足安全库存、高频补货；C类商品（50%SKU只贡献5%营收）应用最低订购量、低安全库存、宽松补货周期。但静态ABC分类每季度才更新一次，导致"已变成爆款的商品仍按C类策略备货，导致缺货"这一极高频痛点。

## ③ 业务应用场景

场景A：母婴卖家全SKU动态ABC分类重建
- 业务问题：某卖家80个SKU，上次做ABC分类是6个月前，期间有2款新品快速成长（吸奶器配件套装、智能温奶器），仍按C类管理，Q4旺季前缺货损失$3万 - 数据要求：12个月SKU级月度销售额/毛利/销量、当前库存、近期增长率 - 算法应用： 1. 多维加权评分重新计算，发现"吸奶器配件套装"评分从C类上升至A类 2. CUSUM检测：该SKU销售额连续4个月超过B类上边界 → 自动升级为A类 3. 升级后自动绑定策略：安全库存从5天→14天，补货频率从月度→每周，分配前置仓仓位 4. 触发立即补货：按新策略计算缺口，下单500件 - 预期产出：动态分类使新品冷启动到充足备货的时间从3个月
- 业务问题：50个C类SKU占用$20万库存，贡献营收仅3%，每个月产生$0.8万仓储费 - 算法应用：对CZ类（低销+波动大）SKU启动"最小库存策略"：安全库存降至3天，按需采购不做库存备货；对连续6个月销量<5件/月的SKU启动清仓流程 - 预期产出：C类库存从$20万降至$8万，释放$12万资金，月均仓储节省$0.5万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：动态ABC使新升级SKU及时备货，每年防止5-8次升级SKU旺季缺货，每次防损$2-5万；同时C类SKU策略瘦身释放$10-20万库存资金；系统建设成本$4万，ROI≈500-800%
实施难度：⭐⭐☆☆☆（算法简单，关键是建立"分类结果自动触发策略"的闭环，而不只是出一张分类报表）
优先级：⭐⭐⭐⭐⭐（所有有50个以上SKU的卖家必建能力，是供应链差异化管理的基础框架）
适用规模：SKU数>30个的卖家均可受益，越多SKU效果越显著
数据依赖：12个月SKU级月度销售数据（销售额/毛利/销量）、当前分类历史记录

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（300 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 54 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/dynamic_abc_stratification_adaptive_policy` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Dynamic-ABC-Stratification-Adaptive-Policy.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
动态ABC分层与策略自适应系统
功能：多维ABC分类 + XYZ波动分析 + CUSUM漂移检测 + 策略自动绑定
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUHistoricalData:
    """SKU历史数据"""
    sku_id: str
    monthly_revenue: List[float]    # 12个月销售额
    monthly_profit: List[float]     # 12个月毛利
    monthly_units: List[float]      # 12个月销量
    current_abc_class: str = 'C'   # 当前分类
    months_in_class: int = 0       # 在当前分类的月数
    is_new_product: bool = False    # 是否新品（首3个月）


# 策略矩阵（ABC × XYZ → 库存策略）
STRATEGY_MATRIX = {
    ('A', 'X'): {'safety_days': 7,  'replenish_freq': 'weekly',   'forecast': 'ml_precise',   'priority': 'HIGHEST'},
    ('A', 'Y'): {'safety_days': 14, 'replenish_freq': 'weekly',   'forecast': 'ml_calibrated','priority': 'HIGH'},
    ('A', 'Z'): {'safety_days': 21, 'replenish_freq': 'biweekly', 'forecast': 'conservative', 'priority': 'HIGH'},
    ('B', 'X'): {'safety_days': 10, 'replenish_freq': 'biweekly', 'forecast': 'statistical',  'priority': 'MEDIUM'},
    ('B', 'Y'): {'safety_days': 14, 'replenish_freq': 'monthly',  'forecast': 'statistical',  'priority': 'MEDIUM'},
    ('B', 'Z'): {'safety_days': 21, 'replenish_freq': 'adhoc',    'forecast': 'manual',       'priority': 'LOW'},
    ('C', 'X'): {'safety_days': 5,  'replenish_freq': 'monthly',  'forecast': 'simple_ma',    'priority': 'LOW'},
    ('C', 'Y'): {'safety_days': 3,  'replenish_freq': 'adhoc',    'forecast': 'simple_ma',    'priority': 'LOWEST'},
    ('C', 'Z'): {'safety_days': 3,  'replenish_freq': 'adhoc',    'forecast': 'manual',       'priority': 'LOWEST'},
}


def compute_multi_dim_score(sku: SKUHistoricalData,
                             w_revenue: float = 0.4, w_profit: float = 0.3,
                             w_units: float = 0.2, w_growth: float = 0.1) -> Dict:
    """多维ABC评分计算"""
    rev_total = sum(sku.monthly_revenue[-12:])
    profit_total = sum(sku.monthly_profit[-12:])
    units_total = sum(sku.monthly_units[-12:])
    
    # 增长率（近3个月 vs 前3个月）
    recent = np.mean(sku.monthly_revenue[-3:]) if len(sku.monthly_revenue) >= 3 else 0
    prior = np.mean(sku.monthly_revenue[-6:-3]) if len(sku.monthly_revenue) >= 6 else recent
    growth_rate = (recent - prior) / max(prior, 1)
    growth_score = np.tanh(growth_rate)  # 归一化到[-1, 1]
    
    return {
        'sku_id': sku.sku_id,
        'revenue_12m': rev_total,
        'profit_12m': profit_total,
        'units_12m': units_total,
        'growth_rate': growth_rate,
        'growth_score': growth_score,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.15621，但该号在 arXiv 上是《Multi-Robot Task Allocation using Global Games with Negative Feedback: The Colony Maintenance Problem》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：12 个月 SKU 级月度销售数据（销售额、毛利、销量）、当前库存、近期增长率与当前分类历史记录。

**输出**：更新后的 ABC 与 XYZ 分类结果、漂移检测与升降级清单、差异化策略绑定建议（安全库存天数、补货频率、清仓规则），供采购与运营团队使用。

## 执行步骤

1. 汇总 SKU 级月度销售、毛利与增长数据
2. 计算多维评分并重建 ABC 与 XYZ 分类
3. 用漂移检测识别升级与降级 SKU
4. 按新分类绑定安全库存与补货策略

## 边界与不做

- 何时不用：需要做多 SKU 尾部风险组合优化时用CVaR库存风险组合；库龄结构诊断与阶梯清仓触发用库龄分段管理与资金成本化。
- 能力边界：关键是分类结果能自动触发策略；本技能输出分类与策略建议，实际修改 ERP 参数仍须人工确认。
- 数据边界：分类依赖 12 个月 SKU 级销售数据，SKU 数超过 30 个时效果更明显，销量口径变化会造成漂移误报。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Dynamic-ABC-Stratification-Adaptive-Policy

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Dynamic-ABC-Stratification-Adaptive-Policy`