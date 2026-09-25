---
name: "p2s-review-attack-hawkes-process"
title: "Review Attack Hawkes Process — 差评攻击 Hawkes 过程建模与预警"
description: "触发词：差评攻击、恶意差评、差评聚集、攻击预警、竞品打压。何时不用：零星差评的逐条申诉与情感分析走「体验分析」；A-to-Z 索赔与账号健康度风险走「评分攻击模式识别」。安全边界：预警只用于防守（邀评、申诉、广告出价），不得用于刷评、买评或反向攻击竞品。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 体验分析"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-Review-Attack-Hawkes-Process"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "差评成批出现、排名被打压时，用历史差评节奏预测下一轮攻击窗口，提前把防守动作准备好。"
user_try: "试试：把过去半年的差评时间整理一下，看看攻击有没有周期，下一轮大概什么时候来。"
whenToUse: "当差评呈集群式、周期性爆发并伴随排名下滑时用；若只是零星差评需要逐条回复申诉，用「体验分析」类技能；若 A-to-Z 索赔集中在短时间的新账号上，用「评分攻击模式识别」。"
workflow: "整理历史差评时间戳并剔除正常差评 → 拟合 Hawkes 过程参数并计算激发比 → 识别攻击集群周期与每轮持续天数 → 输出下一轮攻击窗口的 72 小时预警 → 联动邀评、申诉材料准备与品牌词广告加价"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Review Attack Hawkes Process — 差评攻击 Hawkes 过程建模与预警

## ① 解决的问题

运营面临"竞品差评攻击被动响应导致排名损失"——Hawkes过程预测攻击窗口提前72h，主动防御将排名损失从-35%降至-8%，年化保护GMV35-50万元

## ② 核心算法逻辑

论文：Temporal Point Processes for Event Forecasting | 年份：2019

## ③ 业务应用场景

场景：某母婴卖家（婴儿安全座椅，月销 600+）遭遇周期性差评攻击，每次排名被打压后需要 2-3 周才能恢复，期间预估损失 GMV 约 $15,000/次。运营团队发现攻击有节奏，但无法量化。
Hawkes 建模流程： 1. 整理过去 180 天的差评时间戳（共 47 条异常差评） 2. 估计参数：$\mu=0.08$/天，$\alpha=0.62$，$\beta=1.1$/天（激发比 $\alpha/\beta=0.56$，稳定但有显著自激） 3. 识别规律：攻击集群约每 14 天一轮，每轮持续 3-5 天 4. 提前 72 小时预警下一轮攻击窗口，触发：① 加速正向评价邀请 ② 准备申诉材料 ③ 提高品牌词广告出价 5-10%
量化产出：主动防御后排名波动从 -35% 降至 -8%，年均避免 8 次攻击损失，年化节省 GMV 损失约 35-50 万元。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

35-50 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（111 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy.optimize import minimize
from scipy.stats import poisson

def hawkes_log_likelihood(params, event_times, T):
    """
    Hawkes 过程对数似然函数
    params: [mu, alpha, beta]
    event_times: 攻击事件时间戳列表（天）
    T: 观测窗口总长度（天）
    """
    mu, alpha, beta = params
    if mu <= 0 or alpha <= 0 or beta <= 0:
        return 1e10

    n = len(event_times)
    if n == 0:
        return mu * T  # 无事件

    # 计算每个事件时刻的强度
    log_lik = 0.0
    A = 0.0  # 递推累积项

    for i, t_i in enumerate(event_times):
        if i == 0:
            A = 0.0
        else:
            A = np.exp(-beta * (t_i - event_times[i-1])) * (1 + A)
        intensity = mu + alpha * A
        log_lik += np.log(max(intensity, 1e-10))

    # 积分项（补偿项）
    integral = mu * T
    for t_i in event_times:
        integral += (alpha / beta) * (1 - np.exp(-beta * (T - t_i)))

    return -(log_lik - integral)

def fit_hawkes(event_times, T):
    """拟合 Hawkes 过程参数"""
    result = minimize(
        hawkes_log_likelihood,
        x0=[0.1, 0.5, 1.0],
        args=(event_times, T),
        method='L-BFGS-B',
        bounds=[(1e-6, 10), (1e-6, 5), (1e-6, 20)]
    )
    mu, alpha, beta = result.x
    return {'mu': mu, 'alpha': alpha, 'beta': beta,
            'excitation_ratio': alpha/beta,
            'converged': result.success}

def predict_attack_intensity(params, event_times, future_window=7):
    """预测未来 future_window 天的期望攻击次数"""
    mu = params['mu']
    alpha = params['alpha']
    beta = params['beta']
    T_now = max(event_times) if event_times else 0

    # 当前时刻的激发强度
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1904.10418，但该号在 arXiv 上是《A model independent parametrization of the late time cosmic acceleration: constraints on the parameters from recent observations》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Temporal Point Processes for Event Forecasting》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需覆盖半年以上的差评时间戳（标注异常差评）、同期订单与销量数据用于换算损失，事件级粒度、按天对齐。

**输出**：产出拟合后的 Hawkes 参数（如 μ、α、β 与激发比）、攻击周期规律、下一轮攻击窗口的 72 小时预警，以及排名波动与 GMV 损失对比，供运营安排防守节奏。

## 执行步骤

1. 整理过去 180 天差评时间戳并标注异常差评
2. 拟合 Hawkes 过程参数并计算激发比
3. 识别攻击集群周期与每轮持续天数
4. 输出下一轮攻击窗口的 72 小时预警
5. 触发正向评价邀请、申诉材料准备与品牌词广告出价调整

## 边界与不做

- 差评数量太少、没有时间聚集特征时，Hawkes 拟合缺乏统计意义
- 只做攻击窗口预警与防守建议，不代替平台做差评删除或账号处罚
- 预警动作限于合规防守手段，禁止刷评、买评或对攻击方实施反向行为

## 技能关联

- **可组合**：Skill-Review-Attack-Hawkes-Process

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-Review-Attack-Hawkes-Process`