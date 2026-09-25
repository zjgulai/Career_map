---
name: "p2s-fill-rate-oos-cost-quantification"
title: "需求满足率与缺货成本全量化 — Fill Rate三层模型与OOS全链路损失计算"
description: "触发词：缺货成本量化、需求满足率、Fill Rate、排名恢复损失、买家流失成本。何时不用：只想算该补多少货时用「自动补货决策」；要跟踪在途与到货异常时走「履约跟踪」类技能。安全边界：LTV、评分影响等损失口径必须用自有历史数据建模，估算值不得当财务口径对外披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Fill-Rate-OOS-Cost-Quantification"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把一次断货的真实代价算全：少卖的、排名掉的、客户流失的、白投的广告，一个都不漏。"
user_try: "试试：这次吸奶器断货 7 天，按五层口径算真实损失，并给出三层 Fill Rate 周报指标。"
whenToUse: "要把缺货损失算全、或要建立 Line/Order/Unit 三层 Fill Rate 周报时用；只想知道该补多少货，用「补货模拟」类技能即可。"
workflow: "按订单行计算三层 Fill Rate → 分五层量化缺货损失 → 对低于目标的 SKU 触发补货评审 → 输出周报与损失明细"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 需求满足率与缺货成本全量化 — Fill Rate三层模型与OOS全链路损失计算

## ① 解决的问题

7天缺货损失被估算$6650实际高达$23290——OOS五层全量化模型（直接+排名+流失+广告+评分）揭示真实损失是传统估算3.5倍，支撑正确安全库存决策

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中明确区分"缺货率"和"满足率"两个相关但不同的KPI：缺货率关注"什么时候没货"（时间维度），满足率关注"多少需求被满足"（数量维度）。书中特别强调：缺货的损失远不止"这次没卖出去"——更深层的损失包括：搜索排名下降（算法惩罚）、买家转向竞品（可能永久流失）、品牌口碑损伤（Review减少）。这些隐性损失往往是直接销售损失的35倍。

## ③ 业务应用场景

- 业务问题：某卖家吸奶器爆款因备货不足OOS了7天，运营团队估算损失"只有7天×25件×$38=$6650"，觉得还好。但实际损失远不止于此 - 数据要求：OOS前后销量和排名数据、广告花费、历史评分、Buy Box拥有率 - 算法应用： 1. L1直接损失：7天×25件×$38=$6650 2. L2排名恢复期损失：补货后排名从P50降至P300，恢复需12天，流量衰减60%；损失=12天×25×0.6×$38=$6840 3. L3买家流失：7天访客约1400人，转化率3%流失永久，LTV=$220/人；损失=1400×3%×$220=$9240 4. L4广告浪费：7天继续投放$560
场景B：Fill Rate KPI体系建立（亚马逊运营团队）
- 业务问题：运营团队没有Fill Rate指标，只追踪"有没有货"（二值），不知道"满足了多少需求" - 算法应用：建立三层Fill Rate周报：Line Fill Rate（目标≥97%）、Order Fill Rate（目标≥94%）、Unit Fill Rate（目标≥99%）；每周报告各层Fill Rate，低于目标的SKU自动触发补货评审 - 预期产出：引入Fill Rate KPI后3个月，缺货率从12%降至5%，月均GMV提升8%（约$4万）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月销$50万卖家，OOS真实成本=传统估算的3.5倍；通过正确量化后优化安全库存策略，年减少OOS 60%，避免损失约$8万；系统成本$2万，ROI≈400%
实施难度：⭐⭐⭐☆☆（Fill Rate计算本身简单，难点是L3（买家流失LTV）和L5（评分影响）的量化需要历史数据建模）
优先级：⭐⭐⭐⭐⭐（OOS成本被严重低估是行业普遍现象，量化后直接改变安全库存决策ROI方程）
适用规模：所有规模，月销>$1万就值得建立Fill Rate监控
数据依赖：订单级入库/出库记录（含OOS标记）、广告花费、评分历史、Buy Box拥有率历史

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（319 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/fill_rate_oos_cost_quantification` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Fill-Rate-OOS-Cost-Quantification.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
需求满足率与缺货成本全量化系统
功能：Fill Rate三层计算 + OOS五层成本量化 + 动态FR预测 + 决策框架
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


@dataclass
class OrderLine:
    """订单行"""
    order_id: str
    sku_id: str
    demanded_qty: int
    fulfilled_qty: int
    oos_occurred: bool = False

    @property
    def line_fulfilled(self) -> bool:
        return self.fulfilled_qty >= self.demanded_qty * 0.98

    @property
    def unit_fill_rate(self) -> float:
        return self.fulfilled_qty / max(self.demanded_qty, 1)


@dataclass
class OOSEvent:
    """缺货事件"""
    sku_id: str
    start_date: datetime
    end_date: datetime
    daily_demand_pre_oos: float     # OOS前日均销量
    unit_margin: float              # 单位毛利($)
    # 广告参数
    daily_ad_spend: float           # 日广告花费($)
    # 排名影响参数
    rank_recovery_days: int = 10    # 排名恢复天数
    rank_flow_decay: float = 0.55   # 排名恢复期流量衰减
    # 买家流失参数
    daily_visitors_pre_oos: int = 0 # OOS前日访客数
    permanent_loss_rate: float = 0.08  # 永久流失率
    customer_ltv: float = 150.0     # 客户生命周期价值($)

    @property
    def oos_days(self) -> int:
        return max((self.end_date - self.start_date).days, 0)


def compute_fill_rates(order_lines: List[OrderLine]) -> Dict:
    """计算三层Fill Rate"""
    if not order_lines:
        return {}

    # Line Fill Rate
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2404.11237 — Physics of nova outbursts: Theoretical models of classical nova outbursts with optically thick winds on $1.2~M_\odot$ and $1.3~M_\odot$ white dwarfs

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：订单级入库与出库记录（含缺货标记，订单行需含需求量与已满足量）、缺货前后销量与排名数据、广告花费、历史评分、Buy Box 拥有率。

**输出**：Line/Order/Unit 三层 Fill Rate 及目标对比、缺货五层损失明细与合计、低于目标的 SKU 补货评审清单，供运营与财务复盘。

## 执行步骤

1. 按订单行汇总需求量与已满足量
2. 计算三层 Fill Rate
3. 分五层量化缺货期间的直接、排名、流失、广告与评分损失
4. 对低于目标的 SKU 生成补货评审项
5. 输出周报口径的满足率与损失明细

## 边界与不做

- 数据不满足时不适用：没有订单级出库记录与缺货标记时算不出 Fill Rate；缺评分与 Buy Box 历史则评分影响层无法量化。
- 能力边界：买家流失与评分影响需用自有历史数据建模，结论是估算值而非财务口径，不用于对外披露。

## 技能关联

- **前置**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **延伸**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **可组合**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Fill-Rate-OOS-Cost-Quantification

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Fill-Rate-OOS-Cost-Quantification`