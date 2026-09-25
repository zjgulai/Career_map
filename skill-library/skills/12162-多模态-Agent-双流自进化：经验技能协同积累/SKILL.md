---
name: "p2s-xskill-multimodal-self-improvement"
title: "XSkill — 多模态 Agent 双流自进化：经验+技能协同积累"
description: "触发词：多模态自进化、经验流、技能流、主图审核、图像哈希。何时不用：纯文本 Agent 的经验积累走「技能自进化终身学习」；技能注册与加载走「技能注册表」。安全边界：积累所用图片与素材须为自有或已授权，不得引入竞品未授权素材。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / Listing优化"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
p2s_card_id: "Skill-XSkill-Multimodal-Self-Improvement"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "图片审核 Agent 每次都在从零判断时，让它同时积累视觉经验和可复用技能，越做越准。"
user_try: "试试：主图审核 Agent 每次都从零开始，帮我加一套经验和技能双流积累机制。"
whenToUse: "当 Agent 处理多模态任务（图片审核、选品看图）且经验无法跨任务积累时用；若是纯文本经验积累，用「技能自进化终身学习」；若只是技能注册与加载，用「技能注册表」。"
workflow: "记录图片分析轨迹与点击率结果 → 用图像哈希为视觉上下文建立稳定标识 → 把每次失误沉淀为经验流条目 → 相似任务发生时检索经验并合并技能 → 按阈值合并技能并跟踪审核准确率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# XSkill — 多模态 Agent 双流自进化：经验+技能协同积累

## ① 解决的问题

业务问题：婴儿奶粉主图审核 Agent 每次处理新品时独立工作，无法积累"什么样的主图点击率高"的视觉经验

## ② 核心算法逻辑

XSkill 解决的是 AI Agent 的"每次从零开始"问题——传统 Agent 缺乏跨任务的知识积累机制，执行 100 次类似任务的性能与第 1 次几乎相同。XSkill 通过双流架构实现持续自进化：

## ③ 业务应用场景

业务问题：婴儿奶粉主图审核 Agent 每次处理新品时独立工作，无法积累"什么样的主图点击率高"的视觉经验。第 50 次审核的准确率和第 1 次一样低，浪费了大量历史轨迹中的隐含知识。
数据要求： - 任务轨迹：图片分析记录（分析步骤 + 决策 + 最终点击率反馈） - 视觉上下文：图片哈希 ID（关联特征） - 历史结果：CTR 数据（用于 outcome 标注）
| 积累阶段 | 技能内容 | 经验内容 | |---------|---------|---------| | 前 5 次 | 基础流程：`检查认证标识 → 评估主体清晰度 → 打分` | 具体失误记录："首次忽略了背景杂乱度对 CTR 的影响" | | 5-10 次 | 优化流程：新增"认证标识位置评分"子步骤 | "左上角认证比中部认证 CTR 高 12%" | | 10+ 次 | 精炼技能：自动区分欧标/美标图片规范 | 竞品对比经验积累 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

XSkill 是 Loop 36-50"自主进化能力"子系列的核心框架
双流设计（经验 + 技能）比单一记忆方案更具泛化能力
与 WF-D 选品 Agent、商品图片审核 Agent 直接对接，落地路径清晰
视觉上下文 UID 需要稳定的图像哈希方案（图片更新后 UID 失效）
经验流相似度计算用 Jaccard 词重叠是 MVP，生产环境建议升级为嵌入向量检索
技能合并阈值（0.6）需根据业务领域校准，过低导致技能爆炸，过高导致技能合并过度

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（447 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
XSkill — 多模态 Agent 双流自进化框架
来源: arXiv:2603.12056 | 2026年3月
场景: 商品图片分析 Agent + 选品 Agent 的持续知识积累
"""

import json
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
from enum import Enum


class TaskOutcome(Enum):
    SUCCESS = "success"
    PARTIAL = "partial"
    FAILURE = "failure"


@dataclass
class Experience:
    """经验条目：战术层知识（具体轨迹反思）"""
    task_type: str
    context_summary: str            # 任务上下文摘要
    action_taken: str               # 执行的关键动作
    outcome: TaskOutcome            # 结果
    lesson: str                     # 提炼的教训
    visual_context_uid: Optional[str] = None  # 视觉上下文哈希 ID
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    relevance_score: float = 0.5    # 当前任务相关度（检索时动态赋值）

    def to_dict(self) -> dict:
        return {
            "task_type": self.task_type,
            "context_summary": self.context_summary,
            "action_taken": self.action_taken,
            "outcome": self.outcome.value,
            "lesson": self.lesson,
            "visual_context_uid": self.visual_context_uid,
            "created_at": self.created_at,
            "relevance_score": self.relevance_score,
        }


@dataclass
class Skill:
    """技能条目：战略层知识（结构化可复用流程）"""
    skill_id: str
    task_type: str
    task_description: str
    procedure_steps: list           # 执行步骤列表
    success_rate: float = 0.5       # 历史成功率
    usage_count: int = 0            # 使用次数
    version: int = 1                # 版本号
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict:
        return {
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.12056 — XSkill: Continual Learning from Experience and Skills in Multimodal Agents

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：需任务轨迹（图片分析步骤、决策与点击率反馈）、图片哈希 ID 与历史 CTR 数据，图片与任务级粒度；卡页提示需稳定的图像哈希方案。

**输出**：产出持续更新的经验流与技能流条目、按积累阶段细化的审核流程（卡页示例：前 5 次基础流程、5-10 次新增认证标识位置评分、10 次以上区分欧标美标规范），供图片审核与选品 Agent 使用。

## 执行步骤

1. 记录图片分析轨迹、决策与点击率结果
2. 建立视觉上下文的稳定标识（图像哈希）
3. 沉淀每次失误为经验流条目
4. 检索经验并合并技能（相似任务触发）
5. 合并技能并按阈值跟踪审核准确率

## 边界与不做

- 任务量少（卡页称需 10 次以上积累）或图片更新频繁导致哈希失效时，积累效果差
- 只做经验与技能的积累合并，相似度与合并阈值需按业务校准
- 素材须为自有或已授权，不得使用未授权的竞品图片

## 技能关联

- **前置**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-AutoSkill-Lifelong-Learning.html、Skill-AutoSkill-Lifelong-Learning
- **延伸**：Skill-CASCADE-Deployment-Time-Learning.html、Skill-CASCADE-Deployment-Time-Learning、Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation
- **可组合**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-LMM-Searcher-Multimodal-Context.html、Skill-LMM-Searcher-Multimodal-Context、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent、Skill-VLM-Ecommerce-Adaptation.html、Skill-VLM-Ecommerce-Adaptation、Skill-XSkill-Multimodal-Self-Improvement

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-XSkill-Multimodal-Self-Improvement`