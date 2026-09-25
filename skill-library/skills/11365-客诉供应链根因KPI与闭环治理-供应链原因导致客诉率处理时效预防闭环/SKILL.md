---
name: "p2s-customer-complaint-supply-root-cause-kpi"
title: "客诉供应链根因KPI与闭环治理 — 供应链原因导致客诉率/处理时效/预防闭环"
description: "触发词：客诉根因、供应链客诉率、8D闭环、时间切点分析、重复客诉。何时不用：提取评论里的安全隐患信号用「安全隐患信号提取」；召回风险预测用「投诉召回风险预测」。安全边界：客户信息须脱敏，根因结论与整改动作须经质量与供应链共同确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-053"
l3_business: "质量分析"
l3_all: "质量分析 / 纠正预防措施"
l1_l2_l3: "业务运营/供应与履约/质量分析"
p2s_card_id: "Skill-Customer-Complaint-Supply-Root-Cause-KPI"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "客诉别只退款了事，找出到底哪一环出问题，形成闭环避免反复救火。"
user_try: "试试：这个月破损客诉突增，按时间切点和关联因素找出供应链根因并给出整改建议。"
whenToUse: "客诉反复出现、需要区分供应链与非供应链原因并推动闭环整改时用；单条评论的安全分级用「安全隐患信号提取」。"
workflow: "把客诉按供应链与非供应链原因分类 → 计算供应链客诉率与处理时效 → 用时间切点与关联因素定位根因 → 输出 8D 闭环状态与预防措施"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 客诉供应链根因KPI与闭环治理 — 供应链原因导致客诉率/处理时效/预防闭环

## ① 解决的问题

客服团队面临"客诉只处理不预防反复救火"——42%客诉来自供应链+8D闭环追踪，SC客诉率降至5‰以下年化节省15万元处理成本

## ② 核心算法逻辑

陈凤霞书中特别强调：大多数电商客诉最终根因在供应链，但客服和供应链两个团队通常割裂，导致问题反复出现。本Skill建立"客诉→供应链根因"的归因闭环。

## ③ 业务应用场景

