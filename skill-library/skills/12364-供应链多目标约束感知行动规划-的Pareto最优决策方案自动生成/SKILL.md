---
name: "p2s-multi-objective-constrained-action-planning"
title: "供应链多目标约束感知行动规划 — MILP+LLM的Pareto最优决策方案自动生成"
description: "触发词：多目标优化、Pareto 前沿、约束规划、MILP 补货、权衡分析、行动方案生成。何时不用：只做供需缺口分析用「Skill-Demand-Supply-Matching-Gap-Analysis」；只做采购预算分配用「Skill-Multi-SKU-Procurement-Budget-Allocation」；反事实情景推演用「Skill-Counterfactual-SC-Scenario-Sim」；决策置信度校准用「Skill-Decision-Confidence-Calibration-SC」。安全边界：本技能产出优化模型、Pareto 方案与 Action 建议（规则与契约产物），不是执行器；真实下单、改单等采购动作必须由模型外的确定性控制层或人工确认后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-063"
l3_business: "行动组合"
l3_all: "行动组合 / 资源情景比较"
l1_l2_l3: "业务运营/渠道经营/行动组合"
p2s_card_id: "Skill-Multi-Objective-Constrained-Action-Planning"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把成本、质量、时效这些互相冲突的目标写进约束模型，自动生成几套 Pareto 最优补货方案并给出权衡对比，让人快速拍板。"
user_try: "试试：Black Friday 前我要做多 SKU 全局补货规划，帮我按成本、服务水平、供应商风险三个目标生成几套 Pareto 方案，并给出每套的成本、服务水平和风险分布。"
whenToUse: "成本、质量、时效多目标互相冲突、需要系统化权衡并给出可选行动方案时用本技能（属「行动组合／资源情景比较」）；只做供需缺口分析用「Skill-Demand-Supply-Matching-Gap-Analysis」；只做多 SKU 采购预算分配用「Skill-Multi-SKU-Procurement-Budget-Allocation」；要做反事实情景推演用「Skill-Counterfactual-SC-Scenario-Sim」；要做决策置信度校准用「Skill-Decision-Confidence-Calibration-SC」。本卡只生成方案与 Action 建议，不执行下单。"
workflow: "汇集 SKU 需求与 MOQ、供应商产能/风险分/分 SKU 报价、预算上限，并把自然语言业务约束交给 LLM 解析成结构化约束 → 用 SupplyChainMOOPlanner 按加权和法设定多组目标权重（成本／服务水平／风险），分别建模为 MILP → 求解并计算每个方案的 total_cost、service_level、risk_score 与 objective_value，得到 Pareto 前沿 → 用 _compute_plan_metrics 校验各方案的履约量与启用供应商，并用反事实仿真验证风险分布 → 把候选方案转换为 Palantir Action（如 CreatePurchaseOrder）供决策者选择，输出方案间权衡对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链多目标约束感知行动规划 — MILP+LLM的Pareto最优决策方案自动生成

## ① 解决的问题

运营面临"成本/质量/时效三角冲突无法系统化权衡"——MILP+LLM自动生成Pareto最优方案，将多目标决策从1天人工讨论→5分钟方案输出，减少权衡失误

## ② 核心算法逻辑

多目标约束规划解决Palantir Action设计的核心难题：业务决策通常有多个相互冲突的目标和复杂的约束条件，简单的规则无法处理。Merck案例明确指出：能够同时优化"成本+质量+时效+风险"是Palantir超越传统BI的关键。

## ③ 业务应用场景

场景：Black Friday前的多SKU全局补货规划
| 方案 | 目标权重 | 总成本 | 服务水平 | 供应商风险 | |-----|--------|-------|--------|---------| | 纯成本最优 | w₁=1,w₂=0,w₃=0 | ¥280万 | 82% | 中高 | | 纯服务最优 | w₁=0,w₂=1,w₃=0 | ¥520万 | 98% | 中 | | Pareto最优 | w₁=0.4,w₂=0.5,w₃=0.1 | ¥350万 | 95% | 低 |
Palantir自动生成三个Action供决策者选择，并用反事实仿真验证每个方案的风险分布。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：Airbus Skywise：实施多目标优化规划后，零件采购的"成本+时效+质量"三维优化使年度采购效率提升22%（约$180M节省）；母婴电商场景：大促前的全局补货规划比逐SKU分析平均节省18-25%的补货成本，同时服务水平提升5-8pp
实施难度：⭐⭐⭐⭐☆（MILP建模需要运筹学知识；LLM约束解析是新兴技术，可先用手工约束替代）
优先级评分：⭐⭐⭐⭐⭐（Palantir的核心竞争力之一——能够同时优化多目标是区分"BI工具"和"决策系统"的关键特征；Merck案例明确证明此能力的价值）

