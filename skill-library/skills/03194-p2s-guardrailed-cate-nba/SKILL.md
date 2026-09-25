---
name: "p2s-guardrailed-cate-nba"
title: "Guardrailed CATE-NBA"
description: "触发词：增量名单、CATE、预算护栏、食人化防护、触达频次。何时不用：只需要CATE排序或人群画像、没有预算与频次约束时不用本技能（改走因果森林/Uplift类）。安全边界：只产出带约束的行动名单，不自动发券或触达；预算、频次与高净值保护阈值须由业务方给定。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 生命周期触达 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Guardrailed-CATE-NBA"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在预算上限和别打扰太多人的约束下，挑出增量最高的人和最合适的动作，直接给出一份可落地的触达名单。"
user_try: "试试：80 万沉默用户、促销预算只有 1 万美元，帮我在不白送老客优惠的前提下挑出最该发券的人。"
whenToUse: "当已经能估出个体增量（CATE）、但还要在总预算、每人触达次数、高净值用户保护等约束下选出行动名单时用；若只需增量排序或人群画像，用因果森林类技能；若要评估某次促销的整体净增量，用反事实评估。"
workflow: "整理用户级特征表与含处理/对照标签的历史实验数据 → 估算每个用户对每种行动的增量得分（CATE 矩阵） → 按护栏规则过滤：食人化概率阈值、最低增量门槛、每人触达次数 → 在总预算约束下用贪心背包选出最优行动分配 → 导出行动名单与总成本、预期增量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Guardrailed CATE-NBA

## ① 解决的问题

业务问题 数据库里 80 万 90 天未下单的沉默用户，运营想全量发 50 元满减券激活，但财务要求总促销预算不超过 1 万美元，且担心本来明天就要下单的老客"白吃"优惠

## ② 核心算法逻辑

光算出每个用户的增量效应（CATE）还不够——真实业务有预算上限、有高净值用户保护、有每天不能无限制打扰用户的体验红线。Guardrailed CATENBA 打通了"预测→决策"的最后一公里：三层漏斗把因果估算的结果直接转化为带约束的最优行动名单。

## ③ 业务应用场景

业务问题 数据库里 80 万 90 天未下单的沉默用户，运营想全量发 50 元满减券激活，但财务要求总促销预算不超过 1 万美元，且担心本来明天就要下单的老客"白吃"优惠。
| 字段 | 说明 | 格式 | |------|------|------| | `user_id` | 用户唯一标识 | string | | `recency_score` | 近期活跃得分（最近购买时间倒序归一化）| [0,1] float | | `rfm_score` | RFM 综合得分（Recency + Frequency + Monetary）| [0,1] float | | `days_since_last_order` | 距上次下单天数 | int | | `historical_orders` | 历史订单数 | int | | 历史实验数据 | 含处理/对照标签
预期产出 - 每个用户对每种行动的增量得分（CATE 矩阵） - 经护栏过滤后的行动分配名单：A群/满减券、B群/免费小样、C群（铁粉或死粉）/不触达 - 总成本不超过预算的最优触达方案

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

难度 3/5：三层架构中，CATE 估算（Layer 1）可先用 Mock 或简单 T-Learner 快速验证，护栏规则（Layer 2）直接对应业务规则文档，贪心背包（Layer 3）无需引入额外依赖（纯 pandas + numpy 实现），整体上线路径清晰。唯一门槛是需要高质量的历史 A/B 实验数据作为 CATE 训练集。
优先级 4/5：论文已通过线上 A/B 测试验证营收显著正增长；母婴出海高获客成本场景下，精准促活对 LTV/CAC 比值的改善尤为关键；且护栏机制天然满足财务合规要求，落地阻力小。
量化依据：文献报告在对照组（随机发券）基础上，处理组新增 GMV 显著（p < 0.05），资源消耗降低约 40%。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（35 行）。**下面 35 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **35 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，35 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/guardrailed_cate_nba` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Guardrailed-CATE-NBA.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import (
    Action, GuardrailConfig, GuardrailedCATENBA, generate_mock_users
)

# 定义营销行动选项
actions = [
    Action("coupon_20",   "满减券20元",  unit_cost=20.0),
    Action("coupon_50",   "满减券50元",  unit_cost=50.0),
    Action("free_sample", "免费小样",    unit_cost=8.0),
]

# 配置护栏参数
cfg = GuardrailConfig(
    cannibalization_base_prob_threshold=0.70,  # 高净值用户门槛
    cannibalization_cate_discount=0.50,         # 食人化打折系数
    total_budget=10_000.0,                      # 总预算（元）
    max_actions_per_user=1,                     # 每人最多触达1次
    min_cate=0.02,                              # 最低增量门槛
)

# 加载用户特征（实际替换为业务数据）
X = generate_mock_users(n=50_000)

# 运行完整流水线
model = GuardrailedCATENBA(actions=actions, config=cfg)
result = model.run(X)

# 查看分配结果
print(f"触达用户: {len(result.assignments):,}")
print(f"总成本: {result.total_cost:,.0f} 元")
print(f"预期增量: {result.total_expected_uplift:.3f}")
print("分配明细:", result.summary)

# 导出行动名单
result.assignments.to_csv("action_list.csv", index=False)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2512.19805 — Guardrailed Uplift Targeting: A Causal Optimization Playbook for Marketing Strategy
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户级特征表，字段示例：user_id（string）、recency_score（[0,1]）、rfm_score（[0,1]）、days_since_last_order（int）、historical_orders（int）；外加含处理/对照标签的历史实验数据作为 CATE 训练集；各营销行动需给出单位成本（示例：满减券 20 元、满减券 50 元、免费小样 8 元）。

**输出**：每个用户对每种行动的 CATE 矩阵、经护栏过滤后的行动分配名单（如分群到满减券、免费小样、不触达）、总成本不超过预算的最优触达方案，可直接导出为行动名单 CSV 供运营使用。

## 执行步骤

1. 整理用户级特征表与含处理/对照标签的历史实验数据
2. 估算每个用户对每种行动的增量得分，形成 CATE 矩阵
3. 按护栏规则过滤：食人化概率阈值、最低增量门槛与每人触达次数
4. 用贪心背包在预算约束下选出最优行动分配
5. 导出行动名单、总成本与预期增量

## 边界与不做

- 何时不用：没有带处理/对照标签的历史实验数据作为 CATE 训练集，或问题本身不存在预算、频次等约束时，不要用本技能。
- 能力边界：只产出带约束的行动名单，不自动发券或触达；预算上限、每人触达次数与高净值保护阈值由业务方给定，改动阈值会同时改变名单与成本。
- 卡页数字（80 万沉默用户、1 万美元预算、资源消耗降低约 40%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction
- **延伸**：Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN
- **可组合**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-Guardrailed-CATE-NBA

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：06-增长模型　·　源卡：`Skill-Guardrailed-CATE-NBA`