---
name: "p2s-multi-agent-skill-composition"
title: "Multi-Agent Skill Composition — 多 Agent 协作 Skill 链式 DAG 编排"
description: "触发词：技能编排、DAG 拓扑排序、并行串行、接口 Schema、补货优先级报告。何时不用：只做技能检索选取用「Agent Skill 运行时编排器」；做技能学习路径导航用「Skill 依赖路径规划器」。安全边界：技能接口与中间结果 Schema 未对齐前不得上线编排，避免字段错配产出错误业务结论。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / 技能版本"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-Multi-Agent-Skill-Composition"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把多个技能按依赖排成 DAG，能并行的并行，把两小时的手工串行压到分钟级。"
user_try: "试试：把需求预测、库存分析、物流延迟评估、补货建议四个技能编排成 DAG，输出补货优先级报告。"
whenToUse: "当一次分析要用到多个技能、需要按依赖生成执行计划时用本技能；只做技能选取，用「Agent Skill 运行时编排器」；做学习路径规划，用「Skill 依赖路径规划器」；需要运行时改拓扑，用「Dynamic DAG Orchestration」。"
workflow: "注册各技能节点与其输入输出 Schema → 按依赖构建 DAG 并做拓扑排序，识别可并行分支 → 按计划执行技能并传递中间结果 → 汇总输出结构化报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Agent Skill Composition — 多 Agent 协作 Skill 链式 DAG 编排

## ① 解决的问题

MAS架构师面临"多Agent协作时Skill执行顺序混乱依赖关系难以管理"——DAG拓扑排序将多Skill执行计划生成时间从手工规划2小时压缩至毫秒级自动生成

## ② 核心算法逻辑

论文：AutoGen: Enabling NextGen LLM Applications via MultiAgent Conversation | 年份：2023

## ③ 业务应用场景

场景 A：供应链综合分析 Pipeline（4 个 Skill DAG）
- 业务问题：每周一运营总监需要一份「补货优先级报告」，当前需要人工串行运行 4 个分析脚本（需求预测 → 库存分析 → 物流延迟评估 → 补货建议），耗时约 2 小时 - 数据要求：各 Skill 的输入数据（历史销量、当前库存、物流时效） - DAG 结构： 需求预测和物流延迟评估可并行，完成后汇入补货建议 - 预期产出：2 分钟内完成全部分析，输出结构化补货优先级报告 - 业务价值：报告生成时间从 2h → 2min，运营人效提升 60×，年化节省 36 万元
| 轨道 | 内容 | 评估 | |------|------|------| | 成本轨 | • DAG 编排引擎开发：15 人天（约 3 万元）<br>• 云计算资源（4 核 CPU + 8GB 内存）：500 元/月<br>• 数据集成工具许可：2000 元/月<br>• 年度维护成本：8 万元<br>总投入：约 13 万元/年 | 投入产出比 = 36 万节省 ÷ 13 万投入 = 2.77 倍，ROI 正向 | | 合规轨 | • 数据使用：销量、库存、物流数据均为内部经营数据，无涉及消费者隐私<br>• 跨境合规：若涉及海外仓库数据，需符合当地数据驻留法规（如 GDPR 欧洲数据本

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
现状：供应链周报涉及 5 个分析步骤，人工串行 2h；自动化后 DAG 并行 3min
每周节省：1.9h × 2 人 × 52 周 = 197h/年，折算约 10 万元/年
更重要的是「及时性」：从 D+1 报告 → 实时分析，决策质量提升，估算补货误差减少 15%，年化减损约 40 万元
实施难度：⭐⭐⭐☆☆（DAG 算法标准，难点在 Skill 接口规范化 + 中间结果 Schema 对齐）
优先级评分：⭐⭐⭐⭐☆（多 Agent 协作的核心基础设施，生产环境不可缺）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（220 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Multi-Agent Skill Composition
基于 DAG 拓扑排序的 Skill 链式编排引擎
依赖：标准库（collections, time, dataclasses）
"""

import time
import json
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Any, Callable


# ─── 数据结构 ────────────────────────────────────────────────────────────────

@dataclass
class SkillNode:
    skill_id: str
    prerequisites: list
    execute_fn: Callable
    expected_duration_s: float = 1.0


@dataclass
class ExecutionResult:
    skill_id: str
    status: str
    output: Any
    duration_ms: float
    layer: int


@dataclass
class CompositionPlan:
    layers: list
    total_serial_s: float
    estimated_parallel_s: float


# ─── DAG 编排核心 ─────────────────────────────────────────────────────────────

class MultiAgentSkillComposer:
    """
    多 Agent Skill 组合编排引擎：
    1. build_dag(): 构建依赖图
    2. plan(): Kahn 拓扑排序，生成分层执行计划
    3. execute_plan(): 按层执行（同层并行模拟）
    """

    def __init__(self):
        self.nodes = {}
        self.context = {}

    def register(self, node):
        self.nodes[node.skill_id] = node

    def build_dag(self):
        """构建邻接表（前驱 → 后继）"""
        adjacency = defaultdict(list)
        for sid, node in self.nodes.items():
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2308.08155 — AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：各技能的输入数据（历史销量、当前库存、物流时效）及输入输出 Schema、依赖声明（哪些技能可并行）。

**输出**：拓扑排序后的执行计划与执行结果（含中间结果），如结构化补货优先级报告；供运营与管理层使用。

## 执行步骤

1. 注册各技能节点与其输入输出 Schema
2. 按依赖构建 DAG 并做拓扑排序，识别可并行分支
3. 按计划执行技能并传递中间结果
4. 汇总输出结构化报告

## 边界与不做

- 数据不满足：技能接口或中间结果 Schema 无法对齐时先统一契约，不要上线编排。
- 何时不用：只做技能选取用「Agent Skill 运行时编排器」；学习路径导航用「Skill 依赖路径规划器」；运行时改拓扑用「Dynamic DAG Orchestration」。
- 能力边界：输出执行计划与编排契约，不做执行器，也不保证各子技能的算法质量。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-Skill-Runtime-Orchestrator.html、Skill-Agent-Skill-Runtime-Orchestrator、Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-MAS-VOC-Multi-Agent-Analysis.html、Skill-MAS-VOC-Multi-Agent-Analysis、Skill-MAS-Video-Content-Optimization.html、Skill-MAS-Video-Content-Optimization、Skill-Skill-Card-API-Serving.html、Skill-Skill-Card-API-Serving
- **延伸**：Skill-Agent-Skill-Runtime-Orchestrator.html、Skill-Agent-Skill-Runtime-Orchestrator、Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-MAS-VOC-Multi-Agent-Analysis.html、Skill-MAS-VOC-Multi-Agent-Analysis、Skill-MAS-Video-Content-Optimization.html、Skill-MAS-Video-Content-Optimization、Skill-Skill-Card-API-Serving.html、Skill-Skill-Card-API-Serving
- **可组合**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-MAS-VOC-Multi-Agent-Analysis.html、Skill-MAS-VOC-Multi-Agent-Analysis、Skill-MAS-Video-Content-Optimization.html、Skill-MAS-Video-Content-Optimization、Skill-Skill-Card-API-Serving.html、Skill-Skill-Card-API-Serving、Skill-Multi-Agent-Skill-Composition

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-Multi-Agent-Skill-Composition`