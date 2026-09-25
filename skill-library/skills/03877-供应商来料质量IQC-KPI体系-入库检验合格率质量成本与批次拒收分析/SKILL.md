---
name: "p2s-supplier-delivery-quality-rate-kpi"
title: "供应商来料质量IQC-KPI体系 — 入库检验合格率、质量成本与批次拒收分析"
description: "触发词：来料质量、IQC、SPC控制图、批次拒收、COPQ、供应商质量评级。何时不用：客诉根因分析用「客诉供应链根因KPI」；投诉与召回风险用「投诉召回风险预测」。安全边界：检验数据须真实完整不得篡改，对外索赔与供应商处置须走质量与法务流程。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-053"
l3_business: "质量分析"
l3_all: "质量分析 / 供应商评估"
l1_l2_l3: "业务运营/供应与履约/质量分析"
p2s_card_id: "Skill-Supplier-Delivery-Quality-Rate-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用控制图盯住来料合格率的异常波动，早一步发现供应商工艺变了。"
user_try: "试试：用过去 12 个月的批次检验记录画 p-chart，找出异常批次和质量成本。"
whenToUse: "有多批次来料检验记录、需要监控来料质量趋势并定位根因时用；客诉侧的供应链根因用「客诉供应链根因KPI」。"
workflow: "计算各批次合格率与拒收情况 → 绘制 SPC p-chart 并识别特殊原因 → 做缺陷类型的柏拉图分析 → 量化质量成本并给出供应商质量评级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应商来料质量IQC-KPI体系 — 入库检验合格率、质量成本与批次拒收分析

## ① 解决的问题

质量管理面临"来料质量批次性恶化无法早发现"——SPC p-chart实时监控将质量异常提前15批次发现，COPQ降低75%

## ② 核心算法逻辑

IQC（Incoming Quality Control，来料质量检验） 是供应商质量管理的第一道防线。陈凤霞体系将来料质量KPI分为三层：

## ③ 业务应用场景

