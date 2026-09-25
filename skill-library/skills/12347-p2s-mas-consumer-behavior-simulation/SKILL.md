---
name: "p2s-mas-consumer-behavior-simulation"
title: "Skill-MAS-Consumer-Behavior-Simulation"
description: "触发词：p2s-mas-consumer-behavior-simulation。MAS消费者行为仿真"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 情景模拟"
l1_l2_l3: "业务运营/渠道经营/促销规划"
quality_tier: "curated"
p2s_card_id: "Skill-MAS-Consumer-Behavior-Simulation"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
p2s_paper_id: "2510.18155"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-MAS-Consumer-Behavior-Simulation"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-MAS-Consumer-Behavior-Simulation.md"
rebase_source_sha256: "e3f10caaf081d47137ffaf349092b0aeb0af0e61f420355ceaafc346d4f360db"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "e3f10caaf081d47137ffaf349092b0aeb0af0e61f420355ceaafc346d4f360db"
rebase_full_card_bytes: "16530"
rebase_full_card_lines: "316"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "17"
rebase_evidence_quotes_total: "17"
rebase_evidence_quotes_complete: "true"
---
# Skill-MAS-Consumer-Behavior-Simulation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-MAS-Consumer-Behavior-Simulation`（完整卡：`references/full-card.md`，sha256 `e3f10caaf081d47137ffaf349092b0aeb0af0e61f420355ceaafc346d4f360db`，16530 字节 / 316 行 / 17 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: MAS Consumer Behavior Simulation
# MAS消费者行为仿真

