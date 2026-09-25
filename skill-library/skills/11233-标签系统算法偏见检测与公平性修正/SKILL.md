---
name: "p2s-tag-fairness-bias-audit"
title: "Tag Fairness & Bias Audit — 标签系统算法偏见检测与公平性修正"
description: "触发词：算法偏见、公平性审计、标签偏见、曝光不足、欧盟 AI 法案。何时不用：做合规违规概率打分排序用「合规 ML 风险评分」；做标签体系结构设计用标签体系类技能。安全边界：公平性修正须在准确率与公平度之间权衡并留痕，过度纠正导致标签准确率明显下降的方案不得上线。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-122"
l3_business: "抽样审计"
l3_all: "抽样审计 / 数据质量"
l1_l2_l3: "独立控制/经营与组织/抽样审计"
p2s_card_id: "Skill-Tag-Fairness-Bias-Audit"
p2s_src_domain: "24-标签工程"
user_summary: "检查标签系统有没有系统性偏见（比如把某类产品都判给男婴），并给出修正后的标注建议。"
user_try: "试试：审计一下婴儿推车的标签分配，看看 sporty 这个标签有没有性别偏见并给出修正建议。"
whenToUse: "当标签或推荐分配对不同分组存在系统性曝光差异、需要量化并修正时用本技能；要做合规违规概率排序，用「合规 ML 风险评分」；要设计标签体系结构，用标签体系类技能。"
workflow: "按分组维度统计标签分配率并计算人口统计平价差 → 做卡方检验判断差异是否显著 → 对受影响样本做重加权或重采样修正 → 输出偏见报告、受影响 SKU 清单与重新标注建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag Fairness & Bias Audit — 标签系统算法偏见检测与公平性修正

## ① 解决的问题

数据工程师面临"标签系统性别偏见导致部分SKU曝光严重不足"——算法公平性修正将受歧视分组曝光率提升40%，年化增收15-30万元并降低欧盟AI法案合规风险

## ② 核心算法逻辑

核心思想：自动化标签系统（年龄段/性别/适用场景）在训练数据中存在的历史偏见会被模型放大，导致"女婴产品"被过度推荐给所有婴儿、或"高端品牌"标签偏向特定用户群。本 Skill 提供系统性偏见检测框架：测量标签在不同敏感属性分组间的分配差异，并通过重采样或后处理校正。

## ③ 业务应用场景

场景1：婴儿推车标签系统性别偏见修正 - 业务问题：自动标签系统将 "sporty stroller" 标记为男婴产品概率 78%，导致该类产品对女婴家庭曝光严重不足，转化损失约 35% - 数据要求：标签分配结果（标签 ID + 分配概率）+ 产品属性（类目/价格段）+ 购买用户画像（若有） - 预期产出：每个标签的偏见指数报告 + 受影响 SKU 清单 + 修正后重新标注建议 - 业务价值：修正性别偏见标签后，受影响 SKU 的曝光覆盖率提升 40%，年化增收 15-30 万元
**三轨验证**： - 成本：审计脚本一次性开发 3 人天，后续自动化运行成本极低 - 合规：算法公平性审计符合欧盟 AI 法案（2024）要求，降低监管风险 - 风险：过度纠正可能导致标签准确性下降，需要在公平性和准确性之间权衡

## ④ 输入数据要求

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：消除标签偏见后受影响 SKU 曝光提升 30-50%，年化增收 15-40 万元；同时降低欧盟 AI 法案合规风险，避免潜在罚款
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐☆
评估依据：欧盟 AI 法案 2024 年生效，对消费者推荐系统的算法偏见有明确要求；且修正偏见直接改善部分 SKU 的商业表现，ROI 可量化。

## ⑦ 代码模板

代码块数量：1 · 路径：未检测到

 Python60 行 · 可运行复制
import numpy as np
import pandas as pd
from scipy.stats import chi2_contingency

def demographic_parity_gap(labels_df: pd.DataFrame,
 label_col: str,
 sensitive_col: str) -> dict:
 """
 计算标签分配的人口统计均等差距
 labels_df: 含标签分配和敏感属性的 DataFrame
 """
 groups = labels_df[sensitive_col].unique()
 rates = {}
 for g in groups:
 subset = labels_df[labels_df[sensitive_col] == g]
 rate = subset[label_col].mean()
 rates[g] = round(rate, 4)
 max_gap = max(rates.values()) - min(rates.values())
 # 卡方检验
 contingency = pd.crosstab(labels_df[sensitive_col], labels_df[label_col])
 chi2, p_val, _, _ = chi2_contingency(contingency)
 return {
 "group_rates": rates,
 "demographic_parity_gap": round(max_gap, 4),
 "chi2": round(chi2, 3),
 "p_value": round(p_val, 4),
 "biased": p_val < 0.05 and max_gap > 0.1,
 "bias_severity": "HIGH" if max_gap > 0.2 else ("MEDIUM" if max_gap > 0.1 else "LOW"),
 }

def reweight_to_fairness(labels_df: pd.DataFrame,
 label_col: str,
 sensitive_col: str) -> pd.DataFrame:
 """对不足分组进行上采样以减少偏见"""
 groups = labels_df.groupby(sensitive_col)
 target_rate = labels_df[label_col].mean()
 reweighted = []
 for name, group in groups:
 current_rate = group[label_col].mean()
 if current_rate < target_rate - 0.05:
 # 上采样正样本
 positives = group[group[label_col] == 1]
 n_extra = int((target_rate - current_rate) * len(group))
 extra = positives.sample(n=min(n_extra, len(positives)), replace=True)
 reweighted.append(pd.concat([group, extra]))
 else:
 reweighted.append(group)
 return pd.concat(reweighted).reset_index(drop=True)

if __name__ == "__main__":
 np.random.seed(42)
 n = 500
 # 模拟标签分配：女婴产品被标记为"sporty"概率更低（偏见）
 gender = np.random.choice(["male_baby", "female_baby"], n)
 label = np.where(
 gender == "male_baby",
 np.random.binomial(1, 0.75, n),
 np.random.binomial(1, 0.35, n) # 偏见：女婴只有35%概率获得sporty标签
 )
 df = pd.DataFrame({"gender": gender, "sporty_label": label})

## ⑧ 论文来源

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## 输入 / 输出契约

**输入**：标签分配结果（标签 ID 与分配概率）、产品属性（类目、价格段）、购买用户画像（如有），以及待审计的分组维度（如性别）。

**输出**：每个标签的偏见指数报告、受影响 SKU 清单与修正后的重新标注建议；供数据工程与合规团队使用。

## 执行步骤

1. 按分组维度统计标签分配率并计算人口统计平价差
2. 做卡方检验判断差异是否显著
3. 对受影响样本做重加权或重采样修正
4. 输出偏见报告、受影响 SKU 清单与重新标注建议

## 边界与不做

- 数据不满足：没有分组维度或用户画像数据时无法做公平性检验，先补分组标注。
- 何时不用：做违规概率打分排序用「合规 ML 风险评分」；做标签体系结构设计用标签体系类技能；无分组差异的场景不必审计。
- 能力边界：只做检测与修正建议，不改动线上标签系统，也不判定法律意义上的歧视。
- 安全边界：公平性修正须在准确率与公平度之间权衡并留痕，过度纠正导致标签准确率明显下降的方案不得上线。

## 技能关联

- **可组合**：Skill-Tag-Fairness-Bias-Audit

---

> 分类：独立控制/经营与组织/抽样审计　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Fairness-Bias-Audit`