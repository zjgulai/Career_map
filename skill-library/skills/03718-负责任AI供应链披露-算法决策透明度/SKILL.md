---
name: "p2s-responsible-ai-supply-chain-disclosure"
title: "Responsible AI Supply Chain Disclosure — 负责任AI供应链披露（算法决策透明度）"
description: "触发词：AI供应链披露、ESG报告、供应商公平性、集中度指标、算法透明度。何时不用：面向监管的算法问责报告时用「Algorithmic Accountability Audit」；EU AI Act 风险分级用「EU AI Act Compliance Framework」。安全边界：披露口径须法务确认适用范围；不得以商业保密为由隐瞒供应商集中度等实质风险，也不得披露可识别的商业敏感条款。"
l1_id: ""
l1_plane: "未归类（矩阵空白）"
l2_id: ""
l2_domain: "未归类（矩阵空白）"
l3_id: ""
l3_business: "（矩阵空白）"
l3_all: ""
l1_l2_l3: "未归类（矩阵空白）"
p2s_card_id: "Skill-Responsible-AI-Supply-Chain-Disclosure"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用一份可核对的报告说明 AI 补货、定价、选品对供应商公不公平，应对 ESG 与投资人问询。"
user_try: "试试：分析我们的补货决策日志，输出 AI 供应链影响报告和供应商集中度指标。"
whenToUse: "ESG 报告需要披露 AI 在供应链决策中的作用与公平性时用；监管向的算法问责报告用问责审计类技能；EU AI Act 合规用合规框架类技能。"
workflow: "收集补货日志与供应商分配数据 → 按规模分组计算订单占比 → 计算集中度并判定公平性风险 → 输出 ESG 披露报告与改进承诺"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Responsible AI Supply Chain Disclosure — 负责任AI供应链披露（算法决策透明度）

## ① 解决的问题

ESG团队面临"投资者要求AI供应链决策透明度但缺乏系统性披露工具"——算法供应链影响报告框架将ESG合规完成率提升至100%，年化降低融资成本50-100万元

## ② 核心算法逻辑

ESG报告和AI治理要求企业披露AI系统在供应链决策中的作用：自动化补货决策是否考虑供应商公平性？动态定价算法是否存在垄断性定价？AI选品推荐是否排斥小供应商？本Skill提供AI供应链决策的透明度报告框架，覆盖欧盟企业可持续发展报告指令（CSRD）要求。

## ③ 业务应用场景

场景1：母婴品牌ESG报告AI供应链章节 - 业务问题：投资者要求披露AI自动补货系统对供应商的影响，评估是否存在大供应商倾向 - 数据要求：补货决策日志 + 供应商分配数据 + AI决策特征权重 - 预期产出：AI供应链影响报告（ESG格式）+ 公平性指标 + 改进承诺 - 业务价值：ESG合规提升机构投资者信任，融资成本降低0.1-0.3%，年化价值50-100万元
**三轨验证**： - 成本：报告生成约5人天/年，法务审查约2人天 - 合规：CSRD 2024年起要求欧盟大型企业强制披露，需法务确认适用范围 - 风险：披露过多可能暴露算法细节，需在透明度和商业保密间权衡

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：ESG合规提升机构投资者信任，融资成本降低0.1-0.3%，年化价值50-100万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：ESG团队面临'投资者要求AI供应链决策透明度但缺乏系统性披露工具'——负责任AI披露框架将ESG报告AI章节完成率从0提升至100%，年化降低融资成本50-100万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（37 行）。**下面 37 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **37 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，37 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import pandas as pd
import numpy as np

def analyze_supplier_fairness(order_data: list) -> dict:
    """分析AI补货决策对供应商的公平性"""
    df = pd.DataFrame(order_data)
    if df.empty:
        return {"error": "no data"}
    
    # 按供应商规模分组
    large = df[df["supplier_size"] == "large"]["order_amount"]
    small = df[df["supplier_size"] == "small"]["order_amount"]
    
    large_share = large.sum() / df["order_amount"].sum() if not df.empty else 0
    small_share = small.sum() / df["order_amount"].sum() if not df.empty else 0
    
    # Herfindahl指数（市场集中度）
    by_supplier = df.groupby("supplier_id")["order_amount"].sum()
    total = by_supplier.sum()
    hhi = ((by_supplier / total) ** 2).sum()
    
    return {
        "large_supplier_share": round(large_share, 3),
        "small_supplier_share": round(small_share, 3),
        "hhi_concentration": round(float(hhi), 3),
        "fairness_risk": "HIGH" if hhi > 0.25 else ("MEDIUM" if hhi > 0.15 else "LOW"),
        "esg_disclosure_ready": True,
    }

import random; random.seed(42)
orders = [{"supplier_id": f"S{random.randint(1,5)}", 
           "supplier_size": "large" if random.random() > 0.6 else "small",
           "order_amount": random.uniform(1000, 50000)} for _ in range(100)]
result = analyze_supplier_fairness(orders)
print(f"大供应商占比: {result['large_supplier_share']:.1%} | HHI: {result['hhi_concentration']:.3f} | 风险: {result['fairness_risk']}")
assert "fairness_risk" in result
print("[✓] Responsible AI Supply Chain Disclosure 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：AI 补货或选品决策日志、供应商分配数据（供应商规模、订单金额）、AI 决策特征权重、披露口径要求；粒度：订单级与供应商级。

**输出**：AI 供应链影响报告（ESG 格式）、供应商公平性与集中度指标、改进承诺建议，供 ESG 团队与投资人沟通使用。

## 执行步骤

1. 收集补货决策日志与供应商分配数据
2. 按供应商规模分组计算订单占比
3. 计算集中度指标并判定公平性风险
4. 汇总 AI 在决策中的作用说明
5. 输出披露报告与改进承诺

## 边界与不做

- 数据不满足时不用：订单数据未按供应商维度归集时，集中度与公平性指标无法计算。
- 能力边界：只产出报告框架与指标，不代对外披露；适用法域与措辞须法务确认。

## 技能关联

- **可组合**：Skill-Responsible-AI-Supply-Chain-Disclosure

---

> 分类：未归类（矩阵空白）　·　技术族：11-AI人文　·　源卡：`Skill-Responsible-AI-Supply-Chain-Disclosure`