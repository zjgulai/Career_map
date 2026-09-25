---
name: "p2s-seed-quality-optimization-for-lookalike"
title: "Seed Quality Optimization for Lookalike — 种子净化自动剔除噪声用户提升 Lookalike 质量上限"
description: "触发词：种子净化、Lookalike、孤立森林、代理分类器、数据质量、相似受众。何时不用：跨平台联合建模用联邦学习那张卡；本卡解决种子集混入员工内购、刷单与羊毛党导致效果崩塌的问题。安全边界：清洗规则须可解释并留审计记录，不得基于敏感属性剔除用户，剔除名单不得外泄。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 数据质量"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Seed-Quality-Optimization-for-Lookalike"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把种子受众里的员工内购、刷单和羊毛党清出去，让相似人群投放效果回到该有的水平。"
user_try: "试试：这是我 90 天的购买者种子集，帮我用规则加孤立森林加代理分类器三阶段净化，并评估净化后的种子纯度。"
whenToUse: "与「标签驱动受众分割」相比：要按标签组合搭新受众包用那张卡；已有种子集但效果异常、怀疑噪声用户拉低上限时用本卡。"
workflow: "L1 规则层过滤公司域名邮箱等明显异常种子 → L2 用孤立森林对购买间隔、客单价、购买次数做异常检测 → L3 以净化后的高频复购者为正例训练代理分类器再筛一轮 → 输出净化后种子集与纯度评估，接入 Lookalike 投放"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Seed Quality Optimization for Lookalike — 种子净化自动剔除噪声用户提升 Lookalike 质量上限

## ① 解决的问题

广告投手面临"种子集含员工内购/刷单/羊毛党导致Lookalike ROAS从3.2x崩至1.9x"——三阶段净化将种子纯度从68%提升至94%，ROAS恢复到3.1x，年化增收约7.2万元

## ② 核心算法逻辑

Lookalike 效果的天花板由种子集质量决定，而非模型复杂度。如果种子集包含：

## ③ 业务应用场景

业务问题：奶粉品牌用过去 90 天"购买者"（2,000 人）做 Lookalike，但 ROAS 只有 1.9x（历史均值 3.2x）。排查后发现种子集中包含：约 80 名员工内购（公司域名邮箱）、约 150 名疑似刷单用户（同一时间批量购买）、约 200 名优惠券用户（只在大促期买一次，价格极敏感）。
净化方案： 1. L1 规则：过滤公司域名邮箱 → 删除 80 人 2. L2 孤立森林：对购买时间间隔/客单价/购买次数做异常检测 → 识别 150 名刷单用户 3. L3 代理分类器：用净化后的 1,770 人中的 Top 30%（高频复购者）作为高质量正例，训练分类器，过滤代理分 < 0.3 的用户 → 再删除约 200 名低质量用户
预期产出：净化后种子从 2,000 → 1,540 人（-23%），但种子纯度从 68% → 94%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Lookalike ROAS 从 1.9x 恢复到 3.1x，$5万/月广告预算下年化增收约 $7.2 万；种子净化实施成本约 1.5 万（数据管道工程），ROI > 400%
实施难度：⭐⭐☆☆☆（L1 规则 3 天，L2 孤立森林 1 周，L3 代理分类器 1 周，总计约 2-3 周）
优先级：⭐⭐⭐⭐⭐（种子质量是 Lookalike 效果天花板，净化收益立竿见影，且无需改动广告平台配置）
评估依据：Walmart arXiv:2301.03147 生产系统显示，种子质量过滤后 Lookalike 精度大幅提升；Alibaba ICDMW 2016 证明种子集纯度与 Lookalike AUC 强正相关；实际案例中种子净化可使 ROAS 提升 40-80%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（252 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Seed Quality Optimization for Lookalike
种子集净化——规则 + 孤立森林 + 代理分类器三阶段

依赖：numpy, pandas, scikit-learn
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟种子集数据（含噪声）
# ─────────────────────────────────────────────

def generate_seed_data(n_seeds: int = 2000) -> pd.DataFrame:
    """生成含噪声的种子集数据"""
    np.random.seed(42)

    records = []
    for i in range(n_seeds):
        # 用户类型
        if i < 80:     # 员工内购
            utype = 'employee'
        elif i < 230:   # 刷单用户
            utype = 'fraudster'
        elif i < 430:   # 优惠券羊毛党
            utype = 'coupon_hunter'
        else:           # 真实高质量买家
            utype = 'genuine'

        # 特征：依据类型生成不同分布
        if utype == 'employee':
            aov = np.random.normal(200, 20)   # 大量内购
            freq = np.random.poisson(8)        # 高频
            interval = np.random.normal(5, 1)  # 极规律
            ltv_est = np.random.normal(50, 10) # 低真实LTV
            email_domain = 'company.com'
        elif utype == 'fraudster':
            aov = np.random.normal(30, 5)      # 小额刷单
            freq = np.random.poisson(15)       # 超高频
            interval = np.random.normal(2, 0.2) # 极规律
            ltv_est = np.random.normal(30, 5)
            email_domain = 'temp@mail.com'
        elif utype == 'coupon_hunter':
            aov = np.random.normal(60, 10)     # 低客单（用券后）
            freq = np.random.poisson(1)        # 低频（仅促销时买）
            interval = np.random.normal(90, 5) # 长间隔
            ltv_est = np.random.normal(45, 8)
            email_domain = 'gmail.com'
        else:           # genuine
            aov = np.random.normal(120, 30)
            freq = np.random.poisson(3)
            interval = np.random.normal(25, 8)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2301.03147 — Finding Lookalike Customers for E-Commerce Marketing
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：历史购买者种子集（卡页 2,000 人、近 90 天）：邮箱、购买时间与间隔、客单价、购买次数、优惠券使用情况；需能支撑异常检测的特征字段。

**输出**：分层净化结果（各阶段剔除人数与原因）、净化后的种子集（卡页 2,000→1,540 人、纯度 68%→94%）与 Lookalike 投放建议，供广告投手与数据团队使用。

## 执行步骤

1. 整理种子集字段并定义高价值正例口径（如高频复购者）。
2. L1 规则层剔除公司域名邮箱等明显非目标用户（卡页 80 人）。
3. L2 用孤立森林检测购买节奏与客单价异常，标出疑似刷单（卡页 150 人）。
4. L3 训练代理分类器，过滤代理分过低的用户（卡页约 200 人）。
5. 输出净化名单、纯度评估与后续投放建议。

## 边界与不做

- 何时不用：种子集规模过小、或字段缺失（没有购买时间与邮箱）时不要用；种子质量正常、ROAS 稳定时无需净化。
- 能力边界：只做种子清洗与评估，不自动重建受众包，也不承诺 ROAS 回到 3.1x（卡页案例值）。
- 安全边界：剔除规则须可解释并留痕，不得使用敏感属性，剔除名单不得对外披露。

## 技能关联

- **前置**：Skill-Calibrated-Audience-Expansion-Uncertainty.html、Skill-Calibrated-Audience-Expansion-Uncertainty、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Fake-Review-Detection.html、Skill-Fake-Review-Detection、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection、Skill-Return-Fraud-Detection.html、Skill-Return-Fraud-Detection
- **延伸**：Skill-Calibrated-Audience-Expansion-Uncertainty.html、Skill-Calibrated-Audience-Expansion-Uncertainty、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection
- **可组合**：Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection、Skill-Seed-Quality-Optimization-for-Lookalike

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Seed-Quality-Optimization-for-Lookalike`