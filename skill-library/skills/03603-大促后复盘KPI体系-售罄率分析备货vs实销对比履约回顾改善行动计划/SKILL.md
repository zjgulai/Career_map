---
name: "p2s-postpromo-retrospective-kpi"
title: "大促后复盘KPI体系 — 售罄率分析/备货vs实销对比/履约回顾/改善行动计划"
description: "触发词：大促复盘、售罄率分析、备货对比实销、履约回顾、改善行动计划、大促后补货。何时不用：大促前备货盘点用「Skill-Pre-Promo-Stocktaking-KPI」；大促中实时决策用「Skill-InPromo-Realtime-Decision-KPI」；预测偏差成因校正用「Skill-Forecast-Bias-Adjustment-Detection」；尾货清仓用「Skill-Long-Tail-SKU-Clearance-Optimization」。安全边界：须符合亚马逊 FBA 补货政策与《跨境电商商品质量管理规范》，进口奶粉等品类需建立产品追溯以满足海关备案；复盘结论需人工复核后再下发备货与清仓动作。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-064"
l3_business: "经营复盘"
l3_all: "经营复盘 / 需求预测"
l1_l2_l3: "业务运营/渠道经营/经营复盘"
p2s_card_id: "Skill-PostPromo-Retrospective-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促后用售罄率、备货对比实销、物流履约、行动计划四个维度做系统复盘，把这次的结果变成下次备货的准确动作，不再每年重复同样的错误。"
user_try: "试试：拿我 Prime Day 各 SKU 的备货量、实际销量、剩余库存和发货及时率，出一份四维复盘报告，并列出下次备货的改善行动。"
whenToUse: "大促结束要做系统性复盘、把结果转成下次备货行动时用本技能（属「经营复盘」）；大促前备货盘点用「Skill-Pre-Promo-Stocktaking-KPI」；大促中实时决策用「Skill-InPromo-Realtime-Decision-KPI」；只做预测偏差检测与成因校正用「Skill-Forecast-Bias-Adjustment-Detection」；滞销尾货清仓用「Skill-Long-Tail-SKU-Clearance-Optimization」；本卡只做事后复盘与改善行动，不产出下一次大促的销量预测模型。"
workflow: "汇总大促结果数据（备货量、实际销售、剩余库存、预测与计划量、物流履约），逐 SKU 建 PromoOutcome → 用 sellthrough_analysis 计算售罄率并按分级标准判档（≥90% 爆款、60-90% 健康、40-60% 偏低、<40% 积压），绑定对应动作 → 计算大促后剩余库存可支撑天数，对售罄率 >90% 的 SKU 用大促后日销倍数（通常 1.3-1.8 倍）判断紧急补货量 → 拆解备货准确率，把偏差归因到预测误差与执行误差，定位要改的是预测模型还是执行 → 回顾发货及时率、ODR 与物流成本预算，形成改善行动计划并跟踪下次大促效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 大促后复盘KPI体系 — 售罄率分析/备货vs实销对比/履约回顾/改善行动计划

## ① 解决的问题

大促后总结会浮于表面每年重复相同错误——四维系统化复盘（售罄率分级/备货准确率归因/物流履约回顾/改善行动追踪），建立数字化学习飞轮下次大促准确率提升15%

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：书中专章阐述大促后复盘的"系统性方法论"——不是简单地看"卖了多少"，而是要从售罄率、备货vs实销对比、物流履约回顾、改善行动计划四个维度系统化学习，为下一次大促提供数据支撑。书中特别指出：大促后的日销可能因为爆品售罄而面临断货风险（高售罄率反而是新的问题！）。

## ③ 业务应用场景

- 业务问题：某卖家Prime Day后开总结会，运营觉得"卖得不错"，但没有系统数据支撑，相同的问题每年重复 - 四维复盘应用： 1. 售罄率分析：吸奶器98%（爆款！下次+50%备货）；温奶器42%（严重积压→启动清仓） 2. 备货vs实销：预测误差24%（偏低），执行误差8%（轻微）→重点改善预测模型 3. 物流履约：发货及时率94%（Prime Day前20小时跌至65%→人力不足）；ODR 1.3%（接近红线） 4. 行动计划：①吸奶器提升预测×1.5；②温奶器启动清仓；③下次大促提前1周招临时工；④优化包装降低ODR - 预期产出：通过系统化复盘建立"数字记忆"，下次大促准确率提升
- 业务问题：Prime Day结束，吸奶器售罄率98%，剩余库存只够3天日销，需要决策是否空运补货 - 书中框架：售罄率>90%的SKU，大促后立即计算"大促后日销倍数"（大促后日销通常是大促前的1.3-1.8倍），基于此倍数决策紧急补货量
三轨验证 | 成本轨：FBA备货优化系统月均成本3200元（云服务800元+数据分析人工2400元/月，约12小时），缺货率从12%降至3%，年化库存成本节省45万元，ROI达1400% | 合规轨：符合亚马逊FBA补货政策、符合《跨境电商商品质量管理规范》，需建立产品追溯体系满足进口奶粉备案要求，依据：海关总署2023年进口乳制品监管规定 | 风险轨：①供应链中断风险（概率15%）导致备货计划失效；②预测模型偏差风险（概率20%）造成过度或不足备货；③汇率波动风险（概率25%）影响成本控制；④产品质量风险（概率8%）导致退货率上升

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：系统化复盘使下次大促备货准确率提升15%，以Prime Day GMV$20万为例，准确率提升=减少$2万积压+减少$1.5万缺货损失；系统$1.5万，ROI>230%
实施难度：⭐⭐☆☆☆（数据全来自大促结果，主要是建立系统化分析流程和行动追踪机制）
优先级：⭐⭐⭐⭐⭐（书中专章，每次大促都是宝贵的学习机会，但90%的团队复盘浮于表面，系统化复盘是竞争壁垒）
适用规模：所有参与主要大促的卖家
数据依赖：大促前备货量、大促期间分时销售数据、物流履约数据（已在大促中收集）

