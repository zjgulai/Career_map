---
name: "p2s-expiry-date-aging-baby-products-kpi"
title: "母婴产品效期管理与临期品KPI — 保质期预警/临期库存占比/过期销毁成本管控"
description: "触发词：效期管理、临期库存、保质期预警、FIFO执行率、过期损失。何时不用：需要做库龄分段持有成本精算与清仓触发时用库龄分段管理与资金成本化；需要做保税仓完税时机与资金占用优化时用保税仓智能库存。安全边界：母婴食品效期与批次追溯涉及安全红线，临期与过期品处置须符合食品安全法规与平台新鲜度政策，过期品不得重新上架销售。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 生命周期分析"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-Expiry-Date-Aging-Baby-Products-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按批次盯住奶粉辅食的效期，临期提前预警，把 FIFO 执行到位，别让过期损失吃掉利润。"
user_try: "试试：扫一遍 FBA 库存报告里的批次效期，列出 105 天内临期的批次并给出处置方案。"
whenToUse: "母婴食品与有保质期品类需要批次效期预警、临期占比与 FIFO 执行监控时用本技能；库龄持有成本精算用库龄分段管理与资金成本化。"
workflow: "导入各仓批次库存与效期数据 → 按三级预警分层输出临期批次清单 → 计算临期占比与 FIFO 违规率 → 输出移除、清售等处置行动计划"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 母婴产品效期管理与临期品KPI — 保质期预警/临期库存占比/过期销毁成本管控

## ① 解决的问题

母婴运营面临"奶粉/辅食临期库存蚕食利润"——180天三级预警+FIFO执行率100%，临期品占比从8%降至3%，过期损失归零

## ② 核心算法逻辑

效期管理 是母婴品类供应链中独有且不可忽视的KPI维度。陈凤霞书中特设母婴专项，核心逻辑：

## ③ 业务应用场景

