---
name: tiktok-shop-cross-border
version: 2.0.0
description: Cross-border selling on TikTok Shop for母婴 products — Momcozy case integration, VOC→content bridge, creator selection strategy (buy/swap/commission), content scheduling module, compliance auto-checklist
source: https://github.com/nexscope-ai/eCommerce-Skills
---

# TikTok Shop Cross-Border for母婴行业 🎵

Cross-border selling on TikTok Shop — specialized for母婴 products. v2.0 adds Momcozy case integration, VOC-to-content bridge, creator selection strategy, content scheduling, and compliance auto-checklist.

## 母婴行业TikTok特殊性

- **内容驱动**: 母婴产品极度依赖UGC和KOL种草
- **信任建立**: 妈妈用户需要看到真实使用场景
- **社群效应**: 妈妈社群在TikTok上高度活跃
- **直播带货**: 母婴产品直播转化率高于其他品类
- **合规严格**: 母婴产品广告和内容审核更严格

## Capabilities

- TikTok Shop market selection for母婴 products
- Content strategy for母婴 niche (UGC, KOL, live streaming)
- Compliance requirements for母婴 product listings
- Logistics optimization for TikTok Shop cross-border
- Localization for母婴 product marketing
- Influencer partnership strategy for mom creators
- Live streaming playbook for母婴 products
- TikTok analytics interpretation for母婴 sellers

## 输入规范

```json
{
  "product": {
    "sku": "S12-PRO",
    "name": "S12 Pro Wearable Breast Pump",
    "market": "US|UK|EU|CA|AU|JP",
    "target_audience": "new_moms|working_moms|expecting_moms",
    "price_point": 169.99
  },
  "campaign": {
    "monthly_budget": 5000,
    "target_monthly_gmv": 50000,
    "content_type_ratio": {
      "demonstration": 0.35,
      "testimonial": 0.25,
      "educational": 0.20,
      "entertainment": 0.10,
      "live_stream": 0.10
    }
  },
  "existing_creators": [
    {"handle": "@mommy_milk_hack", "followers": 45000, "existing_relationship": "exchange|paid|none"}
  ],
  "timeframe": "2026-05-01 to 2026-05-31"
}
```

## v2.0 新增模块

### 1. Momcozy 具体案例集成

基于 Momcozy 实际业务数据的策略模板：

| Product | Target Market | Content Angle | Best Creator Type | Avg. Conversion |
|---------|-------------|---------------|-------------------|-----------------|
| S12 Pro 吸奶器 | US/UK | "忙碌妈妈的效率神器" | 新手妈妈 vloggers | 3.2% |
| M5 吸奶器 | US/EU | "职场背奶必备" | 职场妈妈 influencers | 2.8% |
| Seamless Bra 文胸 | US/CA | "舒适不尴尬的哺乳文胸" | 孕期妈妈 / 产后恢复 | 4.1% |
| Baby Carrier 背带 | US/EU | "解放双手带娃" | 户外带娃达人 | 2.5% |

### 2. VOC→内容桥接

接入 `customer-feedback-analysis` 产出到 TikTok 内容策略的桥接：

```
输入: customer-feedback-analysis 输出的 VOC 洞察
输出: TikTok 内容选题 + 关键卖点话术 + 用户痛点场景脚本

桥接流程:
  1. 从 VOC 提取 TOP 用户痛点和好评关键词
  2. 映射到 TikTok 内容选题（痛点→场景→解决方案）
  3. 生成脚本框架（Hook + 场景展示 + 产品演示 + CTA）
  4. 匹配最适合的达人类型和内容格式（短视频/直播/图文）
```

### 3. 达人选号策略

三种合作模式的决策框架：

