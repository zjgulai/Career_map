---
name: "p2s-aigc-revenue-attribution"
title: "AIGC Revenue Attribution — AI内容生成 ROI 财务归因：从内容投入到 GMV 的量化路径"
description: "触发词：AIGC 归因、内容 ROI、双重差分、A/B 归因、内容成本对比。何时不用：要自动发现业务指标间的因果关系用「自动化因果发现」；要按购买意图分层触达用「购买意图预测」。安全边界：A/B 分组与观测数据须真实可追溯，不得为得出替换结论挑选样本或压缩观测期；AI 生成素材的使用须符合平台内容与版权规则。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 增量分析 / 经济性分析"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-AIGC-Revenue-Attribution"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "每月 2000 美元的摄影图换成 50 美元的 AI 图到底亏不亏：用 A/B 加双重差分算清楚。"
user_try: "试试：用 4 周 A/B 数据比较 AI 图与人工图的 CTR、CVR，给出能否全面替换的结论和增量 GMV 归因。"
whenToUse: "当要量化内容投入（AI 图、AI 文案）对 GMV 的真实贡献并做替换决策时用本技能；要自动发现业务指标间因果关系用「自动化因果发现」；要按购买意图分层触达用「购买意图预测」。"
workflow: "设计 A/B：同 ASIN 下 50% 流量看 AI 内容、50% 看人工内容 → 采集 CTR、CVR、退货率与图片相关投诉 → 持续 4 周覆盖工作日与周末 → 用双重差分估计增量效果与置信区间 → 输出替换、混用或保留人工的决策建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AIGC Revenue Attribution — AI内容生成 ROI 财务归因：从内容投入到 GMV 的量化路径

## ① 解决的问题

品牌每月花2000美元请摄影师但不知道AI图片50美元能否替代——DiD+A/B双轨归因量化AIGC内容对GMV的真实贡献，验证AI图CVR差距若小于5%可全面替换年化节省内容成本17万元以上

## ② 核心算法逻辑

AIGC 内容的财务归因面临"最后一公里"问题：用户看到 AI 生成的产品图片 → 点击 → 购买，但购买归因给了广告平台，内容的作用被稀释。因果归因框架解决这个问题：

## ③ 业务应用场景

