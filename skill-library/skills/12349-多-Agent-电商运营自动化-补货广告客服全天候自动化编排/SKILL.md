---
name: "p2s-mas-ecommerce-ops-automation"
title: "多 Agent 电商运营自动化 — 补货/广告/客服全天候自动化编排"
description: "触发词：运营自动化、多 Agent 编排、补货自动化、广告降 ACoS、事件驱动、人工审批门控。何时不用：只设计人工审批门控用「Skill-Human-in-Loop-Approval-Gate-Tag」；多 Agent 共识决策用「Skill-MAS-Consensus-Mechanism」；广告与搜索专项优化用「Skill-MAS-Search-Optimization」；只做事后复盘不做执行用「大促后复盘KPI体系」。安全边界：本技能产出事件规则、风险分级与动作建议（含审批要求），不是执行器；改价、暂停关键词、下发采购等真实动作须由模型外的确定性控制层或人工按分级执行，HIGH 风险动作一律人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-063"
l3_business: "行动组合"
l3_all: "行动组合 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/行动组合"
p2s_card_id: "Skill-MAS-Ecommerce-Ops-Automation"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "把补货、广告调价、Listing 更新、客服分诊这些每天重复的运营动作交给多 Agent 事件驱动编排，高风险动作留人工审批，团队只处理异常。"
user_try: "试试：帮我为 50 个 ASIN 设计一套运营自动化编排，补货每 4 小时扫一次、广告每 6 小时扫一次，并给出 ACoS 超 35% 降竞价 8% 这类规则和风险分级。"
whenToUse: "要把补货、广告调价、Listing 更新、客服分诊等重复运营动作做成事件驱动自动化编排时用本技能（属「行动组合／站点运营」，卡页参照规模为 50+ ASIN 卖家）；只设计人工审批门控用「Skill-Human-in-Loop-Approval-Gate-Tag」；需要多 Agent 共识机制用「Skill-MAS-Consensus-Mechanism」；广告/搜索专项优化用「Skill-MAS-Search-Optimization」；只做复盘不做执行用「大促后复盘KPI体系」；竞品情报采集用「Skill-MAS-Competitive-Intelligence-Agent」。"
workflow: "接通 ERP 库存/销售速度/前置期数据、广告平台 API 数据与工单事件源，把异常抽象成 OpsEvent（inventory_low、acos_high、bad_review、customer_ticket） → 按固定节奏扫描：补货 Agent 每 4 小时、广告 Agent 每 6 小时，生成候选动作 → 用 _estimate_risk 按变动幅度与影响金额给动作分级（变动 >20% 或金额 >$500 为 HIGH，>5% 或 >$100 为 MEDIUM，其余 LOW）并绑定审批要求 → 按规则触发与升级：库存天数 <30 天出补货建议、<15 天升级 Supervisor 告警；ACoS >35% 降竞价 8%、ROAS <2 暂停关键词 → 汇总动作执行结果与预估影响金额，跟踪断货率、ACoS、ROAS 并向运营总监复盘"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多 Agent 电商运营自动化 — 补货/广告/客服全天候自动化编排

## ① 解决的问题

运营总监面临"补货/广告调价/Listing更新每天耗费团队大量重复性工作时间"——事件驱动MAS编排将日常运营自动化率提升至73%，年化价值$10.3万

## ② 核心算法逻辑

解决「运营团队每天重复做补货审批、广告调价、Listing 更新、客服分诊，占用 70% 时间，却没有精力做真正的增长」的业务问题。

## ③ 业务应用场景

场景A：吸奶器品类全天候补货自动化 - 业务问题：运营每天早上花 2 小时手工看各 ASIN 库存，判断是否补货，容易漏 - 数据要求：ERP 库存数据（每日同步）+ 销售速度历史 + 前置期数据 - 部署方案：补货 Agent 每 4 小时扫描一次，库存天数 < 30 天自动触发建议，< 15 天升级 Supervisor 告警 - 预期产出：断货率从 8.3% 降到 2.1%，减少断货损失 $18,000/年；运营从 2h/天补货工作 → 15min 审批
场景B：广告 Agent 自动降 ACoS - 业务问题：旺季广告 ACoS 飙到 45%（目标 28%），人工调整来不及，每天多烧 $500 - 数据要求：广告平台 API 数据（ACoS/ROAS/点击/转化）+ 库存数据（避免广告投已断货品） - 部署方案：广告 Agent 每 6 小时读取数据，ACoS > 35% 自动降竞价 8%，ROAS < 2 暂停关键词 - 预期产出：广告 ACoS 从 45% → 29%，旺季 3 个月节省广告浪费 $43,000，ROAS 提升 35%
三轨验证 | 成本轨：月均成本1200元（AI服务费800元+人工审核4小时/月×100元/小时），相比传统人工备货成本（月均3500元）降低66% | 合规轨：符合《跨境电商B2C零售进口商品清单》和《母婴产品质量安全管理规范》，多Agent协同决策过程可追溯审计，满足海关数据申报要求 | 风险轨：库存预测偏差风险（概率12%，因促销周期变化），可通过实时销售数据反馈调整Agent权重规则；跨境物流延误导致备货不足（概率8%），需建立安全库存缓冲机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境 50+ ASIN 规模卖家，部署运营自动化 MAS 后：
运营效率：日常运营工作 2.5h/天 → 0.5h/天，节省 $36,000/年人力成本
断货损失：断货率 8% → 2%，年化挽回销售额 $24,000（按 GMV $400K 计算）
广告浪费：ACoS 超标浪费 → 精准控制，年化节省广告费 $43,000
合计年化价值：约 $103,000
实施难度：⭐⭐⭐⭐☆（需接通 ERP + 广告 API + 工单系统，工程量较大）

