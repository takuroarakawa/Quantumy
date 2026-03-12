# Dr.CANVAS Workspace

Dr.CANVASの融資準備資料と、今後の開発・法務・意思決定を蓄積する多言語Knowledge Hub（MVP）です。

## セットアップ

```bash
npm install
npm run dev
```

- 日本語トップ: `http://localhost:3000/ja`
- 英語トップ: `http://localhost:3000/en`

## 主要ディレクトリ

- `docs/meeting-pack`  
  岡山支店面談向けのA4資料5枚
- `docs/logs`  
  相談ログや自動生成された日次開発ログ
- `docs/site-plan`  
  自社ナレッジサイト化の中期計画
- `app`  
  Next.js App Router（多言語MVP）
- `lib`  
  i18n辞書と初期コンテンツ

## 面談当日資料

`docs/meeting-pack/README.md` を参照し、5枚を印刷して持参してください。

## 日次アイデア入力 → 自動ログ化

- 画面: `/ja/ideas` または `/en/ideas`
- API: `POST /api/ideas`
- 保存先:
  - 構造化データ: `data/dev-logs.json`
  - Markdownログ: `docs/logs/*.md`
