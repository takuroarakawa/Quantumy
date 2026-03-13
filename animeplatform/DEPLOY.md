# Elementary — Vercel デプロイガイド

## 最速の方法: Vercel GitHub 連携（推奨）

### Step 1: Vercel にインポート
1. https://vercel.com/new を開く
2. "Import Git Repository" → `takuroarakawa/Quantumy` を選択
3. **Root Directory** を `animeplatform` に設定
4. **Build Command** を `bash scripts/use-postgres.sh && prisma generate && next build` に設定

### Step 2: Vercel Postgres（Neon）を追加
1. Vercel Dashboard → Storage → Create → Postgres
2. データベース名: `elementary-db`
3. リージョン: `iad1`（東京は `kix1`）
4. 作成後、Environment Variables に自動追加される

### Step 3: 環境変数を設定
Vercel Dashboard → Settings → Environment Variables に以下を追加:

| 変数名 | 値 |
|--------|-----|
| `DB_PROVIDER` | `postgresql` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` の出力 |
| `NEXTAUTH_URL` | `https://YOUR_APP.vercel.app` |
| `NEXT_PUBLIC_QUANTUMY_URL` | `https://quantumy.vercel.app` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard から取得 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 同上 |
| `R2_ACCOUNT_ID` | Cloudflare Dashboard から取得 |
| `R2_ACCESS_KEY_ID` | 同上 |
| `R2_SECRET_ACCESS_KEY` | 同上 |
| `R2_BUCKET_NAME` | `elementary-videos` |
| `R2_PUBLIC_URL` | `https://YOUR_BUCKET.r2.dev` |

### Step 4: schema.prisma を PostgreSQL に変更
本番デプロイ時は `scripts/use-postgres.sh` が自動実行されます。

---

## GitHub Actions 自動デプロイの設定

### GitHub Secrets に以下を追加:
Settings → Secrets and variables → Actions → New repository secret

| シークレット名 | 取得方法 |
|--------------|---------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens で作成 |
| `VERCEL_ORG_ID` | `vercel.json` または `vercel env ls` で確認 |
| `VERCEL_PROJECT_ID` | 同上 |

### Cursor Secrets への登録:
https://cursor.com/settings → Secrets → Add Secret

- `VERCEL_TOKEN` = Vercelトークン

---

## Vercel Postgres でのデータベース初期化

```bash
# Vercel CLI でローカルから本番DBに接続
vercel env pull .env.production.local
DATABASE_URL=$(cat .env.production.local | grep DATABASE_URL | cut -d= -f2-)
bash scripts/use-postgres.sh
DATABASE_URL=$DATABASE_URL npx prisma db push
DATABASE_URL=$DATABASE_URL npx tsx prisma/seed.ts
bash scripts/use-sqlite.sh
```

---

## Quantumy との連携確認

デプロイ後、以下のURLで連携を確認:
- `https://YOUR_APP.vercel.app/quantumy` — ブリッジページ
- `https://YOUR_APP.vercel.app/creator/upload?from=quantumy&title=AI生成マンガ&genre=SF` — 自動入力テスト
- `https://YOUR_APP.vercel.app/q` — `/quantumy` のショートURL
