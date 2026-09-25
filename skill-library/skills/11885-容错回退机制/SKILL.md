---
name: "p2s-agent-fault-tolerance"
title: "Skill Card: Agent 容错回退机制"
description: "触发词：容错回退、熔断器、指数退避、降级策略、半开测试。何时不用：调用的是幂等只读接口且失败可忽略时不必上熔断；本技能面向会阻塞关键决策的外部依赖。安全边界：阈值与退避策略是契约产物，本技能不执行真正的编排动作；降级使用缓存数据时必须标注数据新鲜度。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-Agent-Fault-Tolerance"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "外部接口抖动时先重试、再熔断、再降级到保守建议，别让一次超时打断整条补货决策。"
user_try: "试试：给这个库存 API 调用加上重试、熔断和降级，并说明各自的阈值。"
whenToUse: "调用外部 API 会超时并阻塞下游决策时用本技能；需要定位历史故障根因用归因类技能，需要事务性回滚用事务工具调用类技能。"
workflow: "按设定退避序列重试并在连续失败后打开熔断 → 冷却期内改用降级策略给出保守建议 → 冷却结束做半开测试 → 成功则关闭熔断恢复正常决策"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card: Agent 容错回退机制

## ① 解决的问题

WF-A 补货 Agent 调用库存 API 超时，若无容错机制则整个补货决策链中断——Circuit Breaker + 指数退避可将 API 抖动故障恢复时间从小时级压缩到秒级，保护运营 SLA

## ② 核心算法逻辑

当 Agent 调用外部 API/模型失败时，通过分级容错策略（重试→降级→熔断→恢复）自动切换执行路径，避免决策中断，确保业务连续性。

## ③ 业务应用场景

业务问题： WF-A 补货 Agent 每 15min 调用亚马逊库存 API 获取实时库存，目标维持安全库存 ≥2000 件。但 API 在流量高峰期（美东时间 9-11am）频繁超时，导致补货决策延迟 4-6 小时，期间库存从 2000 件跌至 300 件，触发断货。
数据规模： - SKU：WARMER-PRO-220V（婴儿恒温暖奶器，客单价 $39.9） - 日销量：50-80 件（高峰期） - 库存周期：14 天（安全库存 = 日销 × 14） - API 故障频率：每周 2-3 次，单次持续 15-30min - 现状：补货准确率 82%，库存周转率 6.2 次/年
容错执行流程： 1. 第 1-3 次重试（共 6s）：Agent 以 1s/2s/4s 间隔重试 API，获取实时库存 2. 熔断打开（第 4 次失败）：连续 3 次失败后，熔断器打开，进入 30s 冷却期 3. Fallback 降级：基于最新已知库存（350 件）+ 需求预测（日销 60 件 × 14 天 = 840 件），输出保守补货建议：调拨 700 件（而非正常 1000 件） 4. 半开测试（30s 后）：尝试单次 API 调用，若成功则关闭熔断器，恢复正常决策；若失败则重新打开，继续使用 Fallback 5. 恢复：API 恢复后，获取实际库存 2100 件，更新补货为 调拨

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

工程改造：40h × ¥300/h = 1.2 万元
基础设施（Redis 缓存）：¥600/月 = 7.2 万元/年
总成本：8.4 万元/年
✅ 易于理解：熔断器、重试、Fallback 是业界标准模式，团队学习成本低
✅ 代码改造量中等：仅需在 Agent 调用外部 API 处包装 CircuitBreaker，改造范围明确
⚠️ 需要缓存基础设施：需部署 Redis 或本地缓存，增加运维复杂度

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（308 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/agent_fault_tolerance` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Agent-Fault-Tolerance.md`），已与卡面节选核对，不依赖上述路径。

```python
import time
import random
from collections import defaultdict
from datetime import datetime, timedelta

class CircuitBreaker:
    """
    Agent 容错回退机制：支持重试、熔断、Fallback、半开测试
    """
    def __init__(self, failure_threshold=3, cooldown_sec=30, retry_max=3):
        self.failure_threshold = failure_threshold
        self.cooldown_sec = cooldown_sec
        self.retry_max = retry_max
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        self.failure_count = 0
        self.last_failure_time = None
        self.success_count = 0
        self.call_history = []
    
    def _exponential_backoff(self, attempt):
        """指数退避：t_n = min(base * 2^n + jitter, max)"""
        base = 1.0
        max_wait = 32.0
        wait_time = min(base * (2 ** attempt), max_wait)
        jitter = random.uniform(0, 0.1 * wait_time)
        return wait_time + jitter
    
    def call(self, fn, *args, fallback_fn=None, **kwargs):
        """
        执行函数，支持重试、熔断、降级
        
        Args:
            fn: 主函数
            fallback_fn: 降级函数（当主函数失败时调用）
            args, kwargs: 函数参数
        
        Returns:
            执行结果或 Fallback 结果
        """
        # 检查熔断器状态
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.cooldown_sec:
                self.state = "HALF_OPEN"
                self.success_count = 0
            else:
                # 熔断器打开，直接返回 Fallback
                if fallback_fn:
                    result = fallback_fn(*args, **kwargs)
                    self.call_history.append({
                        "time": datetime.now(),
                        "state": "OPEN_FALLBACK",
                        "result": result
                    })
                    return result
                else:
                    raise Exception("Circuit breaker OPEN and no fallback provided")
        
        # 重试逻辑
        last_exception = None
        for attempt in range(self.retry_max):
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：外部调用的失败模式与频率、错误响应（状态码与 body）、最近一次成功的结果与时间戳，以及业务可接受的最坏结果；熔断阈值与冷却时长需显式配置。

**输出**：重试、熔断与降级参数（阈值、冷却时长、退避序列）以及降级时的替代输出建议，供 Agent 执行层与运维监控使用。

## 执行步骤

1. 统计失败模式并设定重试序列与熔断阈值
2. 把外部调用包装成带重试的执行单元
3. 连续失败后打开熔断并切换降级路径
4. 冷却期结束做半开测试
5. 按测试结果关闭或重新打开熔断

## 边界与不做

- 调用是幂等只读且失败可忽略时，不必引入熔断与降级。
- 本技能只产出阈值与降级策略，不执行真正的降级切换动作。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 降级使用缓存数据时必须标注数据新鲜度，避免把过期数据当实时库存。

## 技能关联

- **前置**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails
- **延伸**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing
- **可组合**：Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Multi-Model-Fallback-Strategy、Skill-Agent-Fault-Tolerance

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-Fault-Tolerance`