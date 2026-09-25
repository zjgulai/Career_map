---
name: "p2s-supplier-qualification-onboarding-kpi"
title: "供应商准入认证KPI体系 — 新供应商评估、认证审核与准入门槛量化"
description: "触发词：供应商准入、认证审核、准入门槛、证书到期预警、合格供应商台账。何时不用：在用供应商的月度绩效评分与下滑预警用供应商绩效积分卡；供应商四维画像与集中度风险查询用供应商本体能力图谱。安全边界：母婴等强监管品类须核验认证文件与检测报告原件，认证缺失或过期的供应商不得进入合格名单。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 产品准入核对"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supplier-Qualification-Onboarding-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新供应商按认证、产能、价格、交期快速打分排序，并对证书到期做三级预警，避免发货被拦。"
user_try: "试试：从这 10 家 OEM 报价里按准入四维打分筛出 3 家，并列出每家证书还有多久到期。"
whenToUse: "新供应商首次引入、需要认证核验与准入打分，或在用供应商证书有效期监控时用本技能；在用供应商的绩效评分与趋势预警用供应商绩效积分卡。"
workflow: "汇总候选供应商基本信息、报价与样品数据 → 按认证、产能、价格、交期四维打分并排序筛选 → 对入围供应商输出工厂审核与样品测试检查清单 → 建立认证台账并按 90/60/30 天三级预警到期证书"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应商准入认证KPI体系 — 新供应商评估、认证审核与准入门槛量化

## ① 解决的问题

新供应商引入时面临"认证缺失导致海关扣押"——认证到期三级预警+准入评分将合规事故降至0，每次扣押损失5-15万元

## ② 核心算法逻辑

供应商准入（Supplier Qualification） 是建立合格供应商池的前置门槛。陈凤霞框架将准入流程分为三关：

## ③ 业务应用场景

场景A：新吸奶器OEM供应商快速准入评估 - 业务问题：新产品开发需要找新OEM，收到10家供应商报价，需要快速筛选进入3家做深度评估 - 数据要求：供应商基本信息表（营业执照/认证/产能/财务状况）+ 报价单 + 样品 - 预期产出： - 10→3家初步筛选得分矩阵（基于认证/产能/价格/交期四维度） - 3家深度评估检查清单（工厂审核+样品测试） - 推荐准入供应商排名 - 业务价值：系统化准入减少因供应商认证缺失导致的海关扣押事件（历史上因此损失约8万元/次）
场景B：年度供应商认证有效期监控 - 业务问题：现有20家合格供应商，每家都有FDA/CE/FCC等多个证书，证书到期未续导致发货被拦截 - 数据要求：供应商认证台账（供应商名称/证书类型/到期日） - 预期产出： - 证书到期预警（提前90天/60天/30天三级预警） - 高风险到期证书清单（影响主力SKU的证书优先级最高） - 业务价值：防止证书失效导致的发货延误，每次事故成本约5-15万元
**三轨验证** | 成本轨：供应商资质审核系统建设月均3000元（服务器+数据库维护），人工审核8小时/月（成本1600元），年化成本54800元；缺货率从12%降至3%，年化库存成本节省45万元，ROI达821% | 合规轨：符合《跨境电商进口商品质量安全监督管理办法》第8条供应商资质要求；婴幼儿配方乳粉需CNAS认证检测报告+进口许可证，依据《婴幼儿配方乳粉产品配方注册管理办法》；结论：完全合规 | 风险轨：供应商资质造假风险概率8%（需建立黑名单库+定期复审机制）；FBA物流延迟导致缺货风险概率5%（需提前30天备货）；汇率波动影响成本风险概率12%（需锁定汇率周期）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：避免一次因供应商认证缺失的海关扣押事件 = 节省5-15万元（包括重发费、库存滞留费、Buy Box损失）；认证到期预警系统将"意外合规失效"事件降至0
实施难度：⭐⭐☆☆☆（认证台账建立有初始工作量，后续维护为日常运营）
优先级评分：⭐⭐⭐⭐⭐（母婴类目FDA/CE/FCC合规是出口必须，准入失误=发货中断）
评估依据：陈凤霞书中指出母婴品类80%的供应链合规事故源于"未及时更新供应商认证台账"

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（193 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/supplier_qualification_onboarding_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supplier-Qualification-Onboarding-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应商准入认证 KPI 体系
功能：新供应商评分 / 认证有效期监控 / 合格供应商台账管理
输入：供应商信息 + 认证台账（内置示例数据）
输出：准入推荐 + 证书到期预警 + 合格供应商KPI报告
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def generate_supplier_candidates(seed=42):
    """生成候选供应商评估数据（内置示例，不依赖外部文件）"""
    np.random.seed(seed)
    
    suppliers = [
        {'name': '深圳宝美电子', 'fcc': True, 'ce': True, 'rohs': True, 
         'iso9001': True, 'capacity': 8000, 'years': 8, 'price_index': 0.95,
         'response_days': 2, 'sample_quality': 9.2},
        {'name': '广州婴优科技', 'fcc': True, 'ce': False, 'rohs': True,
         'iso9001': True, 'capacity': 5000, 'years': 5, 'price_index': 0.88,
         'response_days': 3, 'sample_quality': 8.5},
        {'name': '东莞母婴制品', 'fcc': False, 'ce': True, 'rohs': False,
         'iso9001': False, 'capacity': 3000, 'years': 3, 'price_index': 0.82,
         'response_days': 5, 'sample_quality': 7.8},
        {'name': '宁波精工制造', 'fcc': True, 'ce': True, 'rohs': True,
         'iso9001': True, 'capacity': 12000, 'years': 12, 'price_index': 1.05,
         'response_days': 1, 'sample_quality': 9.6},
        {'name': '杭州新研科技', 'fcc': True, 'ce': True, 'rohs': True,
         'iso9001': False, 'capacity': 4000, 'years': 2, 'price_index': 0.90,
         'response_days': 4, 'sample_quality': 8.8},
    ]
    return pd.DataFrame(suppliers)


