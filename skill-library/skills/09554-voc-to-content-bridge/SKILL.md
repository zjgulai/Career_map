---
name: voc-to-content-bridge
version: 1.0.0
description: >
  VOC (Voice of Customer) 洞察→内容策略的桥接 skill。
  将 customer-feedback-analysis 输出的 VOC 信号（痛点/称赞/竞品信号/安全告警）转换为内容策略输入。
  核心能力：痛点→钩子映射、称赞→放大方向、竞品差距→差异化角度、安全告警→危机回应内容。
  输出格式与 multi-scenario-pipeline-design 的 content_strategy_input 兼容。
  这是跨域编排的核心 Bridge Skill（参见 cross-domain-orchestration-audit）。
source: https://github.com/zjgulai/hermes-skills (cross-domain bridge skill)
---
# V0C→Content Bridge 🧩

VOC 洞察到内容策略的结构化转换桥。

## Why This Exists

VOC 洞察（痛点/称赞/竞品信号）和内容生成（视频/帖子/广告）是两个独立的能力域。
VOC-Agent 输出的是分析报告，内容 Pipeline 需要的是内容 brief。
这两者的接口不匹配，中间需要一个转换层。

**这个转换层的使命：** 把"用户说了什么"翻译成"我们应该做什么内容"。

## 输入输出 Schema

### 输入（来自 customer-feedback-analysis 的输出）

```json
{
  "alert_level": "P0|P1|P2|P3|null",
  "summary": "string — 一句话摘要",
  "pain_points": [
    {"topic": "string", "frequency": "integer", "severity": "P0|P1|P2|P3", "trend": "up|down|stable"}
  ],
  "praise_patterns": [
    {"topic": "string", "frequency": "integer", "trend": "up|down|stable"}
  ],
  "feature_requests": [
    {"topic": "string", "count": "integer"}
  ],
  "competitive_signals": [
    {"competitor": "string", "mentioned_in": "integer", "advantage": "string"}
  ],
  "safety_flags": [
    {"keyword": "string", "product": "string", "reviews": ["string"]}
  ],
  "content_strategy_input": {
    "suggested_hooks": ["string"],
    "urgent_topics": ["string"],
    "best_praise_to_amplify": "string",
    "competitive_gap_to_address": "string"
  }
}
```

### 输出（本 bridge 的产出）

```json
{
  "scenario": "product_to_video|brand_campaign",
  "priority": "P0|P1|P2|P3",
  "campaign_brief": {
    "objective": "respond_to_concern|amplify_strength|address_gap|crisis_management",
    "product": "string",
    "target_audience": "pump_users|expecting_moms|new_moms",
    "key_message": "string",
    "hook_angle": "concern_addressing|comparison|demonstration",
    "suggested_hooks": ["string"],
    "script_outline": {
      "hook": "string",
      "pain": "string",
      "solution": "string",
      "social_proof": "string",
      "cta": "string"
    },
    "visual_style": "string",
    "platform_priority": ["string"],
    "urgency": "within_24h|this_week|this_month|scheduled"
  },
  "cross_reference": {
    "source_skill": "customer-feedback-analysis",
    "source_alert": "P0|P1|P2|P3|null",
    "trigger_timestamp": "ISO8601 timestamp"
  }
}
```

## 转换流程

### Step 1: 接收 VOC 输出
```python
# 来自 customer-feedback-analysis 的输出
voc_output = {
    "alert_level": "P1",
    "pain_points": [
        {"topic": "背带容易滑落", "frequency": 18, "severity": "P1", "trend": "up"},
        {"topic": "吸奶器噪音大", "frequency": 12, "severity": "P2", "trend": "stable"}
    ],
    "praise_patterns": [
        {"topic": "吸力舒适", "frequency": 30, "trend": "stable"},
        {"topic": "电池续航好", "frequency": 22, "trend": "up"}
    ],
    "competitive_signals": [
        {"competitor": "Elvie", "mentioned_in": 15, "advantage": "更安静"},
        {"competitor": "Willow", "mentioned_in": 8, "advantage": "更小巧"}
    ],
    "content_strategy_input": {
        "suggested_hooks": ["背带真的会滑吗？", "吸奶器到底有多吵？"],
        "urgent_topics": ["背带防滑设计说明"],
        "best_praise_to_amplify": "吸力舒适度获得 30/50 好评",
        "competitive_gap_to_address": "Elvie 更安静被提及 15 次而我们只有 3 次"
    }
}
```

