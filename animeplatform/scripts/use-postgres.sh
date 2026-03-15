#!/usr/bin/env bash
# Vercel デプロイ前に schema.prisma を PostgreSQL に切り替える
# Usage: bash scripts/use-postgres.sh && vercel deploy --prod
set -e
sed -i 's/provider  = "sqlite"/provider  = "postgresql"/' prisma/schema.prisma
echo "✅ Prisma schema → PostgreSQL"
