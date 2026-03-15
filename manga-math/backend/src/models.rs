use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// ─── MangaPage ────────────────────────────────────────────────────────────────

/// マンガの1ページ。画像と物理サイズを持つ。
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct MangaPage {
    pub id: Uuid,
    pub manga_id: Uuid,
    pub page_number: i32,
    pub image_url: String,
    /// ページの論理幅（px）。座標の正規化基準。
    pub width: i32,
    /// ページの論理高（px）
    pub height: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─── MathObject ───────────────────────────────────────────────────────────────

/// マンガページ上の数式オブジェクト（インタラクティブ）
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct MathObject {
    pub id: Uuid,
    pub page_id: Uuid,

    /// KaTeX フォーマットの数式テンプレート。
    /// 例: "E = mc^{2}" や "\frac{F}{m} = {{value}}" ({{value}}は動的置換)
    pub formula_template: String,

    /// ページ幅を1.0とした相対X座標 (0.0–1.0)
    pub x: f64,
    /// ページ高を1.0とした相対Y座標 (0.0–1.0)
    pub y: f64,

    /// オブジェクトの幅（ページ幅に対する比率）
    pub width: f64,
    /// オブジェクトの高（ページ高に対する比率）
    pub height: f64,

    /// タップ時に呼ぶ自社API のエンドポイントURL
    /// 例: "https://api.elementary.jp/physics/gravity"
    pub api_endpoint: Option<String>,

    /// APIに渡すデフォルトパラメータ（JSON）
    pub api_params: Option<serde_json::Value>,

    /// 最後にAPIから返ってきた数値
    pub current_value: Option<f64>,

    /// 単位表示（例: "m/s²", "N", "J"）
    pub unit: Option<String>,

    /// 表示ラベル（例: "重力加速度"）
    pub label: Option<String>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─── Request/Response DTOs ────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateMathObjectRequest {
    pub page_id: Uuid,
    pub formula_template: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub api_endpoint: Option<String>,
    pub api_params: Option<serde_json::Value>,
    pub unit: Option<String>,
    pub label: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMathObjectRequest {
    pub formula_template: Option<String>,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub api_endpoint: Option<String>,
    pub api_params: Option<serde_json::Value>,
    pub unit: Option<String>,
    pub label: Option<String>,
}

/// タップ時に返すレスポンス
#[derive(Debug, Serialize)]
pub struct TapResponse {
    pub object_id: Uuid,
    /// 数値が埋め込まれた最終的な KaTeX 文字列
    pub resolved_formula: String,
    /// APIから得た生の数値
    pub value: f64,
    pub unit: Option<String>,
    pub label: Option<String>,
    /// 外部APIの生レスポンス（デバッグ用）
    pub raw_api_response: Option<serde_json::Value>,
}

/// 外部APIへのリクエスト形式
#[derive(Debug, Serialize, Deserialize)]
pub struct ExternalApiRequest {
    pub params: serde_json::Value,
}

/// 外部APIのレスポンス形式（自社APIの規約）
#[derive(Debug, Serialize, Deserialize)]
pub struct ExternalApiResponse {
    pub value: f64,
    pub unit: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct ApiError {
    pub code: String,
    pub message: String,
}
