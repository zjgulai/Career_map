---
name: "p2s-order-cycle-time-otd-analytics"
title: "订单交付周期OTD全链路分解 — On-Time Delivery率/交付阶段拆解/延迟根因归因"
description: "触发词：OTD、交付周期、阶段拆解、延迟根因、完美订单率。何时不用：需要监控 ODR 与发货及时率、做履约漏斗拆解时用订单履约率与发货及时率；需要动态调整平台承诺时效时用 B2C配送时效与体验KPI。安全边界：仅可分析自身订单数据，不得使用第三方工具抓取竞品交付数据；欧洲订单须脱敏存储以符合数据保护要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-046"
l3_business: "履约跟踪"
l3_all: "履约跟踪 / 履约异常"
l1_l2_l3: "业务运营/供应与履约/履约跟踪"
p2s_card_id: "Skill-Order-Cycle-Time-OTD-Analytics"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把交付周期拆成阶段找出瓶颈，定位延迟主要来自哪个环节，再把 OTD 拉回达标线。"
user_try: "试试：这批 Prime 订单 OTD 只有 91%，帮我按阶段拆解找出瓶颈和延迟原因 TOP3。"
whenToUse: "OTD 未达标、需要按阶段拆解定位瓶颈与延迟根因时用本技能；ODR 与发货及时率的漏斗监控用订单履约率与发货及时率。"
workflow: "接入订单各阶段时间戳数据 → 按阶段计算耗时并与目标对比 → 输出瓶颈环节与延迟根因排序 → 给出改善路径与改善后 OTD 预测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 订单交付周期OTD全链路分解 — On-Time Delivery率/交付阶段拆解/延迟根因归因

## ① 解决的问题

客服面临"OTD低但不知哪个环节是瓶颈"——五阶段拆解精准定位到拣货包装占延误原因62%，OTD从91%提升至97%维持Prime资格

## ② 核心算法逻辑

OTD（OnTime Delivery） 是客户体验的直接量化指标。陈凤霞体系的核心洞察：OTD拆解才有价值，总体OTD=95%无法指导改善，必须知道哪个阶段失职。

## ③ 业务应用场景

