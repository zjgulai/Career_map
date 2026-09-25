---
name: "p2s-blockecho-missing-data"
title: "块缺失数据补全 - 整段流量数据丢失时的恢复"
description: "触发词：块缺失、整段缺失、数据补全、GAN 补数、流量恢复。何时不用：只是零散单元格缺失（点缺失）时常规插补即可；要监控采集延迟与缺失告警走数据质量监控。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-BlockEcho-Missing-Data"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "整段流量数据丢了（比如追踪代码故障三天），也能把这一块补回来，不影响归因和预算。"
user_try: "试试：TikTok Pixel 故障丢了三天数据，帮我把这块转化率矩阵补回来。"
whenToUse: "缺失是整块整段（连续多天、某个渠道整段空缺）时用；只是零散单元格缺失，用常规插补即可。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 块缺失数据补全 - 整段流量数据丢失时的恢复

## ① 解决的问题

数据经理面临缺失值拖慢分析——BlockEcho将补数耗时从4小时降到30分，年化省8万元

## ② 核心算法逻辑

块缺失（Blockwise Missing）的独特挑战：当一整段时间（如连续3天）或一个完整维度（如某渠道所有数据）缺失时，传统插值方法（线性插值、KNN、MICE）依赖"相邻元素"做预测，在块缺失场景下这些邻居全部不存在，方法直接失效。

## ③ 业务应用场景

业务问题：TikTok Pixel 追踪代码因版本更新故障，导致连续3天的广告点击/转化数据完全丢失（块缺失）。数据维度：`(日期×广告素材×受众包)` 的转化率矩阵，30天中有3天（第10-12天）整块缺失。
运营团队面临困境： - 无法评估那3天的广告效果，素材打分异常 - 缺失数据导致 ROAS 计算偏低，影响下月预算审批 - 桑基图中"TikTok 广告"整个时间段断裂，渠道归因失真
传统方法的失败：线性插值需要知道第10-12天的某些相邻值，但整块为空；均值填充忽略了大促期间的流量峰值特征；MICE 依赖变量间相关性但整块缺失无局部参照。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

15%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（754 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/user_analytics/blockecho_missing_data` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-BlockEcho-Missing-Data.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
BlockEcho: 块缺失数据补全 - GAN + Matrix Factorization 联合框架
论文: IJCAI 2024 - BlockEcho: Retaining Long-Range Dependencies for Imputing Block-Wise Missing Data
arXiv: 2402.18800
应用: 母婴出海广告数据整段丢失恢复（TikTok Pixel 故障 / Facebook 账户暂停等场景）

依赖: torch>=1.8, numpy, pandas, sklearn
"""

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from typing import Tuple, Optional, Dict, List
from sklearn.metrics import mean_squared_error
import warnings
warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────────────────────
# 1. 矩阵补全层（MCL）：低秩乘积 + 非线性变换
# ─────────────────────────────────────────────────────────────

class MatrixCompletionLayer(nn.Module):
    """
    MCL: U @ V_T + FCN 非线性变换
    保留低秩约束（矩阵乘积），同时引入非线性（FCN）
    """
    def __init__(self, n_rows: int, n_cols: int, rank: int):
        super().__init__()
        self.V = nn.Parameter(torch.randn(n_cols, rank) * 0.1)  # 列嵌入矩阵
        self.fc_nonlinear = nn.Sequential(
            nn.Linear(n_cols, n_cols * 2),
            nn.ReLU(),
            nn.Linear(n_cols * 2, n_cols),
        )

    def forward(self, U: torch.Tensor) -> torch.Tensor:
        """
        Args:
            U: (batch, rank) 行嵌入矩阵（由生成器输出）
        Returns:
            X_hat: (batch, n_cols) 补全后的矩阵行
        """
        X_linear = U @ self.V.T           # (batch, n_cols) 低秩乘积
        X_hat = self.fc_nonlinear(X_linear)  # 非线性变换
        return X_hat


# ─────────────────────────────────────────────────────────────
# 2. 生成器 G：输入缺失矩阵 → 输出行嵌入 U
# ─────────────────────────────────────────────────────────────

class Generator(nn.Module):
    """
    生成器：(X̃, M, Z) → U（行嵌入矩阵）
    X̃: 零填充矩阵（缺失位置填0）
    M: 观测掩码（1=已知, 0=缺失）
    Z: 噪声向量
    """
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2402.18800。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：带缺失标记的多维数据矩阵（卡页场景为 日期乘广告素材乘受众包 的转化率矩阵）与缺失区间标注

**输出**：补全后的完整数据矩阵与补全区间记录，供广告效果评估、ROAS 计算与渠道归因继续使用

## 执行步骤

1. 标出整块缺失的区间与维度（卡页场景为连续三天整块为空）。
2. 确认线性插值、均值填充、MICE 等常规方法在此失效的原因。
3. 用生成式与矩阵分解联合框架对整块缺失做补全，保留长程依赖。
4. 把补全结果回填到分析链路，并标注哪些值来自补全。

## 边界与不做

- 何时不用：缺失是零散单元格而非整块时，常规插补已足够，不必上重模型。
- 能力边界：补全值是估计而非事实，回填后须保留标记，不能当作真实观测用于结算。
- 能力边界：整块缺失缺少局部参照，补全精度受缺失时长与维度影响，关键结论须人工抽查。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-STAMImputer-SpatioTemporal.html、Skill-STAMImputer-SpatioTemporal、Skill-Sparse-Matrix-Completion.html、Skill-Sparse-Matrix-Completion、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **延伸**：Skill-STAMImputer-SpatioTemporal.html、Skill-STAMImputer-SpatioTemporal、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **可组合**：Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection、Skill-BlockEcho-Missing-Data

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：14-用户分析　·　源卡：`Skill-BlockEcho-Missing-Data`