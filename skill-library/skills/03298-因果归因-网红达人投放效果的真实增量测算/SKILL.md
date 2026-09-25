---
name: "p2s-kol-roi-causal-attribution"
title: "KOL ROI 因果归因（网红/达人投放效果的真实增量测算）"
description: "触发词：达人投放复盘、增量回报、匹配对照、预算重配、达人分层排序。何时不用：只看视频内容特征的转化贡献用内容归因类技能，估计活动整体时序增效用合成控制或时序因果技能，本技能算单个达人的真实增量回报。安全边界：用户级匹配与实验数据须在平台授权范围内使用并脱敏，不得把平台随机实验数据挪作他用。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-100"
l3_business: "合作复盘"
l3_all: "合作复盘 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/合作复盘"
p2s_card_id: "Skill-KOL-ROI-Causal-Attribution"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "分清达人是真的带来新客，还是本来就有人要买，算准每个达人的真实回报。"
user_try: "试试：复盘这 50 个 TikTok 达人的投放，区分真实增量和自然转化，给出预算重配建议。"
whenToUse: "需要判断某个达人或某层达人真正带来的增量、而不是看平台报表里的归因 GMV 时用本技能；看视频内容特征的转化贡献用内容归因类技能，估活动整体时序增效用合成控制类技能。"
workflow: "获取平台随机实验或曝光人群数据 → 倾向得分匹配构建对照组 → 估计每个达人的增量回报 → 按增量回报分层排序 → 重配预算并复盘"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KOL ROI 因果归因（网红/达人投放效果的真实增量测算）

## ① 解决的问题

月 KOL 投放 30 万元，naive 归因显示 ROAS 3.5，但无法区分「因 KOL 才购买」和「本来就会买顺路点了链接」——PSM+DiD 因果归因将头部 KOL iROAS 从 4.2 修正为 1.8，将 30 万预算转向腰部 KOL 后年化增量 GMV 提升 44%

## ② 核心算法逻辑

论文: Estimating the Incremental ROI of Advertising Campaigns with Causal Inference | 年份: 2019 (KDD)

## ③ 业务应用场景

场景 A：TikTok KOL 矩阵投放效果评估（大品类分析）
- 业务痛点：品牌同时合作 50 个 TikTok KOL（头部 3 个 + 腰部 15 个 + 尾部 32 个），总投入 100 万元/月，naive GMV 归因显示 ROI = 3.5，但无法判断哪类 KOL 真正带来了增量 - 分析路径： 1. 获取 TikTok 平台的随机实验数据（Brand Lift Study，平台提供） 2. 对于无实验数据的 KOL，用 PSM 匹配「看过视频的用户」和「未看过但特征相似的用户」 3. 对每个 KOL 估计 iROAS - 结论示例： - 决策：将 30 万预算从头部 KOL 转移到腰部 KOL，总 iROAS 从 1.9 提升到 2.6
场景 B：小红书种草到 Amazon 购买的跨平台归因

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

TikTok Brand Lift Study 可直接申请（需达量门槛），低难度
PSM + DiD 分析：中等（需匹配数据，但 Python 工具链成熟）
跨平台归因（小红书→Amazon）：较难（无 ID 打通，需 RDD 等间接方法）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（63 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/marketing/kol_roi_causal_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-KOL-ROI-Causal-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
import numpy as np
from scipy import stats

@dataclass
class KOLCampaign:
    kol_id: str
    spend: float
    naive_gmv: float
    exposed_users: int
    control_users: int
    exposed_cvr: float
    control_cvr: float
    aov: float

