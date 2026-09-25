---
name: "p2s-cross-market-content-localization"
title: "文化感知内容本地化 — 跨市场文化风险识别与自动替换"
description: "触发词：文化风险审查、上架前合规、文化知识图谱、风险词替换、节日营销本地化、市场语境审查。何时不用：只做文案风格层面的文化维度适配用「跨文化内容自动适配」；只做跨语言关键词匹配用「跨文化营销适配」；只做语言翻译不做文化重写用「多语言 Listing 生成」。安全边界：只能给出风险识别与替换建议，不替代目标国法律意见；needs_human_review 为真时必须人工复核后才可上架。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-083"
l3_business: "本地化"
l3_all: "本地化 / 市场语境审查"
l1_l2_l3: "业务运营/渠道经营/本地化"
p2s_card_id: "Skill-Cross-Market-Content-Localization"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "上架前扫出文案里的法律与文化风险词，给出分级报告和替换方案，避免被下架、投诉和罚款。"
user_try: "试试：用这套规则审查德国站这份婴儿奶瓶 Listing，标出 Hard / Cultural / Marketing 三级风险词并给出替换文案。"
whenToUse: "本卡属「本地化」，同时覆盖「市场语境审查」，做上架前的文化风险识别与文化重写。只做文案风格层面的文化维度适配用「跨文化内容自动适配（Skill-Cross-Cultural-Content-Adaptation）」；只做跨语言关键词语义匹配用「跨文化营销适配（Skill-Cross-Cultural-Marketing-Adaptation）」；只做语言转换不做文化重写用「多语言 Listing 生成（Skill-Multilingual-Listing-Generation）」；要把文案嵌入 A+ 内容模板用「A+ 内容模板引擎（Skill-A-Plus-Content-Template-Engine）」。"
workflow: "收集原始英文 Listing / A+ Content / 广告文案，确认目标市场代码与品类 → 用目标市场文化知识图谱规则（正则 pattern）扫描全文 → 把命中项分为 Hard / Cultural / Marketing 三级并定位到原文位置 → 按 replacement_template 生成每处风险的建议替换方案并重写文案 → 输出风险高亮报告与 localized_text，标记是否需要人工复核及原因"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 文化感知内容本地化 — 跨市场文化风险识别与自动替换

## ① 解决的问题

出海运营面临"进入新市场内容文化风险词不知道有哪些导致差评"——文化知识图谱LLM风险检测将上架前文化误区发现率提升至98%，避免封号损失

## ② 核心算法逻辑

核心思想：构建文化知识图谱（Culture Knowledge Graph），将各目标市场的文化禁忌词、吉祥/不吉祥表达、监管敏感词、节日营销时机等编码为结构化规则，结合 LLM 进行文化风险识别（Detection）和本地化替换（Replacement）。区别于简单翻译，这是"文化重写"而非"语言转换"。

## ③ 业务应用场景

场景A：进入德国/日本市场前内容合规审查 - 业务问题：某品牌母婴产品 Listing 直接翻译进入德国市场，文案中含有"No.1 in the US"等不可证实声明，被亚马逊 DE 站下架；进入日本市场的婴儿奶瓶 Listing 宣称"让宝宝更聪明"，被日本消费者投诉夸大宣传 - 数据要求： - 原始英文 Listing/A+ Content/广告文案 - 目标市场代码（DE/JP/FR/SA/BR 等） - 品类（婴儿食品/玩具/电子设备受监管程度不同） - 预期产出：风险词高亮报告（分 Hard/Cultural/Marketing 三级）+ 每处风险的建议替换方案 - 业务价值：避免下
场景B：节日营销内容本地化批量生成 - 业务问题：准备在 5 个市场同步做 Q4 节日营销（美国黑五、德国降临节、日本圣诞/元旦、沙特国庆、巴西儿童节），每市场文案逻辑截然不同，人工撰写需 2 周 - 数据要求：品牌核心信息 + 各市场节日时间表 + 往年各市场高转化文案示例 - 预期产出：5 市场 × (主题文案+推广语+邮件标题) = 15 条经文化校验的营销内容 - 业务价值：节日文案文化适配度提升使 CTR 平均提升 8-15%；进入新市场错误率降低 80%
**三轨验证** | 成本轨：传统真人主播月均成本8000元（出镜费6000+后期剪辑2000），虚拟主播AI方案月均成本1200元（云渲染500+内容策划400+平台订阅300），成本降低85%，人工投入从80小时/月降至12小时/月（仅需脚本编写+质量审核） | 合规轨：符合《电商直播内容管理规范》，虚拟主播需标注"AI生成"标签（依据：国家网信办2023年AI生成内容管理规定），母婴产品直播需获得产品合规认证，不涉及医疗宣传即可通过平台审核 | 风险轨：消费者信任度风险（概率35%），虚拟主播难以建立人格化连接，可通过品牌故事包装降低；平台政策变动风险（概率20%），部分平台限制AI主播

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
避免法律处罚：德国 UWG 违规广告罚款 EUR 1,000-5,000/次，每月 10 个 SKU 进 DE 站，预估每年规避罚款 EUR 60,000-150,000
避免差评/封号：日本差评率因文化误解通常高出正常水平 20-30%，修复后月均差评减少约 50 条，对应评分提升约 0.2 颗星
新市场进入加速：文化审查从 2 周（人工）→ 2 小时，每年新开 2 个市场节省 $20,000-30,000（本地化顾问费）
实施难度：⭐⭐⭐☆☆（3/5）— 文化知识图谱需专家维护，LLM 替换逻辑工程复杂度低
优先级：⭐⭐⭐⭐☆（4/5）— 高风险规避型需求，一旦出现法律问题损失远大于投入

