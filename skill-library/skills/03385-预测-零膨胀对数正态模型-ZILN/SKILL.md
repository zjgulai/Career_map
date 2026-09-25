---
name: "p2s-ltv-prediction-ziln"
title: "LTV预测 - 零膨胀对数正态模型 (ZILN)"
description: "触发词：ZILN、新客 LTV、零膨胀、价值分层、一次性购买概率、渠道决策。何时不用：存量用户的活跃概率判断用 BTYD 那张卡；要在首购时就预测长期价值、决定是否继续投放维护时用本卡。安全边界：用户画像与渠道特征须去标识化并获授权，分层结果不得用于歧视性定价或对外披露个体信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
quality_tier: "curated"
p2s_card_id: "Skill-LTV-Prediction-ZILN"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-LTV-Prediction-ZILN"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-LTV-Prediction-ZILN.md"
rebase_source_sha256: "50623603a39dce444d1852f42e59ec409b0da88b793870d472007339a97cb478"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "50623603a39dce444d1852f42e59ec409b0da88b793870d472007339a97cb478"
rebase_full_card_bytes: "22462"
rebase_full_card_lines: "635"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "d306e37ba62a31088626257275df1196426b437a726f602ac95c6c6c8d0212e0"
user_summary: "新客刚下单就能预测她的长期价值，决定该重点运营还是减少投入。"
user_try: "试试：这是我的新客画像、首购行为和 12 个月 LTV 标签，帮我训练 ZILN 模型并给出价值分层。"
whenToUse: "与「LTV 预测 BTYD」相比：要判断存量用户活跃与流失用 BTYD；只有首购时点的信息、要预测新客长期价值时用本卡。"
workflow: "整合新客画像、首购行为、行为与渠道特征 → 用零膨胀对数正态模型联合建模是否购买与金额 → 输出 LTV 点估计与一次性购买概率 → 按分位做价值分层并匹配运营投入"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# LTV预测 - 零膨胀对数正态模型 (ZILN)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-LTV-Prediction-ZILN`（完整卡：`references/full-card.md`，sha256 `50623603a39dce444d1852f42e59ec409b0da88b793870d472007339a97cb478`，22462 字节 / 635 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `d306e37ba62a31088626257275df1196426b437a726f602ac95c6c6c8d0212e0`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: LTV预测 - 零膨胀对数正态模型 (ZILN)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
LTV (Customer Lifetime Value, 客户生命周期价值) 预测是增长模型的核心能力。传统回归方法难以处理 LTV 分布的两个典型特征：**零膨胀**（大量用户只购买一次）和**长尾分布**（少数高价值用户贡献大部分收入）。

ZILN (Zero-Inflated Lognormal) 模型通过**联合建模流失概率和购买金额**，有效解决了这两个挑战。它假设：
1. 用户以概率 $p$ 在首次购买后流失（成为"一次性购买者"）
2. 未流失用户的消费金额服从对数正态分布

### 数学直觉

**零膨胀对数正态分布**：

对于用户 $i$ 的 LTV $Y_i$：
$$
P(Y_i = 0) = p_i \\
P(Y_i = y | Y_i > 0) = \text{Lognormal}(y; \mu_i, \sigma_i^2)
$$

**联合损失函数**：

ZILN 模型同时优化两个目标：

$$
\mathcal{L} = \underbrace{-\sum_{i} [y_i > 0] \cdot \log(1 - p_i)}_{\text{留存概率损失}} + \underbrace{\sum_{i} [y_i > 0] \cdot \left[ \frac{(\log y_i - \mu_i)^2}{2\sigma^2} + \log(y_i \sigma \sqrt{2\pi}) \right]}_{\text{对数正态损失}}
$$

其中：
- $p_i$：用户 $i$ 成为一次性购买者的概率（通过 sigmoid 输出）
- $\mu_i, \sigma_i$：对数消费金额的均值和标准差（通过网络预测）
- $[\cdot]$：指示函数

**期望 LTV 计算**：

对于预测，ZILN 计算期望 LTV：
$$
E[Y_i] = (1 - p_i) \cdot \exp\left(\mu_i + \frac{\sigma_i^2}{2}\right)
$$

### 网络架构


### 关键优势

| 挑战 | 传统方法 | ZILN 方案 |
|------|---------|----------|
| 零膨胀 | MSE 损失会被大量 0 值主导 | 分离建模流失和金额 |
| 长尾分布 | 均值回归对高值用户欠拟合 | 对数正态自然建模右偏 |
| 不确定性 | 仅输出点估计 | 同时输出均值和方差 |

