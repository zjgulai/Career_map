---
name: "p2s-somer"
title: "Skill-SoMeR-多视角用户表示"
description: "触发词：p2s-somer。Skill Card: SoMeR Multi-View User Representation"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 需求分群"
l1_l2_l3: "业务运营/品牌与增长/分群"
quality_tier: "curated"
p2s_card_id: "Skill-SoMeR-多视角用户表示"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
p2s_paper_id: "2405.05275"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-SoMeR-多视角用户表示"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-SoMeR-多视角用户表示.md"
rebase_source_sha256: "a6f77a3c10db69e23ca47d78bbb07892621009ba13004a7f6f53a424550e40fb"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a6f77a3c10db69e23ca47d78bbb07892621009ba13004a7f6f53a424550e40fb"
rebase_full_card_bytes: "20196"
rebase_full_card_lines: "409"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "19"
rebase_evidence_quotes_total: "19"
rebase_evidence_quotes_complete: "true"
---
# Skill-SoMeR-多视角用户表示

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-SoMeR-多视角用户表示`（完整卡：`references/full-card.md`，sha256 `a6f77a3c10db69e23ca47d78bbb07892621009ba13004a7f6f53a424550e40fb`，20196 字节 / 409 行 / 19 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: SoMeR Multi-View User Representation
# SoMeR多视角用户表示学习

**论文来源**: SoMeR: A Multi-View Social Media User Representation Learning Framework  
**arXiv ID**: [2405.05275](https://arxiv.org/abs/2405.05275)  
**发表日期**: 2024-05 (AAAI 2025)  
**适用领域**: 用户嵌入学习、跨源数据融合、相似用户发现

---

## ① 算法原理

### 核心思想
传统用户画像依赖单一数据源（如评论），存在视角偏差。SoMeR提出**四视角融合框架**：将用户的时间活动、文本内容、个人资料、网络互动统一编码，通过对比学习捕捉用户相似性，生成更真实的用户嵌入。

### 数学直觉

**Triplet编码**：

**Transformer序列编码**：
将用户历史行为建模为时间序列，捕捉行为模式。

**Profile编码**：
编码用户静态属性。

**多视角融合**：

**对比学习目标**：
- 网络链接预测：学习用户社交关系
- 对比损失：相似用户嵌入更接近

**反直觉洞察**：想象一个用户在评论中说"吸奶器很好用"，但搜索历史中多次查询"静音吸奶器推荐"——单一视角会得出矛盾结论。SoMeR**融合多视角**：评论正面 + 搜索意图（关注静音）+ 购买行为（犹豫对比）→ 还原真实画像：满意但有噪音困扰，可能是下一次升级的潜在用户。

### 关键假设
1. 单一视角无法完整还原用户
2. 多源数据可以互补修正偏差
3. 用户相似性可以通过对比学习捕捉

---

## ② Momcozy吸奶器应用案例

### 场景1: 多视角融合的用户嵌入

**业务问题**  
用户U12345的数据分散在多个系统：搜索日志（REVISION）、评论（TopicImpact）、客服对话、购买记录。如何整合这些数据生成统一的用户表示？

**四视角数据输入**

| 视角 | 数据源 | 示例数据 |
|------|--------|---------|
| **时间活动** | 搜索时间序列 | D1:搜索"吸奶器推荐" → D3:搜索"静音吸奶器" → D5:购买S12 → D10:搜索"配件" |
| **文本内容** | 评论+咨询 | "吸力很强但噪音大"（评论）+ "请问有静音配件吗"（客服） |
| **个人资料** | 用户画像 | 28岁/职场/宝宝6个月 |
| **网络互动** | 社交行为 | 关注背奶妈妈群/点赞便携装备帖 |

**多视角编码**

**输出：统一用户嵌入**

**业务应用**
- **相似用户推荐**：发现与U12345相似的1000个用户，推送相同产品
- **画像补全**：利用相似用户数据补全U12345缺失的画像属性
- **流失预警**：嵌入空间漂移检测，预警用户满意度下降

---

### 场景2: 人群聚类与细分

**业务问题**  
Momcozy用户基数已达百万级，需要自动发现自然用户群体，而非预设标签。

**数据输入**

**SoMeR嵌入生成**

**发现的用户群体**

| 群体ID | 群体名称 | 嵌入特征 | 规模 | 核心特征 |
|--------|---------|---------|------|---------|
| C1 | 效率背奶型 | 维度1+ 维度4+ | 35% | 职场妈妈，注重效率，关注配件 |
| C2 | 静音敏感型 | 维度2+ 维度3- | 22% | 对噪音极度敏感，愿为静音付费 |
| C3 | 新手焦虑型 | 维度5+ 维度6+ | 18% | 首次使用，关注易用性和教程 |
| C4 | 性价比型 | 维度7+ 维度8- | 15% | 价格敏感，对比多个品牌 |
| C5 | 品质追求型 | 维度3+ 维度9+ | 10% | 注重品牌和品质，价格不敏感 |

**业务策略**

---

（**换底正文在此截断** —— 完整卡正文共 409 行，本页内联到第 157 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 19 条 · 不截断）

> 原文:"To address these limitations, we propose SoMeR, a Social Media user Representation learning framework that incorporates temporal activities, text contents, profile information, and network interactions to learn comprehensive user portraits."
> 出处：2405.05275 §Abstract

> 原文:"However, existing methods are either designed for commercial applications, or rely on specific features like text contents, activity patterns, or platform metadata, failing to holistically model user behavior across different modalities."
> 出处：2405.05275 §Abstract

> 原文:"SoMeR encodes user post streams as sequences of time-stamped textual features, uses transformers to embed this along with profile data, and jointly trains with link prediction and contrastive learning objectives to capture user similarity."
> 出处：2405.05275 §Abstract

> 原文:"We first encode user posts as a sequence of triplets of the form (timestamp, textual feature, value), which augments typically limited time series data by incorporating a variety of features from each post."
> 出处：2405.05275 §Introduction

> 原文:"We encode the contextual information of these triplets into an embedding using a transformer-based architecture"
> 出处：2405.05275 §Introduction

> 原文:"This framework allows us to discover similar users in populations with heterogeneous beliefs, attitudes, and behaviors."
> 出处：2405.05275 §Introduction

> 原文:"We combine this triplet embedding with a user profile embedding, and impose two jointly trained objectives: (1) network link prediction to learn interactions between users, and (2) contrastive learning to pull similar users closer and push dissimilar users farther away."
> 出处：2405.05275 §Introduction

> 原文:"Our framework has demonstrated scalability, handling datasets with up to 17 million texts."
> 出处：2405.05275 §Introduction

> 原文:"SoMeR achieves unexpectedly high accuracy, even if users do not post months before posting their first hate group."
> 出处：2405.05275 §Introduction

> 原文:"We format a user’s posting history into triplets of time, feature, and value, which undergo encoding via a Triplet Encoder, a transformer-based contextual learning module and a fusion attention layer, becoming a user history embedding that is then concatenated to the user profile embedding."
> 出处：2405.05275 §Figure 1

> 原文:"Other than the posting history of a user, their profile features, e.g., location and number of followers and friends, can also play an important role."
> 出处：2405.05275 §Methods

> 原文:"We design a self-supervised network link prediction objective to train our model to learn interaction activities such as sharing, following and commenting."
> 出处：2405.05275 §Methods

> 原文:"Contrastive learning aims to obtain a latent embedding space in which similar samples are closer and distinct samples are farther from each other."
> 出处：2405.05275 §Methods

> 原文:"Finally, the contrastive objective function and the network link prediction objective are jointly trained at the same time."
> 出处：2405.05275 §Methods

> 原文:"This pre-training step can be used in unsupervised settings where annotated data is hard to obtain."
> 出处：2405.05275 §Introduction

> 原文:"We choose the hidden dimension K = 64 with a grid search in [32, 64, 128]."
> 出处：2405.05275 §Methods

> 原文:"In conclusion, the consistently high F1-scores SoMer achieves demonstrate the effectiveness of our method."
> 出处：2405.05275 §Model Performance and Ablation

> 原文:"Table 3 shows that SoMeR significantly outperforms the BERT baseline by 9% and SATAR by 20% on F1-scores, indicating the effectiveness of our method."
> 出处：2405.05275 §Model Performance and Ablation

> 原文:"We show it is versatile and generalizable to different downstream tasks and across different social platforms, including detecting IO drivers, measuring online political polarization, and predicting future user participation in hate subreddits."
> 出处：2405.05275 §Conclusion

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-SoMeR-多视角用户表示`（完整卡：`references/full-card.md`）。

- 论文：2405.05275
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：19 条，全部内联于上方「原文引用」段；一条不截断。
