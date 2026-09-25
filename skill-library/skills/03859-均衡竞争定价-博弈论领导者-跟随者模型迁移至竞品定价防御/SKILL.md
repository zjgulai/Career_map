---
name: "p2s-stackelberg-equilibrium-competitive-pricing"
title: "Stackelberg均衡竞争定价 — 博弈论领导者-跟随者模型迁移至竞品定价防御"
description: "触发词：序贯博弈均衡、领导者跟随者、最优反应函数、定价防御、先动承诺、竞品成本估计。何时不用：要判断长期合作能否维持高价用「重复博弈长期定价合作」；要算双方都不动的静态均衡用「纳什均衡定价模型」。安全边界：仅使用公开历史价格数据，不得与竞品沟通或合谋；竞品成本为估计值，需按月校准。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Stackelberg-Equilibrium-Competitive-Pricing"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "市占率第二怎么不被价格战拖死：算出竞品的最优反应曲线，找到让对手不敢发动价格战的防守价。"
user_try: "试试：我吸奶器类目市占率第 2、成本 280 元，帮我把竞品的反应函数拟合出来，算一版均衡防守价。"
whenToUse: "当自己是市场参与者之一、需要预判竞品对自己调价的反应并据此设防守价时用本技能；若要维持长期合作高价，用「重复博弈长期定价合作」；若求双方都不愿偏离的静态均衡，用「纳什均衡定价模型」。"
workflow: "收集过去 6 个月竞品价格序列与自身销量-价格历史 → 用最小二乘加自助法估计需求参数及其不确定性 → 拟合跟随者的最优反应函数 → 求解序贯博弈均衡价格与我方防守价 → 做敏感性分析，评估竞品激进时的利润情景"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Stackelberg均衡竞争定价 — 博弈论领导者-跟随者模型迁移至竞品定价防御

## ① 解决的问题

定价团队面临"竞品价格战无定量防御策略、被动应对毛利受损"——Stackelberg均衡定价将毛利率保护3pp，年化增利150万元

## ② 核心算法逻辑

原属学科：博弈论（Game Theory），Von Stackelberg于1934年提出领导者跟随者双寡头竞争模型，描述具有先动优势的市场领导者如何通过承诺策略获得均衡优势。

## ③ 业务应用场景