场景A：A2配方奶粉FBA库存效期预警 - 业务问题：FBA仓有批次奶粉效期即将到期，亚马逊会自动封存不可售，但卖家不知道有多少 - 数据要求：FBA库存报告（含batch/lot号） + 各批次生产日期/到期日 - 预期产出： - 临期批次（<105天）：8批次，共320件，货值约2.4万元 - 预计FBA自动封存：48天后发生 - 处置方案：申请FBA移除（成本$0.5/件），再通过折扣渠道清售 - 业务价值：提前处置避免完全过期损失2.4万元，实际回收约1.5万元（扣移除和打折）
场景B：婴儿辅食多仓效期差异管理（FIFO保障） - 业务问题：国内保税仓+3个海外仓都有同款辅食，但各仓批次混乱，FIFO执行不到位 - 数据要求：各仓各SKU各批次库存量 + 效期 - 预期产出：FIFO违规率12%（每8单就有1单不是最早批次发货），临期品占比8%（超标） - 业务价值：FIFO系统化后，临期品占比降至3%，过期损失减少75%，年化节省约8万元
三轨验证 | 成本轨：建立产品过期日期监控系统，初期投入8万元（系统开发5万+培训3万），月均运维成本2500元（人工40小时/月@625元/小时），年化成本38万元；通过缺货率从12%降至3%，年增收益45万元，ROI周期10个月 | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA产品新鲜度政策（要求90天内上架），符合《食品安全法》关于保质期标识要求；需提供产品批次追溯证明和过期品销毁记录 | 风险轨：系统集成失败风险15%（影响数据准确性），供应商配合度不足风险20%（导致数据延迟），海关查验过期品风险8%（需完善销毁流程）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：系统化效期预警后，临期品占比从8%降至3% → 年化减少折扣损失约5-8万元；过期销毁率从1%降至0.2% → 减少直接损失约4-6万元；合规角度：防止过期品流入消费者手中引发的召回/赔偿风险（潜在损失数十万）
实施难度：⭐⭐☆☆☆（需要WMS记录批次效期，大多数WMS支持）
优先级评分：⭐⭐⭐⭐⭐（母婴类目独有必须项：奶粉/辅食效期关系婴儿安全，是平台和法规红线；陈凤霞书专设章节）
评估依据：一次奶粉过期事件在Amazon可导致账号暂停+公关危机，损失远超效期管理成本

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（208 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/expiry_date_aging_baby_products_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Expiry-Date-Aging-Baby-Products-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
母婴产品效期管理与临期品 KPI 体系
功能：效期分层预警 / 临期占比计算 / FIFO执行率 / 过期损失追踪 / 处置建议
输入：库存数据（含批次效期）
输出：效期KPI报告 + 预警清单 + 处置行动计划
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def generate_expiry_inventory(n_batches=80, seed=42):
    """生成含效期的库存批次数据"""
    np.random.seed(seed)
    today = datetime.now()
    
    products = {
        'A2配方奶粉900g': {'shelf_life_days': 730, 'unit_price': 280, 'fba_min_days': 105},
        '有机辅食米糊': {'shelf_life_days': 365, 'unit_price': 65, 'fba_min_days': 90},
        '婴儿洗护套装': {'shelf_life_days': 1095, 'unit_price': 120, 'fba_min_days': 60},
        '益生菌滴剂': {'shelf_life_days': 540, 'unit_price': 180, 'fba_min_days': 120},
        '婴儿湿巾(80片)': {'shelf_life_days': 730, 'unit_price': 25, 'fba_min_days': 45},
    }
    
    warehouses = ['US-FBA', 'DE-FBA', 'CN-保税仓', 'US-海外仓']
    records = []
    
    for i in range(n_batches):
        product = np.random.choice(list(products.keys()))
        info = products[product]
        shelf_life = info['shelf_life_days']
        
        # 随机生产日期（有些批次快过期）
        days_since_production = np.random.choice(
            [np.random.randint(10, 200),       # 新鲜批次（70%）
             np.random.randint(200, 550),       # 中期批次（20%）
             np.random.randint(550, shelf_life + 30)],  # 临期/过期（10%）
            p=[0.70, 0.20, 0.10]
        )
        
        production_date = today - timedelta(days=days_since_production)
        expiry_date = production_date + timedelta(days=shelf_life)
        days_to_expiry = (expiry_date - today).days
        remaining_life_pct = days_to_expiry / shelf_life * 100
        
        # 效期状态
        if days_to_expiry < 0:
            status = '过期'
        elif days_to_expiry <= shelf_life / 3:  # 剩余不足1/3
            status = '临期'
        else:
            status = '正常'
        
        # FBA可上架状态
        fba_min = info['fba_min_days']
        fba_sellable = days_to_expiry >= fba_min
        
        qty = np.random.randint(20, 500)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2311.12045，但该号在 arXiv 上是《Using Guided Transfer Learning to Predispose AI Agent to Learn Efficiently from Small RNA-sequencing Datasets》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：库存数据（含批次与效期）：各仓各 SKU 的批次库存量与生产日期、到期日，以及 SKU 采购成本与历史销量。

**输出**：效期分层预警清单、临期库存占比与 FIFO 执行率、过期损失追踪与处置行动计划，供运营与质量团队执行。

## 执行步骤

1. 导入各仓批次库存与效期数据
2. 按三级预警分层输出临期批次清单
3. 计算临期占比与 FIFO 违规率
4. 输出移除、清售等处置行动计划

## 边界与不做

- 何时不用：需要精算库龄持有成本并规划阶梯清仓时用库龄分段管理与资金成本化；保税仓完税时机与资金占用优化用保税仓智能库存。
- 能力边界：输出预警与处置建议，效期判定以官方批次记录为准，过期品处置须走合规流程不得重新上架。
- 数据边界：需要 WMS 记录批次效期，若库存报告缺少批次字段则无法精确到批次层级。

## 技能关联

- **前置**：Skill-CrossBorder-Customs-Compliance-Rate-KPI.html、Skill-CrossBorder-Customs-Compliance-Rate-KPI、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI.html、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI、Skill-Inventory-Aging-Cost-Management.html、Skill-Inventory-Aging-Cost-Management、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI
- **延伸**：Skill-CrossBorder-Customs-Compliance-Rate-KPI.html、Skill-CrossBorder-Customs-Compliance-Rate-KPI、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI、Skill-Expiry-Date-Aging-Baby-Products-KPI

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Expiry-Date-Aging-Baby-Products-KPI`