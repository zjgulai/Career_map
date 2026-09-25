---
name: "p2s-bayesian-mmm-action-plan-generator"
title: "Bayesian MMM Action Plan Generator — 贝叶斯后验分布生成保守/中性/激进三版预算方案"
description: "触发词：贝叶斯MMM、预算情景方案、保守中性激进、后验不确定性、季度预算规划。何时不用：没有MMM后验输出或后验样本量不足时，先做识别与后验估计；只要单一最优分配、不需要多情景对比时，走普通预算分配类技能。安全边界：仅处理聚合ROI数据，不生成对外广告创意，三套方案须经CMO审阅后才可下发。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 情景模拟"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Bayesian-MMM-Action-Plan-Generator"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 MMM 后验结果变成保守、中性、激进三套预算方案，让季度预算决策从三天缩短到两小时。"
user_try: "试试：用已有的MMM后验ROI样本，为下季度30万美元预算出保守、中性、激进三版分配方案。"
whenToUse: "当贝叶斯后验已完成、需要把不确定性摊成多档方案供决策层选时用本卡；只要单一最优分配（无情景对比需求）用 MMM 预算利润对齐；预算已定、只差把权重下发给渠道时用 MMM 预算再分配执行器。"
workflow: "取各渠道 MCMC 后验 ROI 采样与季度总预算 → 设定单渠道最低权重与 P10/P50/P90 三档分位点 → 按分位 ROI 比例算权重并施加最低权重约束 → 蒙特卡洛模拟估算各方案预计 ROAS → 输出三版方案与适用场景供 CMO 选版"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Bayesian MMM Action Plan Generator — 贝叶斯后验分布生成保守/中性/激进三版预算方案

## ① 解决的问题

CMO面临"季度预算规划耗时3天且缺乏不确定性量化"——贝叶斯后验生成保守/中性/激进三版方案，决策时间压缩至2小时，年化人效节省$80,000

## ② 核心算法逻辑

论文：Inferring causal impact using Bayesian structural timeseries models | arXiv：1706.04498 | 会议：JMLR (基于Brodersen et al. 2015的贝叶斯因果推断框架扩展)

## ③ 业务应用场景

场景：母婴品牌Q3预算规划（总预算$300,000） - 触发条件：Q2 MMM模型更新完成，贝叶斯后验显示YouTube ROI不确定性较大（后验方差高），适合输出多方案 - 执行动作： - 保守方案：Facebook 45%($135K)，Google 35%($105K)，YouTube 15%($45K)，TikTok 5%($15K)——适合竞争激烈期 - 中性方案：Facebook 35%($105K)，Google 30%($90K)，YouTube 25%($75K)，TikTok 10%($30K)——常规增长期 - 激进方案：Facebook 25%($75K)，Googl
成本轨： - 数据采集费用：$0（复用现有MMM后验输出，无额外采集成本） - 计算资源：蒙特卡洛模拟1000次迭代，单次执行耗时<5秒，云计算成本<$0.10/次 - 人力投入：方案生成自动化，CMO审阅+决策<30分钟，折合人力成本$250/季度 - 总成本：$250/季度（仅人力审阅成本）
合规轨： - Amazon政策：✅ 合规。预算分配方案不涉及虚假宣传、刷单或平台禁止行为，仅为内部财务规划工具 - GDPR：✅ 合规。算法仅处理聚合ROI数据，不涉及个人数据处理 - 广告法：✅ 合规。生成的预算方案不产生对外广告创意，无虚假宣传风险 - 跨境贸易法规：✅ 合规。预算分配为内部决策，不涉及商品进出口、关税或汇兑问题 - 结论：无合规风险，可直接部署

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：季度预算规划质量提升，CMO决策时间-70%，ROAS较基线提升10-20%
实施难度：⭐⭐☆☆☆（贝叶斯MMM已有输出时接入简单）
优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（171 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import Dict, List, Tuple, Optional

