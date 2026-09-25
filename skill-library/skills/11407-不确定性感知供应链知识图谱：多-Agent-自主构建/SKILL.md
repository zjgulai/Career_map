---
name: "p2s-helicase-supply-chain-kg-mas"
title: "Helicase — 不确定性感知供应链知识图谱：多 Agent 自主构建"
description: "触发词：多跳溯源、供应商调研、不确定性评分、图谱构建。何时不用：只需一级供应商信息时不必用多 Agent 调查，常规检索即可；不需要沉淀图谱的一次性调研也不适用。安全边界：仅使用公开数据源，不采集非公开数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 知识溯源"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Helicase-Supply-Chain-KG-MAS"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "让多个智能体自动调研原料到认证机构的多跳关系，输出带不确定性标注的供应链图谱。"
user_try: "试试：帮我调研这家有机奶粉供应商从原料到认证机构的全链路，并标注不确定的地方。"
whenToUse: "本卡属「供应商评估」。需要从公开数据源构建多跳供应商溯源图谱并标注不确定性时用本卡；只查询已知的一级供应商信息时用常规检索。"
workflow: "以品牌与核心 SKU 发起查询 → 派发调查子任务 → 抽取节点与边并打不确定性分 → 高不确定性节点转人工复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Helicase — 不确定性感知供应链知识图谱：多 Agent 自主构建

## ① 解决的问题

业务问题：母婴品牌（奶粉/辅食）需追踪"原料→供应商→工厂→认证机构"多跳关系，人工调研一家供应商需 3-5 天，百家供应商无法覆盖

## ② 核心算法逻辑

Helicase 是一个自主多 Agent LLM 系统，将高层供应链查询（如"某奶粉品牌的原料来源"）分解为可执行调查计划，通过专业 Agent 协作增量构建带不确定性标注的知识图谱。名字来源于生物学的螺旋酶——螺旋式展开 DNA，隐喻系统通过迭代循环逐层揭示知识。

## ③ 业务应用场景

业务问题：母婴品牌（奶粉/辅食）需追踪"原料→供应商→工厂→认证机构"多跳关系，人工调研一家供应商需 3-5 天，百家供应商无法覆盖。监管（FDA/欧盟 CE）和消费者对溯源透明度要求日增。
数据要求： - 初始查询：品牌名 + 核心 SKU（如"xxx 有机奶粉 A2 蛋白"） - 公开数据源：FDA 供应商数据库、企业官网 SEC/工商披露、LinkedIn 公司主页、新闻数据库
预期产出： - KG 节点：原料名称、供应商公司、工厂地址、认证机构、认证编号、有效期 - KG 边：供应关系（置信度 0.0-1.0）、认证关系、地理关系 - 高不确定性节点自动标注（uncertainty_score > 0.7 → 触发人工复核）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
供应商尽调周期 5 天/家 → 2 小时/家，节省 80% 人工成本（按 10 人·5 天/月 = 50 人·天，节省 40 人·天/月 ≈ 8 万元/月）
召回风险发现时效从 2 周 → 48 小时，避免违规上架处罚（平均罚款 $5,000-$50,000/次）
新品类合规预审时间降低 75%（3 天 → 4 小时）
实施难度：⭐⭐⭐☆☆
需要 LLM API 调用能力（GPT-4/Claude）和 Web 搜索工具集成

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（410 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/helicase_supply_chain_kg_mas` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Helicase-Supply-Chain-KG-MAS.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Helicase Supply Chain KG MAS — 不确定性感知供应链知识图谱多 Agent 构建
arXiv:2605.26835 | Python 3.14+ | 仅标准库，无需额外安装

参考论文: Helicase: Uncertainty-Guided Supply Chain Knowledge Graph
Construction with Autonomous Multi-Agent LLMs
"""
from __future__ import annotations

import json
import math
import random
from dataclasses import dataclass, field
from typing import Any


# ── 数据结构 ──────────────────────────────────────────────────────────────────

@dataclass
class KGNode:
    """知识图谱节点（含不确定性评分）"""
    node_id: str
    entity_type: str           # supplier / ingredient / factory / certifier / product
    name: str
    attributes: dict[str, Any] = field(default_factory=dict)
    uncertainty_score: float = 0.5   # 0=确定，1=高度不确定
    sources: list[str] = field(default_factory=list)
    last_verified: str = ""


@dataclass
class KGEdge:
    """知识图谱边（含不确定性评分）"""
    edge_id: str
    from_node: str
    to_node: str
    relation_type: str         # supplies / certified_by / manufactured_at / recalled_for
    confidence: float = 0.5   # 关系置信度 0-1
    uncertainty_score: float = 0.5
    evidence: list[str] = field(default_factory=list)


@dataclass
class InvestigationTask:
    """调查子任务"""
    task_id: str
    query: str
    target_entity: str
    priority: float = 0.5
    status: str = "pending"   # pending / running / done


# ── 三层不确定性跟踪器 ────────────────────────────────────────────────────────

class UncertaintyTracker:
    """
    三层不确定性量化框架：
    - action_uncertainty:     单步工具调用结果置信度
    - trajectory_uncertainty: 多轮推理链路累积不确定性
    - memory_uncertainty:     KG 节点时效性和来源可信度
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2605.26835 — Helicase: Uncertainty-Guided Supply Chain Knowledge Graph Construction with Autonomous Multi-Agent LLMs

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：初始查询（品牌名与核心 SKU）与公开数据来源：监管供应商数据库、企业官网与披露、公司主页、新闻数据库。

**输出**：供应链知识图谱的节点与边（供应关系含置信度、认证关系、地理关系）、高不确定性节点清单与人工复核触发标记。

## 执行步骤

1. 用品牌名与核心 SKU 发起溯源查询
2. 派发调查子任务抓取公开数据源
3. 抽取节点与边并计算置信度与不确定性
4. 对高不确定性节点触发人工复核
5. 输出可追溯的供应链图谱与溯源结论

## 边界与不做

- 只需要一级供应商信息时不必用多 Agent 调查，常规检索即可
- 本卡产出图谱与置信度标注，不替代供应商现场审核与合同尽调
- 仅使用公开数据源，不采集非公开数据

## 技能关联

- **前置**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Emotional-AI-Customer-Care.html、Skill-Emotional-AI-Customer-Care、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Graph-Grounded-MAS-Protocol.html、Skill-Graph-Grounded-MAS-Protocol、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-KG-Augmented-Recommendation-CoLaKG.html、Skill-KG-Augmented-Recommendation-CoLaKG、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator
- **延伸**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Emotional-AI-Customer-Care.html、Skill-Emotional-AI-Customer-Care、Skill-Graph-Grounded-MAS-Protocol.html、Skill-Graph-Grounded-MAS-Protocol、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-KG-Augmented-Recommendation-CoLaKG.html、Skill-KG-Augmented-Recommendation-CoLaKG
- **可组合**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Emotional-AI-Customer-Care.html、Skill-Emotional-AI-Customer-Care、Skill-Graph-Grounded-MAS-Protocol.html、Skill-Graph-Grounded-MAS-Protocol、Skill-KG-Augmented-Recommendation-CoLaKG.html、Skill-KG-Augmented-Recommendation-CoLaKG、Skill-Helicase-Supply-Chain-KG-MAS

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：10-MAS　·　源卡：`Skill-Helicase-Supply-Chain-KG-MAS`