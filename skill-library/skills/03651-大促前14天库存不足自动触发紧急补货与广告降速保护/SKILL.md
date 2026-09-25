---
name: "p2s-promo-inventory-pulse-auto-trigger"
title: "Promo-Inventory-Pulse-Auto-Trigger — 大促前14天库存不足自动触发紧急补货与广告降速保护"
description: "触发词：大促库存脉冲、14天触发窗、紧急补货、广告降速、库存覆盖率。何时不用：大促前的缺口盘点与空运决策用「大促前盘货」；直播闪购的分钟级脉冲走「直播闪购库存脉冲」。安全边界：广告降速与紧急补货均为建议动作，改出价与下补货单须人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 促销规划"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Promo-Inventory-Pulse-Auto-Trigger"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促前 14 天自动查一遍库存够不够，不够就同时提紧急补货和压广告出价。"
user_try: "试试：Prime Day 前按库存、在途和 4.2 倍大促倍率，判断要不要紧急补货并压广告出价。"
whenToUse: "大促临近且库存覆盖率可能不足、需要提前触发补货与广告保护时用；仅做缺口盘点用「大促前盘货」。"
workflow: "按大促倍率、活动天数与安全系数算目标库存 → 对比当前库存加在途得到覆盖率 → 覆盖率不足则触发紧急补货建议 → 同步给出广告降速比例与恢复条件"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Promo-Inventory-Pulse-Auto-Trigger — 大促前14天库存不足自动触发紧急补货与广告降速保护

## ① 解决的问题

运营面临"大促前备货不足导致爆单断货"——14天前自动触发紧急补货+广告降速将大促断货率从18%降至5%，年化多增GMV120万元

## ② 核心算法逻辑

论文：Deep Inventory Control: A Deep Reinforcement Learning Approach for MultiEchelon Inventory Management | 年份：2021

## ③ 业务应用场景

场景：Prime Day 前婴儿推车备货 - 触发时间：Prime Day 开始前 14 天（T=7月2日） - 状态：当前库存 180 件，在途 50 件（预计 T+5 到货），历史 Prime Day 倍率 4.2x，日均 28 件 - 目标库存：28 × 4.2 × 3天活动 × 1.2安全系数 ≈ 424 件；实际可用 230 件，覆盖率 54% - 执行： - 触发紧急补货 194 件（空运，成本 $2,300） - 广告出价下调 40%（$2.20 → $1.32），减少日均订单 35%，保护库存 7 天 - 补货到达后恢复广告出价 - 业务价值：避免大促期间断货损失 $68,00
**三轨验证** | 成本轨：系统开发成本12万元（一次性），月均运维成本3500元（技术支持8小时/周），AI模型调用成本月均2000元；ROI周期8个月，年化节省成本45万元（缺货率从12%降至3%，减少滞销品积压约120万元库存） | 合规轨：符合《跨境电商商品质量管理规范》和FBA库存管理政策；需获得亚马逊官方API接入认证；满足婴幼儿产品进口备案要求（需提供产品检测报告和质量证书）；依据：《电商法》第十条、《进出口食品安全管理办法》 | 风险轨：预测模型偏差风险（概率15%）导致过度备货或缺货；FBA物流延迟风险（概率8%）影响触发时效性；数据质量不稳定风险（概率12%）因平台API

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：大促断货避免损失 $68,000/次，广告降速节省无效投放 $1,800，空运成本 $2,300，净收益 $67,500
实施难度：⭐⭐⭐☆☆（需大促日历配置 + 库存 API + 广告平台 API 双向接入）
优先级：⭐⭐⭐⭐⭐（大促是全年最高 GMV 窗口，库存断货是不可逆的机会损失）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（182 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from datetime import datetime, timedelta
from typing import Dict, List, Optional

