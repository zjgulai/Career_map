---
name: "p2s-privacy-compliant-data-collection-gdpr-ccpa"
title: "Privacy-Compliant Data Collection GDPR/CCPA — 隐私合规数据采集架构"
description: "触发词：合规采集、同意管理、DSAR、数据最小化、Privacy by Design。何时不用：针对儿童场景做 COPPA 专项审查时用「Privacy COPPA Compliance」；做跨品牌联合统计用数据洁净室类技能。安全边界：不得在未获同意前激活追踪；同意记录本身也须合规存储；不展示或导出原始 PII。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-133"
l3_business: "隐私需求分析"
l3_all: "隐私需求分析 / 授权审查"
l1_l2_l3: "独立控制/财务与合规/隐私需求分析"
p2s_card_id: "Skill-Privacy-Compliant-Data-Collection-GDPR-CCPA"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "把同意管理、数据最小化和删数请求做进采集管道，别等被罚了再补丁式整改。"
user_try: "试试：按 GDPR/CCPA 给我设计一套带同意门控和 DSAR 删数流程的数据采集方案。"
whenToUse: "面向欧盟或加州用户设计、改造数据采集管道，需要同意管理与数据主体权利流程时用；儿童场景专项审查用 COPPA 类技能；跨品牌联合分析用洁净室类技能。"
workflow: "盘点字段、埋点与下游系统 → 设计分级同意门控 → 加 PII 检测与脱敏 → 建 DSAR 级联删除与保留策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Privacy-Compliant Data Collection GDPR/CCPA — 隐私合规数据采集架构

## ① 解决的问题

独立站通过 GA4+Pixel 未经同意采集用户行为被德国 DPA 开出€1.2 万罚款——引入 GDPR/CCPA 合规数据采集架构（同意管理+数据最小化），合规覆盖率 100%，规避最高 2000 万欧元罚款风险，年化法律成本降低 96%。

## ② 核心算法逻辑

隐私合规数据采集架构（PrivacyCompliant Data Collection）将 GDPR（欧盟通用数据保护条例）和 CCPA（加州消费者隐私法）的合规要求嵌入数据采集管道的设计层，而非事后打补丁。核心原则：Privacy by Design（隐私内建）。

## ③ 业务应用场景

