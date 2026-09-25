---
name: "p2s-tiktok-creator-roi-attribution"
title: "TikTok达人直播ROI归因 — PSM分离主播效应与流量效应"
description: "触发词：达人归因、倾向得分匹配、主播效应、流量效应拆分、达人价值评分。何时不用：没有直播间流量来源字段时无法拆分效应；纯自然流量结构分析不用本技能。安全边界：用户行为数据须匿名化并已获授权；平台用户级数据不得导出至第三方。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-098"
l3_business: "达人筛选"
l3_all: "达人筛选 / 合作复盘"
l1_l2_l3: "业务运营/品牌与增长/达人筛选"
p2s_card_id: "Skill-TikTok-Creator-ROI-Attribution"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把达人带来的转化和同时投的广告流量分开算，判断这位达人的报价到底值不值。"
user_try: "试试：用这场直播的流量来源与用户行为数据做倾向得分匹配，拆分主播净效应与投流效应，给出合理报价区间。"
whenToUse: "达人与付费流量同时存在、需要拆分各自贡献时用本技能；只有自然流量的结构分析不用本技能。"
workflow: "接入直播间用户进入来源、协变量与转化结果 → 按协变量做倾向得分匹配构造可比样本 → 估计主播粉丝流量与投流用户的净效应差异 → 输出达人净影响力系数与报价建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TikTok达人直播ROI归因 — PSM分离主播效应与流量效应

## ① 解决的问题

品牌负责人面临"达人带货的ROI里不知道多少是主播影响力多少是投流效果"——倾向得分匹配将主播净贡献与流量效果精确拆分，年化广告预算优化$7.4万

## ② 核心算法逻辑

达人直播ROI归因的核心难题是混淆变量问题：一场直播的销售来自三个来源的混合——①主播个人影响力（粉丝信任、话术魅力）、②TikTok Ads投流带来的流量、③算法自然推流流量。品牌最需要知道的是：如果没有投流，主播自身能带来多少转化？这决定了主播的真实价值定价。

## ③ 业务应用场景

场景A：评估婴儿车TikTok达人合作价值 - 业务问题：一位有80万粉丝的母婴TikTok博主报价 $5,000/场直播，品牌无法判断是否值得——因为同时投了 $2,000 TikTok Ads，分不清哪部分转化是主播带的 - 数据要求：直播间用户进入来源（主播主页/广告/探索页）+ 个人行为特征 + 最终转化行为 - 预期产出：PSM分析发现主播净贡献CVR比投流用户高1.8倍，估计主播纯影响力带来GMV $7,200，值得以 $4,500 报价合作 - 业务价值：避免过度支付或低估KOL价值，年化节约KOL采购预算约 $18,000（8个合作）
三轨验证： - 成本：数据采集需对接TikTok Shop API获取流量来源字段，预估开发成本 $2,000-$3,000；每次PSM分析需约2小时计算资源（400用户级），人力成本约 $200/次 - 合规：用户行为数据（历史购买、互动偏好）属于GDPR敏感数据，需确保匿名化处理且用户已授权；TikTok API使用需遵守平台数据使用条款，禁止将用户级数据导出至第三方 - 风险：若PSM匹配率低于40%，结论不可靠，可能导致错误定价（高估或低估达人价值）；过度依赖归因结果可能引发与达人的合作纠纷（达人可能质疑数据来源）
场景B：建立内部KOL价值评分体系 - 业务问题：品牌合作了15位母婴TikTok达人，无统一的ROI对比口径 - 数据要求：所有达人历史合作数据（流量来源分组、转化数据） - 预期产出：建立「主播净影响力系数」排名，TOP3主播的净效应是均值的2.3倍，资源向TOP集中 - 业务价值：KOL预算重新分配后，总ROI从2.1x提升至4.3x，年化增量约 $31,000

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：年合作10位TikTok达人，假设每位平均合作费 $3,000，PSM归因使品牌可以精确区分「高净效应达人」vs「高流量但低净效应达人」。将预算从低净效应达人重新分配，总KOL预算 $30,000 可产生原来2.1x的GMV贡献，等效年化增量 GMV 约 $63,000；系统建设成本约 $3,000，ROI = 21x
实施难度：⭐⭐⭐⭐☆（需要TikTok Shop后台的流量来源数据，部分市场数据获取有限制）
优先级：⭐⭐⭐⭐☆（KOL是TikTok母婴品牌主要获客渠道，归因精准化直接影响预算分配）
量化指标：PSM匹配率 >60%，匹配后协变量标准化差异 <0.1，ATT 95% CI 不含0则效应显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（235 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/tiktok_creator_roi_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-TikTok-Creator-ROI-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TikTok达人直播ROI归因
倾向得分匹配（PSM）分离主播影响力 vs 投流效应
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field

