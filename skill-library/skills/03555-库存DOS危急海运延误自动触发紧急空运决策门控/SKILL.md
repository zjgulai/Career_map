---
name: "p2s-oos-emergency-airfreight-gate"
title: "OOS-Emergency-Airfreight-Gate — 库存DOS危急+海运延误自动触发紧急空运决策门控"
description: "触发词：紧急空运、断货预警、海运延误、DOS 告急、空运审批。何时不用：要算补多少货用「补货模拟」，要预测未来销量用「需求预测」；本技能只判断某批货是否该触发空运。安全边界：本技能只给触发判据与建议，不直接下单空运，空运申请须推送供应链负责人限时审批。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-OOS-Emergency-Airfreight-Gate"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促前海运延误又叠加库存告急时，自动算出该不该走空运、要花多少钱、由谁审批，把断货期压到最短。"
user_try: "试试：黑五前 10 天，我这些 SKU 里哪些 DOS 低于 7 天又在途延误超过 7 天？该不该发空运申请、成本划不划算？"
whenToUse: "已有实时库存、近 7 天日均销量与在途 ETA 数据，要判断断货风险是否值得发空运时用；要算补多少货用「补货模拟」，要预测未来销量用「需求预测」。"
workflow: "解析 SKU 库存与在途 ETA，算出 DOS 与延误天数 → 双重条件同时成立才判定触发：DOS 低于危急阈值且在途延误超阈值 → 用空运单价乘在途重量算空运成本，与预计缺货损失对比 → 按金额落到自动、经理、总监三档审批并输出待审批清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# OOS-Emergency-Airfreight-Gate — 库存DOS危急+海运延误自动触发紧急空运决策门控

## ① 解决的问题

供应链负责人面临"海运延误叠加断货风险"——DOS<7天+在途延误自动触发空运决策门控将断货期从8天缩短至2天，年化避损60万元

## ② 核心算法逻辑

论文：A Deep Reinforcement Learning Framework for Inventory Emergency Logistics | 年份：2021

## ③ 业务应用场景

场景：婴儿安全座椅大促期间库存告急 - 触发条件：黑五前 10 天，当前库存 47 件（DOS 6.7天），海运在途延误 12 天（港口拥堵） - 成本分析：空运 80kg = $1,200；预计缺货损失 = 日均 GMV $2,800 × 15 天 × 1.5（排名惩罚） = $63,000 - 决策结果：空运成本($1,200) << 缺货损失($63,000)，触发空运申请，推送至供应链负责人 1h 内审批 - 执行后：备货到达，黑五期间销量 +340 件，避免断货损失约 $42,000 - 业务价值：关键节点库存保障率 99%，年化避免缺货损失 $180,000
**三轨验证** | 成本轨：AI预测模型月均API调用成本1200元，人工审核12小时/月（成本1800元），系统维护2000元/月，总计5000元/月；相比传统人工备货成本下降35% | 合规轨：符合跨境电商进口合规要求，数据存储于国内服务器（符合GDPR数据本地化要求），获得Amazon FBA政策认可，无食品安全合规风险 | 风险轨：预测模型准确率依赖历史数据完整性，季节性波动可能导致偏差5-8%，建议每月重训练一次；供应链突发事件（如关税变化）可能影响预测效果，需建立应急预案

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：单次空运成本 $1,200，避免缺货损失 $42,000，ROI 35:1；年化避免缺货损失 $180,000
实施难度：⭐⭐⭐☆☆（需实时库存 API + 物流 ETA 接口 + 审批工作流）
优先级：⭐⭐⭐⭐⭐（大促期间库存断货是最高危风险，直接影响搜索排名）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（160 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
from datetime import datetime

