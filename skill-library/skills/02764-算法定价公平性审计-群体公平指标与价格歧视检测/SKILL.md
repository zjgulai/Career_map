---
name: "p2s-algorithmic-fairness-in-pricing"
title: "算法定价公平性审计 — 群体公平指标与价格歧视检测"
description: "触发词：定价公平、价格歧视、群体公平指标、显著性检验、合规审计。何时不用：审计推荐曝光的群体差异用「AI 公平性审计」；为欧洲推荐系统交付合规材料用「AI 算法偏见审计」。安全边界：价格与用户数据须按隐私法规脱敏；结论须经法务复核，审计中间结果不得直接对外发布为定价说明。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-036"
l3_business: "算法评估设计"
l3_all: "算法评估设计"
l1_l2_l3: "业务运营/产品与创新/算法评估设计"
p2s_card_id: "Skill-Algorithmic-Fairness-in-Pricing"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "检查动态定价和优惠券分发是否对不同设备、地区或人群给出系统性更高的价格，并输出带显著性检验的审计报告。"
user_try: "试试：审计我们的动态定价，看 Apple 设备用户是否被系统性展示更高价格，给出 p 值和来源分解。"
whenToUse: "定价或促销算法存在差别定价嫌疑、需要量化群体差异与显著性时用本技能；若审计对象是推荐曝光或广告投放的公平性，用「AI 公平性审计」；若要为欧洲市场的推荐系统准备合规文档，用「AI 算法偏见审计」。"
workflow: "收集用户-价格-设备类型-地区-购买时间历史数据（每个群体样本不少于 1,000 次曝光） → 计算各群体的价格均值、中位数与最大均值差异 → 做统计显著性检验并标记 p<0.05 的维度 → 分解歧视来源并输出公平性报告或周期性仪表板"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 算法定价公平性审计 — 群体公平指标与价格歧视检测

## ① 解决的问题

合规运营面临"动态定价算法存在隐性歧视风险、EU AI Act合规存在潜在6%营收罚款"——群体公平审计将歧视率降至阈值以下，年化规避法律风险50万元+

## ② 核心算法逻辑

算法定价公平性审计检测价格模型是否对不同用户群体产生系统性价格歧视，核心关注三类公平指标：

## ③ 业务应用场景

