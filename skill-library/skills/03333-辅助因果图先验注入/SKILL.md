---
name: "p2s-llm-causal-graph-prior"
title: "LLM as Causal Graph Prior — LLM 辅助因果图先验注入"
description: "触发词：因果图先验、小样本因果发现、新品冷启动、领域知识注入、结构学习。何时不用：样本充足无需先验时用「NOTEARS/DAGMA」；要做多情景推演与方案比较时用「供应链 What-If 情景分析引擎」。安全边界：LLM 先验可能带入领域偏见，必须用数据反驳与验证；不得把先验边当作已证实的因果结论。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 情景模拟"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-LLM-Causal-Graph-Prior"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品数据只有一两个月时，用领域知识给因果图打底，让结构学习在小样本下也稳得住。"
user_try: "试试：新品只有 60 天数据，帮我把评分、价格、曝光、库存、促销、销量、复购、退货的因果图先按领域知识初始化再学。"
whenToUse: "当样本量不足（如少于 100 条观测）、纯数据因果发现结果不稳定、需要领域知识初始化时用本技能；样本充足可直接用「NOTEARS/DAGMA」；要基于因果参数做多情景比较，用「供应链 What-If 情景分析引擎」。"
workflow: "定义变量集与 LLM 先验矩阵（含禁止边） → 采集或导入小样本 SKU 数据 → 用先验引导的 NOTEARS 目标函数做结构学习 → 输出稳定因果图并区分 LLM 确认边与数据确认边 → 据此给出新品运营决策建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM as Causal Graph Prior — LLM 辅助因果图先验注入

## ① 解决的问题

数据科学家面临"因果图结构学习依赖大量数据且无法融合领域专家知识"——LLM辅助因果图先验将结构学习数据需求降低60%且准确率提升25%，年化加速因果决策分析节省20-35万元

## ② 核心算法逻辑

纯数据驱动的因果发现（PC 算法、NOTEARS）在小样本、高噪声场景下容易产生错误因果边。LLM 作为因果图先验（Kıcıman et al. NeurIPS 2023；Long et al. ICML 2024）利用大模型中编码的领域知识，以软约束或硬约束方式注入因果发现过程。

## ③ 业务应用场景

场景1：母婴 SKU 销售因素因果图（小样本场景） - 业务问题：新品上线数据只有 2 个月，纯数据因果发现结果不稳定；希望借助领域知识初始化因果图 - 数据要求：30-60 天 × 8 维 SKU 数据（评分、价格、曝光、库存、促销、销量、复购、退货），样本量不足 100 时尤其适用 - 预期产出：领域知识引导下的稳定因果图，标注「LLM 确认」和「数据确认」的边 - 业务价值：小数据场景下因果图准确率提升 30-50%，新品运营决策周期从 3 个月缩短到 3 周
**三轨验证**： - 成本：LLM 查询（本地模型或 API）+ Python，< 10 分钟 - 合规：LLM 查询仅涉及业务概念，不涉及用户数据，无隐私风险 - 风险：LLM 先验可能带入领域偏见（如过度相信「价格降低必然提升销量」），需要数据验证反驳

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：小样本新品场景下（< 60 天数据）因果图准确率提升 30-50%，新品运营决策周期缩短 60%，单品决策价值 5-15 万元
实施难度：⭐⭐⭐⭐☆（需要 LLM API 集成 + NOTEARS 优化，软约束权衡需要调试）
优先级：⭐⭐⭐⭐☆（新品冷启动是母婴出海的高频痛点，小样本因果发现需求旺盛）
评估依据：Kıcıman et al. (NeurIPS 2023) 实验表明 LLM 先验在标准基准数据集上将因果发现准确率提升 15-35%；实际小样本场景提升更显著，因为基准方法在 < 100 样本时几乎随机。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（107 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
# LLM as Causal Graph Prior：LLM先验注入因果发现（母婴SKU场景）
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.linalg import expm

np.random.seed(2024)

# ---- Step 1: 定义变量与 LLM 先验矩阵 ----
# 实际使用时，调用 LLM API 查询因果方向；此处用模拟先验
col_names = ["差评率", "价格", "曝光量", "促销力度", "库存水平", "销量", "复购率", "退货率"]
d = len(col_names)

