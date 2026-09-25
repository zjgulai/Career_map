---
name: "p2s-semantic-chunking-strategy"
title: "语义分块策略 — RAG 管道的基础层"
description: "触发词：语义分块、RAG 分块、详情页切分、话题边界检测、检索片段切块。何时不用：知识已入库、要评检索命中与回答质量时走数据质量侧的 RAG 质量评测；要判断知识是否过期走知识时效类技能。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Semantic-Chunking-Strategy"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "把商品详情页按话题切成完整片段，别让安全认证信息被切碎，让知识库答得更准。"
user_try: "试试：用语义分块重切这批 Amazon 详情页，让安全认证类问答不再漏掉关键段落。"
whenToUse: "素材要进 RAG 知识库、片段切得对不对直接决定检索命中时用；知识已经入库、要评检索命中率与回答质量时，改用 RAG 质量评测。"
workflow: "识别详情页话题段落边界（产品特性/使用说明/注意事项/规格参数） → 把语义边界阈值设为 90 百分位，切出单一话题 chunk → 同一批详情页跑固定分块与语义分块两组对照 → 比对安全认证类与规格参数类问答准确率后定策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 语义分块策略 — RAG 管道的基础层

## ① 解决的问题

母婴出海电商的 Amazon Listing 商品详情页通常包含多个话题段落：产品特性（Safety Features）、使用说明（How to Use）、注意事项（Warnings）、规格参数（Specifications）

## ② 核心算法逻辑

文档分块（Chunking）是 RAG（检索增强生成）管道中影响效果最大的单一因子。研究表明，分块策略的选择可以导致检索精度 ±30% 的差异（arXiv:2401.00368, 2024）。

## ③ 业务应用场景

业务问题： 母婴出海电商的 Amazon Listing 商品详情页通常包含多个话题段落：产品特性（Safety Features）、使用说明（How to Use）、注意事项（Warnings）、规格参数（Specifications）。用固定 token 切割会把"产品特性"段落截断，导致 RAG 系统回答"这款吸奶器安全吗"时遗漏关键安全认证信息。
解决方案： 对商品详情页使用语义边界检测分块，$\tau$ 设置为 90 百分位数，确保每个 chunk 聚焦单一话题。
量化效果： - 安全认证类问答准确率：固定分块 62% → 语义分块 89%，提升 27% - 规格参数类问答：68% → 91%，提升 23% - 客服自动回复准确率整体提升 ~25% - 年化节省人工客服成本约 ¥18 万（基于月均 5000 客服工单、节省 60% 工单量）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

18 万

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（518 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.06648，但该号在 arXiv 上是《Dense X Retrieval: What Retrieval Granularity Should We Use?》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：商品详情页原文（含产品特性、使用说明、注意事项、规格参数等多话题段落），以 ASIN/页面为粒度

**输出**：按话题边界切好的 chunk 集合与分块参数（语义边界阈值取 90 百分位），供 RAG 检索与客服问答使用

## 执行步骤

1. 识别详情页中的话题段落边界（产品特性、使用说明、注意事项、规格参数）。
2. 把语义边界阈值设为 90 百分位数，按边界切出单一话题 chunk。
3. 用同一批详情页跑固定 token 分块与语义分块两组对照。
4. 比对安全认证类与规格参数类问答准确率差异，选定分块策略。

## 边界与不做

- 何时不用：素材尚未进入 RAG 管道，或问题出在检索排序与答案生成阶段时，本技能不解决，应转 RAG 质量评测。
- 能力边界：只产出分块策略与 chunk 产物，不负责向量化、索引构建与检索服务部署。
- 能力边界：卡页给出的提升幅度（安全认证类 62% 到 89%、规格参数类 68% 到 91%）来自该卡原文场景，换语料需重新对照验证，不能直接套用。

## 技能关联

- **前置**：Skill-Document-Intelligence-Parsing.html、Skill-Document-Intelligence-Parsing、Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals
- **延伸**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-RAPTOR-Hierarchical-RAG.html、Skill-RAPTOR-Hierarchical-RAG
- **可组合**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Hybrid-Search-BM25-Vector.html、Skill-Hybrid-Search-BM25-Vector、Skill-Semantic-Chunking-Strategy

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：08-知识图谱　·　源卡：`Skill-Semantic-Chunking-Strategy`