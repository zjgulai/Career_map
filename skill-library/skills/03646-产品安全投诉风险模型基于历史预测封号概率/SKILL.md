---
name: "p2s-product-safety-complaint-risk-model"
title: "Product Safety Complaint Risk Model — 产品安全投诉风险模型基于历史预测封号概率"
description: "触发词：安全投诉、封号概率、风险评分、差评关键词、红色预警、账号诊断。何时不用：要按 HTS 码判 CPSC 管制风险时用「HTS 码风险分类」，要判知识库文档是否过期时用「Corrective-RAG 纠错检索」。安全边界：风险评分仅用于内部预警，不得据此对外承诺安全结论或掩盖真实投诉。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 账号诊断"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Product-Safety-Complaint-Risk-Model"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "差评里冒出宝宝滑落、safety concern 时，先算清封号概率有多高，再决定补说明书还是先停售。"
user_try: "试试：我这个婴儿摇椅两周内出现 3 起安全投诉、差评关键词翻倍，算一下封号风险并给应对动作。"
whenToUse: "账号出现安全类投诉与差评信号、需要量化封号风险并决定是否暂停销售时用；要按 HTS 码判管制风险时用「HTS 码风险分类」；要判知识库文档时效时用「Corrective-RAG 纠错检索」。"
workflow: "采集账号健康数据、差评文本与 A-to-Z 投诉记录 → 统计安全关键词词频与投诉数量 → 结合类目平均投诉率与账号年龄拟合风险 → 输出封号概率评分并映射预警等级 → 触发相应动作：改说明书、补测试报告或暂停 SKU"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Product Safety Complaint Risk Model — 产品安全投诉风险模型基于历史预测封号概率

## ① 解决的问题

运营面临"收到3起Buyer Message提及宝宝摔落事故不知道封号风险有多高"——安全投诉风险逻辑回归将封号概率量化并触发合规预警，成功规避封号保护冻结资金200-500万元

## ② 核心算法逻辑

论文：Logistic Regression for Risk Prediction in ECommerce Platform Enforcement | 年份：2020

## ③ 业务应用场景

场景：某婴儿摇椅卖家收到 3 起 Buyer Message 提及「宝宝从椅子上滑落」，差评中含有「safety concern」的词频在 2 周内上升 4 倍，风险评分从 18% 升至 65%。
数据要求：账号健康中心数据、差评文本（Seller Central）、A-to-Z 投诉记录，类目平均投诉率（行业数据）。
应用：风险评分 65% 触发红色预警，运营团队立即：① 更新产品使用说明书强化安全警示；② 主动向 Amazon 提交 ASTM 测试报告；③ 暂停高销量 SKU 销售直至完成额外测试。最终未触发封号。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

200-500 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（104 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

# 安全投诉关键词字典
SAFETY_KEYWORDS = [
    'choking', 'choke', 'toxic', 'poison', 'burn', 'unsafe', 'dangerous',
    'injury', 'hurt', 'hazard', 'risk', 'harm', 'accident', 'emergency'
]

def extract_safety_features(
    complaints_30d: int,
    negative_reviews: list,  # 差评文本列表
    category_base_risk: float,  # 类目基础风险（0-1）
    account_age_years: float
) -> dict:
    """提取安全投诉风险特征"""
    # 特征1：安全关键词频率
    total_words = 0
    safety_word_count = 0
    for review in negative_reviews:
        words = review.lower().split()
        total_words += len(words)
        for kw in SAFETY_KEYWORDS:
            safety_word_count += words.count(kw)
    safety_kw_rate = safety_word_count / (total_words + 1e-8) * 100

    # 特征2：新账号风险系数
    account_risk = max(0, 1 - account_age_years / 5)  # 5年以上视为稳定

    return {
        'complaints_30d': complaints_30d,
        'safety_kw_rate': safety_kw_rate,
        'category_base_risk': category_base_risk,
        'account_risk': account_risk
    }

def predict_suspension_risk(features: dict) -> dict:
    """
    产品安全封号风险预测
    基于逻辑回归（系数来自历史数据拟合）
    """
    # 标准化后的逻辑回归系数（基于行业经验校准）
    beta = {
        'intercept': -2.5,
        'complaints': 0.8,      # 每增加1起投诉
        'safety_kw': 2.0,       # 安全关键词密度
        'category': 1.5,        # 类目风险
        'account': 1.2          # 账号年限风险
    }

    # 特征归一化
    x_comp = min(features['complaints_30d'] / 5, 1.0)
    x_kw = min(features['safety_kw_rate'] / 2, 1.0)
    x_cat = features['category_base_risk']
    x_acc = features['account_risk']

    # 线性组合
    logit = (beta['intercept']
             + beta['complaints'] * x_comp
             + beta['safety_kw'] * x_kw
             + beta['category'] * x_cat
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.05479，但该号在 arXiv 上是《Probabilistic Autoencoder》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Logistic Regression for Risk Prediction in ECommerce Platform Enforcement》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：账号健康中心数据、差评文本（Seller Central）、A-to-Z 投诉记录、类目平均投诉率（行业数据）、账号年龄；粒度：单账号 × 单品类，按 30 天窗口统计。

**输出**：产品安全投诉风险评分（如由 18% 升至 65%）与预警等级、风险特征归因（安全关键词频率、投诉数、类目基础风险）及建议动作；供运营在封号前强化使用说明、提交 ASTM 测试报告或暂停高销量 SKU。

## 执行步骤

1. 采集健康分、差评与 A-to-Z 投诉数据
2. 统计安全关键词词频与投诉数量
3. 结合类目基础风险与账号年龄算分
4. 输出封号概率与预警等级
5. 触发说明书修改、补报告或暂停销售

## 边界与不做

- 数据不满足时不用：拿不到差评文本与投诉记录、或类目平均投诉率缺失时，风险评分偏差大。
- 能力边界：只做风险量化与预警，不代替平台判定、不修改账号操作；停售与整改决策由运营与合规负责人做出。

## 技能关联

- **可组合**：Skill-Product-Safety-Complaint-Risk-Model

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：19-风控反欺诈　·　源卡：`Skill-Product-Safety-Complaint-Risk-Model`