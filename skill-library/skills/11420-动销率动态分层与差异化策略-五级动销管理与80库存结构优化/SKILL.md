---
name: "p2s-inventory-turnover-abc-classification"
title: "ABC动销率动态分层与差异化策略 — ABCDE五级动销管理与80/20库存结构优化"
description: "触发词：库存分层、ABCDE 分类、动销率、清仓优先级、补货频次调整。何时不用：要算每次具体补多少货用「补货模拟」，要预测未来销量用「需求预测」；本技能只做分层与差异化策略。安全边界：清仓与补货频次调整须人工确认后执行，模型不直接下架商品或改价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-Inventory-Turnover-ABC-Classification"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把上百个 SKU 按动销分成 ABCDE 五级，看清哪些该勤补货、哪些该立刻清仓。"
user_try: "试试：我这 120 个 SKU 里，哪些是该重点补货的 A 类，哪些是占着库存卖不动的 E 类？"
whenToUse: "已有过去 12 个月 SKU 销售额、销量与库存金额、需要把商品分层并配差异化补货／清仓策略时用；要算具体补货数量用「补货模拟」，要预测销量用「需求预测」。"
workflow: "汇总 SKU 近 12 个月销售额、销量与库存金额 → 按帕累托累计占比划分 ABCDE 五级 → 算动销率并配各层补货频次与目标 → 排清仓优先级并估算可回收现金 → 月度重算分类并检测层级迁移预警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ABC动销率动态分层与差异化策略 — ABCDE五级动销管理与80/20库存结构优化

## ① 解决的问题

运营团队面临"精力分散平均用力"——ABCDE五级差异化管理将AB类补货从月改为双周，断货减少50%年化增量销售15万元

## ② 核心算法逻辑

陈凤霞书中将ABC分类扩展为 ABCDE五级，每级有明确的定义和差异化管理策略，这是母婴跨境电商商品管理的核心工具：

## ③ 业务应用场景

