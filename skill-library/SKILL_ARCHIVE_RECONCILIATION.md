# Skill 归档入口核对

- 核对时间：2026-09-25T12:21:36+08:00
- 对照清单：`skill_inventory_enriched.json`
- Excel/JSON 记录数：12871
- 可读的标准目录型入口：10137
- 可读 Markdown 文件型资产镜像为 `SKILL.md`：7
- 文件型 JSONL 资产生成 `SKILL.md` 说明入口：1133
- 不透明 Markdown 资产生成 `SKILL.md` 说明入口：1349
- 不透明标准目录型入口生成 `SKILL.md` 说明入口：245
- 缺失入口：0

## 完整性结论

`skills/<skill_id>/SKILL.md` 现已覆盖清单中全部 12871 条记录，并可通过 `skill_archive_manifest.csv` 或 `skill_archive_manifest.json` 回查原始来源和归档位置。

## 口径边界

- 可读 Markdown 文件型资产：`SKILL.md` 是同目录归档 Markdown 的副本。
- JSONL 文件型资产：`SKILL.md` 是基于清单字段生成的可读入口，原始 JSONL 文件保留在同目录；它不被伪装成标准 Skill 规范。
- 不透明 Markdown 文件型资产：同样保留原始文件，但 `SKILL.md` 只提供清单级入口，不声称原始内容可读。
- 不透明标准目录型入口：原始字节移动为同目录 `SOURCE_SKILL.md`，`SKILL.md` 改为明确的待复核入口，以避免二进制伪装为可读技能说明。
- 本操作不修改任何 `/Users/lute` 或 iCloud 的原始来源，不改变当前 Codex 可用性、竞聘状态或业务授权。
