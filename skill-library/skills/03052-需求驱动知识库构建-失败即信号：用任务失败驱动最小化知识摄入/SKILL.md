---
name: "p2s-demand-driven-kb-construction"
title: "需求驱动知识库构建 — Agent失败即信号：用任务失败驱动最小化知识摄入"
description: "触发词：需求驱动知识库、失败驱动摄入、最小知识集、知识缺口、知识溯源。何时不用：已有成体系文档要做分块入库时用语义分块技能；只维护图谱实体变更时用图谱增量更新技能。安全边界：摄入实体须标注来源与创建周期，不得把未经验证的推断当作合规结论写入知识库。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Demand-Driven-KB-Construction"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "不预先灌几百页文档，而是让 AI 在真实任务里撞墙，撞一次补一条，最后得到一份刚好够用的知识库。"
user_try: "试试：让合规助手处理真实工单，按失败记录知识缺口，逐个补入最小实体，直到能独立完成 US、UK、DE 合规清单。"
whenToUse: "已经知道 AI 要干什么活、但不知道它缺哪些知识时用本技能；手上有成体系文档要整体入库，用分块与知识库构建类技能。"
workflow: "挑高频真实任务让 Agent 试做 → 记录失败与知识缺口描述 → 按缺口摄入最小知识实体 → 重复任务直到收敛 → 输出知识库与实体溯源清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 需求驱动知识库构建 — Agent失败即信号：用任务失败驱动最小化知识摄入

## ① 解决的问题

传统预先规划知识库耗时3个月且充满无用冗余——DDC让Agent在真实任务中失败，用失败信号驱动最小化摄入，20-30个问题周期后知识库收敛，覆盖所有真正需要的知识（零冗余）（2025 arXiv:2603.14057）

## ② 核心算法逻辑

反直觉洞察：传统知识库构建方式是"顶层设计"——先想好"用户会问什么"，然后预先整理所有相关文档摄入知识库。这有两个致命问题：①不知道自己不知道什么（发现问题本身是难题）；②产生庞大冗余的知识库（大量内容永远不会被查询）。DDC（DemandDriven Context）的反直觉方案：让Agent先去干活，等它失败，用失败作为信号确定需要哪些知识。这类似测试驱动开发（TDD）——先写测试（真实任务），再写代码（摄入知识）。

## ③ 业务应用场景

