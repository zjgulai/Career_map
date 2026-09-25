---
name: "p2s-cascade-deployment-time-learning"
title: "CASCADE — 案例推理部署时学习：Contextual Bandit 无参数自适应"
description: "触发词：部署时学习、案例推理、上下文老虎机、广告素材、首投成功率。何时不用：靠记忆层在线适应规则走「梯度无关持续学习」；从失败轨迹巩固策略走「对比反思与自我巩固」。安全边界：案例库只能使用自有原创素材，复用第三方文案与素材前须确认授权。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
p2s_card_id: "Skill-CASCADE-Deployment-Time-Learning"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "上线后策略跟不上实际效果时，让系统按历史案例在线调整选择，越用越贴合真实业务。"
user_try: "试试：我们广告素材每次都要从零构思，帮我搭一个按历史成功案例推荐创意的机制。"
whenToUse: "当策略上线后与真实反馈失配、希望在部署阶段持续适应时用；若靠记忆规则在线适应，用「梯度无关持续学习」；若靠失败轨迹反向巩固，用「对比反思与自我巩固」。"
workflow: "收集历史案例并标注效果结果 → 建立案例库与嵌入检索 → 用 contextual bandit 在线选择策略 → 记录每次选择的实际效果 → 定期清理失效与失败案例"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CASCADE — 案例推理部署时学习：Contextual Bandit 无参数自适应

## ① 解决的问题

发布经理面临上线后策略失配——CASCADE将部署失败率8%降到2%，年化省19万元

## ② 核心算法逻辑

部署时学习（DeploymentTime Learning, DTL） 是 CASCADE 提出的第三个 LLM 生命周期阶段：预训练（Pretraining）→ 微调（Finetuning）→ 部署时学习。现有方案只在前两个阶段学习，部署后模型冻结，无法从实际使用中积累经验。

## ③ 业务应用场景

痛点：广告素材测试结果分散，每次面对新商品都从零构思创意，成功经验无法系统复用。
效果：广告素材出图时间从 3 小时压缩至 40 分钟；新品首投成功率显著高于历史均值。
三轨验证： - 成本：需搭建案例库存储（约 $50/月 云数据库）和 Embedding 模型调用（约 $0.002/次）；初期需人工标注 50-100 条历史案例作为种子库，约 2 人天工作量。 - 合规：案例库中若包含竞品广告文案或受版权保护的素材，复用可能触发 Amazon 广告政策中的"重复内容"审查；需确保案例均为自有原创素材。 - 风险：过度依赖历史成功案例可能导致创意同质化，用户产生"广告疲劳"，CTR 长期下降；若案例库中失败案例未被及时清理，可能系统性复用错误策略。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：20.9%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（314 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/llm_agent_engineering/cascade_deployment_time_learning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-CASCADE-Deployment-Time-Learning.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CASCADE — Case-Based Continual Adaptation for Large Language Models During Deployment
Paper: arXiv:2605.06702 | May 2026
Use case: WF-B ad creative agent + WF-E review handling case retrieval
"""
from __future__ import annotations

import hashlib
import math
import time
from dataclasses import dataclass, field
from typing import Any


# ─── 数据类 ───────────────────────────────────────────────────────────────

@dataclass
class Case:
    """案例条目：上下文嵌入 + 解决方案 + 观测结果"""
    case_id: str
    context_text: str               # 原始上下文文本（用于可读性）
    context_embedding: list[float]  # 上下文语义嵌入向量
    solution: str                   # 解决方案描述
    outcome: float                  # 0=失败，1=成功（支持 0-1 连续值）
    timestamp: float = field(default_factory=time.time)
    task_domain: str = ""
    tags: list[str] = field(default_factory=list)


# ─── CaseBank（案例库）──────────────────────────────────────────────────

class CaseBank:
    """案例存储 + 相似度检索 + 成功案例保留"""

    def __init__(self, max_size: int = 200) -> None:
        self._cases: list[Case] = []
        self.max_size = max_size

    def add(self, case: Case) -> None:
        """添加新案例，超出容量时淘汰最旧的低质量案例"""
        self._cases.append(case)
        if len(self._cases) > self.max_size:
            # 按 outcome 降序保留，淘汰最旧的失败案例
            self._cases.sort(key=lambda c: (c.outcome, c.timestamp), reverse=True)
            self._cases = self._cases[:self.max_size]

    def cosine_similarity(self, a: list[float], b: list[float]) -> float:
        """余弦相似度计算"""
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(y * y for y in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def retrieve_similar(
        self,
        query_embedding: list[float],
        task_domain: str = "",
        top_k: int = 5,
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.06702 — CASCADE: Case-Based Continual Adaptation for Large Language Models During Deployment

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：需历史案例（卡页示例人工标注 50-100 条种子案例，含上下文与效果）与效果反馈数据，案例级粒度；卡页提示案例库存储约 50 美元每月、嵌入调用约 $0.002 每次。

**输出**：产出案例检索与在线选择策略、部署效果对比（卡页记录部署失败率 8% 降至 2%、素材出图时间 3 小时压到 40 分钟），供投放与运营团队使用。

## 执行步骤

1. 收集历史案例并标注效果结果
2. 建立案例库并接入嵌入检索
3. 在线选择策略（contextual bandit）
4. 记录每次选择的实际效果并回流案例库
5. 定期清理失效与失败案例

## 边界与不做

- 案例量少或业务一次性、无重复决策时，在线学习收益有限
- 只产出策略选择建议，案例质量依赖人工标注
- 案例库只用自有原创素材，复用第三方内容须先确认授权

## 技能关联

- **前置**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-AutoSkill-Lifelong-Learning.html、Skill-AutoSkill-Lifelong-Learning、Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability
- **延伸**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability
- **可组合**：Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-CASCADE-Deployment-Time-Learning

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-CASCADE-Deployment-Time-Learning`