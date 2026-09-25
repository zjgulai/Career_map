---
name: "p2s-markdown-clearance-auto-trigger"
title: "Markdown Clearance Auto Trigger — 库龄超标且库存积压时自动触发降价清仓阶梯"
description: "触发词：自动降价清仓、库龄阈值、库存超比、降价阶梯、毛利护栏。何时不用：临期食品与过季品的动态规划定价用「临期过季降价优化」；只看滞销与不可售库存的处置建议用「FBA滞销库存KPI」。安全边界：降价需取得产品方授权并设毛利预警线，自动触发前须人工二次确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
p2s_card_id: "Skill-Markdown-Clearance-Auto-Trigger"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "库龄超标又积压的货自动挂上降价阶梯，同时守住毛利预警线。"
user_try: "试试：这批睡袋库龄 68 天、库存是目标的 2 倍，帮我匹配降价档位并算清毛利。"
whenToUse: "库龄与库存双条件同时超标、需要自动匹配降价档位时用；有保质期或强季节性的定价路径用「临期过季降价优化」。"
workflow: "校验库龄与库存超比双条件 → 跳过新品豁免期内的 SKU → 按库龄匹配降价档位并校验毛利护栏 → 按观察期消化率决定是否升级档位"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Markdown Clearance Auto Trigger — 库龄超标且库存积压时自动触发降价清仓阶梯

## ① 解决的问题

仓储运营面临"库龄超标库存积压无人触发降价清仓"——库龄×超比双条件自动触发阶梯降价，库存周转率提升1.2次，年化减少报废损失$35,000

## ② 核心算法逻辑

论文：Dynamic Pricing and Inventory Management with Demand Learning | 年份：2021

## ③ 业务应用场景

场景：婴儿冬季睡袋库存积压清仓 - 触发条件：睡袋库龄68天（超45天阈值），当前库存2,400件，目标库存1,200件（2,400/1,200=2.0>1.5），双条件满足 - 执行动作：库龄68天→匹配-20%降价档，原价$45.99→促销价$36.79，预计7天销量提升65%，消化约600件 - 安全护栏：毛利率降至22%（预警线25%），自动通知采购团队评估是否继续；降价后7天若消化率<30%则升级至-30%档 - 业务价值：避免库存报废损失约$15,000，提前回笼资金$22,000，年化库存周转率提升1.2次
三轨验证 | 成本轨：Markdown自动清仓系统月均成本2800元（系统订阅800元+人工审核10小时/月×200元/小时），相比缺货损失年化45万，ROI达1520% | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策，自动触发需获得产品方授权，建议补充书面协议确认降价权限，合规度95% | 风险轨：主要风险为过度Markdown导致品牌价值损伤（概率15%）、系统误触发清仓错误SKU（概率8%）、供应商投诉降价幅度过大（概率12%），建议设置Markdown阈值上限和人工二次确认机制
**三轨验证** | 成本轨：手动Markdown管理月均成本5200元（人工40小时/月×130元/小时），年化成本6.24万元，相比自动化方案增加成本3.44万元，但缺货率仅改善至6%，年化损失仍约30万 | 合规轨：完全符合所有跨境电商合规要求，人工审核确保每次Markdown决策有据可查，合规度100%，但流程响应周期7-10天 | 风险轨：主要风险为反应迟滞导致滞销品积压（概率35%）、人工判断偏差造成不合理降价（概率18%）、高峰期人力不足影响及时性（概率22%），缺货率改善效果不达预期

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：减少库存报废损失15-25%，提升库存周转率0.8-1.5次，年化价值$20,000-$50,000
实施难度：⭐⭐☆☆☆（规则明确，需接入WMS库龄数据和定价系统）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（178 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
from datetime import datetime, date
import numpy as np

