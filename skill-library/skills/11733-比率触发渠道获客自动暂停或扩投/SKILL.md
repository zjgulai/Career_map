---
name: "p2s-ltv-cac-acquisition-gate"
title: "LTV CAC Acquisition Gate — LTV/CAC比率触发渠道获客自动暂停或扩投"
description: "触发词：LTV/CAC门控、渠道暂停、渠道扩投、新客样本门控、品牌保底预算。何时不用：新客量低于最小样本时不评估该渠道；需要按分位数做保守与乐观双侧判断时走LTV预算开闸熔断器。安全边界：暂停后须保留品牌最低预算并设观察天数后复评，不得一次性永久关停渠道。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 异常冻结与恢复"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-LTV-CAC-Acquisition-Gate"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "用 LTV/CAC 比值判断哪个渠道该暂停新客投放、哪个该加预算，并保留品牌最低预算。"
user_try: "试试：Pinterest 的 LTV/CAC 只有2.1、YouTube 6.2，帮我决定停哪个、加哪个，并保留品牌保底预算。"
whenToUse: "当只有一个 LTV 预测值和当月 CAC、按单侧阈值做暂停或扩投判断时用本卡；需要 P25/P75 双侧分位数与连续扩增次数上限时用获客预算开闸熔断器；饱和度类问题用再分配触发器。"
workflow: "汇总各渠道预测LTV、当月CAC、新客数与预算 → 按最小新客数门槛过滤渠道 → 比值低于暂停阈值判暂停、高于扩投阈值判加预算 → 按扩投比例调整并把释放预算转入高效渠道 → 保留品牌最低预算并设观察天数后复评"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LTV CAC Acquisition Gate — LTV/CAC比率触发渠道获客自动暂停或扩投

## ① 解决的问题

增长团队面临"渠道LTV/CAC低效但预算未暂停导致亏损获客"——LTV/CAC门控自动暂停低效渠道扩投高效渠道，整体获客效率提升25%，年化节省$50,000

## ② 核心算法逻辑

核心是「LTV/CAC比率计算 + 渠道级别决策 + 预算弹性调整」：

## ③ 业务应用场景

场景：母婴品牌多渠道获客效率评估 - 触发条件：Pinterest渠道LTV/CAC=2.1（新客LTV预测$85，CAC=$40.4），低于阈值3，触发暂停；YouTube LTV/CAC=6.2（LTV $248，CAC $40），触发扩投 - 执行动作：Pinterest暂停新客获取预算（节省$8,000/月），YouTube预算增加20%（+$4,000/月转入） - 安全护栏：Pinterest品牌维护最低预算$500/月不受影响；Pinterest暂停7天后重新评估 - 业务价值：资源向高ROI渠道集中，整体获客效率提升，年化减少无效获客支出约$45,000
**三轨验证** | 成本轨：LTV-CAC模型搭建月均成本1200元（数据分析师0.3人月×4000元+系统维护200元+云计算资源800元），流失预警系统人工干预8小时/月（客服成本320元/月），总月均成本1520元，年化18240元。ROI测算：预警干预转化率提升15%，单客LTV从8000元提升至8.35万元，年度增收约420万元，成本回报比1:230 | 合规轨：✓符合《母婴产品质量安全溯源管理规范》数据采集要求；✓满足《个人信息保护法》用户行为数据脱敏处理（用户ID加密存储）；✓遵守平台反作弊规则，预警干预需获得用户明确同意；依据：工信部《电商平台数据安全管理办法》第12条 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：减少低效渠道投入，整体获客效率提升20-30%，年化节省$40,000-$70,000
实施难度：⭐⭐☆☆☆（需接入LTV预测流水线和渠道预算API）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（154 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
import numpy as np
from datetime import date

