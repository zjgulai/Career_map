---
name: "p2s-cross-channel-budget-pacing-controller"
title: "Cross-Channel Budget Pacing Controller — 跨渠道预算节奏控制防止早耗尽与末期停投"
description: "触发词：预算节奏、早耗尽、末期停投、时段花费比例、出价乘子。何时不用：只做渠道间总量再分配、不看小时级节奏时用渠道预算再分配触发器；预算结构由LTV/CAC决定时用获客门控。安全边界：出价乘子调整幅度须限制在正负20%以内，跨渠道再分配须遵守各平台预算与出价政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Cross-Channel-Budget-Pacing-Controller"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "把全天分成六个时段控制各渠道花钱节奏，避免上午花光预算、下午黄金时段无弹药。"
user_try: "试试：双11当天总预算8000美元，Amazon早上容易花掉六成，帮我按时段设定各渠道目标花费并逐小时调整。"
whenToUse: "当痛点是预算在一天内的花光节奏（早耗尽、末期停投）时用本卡；渠道级饱和度触发削减用渠道预算再分配触发器；宏观季度分配用 MMM 类技能。"
workflow: "把全天划分为 6 个 4 小时时段 → 按历史 ROAS 曲线设各渠道各时段目标花费比例 → 逐小时比对实际花费与目标花费 → 按 Min-Pacing 算调节乘子并限制在正负20%内 → ROAS 低于阈值时把后续时段预算转给高 ROAS 渠道"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Channel Budget Pacing Controller — 跨渠道预算节奏控制防止早耗尽与末期停投

## ① 解决的问题

广告团队面临"Amazon早上10点花完全天预算、下午TikTok黄金时段无弹药"——Min-Pacing跨渠道节奏控制将预算执行率从72%提升至93%，年化增效约22万元

## ② 核心算法逻辑

广告预算"早上 10 点花完全天预算"是跨境卖家最常见的广告浪费模式——早高峰出价激进，预算耗尽后 12 点到凌晨投放空窗，错失下午黄金转化时段。这不是出价策略问题，而是预算节奏控制（Budget Pacing）问题。

## ③ 业务应用场景

业务问题：双 11 当天总预算 $8,000，分配 Amazon DSP $3,500、TikTok $2,800、Meta $1,700。历史数据显示： - Amazon 早上 8-11 点流量爆发，容易在 11 点前消耗 60% 预算 - TikTok 下午 2-8 点是最佳转化时段，但 Amazon 占用太多预算后 TikTok 资金不足 - Meta 全天均衡但夜间 10-12 点 ROAS 最高，容易在白天被提前耗完
Pacing 方案： 1. 将全天 24 小时分为 6 个时段（4小时/段） 2. 基于历史 ROAS 曲线为每个渠道每个时段设定目标花费比例 3. 每小时检查实际花费 vs 目标花费，动态调整出价乘子（±20% 范围内） 4. 若某渠道 ROAS 低于 2.5x，自动降低该渠道后续时段预算并重新分配给高 ROAS 渠道
预期产出：三渠道预算执行率从平均 78%（早耗/停投浪费）提升至 96%，整体 ROAS 从 3.1x 提升至 3.8x

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：$9 万/月广告预算，预算执行率从 72% → 93%（+21%），相当于每月多获得 $1.89 万有效投放，年化增效约 $22 万；实施成本约 3 万元，ROI > 700%
实施难度：⭐⭐☆☆☆（接入各渠道 API 实时花费数据 + 出价调节接口，约 2-3 周实现）
优先级：⭐⭐⭐⭐⭐（大促期间效益尤其显著，几乎所有 $3,000/天以上预算的广告主都有此痛点）
评估依据：AdCob 在线上 A/B 测试中跨渠道预算执行率提升 8-15%，GMV +6.3%；ICML 2023 理论证明仅优化渠道预算（而非 ROI）可达到全局最优转化

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（276 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Cross-Channel Budget Pacing Controller
跨渠道预算节奏控制器

依赖：numpy, pandas
实现：Min-Pacing 节奏调节 + 跨渠道预算再分配
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 渠道配置
# ─────────────────────────────────────────────

@dataclass
class AdChannel:
    """广告渠道配置"""
    name: str
    daily_budget: float       # 日预算（美元）
    roas_target: float        # ROAS 目标
    # 历史时段流量系数（24小时，归一化）
    hourly_traffic_pattern: List[float] = field(default_factory=list)

    def __post_init__(self):
        if not self.hourly_traffic_pattern:
            # 默认：早高峰 + 晚高峰流量模式
            base = [0.6, 0.4, 0.3, 0.3, 0.4, 0.7,
                    1.2, 1.8, 1.6, 1.4, 1.5, 1.3,
                    1.2, 1.3, 1.5, 1.6, 1.7, 1.9,
                    2.0, 1.8, 1.6, 1.4, 1.1, 0.8]
            total = sum(base)
            self.hourly_traffic_pattern = [x / total for x in base]

    def planned_spend_by_hour(self) -> List[float]:
        """基于流量模式计算各小时计划花费"""
        return [self.daily_budget * coef for coef in self.hourly_traffic_pattern]


# ─────────────────────────────────────────────
# 2. Pacing 控制器
# ─────────────────────────────────────────────

class CrossChannelPacingController:
    """
    跨渠道预算 Pacing 控制器

    每小时执行：
    1. 检查各渠道花费进度 vs 计划
    2. 计算 Min-Pacing 调节乘子
    3. 跨渠道预算再分配（若 ROAS 低于阈值）
    """

    def __init__(self, channels: List[AdChannel],
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2302.08530 — A Field Guide for Pacing Budget and ROS Constraints

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：各渠道日预算、ROAS 目标与 24 小时流量系数（未提供则用默认早晚高峰模式），以及逐小时的实时花费数据；需要各渠道 API 的实时花费读取与出价调节接口。

**输出**：逐小时的 pacing 调节乘子与跨渠道预算再分配建议，附预算执行率与整体 ROAS 的前后对比，供投放团队在平台侧执行。

## 执行步骤

1. 把全天 24 小时划分为 6 个时段并设定各渠道目标花费比例
2. 逐小时采集各渠道实际花费并与计划花费比对
3. 计算 Min-Pacing 调节乘子并限制在正负20%范围内
4. 对 ROAS 低于阈值的渠道削减后续时段预算
5. 把释放预算重新分配给高 ROAS 渠道
6. 输出调节乘子与再分配建议并跟踪预算执行率

## 边界与不做

- 何时不用：没有小时级花费与流量数据、或预算痛点不在日内节奏（而在渠道结构或 LTV/CAC）时不适用。
- 能力边界：只产出乘子与再分配建议，实际出价调节由各平台 API 执行，不改变日预算总量与渠道准入决策。
- 风险边界：调节幅度须限制在正负20%以内，避免频繁大幅调价触发平台风控。

## 技能关联

- **前置**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation
- **可组合**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Cross-Channel-Budget-Pacing-Controller

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：15-营销投放分析　·　源卡：`Skill-Cross-Channel-Budget-Pacing-Controller`