---
name: "p2s-cold-start-meta-learning-pam"
title: "Popularity-Aware Meta-Learning for Cold-Start Recommendation"
description: "触发词：元学习、冷启动推荐、流行度分层、快速适应。何时不用：新品完全没有属性或内容特征时无法迁移，先补特征；成熟品的常规推荐用通用排序模型。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-023"
l3_business: "组合取舍"
l3_all: "组合取舍 / 转化优化"
l1_l2_l3: "业务运营/产品与创新/组合取舍"
quality_tier: "curated"
p2s_card_id: "Skill-Cold-Start-Meta-Learning-PAM"
p2s_src_domain: "05-推荐系统"
p2s_venue: "CIKM 2026"
p2s_venue_tier: "CCF-B"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.10240"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Cold-Start-Meta-Learning-PAM"
rebase_vault_path: "paper2skills-vault/05-推荐系统/Skill-Cold-Start-Meta-Learning-PAM.md"
rebase_source_sha256: "f1307cf7d5249f1d8b316ab40b22e337b3de2bdb444cc4d42bdb115c68ed9610"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "f1307cf7d5249f1d8b316ab40b22e337b3de2bdb444cc4d42bdb115c68ed9610"
rebase_full_card_bytes: "40045"
rebase_full_card_lines: "620"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "fa906cd46e2180010f0dfd72a85e1d5b57b95b373925006258dd045e4a682e75"
user_summary: "按流行度分层做元学习，让新品靠少量交互就获得接近成熟品的推荐效果。"
user_try: "试试：新品上架首周转化只有 0.5%，帮我按流行度分层做一版冷启动推荐方案。"
whenToUse: "本卡属「组合取舍」。新品缺少交互但具备商品属性特征、可通过元学习快速适应时用本卡；连属性特征都缺失时先做内容理解与特征补齐。"
workflow: "按流行度对 SKU 分层 → 在高流行度 SKU 上元训练 → 新品用少量交互快速适应 → 输出专属推荐模型"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "9"
rebase_evidence_quotes_total: "32"
rebase_evidence_quotes_complete: "false"
---
# Popularity-Aware Meta-Learning for Cold-Start Recommendation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Cold-Start-Meta-Learning-PAM`（完整卡：`references/full-card.md`，sha256 `f1307cf7d5249f1d8b316ab40b22e337b3de2bdb444cc4d42bdb115c68ed9610`，40045 字节 / 620 行 / 32 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 9 条（共 32 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `fa906cd46e2180010f0dfd72a85e1d5b57b95b373925006258dd045e4a682e75`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Cold-Start Meta-Learning (PAM)

## ① 算法原理

**核心问题**：母婴品类SKU迭代快（奶粉按月龄分段、辅食按月添加），新品上架无历史交互数据，传统协同过滤无法推荐。冷启动是母婴电商的结构性痛点。

**传统方案缺陷**：
- 基于内容的推荐：只看商品属性，忽略用户偏好
- 热门兜底：新品永远打不过爆款
- 探索策略：随机曝光，转化率极低

**PAM 创新（KDD 2025, 快手）**：
按商品**流行度分层**构建元学习任务：
1. **分层策略**：将商品按历史交互量分为高/中/低流行度三层

（**换底正文在此截断** —— 完整卡正文共 620 行，本页内联到第 15 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 9 / 全 32 条 —— **其余 23 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 32 条逐字引文。本页按完整卡顺序内联**前 9 条整条引文**（不在引文中间断开）；其余 23 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Accepted at the 35th ACM International Conference on Information and Knowledge Management (CIKM ’26), November 7–11, 2026, Rome, Italy. This is the authors’ preprint version."
> 出处：2608.10240 §标题注（venue）
> 原文："These methods are trained and evaluated on benchmarks in which every item carries every modality, but real product catalogs routinely violate this assumption (Fu et al., 2026): 34.3% of Toys & Games and 48.3% of Beauty & Personal Care items have no text description, and 26% to 41% of items have no image on the four MISSRec Amazon domains."
> 出处：2608.10240 §1 Introduction（真实目录的缺模态率）
> 原文："We used four Amazon domains following the MISSRec benchmark (Wang et al., 2023): Scientific, Instruments, Arts, and Office, spanning 4,385 to 25,986 items, with 26% to 41% image-missing rates measured on our re-downloaded catalog."
> 出处：2608.10240 §3.1 Setup（Datasets）
> 原文："Table 2 reports the per-domain catalog size, total number of interactions, and image-missing rate of our re-downloaded MISSRec catalog used in the main experiments; these numbers differ from the coverage figures in MISSRec’s original Table 1 (Scientific 26.75%, Pantry 93.65%, Instruments 63.12%, Arts 44.90%, Office 63.99%) because we re-downloaded images directly from the Amazon Reviews 2023 release rather than reusing the MISSRec-provided archives."
> 出处：2608.10240 §A Dataset Statistics（缺失率口径差异）

