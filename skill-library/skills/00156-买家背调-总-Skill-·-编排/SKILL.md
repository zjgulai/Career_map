---
name: 买家背调
version: "1.4.0"
description: |
  交互式买家背调。商家给一条买家线索（公司名/邮箱/官网/Alibaba链接/可选平台buyer_id），产出背调风险卡片+可展开报告。
  流程：需求澄清→公网搜索背调→AI Judge MCP校准(可选,查不到也能跑)→合并渲染。
  当用户要背调买家、核验海外买家身份/风险/采购力、或说"背调这个客户/买家"时使用。
enabled: true

triggers:
  - 背调
  - 买家背调
  - 背调买家
  - 背调这个客户
  - 核验买家
  - 买家身份
  - 买家风险
  - 采购力
  - 买家背景
  - 了解买家
  - buyer bgcheck
  - buyer background check

examples:
  - 帮我背调这个买家：ACME Trading Ltd, email: joe@acme.com
  - 这个客户靠不靠谱，帮我查一下
  - 帮我背调一下这个买家 https://acme.en.alibaba.com/
  - 这个买家身份核验一下，公司名是 XYZ GmbH
  - 帮我查下这个买家的采购力和风险

excludes:
  - skill: alibaba-cco-rag
    when: 用户只是咨询平台规则或官方FAQ，不涉及具体买家背调
  - skill: alibaba-analysis-brief
    when: 用户要分析自店经营数据，而非背调买家
  - skill: alibaba-competitor-analysis
    when: 用户要拆解竞品店铺/Listing打法，而非背调买家身份/风险

workflow: |
  Step 0: 阅读 references 规范与 MCP_SPEC.md，掌握轻量触发路由、字段契约、锚点分级、搜索策略、输出模板、错误降级与批量交付规则
  Step 1: 需求澄清 — 先按 references/trigger-routing.md 做非阻塞快速路由，再按 references/anchor-standardize.md 提取核心锚点(6类) + 输入分级(A/B/C/D) + 最多一轮追问；若用户用“这个买家/这个客户”等指代词指向背调对象，必须先确认对象信息，不得直接开跑
  Step 2: 公网搜索背调 — 按 references/web-search-strategy.md 执行工商/制裁/信誉/画像/网站/行业/触达渠道/长报告扩展 8 类检索目标（布尔合并查询 + 官网≤3 页 + 硬性早停），并按 references/background-fields.md 生成 step2.json
  Step 3: AI Judge MCP — 通过 workctl 调用 bgcheck_judge(可选增强,10–15s等待预算,调不通也能出纯公网卡片)，接口契约见 MCP_SPEC.md
  Step 4: Merge 输出 — card_renderer.py/html_card.py/report_html.py/report_md.py 合并产出卡片文本+HTML+7 段式长报告（HTML 与 md 双版），展示规则见 references/output-template.md
  Step 5: 批量交付 — 3 个以上买家按 references/batch-bgcheck.md 执行范围确认、运行目录、每 20 个阶段确认、汇总与交付前格式确认；大批量任务需提示积分/资源消耗并获得用户确认
---

# 买家背调（总 Skill · 编排）

商家给你一条买家线索，你产出一张**背调风险卡片**（默认态）+ 一份**可展开完整报告**。
严格按状态机执行，遵守**可见性纪律**；批量场景按独立交付规范处理。

> 本 skill 自带辅助脚本，位于本 SKILL.md 同目录的 `scripts/` 下，用 `bash` + `python3` 调用。
> 用 `$SKILL_DIR` 表示本 skill 根目录（= 本文件所在目录）。执行前先：
> `SKILL_DIR="<本SKILL.md所在目录的绝对路径>"`
>
> 降级专用脚本（编排失败时用，详见全局纪律第 9 条）：`scripts/write_minimal_step2.py` 写“信息有限” step2 骨架（L3）；`scripts/emergency_deliver.py` 产出四要素最小交付文案（L4）。

---

## Step 0 — 阅读规范（必做）

执行前先阅读并遵守以下文件：

| 文件 | 用途 |
|------|------|
| `references/trigger-routing.md` | Step0/Step1 轻量触发路由；只做文本级判断，不调用工具、不阻塞 |
| `references/anchor-standardize.md` | Step1 核心锚点提取、输入分级、追问规则与辅助识别信息 |
| `references/web-search-strategy.md` | Step2 公网搜索顺序、深度、证据采信与合规边界 |
| `references/background-fields.md` | Step2 `step2.json` 字段契约、身份枚举、证据留痕 |
| `MCP_SPEC.md` | Step3 `bgcheck_judge` 入参、双桶出参与降级 |
| `references/output-template.md` | Step4 卡片、报告、HTML 链接和话术红线 |
| `references/follow-up-suggestions.md` | Step4 跟进建议与话术内置生成的分档规则、社媒推导与红线 |
| `references/error-handling.md` | Step1–Step4 异常分流与兜底话术 |
| `references/batch-bgcheck.md` | 批量背调、运行目录、汇总文件、交付前确认 |
| `references/image-precheck.md` | 图片/截图输入预处理：下载、读取、信息提取与用户确认（含超时兜底） |

