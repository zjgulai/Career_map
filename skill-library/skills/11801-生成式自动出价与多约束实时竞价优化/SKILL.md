---
name: "p2s-rtb-realtime-bidding-optimization"
title: "RTB Realtime Bidding Optimization — 生成式自动出价与多约束实时竞价优化"
description: "触发词：实时竞价、生成式出价、Critics投票、预算提前耗尽、动态出价。何时不用：没有历史竞价日志或平台不开放实时出价接口时不适用；只要按时段做预算节奏控制用预算节奏控制器。安全边界：出价须在平台出价与预算规则内，只产出每次竞价的出价决策，不绕过平台清算与风控规则。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-RTB-Realtime-Bidding-Optimization"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "在预算与 CPA 约束下，由偏好不同的评审模型投票，为每次竞价动态生成出价而不是固定 CPA。"
user_try: "试试：黑五预算10万元，往年第二天就花光了，帮我按实时竞价给出每次曝光的动态出价策略。"
whenToUse: "当大促期间固定 CPA 出价导致预算提前耗尽或错过峰值、且已有竞价日志与实时出价接口时用本卡；只做日内预算节奏与时段分配用预算节奏控制器；按关键词维度调价用 PPC 出价类技能。"
workflow: "采集近 30 天竞价日志（出价、清算价、赢拍、转化） → 汇总竞品 CPM 区间与类目 CVR 历史曲线 → 构造状态向量（预算消耗率、时段进度、win rate、CPA） → 由三位偏好不同的评审模型对候选出价投票 → 融合投票输出每次竞价的动态出价"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RTB Realtime Bidding Optimization — 生成式自动出价与多约束实时竞价优化

## ① 解决的问题

母婴品牌 Amazon DSP/TikTok 广告按固定 CPA 出价，旺季预算提前耗尽或错过峰值时段——生成式 RTB 自动出价（Decision Transformer + Critics 投票）在预算约束下动态优化每次竞价，ROI 提升 3-5%，黑五大促 GMV 增量 15-20%，年化增量 GMV 30-100 万元

## ② 核心算法逻辑

实时竞价（RTB）本质是在预算和 CPA/ROAS 约束下的序贯决策问题：广告主每次曝光机会需要在毫秒内决定出多少价，以在整个投放周期内最大化 GMV/ROI。

## ③ 业务应用场景

