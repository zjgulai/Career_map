---
name: aily-cli-id
version: 0.1.0
description: 身份 ID 转换：user_id（int64，跨 agent / 工程接口 / 持久化用）↔ open_id（ou_*，绑定 bot app，调 lark-cli / 开平接口用）。模型手里 ID 形态跟目标接口不匹配、或需要把他 app 的 open_id 归一化到当前 agent 上下文时用本 skill。
---

# aily-cli id convert

```
aily-cli id convert --from {user_id|open_id} --to {user_id|open_id} \
  --ids <csv> | --from-file <path|-> [--strict] [--json]
```

## from → to

| 手里是 | 想要 | 说明 |
|---|---|---|
| `user_id` (int64) | `open_id` | 当前 agent bot app 命名空间 |
| `open_id` (`ou_*`) | `user_id` | open_id 自带归属 |
| `open_id` (他 app) | `open_id` | 重映射到当前 agent |

`user_id → user_id` 拒绝。

## 说明

- id 形态由 `--from` 声明，本地预校验；`user_id` 必须纯数字，`open_id` 必须 `ou_` 前缀
- 200/批自动分批；未命中返回 `sourceID` + 空 `targetID`（**不是错误**）
- `--strict`：任一未命中即非 0 退出
- `--json`：稳定 envelope `{"results":[{"sourceID","targetID"}]}`；默认表格

## 用不用

- 手里 id 形态**跟目标接口一致** → 直接用，不调本 skill
- 手里 `user_id` 要调 `lark-cli` / 开平接口 → 转 `open_id`
- 手里 `open_id` 要写库 / 跨 agent / 工程接口 → 转 `user_id`
- 收到他 app 的 `ou_*` → `--from open_id --to open_id` 重映射到当前 agent
- `chat_id / message_id / department_id` 等**不属于本 skill 范围**（全局唯一，无需转换）
