---
name: "p2s-supplier-performance-scorecard"
title: "Supplier Performance Scorecard — 供应商绩效量化追踪系统"
description: "触发词：供应商积分卡、绩效评分、交货准时率、质量合格率、趋势预警。何时不用：需要连续不达标即触发备选供应商切换动作时用供应商预警与备选激活；需要新建供应商四维画像时用供应商本体能力图谱。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supplier-Performance-Scorecard"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "给核心供应商做月度绩效积分卡，评分下滑时提前两三个月预警，避免临时断供。"
user_try: "试试：按交货准时率、质量合格率、响应时长给这 12 家核心供应商做积分卡，并标出连续下滑的供应商。"
whenToUse: "要对在用核心供应商做月度量化评分、评级与下滑趋势预警时用本技能；若已连续不达标并需立刻触发备选供应商切换，用供应商预警与备选激活。"
workflow: "按月录入供应商准时率、质量合格率、响应时长、价格与合规分 → 按权重计算综合得分并映射 A+ 到 D 评级 → 对连续下滑或单月大幅下降项生成黄灯预警 → 输出评级与约谈建议，必要时评估备选供应商分担"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supplier Performance Scorecard — 供应商绩效量化追踪系统

## ① 解决的问题

核心供应商交货准时率悄悄从 97% 降到 88%，没有人发现直到断货损失百万——月度 KPI 积分卡 + 连续下滑趋势预警，提前 2-3 个月识别风险，避免断供损失 30-100 万元

## ② 核心算法逻辑

核心思想：大多数跨境品牌对供应商的评估是"年度打分"——一年只看一次，且主要靠主观印象。当供应商质量开始下滑时（如交期从 98% 准时率悄悄降到 85%），往往要等到断货或大批投诉才发现。供应商绩效追踪系统用月度 KPI 积分卡 + 时序趋势检测，实时掌握每个供应商的绩效动态，提前识别风险。

## ③ 业务应用场景

