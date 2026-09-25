---
name: "p2s-dial-kg-schema-free-incremental"
title: "DIAL-KG无Schema增量知识图谱构建 — 动态Schema归纳+治理裁决+增量演化闭环"
description: "触发词：无 Schema 建图、增量知识图谱、动态 Schema、治理裁决、双轨提取。何时不用：领域 Schema 已稳定、只需一次性按既定本体填充时用本体 Schema 设计类技能；本技能面向数据按批次持续到达、关系类型还会长出来的场景。安全边界：公开商品数据可用，用户评论与卖家内部数据需授权；自动归纳的关系若含竞品敏感信息，公开前须过治理裁决。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-DIAL-KG-Schema-Free-Incremental"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "不用先设计 Schema，把产品页面、合规报告、市场数据分批喂进去，图谱边建边长、随时增量更新。"
user_try: "试试：把这批 Amazon 产品页和合规报告建成知识图谱，先不要预设实体和关系类型。"
whenToUse: "Schema 未知或业务快速演化、需要按批次增量并入时用本技能；Schema 已定稿只需按本体填充用本体设计类技能。"
workflow: "按批次输入非结构化文档 → 双轨（三元组与事件）抽取候选事实 → 对冲突事实做治理裁决 → 归纳并演化 Schema → 增量并入已有图谱并留变更记录"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DIAL-KG无Schema增量知识图谱构建 — 动态Schema归纳+治理裁决+增量演化闭环

## ① 解决的问题

传统KG构建需要2周人工设计Schema且无法应对快速演化的领域知识——DIAL-KG双轨提取+治理裁决+动态Schema归纳完全无需预定义，KG质量和Schema质量双SOTA，支持增量更新无需重建（2026 arXiv:2603.20059）

## ② 核心算法逻辑

反直觉洞察：传统知识图谱构建需要先设计本体（Ontology）和Schema——"哪些实体类型？哪些关系类型？"这个过程往往需要领域专家参与，耗时数周甚至数月。反直觉的是：对于跨境电商这类快速演化的领域，预定义Schema反而是障碍——新品类出现（"无绳跑步机"）、新法规颁布（"CPSIA更新"）、新平台规则（"TikTok Shop合规"），每次变化都需要人工修改Schema。DIALKG的方案：完全不需要预定义Schema，让Sch

## ③ 业务应用场景

- 传统方式痛点：母婴品牌想构建产品知识图谱，需要领域专家先设计Schema（实体类型：产品/品牌/类目/认证；关系类型：属于/具有/适用于），这个过程需要2周，且Schema设计不当会导致大量事实无法表达 - DIAL-KG方案： 1. 直接输入非结构化文档（Amazon产品页+合规报告+市场数据） 2. 第1批：DIAL-KG归纳出初步Schema（产品→评分、产品→类目） 3. 第3批：出现新关系"需要认证"→自动添加到Schema 4. 第5批：TikTok Shop相关数据→自动归纳"适用于平台"关系 5. 完全无需人工预定义，Schema在10批数据后基本稳定 - 预期产出：KG构
三轨验证： - 成本：显性成本约$1,200/月（LLM API调用$800 + 数据采集爬虫$200 + 存储与计算$200）；人力投入从2周工程师降至2天运维 - 合规：数据采集需遵守Amazon robots.txt及平台数据使用条款；产品评分/销量等公开数据合规，但用户评论/卖家内部数据需授权；不触碰GDPR个人数据红线 - 风险：自动归纳的关系类型可能包含竞品敏感信息（如价格对比），若公开可能引发竞品投诉；Schema自动提升若出错（如将"疑似违规"提升为正式关系），可能导致错误决策
- 业务问题：Amazon每月更新2-5条卖家政策，当前没有系统化知识图谱追踪，运营团队靠手工阅读邮件，常遗漏重要变化 - DIAL-KG增量方案：每周从Amazon News+Seller Forums自动提取，通过治理裁决识别"政策更新"（软性弃用旧规则+添加新规则），Schema自动识别新的政策类型；Agent查询时自动获得最新且经过验证的政策知识 - 预期产出：政策变化追踪覆盖率从60%提升至95%，遗漏重要变化的概率从40%降至5%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：传统KG构建需要2

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（336 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after class definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/knowledge_graph/dial_kg_schema_free_incremental` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-DIAL-KG-Schema-Free-Incremental.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DIAL-KG无Schema增量知识图谱构建系统
功能：双轨提取 + 治理裁决 + Schema演化 + MKB元知识库
基于 arXiv:2603.20059 (2026)
"""
import re
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any
from collections import defaultdict, Counter
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class ExtractionTrack(Enum):
    TRIPLE = "triple"   # 默认：三元组
    EVENT = "event"     # 复杂知识：事件


class EvolutionIntent(Enum):
    NEW_FACT = "new_fact"           # 全新事实
    UPDATE_FACT = "update_fact"     # 更新已有事实
    SOFT_DEPRECATE = "soft_deprecate"  # 软性弃用（保留历史）
    CONFLICT = "conflict"           # 冲突，需要裁决


@dataclass
class Triple:
    """知识三元组"""
    subject: str
    relation: str
    obj: Any
    confidence: float = 1.0
    source: str = ""
    batch_id: int = 0


@dataclass
class Event:
    """复杂事件记录"""
    event_type: str
    subject: str
    object_entity: str
    time: Optional[str] = None
    condition: Optional[str] = None
    confidence: float = 0.9
    source: str = ""


@dataclass
class SchemaElement:
    """Schema元素（从数据归纳）"""
    element_type: str       # 'entity_type' or 'relation_type'
    name: str
    frequency: int = 1      # 出现频率
    examples: List[str] = field(default_factory=list)
    promoted: bool = False  # 是否提升为正式Schema


class MetaKnowledgeBase:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.20059 — DIAL-KG: Schema-Free Incremental Knowledge Graph Construction via Dynamic Schema Induction and Evolution-Intent Assessment
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：非结构化文档：Amazon 产品页、合规报告、市场数据等，按批次投喂；无需预定义 Schema，也无需标注数据。

**输出**：随批次演化的动态 Schema 与增量更新的知识图谱（含治理裁决记录），供 Agent 查询最新且经验证的领域知识。

## 执行步骤

1. 按批次收集并切分非结构化文档
2. 用双轨提取产出候选三元组与事件
3. 对冲突事实做治理裁决与置信判定
4. 归纳新关系类型并升级 Schema
5. 把增量合并进图谱并记录 Schema 变更

## 边界与不做

- 领域 Schema 已定稿、只需一次性批量建图时不用本技能。
- 本技能产出图谱与 Schema 演进结果，不做下游推荐、客服等业务决策。
- 用户评论与平台内部数据需授权后才可入图；自动归纳的关系公开前须过治理裁决。

## 技能关联

- **前置**：Skill-Context-Kubernetes-KB-Orchestration.html、Skill-Context-Kubernetes-KB-Orchestration、Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration、Skill-Ontology-Schema-Design.html、Skill-Ontology-Schema-Design、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph
- **延伸**：Skill-Context-Kubernetes-KB-Orchestration.html、Skill-Context-Kubernetes-KB-Orchestration、Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph
- **可组合**：Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration、Skill-DIAL-KG-Schema-Free-Incremental

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：08-知识图谱　·　源卡：`Skill-DIAL-KG-Schema-Free-Incremental`