> `references/trigger-routing.md` 只用于快速参考，不是执行器：判断不准但包含背调强触发词时，默认放行到主流程继续处理，不为路由准确性执行长耗时查询。
>
> 追溯能力来自对检索推理步骤的完整记录：Step2 的 `web_evidence` 与批量 `manifest.json` 必须记录检索推理步骤支撑结论追溯，但用户可见输出不展示内部过程流水。

---

## 全局纪律（最高优先级）

0. **【最优先】指代词/无具体信息请求强制确认**：在做任何触发路由、锚点提取、分级判断之前，先检查本轮用户原始请求本身是否**只包含指代/泛指对象、没有任何具体可核实信息**（公司名/邮箱/官网/Alibaba链接/buyer_id 等）。命中词包括但不限于：“这个/这位/该/此/上述/前面提到的/刚才那个/同一个/上次那个”+“买家/客户/公司”，以及单独的“他/她/它/这个/那个”。只要命中，**必须立即先输出确认句**，把当前能从上下文/会话历史推断出的买家信息复述给用户核实，**在用户明确确认之前不得调用 WebSearch/workctl 等任何工具、不得进入 Step2**。
   - 即使当前会话上下文、上一轮结果、历史记录里"看起来"已经很清楚是谁，也不能因此跳过这一步——上下文充分只影响确认句里复述的内容详略，不能替代确认动作本身。
   - 即使 trigger-routing 判断为 `direct_single`/`context_single`，或 anchor-standardize 分级已经是 A/B 级，只要原始请求文本命中指代词模式，也必须先确认，确认优先级高于分级结果。
0b. **图片/截图输入强制确认**：当任务上下文中含图片 URL 时，按 `references/image-precheck.md` 执行图片预处理（下载→读取→提取→确认，含超时兜底）。**在用户确认之前不得进入 Step2**。图片预处理环节独立于 Step1 步骤编号，不计入主流程序号。
1. **可见性**：Step3 MCP 返回 `visible` 和 `hidden` 两个桶。你**只能**展示 `visible.*`。
   `hidden.*`（置信度分值/标签、ai_reasoning、原始 GMV/DNB、平台采购/订单记录、落库回执 tables_written/byr_admin_mbr_seq）**绝不**出现在卡片、报告、聊天文本、过程提示、Background Process tail 里。
2. **置信度用途**：`hidden.ai_confidence` 只用来 ①决定卡片可信度标记(✅/⚠️/❓) ②决定措辞是否加“疑似/待补充”。不得写出数值或标签。
3. **落库不可见**：MCP 内部落 ODPS 三表对用户透明，不要提“写入了什么表”。
4. **只查公开信息**：制裁筛查必查；不破付费墙、不社工、不碰暗网。
5. **一轮澄清上限**：Step1 最多追问一轮；低信息量输入必须先追问，用户明确无法补充或要求继续时，才以 low_confidence 继续。
6. **批量节制**：单次任务最多 100 个买家，超过直接拒绝并要求拆分为多次任务；大批量买家背调会消耗较多积分/资源，超过 20 个买家必须提示并获得用户确认；默认并行 2 个子 Agent，超过 20 个买家可适当提至 4 个，除非用户明确要求更多否则不超过 4，最多 6（封顶）；一次批量任务每完成 20 个买家必须暂停让用户确认阶段结果与执行方式。并行执行只能发生在当前 20 个窗口内，未获确认前不得预调度或后台运行后续批次；连续运行约 30 分钟需同步进度，约 60 分钟必须暂停确认。
7. **Step3 内部状态不外显**：MCP 未认证、超时、无匹配、不可达、降级等只作内部处理，不写进用户可见过程提示、卡片或报告。
8. **交付路径硬约束（致命）**：present_files 和正文链接必须使用绝对路径；交付前必须验证文件在该路径下真实存在。不得使用相对路径，不得通过复制文件到其他目录来“修复”路径问题。
9. **编排失败必须走四级降级，禁止静默终止（致命）**：子 Agent 超时/无返回/被权限中止/网络错误时，按顺序试完四级降级：**L1** 从已有产物续跑 → **L2** 降级交付已有结果（标注未完成维度）→ **L3** 主会话内联串行补跑（限最小检索深度；仍不可行时用 `scripts/write_minimal_step2.py` 写“信息有限”骨架后走正常 Step4）→ **L4** 用 `scripts/emergency_deliver.py` 产出最小交付。**L4 是兜底不是出口：不存在“不交付”选项，只说“未找到产物”就报错退出本身属于违规**。最小交付必含四要素：输入信息回述、完成到哪一步 + 未完成维度、“公开信息有限”结论口径、产物绝对路径清单 + 补充建议（用户要求过时间范围时必须说明范围）。另：降级结论（含“无结果/信息有限”）一旦确定必须**先落盘 step2** 再做其他动作；背调环节失败只能降级该环节结论，**不得放弃多 Skill 组合流程的后续环节**；禁止同参数盲目重试，重试必须先更换策略或简化任务；已产出 step2/merged 结果时必须直接复用，禁止重复检索。**子 Agent 状态显示 Completed 但返回正文是平台错误（如 `Model Service Temporarily Unavailable` / `505` / 网关 5xx / `Please try again later`）时，一律视同无返回，照样走完 L1→L4；禁止把平台错误原文当背调结论透传给用户，也不得以“建议换模型/稍后重试”代替交付。**降级矩阵与四级阶梯详见 `references/error-handling.md` §8。
10. **ask_user 调用规范**：`question` 必填；收集自由文本信息必须用 `mode:"fields"`（或无 quickReplies 的 chat），禁止用 quickReplies 按钮收集自由文本（会隐藏输入区）；`mode:"fields"` 用 `fields` 字段（不得传 `questions`）；超时未回复视同用户无法补充，执行有限背调而非失败。规范见 `references/anchor-standardize.md` §4。
11. **禁止无证据推测买家画像（致命）**：背调未完成或零公开证据时，不得推断买家的主体类型（分销商/批发商/制造商/贸易商等）、商业模式、采购规模或风险点，只能写“公开信息有限”并说明需补充什么；核验未跑完时风险口径统一用“⚪ 暂时低风险”（意为暂未发现风险信号、结论未最终确认），不得写成已核验的“🟢 低风险”，也不得声称“合规通过/无负面”。`scripts/card_renderer.py` 已内置证据门禁会自动中和推断措辞，Agent 不得在对外文本里绕过。

