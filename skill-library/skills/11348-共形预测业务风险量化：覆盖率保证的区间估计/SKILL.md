---
name: "p2s-conformal-risk-assessment"
title: "Conformal Risk Assessment — 共形预测业务风险量化：覆盖率保证的区间估计"
description: "触发词：共形风险量化、区间估计、缺货与积压、市场估算区间、选品GO决策。何时不用：要做备货两档方案与校准流程用「共形预测区间框架」，要建模波动率动态用「需求波动率建模」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Conformal-Risk-Assessment"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "把点估计换成有覆盖率保证的区间，用它判断该补多少货、市场规模够不够格进入。"
user_try: "试试：我只有下月需求 1000 件的点估计，帮我量化成区间并给出补货和选品判断建议。"
whenToUse: "本卡面向把单一点估计转成风险可解释区间的判断场景：补货量或市场规模只有单一数字、需要先量化不确定性再决策时用；要落到两档备货方案与校准流程的，用共形预测区间框架类技能。"
workflow: "收集待决策对象的点估计与其历史误差 → 校准出有覆盖率保证的区间估计 → 按区间高低估方向判断积压与缺货风险 → 用市场规模区间支撑选品 GO/NO-GO 判断"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Conformal Risk Assessment — 共形预测业务风险量化：覆盖率保证的区间估计

## ① 解决的问题

但预测误差未被显式量化，导致高估时积压、低估时缺货，实测缺货率 8%

## ② 核心算法逻辑

共形预测的核心保证：共形预测（Conformal Prediction, CP）在无需分布假设的条件下，为任意黑盒预测模型提供覆盖率理论保证。对于置信水平 1α（如 90%），输出的预测区间 [lower, upper] 在有限样本下满足：P(y ∈ [lower, upper]) ≥ 1α。这一保证来自数据可交换性（exchangeability），而非 Gaussian 分布假设。

## ③ 业务应用场景

问题：传统需求预测给出点估计（如"下月需求 1000 件"），补货量直接对齐点估计。但预测误差未被显式量化，导致高估时积压、低估时缺货，实测缺货率 8%。
问题：TAM（可寻址市场）估算依赖单一点估计（如"市场规模 1500 万美元"），但不同数据源差异巨大，直接影响选品决策的 GO/NO-GO 判断。
**三轨验证** | 成本轨：因果推断模型开发成本月均3,200元（数据标注8小时/周×4周×200元/小时=6,400元/月，模型训练2小时/周×4周×100元/小时=800元/月，维护4小时/月×150元/小时=600元/月，合计月均7,800元；年化93,600元），促销ROI评估成本月均800元（分析师4小时/周×4周×50元/小时），总年化成本约12.5万元 | 合规轨：符合《电商平台促销管理规范》第4.2条（需提供促销因果关系证明），满足《消费者权益保护法》第8条（真实宣传要求），通过A/B测试+双重差分法（DID）建立因果链路，置信区间95%的归因结论可作为营销决策依据 | 风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（2 行）。**下面 2 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **2 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，2 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/causal_inference/conformal_risk_assessment` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Conformal-Risk-Assessment.md`），已与卡面节选核对，不依赖上述路径。

```python
# 见 paper2skills-code/causal_inference/conformal_risk_assessment/model.py
print("[✓] Conformal Risk Assessment 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：点估计结果（需求预测值或市场规模估算值）与其历史误差样本、数据源清单；按决策对象（SKU 或市场）给出点估计与误差记录。

**输出**：带覆盖率保证的区间估计、由区间推导的补货量与市场进入判断结论，输出给补货决策与选品评审。

## 执行步骤

1. 收集待决策对象的点估计与其历史预测误差。
2. 用共形方法校准出有覆盖率保证的区间。
3. 按区间的高估或低估方向判断积压与缺货风险，落到补货量。
4. 对市场规模估算输出区间，支撑选品 GO/NO-GO 判断。

## 边界与不做

- 何时不用：没有历史误差样本可校准时区间无法锚定；只需把点估计直接对齐补货的场景不需要本技能。
- 能力边界：区间反映误差分布而非业务因果，市场规模的多源差异只能被量化、不能被消除；结论依赖误差样本的代表性。

## 技能关联

- **前置**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-EPICSCORE-Uncertainty.html、Skill-EPICSCORE-Uncertainty
- **延伸**：Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution
- **可组合**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-Conformal-Risk-Assessment

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：01-因果推断　·　源卡：`Skill-Conformal-Risk-Assessment`