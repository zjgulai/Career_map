---
name: "p2s-elasticity-based-repricing-gate"
title: "Elasticity-Based Repricing Gate — 弹性阈值自动触发涨价/降价A/B测试"
description: "触发词：弹性门控、自动触发调价、涨价测试、样本量门控、置信区间判据、安全护栏。何时不用：弹性还没估出来先用「需求价格弹性估算」；按库存窗口决定提价用「EMSR-b 边际库存定价」。安全边界：只输出是否触发测试的判决与测试参数，不自动改价、不自动放量；护栏触发后须人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 实验设计"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Elasticity-Based-Repricing-Gate"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "弹性算完就自动往下走：够显著才触发降价或涨价的 A/B 测试，样本不够就先观望，测试期间盯住护栏。"
user_try: "试试：我的弹性是 -1.8、95% 区间 [-2.1,-1.5]，近 30 天 1200 单，帮我判断现在该不该触发降价测试、要测多久。"
whenToUse: "当弹性已经估出来、需要把它变成一次带护栏的调价 A/B 测试（含样本量与时长判据）时用本技能；若弹性尚未估计，先用「需求价格弹性估算」；若调价由库存窗口驱动，用「EMSR-b 边际库存定价」。"
workflow: "输入弹性点估计与置信区间、当前售价与近 30 天样本量 → 先用样本量门控判断是继续观望还是触发测试 → 高弹性且置信区间下界超过阈值时，按幅度生成测试价与 A/B 分组 → 用 calc_ab_sample_size 估算每组最小样本量与测试天数 → 把转化率与毛利率护栏写入实验的自动停止条件"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Elasticity-Based Repricing Gate — 弹性阈值自动触发涨价/降价A/B测试

## ① 解决的问题

定价团队面临"弹性估计完成后无人执行调价"——弹性阈值自动触发A/B测试，将价格优化周期从3周压缩至48小时，年化毛利提升$30,000

## ② 核心算法逻辑

论文：RealTime Bidding with ElasticityAware Reserve Prices | 年份：2019

## ③ 业务应用场景

场景：婴儿有机棉连体衣的动态调价触发 - 触发条件：弹性估计PED=-1.8（95%CI: [-2.1, -1.5]，完全低于-1.5），近30天销量1,200单 - 执行动作：当前价$28.99 → 测试价$27.54（降5%），A组50%流量，测试14天，最小样本量估计600单/组 - 安全护栏：转化率下降>15%或毛利率<25%自动停止测试 - 业务价值：降价5%预计销量提升10%，毛利净增约$3,200/月
**三轨验证** | 成本轨：系统开发成本约12万元（含算法模型、数据集成），月均运维成本2500元（技术支持10小时/月、数据更新8小时/月），年度总成本约42万元；ROI周期6个月（基于GMV+23%增长） | 合规轨：符合《电商平台经营规范》动态定价披露要求，需在商品页面标注

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：年化价格优化收益约15-25%毛利提升，每SKU年化$2,000-$8,000
实施难度：⭐⭐☆☆☆（规则明确，需接入弹性估计流水线）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（146 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy import stats
from typing import Dict, Optional, Tuple

def elasticity_repricing_gate(
    ped_estimate: float,
    ped_ci_lower: float,
    ped_ci_upper: float,
    current_price: float,
    sample_size: int,
    min_sample_threshold: int = 500,
    high_elasticity_threshold: float = 1.5,
    low_elasticity_threshold: float = 0.5,
    price_decrease_pct: float = 0.05,
    price_increase_pct: float = 0.03,
    stat_power: float = 0.8,
    alpha: float = 0.05
) -> Dict:
    """
    弹性门控决策触发器
    
    参数:
        ped_estimate: 价格弹性点估计（负值，如-1.8）
        ped_ci_lower/upper: 95%置信区间下/上界
        current_price: 当前价格
        sample_size: 近30天样本量
        min_sample_threshold: 触发所需最小样本量
    
    返回:
        决策字典，含action类型、测试参数、执行指令
    """
    abs_ped = abs(ped_estimate)
    abs_ci_lower = abs(ped_ci_lower)
    abs_ci_upper = abs(ped_ci_upper)
    
    # 数据量门控
    if sample_size < min_sample_threshold:
        return {
            "trigger": False,
            "reason": f"样本量{sample_size} < 最低要求{min_sample_threshold}，仅建议观测",
            "recommendation": f"弹性={ped_estimate:.2f}，等待更多数据",
            "action": "WAIT"
        }
    
    # 弹性分类 + 置信区间门控
    def calc_ab_sample_size(effect_size: float, power: float = 0.8, alpha: float = 0.05) -> int:
        """基于效应量计算每组最小样本量"""
        z_alpha = stats.norm.ppf(1 - alpha / 2)
        z_beta = stats.norm.ppf(power)
        n = 2 * ((z_alpha + z_beta) / effect_size) ** 2
        return int(np.ceil(n))
    
    # 高弹性：降价测试
    if abs_ci_lower > high_elasticity_threshold:  # CI下界也超阈值，置信区间完全在高弹区
        test_price = round(current_price * (1 - price_decrease_pct), 2)
        expected_demand_lift = abs_ped * price_decrease_pct  # 弹性×价格变动幅度
        effect_size = expected_demand_lift / 0.2  # 假设基准转化率波动标准差0.2
        n_per_group = calc_ab_sample_size(max(effect_size, 0.1))
        test_days = max(7, int(np.ceil(n_per_group * 2 / (sample_size / 30))))
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1909.09233，但该号在 arXiv 上是《Robust Humanoid Contact Planning with Learned Zero- and One-Step Capturability Prediction》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《RealTime Bidding with ElasticityAware Reserve Prices》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：弹性点估计与其 95% 置信区间、当前售价、近 30 天样本量，以及护栏参数：最小样本阈值、高/低弹性阈值、降价与涨价幅度、统计功效与显著性水平；粒度为单 SKU 的一次调价决策。

**输出**：一份门控判决：是否触发、行动类型（继续观望或降价/涨价测试）、测试价、每组最小样本量与测试天数、停止护栏；供定价与增长团队据此执行实验。

## 执行步骤

1. 汇总弹性点估计、置信区间、当前售价与近 30 天样本量
2. 先用样本量门控判断是否满足触发条件
3. 高弹性时按设定幅度生成测试价格与 A/B 分组方案
4. 计算每组最小样本量与所需测试天数
5. 把转化率与毛利率护栏写成自动停止条件后交付执行

## 边界与不做

- 数据不满足：样本量低于阈值（默认 500）时不触发，只建议继续观测。
- 何时不用：弹性尚未估计时先用「需求价格弹性估算」；库存驱动的提价决策用「EMSR-b 边际库存定价」。
- 能力边界：只做门控判决与测试参数生成，不含流量分配、改价执行与实验结果显著性分析。
- 安全边界：本技能承载的是置信门控与判据，不是执行器；触发后的调价与放量由平台侧人工或确定性流程完成。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Counterfactual-Price-Elasticity.html、Skill-Counterfactual-Price-Elasticity、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Counterfactual-Price-Elasticity.html、Skill-Counterfactual-Price-Elasticity、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-Elasticity-Based-Repricing-Gate

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Elasticity-Based-Repricing-Gate`