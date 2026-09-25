---
name: "xmind-gateway"
title: "前车之鉴·思维模型库网关"
description: "前车之鉴思维模型库网关：2789 个中文思维模型、13 章节、23 条策展路由、12 认知竞技场、5 条执行链的资产地图与查询配方。触发词：查思维模型、找思考框架、模型选型、这个问题用什么思维模型、前车之鉴、xmind、帮我把一个问题想深想透、写 Agent 提示词要参考认知协议、设计 Agent 角色与推理步骤、思维模型库。何时不用：问题形态已明确时直接用对应竞技场（选项纠结/根因复发/系统退化/方案评估/问题界定/学习卡点/表达失焦/执行失败/情绪内耗/战略打架/创意枯竭/不知道怎么想，对应 xmind-arena-* 十二席）；快速红队用 strategy-red-team、打磨方案用 grilling、四象限探索用 explore-unknowns；纯编码执行任务不适用。"
enabled: "true"
disable-model-invocation: "false"
user-invocable: "true"
---
# 前车之鉴·思维模型库网关

「前车之鉴-思维制胜」本地模型库的唯一入口。库内有 **2789 个中文思维模型**（本技能只嵌地图与配方，模型正文按需回 repo 读取，保证单一事实源）。
用户直接调用本技能时，$ARGUMENTS 即待查主题或问题形态。

## 第一步：先分流——该用哪层资产

| 用户的问题形态 | 该用 |
|---|---|
| 在两个或多个选项间反复纠结，情绪推翻理性 | xmind-arena-decision |
| 同一个问题反复出现，修了又坏、治标不治本 | xmind-arena-rootcause |
| 做了正确的事，结果却越来越差 | xmind-arena-sysfail |
| 几个可行方案要做有依据的系统比较 | xmind-arena-evaluate |
| 问题一团乱麻，说不清楚问题本身是什么 | xmind-arena-framing |
| 学过就忘、努力没进步、不知算不算懂了 | xmind-arena-learning |
| 汇报没重点、对方接不住、传话变形 | xmind-arena-comms |
| 目标定了推不动、flag 必倒、一崩全崩 | xmind-arena-execution |
| 想休息停不下来、反刍循环、躺不平卷不动 | xmind-arena-emotion |
| 局部都对全局在恶化、团队努力互相打架 | xmind-arena-strategy |
| 脑暴全是老点子、要非共识但有依据的方向 | xmind-arena-creative |
| 说不清卡在哪、不知道该用什么方法想 | xmind-arena-universal（兜底，含转诊） |
| 要给任务选执行形态 / 设计多阶段编排 | xmind-chain-* 五链（见下） |
| 需要某个具体思考框架的深度推理协议 | 查模型库（用本技能下方配方） |
| 写 Agent 人格/系统提示词要认知协议模板 | 查模型库头部模型的 codex_integration.system_prompt |

分流命中具体技能时立即转用该技能，不要用网关检索替代。

## 第二步：识别问题形态（8 类问题 × 8 个 Agent 阶段）

| 问题类型 | 典型信号词 |
|---|---|
| **诊断根因** (diagnosis) | 原因、为什么、根因、问题出在哪、出了问题、怎么回事、失败了、效果差 |
| **规划路径** (planning) | 怎么做、计划、步骤、如何实现、目标、路径、方案、下一步 |
| **决策取舍** (decision) | 选哪个、该不该、要不要、选择、取舍、判断、评估、利弊 |
| **创意发散** (creative) | 创新、突破、新方法、另一种思路、别的思路、换一种思路、头脑风暴、可能性 |
| **深度研究** (research) | 了解、研究、调研、趋势、洞察、深入分析、搜集信息、资料太多 |
| **复盘反思** (reflection) | 复盘、反思、总结、学到了什么、改进、下次、经验 |
| **沟通表达** (communication) | 如何表达、说服、汇报、解释清楚、沟通、反馈、讲不清 |
| **问题澄清** (clarification) | 搞清楚、确认、理解、澄清、是什么意思、边界是什么、不确定 |

| Agent 阶段 | 典型信号词 |
|---|---|
| 意图澄清 (intent) | 在开始推理之前、先搞清楚问题、不确定要做什么、问题定义 |
| 逐步推理 (cot_step) | 正在推理中、推理到第N步、需要继续推导、上一步结论是 |
| 计划设计 (planning) | 制定计划、下一步计划、分解任务、排优先级 |
| 行动执行 (execution) | 开始执行、行动中、遇到障碍、需要工具 |
| 复盘反思 (reflect) | 完成后、复盘、评估结果、回顾 |
| 多路分支 (tot_branch) | 需要比较多个方案、展开可能性、评估选项 |
| 证据研究 (research) | 需要深度分析、搜集信息、验证假设 |
| 结论综合 (synthesis) | 综合结论、整合信息、输出报告、综合洞察 |

### 23 条策展路由（问题类 × 阶段 → 推荐角色 → 模型 → 链）

