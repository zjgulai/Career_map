---
name: "p2s-time-series-foundation-model-zero-shot"
title: "时序基础模型零样本预测 — 无需训练的跨域需求预测"
description: "触发词：零样本、跨域预测、长尾批量、无需训练、预训练模型。何时不用：有充分历史且追求最优精度时用精调模型；只做单款新品零样本预测用「时序基础模型」。安全边界：预测结果不得对外宣传为 AI 保证备货量，内部决策文档需注明置信区间。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Time-Series-Foundation-Model-Zero-Shot"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "只要四十五天数据就能出预测，还能一次给几千个长尾 SKU 批量出结果，不必逐个训练。"
user_try: "试试：用零样本基础模型给我这款只有 45 天数据的体温计做 30 天预测和 90% 区间。"
whenToUse: "数据极少（卡页示例 45 天）或 SKU 数量巨大无法逐个训练时用；有充分历史且追求最优精度时用精调方案；单款新品零样本用时序基础模型。"
workflow: "准备 45 天日销量序列与可选产品标签 → 零样本推理输出未来 30 天预测与 90% 区间 → 设置预测上限等硬约束 → 新品稳定后切换精调方案，长尾 SKU 走批量预测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 时序基础模型零样本预测 — 无需训练的跨域需求预测

## ① 解决的问题

新品运营面临"仅45天历史数据需求预测MAPE高达38%备货失误严重"——零样本时序基础模型无需训练直接预测新品需求，MAPE降至23%，年化节省首批积压约180万元

## ② 核心算法逻辑

传统时序预测（Prophet/TFT/LSTM）需要大量历史数据训练模型，面临两个致命痛点：

## ③ 业务应用场景

场景A：新品冷启动需求预测（零样本） - 业务问题：婴儿体温计新品上线，仅有45天销售记录，历史太少，传统Prophet模型MAPE=38%，无法用于备货决策 - 数据要求：45天日销量序列即可（无需更多历史）；可选：输入产品标签（"婴儿温度计/电子/春季上架"）作为辅助条件 - 预期产出：未来30天日销量预测 + 90%不确定性区间，MAPE目标<25%（新品场景） - 业务价值：新品首批备货决策从"拍脑袋"变为"数据驱动"，首批积压率从35%降至20%，首批采购金额平均20万元，节省积压成本约3万元/次；每月推出5个新品，年化节省约180万元
三轨对抗验证： 1. 成本验证：VisionTS基于预训练MAE，推理一次约0.5秒（CPU）；Time-MoE有公开API，批量预测成本约0.1元/SKU/次，100个新品每月约10元 2. 合规验证：预测模型不涉及平台合规风险；但预测结果不可作为"AI保证备货量"对外宣传，需在内部决策文档中注明置信区间 3. 风险验证：TSFMs对时序分布极度异常的情况（如病毒式爆款）预测失准；需设置"预测上限=历史最大值×3"的硬约束；零样本性能不如精调模型，新品稳定后（90天+）应切换到精调方案
场景B：长尾SKU批量预测（替代逐SKU训练） - 业务问题：5000个SKU中有4000个是低频长尾，为每个SKU训练模型不现实（成本+时间） - 数据要求：各SKU的历史销量序列（即使很短） - 预期产出：使用Time-MoE批量零样本预测4000个长尾SKU的未来4周需求，总体MAPE<30% - 业务价值：长尾SKU库存周转率提升约15%，年化释放资金占压约200万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：新品备货准确率提升15%（MAPE从38%→23%），每次首批采购20万元，节省积压约3万元；每月5款新品，年化节省约180万元；长尾SKU批量预测（替代逐SKU训练）节省数据科学家人力约2人月/年（约50万元）
实施难度：⭐⭐⭐☆☆（Chronos/Time-MoE有公开模型权重，pip安装即用；主要工作是数据格式对接和阈值校准）
优先级：⭐⭐⭐⭐☆（新品冷启动是母婴电商的高频痛点，传统方法有明确瓶颈）
评估依据：ICML 2025 VisionTS在8个标准数据集上零样本性能超越有监督方法；ICLR 2025 Time-MoE农业价格预测超越USDA期货；Amazon内部已部署TSFM用于商品预测（据公开报道）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（157 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Time-Series-Foundation-Model-Zero-Shot
时序基础模型零样本预测 — 新品冷启动需求预测

依赖：pip install numpy pandas scikit-learn scipy
注意：生产环境可接入 Time-MoE API 或 Chronos (pip install chronos-forecasting)

