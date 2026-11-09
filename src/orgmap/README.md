---
title: 三宝组织索引 · 数据层 / 正交工作视图 / 3D 展示页 / 席位—节点 Crosswalk
doc_type: architecture
module: sanbao-orgmap
topic: canvas-graph-index
status: draft
created: 2026-11-08
updated: 2026-11-09
owner: self
source: human+ai
---

# 三宝组织索引

新开的只读索引应用。现有 63 页无限画布网站保持原样，不迁移、不改写、不替换。

**设计态原型，不是运行系统。** 页面固定横幅与侧栏都写明这一点。

## 运行与门禁

```bash
python3 -I scripts/build-canvas-graph.py          # 重建 src/orgmap/data/graph.js
python3 -I scripts/build-canvas-graph.py --check  # 校验 graph.js 新鲜度（过期 exit 1）
python3 -I scripts/check-ledger-consistency.py    # 仓库台账与 graph.js 统一门禁
python3 -m http.server 8765 --bind 127.0.0.1
# 唯一默认入口（一体化 3D 空间：cosmos / org / network / plan 四模态）：
#   http://127.0.0.1:8765/src/orgmap/
#   http://127.0.0.1:8765/src/orgmap/?view=plan&audit=1
# 旧链接 http://127.0.0.1:8765/src/orgmap/showcase.html 自动无感跳转至 ./index.html
```

## 1. 数据层（`scripts/build-canvas-graph.py` → `data/graph.js`）

唯一生成物 `data/graph.js`（`window.SANBAO_GRAPH`）。

| 层 | 来源 | 结果 |
| --- | --- | --- |
| 决策 | `.codex/context-pack.md` | 377 条 C-000..C-376（含标题、形态、行号，自动脱敏本机路径） |
| 网络节点 | 33 张卡片的 `const nodes` | 20 个，坐标取单一规范页 `sanbao-agenticos-vision.html` |
| 关系 | 同上 `const relations` | 126 去重：123 可解析 + 3 引用未声明节点 `accountability` |
| 席位 | `.codex/pilot/seat-registry.json` | 53（50 AGT + 3 MGT），与 `.codex/3plus50-roster.md` 逐条核对 |
| 席位↔节点映射 | `configs/seat-node-crosswalk.json` | 50 岗 100% 映射 `OM/BO/IC/DA` 站位（C-300..C-310）；31 席共 38 条有据映射覆盖全部 20 个网络节点 |

构建期硬断言：`decisions=377 / cards=63 / graph_cards=33 / nodes=20 / relations=126 / seats=53 / crosswalk_seats=53 / crosswalk_links=38`，少一个或依据 C 号不可解析即失败。

## 2. 权威 Crosswalk（`configs/seat-node-crosswalk.json`）

依据 `C-300..C-310`（3+50 岗位能力站位批量映射与高层闭合审查）建立：

- **50 个 AGT 席位**：1:1 对应 `OM-01..05`、`BO-01..35`、`IC-01..05`、`DA-01..05`。
- **3 个 MGT 参照**：对应 `MGT-01..03`（T4 决策权参照，不参与节点映射、不起 Agent session）。
- **20 个经营网络节点**：共由 31 个 AGT 席位通过 38 条带 C 依据的连接覆盖（含 `direct_reuse`、`sub_contributor`、`evidence_input`、`boundary_contributor`、`readonly_consumer`、`platform_steward` 六类关系）。
- **19 个未直连 20 主网节点的 AGT 席位**：在 C-300..C-309 中属于跨事项治理（OM-01..04）、专项渠道/合作/客服/对账（BO-16/17/20/28/29/31/32/34/35）、独立控制（IC-01/02/03/05）或平台运行底座（DA-03/05），按 C-270 / C-198 / C-199 按题进入，保持 `node_links=[]`，绝不靠名称相似硬连。

## 3. 正交工作视图（`index.html` + `app.js`）

