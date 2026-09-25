---
name: "p2s-capacity-constraint-production-schedule-kpi"
title: "产能约束生产排程KPI — 产能利用率/排程达成率/换线时间/瓶颈识别"
description: "触发词：产能利用率、排程达成、换线优化、瓶颈识别。何时不用：缺少工厂月产能与订单占用数据时无法测算；只判断需求预测量级用需求预测类技能。安全边界：需符合跨境电商商品质量管理规范与平台库存政策，婴配粉类目需满足对应食品安全标准。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-042"
l3_business: "产能调查"
l3_all: "产能调查 / 订单协调"
l1_l2_l3: "业务运营/供应与履约/产能调查"
p2s_card_id: "Skill-Capacity-Constraint-Production-Schedule-KPI"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把工厂产能、订单占用与换线时间算清楚，旺季前识别断货风险并优化排产顺序。"
user_try: "试试：Q3 要备 24000 台吸奶器，工厂月产能只有 8000 台，帮我排一下产能并标出风险月份。"
whenToUse: "本卡属「产能调查」。需要评估工厂产能约束、排程达成与换线损失时用本卡；已确认产能缺口、要在多工厂之间分配订单时用多工厂产能分配类技能。"
workflow: "汇总月产能与订单占用 → 预测各月产能利用率 → 识别瓶颈与风险月份 → 优化排产顺序降低换线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 产能约束生产排程KPI — 产能利用率/排程达成率/换线时间/瓶颈识别

## ① 解决的问题

供应链计划者面临"不知工厂产能约束就做计划"——产能利用率75-85%目标+换线优化提升8%有效产能，旺季提前识别断货风险保护50万GMV

## ② 核心算法逻辑

母婴品牌通常通过OEM工厂生产，工厂产能是供应链计划的硬约束。陈凤霞书中强调：不了解供应商产能约束，计划做得再好也无法执行。

## ③ 业务应用场景

