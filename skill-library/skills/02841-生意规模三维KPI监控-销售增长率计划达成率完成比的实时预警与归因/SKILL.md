---
name: "p2s-business-scale-kpi-growth-achievement"
title: "生意规模三维KPI监控 — 销售增长率/计划达成率/GMV完成比的实时预警与归因"
description: "触发词：GMV 完成比、计划达成率、销售增长率、差异分解、旺季追踪。何时不用：要做异常根因路径溯源用「ProRCA」；要做用户价值预测与财务桥接用「用户 LTV 财务桥」。安全边界：达成率与预测准确率是两个不同管理维度，不得混用于同一激励或考核口径。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-001"
l3_business: "经营目标拆解"
l3_all: "经营目标拆解 / GMV归因分析"
l1_l2_l3: "经营管理/经营与组织/经营目标拆解"
p2s_card_id: "Skill-Business-Scale-KPI-Growth-Achievement"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "同时盯销售增长率、计划达成率和 GMV 完成比，落后时用差异分解指出是流量还是转化的问题。"
user_try: "试试：Q4 目标 50 万，大促第一天只做了 3.2 万，帮我分解是流量还是转化率的问题并给干预建议。"
whenToUse: "当要在大促或月度节奏中实时追踪目标达成、并在落后时定位差距来源时用本技能；要做异常根因路径溯源，用「ProRCA」；要做用户生命周期价值与财务预测，用「用户 LTV 财务桥」。"
workflow: "实时计算销售增长率、计划达成率与 GMV 完成比 → 按阈值判断是否落后并触发预警 → 用 Shapley 做流量、转化率、客单价三维差异分解 → 定位主要差距维度并给出干预建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 生意规模三维KPI监控 — 销售增长率/计划达成率/GMV完成比的实时预警与归因

## ① 解决的问题

运营团队混淆达成率与预测准确率导致错误激励设计——生意规模三维KPI（增长率/达成率/GMV完成比）+ Shapley差异分解将大促GMV干预决策精准度提升40%，书中特别强调两者是完全不同的管理维度

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：生意规模KPI是供应链"结果层"的三维表达——增长率衡量相对速度，达成率衡量计划执行力，GMV完成比衡量目标兑现度。书中特别强调：达成率与预测准确率是不同的计算逻辑——达成率可以100%（超额），预测准确率不会超过100%（偏差越小越好）。这两个指标反映的管理维度完全不同，混淆使用是供应链管理的常见错误。

## ③ 业务应用场景