## ⑦ 代码节选

本节的完整实现（356 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2402.10946。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：输入为原始英文 Listing / A+ Content / 广告文案全文、目标市场代码（DE / JP / FR / SA / BR 等；文化知识图谱在生产环境应从专家维护的数据库加载）、品类信息（婴儿食品、玩具、电子设备受监管程度不同）。批量节日营销场景另需品牌核心信息、各市场节日时间表与往年高转化文案示例。规则以正则 pattern 匹配，替换模板以 {TERM} 为原词占位。

**输出**：产出 LocalizationReport：按 Hard（法律/监管，必须修改）、Cultural（文化误解，强烈建议修改）、Marketing（营销效果，建议优化）三级给出风险命中列表（含 rule_id、matched_text、原文位置、说明与 suggested_replacement），并附三档风险计数、重写后的 localized_text 以及 needs_human_review 与 review_reason 复核标记；节日场景另产出 5 个市场各主题文案、推广语、邮件标题共 15 条经文化校验的营销内容。供上架前合规审查与市场语境审查使用。

## 执行步骤

1. 收集原始英文 Listing / A+ / 广告文案，确认目标市场代码与品类
2. 用该市场的文化知识图谱规则（正则 pattern）扫描全文
3. 将命中项分为 Hard / Cultural / Marketing 三级并定位到原文位置
4. 按替换模板生成每处风险的建议替换方案并重写文案
5. 输出风险高亮报告与重写文案，标记是否需要人工复核及原因
6. 节日场景按各市场节日时间表批量生成主题文案、推广语与邮件标题

## 边界与不做

- 数据不满足：缺少目标市场代码、品类信息，或该市场的文化知识图谱规则尚未由专家维护时不要用，先补规则库与市场参数。
- 何时不用：只做文案风格的文化维度适配用「跨文化内容自动适配」；只做跨语言关键词匹配用「跨文化营销适配」；只做语言翻译用「多语言 Listing 生成」。
- 能力边界：只做风险识别与文化重写建议，不替代目标国法律意见；知识图谱需专家维护而非自动学习，needs_human_review 为真时必须人工复核后才可上架。
- 安全边界：文案不得保留不可证实声明（如「No.1 in the US」）与夸大功效表述（如让宝宝更聪明），替换不得引入新的违规宣称；原案例中德国 UWG 单次罚款 EUR 1,000-5,000，落地须按当地法规复核。

## 技能关联

- **前置**：Skill-A-Plus-Content-Template-Engine.html、Skill-A-Plus-Content-Template-Engine、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Multilingual-Listing-Generation.html、Skill-Multilingual-Listing-Generation、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification
- **延伸**：Skill-A-Plus-Content-Template-Engine.html、Skill-A-Plus-Content-Template-Engine、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization
- **可组合**：Skill-A-Plus-Content-Template-Engine.html、Skill-A-Plus-Content-Template-Engine、Skill-Cross-Market-Content-Localization

---

> 分类：业务运营/渠道经营/本地化　·　技术族：20-AI视频生成　·　源卡：`Skill-Cross-Market-Content-Localization`