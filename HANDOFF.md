# Career / 三宝 · Codex 交接说明

本文让另一台电脑上的 Codex 从已确认的 C-224 决策断点继续。它是设计连续性与安全边界说明，不是 AgenticOS 运行手册、数据访问授权、来源仓库迁移指令、真实业务操作授权或产品验收证明。

## 0. 先做发布边界核对

仓库 README 将本仓库定义为“公开、脱敏设计投影”。当前连续设计资料中仍有历史性的本机路径与内部讨论引用；这些不应因为文件历史上已被 Git 跟踪，就被视为可以无审查公开发布。

本次用户已经明确同意将当前完整连续设计资料发布到公开仓库，因此本 checkpoint 已完成公开发布。后续继续追加内容时仍需重新检查公开范围，不得携带凭据、会话、浏览器状态、真实业务数据或原始资料。

## 1. 从哪里恢复

1. 在仓库根目录先读取 `AGENTS.md`，遵循接手电脑上的命令、Git 与安全规则。
2. 阅读本文件，再按顺序阅读：
   - `.codex/context-pack.md`
   - `.codex/sources.md`
   - `CONTEXT.md`
   - 如需讨论职责和跨节点连接，再读 `.codex/product-responsibility-research.md`
3. 写入前必须运行 `git status --short --branch`、`git log -1 --oneline`；以当前 `main` 的实际提交为唯一基线。
4. 不从 `.codex/` 或 `.superpowers/` 的 ignored state、端口记录、截图、浏览器缓存或受管工作副本推断产品事实。

当前已被规范化的连续文件为：

```text
.codex/context-pack.md
.codex/product-responsibility-research.md
.codex/sources.md
.superpowers/brainstorm/38196-1789923100/content/sanbao-identity-boundaries.html
CONTEXT.md
```

它们在本次交接前已按同一 Git 基线逐字节规范化为受管 C-224 工作副本的状态；这不是 Git 三方合并，也不应回退到旧的 C-181/C-182 未提交状态。

## 2. 产品北极星与不可跳过的层次

三宝的目标是将已有产品、知识、方法与工作台，在保持来源证据和专业边界的前提下，逐层组织为：

```text
来源证据
→ 原子能力候选（解决一个明确子问题）
→ 小范围工作流候选
→ MECE 能力组
→ 岗位 Skill Bundle / DSH Preset 候选
→ 3 个管理层 + 50 个岗位能力的数字员工候选
→ Lead–Worker 协作的共享经营事项
→ 新品经营 / 持续经营 / 新市场经营三条主链
```

该图谱是产品功能全景与设计范式输入，而非已有运行系统。来源名称、旧产品、旧岗位或一段来源阅读，均不能直接等同未来 Skill、Preset、岗位任命、权限、数据接入或真实业务动作。

已确认的总规则：

- `C-068`：三条经营主链共用经营事项的五个对照面，但不被压成统一流程、万能 Agent、统一 Schema 或统一权限模型。
- `C-070`：来源资产必须先核对，才可能进入能力、工作流、Bundle/Preset 和协作层。
- `C-208`：候选能力需要独立证明；来源阅读不能替代能力证明。
- `C-214`：画布采用卡片下钻阅读范式。阅读路径、相邻卡片和返回路径不代表业务流程、数据流、审批、组织层级或运行状态。

## 3. 已完成的来源边界序列

| 决策 / 来源台账 | 已完成的最小事实 | 不可推出的结论 |
| --- | --- | --- |
| `C-220 / SRC-040A` | 九组主线资料的访问类型、证据上限与停止线 | 获得全文阅读、能力拆解或运行权限 |
| `C-221 / SRC-040B` | AI-Native-Organization 固定公开文档的来源角色参照 | 3+50 任命、Bundle/Preset 或数字员工运行 |
| `C-222 / SRC-040C` | Sanbao 固定公开产品／工作台文档的来源能力边界 | 三宝产品架构、Skill 清单或运行接入 |
| `C-223 / SRC-040D` | Kb2Agent 固定公开知识资料的来源知识资产边界 | 正式知识库、MCP、Agent 连接或知识运行 |
| `C-224 / SRC-040E` | VOC 报告公开首页的目录与页面自述边界 | 已读报告、真实 VOC、需求结论或客户数据 |

