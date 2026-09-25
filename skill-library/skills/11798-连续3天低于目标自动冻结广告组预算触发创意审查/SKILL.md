---
name: "p2s-roas-below-target-budget-freeze"
title: "ROAS-Below-Target-Budget-Freeze — ROAS连续3天低于目标自动冻结广告组预算触发创意审查"
description: "触发词：ROAS连续低于目标、预算冻结、创意审查、误触发防护、广告组止损。何时不用：广告组可用天数不足预警门槛时不做判断；素材与创意本身的问题不属本卡修复范围。安全边界：须保留账户整体ROAS下滑时的宽松模式与误触发防护，实际冻结需广告API权限并通知负责人。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-ROAS-Below-Target-Budget-Freeze"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "广告组连续几天 ROAS 低于目标就自动冻结日预算，同时生成创意审查任务并推送诊断建议。"
user_try: "试试：Diaper-SP-Brand-01 连续三天 ROAS 只有1.6左右、目标3.0，帮我冻结它并给出诊断建议。"
whenToUse: "当单广告组连续多日不达标、需要先用冻结止损再排查创意与投放结构时用本卡；需要按转化率对单个关键词做显著性调价用关键词出价自动调整器；渠道级饱和度重分配用渠道预算再分配触发器。"
workflow: "汇总各广告组日 ROAS、目标 ROAS 与日预算 → 按连续不达标天数分级触发预警、冻结与暂停 → 检查账户整体 ROAS 趋势决定是否放宽阈值 → 冻结触发广告组并生成审查任务 → 推送诊断建议并在优化完成后再解冻"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ROAS-Below-Target-Budget-Freeze — ROAS连续3天低于目标自动冻结广告组预算触发创意审查

## ① 解决的问题

广告负责人面临"低效广告组持续消耗预算"——ROAS连续3天低于目标自动冻结预算将广告浪费降低35%，年化节省广告费20万元

## ② 核心算法逻辑

论文：Realtime Bidding by Reinforcement Learning in Display Advertising | arXiv：1906.04165

## ③ 业务应用场景

场景：婴儿纸尿裤广告组 ROAS 持续低迷 - 触发条件：广告组「Diaper-SP-Brand-01」连续 3 天 ROAS = [1.8, 1.6, 1.5]，目标 ROAS = 3.0 - 执行动作： - 冻结广告组日预算（$0/day），停止继续亏损投放 - 自动生成审查任务：检查点击率（CTR 从 0.8% 跌至 0.3%）、搜索词报告（错误触发宽泛词） - 推送通知给广告负责人，附 ROAS 趋势图和诊断建议 - 根因发现：主图素材过时（新竞品上线），优化主图后 CTR 恢复至 0.9% - 解冻后：ROAS 回升至 3.4，节省无效投放 $4,200（冻结期间） - 业务价值：年
成本轨： - 数据采集费用：Amazon Advertising API 调用成本 $0.02/1000次，日均调用 500次/账户 = $0.01/天，年化 $3.65 - 计算资源：云函数执行（AWS Lambda）日均 10次触发，每次 512MB×30秒 = $0.0002/次，年化 $0.73 - 人力投入：初期系统搭建 80小时（$4,000），年度维护 40小时（$2,000） - 总成本：年化 $6,073.38（相对业务价值 $50,000 节省，ROI = 724%）
合规轨： - ✅ Amazon 政策：符合《Amazon Advertising 政策》，自动冻结预算属于账户自主管理，无违规 - ✅ GDPR：仅涉及账户内部数据处理，不涉及用户个人数据，无需额外合规 - ✅ 广告法：自动冻结是保护消费者权益（防止低效广告投放），符合《反不正当竞争法》 - ✅ 跨境贸易：不涉及商品进出口管制，仅为广告投放管理工具 - 结论：完全合规，可直接上线

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：年化减少无效广告投放 $50,000，整体广告 ACoS 降低 4 个百分点，等效 GMV 增量约 $80,000
实施难度：⭐⭐☆☆☆（需广告 API 读写权限 + 通知系统）
优先级：⭐⭐⭐⭐⭐（广告 ACoS 是影响利润率的核心杠杆）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（185 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
from datetime import datetime

