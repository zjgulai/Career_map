---
name: "p2s-state-robust-variance-reduction"
title: "STATE — 重尾指标鲁棒 A/B 方差减少：Student-t 回归调整（-70% 方差）"
description: "触发词：重尾指标、方差缩减、Student-t 回归调整、置信区间收窄、GMV 实验、鲁棒 ATE。何时不用：指标接近正态、方差可控时用常规 CUPED 或控制变量；样本极小或协变量缺失严重时不要指望降方差。安全边界：协变量只能取实验期之前的数据，混入实验期信号会污染估计并导致调整偏差。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-STATE-Robust-Variance-Reduction"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "GMV 这类指标被少数大单拉爆方差时，用鲁棒回归调整把置信区间压窄，更快出结论。"
user_try: "试试：我的 GMV 实验被几个批量采购大客户拉爆方差，怎么更快跑出结论？"
whenToUse: "主指标重尾、少数大单主导方差时用 STATE 类降方差；指标分布平稳时用常规 CUPED；样本不足本身是瓶颈时先做功效分析。"
workflow: "抽取实验期指标与实验前协变量 → 用 XGBoost 拟合期望指标并计算残差 → 用 EM 估计残差的 t 分布参数 → 输出方差缩减后的处理效应与置信区间 → 对比原始方法，判断能否提前结束实验"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# STATE — 重尾指标鲁棒 A/B 方差减少：Student-t 回归调整（-70% 方差）

## ① 解决的问题

运营分析师面临异质样本噪声太高——STATE将置信区间宽度缩22%，年化省10万元

## ② 核心算法逻辑

核心问题：电商 GMV / 订单量等指标天然重尾——极少数大客户的超大订单把方差撑得很高。CUPED 假设残差服从高斯分布，重尾数据下高斯假设失效，方差缩减效率大打折扣；CUPAC/MLRATE 用机器学习拟合协变量改进了均值预测，但同样没处理残差的非高斯性。

## ③ 业务应用场景

场景一：母婴新品 Listing AB 测试（GMV 重尾问题）
- 业务问题：新品奶粉上架后测试两种 Listing 方案（主图 A vs 主图 B），以 GMV 作为主指标。少数大客户（批量采购/月子中心）产生 10-50 倍于普通用户的订单，使 GMV 方差极高。传统 CUPED 需跑 3 周才显著； - 数据要求：实验期 GMV（$Y$）+ 实验前 14 天 GMV/浏览/加购等协变量（$X$），用户级别数据 - STATE 做法：以 XGBoost 拟合 $\hat{Y} = f(X)$，残差 $\varepsilon$ 用 EM 估 t 分布参数（典型 $\hat{\nu} \approx 3.5$），得到方差缩减后的调整指标 - 预期产出：方差
场景二：WF-B 广告竞价策略测试（点击/订单量重尾）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：实验时长减半（3 周→1.5 周），母婴电商每实验节省 1.5 周迭代时间；年化可多跑 ~17 轮实验，隐性价值 30-60 万元（每轮实验加速决策带来的优化收益）
实施难度：⭐⭐⭐☆☆（需理解 EM 算法，但有成熟代码模板）
优先级：⭐⭐⭐⭐⭐（重尾指标是电商 A/B 实验的普遍痛点，直接缩短实验周期）
评估依据：美团真实数据验证 70.5%/80.7% 方差减少；母婴 GMV 指标天然重尾（大客户聚合效应），效果复现概率高

## ⑦ 代码节选

本节的完整实现（404 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2407.16337 — STATE: A Robust ATE Estimator of Heavy-Tailed Metrics for Variance Reduction in Online Controlled Experiments

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户级实验数据：实验期主指标（GMV、订单量等）、实验前若干天的协变量（GMV、浏览、加购等）与处理标记；实验前窗口需与实验期严格对齐且不得混入实验期数据。

**输出**：调整后的平均处理效应估计、标准误与置信区间、相比原始指标的方差降低幅度；供实验平台与分析团队在重尾指标上提前收敛结论。

## 执行步骤

1. 抽取实验期指标与实验前协变量
2. 用 XGBoost 拟合期望指标并计算残差
3. 用 EM 估计残差的 t 分布参数
4. 输出方差缩减后的处理效应与置信区间
5. 对比原始方法给出能否提前结束的判断

## 边界与不做

- 何时不用：指标分布接近正态、方差可控时用常规 CUPED 或控制变量即可，不必引入重尾建模。
- 能力边界：本技能只产出调整后的估计量与区间，不改变实验设计本身，也不替代功效分析。
- 数据边界：协变量必须严格取实验期之前，混入实验期信号会造成调整偏差。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-AB-Test-Result-Interpretation.html、Skill-AB-Test-Result-Interpretation、Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Causal-Time-Series-Forecasting-GCF.html、Skill-Causal-Time-Series-Forecasting-GCF、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Power-Analysis-Sample-Size.html、Skill-Power-Analysis-Sample-Size、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Sparse-Matrix-Completion.html、Skill-Sparse-Matrix-Completion、Skill-Switchback-Experiment-Design.html、Skill-Switchback-Experiment-Design
- **延伸**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Causal-Time-Series-Forecasting-GCF.html、Skill-Causal-Time-Series-Forecasting-GCF、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Sparse-Matrix-Completion.html、Skill-Sparse-Matrix-Completion、Skill-Switchback-Experiment-Design.html、Skill-Switchback-Experiment-Design
- **可组合**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Causal-Time-Series-Forecasting-GCF.html、Skill-Causal-Time-Series-Forecasting-GCF、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Sparse-Matrix-Completion.html、Skill-Sparse-Matrix-Completion、Skill-STATE-Robust-Variance-Reduction

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-STATE-Robust-Variance-Reduction`