- **零 WebGL / 零 Three.js 依赖**：使用原生 Canvas2D 绘制板面、部门块、席位底台、关系折线与箭头；`three.module.min.js`（671KB）不再由工作视图加载，冷启动体积立降 69%，且消除 GPU 上下文丢失白屏风险。
- **所有文字在 DOM overlay**：字号固定 ≥12px，不随相机缩放变形。
- **全局搜索框**：支持按 `AGT-xxx`、别名、`OM/BO/IC/DA-xx`、`C-xxx`、节点名实时过滤，点击结果自动切板、平移放大聚焦并展开侧栏。
- **双向联动与决策抽屉**：
  - 点击席位 → 显示 `OM/BO/IC/DA` 能力站位、准入状态，以及关联的经营网络节点（点击直跳网络视图对应节点）；
  - 点击网络节点 → 显示关联的 AGT 席位（点击直跳组织视图并放大聚焦）、123 条协作关系（含方向、传递对象、双方 C 号）及全量来源卡展开按钮；
  - 点击任意 `C-xxx` 标签 → 侧栏直接展示该决策在 `context-pack.md` 中的标题、行号、关联节点与关联席位。
- **可读性自检（`?audit=1`）**：在 `1440×900`、`1280×720`、`720×450` 三档视口下，组织席位与经营网络两块板均 `PASS`（重叠 0、穿卡 0、字号 <12px 为 0、截断 0）。

## 4. 独立 3D 展示页（`showcase.html` + `showcase.js`）

- `PerspectiveCamera(38)` + 阴影贴图 + 轨道控制；
- 组织空间：一级部门分层抬升，席位立柱高度映射 `tier`（T0→T4）；
- 网络空间：节点立柱高度映射被引用卡数，关系为柱顶二次贝塞尔 Tube 曲线；
- Raycaster 拾取：支持在 3D 侧栏中直接点击实现「席位 ⇄ 网络节点」跨空间跳转；
- 页头固定横幅标明：**展示视图 · 不参与可读性验收 · 不是运行系统**。

## 5. FLOW-02 × SCN-002 只读试点镜头（批次 4）

- 顶栏新增 **「FLOW-02 试点镜头」** 按钮：一键高亮核心参与席位（`AGT-008 / AGT-005 / AGT-001 / AGT-045`）、T3 上下文注入/装配席位（`AGT-006 / AGT-007 / AGT-009 / AGT-035 / AGT-048`）及 6 个目标经营网络节点。
- 侧栏展示 `STG-01..STG-08` 八阶段只读合同、并发上限（2 个 session）、失败门禁，并支持一键跳转对应席位或网络节点。
- 配套能力与契约修复：
  - `skill-library/candidates/conflict_of_interest_check/`：新增 `AGT-005` 独立复核利益冲突检查候选（`SKILL.md` + `coi_check.py`，`--selftest` 4/4 通过）；
  - `skill-library/skills/04081-product-launch-planner/SKILL.md`：修正 `disable-model-invocation: true`；
  - `.codex/pilot/seat-registry.json` 与 `.codex/pilot/read-only-overlay.json`：落实 C-01..C-04（53/53 `runtime_layer` 与 `human_owner_ref=PENDING`、50/50 `preset_id=agt-NNN`）。

## 6. 批次 8 · FLOW-02 试点七项生效前置工程闭环与门禁

- `configs/pilot-flow02-preconditions.json`：定义《FLOW-02 × SCN-002 只读试点限定授权决定》§4 的全部 **7 项生效前置**（`P1..P7`）：
  - **工程已就绪（4/7）**：`P1` 席位注册表 53 行与 `runtime_layer`（46 席 `unassigned`）、`P2` 只读覆盖层（50 AGT `agt-NNN` + 3 MGT rule pack = 53/53 覆盖且 `can_emit_action_intent=false`）、`P5` 只读访问策略（`deny-by-default` + 14 字段 `hash_chain` 审计）、`P7` Risk Interrupt 风险中断通道（`SEV-1(15m)/SEV-2(2h)/SEV-3(24h)` 分级与冻结规则）；
  - **工程结构已就绪、待真人签核/宿主冻结（3/7，严禁代填）**：`P3` 离线证据包 manifest（已对仓库内 `b01_trial_01/02` 两个独立源共 42+108 行完成 15 字段、`sha256` 与 `row_count` 确定性校验，待真人指定真实品类数据 owner）、`P4` `layer_0` 6 个具名人类 owner 与替补槽位、`P6` DSH 宿主构建三个 hash（`desktop/harness/compiler`）。
