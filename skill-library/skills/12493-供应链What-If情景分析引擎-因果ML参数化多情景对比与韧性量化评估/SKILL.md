---
name: "p2s-sc-whatif-scenario-analysis-engine"
title: "供应链What-If情景分析引擎 — 因果ML参数化多情景对比与韧性量化评估"
description: "触发词：What-If、情景对比、因果效应、促销力度、韧性评估。何时不用：验证单个高风险动作的净收益用「反事实情景仿真」；量化政策尾部风险用「蒙特卡洛地缘政治尾部风险量化」。安全边界：因果效应估计须标注识别假设与协变量，不得把混淆下的相关性当作因果结论。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-010"
l3_business: "情景模拟"
l3_all: "情景模拟 / 资源情景比较"
l1_l2_l3: "经营管理/经营与组织/情景模拟"
p2s_card_id: "Skill-SC-WhatIf-Scenario-Analysis-Engine"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把促销力度、物流策略等方案参数化，半小时跑出各情景的因果增量和毛利影响。"
user_try: "试试：黑五对比折扣 0%、15%、20%、30% 四个情景，分离季节效应后告诉我哪个毛利最优。"
whenToUse: "当要对同一决策的多个参数取值做情景对比、并分离季节等混淆因素时用本技能；验证单个高风险动作的净收益用「反事实情景仿真」；量化政策尾部风险用「蒙特卡洛地缘政治尾部风险量化」。"
workflow: "设定情景参数组合（如折扣 0%、15%、20%、30%） → 用因果模型分离季节效应并估计各情景的处理效应 → 做蒙特卡洛抽样给出不确定性区间 → 对比各情景 GMV 与毛利影响并给出推荐"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链What-If情景分析引擎 — 因果ML参数化多情景对比与韧性量化评估

## ① 解决的问题

促销力度/物流策略等决策缺乏量化多情景对比靠感觉——因果ML双重稳健估计将多情景分析从2天人工→30分钟引擎输出，避免过度折扣损失毛利5-10万元/年

## ② 核心算法逻辑

Palantir Workshop 层的核心能力：不仅展示"现在是什么"，而是回答"如果...会怎样"。WhatIf 引擎是连接"分析"和"决策"的关键桥梁——让运营人员在决策前能看到多个情景的量化结果对比。

## ③ 业务应用场景

场景A：黑五促销力度决策——折扣20%还是30%？
品牌面临黑五促销决策，历史数据显示折扣高的时候销量确实高，但也可能是因为黑五本身需求旺盛（混淆变量）。What-If 引擎运行 4 个情景：折扣 0%/15%/20%/30%，分离季节效应后给出因果效应对比：
| 情景 | 因果销量增量 | 预估GMV | 毛利影响 | 推荐 | |------|------------|--------|---------|------| | 折扣0% | +0 件 | $12K | 基线 | - | | 折扣15% | +85 件 | $15.8K | +$2.4K | ✅ 最优 | | 折扣20% | +120 件 | $17.2K | +$1.8K | - | | 折扣30% | +180 件 | $18.9K | -$0.5K | ❌ 负利润 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：促销决策避免过度折扣损失毛利 5-10 万元/年；物流策略 ROI 量化节省决策试错成本；情景对比从 2 天人工分析 → 30 分钟引擎输出
实施难度：⭐⭐⭐☆☆（主要是弹性系数标定，其余为标准 Python）
优先级：⭐⭐⭐⭐☆（Palantir Workshop Layer 标志性能力，决策文化成熟度标志）
企业AI知识库依赖：中 — 需要历史弹性数据标定 + 行业基准弹性参数库

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（280 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/sc_whatif_scenario_analysis_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-SC-WhatIf-Scenario-Analysis-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
import itertools

@dataclass
class ScenarioParameter:
    """情景参数定义"""
    name: str
    values: List[Any]           # 待比较的参数值
    unit: str = ""
    is_causal_treatment: bool = True  # 是否作为因果干预变量

