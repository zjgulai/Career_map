---
name: "p2s-reliabilitybench-agent-reliability"
title: "ReliabilityBench — Agent 生产可靠性三维评估：pass@1 高估 20-40%"
description: "触发词：可靠性评估、一致性pass@k、鲁棒性扰动、故障注入、上线门禁、三维曲面。何时不用：要定位感知/规划/执行阶段短板用「Agent阶段评估」；要评估工具调用效率用「MCP工具使用评估」；实验性探索阶段不要用，过早引入会拖慢迭代。安全边界：扰动与故障注入必须在隔离的 staging 环境执行，严禁在生产链路注入限流、超时等故障。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 算法评估设计"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-ReliabilityBench-Agent-Reliability"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "staging 通过率 95% 也别急着上线：用一致性、鲁棒性、故障容忍三个维度量出生产环境的真实可靠性。"
user_try: "试试：给供应链 MAS 做一次 R(k, ε, λ) 三维可靠性评估，告诉我到底能不能上线。"
whenToUse: "当 Agent 或 MAS 要上线、需要用量化 Gate 判断能否扛住真实生产压力时用本技能；若要定位短板出在哪一阶段，用「Agent阶段评估」；若要比较工具调用效率，用「MCP工具使用评估」。"
workflow: "定义评估配置：重复次数 k、扰动等级 ε 与故障类型 λ → 在隔离环境重复执行任务，采集每次 episode 结果 → 注入措辞扰动与超时、限流、部分响应等故障 → 汇总一致性、鲁棒性与故障容忍三维得分 → 对照阈值给出可上线或需先补降级策略的结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ReliabilityBench — Agent 生产可靠性三维评估：pass@1 高估 20-40%

## ① 解决的问题

母婴跨境供应链 MAS（Multi-Agent System）在 staging 环境测试通过率达 95%，运营团队想上线，但历史经验表明生产环境与测试差距很大

## ② 核心算法逻辑

ReliabilityBench 是首个系统性评估 LLM Agent 在生产级压力条件下可靠性的基准框架（arXiv 2601.06112，2026年1月）。它的核心贡献是把单维"能不能完成任务"扩展为三维 R(k, ε, λ) 可靠性曲面：

## ③ 业务应用场景

母婴跨境供应链 MAS（Multi-Agent System）在 staging 环境测试通过率达 95%，运营团队想上线，但历史经验表明生产环境与测试差距很大。需要一个量化上线决策的评估框架。
| 维度 | 供应链场景具体含义 | 阈值设定 | |------|-------------------|----------| | k=5 | 补货计算任务连续执行 5 次（周一至周五）的通过率 | pass@5 ≥ 0.85 才上线 | | ε=0.15 | 订单描述措辞变化（"补货 100 件" vs "请求追加库存 100 unit"） | 性能下降 ≤ 10% | | λ=rate_limit | ERP API 限流（早高峰期间调用频繁） | 降级后仍完成核心任务 |
- pass@5 = 0.91，ε=0.15 下性能保持 92%，rate_limit 故障下完成率 87% → ✅ 可上线 - 若 rate_limit 下降至 70% → ❌ 需先实现降级策略

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

✅ 供应链 MAS 上线前可靠性 Gate-check
✅ 选品 Agent A/B 对比时的鲁棒性维度
✅ 客服 Agent 模型切换时的一致性验证
❌ 不适用于实验性探索阶段（过早引入会拖慢迭代）
实现难度：⭐⭐☆☆☆（框架简洁，核心逻辑清晰）
业务优先级：⭐⭐⭐⭐⭐（Agent 上线决策的必备工具，缺失会导致生产事故）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（356 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/llm_agent_engineering/reliabilitybench_agent_reliability` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-ReliabilityBench-Agent-Reliability.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ReliabilityBench: Agent 生产可靠性三维评估框架
参考: arXiv 2601.06112 | ReliabilityBench (2026)

R(k, ε, λ) 可靠性曲面: 一致性 × 鲁棒性 × 故障容忍
"""

from __future__ import annotations

import random
import time
from dataclasses import dataclass, field
from typing import Callable, Any
from enum import Enum


# ──────────────────────────────────────────────
# 数据类：配置与结果
# ──────────────────────────────────────────────

@dataclass
class ReliabilityConfig:
    """三维可靠性评估的超参配置"""
    k_trials: int = 5                              # 一致性维度：重复执行次数
    epsilon_levels: list[float] = field(
        default_factory=lambda: [0.0, 0.1, 0.2]   # 鲁棒性维度：扰动幅度列表
    )
    lambda_levels: list[str] = field(
        default_factory=lambda: ["none", "timeout", "rate_limit", "partial_response"]  # 故障等级
    )
    pass_threshold: float = 0.85                   # 通过率阈值
    timeout_prob: float = 0.3                      # 超时注入概率
    rate_limit_prob: float = 0.4                   # 限流注入概率
    partial_response_prob: float = 0.2             # 部分响应注入概率


@dataclass
class EpisodeResult:
    """单次 Episode 执行结果"""
    task: str
    output: Any
    success: bool
    latency_ms: float
    error: str | None = None


@dataclass
class ReliabilitySurface:
    """R(k, ε, λ) 三维可靠性曲面"""
    consistency_score: float          # pass@k 一致性分数
    robustness_scores: dict[float, float]   # ε → 鲁棒性分数
    fault_tolerance_scores: dict[str, float]  # λ → 故障容忍分数
    overall_reliability: float        # 综合可靠性得分

    def to_report(self) -> str:
        lines = [
            "=== ReliabilityBench 可靠性曲面报告 ===",
            f"一致性 (pass@k):         {self.consistency_score:.3f}",
            "",
            "鲁棒性 (ε-perturbations):",
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2601.06112 — ReliabilityBench: Evaluating LLM Agent Reliability Under Production-Like Stress Conditions

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待评估 Agent 的可调用入口与任务集、重复次数 k、扰动等级列表 ε、故障类型列表 λ（超时、限流、部分响应等）与通过率阈值；粒度为任务 × 配置组合的一次执行。

**输出**：R(k, ε, λ) 三维可靠性得分与各维度明细（如 pass@5 通过率、扰动下性能保持率、故障下完成率），以及是否可上线的 Gate 结论；供上线决策与 A/B 鲁棒性比较使用。

## 执行步骤

1. 配置重复次数、扰动等级与故障类型三组评估参数
2. 重复执行隔离环境中的任务集并记录每次成败与耗时
3. 注入措辞变化与超时、限流、部分响应等故障
4. 汇总一致性、鲁棒性、故障容忍三维得分
5. 对照上线阈值给出可上线或需先补降级策略的结论

## 边界与不做

- 数据不满足：任务集不足或无法注入故障时三维评估退化为单维通过率，结论不可用于上线决策。
- 何时不用：阶段能力诊断用「Agent阶段评估」，工具调用效率比较用「MCP工具使用评估」；实验性探索阶段不要引入本框架。
- 能力边界：只做评估与门禁判定，不实现降级策略，也不修复 Agent 的鲁棒性缺陷。
- 安全边界：故障注入必须在隔离的 staging 环境进行，严禁在生产链路注入故障。

## 技能关联

- **前置**：Skill-Agent-Production-Engineering.html、Skill-Agent-Production-Engineering、Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation
- **延伸**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA
- **可组合**：Skill-Agentic-AB-Testing.html、Skill-Agentic-AB-Testing、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-ReliabilityBench-Agent-Reliability

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：16-智能体工程　·　源卡：`Skill-ReliabilityBench-Agent-Reliability`