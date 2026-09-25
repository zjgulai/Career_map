---
name: "p2s-sparse-autoencoder-feature"
title: "Sparse Autoencoder Feature — 稀疏自编码器特征提取（电商用户行为压缩与可解释特征）"
description: "触发词：稀疏自编码器、可解释特征、用户行为压缩、概念激活、异常用户检测。何时不用：需要分档与触达策略用 RFM 类技能，需要跨品类语义推荐用知识图谱画像技能，本技能只做用户表示的可解释压缩。安全边界：训练与推理仅限自有用户行为数据，异常检测结论只能作为排查线索，不得直接作为处罚依据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 业务工具实现"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-Sparse-Autoencoder-Feature"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把黑盒的用户向量压成几十个能看懂的概念标签，让运营明白推荐为什么这么给。"
user_try: "试试：用过去 90 天的购买和浏览序列训练稀疏自编码器，给我用户的概念标签和一批重建误差异常的用户。"
whenToUse: "用户嵌入是黑盒、运营需要可解释概念来提升实验假设质量时用本技能；只需要分档与触达策略用 RFM 类技能，需要跨品类语义推荐用知识图谱画像类技能。"
workflow: "构造 90 天行为 one-hot 序列 → 训练带稀疏约束的自编码器 → 把激活神经元解释为业务概念 → 输出用户概念标签 → 用重建误差筛异常用户"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Sparse Autoencoder Feature — 稀疏自编码器特征提取（电商用户行为压缩与可解释特征）

## ① 解决的问题

数据科学家面临"用户嵌入是黑盒运营无法理解推荐逻辑导致信任度低"——稀疏自编码器将用户表示转化为可解释概念，运营理解推荐决策率提升80%，年化通过可解释 AI 提升业务协同价值15-30万元

## ② 核心算法逻辑

核心思想：稀疏自编码器（SAE）通过在编码层加入稀疏性约束（L1 正则），强迫模型学习用少量激活神经元表示输入数据——每个激活的神经元对应一个可解释的"概念"（如"价格敏感型用户"/"复购型用户"）。

## ③ 业务应用场景

场景1：母婴用户购买行为稀疏特征提取（可解释用户画像） - 业务问题：用户嵌入是 512 维黑盒，运营无法理解"为什么推荐这个产品给这个用户" - 数据要求：用户过去 90 天的购买/浏览序列（one-hot 编码，约 5000 维 SKU 空间） - 预期产出：每个用户的 10-20 个激活概念（如"孕产期敏感""高客单价倾向""复购驱动型"） - 业务价值：可解释特征帮助运营理解推荐逻辑，提升 A/B 实验的假设质量，间接年化增收 15-30 万元
**三轨验证**： - 成本：训练 SAE 约 2-4 小时 GPU，推理极快（单次前向传播） - 合规：使用自有用户行为数据，无第三方数据隐私风险 - 风险：稀疏度 λ 超参敏感，过大导致重建质量差，过小则失去稀疏性；需要网格搜索

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：可解释特征提升运营对 AI 决策的信任度，加速 A/B 实验假设质量，间接年化价值 15-30 万元；同时可用于异常用户检测（重建误差异常 = 疑似刷单）
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐☆☆
评估依据：SAE 在 LLM 可解释性领域验证有效，电商用户行为数据天然稀疏，迁移成本低；主要价值在于提升模型可解释性，次要价值在于异常检测。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（62 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

class SparseAutoencoder(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, sparsity_lambda: float = 0.01):
        super().__init__()
        self.encoder = nn.Linear(input_dim, hidden_dim)
        self.decoder = nn.Linear(hidden_dim, input_dim)
        self.sparsity_lambda = sparsity_lambda

    def forward(self, x):
        h = torch.relu(self.encoder(x))   # 稀疏编码
        x_hat = self.decoder(h)
        return x_hat, h

    def loss(self, x, x_hat, h):
        recon = nn.functional.mse_loss(x_hat, x)
        sparsity = self.sparsity_lambda * h.abs().mean()
        return recon + sparsity, recon.item(), sparsity.item()

def train_sae(data: np.ndarray, hidden_dim: int = 64,
              sparsity_lambda: float = 0.005, epochs: int = 50) -> SparseAutoencoder:
    X = torch.FloatTensor(data)
    model = SparseAutoencoder(data.shape[1], hidden_dim, sparsity_lambda)
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    for epoch in range(epochs):
        x_hat, h = model(X)
        total_loss, recon, sparse = model.loss(X, x_hat, h)
        optimizer.zero_grad()
        total_loss.backward()
        optimizer.step()
        if (epoch + 1) % 10 == 0:
            sparsity_rate = (h.detach() < 0.01).float().mean().item()
            print(f"Epoch {epoch+1:3d} | Loss={total_loss.item():.4f} "
                  f"Recon={recon:.4f} Sparse={sparse:.4f} "
                  f"零激活率={sparsity_rate:.1%}")
    return model

if __name__ == "__main__":
    torch.manual_seed(42)
    np.random.seed(42)
    # 模拟用户购买行为（500 用户，200 个 SKU one-hot）
    n_users, n_skus = 500, 200
    # 稀疏购买矩阵（平均每用户买 5 个 SKU）
    data = np.zeros((n_users, n_skus))
    for i in range(n_users):
        bought = np.random.choice(n_skus, np.random.randint(3, 10), replace=False)
        data[i, bought] = 1.0
    model = train_sae(data, hidden_dim=64, sparsity_lambda=0.005, epochs=50)
    # 验证稀疏性
    with torch.no_grad():
        _, h = model(torch.FloatTensor(data))
        sparsity = (h < 0.01).float().mean().item()
        recon_error = nn.functional.mse_loss(
            model(torch.FloatTensor(data))[0],
            torch.FloatTensor(data)
        ).item()
    print(f"\n稀疏率: {sparsity:.1%} | 重建误差: {recon_error:.4f}")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户过去 90 天的购买与浏览序列（one-hot 编码，卡页口径约 5000 维 SKU 空间）等自有行为数据。

**输出**：每个用户 10-20 个激活概念标签（如孕产期敏感、高客单价倾向、复购驱动型）与重建误差异常用户清单；卡页口径可解释特征带来的年化价值 15-30 万元。

## 执行步骤

1. 把用户 90 天的购买与浏览序列编码为稀疏输入矩阵。
2. 训练带稀疏正则的自编码器，让编码层只有少量神经元激活。
3. 把高激活神经元解释为可读的业务概念。
4. 输出每个用户的概念标签，供运营理解推荐逻辑。
5. 用重建误差筛出异常用户并交人工核查。

## 边界与不做

- 行为序列过稀、SKU 空间与业务口径不匹配时不要用，激活神经元无法稳定对应业务概念。
- 能力边界：概念标签是对隐层的解释性命名，不等于业务事实；稀疏度是关键超参，过大重建质量差、过小失去稀疏性，需网格搜索；卡页的价值数字为间接估算。
- 合规红线：训练与推理仅限自有用户行为数据，异常检测结论只能作为排查线索，不得直接作为处罚依据。

## 技能关联

- **可组合**：Skill-Sparse-Autoencoder-Feature

---

> 分类：业务运营/品牌与增长/分群　·　技术族：12-ML基础　·　源卡：`Skill-Sparse-Autoencoder-Feature`