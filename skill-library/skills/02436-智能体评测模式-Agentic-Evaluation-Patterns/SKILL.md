---
name: "agentic-eval"
title: "自评迭代模式"
description: "为 agent 输出搭「生成→评审→改进」循环：反思、评估器-优化器、评分量表与 LLM 评审，附 Python 代码。触发词：自评迭代模式、agentic-eval、为 agent 输出搭「生成→评审→改进」循环：反思、评估器-优化器、评分量表与 LLM 评审，附 Python 代码。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 智能体评测模式（Agentic Evaluation Patterns）

通过迭代评测与精修实现自我改进的模式。

## 概览

评测模式让智能体能够评估并改进自己的输出，从一次性生成走向迭代精修循环。

```
生成 → 评估 → 批判 → 精修 → 输出
    ↑                        │
    └────────────────────────┘
```

## 何时使用

- **对质量要求苛刻的生成**：代码、报告、分析等需要高准确度的产出
- **有明确评测标准的任务**：存在已定义的成功指标
- **需要满足特定标准的内容**：风格指南、合规要求、格式规范

---

## 模式 1：基础反思

智能体通过自我批判来评估并改进自己的输出。

```python
def reflect_and_refine(task: str, criteria: list[str], max_iterations: int = 3) -> str:
    """Generate with reflection loop."""
    output = llm(f"Complete this task:\n{task}")
    
    for i in range(max_iterations):
        # Self-critique
        critique = llm(f"""
        Evaluate this output against criteria: {criteria}
        Output: {output}
        Rate each: PASS/FAIL with feedback as JSON.
        """)
        
        critique_data = json.loads(critique)
        all_pass = all(c["status"] == "PASS" for c in critique_data.values())
        if all_pass:
            return output
        
        # Refine based on critique
        failed = {k: v["feedback"] for k, v in critique_data.items() if v["status"] == "FAIL"}
        output = llm(f"Improve to address: {failed}\nOriginal: {output}")
    
    return output
```

**关键洞见**：用结构化 JSON 输出，批判结果才能被可靠解析。

---

## 模式 2：评估器-优化器

把生成与评测拆成两个独立组件，职责更清晰。

```python
class EvaluatorOptimizer:
    def __init__(self, score_threshold: float = 0.8):
        self.score_threshold = score_threshold
    
    def generate(self, task: str) -> str:
        return llm(f"Complete: {task}")
    
    def evaluate(self, output: str, task: str) -> dict:
        return json.loads(llm(f"""
        Evaluate output for task: {task}
        Output: {output}
        Return JSON: {{"overall_score": 0-1, "dimensions": {{"accuracy": ..., "clarity": ...}}}}
        """))
    
    def optimize(self, output: str, feedback: dict) -> str:
        return llm(f"Improve based on feedback: {feedback}\nOutput: {output}")
    
    def run(self, task: str, max_iterations: int = 3) -> str:
        output = self.generate(task)
        for _ in range(max_iterations):
            evaluation = self.evaluate(output, task)
            if evaluation["overall_score"] >= self.score_threshold:
                break
            output = self.optimize(output, evaluation)
        return output
```

---

## 模式 3：面向代码的反思

用于代码生成的测试驱动精修循环。

```python
class CodeReflector:
    def reflect_and_fix(self, spec: str, max_iterations: int = 3) -> str:
        code = llm(f"Write Python code for: {spec}")
        tests = llm(f"Generate pytest tests for: {spec}\nCode: {code}")
        
        for _ in range(max_iterations):
            result = run_tests(code, tests)
            if result["success"]:
                return code
            code = llm(f"Fix error: {result['error']}\nCode: {code}")
        return code
```

---

## 评测策略

### 结果导向

评测输出是否达成了预期结果。

```python
def evaluate_outcome(task: str, output: str, expected: str) -> str:
    return llm(f"Does output achieve expected outcome? Task: {task}, Expected: {expected}, Output: {output}")
```

### LLM 评审

用 LLM 对多个输出做比较与排序。

```python
def llm_judge(output_a: str, output_b: str, criteria: str) -> str:
    return llm(f"Compare outputs A and B for {criteria}. Which is better and why?")
```

### 评分量表

按带权重的维度给输出打分。

```python
RUBRIC = {
    "accuracy": {"weight": 0.4},
    "clarity": {"weight": 0.3},
    "completeness": {"weight": 0.3}
}

def evaluate_with_rubric(output: str, rubric: dict) -> float:
    scores = json.loads(llm(f"Rate 1-5 for each dimension: {list(rubric.keys())}\nOutput: {output}"))
    return sum(scores[d] * rubric[d]["weight"] for d in rubric) / 5
```

---

## 最佳实践

| 实践 | 理由 |
|----------|-----------|
| **标准清晰** | 事先定义具体、可度量的评测标准 |
| **限制迭代次数** | 设置最大迭代轮数（3-5），防止死循环 |
| **检查收敛** | 相邻两轮得分不再提升时就停止 |
| **记录历史** | 保留完整轨迹，便于调试与分析 |
| **结构化输出** | 用 JSON 保证评测结果可被可靠解析 |

---

## 快速开始清单

```markdown
## 评测实现清单

### 准备
- [ ] 定义评测标准／评分量表
- [ ] 设定「足够好」的分数阈值
- [ ] 配置最大迭代轮数（默认：3）

### 实现
- [ ] 实现 generate() 函数
- [ ] 实现带结构化输出的 evaluate() 函数
- [ ] 实现 optimize() 函数
- [ ] 串起精修循环

### 安全
- [ ] 加入收敛检测
- [ ] 记录每一轮，便于调试
- [ ] 优雅处理评测结果解析失败
```
