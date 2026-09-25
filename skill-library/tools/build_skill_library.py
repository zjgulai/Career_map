#!/usr/bin/env python3
"""Build a local skill inventory, archive, Excel workbook, and static finder site.

The scanner treats each SKILL.md file as one skill package entry. It copies only a
redacted copy of the entry file plus metadata into the archive so the library is
useful without duplicating large plugin/resource folders or leaking credentials.
"""

from __future__ import annotations

import csv
import datetime as dt
import hashlib
import html
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import textwrap
import zipfile

try:
    import yaml
except Exception:  # pragma: no cover - the caller environment currently has PyYAML.
    yaml = None


PROJECT_ROOT = Path("/Users/lute/project/Career").resolve()
OUTPUT_ROOT = PROJECT_ROOT / "skill-library"
ARCHIVE_ROOT = OUTPUT_ROOT / "skills"
SITE_ROOT = OUTPUT_ROOT / "site"
DATA_JS = SITE_ROOT / "skill-data.js"
EXCEL_PATH = OUTPUT_ROOT / "skill_inventory.xlsx"
CSV_PATH = OUTPUT_ROOT / "skill_inventory.csv"
JSON_PATH = OUTPUT_ROOT / "skill_inventory.json"
PLAN_PATH = OUTPUT_ROOT / "PLAN_AND_TODO.md"
REPORT_PATH = OUTPUT_ROOT / "SCAN_REPORT.md"

HOME_ROOT = Path("/Users/lute").resolve()
ICLOUD_ROOT = Path("/Users/lute/Library/Mobile Documents/com~apple~CloudDocs").resolve()
SCAN_ROOTS = [HOME_ROOT, ICLOUD_ROOT]

SECRET_PATTERNS = [
    re.compile(r"(?i)(api[_-]?key|secret|token|password|passwd|pwd|authorization|cookie|refresh[_-]?token)\s*[:=]\s*['\"]?[^'\"\s`]+"),
    re.compile(r"(?is)-----BEGIN (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----.*?-----END (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----"),
    re.compile(r"(?i)(xox[baprs]-[A-Za-z0-9-]+)"),
    re.compile(r"(?i)(sk-[A-Za-z0-9_-]{12,})"),
]

SECTION_ALIASES = {
    "关键输入": [
        "inputs",
        "input",
        "prerequisites",
        "requirements",
        "arguments",
        "parameters",
        "before you start",
        "输入",
        "前置条件",
        "参数",
    ],
    "关键输出": [
        "outputs",
        "output",
        "deliverables",
        "artifacts",
        "returns",
        "result",
        "results",
        "validation",
        "acceptance criteria",
        "输出",
        "交付物",
        "结果",
        "验收",
    ],
    "使用场景": [
        "when to use",
        "use cases",
        "problem",
        "troubleshooting",
        "examples",
        "何时使用",
        "使用场景",
        "适用场景",
        "问题",
    ],
}

SCENARIOS = [
    ("研发与代码", ["code", "coding", "developer", "nextjs", "react", "swift", "cli", "repo", "github", "qodo", "test", "debug", "review", "implementation"]),
    ("产品设计与UIUX", ["figma", "ui", "ux", "design", "wireframe", "prototype", "component", "theme", "shadcn"]),
    ("数据分析与BI", ["data", "analytics", "dashboard", "kpi", "tableau", "spreadsheet", "excel", "report", "metric", "visualization", "clickhouse"]),
    ("文档与知识", ["document", "docs", "pdf", "knowledge", "latex", "template", "eli5", "registry", "memory"]),
    ("演示与内容", ["presentation", "slides", "email", "copy", "content", "resume", "braze", "hubspot", "klaviyo"]),
    ("图像/视频/创意生产", ["image", "video", "creative", "runway", "invideo", "visual", "media", "asset"]),
    ("数据库与后端服务", ["postgres", "supabase", "redis", "database", "sqlite", "backend", "api", "queue", "storage"]),
    ("网站与部署", ["sites", "website", "web", "deploy", "deployment", "hosting", "vercel", "cloudflare", "cdn"]),
    ("协作与外部工具", ["slack", "gmail", "calendar", "drive", "notion", "linear", "dropbox", "sharepoint", "teams", "connector", "mcp"]),
    ("安全与治理", ["security", "auth", "permission", "governance", "privacy", "policy", "firewall", "secret"]),
    ("本地诊断与运维", ["diagnostic", "diagnostics", "startup", "repair", "runtime", "desktop", "local", "opencode", "monitor"]),
    ("业务经营与AgenticOS", ["agenticos", "sanbao", "career", "business", "ecommerce", "brand", "voc", "shopify", "operation", "经营"]),
    ("通用规划与咨询", ["advisor", "consultation", "planning", "brainstorm", "strategy", "research", "audit"]),
]


