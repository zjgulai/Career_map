---
name: "p2s-index-health-monitoring"
title: "索引健康度监控 — 全链路搜索索引覆盖率与收录状态追踪"
description: "触发词：索引健康度、收录状态追踪、关键词收录率、索引异常预警、新品收录巡检。何时不用：要判断的是自然流量与广告流量解耦造成的压制时用「Listing 压制检测」；要监控品类节点竞争度时用「品类树节点竞争密度优化」。安全边界：只诊断收录与索引状态，不改 Listing、不代提交平台工单。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Index-Health-Monitoring"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "每天给每个 ASIN 的收录情况打分，新品上架后没被收录、某个词没进索引，几小时内就能发现。"
user_try: "试试：给这批 ASIN 和目标关键词算索引健康分，把健康分低于 0.7 的 SKU 排成优先处理队列。"
whenToUse: "当新品上架后搜索流量为零、需要判断是否被收录、或要批量巡检多个 ASIN × 关键词的收录状态时用本技能；若要判断的是 Listing 被算法压制，用「Listing 压制检测」；若要监控的是品类节点竞争度，用「品类树节点竞争密度优化」。"
workflow: "配置 ASIN 与目标关键词，接入 Seller Central 报告 API → 算抓取覆盖、收录比例与关键词收录率合成健康分 → 滑动窗口检测健康分异常并标出低分 SKU → 输出每日报告与优先处理队列"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 索引健康度监控 — 全链路搜索索引覆盖率与收录状态追踪

## ① 解决的问题

运营面临"新品上架后搜索流量为零、不知是否已被索引"——健康度监控将索引问题发现延迟从3天缩短至4小时，年化减少错失销售20-50万元

## ② 核心算法逻辑

索引健康度监控（Index Health Monitoring）源自信息检索领域的覆盖率评估方法，将搜索引擎的抓取解析索引三阶段拆解为可量化的健康指标体系。核心指标包括：

## ③ 业务应用场景

场景A：吸奶器 Listing 索引异常检测 - 业务问题：新品上架后 72 小时搜索流量为零，不知道是否已被索引 - 数据要求：ASIN 列表、目标关键词列表、Seller Central 报告 API 数据 - 预期产出：每日索引健康分报告，识别未收录关键词（精度 ≥ 95%），平均发现延迟 < 4 小时 - 业务价值：提前发现索引问题，避免新品前7天流量损失，年化减少错失销售约 15-30 万元
场景B：多 SKU 批量索引状态巡检 - 业务问题：100+ SKU 日常巡检，人工抽查效率低，容易漏报 - 数据要求：全量 ASIN × 关键词矩阵，历史排名快照数据 - 预期产出：自动标记健康分 < 0.7 的 SKU，生成优先处理队列 - 业务价值：运营效率提升 60%，索引问题平均修复周期从 3 天缩短到 1 天
三轨验证 | 成本轨：月均成本1,200元（A9算法监测工具600元/月+数据分析师12小时/月×100元/小时），首期投入3,500元（系统集成+培训） | 合规轨：符合《电商平台搜索流量管理规范》和《跨境电商商品信息披露标准》，需获得平台官方API接入授权，建议备案存档所有优化策略日志 | 风险轨：算法更新导致优化失效（概率35%，影响周期2-4周）；过度优化触发平台反作弊机制被降权（概率12%，恢复周期30天）；竞品跟风导致流量增长放缓（概率60%，3个月内）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：100 SKU 规模，年化减少索引问题导致的流量损失约 20-50 万元；运营人天节省 ≈ 0.5 人/月
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：新品前7天索引状态直接决定 BSR 起点，一旦错过索引窗口补救成本是原来的3倍；实施只需 Seller Central API + 标准 Python

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（93 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

def compute_index_health_score(
    crawl_coverage: float,
    index_ratio: float,
    keyword_indexation_rate: float,
    weights: Tuple[float, float, float] = (0.3, 0.3, 0.4)
) -> float:
    """计算索引健康分 H = alpha*CR + beta*IR + gamma*KIS"""
    alpha, beta, gamma = weights
    score = alpha * crawl_coverage + beta * index_ratio + gamma * keyword_indexation_rate
    return round(score, 4)

def detect_anomaly(history: List[float], current: float, window: int = 7, sigma: float = 2.0) -> Dict:
    """滑动窗口异常检测：当前值是否超出基线±2σ"""
    if len(history) < window:
        return {"anomaly": False, "reason": "history_insufficient"}
    
    recent = history[-window:]
    baseline = np.mean(recent)
    std = np.std(recent)
    lower = baseline - sigma * std
    upper = baseline + sigma * std
    
    is_anomaly = current < lower
    return {
        "anomaly": is_anomaly,
        "current": current,
        "baseline": round(baseline, 4),
        "lower_bound": round(lower, 4),
        "upper_bound": round(upper, 4),
        "deviation_sigma": round((current - baseline) / (std + 1e-8), 2)
    }

def build_index_health_report(sku_data: pd.DataFrame) -> pd.DataFrame:
    """
    输入 DataFrame 列：asin, date, crawl_coverage, index_ratio, keyword_indexation_rate
    输出：每 ASIN 最新健康分 + 异常标记
    """
    results = []
    for asin, group in sku_data.groupby("asin"):
        group = group.sort_values("date")
        history_scores = []
        for _, row in group.iterrows():
            h = compute_index_health_score(
                row["crawl_coverage"],
                row["index_ratio"],
                row["keyword_indexation_rate"]
            )
            history_scores.append(h)
        
        current_score = history_scores[-1]
        anomaly_info = detect_anomaly(history_scores[:-1], current_score)
        
        results.append({
            "asin": asin,
            "date": group["date"].iloc[-1],
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2106.04476。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：ASIN 列表、目标关键词列表、Seller Central 报告 API 数据（抓取覆盖率、收录比例、关键词收录率）与历史排名快照；粒度为 ASIN × 关键词 × 日。

**输出**：每日索引健康分报告（健康分 H = 0.3×抓取覆盖 + 0.3×收录比例 + 0.4×关键词收录率）、未收录关键词清单、健康分低于 0.7 的优先处理队列；供站点运营按队列修复。

## 执行步骤

1. 配置 ASIN 清单与目标关键词列表，接入 Seller Central 报告 API
2. 计算抓取覆盖率、收录比例与关键词收录率，合成索引健康分
3. 用滑动窗口（卡页示例 ±2σ）检测健康分异常并标记健康分 <0.7 的 SKU
4. 输出每日索引健康报告与未收录关键词清单
5. 生成优先处理队列并跟踪修复周期

## 边界与不做

- 数据不满足：拿不到 Seller Central 报告 API 的抓取与收录数据时无法计算健康分，只能退回人工抽查。
- 何时不用：要判断的是自然流量与广告流量解耦造成的压制而非索引收录，用「Listing 压制检测」；要监控的是品类节点归属竞争度，用「品类树节点竞争密度优化」。
- 能力边界：只诊断收录与索引状态，不改 Listing、不代提交平台工单；卡页的识别精度 ≥95%、发现延迟 <4 小时、年化减少错失销售 20-50 万元为案例口径。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Agentic-AB-Testing.html、Skill-Agentic-AB-Testing、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Search-Share-of-Voice.html、Skill-Search-Share-of-Voice
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Agentic-AB-Testing.html、Skill-Agentic-AB-Testing、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Search-Share-of-Voice.html、Skill-Search-Share-of-Voice
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Agentic-AB-Testing.html、Skill-Agentic-AB-Testing、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Index-Health-Monitoring

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Index-Health-Monitoring`