---
name: "p2s-csdm-diffusion-coldstart"
title: "扩散模型冷启动CTR - 新品零交互时的转化潜力预热"
description: "触发词：新品冷启动、CTR预测、扩散模型、侧信息预热。何时不用：新品已有充足交互、模型可直接估计时不用本卡；已有少量交互、需要在线探索流量时用上下文老虎机类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-023"
l3_business: "组合取舍"
l3_all: "组合取舍 / 转化优化"
l1_l2_l3: "业务运营/产品与创新/组合取舍"
p2s_card_id: "Skill-CSDM-Diffusion-ColdStart"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "用扩散模型给没有任何交互记录的新品生成有意义的转化先验，避免新品被排序压低。"
user_try: "试试：我这周上了 200 个新 SKU，帮我给没有点击数据的新品估计 CTR 先验。"
whenToUse: "本卡属「组合取舍」。新品零交互、CTR 预测接近随机、需要侧信息预热时用本卡；新品已有少量交互、可直接用在线探索分配流量时用上下文老虎机类技能。"
workflow: "整理侧信息字段 → 配置噪声调度 → 编码侧信息并采样 → 注入排序模型观察 CTR"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 扩散模型冷启动CTR - 新品零交互时的转化潜力预热

## ① 解决的问题

业务问题 跨境母婴电商每周上新 200-500 个 SKU（Momcozy 双泵吸奶器、有机棉连体衣、婴儿推车配件等）

## ② 核心算法逻辑

传统推荐系统采用 Embedding & MLP 范式：每个商品 ID 对应一个向量，该向量通过用户历史交互数据学习。新品没有历史交互 → Embedding 全为随机噪声 → CTR 预测失效，这就是冷启动问题。

## ③ 业务应用场景

业务问题 跨境母婴电商每周上新 200-500 个 SKU（Momcozy 双泵吸奶器、有机棉连体衣、婴儿推车配件等）。传统 CTR 模型对新品给出接近随机的预测值（AUC ≈ 0.5），导致： - 新品被排序算法压低权重，得不到曝光 - 潜在热销品在黄金流量窗口期被埋没 - 人工运营需要靠经验手动提权，效率低下
Sankey 图连接点：新品页面是用户旅程 Sankey 图中的"前置节点"——若新品页面的 CTR 预测不准，流量分发决策的 Prior 错误，整个漏斗分析失效。CSDM 生成的 Warmed-Up Embedding 为该节点提供有意义的先验估计。
| 字段 | 示例值 | 说明 | |------|--------|------| | category_id | `maternity_pump` | 一级类目编码 | | price_usd | 39.99 | 上架价格（美元） | | brand_id | `momcozy` | 品牌 ID | | image_embedding | `[0.12, -0.34, ...]` (512维) | 主图 ResNet/CLIP 特征 | | title_embedding | `[0.05, 0.21, ...]` (256维) | 商品标题语义向量 | | shipping_days |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（774 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/recommendation/csdm_diffusion_coldstart` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-CSDM-Diffusion-ColdStart.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CSDM: Cold-Start Diffusion Model for CTR Prediction
论文: arXiv:2504.06270 (2025), Zhu et al.
场景: 母婴出海跨境电商新品冷启动 CTR 预热

核心流程:
  1. 预训练 CTR backbone (DeepFM) 获得现有商品的 ID Embeddings (z0)
  2. 训练 CSDM: 学习 z0 <-> 侧信息 h 之间的扩散映射
  3. 推断: 新品只提供侧信息 h, 生成 Warmed-Up Embedding
  4. 替换: 将 Warmed-Up Embedding 写入 Embedding Table, 正常 CTR 推断无额外成本
"""

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from typing import Optional
import math


# ─────────────────────────────────────────────
# 1. 超参数 & 噪声调度
# ─────────────────────────────────────────────

class CSDMConfig:
    """CSDM 超参数配置"""
    # Embedding 维度
    embed_dim: int = 64           # ID Embedding 维度 d
    side_dim: int = 128           # 侧信息原始维度 (类目+价格+图像拼接后)
    hidden_dim: int = 64          # 侧信息投影后的隐层维度 h

    # 扩散过程
    T: int = 1000                 # 总扩散步数
    T_sub: int = 50               # 非马尔可夫子序列步数 (训练加速)
    sigma: float = 0.0            # 随机噪声强度 (0 = DDIM 确定性)
    rho: float = 0.1              # 扩散损失权重

    # 训练
    lr: float = 1e-4
    batch_size: int = 512
    epochs: int = 30

    # 噪声调度: 余弦调度
    @staticmethod
    def cosine_schedule(T: int, s: float = 0.008):
        """余弦噪声调度, 返回 alpha_t 序列 (长度 T+1)"""
        steps = torch.arange(T + 1, dtype=torch.float64)
        f = torch.cos(((steps / T) + s) / (1 + s) * math.pi / 2) ** 2
        alpha = f / f[0]
        return alpha.float()  # shape: [T+1], alpha[0]=1, alpha[T]≈0


# ─────────────────────────────────────────────
# 2. 侧信息编码器
# ─────────────────────────────────────────────

class SideInfoEncoder(nn.Module):
    """
    将商品侧信息 (类目 + 价格 + 图像特征) 映射到隐层向量 h
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2504.06270 — Addressing Cold-start Problem in Click-Through Rate Prediction via Supervised Diffusion Modeling

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：新品结构化侧信息：类目编码、上架价格、品牌 ID、主图向量（512 维）、标题语义向量（256 维）与物流时效字段。

**输出**：新品的 warmed-up embedding 与 CTR 先验估计，供排序与流量分发模型使用，补齐新品页面前置节点的先验缺失。

## 执行步骤

1. 整理新品侧信息字段并核对缺失情况
2. 配置扩散过程与余弦噪声调度
3. 把侧信息编码为条件输入
4. 采样生成新品 embedding 先验
5. 把先验注入排序模型并观察 CTR 表现

## 边界与不做

- 新品已有足够交互记录、模型可直接估计时不用本卡
- 本卡只产出先验 embedding 与预测值，不负责线上排序服务与流量分配策略

## 技能关联

- **前置**：Skill-Deep-Learning-Recommendation-HI.html、Skill-Deep-Learning-Recommendation-HI、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN
- **可组合**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-CSDM-Diffusion-ColdStart

---

> 分类：业务运营/产品与创新/组合取舍　·　技术族：05-推荐系统　·　源卡：`Skill-CSDM-Diffusion-ColdStart`