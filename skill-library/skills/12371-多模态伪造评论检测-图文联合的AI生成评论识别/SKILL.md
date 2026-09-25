---
name: "p2s-multimodal-fake-review-detection"
title: "多模态伪造评论检测 — 图文联合的AI生成评论识别"
description: "触发词：多模态伪造评论、图文一致性、CLIP 相似度、AI 合成评论图、账号行为异常度、评论质量审计。何时不用：只做评论文本层面的虚假概率与触发词证据用「AI-Fake-Review-Detection」；要叠文本+行为+网络团伙三层取证用「VOC-Fraud-Review-Detection」；本技能的着力点是图文跨模态一致性与行为图。安全边界：评论数据须经平台 API 条款允许的途径获取，仅可用于质量分析、不得用于训练商业模型；申诉须保存图片 Hash、相似度得分与时间分布等证据链。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-082"
l3_business: "申诉材料准备"
l3_all: "申诉材料准备 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/申诉材料准备"
p2s_card_id: "Skill-Multimodal-Fake-Review-Detection"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "联合看评论文本、配图一致性与账号行为，识别 AI 合成的多模态伪造评论，并产出可提交平台的证据报告。"
user_try: "试试：这是我店铺最近新增的评论数据（文本、图片、评论者历史行为、时间戳），帮我找出图文不一致或账号行为异常的可疑评论，并生成一份可直接提交 Seller Support 的证据报告。"
whenToUse: "评论同时带文本、图片与评论者行为数据、要识别 AI 合成的多模态伪造评论时用本技能；只做文本层面虚假判定用「AI-Fake-Review-Detection」，要检测刷评团伙网络用「DS-DGA-GCN-Fake-Review-Group-Detection」，要接 LLM 判别器逐条复核用「FraudSquad-LLM-Review-Detection」。"
workflow: "采集评论文本、评论图片、评论者历史行为与提交时间戳 → 用 CLIP 计算图文跨模态一致性得分 → 抽取文本困惑度、情感极性、词汇多样性等文本特征 → 抽取账号年龄、集中发布指数、评分极端度、是否验证购买等行为特征 → 融合分类后输出图文不一致性得分与行为异常度证据报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多模态伪造评论检测 — 图文联合的AI生成评论识别

## ① 解决的问题

店铺面临"竞争对手AI生成多模态差评评分从4.8降至4.3"——CLIP图文一致性+行为图检测伪造评论F1达0.83，加速申诉恢复评分，年化防御损失约180万元

## ② 核心算法逻辑

传统评论欺诈检测主要针对纯文本（GNN图检测、NLP文本分类），但2024年起出现新型威胁：AI生成的多模态伪造评论——同时包含伪造的评论文本、AI合成的产品照片和捏造的用户档案，三者语义一致、难以单独识别。

## ③ 业务应用场景

场景A：亚马逊评论质量自动化审计 - 业务问题：竞争对手对自家婴儿推车产品刷差评（1星），且差评中附带AI生成的"问题产品照片"（实为其他品牌产品图），平台人工处理周期7天，已造成评分从4.8降至4.3 - 数据要求：评论文本+图片（可通过SP-API获取）、评论者历史行为数据、提交时间戳 - 预期产出：自动检测出涉嫌伪造差评37条（检测精度F1=0.83），附带证据报告（图文不一致性得分、账号行为异常度），提交给平台Seller Support申诉 - 业务价值：加速恶意差评处理周期从7天到2天（申诉成功率提升25%），评分恢复4.7以上，避免月均销量损失约15万元；全年防止恶意竞争损失约1
三轨对抗验证： 1. 成本验证：CLIP相似度计算约0.1秒/条（CPU），1000条评论需100秒；无需GPU；API成本约0.01元/条，月均1000条= 10元/月 2. 合规验证：收集用户评论图片需符合平台API使用条款（仅用于质量分析，不可训练商业模型）；向平台申诉需保存证据链（图片Hash、相似度得分、时间分布截图） 3. 风险验证：误报风险：用户自行拍摄同品类其他产品图作为对比，会触发跨模态不一致性告警（假阳性）；需设置"人工复核"流程对高置信度（>0.9）以外的结果做二次确认
场景B：自有店铺评论质量监控 - 业务问题：监控自家产品的真实评论质量，检测是否有竞争对手雇佣水军刷好评影响自然评分（平台会惩罚刷好评） - 数据要求：所有评论数据（含5星评价） - 预期产出：每周评论质量报告：真实评论占比、可疑评论列表、建议删除的评论（主动合规，避免被平台检测到） - 业务价值：主动清理可疑好评，避免平台处罚（封号风险），保护长期账号健康

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：检测恶意竞争差评并快速申诉，评分从4.3恢复到4.7，月均销量恢复损失约15万元，年化约180万元；主动清理可疑好评避免平台处罚（封号成本超1000万元），预防价值极高；CLIP特征提取API成本<100元/月
实施难度：⭐⭐⭐☆☆（CLIP特征提取需要transformers库；行为图分析需要历史数据；整体工程量约2-3周）
优先级：⭐⭐⭐⭐☆（AI生成评论已成主流欺诈手段，2024年后单模态检测效果大幅下降）
评估依据：ACM MM 2024顶会论文验证多模态检测F1比单模态提升约15个百分点；亚马逊2023年移除超1亿条虚假评论，检测主要依赖行为图+内容双维度；CLIP相似度异常是AI伪造评论的可靠特征

