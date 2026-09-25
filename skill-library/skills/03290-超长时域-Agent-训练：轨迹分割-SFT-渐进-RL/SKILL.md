---
name: "p2s-klong-long-horizon-agent-training"
title: "KLong — 超长时域 Agent 训练：轨迹分割 SFT + 渐进 RL"
description: "触发词：长时域任务、轨迹分割、渐进式强化学习、选品调研训练、长链路Agent。何时不用：任务只有几步、提示工程即可满足时不必训练；缺 GPU 资源时先用检索增强的通用模型。安全边界：训练轨迹须来自自有业务并按隐私要求脱敏，不得把客户数据或平台受限数据用于训练。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-KLong-Long-Horizon-Agent-Training"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把几十步的长链路任务切成带重叠的片段做监督微调，再用渐进式强化学习，让 Agent 记得住前文、学得会策略。"
user_try: "试试：用我们 200 条选品调研轨迹，规划一套轨迹分割 SFT 加渐进 RL 的训练方案。"
whenToUse: "属于「业务工具实现」：任务长达数十步、通用模型中途遗忘或调用成本过高，且团队有训练资源时用；若任务只有几步，用提示工程或工作流编排即可；若只是缺领域知识，用领域预训练或知识注入。"
workflow: "采集长时域任务的完整轨迹，标注最终决策是否正确 → 用带重叠窗口的轨迹分割器切分长轨迹 → 在分割后的片段上做监督微调 → 按课程难度安排渐进式强化学习 → 评估长任务成功率，并随业务 SOP 变化更新模型"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KLong — 超长时域 Agent 训练：轨迹分割 SFT + 渐进 RL

## ① 解决的问题

训练工程师面临长链路任务学不会——KLong将长任务成功率42%提到68%，年化省20万元

## ② 核心算法逻辑

训练 LLM Agent 执行超长时域任务（50+ 步）面临两大瓶颈：

## ③ 业务应用场景

母婴出海选品调研是典型的超长时域任务，完整流程包含 50+ 步骤：
现有方案：用通用 LLM 逐步执行，但： - 超长上下文导致中途"遗忘"前期调研结论 - 每次重新启动都要重发全量背景，成本极高 - 无法持续学习改进执行策略
数据要求： - 历史选品调研记录（至少 200 条完整轨迹） - 成功/失败标注（最终选品决策是否正确） - GPU 训练资源（至少 8×A100 或 4×H100）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

数据要求：高，需要大量高质量超长轨迹数据（200+ 条标注轨迹）
技术门槛：高，需要 GPU 训练基础设施 + RL 训练经验
工程复杂度：高，轨迹采集 + 分割 + SFT + RL 的完整管线
维护成本：中，模型需定期更新（随业务 SOP 变化）
长期战略价值高：自有专精 Agent 比持续依赖 API 更具竞争护城河
短期门槛较高：需要 GPU 训练资源，中小团队直接落地困难

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（386 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/llm_agent_engineering/klong_long_horizon_agent_training` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-KLong-Long-Horizon-Agent-Training.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
KLong — 超长时域 Agent 训练：轨迹分割 SFT + 渐进 RL
论文: KLong: Training LLM Agents for Extreme Long-Horizon Tasks
arXiv: 2602.17547 | 2026-02 (v2 2026-04)

核心组件:
- AgentTrajectory: 完整任务轨迹数据结构
- TrajectorySplitter: 带重叠窗口的轨迹分割器
- ProgressiveRLScheduler: 渐进式 RL 课程调度器
- ResearchFactory: 训练数据自动化生成管线
- KLongTrainer: 模拟训练流程（SFT + Progressive RL）
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


# 数据结构
@dataclass
class Step:
    """单步 Agent 交互"""
    step_id: int
    role: str                     # "user", "assistant", "tool"
    content: str
    tool_calls: list[dict] = field(default_factory=list)
    token_count: int = 0


@dataclass
class AgentTrajectory:
    """完整任务轨迹"""
    trajectory_id: str
    task_type: str
    steps: list[Step]
    total_tokens: int
    context_limit: int
    success: bool = False
    reward: float = 0.0

    @property
    def assistant_turns(self) -> int:
        return sum(1 for s in self.steps if s.role == "assistant")

    def exceeds_context(self) -> bool:
        return self.total_tokens > self.context_limit


@dataclass
class SubTrajectory:
    """分割后的子轨迹"""
    parent_id: str
    sub_id: int
    steps: list[Step]
    overlap_with_prev: int         # 与上一个子轨迹重叠的 step 数
    is_first: bool
    is_last: bool
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.17547 — KLong: Training LLM Agent for Extremely Long-horizon Tasks

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史长链路任务轨迹（卡页示例至少 200 条完整选品调研轨迹）、成功与失败标注，以及 GPU 训练资源（卡页示例至少 8×A100 或 4×H100）。

**输出**：可执行长时域任务的专精 Agent 与训练管线（轨迹分割器、渐进 RL 调度器）；卡页示例把长任务成功率从 42% 提升到 68%。

## 执行步骤

1. 采集长链路任务的完整轨迹，标注最终决策是否正确
2. 用带重叠窗口的分割器把长轨迹切成可训练片段
3. 在片段上做监督微调，保留跨段上下文
4. 按课程难度安排渐进式强化学习
5. 评估长任务成功率，并随业务 SOP 变化定期更新模型

## 边界与不做

- 数据不满足时不用：没有足够的长轨迹标注，或没有 GPU 训练资源时不要启动；卡页提示中小团队直接落地困难。
- 能力边界：本卡产出训练方案与专精模型，不含业务流程本身的梳理改造，训练管线需随业务变化重跑。
- 训练轨迹须来自自有业务并按隐私要求脱敏，不得把客户数据或平台受限数据用于训练。

## 技能关联

- **前置**：Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-Reflexion-Self-Improvement.html、Skill-Reflexion-Self-Improvement、Skill-Self-Improving-Agent-Feedback-Loop.html、Skill-Self-Improving-Agent-Feedback-Loop
- **延伸**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability
- **可组合**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Context-Compression.html、Skill-Context-Compression、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-KLong-Long-Horizon-Agent-Training

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-KLong-Long-Horizon-Agent-Training`