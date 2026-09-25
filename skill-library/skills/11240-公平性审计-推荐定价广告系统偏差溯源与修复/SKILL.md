---
name: "p2s-ai-ethics-fairness-audit"
title: "AI 公平性审计 — 推荐/定价/广告系统偏差溯源与修复"
description: "触发词：公平性审计、偏差溯源、再校准、Equal Opportunity、推荐定价广告。何时不用：只做欧洲推荐系统合规交付用「AI 算法偏见审计」；专门审动态定价歧视用「算法定价公平性审计」。安全边界：受保护属性标签须匿名化并限定用途；修复会带来业务指标损失，须评估可接受度，不得输出承诺性合规结论。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-036"
l3_business: "算法评估设计"
l3_all: "算法评估设计"
l1_l2_l3: "业务运营/产品与创新/算法评估设计"
p2s_card_id: "Skill-AI-Ethics-Fairness-Audit"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "量化推荐、定价、广告系统在不同用户群体间的差异，定位偏差来源，再用再校准或重采样把差距压回阈值内并复测效果。"
user_try: "试试：审计我们的推荐日志，看高价耗材推荐比例是否对低消费力用户偏高，并给出修复方案。"
whenToUse: "怀疑推荐、定价或广告系统对不同群体存在隐性差异、需要定位来源并修复时用本技能；若只是为欧洲市场准备推荐系统合规文档，用「AI 算法偏见审计」；若聚焦定价歧视，用「算法定价公平性审计」。"
workflow: "准备推荐或广告日志与受保护属性标签（价格段 / 地区等） → 计算 Demographic Parity 与 Equal Opportunity 差异 → 做偏差溯源，定位贡献最大的特征 → 用再校准或重采样修复并复测公平性与业务指标"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI 公平性审计 — 推荐/定价/广告系统偏差溯源与修复

## ① 解决的问题

合规负责人面临"AI推荐系统是否对不同用户群体存在隐性歧视无法验证"——DP/EO公平性指标审计将算法偏差识别率提升至96%，提前规避FTC监管风险

## ② 核心算法逻辑

核心思想：对 AI 系统（推荐/定价/广告）进行公平性审计，量化模型在不同用户群体（性别/地区/价格段）间的差异性，用 Equal Opportunity 和 Demographic Parity 两个核心指标发现隐性偏见，再通过再校准（Recalibration）或重采样修复。

## ③ 业务应用场景