def bayesian_mmm_action_plan_generator(
    posterior_roi_samples: Dict[str, np.ndarray],
    total_budget: float,
    min_channel_weights: Optional[Dict[str, float]] = None,
    conservative_quantile: float = 0.10,
    neutral_quantile: float = 0.50,
    aggressive_quantile: float = 0.90
) -> Dict:
    """
    贝叶斯MMM多方案预算生成器
    
    参数:
        posterior_roi_samples: {"channel": np.array([roi_sample_1, ...])}，来自MCMC后验采样
        total_budget: 总预算
        min_channel_weights: 各渠道最低预算权重约束（如 {"Facebook": 0.25}）
        conservative/neutral/aggressive_quantile: 三个方案对应的ROI分位数
    
    返回:
        三个方案的预算分配 + 预计ROAS + 适用场景说明
    """
    channels = list(posterior_roi_samples.keys())
    n_channels = len(channels)
    
    if min_channel_weights is None:
        min_channel_weights = {}
    
    def compute_plan_from_roi_quantile(quantile: float, scenario_name: str) -> Dict:
        """给定分位数，计算最优预算分配"""
        roi_at_q = {}
        for c in channels:
            roi_val = float(np.percentile(posterior_roi_samples[c], quantile * 100))
            roi_at_q[c] = roi_val
        
        # 按ROI比例分配（含最低权重约束）
        roi_values = np.array([roi_at_q[c] for c in channels])
        roi_values = np.maximum(roi_values, 0.01)  # 避免负ROI导致的问题
        
        # 简单比例分配
        raw_weights = roi_values / roi_values.sum()
        
        # 应用最低权重约束
        constrained_weights = raw_weights.copy()
        for i, c in enumerate(channels):
            min_w = min_channel_weights.get(c, 0.0)
            if constrained_weights[i] < min_w:
                constrained_weights[i] = min_w
        
        # 重新归一化
        weight_sum = constrained_weights.sum()
        if weight_sum > 0:
            constrained_weights = constrained_weights / weight_sum
        
        budgets = {}
        for c, w in zip(channels, constrained_weights):
            budgets[c] = round(total_budget * float(w), 2)
        
        # 计算预计ROAS（蒙特卡洛模拟）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1706.04498，但该号在 arXiv 上是《Net reaction rate and neutrino emissivity for the Urca process in departure from chemical equilibrium》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Inferring causal impact using Bayesian structural timeseries models》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道 MCMC 后验 ROI 采样数组（形如 {渠道: array}，来自贝叶斯 MMM 的 MCMC 后验）、季度总预算、可选的单渠道最低预算权重约束，以及保守/中性/激进三档 ROI 分位点（默认 0.10/0.50/0.90）。

**输出**：保守、中性、激进三套渠道级预算分配金额，附各方案预计 ROAS 与适用场景说明，交 CMO 与财务审阅后作为季度投放基准。

## 执行步骤

1. 汇总各渠道 MCMC 后验 ROI 采样与季度总预算
2. 设定单渠道最低预算权重与三档 ROI 分位点
3. 按分位数取各渠道 ROI 并折算为原始分配权重
4. 施加最低权重约束后重新归一化，算出各渠道预算金额
5. 用蒙特卡洛模拟估算每个方案的预计 ROAS
6. 输出三版方案与适用场景说明供 CMO 审阅决策

## 边界与不做

- 何时不用：没有 MMM 后验输出、或各渠道后验样本量不足时应先补齐上游估计；只需单一最优解、不需要情景对比时不必用本卡。
- 能力边界：只产出方案文本与分配金额，不调用任何平台 API 改预算，也不生成对外广告创意。
- 参数边界：分位数与最低权重属使用者输入的业务护栏，本卡不判断这些参数本身是否合理。

## 技能关联

- **前置**：Skill-Channel-Budget-Reallocation-Trigger.html、Skill-Channel-Budget-Reallocation-Trigger、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Identified-Bayesian-MMM.html、Skill-Identified-Bayesian-MMM、Skill-MMM-Budget-Reallocation-Executor.html、Skill-MMM-Budget-Reallocation-Executor
- **延伸**：Skill-Channel-Budget-Reallocation-Trigger.html、Skill-Channel-Budget-Reallocation-Trigger、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-MMM-Budget-Reallocation-Executor.html、Skill-MMM-Budget-Reallocation-Executor
- **可组合**：Skill-Channel-Budget-Reallocation-Trigger.html、Skill-Channel-Budget-Reallocation-Trigger、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Bayesian-MMM-Action-Plan-Generator

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：15-营销投放分析　·　源卡：`Skill-Bayesian-MMM-Action-Plan-Generator`