---
name: "p2s-cross-domain-supply-chain-signal-fusion"
title: "跨域供应链信号融合引擎 — 多域Tag汇聚、冲突消解与统一决策信号生成"
description: "触发词：跨域信号融合、标签冲突消解、风险叠加、统一决策信号、多域扫描。何时不用：只看单一域原始指标时用该域的诊断技能；要把预测结果写成可查询标签时用预测型标签引擎技能。安全边界：融合规则须保留单域原始信号与出处，不得只输出融合结论而丢掉可追溯性。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Cross-Domain-Supply-Chain-Signal-Fusion"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把库存、采购、合规、物流的信号合到一起看，找出每个域单独看都不严重、叠加起来却很危险的 SKU。"
user_try: "试试：对 500 个 SKU 的 5 个域标签做一次跨域融合扫描，列出单域中低风险但跨域组合为高风险的条目。"
whenToUse: "多个业务域各自有信号、需要合并成统一风险判断时用本技能；只看单一域指标或只做标签落库，用对应领域的技能。"
workflow: "汇集各域标签与信号 → 定义跨域组合规则与解决策略 → 按保守原则消解冲突，取更高风险信号 → 输出融合后的统一风险等级 → 按风险等级触发差异化动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 跨域供应链信号融合引擎 — 多域Tag汇聚、冲突消解与统一决策信号生成

## ① 解决的问题

供应链团队面临"各域Tag孤岛，单域看风险medium却跨域组合成critical"——5域加权融合引擎将断货预警准确率提升60%，Black Friday前识别23个隐性高风险SKU，提前行动避免50万元损失

## ② 核心算法逻辑

跨域信号融合 是整个供应链智能化的核心枢纽——每个域（采购/库存/物流/合规）都在独立产生 Tag，但决策需要跨域联合信号。

## ③ 业务应用场景

单域视角（片面）： - 库存域：stockout_risk = medium（DOS = 8天） - 采购域：supplier.delivery_status = delayed_5days - 合规域：新增FDA检查通知 - 物流域：主要港口拥堵预警
业务价值：单域看风险 medium，跨域融合后识别出 critical，提前14天行动，避免断货损失约25万元
场景B：Black Friday前全品类跨域风险扫描 - 扫描500个SKU × 5个域的信号 - 识别出23个SKU存在"多域叠加风险"（单域看都不严重，跨域组合后为高风险） - 提前触发差异化备货策略

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：跨域信号融合识别出单域看不见的组合风险，Black Friday前扫描发现23个多域叠加风险SKU，提前行动避免约50万元断货损失；消除"部门各自为政"导致的信息不对称，决策质量提升30%
实施难度：⭐⭐⭐⭐☆（最大挑战是各域Tag的实时同步和冲突规则设计，需要跨团队协作）
优先级评分：⭐⭐⭐⭐⭐（这是整个架构的"神经中枢"——没有跨域信号融合，每个域的Tag都只是孤岛）
评估依据：Palantir案例：医药供应链实施跨域信号融合后，断供预警准确率提升60%，平均提前响应时间从7天→2天

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（297 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/cross_domain_supply_chain_signal_fusion` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Cross-Domain-Supply-Chain-Signal-Fusion.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
跨域供应链信号融合引擎
功能：多域Tag收集 / 信号归一化 / 冲突消解 / 综合决策信号生成 / Action触发
输入：各域实时标签状态
输出：实体级综合风险信号 + 触发Action建议
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Any, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


# ===== 域信号定义 =====
DOMAIN_WEIGHTS = {
    "compliance":  0.25,  # 合规域权重最高（法规风险不可忽视）
    "inventory":   0.22,  # 库存域（直接影响销售）
    "procurement": 0.20,  # 采购域（供应保障）
    "logistics":   0.18,  # 物流域（履约时效）
    "finance":     0.15,  # 财务域（成本影响）
}

SIGNAL_CONFIG = {
    "inventory": {
        "stockout_risk": {"values": {"critical": 1.0, "high": 0.75, "medium": 0.5, "low": 0.2, "none": 0.0}},
        "overstock_flag": {"values": {True: 0.3, False: 0.0}},
        "dos": {"normalize": lambda v: max(0, 1 - v / 30.0)},  # 0天=1.0风险, 30天=0.0
        "abc_class": {"values": {"A": 0.0, "B": 0.1, "C": 0.2, "D": 0.3, "E": 0.4}},  # A类更关键
    },
    "procurement": {
        "supplier_delivery_status": {"values": {"on_time": 0.0, "delayed_3d": 0.4, "delayed_7d": 0.7, "cancelled": 1.0}},
        "po_exception": {"values": {True: 0.6, False: 0.0}},
        "price_variance": {"normalize": lambda v: min(1.0, max(0, v / 0.2))},  # 20%偏差=满分
    },
    "logistics": {
        "shipment_delay_risk": {"values": {"critical": 1.0, "high": 0.7, "medium": 0.4, "low": 0.1}},
        "port_congestion": {"values": {True: 0.5, False: 0.0}},
        "carrier_reliability": {"normalize": lambda v: max(0, 1 - v)},  # 1.0可靠=0.0风险
    },
    "compliance": {
        "compliance_status": {"values": {"non_compliant": 1.0, "under_review": 0.6, "compliant": 0.0}},
        "tariff_change_flag": {"values": {True: 0.7, False: 0.0}},
        "regulatory_alert": {"values": {True: 0.8, False: 0.0}},
    },
    "finance": {
        "margin_tier": {"values": {"negative": 1.0, "low": 0.6, "medium": 0.3, "high": 0.0}},
        "cash_flow_stress": {"values": {True: 0.5, False: 0.0}},
    },
}

CONFLICT_RESOLUTION_RULES = [
    # (域A标签, 域B标签, 解决策略)
    # 保守原则：取更高风险的信号
    ("inventory.stockout_risk", "procurement.supplier_delivery_status",
     "take_higher_risk"),
    ("compliance.compliance_status", "inventory.stockout_risk",
     "compliance_priority"),  # 合规问题覆盖库存决策
]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.14481，但该号在 arXiv 上是《Strange Expectations in Affine Weyl Groups》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各业务域的最新标签与信号（库存、采购、合规、物流等，含标签值与时间戳）以及跨域组合规则，粒度到单个 SKU 与单个域信号。

**输出**：融合后的统一风险等级、命中的跨域组合说明与建议解决策略，供供应链团队按风险差异安排备货与预警。

## 执行步骤

1. 汇集各业务域的最新标签与信号
2. 把单域标签映射到统一风险口径
3. 按跨域组合规则做冲突消解，保守取更高风险
4. 输出融合风险等级与命中的组合原因
5. 按风险等级触发差异化备货与预警动作

## 边界与不做

- 各域标签口径不统一或关键域信号缺失时融合结论不可靠；只有单一域数据的场景不属于本技能。
- 本技能只产出融合判据与风险标签，不执行备货与调拨动作，也不替代人对重大风险的最终判断。

## 技能关联

- **前置**：Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Cross-Domain-Supply-Chain-Signal-Fusion

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：24-标签工程　·　源卡：`Skill-Cross-Domain-Supply-Chain-Signal-Fusion`