#!/usr/bin/env bash
# 三宝 · 一体化 3D 组织与经营网络空间 —— 腾讯云 Docker 一键打包与远端发布脚本
# 用法：
#   bash scripts/deploy-tencent-docker.sh --dry-run
#   bash scripts/deploy-tencent-docker.sh --host ubuntu@<腾讯云公网IP> [--port 8080] [--remote-dir /opt/sanbao-orgmap] [--https your.domain.com]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REMOTE_HOST=""
SANBAO_PORT="${SANBAO_PORT:-8080}"
REMOTE_DIR="/opt/sanbao-orgmap"
HTTPS_DOMAIN=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) REMOTE_HOST="$2"; shift 2 ;;
    --port) SANBAO_PORT="$2"; shift 2 ;;
    --remote-dir) REMOTE_DIR="$2"; shift 2 ;;
    --https) HTTPS_DOMAIN="$2"; shift 2 ;;
    --verify-online)
      ONLINE_URL="${2:-https://native.sagegogo.com}"
      python3 -I scripts/check-online-production.py --live --base-url "$ONLINE_URL"
      exit $?
      ;;
    --dry-run) DRY_RUN=1; shift ;;
    *) echo "未知参数: $1" >&2; exit 2 ;;
  esac
done

BUNDLE_PATH="tmp/outputs/tmp-bundle-tencent-docker-20261109-01.tar.gz"

echo "[1/4] 执行本地门禁校验、63 张画布卡脱敏与最小部署包构建..."
python3 -I scripts/check-docker-deploy-readiness.py \
  --export-sanitized-cards \
  --bundle "$BUNDLE_PATH"

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "[DRY-RUN] 本地部署包已就绪: $BUNDLE_PATH"
  echo "[DRY-RUN] 远端将执行: scp $BUNDLE_PATH <host>:$REMOTE_DIR/ && docker compose -f configs/docker/docker-compose.yml up -d --build"
  exit 0
fi

if [[ -z "$REMOTE_HOST" ]]; then
  echo "错误: 请提供 --host <user@腾讯云IP> 或使用 --dry-run 预演" >&2
  exit 2
fi

echo "[2/4] 上传部署包至腾讯云主机 $REMOTE_HOST:$REMOTE_DIR ..."
ssh "$REMOTE_HOST" "mkdir -p '$REMOTE_DIR'"
scp "$BUNDLE_PATH" "$REMOTE_HOST:$REMOTE_DIR/bundle.tar.gz"

echo "[3/4] 在腾讯云主机解压并启动 Docker 容器..."
if [[ -n "$HTTPS_DOMAIN" ]]; then
  ssh "$REMOTE_HOST" "cd '$REMOTE_DIR' && tar -xzf bundle.tar.gz && rm -f bundle.tar.gz && SANBAO_PORT='$SANBAO_PORT' SANBAO_DOMAIN='$HTTPS_DOMAIN' docker compose -f configs/docker/docker-compose.yml -f configs/docker/docker-compose.https.yml up -d --build"
else
  ssh "$REMOTE_HOST" "cd '$REMOTE_DIR' && tar -xzf bundle.tar.gz && rm -f bundle.tar.gz && SANBAO_PORT='$SANBAO_PORT' docker compose -f configs/docker/docker-compose.yml up -d --build"
fi

echo "[4/4] 校验远端容器 /healthz 探针..."
ssh "$REMOTE_HOST" "for i in 1 2 3 4 5; do curl -fsS http://127.0.0.1:${SANBAO_PORT}/healthz && break || sleep 2; done"
echo "DEPLOY_SUCCESS: http://${REMOTE_HOST#*@}:${SANBAO_PORT}/"
