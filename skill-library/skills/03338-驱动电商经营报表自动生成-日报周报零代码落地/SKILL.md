---
name: "p2s-llm-ecommerce-report-automation"
title: "LLM 驱动电商经营报表自动生成 — 日报/周报零代码落地"
description: "触发词：日报周报、报表自动化、飞书推送、异常标注、行动建议。何时不用：需要假设与验证式推理分析用「LLM 商业智能推理」；要做目标达成与差异分解用「生意规模三维 KPI 监控」。安全边界：报告中的数字必须由代码计算并做一致性校验，LLM 不得凭空生成或改写数字。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-003"
l3_business: "月度经营复盘"
l3_all: "月度经营复盘 / 经营预测"
l1_l2_l3: "经营管理/经营与组织/月度经营复盘"
p2s_card_id: "Skill-LLM-Ecommerce-Report-Automation"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 SKU 周度数据自动写成结构化日报周报，标出异常 SKU 并推送，省掉几小时手工整理。"
user_try: "试试：用这周 50 多个 SKU 的数据自动生成周报，标出异常 SKU 并给三条行动建议。"
whenToUse: "当要按固定模板、固定时间产出经营报表并推送到协作工具时用本技能；需要推理式深度分析，用「LLM 商业智能推理」；要做目标达成与差异分解，用「生意规模三维 KPI 监控」。"
workflow: "汇总 SKU 级周度指标并计算同比 → 由代码判定异常 SKU 并生成关键数字 → 让 LLM 生成结构化 Markdown 叙述与优先行动建议 → 校验报告数字与源数据一致后按渠道推送"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM 驱动电商经营报表自动生成 — 日报/周报零代码落地

## ① 解决的问题

运营面临"每天手动整理销售数据制作日报耗时2-3小时"——LLM自动报告生成将日报制作时间从150分钟压缩至5分钟，年化节省运营人力成本15-25万元

## ② 核心算法逻辑

LLM 驱动的电商报表自动生成，核心是「数据结构化 → 模板感知 → 自然语言叙述」三阶段流水线。与传统 BI 工具的区别在于：LLM 不只填充数字，而是识别异常、生成归因解释、给出行动建议。

## ③ 业务应用场景

场景1：Amazon 母婴 SKU 周报自动生成 - 业务问题：运营每周手工整理 50+ SKU 的销售数据需 3-4 小时，且叙述质量参差不齐 - 数据要求：SKU 级周度 GMV、转化率、广告 ROAS、库存天数、退货率；上周同比数据 - 预期产出：结构化 Markdown 周报，含异常 SKU 自动标注 + 3 条优先行动建议 - 业务价值：节省每周 3 小时人工，报告一致性提升，异常响应时间从 T+2 缩短至 T+0
场景2：TikTok Shop 日报推送 - 业务问题：TikTok 投放数据碎片化，每日复盘无固定模板，新人难以独立完成 - 数据要求：直播间实时 GMV、点击率、成交转化漏斗、达人带货排名 - 预期产出：每晚 22:00 自动推送飞书日报卡片，含当日亮点与次日调整建议 - 业务价值：人效提升，新人上手周期从 2 周缩短至 3 天
**三轨验证**： - 成本：GPT-4o-mini 每份报告约 $0.02，月成本 <$20 - 合规：不含个人数据，仅汇总指标，无隐私风险 - 风险：数字由代码生成，LLM 仅写叙述，规避幻觉核心风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：节省每周 3-4 小时运营人工，按月化算约节省 0.5 人天/周；报告一致性提升减少决策歧义
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：实施门槛低（无需模型训练），对中小团队运营效率提升立竿见影；TikTok/Amazon 双渠道均适用，是母婴出海运营的高频痛点

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（65 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
LLM 驱动电商周报自动生成
依赖: openai>=1.0, pandas
"""
import json
from openai import OpenAI

client = OpenAI([REDACTED]")

# 模拟周度 SKU 数据
WEEKLY_DATA = {
    "period": "2025-W28",
    "total_gmv": 128500,
    "gmv_wow": +12.3,
    "avg_conversion_rate": 3.8,
    "cvr_wow": -0.5,
    "top_skus": [
        {"sku": "暖奶器-A1", "gmv": 38200, "wow": +22.1, "roas": 4.2},
        {"sku": "吸奶器-B2", "gmv": 29100, "wow": -8.5, "roas": 2.1},
        {"sku": "消毒锅-C3", "gmv": 21800, "wow": +5.3, "roas": 3.8},
    ],
    "alerts": [
        {"sku": "吸奶器-B2", "issue": "ROAS跌至2.1，低于保本线2.5"},
        {"sku": "消毒锅-C3", "issue": "库存仅剩7天，需补货"},
    ],
}

SYSTEM_PROMPT = """你是母婴跨境电商数据分析师。根据提供的结构化数据，
生成专业的中文周报。格式要求：
1. 【本周概要】2-3句话总结整体表现
2. 【核心指标】列出关键数字及趋势
3. 【异常分析】针对alerts逐条分析原因（2句话/条）
4. 【行动建议】给出3条优先级排序的具体操作建议
数字必须与输入完全一致，不得自行计算或推断。"""

def generate_weekly_report(data: dict) -> str:
    user_msg = f"请根据以下数据生成周报：\n{json.dumps(data, ensure_ascii=False, indent=2)}"
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.3,  # 低温保证一致性
        max_tokens=800,
    )
    return response.choices[0].message.content

def validate_numbers_in_report(report: str, data: dict) -> list[str]:
    """验证报告中关键数字未被LLM篡改"""
    issues = []
    if str(data["total_gmv"]) not in report:
        issues.append(f"GMV {data['total_gmv']} 未出现在报告中")
    return issues

# 主流程
report = generate_weekly_report(WEEKLY_DATA)
issues = validate_numbers_in_report(report, WEEKLY_DATA)

print("=== 自动生成周报 ===")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：SKU 级周度 GMV、转化率、广告 ROAS、库存天数、退货率与上周同比数据（或直播间实时 GMV、转化漏斗、达人带货排名）。

**输出**：结构化 Markdown 周报（含异常 SKU 自动标注与 3 条优先行动建议），或按固定时间推送的日报卡片；供运营与管理者阅读。

## 执行步骤

1. 汇总 SKU 级周度指标并计算同比
2. 由代码判定异常 SKU 并生成关键数字
3. 让 LLM 生成结构化 Markdown 叙述与优先行动建议
4. 校验报告数字与源数据一致后按渠道推送

## 边界与不做

- 数据不满足：SKU 级指标缺失或口径不统一时报告不可用，先统一指标口径。
- 何时不用：需要假设与验证式推理用「LLM 商业智能推理」；要做目标达成率与差异分解用「生意规模三维 KPI 监控」；临时一次性分析不必建自动化。
- 能力边界：只做报表生成与推送，不做归因与决策，也不保证叙述建议的业务正确性。
- 安全边界：报告数字必须由代码计算并做一致性校验，LLM 不得凭空生成或改写数字。

## 技能关联

- **可组合**：Skill-LLM-Ecommerce-Report-Automation

---

> 分类：经营管理/经营与组织/月度经营复盘　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Ecommerce-Report-Automation`