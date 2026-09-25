---
name: "p2s-llm-causal-discovery"
title: "LLM辅助因果图发现 — 用语言模型先验加速因果结构学习"
description: "触发词：因果图、LLM 先验、投放诊断、中介路径、排名路径。何时不用：不引入 LLM 先验的纯统计发现用「PC算法因果发现」或「NOTEARS/DAGMA」；已知因果图只想分解某条路径贡献时用「中介效应分析」。安全边界：LLM 因果先验来自通用语料，可能不反映平台实际机制，只能作参考，必须用真实数据做最终验证。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 投放诊断"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-LLM-Causal-Discovery"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "让语言模型先给出变量间的因果方向猜想，再和统计方法一起画出广告到销量的因果图。"
user_try: "试试：用 18 个月的广告预算、搜索排名、CTR、CVR 和销量数据，判断广告到销量走的是排名路径还是直接转化路径。"
whenToUse: "当变量对多、样本量有限、希望把领域先验注入因果结构学习时用本技能；只用统计数据发现结构，用「PC算法因果发现」或「NOTEARS/DAGMA」；已知因果图、只要分解某条作用路径的贡献，用「中介效应分析」。"
workflow: "定义变量集并整理成月度或周度时间序列表 → 向 LLM 逐对询问因果方向与置信度，形成先验 → 用条件独立性检验学习统计骨架并融合 LLM 先验 → 输出因果 DAG 与中介效应占比 → 据此给出优化路径建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM辅助因果图发现 — 用语言模型先验加速因果结构学习

## ① 解决的问题

数据团队面临"广告→销量的因果路径不清晰无法确定优化策略"——LLM先验+统计方法构建因果DAG，识别排名路径贡献62%，策略优化后ROAS提升20%，年化增量约40万元

## ② 核心算法逻辑

传统统计因果发现（PC算法、FCI、GES）依赖数据驱动，需要大量观测数据才能可靠地识别因果关系。在母婴电商场景中，有三个痛点：

## ③ 业务应用场景

场景A：广告→销量因果图构建 - 业务问题：运营怀疑"广告预算→搜索排名→销量"是主路径，还是"广告预算→直接转化→销量"，两条路径会影响完全不同的优化策略 - 数据要求：月度数据（广告预算/搜索排名/CTR/CVR/销量/竞品数/Review数）约18-24个月；LLM接口（询问因果方向先验） - 预期产出：因果DAG显示两条路径的相对权重；中介效应分析显示"通过排名的间接效应"占总效应的62% - 业务价值：优化策略从"增加广告预算"转为"优化Listing质量提升自然排名"，相同预算下ROI提升约20%，年化GMV增量约80万元
三轨对抗验证： 1. 成本验证：LLM先验询问约50对变量，每次约100 tokens，总成本不超过1元；统计分析是一次性投入，不超过1天工作量 2. 合规验证：因果图是内部分析工具，不涉及平台合规；但基于因果图的策略（如自动调价）需在平台规则允许范围内 3. 风险验证：LLM的因果先验来自通用互联网文本，可能不反映特定平台（如亚马逊A10算法）的实际机制；必须用实际数据做最终验证，LLM先验仅作参考不可直接当结论
场景B：供应链风险传导路径发现 - 业务问题：不知道"原材料价格上涨"如何通过供应链传导到"最终利润下降"，中间有哪些可以干预的节点 - 数据要求：供应链各环节数据（原材料价格/MOQ/运费/汇率/库存/利润）+ LLM因果先验 - 预期产出：供应链因果DAG + 每个中间节点的"干预效应"（如在运费节点干预可以截断多少传导） - 业务价值：识别最有杠杆作用的干预点，年化优化供应链成本约100万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：因果图指导广告-Listing优化策略，相同预算下ROAS提升20%；按年广告支出200万元，增量产出约40万元；供应链因果图发现干预节点，年化优化成本约100万元
实施难度：⭐⭐⭐☆☆（LLM询问简单，统计部分需基础因果推断知识；主要挑战在领域变量定义和数据质量）
优先级：⭐⭐⭐☆☆（因果图是高级分析工具，建议先有稳定数据管道再实施）
评估依据：arXiv:2305.00050 展示LLM在因果方向判断上的准确率达到65-80%（强于随机，弱于完整统计方法）；结合统计方法后可提升到85%+；微软、DeepMind等研究机构均有工业级因果发现+LLM的工作

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（151 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-LLM-Causal-Discovery
LLM辅助因果图发现 — 广告→销量因果结构学习

