---
name: "p2s-synthetic-data-generation-tabular"
title: "合成表格数据生成 — 隐私保护的数据增强与分享框架"
description: "触发词：合成表格数据、类别不平衡、数据增强、欺诈样本、隐私保护分享。何时不用：样本分布已平衡、或问题是缺失值而非稀缺样本时走缺失数据补全。安全边界：训练数据含真实欺诈用户信息，须遵循数据最小化；合成数据用于模型训练而非对外共享，若对外共享需额外隐私评估。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Synthetic-Data-Generation-Tabular"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "给欺诈退货这类稀有样本补足合成数据，让严重不平衡的模型重新训得动。"
user_try: "试试：用合成数据把欺诈退货样本补到 3000 条，看检测 F1 能不能从 0.43 提上来。"
whenToUse: "类别严重不平衡、正样本太少导致召回上不去时用；只是有缺失值要补格子时改用缺失数据补全。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 合成表格数据生成 — 隐私保护的数据增强与分享框架

## ① 解决的问题

数据团队面临"欺诈退货样本仅2%严重不平衡导致检测F1低至0.43"——TAEGAN合成欺诈样本使检测F1提升至0.71，年化减少欺诈损失约84万元

## ② 核心算法逻辑

合成表格数据生成（Synthetic Tabular Data Generation）解决电商运营的核心痛点：真实数据稀缺、隐私敏感、类别极度不平衡，导致ML模型无法训练。

## ③ 业务应用场景

场景A：欺诈退货检测模型的数据增强 - 业务问题：历史欺诈退货仅占总退货的2.1%（严重不平衡），直接训练的模型F1只有0.43，大量欺诈漏报 - 数据要求：历史退货数据（特征：订单金额/账号年龄/退货频率/配送地址变化/Review行为/设备指纹）；欺诈标签（人工审核标注，通常需500+正样本才能训练） - 预期产出：TAEGAN生成3000条合成欺诈样本（与500条真实欺诈样本混合），训练数据平衡后，欺诈检测F1从0.43提升至0.71，召回率从0.31提升至0.68 - 业务价值：年化欺诈退货损失减少约35%，按欺诈退货月均损失20万元，年化节省约84万元；假正例（误判正常退货）率控制在
三轨对抗验证： 1. 成本验证：TAEGAN训练约2-4小时（CPU），生成1000条新样本约30秒；模型大小仅为FinDiff的5%，存储成本几乎为零 2. 合规验证：合成数据本身不含真实用户PII，但训练数据包含真实欺诈用户信息，需遵循数据最小化原则；合成数据用于模型训练而非对外共享（灰色地带：若对外共享需额外隐私评估） 3. 风险验证：TSTR（合成训练、真实测试）性能低于真实训练性能约10-15%，不可替代真实数据收集；"隐私泄漏"风险：成员推断攻击可能从合成数据反推真实样本，需定期做隐私审计
场景B：新品类选品决策的市场数据扩充 - 业务问题：进入"婴儿监护器"新品类，历史数据仅3个月（90条销售记录），无法训练可靠的需求预测模型 - 数据要求：90条历史记录 + 相似品类（婴儿床）的成熟数据（1000条）用于迁移 - 预期产出：用CTGAN结合相似品类先验，生成500条合理的"婴儿监护器"模拟销售数据，使预测模型MAPE从42%降至25% - 业务价值：新品类决策信心提升，减少盲目备货导致的积压风险约50万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：ACML 2025 TAEGAN在5个数据集上utility平均提升27%；欺诈检测F1从0.43提升至0.71，年化减少欺诈损失约84万元；新品选品模型精度提升使备货失误减少约20%（约50万元/年）；综合ROI约130万元/年
实施难度：⭐⭐☆☆☆（SDV库即装即用，无需深度学习；CTGAN/TAEGAN需要基础PyTorch能力）
优先级：⭐⭐⭐⭐☆（数据稀缺和类别不平衡是母婴电商ML的普遍痛点，适用范围极广）
评估依据：ACML 2025验证TAEGAN在utility上超越所有基线且模型体积仅5%；FinDiff在金融场景隐私最优但计算成本10倍于GAN；SDV是工业界最广泛使用的合成数据工具（GitHub 2k+ stars）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（150 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Synthetic-Data-Generation-Tabular
合成表格数据生成 — 欺诈退货检测数据增强

