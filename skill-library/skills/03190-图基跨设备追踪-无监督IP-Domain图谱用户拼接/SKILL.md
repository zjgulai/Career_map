---
name: "p2s-graphtrack-cross-device-tracking"
title: "图基跨设备追踪 - 无监督IP-Domain图谱用户拼接"
description: "触发词：跨设备追踪、IP 图、域名图、随机游走、设备匹配、归因断链。何时不用：设备共享 IP 极少（移动网络频繁轮换）时图方法失效；需要确定性身份匹配时用登录态或 ID 图谱。安全边界：浏览记录与 IP 属个人信息，需脱敏并符合隐私法规，不得用于还原个体身份或跨站画像。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 数据管道"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-GraphTrack-Cross-Device-Tracking"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "没有登录 ID 时，用 IP 与域名访问图把同一用户的多台设备拼起来。"
user_try: "试试：TikTok 报表显示零转化、独立站显示直接访问，帮我用图方法把这两台设备匹配起来。"
whenToUse: "缺乏用户级关联 ID、但两台设备在 IP 与域名访问上有重叠时用本技能；有登录态或 ID 图谱时用确定性拼接；设备数据过于稀疏时不适用。"
workflow: "清洗设备浏览记录并按设备聚合 → 构建 IP-设备与域名-设备二部图 → 用重启随机游走计算设备间相似度 → 双图融合并做对称匹配输出匹配分数 → 生成跨端归因链路与阈值判定"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 图基跨设备追踪 - 无监督IP-Domain图谱用户拼接

## ① 解决的问题

母婴用户在 TikTok 看到吸奶器短视频种草，切换到 Safari 搜索品牌名进独立站下单

## ② 核心算法逻辑

跨设备追踪的本质是：在没有用户级关联ID的情况下，用行为相似性判断"两台设备属于同一个人"。GraphTrack 将这一问题建模为异构图上的节点相似度计算：把设备的 IP 访问记录构建成「IPDevice 二部图」，把域名访问记录构建成「DomainDevice 二部图」，然后用随机游走重启（RWwR / Personalized PageRank）在图上扩散相似度信号，最终输出设备对的匹配分数。

## ③ 业务应用场景

业务问题：母婴用户在 TikTok 看到吸奶器短视频种草，切换到 Safari 搜索品牌名进独立站下单。现有追踪完全断裂——TikTok 报表显示零转化，独立站显示"直接访问"来源。需要无监督匹配这两个设备的浏览记录，恢复 TikTok 的真实转化贡献。
| 字段 | 类型 | 示例 | |------|------|------| | `device_id` | str | "device_TikTok_iPhone_A001" / "device_Safari_Mac_B001" | | `ip_address` | str | "192.168.1.10"（家庭 WiFi，两设备共享） | | `domain` | str | "momcozy.com", "tiktok.com", "google.com" | | `visit_count` | int | 3（该设备访问该IP/域名的次数） | | `timestamp_range`
预期产出： - 设备对匹配分数矩阵：`match_score(TikTok设备, 独立站设备) > 0.6` → 判定为同一用户 - 跨端归因链路：TikTok 曝光设备 → 独立站转化设备 的用户级关联表

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

600-1200 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（407 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/graphtrack_cross_device_tracking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-GraphTrack-Cross-Device-Tracking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
GraphTrack: 无监督图基跨设备追踪
论文: arXiv:2203.06833 (AsiaCCS 2022)
Binghui Wang et al.

核心算法:
1. 构建 IP-Device 二部图 + Domain-Device 二部图
2. 用 Personalized PageRank (Random Walk with Restart) 计算设备间相似度
3. 双图融合 + 对称匹配 → 输出设备对匹配分数
4. 无监督：无需任何标注设备对

依赖: pip install numpy scipy networkx pandas
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import networkx as nx
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from scipy import sparse


# ─────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────

@dataclass
class BrowsingRecord:
    """设备浏览记录（IP 或 Domain 维度均通用）"""
    device_id: str
    feature: str       # IP 地址 或 域名
    visit_count: int = 1


# ─────────────────────────────────────────────
# 图构建
# ─────────────────────────────────────────────

class DeviceGraph:
    """
    构建 Device-Feature 二部图（Feature = IP 或 Domain）
    节点分两类: device_* 和 feature_*
    边权重 = 访问次数（频率加权）
    """

    def __init__(self, records: List[BrowsingRecord]):
        self.G = nx.Graph()
        self.device_nodes: List[str] = []
        self.feature_nodes: List[str] = []
        self._build(records)

    def _build(self, records: List[BrowsingRecord]):
        device_set = set()
        feature_set = set()

        for r in records:
            d_node = f"device::{r.device_id}"
            f_node = f"feature::{r.feature}"
            device_set.add(d_node)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2203.06833，但该号在 arXiv 上是《GraphTrack: A Graph-based Cross-Device Tracking Framework》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：设备级浏览记录：device_id、ip_address、domain、visit_count、timestamp_range；需覆盖相同时间窗与一定访问量，保证图上有可用的重叠结构。

**输出**：设备对匹配分数矩阵、超过阈值的同用户设备对、跨端归因链路表（曝光设备到转化设备）；供归因与数据分析团队恢复被断链的转化路径。

## 执行步骤

1. 清洗设备浏览记录并按设备聚合
2. 构建 IP-设备与域名-设备二部图
3. 用重启随机游走计算设备间相似度
4. 双图融合并做对称匹配输出匹配分数
5. 生成跨端归因链路与阈值判定

## 边界与不做

- 何时不用：设备 IP 轮换频繁、访问记录稀疏导致图上无重叠时，无监督匹配不可靠，改用登录态或 ID 图谱。
- 能力边界：本技能产出设备匹配分数与链路表，不替代平台归因系统，也不做线上身份写入。
- 合规边界：IP 与浏览记录属个人信息，需脱敏并符合隐私法规，不得用于还原个体身份或跨站画像。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-HGNN-Cross-Device-Matching.html、Skill-HGNN-Cross-Device-Matching、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-HGNN-Cross-Device-Matching.html、Skill-HGNN-Cross-Device-Matching、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-GraphTrack-Cross-Device-Tracking

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-GraphTrack-Cross-Device-Tracking`