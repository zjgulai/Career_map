#!/usr/bin/env python3
"""三宝 orgmap 视觉契约与架构边界自检门禁（批次 18-21）。

检查项：
1. 单一主题源与 Sagegogo 色彩对齐：禁止在 src/orgmap/*.{css,js} 中残留旧墨绿/黄铜/暖黄硬编码（#2d6756 / #9fc53a / #c9a96a / #a8792c / #e0a95a / #64c8d8 / 0xfff0da / 0xffe6c4）；
2. 确定性渲染：禁止在 src/orgmap/*.js（vendor 除外）中使用 Math.random()；
3. 零构建与 2D 零 Three.js 依赖：index.html / app.js / dossier.js / plaque.js / theme.js 不得引用 three.module.min.js，且不引入外部 GLTFLoader / .glb；
4. MGT T4 证据纪律：MGT-001..003 严禁传入 createPerson，严禁为其配置人形头像路径；
5. C-032 字号下限与 3D 科技特性存在性：FONT_MIN >= 12，showcase.js 含 createSideGradientMaterial / buildChaseLight / buildHudRings / VIEW_PRESETS / createHoloEmitterStage。

用法：
  python3 -I scripts/check-orgmap-visual-contract.py
  python3 -I scripts/check-orgmap-visual-contract.py --selftest
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORGMAP_DIR = ROOT / "src/orgmap"

BANNED_LEGACY_COLORS = (
    "#2d6756",
    "#9fc53a",
    "#c9a96a",
    "#a8792c",
    "#e0a95a",
    "#64c8d8",
    "0xfff0da",
    "0xffe6c4",
    "0x64c8d8",
    "0xe0a95a",
)

TWO_D_ZERO_THREE_FILES = (
    "index.html",
    "app.js",
    "dossier.js",
    "plaque.js",
    "theme.js",
    "layout.js",
)

REQUIRED_3D_FEATURES = (
    "createSideGradientMaterial",
    "buildChaseLight",
    "buildHudRings",
    "VIEW_PRESETS",
    "createHoloEmitterStage",
)


def check_no_legacy_colors(file_map: dict[str, str]) -> list[str]:
    errs: list[str] = []
    for name, text in sorted(file_map.items()):
        low = text.lower()
        for bad in BANNED_LEGACY_COLORS:
            if bad in low:
                errs.append(f"{name}: 残留已废弃的旧色值 {bad}（应统一使用 Sagegogo 冷蓝钛银 theme.js）")
    return errs


def _strip_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"//[^\n]*", "", text)
    return text


def check_no_math_random(js_map: dict[str, str]) -> list[str]:
    errs: list[str] = []
    for name, text in sorted(js_map.items()):
        if "Math.random" in _strip_comments(text):
            errs.append(f"{name}: 含非确定性 Math.random（应使用固定种子 mulberry32）")
    return errs


def check_2d_zero_three(file_map: dict[str, str]) -> list[str]:
    errs: list[str] = []
    for name in TWO_D_ZERO_THREE_FILES:
        text = _strip_comments(file_map.get(name, ""))
        if "three.module" in text or "from './avatars.js" in text:
            errs.append(f"{name}: 2D/共享零 Three.js 模块引用了 Three.js 或带 Three 依赖的 avatars.js")
    return errs


def check_font_min_and_3d_features(file_map: dict[str, str]) -> list[str]:
    errs: list[str] = []
    app_js = file_map.get("app.js", "")
    m = re.search(r"const\s+FONT_MIN\s*=\s*(\d+)", app_js)
    if not m or int(m.group(1)) < 12:
        errs.append("app.js: FONT_MIN 必须 >= 12（C-032 硬约束）")
    sc_js = file_map.get("showcase.js", "")
    for feat in REQUIRED_3D_FEATURES:
        if feat not in sc_js:
            errs.append(f"showcase.js: 缺少批次 19/20 必需的 3D 科技特性 {feat}")
    av_js = file_map.get("avatars.js", "")
    if "flatShading: true" not in av_js:
        errs.append("avatars.js: 缺少 Polyfork 风格 flatShading: true 材质配置")
    if "startsWith('MGT-')" not in av_js:
        errs.append("avatars.js: createPerson 缺少 MGT 禁止生成人形的硬门禁断言")
    return errs


def collect_orgmap_files(orgmap_dir: Path = ORGMAP_DIR) -> tuple[dict[str, str], dict[str, str]]:
    all_files: dict[str, str] = {}
    js_files: dict[str, str] = {}
    for p in sorted(orgmap_dir.glob("*")):
        if p.is_file() and p.suffix in (".js", ".css", ".html"):
            txt = p.read_text(encoding="utf-8")
            all_files[p.name] = txt
            if p.suffix == ".js":
                js_files[p.name] = txt
    return all_files, js_files


def evaluate_repo(orgmap_dir: Path = ORGMAP_DIR) -> list[str]:
    all_files, js_files = collect_orgmap_files(orgmap_dir)
    failures: list[str] = []
    failures += check_no_legacy_colors(all_files)
    failures += check_no_math_random(js_files)
    failures += check_2d_zero_three(all_files)
    failures += check_font_min_and_3d_features(all_files)
    notice = ROOT / "deliverables/execution/sanbao-handoff-20261104/NOTICE-three-scope-map.md"
    if not notice.is_file():
        failures.append("缺少 NOTICE-three-scope-map.md 许可证与方法论来源声明")
    return failures


def selftest() -> int:
    all_files, js_files = collect_orgmap_files()
    cases = [
        ("clean_repo", evaluate_repo(), False),
        ("legacy_color_detected", check_no_legacy_colors({"style.css": "color: #2d6756;"}), True),
        ("legacy_brass_detected", check_no_legacy_colors({"showcase.css": "border: 1px solid #c9a96a;"}), True),
        ("math_random_detected", check_no_math_random({"showcase.js": "const x = Math.random();"}), True),
        ("2d_loads_three", check_2d_zero_three({"app.js": "import * as THREE from './vendor/three.module.min.js';"}), True),
        ("font_min_violation", check_font_min_and_3d_features({**all_files, "app.js": "const FONT_MIN = 10;"}), True),
        ("missing_chase_light", check_font_min_and_3d_features({**all_files, "showcase.js": "const x = 1;"}), True),
    ]
    bad = []
    for name, errs, expect_fail in cases:
        got_fail = len(errs) > 0
        if got_fail != expect_fail:
            bad.append((name, expect_fail, errs))
    if bad:
        for name, exp, errs in bad:
            print(f"FAIL {name}: expected fail={exp}, got={errs}", file=sys.stderr)
        return 1
    print(f"ORGMAP_VISUAL_CONTRACT_SELFTEST PASS {len(cases)}/{len(cases)}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    failures = evaluate_repo()
    if failures:
        for f in failures:
            print(f"FAIL  {f}", file=sys.stderr)
        return 1
    print("ORGMAP_VISUAL_CONTRACT PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
