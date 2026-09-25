---
name: "p2s-agent-error-budget"
title: "Agent Error Budget — 双向错误预算：自主权随可靠性动态调整"
description: "触发词：错误预算、自主权预算、灰度发布门控、渐进放量、自动回滚、可靠性水位。何时不用：要判断单条决策能否自动执行时用「置信度决策门控」；要建立三层 SLI 指标与门限本身时用「Agent SLO 管理」。安全边界：Gate 未通过不得扩大流量，Judgment SLI 跌破阈值必须自动回滚并告警；自主权水位变更与回滚动作必须留审计记录，不得人工口头豁免。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 异常冻结与恢复"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Agent-Error-Budget"
p2s_src_domain: "16-智能体工程"
user_summary: "给 Agent 的自主权装一个会涨也会跌的水位表：表现好就多放权，出错就自动缩量回滚。"
user_try: "试试：让新版选品算法按 5%、20%、100% 三阶段放量，每阶段盯 Task 与 Judgment SLI，不达标自动回滚。"
whenToUse: "当 Agent 新能力要按阶段放量、需要按可靠性动态升降自主权时用本技能；若只是要决定单条决策自动还是人工，用「置信度决策门控」；若还没定义 SLI 指标与门限，先用「Agent SLO 管理」。"
workflow: "定义发布阶段与各阶段流量比例、观察窗口 → 配置 Task SLI 与 Judgment SLI 的达标门槛 → Canary 阶段跑满观察窗口后执行 SLO Gate 判定 → 达标即扩量，SLI 跌破阈值自动回滚旧版并告警 → 把 Gate 结果回写为 Agent 自主权水位的升降"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent Error Budget — 双向错误预算：自主权随可靠性动态调整

## ① 解决的问题

新版选品算法（支持竞品价格实时对比）渐进发布：① Canary 5% → 监控 48h → Task SLI ≥99.9% + Judgment SLI ≥92% → Gate 通过 → ② 扩量 20% → 监控 72h → Gate 通过 → ③ 全量 100%

## ② 核心算法逻辑

传统 SRE 错误预算是单向消耗品：违反 SLO 就消耗预算，预算耗尽就停止发布，恢复后窗口重置。Agent 双向错误预算在此基础上引入自主权预算（Autonomy Budget）：好行为可以赢回预算，自主权随可靠性动态升降。

## ③ 业务应用场景

场景一：WF-D 选品 Agent 能力升级
新版选品算法（支持竞品价格实时对比）渐进发布：① Canary 5% → 监控 48h → Task SLI ≥99.9% + Judgment SLI ≥92% → Gate 通过 → ② 扩量 20% → 监控 72h → Gate 通过 → ③ 全量 100%。第 2 阶段发现 Judgment SLI 跌至 89%（新算法对某类目漏判），自动回滚至旧版，触发告警通知产品团队修复后重新发布。每阶段 SLO Gate 结果自动更新选品 Agent 的自主权水位。
场景二：WF-A 补货 Agent 混沌测试

## ④ 输入数据要求

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑦ 代码模板

代码块数量：1 · 路径：paper2skills-code/llm_agent_engineering/agent_error_budget

 Python60 行 · 可运行复制
"""
Agent Error Budget — 双向自主权预算
来源：Microsoft agent-sre + SRE for Agents 2026
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict

class DeliveryStage(Enum):
 CANARY = "canary" # 5% 流量
 PARTIAL = "partial" # 20% 流量
 FULL = "full" # 100% 全量
 ROLLED_BACK = "rolled_back"

class ExperimentType(Enum):
 LLM_PROVIDER_DOWN = "llm_provider_down"
 INFERENCE_LOOP = "inference_loop"
 PROMPT_INJECTION = "prompt_injection"
 POLICY_BYPASS = "policy_bypass"

@dataclass
class AutonomyBudget:
 agent_id: str
 level: float = 5.0
 good_behavior_reward: float = 0.1
 bad_behavior_penalty: float = 0.5

 def reward(self, reason: str = "") -> None:
 self.level = min(10.0, self.level + self.good_behavior_reward)

 def penalize(self, reason: str = "") -> None:
 self.level = max(0.0, self.level - self.bad_behavior_penalty)

 @property
 def requires_human_review(self) -> bool:
 return self.level < 3.0

@dataclass
class ErrorBudgetTracker:
 slo_target: float
 window_size: int
 _events: List[bool] = field(default_factory=list)

 @property
 def allowed_failures(self) -> int:
 return int(self.window_size * (1.0 - self.slo_target))

 @property
 def consumed_failures(self) -> int:
 return sum(1 for e in self._events if not e)

 @property
 def remaining_budget(self) -> int:
 return max(0, self.allowed_failures - self.consumed_failures)

 @property

## ⑧ 论文来源

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## 输入 / 输出契约

**输入**：Agent 的关键 SLI 指标与目标值（如 Task SLI 不低于 99.9%、Judgment SLI 不低于 92%）、发布阶段划分与观察窗口、灰度流量比例、好坏行为对应的自主权水位调整规则。

**输出**：每个发布阶段的 SLO Gate 判定结果、是否触发自动回滚与告警，以及更新后的 Agent 自主权水位；供发布编排层与产品团队使用。

## 执行步骤

1. 定义发布阶段、各阶段流量比例与观察窗口
2. 设定 Task SLI 与 Judgment SLI 的达标门槛与 Gate 规则
3. 跑满 Canary 观察窗口后执行 Gate 判定
4. 按 Gate 结果处置：通过则逐级扩量，跌破阈值则自动回滚并告警
5. 把每阶段 Gate 结果回写为自主权水位的升降依据

## 边界与不做

- 数据不满足：没有可计算 Task 与 Judgment SLI 的埋点数据时无法做 Gate 判定，必须先补指标采集。
- 何时不用：单条决策是否自动执行用「置信度决策门控」，SLI 体系本身的设计用「Agent SLO 管理」。
- 能力边界：产出的是门控规则、阈值与水位调整判据，不执行发布、扩量与回滚动作本身。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **延伸**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **可组合**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception、Skill-Agent-Error-Budget

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-Error-Budget`