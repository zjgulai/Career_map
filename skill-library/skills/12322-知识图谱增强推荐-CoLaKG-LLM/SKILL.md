---
name: "p2s-kg-augmented-recommendation-colakg"
title: "知识图谱增强推荐 - CoLaKG (LLM × KG)"
description: "触发词：知识图谱推荐、属性三元组、LLM 语义化、跨品类推荐、冷启动新品。何时不用：要用 LLM 提炼意图再加图模型精排做交叉销售用「交叉销售 LLM+GNN」；要图文多模态融合用「多模态产品推荐」。安全边界：图谱中品牌、成分、认证信息必须真实可溯源，未授权不得标注有机、非转基因等声明；LLM 生成语义不得包含主观评价表述。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 组合设计"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-KG-Augmented-Recommendation-CoLaKG"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把奶粉的品牌、成分、段位、认证连成图谱，再用大模型把这些属性讲成人话，新品没销量也能被推荐。"
user_try: "试试：给这款新上架的德国奶粉建属性子图并生成语义描述，再按语义相似度找相似用户推荐。"
whenToUse: "当商品维度多（品牌、成分、段位、认证、适用月龄）而传统协同过滤读不懂这些属性、新品又无购买历史时用本技能；要做意图召回加图精排的交叉销售用「交叉销售 LLM+GNN」；要图文多模态融合用「多模态产品推荐」。"
workflow: "构建商品属性图谱：品牌、成分、认证、适用月龄三元组 → 为每款商品抽取 1-2 跳局部子图 → 用 LLM 把子图语义化为可读商品描述 → 聚合语义嵌入输出召回与跨品类推荐 → 校验图谱数据真实性后上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 知识图谱增强推荐 - CoLaKG (LLM × KG)

## ① 解决的问题

海外华人妈妈购买奶粉需综合考量品牌(HiPP/Aptamil)、成分(DHA/HMO 益生元)、段位(1段/2段)、认证(EU 有机/Non-GMO),传统 CF 无法解读这些维度

## ② 核心算法逻辑

传统 KG 推荐(KGAT/KGIN)把 KG 结构硬编码为 embedding,缺失语义理解。CoLaKG 用 LLM 读懂 KG:对每个 item 提取局部子图 → LLM 生成语义文本理解 → 文本 embedding → 通过余弦相似度构建全局 itemitem 语义图 → 与 CF 协同 embedding 门控融合。推断期不调用 LLM(离线预计算),工程友好。

## ③ 业务应用场景