场景A：跨市场动态定价合规审计 - 业务问题：动态定价算法在美国向使用 Apple 设备的用户展示更高价格，收到 FTC 投诉风险 - 数据要求：用户-价格-设备类型-地区-购买时间历史数据，样本量 ≥ 1000 次曝光/群体 - 预期产出：输出公平性报告：各设备类型价格均值差异、统计显著性 p 值、歧视来源分解 - 业务价值：提前发现定价歧视避免监管处罚（EU 罚款可达年营收 6%），合规运营节省潜在法律成本 30 万元+
场景B：促销折扣分发公平性监控 - 业务问题：优惠券定向算法可能系统性向某些邮政编码区域少发优惠，引发歧视投诉 - 数据要求：优惠券分发记录、用户地区数据、人口统计信息（匿名化） - 预期产出：每周自动生成公平性仪表板，标红 p<0.05 的显著差异维度 - 业务价值：主动发现并修复 3 处不公平分发规则，避免集体诉讼风险
**三轨验证** | 成本轨：算法公平性审计月均3000元（技术团队12小时/月+第三方审计工具订阅1500元/月），定价模型优化人工成本800元/月（数据分析2小时/周）| 合规轨：符合《反垄断法》第17条禁止滥用市场支配地位、《消费者权益保护法》第8条公平交易权；需建立定价透明度机制，通过母婴用户留存+15%数据证明算法优化未造成价格歧视，结论：合规可行 | 风险轨：定价算法偏见风险（概率25%）-可能对低收入用户群体产生隐性价格歧视；监管审查风险（概率15%）-市场监管部门对AI定价的合规性抽查；用户信任风险（概率30%）-若算法定价逻辑不透明导致用户流失，抵消留存收益

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免监管处罚（EU AI Act 违规罚款可达年营收 6%），年化法律风险规避 50 万元+
实施难度：⭐⭐⭐☆☆（需要有群体标签数据，检验方法成熟）
优先级：⭐⭐⭐⭐☆
评估依据：欧美市场对算法定价公平性监管趋严，母婴品类涉及弱势群体（孕产期妇女），合规审计是入市前置条件

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（157 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
算法定价公平性审计 — 群体公平性检测与歧视来源分解
"""
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')


def demographic_parity_check(
    prices: np.ndarray,
    groups: np.ndarray,
    threshold: float = 5.0
) -> Dict:
    """统计公平性检测：各群体价格均值差异"""
    unique_groups = np.unique(groups)
    group_stats = {}
    for g in unique_groups:
        mask = groups == g
        group_prices = prices[mask]
        group_stats[g] = {
            "count": int(mask.sum()),
            "mean_price": float(group_prices.mean()),
            "std_price": float(group_prices.std()),
            "median_price": float(np.median(group_prices))
        }

    # 计算最大群体间均值差异
    means = [v["mean_price"] for v in group_stats.values()]
    max_diff = max(means) - min(means)
    is_fair = max_diff <= threshold

    return {
        "group_stats": group_stats,
        "max_mean_diff": round(max_diff, 2),
        "threshold": threshold,
        "is_fair": is_fair,
        "verdict": "✅ 公平" if is_fair else f"❌ 歧视嫌疑（差异 ${max_diff:.2f} > 阈值 ${threshold}）"
    }


def statistical_significance_test(
    prices: np.ndarray,
    groups: np.ndarray
) -> Dict:
    """Mann-Whitney U 检验各群体价格分布是否显著不同"""
    unique_groups = np.unique(groups)
    results = {}
    for i in range(len(unique_groups)):
        for j in range(i + 1, len(unique_groups)):
            g1, g2 = unique_groups[i], unique_groups[j]
            p1 = prices[groups == g1]
            p2 = prices[groups == g2]
            stat, p_val = stats.mannwhitneyu(p1, p2, alternative='two-sided')
            key = f"{g1} vs {g2}"
            results[key] = {
                "p_value": round(float(p_val), 4),
                "significant": p_val < 0.05,
                "mean_diff": round(float(p1.mean() - p2.mean()), 2)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1104.3919。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：用户-价格历史数据：设备类型、地区、购买时间等字段，样本量每个受检群体不少于 1,000 次曝光；促销场景还需优惠券分发记录与匿名化的用户地区数据。

**输出**：公平性审计报告：各群体价格均值 / 中位数差异、统计显著性 p 值、歧视来源分解，以及周期性的公平性仪表板（标红显著差异维度）。

## 执行步骤

1. 收集用户价格历史与群体标签数据
2. 计算各群体价格均值差异
3. 做统计显著性检验并标记显著维度
4. 分解歧视来源并定位问题规则
5. 输出审计报告或周期性公平性仪表板

## 边界与不做

- 受检群体曝光样本不足 1,000 次时不适用，显著性检验没有意义
- 输出是统计意义上的差异证据，不构成法律定性，是否违规须经法务判断
- 价格与用户数据须按隐私法规脱敏，审计中间结果不得直接对外发布为定价说明

## 技能关联

- **前置**：Skill-AI-Algorithmic-Bias-Audit.html、Skill-AI-Algorithmic-Bias-Audit、Skill-AI-Ethics-Fairness-Audit.html、Skill-AI-Ethics-Fairness-Audit、Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring
- **延伸**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring
- **可组合**：Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Algorithmic-Fairness-in-Pricing

---

> 分类：业务运营/产品与创新/算法评估设计　·　技术族：11-AI人文　·　源卡：`Skill-Algorithmic-Fairness-in-Pricing`