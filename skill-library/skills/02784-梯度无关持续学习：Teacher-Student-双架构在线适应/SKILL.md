---
name: "p2s-atlas-gradient-free-continual"
title: "ATLAS — 梯度无关持续学习：Teacher-Student 双架构在线适应"
description: "触发词：持续学习、无需重训、在线适应、经验记忆、灾难性遗忘。何时不用：靠历史案例检索做部署时适应走「案例推理部署时学习」；从失败轨迹做自我巩固走「对比反思与自我巩固」。安全边界：策略规则由运营显式编辑与确认，不得让系统静默改写生效策略。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
p2s_card_id: "Skill-ATLAS-Gradient-Free-Continual"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "业务规则总在变又不想反复重训模型时，把学习放到记忆层，运行中就能适应，还能人工直接改规则。"
user_try: "试试：奶粉旺季淡季波动大、规则老是要改，帮我搭一套不用重训就能适应的方案。"
whenToUse: "当需要在线适应、又不想承担重训成本与灾难性遗忘风险时用；若主要靠案例检索复用经验，用「案例推理部署时学习」；若从失败轨迹反向优化策略，用「对比反思与自我巩固」。"
workflow: "整理历史决策记录与结果反馈 → 用教师模型把经验蒸馏为指导性知识 → 把知识写入持久学习记忆供推理时读取 → 让运营直接编辑记忆中的策略规则 → 观察决策质量随执行次数变化并回归"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ATLAS — 梯度无关持续学习：Teacher-Student 双架构在线适应

## ① 解决的问题

痛点：婴儿奶粉旺季/淡季需求波动大，固定规则备货导致缺货或积压，重新微调模型成本高

## ② 核心算法逻辑

传统持续学习依赖反向传播更新模型权重，存在三个根本缺陷：必须离线批量训练（无法在服务中实时更新）、灾难性遗忘（新任务覆盖旧能力）、部署 Agent 无法自改（推理阶段参数冻结）。ATLAS 的突破在于：将"学习"从参数空间迁移到系统编排层，通过持久学习记忆（Persistent Learning Memory, PLM）存储经验蒸馏后的指导性知识，无需触碰模型权重。

## ③ 业务应用场景

痛点：婴儿奶粉旺季/淡季需求波动大，固定规则备货导致缺货或积压，重新微调模型成本高。
效果：无需重训，第 5 次补货决策开始质量可见提升；运营人员可直接编辑 PLM 中的策略规则进行干预。
痛点：退款场景规则复杂（金额/原因/渠道各维度组合），人工写规则无法穷举，微调频率追不上业务变化。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

13%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（335 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/llm_agent_engineering/atlas_gradient_free_continual` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-ATLAS-Gradient-Free-Continual.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ATLAS — Gradient-Free Continual Learning via Teacher-Student Architecture
Paper: arXiv:2511.01093 | Nov 2025
Use case: WF-A supply chain agent adaptation + WF-C customer service continuous optimization
"""
from __future__ import annotations

import json
import time
import hashlib
from dataclasses import dataclass, field
from typing import Any


# ─── 数据类 ───────────────────────────────────────────────────────────────

@dataclass
class Experience:
    """原始经验记录：任务输入 + 执行结果 + 成功标记"""
    exp_id: str
    task_type: str          # 任务类型（如 "restock", "refund"）
    task_input: dict        # 任务输入上下文
    decision: str           # Student 的执行决策
    outcome: dict           # 实际结果（成功率、偏差等）
    success: bool           # 是否成功
    timestamp: float = field(default_factory=time.time)
    tags: list[str] = field(default_factory=list)


@dataclass
class DistilledKnowledge:
    """蒸馏知识条目：从经验提炼的可读策略规则"""
    rule_id: str
    task_type: str
    rule_text: str          # 可读规则（如 "旺季备货乘以1.4系数"）
    confidence: float       # 0-1，基于支撑经验数量
    support_count: int      # 支撑该规则的原始经验数量
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)


# ─── 持久学习记忆（PLM）──────────────────────────────────────────────────

class LearningMemory:
    """持久学习记忆：存储原始经验 + 蒸馏知识，支持检索和更新"""

    def __init__(self) -> None:
        self._experiences: list[Experience] = []
        self._knowledge: dict[str, list[DistilledKnowledge]] = {}  # task_type → rules
        self._supervision_levels: dict[str, float] = {}             # task_type → 0-1

    # --- 经验管理 ---
    def add_experience(self, exp: Experience) -> None:
        self._experiences.append(exp)

    def get_experiences(self, task_type: str, limit: int = 10) -> list[Experience]:
        """检索最近的同类任务经验"""
        filtered = [e for e in self._experiences if e.task_type == task_type]
        return sorted(filtered, key=lambda e: e.timestamp, reverse=True)[:limit]
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2511.01093 — Continual Learning, Not Training: Online Adaptation For Agents

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：需历史决策记录（输入上下文、决策与结果）、当前策略规则与执行日志，决策级粒度；卡页称第 5 次补货决策开始质量可见提升。

**输出**：产出可持续更新的持久学习记忆与策略规则、决策质量变化趋势（卡页记录 ROI 13%），供运营与算法团队共同维护。

## 执行步骤

1. 整理历史决策记录与结果反馈
2. 蒸馏历史经验为指导性知识（教师模型）
3. 写入持久学习记忆并在推理时读取应用
4. 允许运营直接编辑策略规则并生效
5. 跟踪第 5 次之后的决策质量变化并回归验证

## 边界与不做

- 业务规则稳定、样本量不足以体现波动时，引入持续学习反而增加维护面
- 学习发生在记忆与编排层，不改动模型权重，复杂规则仍需人工兜底
- 策略改动须由运营显式确认，禁止静默生效

## 技能关联

- **前置**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-AutoSkill-Lifelong-Learning.html、Skill-AutoSkill-Lifelong-Learning、Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation、Skill-Reflexion-Self-Improvement.html、Skill-Reflexion-Self-Improvement、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent
- **延伸**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-AutoSkill-Lifelong-Learning.html、Skill-AutoSkill-Lifelong-Learning、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent
- **可组合**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent、Skill-ATLAS-Gradient-Free-Continual

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-ATLAS-Gradient-Free-Continual`