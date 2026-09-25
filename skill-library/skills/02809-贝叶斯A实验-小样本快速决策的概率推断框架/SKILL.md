---
name: "p2s-bayesian-ab-testing"
title: "贝叶斯A/B实验 — 小样本快速决策的概率推断框架"
description: "触发词：贝叶斯AB、小样本决策、概率结论、Loss准则、弱先验。何时不用：流量充足、能等固定样本量结论时，常规频率派检验更简单直接。安全边界：测试组用户不应因实验看到大幅不同的价格；Listing测试须遵守平台频率限制。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Bayesian-AB-Testing"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "流量少也能早点做决定：用概率告诉你 B 比 A 好的可能性有多大，以及现在还差不差得动。"
user_try: "试试：新品主图每天只有 50 次点击，帮我用贝叶斯方法看看现在能不能下结论切到 B 版。"
whenToUse: "当流量稀少、需要在几天内给出决策而不是等固定样本量时用；流量充足、能等统计显著时用常规频率派 A/B 设计；想让流量边跑边向高转化组倾斜时用自适应实验设计。"
workflow: "汇总两组每日的曝光、点击与转化数据 → 设定先验（小样本建议弱先验 Beta(1,1)）并计算后验分布 → 计算 P(B>A) 与 Loss 指标并与决策阈值比较 → 按结论给出切换、继续等待或再等几天的时间表 → 输出以概率表述的业务结论与置信度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 贝叶斯A/B实验 — 小样本快速决策的概率推断框架

## ① 解决的问题

运营面临"新品流量稀少传统A/B测试需12天无法快速决策"——贝叶斯实验用概率语言3天给出P(B>A)=94%结论，测试周期压缩75%，年化多迭代30轮，GMV增量约50万元

## ② 核心算法逻辑

传统频率派A/B测试的三大痛点：

## ③ 业务应用场景

场景A：新品Listing A/B测试快速决策 - 业务问题：婴儿推车新品上架，两版主图A（白底）vs B（场景图），平台流量稀少（每天50次点击），传统t检验需要600次点击才能得出显著结论（需等待12天），运营无法接受 - 数据要求：每日点击和转化数据（可以只有50条）；业务上认为"提升5%转化率即可接受"作为先验偏好 - 预期产出：3天后（150次点击），P(B>A)=0.81，Loss(A)=0.008 < ε=0.01，建议切换到B方案（场景图），给出"B方案转化率比A方案高8.3%（85%置信）"的业务报告 - 业务价值：测试周期从12天压缩到3天，每月可多运行3-4轮实验，新品冷
三轨对抗验证： 1. 成本验证：贝叶斯计算极轻量（10ms/次），无需专用服务器；主要成本在流量分配（50/50分配是机会成本，一般为1-2%的短期损失） 2. 合规验证：A/B测试不涉及平台红线，但注意测试组用户不可感知实验（不应因实验看到大幅不同的价格）；亚马逊允许Listing测试但有频率限制 3. 风险验证：强先验会偏向有先验的方案（confirmation bias）；小样本时强先验影响大，建议使用弱先验（Beta(1,1)）；当两方案差异很小时，Loss准则可能导致过早停止
场景B：促销折扣力度测试 - 业务问题：吸奶器促销10%折扣 vs 15%折扣哪个ROAS更高，每天只有200个曝光 - 数据要求：两组的展示次数、点击次数、转化次数（连续指标用Normal-Normal） - 预期产出：5天后给出"15%折扣ROAS高于10%的概率为67%，但置信度不够（Loss=0.023），建议再等3天" - 业务价值：防止过早结论导致错误策略，同时给出明确的"何时可以决策"时间表

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：测试周期从12天压缩到3天，每月多运行3轮实验，年化多测试约30次；每次测试发现2%转化率提升，按月GMV 50万元，年化增量约50万元；决策质量提升（贝叶斯给出概率而非二元结论）减少错误上线约20%，避免损失约30万元/年
实施难度：⭐⭐☆☆☆（Beta-Binomial计算仅需scipy，无需专用平台；工程复杂度低）
优先级：⭐⭐⭐⭐⭐（母婴新品测试流量稀少是行业普遍痛点，贝叶斯测试是最直接解法）
评估依据：LinkedIn/Netflix/Booking.com等均已从频率派迁移到贝叶斯实验框架；Beta-Binomial是教科书级成熟方法；对小流量产品的收益尤其显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（150 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Bayesian-AB-Testing
贝叶斯A/B测试 — 小样本转化率测试快速决策

