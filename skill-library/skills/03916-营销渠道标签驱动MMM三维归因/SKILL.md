---
name: "p2s-tag-driven-marketing-attribution"
title: "Tag-Driven Marketing Attribution — 营销渠道标签驱动MMM三维归因"
description: "触发词：标签 MMM、内容标签、增量归因、Adstock、渠道协同、预算重分配。何时不用：按触点顺序做跨渠道 Shapley 归因用多触点归因那张卡；本卡把内容类型标签作为控制变量，把 MMM 从渠道级细到标签-渠道-内容三维。安全边界：内容标签采集须遵守平台数据条款，不得抓取非公开互动数据；涉儿童品类需评估 COPPA，避免使用未成年人行为标签。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Tag-Driven-Marketing-Attribution"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把内容类型标签加进 MMM，看清 KOL 测评和品牌自播各自值多少钱，再决定预算往哪挪。"
user_try: "试试：这是我 TikTok Shop 各类内容的每日曝光点击和对应销量，帮我用带标签的 MMM 拆出 KOL 测评与品牌自播各自的 ROI。"
whenToUse: "与「多触点非线性归因」相比：有用户级触点序列时用 Shapley 归因；只有渠道级到内容级的聚合时序数据、要把归因粒度做细时用本卡。"
workflow: "整理内容类型标签与各类内容每日曝光、点击、销量时序 → 对投放做 Adstock 变换捕捉延迟效应（卡页 3–7 天） → 用带标签的回归（Ridge 正则化）估计标签-渠道-内容三维贡献 → 据贡献差异重分配预算并识别跨渠道协同加成"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag-Driven Marketing Attribution — 营销渠道标签驱动MMM三维归因

## ① 解决的问题

营销分析师面临"MMM归因只能到渠道级无法细分到内容类型和标签维度"——标签作为MMM控制变量将归因粒度从渠道级升级至标签-渠道-内容三维，年化归因准确度提升33万元

## ② 核心算法逻辑

本 Skill 将营销渠道标签（流量来源标签/内容类型标签/转化路径标签）作为 MMM（媒体组合模型）的控制变量，将归因粒度从传统「渠道级」提升到「标签渠道内容」三维，更精准地识别每类内容形式的真实贡献。

## ③ 业务应用场景

场景A：TikTok Shop 内容标签 ROI 精细化归因 - 业务问题：TikTok Shop 月投入 $30K，但无法区分「KOL 测评视频」vs「品牌自播」哪个贡献更大 - 数据要求：内容类型标签（测评/直播/短视频/信息图）+ 每类内容每日曝光/点击数据 + 对应日期销量 - 预期产出：归因粒度从「TikTok 整体 ROI=2.8」→「KOL测评 ROI=4.2，品牌自播 ROI=1.9」，识别到 KOL 测评被低估 50% - 业务价值：将 TikTok 预算的 40% 从自播转向 KOL 合作，月 GMV 增量约 18 万元
三轨验证： - 成本：需采购第三方标签服务（如 Brandwatch 或 Talkwalker）或自建 NLP 打标管道，月均成本约 $2,000-$5,000；数据工程师 0.5 FTE 维护标签对齐与清洗。 - 合规：TikTok 内容标签采集需遵守平台数据使用条款，不得抓取非公开用户互动数据；若涉及儿童产品（母婴），需额外注意 COPPA 合规，避免使用未成年人行为标签。 - 风险：预算重分配后若 KOL 内容供给不足或质量波动，可能导致 ROI 下降；过度依赖单一内容类型（如 KOL 测评）会降低渠道多样性，增加投放脆弱性。
场景B：多渠道协同效应识别 - 业务问题：KOL 推广后 Amazon 搜索量上涨，但 Amazon PPC 错误地「抢占」了归因功劳 - 数据要求：流量来源标签（是否由 KOL 驱动的有机流量）+ 跨渠道时序数据 - 预期产出：Adstock 模型识别 KOL 内容的延迟效应（3-7天）+ 协同加成系数，真实 KOL ROI 从 2.1 修正至 3.6 - 业务价值：KOL 预算提升 30%，年化 Marketing ROI 提升 25%，年化增收约 15 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：识别被低估的 KOL 内容 ROI（2.1→3.6），TikTok 预算重分配后月 GMV 增量约 18 万元；跨渠道协同效应识别带来 Marketing ROI 提升 25%，年化增收约 15 万元，合计年化价值约 33 万元
实施难度：⭐⭐⭐☆☆（需要内容标签打标完整，多渠道数据对齐）
优先级：⭐⭐⭐⭐☆（营销预算优化 ROI 高，季度 review 周期驱动）
数据门槛：≥3个月跨渠道时序数据，每日颗粒度，内容类型标签覆盖率 ≥80%
风险：多重共线性（各渠道投放高度相关），需 Ridge 正则化或结合贝叶斯 MMM 处理

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（237 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/tag_driven_marketing_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Driven-Marketing-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Tag-Driven Marketing Attribution (Tag-Enhanced MMM)
营销渠道标签驱动MMM三维归因

