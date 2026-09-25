---
name: "p2s-cross-platform-user-identity-resolution"
title: "Cross-Platform User Identity Resolution — 跨平台用户 ID 统一"
description: "触发词：身份图谱、概率匹配、跨平台归因、LTV 打通、置信阈值。何时不用：只用邮箱哈希做确定性匹配时用轻量身份统一技能；需要图结构的进一步补全用三层匹配技能，本技能管确定性加概率性两层与图谱沉淀。安全边界：只处理邮件或手机哈希，跨平台 ID 关联须有用户同意（GDPR Art.4(11)）；概率匹配误报会污染图谱，置信阈值取 0.85 以上。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 账号商品映射"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Cross-Platform-User-Identity-Resolution"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "把 TikTok 点击、Amazon 订单、独立站注册对成同一个人的身份图谱，算出真实 ROAS 和全平台 LTV。"
user_try: "试试：把 TikTok 投放点击和 Amazon 订单做一遍身份解析，估算真实 ROAS 和跨平台 LTV。"
whenToUse: "需要同时用确定性规则与概率性行为相似度、并沉淀可复用身份图谱时用本技能；只做哈希确定性匹配用轻量身份统一技能。"
workflow: "先用邮件哈希做确定性匹配 → 再用行为与时间窗口做概率性匹配 → 把结果写入身份图谱并设置信阈值 → 基于图谱重算跨平台归因与 LTV"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Platform User Identity Resolution — 跨平台用户 ID 统一

## ① 解决的问题

数据工程师面临"同一用户在Amazon/TikTok/独立站无法识别导致营销浪费"——跨平台用户ID统一将重复触达率降低45%，年化节省广告预算20-40万元

## ② 核心算法逻辑

跨平台用户 ID 统一（Identity Resolution / Identity Graph）解决同一用户在 Amazon、TikTok、独立站等不同平台使用不同 ID 的碎片化问题。统一后可实现全链路归因（TikTok 广告→独立站→Amazon 回购）和跨平台 LTV 计算。

## ③ 业务应用场景

