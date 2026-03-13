# Elementary — Vercel デプロイガイド

## 最速デプロイ（2ステップ）

### ① VERCEL_TOKEN を取得（30秒）

1. https://vercel.com/account/tokens を開く
2. "Create Token" → 名前: `elementary-deploy` → "Create"
3. 表示されたトークンをコピー（1回しか表示されない）

### ② Cursor Secrets に登録してエージェントを再起動

https://cursor.com/settings → Secrets → Add Secret

| Key | Value |
|-----|-------|
| `VERCEL_TOKEN` | 上でコピーしたトークン |

登録後、このエージェントに「デプロイして」と伝えると自動実行します。

---

## 手動デプロイ（ターミナルから）

```bash
cd animeplatform
export VERCEL_TOKEN="<your-token>"
bash scripts/deploy-vercel.sh
```

---

## Vercel Web UI からデプロイ（ノーコード）

1. https://vercel.com/new を開く
2. `takuroarakawa/Quantumy` を選択
3. **Root Directory** → `animeplatform`
4. **Build Command** → `bash scripts/use-postgres.sh && prisma generate && next build`
5. **Environment Variables** を以下で設定:

| 変数名 | 値 | 必須 |
|--------|-----|------|
| `DATABASE_URL` | Vercel Postgres URL（自動設定） | ✅ |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` の出力 | ✅ |
| `NEXTAUTH_URL` | `https://YOUR_APP.vercel.app` | ✅ |
| `NEXT_PUBLIC_QUANTUMY_URL` | `https://uiux-quamtumy-lr4u.vercel.app` | ✅ |
| `STRIPE_SECRET_KEY` | Stripe Dashboard から | 収益化時 |
| `R2_BUCKET_NAME` | `elementary-videos` | 動画時 |

6. Storage タブ → Postgres → Create（自動で DATABASE_URL が設定される）
7. "Deploy" ボタンを押す

---

## GitHub Actions 自動デプロイ

`animeplatform/.github/workflows/deploy.yml` が設定済み。

GitHub Secrets に以下を追加すれば、プッシュのたびに自動デプロイ:

| Secret | 取得方法 |
|--------|---------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `vercel.json` の設定後 `vercel env ls` |
| `VERCEL_PROJECT_ID` | 同上 |

---

## プラットフォーム構成（デプロイ後）

```
https://elementary-anime.vercel.app          ← Elementary
  /quantumy                                  ← ブリッジページ
  /creator/upload?from=quantumy              ← DoctorCanvas連携

https://uiux-quamtumy-lr4u.vercel.app        ← Quantumy (DoctorCanvas)
  「⚡ Elementaryで世界に公開する」ボタン
```
