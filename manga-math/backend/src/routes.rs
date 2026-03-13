use std::sync::Arc;
use axum::{Router, routing::{delete, get, patch, post}};
use axum_prometheus::Handle;
use metrics_exporter_prometheus::PrometheusHandle;
use crate::{handlers, AppState};

pub fn create_router(state: Arc<AppState>, metric_handle: Handle) -> Router {
    // PrometheusHandle の render() でメトリクス文字列を生成
    let prometheus_handle: PrometheusHandle = metric_handle.0;

    Router::new()
        // ─── ヘルスチェック ───────────────────────────────────
        .route("/health", get(handlers::health))

        // ─── Prometheus メトリクス (/metrics) ────────────────
        // axum-prometheus が自動収集した全メトリクスをここで公開する
        .route(
            "/metrics",
            get(move || {
                let handle = prometheus_handle.clone();
                async move { handle.render() }
            }),
        )

        // ─── 数式オブジェクト CRUD ────────────────────────────
        .route("/pages/:page_id/math-objects", get(handlers::list_math_objects))
        .route("/math-objects", post(handlers::create_math_object))
        .route("/math-objects/:id", patch(handlers::update_math_object))
        .route("/math-objects/:id", delete(handlers::delete_math_object))

        // ─── インタラクション ─────────────────────────────────
        .route("/math-objects/:id/tap", post(handlers::tap_math_object))
        .route("/math-objects/:id/history", get(handlers::get_tap_history))

        .with_state(state)
}
