---
name: "p2s-skill-card-api-serving"
title: "Skill Card API Serving — 将 Skill 代码模板包装为参数化 REST 微服务"
description: "触发词：技能微服务化、接口自动注册、参数化调用、模板转服务、集成提速。何时不用：只是自己手动跑模板时不必包装成服务；要设计跨系统接口契约规范时属接口契约类工作。安全边界：把卡页代码注册为可执行端点等于开放代码执行面，必须限制可注册代码来源与签名白名单，禁止未经审核的代码暴露为公网端点。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 接口契约"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Skill-Card-API-Serving"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把散落的技能代码模板自动解析成带参数的 REST 接口，让其他系统直接调用，不必再人工复制粘贴。"
user_try: "试试：把我们这几个技能模板自动注册成 REST 接口，并列出每个端点的参数与返回结构。"
whenToUse: "属于「业务工具实现」：技能模板需要被其他系统反复调用、想省掉人工搬运时用；若只是自己手动运行模板，不必包成服务；若要统一跨系统的接口契约与版本规范，属接口契约类工作。"
workflow: "解析技能代码模板，提取函数签名与参数类型 → 自动生成 REST 路由与参数校验规则 → 把调用放进受限执行环境并记录耗时与错误 → 汇总输出端点清单与调用示例 → 接入下游 Agent，用真实请求验证延迟与正确性"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card API Serving — 将 Skill 代码模板包装为参数化 REST 微服务

## ① 解决的问题

技术负责人面临"Skill卡片的算法模板无法被系统直接调用只能手动复制"——FastAPI自动注册将Skill从文档变为可调用微服务，集成开发周期从1周压缩至2小时

## ② 核心算法逻辑

论文：Toolformer: Language Models Can Teach Themselves to Use Tools (2023) | 关键概念：Tool Use Protocol

## ③ 业务应用场景

业务问题： 某跨境母婴品牌（纸尿裤品类）在亚马逊运营 3 个 ASIN，每日需监控库存、销售趋势、竞品价格，人工决策补货时间滞后 4 小时，导致缺货损失约 8% 日销额。
具体数据规模： - 3 个 ASIN，日均销量 800 件 - 库存预测 Skill：输入 ASIN + 历史 30 天销量数据（120KB JSON）→ 输出 14 天预测值 + 置信区间 - 竞品监控 Skill：输入 ASIN + 竞品 URL 列表 → 输出价格、库存状态、评价变化 - 广告 ROI Skill：输入广告花费 + 转化数据 → 输出 ROAS、建议调整幅度
量化产出： - 响应时间：从 4 小时人工整合 → 15 分钟 Agent 自动调用 3 个 Skill 生成决策建议（调用延迟 < 300ms） - 缺货率下降：库存预警提前 2 天，缺货率从 8% → 2.1%，年增收 42 万元 - 人工成本：减少 1.5 个运营人力，年省 18 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

缺货率从 8% → 2.1%，日销 800 件 × 5.9% × 30 元/件 × 30 天 = 42 万元/年
减少 1.5 人力 × 12 万元/人 = 18 万元/年
微服务运维成本 5 万元/年（服务器、监控、备份）
✓ 易：代码解析和 FastAPI 路由注册是标准工程，无算法复杂度
✓ 易：沙箱执行可用 Python `exec()` 实现，无需容器化
✗ 难：需要处理函数签名多样性（args, *kwargs, 类型注解缺失等）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（443 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill Card API Serving - 完整实现
将 Skill.md 自动转换为参数化 REST 微服务
依赖：仅标准库（re, ast, json, time, hashlib, dataclasses）
"""

import re
import ast
import json
import time
import hashlib
from typing import Any, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime


# ─── 数据结构定义 ─────────────────────────────────────────────────────────────

@dataclass
class SkillParameter:
    """Skill 参数定义"""
    name: str
    type_annotation: str
    default_value: Optional[Any] = None
    description: str = ""


@dataclass
class SkillEndpoint:
    """Skill API Endpoint 定义"""
    skill_id: str
    topic: str
    version: str
    path: str
    code: str
    parameters: Dict[str, SkillParameter] = field(default_factory=dict)
    description: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    code_hash: str = ""


# ─── Skill 解析器 ─────────────────────────────────────────────────────────────

class SkillParser:
    """从 Skill.md 解析代码和元数据"""

    @staticmethod
    def parse_frontmatter(md_content: str) -> Dict[str, str]:
        """提取 YAML frontmatter"""
        fm_match = re.match(r'^---\n(.*?)\n---', md_content, re.DOTALL)
        if not fm_match:
            return {}

        fm_text = fm_match.group(1)
        result = {}
        for line in fm_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                result[key.strip()] = value.strip()
        return result
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2304.13734，但该号在 arXiv 上是《The Internal State of an LLM Knows When It's Lying》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Toolformer: Language Models Can Teach Themselves to Use Tools (2023)》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：待包装的技能代码模板与函数签名信息；卡页第 4 段未给字段级规格，落地前需确认模板的入参出参定义与执行环境约束。

**输出**：参数化的 REST 端点与调用清单：卡页示例把集成开发周期从 1 周压到 2 小时、单次调用延迟小于 300ms，产出可供 Agent 批量调用的接口目录。

## 执行步骤

1. 解析技能代码模板，提取函数签名与参数类型
2. 自动生成 REST 路由与参数校验规则
3. 把调用放进受限执行环境并记录耗时与错误
4. 汇总输出端点清单与调用示例
5. 接入下游 Agent，用真实请求验证延迟与正确性

## 边界与不做

- 数据不满足时不用：模板缺少类型注解、函数签名多样且无统一规范时自动注册容易出错，应先统一模板写法。
- 能力边界：本卡产出接口服务与注册机制，不含网关、鉴权与生产运维体系。
- 把卡页代码注册为可执行端点等于开放代码执行面，必须限制可注册代码来源与签名白名单，禁止未经审核的代码暴露为公网端点。

## 技能关联

- **前置**：Skill-Function-Signature-Parsing、Skill-Sandbox-Code-Execution
- **延伸**：Skill-API-Rate-Limiting-and-Quota、Skill-OpenAPI-Documentation-Generation、Skill-Skill-Versioning-and-Rollback
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Distributed-Skill-Caching、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-LLM-Agent-Tool-Calling、Skill-Tool-Auto-Discovery.html、Skill-Tool-Auto-Discovery、Skill-Skill-Card-API-Serving

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-Skill-Card-API-Serving`