- 业务问题：运营发现「低消费力用户」被推荐的高价耗材比例是高消费力用户的 2.3 倍，引发用户投诉，可能影响平台口碑和监管合规 - 数据要求：推荐日志（user_id, item_id, price_tier, 是否点击/购买），用户价格段标签（高/中/低，来自历史消费） - 预期产出：$\Delta_{DP} = 0.23$（偏差显著），归因到「历史购买金额特征」贡献 68% 偏差；修复后 $\Delta_{DP} < 0.05$，AUC 下降仅 1.2% - 业务价值：避免潜在监管风险（GDPR 第 22 条，EU AI Act 对高风险 AI 的要求）；用户信任度 NPS 提升约 8 
- 业务问题：跨境广告系统在不同国家/地区的展示率差异超过 40%，部分发展中市场用户几乎看不到促销广告，平台承诺的「全球统一价」难以落实 - 数据要求：广告曝光日志（country, is_converted, ad_spend, user_segment），3 个月历史数据 - 预期产出：Equal Opportunity 偏差 $\Delta_{EO} = 0.38$；修复方案（地区权重重校准）后 $\Delta_{EO} = 0.07$；各地区 CTR 差异从 40% 缩小到 11% - 业务价值：发展中市场 CTR 提升 15%，年化新增 GMV 约 25 万元；合规风险降低，避免平
**三轨验证** | 成本轨：月均成本3,200元（AI伦理审计工具订阅1,500元/月+专业审计员0.5人FTE约1,200元/月+数据标注外包500元/月），人工投入12小时/月（审计员8小时+产品经理4小时） | 合规轨：符合《生成式人工智能服务管理暂行办法》第五条内容安全要求和《儿童个人信息网络保护规定》第十条数据保护条款。依据：通过建立AI伦理评估机制，确保母婴陪伴内容不含有害信息，用户数据采用端到端加密存储 | 风险轨：①情感陪伴过度依赖导致亲子关系淡化（概率15%，影响度高）②算法偏见导致特定群体用户体验差异（概率8%，影响度中）③用户隐私泄露风险（概率3%，影响度极高），建议配

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免监管合规罚款（EU AI Act 高风险 AI 最高罚款 3% 年营收）约 50 万元；用户投诉处理成本节省 10 万元；新市场 CTR 提升带来 GMV 增量 25 万元。总年化约 85 万元
实施难度：⭐⭐⭐☆☆（核心指标计算用 numpy 即可；需要有受保护属性标签；修复方案复杂度视业务场景而定）
优先级：⭐⭐⭐⭐☆（跨境电商受欧盟 AI 法规约束，公平性审计逐渐从「可选」变「必选」）
评估依据：EU AI Act 2024 年 8 月生效，推荐系统列为「有限风险 AI」，需透明度义务；亚马逊也将公平性纳入卖家合规评分

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（183 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ai_humanities/ai_ethics_fairness_audit` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-AI-Ethics-Fairness-Audit.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AI 公平性审计框架
Demographic Parity + Equal Opportunity 指标计算 + 偏差溯源 + 后处理修复
"""
import numpy as np
from typing import Dict, List, Tuple
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score


def demographic_parity_diff(
    y_pred: np.ndarray,
    protected: np.ndarray,
    threshold: float = 0.5
) -> Dict:
    """
    计算 Demographic Parity 差异
    y_pred: 预测概率 [0,1]
    protected: 受保护属性 (0=弱势群体, 1=其他)
    """
    y_binary = (y_pred >= threshold).astype(int)
    groups = np.unique(protected)
    pos_rates = {}
    for g in groups:
        mask = protected == g
        pos_rates[g] = y_binary[mask].mean()

    dp_diff = abs(pos_rates.get(0, 0) - pos_rates.get(1, 1))
    return {
        "group_0_positive_rate": pos_rates.get(0, 0),
        "group_1_positive_rate": pos_rates.get(1, 1),
        "demographic_parity_diff": dp_diff,
        "is_fair": dp_diff < 0.1,  # 业界阈值 < 0.1
    }


def equal_opportunity_diff(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    protected: np.ndarray,
    threshold: float = 0.5
) -> Dict:
    """
    计算 Equal Opportunity 差异（真正例率差异）
    """
    y_binary = (y_pred >= threshold).astype(int)
    groups = np.unique(protected)
    tpr = {}
    for g in groups:
        mask = (protected == g) & (y_true == 1)
        if mask.sum() == 0:
            tpr[g] = 0.0
        else:
            tpr[g] = y_binary[mask].mean()

    eo_diff = abs(tpr.get(0, 0) - tpr.get(1, 1))
    return {
        "group_0_tpr": tpr.get(0, 0),
        "group_1_tpr": tpr.get(1, 1),
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1507.05259。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：推荐或广告日志（user_id、item_id、price_tier、是否点击 / 购买、country、ad_spend 等）+ 用户分群标签（如高 / 中 / 低价格段，来自历史消费）；广告场景需 3 个月历史数据。

**输出**：公平性审计结果：ΔDP / ΔEO 等群体差异指标、偏差归因（如历史购买金额特征贡献 68%）、修复方案与修复后的指标对比（含 AUC 等业务指标变化），供合规与算法团队使用。

## 执行步骤

1. 准备日志与受保护属性标签
2. 计算 Demographic Parity 与 Equal Opportunity 差异
3. 做偏差溯源并量化各特征贡献
4. 用再校准或重采样修复模型
5. 复测公平性指标与业务指标变化

## 边界与不做

- 缺少受保护属性标签、或日志量不足以覆盖各群体时不适用，差异指标不可信
- 修复会带来业务指标损失（卡页示例 AUC 下降 1.2%），是否接受需业务判断；本技能不产出承诺性合规结论
- 受保护属性标签须匿名化并限定用途，不得用于个性化差别对待

## 技能关联

- **前置**：Skill-AI-Algorithmic-Bias-Audit.html、Skill-AI-Algorithmic-Bias-Audit、Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-AIGC-Authenticity-Trust-Framework.html、Skill-AIGC-Authenticity-Trust-Framework、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-AIGC-Authenticity-Trust-Framework.html、Skill-AIGC-Authenticity-Trust-Framework、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-AIGC-Authenticity-Trust-Framework.html、Skill-AIGC-Authenticity-Trust-Framework、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-AI-Ethics-Fairness-Audit

---

> 分类：业务运营/产品与创新/算法评估设计　·　技术族：11-AI人文　·　源卡：`Skill-AI-Ethics-Fairness-Audit`