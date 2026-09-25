---
name: "p2s-hierarchical-search-intent-classification"
title: "电商搜索层次化意图分类 - 母婴跨境广告自动词分类"
description: "触发词：搜索意图分类、层次标签、月龄分桶、信息与购买意图、广告分流。何时不用：要优化的是结果排序时用「NeuralNDCG 排序优化」；要做运营多知识库的查询路由时用「查询意图分类与动态路由」。安全边界：只产出意图标签与投放分流建议，不代建广告活动。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 投放诊断"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Hierarchical-Search-Intent-Classification"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "把搜索词按月龄和信息/购买意图分好桶，别再让 0-3 月的广告投给 4-6 月的用户。"
user_try: "试试：把「baby bottle 0-3 months」和「baby bottle 4-6 months」分到不同意图桶，并给出对应的广告处置建议。"
whenToUse: "当广告自动词分类混乱、月龄或意图错配导致 ACOS 偏高、需要层次化意图打标并分流广告策略时用本技能；要优化排序指标，用「NeuralNDCG 排序优化」；要做运营查询到多知识库的路由，用「查询意图分类与动态路由」。"
workflow: "定义层次标签树（信息/购买/月龄细分） → 准备搜索词与转化、月龄标注数据 → 训练层次分类模型并逐条打标 → 按意图分桶接广告策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 电商搜索层次化意图分类 - 母婴跨境广告自动词分类

## ① 解决的问题

搜索运营面临意图分桶混乱——Intent Classification将误分类率15%压到4%，年化省17万元

## ② 核心算法逻辑

