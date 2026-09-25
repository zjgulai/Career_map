---
name: "p2s-ppc-keyword-bid-automation"
title: "PPC Keyword Bid Automation — PPC 关键词出价自动化：ML 驱动的竞价优化引擎"
description: "触发词：PPC出价自动化、贝叶斯CVR、Thompson采样、目标ACOS、长尾词提价。何时不用：关键词点击量过低导致置信度低时不自动调价；按转化率偏差做单次检验调价走关键词出价自动调整器。安全边界：出价须受最低与最高出价约束，自动化改价须获平台广告API授权并保留变更记录。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-PPC-Keyword-Bid-Automation"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "用贝叶斯估计每个关键词的转化率，每天自动算出并把出价调到接近目标 ACOS 的水平。"
user_try: "试试：账户有200个关键词、每周手动调价4小时，帮我用贝叶斯出价每天自动更新并按目标 ACOS 控制。"
whenToUse: "当关键词数量多、需要每日批量把出价收敛到目标 ACOS 时用本卡；需要按条件规则（高 ACOS 降价、无转化暂停）跑自动化时用 PPC 规则自动化引擎；只对少量词做显著性检验调价用关键词出价自动调整器。"
workflow: "导出关键词近 30-90 天展示、点击、转化与费用 → 用 Beta 先验加数据估计各词 CVR 后验 → 输出 CVR 均值、置信区间与置信度分级 → 结合目标 ACOS 与客单价算出建议最优出价 → 按置信度生成每日自动执行的出价策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PPC Keyword Bid Automation — PPC 关键词出价自动化：ML 驱动的竞价优化引擎

## ① 解决的问题

Amazon PPC 200个关键词每周手动调价4小时规则不一致导致ACOS偏高15%——贝叶斯Thompson采样每日自动更新所有关键词出价，ACOS降低15-25%年化节省广告费25-60万元

## ② 核心算法逻辑

人工出价 vs 自动化出价：

## ③ 业务应用场景

业务问题：广告账户有 200 个关键词，运营每周花 4 小时手动调价。调价规则不一致：有时候看 7 天 ACOS，有时候看 30 天，每次调整幅度也没有规律。导致高价值长尾词（"安静吸奶器上班"）出价太低，头部词（"breast pump"）出价过高。
数据要求： - 关键词历史数据（展示/点击/转化/费用，过去 30-90 天） - 目标 ACOS（按品类/SKU 不同设定） - 竞品 CPC 基准（可选，来自 Helium10）
预期产出： - 每个关键词的贝叶斯 CVR 估计（含置信区间） - 当前出价 vs 建议最优出价的差异 - 自动化出价策略配置（每日执行）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
ACOS 降低 15-25%：月广告费 ¥5万 → 节省 ¥7,500-12,500/月
运营效率提升：4小时/周 → 30分钟/周，年化节省 ¥5-10 万
长尾词发现和自动提价：增量转化 ¥2-5 万/月
年化综合 ROI：¥25-60 万
实施难度：⭐⭐☆☆☆（贝叶斯出价公式简单；需要 Amazon 广告 API；约 2-3 周；SciPy 实现不需要 ML 框架）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（134 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/ppc_keyword_bid_automation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-PPC-Keyword-Bid-Automation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
PPC Keyword Bid Automation
关键词出价自动化：贝叶斯出价优化引擎
"""
import numpy as np
from dataclasses import dataclass


@dataclass
class KeywordData:
    """关键词历史数据"""
    keyword: str
    impressions: int
    clicks: int
    orders: int
    spend: float
    current_bid: float
    target_acos: float = 0.25
    aov: float = 149.99


class BayesianBidOptimizer:
    """贝叶斯关键词出价优化器"""

    def __init__(self, min_bid: float = 0.10, max_bid: float = 5.00):
        self.min_bid = min_bid
        self.max_bid = max_bid

    def estimate_cvr(self, kw: KeywordData) -> dict:
        """
        贝叶斯 CVR 估计
        Beta(alpha, beta) 先验 + 数据 = 后验
        """
        # 先验：弱先验（1次成功，19次失败）
        alpha_prior, beta_prior = 1.0, 19.0

        # 后验（加上历史数据）
        alpha_post = alpha_prior + kw.orders
        beta_post = beta_prior + (kw.clicks - kw.orders)

        mean_cvr = alpha_post / (alpha_post + beta_post)
        # 95% 置信区间（beta分布的5%和95%分位数）
        from scipy.stats import beta as beta_dist
        ci_lower = beta_dist.ppf(0.05, alpha_post, beta_post)
        ci_upper = beta_dist.ppf(0.95, alpha_post, beta_post)

        return {
            'mean_cvr': round(mean_cvr, 4),
            'ci_lower': round(ci_lower, 4),
            'ci_upper': round(ci_upper, 4),
            'confidence': 'high' if kw.clicks > 50 else ('medium' if kw.clicks > 20 else 'low'),
        }

    def compute_optimal_bid(self, kw: KeywordData) -> dict:
        """计算最优出价"""
        cvr_est = self.estimate_cvr(kw)
        mean_cvr = cvr_est['mean_cvr']

        # 最优出价公式
        optimal_bid = (mean_cvr * kw.aov) / kw.target_acos
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.09543，但该号在 arXiv 上是《Rotating black holes experience dynamical tides》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各关键词的展示、点击、转化与费用历史（过去 30-90 天）、当前出价、按品类或 SKU 设定的目标 ACOS 与客单价，以及可选的竞品 CPC 基准；需要 Amazon 广告 API 权限。

**输出**：每个关键词的贝叶斯 CVR 估计（含 95% 置信区间与置信度分级）、当前出价与建议最优出价的差异，以及可每日执行的自动化出价策略配置，供运营审核与系统执行。

## 执行步骤

1. 导出各关键词近 30-90 天的展示、点击、转化与费用数据
2. 用 Beta 弱先验加历史转化数据估计各词 CVR 后验
3. 输出 CVR 均值、95% 置信区间与置信度分级
4. 结合目标 ACOS 与客单价计算建议最优出价
5. 对比当前出价与建议出价并按置信度决定调整幅度
6. 生成可每日自动执行的出价策略配置

## 边界与不做

- 何时不用：关键词点击量过低导致置信度评级为低、或没有设定目标 ACOS 时不应自动调价。
- 能力边界：只产出 CVR 估计与出价建议，真实改价需平台广告 API 授权；最低与最高出价边界由业务给定。
- 口径边界：目标 ACOS 按品类或 SKU 不同，口径不统一时建议出价不可比。

## 技能关联

- **前置**：Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding、Skill-Thompson-Sampling-Traffic-Allocation.html、Skill-Thompson-Sampling-Traffic-Allocation
- **延伸**：Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding、Skill-Thompson-Sampling-Traffic-Allocation.html、Skill-Thompson-Sampling-Traffic-Allocation
- **可组合**：Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-PPC-Keyword-Bid-Automation

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-PPC-Keyword-Bid-Automation`