---

## Step 1 — 需求澄清（可见）

按 `references/trigger-routing.md` 与 `references/anchor-standardize.md` 执行。路由只做非阻塞快速判断，不调用工具；不确定但有背调强触发词时放行到本 Step 继续处理。

0. **指代词对象确认（第一步，先于锚点提取执行）**：判断本轮原始请求是否命中全局纪律第0条的指代词/无具体信息模式。命中则先向用户确认当前识别到的买家公司名、联系人、国家、邮箱、官网、Alibaba链接或询盘上下文，用完整确认句复述，不省略、不简化为“确认一下买家信息”这种模糊问法。用户确认正确后才继续锚点提取；用户否认时，请其补充公司名、地址、邮箱、官网、Alibaba链接或 buyer_id，没有的信息可填“空”。
0b. **图片/截图输入确认**：当任务上下文中含图片 URL 时，先按 `references/image-precheck.md` 执行图片预处理（下载→读取→提取→用户确认，含超时兜底）。用户确认后继续锚点提取；图片预处理失败时直接要求用户补充买家信息。此环节独立于本 Step 的步骤 1–6。
1. **核心锚点提取**：`alibaba_link` > `inmail` > `email` > `website` > `whatsapp` > `company_name`。
2. **辅助识别信息**：`contact_name`、`brand_name`、`alibaba_id`、`business_context` 只用于理解需求和澄清，不替代核心锚点，不直接作为背调主体。
3. **输入分级**：A/B 级通常可进入 Step2，但不是绝对 ready；仍需检查主体是否冲突、名称是否可疑、锚点是否互相矛盾。C/D 级必须先第一轮追问一次，不得直接进入 Step2。
4. **低信息强制澄清**：仅有模糊名称、无后缀公司名、疑似品牌/昵称/店铺名，且没有邮箱/官网/Alibaba链接/buyer_id/国家时，必须先问用户补充任一强锚点。
5. **追问上限**：补不齐也继续 Step2，分别标 `low_confidence` 或 `need_clarification`；但继续前必须已经完成一次澄清，或用户明确表示“没有/继续查”。
6. **buyer_id**：用户主动给了就记录并传 Step3 优先关联；不要为拿 buyer_id 追问。

**产出**：`{ready, input_level, anchors[], buyer_input{}, buyer_id?}`。其中 `ready=true` 表示“大概率可继续 Step2”，不表示主体已被验证；若 Step1 发现异常或锚点冲突，应降为 `low_confidence` 或先澄清。

---

## Step 2 — 公网搜索背调（可见）

用 `web_search` / `web_fetch` 执行背调。检索顺序、搜索深度、证据采信、合规边界按 `references/web-search-strategy.md`；字段产出按 `references/background-fields.md`。

**合规名单疑似匹配(HIGH_RISK)**：立即终止深挖，直接进 Step4 出「🟠 建议审慎核查」卡片（Step3 仍可调用以完成服务端沉淀，不阻塞展示）。
**措辞要委婉**：不用"命中制裁名单/高风险/暂缓合作"等生硬定性词；统一表述为"与公开合规名单存在疑似匹配，建议在合作前进一步核实主体身份"。给的是提示而非结论。

**产出**（内存 JSON，**不落库**，schema 见 `references/background-fields.md` 与 `MCP_SPEC.md §2`）：
`bgcheck_result + anchors + web_evidence + input_quality_signal`

**降耗时硬规则**（详见 `web-search-strategy.md §2.1 / §3`）：合规筛查与信誉搜索**必须用布尔合并写法各 1 次发出**，不得拆成单关键词串行多次；官网访问**最多 3 页**（About → Contact → Products），行业/触达渠道/长报告扩展字段必须在这 3 页里一并提取完；主体/合规/信誉三项都有结论且官网已访问后**立即收敛进 Step3**，字段空缺不是继续搜的理由。

**海关提单记录不在本 Step 做**：它不消耗 MCP，所以改成与 Step3 并行（编排见 Step 3），避免在 Step2 末尾串行拉长总耗时。

