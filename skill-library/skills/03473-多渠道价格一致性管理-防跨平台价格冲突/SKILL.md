---
name: "p2s-multi-channel-price-consistency"
title: "Multi-Channel Price Consistency — 多渠道价格一致性管理（防跨平台价格冲突）"
description: "触发词：价格一致性、多渠道比价、Buy Box 风险、价格奇偶检查、跨平台冲突、底价保护。何时不用：跨国家站点的 PPP 价差治理用「跨境价格协调」；汇率驱动的毛利问题用「汇率联动动态定价」。安全边界：调价须在平台允许范围内、不得低于 MSRP，并设底价保护以防引发价格战。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Multi-Channel-Price-Consistency"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "盯住 Amazon、TikTok、独立站之间的价差：一旦超过阈值就预警并给整改建议，别让 Buy Box 掉。"
user_try: "试试：我的 TikTok 促销价 25.99、Amazon 29.99、独立站 28.99，帮我算偏差、给 Buy Box 风险等级和调价建议。"
whenToUse: "当同一商品在多个渠道（Amazon、TikTok、独立站）并行销售、价差可能触发平台价格检查导致 Listing 被抑制时用本技能；若价差发生在不同国家站点之间，用「跨境价格协调」；若问题源于汇率，用「汇率联动动态定价」。"
workflow: "按小时采集各渠道价格快照与 Amazon Buy Box 状态 → 按阈值（默认 3%）检测低于 Amazon 价的违规渠道 → 输出价格偏差预警与 Buy Box 风险评分 → 给出调价建议并校验不低于 MSRP"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Channel Price Consistency — 多渠道价格一致性管理（防跨平台价格冲突）

## ① 解决的问题

运营面临"多渠道促销导致Amazon价格奇偶检查触发Buy Box丢失"——价格一致性实时监控将Buy Box丢失事件减少90%，年化保护销售额30-60万元

## ② 核心算法逻辑

多渠道销售时，Amazon/TikTok/独立站的价格差异超过阈值（通常3%）会触发Amazon价格奇偶检查，导致Listing被抑制（Buy Box丢失）。价格一致性管理系统：实时监控各渠道价格，检测偏差，自动触发调价建议，优先保护Amazon Buy Box。

## ③ 业务应用场景

场景1：母婴奶粉Amazon+TikTok双渠道价格管理 - 业务问题：TikTok促销降价导致Amazon价格奇偶检查触发，Buy Box丢失3天，损失约8万元 - 数据要求：各渠道价格快照（每小时）+ Amazon Buy Box状态 - 预期产出：价格偏差预警报告 + 自动调价建议 + Buy Box风险评分 - 业务价值：防止Buy Box丢失，年化保护销售额30-60万元
**三轨验证**： - 成本：价格监控API约1000元/月 - 合规：调价需在平台允许范围内，不得低于MSRP - 风险：自动调价可能引发价格战，需设置底价保护

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：防止Buy Box丢失，年化保护销售额30-60万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：防止Buy Box丢失，年化保护销售额30-60万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（7 行）。**下面 7 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **7 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，7 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
prices = {"amazon": 29.99, "tiktok": 25.99, "shopify": 28.99}
amazon_price = prices["amazon"]
violations = [(ch, p) for ch, p in prices.items() if ch != "amazon" and abs(p - amazon_price) / amazon_price > 0.03]
risk = "HIGH" if any(p < amazon_price for _, p in violations) else ("MEDIUM" if violations else "LOW")
print(f"价格偏差违规: {violations} | Buy Box风险: {risk}")
assert risk in ["HIGH", "MEDIUM", "LOW"]
print("[✓] Multi-Channel Price Consistency 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：各渠道实时价格快照（建议每小时一次）与 Amazon Buy Box 状态；粒度为 SKU × 渠道 × 时间点。

**输出**：价格偏差违规清单、Buy Box 风险评分与调价建议；供多渠道运营调整促销价，避免 Listing 被抑制。

## 执行步骤

1. 按小时采集各渠道价格快照与 Buy Box 状态
2. 按阈值检测低于 Amazon 价的渠道违规
3. 输出价格偏差预警与 Buy Box 风险评分
4. 给出调价建议并校验不低于 MSRP 与底价

## 边界与不做

- 数据不满足：没有小时级价格快照与 Buy Box 状态时只能事后追责，事前防不住。
- 何时不用：跨国家站点价差用「跨境价格协调」；汇率驱动的调整用「汇率联动动态定价」。
- 能力边界：只做监控、预警与建议，不含自动改价，也不保证平台价格检查一定不触发。
- 安全边界：调价须在平台允许范围内、不得低于 MSRP，并设底价保护以防价格战。

## 技能关联

- **可组合**：Skill-Multi-Channel-Price-Consistency

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Multi-Channel-Price-Consistency`