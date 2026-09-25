---
name: "p2s-warehouse-inbound-quality-accuracy-kpi"
title: "仓储入库质量与收货准确率KPI — 收货差异检测、破损率管控与验收时效"
description: "触发词：收货差异、破损率、验收时效、差异追溯。何时不用：缺少采购单与收货确认等原始凭证时无法核对差异；排查库存盗损用库存异常检测类技能。安全边界：需建立进货检验记录与不合格品处置档案，并满足相应质量管理体系要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-061"
l3_business: "仓储协作"
l3_all: "仓储协作 / 质量分析"
l1_l2_l3: "业务运营/供应与履约/仓储协作"
p2s_card_id: "Skill-Warehouse-Inbound-Quality-Accuracy-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从量、质、时三个维度管理入库质量，把收货差异定位到具体原因并追回损失。"
user_try: "试试：这批吸奶器 FBA 收货少了 15 件，帮我做一套入库差异的追溯与 KPI 分析。"
whenToUse: "本卡属「仓储协作」。需要分析入库差异原因、破损率与验收时效时用本卡；排查海外仓库存被盗损等异常用库存异常检测类技能。"
workflow: "汇总采购单与发货清单 → 比对收货确认算差异 → 归类差异原因与索赔结果 → 输出分仓分供应商质量热图"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 仓储入库质量与收货准确率KPI — 收货差异检测、破损率管控与验收时效

## ① 解决的问题

仓储入库面临"收货差异无法追溯"——三维KPI体系（量/质/时）将入库差异率从2.8%降至0.5%，年减少损失15万元

## ② 核心算法逻辑

入库质量管控 是陈凤霞书中仓储管理的起点，"入库准确才能库存准确"。入库KPI体系覆盖三个核心维度：

## ③ 业务应用场景

