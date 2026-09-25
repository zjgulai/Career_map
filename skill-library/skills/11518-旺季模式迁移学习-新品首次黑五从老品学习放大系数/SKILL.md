---
name: "p2s-seasonal-pattern-transfer-learning"
title: "旺季模式迁移学习 — 新品首次黑五从老品学习放大系数"
description: "触发词：旺季迁移、黑五备货、放大系数、相似兄弟品、余弦相似度。何时不用：本 SKU 已有旺季历史时直接建模；要跨市场需求分布迁移时用「最优传输跨市场迁移」。安全边界：仅使用自有历史销量数据，不抓取竞品数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Seasonal-Pattern-Transfer-Learning"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "新品第一次过黑五没有旺季历史，就从最像的老品借放大倍数，把首次旺季备货误差压下来。"
user_try: "试试：用那几款老推车的旺季形态，帮我给 9 月上线的新款算黑五放大系数和备货安全系数。"
whenToUse: "新 SKU 首次面对旺季、无旺季历史但有同品类老品可借时用；本 SKU 有旺季历史则直接建模；跨市场分布迁移用最优传输跨市场迁移。"
workflow: "整理同品类 3-5 款老品各 14 个月以上周销量（含至少 1 次旺季） → 用余弦相似度挑出最相似的兄弟品 → 把旺季放大系数映射到新品并给出区间估计 → 输出旺季日销量预测与备货安全系数"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 旺季模式迁移学习 — 新品首次黑五从老品学习放大系数

## ① 解决的问题

新品负责人面临"新品首次面对黑五完全没有旺季历史不知道该备多少货"——旺季模式迁移从同类老品将首次旺季备货误差降低60%，年化避损$6.8万

## ② 核心算法逻辑

来自 MTL/迁移学习，迁移逻辑是： 旺季（黑五/Prime Day）的需求放大模式在同品类 SKU 间高度相似——放大倍数、持续天数、衰减斜率等形态特征具有可迁移性。新品无历史旺季，但可通过余弦相似度从老品中找到「最相似兄弟品」，将其旺季放大系数直接映射到新品上。

## ③ 业务应用场景

场景：新款婴儿推车首次迎战黑五 - 业务问题：新款婴儿推车 9 月上线，11 月黑五是上线后首个大促节点，无旺季历史数据，按平时趋势备货导致黑五严重断货，损失 $6.8 万。 - 数据要求：同品类 3-5 款老推车各自 ≥14 个月数据（含至少 1 次黑五）；新 SKU 近 6-8 周周销量。 - 预期产出：黑五期间（-7天 到 +14天）日销量预测，含放大系数区间估计，备货安全系数建议。 - 业务价值：首次旺季备货误差降低 60%，年化避免断货/积压损失 $6.8 万。
三轨验证： - 成本：数据采集需从 ERP/Amazon 后台拉取老 SKU 14 个月周销量（约 5 人天开发）；计算资源极低（单次推理 <1 秒）；人力投入为 1 名数据分析师 2 天。 - 合规：不触碰 Amazon 政策红线（仅使用自有历史销量数据，不涉及竞品数据抓取）；不涉及 GDPR 个人数据；不违反广告法。 - 风险：若老品放大系数受当年特殊事件（如竞品断货、平台限流）影响，迁移结果可能失真；新品基础量估计偏差可能导致备货仍不足；无价格战或品牌损伤风险。
场景：Prime Day 策略预演 - 上半年新品在 Prime Day 前用迁移放大系数制定备货计划，同时据此设置广告预算上限，避免 ACOS 在大促期间失控。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：首次旺季备货误差降低 60%，年化避免断货/积压损失 $6.8 万（含缺货机会成本+过备货仓储成本）
适用规模：每年上新 ≥10 个 SKU 且有旺季备货压力的跨境卖家
实施难度：⭐⭐☆☆☆（核心依赖历史数据，算法轻量，numpy 即可）
优先级：⭐⭐⭐⭐⭐（旺季断货是跨境卖家最痛的场景，每年周期性发生）
见效周期：旺季前 4-6 周部署，可在当季验证效果

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（111 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/seasonal_pattern_transfer_learning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Seasonal-Pattern-Transfer-Learning.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from sklearn.preprocessing import normalize

np.random.seed(2024)