场景A：Amazon旺季GMV目标实时追踪
- 业务问题：某母婴品牌Q4 GMV目标$50万，大促第1天结束只完成$3.2万（完成比6.4%），但团队不知道是流量问题还是转化率问题 - 三维KPI监控方案： 1. 实时计算：GMV完成比 = $3.2万/$50万 = 6.4%（正常第1天目标8-10%）→ 轻度落后 2. 差异分解：流量-15%（竞品广告挤压），转化率+3%（页面优化有效），客单价-2%（折扣影响） 3. 主要差距=流量，立即决策：提高SP广告出价15% - 预期产出：精准归因后的干预比盲目加预算效率高40%，大促GMV最终完成92%
三轨验证： - 成本：需接入Amazon广告API（SP/SB广告花费与流量数据）和店铺后台GMV实时接口，数据采集与计算资源成本约$500/月（含第三方工具订阅费）；人力投入为运营人员每日30分钟监控。 - 合规：符合Amazon广告政策（SP广告出价调整属正常操作）；不涉及GDPR敏感数据（仅使用聚合级GMV与广告指标）；未触碰广告法红线（无虚假宣传或价格误导）。 - 风险：提高SP广告出价可能引发竞品价格战（同类目广告CPC上升10-20%），需设置出价上限（不超过ACOS阈值35%）；若流量差距由平台算法变动导致，盲目加预算可能造成广告浪费，建议先做A/B测试（小预算验证转化率后再放量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月GMV$100万卖家，通过Shapley归因精准干预（而非盲目加预算），大促期间额外挽回GMV约$8-15万；达成率监控系统建设$1万，ROI>800%
实施难度：⭐⭐☆☆☆（计算逻辑简单，关键是准确获取计划数和实际数；差异分解需要流量/转化率/客单价三维拆分数据）
优先级：⭐⭐⭐⭐⭐（生意规模是供应链的最终结果指标，所有供应链优化都应以提升GMV达成率为目标；书中专章强调）
适用规模：所有规模卖家，月GMV>$3万即可受益；大促场景ROI尤其高
数据依赖：历史销售数据（月度/周度）、计划目标数据、流量/转化率/客单价三维拆分

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（233 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unexpected unindent）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/business_scale_kpi_growth_achievement` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Business-Scale-KPI-Growth-Achievement.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
生意规模三维KPI监控系统
功能：增长率/达成率/GMV完成比实时计算 + Shapley差异分解
基于《全链路管理》陈凤霞 第二章第二节
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


class BusinessScaleKPI:
    """生意规模三维KPI计算器"""

    @staticmethod
    def growth_rate(current: float, base: float, mode: str = 'yoy') -> Dict:
        """计算增长率"""
        if base <= 0:
            return {'rate': None, 'status': 'N/A', 'message': '基期为零'}
        rate = (current - base) / base
        status = '🟢增长' if rate > 0.1 else ('🟡持平' if rate >= -0.05 else '🔴下滑')
        return {
            'current': current,
            'base': base,
            'rate': rate,
            'rate_pct': f"{rate:.1%}",
            'status': status,
            'mode': mode,
        }

    @staticmethod
    def achievement_rate(actual: float, plan: float) -> Dict:
        """计算计划达成率（注意：不同于预测准确率）"""
        if plan <= 0:
            return {'rate': None, 'status': 'N/A'}
        rate = actual / plan
        # 达成率可超100%
        if rate >= 1.0:
            status = '✅超额完成'
        elif rate >= 0.95:
            status = '🟢达成'
        elif rate >= 0.90:
            status = '🟡轻度未达'
        elif rate >= 0.80:
            status = '🟠未达'
        else:
            status = '🔴严重未达'
        return {
            'actual': actual,
            'plan': plan,
            'rate': rate,
            'rate_pct': f"{rate:.1%}",
            'gap': actual - plan,
            'gap_pct': f"{(actual-plan)/plan:.1%}",
            'status': status,
        }

    @staticmethod
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史销售数据（月度或周度）、计划目标数据，以及流量、转化率、客单价三维拆分的实时数据（可接广告 API 与店铺后台实时接口）。

**输出**：三维 KPI 的实时数值与预警，以及 Shapley 差异分解结果与干预建议；供运营与管理者决策。

## 执行步骤

1. 实时计算销售增长率、计划达成率与 GMV 完成比
2. 按阈值判断是否落后并触发预警
3. 用 Shapley 做流量、转化率、客单价三维差异分解
4. 定位主要差距维度并给出干预建议（如调整广告出价并设上限）

## 边界与不做

- 数据不满足：计划数或实际数口径不准、三维拆分缺失时差异分解失效，先对齐口径。
- 何时不用：要做根因路径溯源用「ProRCA」；要做用户 LTV 与资金预测用「用户 LTV 财务桥」；只做月度复盘叙述用「LLM 商业智能推理」。
- 能力边界：输出指标监控与差异分解结论，不执行加预算、改价等动作。
- 安全边界：达成率与预测准确率属不同管理维度，不得混用于同一激励或考核口径；加预算动作需设出价上限（如 ACOS 阈值）。

## 技能关联

- **前置**：Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Logistics-Plan-Three-Dimension-Accuracy.html、Skill-Logistics-Plan-Three-Dimension-Accuracy、Skill-Nonlinear-Multi-Touch-Attribution.html、Skill-Nonlinear-Multi-Touch-Attribution、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness.html、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **延伸**：Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Logistics-Plan-Three-Dimension-Accuracy.html、Skill-Logistics-Plan-Three-Dimension-Accuracy、Skill-Nonlinear-Multi-Touch-Attribution.html、Skill-Nonlinear-Multi-Touch-Attribution、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness.html、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation
- **可组合**：Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Logistics-Plan-Three-Dimension-Accuracy.html、Skill-Logistics-Plan-Three-Dimension-Accuracy、Skill-Nonlinear-Multi-Touch-Attribution.html、Skill-Nonlinear-Multi-Touch-Attribution、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness.html、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness、Skill-Business-Scale-KPI-Growth-Achievement

---

> 分类：经营管理/经营与组织/经营目标拆解　·　技术族：04-供应链　·　源卡：`Skill-Business-Scale-KPI-Growth-Achievement`