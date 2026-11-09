# syntax=docker/dockerfile:1
# 三宝 · 一体化 3D 组织与经营网络空间（腾讯云轻量/CVM 生产镜像）
# 构建命令（在仓库根目录执行）：
#   docker build -f configs/docker/Dockerfile -t sanbao-orgmap:latest .

FROM python:3.12-alpine AS verifier
WORKDIR /workspace
COPY src/orgmap ./src/orgmap
COPY docs ./docs
COPY deliverables/canvas ./deliverables/canvas
# 构建期安全门禁：确保打入镜像的静态资产不含本机绝对路径或未授权目录
RUN python3 -I -c '
import pathlib, re, sys
root = pathlib.Path("/workspace")
pat = re.compile(r"/Users/[A-Za-z0-9._\-/]+")
bad = []
for p in root.rglob("*"):
    if p.is_file() and p.suffix in {".html", ".js", ".css", ".json"}:
        txt = p.read_text(encoding="utf-8", errors="ignore")
        hits = pat.findall(txt)
        if hits:
            bad.append((str(p), hits[:3]))
if bad:
    print("FATAL: local path leaked into image:", bad, file=sys.stderr)
    sys.exit(1)
print("IMAGE_ASSET_HYGIENE PASS")
'

FROM nginx:1.27-alpine-slim
LABEL org.opencontainers.image.title="sanbao-orgmap-3d" \
      org.opencontainers.image.description="Sanbao Unified 3D Organization & Business Network Space (Read-Only Design Projection)"

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY configs/docker/nginx.conf /etc/nginx/conf.d/sanbao.conf
COPY --from=verifier /workspace/src/orgmap /usr/share/nginx/html/src/orgmap
COPY --from=verifier /workspace/docs /usr/share/nginx/html/docs
COPY --from=verifier /workspace/deliverables/canvas /usr/share/nginx/html/deliverables/canvas

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