依赖：pip install numpy pandas scipy
注意：生产环境需接入LLM API；此处用规则模拟LLM因果先验
"""

import numpy as np
import pandas as pd
from itertools import combinations
from scipy import stats

np.random.seed(42)

# ── 1. LLM先验因果知识库（模拟LLM对业务变量对的判断）────────────────
# 生产环境：替换为 LLM API 调用
# prompt = f"Does variable X causally influence Y in e-commerce context? Answer: Yes/No/Uncertain + confidence"
LLM_CAUSAL_PRIOR = {
    # (因, 果): (方向, 置信度)  正值=因→果，负值=因抑制果，0=无关
    ('ad_spend', 'search_rank'):    (1,   0.90),  # 广告预算→搜索排名
    ('ad_spend', 'direct_cvr'):     (1,   0.85),  # 广告预算→直接转化率
    ('search_rank', 'organic_ctr'): (1,   0.92),  # 搜索排名→自然点击率
    ('search_rank', 'sales'):       (1,   0.88),  # 搜索排名→销量
    ('organic_ctr', 'sales'):       (1,   0.85),  # 自然点击→销量
    ('direct_cvr', 'sales'):        (1,   0.87),  # 直接转化→销量
    ('review_score', 'sales'):      (1,   0.82),  # 评分→销量
    ('competitor_count', 'sales'):  (-1,  0.75),  # 竞品数→（抑制）销量
    ('competitor_count', 'search_rank'): (-1, 0.70),
    ('season', 'sales'):            (1,   0.88),  # 季节→销量
    ('season', 'ad_spend'):         (1,   0.65),  # 季节→广告支出（混淆）
    ('ad_spend', 'review_score'):   (0,   0.80),  # 广告不直接影响评分
    ('sales', 'ad_spend'):          (0,   0.60),  # 销量可能反向影响预算
}

# ── 2. 生成模拟观测数据 ────────────────────────────────────────────
n = 120  # 10年月度数据
season       = np.sin(2 * np.pi * np.arange(n) / 12)
ad_spend     = 10 + 3 * season + np.random.normal(0, 1, n)
search_rank  = -0.5 * ad_spend + 8 + np.random.normal(0, 0.5, n)  # 排名越低越好（数值小）
organic_ctr  = -0.3 * search_rank + 5 + np.random.normal(0, 0.3, n)
direct_cvr   = 0.4 * ad_spend + 2 + np.random.normal(0, 0.5, n)
review_score = 4.2 + 0.05 * np.cumsum(np.random.normal(0, 0.1, n))  # 随时间缓慢变化
competitor_count = 20 + np.random.normal(0, 3, n)
sales = (0.4 * organic_ctr + 0.3 * direct_cvr + 0.2 * review_score
         - 0.1 * competitor_count + 2 * season + np.random.normal(0, 2, n))

df = pd.DataFrame({
    'ad_spend': ad_spend, 'search_rank': search_rank,
    'organic_ctr': organic_ctr, 'direct_cvr': direct_cvr,
    'review_score': review_score, 'competitor_count': competitor_count,
    'season': season, 'sales': sales
})

print(f"数据集: {n}个月观测, {len(df.columns)}个变量")

# ── 3. 统计因果骨架（条件独立性检验）────────────────────────────────
def partial_correlation(df, x, y, z_vars=None):
    """偏相关系数（控制z_vars后，x与y的相关性）"""
    if not z_vars:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2303.05279，但该号在 arXiv 上是《Can large language models build causal graphs?》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：月度或周度业务变量表（广告预算、搜索排名、CTR、CVR、销量、竞品数、Review 数等，卡页口径约 18–24 个月），以及用于询问因果方向先验的 LLM 接口。

**输出**：含相对权重的因果 DAG 与中介效应分解结果（如经由排名的间接效应占比）；供投放与数据团队确定优化路径。

## 执行步骤

1. 定义变量集并整理成月度时间序列表
2. 向 LLM 逐对询问因果方向与置信度，构建先验知识库
3. 用条件独立性检验学习统计骨架并融合 LLM 先验
4. 输出因果 DAG 与中介效应占比（如经由排名的间接效应）
5. 据此给出优化策略建议（如从加预算转向提升自然排名）

## 边界与不做

- 数据不满足：变量定义不清或数据管道不稳定时先别做因果图，先补数据基础。
- 何时不用：不引入 LLM 先验的纯统计发现用「PC算法因果发现」或「NOTEARS/DAGMA」；只做路径贡献分解用「中介效应分析」；要做秒级根因定位用「ProRCA」。
- 能力边界：LLM 先验仅作参考，不替代数据验证，也不输出可直接执行的投放动作。
- 安全边界：LLM 先验来自通用互联网文本，可能不反映特定平台算法机制，必须由真实数据最终验证，不得直接当结论。

## 技能关联

- **前置**：Skill-Automated-Causal-Discovery.html、Skill-Automated-Causal-Discovery、Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Causal-Churn-Retention-Attribution.html、Skill-Causal-Churn-Retention-Attribution、Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Mediation-Causal-Mechanism-Analysis.html、Skill-Mediation-Causal-Mechanism-Analysis
- **延伸**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Causal-Churn-Retention-Attribution.html、Skill-Causal-Churn-Retention-Attribution、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Mediation-Causal-Mechanism-Analysis.html、Skill-Mediation-Causal-Mechanism-Analysis
- **可组合**：Skill-Causal-Churn-Retention-Attribution.html、Skill-Causal-Churn-Retention-Attribution、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-LLM-Causal-Discovery

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：01-因果推断　·　源卡：`Skill-LLM-Causal-Discovery`