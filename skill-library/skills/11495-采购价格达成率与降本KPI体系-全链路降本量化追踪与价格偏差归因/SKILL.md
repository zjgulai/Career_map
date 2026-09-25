---
name: "p2s-procurement-cost-kpi-price-achievement"
title: "采购价格达成率与降本KPI体系 — 全链路降本量化追踪与价格偏差归因"
description: "触发词：采购价格达成率、PAR、价格偏差归因、急采溢价、降本KPI。何时不用：算 BOM 层级成本传导用「BOM成本卷积」，算 MOQ 与账期现金流用「MOQ与账期联动优化」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-044"
l3_business: "采购比价"
l3_all: "采购比价 / 经济性分析"
l1_l2_l3: "业务运营/供应与履约/采购比价"
p2s_card_id: "Skill-Procurement-Cost-KPI-Price-Achievement"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "盯住实际采购价和预算价的差距，把超支归因到急采、行情还是议价不力，再定降本目标。"
user_try: "试试：用我的年度计划价和实际采购订单，算月度 PAR 趋势并分解超支原因，给出降本抓手。"
whenToUse: "本卡属采购比价中的结果度量侧：需要量化采购价格偏差、给降本归因并向管理层汇报时用；成本结构如何沿 BOM 传导用 BOM 成本卷积类技能，MOQ 与账期怎么选用联动优化类技能。"
workflow: "建立 SKU 级基准价格库并对齐实际采购订单 → 逐月计算 PAR 并对比目标值 → 按急采、行情、议价等维度做偏差归因 → 输出去向明确的降本抓手与 KPI 看板"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 采购价格达成率与降本KPI体系 — 全链路降本量化追踪与价格偏差归因

## ① 解决的问题

采购团队面临"价格超支无法追因"——PAR达成率+四象限归因将急采溢价识别并归零，年化降本20-35万元

## ② 核心算法逻辑

采购成本KPI 是供应链降本的可量化抓手。陈凤霞体系将采购成本分解为三层：

## ③ 业务应用场景

