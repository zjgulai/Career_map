---
name: "p2s-social-network-viral-growth-simulation"
title: "社交网络病毒式增长模拟与放大 — 跨境品牌UGC传播建模与爆发点预测"
description: "触发词：传播模拟、爆发点预测、助推时机、影响力最大化、种子达人选择。何时不用：只算老带新奖励结构时用 K 因子建模技能；本技能面向内容传播扩散与助推决策。安全边界：不得使用刷量或机器人放大传播；助推投放须遵守平台广告与内容规范。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-098"
l3_business: "达人筛选"
l3_all: "达人筛选 / 传播规划"
l1_l2_l3: "业务运营/品牌与增长/达人筛选"
p2s_card_id: "Skill-Social-Network-Viral-Growth-Simulation"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "判断哪条内容真的在扩散、什么时候该加预算助推，以及选哪几个达人做种子最划算。"
user_try: "试试：用我过去 6 个月的 TikTok 内容数据估算每条内容的传播率，标出值得助推的内容与投放时机。"
whenToUse: "有内容传播时序数据、要决定助推时机与种子达人时用本技能；推荐奖励结构设计用 K 因子建模技能。"
workflow: "接入内容逐小时互动数据与内容元数据 → 训练内容传播率预测并实时估算 R 值 → R 值超过阈值时触发助推预算 → 按影响力最大化挑选种子达人"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 社交网络病毒式增长模拟与放大 — 跨境品牌UGC传播建模与爆发点预测

## ① 解决的问题

内容爆发时机判断错误导致助推预算浪费——SEIR传播R₀实时估算+影响力最大化KOL选择，使内容平均传播量提升340%，CPM从$8降至$2.5

## ② 核心算法逻辑

反直觉洞察：母婴品牌做TikTok/Ins海外内容时，普遍认为"内容质量决定爆发"。但病毒传播研究表明，内容质量只解释了爆发概率的约30%，网络结构（发布时间、初始节点的网络中心性）和种子用户策略解释了其余70%。换句话说：同样质量的内容，由正确的KOL在正确时间发布，传播效果可以差10倍。

## ③ 业务应用场景

场景A：吸奶器TikTok内容病毒传播预测与助推
- 业务问题：某品牌每月制作20条TikTok内容，绝大多数播放量<1万，偶尔有1-2条爆发到100万+，无法预测哪条会爆。助推时机不对（内容已过高峰再加量）导致预算浪费 - 数据要求：过去6个月TikTok内容数据（每小时播放/点赞/分享/评论）、内容元数据（标签/时长/类型）、KOL账号粉丝网络数据 - 算法应用： 1. 用历史数据训练内容β值预测模型（内容质量→传播率） 2. 每条新内容发布后3小时，实时估算R₀ 3. R₀>1.5时自动触发助推预算（预留$2000助推基金） 4. 助推在传播加速度最大点（通常发布后6-12小时）投放 - 预期产出：正确的爆发检测+助推策略，使内容平均传
场景B：母婴KOL种子策略优化（影响力最大化）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月内容预算$1万的品牌，通过正确的助推时机检测（R₀>1.5时投入Boost），平均内容ROI提升3倍（CPM从$8降至$2.5）；影响力最大化选KOL使相同预算触达量提升50%；系统建设成本$6万，12个月ROI≈300%
实施难度：⭐⭐⭐☆☆（SEIR模型Python实现简单；关键挑战是实时获取TikTok/Ins的每小时数据（API限制））
优先级：⭐⭐⭐⭐☆（任何做社媒内容的母婴品牌均适用，内容放大效率是核心竞争力）
适用规模：月内容条数>10条且有付费放大预算的卖家
数据依赖：历史内容分钟级数据（平台API）、KOL粉丝分布和互动率（第三方工具）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（306 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/social_network_viral_growth_simulation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Social-Network-Viral-Growth-Simulation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
社交网络病毒式增长模拟与放大系统
功能：SEIR传播模拟 + R₀动态估算 + 影响力最大化 + 助推时机检测
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from scipy.integrate import odeint
import warnings
warnings.filterwarnings('ignore')


