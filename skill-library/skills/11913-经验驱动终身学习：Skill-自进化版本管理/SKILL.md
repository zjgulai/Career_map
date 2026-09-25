---
name: "p2s-autoskill-lifelong-learning"
title: "AutoSkill — 经验驱动终身学习：Skill 自进化版本管理"
description: "触发词：技能自进化、经验积累、版本管理、知识刷新、可审计。何时不用：把 SOP 编译进模型权重走「工作流编译」；技能注册与动态发现走「技能注册表」。安全边界：技能演化过程须留版本与溯源记录，不得覆盖旧版本导致无法回滚。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
p2s_card_id: "Skill-AutoSkill-Lifelong-Learning"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "同类决策反复从零开始时，把每次经验沉淀成可复用技能并持续刷新，用久了自然越用越准。"
user_try: "试试：帮我看看这 50 次选品决策能沉淀成什么可复用的技能框架。"
whenToUse: "当同类任务重复做、经验散落在会话里无法累积时用；若要把固定流程编译进模型权重，用「工作流编译」；若只是注册和发现技能，用「技能注册表」。"
workflow: "从会话与任务轨迹中归纳可复用模式 → 抽取为带触发条件的技能草案 → 写入技能库并标注版本与来源 → 在新任务中检索复用并记录效果 → 按效果反馈迭代刷新技能版本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AutoSkill — 经验驱动终身学习：Skill 自进化版本管理

## ① 解决的问题

培训负责人面临技能卡片更新滞后——AutoSkill将知识刷新周期30天压到7天，年化省15万元

## ② 核心算法逻辑

RAG 的局限：被动检索，只能复用已显式存入的知识，无法从对话轨迹中自动归纳模式；Finetuning 的局限：参数固化后无法增量更新，每次新能力都需全量重训，知识以黑盒形式埋在权重里，不可审计不可编辑。

## ③ 业务应用场景

痛点：每次写欧美妈妈向产品描述都从零开始，没有可复用的文案框架，质量忽高忽低。
效果：文案生产效率提升 3×，质量一致性显著改善；新运营人员可直接查看 SkillBank 学习专业文案技巧。
痛点：50 次选品决策分散在不同会话，没有系统积累，每次重新分析同类品类浪费大量 Token。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（347 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
AutoSkill — Experience-Driven Lifelong Learning via Skill Self-Evolution
Paper: arXiv:2603.01145 | Mar 2026
Use case: DTC copywriting skill accumulation + WF-D product selection specialization
"""
from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, field
from typing import Any


# ─── 数据类 ───────────────────────────────────────────────────────────────

@dataclass
class SkillArtifact:
    """Skill 条目：可复用的任务执行模式，版本化管理"""
    skill_id: str
    version: int                    # 版本号，从1开始递增
    task_domain: str                # 任务领域（如 "copywriting", "product_selection"）
    trigger_pattern: str            # 触发模式（自然语言描述的适用场景）
    trigger_keywords: list[str]     # 关键词列表，用于快速匹配
    instructions: str               # 执行指令（结构化文本）
    usage_count: int = 0            # 使用次数
    fitness: float = 0.5            # 0-1，基于用户反馈和成功率
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    parent_skill_id: str = ""       # 合并来源（如果是从其他 Skill 合并而来）


@dataclass
class ConversationTurn:
    """单次对话轨迹条目"""
    turn_id: str
    user_input: str
    agent_response: str
    task_domain: str
    quality_score: float            # 0-1，用户反馈/自动评估
    timestamp: float = field(default_factory=time.time)
    tags: list[str] = field(default_factory=list)


# ─── SkillExtractor（技能提炼器）────────────────────────────────────────

class SkillExtractor:
    """从对话轨迹中识别可复用模式，生成 SkillArtifact 草稿"""

    DOMAIN_PATTERNS: dict[str, list[str]] = {
        "copywriting": ["文案", "描述", "产品介绍", "copywriting", "欧美妈妈"],
        "product_selection": ["选品", "奶粉", "品类", "竞争", "BSR", "评分"],
        "customer_service": ["退款", "客诉", "售后", "差评", "投诉"],
        "supply_chain": ["补货", "备货", "库存", "供应链", "物流"],
    }

    def detect_domain(self, text: str) -> str:
        """简单关键词匹配检测任务领域"""
        for domain, keywords in self.DOMAIN_PATTERNS.items():
            if any(kw in text for kw in keywords):
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.01145 — AutoSkill: Experience-Driven Lifelong Learning via Skill Self-Evolution

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：需任务执行轨迹与会话记录（卡页示例 50 次选品决策、文案撰写记录）与效果反馈，任务级粒度，需保留版本与溯源信息。

**输出**：产出持续增长的技能库条目与版本、知识刷新周期与效率对比（卡页记录刷新周期 30 天压到 7 天、文案生产效率提升 3 倍），供运营与知识管理团队使用。

## 执行步骤

1. 归纳可复用模式（任务轨迹与会话记录）
2. 抽取为带触发条件的技能草案
3. 写入技能库并标注版本与来源
4. 检索复用技能并记录效果反馈
5. 刷新技能版本并按反馈迭代

## 边界与不做

- 任务高度一次性、缺少重复模式时，技能沉淀没有复利
- 技能抽取依赖轨迹与反馈质量，无人复核时可能固化错误经验
- 须保留版本与溯源记录，禁止直接覆盖旧版本

## 技能关联

- **前置**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-CASCADE-Deployment-Time-Learning.html、Skill-CASCADE-Deployment-Time-Learning、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-Self-Improving-Agent-Feedback-Loop.html、Skill-Self-Improving-Agent-Feedback-Loop、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-CASCADE-Deployment-Time-Learning.html、Skill-CASCADE-Deployment-Time-Learning、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **可组合**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design、Skill-AutoSkill-Lifelong-Learning

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-AutoSkill-Lifelong-Learning`