本模板演示零样本时序预测的核心思想：
用相似品类的历史模式迁移到新品预测（知识迁移近似）
"""

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import LinearRegression

np.random.seed(42)

# ── 1. 模拟数据：成熟品类 + 新品 ────────────────────────────────────
def generate_mature_sku_data(n_days=365, trend=0.1, amplitude=20, noise=8):
    """生成成熟SKU的历史销量（含趋势+季节性）"""
    t = np.arange(n_days)
    base      = 80 + trend * t
    seasonal  = amplitude * np.sin(2 * np.pi * t / 365)
    weekly    = 10 * np.sin(2 * np.pi * t / 7)
    noise_arr = np.random.normal(0, noise, n_days)
    return np.maximum(base + seasonal + weekly + noise_arr, 5).astype(int)

def generate_new_sku_data(n_days=45, similar_pattern_scale=0.6):
    """新品：仅有45天历史，基于成熟品类的缩小版"""
    mature = generate_mature_sku_data(n_days)
    return (mature * similar_pattern_scale + np.random.normal(0, 3, n_days)).astype(int)

# 成熟品类（奶瓶）：365天历史
mature_sales = generate_mature_sku_data(365)
# 新品（婴儿体温计）：45天历史
new_sku_sales = generate_new_sku_data(45)
# 真实未来30天（用于评估）
true_future = generate_new_sku_data(30, similar_pattern_scale=0.6)[0:30]

print(f"成熟品类历史: {len(mature_sales)}天, 均值={mature_sales.mean():.0f}, std={mature_sales.std():.0f}")
print(f"新品历史: {len(new_sku_sales)}天, 均值={new_sku_sales.mean():.0f}")

# ── 2. 零样本时序基础模型（知识迁移近似）────────────────────────────
class ZeroShotTSFM:
    """
    时序基础模型零样本预测的近似实现：
    1. 从成熟品类中提取时序"模式"（趋势 + 季节性分解）
    2. 将新品历史对齐到最相似的成熟品类片段
    3. 迁移对齐片段的未来模式作为预测

    这是 TSFMs（如VisionTS、Chronos）的核心思想的简化版：
    "在海量时序中找到最相似的历史片段，用其延续作为预测"
    """

    def __init__(self):
        self.pattern_library = {}

    def extract_patterns(self, series: np.ndarray, window=30):
        """提取时序模式库"""
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2408.17253。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：45 天日销量序列（无需更多历史），可选产品标签（品类、电子属性、上架季节）；粒度：SKU×日，支持多 SKU 批量并行。

**输出**：未来 30 天日销量预测与 90% 不确定性区间（卡页目标 MAPE<25%、首批积压率由 35% 降至 20%），供新品首批备货与长尾 SKU 批量预测使用。

## 执行步骤

1. 准备短历史销量序列与产品标签
2. 零样本推理输出分位数预测
3. 按硬约束截断异常预测值
4. 批量跑长尾 SKU 替代逐 SKU 训练
5. 新品稳定后切换精调方案

## 边界与不做

- 数据不满足时不用：序列短于数周、或存在病毒式爆款这类极端波动时，零样本预测会失准。
- 能力边界：输出预测与区间，不作为对外承诺，备货量仍需按区间在内部决策。
- 能力边界：零样本精度低于精调模型，卡页建议新品稳定（90 天以上）后切换方案。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Conformal-Time-Series-Forecasting.html、Skill-Conformal-Time-Series-Forecasting、Skill-Contrastive-Time-Series-Cold-Start.html、Skill-Contrastive-Time-Series-Cold-Start、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-New-Product-Demand-Cold-Start.html、Skill-New-Product-Demand-Cold-Start、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Transfer-Learning-New-Product-Forecast.html、Skill-Transfer-Learning-New-Product-Forecast
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Conformal-Time-Series-Forecasting.html、Skill-Conformal-Time-Series-Forecasting、Skill-Contrastive-Time-Series-Cold-Start.html、Skill-Contrastive-Time-Series-Cold-Start、Skill-New-Product-Demand-Cold-Start.html、Skill-New-Product-Demand-Cold-Start、Skill-Transfer-Learning-New-Product-Forecast.html、Skill-Transfer-Learning-New-Product-Forecast
- **可组合**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Contrastive-Time-Series-Cold-Start.html、Skill-Contrastive-Time-Series-Cold-Start、Skill-New-Product-Demand-Cold-Start.html、Skill-New-Product-Demand-Cold-Start、Skill-Time-Series-Foundation-Model-Zero-Shot

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Time-Series-Foundation-Model-Zero-Shot`