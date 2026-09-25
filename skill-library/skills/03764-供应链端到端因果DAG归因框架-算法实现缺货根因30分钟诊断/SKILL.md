---
name: "p2s-sc-causal-dag-e2e-attribution"
title: "供应链端到端因果DAG归因框架 — Amazon PC算法+SCM实现缺货根因30分钟诊断"
description: "触发词：缺货根因、因果归因、因果DAG、异常诊断、根因分析。何时不用：需要量化供需缺口并分配有限库存时用供需缺口分析与优先级分配；需要追踪在途延误与预警时用在途库存追踪与全链路可视化。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-SC-Causal-DAG-E2E-Attribution"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用因果图把缺货和异常拆成根因权重，把原来要两天的人工排查压缩到半小时。"
user_try: "试试：这周奶瓶在 FBA 突然断货，帮我用因果 DAG 判断是预测低了、供应商延迟还是促销透支了库存。"
whenToUse: "缺货或异常已经发生、需要区分预测失误与供应失误并给出根因权重时用本技能；只需量化缺口并分配库存用供需缺口分析与优先级分配。"
workflow: "整理缺货与异常相关的多维历史时序数据 → 构建因果 DAG 骨架并注入领域先验 → 估计各根因的贡献权重 → 输出根因结论与对应干预建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链端到端因果DAG归因框架 — Amazon PC算法+SCM实现缺货根因30分钟诊断

## ① 解决的问题

缺货/异常根因靠人工多系统排查耗时2天且易误判——Amazon PC算法+SCM端到端因果DAG将根因诊断→30分钟自动归因，准确率提升45%

## ② 核心算法逻辑

问题本质：供应链运营中充斥着"相关性陷阱"——销量下降真的是库存不足造成的吗？还是竞品降价？还是广告暂停？传统 BI 只能看到相关，无法做出正确干预。Amazon 的框架解决了这个核心问题。

## ③ 业务应用场景

场景A：缺货根因诊断——是预测失误还是供应链失误？
婴儿奶瓶某周 FBA 突然 OOS（Out-of-Stock），运营复盘时争论：是需求预测低了，还是供应商延迟了，还是前一周过度促销透支了库存？
DAG 因果图揭示：促销→销量突增（L1相关）但真正缺货原因是：供应商延迟（PLT超期18天）AND 安全库存参数未随促销更新（根因权重 60% vs 40%）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：缺货/异常根因诊断从 2 天人工 → 30 分钟自动（↓95%），归因准确率提升 45%（避免错误干预），年化防止错误决策损失约 5-20 万元
实施难度：⭐⭐⭐⭐☆（需要干净的历史时序数据 + DoWhy 或本文轻量实现）
优先级：⭐⭐⭐⭐⭐（Palantir AIP 决策层的核心能力，Amazon 生产级验证）
企业AI知识库依赖：中高 — 需要历史多维时序数据仓库 + 领域先验知识库（DAG结构）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（256 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/sc_causal_dag_e2e_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-SC-Causal-DAG-E2E-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

@dataclass
class CausalNode:
    """DAG节点"""
    name: str
    is_root: bool = False
    parents: List[str] = None
    def __post_init__(self):
        if self.parents is None:
            self.parents = []

class SCCausalDAG:
    """
    供应链因果DAG——轻量实现（无需 DoWhy 依赖）
    生产环境建议用 DoWhy + GCM 模块
    
    实现：
    1. PC 算法（简化版：基于相关阈值的骨架发现）
    2. 结构方程模型（ANM：加性噪声）
    3. 根因归因（Shapley 分解）
    """
    
    def __init__(self):
        self.nodes: Dict[str, CausalNode] = {}
        self.adjacency: Dict[str, List[str]] = {}  # parent -> [children]
        self.mechanisms: Dict[str, Dict] = {}  # 每条边的因果机制参数
    
    def add_domain_knowledge(self):
        """
        注入供应链领域先验知识（减少PC算法的搜索空间）
        基于 Amazon AI4SC 论文的标准 SC 因果图结构
        """
        # 供应链标准 DAG 结构（领域知识先验）
        causal_edges = [
            # 供应侧
            ("supplier_delay_days", "actual_lead_time"),
            ("actual_lead_time", "inventory_level"),
            ("purchase_order_qty", "inventory_level"),
            ("inbound_quality_reject_rate", "effective_inbound_qty"),
            ("effective_inbound_qty", "inventory_level"),
            # 需求侧
            ("promotion_discount_pct", "daily_sales"),
            ("competitor_price_change", "daily_sales"),
            ("ad_spend_usd", "daily_sales"),
            ("seasonality_index", "daily_sales"),
            # 库存动态
            ("inventory_level", "oos_flag"),
            ("daily_sales", "inventory_level"),   # 消耗
            # 结果变量
            ("oos_flag", "lost_gmv_usd"),
            ("daily_sales", "lost_gmv_usd"),       # lost_gmv = oos × counterfactual_demand
        ]
        
        for parent, child in causal_edges:
            if parent not in self.adjacency:
                self.adjacency[parent] = []
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2408.13556，但该号在 arXiv 上是《What if? Causal Machine Learning in Supply Chain Risk Management》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：干净的历史多维时序数据（需求、库存、促销、供应商交期、安全库存参数等），以及可注入的领域先验因果知识。

**输出**：端到端因果 DAG 图、根因权重排序与诊断结论、对应干预建议，供运营复盘与供应链改进使用。

## 执行步骤

1. 整理缺货与异常相关的多维历史时序数据
2. 构建因果 DAG 骨架并注入领域先验
3. 估计根因权重并输出归因结论
4. 给出针对性干预建议

## 边界与不做

- 何时不用：需要量化供需缺口并给出分配方案时用供需缺口分析与优先级分配；需要做在途延误预警时用在途库存追踪与全链路可视化。
- 能力边界：归因依赖数据质量与领域先验假设，结论用于指导干预，不等于实验验证的因果结论。
- 数据边界：历史时序数据存在缺失或口径变化时骨架发现会失真，需先做数据清洗与参数版本对齐。

## 技能关联

- **前置**：Skill-Causal-Decision-Graph-SC-Inference.html、Skill-Causal-Decision-Graph-SC-Inference、Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-SC-WhatIf-Scenario-Analysis-Engine.html、Skill-SC-WhatIf-Scenario-Analysis-Engine、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution
- **延伸**：Skill-Causal-Decision-Graph-SC-Inference.html、Skill-Causal-Decision-Graph-SC-Inference、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-SC-WhatIf-Scenario-Analysis-Engine.html、Skill-SC-WhatIf-Scenario-Analysis-Engine
- **可组合**：Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-SC-Causal-DAG-E2E-Attribution

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：24-标签工程　·　源卡：`Skill-SC-Causal-DAG-E2E-Attribution`