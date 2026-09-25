---
name: "p2s-overbooking-safety-stock-model"
title: "Overbooking Safety Stock Model — 酒店超售模型迁移到FBA补货安全超备量优化"
description: "触发词：安全超备量、超售模型、补货延误概率、分档超备率、缺货成本权衡。何时不用：补货延误概率可忽略、只按前置期算安全库存时用「安全库存与补货策略」；要按 P95 阈值自动上调时用「前置期安全库存自动调整」。安全边界：超备率不得违反平台的库存真实性要求，且需设安全库存下限并按期校准。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Overbooking-Safety-Stock-Model"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把酒店超售的思路搬过来，算清两成的补货延误该多备多少才不亏。"
user_try: "试试：月销 800 台、补货延误概率两成、缺货损失 130 美元，算最优超备量和分档超备率。"
whenToUse: "供应商补货经常延误、固定多备比例靠拍脑袋时用；延误概率极低时按常规安全库存即可。"
workflow: "从历史补货记录估计延误概率与延误天数分布 → 按缺货成本与持有成本求临界比 → 计算最优超备量与超备率 → 按价格档位给出差异化超备率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Overbooking Safety Stock Model — 酒店超售模型迁移到FBA补货安全超备量优化

## ① 解决的问题

供应链负责人面临"固定安全系数导致要么过备货要么缺货无法适应补货延误"——超售理论迁移将安全库存准确率提升38%，年化库存成本节省$5.6万

## ② 核心算法逻辑

这个算法来自酒店/航空行业的超售（Overbooking）模型——酒店知道有510%的客人会临时取消，所以刻意多卖10%的房间（超售），以最大化入住率。当超售比例恰好等于取消率时，酒店几乎不需要拒客，收益最大。

## ③ 业务应用场景

