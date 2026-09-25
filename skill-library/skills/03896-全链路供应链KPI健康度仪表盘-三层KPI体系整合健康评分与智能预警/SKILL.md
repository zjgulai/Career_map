---
name: "p2s-supply-chain-kpi-health-dashboard"
title: "全链路供应链KPI健康度仪表盘 — 三层KPI体系整合、健康评分与智能预警"
description: "触发词：供应链 KPI、健康度评分、指标恶化预警、OTIF、缺货率。何时不用：只诊断库存分层与库龄用「库存分层」，只跟单票履约进度用「履约跟踪」；本技能做的是全链路多 KPI 的汇总评分与预警。安全边界：预警只做提示与路由，指标口径与目标值须各 KPI 负责人确认后生效，模型不改业务系统数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-Supply-Chain-KPI-Health-Dashboard"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把三层十几个 KPI 汇成一张健康度看板，哪个指标在悄悄恶化、该找谁处理一目了然。"
user_try: "试试：帮我给这个月的供应链打一个健康度分，看看 14 个 KPI 里哪几个在拖分、分别该找谁。"
whenToUse: "已有月度销量、库存、在途、供应商交货与物流账单数据、需要整体健康度评分与恶化预警时用；只做库存分层诊断用「库存分层」，只跟单票履约进度用「履约跟踪」。"
workflow: "汇总月度多源供应链数据并统一口径 → 逐项计算三层全部 KPI 达成值 → 按权重与红黄绿阈值算 0-100 健康度评分 → 排拖分项与趋势并路由预警责任人 → 对比计划准确率与预测准确率定位人工干预偏差"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 全链路供应链KPI健康度仪表盘 — 三层KPI体系整合、健康评分与智能预警

## ① 解决的问题

运营团队只看GMV，14个关键KPI中有8个在悄悄恶化却无人知晓——三层KPI健康评分(0-100分)将供应链状态实时可视化，年化防损$5-7万，是所有供应链工具的"元监控"

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中完整的第2章构建了电商供应链的三层KPI体系：第一层（生意计划层）关注货品效率（ITO/DOI/动销率/滞销率）和生意质量（缺货率/长尾品）；第二层（物流计划层）关注计划准确性（进销存准确率、满足率）；第三层（物流执行层）关注成本与体验（配送时效/准确率/仓储利用率/OTIF）。三层必须同时监控，任何一层异常都可能是其他层的先导信号。

## ③ 业务应用场景

