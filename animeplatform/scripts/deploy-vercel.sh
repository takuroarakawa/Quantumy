#!/usr/bin/env bash
# ============================================================
# Elementary — Vercel ワンコマンドデプロイスクリプト
# 使い方: VERCEL_TOKEN=xxx bash scripts/deploy-vercel.sh
# ============================================================
set -euo pipefail

TOKEN="${VERCEL_TOKEN:?'VERCEL_TOKEN が未設定です。export VERCEL_TOKEN=xxx を実行してください'}"

log() { echo "[$(date +'%H:%M:%S')] $*"; }
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log "📦 依存関係インストール..."
npm ci --silent

log "🐘 PostgreSQL スキーマに切り替え..."
bash scripts/use-postgres.sh

log "⚙️  Prisma クライアント生成..."
DATABASE_URL="postgresql://x@x/x" npx prisma generate --silent

log "🔗 Vercel プロジェクトを取得/作成..."
vercel pull --yes --environment=production --token="$TOKEN" 2>/dev/null || {
  log "新規プロジェクトとして作成します..."
  vercel link --yes --token="$TOKEN" --project="elementary-anime" 2>/dev/null || true
  vercel pull --yes --environment=production --token="$TOKEN"
}

log "🔨 ビルド..."
vercel build --prod --token="$TOKEN"

log "🚀 デプロイ..."
DEPLOY_URL=$(vercel deploy --prebuilt --prod --token="$TOKEN")

log "✅ デプロイ完了!"
echo ""
echo "┌─────────────────────────────────────────┐"
echo "│  🌐 Elementary 公開URL                   │"
echo "│  $DEPLOY_URL"
echo "└─────────────────────────────────────────┘"
echo ""
echo "🔗 Quantumy × Elementary:"
echo "   DoctorCanvas : https://uiux-quamtumy-lr4u.vercel.app"
echo "   Elementary   : $DEPLOY_URL"
echo "   ブリッジ      : $DEPLOY_URL/quantumy"

log "🗄️  SQLite スキーマに復元..."
bash scripts/use-sqlite.sh
