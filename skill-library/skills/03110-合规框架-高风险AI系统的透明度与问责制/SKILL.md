---
name: "p2s-eu-ai-act-compliance-framework"
title: "EU AI Act合规框架 — 高风险AI系统的透明度与问责制"
description: "触发词：EU AI Act、风险分级、高风险系统、合规审计、透明度要求。何时不用：只生成可解释性监管报告时用「XAI Regulatory Compliance」；儿童数据隐私审查用「Privacy COPPA Compliance」。安全边界：合规结论不构成法律意见，须法务或外部顾问确认；不得为降低风险等级而隐瞒儿童或健康等敏感数据使用。"
l1_id: ""
l1_plane: "未归类（矩阵空白）"
l2_id: ""
l2_domain: "未归类（矩阵空白）"
l3_id: ""
l3_business: "（矩阵空白）"
l3_all: ""
l1_l2_l3: "未归类（矩阵空白）"
p2s_card_id: "Skill-EU-AI-Act-Compliance-Framework"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按欧盟 AI 法案给系统定风险等级、补齐透明度和问责材料，把合规审计周期压下来。"
user_try: "试试：按我的推荐系统特征和数据使用情况做 EU AI Act 风险分级，并列出要补的合规材料。"
whenToUse: "面向欧盟上线 AI 系统、需要做风险分级与合规材料准备时用；只做可解释性报告用 XAI 类技能；儿童数据合规用 COPPA 类技能。"
workflow: "梳理用途、特征与数据敏感性 → 按风险因子打分定级 → 盘点缺失合规材料 → 输出合规路线图与整改优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# EU AI Act合规框架 — 高风险AI系统的透明度与问责制

## ① 解决的问题

合规团队面临EU AI Act高风险系统注册要求——透明度框架将合规审计周期从45天压缩至12天，规避罚款风险最高3000万欧元

## ② 核心算法逻辑

EU AI Act采用四层风险分级框架：禁止类(Prohibited) → 高风险(Highrisk) → 受限类(Limited) → 最小风险(Minimal)。核心算法基于风险评分矩阵：

## ③ 业务应用场景

场景A：婴儿配方奶粉智能推荐系统的合规审查
- 业务问题：某跨境电商平台在亚马逊欧洲站运营婴儿配方奶粉推荐系统，日均处理15万次推荐请求。系统基于用户浏览历史、购买记录、年龄段标签进行个性化推荐。问题：(1)儿童数据处理是否合规？(2)推荐算法是否存在歧视性偏差(如按地域/收入推荐不同价位产品)？(3)系统决策是否可解释？预期面临€2000万罚款风险(GDPR+AI Act)。
- 数据要求：(1)推荐系统特征集(50维)：用户属性、产品属性、交互历史；(2)决策日志(过去6个月，500万条)：推荐ID、用户ID、展示产品、点击/转化标签、模型版本；(3)训练数据统计：样本量、缺失率、类别分布；(4)模型结构文档：特征工程、算法选择(如LightGBM)、超参数。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
角色：母婴跨境电商卖家/平台方
场景：在欧洲站部署AI推荐系统面临合规风险
方法：使用EU AI Act合规框架进行系统审计、风险分级、透明度评估，确保高风险系统满足注册、报告、可解释性要求
指标改善：
法律风险成本：€2000万罚款风险 → €50万年度合规成本（成本降低96%）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（286 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import shap
import json
from datetime import datetime

# ============ EU AI Act Compliance Framework ============

class EUAIActComplianceAuditor:
    """
    EU AI Act合规审计系统
    用于母婴跨境电商推荐系统的风险评估与合规验证
    """
    
    def __init__(self, system_name, system_type="recommendation"):
        self.system_name = system_name
        self.system_type = system_type
        self.risk_categories = {
            "prohibited": 0,
            "high_risk": 1,
            "limited_risk": 2,
            "minimal_risk": 3
        }
        self.compliance_score = 0
        self.audit_report = {}
    
    def assess_risk_level(self, features_dict):
        """
        风险等级评估
        输入：系统特征字典
        输出：风险等级 + 评分
        """
        risk_score = 0
        risk_factors = {}
        
        # 因子1：数据敏感性 (权重0.35)
        sensitive_data_weight = 0.35
        if features_dict.get("contains_children_data", False):
            risk_score += 8 * sensitive_data_weight
            risk_factors["children_data"] = 8
        if features_dict.get("contains_health_data", False):
            risk_score += 7 * sensitive_data_weight
            risk_factors["health_data"] = 7
        if features_dict.get("contains_biometric_data", False):
            risk_score += 9 * sensitive_data_weight
            risk_factors["biometric_data"] = 9
        
        # 因子2：决策影响范围 (权重0.30)
        impact_weight = 0.30
        user_count = features_dict.get("affected_users", 0)
        if user_count > 100000:
            risk_score += 8 * impact_weight
            risk_factors["large_scale"] = 8
        elif user_count > 10000:
            risk_score += 5 * impact_weight
            risk_factors["medium_scale"] = 5
        
        # 因子3：算法透明度 (权重0.20)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：系统特征集与用途说明、决策日志样本、训练数据统计（样本量、缺失率、类别分布）、模型结构与算法选择文档、数据处理合规现状；粒度：系统级与特征级。

**输出**：风险等级判定与评分依据、需补齐的合规材料清单（注册、报告、可解释性、人工监督）、整改优先级，供合规团队推进。

## 执行步骤

1. 梳理系统用途、特征与数据敏感性
2. 按风险因子逐项打分并定级
3. 对照法案要求盘点缺失材料
4. 评估可解释性与人工监督机制
5. 输出合规路线图与整改优先级

## 边界与不做

- 数据不满足时不用：系统用途与数据使用清单不完整时，风险定级会偏低，结论不可作为合规依据。
- 能力边界：只做技术性评估与材料梳理，不提供法律意见、不代提交注册或报告；最终判定须法务确认。

## 技能关联

- **前置**：Skill-AI-Ethics-Fairness-Audit.html、Skill-AI-Ethics-Fairness-Audit、Skill-Algorithm-Bias-Detection、Skill-Amazon-A9-Algorithm-Optimization、Skill-Cross-Border-Risk-Management、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-GDPR-Data-Protection-Framework、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-XAI-Regulatory-Compliance.html、Skill-XAI-Regulatory-Compliance
- **延伸**：Skill-Algorithm-Bias-Detection、Skill-Amazon-A9-Algorithm-Optimization、Skill-Cross-Border-Risk-Management、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-XAI-Regulatory-Compliance.html、Skill-XAI-Regulatory-Compliance
- **可组合**：Skill-Amazon-A9-Algorithm-Optimization、Skill-Cross-Border-Risk-Management、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-EU-AI-Act-Compliance-Framework

---

> 分类：未归类（矩阵空白）　·　技术族：11-AI人文　·　源卡：`Skill-EU-AI-Act-Compliance-Framework`