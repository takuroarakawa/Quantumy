# Dr.CANVAS Knowledge Hub 計画（社内資産化）

## 目的
- 融資準備、開発意思決定、法務判断、運用手順を自社サイトで一元保管する。
- Notionメモ資産を将来的に自社DBへ移行できる構造で管理する。
- 公開可能部分を一般公開し、非公開部分は社内限定で運用する。

## 情報設計（初期）
1. 面談資料（金融機関向け）
2. 開発ログ（日次）
3. 法務ナレッジ（著作権、AI生成、投稿規約）
4. プロダクト仕様（UI/UX、多言語要件）
5. 連載/IP運用メモ

## 多言語方針
- 初期ロケール：`ja`, `en`
- 将来追加候補：`fr`, `es`, `zh-Hans`
- 方針：日本語を一次原稿、英語を公開用翻訳として管理

## データモデル（MVP）
- `entry`
  - `id`
  - `type`（meeting, log, legal, spec, note）
  - `title`
  - `locale`
  - `summary`
  - `body`
  - `visibility`（private, team, public）
  - `createdAt`, `updatedAt`

## Notion運用との接続方針
- 当面：Notionを作業メモ、サイトを確定版アーカイブとして併用
- 次段階：Notion API同期（定期pull）で下書きを自動取込
- 公開前：公開フラグ・法務チェックフラグで審査

## 実装ロードマップ
### Phase 1（完了）
- Next.js + TypeScript で多言語MVPの土台
- 面談資料を `docs/meeting-pack` に固定化

### Phase 2（次）
- MD/MDXレンダリング
- 管理画面（下書き/公開切替）
- タグ・全文検索

### Phase 3（公開）
- 読者向け公開ページ
- 投稿ガイドライン公開
- 作品・連載ページ展開
