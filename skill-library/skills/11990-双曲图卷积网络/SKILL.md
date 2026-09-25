---
name: "p2s-hgcn-hyperbolic-graph-convolutional-networks"
title: "HGCN — 双曲图卷积网络"
description: "触发词：双曲嵌入、层次结构、品类树、图卷积、跨层级推荐。何时不用：数据不是层次树结构、或只需平铺向量检索时用常规向量与图神经网络技能；本技能解决欧氏空间保不住层次距离的问题。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
quality_tier: "curated"
p2s_card_id: "Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks"
p2s_src_domain: "08-知识图谱"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks"
rebase_vault_path: "paper2skills-vault/08-知识图谱/Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks.md"
rebase_source_sha256: "06a75ca04be06867b7e517000e3dd31439eb0e5ffae49d003ee2ade776d40ddf"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "06a75ca04be06867b7e517000e3dd31439eb0e5ffae49d003ee2ade776d40ddf"
rebase_full_card_bytes: "8268"
rebase_full_card_lines: "225"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "ee86f345ea70b287896c130617dc65676b41bcad3b7a985e6231d43a8da3d341"
user_summary: "让品类树这类层次结构在向量空间里保持层级距离，跨层级推荐和新品自动分类更准。"
user_try: "试试：用双曲嵌入把母婴品类树编码一遍，看看跨层级推荐和新品自动分类的效果。"
whenToUse: "数据是树状或层次结构、平铺嵌入表达不了层级距离时用本技能；普通同构图上的关系推理用常规图神经网络技能。"
workflow: "构建品类层次树 → 补齐产品属性与用户交互特征 → 在双曲空间训练图卷积编码层次结构 → 评估层次距离保持与推荐准确率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# HGCN — 双曲图卷积网络

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks`（完整卡：`references/full-card.md`，sha256 `06a75ca04be06867b7e517000e3dd31439eb0e5ffae49d003ee2ade776d40ddf`，8268 字节 / 225 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `ee86f345ea70b287896c130617dc65676b41bcad3b7a985e6231d43a8da3d341`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: HGCN — 双曲图卷积网络

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想

**HGCN (Hyperbolic Graph Convolutional Networks)** 解决传统 GNN 在欧氏空间中无法有效编码层次结构的问题。核心洞察：**树状/层次化图结构（如品类树、组织架构）在欧氏空间中存在根本性的容量限制**，而双曲空间天然适合表示层次关系。

欧氏空间的局限：
- n 维球体积 ∝ r^n（多项式增长）
- 无法容纳指数增长的叶子节点
- 层次距离被压缩，深层节点无法区分

双曲空间的优势：
- n 维球体积 ∝ e^r（指数增长）
- 天然匹配树的指数分支特性
- 层次距离可保持：根→叶子距离 > 根→中间节点距离

HGCN 的核心创新：
1. **Poincaré 球模型**：在曲率 c < 0 的黎曼流形上学习节点表示
2. **Möbius 运算**：定义双曲空间中的加法、矩阵乘法、非线性激活
3. **指数/对数映射**：在双曲空间和切空间之间转换，实现可微分优化

### 数学直觉

**Poincaré 球模型**：

在 n 维 Poincaré 球中，节点嵌入 $x$ 满足 $\|x\| < 1/\sqrt{c}$。双曲距离公式：

$$d_{\mathbb{D}}(x, y) = \frac{2}{\sqrt{c}} \tanh^{-1}(\sqrt{c} \|-x \oplus_c y\|)$$

其中 $\oplus_c$ 是 Möbius 加法：

$$(1 + 2c\langle x, y \rangle + c\|y\|^2)x + (1 - c\|x\|^2)y$$

**双曲图卷积**：

消息聚合在切空间中进行（利用对数映射），然后通过指数映射回到双曲空间：


### 关键假设

1. **图具有层次结构**：节点之间存在明显的父子/上下级关系
2. **双曲空间比欧氏空间更贴合**：树的度量与双曲空间的度量一致
3. **层级信息可编码**：节点的层级位置可以通过到根节点的双曲距离表达

---

## ② 母婴出海应用案例

### 场景一：产品品类层次树嵌入

**业务问题**：

母婴电商的产品品类天然是层次树状结构（母婴 > 喂养 > 吸奶器 > [品牌A, B, C]）。传统欧氏嵌入无法保持层次距离，导致跨层级推荐不准确。

**数据要求**：

- 品类层次树：节点=品类/产品，边=父子关系
- 产品属性特征：价格带、适用人群、功能特性
- 用户交互数据：浏览、购买、收藏

**预期产出**：


**业务价值**：
- 品类推荐准确率提升 20-30%
- 新品上架自动分类准确率 > 90%
- 跨品类关联规则发现（如"买了吸奶器的用户也买了温奶器"）

---

### 场景二：品牌-品类层次对齐

**业务问题**：

多品牌母婴产品的层次结构需要统一对齐。例如：品牌A的"双边电动吸奶器"和品牌B的"智能吸奶器"应该映射到同一品类节点。

**数据要求**：

- 各品牌的产品目录（带层次结构）
- 产品属性对齐表
- 用户搜索和购买行为

**预期产出**：


**业务价值**：
- 跨品牌品类对齐自动化，节省人工维护成本 70%
- 支持多语言/多市场的统一品类体系

---

（**换底正文在此截断** —— 完整卡正文共 225 行，本页内联到第 127 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：层次化图结构数据：品类树（节点为品类或产品、边为父子关系）、产品属性特征（价格带、适用人群、功能特性）、用户交互数据（浏览、购买、收藏）。

**输出**：层次化节点嵌入，以及据此产出的跨层级推荐与新品自动分类结果，供推荐与商品归类环节使用。

## 执行步骤

1. 整理品类层次树并确认父子边
2. 补充产品属性特征与用户交互数据
3. 在双曲空间训练图卷积模型
4. 评估层次距离保持与推荐准确率
5. 输出跨层级推荐与自动分类结果

## 边界与不做

- 数据不是层次或树状结构，或只需普通向量检索时不用本技能。
- 本技能产出嵌入与分类推荐结果，不负责训练基础设施与线上服务部署。
- 技术门槛高：需理解双曲几何与黎曼优化，数值稳定性需专门处理，层次结构变化后要重新训练。

## 技能关联

- **可组合**：Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-MAS-Collaborative-Recommendation.html、Skill-MAS-Collaborative-Recommendation、Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：08-知识图谱　·　源卡：`Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（172 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 该卡的完整实现**未经交叉核对**（卡面无节选可校验）。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks`（完整卡：`references/full-card.md`）。
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