依赖：numpy, pandas, scikit-learn
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings("ignore")


# ─── 1. Adstock 衰减函数 ──────────────────────────────────────────────────────

def adstock_transform(spends: np.ndarray, decay_rate: float = 0.5, max_lag: int = 7) -> np.ndarray:
    """
    Adstock 变换：捕捉广告延迟效应
    adstock_t = spend_t + decay_rate * adstock_{t-1}
    """
    adstocked = np.zeros_like(spends, dtype=float)
    for t in range(len(spends)):
        adstocked[t] = spends[t]
        for lag in range(1, min(t + 1, max_lag + 1)):
            adstocked[t] += (decay_rate ** lag) * spends[t - lag]
    return adstocked


# ─── 2. 模拟数据生成 ──────────────────────────────────────────────────────────

def generate_mock_marketing_data(n_days: int = 180, seed: int = 42) -> pd.DataFrame:
    """
    生成模拟营销数据
    渠道：TikTok（内容标签：短视频/直播/KOL测评）+ Amazon PPC + Email
    """
    rng = np.random.default_rng(seed)
    dates = pd.date_range("2025-01-01", periods=n_days, freq="D")

    # 季节性效应
    day_of_year = np.arange(n_days)
    seasonal = 1 + 0.3 * np.sin(2 * np.pi * day_of_year / 365) + 0.2 * np.sin(4 * np.pi * day_of_year / 365)

    # 渠道投入模拟（USD/天）
    tiktok_short_video = rng.exponential(200, n_days) * (1 + 0.5 * (day_of_year > 120))
    tiktok_live = rng.exponential(300, n_days)
    tiktok_kol = rng.exponential(150, n_days)
    amazon_ppc = rng.exponential(500, n_days)
    email_spend = rng.exponential(50, n_days)

    # 标签权重：每渠道内各内容类型的流量占比
    tiktok_total = tiktok_short_video + tiktok_live + tiktok_kol + 1e-6
    tag_weight_short = tiktok_short_video / tiktok_total
    tag_weight_live = tiktok_live / tiktok_total
    tag_weight_kol = tiktok_kol / tiktok_total

    # 真实 ROI 系数（用于生成目标变量）
    true_coef = {
        "tiktok_short": 2.5,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.13821，但该号在 arXiv 上是《Normalizing Basis Functions: Approximate Stationary Models for Large Spatial Data》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：内容类型标签（测评、直播、短视频、信息图等）与每类内容的每日曝光、点击数据，以及对应日期的销量；卡页要求至少 3 个月跨渠道时序、每日粒度、标签覆盖率 80% 以上。

**输出**：标签-渠道-内容三维归因结果（卡页 KOL 测评 ROI 4.2 对品牌自播 1.9）、协同加成系数与预算重分配建议（卡页月 GMV 增量约 18 万元），供营销分析师与预算决策人使用。

## 执行步骤

1. 整理多渠道每日投入与销量，并补齐内容类型标签。
2. 做 Adstock 变换刻画投放的延迟效应。
3. 用带标签的回归模型估计各标签-渠道-内容组合的贡献。
4. 用正则化处理渠道共线性，输出稳健系数。
5. 给出预算重分配方案并设计验证期跟踪效果。

## 边界与不做

- 何时不用：内容标签覆盖率低、时序不足 3 个月或粒度为周以上时不要用；用户级触点数据充足时可直接做 Shapley 归因。
- 能力边界：只输出归因结论与建议，不自动调预算；卡页 ROI 修正与年化增收均为案例测算值。
- 安全边界：不得抓取平台非公开互动数据，涉儿童品类须评估 COPPA 等合规要求。

## 技能关联

- **前置**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Brand-Penetration-Modeling.html、Skill-Brand-Penetration-Modeling、Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Tag-Driven-User-Behavior-Analytics.html、Skill-Tag-Driven-User-Behavior-Analytics、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Brand-Penetration-Modeling.html、Skill-Brand-Penetration-Modeling、Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Tag-Driven-User-Behavior-Analytics.html、Skill-Tag-Driven-User-Behavior-Analytics、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger
- **可组合**：Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Tag-Driven-User-Behavior-Analytics.html、Skill-Tag-Driven-User-Behavior-Analytics、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger、Skill-Tag-Driven-Marketing-Attribution

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Driven-Marketing-Attribution`