## ⑦ 代码节选

本节的完整实现（147 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2402.11965。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：评论级多模态数据：评论文本、评论图片（须通过平台 API 且符合其使用条款获取）、评论者历史行为数据、提交时间戳；行为特征覆盖账号年龄、集中发布指数、评分极端度、是否验证购买，图像侧须可计算 CLIP 图文相似度。自有店铺监控场景需包含全部评论（含 5 星）；规模按卡页口径约千条级，CLIP 相似度约 0.1 秒/条（CPU），无需 GPU。

**输出**：可疑评论列表与证据报告：图文不一致性得分、账号行为异常度、检测精度指标（卡页口径 F1 约 0.83），以及每周评论质量报告（真实评论占比、可疑评论列表、建议处理的评论）；供评论风控与申诉团队提交 Seller Support，或用于自有店铺主动清理。

## 执行步骤

1. 通过平台 API 采集评论文本、图片、评论者行为与时间戳
2. 计算 CLIP 图文跨模态一致性得分
3. 抽取文本困惑度、情感极性、词汇多样性等文本特征
4. 抽取账号年龄、集中发布指数、评分极端度、验证购买等行为特征
5. 训练融合分类器并输出可疑评论与图文不一致性得分
6. 汇总行为异常度，产出可提交平台的证据报告

## 边界与不做

- 数据不满足时不用：缺评论图片或评论者历史行为数据时，跨模态与行为图两条通道都失效；未按平台 API 条款取得授权的图片数据不得使用。
- 何时不用：只做文本层面虚假概率用「AI-Fake-Review-Detection」；要检测刷评团伙网络用「DS-DGA-GCN-Fake-Review-Group-Detection」；要用 LLM 逐条判别用「FraudSquad-LLM-Review-Detection」。
- 能力边界：用户自拍同品类其他产品图做对比会触发误报（假阳性），高置信度（＞0.9）以外的判定必须走人工二次确认；输出只作举报证据，不代替平台裁决。
- 安全边界：评论图片与用户数据仅可用于质量分析、不得用于训练商业模型；申诉须保存图片 Hash、相似度得分与时间分布截图等证据链。

## 技能关联

- **前置**：Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-AI-Generated-Content-Detection.html、Skill-AI-Generated-Content-Detection、Skill-DS-DGA-GCN-Fake-Review-Group-Detection.html、Skill-DS-DGA-GCN-Fake-Review-Group-Detection、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection
- **延伸**：Skill-AI-Generated-Content-Detection.html、Skill-AI-Generated-Content-Detection、Skill-DS-DGA-GCN-Fake-Review-Group-Detection.html、Skill-DS-DGA-GCN-Fake-Review-Group-Detection、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection
- **可组合**：Skill-AI-Generated-Content-Detection.html、Skill-AI-Generated-Content-Detection、Skill-DS-DGA-GCN-Fake-Review-Group-Detection.html、Skill-DS-DGA-GCN-Fake-Review-Group-Detection、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection、Skill-Multimodal-Fake-Review-Detection

---

> 分类：业务运营/渠道经营/申诉材料准备　·　技术族：11-AI人文　·　源卡：`Skill-Multimodal-Fake-Review-Detection`