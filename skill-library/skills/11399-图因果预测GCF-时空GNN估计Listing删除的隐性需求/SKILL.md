---
name: "p2s-gcf-counterfactual-unobserved-demand"
title: "图因果预测GCF — 时空GNN+Synthetic Control估计Listing删除的隐性需求"
description: "触发词：反事实需求、断货期补数、合成控制、零值污染、Listing断货。何时不用：常规时段的需求预测用「Agent时序预测」，要评估人工预测修正用「预测偏差加减码检测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-GCF-Counterfactual-Unobserved-Demand"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "断货或广告停投期间销量为 0，别把这个 0 当成没需求，用同类品的表现把真实需求补回来。"
user_try: "试试：我的旗舰 ASIN 断货 3 周、销量记成 0，帮我估计断货期的真实需求并给出修正后的备货量。"
whenToUse: "本卡属需求预测的缺失期还原侧：观测销量被断货或停投污染成零值、需要还原真实需求时用；常规时段预测用通用时序预测类技能。"
workflow: "整理目标 SKU 历史销量并标注断货或停投区间 → 选取同品类对照 SKU 并计算相似度 → 用合成控制估计断货期的反事实需求 → 修正预测区间并给出建议备货量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 图因果预测GCF — 时空GNN+Synthetic Control估计Listing删除的隐性需求

## ① 解决的问题

Listing断货/广告暂停期间观测销量为0导致预测系统性低估备货量——GCF时空GNN+合成控制估计真实需求，MAPE降低75.3%，备货推荐准确率提升61.2%

## ② 核心算法逻辑

核心问题：跨境电商存在大量"观测不到的需求"——Listing 被封号、商品搜索被屏蔽、竞品打压导致流量消失——此时记录到的销量是 0，但真实需求并非 0。传统预测模型只能学习"已观测的销量"，会系统性低估备货需求。

## ③ 业务应用场景

吸奶器旗舰 ASIN 因入库超限导致 FBA 断货 3 周，期间销量记录为 0。备货决策时系统预测"日均 5 件"（被历史0值污染），但真实日均需求约 25 件。
GCF 通过同类产品合成控制，估计断货期真实需求为日均 23 件，备货量提升 4.6 倍，避免断货后恢复期的 GMV 损失。
数据要求：目标 SKU 历史销量（含断货期）、同品类对照 SKU 销量、品类相似度特征 预期产出：断货期反事实需求曲线 + 修正后的预测区间 + 建议备货量 业务价值：备货量准确率提升 61.2%，减少因历史0值污染导致的系统性低估，年化防损 5-15 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：MAPE 降低 75.3%（AAAI 2025 验证），备货量推荐准确率↑61.2%，年化减少因历史0值污染导致的系统性低估损失 5-15 万元
实施难度：⭐⭐⭐☆☆（主要是数据处理 + scipy 优化，无复杂 DL 依赖）
优先级：⭐⭐⭐⭐☆（Listing 断货是跨境电商常态，此方法论独特价值高）
企业AI知识库依赖：中 — 需要同品类对照 SKU 历史数据 + 干预事件记录

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（205 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/gcf_counterfactual_unobserved_demand` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-GCF-Counterfactual-Unobserved-Demand.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from typing import List, Optional, Dict, Tuple
from scipy.optimize import minimize
from dataclasses import dataclass

@dataclass
class GCFConfig:
    """GCF 模型配置"""
    n_control_units: int = 10       # 对照 SKU 数量
    pre_period_weight: float = 0.7  # 拟合前期权重
    similarity_threshold: float = 0.3  # 最低相似度阈值
    min_obs: int = 30               # 最少历史观测期数

class SyntheticControlSC:
    """
    供应链 Synthetic Control 反事实需求估计
    
    适用场景：
    - FBA 断货期需求估计
    - Listing 屏蔽期隐性需求
    - 竞品干扰导致的流量损失量化
    """
    
    def __init__(self, config: GCFConfig = None):
        self.config = config or GCFConfig()
        self.weights_: Optional[np.ndarray] = None
        self.control_units_: Optional[List[str]] = None
        self.pre_period_end_: Optional[int] = None
    
    def _compute_sku_similarity(self, target: pd.Series,
                                donors: pd.DataFrame,
                                pre_period_end: int) -> np.ndarray:
        """计算目标SKU与对照SKU的相似度（基于预干预期销量模式）"""
        target_pre = target.values[:pre_period_end]
        similarities = []
        for col in donors.columns:
            donor_pre = donors[col].values[:pre_period_end]
            # 归一化后的 cosine 相似度
            if np.std(target_pre) > 0 and np.std(donor_pre) > 0:
                corr = np.corrcoef(target_pre, donor_pre)[0, 1]
                sim = (corr + 1) / 2  # 映射到 [0, 1]
            else:
                sim = 0.0
            similarities.append(max(0, sim))
        return np.array(similarities)
    
    def fit(self, target: pd.Series, donors: pd.DataFrame,
            intervention_start: int) -> 'SyntheticControlSC':
        """
        拟合合成控制模型
        
        Args:
            target: 目标 SKU 销量时序（含干预期）
            donors: 对照 SKU 矩阵（列=SKU，行=时期）
            intervention_start: 干预开始的时期索引（如断货第一天）
        """
        self.pre_period_end_ = intervention_start
        T_pre = intervention_start
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：目标 SKU 历史销量（含断货期）、同品类对照 SKU 销量、品类相似度特征；SKU×日粒度，另需干预事件（断货、广告暂停）记录。

**输出**：断货期反事实需求曲线、修正后的预测区间与建议备货量，输出给补货决策与 Listing 恢复期运营。

## 执行步骤

1. 整理目标 SKU 历史销量并标注断货或停投区间。
2. 选取同品类对照 SKU 并计算相似度。
3. 用合成控制估计断货期的反事实需求曲线。
4. 修正预测区间并给出建议备货量。

## 边界与不做

- 何时不用：找不到同品类对照 SKU，或没有断货与停投事件记录时无法构造反事实，不适用本技能。
- 能力边界：反事实估计依赖对照品的可比性，同期市场整体波动会影响估计；结果用于修正备货判断，不替代真实销售验证。

## 技能关联

- **前置**：Skill-Causal-Decision-Graph-SC-Inference.html、Skill-Causal-Decision-Graph-SC-Inference、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph、Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **延伸**：Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph、Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **可组合**：Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-GCF-Counterfactual-Unobserved-Demand

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：24-标签工程　·　源卡：`Skill-GCF-Counterfactual-Unobserved-Demand`