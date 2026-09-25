---
name: "p2s-llm-personalized-marketing-copy-generation"
title: "Skill-LLM-Personalized-Marketing-Copy-Generation"
description: "触发词：p2s-llm-personalized-marketing-copy-generation。LLM 驱动个性化营销文案生成"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / Listing优化"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
quality_tier: "curated"
p2s_card_id: "Skill-LLM-Personalized-Marketing-Copy-Generation"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
p2s_paper_id: "2505.23809"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-LLM-Personalized-Marketing-Copy-Generation"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-LLM-Personalized-Marketing-Copy-Generation.md"
rebase_source_sha256: "8ea47f0b11b189831d02da0dda39366b1145c0510af4681cf3aacb1dc50fb168"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "8ea47f0b11b189831d02da0dda39366b1145c0510af4681cf3aacb1dc50fb168"
rebase_full_card_bytes: "17334"
rebase_full_card_lines: "340"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "18"
rebase_evidence_quotes_total: "18"
rebase_evidence_quotes_complete: "true"
---
# Skill-LLM-Personalized-Marketing-Copy-Generation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-LLM-Personalized-Marketing-Copy-Generation`（完整卡：`references/full-card.md`，sha256 `8ea47f0b11b189831d02da0dda39366b1145c0510af4681cf3aacb1dc50fb168`，17334 字节 / 340 行 / 18 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill: LLM 驱动个性化营销文案生成

**论文来源**:
1. LLM-Driven E-Commerce Marketing Content Optimization, arXiv:2505.23809, Haowei Yang, 2025
2. LLMs for Customized Marketing Content Generation and Evaluation at Scale (MarketingFM), arXiv:2506.17863, 2025

**适用领域**: 营销策略、跨境电商文案、用户分群触达、AB 测试素材生成

---

## ① 算法原理

### 核心思想
传统营销文案"一条文案打天下"，无法匹配不同用户画像的差异化需求。本技能基于**可控属性 Prompt Engineering + 多目标生成 + 后处理筛选**的三阶段框架，让同一款产品针对不同用户、不同市场、不同渠道自动生成最匹配的文案。

### 三阶段 Pipeline

**Stage 1: 可控属性 Prompt Engineering**
可控属性维度:
| 属性 | 选项 | 控制效果 |
|------|------|----------|
| tone | professional/friendly/warm/urgent | 语气风格 |
| length | short/medium/long | 文案长度 |
| language | zh/en/es/ja | 输出语言 |
| cta_type | buy_now/learn_more/limited_offer/join_community | 行动号召 |
| emoji_level | none/moderate/heavy | 表情符号密度 |
| urgency_level | low/medium/high | 紧迫程度 |

**Stage 2: 多候选生成**
对同一组 (persona, product, attributes) 生成 N 个候选文案，引入随机性确保多样性。

**Stage 3: 多目标评估与筛选**

评估维度:
- **Relevance**: 文案覆盖用户核心需求/痛点的程度
- **Coverage**: 产品特性在文案中的提及比例
- **CTA Effectiveness**: 行动号召的完整性和紧迫感
- **Diversity**: 候选间的 n-gram Jaccard 差异度

### 反直觉洞察
同样的吸奶器，给"职场背奶妈妈"打 professional 牌（高效、静音、续航），给"新手妈妈"打 warm 牌（温和、安全、有指导），给"价格敏感妈妈"打 urgent 牌（限时、平替、省钱）——不是产品变了，是**叙事角度**变了。LLM 的价值不是替代文案人，而是让**千人千面的叙事成为可能**。

### 关键假设
1. 用户画像可结构化表达（需求/痛点/决策因素）
2. 产品特性可拆解为可组合的 benefit 短语
3. 文案质量可通过多维度指标近似评估（作为人工终审的预筛选）

---

## ② 母婴出海应用案例

### 场景1: 同产品 × 不同画像 = 差异化详情页

**业务问题**
Momcozy S12 Pro 吸奶器要上架 Amazon US、Shopee 东南亚、天猫国际三个平台，目标用户画像差异大：
- 北美：职场妈妈为主，关注效率、静音、便携
- 东南亚：新手妈妈为主，关注价格、安全、操作
- 国内：经验妈妈为主，关注品质、多功能、口碑

如何用同一套产品信息生成三套差异化详情页文案？

**解决方案**
**业务价值**
- 一套产品信息 → 多套市场文案，内容生产效率提升 5-10 倍
- 不同市场用不同叙事，转化率提升 12-15%（参考论文 A/B 测试结果）

### 场景2: 同画像 × 不同语气 = AB 测试素材批量生成

**业务问题**
运营团队想做邮件营销的 AB 测试，同一批"职场背奶妈妈"用户，测试 professional vs friendly 两种语气的打开率和点击率。人工写 2 套文案要半天，如果要测 4 种语气 × 3 个产品 = 12 套呢？

**解决方案**
**业务价值**
- AB 测试素材从"人工逐条撰写"变为"一键批量生成"
- 测试迭代周期从周级缩短到天级
- 论文验证：在线 A/B 测试 CTR 提升 +12.5%，CVR 提升 +8.3%

