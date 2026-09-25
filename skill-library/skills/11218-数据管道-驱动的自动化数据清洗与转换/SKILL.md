---
name: "p2s-agentic-etl-data-pipeline"
title: "Agentic ETL数据管道 — LLM驱动的自动化数据清洗与转换"
description: "触发词：语义ETL、多源数据融合、Schema自动推断、模糊匹配JOIN、自助数据清洗。何时不用：源系统结构稳定、只需拦住字段变更时用数据契约技能；要从头采集外部数据时用采集管道类技能。安全边界：处理业务数据须做数据最小化、不把用户 PII 送外部 API，LLM 生成的清洗代码必须人工审查后才可用于财务数据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 渠道对账 / 接口契约"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Agentic-ETL-Data-Pipeline"
p2s_src_domain: "09-DataAgent-LLM"
user_summary: "用一句自然语言就能把格式不同的几个数据源融成一张表，对账从几小时压到几分钟。"
user_try: "试试：把 Amazon 销售 CSV、TikTok 广告 JSON 和商品主数据表按 SKU 名称模糊匹配融合成统一报表。"
whenToUse: "多个数据源字段与主键不一致、需要语义匹配与格式统一时用本技能；源结构稳定、只需兼容性校验，用数据契约技能。"
workflow: "读取各源数据并推断字段语义类型 → 推断跨源 JOIN 键并做语义匹配 → 生成统一报表并统一字段格式 → 对格式差异做清洗与归一 → 小样本验证后再全量执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agentic ETL数据管道 — LLM驱动的自动化数据清洗与转换

## ① 解决的问题

分析师面临"Amazon和TikTok数据格式不同每次手动对账需2小时"——LLM驱动的语义ETL自动Schema推断和跨源JOIN，对账时间从2小时压缩到5分钟，年化节省约52万元

## ② 核心算法逻辑

传统ETL（ExtractTransformLoad）管道面临母婴电商的特殊挑战：

## ③ 业务应用场景

场景A：多平台数据自动融合（Amazon+TikTok Shop） - 业务问题：Amazon SP-API返回的ASIN格式为"B07XXXXX"，TikTok Shop返回的商品ID为"TIKX-XXXXX"，两者需要按SKU名称模糊匹配融合为统一报表。传统方案需要工程师写mapping表维护，每次上新品都要手动更新 - 数据要求：Amazon销售报告（CSV）+ TikTok广告报告（JSON）+ 商品主数据表（Excel） - 预期产出：LLM自动推断三个数据源的JOIN键（Amazon: ASIN→SKU名，TikTok: 商品ID→SKU名），语义匹配后生成统一多平台销售报表，数据
三轨对抗验证： 1. 成本验证：每次Schema理解约500 tokens（0.005元），每次大规模转换约2000 tokens（0.02元），日均使用10次=0.25元/天，全年<100元 2. 合规验证：用LLM处理业务数据需注意数据最小化（不发送用户PII给API）；亚马逊数据需在API条款允许的范围内使用；建议本地部署LLM（Ollama/Qwen）处理敏感数据 3. 风险验证：LLM生成的Python代码可能有BUG（逻辑错误而非语法错误）；必须有人工"代码审查"步骤，对于财务数据处理尤其重要；建议LLM生成代码后先在小样本上运行验证
场景B：运营数据临时清洗（自助分析） - 业务问题：运营需要对比两个季度的退货率，但数据格式不同（一个是百分比"8.2%"，另一个是小数"0.082"） - 方案：用Agentic ETL自动识别格式差异并统一，运营用自然语言描述即可完成 - 业务价值：运营自助处理数据清洗需求，减少工程团队约30%的数据支持请求

## ④ 输入数据要求

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：数据对账时间从手工2小时/次 → 自动5分钟，每周3次对账，年化节省约260小时 = 52万元（按200元/小时）；临时分析需求响应时间从2天→30分钟，运营决策速度提升显著；LLM API成本<100元/年
实施难度：⭐⭐⭐☆☆（核心架构1周可搭建；LLM代码生成准确率约85%，需人工审查机制；主要挑战在异常处理和边界情况覆盖）
优先级：⭐⭐⭐⭐☆（每个有多平台数据的团队的痛点，ROI极高）
评估依据：VLDB 2024 LOTUS论文验证语义查询在数据分析任务上比传统SQL准确率高30%；arXiv:2501.12823展示Agentic ETL在BI场景的端到端应用；Snowflake/Databricks均在推进AI-Native ETL产品

## ⑦ 代码模板

代码块数量：3 · 路径：未检测到

 Python60 行 · 可运行复制
"""
Skill-Agentic-ETL-Data-Pipeline
Agentic ETL — LLM驱动的自动数据清洗与融合

依赖：pip install numpy pandas
注意：生产环境接入 DeepSeek/OpenAI API 进行Schema理解和语义转换
"""

import re
import json
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Any, Optional

np.random.seed(42)