# LLM 先验矩阵 prior[i][j] ∈ [0,1]：LLM认为 i→j 的置信度
# 模拟 LLM 查询结果（实际应调用 ChatGPT/DeepSeek API）
prior_llm = np.zeros((d, d))
# 领域知识：差评率→曝光量（差评率影响搜索排名）
prior_llm[0, 2] = 0.85   # 差评率→曝光量（强先验）
prior_llm[0, 7] = 0.90   # 差评率→退货率（极强先验）
prior_llm[1, 5] = 0.75   # 价格→销量
prior_llm[3, 1] = 0.80   # 促销力度→价格（降价）
prior_llm[3, 5] = 0.70   # 促销→销量
prior_llm[2, 5] = 0.80   # 曝光→销量（点击漏斗）
prior_llm[4, 5] = 0.60   # 库存→销量（缺货限制）
prior_llm[5, 6] = 0.75   # 销量→复购率（规模效应）

# 反向禁止边（LLM认为不可能）
forbidden_edges = [(5, 2), (6, 2), (5, 1), (7, 3)]  # (i,j) 表示 i→j 被禁止

print("LLM 先验因果边（置信度 > 0.5）：")
for i in range(d):
    for j in range(d):
        if prior_llm[i, j] > 0.5:
            print(f"  {col_names[i]} → {col_names[j]}: {prior_llm[i,j]:.2f}")

# ---- Step 2: 模拟小样本数据（新品 60 天）----
n_small = 60
X_data = np.zeros((n_small, d))
X_data[:, 3] = np.random.normal(0, 1, n_small)   # 促销（外生）
X_data[:, 0] = np.random.normal(0, 1, n_small)   # 差评率（外生）
X_data[:, 4] = np.random.normal(0, 1, n_small)   # 库存（外生）
X_data[:, 1] = -0.6 * X_data[:, 3] + np.random.normal(0, 0.5, n_small)  # 价格
X_data[:, 2] = -0.7 * X_data[:, 0] + np.random.normal(0, 0.5, n_small)  # 曝光
X_data[:, 5] = (0.5 * X_data[:, 2] - 0.3 * X_data[:, 1]
                + 0.4 * X_data[:, 3] + 0.3 * X_data[:, 4]
                + np.random.normal(0, 0.5, n_small))  # 销量
X_data[:, 6] = 0.5 * X_data[:, 5] + np.random.normal(0, 0.5, n_small)  # 复购
X_data[:, 7] = 0.6 * X_data[:, 0] + np.random.normal(0, 0.5, n_small)  # 退货

# ---- Step 3: LLM 先验引导的 NOTEARS ----
def h_dag(W):
    return np.trace(expm(W * W)) - d

def prior_guided_loss(w_flat, X, prior, lambda_l1=0.15, lambda_prior=0.5):
    """带 LLM 先验的 NOTEARS 损失"""
    W = w_flat.reshape(d, d)
    n = X.shape[0]
    # 重建损失
    loss = 0.5 / n * np.sum((X - X @ W) ** 2)
    # L1 稀疏（基础正则化）
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：30–60 天 × 8 维 SKU 数据（评分、价格、曝光、库存、促销、销量、复购、退货），以及 LLM 查询通道或本地模型；样本量不足 100 时最适用。

**输出**：标注「LLM 确认」与「数据确认」两类边的稳定因果图；供新品运营与数据科学团队确定干预方向。

## 执行步骤

1. 定义变量集并构建 LLM 先验矩阵（含反向禁止边）
2. 导入 30–60 天小样本 SKU 数据
3. 用先验引导的 NOTEARS 目标函数求解结构
4. 输出因果图并区分 LLM 确认边与数据确认边
5. 据此给出新品运营决策建议

## 边界与不做

- 数据不满足：变量无法定义或缺失明显时先补数据，先验不能替代观测。
- 何时不用：样本充足用「NOTEARS/DAGMA」；要做多情景量化对比用「供应链 What-If 情景分析引擎」；纯统计结构发现用「PC算法因果发现」。
- 能力边界：输出候选因果结构与置信标注，不做干预执行，也不保证边方向唯一。
- 安全边界：LLM 先验可能带入领域偏见（如过度相信降价必然提升销量），必须由数据验证反驳，不得直接当结论。

## 技能关联

- **可组合**：Skill-LLM-Causal-Graph-Prior

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：01-因果推断　·　源卡：`Skill-LLM-Causal-Graph-Prior`