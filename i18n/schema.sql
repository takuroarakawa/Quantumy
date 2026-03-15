-- ============================================================
-- Elementary — 国際化(i18n)管理システム PostgreSQL スキーマ
-- 対応言語: 日・英・仏・独・西・波・蘭・亜・中・露・韓
--
-- 設計思想:
--   1. 翻訳キー/コンテンツを言語から分離（言語非依存の正規化）
--   2. 専門用語の定義を別テーブルで厳密に管理
--   3. 翻訳進捗を追跡し、未翻訳ゼロへのパスを可視化
--   4. バージョン管理で翻訳の差分をトレース
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 部分一致検索の高速化

-- ─── 言語マスタ ────────────────────────────────────────────────

CREATE TABLE languages (
    code        CHAR(2)     PRIMARY KEY,  -- ISO 639-1
    bcp47       VARCHAR(10) NOT NULL UNIQUE, -- BCP 47 タグ (例: zh-CN, pt-BR)
    name_native TEXT        NOT NULL,     -- 現地語での名称
    name_en     TEXT        NOT NULL,     -- 英語での名称
    is_rtl      BOOLEAN     NOT NULL DEFAULT FALSE,  -- 右→左言語 (アラビア語等)
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO languages (code, bcp47, name_native, name_en, is_rtl, sort_order) VALUES
    ('ja', 'ja',    '日本語',   'Japanese',  FALSE, 1),
    ('en', 'en',    'English',  'English',   FALSE, 2),
    ('fr', 'fr',    'Français', 'French',    FALSE, 3),
    ('de', 'de',    'Deutsch',  'German',    FALSE, 4),
    ('es', 'es',    'Español',  'Spanish',   FALSE, 5),
    ('pl', 'pl',    'Polski',   'Polish',    FALSE, 6),
    ('nl', 'nl',    'Nederlands','Dutch',    FALSE, 7),
    ('ar', 'ar',    'العربية',  'Arabic',    TRUE,  8),
    ('zh', 'zh-CN', '中文',     'Chinese',   FALSE, 9),
    ('ru', 'ru',    'Русский',  'Russian',   FALSE, 10),
    ('ko', 'ko',    '한국어',    'Korean',   FALSE, 11);

-- ─── コンテンツ名前空間 ────────────────────────────────────────

-- コンテンツの分類（例: manga, ui, email, legal, notification）
CREATE TABLE namespaces (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT        NOT NULL UNIQUE,  -- 例: 'manga.chapter1', 'ui.common'
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO namespaces (slug, description) VALUES
    ('ui.common',       'UIコンポーネント共通テキスト'),
    ('ui.player',       '動画プレイヤーUI'),
    ('manga.meta',      'マンガのタイトル・あらすじ等'),
    ('math.labels',     '数式オブジェクトのラベル'),
    ('email',           'メール文面'),
    ('legal',           '利用規約・プライバシーポリシー'),
    ('science.physics', '物理学用語'),
    ('science.math',    '数学用語'),
    ('science.biology', '生物学用語'),
    ('science.chemistry','化学用語');

-- ─── 翻訳キー（言語非依存の原文単位） ─────────────────────────

CREATE TABLE translation_keys (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace_id    UUID        NOT NULL REFERENCES namespaces(id) ON DELETE CASCADE,

    -- キー識別子。例: "manga.chapter1.title", "ui.common.loading"
    key             TEXT        NOT NULL,

    -- ソース言語（基準テキスト、通常は日本語）
    source_language CHAR(2)     NOT NULL DEFAULT 'ja' REFERENCES languages(code),
    source_text     TEXT        NOT NULL,

    -- ICU MessageFormat 対応 (複数形・変数置換)
    -- 例: "{count, plural, one {# 話} other {# 話}}"
    is_icu_format   BOOLEAN     NOT NULL DEFAULT FALSE,

    -- コンテキスト（翻訳者向けの説明）
    context_note    TEXT,

    -- 最大文字数制限（UI表示上の制約）
    max_length      INTEGER,

    -- スクリーンショット等の参照URL
    screenshot_url  TEXT,

    version         INTEGER     NOT NULL DEFAULT 1,
    is_archived     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(namespace_id, key)
);

CREATE INDEX idx_translation_keys_namespace ON translation_keys(namespace_id);
CREATE INDEX idx_translation_keys_key_trgm ON translation_keys USING gin(key gin_trgm_ops);

-- ─── 翻訳テキスト（言語ごとの翻訳）────────────────────────────

CREATE TYPE translation_status AS ENUM (
    'pending',      -- 未翻訳
    'in_progress',  -- 翻訳作業中
    'review',       -- レビュー待ち
    'approved',     -- 承認済み（本番に適用可）
    'rejected',     -- 却下（要修正）
    'outdated'      -- ソーステキストが変わり要更新
);

CREATE TABLE translations (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id          UUID                NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
    language_code   CHAR(2)             NOT NULL REFERENCES languages(code),
    translated_text TEXT,
    status          translation_status  NOT NULL DEFAULT 'pending',

    -- 翻訳者・レビュアー
    translated_by   TEXT,  -- ユーザーID or 'machine_translation'
    reviewed_by     TEXT,
    approved_by     TEXT,

    -- 機械翻訳フラグ（DeepL/GPT等）
    is_machine      BOOLEAN NOT NULL DEFAULT FALSE,

    -- 翻訳品質スコア (0.0–1.0, BLEU等)
    quality_score   FLOAT,

    -- バージョン管理（source_text変更時にincrementされる）
    source_version  INTEGER NOT NULL DEFAULT 1,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(key_id, language_code)
);

CREATE INDEX idx_translations_key_id ON translations(key_id);
CREATE INDEX idx_translations_language ON translations(language_code);
CREATE INDEX idx_translations_status ON translations(status);

-- ─── 翻訳履歴（変更差分） ──────────────────────────────────────

CREATE TABLE translation_history (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id  UUID        NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
    old_text        TEXT,
    new_text        TEXT,
    old_status      translation_status,
    new_status      translation_status,
    changed_by      TEXT,
    change_note     TEXT,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_translation_history_translation_id ON translation_history(translation_id);

-- ─── 科学専門用語グロッサリー ──────────────────────────────────

-- 専門用語の「正規定義」（言語非依存）
CREATE TABLE science_terms (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    term_en         TEXT        NOT NULL UNIQUE,  -- 英語正式名
    symbol          TEXT,                          -- 数学記号 (例: "ΔG", "∇")
    formula_katex   TEXT,                          -- KaTeX表現 (例: "\Delta G")
    category        TEXT        NOT NULL,          -- physics/math/biology/chemistry
    subcategory     TEXT,

    -- SI単位（物理量の場合）
    si_unit         TEXT,
    si_unit_katex   TEXT,

    -- 関連するWikipediaのURL (言語ごと)
    wikipedia_urls  JSONB,   -- {"ja": "...", "en": "...", ...}

    -- 数値定数（物理定数等）
    constant_value  FLOAT8,
    constant_precision INTEGER, -- 有効桁数

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 各言語での専門用語翻訳
CREATE TABLE science_term_translations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id         UUID        NOT NULL REFERENCES science_terms(id) ON DELETE CASCADE,
    language_code   CHAR(2)     NOT NULL REFERENCES languages(code),

    -- 翻訳された用語名
    term_name       TEXT        NOT NULL,

    -- その言語での正式な定義（数行の説明文）
    definition      TEXT        NOT NULL,

    -- 数式の表現が言語によって異なる場合（まれ）
    formula_override TEXT,

    -- 発音（日本語ならフリガナ、英語なら発音記号）
    pronunciation   TEXT,

    -- 使用上の注意（訳語の選択理由等）
    usage_note      TEXT,

    -- 認定機関（例: "JIS X 0001", "ISO 80000-2"）
    approved_by_org TEXT,

    status          translation_status NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(term_id, language_code)
);

CREATE INDEX idx_science_term_translations_term ON science_term_translations(term_id);
CREATE INDEX idx_science_term_translations_lang ON science_term_translations(language_code);

-- サンプルデータ: 物理定数
INSERT INTO science_terms (term_en, symbol, formula_katex, category, si_unit, si_unit_katex, constant_value, constant_precision) VALUES
    ('Speed of light',          'c',  'c',                  'physics', 'm/s',   '\text{m/s}',        299792458,           9),
    ('Planck constant',         'h',  'h',                  'physics', 'J·s',   '\text{J·s}',        6.62607015e-34,     34),
    ('Gravitational constant',  'G',  'G',                  'physics', 'N·m²/kg²', '\text{N·m}^2/\text{kg}^2', 6.67430e-11, 5),
    ('Euler number',            'e',  'e',                  'math',    NULL,    NULL,                2.718281828459045,  16),
    ('Pi',                      'π',  '\pi',                'math',    NULL,    NULL,                3.141592653589793,  16),
    ('Boltzmann constant',      'k',  'k_\text{B}',         'physics', 'J/K',   '\text{J/K}',        1.380649e-23,      25),
    ('Avogadro constant',       'Nₐ', 'N_\text{A}',         'physics', 'mol⁻¹', '\text{mol}^{-1}',   6.02214076e23,     30),
    ('Elementary charge',       'e',  'e',                  'physics', 'C',     '\text{C}',          1.602176634e-19,   30);

-- ─── 翻訳進捗ビュー ──────────────────────────────────────────

-- 言語別・名前空間別の翻訳進捗を一目で確認
CREATE VIEW translation_progress AS
SELECT
    l.code                              AS language_code,
    l.name_native                       AS language_name,
    n.slug                              AS namespace,
    COUNT(tk.id)                        AS total_keys,
    COUNT(t.id) FILTER (WHERE t.status = 'approved')    AS approved,
    COUNT(t.id) FILTER (WHERE t.status = 'review')      AS in_review,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS in_progress,
    COUNT(t.id) FILTER (WHERE t.status = 'pending' OR t.id IS NULL) AS pending,
    COUNT(t.id) FILTER (WHERE t.status = 'outdated')    AS outdated,
    ROUND(
        100.0 * COUNT(t.id) FILTER (WHERE t.status = 'approved')
        / NULLIF(COUNT(tk.id), 0),
        1
    )                                   AS approval_rate_pct
FROM languages l
CROSS JOIN namespaces n
JOIN translation_keys tk ON tk.namespace_id = n.id
LEFT JOIN translations t ON t.key_id = tk.id AND t.language_code = l.code
WHERE l.is_active = TRUE AND tk.is_archived = FALSE
GROUP BY l.code, l.name_native, n.slug, n.id
ORDER BY l.sort_order, n.slug;

-- 専門用語の翻訳完成度（言語別）
CREATE VIEW term_translation_coverage AS
SELECT
    l.code              AS language_code,
    l.name_native       AS language_name,
    st.category,
    COUNT(st.id)        AS total_terms,
    COUNT(stt.id) FILTER (WHERE stt.status = 'approved') AS translated,
    ROUND(
        100.0 * COUNT(stt.id) FILTER (WHERE stt.status = 'approved')
        / NULLIF(COUNT(st.id), 0),
        1
    )                   AS coverage_pct
FROM languages l
CROSS JOIN science_terms st
LEFT JOIN science_term_translations stt
    ON stt.term_id = st.id AND stt.language_code = l.code
WHERE l.is_active = TRUE
GROUP BY l.code, l.name_native, st.category
ORDER BY l.sort_order, st.category;

-- ─── 未翻訳キーを言語別に抽出するヘルパー関数 ─────────────────

CREATE OR REPLACE FUNCTION get_untranslated_keys(target_lang CHAR(2))
RETURNS TABLE (
    key_id          UUID,
    namespace_slug  TEXT,
    key_name        TEXT,
    source_text     TEXT,
    context_note    TEXT
) LANGUAGE sql AS $$
    SELECT
        tk.id,
        n.slug,
        tk.key,
        tk.source_text,
        tk.context_note
    FROM translation_keys tk
    JOIN namespaces n ON n.id = tk.namespace_id
    LEFT JOIN translations t ON t.key_id = tk.id AND t.language_code = target_lang
    WHERE tk.is_archived = FALSE
      AND (t.id IS NULL OR t.status IN ('pending', 'outdated'))
    ORDER BY n.slug, tk.key;
$$;

-- ─── トリガー: ソーステキスト変更時に翻訳を 'outdated' に ────────

CREATE OR REPLACE FUNCTION mark_translations_outdated()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.source_text <> NEW.source_text THEN
        UPDATE translations
        SET status = 'outdated', source_version = NEW.version
        WHERE key_id = NEW.id AND status = 'approved';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_translation_key_updated
AFTER UPDATE ON translation_keys
FOR EACH ROW EXECUTE FUNCTION mark_translations_outdated();

-- ─── インデックス追加 ──────────────────────────────────────────
CREATE INDEX idx_translations_outdated
    ON translations(key_id) WHERE status = 'outdated';

CREATE INDEX idx_science_terms_category
    ON science_terms(category);
