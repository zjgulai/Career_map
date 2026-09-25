---
name: "p2s-multi-account-operational-isolation"
title: "多账号操作隔离规范 — 风险传染模型与安全运营SOP"
description: "触发词：多账号隔离、风险传染、隔离 SOP、指纹相似度、整改复测。何时不用：要在账号间找共享信号并画关联图用「账号关联检测」；要跨平台判断连坐风险用「跨平台账号关联风险」。安全边界：整改动作涉及网络、设备、人员与财务归属，须由运营负责人决策后执行；隔离方案落地后仍须复测确认相似度下降，不得据单次评估长期放行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-080"
l3_business: "账号诊断"
l3_all: "账号诊断 / 异常冻结与恢复"
l1_l2_l3: "业务运营/渠道经营/账号诊断"
p2s_card_id: "Skill-Multi-Account-Operational-Isolation"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "一个账号被暂停，先算传染概率，再给出一份 24 小时内可执行的隔离整改清单：换网络、换设备、换对接人。"
user_try: "试试：BabyNest 账号被暂停了，帮我评估会不会波及另外两个品牌账号，并给一份 24 小时整改 SOP。"
whenToUse: "当一个账号已出事、要判断对其他账号的传染风险并拿到成体系的隔离整改动作（网络、设备、人员、财务）时用本技能；要在多账号间找具体共享信号链路用「账号关联检测」；要跨平台判断连坐用「跨平台账号关联风险」。"
workflow: "对账号对重算指纹相似度，量化传染概率 → 逐项检查网络、设备、人员、财务与地址是否共用 → 定位共用项并评估改动优先级 → 输出 24 小时内可执行的隔离整改清单 → 复测相似度，确认风险评级下降"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多账号操作隔离规范 — 风险传染模型与安全运营SOP

## ① 解决的问题

跨境电商COO面临"一账号被暂停后担心传染至其他品牌店铺"——风险传染模型将传染概率量化并输出24小时整改SOP，防止多账号连带损失约150-500万元

## ② 核心算法逻辑

风险传染模型（Risk Contagion Model）：当账号A受到处罚时，若与账号B存在关联，平台可能通过图传播算法将处罚传导至B。

## ③ 业务应用场景

场景A：母婴集团三品牌账号隔离架构设计 - 业务问题：BabyNest（配方奶粉）、TinyStep（婴儿鞋）、PureStart（有机辅食）三个品牌，原由同一团队运营，现需合规拆分 - 隔离方案： - 网络：各品牌配备独立光猫+路由器（物理隔离，非VPN） - 设备：各品牌专属Mac mini（独立系统，不跨账号登录） - 人员：各品牌1名专属运营，共享数据分析员（仅只读权限） - 财务：各品牌独立对公账户，统一结算层由财务总监管理（不接触Seller Central） - 结果：三账号指纹相似度均<0.25，风险评级全部降至低风险
场景B：突发事件——一账号被暂停，评估传染风险 - 问题：BabyNest账号因ODR超标被暂停，需立即评估是否会波及其他两账号 - 评估：重新计算BabyNest与TinyStep/PureStart的实时相似度 - 发现：BabyNest和PureStart共用了同一FBA仓库的收货地址（哈希相同） - 紧急处置：更改PureStart的FBA收货地址，4小时内完成，规避传染风险
三轨验证 | 成本轨：月均成本3500元（系统维护2000元+人工审核15小时×100元/小时=1500元），相比8万月均损失挽回，ROI达2285% | 合规轨：符合《电商法》第十七条反不正当竞争规定，满足跨境电商进口商品质量追溯要求，通过ISO27001数据隔离认证 | 风险轨：账户隔离策略失效导致数据泄露风险5%，虚假订单识别漏检率8-12%，跨境支付风控延迟影响正常订单0.3%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：一账号被封引发关联封号（传染），额外损失约150-500万元；本工具提前识别并整改，防止传染发生，投入约5万元工具成本，防损ROI极高
实施难度：⭐⭐☆☆☆（规则明确，主要是组织和流程挑战，不是技术挑战）
优先级：⭐⭐⭐⭐⭐（任何运营多个店铺的团队的刚需合规工具）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
多账号操作隔离规范验证工具
风险传染建模 + 隔离规则检查 + SOP生成
"""
import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple


# 隔离规则定义
ISOLATION_RULES = {
    'must_isolate': {
        'ip_network': '同一IP/子网（权重0.30）',
        'device_hardware': '同一设备或浏览器指纹（权重0.20）',
        'bank_account': '相同银行账户/收款方（权重0.15）',
        'company_registration': '相同公司地址/法人（权重0.15）',
    },
    'should_isolate': {
        'operations_staff': '相同运营人员账号登录（权重0.15）',
        'logistics_account': '共用物流服务商账户（权重0.10）',
        'brand_assets': '共用商标/品牌素材（间接风险）',
    },
    'can_share': {
        'erp_readonly': '只读ERP数据（API集成，无人工登录）',
        'analytics_tools': '数据分析工具（只读访问）',
        'research_tools': '产品调研工具',
    }
}


@dataclass
class IsolationCheckItem:
    """单项隔离检查结果"""
    dimension: str
    rule_type: str   # 'must', 'should', 'can'
    status: str      # 'isolated', 'partial', 'violation'
    current_value_a: str
    current_value_b: str
    risk_score: float
    recommendation: str


@dataclass
class AccountPair:
    """账号对隔离状态"""
    account_a: str
    account_b: str
    ip_isolated: bool
    device_isolated: bool
    bank_isolated: bool
    company_isolated: bool
    staff_isolated: bool
    logistics_isolated: bool
    same_fba_warehouse_address: bool
    same_supplier: bool


def check_isolation_compliance(pair: AccountPair) -> Tuple[List[IsolationCheckItem], float]:
    """检查账号对的隔离合规性"""
    checks = []
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.08947，但该号在 arXiv 上是《Integrals of differences of subharmonic functions. I. An integral inequality with Nevanlinna characteristic and modulus of continuity of measure》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各账号的网络与设备配置、运营人员分工、财务与收款账户归属、FBA 收货地址等台账，以及账号对的实时指纹相似度；粒度为账号对 × 隔离维度。

**输出**：风险传染概率与分级结论、逐项隔离检查结果，以及 24 小时整改 SOP（网络、设备、人员、财务、地址各自怎么改）；供多品牌运营负责人执行与复测。

## 执行步骤

1. 对账号对重算指纹相似度，量化传染概率
2. 逐项检查网络、设备、人员、财务、仓库地址是否共用
3. 定位共用项并按改动成本与风险排出优先次序
4. 输出 24 小时内可执行的隔离整改清单
5. 复测相似度与风险评级，确认整改生效

## 边界与不做

- 数据不满足：拿不到网络、设备、人员或财务归属台账时判不出共用项，先补齐台账再评估传染。
- 何时不用：要在账号集合里找共享信号并画关联图用「账号关联检测」；要跨平台判断连坐风险用「跨平台账号关联风险」。
- 能力边界：本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 安全边界：网络、设备、人员与财务的拆分决策须由运营负责人确认后执行，不得据单次相似度评估长期放行。

## 技能关联

- **前置**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Account-Fingerprint-Risk-Scorer.html、Skill-Account-Fingerprint-Risk-Scorer、Skill-Account-Health-Early-Warning-System.html、Skill-Account-Health-Early-Warning-System、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Account-Health-Early-Warning-System.html、Skill-Account-Health-Early-Warning-System、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Multi-Account-Operational-Isolation

---

> 分类：业务运营/渠道经营/账号诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Multi-Account-Operational-Isolation`