def promo_inventory_pulse_auto_trigger(
    skus: List[Dict],
    now: Optional[datetime] = None,
    trigger_days_before: int = 14,
    safety_factor: float = 1.2,
    ad_slowdown_threshold: float = 0.70,
    ad_slowdown_pct: float = 0.40
) -> Dict:
    """
    大促前库存脉冲自动触发器
    
    参数:
        skus: [{
            "sku_id": str, "current_stock": int,
            "in_transit_stock": int, "in_transit_eta_days": int,
            "avg_daily_sales": float,
            "promo_multiplier": float,  # 历史大促倍率
            "promo_duration_days": int, # 大促持续天数
            "promo_start_date": str,    # ISO8601 大促开始日
            "current_bid": float        # 当前广告出价 ($)
        }]
        trigger_days_before: 大促前多少天检测（默认14天）
        safety_factor: 安全库存系数（默认1.2）
        ad_slowdown_threshold: 触发广告降速的覆盖率阈值（默认70%）
        ad_slowdown_pct: 广告降速比例（默认40%）
    
    返回:
        {"triggers": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    triggers = []
    
    for sku in skus:
        sid = sku["sku_id"]
        current_stock = sku["current_stock"]
        in_transit = sku.get("in_transit_stock", 0)
        in_transit_eta = sku.get("in_transit_eta_days", 0)
        daily_sales = max(sku.get("avg_daily_sales", 1), 0.1)
        promo_mult = sku.get("promo_multiplier", 3.0)
        promo_days = sku.get("promo_duration_days", 3)
        promo_start = datetime.fromisoformat(sku["promo_start_date"])
        current_bid = sku.get("current_bid", 1.5)
        
        days_to_promo = (promo_start - now).days
        
        # 检查是否在触发窗口内
        if days_to_promo > trigger_days_before or days_to_promo < 0:
            triggers.append({
                "sku_id": sid,
                "action": "NOT_IN_WINDOW",
                "days_to_promo": days_to_promo,
                "reason": f"距大促{days_to_promo}天，触发窗口为{trigger_days_before}天内"
            })
            continue
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.08985，但该号在 arXiv 上是《Analysis and prediction of changes in the temperature of the pure freshwater ice column in the Antarctic and the Arctic》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Deep Inventory Control: A Deep Reinforcement Learning Approach for MultiEchelon Inventory Management》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各 SKU 当前库存、在途库存与预计到货天数、日均销量、历史大促倍率、大促持续天数、大促开始日与当前广告出价；另需库存 API 与大促日历配置。

**输出**：触发清单：是否在触发窗内、目标库存与覆盖率、紧急补货建议量与成本、广告降速比例与恢复条件，供运营确认后执行。

## 执行步骤

1. 按大促倍率、活动天数与安全系数算目标库存
2. 对比当前库存加在途得到覆盖率
3. 覆盖率低于阈值时触发紧急补货建议
4. 给出广告出价下调比例与恢复条件
5. 补货到货后提示恢复广告出价

## 边界与不做

- 数据不满足时不适用：没有大促日历配置、库存 API 或广告平台 API 时，触发时点与降速动作无法落地。
- 能力边界：只产出触发判断与建议动作，改价改出价、下补货单由人工或外部系统执行。
- 触发阈值依赖历史大促倍率，倍率失真或活动临时变更时需人工覆盖。

## 技能关联

- **前置**：Skill-OOS-Emergency-Airfreight-Gate.html、Skill-OOS-Emergency-Airfreight-Gate、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-ROAS-Below-Target-Budget-Freeze.html、Skill-ROAS-Below-Target-Budget-Freeze
- **延伸**：Skill-OOS-Emergency-Airfreight-Gate.html、Skill-OOS-Emergency-Airfreight-Gate、Skill-ROAS-Below-Target-Budget-Freeze.html、Skill-ROAS-Below-Target-Budget-Freeze
- **可组合**：Skill-ROAS-Below-Target-Budget-Freeze.html、Skill-ROAS-Below-Target-Budget-Freeze、Skill-Promo-Inventory-Pulse-Auto-Trigger

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Promo-Inventory-Pulse-Auto-Trigger`