def oos_emergency_airfreight_gate(
    skus: List[Dict],
    now: Optional[datetime] = None,
    dos_threshold: float = 7.0,
    delay_threshold_days: int = 7,
    auto_approve_limit: float = 500.0,
    manager_limit: float = 2000.0,
    stockout_multiplier: float = 1.5
) -> Dict:
    """
    缺货紧急空运决策门控
    
    参数:
        skus: [{
            "sku_id": str, "current_stock": int,
            "avg_daily_sales": float,  # 过去7天日均销量
            "daily_gmv": float,        # 日均GMV
            "shipment_eta_original": str,  # ISO8601 原定到达日期
            "shipment_eta_updated": str,   # ISO8601 更新后到达日期
            "shipment_weight_kg": float,   # 在途货物重量(kg)
            "airfreight_rate_per_kg": float  # 空运单价($/kg)
        }]
        dos_threshold: 危急 DOS 阈值（默认7天）
        delay_threshold_days: 延误天数阈值（默认7天）
        auto_approve_limit: 自动审批上限（$500以下无需人工）
        manager_limit: 总监审批阈值
        stockout_multiplier: 缺货损失乘数（含排名惩罚）
    
    返回:
        {"decisions": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    decisions = []
    
    for sku in skus:
        sid = sku["sku_id"]
        stock = sku["current_stock"]
        daily_sales = max(sku.get("avg_daily_sales", 1), 0.1)
        daily_gmv = sku.get("daily_gmv", 0)
        
        # 解析延误信息
        eta_original = datetime.fromisoformat(sku["shipment_eta_original"])
        eta_updated = datetime.fromisoformat(sku["shipment_eta_updated"])
        delay_days = (eta_updated - eta_original).days
        weight_kg = sku.get("shipment_weight_kg", 0)
        air_rate = sku.get("airfreight_rate_per_kg", 8.0)
        
        # 计算 DOS
        dos = stock / daily_sales
        
        # 检查双重触发条件
        condition_a = dos < dos_threshold
        condition_b = delay_days > delay_threshold_days
        
        if not (condition_a and condition_b):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.03274，但该号在 arXiv 上是《The Magellanic Edges Survey -- II. Formation of the LMC's northern arm》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《A Deep Reinforcement Learning Framework for Inventory Emergency Logistics》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 粒度清单：sku_id、当前库存件数、过去 7 天日均销量、日均 GMV、在途货物的原定到达日期与更新后到达日期（ISO8601）、在途货物重量 kg、空运单价（美元/kg）；可附阈值参数：DOS 危急阈值（默认 7 天）、延误天数阈值（默认 7 天）、自动审批上限（默认 500 美元）、总监审批阈值（默认 2000 美元）、缺货损失乘数 1.5。

**输出**：逐 SKU 输出 DOS、双重触发判定（DOS 低于阈值且延误超阈值）、空运成本与预计缺货损失对比、建议审批层级与是否发空运申请，并汇总整体统计；供供应链负责人在 1 小时内完成审批，也用于大促前库存保障复盘。

## 执行步骤

1. 按过去 7 天日均销量算出每个 SKU 的 DOS，标记低于危急阈值的 SKU
2. 对比原定与更新后的到港日期，算出海运延误天数
3. 同时满足 DOS 低于阈值与延误超阈值才判定触发空运
4. 用空运单价乘在途重量算空运成本，与日均 GMV 乘预计断货天数乘缺货损失乘数对比
5. 按金额落到自动审批、经理、总监三档并输出待审批清单
6. 把空运申请推送供应链负责人，限定 1 小时内审批

## 边界与不做

- 数据不满足时不用：缺实时库存、近 7 天日均销量或在途 ETA 的 SKU 无法算 DOS 与延误，不触发决策。
- 只给触发判据与建议，不直接下单空运；空运申请须经供应链负责人审批后才执行。
- 卡页 ROI（单次空运成本 1200 美元对比避免缺货损失 42000 美元、ROI 35:1、年化避免缺货损失 180000 美元）为案例口径，落地前须用本店实际数据重算。

## 技能关联

- **前置**：Skill-CVaR-Inventory-Risk-Portfolio.html、Skill-CVaR-Inventory-Risk-Portfolio、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-OOS-Emergency-Airfreight-Gate

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：04-供应链　·　源卡：`Skill-OOS-Emergency-Airfreight-Gate`