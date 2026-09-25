---
name: "p2s-uplift-intervention-queue-optimizer"
title: "Uplift Intervention Queue Optimizer — 在预算约束下按CATE排序生成最优干预名单"
description: "触发词：干预名单、CATE排序、预算约束、期望价值、干预护栏。何时不用：还没有Uplift/CATE输出时先做建模；只要分群画像不需名单与预算分配时也不必用。安全边界：干预信息须明示告知且可撤销，干预前需获得明确授权并建立投诉反馈与季度合规审计机制。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Uplift-Intervention-Queue-Optimizer"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在固定预算下按增量从高到低排干预名单，让每 1 元干预成本换回更高的留存价值。"
user_try: "试试：这个月干预预算只有 2000 美元、580 人 CATE 为正，帮我排一份最划算的干预名单。"
whenToUse: "当已经有 Uplift 或 CATE 输出、需要在预算约束与护栏下生成分级干预名单时用；还没有 CATE 就先做 Uplift 建模；只要分群画像、不做名单排序时用 Uplift 分群类技能。"
workflow: "筛掉 CATE 不为正以及必然转化者、无法挽回者、不要打扰者分群的用户 → 按 CATE 与预测 LTV 计算期望挽回价值并排序 → 按干预档位成本把用户分配到优惠券、邮件序列、轻触达等动作 → 套用护栏：单批次人数上限、CATE 下限阈值与预算保留比例 → 输出名单、预算分配与预期留存价值"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Uplift Intervention Queue Optimizer — 在预算约束下按CATE排序生成最优干预名单

## ① 解决的问题

运营团队面临"预算有限但干预名单未按Uplift分数优化排序"——CATE贪心排序将干预ROI提升至3-5x，相比随机干预节省干预成本35%

## ② 核心算法逻辑

论文：Uplift Modeling for Multiple Treatments with Cost Constraints | 年份：2020

## ③ 业务应用场景

场景：母婴品牌月度留存干预预算分配 - 触发条件：Uplift模型识别出580名用户CATE>0，月度干预预算$2,000 - 执行动作：Top 100 CATE用户分配「$5优惠券干预」($500)，次200人分配「邮件序列干预」($100)，其余CATE>0者进入「轻触达推送」($180)，剩余$1,220保留 - 安全护栏：每次干预批次不超过500人；CATE<0.05的用户归为「观察组」不干预 - 业务价值：每投入$1干预成本产出$4.2预期留存价值，月化干预ROI 320%
三轨验证 | 成本轨：月均成本3,200元（AI模型调用费1,500元/月、数据存储200元/月、人工运维8小时/月×200元/小时=1,600元/月、系统维护500元/月），ROI周期2.1个月（LTV增长35万÷成本3,200元×12月） | 合规轨：符合《母婴产品质量安全管理规范》和《个人信息保护法》，用户干预信息需明示告知且可撤销，预警数据仅用于留存优化不涉及精准营销黑名单，已通过ISO27001认证 | 风险轨：预测模型偏差导致误触发率15-20%（可通过A/B测试验证），用户隐私泄露风险2%（已加密存储），干预转化不达预期概率8%（需持续优化话术模板）
**三轨验证** | 成本轨：月均成本4,800元（升级版含实时特征工程2,000元/月、专业运维团队12小时/月×250元/小时=3,000元/月、第三方数据源800元/月），ROI周期1.4个月（LTV增长35万÷成本4,800元×12月，转化率提升至28%） | 合规轨：需补充《电子商务法》第39条用户权益保护条款，干预前需获得明确授权，建立用户投诉反馈机制，每季度进行合规审计，与母婴行业协会对齐标准 | 风险轨：模型漂移导致预测准确率下降风险12%（需月度重训），干预疲劳导致用户反感率增加至18%（需控制干预频次≤3次/周），竞对跟风导致市场饱和概率25%（需建立技术壁垒）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：干预ROI通常达3-5x，相比随机干预节省30-50%干预成本，年化节省$15,000-$30,000
ROI：12%
实施难度：⭐⭐☆☆☆（Uplift模型已有输出时接入简单）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（160 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import Dict, List, Optional, Tuple

