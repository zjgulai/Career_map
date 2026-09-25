---
name: "p2s-tag-driven-voc-signal-routing"
title: "Tag-Driven VOC Signal Routing — VOC信号自动标签化与业务路由"
description: "触发词：VOC 标签化、工单路由、客诉分诊、退货原因、自动分派。何时不用：需要的是摘要与属性分布用「AGRS 属性引导评论摘要」；要输出产品改进优先级清单用「VOC 产品迭代信号提取」。安全边界：模型误判会造成工单错派，须设置人工复核阈值；评论与退货原因数据不得含未脱敏的用户个人信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 客诉分诊"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-Tag-Driven-VOC-Signal-Routing"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "给评论和退货原因自动打标签，再按标签把问题路由到供应链、内容或客服团队，把两天的响应压到十几分钟。"
user_try: "试试：把近六个月的差评和退货原因自动打标并路由，标出需要 P0 处置的质量问题。"
whenToUse: "收到大量差评与退货反馈、不知道分派给哪个团队时用本技能；若需要的是摘要与属性分布，用「AGRS 属性引导评论摘要」；若要排产品改进优先级，用「VOC 产品迭代信号提取」。"
workflow: "收集评论文本（含星级）与退货原因文本 → 用多标签分类器为每条反馈打问题标签 → 按路由规则映射团队、优先级与处置动作 → 按星级折算严重程度权重并触发工单 → 把低置信结果标记进入人工复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag-Driven VOC Signal Routing — VOC信号自动标签化与业务路由

## ① 解决的问题

运营团队面临"用户差评信号收到了但不知道应该路由给供应链还是运营还是客服"——NLP标签化自动路由将VOC响应到对应团队时间从2天压缩至15分钟，年化客诉处理效率提升70万元

## ② 核心算法逻辑

本 Skill 将 VOC（用户声音）信号——评论/退货反馈/客服记录——通过 NLP 分类器自动标签化，再依据标签路由规则触发对应业务域的改进行动，实现「VOC 信号 → 标签 → 动作」的全自动闭环。

## ③ 业务应用场景

场景A：吸奶器差评自动分类+路由 - 业务问题：每周 200+ 条差评，运营人工分类效率低，质量问题平均处置周期 14 天 - 数据要求：Amazon 评论文本（含星级）+ 退货原因文本（近 6 个月） - 预期产出：质量问题自动识别率 91%，P0 工单路由 < 24小时处置，平均处置周期从 14天降至 3天 - 业务价值：差评率从 8.2% 降至 5.1%，年化减少差评约 1500 条，评分提升约 0.3 星，BSR 提升约 15%，年化 GMV 增量约 40 万元
三轨验证： - 成本：数据采集成本约 0.5 万元（爬虫/API 调用），NLP 模型训练及部署约 1.5 万元（云服务器 + 标注人力），合计约 2 万元/年。 - 合规：评论数据仅用于内部运营分析，不对外公开，不违反 Amazon 数据使用政策；不涉及 GDPR 个人身份信息（PII）处理。 - 风险：若自动路由至 QC 工单后处置不及时，可能引发差评二次爆发；模型误判（如将正常反馈标记为质量问题）可能导致资源浪费，需设置人工复核阈值。
场景B：退货信号路由到 Listing 优化 - 业务问题：退货率 12%，但退货原因中「描述不符」占 38%，Listing 优化严重滞后 - 数据要求：退货反馈文本（买家填写原因）+ 商品 ASIN 映射 - 预期产出：`Listing误导` 标签自动路由到内容团队，触发 A+ 页面审核工单，周处理量提升 5x - 业务价值：退货率从 12% 降至 8.5%，年化减少退货处理成本约 22 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：差评率从 8.2%→5.1%，年化 GMV 增量约 40 万元；退货率从 12%→8.5%，年化减少退货成本约 22 万元；人工分类节省 4人/月，折算约 8 万元/年，合计年化价值约 70 万元
实施难度：⭐⭐☆☆☆（NLP 分类器部署简单，无需 GPU）
优先级：⭐⭐⭐⭐⭐（差评直接影响 BSR 和转化率，ROI 最高的快赢项目）
数据门槛：历史评论 ≥500 条用于标注训练，评论文本完整度 ≥90%
风险：多语言评论（中/英/西班牙语）需分别训练或使用多语言模型，初期准确率约 85%

## ⑦ 代码节选

本节的完整实现（228 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.11947，但该号在 arXiv 上是《The Effects of the Gravitational Coupling Variation on the Local $H_0$ Estimation》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Amazon 评论文本（含星级）+ 退货原因文本（近 6 个月），需带 ASIN 映射；训练分类器需要历史评论不少于 500 条且评论文本完整度不低于 90%。

**输出**：带问题标签与严重程度权重的结构化反馈、对应的团队与优先级路由结果（P0 工单 24 小时内处置）与触发动作，以及需要人工复核的低置信清单。

## 执行步骤

1. 收集评论与退货原因文本
2. 用多标签分类器打问题标签
3. 按路由规则映射团队、优先级与动作
4. 按星级折算严重程度并触发工单
5. 把低置信结果送入人工复核

## 边界与不做

- 历史评论不足 500 条或文本完整度过低时不适用，分类器准确率无法保证
- 模型误判会导致资源错配，必须设置人工复核阈值；本技能只产出标签与路由建议，不代替团队处置
- 评论与退货原因数据不得包含未脱敏的用户个人信息，多语言评论须分别训练或使用多语言模型

## 技能关联

- **前置**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-CS-Supply-Chain-Feedback-Loop-Tag.html、Skill-CS-Supply-Chain-Feedback-Loop-Tag、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger
- **延伸**：Skill-CS-Supply-Chain-Feedback-Loop-Tag.html、Skill-CS-Supply-Chain-Feedback-Loop-Tag、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger
- **可组合**：Skill-CS-Supply-Chain-Feedback-Loop-Tag.html、Skill-CS-Supply-Chain-Feedback-Loop-Tag、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger、Skill-Tag-Driven-VOC-Signal-Routing

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Driven-VOC-Signal-Routing`