---
name: "p2s-algorithmic-accountability-audit"
title: "Algorithmic Accountability Audit — 算法问责审计（推荐系统可解释性合规报告）"
description: "触发词：算法问责、推荐偏见检测、合规报告、价格歧视排查、特征权重披露。何时不用：生成面向监管条款的可解释性报告时用「XAI Regulatory Compliance」；面向消费者的解释话术用「AI Transparency Explanation」。安全边界：报告含算法细节，须法务审查后定向披露；避免过度透明泄露商业机密，也不得以保密为由隐瞒偏见结论。"
l1_id: ""
l1_plane: "未归类（矩阵空白）"
l2_id: ""
l2_domain: "未归类（矩阵空白）"
l3_id: ""
l3_business: "（矩阵空白）"
l3_all: ""
l1_l2_l3: "未归类（矩阵空白）"
p2s_card_id: "Skill-Algorithmic-Accountability-Audit"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "定期给推荐系统出一份问责报告，说清用了哪些特征、有没有对不同人群不公平。"
user_try: "试试：按推荐特征权重和各分群价格分布，生成一份算法问责报告并标出偏见风险。"
whenToUse: "需要定期产出算法问责报告（推荐逻辑、偏见检测、数据来源、人工监督）时用；针对监管条款的报告自动化用 XAI 类技能；面向用户的解释话术用透明度类技能。"
workflow: "收集特征权重与分群数据 → 计算分群结果分布差异 → 判定偏见信号与风险等级 → 输出问责报告与改进建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Algorithmic Accountability Audit — 算法问责审计（推荐系统可解释性合规报告）

## ① 解决的问题

法务团队面临"EU AI法案要求推荐系统可解释性报告但缺乏工具"——算法问责审计自动生成合规报告，年化防范欧盟罚款风险30-100万元

## ② 核心算法逻辑

欧盟AI法案（2024年生效）要求高风险AI系统提供人类可理解的决策解释。母婴电商推荐系统属于影响消费者经济利益的系统，需要定期生成算法问责报告。报告内容：推荐逻辑摘要（使用了哪些特征）、偏见检测结果（是否对特定用户群体不公平）、数据来源透明度、人工监督机制描述。

## ③ 业务应用场景

场景1：Amazon欧盟市场推荐系统合规报告 - 业务问题：欧盟客户投诉推荐系统总推送高价商品，怀疑存在价格歧视 - 数据要求：推荐系统特征权重 + 用户分群数据 + 推荐价格分布 + SHAP值 - 预期产出：算法问责报告（PDF）+ 偏见检测摘要 + 改进建议 - 业务价值：提前满足EU AI法案合规要求，避免罚款，年化防范价值30-100万元
**三轨验证**： - 成本：报告生成脚本约3人天，每季度运行成本极低 - 合规：报告需法务审查后对外发布，避免披露敏感算法细节 - 风险：过度透明可能泄露竞争优势，需在合规与商业保密间权衡

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：提前满足EU AI法案合规要求，避免罚款，年化防范价值30-100万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：法务团队面临'EU AI法案要求推荐系统提供可解释性报告但无工具支撑'——算法问责审计自动生成合规报告，年化防范欧盟罚款风险30-100万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（25 行）。**下面 25 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **25 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，25 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def generate_accountability_report(feature_weights: dict, 
                                    price_by_segment: dict) -> dict:
    # 检测价格推荐偏差
    prices = list(price_by_segment.values())
    price_variance = np.std(prices) / np.mean(prices) if np.mean(prices) > 0 else 0
    bias_flag = price_variance > 0.3  # 价格分布差异>30%视为偏见信号
    top_features = sorted(feature_weights.items(), key=lambda x: -abs(x[1]))[:5]
    return {
        "report_version": "v1.0",
        "top_decision_factors": [f[0] for f in top_features],
        "price_recommendation_variance": round(price_variance, 3),
        "bias_detected": bias_flag,
        "bias_risk_level": "HIGH" if bias_flag else "LOW",
        "recommendation": "需要人工审查价格推荐分布" if bias_flag else "推荐分布均衡",
    }

weights = {"purchase_history": 0.35, "price_sensitivity": 0.28,
           "category_preference": 0.20, "region": 0.12, "age_group": 0.05}
segments = {"vip": 89.5, "standard": 72.3, "new_user": 95.8}
report = generate_accountability_report(weights, segments)
print(f"偏见检测: {report['bias_risk_level']} | 价格方差: {report['price_recommendation_variance']}")
assert "purchase_history" in report["top_decision_factors"]
print("[✓] Algorithmic Accountability Audit 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：推荐系统特征权重、用户分群数据、推荐价格或结果分布、SHAP 等解释值、人工监督机制说明；粒度：模型级与分群级。

**输出**：算法问责报告（决策因素摘要、偏见检测结果与风险等级、改进建议），供法务审查后对外披露。

## 执行步骤

1. 收集特征权重、分群数据与解释值
2. 计算各分群价格或结果的分布差异
3. 判定偏见信号并给出风险等级
4. 汇总推荐逻辑与数据来源说明
5. 输出问责报告与改进建议

## 边界与不做

- 数据不满足时不用：缺少分群维度的结果分布时，偏见检测只能给出粗略信号，不能作为合规结论。
- 能力边界：只产出报告草稿与判定信号，不代对外披露；发布前须法务审查，避免泄露敏感算法细节。

## 技能关联

- **可组合**：Skill-Algorithmic-Accountability-Audit

---

> 分类：未归类（矩阵空白）　·　技术族：11-AI人文　·　源卡：`Skill-Algorithmic-Accountability-Audit`