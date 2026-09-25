---
name: "p2s-car-agent-causal-shapley"
title: "CAR — Agent步骤因果Shapley归因：多步交互效应定量拆解"
description: "触发词：因果归因、Shapley 值、贡献拆解、反事实干预、责任量化。何时不用：只需要定位到哪个节点失败时用图遍历根因分析即可，本技能成本更高；安全边界：反事实重跑需在隔离环境进行，不得对生产系统做干预实验。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-CAR-Agent-Causal-Shapley"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "一次决策错了，不只告诉你哪步有问题，还告诉你每一步各占多少责任。"
user_try: "试试：这次补货量算错，帮我拆解库存评估和采购决策各贡献了多少。"
whenToUse: "多个步骤都参与了错误、需要定量拆解贡献时用本技能；只要定位单点根因用因果图根因分析，要生成修复方案用因果调试类技能。"
workflow: "把执行轨迹建模为结构因果模型 → 对候选步骤做干预并重跑轨迹 → 用蒙特卡洛 Shapley 估计各步贡献 → 按贡献排序输出修复优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CAR — Agent步骤因果Shapley归因：多步交互效应定量拆解

## ① 解决的问题

运营技术团队面临"补货/广告Agent决策失效但不知哪步出错"——结构因果模型+蒙特卡洛Shapley将多步交互责任定量拆解，MTTR从3天降至0.5天，年化断货损失预防50-150万元

## ② 核心算法逻辑

当 LLM Agent 失败时（多退款、错误工具调用、数据泄露），现有工具只能回答"发生了什么"（可观测性）或"是否通过"（评估），但无法回答"哪一步决定导致了失败"。

## ③ 业务应用场景

业务问题：母婴跨境卖家的补货工作流由4个Agent组成（需求预测 → 库存评估 → 采购决策 → PO生成），大促前某批PO生成了错误采购量（比需求预测低40%），导致大促期间断货损失¥380,000。事后需要确定"哪个Agent的哪步决定是根本原因"，以便修复workflow逻辑。
现有工具的局限：AgentTrace（图遍历）定位到"采购决策Agent出错"，但无法区分是"库存评估Agent给的输入有偏差"还是"采购决策Agent的安全库存计算逻辑本身有问题"——两者都参与了最终错误，但贡献比例未知。
CAR处理： - 将整次补货执行轨迹建模为SCM，4个步骤互为依赖节点 - 分别对"库存评估步骤"和"采购决策步骤"执行反事实干预（do-operator） - 重新跑轨迹，测量各步干预后PO准确率变化 - 蒙特卡洛Shapley分配：库存评估步骤贡献 φ=0.62，采购决策步骤贡献 φ=0.31

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：
断货损失预防：¥50,000-380,000/次（母婴大促场景）
工程排查时间：从3天→0.5天/次，节省工程师成本 ¥15,000+/次
ROAS损失预防（广告Agent）：¥80,000-150,000/季度
年化综合ROI：¥500,000-1,500,000（视Agent规模）
实施难度：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（284 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/car_agent_causal_shapley` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-CAR-Agent-Causal-Shapley.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CAR - Causal Agent Replay: Agent步骤Shapley因果归因
基于结构因果模型和蒙特卡洛Shapley估计

依赖: numpy, itertools
"""

import numpy as np
from itertools import combinations
from typing import Callable, List, Dict, Tuple
import random

# ─────────────────────────────────────────────
# 数据结构定义
# ─────────────────────────────────────────────

class AgentStep:
    """Agent执行轨迹中的单个步骤"""
    def __init__(self, step_id: str, action: dict, observation: dict, outcome: float = None):
        self.step_id = step_id
        self.action = action          # 该步执行的动作
        self.observation = observation # 该步的输入上下文
        self.outcome = outcome         # 0=失败, 1=成功, 或连续值

class AgentTrajectory:
    """完整的Agent执行轨迹"""
    def __init__(self, steps: List[AgentStep], final_outcome: float, trajectory_id: str = ""):
        self.steps = steps
        self.final_outcome = final_outcome  # 最终结果(0=失败/1=成功)
        self.trajectory_id = trajectory_id

# ─────────────────────────────────────────────
# CAR核心实现
# ─────────────────────────────────────────────

class CausalAgentReplay:
    """
    CAR: 结构因果模型 + 蒙特卡洛Shapley
    
    用法：
    1. 提供历史失败轨迹
    2. 提供每步的"反事实正确动作"  
    3. 提供轨迹重执行函数
    4. 调用 compute_shapley() 获取每步的因果贡献
    """
    
    def __init__(self, replay_fn: Callable, n_monte_carlo: int = 100, seed: int = 42):
        """
        replay_fn: 给定步骤干预集合，重执行轨迹并返回结果
                  签名: (trajectory, interventions: dict{step_id: counterfactual_action}) -> float
        n_monte_carlo: Shapley蒙特卡洛采样次数（100次约达到±0.05精度）
        """
        self.replay_fn = replay_fn
        self.n_monte_carlo = n_monte_carlo
        np.random.seed(seed)
        random.seed(seed)
    
    def counterfactual_effect(
        self, 
        trajectory: AgentTrajectory,
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2606.08275 — Causal Agent Replay: Counterfactual Attribution for LLM-Agent Failures

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：完整执行轨迹（各步骤互为依赖节点）、可复跑的执行环境与评价指标（如 PO 准确率）；需要支持反事实重跑。

**输出**：各步骤的 Shapley 贡献值与排序、错误归因结论，供工作流修复与责任定位使用。

## 执行步骤

1. 把轨迹抽象为结构因果模型节点
2. 对每步施加干预并重新执行
3. 对干预结果做蒙特卡洛 Shapley 估计
4. 按贡献值排序输出归因结论
5. 给出修复优先级的建议方向

## 边界与不做

- 只需定位失败节点时用图遍历方法更快，不必做 Shapley 估计。
- 本技能产出贡献度归因，不自动修改工作流逻辑。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 反事实重跑必须在隔离环境进行，不得对生产链路做干预实验。

## 技能关联

- **前置**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-CausalFlow-Agent-Failure-Repair.html、Skill-CausalFlow-Agent-Failure-Repair、Skill-Dynamic-DAG-Orchestration.html、Skill-Dynamic-DAG-Orchestration
- **延伸**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Dynamic-DAG-Orchestration.html、Skill-Dynamic-DAG-Orchestration
- **可组合**：Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Dynamic-DAG-Orchestration.html、Skill-Dynamic-DAG-Orchestration、Skill-CAR-Agent-Causal-Shapley

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：16-智能体工程　·　源卡：`Skill-CAR-Agent-Causal-Shapley`