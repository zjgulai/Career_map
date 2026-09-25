---
name: "p2s-tax-evasion-ri[REDACTED]"
title: "Tax Evasion Risk Signal Monitor — 税务合规风险信号监控（VAT/GST 异常）"
description: "触发词：VAT 阈值监控、GST 预警、滚动销售额、注册义务、异常申报信号。何时不用：要自动分类税率并生成申报文件用「VAT/GST 申报自动化」；要处理关税编码与节税路径用「HTS 关税分类与节税」。安全边界：只做阈值与异常信号预警，不构成税务意见；预警结论不得作为延迟或隐瞒申报的依据。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-127"
l3_business: "申报协作"
l3_all: "申报协作 / 税务资料"
l1_l2_l3: "独立控制/财务与合规/申报协作"
p2s_card_id: "Skill-Tax-Evasion-Ri[REDACTED]"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "滚动监控各国销售阈值，在接近或突破 VAT/GST 注册线之前提前预警，留出委托税务代理人完成注册的时间。"
user_try: "试试：用欧洲各站销售报告算 12 个月滚动销售额，看哪些国家接近 VAT 阈值，并预测还有几周会超。"
whenToUse: "需要按国家滚动监控销售阈值、提前触发注册与申报动作时用本技能；自动分类税率并生成申报文件用「VAT/GST 申报自动化」；处理关税编码用「HTS 关税分类与节税」。"
workflow: "按国家汇总月度销售额并统一货币口径 → 计算各国滚动 12 个月销售额与阈值占比 → 用最近三个月均增速外推超阈时间 → 按占比分级发出预警并提示注册动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tax Evasion Risk Signal Monitor — 税务合规风险信号监控（VAT/GST 异常）

## ① 解决的问题

财务合规面临"欧洲FBA销售额快速增长不知道何时触发VAT注册义务"——VAT/GST阈值滚动监控提前6周发出预警完成合规注册，年化规避未申报罚款10-50万元

## ② 核心算法逻辑

论文：Tax Evasion Detection via Anomaly Detection on Tax Declaration Data | 年份：2021

## ③ 业务应用场景

场景：某母婴卖家欧洲 FBA 运营，德国仓销售额快速增长，系统监控显示 12 月滚动销售额已达 €9,200（阈值 €10,000 的 92%），预计 6 周后超阈值。
数据要求：Amazon 欧洲销售报告（按国家分）、FBA 库存所在地记录、货币汇率。
监控告警：系统 6 周前发出黄色预警，运营团队及时委托税务代理人（Tax Representative）完成德国本地 VAT 注册，避免超阈未申报。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10-50 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（115 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from datetime import datetime, timedelta

# 各国税务阈值配置
VAT_THRESHOLDS = {
    'EU_OSS': {'currency': 'EUR', 'amount': 10000, 'period_months': 12, 'label': 'EU OSS'},
    'UK_VAT': {'currency': 'GBP', 'amount': 85000, 'period_months': 12, 'label': 'UK VAT'},
    'AU_GST': {'currency': 'AUD', 'amount': 75000, 'period_months': 12, 'label': 'AU GST'},
    'DE_VAT': {'currency': 'EUR', 'amount': 22000, 'period_months': 12, 'label': 'DE Local VAT'},
}

def monitor_vat_thresholds(
    sales_by_month: dict,  # {'YYYY-MM': {'EU_OSS': amount, 'UK_VAT': amount, ...}}
    current_month: str = None
) -> dict:
    """
    VAT/GST 阈值监控
    """
    months = sorted(sales_by_month.keys())
    if not months:
        return {}

    if current_month is None:
        current_month = months[-1]

    alerts = {}

    for region, config in VAT_THRESHOLDS.items():
        # 计算滚动 12 个月销售额
        period_months = config['period_months']

        # 找到最近 N 个月
        current_idx = months.index(current_month) if current_month in months else len(months) - 1
        start_idx = max(0, current_idx - period_months + 1)
        rolling_months = months[start_idx:current_idx + 1]

        rolling_sales = sum(
            sales_by_month[m].get(region, 0) for m in rolling_months
        )

        threshold = config['amount']
        ratio = rolling_sales / threshold
        weeks_to_threshold = None

        if ratio < 1.0 and ratio > 0.5:
            # 预估超阈时间（基于最近 3 个月月均增速）
            recent_3m = [sales_by_month[m].get(region, 0) for m in rolling_months[-3:]]
            monthly_avg = np.mean(recent_3m) if recent_3m else 0
            if monthly_avg > 0:
                remaining = threshold - rolling_sales
                weeks_to_threshold = (remaining / monthly_avg) * 4.33  # 月转周

        status = 'OK'
        if ratio >= 1.0:
            status = 'BREACH'
        elif ratio >= 0.8:
            status = 'RED'
        elif ratio >= 0.6:
            status = 'YELLOW'
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.05274，但该号在 arXiv 上是《Higher cup products on hypercubic lattices: application to lattice models of topological phases》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Tax Evasion Detection via Anomaly Detection on Tax Declaration Data》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Amazon 欧洲销售报告（按国家分）、FBA 库存所在地记录与货币汇率，粒度到国家与月。

**输出**：各国滚动销售额、阈值占比、预计超阈周数与预警等级（OK、YELLOW、RED、BREACH），供合规团队决定注册与申报时点。

## 执行步骤

1. 按国家汇总月销售额并统一货币
2. 计算各国滚动 12 个月销售额与阈值占比
3. 用最近三个月均增速外推超阈时间
4. 按占比分级发出预警并提示注册动作

## 边界与不做

- 销售未按国家拆分、或缺少对应汇率时不适用，滚动口径无法成立
- 只做阈值与异常信号预警，不代替税务代理完成注册与申报，也不构成税务意见
- 不得以预警结论为由延迟或隐瞒申报；阈值与规则须按各国最新法规核对

## 技能关联

- **可组合**：Skill-Tax-Evasion-Ri[REDACTED]

---

> 分类：独立控制/财务与合规/申报协作　·　技术族：19-风控反欺诈　·　源卡：`Skill-Tax-Evasion-Ri[REDACTED]`