---
name: "resolving-merge-conflicts"
title: "合并冲突消解"
description: "消解进行中的 git 合并/变基冲突。触发词：合并冲突消解、resolving-merge-conflicts、消解进行中的 git 合并/变基冲突。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

1. **查看 merge/rebase 的当前状态。**检查 git 历史，以及冲突的文件。

2. **为每个冲突找到主要来源。**深入理解每处改动为什么发生、原始意图是什么。阅读 commit 信息，查看 PR，查看原始 issues/tickets。

3. **解决每个 hunk。**尽可能同时保留双方的意图。在意图不相容时，选择符合本次 merge 既定目标的一方，并记录取舍。**不要**发明新行为。始终解决冲突；绝不 `--abort`。

4. 找出项目的**自动化检查**并运行它们，通常是类型检查、然后测试、然后格式化。修复 merge 破坏的一切。

5. **完成 merge/rebase。**暂存所有内容并提交。如果是 rebase，继续 rebase 流程，直到所有提交都完成 rebase。
