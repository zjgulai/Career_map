---
name: "p2s-behavioral-intent-tree-parsing"
title: "Skill-Behavioral-Intent-Tree-Parsing"
description: "触发词：p2s-behavioral-intent-tree-parsing。行为意图树解析"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 生命周期触达"
l1_l2_l3: "业务运营/渠道经营/转化优化"
quality_tier: "curated"
p2s_card_id: "Skill-Behavioral-Intent-Tree-Parsing"
p2s_src_domain: "07-NLP-VOC"
p2s_venue: "arXiv preprint (Netflix)"
p2s_venue_tier: "preprint"
p2s_paper_id: "2408.05353"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Behavioral-Intent-Tree-Parsing"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-Behavioral-Intent-Tree-Parsing.md"
rebase_source_sha256: "873d897f559a3588cce3b483b2688d97503468324146cd766d0492ff93ea7fcb"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "873d897f559a3588cce3b483b2688d97503468324146cd766d0492ff93ea7fcb"
rebase_full_card_bytes: "11348"
rebase_full_card_lines: "244"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "16"
rebase_evidence_quotes_total: "16"
rebase_evidence_quotes_complete: "true"
---
# Skill-Behavioral-Intent-Tree-Parsing

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Behavioral-Intent-Tree-Parsing`（完整卡：`references/full-card.md`，sha256 `873d897f559a3588cce3b483b2688d97503468324146cd766d0492ff93ea7fcb`，11348 字节 / 244 行 / 16 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 行为意图树解析
# Behavioral Intent Tree Parsing

**论文来源**: IntentRec: Predicting User Session Intent with Hierarchical Multi-Task Learning (arXiv:2408.05353, 2024)
**理论基础**: Hierarchical Multi-Task Learning + Short-term/Long-term Interest Fusion + Transformer-based Intent Encoder
**适用领域**: NLP-VOC / 用户行为分析 / 推荐系统

---

## ① 算法原理

推荐系统的核心问题不是"预测用户会点击什么"，而是"理解用户为什么点击"。IntentRec 提出**层次化多任务学习**框架，同时预测用户意图和下一个交互项目。

**核心架构**（三模块）：

1. **输入特征构建**：将用户交互序列转换为特征序列
   - 交互特征 `F`：每个行为的类别特征（Action Type, Genre）+ 数值特征（Time-since-release）
   - 短期兴趣 `S`：时间窗口 H 内的最近交互序列的聚合编码
   - 最终输入：`F ⊕ S`（拼接后送入 Transformer）

2. **用户意图编码器**（Transformer-based）：
   - 输入：`Intent-aware Feature Sequence` = `F ⊕ S ⊕ Z`（Z 为意图嵌入）
   - 输出：多个意图预测头（Action Type, Genre, Show/Movie 等）
   - 关键：用 Attention 机制聚合辅助预测结果，形成统一意图编码

3. **层次化预测**：
   - 高层：会话级主意图（DISCOVERY / COMPARISON / DECISION / PURCHASE）
   - 低层：细分意图（PRICE_SENSITIVE / QUALITY_FOCUS / BRAND_LOYAL / URGENT_NEED）
   - 高层意图直接影响低层意图的预测权重

**数学直觉**：用户行为序列是一个**隐式意图的观测序列**。IntentRec 通过多任务学习同时优化"意图识别"和"项目预测"两个目标，利用意图作为中间表示桥接行为与推荐。层次化结构确保短期波动（比价行为）不会掩盖长期偏好（品牌忠诚）。

---

## ② 母婴出海应用案例

### 案例 A：吸奶器购买路径分析

**场景**：分析用户在 Momcozy 独立站上的行为路径，识别不同购买阶段的用户意图。

**输入行为序列**：

**输出（意图树）**：

**业务价值**：
- 识别用户处于"决策阶段"且关注"品质"，推送产品细节视频而非折扣券
- 若识别为"比价阶段"，则推送限时优惠或赠品
- 转化率提升 15-25%

**数据需求**：
- 用户行为日志（点击/浏览/加购/购买/评价）
- 行为时间戳（用于区分短期/长期兴趣）
- 商品类目信息

### 案例 B：流失用户意图挽回

**场景**：识别购物车放弃用户的行为意图，制定针对性挽回策略。

**输入**：
- 放弃用户行为：SEARCH → BROWSE(3个商品) → ADD_CART → 离开（无购买）

**输出**：
- 主意图：COMPARISON（还在比较）
- 细分意图：PRICE_SENSITIVE（价格敏感型）

**业务策略**：
- 24 小时后推送"购物车商品降价提醒"（而非 generic 挽留邮件）
- 挽回率提升 20%

---

（**换底正文在此截断** —— 完整卡正文共 244 行，本页内联到第 86 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 16 条 · 不截断）

> 原文:"In this paper, we introduce IntentRec, a novel recommendation framework based on hierarchical multi-task neural network architecture that tries to estimate a user’s latent intent using their short- and long-term implicit signals as proxies and uses the intent prediction to predict the next item user is likely to engage with."
> 出处：2408.05353 Abstract

> 原文:"IntentRec consists of three major components: input feature constructor, user intent predictor, and next-item predictor."
> 出处：2408.05353 §1 Introduction

> 原文:"We explicitly model the short-term interest of a user using implicit signals happening within a certain time threshold (e.g., one week) and incorporate it while constructing the input feature sequence, while the long-term interest of a user will be modeled via a Transformer [47] later."
> 出处：2408.05353 §1 Introduction

> 原文:"The output sequence of the Transformer will be used for each intent prediction task (e.g., action type), and all the individual predictions are transformed into embeddings via projection layers."
> 出处：2408.05353 §1 Introduction

> 原文:"The intent embedding sequence will be combined with the input feature sequence to predict the next item of a user accurately."
> 出处：2408.05353 §1 Introduction

> 原文:"Then, the intent-aware feature sequence {F1 ⊕ S1 ⊕ Z1, . . . , F𝑛 ⊕ S𝑛 ⊕ Z𝑛 } again goes through the FC and normalization layer, and the output is fed to another Transformer encoder optimized for next-item prediction, whose architecture is similar to the intent encoder."
> 出处：2408.05353 §3 Proposed Method — Next-item prediction

> 原文:"The aforementioned intent-aware feature sequence is fed to a Transformer item encoder to predict the next item at each position in the sequence."
> 出处：2408.05353 §1 Introduction

> 原文:"Unlike the conventional next-item prediction, IntentRec utilizes hierarchical multi-task learning, where we conduct the intent prediction first and use the intent prediction output for the next-item prediction."
> 出处：2408.05353 §1 Introduction

> 原文:"Our paper is the first H-MTL framework that can predict the user intent using both short- and long-term interests of a user."
> 出处：2408.05353 §1 Introduction — Contributions

> 原文:"The attention layer in our intent predictor (Fig. 4) generates importance weights of each intent prediction head"
> 出处：2408.05353 §4 Discussion — intent weighting

> 原文:"We can define a user’s primary intent by investigating the highest value of attention weights of this user."
> 出处：2408.05353 §4 Discussion — intent weighting

> 原文:"Remarkably, IntentRec outperforms the best baselines: TransAct and IntentRec-V0; for instance, IntentRec shows 7.4% accuracy improvement compared to TransAct with statistical significance (p-values from Student’s t-test < 0.01)."
> 出处：2408.05353 §4.2 Next Item and Intent Prediction Accuracy

> 原文:"Timesince-release prediction is also crucial since certain users tend to engage with newly released shows/movies more frequently than other users."
> 出处：2408.05353 §4.3 Ablation Studies of IntentRec

> 原文:"Genre and Movie/Show predictions are less helpful than the others, but they still have downstream applications and business values."
> 出处：2408.05353 §4.3 Ablation Studies of IntentRec

> 原文:"Fig. 6 represents 10 unique clusters of user intent embeddings obtained by IntentRec."
> 出处：2408.05353 §4.4 intent embedding clustering

> 原文:"Extensive experiments on Netflix user engagement data demonstrate that IntentRec outperforms state-of-the-art user intent and next-item prediction models."
> 出处：2408.05353 Abstract

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Behavioral-Intent-Tree-Parsing`（完整卡：`references/full-card.md`）。

- 论文：2408.05353
- 标题：IntentRec: Predicting User Session Intent with Hierarchical Multi-Task Learning
- 发表处：arXiv preprint (Netflix)
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
