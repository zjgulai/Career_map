---
name: "p2s-gmroi-inventory-investment-efficiency"
title: "GMROI库存资金投资回报优化 — 毛利润/平均库存比率最大化决策模型"
description: "触发词：GMROI、库存资金回报、资金重配置、库存分层、新品引入门槛。何时不用：要算单个 SKU 的持有成本率与订货量用「库存持有成本模型」；要拆 FBA 各项费用结构用「FBA 费用结构分析」。安全边界：调整库存配置不得跌破安全库存，避免断货；结论只作资金配置参考，不替代采购与现金流审批。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 库存分层"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-GMROI-Inventory-Investment-Efficiency"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用毛利除以平均库存投资算 GMROI，把资金从周转快但不赚钱的 SKU 挪到真正赚钱的 SKU 上。"
user_try: "试试：算出 20 个 SKU 的 GMROI，给出把 80 万美元库存预算重新分配后的组合毛利提升测算。"
whenToUse: "需要在 SKU 之间比较资金效率并重配库存预算时用本技能；算持有成本与订货量用「库存持有成本模型」；看 FBA 费用结构用「FBA 费用结构分析」。"
workflow: "计算每个 SKU 的 GMROI 并与分级阈值对标 → 找出高周转低毛利与低周转高毛利的错配 SKU → 在保留安全库存的前提下重配库存资金 → 对候选新品设 GMROI 门槛并做敏感性分析"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GMROI库存资金投资回报优化 — 毛利润/平均库存比率最大化决策模型

## ① 解决的问题

高ITO低毛利的消毒袋占用大量资金却产生极低收益——GMROI资金最优分配将相同$80万预算年度组合毛利从$144万增至$192万（+$48万），零成本增收

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中在"库存周转率与企业战略"小节明确指出：ITO/DOI是效率指标，但不是效益指标——卖毛利率1%的产品高速周转，和卖毛利率50%的产品中速周转，财务效益完全不同。GMROI（Gross Margin Return on Inventory Investment）正是将毛利和库存投资结合的综合效益指标，是库存资金配置的最优决策工具。

## ③ 业务应用场景

场景A：全SKU GMROI评估与资金重配置
- 业务问题：某卖家有20个SKU，总库存预算$80万。按传统ITO排序：电池奶瓶消毒袋（ITO=12）排第一，但毛利率只有8%，GMROI=0.96；而吸奶器（ITO=6）排第10，但毛利率45%，GMROI=2.7。卖家把更多资金配置给了消毒袋，反而降低了整体资金效率 - 数据要求：每个SKU的年销售额、采购成本、平均库存成本（含仓储费） - 算法应用： 1. 计算20个SKU的GMROI 2. 发现：吸奶器GMROI=2.7，消毒袋GMROI=0.96，温奶器GMROI=3.2（最高） 3. 资金重配置：减少消毒袋库存$8万（降至安全库存），增加温奶器$5万+吸奶器$3万 4. 预期组合
- 业务问题：每季度有3-5款新品候选，不知道选哪个值得引入并分配资金 - 算法应用：建立新品GMROI门槛（≥2.0）：预测毛利率×预测ITO（基于类似品历史），<2.0不引入，≥3.0优先引入；对每个候选新品做GMROI敏感性分析（毛利率、销量各±20%的情景） - 预期产出：新品引入成功率从40%提升至65%，年减少新品失败积压约$15万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：$80万库存预算的卖家，组合GMROI从1.8提升至2.4（+33%），年度组合毛利增加约$48万；系统建设$3万，ROI≈1600%
实施难度：⭐⭐☆☆☆（GMROI计算极简单，关键是获取每个SKU的准确毛利率数据和平均库存投资数据）
优先级：⭐⭐⭐⭐⭐（资金配置优化是零成本增收的最强杠杆，SKU数越多效益越显著）
适用规模：SKU数>10个的卖家，预算越大GMROI优化价值越高
数据依赖：年度SKU级销售额、采购成本、平均库存价值（财务账本数据）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（253 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/gmroi_inventory_investment_efficiency` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-GMROI-Inventory-Investment-Efficiency.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
GMROI库存资金投资回报优化系统
功能：GMROI精确计算 + 行业对标 + 四象限矩阵 + 资金最优分配
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUGMROIProfile:
    """SKU GMROI档案"""
    sku_id: str
    annual_revenue: float           # 年销售额($)
    annual_cogs: float              # 年销售成本($)
    avg_inventory_cost: float       # 平均库存成本($，含采购价)
    avg_holding_cost: float         # 平均持有成本（仓储+资金，$）
    min_safety_stock_cost: float    # 最低安全库存资金($，不可削减)

    @property
    def gross_profit(self) -> float:
        return self.annual_revenue - self.annual_cogs

    @property
    def gross_margin_rate(self) -> float:
        return self.gross_profit / max(self.annual_revenue, 1)

    @property
    def total_inventory_investment(self) -> float:
        return self.avg_inventory_cost + self.avg_holding_cost

    @property
    def ito(self) -> float:
        return self.annual_cogs / max(self.total_inventory_investment, 1)

    @property
    def doi(self) -> float:
        return 365 / max(self.ito, 0.01)

    @property
    def gmroi(self) -> float:
        return self.gross_profit / max(self.total_inventory_investment, 1)


def classify_gmroi(gmroi: float) -> Tuple[str, str]:
    """GMROI分级评定"""
    if gmroi >= 5.0:
        return '🏆卓越', '明星SKU，优先保障库存'
    elif gmroi >= 3.0:
        return '🟢良好', '优质SKU，维持当前策略'
    elif gmroi >= 1.5:
        return '🟡一般', '关注提升路径'
    else:
        return '🔴差', '评估是否继续运营'


def compute_gmroi_improvement_paths(sku: SKUGMROIProfile) -> List[Dict]:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.18341，但该号在 arXiv 上是《Almost diagonalization of $Ψ$DO's over various generalized function spaces》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每个 SKU 的年销售额、采购成本与平均库存成本（含仓储费），以及最低安全库存资金，粒度到 SKU 与年。

**输出**：SKU 级 GMROI 与分级评定、资金重配方案（减少与增配金额）与组合毛利提升测算，以及新品 GMROI 引入门槛与敏感性分析。

## 执行步骤

1. 汇总各 SKU 年销售额、采购成本与平均库存价值
2. 计算 GMROI、ITO 与 DOI 并分级
3. 识别高低毛利与周转错配的 SKU 集群
4. 在安全库存约束下给出资金重配方案
5. 用 GMROI 门槛筛选候选新品并做敏感性分析

## 边界与不做

- 缺少 SKU 级平均库存价值或毛利率数据时不适用，GMROI 无法计算
- 只做资金效率核算与配置建议，不代替采购下单、现金流审批与断货风险管理
- 重配不得跌破安全库存，避免为提升 GMROI 造成缺货

## 技能关联

- **前置**：Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics
- **延伸**：Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics
- **可组合**：Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics、Skill-GMROI-Inventory-Investment-Efficiency

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：04-供应链　·　源卡：`Skill-GMROI-Inventory-Investment-Efficiency`