- `scripts/check-pilot-preconditions.py`：7 项前置确定性校验器（`--selftest` 8/8 负向与正向断言通过），已接入 `scripts/check-ledger-consistency.py` 统一门禁与 `build-canvas-graph.py`，并在 2D 工作视图与 3D 展示页的「FLOW-02 试点镜头」侧栏实时展示 `P1..P7` 状态。

## 7. 批次 9–11 · 公开门面卫生、八阶段 Schema 正负向 Fixture 与单 Case 只读干跑回放

- **批次 9（公开门面卫生与门禁扩展）**：
  - 公开门面 7 个文件（`.codex/context-pack.md`、`.codex/product-responsibility-research.md`、`.codex/sources.md`、`CONTEXT.md`、`deliverables/research/sanbao-sources.md`、`deliverables/canvas/sanbao-identity-boundaries.html` 及对应 `.superpowers/` 原文件）中的本机路径已全部替换为仓别名，`/Users/` 命中数均为 `0`；
  - 新增 `deliverables/execution/sanbao-handoff-20261104/NOTICE-paper-to-skills.md`（落实 C-385 著作权与第三方例外声明）；
  - `scripts/check-ledger-consistency.py` 新增交接包零路径门禁与 `status=draft` 标题状态一致性门禁（`--selftest` 22/22 通过）。
- **批次 10（FLOW-02 八阶段 Schema 与 16 个正负向 Fixture）**：
  - `configs/flow02-stage-contracts.json`：定义 `STG-01..STG-08` 八阶段机器契约（必填字段、生产者、T3 注入席位、目标主网节点、门禁不变量）；
  - `scripts/run-flow02-dryrun.py --selftest`：逐阶段验证 8 个正向样本 + 8 个必败负向样本（16/16 通过）。
- **批次 11（单 Case 离线只读 3 次重放干跑与 2D/3D 阶段步进器）**：
  - 基于受控合成样本 `b01_trial_01/02` 运行 `CASE-FLOW02-SCN002-DRYRUN-001`，3/3 重放结果逐位一致，生成 9 条 `append-only` hash 链审计事件，并在 `STG-08` 因存在未验证项诚实收口为 `decision=PARTIAL` + `action_disposition=NO_ACTION`；
  - 2D 工作视图与 3D 展示页的「FLOW-02 试点镜头」侧栏新增 `STG-01..STG-08` 阶段回放步进器，点击任一阶段实时高亮该阶段的主责席位、注入席位、目标节点并展开产物 JSON。

## 8. 批次 12–14 · 三主链与跨链复用热力镜头、Policy Gate 10 类负向测试、入口挂载

- **批次 12（三条主链 + 跨链复用热力镜头）**：
  - `configs/seat-node-crosswalk.json` 新增 `chain_lenses`，完整覆盖 `01 新品经营`、`02 持续经营（C-043..C-049）`、`03 新市场经营（C-314/C-315）` 三条价值创造主链及其核心问题与反误读停止线；
  - 2D 工作视图与 3D 展示页的「三主链 / 试点镜头」侧栏支持一键切换 **`01 新品经营 | 02 持续经营 | 03 新市场经营 | 跨链复用热力`**，直观展示 3 链全勤枢纽席位（5 席）与 2 链共用支撑席位（8 席）。
- **批次 13（FLOW-02 只读 Policy Gate 10 类负向测试与四席 12 项技能契约）**：
  - `configs/pilot-4seat-skill-contracts.json`：固化四席（`AGT-001/008/005/045`）12 项 L3 业务技能的输入、方法、分支、输出字段、失败处置与验收判据，并在席位详情侧栏直接展示；
  - `scripts/check-readonly-policy-gate.py --selftest`：验证 12/12 技能契约完整性与 10/10 只读负向越界拦截测试全绿，已接入 `check-ledger-consistency.py`。
- **批次 14（总入口索引挂载）**：
  - `README.md`、`deliverables/SANBAO-RESULTS.md`、`deliverables/README.md`、`HANDOFF.md` 已全部挂载 `src/orgmap/` 与 `sanbao-handoff-20261104` 入口。

