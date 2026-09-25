---
name: "p2s-audience-knowledge-graph"
title: "Skill Card: Audience Knowledge Graph（广告受众知识图谱）"
description: "触发词：受众扩展、Lookalike 精准度、知识图谱推理、互补品购买、种子人群放大。何时不用：只做购买行为分层或人群标签生成用 RFM、画像类技能，本技能用关系网络做多跳人群扩展。安全边界：用户级行为数据须脱敏聚合后使用，图谱不得纳入敏感属性，扩展人群投放须遵守广告平台定向政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-Audience-Knowledge-Graph"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把买过的人群顺着互补品和关联行为扩出去，找到更多像他们的人。"
user_try: "试试：用我们的种子购买人群做三跳图谱扩展，给出扩展人群规模和投放建议。"
whenToUse: "种子人群太窄、扩展不出量、需要靠互补品与跨域行为找人时用本技能；只按购买行为分层用 RFM 类技能，生成可解释的人群标签用画像类技能。"
workflow: "确定种子人群 → 构建用户、商品、品类的实体关系图谱 → 做多跳路径推理与加权扩展 → 按置信度阈值过滤扩展人群 → 输出投放与风险应用建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card: Audience Knowledge Graph（广告受众知识图谱）

## ① 解决的问题

FB/TikTok Lookalike 受众精准度不足，基于购买行为的种子人群太窄、扩展效果差——受众知识图谱通过互补品购买+跨域行为构建 140% 受众扩展，ROAS 从 2.1 提升到 3.4

## ② 核心算法逻辑

核心思想：将受众从孤立标签转化为关系网络，通过知识图谱的多跳推理发现隐性购买需求，实现"已购用户→互补需求→潜在受众"的链式扩展。

## ③ 业务应用场景

业务问题：S1 吸奶器在欧美市场销售火爆，但核心配件（硅胶法兰、吸力马达）依赖单一供应商，一旦断货将导致整条产品线停售。需要快速识别替代供应商及其客户基础。
具体执行： - 种子受众：过去 180 天购买过 S1 吸奶器的 8500 名欧美消费者 - 知识图谱构建： - 实体：用户、产品 SKU、品类、供应商、物流商 - 边关系：购买、浏览、评价、配套使用、库存关联 - KG 扩展（3 跳）： - 1 跳：购买 S1 吸奶器 → 浏览配件（法兰/奶瓶）的 2100 人 - 2 跳：浏览配件 → 购买过竞品（Spectra/Medela）的 4800 人 - 3 跳：竞品用户 → 同时购买过 Philips Avent 的 3200 人 - 扩展结果：从 8500 人扩展到 18600 人（+118%），其中高置信度（购买过 2 个以上互补品）124
量化产出： - 识别出 3 家替代供应商（Pigeon/Tommee Tippee/NUK），其客户覆盖率 68% - 供应链风险评分从 0.72 降低到 0.28（风险降低 61%） - 预计年度库存成本节省 12-18 万元（通过多源采购降低单一供应商议价权）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

✅ 数据质量：用户购买历史完整度 >90%，产品关系库准确度 >85%
✅ 迭代优化：前 4 周按周频率调整置信度阈值，后续按月优化
✅ 跨团队协作：需要数据、产品、广告投放团队配合

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（264 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 46 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/knowledge_graph/audience_knowledge_graph` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Audience-Knowledge-Graph.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Audience-Knowledge-Graph: 基于知识图谱的受众扩展系统
完整可运行版本，包含图构建、路径推理、受众扩展
"""

import json
from collections import defaultdict, deque
from typing import Dict, Set, Tuple, List
import math

class AudienceKnowledgeGraph:
    """知识图谱受众扩展引擎"""
    
    def __init__(self):
        self.graph = defaultdict(list)  # {node: [(neighbor, weight, relation_type)]}
        self.node_type = {}  # {node: type}
        self.user_features = {}  # {user_id: {feature: value}}
    
    def add_edge(self, src: str, dst: str, weight: float, relation: str):
        """添加有向加权边"""
        self.graph[src].append((dst, weight, relation))
    
    def add_node_type(self, node: str, node_type: str):
        """标记节点类型"""
        self.node_type[node] = node_type
    
    def add_user_feature(self, user_id: str, features: Dict):
        """添加用户特征"""
        self.user_features[user_id] = features
    
    def compute_path_weight(self, path: List[str]) -> float:
        """计算路径权重（边权重乘积）"""
        weight = 1.0
        for i in range(len(path) - 1):
            src, dst = path[i], path[i+1]
            edge_weight = 0.0
            for neighbor, w, _ in self.graph[src]:
                if neighbor == dst:
                    edge_weight = w
                    break
            weight *= edge_weight
        return weight
    
    def expand_audience(self, seed_users: Set[str], max_hops: int = 3, 
                       min_weight: float = 0.5, expansion_limit: int = 50000) -> Dict:
        """
        BFS 图扩展算法
        
        Args:
            seed_users: 种子受众集合
            max_hops: 最大跳数
            min_weight: 最小路径权重阈值
            expansion_limit: 扩展上限
        
        Returns:
            {
                'expanded_users': 扩展后的用户集合,
                'expansion_factor': 扩展因子,
                'tier_breakdown': 按跳数分层的用户数,
                'confidence_scores': 用户置信度字典
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：种子人群定义（如过去 180 天购买某商品的用户）、用户购买与浏览行为日志、商品与品类关系数据；卡页口径要求用户购买历史完整度高于 90%、产品关系库准确度高于 85%。

**输出**：多跳扩展后的受众规模与高置信度子集、每条扩展路径的关系解释，以及可落地的投放或供应侧应用建议；卡页口径受众扩展 118%、ROAS 从 2.1 提升到 3.4。

## 执行步骤

1. 圈定种子人群并导出其购买、浏览与评价行为。
2. 构建用户、商品、品类、供应商等实体与关系边。
3. 做多跳路径推理，计算扩展路径权重与置信度。
4. 按阈值过滤扩展人群，输出规模与关系解释。
5. 把扩展人群接入投放或供应侧应用并跟踪效果。

## 边界与不做

- 种子人群过窄、或拿不到用户级行为与商品关系数据时不要用，扩展结果会失真。
- 能力边界：本技能产出扩展人群与路径解释，不执行投放、不承担 ROAS 结果；卡页的 ROAS 与扩展比例来自特定案例，换品类需重测。
- 合规红线：用户级行为数据须脱敏聚合，图谱不得纳入敏感属性，扩展人群投放须遵守广告平台定向政策。

## 技能关联

- **前置**：Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-User-Behavior-Segmentation-RFM
- **延伸**：Skill-GNN-Graph-Neural-Network-Foundations、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval
- **可组合**：Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Audience-Knowledge-Graph

---

> 分类：业务运营/品牌与增长/分群　·　技术族：08-知识图谱　·　源卡：`Skill-Audience-Knowledge-Graph`