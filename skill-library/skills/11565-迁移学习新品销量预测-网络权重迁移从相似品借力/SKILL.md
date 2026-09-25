---
name: "p2s-transfer-learning-new-product-forecast"
title: "迁移学习新品销量预测 — 网络权重迁移从相似品借力"
description: "触发词：迁移学习、相似品借力、权重微调、新品备货、冷启动。何时不用：只需共享编码器快速冷启动时用「MTL 冷启动」；要按相似品分位数做概率备货时用「新品需求冷启动」。安全边界：仅使用内部历史数据，不抓取 Amazon 实时销售数据；预测结果仅用于内部备货决策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Transfer-Learning-New-Product-Forecast"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "新品零历史时，先用相似老品把网络练好，再拿新品两周数据微调，把首批备货误差从五成缩到两成。"
user_try: "试试：用宽口玻璃奶瓶和 PP 奶瓶的历史预训练，再拿新品两周数据微调，给出首批备货建议。"
whenToUse: "新品上市零历史、但有同品类相似品可预训练时用；只要共享编码器快速冷启动用 MTL 冷启动；要概率分位数备货用新品需求冷启动。"
workflow: "计算新品与相似品库的特征相似度并取 Top-3 → 用 Top-3 相似品的 52 周数据预训练网络 → 冻结底层两层，用新品前 2 周数据微调顶层 → 输出首批备货预测并设 P90 上限复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 迁移学习新品销量预测 — 网络权重迁移从相似品借力

## ① 解决的问题

选品运营面临新品上市零历史数据困境——迁移学习将相似品知识迁移到新品，将首批备货预测误差从±50%缩小至±20%，年化减少滞销断货损失200-600万元

## ② 核心算法逻辑

新品上市前 48 周零历史销售记录，传统时序模型无法训练。迁移学习的核心思路是：先用相似品（source products）的历史数据训练深度神经网络，再把学到的权重迁移到新品（target product）上做 finetune。类似人类专家"看到新品 A 像爆款 B，参考 B 的销量曲线"的隐性知识被显式化为神经网络权重。

## ③ 业务应用场景

