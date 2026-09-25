---
name: "p2s-mental-accounting-bundle-psychology"
title: "心理账户捆绑定价心理学 — 识别同一心智账户商品组合使 AOV 提升22%"
description: "触发词：心理账户、捆绑组合设计、捆绑定价、WTP 估计、AOV 提升、跨账户失败识别。何时不用：只估价格弹性用「Skill-Price-Elasticity-Estimation」；设计锚点价格用「Skill-Anchoring-Effect-Pricing-Optimization」；设计促销损失厌恶用「Skill-Loss-Aversion-Promotion-Design」；多 SKU 联合定价与利润分利用「MAS多SKU定价联盟博弈」。安全边界：需符合《反垄断法》第十七条与《电子商务法》第三十九条，价格差异须基于成本差异或市场条件并披露定价逻辑；建议设置 24 小时价格锁定以降低投诉舆情。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 价格敏感性"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-Mental-Accounting-Bundle-Psychology"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "识别哪些商品属于同一个心理账户、该放进同一个捆绑套装，并给出最优捆绑组合和定价，避免跨账户硬捆把转化做低。"
user_try: "试试：拿我店里洗发水、沐浴露、润肤乳三个单品的销量数据，判断它们是否同属一个心理账户，并给出最优捆绑组合和定价。"
whenToUse: "要判断哪些商品能放进同一个捆绑套装（是否同一心理账户）并据此定价时用本技能（属「组合设计／价格敏感性」）；只估单品价格-销量弹性用「Skill-Price-Elasticity-Estimation」；设计锚点价格结构用「Skill-Anchoring-Effect-Pricing-Optimization」；设计促销损失厌恶机制用「Skill-Loss-Aversion-Promotion-Design」；多 SKU 联合定价与联盟利润分利用「MAS多SKU定价联盟博弈」。前置需有 WTP 估计与共现购买数据。"
workflow: "用 WTP 调研（50-100 人）或历史数据估计各单品 WTP 分布与成本，按同账户正相关、跨账户弱负相关建模 → 用共现购买分析验证商品的心理账户归属，确认哪些商品确实同属一个账户 → 用混合整数规划在账户内枚举组合，求最优捆绑组合与捆绑价格 → 对比纯捆绑与混合捆绑的感知价值，校准折扣区间（卡页建议 10-18%） → 用捆绑页 A/B（各 2,000 UV）验证 AOV 与捆绑购买率，达标后放量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 心理账户捆绑定价心理学 — 识别同一心智账户商品组合使 AOV 提升22%

## ① 解决的问题

产品运营面临"捆绑套装卖得比单品加起来还贵但有时反而转化率更低"——心理账户同账户识别让捆绑感知价值提升，AOV提升22%，年化$6.4万

## ② 核心算法逻辑

心理账户（Mental Accounting）：消费者在心智中将支出归类到不同「账户」（如「婴儿安全账户」「节省开销账户」），同一账户内的支出合并计算，不同账户之间有心理隔离。

## ③ 业务应用场景

场景A：婴儿洗浴套装捆绑（同一「洗护账户」） - 业务问题：洗发水单独售价 $8.99，沐浴露 $7.99，各自转化率 2.3% / 1.8% - 发现：消费者将「洗发 + 沐浴 + 润肤」归入同一「婴儿日常护理」心理账户 - 方案：三件捆绑定价 $22.99（vs 分别购买 $24.97），主打「一次搞定」 - 数据要求：各单品 WTP 调查（50-100 人），捆绑 A/B 各 2,000 UV - 预期产出：AOV 从 $9.5 → $22.99，捆绑购买率 32% - 业务价值：AOV 提升 142%，即使购买频次降低仍 AOV +22%，年化贡献 $6.4 万
场景B：反直觉案例——跨账户捆绑失败 - 错误捆绑：婴儿奶粉 + 婴儿床垫（分属「喂养」和「睡眠安全」账户） - 结果：转化率下降 15%，消费者认为「两件事一起决策」压力大 - 正确做法：先做账户识别，再决定捆绑范围
**三轨验证** | 成本轨：心理账户分层定价系统开发成本约12000元/月（含算法工程师0.5人月、数据分析2人天/周），运维成本3000元/月，总计15000元/月；ROI周期2-3个月（基于GMV+23%增长） | 合规轨：符合《反垄断法》第十七条（不属于滥用市场支配地位），符合《电子商务法》第三十九条（价格差异需基于成本差异或市场条件），需在平台规则中披露动态定价逻辑；结论：合规可行，需建立价格透明度机制 | 风险轨：消费者投诉风险（概率25%）—— 因价格波动引发舆情，建议设置24小时价格锁定；平台风险（概率15%）—— 违反平台动态定价规范被扣分，需提前报备；法律风险（概率8%）—

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：混合捆绑策略使洗护/喂养品类 AOV 从 $9.5 提升至 $12.2（+28%），同口径月订单 5,000 单，年化增量收入 $6.4 万
实施难度：⭐⭐⭐☆☆（需要 WTP 调研或 A/B 测试数据，捆绑页面设计需支持混合捆绑选项）
优先级：⭐⭐⭐⭐☆（AOV 提升是 LTV 最快增量杠杆之一，适合 SKU 数量适中的品牌）
适用条件：单品 WTP 可通过历史数据或调研估计；账户归属通过共现购买分析验证
关键指标：捆绑转化率 > 15%（否则纯捆绑可能抑制转化）；混合捆绑折扣控制在 10-18%

