mod actions;
mod models;
mod slack;

use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    routing::post,
    Json, Router,
};
use std::sync::Arc;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use models::{AlertmanagerPayload, AlertStatus};

pub struct AppConfig {
    pub elementary_api_url: String,
    pub slack_webhook_url:   Option<String>,
    pub restart_script:      String,
    pub http:                reqwest::Client,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "elementary_alert_handler=debug,tower_http=info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Arc::new(AppConfig {
        elementary_api_url: std::env::var("ELEMENTARY_API_URL")
            .unwrap_or_else(|_| "http://localhost:3000".into()),
        slack_webhook_url: std::env::var("SLACK_WEBHOOK_URL").ok(),
        restart_script:    std::env::var("INSTANCE_RESTART_SCRIPT")
            .unwrap_or_else(|_| "/scripts/restart_instance.sh".into()),
        http: reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()?,
    });

    let app = Router::new()
        .route("/webhook", post(handle_alert))
        .route("/health", axum::routing::get(health))
        .with_state(config);

    let addr = std::env::var("LISTEN_ADDR").unwrap_or_else(|_| "0.0.0.0:8090".into());
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("Elementary Alert Handler — {}", addr);
    axum::serve(listener, app).await?;

    Ok(())
}

/// POST /webhook — Alertmanager からのアラートを受け取る
async fn handle_alert(
    State(config): State<Arc<AppConfig>>,
    _headers: HeaderMap,
    Json(payload): Json<AlertmanagerPayload>,
) -> StatusCode {
    tracing::info!(
        "Received {} alerts (status={})",
        payload.alerts.len(),
        payload.status
    );

    for alert in &payload.alerts {
        let alert_name = alert.labels.get("alertname").cloned().unwrap_or_default();
        let action     = alert.labels.get("action").cloned().unwrap_or_default();
        let severity   = alert.labels.get("severity").cloned().unwrap_or_default();
        let job        = alert.labels.get("job").cloned().unwrap_or_default();

        tracing::warn!(
            alert_name = %alert_name,
            action     = %action,
            severity   = %severity,
            job        = %job,
            status     = ?alert.status,
            "Processing alert"
        );

        // 解決済みの場合はアクション不要
        if alert.status == AlertStatus::Resolved {
            tracing::info!("Alert resolved: {}", alert_name);
            if let Some(ref url) = config.slack_webhook_url {
                let _ = slack::notify_resolved(url, &alert_name, &job, &config.http).await;
            }
            continue;
        }

        // ─── アクションの振り分け ────────────────────────────
        let result = match action.as_str() {
            "restart_instance" => {
                tracing::warn!("ACTION: インスタンス再起動 [{}]", job);
                actions::restart_instance(&config).await
            }
            "failover" | "restart_and_failover" => {
                tracing::error!("ACTION: フェイルオーバー実行 [{}]", job);
                actions::failover(&config, &job).await
            }
            "failover_db" => {
                tracing::error!("ACTION: DBフェイルオーバー");
                actions::failover_database(&config).await
            }
            "notify" | "notify_security" | "notify_management" => {
                tracing::info!("ACTION: Slack通知のみ [{}]", alert_name);
                Ok(())
            }
            _ => {
                tracing::warn!("未知のアクション: {}", action);
                Ok(())
            }
        };

        // Slack通知（全アクション後）
        if let Some(ref url) = config.slack_webhook_url {
            let _ = slack::notify_alert(
                url,
                &alert_name,
                &severity,
                alert.annotations.get("description").cloned().unwrap_or_default().as_str(),
                &action,
                &config.http,
            )
            .await;
        }

        if let Err(e) = result {
            tracing::error!("アクション実行エラー: {}", e);
        }
    }

    StatusCode::OK
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "elementary-alert-handler",
        "version": env!("CARGO_PKG_VERSION")
    }))
}
