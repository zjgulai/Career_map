---
name: "p2s-llm-tool-selection-router"
title: "LLM工具路由与意图识别 — 意图分类与置信过滤"
description: "触发词：工具路由、意图识别、置信过滤、工具选择、澄清问句。何时不用：要在技能库里找该用哪个方法论时用「业务问题→Skill 检索」，要做技能间图谱推理时用「知识图谱技能管理」。安全边界：只做内部工具调度，不处理用户个人数据，不涉及价格操纵、虚假评价等受限操作。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-005"
l3_business: "能力匹配"
l3_all: "能力匹配 / 业务工具实现"
l1_l2_l3: "经营管理/经营与组织/能力匹配"
p2s_card_id: "Skill-LLM-Tool-Selection-Router"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "让内部 ChatBot 听懂「查一下 B08X 上周销量」到底该调哪个工具，把路由错误、幻觉调用和无效 API 花费一起收住。"
user_try: "试试：给连接 12 个工具的业务 Bot 加一层工具路由，让「查一下 B08X 上周销量」稳定命中查询工具而不是报告生成。"
whenToUse: "Agent 挂了多个工具、需要用自然语言问题稳定选中正确工具并抑制幻觉调用时用；要按业务描述找技能方法论时用「业务问题→Skill 检索」；要按技能与岗位关系做图分析时用「知识图谱技能管理」。"
workflow: "登记工具注册表（名称、描述、关键词、参数 schema、示例） → 标注至少 500 条历史调用日志作为意图样本 → 为工具描述与示例建立 TF-IDF 关键词索引 → 对用户问题做意图分类并给出候选工具与参数 → 按置信阈值过滤，低于阈值时反问澄清替代无效调用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM工具路由与意图识别 — 意图分类与置信过滤

## ① 解决的问题

智能体运营面临"Multi-Tool Agent工具路由错误率32%、无效API调用占40%成本"——意图分类+置信过滤将工具选择准确率从68%提升至91%，年化节省API成本24万元

## ② 核心算法逻辑

论文：ToolFormer: Language Models Can Teach Themselves to Use Tools | 年份：2023

## ③ 业务应用场景