def run_capture(args: list[str], timeout: int = 120) -> list[str]:
    try:
        proc = subprocess.run(
            args,
            check=False,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return []
    return [line.strip() for line in proc.stdout.splitlines() if line.strip()]


def collect_candidates() -> tuple[list[tuple[Path, str]], dict[str, int]]:
    raw: list[str] = []
    stats: dict[str, int] = {}

    for root in SCAN_ROOTS:
        if root.exists():
            lines = run_capture(["mdfind", "-onlyin", str(root), "kMDItemFSName == SKILL.md || kMDItemFSName == skill.md"], timeout=90)
            stats[f"mdfind:{root}"] = len(lines)
            raw.extend(lines)

    for root in SCAN_ROOTS:
        if root.exists():
            lines = run_capture(["rg", "--files", "--hidden", "--no-ignore", "-g", "SKILL.md", "-g", "skill.md", str(root)], timeout=180)
            stats[f"rg:{root}"] = len(lines)
            raw.extend(lines)

    seen: set[str] = set()
    paths: list[tuple[Path, str]] = []
    for value in raw:
        try:
            path = Path(value).expanduser().resolve()
        except Exception:
            continue
        key = str(path)
        if key in seen:
            continue
        seen.add(key)
        if not path.is_file():
            continue
        if path.name.lower() != "skill.md":
            continue
        if OUTPUT_ROOT in path.parents:
            continue
        paths.append((path, "directory_skill"))

    paper_root = ICLOUD_ROOT / "paper_to_skills"
    if paper_root.exists():
        paper_lines = run_capture(
            [
                "find",
                str(paper_root),
                "-type",
                "f",
                "(",
                "-name",
                "Skill-*.md",
                "-o",
                "-name",
                "Skill-*.json",
                "-o",
                "-name",
                "Skill-*.jsonl",
                "-o",
                "-name",
                "Skill-*.yaml",
                "-o",
                "-name",
                "Skill-*.yml",
                ")",
                "-print",
            ],
            timeout=180,
        )
        stats[f"paper_file_skills:{paper_root}"] = len(paper_lines)
        for value in paper_lines:
            try:
                path = Path(value).expanduser().resolve()
            except Exception:
                continue
            key = str(path)
            if key in seen or not path.is_file():
                continue
            seen.add(key)
            paths.append((path, "paper_file_skill"))

    paths.sort(key=lambda item: str(item[0]).lower())
    stats["unique_valid_skill_files"] = len(paths)
    return paths, stats


def read_text(path: Path, limit: int = 512_000) -> tuple[str, bool]:
    try:
        data = path.read_bytes()
    except Exception:
        return "", False
    truncated = len(data) > limit
    text = data[:limit].decode("utf-8", errors="replace")
    return text, truncated


def split_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n") and not text.startswith("---\r\n"):
        return {}, text
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n?", text, flags=re.S)
    if not match:
        return {}, text
    raw = match.group(1)
    body = text[match.end():]
    if yaml is None:
        return {}, body
    try:
        data = yaml.safe_load(raw) or {}
        if isinstance(data, dict):
            return data, body
    except Exception:
        pass
    return {}, body


def clean_inline(value: object, max_len: int = 240) -> str:
    if value is None:
        return ""
    if isinstance(value, (list, tuple, set)):
        value = "；".join(str(v) for v in value)
    if isinstance(value, dict):
        value = "；".join(f"{k}: {v}" for k, v in value.items())
    text = str(value)
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[*_>#|]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = redact(text)
    if len(text) > max_len:
        return text[: max_len - 1].rstrip() + "…"
    return text


def redact(text: str) -> str:
    redacted = text
    for pattern in SECRET_PATTERNS:
        redacted = pattern.sub(lambda m: re.sub(r"(?<=[:=]).*", " [REDACTED]", m.group(0)) if len(m.groups()) != 1 else "[REDACTED]", redacted)
    return redacted


def first_heading(body: str) -> str:
    match = re.search(r"^\s*#\s+(.+?)\s*$", body, flags=re.M)
    return clean_inline(match.group(1), 140) if match else ""


def first_paragraph(body: str) -> str:
    lines: list[str] = []
    in_code = False
    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code = not in_code
            continue
        if in_code or not stripped:
            if lines:
                break
            continue
        if stripped.startswith("#") or stripped.startswith("---"):
            continue
        if stripped.startswith(("<!--", "[//]:")):
            continue
        lines.append(stripped)
        if len(" ".join(lines)) > 240:
            break
    return clean_inline(" ".join(lines), 220)


def extract_section(body: str, aliases: list[str], max_len: int = 260) -> str:
    headings = list(re.finditer(r"^(#{1,4})\s+(.+?)\s*$", body, flags=re.M))
    for idx, match in enumerate(headings):
        title = clean_inline(match.group(2), 120).lower()
        if any(alias in title for alias in aliases):
            start = match.end()
            end = headings[idx + 1].start() if idx + 1 < len(headings) else len(body)
            section = body[start:end].strip()
            lines: list[str] = []
            in_code = False
            for line in section.splitlines():
                stripped = line.strip()
                if stripped.startswith("```"):
                    in_code = not in_code
                    continue
                if in_code or not stripped:
                    continue
                if stripped.startswith("#"):
                    break
                lines.append(stripped)
                if len(" ".join(lines)) > max_len:
                    break
            return clean_inline(" ".join(lines), max_len)
    return ""


def canonical_english_name(frontmatter: dict, body: str, path: Path) -> str:
    for key in ("name", "title", "id"):
        if key in frontmatter and clean_inline(frontmatter[key], 120):
            return clean_inline(frontmatter[key], 120)
    heading = first_heading(body)
    if heading:
        english = re.sub(r"[\u4e00-\u9fff]+", " ", heading)
        english = clean_inline(english, 120)
        if english:
            return english
    parent = path.parent.name
    grand = path.parent.parent.name if path.parent.parent else ""
    if grand and grand not in ("skills", "cache", "openai-curated-remote", "openai-bundled", "openai-primary-runtime"):
        return f"{grand}:{parent}"
    return parent


def paper_file_name(path: Path) -> str:
    return re.sub(r"\.(md|json|jsonl|yaml|yml)$", "", path.name, flags=re.I)


def jsonl_summary(text: str) -> dict:
    summary: dict[str, object] = {}
    first_line = next((line for line in text.splitlines() if line.strip()), "")
    if not first_line:
        return summary
    try:
        data = json.loads(first_line)
    except Exception:
        return summary
    if isinstance(data, dict):
        summary = data
    return summary


def chinese_name(frontmatter: dict, body: str, english_name: str) -> tuple[str, bool]:
    for key in ("zh_name", "cn_name", "display_name_zh", "中文名称"):
        if key in frontmatter and clean_inline(frontmatter[key], 120):
            return clean_inline(frontmatter[key], 120), False
    heading = first_heading(body)
    zh = "".join(re.findall(r"[\u4e00-\u9fff][\u4e00-\u9fffA-Za-z0-9·：:（）() _-]*", heading))
    if zh:
        return clean_inline(zh, 120), False
    return f"待补：{english_name}", True


def latest_time(frontmatter: dict, path: Path) -> tuple[str, str]:
    for key in ("updated_at", "last_updated", "updated", "date"):
        value = frontmatter.get(key)
        if value:
            return clean_inline(value, 40), f"frontmatter.{key}"
    try:
        ts = path.stat().st_mtime
        return dt.datetime.fromtimestamp(ts).astimezone().isoformat(timespec="seconds"), "file_mtime"
    except Exception:
        return "", "unknown"


def source_type(path: Path) -> str:
    text = str(path)
    if "/Library/Mobile Documents/com~apple~CloudDocs/paper_to_skills/" in text and path.name.startswith("Skill-"):
        return "icloud_paper_file_skill"
    if "/Library/Mobile Documents/com~apple~CloudDocs/" in text:
        return "icloud_skill"
    if "/.codex/skills/.system/" in text:
        return "system_skill"
    if "/.codex/plugins/cache/openai-primary-runtime/" in text:
        return "primary_runtime_skill"
    if "/.codex/plugins/cache/openai-bundled/" in text:
        return "bundled_plugin_skill"
    if "/.codex/plugins/cache/openai-curated-remote/" in text:
        return "remote_plugin_skill"
    if "/.agents/skills/" in text:
        return "local_agent_skill"
    if "/.codex/skills/" in text:
        return "local_user_skill"
    if "/project/" in text or "/Desktop/" in text:
        return "project_skill"
    return "home_skill"


def scope_label(path: Path) -> str:
    if ICLOUD_ROOT in path.parents:
        return "iCloud Drive"
    return "Home"


def scenario_for(record_text: str, frontmatter: dict) -> str:
    for key in ("scenario", "domain", "category"):
        value = frontmatter.get(key)
        if value:
            return clean_inline(value, 80)
    tags = frontmatter.get("tags")
    if tags:
        tag_text = clean_inline(tags, 160).lower()
        for scenario, keywords in SCENARIOS:
            if any(keyword in tag_text for keyword in keywords):
                return scenario
    lower = record_text.lower()
    scores = []
    for scenario, keywords in SCENARIOS:
        score = sum(1 for keyword in keywords if keyword in lower)
        if score:
            scores.append((score, scenario))
    if scores:
        scores.sort(key=lambda item: (-item[0], item[1]))
        return scores[0][1]
    return "其他待归类"


def problem_statement(description: str, use_case: str, output: str) -> str:
    base = use_case or description
    if not base:
        return "当需要调用该技能处理特定任务时，用它按技能说明完成相应操作。"
    if output and output != "过程辅助，无固定交付物":
        return clean_inline(f"当需要{base}时，用它产出或更新：{output}", 260)
    return clean_inline(f"当需要{base}时，用它完成对应判断、生成或操作流程。", 260)


def safe_slug(value: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-._").lower()
    return slug[:80] or "skill"


def completeness(row: dict) -> int:
    required = ["英文名称", "一句话作用", "关键输入", "关键输出", "业务场景", "解决具体问题"]
    score = sum(1 for key in required if row.get(key) and not str(row[key]).startswith("待补"))
    return round(score * 100 / len(required))


def row_for_path(path: Path, ordinal: int, entry_type: str) -> dict:
    text, truncated = read_text(path)
    frontmatter, body = split_frontmatter(text)
    json_summary = jsonl_summary(text) if path.suffix.lower() == ".jsonl" else {}
    if entry_type == "paper_file_skill":
        english_name = clean_inline(frontmatter.get("name") or json_summary.get("name") or paper_file_name(path), 140)
    else:
        english_name = canonical_english_name(frontmatter, body, path)
    zh_name, zh_needs_review = chinese_name(frontmatter, body, english_name)
    if entry_type == "paper_file_skill" and zh_needs_review:
        zh_name = f"待补：{english_name.replace('Skill-', '').replace('-', ' ')}"
    description = clean_inline(
        frontmatter.get("description")
        or frontmatter.get("summary")
        or json_summary.get("description")
        or json_summary.get("summary")
        or "",
        220,
    )
    if not description:
        description = first_paragraph(body)
    if not description and entry_type == "paper_file_skill":
        description = clean_inline(f"来自 paper_to_skills 的文件型技能资产：{english_name.replace('Skill-', '').replace('-', ' ')}", 220)
    if not description:
        description = "待补：原文未提供明确一句话作用"
    key_input = extract_section(body, SECTION_ALIASES["关键输入"])
    if not key_input:
        key_input = extract_section(body, SECTION_ALIASES["使用场景"], 220)
    if not key_input and entry_type == "paper_file_skill":
        parent_parts = [part for part in path.parts if part not in ("/", "Users", "lute")]
        key_input = clean_inline(f"论文/研究主题文件；来源位置：{' / '.join(parent_parts[-4:-1])}", 260)
    if not key_input:
        key_input = "待补：原文未明确关键输入"
    key_output = extract_section(body, SECTION_ALIASES["关键输出"])
    if not key_output:
        key_output = "过程辅助，无固定交付物"
    latest, date_source = latest_time(frontmatter, path)
    record_text = " ".join([str(path), english_name, zh_name, description, key_input, key_output, text[:8000]])
    scenario = scenario_for(record_text, frontmatter)
    use_case = extract_section(body, SECTION_ALIASES["使用场景"], 220)
    problem = problem_statement(description, use_case, key_output)
    content_hash = hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest() if text else ""
    unique_seed = f"{source_type(path)}|{path.parent}|{english_name}"
    skill_id = f"{ordinal:05d}-{safe_slug(english_name)}-{hashlib.sha1(unique_seed.encode()).hexdigest()[:8]}"
    row = {
        "英文名称": english_name,
        "中文名称": zh_name,
        "一句话作用": description,
        "关键输入": key_input,
        "关键输出": key_output,
        "最新更新时间": latest,
        "业务场景": scenario,
        "解决具体问题": problem,
        "skill_id": skill_id,
        "source_type": source_type(path),
        "entry_type": entry_type,
        "scan_scope": scope_label(path),
        "source_path": str(path),
        "relative_path": relative_display(path),
        "date_source": date_source,
        "content_hash": content_hash,
        "needs_review": zh_needs_review or "待补" in " ".join([description, key_input]),
        "field_completeness": 0,
        "truncated_read": truncated,
        "redaction_status": "included_redacted" if any(p.search(text) for p in SECRET_PATTERNS) else "included",
    }
    row["field_completeness"] = completeness(row)
    return row


def relative_display(path: Path) -> str:
    for root in (ICLOUD_ROOT, HOME_ROOT):
        try:
            return f"{root.name}/{path.relative_to(root)}"
        except ValueError:
            pass
    return str(path)


def reset_outputs() -> None:
    ARCHIVE_ROOT.mkdir(parents=True, exist_ok=True)
    SITE_ROOT.mkdir(parents=True, exist_ok=True)
    for child in ARCHIVE_ROOT.iterdir():
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


def archive_skill(row: dict) -> None:
    folder = ARCHIVE_ROOT / row["skill_id"]
    folder.mkdir(parents=True, exist_ok=True)
    source = Path(row["source_path"])
    text, _ = read_text(source, limit=1_000_000)
    redacted = redact(text)
    target_name = "SKILL.md" if row.get("entry_type") == "directory_skill" else Path(row["source_path"]).name
    (folder / target_name).write_text(redacted, encoding="utf-8")
    (folder / "metadata.json").write_text(json.dumps(row, ensure_ascii=False, indent=2), encoding="utf-8")


def write_csv(rows: list[dict]) -> None:
    fields = [
        "英文名称", "中文名称", "一句话作用", "关键输入", "关键输出", "最新更新时间", "业务场景", "解决具体问题",
        "当前Codex状态", "Codex运行时范围", "Codex来源层", "Codex分发来源", "Codex版本", "运行时核验时间",
        "当前内容哈希", "替代入口路径", "运行时业务提示",
    ]
    with CSV_PATH.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def excel_col_name(index: int) -> str:
    name = ""
    while index:
        index, rem = divmod(index - 1, 26)
        name = chr(65 + rem) + name
    return name


def inline_cell(value: object, row: int, col: int) -> str:
    ref = f"{excel_col_name(col)}{row}"
    text = html.escape(str(value or ""), quote=False)
    return f'<c r="{ref}" t="inlineStr"><is><t xml:space="preserve">{text}</t></is></c>'


def write_xlsx(rows: list[dict], stats: dict[str, int]) -> None:
    columns = ["英文名称", "中文名称", "一句话作用", "关键输入", "关键输出", "最新更新时间", "业务场景", "解决具体问题"]
    all_columns = columns + [
        "当前Codex状态", "Codex运行时范围", "Codex来源层", "Codex分发来源", "Codex版本", "运行时核验时间",
        "当前内容哈希", "替代入口路径", "运行时业务提示", "skill_id", "source_type", "entry_type", "scan_scope",
        "relative_path", "date_source", "needs_review", "field_completeness", "redaction_status",
    ]

    def sheet_xml(sheet_rows: list[list[object]], widths: list[int]) -> str:
        body = []
        for r_idx, values in enumerate(sheet_rows, start=1):
            cells = "".join(inline_cell(value, r_idx, c_idx) for c_idx, value in enumerate(values, start=1))
            body.append(f'<row r="{r_idx}">{cells}</row>')
        cols = "".join(f'<col min="{i}" max="{i}" width="{width}" customWidth="1"/>' for i, width in enumerate(widths, start=1))
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            f"<cols>{cols}</cols><sheetData>{''.join(body)}</sheetData>"
            f'<autoFilter ref="A1:{excel_col_name(len(widths))}{max(1, len(sheet_rows))}"/>'
            "</worksheet>"
        )

    inventory_rows = [all_columns] + [[row.get(col, "") for col in all_columns] for row in rows]
    report_rows = [
        ["项目", "值"],
        ["生成时间", dt.datetime.now().astimezone().isoformat(timespec="seconds")],
        ["唯一技能文件数", len(rows)],
        ["扫描根目录", "；".join(str(root) for root in SCAN_ROOTS)],
        ["说明", "最新更新时间优先 frontmatter，否则使用文件 mtime；插件缓存 mtime 可能代表安装或同步时间。"],
    ]
    for key, value in stats.items():
        report_rows.append([key, value])

    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""
    workbook = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="技能清单" sheetId="1" r:id="rId1"/>
<sheet name="扫描说明" sheetId="2" r:id="rId2"/>
</sheets>
</workbook>"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""
    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><name val="Arial"/></font></fonts>
<fills count="1"><fill><patternFill patternType="none"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>"""
    now = dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    core = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>Skill Inventory</dc:title><dc:creator>Codex</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
<Application>Codex</Application></Properties>"""

    with zipfile.ZipFile(EXCEL_PATH, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        z.writestr("xl/styles.xml", styles)
        z.writestr("xl/worksheets/sheet1.xml", sheet_xml(inventory_rows, [22, 24, 42, 42, 42, 24, 22, 52] + [24] * (len(all_columns) - 8)))
        z.writestr("xl/worksheets/sheet2.xml", sheet_xml(report_rows, [35, 120]))
        z.writestr("docProps/core.xml", core)
        z.writestr("docProps/app.xml", app)


def write_plan() -> None:
    PLAN_PATH.write_text(
        textwrap.dedent(
            f"""\
            # Skill 资产库方案与执行 TODO

            ## MECE 扫描边界

            - 扫描根目录：`{HOME_ROOT}` 与 `{ICLOUD_ROOT}`。
            - 收录对象 A：所有可读的 `SKILL.md` / `skill.md` 标准入口文件；一个入口文件对应一个目录型 skill 记录。
            - 收录对象 B：`{ICLOUD_ROOT / 'paper_to_skills'}` 下所有文件名以 `Skill-` 开头的 `.md/.json/.jsonl/.yml/.yaml` 文件；一个文件对应一个文件型 skill 记录。
            - 不收录对象：`scripts/`、`examples/`、`templates/`、`assets/`、普通 README、日志、缓存、`.env`、密钥、会话文件；这些不会作为独立 skill。
            - 去重方式：按解析后的绝对路径去重；同名不同路径不合并。
            - 来源分类：iCloud paper file skill、iCloud standard skill、Codex system、本地 user skill、本地 agent skill、bundled plugin、remote plugin、primary runtime、project skill、home skill，互斥归类。

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
            - [ ] 后续在 Excel 基础上按业务价值、问题类型做二次聚类。
            """
        ),
        encoding="utf-8",
    )


def write_report(rows: list[dict], stats: dict[str, int]) -> None:
    by_source: dict[str, int] = {}
    by_scene: dict[str, int] = {}
    for row in rows:
        by_source[row["source_type"]] = by_source.get(row["source_type"], 0) + 1
        by_scene[row["业务场景"]] = by_scene.get(row["业务场景"], 0) + 1
    REPORT_PATH.write_text(
        "# Skill 扫描报告\n\n"
        f"- 生成时间：{dt.datetime.now().astimezone().isoformat(timespec='seconds')}\n"
        f"- 唯一 skill 文件数：{len(rows)}\n"
        f"- Excel：`{EXCEL_PATH}`\n"
        f"- 本地网站：`{SITE_ROOT / 'index.html'}`\n"
        f"- 归档目录：`{ARCHIVE_ROOT}`\n\n"
        "## 扫描统计\n\n"
        + "\n".join(f"- {key}: {value}" for key, value in stats.items())
        + "\n\n## 来源分布\n\n"
        + "\n".join(f"- {key}: {value}" for key, value in sorted(by_source.items()))
        + "\n\n## 业务场景分布\n\n"
        + "\n".join(f"- {key}: {value}" for key, value in sorted(by_scene.items()))
        + "\n",
        encoding="utf-8",
    )


def write_site(rows: list[dict]) -> None:
    site_rows = []
    for row in rows:
        site_rows.append(
            {
                "英文名称": row["英文名称"],
                "中文名称": row["中文名称"],
                "一句话作用": row["一句话作用"],
                "关键输入": row["关键输入"],
                "关键输出": row["关键输出"],
                "最新更新时间": row["最新更新时间"],
                "业务场景": row["业务场景"],
                "解决具体问题": row["解决具体问题"],
                "skill_id": row["skill_id"],
                "source_type": row["source_type"],
                "entry_type": row["entry_type"],
                "scan_scope": row["scan_scope"],
                "relative_path": row["relative_path"],
                "needs_review": row["needs_review"],
                "field_completeness": row["field_completeness"],
                "redaction_status": row["redaction_status"],
                "archive_path": f"../skills/{row['skill_id']}/" + ("SKILL.md" if row.get("entry_type") == "directory_skill" else Path(row["source_path"]).name),
            }
        )
    DATA_JS.write_text("window.SKILL_DATA = " + json.dumps(site_rows, ensure_ascii=False) + ";\n", encoding="utf-8")

    favicon = (
        "data:image/svg+xml,"
        + re.sub(
            r"\s+",
            " ",
            html.escape(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#18202b"/><path d="M15 18h34v7H15zM15 29h25v7H15zM15 40h34v7H15z" fill="#79d2c0"/></svg>',
                quote=True,
            ),
        ).replace("#", "%23")
    )
    (SITE_ROOT / "index.html").write_text(
        textwrap.dedent(
            f"""\
            <!doctype html>
            <html lang="zh-CN">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>Skill 资产库</title>
              <meta name="description" content="本机 Skill 文件检索与问题解决索引" />
              <link rel="icon" type="image/svg+xml" href="{favicon}" />
              <link rel="stylesheet" href="./styles.css" />
            </head>
            <body>
              <main class="app">
                <header class="topbar">
                  <div>
                    <p class="eyebrow">Skill 资产库</p>
                    <h1>按问题找到可用 Skill</h1>
                  </div>
                  <div class="stats" id="stats"></div>
                </header>

                <section class="controls" aria-label="检索与筛选">
                  <label class="search">
                    <span>搜索</span>
                    <input id="q" type="search" placeholder="输入名称、场景、问题、来源..." autocomplete="off" />
                  </label>
                  <label>
                    <span>来源类型</span>
                    <select id="sourceFilter"><option value="">全部来源</option></select>
                  </label>
                  <label>
                    <span>业务场景</span>
                    <select id="scenarioFilter"><option value="">全部场景</option></select>
                  </label>
                  <label>
                    <span>本地/云盘</span>
                    <select id="scopeFilter"><option value="">全部范围</option></select>
                  </label>
                  <label>
                    <span>字段状态</span>
                    <select id="reviewFilter">
                      <option value="">全部</option>
                      <option value="ok">字段较完整</option>
                      <option value="review">需要补字段</option>
                    </select>
                  </label>
                </section>

                <section class="result-meta">
                  <span id="count"></span>
                  <a href="../skill_inventory.xlsx">打开 Excel</a>
                </section>

                <section id="results" class="grid" aria-live="polite"></section>
              </main>
              <script src="./skill-data.js"></script>
              <script src="./app.js"></script>
            </body>
            </html>
            """
        ),
        encoding="utf-8",
    )
    (SITE_ROOT / "styles.css").write_text(
        textwrap.dedent(
            """\
            :root {
              color-scheme: light dark;
              --bg: #f6f8fb;
              --panel: #ffffff;
              --text: #18202b;
              --muted: #647184;
              --line: #d9e0ea;
              --accent: #087d75;
              --accent-2: #1f4b99;
              --warn: #9a5a00;
            }
            @media (prefers-color-scheme: dark) {
              :root {
                --bg: #10141b;
                --panel: #171d26;
                --text: #edf2f7;
                --muted: #a9b5c5;
                --line: #2b3442;
                --accent: #79d2c0;
                --accent-2: #8fb8ff;
                --warn: #f3c56b;
              }
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif;
              background: var(--bg);
              color: var(--text);
              letter-spacing: 0;
            }
            .app { width: min(1440px, calc(100vw - 32px)); margin: 0 auto; padding: 28px 0 40px; }
            .topbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
            .eyebrow { margin: 0 0 6px; color: var(--accent); font-weight: 700; font-size: 14px; }
            h1 { margin: 0; font-size: clamp(28px, 4vw, 44px); line-height: 1.08; letter-spacing: 0; }
            .stats { color: var(--muted); font-size: 14px; text-align: right; }
            .controls {
              display: grid;
              grid-template-columns: minmax(260px, 1.7fr) repeat(4, minmax(150px, 1fr));
              gap: 12px;
              padding: 14px;
              background: var(--panel);
              border: 1px solid var(--line);
              border-radius: 8px;
              position: sticky;
              top: 0;
              z-index: 3;
            }
            label { display: grid; gap: 6px; color: var(--muted); font-size: 13px; }
            input, select {
              width: 100%;
              min-height: 42px;
              border: 1px solid var(--line);
              border-radius: 6px;
              padding: 0 12px;
              color: var(--text);
              background: transparent;
              font: inherit;
              font-size: 15px;
            }
            input:focus, select:focus { outline: 2px solid color-mix(in srgb, var(--accent) 42%, transparent); border-color: var(--accent); }
            .result-meta { display: flex; justify-content: space-between; align-items: center; margin: 18px 2px 12px; color: var(--muted); font-size: 14px; }
            a { color: var(--accent-2); text-decoration: none; font-weight: 650; }
            a:hover { text-decoration: underline; }
            .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
            .card {
              background: var(--panel);
              border: 1px solid var(--line);
              border-radius: 8px;
              padding: 14px;
              display: grid;
              gap: 10px;
              min-width: 0;
            }
            .card h2 { margin: 0; font-size: 17px; line-height: 1.25; letter-spacing: 0; overflow-wrap: anywhere; }
            .zh { color: var(--muted); font-size: 14px; overflow-wrap: anywhere; }
            .desc { margin: 0; line-height: 1.55; font-size: 15px; }
            .meta { display: flex; flex-wrap: wrap; gap: 6px; }
            .pill {
              border: 1px solid var(--line);
              border-radius: 999px;
              padding: 4px 8px;
              color: var(--muted);
              font-size: 12px;
              max-width: 100%;
              overflow-wrap: anywhere;
            }
            .pill.warn { color: var(--warn); }
            details { border-top: 1px solid var(--line); padding-top: 8px; }
            summary { cursor: pointer; color: var(--accent-2); font-weight: 650; font-size: 14px; }
            dl { display: grid; gap: 8px; margin: 10px 0 0; }
            dt { color: var(--muted); font-size: 12px; }
            dd { margin: 0; font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; }
            .empty { padding: 40px; text-align: center; border: 1px dashed var(--line); border-radius: 8px; color: var(--muted); grid-column: 1 / -1; background: var(--panel); }
            @media (max-width: 1100px) {
              .controls { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .search { grid-column: 1 / -1; }
              .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media (max-width: 700px) {
              .app { width: min(100vw - 20px, 680px); padding-top: 16px; }
              .topbar { display: grid; }
              .stats { text-align: left; }
              .controls { grid-template-columns: 1fr; position: static; }
              .search { grid-column: auto; }
              .grid { grid-template-columns: 1fr; }
            }
            """
        ),
        encoding="utf-8",
    )
    (SITE_ROOT / "app.js").write_text(
        textwrap.dedent(
            """\
            const data = window.SKILL_DATA || [];
            const $ = (id) => document.getElementById(id);
            const controls = ["q", "sourceFilter", "scenarioFilter", "scopeFilter", "reviewFilter"].map($);
            const collator = new Intl.Collator("zh-CN");

            function uniqueValues(key) {
              return [...new Set(data.map((item) => item[key]).filter(Boolean))].sort(collator.compare);
            }

            function fillSelect(id, key) {
              const select = $(id);
              uniqueValues(key).forEach((value) => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
              });
            }

            function textOf(item) {
              return [
                item["英文名称"], item["中文名称"], item["一句话作用"], item["业务场景"],
                item["解决具体问题"], item.source_type, item.relative_path
              ].join(" ").toLowerCase();
            }

            function score(item, q) {
              if (!q) return item.field_completeness || 0;
              const name = `${item["英文名称"]} ${item["中文名称"]}`.toLowerCase();
              if (name.includes(q)) return 400 + (item.field_completeness || 0);
              if ((item["业务场景"] || "").toLowerCase().includes(q)) return 300 + (item.field_completeness || 0);
              if ((item["解决具体问题"] || "").toLowerCase().includes(q)) return 200 + (item.field_completeness || 0);
              if (textOf(item).includes(q)) return 100 + (item.field_completeness || 0);
              return 0;
            }

            function escapeHtml(value) {
              return String(value ?? "").replace(/[&<>"']/g, (char) => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
              }[char]));
            }

            function render() {
              const q = $("q").value.trim().toLowerCase();
              const source = $("sourceFilter").value;
              const scenario = $("scenarioFilter").value;
              const scope = $("scopeFilter").value;
              const review = $("reviewFilter").value;
              const rows = data
                .map((item) => ({ item, score: score(item, q) }))
                .filter(({ item, score }) => (!q || score > 0)
                  && (!source || item.source_type === source)
                  && (!scenario || item["业务场景"] === scenario)
                  && (!scope || item.scan_scope === scope)
                  && (!review || (review === "review" ? item.needs_review : !item.needs_review)))
                .sort((a, b) => b.score - a.score || collator.compare(a.item["英文名称"], b.item["英文名称"]))
                .slice(0, 300);

              $("count").textContent = `显示 ${rows.length} 条 / 共 ${data.length} 条；为保证速度最多显示前 300 条`;
              const root = $("results");
              if (!rows.length) {
                root.innerHTML = '<div class="empty">没有匹配结果。换个关键词或放宽筛选。</div>';
                return;
              }
              root.innerHTML = rows.map(({ item }) => `
                <article class="card">
                  <div>
                    <h2>${escapeHtml(item["英文名称"])}</h2>
                    <div class="zh">${escapeHtml(item["中文名称"])}</div>
                  </div>
                  <p class="desc">${escapeHtml(item["一句话作用"])}</p>
                  <div class="meta">
                    <span class="pill">${escapeHtml(item["业务场景"])}</span>
                    <span class="pill">${escapeHtml(item.source_type)}</span>
                    <span class="pill">${escapeHtml(item.entry_type)}</span>
                    <span class="pill">${escapeHtml(item.scan_scope)}</span>
                    <span class="pill ${item.needs_review ? "warn" : ""}">完整度 ${escapeHtml(item.field_completeness)}%</span>
                  </div>
                  <details>
                    <summary>查看输入、输出与问题</summary>
                    <dl>
                      <dt>关键输入</dt><dd>${escapeHtml(item["关键输入"])}</dd>
                      <dt>关键输出</dt><dd>${escapeHtml(item["关键输出"])}</dd>
                      <dt>解决具体问题</dt><dd>${escapeHtml(item["解决具体问题"])}</dd>
                      <dt>更新时间</dt><dd>${escapeHtml(item["最新更新时间"])}</dd>
                      <dt>路径</dt><dd>${escapeHtml(item.relative_path)}</dd>
                      <dt>归档</dt><dd><a href="${encodeURI(item.archive_path)}">打开归档 SKILL.md</a></dd>
                    </dl>
                  </details>
                </article>
              `).join("");
            }

            fillSelect("sourceFilter", "source_type");
            fillSelect("scenarioFilter", "业务场景");
            fillSelect("scopeFilter", "scan_scope");
            $("stats").textContent = `${data.length} 个 skill · ${uniqueValues("业务场景").length} 个场景`;
            controls.forEach((control) => control.addEventListener("input", render));
            render();
            """
        ),
        encoding="utf-8",
    )


def main() -> int:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    reset_outputs()
    write_plan()
    paths, stats = collect_candidates()
    rows: list[dict] = []
    for idx, (path, entry_type) in enumerate(paths, start=1):
        try:
            row = row_for_path(path, idx, entry_type)
            rows.append(row)
            archive_skill(row)
        except Exception as exc:
            sys.stderr.write(f"failed: {path}: {exc}\n")
    rows.sort(key=lambda row: (row["业务场景"], row["英文名称"].lower(), row["source_type"], row["relative_path"]))
    write_csv(rows)
    JSON_PATH.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    write_xlsx(rows, stats)
    write_site(rows)
    write_report(rows, stats)
    print(json.dumps({"rows": len(rows), "excel": str(EXCEL_PATH), "site": str(SITE_ROOT / "index.html")}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
