---
name: "p2s-realtime-feature-collection"
title: "Realtime Feature Collection — 流式特征采集与在线特征仓库：推荐系统实时个性化的数据基础设施"
description: "触发词：实时特征采集、流式窗口、特征时效、在线仓库、行为信号。何时不用：需要解决训练与线上口径一致时用特征仓库架构技能；只做决策侧低延迟读取时用供应链在线特征存储技能。安全边界：行为事件须去标识化并按隐私授权采集，特征不得用于超出授权范围的目的。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Realtime-Feature-Collection"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户刚下单就立刻更新他的特征，让推荐在两分钟内换方向，而不是等第二天的批处理。"
user_try: "试试：把用户的浏览、加购、下单事件接成流式特征，让推荐在 5 分钟内感知刚发生的购买行为。"
whenToUse: "推荐或决策依赖刚发生的行为、批处理时效不够时用本技能；需要解决训练与线上特征口径问题，用特征仓库架构技能。"
workflow: "接入行为事件流 → 按窗口与频次定义特征口径 → 流式计算并写入在线特征仓库 → 给特征打上时效元数据 → 监控特征年龄与新鲜度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Realtime Feature Collection — 流式特征采集与在线特征仓库：推荐系统实时个性化的数据基础设施

## ① 解决的问题

算法工程师面临特征入仓延迟——Realtime Feature将时延90分钟压到5分钟，年化省22万元

## ② 核心算法逻辑

核心问题：特征时效性悖论

## ③ 业务应用场景

业务背景：用户在母婴跨境平台刚完成奶瓶购买，当前推荐系统继续推送同品类奶瓶（特征延迟 24h）。如果能在 1 分钟内感知该购买行为，应立即切换推荐关联品类（奶嘴、奶瓶刷、消毒锅）。
| 特征名 | 类型 | 窗口 | 更新频率 | 存储 | |------|------|------|---------|------| | `user_last_purchase_category` | 字符串 | 最近 1 次 | 实时 | Redis STRING | | `user_recent_categories_30m` | 列表 | 最近 30 分钟 | 实时 | Redis LIST | | `user_purchase_count_1d` | 整数 | 今日累计 | 实时 | Redis INCR | | `user_brand_clicks_7d` | 字典 | 7 日
业务背景：某款婴儿睡袋在小红书突然爆红，但批处理特征仓库需要次日才能更新商品热度分。如果能实时采集多源行为信号（站内收藏、外部搜索词、竞品 listing 评分飙升），可以在 30 分钟内将该商品推荐给目标用户群。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

100 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（601 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：10」并记录位置 `paper2skills-code/data_collection/realtime_feature_collection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Realtime-Feature-Collection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
实时特征采集与在线特征仓库
整合：
  - 流式特征计算（模拟 Kafka Consumer + Flink-style 窗口）
  - 在线特征仓库（模拟 Redis，含 TTL 管理）
  - 推理时特征注入（Inference-Time Feature Injection）
  - 特征时效性衰减模型

论文来源：
  2512.14734 (Tubi inference-time injection)
  2501.08591 (OpenMLDB unified feature computation)
  2409.00400 (bilibili batch query consistency)
"""

import time
import math
import queue
import threading
import random
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
from collections import defaultdict, deque


# ──────────────────────────────────────────────────────────
# 数据结构
# ──────────────────────────────────────────────────────────

@dataclass
class UserEvent:
    """用户行为事件（Kafka 消息格式）"""
    user_id: str
    event_type: str        # "view" | "add_to_cart" | "purchase" | "share"
    item_id: str
    category: str
    price: float
    brand: str
    timestamp: float = field(default_factory=time.time)


@dataclass
class FeatureVector:
    """特征向量，含时效性元数据"""
    user_id: str
    features: Dict[str, Any]
    created_at: float = field(default_factory=time.time)
    source: str = "batch"   # "batch" | "realtime" | "merged"

    def age_seconds(self) -> float:
        return time.time() - self.created_at


# ──────────────────────────────────────────────────────────
# Mock Redis（在线特征仓库）
# ──────────────────────────────────────────────────────────

class MockRedis:
    """
    模拟 Redis 在线特征仓库
    支持 STRING / LIST / HASH / TTL
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2409.00400 — An Enhanced Batch Query Architecture in Real-time Recommendation

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户行为事件流（浏览、加购、购买、分享等，含用户 id、商品、类目、价格、品牌、时间戳）与特征口径定义（窗口、更新频率、存储类型），粒度到单条事件与单个用户特征。

**输出**：带时效元数据的实时特征向量（含来源区分批处理、实时或合并，以及特征年龄）与在线仓库中的最新特征值，供推荐系统与实时决策读取。

## 执行步骤

1. 接入浏览、加购、购买等行为事件流
2. 按窗口与更新频率定义每个特征的口径
3. 流式计算特征并写入在线特征仓库
4. 为特征标注来源与生成时间
5. 监控特征年龄，超龄则回退到批处理值

## 边界与不做

- 事件流缺失或事件时间戳不可靠时实时特征无法保证时效；行为变化缓慢、批处理已够用的场景不必引入。
- 本技能负责特征的实时采集与写入，不做推荐策略与模型训练，也不负责用户授权与隐私合规审批。

## 技能关联

- **前置**：Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling
- **延伸**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection
- **可组合**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Realtime-Feature-Collection

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Realtime-Feature-Collection`