把它写成一个 json 文件供后续脚本使用，例如：
```bash
cat > /tmp/step2.json <<'JSON'
{ "bgcheck_result": {...}, "buyer_id": "可选", "anchors": [...], "web_evidence": {...}, "input_quality_signal": "sufficient", "options": {"persist": true} }
JSON
```

---

## Step 3 — AI Judge 验真增强（服务端，不可见）

**验真中**：真实验真服务未接或 workctl 未认证时，使用内部验证链路跑通 Step3 出参结构（行为等价，含三表落库回执），该链路仅用于验真中，不进入用户可见输出：
```bash
python3 "$SKILL_DIR/scripts/judge_mcp_"*.py --input /tmp/step2.json > /tmp/step3.json
```

**真实服务/上线**：使用 `run_step3_safe.py` 封装脚本执行全部 Step3 逻辑（拆参→调用→脱敏）；脚本内部自动处理所有异常和超时降级，始终以安全状态退出，允许 Step4 用公网结果继续。对话框 stdout 只会看到一行安全状态，不会打印任何内部字段、JSON、桶名或推理内容。
```bash
python3 "$SKILL_DIR/scripts/run_step3_safe.py" \
  --step2 "$OUTPUT_DIR/step2.json" \
  --output-dir "$OUTPUT_DIR" \
  --wait-seconds 15 \
  --http-timeout 30
```

### Step 3 等待窗口内并行跑海关提单子步（可选，仅 A/B 级单买家）

Step3 是 MCP 调用，不占用搜索工具，Agent 本来要空等 10–15s。把海关的最多 2 次检索塞进这个窗口，命中业态的买家耗时增量接近 0；未命中业态的买家只跑本地门控，零网络开销。编排四步：

1. **后台启动 Step3**（上面那条命令放后台执行，不阻塞等待）。它的输出全部写文件、始终安全退出，天然可后台化。
2. **跑本地门控 + 海关检索**（零网络调用的门控先行，`should_query=false` 就只记 status 结束）：
   ```bash
   python3 "$SKILL_DIR/scripts/customs_gate.py" --step2 "$OUTPUT_DIR/step2.json"
   ```
   结果**必须先写独立文件 `$OUTPUT_DIR/customs.json`**；Step3 运行期间**禁止覆盖写 `step2.json`**（拆参会读到半截 JSON 导致 Step3 整体失败）。
3. **回收 Step3**：回头检查 `_step3_status.json` 是否已生成且 `usable` 可用（**文件存在性二次验证，不靠等进程**）。总预算仍以后台启动时刻起算的 15s 为上限：海关做完而 Step3 未就绪时只能补等剩余时间，到点即按 skipped 继续。**禁止起了后台却不回收**——那等于 Step3 结果静默丢失。
4. **合并**：Step3 回收完成后做一次原子合并，再进 Step4：
   ```bash
   python3 "$SKILL_DIR/scripts/merge_customs.py" \
     --step2 "$OUTPUT_DIR/step2.json" --customs "$OUTPUT_DIR/customs.json"
   ```

三条约束：**批量背调与 C/D 级弱输入不执行本子步**（连门控都不必跑）；两条链路的失败互不污染（Step3 失败记 `_step3_status.json`、海关失败记 `customs.status`）；**并行链路任一环不确定就退回串行**（先 Step3 再海关，或直接跳过海关），正确性优先于省这 10 秒。口径见 `references/web-search-strategy.md §3.7`，字段契约见 `references/background-fields.md §2.3`。

> **过程文件禁止 Read / 禁止 --help 外显**：以下操作均不得在对话框执行：① 直接使用 Read 工具读取 `step3.json`、`_step3_raw.json`、`_step3.stdout`、`_step3.stderr` 等 Step3 中间文件；② 运行 `workctl ... --help` 并展示其输出（help 文案含内部工具描述、落库、签名等）。这些操作仅允许通过脚本内部处理。

> 工具场景：`rlabScene=ICBU_53459_4118014AB`。联调期不收紧 schema required；保持 Step2→Step3→Step4 链路先可运行、可验证。
> **schema 探测过程不外显**：`workctl schema --search` 命令本身及其返回 JSON（含 `description` 里的 `MCP`、`ODPS`、`judge_input`、`hidden` 桶等内部措辞）只用于 Agent 内部判断真实工具路径，不得作为"过程"贴进对话，也不得逐字复述其 `description` 字段；发现工具后直接静默进入调用，无需向用户播报发现了什么工具、参数是什么。
> 若真实工具当前未注册/未暴露，或封装脚本返回 skipped 状态，立即停止真实 Step3 调用路径，不重试同类猜测命令；Step4 继续使用公网结果。不得为确认参数而在用户可见对话中执行 `workctl ... --help`。

MCP 内部：关联 buyer_id(用户给优先→锚点→查不到) → 命中则拉采买/DNB/画像 → 拼 judge_input → LLM 仲裁 → 落 ODPS 三表(result/detail/judge) → 返回最小 raw content 或 `visible/hidden`。
当前真实 MCP 可只返回 4 个 key：`judge_label`、`ai_identity_type`、`ai_identity_desc`、`ai_confidence`。这 4 个 key 足够作为身份仲裁信号；缺失的 `risk_level` / `recommendation` 不得由 Step3 默认补低风险或常规建议，必须在 Step4 回退使用 Step2 的公网风险和建议口径。
**你只处理脱敏后的返回值**，绝不打印/展开 workctl 原始 stdout、`data.content`、`ai_reasoning`、`purchase_insight` 或 raw platform signals。

