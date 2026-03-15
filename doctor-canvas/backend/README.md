# Doctor Canvas Backend (Axum + SQLite)

`Doctor Canvas` の認証バックエンドです。  
Axum + sqlx(SQLite) で `register` / `login` API を提供します。

## ディレクトリ構成

```text
backend/
├── Cargo.toml
└── src
    ├── main.rs             # ルーター初期化・DB接続・サーバー起動
    ├── app_state.rs        # 共有アプリケーション状態 (DB, JWT秘密鍵)
    ├── errors.rs           # APIエラー型とHTTPレスポンス変換
    ├── auth
    │   ├── mod.rs
    │   ├── jwt.rs          # JWT生成ロジック
    │   └── password.rs     # bcrypt ハッシュ/検証
    ├── handlers
    │   ├── mod.rs
    │   └── auth.rs         # /register, /login, /health
    └── models
        ├── mod.rs
        ├── auth.rs         # リクエスト/レスポンスDTO
        └── user.rs         # DBユーザーモデル
```

## 環境変数

- `DATABASE_URL` (default: `sqlite://doctor_canvas.db`)
- `JWT_SECRET` (default: `change-this-jwt-secret`)
- `PORT` (default: `4000`)

## 起動

```bash
cd backend
cargo run
```

## API

### POST /register

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

成功時 (`201 Created`):

```json
{
  "token": "<jwt>",
  "token_type": "Bearer"
}
```

### POST /login

```json
{
  "username": "alice",
  "password": "password123"
}
```

成功時 (`200 OK`):

```json
{
  "token": "<jwt>",
  "token_type": "Bearer"
}
```
