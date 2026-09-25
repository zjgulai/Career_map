---
name: "p2s-diversity-reranking-smmr"
title: "Diversity-Aware Reranking with SMMR"
description: "触发词：多样性重排、重复曝光、列表同质化、重排参数、品类覆盖。何时不用：要从训练侧提升长尾曝光用「异构信息网络推荐」；要用评论情感信号重排用「VOC 评论语义推荐增强」。安全边界：多样性权重必须设上限，不得为凑品类把明显不相关或不适龄的商品塞进首页列表。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 商品诊断"
l1_l2_l3: "业务运营/渠道经营/转化优化"
quality_tier: "curated"
p2s_card_id: "Skill-Diversity-Reranking-SMMR"
p2s_src_domain: "05-推荐系统"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Diversity-Reranking-SMMR"
rebase_vault_path: "paper2skills-vault/05-推荐系统/Skill-Diversity-Reranking-SMMR.md"
rebase_source_sha256: "b8eb262c1d431f49795d8adbd0e0fc4efda42e424c51c644ff07906fe05e5815"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "b8eb262c1d431f49795d8adbd0e0fc4efda42e424c51c644ff07906fe05e5815"
rebase_full_card_bytes: "7032"
rebase_full_card_lines: "184"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "c42b6328764fe6977bd9b8d32e00b42f90fbfd83bfcd27213b94759a2e51145e"
user_summary: "首页别老推那两三个爆款：在相关性不掉太多的前提下，把品类、品牌、价格带和年龄段铺开。"
user_try: "试试：对首页 Top-100 候选做 SMMR 多样性重排，参数取 λ=0.7、t=1.2，看品类覆盖和重复曝光率的变化。"
whenToUse: "当候选已召回、问题是列表同质化与重复曝光时用本技能；要从训练侧提升长尾曝光用「异构信息网络推荐」；要用评论情感信号重排用「VOC 评论语义推荐增强」。"
workflow: "取召回层 Top-100 候选与相关性分 → 按品类、品牌、价格、年龄段计算候选间相似度 → 用 SMMR 在相关性与多样性间权衡重排 → 调参数观察重复曝光率与覆盖品类数 → A/B 验证浏览深度与转化率是否守住"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Diversity-Aware Reranking with SMMR

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Diversity-Reranking-SMMR`（完整卡：`references/full-card.md`，sha256 `b8eb262c1d431f49795d8adbd0e0fc4efda42e424c51c644ff07906fe05e5815`，7032 字节 / 184 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `c42b6328764fe6977bd9b8d32e00b42f90fbfd83bfcd27213b94759a2e51145e`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Diversity-Aware Reranking (SMMR)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：传统推荐系统追求相关性最大化，导致结果高度同质化——用户搜"婴儿奶粉"，首页全是同一品牌同一段位。长期看会：
- 信息茧房：用户看不到其他选择
- 长尾枯萎：新品/小众商品永无曝光
- 平台风险：过度依赖爆款，抗风险能力差

**MMR（Maximal Marginal Relevance）经典框架**：
$$MMR_i = \lambda \cdot Relevance_i - (1-\lambda) \cdot \max_{j \in S} Similarity(i, j)$$

每选一个商品，惩罚与已选商品最相似的那个。$\lambda$ 平衡相关性 vs 多样性。

**SMMR 创新（SIGIR 2025）**：
将确定性贪心选择改为**概率采样**：
1. 引入温度参数 $t$：高温增加多样性，低温偏向相关性
2. 批量指数增长：候选池逐步扩大，早期选最相关的打底，后期引入差异品
3. 时间复杂度降至 $O(\log n)$（vs MMR 的 $O(n^2)$）

**关键洞察**：多样性不是"牺牲相关性换差异"，而是"在相关性足够高的候选池里，有策略地选择差异品"。

---

## ② 母婴出海应用案例

### 场景：首页推荐列表优化

**业务问题**：母婴电商首页"猜你喜欢"长期被2-3个爆款奶粉/纸尿裤占据，用户浏览深度下降，新品上架3个月无曝光。

**SMMR 应用**：
1. **召回层**：Top-100候选（按相关性排序）
2. **多样性重排序**：
   - 品类维度：奶粉、纸尿裤、辅食、玩具、童装均衡
   - 品牌维度：避免同一品牌连续出现
   - 价格维度：高/中/低档搭配
   - 年龄段维度：0-6月、6-12月、1-2岁、2岁+
3. **参数调优**：$\lambda=0.7$（重相关性），$t=1.2$（中高多样性）

**预期产出**：
- 首页品类覆盖：3个 → 8个品类
- 平均浏览深度：+25%
- 长尾商品点击率：+40%
- 整体转化率：维持或微降（<2%），但GMV结构更健康

**业务价值**：
- 新品冷启动加速：长尾商品获得曝光机会
- 用户留存提升：信息茧房打破，用户发现新需求
- 供应链风险分散：不过度依赖单一爆款

---

（**换底正文在此截断** —— 完整卡正文共 184 行，本页内联到第 56 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：召回候选列表及每个候选的相关性分，以及商品的品类、品牌、价格带、适用年龄段等属性；粒度为单次推荐请求。

**输出**：重排后的 Top-K 列表（含品类、品牌、价格、年龄段覆盖情况）与重复曝光率等指标；供推荐工程直接替换现有重排模块。

## 执行步骤

1. 取召回层 Top-100 候选与相关性分
2. 按品类、品牌、价格带、年龄段计算候选间相似度
3. 用 SMMR 以相关性系数 0.7 量级的权重做重排
4. 调温度参数观察重复曝光率与品类覆盖
5. A/B 验证浏览深度与整体转化是否守住

## 边界与不做

- 数据不满足：候选没有品类、品牌、价格等属性标签时算不出多样性，先补齐商品属性。
- 何时不用：要从训练侧提升长尾曝光用「异构信息网络推荐」；要用评论情感信号重排用「VOC 评论语义推荐增强」。
- 能力边界：只做后处理重排，不改变召回池与相关性打分模型，也不保证 GMV 增长。
- 安全边界：多样性权重必须设上限，不得为凑品类把不相关或不适龄商品塞进首页列表。

## 技能关联

- **前置**：Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank
- **延伸**：Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation
- **可组合**：Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Semantic-ID-Retrieval-RPG.html、Skill-Semantic-ID-Retrieval-RPG、Skill-Diversity-Reranking-SMMR

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Diversity-Reranking-SMMR`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（107 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Diversity-Reranking-SMMR`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Diversity-Reranking-SMMR`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Diversity-Reranking-SMMR`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Diversity-Reranking-SMMR`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Diversity-Reranking-SMMR`（完整卡：`references/full-card.md`）。
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
