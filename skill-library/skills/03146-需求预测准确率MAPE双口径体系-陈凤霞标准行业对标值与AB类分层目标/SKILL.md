---
name: "p2s-forecast-mape-minmax-accuracy-system"
title: "需求预测准确率MAPE/MinMax双口径体系 — 陈凤霞标准行业对标值与AB类分层目标"
description: "触发词：预测准确率、MAPE、MinMax口径、BIAS诊断、行业对标。何时不用：评估人工加减码是否有益用「预测偏差加减码检测」，做模型验证策略用「交叉验证策略」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Forecast-MAPE-MinMax-Accuracy-System"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用 MAPE 和 MinMax 两套口径给预测打分，对标行业基准，找出高估还是低估再定改善目标。"
user_try: "试试：用我 12 个月的 M-1 预测值和实际销量，算 MAPE、MinMax 和 BIAS，并对标行业标准给改善建议。"
whenToUse: "本卡属需求预测的度量基准侧：需要给团队建立准不准的量化口径、对标行业线并分层定目标时用；评估人工修正动作的价值用加减码检测类技能。"
workflow: "收集月度预测值与实际销量（SKU 级） → 计算加权 MAPE 与 MinMax 双口径准确率 → 诊断 BIAS 判断系统性高估或低估 → 按 AB 类分层对标行业标准并排改善优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 需求预测准确率MAPE/MinMax双口径体系 — 陈凤霞标准行业对标值与AB类分层目标

## ① 解决的问题

供应链计划员面临"不知道预测够不够好"——陈凤霞行业标准线(M-1 MAPE 65%/MinMax 70%)让团队首次有量化基准，BIAS+8%高估消除后年化减少库存占用30万元

## ② 核心算法逻辑

陈凤霞书中明确给出了行业优秀水平的具体数字——这是多数企业不知道"够不够好"的核心原因。

## ③ 业务应用场景

