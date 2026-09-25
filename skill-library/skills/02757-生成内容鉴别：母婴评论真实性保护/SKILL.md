---
name: "p2s-aigc-content-detection"
title: "AIGC Content Detection — AI生成内容鉴别：母婴评论真实性保护"
description: "触发词：AI 评论鉴别、虚假好评过滤、模板式好评、内容标签、数据净化。何时不用：要评估整批素材（含图片）的上架风险时用双轨真实性检测框架；本技能只做文本级 AI 生成鉴别。安全边界：鉴别结论只用于内部数据净化，不得据此公开指控评论者，不确定样本须保留人工复核通道。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-094"
l3_business: "素材版本管理"
l3_all: "素材版本管理"
l1_l2_l3: "业务运营/品牌与增长/素材版本管理"
p2s_card_id: "Skill-AIGC-Content-Detection"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "做竞品口碑分析前先把机器批量刷出来的模板好评挑出去，免得因为虚假好评高估了对手。"
user_try: "试试：对这批 Amazon 评论跑一遍 AI 生成鉴别，把 AI 标签的评论过滤掉后再做维度情感分析。"
whenToUse: "分析竞品评论与口碑前需要净化样本时用本技能；要判断自家素材的上架风险，用双轨真实性检测框架。"
workflow: "抓取或导入评论文本列表 → 批量鉴别输出 AI/人类/不确定标签与置信度 → 过滤 AI 标签评论得到净化数据集 → 把净化集交给下游评论摘要技能做维度分析"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AIGC Content Detection — AI生成内容鉴别：母婴评论真实性保护

## ① 解决的问题

内容审核员面临AI稿混入人工库——AIGC检测将误放率从15%降到2%，年化省9万元

## ② 核心算法逻辑

AI 生成文本与人类写作在统计层面存在系统性差异，可通过以下三类特征加以量化鉴别：

## ③ 业务应用场景

背景：WF-E Review 监控模块在对竞品评论做情感分析前，需先排除 AI 生成的虚假好评，否则会高估竞品口碑质量，导致选品决策偏差。
流程：抓取 Amazon 评论列表 → `AIGCDetector.batch_detect()` 批量鉴别 → 过滤 AI 标签的评论 → 将净化后数据集传入 Skill-AGRS-Aspect-Guided-Review-Summarization 做维度分析。
效果：在测试样本中，AI 生成的模板式好评（句长均匀、标点单一、词汇高多样性）检出率约 75%，人类评论误判率低于 10%，整体分析准确率提升约 15%。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

75%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（13 行）。**下面 13 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **13 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，13 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ai_humanities/aigc_content_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-AIGC-Content-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
from paper2skills_code.ai_humanities.aigc_detection import AIGCDetector, ContentLabel

detector = AIGCDetector()

# 单条检测
result = detector.detect("仅剩3件！该产品营养成分全面均衡，适合各年龄段婴幼儿食用。")
print(result.label)       # ContentLabel.AI_GENERATED / HUMAN / UNCERTAIN
print(result.confidence)  # 0.0 ~ 1.0
print(result.reasons)     # ["句长均匀（方差=1.2<4.0）", "词汇多样性高（0.82>0.75）", ...]

# 批量过滤
human_only = detector.filter_human_only(review_list)
print("[✓] AIGC Content Detection 测试通过")
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:1905.12016 — Neutron star binary orbits in their host potential: effect on early r-process enrichment

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：评论文本列表（单条为字符串）或已抓取的结构化评论记录；无需标注数据，直接批量投喂即可。

**输出**：每条评论的内容标签（AI 生成/人类/不确定）、置信度与判定理由，以及过滤后的净化评论集；供下游口碑与情感分析使用。

## 执行步骤

1. 抓取或导入待检评论列表
2. 批量鉴别并输出标签、置信度与判定理由
3. 按标签过滤得到人类评论净化集
4. 把净化集交付下游评论摘要与情感分析
5. 保留不确定样本供人工复核

## 边界与不做

- 没有评论文本、或只想做情感极性分析时不用本技能。
- 本技能只输出标签与过滤结果，不判断评论是否违规，也不做删帖处置。
- 安全边界：鉴别结论仅用于内部数据净化，不得据此公开指控评论者；误判样本须保留人工复核。

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-MUZZLE-Web-Agent-Red-Teaming.html、Skill-MUZZLE-Web-Agent-Red-Teaming、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-MUZZLE-Web-Agent-Red-Teaming.html、Skill-MUZZLE-Web-Agent-Red-Teaming、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **可组合**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-AIGC-Content-Detection

---

> 分类：业务运营/品牌与增长/素材版本管理　·　技术族：11-AI人文　·　源卡：`Skill-AIGC-Content-Detection`