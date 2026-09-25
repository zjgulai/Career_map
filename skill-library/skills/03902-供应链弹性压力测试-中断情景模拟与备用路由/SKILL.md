---
name: "p2s-supply-chain-resilience-stress-test"
title: "供应链弹性压力测试 — 中断情景模拟与备用路由"
description: "触发词：弹性压测、中断情景、备用路由、风险敞口、网络最大流。何时不用：单参数方案对比用「供应链 What-If 情景分析引擎」；极端事件预案绑定用「黑天鹅情景模拟标签」。安全边界：风险概率来自舆情与政策估计，须标注不确定性区间，不得作为重大投资决策的唯一依据。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-010"
l3_business: "情景模拟"
l3_all: "情景模拟 / 物流方案"
l1_l2_l3: "经营管理/经营与组织/情景模拟"
p2s_card_id: "Skill-Supply-Chain-Resilience-Stress-Test"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用网络拓扑和中断概率压测供应链，量化风险敞口并给出备用路由，把缺货率压下来。"
user_try: "试试：假设美国加征 25% 关税或港口关闭 72 小时，帮我量化缺货损失并给出备用路由方案。"
whenToUse: "当要评估地缘政治或自然灾害等中断对整张供应网络的影响、并需要备用路由时用本技能；单参数方案对比用「供应链 What-If 情景分析引擎」；绑定极端事件预案用「黑天鹅情景模拟标签」。"
workflow: "构建含节点、容量、成本与风险概率的供应链网络 → 设定中断情景（关税加征、港口关闭）并扰动相应边 → 用最大流与残差图计算中断下的可用运力与缺货损失 → 给出备用路由方案与缺货率改善评估"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链弹性压力测试 — 中断情景模拟与备用路由

## ① 解决的问题

风控团队面临供应链中断风险盲目——弹性压力测试将风险敞口量化准确率达87%，年化避免断货损失80万元

## ② 核心算法逻辑

核心机制：蒙特卡洛情景模拟 + 最大流算法的双层架构。

## ③ 业务应用场景

场景A：母婴品牌地缘政治风险量化（中美贸易摩擦）
- 业务问题：某头部母婴品牌（年销售额2亿元）70%产能在华东，70%销售在北美。2024年关税政策不确定性高，品牌方需量化"若美国突然加征25%关税或中国港口临时关闭72小时"的供应链影响，以决策是否启动东南亚产能转移（投资800万元）。
- 数据要求：(1)供应链网络拓扑：5个生产基地、8个中转港口、12个目标市场仓库的运输成本矩阵与运力上限；(2)历史中断数据：过去24个月各港口延误率、供应商交期达成率；(3)地缘政治风险指数：基于新闻舆情、政策公告的周度关税变动概率、港口关闭概率（如台风季0-2%，贸易摩擦期2-8%）；(4)产品特性：母婴奶粉保质期12个月，纸尿裤无保质期限制。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
场景A（中美贸易摩擦）：供应链负责人面临"是否投资800万转移产能"的决策——蒙特卡洛压力测试量化极端情景下的缺货损失（3000万→500万），投资ROI周期<4个月，年化价值2620万元（缺货损失避免2500万+运输成本优化120万）。
场景B（台风季动态规划）：运营经理面临"如何应对台风季缺货"——自动化备用路由方案将缺货率从12%降至2%，年化价值325万元（缺货罚款节省125万+销售增长200万）。
实施难度：⭐⭐⭐⭐☆（需要数据集成、算法优化、系统对接）
优先级：⭐⭐⭐⭐⭐（供应链韧性直接影响销售稳定性，地缘政治风险高企背景下优先级最高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（244 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from collections import defaultdict, deque
import json
from datetime import datetime

