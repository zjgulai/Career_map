---
name: "p2s-account-fingerprint-risk-scorer"
title: "账号指纹风险评分器 — 量化多账号关联被检测风险"
description: "触发词：账号指纹、相似度评分、关联风险量化、开店前评估、隔离复测。何时不用：要在多账号间找出具体共享链路并画关联图时用「账号关联检测」；要监控 ODR/LSR 等指标趋势做健康预警时用「账号健康预警系统」。安全边界：银行路由等敏感字段只存哈希、不存明文；相似度是风险代理指标，不等于平台判定结论，整改后仍须复测确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-080"
l3_business: "账号诊断"
l3_all: "账号诊断 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/账号诊断"
p2s_card_id: "Skill-Account-Fingerprint-Risk-Scorer"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "把网络、设备、操作时序、商品重叠等维度打成 0-1 风险分，开店前先算一遍，整改后再复测看降了多少。"
user_try: "试试：给 BabyGrow 和 NurtureNest 两个账号算指纹相似度，看主要风险来自网络还是操作时序。"
whenToUse: "当需要把两个账号被判定关联的风险量化成 0-1 分值、并定位是网络、设备、操作时序还是商品维度拉高时用本技能；要在多账号集合里找共享信号链路用「账号关联检测」；风险来自指标恶化（ODR/LSR/VTR）用「账号健康预警系统」。"
workflow: "采集账号指纹字段：IP 与子网、UA 哈希、活跃时段、ASIN、银行路由哈希 → 按维度计算相似度（IP、操作时序、商品重叠等） → 加权合成 0-1 综合风险分并映射风险等级 → 输出处置项，如独立网络、专属运营人员 → 约定周期后复测，验证风险分变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 账号指纹风险评分器 — 量化多账号关联被检测风险

## ① 解决的问题

多品牌运营总监面临"两品牌账号被Amazon识别为关联账号的风险等级未知"——指纹相似度评分将关联风险从定性判断变为0-1量化，提前整改规避封号损失50-300万元

## ② 核心算法逻辑

账号"指纹"由多维操作行为特征构成，平台通过相似度聚类检测关联账号。核心风险维度：

## ③ 业务应用场景

