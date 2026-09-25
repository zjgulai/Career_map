# Skill 资产库方案与执行 TODO

## MECE 扫描边界

- 扫描根目录：`/Users/lute` 与 `/Users/lute/Library/Mobile Documents/com~apple~CloudDocs`。
- 收录对象 A：所有可读的 `SKILL.md` / `skill.md` 标准入口文件；一个入口文件对应一个目录型 skill 记录。
- 收录对象 B：`/Users/lute/Library/Mobile Documents/com~apple~CloudDocs/paper_to_skills` 下所有文件名以 `Skill-` 开头的 `.md/.json/.jsonl/.yml/.yaml` 文件；一个文件对应一个文件型 skill 记录。
- 不收录对象：`scripts/`、`examples/`、`templates/`、`assets/`、普通 README、日志、缓存、`.env`、密钥、会话文件；这些不会作为独立 skill。
- 去重方式：按解析后的绝对路径去重；同名不同路径不合并。
- 来源分类：iCloud paper file skill、iCloud standard skill、Codex system、本地 user skill、本地 agent skill、bundled plugin、remote plugin、primary runtime、project skill、home skill。它描述广域扫描中的来源位置；当前 Codex 可用性另由运行时台账判断，不能混为同一分类。

## 字段抽取规则

- 英文名称：frontmatter `name/title/id` > 一级标题 > 父目录名。
- 中文名称：frontmatter 中文字段 > 一级标题中文片段 > `待补：英文名称`。
- 一句话作用：frontmatter `description/summary` > 首个正文段落。
- 关键输入：`Inputs/Prerequisites/Parameters/Before you start/When to use` 等小节。
- 关键输出：`Outputs/Deliverables/Artifacts/Returns/Validation` 等小节；缺失时标记为过程辅助。
- 最新更新时间：frontmatter 日期 > 文件 mtime，并在 Excel 的扩展列记录日期来源。
- 业务场景：受控场景词表按路径、名称、说明和标签匹配，保证每条记录只有一个主场景。
- 解决具体问题：基于使用场景、一句话作用和输出字段生成短句，不外推原文未声明能力。

## 执行 TODO

- [x] 读取 Sites building 工作流，按本地静态网站实现。
- [x] 明确 MECE 扫描边界与字段抽取规则。
- [x] 对 Home 与 iCloud 两个根目录执行索引和文件系统扫描。
- [x] 对技能入口文件去重、抽取字段、复制脱敏归档。
- [x] 输出 Excel 表格与 CSV/JSON 备用数据。
- [x] 生成本地检索网站，支持搜索和筛选。

## 统一 Skill 归档入口

- [x] 以 `skill_inventory_enriched.json` 的 `skill_id` 为准，核对每条记录均有唯一 `skills/<skill_id>/` 子文件夹。
- [x] 为全部 12,871 条归档记录补齐可读 `SKILL.md`：保留 10,137 个可读标准目录型入口；对 245 个不可读标准入口保留 `SOURCE_SKILL.md` 原始字节并生成待复核入口；可读 Markdown 镜像为入口；JSONL 与不透明 Markdown 保留原始文件并生成可读说明入口。
- [x] 生成 `skill_archive_manifest.csv` / `skill_archive_manifest.json` 和 `SKILL_ARCHIVE_RECONCILIATION.md`，可从 Excel 记录回查到归档目录、`SKILL.md` 与原始来源。
- [x] 对不可稳定解读的历史文件标为“待复核技能线索”，不把乱码、过程日志或文件名推断冒充为业务用途、当前 Codex 可用性或竞聘结论。
- [x] 将全部归档子文件夹统一为“编号-核心功能”，移除不可读原始名和哈希后缀；保留 `skill_id` 映射、原目录回查、网站归档链接和当前 Codex 台账路径。
- [ ] 后续在 Excel 基础上按业务价值、问题类型做二次聚类。

## 当前 Codex 运行时增量校准

- [x] 以当前 Codex system、全局用户、全局 Agent、primary runtime、bundled plugin 与 remote plugin 根目录为准，建立独立运行时台账。
- [x] 将当前入口、历史归档、当前内容指纹、来源层、插件版本和替代入口分开记录；当前可用不等于业务竞聘通过。
- [x] 补入当前新增入口并为每项建立归档子文件夹；旧插件入口保留历史记录，标明当前替代版本，不删除来源资产。
- [x] 将运行时字段写入原始清单、增强清单、三宝复核矩阵、能力竞聘矩阵和当前 Codex 专用 Excel。
- [x] 在多页展厅加入“当前 Codex”页面及全局状态筛选；新纳入或内容更新 Skill 均保持待业务复核，不自动获得竞聘、Preset、数字员工或业务授权。

## 当前 Codex 第一轮业务初筛

- [x] 对 43 个“当前可用、新纳入待业务复核”的 Skill 逐项回读当前 `SKILL.md`，不按名称或来源层推断用途。
- [x] 用互斥且完整的四类去向分流：进入业务验证设计、先作为能力供给试验、保留为工程运行支撑、暂不进入当前三宝竞聘。
- [x] 为每项补齐业务可读字段：三宝位置、最小业务问题、关键输入、可验收输出、受控验证建议、验收要点、边界和下一道门槛。
- [x] 输出独立初筛 JSON/CSV/报告/Excel，并在多页展厅加入“Codex 初筛”页；原有能力竞聘准备度不被改写。
- [ ] 由业务方从 8 个“进入业务验证设计”候选中选择一个最靠前的经营问题，确定脱敏样本、独立复核人和受控验证验收表后，再启动第一道真实能力竞聘试跑。

## CB01 · 当前 Codex 商业论证平行候选

- [x] 选择 `Product And Business Analysis` 作为 B01-C01 的平行候选；它不替代既有 `p2s-sc-whatif-scenario-analysis-engine`，也不继承后者的任何试跑或入围状态。
- [x] 用完全合成的 A/B/不行动基线准备固定任务包，覆盖客户价值、经济条件、兑现条件、风险、未知和最小验证建议；没有读取真实消费者、市场、SKU、渠道、供应链或财务数据。
- [x] 准备候选提交模板、独立复核记录、六维评分量表、角色分离要求和硬门槛；当前状态为“准备完成，待指定独立复核人，尚未启动”。
- [x] 输出 CB01 JSON/Markdown/Excel，并在多页展厅加入“CB01 试跑准备”页；不记录候选提交、评分、通过或失败结论。
- [ ] 由用户指定一名未参与任务包设计和候选提交的独立复核人，确认角色分离后，才可向候选执行人发放固定任务包并开始评分。