## 4. 当前断点：C-224

**C-224 · VOC 来源目录与报告自述边界台账** 已确认并已上右侧画布，但不等于读取了报告正文。

最小已读事实：

- 只匿名读取公开根首页：`https://report.lute-tlz-dddd.top/`。
- 当次 HTTP 响应可回查痕迹：`Last-Modified: 2026-05-21 08:30:00 GMT` 与 `ETag: "6a0ec288-2fbe"`。它们只对应当次页面响应，不是产品、数据或报告版本。
- 页面标题和“6源交叉验证 / 19,098 条 VOC / 75,291 条社媒”等属于来源页面自述，不是经本项目验证的数据事实。
- 没有打开报告卡、正文、图表、样本、方法、链接或其他页面；没有使用登录态、Cookie、浏览器存储、账号、密码或真实客户／社媒／经营数据；没有抓取或枚举站点。

C-224 的画布站位是“未分配参照（VOC 与洞察来源）”。它不重开或替代以下既有边界：`C-071`、`C-072`、`C-073`、`C-174`、`C-175`、`C-176`。

六条停止线：

1. 页面或报告不等于未来 Skill。
2. 页面自述不等于已治理客户数据。
3. 来源叙述不等于既有 VOC 能力。
4. 来源线索不等于需求、机会或产品结论。
5. 公开入口不等于数据、知识库、模型、Agent 或工作台运行。
6. 来源材料不等于 3+50、Preset、权限或真实业务动作。

## 5. 当前唯一下一题：C-225（尚未执行）

候选下一题是：**是否允许对 VOC 报告正文进行最小范围阅读，以及这次阅读只回答什么产品问题。**

`C-225` 尚未创建、未上图、未执行；不得因 C-224 已存在而自动打开任何报告正文。若用户未来同意讨论，先只提出并等待确认：

1. 具体哪一张报告卡或哪一个页面；
2. 只为回答哪个产品／业务问题；
3. 允许读取的最小内容范围；
4. 明确不读取的内容，包括登录态、真实客户数据、其他报告与站点枚举；
5. 最多形成什么台账，且不升级为 Skill、需求结论、知识条目或运行能力。

这五项未被用户逐项确定前，停留在 C-220/C-224，不读取正文。

## 6. 画布位置与最小验证

画布文件：

```text
.superpowers/brainstorm/38196-1789923100/content/sanbao-identity-boundaries.html
```

搜索锚点：

```text
data-c224-source-fragment-stack
const c224VocReportBoundaryLedger
c224:{title:'VOC 来源目录与报告自述边界台账', ...}
c214CardMarkup('c224', ...)
c214CreateView('c224', 'c220', ...)
```

阅读路径：

```text
阅读总览
→ C-220 · 本轮资料范围
→ C-224 · VOC 来源目录与报告自述边界
```

在 C-220 中，`C-221`、`C-222`、`C-223`、`C-224` 是四张单列、全宽的下钻卡。C-224 默认应有：4 张收起来源片段、4 个阅读面、4 种来源状态、4 条边界对照和 6 条停止线；没有表单、外部链接、SVG 关系线、C-208 跳转、运行入口或真实业务操作。

下台 Codex 的本机验证要求：

