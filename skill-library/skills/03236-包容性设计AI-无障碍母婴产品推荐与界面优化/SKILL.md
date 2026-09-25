---
name: "p2s-inclusive-design-accessibility-ai"
title: "Inclusive Design Accessibility AI — 包容性设计AI（无障碍母婴产品推荐与界面优化）"
description: "触发词：无障碍审计、WCAG 合规、对比度检查、屏幕阅读器、可用性验证。何时不用：要审计 AI 助手自身的安全红线用「Responsible AI Red Teaming」；要检查推荐与定价算法的群体公平性用「AI 算法偏见审计」。安全边界：自动扫描结论不能替代人工无障碍审计与法律意见，合规评分不得当作免责依据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-031"
l3_business: "可用性验证"
l3_all: "可用性验证"
l1_l2_l3: "业务运营/产品与创新/可用性验证"
p2s_card_id: "Skill-Inclusive-Design-Accessibility-AI"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按 WCAG 2.1 检查母婴 App 与页面的对比度、字号和点击区域，把无障碍问题列成可改的清单，降低被投诉与诉讼的风险。"
user_try: "试试：扫描这个母婴购物 App 的界面截图和组件代码，输出 WCAG 2.1 合规评分与修复清单。"
whenToUse: "要对界面或 App 做无障碍合规检查、且需要可执行的修复清单时用本技能；若要审计模型回答本身的安全边界，用「Responsible AI Red Teaming」；若要检查算法输出的群体公平性，用「AI 算法偏见审计」。"
workflow: "收集界面截图、组件代码与屏幕阅读器测试报告 → 按 WCAG 2.1 AA 检查对比度、字号与点击目标尺寸 → 检查图片替代文本与语音导航可用性 → 输出合规评分、问题清单与修复建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Inclusive Design Accessibility AI — 包容性设计AI（无障碍母婴产品推荐与界面优化）

## ① 解决的问题

设计团队面临"母婴App被视障用户投诉无障碍缺失面临ADA诉讼风险"——WCAG合规扫描识别95%无障碍问题，年化防范法律诉讼风险20-50万元

## ② 核心算法逻辑

包容性设计确保产品对所有用户可用，包括视障、听障、运动障碍和认知障碍用户。母婴场景中，新手父母常处于单手操作（抱婴儿）、弱光环境（夜间喂奶）、焦虑状态等特殊情境。AI驱动的无障碍优化：自动检测界面对比度/字号/点击目标尺寸，推荐内容自动添加图片描述，语音导航优化。WCAG 2.1 AA标准是欧美合规基准。

## ③ 业务应用场景

场景1：母婴购物App无障碍合规优化 - 业务问题：App被视障用户投诉屏幕阅读器无法识别产品图片，导致差评和删除 - 数据要求：界面截图 + 组件代码 + 屏幕阅读器测试报告 - 预期产出：WCAG 2.1合规评分 + 具体问题清单 + 修复建议 - 业务价值：无障碍合规降低法律诉讼风险（美国ADA诉讼增加），年化防范价值20-50万元
**三轨验证**： - 成本：自动化扫描工具约1000元/年，人工审计约3人天/次 - 合规：美国ADA要求公共网站无障碍，违规可被起诉 - 风险：修复部分功能可能影响视觉美观，需设计与无障碍平衡

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：无障碍合规降低法律诉讼风险（美国ADA诉讼增加），年化防范价值20-50万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：设计团队面临'母婴App被视障用户投诉无障碍缺失面临ADA诉讼风险'——AI无障碍扫描将WCAG合规问题识别率提升95%，年化防范法律风险20-50万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（28 行）。**下面 28 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **28 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，28 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
def wcag_contrast_check(foreground_hex: str, background_hex: str) -> dict:
    """检查文字对比度是否满足WCAG 2.1 AA标准（最低4.5:1）"""
    def hex_to_rgb(h):
        h = h.lstrip("#")
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
    
    def relative_luminance(rgb):
        srgb = [c/255 for c in rgb]
        linear = [c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4 for c in srgb]
        return 0.2126*linear[0] + 0.7152*linear[1] + 0.0722*linear[2]
    
    fg_l = relative_luminance(hex_to_rgb(foreground_hex))
    bg_l = relative_luminance(hex_to_rgb(background_hex))
    lighter, darker = max(fg_l, bg_l), min(fg_l, bg_l)
    ratio = (lighter + 0.05) / (darker + 0.05)
    
    return {
        "contrast_ratio": round(ratio, 2),
        "wcag_aa_pass": ratio >= 4.5,    # 正文文字
        "wcag_aaa_pass": ratio >= 7.0,   # 增强标准
        "recommendation": "合规" if ratio >= 4.5 else f"需提升对比度（当前{ratio:.1f}:1，最低需4.5:1）",
    }

# 测试：浅灰文字在白背景（常见设计错误）
result = wcag_contrast_check("#999999", "#ffffff")
print(f"对比度: {result['contrast_ratio']}:1 | AA合规: {result['wcag_aa_pass']}")
assert not result["wcag_aa_pass"]  # 灰色文字不满足WCAG AA
print("[✓] Inclusive Design Accessibility AI 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待检界面的截图 + 组件代码，以及屏幕阅读器测试报告；建议覆盖主要页面与关键购买路径。

**输出**：WCAG 2.1 合规评分、逐条问题清单与修复建议，供设计与前端团队整改，也用于评估 ADA 诉讼风险的暴露面。

## 执行步骤

1. 收集界面截图、组件代码与屏幕阅读器报告
2. 计算文字与背景对比度是否满足 WCAG AA 标准
3. 检查字号、点击目标尺寸与图片替代文本
4. 汇总问题清单并给出修复建议
5. 输出 WCAG 合规评分供整改验收

## 边界与不做

- 只有设计稿、拿不到真实界面与辅助技术测试结果时，结论只能作为初筛
- 自动扫描覆盖不到认知与操作流程问题，也不能替代人工无障碍审计与法律意见
- 修复可能影响视觉美观，需与设计权衡，本技能不做取舍决策

## 技能关联

- **可组合**：Skill-Inclusive-Design-Accessibility-AI

---

> 分类：业务运营/产品与创新/可用性验证　·　技术族：11-AI人文　·　源卡：`Skill-Inclusive-Design-Accessibility-AI`