---
name: "p2s-sell-through-rate-promo-inventory"
title: "售罄率精细化KPI体系 — 大促/新品/季节性多口径售罄率计算与库存水位判断"
description: "触发词：售罄率、STR、大促复盘、库存水位、预售口径。何时不用：要做入库/存货/销售三维误差归因时用「物流计划三维准确率」；要拆大促 lift 备货时用「大促需求分解」。安全边界：仅使用内部库存与销售数据，不含用户隐私数据，无 Amazon 政策与 GDPR 风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Sell-Through-Rate-Promo-Inventory"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促后算清到底卖得算不算成功，按有无预售分别看售罄率，直接告诉下次哪些该少备。"
user_try: "试试：按跨境 50-60% 目标复盘这次黑五各 SKU 售罄率，指出哪些该减备、哪些该加备。"
whenToUse: "大促或新品首单结束后要评估备货质量、且必须区分有无预售口径时用；要做三维误差归因用物流计划三维准确率；要拆 lift 备货用大促需求分解。"
workflow: "取大促前可售良品库存快照与期间实际销售量 → 按有无预售分别计算售罄率 → 对照跨境目标区间判断偏高或积压 → 输出各 SKU 备货评价与下次调整建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 售罄率精细化KPI体系 — 大促/新品/季节性多口径售罄率计算与库存水位判断

## ① 解决的问题

大促运营面临"不知道备货成不成功"——跨境售罄率50-60%目标+有无预售两种口径，精确复盘指导下次减少滞销损失20-40万元

## ② 核心算法逻辑

售罄率（SellThrough Rate, STR） 是陈凤霞书中评价备货质量和库存计划准确性的综合检验指标。售罄率不是一个单一数字，需要按场景精确区分口径：

## ③ 业务应用场景

场景A：Black Friday吸奶器备货回顾 - 业务问题：Black Friday结束，仓库剩余大量库存，但不知道卖了多少算"成功" - 数据要求：BF前可售良品库存（按SKU）+ BF期间实际销售量 + 有无预售订单 - 预期产出： - 旗舰款STR = 72%（✅ 跨境50-60%目标之上，偏高） - 配件套装STR = 38%（⚠️ 严重积压，需双12加大促销力度） - A2奶粉STR = 55%（✅ 正常，双12继续销售） - 整体备货评价：旗舰款备货稍少，配件备多了 - 业务价值：复盘指导下次大促备货策略，减少滞销金额约20万元
三轨验证： - 成本：需从ERP/WMS提取库存快照（大促前1天截数），数据清洗约2人天；计算资源可忽略 - 合规：不涉及用户隐私数据，仅使用内部库存与销售数据，无Amazon政策或GDPR风险 - 风险：若STR偏高（>80%）导致紧急补货，可能触发物流成本飙升或供应商加价；建议补货前做ROI测算
场景B：新品辅食机首单售罄率追踪 - 业务问题：新品辅食机首批500台，3个月后评估是否追单，需要量化"首单是否成功" - 数据要求：首批到货时间 + 3个月内累计销售量 - 预期产出：3个月STR = 52%（低于60%目标）→ 建议谨慎追单，先优化Listing提升转化率 - 业务价值：避免新品失败追单导致更大库存积压，按案例节省约15万元滞销损失

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：精确追踪售罄率后，下次大促备货精准度提升15%，年化减少积压滞销损失约20-40万元；新品首单STR管控减少失败新品追单损失约10-15万元
实施难度：⭐⭐☆☆☆（计算简单，关键是口径统一：有无预售必须分开处理）
优先级评分：⭐⭐⭐⭐⭐（陈凤霞："售罄率是采购和库存计划质量的综合检验，比任何单一KPI都更直接"）
评估依据：跨境目标50-60%（陈凤霞书）vs 国内60-80%，差异来源于跨境大促后续销售机会更多

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（199 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/sell_through_rate_promo_inventory` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Sell-Through-Rate-Promo-Inventory.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
售罄率精细化 KPI 体系
功能：大促STR / 新品STR / 季节性STR / 有无预售两种口径 / 行业对标 / 库存行动建议
输入：备货量 + 销售量 + 预售数量
输出：STR KPI报告 + 库存诊断 + 下次备货建议
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def generate_promo_inventory_data(n_skus=30, seed=42):
    """生成模拟大促库存与销售数据"""
    np.random.seed(seed)
    
    categories = ['吸奶器旗舰', '吸奶器入门', '吸奶器配件', 'A2奶粉900g', '辅食机', '婴儿湿巾100片']
    
    records = []
    for i in range(n_skus):
        cat = np.random.choice(categories)
        
        # 备货量（基于销售计划）
        base_stock = np.random.randint(100, 2000)
        has_presale = np.random.random() < 0.3  # 30%有预售
        presale_qty = int(base_stock * np.random.uniform(0.05, 0.20)) if has_presale else 0
        available_stock = base_stock - presale_qty
        
        # 模拟真实STR（不同品类不同水平）
        true_str = {
            '吸奶器旗舰': np.random.uniform(0.55, 0.80),
            '吸奶器入门': np.random.uniform(0.45, 0.65),
            '吸奶器配件': np.random.uniform(0.25, 0.55),
            'A2奶粉900g': np.random.uniform(0.48, 0.65),
            '辅食机': np.random.uniform(0.35, 0.70),
            '婴儿湿巾100片': np.random.uniform(0.55, 0.80),
        }[cat]
        
        actual_sales = round(available_stock * true_str)
        remaining = available_stock - actual_sales + presale_qty  # 大促后剩余（含预售出货后回库）
        
        records.append({
            'sku_id': f'SKU-{i+1:03d}',
            'category': cat,
            'stock_before_promo': base_stock,
            'presale_qty': presale_qty,
            'available_stock': available_stock,  # 可用于STR计算的分母
            'actual_sales': actual_sales,
            'remaining_stock': max(0, base_stock - actual_sales),
            'str_raw': actual_sales / max(1, available_stock),
            'has_presale': has_presale,
        })
    
    return pd.DataFrame(records)


def compute_sell_through_rates(df, promo_type='大促(跨境)', channel='cross_border'):
    """计算各口径售罄率"""
    print("=" * 65)
    print(f"【售罄率 KPI 分析 — {promo_type}】")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.09234，但该号在 arXiv 上是《ClickPrompt: CTR Models are Strong Prompt Generators for Adapting Language Models to CTR Prediction》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：大促前可售良品库存（按 SKU，大促前 1 天截数）、期间实际销售量、有无预售订单标记、新品首单到货时间；粒度：SKU×大促场次或首单周期。

**输出**：分口径售罄率（卡页示例：旗舰款 72%、配件套装 38%、A2 奶粉 55%）与备货评价、下次大促调整建议，供备货复盘与追单决策使用。

## 执行步骤

1. 截取大促前库存快照与期间销量
2. 按有无预售分开计算售罄率
3. 对照目标区间判定积压或偏紧
4. 输出各 SKU 的备货评价
5. 给出下次备货与追单建议

## 边界与不做

- 数据不满足时不用：没有大促前库存快照、或销量含未发货订单时，售罄率口径失真。
- 能力边界：只做口径统一的复盘指标与建议，不直接决定促销力度与追单量。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-PostPromo-Retrospective-KPI.html、Skill-PostPromo-Retrospective-KPI、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-PostPromo-Retrospective-KPI.html、Skill-PostPromo-Retrospective-KPI、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Sell-Through-Rate-Promo-Inventory

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-Sell-Through-Rate-Promo-Inventory`