**论文来源**: LLM-Based Multi-Agent System for Simulating and Analyzing Marketing and Consumer Behavior  
**arXiv ID**: [2510.18155](https://arxiv.org/abs/2510.18155)  
**发表日期**: 2025-10  
**适用领域**: 促销策略评估、消费者行为预测、市场动态仿真

---

## ① 算法原理

### 核心思想
传统A/B测试需要真实用户参与，成本高、周期长、不可逆。MAS消费者行为仿真提出**虚拟消费者生态**：用异构Agent模拟真实消费者（不同人口统计、偏好、预算约束），在虚拟市场中交互，通过控制促销变量快速评估策略效果——无需上线即可预测市场反应。

### 数学直觉

**异构Agent效用函数**（多属性决策）：
每个Agent有不同的权重组合，模拟消费者异质性。

**社交影响传播**（记忆驱动的口碑效应）：
Agent i 的决策受社交邻居 j 的最近购买行为影响。

**促销效果量化**（三重对比）：

**反直觉洞察**：直觉认为"打折=增量收入"，但仿真揭示**替代效应**可能占主导——折扣吸引的是竞品用户转移，而非创造新需求。论文实验中Fried Chicken Shop 20%折扣带来51%收入增长，但主要来自Local Diner客流转移（-7%），总市场消费并未显著增长。

### 关键假设
1. 消费者异质性可通过人口统计+偏好参数捕捉
2. 社交影响在母婴消费中显著（妈妈群体口碑传播强）
3. 促销效果可被分解为：增量效应 + 替代效应 + 忠诚度效应
4. 规则基线可作为LLM驱动的降本替代（生产环境可接入DeepSeek/ChatGPT）

---

## ② Momcozy吸奶器应用案例

### 场景1: 黑五促销策略预演

**业务问题**  
黑五前夕，Momcozy计划在Amazon美国站对S12 Pro吸奶器做20%折扣，但不确定：
- 收入增长来自新客还是竞品用户转移？
- 竞品（Medela/Spectra）是否会跟进打折？
- 促销结束后用户留存率如何？

**数据输入**

**仿真配置**

**预期产出**
- 促销期收入提升: +90~120%
- 市场份额变化: 35% → 65%
- 竞品收入下降: -15~25%
- 促销后忠诚度: 80~95%（重复购买率）

**业务价值**
- 提前7天预测促销效果，避免盲目降价
- 识别"增量"vs"转移"比例，优化促销预算分配
- 识别高忠诚度用户群，设计差异化促销（如老客专属折扣）

---

### 场景2: 新品Wearable Pump市场进入仿真

**业务问题**  
Momcozy计划推出$199.99的Wearable Pump（隐形穿戴式吸奶器），需评估：
- 目标用户群是谁？（职场妈妈？高收入的便携需求者？）
- 定价$199.99 vs 竞品$189.99（Medela），是否有竞争力？
- 社交口碑传播能否突破品牌认知壁垒？

**数据输入**

**仿真设计**
- Phase 1（Day 1-3）：无广告，纯口碑传播（社交影响权重0.3）
- Phase 2（Day 4-6）：KOL推荐注入（社交影响权重提升至0.7，10%Agent设为"种子用户"）
- Phase 3（Day 7-10）：降价$20促销

**预期产出**
- 口碑传播突破阈值：社交影响权重>0.5时， adoption rate 从8%跃升至35%
- 最优定价区间：$179.99（+10%销量）vs $199.99（+5%利润）
- 目标用户画像：28-32岁职场妈妈，便携需求>0.7，科技接受度>0.6

**业务价值**
- 新品上市前完成"虚拟市场测试"，降低失败风险
- 优化GTM策略：先KOL+口碑，后促销转化
- 量化社交传播ROI，指导 influencer marketing 预算

---

（**换底正文在此截断** —— 完整卡正文共 316 行，本页内联到第 133 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 17 条 · 不截断）

> 原文:"We construct a week-long virtual town experiment where agents plan daily schedules, manage resources, shop with earned income, converse and make social commitments, coordinate visits to town locations, and choose between a cafe, fast-food outlet, and family restaurant for meals. A fried chicken shop offers a midweek 20% discount while others maintain regular pricing."
> 出处：2510.18155 Abstract / §I Introduction

> 原文:"Our simulation features 11 agents and 10 locations for residence, dining, shopping, work, and leisure. Each agent plans a daily routine using LLM responses guided by structured prompts and executes it within the simulation, focusing on food-purchase behavior to evaluate discount strategy."
> 出处：2510.18155 §III Simulation Setting

> 原文:"DeepSeek-V3 powers the simulation, enabling agents to plan, execute, and communicate naturally."
> 出处：2510.18155 §III.A

> 原文:"Eleven agents cover diverse demographics: ages 22–35, various professions (e.g., software engineer, barista, chef), and income types (hourly, monthly, business-owner)."
> 出处：2510.18155 §III.B.2

> 原文:"Theoretically, consumer psychology research shows individual variation in deal promotion proneness (DPP) - the tendency of some consumers to respond more strongly to price-based incentives than others"
> 出处：2510.18155 §I Introduction

> 原文:"memory stream that stores recent interactions, personal experiences, and contextual updates over time."
> 出处：2510.18155 §III.D.1

> 原文:"If a proposed action exceeds their available budget, the agent may drop or revise the plan, reinforcing realism through bounded rationality."
> 出处：2510.18155 §III.E.2

> 原文:"The 20% midweek discount at Fried Chicken Shop produced measurable changes in market dynamics, as shown in Fig. 4."
> 出处：2510.18155 §IV.A

> 原文:"The shop’s revenue increased 51% from Day 2 ($100.6) to Day 3 ($152.11) despite the price reduction, indicating strong consumer response to the promotion."
> 出处：2510.18155 §IV.A

> 原文:"At the same time, Local Diner has decreased revenue for 7%."
> 出处：2510.18155 §IV.A

> 原文:"The discount triggered market share redistribution, with Fried Chicken Shop’s share increasing from 30% (Day 1) to 41% (Day 3), while Local Diner’s share decreased from 62% to 48%."
> 出处：2510.18155 §IV.A

> 原文:"The delayed peak on Day 3 rather than immediate response reveals gradual information diffusion through the agent network. Total daily market size fluctuated between $276 - 471 without systematic expansion during the promotion period, indicating the discount primarily drove substitution between restaurants rather than increasing overall food consumption."
> 出处：2510.18155 §IV.A

> 原文:"This substitution effect, where customers shifted between providers without increasing total spending, demonstrates realistic consumer behavior in response to localized price promotions."
> 出处：2510.18155 §IV.A

> 原文:"Our results exhibit the same substitution-driven pattern, supporting the validity of the generative simulation."
> 出处：2510.18155 §IV.B

> 原文:"For instance, our daily planning prompt is approximately 7,098 characters, 2225 characters for conversation in length, and includes detailed rules about the agent’s current state(location, energy, money, etc), previous memory load back, location options, work routines, and agent constraints."
> 出处：2510.18155 §V.A

> 原文:"A notable challenge in LLM-driven simulations is the model’s tendency to hallucinate responses outside the configured environment, even when provided with structured context."
> 出处：2510.18155 §V.A

> 原文:"For example, a 7-year-old agent assigned childlike attributes still displayed adult behaviors (e.g., requesting coffee when tired) and lacked age-appropriate curiosity or emotional tone."
> 出处：2510.18155 §V.C

---

## 附录：论文核心信息

| 项目 | 内容 |
|------|------|
| 论文标题 | LLM-Based Multi-Agent System for Simulating and Analyzing Marketing and Consumer Behavior |
| arXiv | 2510.18155 |
| 发表 | 2025-10 |
| 核心方法 | DeepSeek-V3驱动Agent + 虚拟小镇 + 记忆系统 + 购买决策 |
| 验证结果 | 促销收入+51%，市场份额30%→41%，替代效应>新增消费 |
| 反直觉洞察 | 折扣主要驱动消费者转移，而非增加总消费 |
| 适用场景 | 促销策略预演、新品市场进入、定价策略评估 |

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-MAS-Consumer-Behavior-Simulation`（完整卡：`references/full-card.md`）。

- 论文：2510.18155
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
