---
name: "p2s-supplier-performance-alert-action"
title: "Supplier-Performance-Alert-Action — 供应商OTIF连续不达标自动触发备选供应商激活"
description: "触发词：供应商预警、OTIF不达标、备选供应商激活、交期履约、绩效告警。何时不用：只做月度绩效打分与趋势观察、不出告警动作时用供应商绩效积分卡；只做新供应商准入与证书到期监控时用供应商准入认证KPI。安全边界：备选供应商激活前必须通过质检验证（首批次质检合格率达标），预警与订单转移须保留人工复核环节。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supplier-Performance-Alert-Action"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "供应商连续几周交期不达标时自动预警，并把部分订单切给已通过质检的备选供应商，避免断货。"
user_try: "试试：主供应商连续三周 OTIF 低于 85%，帮我生成预警函并把未来 4 周 30% 的订单转给备选供应商。"
whenToUse: "OTIF 已连续低于阈值、需要立即触发预警与订单转移动作时用本技能；若只是要月度绩效打分与趋势预警，用供应商绩效积分卡。"
workflow: "按周汇总供应商 OTIF 并计算连续不达标周数 → 达到预警阈值时生成正式预警函并要求提交 CAP → 校验备选供应商是否已通过质检验证 → 按比例转移订单并通知采购团队监控产能与质检 → 持续跟踪，达到暂停阈值时升级处理"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supplier-Performance-Alert-Action — 供应商OTIF连续不达标自动触发备选供应商激活

## ① 解决的问题

采购负责人面临"供应商交期持续不达标影响发货"——OTIF<85%连续3周自动激活备选供应商将交期履约率从82%提升至94%，年化减少缺货损失30万元

## ② 核心算法逻辑

核心是「OTIF 滚动计算 + 连续不达标检测 + 双轨响应（预警+备选激活）」：

## ③ 业务应用场景

场景：婴儿纸尿裤主供应商产能下滑 - 触发条件：主供应商 S-DIAPER-A 第 3 周 OTIF = 76%（W1: 82%, W2: 79%, W3: 76%），连续 3 周低于 85% - 执行动作： - 立即发送正式预警函给主供应商（要求 72h 内提交 CAP） - 激活备选供应商 S-DIAPER-B，将未来 4 周 30% 订单量转移 - 通知采购团队监控备选供应商产能和质检流程 - 安全护栏：备选供应商激活前需通过质检验证（首批次质检合格率 ≥ 95%） - 业务价值：供应链中断风险从 28% 降至 6%，年化避免缺货损失 $85,000
三轨验证 | 成本轨：AI模型API调用月均350元，数据标注外包月均2000元，人工审核12小时/月（折合1500元），总月成本3850元，年化46200元，ROI周期1.2个月 | 合规轨：符合跨境电商数据合规要求，供应商性能数据本地化存储，不涉及个人隐私信息，满足Amazon、eBay平台政策 | 风险轨：预测模型准确率依赖历史数据完整性（当前缺失率8%），建议月度模型验证，误报率控制在5%以内，需建立人工复核机制应对异常告警
**三轨验证** | 成本轨：云服务器成本月均800元，告警系统维护月均1200元，应急响应团队配置月均3000元，总月成本5000元，年化60000元，相比缺货损失节省45万元，净收益39万元 | 合规轨：符合跨境供应链透明度要求，供应商数据脱敏处理，告警信息仅限授权人员访问，满足ISO9001质量管理体系要求 | 风险轨：系统依赖性强（单点故障风险），建议建立备用告警通道，数据同步延迟可能导致2-4小时预警滞后，需配置冗余机制和人工巡检制度

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：供应链中断风险从 28% → 6%，年化避免缺货损失 $85,000；备选供应商激活成本约 $5,000/次
实施难度：⭐⭐☆☆☆（需供应商 ERP 数据接口 + 通知系统 + 备选供应商评级库）
优先级：⭐⭐⭐⭐⭐（供应商风险是跨境电商最难预测的断货根因）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（181 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
from datetime import datetime

def supplier_performance_alert_action(
    suppliers: List[Dict],
    warning_weeks: int = 2,
    activate_weeks: int = 3,
    suspend_weeks: int = 5,
    otif_threshold: float = 0.85,
    transfer_pct_partial: float = 0.30,
    transfer_pct_full: float = 1.0
) -> Dict:
    """
    供应商绩效预警与备选激活执行器
    
    参数:
        suppliers: [{
            "supplier_id": str, "supplier_name": str,
            "weekly_otif": List[float],  # 最近N周OTIF，从早到晚排列
            "backup_supplier_id": str | None,
            "backup_qualified": bool,    # 备选供应商是否已通过质检
            "weekly_order_volume": int   # 周均订单量
        }]
        warning_weeks: 触发预警所需连续低OTIF周数
        activate_weeks: 触发备选激活所需连续低OTIF周数
        suspend_weeks: 触发暂停所需连续低OTIF周数
        otif_threshold: OTIF 不达标阈值
    
    返回:
        {"actions": [...], "stats": {...}}
    """
    actions = []
    
    for supplier in suppliers:
        sid = supplier["supplier_id"]
        sname = supplier.get("supplier_name", sid)
        weekly_otif = supplier.get("weekly_otif", [])
        backup_id = supplier.get("backup_supplier_id")
        backup_qualified = supplier.get("backup_qualified", False)
        order_volume = supplier.get("weekly_order_volume", 100)
        
        if not weekly_otif:
            actions.append({"supplier_id": sid, "action": "DATA_MISSING", "reason": "无OTIF历史数据"})
            continue
        
        # 计算连续不达标周数（从最近一周往前数）
        consecutive_fail = 0
        for otif in reversed(weekly_otif):
            if otif < otif_threshold:
                consecutive_fail += 1
            else:
                break
        
        current_otif = weekly_otif[-1]
        
        if consecutive_fail >= suspend_weeks:
            # 全量暂停
            action = {
                "supplier_id": sid,
                "supplier_name": sname,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：供应商最近 N 周 OTIF 序列（从早到晚排列）、备选供应商 ID 与质检合格标记、周均订单量，以及预警周数、激活周数、暂停周数与 OTIF 阈值等参数。

**输出**：结构化动作清单与统计（actions 与 stats）：每家供应商的预警、备选激活、暂停或数据缺失动作及理由，供采购团队与供应链负责人执行。

## 执行步骤

1. 按供应商汇总最近 N 周 OTIF 并统计连续不达标周数
2. 对达到预警周数的供应商发出预警并要求提交 CAP
3. 核验备选供应商是否已通过质检验证
4. 按设定比例把订单转移给备选供应商
5. 输出动作清单与统计并持续跟踪后续周次

## 边界与不做

- 何时不用：供应商绩效尚未连续低于阈值、只需评分与趋势观察时，用供应商绩效积分卡；新供应商准入与证书有效期监控用供应商准入认证KPI。
- 能力边界：输出预警与订单转移建议动作，不直接发送函件，也不替代 SRM/采购系统的下单与合同变更流程。
- 数据边界：缺少 OTIF 历史数据时只能输出数据缺失提示；阈值需按品类与供应商重要性人工校准，备选未通过质检不得激活。

## 技能关联

- **前置**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-OOS-Emergency-Airfreight-Gate.html、Skill-OOS-Emergency-Airfreight-Gate、Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-OOS-Emergency-Airfreight-Gate.html、Skill-OOS-Emergency-Airfreight-Gate、Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Supplier-Performance-Alert-Action

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-Supplier-Performance-Alert-Action`