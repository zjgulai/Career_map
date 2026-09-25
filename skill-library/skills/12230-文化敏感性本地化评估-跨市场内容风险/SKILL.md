---
name: "p2s-ai-cultural-sensitivity-localization"
title: "AI Cultural Sensitivity Localization — AI文化敏感性本地化评估（跨市场内容风险）"
description: "触发词：文化敏感性扫描、跨市场内容风险、禁忌元素识别、本地化审核、上线前风险评分。何时不用：要审查的是翻译质量与本地化语言自然度，不是文化冒犯风险的专项审查。安全边界：文化判断存在主观性，输出仅作初筛，必须结合当地合规团队复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-084"
l3_business: "市场语境审查"
l3_all: "市场语境审查 / 本地化"
l1_l2_l3: "业务运营/渠道经营/市场语境审查"
p2s_card_id: "Skill-AI-Cultural-Sensitivity-Localization"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "上新前先扫一遍图文有没有踩当地文化禁忌，别等上线后被迫紧急下架。"
user_try: "试试：扫描这套婴儿辅食图文，分别按中东、日本、德国市场给出文化风险评分和需要改的点。"
whenToUse: "当同一套图文要投放到多个文化差异较大的市场、需要在选品或上线前筛查文化冒犯风险时用本技能；若关注的是翻译质量与语言表达，则不属于本技能的专项范围。"
workflow: "整理待上线素材与目标市场清单 → 载入各市场文化敏感词与禁忌知识库 → 逐市场扫描文案与图片描述并记录触发点 → 输出评分、冒犯点与修改建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI Cultural Sensitivity Localization — AI文化敏感性本地化评估（跨市场内容风险）

## ① 解决的问题

品牌团队面临"产品图文进入新市场后因文化冒犯导致紧急下架危机"——多市场文化敏感性扫描将跨市场内容风险识别率提升80%，年化节省危机公关成本20-40万元

## ② 核心算法逻辑

母婴产品在跨境市场（美/欧/日/中东）面临文化敏感性差异：婴儿饮食禁忌（穆斯林清真认证）、育儿理念差异（美式自主睡眠 vs 日式共睡文化）、颜色禁忌（白色在日本代表丧葬）、手势/姿势禁忌等。AI文化敏感性评估通过多维度文化知识库+图像/文字分析，在上线前识别潜在冒犯内容。

## ③ 业务应用场景

场景1：婴儿辅食产品进入中东市场内容合规 - 业务问题：产品图片中婴儿抱着猪形状玩具，进入穆斯林市场时引发投诉 - 数据要求：产品图片/文案 + 目标市场（US/EU/JP/ME/CN）+ 文化知识库 - 预期产出：文化敏感性风险报告（每市场评分）+ 具体冒犯点 + 修改建议 - 业务价值：提前规避文化冒犯，避免上线后紧急下架，年化节省危机公关成本20-40万元
**三轨验证**： - 成本：文化知识库维护约1人/半年，单次扫描成本极低 - 合规：文化判断存在主观性，建议结合当地合规团队复核 - 风险：过度谨慎可能导致内容过于中性，失去文化特色

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：提前规避文化冒犯，避免上线后紧急下架，年化节省危机公关成本20-40万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：品牌团队面临'产品图文进入新市场后因文化冒犯导致紧急下架危机'——AI文化敏感性扫描将跨市场内容风险识别率提升80%，年化节省危机公关成本20-40万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（34 行）。**下面 34 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **34 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，34 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
def cultural_sensitivity_scan(content: str, images_desc: list, 
                                  target_market: str) -> dict:
    CULTURAL_RISKS = {
        "ME":  # 中东穆斯林市场
            ["pig", "pork", "alcohol", "wine", "beer", "lard", "猪", "酒"],
        "JP":  # 日本市场
            ["white mourning", "four death", "nine suffering"],
        "CN":  # 中国市场
            ["clock gift death", "green hat", "umbrella breakup"],
        "DE":  # 德国市场
            ["nazi symbols", "extreme nationalism"],
    }
    risks = []
    market_patterns = CULTURAL_RISKS.get(target_market, [])
    content_lower = content.lower()
    for pattern in market_patterns:
        if pattern.lower() in content_lower:
            risks.append({"trigger": pattern, "market": target_market})
    for img in images_desc:
        for pattern in market_patterns:
            if pattern.lower() in img.lower():
                risks.append({"trigger": f"image:{pattern}", "market": target_market})
    score = max(0, 100 - len(risks) * 25)
    return {"market": target_market, "sensitivity_score": score,
            "risks": risks, "pass": score >= 70}

result = cultural_sensitivity_scan(
    "Our baby formula contains no pork derivatives",
    ["baby holding pig plush toy"],
    "ME"
)
print(f"中东市场评分: {result['sensitivity_score']} | 风险: {result['risks']}")
assert not result["pass"]
print("[✓] AI Cultural Sensitivity Localization 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待上线的产品文案与图片描述、目标市场标识（卡页支持 US/EU/JP/ME/CN 等）、各市场文化敏感词与禁忌知识库；粒度为单品或单素材 × 目标市场。

**输出**：分市场的文化敏感性评分、具体冒犯点清单（触发词与图片元素）与修改建议；作为上线前的风险报告，供品牌团队与当地合规团队复核。

## 执行步骤

1. 整理待上线素材（文案 + 图片描述）与目标市场清单
2. 载入各市场文化敏感词与禁忌知识库（如中东的猪与酒相关元素、日本的颜色与数字禁忌）
3. 逐市场扫描文案与图片描述，命中即记录触发点
4. 计算各市场敏感性评分并给出上线门槛结论
5. 输出冒犯点清单与修改建议，交当地团队复核

## 边界与不做

- 数据不满足：没有目标市场的文化知识库，或图片只有 URL 没有描述时扫描无从下手，先补素材与词典。
- 何时不用：要审查的是翻译质量与本地化语言自然度，不是文化冒犯风险的专项审查。
- 能力边界：文化判断存在主观性，输出只是初筛评分，必须结合当地合规团队复核；过度保守会让内容失去文化特色；卡页的年化节省公关成本 20-40 万元为案例口径。

## 技能关联

- **可组合**：Skill-AI-Cultural-Sensitivity-Localization

---

> 分类：业务运营/渠道经营/市场语境审查　·　技术族：11-AI人文　·　源卡：`Skill-AI-Cultural-Sensitivity-Localization`