---
name: "p2s-replenishment-parameter-calibration"
title: "补货系统4参数动态校准 — 前置期/安全库存/补货点/最大库存的精准化维护体系"
description: "触发词：补货参数校准、前置期漂移、安全库存天数、补货点更新、季节指数。何时不用：只想算一次安全库存时用「安全库存与补货策略」；前置期超标要自动上调时走「前置期安全库存自动调整」。安全边界：参数变更须留版本与生效记录，自动写回补货系统前需人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Replenishment-Parameter-Calibration"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "每季度给补货系统的四个参数做一次体检，别让半年前的前置期一直用到现在。"
user_try: "试试：用近 90 天销量和最近 20 批实际交期，做一次补货参数校准并给出新参数。"
whenToUse: "补货系统参数设置后长期未更新、出现前置期漂移或旺季缺货时用；一次性算安全库存用「安全库存与补货策略」。"
workflow: "对比实际前置期与系统参数前置期检测漂移 → 按服务水平重算安全库存天数与补货点 → 计算 12 个月季节指数并调整旺季参数 → 输出参数更新建议与健康诊断"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 补货系统4参数动态校准 — 前置期/安全库存/补货点/最大库存的精准化维护体系

## ① 解决的问题

补货系统6个月前设置的参数从未更新导致前置期漂移10天缺货率从5%升至18%——4参数（前置期/安全库存/ROP/最大库存）+3变量季节指数的动态校准，季度一次维护防损ROI达1800%

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：补货系统的准确性取决于参数维护的质量，而大多数团队设置一次参数后就"忘了"——市场在变化，参数没有跟上，导致补货永远不准。书中给出了补货系统的完整参数体系（4+3+2），并明确了每类参数的更新频率和更新依据。

## ③ 业务应用场景

- 业务问题：某卖家6个月前设置了补货系统参数，但供应商交期从28天延长到38天，系统仍按28天前置期计算，导致缺货率从5%升至18% - 参数漂移检测： 1. 每月计算"实际前置期 vs 系统参数前置期"的偏差 2. 发现平均前置期已经是37.5天（vs 参数28天） 3. 触发参数更新流程：前置期28→38，安全库存从14天→18天，ROP相应更新 4. 缺货率在下一个补货周期恢复至5%
- 业务问题：补货系统用全年平均日销量计算补货量，Q4旺季时补货量仍按平均水平，导致严重缺货 - 季节指数应用：计算每月历史销量vs全年均值的比值（季节指数），ROP和Max Stock乘以季节指数→旺季自动多备货
三轨验证 | 成本轨：AI模型月均成本3,200元（API调用+服务费），人工调参8小时/月（成本1,600元），总月成本4,800元；年化57,600元，相比45万年化收益ROI为7.8倍 | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策；需获得婴幼儿食品进口备案证书，符合GB 10765婴幼儿配方乳粉标准 | 风险轨：模型训练数据偏差导致预测误差±8%（概率35%），可能加剧缺货或积压；供应链突发中断（概率15%）导致参数失效；跨境物流延迟影响补货周期（概率25%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：前置期参数漂移10天导致缺货率从5%升至18%，每月多损失约$3000；每季度参数校准维护$500工作量→防损$9000，ROI=1800%
实施难度：⭐⭐☆☆☆（公式直接，主要工作是建立参数更新触发机制和历史前置期记录）
优先级：⭐⭐⭐⭐⭐（书中第七章数字化核心，补货系统参数漂移是"低成本、高频率"的缺货根因）
适用规模：所有有补货系统的卖家，建议至少每季度运行一次参数校准
数据依赖：历史日销量（90天+）、实际交期记录（20+批次）、月度销量数据（12个月）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（247 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/replenishment_parameter_calibration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Replenishment-Parameter-Calibration.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
补货系统4参数动态校准
基于《全链路管理》陈凤霞 第七章第四节
4基础参数 + 3变量参数 + 2计算参数 + 参数健康诊断
"""
import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')


@dataclass
class ReplenishmentParameters:
    """补货系统参数集"""
    sku_id: str
    # 4个基础参数
    lead_time_days: float           # 前置期
    safety_stock_days: float        # 安全库存天数
    service_level: float = 0.95     # 目标服务水平
    max_stock_days: float = 60.0    # 最大库存天数
    # 参数设置时间
    param_version: str = '2026-Q1'
    last_calibration: str = '2026-01'


class ReplenishmentParameterCalibrator:
    """补货参数校准器"""

    @staticmethod
    def compute_safety_stock_days(daily_sales: np.ndarray, lead_time: float,
                                   service_level: float = 0.95) -> float:
        """
        安全库存天数 = z × σ_D × √LT / 日均销量
        （书中标准公式）
        """
        if len(daily_sales) < 7:
            return 14.0  # 数据不足时的默认值

        z = stats.norm.ppf(service_level)
        sigma_d = float(np.std(daily_sales))
        avg_d = float(np.mean(daily_sales))

        # 安全库存件数
        safety_units = z * sigma_d * np.sqrt(lead_time)
        # 转化为天数
        safety_days = safety_units / max(avg_d, 0.01)

        return max(round(safety_days, 1), 3.0)  # 最少3天安全库存

    @staticmethod
    def compute_seasonal_index(monthly_sales: List[float]) -> Dict[int, float]:
        """
        计算12个月的季节指数
        季节指数 = 当月销量 / 全年月均销量
        """
        if len(monthly_sales) < 12:
            return {i+1: 1.0 for i in range(12)}
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史日销量（90 天以上）、实际交期记录（20 批次以上）、月度销量（12 个月）与当前补货系统参数（前置期、安全库存天数、服务水平、最大库存天数），按 SKU 组织。

**输出**：校准后的前置期、安全库存天数、补货点与最大库存，附参数漂移检测结果、季节指数表与参数健康诊断，供系统参数更新。

## 执行步骤

1. 对比实际前置期与参数前置期检测漂移
2. 按目标服务水平重算安全库存天数
3. 用补货点公式更新补货点与最大库存
4. 计算月度季节指数并叠加到旺季参数
5. 输出参数更新建议与生效版本记录

## 边界与不做

- 数据不满足时不适用：历史日销量不足 90 天或实际交期批次少于 20 批时，重算参数不稳，应维持现值。
- 能力边界：只给校准后的参数与诊断，写回补货系统、审批与生效由人工或系统流程完成。

## 技能关联

- **前置**：Skill-Automated-Replenishment-Decision-Engine.html、Skill-Automated-Replenishment-Decision-Engine、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Automated-Replenishment-Decision-Engine.html、Skill-Automated-Replenishment-Decision-Engine、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Replenishment-Parameter-Calibration

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Replenishment-Parameter-Calibration`