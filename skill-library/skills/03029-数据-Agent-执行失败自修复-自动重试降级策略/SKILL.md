---
name: "p2s-data-agent-error-recovery"
title: "数据 Agent 执行失败自修复 — 自动重试+降级策略"
description: "触发词：失败自修复、自动重试、降级策略、数据管道、中断率。何时不用：失败源于数据本身错误（口径或字段缺失）而非调用抖动时，重试无用，应先做数据质量治理；安全边界：降级使用缓存数据须标注新鲜度，且必须设最大重试上限，避免放大 API 费用与配额消耗。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复 / 数据管道 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-Data-Agent-Error-Recovery"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "数据拉取报 503 或 429 时自动退避重试，实在拿不到就降级用缓存，别让整条管道断掉。"
user_try: "试试：给这条 SP-API 拉取管道加上重试和降级，中断率目标压到 3% 以下。"
whenToUse: "调用抖动导致的链路失败、需要自动恢复时用本技能；需要常驻熔断与半开测试的服务用容错回退类技能。"
workflow: "分类错误类型并按类型选择重试策略 → 指数退避重试直至成功或达到上限 → 超过上限后降级到缓存或备源数据 → 记录恢复时延并触发告警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 数据 Agent 执行失败自修复 — 自动重试+降级策略

## ① 解决的问题

大促期间数据 Pipeline 因 API 频繁返回 503/429 中断率高达30%——引入 Agent 自修复框架（指数退避+降级策略+自动告警），Pipeline 中断率从 30%→2%，年化避免大促期数据断供损失 40%。

## ② 核心算法逻辑

数据 Agent 在执行数据查询、API 调用、工具链调用时，失败是常态而非例外。自修复框架基于三层机制：

## ③ 业务应用场景

场景1：Amazon SP-API 数据拉取失败自修复 - 业务问题：大促期间 Amazon SP-API 频繁返回 503/429，每日数据 Pipeline 中断率达 30% - 数据要求：API 错误响应（状态码+body）、历史成功率、上次成功拉取时间戳 - 预期产出：Pipeline 中断率降低至 <3%，平均恢复时间 <5 分钟 - 业务价值：避免每日数据缺口导致的补货决策延误，年化避损约 20 万元
场景2：LLM 工具调用链中间步骤失败 - 业务问题：Agent 在执行「查库存→查价格→生成补货建议」链时，价格查询 Tool 偶发超时，导致整条链失败 - 数据要求：Tool 调用日志、错误类型分布、各步骤耗时 P99 - 预期产出：中间步骤失败时自动降级为缓存价格，链路成功率从 85% 提升至 97% - 业务价值：减少人工干预次数，运营效率提升
**三轨验证**： - 成本：重试增加 API 调用量（约 5-15%），需监控用量配额 - 合规：降级使用缓存数据时需标注数据新鲜度，避免决策误导 - 风险：无限重试可能放大 API 费用，需设置最大重试上限

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：Pipeline 中断率从 30% → 3%，避免每日数据缺口导致的决策误差，年化节省约 20-50 万元
实施难度：⭐⭐⭐☆☆（需要对现有 Agent 执行框架做侵入式改造）
优先级：⭐⭐⭐⭐☆（数据稳定性是所有下游分析的基础，高优）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（148 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 54）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
数据 Agent 自修复框架
依赖：tenacity, logging
"""
import time
import random
import logging
from enum import Enum
from typing import Callable, Any, Optional
from dataclasses import dataclass, field

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


class AgentState(Enum):
    PENDING = "pending"
    RUNNING = "running"
    RETRYING = "retrying"
    FALLBACK = "fallback"
    SUCCESS = "success"
    FAILED = "failed"


@dataclass
class RecoveryConfig:
    max_retries: int = 3
    base_wait: float = 1.0
    cap_wait: float = 30.0
    retryable_errors: tuple = (TimeoutError, ConnectionError, OSError)
    fallbacks: list = field(default_factory=list)


def exponential_backoff(attempt: int, base: float = 1.0, cap: float = 30.0) -> float:
    """带 jitter 的指数退避"""
    wait = min(cap, base * (2 ** attempt))
    jitter = random.uniform(0, wait * 0.1)
    return wait + jitter


class DataAgentErrorRecovery:
    def __init__(self, config: RecoveryConfig):
        self.config = config
        self.state = AgentState.PENDING
        self.attempt_log = []

    def _classify_error(self, error: Exception) -> str:
        if isinstance(error, self.config.retryable_errors):
            return "transient"
        if isinstance(error, (ValueError, KeyError)):
            return "degradable"
        return "fatal"

    def execute_with_recovery(
        self,
        primary_fn: Callable,
        *args,
        fallback_fns: Optional[list] = None,
        **kwargs
    ) -> Any:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：API 错误响应（状态码与 body）、历史成功率、上次成功拉取时间戳、各步骤耗时 P99，以及可用于降级的缓存数据源。

**输出**：重试与降级策略配置、链路成功率与平均恢复时间指标，以及数据新鲜度标注，供数据管道运维与下游分析使用。

## 执行步骤

1. 按错误类型分类并配置重试策略
2. 指数退避重试并设最大次数上限
3. 重试耗尽后降级使用缓存或备源
4. 标注降级数据的新鲜度
5. 记录恢复时延并对超阈值情况告警

## 边界与不做

- 失败源于数据本身错误（字段缺失、口径不一致）时，重试无效，应先做数据质量治理。
- 本技能产出恢复策略与降级结果，不负责下游补货与经营决策本身。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 必须设最大重试上限，否则会放大 API 费用并吃掉调用配额。

## 技能关联

- **可组合**：Skill-Data-Agent-Error-Recovery

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Data-Agent-Error-Recovery`