## 9. 批次 15–17 · 50 席真实数字员工头像、四维档案卡与剩余四项治理机制门禁

- **批次 15（真实数字员工头像与四维档案编译器）**：
  - 将 `WorldPilot Collection 06` 数字员工头像库中 50 个 `AGT-001..050` 的深浅两套 `64px / 256px` WebP 资产（共 200 张，1.5MB）入仓至 `src/orgmap/assets/avatars/{light,dark}/{64,256}/`；3 个 `MGT-001..003` 严守 T4 决策权规则包边界，使用纯矢量铜牌 `src/orgmap/plaque.js`（零 Three.js 依赖），不套人形头像；
  - 扩展 `scripts/build-canvas-graph.py`，构建期抽取 53 席完整四维档案（灵魂 `soul`、岗位职责与独立 Playbook `duty`、技能与供给映射 `skills`、协作与硬红线 `collaboration` 及 `CR-AO-001` 9 席职责增补叠加层）写入 `source-snapshot.json` 与 `data/graph.js`。
- **批次 16（四维数字员工档案卡 `src/orgmap/dossier.js`）**：
  - 2D 浅色工作视图与 3D 深色展示视图共用 `renderDossierHtml()`，提供 `01 灵魂 · 02 职责 · 03 技能 · 04 边界` 粘性章节导航、256px 装裱肖像、灵魂原则引语与停止信号轨、标准交付物标本框、CR-AO-001 增补签条、Playbook 步骤时间轴、技能供给进度条与试点 L3 契约折叠卡、可点击跳转的协作同事头像芯片及「我绝不做什么」红线清单；
  - 1440×900 视口下 2D 画布默认显示全部 50 个真实数字员工小头像且 `window.__audit()` 保持 `PASS`（0 碰撞、0 遮挡、0 截断，零 Three.js 加载）。
- **批次 17（优化草案 §9 剩余四项缺失治理机制门禁）**：
  - 新增 `configs/pilot-governance-mechanisms.json` 与 `scripts/check-governance-mechanisms.py`（`--selftest` 4/4 机制 + 16/16 正负向用例全绿），覆盖 `Falsification Gate（证伪门禁）`、`Conflict Record（分歧记录契约）`、`Program/Incident 跨事项承接`、`预算与并发配额上限`，已接入 `check-ledger-consistency.py` 与 `build-canvas-graph.py`。

## 10. 批次 18–21 · Sagegogo 全站色彩对齐、Three-Scope-Map 厚板/追光/HUD 环、Polyfork 科技工位与 Image2ThreeJS 全息投影台

- **批次 18（单一主题源 `src/orgmap/theme.js` 与 `sagegogo.com` 色彩对齐）**：
  - 建立 `src/orgmap/theme.js` 单主色 HSL 增量派生引擎（零 Three.js 依赖），2D 工作视图固定 `SAGE_LIGHT`（`#ffffff / #f4f7fb / #edf3f9 / #202b38 / #396397`），3D 展示空间固定 `SAGE_DARK`（`#030408 / #07121c / #0b1521 / #142033 / #c4d0dc / #aec8e2`）及四大部门色（`#74bfe8 / #396397 / #edb76c / #bd98e5`）；
  - 清除全部旧墨绿/黄铜/暖黄硬编码，`carpetTexture()` 消除 `Math.random` 改为固定种子 `mulberry32(0x5A4B18)`。
- **批次 19（借鉴 `three-scope-map-skill`：多层发光厚板、外轮廓窄带追光、底部三层旋转 HUD 环与缓动运镜）**：
  - `createSideGradientMaterial()`：Y 轴三段 `smoothstep` 侧墙厚度渐变 + 顶部 `edgeGlow`；
  - `buildChaseLight()`：沿主基座外框构建 160 段窄带追光（Additive 着色器，白色流光头 `#ffffff` + 冰蓝指数尾迹 `pow(1 - d/tail, 1.65)`）；
  - `buildHudRings()`：底部 3 层同心 `RingGeometry` + 11 段弧线 + 48 刻度线（`renderOrder: -3`）；
  - `VIEW_PRESETS` + `tweenCamera()`：支持 `800ms easeOutCubic` 缓动运镜与 `?still=1&pr=1` 确定性截图开关。