# ── 合成数据：老 SKU（含旺季历史）+ 新 SKU（无旺季）─────────────────────
def make_sku_with_holiday(base_demand, amp_factor, n_weeks=60, holiday_week=52):
    """生成含旺季的 SKU 周需求数据"""
    weeks = np.arange(n_weeks)
    # 基础趋势 + 噪声
    y = base_demand * (1 + 0.005 * weeks) + np.random.randn(n_weeks) * base_demand * 0.1
    # 旺季放大：以 holiday_week 为峰值，前 4 周预热，后 3 周衰减
    for w in range(max(0, holiday_week - 4), min(n_weeks, holiday_week + 4)):
        dist = abs(w - holiday_week)
        y[w] *= (amp_factor * np.exp(-0.3 * dist))
    return np.maximum(y, 0.1)

# 4 个老 SKU（已经历黑五，周52为旺季峰值）
old_skus = {
    'SKU-A-推车豪华版': make_sku_with_holiday(base_demand=30, amp_factor=4.5),
    'SKU-B-推车经济版': make_sku_with_holiday(base_demand=50, amp_factor=3.8),
    'SKU-C-推车轻便版': make_sku_with_holiday(base_demand=25, amp_factor=5.2),
    'SKU-D-推车旅行版': make_sku_with_holiday(base_demand=15, amp_factor=4.0),
}

# 新 SKU：只有 8 周数据，即将迎来首个黑五
new_sku_name = 'SKU-NEW-推车智能版'
new_sku_data = make_sku_with_holiday(30, amp_factor=4.3)[:8]  # 仅取前8周

print(f"[数据准备] {len(old_skus)} 个老SKU（各60周），新SKU({new_sku_name})：{len(new_sku_data)}周")

# ── Step 1: 提取旺季前模式指纹（旺季前6周的增速向量）─────────────────
HOLIDAY_WEEK = 52  # 黑五所在周
LOOKBACK = 6       # 旺季前几周的增速作为指纹

def extract_pre_holiday_fingerprint(weekly_demand, holiday_week, lookback):
    """提取旺季前 lookback 周的周环比增速"""
    start = holiday_week - lookback
    segment = weekly_demand[start:holiday_week]
    if len(segment) < lookback:
        return None
    growth_rates = np.diff(segment) / (segment[:-1] + 1e-6)
    return growth_rates  # 长度 = lookback - 1

old_fingerprints = {}
old_amp_factors = {}
for name, data in old_skus.items():
    fp = extract_pre_holiday_fingerprint(data, HOLIDAY_WEEK, LOOKBACK)
    if fp is not None:
        old_fingerprints[name] = fp
        # 计算实际旺季放大系数：峰值周/旺季前均值
        pre_mean = data[HOLIDAY_WEEK - LOOKBACK:HOLIDAY_WEEK].mean()
        peak = data[HOLIDAY_WEEK]
        old_amp_factors[name] = peak / (pre_mean + 1e-6)

# 新 SKU 近期增速指纹（最近 5 周）
new_fp_len = min(5, len(new_sku_data) - 1)
new_fingerprint = np.diff(new_sku_data[-new_fp_len-1:]) / (new_sku_data[-new_fp_len-1:-1] + 1e-6)
print(f"[指纹提取] 新SKU近期增速指纹: {new_fingerprint.round(3)}")
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2309.12045。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：同品类 3-5 款老品各自 ≥14 个月周销量（含至少 1 次黑五）与新 SKU 近 6-8 周周销量；粒度：SKU×周。

**输出**：旺季区间（卡页为 -7 天到 +14 天）日销量预测、放大系数区间估计与备货安全系数建议，供首次旺季备货与广告预算上限设定使用。

## 执行步骤

1. 提取老品旺季前模式指纹（前 6 周增速向量）
2. 用余弦相似度选出最相似兄弟品
3. 把旺季放大系数映射到新品并给出区间
4. 输出旺季日销量预测与备货安全系数
5. 复核老品当年是否受异常事件干扰

## 边界与不做

- 数据不满足时不用：老品不足 14 个月、或从未经历过旺季时，没有可迁移的形态特征。
- 能力边界：只给放大系数与备货建议，不负责广告预算与促销节奏的执行。
- 能力边界：老品当年若受竞品断货或平台限流影响，迁移系数会失真，需人工复核。

## 技能关联

- **前置**：Skill-Cross-Market-Transfer-Demand.html、Skill-Cross-Market-Transfer-Demand、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-MTL-Cold-Start-SKU-Demand.html、Skill-MTL-Cold-Start-SKU-Demand
- **延伸**：Skill-Cross-Market-Transfer-Demand.html、Skill-Cross-Market-Transfer-Demand、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain
- **可组合**：Skill-Cross-Market-Transfer-Demand.html、Skill-Cross-Market-Transfer-Demand、Skill-Seasonal-Pattern-Transfer-Learning

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Seasonal-Pattern-Transfer-Learning`