**真实调用落盘与脱敏**：
- 只能通过 `run_step3_safe.py` 触发 Step3，不手工拼 `workctl` 命令，不在对话框读取/展示任何 Step3 中间文件。
- 封装脚本内部复用 `extract_mcp_params.py` 与 `sanitize_step3.py`，并将 stdout/stderr 写入内部文件；任何异常、超时、命令不可用、参数不兼容、脱敏失败都写入 `_step3_status.json` 并按 skipped 处理。
- `_step3_raw.json` / `_step3.stdout` / `_step3.stderr` / `_step3_extract.stdout` / `_step3_sanitize.stdout` / `step3.json` 只允许脚本内部或本地排障读取，不得用 Read 工具打开给用户看，不得贴进对话。
- Step4 可以把 `$OUTPUT_DIR/step3.json` 的路径交给渲染脚本；如果 `_step3_status.json` 显示不可用或 `step3.json` 不存在，Step4 省略 `--step3`，直接输出纯公网卡片。

**非阻塞内部处理**：
- Agent 侧等待预算 10–15s；超过即跳过 Step3，不继续等待，不二次追问用户。Step3 本身是加分项非必须步骤，无需为此过度拉长等待。
- `matched:false`（多数买家）→ 不展示 platform_tags，卡片照常。
- MCP 调不通/超时/命令不存在/schema 搜索为空/workflow 未注册/参数解析失败/文件路径片段错误（如 `step2.json#options`）/RLab 资源无权限（如 `code:302`）/RLab 内部 LLM 鉴权错误（如 `code:102`） → **跳过真实 Step3**，Step4 用 `step3=None` 出纯公网卡片。
- RLab `code:302` 且提示 `无权访问资源 ICBU_53459_4118014AB` 时，说明调用已进入服务端但当前调用身份/应用/环境没有目标资源权限；不要重试同一入参或修改 Step2 JSON，应升级给 MCP/RLab 发布侧授权。
- RLab `code:102` 且内部提示 `Authorization must be 'Bearer xxx'` 时，说明服务端 LLMHttpExecutor 调 ideaLAB gateway 缺少或错误配置 `[REDACTED] <ideaLAB api key>`；不要在 Skill 目录补本地 `api_key`，应升级给 MCP/RLab 发布侧配置 LLM 节点鉴权。
- 如果 `extract_mcp_params.py` 报 `invalid_step2_json`，说明 Step2 写出的 `step2.json` 不是合法 JSON（常见于手工拼 JSON 时未转义引号/换行）。只允许从已有 Step2 结构化对象用 `json.dump/json.dumps` 重写文件一次；不得为 MCP 重新 WebSearch、不得循环补搜。重写后仍失败则跳过真实 Step3，Step4 用已有公网结果或当前可用文字结论继续。
- 传入文件参数时只允许真实存在的文件路径；如果工具需要完整 Step2，传 `step2.json`；如果工具需要 options，传 `_options.json` 或先从 `step2.json` 导出独立 JSON，不要使用 `file.json#field` 片段语法。
- 以上状态只允许内部记录，不得在用户可见输出中打印“MCP未认证/非阻塞降级/平台校准暂不可用/暂无平台数据”等状态说明。
- 真实 MCP 成功返回时，也不得打印原始 JSON 或中间思考过程；涉及 DNB、GMV、订单/采购记录、平台采购、站内字段名、具体缺失情况（如“没有DNB数据”“gmv_2y为空”）必须留在服务端或脱敏 hidden，不进入任何用户可见文本。

- 批量背调时，单个买家 Step3 无结果不得阻塞整批交付。

---

## Step 4 — Merge 输出（可见）

用自带渲染脚本合并 Step2 + Step3，产出卡片文本 + HTML + 完整报告：

```bash
# 文本预览（卡片 + markdown 报告）
python3 "$SKILL_DIR/scripts/card_renderer.py" --step2 /tmp/step2.json --step3 /tmp/step3.json --text

# 生成 HTML 卡片（可展开报告）；仅公网态时省略 --step3
python3 "$SKILL_DIR/scripts/html_card.py" --step2 /tmp/step2.json --step3 /tmp/step3.json -o /tmp/bgcard.html

# 生成 7 段式长报告（单买家完整交付首选）
python3 "$SKILL_DIR/scripts/report_html.py" --step2 /tmp/step2.json --step3 /tmp/step3.json -o /tmp/bgreport.html

# 生成 7 段式长报告的 md 版（内容与上面的 HTML 等价，可归档、可二次编辑）
python3 "$SKILL_DIR/scripts/report_md.py" --step2 /tmp/step2.json --step3 /tmp/step3.json -o /tmp/bgreport.md
```

> **要交 md 报告时必须跑 `report_md.py`，不得拿 `card_renderer.py` 的 `report_markdown` 当长报告落盘**。后者是紧凑卡片正文（同时供 `html_card.py` 消费），只有结论、六维判断和佐证链接，缺采购信息、质量判断依据、风险点表与两轮英文邮件；`report_md.py` 与 `report_html.py` 同源于 `report_model.py`，段落与内容完全等价。

