use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Alertmanager が送ってくる Webhook ペイロード
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AlertmanagerPayload {
    pub version:           String,
    pub group_key:         String,
    pub truncated_alerts:  Option<u32>,
    pub status:            String,
    pub receiver:          String,
    pub group_labels:      HashMap<String, String>,
    pub common_labels:     HashMap<String, String>,
    pub common_annotations: HashMap<String, String>,
    pub external_url:      String,
    pub alerts:            Vec<Alert>,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AlertStatus {
    Firing,
    Resolved,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Alert {
    pub status:       AlertStatus,
    pub labels:       HashMap<String, String>,
    pub annotations:  HashMap<String, String>,
    pub starts_at:    DateTime<Utc>,
    pub ends_at:      DateTime<Utc>,
    pub generator_url: String,
    pub fingerprint:  String,
}

/// Slack通知ペイロード
#[derive(Debug, Serialize)]
pub struct SlackPayload {
    pub text:        String,
    pub attachments: Vec<SlackAttachment>,
}

#[derive(Debug, Serialize)]
pub struct SlackAttachment {
    pub color:  String,
    pub title:  String,
    pub text:   String,
    pub footer: String,
    pub ts:     i64,
}