**B. 方法：按样本掩码、四行改动、不做重标定**

> 原文："We propose Sequential Modality Dropout (SMD): during training, each modality stream (image and text) is independently erased with probability $p$ for an entire user interaction history, so the model learns to predict the next item without relying on any single modality."
> 出处：2608.10240 §Abstract
> 原文："For each training sample, each modality stream (image and text) is independently zeroed with probability $p$, and the same mask applies to every item in the user’s chronological sequence."
> 出处：2608.10240 §1 Introduction（机制）
> 原文："The mask is per-sample, not per-item: all items in user $b$’s sequence share the same modality mask."
> 出处：2608.10240 §2.2 Modality Masking
> 原文："At test time the mask is not applied, except for the deterministic masks used in our robustness evaluation (Section 3.1)."
> 出处：2608.10240 §2.2 Modality Masking
> 原文："Its goal is invariance to a genuinely missing modality rather than variance reduction, so the full-modality input seen at test is simply the $p\!=\!0$ case the model already encountered during training, and no compensating scale is required."
> 出处：2608.10240 §2.2 Modality Masking（Relation to Standard Dropout）

## 输入 / 输出契约

**输入**：用户与商品的交互记录、商品内容与属性特征，以及按流行度分层的 SKU 清单。

**输出**：分层元学习模型与新品专属推荐结果，输出新品首周转化率、达到成熟品转化率所需时间与长尾 SKU 的 GMV 占比变化。

## 执行步骤

1. 按月交互量把 SKU 分为高、中、低流行度三层
2. 在高流行度 SKU 上元训练，学习从商品属性预测偏好的初始化参数
3. 新品上架后用少量交互微调出专属模型
4. 观测新品首周转化率与长尾 SKU 的 GMV 占比

## 边界与不做

- 新品完全没有属性或内容特征、无法迁移时不用本卡
- 本卡产出分层模型与推荐参数，不负责线上推荐系统改造与流量分流

## 技能关联

- **前置**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation
- **可组合**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Cold-Start-Meta-Learning-PAM

---

> 分类：业务运营/产品与创新/组合取舍　·　技术族：05-推荐系统　·　源卡：`Skill-Cold-Start-Meta-Learning-PAM`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（139 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Cold-Start-Meta-Learning-PAM`（完整卡：`references/full-card.md`）。

- 论文：2608.10240
- 标题：Sequential Modality Dropout for Robust Multi-Modal Sequential Recommendation
- 发表处：CIKM 2026
- venue 档位：CCF-B
- 证据等级：A
- 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Matrix-Factorization.md, Skill-Semantic-ID-Retrieval-RPG.md

- 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Cold-Start-Meta-Learning-PAM`（完整卡：`references/full-card.md`）。
>
> - 论文：2608.10240
> - 标题：Sequential Modality Dropout for Robust Multi-Modal Sequential Recommendation
> - 发表处：CIKM 2026
> - venue 档位：CCF-B
> - 证据等级：A
> - 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Matrix-Factorization.md, Skill-Semantic-ID-Retrieval-RPG.md
>
> - 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Cold-Start-Meta-Learning-PAM`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2608.10240
> > - 标题：Sequential Modality Dropout for Robust Multi-Modal Sequential Recommendation
> > - 发表处：CIKM 2026
> > - venue 档位：CCF-B
> > - 证据等级：A
> > - 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Matrix-Factorization.md, Skill-Semantic-ID-Retrieval-RPG.md
> >
> > - 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Cold-Start-Meta-Learning-PAM`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2608.10240
> > > - 标题：Sequential Modality Dropout for Robust Multi-Modal Sequential Recommendation
> > > - 发表处：CIKM 2026
> > > - venue 档位：CCF-B
> > > - 证据等级：A
> > > - 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Matrix-Factorization.md, Skill-Semantic-ID-Retrieval-RPG.md
> > >
> > > - 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Cold-Start-Meta-Learning-PAM`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2608.10240
> > > > - 标题：Sequential Modality Dropout for Robust Multi-Modal Sequential Recommendation
> > > > - 发表处：CIKM 2026
> > > > - venue 档位：CCF-B
> > > > - 证据等级：A
> > > > - 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Matrix-Factorization.md, Skill-Semantic-ID-Retrieval-RPG.md
> > > >
> > > > - 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > （卡页此段未自动抽取，本卡未记录论文出处。）