- 业务问题:海外华人妈妈购买奶粉需综合考量品牌(HiPP/Aptamil)、成分(DHA/HMO 益生元)、段位(1段/2段)、认证(EU 有机/Non-GMO),传统 CF 无法解读这些维度。新品奶粉(无购买历史)冷启动困难 - 数据要求:商品属性 KG(品牌-成分-认证三元组) + 用户购买历史 - CoLaKG 配置: - 节点:奶粉 SKU + 属性节点(品牌/成分/认证) - 局部子图:每款奶粉的 1-2 跳邻居(同品牌/同成分/同认证) - LLM 语义化:"这是一款适合 0-6 月新生儿、含有机 HMO 益生元、持 EU 有机认证的德国奶粉" - 业务价值:新品奶粉冷启动 Re
三轨验证： - 成本：LLM 推理一次性成本 5-10 万元（GPT-4o/Qwen2.5 调用）；KG 构建需 2-3 名工程师 2 周；数据采集（商品属性、认证信息）需对接 ERP 或爬虫，月均维护成本 1-2 万元 - 合规：需确保 KG 中品牌/成分/认证信息真实可溯源，避免虚假宣传；Amazon 政策禁止未经授权的“有机”“Non-GMO”声明，需提供认证文件链接；GDPR 下用户购买历史需匿名化处理 - 风险：小品牌推荐可能引发大品牌价格战（如 HiPP 要求同等曝光）；若 KG 数据错误（如错标成分），可能导致用户投诉或平台下架；LLM 生成语义若包含主观评价（如“最好奶粉”），
- 业务问题:母婴用品有显著时序性消费(纸尿裤 NB→S→M→L,辅食工具 4M→1Y→3Y),传统推荐无法跨品类关联成长轨迹 - 数据要求:商品 KG(适用月龄边) + 用户购买序列 - CoLaKG 配置: - LLM 理解每个 item:"NB 纸尿裤适合体重<5kg 新生儿" - 全局语义图捕获不同品类同月龄的 item(NB 纸尿裤 ↔ 3M 安抚奶嘴 ↔ 防胀气奶瓶) - 跨品类 proactive 触达 - 业务价值:跨品类购买转化率提升 15-20%,冷启动新用户(1-2 次购买)效果显著;月均增量 GMV 80-150 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:官方 PyTorch 开源代码完整,有预计算 embedding 可直接复用
难处:LLM 语义化需要 GPT-4o/Qwen2.5 调用预算(一次性,~5-10 万)
难处:商品 KG 必须先构建,可配合 Hierarchical-Product-KG Skill

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（75 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/knowledge_graph/kg_augmented_recommendation_colakg` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-KG-Augmented-Recommendation-CoLaKG.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CoLaKG 最小骨架
论文 arXiv:2410.12229 (SIGIR 2025)
官方代码: https://github.com/ziqiangcui/CoLaKG-SIGIR25
"""
from __future__ import annotations
import torch
import torch.nn as nn
import torch.nn.functional as F


class KGSemanticAggregator(nn.Module):
    def __init__(self, embed_dim: int):
        super().__init__()
        self.attn = nn.Linear(embed_dim * 2, 1)

    def forward(self, x: torch.Tensor, edge_index: torch.Tensor, edge_weight: torch.Tensor) -> torch.Tensor:
        src, dst = edge_index[0], edge_index[1]
        h_src, h_dst = x[src], x[dst]
        alpha_raw = self.attn(torch.cat([h_dst, h_src], dim=-1)).squeeze(-1) * edge_weight

        alpha_exp = torch.exp(alpha_raw - alpha_raw.max())
        denom = torch.zeros(x.size(0), device=x.device).index_add(0, dst, alpha_exp) + 1e-10
        alpha = alpha_exp / denom[dst]

        messages = alpha.unsqueeze(-1) * h_src
        agg = torch.zeros_like(x).index_add(0, dst, messages)
        return agg


class CoLaKG(nn.Module):
    def __init__(self, n_users: int, n_items: int, embed_dim: int = 64, llm_embed_dim: int = 768):
        super().__init__()
        self.user_emb = nn.Embedding(n_users, embed_dim)
        self.item_emb = nn.Embedding(n_items, embed_dim)
        self.semantic_proj = nn.Linear(llm_embed_dim, embed_dim)
        self.kg_agg = KGSemanticAggregator(embed_dim)
        self.gate = nn.Sequential(nn.Linear(embed_dim * 2, embed_dim), nn.Sigmoid())

    def forward(
        self,
        users: torch.Tensor,
        items: torch.Tensor,
        item_item_edge_index: torch.Tensor,
        item_item_weight: torch.Tensor,
        llm_embeddings: torch.Tensor,
    ) -> torch.Tensor:
        s = self.semantic_proj(llm_embeddings)
        s_aug = self.kg_agg(s, item_item_edge_index, item_item_weight)

        e_v = self.item_emb.weight
        gate = self.gate(torch.cat([e_v, s_aug], dim=-1))
        item_repr = gate * e_v + (1 - gate) * s_aug

        u = self.user_emb(users)
        v = item_repr[items]
        return (u * v).sum(dim=-1)


def main() -> None:
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2410.12229 — Comprehending Knowledge Graphs with Large Language Models for Recommender Systems

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：商品属性知识图谱（品牌、成分、认证等三元组）与用户购买历史；卡页指出图谱需 2-3 名工程师约 2 周构建，商品属性需对接 ERP 或采集；粒度为单商品 × 属性边。

**输出**：商品的语义化描述与嵌入、局部子图聚合后的推荐结果，以及跨品类与冷启动场景的推荐清单；供推荐工程与运营使用。

## 执行步骤

1. 构建商品属性知识图谱，落品牌、成分、认证与适用月龄边
2. 为每款商品抽取 1-2 跳局部子图
3. 用 LLM 把子图语义化为可读商品描述
4. 聚合语义嵌入输出召回与跨品类推荐
5. 校验图谱数据真实性后再上线

## 边界与不做

- 数据不满足：没有商品属性数据、图谱建不起来时本技能不适用，先对接 ERP 或补齐属性采集。
- 何时不用：要做意图召回加图精排的交叉销售用「交叉销售 LLM+GNN」；要图文多模态融合用「多模态产品推荐」。
- 能力边界：只做属性侧语义增强，不替代协同过滤基线，也不保证卡页口径的转化提升。
- 安全边界：图谱中品牌、成分、认证必须真实可溯源，未授权不得标注有机、非转基因等声明；LLM 语义不得含主观评价表述。

## 技能关联

- **前置**：Skill-Knowledge-Graph-for-Skills-Management.html、Skill-Knowledge-Graph-for-Skills-Management、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction
- **可组合**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-KG-Augmented-Recommendation-CoLaKG

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Augmented-Recommendation-CoLaKG`