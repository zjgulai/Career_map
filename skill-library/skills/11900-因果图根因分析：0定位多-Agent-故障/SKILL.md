---
name: "p2s-agenttrace-causal-rca"
title: "AgentTrace — 因果图根因分析：0.12s 定位多 Agent 故障"
description: "触发词：根因分析、执行 DAG、反向 BFS、故障定位、MTTR 压缩。何时不用：需要区分多步交互各自贡献比例时用因果 Shapley 归因类技能；本技能只能定位失败节点，不量化贡献。安全边界：本技能只读日志产出定位结论，不执行重启、回滚或冻结动作。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-AgentTrace-Causal-RCA"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "把多 Agent 的执行日志还原成依赖图，从报错节点往回走，几毫秒定位到真正的故障点。"
user_try: "试试：这批执行日志里 PO 下单失败了，帮我定位根因节点。"
whenToUse: "链路失败、需要快速定位到根因节点时用本技能；需要拆分多步责任比例或生成修复补丁时用因果 Shapley 或因果调试类技能。"
workflow: "解析执行日志构建节点 DAG → 标记失败节点并沿依赖做反向遍历 → 定位无上游异常的失败节点为根因 → 输出告警指向与影响范围"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AgentTrace — 因果图根因分析：0.12s 定位多 Agent 故障

## ① 解决的问题

业务问题：WF-A 智能补货工作流由 3 个 Agent 串联（需求预测 Agent → 采购决策 Agent → PO 下单 Agent）

## ② 核心算法逻辑

AgentTrace 的核心洞察是：多 Agent 系统（MAS）的故障传播是确定性的因果链，而非需要 LLM 进行语义推理的模糊问题。

## ③ 业务应用场景

业务问题：WF-A 智能补货工作流由 3 个 Agent 串联（需求预测 Agent → 采购决策 Agent → PO 下单 Agent）。某天 PO 下单失败，人工排查需要 2-3 小时。
AgentTrace 处理： - 解析执行日志，构建 3 节点 DAG：`DemandForecastAgent → ProcurementAgent → POOrderAgent` - POOrderAgent 报错（`status=FAILED`），但其输入参数（需求量）来自 ProcurementAgent - 反向 BFS：ProcurementAgent 同样标记为 FAILED（收到了 DemandForecastAgent 的异常输出） - DemandForecastAgent 状态为 FAILED（外部数据 API 超时）→ 根因确定 - 0.12s 内完成定位，告警直接指向
量化价值：MTTR 从 2-3 小时降至 5 分钟（含修复），每次供应链故障损失节省 ¥50,000-200,000（缺货成本）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5-20 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（259 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/agenttrace_causal_rca` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-AgentTrace-Causal-RCA.md`），已与卡面节选核对，不依赖上述路径。

```python
# AgentTrace 因果图根因分析 — 完整可运行实现
# 论文：arXiv:2603.14688 | ICLR 2026 AI-Wild Workshop
# 复现核心：DAG 构建 + 反向 BFS 根因定位，无需 LLM，确定性算法

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from collections import deque
import time


# ─── 数据结构 ──────────────────────────────────────────────────────────────────

@dataclass
class ExecutionEvent:
    """单个 Agent 执行事件"""
    agent_id: str
    event_type: str          # INVOKE | RETURN | ERROR
    timestamp: float         # Unix epoch (秒)
    inputs: dict             # Agent 输入参数
    outputs: dict            # Agent 输出（含 token/ID 用于因果边推导）
    status: str              # SUCCESS | FAILED | PENDING
    trace_id: str = ""       # 分布式 trace ID（跨服务聚合用）
    error_msg: str = ""      # 错误信息（FAILED 时填写）


@dataclass
class RCAResult:
    """根因分析结果"""
    root_agent: str                  # 根因 Agent ID
    causal_path: list[str]           # 因果传播路径（根因 → 故障终点）
    confidence: float                # 置信度 [0, 1]
    diagnosis_time_ms: float         # 诊断耗时（毫秒）
    error_summary: str = ""          # 根因错误摘要


# ─── 因果 DAG ─────────────────────────────────────────────────────────────────

class CausalDAG:
    """有向无环因果图"""

    def __init__(self):
        self.nodes: dict[str, ExecutionEvent] = {}   # agent_id → event
        self.edges: dict[str, list[str]] = {}         # agent_id → [downstream agent_ids]
        self.reverse_edges: dict[str, list[str]] = {} # agent_id → [upstream agent_ids]

    def add_node(self, event: ExecutionEvent):
        self.nodes[event.agent_id] = event
        self.edges.setdefault(event.agent_id, [])
        self.reverse_edges.setdefault(event.agent_id, [])

    def add_edge(self, from_agent: str, to_agent: str):
        """添加因果边 from → to"""
        if to_agent not in self.edges.get(from_agent, []):
            self.edges[from_agent].append(to_agent)
        if from_agent not in self.reverse_edges.get(to_agent, []):
            self.reverse_edges[to_agent].append(from_agent)

    def get_failed_nodes(self) -> list[str]:
        return [aid for aid, ev in self.nodes.items() if ev.status == "FAILED"]
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2603.14688 — AgentTrace: Causal Graph Tracing for Root Cause Analysis in Deployed Multi-Agent Systems

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：Agent 执行日志：每个节点的状态（成功或失败）与输入输出来源，可还原为依赖 DAG；无需大模型与训练数据。

**输出**：根因节点定位结果（含耗时）与影响范围、告警指向，供运维与 Agent 编排层使用。

## 执行步骤

1. 采集各 Agent 执行日志与状态
2. 按输入输出来源构建依赖 DAG
3. 标记失败节点并做反向遍历
4. 确认根因节点与传播路径
5. 输出定位结论与告警指向

## 边界与不做

- 需要量化多步各自贡献比例时，本技能的图遍历定位不够用。
- 本技能只做定位与告警，不执行修复、重跑或回滚。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 定位准确性取决于日志是否完整记录了各节点的输入输出来源。

## 技能关联

- **前置**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL
- **延伸**：Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL
- **可组合**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-AgentTrace-Causal-RCA

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：16-智能体工程　·　源卡：`Skill-AgentTrace-Causal-RCA`