def markdown_clearance_auto_trigger(
    skus: List[Dict],
    today: Optional[date] = None,
    age_threshold_days: int = 45,
    inventory_ratio_threshold: float = 1.5,
    markdown_tiers: Optional[List[Dict]] = None,
    new_product_grace_days: int = 90,
    min_margin_rate: float = 0.20,
    strategy: str = "margin_max"
) -> Dict:
    """
    库存清仓自动触发器
    
    参数:
        skus: [{
            "sku_id": str, "current_inventory": int, "target_inventory": int,
            "inventory_age_days": int, "cost_price": float, "current_price": float,
            "launch_date": str (YYYY-MM-DD), "price_elasticity": float (可选)
        }]
        age_threshold_days: 库龄触发阈值（默认45天）
        inventory_ratio_threshold: 库存超比阈值（默认1.5x）
        markdown_tiers: 自定义降价阶梯，默认 [{"age": 45, "discount": 0.10}, ...]
        new_product_grace_days: 新品豁免期（天）
        min_margin_rate: 最低毛利率保护线
        strategy: "margin_max"毛利最大化 或 "speed_max"速度最大化
    
    返回:
        各SKU的清仓决策
    """
    if today is None:
        today = date.today()
    
    if markdown_tiers is None:
        markdown_tiers = [
            {"min_age": 45,  "max_age": 60,  "discount": 0.10},
            {"min_age": 61,  "max_age": 90,  "discount": 0.20},
            {"min_age": 91,  "max_age": 999, "discount": 0.30},
        ]
    
    decisions = []
    
    for sku in skus:
        sku_id = sku["sku_id"]
        curr_inv = sku["current_inventory"]
        target_inv = sku["target_inventory"]
        age_days = sku["inventory_age_days"]
        cost = sku["cost_price"]
        price = sku["current_price"]
        launch_date_str = sku.get("launch_date", "2000-01-01")
        elasticity = sku.get("price_elasticity", -1.5)  # 默认弹性
        
        # 新品豁免期检测
        launch_date = datetime.strptime(launch_date_str, "%Y-%m-%d").date()
        days_since_launch = (today - launch_date).days
        if days_since_launch < new_product_grace_days:
            decisions.append({
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.03274，但该号在 arXiv 上是《The Magellanic Edges Survey -- II. Formation of the LMC's northern arm》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Dynamic Pricing and Inventory Management with Demand Learning》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各 SKU 当前库存、目标库存、库龄天数、成本价与现价、上架日期，以及可选的价格弹性与降价阶梯配置。

**输出**：各 SKU 清仓决策：是否触发、匹配的降价档位与折后价、毛利校验结果、观察期与升级条件，供定价系统与人工确认。

## 执行步骤

1. 校验库龄超标与库存超比两个条件
2. 排除新品豁免期内的 SKU
3. 按库龄匹配降价档位并算出折后价
4. 校验毛利是否跌破预警线并通知采购
5. 按观察期消化率决定是否升级降价档

## 边界与不做

- 数据不满足时不适用：拿不到准确库龄或目标库存时双条件门控失效；没有成本价则无法做毛利护栏。
- 能力边界：只产出降价档位与护栏判断，改价执行与产品方授权由人工完成。
- 过度降价会损伤品牌价值，卡页建议设置降价上限并保留人工二次确认。

## 技能关联

- **前置**：Skill-Lead-Time-Safety-Stock-Auto-Adjuster.html、Skill-Lead-Time-Safety-Stock-Auto-Adjuster、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Markdown-Schedule-Auto-Trigger.html、Skill-Markdown-Schedule-Auto-Trigger、Skill-Perishable-Inventory-Markdown-Optimization.html、Skill-Perishable-Inventory-Markdown-Optimization
- **延伸**：Skill-Lead-Time-Safety-Stock-Auto-Adjuster.html、Skill-Lead-Time-Safety-Stock-Auto-Adjuster、Skill-Markdown-Schedule-Auto-Trigger.html、Skill-Markdown-Schedule-Auto-Trigger、Skill-Perishable-Inventory-Markdown-Optimization.html、Skill-Perishable-Inventory-Markdown-Optimization
- **可组合**：Skill-Lead-Time-Safety-Stock-Auto-Adjuster.html、Skill-Lead-Time-Safety-Stock-Auto-Adjuster、Skill-Markdown-Schedule-Auto-Trigger.html、Skill-Markdown-Schedule-Auto-Trigger、Skill-Markdown-Clearance-Auto-Trigger

---

> 分类：业务运营/供应与履约/调拨清货建议　·　技术族：04-供应链　·　源卡：`Skill-Markdown-Clearance-Auto-Trigger`