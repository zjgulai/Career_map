---
name: "p2s-compliance-ml-risk-scoring"
title: "Compliance ML Risk Scoring — 合规 ML 风险评分：用机器学习量化违规概率"
description: "触发词：合规风险评分、违规概率、审查排序、SHAP 解释、Listing 审核。何时不用：做标签公平性与偏见检测用「标签公平性与偏见审计」；做低频事件召回优化用「类别不平衡处理」。安全边界：评分只用于排定人工审查优先级，不得据分数自动下架商品或对外认定违规。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-122"
l3_business: "抽样审计"
l3_all: "抽样审计"
l1_l2_l3: "独立控制/经营与组织/抽样审计"
p2s_card_id: "Skill-Compliance-ML-Risk-Scoring"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用模型给每个 SKU 打违规概率，让有限的合规人力先审最可能出问题的那些。"
user_try: "试试：给我们在架的 35 个 SKU 打合规违规概率分，排出前 10 个需要优先审查的。"
whenToUse: "当合规审查人力有限、SKU 数量远超一次能细审的量、需要按风险排序时用本技能；做标签公平性审计用「标签公平性与偏见审计」；处理欺诈等极不平衡事件用「类别不平衡处理」。"
workflow: "抽取 Listing 内容特征（数字声明密度、文本长度等）与账号历史特征 → 用历史违规记录训练风险评分模型 → 对全部 SKU 输出违规概率并排序 → 给出前 N 个高风险 SKU 的特征解释（SHAP 值）"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Compliance ML Risk Scoring — 合规 ML 风险评分：用机器学习量化违规概率

## ① 解决的问题

35个SKU每月合规审查人力有限不知道应该先审查哪些——ML风险评分输出每个SKU的违规概率将人工审查效率提升3-5倍，主动发现新违规模式避损年化30-120万元

## ② 核心算法逻辑

规则引擎 vs ML 评分的区别：

## ③ 业务应用场景

业务问题：35个SKU每月需要合规审查，但人力有限，每次只能仔细审查8-10个。不知道应该先审查哪些，导致风险最高的SKU被遗漏。
数据要求： - 历史违规记录（被下架/警告的 SKU 及其 Listing 文本） - 当前所有 SKU 的 Listing 草稿 - 账号历史合规行为
预期产出： - 所有 SKU 的违规概率评分（0-1） - 风险排行榜：前 10 个高风险 SKU 优先处理 - 具体高风险特征解释（SHAP 值）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
批量风险排序：有限合规人力聚焦最高风险 SKU，效率提升 3-5x
主动发现规则引擎未覆盖的新违规模式：避损 ¥20-100 万/次
减少被动处理违规（下架后才发现）：每次下架损失 ¥5-50 万
年化综合 ROI：¥30-120 万（以避损为主）
实施难度：⭐⭐⭐☆☆（需要历史违规数据标注训练集；规则加权版 1 周，XGBoost 版约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（169 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/compliance/compliance_ml_risk_scoring` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Compliance-ML-Risk-Scoring.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Compliance ML Risk Scoring
机器学习合规风险评分模型
"""
import re
import numpy as np
from dataclasses import dataclass


@dataclass
class ListingData:
    sku_id: str
    title: str
    bullets: str
    description: str
    category: str
    account_age_days: int = 365
    account_violation_count: int = 0


# 合规风险词典
HIGH_RISK_WORDS = [
    'clinically proven', 'fda approved', 'medical grade', 'cure', 'treat',
    'guaranteed', 'scientifically proven', '#1', 'best ever',
    'clinically tested', 'doctor recommended', 'hospital grade',
]
MODERATE_RISK_WORDS = [
    'proven', 'certified', 'clinical', 'medical', 'professional grade',
    'recommended by', 'laboratory tested', 'dermatologist',
]
SUPERLATIVE_WORDS = [
    'best', 'perfect', 'amazing', 'incredible', 'unbeatable',
    'superior', 'ultimate', 'revolutionary', 'breakthrough',
]
COMPARATIVE_WORDS = [
    'better than', 'superior to', 'compared to', 'unlike other',
    'outperforms', 'more effective than',
]
HIGH_RISK_CATEGORIES = ['health', 'baby', 'infant', 'medical', 'beauty', 'nutrition']


def extract_compliance_features(listing: ListingData) -> np.ndarray:
    """提取合规风险特征向量"""
    full_text = f"{listing.title} {listing.bullets} {listing.description}".lower()
    word_count = max(len(full_text.split()), 1)

    # L1: 内容特征
    high_risk_hits = sum(1 for w in HIGH_RISK_WORDS if w in full_text)
    moderate_risk_hits = sum(1 for w in MODERATE_RISK_WORDS if w in full_text)
    superlative_density = sum(1 for w in SUPERLATIVE_WORDS if w in full_text) / word_count * 100
    comparative_hits = sum(1 for w in COMPARATIVE_WORDS if w in full_text)
    # 数字声明密度（含%的）
    num_claims = len(re.findall(r'\d+\s*%|\d+x\s+', full_text))
    # 文本长度（过短可能信息不充分）
    text_length_score = min(1.0, len(full_text) / 500)

    # L2: 账号历史特征
    account_age_norm = min(1.0, listing.account_age_days / 730)  # 2年内标准化
    violation_rate = listing.account_violation_count / max(1, listing.account_age_days / 30)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.08921，但该号在 arXiv 上是《AuriDESI: Mock Catalogues for the DESI Milky Way Survey》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史违规记录（被下架或警告的 SKU 及其 Listing 文本）、当前所有 SKU 的 Listing 草稿（文本与结构字段）、账号历史合规行为。

**输出**：每个 SKU 的违规概率评分（0-1）、风险排行榜（前 10 优先处理）与高风险特征解释（SHAP 值）；供合规团队排审查顺序。

## 执行步骤

1. 抽取 Listing 内容特征（数字声明密度、文本长度等）与账号历史特征
2. 用历史违规记录训练风险评分模型
3. 对全部 SKU 输出违规概率并排序
4. 给出前 N 个高风险 SKU 的特征解释（SHAP 值）

## 边界与不做

- 数据不满足：没有历史违规标注样本时无法训练（可先用规则加权版兜底），先积累标注。
- 何时不用：做公平性与偏见检测用「标签公平性与偏见审计」；处理低频事件召回用「类别不平衡处理」；只需规则词典扫描可先用规则引擎。
- 能力边界：输出风险排序与解释，不做违规判定，也不替代平台政策与实际人工审查。
- 安全边界：评分只用于排定人工审查优先级，不得据分数自动下架商品或对外认定违规。

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Regulatory-Graph-Compliance-Monitor.html、Skill-Regulatory-Graph-Compliance-Monitor、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence
- **延伸**：Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Regulatory-Graph-Compliance-Monitor.html、Skill-Regulatory-Graph-Compliance-Monitor、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence
- **可组合**：Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Compliance-ML-Risk-Scoring

---

> 分类：独立控制/经营与组织/抽样审计　·　技术族：21-合规决策　·　源卡：`Skill-Compliance-ML-Risk-Scoring`