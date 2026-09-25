---
name: "p2s-counterfactual-price-elasticity"
title: "反事实动态价格弹性测算 (Counterfactual Price Elasticity via DML)"
description: "触发词：反事实弹性、涨价影响测算、弹性偏差修正、折扣损耗、因果弹性、定价复盘。何时不用：要用工具变量处理内生性时用「工具变量 IV 识别价格弹性」；要输出人群级差异效应用于投放时用「因果森林异质处理效应」。安全边界：弹性估计属内部分析产物，不得据单一估计值自动改价或形成价格歧视，最终价格决策需人工复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 因果局限审查"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Counterfactual-Price-Elasticity"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "涨价前先算清会走掉多少人：用反事实方法估出真实弹性，把定价从跟价猜测变成可推演的因果结论。"
whenToUse: "当需要判断一次涨价或降价的反事实影响、且历史价格数据存在明显内生性时用本技能；若手上有可用工具变量要做两阶段估计，用「工具变量 IV 识别价格弹性」；若要按用户子群看差异效应，用「因果森林异质处理效应」。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 反事实动态价格弹性测算 (Counterfactual Price Elasticity via DML)

## ① 解决的问题

定价分析师面临涨价影响估不准——反事实弹性将收入损失率从11%降到4%，年化增利22万元

## ② 核心算法逻辑

Skill Card: 反事实动态价格弹性测算 (Counterfactual Price Elasticity via DML)

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：告别盲目跟价，年化节省 10%-15% 的无效折扣损耗。
实施难度：★★★★☆ (需要构建规整的特征工程，对数据科学基建要求高)
优先级评分：★★★★★ (红海时代的绝对护城河算法)
评估依据：该算法将定价权从“平台/竞品逼迫”手中夺回，转交给了“数据推演的绝对确定性”，是存量博弈中利润最大化的顶级战略。

## ⑦ 代码节选

（卡页此段未附代码；源站声明有 0 个代码块并记录位置 `paper2skills-code/pricing/counterfactual_price_elasticity`，但**该代码树不在本包内**，本包未附带。）

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1608.00060，但该号在 arXiv 上是《Double/Debiased Machine Learning for Treatment and Causal Parameters》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：本品历史价格与销量序列，以及能支撑反事实构造的对照变量；卡页标注需要构建规整的特征工程，对数据科学基建要求较高，粒度按 SKU 的价格-销量面板组织。

**输出**：对真实价格弹性的反事实估计及其定价含义（涨价/降价影响的量化结论），用于定价策略判断；完整实现与输出格式以原始卡片的代码模板为准。

## 执行步骤

1. 整理本品历史价格与销量记录，并按反事实方法的要求构建规整特征工程
2. 以反事实（DML）框架估计价格对销量的因果效应，得到去偏弹性
3. 对照现行折扣与跟价策略复盘，量化涨价或降价的反事实影响
4. 输出弹性结论与定价建议，交由人工复核后再进入策略

## 边界与不做

- 数据不满足：特征工程不规整、缺少可构造反事实的对照信息时估计不可靠，卡页标注本技能对数据科学基建要求高。
- 何时不用：有可用工具变量时用「工具变量 IV 识别价格弹性」；需要人群级效应用于精准投放时用「因果森林异质处理效应」。
- 能力边界：只给弹性的因果估计与策略含义，不含自动改价，也不负责补齐混淆变量缺失带来的偏差。
- 安全边界：估计值仅用于内部分析，不得据单一估计自动改价或形成价格歧视。

## 技能关联

- **前置**：Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation
- **延伸**：Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity
- **可组合**：Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Counterfactual-Price-Elasticity

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Counterfactual-Price-Elasticity`