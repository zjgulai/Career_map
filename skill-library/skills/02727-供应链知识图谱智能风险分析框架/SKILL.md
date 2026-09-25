---
name: "p2s-agentic-sckg-risk"
title: "Agentic SCKG Risk Analyzer — 供应链知识图谱智能风险分析框架"
description: "触发词：供应链图谱、断供预警、链路穿透、风险诊断。何时不用：缺少供应商层级或供应关系数据时无法穿透多级链路；对单个供应商做综合评分用供应商评估类技能。安全边界：合规结论须由人工复核，图谱数据涉跨境传输时需符合数据出境安全评估要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 产能调查"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Agentic-SCKG-Risk"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把供应链建成知识图谱，风险事件一来就秒级穿透到多级供应商，定位断供影响。"
user_try: "试试：越南工厂罢工，帮我快速查清它是不是我们三级供应商的独家来源。"
whenToUse: "本卡属「供应商评估」。需要从风险事件出发穿透多级供应链定位受影响节点时用本卡；对单个供应商做多准则综合评分与选择时用供应商评估模型类技能。"
workflow: "构建供应链知识图谱 → 触发风险事件分析 → 输出链路诊断报告 → 查看节点中心度排名"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agentic SCKG Risk Analyzer — 供应链知识图谱智能风险分析框架

## ① 解决的问题

手动 ERP 排查可能要 2-3 周，到时候竞争对手早把备货扫空了

## ② 核心算法逻辑

Agentic SCKG Risk Analyzer 解决出海品牌面临的生死级挑战：当全球某处发生黑天鹅事件（罢工/地震/制裁），你的旗舰产品会在多少天后断供？传统方案要么靠 ERP 人工逐层排查（耗时数周），要么让 LLM 在非结构化新闻里盲目搜索（漏掉隐藏链路）。

## ③ 业务应用场景

某国内出海母婴品牌，旗舰款「恒温宝」婴儿暖奶器（SKU: WARM-1001）依赖一条跨越越南、韩国、深圳的四级供应链。该暖奶器在亚马逊美国站日销 50 件，库存周转天数 30 天，当前安全库存 2000 件。某天新闻出现"越南胡志明工业区大规模罢工"，采购总监知道直接供应商里没有越南企业，但不知道越南工厂是否是自己三级供应商（温控传感器材料）的独家来源。手动 ERP 排查需要 2-3 周，届时竞争对手的同类暖奶器早已补货抢占搜索排名，导致品牌方转化率从 4.5% 骤降至 2.1%。
| 数据类型 | 格式 | 说明 | |---------|------|------| | 供应商层级图 | 节点：{supplier_id, name, country, tier, default_prob, inventory_days} | ERP 或供应链系统导出 | | 供应关系图 | 边：{src, dst, lead_time_days, dependency_ratio, annual_volume} | 采购订单/BOM 汇总 | | 风险事件 | {event_type, location, affected_nodes, severity, description} 
- 断供预警从"出事后救火（2-3 周）"提前到"事件触发即秒级诊断（< 10 秒）" - 旗舰 SKU 断货每天损失约 7,500 美元（日销 50 件 × 单价 150 美元），提前 15 天响应直接避免 112,500 美元销售额损失 - 供应链弹性（Resilience）从"被动反应"升级为"主动链路穿透预警"，年化节省约 45 万元（按每年 4 次类似风险事件计算）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 极高：供应链断货是出海品牌生死级风险，一次黑天鹅事件的损失（如婴儿暖奶器断货 15 天损失 112,500 美元）可覆盖系统建设成本数十倍，且本框架无需昂贵专用图数据库，仅依赖 Python 标准库 + numpy
难度中等：核心算法已封装（见 model.py），主要实施成本在于①供应商数据治理（Tier 2+ 数据录入，约 4-8 周）；②新闻/风险事件监控接入（1-2 周）；③报告模版调优（1 周）
优先级最高：属于 WF-A（供应链工作流）的 P0 战略防御基础设施，且当前知识图谱域 Skill 库中唯一覆盖"网络科学 × 风险传播"方向，填补关键缺口
技术壁垒：将图论的中心度算法与 LLM Context Shell 结合，形成竞对难以快速复制的"链路穿透预警"护城河

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（60 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：7」并记录位置 `paper2skills-code/knowledge_graph/agentic_sckg_risk` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Agentic-SCKG-Risk.md`），已与卡面节选核对，不依赖上述路径。

```python
from paper2skills_code._08_知识图谱.supply_chain_kg_2025.model import (
    AgenticSCKGRiskAnalyzer, SupplierNode, SupplyEdge, RiskEvent
)

