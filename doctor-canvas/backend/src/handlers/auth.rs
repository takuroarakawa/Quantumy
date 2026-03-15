use std::sync::Arc;

use axum::{extract::State, http::StatusCode, Json};
use serde_json::json;
use sqlx::SqlitePool;

use crate::{
    app_state::AppState,
    auth::{jwt, password},
    errors::AppError,
    models::{
        auth::{AuthResponse, LoginRequest, RegisterRequest},
        user::User,
    },
};

const JWT_EXPIRES_IN_SECONDS: i64 = 60 * 60 * 24;

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    validate_register_payload(&payload)?;

    let existing_user =
        find_user_by_username_or_email(&state.db, &payload.username, &payload.email).await?;
    if existing_user.is_some() {
        return Err(AppError::conflict("username or email already exists"));
    }

    let password_hash = password::hash_password(&payload.password)?;
    let result =
        sqlx::query("INSERT INTO users (username, email, password_hash) VALUES (?1, ?2, ?3)")
            .bind(&payload.username)
            .bind(&payload.email)
            .bind(password_hash)
            .execute(&state.db)
            .await?;

    let user_id = result.last_insert_rowid();
    let token = jwt::create_token(
        user_id,
        &payload.username,
        &state.jwt_secret,
        JWT_EXPIRES_IN_SECONDS,
    )?;

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            token,
            token_type: "Bearer".to_owned(),
        }),
    ))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    if payload.username.trim().is_empty() || payload.password.is_empty() {
        return Err(AppError::bad_request(
            "username and password are required for login",
        ));
    }

    let user = find_user_by_username(&state.db, &payload.username)
        .await?
        .ok_or_else(|| AppError::unauthorized("invalid credentials"))?;

    let is_valid = password::verify_password(&payload.password, &user.password_hash)?;
    if !is_valid {
        return Err(AppError::unauthorized("invalid credentials"));
    }

    let token = jwt::create_token(
        user.id,
        &user.username,
        &state.jwt_secret,
        JWT_EXPIRES_IN_SECONDS,
    )?;

    Ok(Json(AuthResponse {
        token,
        token_type: "Bearer".to_owned(),
    }))
}

pub async fn healthcheck() -> Json<serde_json::Value> {
    Json(json!({ "status": "ok" }))
}

fn validate_register_payload(payload: &RegisterRequest) -> Result<(), AppError> {
    if payload.username.trim().is_empty() {
        return Err(AppError::bad_request("username is required"));
    }
    if payload.email.trim().is_empty() {
        return Err(AppError::bad_request("email is required"));
    }
    if payload.password.len() < 8 {
        return Err(AppError::bad_request(
            "password must be at least 8 characters",
        ));
    }
    Ok(())
}

async fn find_user_by_username_or_email(
    db: &SqlitePool,
    username: &str,
    email: &str,
) -> Result<Option<User>, AppError> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, username, email, password_hash, created_at
         FROM users
         WHERE username = ?1 OR email = ?2
         LIMIT 1",
    )
    .bind(username)
    .bind(email)
    .fetch_optional(db)
    .await?;

    Ok(user)
}

async fn find_user_by_username(db: &SqlitePool, username: &str) -> Result<Option<User>, AppError> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, username, email, password_hash, created_at
         FROM users
         WHERE username = ?1
         LIMIT 1",
    )
    .bind(username)
    .fetch_optional(db)
    .await?;

    Ok(user)
}