场景A：吸奶器"破损到货"客诉根因分析 - 业务问题：某月吸奶器"到货破损"客诉突增（从0.8‰升至3.2‰），但客服团队只是退款，没有找供应链根因 - 数据要求：破损客诉记录 + 发货仓 + 物流商 + 包材批次 + 日期 - 预期产出： - 时间切点分析：10月5日后破损率突增 - 关联因素：10月4日切换到新包材供应商（成本降低5%） - 根因：新包材泡棉厚度不足（3mm→2mm），抗震性降低 - 行动：立即切回原包材，损失1万包材费 vs 减少破损客诉损失约15万元 - 业务价值：找到根因后当月破损率降至0.6‰，供应链改善产生10倍以上ROI
场景B：年度客诉供应链占比分析（管理层汇报） - 业务问题：客服团队月均处理客诉500件，但管理层不知道有多少是供应链问题、可以系统性解决 - 数据要求：全年客诉记录 + 分类标签 - 预期产出： - 供应链原因客诉占总客诉42%（约210件/月） - 其中发货错误31%、质量问题28%、延迟发货25%、包装破损16% - 全部可通过供应链改善系统性解决（年化节省客服成本约6万元）
**三轨验证** | 成本轨：建立客诉根因分析系统，初期投入3.2万元（数据平台2万+人工配置1.2万），月均运维成本1800元，人工投入12小时/月，年化成本24.6万元；通过缺货率从12%降至3%，年均增收45万元，ROI达83% | 合规轨：符合《电商法》第17条消费者权益保护要求，满足FBA备货合规标准，符合GB 10765婴幼儿配方乳粉安全标准的供应链追溯要求，具有完整的客诉处理记录可审计性 | 风险轨：数据准确性风险（概率15%）-根因判断偏差导致备货策略失效；系统依赖风险（概率8%）-平台API变更影响数据采集；人员流失风险（概率12%）-分析人员离职导致知识断层；季节性预测风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：供应链客诉系统化闭环后，客诉数量减少50%，年化节省处理成本约10-15万元；更重要的是Amazon ODR指标改善，保护账号健康和Buy Box排名
实施难度：⭐⭐⭐☆☆（需要客服和供应链两个团队的数据打通，跨部门协作是主要挑战）
优先级评分：⭐⭐⭐⭐⭐（陈凤霞："客诉是供应链问题的信号灯，不管客诉只处理不分析=每次都在救火而非预防"）
评估依据：42%的客诉来自供应链（书中数据），全部可系统性解决；Amazon的ODR指标将供应链问题直接与账号健康挂钩

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（231 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/customer_complaint_supply_root_cause_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Customer-Complaint-Supply-Root-Cause-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
客诉供应链根因 KPI 与闭环治理
功能：客诉归因分类 / SC客诉率 / 根因分析 / 闭环追踪 / 重复率监控
输入：客诉记录（含分类标签）
输出：客诉KPI报告 + 根因分析 + 8D闭环状态 + 预防建议
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def generate_complaint_data(n=500, seed=42):
    """生成客诉记录数据"""
    np.random.seed(seed)
    base_date = datetime(2025, 1, 1)
    
    # 客诉原因分类（供应链 vs 非供应链）
    sc_reasons = {
        '到货破损': 0.16,
        '发货错误(错SKU/数量)': 0.14,
        '发货延迟': 0.12,
        '质量问题': 0.12,
        '缺货取消': 0.08,
    }
    non_sc_reasons = {
        '价格问题': 0.12,
        '产品使用疑问': 0.10,
        '退款申请': 0.08,
        '其他': 0.08,
    }
    
    all_reasons = {**sc_reasons, **non_sc_reasons}
    reason_list = list(all_reasons.keys())
    reason_probs = list(all_reasons.values())
    
    sc_reason_set = set(sc_reasons.keys())
    
    records = []
    for i in range(n):
        order_date = base_date + timedelta(days=np.random.randint(0, 365))
        reason = np.random.choice(reason_list, p=reason_probs)
        is_sc = reason in sc_reason_set
        
        # 处理时效（小时）
        if reason in ['发货错误(错SKU/数量)', '到货破损']:
            resolution_hours = np.random.gamma(2, 6)  # 均值12小时
        elif reason == '质量问题':
            resolution_hours = np.random.gamma(3, 10)  # 均值30小时
        else:
            resolution_hours = np.random.gamma(2, 3)  # 均值6小时
        
        # 是否有根因分析（闭环）
        has_rca = is_sc and np.random.random() < 0.75  # 75%有根因分析
        # 是否重复（同类问题再次出现）
        is_repeat = np.random.random() < 0.08  # 8%重复率（偏高）
        
        records.append({
            'complaint_id': f'CPL-{i+1:05d}',
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.02847，但该号在 arXiv 上是《On the Length of Strongly Monotone Descending Chains over $\mathbb{N}^d$》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：客诉记录（含原因分类标签、时间，以及发货仓、物流商、包材批次等关联字段），按条组织并保留处理时效字段。

**输出**：客诉 KPI 报告（供应链客诉率、处理时效、重复率）、根因分析结论与 8D 闭环状态、预防建议，供客服与供应链联席会议使用。

## 执行步骤

1. 按供应链与非供应链原因给客诉分类
2. 计算供应链客诉率、处理时效与重复率
3. 用时间切点与关联因素定位根因
4. 跟踪 8D 闭环状态与整改动作
5. 输出预防建议与管理层汇报口径

## 边界与不做

- 数据不满足时不适用：客诉记录缺少原因分类与关联字段（发货仓、物流商、批次）时，根因无法定位。
- 能力边界：只产出归因、KPI 与闭环状态，整改执行、供应商索赔与对外沟通由人工负责。

## 技能关联

- **前置**：Skill-B2C-Delivery-Timeliness-Experience-KPI.html、Skill-B2C-Delivery-Timeliness-Experience-KPI、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI、Skill-Warehouse-Outbound-Fulfillment-SLA.html、Skill-Warehouse-Outbound-Fulfillment-SLA
- **延伸**：Skill-B2C-Delivery-Timeliness-Experience-KPI.html、Skill-B2C-Delivery-Timeliness-Experience-KPI、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI、Skill-Customer-Complaint-Supply-Root-Cause-KPI

---

> 分类：业务运营/供应与履约/质量分析　·　技术族：04-供应链　·　源卡：`Skill-Customer-Complaint-Supply-Root-Cause-KPI`