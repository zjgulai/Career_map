---
name: "p2s-knowledge-graph-rec"
title: "Knowledge Graph Enhanced Recommendation — 知识图谱增强推荐"
description: "触发词：知识图谱推荐、KG 路径推理、关联购买率、互补品推荐、成分图谱、认证推荐理由。何时不用：常规替代品与搭售推荐用「Skill-Bundle-Recommendation-Complementary」；需要无偏因果推荐用「Skill-Causal-Deconfounded-Recommendation」；只做推荐归因解释用「Skill-Explainable-Recommendation」；按心理账户挑捆绑对象用「心理账户捆绑定价心理学」。安全边界：成分与认证数据只能来自官方 Listing，不得捏造；推荐理由须有图谱路径与数据支撑，避免虚假广告；知识图谱质量是效果瓶颈，需建立 KG 质量监控。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 商品诊断"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-Knowledge-Graph-Rec"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "把商品的成分、品牌、认证、适用月龄关系建成知识图谱，用路径推理找出真正的互补品，并给出每个推荐的理由路径。"
user_try: "试试：用我 Amazon 奶粉店铺的商品成分与认证数据建一张知识图谱，为买过有机奶粉的顾客推荐互补的辅食与营养品，并给出每条推荐的理由路径。"
whenToUse: "商品之间的关联靠成分、认证、月龄等深层语义而非同价位替代时用本技能（属「组合设计／商品诊断」）；只算常规替代品与搭售用「Skill-Bundle-Recommendation-Complementary」；要消除推荐偏置做因果评估用「Skill-Causal-Deconfounded-Recommendation」；要解释推荐归因用「Skill-Explainable-Recommendation」；要按同一心理账户筛捆绑对象用「心理账户捆绑定价心理学」；要挖时空隐性连带路径用「拓扑数据分析 (TDA) 挖掘时空隐性关联销售路径」。前置需先备好商品属性/成分数据与三元组。"
workflow: "从官方 Listing 抽取商品成分与属性，整理出品牌-成分-认证三元组，构建母婴产品知识图谱（约 500 个 SKU，1-2 人周） → 用 add_triple 写入三元组并自动补反向边，形成双向图，并预计算路径索引支撑在线推理 → 以用户历史商品为锚点，用 get_paths 做 BFS 搜索到候选商品的路径，限制 max_hops 并排除环路 → 用 path_score 按关系权重累乘并对长路径惩罚，为每个候选商品取最高分路径 → 输出商品-得分-最优路径，翻译成可解释推荐理由用于推荐位与商品诊断"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Knowledge Graph Enhanced Recommendation — 知识图谱增强推荐

## ① 解决的问题

运营面临"奶粉推荐只推替代品、关联购买率仅8%"——成分-认证知识图谱路径推理将关联购买率提升至18%、欧洲市场转化率提升1.9%，年化GMV增量约200-300万元

## ② 核心算法逻辑

知识图谱增强推荐（KGRec）将商品属性、品牌、成分、适用月龄等结构化关系组织为图谱，通过路径推理挖掘商品间的深层语义连接，解决纯协同过滤无法处理的"为什么推荐"问题。

## ③ 业务应用场景

场景1：Amazon 奶粉成分图谱驱动推荐 - 业务问题：用户购买"有机奶粉（DHA添加）"后，协同过滤推荐的是同价位奶粉（替代品），而非 DHA 相关辅食/营养品（互补品）；关联购买率 8% - 数据要求：商品成分/属性数据库（爬取 Amazon 商品详情）、品牌-成分-认证三元组（约 500 个 SKU，1-2 人周构建） - 预期产出：关联购买率从 8% 提升至 18%，推荐多样性（Intra-List Diversity）提升 40% - 业务价值：关联购买每提升 1%，月均增量 GMV 约 5 万元，年化 60 万元
场景2：合规认证路径解释推荐（欧洲市场） - 业务问题：德国/英国用户对产品认证（BIO/USDA Organic）极度重视，普通推荐无法展示认证逻辑，页面转化 3.2% - 数据要求：EU/UK 认证标签库、商品-认证关系（可从产品详情提取） - 预期产出：展示推荐理由"因为该商品与您购买的 XX 同获 EU BIO 认证"后，商品详情页转化率从 3.2% 提升至 5.1% - 业务价值：欧洲市场客单价高（$50-80），转化率提升 1.9% 对应年化增量约 150 万元
**三轨验证**： - 成本：KG 构建一次性成本 2-3 人周；在线推理需预计算路径索引，存储约 500MB - 合规：成分数据需来自官方 Listing，不得捏造；推荐理由需有数据支撑（避免虚假广告） - 风险：KG 质量是瓶颈，数据错误会导致错误推理；需建立 KG 质量监控

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：关联购买率提升 10-15%，推荐可解释性使欧洲/北美高客单价市场转化率提升 1.5-2%；年化综合 GMV 增量 200-300 万元
实施难度：⭐⭐⭐⭐☆（KG 构建是主要成本；推理算法本身不复杂）
优先级：⭐⭐⭐⭐☆
评估依据：知识图谱在母婴品类的价值远超其他品类——成分/认证/月龄三维度是用户决策核心，且竞争对手难以快速复制品牌专属 KG

