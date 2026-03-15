mod app_state;
mod auth;
mod errors;
mod handlers;
mod models;

use std::{env, sync::Arc};

use app_state::AppState;
use axum::{routing::get, routing::post, Router};
use handlers::auth::{healthcheck, login, register};
use sqlx::sqlite::SqlitePoolOptions;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();

    let database_url =
        env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://doctor_canvas.db".to_owned());
    let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "change-this-jwt-secret".to_owned());
    let port = env::var("PORT")
        .ok()
        .and_then(|port| port.parse::<u16>().ok())
        .unwrap_or(4000);

    let db = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
    )
    .execute(&db)
    .await?;

    let app_state = Arc::new(AppState::new(db, jwt_secret));
    let app = Router::new()
        .route("/health", get(healthcheck))
        .route("/register", post(register))
        .route("/login", post(login))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind(("0.0.0.0", port)).await?;
    println!("Doctor Canvas backend is running on http://0.0.0.0:{port}");
    axum::serve(listener, app).await?;

    Ok(())
}
