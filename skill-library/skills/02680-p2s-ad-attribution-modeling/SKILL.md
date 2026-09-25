---
name: "p2s-ad-attribution-modeling"
title: "Multi-Touch Attribution Modeling for Digital Advertising"
description: "触发词：多触点归因、Shapley 值、归因偏差、渠道贡献、预算重分配、末次点击陷阱。何时不用：只有单一渠道或用户旅程数据缺失时不做多触点归因；要判断某渠道的增量效果时用增量实验或地理级实验。安全边界：旅程数据涉及跨站行为，需符合隐私政策，归因结论只用于内部预算分配，不对外披露用户级轨迹。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / GMV归因分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
quality_tier: "curated"
p2s_card_id: "Skill-Ad-Attribution-Modeling"
p2s_src_domain: "13-广告分析"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Ad-Attribution-Modeling"
rebase_vault_path: "paper2skills-vault/13-广告分析/Skill-Ad-Attribution-Modeling.md"
rebase_source_sha256: "75efeaec7513dbd080cce7565e0055885217845cd4c2488650213445a78894a5"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "75efeaec7513dbd080cce7565e0055885217845cd4c2488650213445a78894a5"
rebase_full_card_bytes: "10645"
rebase_full_card_lines: "261"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "b326110c114163c3ab0e4418857f000913cf9ffa8adfee8f41c3d9bf771a3cbb"
user_summary: "用 Shapley 等数据驱动方法算渠道真实贡献，避免被末次点击误导砍错预算。"
user_try: "试试：末次点击说 Google 贡献 60%、Facebook 只有 25%，帮我用 Shapley 重算渠道贡献。"
whenToUse: "需要判断各渠道真实贡献并重分配预算时用本技能；要判断渠道的增量因果效果时用地理级实验或增量分析；只有单渠道时不需要归因。"
workflow: "收集每个转化的完整触点序列 → 计算规则归因与 Shapley 等数据驱动归因 → 对比两种口径定位被高估或低估的渠道 → 生成预算重分配建议 → 复核重分配后的 ROAS 变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Multi-Touch Attribution Modeling for Digital Advertising

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Ad-Attribution-Modeling`（完整卡：`references/full-card.md`，sha256 `75efeaec7513dbd080cce7565e0055885217845cd4c2488650213445a78894a5`，10645 字节 / 261 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `b326110c114163c3ab0e4418857f000913cf9ffa8adfee8f41c3d9bf771a3cbb`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Ad Attribution Modeling

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：用户从第一次看到广告到最终下单，平均接触5-7个触点（Facebook视频、Google搜索、TikTok短视频、再营销广告、邮件）。哪个触点真正促成了转化？最后点击（Last-Click）模型把功劳全给最后一个触点，严重低估了上层漏斗的价值。

**主流归因模型**：

| 模型 | 逻辑 | 优点 | 缺点 |
|------|------|------|------|
| **Last-Click** | 全给最后一个触点 | 简单 | 低估上层漏斗 |
| **First-Click** | 全给第一个触点 | 重视获客 | 低估再营销 |
| **Linear** | 均分给所有触点 | 公平 | 不分主次 |
| **Time-Decay** | 越近的触点权重越高 | 符合直觉 | 参数主观 |
| **Position-Based** | 首40%+尾40%+中间均分 | 兼顾获客和转化 | 固定比例不灵活 |
| **Data-Driven** | 用Shapley值或马尔可夫链计算每个触点的边际贡献 | 数据驱动、可解释 | 需要大量数据 |

**数据驱动归因——Shapley Value**：

来自合作博弈论。把每个触点视为"玩家"，转化视为"收益"。计算每个玩家的**边际贡献**：

$$\phi_i = \sum_{S \subseteq N \setminus \{i\}} \frac{|S|!(|N|-|S|-1)!}{|N|!} [v(S \cup \{i\}) - v(S)]$$

直观理解：随机打乱触点的顺序，看触点$i$加入时转化率提升了多少。平均所有排列下的提升，就是$i$的Shapley值。

**马尔可夫链归因**：

把用户旅程建模为状态转移图：
- 状态：Start → Facebook → Google → TikTok → Email → Conversion / Null
- 转移概率：从渠道A到渠道B的概率
- 移除效应：去掉某个渠道后，从Start到Conversion的概率下降多少

**2025年前沿：增量归因（Incrementality-Based）**

传统归因只追踪"谁参与了旅程"，不回答"如果没有这个广告，用户还会转化吗"。增量归因结合：
- 地理实验（Geo-Lift）：在不同地区随机开关广告，比较转化差异
- 转化 lift 研究（Conversion Lift Study）：平台提供的A/B测试框架
- 营销组合模型（MMM）：用回归分离各渠道的真实增量贡献

**反直觉洞察**：
- Last-Click会系统性贬低品牌广告（用户可能先看Facebook视频，再搜Google品牌词下单，功劳全给Google）
- 数据驱动归因需要至少10,000次转化才能稳定——小预算团队先用Position-Based
- 归因不是"找到真相"，而是"做出更好的预算分配决策"——不同的归因模型会导致完全不同的预算分配

---

## ② 母婴出海应用案例

### 场景1：Momcozy 广告预算重新分配

**业务问题**：Momcozy 月广告预算50万，分配为Facebook 30万、Google 15万、TikTok 5万。但Last-Click归因显示Google贡献60%转化，Facebook只有25%。团队想砍掉Facebook预算加到Google——这是Last-Click的陷阱。

**数据驱动归因分析**：
1. 收集用户旅程数据：每个转化的完整触点序列
2. Shapley值计算：
   - Facebook：边际贡献 38%
   - Google：边际贡献 32%
   - TikTok：边际贡献 18%
   - Email：边际贡献 12%
3. 与Last-Click对比：
   - Facebook：Last-Click 25% → Shapley 38%（被低估！）
   - Google：Last-Click 60% → Shapley 32%（被高估！）

**决策变化**：
- 原方案：Facebook 30万 → Google 45万
- 修正后：Facebook 35万、Google 25万、TikTok 15万、Email 5万
- 预期效果：整体ROAS从2.5提升到3.2

### 场景2：TikTok品牌广告的增量验证

（**换底正文在此截断** —— 完整卡正文共 261 行，本页内联到第 74 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：用户旅程级数据：每个转化对应的完整触点序列（渠道名、时间戳、触点类型）与转化标记；观测窗口需覆盖上漏斗触点，否则贡献拆分失真。

**输出**：规则归因、Shapley 值、马尔可夫链与移除效应等多种口径的贡献占比、与末次点击的偏差对照、预算重分配建议；供投放负责人调整渠道预算。

## 执行步骤

1. 收集并清洗用户旅程与触点序列
2. 计算末次点击等规则归因作为基线
3. 用 Shapley 值与马尔可夫链计算各渠道边际贡献
4. 对比基线与数据驱动结果，定位被高估或低估的渠道
5. 给出预算调整建议并复核预期 ROAS

## 边界与不做

- 何时不用：旅程数据缺失或只有单一渠道时不要做多触点归因，用平台报表或增量实验即可。
- 能力边界：本技能产出贡献拆分与预算建议，不做渠道投放执行，也不替代增量因果验证。
- 数据边界：触点采集口径（曝光与点击回传、跨端断链）直接决定结论可靠性，口径未对齐前不要把归因结果当定论。

## 技能关联

- **前置**：Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest
- **延伸**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-FrontDoor-Causal-MTA.html、Skill-FrontDoor-Causal-MTA、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Negative-Keyword-Safe-Guard.html、Skill-Negative-Keyword-Safe-Guard、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-Ad-Attribution-Modeling

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-Ad-Attribution-Modeling`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（156 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Ad-Attribution-Modeling`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Ad-Attribution-Modeling`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Ad-Attribution-Modeling`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Ad-Attribution-Modeling`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Ad-Attribution-Modeling`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1704.06690，但该号在 arXiv 上是《Electronic Metamaterials with Tunable Second-order Optical Nonlinearities》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《A Shapley ValueBased Approach to MultiTouch Attribution》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
