---
name: "p2s-schema-evolution-data-contract"
title: "Schema Evolution & Data Contract — 数据契约与 Schema 演化管理"
description: "触发词：数据契约、Schema演化、向后兼容、兼容层注入、多市场字段合并。何时不用：上游完全无文档、需要先从样本推断出结构时用 Schema 自动推断技能；只做本体版本升级与依赖通知时用本体版本管理技能。安全边界：契约上线初期须用警告模式灰度，不得直接用严格模式阻塞上游发布，契约文件不得写入敏感字段明文。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
p2s_card_id: "Skill-Schema-Evolution-Data-Contract"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用一份可执行的契约管住上游字段变更：变更自动检测、兼容变更自动兜住，别再让下游管道静默炸掉。"
user_try: "试试：给 product_attributes_raw 这条流加一份数据契约，自动检测字段变更并注入兼容层，先以警告模式跑两周。"
whenToUse: "上游字段会持续演化、下游有 ML 管道等强依赖时用本技能；上游没有任何结构信息、需要从样本推断，用 Schema 自动推断技能。"
workflow: "为关键数据流定义契约（字段、类型、默认值、兼容规则） → 接入 Schema Registry 做变更检测 → 判定变更是否向后兼容并注入兼容层 → 跨市场字段不一致时合并 Union Schema 并补默认值 → 按警告模式灰度后再收紧契约"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Schema Evolution & Data Contract — 数据契约与 Schema 演化管理

## ① 解决的问题

数据工程师面临"上游数据字段变更导致下游ML管道静默失败"——数据契约将字段变更导致的pipeline故障减少80%，年化减少数据质量事故维护成本20-35万元

## ② 核心算法逻辑

数据契约（Data Contract）是生产方与消费方之间的显式接口协议，定义字段类型、语义约束、SLA 和版本兼容规则。核心挑战在于电商业务高速迭代导致 schema 频繁变更，若无管控会引发下游模型静默崩溃。

## ③ 业务应用场景

场景1：Amazon SP-API 商品属性字段版本管理 - 业务问题：Amazon 每季度更新商品分类 schema（如婴儿安全座椅新增 `side_impact_rating` 字段），下游推荐模型因字段缺失报 KeyError，导致 listing 质量评分流水线中断 2-4 小时。 - 数据要求：Amazon Catalog Items API v2022-04-01 响应 JSON，Kafka topic `product_attributes_raw` - 预期产出：schema 变更自动检测 + 兼容层注入，P99 流水线中断时间从 4h → 0（兼容变更无感知） - 业务价值：
场景2：TikTok Shop 订单事件流 Schema 演化 - 业务问题：TikTok Shop 在不同市场（US/UK/SE Asia）返回字段集合不同，统一消费方写多套解析逻辑维护成本高。 - 数据要求：TikTok Shop Webhook 订单事件，多市场并发写入同一 Kafka topic - 预期产出：Union Schema 自动合并 + 缺失字段填充默认值，消费方代码统一 → 维护成本降低 60% - 业务价值：减少跨市场扩张时数据工程重复开发，节省 3-4 人周/季度
**三轨验证**： - 成本：Schema Registry 运维成本低（Confluent Cloud $0.0008/schema-check），dbt contract 无额外成本 - 合规：契约文件可作为 GDPR 数据流图（data lineage）的机器可读证据 - 风险：over-strict contract 会阻塞业务迭代，需设置 warning-only 模式用于新字段灰度期

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：breaking change 引发的数据管道中断从 4h/次 → 0（兼容变更），年化节省数据工程修复成本 2-6 万元；dbt contract 在 build 期拦截错误，避免脏数据进入模型，数据质量问题发现成本降低 70%
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：电商平台 API 每季度必然有 schema 变更，契约管理是数据工程基础设施的"安全阀"。中小出海团队一次 breaking change 造成的业务损失通常远超工具建设成本。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（167 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Schema Evolution & Data Contract 演示
使用 fastavro 模拟 Avro schema 兼容性检查 + dbt contract 风格的列约束验证
"""
import json
from typing import Any

try:
    import fastavro
    from fastavro.schema import parse_schema
    HAS_FASTAVRO = True
except ImportError:
    HAS_FASTAVRO = False

# ── 模拟 Schema Registry ──────────────────────────────────────────────────────
SCHEMA_V1 = {
    "type": "record",
    "name": "ProductAttribute",
    "namespace": "com.p2s.amazon",
    "fields": [
        {"name": "asin", "type": "string"},
        {"name": "title", "type": "string"},
        {"name": "price_usd", "type": "float"},
        {"name": "category", "type": "string"},
    ]
}

# V2: 新增可选字段（Backward 兼容）
SCHEMA_V2 = {
    "type": "record",
    "name": "ProductAttribute",
    "namespace": "com.p2s.amazon",
    "fields": [
        {"name": "asin", "type": "string"},
        {"name": "title", "type": "string"},
        {"name": "price_usd", "type": "float"},
        {"name": "category", "type": "string"},
        # 新增字段必须有 default
        {"name": "side_impact_rating", "type": ["null", "string"], "default": None},
        {"name": "updated_at", "type": ["null", "string"], "default": None},
    ]
}

# V3 (Breaking!): 删除字段 category → 模拟 breaking change
SCHEMA_V3_BREAKING = {
    "type": "record",
    "name": "ProductAttribute",
    "namespace": "com.p2s.amazon",
    "fields": [
        {"name": "asin", "type": "string"},
        {"name": "title", "type": "string"},
        {"name": "price_usd", "type": "float"},
        # 删除 category → breaking!
    ]
}


def check_backward_compatibility(writer_schema: dict, reader_schema: dict) -> dict:
    """
    检查 writer_schema (新版本) 是否对 reader_schema (旧版本) 向后兼容。
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：上游数据流的结构定义与真实事件样本（如商品属性响应 JSON、订单事件流、多市场 Webhook 事件）以及下游消费方的字段依赖，粒度到字段与单条事件。

**输出**：数据契约文件、兼容性检查结果（是否破坏性）与兼容层注入方案，跨市场场景输出 Union Schema 与默认值填充规则，供数据工程与下游消费方使用。

## 执行步骤

1. 梳理关键数据流的字段与下游依赖，写出契约
2. 把契约注册到 Schema Registry 并开启变更检测
3. 对每次写入做向后兼容性校验，标记破坏性变更
4. 对不兼容变更注入兼容层或走双写过渡
5. 跨市场字段不一致时合并 Union Schema 并补默认值

## 边界与不做

- 上游完全不提供结构信息、只有少量样本时契约无从写起；一次性、无下游依赖的临时表不必上契约。
- 本技能负责契约与兼容判据，不改动上游系统的字段定义，也不保证业务语义本身的正确性。

## 技能关联

- **可组合**：Skill-Schema-Evolution-Data-Contract

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：22-数据采集工程　·　源卡：`Skill-Schema-Evolution-Data-Contract`