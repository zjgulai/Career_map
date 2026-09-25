---
name: "p2s-docre-document-level-relation-extraction"
title: "Skill-DocRE-Document-Level-Relation-Extraction"
description: "触发词：文档级关系抽取、跨句关系、实体图、证据句、合规文档解析。何时不用：要按问题逐步决定检索时机时用「DeepRAG 逐步检索」，要检测内部知识与外部知识冲突时用「知识冲突检测」。安全边界：抽取结果必须保留原文证据句，不得脱离出处直接当作合规结论。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 知识溯源"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-DocRE-Document-Level-Relation-Extraction"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 200 页的 FDA 安全指南自动读成关系网，配方奶粉、铅限值、检测资质之间的跨页关系一次抽出来。"
user_try: "试试：从这份 200 页 FDA 产品安全指南里抽出婴儿配方奶粉与铅含量上限、检测机构资质之间的跨句关系。"
whenToUse: "要在长篇合规文档、多章节供应商协议里抽跨句实体关系并留证据时用；要按问题逐步决定检索时机时用「DeepRAG 逐步检索」；要检测知识冲突时用「知识冲突检测」。"
workflow: "切分文档句子并标注实体与出现位置 → 构建跨句实体图并合并同一实体的多次出现 → 用文档级关系模型做跨句多跳推理 → 为每条关系抽取支撑证据句 → 输出关系三元组供知识图谱与风险溯源使用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-DocRE-Document-Level-Relation-Extraction

## ① 解决的问题

合规团队面临"FDA 200页文件跨句关系人工梳理需2天"——文档级关系抽取（GREP/ACL2025）将合规文档处理提速96倍至30分钟，跨句关系覆盖率从40%提升至85%

## ② 核心算法逻辑

文档级关系抽取（DocRE）处理跨越多个句子的实体关系，需要推理能力。与句子级RE不同，DocRE需要：

## ③ 业务应用场景

场景1：合规监管文档关系抽取 FDA长达200页的产品安全指南中： - 第3页提及"婴儿配方奶粉" - 第87页描述"铅含量限制<0.01ppm" - 第156页规定"检测机构必须持有ISO 17025认证"
DocRE抽取跨文档关系： (婴儿配方奶粉, 铅含量上限, <0.01ppm) (铅检测, 资质要求, ISO 17025认证)
**场景2：供应商技术协议关系网络** 从供应合同（多章节）自动抽取： - 交货期、质量标准、违约条款间的因果链关系 - 供应商→产品→认证→有效期的完整链路 建立供应链KG，风险溯源时间从2天→2小时

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

合规文档处理速度：人工2天/份 → 自动化30分钟/份，提升96x
跨句关系覆盖率：句子级RE覆盖40% → DocRE覆盖85%的真实关系
供应链风险溯源：从2天缩短至2小时
年化合规审查成本节省：约120万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（222 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
DocRE: Document-Level Relation Extraction
基于GREP/ATLOP思路的文档级关系抽取
"""
from typing import List, Dict, Tuple, Set
import numpy as np

class DocREExtractor:
    """
    文档级关系抽取器
    支持跨句子多跳推理
    """
    
    def __init__(self, model_name: str = "ATLOP-bert-base"):
        self.model_name = model_name
        self.relation_types = []
        self.na_label = "NA"
    
    def build_entity_graph(
        self, 
        sentences: List[str],
        entities: List[Dict]  # [{"text": ..., "sentence_idx": ..., "span": ...}]
    ) -> Dict:
        """
        构建实体关系图（跨句子）
        
        Returns:
            entity_graph: 包含节点和边的图结构
        """
        nodes = []
        for ent in entities:
            nodes.append({
                "id": ent["text"],
                "sentence": ent["sentence_idx"],
                "mentions": [ent],  # 同一实体可能多次出现
                "context": sentences[ent["sentence_idx"]] if ent["sentence_idx"] < len(sentences) else ""
            })
        
        # 跨句子共指合并（同名实体视为同一节点）
        merged_nodes = {}
        for node in nodes:
            key = node["id"].lower()
            if key not in merged_nodes:
                merged_nodes[key] = node
            else:
                merged_nodes[key]["mentions"].extend(node["mentions"])
        
        return {
            "nodes": list(merged_nodes.values()),
            "node_count": len(merged_nodes)
        }
    
    def extract_evidence_sentences(
        self,
        entity_a: str,
        entity_b: str, 
        sentences: List[str],
        max_evidence: int = 3
    ) -> List[str]:
        """
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：文档原文（如 200 页 FDA 产品安全指南、多章节供应商技术协议）与预先标注的实体列表（text、sentence_idx、span）；粒度：文档级，实体跨越多个句子。

**输出**：文档级关系三元组与实体关系图（如（婴儿配方奶粉, 铅含量上限, <0.01ppm）、（铅检测, 资质要求, ISO 17025 认证）），每条关系附最多 3 条证据句；用于构建供应链知识图谱、把风险溯源从 2 天缩短至 2 小时。

## 执行步骤

1. 切分文档并标注实体与句子位置
2. 构建跨句实体图并合并同现实体
3. 用文档级关系模型做多跳关系推理
4. 为每条关系抽取证据句
5. 输出关系三元组供知识图谱与溯源使用

## 边界与不做

- 数据不满足时不用：文档为不可解析的扫描件、或未做实体预标注时，跨句关系抽不出来。
- 能力边界：只抽取文档中已写明的关系并附证据句，不做法规解释与准入判定，结论须人工复核。

## 技能关联

- **可组合**：Skill-DocRE-Document-Level-Relation-Extraction

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：08-知识图谱　·　源卡：`Skill-DocRE-Document-Level-Relation-Extraction`