---
name: "p2s-agrs"
title: "Skill-AGRS-属性引导评论摘要"
description: "触发词：p2s-agrs。Skill Card: AGRS-属性引导评论摘要"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / VOC编码"
l1_l2_l3: "业务运营/服务与体验/体验分析"
quality_tier: "curated"
p2s_card_id: "Skill-AGRS-属性引导评论摘要"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-AGRS-属性引导评论摘要"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-AGRS-属性引导评论摘要.md"
rebase_source_sha256: "a3d07f5d482197843feb90a66366633b02477457d3f88325bc5ac80b55a10bff"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a3d07f5d482197843feb90a66366633b02477457d3f88325bc5ac80b55a10bff"
rebase_full_card_bytes: "16133"
rebase_full_card_lines: "301"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Skill-AGRS-属性引导评论摘要

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-AGRS-属性引导评论摘要`（完整卡：`references/full-card.md`，sha256 `a3d07f5d482197843feb90a66366633b02477457d3f88325bc5ac80b55a10bff`，16133 字节 / 301 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: AGRS-属性引导评论摘要

> **证据基础声明**：本卡**有来源论文声明** —— ③ 代码模板的 docstring 里写着
> 「基于论文: End-to-End Aspect-Guided Review Summarization at Scale」。
> 但该论文**全文尚未入库**，且卡内未记录其 arXiv/DOI 编号，
> 故卡内数字**暂无逐字引文支撑**，不可当作论文结论引用。
> 待补 `paper_id` 与「⑥ 原文引用」段后转为 `paper-verbatim`。
> （2026-09-12 修正：此前误标为「无对应论文来源」，与 ③ 段 docstring 自相矛盾。）

---

## ① 算法原理

**核心思想**：将大规模LLM评论摘要从"无约束自由生成"重构为"属性引导的结构化生成"。通过ABSA提取aspect-sentiment对、consolidation去噪归一、代表性评论采样、结构化prompt引导，生成100%基于真实反馈的产品摘要，从根本上避免幻觉。

**数学直觉**：
1. **Aspect提取与整合**：对每条评论用结构化prompt提取最多5个aspect-sentiment对；通过频率阈值（95th percentile，约30次）将细粒度词汇变体映射到canonical forms，低频噪音aspect向上合并到更高级别概念。
2. **Top-K Aspect筛选**：统计整合后的aspect频率，选取Top 5作为摘要的核心骨架。
   $$\text{TopAspects} = \arg\max_{A' \subset A, |A'|=5} \sum_{a \in A'} \text{freq}(a)$$
3. **代表性评论采样**：对每个aspect-sentiment pair按频率加权采样代表性评论，既保证观点覆盖均衡，又将输入上下文限制在可控长度（上限200条评论/产品）。
4. **引导式摘要生成**：将consolidated aspects和selected reviews以固定模板组织进prompt，约束LLM输出空间和事实依据，生成300-500字符的凝练摘要。

**关键假设**：单个产品评论量≥10条才能支撑有意义的aspect统计；存在可用的LLM用于结构化提取和摘要生成；aspect consolidation的canonical映射可被有效缓存复用。

---

## ② 母婴出海应用案例

### 场景1：Momcozy消毒器双平台季度摘要

**业务问题**：Momcozy紫外线消毒器在Amazon US和Amazon DE均有销售，每季度运营团队需要汇总双平台用户反馈形成产品复盘报告，但直接阅读数千条评论效率极低，且传统LLM自由生成摘要容易出现幻觉或遗漏关键问题。

**数据要求**：
- 季度内Amazon US + Amazon DE的Momcozy紫外线消毒器评论（≥1000条）
- 字段：评论文本、星级、日期、平台标签、评论ID

**预期产出**：
- 自动提取并整合的aspect-sentiment对（如"消毒效果-positive""烘干功能-negative""容量大小-negative"）
- 经去重和频率筛选后的Top 5核心关注属性
- 基于真实评论生成的季度摘要，示例输出：
  > "关于Momcozy紫外线消毒器，用户最关注的是消毒效果、烘干功能、容量大小。具体而言，消毒效果（提及12次）满意度高；烘干功能（提及8次）吐槽较多；容量大小（提及6次）整体尚可。这些反馈主要来源于6条代表性评论。"
- 可直接用于季度管理层汇报和产品迭代roadmap输入

**业务价值**：将季度评论复盘周期从2周缩短至1天，确保摘要100% grounded in真实评论，避免LLM幻觉误导决策；预计提升产品迭代响应速度40%。

### 场景2：Momcozy暖奶器上市后快速评论监控

**业务问题**：新品Momcozy智能暖奶器上市后，需要快速捕捉早期用户反馈热点，及时调整营销策略和产品FAQ，但手动监控成本高。

**数据要求**：
- 上市后累积的Amazon评论（≥10条触发）
- 实时评论数据流或每日增量抓取

**预期产出**：
- 评论数达阈值后自动生成aspect-guided摘要
- 识别早期高关注属性（如"加热均匀性""温控精准度""操作简便性"）
-  sentiment 分布预警：若某个核心属性负面占比>50%，自动标记并推送运营团队

**业务价值**：实现新品评论监控自动化，早期问题发现时间从1-2周缩短至24-48小时，降低新品口碑危机风险。

---

（**换底正文在此截断** —— 完整卡正文共 301 行，本页内联到第 62 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-AGRS-属性引导评论摘要`（完整卡：`references/full-card.md`）。

- 标题：End-to-End Aspect-Guided Review Summarization at Scale
- venue 档位：preprint
- 证据基础：paper-traceable

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