## ⑦ 代码节选

本节的完整实现（279 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.12234，但该号在 arXiv 上是《Bridging the Gaps of Both Modality and Language: Synchronous Bilingual CTC for Speech Translation and Speech Recognition》，与本卡主题无关。
⚠️ 该号被 7 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需 SKU 列表（每个 SKU 的 id、demand 需求量、moq 最小起订量）、供应商数据（id、capacity 产能、risk_score 风险分、price_by_sku 分 SKU 报价）与预算上限 budget；另需以自然语言给出的业务约束（由 LLM 解析为结构化约束，解析不了可先用手工约束替代）。目标维度为成本／服务水平／供应商风险，权重 w1、w2、w3 由决策者设定，卡页示例 Pareto 方案用 w1=0.4、w2=0.5、w3=0.1。适用场景为大促（如 Black Friday）前的多 SKU 全局补货规划。

**输出**：产出 Pareto 最优供应规划解：每个解含 solution_id、目标权重、分配方案 {(sku_id, supplier_id): quantity}、总成本、服务水平、风险分与目标值；并转换为 Palantir Action 推荐（如 CreatePurchaseOrder 的 sku_id／supplier_id／quantity／expected_service_level），附方案间权衡分析与反事实仿真的风险分布，供决策者在多个 Action 中挑选。

## 执行步骤

1. 整理 SKU 列表（id、需求量 demand、最小起订量 moq）、供应商数据（产能、风险分、分 SKU 报价）与预算上限
2. 把自然语言业务约束交给 LLM 解析为 MILP 可用的结构化约束
3. 用加权和法设定多组目标权重（如纯成本最优、纯服务最优、Pareto 均衡），分别求解供应分配
4. 计算每个解的 total_cost、service_level、risk_score 与 objective_value，标出 Pareto 前沿
5. 用反事实仿真比较候选方案的风险分布，输出成本／服务水平／风险三维权衡表
6. 把选定方案转换为 Palantir Action（CreatePurchaseOrder：sku_id、supplier_id、quantity）供决策者确认

## 边界与不做

- 数据不满足：缺少各 SKU 需求量与 MOQ、供应商产能/风险分/分 SKU 报价，或没有预算上限与业务约束时不要建模，MILP 得不到可行解；业务约束若无法转成结构化形式（LLM 解析失败）需改为手工约束后再用。
- 何时不用：只做供需缺口分析用「Skill-Demand-Supply-Matching-Gap-Analysis」；只做多 SKU 采购预算分配用「Skill-Multi-SKU-Procurement-Budget-Allocation」；做反事实情景推演用「Skill-Counterfactual-SC-Scenario-Sim」；做决策置信度校准用「Skill-Decision-Confidence-Calibration-SC」。
- 能力边界：本技能产出的是多目标优化模型、Pareto 前沿解、权衡分析与 Palantir Action 建议（规则与契约产物），不是执行器；真正的采购下单与改单动作由模型外的确定性控制层或人工完成。MILP 建模需运筹学知识、LLM 约束解析属新兴技术，可先用手工约束替代；卡页的效益数字（采购效率提升 22%、补货成本节省 18-25%）来自外部案例，不可直接当作本店铺预期。
- 安全边界：Palantir Action 仅为推荐参数（CreatePurchaseOrder 的 sku_id／supplier_id／quantity），不得直接对接生产采购系统自动下单；方案上线前须由采购负责人确认预算与供应商风险，并保留反事实仿真的风险分布作为复核依据。

## 技能关联

- **前置**：Skill-Causal-Decision-Graph-SC-Inference.html、Skill-Causal-Decision-Graph-SC-Inference、Skill-Counterfactual-SC-Scenario-Sim.html、Skill-Counterfactual-SC-Scenario-Sim、Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **延伸**：Skill-Counterfactual-SC-Scenario-Sim.html、Skill-Counterfactual-SC-Scenario-Sim、Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Multi-Objective-Constrained-Action-Planning

---

> 分类：业务运营/渠道经营/行动组合　·　技术族：24-标签工程　·　源卡：`Skill-Multi-Objective-Constrained-Action-Planning`