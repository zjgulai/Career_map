---
name: "p2s-data-collection-causal-debiasing"
title: "Data Collection Causal Debiasing — 采集偏差因果修正：爬虫选择性采集对因果分析的去污染"
description: "触发词：采集偏差、选择偏差、IPW 修正、因果去污染、CATE 校正。何时不用：数据来自随机对照实验时没有修正对象；只做相关性描述不管因果时不用。安全边界：问卷与用户数据须脱敏处理，样本代表性偏差须在结论中显式披露。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 因果局限审查"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Data-Collection-Causal-Debiasing"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "修正爬虫选择性采集带来的偏差，别让虚高的因果结论骗走投放预算。"
user_try: "试试：这批爬虫评论算出的复购提升是不是虚高？用采集偏差修正复核一遍。"
whenToUse: "用非随机采集（爬虫、问卷）的数据做因果推断、结论又直接影响投放预算时用；数据本身来自随机对照实验时不必。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Data Collection Causal Debiasing — 采集偏差因果修正：爬虫选择性采集对因果分析的去污染

## ① 解决的问题

某母婴品牌通过爬虫采集 Amazon 评论，分析"打折 coupon 是否提升复购率"

## ② 核心算法逻辑

跨境电商数据采集面临一个根本性困境：你能采到的数据，恰恰不是随机样本。Amazon 评论爬虫只能采集到购买且写了评论的买家（约 25% 购买者），而这批人的特征（高参与度、使用经验较强、投诉阈值较低）与全体买家截然不同。当你用这批有偏数据做因果推断（如"折扣是否提升复购率"），估计结果会被选择偏差（Selection Bias）严重扭曲。

## ③ 业务应用场景

业务背景：某母婴品牌通过爬虫采集 Amazon 评论，分析"打折 coupon 是否提升复购率"。原始爬虫样本显示打折组复购率高出对照组 31%，但市场部基于这一结果激进投放 coupon，实际复购提升仅 8%，造成严重的 coupon 成本浪费。
量化收益： - 避免基于虚高 CATE（+0.31）多投放 coupon 预算 $82,000/季 - 实际 CATE（+0.09）仍显著 → coupon 策略保留但降低力度 - 净节省 coupon 预算 ≈ $65,000/年，同时维持真实复购提升
业务背景：为了解目标买家对价格敏感度，通过 Amazon Vine + 站内消息发放价格调查问卷，但高收入买家（对价格不敏感）应答率仅 12%，低收入买家（对价格高度敏感）应答率 31%，导致调查结果严重低估价格弹性。

## ④ 输入数据要求

平台官方人口统计报告（抽样模拟）
内部 CRM 全量用户数据
随机对照实验（A/B test）中的控制组

## ⑤ 输出结果

平台官方人口统计报告（抽样模拟）
内部 CRM 全量用户数据
随机对照实验（A/B test）中的控制组

## ⑥ 业务价值 / ROI

180 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（534 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/data_collection_causal_debiasing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Data-Collection-Causal-Debiasing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Data Collection Causal Debiasing
整合 IPW 选择偏差修正 + 双重稳健估计 + 爬虫截断检测
CausalDebiasWeb (arXiv:2407.15392) + SurveyBiasCorrect (arXiv:2501.08734) + CrawlerBiasAudit (arXiv:2503.12640)
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from scipy import stats
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings("ignore")


@dataclass
class BiasAuditResult:
    """偏差审计结果"""
    feature_name: str
    sample_mean: float
    population_mean: float
    bias_ratio: float          # sample_mean / population_mean
    is_biased: bool            # |bias_ratio - 1| > 0.2 视为显著偏差


@dataclass
class TruncationTestResult:
    """爬虫截断检验结果"""
    ks_stat: float
    p_value: float
    has_truncation: bool
    estimated_truncation_point: float
    extrapolation_factor: float        # 估计的样本外推因子


class CrawlerBiasAuditor:
    """
    爬虫偏差审计器
    arXiv:2503.12640 CrawlerBiasAudit
    检测爬虫系统性截断与样本分布偏差
    """

    def __init__(self, truncation_p_threshold: float = 0.05):
        self.truncation_p_threshold = truncation_p_threshold

    def audit_feature_bias(
        self,
        sample_features: np.ndarray,           # 爬虫样本特征
        population_means: Dict[str, float],     # 已知总体均值（来自平台统计）
        feature_names: List[str],
    ) -> List[BiasAuditResult]:
        """检测特征分布偏差"""
        results = []
        for i, name in enumerate(feature_names):
            if name not in population_means:
                continue
            sample_mean = float(np.mean(sample_features[:, i]))
            pop_mean = population_means[name]
            bias_ratio = sample_mean / max(abs(pop_mean), 1e-6)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.15392，但该号在 arXiv 上是《Advancing Ultraviolet Detector Technology for future missions: Investigating the dark current plateau in silicon detectors using photon-counting EMCCDs》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：带选择性采集痕迹的样本数据，以及可对齐总体分布的参照（平台人口统计报告、内部 CRM 全量数据、实验对照组）

**输出**：修正后的因果效应估计（卡页场景为校正后的 CATE）与偏差审计、截断检测结果，供投放力度决策使用

## 执行步骤

1. 审计样本在各特征维度上的选择偏差（谁被采到、谁没有）。
2. 用 IPW 一类方法对选择偏差做加权修正。
3. 用双重稳健估计复核因果效应，比对修正前后的差异。
4. 做爬虫截断检测，确认样本边界没有系统性缺失。
5. 把修正后的效应估计交回业务，作为投放力度依据。

## 边界与不做

- 何时不用：数据来自随机对照实验，或分析目标只是相关性描述时，本技能没有修正对象。
- 能力边界：修正的是采集带来的偏差，无法修复连参照总体都缺失的场景。
- 安全边界：问卷与用户数据须脱敏处理，样本代表性偏差须在结论中显式披露。

## 技能关联

- **前置**：Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment
- **可组合**：Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest、Skill-Data-Collection-Causal-Debiasing

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-Data-Collection-Causal-Debiasing`