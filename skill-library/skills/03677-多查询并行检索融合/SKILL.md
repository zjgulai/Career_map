---
name: "p2s-rag-fusion-multi-query"
title: "RAG-Fusion — 多查询并行检索融合"
description: "触发词：多查询融合、并行召回、排名融合、信息完整性、多维权衡。何时不用：查询意图单一明确时单路检索更快；要跨语言改写查询时用假设文档方法。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-RAG-Fusion-Multi-Query"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "把一个提问扩成多个语义变体并行检索，再把各路结果融合排序，避免单一问法漏掉关键信息。"
user_try: "试试：帮我把暖奶器库存扩成 5 个查询变体并行检索，融合后给出补货建议。"
whenToUse: "属于「业务工具实现」：一个问题牵涉多个维度、单路检索容易漏关键信息时用；若查询意图单一明确，单路检索更快；若要跨语言改写查询，用假设文档方法。"
workflow: "用 LLM 生成原始查询的多个语义变体 → 对每个变体并行检索，得到多路候选结果 → 用排名融合算法把多路结果合并排序 → 检查融合后的 Top 结果是否覆盖各业务维度 → 组合出带依据的决策建议，交付业务方"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RAG-Fusion — 多查询并行检索融合

## ① 解决的问题

运营面临单一查询召回覆盖率低遗漏关键信息——RAG-Fusion多查询并行召回率+40%，决策信息完整性显著提升，年化避免信息缺失损失28万元

## ② 核心算法逻辑

核心思想：用LLM生成原始查询的多个语义变体，并行检索后通过RRF（Reciprocal Rank Fusion）融合排名，突破单一查询的语义盲点，实现召回覆盖率+40%。

## ③ 业务应用场景

业务问题：运营负责人需在48小时内制定暖奶器Q4备货计划，涉及库存补货时机、安全库存水位、FBA入库周期、竞品价格变动等多维信息。传统单一查询（如"暖奶器库存"）遗漏了"入库时间"与"竞品动态"的关联，导致备货决策不完整，平均延迟补货3-5天，缺货率12%。
数据要求： - 历史销售数据（SKU级、日粒度、过去12个月） - FBA物流时效表（发货地→亚马逊仓库的中位数时间） - 竞品价格监控数据（过去30天，至少3个竞品） - 库存补货阈值规则（当前安全库存系数） - 供应商交期数据（工厂→中国仓库的平均周期）
预期产出： - 生成查询变体5个： 1. 原始："暖奶器备货策略" 2. 变体1："婴幼儿温奶器库存补货时机" 3. 变体2："恒温奶瓶器安全库存计算方法" 4. 变体3："FBA入库周期与备货周期匹配" 5. 变体4："竞品暖奶器价格变动对备货的影响" - 并行检索5路，融合后Top-5结果包含：库存补货规则、FBA时效、竞品价格、安全库存公式、历史缺货案例 - 生成的决策建议包含：建议补货量（单位：台）、最晚下单时间、预期成本影响

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

8万元

## ⑦ 代码节选

（卡页此段是占位串，本卡未附代码实现。）

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史销售数据（卡页示例 SKU 级、日粒度、过去 12 个月）、FBA 物流时效表、竞品价格监控（示例过去 30 天至少 3 个竞品）、库存补货阈值规则与供应商交期数据。

**输出**：融合后的检索结果与决策建议：卡页示例生成 5 个查询变体，Top-5 结果覆盖库存补货规则、FBA 时效、竞品价格、安全库存公式与历史缺货案例，并给出建议补货量、最晚下单时间与成本影响。

## 执行步骤

1. 用 LLM 生成原始查询的多个语义变体
2. 对每个变体并行检索，得到多路候选结果
3. 用排名融合算法把多路结果合并排序
4. 检查融合后的 Top 结果是否覆盖各业务维度
5. 组合出带依据的决策建议，交付业务方

## 边界与不做

- 数据不满足时不用：底层知识库缺料（如没有物流时效与竞品数据）时，多路召回只会把同样的缺口重复放大。
- 能力边界：本卡产出检索融合与建议草案，不替代补货决策本身与供应商沟通。

## 技能关联

- **前置**：Skill-Dense-Passage-Retrieval.html、Skill-Dense-Passage-Retrieval、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-Modular-RAG-Architecture.html、Skill-Modular-RAG-Architecture、Skill-Query2Doc-Query-Expansion.html、Skill-Query2Doc-Query-Expansion、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAPTOR-Hierarchical-RAG.html、Skill-RAPTOR-Hierarchical-RAG
- **延伸**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-Modular-RAG-Architecture.html、Skill-Modular-RAG-Architecture、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAPTOR-Hierarchical-RAG.html、Skill-RAPTOR-Hierarchical-RAG
- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAG-Fusion-Multi-Query

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-RAG-Fusion-Multi-Query`