**三种交付形态的适用场景**（共用 `card_renderer.py` 的证据门禁，风险/可信度徽章口径一致）：

| 脚本 | 形态 | 用于 |
|------|------|------|
| `html_card.py` | 紧凑卡片 + 可展开报告 | 快速预览、批量场景的单买家卡片（`cards/`）|
| `report_html.py` | 7 段式长报告 HTML | 单买家完整交付：结论先行、背调详情、客户质量判断、风险点、跟进策略、两轮英文话术 |
| `report_md.py` | 7 段式长报告 md | 同上内容的 Markdown 版，用户要 md 文件、或需归档/二次编辑时用 |

长报告的客户质量判断（真实性/专业度/采购意愿/决策权/需求匹配/成交概率）由 `scripts/report_model.py` 按规则派生并强制带依据，**Agent 不得自行填写或改写档位与概率**；证据不足的维度脚本会输出「待确认」，不得被填满。HTML 与 md 两版均由该模块驱动，内容必须一致，不得只改一侧。

脚本已内置可见性纪律（只读 visible + web_evidence，hidden 仅用于可信度标记）。合并结果含背调结论卡片（`card.conclusion`：身份总结+推荐跟进优先级）与跟进建议&话术（`card.follow_up`，分档规则见 `references/follow-up-suggestions.md`），均由脚本自动生成，Agent 不得篡改档位基调。输出样式、链接交付、无法定位兜底见 `references/output-template.md`；异常分流见 `references/error-handling.md`。

> **批量场景必须落盘 merged JSON**：每个买家跑完 `card_renderer.py` 后，必须把输出 JSON（含 `card`、`report_markdown`、`renderable` 字段）保存到 `merged/<index>_<buyer_key>.json`。`batch_summary_html.py` 依赖 `merged/*.json` 生成汇总 HTML；若 `merged/` 为空或字段缺失，脚本会回退读取 `step2/*.json` + `step3/*.json` 现场生成，但仍建议主动落盘 merged 以保数据完整。

### 可信度三档（措辞委婉，不要满屏"存疑"）

可信度**综合 MCP 置信度 + 公网证据强度取高者**，不因"没命中平台"就一律降级：

| 标记 | 含义 | 触发 |
|---|---|---|
| ✅ 已验证 | 证据充分可信 | 平台多源互证 or 公网强证据（工商/官网/社媒齐全 or VERIFIED_*） |
| 🟡 基本可信 | 有一定证据，可正常合作 | 公网有部分证据 or MCP 单源佐证 |
| ❓ 信息有限 | 公开信息不足，非负面评价 | 公网证据很弱且无平台数据 |

- **多数买家关联不到平台是常态**，只要公网证据够，就给 ✅/🟡，不要动辄 ❓。
- ❓用"信息有限"而非"存疑"，避免给买家贴负面标签。脚本已实现，你**直接用 `card.credibility` 的值**，不要自己改判。

**买家无法定位时不要出 HTML**：D 级 / `need_clarification` / judge_label=UNDETERMINED 时卡片全是"未知"：
- `html_card.py` 输出 `SKIP_HTML: ...` 且**不生成文件**→ 你**只回文字结论 + 澄清引导**，不给 HTML 链接。
- `card_renderer.py` 返回值含 `renderable`：`false` 跳过 HTML。确需强制才加 `--force`。
- `report_html.py` / `report_md.py` 遵循同一口径；加 `--force` 强制出报告时，判断矩阵会整体降级为「待确认」、第二轮英文话术整段省略。

**但“核验未跑完”与“查了查不到”必须分开处理**（否则四级降级一个文件也交不出去）：
- 平台错误 / 子 Agent 超时 / 权限中断 / 工具不可用（`verification_incomplete=true`）——**我们没查完**，`card_renderer.py` 自动放行兜底渲染（返回值 `render_fallback=true`），你**必须照正常流程出 HTML 并 present_files 交付**，不得以“信息不足”为由只回一段文字。产物会自动标注核验未完成、六维全“待确认”、不出画像、徽章保持中性色，并给出需补充哪些线索；正文同时说明本轮未完成核验、建议补充信息后重跑。
- 真的跑完了搜索但定位不到主体（`no_search_result`，`verification_incomplete=false`）——保持上方口径，不出 HTML，只回文字结论 + 澄清引导。

**冲突处理**（脚本已实现）：OVERTURN→采用 judge 身份并注"经平台数据校准修正"；AGREE/PARTIAL_AGREE→保持公网原始身份字段；UNDETERMINED→标"信息有限"。

---

## 批量背调（3 个以上买家）

批量背调按 `references/batch-bgcheck.md` 执行：

