---
name: "p2s-kg-application-patterns"
title: "KG Application Patterns — 知识图谱下游应用：从构建到推荐/搜索/冷启动"
description: "触发词：知识图谱应用、冷启动标注、连带推荐、Co-Teaching、类目预测。何时不用：图谱还没建好、没有可用的属性图与销售关系时先用图谱构建类技能；本技能是把已建好的图谱用到类目标注与推荐上。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 商品诊断 / 转化优化"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-KG-Application-Patterns"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "图谱建好之后怎么用：新品没数据时让大模型先归类，有行为数据后交给图模型接管，顺带做连带推荐。"
user_try: "试试：这批新品只有标题和描述，先按图谱做类目预测，标出需要人工确认的那几款。"
whenToUse: "上游图谱已就绪、要把图用到新品类目标注或关联推荐时用本技能；还在建图谱用构建类技能，纯关键词匹配的类目映射不需要图谱。"
workflow: "构建 SKU 类目图（属性图加历史销售关系） → 新品冷启动阶段由大模型预测类目 → 积累 2 到 4 周交互后由图模型接管精化 → 用链接预测补全推荐图"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KG Application Patterns — 知识图谱下游应用：从构建到推荐/搜索/冷启动

## ① 解决的问题

知识图谱构建完成后无法应用——LLM-GNN Co-Teaching 将 KG 应用到新品类目标注（冷启动准确率 93%）和跨平台关联推荐（连带销售率+5-8%），年化 GMV ¥50-110 万

## ② 核心算法逻辑

知识图谱的价值不在于"建完"，而在于"用好"。图谱构建完成后，有三类核心下游任务：节点分类（SKU 类目自动标注）、链接预测（商品关系补全）、冷启动推荐（新品零历史数据的推荐）。这三类任务的共同难点是少标注 + 新节点。

## ③ 业务应用场景

业务问题：母婴团队每月上架 50 款新品，需要手工分配到 Amazon 的 200+ 子类目。分类错误会导致搜索流量损失（错误类目的关键词权重不同），且修改需等待 Amazon 审核。
Co-Teaching 处理： 1. 构建 SKU 类目图：用 AutoPKG 输出的属性图 + 历史销售关系（一起购买、互补品） 2. 新品冷启动：新 SKU 只有文本描述（无交互历史）→ LLM 老师根据标题/描述预测类目 3. 有交互后精化：积累 2-4 周浏览/购买数据 → GNN 老师接管，精化类目归属
预期产出：新品类目分配准确率从人工 85% → 模型 93%+；人工标注时间从 2 小时/款 → 5 分钟确认

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
新品类目自动标注：人工时间从 2 小时/款 → 5 分钟，50 SKU/月节省 ¥15,000+/月
类目准确率提升（85%→93%）带来搜索流量增长 8-15%，年化 GMV ¥20-60 万
链接预测补全推荐图：连带销售率提升 5-8%，年化 GMV ¥10-30 万
年化综合 ROI：¥50-110 万
实施难度：⭐⭐⭐☆☆（需要 PyG/DGL 基础；冷启动版本纯 LLM 即可上线，2-3 天）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（229 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/knowledge_graph/kg_application_patterns` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-KG-Application-Patterns.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
KG Application Patterns — LLM-GNN Co-Teaching 下游应用
基于 arXiv: 2606.11583

依赖: json, random, dataclasses (标准库)
生产环境: 替换 MockGNN/MockLLM 为真实模型
"""

from dataclasses import dataclass, field
import random
import json


@dataclass
class SKUNode:
    """知识图谱中的 SKU 节点"""
    sku_id: str
    title: str
    description: str
    category: str = ""          # 真实类目（训练集）
    predicted_category: str = ""
    confidence_gnn: float = 0.0
    confidence_llm: float = 0.0
    is_cold_start: bool = False  # 新品（无图结构邻居）


@dataclass
class KGGraph:
    """简化的知识图谱"""
    nodes: dict = field(default_factory=dict)   # {sku_id: SKUNode}
    edges: list = field(default_factory=list)   # [(src, tgt, relation)]

    def get_neighbors(self, sku_id: str) -> list:
        return [tgt for src, tgt, _ in self.edges if src == sku_id] + \
               [src for src, tgt, _ in self.edges if tgt == sku_id]


class MockGNN:
    """模拟 GNN 推理（生产环境替换为 PyG/DGL）"""

    CATEGORY_MAP = {
        "pump": "Breast Pumps", "steril": "Sterilizers",
        "bottle": "Baby Bottles", "stroller": "Strollers",
        "diaper": "Diapers", "formula": "Baby Formula",
    }

    def predict(self, node: SKUNode, graph: KGGraph) -> tuple:
        """基于图结构预测类目"""
        neighbors = graph.get_neighbors(node.sku_id)
        if not neighbors or node.is_cold_start:
            return "", 0.0  # 冷启动时无法预测

        # 多数投票（从邻居推断）
        neighbor_categories = [
            graph.nodes[n].category for n in neighbors
            if graph.nodes.get(n) and graph.nodes[n].category
        ]
        if not neighbor_categories:
            return "", 0.3
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2606.11583 — Beyond the Golden Teacher: Enhancing Graph Learning through LLM-GNN Co-teaching

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：已构建的 SKU 属性图与历史销售关系（一起购买、互补品）；新品侧只需标题与描述文本，冷启动阶段不要求交互历史。

**输出**：新品类目预测（含置信度）与人工确认清单、补全后的推荐图与连带推荐结果，供上架与推荐运营使用。

## 执行步骤

1. 构建 SKU 类目图与销售关系边
2. 对无交互历史的新品用大模型预测类目
3. 对已有 2 到 4 周交互的 SKU 交给图模型精化
4. 用链接预测补全推荐图
5. 输出类目预测与连带推荐结果供人工确认

## 边界与不做

- 上游知识图谱还不存在、或属性图不完整时不用本技能。
- 本技能产出类目预测与推荐结果，不代替向平台提交改类目，也不保证平台审核通过。
- 冷启动阶段依赖标题与描述质量，纯大模型版本需要人工抽查确认。

## 技能关联

- **前置**：Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Product-Knowledge-Graph-Query.html、Skill-Product-Knowledge-Graph-Query
- **延伸**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Product-Knowledge-Graph-Query.html、Skill-Product-Knowledge-Graph-Query
- **可组合**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Product-Knowledge-Graph-Query.html、Skill-Product-Knowledge-Graph-Query、Skill-KG-Application-Patterns

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Application-Patterns`