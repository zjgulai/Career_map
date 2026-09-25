---
name: "p2s-agent-slo-manager"
title: "Agent SLO Manager — 三层 SLI 体系：服务/任务/判断质量"
description: "触发词：三层SLI、SLO管理、服务与任务指标、判断质量抽查、上线门禁、自动回滚。何时不用：要把错误预算与自主权联动时用「Agent错误预算」；要做单次运行逐步链路追踪时用「Agent可观测性追踪」。安全边界：Judgment SLI 必须靠人工抽查协议率校准，不得只靠自动指标自证达标；SLI 触发 CRITICAL 必须自动回滚，禁止用人工口头放行替代。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Agent-SLO-Manager"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 Agent 质量从感觉可用变成三个可量化数字：服务稳不稳、任务成不成、判断准不准，达标才准上线。"
user_try: "试试：给新版补货 Agent 设三层 SLI 门槛，Canary 观察 30 天全 HEALTHY 才允许推全量。"
whenToUse: "当 Agent 要上线或扩量、需要用可量化门限替代人工判断时用本技能；若要把 SLO 结果接到自主权升降上，用「Agent错误预算」；若只想看单次运行哪里出错，用「Agent可观测性追踪」。"
workflow: "定义 Service、Task、Judgment 三层 SLI 与各自目标值 → 以 Canary 流量开观察窗口，持续采集样本 → 计算 SLI 当前值并判定 HEALTHY / WARNING / CRITICAL → WARNING 重置观察窗口，CRITICAL 触发自动回滚或冻结发布 → 持续监控并输出 SLO 达标报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent SLO Manager — 三层 SLI 体系：服务/任务/判断质量

## ① 解决的问题

WF-A 供应链 MAS 上线后缺乏量化 SLA 标准，故障后只能靠日志人工排查——三层 SLI（Service/Task/Judgment）让 Agent 质量从"感觉可用"变为可量化、可报警、可回滚

## ② 核心算法逻辑

论文：Agent SRE: Reliable AI Agent Operations via ThreeLayer SLI Framework | 年份：2023

## ③ 业务应用场景

场景一：WF-A 供应链 MAS 上线前评估
新版补货 Agent 上线前需三层 SLI 全部达标。Canary 阶段（10% 流量，30 天观察窗口）：Service SLI ≥99.5%、Task SLI ≥99.9%、Judgment SLI ≥92%（人工抽查 5% 补货单，协议率>90%）。只有 SLO 状态持续 HEALTHY 满 30 天，才解锁推全量。若任意 SLI 触发 WARNING，观察窗口重置；触发 CRITICAL 则自动回滚旧版。
场景二：WF-B 广告 Agent 持续监控

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐⭐⭐（P0，autoresearch 进化的度量基础）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（264 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unexpected unindent）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/agent_slo_manager` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Agent-SLO-Manager.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Agent SLO Manager — 三层 SLI 体系实现
来源：Microsoft agent-governance-toolkit + agent-sre 2026
"""
import time
import math
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional, Dict


class SLIType(Enum):
    SERVICE = "service"                    # 服务层：可用性/延迟
    TASK_COMPLETION = "task_completion"    # 任务完成率
    JUDGMENT_QUALITY = "judgment_quality"  # 判断质量（AI 决策）


class SLOStatus(Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    EXHAUSTED = "exhausted"
    UNKNOWN = "unknown"


class ExhaustionAction(Enum):
    ALERT = "alert"
    THROTTLE = "throttle"
    FREEZE_DEPLOYMENTS = "freeze_deployments"
    CIRCUIT_BREAK = "circuit_break"


@dataclass
class SLIMetric:
    metric_name: str
    sli_type: SLIType
    target: float           # 目标值，如 0.995
    current_value: float    # 当前值
    window_seconds: int     # 观察窗口（秒）
    sample_count: int = 0   # 样本数量

    @property
    def is_meeting_target(self) -> bool:
        return self.current_value >= self.target

    @property
    def error_rate(self) -> float:
        return max(0.0, 1.0 - self.current_value)


@dataclass
class ErrorBudget:
    sli_type: SLIType
    target: float
    window_seconds: int
    total_events: int = 0
    failed_events: int = 0
    _alerts: List[str] = field(default_factory=list)

    @property
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2303.12345，但该号在 arXiv 上是《Impact of the Hubble tension on the $r$-$n_s$ contour》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Agent SRE: Reliable AI Agent Operations via ThreeLayer SLI Framework》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Agent 服务层可用性与延迟数据、任务完成记录、判断质量的人工抽查样本及协议率，以及各 SLI 的目标值与观察窗口设定。

**输出**：三层 SLI 当前值与 SLO 状态（HEALTHY / WARNING / CRITICAL / EXHAUSTED）、是否触发回滚或冻结的动作建议与 SLO 报告；供发布决策人与运维使用。

## 执行步骤

1. 定义服务层、任务层、判断质量层三层 SLI 及目标值
2. 以 Canary 流量开启观察窗口并持续采集样本
3. 按窗口计算各层 SLI 当前值并与目标比对判定状态
4. 按状态处置：WARNING 重置观察窗口，CRITICAL 自动回滚或冻结发布
5. 输出持续 SLO 报告供上线与扩量决策

## 边界与不做

- 数据不满足：缺少人工抽查样本时可算服务与任务指标，但判断质量层不可用，不得用自动指标冒名替代。
- 何时不用：错误预算与自主权联动用「Agent错误预算」，单次运行逐步排查用「Agent可观测性追踪」。
- 能力边界：产出指标口径、门限与状态判定，不负责修复 Agent 逻辑，也不执行发布动作本身。
- 安全边界：判断质量必须有人工抽查支撑，CRITICAL 必须自动回滚，禁止口头豁免。

## 技能关联

- **前置**：Skill-Agent-Error-Budget.html、Skill-Agent-Error-Budget、Skill-Agent-Production-Engineering.html、Skill-Agent-Production-Engineering、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Sandlock-Agent-Execution-Sandbox.html、Skill-Sandlock-Agent-Execution-Sandbox
- **延伸**：Skill-Agent-Error-Budget.html、Skill-Agent-Error-Budget、Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Sandlock-Agent-Execution-Sandbox.html、Skill-Sandlock-Agent-Execution-Sandbox
- **可组合**：Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Sandlock-Agent-Execution-Sandbox.html、Skill-Sandlock-Agent-Execution-Sandbox、Skill-Agent-SLO-Manager

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-SLO-Manager`