业务问题：品牌每月花 $2000 请摄影师拍吸奶器产品图，同时用 Midjourney 生成图片花费 $50。AI 图的质量"看起来差不多"，但不知道用 AI 图是否会损失转化率，还是可以全面替换。
数据要求： - A/B 测试设计：50% 流量看 AI 图，50% 看人工图（同 ASIN，不同 A+ 内容） - 关键指标：CTR、CVR、退货率、评论中的图片相关投诉 - 持续时间：建议 4 周（覆盖工作日/周末）
预期产出： - AI 图 vs 人工图的 CTR/CVR 对比（含置信区间） - 每月内容成本对比：$2000 vs $50 - 增量 GMV/成本比：AI 图的真实内容 ROI - 决策建议：全替换/混用/某些品类保留人工

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
验证 AI 图可替换人工（CVR 差距 <5%）：年化内容成本节省 ¥10-20 万
AIGC 文案批量优化的 GMV 增量归因：年化 ¥20-50 万
避免盲目投入昂贵人工内容（无ROI证明时）：年化节省 ¥10-30 万
年化综合 ROI：¥30-100 万
实施难度：⭐⭐☆☆☆（A/B 测试框架 + DiD 计算；需要 Amazon A+ Content A/B 或独立站 CRO 工具支持）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（129 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ai_humanities/aigc_revenue_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-AIGC-Revenue-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AIGC Revenue Attribution
AI 内容生成 ROI 财务归因：DiD + A/B 双轨量化
"""
import numpy as np
from scipy import stats


def ab_test_content_roi(
    ai_clicks, ai_conversions, ai_impressions,
    human_clicks, human_conversions, human_impressions,
    avg_order_value=89.99, ai_content_cost=50.0, human_content_cost=2000.0,
    confidence=0.95
):
    """A/B 检验：AI内容 vs 人工内容的 CVR 和 ROI 对比"""
    ai_ctr = ai_clicks / ai_impressions if ai_impressions > 0 else 0
    human_ctr = human_clicks / human_impressions if human_impressions > 0 else 0
    ai_cvr = ai_conversions / ai_clicks if ai_clicks > 0 else 0
    human_cvr = human_conversions / human_clicks if human_clicks > 0 else 0

    # 比例 Z-test（CVR 显著性检验）
    pooled_cvr = (ai_conversions + human_conversions) / (ai_clicks + human_clicks)
    se = np.sqrt(pooled_cvr * (1 - pooled_cvr) * (1/ai_clicks + 1/human_clicks))
    z_stat = (ai_cvr - human_cvr) / (se + 1e-10)
    p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
    significant = p_value < (1 - confidence)

    # ROI 计算
    ai_revenue = ai_conversions * avg_order_value
    human_revenue = human_conversions * avg_order_value
    ai_roi = (ai_revenue - ai_content_cost) / ai_content_cost if ai_content_cost > 0 else 0
    human_roi = (human_revenue - human_content_cost) / human_content_cost if human_content_cost > 0 else 0

    # 年化内容成本节省
    annual_cost_saving = (human_content_cost - ai_content_cost) * 12

    return {
        'ai_ctr': round(ai_ctr, 4), 'human_ctr': round(human_ctr, 4),
        'ai_cvr': round(ai_cvr, 4), 'human_cvr': round(human_cvr, 4),
        'cvr_delta': round(ai_cvr - human_cvr, 4),
        'cvr_delta_pct': round((ai_cvr - human_cvr) / (human_cvr + 1e-8) * 100, 2),
        'p_value': round(p_value, 4),
        'significant': significant,
        'ai_revenue': round(ai_revenue, 2),
        'human_revenue': round(human_revenue, 2),
        'ai_content_roi': round(ai_roi, 2),
        'human_content_roi': round(human_roi, 2),
        'annual_cost_saving': round(annual_cost_saving, 2),
    }


def did_listing_copy_attribution(
    treated_before, treated_after,
    control_before, control_after,
    avg_order_value=89.99, copy_cost=50.0
):
    """
    双重差分：AI 文案优化对 GMV 的净效应
    treated: 被 AIGC 优化的 SKU 组
    control: 未优化的同期对照 SKU 组
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2502.08834，但该号在 arXiv 上是《Rex: A Family of Reversible Exponential (Stochastic) Runge-Kutta Solvers》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：A/B 测试设计（卡页示例为同 ASIN 下 50% 流量看 AI 图、50% 看人工图）、关键指标（CTR、CVR、退货率、图片相关投诉）、建议持续 4 周覆盖工作日与周末；粒度为 ASIN × 内容版本 × 观测周期。

**输出**：AI 与人工内容的 CTR、CVR 对比（含置信区间）、内容成本对比与增量 GMV 与成本比，以及替换、混用或保留人工的决策建议；供品牌与增长团队做内容预算决策。

## 执行步骤

1. 设计同 ASIN 下 AI 内容与人工内容的 A/B 分流
2. 采集 CTR、CVR、退货率与图片相关投诉
3. 按 4 周周期覆盖工作日与周末持续观测
4. 用双重差分估计增量效果并给出置信区间
5. 输出全面替换、混用或保留人工的决策建议

## 边界与不做

- 数据不满足：无法做 A/B 分流、或观测期不足一个完整周期时归因不成立，先补实验设计。
- 何时不用：要自动发现指标间因果关系用「自动化因果发现」；要按购买意图分层触达用「购买意图预测」。
- 能力边界：只做内容投入的归因测算，不产出图片或文案素材，也不保证卡页口径的成本节省幅度。
- 安全边界：A/B 与观测数据须真实可追溯，不得为得出替换结论挑选样本或压缩观测期；AI 素材使用须符合平台内容与版权规则。

## 技能关联

- **前置**：Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **延伸**：Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis
- **可组合**：Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-AIGC-Revenue-Attribution

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：11-AI人文　·　源卡：`Skill-AIGC-Revenue-Attribution`