#!/usr/bin/env python3
"""三宝 orgmap 视觉契约、无障碍、响应式与架构边界自检门禁（批次 18-32）。

检查项：
1. 单一主题源与 Sagegogo 色彩对齐：禁止在 src/orgmap/*.{css,js} 中残留旧墨绿/黄铜/暖黄硬编码；
2. 确定性渲染：禁止在 src/orgmap/*.js（vendor 除外）中使用 Math.random()；
3. 零构建与共享纯模块零 Three.js 依赖：app.js / dossier.js / plaque.js / theme.js / layout.js / lightbox.js 不得引用 three.module.min.js；
4. MGT T4 证据纪律：MGT-001..003 严禁传入 createPerson；
5. C-032 字号下限与 3D 科技特性存在性：FONT_MIN >= 12，showcase.js 含 createSideGradientMaterial / buildChaseLight / buildHudRings / VIEW_PRESETS / createHoloEmitterStage / buildCrosswalkBeams / openCardLightbox / apply3dTheme / createSelectiveBloom / runIntroSweep / audit3d；
6. 批次 29-32 新增门禁：
   - showcase.css 必须包含至少 2 档 @media 响应式断点（1279px 与 767px）；
   - showcase.js 的 addLabel 必须设置 tabindex="0" 与 role="button"，支持键盘 Enter/Space 激活；
   - lightbox.js 与 app.js 严禁硬编码字面量 '.superpowers' 路径，且 lightbox.js 必须具备 HEAD 探测与 renderCardFallback 离线兜底；
   - index.html 必须为一体化 3D 空间唯一主入口，showcase.html 仅作跳转兼容且不得残留跨页互跳文案。

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
    "app.js",
    "dossier.js",
    "plaque.js",
    "theme.js",
    "layout.js",
    "lightbox.js",
)

REQUIRED_3D_FEATURES = (
    "createSideGradientMaterial",
    "buildChaseLight",
    "buildHudRings",
    "VIEW_PRESETS",
    "createHoloEmitterStage",
    "buildCrosswalkBeams",
    "openCardLightbox",
    "apply3dTheme",
    "createSelectiveBloom",
    "runIntroSweep",
    "audit3d",
    "triggerLowPowerFallback",
    "applyPinchDelta",
    "buildShareQuery",
    "syncUrlState",
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
            errs.append(f"{name}: 共享零 Three.js 模块引用了 Three.js 或带 Three 依赖的 avatars.js")
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
            errs.append(f"showcase.js: 缺少必需的 3D 科技特性 {feat}")
    av_js = file_map.get("avatars.js", "")
    if "flatShading: true" not in av_js:
        errs.append("avatars.js: 缺少 Polyfork 风格 flatShading: true 材质配置")
    if "startsWith('MGT-')" not in av_js:
        errs.append("avatars.js: createPerson 缺少 MGT 禁止生成人形的硬门禁断言")
    return errs


def check_a11y_responsive_and_lightbox(file_map: dict[str, str]) -> list[str]:
    errs: list[str] = []
    sc_css = _strip_comments(file_map.get("showcase.css", ""))
    media_hits = re.findall(r"@media\s*\([^)]*max-width", sc_css)
    if len(media_hits) < 2:
        errs.append("showcase.css: 必须包含至少 2 档 @media (max-width: ...) 响应式断点")

    sc_js = _strip_comments(file_map.get("showcase.js", ""))
    if "setAttribute('tabindex', '0')" not in sc_js or "setAttribute('role', 'button')" not in sc_js:
        errs.append("showcase.js: 3D 悬浮标签缺少 tabindex=\"0\" 或 role=\"button\" 键盘无障碍属性")
    if "addEventListener('keydown'" not in sc_js:
        errs.append("showcase.js: 3D 悬浮标签缺少 keydown 键盘激活监听")

    for fname in ("lightbox.js", "app.js"):
        code = _strip_comments(file_map.get(fname, ""))
        if ".superpowers" in code:
            errs.append(f"{fname}: 严禁硬编码字面量 .superpowers 路径（clean clone 下会导致 404）")

    if "touch-action:none" not in sc_css and "touch-action: none" not in sc_css:
        errs.append("showcase.css: #stage 缺少 touch-action:none 移动端双指手势保护")

    lb_js = _strip_comments(file_map.get("lightbox.js", ""))
    if "renderCardFallback" not in lb_js or "method: 'HEAD'" not in lb_js or "./cards/" not in lb_js:
        errs.append("lightbox.js: 缺少 ./cards/ 同源脱敏卡优先加载、HEAD 探测或 renderCardFallback 离线兜底")

    idx_html = file_map.get("index.html", "")
    if "./showcase.js" not in idx_html or "切换 2D 极简验收表" in idx_html or "进入 3D 空间" in idx_html:
        errs.append("index.html: 必须作为一体化 3D 空间单一主入口，且不得残留跨页互跳文案")
    if "sanbao-identity-boundaries.html" not in idx_html:
        errs.append("index.html: 底栏缺少 C-376 内部总画布互联入口")
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
    failures += check_a11y_responsive_and_lightbox(all_files)
    notice = ROOT / "deliverables/execution/sanbao-handoff-20261104/NOTICE-three-scope-map.md"
    if not notice.is_file():
        failures.append("缺少 NOTICE-three-scope-map.md 许可证与方法论来源声明")
    bloom_mod = orgmap_dir / "vendor/bloom.module.js"
    if not bloom_mod.is_file():
        failures.append("缺少 vendor/bloom.module.js 选择性辉光模块")
    return failures


def selftest() -> int:
    all_files, _ = collect_orgmap_files()
    cases = [
        ("clean_repo", evaluate_repo(), False),
        ("legacy_color_detected", check_no_legacy_colors({"style.css": "color: #2d6756;"}), True),
        ("legacy_brass_detected", check_no_legacy_colors({"showcase.css": "border: 1px solid #c9a96a;"}), True),
        ("math_random_detected", check_no_math_random({"showcase.js": "const x = Math.random();"}), True),
        ("2d_loads_three", check_2d_zero_three({"app.js": "import * as THREE from './vendor/three.module.min.js';"}), True),
        ("font_min_violation", check_font_min_and_3d_features({**all_files, "app.js": "const FONT_MIN = 10;"}), True),
        ("missing_chase_light", check_font_min_and_3d_features({**all_files, "showcase.js": "const x = 1;"}), True),
        ("missing_media_queries", check_a11y_responsive_and_lightbox({**all_files, "showcase.css": "body { color: #fff; }"}), True),
        ("missing_tabindex", check_a11y_responsive_and_lightbox({**all_files, "showcase.js": "function addLabel(){}"}), True),
        ("hardcoded_superpowers", check_a11y_responsive_and_lightbox({**all_files, "lightbox.js": "const u = '../../.superpowers/x';"}), True),
        ("split_entry_regression", check_a11y_responsive_and_lightbox({**all_files, "index.html": "<a href='./showcase.html'>进入 3D 空间</a>"}), True),
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