场景A：吸奶器电机组件来料IQC管控 - 业务问题：吸奶器主要部件电机从2家供应商采购，A供应商历史质量稳定但近3月批次退货率从1.2%升至4.8% - 数据要求：过去12月每批次检验记录（批次号/数量/抽样数/缺陷数/缺陷类型/处理结果） - 预期产出： - SPC p-chart显示A供应商月份X出现特殊原因（工艺切换点） - 主要缺陷类型：密封件变形（72%）→ 定位到原材料供应商变更 - 质量成本量化：COPQ季度约8.5万元 - 业务价值：发现根因后与供应商协定原材料回切，3月内LAR恢复至98.5%，COPQ降低75%
场景B：奶粉包材来料质量分析（FDA合规视角） - 业务问题：包材（内袋/外箱）质量影响FDA认证和客户退货，需要建立系统性IQC-KPI - 数据要求：包材检验记录 + 不良品分类（尺寸偏差/印刷不合格/材质检测不过） - 预期产出：主要缺陷柏拉图（Pareto分析）+ 缺陷跨批次趋势 - 业务价值：系统化管控将包材相关客诉退货从2.1%降至0.8%，避免FDA检查风险
**三轨验证** | 成本轨：FBA备货系统优化月均投入3200元（预测算法开发2000元/月，数据分析人工1200元/月，系统维护成本占比15%），缺货率从12%降至3%可增加年销售额约180万元，ROI周期3个月 | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策要求，需通过ISO9001质量管理体系认证和UPC编码合规性审核，依据为《进出口商品检验法》第三章 | 风险轨：①预测模型偏差导致过度备货风险（概率18%），可能增加仓储成本月均5000-8000元；②汇率波动影响采购成本（概率35%），建议设置汇率对冲机制；③FBA仓库容量限制风险（概率12%），需提前3个月申请

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：母婴品牌IQC管控精细化后，通常将来料质量成本（COPQ）降低40-60%；以年采购额500万、COPQ率从2%降至0.8%计算，年化节省约6万元；同时减少因质量问题引发的Amazon差评和退货
实施难度：⭐⭐⭐☆☆（需要建立IQC检验体系和数据记录，有一定初始投入）
优先级评分：⭐⭐⭐⭐⭐（母婴类目质量直接关系用户安全和品牌信誉，不可忽视）
评估依据：陈凤霞书中指出"来料质量KPI是供应商评价的核心维度，价格第二、质量第一"

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（197 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/supplier_delivery_quality_rate_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supplier-Delivery-Quality-Rate-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应商来料质量 IQC-KPI 体系
功能：批次合格率计算 / SPC p-chart监控 / 质量成本COPQ量化 / 供应商质量评级
输入：IQC检验记录（批次级）
输出：质量KPI报告 + 异常批次预警 + 供应商质量排名
"""
import numpy as np
import pandas as pd
from scipy import stats
import warnings
warnings.filterwarnings('ignore')


def generate_iqc_data(n_batches=120, seed=42):
    """生成模拟IQC检验数据"""
    np.random.seed(seed)
    
    suppliers = {
        'SUP-A深圳宝美': {'base_defect_rate': 0.012, 'shift_at': 80},  # 第80批起工艺异常
        'SUP-B宁波精工': {'base_defect_rate': 0.008, 'shift_at': None},  # 稳定
        'SUP-C杭州新研': {'base_defect_rate': 0.035, 'shift_at': None},  # 质量较差
    }
    
    defect_types = ['密封件变形', '尺寸超差', '外观划痕', '功能失效', '材料不合格']
    records = []
    
    for i in range(n_batches):
        for sup, params in suppliers.items():
            base_rate = params['base_defect_rate']
            # 模拟工艺异常
            if params['shift_at'] and i >= params['shift_at']:
                base_rate *= 3.5  # 质量恶化
            
            sample_size = np.random.randint(80, 200)
            defect_count = np.random.binomial(sample_size, base_rate)
            lot_qty = sample_size * np.random.randint(5, 15)
            
            defect_rate = defect_count / sample_size
            accepted = defect_rate <= 0.025  # 接受准则 AQL 2.5%
            
            # 质量成本估算
            if not accepted:
                rework_cost = lot_qty * 2.5         # 返工/重检成本
                redelivery_cost = 1500              # 退货重发固定成本
                copq = rework_cost + redelivery_cost
            else:
                copq = 0
            
            records.append({
                'batch_id': f'B{i+1:03d}-{sup[:5]}',
                'supplier': sup,
                'batch_seq': i + 1,
                'lot_qty': lot_qty,
                'sample_size': sample_size,
                'defect_count': defect_count,
                'defect_rate': defect_rate,
                'accepted': accepted,
                'primary_defect': np.random.choice(
                    defect_types,
                    p=[0.45, 0.20, 0.15, 0.12, 0.08]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2308.07441，但该号在 arXiv 上是《Physics-Informed Deep Learning to Reduce the Bias in Joint Prediction of Nitrogen Oxides》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去 12 个月每批次检验记录：批次号、数量、抽样数、缺陷数、缺陷类型与处理结果，按批次与供应商组织。

**输出**：批次合格率与来料接收率、p-chart 异常批次预警、缺陷柏拉图、质量成本量化与供应商质量排名，供来料质量管控与供应商评价。

## 执行步骤

1. 计算各批次合格率与拒收比例
2. 绘制控制图并识别特殊原因
3. 做缺陷类型柏拉图定位主要缺陷
4. 量化质量成本
5. 输出供应商质量评级与改善建议

## 边界与不做

- 数据不满足时不适用：检验记录不足或抽样数过小时，控制图控制限不可靠，容易误报异常。
- 能力边界：只产出质量 KPI、异常预警与评级，供应商约谈、索赔与工艺整改由质量与采购团队推动。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Supplier-Delivery-Quality-Rate-KPI

---

> 分类：业务运营/供应与履约/质量分析　·　技术族：04-供应链　·　源卡：`Skill-Supplier-Delivery-Quality-Rate-KPI`