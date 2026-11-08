---
title: 三宝组织索引 · 数据层 / 正交工作视图 / 3D 展示页 / 席位—节点 Crosswalk
doc_type: architecture
module: sanbao-orgmap
topic: canvas-graph-index
status: draft
created: 2026-11-08
updated: 2026-11-08
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
# 工作视图（正交 Canvas2D + DOM，承担 C-032 验收）：
#   http://127.0.0.1:8765/src/orgmap/
#   http://127.0.0.1:8765/src/orgmap/?audit=1
# 3D 展示页（透视 WebGL，不参与 C-032 验收）：
#   http://127.0.0.1:8765/src/orgmap/showcase.html
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