1. **跑前确认范围**：超过 3 个买家先确认全部背调、只背调前几个，或只出汇总不逐个出卡片；若用户明确要求全部自动跑，可跳过跑前范围确认。
2. **大批量积分/资源确认**：超过 20 个买家属于大批量任务，必须先说明逐个公网检索与平台校准会消耗较多积分/资源，并获得用户二次确认后才能执行，不可跳过。
3. **运行目录与落盘**：统一写入 `bgcheck_runs/<run_id>/`，包含 `manifest.json`、`step2/`、`step3/`、`merged/`、`cards/`、`reports/`、`batches/`（每批 20 个买家的独立汇总）、`summary.md`、`summary.html`、`summary.xlsx`、`summary.csv`。每个买家 Step2/WebSearch 结果、Step4 合并结果和 `manifest.json` 状态必须随完成随写，至少每 20 个或更少买家刷新一次阶段汇总，避免长任务中断丢数据。
4. **批次 checkpoint 与并行边界**：一次批量任务每完成 20 个买家必须暂停，**先执行批次交付四步**（①生成该批次 `batches/batch_<N>_summary.html`（必须 `--layout cards` 卡片布局）+`.md`+`.xlsx`（`batch_summary_excel.py`，同时自动产出 `.csv`） ②`verify_batch_html.py` 校验 + Agent 语义抽查 ③present_files 呈现 ④正文给可点击链接+阶段摘要），再确认检索深度、输出格式、风险口径是否符合预期，确认后才继续下一批；默认并行 2 个子 Agent，超过 20 个买家可适当提至 4 个，用户明确要求更多时最多 6（封顶）；允许当前 20 个窗口内并行提效，但不得提前启动、排队或后台运行下一批买家。连续运行约 30 分钟需主动同步进度和已落盘结果，约 60 分钟必须暂停确认。
5. **追溯记录**：`manifest.json` 记录每个买家的输入、状态、产物路径和跳过原因，用于记录检索推理步骤支撑结论追溯；该文件默认内部可见。
6. **全量交付确认**：所有批次跑完后，生成全量 `summary.md` + `summary.html`（必须 `--layout cards` 卡片布局）+ `summary.xlsx`（`batch_summary_excel.py`，同时自动产出 `summary.csv`）；若结果 > 10 条，先汇总完成情况，再请用户确认最终交付格式（只要汇总 / +HTML卡片 / +Markdown报告 / 主界面全部展示）。全量交付同样必须执行交付四步（生成+校验 + present_files + 可点击链接）。
7. **默认交付**：用户无特别偏好时，主界面展示前 5 条摘要，落地 `summary.md` + `summary.html`（必须 `--layout cards` 卡片布局）+ `summary.xlsx` + `summary.csv`，可定位买家生成 HTML，信息有限买家只进汇总。

---

## 快速自测（装好 skill 后可先跑一遍确认环境 OK）

```bash
SKILL_DIR="<本SKILL.md所在目录>"
python3 "$SKILL_DIR/scripts/test_pipeline.py"        # 期望 ALL PASS
python3 "$SKILL_DIR/scripts/html_card.py" --gallery -o /tmp/gallery.html  # 6 场景卡片预览
python3 "$SKILL_DIR/scripts/report_html.py" --demo -o /tmp/bgreport.html  # 7 段式长报告预览
python3 "$SKILL_DIR/scripts/report_md.py" --demo -o /tmp/bgreport.md      # 7 段式长报告 md 预览
python3 "$SKILL_DIR/scripts/batch_summary_html.py" --demo -o /tmp/batch_summary.html  # 批量汇总 HTML 预览，会自动检查链接与展开区
python3 "$SKILL_DIR/scripts/batch_summary_excel.py" --demo -o /tmp/batch_summary.xlsx  # 批量 Excel/CSV 预览
python3 "$SKILL_DIR/scripts/html_interaction_check.py" /tmp/batch_summary.html  # 可单独复查 HTML 交互有效性
```

## 输出与展示（HTML 文件 + 侧边预览）

**交付四步必须（批量 checkpoint 和全量交付都适用，不得跳过）**：
1. **生成并交互检查** — 生成 `summary.html` 或 `batches/batch_<N>_summary.html`（**必须 `--layout cards` 卡片布局**，不得使用表格布局），运行 `html_interaction_check.py` 检查；未通过不交付。
2. **Agent 校验** — 运行 `verify_batch_html.py` 做结构校验（空字段、买家数匹配、数据流断裂），并抽查 2–3 个买家对比 HTML 与 Markdown 报告是否一致；发现问题必须修复后重新生成，秒级完成。
   ```bash
   python3 "$SKILL_DIR/scripts/verify_batch_html.py" "$RUN_DIR/summary.html" --run-dir "$RUN_DIR"
   ```
3. **验证文件存在 + present_files 交付** — 交付前必须确认文件在绝对路径下真实存在（用 `ls -la <绝对路径>` 或 Python `os.path.exists()` 检查），确认存在后再用 `present_files` 交付；**必须使用绝对路径**，不得使用相对路径。
4. **正文给可点击链接** — 链接必须使用**绝对路径**；不得只输出“文件已保存到某目录”的文字说明。**每个文件名必须是带绝对路径的 Markdown 链接，不得只写文件名**。

   > **对话正文"交付文件"输出模板（必须遵守，禁止只写文件名）**：
   > ```text
   > 📄 交付文件：
   > [batch_1_summary.html](/Users/xxx/bgcheck_runs/xxx/batches/batch_1_summary.html) — HTML汇总报告（可展开卡片）
   > [batch_1_summary.xlsx](/Users/xxx/bgcheck_runs/xxx/batches/batch_1_summary.xlsx) — Excel数据表（一买家一行，可持续追加）
   > [batch_1_summary.csv](/Users/xxx/bgcheck_runs/xxx/batches/batch_1_summary.csv) — CSV数据表（可筛选排序）
   > [batch_1_summary.md](/Users/xxx/bgcheck_runs/xxx/batches/batch_1_summary.md) — Markdown详细报告
   > ```
   > 路径必须为当前系统的绝对路径。

