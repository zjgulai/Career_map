---
name: "p2s-matrix-factorization"
title: "Skill Card: Matrix Factorization for Recommendation (矩阵分解推荐)"
description: "触发词：矩阵分解、协同过滤、隐因子、召回、复购推荐。何时不用：行为数据稀疏到矩阵分解训不动时用「对比学习序列推荐」；要按商品属性图做零样本推荐用「图基础模型推荐」。安全边界：隐因子与用户向量属个人信息衍生数据，须脱敏存储并按授权范围使用，不得对外输出或用于站外投放。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化"
l1_l2_l3: "业务运营/渠道经营/转化优化"
quality_tier: "curated"
p2s_card_id: "Skill-Matrix-Factorization"
p2s_src_domain: "05-推荐系统"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Matrix-Factorization"
rebase_vault_path: "paper2skills-vault/05-推荐系统/Skill-Matrix-Factorization.md"
rebase_source_sha256: "414d9945a0971e97c42f00ca116ddb273c61f4cdf399aa628379f46d7cec0991"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "414d9945a0971e97c42f00ca116ddb273c61f4cdf399aa628379f46d7cec0991"
rebase_full_card_bytes: "11989"
rebase_full_card_lines: "370"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "cce3154d806e2195863fb5b988938d33c1c253295b5eaa21f93ddf8fdcec0b23"
user_summary: "用户和商品各自压成一组隐因子向量，靠历史购买把最可能复购的商品捞出来。"
user_try: "试试：用过去 6 个月的购买记录训练矩阵分解，给有购买历史的用户各出 Top 5 复购推荐。"
whenToUse: "当已有成规模的用户—商品交互矩阵、要做召回或复购推荐时用本技能；数据稀疏到训不动用「对比学习序列推荐」；要零样本推荐用「图基础模型推荐」。"
workflow: "构建用户—商品交互矩阵（购买或评分） → 按时间切分训练集与测试集 → 训练隐因子模型并调因子数与正则 → 对活跃用户生成 Top-N 召回 → 用 CTR、复购率与覆盖率评估效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Skill Card: Matrix Factorization for Recommendation (矩阵分解推荐)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Matrix-Factorization`（完整卡：`references/full-card.md`，sha256 `414d9945a0971e97c42f00ca116ddb273c61f4cdf399aa628379f46d7cec0991`，11989 字节 / 370 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `cce3154d806e2195863fb5b988938d33c1c253295b5eaa21f93ddf8fdcec0b23`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Matrix Factorization for Recommendation (矩阵分解推荐)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
矩阵分解解决的核心问题是：**根据用户历史行为，预测用户对未交互商品的兴趣程度**。与简单统计方法不同，矩阵分解将用户和商品映射到低维隐向量空间，通过向量内积预测评分或购买概率。

### 数学直觉

**评分预测模型**：
$$\hat{r}_{ui} = \mu + b_u + b_i + q_i^T p_u$$

- $\mu$：全局平均评分
- $b_u$：用户偏差（某些用户打分偏高/偏低）
- $b_i$：商品偏差（某些商品天然好评/差评）
- $q_i$：商品隐向量
- $p_u$：用户隐向量
- $q_i^T p_u$：用户-商品匹配度

**优化目标**：
$$\min \sum_{(u,i)} (r_{ui} - \hat{r}_{ui})^2 + \lambda(||p_u||^2 + ||q_i||^2)$$

- L2 正则化防止过拟合

**ALS（交替最小二乘法）**：
1. 固定用户矩阵 P，优化商品矩阵 Q
2. 固定商品矩阵 Q，优化用户矩阵 P
3. 交替迭代直至收敛

### 关键假设
- **独立性假设**：用户对不同商品的评分相互独立
- **低秩假设**：用户-商品交互矩阵可由低维隐向量近似
- **平稳性**：用户偏好不随时间剧烈变化

---

## ② 吸奶器出海应用案例

### 场景一：吸奶器配件复购推荐

**业务问题**：
购买吸奶器的妈妈用户（如定期更换配件：喇叭罩、鸭嘴阀、储奶袋）需要"下次买什么"的推荐。传统的热销榜单无法满足个性化需求，需要基于用户历史购买记录推荐配件。

**数据要求**：
- 用户-商品交互矩阵：购买记录（隐式反馈）
- 商品特征：品类（喇叭罩、鸭嘴阀、储奶袋）、品牌、价格带
- 用户特征：历史购买品类、购买频次

**预期产出**：
- 每个用户的商品推荐列表（top N）
- 推荐理由（"买了XX的用户也买了YY"）
- 推荐分数

**业务价值**：
- 复购率提升 15-25%
- 客单价提升 5-10%
- 用户体验提升

---

### 场景二：新品冷启动推荐

**业务问题**：
新品上架时没有历史销量，需要决定推荐给哪些用户。使用矩阵分解可以：
- 找到与新品相似的已有商品
- 将新品推荐给购买过相似商品的用户

**数据要求**：
- 新品特征向量
- 历史商品隐向量
- 用户隐向量

**预期产出**：
- 新品潜在用户列表
- 推荐优先级
- 曝光策略

**业务价值**：
- 新品推广效率提升 30%+
- 库存周转提升
- 新品销量占比提升

---

（**换底正文在此截断** —— 完整卡正文共 370 行，本页内联到第 90 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：用户—商品交互矩阵（购买或评分记录，卡页示例为 3 个站点 120 万活跃用户、1200 件 SKU、半年 280 万条购买记录，并按 70% 历史与最近 30 天 30% 切分）；粒度为用户 × 商品。

**输出**：每个用户的 Top-N 推荐列表与召回率、CTR、复购率、覆盖率等评估指标；供推荐工程上线召回层并做效果对比。

## 执行步骤

1. 构建用户—商品交互矩阵并清洗异常行为
2. 按历史与最近窗口切分训练集与测试集
3. 训练隐因子模型并调因子数与正则参数
4. 对活跃用户生成 Top-N 推荐列表
5. 用 CTR、复购率与覆盖率评估上线效果

## 边界与不做

- 数据不满足：交互矩阵过于稀疏（人均交互过少）时隐因子学不出来，改用「对比学习序列推荐」等稀疏友好方法。
- 何时不用：要零样本推荐用「图基础模型推荐」；要会话内实时更新用「流式实时推荐」。
- 能力边界：只做召回层建模与评估，不替代排序模型，也不保证卡页口径的 CTR 提升。
- 安全边界：用户向量与隐因子属个人信息衍生数据，须脱敏存储并按授权范围使用，不得对外输出或用于站外投放。

## 技能关联

- **前置**：Skill-Collaborative-Filtering-Basics、Skill-Sparse-Matrix-Optimization
- **延伸**：Skill-Deep-Learning-Recommendation、Skill-Real-Time-Recommendation-Pipeline、Skill-Temporal-Dynamics-Recommendation
- **可组合**：Skill-A-B-Testing-Framework、Skill-Content-Based-Filtering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-User-Segmentation、Skill-Matrix-Factorization

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Matrix-Factorization`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（293 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Matrix-Factorization`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Matrix-Factorization`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Matrix-Factorization`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Matrix-Factorization`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Matrix-Factorization`（完整卡：`references/full-card.md`）。
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
> > > > > （卡页此段未自动抽取，本卡未记录论文出处。）