- **批次 20（借鉴 `polyfork.dev` + `image2threejs`：科技工装分身、双联发光仪表盘工位与 3D 体素全息扫描台）**：
  - `src/orgmap/avatars.js`：启用 `flatShading: true` + `vertexColors: true`，升级为 6 棱台科技工装夹克、AR 光学护目镜、耳麦与发光工牌（每席 1 个 `BufferGeometry`、1 draw call）；3 个 MGT 升级为 T4 钛金全息规则碑（0 人形、0 工位）；
  - `buildWorkstations()`：升级为双联微倾自发光仪表盘曲面屏（`dashboardScreenTexture`）+ 桌前缘冰蓝导光条 + 桌下 AI 算力刀片机柜与准入状态 LED；
  - `src/orgmap/holo.js`：改造 `image2threejs` 网格采样算法为单个 `THREE.InstancedMesh`（1 draw call，约 1,281 体素实例），点击任意 `AGT-001..050` 即在前庭全息发射台实时生成 3D 冰蓝体素全息雕像与扫描光环。
- **批次 21（视觉契约门禁与来源合规声明）**：
  - 新增 `scripts/check-orgmap-visual-contract.py`（`--selftest` 7/7 通过）并接入 `scripts/check-ledger-consistency.py`；
  - 新增 `deliverables/execution/sanbao-handoff-20261104/NOTICE-three-scope-map.md` 记录四方来源与许可证边界。

## 11. 批次 22–24 · 全站去 AI 味中文改版、3D 区域巡检与全息实时名牌、公开地图入口与历史路径收口

- **批次 22（全站与档案卡去 AI 味 / 人话改版）**：
  - 将 `dossier.js`、`index.html`、`showcase.html`、`app.js`、`showcase.js` 中的中英重复标题与内部字段名（如 `SOUL CONTRACT`、`ARTIFACT ENVELOPE`、`production_authorized=false`、`UNVERIFIED`）全面改写为自然易读的中文（`01 处事原则与停手线`、`02 岗位职责与工作步骤`、`03 业务技能与工具包`、`04 协作同事与红线`）；
  - 为 `FLOW-01..08`、`PB-001..008`、`SCN-001..020` 补齐官方中文全称，并将底层文件路径与 `sha256` 收进页脚折叠栏。
- **批次 23（3D 区域快捷导览栏 + 全息台实时名牌 + 悬浮名片点击直达）**：
  - 3D 空间底部新增 `#zone-dock` 导览胶囊（`全景总览 / 业务运营 35人 / 经营管理 5人 / 独立控制 5人 / 数据与平台 5人 / ★ 前庭全息台`），一键丝滑运镜；
  - 前庭全息台上方新增实时名牌，动态显示当前正在投影的数字员工姓名与职务；3D 悬浮名片支持直接点击切换全息投影与右侧档案。
- **批次 24（`docs/index.html` 入口挂载与 `skill-library/` 历史路径清零）**：
  - 在 `docs/index.html`（及同步副本 `deliverables/canvas/sanbao-public-map.html`）挂载 2D 组织索引与 3D 数字员工空间入口；
  - 将 `skill-library/` 8 份历史报告中的旧主机路径脱敏为 `<historical-host>`，`check-ledger-consistency.py` 实现零 INFO 噪音全绿通过。

## 12. 批次 25–28 · 一体化 3D 组织与经营网络空间（天地同屏 + 38 条跨层能量光柱 + 页内卡片预览舱 + 双主题热切换）

- **批次 25（天地同屏三层 3D 架构 + 38 条跨层能量光柱 `src/orgmap/beams.js`）**：
  - 消除原本「办公空间」与「经营网络」互斥隐藏的两张皮设计：将 20 个经营网络节点与 123 条流光飞线抬升至办公区正上方的天幕层（`Y = +320cm`），与地面 50 个数字员工工位（`Y = 0cm`）及北侧 3 座 T4 管理规则碑同屏呈现；
  - 新增 `src/orgmap/beams.js`：依据 `configs/seat-node-crosswalk.json` 的 38 条真实映射，用单个 `LineSegments` + 单个 `Points`（76 颗流动脉冲粒子，仅 2 个 draw calls）将天幕 20 个业务节点与地面 31 个核心员工工位直接相连，悬停或点击任意员工/节点即点亮其关联跨层光柱。
