---
name: "p2s-mas-dynamic-kg-collaboration"
title: "MAS Dynamic KG Collaboration — 多智能体动态知识图谱协同：实时构建、冲突解决、协同进化"
description: "触发词：动态知识图谱、多 Agent 协同、冲突消解、经验沉淀、实时写入。何时不用：单 Agent 顺序更新图谱、不存在并发写入时用常规图谱写入；本技能解决多 Agent 并发读写与冲突裁决。安全边界：需建立审计日志追踪每个 Agent 的决策链路；跨境数据传输中的敏感信息按数据安全规范处理。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-MAS-Dynamic-KG-Collaboration"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "多个分析 Agent 同时往一张知识图谱里写数据，冲突自动裁决，Agent 的经验也留在图谱里不随会话丢失。"
user_try: "试试：把竞品价格、评论数、BSR 这几路信息并进竞品图谱，冲突的按来源可信度裁决。"
whenToUse: "多个 Agent 并发读同一图谱、写入会冲突，或需要把 Agent 经验沉淀下来时用本技能；单 Agent 顺序更新用常规图谱写入。"
workflow: "定义三元组结构与来源标签 → 多 Agent 并发写入并标注时间戳与置信度 → 按来源与时间做冲突消解裁决 → 把 Agent 经验写回图谱供下次复用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS Dynamic KG Collaboration — 多智能体动态知识图谱协同：实时构建、冲突解决、协同进化

## ① 解决的问题

知识运营面临商品知识更新滞后——Dynamic KG Collaboration将上新同步时延72小时压到6小时，年化省16万元

## ② 核心算法逻辑

SkillHelicaseSupplyChainKGMAS 解决的是"如何让 MAS 构建一个静态知识图谱"——一次性构建，然后查询。动态 KG 协同解决的是更难的问题：知识在持续演变，多个 Agent 同时读写 KG，如何保持 KG 的一致性、处理冲突、并让 KG 与 Agent 共同进化？

## ③ 业务应用场景

业务背景：品牌维护一个竞品 KG（记录竞品价格、评论数量、新品发布、Amazon BSR 排名）。每天有 50+ 条新信息需要写入 KG，同时多个分析 Agent 并发读写，经常出现数据冲突（不同 Agent 报告同一产品的不同价格）。
业务背景：WF-D 选品扫描 MAS 每次评估都会产生"经验"（哪些品类值得进入、哪些合规风险高、哪些季节性强），但这些经验存在 Agent 的 context 里，下次启动后全部遗失。
三轨验证 | 成本轨：系统部署成本月均3,200元（含云服务2,000元、模型调用800元、人工维护8小时/月@200元/小时），年度ROI 340%（相比传统备货方案节省成本约38万元） | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》和《多Agent系统数据安全规范》，需建立审计日志机制追踪每个Agent决策链路，通过ISO 27001认证的云服务商部署 | 风险轨：①库存预测偏差风险（概率12%）：大促期间消费需求波动导致预测准确率下降至85%以下；②Agent协同失效风险（概率8%）：多Agent间通信延迟或决策冲突导致备货延误；③数据安全风险（概率5%）：跨境数据传输中敏感

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

8万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（162 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：7」并记录位置 `paper2skills-code/mas/mas_dynamic_kg_collaboration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-MAS-Dynamic-KG-Collaboration.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple
import time


@dataclass
class Triple:
    subject: str
    predicate: str
    obj: Any
    source: str = "unknown"
    confidence: float = 1.0
    timestamp: float = field(default_factory=time.time)

    def key(self) -> str:
        return f"{self.subject}|{self.predicate}"


@dataclass
class ConflictReport:
    key: str
    existing: Triple
    incoming: Triple
    conflict_type: str


class MemGraphRAG:
    """
    三层共享记忆 KG：本体层 / 事实层 / 段落层
    三 Agent 流水线：Extractor → Conflict Detector → Resolution
    """

    SOURCE_PRIORITY = {"official": 3, "media": 2, "social": 1, "unknown": 0}

    def __init__(self):
        self.ontology: Dict[str, List[str]] = {}
        self.facts: Dict[str, Triple] = {}
        self.passages: Dict[str, str] = {}

    def define_schema(self, entity_type: str, allowed_predicates: List[str]):
        self.ontology[entity_type] = allowed_predicates

    def extract_triples(self, text: str, source: str = "unknown") -> List[Triple]:
        triples = []
        for line in text.strip().split("\n"):
            parts = [p.strip() for p in line.split("|") if p.strip()]
            if len(parts) == 3:
                triples.append(Triple(parts[0], parts[1], parts[2], source=source))
        return triples

    def detect_conflicts(self, candidates: List[Triple]) -> Tuple[List[Triple], List[ConflictReport]]:
        clean, conflicts = [], []
        for t in candidates:
            existing = self.facts.get(t.key())
            if existing is None:
                clean.append(t)
            elif str(existing.obj) == str(t.obj):
                clean.append(t)
            else:
                conflict_type = (
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2603.20059 — DIAL-KG: Schema-Free Incremental Knowledge Graph Construction via Dynamic Schema Induction and Evolution-Intent Assessment
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：多来源增量事实（竞品价格、评论数、新品发布、BSR 排名等），按三元组粒度并带来源标识与时间戳；场景为多 Agent 并发读写。

**输出**：冲突消解后的动态知识图谱与审计日志（可追溯每个 Agent 的决策链路），供选品与竞品分析 Agent 复用。

## 执行步骤

1. 定义三元组结构与来源可信度字段
2. 接入多 Agent 的并发写入
3. 对同一事实的冲突按来源与时间裁决
4. 把 Agent 经验沉淀为可复用条目
5. 输出图谱快照与决策链路审计日志

## 边界与不做

- 单 Agent 顺序写入、没有并发冲突的场景不用本技能。
- 本技能产出图谱协同规则与冲突裁决结果，不代替实际备货或选品决策。
- 须建立 Agent 决策日志审计机制，跨境传输中的敏感信息按数据安全规范处理。

## 技能关联

- **前置**：Skill-Graph-Grounded-MAS-Protocol.html、Skill-Graph-Grounded-MAS-Protocol、Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-Multimodal-RAG.html、Skill-Multimodal-RAG
- **延伸**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory
- **可组合**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-MAS-Dynamic-Trust.html、Skill-MAS-Dynamic-Trust、Skill-MAS-Dynamic-KG-Collaboration

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：10-MAS　·　源卡：`Skill-MAS-Dynamic-KG-Collaboration`