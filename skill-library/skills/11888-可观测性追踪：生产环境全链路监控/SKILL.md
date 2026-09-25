---
name: "p2s-agent-observability-tracing"
title: "Agent Observability Tracing — AI Agent 可观测性追踪：生产环境全链路监控"
description: "触发词：全链路追踪、Agent可观测性、Trace 可视化、Token 成本追踪、故障根因定位、三层监控。何时不用：要定义 SLI 目标值与 SLO 门禁用「Agent SLO 管理」；要用异常检测算法发现指标越界用「Agentic时序异常检测」。安全边界：Trace 会承载业务数据与用户信息，采集与留存须做脱敏与访问控制，敏感业务明细不得长期留存或对外输出。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Agent-Observability-Tracing"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "把 Agent 每一步想什么、调了什么工具、花了多少 Token 全录下来，出错时几小时就能定位到具体哪一步。"
user_try: "试试：给供应链哨兵 Agent 接上全链路追踪，定位补货量被系统性低估出在哪一步。"
whenToUse: "当 Agent 已上线、出现系统性偏差却不知哪一步出错、需要按步定位与成本核算时用本技能；若要的是定义质量门限与达标标准，改用「Agent SLO 管理」；若要用检测算法自动发现指标异常，改用「Agentic时序异常检测」。"
workflow: "接入追踪 SDK，逐步采集 input、output 与 latency → 记录每步的 thought、action、observation 与 token 消耗 → 把单次运行的所有步骤组装为完整 Trace 并落库 → 对照业务结果统计错误类型分布（幻觉、工具失败、数据异常） → 输出 SLO 报告与成本、完成率、P95 延迟趋势"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent Observability Tracing — AI Agent 可观测性追踪：生产环境全链路监控

## ① 解决的问题

供应链哨兵Agent每天运行50次但第3天发现系统性补货低估却不知道哪步出错——三层可观测性追踪（业务层+行为层+基础设施层）将Agent故障排查从天级压缩到小时级，LLM Token成本降低20-35%

## ② 核心算法逻辑

传统软件监控监测的是"函数调用堆栈 + 日志"，但 LLM Agent 的故障模式完全不同：Agent 可能逻辑正确但幻觉了一个数据，或工具调用成功但选错了工具，或多步推理中间步骤偏离——这些问题在传统监控里是"正常执行"，只在最终结果层才显现。

## ③ 业务应用场景

业务问题：供应链哨兵 Agent（agent-supply-sentinel）每天自动运行 50 次补货分析，上线3天后发现某品类被系统性低估库存——运营不知道是哪个步骤出了问题，是库存数据读取错误还是安全库存计算错误还是 LLM 推理幻觉。
数据要求： - Agent 运行日志（每步的 input/output/latency） - 业务结果对照（建议补货量 vs 实际应补量）
预期产出： - 全链路 Trace 可视化：每次运行的每步执行情况 - 错误类型分布：幻觉错误 vs 工具失败 vs 数据异常 - 根因定位：第3步"需求预测"模块的输出与实际偏差最大 - SLO 报告：完成率/P95延迟/成本/准确率趋势

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
Agent 故障排查时间从天级→小时级：节省工程师时间 ¥5-15 万/年
主动发现系统性偏差（如供应链哨兵幻觉）：避免积累的决策错误损失 ¥10-50 万
LLM Token 成本优化 20-35%：月节省 $500-800（12 Agent × 1500次/月规模）
年化综合 ROI：¥20-80 万
实施难度：⭐⭐☆☆☆（OpenTelemetry SDK 接入约1周；自定义 Agent 追踪结构约2周；与现有 Grafana/DataDog 集成需要额外配置）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（231 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/llm_agent_engineering/agent_observability_tracing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Agent-Observability-Tracing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Agent Observability Tracing
AI Agent 生产监控：三层可观测性 + 成本追踪
"""
import time
import json
import uuid
from dataclasses import dataclass, field, asdict
from typing import Any, Optional
from collections import defaultdict


@dataclass
class AgentStep:
    """单步 Agent 执行追踪"""
    step_id: int
    thought: str
    action: str
    action_input: Any
    observation: Any
    latency_ms: float
    tokens_in: int = 0
    tokens_out: int = 0
    error: Optional[str] = None

    @property
    def total_tokens(self):
        return self.tokens_in + self.tokens_out

    @property
    def cost_usd(self):
        # GPT-4o pricing (~$2.5/1M input, $10/1M output)
        return (self.tokens_in * 2.5 + self.tokens_out * 10) / 1_000_000


@dataclass
class AgentTrace:
    """完整 Agent 运行追踪"""
    trace_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    agent_id: str = ""
    task: str = ""
    steps: list = field(default_factory=list)
    start_ts: float = field(default_factory=time.time)
    end_ts: Optional[float] = None
    final_result: Optional[str] = None
    success: bool = False

    def add_step(self, step: AgentStep):
        self.steps.append(step)

    def finish(self, result: str, success: bool):
        self.end_ts = time.time()
        self.final_result = result
        self.success = success

    @property
    def total_latency_ms(self):
        if self.end_ts:
            return (self.end_ts - self.start_ts) * 1000
        return sum(s.latency_ms for s in self.steps)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2505.08432，但该号在 arXiv 上是《Low-complexity Detection for Noncoherent Massive MIMO Communications》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Agent 每步运行日志（input、output、latency）、工具调用与返回、token 用量，以及业务结果对照数据（如建议补货量与实际应补量）；粒度为单次运行的单步。

**输出**：全链路 Trace 可视化、错误类型分布与根因定位结论、SLO 报告（完成率 / P95 延迟 / 成本 / 准确率趋势）；供工程与运营排查使用。

## 执行步骤

1. 接入追踪 SDK，采集每步的输入输出与耗时
2. 记录每步的思考、动作、观察结果与 token 用量
3. 把一次运行的全部步骤组装为可回放的完整 Trace
4. 对照业务结果区分幻觉错误、工具失败与数据异常
5. 输出分层监控视图、根因定位结论与成本趋势报告

## 边界与不做

- 数据不满足：Agent 没有留下分步日志时无法做事后定位，只能先补埋点再从下一次运行开始追踪。
- 何时不用：需要定义 SLI/SLO 门限用「Agent SLO 管理」，需要自动检测指标异常用「Agentic时序异常检测」。
- 能力边界：负责采集、归因与呈现，不自动修复 Agent 逻辑，也不替代业务侧的结果验收。
- 安全边界：Trace 中的业务数据与用户信息须脱敏并受访问控制，敏感明细不得长期留存或对外输出。

## 技能关联

- **前置**：Skill-Agent-Error-Budget.html、Skill-Agent-Error-Budget、Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MAS-Testing-Verification.html、Skill-MAS-Testing-Verification
- **延伸**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-MAS-Testing-Verification.html、Skill-MAS-Testing-Verification
- **可组合**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-MAS-Testing-Verification.html、Skill-MAS-Testing-Verification、Skill-Agent-Observability-Tracing

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-Observability-Tracing`