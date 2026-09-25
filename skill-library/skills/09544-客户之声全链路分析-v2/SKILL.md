---
name: customer-feedback-analysis
version: 2.0.0
description: > 
  V0C (Voice of Customer) Agent for 母婴跨境电商. 全量升级版 — 合并 product-review-analysis 能力。
  覆盖跨平台评论聚合、声量追踪、情感温度、竞品交叉信号、安全关键词告警、追评分析、VOC→Content 桥接输出。
  5步LLM工作流：采集→聚类→评分→信号提取→动作建议。
  输入 Amazon/Shopify/TikTok/Etsy 评论原始数据，输出结构化VOC报告+可触发告警的Json载荷。
source: https://github.com/nexscope-ai/eCommerce-Skills (upgraded v2.0)
---
# V0C Agent — 客户之声全链路分析 (v2.0) ⭐

**升级说明**：此 skill v2.0 合并了原 `product-review-analysis` 的全部能力，并新增声量追踪、竞品交叉信号、VOC→Content 桥接输出。使用此 skill 时无需再单独加载 product-review-analysis。

## 母婴行业反馈特殊性

- **安全焦虑**: 窒息、过敏、松动、断裂等安全关键词需立即标记为 P0 告警
- **细节敏感**: 妈妈用户关注材质、尺寸、舒适度、色差等细节
- **情感因素**: 购买决策高度情感驱动，负面评论影响远大于正面
- **口碑传播**: 妈妈社群口碑传播效应强，一条负面评论可能在社群中被放大
- **复购信号**: 消耗品的复购评论是重要指标，反映产品粘性
- **对比行为**: 妈妈用户常在评论中对比竞品，这是竞品数据的直接来源
- **长文倾向**: 母婴产品评论往往更详细，含有更多使用场景描述
- **追评现象**: 使用一段时间后的追评很有价值——反映产品耐用性和长期体验

## 5步工作流

**Step 1: 采集 (Collect)**
- 跨平台评论聚合框架（Amazon / Shopify / TikTok Shop / Etsy）
- 评论去重（同用户跨平台发言）
- 时间戳归一化，支持按时间窗口提取（last_7d / last_30d / last_quarter / custom）
- URL 或 CSV 批量导入

**Step 2: 聚类 (Cluster)**
- 痛点聚类：按关键词+语义分组，输出频率排名
- 称赞聚类：提取高频 praise pattern
- 特征需求：用户 feature request 归类
- 对比信号：所有"比 X 品牌好/差"提及

**Step 3: 评分 (Score)**
- 整体情感趋势（7天/30天滑动）
- 各维度满意度评分（安全/材质/尺寸/舒适度/客服/物流）
- 评论真实性信号检测（批量异常/同IP/模板化内容标记）
- 照片评论权重自动提升

**Step 4: 信号提取 (Signal)**
- **P0 告警**: 安全关键词命中 → 立即输出告警 payload
- **P1 信号**: 情感急速下滑（7天降幅 > 15%）→ 建议根因分析
- **P2 信号**: 竞品对比集中爆发（某竞品被连续提及）→ 竞品动态预警
- **P3 信号**: 新话题出现（之前从未被提及的话题突然出现）→ 趋势预警

**Step 5: 动作建议 (Action)**
输出可直接被下游消费的动作载荷：

```json
{
  "alert_level": "P0|P1|P2|P3|null",
  "summary": "一句话摘要",
  "pain_points": [{"topic": "安全扣松脱", "frequency": 23, "severity": "P0", "trend": "up"}],
  "praise_patterns": [{"topic": "面料柔软", "frequency": 45, "trend": "stable"}],
  "feature_requests": [{"topic": "建议加长背带", "count": 8}],
  "competitive_signals": [{"competitor": "Brand X", "mentioned_in": 12, "advantage": "更透气"}],
  "safety_flags": [{"keyword": "窒息", "product": "S12 Pro", "reviews": ["R123"]}],
  "content_strategy_input": {
    "suggested_hooks": ["安全扣的秘密测试", "妈妈们最担心的事"],
    "urgent_topics": ["安全扣认证说明"],
    "best_praise_to_amplify": "面料柔软度获得 45/50 好评",
    "competitive_gap_to_address": "对手的透气性被提及 12 次而我们只有 3 次"
  }
}
```

## Capabilities 完整列表

- 跨平台评论聚合（Amazon, Etsy, Shopify, TikTok Shop, 自有渠道）
- 情感趋势分析（按时间窗口滑动）
- 痛点分类 + 频率排名
- 特征满意度评分
- 评论真实性信号检测
- 竞品评论对标
- 母婴安全关键词自动标记
- 照片评论分析
- 追评趋势跟踪
- **声量监控**：按产品/关键词的提及量变化
- **竞品交叉信号**：竞品名称提取+双边对比分析
- **VOC→Content 桥接**：直接输出 content_strategy_input 供下游 pipeline 消费
- **P0-P3 告警级别**：严重安全事件到新话题出现
- **评论区截图分析**：通过 vision_analyze 处理用户上传的评论截图

## 输入输出

**输入格式**:
```json
{
  "platform": "amazon|shopify|tiktok|etsy|custom",
  "product_asin": "B0XXXX",
  "timeframe": "last_30d",
  "reviews": [
    {"id": "R123", "text": "...", "rating": 4, "date": "2026-04-01", "images": ["url1"], "verified_purchase": true}
  ]
}
```

**输出格式**:
```json
{
  "summary": {"total_reviews": 200, "avg_rating": 4.3, "sentiment_trend": {"direction": "stable", "7d_avg": 4.2, "30d_avg": 4.3}},
  "clusters": {...},
  "signals": {...},
  "actions": {...}
}
```

## 一句话调用

> "分析 Momcozy S12 Pro 最近 30 天 Amazon 评论，输出 VOC 报告和内容策略建议"

## 后续推荐改良方向

1. **LLM 工作流固化**：当前 5 步靠 prompt 驱动，后续可拆成 LangGraph 5-node pipeline，每步独立可观测
2. **多语言支持**：增加德语/法语/日语评论分析能力，适配欧盟/日本市场
3. **趋势预测**：基于历史数据做情感趋势预测（Prophet/LSTM），预判投诉高峰期
4. **社群舆情接入**：增加 Reddit / Facebook Group / WhatsApp Group 的评论采集能力
5. **竞品库持久化**：竞品交叉信号需要存储竞品名称库，避免同品牌不同拼写被当成多个品牌
6. **告警降噪**：P0 告警目前全量输出，需要加频率限制（同关键词同产品 24h 内只告警一次）

## Usage

> "分析我 S12 Pro 的 500 条 Amazon 评论，找出用户最痛苦的 3 个点和竞品对比信号"
> "Momcozy Seamless Bra 最近 TikTok 评论里有没有安全相关的告警？"
> "对比 S12 Pro 和 Elvie 的用户评论差异"
> "每周自动跑一次全产品线的 VOC 分析，输出策略建议用于下周内容排期"
