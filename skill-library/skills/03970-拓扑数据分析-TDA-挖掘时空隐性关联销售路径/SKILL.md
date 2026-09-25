---
name: "p2s-topological-data-analysis-cross-sell"
title: "拓扑数据分析 (TDA) 挖掘时空隐性关联销售路径"
description: "触发词：拓扑数据分析、TDA、交叉销售、连带购买率、隐性关联路径、会员活动。何时不用：常规跨商家推荐排序用「Skill-Federated-Cross-Seller-Recommendation」；实时流式推荐用「Skill-Real-Time-Streaming-Recommendation」；会话级序列推荐用「Skill-Session-Based-Recommendation-SR-GNN」；要按成分/认证解释推荐理由用「知识图谱增强推荐」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 会员活动"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-Topological-Data-Analysis-Cross-Sell"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "面向会员经理，用拓扑数据分析从时空维度挖出隐性的连带购买路径，给交叉销售找抓手，把连带购买率从 7% 往 13% 推。"
user_try: "试试：我有会员的购买记录，帮我用拓扑数据分析挖出时空维度上的隐性连带购买路径，找出能提升连带购买率的交叉销售抓手。"
whenToUse: "会员交叉销售缺抓手、要挖隐性关联购买路径时用本技能（属「组合设计／会员活动」）；常规跨商家推荐召回排序用「Skill-Federated-Cross-Seller-Recommendation」；要求实时流式推荐用「Skill-Real-Time-Streaming-Recommendation」；会话级序列建模用「Skill-Session-Based-Recommendation-SR-GNN」；要按成分/认证给出推荐理由用「知识图谱增强推荐」。本技能只做交叉销售抓手挖掘的方法定位，落地前请按原始代码模板 paper2skills-code/recommendation/topological_data_analysis_cross_sell 确认输入输出规格。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 拓扑数据分析 (TDA) 挖掘时空隐性关联销售路径

## ① 解决的问题

会员经理面临交叉销售没抓手——TDA将连带购买率7%提到13%，年化增18万元

## ② 核心算法逻辑

Skill Card: 拓扑数据分析 (TDA) 挖掘时空隐性关联销售路径

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

（卡页此段未附代码；源站声明有 0 个代码块并记录位置 `paper2skills-code/recommendation/topological_data_analysis_cross_sell`，但**该代码树不在本包内**，本包未附带。）

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1908.07544，但该号在 arXiv 上是《Preserving Command Line Workflow for a Package Management System using ASCII DAG Visualization》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：会员级交易与行为数据：覆盖谁在何时、通过哪个渠道买了什么的订单行记录，以及商品属性，用于支撑「时空」维度的关联挖掘；卡页给出的连带购买率基线为 7%。具体字段、时间粒度与样本量下限卡页未给出，落地前须按原始代码模板 paper2skills-code/recommendation/topological_data_analysis_cross_sell 确认后再使用。

**输出**：面向会员经理的交叉销售抓手：可落地的隐性关联购买路径与商品组合建议，目标把连带购买率从 7% 提升到 13%（对应年化增 18 万元，卡页口径）；具体产出字段与格式按原始代码模板 paper2skills-code/recommendation/topological_data_analysis_cross_sell 确认。

## 执行步骤

1. 从会员维度定位交叉销售的抓手缺口，确认连带购买率基线（卡页为 7%）
2. 用拓扑数据分析（TDA）从时空维度挖掘隐性的关联销售路径
3. 把挖出的关联路径转化为会员活动与交叉销售动作，并按连带购买率（目标 13%）跟踪效果
4. 按年化增 18 万元的业务价值口径复盘收益

## 边界与不做

- 数据不满足：拿不到会员级订单行与商品属性、无法还原谁在何时买了什么的关联记录时不要用本技能硬挖；卡页未给出字段与样本量下限，先按原始代码模板 paper2skills-code/recommendation/topological_data_analysis_cross_sell 确认输入，数据不到位不要出结论。
- 何时不用：常规推荐召回排序用「Skill-Federated-Cross-Seller-Recommendation」；实时流式推荐用「Skill-Real-Time-Streaming-Recommendation」；会话序列推荐用「Skill-Session-Based-Recommendation-SR-GNN」；要按成分/认证做可解释推荐用「知识图谱增强推荐」。
- 能力边界：只提供方法定位（用 TDA 从时空维度挖隐性关联路径）与目标口径（连带购买率 7%→13%、年化 18 万元），不给出算法步骤、阈值与更细的投入产出，也不得据此编造这些细节；真实分析执行由模型外的确定性控制层或人工完成。

## 技能关联

- **前置**：Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation、Skill-Sequential-User-Behavior-Modeling.html、Skill-Sequential-User-Behavior-Modeling、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN
- **延伸**：Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation、Skill-Sequential-User-Behavior-Modeling.html、Skill-Sequential-User-Behavior-Modeling、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN
- **可组合**：Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN、Skill-Topological-Data-Analysis-Cross-Sell

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：05-推荐系统　·　源卡：`Skill-Topological-Data-Analysis-Cross-Sell`