## ⑦ 代码节选

本节的完整实现（234 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.08985，但该号在 arXiv 上是《Analysis and prediction of changes in the temperature of the pure freshwater ice column in the Antarctic and the Arctic》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需 SKU 级大促结果数据，每个 SKU 含：sku_id、abc_class、大促前备货量 pre_promo_stock、大促实际销售 promo_actual_sales、大促后剩余库存 post_promo_stock、大促前预测销售 pre_promo_forecast、计划备货量 planned_units、单位毛利 unit_margin；物流维度需发货及时率 dispatch_on_time_rate、订单缺陷率 ODR、实际物流成本与预算；还需大促后日均销量 post_promo_daily_sales 以计算剩余库存可支撑天数。数据全部来自大促前备货量、大促期间分时销售与物流履约记录，无需额外采集。

**输出**：产出单 SKU 的售罄率及其分级（爆款／健康／偏低／积压）与对应动作建议（爆款下次备货×1.5、偏低下次减少 20% 备货、积压立即清仓）、剩余库存可支撑天数、备货准确率的预测误差与执行误差归因、物流履约回顾指标，以及改善行动计划清单；供运营与供应链在大促复盘会与下一次备货计划中使用。

## 执行步骤

1. 汇集大促前备货量、大促期间分时销售、剩余库存、预测与计划量及物流履约数据，逐 SKU 建立 PromoOutcome 记录
2. 用 sellthrough_analysis 算出售罄率，按分级标准判档（爆款／健康／偏低／积压）并取出对应动作建议
3. 计算大促后剩余库存可支撑天数（剩余库存 ÷ 大促后日均销量），识别爆品断货风险
4. 对售罄率 >90% 的 SKU 计算大促后日销倍数（通常为大促前的 1.3-1.8 倍），据此确定紧急补货量
5. 把备货偏差拆分为预测误差与执行误差，判断该改预测模型还是该改执行
6. 回顾发货及时率、ODR 与物流成本，输出改善行动计划并跟踪下次大促的准确率

## 边界与不做

- 数据不满足：缺少大促前备货量、大促期间分时销售、大促后日均销量或物流履约数据（发货及时率、ODR）时不要复盘，先补齐卡页列出的数据依赖；没有大促后日均销量就无法判断剩余库存可支撑天数与断货风险。
- 何时不用：大促前备货盘点用「Skill-Pre-Promo-Stocktaking-KPI」；大促中实时决策用「Skill-InPromo-Realtime-Decision-KPI」；只做预测偏差检测用「Skill-Forecast-Bias-Adjustment-Detection」；滞销尾货清仓方案用「Skill-Long-Tail-SKU-Clearance-Optimization」。
- 能力边界：本技能只做四维事后复盘、分级判档与改善行动建议，不产出下一次大促的销量预测模型，也不执行实际补货、清仓或招聘动作；备货与清仓指令由模型外的确定性控制层或人工执行。注意高售罄率并非纯好事——卡页指出大促后日销可能因爆品售罄而断货，需据此评估紧急补货。
- 安全边界：符合亚马逊 FBA 补货政策与《跨境电商商品质量管理规范》，进口奶粉等品类需建立产品追溯体系以满足海关总署进口乳制品监管要求；ODR 接近红线（卡页示例 1.3%）时应优先处置，复盘结论需人工复核后再下发。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-InPromo-Realtime-Decision-KPI.html、Skill-InPromo-Realtime-Decision-KPI、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-PostPromo-Retrospective-KPI

---

> 分类：业务运营/渠道经营/经营复盘　·　技术族：04-供应链　·　源卡：`Skill-PostPromo-Retrospective-KPI`