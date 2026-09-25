---
name: "p2s-mas-dynamic-trust"
title: "MAS Dynamic Trust — 多智能体动态信任图：抵御 Sleeper Agent 与历史感知可信聚合"
description: "触发词：动态信任、可信聚合、消息历史、数据源隔离、Sleeper Agent。何时不用：只有一个数据源、没有交叉验证对象时信任加权没有意义；本技能面向多 Agent 与多数据源并发的场景。安全边界：信任分与隔离阈值是契约产物，实际隔离动作由执行层完成；信任分不得用于对合作方的公开评价。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-MAS-Dynamic-Trust"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "给每个 Agent 和数据源记一份动态信任分，被污染的输出自动降权甚至隔离，不让它带偏整条决策链。"
user_try: "试试：大促期间某个库存数据源预测异常，帮我评估要不要把它的输出隔离掉。"
whenToUse: "多个 Agent 或多数据源对同一结论有分歧、需要动态加权时用本技能；只有单一来源时不需要信任聚合。"
workflow: "记录 Agent 间消息历史与决策结果反馈 → 用贝叶斯信任图更新各来源可信度 → 结合注意力权重做历史感知聚合 → 对低信任来源的输出降权或隔离"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS Dynamic Trust — 多智能体动态信任图：抵御 Sleeper Agent 与历史感知可信聚合

## ① 解决的问题

若某个市场行情 Agent 被错误数据污染（如竞品恶意干扰），所有下游决策将偏差

## ② 核心算法逻辑

MAS 中 Agent 之间传递消息，但消息的可信度并不相同——某个 Agent 可能已被攻击者控制（Sleeper Agent），在积累足够信任后才触发恶意行为。动态信任管理解决的问题是：在没有可信第三方的情况下，每个 Agent 如何评估其他 Agent 发来消息的可信度，并据此决定接受或拒绝。

## ③ 业务应用场景

业务背景：AgenticPay 采购谈判系统由多个 Agent 协同工作——价格谈判 Agent、合规检查 Agent、市场行情 Agent。若某个市场行情 Agent 被错误数据污染（如竞品恶意干扰），所有下游决策将偏差。
数据要求： - Agent 间消息历史（JSON 格式）：`{agent_id, message_type, content, outcome}` - 决策结果反馈：`{decision_id, outcome, correct: bool}`
业务背景：AIM-RM 库存管理系统接收来自多个数据源的库存预测（本地仓、海外仓、第三方 3PL）。当大促期间某个数据源出现系统故障，产生异常预测值，如何自动隔离该数据源？

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5-30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（415 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/mas/mas_dynamic_trust` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-MAS-Dynamic-Trust.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
MAS Dynamic Trust Management
整合 DynaTrust (Bayesian信任图) + A-Trust (Attention量化) + ECL (历史感知聚合)
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from scipy.stats import beta as beta_dist


@dataclass
class TrustEdge:
    """Alpha-beta Bayesian 信任边"""
    agent_id: str
    alpha: float = 1.0   # 成功交互次数（+1 先验）
    beta: float = 1.0    # 失败交互次数（+1 先验）
    history: List[bool] = field(default_factory=list)  # True=可靠, False=不可靠

    @property
    def mean(self) -> float:
        return self.alpha / (self.alpha + self.beta)

    @property
    def confidence(self) -> float:
        """交互次数越多，置信度越高"""
        n = self.alpha + self.beta - 2  # 减去先验
        return min(1.0, n / 20)         # 20次交互达到满置信

    def update(self, outcome: bool):
        if outcome:
            self.alpha += 1
        else:
            self.beta += 1
        self.history.append(outcome)

    def sample(self) -> float:
        return np.random.beta(self.alpha, self.beta)


class DynamicTrustGraph:
    """
    DynaTrust 动态信任图
    - 每个 Agent 维护对其他所有 Agent 的信任边
    - 接收端评分（非发送端自报）
    - 陪审团共识用于高风险决策
    """

    def __init__(
        self,
        agent_id: str,
        trust_threshold: float = 0.6,
        jury_threshold: float = 0.5,
        jury_size: int = 2,
    ):
        self.agent_id = agent_id
        self.trust_threshold = trust_threshold
        self.jury_threshold = jury_threshold
        self.jury_size = jury_size
        self.edges: Dict[str, TrustEdge] = {}
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.15661 — DynaTrust: Defending Multi-Agent Systems Against Sleeper Agents via Dynamic Trust Graphs

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：Agent 间消息历史（agent_id、message_type、content、outcome）与决策结果反馈（decision_id、outcome、correct），JSON 格式；需持续累积历史才能形成可信度曲线。

**输出**：各 Agent 与数据源的动态信任分、聚合后的决策结果、建议隔离的低信任来源清单，供 MAS 编排层与运维使用。

## 执行步骤

1. 采集 Agent 消息与决策结果反馈
2. 按贝叶斯规则更新信任分
3. 结合注意力与历史做可信聚合
4. 对低信任来源降权或标记隔离
5. 把结果反馈回信任分更新闭环

## 边界与不做

- 只有单一数据源、没有交叉验证对象时，信任加权没有意义。
- 本技能产出信任分与聚合结果，不执行实际的隔离与切换动作。
- 信任分只能用于内部聚合决策，不得作为对合作方的公开评价依据。

## 技能关联

- **前置**：Skill-CAMEL-Role-Playing-Agents.html、Skill-CAMEL-Role-Playing-Agents、Skill-Multi-Agent-Debate.html、Skill-Multi-Agent-Debate
- **延伸**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception
- **可组合**：Skill-Graph-Grounded-MAS-Protocol.html、Skill-Graph-Grounded-MAS-Protocol、Skill-MASEval-System-Evaluation.html、Skill-MASEval-System-Evaluation、Skill-MAS-Dynamic-Trust

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：10-MAS　·　源卡：`Skill-MAS-Dynamic-Trust`