场景A：吸奶器类目市占率第2的定价防御策略
- 业务问题：吸奶器类目Top5中，我方市占率第2，成本280元，竞品1（市占率第1）成本估计250元。如果设价过低会引发价格战，设价过高会丢市占。需要找到「威慑竞品不敢发动价格战」的均衡定价 - 数据要求： - 过去6个月竞品价格序列（用于估计价格弹性参数） - 我方销量与价格历史（估计需求函数） - 我方成本结构（直接成本+FBA费用+广告成本） - 预期产出： - Stackelberg均衡价格 - 竞品最优反应函数（我方每变价1元，竞品会怎么跟） - 敏感性分析：竞品激进时的防守价格 - 不同情景下的利润对比表 - 业务价值：避免恶性价格战，毛利率保护3pp，年化增利150万元
三轨验证： - 成本：显性成本约8-12万元/年（数据采集工具如Keepa/Helium10订阅费约3-5万，数据分析师人力成本约5-7万，scipy计算资源可忽略） - 合规：完全合规。仅使用公开历史价格数据（Amazon前台可见），不涉及竞品内部数据或用户隐私，不违反Amazon定价政策（不涉及价格操纵或共谋） - 风险：中等风险。若竞品成本估计偏差>15%，均衡价格可能偏离实际最优，反而刺激竞品降价；需每月校准参数，避免模型漂移

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免恶性价格战，毛利率保护3pp，年化增利150万元（基于月销400个×均值毛利改善3pp的测算）
适用规模：类目市占率前5的母婴跨境品牌（需要竞品有可观察的定价行为）
实施难度：⭐⭐⭐☆☆（需要历史价格-销量数据 + scipy优化，无需大模型或深度学习）
优先级：⭐⭐⭐⭐⭐（竞品定价防御是母婴跨境卖家最迫切的量化决策需求，价格战一旦发生每月可损失毛利10-30万）
核心限制：

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（193 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Stackelberg均衡竞争定价
博弈论领导者-跟随者模型 → 母婴跨境竞品定价防御策略
Von Stackelberg (1934) → E-Commerce Application
"""
import numpy as np
from scipy.optimize import minimize_scalar, minimize


def estimate_demand_params(price_history_self, sales_history_self,
                           price_history_comp, n_bootstrap=200, seed=42):
    """
    从历史价格-销量数据估计线性需求参数 a, b, c
    q₁ = a - b·p₁ + c·p₂
    使用OLS + bootstrap估计参数不确定性
    """
    np.random.seed(seed)
    p1 = np.array(price_history_self, dtype=float)
    q1 = np.array(sales_history_self, dtype=float)
    p2 = np.array(price_history_comp, dtype=float)
    n = len(p1)

    # OLS: 设计矩阵 [1, p1, p2]
    X = np.column_stack([np.ones(n), p1, p2])
    # 最小二乘：[a, -b, c]
    try:
        coef, _, _, _ = np.linalg.lstsq(X, q1, rcond=None)
    except np.linalg.LinAlgError:
        coef = np.array([1000.0, -5.0, 2.0])

    a_est = coef[0]
    b_est = -coef[1]  # 转为正的价格弹性
    c_est = coef[2]   # 交叉弹性（正值=替代品）

    # Bootstrap置信区间
    b_samples, c_samples = [], []
    for _ in range(n_bootstrap):
        idx = np.random.choice(n, n, replace=True)
        Xb = X[idx]
        qb = q1[idx]
        try:
            cb, _, _, _ = np.linalg.lstsq(Xb, qb, rcond=None)
            b_samples.append(-cb[1])
            c_samples.append(cb[2])
        except np.linalg.LinAlgError:
            continue

    return {
        'a': a_est,
        'b': max(b_est, 0.1),   # 价格弹性为正
        'c': max(c_est, 0.01),  # 交叉弹性为正（替代品）
        'b_ci': (np.percentile(b_samples, 5), np.percentile(b_samples, 95)) if b_samples else (b_est * 0.8, b_est * 1.2),
        'c_ci': (np.percentile(c_samples, 5), np.percentile(c_samples, 95)) if c_samples else (c_est * 0.8, c_est * 1.2),
    }


def follower_best_response(p1, a, b, c, cost2):
    """
    跟随者（竞品）对我方价格p1的最优反应价格
    最大化 π₂ = (p₂ - cost₂)(a - b·p₂ + c·p₁)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：过去 6 个月竞品价格序列、自身销量与价格历史（用于估计需求函数）、自身成本结构（直接成本、FBA 费用、广告成本）与竞品成本估计；粒度为单品 × 月或更细。

**输出**：序贯博弈均衡价格、竞品最优反应函数（我方每变价 1 元对方如何跟）、敏感性分析与不同情景的利润对比表；供定价团队制定防御性定价。

## 执行步骤

1. 收集竞品价格序列与自身销量价格历史
2. 估计需求参数并用自助法给出不确定性区间
3. 拟合跟随者最优反应函数
4. 求解均衡价格与我方防守价
5. 做敏感性分析并输出情景利润对比表

## 边界与不做

- 数据不满足：竞品成本估计偏差超过 15% 时均衡价可能反而刺激竞品降价，须每月校准参数。
- 何时不用：长期合作价格用「重复博弈长期定价合作」；双方静态均衡用「纳什均衡定价模型」。
- 能力边界：只做均衡求解与情景分析，不含改价执行与竞品内部数据获取。
- 安全边界：仅使用公开历史价格数据，不得与竞品沟通或合谋；结论为估计值，需人工复核。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Competitor-Price-Intelligence.html、Skill-Competitor-Price-Intelligence、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Nash-Equilibrium-Pricing-Model.html、Skill-Nash-Equilibrium-Pricing-Model、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Stackelberg-Price-Leadership-Strategy.html、Skill-Stackelberg-Price-Leadership-Strategy
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Competitor-Price-Intelligence.html、Skill-Competitor-Price-Intelligence、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Nash-Equilibrium-Pricing-Model.html、Skill-Nash-Equilibrium-Pricing-Model、Skill-Stackelberg-Price-Leadership-Strategy.html、Skill-Stackelberg-Price-Leadership-Strategy
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Competitor-Price-Intelligence.html、Skill-Competitor-Price-Intelligence、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Stackelberg-Price-Leadership-Strategy.html、Skill-Stackelberg-Price-Leadership-Strategy、Skill-Stackelberg-Equilibrium-Competitive-Pricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Stackelberg-Equilibrium-Competitive-Pricing`