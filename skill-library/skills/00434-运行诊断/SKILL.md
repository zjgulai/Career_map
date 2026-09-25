---
name: aily-cli-runtime
description: 检查本机 Aily CLI runtime、daemon 与 adapter 的只读运行状态。用户要求自查、诊断安装或确认 adapter 可用性时使用。
---

# Aily CLI 运行诊断

只执行以下只读命令：

```bash
aily-cli doctor --json
aily-cli daemon status --json
aily-cli adapter list --json
aily-cli adapter info <adapter-type> --json
```

不要使用 `doctor --repair`，也不要启动、停止、重启、更新或修改 runtime、daemon、adapter。需要修复时，说明诊断结果并把操作交给用户。