场景A：FBA直发入库差异管控 - 业务问题：吸奶器批次入库FBA仓后，亚马逊系统显示收货500件但实际签收发货485件，差异15件无法追溯 - 数据要求：采购单数量 + 物流发货清单 + FBA收货确认 + 每批次差异原因记录 - 预期产出： - 近12月入库差异率趋势（当前平均2.8%，超标） - 差异原因分布：FBA收货差异35%、供应商短发28%、运输破损22%、录入错误15% - 每类差异的索赔成功率和追回金额 - 业务价值：系统化差异管控将损失从年化18万降至4万，同时满足Amazon平台差异率标准
场景B：海外仓多供应商批量入库质量监控 - 业务问题：海外仓（美国/德国）同时接收5家供应商货物，入库质量参差不齐，仓库人员标准不统一 - 数据要求：每批次入库记录（时间/SKU/数量/破损情况/验收人） - 预期产出： - 分仓库/分供应商的入库质量KPI热图 - 最佳实践标准化（从最优仓库推广） - 业务价值：统一标准后整体破损率从0.8%降至0.25%，节省年化损失约10万元
三轨验证 | 成本轨：WMS系统升级+条码扫描枪部署，初期投入12万元，月均运维成本3500元，人工质检成本月均8000元（16小时/月），ROI周期8个月，年化成本投入58万元 | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA入库标准，需建立进货检验记录、不合格品处置档案，满足ISO9001质量管理体系要求 | 风险轨：系统集成风险（概率15%）、员工培训周期长（概率20%）、供应商配合度不足导致源头质量控制失效（概率25%），缺货率反弹至8%的概率18%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：将入库差异率从2%降至0.5% = 年减少损失约15万元（含差异货物价值+索赔人工+库存不准确导致的补货错误）；准确的入库KPI使库存准确率提升，减少年化库存偏差损失约10万元
实施难度：⭐⭐☆☆☆（核心是扫码验收替代手工记录，数据采集成本低）
优先级评分：⭐⭐⭐⭐⭐（"入库准确"是库存准确性的根基，陈凤霞书第一章起点）
评估依据：陈凤霞书中强调"库存不准从入库错误开始，90%的盘点差异可追溯到入库环节的错误或漏记"

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（191 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 54 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/warehouse_inbound_quality_accuracy_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Warehouse-Inbound-Quality-Accuracy-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
仓储入库质量与收货准确率 KPI 体系
功能：收货准确率计算 / 破损率监控 / 差异根因归因 / 入库KPI仪表盘
输入：入库验收记录（批次级）
输出：入库质量KPI报告 + 差异索赔建议 + 根因分析
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def generate_inbound_records(n=300, seed=42):
    """生成模拟入库验收数据"""
    np.random.seed(seed)
    
    suppliers = ['SUP-深圳宝美', 'SUP-宁波精工', 'SUP-广州婴优', 'SUP-东莞精密']
    warehouses = ['US-FBA仓', 'DE-海外仓', 'CN-保税仓']
    discrepancy_reasons = ['供应商短发', '运输破损', 'FBA收货误差', '包装换算错误', '系统录入错误', '无差异']
    
    records = []
    base_date = datetime(2025, 1, 1)
    
    for i in range(n):
        po_qty = np.random.randint(200, 2000)
        warehouse = np.random.choice(warehouses, p=[0.5, 0.3, 0.2])
        supplier = np.random.choice(suppliers)
        
        # 模拟差异（90%批次无实质差异，10%有差异）
        has_discrepancy = np.random.random() < 0.10
        
        if has_discrepancy:
            reason = np.random.choice(discrepancy_reasons[:-1],
                                      p=[0.30, 0.25, 0.20, 0.15, 0.10])
            # 差异量（短发/损坏数量）
            discrepancy_qty = np.random.randint(1, max(2, int(po_qty * 0.05)))
            received_qty = po_qty - discrepancy_qty
            damaged_qty = discrepancy_qty if reason == '运输破损' else 0
        else:
            reason = '无差异'
            discrepancy_qty = 0
            received_qty = po_qty
            damaged_qty = np.random.randint(0, 2)  # 偶尔有极少破损
        
        # 验收时效（小时）
        receiving_hours = np.random.choice(
            [np.random.randint(8, 20), np.random.randint(20, 48), np.random.randint(48, 72)],
            p=[0.75, 0.20, 0.05]
        )
        
        arrive_date = base_date + timedelta(days=np.random.randint(0, 365))
        
        records.append({
            'inbound_id': f'IN-{i+1:04d}',
            'supplier': supplier,
            'warehouse': warehouse,
            'arrive_date': arrive_date,
            'month': arrive_date.strftime('%Y-%m'),
            'po_qty': po_qty,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2311.08562，但该号在 arXiv 上是《MAgIC: Investigation of Large Language Model Powered Multi-Agent in Cognition, Adaptability, Rationality and Collaboration》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：采购单数量、物流发货清单、平台收货确认、每批次差异原因记录，以及分仓库分供应商的入库验收记录（时间、SKU、数量、破损情况、验收人）。

**输出**：入库差异率趋势、差异原因分布与索赔追回金额、分仓库分供应商的入库质量 KPI 热图，以及验收时效与破损率改善结论。

## 执行步骤

1. 汇总采购单、发货清单与收货确认数据
2. 计算批次差异率并归类差异原因
3. 统计各类差异的索赔成功率与追回金额
4. 按仓库与供应商生成质量 KPI 热图
5. 输出破损率与验收时效的标准化改善项

## 边界与不做

- 缺少采购单与收货确认等原始凭证时无法核对差异，不用本卡
- 本卡产出差异分析与 KPI，不负责向平台或供应商正式发起索赔
- 需建立进货检验记录与不合格品处置档案，满足相应质量管理体系要求

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Warehouse-Operations-KPI-Picking-Efficiency.html、Skill-Warehouse-Operations-KPI-Picking-Efficiency、Skill-Warehouse-Outbound-Fulfillment-SLA.html、Skill-Warehouse-Outbound-Fulfillment-SLA
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Warehouse-Operations-KPI-Picking-Efficiency.html、Skill-Warehouse-Operations-KPI-Picking-Efficiency、Skill-Warehouse-Outbound-Fulfillment-SLA.html、Skill-Warehouse-Outbound-Fulfillment-SLA
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Warehouse-Inbound-Quality-Accuracy-KPI

---

> 分类：业务运营/供应与履约/仓储协作　·　技术族：04-供应链　·　源卡：`Skill-Warehouse-Inbound-Quality-Accuracy-KPI`