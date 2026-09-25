---
name: "p2s-autotag-selfevolving-label-system"
title: "Skill-AutoTag-SelfEvolving-Label-System"
description: "触发词：p2s-autotag-selfevolving-label-system。VOC 自动打标签与自进化标签体系"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
quality_tier: "curated"
p2s_card_id: "Skill-AutoTag-SelfEvolving-Label-System"
p2s_src_domain: "07-NLP-VOC"
p2s_venue: "arXiv preprint (Amazon)"
p2s_venue_tier: "CCF-B"
p2s_paper_id: "2405.07195"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-AutoTag-SelfEvolving-Label-System"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-AutoTag-SelfEvolving-Label-System.md"
rebase_source_sha256: "c17b6a909f9c1c3d810a6ea5566c4b16e793fee962fd6849c998c8e1b28971d5"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "c17b6a909f9c1c3d810a6ea5566c4b16e793fee962fd6849c998c8e1b28971d5"
rebase_full_card_bytes: "20800"
rebase_full_card_lines: "375"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "16"
rebase_evidence_quotes_total: "16"
rebase_evidence_quotes_complete: "true"
---
# Skill-AutoTag-SelfEvolving-Label-System

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-AutoTag-SelfEvolving-Label-System`（完整卡：`references/full-card.md`，sha256 `c17b6a909f9c1c3d810a6ea5566c4b16e793fee962fd6849c998c8e1b28971d5`，20800 字节 / 375 行 / 16 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: VOC 自动打标签与自进化标签体系
# AutoTag Self-Evolving Label System for VOC

**论文来源**: InsightNet — Structured Insight Mining from Customer Feedback (Amazon, arXiv:2405.07195, 2024)
**理论基础**: 层级 Topic Classification + 开放世界标签发现 + 持续学习
**适用领域**: 消费者评价分析、客服反馈结构化、产品痛点追踪、运营标签自动化

---

## ① 算法原理

### 核心思想
消费者反馈是非结构化的文本（评论、客服记录、社媒帖子），传统人工打标签成本高、覆盖率低、更新滞后。本技能构建一个**生产-评估-进化**三阶段闭环系统：先通过层级分类器自动打标签，再用一致性评估筛选高质量标签，最后基于新数据自动扩展标签体系。

### 技术架构


### 层级标签体系设计

采用 L1→L2→L3→L4 四级架构，**每一层都是下一层的父标签**，形成树状结构：

| 层级 | 粒度 | 示例（母婴出海） | 标签数量 |
|------|------|-----------------|---------|
| L1 | 品类维度 | 纸尿裤 / 奶粉 / 童装 | ~20 |
| L2 | 问题域 | 质量 / 物流 / 价格 / 服务 | ~10/品类 |
| L3 | 细分类别 | 材质舒适度 / 尺码偏差 / 漏尿 | ~30/问题域 |
| L4 | 具体痛点 | "腰贴太硬划伤皮肤" / "夜间侧漏" | 动态扩展 |

**关键设计**: L1-L3 由业务专家预定义，L4 由模型自动发现。L4 标签积累到一定量后，经人工确认可提升为 L3。

### 多任务联合预测

对每条反馈文本 $x$，同时预测三个输出：

$$
\hat{y} = f_{MT}(x) = \{ \underbrace{\hat{t}}_{\text{topic}}, \underbrace{\hat{s}}_{\text{sentiment}}, \underbrace{\hat{v}}_{\text{verbatim}} \}
$$

其中：
- **Topic** $\hat{t} \in \{1, ..., K\}$: 标签分类（L1-L4 层级预测）
- **Sentiment** $\hat{s} \in \{-1, 0, +1\}$: 情感极性（负/中/正）
- **Verbatim** $\hat{v}$: 原文中支撑该标签的关键短语（可解释性）

联合损失函数：

$$
\mathcal{L} = \lambda_1 \cdot \mathcal{L}_{\text{CE}}(t, \hat{t}) + \lambda_2 \cdot \mathcal{L}_{\text{CE}}(s, \hat{s}) + \lambda_3 \cdot \mathcal{L}_{\text{span}}(v, \hat{v})
$$

### 新标签发现（开放世界识别）

当模型对某条文本的 Topic 置信度低于阈值 $\tau$ 时，触发**新标签发现流程**：

1. **语义聚类**: 将低置信度文本用 sentence embedding 聚类
2. **候选命名**: 用 LLM 为每个聚类生成标签名称和描述
3. **相似度去重**: 与现有标签计算语义相似度，过滤重复
4. **人工确认**: 运营人员审核后入库（半自动）

新标签发现率经验值约 **12-18%**（Amazon 数据），即每批新数据中约有 15% 的反馈无法被现有标签覆盖，需要新增标签。

### 标签进化策略

**触发条件**（任一满足即触发进化）：
- 时间窗口：每 30 天或每收到 10,000 条新反馈
- 覆盖率下降：现有标签覆盖率 < 85%
- 新标签候选积累：未确认候选标签 ≥ 20 个

**进化动作**：
1. **新增**: 高频新候选标签通过阈值（出现次数 ≥ 50）后入库
2. **合并**: 语义相似度 > 0.85 的两个标签合并
3. **淘汰**: 连续 90 天无命中的标签标记为"休眠"
4. **升级**: L4 标签下子标签数量 ≥ 10 时，可抽取共同上位概念提升为 L3

### 关键假设

1. **文本质量**: 输入文本长度 ≥ 5 个中文字符，过短文本（如"还行"）难以准确分类
2. **领域稳定**: L1-L3 层级相对稳定，不频繁变动；L4 为动态扩展层
3. **反馈密度**: 需要一定数据量支撑聚类发现新标签（建议 ≥ 1000 条/月）
4. **人工参与**: 新标签入库需要人工确认，全自动化会导致标签膨胀

---

## ② 母婴出海应用案例

### 场景1：跨平台评价标签统一化

**业务问题**
母婴出海商家在 Amazon、Shopee、TikTok Shop、独立站等多平台销售，每个平台有自己的评价体系和标签。运营团队需要人工阅读评价来汇总产品问题，耗时且标准不统一。一个纸尿裤的"侧漏"问题，在 Amazon 可能被描述为 "leaks at night"，在 Shopee 是 "bocor malam"（印尼语），运营团队需要跨语言、跨平台统一追踪。

**数据要求**
| 数据源 | 字段 | 格式 |
|--------|------|------|
| Amazon 评价 | rating, text, date, asin | JSON/CSV |
| Shopee 评价 | rating, comment, item_id | API/CSV |
| TikTok 评价 | content, create_time | API/JSON |
| 客服工单 | content, category, solved | 数据库 |


（**换底正文在此截断** —— 完整卡正文共 375 行，本页内联到第 124 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 16 条 · 不截断）

> 原文:"We empirically demonstrate that InsightNet outperforms the current state-of-the-art methods in multi-label topic classification, achieving an F1 score of 0.85, which is an improvement of 11% F1-score over the previous best results."
> 出处：2405.07195 Abstract

> 原文:"We model aspect identification as a multi-task hierarchical classification problem and then leverage the generative model (section 4.1) to classify topic (granular aspect), identify sentiment, extract verbatim and also discover new topics that are not in the current taxonomy."
> 出处：2405.07195 §1 Introduction

> 原文:"We propose a bottom-up method to generate a hierarchical auto-taxonomy from reviews with weak supervision."
> 出处：2405.07195 §4.2 AutoTaxonomy: Semi-supervised Taxonomy Creation

> 原文:"This means we start with identifying Granular Topics from the reviews, then group them into broader (high-level) topics."
> 出处：2405.07195 §4.2 AutoTaxonomy: Semi-supervised Taxonomy Creation

> 原文:"We either enrich taxonomy with these topics as fine-grained subtopics (L4 topics) or as novel topics (new L3 topics)."
> 出处：2405.07195 §4.4 Post-Processing

> 原文:"We conducted a comprehensive evaluation of our proposed methodology across a diverse set of 43 categories, encompassing over 2200+ distinct product types, which collectively represent more than 95% of the global volume of reviews."
> 出处：2405.07195 §5.4 Experimental Results & Baselines

> 原文:"Specifically, our approach can generate over 1200+ unique topics that capture both positive and negative aspects of the reviews, while Aspect Clustering produces many redundant topics for the same level of coverage."
> 出处：2405.07195 §5.4 Experimental Results & Baselines

> 原文:"Moreover, our approach ensures that the topics are consistent and coherent across reviews and product categories, with only 12% of them being duplicates that can be easily merged in post-processing."
> 出处：2405.07195 §5.4 Experimental Results & Baselines

> 原文:"We also observed around 15% new topics have emerged which were not part of taxonomy (detailed analysis in Appendix section A.3)."
> 出处：2405.07195 §5.4 Experimental Results & Baselines

> 原文:"We analyzed $\sim 10k$ reviews spanning across product categories and found that our model generated $\sim$1450+ unique topics."
> 出处：2405.07195 §A.3 Observations on new topic discovery

> 原文:"Out of these, $\sim$1200+ topics matched the existing taxonomy, while $\sim$200+ topics ($\sim$20%) were new and emerged from post-processing."
> 出处：2405.07195 §A.3 Observations on new topic discovery

> 原文:"The auto-taxonomy generated using reviews from 40+ product categories resulted in 8 L1 topics, 600+ L2 topics, and 1200+ L3 topics ."
> 出处：2405.07195 §C.2 Discussion on Taxonomy

> 原文:"InsightNet surpasses the state-of-the-art methods by 11% F1-score on overall performance metrics, and achieves 85% F1-score on topic classification."
> 出处：2405.07195 §6 Conclusion

> 原文:"This strategy achieved an F1-score of 0.80, which was considerably higher than the other variations."
> 出处：2405.07195 §5.2 Prompt Engineering

> 原文:"Specifically, we used around $75k$ reviews for training and $10k$ reviews for testing, thereby ensuring coverage across all product categories and granular topics."
> 出处：2405.07195 §5.4 Experimental Results & Baselines

> 原文:"Additionally, InsightNet generalises well for unseen aspects and suggests new topics to be added to the taxonomy."
> 出处：2405.07195 Abstract

---

## 附录：论文信息

| 项目 | 内容 |
|------|------|
| **主论文** | InsightNet: Structured Insight Mining from Customer Feedback |
| **作者** | Sandeep Sricharan Mukku, Manan Soni, Jitenkumar Rana, et al. (Amazon Science) |
| **arXiv** | 2405.07195 |
| **年份** | 2024 |
| **核心指标** | Topic Classification F1 = 0.85（较此前最优提升 11%） |
| **验证规模** | 43 个品类、2200+ 产品类型、1200+ 标签 |
| **开源状态** | 未开源，但方法可复现 |

**辅助参考论文**：
- SEAD: Self-Evolving Agent for Multi-Turn Service Dialogue (美团, arXiv:2602.03548, 2026) — 自进化框架
- Can LLMs Extract Customer Needs as Well as Professional Analysts? (MIT, arXiv:2503.01870, 2025) — LLM 标注方法

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-AutoTag-SelfEvolving-Label-System`（完整卡：`references/full-card.md`）。

- 论文：2405.07195
- 标题：InsightNet : Structured Insight Mining from Customer Feedback
- 发表处：arXiv preprint (Amazon)
- venue 档位：CCF-B
- 证据基础：paper-verbatim

- 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
