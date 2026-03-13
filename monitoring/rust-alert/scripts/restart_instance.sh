#!/usr/bin/env bash
# ============================================================
# Elementary — インスタンス再起動/フェイルオーバースクリプト
# Rustアラートハンドラーから呼び出される
# ============================================================
set -euo pipefail

SERVICE=""
MODE="restart"

# 引数パース
for arg in "$@"; do
    case $arg in
        --service=*) SERVICE="${arg#*=}" ;;
        --mode=*)    MODE="${arg#*=}" ;;
    esac
done

log() { echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] [$1] $2"; }

if [[ -z "$SERVICE" ]]; then
    log "ERROR" "--service が指定されていません"
    exit 1
fi

log "INFO" "SERVICE=$SERVICE MODE=$MODE"

case "$MODE" in
    # ─── 通常再起動 ──────────────────────────────────
    restart)
        log "WARN" "🔄 $SERVICE を再起動します..."

        # Docker Compose の場合
        if command -v docker &>/dev/null; then
            docker restart "elementary-${SERVICE}" 2>/dev/null && \
                log "INFO" "✅ Docker コンテナ再起動成功" || \
                log "WARN" "Docker再起動失敗 — systemd を試みます"
        fi

        # systemd の場合
        if command -v systemctl &>/dev/null; then
            systemctl restart "elementary-${SERVICE}" 2>/dev/null && \
                log "INFO" "✅ systemd 再起動成功" || true
        fi

        # PM2 の場合（Node.jsサービス）
        if command -v pm2 &>/dev/null; then
            pm2 restart "elementary-${SERVICE}" 2>/dev/null && \
                log "INFO" "✅ PM2 再起動成功" || true
        fi
        ;;

    # ─── フェイルオーバー ─────────────────────────────
    failover)
        log "ERROR" "🚨 $SERVICE のフェイルオーバーを実行..."

        # プライマリを停止
        docker stop "elementary-${SERVICE}" 2>/dev/null || true

        # バックアップを起動
        BACKUP_SERVICE="elementary-${SERVICE}-backup"
        if docker ps -a --format '{{.Names}}' | grep -q "^${BACKUP_SERVICE}$"; then
            docker start "${BACKUP_SERVICE}"
            log "INFO" "✅ バックアップ起動: ${BACKUP_SERVICE}"
        else
            log "ERROR" "バックアップコンテナ ${BACKUP_SERVICE} が存在しません"
            exit 1
        fi

        # ヘルスチェック（最大60秒待機）
        for i in $(seq 1 12); do
            sleep 5
            if curl -sf "${ELEMENTARY_API_URL:-http://localhost:3000}/health" >/dev/null 2>&1; then
                log "INFO" "✅ フェイルオーバー後のヘルスチェック成功 (${i}回目)"
                exit 0
            fi
            log "WARN" "ヘルスチェック待機中... (${i}/12)"
        done

        log "ERROR" "❌ フェイルオーバー後もヘルスチェック失敗"
        exit 1
        ;;

    # ─── DB レプリカ昇格 ──────────────────────────────
    promote-replica)
        log "ERROR" "🗄️ PostgreSQL レプリカを昇格します..."

        # pg_ctl または pg_promote を使用
        PG_DATA="${PGDATA:-/var/lib/postgresql/data}"

        if command -v pg_ctl &>/dev/null; then
            pg_ctl promote -D "$PG_DATA"
            log "INFO" "✅ レプリカ昇格成功"
        elif command -v psql &>/dev/null; then
            psql -c "SELECT pg_promote();"
            log "INFO" "✅ pg_promote() 実行成功"
        else
            log "ERROR" "pg_ctl / psql が見つかりません"
            exit 1
        fi
        ;;

    *)
        log "ERROR" "未知のモード: $MODE"
        exit 1
        ;;
esac

log "INFO" "スクリプト完了: SERVICE=$SERVICE MODE=$MODE"
