---
name: "p2s-supply-chain-resilience-modeling"
title: "Supply Chain Resilience Modeling — 供应链韧性建模：断链风险预测与备选方案规划"
description: "触发词：供应链韧性、断链风险、双重采购、备选供应商认证、安全库存优化。何时不用：只做网络瓶颈节点排序时用供应链网络中介中心性韧性分析；只做月度供需对齐与计划闭环时用S&OP销售与运营计划协同。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 订单协调"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supply-Chain-Resilience-Modeling"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "量化关键件的断链概率和恢复时间，算出该认证几家备选、各自该备多少库存。"
user_try: "试试：核心电机只有一家供应商，帮我评估断链风险，给出备选认证数量和各自的安全库存建议。"
whenToUse: "需要为关键组件决定备选供应商数量与库存水位、量化断链损失时用本技能；只做网络结构瓶颈识别用供应链网络中介中心性韧性分析。"
workflow: "录入供应商地理位置、产能、质量、交期与历史断链参数 → 估算各组件断链概率与恢复时间 → 计算韧性评分并排序最脆弱环节 → 运行双重采购优化给出认证数量与库存分配 → 模拟断链情景并输出预期损失"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supply Chain Resilience Modeling — 供应链韧性建模：断链风险预测与备选方案规划

## ① 解决的问题

广东单一电机供应商停产6周损失80万但事前不知道应该备几家备选——贝叶斯网络量化各组件断链概率和恢复时间，双重采购最优分割策略将年预期断链损失降低60-80%

## ② 核心算法逻辑

供应链韧性的两个维度：

## ③ 业务应用场景

业务问题：吸奶器的核心电机来自广东单一供应商，疫情期间停产 6 周，直接损失 ¥80 万。虽然知道需要备选供应商，但不知道应该认证几家、各自备多少库存。
数据要求： - 当前供应商信息（地理位置/年供货量/过往交期稳定性） - 历史断链事件（停产原因/持续天数） - 产品的月均消耗量和 Lead Time
预期产出： - 各组件的韧性评分（0-100） - 最脆弱的环节排序（优先处理） - 备选供应商策略：应该认证几家，各备多少库存 - 断链模拟：各种场景下的预期损失

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
识别高韧性漏洞并采取行动：避免下次断链损失 ¥30-100 万
备选供应商认证的 ROI 量化：帮助决定是否值得投入 ¥5-10 万认证成本
安全库存精准调整：既不过度积压也不断货的最优水位
年化综合 ROI：¥20-100 万（以避损为主）
实施难度：⭐⭐⭐☆☆（贝叶斯网络有成熟库（pgmpy）；断链历史数据整理约 2 周；完整系统 4-6 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（177 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/supply_chain_resilience_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supply-Chain-Resilience-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Supply Chain Resilience Modeling
供应链韧性：贝叶斯网络风险建模 + 双重采购优化
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SupplierNode:
    """供应商节点"""
    supplier_id: str
    name: str
    location_risk: float      # 0-1，地理风险（地震区/政治不稳定）
    capacity_risk: float      # 0-1，产能风险（单一大客户依赖）
    quality_risk: float       # 0-1，质量风险
    lead_time_days: int       # 正常交期
    max_disruption_days: int  # 历史最长断链天数
    disruption_probability: float  # 年断链概率


@dataclass
class ComponentChain:
    """单个组件的供应链"""
    component_name: str
    monthly_demand: float
    safety_stock_days: int
    primary_supplier: SupplierNode
    backup_suppliers: list[SupplierNode] = field(default_factory=list)


def compute_resilience_score(chain: ComponentChain) -> dict:
    """计算供应链韧性评分"""
    primary = chain.primary_supplier

    # 脆弱性评分（越高越脆弱）
    vulnerability = (
        0.4 * primary.disruption_probability +
        0.3 * primary.location_risk +
        0.3 * primary.capacity_risk
    )

    # 恢复能力（有备选供应商则恢复更快）
    if chain.backup_suppliers:
        best_backup = min(chain.backup_suppliers, key=lambda s: s.lead_time_days)
        recovery_days = best_backup.lead_time_days
        recovery_buffer = chain.safety_stock_days
        recovery_capability = 1 - min(1, max(0, recovery_days - recovery_buffer) / 30)
    else:
        recovery_capability = 0.1  # 无备选，恢复能力极低
        recovery_days = primary.max_disruption_days

    # 综合韧性分
    resilience = (1 - vulnerability * (1 - recovery_capability)) * 100

    # 期望损失天数（每年）
    expected_disruption_days = (primary.disruption_probability *
                                max(0, primary.max_disruption_days - chain.safety_stock_days))
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2406.09871 — Envelope vector solitons in nonlinear flexible mechanical metamaterials

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：当前供应商信息（地理位置、年供货量、过往交期稳定性）、历史断链事件（原因与持续天数）、产品月均消耗量与采购提前期。

**输出**：各组件韧性评分（0-100）、最脆弱环节排序、备选供应商与库存分配策略、断链情景下的预期损失模拟，供供应链与采购团队使用。

## 执行步骤

1. 整理供应商属性、历史断链与消耗数据
2. 构建贝叶斯网络估算断链概率与恢复时间
3. 计算组件韧性评分并排序脆弱环节
4. 运行双重采购优化给出认证数量与库存分割
5. 模拟断链情景并输出预期损失与改进优先级

## 边界与不做

- 何时不用：只需识别网络瓶颈节点时用供应链网络中介中心性韧性分析；只需月度需求供应对齐流程时用S&OP销售与运营计划协同。
- 能力边界：输出韧性与策略量化结果，不执行供应商认证流程与采购下单。
- 数据边界：断链历史数据整理耗时较长，缺少历史事件记录时概率估计仅为先验假设。

## 技能关联

- **前置**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Predictive-Returns-Management.html、Skill-Predictive-Returns-Management、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Carbon-Risk-GCN.html、Skill-Supply-Chain-Carbon-Risk-GCN
- **延伸**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Predictive-Returns-Management.html、Skill-Predictive-Returns-Management、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Carbon-Risk-GCN.html、Skill-Supply-Chain-Carbon-Risk-GCN
- **可组合**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Predictive-Returns-Management.html、Skill-Predictive-Returns-Management、Skill-Supply-Chain-Carbon-Risk-GCN.html、Skill-Supply-Chain-Carbon-Risk-GCN、Skill-Supply-Chain-Resilience-Modeling

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-Supply-Chain-Resilience-Modeling`