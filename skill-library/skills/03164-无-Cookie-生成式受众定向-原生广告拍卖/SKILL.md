---
name: "p2s-generative-audience-llm-auction"
title: "GenAI Advertising — 无 Cookie 生成式受众定向 & LLM 原生广告拍卖"
description: "触发词：生成式受众、零样本画像、LLM 原生广告、无 Cookie 定向、意图推断、实时出价。何时不用：用户已授权且可用传统 ID 定向时不必上生成式链路；出价与库存撮合需要确定性执行时仍走传统竞价系统。安全边界：查询文本属个人信息，画像推断不得用于敏感属性歧视，广告内容需符合广告法、不臆造功效。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 搜索意图分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Generative-Audience-LLM-Auction"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "访客没有 Cookie 时，用大模型即时读懂问题意图，再匹配合适的商品与广告。"
user_try: "试试：匿名访客问海边婚礼穿搭，帮我用生成式受众方案匹配商品和广告出价。"
whenToUse: "无法依赖 Cookie 或 ID 图谱、但有自然语言查询与 SKU 库时用本技能；用户在授权范围内可做传统定向时用常规受众方案；需要严格效果归因时先补实验设计。"
workflow: "接入自然语言查询与 SKU 库 → 用零样本画像推断意图、紧急度与场景标签 → 在竞价引擎中按相关度与出价排序候选广告 → 生成带商品卡片的自然语言回答 → 按点击与反馈更新体验权重"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GenAI Advertising — 无 Cookie 生成式受众定向 & LLM 原生广告拍卖

## ① 解决的问题

匿名访客（未授权追踪）向 AI 助手提问穿搭，传统推荐因无 Cookie 完全失效，品牌白白流失高意图实时流量 - 数据要求：用户自然语言查询文本 + SKU 库（含品类、场景标签、图片描述）+ 广告主实时出价 - GenAI 方案： - 用户问："我下周去海边参加婚礼，梨形身材，有什么建议

## ② 核心算法逻辑

传统精准广告的灵魂是 Cookie + Lookalike：先用第三方 Cookie 追踪用户跨站行为，再用 ID 图谱做 Lookalike 扩量。ATT 政策与浏览器全面禁 Cookie 后，这套体系近乎瘫痪。本框架用两个生成式 AI 模块彻底重构广告链路：

## ③ 业务应用场景

- 业务问题：匿名访客（未授权追踪）向 AI 助手提问穿搭，传统推荐因无 Cookie 完全失效，品牌白白流失高意图实时流量 - 数据要求：用户自然语言查询文本 + SKU 库（含品类、场景标签、图片描述）+ 广告主实时出价 - GenAI 方案： - 用户问："我下周去海边参加婚礼，梨形身材，有什么建议？" - ZeroShotProfiler 推断：`intent=wedding_attire, urgency=0.85, tags=[body_type:pear, occasion:wedding, scenario:beach]` - LLMAuctionEngine 在高腰长裙、防晒
- 业务问题：新手父母在 APP 内 AI 频道提问育儿问题，品牌无法在不追踪用户的前提下匹配合适的广告商 - 数据要求：用户问题文本 + 奶粉/辅食/护理品牌出价 + SKU 特性描述 - GenAI 方案： - 用户问："两个月宝宝换奶粉不适应，推荐进口奶粉？" - 画像推断：`intent=infant_formula, tags=[lifecycle:new_parent]` - 拍卖结果：有机奶粉品牌出价最高且相关度最强（reward=0.88），同步附出益生菌滴剂作为交叉销售 - LLM 回答中自然插入商品卡片，标注"适合0-6月龄"等关键信息 - 预期产出：每条 AI 回答带出

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

15 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（29 行）。**下面 29 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **29 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，29 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/generative_audience_llm_auction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Generative-Audience-LLM-Auction.md`），已与卡面节选核对，不依赖上述路径。

```python
from paper2skills_code.营销投放分析.generative_audience_2025.model import (
    UserContext,
    AdCandidate,
    GenerativeAudienceAdSystem,
)

system = GenerativeAudienceAdSystem(alpha=0.6)

ctx = UserContext(
    query_text="我下周要去海边参加朋友的婚礼，但我是梨形身材，有什么穿搭建议吗？",
    session_id="anon-001",
)
ads = [
    AdCandidate("ad-001", "法式高腰长裙 A款", "fashion_dress",
                bid_price=5.0, relevance_score=0.92,
                native_snippet="高腰设计完美修饰梨形身材，海风也吹不乱"),
    AdCandidate("ad-002", "防水防晒霜 SPF50", "suncare",
                bid_price=3.5, relevance_score=0.75,
                native_snippet="海边外拍专用，持妆8小时不脱妆"),
]

profile, result = system.serve(ctx, ads)
print(f"受众画像: {profile.intent}, urgency={profile.urgency:.2f}")
print(f"拍卖赢家: {result.winner_ad.sku}, reward={result.reward_score:.3f}")
print(f"原生回答:\n{result.native_response}")

# 用户未点击 → 更新 alpha，增加用户体验权重
system.auction_engine.update_alpha(user_clicked=False)
print("[✓] Generative Audience LLM A 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.10551 — LLM-Auction: Generative Auction towards LLM-Native Advertising

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户自然语言查询文本、SKU 库（含品类、场景标签、图片描述等）、广告主实时出价，以及可用于画像推断的模型服务。

**输出**：查询意图与画像标签、候选广告排序与拍卖结果、带标注的商品卡片内容，以及按反馈迭代的权重；供广告与内容团队在无 Cookie 环境下承接高意图流量。

## 执行步骤

1. 接入自然语言查询与 SKU 库
2. 用零样本画像推断意图、紧急度与场景标签
3. 在竞价引擎中按相关度与出价排序候选广告
4. 生成带商品卡片的自然语言回答
5. 按点击与反馈更新体验权重

## 边界与不做

- 何时不用：用户已在授权范围内可做 ID 定向、或只需传统关键词竞价时，不必引入生成式受众链路。
- 能力边界：本技能产出画像、排序与文案素材，真正的出价与库存撮合仍由平台竞价系统执行。
- 合规边界：查询文本属个人信息，画像推断不得用于敏感属性歧视，广告内容需符合广告法、不得臆造功效。

## 技能关联

- **前置**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Facebook-Audience-Lookalike-Scaling.html、Skill-Facebook-Audience-Lookalike-Scaling、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness
- **延伸**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Facebook-Audience-Lookalike-Scaling.html、Skill-Facebook-Audience-Lookalike-Scaling、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness
- **可组合**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Facebook-Audience-Lookalike-Scaling.html、Skill-Facebook-Audience-Lookalike-Scaling、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness、Skill-Generative-Audience-LLM-Auction

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Generative-Audience-LLM-Auction`