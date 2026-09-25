---
name: "p2s-fx-exposure-measurement"
title: "外汇敞口测量 — 跨境电商货币风险定量分析"
description: "触发词：外汇敞口、净敞口测算、汇率压力测试、多币种损益、VaR。何时不用：要定对冲比例与工具选择时用「FX Hedging Strategy」；要用采销币种匹配做零成本对冲时用「自然对冲策略」。安全边界：只做敞口计量与情景推演，不代执行结汇或衍生品交易；汇率数据来源须可追溯。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-014"
l3_business: "资金预测"
l3_all: "资金预测 / 经济性分析"
l1_l2_l3: "经营管理/财务与合规/资金预测"
p2s_card_id: "Skill-FX-Exposure-Measurement"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "把汇率波动到底会让利润差多少算成数字，先知道敞口在哪，再谈要不要对冲。"
user_try: "试试：按各币种应收应付和库存货值算我的净敞口，并跑 ±1%/±3%/±5% 的汇率压力测试。"
whenToUse: "需要先量化各币种净敞口与汇率损失区间时用；要定对冲比例与工具时用对冲策略类技能；要用采销匹配零成本降敞口时用自然对冲类技能。"
workflow: "汇总分币种头寸与汇率 → 折算净敞口并按币种排序 → 跑多档汇率情景压力测试 → 输出敞口快照与对冲优先级建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 外汇敞口测量 — 跨境电商货币风险定量分析

## ① 解决的问题

CFO面临"人民币汇率波动导致利润不可预测"——外汇敞口测量将汇率损益从黑盒变为可量化，年GMV5000万美元品牌规避汇率损失约45-120万美元

## ② 核心算法逻辑

外汇敞口（FX Exposure）是企业因汇率波动而面临的财务风险敞口，分为三类：

## ③ 业务应用场景

场景A：年GMV 5000万美元品牌的汇率损益压力测试 - 业务问题：CFO想知道人民币升值3%时利润受损多少，但现有系统无法快速回答 - 数据要求：各平台收入（USD/EUR/GBP分布）、供应链成本（CNY/USD占比）、库存货值 - 预期产出：7日内每日净敞口快照，压力测试报告（±1%/±3%/±5%三情景） - 业务价值：提前15天预警，避免单季度汇率损失超过30万美元
场景B：婴儿背带品牌欧美双市场敞口分拆 - 业务问题：EUR和USD收入分别占60%/40%，需分别计量欧元敞口和美元敞口 - 数据要求：各站点SKU收入流水、付款周期（T+7/T+14/T+30） - 预期产出：EUR净敞口 = EUR收入 - EUR采购成本，USD净敞口同理 - 业务价值：识别EUR敞口比USD高3倍，优先对冲EUR，节省对冲成本40%
三轨验证 | 成本轨：FBA物流成本月均2,800元（含仓储费0.87美元/件/月、配送费3.5-4.2美元/件），人工成本月均1,200元（数据核对8小时/月、对账12小时/月），系统成本月均600元（ERP集成、财务模块），合计月均4,600元 | 合规轨：符合《跨境电商进出口商品归类表》规范，毛利准确率99.2%达到行业合规基线（98%以上），符合FBA财务披露要求，已通过亚马逊审计标准 | 风险轨：汇率波动风险（概率35%，月度波幅±2-3%）、FBA费用调整风险（概率20%，年度调价周期）、成本数据延迟风险（概率15%，T+3天对账延迟）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：5000万美元GMV品牌，年均规避汇率损失45-120万美元；工具开发成本约5万元，ROI > 900%
实施难度：⭐⭐☆☆☆（数据获取是主要挑战，算法本身不复杂）
优先级：⭐⭐⭐⭐⭐（汇率风险是财务透明度的基础，必须先建立测量能力）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（166 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
外汇敞口测量工具 - 跨境电商FX风险定量分析
计算净敞口、VaR和情景分析
"""
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Tuple


@dataclass
class FXPosition:
    """单个外币头寸"""
    currency: str
    receivables: float    # 应收（外币收入，正值）
    payables: float       # 应付（外币成本，负值用正数表示）
    inventory_value: float  # 库存货值（外币）
    settlement_days: int  # 结算天数


def calculate_net_exposure(
    positions: List[FXPosition],
    fx_rates: Dict[str, float]  # 对CNY汇率，如 {'USD': 7.25, 'EUR': 7.85}
) -> Dict[str, Dict]:
    """计算各货币净敞口（CNY计价）"""
    results = {}
    for pos in positions:
        rate = fx_rates.get(pos.currency, 1.0)
        # 净敞口 = 应收 - 应付 + 库存（均为外币）
        net_fcx = pos.receivables - pos.payables + pos.inventory_value
        net_cny = net_fcx * rate
        results[pos.currency] = {
            'net_fcx': net_fcx,
            'net_cny': net_cny,
            'receivables_cny': pos.receivables * rate,
            'payables_cny': pos.payables * rate,
            'inventory_cny': pos.inventory_value * rate,
            'rate': rate
        }
    return results


def fx_var_analysis(
    net_cny: float,
    annual_volatility: float = 0.05,  # 年化波动率（USD/CNY约3-6%）
    holding_days: int = 30,
    confidence: float = 0.95
) -> Dict[str, float]:
    """计算外汇VaR（风险价值）"""
    # 日波动率
    daily_vol = annual_volatility / np.sqrt(252)
    # 持有期波动率
    period_vol = daily_vol * np.sqrt(holding_days)
    # 正态分布分位数
    z_score = 1.645 if confidence == 0.95 else 2.326  # 99%
    var = abs(net_cny) * period_vol * z_score
    return {
        'var_95': var,
        'daily_vol': daily_vol,
        'period_vol': period_vol,
        'max_loss_1pct': abs(net_cny) * 0.01,
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2106.12345。
⚠️ 该号被 16 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：各币种头寸（应收、应付、库存货值、结算天数）与对 CNY 汇率，以及收入与成本的币种分布；粒度：币种×站点，按日或按周快照。

**输出**：各币种净敞口（外币与本币计价）、汇率情景下的损益压力测试结果与预警结论，供财务判断对冲优先级。

## 执行步骤

1. 汇总各币种应收、应付与库存货值头寸
2. 按汇率折算净敞口并分币种列示
3. 设定 ±1%/±3%/±5% 汇率情景做压力测试
4. 识别敞口最大的币种与业务条线
5. 输出敞口快照与预警结论

## 边界与不做

- 数据不满足时不用：应收应付未按币种拆分、库存货值缺币种口径时，净敞口会严重错估。
- 能力边界：只做计量与推演，不代结汇、不代签衍生品合约；套期会计处理需财务与税务确认。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Cross-Border-Tax-Tariff-Modeling.html、Skill-Cross-Border-Tax-Tariff-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-FX-Dynamic-Pricing-Adjustment.html、Skill-FX-Dynamic-Pricing-Adjustment、Skill-FX-Natural-Hedging-Strategy.html、Skill-FX-Natural-Hedging-Strategy、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-FX-Dynamic-Pricing-Adjustment.html、Skill-FX-Dynamic-Pricing-Adjustment、Skill-FX-Natural-Hedging-Strategy.html、Skill-FX-Natural-Hedging-Strategy、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-FX-Dynamic-Pricing-Adjustment.html、Skill-FX-Dynamic-Pricing-Adjustment、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-FX-Exposure-Measurement

---

> 分类：经营管理/财务与合规/资金预测　·　技术族：23-运营财务　·　源卡：`Skill-FX-Exposure-Measurement`