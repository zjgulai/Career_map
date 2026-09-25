---
name: "p2s-ppc-bid-manipulation-defense"
title: "PPC Bid Manipulation Defense — 识别竞品恶意点击耗费广告费"
description: "触发词：恶意点击、点击欺诈、预算早耗尽、分时预算、无效点击退款、CVR 异常。何时不用：常规竞价效率与位置优化走投放诊断其他卡；出现预算在黄金时段前耗尽、某时段 CVR 断崖下跌时用本卡。安全边界：只做检测与证据整理，不得对竞品反向点击报复，退款申诉须走平台官方渠道。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-PPC-Bid-Manipulation-Defense"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "发现广告预算被异常点击提前烧完，给出分时预算方案和申诉退款所需的证据。"
user_try: "试试：这是我过去 60 天小时级的广告点击、转化和预算耗尽时间，帮我判断是否存在恶意点击，并给出分时预算方案。"
whenToUse: "与「搜索词否定优化」相比：词级浪费走否定优化；怀疑竞品集中点击导致预算在黄金时段前被耗尽时用本卡做欺诈检测与分时预算。"
workflow: "导出小时级点击、花费、转化报告与每日预算耗尽时间 → 用 CVR 的 Z 分数与预算耗尽时间异常识别欺诈日 → 计算早间点击集中度等指标确认异常模式 → 按异常时段设置小时预算上限并整理申诉材料"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PPC Bid Manipulation Defense — 识别竞品恶意点击耗费广告费

## ① 解决的问题

广告运营面临"$300/天广告预算在上午11点就被耗尽黄金时段失去曝光"——PPC点击欺诈检测+分时预算分配，月GMV提升8-15万元并追讨无效点击退款2-5万元/年

## ② 核心算法逻辑

论文：Click Fraud Detection in Online Advertising: A Data Mining Approach | 年份：2019

## ③ 业务应用场景

场景：某母婴卖家广告预算 $300/天，竞争对手在 9-11 点集中点击，使预算在 11 点耗尽。黄金时段 12-8pm 完全失去广告曝光，销售损失明显。
数据要求：Amazon 广告报告（小时级点击量、花费、转化），过去 60 天历史。
检测应用：识别连续 5 天上午 9-11 点 CVR 仅 0.3%（正常 10%），点击集中爆发。向 Amazon 申请无效点击退款 $450，并设置小时预算分配（上午限额 30%）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

8-15 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（85 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy import stats

def detect_click_fraud(
    clicks: np.ndarray,      # 每小时点击量（过去 N 天 × 24 小时）
    conversions: np.ndarray, # 对应转化量
    budget_exhaust_hours: list,  # 每天预算耗尽时间（小时，如 [18, 17, 11, 10, 11]）
    cvr_baseline: float = 0.10  # 历史正常 CVR
) -> dict:
    """
    PPC 点击欺诈检测
    """
    # 1. CVR 异常检测
    total_clicks = clicks.sum(axis=1)  # 每天总点击
    total_conv = conversions.sum(axis=1)
    daily_cvr = total_conv / (total_clicks + 1e-8)

    cvr_mean = np.mean(daily_cvr)
    cvr_std = np.std(daily_cvr) + 1e-8
    cvr_z_scores = (daily_cvr - cvr_mean) / cvr_std

    # 2. 预算耗尽时间异常（是否早于正常）
    if budget_exhaust_hours:
        exhaust_mean = np.mean(budget_exhaust_hours)
        early_exhaust_days = sum(1 for h in budget_exhaust_hours if h < 12)
        exhaust_anomaly = early_exhaust_days / len(budget_exhaust_hours)
    else:
        exhaust_mean = 18
        exhaust_anomaly = 0

    # 3. 早上点击集中度（9-11点vs全天比例）
    if clicks.shape[1] >= 12:
        morning_clicks = clicks[:, 9:12].sum(axis=1)
        daily_total = clicks.sum(axis=1)
        morning_ratio = morning_clicks / (daily_total + 1e-8)
        morning_ratio_mean = np.mean(morning_ratio)
    else:
        morning_ratio_mean = 0

    # 4. 综合评分
    attack_signals = {
        'low_cvr': (cvr_mean < cvr_baseline * 0.5),
        'early_budget_exhaust': (exhaust_anomaly > 0.4),
        'morning_click_spike': (morning_ratio_mean > 0.35)
    }
    attack_count = sum(attack_signals.values())

    return {
        'attack_detected': attack_count >= 2,
        'attack_signals': attack_signals,
        'avg_cvr': cvr_mean,
        'cvr_drop_pct': (cvr_baseline - cvr_mean) / cvr_baseline * 100,
        'early_exhaust_rate': exhaust_anomaly,
        'morning_click_ratio': morning_ratio_mean,
        'daily_cvr': daily_cvr,
        'cvr_z_scores': cvr_z_scores
    }

# 测试：模拟 PPC 攻击场景
np.random.seed(42)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.12345，但该号在 arXiv 上是《Reinforcement Learning with Policy Mixture Model for Temporal Point Processes Clustering》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Click Fraud Detection in Online Advertising: A Data Mining Approach》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Amazon 广告报告的小时级点击量、花费、转化数据，过去 60 天；另需每日预算耗尽时间与历史正常 CVR 基准（卡页案例为 10%）。

**输出**：欺诈判定结果（异常日期、异常时段、CVR 偏离度）、分时预算分配建议（卡页案例为上午限额 30%）与无效点击退款申诉证据包，供广告运营与风控使用。

## 执行步骤

1. 导出过去 60 天小时级点击、花费、转化与每日预算耗尽时间。
2. 计算每日 CVR 的 Z 分数与预算提前耗尽比例，定位异常日。
3. 统计早间时段点击集中度，交叉验证是否集中爆发。
4. 设置异常时段的小时预算上限，避免黄金时段预算被耗尽。
5. 汇总异常证据向平台申请无效点击退款并跟踪结果。

## 边界与不做

- 何时不用：点击量太小、没有小时级报告或预算本就没耗尽时不要用；季节性流量波动不要误判为欺诈。
- 能力边界：只给检测结论、分时预算与申诉材料，不自动改竞价、不代提交申诉，退款金额以平台裁定为准。
- 安全边界：严禁用于反向点击竞品等报复性操作。

## 技能关联

- **可组合**：Skill-PPC-Bid-Manipulation-Defense

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-PPC-Bid-Manipulation-Defense`