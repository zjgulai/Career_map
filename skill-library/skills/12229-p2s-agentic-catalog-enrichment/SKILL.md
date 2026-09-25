---
name: "p2s-agentic-catalog-enrichment"
title: "Skill-Agentic-Catalog-Enrichment"
description: "触发词：p2s-agentic-catalog-enrichment。Skill-Agentic-Catalog-Enrichment"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 主数据治理"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
quality_tier: "curated"
p2s_card_id: "Skill-Agentic-Catalog-Enrichment"
p2s_src_domain: "00-电商Agent"
p2s_venue: "arXiv preprint"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.20844"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Agentic-Catalog-Enrichment"
rebase_vault_path: "paper2skills-vault/00-电商Agent/Skill-Agentic-Catalog-Enrichment.md"
rebase_source_sha256: "30fdc0f1eec6570a90d6ddad0e944b05aaac506de696c08586b212ac9ea29e7a"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "30fdc0f1eec6570a90d6ddad0e944b05aaac506de696c08586b212ac9ea29e7a"
rebase_full_card_bytes: "56281"
rebase_full_card_lines: "878"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "30"
rebase_evidence_quotes_total: "45"
rebase_evidence_quotes_complete: "false"
---
# Skill-Agentic-Catalog-Enrichment

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Agentic-Catalog-Enrichment`（完整卡：`references/full-card.md`，sha256 `30fdc0f1eec6570a90d6ddad0e944b05aaac506de696c08586b212ac9ea29e7a`，56281 字节 / 878 行 / 45 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 30 条（共 45 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 多源证据接地的目录属性补全（Agentic Catalog Enrichment, verify-before-write）

**这张卡解决什么**：商品目录的属性格大量空着（「适用月龄」「材质」「认证」「安全警示」），
买家筛不到、下游检索与推荐只能用粗粒度表示；人工补全在规模与增速下不可行（⑥ Q1 / Q2）。
本卡把属性补全做成一条**带证据的写库流水线**：多源取证 → 独立裁决 → 三种写库动作，
每一格都能回答「这个值是谁说的、凭什么写进去」。

---

## ① 算法原理

**核心思想**：把属性补全从「让模型猜一个值」改成「先取证、再裁决、后写库」。ScoutAgent 汇集三类证据
——卖家目录（文本与图片）、第三方商品数据 feed、**按身份匹配过**的网页搜索——只在证据确实指向

（**换底正文在此截断** —— 完整卡正文共 878 行，本页内联到第 14 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 30 / 全 45 条 —— **其余 15 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 45 条逐字引文。本页按完整卡顺序内联**前 30 条整条引文**（不在引文中间断开）；其余 15 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："On an offline human evaluation dataset, TRACE’s proposed attribute values were 98.2% accurate at 74.7% attribute coverage."
> 出处：2608.20844 §Abstract｜Q3

> 原文："Deployed in production on an industry-scale catalog, TRACE increased impression-weighted enrichment coverage across four business verticals by 90.4%."
> 出处：2608.20844 §Abstract｜Q4

> 原文："An online experiment subsequently showed that surfacing the enriched attributes on the product detail page increased checkout conversion by 0.48%."
> 出处：2608.20844 §Abstract｜Q5

**B. 问题与定位**

> 原文："Product catalogs underpin search, discovery, and recommendation in e-commerce, yet they are often attribute-sparse: the attributes shoppers and downstream systems rely on are either buried in unstructured content such as titles and images or missing from the catalog altogether."
> 出处：2608.20844 §1 Introduction｜Q1

> 原文："Manually enriching e-commerce catalogs is impractical given their scale and rapid growth."
> 出处：2608.20844 §Abstract｜Q2

> 原文："Some attribute values cannot be reliably inferred from owned data sources and must instead be sourced externally and verified against the exact product."
> 出处：2608.20844 §1 Introduction｜Q6

> 原文："Accuracy estimated from a point-in-time catalog audit may become less representative as the catalog’s product mix evolves."
> 出处：2608.20844 §1 Introduction｜Q7

> 原文："Missing or inaccurate attribute values can mislead shoppers and degrade fulfillment quality; for safety-sensitive attributes such as allergens or dietary restrictions, they can have especially serious consequences."
> 出处：2608.20844 §1 Introduction｜Q8

> 原文："We incorporate identity-matched search grounding to recover attribute values that cannot be reliably inferred from owned data sources."
> 出处：2608.20844 §1 Introduction｜Q9

> 原文："We place a JudgeAgent in the serving path as a verify-before-write gate, applying a consistent evidence standard to each proposed value and making publication quality less sensitive to shifts in the catalog’s product mix."
> 出处：2608.20844 §1 Introduction｜Q10

**C. 方法：ScoutAgent / JudgeAgent / 写库门**

> 原文："TRACE implements this process as a two-stage verify-before-write architecture. The ScoutAgent gathers evidence from multiple sources, verifies that externally retrieved evidence refers to the target product, and proposes grounded attribute values. The JudgeAgent then re-examines each candidate under a stricter verification policy and determines whether it is eligible for publication, should be blocked, or requires human review. Figure 1 shows the end-to-end workflow, and Algorithm 1 formalizes the procedure."
> 出处：2608.20844 §3.1 Overview｜Q12

> 原文："where $v_{a}$ is the proposed value, $E_{a}$ is its supporting evidence, $\tau_{a}$ records the evidence-source types, $q_{a}$ is a model-reported confidence score, and $z_{a}$ records the extraction status as one of extracted, not_found, not_applicable, ambiguous, or conflict."
> 出处：2608.20844 §3.1 Overview｜Q11

> 原文："The ScoutAgent gathers and reconciles evidence for each target attribute in two stages. It first considers readily available, product-linked information, including textual fields and product images from seller-provided catalog data and syndicated product data. When this information is insufficient to determine a reliable value for the target attribute, the ScoutAgent uses web search to gather additional evidence."
> 出处：2608.20844 §3.2 The ScoutAgent｜Q13

> 原文："This separation allows the ScoutAgent to prioritize textual evidence while still using images for attributes expressed visually, such as material, certification marks, and on-package claims."
> 出处：2608.20844 §3.2 The ScoutAgent｜Q14

> 原文："Web search may return pages that appear relevant to the query but refer to a different product or product variant."
> 出处：2608.20844 §3.2 Identity-grounded web retrieval｜Q15

> 原文："Evidence from $p$ is used only when the ScoutAgent determines that the page describes the target product; otherwise, the page is discarded."
> 出处：2608.20844 §3.2 Identity-grounded web retrieval｜Q16

> 原文："It maps benign variations to a common representation, such as “NiMH” and “nickel-metal hydride,” or “60 Hz” and “60Hz.”"
> 出处：2608.20844 §3.2 Evidence reconciliation and abstention｜Q17

> 原文："When the available evidence is insufficient, ambiguous, or conflicting, the ScoutAgent abstains rather than inferring a value from background knowledge."
> 出处：2608.20844 §3.2 Evidence reconciliation and abstention｜Q18

> 原文："It applies a stricter evidence policy than ScoutAgent, focusing on whether available evidence supports the proposed value for the target product."
> 出处：2608.20844 §3.3 The JudgeAgent｜Q19

> 原文："The distinction between UNVERIFIED and UNCERTAIN separates a lack of confirming evidence from active disagreement among the available evidence."
> 出处：2608.20844 §3.3 Verdict taxonomy｜Q20

> 原文："Candidates below the model-reported confidence threshold $\theta$ are blocked. Among the remaining candidates, those receiving PASS or UNVERIFIED are written, those receiving FAIL are blocked, and those receiving UNCERTAIN are routed to human review together with their evidence trail."
> 出处：2608.20844 §3.3 From verdict to catalog action（式 (3)）｜Q21

> 原文："Unpopulated attributes are excluded because only proposed values enter the production verification and write gate."
> 出处：2608.20844 §4.3 Evaluation Results｜Q27

> 原文："TRACE makes one ScoutAgent call and one JudgeAgent call per eligible SKU; each call returns a map of per-attribute outputs."
> 出处：2608.20844 §Appendix A Condensed Agent Prompt Templates｜Q44

**D. 离线评测**

> 原文："We evaluate TRACE on products from four business verticals: Grocery, Alcohol, Electronics, and Home Improvement. The number of distinct target attributes ranges from 11 in Grocery to 409 in Home Improvement."
> 出处：2608.20844 §4.1 Data Collection｜Q22

> 原文："This dataset contains 500 SKUs and 2,497 target SKU–attribute pairs. Human annotators established the reference attribute values, and a separate group of auditors reviewed the values proposed by the ScoutAgent."
> 出处：2608.20844 §4.1 Data Collection｜Q23

> 原文："This dataset contains 955 SKUs and 4,990 target SKU–attribute pairs. Because exhaustive human labeling was not available for these verticals, we use the JudgeAgent to adjudicate the complete dataset. The JudgeAgent results provide a scalable operational quality signal."
> 出处：2608.20844 §4.1 Data Collection｜Q24

> 原文："In particular, we refer to the fraction receiving PASS or UNVERIFIED as the judge-supported rate. This metric measures compliance with the JudgeAgent’s evidence policy and is not interpreted as human-validated accuracy."
> 出处：2608.20844 §4.2 Evaluation Metrics｜Q25

> 原文："Judge-supported rate is the fraction of all extracted values receiving a PASS or UNVERIFIED verdict; UNCERTAIN and invalid responses remain in the denominator. Publication coverage is the fraction of requested attributes receiving one of these two verdicts. Costs are normalized to Gemini 2.5 Flash."
> 出处：2608.20844 §4.4 Table 1 表注｜Q30

> 原文："On the fully human-labeled Grocery and Alcohol dataset, the ScoutAgent achieved 98.2% extraction accuracy at 74.7% attribute coverage."
> 出处：2608.20844 §4.3 Evaluation Results｜Q26

> 原文："Among values assigned PASS, 98.4% were confirmed correct by human reviewers. Of the disagreements between the JudgeAgent and human reviewers, 87.8% were false rejections — values assigned FAIL but judged correct by humans — whereas 12.2% were false acceptances."
> 出处：2608.20844 §4.3 Evaluation Results｜Q28

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Agentic-Catalog-Enrichment`（完整卡：`references/full-card.md`）。

- 论文：2608.20844
- 标题：TRACE: Agentic Catalog Enrichment with Multi-source Evidence Grounding
- 发表处：arXiv preprint
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-KG-Auto-Construction-Agent-Driven.md, Skill-Multi-Agent-Debate.md, Skill-Agent-Stage-Evaluation.md, Skill-Dense-Retrieval-Ecommerce-Semantic-Search.md, Skill-Live-Catalog-Conversational-Rec.md

- 逐字引文：45 条，全部内联于上方「原文引用」段；一条不截断。