- **批次 26（单画布四模态无缝运镜 + 顶栏全局搜索与 C 决策抽屉入 3D）**：
  - 3D 空间支持一键切换 **`天地同屏` / `办公工位层` / `天幕网络层` / `平面俯视（88° 垂直俯视读图）`** 四种模式；
  - 顶栏合入全局搜索框（`#q3d`）与完整 `C-xxx` 决策详情抽屉，在 3D 站内即可直接搜索员工、工号、业务节点和 377 条决策记录并自动飞向目标。
- **批次 27（63 张原始画布卡片页内毛玻璃预览舱 `src/orgmap/lightbox.js` + 深空/极昼 3D 主题热切换）**：
  - 新增 `src/orgmap/lightbox.js`：点击右侧任意来源画布卡直接在当前页面弹出毛玻璃预览舱（支持 `ESC` 关闭与新标签页打开），无需跳出 3D 现场；
  - 顶栏新增 `☀ 极昼浅色 / ☾ 深空钛蓝` 实时主题切换按钮（`apply3dTheme`），零刷新同步切换 Three.js 场景背景、雾、曝光、UI 变量与员工深/浅色真实头像。
- **批次 28（视觉契约门禁升级与性能实测）**：
  - 天地同屏全开（50 员工 + 20 节点 + 123 飞线 + 38 跨层光柱 + 1,281 体素全息分身）实测 `calls = 122`、`triangles = 69,897`、控制台 `0 Errors`；
  - `scripts/check-orgmap-visual-contract.py --selftest`（7/7）与 `scripts/check-ledger-consistency.py`（22/22）全部通过。


## 13. 批次 29–32 · 离线卡片预览兜底、键盘无障碍与窄屏适配、选择性辉光与入场运镜、单一入口收口與性能门禁

- **批次 29（修掉三个真实缺陷）**：
  - `src/orgmap/lightbox.js`：改为先用 `HEAD` 探测原始画布卡是否存在；在 clean clone 或缺少本地设计工作区时自动切换为「内置台账摘要卡」，消除空白 404 iframe，且源码中不再硬编码 `.superpowers` 字面量路径；
  - `src/orgmap/showcase.js`：为全部可交互 3D 悬浮标签（50 员工、20 节点、3 座规则碑、全息台名牌）补齐 `tabindex="0"`、`role="button"`、`aria-label` 与 `Enter / Space` 键盘激活及可见焦点描边；
  - `src/orgmap/showcase.css`：新增 `max-width: 1279px` 与 `max-width: 767px` 响应式断点，窄屏下顶栏自动换行、底部导览栏横向滚动、右侧详情栏转为底部抽屉（`#side-toggle-btn`）。
- **批次 30（选择性辉光 Selective Bloom + 首屏 1.8s 俯冲入场镜头）**：
  - 新增 `src/orgmap/vendor/bloom.module.js`：基于半分辨率亮度阈值提取 + 雙向 Gaussian Blur + Additive 合成，仅对天幕节点、38 条能量光柱、规则碑顶冠与全息台产生辉光（仅增加 4 个全屏 Quad draw calls），支持顶栏 `✦ 空间辉光` 实时开关与深浅主题自适应强度；
  - 新增 `runIntroSweep()`：首屏从 60° 高空俯冲缓动至 38° 标准天地同屏视角；`?still=1` 与 `prefers-reduced-motion: reduce` 自动跳过。
- **批次 31（收口为单一默认入口）**：
  - `src/orgmap/index.html` 直接承载一体化 3D 组织与经营网络空间（含 `cosmos / org / network / plan` 四模态与 `?view=plan&audit=1` C-032 可读性自检）；`showcase.html` 转为保留 query/hash 的零延迟兼容跳转页，消除跨页跳转与双入口分裂。
