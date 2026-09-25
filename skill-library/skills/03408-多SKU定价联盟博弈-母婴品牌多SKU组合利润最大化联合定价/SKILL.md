---
name: "p2s-mas-dynamic-pricing-coalition"
title: "MAS多SKU定价联盟博弈 — 母婴品牌多SKU组合利润最大化联合定价"
description: "触发词：多SKU联合定价、联盟博弈、组合利润最大化、交叉价格弹性、Shapley 值分配、价格护栏。何时不用：只调单个 SKU 价格用「Skill-UCB-LDP-Dynamic-Pricing」；跨平台广告预算分摊用「Skill-MAS-Ad-Budget-Multi-Platform-Negotiation」；多 Agent 共识机制用「Skill-MAS-Consensus-Mechanism」；要检测联盟稳定性与防背叛用「MAS-Pricing-Coalition-Stability」。安全边界：动态定价须透明展示价格变动理由，符合《电商平台商品价格管理规范》与《跨境电商商品信息披露要求》；方案须人工确认后才可对线上生效。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 价格敏感性"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-MAS-Dynamic-Pricing-Coalition"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把主机、配件、耗材等互相关联的 SKU 放在一起算联合定价，用联盟博弈公平分配整体利润，避免单品各自降价把品牌毛利做薄。"
user_try: "试试：用我吸奶器品牌近 3 个月各 SKU 的价格-销量数据，算一套多 SKU 联合定价方案，给出各 SKU 建议价、Shapley 值分配和整体利润提升量。"
whenToUse: "多个 SKU 价格互相牵制、单品独立定价反而损害整体毛利时用本技能（属「组合设计／价格敏感性」）；只优化单个 SKU 的动态价格用「Skill-UCB-LDP-Dynamic-Pricing」；跨平台广告预算在多 Agent 间分配用「Skill-MAS-Ad-Budget-Multi-Platform-Negotiation」；要检测联合体是否稳定、识别单边背叛用「MAS-Pricing-Coalition-Stability」；只做捆绑组合与感知价值设计用「心理账户捆绑定价心理学」。前置需至少 3 个月价格-销量数据与 SKU 间购买关联。"
workflow: "整理至少 3 个月各 SKU 历史价格-销量数据，标定基准需求、自身价格弹性与毛利率，为每个 SKU 建 SKUPricingAgent → 由 SKU 间购买关联分析估计交叉价格弹性矩阵，刻画配件降价对主机需求的影响 → 用 compute_demand_with_cross_effects 在给定价格组合下同时计算自身弹性与交叉效应后的各 SKU 需求 → 用 compute_coalition_profit 计算联盟与各子联盟的总利润，与独立定价基线对比 → 用 Shapley 值把联盟利润按边际贡献分配给各 SKU，输出联合定价方案与整体利润提升量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS多SKU定价联盟博弈 — 母婴品牌多SKU组合利润最大化联合定价

## ① 解决的问题

定价团队面临"多SKU独立定价损害整体毛利"——联盟博弈联合定价将整体利润提升8-15%，吸奶器品牌月GMV200万时年化增利190-360万元

## ② 核心算法逻辑

单SKU定价优化（最大化单品利润）会导致品牌内部竞争——配件过高价会降低主机销量，耗材降价会蚕食高价配件利润。联盟博弈解决这个矛盾。

## ③ 业务应用场景

| SKU | 品类 | 当前价 | 角色 | |-----|------|--------|------| | SKU-A | 主机（双边） | $189 | 流量入口 | | SKU-B | 主机（单边） | $129 | 中端主力 | | SKU-C | 配件套装 | $49 | 高毛利 | | SKU-D | 硅胶耗材 | $19 | 高频复购 | | SKU-E | 储奶袋 | $14 | 高频复购 |
- 业务问题：配件SKU-C降价10%可提升自身销量15%，但同时降低了主机价值感知，主机SKU-A销量下降5%。独立定价导致整体毛利反而降低 - 数据要求：各SKU历史价格-销量数据（至少3个月），SKU间购买关联分析 - 预期产出：联合定价方案 + Shapley值分配 + 联盟整体利润提升量 - 业务价值：联合定价比独立定价整体利润提升 8-15%，年化约 30-80万元（取决于品牌规模）
三轨验证 | 成本轨：系统部署成本月均3,200元（含云服务2,000元、模型调用1,200元），人工维护8小时/月，数据标注成本月均1,500元；首月初始化投入12,000元 | 合规轨：符合《电商平台商品价格管理规范》和《跨境电商商品信息披露要求》，动态定价需透明展示价格变动理由，符合母婴产品定价监管要求，结论：合规 | 风险轨：①定价过激导致消费者投诉率上升（概率15%），②多Agent协同决策延迟影响秒杀时段（概率8%），③竞品价格监测数据延迟1-2小时（概率12%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：以吸奶器品牌月GMV 200万元为例，联合定价提升利润8-15%，对应月增利润约 16-30万元；年化 190-360万元（取决于品牌SKU数量和交叉弹性强度）
理论保证：联盟博弈核（Core）非空时，任何子联盟单独定价都不能做得更好，即 不会有SKU因联合定价而亏损
实施难度：⭐⭐⭐⭐☆（需要历史价格-销量数据标定交叉弹性，3个月以上数据）
优先级：⭐⭐⭐⭐☆（中高优先，品牌SKU数≥3时效果显著）

