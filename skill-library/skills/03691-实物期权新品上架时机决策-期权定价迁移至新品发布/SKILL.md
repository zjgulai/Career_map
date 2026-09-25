---
name: "p2s-real-options-product-launch-timing"
title: "实物期权新品上架时机决策 — Black-Scholes期权定价迁移至新品发布"
description: "触发词：实物期权、上架时机、备货批量、需求波动率。何时不用：无法估计需求波动率、或市场窗口极短无等待价值时不用本卡；需求已定只需算补货量时用补货模拟类技能。安全边界：产品须先满足目标市场认证（如 CE、ECE R44 或 R129），否则期权策略无效。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-025"
l3_business: "阶段投资建议"
l3_all: "阶段投资建议 / 补货模拟"
l1_l2_l3: "业务运营/产品与创新/阶段投资建议"
p2s_card_id: "Skill-Real-Options-Product-Launch-Timing"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把新品备货当成一份期权来定价，算出该试水多少、什么时候追加订单。"
user_try: "试试：新款吸奶器不确定市场接受度，帮我算算首批该备多少、什么时候追单。"
whenToUse: "本卡属「阶段投资建议」。新品接受度未知、需要在试水批量与追货时机之间做投资决策时用本卡；需求已明确、只需算补货量时用补货模拟类技能。"
workflow: "用历史月销量算波动率 → 取售价成本与窗口期 → 计算实物期权价值 → 输出试水批量与追货时机"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 实物期权新品上架时机决策 — Black-Scholes期权定价迁移至新品发布

## ① 解决的问题

运营面临"新款上市备货量难以决策、押注过多滞销过少断货"——实物期权Black-Scholes将首批备货误差从±45%改善为±18%，年化减少押注损失30万元

## ② 核心算法逻辑

原属学科：金融工程 / 衍生品定价理论（BlackScholes, 1973）

## ③ 业务应用场景

- 业务问题：竞品吸奶器新款刚上市，品牌方不确定市场接受度，直接备货5,000个（沉没成本60万元）风险极高；小批量试水500个则面临爆单后无货的断货损失 - 数据要求： - 品类历史月销量数据（12个月）→ 计算需求波动率σ - 预期售价与成本（计算预期GMV） - 市场窗口期（如备战Q4，窗口期T=3个月） - 资金年化成本r（如6%） - 预期产出： - 实物期权价值：等待观察的机会价值（元） - 期权价值 vs 直接投入对比表 - 最优决策：试水批量 + 追货时机建议 - 业务价值：首批备货误差从±45%降至±18%，错误押注损失降低年化30万元 - 三轨验证： - 成本：需采购历史销
场景B：安全座椅新标准认证后的欧洲市场进入时机
- 认证完成但市场接受度未知，实物期权帮助决策是否立即大规模铺货还是先小批量测试欧洲市场反应 - 波动率σ来自过去12个月的亚马逊类目需求标准差/均值 - 预期ROI：避免滞销损失预计年化25万元 - **三轨验证**： - **成本**：欧洲市场数据需额外采购（约800元/品类/年）；认证文件翻译与合规审核约2000元/次 - **合规**：需确保产品符合欧盟CE/ECE R44或R129标准，否则期权策略无效；广告文案需符合欧盟不公平商业行为指令（UCPD） - **风险**：小批量测试可能引发竞品跟卖或价格战；若测试期过长，可能错过欧洲Q4旺季窗口；建议测试期不超过6周

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：首批备货误差从±45%→±18%，避免错误押注损失年化30万元；适用于月均新品上架5-10款的母婴卖家
适用规模：年GMV 500万元以上的母婴跨境卖家（需要有12个月历史销量数据）
实施难度：⭐⭐☆☆☆（Python scipy即可，无需额外基础设施）
优先级：⭐⭐⭐⭐☆（竞品几乎无此能力，是真正的算法护城河）
核心门槛：需要同品类12个月以上销量数据来估计波动率σ；冷启动时可使用行业基准值（母婴品类σ通常为0.25-0.45）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（155 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
实物期权新品上架时机决策 - Black-Scholes迁移
金融Call期权 → 母婴跨境电商新品备货时机决策
"""
import numpy as np
from scipy.stats import norm


def black_scholes_call(S, K, T, r, sigma):
    """
    Black-Scholes欧式看涨期权定价
    S: 标的资产价值（预期GMV，元）
    K: 执行价格（大批量补货成本阈值，元）
    T: 持有期（年，如3个月=0.25）
    r: 无风险利率（年化，如0.06=6%）
    sigma: 波动率（需求变异系数）
    返回: 期权价值C
    """
    if T <= 0 or sigma <= 0:
        return max(S - K, 0.0)
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    call_value = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    return call_value


def compute_demand_volatility(monthly_sales):
    """从历史月销量计算需求波动率（变异系数）"""
    arr = np.array(monthly_sales, dtype=float)
    mean_sales = np.mean(arr)
    if mean_sales == 0:
        return 0.3  # 默认保守估计
    return np.std(arr, ddof=1) / mean_sales


def real_options_launch_decision(
    monthly_sales_history,
    unit_sell_price,
    unit_cost,
    small_batch_qty,
    large_batch_qty,
    market_window_months,
    risk_free_rate=0.06,
    expected_monthly_units=None
):
    """
    实物期权新品上架决策分析

    参数:
    - monthly_sales_history: 历史月销量列表（用于估计波动率）
    - unit_sell_price: 新品预期售价（元）
    - unit_cost: 采购+头程成本（元/个）
    - small_batch_qty: 试水批量（个）
    - large_batch_qty: 大批量目标（个）
    - market_window_months: 市场窗口期（月）
    - risk_free_rate: 年化资金成本
    - expected_monthly_units: 预期月销量（None则用历史均值）
    """
    # 基础参数
    sigma = compute_demand_volatility(monthly_sales_history)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：品类历史月销量（用于计算需求波动率）、预期售价与成本、市场窗口期长度、资金年化成本。

**输出**：实物期权价值、期权价值与直接投入的对比表、最优试水批量与追货时机建议，用于首批备货决策。

## 执行步骤

1. 用历史月销量计算需求波动率
2. 确定预期售价成本、市场窗口期与资金成本
3. 计算等待观察的实物期权价值
4. 对比期权价值与直接投入，给出试水批量
5. 给出追货时机与窗口期上限建议

## 边界与不做

- 无法估计需求波动率、或不存在等待价值时不用本卡
- 本卡只产出备货与时机建议，不负责下单采购与资金安排
- 产品须先满足目标市场认证要求，广告文案需符合当地商业行为法规

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **延伸**：Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **可组合**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-Real-Options-Product-Launch-Timing

---

> 分类：业务运营/产品与创新/阶段投资建议　·　技术族：17-价格优化　·　源卡：`Skill-Real-Options-Product-Launch-Timing`