场景A：吸奶器OEM工厂产能规划（旺季备货） - 业务问题：Q3计划备货旺季所需24,000台吸奶器，但工厂月产能只有8,000台，只有3个月时间，恰好够用 - 数据要求：工厂月产能（按型号）+ 当前订单占用情况 + 换线时间 + 计划交期 - 预期产出： - 产能利用率预测：旗舰款8月100%（满产）、9月95%（仍然过载） - 风险：9月如有质量异常返工，将导致延误 - 行动：备用工厂产能锁定2000台/月，旗舰款提前到7月开始生产 - 业务价值：产能风险提前识别，避免大促前断货，防止约50万GMV损失
场景B：多SKU产线排程优化（减少换线） - 业务问题：工厂同时生产5款吸奶器型号，换线频繁（每天平均换线6次×2小时=12小时），实际有效生产时间损失15% - 数据要求：各型号月需求量 + 换线时间矩阵（从型号A换到型号B的时间） - 预期产出：优化生产顺序（相似型号相邻排产），换线次数从6次/天降至3次/天，有效产能提升8% - 业务价值：无需额外投资，通过排程优化增加有效产能800台/月
**三轨验证** | 成本轨：FBA备货系统优化，月均成本3200元（仓储管理系统1500元/月+数据分析工具800元/月+人工40小时/月@22元/小时=880元），年化成本38400元。缺货率从12%降至3%，年化增收45万，ROI达11.7倍 | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策；需建立冷链追溯体系满足进口奶粉《食品安全法》要求；依据：GB 28050婴幼儿配方乳粉营养成分标准 | 风险轨：①库存积压风险（概率15%）：季节性需求波动导致滞销，需建立动态预测模型；②物流延误风险（概率8%）：跨境运输周期长，需提前30天备货；③汇率波动风险（概率12%）：采购

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：提前识别旺季产能瓶颈 → 避免大促前断货（按旗舰款GMV损失约30万）；换线优化提升有效产能8% → 相当于减少8%采购成本（无需外协补产）
实施难度：⭐⭐⭐☆☆（需要与供应商建立深度信息共享，主要难点是工厂数据获取）
优先级评分：⭐⭐⭐⭐☆（陈凤霞："不了解工厂产能就做计划，等于在沙上建楼"）
评估依据：母婴品牌OEM模式下，工厂产能是最终供应的硬约束，所有S&OP计划都需要以此为边界

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（192 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/capacity_constraint_production_schedule_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Capacity-Constraint-Production-Schedule-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
产能约束生产排程 KPI 体系
功能：产能利用率 / 排程达成率 / 换线分析 / 瓶颈识别 / 旺季产能规划
输入：生产订单记录 + 产能配置 + 换线时间矩阵
输出：产能KPI报告 + 瓶颈识别 + 排程优化建议
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def generate_production_data(n_months=6, seed=42):
    """生成月度生产计划与实际数据"""
    np.random.seed(seed)
    
    products = {
        'P01-旗舰吸奶器': {'max_capacity': 3000, 'takt_min': 12, 'changeover_h': 2.0},
        'P02-标准吸奶器': {'max_capacity': 4000, 'takt_min': 8, 'changeover_h': 1.5},
        'P03-便携吸奶器': {'max_capacity': 2500, 'takt_min': 10, 'changeover_h': 2.5},
        'P04-配件套装': {'max_capacity': 8000, 'takt_min': 4, 'changeover_h': 0.5},
    }
    
    records = []
    for m in range(1, n_months + 1):
        is_peak = m >= 4  # 模拟旺季
        for prod, info in products.items():
            max_cap = info['max_capacity']
            # 需求量（旺季更高）
            demand = max_cap * np.random.uniform(0.65, 0.85) * (1.3 if is_peak else 1.0)
            demand = min(demand, max_cap * 1.1)  # 最多超产10%
            
            # 实际生产（受各种因素影响）
            actual = demand * np.random.uniform(0.88, 1.02)
            actual = min(actual, max_cap)
            
            # 换线次数
            changeovers = np.random.randint(3, 8)
            changeover_hours = changeovers * info['changeover_h']
            working_hours = 22 * 8  # 月工作时间（22天×8小时）
            effective_hours = working_hours - changeover_hours
            utilization = actual / max_cap * 100
            schedule_achieved = np.random.random() < 0.88  # 88%达成率
            
            records.append({
                'month': m,
                'product': prod,
                'planned_qty': round(demand),
                'actual_qty': round(actual),
                'max_capacity': max_cap,
                'capacity_utilization': round(utilization, 1),
                'schedule_achieved': schedule_achieved,
                'changeover_count': changeovers,
                'changeover_hours': changeover_hours,
                'effective_hours': effective_hours,
                'changeover_loss_pct': round(changeover_hours / working_hours * 100, 1),
                'is_peak': is_peak,
            })
    
    return pd.DataFrame(records)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2306.11284，但该号在 arXiv 上是《In-plane anisotropy of the single-$q$ and multiple-$q$ ordered phases in the antiferromagnetic metal CeRh$_2$Si$_2$ unveiled by the bulk measurements under uniaxial stress and neutron scattering》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：工厂按型号的月产能、当前订单占用情况、换线时间矩阵与计划交期，以及各型号的月需求量。

**输出**：分月产能利用率预测、排程达成率与换线次数改善结果、瓶颈与断货风险月份清单，以及排产顺序优化建议。

## 执行步骤

1. 汇总工厂月产能与当前订单占用
2. 预测各月产能利用率并识别过载月份
3. 计算换线时间损失并优化排产顺序
4. 输出瓶颈清单与备用产能锁定建议
5. 跟踪排程达成率与有效产能变化

## 边界与不做

- 缺少工厂产能与订单占用数据时无法测算，不用本卡
- 本卡产出产能测算与排产建议，不负责与工厂签约或下生产订单
- 需符合跨境电商商品质量管理规范与平台库存政策，婴配粉等类目需满足对应食品安全标准

## 技能关联

- **前置**：Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Flexible-Supply-Chain-Small-Batch-Agile.html、Skill-Flexible-Supply-Chain-Small-Batch-Agile、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **延伸**：Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Flexible-Supply-Chain-Small-Batch-Agile.html、Skill-Flexible-Supply-Chain-Small-Batch-Agile、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **可组合**：Skill-Flexible-Supply-Chain-Small-Batch-Agile.html、Skill-Flexible-Supply-Chain-Small-Batch-Agile、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Capacity-Constraint-Production-Schedule-KPI

---

> 分类：业务运营/供应与履约/产能调查　·　技术族：04-供应链　·　源卡：`Skill-Capacity-Constraint-Production-Schedule-KPI`