| 问题 × 阶段 | 推荐角色 | 模型 | 链 |
|---|---|---|---|
| 诊断根因 × 意图澄清 | intent_clarifier、problem_framer | 苏格拉底式提问实操指南_层层追问_直、爱因斯坦式提问_5步重新定义问题_告 | — |
| 诊断根因 × 逐步推理 | causal_reasoner、first_principles、systems_thinker | 第一性原理_看透本质_高效破局的底层、系统思维_看清关联_高效破局的底层认 | xmind-chain-cot-critic |
| 诊断根因 × 复盘反思 | observer_reflector | 事后总结_并非终点_而是认知的_逆向 | xmind-chain-per |
| 诊断根因 × 多路分支 | multi_perspective、hypothesis_tester | 逆向思维_打破定式_高效破局的创新思、第二层思维_超越共识_决胜决策的底层 | xmind-chain-tot |
| 规划路径 × 意图澄清 | problem_framer、intent_clarifier | 爱因斯坦式提问_5步重新定义问题_告、苏格拉底式提问实操指南_层层追问_直 | — |
| 规划路径 × 计划设计 | planner、decomposer、prioritizer | 结构化思维_从混乱到清晰_解锁高效思、框架思维_核心功能解析与高效落地路径 | xmind-chain-per |
| 规划路径 × 行动执行 | action_executor、observer_reflector | 事后总结_并非终点_而是认知的_逆向 | xmind-chain-react |
| 规划路径 × 复盘反思 | observer_reflector | 事后总结_并非终点_而是认知的_逆向 | xmind-chain-per |
| 决策取舍 × 意图澄清 | intent_clarifier | 苏格拉底式提问实操指南_层层追问_直 | — |
| 决策取舍 × 逐步推理 | logical_analyzer、first_principles | 批判性思维工具包_3步拆解论点_5类、第一性原理_看透本质_高效破局的底层 | xmind-chain-cot-critic |
| 决策取舍 × 复盘反思 | observer_reflector | 事后总结_并非终点_而是认知的_逆向 | xmind-chain-per |
| 决策取舍 × 多路分支 | decision_maker、bias_detector、multi_perspective | 10个时间黑洞_多巴胺陷阱_决策瘫痪、重大决策七步自检清单_避开7个认知陷、逆向思维_打破定式_高效破局的创新思 | xmind-chain-tot |
| 创意发散 × 意图澄清 | problem_framer | 爱因斯坦式提问_5步重新定义问题_告 | — |
| 创意发散 × 逐步推理 | first_principles、systems_thinker | 第一性原理_看透本质_高效破局的底层、系统思维_看清关联_高效破局的底层认 | xmind-chain-cot-critic |
| 创意发散 × 多路分支 | multi_perspective、pattern_recognizer | 逆向思维_打破定式_高效破局的创新思 | xmind-chain-tot |
| 创意发散 × 结论综合 | knowledge_synthesizer、communicator | 金字塔原理_理清逻辑_高效表达的底层 | — |
| 深度研究 × 意图澄清 | intent_clarifier、problem_framer | 苏格拉底式提问实操指南_层层追问_直、爱因斯坦式提问_5步重新定义问题_告 | — |
| 深度研究 × 证据研究 | causal_reasoner、hypothesis_tester、logical_analyzer | 第二层思维_超越共识_决胜决策的底层、批判性思维工具包_3步拆解论点_5类 | xmind-chain-research |
| 深度研究 × 结论综合 | knowledge_synthesizer |  | — |
| 复盘反思 × 复盘反思 | observer_reflector | 事后总结_并非终点_而是认知的_逆向 | xmind-chain-per |
| 复盘反思 × 结论综合 | knowledge_synthesizer、communicator | 金字塔原理_理清逻辑_高效表达的底层 | — |
| 沟通表达 × 结论综合 | communicator、simplifier | 金字塔原理_理清逻辑_高效表达的底层 | — |
| 问题澄清 × 意图澄清 | intent_clarifier、problem_framer | 苏格拉底式提问实操指南_层层追问_直、爱因斯坦式提问_5步重新定义问题_告 | — |

## 第三步：查模型库（默认池 = quality.overall ≥ 4，共 1171 个）

库位置：/Users/lute/project/思维模型/knowledge/models-v3（每模型一个 JSON，文件名即模型 id）。

**查询姿势**（用 grep 工具或 bash grep 在该目录搜，然后 read 命中的文件）：

```text
# ① 按情境关键词找（匹配触发信号/定义/场景描述）
grep -l "反刍" /Users/lute/project/思维模型/knowledge/models-v3/*.json | head -5

# ② 按主章节浏览（第 06 章 = 决策、风险与认知偏差）
grep -l '"category": "06"' /Users/lute/project/思维模型/knowledge/models-v3/*.json | head -10

# ③ 按 Agent 角色找（19 角色之一）
grep -l '"decision_maker"' /Users/lute/project/思维模型/knowledge/models-v3/*.json | head -10

# ④ 按名称精确读
read /Users/lute/project/思维模型/knowledge/models-v3/第一性原理_看透本质_高效破局的底层.json
```

