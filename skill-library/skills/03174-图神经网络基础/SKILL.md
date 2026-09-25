---
name: "p2s-gnn-foundations"
title: "GNN Foundations（图神经网络基础）"
description: "触发词：图神经网络、共购图、节点嵌入、组合推荐、关联发现。何时不用：只在表格上加工与筛选特征时用特征工程/特征选择；要处理多类型节点与边的图时用异构图模型。安全边界：供应商与用户数据采集需获得书面授权，嵌入结果不得对外披露个体用户信息。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 组合设计"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-GNN-Foundations"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用共购关系建图学习商品嵌入，发现没有直接共同购买记录、却属于同一客群的商品组合。"
user_try: "试试：用我们的订单共购关系建图跑 GNN，找出哪些商品适合做组合推荐。"
whenToUse: "属于「业务工具实现」：需要从图结构中发现商品关联、支撑组合设计时用；若只是表格特征加工，用特征工程；若要同时处理产品、属性、评论等多种节点与边类型，用 HGT 异构图模型。"
workflow: "构建共购图：节点为 SKU，边为同时购买频率 → 对邻接矩阵做对称归一化，初始化节点特征 → 按 GCN 传播公式学习节点嵌入 → 在嵌入空间筛出距离近但缺少直接共购记录的商品对 → 用用户画像与业务规则校验关联，落入推荐与组合策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GNN Foundations（图神经网络基础）

## ① 解决的问题

GCN 学习节点嵌入→发现"硅胶法兰"和"乳头霜"在嵌入空间接近（同一用户群购买），但传统协同过滤未能捕获——因为这两个产品没有共同购买者但有相似的购买者画像

## ② 核心算法逻辑

论文：SemiSupervised Classification with Graph Convolutional Networks | arXiv：1609.02907

## ③ 业务应用场景

场景：某母婴品牌在亚马逊美国站运营，SKU 池包含婴儿暖奶器（库存 2000 件，日销 50 件）、婴儿推车（库存 800 件，日销 12 件）、有机辅食（库存 5000 件，日销 200 件）。构建产品共购图：节点=SKU，边=同时购买频率。GCN 学习节点嵌入后，发现"婴儿暖奶器"与"有机辅食"在嵌入空间高度接近（距离 0.12），而传统协同过滤因无直接共购记录（仅 3 次同时购买）未能捕获。实际分析发现：购买暖奶器的用户中，65% 在 2 周内购买了有机辅食，且用户画像高度重叠（25-35 岁、高收入、注重便利性）。
产出量化： - 基于 GCN 嵌入的推荐系统上线后，暖奶器与辅食的交叉销售转化率从 1.2% 提升至 4.5% - 暖奶器月销量从 1500 件增至 2100 件（+40%），辅食月销量从 6000 件增至 7800 件（+30%） - 库存周转率提升 28%（暖奶器从 25 天降至 18 天，辅食从 15 天降至 11 天） - 广告投放 ROAS 从 2.1 提升至 3.2，因可精准向暖奶器购买者推送辅食广告 - 年化节省库存持有成本与广告浪费合计 45 万元
**三轨验证** | 成本轨：知识图谱构建月均成本3,500元（数据标注人工12小时/月×300元/小时=3,600元，系统维护2小时/月×150元/小时=300元，扣除重复计算），首期投入15,000元（GNN模型训练、供应商数据清洗）| 合规轨：符合《电商法》第十五条信息真实性要求，满足跨境电商商品溯源规范，供应商数据采集需获得书面授权，依据《个人信息保护法》第六条合法性原则 | 风险轨：断货风险预测准确率受训练数据质量影响（当前60%基线，误差±15%），供应商数据更新延迟导致预测滞后（概率35%），知识图谱冷启动期覆盖率不足（前3个月覆盖率<70%，概率40%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（15 行）。**下面 15 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **15 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，15 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/knowledge_graph/gnn_foundations` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-GNN-Foundations.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np

def gcn_layer(adj_norm, features, weights):
    """简化 GCN: H' = σ(D⁻½ A D⁻½ H W)"""
    return np.maximum(0, adj_norm @ features @ weights)  # ReLU

# test: 4-node graph
adj = np.array([[1,1,0,0],[1,1,1,0],[0,1,1,1],[0,0,1,1]])
deg = np.diag(1/np.sqrt(adj.sum(axis=1)))
adj_norm = deg @ adj @ deg
feat = np.eye(4); W = np.random.randn(4, 2)*0.1
emb = gcn_layer(adj_norm, feat, W)
print(f"Node embeddings shape: {emb.shape}")
assert emb.shape == (4, 2)
print("[✓] GNN Foundations 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:1609.02907 — Semi-Supervised Classification with Graph Convolutional Networks
⚠️ 卡页 ② 段点名的论文是《SemiSupervised Classification with Graph Convolutional Networks》，与这个号指的不是同一篇。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：订单或共购明细（用于建图）、商品基础信息与用户画像标签；卡页第 4 段未给字段级规格，落地前需确认节点与边的定义及统计时间窗。

**输出**：商品节点嵌入与关联发现清单（卡页示例：暖奶器与辅食嵌入距离 0.12，购买暖奶器的用户中 65% 在两周内购买辅食），以及由此得出的推荐与组合策略，供选品与投放团队使用。

## 执行步骤

1. 构建共购图：节点为 SKU，边权重为同时购买频率
2. 对邻接矩阵做对称归一化，初始化节点特征
3. 按 GCN 传播公式学习节点嵌入
4. 在嵌入空间筛出距离近但缺少直接共购记录的商品对
5. 用用户画像与业务规则校验关联，落入推荐与组合策略

## 边界与不做

- 数据不满足时不用：共购或交互数据不足时图过于稀疏，嵌入学不出结构，应先积累数据。
- 能力边界：本卡产出节点嵌入与关联发现，不含推荐系统在线排序与投放执行。
- 供应商与用户数据采集需获得书面授权，嵌入结果不得对外披露个体用户信息。

## 技能关联

- **前置**：Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks.html、Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven
- **可组合**：Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-GNN-Foundations

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-GNN-Foundations`