## ⑦ 代码节选

本节的完整实现（173 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.09268，但该号在 arXiv 上是《A Shuffling Theorem for Reflectively Symmetric Tilings》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需各单品 WTP 数据（卡页要求 50-100 人调研，或由历史数据估计）与单品成本；商品需标注所属心理账户（如「洗护」「喂养」），账户归属须用共现购买分析验证；A/B 验证需捆绑落地页各 2,000 UV 流量。建模侧可参照卡页代码模板：1000 个模拟消费者、6 款母婴商品归属 2 个账户、同账户内 WTP 正相关（ρ=0.4）、跨账户弱负相关（ρ=负 0.1）。

**输出**：产出账户归属识别结果、最优捆绑组合与捆绑定价（区分纯捆绑与混合捆绑）、感知价值对比以及 AOV 与捆绑转化率预估；供商品运营与页面设计落地捆绑选项，并给出折扣区间与关键指标预警口径（捆绑转化率需高于 15%）。

## 执行步骤

1. 收集各单品 WTP 调研问卷（50-100 人）或用历史购买数据估计 WTP 分布与单品成本
2. 用共现购买分析验证商品的「心理账户」归属，确认是否同属「洗护」「喂养」等账户
3. 用混合整数规划在账户内枚举组合，搜索最优捆绑组合与捆绑定价
4. 对比纯捆绑与混合捆绑的感知价值，把折扣控制在建议区间并检查 AOV 变化
5. 在捆绑落地页做 A/B 实验（各 2,000 UV），记录捆绑购买率与转化率
6. 以捆绑转化率是否高于 15%、AOV 是否提升作为放量判据，输出可复制的捆绑方案

## 边界与不做

- 数据不满足：没有单品 WTP 估计（调研或历史数据）或捆绑页 A/B 流量（各约 2,000 UV）时不要直接定捆绑价，先补 WTP 估计；账户归属无共现购买数据支撑时只能给假设，不能当作结论。
- 何时不用：只估单项价格弹性用「Skill-Price-Elasticity-Estimation」；设计锚点价格用「Skill-Anchoring-Effect-Pricing-Optimization」；设计促销损失厌恶用「Skill-Loss-Aversion-Promotion-Design」；多 SKU 联合定价与利润分利用「MAS多SKU定价联盟博弈」。
- 能力边界：本技能只输出账户归属、捆绑组合与定价建议及感知价值对比，不做线上改价、页面搭建与投放执行；卡页明确指出跨账户捆绑（如奶粉+婴儿床垫）会使转化率下降约 15%，必须先做账户识别再决定捆绑范围，不得跳过验证直接放量。
- 安全边界：需符合《反垄断法》第十七条与《电子商务法》第三十九条，价格差异须基于成本差异或市场条件并披露动态定价逻辑；卡页风险轨提示消费者投诉（概率 25%）、平台规则（15%）与法律（8%）风险，建议设置 24 小时价格锁定并提前报备平台规则。

## 技能关联

- **前置**：Skill-Anchoring-Effect-Pricing-Optimization.html、Skill-Anchoring-Effect-Pricing-Optimization、Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Loss-Aversion-Promotion-Design.html、Skill-Loss-Aversion-Promotion-Design、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation
- **延伸**：Skill-Anchoring-Effect-Pricing-Optimization.html、Skill-Anchoring-Effect-Pricing-Optimization、Skill-Loss-Aversion-Promotion-Design.html、Skill-Loss-Aversion-Promotion-Design
- **可组合**：Skill-Loss-Aversion-Promotion-Design.html、Skill-Loss-Aversion-Promotion-Design、Skill-Mental-Accounting-Bundle-Psychology

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：17-价格优化　·　源卡：`Skill-Mental-Accounting-Bundle-Psychology`