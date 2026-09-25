---
name: "p2s-mas-competitive-intelligence-agent"
title: "多 Agent 竞品情报系统 — 7×24 小时全天候竞品监控与预警"
description: "触发词：竞品监控、多 Agent、异常预警、库存异动、Listing 变动。何时不用：要预判竞品尚未上线的新品用「Competitor New Product Detection」；要从竞品评论算选品机会分用「跨竞品评论选品机会评分」。安全边界：库存与价格须走官方 SP-API，爬取非公开接口违反平台条款；预警可能被竞品反向利用，须人工复核后再动作。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-020"
l3_business: "竞品研究"
l3_all: "竞品研究 / 趋势监测"
l1_l2_l3: "业务运营/产品与创新/竞品研究"
p2s_card_id: "Skill-MAS-Competitive-Intelligence-Agent"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "用价格、评论、关键词、Listing 四个监控 Agent 全天候盯住竞品，把过去三天才发现的变化压到十几分钟并分级预警。"
user_try: "试试：给这 8 个主要竞品 ASIN 部署四维监控，重点看大促前 48 小时的库存与调价异动。"
whenToUse: "竞品数量多、人工巡检跟不上、需要自动分级预警时用本技能；若要预判竞品还没上架的新品，用「Competitor New Product Detection」；若要从竞品评论里挖选品机会，用「跨竞品评论选品机会评分」。"
workflow: "维护 5-10 个主要竞品 ASIN 列表 → 部署价格、评论、关键词、Listing 四个监控 Agent → 用 Z-score 异常检测判定变动是否达阈值 → 按信息 / 警告 / 紧急分级推送预警 → 按预警执行调价、Listing 优化或广告应对"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多 Agent 竞品情报系统 — 7×24 小时全天候竞品监控与预警

## ① 解决的问题

运营主管面临"竞品价格和Listing变化只能靠人工定期检查发现总是滞后"——四Agent协作7×24竞品监控将竞品变化发现时间从3天压缩至15分钟，年化避损$8万

## ② 核心算法逻辑

解决「每天早上花 12 小时手工刷竞品价格/Review/关键词，还是会漏掉竞品的关键变化，被竞品的促销策略打得措手不及」的业务问题。

## ③ 业务应用场景

场景A：竞品大促前 48 小时预警 - 业务问题：竞品 Prime Day 前 48 小时开始囤货/调价，等你发现已经输了先机 - 数据要求：5-10 个主要竞品 ASIN 列表 - 部署方案：价格监控 Agent 发现竞品库存在 48 小时内快速减少（售罄 = 大促预备），触发预警 - 预期产出：提前 48h 知道竞品动向，Prime Day 广告预算提前到位，GMV 比上年同期 +$28,000
三轨验证： - 成本：显性成本约 $200/月（SP-API 调用费 + 云服务器），若使用第三方数据服务商则 $500-1000/月 - 合规：使用 Amazon SP-API 官方库存数据合规；若通过爬虫抓取库存状态（非公开 API）则违反 Amazon 服务条款，可能封号 - 风险：高——提前 48h 预警可能引发你跟价/抢量，竞品察觉后可能反向操作（虚假库存下降诱你入局），导致广告费浪费
场景B：发现竞品弱点，抢占 Review 差距 - 业务问题：不知道竞品的真实缺陷，无法针对性地优化自己的产品卖点 - 数据要求：竞品 ASIN Review 数据（新增 3 星以下 Review） - 部署方案：Review 分析 Agent 提取竞品一星/二星 Review 的高频痛点词，转化为己方 Listing 的强调卖点 - 预期产出：针对竞品痛点优化 Listing 后，转化率从 14% → 19%，年化增收 $34,000

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境 50+ ASIN 卖家（GMV $500 万/年）：
反应速度：竞品大促响应从 6-12h → 2h，Prime Day 额外 GMV $28,000
Review 洞察：针对竞品痛点优化 Listing，转化率 +5%，年化增收 $34,000
省人力：竞品监控从 1.5h/天 → 0.1h/天，年化节省 $18,000 人力
合计年化价值：约 $80,000
实施难度：⭐⭐⭐⭐☆（爬虫部分需要合规处理，使用官方 API 或合规数据服务）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（279 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/mas/mas_competitive_intelligence_agent` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-MAS-Competitive-Intelligence-Agent.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多 Agent 竞品情报系统
价格/Review/关键词/Listing 四维监控 + 情报汇聚
"""
import math
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta


class AlertLevel(Enum):
    INFO = 1        # 信息（一般变化）
    WARNING = 2     # 警告（值得关注）
    CRITICAL = 3    # 紧急（需要立即应对）


@dataclass
class CompetitorSignal:
    """竞品监控信号"""
    signal_id: str
    asin: str
    agent_type: str     # price/review/keyword/listing
    timestamp: str
    alert_level: AlertLevel
    description: str
    data: Dict
    action_suggestion: str


class ZScoreAnomalyDetector:
    """Z-score 异常检测（防止误报）"""
    
    def __init__(self, threshold: float = 2.5):
        self.threshold = threshold
        self.history: Dict[str, List[float]] = {}
    
    def update(self, series_id: str, value: float) -> Tuple[bool, float]:
        """
        Returns: (is_anomaly, z_score)
        """
        if series_id not in self.history:
            self.history[series_id] = []
        
        self.history[series_id].append(value)
        
        if len(self.history[series_id]) < 5:
            return False, 0.0
        
        data = self.history[series_id][-20:]  # 最近 20 个数据点
        mean = sum(data) / len(data)
        std = math.sqrt(sum((x - mean) ** 2 for x in data) / len(data))
        
        if std < 0.001:
            return False, 0.0
        
        z = abs(value - mean) / std
        return z > self.threshold, round(z, 2)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.18291，但该号在 arXiv 上是《Panoptic Segmentation and Labelling of Lumbar Spine Vertebrae using Modified Attention Unet》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：5-10 个主要竞品 ASIN 列表；按维度分别需要价格与库存数据（走官方 SP-API）、竞品 Review 数据（尤其新增 3 星以下评论）、关键词数据与 Listing 文本。

**输出**：分级预警信号（信息 / 警告 / 紧急）与建议动作：竞品大促前 48 小时的库存与调价动向、竞品一二星高频痛点词及可转化为己方 Listing 的卖点。

## 执行步骤

1. 维护主要竞品 ASIN 监控列表
2. 部署价格、评论、关键词与 Listing 四个监控 Agent
3. 用 Z-score 检测变动是否异常
4. 按分级阈值推送预警
5. 按预警执行调价、Listing 优化或广告应对

## 边界与不做

- 使用爬虫抓取非公开库存或价格接口会违反平台服务条款，只允许官方 API 或合规数据服务
- 预警可能被竞品反向利用（如制造库存下降假象），触发后须人工复核再动作
- 系统负责发现与建议，不自动执行调价等对外动作

## 技能关联

- **前置**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-MAS-Customer-Journey-Orchestration.html、Skill-MAS-Customer-Journey-Orchestration、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-MAS-Customer-Journey-Orchestration.html、Skill-MAS-Customer-Journey-Orchestration、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation
- **可组合**：Skill-MAS-Customer-Journey-Orchestration.html、Skill-MAS-Customer-Journey-Orchestration、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-MAS-Competitive-Intelligence-Agent

---

> 分类：业务运营/产品与创新/竞品研究　·　技术族：10-MAS　·　源卡：`Skill-MAS-Competitive-Intelligence-Agent`