> **路径硬约束（致命规则）**：present_files 和正文链接必须使用绝对路径；交付前必须验证文件在该路径下真实存在。违反此规则会导致用户点击后报"文件不存在"，属于致命问题。不得通过复制文件到其他目录来"修复"路径问题——应直接使用文件所在的绝对路径。
>
> **⬇ 交付前最终检查（每次交付都必须逐条核对，不通过不得交付）**：
> 1. 正文中的交付文件清单是否使用了 `[文件名](绝对路径)` 的 Markdown 链接格式？
> 2. 链接中的文件是否确实存在于该路径（已用 `ls` 或 `os.path.exists()` 验证）？
> 3. 是否有任意一个文件只写了文件名而没有链接？（如有则必须补全为 Markdown 链接）
> 4. `present_files` 是否已用绝对路径呈现同一批文件？
>
> 如果以上任何一条不通过，必须在交付前修正。

> 冲突优先级：若 HTML 与 Markdown 报告内容冲突，以 Markdown 报告为准，重新生成 HTML。

其他交付要求：
1. **用 `present_files` 交付 HTML**——这是让文件出现在对话侧边 Outputs 区、可点击/预览的标准方式。单个买家交付该买家 HTML；批量默认交付 `summary.html`，需要逐个卡片时再追加 `cards/`。**present_files 参数必须传绝对路径**。
2. 单个买家正文可给一句可点击的绝对路径链接，例如：`完整报告：[ACME背调卡片](/Users/xxx/bgcheck_out/20260704/ACME.html)`；批量汇总页优先在同一 HTML 内用展开区展示基础背调信息，不依赖跳转链接。
3. **交互检查**：`html_card.py` 与 `batch_summary_html.py` 生成文件后默认运行 `html_interaction_check.py`，检查 HTML 中的链接、按钮和展开区；不得交付空链接、失效本地链接、空按钮或无内容展开区。
4. **Agent 交付前复核**：脚本检查通过后，Agent 还必须快速浏览最终 HTML，确认页面可读、基础信息完整、无内部术语，并核对输出中的公司名、国家、Buyer ID、邮箱域名、官网等可核对信息是否与需求确认/输入线索一致。
5. **小概率回溯**：如发现主体混淆、公司名不一致、国家/官网/邮箱域明显不匹配等疑似问题，先花 5–10 秒回溯 `manifest.json`、`step2/`、`merged/` 等过程记录，确认准确结论后再交付或说明需要用户补充确认。
6. **侧边展示**：present_files 呈现的文件即在对话侧栏 Outputs 显示，用户点击可预览 HTML 卡片。HTML 已内置样式、可独立打开，无需外部依赖。
7. 无法定位的买家（SKIP_HTML）不给链接，只在正文写文字结论。
8. **Markdown 汇总报告中不得放卡片跳转链接**（如 `[查看](cards/xxx.html)`）；Markdown 文件中的本地链接在对话界面中无法解析，放了也无法点击。卡片状态用纯文字标识（“已生成”/“未生成”）。
9. **Markdown 汇总报告中的交付文件清单（如 HTML 汇总、CSV、cards/ 目录等）也不得做成 Markdown 链接**（如 `[summary.html](summary.html)`），用纯文本路径展示。可点击的绝对路径链接只在对话回复正文中给出，两处用途不同，不要求一致。

> 注：不要把 HTML 全文贴进对话；只给链接 + present_files。文字回复里给结构化要点（身份/风险/可信度/建议）即可。

## 输出语气
面向卖家，简洁、决策导向；风险等级和建议明确；不暴露内部机制——任何用户可见输出（对话回复正文、Markdown 摘要、HTML）均禁止出现 `AI Judge`、`judge_label`、`AGREE`、`PARTIAL_AGREE`、`OVERTURN`、`UNDETERMINED`、`ai_reasoning`、`ODPS`、`MCP`、`workctl`、`bgcheck_judge` 等内部术语。
可信度用"信息有限"这类中性措辞，不用"存疑/可疑"等负面词。

## 参考文件（同目录）
- `slot-schema.json` — 输入槽位定义（公司名/邮箱/官网/Alibaba链接/buyer_id/辅助识别信息/批量线索等）
- `MCP_SPEC.md` — Judge MCP 完整接口规范（入参/双桶出参/三表落库/降级）
- `references/trigger-routing.md` — 非阻塞触发路由与 7 类常见请求快速映射
- `references/anchor-standardize.md` — 锚点提取、输入分级与追问规则
- `references/web-search-strategy.md` — 公网搜索策略、证据采信与合规边界
- `references/background-fields.md` — Step2 字段契约、身份枚举与证据留痕
- `references/output-template.md` — 卡片、报告、HTML 链接与输出话术
- `references/error-handling.md` — 错误处理与降级策略
- `references/batch-bgcheck.md` — 批量背调、汇总文件与交付前确认
- `samples/` — 6 场景样例输入输出 + 卡片预览 HTML
