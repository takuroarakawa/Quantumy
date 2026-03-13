use std::sync::Arc;
use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

use crate::{
    error::{AppError, Result},
    models::*,
    AppState,
};

// ─── MathObject CRUD ──────────────────────────────────────────────────────────

/// GET /pages/:page_id/math-objects
/// ページ上の全数式オブジェクト取得
pub async fn list_math_objects(
    State(state): State<Arc<AppState>>,
    Path(page_id): Path<Uuid>,
) -> Result<Json<Vec<MathObject>>> {
    let objects = sqlx::query_as!(
        MathObject,
        r#"
        SELECT id, page_id, formula_template, x, y, width, height,
               api_endpoint, api_params, current_value, unit, label,
               created_at, updated_at
        FROM math_objects
        WHERE page_id = $1
        ORDER BY created_at ASC
        "#,
        page_id
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(objects))
}

/// POST /math-objects
/// 数式オブジェクトを作成
pub async fn create_math_object(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateMathObjectRequest>,
) -> Result<Json<MathObject>> {
    // 座標の検証
    if !(0.0..=1.0).contains(&req.x) || !(0.0..=1.0).contains(&req.y) {
        return Err(AppError::Validation(
            "x, y は 0.0〜1.0 の範囲で指定してください".to_string(),
        ));
    }

    let object = sqlx::query_as!(
        MathObject,
        r#"
        INSERT INTO math_objects
            (page_id, formula_template, x, y, width, height, api_endpoint, api_params, unit, label)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, page_id, formula_template, x, y, width, height,
                  api_endpoint, api_params, current_value, unit, label,
                  created_at, updated_at
        "#,
        req.page_id,
        req.formula_template,
        req.x,
        req.y,
        req.width,
        req.height,
        req.api_endpoint,
        req.api_params,
        req.unit,
        req.label,
    )
    .fetch_one(&state.db)
    .await?;

    tracing::info!("Created math object {} on page {}", object.id, object.page_id);
    Ok(Json(object))
}

/// PATCH /math-objects/:id
/// 数式オブジェクトの位置・数式を更新（ドラッグ操作等に対応）
pub async fn update_math_object(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateMathObjectRequest>,
) -> Result<Json<MathObject>> {
    if let (Some(x), Some(y)) = (req.x, req.y) {
        if !(0.0..=1.0).contains(&x) || !(0.0..=1.0).contains(&y) {
            return Err(AppError::Validation("x, y は 0.0〜1.0 の範囲".to_string()));
        }
    }

    let object = sqlx::query_as!(
        MathObject,
        r#"
        UPDATE math_objects SET
            formula_template = COALESCE($2, formula_template),
            x                = COALESCE($3, x),
            y                = COALESCE($4, y),
            api_endpoint     = COALESCE($5, api_endpoint),
            api_params       = COALESCE($6, api_params),
            unit             = COALESCE($7, unit),
            label            = COALESCE($8, label),
            updated_at       = NOW()
        WHERE id = $1
        RETURNING id, page_id, formula_template, x, y, width, height,
                  api_endpoint, api_params, current_value, unit, label,
                  created_at, updated_at
        "#,
        id,
        req.formula_template,
        req.x,
        req.y,
        req.api_endpoint,
        req.api_params,
        req.unit,
        req.label,
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("MathObject {} not found", id)))?;

    Ok(Json(object))
}

/// DELETE /math-objects/:id
pub async fn delete_math_object(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>> {
    let result = sqlx::query!("DELETE FROM math_objects WHERE id = $1", id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("MathObject {} not found", id)));
    }

    Ok(Json(serde_json::json!({ "deleted": id })))
}

// ─── TAP ──────────────────────────────────────────────────────────────────────

