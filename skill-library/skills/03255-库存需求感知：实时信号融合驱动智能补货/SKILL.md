---
name: "p2s-inventory-demand-sensing"
title: "Inventory Demand Sensing — 库存需求感知：实时信号融合驱动智能补货"
description: "触发词：需求感知、多信号融合、搜索趋势、广告 CTR、提前补货。何时不用：只有销量单信号、无外部领先信号时用「卡尔曼滤波需求状态追踪」；要做大促与基线拆分时用「大促需求分解」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Inventory-Demand-Sensing"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把搜索趋势、广告点击这些领先信号融进需求判断，比等销量涨起来再补货早 7-14 天动手。"
user_try: "试试：把 Google Trends 和广告 CTR 接进需求感知评分，告诉我今年旺季该提前几天补货、备多少。"
whenToUse: "前置期长、销量信号滞后，需要用搜索趋势或广告 CTR 等领先信号提前触发补货时用；只有销量单信号时用卡尔曼滤波需求状态追踪；要拆大促脉冲时用大促需求分解。"
workflow: "接入 Google Trends 关键词周搜索量、广告 CTR、推荐曝光与两年销量历史 → 用 Kalman 融合多路噪声不同的信号，输出每日需求感知综合评分 → 识别旺季起点并给出提前量与备货量建议 → 广告预算与库存状态联动，缺货时不投广告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Inventory Demand Sensing — 库存需求感知：实时信号融合驱动智能补货

## ① 解决的问题

吸奶器旺季等到销量上升才补货Lead Time 45天导致旺季缺货两周——搜索趋势+广告CTR多信号感知比纯销量触发提前7-14天补货，旺季缺货减少40-60%年化GMV保护25-65万元

## ② 核心算法逻辑

需求感知 = 融合多源实时信号：

## ③ 业务应用场景

业务问题：每年 2 月（产后恢复高峰）吸奶器销量会上升，但等到销量上升才补货，Lead Time 45 天，旺季前 2 周开始缺货。若依赖搜索趋势信号，1 月初就能看到搜索量上升，提前 3-4 周触发补货。
数据要求： - Google Trends / Helium10 关键词搜索量（周粒度） - Amazon 广告 CTR 历史（来自广告报告） - 推荐系统曝光量（Amazon Attribution 报告） - 过去 2 年销量历史
预期产出： - 需求感知综合评分（每日更新） - 旺季开始时间预测（比历史规律更精准） - 触发补货建议：提前 X 天下单，备货 Y 件

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
比纯销量提前 7-14 天触发补货：旺季缺货减少 40-60%，保护 ¥15-40 万 GMV
广告预算与库存状态联动：不在无货时投广告（节省无效广告费 ¥5-15 万/年）
需求下降时提前降库存：减少呆滞库存持有成本 ¥5-10 万/年
年化综合 ROI：¥25-65 万
实施难度：⭐⭐⭐☆☆（需要多数据源接入；搜索趋势 API + Amazon 报告 + Kalman 融合约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（173 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/logistics/inventory_demand_sensing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Inventory-Demand-Sensing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Inventory Demand Sensing
多信号融合需求感知 + 智能补货触发
"""
import numpy as np
from collections import deque


class KalmanSignalFilter:
    """Kalman 滤波器：融合多个噪声不同的信号"""

    def __init__(self, process_noise: float = 1.0, measurement_noise: float = 5.0):
        self.Q = process_noise       # 过程噪声（真实需求的随机性）
        self.R = measurement_noise   # 测量噪声（信号观测误差）
        self.x = 0.0                 # 状态估计（真实需求）
        self.P = 10.0                # 估计不确定性

    def update(self, measurement: float) -> float:
        """接入新观测值，更新状态估计"""
        # 预测步骤
        self.P += self.Q
        # 更新步骤
        K = self.P / (self.P + self.R)  # Kalman 增益
        self.x += K * (measurement - self.x)
        self.P *= (1 - K)
        return self.x


class DemandSensingModel:
    """多信号融合需求感知模型"""

    def __init__(self, lead_days: int = 14, window: int = 30):
        self.lead_days = lead_days
        self.window = window
        # 各信号的权重（通过历史数据学习，这里用启发式）
        self.weights = {
            'search_trend': 0.35,    # 搜索趋势（最强领先信号）
            'ads_ctr':      0.25,    # 广告 CTR（用户购买意愿）
            'reco_exposure':0.20,    # 推荐曝光（平台热度信号）
            'historical':   0.20,    # 历史销量（基础稳定性）
        }
        self.kalman = KalmanSignalFilter()
        self.history = deque(maxlen=window)
        self.baseline = None

    def normalize_signal(self, values: list, name: str) -> np.ndarray:
        """信号标准化（z-score）"""
        arr = np.array(values, dtype=float)
        mean, std = np.mean(arr), np.std(arr)
        if std < 1e-8:
            return np.zeros_like(arr)
        return (arr - mean) / std

    def compute_sensing_score(self, signals: dict) -> np.ndarray:
        """计算每日需求感知综合评分"""
        n = min(len(v) for v in signals.values())
        result = np.zeros(n)

        for name, weight in self.weights.items():
            if name in signals and name != 'historical':
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.14271，但该号在 arXiv 上是《Resonances in nonlinear systems with a decaying chirped-frequency excitation and noise》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：关键词周搜索量、Amazon 广告 CTR 历史、推荐曝光报告、过去 2 年销量历史；粒度：SKU×周（评分按日更新）。

**输出**：需求感知综合评分（每日更新）、旺季开始时间预测与触发补货建议（提前 X 天下单、备货 Y 件），供补货决策与广告预算联动使用。

## 执行步骤

1. 汇总搜索趋势、广告 CTR 与曝光等多路实时信号
2. 用 Kalman 滤波融合为日度需求感知评分
3. 识别旺季起点并计算提前补货天数
4. 按评分触发补货建议并同步调整广告投放

## 边界与不做

- 数据不满足时不用：拿不到搜索趋势或广告报告等领先信号时，感知评分退化成销量平滑，无提前量。
- 能力边界：产出的是信号评分与补货建议，不是执行器；下单与预算开关仍由人或控制层执行。
- 能力边界：卡页 ROI（缺货减少 40-60%、年化 25-65 万元）为该卡案例估算，不外推到其他品类。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **延伸**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **可组合**：Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting、Skill-Inventory-Demand-Sensing

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：18-物流履约　·　源卡：`Skill-Inventory-Demand-Sensing`