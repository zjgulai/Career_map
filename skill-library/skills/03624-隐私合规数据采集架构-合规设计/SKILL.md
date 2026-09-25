---
name: "p2s-privacy-gdpr-ccpa-collection"
title: "隐私合规数据采集架构 — GDPR/CCPA 合规设计"
description: "触发词：评论数据合规、假名化、IP截断、CCPA不出售、采集改造。何时不用：需要同意管理与 DSAR 全流程架构设计时用「Privacy-Compliant Data Collection GDPR/CCPA」；儿童场景审查用「Privacy COPPA Compliance」。安全边界：公开评论采集也不得留存真实邮箱与完整 IP；未经同意不得采集，拒绝授权的用户须自动跳过采集。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-133"
l3_business: "隐私需求分析"
l3_all: "隐私需求分析 / 授权审查"
l1_l2_l3: "独立控制/财务与合规/隐私需求分析"
p2s_card_id: "Skill-Privacy-GDPR-CCPA-Collection"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把已有采集系统里的真实邮箱、IP 和未授权追踪改干净，让评论与行为数据能合规使用。"
user_try: "试试：帮我改造欧洲站评论采集流程，给出邮箱哈希、IP 截断和同意归档的具体方案。"
whenToUse: "已有采集链路需要按 GDPR/CCPA 做假名化、IP 截断与同意归档改造时用；需要完整同意管理与 DSAR 架构设计用隐私合规采集架构技能；儿童数据用 COPPA 类技能。"
workflow: "盘点字段并标记 PII → 按法域确定同意范围 → 做假名化与 IP 截断 → 归档同意并输出改造清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 隐私合规数据采集架构 — GDPR/CCPA 合规设计

## ① 解决的问题

欧洲评论数据采集系统存储用户真实邮箱/IP 面临 GDPR 违规高风险——引入隐私合规架构（假名化+差分隐私+数据最小化），违规暴露风险清零，合规改造成本仅为被罚款金额的 3%。

## ② 核心算法逻辑

隐私合规数据采集架构解决"如何在合法合规前提下最大化数据采集价值"的工程问题。核心框架：

## ③ 业务应用场景

场景1：欧盟用户评论数据采集合规改造 - 业务问题：原系统采集评论时同步存储用户真实邮箱和 IP，在德国市场面临 GDPR 违规风险（最高 2000 万欧元罚款） - 数据要求：Amazon 欧洲站评论数据（评论文本、评分、日期，不含 PII） - 预期产出：评论文本保留，邮箱 hash 化，IP 截断为 /24 段，同意记录归档 - 业务价值：规避 GDPR 罚款风险（违规成本 >2000 万欧元）；信任品牌溢价
场景2：加州独立站用户行为数据采集（CCPA 合规） - 业务问题：独立站像素埋点采集用户浏览轨迹，加州消费者可要求查看并删除数据 - 数据要求：Shopify 用户行为事件（页面浏览、加购、结账），地理位置 = California - 预期产出：Data Subject Rights API（30 天内响应删除请求）+ 同意拒绝用户的数据自动跳过采集 - 业务价值：满足 CCPA 合规，避免每次违规 $7,500 的民事罚款；维护品牌信誉
**三轨验证**：成本（合规工程 10 万/次建设，运营 2 万/年）/ 合规（GDPR/CCPA/COPPA 三重审计通过）/ 风险（同意管理系统故障需降级到"仅必要数据"模式）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：GDPR 最高罚款 2000 万欧元（或全球营业额 4%），CCPA 每次 $7,500；合规建设成本 10 万元远低于违规风险；欧盟市场准入门槛达标
实施难度：⭐⭐⭐⭐☆（法律+工程双重复杂度，建议法务介入审查）
优先级：⭐⭐⭐⭐⭐（有欧盟/加州用户的跨境电商必须合规，否则面临运营封禁）
适用规模：面向欧盟/英国/加州用户的所有跨境电商，儿童用品类目额外需满足 COPPA

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（251 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 53 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Privacy-Compliant Data Collection Architecture
GDPR/CCPA 合规数据采集架构实现
包含: 同意管理、PII脱敏、数据主体权利、保留期管理
"""
import hashlib
import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any


class ConsentScope(Enum):
    ESSENTIAL = "essential"        # 必要（履行合同）- 无需同意
    ANALYTICS = "analytics"        # 分析统计 - 需同意
    MARKETING = "marketing"        # 营销 - 需同意
    THIRD_PARTY = "third_party"    # 第三方共享 - 需同意


class Jurisdiction(Enum):
    EU = "eu"        # GDPR
    UK = "uk"        # UK GDPR
    CA_US = "ca_us"  # CCPA（加州）
    OTHER = "other"


@dataclass
class ConsentRecord:
    """用户同意记录"""
    user_id_hash: str          # SHA-256(user_id)，不存原始 ID
    jurisdiction: Jurisdiction
    consented_scopes: list[ConsentScope]
    opted_out_sale: bool        # CCPA: 拒绝数据销售
    consent_ts: str
    expiry_ts: str             # GDPR 同意有效期（通常 12 个月）
    source: str                 # web_banner / api / explicit_form


class ConsentManager:
    """同意管理器：发放、查询、撤销同意令牌"""
    GDPR_EXPIRY_DAYS = 365

    def __init__(self):
        self._records: dict[str, ConsentRecord] = {}  # user_id_hash -> latest record

    def grant_consent(self, user_id: str, jurisdiction: Jurisdiction,
                       scopes: list[ConsentScope], opted_out_sale: bool = False,
                       source: str = "web_banner") -> ConsentRecord:
        user_hash = hashlib.sha256(user_id.encode()).hexdigest()[:24]
        now = datetime.now(timezone.utc)
        record = ConsentRecord(
            user_id_hash=user_hash,
            jurisdiction=jurisdiction,
            consented_scopes=scopes,
            opted_out_sale=opted_out_sale,
            consent_ts=now.isoformat(),
            expiry_ts=(now + timedelta(days=self.GDPR_EXPIRY_DAYS)).isoformat(),
            source=source
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：现有采集字段清单（如评论文本、评分、日期、邮箱、IP）、采集来源与下游存储系统、法域判定（欧盟/英国/加州）与用户同意状态；粒度：字段级。

**输出**：改造后的字段处理方案（文本保留、邮箱哈希、IP 截断到网段）、同意记录归档结构、数据主体权利接口要求与保留期设定，供工程实施。

## 执行步骤

1. 盘点采集字段并标记其中 PII
2. 按法域确定各用途的同意范围
3. 对标识字段做假名化与 IP 截断
4. 归档同意记录并保留可验证凭据
5. 输出采集改造清单与保留期策略

## 边界与不做

- 数据不满足时不用：历史数据未留存同意凭据时，无法为存量数据补齐合法性基础，只能停止使用或重新获取授权。
- 能力边界：只做采集侧改造设计，不代做法律定性；存量数据能否继续使用须法务判断。

## 技能关联

- **可组合**：Skill-Privacy-GDPR-CCPA-Collection

---

> 分类：独立控制/财务与合规/隐私需求分析　·　技术族：22-数据采集工程　·　源卡：`Skill-Privacy-GDPR-CCPA-Collection`