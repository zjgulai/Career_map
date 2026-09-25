---
name: "p2s-whatsapp-private-domain-analytics"
title: "WhatsApp Private Domain Analytics — Shapley Value 多渠道归因与私域触达效率分析"
description: "触发词：私域归因、Shapley价值、WhatsApp贡献、触点序列、归因窗口。何时不用：只有单一私域渠道时不适用；公域广告渠道归因走多触点归因类技能。安全边界：WhatsApp触达须用户明确opt-in，用户ID须匿名化，不得未经同意把WhatsApp号码与Email直接关联用于分析。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-WhatsApp-Private-Domain-Analytics"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用 Shapley 归因算清 WhatsApp、Email、SMS 各自对复购的真实贡献，再决定私域预算怎么分。"
user_try: "试试：德国市场开了3个月 WhatsApp Business，帮我用 Shapley 归因算它相对 Email 和 SMS 的真实复购贡献。"
whenToUse: "当同时运营两三个私域触达渠道、并且不确定哪个渠道真正驱动复购时用本卡；公域与私域混合的全链路归因用 DTC 获客归因；只做渠道级预算比例分配用多平台分配技能。"
workflow: "采集用户级触点序列与归因窗口内购买记录 → 统计各渠道接触组合的联合转化情况 → 按所有子集计算各渠道 Shapley 边际贡献 → 结合发送成本算出单位成本效率 → 输出贡献率与预算调整建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# WhatsApp Private Domain Analytics — Shapley Value 多渠道归因与私域触达效率分析

## ① 解决的问题

东南亚运营面临"WhatsApp私域投入了钱但不知道对复购贡献多少"——Shapley公平归因将WhatsApp渠道真实ROI透明化，帮助预算决策年化影响$8.6万

## ② 核心算法逻辑

问题：德国/东南亚 DTC 品牌同时运营 WhatsApp、Email、SMS 三个私域渠道，但不知道哪个渠道真正驱动了复购。「末次归因」把全部功劳给最后一个渠道；「首次归因」把功劳给第一个渠道；两者都不公平，导致预算分配失真。

## ③ 业务应用场景

