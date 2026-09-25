---
name: "p2s-fba-stranded-unfulfillable-inventory-kpi"
title: "FBA滞销不可售库存KPI与处置策略 — 滞销率/仓储过长费预警/移除决策优化"
description: "触发词：FBA滞销、不可售库存、库龄超期、仓储过长费、移除决策、索赔材料。何时不用：要自动触发降价清仓时用「降价清仓触发」；跨渠道调拨库存用「一盘货库存调度」。安全边界：移除与弃置不可逆须人工确认，索赔材料须以真实入仓与调查记录为依据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
p2s_card_id: "Skill-FBA-Stranded-Unfulfillable-Inventory-KPI"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把仓里超龄和不可售的库存挑出来，算清仓储费，决定闪购、移除还是索赔。"
user_try: "试试：按这份 FBA 库存报告找出库龄超 180 天的 SKU，估算仓储过长费并给出处置方案。"
whenToUse: "FBA 库存出现长期仓储费或不可售库存、需要处置决策时用；批量滞销清仓的降价执行走「降价清仓触发」。"
workflow: "按库龄分段统计库存与仓储费 → 结合销速做四象限分类 → 给出闪购、移除或观察的处置方案 → 识别平台责任损坏并准备索赔清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# FBA滞销不可售库存KPI与处置策略 — 滞销率/仓储过长费预警/移除决策优化

## ① 解决的问题

FBA运营面临"仓储过长费持续蚕食利润"——库龄×销速四象限处置决策节省年化LTSF约$18,000，同时追回Amazon赔款$2,000+

## ② 核心算法逻辑

FBA滞销/不可售库存 是Amazon跨境卖家最主要的隐性成本陷阱。陈凤霞书中专设FBA运营章节，将此类库存分为三类：

## ③ 业务应用场景

场景A：吸奶器SKU FBA库存健康度诊断 - 业务问题：Momcozy美国FBA仓有SKU库龄超过180天，每月仓储过长费高达$2,800 - 数据要求：FBA库存报告（SKU/数量/库龄段/仓储费用）+ 近期销售数据 - 预期产出： - 问题库存清单：5个SKU库龄>180天，占FBA库存额的8.5% - 月仓储过长费估算：$2,800（可避免） - 处置方案：2个SKU做闪购，2个SKU申请移除，1个SKU维持观察 - 业务价值：执行处置后节省$2,200/月仓储费，同时回收约$3,500现金流
场景B：不可售库存追踪与Amazon索赔 - 业务问题：Amazon仓库操作导致部分货物受损标记为不可售，但未自动赔偿，需要人工索赔 - 数据要求：FBA调查报告 + 不可售库存记录 + 原始入仓记录 - 预期产出： - 识别Amazon责任损坏比率（通常占不可售的60-70%） - 准备索赔材料清单 - 业务价值：年化追回Amazon赔款约$1,500-$3,000（多数卖家未主动索赔）
**三轨验证** | 成本轨：FBA滞销品处理月均成本1200元（仓储费0.87元/件/天×500件×30天+报废处理费300元），AI预测模型部署成本月均800元（云服务器400元+人工维护10小时×40元/小时），合计月均2000元，年化24000元，相比缺货率下降9%带来的年化45万收益，ROI达1875% | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策，需建立滞销品处理台账并保留3个月记录，符合出入境检验检疫要求 | 风险轨：预测模型准确率风险（概率15%，影响：误判导致过度备货增加2-3万元成本），供应链中断风险（概率8%，影响：无法及时补货导致缺货率反弹），政策

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：FBA运营1年以上的品牌通常有5-15%库存产生过长费，年化LTSF支出约$3,000-$15,000；系统化管理可减少70%过长费；同时Amazon索赔可追回$1,500-$3,000/年（多数卖家未追）
实施难度：⭐⭐☆☆☆（Amazon Seller Central提供库存报告，主要是分析逻辑）
优先级评分：⭐⭐⭐⭐⭐（陈凤霞书FBA专章核心：LTSF是直接吞噬利润的"看不见的成本"）
评估依据：陈凤霞书数据：跨境卖家平均FBA库存健康度评分仅62分，滞销库存费年化占营业额0.5-2%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（213 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/fba_stranded_unfulfillable_inventory_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-FBA-Stranded-Unfulfillable-Inventory-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
FBA 滞销/不可售库存 KPI 与处置策略
功能：库龄分布分析 / 仓储过长费计算 / 处置决策树 / 索赔识别
输入：FBA库存报告（SKU/库龄/数量/尺寸）
输出：FBA库存健康KPI + 过长费预测 + 处置优先级
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