def roas_below_target_budget_freeze(
    ad_groups: List[Dict],
    now: Optional[datetime] = None,
    warning_days: int = 2,
    freeze_days: int = 3,
    suspend_days: int = 5,
    account_roas_decline_threshold: float = 0.20,
    threshold_relax_factor: float = 0.15
) -> Dict:
    """
    ROAS 低于目标自动冻结执行器
    
    参数:
        ad_groups: [{
            "ad_group_id": str, "ad_group_name": str,
            "daily_roas": List[float],  # 最近N天ROAS，从早到晚排列
            "target_roas": float,
            "daily_budget": float,
            "account_avg_roas_trend": List[float]  # 账户整体ROAS（用于误触发防护）
        }]
        warning_days: 触发预警所需连续低ROAS天数
        freeze_days: 触发冻结所需连续低ROAS天数
        suspend_days: 触发暂停所需连续低ROAS天数
        account_roas_decline_threshold: 账户整体ROAS下降多少比例触发宽松模式
    
    返回:
        {"actions": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    actions = []
    
    for ag in ad_groups:
        agid = ag["ad_group_id"]
        agname = ag.get("ad_group_name", agid)
        daily_roas = ag.get("daily_roas", [])
        target_roas = ag.get("target_roas", 3.0)
        daily_budget = ag.get("daily_budget", 100.0)
        account_roas = ag.get("account_avg_roas_trend", [])
        
        if len(daily_roas) < warning_days:
            actions.append({"ad_group_id": agid, "action": "INSUFFICIENT_DATA",
                            "reason": f"仅{len(daily_roas)}天数据，需至少{warning_days}天"})
            continue
        
        # 误触发防护：检查账户整体ROAS是否也在下降
        adjusted_target = target_roas
        if len(account_roas) >= 3:
            account_recent = sum(account_roas[-3:]) / 3
            account_baseline = sum(account_roas[:3]) / 3 if len(account_roas) >= 6 else account_recent
            account_decline = max(0, (account_baseline - account_recent) / max(account_baseline, 0.1))
            if account_decline > account_roas_decline_threshold:
                adjusted_target = target_roas * (1 - threshold_relax_factor)
        
        # 计算连续不达标天数
        consecutive_fail = 0
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1906.04165，但该号在 arXiv 上是《Leveraging BERT for Extractive Text Summarization on Lectures》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Realtime Bidding by Reinforcement Learning in Display Advertising》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各广告组最近 N 天的日 ROAS 序列（由早到晚）、目标 ROAS、日预算与账户整体 ROAS 趋势（用于误触发防护），以及预警天数（默认 2）、冻结天数（默认 3）、暂停天数（默认 5）与账户 ROAS 下滑比例阈值（默认 0.20）。

**输出**：冻结、预警与暂停动作清单及统计汇总，附创意审查任务、CTR 与搜索词报告等诊断建议和 ROAS 趋势通知，供广告负责人处理与解冻决策。

## 执行步骤

1. 汇总各广告组最近 N 天日 ROAS、目标 ROAS 与日预算
2. 按连续低 ROAS 天数分级触发预警、冻结与暂停
3. 检查账户整体 ROAS 趋势，大盘下滑时放宽阈值防误触发
4. 对触发广告组冻结日预算并生成创意审查任务
5. 附 CTR 与搜索词报告诊断建议并推送通知给负责人
6. 优化完成后解冻并跟踪 ROAS 是否回升至目标

## 边界与不做

- 何时不用：广告组可用数据天数少于预警天数（默认 2 天）时不做判断；素材过时等根因问题需人工优化，冻结只能止损。
- 能力边界：只产出冻结动作与审查任务，实际预算冻结需广告 API 读写权限与通知系统；解冻需确认优化已完成。
- 误触发防护：账户整体 ROAS 同步下滑时须放宽阈值，避免把大盘波动误判为单组失效。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Content-ROI-Budget-Shift-Trigger.html、Skill-Content-ROI-Budget-Shift-Trigger、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster、Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger
- **延伸**：Skill-Content-ROI-Budget-Shift-Trigger.html、Skill-Content-ROI-Budget-Shift-Trigger、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster、Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger
- **可组合**：Skill-Content-ROI-Budget-Shift-Trigger.html、Skill-Content-ROI-Budget-Shift-Trigger、Skill-Promo-Inventory-Pulse-Auto-Trigger.html、Skill-Promo-Inventory-Pulse-Auto-Trigger、Skill-ROAS-Below-Target-Budget-Freeze

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-ROAS-Below-Target-Budget-Freeze`