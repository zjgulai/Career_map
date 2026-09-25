---
name: "p2s-purchase-intent-prediction"
title: "Purchase Intent Prediction — 买家购买意图预测：从行为序列到转化概率"
description: "触发词：购买意图预测、行为序列、弃购分层、触达阈值、退订率。何时不用：要按弃购用户类型选内容用「弃购挽回机器学习」；要按加购后固定时点跑序列用「加购未购自动挽回触发」。安全边界：触达须在用户同意范围内并提供退订入口，低意图用户不触达；意图分是概率估计，不得据此对用户做差别定价或歧视性对待。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 分群"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Purchase-Intent-Prediction"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "几百个弃购用户别发同一封邮件：先算谁还在考虑购买，高意图的当天追，低意图的别打扰。"
user_try: "试试：给这批弃购用户各算一个 0-1 购买意图分，把大于 0.7 的挑出来做 24 小时内触达。"
whenToUse: "当需要把用户按还在决策窗口内的概率分档、决定触达强度与时机时用本技能；要按用户类型选内容用「弃购挽回机器学习」；只要固定延时序列用「加购未购自动挽回触发」。"
workflow: "整理用户行为序列：浏览、加购、结账、购买时间戳 → 结合历史购买与当前会话行为计算意图分 → 按阈值分层：高意图当天触达、中意图限时优惠、低意图不触达 → 记录触达结果与退订率 → 校准阈值并迭代特征"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Purchase Intent Prediction — 买家购买意图预测：从行为序列到转化概率

## ① 解决的问题

独立站每月800个弃购用户全部发同一封挽回邮件点击率仅4%——买家意图预测只对高意图用户（P>0.7）精准触达CVR从4%提升到12-18%，年化GMV增益30-80万元同时降低低意图用户退订率

## ② 核心算法逻辑

购买意图（Purchase Intent）≠ 购买兴趣（Purchase Interest）：

## ③ 业务应用场景

业务问题：独立站每月约 800 个用户加购后未付款，平均客单价 $149。传统做法是给所有弃购用户发同一封挽回邮件，点击率仅 4%。实际上 70% 的弃购用户已经离开决策窗口，只有 30% 还在"考虑购买"阶段。
数据要求： - 用户行为序列（浏览/加购/结账/购买的时间戳） - 用户历史购买记录（频率/客单价/品类偏好） - 当前 session 行为（近 24 小时）
预期产出： - 每个弃购用户的购买意图评分（0-1） - 高意图用户名单（P > 0.7）：24h 内发挽回邮件 - 中意图用户名单（0.4-0.7）：3 天内发限时优惠 - 低意图用户（< 0.4）：不触达（降低退订率）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
弃购挽回精准化（只触达高意图用户）：CVR 从 4% → 12-18%，月增收 ¥8-25 万
DSP 再营销出价优化：ROAS 提升 20-35%，月节省无效广告 ¥3-10 万
减少低意图用户骚扰：退订率降低，长期邮件健康度提升
年化综合 ROI：¥30-80 万
实施难度：⭐⭐⭐☆☆（需要用户行为埋点基础设施；规则加权版 2 周，ML 版本约 4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（192 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/purchase_intent_prediction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Purchase-Intent-Prediction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Purchase Intent Prediction
CATS 框架：聚类聚合 + 时序建模的买家意图预测
"""
import numpy as np
from collections import defaultdict
from dataclasses import dataclass


# 行为权重（意图信号强度）
BEHAVIOR_WEIGHTS = {
    'view_product':    0.05,
    'view_detail':     0.10,
    'search_price':    0.15,
    'compare':         0.20,
    'add_wishlist':    0.25,
    'add_cart':        0.50,
    'start_checkout':  0.80,
    'return_checkout': 0.90,
    'purchase':        1.00,
}


@dataclass
class UserSession:
    user_id: str
    events: list   # [{'action': str, 'timestamp': float, 'price': float}]
    history_purchases: int = 0
    days_since_last_purchase: float = 30.0


def compute_intent_timeseries(events: list, window_days: int = 7) -> np.ndarray:
    """计算用户近期行为的意图时序（每日意图强度）"""
    if not events:
        return np.zeros(window_days)

    now = max(e['timestamp'] for e in events)
    daily_intent = np.zeros(window_days)

    for event in events:
        days_ago = (now - event['timestamp']) / 86400  # 秒转天
        if days_ago < window_days:
            day_idx = min(int(days_ago), window_days - 1)
            weight = BEHAVIOR_WEIGHTS.get(event.get('action', 'view_product'), 0.05)
            daily_intent[window_days - 1 - day_idx] += weight

    # 归一化
    max_val = max(daily_intent.max(), 1e-8)
    return daily_intent / max_val


def cluster_user_style(history_purchases: int, days_since_last: float,
                       avg_session_events: float) -> str:
    """用户购买风格聚类（简化版）"""
    if history_purchases >= 5 and days_since_last < 30:
        return 'loyal_active'      # 忠诚活跃用户：高频购买
    elif history_purchases >= 2 and avg_session_events > 8:
        return 'deliberate'        # 谨慎型：行为多但购买频率适中
    elif history_purchases == 0 and avg_session_events > 5:
        return 'new_high_intent'   # 新用户高意图
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2505.13558 — CATS: Clustering-Aggregated and Time Series for Business Customer Purchase Intention Prediction

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户行为序列（浏览、加购、结账、购买的时间戳）、用户历史购买记录（频率、客单价、品类偏好）、当前会话行为（卡页示例近 24 小时）；粒度为单用户 × 当前会话。

**输出**：每个弃购用户的 0-1 购买意图评分与分层名单（高意图 P>0.7 24 小时内触达、中意图 0.4-0.7 三天内触达、低意图不触达）；供 CRM 与投放按名单执行触达与出价。

## 执行步骤

1. 整理用户行为序列与历史购买记录
2. 结合当前会话行为计算 0-1 购买意图分
3. 按阈值分层输出高、中、低意图名单
4. 对高意图用户 24 小时内触达，中意图给限时优惠
5. 跟踪退订率与 CVR，校准阈值和特征

## 边界与不做

- 数据不满足：没有行为埋点、拿不到会话级事件时算不出意图分，先补埋点（卡页口径规则加权版约 2 周、ML 版约 4 周）。
- 何时不用：要按弃购用户类型选内容用「弃购挽回机器学习」；要跑固定延时序列用「加购未购自动挽回触发」。
- 能力边界：只输出意图评分与分层名单，不负责消息发送，也不保证卡页口径的转化提升。
- 安全边界：触达须在用户同意范围内并提供退订入口，低意图用户不触达；意图分是概率估计，不得据此对用户差别定价或歧视性对待。

## 技能关联

- **前置**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Purchase-Sequence-Prediction.html、Skill-Purchase-Sequence-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-Zero-Click-Search-Optimization.html、Skill-Zero-Click-Search-Optimization
- **延伸**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Purchase-Sequence-Prediction.html、Skill-Purchase-Sequence-Prediction、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Zero-Click-Search-Optimization.html、Skill-Zero-Click-Search-Optimization
- **可组合**：Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Purchase-Sequence-Prediction.html、Skill-Purchase-Sequence-Prediction、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Zero-Click-Search-Optimization.html、Skill-Zero-Click-Search-Optimization、Skill-Purchase-Intent-Prediction

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：14-用户分析　·　源卡：`Skill-Purchase-Intent-Prediction`