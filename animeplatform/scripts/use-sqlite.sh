#!/usr/bin/env bash
# ローカル開発用に schema.prisma を SQLite に戻す
set -e
sed -i 's/provider  = "postgresql"/provider  = "sqlite"/' prisma/schema.prisma
echo "✅ Prisma schema → SQLite"
