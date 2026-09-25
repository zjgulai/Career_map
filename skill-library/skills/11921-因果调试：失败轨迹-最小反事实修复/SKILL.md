---
name: "p2s-causalflow-agent-failure-repair"
title: "CausalFlow — LLM Agent 因果调试：失败轨迹 → 最小反事实修复"
description: "触发词：因果调试、失败修复、最小反事实、公式纠错、链路整改。何时不用：错误原因已明确、只需改一行配置时不必上因果分析；本技能面向原因不明、需要生成最小修复方案的情形。安全边界：生成的修复补丁须经人工评审后上线，本技能只产出修复建议，不直接改生产代码。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-CausalFlow-Agent-Failure-Repair"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "链路跑出异常结果时，定位到出错的步骤、给出最小改动的修复版，再重跑验证。"
user_try: "试试：这次 PO 数量比正常大三倍，帮我定位原因并给出最小修复方案。"
whenToUse: "需要从失败轨迹反推修复方案并验证时用本技能；只要定位根因节点用因果图根因分析，要拆贡献比例用因果 Shapley 类技能。"
workflow: "从失败轨迹中定位可疑步骤 → 生成最小反事实修复（改公式或改参数） → 在隔离环境重跑验证修复效果 → 输出修复补丁与验证结果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CausalFlow — LLM Agent 因果调试：失败轨迹 → 最小反事实修复

## ① 解决的问题

运维工程师面临Agent链路故障定位慢——CausalFlow将修复时长3小时压到25分钟，年化省16万元

## ② 核心算法逻辑

执行轨迹建模为步骤依赖链

## ③ 业务应用场景

业务背景： 补货 Agent 执行 3 步流程：① 预测需求 → ② 计算安全库存 → ③ 生成 PO。某次执行中，最终 PO 数量异常（比正常大 3 倍），触发审核警告。
修复生成： - 定位 step_2 为根因（安全库存计算公式错误：将安全系数 3 误用了 3 倍） - 生成修复版：`safety_stock = forecast * safety_factor`（safety_factor=0.3，而非 3） - 验证：修复后重跑，po_qty = 500 + 150 = 650（合理）✅
业务背景： 合规检查 Agent 完成 4 步检查流程后报告"合规通过"，但人工复核发现漏掉了 CPSC 强制认证要求。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（367 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/llm_agent_engineering/causalflow_agent_failure_repair` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-CausalFlow-Agent-Failure-Repair.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CausalFlow — LLM Agent 因果调试与反事实修复
论文：CausalFlow: Causal Attribution and Counterfactual Repair for LLM Agent Failures
arXiv：2605.25338 | 2026年5月
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum
from collections import defaultdict


# ──────────────────────────────────────────────
# 数据类
# ──────────────────────────────────────────────

class StepOutcome(Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    UNKNOWN = "unknown"


@dataclass
class AgentStep:
    """Agent 执行轨迹中的单个步骤"""
    step_id: str
    action: str              # 该步骤执行的动作/推理
    observation: str         # 执行结果/观察
    dependencies: list[str]  # 依赖的前置步骤 ID 列表
    outcome: StepOutcome = StepOutcome.UNKNOWN
    corrected_action: Optional[str] = None  # 修复后的动作（反事实）

    def __repr__(self) -> str:
        return f"Step({self.step_id}: {self.action[:40]}... [{self.outcome.value}])"


@dataclass
class ExecutionTrace:
    """完整的 Agent 执行轨迹"""
    trace_id: str
    steps: list[AgentStep]
    final_outcome: StepOutcome
    task_description: str = ""

    def get_step(self, step_id: str) -> Optional[AgentStep]:
        return next((s for s in self.steps if s.step_id == step_id), None)

    def is_failed(self) -> bool:
        return self.final_outcome == StepOutcome.FAILURE

    def step_ids(self) -> list[str]:
        return [s.step_id for s in self.steps]


@dataclass
class RepairedTrace:
    """修复后的执行轨迹"""
    original_trace_id: str
    repaired_steps: list[AgentStep]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.25338 — CausalFlow: Causal Attribution and Counterfactual Repair for LLM Agent Failures

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：失败执行轨迹（含每步输入输出）、最终异常表现（如 PO 数量异常），以及可复跑的环境；需要能对单步修改后重跑。

**输出**：最小反事实修复方案（如修正安全库存计算公式）、验证后的重跑结果，以及可供人工评审采纳的补丁建议。

## 执行步骤

1. 收集失败轨迹与异常结果
2. 逐步排查并把根因收敛到具体步骤
3. 生成最小改动的反事实修复
4. 在隔离环境重跑验证
5. 输出补丁与验证证据供人工评审

## 边界与不做

- 原因已经明确、只需改配置或参数时不必做因果分析。
- 本技能产出修复建议与验证结果，不直接改生产代码或上线。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 重跑验证需在隔离环境进行，避免污染生产数据。

## 技能关联

- **前置**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL
- **延伸**：Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability
- **可组合**：Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-CausalFlow-Agent-Failure-Repair

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：16-智能体工程　·　源卡：`Skill-CausalFlow-Agent-Failure-Repair`