# Amazon FBA 仓储费率表（美国站，立方英尺/月，2024年）
FBA_STORAGE_RATES = {
    (0, 90):   {'standard': 0.75, 'ltsf': 0.00},
    (91, 180): {'standard': 0.75, 'ltsf': 0.15},
    (181, 270):{'standard': 0.75, 'ltsf': 0.15},
    (271, 365):{'standard': 0.75, 'ltsf': 1.50},
    (365, 9999):{'standard': 1.50,'ltsf': 6.90},
}

def get_storage_rate(days_in_storage):
    """根据库龄获取仓储费率"""
    for (low, high), rates in FBA_STORAGE_RATES.items():
        if low <= days_in_storage < high:
            return rates
    return {'standard': 1.50, 'ltsf': 6.90}


def generate_fba_inventory(n_skus=50, seed=42):
    """生成模拟FBA库存数据"""
    np.random.seed(seed)
    
    sku_categories = ['吸奶器主机', '吸奶器配件', 'A2奶粉900g', '婴儿湿巾', '辅食机', '安抚奶嘴']
    
    records = []
    for i in range(n_skus):
        category = np.random.choice(sku_categories)
        
        # 库龄分布（大部分健康，少部分滞销）
        age_segment = np.random.choice(
            ['0-90', '91-180', '181-270', '271-365', '365+'],
            p=[0.55, 0.20, 0.12, 0.08, 0.05]
        )
        
        age_map = {'0-90': (0, 90), '91-180': (91, 180), '181-270': (181, 270),
                   '271-365': (271, 365), '365+': (365, 500)}
        age_low, age_high = age_map[age_segment]
        days_in_storage = np.random.randint(age_low, age_high + 1)
        
        units = np.random.randint(5, 200)
        unit_price = np.random.uniform(15, 180)
        
        # 商品尺寸（立方英尺/件）
        cubic_feet = np.random.uniform(0.1, 2.5)  # 标准尺寸
        
        # 月销售量（用于判断销速）
        monthly_velocity = np.random.exponential(30)  # 均值30件/月
        if age_segment in ['181-270', '271-365', '365+']:
            monthly_velocity *= 0.2  # 滞销品销速低
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.07832，但该号在 arXiv 上是《VAPOR: Legged Robot Navigation in Outdoor Vegetation Using Offline Reinforcement Learning》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：FBA 库存报告（SKU、数量、库龄段、尺寸与仓储费用）、近期销售数据（用于销速）、不可售库存记录与原始入仓记录。

**输出**：问题库存清单与占比、月仓储过长费估算、按四象限给出的处置方案（闪购/移除/观察）与优先级，以及索赔材料清单与可追回金额估算。

## 执行步骤

1. 按库龄分段统计库存与费用
2. 结合销速做四象限分类
3. 给出闪购、移除或维持观察的处置建议
4. 识别平台责任损坏并整理索赔清单
5. 输出处置优先级与预计费用节省

## 边界与不做

- 数据不满足时不适用：没有库龄字段或近期销量时无法判断滞销；缺原始入仓记录则索赔证据链不完整。
- 能力边界：只产出处置建议与索赔清单，移除、弃置与索赔提交由人工在卖家后台执行。
- 平台费率与阈值会变动，库龄与销速门限需按期更新，误判可能造成不必要的移除。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Inventory-Aging-Cost-Management.html、Skill-Inventory-Aging-Cost-Management、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Unified-Cross-Border-Inventory-Dispatch.html、Skill-Unified-Cross-Border-Inventory-Dispatch、Skill-Warehouse-Cost-Per-Unit-KPI.html、Skill-Warehouse-Cost-Per-Unit-KPI
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Unified-Cross-Border-Inventory-Dispatch.html、Skill-Unified-Cross-Border-Inventory-Dispatch、Skill-Warehouse-Cost-Per-Unit-KPI.html、Skill-Warehouse-Cost-Per-Unit-KPI
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Unified-Cross-Border-Inventory-Dispatch.html、Skill-Unified-Cross-Border-Inventory-Dispatch、Skill-Warehouse-Cost-Per-Unit-KPI.html、Skill-Warehouse-Cost-Per-Unit-KPI、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI

---

> 分类：业务运营/供应与履约/调拨清货建议　·　技术族：04-供应链　·　源卡：`Skill-FBA-Stranded-Unfulfillable-Inventory-KPI`