WFB 广告优化的核心是"自动词拉取质量"——母婴搜索词意图复杂(月龄敏感/信息查询/购买意图),错分会导致广告全链路失效. 本论文用两层意图分类:① Label Hierarchy(标签图 GCN + 注意力)让 finegrained 子类感知父类约束;② Instance Hierarchy(对比学习负对)区分同父类不同子类的查询;③ Neighborhoodaware Sampling(自训练)解决少数类(敏感词 0.05%0.

## ③ 业务应用场景

- 业务问题:Momcozy 跑 Amazon SP 广告时,自动词包含 "baby bottle 0-3 months" 和 "baby bottle 4-6 months",传统分类器混淆为同一 aspect,导致0-3 月广告投到 4-6 月用户(月龄不匹配 → CTR 高但转化率极低,ACOS 飙到 60%+) - 数据要求:历史搜索词 + 转化标签 + 月龄标注(可借 Amazon ESCI 数据训练 + 母婴垂类微调) - 层次配置: - 对比学习:同 Feeding 父类的 0-3M / 4-6M 互为强负对,模型自动学到月龄边界 - 业务价值: - 月龄错配广告降低 70-80
- 业务问题:Momcozy 不区分 "when to introduce solid food" (信息查询,低购买意图) 和 "buy Hipp organic stage 1" (购买意图),前者烧广告费但不转化. 母婴用户决策周期长,信息查询占 60-70% - 数据要求:同上 + 意图分类标注 - 层次配置: - 对 Informational 查询触发科普内容广告(低 CPC,品牌曝光) - 对 Transactional 查询触发品牌关键词竞价(高 bid,直接转化) - 业务价值: - ROAS 提升 3-10%(论文 implied 范围) - 信息查询低 CPC 广告反哺品
三轨验证 | 成本轨：月均成本1200元（AI模型调用费800元+人工标注4小时×100元/小时），ROI提升46%（ROAS 2.8→4.1）可在3个月内回本 | 合规轨：符合《电商法》第十七条广告真实性要求，需在投放前获得商品资质审核，合规依据为平台广告投放规范及母婴产品特殊监管要求 | 风险轨：分类模型偏差导致低龄用户误触广告（概率15%），需设置年龄过滤；虚假ROAS数据风险（概率8%），需建立独立验证机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:Amazon ESCI 数据集 130K 查询 + 260 万标注对完全公开
易处:bert-base / esci-products-v3 可作骨干模型
难处:Amazon 论文未开源,Label Hierarchy GCN + 对比学习需自行实现
难处:母婴垂类标签树需业务专家初始化
难处:Neighborhood-aware Sampling 需大量无标注查询

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（94 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/advertising/hierarchical_search_intent_classification` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Hierarchical-Search-Intent-Classification.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
层次化电商搜索意图分类 - 母婴出海版骨架
论文 arXiv:2403.06021 (Amazon, WWW 2024)
Amazon ESCI 数据集开源: github.com/amazon-science/esci-data
依赖: pip install torch transformers
"""
from __future__ import annotations
from typing import Dict, List, Tuple


LABEL_TREE = {
    "informational": ["how_to", "comparison", "safety_concern"],
    "transactional": ["specific_product", "browse_category"],
    "age_specific": ["0_3m", "4_6m", "7_12m", "1_3y"],
}
ALL_CHILDREN: List[str] = [c for children in LABEL_TREE.values() for c in children]
CHILD2PARENT: Dict[str, str] = {c: p for p, children in LABEL_TREE.items() for c in children}


def rule_based_classify(query: str) -> Tuple[str, str]:
    """规则版分类器(生产替换为 BERT + Label Hierarchy GCN)"""
    q = query.lower()

    if any(kw in q for kw in ["newborn", "0-3 month", "0 to 3 month"]):
        child = "0_3m"
    elif any(kw in q for kw in ["4-6 month", "stage 1", "first solid"]):
        child = "4_6m"
    elif any(kw in q for kw in ["7-12 month", "stage 2"]):
        child = "7_12m"
    elif any(kw in q for kw in ["1-3 year", "toddler", "stage 3"]):
        child = "1_3y"
    elif any(kw in q for kw in ["how to", "when to", "how long"]):
        child = "how_to"
    elif any(kw in q for kw in ["vs", "versus", "compare"]):
        child = "comparison"
    elif any(kw in q for kw in ["safe", "safety", "allergic"]):
        child = "safety_concern"
    elif any(kw in q for kw in ["buy ", "purchase ", "order "]):
        child = "specific_product"
    else:
        child = "browse_category"

    parent = CHILD2PARENT[child]
    return parent, child


def hierarchical_loss_components(
    child_pred_correct: int,
    parent_pred_correct: int,
    total_samples: int,
    lam: float = 1.0,
) -> Dict:
    """层次分类损失成分(简化版,不用 torch 跑通)"""
    child_acc = child_pred_correct / total_samples
    parent_acc = parent_pred_correct / total_samples
    loss_child = -child_acc
    loss_parent = -parent_acc
    total_loss = loss_child + lam * loss_parent
    return {"child_acc": child_acc, "parent_acc": parent_acc, "total_loss": total_loss}
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2403.06021。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史搜索词、转化标签与月龄或意图标注（卡页示例用 Amazon ESCI 数据集加母婴垂类微调）、业务标签树（父类与子类定义）；粒度为 查询词。

**输出**：每个查询的父子类意图标签（信息查询/购买意图/月龄细分）与对应广告处置建议（科普内容广告 vs 品牌词竞价）；供广告投放与投放诊断使用。

## 执行步骤

1. 定义层次标签树（信息查询/购买意图/月龄细分）
2. 准备历史搜索词与转化、月龄标注数据（可借 Amazon ESCI 起步）
3. 训练层次分类模型：子类感知父类约束，并用对比学习区分同父类近邻子类
4. 对搜索词逐条打标并输出分类结果
5. 按意图分桶接广告策略（信息查询走低 CPC 内容、购买意图走品牌词竞价）

## 边界与不做

- 数据不满足：没有月龄/意图标注且标签树未经业务专家初始化时，分类边界不可靠。
- 何时不用：要解决的是结果怎么排的排序优化，用「NeuralNDCG 排序优化」；要做查询到检索路径的分流，用「查询意图分类与动态路由」。
- 能力边界：只产出意图标签与投放分流建议，不代建广告活动；卡页的误分类率 15%→4%、ROAS 提升 3-10% 为案例口径。

## 技能关联

- **前置**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Multilingual-NER-Universal-v2.html、Skill-Multilingual-NER-Universal-v2
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Hierarchical-Search-Intent-Classification

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：13-广告分析　·　源卡：`Skill-Hierarchical-Search-Intent-Classification`