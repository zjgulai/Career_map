---
name: "p2s-recommendation-finance"
title: "Recommendation Finance — 推荐系统 GMV 贡献归因与毛利影响量化"
description: "触发词：推荐增量归因、Holdout 实验、利润感知排序、连带购买、推荐 ROI。何时不用：要评估搜索流量的利润贡献用「搜索流量财务归因」；要做促销增量评估用「促销 ROI 前后对比」。安全边界：Holdout 实验周期建议不超过 30 天并监控对照组留存，避免体验降级；须遵守平台公平体验政策与个人数据法规。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / GMV归因分析"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Recommendation-Finance"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用对照组实验量出推荐位带来的增量 GMV 和毛利，并把排序目标从点击率换成利润。"
user_try: "试试：用 Holdout 实验算出「经常一起购买」推荐的增量 GMV，并评估换成利润感知排序后的毛利变化。"
whenToUse: "需要量化推荐功能的增量收入与毛利、或改造排序目标时用本技能；搜索流量贡献用「搜索流量财务归因」；促销增量用「促销 ROI 前后对比」。"
workflow: "按 SKU 组划分开启推荐与未开启的 Holdout 对照组 → 控制季节性后对比两组的连带购买率与 GMV → 计算增量 GMV 与增量毛利并扣掉运营成本 → 把排序目标换成利润感知分数后重估毛利影响"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Recommendation Finance — 推荐系统 GMV 贡献归因与毛利影响量化

## ① 解决的问题

推荐系统优化 CTR 但净利润下滑——GFlowGR utility 信号将利润感知排序净利润提升 21%（Taobao 生产验证），打通推荐系统→财务最后一公里

## ② 核心算法逻辑

大多数推荐系统的优化目标是"点击率"或"转化率"，但这两个指标和财务目标（GMV、毛利）并不总是一致——推荐高单价低利润商品可能提高 GMV 但降低净利润。

## ③ 业务应用场景

业务问题：某母婴卖家在 Amazon Storefront 开启了"经常一起购买"推荐功能，但不知道它带来了多少额外销售——算法只给展示数据，财务说不清楚这个功能值不值钱。
归因量化： - 开启推荐的 SKU 组（实验组）vs 未开启的（对照组） - 控制季节性后，实验组 30 天内连带购买率高出 7.3% - 连带购买均值 $28 × 月销 500 件 × 7.3% = $1,022/月增量 GMV - 年化：$12,264，推荐功能运营成本接近 0 → ROI 极高
三轨验证： - 成本：需搭建 Holdout 实验组（5-10% 流量），数据采集与清洗约 2 人周；无额外计算资源开销。 - 合规：Amazon 允许 Storefront 功能 A/B 测试，但需确保对照组用户不因缺少推荐而体验降级（不违反 Amazon 公平体验政策）；不涉及 GDPR 个人数据收集。 - 风险：若 Holdout 组长期关闭推荐，可能导致用户流失（品牌损伤）；建议实验周期 ≤ 30 天，并监控对照组留存率。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
推荐功能 GMV 增量验证：通常 5-15%（行业均值），年化 ¥20-100 万
利润感知排序改造：毛利提升 4-8%，年化 ¥15-50 万
停止低利润推荐：减少 FBA 配件的无效推广成本 ¥3-10 万/年
年化综合 ROI：¥50-160 万
实施难度：⭐⭐☆☆☆（Holdout 实验需要 AB 权限；利润感知排序需要推荐系统源码修改）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（194 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/recommendation_finance` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-Recommendation-Finance.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Recommendation Finance — 推荐系统收入贡献量化
基于 GFlowGR (arXiv: 2506.16114) 的财务感知评估框架

依赖: numpy, dataclasses (标准库)
"""

from dataclasses import dataclass, field
import numpy as np


@dataclass
class RecommendationExperiment:
    """推荐系统 A/B 实验数据"""
    sku_id: str
    treatment_users: int       # 开启推荐的用户数
    control_users: int         # 未开启推荐的用户数
    treatment_gmv: float       # 实验组 GMV
    control_gmv: float         # 对照组 GMV
    treatment_orders: int
    control_orders: int
    gross_margin: float = 0.35
    attribution_window_days: int = 30


@dataclass
class SkuFinancialProfile:
    """SKU 财务档案"""
    sku_id: str
    price: float
    cogs: float
    recommendation_cvr: float  # 推荐转化率
    organic_cvr: float         # 自然转化率

    @property
    def gross_margin(self) -> float:
        return (self.price - self.cogs) / self.price

    @property
    def incremental_margin(self) -> float:
        """推荐带来的增量毛利（每次展示）"""
        incremental_cvr = self.recommendation_cvr - self.organic_cvr
        return incremental_cvr * self.price * self.gross_margin

    @property
    def utility_score(self) -> float:
        """GFlowGR 风格的 utility 分数（用于 profit-aware 排序）"""
        return self.recommendation_cvr * self.price * self.gross_margin


class RecommendationFinanceAnalyzer:
    """
    推荐系统财务价值分析器

    功能：
    1. 增量 GMV 归因（Holdout 实验）
    2. 利润感知排序（utility-based ranking）
    3. 推荐 ROI 报告
    """
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2506.16114 — GFlowGR: Fine-tuning Generative Recommendation Frameworks with Generative Flow Networks

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：推荐 A/B 实验数据：实验组与对照组的用户数、GMV、订单数，以及 SKU 价格、COGS、推荐转化率与自然转化率，归因窗口通常为 30 天。

**输出**：增量 GMV 与增量毛利归因结果、按利润感知分数排序的推荐方案与推荐功能 ROI 报告。

## 执行步骤

1. 设置 Holdout 对照组并采集实验数据
2. 控制季节性后计算连带购买率与 GMV 差异
3. 折算增量 GMV 与增量毛利并扣减功能成本
4. 用利润感知分数替换排序目标后重估毛利影响

## 边界与不做

- 没有 A/B 或 Holdout 权限、拿不到对照组数据时不适用，增量无法与自然增长分离
- 只做归因与排序建议，不改推荐系统源码，也不执行排序上线
- 对照组长期关闭推荐可能损伤体验，实验周期建议不超过 30 天并监控留存

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Agent-Finance-Autopilot.html、Skill-Agent-Finance-Autopilot、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supply-Chain-Finance-Risk-Modeling.html、Skill-Supply-Chain-Finance-Risk-Modeling
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Agent-Finance-Autopilot.html、Skill-Agent-Finance-Autopilot、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supply-Chain-Finance-Risk-Modeling.html、Skill-Supply-Chain-Finance-Risk-Modeling
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Agent-Finance-Autopilot.html、Skill-Agent-Finance-Autopilot、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-Supply-Chain-Finance-Risk-Modeling.html、Skill-Supply-Chain-Finance-Risk-Modeling、Skill-Recommendation-Finance

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-Recommendation-Finance`