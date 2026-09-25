---
name: "p2s-alchemist-weak-supervision"
title: "Skill-ALCHEmist-Weak-Supervision"
description: "触发词：p2s-alchemist-weak-supervision。弱监督自动标注 — LLM 生成标注程序"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
quality_tier: "curated"
p2s_card_id: "Skill-ALCHEmist-Weak-Supervision"
p2s_src_domain: "07-NLP-VOC"
p2s_venue: "NeurIPS 2024"
p2s_venue_tier: "CCF-A"
p2s_paper_id: "2407.11004"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-ALCHEmist-Weak-Supervision"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-ALCHEmist-Weak-Supervision.md"
rebase_source_sha256: "ddd49efc40dec34ffa263c150a7dd68805777933f5886cd29ef6d3c0696ea674"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "ddd49efc40dec34ffa263c150a7dd68805777933f5886cd29ef6d3c0696ea674"
rebase_full_card_bytes: "17939"
rebase_full_card_lines: "350"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "12"
rebase_evidence_quotes_total: "12"
rebase_evidence_quotes_complete: "true"
---
# Skill-ALCHEmist-Weak-Supervision

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-ALCHEmist-Weak-Supervision`（完整卡：`references/full-card.md`，sha256 `ddd49efc40dec34ffa263c150a7dd68805777933f5886cd29ef6d3c0696ea674`，17939 字节 / 350 行 / 12 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 弱监督自动标注 — LLM 生成标注程序
# ALCHEmist: Automated Labeling via Program Generation

**论文来源**: The ALCHEmist: Automated Labeling 500x CHEaper Than LLM Data Annotators (NeurIPS 2024 Spotlight, arXiv:2407.11004)
**理论基础**: 弱监督学习 (Weak Supervision) + LLM 程序合成 (Program Synthesis) + 数据编程 (Data Programming)
**适用领域**: 文本分类数据标注、可审计标注规则生成、大规模语料自动标注、标注成本敏感场景

---

## ① 算法原理

### 核心思想

传统"LLM-as-Annotator"让大模型逐条标注文本——虽然比人工快，但每条都要调一次 API，成本高、不可复现、无法审计。ALCHEmist 的核心洞察是：**与其让 LLM 回答"这条评论是什么标签"，不如让 LLM 写一段"能自动判断标签"的程序**。一次 LLM 调用生成一个标注程序（label function），这个程序可以在本地无限次运行，零后续成本，还能被审查和修改。

### 技术架构


### Label Function (标注程序)

ALCHEmist 的核心是 **Label Function**——一段轻量代码，输入文本，输出标签或弃权（abstain）。


**弃权机制 (Abstain)** 是关键设计——当程序无法确定时返回 None，不参与投票，避免硬猜导致噪声。

### LLM 程序生成策略

ALCHEmist 用 LLM 生成 label functions，而非直接标注：

**1. 任务描述**: 告诉 LLM 标签定义和示例

**2. 程序生成**: LLM 输出可执行的 Python 函数

**3. 程序验证**: 在少量验证集上测试函数准确率，过滤低质量程序

**4. 程序迭代**: 对覆盖不足的数据子集，要求 LLM 生成补充程序

### 数据编程聚合 (Data Programming)

多个 label functions 对同一样本可能给出不同标签。ALCHEmist 使用 **多数投票 + 置信度加权**：

$$\hat{y} = \arg\max_{y} \sum_{i=1}^{M} \mathbb{1}[\text{lf}_i(x) = y] \cdot w_i$$

其中 $w_i$ 是第 $i$ 个 label function 的历史准确率权重。

### 与传统方法的对比

| 方法 | 每千条成本 | 可审计 | 可复用 | 准确率 |
|------|-----------|--------|--------|--------|
| 人工标注 | $500-2000 | ✓ | ✗ | 85-90% |
| LLM 逐条标注 | $10-30 | ✗ | ✗ | 88-93% |
| **ALCHEmist** | **$0.02-0.05** | **✓** | **✓** | **85-92%** |

### 关键假设

1. **LLM 程序生成能力**: LLM 能根据少量示例写出合理的文本判断程序（文本分类场景通常满足）
2. **标签可规则化**: 标签有明确的文本模式可被程序捕获（如关键词、正则、简单语义）
3. **多程序覆盖**: 每个标签需要 3-10 个互补的 label functions 才能稳定覆盖
4. **验证集存在**: 需要少量人工标注的验证集来筛选和加权程序
5. **程序可本地执行**: 生成的代码在安全沙箱中运行，避免注入风险

---

## ② 母婴出海应用案例

### 场景1：新标签快速生产可审计标注规则

**业务问题**

AutoTag 进化引擎发现新痛点"腰贴 adhesive 过敏"，需要：
1. 快速生产 500 条标注样本训练分类器
2. 运营团队需要理解"为什么这些评论被标为过敏"（可审计性）
3. 下季度产品改进后，标签定义可能微调，标注规则需要可修改

传统 LLM 逐条标注的问题：
- 500 条 × $0.01 = $5，成本尚可，但**无法解释**为什么某条被标为过敏
- 标签定义微调后，500 条全部要重新标注

**ALCHEmist 方案**

1. **LLM 生成 5 个 label functions**（1 次 API 调用，~$0.02）：

2. **本地批量标注**: 5 个程序在 5000 条评论上本地运行，零 API 成本

3. **投票聚合**: 3 个程序一致 → 高置信度；2:1 → 中置信度；分歧 → 送人工

**预期产出**

- 5000 条评论的自动标注结果，其中 ~4000 条高置信度直接采用
- 5 个可审计的标注程序（运营人员可读、可修改）
- 当标签定义微调时（如"发红超过 3 天"才算过敏），直接修改程序即可

**业务价值**

- **成本**: 5 次 LLM 调用 ≈ $0.05 vs LLM 逐条 5000 × $0.01 = $50，**成本降低 99%**
- **可审计**: 运营人员看到"这条被标为过敏是因为 lf2 匹配了'皮肤'+'红'"，信任度提升
- **可维护**: 标签定义变化时，修改程序即可，无需重新标注

### 场景2：跨境多平台评论统一标注规则库

**业务问题**

母婴出海商家在 Amazon US、Amazon DE、Shopee ID、乐天日本销售。每个平台的评论语言不同，但产品问题本质相同。传统方案是每个语言单独标注团队，或用一个 LLM 逐条处理多语言文本。

ALCHEmist 方案：**为每个标签生成语言无关的标注程序集**。

**多语言 label function 设计**


**ALCHEmist 流程**

1. 用 LLM 为每个标签生成**多语言合一**的 label function
2. 在各平台评论上统一运行
3. 输出统一的中文标签，便于跨市场对比

**业务价值**

- 一套标注规则覆盖所有语言，维护成本低
- 跨市场问题对比成为可能（如"漏尿"在美/日/德的发生率）
- 新市场扩展时，只需在 label function 中新增该语言关键词

---

（**换底正文在此截断** —— 完整卡正文共 350 行，本页内联到第 211 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 12 条 · 不截断）

> 原文:"Rather than having pretrained models label data, we task language models to generate programs that can output labels."
> 出处：2407.11004 §1 Introduction

> 原文:"For example, we find that labeling a moderately-sized dataset [12] with 7,569 data points using GPT-4 costs over $1,200."
> 出处：2407.11004 §1 Introduction

> 原文:"For example, for the dataset described above [12], the number of GPT-4 calls was reduced from 7,569 (the size of the dataset) to 10 (the number of generated programs), resulting in a massive cost reduction from $1,200 to $0.70, a 1,700-fold decrease."
> 出处：2407.11004 §1 Introduction

> 原文:"Moreover, code can be easily inspected, corrected, and extended, allowing seamless adaptation when prediction classes or labeling rules change."
> 出处：2407.11004 §1 Introduction

> 原文:"For simplicity, in this work, we focus on using the Snorkel framework [17], which is a standard and widely-used approach in the weak supervision community."
> 出处：2407.11004 §3.2 Dataset Synthesis

> 原文:"For each dataset, we input pure prompts without supplementary information into GPT-3.5 and generate 10 programs to use."
> 出处：2407.11004 §4.1 Cost Reduction and Improved Performance

> 原文:"We observe that label accuracy is improved on five out of eight datasets, particularly in challenging settings such as the MedAbs, Cancer, and French datasets, outperforming the baseline zero-shot prompting approach."
> 出处：2407.11004 §4.1 Cost Reduction and Improved Performance

> 原文:"In contrast, Alchemist only prompts 10 programs for each task, resulting in a significant reduction in the costs—by orders of magnitude."
> 出处：2407.11004 §4.1 Cost Reduction and Improved Performance

> 原文:"This is particularly evident in the SMS dataset, where WRENCH requires 73 manually crafted labeling functions to obtain high-quality labels, while Alchemist only needs 10 generated programs to obtain comparable performance and higher coverage."
> 出处：2407.11004 §4.5 Comparing to Human-crafted Programs

> 原文:"Empirically, our results indicate that Alchemist demonstrates comparable or even superior performance compared to language model-based annotation, improving five out of eight datasets with an average enhancement of 12.9%."
> 出处：2407.11004 §5 Conclusion

> 原文:"Notably, Alchemist reduces total costs by a factor of approximately 500."
> 出处：2407.11004 §5 Conclusion

> 原文:"First, API calls scale with the number of programs instead of the number of data points. That is, since we generate programs that can themselves make any number of predictions locally at no cost, we can reduce the number of API calls by orders of magnitude."
> 出处：2407.11004 §1 Introduction

---

## 附录：论文信息

| 项目 | 内容 |
|------|------|
| **主论文** | The ALCHEmist: Automated Labeling 500x CHEaper Than LLM Data Annotators |
| **作者** | Tzu-Heng Huang, Catherine Cao, Vaishnavi Bhargava, Frederic Sala |
| **单位** | University of Wisconsin-Madison |
| **会议** | NeurIPS 2024 Spotlight |
| **arXiv** | [2407.11004](https://arxiv.org/abs/2407.11004) |
| **核心指标** | 成本降低 500x，性能提升 12.9%（相对直接 LLM 标注） |
| **开源状态** | **开源** [github.com/SprocketLab/Alchemist](https://github.com/SprocketLab/Alchemist) |

**相关论文**：
- Snorkel: Rapid Training Data Creation with Weak Supervision (Stanford, VLDB 2018) — 数据编程框架
- ScriptoriumWS (ICLR Workshop 2023) — 同一团队的代码生成辅助弱监督

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-ALCHEmist-Weak-Supervision`（完整卡：`references/full-card.md`）。

- 论文：2407.11004
- 标题：The ALCHEmist: Automated Labeling 500x CHEaper Than LLM Data Annotators
- 发表处：NeurIPS 2024
- venue 档位：CCF-A
- 证据基础：paper-verbatim

- 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
