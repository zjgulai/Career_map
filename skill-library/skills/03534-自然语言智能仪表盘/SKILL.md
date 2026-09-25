---
name: "p2s-nl2dashboard-automation"
title: "NL2Dashboard Automation（自然语言→智能仪表盘）"
description: "触发词：自然语言问数、图表自动生成、多市场对比、趋势线、BI需求秒级响应。何时不用：指标口径还没统一时先做数仓规范化再上问数；要归因分析而非出图时用 SHAP 或分析类技能。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-NL2Dashboard-Automation"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "运营用一句自然语言描述需求，系统自动选图型、算指标并附上一句洞察，不必再等 BI 排期。"
user_try: "试试：对比吸奶器在美国、德国、日本过去 12 周的周销售额，显示趋势线和同比增长率。"
whenToUse: "属于「业务工具实现」：需要把自然语言问数直接变成可交互图表、缩短 BI 等待时用；若指标口径尚未统一，先做数据仓库规范化；若要归因分析而非出图，用 SHAP 或分析类技能。"
workflow: "接收自然语言问题，做多层意图识别 → 解析维度、指标与时间范围，映射到可用字段 → 按意图自适应选择图型：多折线、柱状、雷达等 → 生成图表与口径说明，并附一句自动洞察 → 把常用问法沉淀为模板，降低后续解析成本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# NL2Dashboard Automation（自然语言→智能仪表盘）

## ① 解决的问题

运营询问"美德两国周销量对比加趋势线"需等 BI 工程师排期 3-5 天——NL2Dashboard 将自然语言直接转为可视化图表，BI 需求响应从天级压缩到秒级，节省开发人力 15-25 万元/年

## ② 核心算法逻辑

核心思想：通过多层级意图识别与自适应图表映射，将自然语言运营需求实时转化为可交互的BI仪表盘，无需SQL编写。

## ③ 业务应用场景

业务问题：运营需要快速对比吸奶器在美国、德国、日本三个核心市场的周销售表现和增长趋势，以决定下周营销预算分配。传统做法需要BI团队编写SQL+配置仪表盘，周期3-5天。
具体操作：运营在NL2Dashboard输入框说："对比吸奶器在美国、德国、日本过去12周的周销售额，显示趋势线和同比增长率"
系统自动生成： - 图表类型：多折线图（3条国家线+趋势线） - 指标：周销售额、同比增长率 - 维度：国家、周次 - 自动洞察："德国周均销售增速8.2%（环比+3.1%），美国3.1%，日本5.7%。德国市场动能最强，建议增加德国营销预算15%"

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

需要数据仓库规范化（1-2周）
NLP模型训练与词表构建（2-3周）
系统集成与测试（1-2周）
直接提升运营效率，ROI明显
母婴出海团队高频需求（日均5-10次查询）
易于推广（无需用户学习成本）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（281 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_agent_llm/nl2dashboard_automation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-NL2Dashboard-Automation.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict
import json

# ==================== 数据准备 ====================
def generate_sample_data():
    """生成母婴出海销售数据样本"""
    np.random.seed(42)
    dates = pd.date_range(start='2026-01-01', periods=12, freq='W')
    countries = ['USA', 'Germany', 'Japan']
    products = ['breast_pump_A', 'breast_pump_B', 'infant_formula_C']
    
    data = []
    for date in dates:
        for country in countries:
            for product in products:
                base_sales = {'USA': 5000, 'Germany': 3000, 'Japan': 2500}[country]
                trend = (date - dates[0]).days * 50
                noise = np.random.normal(0, 500)
                sales = base_sales + trend + noise + np.random.randint(-1000, 1000)
                
                data.append({
                    'date': date,
                    'country': country,
                    'product': product,
                    'sales': max(0, int(sales)),
                    'units': max(0, int(sales / 100)),
                    'ctr': round(np.random.uniform(0.02, 0.08), 4),
                    'conversion_rate': round(np.random.uniform(0.01, 0.05), 4),
                    'acos': round(np.random.uniform(0.3, 0.7), 2)
                })
    
    return pd.DataFrame(data)

# ==================== NL意图识别 ====================
class IntentRecognizer:
    """自然语言意图识别引擎"""
    
    def __init__(self):
        self.intent_keywords = {
            'trend': ['趋势', '变化', 'trend', 'growth', '增长', '下降'],
            'comparison': ['对比', '对照', 'vs', 'comparison', '差异', '区别'],
            'distribution': ['分布', '占比', 'distribution', '比例', '构成'],
            'ranking': ['排序', '排名', 'ranking', 'top', '最高', '最低'],
            'correlation': ['关系', '相关', 'correlation', '影响', '驱动']
        }
        
        self.chart_mapping = {
            'trend': 'line',
            'comparison': 'bar',
            'distribution': 'histogram',
            'ranking': 'bar',
            'correlation': 'scatter'
        }
        
        self.metric_keywords = {
            'sales': ['销售', '销量', 'sales', 'revenue', '收入'],
            'ctr': ['ctr', '点击率', 'click-through'],
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：规范化后的数据仓库表与统一指标口径（卡页提示上线前需 1-2 周数据仓库规范化）、业务词表与用户查询语句。

**输出**：可交互图表与自动洞察：卡页示例把多国周销售额对比直接出成多折线图并给出德国周均增速 8.2% 等结论，BI 需求响应从天级压到秒级。

## 执行步骤

1. 接收自然语言问题，做多层意图识别
2. 解析维度、指标与时间范围，映射到可用字段
3. 按意图自适应选择图型并生成图表
4. 补充口径说明与一句自动洞察
5. 把高频问法沉淀为模板，降低后续解析成本

## 边界与不做

- 数据不满足时不用：数据仓库未规范化、指标口径不统一时先别上问数，卡页提示需要 1-2 周的数据治理前置。
- 能力边界：本卡产出图表与描述性洞察，不做因果归因，也不承担指标口径治理。

## 技能关联

- **前置**：Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Root-Cause-Analysis-Agent.html、Skill-Root-Cause-Analysis-Agent
- **可组合**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Data-to-Dashboard-Multi-Agent-Visualization.html、Skill-Data-to-Dashboard-Multi-Agent-Visualization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-NL2Dashboard-Automation

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-NL2Dashboard-Automation`