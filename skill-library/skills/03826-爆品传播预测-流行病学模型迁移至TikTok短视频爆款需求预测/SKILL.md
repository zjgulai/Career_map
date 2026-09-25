---
name: "p2s-sir-viral-product-adoption-forecasting"
title: "SIR爆品传播预测 — 流行病学模型迁移至TikTok短视频爆款需求预测"
description: "触发词：SIR 模型、爆品预测、短视频热度、R₀、传播动力学。何时不用：需求平稳、无病毒式传播特征的品类不必用；要建模搜索热度曲线时用「季节性搜索趋势建模」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 趋势监测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-SIR-Viral-Product-Adoption-Forecasting"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "视频发布三天就能估出热度还能烧多久，告诉你现在该备 300 个还是 2000 个，以及什么时候追货。"
user_try: "试试：这条背带视频发布 3 天、观看 150 万、点赞率 4.2%，用 SIR 估未来 14 天日需求和最优备货。"
whenToUse: "需求由短视频等病毒式传播驱动、备货窗口极短时用；需求平稳无传播特征不必用；要建模搜索热度曲线用季节性搜索趋势建模。"
workflow: "录入发布后 1-3 天的日观看量、互动率与转化量 → 估算传播率 β、恢复率 γ 与 R₀ 爆款指数 → 预测未来 14 天日需求曲线与置信区间 → 输出最优备货量与追货时机"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SIR爆品传播预测 — 流行病学模型迁移至TikTok短视频爆款需求预测

## ① 解决的问题

运营面临"TikTok爆款视频热度窗口不可预测、备货时机严重滞后"——SIR流行病学模型将爆款备货准确率提升35%，年化减少断货损失50万元

## ② 核心算法逻辑

原属学科：流行病学（Epidemiology），SIR模型由Kermack & McKendrick于1927年提出，用于描述传染病在人群中的传播动力学。

## ③ 业务应用场景

场景A：婴儿背带TikTok视频爆款需求预测
- 业务问题：婴儿背带TikTok视频发布3天，观看量150万，点赞率4.2%，当前日销80个；不知道热度能持续多久，备货300个怕不够，备货2000个怕断后滞销 - 数据要求： - 发布后1-3天的日观看量（用于拟合β） - 点赞率、评论率、分享率（用于校准β） - 日转化量（用于估算I→R的转化率） - 品类平均潜在用户规模N（如TikTok目标市场粉丝数） - 预期产出： - β和γ参数估计 + R₀爆款指数 - 未来14天日需求预测曲线（含80%置信区间） - 备货建议：最优备货量 + 追货时机 - 业务价值：爆单场景备货准确率+35%，年化减少断货损失50万元
- Q4黑五前发布促销视频，用SIR模型预测视频热度持续时间，提前3-5天追货，避免旺季断货 - R₀通常在Q4期间高于平时20-30%（节日效应叠加）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：爆单场景备货准确率+35%，年化减少断货损失50万元；适用于月均TikTok视频10条以上的母婴卖家
适用规模：TikTok月活跃视频 ≥ 5条的中型母婴跨境品牌
实施难度：⭐⭐⭐☆☆（需要实时抓取TikTok数据，集成工作量中等）
优先级：⭐⭐⭐⭐⭐（TikTok爆款是母婴跨境最大的非线性增长机会，竞品几乎无此预测能力）
核心门槛：早期48小时数据质量决定预测精度；需要TikTok数据接口或手动录入前3天数据

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（196 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
SIR爆品传播预测 - 流行病学模型迁移至TikTok需求预测
Kermack-McKendrick SIR → 短视频爆款传播动力学
"""
import numpy as np
from scipy.integrate import odeint
from scipy.optimize import minimize


def sir_model(y, t, beta, gamma, N):
    """SIR微分方程组"""
    S, I, R = y
    dSdt = -beta * S * I / N
    dIdt = beta * S * I / N - gamma * I
    dRdt = gamma * I
    return [dSdt, dIdt, dRdt]


def fit_sir_params(observed_infected, N, t_observed):
    """
    从早期观察数据拟合β和γ
    observed_infected: 早期每日活跃传播用户数（可用日观看量代理）
    N: 潜在用户总规模
    t_observed: 观察时间点列表（天）
    """
    def objective(params):
        beta, gamma = params
        if beta <= 0 or gamma <= 0:
            return 1e10
        # 初始条件：第0天有少量感染者
        I0 = observed_infected[0]
        S0 = N - I0
        R0_init = 0
        y0 = [S0, I0, R0_init]
        try:
            sol = odeint(sir_model, y0, t_observed, args=(beta, gamma, N))
            predicted_I = sol[:, 1]
            # 归一化后计算残差（形状拟合，而非绝对值）
            pred_norm = predicted_I / (np.max(predicted_I) + 1e-8)
            obs_norm = np.array(observed_infected) / (np.max(observed_infected) + 1e-8)
            return np.sum((pred_norm - obs_norm) ** 2)
        except Exception:
            return 1e10

    # 多起点搜索
    best_result = None
    best_loss = np.inf
    for beta_init in [0.3, 0.5, 0.7]:
        for gamma_init in [0.1, 0.2, 0.3]:
            res = minimize(
                objective,
                x0=[beta_init, gamma_init],
                method='Nelder-Mead',
                options={'maxiter': 2000, 'xatol': 1e-6}
            )
            if res.fun < best_loss:
                best_loss = res.fun
                best_result = res

    beta_fit = abs(best_result.x[0])
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：发布后 1-3 天日观看量、点赞/评论/分享率、日转化量与品类潜在用户规模 N；粒度：内容×日。

**输出**：β/γ 参数估计与 R₀ 爆款指数、未来 14 天日需求预测（含 80% 置信区间）、最优备货量与追货时机建议，供爆款备货决策使用。

## 执行步骤

1. 整理视频前 3 天的观看与互动数据
2. 拟合 SIR 参数并计算 R₀
3. 外推热度窗口与日需求曲线
4. 换算最优备货量与追货时点

## 边界与不做

- 数据不满足时不用：拿不到发布后早期 48 小时数据时，β 无法拟合，预测精度失去保障。
- 能力边界：只预测热度与需求，不负责投流、达人合作与追单执行。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Epidemiological-Viral-Traffic-SIR.html、Skill-Epidemiological-Viral-Traffic-SIR、Skill-Multimodal-New-Product-Sales-Forecast.html、Skill-Multimodal-New-Product-Sales-Forecast、Skill-Social-Network-Viral-Growth-Simulation.html、Skill-Social-Network-Viral-Growth-Simulation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Multimodal-New-Product-Sales-Forecast.html、Skill-Multimodal-New-Product-Sales-Forecast、Skill-Social-Network-Viral-Growth-Simulation.html、Skill-Social-Network-Viral-Growth-Simulation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Multimodal-New-Product-Sales-Forecast.html、Skill-Multimodal-New-Product-Sales-Forecast、Skill-Social-Network-Viral-Growth-Simulation.html、Skill-Social-Network-Viral-Growth-Simulation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-SIR-Viral-Product-Adoption-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：06-增长模型　·　源卡：`Skill-SIR-Viral-Product-Adoption-Forecasting`