---
name: onboarding
version: 1.0.0
description: First-run interview for pm-output-engine plugin.
description_zh: 首次使用引导，学习团队的文档产出偏好和协作规则。
user-invocable: true
argument-hint: "[--quick 2分钟极简] [--full 完整版]"
---

# 超级产品经理 · 产出引擎 —— 首次配置引导

## 触发与状态判断

执行前先读 `~/.qoderwork/plugins/config/pm-output-engine/QODERWORK.md`：
- **不存在** → 进入完整 onboarding
- **含 `[PLACEHOLDER]`** → 问用户从空白处继续还是重头来
- **完全填好** → 告知已配置好，除非传 `--redo`

## 三档模式

### `--quick` —— 2 分钟

只问 3 个核心问题：
1. **你的 PRD 用什么格式？** → 输出风格
2. **给老板汇报数据偏好什么风格？** → 汇报叙事结构
3. **需求变动时怎么通知上下游？** → 协作规则

### `--full` —— 完整版

按以下剧本走：

1. **团队信息**：产品线、团队规模
2. **PRD 风格**：格式（HTML/Markdown/Word）、必含章节、优先级标记方式
3. **汇报风格**：叙事结构、篇幅偏好、是否需要图表
4. **协作规则**：需求变更通知机制、评审流程
5. **展示摘要** → 写入 QODERWORK.md

### 写完之后

1. 展示摘要确认
2. 告诉配置路径
3. 说明可随时 `--redo` 调整
