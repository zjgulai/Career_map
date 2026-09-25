---
name: "p2s-cross-sell-llm-gnn"
title: "交叉销售LLM+GNN — 三阶段粗到精检索框架"
description: "触发词：交叉销售、关联购买、意图召回、图模型精排、连带率。何时不用：要按商品知识图谱做跨品类推荐用「知识图谱增强推荐 CoLaKG」；要压制列表同质化用「多样性重排 SMMR」。安全边界：不得使用操纵评论或歧视性定价手段；LLM 提炼的意图只作召回输入，不得生成夸大或未经验证的功效表述；受广告限制品类须遵守当地儿童食品广告规则。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 组合设计"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Cross-Sell-LLM-GNN"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "买完奶粉就推辅食工具：先用大模型读懂用户处在哪个育儿阶段，再用图模型挑真正会被一起买的商品。"
user_try: "试试：对刚买 4 段奶粉的用户做交叉销售，先用 LLM 提炼意图，再召回辅食候选并精排。"
whenToUse: "当用户已购某品、要推连带商品（组合购买、配件渗透）时用本技能；推荐依据是商品知识图谱三元组时用「知识图谱增强推荐 CoLaKG」；要压制同类重复曝光用「多样性重排 SMMR」。"
workflow: "从购买记录用 LLM 提炼用户当前需求意图 → 按意图向量召回候选品类 Top-50 → 用 LightGCN 结合相似用户行为精排 → 输出组合推荐并设置购买间隔阈值（如 7 天以上） → 用连带率与 LTV 变化评估效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 交叉销售LLM+GNN — 三阶段粗到精检索框架

## ① 解决的问题

运营面临关联推荐准确率低——LLM+GNN双模融合将关联购买率从8%提升至19%，年化增收65万元

## ② 核心算法逻辑

核心思想：传统协同过滤只看"买了什么"，无法理解"为什么买"。CORONA 将搜索引擎的多阶段检索架构（粗排 + 精排）迁移到推荐系统，先用 LLM 理解用户购买意图，再用图神经网络做精准精排，实现 recall@40 提升 18.6%。

## ③ 业务应用场景

- 业务问题：用户购买了 4 段奶粉（12-36个月），此时婴儿处于辅食关键期，但平台推荐仍在推荐奶粉相关产品，交叉销售转化率仅 4.2%。 - 意图提炼示例：LLM 从购买记录提炼 → "正在从全奶粉向混合喂养过渡的家长，需要辅食工具（研磨碗/料理棒）和营养补充品（铁剂/DHA）" - 系统做法：意图向量召回辅食品类 Top-50 候选 → LightGCN 基于相似用户行为精排 → 推荐辅食研磨套装 + 婴儿营养米粉。 - 量化产出：交叉销售转化率 4.2% → 11.8%，连带率（客单件数）+0.8 件，LTV 提升约 12%。
三轨验证： - 成本：LLM API 调用约 $0.003/次（DeepSeek），图模型训练需 GPU 约 $50/月（AWS g4dn.xlarge），数据管道维护约 0.5 人天/周。 - 合规：符合 Amazon 推荐政策（无操纵评论/无歧视性定价），GDPR 下需用户同意行为数据用于个性化推荐（可归入"合法利益"条款）。 - 风险：过度推荐辅食可能引发用户反感（"奶粉还没喝完就推辅食"），建议设置购买间隔阈值（≥7天）；若推荐含糖辅食可能触碰欧盟儿童食品广告红线。
- 业务问题：推车（高客单价 $300+）购买后，配件（雨罩/遮阳篷/置物架）和延保服务的渗透率不足 8%。 - 意图提炼示例：LLM 分析 → "刚购买轻便折叠推车的城市用户，有公共交通出行需求，注重便携性" - 系统做法：按意图召回便携配件候选 → GNN 精排（购买同款推车的用户还买了什么） → 推荐轻量化雨罩 + 肩背转化包。 - 量化产出：配件渗透率 8% → 21%，推车品类整体 AOV 提升 $48。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

