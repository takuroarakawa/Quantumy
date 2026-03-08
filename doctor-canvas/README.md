# Doctor Canvas (Quantumy Phase 1)

「漫画版岩波文庫」をコンセプトにしたUIプロトタイプです。  
**ジャンプ+風の漫画ビューワー** と **論文引用サイドバー（タイトル・著者・DOI）** を同一画面に統合し、
「物語で理解を駆動し、論文で根拠を確認する」体験を目指します。

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS

## 主要機能（プロトタイプ）

- ページ送り（ボタン + キーボード左右キー）
- ページ進捗インジケーター
- ページ一覧からのジャンプ
- 現在ページに連動する論文引用カード表示
  - タイトル
  - 著者
  - DOI（`doi.org` へのリンク）
- STEAM観点（Science / Technology / Engineering / Art / Mathematics）を意識したシーン注釈

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## ファイル構成（主要）

- `src/components/DoctorCanvasPrototype.tsx`  
  ビューワー本体と引用サイドバーのUIロジック
- `src/app/page.tsx`  
  プロトタイプのエントリ
- `src/app/layout.tsx`  
  ページメタ情報

## 次フェーズ案

- 実際の漫画画像/PDF連携
- DOIメタデータ自動取得（Crossref等）
- ハイライトと注釈の双方向リンク
- 章ごとの学習目標と理解度トラッキング