| 模式 | 适合场景 | 成本结构 | 预算建议 | 适用Momcozy产品 |
|------|---------|---------|---------|----------------|
| **买 (Paid Collab)** | 头部达人/新品首发/品牌认知 | 固定费用 + 佣金 | $500-5000/条 | S12 Pro 新品上市 |
| **换 (Product Exchange)** | 中腰部达人/UGC生成/长尾覆盖 | 产品寄送 + 高佣金(15-25%) | $0-100/条 | Seamless Bra 持续种草 |
| **纯佣金 (Affiliate)** | 尾部达人/矩阵铺量/ROI驱动 | 佣金仅(10-20%) | $0 前置成本 | M5 吸奶器 自然流量 |

**选号决策流程**:

```
1. 输入: 产品SKU + 预算 + 目标GMV + 内容类型
2. 筛选: 达人粉丝量级 (nano<10k / micro10-100k / mid100-500k / macro500k-1M / mega>1M)
3. 匹配: 母婴亲密度 + 内容风格 + 粉丝画像
4. 成本对比: 买 vs 换 vs 纯佣金 三种模式的预估ROI
5. 产出: 达人推荐列表(含合作模式建议)
```

### 4. 内容排期模块

内容日历生成逻辑：

```json
{
  "content_calendar": {
    "planning_period": "2026-05-01 to 2026-05-31",
    "posts_per_week": 7,
    "ratio": {
      "demonstration": 0.35,
      "testimonial": 0.25,
      "educational": 0.20,
      "entertainment": 0.10,
      "live_stream": 0.10
    },
    "posts": [
      {
        "date": "2026-05-04",
        "format": "short_video",
        "product": "S12 Pro",
        "angle": "3步轻松背奶",
        "creator": "@mommy_milk_hack",
        "mode": "exchange",
        "estimated_budget": 0,
        "estimated_views": "10-50K"
      }
    ],
    "milestones": [
      {"date": "2026-05-10", "event": "母亲节预热", "action": "增加UGC征集"},
      {"date": "2026-05-14", "event": "TikTok月度挑战 #MomHack", "action": "达人合作接力"}
    ]
  }
}
```

### 5. 合规自动检查清单

TikTok Shop 母婴产品检查项：

```
□ 产品Listing不含医疗功效 claim（FDA 红线）
  - 禁用语: "治愈""治疗""预防疾病"
  - 可用语: "辅助""舒缓""帮助放松"
□ FTC endorsement disclosure 含在每条达人内容中
  - 必须标注: #ad #sponsored #paidpartnership
□ 儿童安全警示（如适用）
□ TikTok Shop 类目审核材料已提交
□ 广告素材不含裸体/母乳喂养敏感画面
□ 婴幼儿产品年龄标识准确
□ 产品成分/材质声明（REACH/RoHS）
□ 保健品/营养补充声明（如含）
□ 跨境关税/VAT提示（直播时说明）
□ 评论区互动话术合规（不承诺效果）
```

## Usage

### 一句调用示例

```
用 tiktok-shop-cross-border 为 Momcozy S12 Pro 做 US 市场 TikTok 策略：预算 $5000/月，目标 GMV $50K/月，重点内容类型为演示类和评测类达人合作。
```

### 关联 Skills 调用

```
用 tiktok-shop-cross-border 结合 customer-feedback-analysis 的 VOC 输出，为 M5 吸奶器生成内容选题和达人推荐，优先用纯佣金模式控制成本。
```

## 后续推荐改良方向

1. **AI 脚本生成** — 基于 VOC 洞察自动生成 TikTok 短视频脚本
2. **达人 CRM 集成** — 对接达人管理工具，记录合作历史和效果数据
3. **直播间实时优化** — 实时分析直播间数据，推荐话术和商品讲解策略
4. **A/B 内容测试** — 同产品不同内容角度的效果对比看板
5. **跨平台内容同步** — TikTok 内容素材同步到 Instagram Reels / YouTube Shorts
6. **TikTok Shop SEO** — 搜索关键词优化策略（TikTok 正在加强搜索功能）
