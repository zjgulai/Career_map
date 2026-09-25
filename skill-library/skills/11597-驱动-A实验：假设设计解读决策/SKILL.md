---
name: "p2s-agentic-ab-testing"
title: "Agentic AB Testing — AI Agent 驱动 A/B 实验：假设→设计→解读→决策"
description: "触发词：Agent实验、假设生成、自动解读、实验推荐、心跳监控。何时不用：只跑一个标准实验并自行解读时，用A/B实验设计与结果解读类技能即可。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 业务工具实现"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Agentic-AB-Testing"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "让一个 Agent 把假设生成、实验设计、读数解读、给建议整条流程跑完，上线周期从一周压到两天。"
user_try: "试试：奶粉旗舰店主图 CTR 低于类目均值，帮我让 Agent 从历史实验生成假设并设计一个实验。"
whenToUse: "当实验流程（假设、设计、解读、决策）全靠人推进、周期长且重复劳动多时用；只跑一个标准实验并自己解读时，用 A/B 实验设计与结果解读类技能更轻。"
workflow: "扫描历史实验数据生成候选假设 → 计算样本量与运行天数并产出实验设计 → 按 50/50 分流执行并做每日心跳监控 → 用统计检验解读结果并输出推荐结论 → 记录新奇效应、网络效应与多重检验等风险提示"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agentic AB Testing — AI Agent 驱动 A/B 实验：假设→设计→解读→决策

## ① 解决的问题

实验平台主管面临测试流程靠人盯——Agentic AB将上线周期从7天缩到2天，年化省18万元

## ② 核心算法逻辑

论文：Agentic AB Testing: LLMDriven Automated Experimentation | 年份：2023

## ③ 业务应用场景

背景：婴儿奶粉旗舰店主图点击率（CTR）低于类目均值 1.2%。
Agent 执行流程： 1. 假设生成：扫描历史数据 → 检测到"使用场景图"类实验历史平均提升 +15% CTR → 生成假设「将主图改为婴儿实际使用场景（妈妈哺乳/喂食）预计提升 CTR 8-15%」 2. 实验设计：计算样本量（基线 CTR=2.3%，MDE=0.3pp，α=0.05，Power=80%）→ 需要每组 9,800 次曝光，预计运行 7 天 3. 执行：流量 50/50 分配，日监控心跳（持续监测置信度变化） 4. 结果解读：`Variant B CTR=2.61% vs Control CTR=2.30%，z=2.41，p=0.016 < 0.05` → 输出：「✅ 推荐
背景：奶粉 SKU 从 $44 调价，测试 $42 / $45 / $48 三种定价。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

⚠️ 新奇效应：实验前 48 小时数据不稳定，建议从第 3 天起计算结果
⚠️ 网络效应：Amazon 平台算法调整会干扰实验，建议控制组与实验组在相同时间窗口
⚠️ 多重检验：同时监测 5+ 指标时必须应用 Bonferroni 或 FDR 校正

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（12 行）。**下面 12 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **12 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，12 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ab_testing/agentic_ab_testing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-Agentic-AB-Testing.md`），已与卡面节选核对，不依赖上述路径。

```python
from agentic_ab_testing import AgenticABTestRunner

runner = AgenticABTestRunner()
hypothesis = runner.generate_hypothesis(
    metric="ctr",
    baseline_value=0.023,
    historical_experiments=[...]
)
design = runner.design_experiment(hypothesis, daily_traffic=3000)
result = runner.interpret_result(control_data, treatment_data, hypothesis)
print(result.recommendation)
print("[✓] Agentic AB Testing 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.10086，但该号在 arXiv 上是《Studies on the hadronization of charm and beauty quarks》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Agentic AB Testing: LLMDriven Automated Experimentation》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史实验数据（指标、基线值、历史实验列表）+ 每日流量（示例 3000）+ 实验组与对照组的原始结果数据；示例设定为基线 CTR 2.3%、MDE 0.3pp、α=0.05、Power=80%。

**输出**：生成的实验假设与预估提升区间、实验设计方案（每组样本量与预计运行天数）、以及结果解读与上线推荐（卡页示例：实验组 CTR 2.61% 对比对照 2.30%、z=2.41、p=0.016 后输出推荐结论）。

## 执行步骤

1. 扫描历史实验数据生成候选假设
2. 计算样本量与运行天数并产出实验设计
3. 按 50/50 分流执行实验并做每日心跳监控
4. 用统计检验解读结果并输出推荐结论
5. 记录新奇效应、网络效应与多重检验等风险提示

## 边界与不做

- 何时不用：只想跑一个标准实验并自行解读时，用 A/B 实验设计与结果解读类技能即可，不必引入 Agent 流程；卡页第 7 段只有调用示例，落地需另行获取完整实现。
- 能力边界：Agent 负责生成假设、设计与解读建议，不执行流量切换与上线；实验前 48 小时数据不稳定（新奇效应），同时监测 5 个以上指标需做 Bonferroni 或 FDR 校正。
- 卡页数字（本店 CTR 低于类目均值 1.2%、同类实验平均 +15%、每组 9,800 次曝光、运行 7 天、上线周期从 7 天到 2 天、年化 18 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Power-Analysis-Sample-Size.html、Skill-Power-Analysis-Sample-Size、Skill-STATE-Robust-Variance-Reduction.html、Skill-STATE-Robust-Variance-Reduction
- **延伸**：Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **可组合**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-CAR-Agent-Causal-Shapley.html、Skill-CAR-Agent-Causal-Shapley、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-MAS-Scale-Management.html、Skill-MAS-Scale-Management、Skill-Agentic-AB-Testing

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Agentic-AB-Testing`