- 业务现状：某东莞硅胶厂是品牌核心供应商（占吸奶器硅胶件 80%），月初数据显示交货准时率从 97% 悄悄降到 88%，质量合格率从 99% 降到 94%，但负责人没有发现。 - 预警触发： - 交货准时率连续 2 个月下降 → 🟡 黄色预警 - 质量合格率单月下降 5pp → 🟡 预警（边界） - 综合评级从 A+ 降至 B - 管理动作： - 预警触发后约谈供应商负责人，了解内部原因（产能紧张/工人流失） - 同步激活备选供应商（广州另一家），分担 20% 订单 - 3 个月后复评，若仍未改善则正式切换 - 业务价值：提前 2-3 个月发现供应商风险，避免临时断供损失 30-100 万元
三轨验证 | 成本轨：系统部署月均3200元（SaaS订阅1500元+数据分析800元+人工运维900元），人工投入12小时/月，缺货率从12%降至3%，年化降低成本45万（减少滞销品处理费18万+库存持有成本27万），ROI达1400% | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策要求，需建立供应商绩效评估档案并定期审计（每季度1次），合规结论：通过 | 风险轨：供应商交期延误风险（概率25%，影响：补货周期延长3-5天）、数据准确性风险（概率15%，影响：预测偏差±5%）、系统故障风险（概率8%，影响：决策延迟24小时），建议建立预警机制和备用供应商库
**三轨验证** | 成本轨：轻量化方案月均1200元（开源BI工具600元+人工分析600元），人工投入18小时/月，缺货率改善至6%，年化成本节省22万（效果打折50%），ROI达1100% | 合规轨：基础合规，满足平台基本要求但缺少完整的溯源文档和供应商资质管理体系，需补充《供应商准入评估表》和《产品批次追溯记录》，合规结论：条件通过，需3个月内完善 | 风险轨：人工分析主观性强（概率35%，影响：决策偏差±8%）、供应链可视化不足（概率40%，影响：应急响应时间延长至48小时）、数据孤岛风险（概率20%，影响：跨部门协作效率低30%），建议6个月内升级至scenario1方案

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：提前 2-3 个月识别供应商风险，避免断供损失 30-100 万元；年度评估效率提升 80%
实施难度：⭐⭐☆☆☆（低，主要是采购数据整理 + KPI 计算）
优先级：⭐⭐⭐⭐☆（核心供应商数量有限（5-15 家），建立追踪系统一次性投入小收益大）
评估依据：供应商 KPI 积分卡是供应链管理行业标准，时序预警是 Lean 制造中成熟实践

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（85 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/supplier_performance_scorecard` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supplier-Performance-Scorecard.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Dict, Optional

@dataclass
class MonthlyRecord:
    month: str
    on_time_rate: float
    quality_pass_rate: float
    avg_response_hours: float
    price_vs_benchmark: float
    compliance_score: float

@dataclass
class SupplierProfile:
    supplier_id: str
    name: str
    category: str
    history: List[MonthlyRecord] = field(default_factory=list)

WEIGHTS = {"on_time": 0.30, "quality": 0.30, "response": 0.15, "price": 0.15, "compliance": 0.10}

def score_month(record: MonthlyRecord) -> Dict:
    response_score = max(0, 1 - record.avg_response_hours / 48)
    price_score = max(0, 1 - (record.price_vs_benchmark - 1) * 2)
    composite = (record.on_time_rate / 100 * WEIGHTS["on_time"] +
                 record.quality_pass_rate / 100 * WEIGHTS["quality"] +
                 response_score * WEIGHTS["response"] +
                 price_score * WEIGHTS["price"] +
                 record.compliance_score / 100 * WEIGHTS["compliance"])
    grade = "A+" if composite >= 0.95 else "A" if composite >= 0.90 else "B" if composite >= 0.80 else "C" if composite >= 0.70 else "D"
    return {"month": record.month, "composite": round(composite * 100, 1), "grade": grade,
            "on_time": record.on_time_rate, "quality": record.quality_pass_rate,
            "response_score": round(response_score * 100, 1)}

def detect_trend_alerts(supplier: SupplierProfile) -> List[Dict]:
    if len(supplier.history) < 2:
        return []
    scores = [score_month(r) for r in supplier.history]
    alerts = []
    composites = [s["composite"] for s in scores]
    if len(composites) >= 3 and all(composites[-i-1] < composites[-i-2] for i in range(2)):
        alerts.append({"type": "🔴 红色预警", "message": "综合评分连续 3 个月下降",
                        "action": "立即启动备选供应商，准备切换"})
    elif len(composites) >= 2 and composites[-1] < composites[-2]:
        alerts.append({"type": "🟡 黄色预警", "message": "综合评分连续 2 个月下降",
                        "action": "约谈供应商了解原因，设定改善目标"})
    latest = scores[-1]
    prev = scores[-2] if len(scores) >= 2 else latest
    if latest["on_time"] < 85:
        alerts.append({"type": "🚨 紧急", "message": f"交货准时率骤降至 {latest['on_time']}%",
                        "action": "紧急沟通，启动应急备货"})
    if latest["quality"] < 90:
        alerts.append({"type": "🟡 预警", "message": f"质量合格率降至 {latest['quality']}%",
                        "action": "加强入库质检，与品控部门确认原因"})
    return alerts

def generate_scorecard(supplier: SupplierProfile) -> Dict:
    if not supplier.history:
        return {"error": "no data"}
    scores = [score_month(r) for r in supplier.history]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.05679，但该号在 arXiv 上是《Dense and sparse vertex connectivity in networks》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：供应商月度记录：准时交货率、质量合格率、平均响应小时数、相对基准价、合规评分，以及供应商档案（ID、名称、品类与历史记录序列）。

**输出**：月度综合得分、A+ 至 D 评级、分项得分与趋势预警清单，供采购负责人做约谈、分担订单与切换决策。

## 执行步骤

1. 收集供应商月度绩效记录并整理成时序数据
2. 按权重计算各月综合得分并生成评级
3. 检测连续下滑或单月跳变并触发预警
4. 输出预警清单与约谈、分担订单建议

## 边界与不做

- 何时不用：需要阈值一触发就转移订单时用供应商预警与备选激活；新供应商准入评估与证书到期管理用供应商准入认证KPI。
- 能力边界：只做评分、评级与预警，不自动执行订单转移、索赔或供应商切换。
- 数据边界：绩效数据依赖采购与质检台账的完整性和一致性，字段口径不统一会导致评级失真。

## 技能关联

- **前置**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supplier-Performance-Alert-Action.html、Skill-Supplier-Performance-Alert-Action、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence
- **延伸**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Supplier-Performance-Alert-Action.html、Skill-Supplier-Performance-Alert-Action、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence
- **可组合**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Supplier-Performance-Alert-Action.html、Skill-Supplier-Performance-Alert-Action、Skill-Supplier-Performance-Scorecard

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-Supplier-Performance-Scorecard`