@dataclass
class ContentProfile:
    """内容传播特征"""
    content_id: str
    content_type: str           # 'tutorial', 'unboxing', 'review', 'ugc', 'brand'
    emotional_trigger: float    # 情感强度 0-1
    practical_value: float      # 实用价值 0-1
    brand_visibility: float     # 品牌可见度 0-1（过高会降低传播）
    creator_followers: int      # 创作者粉丝数
    creator_engagement_rate: float  # 创作者互动率
    post_hour: int              # 发布小时（0-23）
    is_weekday: bool            # 是否工作日


def estimate_beta(content: ContentProfile) -> float:
    """
    估算内容传播率β
    基于内容特征预测
    """
    # 基础传播率
    beta = 0.05
    
    # 情感触发加成（最重要因子）
    beta += content.emotional_trigger * 0.08
    
    # 实用价值加成
    beta += content.practical_value * 0.04
    
    # 品牌过度曝光惩罚（品牌感太强，用户不愿分享）
    if content.brand_visibility > 0.7:
        beta -= (content.brand_visibility - 0.7) * 0.06
    
    # 创作者影响力加成（互动率比粉丝数更重要）
    er_bonus = min(content.creator_engagement_rate * 0.05, 0.03)
    beta += er_bonus
    
    # 发布时间加成（美国东部时间晚8-10点 = 北京时间早8-10点）
    prime_hours = {8, 9, 12, 13, 20, 21}
    if content.post_hour in prime_hours:
        beta += 0.02
    
    # 工作日/周末
    if not content.is_weekday:
        beta += 0.01
    
    return np.clip(beta, 0.02, 0.25)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.08179，但该号在 arXiv 上是《Effects of wave damping and finite perpendicular scale on three-dimensional Alfven wave parametric decay in low-beta plasmas》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去数月的内容逐小时传播数据（播放、点赞、分享、评论）、内容元数据（标签、时长、类型、发布时段）与 KOL 粉丝网络数据。

**输出**：每条内容的传播率估算与爆发判定、助推时机建议与预算触发条件，以及影响力最大化的种子达人选择方案；供社媒运营与投放使用。

## 执行步骤

1. 接入内容传播时序数据与元数据
2. 估算内容传播率并判定是否进入爆发期
3. 设定阈值与助推预算触发规则
4. 按影响力最大化挑选种子达人
5. 输出助推方案与效果跟踪口径

## 边界与不做

- 缺少逐小时传播数据或内容元数据时不用本技能，传播率不可估计。
- 本技能输出传播判定与助推建议，不执行广告投放与达人合作。
- 安全边界：不得使用刷量或机器人放大传播；助推投放须遵守平台广告与内容规范。

## 技能关联

- **前置**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-Cross-Cultural-Marketing-Adaptation.html、Skill-Cross-Cultural-Marketing-Adaptation、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Growth-Hacking-Experimentation、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-New-Product-Launch-Prediction、Skill-SIR-Viral-Product-Adoption-Forecasting.html、Skill-SIR-Viral-Product-Adoption-Forecasting
- **延伸**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-Cross-Cultural-Marketing-Adaptation.html、Skill-Cross-Cultural-Marketing-Adaptation、Skill-Growth-Hacking-Experimentation、Skill-New-Product-Launch-Prediction、Skill-SIR-Viral-Product-Adoption-Forecasting.html、Skill-SIR-Viral-Product-Adoption-Forecasting
- **可组合**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-Cross-Cultural-Marketing-Adaptation.html、Skill-Cross-Cultural-Marketing-Adaptation、Skill-SIR-Viral-Product-Adoption-Forecasting.html、Skill-SIR-Viral-Product-Adoption-Forecasting、Skill-Social-Network-Viral-Growth-Simulation

---

> 分类：业务运营/品牌与增长/达人筛选　·　技术族：06-增长模型　·　源卡：`Skill-Social-Network-Viral-Growth-Simulation`