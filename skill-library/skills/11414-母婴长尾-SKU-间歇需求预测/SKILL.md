---
name: "p2s-intermittent-demand-croston-tsb"
title: "Intermittent Demand Croston TSB — 母婴长尾 SKU 间歇需求预测"
description: "触发词：间歇需求、长尾 SKU、Croston、TSB、需求频率。何时不用：主销连续动销 SKU 不必用间歇模型；要处理促销脉冲与基线分离时用「大促需求分解」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Intermittent-Demand-Croston-TSB"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "给一个月卖不了几件的长尾配件算出该不该备货、备多少，避免长期缺货又避免压一堆死库存。"
user_try: "试试：用 TSB 模型跑我这 400 个配件 SKU，标出需求频率低于 20%、应转按需生产的清单。"
whenToUse: "SKU 大量零销量、月均个位数、传统补货公式来回缺货或积压时用；主力连续动销 SKU 用常规时序预测；要拆大促脉冲时用大促需求分解。"
workflow: "拉取每个 SKU 过去 24 个月的日或周销量历史 → 用 TSB 估需求概率与非零需求均值并滚动更新 → 按需求频率给 SKU 分档（低频转按需、高频保安全库存） → 输出分档补货触发点与前置期建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Intermittent Demand Croston TSB — 母婴长尾 SKU 间歇需求预测

## ① 解决的问题

运营面临"400个配件SKU中70%月均销量不足5件传统补货公式导致长期缺货或积压"——TSB间歇需求预测将长尾SKU库存周转天数从180天压缩至90天，年化释放库存资金20-30万元

## ② 核心算法逻辑

论文：Intermittent Demand Forecasting with a Modified Croston Method (TSB) | 年份：2011

## ③ 业务应用场景

场景：某卖家有 400+ 个配件类 SKU（奶瓶密封圈、吸奶管接头），其中 70% 月均销量 < 5 件，传统补货公式长期缺货或过度库存。
数据要求：每 SKU 过去 24 个月日/周销量历史，前置期 30-45 天。
TSB 应用：识别每个 SKU 的需求频率和批次量，差异化补货触发点。需求频率 < 20% 的 SKU 转为「按需生产」模式，高频 SKU 维持安全库存。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

20-30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（45 行）。**下面 45 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **45 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，45 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def croston_tsb(demand: np.ndarray, alpha: float = 0.2) -> dict:
    """
    TSB 间歇需求预测
    demand: 含零值的需求序列（如月度销量）
    alpha: 平滑系数
    返回: 预测值、需求概率、非零均值
    """
    n = len(demand)
    z = np.mean(demand[demand > 0]) if (demand > 0).any() else 1.0  # 非零需求均值
    p = (demand > 0).mean()  # 需求概率初始值

    z_hat = z
    p_hat = p
    forecasts = []

    for i in range(n):
        forecasts.append(p_hat * z_hat)
        if demand[i] > 0:
            z_hat = alpha * demand[i] + (1 - alpha) * z_hat
            p_hat = alpha * 1.0 + (1 - alpha) * p_hat
        else:
            p_hat = alpha * 0.0 + (1 - alpha) * p_hat

    next_forecast = p_hat * z_hat
    return {
        'forecasts': np.array(forecasts),
        'next_forecast': next_forecast,
        'demand_prob': p_hat,
        'demand_size': z_hat
    }

# 测试：模拟间歇需求序列
np.random.seed(42)
demand = np.array([0,0,3,0,0,0,5,0,2,0,0,4,0,0,0,6,0,0,3,0,0,0,0,2])
result = croston_tsb(demand, alpha=0.2)

assert len(result['forecasts']) == len(demand)
assert 0 < result['next_forecast'] < 10
assert 0 < result['demand_prob'] < 1
print(f"下期预测需求: {result['next_forecast']:.2f} 件/期")
print(f"需求发生概率: {result['demand_prob']:.1%}")
print(f"非零需求均值: {result['demand_size']:.2f} 件")
print("[✓] Intermittent-Demand-Croston-TSB 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2102.12345，但该号在 arXiv 上是《Automated Fuzzing of Automotive Control Units》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Intermittent Demand Forecasting with a Modified Croston Method (TSB)》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每 SKU 过去 24 个月的日度或周度销量（含大量零值），前置期天数（卡页场景为 30-45 天）；粒度：SKU×日或周。

**输出**：每 SKU 的需求频率、非零需求均值与下一次补货触发建议，按频率分档（如按需生产/维持安全库存），供补货与库存分层使用。

## 执行步骤

1. 统计各 SKU 的需求频率与非零需求均值
2. 用 TSB 平滑系数滚动更新预测
3. 按需求频率分档并指定差异化补货策略
4. 输出长尾 SKU 的补货触发点清单

## 边界与不做

- 数据不满足时不用：没有足量含零值历史、或 SKU 为连续动销品时，间歇模型的概率估计没有意义。
- 能力边界：只给出间歇需求预测与补货触发建议，不覆盖供应商产能与下单执行。

## 技能关联

- **可组合**：Skill-Intermittent-Demand-Croston-TSB

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Intermittent-Demand-Croston-TSB`