/// POST /math-objects/:id/tap
///
/// Flutterからタップイベントを受け取り、
/// 1. 自社APIを呼び出して最新の数値を取得
/// 2. formula_template の {{value}} を実数値で置換
/// 3. KaTeX文字列として返す
/// 4. タップイベントをDBに記録
pub async fn tap_math_object(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(extra_params): Json<Option<serde_json::Value>>,
) -> Result<Json<TapResponse>> {
    // オブジェクト取得
    let object = sqlx::query_as!(
        MathObject,
        r#"
        SELECT id, page_id, formula_template, x, y, width, height,
               api_endpoint, api_params, current_value, unit, label,
               created_at, updated_at
        FROM math_objects WHERE id = $1
        "#,
        id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("MathObject {} not found", id)))?;

    // 外部APIコール（エンドポイントが設定されている場合）
    let (value, raw_response) = if let Some(ref endpoint) = object.api_endpoint {
        let mut params = object.api_params.clone().unwrap_or(serde_json::json!({}));

        // フロントエンドからの追加パラメータをマージ
        if let Some(extra) = extra_params {
            if let (Some(p), Some(e)) = (params.as_object_mut(), extra.as_object()) {
                p.extend(e.iter().map(|(k, v)| (k.clone(), v.clone())));
            }
        }

        let response = state
            .http
            .post(endpoint)
            .json(&ExternalApiRequest { params })
            .send()
            .await
            .map_err(|e| AppError::ExternalApi(e.to_string()))?;

        if !response.status().is_success() {
            return Err(AppError::ExternalApi(format!(
                "External API returned {}",
                response.status()
            )));
        }

        let api_resp: ExternalApiResponse = response
            .json()
            .await
            .map_err(|e| AppError::ExternalApi(e.to_string()))?;

        let raw = serde_json::to_value(&api_resp).ok();
        (api_resp.value, raw)
    } else {
        // APIなし — current_value をフォールバック
        (object.current_value.unwrap_or(0.0), None)
    };

    // formula_template の {{value}} を実数値で置換
    let resolved = resolve_formula(&object.formula_template, value);

    // DBに最新値を保存
    sqlx::query!(
        "UPDATE math_objects SET current_value = $1, updated_at = NOW() WHERE id = $2",
        value,
        id
    )
    .execute(&state.db)
    .await?;

    // タップイベントをログ
    sqlx::query!(
        "INSERT INTO tap_events (object_id, value) VALUES ($1, $2)",
        id,
        value
    )
    .execute(&state.db)
    .await?;

    let unit = object.unit.clone();
    let label = object.label.clone();

    Ok(Json(TapResponse {
        object_id: id,
        resolved_formula: resolved,
        value,
        unit,
        label,
        raw_api_response: raw_response,
    }))
}

/// GET /math-objects/:id/history
/// タップ履歴（数値の時系列変化）を取得
pub async fn get_tap_history(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<serde_json::Value>>> {
    let events = sqlx::query!(
        r#"
        SELECT id, value, tapped_at
        FROM tap_events
        WHERE object_id = $1
        ORDER BY tapped_at DESC
        LIMIT 100
        "#,
        id
    )
    .fetch_all(&state.db)
    .await?;

    let result: Vec<serde_json::Value> = events
        .iter()
        .map(|e| serde_json::json!({
            "id": e.id,
            "value": e.value,
            "tapped_at": e.tapped_at
        }))
        .collect();

    Ok(Json(result))
}

// ─── Health ───────────────────────────────────────────────────────────────────

pub async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "manga-math-api",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/// formula_template内の `{{value}}` を実数値に置換し、KaTeX文字列を返す。
///
/// 例:
///   template: `g = {{value}} \, \text{m/s}^2`
///   value:    9.81
///   result:   `g = 9.81 \, \text{m/s}^2`
fn resolve_formula(template: &str, value: f64) -> String {
    // 有効数字4桁で丸める
    let formatted = format!("{:.4}", value)
        .trim_end_matches('0')
        .trim_end_matches('.')
        .to_string();

    template.replace("{{value}}", &formatted)
}