场景A：吸奶器品类ABCDE分层诊断 - 业务问题：Momcozy有120个SKU，但运营团队精力分散，每个SKU"平均用力"，结果爆品备货不足、长尾积压严重 - 数据要求：所有SKU过去12个月销售额、销量、库存金额 - 预期产出： - A类（5个SKU）：贡献38% GMV，平均周转22次/年 → 补货频次不够（当前月补1次） - E类（35个SKU）：占库存金额14%，年销量几乎为0 → 立即清仓释放现金 - 整体动销率：68%（低于80%目标） - 业务价值：优化AB类补货频次（从月补改为双周），E类清仓回收约8万元，整体库存效率提升25% - 三轨验证： - 成本：需投入约2人天进行
**场景B：奶粉品类季节性ABCDE动态更新** - **业务问题**：冬季A2奶粉某段位（3段→4段转换期）SKU销量异常高，但因为历史分类是C类，补货不足 - **数据要求**：月度销售数据 + ABCDE分类（要求动态更新，不是年度固化） - **预期产出**：发现转换期SKU从C类升级为A类（动态更新），自动触发补货频次提升 - **业务价值**：避免季节性爆品因分类滞后导致的断货，预估减少损失约5万元 - **三轨验证**： - **成本**：需搭建月度自动分类Pipeline（ETL+规则引擎），初期开发约5人天，云函数运行成本约¥100/月；需采购或自建时序数据库存储历史分类快照

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：将精力聚焦AB类（提升补货频次+人工review）→ A类断货减少50%，年化增量销售约15-20万元；E类清仓（当前占库存14%）→ 回收现金约8-12万元；整体库存效率提升20%
实施难度：⭐⭐☆☆☆（帕累托分类计算简单，主要工作是建立分层管理流程和执行纪律）
优先级评分：⭐⭐⭐⭐⭐（陈凤霞："分类管理是所有库存策略的基础，做不好分类等于所有策略都用错了对象"）
评估依据：书中明确：10% SKU贡献80%生意，ABCDE五级是从二八法则向精细化管理的升华

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（216 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/inventory_turnover_abc_classification` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Inventory-Turnover-ABC-Classification.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ABC动销率动态分层与差异化策略
功能：ABCDE五级分类 / 动销率计算 / 分层目标差异化 / 清仓优先级 / 动态更新检测
输入：SKU销售历史数据
输出：ABCDE分类结果 + 动销KPI + 分层管理建议 + 变化预警
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def generate_sku_sales_data(n_skus=120, n_months=12, seed=42):
    """生成SKU月度销售数据"""
    np.random.seed(seed)
    
    # ABCDE分布（真实比例）
    sku_classes = np.random.choice(['A', 'B', 'C', 'D', 'E'],
                                    size=n_skus,
                                    p=[0.04, 0.12, 0.24, 0.35, 0.25])
    
    base_revenues = {
        'A': np.random.uniform(80000, 200000),
        'B': np.random.uniform(20000, 80000),
        'C': np.random.uniform(5000, 20000),
        'D': np.random.uniform(500, 5000),
        'E': np.random.uniform(0, 500),
    }
    
    records = []
    for sku_idx in range(n_skus):
        true_class = sku_classes[sku_idx]
        base_rev = base_revenues[true_class] * np.random.uniform(0.5, 1.5)
        
        for month in range(1, n_months + 1):
            seasonal = 1.0 + 0.25 * np.sin(2 * np.pi * month / 12)
            monthly_rev = max(0, base_rev * seasonal / 12 * (1 + np.random.normal(0, 0.3)))
            
            unit_price = np.random.uniform(30, 250)
            monthly_qty = monthly_rev / unit_price
            
            records.append({
                'sku_id': f'SKU-{sku_idx+1:03d}',
                'true_class': true_class,
                'month': month,
                'revenue': round(monthly_rev, 2),
                'qty': round(monthly_qty, 1),
                'unit_price': round(unit_price, 2),
                'inventory_value': round(monthly_rev * np.random.uniform(0.5, 2.0), 2),
            })
    
    return pd.DataFrame(records)


def classify_abcde(df):
    """ABCDE五级分类（基于销售额帕累托）"""
    sku_rev = df.groupby('sku_id')['revenue'].sum().sort_values(ascending=False).reset_index()
    total_rev = sku_rev['revenue'].sum()
    
    sku_rev['cum_rev'] = sku_rev['revenue'].cumsum()
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2304.11756，但该号在 arXiv 上是《Introducing the Perturbative Solution of the Inter-Channel Stimulated Raman Scattering in Single-Mode Optical Fibers》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU×月粒度的销售历史：sku_id、月份、销售额、销量、库存金额（可含单价）；若要做动态更新，还需历史各月的分类快照，用于检测层级迁移。

**输出**：每个 SKU 的 ABCDE 分类结果与动销 KPI（如整体动销率）、分层管理建议（补货频次、清仓优先级）、层级变化预警（如季节性 SKU 从 C 类升为 A 类并触发补货频次提升）；输出为分类结果表加建议清单与预警项，供运营按层执行差异化动作。

## 执行步骤

1. 拉取全部 SKU 过去 12 个月的销售额、销量与库存金额
2. 按销售额帕累托累计占比把 SKU 划分成 ABCDE 五级
3. 计算各层动销率与周转目标，对照动销率目标找出差距
4. 按层级配差异化策略：AB 类提高补货频次，D／E 类排清仓优先级并估算回收现金
5. 用月度数据滚动重算分类，检出层级迁移并触发预警
6. 输出分类结果、动销 KPI、分层管理建议与变化预警清单

## 边界与不做

- 数据不满足时不用：只有单个时点库存、缺 12 个月销售历史的 SKU 无法做动销分层与迁移检测。
- 只做分类与策略建议，不直接执行清仓、下架或改价动作。
- 卡页 ROI（A 类断货减少 50%、年化增量销售约 15-20 万元、E 类回收现金约 8-12 万元、整体库存效率提升 20%）为书中估算口径，落地前须用本店数据重算。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Sell-Through-Rate-Promo-Inventory.html、Skill-Sell-Through-Rate-Promo-Inventory
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Sell-Through-Rate-Promo-Inventory.html、Skill-Sell-Through-Rate-Promo-Inventory
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Sell-Through-Rate-Promo-Inventory.html、Skill-Sell-Through-Rate-Promo-Inventory、Skill-Inventory-Turnover-ABC-Classification

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Inventory-Turnover-ABC-Classification`