---
name: "p2s-dynamic-dag-orchestration"
title: "Dynamic DAG Orchestration — 运行时动态调整工作流拓扑"
description: "触发词：动态拓扑、置信门控、运行时插节点、转人工审核、备货决策。何时不用：依赖固定、只要稳定执行与失败重试用「DAG 任务解耦规划」或「MAS Orchestrator」；按任务形态选拓扑用「任务自适应拓扑路由」。安全边界：置信度低于阈值必须停机并转人工审核，不得在低置信状态下继续放大备货或产能投入。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-Dynamic-DAG-Orchestration"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "工作流跑到一半发现置信度不够就停、发现供应缺口就插新节点，让拓扑跟着数据实时变。"
user_try: "试试：备货链路里需求预测置信度低于 60% 就停下转人工，高于 85% 且供应缺口大于 30% 就自动插紧急产能评估。"
whenToUse: "当流水线需要在运行中依据中间结果增删节点或改道转人工时用本技能；依赖关系固定、只要稳定执行与失败重试，用「DAG 任务解耦规划」或「MAS Orchestrator」；要在多种拓扑间选择，用「任务自适应拓扑路由」。"
workflow: "构建初始节点与依赖（需求预测、竞品分析、供应链评估、毛利优化、决策汇总） → 为节点设定状态与置信度门控判据 → 按判据在运行时注入新节点（如紧急产能评估） → 置信度不足时停止后续节点并转人工审核 → 输出调整后的拓扑与执行记录"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Dynamic DAG Orchestration — 运行时动态调整工作流拓扑

## ① 解决的问题

问题：选品流水线包含市场评估 → 深度竞品分析 → 毛利测算 → 合规检查 → 输出报告共 5 个串行节点

## ② 核心算法逻辑

传统静态 DAG 在运行前锁定全部节点与依赖关系，无法根据中间结果动态调整执行路径。动态 DAG 通过条件评估 + 拓扑变更 + 调度器感知三层机制，在执行阶段持续改写 DAG，实现"发现 A 就跳过 B，发现 C 就插入 D"的条件语义。

## ③ 业务应用场景

业务问题： 母婴品牌方在 618/双 11 大促前需决定各品类的备货量。传统流程为：需求预测 Agent → 竞品库存分析 Agent → 供应链可达性评估 Agent → 毛利率优化 Agent → 最终备货决策，共 5 个串行节点，耗时 8 小时。但若需求预测 Agent 发现某品类预测置信度 < 60%（数据稀疏），后续 3 个 Agent 的分析结果不可信，应立即停止并转入"人工审核"流程，避免盲目备货导致滞销。反之，若预测置信度 > 85% 且竞品库存分析 Agent 发现该品类供应缺口 > 30%，应动态插入"紧急产能评估"节点，确保供应链能支撑激进备货。
具体数据规模： - 日均评估品类数：120 个 - 大促前评估周期：7 天 - 平均单品类处理耗时：480 秒（静态 DAG） - 涉及 Agent 数：5 个（需求预测、竞品分析、供应链评估、毛利优化、决策汇总）
量化产出： - 准确率提升：从 78% → 91%（误判率从 22% → 9%） - 误判损失降低：¥38 万/周期（7 天 × 120 品类 × ¥45 平均误判成本） - 销售额增长：大促期间激进备货品类销售额提升 18%（¥120 万/周期） - 处理效率：日均处理时间从 960 分钟 → 640 分钟，提升 33%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

38 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（276 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/mas/dynamic_dag_orchestration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Dynamic-DAG-Orchestration.md`），已与卡面节选核对，不依赖上述路径。

```python
import json
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import random

class NodeStatus(Enum):
    """节点执行状态"""
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"
    FAILED = "FAILED"

@dataclass
class DAGNode:
    """DAG 节点定义"""
    node_id: str
    node_name: str
    dependencies: List[str] = field(default_factory=list)
    status: NodeStatus = NodeStatus.PENDING
    output: Dict[str, Any] = field(default_factory=dict)
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """执行节点逻辑（模拟）"""
        self.status = NodeStatus.RUNNING
        # 模拟节点执行
        if self.node_id == "demand_forecast":
            confidence = random.uniform(0.5, 0.95)
            self.output = {"confidence": confidence, "forecast_value": random.randint(100, 1000)}
        elif self.node_id == "competitor_analysis":
            self.output = {"market_saturation": random.uniform(0.3, 0.9)}
        elif self.node_id == "supply_chain_eval":
            self.output = {"supply_gap": random.uniform(0.1, 0.5)}
        elif self.node_id == "margin_optimization":
            self.output = {"optimal_margin": random.uniform(0.2, 0.5)}
        elif self.node_id == "emergency_capacity":
            self.output = {"capacity_available": random.choice([True, False])}
        elif self.node_id == "human_review":
            self.output = {"review_passed": random.choice([True, False])}
        elif self.node_id == "final_decision":
            self.output = {"decision": "proceed" if random.random() > 0.2 else "hold"}
        
        self.status = NodeStatus.COMPLETED
        return self.output

@dataclass
class DynamicDAG:
    """动态 DAG 编排引擎"""
    nodes: Dict[str, DAGNode] = field(default_factory=dict)
    execution_log: List[Dict[str, Any]] = field(default_factory=list)
    
    def add_node(self, node: DAGNode) -> None:
        """添加节点"""
        self.nodes[node.node_id] = node
    
    def inject_node(self, new_node: DAGNode, after_node_id: str) -> None:
        """动态插入节点：在指定节点后插入新节点"""
        self.add_node(new_node)
        # 更新依赖关系
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
⚠️ 该号被 19 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：初始 DAG（节点与依赖）、各节点中间产出与置信度，以及触发增删节点的判据（置信度阈值、供应缺口阈值等）；按品类或任务粒度。

**输出**：运行时调整后的 DAG 与执行轨迹（含插入节点、转人工分支）；供编排层执行与业务方复核。

## 执行步骤

1. 构建初始节点与依赖（需求预测、竞品分析、供应链评估、毛利优化、决策汇总）
2. 设定节点状态与置信度门控判据
3. 按判据在运行时注入新节点（如紧急产能评估）
4. 停止低置信分支的后续节点并转人工审核
5. 输出调整后的拓扑与执行记录

## 边界与不做

- 数据不满足：中间结果置信度无法获取时门控失效，先补置信度输出。
- 何时不用：静态 DAG 稳定执行用「DAG 任务解耦规划」；失败恢复与重试用「MAS Orchestrator」；按任务形态选拓扑用「任务自适应拓扑路由」。
- 能力边界：产出的是门控判据与拓扑调整契约，不做执行器，也不替代人工审核本身。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Context-Aware-Agent-Routing、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]
- **延伸**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation
- **可组合**：Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework、Skill-Dynamic-DAG-Orchestration

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-Dynamic-DAG-Orchestration`