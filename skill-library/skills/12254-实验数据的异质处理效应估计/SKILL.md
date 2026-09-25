---
name: "p2s-causal-forest-hte-experiments"
title: "Causal Forest for HTE in Experiments — 实验数据的异质处理效应估计"
description: "触发词：因果森林、条件平均处理效应、优惠券精准投放、广告创意分群、实验异质性、投放效率。何时不用：要直接生成可执行的发券队列用「Uplift 干预优先级队列」；要从观测数据学策略用「观测数据策略学习」。安全边界：分析须遵守数据最小化原则，不得使用种族、宗教等敏感属性，结果不得用于个体识别。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 分群"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Causal-Forest-HTE-Experiments"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "同一张券的效果在人群间能差三倍：用因果森林找出效应最高的那群人，把预算花在他们身上。"
user_try: "试试：我的满减券实验平均只提升 2.1%，帮我用因果森林找出效应最高的 25% 人群。"
whenToUse: "当促销或广告实验需要拆到人群层面的异质效应、优化投放对象而非只看平均值时用本技能；若要把效应直接变成有限资源的发放队列，用「Uplift 干预优先级队列」；观测数据场景用「观测数据策略学习」。"
workflow: "整理实验处理、转化结果与用户特征：月龄、购买历史、地区、设备 → 用双重稳健因果森林或分组近似估计条件平均处理效应 → 用单树解释器把效应规则化，输出高响应人群 → 按效应阈值重排投放对象与预算 → 核对优惠券成本与广告投放效率的变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Causal Forest for HTE in Experiments — 实验数据的异质处理效应估计

## ① 解决的问题

运营面临"全量用户施相同促销政策导致高价值用户被补贴浪费"——因果森林HTE将促销精准度提升40%，年化节省无效促销预算50-90万元

## ② 核心算法逻辑

标准 AB 实验只能估计平均处理效应（ATE），但真实商业问题中，不同用户群体对同一策略的响应差异显著——新手妈妈 vs 二胎妈妈对同一促销的转化率可能相差 3 倍。因果森林（Causal Forest，Wager & Athey 2018） 能估计每个用户的条件平均处理效应（CATE, Conditional Average Treatment Effect）。

## ③ 业务应用场景

场景1：母乳喂养辅助产品促销效果分群研究 - 业务问题：同一优惠券策略（满 $50 减 $8）的 AB 实验 ATE 为 +2.1%，但怀疑不同用户群响应差异很大，希望针对高响应群体精准投放 - 数据要求：实验数据（处理分配、转化结果） + 用户特征（宝宝月龄、购买历史、地区、设备类型），样本量 ≥ 3,000 - 预期产出：识别出 CATE > 5% 的高响应用户群（约占 25%），精准投放节省优惠券成本 60% - 业务价值：优惠券投放精准化后，同等预算 ROI 从 1.8× 提升到 2.8×，月节省约 4 万元
场景2：TikTok 广告创意 AB 测试异质效应分析 - 业务问题：情感化婴儿故事型广告 vs 功能演示型广告，ATE 显示无差异，但怀疑不同受众群体（初产妇 vs 经产妇）响应完全不同 - 数据要求：广告曝光/点击/转化数据 + 用户画像标签，样本量 ≥ 5,000 - 预期产出：因果森林分析发现初产妇群体对情感型广告 CATE = +4.2%，经产妇对功能型 CATE = +3.1%；分群投放使整体 ROAS 提升 22% - 业务价值：广告分群策略月均 ROAS 提升节省无效广告投入约 6 万元
**三轨验证**： - 成本：需要 econml/grf Python 库，数据科学团队 3 人天建模 - 合规：分析基于内部实验数据，需遵守数据最小化原则，不可使用敏感属性（种族/宗教） - 风险：因果森林对小样本不稳定（< 500/格），建议样本量 ≥ 3,000 再使用

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：精准优惠券投放节省约 60% 分发成本（仅向高 CATE 用户投放），月均节省约 4-6 万元；广告分群投放 ROAS 提升 15-25%，月均减少无效投放 3-8 万元
实施难度：⭐⭐⭐⭐⭐（需要 econml 建模能力 + 用户特征工程 + 线上 CATE 评分服务，工程复杂度高）
优先级：⭐⭐⭐⭐☆
评估依据：母婴用户群体异质性极强（月龄是天然的分群维度），ATE 掩盖了巨大的子群差异；对高价值用户群体精准化是母婴跨境电商差异化竞争的核心能力

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（134 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy import stats

