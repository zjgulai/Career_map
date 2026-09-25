---
name: "p2s-montecarlo-tariff-risk"
title: "蒙特卡洛地缘政治尾部风险量化 (Monte Carlo Tariff Risk)"
description: "触发词：蒙特卡洛、关税突变、尾部风险、CVaR、伪高利润。何时不用：常规中断情景压力测试用「供应链弹性压力测试」；要绑定封号断供预案用「黑天鹅情景模拟标签」。安全边界：概率分布假设必须显式记录并定期复核，不得以单点最坏值替代分布结论对外决策。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-010"
l3_business: "情景模拟"
l3_all: "情景模拟 / 经济性分析"
l1_l2_l3: "经营管理/经营与组织/情景模拟"
p2s_card_id: "Skill-MonteCarlo-Tariff-Risk"
p2s_src_domain: "21-合规决策"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "把关税突变、海运封锁这类尾部风险跑成概率分布，看清最坏 5% 情景下这个 SKU 到底赚还是亏。"
user_try: "试试：帮我对这款 45% 利润率的婴儿监控器跑蒙特卡洛，算关税突变和海运封锁下的 CVaR。"
whenToUse: "当某个高毛利 SKU 的利润容易被政策与物流尾部事件吞掉、需要在选品阶段就量化尾部风险时用本技能；常规中断情景与备用路由用「供应链弹性压力测试」；要绑定封号或断供预案用「黑天鹅情景模拟标签」。"
workflow: "设定关税突变与海运封锁等情景及其概率分布 → 按 SKU 利润率与成本结构做蒙特卡洛抽样 → 计算尾部 CVaR 与最坏 5% 情景下的净亏损 → 对照全品类利润承受力给出放行或否决结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 蒙特卡洛地缘政治尾部风险量化 (Monte Carlo Tariff Risk)

## ① 解决的问题

选品团队发现一款利润率45%的婴儿监控器诱惑巨大——引入蒙特卡洛模拟量化301关税突变与海运封锁的尾部风险(CVaR)，在最坏5%场景下该SKU净亏损将吞噬全品类18个月利润，CEO反直觉否决了"伪高利润"的糖衣炮弹，6个月后关税突变，我方毫发无损。

## ② 核心算法逻辑

Skill Card: 蒙特卡洛地缘政治尾部风险量化 (Monte Carlo Tariff Risk)

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：避免一次地缘黑天鹅事件，可挽救数十万至百万级美元的库存损失。
实施难度：★★★☆☆ (概率分布建模为主)
优先级评分：★★★★★
评估依据：一次成功的尾部风险规避 > 100 次成功的日常优化。

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（255 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：SKU 的利润率与成本结构、关税与海运相关的政策情景及概率分布假设，以及业务可承受的亏损口径。

**输出**：尾部风险量化结果（CVaR 与最坏 5% 情景净亏损）与选品结论；供选品与财务决策层使用。

## 执行步骤

1. 设定关税突变与海运封锁等情景及其概率分布
2. 按 SKU 利润率与成本结构做蒙特卡洛抽样
3. 计算尾部 CVaR 与最坏 5% 情景下的净亏损
4. 对照全品类利润承受力给出放行或否决结论

## 边界与不做

- 数据不满足：概率分布假设没有依据（无政策或物流历史口径）时结论不可用，先补充参数来源说明。
- 何时不用：常规中断压力测试用「供应链弹性压力测试」；要量化封号断供预案用「黑天鹅情景模拟标签」；只需单点敏感性分析不必上蒙特卡洛。
- 能力边界：只做风险量化与结论建议，不执行选品下架或采购动作，也不预测政策何时发生。
- 安全边界：概率分布假设必须显式记录并定期复核，不得以单点最坏值替代分布结论对外决策。

## 技能关联

- **前置**：Skill-Cross-Border-Tax-Tariff-Modeling.html、Skill-Cross-Border-Tax-Tariff-Modeling、Skill-Supply-Chain-Finance-Risk-Modeling.html、Skill-Supply-Chain-Finance-Risk-Modeling、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics、Skill-Tariff-Impact-Margin-Stress-Test.html、Skill-Tariff-Impact-Margin-Stress-Test、Skill-Tax-Compliance-VAT-GST.html、Skill-Tax-Compliance-VAT-GST
- **延伸**：Skill-Supply-Chain-Finance-Risk-Modeling.html、Skill-Supply-Chain-Finance-Risk-Modeling、Skill-Tariff-Impact-Margin-Stress-Test.html、Skill-Tariff-Impact-Margin-Stress-Test、Skill-Tax-Compliance-VAT-GST.html、Skill-Tax-Compliance-VAT-GST
- **可组合**：Skill-Supply-Chain-Finance-Risk-Modeling.html、Skill-Supply-Chain-Finance-Risk-Modeling、Skill-Tax-Compliance-VAT-GST.html、Skill-Tax-Compliance-VAT-GST、Skill-MonteCarlo-Tariff-Risk

---

> 分类：经营管理/经营与组织/情景模拟　·　技术族：21-合规决策　·　源卡：`Skill-MonteCarlo-Tariff-Risk`