**Schema 字段地图**：

| 字段 | 用途 |
|---|---|
| `core_definition` | 一句话定义，先看它判断相关性 |
| `when_to_use.triggers / anti_triggers` | 触发/反触发信号——该不该用 |
| `reasoning_steps` | 可执行推理步骤 + 每步检查点 |
| `scenarios` | 企业管理/产品设计/分析洞察/决策思维/任务管理 五领域示例 |
| `codex_integration.system_prompt` | ★四层结构提示词（认知模式/推理协议/质量门禁/输出格式），可直接注入推理 |
| `codex_integration.activation` | 激活话术 |
| `pitfalls` | 常见误区 |
| `quality.overall` | 0–5 质量分；**≥4 才进默认池，低于 4 仅在用户点名时使用** |
| `meta.category / meta.agent_roles` | 主章节 / 关联 Agent 角色 |

**策展头优先**：被路由/策展集合/链/竞技场引用的模型是人工验证过激活度的头部（上面 23 路由表与 12 竞技场的参与模型都在其中），优先使用。

## 12 个认知竞技场（全部已技能化）

| 竞技场 | 技能 | 三角色 |
|---|---|---|
| 决策评估 | ✅ xmind-arena-evaluate | 维度设计师 / 时间旅行者 / 参照点审计师 |
| 决策困境 | ✅ xmind-arena-decision | 前额叶带宽顾问 / 框架设计师 / 第一性原理检察官 |
| 创意与创新 | ✅ xmind-arena-creative | 逆向工程师 / 平行思维主持人 / 叙事重构师 |
| 学习与成长 | ✅ xmind-arena-learning | 元认知观察员 / 拉伸区教练 / 知识整合架构师 |
| 情绪与内耗 | ✅ xmind-arena-emotion | DMN 机制观察员 / 循环切断教练 / 空想能量审计师 |
| 战略与系统 | ✅ xmind-arena-strategy | 系统结构分析师 / 决策速度顾问 / 非共识猎手 |
| 沟通与表达 | ✅ xmind-arena-comms | 金字塔建筑师 / 反问对话师 / 故事设计者 |
| 目标与执行 | ✅ xmind-arena-execution | 心理比对架构师 / 执行意图设计师 / 块状重启教练 |
| 系统失败 | ✅ xmind-arena-sysfail | 系统结构分析师 / 假设审计师 / 第二层思维观察者 |
| 通用思维 | ✅ xmind-arena-universal | 假设审计师 / 系统结构分析师 / 维度设计师 |
| 问题界定 | ✅ xmind-arena-framing | 追问界定师 / 信息完备检查官 / 边界划界师 |
| 问题根因 | ✅ xmind-arena-rootcause | 根因调查员 / 系统结构分析师 / 假设审计师 |

十二个竞技场按「三对立角色 → 找张力 → 交集=高可信 / 冲突=盲区」运行，每个自带停止条件与质量门禁。repo 内 `chain-protocols/*-arena-1.json` 为单一事实源。

## 13 章节地图

| 章 | 名称 | 模型数 |
|---|---|---|
| 00 | undefined | 651 |
| 01 | undefined | 22 |
| 02 | undefined | 315 |
| 03 | undefined | 80 |
| 04 | undefined | 128 |
| 05 | undefined | 293 |
| 06 | undefined | 219 |
| 07 | undefined | 296 |
| 08 | undefined | 224 |
| 09 | undefined | 246 |
| 10 | undefined | 126 |
| 11 | undefined | 168 |
| 12 | undefined | 21 |

## Agent 开发期用法

- **写子代理人格/系统提示词**：按问题形态选 2–3 个头部模型，借其 `codex_integration.system_prompt` 的四层结构（【认知模式】【推理协议】【质量门禁】【输出格式】）作为人格基底——该结构经保真度/区分度自动评分与激活度 A/B 验证。
- **选执行模式**：五条链的边界见各自技能（xmind-chain-react / tot / cot-critic / research / per）。
- **角色编排**：19 类角色全集在 chain-protocols/agent-router-prompt.json 的 references.role_ids：action_executor、bias_detector、causal_reasoner、communicator、decision_maker、decomposer、first_principles、hypothesis_tester、intent_clarifier、knowledge_synthesizer、logical_analyzer、multi_perspective、observer_reflector、pattern_recognizer、planner、prioritizer、problem_framer、simplifier、systems_thinker。

## 红线

1. **不读取** repo 的 data/、ref-extracted/、ref-models/ 目录（私有语料，禁止进入任何输出）。
2. 给人的可分享链接用生产站 https://xmind.lute-tlz-dddd.top/（文件名即页面路径），不要给本地路径。
3. 修改这个 repo 前必须先读其 specs/ 与 AGENTS.md，且未经用户明确确认不得 commit/push/发布。
4. 经典框架若已有专门技能（如 swot-analysis、pre-mortem、porters-five-forces），优先专门技能，本库作深化补充。
