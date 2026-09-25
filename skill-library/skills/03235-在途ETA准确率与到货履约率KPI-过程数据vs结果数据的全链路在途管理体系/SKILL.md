---
name: "p2s-inbound-eta-accuracy-kpi"
title: "在途ETA准确率与到货履约率KPI — 过程数据vs结果数据的全链路在途管理体系"
description: "触发词：ETA准确率、在途KPI、到货履约率、安全库存联动、缺货归因。何时不用：需要按批次追踪在途状态并做可视化看板时用在途库存追踪与全链路可视化；需要做港口拥堵多因子到港时间估计时用港口拥堵ETA预测。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-058"
l3_business: "到货异常追踪"
l3_all: "到货异常追踪 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/到货异常追踪"
p2s_card_id: "Skill-Inbound-ETA-Accuracy-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 ETA 准确率和到货履约率变成可考核的过程指标，并据此调整安全库存和预警动作。"
user_try: "试试：用我的货代 ETA 更新记录算这条航线的 ETA 准确率和 P80 延误天数，并给出安全库存缓冲建议。"
whenToUse: "需要量化在途过程指标（ETA 准确率、异常率）与结果指标（到货履约率）并与安全库存联动时用本技能；逐批次追踪与可视化用在途库存追踪与全链路可视化。"
workflow: "整理 ETA 更新记录与实际到港数据 → 计算 ETA 准确率与航线延误分位数 → 按延误缓冲调整安全库存口径 → ETA 变化触发缺货风险预警与补货评估"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 在途ETA准确率与到货履约率KPI — 过程数据vs结果数据的全链路在途管理体系

## ① 解决的问题

在途数据有但从不用形成数据孤岛——区分在途过程数据（ETA准确率/异常率）vs结果数据（到货率），量化书中四大落地障碍，缺货归因中在途延误占比是在途管理价值的终极量化

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：书中第五章专节揭示了在途库存管理最容易被忽视的区分：过程数据（异常跟进）vs 结果数据（履约达成）。书中还系统分析了在途数据"无法落地"的四大根因——这是多数卖家的痛点所在。

## ③ 业务应用场景

场景A：ETA准确率与安全库存动态调整联动
- 业务问题：某卖家每次海运延误都是"突然"发现的，当ETA变化通知到运营团队时库存已经告急 - 过程KPI应用： 1. 建立ETA准确率基线：某航线历史P80延迟=6天（80%批次延误≤6天） 2. 安全库存=提前期内日均销售×延误天数缓冲（按P80设定，论文推荐方法） 3. 当ETA变化触发"延误预警"（>3天），自动计算影响的SKU缺货风险 4. 缺货风险SKU→触发空运补货评估（空运成本 vs 缺货损失） - 预期产出：提前3-5天预警，应急处理时间足够，断货率从12%降至3%
- 业务问题：团队有在途数据但从不用（典型的"数据富，洞察穷"） - 落地路径：障碍1→统一货代数据格式标准；障碍2→要求货代ETA变化6小时内推送；障碍3→建立"ETA变化N天→启动X动作"规则手册；障碍4→将在途KPI纳入运营团队周会必检项

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：在途延误导致的缺货占总缺货的40-60%，提前3-5天预警使应急处理成本降低50%；以月缺货损失$5万计算，减少40%≈$2万/月；系统$2万，ROI>1000%
实施难度：⭐⭐⭐☆☆（需要货代API或人工录入ETA更新数据；四大障碍中数据障碍最难克服）
优先级：⭐⭐⭐⭐⭐（书中专节讲解，且明确量化了"缺货归因率"这个被低估的指标）
适用规模：月均在途批次>5个的卖家，批次越多价值越高
数据依赖：货代提供的ETA更新记录、实际到港时间、SKU与批次的对应关系

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（263 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/inbound_eta_accuracy_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Inbound-ETA-Accuracy-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
在途ETA准确率与到货履约率KPI体系
基于《全链路管理》陈凤霞 第五章第五节
论文参考：Transit ETA Prediction with Uncertainty Quantification (KDD 2021)
过程数据(异常跟进) vs 结果数据(履约达成)
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


@dataclass
class TransitBatchRecord:
    """在途批次记录"""
    batch_id: str
    sku_id: str
    route: str                      # 如 '上海→洛杉矶'
    planned_units: int
    actual_units: int
    planned_eta: datetime           # 计划到货日
    actual_arrival: Optional[datetime]  # 实际到货日（None=未到）
    transit_days_planned: int       # 计划在途天数
    eta_updates: List[datetime] = field(default_factory=list)  # ETA历史更新记录
    delay_cause: Optional[str] = None  # 延误原因


class InboundETAKPIAnalyzer:
    """在途ETA准确率与到货KPI分析器"""

    @staticmethod
    def compute_eta_accuracy(batch: TransitBatchRecord) -> Optional[float]:
        """计算单批次ETA准确率"""
        if batch.actual_arrival is None:
            return None
        delay_days = (batch.actual_arrival - batch.planned_eta).days
        accuracy = 1 - abs(delay_days) / max(batch.transit_days_planned, 1)
        return max(accuracy, 0.0)

    @staticmethod
    def delay_days(batch: TransitBatchRecord) -> Optional[int]:
        """计算延迟天数（正=延迟，负=提前）"""
        if batch.actual_arrival is None:
            return None
        return (batch.actual_arrival - batch.planned_eta).days

    def route_analytics(self, batches: List[TransitBatchRecord]) -> pd.DataFrame:
        """按航线分析ETA准确率分布（论文P80/P95分位数方法）"""
        route_data = {}
        for b in batches:
            if b.actual_arrival is None:
                continue
            dd = self.delay_days(b)
            ea = self.compute_eta_accuracy(b)
            if b.route not in route_data:
                route_data[b.route] = {'delays': [], 'accuracies': [], 'units': []}
            route_data[b.route]['delays'].append(dd)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04576，但该号在 arXiv 上是《Chiral magnetic properties of QCD phase-diagram》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：货代提供的 ETA 更新记录、实际到港时间、SKU 与批次对应关系、日均销售与提前期数据。

**输出**：ETA 准确率与到货履约率等过程与结果 KPI、航线延误分位分析、安全库存调整与缺货风险清单，供运营与采购团队使用。

## 执行步骤

1. 整理 ETA 更新记录与实际到港数据
2. 计算 ETA 准确率与航线延误分位数
3. 按延误缓冲调整安全库存口径
4. ETA 变化触发缺货风险预警与补货评估

## 边界与不做

- 何时不用：需要逐批次在途看板与异常响应时用在途库存追踪与全链路可视化；需要港口拥堵驱动的到港预测时用港口拥堵ETA预测。
- 能力边界：输出 KPI 与预警规则，不负责向货代催更数据，也不自动下单补货。
- 数据边界：货代未按标准格式或未及时推送 ETA 变化时 KPI 会失真，需先统一数据格式与推送时效要求。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Fill-Rate-OOS-Cost-Quantification.html、Skill-Fill-Rate-OOS-Cost-Quantification、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Fill-Rate-OOS-Cost-Quantification.html、Skill-Fill-Rate-OOS-Cost-Quantification、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Fill-Rate-OOS-Cost-Quantification.html、Skill-Fill-Rate-OOS-Cost-Quantification、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Inbound-ETA-Accuracy-KPI

---

> 分类：业务运营/供应与履约/到货异常追踪　·　技术族：04-供应链　·　源卡：`Skill-Inbound-ETA-Accuracy-KPI`