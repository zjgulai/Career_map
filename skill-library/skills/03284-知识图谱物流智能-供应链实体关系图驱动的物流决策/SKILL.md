---
name: "p2s-kg-logistics-intelligence"
title: "知识图谱物流智能 — 供应链实体关系图驱动的物流决策"
description: "触发词：物流知识图谱、发货决策、认证与关税查询、航线推荐、跨境发货规划。何时不用：只做单证齐备性核对与纠错用「关务资料检查」，只按邮编分区拆末程成本用「末程分区成本精算」；本技能把认证、航线、时效、关税串成一次多跳查询。安全边界：关税与认证结论不替代报关行与海关的正式裁定，图谱数据须脱敏并符合数据合规要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 关务资料检查"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-KG-Logistics-Intelligence"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把货物认证、可走航线、时效和关税连成一张关系图，一次查询就给出发往某国的完整发货决策包。"
user_try: "试试：这款婴儿车从广州发德国，需要哪些认证、走哪条航线、关税税率多少、大概几天能到？"
whenToUse: "需要把认证要求、航线、时效与关税串成一次查询来支撑发货决策时用；只核单证齐备用「关务资料检查」，只做分区末程成本精算用「末程分区成本精算」。"
workflow: "归集海关编码、承运商航线与认证要求规则，构建图谱节点 → 按业务关系建立节点之间的边并写入属性 → 对目标货物执行多跳查询，取回认证、最优路线与时效 → 附上关税税率，组装成完整发货决策包 → 定期核对数据源与规则更新，标注数据质量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 知识图谱物流智能 — 供应链实体关系图驱动的物流决策

## ① 解决的问题

物流团队面临"跨境发货决策需查4个系统每次45分钟频繁出错"——物流知识图谱3秒返回认证+路线+关税完整决策包，年化减少报关错误损失约30万元

## ② 核心算法逻辑

传统物流决策的信息孤岛问题：

## ③ 业务应用场景

场景A：跨境发货路线智能规划 - 业务问题：婴儿车从广州发往德国，运营需要手查：货物是否有认证、最优航线、关税税率、预计时效——散落在4个系统中，每次发货决策需45分钟 - 数据要求：海关编码数据库 + 承运商航线数据 + 认证要求规则库（构建初始KG） - 预期产出：LKG的多跳查询在3秒内返回完整决策包（所需认证+最优路线+预计时效+关税税率）；决策时间从45分钟降至3秒 - 业务价值：运营决策效率提升1000倍；减少因知识遗漏导致的报关错误（年化避免错误罚款约15万元）；物流路线优化降低成本约8%（约15万元/年）
三轨验证 | 成本轨：知识图谱构建月均成本3,500元（数据采集2,000元+图谱维护1,200元+人工标注8小时/月×150元/小时），断货预警系统月运维800元，年度总投入52,800元 | 合规轨：符合《跨境电商商品信息管理规范》和供应商数据隐私保护要求，知识图谱采用脱敏处理，满足GDPR数据合规标准，依据：海关总署2023年跨境电商监管指南 | 风险轨：数据质量不稳定导致预警准确率下降（概率35%），供应商信息更新延迟造成断货预测失效（概率28%），知识图谱维护人员流失影响系统持续性（概率22%）
**三轨验证** | 成本轨：轻量化方案月均成本1,800元（第三方API接入1,200元+人工审核6小时/月×100元/小时），采用SaaS模式降低初期投入，年度成本21,600元 | 合规轨：通过与认证供应商平台合作获取数据，符合《电子商务法》信息安全要求，建立数据使用协议和审计机制，依据：商务部跨境电商服务标准体系 | 风险轨：对第三方数据源依赖度高导致服务中断风险（概率18%），API调用成本随业务量增长而上升（概率40%），预警覆盖率仅达75%影响断货防控效果（概率32%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：发货决策时间从45分钟→3秒；减少报关错误罚款约15万元/年；路线优化降低物流成本8%约15万元/年；综合约30万元/年
实施难度：⭐⭐⭐⭐☆（KG初始构建需要数据整理约2-3周；GNN训练需要历史物流数据；难点在规则更新维护）
优先级：⭐⭐⭐⭐☆（修复08-KG↔18-物流断层 规模91；为复杂跨境决策提供统一的知识基础设施）
评估依据：IJCAI 2023供应链KG论文；ACL 2024物流实体链接顶会；京东/顺丰均有内部物流知识图谱系统

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（146 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-KG-Logistics-Intelligence
知识图谱物流智能

