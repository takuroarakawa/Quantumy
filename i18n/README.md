# Elementary i18n — 国際化管理システム

## 対応言語

| コード | 言語 | RTL | BCP47 |
|--------|------|-----|-------|
| `ja` | 日本語 | - | `ja` |
| `en` | English | - | `en` |
| `fr` | Français | - | `fr` |
| `de` | Deutsch | - | `de` |
| `es` | Español | - | `es` |
| `pl` | Polski | - | `pl` |
| `nl` | Nederlands | - | `nl` |
| `ar` | العربية | ✓ | `ar` |
| `zh` | 中文 | - | `zh-CN` |
| `ru` | Русский | - | `ru` |
| `ko` | 한국어 | - | `ko` |

## テーブル構成

```
languages                  -- 言語マスタ
namespaces                 -- コンテンツ分類
translation_keys           -- 翻訳キー (言語非依存)
  └── translations         -- 各言語の翻訳テキスト
        └── translation_history  -- 変更履歴

science_terms              -- 専門用語マスタ (英語正規定義)
  └── science_term_translations  -- 各言語の専門用語翻訳
```

## 便利なクエリ

```sql
-- 翻訳進捗を言語×名前空間で確認
SELECT * FROM translation_progress WHERE language_code = 'ja';

-- 日本語の未翻訳キー一覧
SELECT * FROM get_untranslated_keys('ar');

-- 物理学用語の翻訳カバレッジ
SELECT * FROM term_translation_coverage WHERE category = 'physics';

-- 光速の全言語定義を取得
SELECT l.name_native, stt.term_name, stt.definition
FROM science_terms st
JOIN science_term_translations stt ON stt.term_id = st.id
JOIN languages l ON l.code = stt.language_code
WHERE st.term_en = 'Speed of light'
ORDER BY l.sort_order;
```

## 翻訳ワークフロー

```
pending → in_progress → review → approved
                                ↘ rejected → in_progress
ソーステキスト変更 → approved が自動で outdated に
```
