use anyhow::Result;
use crate::models::{SlackAttachment, SlackPayload};

pub async fn notify_alert(
    webhook_url: &str,
    alert_name: &str,
    severity: &str,
    description: &str,
    action: &str,
    client: &reqwest::Client,
) -> Result<()> {
    let color = match severity {
        "critical" => "#FF0000",
        "warning"  => "#FFA500",
        _          => "#808080",
    };

    let emoji = match severity {
        "critical" => "🚨",
        "warning"  => "⚠️",
        _          => "ℹ️",
    };

    let payload = SlackPayload {
        text: format!("{} *Elementary Alert*: {}", emoji, alert_name),
        attachments: vec![SlackAttachment {
            color: color.to_string(),
            title: alert_name.to_string(),
            text: format!(
                "*Severity*: {}\n*Action*: `{}`\n*Description*: {}",
                severity, action, description
            ),
            footer: "Elementary Monitoring".to_string(),
            ts: chrono::Utc::now().timestamp(),
        }],
    };

    client.post(webhook_url).json(&payload).send().await?;
    Ok(())
}

pub async fn notify_resolved(
    webhook_url: &str,
    alert_name: &str,
    job: &str,
    client: &reqwest::Client,
) -> Result<()> {
    let payload = serde_json::json!({
        "text": format!("✅ *解決済み*: {} ({})", alert_name, job)
    });
    client.post(webhook_url).json(&payload).send().await?;
    Ok(())
}