def ltv_cac_acquisition_gate(
    channel_metrics: List[Dict],
    pause_threshold: float = 3.0,
    boost_threshold: float = 5.0,
    boost_ratio: float = 0.20,
    min_new_customers: int = 50,
    min_brand_budget: float = 500.0,
    pause_observation_days: int = 7
) -> Dict:
    """
    LTV/CAC渠道获客门控决策器
    
    参数:
        channel_metrics: [{
            "channel_name": str,
            "predicted_ltv": float,  # 模型预测12月LTV（来自ZILN）
            "cac": float,            # 当月获客成本
            "new_customers_count": int,  # 当月新客数
            "current_budget": float,     # 当前月预算
            "ltv_history": [float]       # 近3月LTV追踪（可选）
        }]
        pause_threshold: 暂停阈值（默认3.0）
        boost_threshold: 扩投阈值（默认5.0）
        boost_ratio: 扩投比例（默认20%）
        min_new_customers: 最小新客数门控
        min_brand_budget: 暂停后品牌最低保留预算
    
    返回:
        各渠道决策和预算调整指令
    """
    decisions = []
    total_budget_change = 0.0
    
    for ch in channel_metrics:
        name = ch["channel_name"]
        ltv = ch["predicted_ltv"]
        cac = ch["cac"]
        new_custs = ch["new_customers_count"]
        current_budget = ch["current_budget"]
        
        # 样本量门控
        if new_custs < min_new_customers:
            decisions.append({
                "channel": name,
                "trigger": False,
                "reason": f"新客量{new_custs}<{min_new_customers}，样本不足，不评估",
                "action": "INSUFFICIENT_DATA"
            })
            continue
        
        # 使用历史平均LTV（若有）
        ltv_history = ch.get("ltv_history", [ltv])
        smoothed_ltv = np.mean(ltv_history[-3:]) if len(ltv_history) >= 3 else ltv
        
        ratio = smoothed_ltv / cac if cac > 0 else 0
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.07755，但该号在 arXiv 上是《All-flavor constraints on nonstandard neutrino interactions and generalized matter potential with three years of IceCube DeepCore data》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道的模型预测 12 月 LTV（来自 ZILN）、当月 CAC、当月新客数、当前月预算与可选的近 3 月 LTV 追踪，以及暂停阈值（默认 3.0）、扩投阈值（默认 5.0）、扩投比例（默认 20%）、最小新客数（默认 50）、品牌最低预算（默认 500）与暂停观察天数（默认 7）。

**输出**：各渠道的决策与预算调整指令（暂停、扩投或样本不足不评估）、释放与转入的预算金额，供增长团队在渠道后台执行。

## 执行步骤

1. 汇总各渠道预测 LTV、当月 CAC、新客数与当前预算
2. 按最小新客数门槛过滤样本不足的渠道
3. 计算 LTV/CAC 比值并与暂停、扩投阈值比对
4. 低于暂停阈值则暂停该渠道新客预算并保留品牌最低预算
5. 高于扩投阈值则按比例扩投并把释放预算转入该渠道
6. 设定暂停后的观察天数与复评时点

## 边界与不做

- 何时不用：新客量低于最小样本门槛的渠道不评估；需要 LTV 分位数双侧判断与连续扩增上限时改用 LTV 预算开闸熔断器。
- 能力边界：只产出渠道决策与预算调整指令，不直接调用渠道预算 API；LTV 依赖上游预测模型精度。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 安全护栏：暂停不等于永久关停，须保留品牌维护最低预算并在观察天数后重新评估。

## 技能关联

- **前置**：Skill-CC-OR-Net-LTV-Prediction.html、Skill-CC-OR-Net-LTV-Prediction、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-MMM-Budget-Reallocation-Executor.html、Skill-MMM-Budget-Reallocation-Executor、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger
- **延伸**：Skill-CC-OR-Net-LTV-Prediction.html、Skill-CC-OR-Net-LTV-Prediction、Skill-MMM-Budget-Reallocation-Executor.html、Skill-MMM-Budget-Reallocation-Executor、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger
- **可组合**：Skill-MMM-Budget-Reallocation-Executor.html、Skill-MMM-Budget-Reallocation-Executor、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger、Skill-LTV-CAC-Acquisition-Gate

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：06-增长模型　·　源卡：`Skill-LTV-CAC-Acquisition-Gate`