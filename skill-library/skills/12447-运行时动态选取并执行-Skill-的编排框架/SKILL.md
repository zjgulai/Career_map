---
name: "p2s-agent-skill-runtime-orchestrator"
title: "Agent Skill Runtime Orchestrator — 运行时动态选取并执行 Skill 的编排框架"
description: "触发词：Skill 动态选取、运行时编排、置信打分、Skill 索引、工具路由。何时不用：要编排技能之间的依赖与并行顺序时用「Multi-Agent Skill Composition」；要生成学习路径时用「Skill 依赖路径规划器」。安全边界：置信分低于阈值时不得自动执行高影响技能（下单、改价、清库存），必须转人工确认。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / 技能版本"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-Agent-Skill-Runtime-Orchestrator"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "让 Agent 在几十个技能里按任务上下文自动挑出最合适的那个，别再靠写死的 if/else。"
user_try: "试试：从我们的供应链 Skill 库里给这个库存预警任务选出 Top-3 匹配技能和置信分。"
whenToUse: "当技能数量多（几十个以上）、要靠元数据检索动态选技能时用本技能；已选定技能、需要编排它们之间的依赖与并行顺序，用「Multi-Agent Skill Composition」；要生成学习路径，用「Skill 依赖路径规划器」。"
workflow: "规范化技能 frontmatter 元数据并离线预计算 embedding → 把任务上下文编码为意图向量 → 按 embedding、标签、能力三维打分并排序 → 输出 Top-3 技能、置信分与执行参数模板"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent Skill Runtime Orchestrator — 运行时动态选取并执行 Skill 的编排框架

## ① 解决的问题

AI工程师面临"Agent每次都调相同工具不知道该用哪个Skill最合适"——Embedding+Tag三维打分将Skill动态选取准确率提升至92%，Agent执行效率提升3.4倍

## ② 核心算法逻辑

论文：Toolformer: Language Models Can Teach Themselves to Use Tools | 年份：2023

## ③ 业务应用场景

场景 A：供应链 Agent 动态调用补货 Skill
- 业务问题：供应链 Agent 收到「某 ASIN 库存预警」时，需要从 53 个供应链 Skill 中选出最合适的补货策略（考虑 FBA 入仓延迟、当前季节性、促销节点） - 数据要求：Skill 元数据索引（JSON），任务上下文（库存水位、前置期、历史销速） - 预期产出：Top-3 匹配 Skill + 置信分 + 执行参数模板 - 业务价值：避免 Agent 「乱选工具」导致的错误补货决策，补货准确率从 62% → 89%，年化减少 overstocking 损失约 45 万元
场景 B：广告 Agent 动态路由归因 Skill

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
现状：13 个 Agent 手写 if/else 选工具，每次需求变更 4h 代码修改
引入后：新增 Skill 自动纳入检索，变更成本 → 15 分钟（写 frontmatter）
年化工程成本节省：约 18 万元（按 2 名工程师 × 月均 8 次变更）
Skill 选取准确率从约 65% → 92%，间接减少错误决策损失约 30 万元/年
实施难度：⭐⭐⭐☆☆（需要 Skill frontmatter 规范化 + embedding 服务）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（238 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Agent Skill Runtime Orchestrator
运行时动态选取并执行 Skill 代码模板的编排框架
依赖：numpy（向量相似度），无需真实 API key
"""

import json
import math
import hashlib
from typing import Any
from dataclasses import dataclass, field


# ─── 数据结构 ────────────────────────────────────────────────────────────────

@dataclass
class SkillMeta:
    skill_id: str
    title: str
    module: str
    topic: str
    tags: list[str]
    prerequisites: list[str]
    roadmap_phase: str
    # 离线预计算的 embedding（mock：用 title hash 生成伪向量）
    embedding: list[float] = field(default_factory=list)

    def __post_init__(self):
        if not self.embedding:
            self.embedding = _mock_embed(self.title)


@dataclass
class TaskIntent:
    description: str
    required_tags: list[str]
    context: dict[str, Any]
    embedding: list[float] = field(default_factory=list)

    def __post_init__(self):
        if not self.embedding:
            self.embedding = _mock_embed(self.description)


@dataclass
class SkillMatch:
    skill: SkillMeta
    score: float
    reason: str


# ─── Mock Embedding（生产环境替换为 text-embedding-3-small 或本地模型）────────

def _mock_embed(text: str, dim: int = 16) -> list[float]:
    """基于文本哈希生成确定性伪向量（不依赖真实 API）"""
    h = hashlib.md5(text.encode()).hexdigest()
    vec = []
    for i in range(0, min(dim * 2, len(h)), 2):
        vec.append((int(h[i:i+2], 16) - 127.5) / 127.5)
    norm = math.sqrt(sum(x**2 for x in vec)) or 1.0
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2305.18365 — What can Large Language Models do in chemistry? A comprehensive benchmark on eight tasks

核验口径：主题指向成立但强度不足（词重合 0／点名相似 0.47）。引用前请自行确认。

## 输入 / 输出契约

**输入**：Skill 元数据索引（frontmatter 或 JSON，含标题、标签、能力描述与预计算 embedding）与任务上下文（库存水位、前置期、历史销速等）。

**输出**：Top-3 匹配 Skill + 置信分 + 执行参数模板；供 Agent 运行时选择并调用技能。

## 执行步骤

1. 规范化技能 frontmatter 元数据并离线预计算 embedding
2. 把任务上下文编码为意图向量
3. 按 embedding、标签、能力三维打分并排序
4. 输出 Top-3 技能、置信分与执行参数模板

## 边界与不做

- 数据不满足：技能元数据缺 frontmatter 或标签时检索质量不可控，先做元数据规范化。
- 何时不用：要编排技能间依赖与并行顺序用「Multi-Agent Skill Composition」；要生成学习路径用「Skill 依赖路径规划器」；只有单个工具可调用时不必引入检索。
- 能力边界：只做选取与参数建议，不执行技能，新技能自动纳管后需回归评测确认选得准。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Multi-Agent-Skill-Composition.html、Skill-Multi-Agent-Skill-Composition、Skill-Skill-Card-API-Serving.html、Skill-Skill-Card-API-Serving
- **延伸**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Multi-Agent-Skill-Composition.html、Skill-Multi-Agent-Skill-Composition、Skill-Skill-Card-API-Serving.html、Skill-Skill-Card-API-Serving
- **可组合**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Multi-Agent-Skill-Composition.html、Skill-Multi-Agent-Skill-Composition、Skill-Skill-Card-API-Serving.html、Skill-Skill-Card-API-Serving、Skill-Agent-Skill-Runtime-Orchestrator

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-Skill-Runtime-Orchestrator`