# ============================================================
# Causal Forest HTE — 使用 econml 的 CausalForestDML 实现
# ============================================================

try:
    from econml.dml import CausalForestDML
    from econml.cate_interpreter import SingleTreeCATEInterpreter
    ECONML_AVAILABLE = True
except ImportError:
    ECONML_AVAILABLE = False
    print("提示：完整运行需要 pip install econml；当前使用简化版演示")


def simple_hte_demo():
    """
    简化版 HTE 演示（无需 econml），用分组 OLS 近似
    场景：促销优惠券对不同宝宝月龄用户的异质效应
    """
    np.random.seed(2024)
    n = 3000

    # 用户特征
    baby_age_months = np.random.randint(0, 24, n)    # 宝宝月龄 0-24
    purchase_history = np.random.lognormal(4, 0.6, n) # 历史购买金额
    is_first_child = np.random.binomial(1, 0.55, n)   # 是否初产

    # 随机分配（AB 实验）
    T = np.random.binomial(1, 0.5, n)

    # 真实 CATE（宝宝月龄 0-6 月段对促销最敏感）
    true_cate = np.where(
        baby_age_months <= 6,
        0.08 + 0.002 * is_first_child,    # 0-6月：+8%（初产妇额外 +2%）
        np.where(
            baby_age_months <= 12,
            0.03,                           # 6-12月：+3%
            0.01                            # 12+月：+1%
        )
    )

    # 转化率 = 基线 + CATE × 处理 + 噪声
    baseline_cvr = 0.04
    cvr = baseline_cvr + true_cate * T + np.random.normal(0, 0.02, n)
    Y = np.random.binomial(1, np.clip(cvr, 0, 1))

    df = pd.DataFrame({
        "baby_age_months": baby_age_months,
        "purchase_history": purchase_history,
        "is_first_child": is_first_child,
        "treatment": T,
        "converted": Y
    })

    print("=" * 65)
    print("因果森林 HTE — 促销优惠券异质效应分析（促销优惠券对不同月龄效果）")
    print("=" * 65)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：实验数据（处理分配与转化结果）与用户特征（宝宝月龄、购买历史、地区、设备类型）；卡页要求样本量不低于 3000，广告场景建议 5000 以上；粒度为用户 × 实验。

**输出**：各子群的条件平均处理效应与高响应人群占比、可解释的分群规则与投放重排建议，以及优惠券与广告预算的节省测算；供增长与投放团队使用。

## 执行步骤

1. 整理实验处理、结果与用户特征数据
2. 估计各子群的条件平均处理效应
3. 用单树解释器输出可读的高响应人群规则
4. 按效应阈值重排投放对象与预算
5. 核对券成本与广告投放效率变化

## 边界与不做

- 数据不满足：单格样本低于 500（总体低于 3000）时估计不稳，先攒样本。
- 何时不用：要直接产出发放队列用「Uplift 干预优先级队列」；观测数据学策略用「观测数据策略学习」。
- 能力边界：只做效应估计与分群建议，不含线上评分服务与广告平台投放执行。
- 安全边界：须遵守数据最小化原则，不得使用种族、宗教等敏感属性，不输出个体识别信息。

## 技能关联

- **可组合**：Skill-Causal-Forest-HTE-Experiments

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：02-A_B实验　·　源卡：`Skill-Causal-Forest-HTE-Experiments`