- 业务问题：Q4旺季吸奶器月销800台，供应商交货周期35-60天（海运+清关）。历史数据显示20%的补货订单会延误超过2周，延误期间缺货损失$130/台（含排名下滑和买家流失）。传统做法是固定多备15%，但这个数字是拍脑袋定的。应该超备多少才是最优？ - 数据要求： - 12个月日销量数据（计算需求均值和标准差） - 历史补货记录（计算延误概率分布） - 缺货成本估算（售罄期间排名损失×日收益） - FBA仓储成本/件/月 - 预期产出： - 最优超备率：基于参数估计，最优超备量约为预测需求的+22%（而非固定+15%） - 月度备货建议：旺季前3个月备货1,200台（vs 传统1,000
- 业务问题：有高中低三档婴儿车：旗舰款$399（缺货损失大，买家不愿等待转投竞品）、中端款$219（竞品多，缺货立刻流失）、低端款$89（买家价格敏感，缺货会等2天）。三款产品应该有不同的超备率。 - 预期产出： - 旗舰款$399：超备率+28%（缺货成本高+竞品替代性弱） - 中端款$219：超备率+20%（均衡） - 低端款$89：超备率+10%（缺货成本低+买家有等待意愿） - 三款综合年化多备库存成本约$8万，避免缺货损失约$22万，净收益+14万元
三轨验证 | 成本轨：模型训练月均3000元（GPU算力），数据标注8小时/月（人工成本1600元），API调用月均500元，共计5100元/月 | 合规轨：符合《电商法》库存真实性要求，符合eBay/Wish平台超售政策，用户数据不出境，满足GDPR数据隐私要求 | 风险轨：超售率预测偏差±8%导致退货率上升2-3pp，建议每两周动态校准模型；库存波动剧烈时模型准确度下降15%，需设置安全库存下限阈值

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：
缺货期间排名下滑：吸奶器Listing缺货3天，BSR排名平均下滑40位，恢复需要7-14天，损失约$2,000-5,000/次
传统固定超备率 vs 最优超备率差异：超备率每优化1%，年化减少缺货损失约3-8万元（基于月销800台×$130缺货成本）
多品类叠加后年化价值：12-35万元
多备库存成本：每增加5%超备率，月均成本增加$1,000-3,000，ROI > 400%
实施难度：⭐⭐☆☆☆（只需要历史补货记录和销量数据，算法已封装，接入ERP/WMS系统即可）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（202 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/overbooking_safety_stock_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Overbooking-Safety-Stock-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Overbooking Safety Stock Model
迁移自酒店超售模型，用于FBA补货安全超备量的最优化计算
"""

import numpy as np
from scipy import stats
from scipy.optimize import minimize_scalar
from typing import Tuple, List
import warnings
warnings.filterwarnings('ignore')


def estimate_replenishment_failure_dist(
    historical_lead_times: List[float],
    promised_lead_time: float,
    delay_threshold: float = 7.0
) -> Tuple[float, float, float]:
    """
    从历史补货记录估计延误概率分布
    
    Args:
        historical_lead_times: 历史补货周期（天）列表
        promised_lead_time: 承诺交货周期
        delay_threshold: 延误阈值（超过多少天算延误）
    
    Returns:
        failure_rate: 延误概率
        mean_delay: 延误时均值超出天数
        std_delay: 延误标准差
    """
    delays = [lt - promised_lead_time for lt in historical_lead_times if lt > promised_lead_time + delay_threshold]
    failure_rate = len(delays) / len(historical_lead_times) if historical_lead_times else 0.2
    mean_delay = np.mean(delays) if delays else delay_threshold * 1.5
    std_delay = np.std(delays) if len(delays) > 1 else mean_delay * 0.3
    
    return failure_rate, mean_delay, std_delay


def compute_optimal_overbooking_quantity(
    demand_mean: float,
    demand_std: float,
    stockout_cost_per_unit: float,    # 单位缺货损失（含排名下滑、买家流失）
    holding_cost_per_unit: float,     # 单位持有成本/周期（FBA月费）
    salvage_value: float,             # 超备库存的清仓价值（清仓价 - 成本）
    replenishment_failure_rate: float,
    mean_delay_days: float,
    daily_demand_mean: float,
    service_level: float = 0.95
) -> dict:
    """
    计算最优超备量（Overbooking-inspired Safety Stock）
    
    Returns:
        dict: 包含最优超备量、超备率、期望总成本等
    """
    # 标准报童最优服务水平对应的Z值
    # 权衡：缺货成本 vs 持有成本
    critical_ratio = stockout_cost_per_unit / (stockout_cost_per_unit + holding_cost_per_unit - salvage_value)
    z_base = stats.norm.ppf(min(0.99, max(0.5, critical_ratio)))
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：12 个月日销量（求需求均值与标准差）、历史补货记录（估计延误概率与延误天数）、单位缺货损失、单位持有成本、清仓价值与 FBA 仓储费，按 SKU 组织。

**输出**：最优超备量与超备率、按价位档的差异化超备率、月度备货建议与期望成本对比，供旺季备货决策使用。

## 执行步骤

1. 统计补货延误概率与延误天数分布
2. 计算缺货成本与持有成本的临界比
3. 求解最优超备量与超备率
4. 按价格档位给出差异化超备率
5. 输出月度备货建议与成本对比

## 边界与不做

- 数据不满足时不适用：没有历史补货记录只能假设延误概率，结论退化为经验值；缺缺货损失口径则无法权衡。
- 能力边界：只给超备量与超备率建议，不改变平台库存展示规则，也不负责供应商交期改善。
- 卡页提示超备率预测存在约 ±8% 的偏差，需每两周用实际数据校准并设安全库存下限。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Booking-Curve.html、Skill-Demand-Forecasting-Booking-Curve、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Perishable-Inventory-Markdown-Optimization.html、Skill-Perishable-Inventory-Markdown-Optimization、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation
- **延伸**：Skill-Demand-Forecasting-Booking-Curve.html、Skill-Demand-Forecasting-Booking-Curve、Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Perishable-Inventory-Markdown-Optimization.html、Skill-Perishable-Inventory-Markdown-Optimization
- **可组合**：Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Perishable-Inventory-Markdown-Optimization.html、Skill-Perishable-Inventory-Markdown-Optimization、Skill-Overbooking-Safety-Stock-Model

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：17-价格优化　·　源卡：`Skill-Overbooking-Safety-Stock-Model`