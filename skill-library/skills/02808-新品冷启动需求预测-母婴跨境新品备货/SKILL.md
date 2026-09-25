---
name: "p2s-bass-diffusion-new-product-forecasting"
title: "GEANN + Bass 新品冷启动需求预测 - 母婴跨境新品备货"
description: "触发词：新品冷启动、Bass扩散、相似品迁移、首发备货、早期销售外推。何时不用：有完整历史销售的老品预测用「Agent时序预测」，只需区间与安全库存用「需求波动率建模」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Bass-Diffusion-New-Product-Forecasting"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品零销量也能靠相似品的扩散曲线推出首批该备多少，少压货也不错过上升期。"
user_try: "试试：这个羊奶粉新品没有任何历史销售，用同品类相似品的 52 周数据帮我预测首批备货量。"
whenToUse: "本卡属需求预测的冷启动场景：新品没有自身历史销售、需要借相似品曲线外推首发备货时用；老品有完整历史的常规预测用通用时序预测类技能。"
workflow: "构建新品特征向量（价格、品类、产地、渠道） → 检索 Top-K 相似品并拟合各自的 Bass 参数 → 按相似度加权迁移，合成新品扩散曲线 → 输出首发备货建议并用早期销售滚动修正"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GEANN + Bass 新品冷启动需求预测 - 母婴跨境新品备货

## ① 解决的问题

新品经理面临首发备货拍脑袋——Bass扩散将预测误差18%压到8%，年化省26万元

## ② 核心算法逻辑

母婴跨境新品冷启动需求预测痛点:每年 2030 款新品上市,前 8 周零销售记录,人工拍脑袋备货首批,积压或断货损失年化 300+ 万元. 本 Skill 组合两个方法:① Bass 扩散模型生成新品扩散曲线形状(创新+模仿系数);② GEANN 图迁移从相似品历史借用销售信号;③ Bass 参数从相似品加权迁移初始化,实现"形状从理论 + 规模从迁移"的双驱动.

## ③ 业务应用场景

- 业务问题:Momcozy 上市新品"羊奶粉 A 段 800g 德国品牌 X",历史零销售,采购无依据备货. 首批多压货占用现金流 50-100 万,少备货错失上升期 BSR 损失更大. Anker 案例:新品冷启动占总库存损失 35% - 数据要求:新品特征向量(价格/品类/产地/渠道) + 同品类相似品 52 周历史销售 - 配置流程: 1. 相似品检索:用 GEANN kNN 找 Top-3 相似品(德国奶粉 800g / 澳洲奶粉 900g / 荷兰奶粉 800g) 2. Bass 参数拟合:对每个相似品拟合 (m, p, q) 3. Softmax 加权迁移:相似度高的相似品权重大
三轨验证： - 成本：数据采集需购买 Helium 10/Jungle Scout 竞品数据（约 $200-500/月）；计算资源：单次预测 < 0.1 元（云函数）；人力：1 名数据分析师 2 周搭建特征工程 + 模型调优（约 2 万元）。 - 合规：使用竞品 BSR 数据属于公开信息，不违反 Amazon 爬虫政策；特征向量不包含用户隐私，符合 GDPR；预测结果不涉及价格操纵或虚假宣传。 - 风险：若相似品选择偏差（如误将有机奶粉与普通奶粉匹配），可能导致备货量偏差 ±30%；市场潜力估算依赖竞品数据，竞品数据滞后 1-2 周可能影响预测时效；过度依赖模型可能忽视品牌方促销计划（如站外引
- 业务问题:Momcozy 推出 Prime Day 季节性新品(夏季婴儿游泳圈),大促备货截止日提前 60 天(亚马逊 Prime Day 报名),但新品当时只有 3-7 天早期销售数据;过量备货占用 FBA 长期仓储费,不足备货错失大促爆发 - 数据要求:Prime Day 新品早期 3-7 天销售 + 非大促期相似品(湿巾/纸尿裤)峰值数据 - F-FOMAML 配置: - 非大促期相似品销售曲线作"代理数据" - GNN 按品类 + 价格带 + 历史峰值倍率构建商品相似图 - F-FOMAML 用 3-7 天早期数据快速 fine-tune - 输出 Prime Day 24-48

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:Bass 模型有解析解,scipy.curve_fit 可直接拟合
易处:PyMC-Marketing Bayesian Bass 开源完整
难处:Amazon GEANN/F-FOMAML 未开源,GNN 部分需自行实现
难处:相似品特征工程需业务专家(价格/品类/产地编码)
难处:市场潜力 m 估算依赖竞品数据(可借助 Helium 10 / Jungle Scout)

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/bass_diffusion_new_product_forecasting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Bass-Diffusion-New-Product-Forecasting.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
新品冷启动需求预测 - Bass 扩散 + 相似品迁移最小骨架
论文 arXiv:2307.03595 + arXiv:2406.16221
依赖: pip install numpy scipy scikit-learn
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np
from scipy.optimize import curve_fit