# ============ 数据定义 ============
class SupplyChainNetwork:
    def __init__(self):
        # 节点：生产地、港口、目标市场仓库
        self.nodes = {
            'factory_sh': {'type': 'factory', 'name': '上海工厂'},
            'factory_hz': {'type': 'factory', 'name': '杭州工厂'},
            'port_sh': {'type': 'port', 'name': '上海港'},
            'port_nb': {'type': 'port', 'name': '宁波港'},
            'port_la': {'type': 'port', 'name': '洛杉矶港'},
            'port_hb': {'type': 'port', 'name': '横滨港'},
            'warehouse_us': {'type': 'warehouse', 'name': '美国仓'},
            'warehouse_jp': {'type': 'warehouse', 'name': '日本仓'},
        }
        
        # 边：(源, 目标, 容量, 基础成本, 基础风险概率)
        self.edges = [
            ('factory_sh', 'port_sh', 500, 100, 0.02),
            ('factory_hz', 'port_nb', 400, 95, 0.015),
            ('port_sh', 'port_la', 600, 1200, 0.05),  # 中美贸易摩擦风险高
            ('port_nb', 'port_hb', 400, 900, 0.03),
            ('port_la', 'warehouse_us', 600, 200, 0.01),
            ('port_hb', 'warehouse_jp', 400, 150, 0.02),
            ('port_sh', 'port_hb', 300, 1100, 0.04),  # 备用路由
            ('factory_sh', 'port_nb', 200, 120, 0.025),  # 工厂间协调
        ]
        
        self.graph = defaultdict(list)
        self.capacity = {}
        self.base_risk = {}
        
        for src, dst, cap, cost, risk in self.edges:
            self.graph[src].append(dst)
            self.capacity[(src, dst)] = cap
            self.base_risk[(src, dst)] = risk
    
    def get_max_flow(self, source, sink, disrupted_edges=set()):
        """Ford-Fulkerson算法计算最大流"""
        # 构建残差图
        residual = defaultdict(lambda: defaultdict(int))
        for (src, dst), cap in self.capacity.items():
            if (src, dst) not in disrupted_edges:
                residual[src][dst] += cap
        
        max_flow = 0
        parent = {}
        
        def bfs(source, sink):
            visited = set([source])
            queue = deque([source])
            parent.clear()
            
            while queue:
                u = queue.popleft()
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1707.01545。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：供应链网络拓扑（生产基地、港口、市场仓库的成本矩阵与运力上限）、过去 24 个月的港口延误率与供应商交期达成率、地缘政治风险指数（关税变动与港口关闭概率）、产品特性（如保质期）。

**输出**：各中断情景下的缺货损失量化、风险敞口与备用路由方案（含缺货率变化）；供供应链负责人做产能转移等决策。

## 执行步骤

1. 构建含节点、容量、成本与风险概率的供应链网络
2. 设定中断情景（关税加征、港口关闭）并扰动相应边
3. 用最大流与残差图计算中断下的可用运力与缺货损失
4. 给出备用路由方案与缺货率改善评估

## 边界与不做

- 数据不满足：缺运输成本矩阵、运力上限或中断概率时压测结果不可用，先补网络数据。
- 何时不用：单参数方案对比用「供应链 What-If 情景分析引擎」；极端事件预案绑定用「黑天鹅情景模拟标签」；单条链路问题不必做全网压测。
- 能力边界：输出风险量化与路由建议，不执行产能转移或改签物流合同，风险概率的不确定性需一并标注。
- 安全边界：风险概率来自舆情与政策估计，须标注不确定性区间，不得作为重大投资决策的唯一依据。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Customs-Clearance-Risk-Scoring.html、Skill-Customs-Clearance-Risk-Scoring、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Demand-Shock、Skill-Geopolitical-Risk-NLP-Monitor、Skill-Inventory-Optimization-Safety-Stock、Skill-Supplier-Credit-Assessment、Skill-Zone-GNN-Last-Mile-Routing.html、Skill-Zone-GNN-Last-Mile-Routing
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Demand-Shock、Skill-Geopolitical-Risk-NLP-Monitor、Skill-Inventory-Optimization-Safety-Stock、Skill-Zone-GNN-Last-Mile-Routing.html、Skill-Zone-GNN-Last-Mile-Routing
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Geopolitical-Risk-NLP-Monitor、Skill-Inventory-Optimization-Safety-Stock、Skill-Supply-Chain-Resilience-Stress-Test

---

> 分类：经营管理/经营与组织/情景模拟　·　技术族：18-物流履约　·　源卡：`Skill-Supply-Chain-Resilience-Stress-Test`