---
name: "p2s-tool-calling-chain-of-thought"
title: "工具调用链式推理 — Function Calling + CoT 结合实现可解释 Agent"
description: "触发词：工具调用、链式推理、Function Calling、多系统查询、可解释 Agent。何时不用：只需单库取数或纯文本问答时不用（那是数据查询类技能）；本技能解决跨广告/销售/竞品等多系统的多跳查询与推理链留痕。安全边界：工具调用须留完整日志以满足审计；代码示例里的 api_key 必须改为宿主注入的凭证，不得硬编码。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Tool-Calling-Chain-of-Thought"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "用一句自然语言问出跨广告、销售、竞品的分析结论，每一步推理和数据来源都留痕可查。"
user_try: "试试：帮我查一下上周暖奶器广告 ROAS 为什么下降，把每一步推理和数据来源列出来。"
whenToUse: "需要跨 2 个以上系统做多跳查询、并要求推理链可审计时用本技能；只需单系统取数或固定看板查询用数据查询类技能，工具调用失败后的重试与熔断归「失败恢复」域。"
workflow: "把业务问题拆成可调用的工具清单并写成 JSON Schema → 让模型先输出推理步骤再决定调用哪个工具、传什么参数 → 执行工具并把返回结果回灌上下文继续推理 → 在最大步数内收敛后整合成带来源的分析结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 工具调用链式推理 — Function Calling + CoT 结合实现可解释 Agent

## ① 解决的问题

运营输入自然语言问题需跨查广告/销售/竞品三个系统但无法获得可解释推理链——引入工具调用链式推理（Function Calling+CoT），多系统查询从手工4小时→Agent 5分钟完成，推理步骤全程可审计，年化节省分析人时 60%。

## ② 核心算法逻辑

Tool Calling + CoT（ChainofThought）是 2024 年主流 Agent 框架的核心范式：LLM 在调用外部工具前先输出推理步骤，再决定调用哪个工具、传入什么参数，最后整合工具返回结果继续推理。

## ③ 业务应用场景

场景1：运营自然语言查询驱动多工具分析 - 业务问题：运营输入「上周暖奶器的广告 ROAS 为什么下降」，需跨查广告数据库、销售数据库、竞品价格三个系统 - 数据要求：广告花费 API、销售订单 DB、竞品价格快照 - 预期产出：带完整推理链的分析结论，每一步数据来源可追溯 - 业务价值：解决多系统数据孤岛问题，减少数据分析师介入 60%
场景2：新品上架前 Agent 自动核查 - 业务问题：新品上架需跨 6 个检查项（合规、价格、库存、图片、关键词、竞品），人工串行耗时 2 小时 - 数据要求：产品信息、合规数据库、平台政策 API - 预期产出：结构化核查报告，含每项通过/未通过状态及修改建议 - 业务价值：上架准备时间从 2 小时降至 15 分钟
**三轨验证**： - 成本：每次复杂查询约 $0.05-0.15（含多次工具调用） - 合规：工具调用有完整日志，满足审计要求 - 风险：工具调用失败需有回退策略（见 Skill-Data-Agent-Error-Recovery）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：减少数据分析师日常查询工作量 60%，跨系统问题响应从小时级降至分钟级
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐☆
评估依据：Function Calling 是当前 Agent 系统的工程基础；母婴出海数据系统高度碎片化，CoT 工具链是解决数据孤岛的最低成本方案

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（95 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
工具调用链式推理 Agent — Function Calling + CoT
依赖: openai>=1.0
"""
import json
from openai import OpenAI

client = OpenAI([REDACTED]")

# 工具定义（JSON Schema）
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_ad_metrics",
            "description": "获取指定SKU在指定时间范围的广告投放指标（ROAS、花费、点击率）",
            "parameters": {
                "type": "object",
                "properties": {
                    "sku": {"type": "string", "description": "产品SKU编号"},
                    "start_date": {"type": "string", "description": "开始日期 YYYY-MM-DD"},
                    "end_date": {"type": "string", "description": "结束日期 YYYY-MM-DD"},
                },
                "required": ["sku", "start_date", "end_date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_competitor_price",
            "description": "获取同品类竞品的当前均价和近7天价格趋势",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "品类名称，如'暖奶器'"},
                },
                "required": ["category"],
            },
        },
    },
]

# 模拟工具执行函数
def execute_tool(name: str, args: dict) -> str:
    if name == "get_ad_metrics":
        return json.dumps({
            "sku": args["sku"], "roas": 2.1, "spend": 3200,
            "ctr": 0.8, "note": "较上周ROAS下降1.2，CTR下降0.3%"
        })
    if name == "get_competitor_price":
        return json.dumps({
            "category": args["category"],
            "avg_price": 38.5, "trend": "下降",
            "note": "竞品均价过去7天下降$4，最低价已至$34.99"
        })
    return "{}"

def run_cot_agent(user_query: str, max_steps: int = 5) -> str:
    messages = [
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：广告花费 API、销售订单 DB、竞品价格快照三类数据源；工具以 JSON Schema 声明参数，按 SKU 与日期区间（YYYY-MM-DD）粒度查询，品类按名称查询。

**输出**：带完整推理链的分析结论，或结构化核查报告（每项通过/未通过状态及修改建议），每一步数据来源可追溯，供运营与审核方使用。

## 执行步骤

1. 定义工具清单与 JSON Schema 参数
2. 让模型先写推理步骤再决定调用哪个工具与参数
3. 执行工具并把返回结果续接到推理上下文
4. 在最大步数内循环直到结论收敛
5. 输出带来源标注的结论与结构化核查报告

## 边界与不做

- 单系统、单跳取数或纯文本问答不需要本技能，工具调用失败后的重试与熔断归失败恢复类技能。
- 本技能只产出推理链与查询结论，不自动修改广告预算、不代替上架操作。
- 工具调用凭证由宿主注入，示例中的 api_key 不得进入生产代码；调用日志须完整保留以满足审计要求。

## 技能关联

- **可组合**：Skill-Tool-Calling-Chain-of-Thought

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Tool-Calling-Chain-of-Thought`