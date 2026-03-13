mod db;
mod error;
mod handlers;
mod models;
mod routes;

use axum::Router;
use axum_prometheus::PrometheusMetricLayer;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub struct AppState {
    pub db: sqlx::PgPool,
    pub http: reqwest::Client,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "manga_math_api=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = db::create_pool(&database_url).await?;
    db::run_migrations(&pool).await?;

    let state = Arc::new(AppState {
        db: pool,
        http: reqwest::Client::new(),
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // ─── Prometheus メトリクス設定 ──────────────────────────────
    // PrometheusMetricLayer が自動的に以下を収集:
    //   axum_http_requests_total{method, endpoint, status}
    //   axum_http_requests_duration_seconds{method, endpoint, status}
    //   axum_http_requests_pending{method, endpoint}
    let (prometheus_layer, metric_handle) = PrometheusMetricLayer::pair();

    let app = routes::create_router(state, axum_prometheus::Handle(metric_handle))
        .layer(prometheus_layer)   // 全ルートに自動計測
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr = std::env::var("LISTEN_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".into());
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tracing::info!("Elementary Manga-Math API — listening on {}", addr);
    tracing::info!("Prometheus metrics: http://{}/metrics", addr);
    axum::serve(listener, app).await?;

    Ok(())
}
