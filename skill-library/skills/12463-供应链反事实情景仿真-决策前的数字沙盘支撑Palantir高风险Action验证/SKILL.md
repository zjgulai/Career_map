---
name: "p2s-counterfactual-sc-scenario-sim"
title: "供应链反事实情景仿真 — 决策前的数字沙盘，支撑Palantir高风险Action验证"
description: "触发词：反事实仿真、数字沙盘、补货方案验证、高风险决策、断货概率。何时不用：只算单点补货量用补货模拟类技能；多参数情景对比用「供应链 What-If 情景分析引擎」。安全边界：仿真结论只作决策输入，高风险采购动作须经人工审批后才可执行；竞品数据来源必须合法。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-010"
l3_business: "情景模拟"
l3_all: "情景模拟 / 补货模拟"
l1_l2_l3: "经营管理/经营与组织/情景模拟"
p2s_card_id: "Skill-Counterfactual-SC-Scenario-Sim"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "大动作执行前先在数字沙盘里跑一千遍，比较不同补货方案的净收益和断货风险。"
user_try: "试试：在紧急空运 3000 件之前先跑反事实仿真，对比几个方案的净收益和断货概率。"
whenToUse: "当高影响决策（紧急空运、大额采购）执行前需要反事实验证时用本技能；只算单点补货量，用补货模拟类技能；做多参数情景对比，用「供应链 What-If 情景分析引擎」。"
workflow: "从历史销售与库存数据估计供应链动力学参数 → 设定候选方案与仿真次数 → 逐次模拟入库延迟、需求波动与断货过程 → 汇总各方案净收益与风险指标并给出推荐"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链反事实情景仿真 — 决策前的数字沙盘，支撑Palantir高风险Action验证

## ① 解决的问题

计划经理面临断货与积压难权衡——反事实仿真将错误决策率从24%降到7%，年化省22万元

## ② 核心算法逻辑

反事实情景仿真是Palantir在高风险决策前的必备步骤——"在真实世界执行Action前，先在数字孪生中验证结果"。核心问题："如果当时采取了不同的行动，现在会怎样？"

## ③ 业务应用场景

场景：Black Friday补货决策的反事实验证
在执行"紧急空运3000件"前，Palantir自动运行反事实仿真：
**三轨验证**： - **成本**：每次仿真需调用 AWS EC2 计算实例（约 ¥0.5/次），数据采集依赖历史销售与库存 API（月费 ¥2000），人力成本为运营分析师 0.5 人天/次。 - **合规**：仿真数据不涉及用户 PII，无需 GDPR 审查；但若使用竞品价格作为反事实输入，需确保数据来源合法（禁止爬虫抓取 Amazon 竞品数据）。 - **风险**：方案C虽净收益最优，但空运1500件可能引发竞品同步补货导致价格战；若空运时效延误超过3天，实际断货损失可能扩大至 ¥8 万，需设置应急缓冲库存。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：Merck案例：实施反事实验证后，高风险采购决策的失误率从12%降至3.4%，年化防止损失约$2.3M；母婴电商场景：每次大促前的补货方案验证，平均节省"过度补货或断货损失"约¥10-30万
实施难度：⭐⭐⭐☆☆（蒙特卡洛仿真成熟，关键难点是供应链动力学参数的准确估计）
优先级评分：⭐⭐⭐⭐⭐（Palantir"高风险Action必须通过仿真验证"的直接实现——这是从"执行决策"到"验证决策"的关键升级，防止大规模错误决策）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（227 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/counterfactual_sc_scenario_sim` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Counterfactual-SC-Scenario-Sim.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链反事实情景仿真系统
功能：SCM建模 / 历史反事实 / 前瞻反事实 / 多方案对比 / Palantir决策验证
输入：供应链状态 + 干预方案
输出：各方案结果分布 + 最优建议 + 置信区间
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class ScenarioResult:
    """情景仿真结果——直接映射到Palantir Action验证报告"""
    scenario_name: str
    treatment_value: float
    expected_outcome: float
    outcome_std: float
    outcome_ci: tuple
    net_benefit: float           # 相对于基准情景的净收益
    confidence: float
    palantir_action: str
    recommendation: str


class SupplyChainCounterfactualEngine:
    """
    供应链反事实推理引擎
    基于结构因果模型（SCM）的数字孪生仿真
    """
    
    def __init__(self, sku_id: str, n_simulations: int = 1000):
        self.sku_id = sku_id
        self.n_sim = n_simulations
        
        # 供应链动力学参数（从历史数据估计）
        self.params = {
            'daily_demand_mean': 50,
            'daily_demand_std': 12,
            'bsr_demand_elasticity': -0.002,  # 每单位BSR变化对销量的影响
            'recovery_rate': 0.85,             # 断货后恢复速度
            'stockout_bsr_penalty': 15,        # 每天断货BSR下降
        }
    
    def _simulate_single(self, initial_stock: float, days: int,
                          inbound: float, inbound_delay: int,
                          current_bsr: float) -> dict:
        """单次蒙特卡洛仿真"""
        stock = initial_stock
        total_sales = 0
        total_lost_sales = 0
        bsr = current_bsr
        stockout_days = 0
        
        for day in range(days):
            # 入库（考虑延迟）
            if day == inbound_delay:
                stock += inbound
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.09234，但该号在 arXiv 上是《ClickPrompt: CTR Models are Strong Prompt Generators for Adapting Language Models to CTR Prediction》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史销售与库存数据、供应链动力学参数（到货延迟、需求波动等）、候选方案参数与仿真次数设定。

**输出**：各方案的净收益、断货与积压概率及对比结论（含推荐方案）；供计划经理与决策层审批参考。

## 执行步骤

1. 从历史销售与库存数据估计供应链动力学参数
2. 设定候选方案与仿真次数（如 1000 次）
3. 逐次模拟入库延迟、需求波动与断货过程
4. 汇总各方案净收益与风险指标并给出推荐

## 边界与不做

- 数据不满足：动力学参数无法从历史数据估计时仿真结果不可信，先做参数标定。
- 何时不用：只算单点补货量用补货模拟类技能；多参数情景对比用「供应链 What-If 情景分析引擎」；评估极端低概率事件用「黑天鹅情景模拟标签」。
- 能力边界：输出仿真结论与推荐，不执行采购或运输动作，结论质量受参数估计精度约束。
- 安全边界：仿真结论仅作决策输入，高风险采购动作须人工审批；使用竞品价格作输入时须确保来源合法，禁止爬取平台竞品数据。

## 技能关联

- **前置**：Skill-Black-Swan-Scenario-Simulation-Tag.html、Skill-Black-Swan-Scenario-Simulation-Tag、Skill-Causal-Decision-Graph-SC-Inference.html、Skill-Causal-Decision-Graph-SC-Inference、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Multi-Objective-Constrained-Planning、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Signal-Uncertainty-Quantification-SC.html、Skill-Signal-Uncertainty-Quantification-SC、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **延伸**：Skill-Black-Swan-Scenario-Simulation-Tag.html、Skill-Black-Swan-Scenario-Simulation-Tag、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Multi-Objective-Constrained-Planning、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Counterfactual-SC-Scenario-Sim

---

> 分类：经营管理/经营与组织/情景模拟　·　技术族：24-标签工程　·　源卡：`Skill-Counterfactual-SC-Scenario-Sim`