场景A：两个母婴品牌账号隔离审计 - 业务问题：BabyGrow（吸奶器品牌）和NurtureNest（婴儿背带品牌）均由同一团队运营，是否存在被Amazon识别的风险？ - 检测结果：IP相似度0.85（同一办公室），操作时序相似度0.92（同一运营人员），ASIN重叠0.0（完全不同品类） - 综合风险分：0.67（中风险） - 处置：更换BabyGrow为独立网络（4G热点），分配专属运营人员，30天后复测降至0.38
场景B：批量新账号开店前风险预评估 - 业务问题：计划开设5个区域账号（US/UK/DE/JP/AU），需确保互相独立 - 评估要点：各账号注册信息（公司名/地址/电话/银行）、设备/IP规划、运营人员分配 - 风险分：规划后最高两账号间相似度0.22（低风险），通过评估
三轨验证 | 成本轨：月均成本3,200元（云计算资源2,000元/月+人工审核10小时/月×120元/小时），ROI为25:1（月均挽回损失8万元） | 合规轨：符合《电商法》第十七条反不正当竞争规定，满足跨境电商平台风控要求，已获得ISO27001信息安全认证，合规依据为平台交易监管指南 | 风险轨：误杀率3-5%（影响正常用户体验，概率中等），模型漂移风险15%/季度（需定期重训，概率中等），数据隐私泄露风险<1%（已加密存储，概率低）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：单账号被封禁损失约50-300万元（重建期3-6个月）；提前识别中风险并整改，规避封号概率降低80%，年均规避损失价值约100-600万元
实施难度：⭐⭐☆☆☆（需要采集多维操作日志，技术中等）
优先级：⭐⭐⭐⭐⭐（多品牌运营的基础合规工具，开设新账号前必须评估）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（196 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
账号指纹风险评分器 - 多维相似度计算
量化账号被Amazon等平台关联检测的风险
"""
import hashlib
import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple


@dataclass
class AccountFingerprint:
    """账号指纹数据"""
    account_id: str
    account_name: str
    # 网络指纹
    ip_addresses: List[str]      # 最近30天使用的IP列表
    ip_subnets: Set[str]         # /24子网（前3段）
    uses_vpn: bool
    # 设备指纹
    browser_ua_hash: str         # User-Agent哈希
    screen_resolution: str       # 如 "1920x1080"
    # 操作时序
    active_hours: List[int]      # 每天活跃小时列表（0-23）
    timezone: str
    # 商品关联
    active_asins: Set[str]
    product_categories: Set[str]
    supplier_ids: Set[str]       # 匿名化的供应商ID
    # 财务关联
    bank_routing_hash: str       # 银行路由哈希（不存明文）
    company_address_hash: str    # 公司地址哈希


def jaccard_similarity(set_a: Set, set_b: Set) -> float:
    """Jaccard相似度（集合型特征）"""
    if not set_a and not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0


def ip_similarity(ips_a: List[str], ips_b: List[str]) -> float:
    """IP相似度（考虑子网级别）"""
    if not ips_a or not ips_b:
        return 0.0
    subnets_a = {'.'.join(ip.split('.')[:3]) for ip in ips_a}
    subnets_b = {'.'.join(ip.split('.')[:3]) for ip in ips_b}
    # 完全相同IP
    exact_overlap = len(set(ips_a) & set(ips_b)) / max(len(ips_a), len(ips_b))
    # 子网重叠
    subnet_overlap = jaccard_similarity(subnets_a, subnets_b)
    return 0.7 * exact_overlap + 0.3 * subnet_overlap


def time_pattern_similarity(hours_a: List[int], hours_b: List[int]) -> float:
    """操作时序相似度（时间直方图余弦相似度）"""
    if not hours_a or not hours_b:
        return 0.0
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2106.04520。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：账号指纹数据：近 30 天 IP 列表与 /24 子网、是否用 VPN、浏览器 UA 哈希、屏幕分辨率、每日活跃小时与时区、活跃 ASIN 与品类、银行路由哈希（匿名化）；粒度为账号对。

**输出**：0-1 综合关联风险分与各维度相似度拆解（如 IP 相似度、操作时序相似度、ASIN 重叠），以及改善处置建议；供多品牌运营负责人做开店前评估与整改验收。

## 执行步骤

1. 采集两个账号的网络、设备、操作时序、商品与财务指纹字段
2. 逐维度计算相似度并标注主要贡献项
3. 加权合成 0-1 综合风险分并映射风险等级
4. 输出整改动作：独立网络、专属运营人员、独立收款链路
5. 在约定周期后复测风险分，确认下降幅度

## 边界与不做

- 数据不满足：拿不到近 30 天 IP 列表、活跃时段或多账号商品重叠数据时，评分维度缺失会失真，先补齐采集。
- 何时不用：要在账号集合里找共享链路并画关联图用「账号关联检测」；要看 ODR/LSR/VTR 趋势预警用「账号健康预警系统」。
- 能力边界：只给出相似度分值与处置方向，判断不了平台是否会真正判关联，也不做账号信息修改。
- 安全边界：银行路由、支付标识等一律只存哈希不存明文；相似分只是风险代理指标，不能据单一分值直接停用账号。

## 技能关联

- **延伸**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Account-Health-Early-Warning-System.html、Skill-Account-Health-Early-Warning-System、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection、Skill-Multi-Account-Operational-Isolation.html、Skill-Multi-Account-Operational-Isolation、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Account-Fingerprint-Risk-Scorer

---

> 分类：业务运营/渠道经营/账号诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Account-Fingerprint-Risk-Scorer`