场景A：Momcozy吸奶器SKU M-1预测准确率诊断 - 业务问题：供应链团队说"预测准确率挺好的"但没有具体数字，无法对标行业 - 数据要求：过去12个月每月预测值（M-1版本）+ 实际销售量（SKU级） - 预期产出： - 整体MAPE = 58%（低于行业标准65%） - AB类MAPE = 62%（低于爆品标准70%） - BIAS = +8%（系统性高估 → 导致年均多囤约15%库存） - 改善建议：引入促销factor校正，AB类人工review流程 - 业务价值：准确率从58%提升至67%，库存囤货减少8%，年化减少库存占用约30万元
三轨验证： - 成本：数据采集需对接ERP/OMS系统，约2人周开发工时；计算资源可复用现有数仓，无额外云成本；人力投入为每月2小时AB类review会议 - 合规：不涉及用户个人数据，仅使用内部销售数据，无GDPR/CCPA风险；不触碰Amazon政策（不操纵排名/评论） - 风险：无直接竞品价格战风险；若BIAS校正过度可能导致短期缺货，建议分步调整（每次±5%）
场景B：A2奶粉M-2跨境预测（提前2个月） - 业务问题：跨境采购需要提前2个月下单（M-2），但M-2预测误差远大于M-1 - 数据要求：M-2预测值 vs M-1预测值 vs 实际销量的三路对比 - 预期产出：M-2 MAPE = 52%（对应跨境目标60%，仍低于行业）；M-2→M-1改善量化 - 业务价值：识别M-2误差主要来源（促销计划未纳入），改进后M-2 MAPE提升至61%，减少跨境空运急补

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：将整体MAPE从58%提升至67% → 系统性高估减少8% → 年化减少冗余库存约20-30万元；AB类准确率提升减少爆品缺货，年化增量销售约15-25万元
实施难度：⭐⭐☆☆☆（计算逻辑不复杂，关键是建立预测review机制）
优先级评分：⭐⭐⭐⭐⭐（陈凤霞书：预测准确率是供应链计划的"元指标"，所有KPI都从这里开始）
评估依据：书中明确给出行业优秀值（65%/70%），使企业首次有了"够不够好"的量化基准

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（186 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/forecast_mape_minmax_accuracy_system` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Forecast-MAPE-MinMax-Accuracy-System.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
需求预测准确率 MAPE/MinMax 双口径体系
功能：MAPE/MinMax计算 / BIAS诊断 / AB类分层评估 / 行业对标 / 改善建议
输入：预测值 + 实际值（SKU级，按月）
输出：准确率KPI报告 + 行业对标 + 改善优先级
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def generate_forecast_data(n_skus=60, n_months=12, seed=42):
    """生成模拟预测 vs 实际数据"""
    np.random.seed(seed)
    
    records = []
    for sku_id in range(1, n_skus + 1):
        # SKU分类（AB类占20%）
        abc_class = np.random.choice(['A', 'B', 'C', 'D', 'E'],
                                     p=[0.05, 0.15, 0.30, 0.30, 0.20])
        base_sales = {'A': 800, 'B': 400, 'C': 150, 'D': 50, 'E': 15}[abc_class]
        
        for month in range(1, n_months + 1):
            # 实际销量（含随机波动+季节性）
            seasonal = 1.0 + 0.3 * np.sin(2 * np.pi * month / 12)
            actual = base_sales * seasonal * (1 + np.random.normal(0, 0.2))
            actual = max(1, round(actual))
            
            # 预测误差（AB类更准，CDE类偏差大；系统性高估BIAS=+8%）
            noise_scale = {'A': 0.15, 'B': 0.20, 'C': 0.30, 'D': 0.40, 'E': 0.50}[abc_class]
            bias_factor = 1.08  # 系统性高估8%
            forecast = max(1, round(actual * bias_factor * (1 + np.random.normal(0, noise_scale))))
            
            records.append({
                'sku_id': f'SKU-{sku_id:03d}',
                'abc_class': abc_class,
                'month': month,
                'forecast': forecast,
                'actual': actual,
                'error': abs(forecast - actual),
                'pct_error': abs(forecast - actual) / max(1, actual),
                'minmax': min(forecast, actual) / max(forecast, actual),
                'bias_unit': forecast - actual,
            })
    
    return pd.DataFrame(records)


def compute_mape(df):
    """计算加权MAPE（∑|误差| / ∑实际）"""
    return (1 - df['error'].sum() / df['actual'].sum()) * 100


def compute_minmax(df):
    """计算Min/Max准确度（对称指标）"""
    return df['minmax'].mean() * 100


def compute_bias(df):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2303.14478，但该号在 arXiv 上是《DBARF: Deep Bundle-Adjusting Generalizable Neural Radiance Fields》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：预测值与实际值（SKU 级、按月），需带预测版本口径（如 M-1 提前一个月、M-2 提前两个月）；卡面示例用过去 12 个月数据。

**输出**：MAPE 与 MinMax 双口径准确率 KPI 报告、BIAS 诊断、AB 类分层结果与行业对标、改善优先级建议，输出给供应链计划团队与管理层。

## 执行步骤

1. 收集月度预测值与实际销量（SKU 级）。
2. 计算加权 MAPE 与 MinMax 双口径准确率。
3. 诊断 BIAS，判断系统性高估还是低估。
4. 按 AB 类分层对标行业标准，排出改善优先级。

## 边界与不做

- 何时不用：缺少按月留存的预测版本记录时无法区分 M-1 与 M-2 口径，不适用本技能。
- 能力边界：口径统一不等于预测变准，需配套评审机制；目标值随品类与提前期不同，不能跨口径直接比较。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-LLMForecaster-Seasonal-Event.html、Skill-LLMForecaster-Seasonal-Event、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-LLMForecaster-Seasonal-Event.html、Skill-LLMForecaster-Seasonal-Event、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-LLMForecaster-Seasonal-Event.html、Skill-LLMForecaster-Seasonal-Event、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Forecast-MAPE-MinMax-Accuracy-System

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-Forecast-MAPE-MinMax-Accuracy-System`