场景A：德国市场 WhatsApp vs Email 复购贡献评估
- 业务问题：德国市场开通 WhatsApp Business 渠道 3 个月，发送成本是 Email 的 4 倍，但每次活动看起来 WhatsApp 后的购买量很高——不确定是 WhatsApp 真正促成，还是用户本来就会买、只是碰巧收到了 WhatsApp - 数据要求：用户触点序列（渠道、时间、动作），触点归因窗口内（7 天）的购买记录；每个用户的渠道接触组合（如「Email → WhatsApp → 购买」或「仅 WhatsApp → 购买」） - 预期产出：WhatsApp 的 Shapley 归因贡献率（如 38%），vs Email（45%）、SMS（17%），计算每渠道的「成本
三轨验证： - 成本：需搭建跨渠道触点数据管道（CDP 或自建事件追踪），工程成本约 $8,000-15,000 一次性 + $1,500/月维护；Shapley 计算本身无额外计算成本 - 合规：GDPR 要求 WhatsApp 触达需用户明确 opt-in，且归因分析中用户 ID 必须匿名化处理；德国市场严禁将 WhatsApp 号码与 Email 直接关联用于未经同意的分析 - 风险：若 WhatsApp 贡献率被低估，过早削减预算可能导致高价值用户流失（因 WhatsApp 高打开率对紧急/高价值通知不可替代）；归因窗口选择偏差（7 天 vs 14 天）可能翻转结论

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月私域运营预算 $3,300 场景，Shapley 归因优化预算分配后，整体私域 ROI 提升 15-22%；以月私域驱动收入 $12,000 计，年化增收 $21,600-31,680；避免错配浪费的渠道成本约 $8,400/年
实施难度：⭐⭐⭐☆☆（Shapley 计算逻辑清晰，但需要跨渠道触点数据采集管道，是主要工程门槛）
优先级：⭐⭐⭐⭐☆（进入多渠道运营（WhatsApp + Email + SMS）后必做，单渠道品牌可跳过）
评估依据：WhatsApp Business 在德国、荷兰、东南亚的 DTC 品牌已成标配，但「WhatsApp 是否真的有效」的量化争议持续，Shapley 是解决这一争议的最公认方法；渠道数≤4 时计算成本极低

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（226 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/whatsapp_private_domain_analytics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-WhatsApp-Private-Domain-Analytics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多渠道归因 Shapley Value 计算 + 私域渠道 ROI 分析
依赖: numpy, pandas, itertools（标准库，无需 API key）
"""
import numpy as np
import pandas as pd
from itertools import combinations, permutations
from typing import Dict, List, Set, Tuple, Callable
from collections import defaultdict


def generate_touchpoint_data(n_users: int = 800, seed: int = 42) -> pd.DataFrame:
    """
    生成模拟多渠道触点数据（德国市场奶粉复购场景）
    
    渠道：whatsapp / email / sms
    真实贡献：email 贡献最高（用户已建立信任），whatsapp 辅助
    """
    rng = np.random.default_rng(seed)
    channels = ['whatsapp', 'email', 'sms']
    
    records = []
    for uid in range(n_users):
        user_id = f'DE_{uid:04d}'
        
        # 随机分配该用户接触的渠道组合（模拟真实接触路径）
        n_touchpoints = rng.integers(1, 4)
        touched_channels = list(rng.choice(channels, size=min(n_touchpoints, 3), replace=False))
        
        # 基于真实贡献矩阵计算转化概率
        base_p = 0.05  # 无渠道触达基础转化率
        
        # 各渠道边际贡献（真实值，仅用于仿真）
        marginal = {'email': 0.08, 'whatsapp': 0.05, 'sms': 0.03}
        
        # 假设渠道间有衰减（重复触达效果递减）
        conversion_prob = base_p
        for i, ch in enumerate(touched_channels):
            decay = 0.7 ** i  # 第 i+1 次触达效果衰减
            conversion_prob += marginal.get(ch, 0) * decay
        
        purchased = rng.random() < min(conversion_prob, 0.95)
        
        records.append({
            'user_id': user_id,
            'channels_touched': touched_channels,
            'n_touches': len(touched_channels),
            'purchased': int(purchased),
            'order_value': rng.uniform(40, 120) if purchased else 0
        })
    
    return pd.DataFrame(records)


def compute_coalition_value(
    df: pd.DataFrame,
    coalition: Set[str]
) -> float:
    """
    计算渠道联合（coalition）的转化价值
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2302.08951，但该号在 arXiv 上是《Bi-Lipschitz quasiconformal extensions》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户级触点序列（渠道、时间、动作）与归因窗口（如 7 天）内的购买记录、各用户的渠道接触组合，以及各渠道的发送成本；用户标识需匿名化。

**输出**：各私域渠道的 Shapley 归因贡献率（如 WhatsApp 38%、Email 45%、SMS 17% 的量级）与单位成本效率、预算调整建议，供私域运营与财务决策。

## 执行步骤

1. 采集用户级触点序列（渠道、时间、动作）与归因窗口内的购买记录
2. 统计各渠道接触组合的联合转化情况
3. 按所有可能子集计算各渠道的 Shapley 边际贡献
4. 结合各渠道发送成本计算单位成本效率
5. 输出各渠道贡献率与预算调整建议

## 边界与不做

- 何时不用：只有单一私域渠道、或归因窗口选择会翻转结论且未做敏感性对比时不应据此调整预算。
- 能力边界：只做归因与预算建议，不改动触达策略；贡献率被低估时过早削减预算可能导致高价值用户流失。
- 合规边界：WhatsApp 触达须用户明确 opt-in，用户 ID 须匿名化，不得未经同意把 WhatsApp 号码与 Email 直接关联用于分析。

## 技能关联

- **前置**：Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Email-Sequence-Multiarm-Optimizer.html、Skill-Email-Sequence-Multiarm-Optimizer、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-RFM-to-Action-Policy-Engine.html、Skill-RFM-to-Action-Policy-Engine
- **延伸**：Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Email-Sequence-Multiarm-Optimizer.html、Skill-Email-Sequence-Multiarm-Optimizer、Skill-RFM-to-Action-Policy-Engine.html、Skill-RFM-to-Action-Policy-Engine
- **可组合**：Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Email-Sequence-Multiarm-Optimizer.html、Skill-Email-Sequence-Multiarm-Optimizer、Skill-WhatsApp-Private-Domain-Analytics

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：06-增长模型　·　源卡：`Skill-WhatsApp-Private-Domain-Analytics`