依赖：pip install numpy pandas
"""

import numpy as np
from dataclasses import dataclass, field
from collections import defaultdict, deque

# ── 1. 物流知识图谱构建 ────────────────────────────────────────────
@dataclass
class KGNode:
    node_id:   str
    node_type: str   # 'product','port','carrier','regulation','warehouse'
    properties: dict = field(default_factory=dict)

@dataclass
class KGEdge:
    src:       str
    dst:       str
    rel_type:  str
    weight:    float = 1.0
    properties: dict = field(default_factory=dict)

class LogisticsKnowledgeGraph:
    """物流领域知识图谱"""

    def __init__(self):
        self.nodes: dict[str, KGNode] = {}
        self.edges: list[KGEdge]      = []
        self.adj: dict[str, list]     = defaultdict(list)
        self._build_demo_graph()

    def add_node(self, node: KGNode): self.nodes[node.node_id] = node

    def add_edge(self, edge: KGEdge):
        self.edges.append(edge)
        self.adj[edge.src].append(edge)

    def _build_demo_graph(self):
        """构建母婴跨境物流演示图谱"""
        # 产品节点
        for p, hs, cat in [
            ('stroller', '8715000', 'baby_vehicle'),
            ('formula',  '1901100', 'food'),
            ('monitor',  '8525801', 'electronics'),
        ]:
            self.add_node(KGNode(p, 'product', {'hs_code': hs, 'category': cat}))

        # 港口节点
        for port, country in [('guangzhou_port','CN'), ('hamburg_port','DE'),
                                ('shanghai_port','CN'), ('rotterdam_port','NL')]:
            self.add_node(KGNode(port, 'port', {'country': country}))

        # 承运商节点
        for c, otdr, cost in [('maersk', 0.95, 800), ('cosco', 0.90, 700), ('hapag', 0.93, 850)]:
            self.add_node(KGNode(c, 'carrier', {'otdr': otdr, 'base_cost': cost}))
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2405.12834。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：图谱构建侧：海关编码数据库、承运商航线数据（含准班率与基础成本）、认证要求规则库、港口与仓库节点信息；查询侧：单批货物的品类或 HS 编码、起运地与目的地。粒度到单个货物与单条航线。

**输出**：该批货的发货决策包：所需认证、最优路线、预计时效与关税税率，以及支撑结论的图谱多跳查询路径；供运营与关务在发货下单前一次性取用。

## 执行步骤

1. 归集海关编码、承运商航线与认证要求规则，构建产品、港口、承运商、法规节点
2. 按业务关系建立节点之间的边并写入属性（HS 编码、准班率、基础成本等）
3. 对目标货物执行多跳查询，取回所需认证、最优路线与预计时效
4. 附上关税税率，组装成完整发货决策包返回
5. 定期核对数据源与规则更新，标注数据质量与覆盖率

## 边界与不做

- 数据不满足时不用：缺海关编码库或认证规则库时图谱建不起来，多跳查询会漏项。
- 只给决策参考包，不替代报关行的正式归类与海关裁定，图谱数据须脱敏合规。
- 卡页 ROI（发货决策从 45 分钟降至 3 秒、年化约 30 万元）为估算口径，原文同时标注数据质量不稳定与维护人员流失风险，落地须配规则更新机制。

## 技能关联

- **前置**：Skill-Carrier-Selection-ML.html、Skill-Carrier-Selection-ML、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-KG-Supply-Chain-Cost-Attribution.html、Skill-KG-Supply-Chain-Cost-Attribution、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph
- **延伸**：Skill-Carrier-Selection-ML.html、Skill-Carrier-Selection-ML、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-KG-Supply-Chain-Cost-Attribution.html、Skill-KG-Supply-Chain-Cost-Attribution、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-KG-Supply-Chain-Cost-Attribution.html、Skill-KG-Supply-Chain-Cost-Attribution、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph、Skill-KG-Logistics-Intelligence

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Logistics-Intelligence`