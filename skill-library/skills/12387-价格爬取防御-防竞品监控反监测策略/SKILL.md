---
name: "p2s-price-scraping-defense"
title: "Price Scraping Defense — 价格爬取防御（防竞品监控+反监测策略）"
description: "触发词：价格爬取防御、跟价检测、反爬虫、价格混淆、随机微浮动、竞品监控。何时不用：已确认对方在跟价、只差反制节奏时用「混合策略定价不可预测性」；要持续监测竞品价格本身用「实时竞品重定价」。安全边界：价格混淆只对爬虫生效，真实用户必须看到真实价格；反爬不得误伤正常用户流量。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 访问控制"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Price-Scraping-Defense"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "先判断对方是不是在用爬虫盯你的价，再用流量检测和随机微浮动让跟价算法失效。"
user_try: "试试：我每次降价 5 分钟内竞品就同步跟价，帮我判断对方是不是在用爬虫，并给一版防御策略。"
whenToUse: "当怀疑竞品用自动化爬虫实时监控你的价格、需要检测并设计防御策略时用本技能；若已确认跟价行为、要设计随机化调价节奏，用「混合策略定价不可预测性」；若要持续监测竞品价格本身，用「实时竞品重定价」。"
workflow: "汇总自身价格变更日志与竞品价格变更时间序列 → 用检测函数计算跟价延迟分布与检测置信度 → 输出爬虫流量异常与跟价行为报告 → 给出价格混淆与随机微浮动等反监测策略建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Price Scraping Defense — 价格爬取防御（防竞品监控+反监测策略）

## ① 解决的问题

运营面临"竞品实时跟价导致陷入价格战螺旋毛利持续压缩"——反监测策略使竞品跟价失效率提升80%，年化保护定价主动权价值20-40万元

## ② 核心算法逻辑

竞品通过自动化爬虫实时监控你的价格并秒速跟价，导致陷入价格战螺旋。防御策略分三层：①检测爬虫流量（UA特征/请求频率异常）②展示价格混淆（对爬虫展示假价格）③随机微浮动（价格在±0.5%范围内随机浮动，让跟价算法失效）。同时建立竞品跟价检测模型。

## ③ 业务应用场景

场景1：婴儿奶粉竞品自动跟价防御 - 业务问题：降价后5分钟内竞品同步跟价，判断对方有实时爬虫监控 - 数据要求：自身价格变更日志 + 竞品价格变更时间序列 - 预期产出：竞品跟价延迟分布 + 爬虫流量异常报告 + 反监测策略建议 - 业务价值：有效防御价格战，年化保护定价主动权价值20-40万元
**三轨验证**： - 成本：反爬虫系统开发约5人天 - 合规：价格混淆对真实用户展示真实价格，合规 - 风险：过于激进的反爬可能误伤真实用户流量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：有效防御价格战，年化保护定价主动权价值20-40万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：有效防御价格战，年化保护定价主动权价值20-40万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（21 行）。**下面 21 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **21 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，21 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def detect_competitor_scraping(own_price_changes, competitor_price_changes, 
                                window_minutes=10):
    follow_delays = []
    for t_own, p_own in own_price_changes:
        for t_comp, p_comp in competitor_price_changes:
            delay = t_comp - t_own
            if 0 < delay <= window_minutes and abs(p_comp - p_own * 0.99) < 0.5:
                follow_delays.append(delay)
    if not follow_delays: return {"scraping_detected": False}
    avg_delay = np.mean(follow_delays)
    return {"scraping_detected": True, "avg_follow_delay_min": round(avg_delay,1),
            "confidence": "HIGH" if avg_delay < 3 else "MEDIUM"}

own = [(0,29.99),(60,27.99),(120,31.99)]
comp = [(2,29.49),(62,27.49),(123,31.49)]
result = detect_competitor_scraping(own, comp)
print(f"爬虫检测: {result}")
assert result["scraping_detected"]
print("[✓] Price Scraping Defense 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：自身价格变更日志（时间戳与价格）与竞品价格变更时间序列；粒度为 SKU 的价格变更事件序列。

**输出**：竞品跟价延迟分布、爬虫检测结论（含置信度）与反监测策略建议；供运营决定是否加装反爬与随机浮动机制。

## 执行步骤

1. 汇总自身与竞品的价格变更时间序列
2. 用检测函数计算跟价延迟分布与置信度
3. 输出爬虫流量异常与跟价检测结论
4. 给出价格混淆与随机微浮动的反监测建议

## 边界与不做

- 数据不满足：价格变更点太少时无法判断是否被跟价，工具会直接返回未检测到。
- 何时不用：已确认跟价、只差反制节奏时用「混合策略定价不可预测性」；竞品价格监测本身用「实时竞品重定价」。
- 能力边界：只做检测与策略建议，不含反爬系统部署、WAF 配置与流量清洗。
- 安全边界：价格混淆只对爬虫生效，真实用户必须看到真实价格，反爬不得误伤正常流量。

## 技能关联

- **可组合**：Skill-Price-Scraping-Defense

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Price-Scraping-Defense`