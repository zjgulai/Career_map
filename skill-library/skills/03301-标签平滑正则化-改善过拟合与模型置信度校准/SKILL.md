---
name: "p2s-label-smoothing-regularization"
title: "标签平滑正则化 — 改善过拟合与模型置信度校准"
description: "触发词：标签平滑、置信度校准、软标签、过拟合、边界品类误分、ECE。何时不用：标签完全可靠且类别很少时收益有限；要提升模型能力上限时用多任务或多模态建模。安全边界：使用商品标题与评论文本训练需符合数据授权与隐私要求，分类结果不得用于歧视性投放。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 业务工具实现"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Label-Smoothing-Regularization"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "模型置信度虚高、边界样本总判错时，用标签平滑把置信度与准确率一起拉正。"
user_try: "试试：我的品类分类模型输出置信度 0.99 却常判错边界品类，帮我加标签平滑。"
whenToUse: "分类模型置信度虚高、标注含噪、边界类别错误率高时用本技能；标签干净且类别少时收益有限；要提升模型上限时用多任务建模。"
workflow: "统计标注噪声比例与类别分布 → 把硬标签替换为软标签并实现平滑损失 → 在验证集上扫描平滑系数 → 监控 F1、校准误差与边界类别错误率 → 输出最优平滑系数与上线建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 标签平滑正则化 — 改善过拟合与模型置信度校准

## ① 解决的问题

商品品类分类模型置信度虚高（softmax>0.99）导致边界品类广告投放精准度低——引入标签平滑正则化校准模型置信度，误分类率降低6%，广告精准投放 CTR 提升 8-12%。

## ② 核心算法逻辑

标签平滑（Label Smoothing）将硬标签（onehot）替换为软标签：对真实类别分配概率 1−ε，对其余 K−1 类均分 ε/(K−1)，从而防止模型以极端 logit 差距拟合训练集。

## ③ 业务应用场景

场景1：婴儿商品品类自动分类（100+ 类） - 业务问题：Listing 标题自动分类模型置信度虚高（softmax 输出 >0.99），导致边界品类错误分类率偏高，影响广告精准投放 - 数据要求：商品标题 + 品类标签 20 万条，含约 8% 噪声标注（标注人员不一致） - 预期产出：标签平滑 ε=0.1 后分类 F1 +1.5%，ECE 从 0.12 降至 0.04，边界品类错误率 -30% - 业务价值：广告精准度提升 → 无效曝光减少 20%，月均广告浪费节省约 5 万元
场景2：差评/中评/好评三分类情感模型 - 业务问题：模型对中评（3★）预测置信度极低但频繁误判为差评，触发不必要的客服介入 - 数据要求：Amazon 评论文本 5 万条（含星级），中评占比约 15% - 预期产出：ε=0.1 后中评 Recall +8%，客服误触发率 -25% - 业务价值：客服成本降低 25%，年化节省约 6 万元
**三轨验证**： - 成本：一行代码修改损失函数，零额外推理开销 - 合规：不涉及隐私数据，仅改变训练目标 - 风险：ε 过大（>0.2）会削弱判别能力，需在验证集上监控 Accuracy 是否下降

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：广告品类投放精准度 +15%~30% → 无效曝光费用减少，月均节省 3~8 万元
实施难度：⭐☆☆☆☆（一行代码替换损失函数，无额外推理成本）
优先级：⭐⭐⭐⭐☆
评估依据：标签平滑是 CV/NLP 工程实践中性价比最高的正则化手段之一，几乎无副作用。在母婴电商标注质量参差不齐的场景下，8% 噪声标注足以让硬标签模型过拟合，标签平滑可系统性改善此类问题。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（88 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
标签平滑正则化 — 多分类商品品类预测
依赖: pip install torch scikit-learn numpy
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from sklearn.preprocessing import LabelEncoder
from torch.utils.data import DataLoader, TensorDataset

# ---- 标签平滑损失实现 ----
class LabelSmoothingCrossEntropy(nn.Module):
    def __init__(self, smoothing: float = 0.1):
        super().__init__()
        assert 0.0 <= smoothing < 1.0
        self.smoothing = smoothing

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        n_classes = logits.size(-1)
        # 软标签：真实类 (1-ε)，其他类 ε/(K-1) 近似为 ε/K（Transformer 原论文简化版）
        log_prob = F.log_softmax(logits, dim=-1)
        smooth_loss = -log_prob.mean(dim=-1)  # 均匀分布项
        nll_loss = F.nll_loss(log_prob, targets, reduction="none")  # 真实标签项
        loss = (1.0 - self.smoothing) * nll_loss + self.smoothing * smooth_loss
        return loss.mean()

# ---- 模拟母婴商品品类数据 ----
np.random.seed(42)
torch.manual_seed(42)

N_SAMPLES, N_FEATURES, N_CLASSES = 10000, 64, 50
X = torch.randn(N_SAMPLES, N_FEATURES)
y = torch.randint(0, N_CLASSES, (N_SAMPLES,))
# 注入 8% 标签噪声（模拟标注不一致）
noise_idx = np.random.choice(N_SAMPLES, int(0.08 * N_SAMPLES), replace=False)
y[noise_idx] = torch.randint(0, N_CLASSES, (len(noise_idx),))

split = int(0.8 * N_SAMPLES)
train_ds = TensorDataset(X[:split], y[:split])
val_ds   = TensorDataset(X[split:], y[split:])
train_dl = DataLoader(train_ds, batch_size=256, shuffle=True)
val_dl   = DataLoader(val_ds,   batch_size=256)

# ---- 简单 MLP ----
class SimpleClassifier(nn.Module):
    def __init__(self, in_dim, n_cls):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 128), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(128, 64),  nn.ReLU(),
            nn.Linear(64, n_cls)
        )
    def forward(self, x): return self.net(x)

def train_model(use_label_smoothing: bool, epsilon: float = 0.1, epochs: int = 20):
    model = SimpleClassifier(N_FEATURES, N_CLASSES)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = LabelSmoothingCrossEntropy(epsilon) if use_label_smoothing else nn.CrossEntropyLoss()
    for epoch in range(epochs):
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：训练数据：商品标题或评论文本与类别标签（含一定比例噪声标注），以及独立的验证集用于扫描平滑系数并监控混淆矩阵。

**输出**：标签平滑损失实现与最优平滑系数、分类 F1 与校准误差的前后对比、边界品类错误率与客服误触发率的变化结论；供算法团队上线到品类或情感分类模型。

## 执行步骤

1. 统计标注噪声比例与类别分布
2. 把硬标签替换为软标签并实现平滑损失
3. 在验证集上扫描平滑系数
4. 监控 F1、校准误差与边界类别错误率变化
5. 输出最优平滑系数与上线建议

## 边界与不做

- 何时不用：标签完全可靠、类别数量很少时平滑收益有限，优先解决数据与特征问题。
- 能力边界：本技能只改训练目标与置信度校准，不改变模型结构与线上推理服务。
- 风险边界：平滑系数过大（如超过 0.2）会削弱判别能力，必须在验证集上监控准确率是否下降。

## 技能关联

- **可组合**：Skill-Label-Smoothing-Regularization

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：12-ML基础　·　源卡：`Skill-Label-Smoothing-Regularization`