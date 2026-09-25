---
name: "p2s-nonlinear-multi-touch-attribution"
title: "多触点非线性归因建模 — 跨渠道用户旅程因果归因与预算决策"
description: "触发词：多触点归因、Shapley 值、跨渠道预算、Last-Click 偏差、归因重构、反事实。何时不用：只做单渠道内部关键词诊断用投放诊断；要重算 TikTok/Google/Amazon 之间的贡献并重分配预算时用本卡。安全边界：跨平台用户级数据回传违反 Amazon 广告政策，须用聚合级归因；GDPR 下须有 Cookie 同意，不得回传个人标识。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Nonlinear-Multi-Touch-Attribution"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把跨渠道的转化功劳重新算清，避免预算被 Last-Click 误导，让钱花在真正带来增量的渠道上。"
user_try: "试试：这是我 TikTok、Google、Amazon SP 的用户触点序列和订单数据，帮我用 Shapley 值重算各渠道贡献，并给出预算重分配建议。"
whenToUse: "与「搜索词业绩归因」相比：渠道内部关键词价值排序用那张卡；要判断多个渠道之间谁真正带来增量、预算该怎么挪时用本卡。"
workflow: "重建用户触点序列：TikTok 曝光→品牌搜索→Amazon 点击→转化 → 用 Shapley 值按触点组合的边际贡献重新分配转化 → 做删除某渠道预算的反事实实验，验证增量而非相关 → 按新贡献比例给出渠道预算重分配建议并跟踪品牌词搜索量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多触点非线性归因建模 — 跨渠道用户旅程因果归因与预算决策

## ① 解决的问题

Last-Click归因导致TikTok预算被严重低估而Amazon SP被高估——Shapley值归因重新分配后整体ROAS从2.3x提升至3.1x，月增收$6.4万（$8万预算规模）

## ② 核心算法逻辑

反直觉洞察：跨境母婴卖家普遍使用"末次触点归因"（LastClick）——哪个广告渠道最后带来转化，就把所有功劳归给它。这导致一个系统性错误：TikTok和品牌词搜索长期被低估，而"收割型"关键词（如"breast pump buy now"）被严重高估。反直觉的真相是：用户在TikTok看到开箱视频→Google搜索品牌→Amazon下单，这个路径中TikTok是真正的需求激发者，但LastClick把100%功劳给了Amazon S

## ③ 业务应用场景