场景1：TikTok 广告-Amazon 转化全链路归因 - 业务问题：TikTok 投放团队月支出 30 万广告费，但无法证明有多少 Amazon 销售来自 TikTok 广告，传统 last-click 归因低估 TikTok 贡献，导致预算分配错误。 - 数据要求：TikTok 广告点击 ID（tt_click_id）+ Amazon 订单买家邮件哈希 + 独立站注册邮件哈希；三端数据在各自隐私范围内处理 - 预期产出：跨平台 Match Rate 40-60%，TikTok 真实 ROAS 从 1.8x → 3.2x（含跨平台转化），广告预算优化节省 10-15% - 业务价值：广告预
场景2：跨平台 LTV 计算 - 业务问题：只看 Amazon 单平台，用户 LTV 被低估（忽略了独立站复购和 TikTok Shop 二次购买），导致拉新成本 ROI 计算错误，优质用户被错误判定为"低价值"而减少触达。 - 数据要求：三平台购买记录（去 PII）+ 概率性 ID 图谱 - 预期产出：全平台真实 LTV，高价值用户识别率提升 35%，精准投入高 LTV 人群 - 业务价值：高 LTV 用户复购率平均 2.3 倍于普通用户，精准投放提升 ROI 20-30%
**三轨验证**： - 成本：自建 Identity Graph 需 Redis Graph 或 Neptune（AWS），中小团队可用 PostgreSQL JSONB 简化；Match 计算可批处理（日级即可） - 合规：必须使用邮件/手机的哈希值（不可逆），GDPR Art.4(11) 要求有用户同意（consent）才能做跨平台 ID 关联 - 风险：概率性匹配误报会污染 ID 图谱（两个不同用户被合并），需要设置高置信度阈值（0.85+）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：TikTok 广告真实 ROAS 校准，广告预算优化 10-15%，年化节省 30-50 万元（月支出 30 万场景）；高 LTV 用户识别提升精准投放 ROI 20-30%，直接贡献增量 GMV 20-40 万元/年
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐☆
评估依据：跨平台归因是多渠道运营团队的核心需求，尤其是 TikTok+Amazon+独立站三轨并行的母婴出海卖家。Match Rate 每提升 10%，归因准确度和预算优化效果同步提升。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（227 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
跨平台用户 ID 统一演示
确定性匹配（邮件哈希）+ 概率性匹配（行为相似度）+ Identity Graph
"""
import hashlib
import random
import math
from datetime import datetime, timedelta
from collections import defaultdict

# ── 工具函数 ──────────────────────────────────────────────────────────────────
def hash_email(email: str, salt: str = "p2s_salt_2026") -> str:
    """SHA-256 哈希邮件（不可逆，满足 GDPR 要求）"""
    return hashlib.sha256(f"{salt}:{email.lower().strip()}".encode()).hexdigest()[:16]


# ── 模拟三平台用户数据 ────────────────────────────────────────────────────────
def generate_platform_data():
    """
    生成 Amazon / TikTok / DTC 三平台用户数据
    部分用户跨平台（真实 User A 在三平台均有账号）
    """
    base_users = [
        {"email": "alice@email.com", "category_pref": ["baby_gear", "feeding"],
         "purchase_hour_avg": 20.0, "geo": "US"},
        {"email": "bob@email.com",   "category_pref": ["diapering", "toys"],
         "purchase_hour_avg": 12.0, "geo": "UK"},
        {"email": "carol@email.com", "category_pref": ["nursery", "feeding"],
         "purchase_hour_avg": 9.0,  "geo": "DE"},
        {"email": "dave@email.com",  "category_pref": ["baby_gear", "toys"],
         "purchase_hour_avg": 21.0, "geo": "US"},
        {"email": "eve@email.com",   "category_pref": ["feeding"],
         "purchase_hour_avg": 18.0, "geo": "US"},
    ]

    # Amazon 数据：含邮件哈希
    amazon_users = []
    for i, u in enumerate(base_users[:4]):  # Alice, Bob, Carol, Dave 在 Amazon
        amazon_users.append({
            "platform": "amazon",
            "platform_id": f"AMZ-{i+1:04d}",
            "email_hash": hash_email(u["email"]),
            "category_pref": u["category_pref"],
            "purchase_hour_avg": u["purchase_hour_avg"] + random.uniform(-1, 1),
            "geo": u["geo"],
            "spend_usd": round(random.uniform(50, 500), 2),
        })

    # TikTok 数据：Alice 和 Eve 在 TikTok（Alice 有邮件匹配，Eve 无）
    tiktok_users = [
        {
            "platform": "tiktok",
            "platform_id": f"TTK-0001",
            "email_hash": hash_email("alice@email.com"),  # 确定性匹配
            "category_pref": ["baby_gear", "feeding"],
            "purchase_hour_avg": 19.5,  # 行为相近
            "geo": "US",
            "ad_click_count": 12,
        },
        {
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：三端数据在各自隐私范围内处理：TikTok 广告点击 ID、Amazon 订单买家邮件哈希、独立站注册邮件哈希；必须为不可逆哈希，匹配计算可日级批处理。

**输出**：跨平台匹配率与校准后的真实 ROAS、全平台 LTV 与高价值用户名单，供投放与用户运营团队使用。

## 执行步骤

1. 归一三端身份标识并换哈希
2. 跑确定性匹配得到基础对齐
3. 跑概率性匹配补充候选并写入身份图谱
4. 按置信阈值裁决是否合并
5. 输出跨平台归因与 LTV 结果

## 边界与不做

- 单平台场景，或拿不到用户同意与可匹配哈希字段时不用本技能。
- 本技能产出身份图谱与归因结论，不执行投放、发券或合并 CRM 档案。
- 概率性误报会污染图谱，必须设高置信阈值并保留人工复核通道；跨平台关联须有用户同意。

## 技能关联

- **可组合**：Skill-Cross-Platform-User-Identity-Resolution

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：22-数据采集工程　·　源卡：`Skill-Cross-Platform-User-Identity-Resolution`