# リポジトリ整理 — 手動実行ガイド

## 実行順序（GitHub Web UI）

### Step 1: UIUX_Quamtumy の index.html を更新

https://github.com/takuroarakawa/UIUX_Quamtumy/edit/main/index.html

このファイルの内容を以下と差し替える:
```
animeplatform/public/uiux-quamtumy-updated-index.html
```

コミットメッセージ: `feat: Quantumy リブランド + Elementary 連携完成`

### Step 2: 旧 Quantumy をリネーム → "Elementary"

**なぜ削除ではなくリネームか:**
Quantumy リポジトリの `cursor/...` ブランチに Elementary の全コード（約1万行）が入っています。
削除すると全て消えます。

1. https://github.com/takuroarakawa/Quantumy/settings を開く
2. Repository name → `Elementary` に変更
3. "Rename" ボタンを押す

### Step 3: UIUX_Quamtumy をリネーム → "Quantumy"

1. https://github.com/takuroarakawa/UIUX_Quamtumy/settings を開く
2. Repository name → `Quantumy` に変更
3. "Rename" ボタンを押す

### Step 4: Vercel の設定更新

Elementary (旧Quantumy) の Vercel プロジェクト:
- Settings → Git → Repository → `takuroarakawa/Elementary` に変更

Quantumy (旧UIUX_Quamtumy) の Vercel プロジェクト:
- `https://uiux-quamtumy-lr4u.vercel.app` は自動的にそのまま動作
- 必要であれば Alias を `quantumy.vercel.app` に変更

---

## リネーム後の最終的なリポジトリ構成

| リポジトリ名 | 内容 | URL |
|-------------|------|-----|
| `Elementary` | アニメ配信プラットフォーム (Next.js) | github.com/takuroarakawa/Elementary |
| `Quantumy` | DoctorCanvas — PhD研究のマンガ化 | github.com/takuroarakawa/Quantumy |
| `YUKAWA-systems` | (既存) | - |
| `sns` | (既存) | - |

## 2つのプラットフォームの役割

```
Quantumy (DoctorCanvas)
  博士研究 + AI → マンガ生成
  「Elementaryで公開」ボタン ↓
  ────────────────────────────────
Elementary
  マンガ配信・収益化・11言語対応
  投げ銭 / サブスク / Stripe
```
