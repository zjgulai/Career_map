---
name: "p2s-account-association-risk-detection"
title: "Account Association Risk Detection — 电商多账户关联风险检测"
description: "触发词：账号关联检测、多维信号图、关联封禁、隔离建议、风险等级。何时不用：只想给单账号对算一个 0-1 关联相似分时用「账号指纹风险评分器」；要评估封号传染并出整改 SOP 用「多账号操作隔离规范」。安全边界：银行卡、设备、IP 等关联信号属敏感数据，须脱敏存储、授权采集并保留检测日志 90 天以上；关联判定存在误判（卡页口径 8-12%），不得仅凭风险分处置正常账号。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-080"
l3_business: "账号诊断"
l3_all: "账号诊断 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/账号诊断"
p2s_card_id: "Skill-Account-Association-Risk-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "把银行卡、设备、IP、地址这些隐性关联连成一张图，提前发现哪个账号会连坐，告诉你先断哪条链路。"
user_try: "试试：把我们 6 个店铺账号的登录记录和支付信息跑一遍关联检测，画出关联图并给出红橙黄绿的风险等级。"
whenToUse: "当要在多个账号之间找共享信号（邮箱、银行卡、IP、设备、地址）并定位具体连坐链路时用本技能；只求某个账号对的相似度分值用「账号指纹风险评分器」；账号已被暂停、要评传染并出整改动作时用「多账号操作隔离规范」。"
workflow: "整理账号登录记录（IP/设备/时间）与关联邮箱、银行信息 → 抽取共享信号并按维度构建账号关联图 → 标注每条关联路径的风险等级（红/橙/黄/绿） → 输出隔离建议（更换设备、独立银行账户、VPN 隔离 IP） → 定期复检并跟踪整改效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Account Association Risk Detection — 电商多账户关联风险检测

## ① 解决的问题

新员工设备、共享 IP、旧供应商账号形成隐性关联，被 Amazon 认定即全部封禁损失 50-500 万元——多维信号图分析（银行卡/设备/IP/行为）提前 30 天识别关联风险，建议隔离操作防止连坐

## ② 核心算法逻辑

论文：Graph Neural Networks for Fraud Detection in ECommerce | 年份：2021

## ③ 业务应用场景

- 业务问题：某母婴品牌运营团队扩张，新员工用自己的设备登录管理账号，同时发现前供应商也在 Amazon 上开了店。一次 IP 关联就可能触发 Amazon 的关联审查，导致主账号封禁损失 GMV 数百万元。 - 数据要求：账号登录记录（IP/设备/时间）、关联邮箱/银行信息、已知关联方账号列表。 - 预期产出： - 账号关联图（可视化每个账号的连接链路） - 各关联路径的风险等级（红/橙/黄/绿） - 具体隔离建议（"建议更换登录设备"/"需要独立银行账户"） - 防御操作： - 高风险：立即分离资金链路 + 更换登录设备 - 中风险：使用 VPN 隔离 IP + 监控登录行为 - 定期检查
三轨验证 | 成本轨：月均成本3,200元（AI模型调用费1,500元/月，人工审核12小时/月×150元/小时=1,800元，系统维护200元/月），ROI=2.5倍（月均挽回损失8万元） | 合规轨：符合《电商平台刷单行为规范》和《反不正当竞争法》第5条；需建立黑名单库并每月更新，保留检测日志90天以上；结论：合规可行 | 风险轨：误判率8-12%（误伤正常用户），概率中等；恶意对抗升级风险（刷单团队优化手段），概率高；数据隐私泄露风险（账户关联数据敏感），概率低但影响大
**三轨验证** | 成本轨：月均成本5,800元（升级版：AI模型费3,000元/月含深度学习，人工审核20小时/月×150元/小时=3,000元，第三方风控接口500元/月，系统扩容300元/月），ROI=1.38倍（考虑成本增加后） | 合规轨：满足《个人信息保护法》第26条数据安全要求；需获用户授权进行账户关联分析；与支付宝/微信风控接口合作需签署数据处理协议；结论：合规需补充用户告知机制 | 风险轨：技术依赖风险（第三方接口故障），概率中等；检测延迟风险（实时性要求高），概率中；商户投诉风险（过度风控影响销售），概率高；模型漂移风险（季节性刷单模式变化），概率中高

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：账号封禁损失 50-500 万元，提前预防成本极低（主要是数据整理），ROI 极高
实施难度：⭐⭐☆☆☆（低，主要是数据整理 + 图算法）
优先级：⭐⭐⭐⭐⭐（账号是跨境卖家最核心资产，关联封禁是毁灭性风险）
评估依据：Amazon 关联封禁真实案例普遍存在，多维信号图分析是业界标准方法

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（72 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/risk_fraud/account_association_risk_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Account-Association-Risk-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Dict, Set, Optional