依赖：pip install numpy pandas scikit-learn
注意：生产环境推荐使用 SDV (pip install sdv) 或 CTGAN
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split

np.random.seed(42)

# ── 1. 生成模拟退货数据集（严重不平衡）────────────────────────────────
def generate_returns_data(n_normal=5000, n_fraud=105):
    """
    模拟退货数据：正常退货 vs 欺诈退货
    欺诈率约2%，严重不平衡
    """
    def make_samples(n, is_fraud):
        if is_fraud:
            # 欺诈特征：高额订单、新账户、频繁退货、多设备
            return pd.DataFrame({
                'order_amount':      np.random.uniform(80, 300, n),
                'account_age_days':  np.random.randint(1, 90, n).astype(float),
                'return_frequency':  np.random.uniform(0.4, 1.0, n),
                'address_changes':   np.random.randint(2, 8, n).astype(float),
                'review_count':      np.random.randint(0, 3, n).astype(float),
                'device_count':      np.random.randint(2, 6, n).astype(float),
                'is_fraud': 1
            })
        else:
            return pd.DataFrame({
                'order_amount':      np.random.uniform(15, 150, n),
                'account_age_days':  np.random.randint(60, 1500, n).astype(float),
                'return_frequency':  np.random.uniform(0.0, 0.2, n),
                'address_changes':   np.random.randint(0, 2, n).astype(float),
                'review_count':      np.random.randint(2, 30, n).astype(float),
                'device_count':      np.random.randint(1, 2, n).astype(float),
                'is_fraud': 0
            })

    df = pd.concat([make_samples(n_normal, False), make_samples(n_fraud, True)])
    return df.sample(frac=1, random_state=42).reset_index(drop=True)

df_real = generate_returns_data()
fraud_rate = df_real['is_fraud'].mean()
print(f"真实数据: {len(df_real)} 条, 欺诈率={fraud_rate*100:.1f}%")
print(f"欺诈样本数: {df_real['is_fraud'].sum()} 条 (严重不平衡)")

# ── 2. 简化版合成数据生成器（模拟CTGAN/TAEGAN的核心逻辑）─────────────
class SimpleSyntheticGenerator:
    """
    简化版合成数据生成器（生产环境用SDV/CTGAN替代）
    通过统计分布拟合 + 高斯混合模型模拟条件生成
    """
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2410.01933。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史业务数据（如退货记录，含订单金额/账号年龄/退货频率/配送地址变化/设备指纹等特征）与少量人工标注的正样本标签

**输出**：合成样本集与平衡后的训练数据（卡页场景：3000 条合成欺诈样本混合 500 条真实样本），供下游分类模型训练

## 执行步骤

1. 确认类别不平衡程度与可用的真实正样本量。
2. 用合成表格生成器（TAEGAN/CTGAN/SDV 一类）生成补充样本。
3. 做 TSTR 验证（合成训练、真实测试），记录与真实训练的差距。
4. 把合成与真实样本混合训练，比较 F1 与召回率变化。
5. 安排成员推断等隐私审计，确认合成数据不能反推真实样本。

## 边界与不做

- 何时不用：样本分布已平衡，或问题是缺失值而非稀缺样本时，本技能不适用。
- 能力边界：卡页原文写明 TSTR 性能比真实训练低约 10-15%，合成数据不可替代真实数据收集。
- 安全边界：训练数据含真实欺诈用户信息，须遵循数据最小化；合成数据用于训练而非对外共享，对外共享需另做隐私评估。

## 技能关联

- **前置**：Skill-Class-Imbalance-Handling.html、Skill-Class-Imbalance-Handling、Skill-Concept-Drift-Detection.html、Skill-Concept-Drift-Detection、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Federated-Learning-Privacy.html、Skill-Federated-Learning-Privacy、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **延伸**：Skill-Concept-Drift-Detection.html、Skill-Concept-Drift-Detection、Skill-Federated-Learning-Privacy.html、Skill-Federated-Learning-Privacy、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **可组合**：Skill-Concept-Drift-Detection.html、Skill-Concept-Drift-Detection、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Synthetic-Data-Generation-Tabular

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Synthetic-Data-Generation-Tabular`