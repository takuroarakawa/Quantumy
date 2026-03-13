use sqlx::PgPool;
use anyhow::Result;

pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(20)
        .connect(database_url)
        .await?;
    Ok(pool)
}

/// マイグレーションを1ステートメントずつ実行（PostgreSQL制約対応）
pub async fn run_migrations(pool: &PgPool) -> Result<()> {
    let statements = vec![
        // 拡張機能
        r#"CREATE EXTENSION IF NOT EXISTS "pgcrypto""#,

        // mangas
        r#"CREATE TABLE IF NOT EXISTS mangas (
            id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
            title       TEXT        NOT NULL,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )"#,

        // manga_pages
        r#"CREATE TABLE IF NOT EXISTS manga_pages (
            id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
            manga_id    UUID        NOT NULL REFERENCES mangas(id) ON DELETE CASCADE,
            page_number INTEGER     NOT NULL,
            image_url   TEXT        NOT NULL,
            width       INTEGER     NOT NULL DEFAULT 800,
            height      INTEGER     NOT NULL DEFAULT 1200,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(manga_id, page_number)
        )"#,

        // math_objects
        r#"CREATE TABLE IF NOT EXISTS math_objects (
            id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
            page_id           UUID    NOT NULL REFERENCES manga_pages(id) ON DELETE CASCADE,
            formula_template  TEXT    NOT NULL,
            x                 FLOAT8  NOT NULL CHECK (x BETWEEN 0.0 AND 1.0),
            y                 FLOAT8  NOT NULL CHECK (y BETWEEN 0.0 AND 1.0),
            width             FLOAT8  NOT NULL DEFAULT 0.2,
            height            FLOAT8  NOT NULL DEFAULT 0.05,
            api_endpoint      TEXT,
            api_params        JSONB,
            current_value     FLOAT8,
            unit              TEXT,
            label             TEXT,
            created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )"#,

        // tap_events
        r#"CREATE TABLE IF NOT EXISTS tap_events (
            id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
            object_id   UUID        NOT NULL REFERENCES math_objects(id) ON DELETE CASCADE,
            user_id     TEXT,
            value       FLOAT8,
            api_params  JSONB,
            tapped_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )"#,

        // indexes
        r#"CREATE INDEX IF NOT EXISTS idx_math_objects_page_id ON math_objects(page_id)"#,
        r#"CREATE INDEX IF NOT EXISTS idx_tap_events_object_id ON tap_events(object_id)"#,
        r#"CREATE INDEX IF NOT EXISTS idx_tap_events_tapped_at  ON tap_events(tapped_at DESC)"#,
    ];

    for sql in &statements {
        sqlx::query(sql).execute(pool).await?;
    }

    tracing::info!("✅ Database migrations completed ({} statements)", statements.len());
    Ok(())
}
