---
name: magpie-horch-context-recovery
description: 在 Magpie-Horch 接续一项旧任务，且实现、验证、改动归属或下一步任一项不清时使用，例如“继续、恢复、从断点、之前做到哪里、当前状态”。即使来自旧会话，只要目标、写入范围和下一步均明确，也不触发；通过只读状态快照恢复检查点。
---

# Magpie-Horch 断点恢复

只在 LUTE Agentic System / Magpie-Horch 使用。默认只读，不创建项目内状态文件、不更新 ADR/Note/Goal，也不清理已有产物；用户明确要求写入时才进入相应交付 Skill。

## 路由边界

- 只有旧任务的实现、验证、归属或下一步不清楚时才进入本 Skill；它先恢复事实，再选择后续工作流。
- 新任务已经给出明确结果、范围与实施授权时，直接进入 `magpie-horch-feature-delivery`，不额外制造恢复步骤。
- 已观察到故障且当前现象需要解释时，恢复完成后转给 `magpie-horch-incident-diagnosis`；已有改动只需裁决时转给 `magpie-horch-evidence-review`。

## 恢复顺序

1. 找到仓库根并读取 `AGENTS.md`、`docs/pitfalls-playbook.md` 和当前任务直接相关的规格/包契约。
2. 读取真实状态：branch、`git status --short --branch`、相关 diff/未跟踪文件、当前目标或任务记录（若存在 `.codex/goals/`、计划文件或用户点名的 ticket）。
3. 确认当前消费侧：代码是否已写、是否已进构建/装载点、测试是否是本次运行、运行态是否实际观察、是否已得到用户/发布接受。
4. 标出两个边界：本任务可归属的改动与其他会话/历史遗留的改动。没有证据的归属一律标为未知，不得擅自纳入、覆盖、提交或删除。

## 输出一张真实状态快照

用以下结构报告，避免把计划写成进度：

| 层 | 当前证据 | 状态 |
| --- | --- | --- |
| 目标/决策 | 用户已批准、仍待决或来源不明 | 已确认 / 待用户 |
| 实现 | 精确文件与 diff，或尚未写入 | 已写 / 未写 / 未归因 |
| 自动验证 | 本次命令、结果与覆盖范围 | PASS / FAIL / UNVERIFIABLE |
| 运行/交付 | 真实载荷、应用或发布面读数 | PASS / FAIL / UNVERIFIABLE |
| 工作区边界 | branch、脏改动、共享写者风险 | 可继续 / 需隔离 / 待确认 |

然后提出**一个**最小、可执行的下一步。若当前目标有显式用户决策门、权限门、生产动作或外部协调门，不替用户选择，也不跨越该门。

## 防止伪恢复

- 不把旧的 green、旧的计划、旧的截图、工具进度卡或“此前说过会做”当作当前完成。
- 不因工作区脏就 reset、checkout、清理、重建或运行破坏性脚本；先说明精确冲突边界。
- 不把“代码在磁盘上”读成“已在运行”，也不把“本地预览”读成“发布接受”。
- 若状态被并行写者污染，换独占对象或说明 `UNVERIFIABLE`；不要为了得到绿灯而放宽判据。

恢复完成后，按照请求转交给 `magpie-horch-feature-delivery`、`magpie-horch-incident-diagnosis` 或 `magpie-horch-evidence-review` 的相应模式。
