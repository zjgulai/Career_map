---
name: "p2s-mas-pricing-coalition-stability"
title: "MAS-Pricing-Coalition-Stability — 多SKU联合定价纳什均衡检测与联合体稳定性维持"
description: "触发词：联合定价稳定性、纳什均衡检测、背叛收益、Shapley 值分配、价格护栏、防价格战。何时不用：只需生成联合定价方案与利润分配用「MAS多SKU定价联盟博弈」；单 SKU 连续调价用「Skill-Dynamic-Pricing-RL-Controller」；多 Agent 补货/广告/客服编排用「多 Agent 电商运营自动化」；跨市场合规编排用「Skill-MAS-Compliance-Multi-Market-Orchestrator」。安全边界：符合 GB/T 41601-2022《跨境电商平台服务规范》，多 Agent 协同决策过程须可追溯；价格护栏与干预动作需人工确认后生效。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 价格敏感性"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-MAS-Pricing-Coalition-Stability"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "让同一套装里的几个 SKU 不再互相降价抢量：检测谁有背叛激励，用 Shapley 值公平分利并设最低价格护栏，把毛利率和价格波动拉回可控区间。"
user_try: "试试：用我婴儿喂养套装 4 个 SKU 的成本与价格数据，检测奶瓶是否有降价背叛激励，算 Shapley 值分配并给出最低价格护栏。"
whenToUse: "多 SKU 联合降价互相踩踏、需要检测联盟稳定性并设价格护栏时用本技能（属「组合设计／价格敏感性」，适合 3-8 个关联 SKU 的捆绑场景）；只需生成联合定价方案与利润分配用「MAS多SKU定价联盟博弈」；只做单 SKU 动态调价用「Skill-Dynamic-Pricing-RL-Controller」；要把补货/广告/客服做成多 Agent 编排用「多 Agent 电商运营自动化」；跨市场合规编排用「Skill-MAS-Compliance-Multi-Market-Orchestrator」。"
workflow: "为奶瓶、奶嘴、消毒器、喂养工具等关联 SKU 建 SKUPricingAgent，录入成本、当前价与最低/最高价格护栏 → 用 coalition_value 计算当前价格下联盟整体价值作为联合体基线 → 用 defect_profit 模拟单边降价背叛收益并与守约收益比较，判断是否触发稳定性干预 → 用 shapley_values 按各子集边际贡献加权平均，算出每个 SKU 的公平利润份额 → 用 check_coalition_stability 复核稳定性并设置最低价格护栏（如奶瓶成本×1.15），输出重分配后的定价与波动监控"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS-Pricing-Coalition-Stability — 多SKU联合定价纳什均衡检测与联合体稳定性维持

## ① 解决的问题

运营面临4个关联SKU各自为战频繁降价导致整体毛利率从22%跌至14%——Shapley值公平分配防止背叛激励，联合定价使毛利率回升至20%，年化GMV $500,000规模毛利保护$30,000

## ② 核心算法逻辑

论文：Coalitional Game Theory for MultiAgent Pricing | 年份：2022

## ③ 业务应用场景

场景：婴儿喂养套装4个SKU联合定价防价格战
- 背景：奶瓶+奶嘴+消毒器+喂养工具4个SKU独立定价Agent，各Agent追求自身GMV最大化，导致奶瓶Agent频繁降价引流，奶嘴Agent跟随降价，整体毛利率从22%→14%。 - 干预：检测到奶瓶Agent背叛收益(1.23) > 守约收益(0.98)，触发稳定性干预。Shapley值计算各SKU联合贡献后重新分配联合利润，设置奶瓶最低价格护栏（成本×1.15）。 - 结果：联合体稳定后，4个SKU整体毛利率回升至20%，单SKU价格波动从±18%收窄到±6%，Bundle套装转化率提升3.2pp。 - 业务价值：多SKU价格策略一致性提升，整体毛利率提升1-3pp，年化GMV $
三轨验证 | 成本轨：系统开发成本约12万元/年（含Agent算法优化4万元、数据标注人工成本6万元、云计算资源2万元），月均运维成本1500元，人工干预8小时/月；合规轨：符合《跨境电商平台服务规范》GB/T 41601-2022，多Agent协同决策过程可追溯，满足进出口商品备货合规要求，依据为平台备货数据需通过海关系统验证；风险轨：主要风险为库存预测偏差导致滞销或缺货（概率12%）、Agent决策异常导致超额备货（概率8%）、汇率波动影响成本准确性（概率15%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