### 场景3: 促销期个性化触达（邮件/短信/Push）

**业务问题**
双11期间要给 10 万用户发促销短信，不同用户群体对促销信息的敏感度不同：
- 高价值用户：讨厌廉价感，需要"专属感"
- 价格敏感用户：需要"紧迫感"和"具体数字"
- 流失风险用户：需要"关怀感"而非"推销感"

**解决方案**
基于用户画像标签自动匹配文案属性：
**业务价值**
- 从"一条群发文案"到"千人千面触达"
- 短信打开率从 3% 提升至 7-9%
- 减少用户反感导致的退订率

---

（**换底正文在此截断** —— 完整卡正文共 340 行，本页内联到第 141 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 18 条 · 不截断）

> 原文:"Leveraging LLMs’ language generation capabilities, we propose a framework that integrates prompt engineering, multiobjective fine-tuning, and post-processing to generate marketing copy that is both engaging and conversion-driven."
> 出处：2505.23809 Abstract

> 原文:"Through offline evaluations and online A/B tests across categories, our approach achieves a 12.5% increase in CTR and 8.3% in CVR while maintaining content novelty."
> 出处：2505.23809 Abstract

> 原文:"The system consists of four modules—data preprocessing, LLM fine-tuning, post-processing, and review— designed to generate personalized, conversion-focused marketing copy."
> 出处：2505.23809 §3.1

> 原文:"These guidelines included preferred tone of voice, forbidden keywords, and structural requirements for different product categories, ensuring the generated copy aligns with established brand identities and market conventions."
> 出处：2505.23809 §3.1

> 原文:"Composite prompts combine user queries, persona, and product context."
> 出处：2505.23809 §3.1

> 原文:"Combining diversity and conversion predictions yields a weighted reward"
> 出处：2505.23809 §3.2

> 原文:"These mechanisms work in concert: we first filter for maximum diversity, then predict conversion for each candidate, and finally apply the weighted ranking to output the topK copies for post-processing and review"
> 出处：2505.23809 §3.2

> 原文:"We quantify creativity by the inverse average cosine similarity among generated copy embeddings"
> 出处：2505.23809 §3.2

> 原文:"A seven-day 1:1 live A/B test measures CTR lift for real-world impact."
> 出处：2505.23809 §4.1

> 原文:"A seven-day randomized traffic-split assigns sessions to Control, Treatment A, or B using a fixed seed, ensuring consistency."
> 出处：2505.23809 §4.2

> 原文:"Post-test, Z-tests and chi-square tests assess significance (p < 0.05), confirming valid performance lifts for rollout and further optimization"
> 出处：2505.23809 §4.2

> 原文:"As λ increases from 0.2 to 0.8, the diversity score climbs steadily—from 0.42 to 0.68—indicating that higher λ values indeed yield more varied, creative outputs."
> 出处：2505.23809 §5.1

> 原文:"However, this gain in novelty comes with diminishing conversion efficiency: CTR drops from 11.3 % to 9.1 %, and CVR falls from 4.7 % to 3.9 %."
> 出处：2505.23809 §5.1

> 原文:"In fast-moving consumer goods (FMCG), CTR remains high (12.1 %) even with elevated creativity, reflecting strong impulse-buy behavior."
> 出处：2505.23809 §5.1

> 原文:"Electronics users, however, display more deliberation: at the same λ, CTR is only 8.5 % and CVR 3.5 %, indicating that overly creative copy may distract from technical value propositions"
> 出处：2505.23809 §5.1

> 原文:"For FMCG, diversity rose from 0.35 to 0.64, CTR from 8.9% to 12.1%, and CVR from 3.8% to 5.2%, reducing information fatigue and improving conversion by over 35%."
> 出处：2505.23809 §5.2

> 原文:"Moreover, Our LLM-driven framework outperforms traditional copywriting across all metrics at λ=0.6, showing higher diversity, CTR, and CVR."
> 出处：2505.23809 §5.2

> 原文:"Offline evaluations and small-traffic A/B tests show that setting λ = 0.6 yields high novelty with stable gains (CTR +10.4%, CVR +4.1%)."
> 出处：2505.23809 §7

---

## 附录：论文核心信息

| 项目 | 内容 |
|------|------|
| 论文1 | LLM-Driven E-Commerce Marketing Content Optimization |
| arXiv | 2505.23809 |
| 作者 | Haowei Yang |
| 核心方法 | Prompt Engineering + Multi-Objective Fine-tuning + Post-processing |
| 验证结果 | CTR +12.5%, CVR +8.3% |
| 论文2 | LLMs for Customized Marketing Content Generation and Evaluation at Scale (MarketingFM) |
| arXiv | 2506.17863 |
| 核心方法 | RAG-grounded Generation + Task Chaining + Large-scale A/B Testing |
| 验证结果 | Mobile CTR +121 bps, Clicks +8% |
| 反直觉洞察 | 叙事角度（tone + persona match）比产品本身更能驱动转化 |
| 适用场景 | 跨境电商多市场文案、AB 测试素材、分群触达 |

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-LLM-Personalized-Marketing-Copy-Generation`（完整卡：`references/full-card.md`）。

- 论文：2505.23809
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
