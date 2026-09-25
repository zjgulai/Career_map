---
name: "p2s-epidemiological-viral-traffic-sir"
title: "SIR传染病模型TikTok流量拐点预测 — 提前2周锁定爆款峰值"
description: "触发词：流量拐点、爆款预测、SIR模型、备货节奏。何时不用：缺少每日粒度流量或无法估计品类受众总量时不用本卡；判断品类中长期趋势用趋势预测类技能。安全边界：避免刷单等会人为放大感染指标的行为。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-021"
l3_business: "趋势监测"
l3_all: "趋势监测 / 内容策划"
l1_l2_l3: "业务运营/产品与创新/趋势监测"
p2s_card_id: "Skill-Epidemiological-Viral-Traffic-SIR"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用传染病模型拟合内容传播曲线，提前锁定流量峰值日期并指导备货节奏。"
user_try: "试试：这款安抚海马在 TikTok 突然爆了，帮我预测未来 14 天的流量峰值和该备多少货。"
whenToUse: "本卡属「趋势监测」。单品或单条内容正在快速起量、需要预测峰值日期与滑落节奏时用本卡；判断整个品类的中长期趋势时用品类趋势预测类技能。"
workflow: "采集日浏览量序列 → 估计最大受众总群 → 拟合 SIR 参数 → 输出 14 天流量抛物线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SIR传染病模型TikTok流量拐点预测 — 提前2周锁定爆款峰值

## ① 解决的问题

增长经理面临内容爆量难追踪——SIR将流量峰值预测误差25%压到10%，年化省18万元

## ② 核心算法逻辑

核心思想：传统的流量预测使用时间序列（如 ARIMA），假设历史决定未来，无法应对 TikTok 这种瞬间爆发的"非线性病毒式传播"。本算法借用流行病学的 SIR（易感者感染者康复者）模型，将未触达用户视为"易感人群"，已购买/传播用户视为"感染者"，热度消退视为"康复"，精准模拟爆款的生命周期。

## ③ 业务应用场景

**场景 A：TikTok 爆款玩具的备货与踩刹车** - **业务问题**：一款"婴儿安抚海马"在 TikTok 突然走红，流量指数级飙升。供应链总监面临绝境：到底应该紧急空运 1 万件，还是 5 万件？ - **数据要求**：过去 5 天的每日浏览量、加购量（作为感染指标 I）、该品类的全网最大受众估算（作为总群 N）。 - **预期产出**：输出未来 14 天的完整流量抛物线，明确标出最高峰所在的具体日期，以及巅峰后的滑落斜率。 - **三轨验证**：成本（只空运巅峰期精确单量，海运其余，头程成本降 40%）/ 合规（避免刷单）/ 风险（规避高位死库存）。 - **业务价值**：成功在流

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：单次爆款预判准确可避免 20-80 万元死库存；全年 3-5 次爆款机会对应节省 60-400 万元，年化节省 80-150 万元。
实施难度：⭐⭐⭐☆☆（方程拟合相对简单，难点在总受众 N 的准确估计）
优先级评分：⭐⭐⭐⭐⭐（对于强社交属性的母婴玩具/服饰是必杀技）
评估依据：打破了"线性外推"的盲目乐观，引入了自然界规律的终极物理限制（群体上限），属于战略防守的最高级别。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（79 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/epidemiological_viral_traffic_sir` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Epidemiological-Viral-Traffic-SIR.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from scipy.integrate import odeint
from scipy.optimize import minimize

def sir_model(y, t, beta, gamma):
    S, I, R = y
    N = S + I + R
    dS = -beta * S * I / N
    dI = beta * S * I / N - gamma * I
    dR = gamma * I
    return [dS, dI, dR]

def fit_sir_to_traffic(observed_traffic, total_population=100000, forecast_days=14):
    """
    拟合SIR模型到实际流量数据，预测峰值时间
    参数:
        observed_traffic: list, 每日流量（至少3天）
        total_population: int, 潜在受众总量
        forecast_days: int, 预测天数
    """
    obs = np.array(observed_traffic, dtype=float)
    n_obs = len(obs)
    I0 = obs[0]
    y0 = [total_population - I0, I0, 0.0]
    t_obs = np.arange(n_obs, dtype=float)

    def loss(params):
        beta, gamma = params
        if beta <= 0 or gamma <= 0 or beta > 2 or gamma > 1:
            return 1e10
        sol = odeint(sir_model, y0, t_obs, args=(beta, gamma))
        return np.mean((sol[:, 1] - obs) ** 2)

    best_loss, best_params = np.inf, [0.3, 0.1]
    for b0 in [0.1, 0.3, 0.5]:
        for g0 in [0.05, 0.1, 0.2]:
            res = minimize(loss, [b0, g0], method="Nelder-Mead",
                           options={"maxiter": 2000, "xatol": 1e-6})
            if res.fun < best_loss:
                best_loss, best_params = res.fun, res.x

    beta_fit, gamma_fit = best_params
    t_full = np.arange(n_obs + forecast_days, dtype=float)
    sol = odeint(sir_model, y0, t_full, args=(beta_fit, gamma_fit))
    pred_I = sol[:, 1]
    peak_day = int(np.argmax(pred_I))

    return {
        "beta": round(beta_fit, 4),
        "gamma": round(gamma_fit, 4),
        "R0_basic": round(beta_fit / gamma_fit, 2),
        "peak_day": peak_day,
        "days_to_peak": max(0, peak_day - n_obs + 1),
        "peak_traffic": round(float(np.max(pred_I)), 0),
        "forecast": pred_I[n_obs:].tolist(),
        "recommendation": (
            "爆发期尚未到来，可继续加仓" if peak_day >= n_obs
            else "已过峰值，建议立即踩刹车减少补货"
        ),
    }
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：过去若干天的每日浏览量、加购量（作为感染指标），以及该品类的全网最大受众估算（总群规模）。

**输出**：未来 14 天的流量预测曲线，标注最高峰日期与巅峰后的滑落斜率，用于拆分紧急空运与海运的备货批量。

## 执行步骤

1. 采集每日浏览量与加购量序列
2. 估计品类最大受众规模作为总群
3. 拟合 SIR 感染与恢复参数
4. 输出未来 14 天流量曲线与峰值日期
5. 据此拆分紧急空运与海运的备货量

## 边界与不做

- 缺少每日粒度流量数据、或品类受众总量无法估计时不用本卡
- 本卡只产出流量预测与备货建议，不负责下单与物流执行
- 应避免刷单等会人为放大感染指标的行为

## 技能关联

- **前置**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-TikTok-Flash-Sale-Inventory-Pulse.html、Skill-TikTok-Flash-Sale-Inventory-Pulse
- **延伸**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-TikTok-Flash-Sale-Inventory-Pulse.html、Skill-TikTok-Flash-Sale-Inventory-Pulse
- **可组合**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-TikTok-Flash-Sale-Inventory-Pulse.html、Skill-TikTok-Flash-Sale-Inventory-Pulse、Skill-Epidemiological-Viral-Traffic-SIR

---

> 分类：业务运营/产品与创新/趋势监测　·　技术族：06-增长模型　·　源卡：`Skill-Epidemiological-Viral-Traffic-SIR`