---

## ② 母婴出海应用案例

### 场景一：吸奶器新客 LTV 预测

**业务问题**：
我们通过 Facebook/TikTok 广告获取了大量北美新客，但并非所有新客都有长期价值。部分用户只购买一次基础款吸奶器就流失了，而另一部分会复购配件、升级高端款，LTV 可达初购金额的 3-5 倍。我们需要在**首次购买时就预测用户的 LTV**，以决策是否值得继续投放广告维护关系。

**数据要求**：
- 用户画像：年龄、是否新手妈妈、收入水平、地域
- 首购行为：购买产品 SKU、客单价、是否使用优惠券
- 行为特征：注册到首购间隔、浏览页面数、加购次数
- 渠道特征：获客渠道、广告素材、落地页类型
- 标签：历史 LTV（6 个月/12 个月）、是否复购
- 数据量：建议至少 5,000+ 有完整 LTV 历史的用户

**预期产出**：
- **LTV 点估计**：每个新客的预测生命周期价值
- **流失概率**：该用户成为"一次性购买者"的概率
- **价值分层**：
  - 高 LTV 潜力（Top 20%）：重点运营，推送会员计划
  - 中 LTV 潜力（中间 50%）：标准运营，定期触达
  - 低 LTV 潜力（Bottom 30%）：降低维护成本

**业务价值**：
- 新客获取成本（CAC）约 $25-40，优化后预计：
  - 识别高 LTV 用户，针对性投放，ROI 提升 30-50%
  - 减少低 LTV 用户的过度营销，节省成本 20-30%
  - 精准分层运营，整体营销效率提升 25%

---

### 场景二：会员等级智能划分

**业务问题**：
我们的吸奶器品牌有一个会员体系（普通/银卡/金卡/钻石），但当前等级仅基于历史消费金额划分，属于"事后诸葛亮"。我们希望**基于预测的 LTV 进行等级划分**，让高潜力新客一加入就享受更好的服务，提升留存。

**数据要求**：
- 用户特征：同场景一
- 交互特征：客服咨询次数、App 使用频次、内容互动
- 社交特征：是否关注社交媒体、是否参与社群

（**换底正文在此截断** —— 完整卡正文共 635 行，本页内联到第 116 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：用户画像（年龄、是否新手妈妈、收入水平、地域）、首购行为（SKU、客单价、是否用券）、行为特征（注册到首购间隔、浏览页数、加购次数）、渠道特征（获客渠道、素材、落地页）与 6/12 个月 LTV 标签；建议 5,000 以上有完整 LTV 历史的用户。

**输出**：每位新客的 LTV 点估计、一次性购买概率与价值分层（卡页 Top 20% 重点运营、中间 50% 标准运营、Bottom 30% 降低维护成本），供增长与会员团队决策。

## 执行步骤

1. 整合新客画像、首购、行为与渠道特征并清洗标签。
2. 训练零膨胀对数正态模型，分别建模是否购买与金额。
3. 输出 LTV 点估计与一次性购买概率。
4. 做分位数价值分层并给出运营投入建议。
5. 定期重训并回看分层稳定性与投放决策效果。

## 边界与不做

- 何时不用：LTV 历史不足 6–12 个月、样本少于 5,000 或缺少渠道特征时不要用；存量用户价值判断用 BTYD 更稳。
- 能力边界：产出预测与分层，不自动分配预算；卡页未给出具体提升幅度，落地效果需自测。
- 安全边界：画像数据须去标识化并获授权，分层结果不得对外披露或用于歧视性定价。

## 技能关联

- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-LTV-Prediction-ZILN

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-LTV-Prediction-ZILN`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（435 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-LTV-Prediction-ZILN`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-LTV-Prediction-ZILN`（完整卡：`references/full-card.md`）。
>
> - venue 档位：non-paper
> - 证据基础：author-practice
>
> - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-LTV-Prediction-ZILN`（完整卡：`references/full-card.md`）。
> >
> > - venue 档位：non-paper
> > - 证据基础：author-practice
> >
> > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-LTV-Prediction-ZILN`（完整卡：`references/full-card.md`）。
> > >
> > > - venue 档位：non-paper
> > > - 证据基础：author-practice
> > >
> > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-LTV-Prediction-ZILN`（完整卡：`references/full-card.md`）。
> > > >
> > > > - venue 档位：non-paper
> > > > - 证据基础：author-practice
> > > >
> > > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:1912.07753 — A Deep Probabilistic Model for Customer Lifetime Value Prediction
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
