---
name: "p2s-dag-ta[REDACTED]"
title: "TDP — DAG 任务解耦规划：82% Token 节省 + 错误隔离"
description: "触发词：DAG 解耦、任务分解、错误隔离、局部重算、Token 节省。何时不用：运行时动态增删节点用「Dynamic DAG Orchestration」；按任务形态自动选拓扑用「任务自适应拓扑路由」。安全边界：节点间必须传结构化中间结果，禁止用「约 500 件」这类自然语言模糊值传递关键数值。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / 业务工具实现"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-DAG-Ta[REDACTED]"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把补货这种多步计算拆成 DAG 节点，节点间传结构化结果，错了只重算出错那一步。"
user_try: "试试：把 FBA 补货的需求预测、安全库存、MOQ 校验拆成 DAG，MOQ 失败时只重算该节点。"
whenToUse: "当多步任务存在雪崩式错误传播、需要结构化中间结果与局部重算时用本技能；需要运行时动态增删节点用「Dynamic DAG Orchestration」；要按任务形态自动选拓扑用「任务自适应拓扑路由」。"
workflow: "把任务拆成节点并声明依赖，构建 DAG 图 → 对节点做拓扑排序确定执行序 → 以结构化 Schema 在节点间传递中间结果 → 节点失败时暂停整图，修复后仅重算该节点并复用其他节点缓存"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TDP — DAG 任务解耦规划：82% Token 节省 + 错误隔离

## ① 解决的问题

业务场景：Amazon FBA 补货决策，需要综合需求预测、安全库存、MOQ 约束三路计算

## ② 核心算法逻辑

传统 LLM Agent 在执行复杂任务时，把所有历史消息塞入 context window（"full history" 模式），导致两个问题：

## ③ 业务应用场景

业务场景：Amazon FBA 补货决策，需要综合需求预测、安全库存、MOQ 约束三路计算。
痛点：顺序执行时，需求预测步骤的输出作为文本传入安全库存计算，一旦预测值描述模糊（"约 500 件"），安全库存 Agent 可能基于错误理解做出偏差计算，最终补货单出现雪崩错误。
效果： - 每节点 context 平均 ~200 tokens（vs 全历史 ~1,500 tokens）= token -87% - MOQ 验证失败时，仅重算 moq_validation 节点，其他节点结果缓存复用 - 错误不传播：需求预测临时失败 → 整个补货 DAG 暂停，不产生错误采购单

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

Claude API 调用成本：假设月均 100 次上架流程 × $0.05/次 → TDP 后 ~$0.009/次，月省 ~$4,100
上架错误重跑：平均每次全流程重跑 ~15min → TDP 局部重算 ~3min，运营效率 +80%
错误雪崩导致的错误采购单：每次损失估算 $2,000-8,000 → TDP 完全规避

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（338 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/llm_agent_engineering/dag_task_decomposition_planning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-DAG-Ta[REDACTED].md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TDP: Task Decoupled Planning for LLM Agents
DAG 任务解耦规划 — 82% Token 节省 + 错误隔离

论文: arXiv 2601.07577 | 2026年1月
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Callable, Optional
from collections import deque
import copy


# ─── 数据结构 ────────────────────────────────────────────────────────────────

@dataclass
class DAGNode:
    """DAG 任务节点：每节点有独立的 scoped context"""
    node_id: str
    task_desc: str
    dependencies: list[str] = field(default_factory=list)  # 上游节点 ID
    scoped_context: dict[str, Any] = field(default_factory=dict)  # 仅包含本节点所需输入
    output: Optional[Any] = None
    status: str = "pending"  # pending / running / done / failed


# ─── DAG 图结构 ──────────────────────────────────────────────────────────────

class TaskDAG:
    """有向无环图任务结构"""

    def __init__(self):
        self._nodes: dict[str, DAGNode] = {}

    def add_node(self, node: DAGNode) -> None:
        self._nodes[node.node_id] = node

    def get_node(self, node_id: str) -> Optional[DAGNode]:
        return self._nodes.get(node_id)

    def topological_sort(self) -> list[str]:
        """Kahn 算法拓扑排序"""
        in_degree = {nid: 0 for nid in self._nodes}
        for node in self._nodes.values():
            for dep in node.dependencies:
                in_degree[node.node_id] += 1

        queue = deque(nid for nid, deg in in_degree.items() if deg == 0)
        order = []
        while queue:
            nid = queue.popleft()
            order.append(nid)
            for node in self._nodes.values():
                if nid in node.dependencies:
                    in_degree[node.node_id] -= 1
                    if in_degree[node.node_id] == 0:
                        queue.append(node.node_id)

        if len(order) != len(self._nodes):
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2601.07577 — Beyond Entangled Planning: Task-Decoupled Planning for Long-Horizon Agents

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：任务步骤清单与依赖关系、每个节点的输入输出 Schema 与可缓存策略；如补货场景的需求预测、安全库存、MOQ 约束三路数据。

**输出**：拓扑排序后的可执行 DAG 与各节点结构化输出（含缓存复用与失败暂停标记）；供编排层执行与运营查看。

## 执行步骤

1. 把任务拆成节点并声明依赖，构建 DAG 图
2. 做拓扑排序确定节点执行顺序
3. 用结构化 Schema 在节点间传递中间结果
4. 暂停整图以阻止错误传播，修复后仅重算该节点并复用其余缓存
5. 输出执行结果与失败隔离记录

## 边界与不做

- 数据不满足：节点输入 Schema 与依赖关系无法确定时先定契约，不要直接编排。
- 何时不用：运行时动态调整拓扑用「Dynamic DAG Orchestration」；按任务形态选拓扑用「任务自适应拓扑路由」；单步任务不需要 DAG。
- 能力边界：只产出定序规则与图契约，不做执行器，也不提供跨机器的分布式调度。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Subagent-Decomposition.html、Skill-Subagent-Decomposition、Skill-Ta[REDACTED].html、Skill-Ta[REDACTED]
- **延伸**：Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration
- **可组合**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Atomix-Transactional-Tool-Calls.html、Skill-Atomix-Transactional-Tool-Calls、Skill-CausalFlow-Agent-Failure-Repair.html、Skill-CausalFlow-Agent-Failure-Repair、Skill-Context-Compression.html、Skill-Context-Compression、Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-DAG-Ta[REDACTED]

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：16-智能体工程　·　源卡：`Skill-DAG-Ta[REDACTED]`