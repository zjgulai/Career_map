---
name: "p2s-stamimputer-spatiotemporal"
title: "时空注意力混合专家补全 - 高缺失率下的多维流量恢复"
description: "触发词：时空补全、流量矩阵、混合专家、高缺失率、多渠道归因。何时不用：缺失是整段连续块时走块缺失补全；要做采集异常告警走数据质量监控。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-STAMImputer-SpatioTemporal"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "渠道流量矩阵缺了一大半，也能把空格子补回来，让跨渠道对比重新可信。"
user_try: "试试：这个渠道乘日期乘页面类型的流量矩阵缺了六成，帮我补全再做归因。"
whenToUse: "多维张量数据缺失率高、且空间（渠道）与时间都存在可比结构时用；缺失是整段连续块时改用块缺失补全。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 时空注意力混合专家补全 - 高缺失率下的多维流量恢复

## ① 解决的问题

运营分析师面临门店时空数据断点——STAMImputer将缺失率从18%降到4%，年化省10万元

## ② 核心算法逻辑

现有时序→空间的序贯方法在块状缺失（blockmissing）场景下失效——当某个渠道或时段整块数据缺失时，无法提取有效特征。同时，静态图结构无法适应分布偏移（非平稳流量数据的动态空间依赖）。

## ③ 业务应用场景

母婴品牌在多个跨境渠道（Amazon、Shopee、独立站、TikTok Shop、Lazada 等）运营，每天/每周的流量矩阵为 `(渠道数 × 日期 × 页面类型)` 的三维张量。实际中约 60% 的单元格缺失： - 新渠道上线初期：数据覆盖不完整 - 区域性断流：某些市场的爬虫/API 限流导致整块数据丢失（块缺失） - 小渠道低频流量：日活不足导致页面维度稀疏（点缺失）
现有做法：均值填充或直接忽略缺失，导致： - 归因分析严重偏差（认为某渠道"无流量"实为数据缺失） - 跨渠道对比失真，决策基础不可靠 - 时序模型（预测/异常检测）因缺失而精度下降
将渠道视为"空间节点"（graph nodes），日期为时间维度（time steps），页面类型为特征维度（features）： - 空间节点：5-20 个渠道节点，邻接关系由业务相似性（同大促、同受众）定义 - 时间步：过去 30-90 天日粒度数据 - 特征：各渠道各页面类型的日流量数

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10-30 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（860 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/user_analytics/stamimputer_spatiotemporal` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-STAMImputer-SpatioTemporal.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
STAMImputer - 时空注意力 MoE 流量矩阵补全
论文: STAMImputer: Spatio-Temporal Attention MoE for Traffic Data Imputation (IJCAI 2025)
应用: 母婴出海跨境电商多渠道流量矩阵补全（60%缺失率）

依赖: numpy, scipy, pandas, torch (CPU 可用)
"""

import numpy as np
import pandas as pd
from typing import Optional, Tuple, Dict, List
import warnings

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    warnings.warn("PyTorch 未安装，将使用纯 NumPy 简化实现（推理精度略低）")


# ─────────────────────────────────────────────────────────────
# 1. 低秩引导采样图注意力 (LrSGAT) - NumPy 实现
# ─────────────────────────────────────────────────────────────

class LrSGATNumpy:
    """
    LrSGAT 的 NumPy 简化实现（无需 GPU）

    核心步骤:
      1. 采样投影器：从静态邻接矩阵采样低维注意力向量
      2. 低秩重注意力：低秩矩阵分解过滤冗余关系
      3. 半自适应动态图：用注意力向量生成动态邻接矩阵
    """

    def __init__(
        self,
        n_nodes: int,
        in_features: int,
        rank: int = 4,
        alpha: float = 0.5,
    ):
        """
        Args:
            n_nodes:     空间节点数（渠道数）
            in_features: 输入特征维度（页面类型数 or 时序特征维度）
            rank:        低秩近似的秩 r
            alpha:       静态图与动态图的混合权重（0=全动态, 1=全静态）
        """
        self.n = n_nodes
        self.d = in_features
        self.rank = rank
        self.alpha = alpha

        # 可学习参数（用随机初始化简化）
        np.random.seed(42)
        self.W_proj = np.random.randn(in_features, rank) * 0.1  # 投影矩阵
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：多维流量矩阵（渠道乘日期乘页面类型）与缺失位置标记；渠道邻接关系按业务相似性定义（卡页场景 5-20 个渠道节点、30-90 天日粒度）

**输出**：补全后的完整流量矩阵与补全标记，供跨渠道对比、归因分析与时序模型使用

## 执行步骤

1. 把渠道当空间节点、日期当时间步、页面类型当特征，整理成张量。
2. 按业务相似性（同大促、同受众）定义渠道节点邻接关系。
3. 用时空注意力与混合专家结构对缺失位置做补全。
4. 回填结果并标注补全来源，再复跑归因与预测验证改善。

## 边界与不做

- 何时不用：缺失是整段连续的块（如连续多天整块为空）时，请转块缺失补全。
- 能力边界：补全值属于估计，用于分析与建模，不当作真实观测用于结算或对外披露。
- 能力边界：渠道邻接关系由业务定义，定义偏差会直接污染补全结果，需业务确认。

## 技能关联

- **前置**：Skill-BlockEcho-Missing-Data.html、Skill-BlockEcho-Missing-Data、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Utimac-Uncertainty-Completion.html、Skill-Utimac-Uncertainty-Completion
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Utimac-Uncertainty-Completion.html、Skill-Utimac-Uncertainty-Completion
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-STAMImputer-SpatioTemporal

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：14-用户分析　·　源卡：`Skill-STAMImputer-SpatioTemporal`