## ⑦ 代码节选

本节的完整实现（164 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.09814，但该号在 arXiv 上是《Doppler-free three-photon spectroscopy on narrow-line optical transitions》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需各 SKU 历史价格-销量数据（卡页要求至少 3 个月）与 SKU 间购买关联分析结果；每个 SKU 需 sku_id、base_price（当前价）、base_demand（基准需求）、price_elasticity（自身价格弹性，小于 0）、margin_rate（毛利率，如卡页示例主机 $189／单边主机 $129／配件套装 $49／硅胶耗材 $19／储奶袋 $14 五档 SKU）；跨 SKU 需交叉弹性矩阵 cross_elasticity_matrix[i][j]（商品 i 需求对商品 j 价格的弹性）。SKU 数需不少于 3 个，卡页指出 SKU 数≥3 时效果显著。

**输出**：产出各 SKU 的联合定价方案、联盟整体利润与相对独立定价的提升量、以及按联盟贡献分配的 Shapley 值份额；供定价团队与品类负责人决策，并需给出价格变动理由以支撑平台合规披露。

## 执行步骤

1. 归集至少 3 个月各 SKU 价格-销量数据，标定基准需求、自身价格弹性与毛利率
2. 做 SKU 间购买关联分析，估计交叉价格弹性矩阵（如配件降价对主机需求的负向影响）
3. 为每个 SKU 建 SKUPricingAgent，用 compute_profit 计算单 SKU 在给定价格与需求调整下的利润
4. 用 compute_coalition_profit 在考虑交叉效应下枚举联盟与子联盟的总利润，与独立定价基线对比
5. 用 Shapley 值分配联盟利润，给出各 SKU 的联合定价方案与整体利润提升量
6. 输出定价方案与价格变动理由，供人工复核并按平台规范透明披露

## 边界与不做

- 数据不满足：各 SKU 历史价格-销量不足 3 个月、或缺少 SKU 间购买关联数据时无法标定交叉价格弹性，不要使用；SKU 数少于 3 个时联盟效应不显著，需先补齐数据与 SKU 范围，否则结论不可信。
- 何时不用：只优化单 SKU 价格用「Skill-UCB-LDP-Dynamic-Pricing」；跨平台广告预算分配用「Skill-MAS-Ad-Budget-Multi-Platform-Negotiation」；需要多 Agent 共识决策用「Skill-MAS-Consensus-Mechanism」；要检测联盟稳定性与防止单边背叛用「MAS-Pricing-Coalition-Stability」。
- 能力边界：本技能只输出联合定价方案、Shapley 值分配与利润测算，不直接改写线上价格、不接入平台改价接口，也不替代定价审批流程；实际调价与价格说明披露由模型外的确定性控制层或人工执行。
- 安全边界：需符合《电商平台商品价格管理规范》和《跨境电商商品信息披露要求》，动态定价必须透明展示价格变动理由并符合母婴产品定价监管；卡页风险轨提示定价过激会推高投诉率，方案须人工复核后放行。

## 技能关联

- **前置**：Skill-AgenticPay-Procurement-Negotiation.html、Skill-AgenticPay-Procurement-Negotiation、Skill-LLM-AutoBidding-MAS.html、Skill-LLM-AutoBidding-MAS、Skill-MAS-Ad-Budget-Multi-Platform-Negotiation.html、Skill-MAS-Ad-Budget-Multi-Platform-Negotiation、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-UCB-LDP-Dynamic-Pricing.html、Skill-UCB-LDP-Dynamic-Pricing
- **延伸**：Skill-AgenticPay-Procurement-Negotiation.html、Skill-AgenticPay-Procurement-Negotiation、Skill-LLM-AutoBidding-MAS.html、Skill-LLM-AutoBidding-MAS、Skill-MAS-Ad-Budget-Multi-Platform-Negotiation.html、Skill-MAS-Ad-Budget-Multi-Platform-Negotiation
- **可组合**：Skill-MAS-Ad-Budget-Multi-Platform-Negotiation.html、Skill-MAS-Ad-Budget-Multi-Platform-Negotiation、Skill-MAS-Dynamic-Pricing-Coalition

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：10-MAS　·　源卡：`Skill-MAS-Dynamic-Pricing-Coalition`