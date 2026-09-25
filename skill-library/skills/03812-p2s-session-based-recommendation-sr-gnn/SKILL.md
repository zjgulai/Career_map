---
name: "p2s-session-based-recommendation-sr-gnn"
title: "Session-Based Recommendation with SR-GNN"
description: "触发词：会话推荐、匿名会话、会话图、下一件商品、点击流切分。何时不用：要按行为先后顺序识别决策阶段用「用户行为序列建模」；要用实时行为流毫秒级刷新推荐用「流式实时推荐」。安全边界：匿名会话不得存可识别身份信息，会话标识不得与个人身份打通用于广告；采集范围须按隐私政策告知。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化"
l1_l2_l3: "业务运营/渠道经营/转化优化"
quality_tier: "curated"
p2s_card_id: "Skill-Session-Based-Recommendation-SR-GNN"
p2s_src_domain: "05-推荐系统"
p2s_venue_tier: "CCF-A"
p2s_paper_id: "1811.00855"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Session-Based-Recommendation-SR-GNN"
rebase_vault_path: "paper2skills-vault/05-推荐系统/Skill-Session-Based-Recommendation-SR-GNN.md"
rebase_source_sha256: "207d43dd346e40829704138abda23be55cadac0740f0b8ba218a5e5f1a75e390"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "207d43dd346e40829704138abda23be55cadac0740f0b8ba218a5e5f1a75e390"
rebase_full_card_bytes: "19197"
rebase_full_card_lines: "333"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "ad3c2dbb5c796d89aac5833bbbf440091555ea2b947a921ce1baa33e3cff3c93"
user_summary: "六成用户没登录就逛：把一次会话里的点击串成图，猜他下一秒最想看哪件商品。"
user_try: "试试：把这位匿名用户 10 分钟内的点击流切成会话，用 SR-GNN 预测下一个最可能点击的商品。"
whenToUse: "当流量以匿名会话为主（卡页示例 60% 以上用户未登录）并需要只看会话内点击序列做实时推荐时用本技能；要按行为顺序识别决策阶段用「用户行为序列建模」；要毫秒级流式刷新用「流式实时推荐」。"
workflow: "按 30 分钟无活动切分会话 → 把会话内点击序列构建为有向会话图 → 训练 SR-GNN 学习商品嵌入与图参数 → 在线接收当前会话序列预测 Top-K 下一商品 → 评估匿名会话内的转化率变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "6"
rebase_evidence_quotes_total: "21"
rebase_evidence_quotes_complete: "false"
---
# Session-Based Recommendation with SR-GNN

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Session-Based-Recommendation-SR-GNN`（完整卡：`references/full-card.md`，sha256 `207d43dd346e40829704138abda23be55cadac0740f0b8ba218a5e5f1a75e390`，19197 字节 / 333 行 / 21 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 6 条（共 21 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `ad3c2dbb5c796d89aac5833bbbf440091555ea2b947a921ce1baa33e3cff3c93`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Session-Based Recommendation with SR-GNN

---

## ① 算法原理

**核心思想**：将用户匿名浏览 session 中的商品交互序列建模为图结构，用图神经网络（GNN）捕捉商品间的复杂转移关系，取代传统 RNN 只能建模线性顺序的局限。每个 session 被表示为"全局长期偏好"与"当前 session 兴趣"的注意力加权组合，预测用户下一个最可能点击的商品。

**为什么需要 SR-GNN**：


（**换底正文在此截断** —— 完整卡正文共 333 行，本页内联到第 11 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 6 / 全 21 条 —— **其余 15 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 21 条逐字引文。本页按完整卡顺序内联**前 6 条整条引文**（不在引文中间断开）；其余 15 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："The problem of session-based recommendation aims to predict users’ actions based on anonymous sessions."
> 出处：1811.00855 §Abstract（PDF 第 1 页）

> 原文："However, in many recent services, user identification may be unknown and only the user behavior history during an ongoing session is available. It is of great importance to model limited behaviors in one session and generate the recommendation."
> 出处：1811.00855 §Introduction（PDF 第 1 页）——本卡 ② 场景 1「匿名 session」的业务前提

> 原文："Previous methods on the session-based recommendation most model a session as a sequence and capture users’ preference to make recommendations. Though achieved promising results, they fail to consider the complex items transitions among all session sequences, and are insufficient to obtain accurate users’ preference in the session."
> 出处：1811.00855 §Abstract（PDF 第 1 页）——本卡「取代传统 RNN 只能建模线性顺序」的原文依据

> 原文："Besides, those RNN models use a hidden vector representing the user’s general interest, which perform badly when the session is long, due to the presence of interest drift."
> 出处：1811.00855 §Introduction（PDF 第 2 页）——本卡 ② 场景 2「实时兴趣漂移」的原文依据

> 原文："To better capture the structure of the user-click sessions and take complex transitions of items into account, we propose a novel method, i.e. Session-based Recommendation with Graph Neural Networks, SR-GNN for brevity. In the proposed method, session sequences are aggregated together and modeled as graph-structure data."
> 出处：1811.00855 §Abstract（PDF 第 1 页）

> 原文："Based on this graph, GNN can capture complex transitions of items, which are difficult to be revealed by the conventional sequential methods. Each session is then represented as the composition of the global preference and current interests of the session using an attention network."
> 出处：1811.00855 §Abstract（PDF 第 1 页）

## 输入 / 输出契约

**输入**：匿名会话日志（时间戳、会话 ID、商品 ID）、商品 metadata（类目、品牌、价格带），卡页示例用最近 30 天会话数据训练；粒度为单个会话。

**输出**：会话内的 Top-K 下一件商品推荐与匿名会话转化率评估结果；供推荐工程在无登录场景做实时推荐。

## 执行步骤

1. 按 30 分钟无活动切分原始点击流
2. 把会话内点击序列构建成有向会话图
3. 训练 SR-GNN 得到商品嵌入与图参数
4. 在线接收当前会话序列预测 Top-K 下一商品
5. 用匿名会话转化率评估上线效果

## 边界与不做

- 数据不满足：点击流无法按会话切分（缺会话 ID 或时间戳）时本方法失效，先补齐日志字段。
- 何时不用：要识别用户决策阶段用「用户行为序列建模」；要毫秒级流式刷新用「流式实时推荐」。
- 能力边界：只做会话内预测与嵌入学习，不覆盖跨会话长期偏好，也不保证卡页口径的转化提升。
- 安全边界：匿名会话不得存可识别身份信息，会话标识不得与个人身份打通用于广告；采集范围须按隐私政策告知。

## 技能关联

- **前置**：Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank
- **延伸**：Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank
- **可组合**：Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-Session-Based-Recommendation-SR-GNN

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Session-Based-Recommendation-SR-GNN`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（206 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Session-Based-Recommendation-SR-GNN`（完整卡：`references/full-card.md`）。

- 论文：1811.00855
- venue 档位：CCF-A
- 证据基础：paper-verbatim

- 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Session-Based-Recommendation-SR-GNN`（完整卡：`references/full-card.md`）。
>
> - 论文：1811.00855
> - venue 档位：CCF-A
> - 证据基础：paper-verbatim
>
> - 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Session-Based-Recommendation-SR-GNN`（完整卡：`references/full-card.md`）。
> >
> > - 论文：1811.00855
> > - venue 档位：CCF-A
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Session-Based-Recommendation-SR-GNN`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：1811.00855
> > > - venue 档位：CCF-A
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Session-Based-Recommendation-SR-GNN`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：1811.00855
> > > > - venue 档位：CCF-A
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:1811.00855 — Session-based Recommendation with Graph Neural Networks
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
