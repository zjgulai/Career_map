---
name: "p2s-ontology-llm-autobuild-sc"
title: "LLM驱动供应链本体自动构建 — 从ERP文档到语义图谱的零样本迭代萃取"
description: "触发词：本体自动构建、零样本抽取、供应链语义、实体合并、迭代萃取。何时不用：手上只有几张结构化表、没有非结构化文档时不用；本技能面向采购订单、邮件、合同这类文本资产。安全边界：合同与邮件属商业敏感，抽取前需确认数据使用授权，图谱访问按最小权限控制。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Ontology-LLM-AutoBuild-SC"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把两年的采购订单和供应商邮件读一遍，自动建出供应商本体和图谱，顺带发现单点故障风险。"
user_try: "试试：从这批 PO 和供应商邮件里抽出供应商实体和供货关系，列出隐性单点故障。"
whenToUse: "本体靠人工维护更新滞后、手上有大量非结构化采购与合同文档时用本技能；Schema 已定稿只需填数据用建图类技能。"
workflow: "收集 PO、邮件、合同、WMS 导出等文本 → 用大模型迭代萃取实体与属性 → 合并别名并归纳本体 Schema → 写入图库并做隐性风险扫描"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM驱动供应链本体自动构建 — 从ERP文档到语义图谱的零样本迭代萃取

## ① 解决的问题

企业本体靠人工维护更新滞后覆盖不全——LLM零样本迭代萃取将本体构建从3个月→2天，新供应商入库2周→1天，识别隐性单点故障提前预防

## ② 核心算法逻辑

Palantir 方法论的核心挑战：本体（Ontology）是整个 AI 决策系统的语义基础，但企业中现有的供应链本体要么是手工维护（更新滞后、覆盖不全），要么根本不存在。LLM 驱动的本体自动构建解决这一根本问题。

## ③ 业务应用场景

场景A：从历史 PO 和邮件自动构建供应商知识图谱
母婴品牌过去 2 年积累了 500+ 份采购订单 PDF 和 1000+ 封供应商邮件，但从未系统化整理。通过 LLM 本体自动构建，在 2 天内完成： - 识别 150+ 个供应商实体（含别名合并） - 提取 3200+ 条供货关系（哪个供应商供哪个 SKU） - 自动标注交货周期、付款条件等属性 - 发现 12 个隐性风险（同一供应商供应多个爆款 SKU 的单点故障）
数据要求：PO PDF/CSV、邮件文本、合同文档、WMS 导出 预期产出：Neo4j 知识图谱（节点 500+、边 3000+）+ 自动生成的本体 Schema 业务价值：本体构建从 3 个月人工建模 → 2 天自动化，节省 80% 人力；发现隐性风险提前预防

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：本体构建从 3 个月人工 → 2 天自动化（↓95% 时间），新供应商入库从 2 周 → 1 天，识别隐性单点故障（年化防损 10-30 万元）
实施难度：⭐⭐⭐☆☆（主要依赖 LLM API + Neo4j，无需专业 NLP 工程师）
优先级：⭐⭐⭐⭐⭐（本体是整个 Palantir 方法论的语义基础，其他层的前提）
企业AI知识库依赖：高 — 本体本身就是 AI 知识库的核心资产，需要版本化管理

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（326 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/ontology_llm_autobuild_sc` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Ontology-LLM-AutoBuild-SC.md`），已与卡面节选核对，不依赖上述路径。

```python
import json
import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field

# 注意：实际使用时替换为真实LLM调用（OpenAI/DeepSeek/Claude）
# 此处用 mock 函数展示接口设计

@dataclass
class OntologyNode:
    """本体节点（提取后的实体）"""
    entity_id: str
    entity_type: str
    properties: Dict[str, str] = field(default_factory=dict)
    source_doc: str = ""
    confidence: float = 1.0

@dataclass
class OntologyEdge:
    """本体边（提取后的关系）"""
    from_id: str
    to_id: str
    relation_type: str
    properties: Dict[str, str] = field(default_factory=dict)
    source_doc: str = ""
    confidence: float = 1.0

class SCOntologyBuilder:
    """
    LLM驱动的供应链本体自动构建器
    
    算法流程：
    1. 初始化种子本体 Schema
    2. 对每个输入文档运行3层提示链
    3. 冲突消解 + 实体合并（fuzzy matching）
    4. 本体扩展（发现新的类型）
    5. 输出知识图谱 + 更新的本体 Schema
    """
    
    def __init__(self, ontology_seed: Dict, llm_func=None):
        """
        Args:
            ontology_seed: 初始本体定义（ObjectTypes + LinkTypes）
            llm_func: LLM调用函数 func(prompt: str) -> str
        """
        self.ontology = ontology_seed.copy()
        self.nodes: Dict[str, OntologyNode] = {}
        self.edges: List[OntologyEdge] = []
        self.llm = llm_func or self._mock_llm
        self.entity_counter = {}  # 统计实体出现频率（用于本体扩展判断）
    
    def _mock_llm(self, prompt: str) -> str:
        """Mock LLM（演示用，替换为真实API调用）"""
        # 模拟从 PO 文档提取实体关系的响应
        mock_responses = {
            "extract": json.dumps({
                "entities": [
                    {"id": "SUP-SZ-001", "type": "Supplier",
                     "properties": {"name": "深圳乐宝科技", "location": "深圳龙华区",
                                   "lead_time_days": "45", "payment_terms": "Net30"}},
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：非结构化与半结构化文档：采购订单 PDF 或 CSV、供应商邮件文本、合同文档、WMS 导出，按单据与文档粒度输入。

**输出**：自动生成的本体 Schema 与图数据库知识图谱（节点与边规模随语料而定），并标注交货周期、付款条件等属性以及单点故障等隐性风险。

## 执行步骤

1. 汇总 PO、邮件、合同与 WMS 导出
2. 用大模型零样本抽取实体与关系
3. 做别名合并与本体归纳
4. 写入图库并标注关键属性
5. 扫描单点故障等隐性风险并输出清单

## 边界与不做

- 数据全为结构化表格、没有非结构化文档时不用本技能。
- 本技能产出本体与图谱，不做本体版本治理的最终审批。
- 采购合同与邮件属商业敏感，需先确认数据使用授权，图谱访问按最小权限控制。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Graph-OKB-Design-SC.html、Skill-Graph-OKB-Design-SC、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-SKU-Master-Data-Golden-Record.html、Skill-SKU-Master-Data-Golden-Record、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Supply-Chain-Data-Lineage-Tracking.html、Skill-Supply-Chain-Data-Lineage-Tracking、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Graph-OKB-Design-SC.html、Skill-Graph-OKB-Design-SC、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Supply-Chain-Data-Lineage-Tracking.html、Skill-Supply-Chain-Data-Lineage-Tracking
- **可组合**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Graph-OKB-Design-SC.html、Skill-Graph-OKB-Design-SC、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Ontology-LLM-AutoBuild-SC

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：24-标签工程　·　源卡：`Skill-Ontology-LLM-AutoBuild-SC`