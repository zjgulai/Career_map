---
name: "p2s-ltv-prediction-btyd"
title: "LTV Prediction BTYD — BG/NBD + Gamma-Gamma 客户生命周期价值预测"
description: "触发词：BTYD、BG/NBD、P_alive、活跃概率、CLV、沉睡用户。何时不用：要在长尾零膨胀下预测个体 LTV 用 ZILN 那张卡；要区分用户是沉睡还是真流失、避免向已流失用户投预算时用本卡。安全边界：订单级数据须脱敏使用，预测结果不得用于歧视性定价，对外输出只给分群与名单，不含个人标识。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-LTV-Prediction-BTYD"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "判断用户到底是睡着了还是真走了，别再对已经流失的人白花营销预算。"
user_try: "试试：这是我的订单历史，帮我用 BG/NBD 算每个客户的活跃概率和预测 CLV，分出沉睡高价值用户。"
whenToUse: "与「LTV 预测 ZILN」相比：新客首购就要预测长期价值用 ZILN；存量买家的活跃概率与 CLV 区分用本卡。"
workflow: "整理订单级数据并确定观测期与校准期 → 拟合 BG/NBD 得到购买频次与流失参数 → 用 Gamma-Gamma 估计客单价，合成预测 CLV → 输出 P_alive 与高价值沉睡名单，匹配激活策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LTV Prediction BTYD — BG/NBD + Gamma-Gamma 客户生命周期价值预测

## ① 解决的问题

母婴品牌把「3个月没复购」的用户一律当流失发EDM轰炸，浪费营销预算在已流失用户身上——BG/NBD模型给出每位用户的P_alive活跃概率，精准区分沉睡高价值用户与真实流失，复购激活ROI从1.2x提升到3-4x，年化增益30-100万元

## ② 核心算法逻辑

BTYD（Buy Till You Die） 模型族解决一个核心问题：在用户从未明确"取消订阅"的情况下，如何判断他是否已经流失？ 跨境电商是典型的非合约场景——用户买了吸奶器之后，可能6个月后再买配件，也可能再也不回来，但他不会告诉你他走了。

## ③ 业务应用场景

业务问题：有 5,000 名历史买家，其中哪些是"沉睡的高 LTV 用户"（还活跃但3个月没买），哪些是"真正流失"（已经永久离开）？两种人的激活策略完全不同——沉睡用户发优惠券有效，真流失用户发再多也没用（浪费营销预算）。
数据要求： - Amazon/Shopify 订单历史：customer_id, order_date, order_value - 观测期：建议18-24个月历史数据 - 至少3-6个月的稳定数据（新品牌数据不足时模型效果差）
预期产出： - 每位用户的：活跃概率（P_alive）、预测未来12月购买次数、预测 CLV - 高价值沉睡用户名单（P_alive > 0.5, CLV > $50，近3月无购买） - RFM + CLV 四象限分析（Star/Cash Cow/Question Mark/Dog）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
精准识别沉睡高 CLV 用户并激活（vs 全量营销）：Email 营销 ROI 提升 2-3×，年增收 ¥10-30 万
渠道预算重分配（将 CAC 投向高 CLV 渠道）：年增 LTV ¥15-50 万
停止向低 p_alive 用户浪费广告再营销预算：节省 ¥5-15 万/年
高 CLV 用户优先客服资源：留存提升1%对应 LTV ¥5 万/年
年化综合 ROI：¥30-100 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（192 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/06-增长模型/ltv_prediction_btyd` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-LTV-Prediction-BTYD.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LTV Prediction using BG/NBD + Gamma-Gamma (BTYD Framework)
不依赖外部 lifetimes 库的纯 Python 实现（简化版）
"""
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.special import gammaln, betaln


def generate_sample_customer_data():
    """生成模拟母婴电商客户 RFM 数据"""
    np.random.seed(42)
    n_customers = 500

    # 模拟不同用户群体
    data = []
    for i in range(n_customers):
        customer_type = np.random.choice(['loyal', 'occasional', 'one_time'],
                                          p=[0.20, 0.35, 0.45])
        T = np.random.uniform(12, 24)  # 观测期（月）
        if customer_type == 'loyal':
            freq = np.random.poisson(8)
            recency = np.random.uniform(T * 0.5, T)
            monetary = np.random.lognormal(np.log(75), 0.4)
        elif customer_type == 'occasional':
            freq = np.random.poisson(2)
            recency = np.random.uniform(T * 0.2, T)
            monetary = np.random.lognormal(np.log(45), 0.5)
        else:
            freq = 0
            recency = 0
            monetary = np.random.lognormal(np.log(35), 0.6)

        data.append({
            'customer_id': f'C{i+1000}',
            'frequency': max(0, freq),
            'recency': recency if freq > 0 else 0,
            'T': T,
            'monetary_value': monetary,
            'acquisition_channel': np.random.choice(['tiktok', 'google', 'amazon_organic'],
                                                      p=[0.3, 0.35, 0.35]),
        })
    return pd.DataFrame(data)


def bgnbd_log_likelihood(params, frequency, recency, T):
    """BG/NBD 对数似然函数（简化实现）"""
    r, alpha, a, b = params
    if any(p <= 0 for p in params):
        return 1e10

    ln_A0 = betaln(a, b + frequency) - betaln(a, b)
    ln_A1 = (gammaln(r + frequency) - gammaln(r) - gammaln(frequency + 1)
             + r * np.log(alpha) - (r + frequency) * np.log(alpha + T))

    # 处理有复购的用户
    if frequency > 0:
        ln_A2 = (gammaln(r + frequency) - gammaln(r)
                 + r * np.log(alpha) - (r + frequency) * np.log(alpha + recency))
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2501.04719 — Calculating Customer Lifetime Value and Churn using Beta Geometric Negative Binomial and Gamma-Gamma Distribution in a NFT based setting

核验口径：主题指向成立但强度不足（词重合 0.167／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：订单历史（customer_id、order_date、order_value），建议 18–24 个月观测窗口、至少 3–6 个月稳定数据；数据过短时模型效果差。

**输出**：每位用户的活跃概率 P_alive、预测未来 12 个月购买次数与预测 CLV，以及高价值沉睡用户名单（卡页阈值 P_alive>0.5、CLV>$50、近 3 月无购买）与 RFM+CLV 四象限，供营销与 CRM 使用。

## 执行步骤

1. 整理订单级数据并划分校准期与观测期。
2. 拟合 BG/NBD 模型，估计购买与流失参数。
3. 用 Gamma-Gamma 模型估计客单价并与频次合成 CLV。
4. 输出活跃概率与预测购买次数，圈定沉睡高价值名单。
5. 匹配四象限对应的激活、维护或停止投放策略。

## 边界与不做

- 何时不用：数据不足 3–6 个月、或订单不完整（缺日期与金额）时不要用；新客零膨胀场景应改用 ZILN。
- 能力边界：产出活跃概率、CLV 与名单，不自动发券；年化 ROI ¥30–100 万为卡页案例值。
- 安全边界：订单数据须脱敏，不得用于歧视性定价。

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Cross-Border-Member-Onboarding-Optimization.html、Skill-Cross-Border-Member-Onboarding-Optimization、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Cross-Border-Member-Onboarding-Optimization.html、Skill-Cross-Border-Member-Onboarding-Optimization、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN
- **可组合**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Cross-Border-Member-Onboarding-Optimization.html、Skill-Cross-Border-Member-Onboarding-Optimization、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-LTV-Prediction-BTYD

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-LTV-Prediction-BTYD`