## ⑦ 代码节选

本节的完整实现（283 行）在同目录的 `references/implementation.py`。源站对预览设了 60 行上限；本卡节选较长，已移出正文以保持 SKILL.md 精简。正文只留指引，与卡面节选的一致性核对记录见 `data/code-recovery.json`。

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.11234，但该号在 arXiv 上是《MiniConGTS: A Near Ultimate Minimalist Contrastive Grid Tagging Scheme for Aspect Sentiment Triplet Extraction》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需接通三类数据源：ERP 库存数据（每日同步）、销售速度历史与前置期数据；广告平台 API 数据（ACoS/ROAS/点击/转化）加库存数据（避免向已断货品投放）；差评与客服工单事件源。事件统一为 OpsEvent：event_id、event_type（inventory_low／acos_high／bad_review／customer_ticket）、asin、severity（0-1，越高越紧急）、payload、timestamp。规模参照 50+ ASIN 母婴跨境卖家；扫描节奏为补货每 4 小时、广告每 6 小时。

**输出**：产出 AgentAction 建议列表（action_id、agent_name、action_type、description、estimated_impact_usd、risk_level、auto_execute／executed／approved 状态），并按风险分级给出处置方式：LOW 全自动执行、MEDIUM 通知加 30 分钟超时自动执行、HIGH 必须人工确认；供运营总监与运营团队审批与追踪，且决策过程需可追溯审计以满足海关数据申报与合规要求。

## 执行步骤

1. 接通 ERP 库存（每日同步）、销售速度历史、前置期数据以及广告平台 API 数据，建立事件源
2. 把库存偏低、ACoS 超标、差评、客服工单等情况统一转成 OpsEvent（含 ASIN、severity、payload）
3. 补货 Agent 每 4 小时扫描一次，库存天数 <30 天自动生成补货建议，<15 天升级 Supervisor 告警
4. 广告 Agent 每 6 小时读取 ACoS/ROAS/点击/转化，ACoS >35% 自动降竞价 8%，ROAS <2 暂停关键词，并避开已断货品
5. 用 _estimate_risk 按变动幅度与影响金额把动作分成 LOW／MEDIUM／HIGH，分别走全自动、通知加 30 分钟超时执行、必须人工确认
6. 记录每个动作的预估影响金额与执行结果，跟踪断货率、ACoS 与 ROAS 变化

## 边界与不做

- 数据不满足：ERP 库存、销售速度与前置期数据未接通，或广告 API 的 ACoS/ROAS/点击/转化字段缺失时不要启用编排，否则会误触发补货与降竞价；库存数据不实时会导致广告继续投放到已断货商品。
- 何时不用：只设计审批门控用「Skill-Human-in-Loop-Approval-Gate-Tag」；需要多 Agent 共识机制用「Skill-MAS-Consensus-Mechanism」；只要广告/搜索专项优化用「Skill-MAS-Search-Optimization」；只做复盘不执行用「大促后复盘KPI体系」。
- 能力边界：本技能产出的是事件类型、触发阈值、风险分级规则与动作建议（含 LOW 全自动／MEDIUM 通知加 30 分钟超时执行／HIGH 人工确认的门控契约），不是执行器；真正的改价、暂停关键词、补货下单等动作由模型外的确定性控制层执行或人工操作，阈值参数（变动 >20% 或金额 >$500 为 HIGH，>5% 或 >$100 为 MEDIUM）需人工核定后再上线。
- 安全边界：符合《跨境电商B2C零售进口商品清单》与《母婴产品质量安全管理规范》，多 Agent 协同决策过程须可追溯审计并满足海关数据申报要求；卡页风险轨提示库存预测偏差（概率 12%）与跨境物流延误（8%），需保留安全库存缓冲与人工兜底。

## 技能关联

- **前置**：Skill-CONCAT-Consensus-Decentralized-MAS.html、Skill-CONCAT-Consensus-Decentralized-MAS、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-MAS-Competitive-Intelligence-Agent.html、Skill-MAS-Competitive-Intelligence-Agent、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MAS-Revenue-Operations.html、Skill-MAS-Revenue-Operations、Skill-MAS-Search-Optimization.html、Skill-MAS-Search-Optimization
- **延伸**：Skill-CONCAT-Consensus-Decentralized-MAS.html、Skill-CONCAT-Consensus-Decentralized-MAS、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-MAS-Competitive-Intelligence-Agent.html、Skill-MAS-Competitive-Intelligence-Agent、Skill-MAS-Revenue-Operations.html、Skill-MAS-Revenue-Operations、Skill-MAS-Search-Optimization.html、Skill-MAS-Search-Optimization
- **可组合**：Skill-CONCAT-Consensus-Decentralized-MAS.html、Skill-CONCAT-Consensus-Decentralized-MAS、Skill-MAS-Competitive-Intelligence-Agent.html、Skill-MAS-Competitive-Intelligence-Agent、Skill-MAS-Revenue-Operations.html、Skill-MAS-Revenue-Operations、Skill-MAS-Search-Optimization.html、Skill-MAS-Search-Optimization、Skill-MAS-Ecommerce-Ops-Automation

---

> 分类：业务运营/渠道经营/行动组合　·　技术族：10-MAS　·　源卡：`Skill-MAS-Ecommerce-Ops-Automation`