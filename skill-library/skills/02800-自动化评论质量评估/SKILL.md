---
name: "p2s-autoqual-review-quality-assessment"
title: "AutoQual Review Quality Assessment — LLM Agent 自动化评论质量评估"
description: "触发词：评论质量、水评识别、可解释打分、高质量评论置顶、评论排序。何时不用：为 A+ 素材批量抽优质评论用「评论有用性排序模型」；本技能侧重质量特征发现与水评标记。安全边界：只做排序与标记，不修改或删除真实评论，误判需人工复核兜底。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-AutoQual-Review-Quality-Assessment"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "一眼挑出哪些评论只是好用五星的水评，把讲了具体使用场景的高质量评论挑出来展示。"
user_try: "试试：给这 3000 条评论打质量分，挑出 20 条信息量最高的，并标出刷单水评。"
whenToUse: "当评论池里水评占比高、需要可解释的质量分与低质清单时用；跨品类排序模型复用用「评论有用性排序模型」。"
workflow: "提取评论质量特征（具体性、数字、对比、场景、细节） → 用轻量分类器给每条评论打质量分 → 输出可解释的加分与减分原因 → 生成高质量评论 Top 列表与水评标记清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AutoQual Review Quality Assessment — LLM Agent 自动化评论质量评估

## ① 解决的问题

Amazon Listing 中 40% 评论是"好用""五星"等无信息量水评，买家无法获得真实决策信息——LLM Agent 自动发现可解释质量特征、轻量分类器打分排序，高质量评论置顶提升转化率 0.2-0.5%，年化 GMV 增量 20-100 万元

## ② 核心算法逻辑

核心思想：电商平台每天产生海量评论，但大量评论是无用噪音（刷单水评、"好评"两字、复制粘贴）。AutoQual 用 LLM Agent 自动发现「有用评论」的可解释特征维度（如：具体描述产品细节、说明使用场景、有比较对象），训练轻量分类器打分，亿级平台 A/B 测试验证提升转化率 0.27%。

## ③ 业务应用场景

