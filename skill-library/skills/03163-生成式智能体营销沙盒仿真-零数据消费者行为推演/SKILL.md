---
name: "p2s-generative-agent-simulation"
title: "生成式智能体营销沙盒仿真 - 零数据消费者行为推演"
description: "触发词：生成式智能体、沙盒仿真、零数据推演、口碑传播、会员政策。何时不用：有数据可直接做 A/B 实验时用实验类技能；多情景参数对比用「供应链 What-If 情景分析引擎」。安全边界：仿真不替代上线后的真实 A/B 实验；涉及个人信息的使用须满足告知与授权要求。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-010"
l3_business: "情景模拟"
l3_all: "情景模拟 / 会员活动"
l1_l2_l3: "经营管理/经营与组织/情景模拟"
p2s_card_id: "Skill-Generative-Agent-Simulation"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "没有历史数据时，先造一批虚拟用户跑沙盒，预演会员政策或折扣方案上线后会怎样。"
user_try: "试试：新品推车要上会员专属 8 折，先造 500 个虚拟用户跑 14 天沙盒，对比全渠道 7 折方案。"
whenToUse: "当策略改动牵涉全站逻辑、无历史数据、A/B 测试也做不了、需要上线前预判时用本技能；有数据可直接实验时用实验类技能；多情景参数对比用「供应链 What-If 情景分析引擎」。"
workflow: "构建虚拟用户 Agent 群体并初始化数字钱包与 Persona 参数 → 按方案分组（对照组与处理组）注入营销事件 → 分别运行设定天数的仿真 → 比较各组访客、营收与口碑传播差异并给出方案建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 生成式智能体营销沙盒仿真 - 零数据消费者行为推演

## ① 解决的问题

某母婴 DTC 独立站准备从纯打折升级为"付费会员制（年费 $49 免邮 + 专属抢购）"

## ② 核心算法逻辑

在产品发售前或营销活动上线前，传统方法（规则 ABM 或事后统计）无法捕捉真实人类社会的复杂性——冲动消费、品牌偏好、朋友间口碑传播。本 Skill 将斯坦福生成式智能体框架首次落地到消费者营销领域：在虚拟商业沙盒（Virtual Town）里，创建数百个拥有不同 Persona 的 LLM Agent，注入资源约束（预算/时间/精力）和社会记忆（品牌历史体验、口碑），然后向沙盒投放营销事件，观察一周内 Agent 的涌现行为。不写一行

## ③ 业务应用场景

- 业务问题：某母婴 DTC 独立站准备从纯打折升级为"付费会员制（年费 $49 免邮 + 专属抢购）"。牵涉整个网站底层逻辑，连 A/B 测试都无法做。无历史数据，无法用 XGBoost 或 LTV 模型预测上线 3 个月后的财务表现和用户口碑。 - 数据要求：用户 Persona 分布（价格敏感型/速度敏感型比例）+ 历史客单价分布 + 社交关系（可用平台粉丝关系近似） - 仿真流程： 1. 构建 1000 个虚拟宝妈 Agent，初始化数字钱包和 Persona 参数 2. 向沙盒注入"VIP 会员政策上线"事件（event_type='membership'，reach_rate=0.
- 业务问题：新品婴儿推车上市，计划对比"全渠道 7 折"与"会员专属 8 折 + 提前抢购"两套方案，但新品没有历史数据，无法跑真实 A/B 实验。 - 数据要求：竞品定价、目标用户 Persona 比例（可从 CRM 历史订单估算）、社交平台 KOL 覆盖率（作为 reach_rate 参数） - 仿真流程： 1. 构建 Control（无干预）/ Treatment-A（7 折折扣）/ Treatment-B（会员专属）三组沙盒 2. 分别运行 14 天仿真，每组 500 个 Agent 3. 比较三组的访客提升率、营收变化、口碑 WOM 传播量 - 预期产出：最优方案建议 + 方案间的
三轨验证 | 成本轨：月均成本3,200元（AI模型调用费1,500元/月、数据存储200元/月、人工标注8小时/月×200元/小时=1,600元/月），ROI周期2.1个月（LTV增长35万÷成本3.2万年化） | 合规轨：符合《个人信息保护法》第二十四条（个性化推荐需告知），需获得用户明示同意进行流失预测分析，建议在APP隐私政策中明确说明预警机制，合规结论：可实施，需补充用户授权条款 | 风险轨：数据泄露风险（概率8%，涉及母婴用户敏感信息）、模型偏差风险（概率12%，少数民族地区用户行为差异导致预测不准）、过度干预投诉风险（概率15%，频繁推送引发用户反感）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

