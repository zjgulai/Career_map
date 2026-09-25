---
name: "p2s-agentrouter-kg-guided"
title: "AgentRouter — 知识图谱引导的多智能体路由器"
description: "触发词：多智能体路由、知识图谱路由、跨领域工单、复合投诉分派、Agent 调度。何时不用：单领域标准工单分类用「CS 工单智能分诊」；本技能解决跨领域复合投诉该交给哪个 Agent。安全边界：路由依据仅用于内部分派，工单与买家数据不得对外输出。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-110"
l3_business: "客诉分诊"
l3_all: "客诉分诊 / 需求分诊"
l1_l2_l3: "业务运营/服务与体验/客诉分诊"
p2s_card_id: "Skill-AgentRouter-KG-Guided"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "一条投诉里同时有技术故障和政策问题，它按真实的语义关系把工单分给对的 Agent，而不是只看关键词。"
user_try: "试试：这条既涉及充电故障又涉及退换货政策的投诉该分给哪个 Agent，权重各多少？"
whenToUse: "当复合查询需要跨领域多 Agent 协同、单一意图分类不够用时用；单领域标准工单分类用「CS 工单智能分诊」即可。"
workflow: "注册各业务 Agent 与能力标签 → 添加产品、配件、故障类型等知识图谱实体 → 对跨领域查询做 Top-K 路由并输出权重与路由原因 → 按权重加权聚合多个 Agent 的答复"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AgentRouter — 知识图谱引导的多智能体路由器

## ① 解决的问题

大促高峰期每日 5 万条跨领域工单，正确路由率从 61% → 82%，每天减少约 10,500 条二次转单 - 单条转单处理成本约 5 元，节约运营成本 5.25 万元/天；年化 1900 万元 - 用户 CSAT 评分从 3.8 → 4.3（满分 5），复购意愿提升可观

## ② 核心算法逻辑

AgentRouter 解决多智能体系统（MAS）中最头疼的调度问题：当一个复杂查询进来时，如何决定把任务交给哪个 Agent？传统路由依赖 LLMasjudge 的 Prompt 规则，看不到查询背后隐藏的深层语义关系，经常把"技术故障导致退换货"错判为纯政策问题。

## ③ 业务应用场景

大促期间用户抛出跨领域复合型投诉："我上周买的 A 型号吸奶器，配的 B 充电线插上去闪红灯，而且你们退换货政策说 C 情况不让退，我这算吗？"。传统意图识别只抓住"退换货"关键词，直接转给政策 Agent，导致技术故障原因被忽略，回答残缺不全，用户满意度下降 23%。
| 数据类型 | 格式 | 说明 | |---------|------|------| | 产品知识图谱 | (产品, 配件, 故障类型) 三元组 | 各型号产品的硬件关系图 | | 历史工单 + Agent 处理结果 | JSONL：{query, assigned_agent, csat_score} | 用于训练路由器 | | Agent 能力标签 | 字典：{agent_name: [domain_tags]} | 技术排障/法务政策/订单/推荐 | | 领域实体词典 | 关键词 → 领域映射 | "充电/闪灯" → product_tech |
- 大促高峰期每日 5 万条跨领域工单，正确路由率从 61% → 82%，每天减少约 10,500 条二次转单 - 单条转单处理成本约 5 元，节约运营成本 5.25 万元/天；年化 1900 万元 - 用户 CSAT 评分从 3.8 → 4.3（满分 5），复购意愿提升可观

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 高：路由准确率从 61% → 82% 对应真实可量化的转单成本节省（5元/条 × 10500条/天）
难度中等：核心 GNN 代码已封装（见 model.py），主要工作在于：① 产品/政策知识图谱搭建（约 2 周）；② 历史工单标注训练集构建（约 3 周）；③ 上线 A/B 验证（约 2 周）
优先级高：直接解决大促高峰的客服分发瓶颈，属于 WF-C（客服工作流）的 P0 基础设施
Gap 价值：改变了知识图谱仅作"外部字典"查询的被动角色，让 KG 成为整个多 Agent 团队的调度中枢，属于图谱驱动智能体的核心能力跃升

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（39 行）。**下面 39 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **39 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，39 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/knowledge_graph/agentrouter_kg_guided` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-AgentRouter-KG-Guided.md`），已与卡面节选核对，不依赖上述路径。

```python
from paper2skills_code.knowledge_graph.agentic_kg_2024.model import (
    AgentRouter, AgentProfile
)
import numpy as np

# 1. 初始化路由器（feat_dim=8, hidden_dim=16, top_k=2）
router = AgentRouter(feat_dim=8, hidden_dim=16, top_k=2)

# 2. 注册业务 Agent
rng = np.random.default_rng(1)
router.register_agent(AgentProfile(
    name="技术排障Agent",
    domains=["product_tech", "product_info"],
    feature_vector=rng.uniform(-1, 1, 8),
))
router.register_agent(AgentProfile(
    name="法务政策Agent",
    domains=["policy"],
    feature_vector=rng.uniform(-1, 1, 8),
))

# 3. 添加领域知识图谱实体
router.add_knowledge_entity("充电故障知识库", ["product_tech"])
router.add_knowledge_entity("退换货政策图谱", ["policy", "order"])

# 4. 路由执行
result = router.route(
    "我的吸奶器充电线插上去闪红灯，而且你们的退换货政策说不让退，我这算吗？"
)

print(f"Top-K 路由: {result.top_k_agents}")
# 输出示例: [('技术排障Agent', 0.68), ('法务政策Agent', 0.32)]
print(f"路由原因: {result.routing_reason}")

# 5. 使用路由权重进行加权协作（示意）
for agent_name, weight in result.top_k_agents:
    response = call_agent(agent_name, result.query, weight=weight)
    # ... 加权聚合 response
print("[✓] AgentRouter KG Guided 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.05445 — AgentRouter: A Knowledge-Graph-Guided LLM Router for Collaborative Multi-Agent Question Answering

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：产品知识图谱（产品、配件、故障类型三元组）、历史工单与 Agent 处理结果（query、assigned_agent、csat_score 的 JSONL）、Agent 能力标签字典、领域实体词典。

**输出**：Top-K Agent 路由结果与权重、路由原因说明，供工单分派与多 Agent 加权协作使用。

## 执行步骤

1. 构建产品、配件、故障类型三元组知识图谱
2. 注册各 Agent 的能力标签与特征向量
3. 对跨领域查询做 Top-K 路由并输出权重
4. 给出路由原因，支持多 Agent 加权协作
5. 用历史工单与 CSAT 回标校准路由模型

## 边界与不做

- 何时不用：知识图谱或 Agent 能力标签缺失时，路由会退化成关键词匹配
- 能力边界：只产出路由决策与理由，不生成最终答复，也不替代人工客服的最终处置

## 技能关联

- **前置**：Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering
- **延伸**：Skill-Knowledge-Graph-for-Skills-Management.html、Skill-Knowledge-Graph-for-Skills-Management、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator
- **可组合**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-Agentic-SCKG-Risk.html、Skill-Agentic-SCKG-Risk、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-KG-Augmented-Recommendation-CoLaKG.html、Skill-KG-Augmented-Recommendation-CoLaKG、Skill-AgentRouter-KG-Guided

---

> 分类：业务运营/服务与体验/客诉分诊　·　技术族：08-知识图谱　·　源卡：`Skill-AgentRouter-KG-Guided`