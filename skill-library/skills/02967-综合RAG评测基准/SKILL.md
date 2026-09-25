---
name: "p2s-crag-comprehensive-rag-benchmark"
title: "CRAG — 综合RAG评测基准"
description: "触发词：RAG 基准、CRAG、幻觉率分布、过期信息排查、矛盾检测。何时不用：只需周期性轻量巡检时用 ARES 一类评测即可；要专测多跳事实性走 FRAMES 类基准。安全边界：评测结论依赖外部权威源与测试题集质量，题集覆盖不足会低估问题，须补齐来源后再下结论。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 算法评估设计"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-CRAG-Comprehensive-RAG-Benchmark"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给新建知识库做一次综合体检，短时间内查出过期、矛盾和编造的内容。"
user_try: "试试：用一套分层测试题给这个辅食安全知识库做综合评测，列出高风险文档。"
whenToUse: "新知识库上线前或大改后要做一次覆盖多问题类型的全面体检时用；只要周期性轻量巡检用 ARES 一类评测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CRAG — 综合RAG评测基准

## ① 解决的问题

数据团队面临知识库质量无法量化——CRAG综合评测将质检周期从2周→2小时，识别高幻觉问题类别准确率93%

## ② 核心算法逻辑

核心思想：通过5类问题分类（简单/复杂/推理/时效/汇聚）× 7大领域的多维度评测框架，对RAG系统进行自动化、模型无关的全面质检。

## ③ 业务应用场景

- 业务问题：新上线的"婴儿辅食安全"知识库包含2,847条文档，团队需在48小时内验证是否存在过期推荐（如已禁用的添加剂）、矛盾信息（不同文档对同一食材的建议冲突）、幻觉回答（编造不存在的营养数据）。人工逐条审核需投入15人×5天，成本高且遗漏率15%。
- 数据要求： - 知识库文档集：2,847条母婴营养/安全指南 - 测试问题集：280道（简单56/复杂56/推理56/时效56/汇聚56），覆盖常见用户查询 - 标准答案库：每题3-5个人工标注的黄金答案 - 外部验证源：FDA、WHO、中国疾控中心最新公告
- 预期产出： - 幻觉率分布：简单问题2.1%、复杂问题8.7%、推理问题14.3%、时效问题23.5%、汇聚问题19.2% - 问题清单：47条高风险文档（幻觉率>20%）、12条过期信息、8条矛盾表述 - 质量评分：整体精确率87.2%、召回率91.5%、F1-Score 0.893

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴知识库运营负责人面临"知识库质量无法量化、问题发现滞后"的困境——CRAG将质检周期从10天降至2小时，幻觉问题提前发现率从45%提升至92%，年化节省人力成本38-52万元，同时规避1次品牌危机（估值损失200-500万）。
实施难度：⭐⭐⭐☆☆
需要构建标注数据集（280-500道题，2-3周）
需要与RAG系统集成（API对接，1-2周）
需要建立自动化评测流程（基础设施，1周）
优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（254 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from collections import defaultdict
from datetime import datetime

class CRAGBenchmark:
    """CRAG综合RAG评测框架 - 母婴跨境电商应用"""
    
    def __init__(self):
        self.problem_types = ['simple', 'complex', 'reasoning', 'temporal', 'aggregation']
        self.domains = ['infant_nutrition', 'safety_certification', 'product_specs', 
                       'health_guidance', 'market_trends', 'regulatory_updates', 'user_reviews']
        self.results = defaultdict(list)
    
    def generate_test_dataset(self):
        """生成母婴知识库评测数据集"""
        np.random.seed(42)
        test_cases = []
        
        # 示例数据：婴儿推车、暖奶器、有机辅食
        products = {
            'stroller': {'name': '婴儿推车', 'safety_cert': 'CCC认证', 'price_range': '800-3000'},
            'bottle_warmer': {'name': '暖奶器', 'safety_cert': 'CE认证', 'price_range': '100-500'},
            'organic_food': {'name': '有机辅食', 'safety_cert': 'USDA有机', 'price_range': '30-150'}
        }
        
        # 5类问题示例
        questions = {
            'simple': [
                "婴儿推车的CCC认证是什么？",
                "暖奶器的工作温度范围是多少？",
                "有机辅食的主要成分有哪些？"
            ],
            'complex': [
                "对比三款推车的安全性、便携性和价格，哪款最适合长途旅行？",
                "暖奶器和温奶瓶相比有什么优势？",
                "有机辅食和普通辅食的营养差异在哪里？"
            ],
            'reasoning': [
                "如果婴儿对乳糖不耐受，应该选择什么样的辅食？",
                "推车的避震系统如何影响婴儿脊椎发育？",
                "暖奶器的恒温功能对母乳营养有影响吗？"
            ],
            'temporal': [
                "2024年最新的婴儿推车安全标准是什么？",
                "今年有机辅食的价格趋势如何？",
                "最近发布的婴儿产品召回公告有哪些？"
            ],
            'aggregation': [
                "综合考虑安全性、价格、用户评价，推荐一款推车",
                "对比5个品牌的暖奶器，列出优缺点",
                "汇总不同月龄的有机辅食推荐清单"
            ]
        }
        
        # 生成280道测试题（每类56道）
        for problem_type in self.problem_types:
            for domain in self.domains:
                for i in range(8):  # 每个类型×领域组合8道题
                    question = questions[problem_type][i % len(questions[problem_type])]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2406.04744 — CRAG -- Comprehensive RAG Benchmark

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：知识库文档集、按问题类型分层的测试问题集、每题的人工黄金答案，以及外部权威验证源

**输出**：按问题类型分布的幻觉率、高风险文档清单（幻觉率过高、过期、矛盾三类）与整体精确率、召回率、F1，供知识库修复排期

## 执行步骤

1. 按问题类型分层构建测试问题集，并为每题准备人工黄金答案。
2. 接入外部权威源作为过期与矛盾判定的依据。
3. 跑全量评测，产出各问题类型的幻觉率分布。
4. 列出高风险文档清单与整体指标，交知识库编辑排期修复。

## 边界与不做

- 何时不用：只需周期性质量巡检时，构建完整基准的成本过高，用轻量评测即可。
- 能力边界：评测只定位问题文档与类型，不自动改写知识库内容。
- 能力边界：结论依赖测试题集与外部源的质量，题集覆盖不足会低估问题；卡页原文提示题集构建需 2-3 周。

## 技能关联

- **前置**：Skill-ARES-RAG-Evaluation.html、Skill-ARES-RAG-Evaluation、Skill-FActScore-Claim-Verification-Pipeline.html、Skill-FActScore-Claim-Verification-Pipeline、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection、Skill-KG-Powered-User-Profiling.html、Skill-KG-Powered-User-Profiling、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-LLM-Confidence-Calibration、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **延伸**：Skill-ARES-RAG-Evaluation.html、Skill-ARES-RAG-Evaluation、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection、Skill-KG-Powered-User-Profiling.html、Skill-KG-Powered-User-Profiling、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-LLM-Confidence-Calibration、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-KG-Powered-User-Profiling.html、Skill-KG-Powered-User-Profiling、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-LLM-Confidence-Calibration、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval、Skill-CRAG-Comprehensive-RAG-Benchmark

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：08-知识图谱　·　源卡：`Skill-CRAG-Comprehensive-RAG-Benchmark`