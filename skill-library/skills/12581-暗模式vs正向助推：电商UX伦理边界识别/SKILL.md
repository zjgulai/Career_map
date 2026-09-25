---
name: "p2s-nudge-architecture-ethics"
title: "Nudge Architecture Ethics — 暗模式vs正向助推：电商UX伦理边界识别"
description: "触发词：暗模式、UX 伦理、虚假倒计时、预勾选订阅、强迫续订、退款率。何时不用：要扫文案违禁宣称时用「Amazon ToS 合规护栏」，要多市场广告法规差异时用「多市场广告文案合规矩阵」。安全边界：审计结论为改进建议，不代替 FTC 判定，也不得用暗模式规避消费者取消权。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-132"
l3_business: "宣称审查"
l3_all: "宣称审查"
l1_l2_l3: "独立控制/财务与合规/宣称审查"
p2s_card_id: "Skill-Nudge-Architecture-Ethics"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "订阅页那些假倒计时、预勾选年付、藏起来的取消按钮，先算清伦理风险分再改，别等投诉和退款堆起来。"
user_try: "试试：审一下这个奶粉订阅页的设计，检测暗模式并给出伦理风险分和合规改造建议。"
whenToUse: "订阅页或活动页 UX 可能使用误导性设计、需要量化伦理风险并整改时用；要扫文案违禁宣称时用「Amazon ToS 合规护栏」；要比较多市场广告法规差异时用「多市场广告文案合规矩阵」。"
workflow: "收集 UX 设计稿、A/B 测试数据、满意度与退款率 → 逐项检测暗模式（虚假倒计时、预勾选、隐藏取消等） → 按扣分规则计算伦理风险分与等级 → 给出合规改造建议 → 跟踪改造后退款率与转化率变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Nudge Architecture Ethics — 暗模式vs正向助推：电商UX伦理边界识别

## ① 解决的问题

运营面临"订阅页暗模式导致FTC投诉和高退款率损害品牌信誉"——UX伦理审计识别暗模式并修复，退款率降低45%，年化减少成本15-25万元

## ② 核心算法逻辑

助推架构（Nudge Architecture）将用户决策环境设计分为正向助推（帮助用户做出符合自身利益的选择）和暗模式（操纵用户违背自身利益）。本Skill提供母婴电商UX设计的伦理边界识别框架：稀缺性倒计时是否真实？默认选项是否以用户利益为中心？FTC和英国CMA均已开始执法针对电商暗模式（2023年起）。检测方法：对比UX设计意图与实际用户行为数据的偏差，若用户完成操作后满意度低但转化率高 = 暗模式信号。

## ③ 业务应用场景

场景1：婴儿奶粉订阅页面UX伦理审计 - 业务问题：订阅页面使用虚假倒计时和预勾选年度套餐，导致大量用户投诉和退款，FTC收到举报 - 数据要求：UX设计稿 + A/B测试数据 + 用户满意度评分 + 退款率 - 预期产出：UX伦理风险报告（暗模式检测得分0-100）+ 合规改造建议 - 业务价值：修复暗模式后退款率降低45%，年化减少退款成本15-25万元
**三轨验证**： - 成本：UX设计审计约2人天，FTC合规咨询约5000元 - 合规：FTC 2023年指南明确禁止虚假稀缺性和预勾选订阅 - 风险：过度纠正可能降低转化率，需在伦理和商业之间找平衡点

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：修复暗模式后退款率降低45%，年化减少退款成本15-25万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：运营面临'订阅页暗模式导致FTC投诉和高退款率'——伦理UX审计将暗模式风险评分量化，修复后退款率降低45%，年化减少成本15-25万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（24 行）。**下面 24 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **24 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，24 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
# 暗模式检测评分（简化版）
def detect_dark_patterns(ux_features: dict) -> dict:
    penalties = {
        "fake_countdown": 30,      # 虚假倒计时
        "pre_checked_subscribe": 20,  # 预勾选订阅
        "hidden_cancel_button": 25,   # 隐藏取消按钮
        "forced_continuity": 20,      # 强制续订
        "disguised_ads": 15,          # 伪装广告
    }
    score = 100
    detected = []
    for pattern, penalty in penalties.items():
        if ux_features.get(pattern, False):
            score -= penalty
            detected.append(pattern)
    return {"ethics_score": max(score, 0), "dark_patterns": detected,
            "risk_level": "HIGH" if score < 60 else ("MEDIUM" if score < 80 else "LOW")}

features = {"fake_countdown": True, "pre_checked_subscribe": True,
            "hidden_cancel_button": False, "forced_continuity": False}
result = detect_dark_patterns(features)
print(f"伦理评分: {result['ethics_score']} | 检测到: {result['dark_patterns']}")
assert result["risk_level"] == "HIGH"
print("[✓] Nudge Architecture Ethics 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：UX 设计稿、A/B 测试数据、用户满意度评分、退款率数据，以及暗模式特征位（虚假倒计时、预勾选订阅、隐藏取消按钮、强制续订、伪装广告）；粒度：单个页面或单次订阅流程。

**输出**：UX 伦理风险报告：暗模式检测得分（0-100）、命中的暗模式清单与风险等级（HIGH/MEDIUM/LOW）及合规改造建议；供运营与设计整改，卡页记录修复后退款率降低 45%。

## 执行步骤

1. 收集设计稿、A/B 数据与退款率
2. 逐项检测暗模式特征
3. 按扣分规则计算伦理风险分
4. 给出合规改造建议
5. 跟踪改造后退款率与转化率变化

## 边界与不做

- 数据不满足时不用：没有设计稿、或拿不到退款率与满意度数据时，风险分无法与实际影响关联。
- 能力边界：只做暗模式识别与改造建议，不代替 FTC 合规判定；过度纠正可能降低转化率，需在伦理与商业之间权衡。
- 合规边界：不得以保留或变相保留暗模式来维持转化（虚假稀缺性、预勾选订阅等已被 FTC 2023 年指南明确禁止）。

## 技能关联

- **可组合**：Skill-Nudge-Architecture-Ethics

---

> 分类：独立控制/财务与合规/宣称审查　·　技术族：11-AI人文　·　源卡：`Skill-Nudge-Architecture-Ethics`