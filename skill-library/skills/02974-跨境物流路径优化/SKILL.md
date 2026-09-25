---
name: "p2s-cross-border-logistics-routing"
title: "Cross-Border Logistics Routing（跨境物流路径优化）"
description: "触发词：跨境路径优化、多式联运、空运还是海运、头程补货方式、时效成本风险。何时不用：要排柜内三维摆放用「装箱优化」类技能，要预测销量决定备多少货用「需求预测」「补货模拟」；本技能只比运输路径。安全边界：路径方案涉及报关与承运资质，最终选择须人工确认，模型不直接订舱或签运输合同。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Cross-Border-Logistics-Routing"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在深圳仓到美国仓之间比较空运与海运等多条路径的成本、时效与风险，给出综合最优的补货路线。"
user_try: "试试：婴儿暖奶器从深圳仓补到洛杉矶 FBA 仓，旺季该走空运还是海运？帮我算综合最优路径。"
whenToUse: "已有各运输链路的成本、时效、风险数据、需要在空运海运等多条路径间选方案时用；要排柜内摆放用「装箱优化」类技能，要预测销量用「需求预测」。"
workflow: "把各条运输链路整理成带成本、时效、风险的网络图 → 设定成本、时效、风险三项目标权重 → 用最短路径搜索求起终点综合最优路径 → 结合日销、安全库存与旺季峰值判断路径适用性 → 输出路径方案与空运海运对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Border Logistics Routing（跨境物流路径优化）

## ① 解决的问题

旺季（Q4）缺货成本 $5000/天→空运；淡季持有成本低→海运

## ② 核心算法逻辑

论文：MultiObjective Optimization for Vehicle Routing Problems with Time Windows | arXiv：1805.06318

## ③ 业务应用场景

品类：婴儿暖奶器（客单价 $39.9，单件重量 0.8kg，毛利率 55%）
业务背景：深圳仓→洛杉矶 FBA 仓，日销 50 件，安全库存 2000 件。旺季（Q4）日销峰值 120 件，缺货成本 $8/件/天（含广告损失 + 排名下降）。
路径对比： | 路径 | 时效 | 单件成本 | 适用场景 | |------|------|----------|----------| | 空运（SZ→LAX） | 3 天 | $4.2/件 | 旺季补货 / 新品期 | | 海运（SZ→LAX） | 25 天 | $1.1/件 | 淡季常规补货 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：45 万元/年 | 难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（17 行）。**下面 17 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **17 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，17 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/logistics/cross_border_logistics_routing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Cross-Border-Logistics-Routing.md`），已与卡面节选核对，不依赖上述路径。

```python
import heapq
def multi_modal_route(nodes, edges, start, end, weights=(0.5, 0.3, 0.2)):
    """edges: {u:{v:(cost,time,risk)}}, weights: (w_cost,w_time,w_risk)"""
    pq, dist = [(0, start, [])], {start: 0}
    while pq:
        d, u, path = heapq.heappop(pq)
        if u == end: return {'path': path+[u], 'score': d}
        for v, (c, t, r) in edges.get(u, {}).items():
            score = d + weights[0]*c + weights[1]*t + weights[2]*r
            if v not in dist or score < dist[v]:
                dist[v] = score; heapq.heappush(pq, (score, v, path+[u]))
    return None

nodes = ['SZ','HK','LAX','NYC']
edges = {'SZ':{'HK':(200,1,0.1),'LAX':(2000,3,0.3)},'HK':{'LAX':(1800,3,0.2),'NYC':(2500,4,0.4)},'LAX':{'NYC':(500,1,0.1)}}
print(multi_modal_route(nodes,edges,'SZ','NYC'))
print("[✓] Cross-Border Logistics 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1811.03146，但该号在 arXiv 上是《Multi-channel discourse as an indicator for Bitcoin price and volume movements》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《MultiObjective Optimization for Vehicle Routing Problems with Time Windows》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：运输网络数据：节点（如深圳、香港、洛杉矶、纽约）与各条链路的三项属性（成本、时效天数、风险），形如 {u:{v:(cost,time,risk)}}；另需品类运营参数（客单价、单件重量、毛利率、日销、安全库存、旺季峰值日销、缺货成本/件/天）用于判断路径适用性。粒度：链路级。

**输出**：起终点之间综合评分最低的多式联运路径（按成本、时效、风险加权）及评分明细，以及旺季空运、淡季海运两条路径的时效与单件成本对比；供物流经理决定本次补货走哪条路。

## 执行步骤

1. 把深圳仓到美国仓的各条链路整理成带成本、时效、风险的网络图
2. 设定成本、时效、风险三项目标权重（默认 0.5、0.3、0.2）
3. 用最短路径搜索算出起终点综合评分最低的运输路径
4. 结合品类日销、安全库存与旺季峰值，判断该路径适用旺季补货还是淡季常规补货
5. 输出路径方案与空运、海运在时效和单件成本上的对比

## 边界与不做

- 数据不满足时不用：缺各链路的成本、时效与风险量化值，无法构建运输网络图，路径搜索也就没有依据。
- 只比路径与补货方式，不替用户订舱、报关或签物流合同。
- 卡页 ROI（45 万元/年）为估算口径，落地前须用本店实际数据重算。

## 技能关联

- **前置**：Skill-Bonded-Zone-Compliance-Auto.html、Skill-Bonded-Zone-Compliance-Auto、Skill-Cross-Border-Returns-Cost-Model.html、Skill-Cross-Border-Returns-Cost-Model、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-First-Mile-Pickup-Optimization.html、Skill-First-Mile-Pickup-Optimization、Skill-First-Mile-Pickup-Route-Optimization.html、Skill-First-Mile-Pickup-Route-Optimization、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling
- **可组合**：Skill-Bonded-Zone-Compliance-Auto.html、Skill-Bonded-Zone-Compliance-Auto、Skill-Cross-Border-Returns-Cost-Model.html、Skill-Cross-Border-Returns-Cost-Model、Skill-First-Mile-Pickup-Optimization.html、Skill-First-Mile-Pickup-Optimization、Skill-First-Mile-Pickup-Route-Optimization.html、Skill-First-Mile-Pickup-Route-Optimization、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Cross-Border-Logistics-Routing

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-Cross-Border-Logistics-Routing`