### Step 2: 生成内容策略

```json
{
  "scenario": "product_to_video|brand_campaign",
  "priority": "P0|P1|P2|P3",
  "campaign_brief": {
    "objective": "respond_to_concern|amplify_strength|address_gap|crisis_management",
    "product": "S12 Pro",
    "target_audience": "pump_users|expecting_moms|new_moms",
    "key_message": "S12 Pro 的防滑背带设计——我们在 200 位妈妈的真实测试中验证了零滑落",
    "hook_angle": "concern_addressing|comparison|demonstration",
    "suggested_hooks": [
      "背带滑落是设计问题还是使用问题？",
      "Elvie 更安静？我们测了分贝值"
    ],
    "script_outline": {
      "hook": "评论区最多人问的问题：背带到底会不会滑？",
      "pain": "很多妈妈用过其他品牌后都有这个担心",
      "solution": "我们设计了双重防滑结构，200 位妈妈测试验证",
      "social_proof": "吸力舒适度获得 30/50 好评",
      "cta": "点击查看防滑背带设计详解"
    },
    "visual_style": "product_demo_with_trust_signals",
    "platform_priority": ["tiktok", "amazon", "shopify"],
    "urgency": "within_24h"
  },
  "cross_reference": {
    "source_skill": "customer-feedback-analysis",
    "source_alert": "P1",
    "trigger_timestamp": "2026-05-04T09:00:00Z"
  }
}
```

### Step 3: 传递到内容 Pipeline

输出的 campaign_brief 可直接作为下游 pipeline 的输入。
- 如果 priorit= P0 → 触发 brand_campaign 场景（安全告警需要品牌背书）
- 如果 priority=P1/P2 → 触发 product_to_video 场景（痛点回应）
- 如果 priority=P3 → 加入内容排期队列

## 转换规则（确定性的映射逻辑）

| 输入信号 | 内容策略 | 场景 | 示例 |
|---------|---------|------|------|
| 安全相关 P0 告警 | 危机回应 + 品牌安全背书视频 | 品牌宣传 | 窒息/过敏告警 → 安全认证讲解视频 |
| 单痛点高频（>15） | 痛点回应视频（hook→证明→解决） | 产品直出 | 背带滑落 → 防滑设计测试视频 |
| 称赞高频（>20） | 放大视频（真实用户好评展示） | 产品直出 | 吸力舒适 → 妈妈真实体验分享 |
| 竞品差距显著 | 对比差异视频 + 参数对比 | 产品直出 | Elvie 更安静 → 分贝对比测试 |
| 新话题出现（P3） | 调研性内容（先测试再产出） | 先用 lightweight 测试反馈再决定 | 突然有人问"可以躺着用吗" |
| 多痛点同时爆发 | 综合品牌回应视频 | 品牌宣传 | 多个产品线同时差评 → 品牌升级承诺视频 |

## 一句话调用

> "把上周的 VOC 分析结果转成这周的内容策略"

## 后续推荐改良方向

1. **A/B 测试反馈回路**：内容上线后追踪效果，比较"痛点回应视频"vs"称赞放大视频"的转化差异，自动优化转换规则
2. **内容排期系统**：当前每次手动调用，后续可接入 cronjob 实现自动排期（P0 立即/P1 24h/P2 本周/P3 规划中）
3. **多产品聚合**：当前单次处理一个产品/一条 VOC 信号，后续支持全产品线的聚合内容策略
4. **规则权重学习**：当前转换规则是静态的，后续可基于内容效果数据自动调整（如发现"竞品对比"类视频转化效果更好，提高该类型的触发优先级）

## Usage

> "从 S12 Pro 最近差评里提取内容策略，做一条回应视频的 brief"
> "Momcozy Seamless Bra 的点赞评论集中在舒适度，帮我规划放大内容"
> "竞品对比中 Elvie 提到安静性优势 15 次——生成一条对比测试视频策略"
