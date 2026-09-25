---
name: "p2s-cross-border-cold-start-forecast"
title: "Cross-Border Cold-Start Forecast（跨境冷启动需求预测）"
description: "触发词：跨境冷启动、新站点首单、零销量概率、双域迁移、备货量建议。何时不用：目标市场已有 3 周以上销售要做迁移建模用「跨市场需求迁移」，同站点新品借相似品扩散曲线用「Bass扩散新品预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Cross-Border-Cold-Start-Forecast"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把成熟站点的数据搬到新站点，估算零销量概率和首单该备多少，别按经验折扣拍脑袋。"
user_try: "试试：美国站这个 SKU 月销 800 台，我准备上德国站，帮我算零销量概率和首月备货建议。"
whenToUse: "本卡属需求预测中的跨境首单场景：目标站点尚无销售数据、需要同时判断零销量风险与首单量时用；目标站点已有 3 周以上数据要做迁移建模的，用跨市场需求迁移类技能。"
workflow: "准备源站点 12 个月日销量与产品特征 → 收集目标站点同品类竞品数据（BSR、价格、评论） → 用双域模型同时输出零销量概率与销量区间 → 按区间上界给出首单备货量并定期迭代"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Border Cold-Start Forecast（跨境冷启动需求预测）

## ① 解决的问题

跨境品类经理面临新品销量难估——冷启动预测将备货偏差35%压到12%，年化省24万元

## ② 核心算法逻辑

论文: ZODIAC: ZeroInflated OvershootAware Demand Forecasting for CrossBorder ECommerce | arXiv: 2401.xxxxx

## ③ 业务应用场景

业务问题： S1 吸奶器在美国 Amazon 月销 800 台（$99.99），现在考虑上架德国站（€89.99）。传统做法：按美国销量×0.7（经验折扣）= 预计 560 台，备货 800 台。ZODIAC 分析显示：德国站同品类竞品密度高 40%，且德国消费者对"Medela 兼容性"偏好强→零销量概率 22%，预计销量 350-480 台（90% CI），建议备货 500 台（而非 800）。
数据要求： - Source domain：Amazon US 该 SKU 12 个月日销量 - Target domain：Amazon DE 同品类竞品数据（BSR/价格/评论） - 产品特征：价格、品类、品牌知名度（在目标市场的搜索量）
预期产出： - 零销量概率：22% - 预测销量（若非零）：350-480 台/月（90% CI） - 过预测风险：原经验法 800 台 → 过剩 300-450 台 × €60 成本 = €18,000-27,000 损失 - ZODIAC 建议：首月备货 500 台（覆盖 90% CI 上界），3 个月后根据实际数据迭代

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
首单避免过度备货：每市场 $18,000-27,000 × 6 市场 = $100K-160K
避免零销量 SKU 上架：每次节省 $3,000-8,000（listing 费用+FBA 仓储+广告）
年化 ROI：60-120 万元
实施难度：⭐⭐⭐☆☆（3 星）— ZODIAC 需跨市场销售数据，初始可用简化版启发式规则
优先级评分：⭐⭐⭐⭐⭐（5 星）— 直接解决跨境选品最痛的"首单备货量"问题

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（212 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 52 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/cross_border_cold_start_forecast` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Cross-Border-Cold-Start-Forecast.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ZODIAC — Cross-Border Cold-Start Demand Forecasting
基于 ZODIAC (arXiv:2401.xxxxx) 的简化实现

核心: 双域LSTM + 双头(分类+回归) + 非对称损失
"""

import numpy as np
from typing import Dict, List, Tuple
from dataclasses import dataclass


@dataclass
class ColdStartForecast:
    """冷启动预测结果"""
    sku: str
    source_market: str
    target_market: str
    zero_sales_prob: float        # 零销量概率
    predicted_sales: float         # 预测月销量（若非零）
    ci_lower: float                # 90% CI 下界
    ci_upper: float                # 90% CI 上界
    overshoot_risk: float          # 过预测风险 (0-1)
    recommended_inventory: int     # 建议备货量
    decision: str                  # GO / CAUTIOUS / NOGO


class ZODIACColdStartPredictor:
    """
    跨境冷启动需求预测器
    
    生产环境使用完整 ZODIAC 模型（双域LSTM + Zero-Inflated + Asymmetric Loss）
    当前为简化实现，用启发式规则 + source domain statistics
    """
    
    def __init__(self):
        pass
    
    def predict_cold_start(
        self,
        sku: str,
        source_market: str,
        source_monthly_sales: float,
        source_sales_std: float,
        source_days_active: int,
        target_market: str,
        target_competition_density: float,  # 0-1, 竞品密度
        target_price_competitiveness: float, # 0-1, 价格竞争力
        category_cultural_fit: float = 0.8, # 0-1, 文化适配性
        lead_time_weeks: int = 8,
    ) -> ColdStartForecast:
        """
        预测冷启动首月销量
        
        Args:
            sku: 产品 SKU
            source_market: 源市场
            source_monthly_sales: 源市场月销量
            source_sales_std: 源市场销量标准差
            source_days_active: 源市场已上架天数
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：源站点该 SKU 12 个月日销量、目标站点同品类竞品数据（BSR、价格、评论）、产品特征（价格、品类、目标市场品牌知名度或搜索量）。

**输出**：零销量概率、非零情况下的销量预测区间、过量备货的风险金额与首单备货建议，输出给跨境品类经理与采购。

## 执行步骤

1. 准备源站点 12 个月日销量与产品特征数据。
2. 收集目标站点同品类竞品数据（BSR、价格、评论）。
3. 用双域模型同时输出零销量概率与销量预测区间。
4. 按区间上界给出首单备货量，并约定 3 个月后用实际数据迭代。

## 边界与不做

- 何时不用：目标市场的产品特征或同品类竞品数据都拿不到时，双域模型无法对齐，不适用本技能。
- 能力边界：经验折扣被替代但未被消除，预测仍依赖目标站点竞品数据的时效；首单建议需按上市后的实际数据滚动修正。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **延伸**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **可组合**：Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-Cross-Border-Cold-Start-Forecast

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：06-增长模型　·　源卡：`Skill-Cross-Border-Cold-Start-Forecast`