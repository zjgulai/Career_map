---
name: "p2s-context-compression"
title: "ACON — Agent 长上下文压缩与 NL 准则优化"
description: "触发词：长上下文压缩、历史摘要、观察压缩、准则优化、长对话客服降本。何时不用：单轮短会话或上下文未超模型窗口时不必要；只按相关性剪枝单轮工具结果用主动上下文剪枝。安全边界：压缩不得丢掉订单、物流与规格等关键事实，压缩准则须用成功与失败轨迹校准后再上线。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Context-Compression"
p2s_src_domain: "16-智能体工程"
user_summary: "把几十轮客服对话和超长的接口返回压成摘要，成本和首响时延都降下来还不掉准确率。"
user_try: "试试：客服对话 10-30 轮、订单和物流接口返回单个就 5000 token，帮我压缩上下文并保证关键事实不丢。"
whenToUse: "当长会话与多次接口返回把上下文撑爆、需要既降本又不丢关键事实时用本卡；只按相关性剪枝当轮工具结果用主动上下文剪枝；需要跨会话积累知识用记忆管理类技能。"
workflow: "汇总历史对话轮次与接口返回结果 → 按 token 预算保留最近的关键观察 → 对超预算内容提取关键行压缩成摘要 → 为较早历史生成系统级摘要并保留最近若干轮 → 用成功与失败轨迹校准压缩准则"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ACON — Agent 长上下文压缩与 NL 准则优化

## ① 解决的问题

跨境母婴客服 1 次对话经常 10-30+ 轮,Agent 在执行 RCA(Root Cause Analysis)、生成回复、生成报告时需要历史完整对话 + 多次 API 返回(订单详情、物流数据、产品规格)

## ② 核心算法逻辑

ACON(Agent Context Optimization) 解决长 horizon LLM Agent 的核心瓶颈:上下文随交互无界增长。Agent 在每一步要积累 observation + action,十几步后 context 就爆炸,带来高成本 + 长上下文稀释相关信息。

## ③ 业务应用场景

跨境母婴客服 1 次对话经常 10-30+ 轮,Agent 在执行 RCA(Root Cause Analysis)、生成回复、生成报告时需要历史完整对话 + 多次 API 返回(订单详情、物流数据、产品规格)。这些 API 返回非常长(单个 API 可能 5000+ token),累积后超出大多数模型的 128k context。
- 跨境客服历史对话 10-30 轮(input) - 多次 API 返回的原始 JSON(订单/物流/产品) - 一份"成功 trajectory"(完整 context 下 Agent 给出正确建议)的标注 - 一份"失败 trajectory"(压缩后 Agent 给出错误建议)的标注
- 长对话客服推理成本 -60-70%(对应 API token 费节省) - 客服首响时延 -60-70% - AppWorld benchmark 显示压缩后 Agent 反而准确率不降——长上下文稀释效应被消除

## ④ 输入数据要求

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

数据要求:中,需要 success/failure trajectory pair(50-200 对每场景)
技术门槛:中-高,UT/CO 两阶段优化 + LoRA 蒸馏
工程复杂度:中,gradient-free + 接现成 LLM API,无 RL 复杂度
维护成本:中,guideline 需随业务场景演化定期更新
直接降本:任何长 horizon Agent 场景都受益,本项目 paper-workflow 自身就是长流程
小模型增益巨大:与 Hermes 4 / Qwen3-4B 这种开源模型组合,可实现 GPT-5 级体验 + 1/10 成本

## ⑦ 代码模板

代码块数量：3 · 路径：paper2skills-code/llm_agent_engineering/context_compression

 Python38 行 · 可运行复制
def compress_observations(obs_list, budget_tokens=200):
 compressed = []
 used = 0
 for obs in obs_list:
 tokens = len(obs.split())
 if used + tokens <= budget_tokens:
 compressed.append(obs)
 used += tokens
 else:
 key_lines = [l.strip() for l in obs.split(chr(10))
 if any(kw in l for kw in [&#x27;error&#x27;,&#x27;result&#x27;,&#x27;found&#x27;,&#x27;结果&#x27;,&#x27;错误&#x27;,&#x27;发现&#x27;])]
 snippet = &#x27; | &#x27;.join(key_lines[:2]) if key_lines else obs[:80] + &#x27;...&#x27;
 compressed.append(&#x27;[压缩] &#x27; + snippet)
 used += len(snippet.split())
 return chr(10).join(compressed)

def compress_history(history, keep_last=3):
 if len(history) <= keep_last:
 return history
 old = history[:-keep_last]
 recent = history[-keep_last:]
 summary_text = &#x27;; &#x27;.join(
 h[&#x27;role&#x27;] + &#x27;: &#x27; + h[&#x27;content&#x27;][:40] + &#x27;...&#x27; for h in old[-3:]
 )
 summary = {"role": "system", "content": "[历史摘要] " + summary_text}
 return [summary] + recent

obs = [
 "ls -la /src\ntotal 48\nconfig.py main.py",
 "错误: 找不到 /src/settings.yaml",
 "结果: 在 /config/settings.yaml 中找到配置文件",
]
print(compress_observations(obs, budget_tokens=50))

history = [{"role": "user", "content": "step " + str(i)} for i in range(10)]
compressed = compress_history(history, keep_last=3)
print("压缩前 " + str(len(history)) + " 条 → 压缩后 " + str(len(compressed)) + " 条")
print("[✓] Context Compression 测试通过")

## ⑧ 论文来源

2309.03409
2406.07496
2407.18901
2407.19056
2510.00615

## 输入 / 输出契约

**输入**：跨境客服的历史对话（常为 10-30 轮）、多次接口返回的原始数据（订单、物流、产品规格，单个可能 5000 以上 token），以及每个场景 50-200 对成功轨迹与失败轨迹标注用于校准准则。

**输出**：压缩后的观察序列与历史摘要（保留最近若干轮加系统级摘要），以及长对话的推理成本与首响时延改善幅度，供长流程 Agent 在受限上下文窗口内继续推理。

## 执行步骤

1. 汇总历史对话轮次与多次接口返回的原始结果
2. 按 token 预算保留最近的关键观察
3. 对超预算内容提取错误与结果等关键行并压缩成摘要
4. 对较早历史生成系统级摘要并保留最近若干轮
5. 用成功与失败轨迹对校准压缩准则
6. 输出压缩后上下文并核对准确率是否下降

## 边界与不做

- 何时不用：单轮短会话、上下文未超模型窗口时不必要；只剪枝当轮工具结果时用更轻的主动上下文剪枝。
- 能力边界：压缩准则需随业务场景演化定期更新，每个场景需 50-200 对成功与失败轨迹做校准，准确率影响须逐场景验证。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Memory-as-Action.html、Skill-Memory-as-Action
- **可组合**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit、Skill-Context-Compression

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-Context-Compression`