def estimate_incremental_roas(campaign: KOLCampaign) -> dict:
    """
    PSM 配对后的双样本因果 iROAS 估计。
    假设 exposed/control 已经过倾向得分匹配，组间特征平衡。
    """
    delta_cvr = campaign.exposed_cvr - campaign.control_cvr
    se = np.sqrt(
        campaign.exposed_cvr * (1 - campaign.exposed_cvr) / campaign.exposed_users
        + campaign.control_cvr * (1 - campaign.control_cvr) / campaign.control_users
    )
    z_stat = delta_cvr / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))

    incremental_gmv = delta_cvr * campaign.exposed_users * campaign.aov
    i_roas = incremental_gmv / campaign.spend if campaign.spend > 0 else 0.0
    attribution_fraction = incremental_gmv / campaign.naive_gmv if campaign.naive_gmv > 0 else 0.0

    return {
        "kol_id": campaign.kol_id,
        "naive_roas": round(campaign.naive_gmv / campaign.spend, 2),
        "i_roas": round(i_roas, 2),
        "incremental_gmv": round(incremental_gmv),
        "attribution_fraction": round(attribution_fraction, 3),
        "delta_cvr": round(delta_cvr, 4),
        "p_value": round(p_value, 4),
        "significant": p_value < 0.05,
    }

def rank_kol_portfolio(campaigns: list[KOLCampaign]) -> list[dict]:
    results = [estimate_incremental_roas(c) for c in campaigns]
    results.sort(key=lambda x: x["i_roas"], reverse=True)
    return results

# === 测试用例（模拟头部/腰部/尾部 KOL）===
campaigns = [
    KOLCampaign("KOL-TOP-001",    spend=50000, naive_gmv=210000, exposed_users=50000,
                control_users=50000, exposed_cvr=0.042, control_cvr=0.038, aov=1000),
    KOLCampaign("KOL-MID-007",    spend=20000, naive_gmv=62000,  exposed_users=25000,
                control_users=25000, exposed_cvr=0.031, control_cvr=0.020, aov=800),
    KOLCampaign("KOL-TAIL-023",   spend=5000,  naive_gmv=12000,  exposed_users=8000,
                control_users=8000,  exposed_cvr=0.028, control_cvr=0.019, aov=750),
]
results = rank_kol_portfolio(campaigns)
for r in results:
    print(f"{r['kol_id']}: naive_ROAS={r['naive_roas']} | iROAS={r['i_roas']} | "
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1906.07127，但该号在 arXiv 上是《Danger of using fully homomorphic encryption: A look at Microsoft SEAL》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Estimating the Incremental ROI of Advertising Campaigns with Causal Inference》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每个达人合作的投放金额、曝光与对照人群规模、曝光组与对照组的转化率、客单价；有条件的用平台提供的随机实验（如 Brand Lift Study）数据，无实验数据的用可匹配的用户特征做倾向得分匹配。

**输出**：每个达人的增量回报估计与分层排序、头部与腰部达人的效率对比结论，以及预算重配建议；卡页口径头部达人增量回报从 4.2 修正为 1.8、把 30 万预算从头部转向腰部后总回报从 1.9 提升到 2.6。

## 执行步骤

1. 获取平台随机实验数据或曝光人群与对照人群数据。
2. 用倾向得分匹配构造特征相似的对照组。
3. 对每个达人估计增量转化率与增量回报。
4. 按增量回报对达人分层排序，识别被高估的达人。
5. 按结果重配预算并完成合作复盘。

## 边界与不做

- 没有可匹配的对照人群、也拿不到平台实验数据时不要用，增量无法与自然转化分离。
- 能力边界：结果依赖匹配质量与平台实验门槛；跨平台场景（如种草平台到电商平台）无 ID 打通时需用间接方法，结论更弱。卡页的增量回报与提升幅度为特定案例口径。
- 合规红线：用户级匹配与实验数据须在平台授权范围内使用并脱敏，不得把平台随机实验数据挪作他用。

## 技能关联

- **前置**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-IV-Instrumental-Variables.html、Skill-IV-Instrumental-Variables、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **延伸**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation
- **可组合**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-KOL-ROI-Causal-Attribution

---

> 分类：业务运营/品牌与增长/合作复盘　·　技术族：15-营销投放分析　·　源卡：`Skill-KOL-ROI-Causal-Attribution`