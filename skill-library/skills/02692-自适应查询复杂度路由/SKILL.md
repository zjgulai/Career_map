---
name: "p2s-adaptive-rag-query-routing"
title: "Adaptive-RAG — 自适应查询复杂度路由"
description: "触发词：查询复杂度路由、按需检索、多跳检索、分类器分流、延迟与成本平衡。何时不用：问题库规模过小或缺少复杂度标注时不适用；需要因果链路检索走因果图增强检索技能。安全边界：路由只决定检索次数，不改变知识库内容与权限边界，越权问题不得因路由而绕过访问控制。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Adaptive-RAG-Query-Routing"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "先判断问题难易再决定要不要检索：简单问题直接答，复杂问题才走多跳检索，省钱又提速。"
user_try: "试试：运营团队日均1200个问题，七成是价格库存这类简单问题，帮我按复杂度分流检索、把成本和延迟降下来。"
whenToUse: "当同一入口的问题复杂度差异大、统一走 RAG 造成成本与延迟浪费时用本卡；需要因果或多跳证据链检索用因果图增强检索；需要压缩上下文用主动剪枝技能。"
workflow: "整理历史问题并标注复杂度等级 → 用文本特征训练复杂度分类器 → 评估分类器准确率与混淆矩阵 → 按复杂度分流到直接生成、单次检索或多跳检索 → 记录各路由的延迟与准确率并持续校准"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Adaptive-RAG — 自适应查询复杂度路由

## ① 解决的问题

运营团队面临知识库查询成本高且延迟不稳定——自适应路由将简单查询成本降低70%，整体API成本-35%，年化节省28万元

## ② 核心算法逻辑

核心思想：通过查询复杂度分类器动态路由，实现「按需检索」——简单问题跳过检索直接生成，复杂问题触发多跳迭代检索，在延迟与准确率间找到最优平衡点。

## ③ 业务应用场景

- 业务问题：母婴跨境电商运营团队日均处理1200+问题（价格查询、库存、物流、竞品分析等），当前统一调用RAG系统，月均API成本¥18,000，其中70%用于「今日价格」「库存状态」等简单问题，造成成本浪费；同时平均响应延迟2.8秒，影响客户体验。
- 数据要求：(1) 历史问题库3000+条（含复杂度标注）；(2) 每条问题的检索策略记录与准确率反馈；(3) 竞品数据库、价格表、库存系统的实时连接。
- 预期产出： - 简单问题（30%）：直接LLM生成，0次API调用，响应延迟<0.3秒，准确率98% - 中等问题（50%）：单次检索，1次API调用，响应延迟0.8秒，准确率96% - 复杂问题（20%）：迭代多跳检索，3-5次API调用，响应延迟2.2秒，准确率94%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境运营团队面临「高成本低效率」困境（月均API成本¥18,000，平均延迟2.8秒）——Adaptive-RAG将成本改善为¥7,200、延迟改善为1.2秒，年化ROI约¥129,600（API成本节省）+ 客户满意度提升带来的销售增长（保守估计年增收¥200,000+）。
实施难度：⭐⭐⭐☆☆（需要标注300-500条问题数据训练分类器，集成现有RAG系统，测试周期2-3周）
优先级：⭐⭐⭐⭐☆（高ROI、低风险、快速见效，是成本优化的首选方案）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
import time

# ============ 内嵌示例数据：母婴跨境电商问题库 ============
np.random.seed(42)

# 生成示例问题数据
questions_data = {
    'question': [
        '婴儿推车今天价格多少？',  # 简单
        '有机辅食库存还有吗？',  # 简单
        '暖奶器与竞品相比优势是什么？',  # 中等
        '最近一周销售趋势如何？',  # 中等
        '供应链中有哪些风险因素，如何优化成本结构？',  # 复杂
        '多个SKU联动促销策略如何制定？',  # 复杂
        '产品库存状态',  # 简单
        '竞品价格对标分析',  # 中等
        '全链路供应商评估与风险预警机制',  # 复杂
        '婴儿奶粉保质期查询',  # 简单
    ] * 30,  # 扩展到300条
    'complexity': [0, 0, 1, 1, 2, 2, 0, 1, 2, 0] * 30  # 0=简单, 1=中等, 2=复杂
}

df = pd.DataFrame(questions_data)

# ============ 步骤1：特征提取 ============
vectorizer = TfidfVectorizer(max_features=100, ngram_range=(1, 2))
X = vectorizer.fit_transform(df['question']).toarray()
y = df['complexity'].values

# 添加启发式特征：问题长度、关键词数量
question_lengths = df['question'].str.len().values.reshape(-1, 1)
keyword_counts = df['question'].str.split().str.len().values.reshape(-1, 1)
X = np.hstack([X, question_lengths, keyword_counts])

# ============ 步骤2：训练复杂度分类器 ============
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

classifier = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
classifier.fit(X_train, y_train)

# 评估分类器
y_pred = classifier.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"[分类器准确率] {accuracy:.2%}")
print(f"[混淆矩阵]\n{confusion_matrix(y_test, y_pred)}\n")

# ============ 步骤3：定义路由策略 ============
class AdaptiveRAGRouter:
    def __init__(self, classifier, vectorizer):
        self.classifier = classifier
        self.vectorizer = vectorizer
        self.api_call_count = 0
        self.total_latency = 0
        self.results = []
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2403.14403 — Adaptive-RAG: Learning to Adapt Retrieval-Augmented Large Language Models through Question Complexity

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史问题库（含复杂度标注，通常需 3000 条以上、其中 300-500 条用于训练）、各问题的检索策略记录与准确率反馈，以及价格表、库存、竞品库等业务系统的实时连接。

**输出**：每条问题的复杂度判定与路由决策（直接生成、单次检索或多跳迭代检索），附分流后的 API 调用次数、响应延迟与准确率分布，供团队监控成本与体验。

## 执行步骤

1. 整理历史问题并按简单、中等、复杂三级标注复杂度
2. 提取文本特征并训练复杂度分类器
3. 评估分类器准确率与混淆矩阵
4. 按复杂度分流到直接生成、单次检索或多跳迭代检索
5. 记录各路由的调用次数、延迟与准确率
6. 按反馈持续校准分类器与路由阈值

## 边界与不做

- 何时不用：问题库规模过小、或缺少复杂度标注导致分类器不可靠时不适用。
- 能力边界：只做路由决策，检索器与知识库本身的质量需单独保障；分类效果依赖 300-500 条起步的标注数据。
- 安全边界：路由只决定检索次数，不改变知识库内容与权限边界，不得因路由绕过访问控制。

## 技能关联

- **前置**：Skill-Dense-Passage-Retrieval.html、Skill-Dense-Passage-Retrieval、Skill-HyDE-Hypothetical-Document.html、Skill-HyDE-Hypothetical-Document、Skill-LLMLingua-Context-Compression.html、Skill-LLMLingua-Context-Compression、Skill-Modular-RAG-Architecture.html、Skill-Modular-RAG-Architecture、Skill-Multi-Hop-Reasoning、Skill-Query-Expansion-Contrastive、Skill-Query-Understanding、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **延伸**：Skill-LLMLingua-Context-Compression.html、Skill-LLMLingua-Context-Compression、Skill-Modular-RAG-Architecture.html、Skill-Modular-RAG-Architecture、Skill-Multi-Hop-Reasoning、Skill-Query-Expansion-Contrastive、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **可组合**：Skill-LLMLingua-Context-Compression.html、Skill-LLMLingua-Context-Compression、Skill-Query-Expansion-Contrastive、Skill-Adaptive-RAG-Query-Routing

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-Adaptive-RAG-Query-Routing`