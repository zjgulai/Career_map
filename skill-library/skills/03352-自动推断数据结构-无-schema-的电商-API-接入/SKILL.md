---
name: "p2s-llm-schema-inference"
title: "LLM 自动推断数据结构 — 无 schema 的电商 API 接入"
description: "触发词：Schema自动推断、无文档API接入、字段类型推断、数据字典生成、Schema变更检测。何时不用：已有正式契约、只需校验兼容性时用数据契约与 Schema 演化技能；要把推断结果直接落成采集管道时用采集管道类技能。安全边界：金额与 ID 类字段的推断结果必须人工校验，不得直接用于对外结算或合规声明。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 数据管道 / 集成验证"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
p2s_card_id: "Skill-LLM-Schema-Inference"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "面对没有文档的接口，用真实样本让模型把字段和类型推断出来，顺手生成一份数据字典。"
user_try: "试试：这是 3PL 返回的 30 条真实响应，帮我推断出完整 Schema 和数据字典，并标出需要人工确认的字段。"
whenToUse: "上游接口无文档或字段命名不规范、需要先得到一份可用 Schema 时用本技能；已有契约、只想挡住破坏性变更，用数据契约与 Schema 演化技能。"
workflow: "采集覆盖多类型的真实响应样本 → 用 LLM 推断字段语义类型与枚举值域 → 用失败样本迭代修正推断 → 输出 Schema 与数据字典并标注低置信字段 → 版本变更时对比新旧响应生成变更报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM 自动推断数据结构 — 无 schema 的电商 API 接入

## ① 解决的问题

数据工程师面临"接入新电商API时手动解析无文档schema耗时数天"——LLM自动推断数据结构将新API接入时间从3天缩短至2小时，年化加速业务集成节省工程成本20-35万元

## ② 核心算法逻辑

传统 API 接入需要预先定义 JSON Schema，耗时且难以应对频繁变更。LLM Schema Inference 利用大模型的结构理解能力，从原始 API 响应样本中自动推断字段类型、嵌套关系、枚举值域，生成可验证的 Schema。

## ③ 业务应用场景

场景1：接入第三方母婴 ERP 系统（无文档） - 业务问题：合作 3PL 仓库提供私有 API，无正式文档，字段命名不规范（`stk_qty_avail`、`ord_dt`），人工解析需 2-3 天 - 数据要求：20-50 条真实 API 响应样本（含不同商品类型），LLM 访问权限 - 预期产出：1 小时内生成完整 Schema + 数据字典，字段覆盖率 >95% - 业务价值：新仓库接入时间从 3 天缩短至 4 小时，年化节省工程师人力约 15 万元
场景2：亚马逊 SP-API 新版本字段变更自适应 - 业务问题：Amazon SP-API 每季度更新，新增字段导致 Pipeline 解析报错，需人工更新 Schema - 数据要求：新旧版本 API 响应各 30 条样本 - 预期产出：自动检测 Schema Diff，生成变更报告（新增/删除/类型变更字段），90% 的变更无需人工介入 - 业务价值：API 变更响应时间从 2 天降低至 2 小时
**三轨验证**： - 成本：LLM 推断一次约消耗 2K-10K tokens，成本极低（$0.01-0.05/次） - 合规：推断的 Schema 用于内部数据处理，不涉及对外数据共享 - 风险：LLM 可能误推断枚举值域（将非枚举字段识别为枚举），需人工校验金额/ID 类字段

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：新 API 接入时间从 3 天降至 4 小时，年化节省工程人力 15 万元；API 版本变更响应时间降低 90%
实施难度：⭐⭐⭐☆☆（核心逻辑简单，但需要迭代验证收敛）
优先级：⭐⭐⭐☆☆（适用于多平台接入场景，中优先级）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（141 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted f-string literal (detected at line 59)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
LLM Schema 自动推断框架
依赖：jsonschema, json (标准库)
注：LLM 调用使用 mock，替换为真实 API 即可运行
"""
import json
import re
from typing import Any


# === Mock LLM（替换为真实 OpenAI/DeepSeek 调用）===
def call_llm(prompt: str) -> str:
    """Mock LLM 返回，实际使用时替换为 API 调用"""
    # 模拟推断一个电商库存 API 的 Schema
    mock_schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
            "sku_id": {
                "type": "string",
                "description": "商品唯一标识符",
                "examples": ["SKU-BABY-001"]
            },
            "stk_qty_avail": {
                "type": "integer",
                "description": "当前可售库存数量",
                "minimum": 0
            },
            "ord_dt": {
                "type": "string",
                "format": "date",
                "description": "订单日期（YYYY-MM-DD）"
            },
            "price_usd": {
                "type": "number",
                "description": "售价（美元）",
                "minimum": 0
            },
            "category": {
                "type": "string",
                "enum": ["feeding", "diapering", "safety", "toys"],
                "description": "商品类目"
            }
        },
        "required": ["sku_id", "stk_qty_avail"]
    }
    return json.dumps(mock_schema)


class LLMSchemaInference:
    def __init__(self, llm_fn=call_llm, max_iterations: int = 3):
        self.llm_fn = llm_fn
        self.max_iterations = max_iterations

    def _build_prompt(self, samples: list[dict], failed_cases: list = None) -> str:
        samples_str = json.dumps(samples[:10], ensure_ascii=False, indent=2)
        base_prompt = f"""你是一个数据工程专家。以下是 API 响应样本：

{samples_str}
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：20 到 50 条真实 API 响应样本（覆盖不同商品类型；版本变更场景为新旧版本各 30 条）与 LLM 调用权限，粒度到单条响应记录。

**输出**：完整 Schema 与数据字典（字段类型、枚举值域、字段覆盖率），版本变更时输出新增、删除、类型变更的 Schema Diff 与变更报告，供数据工程师接入与维护管道。

## 执行步骤

1. 收集覆盖多类商品的真实响应样本
2. 构造推断提示词让模型输出字段与语义类型
3. 用失败样本迭代修正推断结果
4. 输出 Schema 与数据字典，标注需人工校验的金额与 ID 字段
5. 对比新旧版本响应，生成 Schema Diff 与变更报告

## 边界与不做

- 样本量太少或只覆盖单一商品类型时推断不可靠；有正式契约且只需兼容性校验的场景不用本技能。
- 推断结果是候选 Schema，枚举值域与金额、ID 类字段需人工校验，本技能不做生产库结构变更。

## 技能关联

- **可组合**：Skill-LLM-Schema-Inference

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Schema-Inference`