场景1：德国/欧盟独立站用户数据采集合规 - 业务问题：独立站通过 GA4 + Pixel 采集用户行为，德国 DPA（Datenschutzbehörde）发现未经同意的 cookie 追踪，开出 €1.2 万罚款，并要求 30 天内整改。 - 数据要求：用户浏览/购买行为数据 + 同意记录；需支持按 user_id 删除所有数据 - 预期产出：CMP 集成（OneTrust/开源 CookieYes）+ 同意前不激活追踪 + DSAR 接口 < 30 天响应 - 业务价值：避免 GDPR 罚款（最高 €2000 万或年营业额 4%），且合规独立站的欧盟用户信任度更高，转化率提升 5-8%
场景2：CCPA 加州用户"不出售我的信息"合规 - 业务问题：Amazon 母婴店铺通过第三方数据经纪商共享买家邮件列表用于再营销，加州用户提出 CCPA "Do Not Sell" 请求，需要从所有下游系统中删除该用户数据。 - 数据要求：用户 opt-out 请求列表 + 数据流图（哪些系统存储了该用户数据） - 预期产出：自动化 DSAR 处理流水线，接收请求 → 查询 Data Map → 级联删除，30 天内完成 - 业务价值：CCPA 违规罚款 $100-750/条记录，1000 名加州用户被违规处理可面临 $75-75 万 USD 索赔风险
**三轨验证**： - 成本：CMP 工具（CookieYes 基础版免费；OneTrust 企业版 $2-5 万/年）；DSAR 自动化开发约 2-4 人周 - 合规：本 Skill 本身就是合规方案；需注意同意记录的存储也需满足 GDPR（不含 PII 的 consent ID 即可） - 风险：过度限制数据采集会影响个性化能力；需在隐私保护和业务分析之间找平衡点

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：避免 GDPR 罚款（最高年营业额 4%，对月 GMV 100 万卖家约 48 万元/年 风险敞口）；CCPA 违规每条记录索赔 $100-750，合规建设成本远低于潜在罚款；合规独立站欧盟转化率提升 5-8%，年增量 GMV 12-20 万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：GDPR/CCPA 合规是出海欧美市场的强制要求（非可选项），违规风险是确定性的，且罚款金额可以是毁灭性的。这是所有数据采集工程的"安全底线"。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（236 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
隐私合规数据采集架构演示
同意管理 + PII 检测与脱敏 + DSAR 处理 + 数据保留策略
"""
import hashlib
import re
import json
from datetime import datetime, timedelta
from typing import Any

# ── PII 检测器 ────────────────────────────────────────────────────────────────
class PIIDetector:
    """检测数据中的 PII 字段"""
    PII_PATTERNS = {
        "email": re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"),
        "phone": re.compile(r"\+?[\d\s\-()]{10,15}"),
        "ip_address": re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"),
    }
    PII_FIELD_NAMES = {"email", "phone", "ip", "ip_address", "name", "address",
                        "first_name", "last_name", "ssn", "credit_card"}

    def detect(self, record: dict[str, Any]) -> dict[str, str]:
        """
        返回 {field_name: pii_type}
        """
        detected: dict[str, str] = {}
        for key, value in record.items():
            if key.lower() in self.PII_FIELD_NAMES:
                detected[key] = "field_name_match"
                continue
            if isinstance(value, str):
                for pii_type, pattern in self.PII_PATTERNS.items():
                    if pattern.search(value):
                        detected[key] = pii_type
                        break
        return detected


# ── 数据脱敏 ──────────────────────────────────────────────────────────────────
class DataAnonymizer:
    """PII 字段脱敏（哈希/泛化/屏蔽）"""
    SALT = "p2s_gdpr_salt_2026"

    def hash_pii(self, value: str) -> str:
        """SHA-256 哈希（不可逆，满足 GDPR 假名化要求）"""
        return hashlib.sha256(f"{self.SALT}:{value}".encode()).hexdigest()[:16]

    def generalize_ip(self, ip: str) -> str:
        """IP 泛化：192.168.1.100 → 192.168.1.0/24"""
        parts = ip.split(".")
        if len(parts) == 4:
            return f"{'.'.join(parts[:3])}.0/24"
        return "anonymized"

    def mask_email(self, email: str) -> str:
        """邮件屏蔽：alice@gmail.com → a***@g***.com"""
        if "@" in email:
            local, domain = email.split("@", 1)
            domain_parts = domain.split(".")
            return f"{local[0]}***@{domain_parts[0][0]}***.{domain_parts[-1]}"
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：采集字段与埋点清单、同意记录结构、数据流图（哪些系统存了哪些字段）、数据主体请求（访问与删除）流程要求；粒度：字段级与系统级。

**输出**：同意管理设计（按用途分级的同意范围与有效期）、PII 检测与脱敏方案、DSAR 处理流水线与数据保留策略，供工程与法务落地。

## 执行步骤

1. 盘点采集字段、埋点与下游系统
2. 按用途拆分同意范围并设计同意门控
3. 增加 PII 检测与脱敏处理
4. 搭建 DSAR 查询与级联删除流水线
5. 设定数据保留期与审计留痕

## 边界与不做

- 数据不满足时不用：数据流图缺失，或同意记录与用户标识对不上时，无法保证删除请求真正级联生效。
- 能力边界：只做架构与流程设计，不代替法律意见；合规范围判定（适用哪些法域）须法务确认。

## 技能关联

- **可组合**：Skill-Privacy-Compliant-Data-Collection-GDPR-CCPA

---

> 分类：独立控制/财务与合规/隐私需求分析　·　技术族：22-数据采集工程　·　源卡：`Skill-Privacy-Compliant-Data-Collection-GDPR-CCPA`