```text
静态：
- git diff --check
- 编译画布最终 <script> 片段
- 确认 c224VocReportBoundaryLedger、data-c224-voc-report-boundary-ledger、
  SRC-040E · VOC 已读公开入口和 C-224 标题存在

浏览器：
- 自行启动本机静态服务，不复用旧端口、URL 参数、state 或会话
- 在约 402px 宽的右侧抽屉检查 C-220 四张卡全宽垂直排列、无重叠、无横向溢出
- 打开 C-224，确认其路径、4 个默认收起 <details>、4/4/4/6 内容完整
- 展开任一来源片段后仍无重叠或溢出
- 最终返回 C-224 且恢复默认收起状态
```

## 7. 写入与 Git 边界

本轮连续设计的预期提交范围仅为：

```text
.codex/context-pack.md
.codex/product-responsibility-research.md
.codex/sources.md
.superpowers/brainstorm/38196-1789923100/content/sanbao-identity-boundaries.html
CONTEXT.md
HANDOFF.md
```

不得因本 checkpoint 顺带提交：

- `.codex/loop-ticket-backlog.md` 或其他 ignored 的研究草稿、工具目录；
- `.superpowers/brainstorm/**/state`、端口、token、server-info、浏览器会话、截图或运行缓存；
- 未跟踪的旧画布页；
- `skill-library/`；
- 外部来源项目、Magpie-Horch、GitHub 源仓库或任何真实系统。

`.codex/` 与 `.superpowers/` 虽被 `.gitignore` 匹配，但上述少数连续文件是历史已跟踪文件。因此必须用显式文件清单暂存；不得使用 `git add -A`、`git clean -fdX`、整目录复制或恢复命令。

## 8. 交接时需要如实填写的发布记录

本文件随交接 checkpoint 一起维护。接手时用真实命令结果补充或核验下表；绝不根据旧口头状态假设 push 已成功：

本次本地 checkpoint 先以 `docs(career): consolidate C-224 canvas and handoff` 提交，随后以 `merge: preserve remote Career_map history` 将远端公开历史作为第二父提交保留。该 merge 提交为 `c2f773a2fd2c34ebd6db3fc5a3579d2f5cdc4ce8`；接手时仍以 `git rev-parse HEAD` 和 `git log -1` 取得当前真实 SHA。

本次执行已实际通过 `git diff --check`、画布最终 `<script>` 编译、C-224 静态标记检查和本机 HTTP 返回检查；浏览器控制连接本轮未恢复，因此没有把浏览器交互验收写成已通过。

已实际执行 `git push origin main`，并由 `git ls-remote --heads origin main` 核验远端 `main` 返回 `c2f773a2fd2c34ebd6db3fc5a3579d2f5cdc4ce8`，与本次发布 merge 提交一致。GitHub 仅返回了大文件建议警告：`skill-library/` 中有三个 JSON 超过 50 MB 推荐值；推送未被拒绝。

| 字段 | 要求 |
| --- | --- |
| 提交前分支与 HEAD | 以实际 `git status --short --branch` 和 `git rev-parse HEAD` 为准 |
| 明确暂存文件 | 逐项核对上面的六个文件 |
| 排除项 | ignored state、截图、工具草稿与 `skill-library/` 等 |
| 静态 / 浏览器验证 | 记录实际命令、URL、视口、结果与未验证项 |
| 凭据与公开范围检查 | 记录检查范围和结论，不记录任何凭据值 |
| commit / push | 记录实际 message、SHA、命令、远端 SHA 与 push 后状态 |

`origin` 的目标是 `https://github.com/zjgulai/Career_map.git`。推送前必须先获取远端状态，避免覆盖远端已有提交；不允许 force push。只有 `git push origin main` 成功且 `git ls-remote --heads origin main` 返回 SHA 与本地 `HEAD` 一致，才能写“已 push”。

## 9. 交接后的沟通节奏

继续保持一条垂直主线：每轮只讨论一个依赖最靠前的产品决策，先给依据与建议，用户确认后才更新对应画布卡。每次画布更新都要说明“新增了什么、位于哪里、没有因此决定什么”，避免卡片堆叠或把阅读层级误解为经营流程。