- 传统方式痛点：某母婴品牌让团队花3个月整理了500页合规文档摄入知识库，但AI助手实际使用时频繁出错（因为文档包含大量通用信息，而非Mother&Baby跨境电商的具体场景） - DDC方案： 1. 让合规AI助手处理真实工单（"我的吸奶器要进入英国市场，需要什么认证？"） 2. 第1次失败：不知道UKCA vs CE的区别 → 摄入"UKCA认证流程"实体 3. 第3次失败：不知道FBA海外仓入库需要CPC证书 → 摄入"FBA合规要求"实体 4. 第7次：Agent独立完成US/UK/DE的合规清单 → 合规知识库基本收敛 5. 全程摄入：23个精确实体（vs 500页通用文档的"大而
- 业务问题：供应链AI需要了解"采购-海运-清关-FBA入库"全流程，但SOP文档分散在多个系统，没人知道AI真正需要哪些部分 - DDC执行：从高频任务开始（"帮我计算这批货的到港时间"），让AI失败，按失败收集缺失知识；9轮后形成包含37个实体的供应链知识库，覆盖80%的日常操作场景
三轨验证 | 成本轨：知识图谱构建月均成本1200元（图数据库License 600元/月+数据标注人工12小时/月×50元/小时），首期投入15000元（服务器+工具配置） | 合规轨：符合《跨境电商商品信息规范》和《供应商数据安全协议》，需建立数据隐私保护机制，供应商信息脱敏处理，合规度95% | 风险轨：供应商数据更新滞后导致断货预测准确率下降（概率35%），知识图谱维护人员流失影响数据质量（概率20%），跨境供应链信息孤岛难以打通（概率40%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：传统方式构建合规知识库3个月$15000人工成本，DDC方式2周$3000；知识库精准度更高使AI助手成功率从58%→91%；年化减少人工复查50%；系统成本$2万，ROI≈500%
实施难度：⭐⭐☆☆☆（方法论简单，关键是建立"Agent失败→缺口识别→摄入→验证"的闭环流程，无需特殊技术）
优先级：⭐⭐⭐⭐⭐（知识库是所有Agent的底座，DDC从根本上解决了"如何构建有用的知识库"问题——这比优化检索算法更重要）
适用规模：任何需要构建领域知识库的组织，特别是有大量未结构化领域知识的跨境电商合规/供应链场景
数据依赖：只需要真实任务（而非预先规划的知识），通过失败自动发现需要什么知识

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（294 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/knowledge_graph/demand_driven_kb_construction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Demand-Driven-KB-Construction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
需求驱动知识库构建系统 (Demand-Driven Context)
功能：Agent失败检测 + 知识缺口识别 + 渐进摄入 + 收敛监控
基于 arXiv:2603.14057 (2025)
"""
import json
import uuid
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class EntityType(Enum):
    FACT = "fact"           # 不变的业务规则/定义
    PROCESS = "process"     # 操作步骤序列
    DECISION = "decision"   # 判断准则


class GapSeverity(Enum):
    CRITICAL = "critical"   # 直接导致任务失败
    HIGH = "high"           # 可能导致错误结果
    LOW = "low"             # 影响质量但不影响完成


@dataclass
class KnowledgeEntity:
    """知识实体（DDC的基本单元）"""
    entity_id: str
    name: str
    entity_type: EntityType
    content: str
    domain: str
    source: str                     # 来源（文档路径/专家姓名/系统名称）
    validated_by_tasks: List[str] = field(default_factory=list)  # 验证过此实体的任务ID
    usage_count: int = 0
    created_cycle: int = 0          # 在第几个DDC周期创建


@dataclass
class KnowledgeGap:
    """知识缺口"""
    gap_id: str
    task_id: str
    description: str                # Agent描述的缺口
    context: str                    # 任务上下文
    severity: GapSeverity
    impact_probability: float       # 影响任务成功的概率
    resolved: bool = False
    resolved_by_entity: Optional[str] = None


@dataclass
class DDCTaskResult:
    """DDC一轮任务执行结果"""
    task_id: str
    task_description: str
    success: bool
    gaps_identified: List[KnowledgeGap] = field(default_factory=list)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.14057 — Demand-Driven Context: A Methodology for Building Enterprise Knowledge Bases Through Agent Failure

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待支撑的真实任务清单、Agent 每轮的任务结果与失败描述，以及可用的知识来源（文档、专家、系统），粒度到单条任务与单个知识实体。

**输出**：最小化的知识实体集合（含来源、创建周期、使用次数）与知识缺口清单，以及收敛后的知识库，供 Agent 与知识维护者使用。

## 执行步骤

1. 挑选高频真实任务让 Agent 先试做
2. 记录失败原因并形成知识缺口条目
3. 按缺口摄入最小知识实体并标注来源
4. 重复执行任务，直到 Agent 能独立完成
5. 输出收敛后的知识库与实体溯源清单

## 边界与不做

- 任务场景过于发散、或缺少可摄入的知识来源时无法收敛；已有成体系文档需要整体入库的场景不用本技能。
- 本技能只保证知识覆盖任务所需范围，不保证外部法规内容本身的正确性，合规结论仍需专业人士复核。

## 技能关联

- **前置**：Skill-Context-Kubernetes-KB-Orchestration.html、Skill-Context-Kubernetes-KB-Orchestration、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-KG-Data-Fusion-Pipeline.html、Skill-KG-Data-Fusion-Pipeline、Skill-NuggetIndex-Atomic-Knowledge-Management.html、Skill-NuggetIndex-Atomic-Knowledge-Management、Skill-Semantic-Chunking-Strategy.html、Skill-Semantic-Chunking-Strategy
- **延伸**：Skill-Context-Kubernetes-KB-Orchestration.html、Skill-Context-Kubernetes-KB-Orchestration、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-NuggetIndex-Atomic-Knowledge-Management.html、Skill-NuggetIndex-Atomic-Knowledge-Management
- **可组合**：Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-Demand-Driven-KB-Construction

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：08-知识图谱　·　源卡：`Skill-Demand-Driven-KB-Construction`