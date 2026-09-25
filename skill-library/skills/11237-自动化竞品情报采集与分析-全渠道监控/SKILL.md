---
name: "p2s-agentic-competitor-intelligence"
title: "Agent 自动化竞品情报采集与分析 — Amazon/TikTok 全渠道监控"
description: "触发词：竞品监控、情报简报、价格异动、热词挖掘。何时不用：只需一次性竞品快照时不用自动巡检；判断品类整体趋势用品类趋势预测类技能。安全边界：仅采集公开数据并遵守 robots.txt，建议走官方 API 或合规数据源，不存储个人身份信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-021"
l3_business: "趋势监测"
l3_all: "趋势监测 / 竞品研究"
l1_l2_l3: "业务运营/产品与创新/趋势监测"
p2s_card_id: "Skill-Agentic-Competitor-Intelligence"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "让智能体定期巡检竞品的价格、评论与平台热词，把异动发现从一周缩短到当天。"
user_try: "试试：帮我每周自动巡检 Top-20 竞品 ASIN 的价格与评论变化，输出情报简报。"
whenToUse: "本卡属「趋势监测」。需要持续跟踪竞品价格、评论与内容动向并产出情报简报时用本卡；只判断品类整体趋势方向时用品类趋势预测类技能。"
workflow: "配置竞品清单 → 采集价格与评论时序 → 生成结构化情报 → 输出简报与响应优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent 自动化竞品情报采集与分析 — Amazon/TikTok 全渠道监控

## ① 解决的问题

运营陷入竞品价格/评论变化 T+7 滞后感知困境——引入多渠道 Agent 自动巡检框架（Amazon/TikTok 全渠道），将竞品异动响应窗口从7天压缩至1小时，GMV 防御损失年化减少 15%。

## ② 核心算法逻辑

竞品情报 Agent 是一个感知推理报告的三层自主循环系统，区别于传统爬虫的关键在于 LLM 负责语义理解和跨渠道整合，而非仅做数据搬运。

## ③ 业务应用场景

场景1：暖奶器品类 Amazon 竞品周监控 - 业务问题：竞品突然降价或上线新功能时，往往 T+7 才感知，错过最佳响应窗口 - 数据要求：Top-20 竞品 ASIN、BSR 历史、价格时序、评论星级趋势、产品描述 - 预期产出：每周情报简报，标注「价格威胁」「新功能出现」「差评机会」三类信号 - 业务价值：竞争响应时间从 T+7 缩短至 T+1，避免因价格滞后损失转化 5-15%
场景2：TikTok 母婴热词情报挖掘 - 业务问题：TikTok 热词变化快，人工每日监控耗时且遗漏率高 - 数据要求：母婴品类 TikTok 搜索词排行、热门带货视频脚本文本、评论区高频词 - 预期产出：每日新兴需求词云 + 竞品内容策略分析 + 可直接用的选题建议 - 业务价值：内容选题效率提升 3x，爆款命中率提升约 20%
**三轨验证**： - 成本：采集 API + LLM 分析月成本约 $50-200，远低于人工情报员 - 合规：仅采集公开数据，遵守 robots.txt；不存储个人身份信息 - 风险：Amazon ToS 限制自动化采集，建议使用官方 SP-API 或第三方合规数据源

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：竞争响应速度提升 7x，估算每季度减少因价格滞后导致的转化损失约 2-5 万元
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐☆
评估依据：竞品情报是母婴出海运营的核心竞争壁垒；TikTok 内容竞争激烈，情报延迟直接影响爆款命中率

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（69 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
竞品情报 Agent — Amazon BSR + 价格监控 + LLM 分析
依赖: openai>=1.0, requests, pandas
"""
import json
from dataclasses import dataclass
from openai import OpenAI

client = OpenAI([REDACTED]")

@dataclass
class CompetitorSnapshot:
    asin: str
    name: str
    price: float
    bsr: int
    rating: float
    review_count: int
    delta_bsr_7d: int   # BSR 7天变化（负值=排名上升）
    delta_price_7d: float

# 模拟竞品快照数据（实际应接 SP-API 或第三方数据）
COMPETITORS = [
    CompetitorSnapshot("B08XYZ001", "竞品A暖奶器", 39.99, 1250, 4.3, 2800, -320, -2.0),
    CompetitorSnapshot("B08XYZ002", "竞品B暖奶器Pro", 49.99, 3100, 4.6, 980,  +150,  0.0),
    CompetitorSnapshot("B08XYZ003", "竞品C智能暖奶器", 55.00, 890, 4.1, 3200, -600, -5.0),
]

OWN_SKU = {"name": "自家暖奶器X1", "price": 44.99, "bsr": 2100, "cost_floor": 28.0}

ANALYSIS_PROMPT = """你是母婴跨境电商竞品分析师。根据以下竞品数据，生成情报简报。
必须识别并标注：
1. 【价格威胁】：竞品价格低于我方且BSR上升的
2. 【新机会】：竞品评分<4.2且评论量>1000（说明有差评机会可切入）
3. 【趋势预警】：7天BSR提升>500的竞品
输出格式：JSON，含 threats/opportunities/warnings 三个数组，每条含 asin、reason、recommended_action。"""

def analyze_competitors(competitors: list, own_sku: dict) -> dict:
    data = {
        "own_sku": own_sku,
        "competitors": [vars(c) for c in competitors],
    }
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": ANALYSIS_PROMPT},
            {"role": "user", "content": json.dumps(data, ensure_ascii=False)},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    return json.loads(response.choices[0].message.content)

def format_intelligence_report(analysis: dict) -> str:
    lines = ["=== 竞品情报简报 ==="]
    for threat in analysis.get("threats", []):
        lines.append(f"⚠️ 价格威胁 [{threat['asin']}]: {threat['reason']}")
        lines.append(f"   → 建议: {threat['recommended_action']}")
    for opp in analysis.get("opportunities", []):
        lines.append(f"✅ 机会 [{opp['asin']}]: {opp['reason']}")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：Top 竞品 ASIN 清单、BSR 历史、价格时序、评论星级趋势、产品描述，以及母婴品类社媒搜索词排行与热门带货视频脚本文本。

**输出**：每周情报简报，标注价格威胁、新功能出现、差评机会三类信号；以及每日新兴需求词与选题建议，供运营与内容团队排期。

## 执行步骤

1. 配置竞品 ASIN 与话题清单
2. 按时序采集价格、BSR、评论与内容数据
3. 用分析提示词生成结构化情报（威胁、机会、警示）
4. 输出周报或日报并标注响应优先级

## 边界与不做

- 只需一次性竞品快照、不需要持续监测时不用本卡
- 本卡产出情报与建议，不自动执行改价或投放动作
- 仅采集公开数据并遵守 robots.txt，建议使用官方 API 或合规数据源，不存储个人身份信息

## 技能关联

- **可组合**：Skill-Agentic-Competitor-Intelligence

---

> 分类：业务运营/产品与创新/趋势监测　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Agentic-Competitor-Intelligence`