场景A：A2奶粉全年采购价格达成率追踪 - 业务问题：A2奶粉原材料价格波动，全年多次采购，事后发现有3批次价格超出年初预算8-15%，但没有系统量化 - 数据要求：年度采购计划价格表（SKU级）+ 实际采购订单（价格/数量/日期/供应商） - 预期产出： - 月度PAR趋势（目标≤102%，实际月均105%） - 超价原因分解：急采溢价占68%、市场涨价占22%、议价不足占10% - 年化超支金额：约24万元 - 业务价值：聚焦"急采溢价"根因（断货预警滞后）→ 优化安全库存后急采频次从12次降至3次 → 年化节省约16万元
场景B：吸奶器OEM供应商年度降本谈判效果评估 - 业务问题：每年Q4与供应商谈判价格，但缺乏数据支撑谈判筹码 - 数据要求：历史3年采购价格 + 同期原材料指数（铜/硅胶/ABS塑料价格） - 预期产出：可归因于原材料成本的价格变动占比（40%）vs 供应商利润扩张（60%） → 形成谈判"降价空间"量化论据 - 业务价值：数据驱动谈判，年度降本目标达成率从55%提升至82%，节省采购成本约35万元
**三轨验证** | 成本轨：FBA备货成本月均12,000元（仓储费8,000元/月+物流费3,500元/月+系统管理200元/月），人工投入15小时/月（采购预测8h+库存管理7h），缺货率从12%降至3%，年化库存成本增加45万元，但因缺货率改善带来销售额增长约120万元，ROI达2.67倍 | 合规轨：符合亚马逊FBA物流规范（商品需通过质检、标签合规），符合《进出口食品安全管理办法》（婴儿奶粉需备案登记），符合跨境电商备案要求（需提供营养成分检测报告），合规结论：全部满足 | 风险轨：①汇率波动风险（概率35%）导致采购成本增加5-8%；②FBA仓储爆仓风险（概率20%）因销售预测偏

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：年采购额1000万的品牌，通过价格管理精细化降本2-3%即可节省20-30万元；减少急采溢价是最快见效路径（通常占超支的40-60%）
实施难度：⭐⭐☆☆☆（数据来自采购ERP，主要工作是建立基准价格库）
优先级评分：⭐⭐⭐⭐⭐（采购成本直接影响P&L，是CEO最关注的供应链KPI）
评估依据：陈凤霞书中强调"采购价格达成率是供应链团队向管理层汇报的第一指标"，与GMV增长同等重要

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（200 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/procurement_cost_kpi_price_achievement` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Procurement-Cost-KPI-Price-Achievement.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
采购价格达成率与降本 KPI 体系
功能：PAR计算 / 价格偏差归因 / 降本统计 / 采购成本看板
输入：采购订单数据（含计划价、实际价、采购量、原因标签）
输出：采购成本KPI报告
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def generate_procurement_data(n=300, seed=42):
    """生成模拟采购数据"""
    np.random.seed(seed)
    
    skus = {
        'SKU-A2奶粉900g': {'base_price': 85.0, 'annual_volume': 5000},
        'SKU-吸奶器旗舰': {'base_price': 180.0, 'annual_volume': 2000},
        'SKU-婴儿湿巾': {'base_price': 12.0, 'annual_volume': 20000},
        'SKU-辅食机': {'base_price': 95.0, 'annual_volume': 1500},
    }
    
    # 偏差原因分布
    deviation_reasons = {
        '急采溢价': 0.35,       # 因断货/促销急采导致溢价
        '市场原材料涨价': 0.20,  # 不可控
        '供应商提价': 0.15,     # 可谈判
        '批量不足折扣未达': 0.10, # 可优化
        '正常波动范围': 0.20,   # ±2%以内
    }
    
    records = []
    base_date = datetime(2025, 1, 1)
    sku_list = list(skus.keys())
    
    for i in range(n):
        sku = np.random.choice(sku_list)
        base_price = skus[sku]['base_price']
        reason = np.random.choice(list(deviation_reasons.keys()),
                                  p=list(deviation_reasons.values()))
        
        # 根据原因生成价格偏差
        price_delta_pct = {
            '急采溢价': np.random.uniform(0.05, 0.18),
            '市场原材料涨价': np.random.uniform(-0.03, 0.08),
            '供应商提价': np.random.uniform(0.02, 0.10),
            '批量不足折扣未达': np.random.uniform(0.01, 0.05),
            '正常波动范围': np.random.uniform(-0.02, 0.02),
        }[reason]
        
        actual_price = base_price * (1 + price_delta_pct)
        qty = np.random.randint(100, 1000)
        order_date = base_date + timedelta(days=np.random.randint(0, 365))
        
        records.append({
            'po_id': f'PO-{i+1:04d}',
            'sku': sku,
            'order_date': order_date,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.09654，但该号在 arXiv 上是《The cost of artificial latency in the PBS context》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：年度采购计划价格表（SKU 级）、实际采购订单（价格、数量、日期、供应商）、原因标签、历史采购价格与同期原材料价格指数；SKU×订单×月度粒度。

**输出**：月度 PAR 达成率趋势、价格偏差归因分解、年化超支金额与降本统计、采购成本 KPI 报告，输出给采购团队与管理层汇报。

## 执行步骤

1. 建立 SKU 级基准价格库，对齐实际采购订单。
2. 逐月计算采购价格达成率并对比目标值。
3. 对超价批次做归因分解（急采溢价、市场涨价、议价不足）。
4. 定位可改善根因并测算年化降本空间。
5. 输出采购成本 KPI 看板供管理层复盘。

## 边界与不做

- 何时不用：没有年度计划价或原因标签时无法归因；只算单个 BOM 物料成本传导的，用其他技能。
- 能力边界：归因基于原因标签与价格数据，标签缺失时只能粗略切分；结论用于内部管理，不直接作为对供应商的价格证据。

## 技能关联

- **前置**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model
- **延伸**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model
- **可组合**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Procurement-Cost-KPI-Price-Achievement

---

> 分类：业务运营/供应与履约/采购比价　·　技术族：04-供应链　·　源卡：`Skill-Procurement-Cost-KPI-Price-Achievement`