依赖：pip install numpy scipy
"""

import numpy as np
from scipy import stats

np.random.seed(42)

# ── 1. Beta-Binomial 贝叶斯A/B测试核心 ───────────────────────────────
class BayesianABTest:
    """
    Beta-Binomial模型的贝叶斯A/B测试
    适用于转化率/点击率类指标
    """

    def __init__(self, prior_alpha=1.0, prior_beta=1.0, n_samples=10000):
        self.prior_alpha = prior_alpha  # Beta先验α（弱先验=1）
        self.prior_beta  = prior_beta   # Beta先验β（弱先验=1）
        self.n_samples   = n_samples

    def update(self, conversions: int, trials: int):
        """根据观测数据更新后验参数"""
        post_alpha = self.prior_alpha + conversions
        post_beta  = self.prior_beta + (trials - conversions)
        return post_alpha, post_beta

    def prob_b_beats_a(self, conv_a, trials_a, conv_b, trials_b) -> float:
        """计算 P(B > A)"""
        alpha_a, beta_a = self.update(conv_a, trials_a)
        alpha_b, beta_b = self.update(conv_b, trials_b)
        # 蒙特卡洛采样
        samples_a = np.random.beta(alpha_a, beta_a, self.n_samples)
        samples_b = np.random.beta(alpha_b, beta_b, self.n_samples)
        return np.mean(samples_b > samples_a)

    def expected_loss(self, conv_a, trials_a, conv_b, trials_b):
        """
        期望损失（Expected Loss）：选错了平均损失多少转化率
        Loss(A) = E[max(pB - pA, 0)] — 如果选A实际上B更好时的损失
        Loss(B) = E[max(pA - pB, 0)] — 如果选B实际上A更好时的损失
        """
        alpha_a, beta_a = self.update(conv_a, trials_a)
        alpha_b, beta_b = self.update(conv_b, trials_b)
        samples_a = np.random.beta(alpha_a, beta_a, self.n_samples)
        samples_b = np.random.beta(alpha_b, beta_b, self.n_samples)
        loss_a = np.mean(np.maximum(samples_b - samples_a, 0))
        loss_b = np.mean(np.maximum(samples_a - samples_b, 0))
        return loss_a, loss_b

    def credible_interval(self, conversions, trials, ci=0.95):
        """后验95%可信区间（区别于频率派置信区间：真实值在此区间内的概率=95%）"""
        alpha, beta = self.update(conversions, trials)
        lower = stats.beta.ppf((1-ci)/2, alpha, beta)
        upper = stats.beta.ppf(1-(1-ci)/2, alpha, beta)
        return lower, upper, alpha / (alpha + beta)  # 后验均值
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每日点击与转化数据（卡页示例仅 50 次点击即可起步）、业务上可接受的提升幅度作为先验偏好（示例认为提升 5% 转化率即可接受）、以及决策阈值与损失容忍度；连续指标可用 Normal-Normal 模型。

**输出**：后验概率型结论与决策时间表（卡页示例：3 天后 P(B>A)=0.81、Loss(A)=0.008 小于阈值 0.01，给出 B 方案比 A 方案高 8.3% 的 85% 置信报告；促销场景给出 15% 折扣 ROAS 更高的概率 67% 但建议再等 3 天）。

## 执行步骤

1. 汇总两组每日的曝光、点击与转化数据
2. 设定先验（小样本建议 Beta(1,1) 弱先验）并计算后验分布
3. 计算 P(B>A) 与 Loss 指标并与决策阈值比较
4. 按结论给出切换、继续等待或再等几天的时间表
5. 输出以概率表述的业务结论与置信度

## 边界与不做

- 何时不用：流量充足、能等到固定样本量结论时，常规频率派检验更简单；两方案差异极小时 Loss 准则可能导致过早停止，需谨慎解读。
- 能力边界：结论是概率表述而非二元判定，不替代业务损益判断；强先验会使结论偏向先验方案，卡页建议小样本时用弱先验。
- 合规边界：测试组用户不应因实验看到大幅不同的价格，Listing 测试须遵守平台频率限制。
- 卡页数字（每天 50 次点击、12 天到 3 天、P(B>A)=0.81、8.3%、年化 50 万与 30 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Power-Analysis-Sample-Size.html、Skill-Power-Analysis-Sample-Size、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **延伸**：Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **可组合**：Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB、Skill-Bayesian-AB-Testing

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Bayesian-AB-Testing`