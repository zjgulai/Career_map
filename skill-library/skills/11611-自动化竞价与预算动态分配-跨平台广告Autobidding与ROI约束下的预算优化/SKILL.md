---
name: "p2s-autobidding-budget-allocation-optimization"
title: "自动化竞价与预算动态分配 — 跨平台广告Autobidding与ROI约束下的预算优化"
description: "触发词：自动竞价、最优出价系数、预算动态分配、跨活动重分配、ROAS 约束。何时不用：只需测算单关键词出价上限时用拍卖理论竞价技能；本技能面向多活动的整体出价与预算动态控制。安全边界：不得使用竞品品牌词作关键词；转化追踪须确认合规状态，文案不得使用绝对化用语描述效果。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Autobidding-Budget-Allocation-Optimization"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "让出价和预算分配自动跟着转化价值走，把每周手动调价的时间省下来，同时压掉低效花费。"
user_try: "试试：用我 90 天的广告数据给出初始出价与预算分配方案，并配置每日按预算执行率调整的规则。"
whenToUse: "广告活动数量多、需要整账户动态调价与预算再分配时用本技能；单关键词出价上限用拍卖理论竞价技能。"
workflow: "接入关键词维度广告数据与竞价历史 → 按转化价值计算初始最优出价 → 每日按预算执行率调整约束系数 → 每周做跨活动预算重分配"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 自动化竞价与预算动态分配 — 跨平台广告Autobidding与ROI约束下的预算优化

## ① 解决的问题

手动竞价耗时8小时/周且ROAS仅2.1x——KKT最优竞价+PID预算控制将ROAS提升至3.2x并节省30%低效广告支出，月化$1.5万节省

## ② 核心算法逻辑

反直觉洞察：大多数母婴出海卖家用手动竞价或"自动竞价"，但平台自动竞价是为平台利益最大化设计的，不是为了卖家ROI。反直觉的是：最优广告策略不是"出价尽量高以获取最大流量"，也不是"削减预算保利润"，而是在ROI约束下的拉格朗日对偶预算分配——数学上可以证明存在一个唯一的最优乘子λ，使得"每一美元广告预算的边际ROI相等"时，总ROI最大化。

## ③ 业务应用场景

场景A：Amazon婴儿用品SP广告智能竞价
- 业务问题：某母婴卖家同时运营80个SP广告活动，手动调价耗时每周8小时，且总ROAS仅2.1x（行业基准3.0x+）。广告预算$5万/月，约30%浪费在低ROI词上 - 数据要求：过去90天广告数据（关键词维度：展现量/点击量/花费/销售额）、竞价历史、竞品出价估算（第三方工具） - 算法应用： 1. 计算每个关键词的历史转化价值 v_i = 平均订单价值 × 历史转化率 2. 用KKT竞价公式设定初始出价：`bid = v_i / (1 + λ_0)`，λ_0=0.3（初始保守） 3. 每天运行一次PID更新：根据昨日预算执行率调整λ 4. 每周一次跨活动预算重分配（Markowitz优
三轨验证： - 成本：显性成本包括第三方竞品出价工具订阅费（约$500-1500/月）、数据仓库存储与计算资源（约$200-500/月）、1名广告运营人员每周1小时监控告警。总月成本约$1000-2500。 - 合规：Amazon广告政策允许基于转化价值的自动出价，但禁止使用竞品品牌词作为关键词（需在关键词列表中过滤品牌词）；GDPR要求转化追踪需用户同意（需确认Amazon Pixel合规状态）；中国广告法要求不得使用"最佳""第一"等绝对化用语描述广告效果。 - 风险：PID参数不当可能导致λ振荡，引发出价剧烈波动（需设置λ变化速率上限）；过度优化低ROI词可能错失品牌曝光机会；若竞品同步

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：广告运营面临核心业务决策——母婴 Sponsored Ads ROAS 提升 25%，年化增收 38 万元
实施难度：⭐⭐⭐☆☆（3/5星，需要历史数据积累 3 个月以上）
优先级：⭐⭐⭐⭐☆（4/5星，直接影响核心业务指标）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（264 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/autobidding_budget_allocation_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Autobidding-Budget-Allocation-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
自动化竞价与预算动态分配系统
功能：KKT最优竞价 + PID预算控制 + 跨平台Markowitz分配
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from scipy.optimize import minimize
import warnings
warnings.filterwarnings('ignore')


@dataclass
class KeywordBidContext:
    """关键词竞价上下文"""
    keyword: str
    historical_cvr: float          # 历史转化率
    avg_order_value: float         # 平均订单价值(USD)
    avg_cpc: float                 # 当前平均CPC(USD)
    weekly_impressions: int        # 周展现量
    campaign_id: str = "default"
    
    @property
    def conversion_value(self) -> float:
        """转化价值 = 转化率 × 订单价值"""
        return self.historical_cvr * self.avg_order_value


class KKTAutoBidder:
    """
    基于KKT条件的最优竞价系统
    实现 bid* = v / (1 + λ) 的动态竞价策略
    """
    
    def __init__(self, target_roas: float = 3.0, initial_lambda: float = 0.3):
        self.target_roas = target_roas
        self.lambda_val = initial_lambda  # 预算影子价格
        
        # PID控制参数
        self.pid_kp = 0.5   # 比例增益
        self.pid_ki = 0.1   # 积分增益
        self.pid_kd = 0.05  # 微分增益
        self._integral = 0.0
        self._prev_error = 0.0
    
    def compute_optimal_bid(self, keyword: KeywordBidContext) -> float:
        """
        计算最优出价
        bid* = conversion_value / (1 + λ)
        """
        optimal_bid = keyword.conversion_value / (1 + self.lambda_val)
        # 出价不低于$0.10，不超过转化价值的2倍（防止极端竞价）
        return np.clip(optimal_bid, 0.10, keyword.conversion_value * 2)
    
    def update_lambda_pid(self, budget_target: float, budget_consumed: float, dt: float = 1.0):
        """
        PID控制器更新λ
        超支 → 增大λ（压低出价）
        欠消耗 → 减小λ（提高出价）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.14025，但该号在 arXiv 上是《Stokes flow of an evolving fluid film with arbitrary shape and topology》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：关键词级历史广告数据（展现、点击、花费、销售额，建议 90 天以上）、竞价历史、竞品出价估算与预算约束。

**输出**：各关键词的初始出价与每日调整规则（含系数变化速率上限）、跨活动预算重分配方案与低效花费削减清单；供广告运营执行。

## 执行步骤

1. 接入关键词历史广告数据与预算约束
2. 按平均订单价值与转化率计算关键词转化价值
3. 设定初始出价与保守约束系数
4. 配置每日按预算执行率更新的规则与速率上限
5. 每周跨活动重分配预算并输出削减清单

## 边界与不做

- 历史数据不足（如少于 3 个月）时不宜启用自动出价，不用本技能。
- 本技能输出出价系数与分配方案，不直接执行广告平台改价动作。
- 安全边界：不得使用竞品品牌词作关键词；转化追踪需确认合规状态；文案不得使用绝对化用语描述效果。

## 技能关联

- **前置**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **延伸**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **可组合**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Autobidding-Budget-Allocation-Optimization

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-Autobidding-Budget-Allocation-Optimization`