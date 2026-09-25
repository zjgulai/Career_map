---
name: "p2s-maa"
title: "Skill-MAA-行动建议生成"
description: "触发词：p2s-maa。Skill Card: MAA-行动建议生成"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 客诉聚类"
l1_l2_l3: "业务运营/服务与体验/体验分析"
quality_tier: "curated"
p2s_card_id: "Skill-MAA-行动建议生成"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-MAA-行动建议生成"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-MAA-行动建议生成.md"
rebase_source_sha256: "22e74b814280d24bfdacc2cd63990cbc107980213a734b46c71ed7ee2d91064f"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "22e74b814280d24bfdacc2cd63990cbc107980213a734b46c71ed7ee2d91064f"
rebase_full_card_bytes: "16534"
rebase_full_card_lines: "364"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Skill-MAA-行动建议生成

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-MAA-行动建议生成`（完整卡：`references/full-card.md`，sha256 `22e74b814280d24bfdacc2cd63990cbc107980213a734b46c71ed7ee2d91064f`，16534 字节 / 364 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: MAA-行动建议生成

> **证据基础声明**：本卡**有来源论文声明** —— ③ 代码模板的 docstring 里写着
> 「基于论文: A Multi-Agent System for Generating Actionable Business Advice」。
> 但该论文**全文尚未入库**，且卡内未记录其 arXiv/DOI 编号，
> 故卡内数字**暂无逐字引文支撑**，不可当作论文结论引用。
> 待补 `paper_id` 与「⑥ 原文引用」段后转为 `paper-verbatim`。
> （2026-09-12 修正：此前误标为「无对应论文来源」，与 ③ 段 docstring 自相矛盾。）

---

## ① 算法原理

**核心思想**：将大规模评论语料从"描述性分析"（情感/属性）升级为"规范性决策"（可执行建议）。通过5个智能体协作——聚类选代表评论、提取主题问题、生成候选建议、SRAC四维度评估、可行性排序——输出企业可直接落地的优先行动清单。

**数学直觉**：
1. 代表评论选择：对评论做向量表示后K-Means聚类，选取离质心余弦相似度最大的评论作为簇代表，兼顾覆盖度与去冗余。
   $$r^*_k = \arg\max_{r \in C_k} \cos(\mathbf{x}_r, \text{centroid}_k)$$
2. 建议质量门控：用Specificity、Relevance、Actionability、Concision四维度1-5分评分，加权求和判断是否达迭代阈值（≥3.5），未达标则反馈优化。
   $$\text{Score} = 0.25S + 0.25R + 0.25A + 0.25C$$
3. 可行性排序：最终按实施成本、预期效果、实操性对企业建议做Top-K排序。

**关键假设**：评论量足够大以形成代表性主题簇；中差评比纯好评更能驱动actionable洞察；企业具备基本的可行性评估标准。

---

## ② 母婴出海应用案例

### 场景1：Momcozy M5吸奶器跨市场差异化改进

**业务问题**：Momcozy M5吸奶器在美国、德国、中国市场表现差异明显，但运营团队难以从海量Amazon评论中快速提炼各市场的核心痛点和具体改进方向。

**数据要求**：
- 最近6个月Amazon US、Amazon DE、天猫旗舰店的M5吸奶器评论（≥500条/市场）
- 字段：评论文本、星级、日期、市场标签

**预期产出**：
- 各市场Top 3核心问题主题（如美国"续航焦虑"、德国"静音认证"、中国"清洗繁琐"）
- 每个主题2-3条可执行建议，按SRAC评分和可行性排序
- 示例输出："德国用户夜间使用反馈马达噪音大 → 建议1：升级马达减震结构并通过欧盟静音认证；建议2：推出夜间静音模式。可行性评分：4.2/5。"

**业务价值**：将产品研发从"凭经验拍脑袋"转向"数据驱动优先级决策"，预计减少30%无效功能开发，单次迭代可节省研发成本约15-20万元。

### 场景2：Momcozy消毒器/暖奶器季度产品复盘

**业务问题**：每季度需要基于用户反馈输出产品迭代优先级，但传统ABSA只能告诉"用户关心消毒效果"，无法直接回答"这个季度最应该改什么"。

**数据要求**：
- 季度内Amazon+Wayfair双平台Momcozy消毒器、暖奶器评论（≥1000条）
- 已抽取的aspect-sentiment对（可由AGRS技能前置处理）

**预期产出**：
- 季度高频问题主题聚类及代表评论
- 自动生成3-5条季度优先改进项及实施建议
- 直接对接产品Roadmap和Kano优先级评估

**业务价值**：缩短季度复盘周期从2周降至2天，确保迭代方向与用户痛点高度对齐，预计提升NPS 5-8分。

---

（**换底正文在此截断** —— 完整卡正文共 364 行，本页内联到第 60 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-MAA-行动建议生成`（完整卡：`references/full-card.md`）。

- 标题：A Multi-Agent System for Generating Actionable Business Advice
- venue 档位：preprint
- 证据基础：paper-traceable

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