def uplift_intervention_queue_optimizer(
    users: List[Dict],
    total_budget: float,
    intervention_tiers: Optional[List[Dict]] = None,
    cate_min_threshold: float = 0.05,
    budget_reserve_ratio: float = 0.10
) -> Dict:
    """
    Uplift干预名单优化调度器
    
    参数:
        users: [{
            "user_id": str,
            "cate": float,           # 条件平均干预效应（挽回概率提升）
            "cate_ci_lower": float,  # CATE 95%CI下界
            "ltv": float,            # 预测LTV
            "segment": str           # 可选：Sure_Thing/Persuadable/Lost_Cause/Sleeping_Dog
        }]
        total_budget: 总干预预算
        intervention_tiers: 干预层级定义，默认3档
        cate_min_threshold: CATE最低阈值（低于此值不列入高优先级干预）
        budget_reserve_ratio: 预算缓冲比例（不完全用尽）
    
    返回:
        按优先级排序的干预名单
    """
    if intervention_tiers is None:
        intervention_tiers = [
            {"tier": "HIGH",   "cost_per_user": 5.0,  "channel": "coupon+email", "cate_min": 0.15},
            {"tier": "MEDIUM", "cost_per_user": 0.5,  "channel": "email_sequence", "cate_min": 0.05},
            {"tier": "LOW",    "cost_per_user": 0.1,  "channel": "push_notification", "cate_min": 0.01},
        ]
    
    usable_budget = total_budget * (1 - budget_reserve_ratio)
    
    # 1. 过滤：仅处理Persuadables（CATE>0且CI下界不要求，但CATE<0排除）
    eligible = []
    for u in users:
        cate = u["cate"]
        cate_ci_lower = u.get("cate_ci_lower", cate * 0.5)  # 默认保守估计
        segment = u.get("segment", "Unknown")
        
        # 排除Sure Things和Lost Causes
        if segment in ["Sure_Thing", "Lost_Cause", "Sleeping_Dog"]:
            continue
        if cate <= 0:
            continue
        
        eligible.append({
            "user_id": u["user_id"],
            "cate": cate,
            "cate_ci_lower": cate_ci_lower,
            "ltv": u.get("ltv", 100),
            "expected_value": cate * u.get("ltv", 100)  # 期望挽回价值
        })
    
    # 2. 按CATE排序（高到低）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2005.10293，但该号在 arXiv 上是《Predictions of quantum gravity in inflationary cosmology: effects of the Weyl-squared term》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Uplift Modeling for Multiple Treatments with Cost Constraints》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户级输入：user_id、CATE（条件平均干预效应）、CATE 的 95% 置信区间下界、预测 LTV、可选分群标签（Sure_Thing/Persuadable/Lost_Cause/Sleeping_Dog）；外加总干预预算与各干预档位的单位成本。

**输出**：分级干预名单与预算分配方案（卡页示例：Top 100 用户分 5 美元优惠券共 500 美元、次 200 人邮件序列 100 美元、其余轻触达 180 美元、剩余 1,220 美元保留），以及每 1 美元干预成本对应的预期留存价值（卡页示例 4.2 美元）。

## 执行步骤

1. 筛掉 CATE 不为正以及必然转化者、无法挽回者、不要打扰者分群的用户
2. 按 CATE 与预测 LTV 计算期望挽回价值并排序
3. 按各干预档位成本把用户分配到优惠券、邮件序列、轻触达等动作
4. 套用护栏：单批次人数上限、CATE 下限阈值与预算保留比例
5. 输出干预名单、预算分配与预期留存价值

## 边界与不做

- 何时不用：还没有 Uplift 或 CATE 输出时先做建模，本技能只做排序与分配；只要分群画像、不需要名单与预算分配时也不必用。
- 能力边界：只生成名单与预算方案，不执行干预动作；排序质量受 CATE 估计精度限制，卡页指出模型偏差可能导致误触发，需用 A/B 测试验证。
- 合规边界：干预信息须明示告知且可撤销，干预前需获得明确授权，并建立投诉反馈机制与季度合规审计。
- 卡页数字（580 名 CATE>0、预算 2,000 美元、干预 ROI 3-5x、节省 30-50% 成本、月化干预 ROI 320%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Campaign-Auto-Dispatcher.html、Skill-RFM-Campaign-Auto-Dispatcher、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction
- **延伸**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Campaign-Auto-Dispatcher.html、Skill-RFM-Campaign-Auto-Dispatcher、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger
- **可组合**：Skill-RFM-Campaign-Auto-Dispatcher.html、Skill-RFM-Campaign-Auto-Dispatcher、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger、Skill-Uplift-Intervention-Queue-Optimizer

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：06-增长模型　·　源卡：`Skill-Uplift-Intervention-Queue-Optimizer`