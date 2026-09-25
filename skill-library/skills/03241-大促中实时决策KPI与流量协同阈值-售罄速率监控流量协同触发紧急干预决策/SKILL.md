---
name: "p2s-inpromo-realtime-decision-kpi"
title: "大促中实时决策KPI与流量协同阈值 — 售罄速率监控/流量协同触发/紧急干预决策"
description: "触发词：大促实时决策、售罄速率、流量协同、预算迁移、减流阈值、紧急干预。何时不用：活动前的折扣与库存规划用「闪购定价优化」；活动后的效果归因用「促销效果因果评估」。安全边界：本技能承载的是阈值规则与判据，不是执行器；预算迁移与出价调整由模型外的确定性控制层或人工执行，并须遵守平台出价与预算规则。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 预算分配"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-InPromo-Realtime-Decision-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促中盯住售罄速率：快卖完了就降流量保住利润，卖不动就把预算挪到还卖得动的货上。"
user_try: "试试：A2 奶粉大促第 2 小时已卖 171.7 件/小时、库存 1020 件，帮我判断要不要触发减流并给预算迁移方案。"
whenToUse: "当大促进行中、需要按滚动销售速率触发减流、加流与预算迁移决策时用本技能；活动前的折扣与备货规划用「闪购定价优化」；活动后判断真实增量用「促销效果因果评估」。"
workflow: "采集各 SKU 的大促小时销量、库存、广告花费与当前出价 → 用滚动窗口计算销售速率并重估预计售罄时刻 → 按阈值判断减流、加流或维持，例如预计售罄早于结束前 2 小时即触发减流 → 给出降出价与预算迁移方案及预期流量变化 → 跟踪售罄率、成交额与广告投入产出比的后续变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 大促中实时决策KPI与流量协同阈值 — 售罄速率监控/流量协同触发/紧急干预决策

## ① 解决的问题

大促中供应链和广告是两个独立系统没有联动导致爆款提前售罄时广告仍在浪费——售罄速率监控+流量协同阈值（减流量/加流量/迁移预算），书中供应链-流量协同大促GMV提升约12%

## ② 核心算法逻辑

核心思想：大促期间库存消耗速率与广告流量投入形成闭环反馈——当SKU预计提前售罄时自动降低广告出价释放预算，当销售低于预期时自动提价激活流量，通过实时阈值触发实现供应链与营销的动态协同。

## ③ 业务应用场景

业务问题： - 某品牌A2奶粉（跨境热销品）在Prime Day前备货1200件 - 大促第1小时销售速率异常高（180件/小时），按此速率6.7小时后售罄 - 但广告团队仍按计划投放$3000预算，每小时烧$125广告费 - 结果：第7小时售罄，最后1小时无库存但广告仍在投放，浪费$125；同时大量用户加购但无货，转化为竞品购买
具体数字与决策： 1. 第2小时检测：滚动速率=(180+160+175)/3=171.7件/小时，剩余库存1020件，预计售罄时刻=第6.9小时 2. 触发减流阈值：预计售罄时刻(6.9h) < 大促结束(48h) - 2h，触发"减流"信号 3. 流量协同执行： - 降低A2奶粉SP广告出价30%（$1.2→$0.84），预期流量下降25% - 将释放的$750预算转移到"奶粉+配件套装"（奶瓶消毒器、奶粉盒），该套装库存充足 - 同时申请平台"限时秒杀"降低出价压力
4. 实际结果： - A2奶粉销售速率降至140件/小时，预计售罄时刻延后至第8.5小时 - 配件套装销售额增长$2800（来自转移的流量+关联购买） - A2奶粉最终售罄率98%（原预期100%但有1小时无货） - 总GMV提升：$1200×$28(奶粉均价) + $2800 = $36400 vs 原预期$33600，提升8.3% - 广告效率提升：广告花费$2850（原$3000），ROI从11.2提升至12.8

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

45万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（316 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/inpromo_realtime_decision_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-InPromo-Realtime-Decision-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
大促中实时决策KPI与流量协同阈值
基于《全链路管理》陈凤霞 第六章第二节 + KDD 2021 论文
售罄速率监控 + 流量协同触发 + 紧急干援决策
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUPromoStatus:
    """大促SKU实时状态"""
    sku_id: str
    sku_name: str
    initial_stock: int
    hourly_sales: List[int] = field(default_factory=list)
    hourly_forecast: List[int] = field(default_factory=list)
    hourly_ad_spend: List[float] = field(default_factory=list)
    current_ad_bid: float = 1.0
    promo_total_hours: int = 48
    category: str = "母婴用品"


class InPromoRealTimeDecision:
    """大促实时决策引擎"""
    
    def __init__(
        self,
        rolling_window: int = 3,
        forecast_accuracy_threshold: float = 0.20,
        sellout_warning_hours: int = 2,
        reduce_flow_threshold: float = 0.20,
        increase_flow_threshold: float = 0.20
    ):
        """
        初始化参数
        rolling_window: 滚动窗口小时数
        forecast_accuracy_threshold: 预测准确率阈值（20%偏差触发重新预测）
        sellout_warning_hours: 提前售罄预警小时数
        reduce_flow_threshold: 减流触发阈值（销售速率超预测20%）
        increase_flow_threshold: 加流触发阈值（销售速率低于预测20%）
        """
        self.rolling_window = rolling_window
        self.forecast_accuracy_threshold = forecast_accuracy_threshold
        self.sellout_warning_hours = sellout_warning_hours
        self.reduce_flow_threshold = reduce_flow_threshold
        self.increase_flow_threshold = increase_flow_threshold
    
    def compute_rolling_rate(self, hourly_sales: List[int]) -> float:
        """计算滚动销售速率（件/小时）"""
        if len(hourly_sales) < self.rolling_window:
            return np.mean(hourly_sales) if hourly_sales else 0
        recent_sales = hourly_sales[-self.rolling_window:]
        return np.mean(recent_sales)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04567，但该号在 arXiv 上是《Non-Hermitian skin effect of dislocations and its topological origin》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：大促期间 SKU 级小时数据：销量、库存、广告花费与当前出价、活动总时长与预测曲线；粒度为 SKU × 小时。

**输出**：滚动销售速率与预计售罄时刻、减流/加流/紧急干预判决，以及降出价幅度与预算迁移去向的建议；供大促运营实时执行。

## 执行步骤

1. 采集 SKU 级小时销量、库存与广告花费
2. 用滚动窗口计算销售速率并重估售罄时刻
3. 按阈值判断减流、加流或维持
4. 给出降出价与预算迁移方案
5. 跟踪售罄率、成交额与广告效率变化

## 边界与不做

- 数据不满足：拿不到小时级销量与库存时速率不可算，阈值决策无从触发。
- 何时不用：活动前的折扣与备货规划用「闪购定价优化」；活动后归因用「促销效果因果评估」。
- 能力边界：本技能承载的是阈值规则与判据，不是执行器；降出价、迁预算等动作由模型外的确定性控制层或人工执行。
- 安全边界：出价与预算调整须遵守平台规则，不得以压低出价等方式操纵曝光或误导消费者。

## 技能关联

- **前置**：Skill-Promo-Demand-Forecast-Accuracy
- **延伸**：Skill-Cross-Border-FBA-Stockout-Rate-Optimization
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-Ad-Bidding-Strategy、Skill-InPromo-Realtime-Decision-KPI.html、Skill-InPromo-Realtime-Decision-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：04-供应链　·　源卡：`Skill-InPromo-Realtime-Decision-KPI`