价格波动降低：±18% → ±6%，提升消费者价格信任度，Bundle转化率+3.2pp
实施难度：⭐⭐⭐（Shapley计算指数复杂度，SKU数>10需近似算法）
优先级：⭐⭐⭐（适合有3-8个关联SKU的捆绑销售场景）
扩展方向：SKU数>8时用近似Shapley（采样版）替换精确计算

## ⑦ 代码节选

本节的完整实现（132 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2203.07467，但该号在 arXiv 上是《Current-driven Langmuir Oscillations and Streaming Instabilities》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Coalitional Game Theory for MultiAgent Pricing》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需 3-8 个关联 SKU 的定价数据：每个 SKU 的 sku_id、成本 cost、当前价格 current_price、最低价格护栏 min_price（代码默认成本×1.1，卡页场景中奶瓶取成本×1.15）、最高价格护栏 max_price（市场接受上限），以及日需求函数 demand(price)（可由价格-销量历史标定）；另需背叛情景参数 discount_ratio（默认 0.90，即单边降价 10%）。SKU 数超过 10 时精确 Shapley 指数复杂度不可行，超过 8 需改用近似（采样）算法。

**输出**：产出联盟稳定性检测结果（合作收益、背叛收益与是否触发干预）、各 SKU 的 Shapley 值公平利润份额、重分配后的联合定价与最低价格护栏，以及单 SKU 价格波动监控口径；供定价与品类运营决策，并用于跟踪 Bundle 套装转化与价格信任度。

## 执行步骤

1. 为奶瓶、奶嘴、消毒器、喂养工具等关联 SKU 建 SKUPricingAgent，录入成本、当前价与最低/最高价格护栏
2. 用 coalition_value 计算当前价格下的联盟整体价值作为基线
3. 用 defect_profit 计算单边降价（如 0.90 倍）的背叛收益，与守约收益对比，判断是否触发稳定性干预
4. 用 shapley_values 枚举不含该 SKU 的各规模子集，按边际贡献加权平均算出每个 SKU 的公平利润份额
5. 用 check_coalition_stability 复核联盟稳定性，为易背叛 SKU 设置最低价格护栏（如成本×1.15）
6. 输出重分配后的定价与护栏，并持续监控单 SKU 价格波动与 Bundle 套装转化

## 边界与不做

- 数据不满足：缺少各 SKU 成本、价格护栏或可用于标定 demand(price) 的价格-销量历史时不要使用，先补齐；SKU 数超过 8 时精确 Shapley 计算不可行，需先切换采样近似算法，否则分配结果不可用。
- 何时不用：只需生成联合定价方案与利润分配用「MAS多SKU定价联盟博弈」；只做单 SKU 动态调价用「Skill-Dynamic-Pricing-RL-Controller」；要编排补货/广告/客服执行动作走「多 Agent 电商运营自动化」；跨市场合规编排用「Skill-MAS-Compliance-Multi-Market-Orchestrator」。
- 能力边界：本技能只做联盟博弈建模、稳定性检测与利润分配测算，不直接改写线上价格、不接入平台改价接口，也不保证核（Core）非空之外的收益结论；价格护栏与稳定性干预由模型外的确定性控制层或人工执行。
- 安全边界：需符合 GB/T 41601-2022《跨境电商平台服务规范》，多 Agent 协同决策过程可追溯；卡页风险轨提示库存预测偏差（概率 12%）、Agent 决策异常（8%）与汇率波动（15%），护栏参数须人工确认后方可生效。

## 技能关联

- **前置**：Skill-Dynamic-Pricing-RL-Controller、Skill-MAS-Compliance-Multi-Market-Orchestrator.html、Skill-MAS-Compliance-Multi-Market-Orchestrator、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-MAS-Inventory-Consensus-Action.html、Skill-MAS-Inventory-Consensus-Action、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI
- **延伸**：Skill-MAS-Compliance-Multi-Market-Orchestrator.html、Skill-MAS-Compliance-Multi-Market-Orchestrator、Skill-MAS-Inventory-Consensus-Action.html、Skill-MAS-Inventory-Consensus-Action、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI
- **可组合**：Skill-MAS-Compliance-Multi-Market-Orchestrator.html、Skill-MAS-Compliance-Multi-Market-Orchestrator、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-MAS-Pricing-Coalition-Stability

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：10-MAS　·　源卡：`Skill-MAS-Pricing-Coalition-Stability`