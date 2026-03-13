use std::sync::Arc;
use axum::{routing::{delete, get, patch, post}, Router};
use crate::{handlers, AppState};

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        // ヘルスチェック
        .route("/health", get(handlers::health))

        // 数式オブジェクト
        .route("/pages/:page_id/math-objects", get(handlers::list_math_objects))
        .route("/math-objects", post(handlers::create_math_object))
        .route("/math-objects/:id", patch(handlers::update_math_object))
        .route("/math-objects/:id", delete(handlers::delete_math_object))

        // インタラクション
        .route("/math-objects/:id/tap", post(handlers::tap_math_object))
        .route("/math-objects/:id/history", get(handlers::get_tap_history))

        .with_state(state)
}