# ── 1. 模拟多源数据（Amazon + TikTok Shop）─────────────────────────
amazon_data = pd.DataFrame({
 &#x27;ASIN&#x27;: [&#x27;B07ABC123&#x27;, &#x27;B07DEF456&#x27;, &#x27;B07GHI789&#x27;, &#x27;B07JKL012&#x27;, &#x27;B07MNO345&#x27;],
 &#x27;Product_Name&#x27;: [&#x27;婴儿推车轻便折叠款&#x27;, &#x27;吸奶器电动静音&#x27;, &#x27;婴儿床围栏防摔&#x27;, &#x27;0段奶粉900g&#x27;, &#x27;婴儿洗发沐浴露&#x27;],
 &#x27;Units_Sold&#x27;: [245, 189, 312, 567, 143],
 &#x27;Revenue_USD&#x27;: [12250.5, 9450.0, 7800.0, 22680.0, 4290.0],
 &#x27;Return_Rate&#x27;: [&#x27;4.1%&#x27;, &#x27;2.8%&#x27;, &#x27;5.2%&#x27;, &#x27;0.9%&#x27;, &#x27;3.7%&#x27;], # 格式不一致！
})

tiktok_data = pd.DataFrame({
 &#x27;item_id&#x27;: [&#x27;TK-001-STROLLER&#x27;, &#x27;TK-002-PUMP&#x27;, &#x27;TK-003-FENCE&#x27;, &#x27;TK-004-FORMULA&#x27;, &#x27;TK-005-WASH&#x27;],
 &#x27;title&#x27;: [&#x27;Lightweight Baby Stroller&#x27;, &#x27;Electric Breast Pump Quiet&#x27;, &#x27;Baby Crib Rail Guard&#x27;,
 &#x27;Formula Stage 0&#x27;, &#x27;Baby Shampoo 2-in-1&#x27;],
 &#x27;clicks&#x27;: [3420, 2150, 4100, 8900, 1870],
 &#x27;ad_spend&#x27;: [850.5, 650.0, 920.0, 2100.0, 410.0],
 &#x27;roas&#x27;: [0.082, 0.091, 0.065, 0.078, 0.089], # 小数格式（vs Amazon的百分比）
})

print("Amazon数据：")
print(amazon_data.to_string(index=False))
print("\nTikTok数据：")
print(tiktok_data.to_string(index=False))

# ── 2. Schema推断器（模拟LLM的Schema理解）───────────────────────────
class AgenticSchemaInferrer:
 """
 模拟LLM的Schema推断能力
 生产环境：调用LLM API分析数据样本，输出字段映射和类型推断
 """

 def infer_field_type(self, series: pd.Series) -> str:
 """推断字段的语义类型"""
 sample = series.dropna().head(5).astype(str).tolist()
 # 检测百分比格式
 if all(re.match(r&#x27;^\d+\.?\d*%$&#x27;, str(v)) for v in sample[:3]):
 return &#x27;percentage_string&#x27;
 # 检测小数率（0-1范围）
 try:
 nums = [float(v) for v in sample]
 if all(0 <= n <= 1 for n in nums):
 return &#x27;decimal_rate&#x27;
 except:
 pass

## ⑧ 论文来源

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## 输入 / 输出契约

**输入**：待融合的多源数据（如 Amazon 销售报告 CSV、TikTok 广告报告 JSON、商品主数据 Excel）与用自然语言描述的转换诉求，粒度到单条记录与单个字段。

**输出**：统一的多平台结构化报表与可复用的转换代码，附 JOIN 键推断结果与格式统一记录，供分析与运营自助使用。

## 执行步骤

1. 载入各源数据并推断字段语义类型
2. 推断跨源 JOIN 键并完成语义匹配
3. 生成统一报表并统一字段命名与格式
4. 把百分比与小数列等格式差异归一
5. 先在样本上验证生成的转换代码，再全量执行

## 边界与不做

- 数据源之间没有任何可对齐的业务键、或缺少商品主数据时无法融合；只读取单一数据源的场景不属于本技能。
- 本技能产出转换代码与统一结果，生成的代码可能有逻辑错误，用于财务等关键数据前必须人工审查。
- 涉及用户隐私字段时不得送入外部 LLM 接口，敏感数据应改用本地部署模型处理。

## 技能关联

- **前置**：Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-Data-Provenance-Lineage.html、Skill-Data-Provenance-Lineage、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-LLM-Code-Generation-Data-Pipeline.html、Skill-LLM-Code-Generation-Data-Pipeline、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Data-Provenance-Lineage.html、Skill-Data-Provenance-Lineage、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-LLM-Code-Generation-Data-Pipeline.html、Skill-LLM-Code-Generation-Data-Pipeline、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation
- **可组合**：Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-LLM-Code-Generation-Data-Pipeline.html、Skill-LLM-Code-Generation-Data-Pipeline、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-Agentic-ETL-Data-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Agentic-ETL-Data-Pipeline`