4.2%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（257 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
交叉销售 LLM+GNN 三阶段框架 — CORONA 简化实现
依赖: pip install numpy
（生产环境额外需要: torch, torch-geometric, openai/deepseek SDK）
"""
import numpy as np
from typing import List, Dict, Tuple


# ── 1. 模拟数据集 ─────────────────────────────────────────────────────────────
USERS = {
    "u1": {"history": ["奶粉4段", "婴儿床", "尿布"], "age_stage": "12-24m"},
    "u2": {"history": ["推车", "婴儿背带"], "age_stage": "6-12m"},
    "u3": {"history": ["奶瓶", "奶粉2段", "消毒锅"], "age_stage": "3-6m"},
    "u4": {"history": ["辅食机", "奶粉4段", "餐椅"], "age_stage": "12-24m"},
    "u5": {"history": ["推车", "雨罩", "遮阳篷"], "age_stage": "6-12m"},
}

ITEMS = {
    "辅食研磨套装": {"category": "辅食工具", "tags": ["辅食", "研磨", "12m+"]},
    "婴儿营养米粉": {"category": "辅食食品", "tags": ["辅食", "营养", "6m+"]},
    "DHA鱼油滴剂": {"category": "营养补充", "tags": ["营养", "DHA", "辅食期"]},
    "推车雨罩": {"category": "推车配件", "tags": ["推车", "防雨", "便携"]},
    "推车遮阳篷": {"category": "推车配件", "tags": ["推车", "遮阳", "户外"]},
    "推车置物袋": {"category": "推车配件", "tags": ["推车", "收纳", "便携"]},
    "奶粉4段": {"category": "奶粉", "tags": ["奶粉", "12m+", "成长"]},
    "延保服务": {"category": "服务", "tags": ["推车", "延保", "售后"]},
}

# 用户-商品交互矩阵（1=购买过）
INTERACTION_MATRIX = np.array([
    # u1  u2  u3  u4  u5   →商品
    [0,   0,  0,  1,  0],   # 辅食研磨套装
    [0,   0,  0,  1,  0],   # 婴儿营养米粉
    [0,   0,  0,  0,  0],   # DHA鱼油滴剂
    [0,   0,  0,  0,  1],   # 推车雨罩
    [0,   0,  0,  0,  1],   # 推车遮阳篷
    [0,   0,  0,  0,  0],   # 推车置物袋
    [1,   0,  0,  1,  0],   # 奶粉4段
    [0,   0,  0,  0,  0],   # 延保服务
], dtype=float)

ITEM_NAMES = list(ITEMS.keys())
USER_NAMES = list(USERS.keys())


# ── 2. LightGCN 简化实现（纯 numpy）─────────────────────────────────────────
class LightGCN:
    """
    LightGCN 简化版（移除非线性变换，只保留图卷积聚合）
    生产环境使用 torch_geometric 的 LightConv
    """
    def __init__(self, n_users: int, n_items: int, embed_dim: int = 16, n_layers: int = 2):
        self.n_users = n_users
        self.n_items = n_items
        np.random.seed(42)
        self.user_emb = np.random.randn(n_users, embed_dim) * 0.1
        self.item_emb = np.random.randn(n_items, embed_dim) * 0.1
        self.n_layers = n_layers
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2506.17281 — CORONA: A Coarse-to-Fine Framework for Graph-based Recommendation with Large Language Models

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户购买记录与行为序列、商品文本属性（用于意图向量化）、用户与商品交互图（用于图模型训练）；粒度为单用户 × 已购商品。

**输出**：意图描述与粗到精的交叉销售候选清单（召回 Top-50 后精排的推荐结果）；供推荐与运营在购物车、详情页做连带推荐。

## 执行步骤

1. 从购买记录用 LLM 提炼用户所处阶段与需求意图
2. 按意图向量召回目标品类 Top-50 候选
3. 用 LightGCN 基于相似用户行为精排
4. 输出连带推荐并设置购买间隔阈值避免过度推荐
5. 用连带率、客单价与 LTV 变化评估效果

## 边界与不做

- 数据不满足：只有商品 ID、没有可读文本属性时提炼不出意图，先补齐商品描述与类目信息。
- 何时不用：要按商品知识图谱做跨品类推荐用「知识图谱增强推荐 CoLaKG」；要压制重复曝光用「多样性重排 SMMR」。
- 能力边界：只输出意图与候选排序，不承担线上推荐服务改造，也不保证卡页口径的转化提升。
- 安全边界：不得用操纵评论或歧视性定价；LLM 意图仅作召回输入，不得生成夸大或未经验证的功效表述。

## 技能关联

- **前置**：Skill-Collaborative-Filtering-Matrix-Factorization、Skill-GNN-Heterogeneous-Graph
- **延伸**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Push-Notification-Decision-Transformer.html、Skill-Push-Notification-Decision-Transformer
- **可组合**：Skill-LTV-Customer-Lifetime-Value、Skill-Cross-Sell-LLM-GNN

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：06-增长模型　·　源卡：`Skill-Cross-Sell-LLM-GNN`