- **批次 32（性能、响应式与可访问性门禁）**：
  - `scripts/check-orgmap-visual-contract.py` 新增 `@media` 响应式断点检查、3D 标签 `tabindex="0"` 与 `role="button"` 可访问性检查、`lightbox.js` 禁止硬编码 `.superpowers` 路径检查及 `createSelectiveBloom` 存在性检查（`--selftest` 11/11 通过）；
  - 记录四模态 × 双主题 × 辉光开关性能基线至 `tmp/debug/orgmap-b32-perf.json`。

## 14. 腾讯云 Docker 容器化部署（`configs/docker/`）

生产镜像仅打包白名单静态目录（`src/orgmap`、`docs`、`deliverables/canvas` 共 227 个文件，Gzip 传输体积 2.54 MB），排除 `.codex`、`.superpowers` 与 `skill-library`。

```bash
# 1. 部署前安全与静态资产自检（并可选导出 2.5MB 最小离线部署包）
python3 -I scripts/check-docker-deploy-readiness.py --selftest
python3 -I scripts/check-docker-deploy-readiness.py --bundle tmp/outputs/tmp-bundle-tencent-docker-20261109-01.tar.gz

# 2. 在腾讯云服务器上启动（默认监听 8080 端口，可通过 SANBAO_PORT=80 覆盖）
docker compose -f configs/docker/docker-compose.yml up -d --build

# 3. 健康检查与访问
curl -fsS http://127.0.0.1:8080/healthz
# 浏览器打开 http://<腾讯云公网IP>:8080/ （自动 302 进入 /src/orgmap/ 一体化 3D 空间）
```

## 15. 批次 33–36 · 63 张画布卡脱敏入包、腾讯云 HTTPS 反代与一键发布脚本、弱网/集显 FPS 守护与双指触控、全量门禁合龙

- **批次 33（63 张原始画布卡脱敏入包 + 同源预览）**：
  - `scripts/check-docker-deploy-readiness.py --export-sanitized-cards`：自动扫描 `.superpowers/brainstorm/38196-1789923100/content/*.html`，将 55 个文件中的 375 处 `/Users/<user>` 本机路径脱敏替换为 `<workspace>` 后输出至 `src/orgmap/cards/`（共 63 张卡，0 处 `/Users/` 残留，目录由 `.gitignore` 忽略不污染 Git 历史，但随部署包打入腾讯云容器）；
  - `src/orgmap/lightbox.js`：优先请求同源 `./cards/<file>`，使腾讯云容器内点击右侧任意来源卡均可直接在毛玻璃预览舱内查看 100% 完整的原版画布卡。
- **批次 34（腾讯云 HTTPS 自动证书反代与一键远端发布脚本）**：
  - 新增 `configs/docker/Caddyfile` 与 `configs/docker/docker-compose.https.yml`：支持绑定域名时自动签发 Let's Encrypt / ZeroSSL 证书并开启 HSTS 与 Zstd/Gzip 压缩；
  - 新增 `scripts/deploy-tencent-docker.sh`：支持 `--dry-run` 预演与 `--host user@<腾讯云IP> [--port 8080] [--https domain]` 一键完成「本地门禁 + 63 卡脱敏打包 + SCP 上传 + Docker Compose 原子重建 + 远端 `/healthz` 探针核验」。
- **批次 35（集显/弱终端 FPS 自适应降级守护 + 移动端双指捏合缩放）**：
  - `src/orgmap/showcase.js` 新增 `triggerLowPowerFallback`：采样首 60 帧渲染耗时，若平均帧率 `< 35fps`（单帧 `> 28.5ms`），自动关闭 Selective Bloom 并将 `pixelRatio` 降至 `1.0`；
  - 新增 `activePointers` + `applyPinchDelta` 双指捏合缩放（Pinch-to-Zoom）与 `#stage { touch-action: none }`，隔离双指缩放与单指旋转。
- **批次 36（Docker 部署门禁并入 `check-ledger-consistency.py` 总门禁）**：
  - `scripts/check-docker-deploy-readiness.py --selftest`（8/8 通过）已正式并入 `scripts/check-ledger-consistency.py` 总门禁。
