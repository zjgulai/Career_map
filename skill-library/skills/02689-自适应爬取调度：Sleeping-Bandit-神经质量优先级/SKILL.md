---
name: "p2s-adaptive-crawl-scheduling"
title: "Adaptive Crawl Scheduling — 自适应爬取调度：Sleeping Bandit + 神经质量优先级"
description: "触发词：爬取调度、自适应采集、Bandit分配、抓取预算、质量优先级。何时不用：只需按固定频率抓取且预算充裕时用普通采集管道；需要解析文档版面结构时用文档解析类技能。安全边界：抓取须遵守目标站点 robots 协议与平台条款，不得用调度策略绕开限流或反爬约束。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Adaptive-Crawl-Scheduling"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按页面更新频率和数据质量动态分配抓取预算，把调用花在真有变化的页面上，坏页面直接休眠。"
user_try: "试试：把这 50 万 SKU 的抓取任务按类目分臂，用 Bandit 动态分配每日预算，并把长期低质量的页面关掉。"
whenToUse: "抓取预算有限、页面更新频率差异大，需要动态分配调用时用本技能；固定频率即可满足、预算不紧张时不必引入。"
workflow: "按类目、排名、更新频率把 SKU 分成若干臂 → 用质量分类器评估每页数据完整度 → 按 Bandit 动态分配预算，平衡探索与利用 → 对低质量臂启用睡眠机制释放调用额度 → 跟踪中断率与完整度并持续调整"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Adaptive Crawl Scheduling — 自适应爬取调度：Sleeping Bandit + 神经质量优先级

## ① 解决的问题

数据采集主管面临爬虫频繁失效——Adaptive Crawl将采集中断率12%压到3%，年化省19万元

## ② 核心算法逻辑

用多臂赌徒算法（Sleeping Bandit）动态分配爬取预算，结合神经质量分类器实时评估页面价值，在有限爬取配额下最大化目标数据覆盖率。

## ③ 业务应用场景

业务问题： - Amazon 母婴类目（Baby Products, Maternity）日均新增 500+ SKU，更新 2 万+ 页面 - 传统定时爬虫每天消耗 15 万次 API 调用，但 40% 页面无实质更新（库存、价格、评价无变化） - 跨境电商平台需在 6 小时内同步新品和价格变动，但 API 成本高达 ¥8 万/月
具体数据规模： - 目标爬取：50 万 SKU，日均更新率 4%（2 万页面） - 爬取预算：每天 6 万次 API 调用（成本 ¥1.6 万/天） - 质量目标：采集页面数据完整度 >99%（包含价格、评价、图片、描述）
Adaptive Crawl Scheduling 方案： 1. 初始化 Bandit：将 50 万 SKU 分为 100 个"臂"（按类目、销售排名、更新频率分组） 2. 质量评估：LLM 分类器评估每个页面的数据完整度（是否包含价格、评价数、图片 URL） 3. 动态分配： - 第 1 天：均匀探索 100 个臂，发现排名前 20% 的 SKU 更新频率 3 倍高 - 第 3 天：Bandit 收敛，60% 预算分配给高频更新臂，40% 预算用于探索新品 - 第 7 天：睡眠机制关闭 30 个低质量臂（数据完整度 <80%），释放 1.8 万次调用

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

实施成本：工程 2 人月 + 模型训练 1 人月 = ¥60 万
回本周期：¥760 万 / ¥60 万 = 12.7 个月
3 年累计收益：¥760 万 × 3 - ¥60 万 = ¥2,220 万
✓ 易：Sleeping Bandit 算法相对成熟，代码实现 <300 行
✓ 易：神经分类器可用标准库实现，无需复杂深度学习框架
⚠ 中：需要 500+ 标注样本训练质量分类器（1-2 周标注工作）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（271 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/adaptive_crawl_scheduling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Adaptive-Crawl-Scheduling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Adaptive-Crawl-Scheduling: Sleeping Bandit + Neural Quality Classifier
完整可运行实现，仅依赖 numpy/pandas/sklearn
"""

import numpy as np
import pandas as pd
from collections import defaultdict
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from scipy.special import expit  # sigmoid function


class NeuralQualityClassifier:
    """
    神经质量分类器：评估爬取页面的价值 (0-1)
    输入：页面特征向量 (完整度、评价数、更新频率等)
    输出：质量分数 Q_page ∈ [0,1]
    """
    def __init__(self, input_dim=5, hidden_dim=16):
        self.W1 = np.random.randn(input_dim, hidden_dim) * 0.01
        self.b1 = np.zeros((1, hidden_dim))
        self.W2 = np.random.randn(hidden_dim, 1) * 0.01
        self.b2 = np.zeros((1, 1))
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def relu(self, x):
        return np.maximum(0, x)
    
    def relu_derivative(self, x):
        return (x > 0).astype(float)
    
    def forward(self, X):
        """前向传播"""
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.relu(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.output = expit(self.z2)  # sigmoid
        return self.output
    
    def backward(self, X, y, learning_rate=0.01):
        """反向传播"""
        m = X.shape[0]
        dz2 = (self.output - y) / m
        dW2 = np.dot(self.a1.T, dz2)
        db2 = np.sum(dz2, axis=0, keepdims=True)
        
        da1 = np.dot(dz2, self.W2.T)
        dz1 = da1 * self.relu_derivative(self.z1)
        dW1 = np.dot(X.T, dz1)
        db1 = np.sum(dz1, axis=0, keepdims=True)
        
        self.W2 -= learning_rate * dW2
        self.b2 -= learning_rate * db2
        self.W1 -= learning_rate * dW1
        self.b1 -= learning_rate * db1
    
    def fit(self, X, y, epochs=50, learning_rate=0.01):
        """训练分类器"""
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2602.11874 — Efficient Crawling for Scalable Web Data Acquisition (Extended Version)

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：目标 SKU 清单与分组维度、每日 API 调用预算、页面质量标签（是否含价格、评价数、图片 URL）与历史更新频率，粒度到单个 SKU 页面。

**输出**：分臂的抓取预算分配方案与调度决策、页面质量评分与休眠名单，以及中断率与数据完整度统计，供数据采集主管使用。

## 执行步骤

1. 把目标 SKU 按类目、销售排名、更新频率分成若干抓取臂
2. 用质量分类器评估样本页面的数据完整度
3. 按 Bandit 结果把每日预算分给高更新频率的臂并留出探索额度
4. 对长期低完整度的臂启用睡眠机制并释放调用额度
5. 跟踪采集中断率与页面完整度，按周调整分组

## 边界与不做

- 页面更新频率差异很小、或抓取预算不受限时收益有限；拿不到页面质量标签时分类器无从训练。
- 本技能负责抓取调度与预算分配，不做页面解析与字段抽取，也不承担反爬对抗。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling
- **延伸**：Skill-Real-Time-Inventory-Sync、Skill-Web-Page-Change-Detection.html、Skill-Web-Page-Change-Detection
- **可组合**：Skill-API-Rate-Limit-Optimization、Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-Market-Signal-Realtime-Collection.html、Skill-Market-Signal-Realtime-Collection、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Adaptive-Crawl-Scheduling

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Adaptive-Crawl-Scheduling`