---
name: "p2s-mas-ad-budget-multi-platform-negotiation"
title: "MAS多平台广告预算Stackelberg博弈 — 多平台广告Agent序贯博弈预算分配"
description: "触发词：Stackelberg博弈、多平台预算、边际ROAS曲线、先发承诺、序贯决策。何时不用：平台数少于两个或历史不足3个月无法标定边际ROAS曲线时不适用；多硬约束出价调节走约束多目标投放。安全边界：各平台数据须独立标定，不得用其他平台数据优化Amazon竞价，用户级数据须匿名聚合。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-MAS-Ad-Budget-Multi-Platform-Negotiation"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "把各平台当成会争取预算的下游 Agent，用 Stackelberg 序贯博弈算出整体 ROAS 最高的分配方案。"
user_try: "试试：婴儿推车品牌月预算1万美元，Amazon 4.2x、TikTok 2.8x、独立站 6.1x，帮我做 Stackelberg 预算分配。"
whenToUse: "当月预算跨两个以上平台、各平台边际 ROAS 曲线可标定、且希望用先发承诺避免各自最优时用本卡；只把总预算按固定比例分给渠道用多平台预算分配器；带多硬约束的出价调节用约束多目标投放。"
workflow: "用各平台历史花费与收入标定边际 ROAS 曲线 → 设定各平台预算上下限 → Leader 给出初始分配、Follower 求最优响应 → 迭代求解 Stackelberg 均衡分配 → 对比 Nash 与均匀基线给出整体 ROAS 提升"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS多平台广告预算Stackelberg博弈 — 多平台广告Agent序贯博弈预算分配

## ① 解决的问题

广告团队面临"多平台预算分配靠经验判断"——Stackelberg博弈将整体ROAS从3.9x→4.5x+，月预算$10,000时年化增量营收48万元

## ② 核心算法逻辑

广告预算跨平台分配的核心困境：每个平台都想要更多预算（利益冲突），而品牌想要整体ROAS最大化。如果每个平台Agent独立最优化自身，会导致高竞争平台过度投入、低竞争平台欠投入。

## ③ 业务应用场景

场景：婴儿推车品牌三平台广告预算分配（月预算$10,000）
| 平台 | 特点 | 当前分配 | 历史ROAS | |------|------|---------|---------| | Amazon | 高意向、高CPC、确定性强 | $6,000 | 4.2x | | TikTok | 高曝光、低CPC、转化不确定 | $3,000 | 2.8x | | 独立站 | 忠诚用户复购、低成本 | $1,000 | 6.1x |
- 业务问题：月均总ROAS 3.9x，而独立站ROAS最高却只分到10%预算，存在明显优化空间 - 数据要求：各平台历史花费-收入数据（≥3个月），边际ROAS曲线（增量预算的边际回报） - 预期产出：Stackelberg均衡分配方案 + 预计整体ROAS提升量 - 业务价值：同等预算下ROAS从3.9x→4.5x+，月增量营收约 3-6万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月广告预算$10,000的品牌，ROAS从3.9x→4.5x，月增量收入 $6,000（约4万元），年化约 48万元；大品牌（月预算$100,000+）年化价值 500万元+
Stackelberg vs Nash均衡：Stackelberg（先发优势）比Nash（同时决策）整体ROAS高5-12%，因为Leader可以通过预承诺避免囚徒困境
实施难度：⭐⭐⭐⭐☆（需要各平台历史数据标定边际ROAS曲线，需2-3个月数据）
优先级：⭐⭐⭐⭐☆（中高优先，多平台运营规模≥月$5,000时ROI显著）
成本：边际ROAS曲线标定需统计分析师0.5人月+数据工程师0.3人月；每次重新求解计算资源可忽略（单机Python）；持续监控需搭建看板（约1人周）
合规：Stackelberg博弈本身不涉及价格合谋或数据共享；但需注意：Amazon广告条款禁止“利用其他平台数据优化Amazon竞价”，因此模型输入中Amazon侧数据应独立标定，不引入TikTok/独立站转化数据；GDPR下用户级数据需匿名聚合

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（149 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy.optimize import minimize

