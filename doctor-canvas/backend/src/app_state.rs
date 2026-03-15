use sqlx::SqlitePool;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub jwt_secret: String,
}

impl AppState {
    pub fn new(db: SqlitePool, jwt_secret: String) -> Self {
        Self { db, jwt_secret }
    }
}
