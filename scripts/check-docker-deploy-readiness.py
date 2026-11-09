#!/usr/bin/env python3
"""三宝腾讯云 Docker 部署前就绪度与白名单安全门禁检查器。

职责：
1. 校验 configs/docker/{Dockerfile,nginx.conf,docker-compose.yml} 完整性与只读安全加固；
2. 校验镜像白名单目录（src/orgmap, docs, deliverables/canvas）严禁泄漏 /Users/ 本机路径、.codex、.superpowers 或凭据；
3. 校验核心 3D 静态资产（index.html, showcase.js, three.module.min.js, bloom.module.js, data/graph.js, 200 张 WebP 头像）齐全；
4. 支持 --bundle <output.tar.gz> 导出可直传腾讯云服务器的最小 Docker 构建包。

用法：
  python3 -I scripts/check-docker-deploy-readiness.py
  python3 -I scripts/check-docker-deploy-readiness.py --selftest
  python3 -I scripts/check-docker-deploy-readiness.py --bundle tmp/outputs/tmp-bundle-tencent-docker-20261109-01.tar.gz
"""

from __future__ import annotations

import argparse
import gzip
import re
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WHITELIST_DIRS = ("src/orgmap", "docs", "deliverables/canvas", "configs/docker")
ABS_PATH_RE = re.compile(r"/Users/[A-Za-z0-9._\-/]+")
SECRET_SUFFIXES = {".env", ".pem", ".key", ".p12", ".pfx", ".token", ".session"}


def check_dockerfile_and_nginx(dockerfile_txt: str, nginx_txt: str, compose_txt: str) -> list[str]:
    errs: list[str] = []
    if re.search(r"^\s*COPY\s+\.\s+", dockerfile_txt, re.M):
        errs.append("Dockerfile: 严禁使用 `COPY .` 全仓拷贝（会泄漏 .codex/.superpowers/skill-library）")
    for forbidden in (".codex", ".superpowers", "skill-library"):
        if forbidden in dockerfile_txt:
            errs.append(f"Dockerfile: 严禁将非公开目录 {forbidden} 打入生产镜像")
    if "HEALTHCHECK" not in dockerfile_txt:
        errs.append("Dockerfile: 缺少 HEALTHCHECK 健康检查指令")
    if "gzip on;" not in nginx_txt or "application/javascript" not in nginx_txt:
        errs.append("nginx.conf: 必须开启 gzip 压缩以加速 Three.js 与 graph.js 传输")
    if "location = /healthz" not in nginx_txt:
        errs.append("nginx.conf: 缺少 /healthz 探针路由")
    if "X-Frame-Options \"SAMEORIGIN\"" not in nginx_txt:
        errs.append("nginx.conf: 必须设置 X-Frame-Options SAMEORIGIN（兼容页内卡片预览舱并防外部嵌套）")
    if "read_only: true" not in compose_txt or "no-new-privileges:true" not in compose_txt:
        errs.append("docker-compose.yml: 缺少 read_only: true 或 no-new-privileges:true 容器安全加固")
    return errs


def check_whitelist_assets(root: Path = ROOT) -> tuple[list[str], dict[str, int]]:
    errs: list[str] = []
    file_count = 0
    raw_bytes = 0
    gzip_bytes = 0

    required_files = (
        "src/orgmap/index.html",
        "src/orgmap/showcase.js",
        "src/orgmap/vendor/three.module.min.js",
        "src/orgmap/vendor/bloom.module.js",
        "src/orgmap/data/graph.js",
        "docs/index.html",
        "deliverables/canvas/sanbao-public-map.html",
    )
    for rel in required_files:
        if not (root / rel).is_file():
            errs.append(f"缺失核心静态资产：{rel}")

    webp_count = len(list((root / "src/orgmap/assets/avatars").rglob("*.webp"))) if (root / "src/orgmap/assets/avatars").is_dir() else 0
    if webp_count != 200:
        errs.append(f"数字员工 WebP 头像数量异常：期望 200，实际 {webp_count}")

    for d in WHITELIST_DIRS:
        dp = root / d
        if not dp.is_dir():
            errs.append(f"白名单目录不存在：{d}")
            continue
        for p in sorted(dp.rglob("*")):
            if not p.is_file():
                continue
            rel = str(p.relative_to(root))
            if p.suffix.lower() in SECRET_SUFFIXES or p.name.startswith(".env"):
                errs.append(f"白名单目录存在疑似敏感文件：{rel}")
            data = p.read_bytes()
            file_count += 1
            raw_bytes += len(data)
            if p.suffix in {".html", ".js", ".css", ".json", ".svg", ".md"}:
                gzip_bytes += len(gzip.compress(data, compresslevel=6))
                txt = data.decode("utf-8", errors="ignore")
                hits = ABS_PATH_RE.findall(txt)
                if hits:
                    errs.append(f"{rel}: 静态资产含本机绝对路径 {hits[0]}")
            else:
                gzip_bytes += len(data)

    stats = {"files": file_count, "raw_bytes": raw_bytes, "gzip_bytes": gzip_bytes, "webp_avatars": webp_count}
    return errs, stats