class PlatformAgent:
    """单平台广告Agent（Stackelberg Follower）"""
    
    def __init__(self, platform_id: str, alpha: float, beta: float, 
                 min_budget: float, max_budget: float):
        """
        alpha, beta: 边际ROAS曲线参数 (ROAS = alpha * budget^(-beta))
        实际含义: 预算越高，边际回报递减
        """
        self.platform_id = platform_id
        self.alpha = alpha
        self.beta = beta  # 递减指数
        self.min_budget = min_budget
        self.max_budget = max_budget
    
    def compute_roas(self, budget: float) -> float:
        """计算给定预算下的ROAS"""
        if budget <= 0:
            return 0
        return self.alpha * (budget / 1000) ** (-self.beta)
    
    def compute_revenue(self, budget: float) -> float:
        """计算总收入"""
        return budget * self.compute_roas(budget)
    
    def marginal_roas(self, budget: float) -> float:
        """边际ROAS（增加1美元的额外回报）"""
        delta = 1.0
        return (self.compute_revenue(budget + delta) - self.compute_revenue(budget)) / delta
    
    def best_response(self, allocated_budget: float) -> dict:
        """给定分配预算，Follower的最优响应（在预算约束内）"""
        optimal_budget = np.clip(allocated_budget, self.min_budget, self.max_budget)
        return {
            'platform': self.platform_id,
            'allocated_budget': allocated_budget,
            'optimal_spend': optimal_budget,
            'expected_roas': round(self.compute_roas(optimal_budget), 2),
            'expected_revenue': round(self.compute_revenue(optimal_budget), 0),
        }


class StackelbergBudgetOrchestrator:
    """品牌总控Agent（Stackelberg Leader）"""
    
    def __init__(self, platform_agents: list, total_budget: float):
        self.platforms = platform_agents
        self.total_budget = total_budget
    
    def compute_total_roas(self, budget_allocation: np.ndarray) -> float:
        """计算给定分配方案的整体ROAS"""
        total_revenue = 0
        total_spend = 0
        for i, agent in enumerate(self.platforms):
            budget = budget_allocation[i]
            total_revenue += agent.compute_revenue(budget)
            total_spend += budget
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2406.11247 — STEVE Series: Step-by-Step Construction of Agent Systems in Minecraft

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：各平台至少 3 个月的历史花费与收入数据、边际 ROAS 曲线参数（ROAS 随预算递减的 alpha 与 beta），以及各平台的预算上下限与月度总预算。

**输出**：Stackelberg 均衡下的各平台预算分配方案、预计整体 ROAS 与相对 Nash 同时决策及均匀基线的提升幅度，供品牌投放决策层采用。

## 执行步骤

1. 采集各平台至少 3 个月的花费与收入数据
2. 标定每个平台的边际 ROAS 递减曲线参数
3. 设定各平台分配预算的最小与最大边界
4. 由品牌总控 Agent 给出初始分配，各平台 Agent 求最优响应
5. 迭代至均衡并计算整体 ROAS 与预期收入
6. 对比 Nash 同时决策与均匀基线的结果

## 边界与不做

- 何时不用：平台数少于两个、或历史不足 3 个月无法标定边际 ROAS 曲线时不适用；只在单一平台内做约束出价用约束多目标投放技能。
- 能力边界：只产出分配方案与 ROAS 预估，不执行平台预算变更；均衡解依赖边际 ROAS 曲线的标定质量。
- 合规边界：Amazon 广告条款禁止利用其他平台数据优化 Amazon 竞价，Amazon 侧数据须独立标定；GDPR 下用户级数据须匿名聚合。

## 技能关联

- **前置**：Skill-LLM-AutoBidding-MAS.html、Skill-LLM-AutoBidding-MAS、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MAS-Dynamic-Pricing-Coalition.html、Skill-MAS-Dynamic-Pricing-Coalition、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-MAS-Resource-Scheduling.html、Skill-MAS-Resource-Scheduling、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI
- **延伸**：Skill-MAS-Dynamic-Pricing-Coalition.html、Skill-MAS-Dynamic-Pricing-Coalition、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-MAS-Resource-Scheduling.html、Skill-MAS-Resource-Scheduling、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI
- **可组合**：Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-MAS-Ad-Budget-Multi-Platform-Negotiation

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：10-MAS　·　源卡：`Skill-MAS-Ad-Budget-Multi-Platform-Negotiation`