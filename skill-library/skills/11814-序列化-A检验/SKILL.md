---
name: "p2s-sequential-ab-testing"
title: "Sequential AB Testing（序列化 A/B 检验）"
description: "触发词：序列检验、提前停止、OBF 边界、显著差异早停、实验周期缩短、多次窥视控制。何时不用：只打算在固定时点做一次分析时用经典固定样本检验；需要边跑边调流量分配时用 MAB 或 Thompson 采样。安全边界：必须预先固定窥视次数以控制提前停止偏差；用户数据处理方式不变但需保持知情同意覆盖。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Sequential-AB-Testing"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "实验不用干等满周期，中期按序贯边界就能安全地提前看结论。"
user_try: "试试：帮我给这个转化率实验设一个序贯检验方案，看第 7 天能不能提前下结论。"
whenToUse: "想在中途多次查看结果并可能提前结束实验时用序列检验；只在期末分析一次时用经典检验；需要实时调整分流比例时用 MAB 类技能。"
workflow: "确定计划窥视次数与显著性水平 → 计算 O'Brien-Fleming 等序贯边界 → 按数据流逐次检验并记录时点 → 越界时提前停止并保留完整检验轨迹 → 输出结论并说明提前停止的偏差风险"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Sequential AB Testing（序列化 A/B 检验）

## ① 解决的问题

吸奶器详情页 A/B 实验需等满 10000 样本×14 天才能分析，错过旺季窗口——序列检验在 Day 7 检测到显著差异即提前结束，缩短实验周期 40%，年加速 6-8 次产品迭代

## ② 核心算法逻辑

论文：Sequential Analysis | arXiv：1969.0001（Wald, A. 1945; O'Brien & Fleming, 1979）

## ③ 业务应用场景

吸奶器详情页 A/B：预期需要 10,000 样本/组 × 14 天。Sequential 分析在 Day 7（7,200 样本）就检测到显著差异（$p < 0.005$，OF 边界），实验提前 7 天结束。年节省实验等待时间 40%，加速迭代节奏。
三轨验证： - 成本轨：数据采集成本 ¥8,000（日志存储 7 天 vs 14 天，节省 ¥4,000）；统计分析工具订阅 ¥2,000/月；数据分析师工时 40h × ¥300/h = ¥12,000；总显性成本 ¥18,000，相比传统方案节省 ¥6,000 - 合规轨：✓ 合规。Amazon 政策允许 A/B 测试，Sequential 分析属于统计方法范畴，无额外限制；GDPR 下用户数据处理方式不变，仅改变分析时机；中国《反不正当竞争法》对实验方法无禁限；跨境电商数据合规需确保用户知情同意（现有隐私政策已覆盖） - 风险轨：(1) 提前停止偏差风险 15%——若真实效应量小于预期，

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：加速实验迭代 40%，年化隐性 15-30 万元
难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（27 行）。**下面 27 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **27 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，27 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ab_testing/sequential_ab_testing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-Sequential-AB-Testing.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from scipy.stats import norm

def obrien_fleming_boundary(n_looks: int, alpha: float = 0.05):
    """O'Brien-Fleming 序贯边界"""
    boundaries = []
    for k in range(1, n_looks + 1):
        t = k / n_looks  # information fraction
        z_bound = norm.ppf(1 - alpha/2) / np.sqrt(t)  # OF adjustment
        boundaries.append(z_bound)
    return boundaries

def sequential_test(data_streams, boundaries):
    for k, (a_data, b_data) in enumerate(data_streams):
        diff = np.mean(a_data) - np.mean(b_data)
        se = np.sqrt(np.var(a_data)/len(a_data) + np.var(b_data)/len(b_data))
        z = abs(diff) / max(se, 1e-6)
        if z > boundaries[k]:
            return {'stop': True, 'look': k+1, 'significant': True, 'z': z}
    return {'stop': False, 'significant': False}

np.random.seed(42)
streams = [((np.random.normal(100,15,1000*i), np.random.normal(105,15,1000*i))) for i in range(1,6)]
bounds = obrien_fleming_boundary(5, 0.05)
r = sequential_test(streams, bounds)
print(f"Sequential: stop={r['stop']}, look={r.get('look','?')}")
print("[✓] Sequential AB 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处查无此号**：arXiv:1969.0001 在 arXiv 上不存在。

按如实口径，**本卡视为无论文来源**。

## 输入 / 输出契约

**输入**：按时间顺序可重放的实验数据流（累计转化或点击与样本量）、计划分析次数、显著性水平与目标功效；需要逐次累计的数据而非仅期末汇总。

**输出**：序贯边界表、每次检验的 p 值与越界判定、提前结束建议及节省的样本量；供实验负责人决定何时收口并形成可追溯的分析轨迹。

## 执行步骤

1. 确定计划窥视次数与显著性水平
2. 计算 O'Brien-Fleming 等序贯边界
3. 按数据流逐次做检验并记录分析时点
4. 越界时提前停止并保留完整检验轨迹
5. 输出结论并说明提前停止可能带来的偏差

## 边界与不做

- 何时不用：只打算在固定时点分析一次时，用经典固定样本检验即可，序贯边界反而降低检验功效。
- 能力边界：本技能产出边界与停止判据，不执行实验的开关与分流调整。
- 风险边界：提前停止本身有偏差风险，需在设计阶段固定窥视次数，不允许事后随意增加检验次数。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-Network-Effect-Experiments.html、Skill-Network-Effect-Experiments、Skill-Platform-Policy-Change-Adaptive-Monitor.html、Skill-Platform-Policy-Change-Adaptive-Monitor、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking
- **可组合**：Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-Network-Effect-Experiments.html、Skill-Network-Effect-Experiments、Skill-Platform-Policy-Change-Adaptive-Monitor.html、Skill-Platform-Policy-Change-Adaptive-Monitor、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking、Skill-Sequential-AB-Testing

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Sequential-AB-Testing`