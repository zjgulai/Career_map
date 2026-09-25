---
name: "p2s-context-token-compression"
title: "上下文Token压缩 — Summarizer Agent语义保真压缩与成本效益优化"
description: "触发词：上下文压缩、摘要、Token 超限、多轮会话、语义保真。何时不用：预算如何在多 Agent 间分配走「动态上下文预算分配」；压缩破坏缓存前缀导致成本反弹走「生命周期感知上下文驱逐」。安全边界：压缩不得丢失合规与财务的关键结论及引用链，压缩过程须可审计。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
p2s_card_id: "Skill-Context-Token-Compression"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "多轮对话到中途就塞不下上下文时，用摘要压缩历史，让会话能继续跑下去而不丢关键数字。"
user_try: "试试：帮我给这段 8000 token 的会话历史做压缩，保留关键数字和结论，别丢引用来源。"
whenToUse: "当单条会话或 Agent 间传递的上下文超过窗口、需要保真压缩时用；若问题是预算在多 Agent 间怎么分，用「动态上下文预算分配」；若压缩破坏 KV-Cache 前缀导致成本反弹，用「生命周期感知上下文驱逐」。"
workflow: "按内容类型分类：竞品数据、分析过程、结论 → 竞品数据与结论用抽取式保留数字与引用 → 分析过程用抽象式摘要压缩 → 完整保留 doc_id 等引用元数据 → 评估压缩率与语义保真度并追踪成本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 上下文Token压缩 — Summarizer Agent语义保真压缩与成本效益优化

## ① 解决的问题

多轮MAS会话到第15轮就触发上下文窗口上限被迫截断关键信息——Summarizer Agent混合压缩将会话可持续轮次从15轮提升至40+轮，每次会话Token成本降低67%

## ② 核心算法逻辑

核心洞察（Rothman上下文压缩架构）：在长链MAS中，上下文窗口是稀缺资源。随着对话轮次增加，历史消息不断累积，很快就会达到LLM上下文窗口上限（GPT4o: 128K tokens）。传统做法是截断（丢失关键信息）或滚动窗口（遗忘重要历史），都不理想。

## ③ 业务应用场景

- 业务问题：运营团队与MAS进行多轮选品研究对话（通常20-30轮），到第15轮时Token预算耗尽，系统要么截断历史（丢失早期竞品数据）要么报错 - Summarizer Agent方案： 1. 每当上下文超过6000 tokens，自动触发Summarizer Agent 2. 压缩策略：竞品数据（抽取式保留数字），分析过程（抽象式摘要），结论（抽取式保留） 3. 保留引用链：所有doc_id完整保留（不压缩引用元数据） 4. 压缩比：8000 tokens → 2200 tokens（压缩率72.5%） - 预期产出： - 会话可持续轮次从15轮→40+轮（不触发上下文上限） - GP
场景B：大规模市场报告生成的Token成本优化
- 业务问题：生成一份50页市场报告需要处理大量中间数据（Research Agent产出3000 tokens），在传给Report Agent时会触发大量Token消耗，每份报告成本$0.85 - 方案：在Research→Report的Agent间插入Summarizer，将Research输出压缩至800 tokens（关键数字+结论保留），Report Agent生成质量不变但成本降至$0.24/份 - 年化节省：生成500份报告/年，节省$305，系统成本$2000，24个月ROI=+52%（加上时效提升的间接价值则ROI更高）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月500次会话的MAS系统，混合压缩使Token成本降低70%；以GPT-4o价格估算，月节省约$50-200（取决于上下文长度）；更重要的是使会话可持续轮次从15轮→40+轮，大幅提升复杂任务完成率；系统建设成本$2万，ROI≈500%
实施难度：⭐⭐⭐☆☆（抽取式压缩实现简单；抽象式压缩需要调用LLM进行摘要（额外API成本）；混合策略需要内容分类器）
优先级：⭐⭐⭐⭐⭐（任何多轮MAS系统必然面临上下文窗口限制，这是不可回避的工程挑战；Rothman专门用Ch6讲这个主题）
适用规模：多轮对话>10轮的MAS系统，或需要处理大量文档的研究型Agent
数据依赖：无需外部数据；需要历史会话数据来校准压缩策略和保真度阈值

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（349 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/mas/context_token_compression` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Context-Token-Compression.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
上下文Token压缩系统 — Summarizer Agent
功能：三种压缩策略 + 语义保真度评估 + 成本追踪 + 玻璃盒可审计
基于 Denis Rothman《Context Engineering for Multi-Agent Systems》Ch6
"""
import re
import math
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class CompressionStrategy(Enum):
    EXTRACTIVE = "extractive"
    ABSTRACTIVE = "abstractive"
    HYBRID = "hybrid"


@dataclass
class ContentSegment:
    """上下文内容片段（带类型标注）"""
    content: str
    segment_type: str       # 'fact', 'reasoning', 'conclusion', 'citation', 'constraint'
    importance: float       # 0-1 重要性评分
    citations: List[str] = field(default_factory=list)  # 关联的引用ID


@dataclass
class CompressionResult:
    """压缩结果"""
    original_tokens: int
    compressed_tokens: int
    compressed_content: str
    compression_ratio: float
    fidelity_score: float
    strategy_used: str
    citation_integrity: float   # 引用完整性（0-1）
    audit_trail: List[Dict]     # 玻璃盒审计追踪
    cost_saved_usd: float


class TokenCounter:
    """Token计数器（简化：4字≈1token）"""

    @staticmethod
    def count(text: str) -> int:
        return max(len(text) // 4, 1)

    @staticmethod
    def estimate_cost(tokens: int, model: str = 'gpt-4o') -> float:
        prices = {
            'gpt-4o': 0.000005,     # $5/M input tokens
            'gpt-4o-mini': 0.0000002,
        }
        return tokens * prices.get(model, 0.000005)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：需待压缩的会话或 Agent 间传递内容（含数字、结论与 doc_id 等引用元数据），按内容类型可分类；卡页称无需外部数据，可用历史会话校准保真度阈值。

**输出**：产出压缩后的上下文（卡页示例：8000 tokens 压至 2200 tokens、压缩率 72.5%）、保真度评估与成本对比，供多轮 MAS 会话继续执行使用。

## 执行步骤

1. 把上下文按内容类型分为数据、过程与结论三类
2. 抽取式压缩竞品数字与结论，保留原始数值
3. 抽象式摘要压缩分析过程
4. 完整保留 doc_id 等引用链元数据
5. 评估压缩率与语义保真度并追踪 Token 成本

## 边界与不做

- 内容总量远低于窗口上限时压缩没有收益，反而增加摘要调用成本
- 只做压缩与保真度评估，抽象摘要本身会产生额外 LLM 调用成本
- 合规与财务结论不得压缩丢失，压缩过程须可审计
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Domain-Agnostic-Context-Engine.html、Skill-Domain-Agnostic-Context-Engine、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Domain-Agnostic-Context-Engine.html、Skill-Domain-Agnostic-Context-Engine、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-Context-Token-Compression

---

> 分类：数据与Agent平台/数据与AI运行/容量管理　·　技术族：10-MAS　·　源卡：`Skill-Context-Token-Compression`