---
name: "p2s-competitor-new-product-detection"
title: "Competitor New Product Detection — 竞品新品预测：提前发现竞品动向的信号挖掘"
description: "触发词：竞品新品预警、信号融合、专利信号、CPC 异动、提前备货。何时不用：要看竞品已上线的新 SKU 与跟进方向用「Competitor Product Intelligence」；要 7×24 监控价格与 Listing 变动用「多 Agent 竞品情报系统」。安全边界：专利与社媒信号须经合规接口获取，不得抓取非公开数据；预警是概率信号，不得据此对竞品做公开指控。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-020"
l3_business: "竞品研究"
l3_all: "竞品研究 / 趋势监测"
l1_l2_l3: "业务运营/产品与创新/竞品研究"
p2s_card_id: "Skill-Competitor-New-Product-Detection"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "把专利申请、关键词出价异动、社媒提及和竞品清仓这些前置信号融合成上市概率评分，比竞品真正上架提前几周发出预警。"
user_try: "试试：按这套信号权重算 Momcozy 的新品上市概率评分，告诉我现在要不要提前备货。"
whenToUse: "要在竞品新品真正上架前拿到预警、并提前安排备货与广告防御时用本技能；若竞品新 SKU 已经上线、要看它值不值得跟进，用「Competitor Product Intelligence」；若要 7×24 的价格与 Listing 监控，用「多 Agent 竞品情报系统」。"
workflow: "监测竞品 ASIN 的价格、BSR 与评论数变化 → 采集关键词 CPC 历史与专利、社媒等前置信号 → 按信号权重加权聚合成综合预警评分（每周更新） → 评分达阈值时触发预警并给出备货、定价与广告防御建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Competitor New Product Detection — 竞品新品预测：提前发现竞品动向的信号挖掘

## ① 解决的问题

竞品上市后才发现已经晚了2-4周——多源信号（专利/关键词竞价/社交媒体）综合预警比竞品上市提前4-8周发出预警，提前准备备货和广告防御策略年化保护GMV 15-40万元

## ② 核心算法逻辑

竞品新品上架的前置信号：

## ③ 业务应用场景

业务问题：Momcozy 是主要竞品，每次他们推新品都会对我们的 BSR 造成冲击。如果能提前 4-6 周知道他们要推什么，可以提前调整备货/定价/营销策略。
数据要求： - 竞品 Amazon ASIN 监测（价格/BSR/评论数变化） - 关键词 CPC 历史数据（Helium10 或 AMZ 广告报告） - 可选：专利数据库 API（USPTO）
预期产出： - 竞品新品上市概率评分（每周更新） - 预警触发条件：哪个信号达到阈值 - 建议响应：提前备货/调整定价/加大广告防御

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
提前 4-6 周发现竞品动向：充分准备而非被动响应
避免竞品上市后 BSR 骤降（提前备货/内容强化）：保护 ¥10-30 万 GMV
提前调整定价和广告策略：比竞品上市后被迫反应 ROI 高 2-3x
年化综合 ROI：¥15-40 万
实施难度：⭐⭐⭐☆☆（规则信号版 2 周可实现；专利数据库接入需要 API 权限；社交媒体监测约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（150 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/growth_model/competitor_new_product_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Competitor-New-Product-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Competitor New Product Detection
竞品新品早期预警：多源信号挖掘与融合评分
"""
import numpy as np
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class CompetitorSignal:
    """单个竞品信号"""
    signal_type: str
    competitor: str
    value: float      # 信号强度（0-1）
    timestamp: str
    description: str


class CompetitorMonitor:
    """竞品新品预警监控器"""

    # 信号权重（基于历史预测准确性）
    SIGNAL_WEIGHTS = {
        'patent_filing': 0.35,       # 专利申请（领先指标）
        'keyword_cpc_spike': 0.25,   # 关键词出价异动
        'social_mention_surge': 0.20, # 社交媒体提及增加
        'inventory_clearance': 0.15, # 竞品库存清仓
        'new_asin_detected': 0.05,   # 新 ASIN 出现（同步指标）
    }

    def __init__(self):
        self.competitors = {}
        self.signal_history = defaultdict(list)

    def add_signal(self, signal: CompetitorSignal):
        self.signal_history[signal.competitor].append(signal)

    def compute_alert_score(self, competitor: str) -> dict:
        """计算综合预警评分"""
        signals = self.signal_history.get(competitor, [])
        if not signals:
            return {'score': 0.0, 'signals': [], 'alert_level': 'None'}

        # 按信号类型聚合（取最高值）
        signal_max = defaultdict(float)
        for s in signals:
            signal_max[s.signal_type] = max(signal_max[s.signal_type], s.value)

        # 加权评分
        total_score = sum(
            self.SIGNAL_WEIGHTS.get(stype, 0) * val
            for stype, val in signal_max.items()
        )

        triggered = [stype for stype, val in signal_max.items() if val > 0.6]
        alert_level = ('HIGH' if total_score > 0.6 else
                       'MEDIUM' if total_score > 0.35 else
                       'LOW' if total_score > 0.1 else 'None')
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.16892，但该号在 arXiv 上是《Exploring Fusion Techniques in Multimodal AI-Based Recruitment: Insights from FairCVdb》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：竞品 Amazon ASIN 监测数据（价格 / BSR / 评论数变化）、关键词 CPC 历史（Helium10 或 AMZ 广告报告），可选接入 USPTO 等专利数据库 API。

**输出**：竞品新品上市概率评分（每周更新）、预警触发条件与命中的信号明细，以及提前备货、调整定价、加大广告防御的响应建议。

## 执行步骤

1. 监测竞品 ASIN 的价格、BSR 与评论数变化
2. 采集关键词 CPC 异动、专利与社媒等前置信号
3. 按信号权重聚合综合预警评分
4. 评分达阈值时触发预警
5. 输出备货、定价与广告防御建议

## 边界与不做

- 缺少任一关键信号源（如专利或 CPC 数据）时信号权重失衡，只能做弱预警
- 输出是概率信号，不构成竞品动向的事实判断，不得据此做公开指控
- 专利与社交媒体数据须经合规接口获取，不得违反平台条款抓取非公开数据

## 技能关联

- **前置**：Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-Market-Signal-Realtime-Collection.html、Skill-Market-Signal-Realtime-Collection、Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding、Skill-Web-Page-Change-Detection.html、Skill-Web-Page-Change-Detection
- **延伸**：Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding
- **可组合**：Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding、Skill-Competitor-New-Product-Detection

---

> 分类：业务运营/产品与创新/竞品研究　·　技术族：06-增长模型　·　源卡：`Skill-Competitor-New-Product-Detection`