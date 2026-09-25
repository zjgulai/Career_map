---
name: "p2s-aspect-based-sentiment-analysis"
title: "Skill-Aspect-Based-Sentiment-Analysis"
description: "触发词：p2s-aspect-based-sentiment-analysis。Skill: Aspect-Based Sentiment Analysis (ABSA)"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 体验分析"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
quality_tier: "curated"
p2s_card_id: "Skill-Aspect-Based-Sentiment-Analysis"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Aspect-Based-Sentiment-Analysis"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-Aspect-Based-Sentiment-Analysis.md"
rebase_source_sha256: "81c6c6b1c156a987235f3491a82061dbecf53144b3ef09588350656bf2572d4c"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "81c6c6b1c156a987235f3491a82061dbecf53144b3ef09588350656bf2572d4c"
rebase_full_card_bytes: "6108"
rebase_full_card_lines: "149"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Skill-Aspect-Based-Sentiment-Analysis

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Aspect-Based-Sentiment-Analysis`（完整卡：`references/full-card.md`，sha256 `81c6c6b1c156a987235f3491a82061dbecf53144b3ef09588350656bf2572d4c`，6108 字节 / 149 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill: Aspect-Based Sentiment Analysis (ABSA)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

**核心思想**：ABSA 是一种细粒度的情感分析方法，不仅判断整体情感，还能识别评论中涉及的具体方面（aspects）及其对应的情感极性。例如，"产品质量很好，但物流太慢" → 产品质量(正面)、物流速度(负面)。

**数学直觉**：
- **两阶段分类架构**：
  - Stage 1（相关性检测）：判断评论是否提及某方面
    $$P(\text{relevant}|x) = \sigma(W_r^T \cdot \text{TF-IDF}(x) + b_r)$$
  - Stage 2（情感分类）：对提及的方面判断情感极性
    $$P(\text{sentiment}|x) = \text{softmax}(W_s^T \cdot \text{TF-IDF}(x) + b_s)$$
- **fastText 向量化**：子词嵌入处理 OOV 问题
- **多标签分类**：每个方面独立进行二分类

**关键假设**：
1. 用户评论包含可识别的方面关键词
2. 方面级情感可以独立判断
3. 文本特征（TF-IDF/词嵌入）足以支撑分类

---

## ② 母婴出海应用案例

### 场景1：电商产品评论洞察分析

**业务问题**：
母婴出海平台每天收到数万条产品评论，需要自动化分析：
- 用户最关心哪些方面？
- 哪些方面有改进空间？
- 不同品类（奶粉/尿布/辅食）的痛点有何不同？

**数据要求**：
| 方面 | 关键词示例 | 业务含义 |
|-----|-----------|---------|
| 产品质量 | 正品、品质、做工 | 核心购买决策因素 |
| 物流速度 | 快递、配送、到货 | 跨境体验关键环节 |
| 客服服务 | 售后、态度、解决 | 信任建立要素 |
| 性价比 | 价格、划算、值得 | 复购影响因素 |
| 使用体验 | 方便、效果、喜欢 | 产品适配性 |
| 安全性 | 放心、无添加、有机 | 母婴核心关切 |

**预期产出**：
- 各维度的正面/负面/中性占比
- 负面评价 Top 问题清单
- 品类对比分析（如奶粉最关注"安全性"，服装最关注"适龄性"）
- 改进建议优先级

**业务价值**：
- 产品改进有据可依，差评率降低 15-20%
- 客服响应更有针对性（快速识别用户抱怨点）
- 选品决策支持（识别供应商短板）

### 场景2：竞品评论情报分析

**业务问题**：
爬取竞品平台（Amazon、Shopee）的母婴产品评论，分析竞品的优劣势。

**数据要求**：
- 竞品评论文本（需爬虫获取）
- 产品类目映射（统一标准）

**预期产出**：
- 竞品各维度评分雷达图
- 我方 vs 竞品对比报告
- 市场空白点识别（如"有机认证"提及少但正面率高）

**业务价值**：
- 差异化定位依据
- 竞品短板就是我们的机会
- 产品详情页文案优化（强调用户关心的优势）

---

（**换底正文在此截断** —— 完整卡正文共 149 行，本页内联到第 80 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Aspect-Based-Sentiment-Analysis`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