业务问题：某母婴品牌年度最大促销节点，预算 10 万元，历史黑五预算经常在第 2 天提前耗尽，后 3 天完全缺席，错失 30-40% 的 GMV 机会。人工按小时调 eCPC 上限，响应太慢。
数据要求： - 历史竞价日志（出价、清算价、是否赢拍、转化结果）30 天 - 竞品 CPM 区间（来自 Amazon 广告报告） - 产品类目 CVR（转化率）历史曲线
RTB 自动出价逻辑： - 状态：(剩余预算 / 总预算, 已过时段 / 总时段, 当前 win rate, 当前 CPA) - Critics 投票：Critic-1 偏好 ROI，Critic-2 偏好预算均衡消耗，Critic-3 偏好 CPA ≤ 目标 - 输出：每次竞价的动态出价（比固定 CPA 出价灵活 30-50%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30-100 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（382 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/advertising/rtb_realtime_bidding_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-RTB-Realtime-Bidding-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
RTB Realtime Bidding Optimization - 简化版实现
基于 GAS (arXiv:2412.17018) + GAVE (arXiv:2504.14587) 核心思想
实现：Critics 投票出价机制 + CPA/预算约束下的序贯决策
只依赖 numpy，无需 torch/transformers
"""

import numpy as np


# ───────── 环境模拟 ─────────
class RTBEnvironment:
    """模拟 RTB 竞价市场环境"""

    def __init__(self, n_slots=100, budget=1000.0, target_cpa=30.0, seed=42):
        self.n_slots = n_slots
        self.budget = budget
        self.target_cpa = target_cpa
        self.rng = np.random.default_rng(seed)

    def sample_auction(self, t: int, scenario: str = "normal"):
        """
        模拟一次拍卖机会
        返回：(market_price, ad_value, cvr)
        - market_price: 赢拍所需最低清算价（元/click，eCPC 口径）
        - ad_value: 该流量预估 GMV（元，点击后转化价值）
        - cvr: 该流量转化率（0-1）
        量纲说明：market_price ~ 0.5-10 元/click，ad_value ~ 5-80 元，cvr ~ 1-25%
        """
        # 黑五场景：峰值期流量质量更高，竞争更激烈
        if scenario == "blackfriday":
            peak = 1.0 + 0.8 * np.sin(np.pi * t / self.n_slots)  # 曲线峰值
            market_price = self.rng.lognormal(1.2, 0.5) * peak
            ad_value = self.rng.lognormal(3.5, 0.4) * peak
            cvr = np.clip(self.rng.beta(2, 8) * peak * 0.8, 0.01, 0.35)
        else:
            market_price = self.rng.lognormal(1.2, 0.5)   # 均值 ≈ 3.6 元/click
            ad_value = self.rng.lognormal(3.2, 0.4)       # 均值 ≈ 26 元/GMV
            cvr = np.clip(self.rng.beta(2, 8), 0.01, 0.25)  # 均值 ≈ 20%
        return market_price, ad_value, cvr


# ───────── Critics 出价评估 ─────────
class BiddingCritic:
    """
    三个偏好不同的 Critics，对候选出价投票
    模拟 GAS 的 MCTS 风格多目标搜索
    """

    @staticmethod
    def roi_critic(bid: float, ad_value: float, cvr: float,
                   remaining_budget: float, total_budget: float) -> float:
        """Critic-1：偏好 ROI，出价不超过预估价值"""
        expected_gmv = ad_value * cvr
        if bid <= 0:
            return 0.0
        roi = expected_gmv / bid
        # 预算使用率惩罚（避免过于保守导致预算浪费）
        budget_usage = 1.0 - remaining_budget / total_budget
        budget_bonus = 0.2 * budget_usage  # 预算消耗越多，适度鼓励出价
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2504.14587 — Generative Auto-Bidding with Value-Guided Explorations

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：近 30 天竞价日志（出价、清算价、是否赢拍、转化结果）、竞品 CPM 区间（可来自广告报告）与产品类目 CVR 历史曲线，以及总预算、目标 CPA 与投放时段划分。

**输出**：每次曝光机会的动态出价决策，附预算消耗节奏与 CPA 达成跟踪，供投放系统在竞价链路中执行。

## 执行步骤

1. 采集近 30 天竞价日志（出价、清算价、赢拍与否、转化结果）
2. 汇总竞品 CPM 区间与产品类目 CVR 历史曲线
3. 构造状态向量（剩余预算比例、时段进度、win rate、当前 CPA）
4. 由偏好 ROI、预算均衡与 CPA 约束的三位评审模型分别给候选出价投票
5. 融合投票结果输出每次竞价的动态出价
6. 跟踪赢拍率、预算消耗与 CPA 是否落在约束内

## 边界与不做

- 何时不用：没有 30 天竞价日志、或平台不开放实时出价接口时不适用；日内节奏类问题用更轻的节奏控制技能。
- 能力边界：只产出出价决策，实际竞价、清算价与赢拍结果由平台侧决定，不能突破平台出价与预算规则。
- 数据边界：竞品 CPM 与类目 CVR 属估计值，缺失或失真时会直接影响出价的激进程度。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Ad-Fraud-IVT-Detection.html、Skill-Ad-Fraud-IVT-Detection、Skill-Ad-Spend-Time-Series-Attribution.html、Skill-Ad-Spend-Time-Series-Attribution、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Ad-Fraud-IVT-Detection.html、Skill-Ad-Fraud-IVT-Detection、Skill-Ad-Spend-Time-Series-Attribution.html、Skill-Ad-Spend-Time-Series-Attribution、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Ad-Fraud-IVT-Detection.html、Skill-Ad-Fraud-IVT-Detection、Skill-Ad-Spend-Time-Series-Attribution.html、Skill-Ad-Spend-Time-Series-Attribution、Skill-RTB-Realtime-Bidding-Optimization

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-RTB-Realtime-Bidding-Optimization`