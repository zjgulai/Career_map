---
name: "p2s-warehouse-cost-per-unit-kpi"
title: "仓储单位成本与费效比KPI — FBA/自营仓单件成本分解与效率提升量化"
description: "触发词：单件成本、FBA对比自营仓、成本临界点、仓储费。何时不用：只有总成本、没有分项费用明细时无法分解；只测算仓容够不够用用仓容规划类技能。安全边界：相关类目需满足跨境电商质量安全与食品安全标准及进口许可要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-061"
l3_business: "仓储协作"
l3_all: "仓储协作 / 经济性分析"
l1_l2_l3: "业务运营/供应与履约/仓储协作"
p2s_card_id: "Skill-Warehouse-Cost-Per-Unit-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 FBA 与自营仓的单件成本拆开算清，找出该切换模式的出货量临界点。"
user_try: "试试：帮我对比 FBA 和自营海外仓的单件成本，看什么出货量该切换。"
whenToUse: "本卡属「仓储协作」。需要在 FBA 与自营仓之间做单位成本对比与切换决策时用本卡；只测算仓容够不够用时用仓容管理与效率规划类技能。"
workflow: "汇总 FBA 仓储与履约费 → 汇总自营仓月租与人工包材 → 按出货量折算单件成本 → 求临界点并给迁移建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 仓储单位成本与费效比KPI — FBA/自营仓单件成本分解与效率提升量化

## ① 解决的问题

财务面临"FBA vs 自营仓决策拍脑袋"——单件全成本对比（含Q4仓储费3.2倍）给出临界点月出货2000件，年化节省仓储成本10-20万元

## ② 核心算法逻辑

单位仓储成本（Cost Per Unit, CPU） 是衡量仓储运营效率的核心财务指标。陈凤霞书中将仓储成本分解为四个维度，形成"费效比"分析框架：

## ③ 业务应用场景

场景A：FBA vs 自营海外仓单件成本对比 - 业务问题：是继续全用FBA还是部分迁移自营海外仓，哪个更划算？ - 数据要求：FBA月仓储费 + FBA履约费 + 自营仓月租/人工/包材 + 各渠道月出货量 - 预期产出： - FBA单件成本：$4.85（仓储$0.45 + 履约$4.40） - 自营仓单件成本：$3.20（仓储$1.20 + 人工$1.20 + 包材$0.80） - 临界点：月出货量>2000件时，自营仓更划算 - 业务价值：将2000件以上SKU迁至自营仓，年化节省约15万元
场景B：旺季Q4 FBA仓储成本提前规划 - 业务问题：Q4 Amazon仓储费是平时3.2倍，但提前不知道囤多少才合适 - 数据要求：历史Q4库存量 + 实际Q4仓储费账单 - 预期产出：每多备100件（旗舰吸奶器），Q4每月多付$35仓储费；过早入仓成本 vs 断货成本的权衡点 - 业务价值：优化入仓时间（10月初而非9月），节省Q4仓储费约$1,200
**三轨验证** | 成本轨：FBA备货成本月均2.8万元（奶粉采购成本18万/月+仓储费3500元/月+打包配送费4200元/月+系统管理人工成本2100元/月），缺货率从12%降至3%，年化增收45万元，ROI达160%，人工投入12小时/月用于库存预测和补货决策 | 合规轨：符合《跨境电商进出口商品质量安全风险预警和快速反应机制》，婴儿奶粉需满足GB 10765食品安全标准和进口许可证要求，FBA备货需通过亚马逊A9合规审查，结论：完全合规 | 风险轨：①库存积压风险（概率15%）：若销售预测偏差导致滞销，月均损失可达8000元；②汇率波动风险（概率25%）：人民币贬值可增加采购成本3-

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：通过FBA vs 自营仓精确决策，年化节省仓储成本约10-20万元；Q4提前入仓时间优化节省$1,200+/年；仓储成本率从5.5%降至4.5% = GMV 1000万品牌节省10万元
实施难度：⭐⭐☆☆☆（主要是整合FBA账单和自营仓成本数据）
优先级评分：⭐⭐⭐⭐☆（仓储成本是FBA卖家P&L第二大成本项，陈凤霞："FBA成本盲区是利润杀手"）
评估依据：Amazon FBA Q4仓储费比平季高3.2倍，精确把握入仓时机是大促成本控制关键

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（179 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/warehouse_cost_per_unit_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Warehouse-Cost-Per-Unit-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
仓储单位成本与费效比 KPI 体系
功能：FBA vs 自营仓成本对比 / 单件成本分解 / 仓储成本率 / 临界点分析
输入：仓储费用账单数据 + 出入库记录
输出：仓储成本KPI + FBA vs 自营仓对比 + 降本建议
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def compute_fba_cost_per_unit(
    monthly_units: int,
    avg_cubic_feet: float = 0.5,
    avg_weight_lbs: float = 2.0,
    avg_months_in_fba: float = 1.5,
    is_q4: bool = False,
):
    """计算FBA单件全成本"""
    # 仓储费
    storage_rate = 2.40 if is_q4 else 0.75
    monthly_storage_per_unit = avg_cubic_feet * storage_rate * avg_months_in_fba / monthly_units * monthly_units
    storage_cost_per_unit = avg_cubic_feet * storage_rate * avg_months_in_fba
    
    # 履约费（按件重量估算）
    if avg_weight_lbs <= 1:
        fulfillment_fee = 3.22
    elif avg_weight_lbs <= 2:
        fulfillment_fee = 3.86
    elif avg_weight_lbs <= 3:
        fulfillment_fee = 4.45
    elif avg_weight_lbs <= 5:
        fulfillment_fee = 5.28
    else:
        fulfillment_fee = 6.10
    
    total_fba = storage_cost_per_unit + fulfillment_fee
    return {
        'storage_cost': round(storage_cost_per_unit, 3),
        'fulfillment_fee': round(fulfillment_fee, 3),
        'total_fba_cpu': round(total_fba, 3),
    }