@dataclass
class AccountNode:
    account_id: str
    email: str
    bank_card_last4: str
    ip_ranges: List[str]
    device_ids: List[str]
    address_hash: Optional[str] = None
    category: Optional[str] = None

def extract_shared_signals(accounts: List[AccountNode]) -> Dict[str, List]:
    shared = {"email": {}, "bank": {}, "ip": {}, "device": {}, "address": {}}
    for acc in accounts:
        shared["email"].setdefault(acc.email, []).append(acc.account_id)
        shared["bank"].setdefault(acc.bank_card_last4, []).append(acc.account_id)
        if acc.address_hash:
            shared["address"].setdefault(acc.address_hash, []).append(acc.account_id)
        for ip in acc.ip_ranges:
            shared["ip"].setdefault(ip, []).append(acc.account_id)
        for dev in acc.device_ids:
            shared["device"].setdefault(dev, []).append(acc.account_id)
    return {k: {v: ids for v, ids in d.items() if len(ids) > 1} for k, d in shared.items()}

def compute_association_risk(account_id: str, all_accounts: List[AccountNode]) -> Dict:
    target = next((a for a in all_accounts if a.account_id == account_id), None)
    if not target:
        return {"account_id": account_id, "error": "not found"}
    shared = extract_shared_signals(all_accounts)
    WEIGHTS = {"email": 0.35, "bank": 0.30, "device": 0.20, "ip": 0.10, "address": 0.05}
    risk_score = 0.0
    associations = []
    for signal_type, weight in WEIGHTS.items():
        for signal_val, account_ids in shared.get(signal_type, {}).items():
            if account_id in account_ids:
                other_ids = [aid for aid in account_ids if aid != account_id]
                risk_score += weight
                associations.append({"type": signal_type, "shared_value": signal_val[:8] + "***",
                                      "linked_accounts": other_ids, "weight": weight})
    risk_score = min(1.0, risk_score)
    if risk_score >= 0.7:
        level = "🔴 高风险"
        action = "立即分离资金链路和登录设备，检查供应商关系"
    elif risk_score >= 0.4:
        level = "🟡 中风险"
        action = "使用独立网络登录，监控关联账号行为"
    else:
        level = "🟢 低风险"
        action = "定期例行检查即可"
    return {"account_id": account_id, "risk_score": round(risk_score, 3),
            "risk_level": level, "action": action, "associations": associations}

accounts = [
    AccountNode("BRAND_MAIN", "main@brand.com", "1234", ["192.168.1.x", "10.0.0.x"],
                ["DEVICE_A", "DEVICE_B"], "ADDR_001", "baby"),
    AccountNode("EMP_OLD", "old_emp@gmail.com", "5678", ["192.168.1.x"],
                ["DEVICE_C"], None, "baby"),
    AccountNode("SUPPLIER_STORE", "supplier@supplier.com", "9012", ["172.16.x.x"],
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2103.13342，但该号在 arXiv 上是《The Shapley Value of coalition of variables provides better explanations》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Graph Neural Networks for Fraud Detection in ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：账号清单及登录记录（IP、设备、时间）、关联邮箱与银行支付信息、已知关联方账号列表；粒度为账号 × 关联信号。

**输出**：账号关联图（可追溯每条连接链路）、各关联路径的风险等级（红/橙/黄/绿）与具体隔离建议；供运营负责人与风控执行隔离整改。

## 执行步骤

1. 汇集各账号的登录、设备、邮箱、银行卡与地址信息
2. 抽取共享信号并构建账号关联图
3. 对每条关联路径计算风险等级并标注主因
4. 输出隔离建议：更换登录设备、独立资金链路、IP 隔离
5. 设定复检周期，验证整改后的风险变化

## 边界与不做

- 数据不满足：缺少登录记录、支付信息或已知关联方清单时无法建图，先补齐数据再评估。
- 何时不用：只要一个账号对的量化相似分用「账号指纹风险评分器」；账号已被暂停要评传染并出整改 SOP 用「多账号操作隔离规范」。
- 能力边界：只做关联识别、风险分级与隔离建议，不修改任何账号配置，也不保证与平台风控判定口径一致。
- 安全边界：关联信号属敏感数据，须脱敏存储、取得授权并保留检测日志 90 天以上；误判时不得直接处置正常账号。

## 技能关联

- **前置**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Fraud-Signal-Collection.html、Skill-Fraud-Signal-Collection、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Account-Association-Risk-Detection

---

> 分类：业务运营/渠道经营/账号诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Account-Association-Risk-Detection`