## ⑦ 代码节选

本节的完整实现（111 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.10699，但该号在 arXiv 上是《Some Properties of normal subgroups determined from character tables》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需商品成分/属性数据库（可从 Amazon 商品详情抽取）与品牌-成分-认证三元组，卡页参照规模约 500 个 SKU，一次性构建 1-2 人周；图谱以 (head, relation, tail) 三元组录入；推荐调用需用户历史商品序列 user_history、候选商品列表 candidate_items、关系权重字典 relation_weights，路径搜索上限 max_hops（默认 3，卡页推荐实际用 2 跳），top_n 默认 5。欧洲认证场景另需 EU/UK 认证标签库与商品-认证关系（可从产品详情提取）。在线推理需预计算路径索引，存储约 500MB。

**输出**：产出候选商品、路径得分与最优知识图谱路径（返回 商品／得分／最优路径 三元的 top_n 列表），供运营把路径翻译成可解释推荐理由（如「因为该商品与您购买的 XX 同获 EU BIO 认证」）用于商品详情页与推荐位；同时输出更具多样性的候选集合，支撑商品诊断与组合设计。

## 执行步骤

1. 汇集商品成分/属性数据与品牌-成分-认证三元组，覆盖约 500 个 SKU，构建母婴产品知识图谱
2. 用 add_triple 把每条三元组写入邻接表并自动补反向边，形成双向图
3. 用 get_paths 对每个「用户历史商品 → 候选商品」组合做 BFS 路径搜索，限制 max_hops 跳并跳过路径中已有节点避免环路
4. 用 path_score 按关系权重累乘并除以路径长度平方根施加长路径惩罚，得到每条路径得分
5. 用 kg_enhanced_recommend 跳过已在用户历史中的商品，为每个候选取最高分路径并排序
6. 取 top_n 结果，把最优路径翻译成可解释推荐理由，输出给推荐位与商品诊断使用

## 边界与不做

- 数据不满足：没有商品成分/属性库或品牌-成分-认证三元组（或 SKU 覆盖远低于约 500 个、关系稀疏）时不要使用，先补齐从官方 Listing 抽取的实体与关系；用户历史行为为空时无法确定锚点，需先接入订单/浏览序列。
- 何时不用：常规替代品与互补搭售推荐用「Skill-Bundle-Recommendation-Complementary」；需要消除偏置的因果推荐用「Skill-Causal-Deconfounded-Recommendation」；只做推荐归因解释用「Skill-Explainable-Recommendation」；按心理账户筛选捆绑对象用「心理账户捆绑定价心理学」。
- 能力边界：本技能只做知识图谱构建、路径搜索与可解释推荐排序，不做线上埋点、A/B 实验执行与商品页面改动；预计算路径索引与约 500MB 存储需由模型外的工程侧落地，推荐理由仍须人工复核后再上线。
- 安全边界：卡页三轨验证要求成分数据必须来自官方 Listing、不得捏造，推荐理由需有数据支撑以避免虚假广告；知识图谱数据错误会导致错误推理，上线前须建立 KG 质量监控与抽检机制。

## 技能关联

- **前置**：Skill-Bundle-Recommendation-Complementary.html、Skill-Bundle-Recommendation-Complementary、Skill-Causal-Deconfounded-Recommendation.html、Skill-Causal-Deconfounded-Recommendation、Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Cross-Platform-Transfer-Rec.html、Skill-Cross-Platform-Transfer-Rec、Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Bundle-Recommendation-Complementary.html、Skill-Bundle-Recommendation-Complementary、Skill-Causal-Deconfounded-Recommendation.html、Skill-Causal-Deconfounded-Recommendation、Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Cross-Platform-Transfer-Rec.html、Skill-Cross-Platform-Transfer-Rec、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Bundle-Recommendation-Complementary.html、Skill-Bundle-Recommendation-Complementary、Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Cross-Platform-Transfer-Rec.html、Skill-Cross-Platform-Transfer-Rec、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Knowledge-Graph-Rec

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：05-推荐系统　·　源卡：`Skill-Knowledge-Graph-Rec`