- 业务问题：Momcozy 上市新款硅胶奶瓶 240ml，全新 SKU 零历史，手动拍脑袋备货 2000 件，结果第一个月只卖 300 件，滞销损失 8 万+ - 数据要求： - 目标品：产品特征向量（价格 $29.99、硅胶材质、240ml、适龄 0-6M） - 相似品库：同品类已有 SKU 的 52 周销售历史（宽口玻璃奶瓶 260ml、PP 奶瓶 240ml 等） - 执行流程： 1. 计算新品与库中所有相似品的特征相似度，取 Top-3 2. 用 Top-3 相似品数据预训练 LSTM 网络（共 156 周数据） 3. 冻结底层 2 层，fine-tune 顶层用新品上市前 2 周早
三轨验证： - 成本：数据采集需整合 ERP/SCM 中所有相似品 52 周历史（约 0.5 人月）；计算资源单次预测 < $5（CPU 即可）；人力成本主要在特征工程（约 2 人周） - 合规：使用内部历史数据，不涉及 Amazon 实时销售数据抓取，无 GDPR 风险；预测结果仅用于内部备货决策，不触碰广告法 - 风险：若相似品选择偏差（如误将清仓品当爆款），可能导致备货过量；建议设置 P90 上限阈值 + 人工复核 Top-3 相似品逻辑
- 业务问题：US 市场上线 3 个月的爆款婴儿监护仪，准备拓展德国站，0 历史数据但 US 已有 52 周数据 - 数据要求：US 站同 SKU 52 周销售历史 + 德国站同品类相似品历史（本地化因子：汇率/关税/文化偏好） - 执行流程：用 US 数据预训练，加入本地化特征向量（德语包装/CE 认证/德国育儿偏好评分）做 domain adaptation fine-tune - 业务价值：EU 新站冷启动备货精度提升，减少跨境头程多发 → 年化节省 FBA 头程费 20-50 万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：每款新品首批备货精度提升 20-30%，单款节省滞销/断货损失 5-20 万；年化 20-30 款 × 10 万/款 = 200-600 万/年
实施难度：⭐⭐⭐☆☆（PyTorch/sklearn 实现成熟；难点在相似品特征工程和数据清洗）
优先级：⭐⭐⭐⭐☆（新品冷启动是母婴跨境核心痛点，ROI 明确，依赖数据少）
评估依据：论文在真实零售数据验证 MAE 提升 10-25%；工程路径清晰，无需大规模 GPU

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/transfer_learning_new_product_forecast` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Transfer-Learning-New-Product-Forecast.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
迁移学习新品销量预测 - 网络权重迁移最小骨架
论文 arXiv:2005.06978 (Karb et al., 2020)
依赖: pip install numpy scikit-learn
注：生产建议用 PyTorch LSTM，此处用 sklearn MLP 展示迁移逻辑
"""
from __future__ import annotations
import numpy as np
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error
from typing import List, Tuple, Optional
import copy


def make_features(sales: np.ndarray, window: int = 4) -> Tuple[np.ndarray, np.ndarray]:
    """将历史销售序列转为滑窗特征/标签对"""
    X, y = [], []
    for i in range(window, len(sales)):
        X.append(sales[i - window:i])
        y.append(sales[i])
    return np.array(X), np.array(y)


def product_feature_similarity(feat_a: np.ndarray, feat_b: np.ndarray) -> float:
    """特征余弦相似度"""
    denom = np.linalg.norm(feat_a) * np.linalg.norm(feat_b)
    return float(np.dot(feat_a, feat_b) / denom) if denom > 0 else 0.0


def find_top_similar(
    new_feat: np.ndarray,
    catalog_feats: List[np.ndarray],
    catalog_sales: List[np.ndarray],
    top_k: int = 3,
) -> List[Tuple[np.ndarray, float]]:
    """筛选 Top-K 相似品（特征向量 + 相似度分数）"""
    scored = [
        (sales, product_feature_similarity(new_feat, feat))
        for feat, sales in zip(catalog_feats, catalog_sales)
    ]
    scored.sort(key=lambda x: -x[1])
    return scored[:top_k]


class TransferSalesForecaster:
    """迁移学习新品销量预测器"""

    def __init__(self, window: int = 4, hidden_layer_sizes: tuple = (64, 32)):
        self.window = window
        self.hidden_layer_sizes = hidden_layer_sizes
        self.source_model: Optional[MLPRegressor] = None
        self.target_model: Optional[MLPRegressor] = None
        self.scaler_X = StandardScaler()
        self.scaler_y = StandardScaler()

    def pretrain(self, source_sales_list: List[np.ndarray]) -> None:
        """Phase 1：在相似品数据上预训练"""
        all_X, all_y = [], []
        for sales in source_sales_list:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2005.06978。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：目标品特征向量（价格、材质、容量、适龄）、相似品 52 周销售历史；拓展新市场时另加本地化特征（汇率、关税、文化偏好）；粒度：SKU×周。

**输出**：新品首批备货预测（卡页示例误差由 ±50% 收窄至 ±20%）与 Top-3 相似品依据说明，供首批备货与跨市场拓展决策使用。

## 执行步骤

1. 筛选相似品并核验其销售形态可比
2. 用相似品数据预训练网络
3. 冻结底层后用新品早期数据微调顶层
4. 输出备货预测并设 P90 上限
5. 人工复核相似品选择逻辑

## 边界与不做

- 数据不满足时不用：相似品历史不足 52 周、或新品连 2 周早期数据都没有时，迁移与微调都缺依据。
- 能力边界：只给备货预测与相似品说明，不负责选品与定价。
- 能力边界：相似品选错（如误把清仓品当爆款）会导致备货过量，需人工复核。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-GP-Tweedie-Intermittent-New-Product-Demand.html、Skill-GP-Tweedie-Intermittent-New-Product-Demand、Skill-LLM-Mixer-New-Product-Forecast.html、Skill-LLM-Mixer-New-Product-Forecast、Skill-Multimodal-New-Product-Sales-Forecast.html、Skill-Multimodal-New-Product-Sales-Forecast、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-GP-Tweedie-Intermittent-New-Product-Demand.html、Skill-GP-Tweedie-Intermittent-New-Product-Demand、Skill-LLM-Mixer-New-Product-Forecast.html、Skill-LLM-Mixer-New-Product-Forecast、Skill-Multimodal-New-Product-Sales-Forecast.html、Skill-Multimodal-New-Product-Sales-Forecast、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart
- **可组合**：Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-GP-Tweedie-Intermittent-New-Product-Demand.html、Skill-GP-Tweedie-Intermittent-New-Product-Demand、Skill-LLM-Mixer-New-Product-Forecast.html、Skill-LLM-Mixer-New-Product-Forecast、Skill-Multimodal-New-Product-Sales-Forecast.html、Skill-Multimodal-New-Product-Sales-Forecast、Skill-Transfer-Learning-New-Product-Forecast

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：06-增长模型　·　源卡：`Skill-Transfer-Learning-New-Product-Forecast`