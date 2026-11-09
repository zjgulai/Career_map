# 三宝 · 一体化 3D 组织与经营网络空间（腾讯云轻量/CVM 生产镜像，兼容经典 Builder 与 BuildKit）
# 构建命令（在仓库根目录执行）：
#   docker build -f configs/docker/Dockerfile -t sanbao-orgmap:latest .

FROM nginx:1.27-alpine-slim
LABEL org.opencontainers.image.title="sanbao-orgmap-3d" \
      org.opencontainers.image.description="Sanbao Unified 3D Organization & Business Network Space (Read-Only Design Projection)"

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY configs/docker/nginx.conf /etc/nginx/conf.d/sanbao.conf
COPY src/orgmap /usr/share/nginx/html/src/orgmap
COPY docs /usr/share/nginx/html/docs
COPY deliverables/canvas /usr/share/nginx/html/deliverables/canvas

# 构建期自动解压 63 张脱敏画布卡（若尚未展开）并执行零本机路径安全门禁
RUN set -eu; \
    mkdir -p /usr/share/nginx/html/src/orgmap/cards; \
    if [ -f /usr/share/nginx/html/src/orgmap/sources/cards-sanitized.tar.gz ]; then \
      tar -xzf /usr/share/nginx/html/src/orgmap/sources/cards-sanitized.tar.gz -C /usr/share/nginx/html/src/orgmap/cards; \
    fi; \
    cnt="$(ls -1 /usr/share/nginx/html/src/orgmap/cards/*.html 2>/dev/null | wc -l | tr -d ' ')"; \
    test "$cnt" -eq 63; \
    if grep -rn "/Users/" /usr/share/nginx/html/src/orgmap/*.js /usr/share/nginx/html/src/orgmap/*.html /usr/share/nginx/html/src/orgmap/*.css /usr/share/nginx/html/src/orgmap/data/ /usr/share/nginx/html/src/orgmap/cards/ /usr/share/nginx/html/docs/ /usr/share/nginx/html/deliverables/ >/dev/null 2>&1; then \
      echo "FATAL: local path leaked into image" >&2; exit 1; \
    fi

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
