#!/usr/bin/env python3
"""三宝公网生产站点（https://native.sagegogo.com）端到端健康、证书、安全头与零路径泄漏巡检器（批次 44）。

支持两种模式：
1. --selftest：纯函数离线自检（验证证书到期阈值、端口泄漏拦截、安全头缺失拦截、本机路径泄漏拦截），纳入 check-ledger-consistency.py；
2. --live [--base-url https://native.sagegogo.com]：对公网生产环境发起真实 HTTPS + TLS 证书探测。

用法：
  python3 -I scripts/check-online-production.py --selftest
  python3 -I scripts/check-online-production.py --live
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import socket
import ssl
import subprocess
import sys
from urllib.parse import urlparse

DEFAULT_BASE_URL = "https://native.sagegogo.com"
ABS_PATH_RE = re.compile(r"/Users/[A-Za-z0-9._\-/]+")


def evaluate_redirect_and_headers(status_code: int, location: str, headers: dict[str, str]) -> list[str]:
    errs: list[str] = []
    if status_code not in (301, 302):
        errs.append(f"根路径未返回 301/302 跳转：实际 {status_code}")
    if ":8080" in location or ":8088" in location:
        errs.append(f"Location 响应头泄漏容器内部端口：{location}")
    if "/src/orgmap/" not in location:
        errs.append(f"根路径 Location 未指向 /src/orgmap/：{location}")
    low_hdrs = {k.lower(): v for k, v in headers.items()}
    if "strict-transport-security" not in low_hdrs:
        errs.append("缺少 Strict-Transport-Security 响应头")
    if low_hdrs.get("x-frame-options", "").upper() != "SAMEORIGIN":
        errs.append(f"X-Frame-Options 异常：{low_hdrs.get('x-frame-options')}")
    if low_hdrs.get("x-content-type-options", "").lower() != "nosniff":
        errs.append(f"X-Content-Type-Options 异常：{low_hdrs.get('x-content-type-options')}")
    return errs


def evaluate_cert_days(days_left: int, min_days: int = 15) -> list[str]:
    if days_left < min_days:
        return [f"TLS 证书剩余有效期不足 {min_days} 天：当前剩余 {days_left} 天"]
    return []


def evaluate_body_hygiene(url_path: str, status_code: int, body: str, required_substr: str = "") -> list[str]:
    errs: list[str] = []
    if status_code != 200:
        errs.append(f"{url_path}: HTTP 状态码异常 {status_code}")
        return errs
    if required_substr and required_substr not in body:
        errs.append(f"{url_path}: 响应正文缺少关键标识 `{required_substr}`")
    hits = ABS_PATH_RE.findall(body)
    if hits:
        errs.append(f"{url_path}: 生产响应正文泄漏本机路径 {hits[0]}")
    return errs


def check_tls_days_left(hostname: str, port: int = 443) -> int:
    res = subprocess.run(
        ["sh", "-c", f"echo | openssl s_client -servername {hostname} -connect {hostname}:{port} 2>/dev/null | openssl x509 -noout -enddate"],
        capture_output=True,
        text=True,
        timeout=10,
    )
    m = re.search(r"notAfter=(.+)", res.stdout)
    if not m:
        raise RuntimeError(f"无法读取 {hostname} TLS 证书到期时间")
    exp = dt.datetime.strptime(m.group(1).strip(), "%b %d %H:%M:%S %Y %Z").replace(tzinfo=dt.timezone.utc)
    now = dt.datetime.now(dt.timezone.utc)
    return (exp - now).days


def curl_head(url: str) -> tuple[int, str, dict[str, str]]:
    res = subprocess.run(["curl", "-sSI", "--max-time", "12", url], capture_output=True, text=True, check=True)
    blocks = [b.strip() for b in re.split(r"\r?\n\r?\n", res.stdout.strip()) if b.strip()]
    last_block = blocks[-1] if blocks else res.stdout
    lines = last_block.splitlines()
    status = 0
    if lines:
        m = re.search(r"HTTP/\S+\s+(\d+)", lines[0])
        if m:
            status = int(m.group(1))
    hdrs: dict[str, str] = {}
    for ln in lines[1:]:
        if ":" in ln:
            k, v = ln.split(":", 1)
            hdrs[k.strip()] = v.strip()
    loc = hdrs.get("location") or hdrs.get("Location") or ""
    return status, loc, hdrs


def curl_get(url: str) -> tuple[int, str]:
    res = subprocess.run(
        ["curl", "-sS", "-L", "--compressed", "-w", "\n__HTTP_CODE__:%{http_code}", "--max-time", "15", url],
        capture_output=True,
        text=True,
        check=True,
    )
    body, _, tail = res.stdout.rpartition("\n__HTTP_CODE__:")
    return int(tail.strip()), body


def run_live(base_url: str) -> int:
    base = base_url.rstrip("/")
    host = urlparse(base).hostname or "native.sagegogo.com"
    errs: list[str] = []

    days_left = check_tls_days_left(host)
    errs += evaluate_cert_days(days_left)

    st, loc, hdrs = curl_head(f"{base}/")
    errs += evaluate_redirect_and_headers(st, loc, hdrs)

    checks = [
        ("/healthz", '"service":"sanbao-orgmap-3d"'),
        ("/src/orgmap/index.html", "C-376 内部总画布"),
        ("/src/orgmap/showcase.js", "highlightSquadIn3d"),
        ("/src/orgmap/data/graph.js", "cross_repo_requests"),
        ("/src/orgmap/cards/sanbao-agenticos-vision.html", "同一个经营网络"),
        ("/deliverables/canvas/sanbao-identity-boundaries.html", "返回三宝 3D 空间"),
        ("/docs/index.html", "进入三宝一体化 3D 组织与经营空间"),
    ]
    for path, marker in checks:
        code, body = curl_get(f"{base}{path}")
        errs += evaluate_body_hygiene(path, code, body, marker)

    if errs:
        for e in errs:
            print(f"FAIL  {e}", file=sys.stderr)
        return 1
    print(f"ONLINE_PRODUCTION_VERIFY PASS · host={host} · tls_days_left={days_left} · endpoints={len(checks) + 1}")
    return 0


def selftest() -> int:
    good_hdrs = {
        "Strict-Transport-Security": "max-age=31536000",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
    }
    cases = [
        ("valid_redirect_and_headers", evaluate_redirect_and_headers(302, "https://native.sagegogo.com/src/orgmap/", good_hdrs), False),
        ("port_8080_leak_blocked", evaluate_redirect_and_headers(302, "http://native.sagegogo.com:8080/src/orgmap/", good_hdrs), True),
        ("missing_hsts_blocked", evaluate_redirect_and_headers(302, "https://native.sagegogo.com/src/orgmap/", {"X-Frame-Options": "SAMEORIGIN"}), True),
        ("cert_expiry_warning", evaluate_cert_days(7, 15), True),
        ("cert_valid_days", evaluate_cert_days(89, 15), False),
        ("body_path_leak_blocked", evaluate_body_hygiene("/x", 200, "path /Users/pray/secret", ""), True),
        ("body_clean_pass", evaluate_body_hygiene("/x", 200, "ok content", "ok"), False),
    ]
    bad = [name for name, e, exp in cases if (len(e) > 0) != exp]
    if bad:
        print(f"FAIL check-online-production selftest: {bad}", file=sys.stderr)
        return 1
    print(f"ONLINE_PRODUCTION_SELFTEST PASS {len(cases)}/{len(cases)}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--live", action="store_true")
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    if args.live:
        return run_live(args.base_url)
    return selftest()


if __name__ == "__main__":
    sys.exit(main())
