---
name: "p2s-sponsored-organic-rank-synergy"
title: "Skill-Sponsored-Organic-Rank-Synergy — 广告-自然排名协同模型"
description: "触发词：广告自然协同、排名攻坚、ACOS 下降、阶段策略、自然流量、竞价降档。何时不用：量化广告对自然排名的滞后溢出用 Panel DiD 那张卡；要在具体关键词上分阶段把排名顶上去再降竞价时用本卡。安全边界：须遵守平台搜索算法规范，保留优化日志备查，严禁黑帽刷单或任何操纵排名的手段。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Sponsored-Organic-Rank-Synergy"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "用广告先把关键词排名顶上去，等自然流量接住后再逐步降竞价，把 ACOS 压下来。"
user_try: "试试：关键词 baby bottle bpa free 现在 ACOS 42%、自然排名 #85，帮我制定攻坚持续 12 周的广告-自然协同降 ACOS 方案。"
whenToUse: "与「搜索位置点击弹性」相比：位置弹性算单次加预算的收益与竞价上限；要按周分阶段推进排名、并规划何时降竞价时用本卡。"
workflow: "选定核心词，记录当前 ACOS 与自然排名基线 → 攻坚期用 Exact Match 提价冲单量，观察自然排名变化 → 巩固期在排名上升后逐步下调竞价 → 收割期让自然流量主导，广告仅作补充并复盘 ACOS"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Sponsored-Organic-Rank-Synergy — 广告-自然排名协同模型

## ① 解决的问题

运营面临"广告和自然排名各自独立优化效果差"——协同模型将同等广告预算下自然流量贡献从30%提升至52%，年化降低获客成本25%

## ② 核心算法逻辑

论文：Search Advertising and Organic Search Interaction | 年份：2009

## ③ 业务应用场景

场景：婴儿奶瓶核心词从广告依赖转向自然流量主导
- 业务问题：「baby bottle bpa free」词广告 ACOS 42%，纯靠广告不可持续，但自然排名仅 #85 - 数据要求：过去30天 PPC 数据（Search Term Report）、Helium10 排名追踪、月预算 $3,000 - 执行方案： - 攻坚期：「baby bottle bpa free」 Exact Match 提价至 $2.5，日出 15-20 单 - 6周后自然排名从 #85 → #28，广告竞价降至 $1.2 - 12周后自然排名 #12，广告仅作补充，月 ACOS 降至 18% - 量化产出：ACOS 从 42% → 18%，同等月销量下广告费从 
三轨验证 | 成本轨：月均投入3,200元（A9关键词竞价优化工具订阅800元/月+人工分析12小时/月×200元/小时=2,400元），ROI预期4.2:1，自然流量提升成本约0.95元/UV | 合规轨：符合亚马逊A9搜索算法官方指南，不涉及黑帽SEO；需遵守《跨境电商平台服务协议》第8.2条关于搜索排名优化的合规要求，建议保留优化日志备查 | 风险轨：账户关联风险（概率12%，多账户同时优化易触发风控），排名波动风险（概率35%，算法更新导致排名下滑），投入产出周期风险（概率8%，见效周期4-6周）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：广告-自然协同后 ACOS 从 42% → 18%，年化节省广告费约 2-5 万元/品
实施难度：⭐⭐⭐☆☆（需要 12-16 周耐心执行，监控体系要完备）
优先级：⭐⭐⭐⭐⭐（成熟品高 ACOS 的核心解法，投入产出比极高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（92 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

def estimate_organic_rank_improvement(
    ppc_orders: float,
    ppc_cvr: float,
    keyword_relevance: float = 0.8,
    beta: Tuple[float, float, float] = (-3.2, -15.0, -5.0)
) -> float:
    """估算 PPC 带动的自然排名提升（负值=排名数字变小=排名提升）"""
    b1, b2, b3 = beta
    delta = b1 * np.log1p(ppc_orders) + b2 * ppc_cvr + b3 * keyword_relevance
    return round(delta, 1)

def simulate_synergy_phases(
    initial_organic_rank: int = 85,
    initial_ppc_budget: float = 3000,
    initial_ppc_cvr: float = 0.08,
    weeks: int = 16
) -> pd.DataFrame:
    """模拟三阶段广告-自然协同演化"""
    rows = []
    organic_rank = initial_organic_rank
    ppc_budget = initial_ppc_budget
    
    for week in range(1, weeks + 1):
        # 阶段判断
        if week <= 4:
            phase = "攻坚期"
            bid_multiplier = 1.5
        elif week <= 8:
            phase = "巩固期"
            bid_multiplier = 1.0
        else:
            phase = "收割期"
            bid_multiplier = 0.5
        
        # 当期 PPC 订单估算（预算/CPC/CVR）
        effective_budget = ppc_budget * bid_multiplier
        cpc_est = 1.5 + 0.5 * bid_multiplier
        clicks = effective_budget / cpc_est
        ppc_orders = clicks * initial_ppc_cvr * (1 + 0.1 * week / weeks)
        
        # 自然排名改善
        delta = estimate_organic_rank_improvement(ppc_orders, initial_ppc_cvr)
        organic_rank = max(1, organic_rank + delta * 0.3)  # 累积衰减
        
        # 自然流量估算（排名 → 流量经验公式）
        organic_traffic_share = max(0, (200 - organic_rank) / 200) ** 2
        
        # P1 存在度
        p1_presence = min(1.0, (bid_multiplier * 0.5) + organic_traffic_share)
        
        rows.append({
            "week": week,
            "phase": phase,
            "organic_rank": round(organic_rank, 0),
            "ppc_budget_effective": round(effective_budget, 0),
            "ppc_orders": round(ppc_orders, 1),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:0904.1234，但该号在 arXiv 上是《Mapping the evolution of scientific fields》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Search Advertising and Organic Search Interaction》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去 30 天 PPC 数据（Search Term Report）、第三方排名追踪数据、月广告预算（卡页 $3,000）与核心词的当前 ACOS 和自然排名基线。

**输出**：分阶段（攻坚/巩固/收割）的出价与预算安排、各阶段自然排名目标与 ACOS 预期（卡页 42%→18%）以及 12–16 周复盘节点，供运营执行。

## 执行步骤

1. 选定核心词，记录当前 ACOS 与自然排名作为基线。
2. 攻坚期提高 Exact Match 竞价冲单量，带动自然排名上升。
3. 排名进入目标区间后进入巩固期，逐步下调竞价。
4. 收割期以自然流量为主，广告退为补充并控制花费。
5. 复盘每周排名与 ACOS，未达预期则回到上一阶段。

## 边界与不做

- 何时不用：关键词刚起量、自然排名没基础，或预算不足以支撑 4 周以上冲击时不要用；只想做单次竞价调整不必上分阶段方案。
- 能力边界：产出阶段策略与目标值，不自动改价；卡页 ACOS 42%→18%、自然 #85→#12 为单案例，见效周期 4–6 周起。
- 安全边界：严禁刷单、黑帽 SEO 或任何操纵排名的手段，须留存优化日志备查。

## 技能关联

- **前置**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Search-Funnel-Attribution.html、Skill-Search-Funnel-Attribution、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity、Skill-Search-Query-Performance-Attribution.html、Skill-Search-Query-Performance-Attribution、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity、Skill-Search-Query-Performance-Attribution.html、Skill-Search-Query-Performance-Attribution、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Query-Performance-Attribution.html、Skill-Search-Query-Performance-Attribution、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Sponsored-Organic-Rank-Synergy

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Sponsored-Organic-Rank-Synergy`