场景A：业务 Bot 多工具智能调度 - 业务问题：内部 ChatBot 连接了 12 个工具（查库存/查订单/生成报告/调价等），用户"查一下 B08X 上周销量"应路由到查询工具而非报告生成工具，错误路由浪费 API 成本 - 数据要求：工具注册表（名称+描述+参数 schema），历史调用日志 ≥ 500 条 - 预期产出：工具选择准确率 >90%，幻觉调用（调用不存在工具）= 0%，澄清问句减少无效调用 30% - 业务价值：API 调用成本节省 40%（约 2 万元/月），Bot 响应正确率从 68% 升至 91%
三轨验证： - 成本轨： - 数据采集：标注 500 条历史调用日志，外包标注成本 ¥3,000-5,000（按 ¥6-10/条） - 计算资源：TF-IDF 索引构建 + 推理，单次推理成本 <¥0.001（本地计算），月度 API 调用成本从 ¥50,000 降至 ¥30,000，净节省 ¥20,000 - 人力投入：工程师 1 人 × 2 周（方案设计+集成+测试），成本 ¥8,000-12,000 - 总初期投入：¥11,000-17,000；月度净收益：¥20,000（6-12 个月 ROI）
- 合规轨：✅ 完全合规 - 不涉及用户个人数据处理，仅在内部工具调度层面运作 - 不违反 Amazon 政策（未涉及价格操纵、虚假评价等受限操作） - 不触发 GDPR（无跨境个人数据传输） - 符合《反不正当竞争法》（工具路由优化属于内部效率提升，非价格战）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Agent API 成本节省 40%（约 2-5 万元/月），Bot 答对率提升 20pp
实施难度：⭐⭐☆☆☆（规则引擎先快速落地，再迭代向量化方案）
优先级：⭐⭐⭐⭐⭐
评估依据：任何 Multi-Tool Agent 项目的第一个工程问题就是工具路由，准确的路由是 Agent 可用性的前提，投入小产出大

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（162 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
LLM 工具路由与意图识别 — TF-IDF 意图匹配 + 置信过滤 + 工具选择
"""
import math
import re
from typing import Dict, List, Tuple, Optional
from collections import Counter


# 工具注册表
TOOL_REGISTRY = {
    "query_inventory": {
        "description": "查询商品库存数量，支持按 ASIN、仓库、市场筛选",
        "keywords": ["库存", "库存量", "剩余", "有货", "缺货", "inventory", "stock"],
        "parameters": ["asin", "market", "warehouse_id"],
        "examples": ["B08X 现在还有多少库存", "查一下吸奶器的库存"]
    },
    "query_sales": {
        "description": "查询销售数据，支持按时间段、ASIN、市场统计销量和收入",
        "keywords": ["销量", "销售", "卖了多少", "收入", "revenue", "sales", "上周", "本月"],
        "parameters": ["asin", "market", "start_date", "end_date"],
        "examples": ["B08X 上周销量", "美国市场本月收入"]
    },
    "generate_report": {
        "description": "生成业务分析报告，包含趋势图表和文字摘要",
        "keywords": ["报告", "分析报告", "汇报", "总结", "report", "summary"],
        "parameters": ["report_type", "time_range", "markets"],
        "examples": ["生成上周销售报告", "做一份Q2分析"]
    },
    "adjust_price": {
        "description": "调整商品价格，支持批量调价和规则设置",
        "keywords": ["调价", "改价格", "价格调整", "降价", "涨价", "price", "pricing"],
        "parameters": ["asin", "new_price", "market", "reason"],
        "examples": ["把 B08X 美国价格调到 29.99", "所有吸奶器降价 5%"]
    },
    "query_returns": {
        "description": "查询退货数据，包含退货率、退货原因分布",
        "keywords": ["退货", "退款", "退货率", "return", "refund", "complaint"],
        "parameters": ["asin", "market", "start_date", "end_date"],
        "examples": ["B08X 本月退货率", "查一下退货原因"]
    }
}


def build_tfidf_index(registry: Dict) -> Dict[str, Dict[str, float]]:
    """为工具描述建立 TF-IDF 索引"""
    # 构建语料（工具描述 + 关键词 + 示例）
    tool_docs = {}
    for tool_id, info in registry.items():
        doc_tokens = []
        doc_tokens.extend(re.findall(r'[\u4e00-\u9fff]|[a-zA-Z]+', info["description"]))
        doc_tokens.extend(info["keywords"])
        for example in info["examples"]:
            doc_tokens.extend(re.findall(r'[\u4e00-\u9fff]|[a-zA-Z]+', example))
        tool_docs[tool_id] = Counter(doc_tokens)

    # 计算 IDF
    n_docs = len(tool_docs)
    df = Counter()
    for tokens in tool_docs.values():
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2302.04761 — Toolformer: Language Models Can Teach Themselves to Use Tools

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：工具注册表（工具名 + 描述 + 关键词 + 参数 schema + 调用示例，如 query_inventory、query_sales、generate_report、adjust_price、query_returns），历史调用日志 ≥500 条用于标注；粒度：单次用户请求对应一个候选工具集。

**输出**：命中工具及其参数（如 query_sales + asin/market/start_date/end_date）、工具选择置信度与澄清问句；目标为工具选择准确率大于 90%、幻觉调用为 0%、无效调用减少 30%，供内部业务 Bot 的调度层使用。

## 执行步骤

1. 登记工具注册表并补齐描述、参数与示例
2. 标注历史调用日志形成意图样本
3. 为每个工具构建 TF-IDF 关键词索引
4. 对用户问题做意图分类并输出候选工具与参数
5. 按置信阈值过滤，低置信时反问澄清

## 边界与不做

- 数据不满足时不用：工具注册表缺描述或参数 schema、或历史日志不足以覆盖真实说法时，路由准确率无法保证。
- 能力边界：只输出工具选择与参数建议，不代为执行工具、不生成报告内容，也不改写写入类工具的参数语义。

## 技能关联

- **前置**：Skill-Agent-Cost-Optimization-Budget-Control.html、Skill-Agent-Cost-Optimization-Budget-Control、Skill-Agent-Decision-Confidence-Threshold.html、Skill-Agent-Decision-Confidence-Threshold、Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-Text2SQL-Schema-Linking.html、Skill-Text2SQL-Schema-Linking
- **延伸**：Skill-Agent-Cost-Optimization-Budget-Control.html、Skill-Agent-Cost-Optimization-Budget-Control、Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Text2SQL-Schema-Linking.html、Skill-Text2SQL-Schema-Linking
- **可组合**：Skill-Agent-Cost-Optimization-Budget-Control.html、Skill-Agent-Cost-Optimization-Budget-Control、Skill-Text2SQL-Schema-Linking.html、Skill-Text2SQL-Schema-Linking、Skill-LLM-Tool-Selection-Router

---

> 分类：经营管理/经营与组织/能力匹配　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Tool-Selection-Router`