场景A：美国市场2-day Prime OTD分析 - 业务问题：Momcozy Amazon Prime订单OTD达成率91%（低于97%标准），Prime badge面临取消风险 - 数据要求：Amazon订单数据（下单时间/承诺交付日/实际签收日）+ 各阶段时间戳 - 预期产出： - 阶段分析：拣货打包平均1.8天（目标0.5天）是最大瓶颈 - 延迟原因TOP3：仓库高峰期超负荷（52%）、物流商末端延误（28%）、地址问题（20%） - 改善后OTD预测：从91%提升至96.5% - 业务价值：维持Prime资格 = 保留约30%溢价定价权，年化收益约25万元
三轨验证： - 成本：需接入Amazon SP-API获取订单时间戳（约$0.01/次调用），每月API成本约$50-100；人力投入1名数据分析师2周搭建看板，人力成本约1.5万元 - 合规：Amazon政策允许卖家分析自身订单数据，但不可使用第三方工具抓取竞品OTD数据（违反Amazon数据使用条款）；GDPR下需确保欧洲订单数据脱敏存储 - 风险：若改善后OTD仍不达标（如仅提升至95%），可能加速Prime badge取消；过度关注OTD可能导致仓库为赶时效牺牲拣货准确率，引发退货率上升
场景B：跨境B2C多国OTD差异分析（美/德/英对比） - 业务问题：同款产品在三个国家市场OTD差异大（美国92% vs 德国78% vs 英国88%），需分国分析根因 - 数据要求：各国订单交付记录 + 物流商表现数据 - 预期产出：德国OTD低的根因 = 末程承运商（Hermes）在德国农村地区延误率高达38% - 业务价值：针对德国更换末程承运商（DHL替代Hermes），OTD从78%提升至89%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：OTD从91%提升至97%（维持Amazon Prime资格）→ 保留30%溢价定价权，年化收益约20-30万元；同时减少客户差评和退款
实施难度：⭐⭐☆☆☆（数据主要来自物流系统时间戳，主要工作是建立阶段拆解分析）
优先级评分：⭐⭐⭐⭐⭐（Amazon Prime/FBA OTD是账号健康核心指标，陈凤霞书"面向客户的第一指标"）
评估依据：Amazon研究显示，OTD每提升1%，转化率提升约0.8%，因为客户优先选择"可靠交付"的卖家

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（204 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/order_cycle_time_otd_analytics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Order-Cycle-Time-OTD-Analytics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
订单交付周期 OTD 全链路分解分析
功能：OTD率计算 / 各阶段拆解 / 延迟根因归因 / 完美订单率 / 多国对比
输入：订单交付记录（含各阶段时间戳）
输出：OTD KPI报告 + 瓶颈识别 + 改善路径
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def generate_delivery_data(n=500, seed=42):
    """生成模拟订单交付数据（含各阶段时间戳）"""
    np.random.seed(seed)
    
    countries = {
        'US': {'committed_days': 2, 't4_mean': 1.5, 't5_mean': 0.8, 'delay_prob': 0.09},
        'DE': {'committed_days': 5, 't4_mean': 3.5, 't5_mean': 1.5, 'delay_prob': 0.22},
        'GB': {'committed_days': 4, 't4_mean': 2.8, 't5_mean': 1.2, 'delay_prob': 0.12},
    }
    
    delay_reasons = ['仓库超负荷', '物流商延误', '地址问题', '天气/节假日', '清关延误', '其他']
    
    records = []
    base_date = datetime(2025, 1, 1)
    
    for i in range(n):
        country = np.random.choice(list(countries.keys()), p=[0.55, 0.25, 0.20])
        c = countries[country]
        
        order_date = base_date + timedelta(days=np.random.randint(0, 365))
        is_promo = order_date.month in [11, 12]
        
        # 各阶段耗时（天）
        t1 = np.random.uniform(0.1, 0.5)          # 下单确认
        t2_base = np.random.gamma(1, 0.7)          # 拣货包装
        t2 = t2_base * (2.0 if is_promo else 1.0)  # 旺季更慢
        t3 = np.random.uniform(0.1, 0.5)            # 交运给物流
        t4 = np.random.gamma(c['t4_mean'], 0.5)    # 干线运输
        t5 = np.random.gamma(c['t5_mean'], 0.3)    # 末端配送
        
        total_days = t1 + t2 + t3 + t4 + t5
        committed = c['committed_days']
        on_time = total_days <= committed
        
        # 延迟原因（只有延迟的才有）
        delay_prob_adj = c['delay_prob'] * (1.5 if is_promo else 1.0)
        if not on_time:
            # 根据哪个阶段最长判断主要原因
            stages = [t1, t2, t3, t4, t5]
            bottleneck = stages.index(max(stages))
            delay_reason = ['仓库超负荷', '仓库超负荷', '物流商延误', '物流商延误', '地址问题'][bottleneck]
            if country == 'DE' and t4 > c['t4_mean'] * 1.5:
                delay_reason = '清关延误'
        else:
            delay_reason = '无延迟'
        
        # 完美订单标志（OTD + 无损坏 + 无错发）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.11478，但该号在 arXiv 上是《On unconditionality of fractional Rademacher chaos in symmetric spaces》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：平台订单数据（下单时间、承诺交付日、实际签收日）与各阶段时间戳；多国场景还需各国订单交付记录与物流商表现数据。

**输出**：OTD 率与阶段拆解结果、瓶颈识别与延迟根因排序、完美订单率与改善路径，供运营与仓配团队使用。

## 执行步骤

1. 接入订单各阶段时间戳数据
2. 按阶段计算耗时并与目标对比
3. 输出瓶颈环节与延迟根因排序
4. 给出改善路径与改善后 OTD 预测

## 边界与不做

- 何时不用：需要监控 ODR、发货及时率等账户健康指标时用订单履约率与发货及时率；承诺时效的动态优化用 B2C配送时效与体验KPI。
- 能力边界：输出诊断与改善路径，仓内流程改造、承运商更换等动作需业务团队执行。
- 数据边界：依赖平台订单时间戳与物流商数据，自发货渠道需自建追踪，缺失阶段数据时无法拆解。

## 技能关联

- **前置**：Skill-B2C-Delivery-Timeliness-Experience-KPI.html、Skill-B2C-Delivery-Timeliness-Experience-KPI、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness.html、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Warehouse-Outbound-Fulfillment-SLA.html、Skill-Warehouse-Outbound-Fulfillment-SLA
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Warehouse-Outbound-Fulfillment-SLA.html、Skill-Warehouse-Outbound-Fulfillment-SLA
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Warehouse-Outbound-Fulfillment-SLA.html、Skill-Warehouse-Outbound-Fulfillment-SLA、Skill-Order-Cycle-Time-OTD-Analytics

---

> 分类：业务运营/供应与履约/履约跟踪　·　技术族：04-供应链　·　源卡：`Skill-Order-Cycle-Time-OTD-Analytics`