def bass_cumulative(t: np.ndarray, m: float, p: float, q: float) -> np.ndarray:
    """Bass 累积采用 N(t) = m*(1-e^-(p+q)t)/(1 + q/p * e^-(p+q)t)"""
    return m * (1 - np.exp(-(p + q) * t)) / (1 + (q / p) * np.exp(-(p + q) * t))


def bass_incremental(t: np.ndarray, m: float, p: float, q: float) -> np.ndarray:
    """Bass 增量 dN/dt(每周新增需求)"""
    N = bass_cumulative(t, m, p, q)
    return (p + q * N / m) * (m - N)


def fit_bass_from_history(sales_history: np.ndarray) -> Tuple[float, float, float]:
    """从相似品历史销售拟合 Bass 参数(m, p, q)"""
    t = np.arange(1, len(sales_history) + 1, dtype=float)
    cumulative = np.cumsum(sales_history)
    try:
        p0 = [cumulative[-1] * 2, 0.02, 0.4]
        bounds = ([0, 0.001, 0.01], [1e8, 0.5, 2.0])
        popt, _ = curve_fit(bass_cumulative, t, cumulative, p0=p0, bounds=bounds, maxfev=5000)
        return float(popt[0]), float(popt[1]), float(popt[2])
    except (RuntimeError, ValueError):
        return float(cumulative[-1] * 3), 0.02, 0.38


@dataclass
class Product:
    sku_id: str
    features: np.ndarray
    sales_history: Optional[np.ndarray] = None


def find_similar_products(new_product: Product, catalog: List[Product], top_k: int = 5) -> List[Tuple[Product, float]]:
    """基于特征向量余弦相似度找 Top-K 相似品"""
    new_feat = new_product.features
    similarities = []
    for prod in catalog:
        if prod.sales_history is not None:
            num = float(np.dot(new_feat, prod.features))
            denom = float(np.linalg.norm(new_feat) * np.linalg.norm(prod.features))
            sim = num / denom if denom > 0 else 0.0
            similarities.append((prod, sim))
    similarities.sort(key=lambda x: -x[1])
    return similarities[:top_k]


def transfer_bass_params(
    similar_products: List[Tuple[Product, float]],
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2307.03595 — GEANN: Scalable Graph Augmentations for Multi-Horizon Time Series Forecasting
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：新品特征向量（价格、品类、产地、渠道）、同品类相似品 52 周历史销售；大促新品场景还需 3-7 天早期销售数据，竞品数据可借助第三方选品工具获取。

**输出**：新品扩散曲线（累计与每周增量）、首发备货量建议与相似品权重说明，输出给新品经理与采购做首单决策。

## 执行步骤

1. 构建新品特征向量（价格、品类、产地、渠道）。
2. 用 kNN 检索 Top-3 相似品，并对其历史销售拟合 Bass 参数。
3. 按相似度加权迁移参数，合成新品扩散曲线。
4. 输出首发备货建议，并用早期销售数据滚动修正。

## 边界与不做

- 何时不用：同品类找不到可比相似品、或竞品数据完全缺失时迁移基础不成立，不适用本技能。
- 能力边界：相似品选错（如把有机奶粉与普通奶粉匹配）可能带来约 ±30% 的备货量偏差；市场潜力估算依赖竞品数据，数据滞后会影响预测时效。

## 技能关联

- **前置**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Hierarchical-Demand-Forecasting-Reconciliation.html、Skill-Hierarchical-Demand-Forecasting-Reconciliation、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT
- **可组合**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-Semantic-Blueprint-Compiler.html、Skill-Semantic-Blueprint-Compiler、Skill-Bass-Diffusion-New-Product-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：06-增长模型　·　源卡：`Skill-Bass-Diffusion-New-Product-Forecasting`