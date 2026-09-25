---
name: "p2s-irefeed"
title: "Skill-iReFeed-需求优先级排序"
description: "触发词：p2s-irefeed。Skill Card: iReFeed-需求优先级排序"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-026"
l3_business: "产品需求定义"
l3_all: "产品需求定义 / 产品范围管理"
l1_l2_l3: "业务运营/产品与创新/产品需求定义"
quality_tier: "curated"
p2s_card_id: "Skill-iReFeed-需求优先级排序"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
p2s_paper_id: "2603.28677"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-iReFeed-需求优先级排序"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-iReFeed-需求优先级排序.md"
rebase_source_sha256: "75e01ebb5cc85c1e29869a4ddcf216ee4c2aafc82bc4059e7c8a9d627318f435"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "75e01ebb5cc85c1e29869a4ddcf216ee4c2aafc82bc4059e7c8a9d627318f435"
rebase_full_card_bytes: "27602"
rebase_full_card_lines: "565"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "18"
rebase_evidence_quotes_total: "18"
rebase_evidence_quotes_complete: "true"
---
# Skill-iReFeed-需求优先级排序

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-iReFeed-需求优先级排序`（完整卡：`references/full-card.md`，sha256 `75e01ebb5cc85c1e29869a4ddcf216ee4c2aafc82bc4059e7c8a9d627318f435`，27602 字节 / 565 行 / 18 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: iReFeed-需求优先级排序

---

## ① 算法原理

**核心思想**：将用户反馈驱动的需求优先级排序从"单需求独立评估"升级为"需求簇互联评估"。传统ReFeed将反馈与单个需求关联，忽略了需求间的相互依赖性；iReFeed通过topic modeling把用户反馈聚类为主题簇，将候选需求映射到簇中，在簇级别关联反馈并计算优先级，同时引入D-value衡量需求被依赖的价值，最终通过NSGA-II三目标优化求解Next Release Problem。

**数学直觉**：

1. **需求簇级反馈关联**
   传统ReFeed将反馈 $F$ 与单个需求 $r$ 关联：
   $$P_r = \frac{\sum_{i=1}^{|F|} [sim(r, F[i]) \times (neg_{F[i]} + pos_{F[i]} + int_{F[i]})]}{|F|}$$

   iReFeed改为将反馈与需求簇 $F_C$ 关联：
   $$P_r = \frac{\sum_{i=1}^{|F_C|} [sim(r, F_C[i]) \times (neg_{F_C[i]} + pos_{F_C[i]} + int_{F_C[i]})]}{|F_C|}$$

2. **簇内聚性增强**
   为奖励内部一致的需求簇，引入coherence factor：
   $$\alpha(F_C) = \min(1, \text{average pairwise similarity of } \forall r_i, r_j \in F_C)$$
   增强后的优先级：
   $$P_r = \frac{\sum_{i=1}^{|F_C|} [\alpha(F_C) \times sim(r, F_C[i]) \times (neg_{F_C[i]} + pos_{F_C[i]} + int_{F_C[i]})]}{|F_C|}$$

3. **依赖价值 D-value**
   利用LLM自动发现需求间的"requires"关系。对于需求 $i$，其依赖价值：
   $$D\text{-}value_i = \frac{count_i}{|\mathcal{D}|}$$
   其中 $count_i$ 是需求 $i$ 作为"requires"关系右侧（被依赖方）出现的次数，$|\mathcal{D}|$ 是发现的总关系数。被越多其他需求依赖的项，D-value越高。

4. **NSGA-II 三目标优化**
   将D-value作为第三目标集成到Next Release Problem的NSGA-II求解中：
   - Maximize: 利益相关者价值总和（$\sum P_r \cdot x_r$）
   - Minimize: 开发资源成本（$\sum cost_r \cdot x_r$）
   - Maximize: 需求依赖价值（$\sum D\text{-}value_r \cdot x_r$）
   - 约束: 总成本 $\leq$ 预算；若选 $r_i$ 且 $r_i \text{ requires } r_j$，则必须选 $r_j$

**反直觉洞察**：考虑需求间关联性的优先级排序比独立评估提升F1-score达35%，因为真实产品的功能是相互依赖的，孤立评估会导致路线图不可执行。

**关键假设**：用户反馈量足够支撑有意义的topic modeling（论文中每个应用有数万条评论）；需求可以被自然地按主题聚类；存在可用的LLM用于发现"requires"关系；需求的价值和开发成本可被量化评估。

---

## ② 母婴出海应用案例

### 场景1：Momcozy季度产品功能优先级排序

**业务问题**：Momcozy每季度从Amazon US/DE/Wayfair收集用户评论，结合内部产品规划产生30-50个candidate功能需求（如"降噪改进""APP远程控制""新配件兼容"）。传统方式靠产品委员会主观打分，导致高价值需求被遗漏、依赖关系被忽视、季度路线图频繁调整。

**数据要求**：
- 季度内跨市场用户评论（每个市场≥5000条，总数≥15000条）
- candidate功能需求清单（含描述、预估成本）
- 季度开发预算上限

**应用流程**：
1. 对用户评论做LDA topic modeling，识别15-20个主题簇
2. 将candidate功能映射到主题簇，计算簇级反馈优先级 $P_r$
3. 用LLM发现功能间依赖（如"APP升级" requires "蓝牙模块更新"）
4. 计算每个功能的D-value，识别基础底座型功能
5. 输入NSGA-II优化，在价值、成本、依赖关系约束下输出最优季度功能组合

**预期产出**：
- 各功能优先级得分 $P_r$（0-1区间）
- 依赖关系图和D-value排名
- NSGA-II帕累托前沿推荐的Q1/Q2/Q3功能清单
- 示例输出：

**业务价值**：将季度功能优先级决策从"主观委员会投票"升级为"数据驱动优化"，预计减少路线图返工50%，提升用户高反馈需求的落地率40%。

### 场景2：跨市场差异化需求整合

**业务问题**：美国市场用户高频反馈"便携性"，德国市场高频反馈"静音认证"，中国市场关注"清洗方便"。各区域团队各自为政 proposing 功能需求，总部难以判断哪些是"全球通用需求"、哪些是"区域特供"。

**数据要求**：
- 分市场的用户评论数据（US/DE/CN各≥3000条）
- 各市场提报的candidate需求清单

**应用流程**：
1. 将所有市场的用户反馈统一做topic modeling，构建跨市场共享主题空间
2. 将各区域candidate需求映射到统一topic空间
3. 识别能同时覆盖多个市场高反馈的主题簇，优先排序这些"全球通用需求"
4. 区域特定需求仅在局部季度计划中安排，避免全球SKU过度膨胀

**业务价值**：降低全球产品矩阵复杂度，将资源集中投入ROI最高的通用功能；预计减少15-20%的低价值区域特供功能开发。

---

（**换底正文在此截断** —— 完整卡正文共 565 行，本页内联到第 90 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 18 条 · 不截断）

> 原文:"The experiments on 94 requirements prioritization instances from four real-world software applications show that our enhancement outperforms ReFeed."
> 出处：2603.28677 Abstract

> 原文:"Our findings show that requirements interconnectedness improves user feedback driven requirements prioritization, helps uncover additional “requires” relations in candidate requirements, and also strengthens search-based release planning."
> 出处：2603.28677 Abstract

> 原文:"In a seminal paper, Kifetew et al. [13] introduced ReFeed, a user-feedback driven requirements prioritization method. ReFeed associates user-feedback to requirements, and then computes the requirements priorities based on the extracted properties of the associated feedback."
> 出处：2603.28677 §1 Introduction

> 原文:"In contrast, emailing a scanned document requires a network connection, but not the other way around [15]."
> 出处：2603.28677 §2.2 Interrelated Requirements in Prioritization

> 原文:"Different from ReFeed, the associations are established at a requirements cluster level in our work."
> 出处：2603.28677 §3 iReFeed

> 原文:"Therefore, our results suggest that integrating cluster’s internal coherence into ranking requirements further enhances prioritization qualities."
> 出处：2603.28677 §4.2 Results and Analysis

> 原文:"In contrast, tens or hundreds of thousands of feedback messages can be readily collected for a software application, creating a sizeable critical mass for applying topic modeling."
> 出处：2603.28677 §3 iReFeed

> 原文:"For example, we extracted a total of 62,074 user reviews for Zoom from Jan 2022 to March 2025, but the Zoom requirements were collected from Feb 2022 to March 2025."
> 出处：2603.28677 §4.1 Datasets and Metrics

> 原文:"Thus, among the four variants of iReFeed, we recommend LDA-C, though it is somewhat surprising that the pre-trained BERT model with extensive external data does not definitively outperform a locally operated LDA in user-feedback driven requirements prioritization."
> 出处：2603.28677 §4.2 Results and Analysis

> 原文:"iReFeed achieves a good and balanced performance when the number of prioritized requirements is near the ground-truth size k."
> 出处：2603.28677 §4.2 Results and Analysis

> 原文:"Second, and more importantly, regardless of the LLMs, iReFeed does help uncover additional “requires” pairs that the baseline prompting fails to identify."
> 出处：2603.28677 §5 Uncovering “Requires” Pairs

> 原文:"Surprisingly, compared to feeding ChatGPT with all the requirements once, focusing on the requirements within iReFeed’s topic cluster uncovered additional “requires” pairs. These pairs, in turn, helped improve a state-of-the-art SBSE solution to the NRP."
> 出处：2603.28677 §1 Introduction

> 原文:"Admittedly, the overall accuracies of Table 4 are low."
> 出处：2603.28677 §5 Uncovering “Requires” Pairs

> 原文:"To integrate iReFeed into NSGA-II, we introduce dependency value (Dvalue). We utilize the automatically identified requires pairs from ChatGPT 4.5 combined results in RQ2 to compute the D-value."
> 出处：2603.28677 §6 Integrating iReFeed into SBSE

> 原文:"We maximize D-value as an objective in iReFeed giving importance to the requirements with higher dependencies for selection."
> 出处：2603.28677 §6 Integrating iReFeed into SBSE

> 原文:"The greater share, according to Finkelstein et al. [8], suggests the better performance of iReFeed NSGA-II compared to baseline NSGA-II."
> 出处：2603.28677 §6 Integrating iReFeed into SBSE

> 原文:"Thus, we conclude positive findings of RQ3 with iReFeed’s superiority over the baseline SBSE solution."
> 出处：2603.28677 §6 Integrating iReFeed into SBSE

> 原文:"Our future work includes carrying out experimentation on more datasets, investigating the optimal amount of feedback data to use, testing advanced prompting methods like few-shot and chain-of-thought, and guiding metaheuristic or hyper-heuristic search proactively with the “requires” pairs."
> 出处：2603.28677 §7 Conclusion

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-iReFeed-需求优先级排序`（完整卡：`references/full-card.md`）。

- 论文：2603.28677
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