# ─── 1. 数据结构
@dataclass
class LiveAudienceRecord:
    """单个直播间用户记录"""
    user_id: str
    traffic_source: str      # "creator_fan" | "paid_ad" | "organic"
    is_creator_fan: int      # 1=主播粉丝流量, 0=其他
    
    # 协变量（用于匹配）
    has_purchase_history: int  # 是否有购买历史
    device_type: int          # 0=iOS, 1=Android
    viewing_hour: int         # 进入时间（小时）
    interaction_level: float  # 过去30天互动率（点赞/评论频率）
    account_age_days: int     # 账号活跃天数
    
    # 结果变量
    converted: int           # 1=购买, 0=未购买
    order_value: float       # 购买金额（0表示未购买）

# ─── 2. 倾向得分估计（逻辑回归）
class PropensityScoreEstimator:
    """
    估计每个用户是「主播粉丝流量」的倾向得分
    P(is_creator_fan=1 | covariates)
    """
    def __init__(self):
        self.coef = None
        self.intercept = 0.0
    
    def _sigmoid(self, z: np.ndarray) -> np.ndarray:
        return 1 / (1 + np.exp(-np.clip(z, -500, 500)))
    
    def fit(self, X: np.ndarray, y: np.ndarray, lr: float = 0.1, epochs: int = 500):
        """梯度下降拟合逻辑回归"""
        n, p = X.shape
        self.coef = np.zeros(p)
        self.intercept = 0.0
        
        for _ in range(epochs):
            z = X @ self.coef + self.intercept
            pred = self._sigmoid(z)
            error = pred - y
            self.coef -= lr * (X.T @ error) / n
            self.intercept -= lr * error.mean()
        return self
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        z = X @ self.coef + self.intercept
        return self._sigmoid(z)

# ─── 3. PSM最近邻匹配
def propensity_score_matching(
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.07392，但该号在 arXiv 上是《Synthetic Spectra from Particle-in-cell Simulations of Relativistic Jets containing an initial Toroidal Magnetic Field》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：直播间用户级记录：流量来源（主播主页、广告、探索页）、是否主播粉丝、协变量（购买历史、设备类型、进入时段、互动水平、账号年龄）与转化结果。

**输出**：主播净效应与投流效应的拆分结果、达人净影响力系数排名与报价建议（含匹配率与可靠性说明）；供达人合作定价与预算重分配使用。

## 执行步骤

1. 接入直播间流量来源与用户协变量数据
2. 做倾向得分匹配构造可比样本组
3. 估计主播流量与投流用户的净效应差
4. 建立达人净影响力系数与排名
5. 输出报价与预算重分配建议

## 边界与不做

- 匹配率过低或缺少流量来源字段时结论不可靠，不用本技能下定价结论。
- 本技能输出归因结论与报价建议，不代替与达人的商务谈判与结算。
- 安全边界：用户行为数据须匿名化并已获授权；不得将平台用户级数据导出给第三方。

## 技能关联

- **前置**：Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-Live-Script-Optimization-NLP.html、Skill-Live-Script-Optimization-NLP、Skill-TikTok-Algorithm-Traffic-Amplification.html、Skill-TikTok-Algorithm-Traffic-Amplification
- **延伸**：Skill-Live-Script-Optimization-NLP.html、Skill-Live-Script-Optimization-NLP、Skill-TikTok-Algorithm-Traffic-Amplification.html、Skill-TikTok-Algorithm-Traffic-Amplification
- **可组合**：Skill-Live-Script-Optimization-NLP.html、Skill-Live-Script-Optimization-NLP、Skill-TikTok-Creator-ROI-Attribution

---

> 分类：业务运营/品牌与增长/达人筛选　·　技术族：13-广告分析　·　源卡：`Skill-TikTok-Creator-ROI-Attribution`