- 业务问题：某卖家感觉"业务还好，没什么大问题"，但月度复盘发现：销售额增长15%（表面良好）；但ITO从8.5降至6.2（库存膨胀），缺货率从4%升至9%（结构性问题），OTIF从93%降至81%（供应商问题），这三个隐性问题都在恶化 - 数据要求：月度SKU销量/库存/在途/进货计划/实际数据、供应商交货记录、物流账单 - 算法应用： 1. 计算本月三层全部14个KPI 2. 综合健康度评分：64分（🟠待改进） 3. 识别主要拖分项：缺货率9%（得分=55%，权重12%=扣分-5.4）、OTIF 81%（得分=85%，权重8%=扣分-1.2）、ITO 6.2（得分=77%，权重15%=扣
场景B：计划准确率 vs 预测准确率分析（优化人工干预价值）
- 业务问题：数据分析师发现需求预测模型FA=78%，但运营人员拍板后的最终计划PA只有65%——说明人工干预在系统性恶化预测质量 - 算法应用：分析人工干预的方向和幅度：发现运营人员倾向于把预测上调30-50%（过度备货心理），而实际销售大多符合模型预测；建立"干预规范"：上调幅度>20%需提供书面依据 - 预期产出：PA从65%提升至74%，接近FA水平，系统性过度备货现象改善，库存积压减少$12万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：KPI仪表盘是"发现-响应"机制的加速器；某卖家发现OTIF从93%降至81%平均延迟7天，才意识到供应商问题，导致缺货损失$3万；有仪表盘的情况下第2周就能发现并干预，减少损失80%=$2.4万；年化类似事件2-3次，年防损$5-7万；系统成本$4万，ROI≈125-175%（首年），后续年ROI持续提升
实施难度：⭐⭐⭐☆☆（各KPI计算逻辑已有对应Skill；难点是数据标准化（各平台数据口径统一）和自动化刷新频率）
优先级：⭐⭐⭐⭐⭐（供应链管理的"元工具"——所有其他优化工具的效果都需要KPI仪表盘来验证和监控）
适用规模：月销>$10万的卖家，团队规模越大收益越高（跨团队协同需要统一的KPI语言）
数据依赖：整合所有供应链系统数据（OMS/WMS/TMS/采购系统），数据越完整仪表盘价值越高

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（300 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/supply_chain_kpi_health_dashboard` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supply-Chain-KPI-Health-Dashboard.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
全链路供应链KPI健康度仪表盘系统
功能：三层KPI评分 + 综合健康度 + 趋势分析 + 自动预警路由 + 计划vs预测准确率
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


# ─── KPI配置（书中三层体系完整定义）─────────────────────────────
KPI_CONFIG = {
    # Layer 1: 生意计划供应链
    'ito': {
        'name': 'ITO库存周转次数', 'layer': 1, 'weight': 0.15,
        'target': 8.0, 'higher_is_better': True,
        'thresholds': (6.0, 8.0, 10.0),   # 红/黄/绿
        'owner': '采购运营',
    },
    'doi': {
        'name': 'DOI库存天数', 'layer': 1, 'weight': 0.10,
        'target': 45.0, 'higher_is_better': False,
        'thresholds': (60.0, 45.0, 30.0),  # 红/黄/绿（越低越好）
        'owner': '采购运营',
    },
    'active_rate': {
        'name': '动销率', 'layer': 1, 'weight': 0.08,
        'target': 0.80, 'higher_is_better': True,
        'thresholds': (0.60, 0.80, 0.90),
        'owner': '选品运营',
    },
    'oos_rate': {
        'name': '缺货率(OOS)', 'layer': 1, 'weight': 0.12,
        'target': 0.05, 'higher_is_better': False,
        'thresholds': (0.12, 0.05, 0.02),
        'owner': '采购运营',
    },
    'sellthrough_rate': {
        'name': '大促售罄率', 'layer': 1, 'weight': 0.08,
        'target': 0.75, 'higher_is_better': True,
        'thresholds': (0.50, 0.75, 0.90),
        'owner': '大促运营',
    },
    'forecast_accuracy': {
        'name': '预测准确率(FA)', 'layer': 1, 'weight': 0.12,
        'target': 0.75, 'higher_is_better': True,
        'thresholds': (0.55, 0.75, 0.90),
        'owner': '数据分析',
    },
    'line_fill_rate': {
        'name': 'Line Fill Rate', 'layer': 1, 'weight': 0.10,
        'target': 0.97, 'higher_is_better': True,
        'thresholds': (0.90, 0.97, 0.99),
        'owner': '采购运营',
    },
    # Layer 2: 物流计划供应链
    'purchase_plan_accuracy': {
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.09321，但该号在 arXiv 上是《ReconBoost: Boosting Can Achieve Modality Reconcilement》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：月度粒度多源数据：SKU 销量／库存／在途、进货计划与实际、供应商交货记录、物流账单与配送时效记录；来源覆盖 OMS／WMS／TMS 与采购系统，需先统一各平台数据口径。

**输出**：三层 14 个 KPI 的逐项得分与红黄绿档位、加权后的 0-100 综合健康度评分、拖分项排名与趋势对比、按责任人自动路由的预警，以及计划准确率 PA 与预测准确率 FA 的对比；供管理层月度复盘与责任人跟进。

## 执行步骤

1. 汇总月度 SKU 销量、库存、在途、进货计划与实际、供应商交货与物流账单数据
2. 按三层 KPI 体系逐项计算全部 14 个 KPI 的达成值
3. 按各 KPI 的目标与红黄绿阈值折算得分，乘权重加总出 0-100 健康度评分
4. 列出拖分项排名与指标趋势，判断哪一层在恶化
5. 按 KPI 归属责任人自动路由预警
6. 对比预测准确率 FA 与计划准确率 PA，指出人工干预造成的系统性偏差

## 边界与不做

- 数据不满足时不用：各平台口径未统一、或缺在途与供应商交货记录的月份，KPI 与评分会失真。
- 只做指标计算、评分与预警路由，不直接改动任何业务系统数据或考核结果。
- 卡页 ROI（年化防损 $5-7 万、系统成本 $4 万、首年 ROI≈125-175%）为估算口径，落地前须用本店数据重算。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Fill-Rate-OOS-Cost-Quantification.html、Skill-Fill-Rate-OOS-Cost-Quantification、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-KPI-Health-Dashboard

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Supply-Chain-KPI-Health-Dashboard`