def build_bundle(out_path: Path, root: Path = ROOT) -> dict[str, int]:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with tarfile.open(out_path, "w:gz") as tf:
        for d in WHITELIST_DIRS:
            dp = root / d
            for p in sorted(dp.rglob("*")):
                if p.is_file():
                    rel = str(p.relative_to(root))
                    tf.add(p, arcname=rel)
                    count += 1
    return {"files": count, "bundle_bytes": out_path.stat().st_size}


def evaluate_repo(root: Path = ROOT) -> tuple[list[str], dict[str, int]]:
    df = root / "configs/docker/Dockerfile"
    ng = root / "configs/docker/nginx.conf"
    cp = root / "configs/docker/docker-compose.yml"
    errs: list[str] = []
    for p in (df, ng, cp):
        if not p.is_file():
            errs.append(f"缺少 Docker 配置文件：{p.relative_to(root)}")
    if errs:
        return errs, {}
    errs += check_dockerfile_and_nginx(
        df.read_text(encoding="utf-8"),
        ng.read_text(encoding="utf-8"),
        cp.read_text(encoding="utf-8"),
    )
    asset_errs, stats = check_whitelist_assets(root)
    errs += asset_errs
    return errs, stats


def selftest() -> int:
    errs, _ = evaluate_repo()
    df_ok = (ROOT / "configs/docker/Dockerfile").read_text(encoding="utf-8")
    ng_ok = (ROOT / "configs/docker/nginx.conf").read_text(encoding="utf-8")
    cp_ok = (ROOT / "configs/docker/docker-compose.yml").read_text(encoding="utf-8")
    cases = [
        ("clean_repo", errs, False),
        ("copy_dot_blocked", check_dockerfile_and_nginx("COPY . /app\n" + df_ok, ng_ok, cp_ok), True),
        ("superpowers_leak_blocked", check_dockerfile_and_nginx(df_ok + "\nCOPY .superpowers /x", ng_ok, cp_ok), True),
        ("missing_gzip_blocked", check_dockerfile_and_nginx(df_ok, "server { listen 8080; }", cp_ok), True),
        ("missing_readonly_blocked", check_dockerfile_and_nginx(df_ok, ng_ok, "services:\n  web:\n    image: x"), True),
    ]
    bad = []
    for name, e, exp in cases:
        if (len(e) > 0) != exp:
            bad.append((name, exp, e))
    if bad:
        for name, exp, e in bad:
            print(f"FAIL {name}: expected_fail={exp}, got={e}", file=sys.stderr)
        return 1
    print(f"DOCKER_DEPLOY_READINESS_SELFTEST PASS {len(cases)}/{len(cases)}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--bundle", type=Path, help="输出最小腾讯云部署 tar.gz 包路径")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    errs, stats = evaluate_repo()
    if errs:
        for e in errs:
            print(f"FAIL  {e}", file=sys.stderr)
        return 1
    if args.bundle:
        b = build_bundle(args.bundle)
        print(f"BUNDLE  {args.bundle} ({b['files']} files, {b['bundle_bytes']/1024:.1f} KB)")
    print(
        f"DOCKER_DEPLOY_READINESS PASS · files={stats['files']} · "
        f"raw={stats['raw_bytes']/1024:.1f}KB · gzip_transfer={stats['gzip_bytes']/1024:.1f}KB · "
        f"avatars={stats['webp_avatars']}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
