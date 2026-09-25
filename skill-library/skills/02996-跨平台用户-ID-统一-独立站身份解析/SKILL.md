---
name: "p2s-cross-platform-user-identity"
title: "跨平台用户 ID 统一 — Amazon/TikTok/独立站身份解析"
description: "触发词：跨平台身份、用户 ID 统一、身份解析、归因打通、重合用户。何时不用：只有单平台数据时不用；需要行为相似度的概率性补全用三层匹配类技能，本技能走哈希确定性匹配与保守阈值。安全边界：只处理 SHA-256 哈希标识，不落明文邮箱或手机号；错误合并等于隐私泄漏，匹配阈值必须保守。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 账号商品映射"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Cross-Platform-User-Identity"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 TikTok、Amazon、独立站的同一批用户认出来，让归因和会员运营不再各算各的账。"
user_try: "试试：用邮箱哈希把独立站注册用户和 Amazon 买家对一遍，看看有多少重合用户。"
whenToUse: "需要跨平台对齐同一用户、且以邮箱或手机号哈希做确定性匹配时用本技能；需要行为相似度与图结构补全时用三层匹配类技能；SKU 主键统一另归主数据黄金记录类技能。"
workflow: "归一各平台标识符并统一做 SHA-256 哈希 → 用哈希做确定性匹配得到重合用户 → 给重合用户打多渠道与单渠道分层标签 → 输出跨平台归因路径与用户分层"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 跨平台用户 ID 统一 — Amazon/TikTok/独立站身份解析

## ① 解决的问题

数据工程师面临"跨平台用户身份割裂导致LTV低估和高价值用户触达不足"——跨平台身份解析将用户识别覆盖率提升55%，年化优化高价值用户策略增收25-50万元

## ② 核心算法逻辑

跨平台用户身份统一（Identity Resolution）解决多平台数据孤岛下的同人识别问题：Amazon 买家、TikTok 观众、独立站注册用户可能是同一个人，但使用不同 ID 体系。

## ③ 业务应用场景

场景1：TikTok 种草 → Amazon 下单 用户归因 - 业务问题：TikTok 广告 ROAS 显示 2.0，但实际大量转化发生在 Amazon，无法归因 - 数据要求：TikTok 像素事件（设备 ID + IP）+ Amazon 订单（邮箱 hash + 买家 ID） - 预期产出：跨平台归因路径，识别"TikTok 曝光 → 7 天内 Amazon 购买"链路 - 业务价值：真实 ROAS 从表面 2.0 提升至归因后 3.8，广告预算分配优化节省 20 万元/年
场景2：独立站会员与 Amazon 买家合并运营 - 业务问题：独立站注册用户 2 万，Amazon 买家 5 万，重合度未知，邮件营销重复触达 - 数据要求：独立站注册邮箱 hash + Amazon SP-API 订单邮箱 hash - 预期产出：识别 8,000 名重合用户，区分"纯 Amazon"与"多渠道"用户分层 - 业务价值：避免重复营销成本 5 万元/年；多渠道用户 LTV 是单渠道的 1.8 倍，精准追加投入
**三轨验证**：成本（匹配算力 500 元/月）/ 合规（只用 hash，符合 GDPR/CCPA）/ 风险（错误合并导致隐私泄漏，阈值设置需保守）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：跨渠道归因准确率提升使广告预算优化节省 20 万元/年；识别多渠道高价值用户（LTV×1.8）增加精准投入产出 15 万元/年
实施难度：⭐⭐⭐⭐☆（各平台数据接入权限 + 隐私合规设计）
优先级：⭐⭐⭐⭐⭐（多平台运营的核心数据基础设施）
适用规模：月活跃用户 >1 万、同时运营 2+ 平台的跨境品牌

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（221 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Cross-Platform User Identity Resolution
跨平台用户 ID 统一：Amazon + TikTok + 独立站
隐私合规：所有标识符使用 SHA-256 哈希，不处理明文
"""
import hashlib
import random
from dataclasses import dataclass, field
from typing import Any


def sha256_hash(value: str) -> str:
    """隐私安全哈希（生产环境需加盐）"""
    return hashlib.sha256(value.encode()).hexdigest()[:16]  # 取前16位用于演示


@dataclass
class PlatformProfile:
    """单平台用户画像"""
    platform: str                    # amazon / tiktok / shopify
    platform_user_id: str
    email_hash: str | None = None    # 邮箱 SHA-256
    phone_hash: str | None = None    # 手机 SHA-256
    device_id: str | None = None     # 设备指纹
    ip_prefix: str | None = None     # IP 前缀（/24 段）
    geo_country: str | None = None
    active_hours: list[int] = field(default_factory=list)  # 活跃时段 0-23
    category_interests: list[str] = field(default_factory=list)


@dataclass
class UnifiedProfile:
    """统一身份 Profile"""
    unified_id: str
    platform_ids: dict[str, str] = field(default_factory=dict)  # platform -> platform_user_id
    match_confidence: float = 1.0
    match_method: str = "deterministic"  # deterministic / probabilistic


class IdentityResolver:
    """
    跨平台身份解析器
    阶段1：确定性匹配（精确 hash 碰撞）
    阶段2：概率匹配（贝叶斯特征评分）
    """
    PROB_MERGE_THRESHOLD = 0.85
    PROB_REVIEW_THRESHOLD = 0.65

    def __init__(self):
        self._profiles: dict[str, list[PlatformProfile]] = {}  # unified_id -> profiles
        self._hash_index: dict[str, str] = {}  # email_hash/phone_hash -> unified_id
        self._device_index: dict[str, str] = {}  # device_id -> unified_id
        self._unified_profiles: dict[str, UnifiedProfile] = {}
        self._next_id = 1

    def _new_unified_id(self) -> str:
        uid = f"uid-{self._next_id:06d}"
        self._next_id += 1
        return uid
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：TikTok 像素事件（设备 ID 与 IP）、Amazon 订单（邮箱哈希与买家 ID）、独立站注册邮箱哈希；标识符一律先哈希，按用户粒度对齐，不输入明文 PII。

**输出**：跨平台归因路径（如曝光后 7 天内 Amazon 购买）与重合用户分层名单，供广告预算分配与会员运营使用。

## 执行步骤

1. 汇总各平台标识符并统一做 SHA-256 哈希
2. 执行确定性匹配得到重合用户集合
3. 按平台组合划分纯单渠道与多渠道用户
4. 计算跨平台归因路径与真实 ROAS
5. 输出归因结论与高价值用户分层名单

## 边界与不做

- 只有单一平台数据、或没有可对齐的哈希标识时不用本技能。
- 本技能只做识别与归因，不投放广告、不发邮件，也不会自动合并用户档案。
- 只处理哈希标识，错误合并会造成隐私泄漏，阈值必须保守，合规责任落在实际投放侧。

## 技能关联

- **可组合**：Skill-Cross-Platform-User-Identity

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：22-数据采集工程　·　源卡：`Skill-Cross-Platform-User-Identity`