def compute_self_warehouse_cost(
    monthly_rent: float,
    monthly_labor: float,
    monthly_materials: float,
    monthly_units_handled: int,
    monthly_orders: int,
):
    """计算自营仓单件成本"""
    total_monthly = monthly_rent + monthly_labor + monthly_materials
    cost_per_unit = total_monthly / max(1, monthly_units_handled)
    cost_per_order = total_monthly / max(1, monthly_orders)
    cost_rate = total_monthly / (monthly_units_handled * 150) * 100  # 假设均价150元
    
    return {
        'cost_per_unit': round(cost_per_unit, 2),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.11847，但该号在 arXiv 上是《On gravity unification in SL(2N,C) gauge theories》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：FBA 月仓储费与履约费账单、自营仓月租与人工包材成本、各渠道月出货量，以及旺季的费率变化。

**输出**：FBA 与自营仓的单件全成本分解、两种模式的成本临界点出货量，以及入仓时机与费用优化建议。

## 执行步骤

1. 汇总 FBA 仓储费与履约费明细
2. 汇总自营仓月租、人工与包材成本
3. 按出货量折算两侧单件成本
4. 求成本临界点并输出迁移建议
5. 测算旺季费率下的入仓时机优化空间

## 边界与不做

- 只有总成本、没有分项费用明细时无法分解，不用本卡
- 本卡产出成本对比与临界点结论，不负责租仓谈判与实际渠道切换
- 相关类目需满足跨境电商质量安全与食品安全标准及进口许可要求

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI.html、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI、Skill-First-Last-Mile-Cost-KPI-CrossBorder.html、Skill-First-Last-Mile-Cost-KPI-CrossBorder、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning、Skill-Warehouse-Operations-KPI-Picking-Efficiency.html、Skill-Warehouse-Operations-KPI-Picking-Efficiency
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-First-Last-Mile-Cost-KPI-CrossBorder.html、Skill-First-Last-Mile-Cost-KPI-CrossBorder、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-First-Last-Mile-Cost-KPI-CrossBorder.html、Skill-First-Last-Mile-Cost-KPI-CrossBorder、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Warehouse-Cost-Per-Unit-KPI

---

> 分类：业务运营/供应与履约/仓储协作　·　技术族：04-供应链　·　源卡：`Skill-Warehouse-Cost-Per-Unit-KPI`