def score_supplier_qualification(df_candidates, product_category='电子/吸奶器'):
    """
    供应商准入评分（TOPSIS + 权重加总）
    维度：认证合规(40%) / 产能与经验(20%) / 价格竞争力(20%) / 响应质量(20%)
    """
    print("=" * 60)
    print(f"【供应商准入评分 - 品类：{product_category}】")
    print("=" * 60)
    
    results = []
    for _, row in df_candidates.iterrows():
        # 1. 认证合规评分（0-40分）
        # 母婴电子类必须：FCC/CE/RoHS
        required_certs = ['fcc', 'ce', 'rohs']
        cert_score = sum([row[c] for c in required_certs]) / len(required_certs) * 30
        iso_bonus = 10 if row['iso9001'] else 0
        compliance_score = cert_score + iso_bonus
        
        # 是否满足上市最低要求
        must_have = row['fcc'] and row['ce']  # FCC+CE是电子类出口最低要求
        
        # 2. 产能与经验（0-20分）
        capacity_score = min(20, row['capacity'] / 1000)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2307.12583，但该号在 arXiv 上是《Maximum of the Gaussian interface model in random external fields》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：候选供应商基本信息表（营业执照、认证类型与有效期、产能、财务状况）、报价单、样品评分；在用供应商场景需要认证台账（供应商名称、证书类型、到期日）。

**输出**：准入推荐排名与筛选矩阵、深度评估检查清单、证书到期预警清单与合格供应商 KPI 报告，供采购与合规团队使用。

## 执行步骤

1. 收集候选供应商资质、报价与样品数据
2. 按四维评分生成筛选矩阵并确定入围名单
3. 输出工厂审核与样品测试检查清单
4. 建立认证台账并触发三级到期预警
5. 输出准入推荐与合格供应商 KPI 报告

## 边界与不做

- 何时不用：只需给在用供应商做绩效打分与预警时，用供应商绩效积分卡；只需供应商四维画像与集中度查询时，用供应商本体能力图谱。
- 能力边界：输出准入评分与预警清单，不代替法务或第三方机构核验认证真伪，也不自动发起采购合同。
- 数据边界：认证台账未建立或证书信息缺失时无法给出到期预警；缺失报价或样品维度时需人工补齐后再打分。

## 技能关联

- **前置**：Skill-CrossBorder-Customs-Compliance-Rate-KPI.html、Skill-CrossBorder-Customs-Compliance-Rate-KPI、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Supplier-Development-Roadmap-Tracking.html、Skill-Supplier-Development-Roadmap-Tracking、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost
- **延伸**：Skill-CrossBorder-Customs-Compliance-Rate-KPI.html、Skill-CrossBorder-Customs-Compliance-Rate-KPI、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Supplier-Development-Roadmap-Tracking.html、Skill-Supplier-Development-Roadmap-Tracking
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Development-Roadmap-Tracking.html、Skill-Supplier-Development-Roadmap-Tracking、Skill-Supplier-Qualification-Onboarding-KPI

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-Supplier-Qualification-Onboarding-KPI`