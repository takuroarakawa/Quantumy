use anyhow::{bail, Result};
use std::sync::Arc;
use tokio::process::Command;
use crate::AppConfig;

/// インスタンスの自動再起動
///
/// 戦略:
///   1. ヘルスチェックエンドポイントを叩いて本当にダウンか確認
///   2. シェルスクリプト経由でプロセス/コンテナを再起動
///   3. 30秒後に再度ヘルスチェック → 失敗時はフェイルオーバー
pub async fn restart_instance(config: &Arc<AppConfig>) -> Result<()> {
    tracing::warn!("🔄 インスタンス再起動を開始...");

    // 1. ヘルスチェック確認（誤アラート防止）
    let is_actually_down = !check_health(config).await;
    if !is_actually_down {
        tracing::info!("ヘルスチェック成功 — 再起動をスキップ（誤検知）");
        return Ok(());
    }

    // 2. 再起動スクリプト実行
    let output = Command::new("bash")
        .arg(&config.restart_script)
        .arg("--service=elementary-app")
        .output()
        .await?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!("再起動スクリプト失敗: {}", stderr);
    }

    tracing::info!("再起動スクリプト完了: {}", String::from_utf8_lossy(&output.stdout));

    // 3. 30秒後に確認
    tokio::time::sleep(std::time::Duration::from_secs(30)).await;

    if check_health(config).await {
        tracing::info!("✅ 再起動後のヘルスチェック成功");
        Ok(())
    } else {
        tracing::error!("❌ 再起動後もダウン — フェイルオーバーに移行");
        failover(config, "elementary-app").await
    }
}

/// バックアップインスタンスへのフェイルオーバー
///
/// 戦略:
///   1. ロードバランサーのターゲットを切り替え
///   2. バックアップインスタンスの起動確認
///   3. DNS/IPの更新（実装はインフラ依存）
pub async fn failover(config: &Arc<AppConfig>, job: &str) -> Result<()> {
    tracing::error!("🚨 フェイルオーバー開始: job={}", job);

    // バックアップへの切り替えAPIを叩く（例: AWS ELB ターゲットグループ変更）
    let response = config
        .http
        .post(format!("{}/api/admin/failover", config.elementary_api_url))
        .json(&serde_json::json!({
            "action": "switch_to_backup",
            "service": job,
            "timestamp": chrono::Utc::now().to_rfc3339(),
        }))
        .send()
        .await;

    match response {
        Ok(resp) if resp.status().is_success() => {
            tracing::info!("✅ フェイルオーバーAPI成功");
        }
        Ok(resp) => {
            tracing::error!("フェイルオーバーAPI失敗: HTTP {}", resp.status());
        }
        Err(e) => {
            tracing::error!("フェイルオーバーAPIへの接続失敗: {}", e);
            // Docker コンテナ経由でフォールバック
            let _ = Command::new("docker")
                .args(["service", "update", "--replicas=0", &format!("elementary_{}", job)])
                .output()
                .await;
        }
    }

    // Dockerコンテナのフェイルオーバー
    let output = Command::new("bash")
        .arg(&config.restart_script)
        .args(["--service=elementary-app", "--mode=failover"])
        .output()
        .await?;

    if output.status.success() {
        tracing::info!("フェイルオーバー完了");
        Ok(())
    } else {
        bail!(
            "フェイルオーバー失敗: {}",
            String::from_utf8_lossy(&output.stderr)
        )
    }
}

/// PostgreSQL のフェイルオーバー（リードレプリカを昇格）
pub async fn failover_database(config: &Arc<AppConfig>) -> Result<()> {
    tracing::error!("🗄️ DBフェイルオーバー開始...");

    let output = Command::new("bash")
        .arg(&config.restart_script)
        .args(["--service=postgresql", "--mode=promote-replica"])
        .output()
        .await?;

    if output.status.success() {
        tracing::info!("DBフェイルオーバー完了");
        Ok(())
    } else {
        bail!(
            "DBフェイルオーバー失敗: {}",
            String::from_utf8_lossy(&output.stderr)
        )
    }
}

/// ヘルスチェックエンドポイントを確認
async fn check_health(config: &Arc<AppConfig>) -> bool {
    let result = config
        .http
        .get(format!("{}/health", config.elementary_api_url))
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await;

    match result {
        Ok(resp) => resp.status().is_success(),
        Err(_) => false,
    }
}
