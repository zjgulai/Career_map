---
name: "p2s-evosc-self-consolidation"
title: "EvoSC — 对比反思 + 自我巩固：Agent 从失败轨迹进化"
description: "触发词：失败轨迹、反思改进、策略收敛、自我巩固、版本分叉。何时不用：靠案例检索在线适应走「案例推理部署时学习」；靠记忆层在线学习走「梯度无关持续学习」。安全边界：反思只基于真实执行与合规结果，不得为收敛策略而放宽合规检查。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / Playbook评估"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
p2s_card_id: "Skill-EvoSC-Self-Consolidation"
p2s_src_domain: "10-MAS"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "策略版本越滚越多、同类失败反复踩坑时，从失败轨迹做对比反思，把真正有效的策略收敛下来。"
user_try: "试试：这半年有两次选品因为合规问题被下架，帮我从这些失败里总结出要固化的检查项。"
whenToUse: "当 Agent 策略版本发散、同类失败重复出现时用；若靠案例检索在线适应，用「案例推理部署时学习」；若靠记忆层在线学习，用「梯度无关持续学习」。"
workflow: "收集成功与失败执行轨迹及损失结果 → 对失败案例做对比反思、定位缺失步骤 → 把有效做法固化为策略规则 → 合并相似策略并收敛分叉版本 → 在后续任务中验证失败复发是否下降"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# EvoSC — 对比反思 + 自我巩固：Agent 从失败轨迹进化

## ① 解决的问题

供应链分析师面临策略版本越滚越散——EvoSC自收敛将策略分叉数20个压到6个，年化省10万元

## ② 核心算法逻辑

EvoSC（SelfConsolidation for SelfEvolving Agents，arXiv 2602.01966，2026年2月）解决了现有 Agent 自我进化框架的两个根本缺陷：

## ③ 业务应用场景

某跨境母婴 SaaS 平台运营婴儿暖奶器品类，库存 2,800 件，日均销售 45 件，当前 ROAS 2.8，复购率 18%。选品 Agent 负责每周推荐新款暖奶器供应商，需评估产品合规性（欧盟 EN 60950-1 电气安全标准、美国 CPSC 铅含量限制）。
过去 6 周内，Agent 推荐了 3 款暖奶器，其中 2 款因合规问题被下架： - 失败案例 1（第 2 周）：推荐某品牌暖奶器，未检查温度传感器精度，欧盟 TÜV 认证缺失 → listing 下架 → 已售 280 件库存积压 → 损失 ¥38,000（成本价）+ ¥12,000（广告费） - 失败案例 2（第 5 周）：推荐另一品牌，外壳材料含 BPA，美国 FDA 警告 → 被迫全量召回 → 损失 ¥52,000
同期推荐的 1 款暖奶器（第 1 周）： - 推荐前主动调用合规检查模块，验证了 TÜV/FCC/CPSC 三重认证 - 确认温度精度 ±0.5°C、BPA-free、防烫设计符合 EN 60950-1 - 上架后日销 52 件，库存周转率 18 天，ROAS 3.5，复购率 24%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：AI 工程师面临核心业务决策——MAS 自动化率提升 70%，年化节省运营人力 42 万元
实施难度：⭐⭐⭐☆☆（3/5星，需要历史数据积累 3 个月以上）
优先级：⭐⭐⭐⭐☆（4/5星，直接影响核心业务指标）

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（6 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2602.01966 — Self-Consolidation for Self-Evolving Agents

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：需历史执行轨迹（含成功与失败案例）与结果标注（如损失金额、下架原因），任务级粒度；卡页称需历史数据积累 3 个月以上。

**输出**：产出去重收敛后的策略版本集与固化检查项、失败复发与自动化率对比（卡页记录策略分叉从 20 个压到 6 个、MAS 自动化率提升 70%），供运营与算法团队使用。

## 执行步骤

1. 收集成功与失败执行轨迹及结果损失
2. 对比反思失败案例并定位缺失步骤
3. 固化有效做法为可复用策略规则
4. 合并相似策略收敛版本分叉
5. 验证同类失败是否下降

## 边界与不做

- 历史积累不足（卡页称需 3 个月以上）或失败样本极少时，反思结论不具代表性
- 只做策略收敛与固化，不代替合规审核，合规结论以其原始判据为准
- 反思须基于真实执行结果，不得为提高收敛度而删除失败记录

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Ad-Creative-Optimization、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-RFM-User-Segmentation
- **延伸**：Skill-Ad-Creative-Optimization、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-RFM-User-Segmentation
- **可组合**：Skill-Ad-Creative-Optimization、Skill-RFM-User-Segmentation、Skill-EvoSC-Self-Consolidation

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：10-MAS　·　源卡：`Skill-EvoSC-Self-Consolidation`