# 1. 初始化分析器（指定品牌方节点 ID）
analyzer = AgenticSCKGRiskAnalyzer(brand_node_id="brand_001")

# 2. 构建供应链知识图谱
nodes = [
    SupplierNode("brand_001", "XX母婴品牌", "中国", tier=0,
                 default_prob=0.01, inventory_days=30,
                 capacity_utilization=0.8, component_type="assembly"),
    SupplierNode("factory_d", "深圳整机厂D",   "中国", tier=1,
                 default_prob=0.03, inventory_days=20,
                 capacity_utilization=0.9, component_type="assembly"),
    SupplierNode("supplier_c", "温控传感器模组C",  "中国", tier=2,
                 default_prob=0.05, inventory_days=15,
                 capacity_utilization=0.85, component_type="sensor"),
    SupplierNode("supplier_b", "韩国温控芯片封装商B",    "韩国", tier=3,
                 default_prob=0.04, inventory_days=10,
                 capacity_utilization=0.9, component_type="chip"),
    SupplierNode("factory_a", "越南材料厂A",   "越南", tier=4,
                 default_prob=0.08, inventory_days=5,
                 capacity_utilization=0.95, component_type="material"),
]
edges = [
    SupplyEdge("factory_a",  "supplier_b", lead_time_days=21, dependency_ratio=0.9,  annual_volume=500),
    SupplyEdge("supplier_b", "supplier_c", lead_time_days=14, dependency_ratio=0.75, annual_volume=800),
    SupplyEdge("supplier_c", "factory_d",  lead_time_days=7,  dependency_ratio=0.6,  annual_volume=1200),
    SupplyEdge("factory_d",  "brand_001",  lead_time_days=3,  dependency_ratio=1.0,  annual_volume=3000),
]
analyzer.build_kg(nodes, edges)

# 3. 触发风险事件分析
event = RiskEvent(
    event_id="evt_001", event_type="strike",
    location="越南胡志明工业区",
    affected_node_ids=["factory_a"],
    severity=0.8,
    description="越南胡志明工业区大规模罢工，预计持续4周",
)

chains, shells = analyzer.analyze_risk_event(
    event=event,
    brand_inventory_days=30,
    alternative_suppliers=["备用材料商-泰国F", "国内替代材料商G"],
    top_k_paths=3,
)

# 4. 输出诊断报告
for i, (chain, shell) in enumerate(zip(chains, shells)):
    print(f"\n【风险链 #{i+1}】级联风险: {chain.cascade_risk_score:.1%}")
    print(f"传播时间: {chain.total_lead_time_days} 天")
    print(shell)

# 5. 查看中心度摘要（节点重要性排名）
summary = analyzer.get_centrality_summary()
for nid, info in sorted(summary.items(), key=lambda x: -x[1]["pagerank"]):
    print(f"{info['name']:30s}  PR={info['pagerank']:.4f}  BT={info['betweenness']:.4f}")
print("[✓] Agentic SCKG Risk 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.01115 — Exploring Network-Knowledge Graph Duality: A Case Study in Agentic Supply Chain Risk Analysis

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：供应商层级图（含国家、层级、断供概率、库存天数）、供应关系边（交期、依赖比例、年用量）与结构化风险事件（类型、地点、受影响节点、严重度）。

**输出**：风险事件的链路穿透诊断报告、受影响节点与替代路径、节点中心度排名，用于断供预警与应急采购决策。

## 执行步骤

1. 从 ERP 或供应链系统导出供应商层级与关系
2. 构建供应链知识图谱并指定品牌方节点
3. 触发风险事件做链路穿透分析
4. 输出受影响节点与断供影响评估
5. 给出替代供应路径与响应建议

## 边界与不做

- 缺少供应商层级或供应关系数据时无法穿透多级链路，不用本卡
- 本卡产出诊断与建议，不负责启动应急采购与合同变更
- 图谱数据涉跨境传输时需符合数据出境安全评估要求，合规结论须人工复核

## 技能关联

- **前置**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven
- **延伸**：Skill-AgentRouter-KG-Guided.html、Skill-AgentRouter-KG-Guided、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction
- **可组合**：Skill-AgentRouter-KG-Guided.html、Skill-AgentRouter-KG-Guided、Skill-CausalRAG-Knowledge-Retrieval.html、Skill-CausalRAG-Knowledge-Retrieval、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-Agentic-SCKG-Risk

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：08-知识图谱　·　源卡：`Skill-Agentic-SCKG-Risk`