@dataclass
class ScenarioResult:
    """单个情景的分析结果"""
    scenario_id: str
    params: Dict[str, Any]
    gmv_estimate: float
    gmv_p10: float
    gmv_p90: float
    profit_estimate: float
    risk_score: float           # 0-100, 越高越危险
    is_pareto_optimal: bool = False
    recommendation: str = ""

class WhatIfScenarioEngine:
    """
    供应链 What-If 情景分析引擎
    
    对标 Palantir Workshop Layer:
    - 参数化多情景定义
    - 因果效应估算（双重稳健）
    - Monte Carlo 不确定性量化
    - Pareto 最优情景识别
    """
    
    def __init__(self, causal_model=None, n_simulations: int = 500):
        """
        Args:
            causal_model: 因果模型（可传入 SCCausalDAG 实例）
            n_simulations: Monte Carlo 次数
        """
        self.causal_model = causal_model
        self.n_simulations = n_simulations
    
    def _estimate_causal_effect(self, treatment_var: str, treatment_value: float,
                                 control_value: float, baseline_metric: float,
                                 elasticity: float, std_frac: float = 0.15) -> tuple:
        """
        因果效应估算（简化的双重稳健估计）
        
        Returns:
            (effect_estimate, p10, p90)
        """
        # 点估计：线性因果效应
        delta_treatment = treatment_value - control_value
        effect = baseline_metric * (1 + elasticity * delta_treatment / max(abs(control_value), 1))
        
        # Monte Carlo 不确定性
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2408.13556 — What if? Causal Machine Learning in Supply Chain Risk Management
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：情景参数（折扣力度、物流策略等）、历史销量与弹性数据、因果模型或行业基准弹性参数，以及蒙特卡洛抽样次数。

**输出**：各情景的因果销量增量、预估 GMV 与毛利影响对比及推荐结论；供运营与决策层选择方案。

## 执行步骤

1. 设定情景参数组合（如折扣 0%、15%、20%、30%）
2. 用因果模型分离季节效应并估计各情景的处理效应
3. 做蒙特卡洛抽样给出不确定性区间
4. 对比各情景 GMV 与毛利影响并给出推荐

## 边界与不做

- 数据不满足：没有历史弹性数据或基准弹性参数时无法标定，先补标定数据。
- 何时不用：验证单个高风险动作净收益用「反事实情景仿真」；量化尾部风险用「蒙特卡洛地缘政治尾部风险量化」；要做消费者行为推演用「生成式智能体沙盒仿真」。
- 能力边界：输出情景对比与推荐，不执行促销或物流动作，结论依赖弹性标定质量。
- 安全边界：因果效应估计须标注识别假设与协变量，不得把混淆下的相关性当作因果结论对外引用。

## 技能关联

- **前置**：Skill-Black-Swan-Scenario-Simulation-Tag.html、Skill-Black-Swan-Scenario-Simulation-Tag、Skill-Counterfactual-SC-Scenario-Sim.html、Skill-Counterfactual-SC-Scenario-Sim、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-SCPA-Autonomous-SC-Planning-Agent.html、Skill-SCPA-Autonomous-SC-Planning-Agent
- **延伸**：Skill-Counterfactual-SC-Scenario-Sim.html、Skill-Counterfactual-SC-Scenario-Sim、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-SCPA-Autonomous-SC-Planning-Agent.html、Skill-SCPA-Autonomous-SC-Planning-Agent
- **可组合**：Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-SCPA-Autonomous-SC-Planning-Agent.html、Skill-SCPA-Autonomous-SC-Planning-Agent、Skill-SC-WhatIf-Scenario-Analysis-Engine

---

> 分类：经营管理/经营与组织/情景模拟　·　技术族：24-标签工程　·　源卡：`Skill-SC-WhatIf-Scenario-Analysis-Engine`