零历史数据即可运行，填补新品冷启动预测空白
口碑传播仿真可提前识别"群体性反感"风险（如 $49 会员门槛）
沙盒成本（API 费用）vs. 策略失误损失比约 1:10000
适用阶段：战略规划期（上线前 1-3 个月）；不替代上线后的真实 A/B 实验与数据分析

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（34 行）。**下面 34 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **34 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，34 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/generative_agent_simulation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Generative-Agent-Simulation.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import (
    create_agents, create_venues,
    MarketingEvent, MarketingSandbox, SimulationAnalyzer
)

# 1. 构建虚拟消费者群体（500 个 Agent，4 种 Persona）
agents = create_agents(n=500, seed=42)
venues = create_venues()  # 4 个商业场所（咖啡馆/快餐/家庭餐厅）

# 2. 定义营销事件（折扣促销）
event = MarketingEvent(
    brand="麦脆",
    event_type="discount",
    description="周中特惠！全单八折，仅限周二至周四",
    discount_rate=0.20,   # 八折
    reach_rate=0.75,      # 75% 初始触达率
)

# 3. Control 组（无干预）
control_sandbox = MarketingSandbox(create_agents(500, seed=99), venues, seed=99)
control_result = control_sandbox.run(n_days=7, event=None)

# 4. Treatment 组（有促销）
treatment_sandbox = MarketingSandbox(agents, venues, seed=42)
treatment_result = treatment_sandbox.run(n_days=7, event=event)

# 5. 分析结果
analyzer = SimulationAnalyzer()
analyzer.print_report({"control": control_result, "treatment": treatment_result})

# 6. 提取口碑传播日志
print(f"WOM 消息总量: {treatment_result['total_wom_messages']}")
print(f"各品牌 WOM 分布: {treatment_result['wom_by_brand']}")
print("[✓] Generative Agent Simulati 测试通过")
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2510.18155。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：用户 Persona 分布（价格敏感型与速度敏感型比例）、历史客单价分布、社交关系或达人覆盖作为传播参数，以及待测试的营销事件参数。

**输出**：各方案组的访客提升率、营收变化与口碑传播量对比，以及最优方案建议；供战略规划期决策使用。

## 执行步骤

1. 构建虚拟用户 Agent 群体并初始化数字钱包与 Persona 参数
2. 按方案分组（对照组与处理组）注入营销事件
3. 分别运行设定天数的仿真
4. 比较各组访客、营收与口碑传播差异并给出方案建议

## 边界与不做

- 数据不满足：Persona 比例与客单价分布无法估计时仿真偏差大，先用 CRM 历史订单近似或补调研。
- 何时不用：有数据可直接做 A/B 实验时用实验类技能；多情景参数对比用「供应链 What-If 情景分析引擎」；只做会员分层运营用会员类技能。
- 能力边界：产出沙盒推演结论，不替代上线后的真实 A/B 实验与数据分析。
- 安全边界：涉及个人信息的使用须满足告知与授权要求，仿真结论不得当作真实用户行为证据。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DQN-Purchase-Prediction.html、Skill-DQN-Purchase-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Points-Expiry-Redemption-Liability-Model.html、Skill-Points-Expiry-Redemption-Liability-Model、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-UCB-LDP-Dynamic-Pricing.html、Skill-UCB-LDP-Dynamic-Pricing、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-DQN-Purchase-Prediction.html、Skill-DQN-Purchase-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Points-Expiry-Redemption-Liability-Model.html、Skill-Points-Expiry-Redemption-Liability-Model、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-UCB-LDP-Dynamic-Pricing.html、Skill-UCB-LDP-Dynamic-Pricing、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction
- **可组合**：Skill-DQN-Purchase-Prediction.html、Skill-DQN-Purchase-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Points-Expiry-Redemption-Liability-Model.html、Skill-Points-Expiry-Redemption-Liability-Model、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-UCB-LDP-Dynamic-Pricing.html、Skill-UCB-LDP-Dynamic-Pricing、Skill-Generative-Agent-Simulation

---

> 分类：经营管理/经营与组织/情景模拟　·　技术族：06-增长模型　·　源卡：`Skill-Generative-Agent-Simulation`