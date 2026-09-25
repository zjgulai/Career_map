---
name: "p2s-combo-new-product-launch-playbook"
title: "新品上市全链路 Combo Pattern — 从蓝海选品到首月排名突破的 7 步编排"
description: "触发词：新品上市、上架链路、关键词蓝海、主图合规、多语言 Listing。何时不用：只做关键词需求缺口用选品或关键词类技能；只做链路效果评估用 Playbook 评估类技能。安全边界：AI 生成的商品描述与合规文案必须人工审核医疗宣称与进口国广告法风险后才能发布。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / Playbook评估"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-Combo-New-Product-Launch-Playbook"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "从选关键词到主图检测、多语言 Listing、合规预检，按七步链路把新品从开发推到排名突破。"
user_try: "试试：按上新链路帮我跑一遍这款硅胶辅食勺，从关键词到主图和合规预检。"
whenToUse: "当新品要从选品一路做到上架合规与排名突破、需要串起多个子技能时用本技能；只做关键词需求缺口，用选品或关键词类技能；只做链路效果评估，用 Playbook 评估类技能。"
workflow: "反查竞品 ASIN 关键词，筛选搜索量与竞争度符合蓝海条件的词 → 用 Top10 竞品反推共同排名因子 → 生成 EN/DE/FR 多语言 Listing 并控制关键词密度 → 检测主图合规与视觉要素（背景、产品占比、文字水印） → 做合规声明预检并输出整改项"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 新品上市全链路 Combo Pattern — 从蓝海选品到首月排名突破的 7 步编排

## ① 解决的问题

新品负责人面临"新品上市要协调SEO/合规/图文/广告多个团队流程混乱且各自为战"——7步Skill执行链路将新品从开发到首页排名的时间从3个月压缩至6周，首月GMV提升$2.8万

## ② 核心算法逻辑

论文：ComboSkill: A DAGbased Skill Orchestration Framework for Business Workflows | 年份：2023

## ③ 业务应用场景

- 业务问题：PM 拍脑袋选关键词，主图被 A9 降权，上架第一周 CTR < 0.3%，首月亏损 2 万美元广告费 - 数据要求：竞品 ASIN 列表（Top20）、产品 SPU 属性、目标市场（US/CA/UK） - 执行链路： - Step1 发现「silicone feeding spoon set」搜索量 18K/月，竞争度 0.42（蓝海） - Step2 判定「主图有人手握持」+「评论≥50」是 Top10 的共同排名因子 - Step3 生成 EN/DE/FR 三语言 Listing，关键词密度 2.1% - Step4 主图检测：背景纯白 ✅，产品占比 85% ✅，文字水印 
- 业务问题：欧盟安全认证要求复杂，Listing 因合规问题被下架，损失 5 万人民币 - 执行亮点：Step5 提前检测到「EN 1400」认证声明缺失，Step3 自动生成德语合规文案，避免上架后被下架 - 业务价值：合规风险提前识别节省整改成本约 3 万元/次，年化 6-8 次上新节省 18-24 万元
三轨验证 | 成本轨：AI Agent自动化新品上线流程，月均成本1200元（API调用费800元+人工审核4小时/月×100元/h），相比传统流程（人工32小时/月×150元/h=4800元）节省75% | 合规轨：符合《跨境电商商品质量管理规范》和平台新品发布政策，需人工审核商品描述的医疗宣称（概率15%），合规率98.5% | 风险轨：主要风险为AI生成描述违反进口国广告法（概率8%，影响：商品下架），其次为库存预测偏差导致滞销（概率12%，影响：资金占用），可通过人工抽检+法律库更新规避

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：7 步链路将新品首月存活率从 38% 提升至 71%，减少无效广告烧损约 1.5 万元/SKU，按年上新 8 款计算，年化节省 12 万元广告费 + 减少 2-3 次下架整改损失（约 10 万元）
关键指标改善：首月 ACoS 从 45% 降至 26%（-42%），自然排名首月进入 Top 50 概率从 22% 提升至 65%
实施难度：⭐⭐⭐☆☆（各子 Skill 单独成熟，Combo 编排需额外工程化 1-2 周）
优先级：⭐⭐⭐⭐⭐（新品上市是跨境电商最高频、最高风险的决策节点）
适用规模：年上新 ≥ 3 款的卖家，单款预算 ≥ 5000 元即可正向 ROI

## ⑦ 代码节选

本节的完整实现（170 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.02345，但该号在 arXiv 上是《Mitigating crosstalk errors by randomized compiling: Simulation of the BCS model on a superconducting quantum computer》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《ComboSkill: A DAGbased Skill Orchestration Framework for Business Workflows》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：竞品 ASIN 列表（Top20）、产品 SPU 属性、目标市场（US/CA/UK）、目标语言与合规要求；按单个新品粒度。

**输出**：七步链路的执行上下文与各步产出（关键词机会、排名因子结论、多语言 Listing、主图检测结果、合规声明检查）；供新品负责人与运营团队执行。

## 执行步骤

1. 反查竞品 ASIN 关键词，筛选搜索量与竞争度符合蓝海条件的候选词
2. 用 Top10 竞品反推共同排名因子（如主图有人手握持、评论数门槛）
3. 生成 EN/DE/FR 多语言 Listing 并控制关键词密度
4. 检测主图合规与视觉要素（纯白背景、产品占比、文字水印）
5. 做合规声明预检（如 EN 1400 认证缺失）并输出整改项

## 边界与不做

- 数据不满足：拿不到竞品 ASIN 列表或 SPU 属性时链路无法启动，先补数据。
- 何时不用：只做关键词需求缺口用选品或关键词类技能；只做链路评估用 Playbook 评估类技能；年上新少于 3 款或单款预算低于 5000 元时卡页口径下 ROI 不成立。
- 能力边界：产出编排契约与各步产物，不执行上架、不代发广告，也不保证平台审核通过。
- 安全边界：AI 生成的描述与合规文案必须人工审核医疗宣称与进口国广告法风险后才能发布。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-Skill-Runtime-Orchestrator.html、Skill-Agent-Skill-Runtime-Orchestrator、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Combo-Ad-ROI-Maximizer.html、Skill-Combo-Ad-ROI-Maximizer、Skill-Combo-Inventory-Crisis-Response.html、Skill-Combo-Inventory-Crisis-Response、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-Multilingual-Listing-Generation.html、Skill-Multilingual-Listing-Generation、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration
- **延伸**：Skill-Agent-Skill-Runtime-Orchestrator.html、Skill-Agent-Skill-Runtime-Orchestrator、Skill-Combo-Ad-ROI-Maximizer.html、Skill-Combo-Ad-ROI-Maximizer、Skill-Combo-Inventory-Crisis-Response.html、Skill-Combo-Inventory-Crisis-Response
- **可组合**：Skill-Agent-Skill-Runtime-Orchestrator.html、Skill-Agent-Skill-Runtime-Orchestrator、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Combo-Ad-ROI-Maximizer.html、Skill-Combo-Ad-ROI-Maximizer、Skill-Combo-Inventory-Crisis-Response.html、Skill-Combo-Inventory-Crisis-Response、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Combo-New-Product-Launch-Playbook

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：16-智能体工程　·　源卡：`Skill-Combo-New-Product-Launch-Playbook`