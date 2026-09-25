---
name: "p2s-digital-wellbeing-screen-time-model"
title: "Digital Wellbeing Screen Time Model — 数字健康屏幕时间建模（婴幼儿数字暴露伦理）"
description: "触发词：屏幕时间、数字健康评分、婴幼儿使用时长、AAP 合规提醒、替代活动推荐。何时不用：家长使用教学与产品教育内容不属本技能；本技能只按时长与月龄算健康分并给提醒。安全边界：儿童使用数据仅用于个性化提醒、不对外分享，须满足 COPPA 与家长知情同意。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-116"
l3_business: "使用教育"
l3_all: "使用教育"
l1_l2_l3: "业务运营/服务与体验/使用教育"
p2s_card_id: "Skill-Digital-Wellbeing-Screen-Time-Model"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "按宝宝月龄给出每天屏幕时间上限和健康分，超时就提醒家长，并推荐线下亲子活动替代。"
user_try: "试试：用我们 App 的使用日志按宝宝月龄算数字健康分，对超标的家庭给出提醒和建议。"
whenToUse: "当婴幼儿 App 或平台需要按 AAP 月龄阈值做使用时长提醒与替代活动推荐时用；需要运营促活或推送策略时不属本技能。"
workflow: "采集用户 App 使用日志（时段、时长、功能）与宝宝月龄 → 按 AAP 月龄阈值计算数字健康评分 → 对超限用户生成个性化提醒与替代活动推荐 → 用 A/B 测试校准提醒频率，避免用户关闭通知"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Digital Wellbeing Screen Time Model — 数字健康屏幕时间建模（婴幼儿数字暴露伦理）

## ① 解决的问题

产品团队面临"婴幼儿App无数字健康功能导致家长担忧并卸载"——AAP指南合规屏幕时间提醒减少卸载率，年化保留用户价值10-20万元

## ② 核心算法逻辑

AAP（美国儿科学会）建议18个月以下婴儿避免屏幕暴露（视频通话除外），25岁每天不超过1小时。母婴App/平台需要在产品设计上体现数字健康理念——追踪亲子互动时间、发出使用时长提醒、推荐线下活动替代。本Skill提供用户数字健康评分模型（基于App使用日志）和家长友好提醒系统。

## ③ 业务应用场景

场景1：婴儿成长App数字健康功能设计 - 业务问题：App使用时间超标（日均>30分钟），需要提醒家长但不能影响核心使用体验 - 数据要求：用户App使用日志（时段/时长/功能）+ 宝宝月龄 - 预期产出：数字健康评分（0-100）+ 个性化使用建议 + 替代活动推荐 - 业务价值：数字健康功能提升家长信任度，减少删除率，年化保留价值10-20万元
**三轨验证**： - 成本：功能开发约5人天，无额外成本 - 合规：数据仅用于个性化提醒，不对外分享，满足COPPA - 风险：过于频繁提醒可能导致用户关闭通知，需A/B测试最优频率

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：数字健康功能提升家长信任度，减少删除率，年化保留价值10-20万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：产品团队面临'婴幼儿App无数字健康功能导致家长担忧并卸载'——屏幕时间健康模型提供AAP合规提醒，减少删除率，年化保留价值10-20万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（35 行）。**下面 35 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **35 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，35 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from datetime import datetime, timedelta

def calculate_screen_health_score(usage_minutes: list, 
                                   baby_age_months: int) -> dict:
    # AAP指南阈值
    if baby_age_months < 18:
        daily_limit = 0  # 应避免所有屏幕（视频通话除外）
        guideline = "AAP: 避免屏幕暴露（18个月以下）"
    elif baby_age_months < 60:
        daily_limit = 60  # 每天最多60分钟
        guideline = "AAP: 每天不超过60分钟（2-5岁）"
    else:
        daily_limit = 120
        guideline = "AAP: 每天不超过2小时（6岁以上）"
    
    avg_daily = sum(usage_minutes) / max(len(usage_minutes), 1)
    if daily_limit == 0:
        score = max(0, 100 - avg_daily * 5)
    else:
        score = max(0, 100 - max(0, avg_daily - daily_limit) * 2)
    
    return {
        "health_score": round(score, 1),
        "avg_daily_minutes": round(avg_daily, 1),
        "daily_limit_minutes": daily_limit,
        "guideline": guideline,
        "alert": avg_daily > daily_limit,
        "recommendation": f"建议将每日使用控制在{daily_limit}分钟内" if daily_limit > 0 else "建议避免屏幕暴露",
    }

# 测试：8个月宝宝，平均每天用了15分钟
result = calculate_screen_health_score([20, 10, 15, 18, 12], baby_age_months=8)
print(f"健康分: {result['health_score']} | 告警: {result['alert']}")
assert result["alert"] == True  # 8个月宝宝有任何屏幕时间都应告警
print("[✓] Digital Wellbeing Screen Time Model 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户 App 使用日志（时段、时长、功能）与宝宝月龄；粒度为单用户日级明细，可按周或月聚合。

**输出**：0-100 数字健康评分、日均使用分钟数、当月龄对应限度、告警位与建议文案，供产品端做提醒与家长沟通。

## 执行步骤

1. 汇总每位用户的使用时长与宝宝月龄
2. 按 AAP 月龄阈值计算数字健康评分
3. 标记超限用户并生成提醒文案
4. 推荐线下亲子活动作为替代方案
5. 通过 A/B 测试调整提醒频率

## 边界与不做

- 何时不用：缺少使用日志或宝宝月龄时，无法判定适用阈值与超限状态
- 能力边界：只做健康评分与提醒建议，不给医疗或发育结论，也不替代儿科医生意见

## 技能关联

- **可组合**：Skill-Digital-Wellbeing-Screen-Time-Model

---

> 分类：业务运营/服务与体验/使用教育　·　技术族：11-AI人文　·　源卡：`Skill-Digital-Wellbeing-Screen-Time-Model`