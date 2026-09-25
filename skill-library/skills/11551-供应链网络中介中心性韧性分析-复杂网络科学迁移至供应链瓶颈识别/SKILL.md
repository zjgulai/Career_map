---
name: "p2s-supply-chain-network-betweenness-resilience"
title: "供应链网络中介中心性韧性分析 — 复杂网络科学迁移至供应链瓶颈识别"
description: "触发词：供应链网络、中介中心性、瓶颈识别、断供预警、网络韧性。何时不用：用贝叶斯网络量化断链概率与备选分割策略时用供应链韧性建模；做劳工环境产品合规尽调时用供应链合规尽职调查。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supply-Chain-Network-Betweenness-Resilience"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把供应商网络画成图，找出一旦断供就会拖垮整条链路的那几个瓶颈节点。"
user_try: "试试：用我的 35 个供应商及上下游关系算出中介中心性排名，告诉我哪 3 个断供影响最大。"
whenToUse: "供应商数量较多、需要识别网络瓶颈与备用路径优先级时用本技能；需要量化断链概率与双重采购分割比例时用供应链韧性建模。"
workflow: "整理供应商节点、上下游关系与货值权重 → 构建供应链有向图 → 计算中介中心性并输出瓶颈排名 → 模拟断供后的韧性下降并给出多路径备选建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链网络中介中心性韧性分析 — 复杂网络科学迁移至供应链瓶颈识别

## ① 解决的问题

供应链负责人面临"供应商断供风险无优先级排序、被动应急成本高"——中介中心性网络分析将关键断供预警提前30天，年化避免紧急空运成本20万元

## ② 核心算法逻辑

原属学科：复杂网络科学（Complex Network Science），中介中心性由Freeman（1977）提出，最初用于社会网络分析（谁是信息传播的关键中间人），后被广泛应用于互联网拓扑、交通网络、生物蛋白质网络等。

## ③ 业务应用场景

场景A：母婴品牌35个供应商网络的瓶颈识别
- 业务问题：母婴品牌在华采购网络涉及35个供应商（原材料供应商 + 代工厂 + 包材供应商 + 认证机构 + 海外仓），不知道「哪3个断供会导致整条供应链瘫痪」，每次供应商出问题都是被动应急 - 数据要求： - 供应商列表（名称、类型、地域） - 供应链上下游关系（谁供货给谁） - 各关系的物料流量/货值权重（可用采购额代理） - 预期产出： - 各供应商中介中心性评分（BC排名） - Top3瓶颈供应商识别 - 模拟断供后的韧性评分下降量 - 备选供应商建议（网络多路径规划） - 业务价值：关键供应商断货预警提前30天，年化避免紧急空运成本20万元
- 将港口/中转仓/清关节点纳入网络，识别物流路径中的瓶颈枢纽 - Q4旺季备货期提前规划备用路由，避免单一港口拥堵

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：关键供应商断货预警提前30天，年化避免紧急空运成本20万元；一次瓶颈断供的空运紧急补货通常造成5-15万元额外成本
适用规模：供应商数量 ≥ 10个的母婴跨境品牌（节点越多，中介中心性的区分度越高）
实施难度：⭐⭐⭐☆☆（需要梳理供应链拓扑数据，这是最大的工作量；计算用networkx即可）
优先级：⭐⭐⭐⭐☆（2024年供应链中断事件激增，母婴品牌对韧性量化需求迫切）
核心门槛：

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（258 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
供应链网络中介中心性韧性分析
复杂网络科学(Betweenness Centrality) → 母婴跨境供应链瓶颈识别
Freeman (1977) + Operations Research Supply Chain Application
"""
import numpy as np

try:
    import networkx as nx
    HAS_NX = True
except ImportError:
    HAS_NX = False
    # 纯numpy实现BFS用于fallback
    pass


def build_supply_chain_graph(nodes, edges):
    """
    构建供应链有向图
    nodes: 节点列表，每个元素为 {'id': str, 'type': str, 'region': str}
    edges: 边列表，每个元素为 {'from': str, 'to': str, 'weight': float, 'material': str}
    返回: networkx DiGraph
    """
    if not HAS_NX:
        raise ImportError("需要安装networkx: pip install networkx")

    G = nx.DiGraph()
    for n in nodes:
        G.add_node(n['id'], **{k: v for k, v in n.items() if k != 'id'})
    for e in edges:
        G.add_edge(e['from'], e['to'],
                   weight=e.get('weight', 1.0),
                   material=e.get('material', ''))
    return G


def compute_betweenness_centrality(G, weight='weight', normalized=True):
    """
    计算有向图中介中心性
    考虑边权重（权重越大=物料流量越大=路径越重要）
    注意：networkx中weight参数对betweenness实际使用的是距离（越小越好），
    所以对流量权重取倒数作为距离
    """
    # 构建以距离为权重的图（流量越大=距离越小=路径优先级越高）
    G_dist = G.copy()
    for u, v, data in G_dist.edges(data=True):
        flow = data.get('weight', 1.0)
        G_dist[u][v]['dist'] = 1.0 / (flow + 1e-8)

    bc = nx.betweenness_centrality(
        G_dist,
        weight='dist',
        normalized=normalized
    )
    return bc


def identify_bottleneck_nodes(G, bc_scores, top_k=3):
    """
    识别Top-K瓶颈节点（高中介中心性）
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：供应商节点列表（名称、类型、地域）、上下游供货关系（谁供货给谁）、各关系的物料流量或货值权重；节点数量建议不少于 10 个。

**输出**：各供应商中介中心性评分与瓶颈排名、模拟断供后的韧性下降量、备选供应商与多路径规划建议，供供应链负责人使用。

## 执行步骤

1. 整理供应商节点、关系与货值权重数据
2. 构建供应链有向图并校验连通性
3. 计算中介中心性并输出瓶颈节点排名
4. 模拟关键节点断供并给出备选路径建议

## 边界与不做

- 何时不用：需要量化断链概率并决定认证几家备选时用供应链韧性建模；合规尽调类需求用供应链合规尽职调查。
- 能力边界：输出网络结构指标与瓶颈排序，不替代时效、成本与产能约束下的实际调度决策。
- 数据边界：供应链拓扑梳理是最大工作量，关系不完整会低估或错判瓶颈。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Network-Design.html、Skill-Supply-Chain-Network-Design、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Network-Design.html、Skill-Supply-Chain-Network-Design、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Network-Design.html、Skill-Supply-Chain-Network-Design、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-Supply-Chain-Network-Betweenness-Resilience

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-Supply-Chain-Network-Betweenness-Resilience`