---
name: "p2s-procurement-cycle-time-kpi"
title: "采购前置期PLT全链路KPI体系 — 采购周期时效量化与断货风险预警"
description: "触发词：采购前置期KPI、PLT分布、阶段瓶颈、P85安全库存、供应商交期可靠性。何时不用：海运延误的分位数预警走「提前期分布建模」；日常补货量计算用「自动补货决策」。安全边界：分析仅使用采购与库存字段，涉及客户需求的数据须脱敏并加密存储。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Procurement-Cycle-Time-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把采购周期拆到各阶段看瓶颈，用 P85 而不是均值来定备货提前量。"
user_try: "试试：用历史 PO 时间戳算出 PLT 分布、阶段瓶颈与 P85 提前期下的安全库存。"
whenToUse: "需要诊断采购周期为何不达标、或要按分位数而非均值设置备货提前量时用；只做海运延误实时预警走「提前期分布建模」。"
workflow: "汇总采购订单各阶段时间戳 → 输出 PLT 分布与达成率 → 定位方差最大的阶段瓶颈 → 用 P85 提前期重算安全库存 → 对多家供应商做交期可靠性评分与组合建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 采购前置期PLT全链路KPI体系 — 采购周期时效量化与断货风险预警

## ① 解决的问题

采购计划员面临"PLT均值掩盖风险"——P85分位点法将安全库存精准化，断货率从18%降至4%，年化减少断货损失15万元

## ② 核心算法逻辑

采购前置期（PLT, Procurement Lead Time） 是供应链计划的基准时间轴。全链路PLT由三段叠加：

## ③ 业务应用场景

场景A：吸奶器SKU跨境采购PLT诊断 - 业务问题：Momcozy 吸奶器从国内供应商采购，历史多次断货，事后发现PLT比计划多出8-12天 - 数据要求：历史采购订单（下单日→到仓日）+ 各阶段节点时间戳（生产完工日、发货日、清关日） - 预期产出： - PLT分布图（P50=28天，P85=38天，P95=45天） - 阶段瓶颈热图（生产阶段方差最大 → 找根因） - PLT达成率：过去12月仅73%（目标90%） - 业务价值：用P85替代均值计算安全库存，备货提前5天，断货率从18%降至4%，年化减少断货损失约15万元
场景B：A2奶粉多供应商PLT对比优化 - 业务问题：同款A2奶粉对接3家供应商，价格差异5%，但PLT差异高达12天 - 数据要求：每家供应商近24批次PLT明细数据 - 预期产出：供应商PLT可靠性评分（均值+方差双维度）、最优供应商组合方案 - 业务价值：PLT短且稳定的供应商减少应急空运2次/季 → 节省空运费约8万元/年
三轨验证 | 成本轨：AI预测模型部署成本月均3,500元（云服务2,000元+人工维护20小时/月×750元/小时），首年投入42,000元，ROI周期3.2个月（年化节省成本45万）。库存优化降低积压资金约120万元。 | 合规轨：符合《跨境电商商品质量管理规范》和FBA备货合规要求，需获得AWS/阿里云数据安全认证；AI模型决策需建立人工审核机制（每周1次，4小时/周），确保合规性。 | 风险轨：预测模型准确度风险（概率15%），可能导致缺货率反弹至8%；供应链突发中断风险（概率8%），需建立安全库存缓冲；数据隐私泄露风险（概率3%），需加密存储客户需求数据。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：PLT管理精细化可减少50%断货事件，以日均GMV 5万元、断货率降低10个百分点测算，年化减少断货损失约18万元；同时减少紧急空运2-3次/季，节省空运附加费8-12万元/年
实施难度：⭐⭐☆☆☆（核心依赖采购订单时间戳，多数ERP/采购系统有记录）
优先级评分：⭐⭐⭐⭐⭐（PLT是所有库存计划的基础输入，优先级最高）
评估依据：陈凤霞书中强调PLT是供应链计划"第一输入"，P85分位点法比均值法普遍减少20-30%断货风险

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（220 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/procurement_cycle_time_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Procurement-Cycle-Time-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
采购前置期(PLT) KPI 分析体系
功能：PLT分布分析 / 阶段拆解 / 安全库存重算 / 断货预警
输入：采购订单历史数据（含各阶段时间戳）
输出：PLT KPI报告 + 安全库存建议
"""
import numpy as np
import pandas as pd
from scipy import stats
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def generate_sample_po_data(n=200, seed=42):
    """生成模拟采购订单数据（含各阶段时间戳）"""
    np.random.seed(seed)
    records = []
    base_date = datetime(2025, 1, 1)
    
    for i in range(n):
        t_order_confirm = np.random.randint(1, 3)           # 下单确认：1-2天
        t_production = np.random.randint(10, 22)            # 生产：10-21天（长尾）
        if np.random.random() < 0.15:                       # 15%概率遇到产能延误
            t_production += np.random.randint(5, 12)
        t_transit = np.random.randint(18, 32)               # 海运：18-31天
        t_customs = np.random.randint(2, 8)                 # 清关：2-7天（偶尔延误）
        if np.random.random() < 0.10:
            t_customs += np.random.randint(3, 10)
        t_inbound = np.random.randint(1, 4)                 # 入仓验收：1-3天
        
        total_plt = t_order_confirm + t_production + t_transit + t_customs + t_inbound
        order_date = base_date + timedelta(days=i * 2)
        planned_plt = 35  # 计划PLT = 35天
        
        records.append({
            'po_id': f'PO-{i+1:04d}',
            'sku': np.random.choice(['SKU-吸奶器A', 'SKU-吸奶器B', 'SKU-奶粉900g']),
            'supplier': np.random.choice(['供应商A', '供应商B', '供应商C'],
                                         p=[0.5, 0.3, 0.2]),
            'order_date': order_date,
            'planned_plt': planned_plt,
            'actual_plt': total_plt,
            't_confirm': t_order_confirm,
            't_production': t_production,
            't_transit': t_transit,
            't_customs': t_customs,
            't_inbound': t_inbound,
            'plt_variance': total_plt - planned_plt,  # 正=延误
        })
    
    return pd.DataFrame(records)


def analyze_plt_distribution(df):
    """PLT分布分析：均值/分位数/方差系数"""
    print("=" * 60)
    print("【PLT分布分析】")
    print("=" * 60)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.14791，但该号在 arXiv 上是《Large dilates of hypercube graphs in the plane》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史采购订单（下单日到到仓日）及各阶段时间戳：下单确认、生产完工、发货、清关、入仓验收，按批次或 PO 粒度组织。

**输出**：PLT 分布与分位数、阶段瓶颈拆解、PLT 达成率、按 P85 提前期重算的安全库存建议，以及供应商交期可靠性评分与组合方案。

## 执行步骤

1. 整理历史 PO 的各阶段时间戳
2. 计算 PLT 分布与达成率
3. 定位方差最大的阶段作为瓶颈
4. 用 P85 提前期重算安全库存
5. 输出供应商交期可靠性评分与组合建议

## 边界与不做

- 数据不满足时不适用：采购系统没有阶段时间戳、只有下单日与到货日时，无法拆解瓶颈阶段。
- 能力边界：只产出交期诊断与安全库存建议，供应商整改、应急空运与合同条款调整由人工推进。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Replenishment-Parameter-Calibration.html、Skill-Replenishment-Parameter-Calibration、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Replenishment-Parameter-Calibration.html、Skill-Replenishment-Parameter-Calibration、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Procurement-Cycle-Time-KPI

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Procurement-Cycle-Time-KPI`