场景A：母婴品牌跨渠道归因重构（TikTok+Amazon+Google）
- 业务问题：某卖家月营销预算$8万，分配是Amazon SP 70% + Google 20% + TikTok 10%。Last-Click归因显示Amazon贡献90%转化，于是继续加大Amazon投入，但总销量停滞不增 - 数据要求：用户触点序列（需广告平台API + UTM追踪）、转化数据（订单）、品牌词搜索量数据 - 算法应用： 1. 重建用户触点序列：TikTok曝光→品牌搜索→Amazon点击→转化 2. Shapley归因重新分配：TikTok实际贡献28%（vs Last-Click的3%） 3. 因果分析：删除TikTok预算的反事实实验显示总转化量会下降35% 4. 重
三轨验证： - 成本：数据采集需接入TikTok/Amazon/Google三方API，年费约$1.2万；Shapley计算需GPU服务器（月$800）；人力成本（1名数据工程师+1名分析师，月$1.5万）。首年总成本约$22万。 - 合规：Amazon Attribution工具需遵守Amazon广告政策（禁止跨平台用户级数据回传）；GDPR要求用户同意Cookie追踪；TikTok Pixel需符合数据本地化要求（欧洲/东南亚）。建议使用聚合级归因（Aggregated Attribution）规避用户级数据风险。 - 风险：① 预算大幅削减Amazon SP可能触发Amazon广告账户审

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月广告预算$7万的卖家，通过正确归因后预算重分配，整体ROAS提升20-35%；以ROAS从2.3x→2.9

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（284 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/nonlinear_multi_touch_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Nonlinear-Multi-Touch-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多触点非线性归因建模系统
功能：Shapley值归因 + 时间衰减 + 因果归因 + 渠道预算建议
"""
import numpy as np
import pandas as pd
from itertools import combinations, permutations
from collections import defaultdict
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


def generate_user_journeys(n_users: int = 2000, seed: int = 42) -> pd.DataFrame:
    """
    生成模拟用户触点序列数据
    模拟：TikTok→Google→Amazon→转化 的典型母婴用户路径
    """
    np.random.seed(seed)
    channels = ['TikTok', 'Google_Brand', 'Google_Generic', 'Amazon_SP', 'Amazon_SB', 'Email']
    
    journeys = []
    for user_id in range(n_users):
        # 用户类型：发现型（从TikTok进入）vs 意向型（直接搜索）
        is_discovery_user = np.random.random() < 0.45
        
        if is_discovery_user:
            # TikTok激发需求路径
            path_length = np.random.randint(2, 5)
            path_channels = ['TikTok']
            remaining = np.random.choice(['Google_Brand', 'Google_Generic', 'Amazon_SP', 'Amazon_SB'],
                                        size=min(path_length-1, 3), replace=False).tolist()
            path_channels.extend(remaining)
            convert_prob = 0.12
        else:
            # 直接搜索路径
            path_length = np.random.randint(1, 4)
            path_channels = np.random.choice(['Google_Brand', 'Google_Generic', 'Amazon_SP', 'Amazon_SB'],
                                            size=path_length, replace=False).tolist()
            convert_prob = 0.18
        
        # 时间戳（相对小时）
        timestamps = sorted(np.random.uniform(0, 72, len(path_channels)))
        converted = np.random.random() < convert_prob
        
        for i, (ch, ts) in enumerate(zip(path_channels, timestamps)):
            journeys.append({
                'user_id': user_id,
                'channel': ch,
                'timestamp_hours': ts,
                'touch_order': i + 1,
                'total_touches': len(path_channels),
                'converted': converted,
                'order_value': np.random.lognormal(4.2, 0.4) if converted and i == len(path_channels)-1 else 0,
            })
    
    return pd.DataFrame(journeys)


def last_click_attribution(journeys_df: pd.DataFrame) -> Dict[str, float]:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2404.09823。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：用户级触点序列（各广告平台 API + UTM 追踪）、订单转化数据、品牌词搜索量数据；需能还原每次转化前的触点链路与先后顺序。

**输出**：各渠道的 Shapley 归因贡献占比、反事实增量估计（卡页案例显示删除 TikTok 预算会使总转化量下降 35%）与渠道预算重分配建议，供投放负责人做月度预算决策。

## 执行步骤

1. 拉取三方广告 API 与 UTM 触点日志，拼出每个用户的跨渠道触点序列。
2. 用 Shapley 值计算各渠道在所有触点组合中的边际贡献，得到重新分配后的归因占比。
3. 用时间衰减修正触点先后顺序对转化的影响。
4. 设计削减某渠道预算的反事实实验，验证其贡献是增量而非相关。
5. 输出渠道贡献表与预算重分配方案，并给出效果跟踪口径。

## 边界与不做

- 何时不用：渠道数据无法对齐（缺 UTM 或用户级触点）时先补埋点；只在单渠道内部做优化不需要本卡。
- 能力边界：产出归因结论与预算建议，不接入广告平台自动调预算，也不保证 ROAS 提升幅度（卡页案例为 2.3x→3.1x）。
- 安全边界：跨平台用户级数据回传、未经同意的 Cookie 追踪属红线，只能用聚合级归因。

## 技能关联

- **前置**：Skill-AIGC-Revenue-Attribution.html、Skill-AIGC-Revenue-Attribution、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Causal-Inference-Fundamentals、Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Data-Collection-Causal-Debiasing.html、Skill-Data-Collection-Causal-Debiasing、Skill-Funnel-Analysis
- **延伸**：Skill-AIGC-Revenue-Attribution.html、Skill-AIGC-Revenue-Attribution、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Causal-Inference-Fundamentals、Skill-Data-Collection-Causal-Debiasing.html、Skill-Data-Collection-Causal-Debiasing
- **可组合**：Skill-AIGC-Revenue-Attribution.html、Skill-AIGC-Revenue-Attribution、Skill-Causal-Inference-Fundamentals、Skill-Nonlinear-Multi-Touch-Attribution

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：14-用户分析　·　源卡：`Skill-Nonlinear-Multi-Touch-Attribution`