- 业务问题：某母婴品牌 Listing 有 3,000+ 条评论，但 40% 是"好用""不错""五星"等无信息量评论，新买家看不到关键使用细节（噪音大不大、硅胶是否柔软、续航多久），导致转化决策困难。 - 数据要求：历史评论文本 + 评论评分 + 有用性投票数（可选）。 - 预期产出： - 每条评论的质量分（0-1）和可解释原因（"描述了具体使用场景 +0.3，未提供量化数据 -0.1"） - 高质量评论 Top-20 列表（用于 Listing 展示优化） - 水评/低质评论标记清单（用于向平台举报或内部过滤） - 业务价值：展示高质量评论 → 买家决策信息充分 → 转化率提升 0.2-
三轨验证： - 成本：显性成本较低，主要为 LLM API 调用费（离线标注约 $0.02/条 × 3000 条 = $60）和轻量模型训练/部署（单台服务器即可承载）。人力成本约 2 人天（特征工程 + 模型调优）。 - 合规：不触碰 Amazon 政策红线（仅对评论排序，不修改评论内容）；不涉及 GDPR 敏感数据（仅处理评论文本，无用户身份信息）；符合广告法要求（排序逻辑可解释、可审计）。 - 风险：低风险。可能引发竞品模仿（但排序逻辑可专利保护）；需注意避免误将真实差评标记为低质量（需保留人工审核兜底）；平台审查风险极低（仅优化展示顺序，非刷评行为）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：高质量评论置顶提升转化率 0.2-0.5%，月 GMV 100 万 × 0.3% = 年化 36 万元增量
实施难度：⭐⭐☆☆☆（低，主要是特征工程 + 轻量分类器）
优先级：⭐⭐⭐⭐⭐（评论质量直接影响 Listing 转化，是最高频优化场景）
评估依据：EMNLP 2025 工业 Track，亿级用户平台 A/B 测试验证转化率 +0.27%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（65 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/autoqual_review_quality_assessment` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-AutoQual-Review-Quality-Assessment.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class Review:
    review_id: str
    text: str
    rating: int
    helpful_votes: int = 0

def extract_quality_features(review: Review) -> Dict[str, float]:
    text = review.text
    words = text.split()
    sentences = text.split('。') + text.split('.')
    sentences = [s.strip() for s in sentences if len(s.strip()) > 2]
    specificity = min(1.0, len(words) / 50)
    has_numbers = any(c.isdigit() for c in text)
    has_comparison = any(k in text for k in ['比', '对比', 'vs', '之前', '换了', '相比'])
    has_scenario = any(k in text for k in ['宝宝', '孩子', '用了', '试用', '喂奶', '吸奶'])
    has_detail = any(k in text for k in ['硅胶', '噪音', '续航', '清洗', '吸力', '舒适'])
    generic_phrases = ['好用', '不错', '推荐', '五星', '好评', '值得购买']
    is_generic = any(p in text for p in generic_phrases) and len(words) < 10
    return {
        'specificity': specificity,
        'has_numbers': float(has_numbers),
        'has_comparison': float(has_comparison),
        'has_scenario': float(has_scenario),
        'has_product_detail': float(has_detail),
        'is_generic': float(is_generic),
        'length_score': min(1.0, len(words) / 30),
    }

def compute_quality_score(features: Dict[str, float]) -> float:
    weights = {
        'specificity': 0.20,
        'has_numbers': 0.10,
        'has_comparison': 0.15,
        'has_scenario': 0.20,
        'has_product_detail': 0.20,
        'is_generic': -0.25,
        'length_score': 0.15,
    }
    score = sum(features[k] * w for k, w in weights.items())
    return round(max(0.0, min(1.0, score)), 3)

def rank_reviews(reviews: List[Review]) -> List[Dict]:
    results = []
    for r in reviews:
        feats = extract_quality_features(r)
        score = compute_quality_score(feats)
        label = '高质量' if score >= 0.6 else '中等' if score >= 0.35 else '低质量'
        results.append({'review_id': r.review_id, 'score': score, 'label': label,
                        'text_preview': r.text[:50], 'features': feats})
    return sorted(results, key=lambda x: -x['score'])

reviews = [
    Review('R001', '吸奶器用了三个月了，吸力很稳定，最大档位噪音大概40分贝左右，比上一款小很多。硅胶护罩很柔软，宝宝不排斥。充一次电能用2-3次，每次30分钟左右。强烈推荐！', 5, 45),
    Review('R002', '好用，五星好评，物流也快', 5, 1),
    Review('R003', '收到货试用了一下，吸力比医院级的弱一些，但便携性好很多。硅胶材质安全，清洗方便，宝宝接受度高。价格合适，适合日常外出使用。', 4, 28),
    Review('R004', '还不错，继续观察', 4, 0),
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.08081 — AutoQual: An LLM Agent for Automated Discovery of Interpretable Features for Review Quality Assessment

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史评论文本与评分，可选有用性投票数；粒度为单条评论，建议覆盖数千条以稳定特征区分度。

**输出**：每条评论 0-1 质量分与可解释原因、高质量评论 Top 清单、低质与水评标记清单，供 Listing 展示优化与举报。

## 执行步骤

1. 汇总评论文本并提取具体性、数字、对比、场景等特征
2. 用轻量分类器给每条评论打质量分
3. 输出每条评论的可解释加分与减分原因
4. 生成高质量评论 Top 列表用于展示
5. 标记低质水评并在人工复核后处理

## 边界与不做

- 何时不用：评论量极少或语言过于单一时，特征区分度不足
- 能力边界：只对评论做质量排序与标记，不修改、删除评论，也不用于识别买家身份

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Review-Dedup-Quality-Filter.html、Skill-Review-Dedup-Quality-Filter、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-StaR-Review-Statement-Ranking.html、Skill-StaR-Review-Statement-Ranking
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-StaR-Review-Statement-Ranking.html、Skill-StaR-Review-Statement-Ranking
- **可组合**：Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-AutoQual-Review-Quality-Assessment

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：14-用户分析　·　源卡：`Skill-AutoQual-Review-Quality-Assessment`