---
name: "p2s-long-tail-sku-clearance-optimization"
title: "长尾SKU管理与滞销清仓优化 — 缺货率与长尾品双向治理算法"
description: "触发词：长尾SKU、动销率、滞销清仓、降价阶梯、缺货预警、资金释放。何时不用：只做库龄触发的自动降价用「降价清仓触发」；临期与过季品的定价路径用「临期过季降价优化」。安全边界：清仓降价不得低于成本与平台规则底线，处置库存前须核验真实质量状态。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
p2s_card_id: "Skill-Long-Tail-SKU-Clearance-Optimization"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "挑出真正卖不动的长尾货用阶梯降价清掉，同时盯住爆款别断货。"
user_try: "试试：按 90 天日销和库存算出长尾评分，给强制清仓的 SKU 排一个 6 周降价方案。"
whenToUse: "SKU 数量多、长尾积压占用仓位与资金、同时爆款缺货预警缺位时用；单一 SKU 的清仓定价用「临期过季降价优化」。"
workflow: "按销量分位、DOI、动销率与评分趋势算长尾评分 → 筛出强制清仓与观察两类清单 → 对强制清仓品求解分周降价阶梯 → 对 A 类 SKU 做 DOI 缺货告警与空运预填"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 长尾SKU管理与滞销清仓优化 — 缺货率与长尾品双向治理算法

## ① 解决的问题

50%SKU只贡献5%营收却占用45%仓位和$15万资金——多维长尾评分+动态规划Markdown清仓将动销率从43%提升至72%，年化释放资金$36万

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中明确区分两个相互矛盾的KPI——缺货率（高价值SKU缺货损失营收）和长尾品问题（低价值SKU积压占用资源）。电商供应链的"生意质量"要求同时解决这两个矛盾：一方面保证A类商品不断货，另一方面清除拖累效率的长尾积压品。

## ③ 业务应用场景

- 业务问题：某卖家80个在架SKU中，35个SKU月销不足10件（长尾品），占用仓位和采购资金，但团队每天忙于运营爆款无暇顾及，季度末积压$15万 - 数据要求：所有SKU近90天日销量、当前库存、采购成本、平台评分历史 - 算法应用： 1. 运行长尾品评分：35个SKU中20个综合评分<0.3（长尾），8个<0.15（强制清仓） 2. 对8个强制清仓品运行Markdown优化：计算6周清仓方案 3. 第1-2周：折扣15%（测试价格弹性）；第3-4周：折扣25%；第5-6周：折扣40% 4. 预测：6周内清完积压$8万的库存，回收现金$4.5万（vs 继续持有收回$3万） - 预期产出：清
- 业务问题：运营团队没有实时缺货预警，吸奶器爆款DOI降至3天时才发现，来不及空运补货，断货5天损失$2.5万销售额 - 算法应用：实时缺货率监控系统，A类SKU DOI<7天自动触发告警+预填空运补货申请；每日8:00推送"缺货预警面板" - 预期产出：断货次数从年均6次降至1次，年防损$12.5万
三轨验证 | 成本轨：AI预测模型部署月均3200元（云服务2000元+数据标注1200元），人工审核8小时/月，ROI周期4个月（年化45万收益÷(3200×12)=1.17倍）| 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策，需建立缺货预警机制满足FDA追溯要求，依据：母婴产品属特殊商品需质检证明 | 风险轨：模型偏差导致过度备货风险（概率15%，影响：资金占用增加8-12万）、供应链延迟风险（概率20%，影响：缺货率反弹至8%）、汇率波动风险（概率25%，影响：成本增加3-5%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：80个SKU的卖家，季度长尾积压$15万；系统化清仓每季度回收$9万（60%），年化释放$36万冻结资金；资金成本按20%计节省$7.2万/年；IPI改善防止FBA仓容限制损失$3-5万；系统成本$2万，ROI≈500%
实施难度：⭐⭐☆☆☆（算法简单，90%的工作是数据整理和建立自动化监控触发机制）
优先级：⭐⭐⭐⭐⭐（几乎所有卖家都有长尾积压问题，是供应链"生意质量"最核心的管理抓手）
适用规模：SKU数>30个、月销>$10万的卖家
数据依赖：90天SKU日销量、当前库存、采购成本、平台评分历史

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（288 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/long_tail_sku_clearance_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Long-Tail-SKU-Clearance-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
长尾SKU管理与滞销清仓优化系统
功能：长尾品识别评分 + Markdown最优清仓 + 缺货率KPI监控
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUPerformance:
    """SKU绩效数据"""
    sku_id: str
    abc_class: str
    current_stock: int
    unit_cost: float
    current_price: float
    daily_sales_90d: List[float]    # 近90天每日销量
    star_rating_30d: float          # 近30天评分
    star_rating_90d: float          # 近90天评分
    
    @property
    def avg_daily_sales(self) -> float:
        return np.mean(self.daily_sales_90d) if self.daily_sales_90d else 0
    
    @property
    def active_days_pct(self) -> float:
        """动销天数比例"""
        active = sum(1 for s in self.daily_sales_90d if s > 0)
        return active / max(len(self.daily_sales_90d), 1)
    
    @property
    def current_doi(self) -> float:
        if self.avg_daily_sales <= 0:
            return 999
        return self.current_stock / self.avg_daily_sales
    
    @property
    def inventory_value(self) -> float:
        return self.current_stock * self.unit_cost


def compute_long_tail_score(sku: SKUPerformance, 
                             portfolio_avg_daily_sales: float) -> Dict:
    """计算长尾品综合评分（0=最差，1=最好）"""
    
    # 1. 销量分位得分（相对于品类均值）
    sales_percentile = min(sku.avg_daily_sales / max(portfolio_avg_daily_sales, 0.1), 2.0) / 2.0
    
    # 2. DOI得分（越高越差）
    doi_score = max(0, 1 - (sku.current_doi - 30) / 200)  # DOI>30开始扣分
    
    # 3. 动销率得分
    active_score = sku.active_days_pct
    
    # 4. 评分趋势得分
    rating_trend = sku.star_rating_30d - sku.star_rating_90d
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.14517，但该号在 arXiv 上是《The elliptical invariant tori of nearly integrable Hamiltonian system through symplectic algorithms》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：90 天各 SKU 日销量序列、当前库存、采购成本与现价、近 30 天与 90 天评分，按 SKU 组织。

**输出**：长尾评分与清仓分级清单、分周降价阶梯与预计回收现金、A 类 SKU 缺货告警与补货预填项，供清仓与运营执行。

## 执行步骤

1. 按日销分位、DOI、动销率与评分趋势算长尾评分
2. 分出强制清仓与观察两类 SKU
3. 对强制清仓品求解分周降价阶梯
4. 监控 A 类 SKU 的 DOI 并触发缺货告警
5. 输出降价路径与回收现金预测

## 边界与不做

- 数据不满足时不适用：没有 90 天日销量或采购成本时，长尾评分与回收测算都不可靠。
- 能力边界：只产出分级与降价建议，改价、促销报名与清仓处置由人工执行。

## 技能关联

- **前置**：Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **延伸**：Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **可组合**：Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Long-Tail-SKU-Clearance-Optimization

---

> 分类：业务运营/供应与履约/调拨清货建议　·　技术族：04-供应链　·　源卡：`Skill-Long-Tail-SKU-Clearance-Optimization`