---
name: "p2s-supply-chain-causal-scm-attribution"
title: "Supply Chain Causal SCM — 数据驱动供应链根因归因：DAG + DoWhy GCM"
description: "触发词：因果归因、DAG、结构因果模型、反事实、干预分析。何时不用：只要相关性层面的环节拆分时用「物流计划三维准确率」；要做时间序列层面的因果建模时用因果时序类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 供需协调"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Supply-Chain-Causal-SCM-Attribution"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "缺货后不再顺着链路往上猜，用因果图量化预测误差、交期延误、安全库存各占多少责任。"
user_try: "试试：这周奶粉断货损失 8 万，用 DAG 加结构因果模型告诉我预测误差、迟发 3 天、安全库存各占多少责任。"
whenToUse: "多因素同时出现、需要量化各因素责任或做反事实干预测算时用；只要环节级误差拆分用进销存三维准确率；时序因果建模用因果时序类技能。"
workflow: "按 30 天窗口整理需求预测、实际需求、补货触发量、交货期、到货量、库存水位六个节点 → 用 PC 算法学习因果 DAG 并拟合结构方程 → 对缺货时间点做根因归因输出各因素比例 → 用干预分析测算预测精度提升后的补货量与水位变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supply Chain Causal SCM — 数据驱动供应链根因归因：DAG + DoWhy GCM

## ① 解决的问题

业务问题：母婴奶粉 SKU 出现缺货（库存降至 0），损失 GMV 约 8 万元/周

## ② 核心算法逻辑

为什么传统归因不够：瀑布式逻辑（"缺货→往上查库存→往上查采购"）本质上是相关性分析，无法区分"A 导致 B"与"C 同时导致 A 和 B"。实际供应链中，多因素常常通过间接路径（中介变量）影响结果——比如"需求预测误差→战术产能调整→Capped Out Hours（COH）"，传统归因会错误地把间接效应归给直接可见的变量。

## ③ 业务应用场景

- 业务问题：母婴奶粉 SKU 出现缺货（库存降至 0），损失 GMV 约 8 万元/周。管理层需要快速定位：是需求预测误差（预测比实际低 40%）、交货期延误（供应商迟发货 3 天），还是安全库存设置过低？三个因素同时出现，传统瀑布分析无法量化各自责任； - 数据要求：30 天历史数据，每日变量：需求预测值、实际需求、采购触发量、供应商交货期、实际到货量、库存水位；共 6 个节点 - SCM 做法：PC 算法学习 DAG（需求预测误差→补货量→库存水位，交货期延误→到货量→库存水位，安全库存参数→补货触发点→补货量），拟合结构方程后对缺货时间点执行根因归因 - 预期产出：输出各因素归因比例，
场景二：WF-A 补货决策干预分析（"如果预测精度提升 10% 会怎样？"）
- 业务问题：WF-A 仓库补货计划师希望量化：如果把需求预测 MAPE 从 25% 降低到 15%，补货量应该如何调整？库存降低多少？这是一个反事实/干预问题，不是回归问题 - 数据要求：历史 60 天补货决策链路数据（预测误差、补货量、库存日均水位、缺货率），需已有拟合好的 SCM - SCM 做法：执行干预分析 `do(预测误差 = 原误差 × 0.6)` （模拟精度提升40%），通过 SCM 前向传播估计补货量和库存水位的变化；再用反事实推理量化已发生时间段的"假设场景" - 预期产出：预测精度提升 10% → 补货量减少约 8%（减少超订），库存日均水位降低 12%，缺货率从 3.2

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：供应链异常定位时间从 2-3 天→2-3 小时，量化干预效果避免无效行动；母婴旺季缺货损失每次约 5-10 万元 GMV，快速归因可减少 50%+ 的重复缺货事件
实施难度：⭐⭐⭐⭐☆（需要因果发现 + SCM 建模知识；但供应链 DAG 结构相对清晰，可由领域专家直接构建）
优先级：⭐⭐⭐⭐⭐（缺货/积压归因是供应链最高频的运营痛点，所有 SKU 类目均适用）
评估依据：Amazon Science 案例验证 SCM 比传统瀑布分析提供更深入可行洞察；母婴品类季节性强、供应链链路短，SCM 节点数少（5-8个），实施复杂度可控

## ⑦ 代码节选

本节的完整实现（476 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：30 天历史逐日六节点数据（需求预测值、实际需求、采购触发量、供应商交货期、实际到货量、库存水位）；做干预分析时需 60 天补货决策链路数据；粒度：SKU×日。

**输出**：各因素归因比例、因果路径说明与反事实干预测算结果（卡页示例：精度提升后补货量减少约 8%、库存日均水位降低 12%、缺货率下降），供管理层定位责任与决定干预动作。

## 执行步骤

1. 整理六节点逐日数据并校验缺失
2. 用 PC 算法学习 DAG 并由业务复核边方向
3. 拟合结构方程并对缺货时点做归因
4. 执行干预测算量化改善空间
5. 输出归因结论与处置建议

## 边界与不做

- 数据不满足时不用：样本不足 30 天、或关键节点（交货期、到货量）缺失时，DAG 与结构方程无法可靠拟合。
- 能力边界：输出归因与干预测算，不执行采购、调拨等实际处置动作。
- 能力边界：因果结构依赖领域专家确认，算法学到的边方向可能与业务事实不符。

## 技能关联

- **前置**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-CSDM-Diffusion-ColdStart.html、Skill-CSDM-Diffusion-ColdStart、Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-Causal-Time-Series-Forecasting-GCF.html、Skill-Causal-Time-Series-Forecasting-GCF、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis
- **延伸**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-CSDM-Diffusion-ColdStart.html、Skill-CSDM-Diffusion-ColdStart、Skill-Causal-Time-Series-Forecasting-GCF.html、Skill-Causal-Time-Series-Forecasting-GCF、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis
- **可组合**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-CSDM-Diffusion-ColdStart.html、Skill-CSDM-Diffusion-ColdStart、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-Supply-Chain-Causal-SCM-Attribution

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-Supply-Chain-Causal-SCM-Attribution`